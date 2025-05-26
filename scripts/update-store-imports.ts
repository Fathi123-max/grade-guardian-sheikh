// This script updates all imports from the old store location to the new one
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// List of files that import the store
const filesToUpdate = [
  'src/pages/Index.tsx',
  'components/StudentForm.tsx',
  'components/StudentTable.tsx',
  'components/TestManagement.tsx',
  'components/GradeEntry.tsx',
  'components/ExportButtons.tsx',
];

// Update each file
filesToUpdate.forEach(filePath => {
  try {
    const fullPath = join(process.cwd(), 'src', filePath);
    let content = readFileSync(fullPath, 'utf-8');
    
    // Replace the import statement
    content = content.replace(
      /from ["']@?\/store\/store["']/g,
      'from "@/store/useGradeStore"'
    );
    
    // Replace the hook name if it's imported as a named import
    content = content.replace(
      /import\s*\{\s*useStore\s*\}/,
      'import { useGradeStore as useStore }'
    );
    
    writeFileSync(fullPath, content, 'utf-8');
    console.log(`✅ Updated ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error);
  }
});

console.log('\n🎉 All store imports have been updated!');
