# Office Manager - Daily Reporting System

A full-stack office management and daily reporting system built with Next.js 15, Neon PostgreSQL, and NextAuth.js.

## Features

### User Features

- **Dashboard** - Overview with attendance tracking, task stats, and recent activity
- **Attendance** - Check-in/check-out with time tracking
- **Tasks** - Create, manage, and update task status (Pending → In Progress → Completed)
- **Daily Reports** - Submit daily work reports for supervisor review

### Supervisor Features

- **Team Overview** - View all team members and their status
- **Report Review** - Approve/reject team member reports with feedback
- **Team Analytics** - Charts showing report trends, task distribution, and member activity

### Admin Features

- **User Management** - Create, edit, and manage users with role/department/supervisor assignment
- **Department Management** - Create and manage departments
- **System Settings** - Configure system-wide settings

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts

## Getting Started

### Environment Variables

```env
DATABASE_URL=your_neon_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Database Setup

Run the migration scripts in order:

1. `scripts/setup-database.sql` - Creates tables and enums
2. `scripts/seed-database.sql` - Adds demo data

### Seeding the Database

To set up initial data (departments and initial users), run the seeding script:

```bash
pnpm run seed
```

You will be prompted to provide a **System Password**. This password will be stored in your `.env` and used to authorize administrative actions.

## Project Structure

```
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── admin/            # Admin pages (users, departments, settings)
│   │   ├── dashboard/        # User pages (tasks, reports)
│   │   └── supervisor/       # Supervisor pages (team, analytics)
│   ├── api/auth/             # NextAuth API routes
│   ├── actions/              # Server actions
│   └── login/                # Login page
├── components/
│   ├── admin/                # Admin components
│   ├── dashboard/            # Dashboard components
│   ├── reports/              # Report components
│   ├── supervisor/           # Supervisor components
│   ├── tasks/                # Task components
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── auth.ts               # NextAuth configuration
│   └── db/                   # Database schema and connection
└── scripts/                  # SQL migration scripts
```

## Role-Based Access

| Route              | Admin | Supervisor | User |
| ------------------ | ----- | ---------- | ---- |
| /dashboard         | ✓     | ✓          | ✓    |
| /dashboard/tasks   | ✓     | ✓          | ✓    |
| /dashboard/reports | ✓     | ✓          | ✓    |
| /supervisor/\*     | ✓     | ✓          | ✗    |
| /admin/\*          | ✓     | ✗          | ✗    |

## License

MIT
# oms
