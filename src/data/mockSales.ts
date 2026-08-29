import { SalesTransaction, CashierDailyClosing } from '../types/sales';

export interface MenuItemBlueprint {
  productId: string;
  productName: string;
  recipeId?: string;
  category: string;
  unitPrice: number;
  hppPerUnit: number;
  recipeMappingStatus: 'MAPPED' | 'NO_RECIPE_MAPPING';
}

export const MENU_PRODUCTS: MenuItemBlueprint[] = [];
export const MOCK_SALES_TRANSACTIONS: SalesTransaction[] = [];
export const MOCK_CASHIER_CLOSINGS: CashierDailyClosing[] = [];
