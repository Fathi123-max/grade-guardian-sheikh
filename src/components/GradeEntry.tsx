
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import { Test } from "@/types";
import { useStore } from "@/store/store";

interface GradeEntryProps {
  studentId: string;
  initialGrades?: Record<string, number>;
}

const GradeEntry: React.FC<GradeEntryProps> = ({ studentId, initialGrades = {} }) => {
  const { tests, updateGrade } = useStore();
  const [grades, setGrades] = React.useState<Record<string, number>>(initialGrades);
  
  // Calculate total grades
  const totalGrade = Object.values(grades).reduce((sum, grade) => sum + grade, 0);
  
  // Calculate total possible maximum grade for tests with recorded grades
  const totalMaxGrade = tests
    .filter(test => grades[test.id] !== undefined)
    .reduce((sum, test) => sum + test.maxGrade, 0);
  
  const handleGradeChange = (testId: string, value: string) => {
    // Convert to number and ensure it's within valid range
    const numValue = Number(value);
    const test = tests.find(t => t.id === testId);
    
    if (!test) return;
    
    // Ensure value is between 0 and maxGrade
    const validValue = Math.min(Math.max(0, numValue), test.maxGrade);
    
    setGrades(prev => ({
      ...prev,
      [testId]: validValue
    }));
    
    // Update in database
    updateGrade(studentId, testId, validValue);
  };
  
  const incrementGrade = (testId: string) => {
    const test = tests.find(t => t.id === testId);
    if (!test) return;
    
    const currentGrade = grades[testId] || 0;
    if (currentGrade < test.maxGrade) {
      const newGrade = currentGrade + 1;
      setGrades(prev => ({
        ...prev,
        [testId]: newGrade
      }));
      updateGrade(studentId, testId, newGrade);
    }
  };
  
  const decrementGrade = (testId: string) => {
    const currentGrade = grades[testId] || 0;
    if (currentGrade > 0) {
      const newGrade = currentGrade - 1;
      setGrades(prev => ({
        ...prev,
        [testId]: newGrade
      }));
      updateGrade(studentId, testId, newGrade);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map(test => (
          <Card key={test.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-3">
                <div className="font-medium text-lg">{test.name}</div>
                <div className="text-sm text-muted-foreground">الدرجة القصوى: {test.maxGrade}</div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => decrementGrade(test.id)}
                    disabled={(grades[test.id] || 0) <= 0}
                    className="order-last"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={grades[test.id] !== undefined ? grades[test.id] : test.maxGrade}
                    onChange={(e) => handleGradeChange(test.id, e.target.value)}
                    min={0}
                    max={test.maxGrade}
                    className="w-20 text-center"
                  />
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => incrementGrade(test.id)}
                    disabled={(grades[test.id] || 0) >= test.maxGrade}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {tests.length > 0 && (
        <div className="bg-muted p-4 rounded-lg mt-6">
          <div className="text-lg font-medium">المجموع</div>
          <div className="flex items-center justify-between mt-2">
            <div>مجموع الدرجات:</div>
            <div className="font-bold">{totalGrade} / {totalMaxGrade}</div>
          </div>
          {totalMaxGrade > 0 && (
            <div className="flex items-center justify-between mt-2">
              <div>النسبة المئوية:</div>
              <div className="font-bold">{Math.round((totalGrade / totalMaxGrade) * 100)}%</div>
            </div>
          )}
        </div>
      )}
      
      {tests.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          لا توجد اختبارات مضافة. الرجاء إضافة اختبار أولاً.
        </div>
      )}
    </div>
  );
};

export default GradeEntry;
