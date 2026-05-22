/** Gallery items — admin CRUD. */
import { createCrudStore } from '../helpers/createCrudStore';
import { galleryApi, type IGalleryItem } from '../api/services.api';

export const useGalleryStore = createCrudStore<IGalleryItem>({
  resource: 'gallery',
  list: galleryApi.list,
  getOne: galleryApi.getOne,
  create: galleryApi.create,
  update: galleryApi.update,
  remove: galleryApi.remove,
});
