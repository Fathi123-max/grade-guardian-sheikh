
import React, { useState } from "react";
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
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit } from "lucide-react";
import { Test } from "@/types";
import { useStore } from "@/store/store";

// Validation schema for test form
const testFormSchema = z.object({
  name: z.string().min(1, { message: "اسم الاختبار مطلوب" }),
  maxGrade: z.coerce.number().min(1, { message: "يجب أن تكون الدرجة القصوى 1 على الأقل" })
});

type TestFormValues = z.infer<typeof testFormSchema>;

const TestManagement: React.FC = () => {
  const { tests, addTest, updateTest, deleteTest } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      name: "",
      maxGrade: 1  // Changed initial value from 100 to 1
    }
  });
  
  const onSubmit = async (values: TestFormValues) => {
    if (editingTest) {
      await updateTest(editingTest.id, values.name, values.maxGrade);
    } else {
      await addTest(values.name, values.maxGrade);
    }
    resetAndCloseDialog();
  };
  
  const resetAndCloseDialog = () => {
    setEditingTest(null);
    form.reset({ name: "", maxGrade: 1 });  // Changed reset value from 100 to 1
    setDialogOpen(false);
  };
  
  const handleEditTest = (test: Test) => {
    form.reset({
      name: test.name,
      maxGrade: test.maxGrade
    });
    setEditingTest(test);
    setDialogOpen(true);
  };
  
  const handleDeleteClick = (test: Test) => {
    setTestToDelete(test);
    setDeleteAlertOpen(true);
  };
  
  const confirmDelete = async () => {
    if (testToDelete) {
      await deleteTest(testToDelete.id);
      setTestToDelete(null);
    }
    setDeleteAlertOpen(false);
  };
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">الاختبارات</h2>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { form.reset(); setEditingTest(null); }}>
              <Plus className="ml-2 h-4 w-4 rtl-flip" />
              إضافة اختبار جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingTest ? "تعديل الاختبار" : "إضافة اختبار جديد"}</DialogTitle>
              <DialogDescription>
                أدخل اسم الاختبار والدرجة القصوى.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الاختبار</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: اختبار الحديث الأول" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxGrade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الدرجة القصوى</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetAndCloseDialog}>
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingTest ? "تحديث" : "إضافة"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tests.map(test => (
          <div key={test.id} className="bg-white rounded-lg shadow p-4 border">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{test.name}</h3>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditTest(test)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(test)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <p className="text-gray-600">الدرجة القصوى: {test.maxGrade}</p>
          </div>
        ))}
      </div>
      
      {tests.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          لا توجد اختبارات مضافة. أضف اختبارًا جديدًا.
        </div>
      )}
      
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الاختبار "{testToDelete?.name}" وجميع درجات الطلاب المرتبطة به بشكل نهائي.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestManagement;
