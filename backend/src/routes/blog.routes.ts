import { Router } from 'express';
import {
  getPublishedBlogs, getBlogBySlug, getAllBlogsAdmin,
  createBlog, updateBlog, deleteBlog,
} from '../controllers/blog.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();

/**
 * @openapi
 * /blog:
 *   get:
 *     tags: [Blog]
 *     summary: Public — list published blog articles (paginated)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Published blog list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Blog' }
 */
router.get('/', getPublishedBlogs);

/**
 * @openapi
 * /blog/slug/{slug}:
 *   get:
 *     tags: [Blog]
 *     summary: Public — fetch a published article by URL slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Blog article
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/Blog' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/slug/:slug', getBlogBySlug);

/**
 * @openapi
 * /blog/admin:
 *   get:
 *     tags: [Blog]
 *     summary: Admin — list every article (any status)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, published, archived] }
 *     responses:
 *       200:
 *         description: Paginated admin blog list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Blog' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/admin', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR), getAllBlogsAdmin);

/**
 * @openapi
 * /blog:
 *   post:
 *     tags: [Blog]
 *     summary: Create a new blog article
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Blog' }
 *           example:
 *             title: '5 Exercises for Lower Back Pain Relief'
 *             slug: '5-exercises-for-lower-back-pain-relief'
 *             excerpt: 'Simple stretches you can do at home, recommended by our physiotherapists.'
 *             content: '<h2>Why exercise helps</h2><p>…</p>'
 *             category: 'Spine Care'
 *             tags: ['back-pain', 'exercises', 'home-care']
 *             status: 'published'
 *     responses:
 *       201:
 *         description: Article created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/Blog' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post('/', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR), createBlog);

/**
 * @openapi
 * /blog/{id}:
 *   put:
 *     tags: [Blog]
 *     summary: Update a blog article
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Blog' }
 *     responses:
 *       200:
 *         description: Article updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/Blog' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.put('/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR), updateBlog);

/**
 * @openapi
 * /blog/{id}:
 *   delete:
 *     tags: [Blog]
 *     summary: Delete a blog article (admin only)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Article deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), deleteBlog);

export default router;
