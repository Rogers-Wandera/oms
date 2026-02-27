# Office Management System - Process Flow Analysis

**Last Updated:** February 7, 2026  
**System Version:** 0.1.0  
**Tech Stack:** Next.js 15 + Neon PostgreSQL + NextAuth.js + Mantine UI

---

## 1. AUTHENTICATION & USER ROLES

### ✅ WORKING

- **Role-Based Access Control (RBAC)**
  - 4 Role Types: ADMIN, SUPERVISOR, MANAGER, USER
  - NextAuth.js credentials provider with session management
  - Protected routes via middleware at `/dashboard`
- **User Authentication Flows**
  - Login page (`/login`) with credentials
  - Forgot password (`/forgot-password`) + Reset password (`/reset-password`)
  - User session tracking with `userSessions` table
  - Last login date and online status tracking
- **Auth Audit & Security**
  - Login/logout event logging
  - User lockout mechanism (`lockUser()`, `unlockUser()`)
  - Session invalidation (`invalidateAllUserSessions()`)
  - Auth audit trail (`authAudit` table)
  - Password reset functionality

### ⏳ PENDING

- WebSocket real-time presence detection (components exist but may need optimization)
- Two-factor authentication (2FA) - not implemented
- OAuth integration - only credentials auth currently supported

---

## 2. USER MANAGEMENT (ADMIN FEATURE)

### ✅ WORKING

- **User CRUD Operations**
  - Create users with role, department, and supervisor assignment
  - Edit user details
  - List all users with pagination
  - User status tracking (isLocked, isOnline, lastLoginDate)
- **User Properties**
  - First/Last Name, Email
  - Role, Department, Supervisor assignment
  - Shift assignment (user can be assigned to shifts)
  - Creation date, last login date
  - Online/locked status

- **User Views**
  - Admin Users Page (`/dashboard/admin/users`)
  - User form for create/edit operations
  - Users list with filter/search capability

### ⏳ PENDING

- User profile picture/avatar upload
- User batch import (CSV)
- User deactivation (currently only has isLocked flag)
- Employee status lifecycle management (Active, Inactive, On Leave)

---

## 3. DEPARTMENT MANAGEMENT

### ✅ WORKING

- **Department CRUD**
  - Create departments
  - View all departments
  - Assign users to departments
  - Department-specific reporting

- **Admin Controls**
  - Department management page (`/dashboard/admin/departments`)
  - Create department button and form

### ⏳ PENDING

- Department hierarchies (parent-child relationships)
- Department manager assignment
- Budget/resource allocation per department
- Department-level settings/configurations

---

## 4. SHIFT MANAGEMENT

### ✅ WORKING

- **Shift Operations**
  - Get available shifts (`getShifts()`)
  - Create new shifts with times/schedules
  - Assign shifts to users (`assignShift()`)
  - Delete shifts
- **Time Tracking Integration**
  - Shifts linked to attendance
  - Shift-based work hour calculations

### ⏳ PENDING

- Shift template management (recurring shifts)
- Shift swap/exchange feature
- Shift conflict detection
- Holiday and special date handling
- Shift-based automated absence reporting

---

## 5. ATTENDANCE & TIME TRACKING

### ✅ WORKING

- **Daily Attendance Workflow**
  1. User clicks "Check In" → Records `clockIn` timestamp
  2. System validates:
     - No duplicate check-in for same day
     - Check if user already clocked out (blocked for regular users)
     - Optional shift/extension validation
  3. User clicks "Check Out" → Records `clockOut` timestamp
  4. Attendance record stored with date, clock-in, clock-out times

- **Attendance Features**
  - `getCurrentAttendance()` - get today's attendance
  - `checkIn()` - clock in with current timestamp
  - `checkOut()` - clock out with current timestamp
  - Attendance card UI component with status indicators
  - Weekly hours analytics calculation

- **Access Control**
  - `canAccessSystem()` - validates if user can work based on:
    - User role
    - Lock status
    - Extension approvals
    - Supervisor override rules

- **Dashboard Stats**
  - Monthly attendance count
  - Weekly hours calculation
  - Recent attendance activity

### ⏳ PENDING

- Geolocation-based check-in (GPS validation)
- QR code check-in/out
- Mobile app offline mode
- Attendance approval workflow
- Late arrival/early departure notifications
- Automatic checkout after shift end time

---

## 6. TIME EXTENSIONS (OVERTIME/STAY LATE)

### ✅ WORKING

