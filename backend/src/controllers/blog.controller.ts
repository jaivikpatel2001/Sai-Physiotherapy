import { Request, Response } from 'express';
import { Blog } from '../models/Blog.model';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, buildPagination, getPaginationParams } from '../utils/response';
import { generateSlug } from '@sai-physio/utils';

export const getPublishedBlogs = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { category, tag } = req.query as { category?: string; tag?: string };

  const filter: Record<string, unknown> = { status: 'published' };
  if (category) filter.category = category;
  if (tag) filter.tags = tag;

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .populate('author', 'name avatar')
      .select('-content')
      .sort({ publishedAt: -1 })
      .skip(skip).limit(limit).lean(),
    Blog.countDocuments(filter),
  ]);

  sendSuccess({ res, data: blogs, pagination: buildPagination(page, limit, total) });
});

export const getBlogBySlug = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' })
    .populate('author', 'name avatar specialization')
    .lean();
  if (!blog) throw new AppError('Blog post not found', 404);

  await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
  sendSuccess({ res, data: blog });
});

export const getAllBlogsAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const [blogs, total] = await Promise.all([
    Blog.find().populate('author', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Blog.countDocuments(),
  ]);
  sendSuccess({ res, data: blogs, pagination: buildPagination(page, limit, total) });
});

export const createBlog = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.body as { title: string; slug?: string; [key: string]: unknown };
  const slug = (body.slug as string) || generateSlug(body.title);

  const existing = await Blog.findOne({ slug });
  if (existing) throw new AppError(`Slug '${slug}' already in use`, 409);

  const blog = await Blog.create({ ...body, slug, author: req.user!._id });
  sendSuccess({ res, statusCode: 201, message: 'Blog post created', data: blog });
});

export const updateBlog = asyncHandler(async (req: AuthRequest, res: Response) => {
  const blog = await Blog.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!blog) throw new AppError('Blog post not found', 404);
  sendSuccess({ res, message: 'Blog updated', data: blog });
});

export const deleteBlog = asyncHandler(async (req: AuthRequest, res: Response) => {
  const blog = await Blog.findByIdAndUpdate(req.params.id, { status: 'archived' });
  if (!blog) throw new AppError('Blog post not found', 404);
  sendSuccess({ res, message: 'Blog archived' });
});
