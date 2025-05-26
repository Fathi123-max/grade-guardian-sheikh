import { create } from "zustand";
import { Student, Test, Grade, FormattedStudent } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define state type
type State = {
  students: Student[];
  tests: Test[];
  grades: Grade[];
  isLoading: boolean;
  error: string | null;
};

// Define actions type
type Actions = {
  fetchStudents: (userId: string) => Promise<void>;
  fetchTests: (userId: string) => Promise<void>;
  fetchGrades: (userId: string) => Promise<void>;
  fetchAllData: (userId: string) => Promise<void>;
  addStudent: (name: string, userId: string) => Promise<Student | null>;
  updateStudent: (id: string, name: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addTest: (
    name: string,
    maxGrade: number,
    userId: string
  ) => Promise<Test | null>;
  updateTest: (id: string, name: string, maxGrade: number) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  updateGrade: (
    studentId: string,
    testId: string,
    value: number
  ) => Promise<void>;
  getFormattedStudents: () => FormattedStudent[];
  getTotalMaxGrade: () => number;
};

// Create the store with explicit types
export const useStore = create<State & Actions>((set, get) => ({
  students: [],
  tests: [],
  grades: [],
  isLoading: false,
  error: null,

  // Fetch data
  fetchStudents: async (userId: string) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      set({ students: data || [] });
    } catch (error) {
      console.error("Error fetching students:", error);
      set({ error: "حدث خطأ أثناء تحميل بيانات الطلاب" });
      toast.error("حدث خطأ أثناء تحميل بيانات الطلاب");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTests: async (userId: string) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from("tests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Map database fields to our model
      const mappedData = (data || []).map((item) => ({
        ...item,
        maxGrade: item.maxgrade, // Map maxgrade -> maxGrade
      }));

      set({ tests: mappedData });
    } catch (error) {
      console.error("Error fetching tests:", error);
      set({ error: "حدث خطأ أثناء تحميل بيانات الاختبارات" });
      toast.error("حدث خطأ أثناء تحميل بيانات الاختبارات");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGrades: async (userId: string) => {
    try {
      set({ isLoading: true });

      // First, get all students for this user
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", userId);

      if (studentsError) throw studentsError;

      if (!studentsData || studentsData.length === 0) {
        set({ grades: [] });
        return;
      }

      // Get all grades for these students
      const studentIds = studentsData.map((s) => s.id);
      const { data: gradesData, error: gradesError } = await supabase
        .from("grades")
        .select("*")
        .in("studentid", studentIds);

      if (gradesError) throw gradesError;

      // Map database fields to our model
      const mappedData = (gradesData || []).map((item) => ({
        ...item,
        studentId: item.studentid, // Map studentid -> studentId
        testId: item.testid, // Map testid -> testId
      }));

      set({ grades: mappedData });
    } catch (error) {
      console.error("Error fetching grades:", error);
      set({ error: "حدث خطأ أثناء تحميل بيانات الدرجات" });
      toast.error("حدث خطأ أثناء تحميل بيانات الدرجات");
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
        get().fetchGrades(userId),
      ]);
    } catch (error) {
      console.error("Error fetching all data:", error);
      set({ error: "حدث خطأ أثناء تحميل البيانات" });
      toast.error("حدث خطأ أثناء تحميل البيانات");
    } finally {
      set({ isLoading: false });
    }
  },

  // Student operations
  addStudent: async (name: string, userId: string) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from("students")
        .insert({ name, user_id: userId })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        students: [...state.students, data],
      }));

      toast.success("تم إضافة الطالب بنجاح");
      return data;
    } catch (error) {
      console.error("Error adding student:", error);
      set({ error: "حدث خطأ أثناء إضافة الطالب" });
      toast.error("حدث خطأ أثناء إضافة الطالب");
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  updateStudent: async (id: string, name: string) => {
    try {
      set({ isLoading: true });
      const { error } = await supabase
        .from("students")
        .update({ name })
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        students: state.students.map((student) =>
          student.id === id ? { ...student, name } : student
        ),
      }));

      toast.success("تم تحديث بيانات الطالب بنجاح");
    } catch (error) {
      console.error("Error updating student:", error);
      set({ error: "حدث خطأ أثناء تحديث بيانات الطالب" });
      toast.error("حدث خطأ أثناء تحديث بيانات الطالب");
    } finally {
      set({ isLoading: false });
    }
  },

  deleteStudent: async (id: string) => {
    try {
      set({ isLoading: true });

      // First delete related grades
      const { error: gradesError } = await supabase
        .from("grades")
        .delete()
        .eq("studentid", id);

      if (gradesError) throw gradesError;

      // Then delete the student
      const { error } = await supabase.from("students").delete().eq("id", id);

      if (error) throw error;

      set((state) => ({
        students: state.students.filter((student) => student.id !== id),
        grades: state.grades.filter((grade) => grade.studentId !== id),
      }));

      toast.success("تم حذف الطالب بنجاح");
    } catch (error) {
      console.error("Error deleting student:", error);
      set({ error: "حدث خطأ أثناء حذف الطالب" });
      toast.error("حدث خطأ أثناء حذف الطالب");
    } finally {
      set({ isLoading: false });
    }
  },
  addTest: async (name: string, maxGrade: number, userId: string) => {
    try {
      set({ isLoading: true });

      // Get the current session to verify user
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("No active session");
      }

      // Use the user ID from the session
      const currentUserId = session.user.id;

      const { data, error } = await supabase
        .from("tests")
        .insert({
          name,
          maxgrade: maxGrade,
          user_id: currentUserId, // Make sure this matches the column name in your database
        })
        .select()
        .single();

      if (error) throw error;

      const newTest = {
        ...data,
        maxGrade: data.maxgrade,
      };

      set((state) => ({
        tests: [...state.tests, newTest],
      }));

      toast.success("تم إضافة الاختبار بنجاح");
      return newTest;
    } catch (error) {
      console.error("Error adding test:", error);
      const errorMessage = error.message.includes("row-level security")
        ? "خطأ في الصلاحيات. يرجى التأكد من تسجيل الدخول بشكل صحيح."
        : "حدث خطأ أثناء إضافة الاختبار";

      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  updateTest: async (id: string, name: string, maxGrade: number) => {
    try {
      set({ isLoading: true });
      const { error } = await supabase
        .from("tests")
        .update({ name, maxgrade: maxGrade }) // Use maxgrade (lowercase) to match DB column name
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        tests: state.tests.map((test) =>
          test.id === id ? { ...test, name, maxGrade } : test
        ),
      }));

      toast.success("تم تحديث بيانات الاختبار بنجاح");
    } catch (error) {
      console.error("Error updating test:", error);
      set({ error: "حدث خطأ أثناء تحديث بيانات الاختبار" });
      toast.error("حدث خطأ أثناء تحديث بيانات الاختبار");
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTest: async (id: string) => {
    try {
      set({ isLoading: true });

      // First delete related grades
      const { error: gradesError } = await supabase
        .from("grades")
        .delete()
        .eq("testid", id);

      if (gradesError) throw gradesError;

      // Then delete the test
      const { error } = await supabase.from("tests").delete().eq("id", id);

      if (error) throw error;

      set((state) => ({
        tests: state.tests.filter((test) => test.id !== id),
        grades: state.grades.filter((grade) => grade.testId !== id),
      }));

      toast.success("تم حذف الاختبار بنجاح");
    } catch (error) {
      console.error("Error deleting test:", error);
      set({ error: "حدث خطأ أثناء حذف الاختبار" });
      toast.error("حدث خطأ أثناء حذف الاختبار");
    } finally {
      set({ isLoading: false });
    }
  },

  // Grade operations
  updateGrade: async (studentId: string, testId: string, value: number) => {
    try {
      set({ isLoading: true });

      // Check if a grade record already exists
      const existingGrade = get().grades.find(
        (g) => g.studentId === studentId && g.testId === testId
      );

      if (existingGrade) {
        // Update existing grade
        const { error } = await supabase
          .from("grades")
          .update({ value })
          .eq("id", existingGrade.id);

        if (error) throw error;

        set((state) => ({
          grades: state.grades.map((grade) =>
            grade.id === existingGrade.id ? { ...grade, value } : grade
          ),
        }));
      } else {
        // Create new grade
        const { data, error } = await supabase
          .from("grades")
          .insert({
            studentid: studentId, // Use studentid (lowercase) to match DB column name
            testid: testId, // Use testid (lowercase) to match DB column name
            value,
          })
          .select()
          .single();

        if (error) throw error;

        // Convert from DB format to our model format
        const newGrade = {
          ...data,
          studentId: data.studentid,
          testId: data.testid,
        };

        set((state) => ({
          grades: [...state.grades, newGrade],
        }));
      }

      toast.success("تم حفظ الدرجة بنجاح");
    } catch (error) {
      console.error("Error updating grade:", error);
      set({ error: "حدث خطأ أثناء حفظ الدرجة" });
      toast.error("حدث خطأ أثناء حفظ الدرجة");
    } finally {
      set({ isLoading: false });
    }
  },

  // Helper functions
  getFormattedStudents: function () {
    const { students, tests, grades } = get();

    const result: FormattedStudent[] = [];

    for (const student of students) {
      const studentGrades: Record<string, number | null> = {};
      let total = 0;
      let maxPossible = 0;

      for (const test of tests) {
        const grade = grades.find(
          (g) => g.studentId === student.id && g.testId === test.id
        );
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
        maxPossible,
      });
    }

    return result;
  },

  getTotalMaxGrade: (): number => {
    return get().tests.reduce(
      (sum: number, test: Test) => sum + test.maxGrade,
      0
    );
  },
}));
