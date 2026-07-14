// ── Staffing Model ──────────────────────────────────────────────
export interface StaffingParams {
  childrenCount: number;
  minRatio: number;
  operatingHours: number;
  budgetLimit: number;
}

export const DEFAULT_STAFFING_PARAMS: StaffingParams = {
  childrenCount: 80,
  minRatio: 6,
  operatingHours: 10,
  budgetLimit: 500000,
};

// ── Cost Optimisation Model ────────────────────────────────────
export interface CostOptimisationParams {
  childrenCount: number;
  tuitionFee: number;
  fixedCosts: number;
  variableCostPerChild: number;
  marketingPct: number;
  enrollmentGrowth: number;
}

export const DEFAULT_COST_PARAMS: CostOptimisationParams = {
  childrenCount: 80,
  tuitionFee: 350,
  fixedCosts: 38000,
  variableCostPerChild: 150,
  marketingPct: 8,
  enrollmentGrowth: 5,
};

// ── Break-even Model ───────────────────────────────────────────
export interface BreakEvenParams {
  fixedCosts: number;
  variableCostPerChild: number;
  revenuePerChild: number;
}

export const DEFAULT_BREAKEVEN_PARAMS: BreakEvenParams = {
  fixedCosts: 38000,
  variableCostPerChild: 150,
  revenuePerChild: 350,
};

// ── Growth Model ───────────────────────────────────────────────
export interface GrowthParams {
  currentEnrollment: number;
  maxCapacity: number;
  avgTuition: number;
  growthRate: number;
  monthlyCAC: number;
  churnRate: number;
}

export const DEFAULT_GROWTH_PARAMS: GrowthParams = {
  currentEnrollment: 60,
  maxCapacity: 120,
  avgTuition: 350,
  growthRate: 8,
  monthlyCAC: 3500,
  churnRate: 3,
};

// ── Profit Analysis Model ──────────────────────────────────────
export interface RevenueStream {
  name: string;
  icon: string;
  revenue: number;
  growth: number;
  color: string;
}

export interface CostCategory {
  name: string;
  icon: string;
  cost: number;
  trend: "up" | "down" | "stable";
  color: string;
}

export interface ProfitParams {
  streams: RevenueStream[];
  costs: CostCategory[];
  taxRate: number;
  projectionYears: number;
}

export const DEFAULT_PROFIT_PARAMS: ProfitParams = {
  streams: [
    { name: "Tuition Fees", icon: "🎓", revenue: 28000, growth: 8, color: "#3d6ea5" },
    { name: "Activity Fees", icon: "🎨", revenue: 5000, growth: 5, color: "#2f8f83" },
    { name: "Meal Program", icon: "🍱", revenue: 3000, growth: 3, color: "#c98a1f" },
    { name: "After-School Care", icon: "🏫", revenue: 4000, growth: 10, color: "#8a4a86" },
    { name: "Special Programs", icon: "⭐", revenue: 2000, growth: 7, color: "#c0574f" },
    { name: "Grants & Subsidies", icon: "🏛️", revenue: 1500, growth: 2, color: "#3f7d5c" },
  ],
  costs: [
    { name: "Salaries & Wages", icon: "👥", cost: 18000, trend: "up", color: "#ef4444" },
    { name: "Rent & Utilities", icon: "🏢", cost: 8000, trend: "up", color: "#f59e0b" },
    { name: "Food & Supplies", icon: "🥘", cost: 5000, trend: "stable", color: "#8b5cf6" },
    { name: "Marketing", icon: "📢", cost: 3500, trend: "stable", color: "#ec4899" },
    { name: "Maintenance", icon: "🔧", cost: 2000, trend: "down", color: "#06b6d4" },
    { name: "Insurance & Admin", icon: "🛡️", cost: 1500, trend: "stable", color: "#f97316" },
  ],
  taxRate: 12,
  projectionYears: 3,
};

// ── Union type ─────────────────────────────────────────────────
export type ModelType = "staffing" | "cost" | "breakeven" | "growth" | "profit";

export type ModelParams =
  | StaffingParams
  | CostOptimisationParams
  | BreakEvenParams
  | GrowthParams
  | ProfitParams;

// ── Model Handle (export + scenario save/load) ─────────────────
export interface ModelHandle {
  getExportData: () => {
    headers: string[];
    rows: (string | number)[][];
    filename: string;
  };
  getParams: () => ModelParams;
  setParams: (params: ModelParams) => void;
}

// ── Scenario saved in DB ───────────────────────────────────────
export interface Scenario {
  id: string;
  user_id: string;
  name: string;
  model_type: ModelType;
  parameters: ModelParams;
  created_at: string;
  updated_at: string;
}
