-- ============================================================================
-- DAYCARE MANAGEMENT SYSTEM — Complete Schema + Seed Data
-- Run this entire file in Supabase SQL Editor (single script, no pre-reqs).
-- ============================================================================

-- ── 1. ENUMS ──────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'teacher', 'caregiver', 'parent');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE activity_type AS ENUM ('meal', 'nap', 'potty', 'mood', 'health', 'curriculum');
CREATE TYPE expense_category AS ENUM ('supplies', 'food', 'maintenance', 'utilities', 'rent', 'salaries', 'other');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue');
CREATE TYPE payment_status AS ENUM ('completed', 'pending', 'failed');
CREATE TYPE payment_method AS ENUM ('bank_transfer', 'credit_card', 'cash', 'cheque', 'online');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_category AS ENUM ('cleaning', 'meals', 'health', 'education', 'play', 'other');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE staff_status AS ENUM ('on_duty', 'off', 'break');
CREATE TYPE staff_role AS ENUM ('teacher', 'caregiver', 'manager', 'admin');
CREATE TYPE child_status AS ENUM ('checked_in', 'checked_out');

-- ── 2. TABLES ─────────────────────────────────────────────────────────────

-- 2a. profiles (extends auth.users)
CREATE TABLE profiles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name   TEXT NOT NULL,
    role        user_role NOT NULL DEFAULT 'parent',
    phone       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2b. classes
