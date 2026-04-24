
export enum UserRole {
  STUDENT = 'Student',
  PARENT = 'Parent',
  FACULTY = 'Faculty',
  ADMIN = 'Admin'
}

export type View = 'home' | 'login' | 'dashboard';

export interface User {
  role: UserRole;
  name: string;
  email: string;
}

export const COURSES = ['JEE', 'NEET', 'Foundation'];

export const BATCH_CONFIG: Record<string, string[]> = {
  'JEE': ['JEE 11th', 'JEE 12th', 'JEE Dropper'],
  'NEET': ['NEET 11th', 'NEET 12th', 'NEET Dropper'],
  'Foundation': ['8th Foundation', '9th Foundation', '10th Foundation']
};

export const SUBJECT_CONFIG: Record<string, string[]> = {
  'JEE': ['Maths', 'Physics', 'Chemistry', 'Extra Class', 'Doubt Class'],
  'NEET': ['Bio', 'Physics', 'Chemistry', 'Extra Class', 'Doubt Class'],
  'Foundation': ['Maths', 'Physics', 'Chemistry', 'Hindi', 'English', 'Physical Education', 'Computer Science']
};

export const CLASS_TYPES = ['Normal Class', 'Doubt Class', 'Extra Class'];

export const TEST_TYPES = ['Weekly', 'Monthly', 'Half-Yearly', 'Final Exam', 'Test Series 1', 'Test Series 2', 'Test Series 3'];
export const SYLLABUS_STATUSES = ['Pending', 'Ongoing', 'Completed'];
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
