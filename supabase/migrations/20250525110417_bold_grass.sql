/*
  # Add user_id to tables

  1. Changes
    - Add user_id column to students, tests, and grades tables
    - Add foreign key constraints to user_id columns
    - Enable RLS on all tables
    - Add RLS policies for data access

  2. Security
    - Enable RLS on all tables
    - Add policies to ensure users can only access their own data
*/

-- Add user_id column to students table
ALTER TABLE students 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add user_id column to tests table
ALTER TABLE tests 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Create policies for students table
CREATE POLICY "Users can view their own students"
ON students
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own students"
ON students
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own students"
ON students
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own students"
ON students
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for tests table
CREATE POLICY "Users can view their own tests"
ON tests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tests"
ON tests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tests"
ON tests
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tests"
ON tests
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for grades table
CREATE POLICY "Users can view grades for their students"
ON grades
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM students
    WHERE students.id = grades.studentid
    AND students.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert grades for their students"
ON grades
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM students
    WHERE students.id = grades.studentid
    AND students.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update grades for their students"
ON grades
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM students
    WHERE students.id = grades.studentid
    AND students.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete grades for their students"
ON grades
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM students
    WHERE students.id = grades.studentid
    AND students.user_id = auth.uid()
  )
);