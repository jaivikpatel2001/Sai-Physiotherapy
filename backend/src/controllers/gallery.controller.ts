import { Request, Response } from 'express';
import { Gallery } from '../models/Gallery.model';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, buildPagination, getPaginationParams } from '../utils/response';
import { deleteStoredFile } from '../services/storage.service';

export const getPublishedGallery = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { category } = req.query as { category?: string };

  const filter: Record<string, unknown> = { isPublished: true };
  if (category) filter.category = category;

  const [items, total] = await Promise.all([
    Gallery.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Gallery.countDocuments(filter),
  ]);

  sendSuccess({ res, data: items, pagination: buildPagination(page, limit, total) });
});

export const getAllGalleryAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { category, published } = req.query as { category?: string; published?: string };

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (published !== undefined) filter.isPublished = published === 'true';

  const [items, total] = await Promise.all([
    Gallery.find(filter)
      .populate('createdBy', 'name')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Gallery.countDocuments(filter),
  ]);
  sendSuccess({ res, data: items, pagination: buildPagination(page, limit, total) });
});

export const getGalleryItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await Gallery.findById(req.params.id).lean();
  if (!item) throw new AppError('Gallery item not found', 404);
  sendSuccess({ res, data: item });
});

export const createGalleryItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await Gallery.create({ ...req.body, createdBy: req.user!._id });
  sendSuccess({ res, statusCode: 201, message: 'Gallery item created', data: item });
});

export const updateGalleryItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await Gallery.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true },
  );
  if (!item) throw new AppError('Gallery item not found', 404);
  sendSuccess({ res, message: 'Gallery item updated', data: item });
});

export const deleteGalleryItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await Gallery.findByIdAndDelete(req.params.id);
  if (!item) throw new AppError('Gallery item not found', 404);

  if (item.image?.storageKey && item.image?.storageProvider) {
    await deleteStoredFile(item.image.storageKey, item.image.storageProvider);
  }

  sendSuccess({ res, message: 'Gallery item deleted' });
});
