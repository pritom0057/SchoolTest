import { Question } from './question.model.js';

export function createQuestion(data: any) {
  return Question.create(data);
}

export function listQuestions(filter: any, { skip = 0, limit = 20 } = {}) {
  return Question.find(filter).skip(skip).limit(limit).lean();
}

export function countQuestions(filter: any) {
  return Question.countDocuments(filter);
}

export function updateQuestion(id: string, data: any) {
  return Question.findByIdAndUpdate(id, data, { new: true });
}

export function deleteQuestion(id: string) {
  return Question.findByIdAndDelete(id);
}
