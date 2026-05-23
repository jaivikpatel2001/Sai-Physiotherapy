import { Request, Response } from 'express';
import { Testimonial } from '../models/Testimonial.model';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, buildPagination, getPaginationParams } from '../utils/response';

export const getApprovedTestimonials = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { featured } = req.query as { featured?: string };

  const filter: Record<string, unknown> = { isApproved: true };
  if (featured === 'true') filter.isFeatured = true;

  const [testimonials, total] = await Promise.all([
    Testimonial.find(filter).sort({ isFeatured: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Testimonial.countDocuments(filter),
  ]);

  sendSuccess({ res, data: testimonials, pagination: buildPagination(page, limit, total) });
});

export const submitTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const testimonial = await Testimonial.create({ ...req.body, source: 'website_form', isApproved: false });
  sendSuccess({ res, statusCode: 201, message: 'Thank you! Your review will be published after moderation.', data: testimonial });
});

export const createTestimonialAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const testimonial = await Testimonial.create({
    ...req.body,
    source: req.body?.source || 'manual',
    isApproved: req.body?.isApproved ?? true,
  });
  sendSuccess({ res, statusCode: 201, message: 'Testimonial created', data: testimonial });
});

export const updateTestimonialAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const testimonial = await Testimonial.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true },
  );
  if (!testimonial) throw new AppError('Testimonial not found', 404);
  sendSuccess({ res, message: 'Testimonial updated', data: testimonial });
});

export const getTestimonialByIdAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) throw new AppError('Testimonial not found', 404);
  sendSuccess({ res, data: testimonial });
});

export const getAllTestimonialsAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const [testimonials, total] = await Promise.all([
    Testimonial.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Testimonial.countDocuments(),
  ]);
  sendSuccess({ res, data: testimonials, pagination: buildPagination(page, limit, total) });
});

export const approveTestimonial = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { isApproved, isFeatured } = req.body as { isApproved?: boolean; isFeatured?: boolean };
  const testimonial = await Testimonial.findByIdAndUpdate(
    req.params.id,
    { ...(isApproved !== undefined && { isApproved }), ...(isFeatured !== undefined && { isFeatured }) },
    { new: true }
  );
  if (!testimonial) throw new AppError('Testimonial not found', 404);
  sendSuccess({ res, message: 'Testimonial updated', data: testimonial });
});

export const deleteTestimonial = asyncHandler(async (req: AuthRequest, res: Response) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
  if (!testimonial) throw new AppError('Testimonial not found', 404);
  sendSuccess({ res, message: 'Testimonial deleted' });
});
