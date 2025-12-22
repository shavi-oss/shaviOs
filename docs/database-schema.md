# Database Schema Documentation

This document outlines the core database schema for Shavi Academy OS, focusing on critical tables, relationships, and type synchronization strategies.

## Core Tables

### 1. Profiles (`profiles`)

**Purpose**: Stores user profile information extending the Supabase Auth `users` table.

- **Primary Key**: `id` (References `auth.users.id`)
- **Key Columns**:
  - `full_name`: textual name of the user
  - `role`: Role enum (admin, employee, trainer, student)
  - `email`: Contact email
- **Relationships**:
  - One-to-One with `auth.users`
  - Referenced by `employees`, `trainers`, `students`

### 2. Leads (`leads`)

**Purpose**: Tracks potential students/customers in the sales funnel.

- **Primary Key**: `id` (UUID)
- **Key Columns**:
  - `first_name`, `last_name`: Personal details
  - `status`: Lead status (new, contacted, qualified, converted, lost)
  - `source`: Marketing source
  - `assigned_to`: Reference to `employees.id` (Sales rep)
- **Relationships**:
  - Many-to-One with `employees` (assigned_to)

### 3. Deals (`deals`)

**Purpose**: Manages sales opportunities pipeline.

- **Primary Key**: `id` (UUID)
- **Key Columns**:
  - `title`: Deal name
  - `stage`: Pipeline stage (lead, contacted, proposal, negotiation, closed_won, closed_lost)
  - `value`: Monetary value
  - `lead_id`: Reference to `leads.id`
  - `customer_id`: Reference to `profiles.id` (if converted)
- **Relationships**:
  - Many-to-One with `leads`
  - Many-to-One with `profiles` (customer)

### 4. Financial Records

- **Expenses (`expenses`)**: Tracks company outgoing funds.
  - Linked to `profiles` (submitted_by).
- **Payroll (`payroll_records`)**: Tracks employee salary payments.
  - Linked to `employees`.
- **Trainer Payments (`trainer_payments`)**: Tracks session-based trainer compensation.
  - Linked to `trainers`.

## Type Synchronization Strategy

The project uses Supabase's type generation to ensure end-to-end type safety.

### Source of Truth

The Database Schema (PostgreSQL) is the single source of truth.

### Synchronization Workflow

1. **Schema Change**: DB changes are applied via migrations or Supabase Dashboard.
2. **Pull Schema**: `npx supabase db pull` updates local schema.
3. **Generate Types**: `npx supabase gen types typescript --project-id <id> > lib/database.types.ts`
4. **Usage**: Import `Database` type from `@/lib/database.types`.

### Best Practices

- **Strict Typing**: Always use `Database['public']['Tables']['tableName']['Row']` instead of creating manual interfaces that might drift.
- **Enums**: Use `Database['public']['Enums']['enumName']` for status fields.
- **Relationships**: When using `.select('*, relation(...)')`, define extend type locally or use inferred types if simple.

## Migration Strategy

- Migration files are stored in `supabase/migrations`.
- Use `supabase migration new <name>` to create changes.
- Apply with `supabase db push` (local) or via CI/CD for production.
