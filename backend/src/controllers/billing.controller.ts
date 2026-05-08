import { Response } from 'express';
import { z } from 'zod';
import { Billing } from '../models/Billing.model';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, buildPagination, getPaginationParams } from '../utils/response';
import { generateInvoiceNumber } from '../utils/id-generator';
import { getDayRange, getMonthRange } from '@sai-physio/utils';

export const createBillingSchema = z.object({
  patient: z.string().min(1),
  appointment: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    total: z.number().min(0),
  })).min(1),
  discount: z.number().min(0).default(0),
  discountType: z.enum(['flat', 'percentage']).default('flat'),
  tax: z.number().min(0).default(0),
  paymentMethod: z.enum(['cash', 'upi_manual', 'bank_transfer', 'cheque', 'pending']).default('pending'),
  amountPaid: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export const recordPaymentSchema = z.object({
  amountPaid: z.number().min(0),
  paymentMethod: z.enum(['cash', 'upi_manual', 'bank_transfer', 'cheque', 'pending']),
  paymentDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

const calculateTotal = (items: z.infer<typeof createBillingSchema>['items'], discount: number, discountType: string, tax: number) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = discountType === 'percentage' ? (subtotal * discount) / 100 : discount;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * tax) / 100;
  return { subtotal, totalAmount: afterDiscount + taxAmount };
};

export const getAllBills = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { paymentStatus, patient } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = {};
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (patient) filter.patient = patient;

  const [bills, total] = await Promise.all([
    Billing.find(filter)
      .populate('patient', 'patientId personalInfo.name personalInfo.phone')
      .populate('receivedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit).lean(),
    Billing.countDocuments(filter),
  ]);

  sendSuccess({ res, data: bills, pagination: buildPagination(page, limit, total) });
});

export const createBill = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.body as z.infer<typeof createBillingSchema>;
  const { subtotal, totalAmount } = calculateTotal(body.items, body.discount, body.discountType, body.tax);
  const invoiceNumber = await generateInvoiceNumber();

  const bill = await Billing.create({
    ...body,
    invoiceNumber,
    subtotal,
    totalAmount,
    balanceDue: totalAmount - body.amountPaid,
    receivedBy: req.user!._id,
    createdBy: req.user!._id,
  });

  sendSuccess({ res, statusCode: 201, message: `Invoice ${invoiceNumber} created`, data: bill });
});

export const getBill = asyncHandler(async (req: AuthRequest, res: Response) => {
  const bill = await Billing.findById(req.params.id)
    .populate('patient', 'patientId personalInfo')
    .populate('receivedBy', 'name')
    .populate('createdBy', 'name')
    .lean();
  if (!bill) throw new AppError('Invoice not found', 404);
  sendSuccess({ res, data: bill });
});

export const updateBill = asyncHandler(async (req: AuthRequest, res: Response) => {
  const bill = await Billing.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!bill) throw new AppError('Invoice not found', 404);
  sendSuccess({ res, message: 'Invoice updated', data: bill });
});

export const recordPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.body as z.infer<typeof recordPaymentSchema>;
  const bill = await Billing.findById(req.params.id);
  if (!bill) throw new AppError('Invoice not found', 404);

  bill.amountPaid = (bill.amountPaid || 0) + body.amountPaid;
  bill.paymentMethod = body.paymentMethod;
  bill.paymentDate = body.paymentDate ? new Date(body.paymentDate) : new Date();
  bill.receivedBy = req.user!._id as unknown as import('mongoose').Types.ObjectId;
  if (body.notes) bill.notes = body.notes;

  await bill.save(); // triggers auto-balance calculation in pre-save

  sendSuccess({ res, message: 'Payment recorded', data: bill });
});

export const getDailyReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const date = req.query.date ? new Date(req.query.date as string) : new Date();
  const { start, end } = getDayRange(date);

  const bills = await Billing.find({
    createdAt: { $gte: start, $lte: end },
    paymentStatus: { $in: ['paid', 'partial'] },
  }).lean();

  const summary = {
    totalCollected: bills.reduce((s, b) => s + b.amountPaid, 0),
    totalBilled: bills.reduce((s, b) => s + b.totalAmount, 0),
    byMethod: {
      cash: bills.filter((b) => b.paymentMethod === 'cash').reduce((s, b) => s + b.amountPaid, 0),
      upi_manual: bills.filter((b) => b.paymentMethod === 'upi_manual').reduce((s, b) => s + b.amountPaid, 0),
      bank_transfer: bills.filter((b) => b.paymentMethod === 'bank_transfer').reduce((s, b) => s + b.amountPaid, 0),
      cheque: bills.filter((b) => b.paymentMethod === 'cheque').reduce((s, b) => s + b.amountPaid, 0),
    },
    invoiceCount: bills.length,
  };

  sendSuccess({ res, data: { date: start, summary, bills } });
});

export const getOutstandingDues = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query);

  const [dues, total] = await Promise.all([
    Billing.find({ paymentStatus: { $in: ['pending', 'partial'] } })
      .populate('patient', 'patientId personalInfo.name personalInfo.phone')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit).lean(),
    Billing.countDocuments({ paymentStatus: { $in: ['pending', 'partial'] } }),
  ]);

  const totalOutstanding = dues.reduce((s, b) => s + b.balanceDue, 0);
  sendSuccess({ res, data: { totalOutstanding, dues }, pagination: buildPagination(page, limit, total) });
});

export const getMonthlyRevenue = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const { start, end } = getMonthRange();

  const result = await Billing.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amountPaid' },
        totalBilled: { $sum: '$totalAmount' },
        totalDue: { $sum: '$balanceDue' },
        count: { $sum: 1 },
      },
    },
  ]);

  sendSuccess({ res, data: result[0] || { totalRevenue: 0, totalBilled: 0, totalDue: 0, count: 0 } });
});
