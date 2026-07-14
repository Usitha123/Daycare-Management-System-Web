-- ── DECISION SCENARIOS ─────────────────────────────────────────
-- Stores saved parameter sets for the 5 decision models so users
-- can save, load, and compare different scenarios.

CREATE TABLE decision_scenarios (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    model_type  TEXT NOT NULL CHECK (model_type IN ('staffing', 'cost', 'breakeven', 'growth', 'profit')),
    parameters  JSONB NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_decision_scenarios_user_id ON decision_scenarios(user_id);
CREATE INDEX idx_decision_scenarios_model_type ON decision_scenarios(model_type);

-- Trigger for updated_at
CREATE TRIGGER set_decision_scenarios_updated_at
    BEFORE UPDATE ON decision_scenarios
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Row Level Security ─────────────────────────────────────────

ALTER TABLE decision_scenarios ENABLE ROW LEVEL SECURITY;

-- Users can manage their own scenarios
CREATE POLICY "Users can view own scenarios"
    ON decision_scenarios FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own scenarios"
    ON decision_scenarios FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own scenarios"
    ON decision_scenarios FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own scenarios"
    ON decision_scenarios FOR DELETE
    USING (user_id = auth.uid());

-- Admins & managers can view all scenarios (for oversight)
CREATE POLICY "Admins can view all scenarios"
    ON decision_scenarios FOR SELECT
    USING (current_user_role() IN ('admin', 'manager'));
