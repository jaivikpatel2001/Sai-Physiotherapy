import { Response } from 'express';
import { Patient } from '../models/Patient.model';
import { Appointment } from '../models/Appointment.model';
import { Billing } from '../models/Billing.model';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';
import { getDayRange, getMonthRange } from '@sai-physio/utils';


export const getDashboardStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const now = new Date();
  const { start: todayStart, end: todayEnd } = getDayRange(now);
  const { start: monthStart, end: monthEnd } = getMonthRange(now);

  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    totalPatients,
    newPatientsThisMonth,
    newPatientsPrevMonth,
    todayAppointments,
    thisMonthRevenue,
    prevMonthRevenue,
    pendingDues,
  ] = await Promise.all([
    Patient.countDocuments(),
    Patient.countDocuments({ createdAt: { $gte: monthStart, $lte: monthEnd } }),
    Patient.countDocuments({ createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } }),
    Appointment.countDocuments({ scheduledAt: { $gte: todayStart, $lte: todayEnd }, status: { $ne: 'cancelled' } }),
    Billing.aggregate([
      { $match: { createdAt: { $gte: monthStart, $lte: monthEnd } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]),
    Billing.aggregate([
      { $match: { createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]),
    Billing.aggregate([
      { $match: { paymentStatus: { $in: ['pending', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$balanceDue' } } },
    ]),
  ]);

  const currentRevenue = thisMonthRevenue[0]?.total || 0;
  const previousRevenue = prevMonthRevenue[0]?.total || 0;
  const revenueGrowth = previousRevenue > 0
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
    : 0;

  const patientGrowth = newPatientsPrevMonth > 0
    ? ((newPatientsThisMonth - newPatientsPrevMonth) / newPatientsPrevMonth) * 100
    : 0;

  sendSuccess({
    res,
    data: {
      kpis: {
        totalPatients,
        newPatientsThisMonth,
        patientGrowth: Math.round(patientGrowth),
        todayAppointments,
        monthlyRevenue: currentRevenue,
        revenueGrowth: Math.round(revenueGrowth),
        pendingDues: pendingDues[0]?.total || 0,
      },
    },
  });
});

export const getAppointmentTrend = asyncHandler(async (req: AuthRequest, res: Response) => {
  const days = parseInt((req.query.days as string) || '30', 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const trend = await Appointment.aggregate([
    { $match: { scheduledAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$scheduledAt' } },
        count: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  sendSuccess({ res, data: trend });
});

export const getRevenueByMonth = asyncHandler(async (req: AuthRequest, res: Response) => {
  const months = parseInt((req.query.months as string) || '6', 10);
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const revenue = await Billing.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        billed: { $sum: '$totalAmount' },
        collected: { $sum: '$amountPaid' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  sendSuccess({ res, data: revenue });
});

export const getPatientsByService = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const data = await Appointment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$service', count: { $sum: 1 } } },
    { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'service' } },
    { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
    { $project: { name: '$service.name', count: 1 } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  sendSuccess({ res, data });
});

export const getDoctorWorkload = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const { start, end } = getMonthRange();

  const data = await Appointment.aggregate([
    { $match: { scheduledAt: { $gte: start, $lte: end } } },
    { $group: { _id: '$doctor', appointments: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'doctor' } },
    { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
    { $project: { name: '$doctor.name', appointments: 1, completed: 1 } },
    { $sort: { appointments: -1 } },
  ]);

  sendSuccess({ res, data });
});
