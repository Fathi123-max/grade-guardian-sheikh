
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Test, FormattedStudent } from "../types";

// Utility to export data as CSV with UTF-8 BOM for proper Arabic support
export const exportToCSV = (students: FormattedStudent[], tests: Test[]) => {
  // Add UTF-8 BOM for proper Arabic support
  let csvContent = "\uFEFF";
  
  // Add header row
  csvContent += "الاسم,";
  tests.forEach(test => {
    csvContent += `${test.name} (${test.maxGrade}),`;
  });
  csvContent += "المجموع\n";
  
  // Add data rows
  students.forEach(student => {
    csvContent += `${student.name},`;
    tests.forEach(test => {
      const grade = student.grades[test.id] !== null ? student.grades[test.id] : "-";
      csvContent += `${grade},`;
    });
    csvContent += `${student.total}\n`;
  });
  
  // Create a Blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "درجات_الطلاب.csv";
  link.click();
};

// Base64-encoded Amiri font (this is a placeholder - actual Base64 would be much longer)
// In production, we would include the full Base64-encoded Amiri font
const amiriFont = "PLACEHOLDER_FOR_AMIRI_FONT_BASE64_STRING";

// Utility to export data as PDF with Arabic support using jsPDF
export const exportToPDF = (students: FormattedStudent[], tests: Test[]) => {
  // Create a new PDF document with RTL support
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });
  
  // Add Amiri font for Arabic support
  // In a real implementation, we would add the actual Amiri font here
  // doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
  // doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  // doc.setFont("Amiri");
  
  // Set RTL mode
  doc.setR2L(true);
  
  // Define table headers
  const headers = [["الاسم", ...tests.map(t => t.name), "المجموع"]];
  
  // Define table body data
  const data = students.map(student => [
    student.name,
    ...tests.map(test => (student.grades[test.id] !== null ? student.grades[test.id]!.toString() : "-")),
    student.total.toString()
  ]);
  
  // Generate table with auto-table plugin
  autoTable(doc, {
    head: headers,
    body: data,
    theme: "grid",
    headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255] },
    styles: {
      font: "courier", // We would use 'Amiri' in production
      fontStyle: "normal",
      fontSize: 10,
      cellPadding: 5,
      halign: "right",
      valign: "middle"
    },
    margin: { top: 20 },
  });
  
  // Add title
  doc.text("سجل درجات الطلاب", doc.internal.pageSize.width / 2, 10, { align: "center" });
  
  // Save PDF
  doc.save("درجات_الطلاب.pdf");
};
