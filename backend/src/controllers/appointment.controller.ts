import { Request, Response } from 'express';
import { z } from 'zod';
import { Appointment } from '../models/Appointment.model';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, buildPagination, getPaginationParams } from '../utils/response';
import { generateAppointmentId } from '../utils/id-generator';
import { getDayRange } from '@sai-physio/utils';

export const createAppointmentSchema = z.object({
  patient: z.string().min(1),
  doctor: z.string().min(1),
  service: z.string().min(1),
  scheduledAt: z.string().datetime(),
  duration: z.number().min(15).max(120).default(30),
  type: z.enum(['new', 'followup', 'emergency']).default('new'),
  notes: z.string().optional(),
  reminders: z.object({
    sms: z.boolean().default(true),
    email: z.boolean().default(false),
    whatsapp: z.boolean().default(false),
  }).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
  cancelReason: z.string().optional(),
});

export const getAllAppointments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { status, doctor, patient, date, type } = req.query as Record<string, string>;

  type FilterType = Record<string, unknown>;
  const filter: FilterType = {};
  if (status) filter.status = status;
  if (doctor) filter.doctor = doctor;
  if (patient) filter.patient = patient;
  if (type) filter.type = type;
  if (date) {
    const { start, end } = getDayRange(new Date(date));
    filter.scheduledAt = { $gte: start, $lte: end };
  }

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate('patient', 'patientId personalInfo.name personalInfo.phone')
      .populate('doctor', 'name specialization')
      .populate('service', 'name')
      .sort({ scheduledAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Appointment.countDocuments(filter),
  ]);

  sendSuccess({ res, data: appointments, pagination: buildPagination(page, limit, total) });
});

export const createAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.body as z.infer<typeof createAppointmentSchema>;
  const scheduledAt = new Date(body.scheduledAt);

  const appointmentId = await generateAppointmentId();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tokenCount = await Appointment.countDocuments({
    doctor: body.doctor,
    scheduledAt: { $gte: todayStart },
    status: { $nin: ['cancelled', 'no_show'] },
  });

  const appointment = await Appointment.create({
    ...body,
    appointmentId,
    scheduledAt,
    tokenNumber: tokenCount + 1,
    bookedBy: req.user!._id,
    reminders: body.reminders ?? { sms: true, email: false, whatsapp: false },
  });

  const populated = await Appointment.findById(appointment._id)
    .populate('patient', 'patientId personalInfo.name personalInfo.phone')
    .populate('doctor', 'name specialization')
    .populate('service', 'name')
    .lean();

  sendSuccess({ res, statusCode: 201, message: `Appointment ${appointmentId} booked`, data: populated });
});

export const getAppointment = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'patientId personalInfo')
    .populate('doctor', 'name specialization avatar')
    .populate('service', 'name category')
    .lean();

  if (!appointment) throw new AppError('Appointment not found', 404);
  sendSuccess({ res, data: appointment });
});

export const updateAppointmentStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status, cancelReason } = req.body as z.infer<typeof updateStatusSchema>;

  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status, ...(cancelReason && { cancelReason }) },
    { new: true, runValidators: true }
  );

  if (!appointment) throw new AppError('Appointment not found', 404);
  sendSuccess({ res, message: `Appointment ${status}`, data: appointment });
});

export const updateAppointment = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!appointment) throw new AppError('Appointment not found', 404);
  sendSuccess({ res, message: 'Appointment updated', data: appointment });
});

export const getAvailableSlots = asyncHandler(async (req: Request, res: Response) => {
  const { doctorId, date } = req.query as { doctorId: string; date: string };
  if (!doctorId || !date) throw new AppError('doctorId and date are required', 400);

  const { start, end } = getDayRange(new Date(date));
  const booked = await Appointment.find({
    doctor: doctorId,
    scheduledAt: { $gte: start, $lte: end },
    status: { $nin: ['cancelled', 'no_show'] },
  }).select('scheduledAt duration');

  const slots = [];
  const slotStart = new Date(start);
  slotStart.setHours(9, 0, 0, 0);

  for (let i = 0; i < 18; i++) {
    const slotEnd = new Date(slotStart.getTime() + 30 * 60000);
    const isBooked = booked.some((appt) => {
      const apptEnd = new Date(appt.scheduledAt.getTime() + appt.duration * 60000);
      return appt.scheduledAt < slotEnd && apptEnd > slotStart;
    });
    slots.push({ time: slotStart.toISOString(), available: !isBooked });
    slotStart.setMinutes(slotStart.getMinutes() + 30);
    if (slotStart.getHours() >= 18) break;
  }

  sendSuccess({ res, data: slots });
});

export const getTodayAppointments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { start, end } = getDayRange(new Date());
  const filter: Record<string, unknown> = {
    scheduledAt: { $gte: start, $lte: end },
    status: { $ne: 'cancelled' },
  };
  if (req.user?.role === 'doctor') filter.doctor = req.user._id;

  const appointments = await Appointment.find(filter)
    .populate('patient', 'patientId personalInfo.name personalInfo.phone personalInfo.gender')
    .populate('doctor', 'name')
    .populate('service', 'name')
    .sort({ tokenNumber: 1 })
    .lean();

  sendSuccess({ res, data: appointments });
});
