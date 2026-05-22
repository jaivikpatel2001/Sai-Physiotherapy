/** CMS pages — admin CRUD. */
import { createCrudStore } from '../helpers/createCrudStore';
import { pagesApi, type ICmsPage } from '../api/services.api';

export const usePagesStore = createCrudStore<ICmsPage>({
  resource: 'pages',
  list: pagesApi.list,
  getOne: pagesApi.getOne,
  create: pagesApi.create,
  update: pagesApi.update,
  remove: pagesApi.remove,
});
