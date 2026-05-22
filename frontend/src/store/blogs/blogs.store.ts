/** Blog posts — admin CRUD. */
import { createCrudStore } from '../helpers/createCrudStore';
import { blogsApi } from '../api/services.api';
import type { IBlog } from '@sai-physio/types';

export const useBlogsStore = createCrudStore<IBlog>({
  resource: 'blogs',
  list: blogsApi.list,
  getOne: blogsApi.getOne,
  create: blogsApi.create,
  update: blogsApi.update,
  remove: blogsApi.remove,
});