- **Extension Request Workflow**
  1. User requests extension with:
     - Extended until time
     - Reason for extension
  2. Status: PENDING
  3. Admin reviews and approves/rejects
  4. Stores approval timestamp and admin ID

- **Extension Functions**
  - `requestExtension()` - user submits request
  - `approveExtension()` - admin approves
  - `rejectExtension()` - admin rejects
  - Extension request modal UI component

- **Data Model**
  - `timeExtensions` table with status tracking
  - Linked to user and approver (admin)
  - Date and extension duration tracking

### ⏳ PENDING

- Extension approval workflow UI for admins
- Email notifications for extension requests
- Extension duration limits per policy
- Extension history and analytics
- Auto-expiration of expired extensions
- Time accrual tracking (overtime hours)

---

## 7. TASKS MANAGEMENT

### ✅ WORKING

- **Task Lifecycle**

  ```
  PLANNED → NOT_DONE → DONE (completed)
            (not started)
  ```

- **Task Operations**
  - Create task with title, description, due date, assign to user
  - Create sub-tasks (nested checklist items)
  - Update task status
  - Delete task and sub-tasks
  - Sub-task completion tracking

- **Task Properties**
  - Title, Description, Due Date
  - Assigned To (user)
  - Created By (creator)
  - Task Date (actual work date)
  - Creation/Update dates
  - Status (PLANNED, NOT_DONE, DONE)
  - Sub-tasks list

- **UI Components**
  - Task list with pagination
  - Create task button/form
  - Sub-task toggle and management
  - Status indicators
  - Deadline countdowns

- **Task Locking**
  - Tasks are locked when a submitted daily report exists for that date
  - Prevents task modification after report submission
  - `isTaskLocked()` function validates

- **Task Analytics**
  - Task count by status (completed, in progress, pending)
  - Monthly task completion metrics
  - Supervisor can view team task statistics

### ⏳ PENDING

- Task priority levels (High, Medium, Low)
- Task categories/tags
- Task dependency management
- Task time estimation and tracking
- Task collaboration/comments
- Task reassignment audit trail
- Task templates
- Recurring tasks

---

## 8. DAILY REPORTS

### ✅ WORKING

- **Daily Report Workflow**

  ```
  DRAFT (auto-created) → SUBMITTED (user signs)
    → REVIEWED (supervisor reviews)
    → HEAD_REVIEWED (department head reviews)
    → APPROVED/REJECTED (final decision)
  ```

- **Report Creation**
  - System can auto-generate draft reports
  - User fills: content/accomplishments, adds signature
  - `createReport()` validates no duplicate for date

- **Report Submission**
  - User submits with signature URL
  - Status changes to SUBMITTED
  - Report date locked (tasks become locked)

- **Supervisor Review Phase**
  - `supervisorApproveDailyReport()` - supervisor approves
  - `supervisorRejectDailyReport()` - supervisor rejects with feedback
  - Supervisor can add comments via `addReportComment()`
  - Changes status to REVIEWED

- **Report Comments**
  - Comment threads for feedback
  - Tracked by user who commented
  - Used in feedback loop

- **Report Data**
  - User comment/accomplishments
  - Signature URL
  - Status tracking
  - Creation/Update dates
  - Supervisor/Head signature URLs

- **Report Submissions UI**
  - Daily report submission form on tasks page
  - Report catalog view showing all reports
  - Report detail with comment section
  - Signature capture

- **Dashboard Integration**
  - Monthly report count stat
  - Recent report activity in dashboard
  - Report trend charts (supervisor)

### ⏳ PENDING

- Email notifications on report submission/review
- Report export to PDF
- Head review step UI (currently defined but not fully tested)
- Report content validation (mandatory fields)
- Report scheduling (required by date)
- Report templates
- Report analytics and insights
- Escalation workflow if supervisor doesn't review

---

## 9. WEEKLY & MONTHLY REPORTS (AUTOMATED AGGREGATION)

### ✅ WORKING

- **Weekly Report Generation**
  - Auto-aggregates last 7 days of daily reports
  - Combines all daily comments into summary
  - Status: DRAFT (awaiting submission)
  - `generateWeeklyReport()` function

- **Monthly Report Generation**
  - Auto-aggregates entire month of daily reports
  - Summary of all daily accomplishments
  - Status: DRAFT
  - `generateMonthlyReport()` function

- **Batch Generation**
  - `generateAllPendingWeeklyReports()` - generates for all users
  - `generateAllPendingMonthlyReports()` - generates for all users
  - Can be triggered via cron job

### ⏳ PENDING

