import { Response } from 'express';
import { z } from 'zod';
import { Patient } from '../models/Patient.model';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, buildPagination, getPaginationParams } from '../utils/response';
import { generatePatientId } from '../utils/id-generator';
import { UserRole } from '@sai-physio/types';

// ─── Zod Validation Schemas ───────────────────────────────────────────────────
export const createPatientSchema = z.object({
  personalInfo: z.object({
    name: z.string().min(2),
    dob: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    gender: z.enum(['male', 'female', 'other']),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
    email: z.string().email().optional(),
    address: z.string().min(5),
    city: z.string().default('Ahmedabad'),
    bloodGroup: z.string().optional(),
    emergencyContact: z.object({
      name: z.string().min(2),
      phone: z.string().regex(/^[6-9]\d{9}$/),
      relation: z.string().min(2),
    }),
  }),
  medicalHistory: z.object({
    chiefComplaint: z.string().min(5),
    pastHistory: z.string().optional(),
    surgicalHistory: z.string().optional(),
    medications: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    comorbidities: z.array(z.string()).optional(),
  }),
  assignedDoctor: z.string().min(1, 'Doctor assignment is required'),
  tags: z.array(z.string()).optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @route  GET /api/v1/patients
 * @access Admin, Doctor, Receptionist
 */
export const getAllPatients = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { search, status, doctor } = req.query as {
    search?: string;
    status?: string;
    doctor?: string;
  };

  // Build filter
  type FilterType = {
    status?: string;
    assignedDoctor?: string;
    $text?: { $search: string };
    'personalInfo.phone'?: { $regex: string };
  };
  const filter: FilterType = {};
  if (status) filter.status = status;
  if (doctor) filter.assignedDoctor = doctor;
  if (search) {
    if (/^\d+$/.test(search)) {
      filter['personalInfo.phone'] = { $regex: search };
    } else {
      filter.$text = { $search: search };
    }
  }

  const [patients, total] = await Promise.all([
    Patient.find(filter)
      .populate('assignedDoctor', 'name specialization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Patient.countDocuments(filter),
  ]);

  sendSuccess({
    res,
    data: patients,
    pagination: buildPagination(page, limit, total),
  });
});

/**
 * @route  POST /api/v1/patients
 * @access Admin, Receptionist
 */
export const createPatient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.body as CreatePatientInput;

  const patientId = await generatePatientId();

  const patient = await Patient.create({
    ...body,
    patientId,
    createdBy: req.user!._id,
    personalInfo: {
      ...body.personalInfo,
      dob: new Date(body.personalInfo.dob),
    },
  });

  const populated = await Patient.findById(patient._id)
    .populate('assignedDoctor', 'name specialization')
    .lean();

  sendSuccess({ res, statusCode: 201, message: `Patient ${patientId} created successfully`, data: populated });
});

/**
 * @route  GET /api/v1/patients/:id
 * @access Admin, Doctor, Receptionist
 */
export const getPatient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const patient = await Patient.findById(req.params.id)
    .populate('assignedDoctor', 'name specialization avatar')
    .populate('createdBy', 'name role')
    .lean();

  if (!patient) throw new AppError('Patient not found', 404);

  // Doctors can only see their own patients
  if (
    req.user?.role === UserRole.DOCTOR &&
    patient.assignedDoctor?.toString() !== req.user._id
  ) {
    throw new AppError('Access denied. Not your patient.', 403);
  }

  sendSuccess({ res, data: patient });
});

/**
 * @route  PUT /api/v1/patients/:id
 * @access Admin, Doctor, Receptionist
 */
export const updatePatient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  ).populate('assignedDoctor', 'name specialization');

  if (!patient) throw new AppError('Patient not found', 404);

  sendSuccess({ res, message: 'Patient updated successfully', data: patient });
});

/**
 * @route  DELETE /api/v1/patients/:id
 * @access Admin only (soft delete)
 */
export const deletePatient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    { status: 'discharged' },
    { new: true }
  );

  if (!patient) throw new AppError('Patient not found', 404);

  sendSuccess({ res, message: 'Patient discharged (soft deleted)' });
});

/**
 * @route  GET /api/v1/patients/:id/sessions
 * @access Admin, Doctor, Receptionist
 */
export const getPatientSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { TreatmentSession } = await import('../models/TreatmentSession.model');
  const sessions = await TreatmentSession.find({ patient: req.params.id })
    .populate('doctor', 'name')
    .sort({ date: -1 })
    .lean();
  sendSuccess({ res, data: sessions });
});

/**
 * @route  GET /api/v1/patients/:id/bills
 * @access Admin, Receptionist
 */
export const getPatientBills = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { Billing } = await import('../models/Billing.model');
  const bills = await Billing.find({ patient: req.params.id })
    .populate('receivedBy', 'name')
    .sort({ createdAt: -1 })
    .lean();
  sendSuccess({ res, data: bills });
});

/**
 * @route  GET /api/v1/patients/search
 * @access Admin, Doctor, Receptionist
 */
export const searchPatients = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { q } = req.query as { q: string };
  if (!q || q.length < 2) throw new AppError('Search query must be at least 2 characters', 400);

  const patients = await Patient.find({
    $or: [
      { patientId: { $regex: q, $options: 'i' } },
      { 'personalInfo.name': { $regex: q, $options: 'i' } },
      { 'personalInfo.phone': { $regex: q } },
    ],
  })
    .select('patientId personalInfo.name personalInfo.phone personalInfo.gender status assignedDoctor')
    .populate('assignedDoctor', 'name')
    .limit(10)
    .lean();

  sendSuccess({ res, data: patients });
});
