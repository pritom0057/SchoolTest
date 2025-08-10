import { User } from './user.model.js';

export async function findByEmail(email: string) {
  return User.findOne({ email });
}

export async function getById(id: string) {
  return User.findById(id);
}
