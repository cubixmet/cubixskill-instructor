import { DynamicFieldItem } from '../../../types/certificate.types';

export const BASE_DYNAMIC_FIELDS: DynamicFieldItem[] = [
  // STUDENT
  {
    key: 'student.full_name',
    label: 'Student Full Name',
    group: 'student',
    sampleValue: 'Rahul Kumar',
    description: 'Enrolled student full legal name',
  },
  {
    key: 'student.student_id',
    label: 'Student ID',
    group: 'student',
    sampleValue: 'STD-2026-8841',
    description: 'Unique student identification code',
  },
  {
    key: 'student.email',
    label: 'Student Email',
    group: 'student',
    sampleValue: 'rahul.kumar@example.com',
    description: 'Student registered email address',
  },

  // COURSE
  {
    key: 'course.name',
    label: 'Course Name',
    group: 'course',
    sampleValue: 'Fullstack React 19 & TypeScript Masterclass',
    description: 'Title of the completed course',
  },
  {
    key: 'course.completed_at',
    label: 'Course Completion Date',
    group: 'course',
    sampleValue: 'August 11, 2026',
    description: 'Date the student completed all requirements',
  },
  {
    key: 'course.start_date',
    label: 'Course Start Date',
    group: 'course',
    sampleValue: 'January 15, 2026',
    description: 'Date the student enrolled or course started',
  },
  {
    key: 'course.instructor_name',
    label: 'Instructor Name',
    group: 'course',
    sampleValue: 'Dr. Rajesh Varma',
    description: 'Primary course instructor or director name',
  },

  // PROGRESS / RESULTS
  {
    key: 'result.completion_percentage',
    label: 'Course Completion Percentage',
    group: 'progress',
    sampleValue: '100%',
    description: 'Total course curriculum completion percentage',
  },
  {
    key: 'result.overall_percentage',
    label: 'Overall Score / Percentage',
    group: 'progress',
    sampleValue: '87%',
    description: 'Weighted overall course grade percentage',
  },
  {
    key: 'result.grade',
    label: 'Grade',
    group: 'progress',
    sampleValue: 'A+',
    description: 'Final letter grade evaluated for the student',
  },
  {
    key: 'result.pass_status',
    label: 'Result / Pass Status',
    group: 'progress',
    sampleValue: 'PASSED WITH DISTINCTION',
    description: 'Final result status indicator',
  },

  // CERTIFICATE
  {
    key: 'certificate.number',
    label: 'Certificate Number',
    group: 'certificate',
    sampleValue: 'CERT-2026-8841',
    description: 'Unique verifiable certificate reference number',
  },
  {
    key: 'certificate.issue_date',
    label: 'Issue Date',
    group: 'certificate',
    sampleValue: 'August 11, 2026',
    description: 'Official date the certificate was generated',
  },
  {
    key: 'certificate.verification_code',
    label: 'Verification Code',
    group: 'certificate',
    sampleValue: 'V-CBX-99824',
    description: 'Public verification hash code',
  },
];

/**
 * Derives available dynamic fields for a specific course context.
 * Dynamically injects course-specific assignments and quizzes.
 */
export const getAvailableFieldsForCourse = (
  courseTitle?: string,
  _courseUuid?: string
): DynamicFieldItem[] => {
  const fields = [...BASE_DYNAMIC_FIELDS];

  // If a specific course title is provided, update sampleValue
  if (courseTitle) {
    const courseIndex = fields.findIndex((f) => f.key === 'course.name');
    if (courseIndex !== -1) {
      fields[courseIndex] = { ...fields[courseIndex], sampleValue: courseTitle };
    }
  }

  // Generate course-specific assessment fields based on course
  const assessmentFields: DynamicFieldItem[] = [
    {
      key: 'assessment.final_project.mark',
      label: 'Final Capstone Project — Mark',
      group: 'assessments',
      sampleValue: '95 / 100',
      description: 'Raw marks obtained in the final capstone project',
    },
    {
      key: 'assessment.final_project.percentage',
      label: 'Final Capstone Project — Percentage',
      group: 'assessments',
      sampleValue: '95%',
      description: 'Percentage scored in the final capstone project',
    },
    {
      key: 'assessment.midterm_quiz.percentage',
      label: 'Midterm Quiz — Percentage',
      group: 'assessments',
      sampleValue: '88%',
      description: 'Quiz score percentage',
    },
    {
      key: 'assessment.final_exam.percentage',
      label: 'Final Assessment — Percentage',
      group: 'assessments',
      sampleValue: '91%',
      description: 'Final exam score percentage',
    },
  ];

  return [...fields, ...assessmentFields];
};

/**
 * Certificate-friendly student display name formatter.
 * Formats student full name for certificates without initial dots or title prefixes.
 */
export const formatCertificateStudentName = (rawName: string): string => {
  if (!rawName) return '';
  const cleaned = rawName.replace(/^[A-Za-z]\.\s+/, '').trim();
  return cleaned || rawName;
};

/**
 * Resolves a dynamic field key against student/course data.
 * Safe fallback prevents undefined/null/NaN rendering.
 */
export const resolveFieldValue = (
  key: string,
  sampleOverrides?: Record<string, string>,
  studentContext?: {
    name?: string;
    studentId?: string;
    email?: string;
    courseName?: string;
    completionDate?: string;
    instructorName?: string;
    overallPercentage?: number;
    grade?: string;
    certificateNumber?: string;
  }
): string => {
  if (sampleOverrides && sampleOverrides[key] !== undefined) {
    return sampleOverrides[key];
  }

  if (studentContext) {
    if (key === 'student.full_name' && studentContext.name) {
      return formatCertificateStudentName(studentContext.name);
    }
    if (key === 'student.student_id' && studentContext.studentId) return studentContext.studentId;
    if (key === 'student.email' && studentContext.email) return studentContext.email;
    if (key === 'course.name' && studentContext.courseName) return studentContext.courseName;
    if (key === 'course.completed_at' && studentContext.completionDate) return studentContext.completionDate;
    if (key === 'course.instructor_name' && studentContext.instructorName) return studentContext.instructorName;
    if (key === 'result.overall_percentage' && studentContext.overallPercentage !== undefined) {
      return `${Math.round(studentContext.overallPercentage)}%`;
    }
    if (key === 'result.grade' && studentContext.grade) return studentContext.grade;
    if (key === 'certificate.number' && studentContext.certificateNumber) return studentContext.certificateNumber;
  }

  // Lookup in base sample values
  const found = BASE_DYNAMIC_FIELDS.find((f) => f.key === key);
  if (found) return found.sampleValue;

  if (key.includes('percentage')) return '87%';
  if (key.includes('mark')) return '92 / 100';

  return 'Sample Value';
};
