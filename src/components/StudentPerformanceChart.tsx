import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { Student, Grade } from '@/types';

interface StudentPerformanceChartProps {
  students: Student[];
  grades: Grade[];
  tests: any[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const StudentPerformanceChart: React.FC<StudentPerformanceChartProps> = ({
  students,
  grades,
  tests,
}) => {
  // Prepare data for the chart
  const chartData = students.map((student, index) => {
    const studentGrades = grades.filter(g => g.studentId === student.id);
    const studentAverage = studentGrades.length > 0
      ? Number((studentGrades.reduce((sum, g) => sum + g.value, 0) / studentGrades.length).toFixed(1))
      : 0;
      
    return {
      name: student.name,
      average: studentAverage,
      color: COLORS[index % COLORS.length],
    };
  });

  // Sort by average grade (highest first)
  const sortedData = [...chartData].sort((a, b) => b.average - a.average);

  // Calculate class average
  const classAverage = chartData.length > 0
    ? Number((chartData.reduce((sum, item) => sum + item.average, 0) / chartData.length).toFixed(1))
    : 0;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-4">مقارنة أداء الطلاب</h3>
      <div className="bg-white rounded-lg border p-4">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{
                top: 20,
                right: 30,
                left: 40,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis 
                type="number" 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100}
                tick={{ fontSize: 14 }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'المعدل']}
                labelFormatter={(name) => `الطالب: ${name}`}
              />
              <Legend />
              <Bar 
                dataKey="average" 
                name="المعدل"
                radius={[0, 4, 4, 0]}
              >
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList 
                  dataKey="average" 
                  position="right" 
                  formatter={(value: number) => `${value}%`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          متوسط الفصل: <span className="font-medium">{classAverage}%</span>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformanceChart;
