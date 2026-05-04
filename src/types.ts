export type AdmissionStatus = 'pending' | 'accepted' | 'rejected' | 'reviewed';

export interface AdmissionApplication {
  id?: string;
  fullName: string;
  dob: string;
  parentContact: string;
  email: string;
  status: AdmissionStatus;
  createdAt: number;
  classSeeking?: string;
  testScore?: number;
  registered?: boolean;
  studentId?: string;
}

export interface SubjectResult {
  name: string;
  score: number;
  grade: string;
}

export interface StudentResult {
  id?: string;
  studentId: string;
  studentName: string;
  academicYear: string;
  term: string;
  subjects: SubjectResult[];
  createdAt: number;
}

export interface StudentInfo {
  id?: string;
  studentId: string;
  name: string;
  class: string;
  createdAt: number;
}

export type ViewState = 'home' | 'admission' | 'results' | 'about' | 'mission' | 'vision' | 'admin' | 'admin-dashboard';
