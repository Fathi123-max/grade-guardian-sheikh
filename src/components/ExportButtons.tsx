
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, FileDown } from "lucide-react";
import { useStore } from "@/store/store";
import { exportToCSV, exportToPDF } from "@/utils/exportUtils";

const ExportButtons: React.FC = () => {
  const { tests, getFormattedStudents } = useStore();
  
  const handleExportCSV = () => {
    const students = getFormattedStudents();
    exportToCSV(students, tests);
  };
  
  const handleExportPDF = () => {
    const students = getFormattedStudents();
    exportToPDF(students, tests);
  };
  
  return (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        onClick={handleExportPDF}
        className="order-last"
      >
        <FileDown className="ml-2 h-4 w-4" />
        تصدير PDF
      </Button>
      
      <Button 
        variant="outline" 
        onClick={handleExportCSV}
      >
        <FileText className="ml-2 h-4 w-4" />
        تصدير CSV
      </Button>
    </div>
  );
};

export default ExportButtons;
