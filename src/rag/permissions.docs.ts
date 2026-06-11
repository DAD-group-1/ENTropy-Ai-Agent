export const PERMISSION_DOCS = [
  // ──────────────────────────────────────────
  // COURSES
  // ──────────────────────────────────────────
  {
    id: 'courses-read',
    roles: ['student', 'instructor', 'admin'],
    keywords: [
      'course',
      'courses',
      'list courses',
      'view course',
      'find course',
      'search course',
      'course details',
      'course info',
    ],
    content: `
      All users (students, instructors, admins) can browse and view courses.
      - Use list_courses to get a paginated list of all available courses.
      - Use get_course with a courseId to retrieve details for a specific course.
    `,
  },
  {
    id: 'courses-create',
    roles: ['instructor', 'admin'],
    keywords: [
      'create course',
      'add course',
      'new course',
      'make course',
      'course creation',
      'set up course',
    ],
    content: `
      Instructors and admins can create new courses.
      - Use create_course with a title, code, credits, and programId.
      - Description is optional but recommended.
      - The course code must be unique (e.g., CS101, MATH201).
    `,
  },
  {
    id: 'courses-update',
    roles: ['instructor', 'admin'],
    keywords: [
      'update course',
      'edit course',
      'modify course',
      'change course',
      'rename course',
      'course credits',
      'fix course',
    ],
    content: `
      Instructors and admins can update existing courses.
      - Use update_course with the courseId and any fields to change (title, description, credits).
      - Only provide the fields that need updating; others remain unchanged.
    `,
  },
  {
    id: 'courses-delete',
    roles: ['admin'],
    keywords: [
      'delete course',
      'remove course',
      'drop course',
      'archive course',
    ],
    content: `
      Only admins can delete courses.
      - Use delete_course with the courseId to permanently remove a course.
      - This action cannot be undone; confirm with the user before proceeding.
    `,
  },

  // ──────────────────────────────────────────
  // ENROLLMENTS
  // ──────────────────────────────────────────
  {
    id: 'enrollments-read-admin-instructor',
    roles: ['instructor', 'admin'],
    keywords: [
      'list enrollments',
      'all enrollments',
      'view enrollments',
      'enrollment list',
      'enrolled students',
      'who is enrolled',
    ],
    content: `
      Instructors and admins can list and inspect all enrollments.
      - Use list_enrollments for a paginated overview of all enrollments.
      - Use get_enrollment with an enrollmentId for a specific enrollment's details.
      - Use get_student_enrollments with a studentId to see all courses a student is enrolled in.
    `,
  },
  {
    id: 'enrollments-read-student',
    roles: ['student'],
    keywords: [
      'my enrollments',
      'my courses',
      'enrolled courses',
      'what am i enrolled in',
      'check enrollment',
      'view my enrollment',
    ],
    content: `
      Students can view their own enrollments.
      - Use get_student_enrollments with the current user's ID to list all their enrolled courses.
      - Use get_enrollment with a specific enrollmentId to see details like status and grade.
      - Students must only query their own studentId, never another student's.
    `,
  },
  {
    id: 'enrollments-create',
    roles: ['student', 'admin'],
    keywords: [
      'enroll',
      'enrollment',
      'enroll in course',
      'register for course',
      'join course',
      'sign up for course',
    ],
    content: `
      Students can enroll themselves in courses. Admins can enroll any student.
      - Use create_enrollment with a studentId and courseId.
      - Students must only enroll using their own studentId.
      - An optional enrollmentDate can be provided in ISO 8601 format (e.g., 2025-09-01T00:00:00Z).
    `,
  },
  {
    id: 'enrollments-grade',
    roles: ['instructor', 'admin'],
    keywords: [
      'grade',
      'grades',
      'assign grade',
      'update grade',
      'set grade',
      'check grade',
      'view grade',
      'student grade',
      'final grade',
    ],
    content: `
      Instructors and admins can assign or update grades for enrollments.
      - Use update_enrollment with the enrollmentId and a grade field (e.g., "A", "B+", "14/20").
      - The enrollment status can also be updated (e.g., active, completed, dropped).
      - Students cannot modify their own grades.
    `,
  },
  {
    id: 'enrollments-delete',
    roles: ['student', 'admin'],
    keywords: [
      'unenroll',
      'drop course',
      'leave course',
      'remove enrollment',
      'cancel enrollment',
      'withdraw from course',
    ],
    content: `
      Students can unenroll from their own courses. Admins can remove any enrollment.
      - Use delete_enrollment with the enrollmentId to remove the enrollment.
      - Students must only delete their own enrollments, never another student's.
    `,
  },

  // ──────────────────────────────────────────
  // NOTIFICATIONS
  // ──────────────────────────────────────────
  {
    id: 'notifications-broadcast',
    roles: ['instructor', 'admin'],
    keywords: [
      'send notification',
      'broadcast',
      'notify students',
      'send message',
      'announcement',
      'alert',
      'notify all',
      'send alert',
      'class announcement',
    ],
    content: `
      Instructors and admins can send notifications to specific users or broadcast to everyone.
      - Use send_broadcast_notification with a title and message.
      - To target specific users, provide a userIds array with their user IDs.
      - Leave userIds empty to broadcast to all users in the system.
      - Use the type field to categorize the notification (e.g., "announcement", "alert").
      - Students cannot send notifications.
    `,
  },

  // ──────────────────────────────────────────
  // Users
  // ──────────────────────────────────────────
  {
    id: 'users-read-self',
    roles: ['any'],
    keywords: [
      'my profile',
      'my account',
      'my information',
      'my details',
      'my user',
      'who am i',
      'current user',
    ],
    content: `
    Any user can access information about their own account.
    - Use get_user_information only when requesting information about the current authenticated user.
  `,
  },
  {
    id: 'users-read-all',
    roles: ['instructor', 'admin'],
    keywords: [
      'all users',
      'user directory',
      'list students',
      'list instructors',
      'find user',
      'search user',
      'user lookup',
    ],
    content: `
    Instructors and administrators can browse and search users.
    - Use list_users to retrieve paginated user records.
    - Use search_users to find users matching specific criteria.
    - Use get_user with a userId to retrieve detailed information about a user.
  `,
  },
];
