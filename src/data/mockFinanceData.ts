export interface CashAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  balance: number;
  type: "Bank" | "Cash Box" | "Petty Cash" | "Merchant EDC";
  lastUpdated: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  code: string;
  category: "Revenue" | "COGS / Bahan" | "Petty Cash" | "Payroll" | "Utilities & Rent" | "Marketing" | "Maintenance";
  description: string;
  type: "IN" | "OUT";
  amount: number;
  accountName: string;
  recordedBy: string;
  status: "Settled" | "Pending Audit";
}

export interface ProfitAndLossStatement {
  period: string;
  grossSales: number;
  discountsAndPromos: number;
  netSales: number;
  cogsFoodAndBev: number;
  grossProfit: number;
  grossProfitMargin: number;
  operatingExpenses: {
    salariesAndWages: number;
    utilityAndRent: number;
    marketingAndAds: number;
    maintenanceAndSupplies: number;
    generalAdmin: number;
  };
  totalOpex: number;
  ebitda: number;
  netProfit: number;
  netProfitMargin: number;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  unit: string;
  unitCost: number;
  quantityNeeded: number;
  wastePercentage: number;
  totalCost: number;
}

export interface MenuHppRecipe {
  id: string;
  menuCode: string;
  menuName: string;
  category: string;
  currentSellingPrice: number;
  targetMarginPercentage: number;
  packagingCost: number;
  laborOverheadCost: number;
  ingredients: RecipeIngredient[];
}

export const MOCK_CASH_ACCOUNTS: CashAccount[] = [];
export const MOCK_FINANCIAL_TRANSACTIONS: FinancialTransaction[] = [];

export const MOCK_PANDL_STATEMENT: ProfitAndLossStatement = {
  period: "Real-time",
  grossSales: 0,
  discountsAndPromos: 0,
  netSales: 0,
  cogsFoodAndBev: 0,
  grossProfit: 0,
  grossProfitMargin: 0,
  operatingExpenses: {
    salariesAndWages: 0,
    utilityAndRent: 0,
    marketingAndAds: 0,
    maintenanceAndSupplies: 0,
    generalAdmin: 0,
  },
  totalOpex: 0,
  ebitda: 0,
  netProfit: 0,
  netProfitMargin: 0,
};

export const MOCK_MENU_HPP_RECIPES: MenuHppRecipe[] = [];
