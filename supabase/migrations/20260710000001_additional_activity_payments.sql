-- ============================================================================
-- ADDITIONAL ACTIVITY PAYMENTS
-- Tracks payments for extra-curricular activities, events, workshops, etc.
-- Each child can have multiple activity payments.
-- ============================================================================

-- 1. TABLE: additional_activity_payments
CREATE TABLE IF NOT EXISTS additional_activity_payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id        UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    activity_name   TEXT NOT NULL,
    activity_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    amount          DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method  payment_method,
    status          payment_status NOT NULL DEFAULT 'pending',
    notes           TEXT,
    created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. INDEXES
CREATE INDEX idx_additional_payments_child_id ON additional_activity_payments(child_id);
CREATE INDEX idx_additional_payments_activity_date ON additional_activity_payments(activity_date);
CREATE INDEX idx_additional_payments_status ON additional_activity_payments(status);

-- 3. AUTO-UPDATE TRIGGER
CREATE TRIGGER set_additional_activity_payments_updated_at
    BEFORE UPDATE ON additional_activity_payments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4. ROW LEVEL SECURITY
ALTER TABLE additional_activity_payments ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
CREATE POLICY "Admins & managers can manage activity payments"
    ON additional_activity_payments FOR ALL
    USING (current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Parents can view own children's activity payments"
    ON additional_activity_payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM children
            WHERE children.id = additional_activity_payments.child_id
            AND children.parent_id = auth.uid()
        )
    );

-- 6. SEED DATA — sample additional activity payments
INSERT INTO additional_activity_payments (id, child_id, activity_name, activity_date, amount, payment_method, status, notes)
VALUES
    (gen_random_uuid(), 'ch000001-0000-0000-0000-000000000001', 'Swimming Gala',           CURRENT_DATE - INTERVAL '15 days',  2500.00, 'cash',          'completed', 'Paid in full at the event'),
    (gen_random_uuid(), 'ch000001-0000-0000-0000-000000000002', 'Art & Craft Workshop',    CURRENT_DATE - INTERVAL '10 days',  1500.00, 'credit_card',   'completed', 'Online payment confirmed'),
    (gen_random_uuid(), 'ch000001-0000-0000-0000-000000000004', 'Music & Dance Festival',  CURRENT_DATE - INTERVAL '5 days',   3000.00, 'bank_transfer', 'pending',   'Awaiting bank confirmation'),
    (gen_random_uuid(), 'ch000001-0000-0000-0000-000000000006', 'Storytelling Workshop',   CURRENT_DATE - INTERVAL '2 days',   1200.00, NULL,            'pending',   'Not yet paid'),
    (gen_random_uuid(), 'ch000001-0000-0000-0000-000000000001', 'Summer Camp Week',        CURRENT_DATE + INTERVAL '10 days', 5000.00, NULL,            'pending',   'Upcoming event');
