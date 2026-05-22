/** Doctor profiles — admin CRUD + public listing. */
import { createCrudStore } from '../helpers/createCrudStore';
import { doctorsApi, type IDoctor } from '../api/services.api';

export const useDoctorsStore = createCrudStore<IDoctor>({
  resource: 'doctors',
  list: doctorsApi.list,
  getOne: doctorsApi.getOne,
  create: doctorsApi.create,
  update: doctorsApi.update,
  remove: doctorsApi.remove,
});
