
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { Edit, Trash2 } from "lucide-react";
import { Student, Test } from "@/types";
import { useStore } from "@/store/store";
import StudentForm from "./StudentForm";

const StudentTable: React.FC = () => {
  const { students, tests, grades, deleteStudent, getFormattedStudents } = useStore();
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentGrades, setStudentGrades] = useState<Record<string, number>>({});
  
  const formattedStudents = getFormattedStudents();
  
  const handleEditClick = (student: Student) => {
    // Create a dictionary of testId -> grade for this student
    const studentGradesMap: Record<string, number> = {};
    
    grades
      .filter(g => g.studentId === student.id)
      .forEach(g => {
        studentGradesMap[g.testId] = g.value;
      });
    
    setStudentToEdit(student);
    setStudentGrades(studentGradesMap);
    setEditDialogOpen(true);
  };
  
  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setDeleteAlertOpen(true);
  };
  
  const confirmDelete = async () => {
    if (studentToDelete) {
      await deleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
    setDeleteAlertOpen(false);
  };
  
  return (
    <div className="rounded-md border shadow">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky right-0 bg-background">الطالب</TableHead>
              {tests.map(test => (
                <TableHead key={test.id} className="text-center">
                  <div>{test.name}</div>
                  <div className="text-xs text-muted-foreground">({test.maxGrade})</div>
                </TableHead>
              ))}
              <TableHead className="text-center">المجموع</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formattedStudents.length > 0 ? (
              formattedStudents.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium sticky right-0 bg-background">
                    {student.name}
                  </TableCell>
                  {tests.map(test => (
                    <TableCell key={test.id} className="text-center">
                      {student.grades[test.id] !== null ? student.grades[test.id] : "-"}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold">
                    {student.total}
                    {student.maxPossible > 0 && (
                      <span className="text-xs font-normal text-muted-foreground mr-1">
                        ({Math.round((student.total / student.maxPossible) * 100)}%)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(student)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(student)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tests.length + 3}
                  className="h-24 text-center"
                >
                  لا يوجد طلاب. الرجاء إضافة طلاب.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الطالب "{studentToDelete?.name}" وجميع درجاته بشكل نهائي.
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
      
      {/* Edit Student Dialog */}
      <StudentForm
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        student={studentToEdit || undefined}
        studentGrades={studentGrades}
      />
    </div>
  );
};

export default StudentTable;
