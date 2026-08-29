import React, { useState } from 'react';
import { EmployeePersonnel } from '../../../types/employee';
import { MOCK_RECIPES } from '../../../data/mockRecipes';
import { MOCK_PRODUCTION_BATCHES } from '../../../data/mockProduction';
import { Recipe } from '../../../types/recipe';
import {
  Utensils,
  ChefHat,
  Coffee,
  Package,
  Layers,
  Sparkles,
  Search,
  Filter,
  Clock,
  DollarSign,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Scale,
  Send,
  X,
  FileText,
  Calendar,
  Building2,
  ChevronRight,
  Eye,
  Info,
  Calculator,
  Trash2,
  Percent,
  Coins,
  Sliders,
  Tag,
  Check
} from 'lucide-react';

interface KitchenBarProductionTabProps {
  currentUser: EmployeePersonnel | null;
  onNavigateTab?: (tab: string) => void;
}

interface PurchaseRequestItem {
  id: string;
  prNumber: string;
  itemName: string;
  category: string;
  department: 'Kitchen' | 'Bar';
  quantity: number;
  unit: string;
  estimatedCost: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  requestedBy: string;
  date: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'PURCHASED' | 'REJECTED';
}

interface RecipeIngredientForm {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number; // Cost per unit (e.g. per kg, per gram, per liter)
  notes?: string;
}

const INITIAL_PURCHASE_REQUESTS: PurchaseRequestItem[] = [
  {
    id: 'pr-01',
    prNumber: 'PR-KIT-20260828-01',
    itemName: 'Daging Beef Meltique Sirloin 200g Cut',
    category: 'Daging & Seafood',
    department: 'Kitchen',
    quantity: 15,
    unit: 'Kg',
    estimatedCost: 2175000,
    urgency: 'HIGH',
    reason: 'Stok daging steak menipis untuk peak hour weekend (Target 60 porsi)',
    requestedBy: 'Eko Prasetyo (Head Kitchen)',
    date: '28 Agt 2026',
    status: 'APPROVED',
  },
  {
    id: 'pr-02',
    prNumber: 'PR-BAR-20260828-02',
    itemName: 'Greenfields Fresh Milk Pasteurized 1L',
    category: 'Dairy & Beverage',
    department: 'Bar',
    quantity: 36,
    unit: 'Liter',
    estimatedCost: 1152000,
    urgency: 'HIGH',
    reason: 'Kebutuhan latte & coffee beverage 2 hari ke depan',
    requestedBy: 'Rizky Ramadan (Head Bar)',
    date: '28 Agt 2026',
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'pr-03',
    prNumber: 'PR-KIT-20260828-03',
    itemName: 'Cabai Rawit Merah & Bawang Merah Brebes',
    category: 'Sayur & Bumbu',
    department: 'Kitchen',
    quantity: 8,
    unit: 'Kg',
    estimatedCost: 380000,
    urgency: 'MEDIUM',
    reason: 'Bahan dasar batching Sambal Matah Bali & Sambal Terasi',
    requestedBy: 'Tasnim (Cook)',
    date: '28 Agt 2026',
    status: 'APPROVED',
  },
  {
    id: 'pr-04',
    prNumber: 'PR-BAR-20260828-04',
    itemName: 'Sirup Monin Caramel & Hazelnut 700ml',
    category: 'Sirup & Beverage',
    department: 'Bar',
    quantity: 6,
    unit: 'Botol',
    estimatedCost: 1050000,
    urgency: 'MEDIUM',
    reason: 'Restock signature flavored latte & mocktail garden',
    requestedBy: 'Azizah (Barista)',
    date: '27 Agt 2026',
    status: 'PURCHASED',
  },
];

