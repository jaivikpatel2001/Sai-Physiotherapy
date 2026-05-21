import { Request, Response } from 'express';
import { Page } from '../models/Page.model';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, buildPagination, getPaginationParams } from '../utils/response';
import { generateSlug } from '@sai-physio/utils';

const PUBLIC_PROJECTION = '-createdBy -lastEditedBy -__v';

export const getPublishedPages = asyncHandler(async (req: Request, res: Response) => {
  const { footer } = req.query as { footer?: string };

  const filter: Record<string, unknown> = { isPublished: true };
  if (footer === 'true') filter.showInFooter = true;

  const pages = await Page.find(filter)
    .select(PUBLIC_PROJECTION)
    .sort({ footerOrder: 1, title: 1 })
    .lean();

  sendSuccess({ res, data: pages });
});

export const getPublishedPageBySlug = asyncHandler(async (req: Request, res: Response) => {
  const page = await Page.findOne({ slug: req.params.slug, isPublished: true })
    .select(PUBLIC_PROJECTION)
    .lean();
  if (!page) throw new AppError('Page not found', 404);
  sendSuccess({ res, data: page });
});

export const getAllPagesAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page: p, limit, skip } = getPaginationParams(req.query);
  const [pages, total] = await Promise.all([
    Page.find().sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    Page.countDocuments(),
  ]);
  sendSuccess({ res, data: pages, pagination: buildPagination(p, limit, total) });
});

export const getPageAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = await Page.findById(req.params.id).lean();
  if (!page) throw new AppError('Page not found', 404);
  sendSuccess({ res, data: page });
});

export const createPage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.body as { title: string; slug?: string; [key: string]: unknown };
  const slug = (body.slug as string) || generateSlug(body.title);

  const existing = await Page.findOne({ slug });
  if (existing) throw new AppError(`Slug '${slug}' already exists`, 409);

  const page = await Page.create({
    ...body,
    slug,
    createdBy: req.user!._id,
    lastEditedBy: req.user!._id,
  });
  sendSuccess({ res, statusCode: 201, message: 'Page created', data: page });
});

export const updatePage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = await Page.findByIdAndUpdate(
    req.params.id,
    { $set: { ...req.body, lastEditedBy: req.user!._id } },
    { new: true, runValidators: true },
  );
  if (!page) throw new AppError('Page not found', 404);
  sendSuccess({ res, message: 'Page updated', data: page });
});

export const deletePage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = await Page.findByIdAndDelete(req.params.id);
  if (!page) throw new AppError('Page not found', 404);
  sendSuccess({ res, message: 'Page deleted' });
});
