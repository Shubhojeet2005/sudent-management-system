import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';

export const getStudentByUser = (userId) => Student.findOne({ user: userId });
export const getFacultyByUser = (userId) => Faculty.findOne({ user: userId });