export const KitchenBarProductionTab: React.FC<KitchenBarProductionTabProps> = ({
  currentUser,
}) => {
  const [activeSubView, setActiveSubView] = useState<'recipes' | 'batch' | 'purchasing'>('recipes');

  // Department determination
  const userDept = currentUser?.department?.toLowerCase() || '';
  const isBarUser = userDept.includes('bar');
  const isKitchenUser = userDept.includes('kit') || userDept.includes('dapur');

  // Master Recipes State (allows adding new recipes & recalculating HPP live)
  const [recipesList, setRecipesList] = useState<Recipe[]>(MOCK_RECIPES);

  // Default category filter based on user's department
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'FOOD' | 'BEVERAGE' | 'PREP'>(
    isBarUser ? 'BEVERAGE' : isKitchenUser ? 'FOOD' : 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
  const [simulatedSellingPrice, setSimulatedSellingPrice] = useState<number>(0);

  // ============================================================
  // ADD NEW RECIPE & HPP CALCULATOR MODAL STATE
  // ============================================================
  const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeCategory, setNewRecipeCategory] = useState<'Main Course' | 'Beverage' | 'Snack & App' | 'Prep & Sauce' | 'Dessert'>('Main Course');
  const [newRecipeStation, setNewRecipeStation] = useState(isBarUser ? 'Bar Station' : 'Kitchen Hot Line');
  const [newRecipeSellingPrice, setNewRecipeSellingPrice] = useState<number>(45000);
  const [newRecipePrepTime, setNewRecipePrepTime] = useState<number>(10);
  const [newRecipeCookTime, setNewRecipeCookTime] = useState<number>(12);
  const [newRecipeDescription, setNewRecipeDescription] = useState('');
  const [newRecipePortionSize, setNewRecipePortionSize] = useState<number>(1);
  const [newRecipePortionUnit, setNewRecipePortionUnit] = useState('Porsi');
  const [newRecipePackagingCost, setNewRecipePackagingCost] = useState<number>(2000);
  const [newRecipeLaborCost, setNewRecipeLaborCost] = useState<number>(3000);
  
  const [newRecipeIngredients, setNewRecipeIngredients] = useState<RecipeIngredientForm[]>([
    { id: 'ing-1', name: 'Bahan Utama (Daging/Kopi/Susu)', quantity: 0.15, unit: 'Kg', unitCost: 110000, notes: 'Portion bersih' },
    { id: 'ing-2', name: 'Bumbu / Sirup / Condiment', quantity: 0.03, unit: 'Liter', unitCost: 45000, notes: 'Racikan standard' },
    { id: 'ing-3', name: 'Garnish / Pelengkap', quantity: 1, unit: 'Pcs', unitCost: 1500, notes: 'Hiasan saji' },
  ]);

  // Live HPP Calculations for New Recipe
  const totalIngredientsCost = newRecipeIngredients.reduce(
    (sum, ing) => sum + (Number(ing.quantity) || 0) * (Number(ing.unitCost) || 0),
    0
  );
  const totalNewRecipeHpp = totalIngredientsCost + Number(newRecipePackagingCost || 0) + Number(newRecipeLaborCost || 0);
  const newRecipeHppPct = newRecipeSellingPrice > 0 ? (totalNewRecipeHpp / newRecipeSellingPrice) * 100 : 0;
  const newRecipeGrossMarginPct = newRecipeSellingPrice > 0 ? ((newRecipeSellingPrice - totalNewRecipeHpp) / newRecipeSellingPrice) * 100 : 0;
  const newRecipeGrossProfit = newRecipeSellingPrice - totalNewRecipeHpp;
  const suggestedSellingPriceTarget30 = totalNewRecipeHpp > 0 ? Math.round(totalNewRecipeHpp / 0.30 / 1000) * 1000 : 0;

  const handleAddIngredientRow = () => {
    setNewRecipeIngredients([
      ...newRecipeIngredients,
      {
        id: `ing-${Date.now()}-${Math.floor(Math.random() * 100)}`,
        name: '',
        quantity: 1,
        unit: 'Gram',
        unitCost: 50,
      },
    ]);
  };

  const handleRemoveIngredientRow = (id: string) => {
    if (newRecipeIngredients.length <= 1) return;
    setNewRecipeIngredients(newRecipeIngredients.filter((ing) => ing.id !== id));
  };

  const handleUpdateIngredient = (id: string, field: keyof RecipeIngredientForm, val: any) => {
    setNewRecipeIngredients(
      newRecipeIngredients.map((ing) => (ing.id === id ? { ...ing, [field]: val } : ing))
    );
  };

  const handleSaveNewRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipeName.trim()) return;

    const newCode = `RCP-${newRecipeCategory.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const createdRecipe: Recipe = {
      id: `rcp-${Date.now()}`,
      recipeCode: newCode,
      recipeName: newRecipeName,
      menuCategory: newRecipeCategory,
      description: newRecipeDescription || `Resep baru ${newRecipeName} dibuat melalui Mobile Staff Portal`,
      status: 'ACTIVE',
      version: 1,
      sellingPrice: newRecipeSellingPrice,
      targetFoodCostPercentage: Math.round(newRecipeHppPct) || 32,
      targetMarginPercentage: Math.round(newRecipeGrossMarginPct) || 68,
      yieldQuantity: newRecipePortionSize,
      yieldUnit: newRecipePortionUnit,
      portionSize: newRecipePortionSize,
      portionUnit: newRecipePortionUnit,
      totalPortions: 1,
      preparationTimeMinutes: newRecipePrepTime,
      cookingTimeMinutes: newRecipeCookTime,
      totalTimeMinutes: newRecipePrepTime + newRecipeCookTime,
      difficulty: 'MEDIUM',
      stationId: `st-${newRecipeStation.toLowerCase().replace(/\s+/g, '-')}`,
      stationName: newRecipeStation,
      packagingCost: newRecipePackagingCost,
      laborOverheadCost: newRecipeLaborCost,
      createdBy: currentUser?.id || 'emp-portal',
      createdByName: currentUser?.name || 'Staff Kitchen/Bar',
      createdAt: new Date().toISOString(),
      updatedBy: currentUser?.id || 'emp-portal',
      updatedByName: currentUser?.name || 'Staff Kitchen/Bar',
      updatedAt: new Date().toISOString(),
      ingredients: newRecipeIngredients.map((ing, idx) => ({
        id: `ing-created-${idx}-${Date.now()}`,
        recipeId: `rcp-${Date.now()}`,
        inventoryItemId: `inv-custom-${idx}`,
        inventoryItemSku: `SKU-${idx + 100}`,
        inventoryItemName: ing.name || `Bahan Baku ${idx + 1}`,
        quantity: Number(ing.quantity) || 1,
        unit: ing.unit,
        preparationLossPercentage: 0,
        cookingLossPercentage: 0,
        totalLossPercentage: 0,
        effectiveQuantity: Number(ing.quantity) || 1,
        unitCost: Number(ing.unitCost) || 0,
        totalCost: (Number(ing.quantity) || 0) * (Number(ing.unitCost) || 0),
        isKeyIngredient: idx === 0,
        notes: ing.notes,
      })),
    };

    setRecipesList([createdRecipe, ...recipesList]);
    setIsAddRecipeModalOpen(false);
    setSelectedRecipe(createdRecipe);
    setPortionMultiplier(1);
    setSimulatedSellingPrice(createdRecipe.sellingPrice);

    // Reset form
    setNewRecipeName('');
    setNewRecipeDescription('');
  };

  // Batch Production State
  const [batches, setBatches] = useState(MOCK_PRODUCTION_BATCHES);
  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);
  const [newBatchRecipeId, setNewBatchRecipeId] = useState(recipesList[0]?.id || '');
  const [newBatchTargetYield, setNewBatchTargetYield] = useState<number>(5);
  const [newBatchNotes, setNewBatchNotes] = useState('');

  // Purchasing Request State
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequestItem[]>(INITIAL_PURCHASE_REQUESTS);
  const [isNewPrModalOpen, setIsNewPrModalOpen] = useState(false);
  const [newPrItemName, setNewPrItemName] = useState('');
  const [newPrCategory, setNewPrCategory] = useState('Sayur & Bumbu');
  const [newPrQuantity, setNewPrQuantity] = useState<number>(5);
  const [newPrUnit, setNewPrUnit] = useState('Kg');
  const [newPrEstimatedCost, setNewPrEstimatedCost] = useState<number>(150000);
  const [newPrUrgency, setNewPrUrgency] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [newPrReason, setNewPrReason] = useState('');

  // Filter recipes
  const filteredRecipes = recipesList.filter((r) => {
    const isBeverage = r.menuCategory?.toLowerCase().includes('drink') || 
                      r.menuCategory?.toLowerCase().includes('beverage') || 
                      r.menuCategory?.toLowerCase().includes('coffee') ||
                      r.stationName?.toLowerCase().includes('bar');
    const isPrep = r.menuCategory?.toLowerCase().includes('prep') || 
                   r.menuCategory?.toLowerCase().includes('sauce') ||
                   r.recipeName?.toLowerCase().includes('batch') ||
                   r.recipeName?.toLowerCase().includes('sambal') ||
                   r.recipeName?.toLowerCase().includes('syrup');
    
    let matchesCategory = true;
    if (categoryFilter === 'FOOD') matchesCategory = !isBeverage && !isPrep;
    else if (categoryFilter === 'BEVERAGE') matchesCategory = isBeverage;
    else if (categoryFilter === 'PREP') matchesCategory = isPrep;

    const matchesSearch =
      !searchQuery ||
      r.recipeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.recipeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const recipe = recipesList.find((r) => r.id === newBatchRecipeId) || recipesList[0];
    const newBatch = {
      id: `prod-${Date.now()}`,
      productionNumber: `PROD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      recipeId: recipe.id,
      recipeCode: recipe.recipeCode,
      recipeName: recipe.recipeName,
      recipeVersion: recipe.version,
      productionDate: new Date().toISOString().slice(0, 10),
      productionType: 'BATCH_PREP' as const,
      stationId: recipe.stationId || 'st-kitchen-prep',
      stationName: recipe.stationName || 'Prep Line',
      targetDepartment: isBarUser ? 'Bar' : 'Kitchen',
      plannedBatchCount: 1,
      plannedQuantity: newBatchTargetYield,
      yieldUnit: recipe.yieldUnit || 'Kg',
      theoreticalYield: newBatchTargetYield,
      actualYield: newBatchTargetYield * 0.98,
      yieldVariance: -(newBatchTargetYield * 0.02),
      yieldPercentage: 98,
      yieldStatus: 'OPTIMAL' as const,
      status: 'IN_PROGRESS' as const,
      theoreticalCost: (recipe.sellingPrice * 0.35) * newBatchTargetYield,
      actualCost: (recipe.sellingPrice * 0.355) * newBatchTargetYield,
      theoreticalUnitHpp: recipe.sellingPrice * 0.35,
      actualUnitHpp: recipe.sellingPrice * 0.355,
      costVariance: 1500,
      ingredients: (recipe.ingredients || []).map((ing) => ({
        inventoryItemId: ing.inventoryItemId,
        inventoryItemSku: ing.inventoryItemSku,
        inventoryItemName: ing.inventoryItemName,
        expectedQuantity: ing.effectiveQuantity * newBatchTargetYield,
        actualQuantity: ing.effectiveQuantity * newBatchTargetYield,
        unit: ing.unit,
        unitCost: ing.unitCost,
        totalCost: ing.totalCost * newBatchTargetYield,
        varianceQuantity: 0,
        variancePercentage: 0,
      })),
    };

    setBatches([newBatch as any, ...batches]);
    setIsNewBatchModalOpen(false);
    setNewBatchNotes('');
  };

  const handleCreatePr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrItemName.trim()) return;

    const newPr: PurchaseRequestItem = {
      id: `pr-${Date.now()}`,
      prNumber: `PR-${isBarUser ? 'BAR' : 'KIT'}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`,
      itemName: newPrItemName,
      category: newPrCategory,
      department: isBarUser ? 'Bar' : 'Kitchen',
      quantity: newPrQuantity,
      unit: newPrUnit,
      estimatedCost: newPrEstimatedCost,
      urgency: newPrUrgency,
      reason: newPrReason || 'Kebutuhan stok operasional stasiun harian',
      requestedBy: currentUser?.name || 'Staff Kitchen/Bar',
      date: 'Hari Ini',
      status: 'PENDING_APPROVAL',
    };

    setPurchaseRequests([newPr, ...purchaseRequests]);
    setIsNewPrModalOpen(false);
    setNewPrItemName('');
    setNewPrReason('');
  };

  // Helper for selected recipe HPP
  const selectedRecipeIngredientsCost = (selectedRecipe?.ingredients || []).reduce(
    (sum, ing) => sum + (ing.totalCost || 0),
    0
  );
  const selectedRecipeTotalHpp =
    selectedRecipeIngredientsCost +
    (selectedRecipe?.packagingCost || 0) +
    (selectedRecipe?.laborOverheadCost || 0);
  const effectiveSellingPrice = simulatedSellingPrice || selectedRecipe?.sellingPrice || 1;
  const simulatedHppPct = (selectedRecipeTotalHpp / effectiveSellingPrice) * 100;
  const simulatedMarginPct = ((effectiveSellingPrice - selectedRecipeTotalHpp) / effectiveSellingPrice) * 100;

  return (
    <div className="space-y-4 animate-fade-in text-gray-100">
      {/* Header Banner */}
      <div className="p-4 rounded-[26px] bg-gradient-to-r from-[#1B2138] via-[#161D30] to-[#121626] border border-cyan-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold shadow-inner">
              {isBarUser ? <Coffee className="w-5 h-5" /> : <ChefHat className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wide uppercase">
                {isBarUser ? 'Bar & Beverage Hub' : 'Kitchen & Culinary Hub'}
              </h2>
              <p className="text-[10px] text-cyan-200">
                Resep &amp; HPP • Batching • Permintaan PR
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {currentUser?.department || 'Kitchen / Bar'}
          </span>
        </div>

        {/* 3 Main View Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/5 text-xs font-bold">
          <button
            onClick={() => setActiveSubView('recipes')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubView === 'recipes'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span className="text-[11px]">Resep &amp; HPP</span>
          </button>

          <button
            onClick={() => setActiveSubView('batch')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubView === 'batch'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[11px]">Produksi Batch</span>
          </button>

          <button
            onClick={() => setActiveSubView('purchasing')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubView === 'purchasing'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span className="text-[11px]">Purchasing (PR)</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          VIEW 1: RECIPE MANAGEMENT, ADD RECIPE & HPP CALCULATOR
      ============================================================ */}
      {activeSubView === 'recipes' && (
        <div className="space-y-3.5 animate-fade-in">
          {/* Header Action: Tambah Resep & Kalkulator HPP */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#17233B] via-[#141C30] to-[#121626] border border-cyan-500/40 shadow-md flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-cyan-400" />
                <span>Katalog Resep &amp; Hitung HPP</span>
              </div>
              <div className="text-[10px] text-gray-400">
                Tambah menu baru &amp; hitung Food Cost otomatis
              </div>
            </div>

            <button
              onClick={() => setIsAddRecipeModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/30 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Resep &amp; HPP</span>
            </button>
          </div>

          {/* Search & Category Chips */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama resep, bahan, kode..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[#141A29] border border-[#263148] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] font-bold">
              {[
                { id: 'ALL', label: 'Semua Resep' },
                { id: 'FOOD', label: '🍳 Kitchen' },
                { id: 'BEVERAGE', label: '☕ Bar' },
                { id: 'PREP', label: '🥣 Batch/Saus' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryFilter(c.id as any)}
                  className={`px-3 py-1.5 rounded-xl border whitespace-nowrap cursor-pointer transition-all ${
                    categoryFilter === c.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                      : 'bg-[#151C2C] text-gray-400 border-white/5 hover:border-white/10'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recipe List Cards */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-gray-400 font-semibold px-1">
              <span>{filteredRecipes.length} Resep Terdaftar</span>
              <span className="text-[10px] text-cyan-400">Klik untuk Kalkulasi HPP &amp; SOP</span>
            </div>

            {filteredRecipes.map((recipe) => {
              const totalBOM = (recipe.ingredients || []).reduce((sum, ing) => sum + (ing.totalCost || 0), 0);
              const totalHpp = totalBOM + (recipe.packagingCost || 0) + (recipe.laborOverheadCost || 0);
              const hppPct = recipe.sellingPrice > 0 ? (totalHpp / recipe.sellingPrice) * 100 : 0;
              const marginPct = recipe.sellingPrice > 0 ? ((recipe.sellingPrice - totalHpp) / recipe.sellingPrice) * 100 : 0;

              return (
                <div
                  key={recipe.id}
                  onClick={() => {
                    setSelectedRecipe(recipe);
                    setPortionMultiplier(1);
                    setSimulatedSellingPrice(recipe.sellingPrice);
                  }}
                  className="p-3.5 rounded-2xl bg-[#151C2C] border border-[#27324A] hover:border-cyan-500/50 transition-all cursor-pointer shadow-md group space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-300 group-hover:scale-105 transition-transform shadow-inner">
                        {recipe.menuCategory?.toLowerCase().includes('drink') || recipe.stationName?.toLowerCase().includes('bar') ? (
                          <Coffee className="w-5 h-5" />
                        ) : (
                          <Utensils className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                            {recipe.recipeName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                          <span className="px-1.5 py-0.2 rounded bg-black/40 text-cyan-300 border border-white/5 font-mono">
                            {recipe.recipeCode}
                          </span>
                          <span>•</span>
                          <span className="truncate">{recipe.stationName || 'Line'}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>

                  {/* Financial & HPP Pill Row */}
                  <div className="p-2 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-[10px]">
                    <div>
                      <span className="text-gray-400 block">Harga Jual</span>
                      <span className="font-bold text-emerald-400">
                        Rp {recipe.sellingPrice.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="text-center">
                      <span className="text-gray-400 block">Total HPP / Porsi</span>
                      <span className="font-bold text-cyan-300">
                        Rp {Math.round(totalHpp).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-gray-400 block">Food Cost &amp; Margin</span>
                      <div className="flex items-center gap-1 justify-end font-bold">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] ${
                          hppPct <= 35 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {hppPct.toFixed(0)}% HPP
                        </span>
                        <span className="text-emerald-400">
                          {marginPct.toFixed(0)}% Mgn
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================
          VIEW 2: BATCH PRODUCTION
      ============================================================ */}
      {activeSubView === 'batch' && (
        <div className="space-y-3.5 animate-fade-in">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#141A29] border border-[#27324A] shadow-md">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Jadwal Produksi Batch</span>
              </div>
              <div className="text-[10px] text-gray-400">
                Prep saus, sirup, kaldu, &amp; bumbu dasar resto
              </div>
            </div>

            <button
              onClick={() => setIsNewBatchModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Mulai Batch Baru</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="p-4 rounded-2xl bg-[#151C2C] border border-[#27324A] shadow-md space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {batch.recipeName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {batch.productionNumber}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      Target Stasiun: {batch.stationName} • {batch.productionDate}
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {batch.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[10px] text-gray-400 block">Rencana Yield:</span>
                    <span className="font-bold text-white">{batch.plannedQuantity} {batch.yieldUnit}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[10px] text-gray-400 block">Hasil Aktual:</span>
                    <span className="font-bold text-emerald-400">{batch.actualYield} {batch.yieldUnit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          VIEW 3: PURCHASING & PURCHASE REQUISITION (PR)
      ============================================================ */}
      {activeSubView === 'purchasing' && (
        <div className="space-y-3.5 animate-fade-in">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#141A29] border border-[#27324A] shadow-md">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Package className="w-4 h-4 text-cyan-400" />
                <span>Permintaan Barang (PR)</span>
              </div>
              <div className="text-[10px] text-gray-400">
                Pengajuan belanja bahan baku stasiun harian
              </div>
            </div>

            <button
              onClick={() => setIsNewPrModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat PR Baru</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {purchaseRequests.map((pr) => (
              <div
                key={pr.id}
                className="p-3.5 rounded-2xl bg-[#151C2C] border border-[#27324A] shadow-md space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{pr.itemName}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                        pr.urgency === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {pr.urgency}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {pr.prNumber} • {pr.category}
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                    pr.status === 'APPROVED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : pr.status === 'PURCHASED'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {pr.status === 'APPROVED' ? '✓ Disetujui' : pr.status === 'PURCHASED' ? '📦 Dibelanjakan' : '⏳ Menunggu SPV'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Jumlah Diminta:</span>
                    <span className="font-bold text-cyan-300">{pr.quantity} {pr.unit}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">Estimasi Biaya:</span>
                    <span className="font-bold text-emerald-400">Rp {pr.estimatedCost.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="text-[10px] text-gray-300 bg-white/5 p-2 rounded-lg italic">
                  "{pr.reason}"
                </div>

                <div className="flex items-center justify-between text-[9px] text-gray-400 pt-1 border-t border-white/5">
                  <span>Diajukan: {pr.requestedBy}</span>
                  <span>{pr.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: TAMBAH RESEP BARU & KALKULATOR HPP INTERAKTIF
      ============================================================ */}
      {isAddRecipeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg max-h-[90vh] bg-[#101626] border border-[#27324A] rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#232C42] bg-[#141C30] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">
                    Tambah Resep Baru &amp; Hitung HPP
                  </h3>
                  <div className="text-[10px] text-gray-400">
                    Input komposisi bahan &amp; analisis margin otomatis
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsAddRecipeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveNewRecipe} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs no-scrollbar">
              {/* Section 1: Basic Info */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Informasi Menu &amp; Stasiun</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-300">Nama Resep / Menu:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Wagyu Beef Bowl Sambal Matah..."
                    value={newRecipeName}
                    onChange={(e) => setNewRecipeName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none focus:border-cyan-500 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-300">Kategori Menu:</label>
                    <select
                      value={newRecipeCategory}
                      onChange={(e) => setNewRecipeCategory(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none"
                    >
                      <option value="Main Course">🍳 Main Course (Makanan)</option>
                      <option value="Beverage">☕ Beverage (Minuman / Kopi)</option>
                      <option value="Snack & App">🍟 Snack &amp; Appetizer</option>
                      <option value="Prep & Sauce">🥣 Prep / Saus / Batching</option>
                      <option value="Dessert">🍰 Dessert</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-300">Stasiun Produksi:</label>
                    <input
                      type="text"
                      value={newRecipeStation}
                      onChange={(e) => setNewRecipeStation(e.target.value)}
                      placeholder="Kitchen Hot Line / Bar"
                      className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="space-y-1">
                    <label className="text-gray-300 font-bold">Porsi Saji:</label>
                    <input
                      type="number"
                      min="1"
                      value={newRecipePortionSize}
                      onChange={(e) => setNewRecipePortionSize(Number(e.target.value))}
                      className="w-full p-2 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-300 font-bold">Waktu Prep (mnt):</label>
                    <input
                      type="number"
                      min="0"
                      value={newRecipePrepTime}
                      onChange={(e) => setNewRecipePrepTime(Number(e.target.value))}
                      className="w-full p-2 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-300 font-bold">Waktu Masak (mnt):</label>
                    <input
                      type="number"
                      min="0"
                      value={newRecipeCookTime}
                      onChange={(e) => setNewRecipeCookTime(Number(e.target.value))}
                      className="w-full p-2 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Dynamic Ingredients (BOM) & Unit Cost */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Komposisi Bahan Baku (BOM)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Bahan</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {newRecipeIngredients.map((ing, idx) => (
                    <div
                      key={ing.id}
                      className="p-2.5 rounded-xl bg-[#141A29] border border-white/5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-gray-400">#{idx + 1}</span>
                        <input
                          type="text"
                          required
                          placeholder="Nama Bahan Baku..."
                          value={ing.name}
                          onChange={(e) => handleUpdateIngredient(ing.id, 'name', e.target.value)}
                          className="flex-1 p-1.5 rounded-lg bg-[#192236] border border-[#2D3A54] text-white font-semibold text-xs outline-none"
                        />
                        {newRecipeIngredients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredientRow(ing.id)}
                            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                        <div>
                          <span className="text-gray-400 block mb-0.5">Jumlah Qty:</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0.001"
                            value={ing.quantity}
                            onChange={(e) => handleUpdateIngredient(ing.id, 'quantity', Number(e.target.value))}
                            className="w-full p-1.5 rounded-lg bg-[#192236] border border-[#2D3A54] text-white font-bold outline-none"
                          />
                        </div>
                        <div>
                          <span className="text-gray-400 block mb-0.5">Satuan:</span>
                          <select
                            value={ing.unit}
                            onChange={(e) => handleUpdateIngredient(ing.id, 'unit', e.target.value)}
                            className="w-full p-1.5 rounded-lg bg-[#192236] border border-[#2D3A54] text-white outline-none font-bold"
                          >
                            <option value="Gram">Gram</option>
                            <option value="Kg">Kg</option>
                            <option value="Ml">Ml</option>
                            <option value="Liter">Liter</option>
                            <option value="Pcs">Pcs</option>
                            <option value="Slice">Slice</option>
                            <option value="Sdm">Sdm</option>
                          </select>
                        </div>
                        <div>
                          <span className="text-gray-400 block mb-0.5">Harga / Satuan:</span>
                          <input
                            type="number"
                            step="100"
                            value={ing.unitCost}
                            onChange={(e) => handleUpdateIngredient(ing.id, 'unitCost', Number(e.target.value))}
                            className="w-full p-1.5 rounded-lg bg-[#192236] border border-[#2D3A54] text-cyan-300 font-bold outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
                        <input
                          type="text"
                          placeholder="Catatan takaran / potong..."
                          value={ing.notes || ''}
                          onChange={(e) => handleUpdateIngredient(ing.id, 'notes', e.target.value)}
                          className="flex-1 bg-transparent text-[10px] text-gray-300 outline-none pr-2"
                        />
                        <span className="font-bold text-white font-mono shrink-0">
                          Subtotal: Rp {Math.round(ing.quantity * ing.unitCost).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Overhead, Packaging & Selling Price */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Biaya Tambahan &amp; Harga Jual Menu</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-300 font-bold">Biaya Packaging (Rp):</label>
                    <input
                      type="number"
                      step="500"
                      value={newRecipePackagingCost}
                      onChange={(e) => setNewRecipePackagingCost(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white font-bold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-300 font-bold">Overhead &amp; Labor (Rp):</label>
                    <input
                      type="number"
                      step="500"
                      value={newRecipeLaborCost}
                      onChange={(e) => setNewRecipeLaborCost(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-emerald-400">Harga Jual Menu (Selling Price):</label>
                    {suggestedSellingPriceTarget30 > 0 && (
                      <button
                        type="button"
                        onClick={() => setNewRecipeSellingPrice(suggestedSellingPriceTarget30)}
                        className="text-[9px] font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                      >
                        Target 30% HPP: Rp {suggestedSellingPriceTarget30.toLocaleString('id-ID')}
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={newRecipeSellingPrice}
                    onChange={(e) => setNewRecipeSellingPrice(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-[#161D2E] border border-emerald-500/40 text-emerald-400 text-base font-black outline-none font-mono"
                  />
                </div>
              </div>

              {/* Section 4: Live HPP & Profit Margin Dashboard Summary */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#121B30] to-[#0D1322] border border-cyan-500/40 space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Hasil Kalkulasi HPP &amp; Margin:</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    newRecipeHppPct <= 35
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : newRecipeHppPct <= 42
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {newRecipeHppPct <= 35 ? '🟢 Food Cost Ideal' : newRecipeHppPct <= 42 ? '🟡 Margin Tipis' : '🔴 Food Cost Tinggi'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-gray-400 block">Total HPP</span>
                    <span className="font-bold text-cyan-300 text-xs font-mono">
                      Rp {Math.round(totalNewRecipeHpp).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-gray-400 block">Food Cost %</span>
                    <span className="font-black text-amber-300 text-xs font-mono">
                      {newRecipeHppPct.toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-gray-400 block">Gross Profit</span>
                    <span className="font-bold text-emerald-400 text-xs font-mono">
                      Rp {Math.round(newRecipeGrossProfit).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-gray-300 bg-white/5 p-2 rounded-xl flex items-center justify-between">
                  <span>Gross Margin: <strong className="text-emerald-400">{newRecipeGrossMarginPct.toFixed(1)}%</strong></span>
                  <span>Bahan Baku: <strong>Rp {Math.round(totalIngredientsCost).toLocaleString('id-ID')}</strong></span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300">Deskripsi / Langkah SOP Masak Singkat:</label>
                <textarea
                  rows={2}
                  value={newRecipeDescription}
                  onChange={(e) => setNewRecipeDescription(e.target.value)}
                  placeholder="Contoh: Marinasi daging 15 menit, grill medium well, sajikan dengan french fries..."
                  className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none resize-none text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRecipeModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-md cursor-pointer"
                >
                  Simpan Resep &amp; HPP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: RECIPE DETAIL, SOP PORTION SCALER & HPP SIMULATOR
      ============================================================ */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md max-h-[85vh] bg-[#101626] border border-[#27324A] rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="p-4 border-b border-[#232C42] bg-[#141C30] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white truncate max-w-[240px]">
                    {selectedRecipe.recipeName}
                  </h3>
                  <div className="text-[10px] text-gray-400">
                    {selectedRecipe.recipeCode} • {selectedRecipe.stationName || 'Line Resto'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs no-scrollbar">
              {/* Portion Multiplier Scaler */}
              <div className="p-3 rounded-2xl bg-[#162035] border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Skala Porsi Masak / Racik:</span>
                  </span>
                  <span className="text-xs font-black text-white px-2.5 py-0.5 rounded-lg bg-cyan-600 font-mono">
                    {portionMultiplier}x Porsi
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[1, 2, 5, 10].map((mult) => (
                    <button
                      key={mult}
                      onClick={() => setPortionMultiplier(mult)}
                      className={`py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                        portionMultiplier === mult
                          ? 'bg-cyan-500 text-black shadow-md'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {mult}x
                    </button>
                  ))}
                </div>
              </div>

              {/* HPP & Margin Analysis Box */}
              <div className="p-3.5 rounded-2xl bg-[#131A2B] border border-emerald-500/30 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Analisis HPP &amp; Food Cost:</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">
                    Margin: {simulatedMarginPct.toFixed(1)}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-gray-400 block">Total HPP / Porsi</span>
                    <span className="font-bold text-cyan-300 font-mono">
                      Rp {Math.round(selectedRecipeTotalHpp).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-gray-400 block">Food Cost %</span>
                    <span className="font-black text-amber-300 font-mono">
                      {simulatedHppPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-gray-400 block">Harga Jual</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      Rp {effectiveSellingPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Selling Price Simulator Slider */}
                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-gray-300">
                    <span className="flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-cyan-400" />
                      <span>Simulasi Ubah Harga Jual:</span>
                    </span>
                    <span className="font-bold text-emerald-400 font-mono">
                      Rp {effectiveSellingPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={Math.round(selectedRecipeTotalHpp * 1.1)}
                    max={Math.round(selectedRecipeTotalHpp * 4)}
                    step="5000"
                    value={effectiveSellingPrice}
                    onChange={(e) => setSimulatedSellingPrice(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-gray-500">
                    <span>Min (10% Margin)</span>
                    <span>Target 70% Margin</span>
                    <span>Max</span>
                  </div>
                </div>
              </div>

              {/* Description & Target */}
              {selectedRecipe.description && (
                <div className="text-[11px] text-gray-300 bg-white/5 p-3 rounded-xl leading-relaxed border border-white/5">
                  {selectedRecipe.description}
                </div>
              )}

              {/* Ingredients Breakdown Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-bold text-white text-xs">
                  <span>Bahan Baku &amp; Takaran ({portionMultiplier}x):</span>
                  <span className="text-[10px] text-cyan-400 font-normal">
                    {selectedRecipe.ingredients?.length || 0} Bahan
                  </span>
                </div>

                <div className="space-y-1.5">
                  {(selectedRecipe.ingredients || []).map((ing, idx) => (
                    <div
                      key={ing.id || idx}
                      className="p-2.5 rounded-xl bg-[#141A29] border border-white/5 flex items-center justify-between text-[11px]"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-gray-200 truncate">
                          {ing.inventoryItemName}
                        </div>
                        {ing.notes && (
                          <div className="text-[9px] text-gray-400 italic truncate">{ing.notes}</div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-cyan-300 font-mono">
                          {(ing.quantity * portionMultiplier).toFixed(2).replace(/\.00$/, '')} {ing.unit}
                        </span>
                        <div className="text-[9px] text-gray-400">
                          Rp {Math.round(ing.totalCost * portionMultiplier).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#232C42] bg-[#141C30] flex gap-2">
              <button
                onClick={() => setSelectedRecipe(null)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Tutup SOP Resep
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: NEW BATCH PRODUCTION JOB
      ============================================================ */}
      {isNewBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#101626] border border-[#27324A] rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-[#232C42] bg-[#141C30] flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Mulai Batch Produksi Prep Baru</span>
              </h3>
              <button
                onClick={() => setIsNewBatchModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="p-4 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300">Pilih Resep / Saus / Sirup Prep:</label>
                <select
                  value={newBatchRecipeId}
                  onChange={(e) => setNewBatchRecipeId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none"
                >
                  {recipesList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.recipeName} ({r.menuCategory})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300">Target Hasil Produksi (Yield):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={newBatchTargetYield}
                    onChange={(e) => setNewBatchTargetYield(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none font-bold"
                  />
                  <span className="text-xs font-bold text-gray-400 px-3 py-2.5 rounded-xl bg-black/40">
                    Kg / Ltr
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300">Catatan Stasiun / Batch Shift:</label>
                <textarea
                  rows={2}
                  value={newBatchNotes}
                  onChange={(e) => setNewBatchNotes(e.target.value)}
                  placeholder="Contoh: Persiapan batching untuk weekend dinner..."
                  className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewBatchModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-md cursor-pointer"
                >
                  Mulai Produksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: NEW PURCHASE REQUISITION (PR)
      ============================================================ */}
      {isNewPrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#101626] border border-[#27324A] rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-[#232C42] bg-[#141C30] flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-400" />
                <span>Buat Pengajuan Belanja Barang (PR)</span>
              </h3>
              <button
                onClick={() => setIsNewPrModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePr} className="p-4 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300">Nama Bahan / Barang:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Daging Sirloin Meltique / Fresh Milk..."
                  value={newPrItemName}
                  onChange={(e) => setNewPrItemName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-300">Jumlah &amp; Satuan:</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min="1"
                      value={newPrQuantity}
                      onChange={(e) => setNewPrQuantity(Number(e.target.value))}
                      className="w-16 p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white font-bold outline-none"
                    />
                    <select
                      value={newPrUnit}
                      onChange={(e) => setNewPrUnit(e.target.value)}
                      className="flex-1 p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none"
                    >
                      <option value="Kg">Kg</option>
                      <option value="Liter">Liter</option>
                      <option value="Botol">Botol</option>
                      <option value="Pack">Pack</option>
                      <option value="Pcs">Pcs</option>
                      <option value="Tabung">Tabung (Gas)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-300">Urgensi Kebutuhan:</label>
                  <select
                    value={newPrUrgency}
                    onChange={(e) => setNewPrUrgency(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none font-bold"
                  >
                    <option value="HIGH">🔴 URGENT (Hari Ini)</option>
                    <option value="MEDIUM">🟡 MEDIUM (Besok)</option>
                    <option value="LOW">🟢 LOW (Rutin)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300">Estimasi Total Biaya (Rp):</label>
                <input
                  type="number"
                  step="10000"
                  value={newPrEstimatedCost}
                  onChange={(e) => setNewPrEstimatedCost(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-emerald-400 font-bold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300">Alasan Kebutuhan Stasiun:</label>
                <textarea
                  rows={2}
                  value={newPrReason}
                  onChange={(e) => setNewPrReason(e.target.value)}
                  placeholder="Contoh: Stok sisa 1 pack, persiapan menu reservasi VIP malam..."
                  className="w-full p-2.5 rounded-xl bg-[#161D2E] border border-[#2A364E] text-white outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPrModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-md cursor-pointer"
                >
                  Kirim PR ke SPV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
