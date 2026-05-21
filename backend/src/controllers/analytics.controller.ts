import { Response } from 'express';
import { Patient } from '../models/Patient.model';
import { Appointment } from '../models/Appointment.model';
import { Billing } from '../models/Billing.model';
import { User } from '../models/User.model';
import { Service } from '../models/Service.model';
import { Doctor } from '../models/Doctor.model';
import { Blog } from '../models/Blog.model';
import { Testimonial } from '../models/Testimonial.model';
import { Gallery } from '../models/Gallery.model';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';
import { UserRole } from '@sai-physio/types';
import { getDayRange, getMonthRange } from '@sai-physio/utils';


export const getDashboardStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const now = new Date();
  const { start: todayStart, end: todayEnd } = getDayRange(now);
  const { start: monthStart, end: monthEnd } = getMonthRange(now);

  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Seven days back for the "this week" KPI
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const [
    totalPatients,
    newPatientsThisMonth,
    newPatientsPrevMonth,
    todayAppointments,
    weeklyAppointments,
    upcomingAppointments,
    thisMonthRevenue,
    prevMonthRevenue,
    pendingDues,
    activeDoctors,
    publishedBlogs,
    approvedTestimonials,
  ] = await Promise.all([
    Patient.countDocuments(),
    Patient.countDocuments({ createdAt: { $gte: monthStart, $lte: monthEnd } }),
    Patient.countDocuments({ createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } }),
    Appointment.countDocuments({ scheduledAt: { $gte: todayStart, $lte: todayEnd }, status: { $ne: 'cancelled' } }),
    Appointment.countDocuments({ scheduledAt: { $gte: weekStart, $lte: todayEnd } }),
    Appointment.countDocuments({ scheduledAt: { $gt: todayEnd }, status: { $in: ['scheduled', 'confirmed'] } }),
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
    Doctor.countDocuments({ isActive: true }),
    Blog.countDocuments({ status: 'published' }),
    Testimonial.countDocuments({ isApproved: true }),
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
        weeklyAppointments,
        upcomingAppointments,
        monthlyRevenue: currentRevenue,
        revenueGrowth: Math.round(revenueGrowth),
        pendingDues: pendingDues[0]?.total || 0,
        activeDoctors,
        publishedBlogs,
        approvedTestimonials,
      },
    },
  });
});

export const getAppointmentTrend = asyncHandler(async (req: AuthRequest, res: Response) => {
  const days = parseInt((req.query.days as string) || '30', 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const trend = await Appointment.aggregate([
    { $match: { scheduledAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$scheduledAt' } },
        count: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        scheduled: { $sum: { $cond: [{ $in: ['$status', ['scheduled', 'confirmed']] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        count: 1,
        completed: 1,
        cancelled: 1,
        scheduled: 1,
      },
    },
  ]);

  sendSuccess({ res, data: trend });
});

export const getRevenueByMonth = asyncHandler(async (req: AuthRequest, res: Response) => {
  const months = parseInt((req.query.months as string) || '6', 10);
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const revenue = await Billing.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        billed: { $sum: '$totalAmount' },
        collected: { $sum: '$amountPaid' },
        outstanding: { $sum: '$balanceDue' },
        invoices: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        period: '$_id',
        revenue: '$collected',
        billed: 1,
        collected: 1,
        outstanding: 1,
        invoices: 1,
      },
    },
  ]);

  sendSuccess({ res, data: revenue });
});

export const getPatientsByService = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const data = await Appointment.aggregate([
    { $match: { status: { $in: ['completed', 'in_progress'] } } },
    { $group: { _id: '$service', count: { $sum: 1 } } },
    { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'service' } },
    { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        name: '$service.name',
        value: '$count',
        count: 1,
        category: '$service.category',
      },
    },
    { $sort: { value: -1 } },
    { $limit: 10 },
  ]);

  sendSuccess({ res, data });
});

export const getDoctorWorkload = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const { start, end } = getMonthRange();

  const data = await Appointment.aggregate([
    { $match: { scheduledAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: '$doctor',
        appointments: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
      },
    },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'doctor' } },
    { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        name: '$doctor.name',
        avatar: '$doctor.avatar',
        specialization: '$doctor.specialization',
        appointments: 1,
        completed: 1,
        cancelled: 1,
      },
    },
    { $sort: { appointments: -1 } },
  ]);

  sendSuccess({ res, data });
});

// ─── NEW ENDPOINTS ─────────────────────────────────────────────────────────

export const getTopDoctors = asyncHandler(async (req: AuthRequest, res: Response) => {
  const days = parseInt((req.query.days as string) || '30', 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const data = await Appointment.aggregate([
    { $match: { scheduledAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$doctor',
        appointments: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      },
    },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'doctor' } },
    { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
    { $match: { 'doctor.role': UserRole.DOCTOR } },
    {
      $project: {
        _id: 1,
        name: '$doctor.name',
        avatar: '$doctor.avatar',
        specialization: '$doctor.specialization',
        appointments: 1,
        completed: 1,
        completionRate: {
          $cond: [
            { $eq: ['$appointments', 0] },
            0,
            { $multiply: [{ $divide: ['$completed', '$appointments'] }, 100] },
          ],
        },
      },
    },
    { $sort: { appointments: -1 } },
    { $limit: 5 },
  ]);

  sendSuccess({ res, data });
});

