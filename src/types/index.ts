
export interface Student {
  id: string;
  name: string;
  created_at?: string;
}

export interface Test {
  id: string;
  name: string;
  maxGrade: number;
  created_at?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  testId: string;
  value: number;
  created_at?: string;
}

export interface StudentWithGrades extends Student {
  grades: Record<string, number>;
  total: number;
}

export interface FormattedStudent {
  id: string;
  name: string;
  grades: Record<string, number | null>;
  total: number;
  maxPossible: number;
}
