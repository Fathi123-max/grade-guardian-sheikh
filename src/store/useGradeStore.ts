import { create } from 'zustand';
import { Student, Test, Grade, FormattedStudent } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define the store state
type GradeStoreState = {
  students: Student[];
  tests: Test[];
  grades: Grade[];
  isLoading: boolean;
  error: string | null;
};

// Define the store actions
type GradeStoreActions = {
  // Data fetching
  fetchStudents: (userId: string) => Promise<void>;
  fetchTests: (userId: string) => Promise<void>;
  fetchGrades: (userId: string) => Promise<void>;
  fetchAllData: (userId: string) => Promise<void>;
  
  // Student operations
  addStudent: (name: string, userId: string) => Promise<Student | null>;
  updateStudent: (id: string, name: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  
  // Test operations
  addTest: (name: string, maxGrade: number, userId: string) => Promise<Test | null>;
  updateTest: (id: string, name: string, maxGrade: number) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  
  // Grade operations
  updateGrade: (studentId: string, testId: string, value: number) => Promise<void>;
  
  // Helper functions
  getFormattedStudents: () => FormattedStudent[];
  getTotalMaxGrade: () => number;
};

// Create the store with a simpler type structure
export const useGradeStore = create<GradeStoreState & GradeStoreActions>((set, get) => ({
  // Initial state
  students: [],
  tests: [],
  grades: [],
  isLoading: false,
  error: null,

  // Data fetching
  fetchStudents: async (userId: string) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      set({ students: data || [] });
    } catch (error) {
      console.error('Error fetching students:', error);
      set({ error: 'حدث خطأ أثناء تحميل بيانات الطلاب' });
      toast.error('حدث خطأ أثناء تحميل بيانات الطلاب');
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTests: async (userId: string) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Map database fields to our model
      const mappedData = (data || []).map(item => ({
        ...item,
        maxGrade: item.maxgrade // Map maxgrade -> maxGrade
      }));
      
      set({ tests: mappedData });
    } catch (error) {
      console.error('Error fetching tests:', error);
      set({ error: 'حدث خطأ أثناء تحميل بيانات الاختبارات' });
      toast.error('حدث خطأ أثناء تحميل بيانات الاختبارات');
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGrades: async (userId: string) => {
    try {
      set({ isLoading: true });
      
      // First, get all students for this user
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', userId);
      
      if (studentsError) throw studentsError;
      
      if (!studentsData || studentsData.length === 0) {
        set({ grades: [] });
        return;
      }
      
      // Get all grades for these students
      const studentIds = studentsData.map(s => s.id);
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .in('studentid', studentIds);
        
      if (gradesError) throw gradesError;
      
      // Map database fields to our model
      const mappedData = (gradesData || []).map(item => ({
        ...item,
        studentId: item.studentid, // Map studentid -> studentId
        testId: item.testid        // Map testid -> testId
      }));
      
      set({ grades: mappedData });
    } catch (error) {
      console.error('Error fetching grades:', error);
      set({ error: 'حدث خطأ أثناء تحميل بيانات الدرجات' });
      toast.error('حدث خطأ أثناء تحميل بيانات الدرجات');
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllData: async (userId: string) => {
    try {
      set({ isLoading: true });
      await Promise.all([
        get().fetchStudents(userId),
        get().fetchTests(userId),
        get().fetchGrades(userId)
      ]);
    } catch (error) {
      console.error('Error fetching all data:', error);
      set({ error: 'حدث خطأ أثناء تحميل البيانات' });
      toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      set({ isLoading: false });
    }
  },

  // Student operations
  addStudent: async (name: string, userId: string) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('students')
        .insert([{ name, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        const newStudent = { ...data, name };
        set((state) => ({
          students: [...state.students, newStudent]
        }));
        return newStudent;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding student:', error);
      set({ error: 'حدث خطأ أثناء إضافة الطالب' });
      toast.error('حدث خطأ أثناء إضافة الطالب');
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  updateStudent: async (id: string, name: string) => {
    try {
      set({ isLoading: true });
      const { error } = await supabase
        .from('students')
        .update({ name })
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        students: state.students.map((student) =>
          student.id === id ? { ...student, name } : student
        )
      }));
      
      toast.success('تم تحديث بيانات الطالب بنجاح');
    } catch (error) {
      console.error('Error updating student:', error);
      set({ error: 'حدث خطأ أثناء تحديث بيانات الطالب' });
      toast.error('حدث خطأ أثناء تحديث بيانات الطالب');
    } finally {
      set({ isLoading: false });
    }
  },

  deleteStudent: async (id: string) => {
    try {
      set({ isLoading: true });
      
      // First, delete all grades for this student
      const { error: gradesError } = await supabase
        .from('grades')
        .delete()
        .eq('studentid', id);
        
      if (gradesError) throw gradesError;
      
      // Then delete the student
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update the local state
      set((state) => ({
        students: state.students.filter((student) => student.id !== id),
        grades: state.grades.filter((grade) => grade.studentId !== id)
      }));
      
      toast.success('تم حذف الطالب بنجاح');
    } catch (error) {
      console.error('Error deleting student:', error);
      set({ error: 'حدث خطأ أثناء حذف الطالب' });
      toast.error('حدث خطأ أثناء حذف الطالب');
    } finally {
      set({ isLoading: false });
    }
  },

  // Test operations
  addTest: async (name: string, maxGrade: number, userId: string) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('tests')
        .insert([{ name, maxgrade: maxGrade, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        const newTest = {
          ...data,
          maxGrade: data.maxgrade // Map maxgrade -> maxGrade
        };
        
        set((state) => ({
          tests: [...state.tests, newTest]
        }));
        
        return newTest;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding test:', error);
      set({ error: 'حدث خطأ أثناء إضافة الاختبار' });
      toast.error('حدث خطأ أثناء إضافة الاختبار');
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTest: async (id: string, name: string, maxGrade: number) => {
    try {
      set({ isLoading: true });
      const { error } = await supabase
        .from('tests')
        .update({ name, maxgrade: maxGrade })
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        tests: state.tests.map((test) =>
          test.id === id ? { ...test, name, maxGrade } : test
        )
      }));
      
      toast.success('تم تحديث بيانات الاختبار بنجاح');
    } catch (error) {
      console.error('Error updating test:', error);
      set({ error: 'حدث خطأ أثناء تحديث بيانات الاختبار' });
      toast.error('حدث خطأ أثناء تحديث بيانات الاختبار');
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTest: async (id: string) => {
    try {
      set({ isLoading: true });
      
      // First, delete all grades for this test
      const { error: gradesError } = await supabase
        .from('grades')
        .delete()
        .eq('testid', id);
        
      if (gradesError) throw gradesError;
      
      // Then delete the test
      const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update the local state
      set((state) => ({
        tests: state.tests.filter((test) => test.id !== id),
        grades: state.grades.filter((grade) => grade.testId !== id)
      }));
      
      toast.success('تم حذف الاختبار بنجاح');
    } catch (error) {
      console.error('Error deleting test:', error);
      set({ error: 'حدث خطأ أثناء حذف الاختبار' });
      toast.error('حدث خطأ أثناء حذف الاختبار');
    } finally {
      set({ isLoading: false });
    }
  },

  // Grade operations
  updateGrade: async (studentId: string, testId: string, value: number) => {
    try {
      set({ isLoading: true });
      
      // Check if the grade already exists
      const existingGrade = get().grades.find(
        (g) => g.studentId === studentId && g.testId === testId
      );
      
      let data;
      let error;
      
      if (existingGrade) {
        // Update existing grade
        const { data: updateData, error: updateError } = await supabase
          .from('grades')
          .update({ value })
          .eq('id', existingGrade.id)
          .select()
          .single();
          
        data = updateData;
        error = updateError;
      } else {
        // Create new grade
        const { data: insertData, error: insertError } = await supabase
          .from('grades')
          .insert([{ 
            studentid: studentId, 
            testid: testId, 
            value 
          }])
          .select()
          .single();
          
        data = insertData;
        error = insertError;
      }
      
      if (error) throw error;
      
      if (data) {
        // Convert from DB format to our model
        const newGrade = {
          ...data,
          studentId: data.studentid,
          testId: data.testid
        };
        
        set((state) => {
          // Filter out the existing grade if it exists
          const filteredGrades = state.grades.filter(
            (g) => !(g.studentId === studentId && g.testId === testId)
          );
          
          return {
            grades: [...filteredGrades, newGrade]
          };
        });
      }
      
      toast.success('تم حفظ الدرجة بنجاح');
    } catch (error) {
      console.error('Error updating grade:', error);
      set({ error: 'حدث خطأ أثناء حفظ الدرجة' });
      toast.error('حدث خطأ أثناء حفظ الدرجة');
    } finally {
      set({ isLoading: false });
    }
  },

  // Helper functions
  getFormattedStudents: function() {
    const { students, tests, grades } = get();
    
    const result: FormattedStudent[] = [];
    
    for (const student of students) {
      const studentGrades: Record<string, number | null> = {};
      let total = 0;
      let maxPossible = 0;
      
      for (const test of tests) {
        const grade = grades.find(g => g.studentId === student.id && g.testId === test.id);
        studentGrades[test.id] = grade ? grade.value : null;
        
        if (grade) {
          total += grade.value;
          maxPossible += test.maxGrade;
        }
      }
      
      result.push({
        id: student.id,
        name: student.name,
        grades: studentGrades,
        total,
        maxPossible
      });
    }
    
    return result;
  },
  
  getTotalMaxGrade: (): number => {
    return get().tests.reduce((sum, test) => sum + test.maxGrade, 0);
  }
}));

// Export the store hook
export default useGradeStore;
