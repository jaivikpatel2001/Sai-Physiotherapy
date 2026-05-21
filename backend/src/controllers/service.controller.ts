import { Request, Response } from 'express';
import { Service } from '../models/Service.model';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, buildPagination, getPaginationParams } from '../utils/response';
import { generateSlug } from '@sai-physio/utils';

export const getAllServices = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { category, active } = req.query as { category?: string; active?: string };

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (active !== undefined) filter.isActive = active === 'true';

  const [services, total] = await Promise.all([
    Service.find(filter).sort({ order: 1, name: 1 }).skip(skip).limit(limit).lean(),
    Service.countDocuments(filter),
  ]);

  sendSuccess({ res, data: services, pagination: buildPagination(page, limit, total) });
});

export const getServiceBySlug = asyncHandler(async (req: Request, res: Response) => {
  const service = await Service.findOne({ slug: req.params.slug, isActive: true }).lean();
  if (!service) throw new AppError('Service not found', 404);
  sendSuccess({ res, data: service });
});

export const getService = asyncHandler(async (req: Request, res: Response) => {
  const service = await Service.findById(req.params.id).lean();
  if (!service) throw new AppError('Service not found', 404);
  sendSuccess({ res, data: service });
});

export const createService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.body as { name: string; [key: string]: unknown };
  const slug = body.slug as string || generateSlug(body.name);

  const existing = await Service.findOne({ slug });
  if (existing) throw new AppError(`Slug '${slug}' already exists`, 409);

  const service = await Service.create({ ...body, slug });
  sendSuccess({ res, statusCode: 201, message: 'Service created', data: service });
});

export const updateService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!service) throw new AppError('Service not found', 404);
  sendSuccess({ res, message: 'Service updated', data: service });
});

export const deleteService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const service = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!service) throw new AppError('Service not found', 404);
  sendSuccess({ res, message: 'Service deactivated' });
});
