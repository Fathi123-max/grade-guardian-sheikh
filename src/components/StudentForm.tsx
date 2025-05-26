
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GradeEntry from "./GradeEntry";
import { Student } from "@/types";
import { useStore } from "@/store/store";

// Validation schema
const studentFormSchema = z.object({
  name: z.string().min(1, { message: "اسم الطالب مطلوب" }),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student;
  studentGrades?: Record<string, number>;
}

const StudentForm: React.FC<StudentFormProps> = ({
  open,
  onOpenChange,
  student,
  studentGrades = {},
}) => {
  const { addStudent, updateStudent } = useStore();
  const [activeTab, setActiveTab] = React.useState("info");
  const isEditing = !!student;

  // Initialize form with student data if editing
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: student?.name || "",
    },
  });

  // Store student ID for grade entry
  const [studentId, setStudentId] = React.useState<string | null>(
    student?.id || null
  );

  const onSubmit = async (values: StudentFormValues) => {
    if (isEditing && student) {
      await updateStudent(student.id, values.name);
      // Stay on the same dialog but show a success message
    } else {
      const newStudent = await addStudent(values.name);
      if (newStudent) {
        setStudentId(newStudent.id);
        // Switch to grades tab if it's a new student
        setActiveTab("grades");
      }
    }
  };

  const handleClose = () => {
    form.reset();
    setStudentId(null);
    setActiveTab("info");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "قم بتعديل بيانات الطالب أو درجاته."
              : "أدخل اسم الطالب ثم أضف درجاته في الاختبارات."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="info">البيانات الشخصية</TabsTrigger>
            <TabsTrigger 
              value="grades" 
              disabled={!isEditing && !studentId}
            >
              الدرجات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الطالب</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: أحمد محمد" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {isEditing ? "تحديث" : "إضافة"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="grades">
            {(studentId || student) && (
              <div className="space-y-6">
                <GradeEntry 
                  studentId={studentId || student?.id || ""} 
                  initialGrades={studentGrades}
                />

                <DialogFooter>
                  <Button onClick={handleClose}>تم</Button>
                </DialogFooter>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default StudentForm;