CREATE TABLE classes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    min_age_months  INTEGER NOT NULL CHECK (min_age_months >= 0),
    max_age_months  INTEGER NOT NULL CHECK (max_age_months > min_age_months),
    teacher_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
    capacity        INTEGER NOT NULL DEFAULT 15 CHECK (capacity > 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2c. children
CREATE TABLE children (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       TEXT NOT NULL,
    date_of_birth   DATE NOT NULL,
    parent_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
    class_id        UUID REFERENCES classes(id) ON DELETE SET NULL,
    monthly_fee     DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (monthly_fee >= 0),
    enrolled_at     DATE NOT NULL DEFAULT CURRENT_DATE,
    status          child_status NOT NULL DEFAULT 'checked_out',
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2d. attendance
CREATE TABLE attendance (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id        UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    date            DATE NOT NULL DEFAULT CURRENT_DATE,
    status          attendance_status NOT NULL DEFAULT 'present',
    checked_in_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(child_id, date)
);

-- 2e. activity_logs
CREATE TABLE activity_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id    UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    type        activity_type NOT NULL,
    detail      TEXT,
    logged_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
    logged_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2f. expenses
CREATE TABLE expenses (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category      expense_category NOT NULL,
    description   TEXT,
    amount        DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    expense_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2g. invoices
CREATE TABLE invoices (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no  TEXT NOT NULL UNIQUE,
    child_id    UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    parent_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount      DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    due_date    DATE NOT NULL,
    status      invoice_status NOT NULL DEFAULT 'draft',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2h. payments
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id      UUID REFERENCES invoices(id) ON DELETE SET NULL,
    child_id        UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    parent_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount          DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    method          payment_method NOT NULL,
    payment_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    status          payment_status NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2i. tasks
CREATE TABLE tasks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT NOT NULL,
    description   TEXT,
    priority      task_priority NOT NULL DEFAULT 'medium',
    category      task_category NOT NULL DEFAULT 'other',
    assigned_to   UUID REFERENCES profiles(id) ON DELETE SET NULL,
    due_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    due_time      TIME,
    done          BOOLEAN NOT NULL DEFAULT false,
    created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2j. registrations (enrollment applications)
CREATE TABLE registrations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_name      TEXT NOT NULL,
    parent_name     TEXT NOT NULL,
    parent_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
    age             TEXT NOT NULL,
    status          registration_status NOT NULL DEFAULT 'pending',
    applied_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2k. staff (extended staff records linked to profiles)
CREATE TABLE staff (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id  UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    role        staff_role NOT NULL,
    shift_start TIME NOT NULL DEFAULT '08:00',
    shift_end   TIME NOT NULL DEFAULT '16:00',
    status      staff_status NOT NULL DEFAULT 'on_duty',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. INDEXES ────────────────────────────────────────────────────────────

-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);

-- Children
CREATE INDEX idx_children_parent_id ON children(parent_id);
CREATE INDEX idx_children_class_id ON children(class_id);
CREATE INDEX idx_children_status ON children(status);

-- Attendance
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_child_id ON attendance(child_id);
CREATE INDEX idx_attendance_status ON attendance(status);

-- Activity logs
CREATE INDEX idx_activity_logs_child_id ON activity_logs(child_id);
CREATE INDEX idx_activity_logs_logged_at ON activity_logs(logged_at);

-- Expenses
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);

-- Invoices
CREATE INDEX idx_invoices_parent_id ON invoices(parent_id);
CREATE INDEX idx_invoices_child_id ON invoices(child_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Payments
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_parent_id ON payments(parent_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Tasks
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_done ON tasks(done);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_category ON tasks(category);

-- Registrations
CREATE INDEX idx_registrations_status ON registrations(status);

-- Staff
CREATE INDEX idx_staff_role ON staff(role);
CREATE INDEX idx_staff_status ON staff(status);

-- ── 4. AUTO-UPDATE TRIGGER ────────────────────────────────────────────────

-- Generic trigger to update "updated_at" — reuse across tables
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tables that need an "updated_at" column
ALTER TABLE profiles     ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE classes      ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE children     ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE attendance   ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE invoices     ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE payments     ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE tasks        ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE registrations ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE staff        ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TRIGGER set_profiles_updated_at      BEFORE UPDATE ON profiles      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_classes_updated_at       BEFORE UPDATE ON classes       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_children_updated_at      BEFORE UPDATE ON children      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_attendance_updated_at    BEFORE UPDATE ON attendance    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_invoices_updated_at      BEFORE UPDATE ON invoices      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_payments_updated_at      BEFORE UPDATE ON payments      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_tasks_updated_at         BEFORE UPDATE ON tasks         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_staff_updated_at         BEFORE UPDATE ON staff         FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 5. AUTO-PROFILE CREATION ──────────────────────────────────────────────

-- When a new user signs up via Supabase Auth, automatically create a profile row.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
        COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'parent')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 6. ROW LEVEL SECURITY ─────────────────────────────────────────────────

-- 6a. Enable RLS on all tables
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE children      ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance    ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices      ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff         ENABLE ROW LEVEL SECURITY;

-- Helper: get the current user's role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 6b. profiles policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (current_user_role() = 'admin');

CREATE POLICY "Managers can view all profiles"
    ON profiles FOR SELECT
    USING (current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Teachers & caregivers can view children & parent profiles"
    ON profiles FOR SELECT
    USING (
        current_user_role() IN ('admin', 'manager', 'teacher', 'caregiver')
        OR auth.uid() = id
    );

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
    ON profiles FOR UPDATE
    USING (current_user_role() = 'admin');

-- 6c. classes policies
CREATE POLICY "Staff can view classes"
    ON classes FOR SELECT
    USING (current_user_role() IN ('admin', 'manager', 'teacher', 'caregiver'));

CREATE POLICY "Parents can view their children's classes"
    ON classes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM children
            WHERE children.class_id = classes.id
            AND children.parent_id = auth.uid()
        )
    );

CREATE POLICY "Admins & managers can manage classes"
    ON classes FOR ALL
    USING (current_user_role() IN ('admin', 'manager'));

-- 6d. children policies
CREATE POLICY "Staff can view all children"
    ON children FOR SELECT
    USING (current_user_role() IN ('admin', 'manager', 'teacher', 'caregiver'));

CREATE POLICY "Parents can view own children"
    ON children FOR SELECT
    USING (parent_id = auth.uid());

CREATE POLICY "Admins & managers can manage children"
    ON children FOR ALL
    USING (current_user_role() IN ('admin', 'manager'));

-- 6e. attendance policies
CREATE POLICY "Staff can view attendance"
    ON attendance FOR SELECT
    USING (current_user_role() IN ('admin', 'manager', 'teacher', 'caregiver'));

CREATE POLICY "Parents can view own children's attendance"
    ON attendance FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM children
            WHERE children.id = attendance.child_id
            AND children.parent_id = auth.uid()
        )
    );

CREATE POLICY "Staff can manage attendance"
    ON attendance FOR ALL
    USING (current_user_role() IN ('admin', 'manager', 'teacher', 'caregiver'));

-- 6f. activity_logs policies
CREATE POLICY "Staff can view activity logs"
    ON activity_logs FOR SELECT
    USING (current_user_role() IN ('admin', 'manager', 'teacher', 'caregiver'));

CREATE POLICY "Parents can view own children's activity logs"
    ON activity_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM children
            WHERE children.id = activity_logs.child_id
            AND children.parent_id = auth.uid()
        )
    );

