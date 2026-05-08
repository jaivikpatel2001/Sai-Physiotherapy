import { Response } from 'express';
import { z } from 'zod';
import { TreatmentSession } from '../models/TreatmentSession.model';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';

export const createSessionSchema = z.object({
  patient: z.string().min(1),
  appointment: z.string().optional(),
  chiefComplaint: z.string().min(5),
  soapNotes: z.object({
    subjective: z.string().min(1),
    objective: z.string().min(1),
    assessment: z.string().min(1),
    plan: z.string().min(1),
  }),
  vitalSigns: z.object({
    bp: z.string().optional(),
    pulse: z.number().optional(),
    temperature: z.number().optional(),
    spo2: z.number().optional(),
    painScale: z.number().min(0).max(10),
  }).optional(),
  treatmentsGiven: z.array(z.string()).optional(),
  exercisesPrescribed: z.array(z.string()).optional(),
  recoveryPercentage: z.number().min(0).max(100).default(0),
  nextSessionDate: z.string().datetime().optional(),
});

export const getPatientSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sessions = await TreatmentSession.find({ patient: req.params.patientId })
    .populate('doctor', 'name specialization')
    .sort({ date: -1 })
    .lean();
  sendSuccess({ res, data: sessions });
});

export const createSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.body as z.infer<typeof createSessionSchema>;

  const sessionCount = await TreatmentSession.countDocuments({ patient: body.patient });

  const session = await TreatmentSession.create({
    ...body,
    doctor: req.user!._id,
    date: new Date(),
    sessionNumber: sessionCount + 1,
    nextSessionDate: body.nextSessionDate ? new Date(body.nextSessionDate) : undefined,
  });

  sendSuccess({ res, statusCode: 201, message: `Session #${sessionCount + 1} recorded`, data: session });
});

export const getSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await TreatmentSession.findById(req.params.id)
    .populate('doctor', 'name specialization')
    .populate('patient', 'patientId personalInfo.name')
    .lean();
  if (!session) throw new AppError('Session not found', 404);
  sendSuccess({ res, data: session });
});

export const updateSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await TreatmentSession.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!session) throw new AppError('Session not found', 404);
  sendSuccess({ res, message: 'Session updated', data: session });
});

export const getRecoveryProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sessions = await TreatmentSession.find({ patient: req.params.patientId })
    .select('sessionNumber date recoveryPercentage vitalSigns.painScale')
    .sort({ date: 1 })
    .lean();

  const chartData = sessions.map((s) => ({
    session: s.sessionNumber,
    date: s.date,
    recovery: s.recoveryPercentage,
    pain: s.vitalSigns?.painScale ?? null,
  }));

  sendSuccess({ res, data: chartData });
});
