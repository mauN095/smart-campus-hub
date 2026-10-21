
/*
 * Page Registry:
 * Maps each page key (used by PAGES in shell.js)
 * to the correct screen for the logged-in role.
 */

'use strict';

/* ---------- Page Registry ---------- */

const P = {};

const byRole = (m) => () =>
    (m[role] || m.student)();

/* ---------- Role-Specific Screens ---------- */

P.dash = byRole({
    admin: adminDashboard,
    faculty: facultyDashboard,
    student: studentDashboard
});

P.prof = byRole({
    admin: adminProfile,
    faculty: facultyProfile,
    student: studentProfile
});

/* ---------- Student Screens ---------- */

P.enr = studentEnrollment;

/* ---------- Faculty Screens ---------- */

P.load = facultyWorkload;

/* ---------- Shared Screens (Student + Faculty) ---------- */

P.ann = announcementsScreen;
P.req = serviceRequestsScreen;

/* ---------- Admin Screens ---------- */

P.stu = adminStudents;
P.stuD = adminStudentDetail;

P.fac = adminFaculty;
P.facD = adminFacultyDetail;

P.annA = adminAnnouncements;
P.annF = adminAnnouncementForm;

P.rq = adminServiceRequests;
P.rep = adminReports;
P.mt = adminMaintenance;
