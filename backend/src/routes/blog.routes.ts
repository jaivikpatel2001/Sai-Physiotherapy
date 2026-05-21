import { Router } from 'express';
import {
  getPublishedBlogs, getBlogBySlug, getAllBlogsAdmin,
  createBlog, updateBlog, deleteBlog,
} from '../controllers/blog.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();

router.get('/', getPublishedBlogs);
router.get('/slug/:slug', getBlogBySlug);

router.get('/admin', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR), getAllBlogsAdmin);
router.post('/', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR), createBlog);
router.put('/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR), updateBlog);
router.delete('/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), deleteBlog);

export default router;
