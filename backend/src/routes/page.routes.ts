import { Router } from 'express';
import {
  getPublishedPages,
  getPublishedPageBySlug,
  getAllPagesAdmin,
  getPageAdmin,
  createPage,
  updatePage,
  deletePage,
} from '../controllers/page.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();

const STAFF = [UserRole.ADMIN] as const;

/**
 * @openapi
 * /pages:
 *   get:
 *     tags: [Pages]
 *     summary: Public — list published CMS pages (privacy, terms, about, etc.)
 *     parameters:
 *       - in: query
 *         name: footer
 *         schema: { type: boolean }
 *         description: When true, return only pages flagged for the footer
 *     responses:
 *       200:
 *         description: Published page list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/CmsPage' }
 */
router.get('/', getPublishedPages);

/**
 * @openapi
 * /pages/slug/{slug}:
 *   get:
 *     tags: [Pages]
 *     summary: Public — fetch a published CMS page by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *         example: privacy-policy
 *     responses:
 *       200:
 *         description: CMS page
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/CmsPage' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/slug/:slug', getPublishedPageBySlug);

/**
 * @openapi
 * /pages/admin/list:
 *   get:
 *     tags: [Pages]
 *     summary: Admin — list every CMS page (any status)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated CMS page list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/CmsPage' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/admin/list', authenticate, authorize(...STAFF), getAllPagesAdmin);

/**
 * @openapi
 * /pages/{id}:
 *   get:
 *     tags: [Pages]
 *     summary: Admin — fetch a CMS page by _id
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: CMS page
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/CmsPage' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', authenticate, authorize(...STAFF), getPageAdmin);

/**
 * @openapi
 * /pages:
 *   post:
 *     tags: [Pages]
 *     summary: Create a new CMS page
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CmsPage' }
 *     responses:
 *       201:
 *         description: CMS page created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/CmsPage' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post('/', authenticate, authorize(...STAFF), createPage);

/**
 * @openapi
 * /pages/{id}:
 *   put:
 *     tags: [Pages]
 *     summary: Update a CMS page
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
 *           schema: { $ref: '#/components/schemas/CmsPage' }
 *     responses:
 *       200:
 *         description: CMS page updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/CmsPage' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.put('/:id', authenticate, authorize(...STAFF), updatePage);

/**
 * @openapi
 * /pages/{id}:
 *   delete:
 *     tags: [Pages]
 *     summary: Delete a CMS page
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: CMS page deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/:id', authenticate, authorize(...STAFF), deletePage);

export default router;