CREATE POLICY "Staff can manage activity logs"
    ON activity_logs FOR ALL
    USING (current_user_role() IN ('admin', 'manager', 'teacher', 'caregiver'));

-- 6g. expenses policies
CREATE POLICY "Admins & managers can manage expenses"
    ON expenses FOR ALL
    USING (current_user_role() IN ('admin', 'manager'));

-- 6h. invoices policies
CREATE POLICY "Admins & managers can manage invoices"
    ON invoices FOR ALL
    USING (current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Parents can view own invoices"
    ON invoices FOR SELECT
    USING (parent_id = auth.uid());

-- 6i. payments policies
CREATE POLICY "Admins & managers can manage payments"
    ON payments FOR ALL
    USING (current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Parents can view own payments"
    ON payments FOR SELECT
    USING (parent_id = auth.uid());

-- 6j. tasks policies
CREATE POLICY "Staff can view all tasks"
    ON tasks FOR SELECT
    USING (current_user_role() IN ('admin', 'manager', 'teacher', 'caregiver'));

CREATE POLICY "Staff can manage tasks"
    ON tasks FOR ALL
    USING (current_user_role() IN ('admin', 'manager', 'teacher', 'caregiver'));

-- 6k. registrations policies
CREATE POLICY "Admins & managers can manage registrations"
    ON registrations FOR ALL
    USING (current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Parents can view own registrations"
    ON registrations FOR SELECT
    USING (parent_id = auth.uid());

-- 6l. staff policies
CREATE POLICY "Admins & managers can manage staff"
    ON staff FOR ALL
    USING (current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Staff can view staff records"
    ON staff FOR SELECT
    USING (current_user_role() IN ('admin', 'manager', 'teacher', 'caregiver'));

-- ── 7. SEED DATA ──────────────────────────────────────────────────────────

-- Demo profiles
INSERT INTO profiles (id, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'System Admin',      'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Center Manager',    'manager'),
  ('00000000-0000-0000-0000-000000000003', 'Teacher Jane',      'teacher'),
  ('00000000-0000-0000-0000-000000000004', 'Ms. Clara Higgins', 'caregiver'),
  ('00000000-0000-0000-0000-000000000005', 'Sarah Watson',      'parent'),
  ('00000000-0000-0000-0000-000000000006', 'James Smith',       'parent'),
  ('00000000-0000-0000-0000-000000000007', 'Emily Williams',    'parent'),
  ('00000000-0000-0000-0000-000000000008', 'Mr. Robert King',   'teacher'),
  ('00000000-0000-0000-0000-000000000009', 'Ms. Anna Li',       'caregiver'),
  ('00000000-0000-0000-0000-00000000000a', 'Mr. David Park',    'teacher');

-- Demo classes
INSERT INTO classes (id, name, min_age_months, max_age_months, teacher_id, capacity)
VALUES
    ('c0000001-0000-0000-0000-000000000001', 'Infant Room',       0,  12,  NULL, 8),
    ('c0000001-0000-0000-0000-000000000002', 'Toddler Room',     13,  24,  NULL, 10),
    ('c0000001-0000-0000-0000-000000000003', 'Preschool A',      25,  48,  NULL, 15),
    ('c0000001-0000-0000-0000-000000000004', 'Preschool B',      25,  48,  NULL, 15),
    ('c0000001-0000-0000-0000-000000000005', 'Pre-K',            49,  60,  NULL, 15),
    ('c0000001-0000-0000-0000-000000000006', 'After School',     61,  120, NULL, 20);

-- Demo children
INSERT INTO children (id, full_name, date_of_birth, parent_id, class_id, monthly_fee, enrolled_at, status)
VALUES
    ('ch000001-0000-0000-0000-000000000001', 'Liam Johnson',   '2023-03-15', '00000000-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000003', 850, '2026-01-15', 'checked_in'),
    ('ch000001-0000-0000-0000-000000000002', 'Olivia Smith',   '2022-07-22', '00000000-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000003', 850, '2026-02-01', 'checked_in'),
    ('ch000001-0000-0000-0000-000000000003', 'Noah Williams',  '2023-05-10', '00000000-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000003', 850, '2026-01-20', 'checked_out'),
    ('ch000001-0000-0000-0000-000000000004', 'Ava Brown',      '2022-11-30', '00000000-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000004', 850, '2026-03-05', 'checked_in'),
    ('ch000001-0000-0000-0000-000000000005', 'Lucas Davis',    '2023-08-18', '00000000-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000003', 850, '2026-02-15', 'checked_out'),
    ('ch000001-0000-0000-0000-000000000006', 'Mia Wilson',     '2024-01-05', '00000000-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000002', 950, '2026-04-01', 'checked_in');

-- Demo attendance records
INSERT INTO attendance (id, child_id, date, status, notes)
VALUES
    (gen_random_uuid(), 'ch000001-0000-0000-0000-000000000001', CURRENT_DATE, 'present', NULL),
    (gen_random_uuid(), 'ch000001-0000-0000-0000-000000000002', CURRENT_DATE, 'present', NULL),
    (gen_random_uuid(), 'ch000001-0000-0000-0000-000000000004', CURRENT_DATE, 'present', NULL),
    (gen_random_uuid(), 'ch000001-0000-0000-0000-000000000006', CURRENT_DATE, 'late', 'Arrived at 9:30 AM'),
    (gen_random_uuid(), 'ch000001-0000-0000-0000-000000000003', CURRENT_DATE, 'absent', 'Parent called in sick'),
    (gen_random_uuid(), 'ch000001-0000-0000-0000-000000000005', CURRENT_DATE, 'present', NULL);

-- Demo activity logs
INSERT INTO activity_logs (id, child_id, type, detail, logged_at)
VALUES
    (gen_random_uuid(), 'ch000001-0000-0000-0000-000000000001', 'meal', 'Finished 80% of lunch',       now() - INTERVAL '2 hours'),
    (gen_random_uuid(), 'ch000001-0000-0000-0000-000000000002', 'nap',  'Napped 1hr 15min',            now() - INTERVAL '1 hour'),
    (gen_random_uuid(), 'ch000001-0000-0000-0000-000000000004', 'potty','Successful bathroom visit',    now() - INTERVAL '3 hours'),
    (gen_random_uuid(), 'ch000001-0000-0000-0000-000000000006', 'mood', 'Happy and playful',           now() - INTERVAL '4 hours'),
    (gen_random_uuid(), 'ch000001-0000-0000-0000-000000000001', 'meal', 'Ate all of morning snack',    now() - INTERVAL '5 hours');

-- Demo expenses
INSERT INTO expenses (id, category, description, amount, expense_date)
VALUES
    (gen_random_uuid(), 'supplies',    'Art supplies (paper, paint, glue)',       250.00, CURRENT_DATE - INTERVAL '2 days'),
    (gen_random_uuid(), 'food',        'Weekly grocery delivery',                580.00, CURRENT_DATE - INTERVAL '1 day'),
    (gen_random_uuid(), 'utilities',   'Monthly electricity bill',               420.00, CURRENT_DATE - INTERVAL '5 days'),
    (gen_random_uuid(), 'rent',        'Monthly rent payment',                  3500.00, CURRENT_DATE - INTERVAL '3 days'),
    (gen_random_uuid(), 'salaries',    'Staff payroll (bi-weekly)',             8500.00, CURRENT_DATE - INTERVAL '7 days'),
    (gen_random_uuid(), 'maintenance', 'HVAC repair service',                    375.00, CURRENT_DATE - INTERVAL '10 days'),
    (gen_random_uuid(), 'supplies',    'Cleaning supplies',                       120.00, CURRENT_DATE - INTERVAL '4 days');

-- Demo tasks
INSERT INTO tasks (id, title, description, priority, category, due_date, due_time, done)
VALUES
    (gen_random_uuid(), 'Sanitize Classrooms and Toys', 'Wipe down all surfaces, sanitize shared toys, and mop floors', 'high',   'cleaning', CURRENT_DATE, '08:30', true),
    (gen_random_uuid(), 'Prepare Morning Snacks',       'Cut fruits, pour milk, and set up snack stations',             'medium', 'meals',   CURRENT_DATE, '10:00', true),
    (gen_random_uuid(), 'Scheduled Restroom Break',     'Take children for scheduled restroom break',                   'high',   'health',  CURRENT_DATE, '11:30', false),
    (gen_random_uuid(), 'Assist with Lunch Feedings',   'Help toddlers with lunch, ensure special dietary needs are met','urgent','meals',   CURRENT_DATE, '12:15', false),
    (gen_random_uuid(), 'Story Time Circle',            'Read two picture books and lead discussion questions',          'medium', 'education', CURRENT_DATE, '14:30', false);

-- Demo registrations (pending applications)
INSERT INTO registrations (id, child_name, parent_name, age, status, applied_date)
VALUES
    (gen_random_uuid(), 'Emily Watson',   'Sarah Watson',     '3', 'pending',  CURRENT_DATE - INTERVAL '4 days'),
    (gen_random_uuid(), 'Leo Martinez',   'Carlos Martinez',  '2', 'pending',  CURRENT_DATE - INTERVAL '5 days'),
    (gen_random_uuid(), 'Sophie Chen',    'Lisa Chen',        '4', 'approved', CURRENT_DATE - INTERVAL '10 days'),
    (gen_random_uuid(), 'Isabella Kim',   'Michelle Kim',     '2', 'pending',  CURRENT_DATE - INTERVAL '2 days');

-- Demo invoices
INSERT INTO invoices (id, invoice_no, child_id, parent_id, amount, due_date, status)
VALUES
    (gen_random_uuid(), 'INV-2026-001', 'ch000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 850.00, '2026-07-15', 'sent'),
    (gen_random_uuid(), 'INV-2026-002', 'ch000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 850.00, '2026-07-15', 'paid'),
    (gen_random_uuid(), 'INV-2026-003', 'ch000001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007', 850.00, '2026-06-30', 'overdue'),
    (gen_random_uuid(), 'INV-2026-004', 'ch000001-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 850.00, '2026-07-15', 'sent'),
    (gen_random_uuid(), 'INV-2026-005', 'ch000001-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005', 950.00, '2026-07-15', 'draft');

-- Demo payments
INSERT INTO payments (id, invoice_id, child_id, parent_id, amount, method, payment_date, status)
VALUES
    (gen_random_uuid(), (SELECT id FROM invoices WHERE invoice_no = 'INV-2026-002'),
     'ch000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 850.00, 'bank_transfer', '2026-07-02', 'completed'),
    (gen_random_uuid(), NULL,
     'ch000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 850.00, 'credit_card',   '2026-07-05', 'pending');

-- Demo staff (each staff member has a unique profile_id — one-to-one with profiles)
INSERT INTO staff (id, profile_id, role, shift_start, shift_end, status)
VALUES
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 'teacher',   '08:00', '16:00', 'on_duty'),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000004', 'caregiver', '08:00', '16:00', 'on_duty'),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000008', 'teacher',   '09:00', '17:00', 'break'),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000009', 'caregiver', '10:00', '18:00', 'off'),
    (gen_random_uuid(), '00000000-0000-0000-0000-00000000000a', 'teacher',   '08:00', '16:00', 'on_duty');
