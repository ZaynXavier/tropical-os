export interface ProductionPlanItem {
  id: string;
  planCode: string;
  recipeName: string;
  category: "Sauce & Paste" | "Syrup & Brew" | "Meat Prep" | "Bakery & Dough";
  plannedYield: number;
  unit: string;
  scheduledDate: string;
  shift: "Morning" | "Afternoon" | "Night";
  assignedTo: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Material Shortage";
  materialCheck: "All Available" | "Partial Available" | "Shortage Alert";
  requiredMaterials: {
    materialName: string;
    requiredQty: number;
    availableStock: number;
    unit: string;
    purchasingPoRef?: string;
  }[];
}

export interface StandardRecipe {
  id: string;
  recipeCode: string;
  recipeName: string;
  category: "Sauce & Paste" | "Syrup & Brew" | "Meat Prep" | "Bakery & Dough";
  targetBatchYield: number;
  unit: string;
  prepTimeMinutes: number;
  shelfLifeDays: number;
  standardCostPerUnit: number;
  ingredients: {
    itemName: string;
    quantity: number;
    unit: string;
    estimatedUnitCost: number;
    purchasingCategory: string;
  }[];
  instructions: string[];
}

export interface ProductionBatch {
  id: string;
  batchCode: string;
  recipeName: string;
  category: "Sauce & Paste" | "Syrup & Brew" | "Meat Prep" | "Bakery & Dough";
  targetYield: number;
  actualYield: number;
  unit: string;
  preparedBy: string;
  productionDate: string;
  expiryDate: string;
  qualityCheck: "Passed" | "Conditional Pass" | "Failed QC";
  status: "In Production" | "Completed" | "On Hold";
  poSourceRef: string;
  yieldEfficiencyPct: number;
  totalBatchCost: number;
  costPerYieldUnit: number;
  ingredientsUsed: {
    materialName: string;
    quantityUsed: number;
    unit: string;
    cost: number;
  }[];
  notes: string;
}

export interface YieldAnalysisRecord {
  id: string;
  batchCode: string;
  recipeName: string;
  inputRawWeight: number;
  outputUsableYield: number;
  unit: string;
  expectedYieldPct: number;
  actualYieldPct: number;
  wastePct: number;
  wasteReason: string;
  qualityGrade: string;
  dateRecorded: string;
}

export interface VarianceAnalysisRecord {
  id: string;
  varianceCode: string;
  batchCode: string;
  recipeName: string;
  standardCost: number;
  actualCost: number;
  varianceAmount: number;
  variancePct: number;
  varianceType: "Favorable" | "Adverse (Loss)";
  rootCause: string;
  poNumberImpacted: string;
  status: "Approved Variance" | "Under Review";
}

export const MOCK_PRODUCTION_PLANS: ProductionPlanItem[] = [];
export const MOCK_STANDARD_RECIPES: StandardRecipe[] = [];
export const MOCK_ACTIVE_BATCHES: ProductionBatch[] = [];
export const MOCK_YIELD_RECORDS: YieldAnalysisRecord[] = [];
export const MOCK_VARIANCE_RECORDS: VarianceAnalysisRecord[] = [];