- Weekly/Monthly report submission UI
- Weekly/Monthly report review workflow
- Report interval customization (bi-weekly, quarterly)
- Performance summary generation
- Key metrics extraction from reports
- Report comparison over time

---

## 10. DEPARTMENTAL REPORTS

### ✅ WORKING

- **Department-Level Aggregation**
  - `generateDailyDepartmentReport()` - aggregates daily reports by department
  - `generateWeeklyDepartmentReport()` - aggregates weekly by department
  - `generateMonthlyDepartmentReport()` - aggregates monthly by department

- **Data Model**
  - Combines reports from all users in department
  - Filters by SUBMITTED status reports
  - Creates summary with user attribution
  - Status tracking (SUBMITTED, REVIEWED, etc.)

- **Manager/Head Access**
  - Managers can view department-level analytics
  - Global analytics for managers showing:
    - Total users count
    - Total departments
    - Total reports submitted
    - Task statistics by status

### ⏳ PENDING

- Departmental report UI pages
- Department performance metrics
- Department comparison reports
- Export departmental reports
- Departmental trend analysis
- Departmental alerts/notifications

---

## 11. SUPERVISOR FEATURES

### ✅ WORKING

- **Team Overview**
  - View all team members assigned to supervisor
  - Real-time online status of team members
  - `team-overview.tsx` component

- **Team Reports Management**
  - View submitted reports from team
  - Review and approve/reject reports
  - Add feedback comments
  - `team-reports-list.tsx` component
  - Report review actions (supervisorApproveDailyReport, etc.)

- **Team Analytics**
  - 30-day analytics window
  - Member statistics:
    - Report count per member
    - Attendance count per member
    - Completed tasks count
  - Team metrics:
    - Daily report submission trends (last 7 days)
    - Task status distribution (Completed/In Progress/Pending)
  - Charts showing trends
  - `team-analytics-charts.tsx` component

- **Routes**
  - `/dashboard/supervisor/*` - protected supervisor routes
  - Redirects non-supervisors

### ⏳ PENDING

- Performance reviews
- Goal tracking per team member
- Team performance comparison
- Automated alerts/notifications for missing reports
- Team capacity planning
- Resource allocation based on analytics
- Team member promotion/status change workflows

---

## 12. MANAGER FEATURES

### ✅ WORKING

- **Global Analytics**
  - Manager-level overview (`/dashboard/manager/analytics`)
  - Metrics dashboard showing:
    - Total users in system
    - Total departments
    - Total reports submitted
    - Task statistics (all statuses)
  - Views aggregated data across all departments

### ⏳ PENDING

- Department management interface
- Departmental report approval workflow
- System-wide performance analytics
- Budget/resource tracking
- Manager notifications for critical items
- System health monitoring
- User activity logs

---

## 13. NOTIFICATIONS & ALERTS

### ✅ WORKING

- **Data Model**
  - `notifications` table for storing notifications
  - Linked to users
  - Type field for categorization

- **Components**
  - Notification center UI component
  - Real-time notification display

### ⏳ PENDING

- Notification triggers for:
  - Report submission/rejection
  - Extension approval/rejection
  - Task assignment
  - Supervisor feedback
  - System alerts
- Email notifications
- Push notifications
- Notification preferences/settings
- Notification read/unread status
- Notification history and archiving

---

## 14. PRESENCE & REAL-TIME FEATURES

### ✅ WORKING

- **User Presence Tracking**
  - `heartbeat()` - Updates user's online status every 5 minutes
  - `setOffline()` - Sets user offline on logout
  - `getOnlineUsers()` - Retrieves users active in last 5 minutes

- **UI Components**
  - `presence-heartbeat.tsx` - Client-side heartbeat sender
  - `online-users-widget.tsx` - Displays active users
  - `online-users-monitor.tsx` - Monitors user activity

- **Database Integration**
  - `isOnline` boolean flag on users table
  - `lastActive` timestamp tracking
  - Real-time status updates

### ⏳ PENDING

- WebSocket connection stability optimization
- Presence status indicators (Away, DND, Idle)
- User activity timeline
- Last seen tracking
- Presence-based UI updates

---

## 15. PROFILE & SETTINGS

### ✅ WORKING

- **User Profile**
  - View personal profile
  - Profile management page component
  - User information display

- **User Settings**
  - `updateUserSetting()` - Store user preferences
  - Settings drawer UI component
  - Floating settings button

- **Theme & Preferences**
  - Mantine theme integration
  - `use-mantine-theme` hook
  - Preferences drawer component
  - User preference persistence

