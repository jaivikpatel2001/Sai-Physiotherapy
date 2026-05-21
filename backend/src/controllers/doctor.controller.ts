import { Request, Response } from 'express';
import { Doctor } from '../models/Doctor.model';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, buildPagination, getPaginationParams } from '../utils/response';
import { generateSlug } from '@sai-physio/utils';
import { deleteStoredFile } from '../services/storage.service';

export const getPublicDoctors = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { specialty } = req.query as { specialty?: string };

  const filter: Record<string, unknown> = { isActive: true };
  if (specialty) filter.specialties = specialty;

  const [doctors, total] = await Promise.all([
    Doctor.find(filter)
      .select('-__v')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Doctor.countDocuments(filter),
  ]);

  sendSuccess({ res, data: doctors, pagination: buildPagination(page, limit, total) });
});

export const getDoctorBySlug = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await Doctor.findOne({ slug: req.params.slug, isActive: true }).lean();
  if (!doctor) throw new AppError('Doctor not found', 404);
  sendSuccess({ res, data: doctor });
});

export const getAllDoctorsAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { active, q } = req.query as { active?: string; q?: string };

  const filter: Record<string, unknown> = {};
  if (active !== undefined) filter.isActive = active === 'true';
  if (q) filter.$text = { $search: q };

  const [doctors, total] = await Promise.all([
    Doctor.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Doctor.countDocuments(filter),
  ]);
  sendSuccess({ res, data: doctors, pagination: buildPagination(page, limit, total) });
});

export const getDoctor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const doctor = await Doctor.findById(req.params.id).lean();
  if (!doctor) throw new AppError('Doctor not found', 404);
  sendSuccess({ res, data: doctor });
});

export const createDoctor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.body as { name: string; slug?: string; [key: string]: unknown };
  const slug = (body.slug as string) || generateSlug(body.name);

  const existing = await Doctor.findOne({ slug });
  if (existing) throw new AppError(`Slug '${slug}' already exists`, 409);

  const doctor = await Doctor.create({ ...body, slug });
  sendSuccess({ res, statusCode: 201, message: 'Doctor created', data: doctor });
});

export const updateDoctor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true },
  );
  if (!doctor) throw new AppError('Doctor not found', 404);
  sendSuccess({ res, message: 'Doctor updated', data: doctor });
});

export const deleteDoctor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);
  if (!doctor) throw new AppError('Doctor not found', 404);

  if (doctor.photo?.storageKey && doctor.photo?.storageProvider) {
    await deleteStoredFile(doctor.photo.storageKey, doctor.photo.storageProvider);
  }

  sendSuccess({ res, message: 'Doctor deleted' });
});
