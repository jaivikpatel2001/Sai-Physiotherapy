import { Router } from 'express';
import {
  getPublishedGallery,
  getAllGalleryAdmin,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from '../controllers/gallery.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@sai-physio/types';

const router = Router();

const STAFF = [UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR] as const;

/**
 * @openapi
 * /gallery:
 *   get:
 *     tags: [Gallery]
 *     summary: Public — list published gallery items
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [clinic, treatments, events, awards, team] }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: Published gallery items
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/GalleryItem' }
 */
router.get('/', getPublishedGallery);

/**
 * @openapi
 * /gallery/admin/list:
 *   get:
 *     tags: [Gallery]
 *     summary: Admin — list every gallery item (paginated)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated gallery list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/GalleryItem' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/admin/list', authenticate, authorize(...STAFF), getAllGalleryAdmin);

/**
 * @openapi
 * /gallery/{id}:
 *   get:
 *     tags: [Gallery]
 *     summary: Admin — fetch a single gallery item by _id
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Gallery item
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/GalleryItem' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', authenticate, authorize(...STAFF), getGalleryItem);

/**
 * @openapi
 * /gallery:
 *   post:
 *     tags: [Gallery]
 *     summary: Create a new gallery item
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/GalleryItem' }
 *     responses:
 *       201:
 *         description: Gallery item created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/GalleryItem' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post('/', authenticate, authorize(...STAFF), createGalleryItem);

/**
 * @openapi
 * /gallery/{id}:
 *   put:
 *     tags: [Gallery]
 *     summary: Update a gallery item
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
 *           schema: { $ref: '#/components/schemas/GalleryItem' }
 *     responses:
 *       200:
 *         description: Gallery item updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/GalleryItem' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.put('/:id', authenticate, authorize(...STAFF), updateGalleryItem);

/**
 * @openapi
 * /gallery/{id}:
 *   delete:
 *     tags: [Gallery]
 *     summary: Delete a gallery item (admin only)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Gallery item deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteGalleryItem);

export default router;