export const getUpcomingAppointments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const limit = Math.min(50, parseInt((req.query.limit as string) || '8', 10));
  const now = new Date();

  const data = await Appointment.find({
    scheduledAt: { $gte: now },
    status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
  })
    .sort({ scheduledAt: 1 })
    .limit(limit)
    .populate('patient', 'personalInfo.name patientId')
    .populate('doctor', 'name avatar')
    .populate('service', 'name category')
    .lean();

  sendSuccess({ res, data });
});

export const getRecentPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const limit = Math.min(50, parseInt((req.query.limit as string) || '8', 10));

  const data = await Billing.find({ amountPaid: { $gt: 0 } })
    .sort({ paymentDate: -1, updatedAt: -1 })
    .limit(limit)
    .populate('patient', 'personalInfo.name patientId')
    .select('invoiceNumber patient amountPaid paymentMethod paymentStatus paymentDate totalAmount balanceDue')
    .lean();

  sendSuccess({ res, data });
});

export const getRecentActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const limit = Math.min(30, parseInt((req.query.limit as string) || '10', 10));

  const [recentAppointments, recentPayments, recentPatients] = await Promise.all([
    Appointment.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('patient', 'personalInfo.name')
      .populate('doctor', 'name')
      .select('appointmentId patient doctor status scheduledAt createdAt')
      .lean(),
    Billing.find({ paymentDate: { $exists: true, $ne: null } })
      .sort({ paymentDate: -1 })
      .limit(limit)
      .populate('patient', 'personalInfo.name')
      .select('invoiceNumber patient amountPaid paymentMethod paymentDate')
      .lean(),
    Patient.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('patientId personalInfo.name createdAt')
      .lean(),
  ]);

  type ActivityEvent = {
    kind: 'appointment' | 'payment' | 'patient';
    at: Date;
    title: string;
    subtitle?: string;
    icon: string;
  };

  const events: ActivityEvent[] = [];

  for (const a of recentAppointments) {
    const patient = (a.patient as unknown as { personalInfo?: { name?: string } })?.personalInfo?.name ?? 'Patient';
    const doctor = (a.doctor as unknown as { name?: string })?.name ?? 'doctor';
    events.push({
      kind: 'appointment',
      at: a.createdAt as Date,
      title: `Appointment booked for ${patient}`,
      subtitle: `with ${doctor} on ${new Date(a.scheduledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`,
      icon: 'ri-calendar-check-line',
    });
  }

  for (const p of recentPayments) {
    const patient = (p.patient as unknown as { personalInfo?: { name?: string } })?.personalInfo?.name ?? 'Patient';
    events.push({
      kind: 'payment',
      at: p.paymentDate as Date,
      title: `₹${p.amountPaid.toLocaleString('en-IN')} received from ${patient}`,
      subtitle: `Invoice ${p.invoiceNumber} · ${p.paymentMethod.replace('_', ' ')}`,
      icon: 'ri-money-rupee-circle-line',
    });
  }

  for (const p of recentPatients) {
    events.push({
      kind: 'patient',
      at: p.createdAt as Date,
      title: `New patient registered: ${p.personalInfo?.name ?? 'Unknown'}`,
      subtitle: `${p.patientId}`,
      icon: 'ri-user-add-line',
    });
  }

  events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  sendSuccess({ res, data: events.slice(0, limit) });
});

export const getContentSummary = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const [recentBlogs, latestTestimonials, mostViewedBlogs, gallerySize, serviceCount] = await Promise.all([
    Blog.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(5)
      .populate('author', 'name')
      .select('title slug excerpt featuredImage publishedAt views author')
      .lean(),
    Testimonial.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('patientName condition rating review isFeatured createdAt')
      .lean(),
    Blog.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(5)
      .select('title slug views category')
      .lean(),
    Gallery.countDocuments({ isPublished: true }),
    Service.countDocuments({ isActive: true }),
  ]);

  sendSuccess({
    res,
    data: {
      recentBlogs,
      latestTestimonials,
      mostViewedBlogs,
      gallerySize,
      serviceCount,
    },
  });
});

export const getPatientGrowth = asyncHandler(async (req: AuthRequest, res: Response) => {
  const months = parseInt((req.query.months as string) || '12', 10);
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const growth = await Patient.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        newPatients: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        period: '$_id',
        newPatients: 1,
      },
    },
  ]);

  // Add cumulative total
  let running = await Patient.countDocuments({ createdAt: { $lt: startDate } });
  const out = growth.map((g) => {
    running += g.newPatients;
    return { ...g, total: running };
  });

  sendSuccess({ res, data: out });
});

export const getAppointmentStatusBreakdown = asyncHandler(async (req: AuthRequest, res: Response) => {
  const days = parseInt((req.query.days as string) || '30', 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const data = await Appointment.aggregate([
    { $match: { scheduledAt: { $gte: startDate } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    {
      $project: {
        _id: 0,
        name: '$_id',
        value: '$count',
      },
    },
    { $sort: { value: -1 } },
  ]);

  sendSuccess({ res, data });
});

void User; // referenced indirectly via populate