### ⏳ PENDING

- Change password functionality
- Update profile picture
- Privacy settings
- Email preferences/notifications
- Two-factor authentication settings
- API key management
- Login device management

---

## 16. COMPANY SETTINGS (ADMIN)

### ✅ WORKING

- **Settings Management**
  - `updateCompanySetting()` - Store company-wide settings
  - Settings form UI component
  - Company settings page (`/dashboard/admin/settings`)

- **Data Model**
  - `companySettings` table for system configuration
  - Key-value storage for flexible settings

### ⏳ PENDING

- Working hours configuration
- Leave/holiday calendar
- Attendance policies
- Report submission deadlines
- Extension policy configuration
- Notification settings
- System-wide policies

---

## 17. SECURITY & AUDIT

### ✅ WORKING

- **Auth Audit Logging**
  - `logAuthEvent()` - Logs login/logout/auth events
  - `getAuthAuditLogs()` - Retrieves audit trail
  - Tracks user, action, IP, timestamp

- **User Lockout**
  - `lockUser()` - Locks user account with reason
  - `unlockUser()` - Unlocks user
  - Prevents locked users from accessing system

- **Session Management**
  - `userSessions` table for active sessions
  - Session invalidation support
  - `invalidateAllUserSessions()` - Force logout all instances

### ⏳ PENDING

- IP-based access restrictions
- Login attempt rate limiting
- Suspicious activity alerts
- Data encryption at rest
- API audit logging
- Change logs for sensitive operations
- Compliance reporting (GDPR, etc.)

---

## 18. DATABASE SCHEMA

### ✅ Tables Implemented

1. **users** - User accounts with roles, departments, supervisors
2. **departments** - Organization departments
3. **tasks** - Task assignments with status tracking
4. **subTasks** - Sub-task checklist items
5. **dailyReports** - Daily work reports with status workflow
6. **weeklyReports** - Aggregated weekly reports
7. **monthlyReports** - Aggregated monthly reports
8. **departmentReports** - Department-level aggregated reports
9. **attendance** - Daily check-in/check-out records
10. **timeExtensions** - Overtime/stay-late requests
11. **userSessions** - Active session tracking
12. **shifts** - Work shift definitions
13. **userShifts** - User-shift assignments
14. **companySettings** - System configuration
15. **notifications** - User notifications
16. **reportComments** - Comments on reports
17. **authAudit** - Authentication event logging

### ⏳ Pending Schema Enhancements

- Leave/Time off management table
- Holiday calendar table
- Department budgets table
- User skills/certifications table
- Performance review table
- Email templates table
- System logs table
- API keys table

---

## 19. API ROUTES

### ✅ Working

- **NextAuth API**
  - `/api/auth/*` - Authentication endpoints
  - Credentials provider configured
  - Session management

### ⏳ Pending

- REST API endpoints for mobile app
- WebSocket server setup (scripts exist)
- Real-time notification API
- Report export API (PDF, Excel)
- Analytics API
- Webhook support for integrations

---

## 20. FRONTEND COMPONENTS

### ✅ Components by Role

**Dashboard (All Users)**

- Attendance card with check-in/out buttons
- Stats cards (tasks, reports, attendance)
- Recent activity feed
- Weekly hours analytics
- Deadline countdowns
- Dashboard analytics grid
- Notification center

**User/Employee**

- Task list with status management
- Create task button
- Daily report submission form
- Reports catalog
- Extension request modal

**Supervisor**

- Team overview
- Team reports list with review actions
- Team analytics charts

**Manager**

- Global analytics dashboard
- Department metrics

**Admin**

- User management list and form
- Department management
- Settings tabs
- Shift management
- Create user button
- Create department button

**Shared Components**

- Header with navigation
- Sidebar with role-based menu
- Mobile sidebar
- Theme provider
- UI library components (Mantine + Radix UI)

### ⏳ Pending Components

- Report detail view page
- Departmental reports page
- Performance review components
- Team performance comparison
- System health dashboard
- Audit log viewer
- User activity timeline
- Export/Print components

---

## 21. UTILITY FUNCTIONS

### ✅ Working

- **Auth Utilities** - `lib/auth.ts` - NextAuth configuration
- **Database Utilities** - `lib/db/index.ts` - Drizzle connection
- **Navigation** - `lib/navigation.ts` - Route helpers
- **PDF Utils** - `lib/pdf-utils.ts` - Report export support
- **Socket Utils** - `lib/socket-utils.ts` - WebSocket helpers
- **Theme Utils** - `lib/theme.ts` - Design system
- **General Utils** - `lib/utils.ts` - Helper functions

### ⏳ Pending

- Email service integration
- SMS notifications
- File upload handlers
- Image processing
- Data validation library
- Error logging/monitoring
- Analytics tracking

---

## 22. SCRIPTS & AUTOMATION

### ✅ Working

- **Seeding Script** (`scripts/seed.ts`) - Initial database population
- **Socket Server** (`scripts/socket-server.ts`) - Real-time communication setup
- **Cron Jobs** (`scripts/cron-jobs.ts`) - Background job runner

### ⏳ Pending

- Daily scheduled tasks (auto-generate reports, reminders)
- Weekly cleanup jobs
- Monthly analytics generation
- Email digest sending
- Report auto-locking at deadline
- Archive old records
- Database backup scripts

---

## 23. DEPLOYMENT & ENVIRONMENT

### ✅ Configured

- **Development**
  - Local dev server with `pnpm dev`
  - Database migrations with `pnpm db:generate`, `pnpm db:push`
  - Seeding with `pnpm seed`

- **Build**
  - Production build with `pnpm build`
  - NextAuth secret required
  - Database URL required

### ⏳ Pending

- Docker containerization
- CI/CD pipeline (GitHub Actions)
- Staging environment setup
- Production deployment guide
- Monitoring and alerting
- Backup strategies
- Load testing configuration

---

## 24. MAJOR PROCESS FLOWS

### User Daily Workflow

```
1. Login → Dashboard → Check In
2. View Tasks → Work on Tasks → Check Task Status
3. Afternoon: Request Extension (if needed)
4. End of Day: Submit Daily Report with signature
5. Check Out
6. View Recent Activity → Logout
```

### Supervisor Review Workflow

```
1. Login → Supervisor/Team Overview
2. View Team Reports → Review Submitted Reports
3. Add Comments/Feedback
4. Approve/Reject Reports
5. View Team Analytics → Identify Issues
6. Manage Team Tasks
```

### Admin Setup Workflow

```
1. Login → Admin/Users
2. Create Departments
3. Create Users + Assign Departments/Supervisors
4. Create Shifts + Assign to Users
5. Configure Company Settings
6. Monitor Audit Logs
7. Approve Extensions/Handle Access Control
```

### Report Generation Flow

```
Daily: User submits → Supervisor reviews → Approved/Rejected
Weekly: Auto-aggregates 7 days of daily reports
Monthly: Auto-aggregates 30 days of daily reports
Department: Aggregates by department → Manager review
```

---

## 25. SUMMARY: WORKING vs PENDING

### ✅ FULLY FUNCTIONAL FEATURES (Ready to Use)

- User authentication and authorization
- User/Department/Shift management
- Attendance (check-in/checkout)
- Task management with sub-tasks
- Daily report submission and workflow
- Time extension requests
- Supervisor report review
- Team analytics for supervisors
- Global analytics for managers
- User presence tracking
- Authentication audit logging
- User lockout mechanism
- Personal settings/preferences

### ⏳ PARTIALLY IMPLEMENTED (Core exists, needs completion)

- Weekly/Monthly report generation (logic done, UI pending)
- Departmental reports (aggregation done, UI pending)
- Notifications (data model done, triggers pending)
- Real-time features (heartbeat done, stability pending)
- Company settings (basic structure, policies pending)

### ❌ NOT STARTED (Needed for full functionality)

- Report PDF export
- Email notifications
- Mobile app
- Email digest
- Advanced analytics and insights
- Two-factor authentication
- Performance reviews
- Leave management
- Geolocation-based attendance
- Task collaboration/comments
- Automated escalation workflows
- Compliance reporting
- Advanced reporting UI (departmental reports page, etc.)
- API for third-party integrations

---

## 26. RECOMMENDED NEXT PRIORITIES

### High Priority (Core Features)

1. Complete Weekly/Monthly report UI pages
2. Add departmental reports view for managers
3. Email notifications system
4. Report PDF export
5. Admin extension approval UI

### Medium Priority (User Experience)

6. Task comments/collaboration
7. Advanced task features (priority, tags, dependencies)
8. Improved analytics dashboards
9. Mobile responsiveness testing
10. Performance review framework

### Low Priority (Nice to Have)

11. Mobile app
12. Leave management system
13. Geolocation check-in
14. API documentation and REST endpoints
15. Advanced compliance features

---

**End of Process Flow Analysis**
