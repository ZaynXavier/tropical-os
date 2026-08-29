/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { User } from "../../types";
import { MOCK_MENU_HPP_RECIPES, MenuHppRecipe, RecipeIngredient } from "../../data/mockFinanceData";
import {
  Calculator,
  Plus,
  Trash2,
  Sliders,
  TrendingUp,
  Sparkles,
  ChefHat,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Search,
  Filter,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Edit3,
  X,
  BarChart3,
} from "lucide-react";

interface HppCalculatorViewProps {
  user: User;
}

export interface MasterIngredient {
  id: string;
  code: string;
  name: string;
  category: "Protein / Daging" | "Susu & Dairy" | "Biji Kopi & Teh" | "Sayur & Bumbu" | "Pasta & Karbo" | "Packaging & Box" | "Sirup & Sweetener";
  supplier: string;
  purchaseUnit: string;
  purchaseCost: number;
  recipeUnit: string;
  conversionRatio: number;
  wastePercentage: number;
  priceTrend: "UP" | "STABLE" | "DOWN";
  trendPercentage: number;
  lastUpdated: string;
}

const INITIAL_MASTER_INGREDIENTS: MasterIngredient[] = [
  {
    id: "ming-1",
    code: "ING-WAGYU-A5",
    name: "Wagyu Ribeye Meltique A5",
    category: "Protein / Daging",
    supplier: "PT Daging Nusantara Utama",
    purchaseUnit: "Kg",
    purchaseCost: 450000,
    recipeUnit: "Kg",
    conversionRatio: 1,
    wastePercentage: 3,
    priceTrend: "UP",
    trendPercentage: 5.2,
    lastUpdated: "08/08/2026",
  },
  {
    id: "ming-2",
    code: "ING-TRUFFLE-PASTE",
    name: "Truffle Butter Paste Italian",
    category: "Sayur & Bumbu",
    supplier: "Gourmet Import Indah",
    purchaseUnit: "Jar (500g)",
    purchaseCost: 200000,
    recipeUnit: "Gram",
    conversionRatio: 500,
    wastePercentage: 0,
    priceTrend: "STABLE",
    trendPercentage: 0,
    lastUpdated: "05/08/2026",
  },
  {
    id: "ming-3",
    code: "ING-POTATO-MASH",
    name: "Mashed Potato Seasoned",
    category: "Pasta & Karbo",
    supplier: "PT Pangan Mandiri",
    purchaseUnit: "Bag (1 Kg)",
    purchaseCost: 60000,
    recipeUnit: "Gram",
    conversionRatio: 1000,
    wastePercentage: 5,
    priceTrend: "STABLE",
    trendPercentage: 0,
    lastUpdated: "01/08/2026",
  },
  {
    id: "ming-4",
    code: "ING-COFFEE-HB",
    name: "House Blend Roasted Coffee Beans",
    category: "Biji Kopi & Teh",
    supplier: "Gudang Kopi Nusantara",
    purchaseUnit: "Bag (1 Kg)",
    purchaseCost: 125000,
    recipeUnit: "Gram",
    conversionRatio: 1000,
    wastePercentage: 2,
    priceTrend: "UP",
    trendPercentage: 8.5,
    lastUpdated: "08/08/2026",
  },
  {
    id: "ming-5",
    code: "ING-MILK-GREENFIELDS",
    name: "Greenfields Fresh Milk Pasteurized",
    category: "Susu & Dairy",
    supplier: "CV Distribusi Susu Fresh",
    purchaseUnit: "Carton (1000 Ml)",
    purchaseCost: 32000,
    recipeUnit: "Ml",
    conversionRatio: 1000,
    wastePercentage: 0,
    priceTrend: "STABLE",
    trendPercentage: 0,
    lastUpdated: "07/08/2026",
  },
  {
    id: "ming-6",
    code: "ING-CONDENSED-MILK",
    name: "Sweetened Condensed Milk Premium",
    category: "Susu & Dairy",
    supplier: "CV Distribusi Susu Fresh",
    purchaseUnit: "Can (370 Ml)",
    purchaseCost: 16650,
    recipeUnit: "Ml",
    conversionRatio: 370,
    wastePercentage: 0,
    priceTrend: "DOWN",
    trendPercentage: -2.1,
    lastUpdated: "06/08/2026",
  },
  {
    id: "ming-7",
    code: "ING-BOX-STEAK",
    name: "Craft Box Eco Takeaway + Wooden Fork",
    category: "Packaging & Box",
    supplier: "PT Kemasan Hijau",
    purchaseUnit: "Pack (100 Pcs)",
    purchaseCost: 350000,
    recipeUnit: "Pcs",
    conversionRatio: 100,
    wastePercentage: 0,
    priceTrend: "STABLE",
    trendPercentage: 0,
    lastUpdated: "02/08/2026",
  },
  {
    id: "ming-8",
    code: "ING-CUP-16OZ",
    name: "PET Cold Cup 16oz + Strawless Lid",
    category: "Packaging & Box",
    supplier: "PT Kemasan Hijau",
    purchaseUnit: "Pack (50 Pcs)",
    purchaseCost: 110000,
    recipeUnit: "Pcs",
    conversionRatio: 50,
    wastePercentage: 0,
    priceTrend: "STABLE",
    trendPercentage: 0,
    lastUpdated: "02/08/2026",
  },
];

export const HppCalculatorView: React.FC<HppCalculatorViewProps> = ({ user }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("sub") || "overview";

  // Shared state
  const [recipes, setRecipes] = useState<MenuHppRecipe[]>(MOCK_MENU_HPP_RECIPES);
  const [masterIngredients, setMasterIngredients] = useState<MasterIngredient[]>(INITIAL_MASTER_INGREDIENTS);

  // Active selected recipe for detailed view
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || "rec-1");
  const activeRecipe = recipes.find((r) => r.id === selectedRecipeId) || recipes[0];

  // Filters
  const [ingSearchTerm, setIngSearchTerm] = useState("");
  const [ingCategoryFilter, setIngCategoryFilter] = useState("ALL");

  // New Ingredient Modal State
  const [isAddIngOpen, setIsAddIngOpen] = useState(false);
  const [newIngCode, setNewIngCode] = useState("");
  const [newIngName, setNewIngName] = useState("");
  const [newIngCat, setNewIngCat] = useState<MasterIngredient["category"]>("Protein / Daging");
  const [newIngSupplier, setNewIngSupplier] = useState("");
  const [newIngUnit, setNewIngUnit] = useState("Kg");
  const [newIngCost, setNewIngCost] = useState<number>(100000);
  const [newIngRecipeUnit, setNewIngRecipeUnit] = useState("Gram");
  const [newIngRatio, setNewIngRatio] = useState<number>(1000);
  const [newIngWaste, setNewIngWaste] = useState<number>(0);

  // Recipe Modal State (Form Tambah Menu & Resep HPP)
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [newRecCode, setNewRecCode] = useState("");
  const [newRecName, setNewRecName] = useState("");
  const [newRecCat, setNewRecCat] = useState<MenuHppRecipe["category"]>("Makanan Utama");
  const [newRecPrice, setNewRecPrice] = useState<number>(30000);
  const [newRecPkg, setNewRecPkg] = useState<number>(1500);
  const [newRecGas, setNewRecGas] = useState<number>(1000);
  const [newRecOverheadPct, setNewRecOverheadPct] = useState<number>(5); // Overhead in % as requested
  const [newRecPpn, setNewRecPpn] = useState<number>(11); // PPN %

  // Recipe Ingredients for the Form
  const [formIngredients, setFormIngredients] = useState<
    Array<{
      id: string;
      ingredientId: string;
      name: string;
      quantityNeeded: number;
      unit: string;
      unitCost: number;
      wastePercentage: number;
    }>
  >([
    {
      id: "fi-1",
      ingredientId: "ming-1",
      name: "Wagyu Ribeye Meltique A5",
      quantityNeeded: 0.15,
      unit: "Kg",
      unitCost: 450000,
      wastePercentage: 3,
    },
    {
      id: "fi-2",
      ingredientId: "ming-3",
      name: "Mashed Potato Seasoned",
      quantityNeeded: 100,
      unit: "Gram",
      unitCost: 60,
      wastePercentage: 5,
    },
  ]);

  // Price simulator state
  const [simSelectedRecipeId, setSimSelectedRecipeId] = useState<string>(recipes[0]?.id || "rec-1");
  const simRecipe = recipes.find((r) => r.id === simSelectedRecipeId) || recipes[0];
  const [simTargetMargin, setSimTargetMargin] = useState<number>(simRecipe?.targetMarginPercentage || 70);
  const [simPriceInput, setSimPriceInput] = useState<number>(simRecipe?.currentSellingPrice || 50000);

  // Cost Analysis inflation simulator
  const [inflationRate, setInflationRate] = useState<number>(5);

  const handleTabChange = (tabId: string) => {
    setSearchParams({ sub: tabId });
  };

  // Helper calculations for a recipe
  const calculateRecipeHpp = (recipe?: MenuHppRecipe) => {
    if (!recipe) return { rawCost: 0, totalHpp: 0, grossProfit: 0, actualMargin: 0, recommendedPrice: 0 };
    const rawCost = (recipe.ingredients || []).reduce((acc, curr) => {
      const baseCost = (curr.unitCost || 0) * (curr.quantityNeeded || 0);
      const waste = baseCost * ((curr.wastePercentage || 0) / 100);
      return acc + baseCost + waste;
    }, 0);
    const totalHpp = rawCost + (recipe.packagingCost || 0) + (recipe.laborOverheadCost || 0);
    const grossProfit = (recipe.currentSellingPrice || 0) - totalHpp;
    const actualMargin = (recipe.currentSellingPrice || 0) > 0 ? (grossProfit / recipe.currentSellingPrice) * 100 : 0;
    const recommendedPrice =
      (recipe.targetMarginPercentage || 0) < 100 ? totalHpp / (1 - (recipe.targetMarginPercentage || 0) / 100) : totalHpp;
    return { rawCost, totalHpp, grossProfit, actualMargin, recommendedPrice };
  };

  // Quick stats across all recipes
  const allCalculations = recipes.map((r) => ({ recipe: r, calc: calculateRecipeHpp(r) }));
  const avgMargin =
    allCalculations.length > 0
      ? allCalculations.reduce((acc, curr) => acc + curr.calc.actualMargin, 0) / allCalculations.length
      : 0;
  const avgHpp =
    allCalculations.length > 0
      ? allCalculations.reduce((acc, curr) => acc + curr.calc.totalHpp, 0) / allCalculations.length
      : 0;

  // Add Master Ingredient Handler
  const handleCreateMasterIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName) return;

    const newIng: MasterIngredient = {
      id: `ming-${Date.now()}`,
      code: newIngCode || `ING-${Date.now().toString().slice(-4)}`,
      name: newIngName,
      category: newIngCat,
      supplier: newIngSupplier || "Vendor Lokal",
      purchaseUnit: newIngUnit,
      purchaseCost: newIngCost,
      recipeUnit: newIngRecipeUnit,
      conversionRatio: newIngRatio > 0 ? newIngRatio : 1,
      wastePercentage: newIngWaste,
      priceTrend: "STABLE",
      trendPercentage: 0,
      lastUpdated: new Date().toLocaleDateString("id-ID"),
    };

    setMasterIngredients([newIng, ...masterIngredients]);
    setIsAddIngOpen(false);
    setNewIngName("");
    setNewIngCode("");
  };

  // Form Ingredient Actions
  const handleSelectIngredientInForm = (index: number, masterIngId: string) => {
    const selectedMaster = masterIngredients.find((m) => m.id === masterIngId);
    if (!selectedMaster) return;

    const costPerRecipeUnit = selectedMaster.purchaseCost / (selectedMaster.conversionRatio || 1);
    const updated = [...formIngredients];
    updated[index] = {
      ...updated[index],
      ingredientId: selectedMaster.id,
      name: selectedMaster.name,
      unit: selectedMaster.recipeUnit,
      unitCost: costPerRecipeUnit,
      wastePercentage: selectedMaster.wastePercentage || 0,
    };
    setFormIngredients(updated);
  };

  const handleAddFormIngredientRow = () => {
    const defaultMaster = masterIngredients[0];
    const costPerUnit = defaultMaster ? defaultMaster.purchaseCost / (defaultMaster.conversionRatio || 1) : 10000;
    setFormIngredients([
      ...formIngredients,
      {
        id: `fi-${Date.now()}-${Math.random().toString().slice(-3)}`,
        ingredientId: defaultMaster ? defaultMaster.id : "",
        name: defaultMaster ? defaultMaster.name : "Bahan Baku",
        quantityNeeded: 1,
        unit: defaultMaster ? defaultMaster.recipeUnit : "Porsi",
        unitCost: costPerUnit,
        wastePercentage: defaultMaster ? defaultMaster.wastePercentage : 0,
      },
    ]);
  };

  const handleRemoveFormIngredientRow = (index: number) => {
    setFormIngredients(formIngredients.filter((_, i) => i !== index));
  };

  // Open Form to Edit an existing Recipe
  const handleOpenEditRecipe = (recipe: MenuHppRecipe) => {
    setEditingRecipeId(recipe.id);
    setNewRecCode(recipe.menuCode);
    setNewRecName(recipe.menuName);
    setNewRecCat(recipe.category);
    setNewRecPrice(recipe.currentSellingPrice);
    setNewRecPkg(recipe.packagingCost);
    setNewRecGas(1000);
    setNewRecOverheadPct(5);
    setNewRecPpn(11);
    setFormIngredients(
      recipe.ingredients.map((ing) => ({
        id: ing.id,
        ingredientId: masterIngredients.find((m) => m.name === ing.name)?.id || "",
        name: ing.name,
        quantityNeeded: ing.quantityNeeded,
        unit: ing.unit,
        unitCost: ing.unitCost,
        wastePercentage: ing.wastePercentage || 0,
      }))
    );
    setIsAddRecipeOpen(true);
  };

  // Open Form for New Recipe
  const handleOpenNewRecipeModal = () => {
    setEditingRecipeId(null);
    setNewRecCode(`MNU-${Date.now().toString().slice(-4)}`);
    setNewRecName("");
    setNewRecCat("Makanan Utama");
    setNewRecPrice(30000);
    setNewRecPkg(1500);
    setNewRecGas(1000);
    setNewRecOverheadPct(5);
    setNewRecPpn(11);

    // Default 2 sample ingredients
    const def1 = masterIngredients[0];
    const def2 = masterIngredients[2] || masterIngredients[1];

    setFormIngredients([
      {
        id: `fi-1-${Date.now()}`,
        ingredientId: def1?.id || "",
        name: def1?.name || "Bahan 1",
        quantityNeeded: 0.15,
        unit: def1?.recipeUnit || "Kg",
        unitCost: def1 ? def1.purchaseCost / (def1.conversionRatio || 1) : 50000,
        wastePercentage: def1?.wastePercentage || 0,
      },
      {
        id: `fi-2-${Date.now()}`,
        ingredientId: def2?.id || "",
        name: def2?.name || "Bahan 2",
        quantityNeeded: 1,
        unit: def2?.recipeUnit || "Gram",
        unitCost: def2 ? def2.purchaseCost / (def2.conversionRatio || 1) : 2000,
        wastePercentage: def2?.wastePercentage || 0,
      },
    ]);
    setIsAddRecipeOpen(true);
  };

  // Live Calculations inside the Form Modal
  const formRawIngredientsTotal = formIngredients.reduce((acc, curr) => {
    const base = (curr.quantityNeeded || 0) * (curr.unitCost || 0);
    const waste = base * ((curr.wastePercentage || 0) / 100);
    return acc + base + waste;
  }, 0);

  const formBaseOpsCost = formRawIngredientsTotal + Number(newRecPkg || 0) + Number(newRecGas || 0);
  const formOverheadAmount = formBaseOpsCost * (Number(newRecOverheadPct || 0) / 100);
  const formTotalHpp = formBaseOpsCost + formOverheadAmount;

  const formSellingPrice = Number(newRecPrice || 0);
  const formPriceWithPpn = formSellingPrice * (1 + Number(newRecPpn || 0) / 100);
  const formFoodCostPct = formSellingPrice > 0 ? (formTotalHpp / formSellingPrice) * 100 : 0;

  // Save Menu & Recipe Form Handler
  const handleSaveRecipeForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecName) return;

    const recipeIngredients: RecipeIngredient[] = formIngredients.map((fi) => ({
      id: fi.id || `ing-${Math.random().toString().slice(-4)}`,
      name: fi.name,
      quantityNeeded: Number(fi.quantityNeeded || 0),
      unit: fi.unit || "Porsi",
      unitCost: Number(fi.unitCost || 0),
      wastePercentage: Number(fi.wastePercentage || 0),
    }));

    const totalLaborOverhead = Math.round(formOverheadAmount + Number(newRecGas || 0));

    if (editingRecipeId) {
      setRecipes(
        recipes.map((r) =>
          r.id === editingRecipeId
            ? {
                ...r,
                menuCode: newRecCode || r.menuCode,
                menuName: newRecName,
                category: newRecCat,
                currentSellingPrice: formSellingPrice,
                packagingCost: Number(newRecPkg || 0),
                laborOverheadCost: totalLaborOverhead,
                ingredients: recipeIngredients,
              }
            : r
        )
      );
    } else {
      const newRec: MenuHppRecipe = {
        id: `rec-${Date.now()}`,
        menuCode: newRecCode || `MNU-${Date.now().toString().slice(-4)}`,
        menuName: newRecName,
        category: newRecCat,
        currentSellingPrice: formSellingPrice,
        targetMarginPercentage: 70,
        packagingCost: Number(newRecPkg || 0),
        laborOverheadCost: totalLaborOverhead,
        ingredients: recipeIngredients,
      };
      setRecipes([...recipes, newRec]);
      setSelectedRecipeId(newRec.id);
    }

    setIsAddRecipeOpen(false);
    setEditingRecipeId(null);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in pb-12">
      {/* Top Title & Sub-Menu Navigation Bar */}
      <div className="bg-[#130F30]/80 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                FINANCE &amp; COSTING
              </span>
              <span className="text-xs text-purple-300/60">• Smart Recipe Costing</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
              <Calculator className="w-6 h-6 text-indigo-400" />
              <span>HPP Calculator &amp; Cost Simulator</span>
            </h1>
            <p className="text-xs text-purple-200/70 mt-0.5">
              Kelola database bahan baku, resep porsian, analisis COGS, serta simulasi margin &amp; harga jual resto.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddIngOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Bahan Baru</span>
            </button>
            <button
              onClick={handleOpenNewRecipeModal}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-900/30"
            >
              <ChefHat className="w-4 h-4" />
              <span>Form Resep HPP</span>
            </button>
          </div>
        </div>

        {/* Sub Menu Tabs Bar */}
        <div className="flex items-center gap-2 border-t border-white/10 pt-3 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboardIcon },
            { id: "ingredients", label: "Ingredients", icon: Package },
            { id: "recipes", label: "Recipes", icon: ChefHat },
            { id: "menucost", label: "Menu Cost", icon: FileSpreadsheet },
            { id: "costanalysis", label: "Cost Analysis", icon: BarChart3 },
            { id: "simulator", label: "Price Simulator", icon: Sliders },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40 border border-purple-400/50"
                    : "bg-white/5 text-purple-200/70 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-purple-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-MENU CONTENT SWITCHER */}

      {/* 1. OVERVIEW SUB-MENU */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs font-extrabold text-purple-300/80 uppercase">Rata-Rata Margin Menu</span>
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-emerald-400 mt-2 font-mono">{avgMargin.toFixed(1)}%</div>
              <p className="text-[11px] text-purple-200/70 mt-1">Target Industri: &gt; 65%</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs font-extrabold text-purple-300/80 uppercase">Rata-Rata HPP Porsi</span>
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Calculator className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-amber-300 mt-2 font-mono">
                Rp {Math.round(avgHpp).toLocaleString("id-ID")}
              </div>
              <p className="text-[11px] text-purple-200/70 mt-1">Bahan + Packaging + Overhead</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs font-extrabold text-purple-300/80 uppercase">Master Bahan Baku</span>
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-white mt-2 font-mono">
                {masterIngredients.length}{" "}
                <span className="text-sm font-sans font-normal text-purple-300">Items</span>
              </div>
              <p className="text-[11px] text-amber-300 mt-1 flex items-center gap-1 font-extrabold">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                <span>2 Bahan Alami Kenaikan Harga</span>
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[#130F30]/70 border border-white/10 backdrop-blur-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs font-extrabold text-purple-300/80 uppercase">Resep Aktif</span>
                <div className="p-2 rounded-xl bg-pink-500/20 text-pink-300">
                  <ChefHat className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-white mt-2 font-mono">
                {recipes.length} <span className="text-sm font-sans font-normal text-purple-300">Menu</span>
              </div>
              <p className="text-[11px] text-purple-200/70 mt-1">Terintegrasi POS &amp; Kasir</p>
            </div>
          </div>

          {/* Quick Action Cards & Recipe Health */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Kesehatan Profitabilitas Resep Menu</span>
                </h3>
                <button
                  onClick={handleOpenNewRecipeModal}
                  className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Menu HPP</span>
                </button>
              </div>

              <div className="space-y-3">
                {allCalculations.map(({ recipe, calc }) => {
                  const isHealthy = calc.actualMargin >= 65;
                  const isModerate = calc.actualMargin >= 50 && calc.actualMargin < 65;

                  return (
                    <div
                      key={recipe.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/10 transition-all"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded-full bg-white/10">
                            {recipe.menuCode}
                          </span>
                          <span className="text-[10px] text-purple-300/70">{recipe.category}</span>
                        </div>
                        <h4 className="font-bold text-sm text-white truncate">{recipe.menuName}</h4>
                        <div className="flex items-center gap-3 text-xs font-mono">
                          <span className="text-purple-300/70">
                            HPP: <strong className="text-amber-300">Rp {Math.round(calc.totalHpp).toLocaleString("id-ID")}</strong>
                          </span>
                          <span className="text-purple-300/70">
                            Harga: <strong className="text-emerald-400">Rp {(recipe.currentSellingPrice ?? 0).toLocaleString("id-ID")}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => handleOpenEditRecipe(recipe)}
                          className="p-2 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                          title="Edit Resep HPP"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <div
                          className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-black ${
                            isHealthy
                              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                              : isModerate
                              ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                              : "bg-red-500/20 border-red-500/40 text-red-300"
                          }`}
                        >
                          {calc.actualMargin.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#130F30]/70 p-6 rounded-3xl border border-amber-500/30 backdrop-blur-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="font-extrabold text-sm text-amber-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Peringatan Fluktuasi Harga Bahan</span>
                  </h3>
                  <button onClick={() => handleTabChange("ingredients")} className="text-xs text-amber-400 font-bold hover:underline">
                    Buka Database
                  </button>
                </div>

                <div className="space-y-3">
                  {masterIngredients
                    .filter((i) => i.priceTrend === "UP")
                    .map((ing) => (
                      <div key={ing.id} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                        <div>
                          <strong className="block text-xs text-white">{ing.name}</strong>
                          <span className="text-[10px] text-purple-300/70">{ing.supplier}</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-xs font-bold text-amber-400 flex items-center justify-end gap-1">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            +{ing.trendPercentage}%
                          </span>
                          <span className="text-[10px] text-purple-300/70">
                            Rp {(ing.purchaseCost ?? 0).toLocaleString("id-ID")} / {ing.purchaseUnit}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. INGREDIENTS SUB-MENU */}
      {activeTab === "ingredients" && (
        <div className="space-y-6">
          <div className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari bahan baku, vendor, atau kode..."
                value={ingSearchTerm}
                onChange={(e) => setIngSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-purple-300/50 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <Filter className="w-4 h-4 text-purple-400 shrink-0" />
              {["ALL", "Protein / Daging", "Susu & Dairy", "Biji Kopi & Teh", "Packaging & Box"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setIngCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    ingCategoryFilter === cat ? "bg-purple-600 text-white" : "bg-white/5 text-purple-200/70 hover:bg-white/10"
                  }`}
                >
                  {cat === "ALL" ? "Semua Kategori" : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#130F30]/70 rounded-3xl border border-white/10 backdrop-blur-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-400" />
                <span>Database Master Bahan Baku &amp; Harga Vendor</span>
              </h3>
              <span className="text-xs text-purple-300/70 font-mono">{masterIngredients.length} Total Items</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white/5 text-purple-300/80 font-bold uppercase text-[10px] border-b border-white/10">
                    <th className="p-3.5">Kode &amp; Nama Bahan</th>
                    <th className="p-3.5">Kategori &amp; Vendor</th>
                    <th className="p-3.5">Satuan Beli</th>
                    <th className="p-3.5">Harga Beli (Rp)</th>
                    <th className="p-3.5">Satuan Resep</th>
                    <th className="p-3.5">Biaya / Satuan Resep</th>
                    <th className="p-3.5">Waste %</th>
                    <th className="p-3.5">Tren Harga</th>
                    <th className="p-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {masterIngredients
                    .filter((item) => {
                      const matchesSearch =
                        item.name.toLowerCase().includes(ingSearchTerm.toLowerCase()) ||
                        item.code.toLowerCase().includes(ingSearchTerm.toLowerCase()) ||
                        item.supplier.toLowerCase().includes(ingSearchTerm.toLowerCase());
                      const matchesCat = ingCategoryFilter === "ALL" || item.category === ingCategoryFilter;
                      return matchesSearch && matchesCat;
                    })
                    .map((item) => {
                      const costPerRecipeUnit = item.purchaseCost / (item.conversionRatio || 1);

                      return (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3.5">
                            <span className="text-[10px] font-mono text-purple-300 block">{item.code}</span>
                            <strong className="text-white text-xs">{item.name}</strong>
                          </td>
                          <td className="p-3.5">
                            <span className="text-purple-200 block">{item.category}</span>
                            <span className="text-[10px] text-purple-300/60">{item.supplier}</span>
                          </td>
                          <td className="p-3.5 font-mono text-purple-200">{item.purchaseUnit}</td>
                          <td className="p-3.5 font-mono font-bold text-amber-300">
                            Rp {(item.purchaseCost ?? 0).toLocaleString("id-ID")}
                          </td>
                          <td className="p-3.5 font-mono text-purple-200">{item.recipeUnit}</td>
                          <td className="p-3.5 font-mono font-bold text-emerald-400">
                            Rp {Math.round(costPerRecipeUnit).toLocaleString("id-ID")} / {item.recipeUnit}
                          </td>
                          <td className="p-3.5 font-mono text-amber-400 font-bold">{item.wastePercentage}%</td>
                          <td className="p-3.5 font-mono">
                            {item.priceTrend === "UP" && (
                              <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                +{item.trendPercentage}%
                              </span>
                            )}
                            {item.priceTrend === "DOWN" && (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                                <ArrowDownRight className="w-3.5 h-3.5" />
                                {item.trendPercentage}%
                              </span>
                            )}
                            {item.priceTrend === "STABLE" && <span className="text-purple-300/60">Stabil</span>}
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => setMasterIngredients(masterIngredients.filter((i) => i.id !== item.id))}
                              className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                              title="Hapus Bahan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. RECIPES SUB-MENU */}
      {activeTab === "recipes" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#130F30]/70 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-purple-400" />
                  <span>Daftar Resep Resto</span>
                </h3>
                <button
                  onClick={handleOpenNewRecipeModal}
                  className="p-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Resep</span>
                </button>
              </div>

              <div className="space-y-2">
                {recipes.map((rec) => {
                  const isSelected = rec.id === selectedRecipeId;
                  const calc = calculateRecipeHpp(rec);

                  return (
                    <button
                      key={rec.id}
                      onClick={() => setSelectedRecipeId(rec.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border-purple-400 text-white shadow-lg shadow-purple-900/30 font-bold"
                          : "bg-white/5 border-white/5 text-purple-200/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono text-purple-300">{rec.menuCode}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-purple-200">{rec.category}</span>
                      </div>
                      <strong className="block text-sm mt-1">{rec.menuName}</strong>
                      <div className="flex justify-between items-center text-xs mt-2 font-mono">
                        <span className="text-purple-300/70">HPP: Rp {Math.round(calc.totalHpp).toLocaleString("id-ID")}</span>
                        <span className="text-emerald-400 font-extrabold">Margin {calc.actualMargin.toFixed(0)}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-purple-300">{activeRecipe?.menuCode}</span>
                  <h2 className="text-xl font-extrabold text-white">{activeRecipe?.menuName}</h2>
                  <p className="text-xs text-purple-300/70">{activeRecipe?.category}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenEditRecipe(activeRecipe)}
                    className="px-3.5 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Resep HPP</span>
                  </button>

                  <div className="text-right">
                    <span className="text-[10px] text-purple-300/70 block">Harga POS Jual</span>
                    <span className="text-lg font-black font-mono text-emerald-400">
                      Rp {(activeRecipe?.currentSellingPrice ?? 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs text-purple-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Komponen Bahan Baku Per Porsi</span>
                  <span className="text-amber-400 font-mono">
                    Total Raw: Rp {Math.round(calculateRecipeHpp(activeRecipe)?.rawCost ?? 0).toLocaleString("id-ID")}
                  </span>
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-white/5 text-purple-300/80 font-bold uppercase text-[10px] border-b border-white/10">
                        <th className="p-3">Nama Bahan</th>
                        <th className="p-3">Harga Satuan</th>
                        <th className="p-3">Porsi Diperlukan</th>
                        <th className="p-3">Waste %</th>
                        <th className="p-3">Total Biaya Porsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {(activeRecipe?.ingredients || []).map((ing) => {
                        const baseCost = ing.unitCost * ing.quantityNeeded;
                        const itemTotal = baseCost + baseCost * ((ing.wastePercentage || 0) / 100);

                        return (
                          <tr key={ing.id} className="hover:bg-white/5">
                            <td className="p-3 font-bold text-white">{ing.name}</td>
                            <td className="p-3 font-mono text-purple-200">
                              Rp {(ing.unitCost ?? 0).toLocaleString("id-ID")} / {ing.unit}
                            </td>
                            <td className="p-3 font-mono text-white">
                              {ing.quantityNeeded} {ing.unit}
                            </td>
                            <td className="p-3 font-mono text-amber-300">{ing.wastePercentage}%</td>
                            <td className="p-3 font-mono font-bold text-emerald-400">
                              Rp {Math.round(itemTotal).toLocaleString("id-ID")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MENU COST SUB-MENU */}
      {activeTab === "menucost" && (
        <div className="space-y-6">
          <div className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Matriks Biaya &amp; Margin HPP Seluruh Menu</span>
                </h3>
                <p className="text-xs text-purple-200/70">Rincian komponen HPP vs Harga Jual POS dan Laba Kotor.</p>
              </div>

              <button
                onClick={handleOpenNewRecipeModal}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/30"
              >
                <Plus className="w-4 h-4" />
                <span>Form Resep HPP</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white/5 text-purple-300/80 font-bold uppercase text-[10px] border-b border-white/10">
                    <th className="p-3.5">Kode &amp; Nama Menu</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Biaya Bahan Raw</th>
                    <th className="p-3.5">Packaging</th>
                    <th className="p-3.5">Overhead</th>
                    <th className="p-3.5">Total HPP</th>
                    <th className="p-3.5">Harga POS</th>
                    <th className="p-3.5">Laba Kotor</th>
                    <th className="p-3.5">Margin %</th>
                    <th className="p-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {recipes.map((rec) => {
                    const calc = calculateRecipeHpp(rec);
                    const isHealthy = calc.actualMargin >= 65;

                    return (
                      <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5">
                          <span className="text-[10px] font-mono text-purple-300 block">{rec.menuCode}</span>
                          <strong className="text-white text-xs">{rec.menuName}</strong>
                        </td>
                        <td className="p-3.5 text-purple-200">{rec.category}</td>
                        <td className="p-3.5 font-mono text-purple-200">
                          Rp {Math.round(calc?.rawCost ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="p-3.5 font-mono text-purple-300/80">
                          Rp {(rec.packagingCost ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="p-3.5 font-mono text-purple-300/80">
                          Rp {(rec.laborOverheadCost ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-amber-300">
                          Rp {Math.round(calc?.totalHpp ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400">
                          Rp {(rec.currentSellingPrice ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-300">
                          Rp {Math.round(calc?.grossProfit ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="p-3.5 font-mono font-black text-sm">{calc.actualMargin.toFixed(1)}%</td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleOpenEditRecipe(rec)}
                            className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                            title="Edit Resep"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. COST ANALYSIS SUB-MENU */}
      {activeTab === "costanalysis" && (
        <div className="space-y-6">
          <div className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Simulasi Sensitivitas Inflasi Bahan Baku</span>
                </h3>
                <p className="text-xs text-purple-200/70">
                  Uji dampak jika harga bahan baku di pasar naik sekian persen terhadap total HPP dan margin restoran.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-purple-200">Asumsi Kenaikan Harga:</span>
                <span className="font-mono font-black text-amber-400 text-lg">+{inflationRate}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white/5 text-purple-300/80 font-bold uppercase text-[10px]">
                    <th className="p-3">Nama Menu</th>
                    <th className="p-3">HPP Saat Ini</th>
                    <th className="p-3">HPP Setelah Inflasi (+{inflationRate}%)</th>
                    <th className="p-3">Selisih Kenaikan Biaya</th>
                    <th className="p-3">Margin Saat Ini</th>
                    <th className="p-3">Margin Baru</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {recipes.map((rec) => {
                    const calc = calculateRecipeHpp(rec);
                    const inflatedRawCost = calc.rawCost * (1 + inflationRate / 100);
                    const newTotalHpp = inflatedRawCost + rec.packagingCost + rec.laborOverheadCost;
                    const newGrossProfit = rec.currentSellingPrice - newTotalHpp;
                    const newMargin = rec.currentSellingPrice > 0 ? (newGrossProfit / rec.currentSellingPrice) * 100 : 0;

                    return (
                      <tr key={rec.id} className="hover:bg-white/5">
                        <td className="p-3 font-bold text-white">{rec.menuName}</td>
                        <td className="p-3 font-mono text-purple-200">
                          Rp {Math.round(calc.totalHpp).toLocaleString("id-ID")}
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-300">
                          Rp {Math.round(newTotalHpp).toLocaleString("id-ID")}
                        </td>
                        <td className="p-3 font-mono text-red-400 font-bold">
                          +Rp {Math.round(newTotalHpp - calc.totalHpp).toLocaleString("id-ID")}
                        </td>
                        <td className="p-3 font-mono text-emerald-400 font-bold">{calc.actualMargin.toFixed(1)}%</td>
                        <td className="p-3 font-mono text-amber-300 font-bold">{newMargin.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. PRICE SIMULATOR SUB-MENU */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>Parameter Simulator Harga</span>
              </h3>

              <div>
                <label className="font-bold text-xs text-purple-200 block mb-1">Pilih Menu Resto:</label>
                <select
                  value={simSelectedRecipeId}
                  onChange={(e) => {
                    setSimSelectedRecipeId(e.target.value);
                    const found = recipes.find((r) => r.id === e.target.value);
                    if (found) {
                      setSimPriceInput(found.currentSellingPrice);
                      setSimTargetMargin(found.targetMarginPercentage || 70);
                    }
                  }}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-xs bg-[#130F30]"
                >
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.menuName} ({r.menuCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-xs text-purple-200 block mb-1">Simulasi Harga Jual POS (Rp):</label>
                <input
                  type="number"
                  step="1000"
                  value={simPriceInput}
                  onChange={(e) => setSimPriceInput(Number(e.target.value))}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl font-mono text-white text-sm font-bold"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-purple-200">Target Margin Keuntungan (%):</span>
                  <span className="text-emerald-400 font-mono">{simTargetMargin}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="85"
                  step="1"
                  value={simTargetMargin}
                  onChange={(e) => setSimTargetMargin(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#130F30]/70 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl space-y-6">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Hasil Simulasi &amp; Rekomendasi Harga</span>
              </h3>

              {(() => {
                const calc = calculateRecipeHpp(simRecipe);
                const simGrossProfit = simPriceInput - calc.totalHpp;
                const simMargin = simPriceInput > 0 ? (simGrossProfit / simPriceInput) * 100 : 0;
                const recommendedPrice = simTargetMargin < 100 ? calc.totalHpp / (1 - simTargetMargin / 100) : calc.totalHpp;

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-purple-300 uppercase font-extrabold block">Total HPP per Porsi</span>
                        <span className="text-xl font-black font-mono text-amber-300 mt-1 block">
                          Rp {Math.round(calc.totalHpp).toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-purple-300 uppercase font-extrabold block">Margin Hasil Simulasi</span>
                        <span className="text-xl font-black font-mono text-emerald-400 mt-1 block">
                          {simMargin.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                      <span className="text-xs text-emerald-300 font-extrabold block">
                        Rekomendasi Harga Jual Ideal (Margin {simTargetMargin}%):
                      </span>
                      <div className="text-2xl font-black font-mono text-emerald-400">
                        Rp {Math.round(recommendedPrice).toLocaleString("id-ID")}
                      </div>
                      <p className="text-[11px] text-purple-200/70">
                        Dibulatkan ke kelipatan Rp 1.000 terdekat:{" "}
                        <strong className="text-white">
                          Rp {(Math.ceil(recommendedPrice / 1000) * 1000).toLocaleString("id-ID")}
                        </strong>
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD MASTER INGREDIENT */}
      {isAddIngOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#130F30] border border-white/20 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-fade-in text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                <span>Tambah Master Bahan Baku Baru</span>
              </h3>
              <button onClick={() => setIsAddIngOpen(false)} className="text-purple-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMasterIngredient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Kode Bahan:</label>
                  <input
                    type="text"
                    placeholder="Contoh: ING-MILK-01"
                    value={newIngCode}
                    onChange={(e) => setNewIngCode(e.target.value)}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Kategori:</label>
                  <select
                    value={newIngCat}
                    onChange={(e) => setNewIngCat(e.target.value as MasterIngredient["category"])}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white bg-[#130F30]"
                  >
                    <option value="Protein / Daging">Protein / Daging</option>
                    <option value="Susu & Dairy">Susu &amp; Dairy</option>
                    <option value="Biji Kopi & Teh">Biji Kopi &amp; Teh</option>
                    <option value="Sayur & Bumbu">Sayur &amp; Bumbu</option>
                    <option value="Pasta & Karbo">Pasta &amp; Karbo</option>
                    <option value="Packaging & Box">Packaging &amp; Box</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-200 block mb-1">Nama Bahan Baku *:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Fresh Milk Pasteurized 1L"
                  value={newIngName}
                  onChange={(e) => setNewIngName(e.target.value)}
                  className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Supplier / Vendor:</label>
                  <input
                    type="text"
                    placeholder="Contoh: PT Dairy Fresh"
                    value={newIngSupplier}
                    onChange={(e) => setNewIngSupplier(e.target.value)}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Harga Beli Vendor (Rp):</label>
                  <input
                    type="number"
                    required
                    value={newIngCost}
                    onChange={(e) => setNewIngCost(Number(e.target.value))}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-xl font-mono text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddIngOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
                >
                  Simpan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FORM TAMBAH / EDIT MENU & RESEP HPP (SPECIFIED BY USER) */}
      {isAddRecipeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#130F30] border border-white/20 rounded-3xl p-6 max-w-3xl w-full space-y-5 shadow-2xl animate-fade-in text-white my-8 max-h-[92vh] overflow-y-auto no-scrollbar">
            {/* Modal Title Bar */}
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-white">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <span>Form {editingRecipeId ? "Edit" : "Tambah"} Menu &amp; Resep HPP</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddRecipeOpen(false);
                  setEditingRecipeId(null);
                }}
                className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipeForm} className="space-y-4 text-xs">
              {/* Row 1: Nama Menu & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-purple-200 block mb-1">
                    Nama Menu Restoran <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Nasi Goreng Sambal Hijau"
                    value={newRecName}
                    onChange={(e) => setNewRecName(e.target.value)}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Kategori Menu</label>
                  <select
                    value={newRecCat}
                    onChange={(e) => setNewRecCat(e.target.value as MenuHppRecipe["category"])}
                    className="w-full p-2.5 bg-[#130F30] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Makanan Utama">Food (Makanan)</option>
                    <option value="Barista Coffee">Beverage (Minuman)</option>
                    <option value="Pasta & Starter">Pasta &amp; Starter</option>
                    <option value="Dessert & Artisan">Dessert &amp; Artisan</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Costing & Tax Parameters Box (Overhead Cost uses % as requested) */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="font-bold text-purple-200 block mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    step="500"
                    required
                    value={newRecPrice}
                    onChange={(e) => setNewRecPrice(Number(e.target.value))}
                    className="w-full p-2 bg-black/40 border border-white/10 rounded-xl font-mono text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-purple-200 block mb-1">Biaya Kemasan (Rp)</label>
                  <input
                    type="number"
                    step="100"
                    value={newRecPkg}
                    onChange={(e) => setNewRecPkg(Number(e.target.value))}
                    className="w-full p-2 bg-black/40 border border-white/10 rounded-xl font-mono text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-purple-200 block mb-1">Biaya Gas &amp; Utl (Rp)</label>
                  <input
                    type="number"
                    step="100"
                    value={newRecGas}
                    onChange={(e) => setNewRecGas(Number(e.target.value))}
                    className="w-full p-2 bg-black/40 border border-white/10 rounded-xl font-mono text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-purple-200 block mb-1">Overhead Cost (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newRecOverheadPct}
                    onChange={(e) => setNewRecOverheadPct(Number(e.target.value))}
                    className="w-full p-2 bg-black/40 border border-white/10 rounded-xl font-mono text-amber-300 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-purple-200 block mb-1">PPN (%)</label>
                  <input
                    type="number"
                    step="1"
                    value={newRecPpn}
                    onChange={(e) => setNewRecPpn(Number(e.target.value))}
                    className="w-full p-2 bg-black/40 border border-white/10 rounded-xl font-mono text-white text-xs font-bold"
                  />
                </div>
              </div>

              {/* Row 3: Daftar Bahan & Komposisi Resep */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <span>Daftar Bahan &amp; Komposisi Resep</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddFormIngredientRow}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Bahan</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 no-scrollbar">
                  {formIngredients.map((row, idx) => {
                    const lineTotal = (row.quantityNeeded || 0) * (row.unitCost || 0) * (1 + (row.wastePercentage || 0) / 100);

                    return (
                      <div
                        key={row.id || idx}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center gap-2.5"
                      >
                        {/* Dropdown selecting master ingredient */}
                        <div className="flex-1 w-full sm:w-auto">
                          <select
                            value={row.ingredientId}
                            onChange={(e) => handleSelectIngredientInForm(idx, e.target.value)}
                            className="w-full p-2 bg-[#130F30] border border-white/10 rounded-xl text-white font-bold text-xs"
                          >
                            <option value="">-- Pilih Bahan Baku --</option>
                            {masterIngredients.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({(m.purchaseCost || 0).toLocaleString("id-ID")}/{m.purchaseUnit})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity input */}
                        <div className="w-24 shrink-0">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Qty"
                            value={row.quantityNeeded}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const updated = [...formIngredients];
                              updated[idx].quantityNeeded = val;
                              setFormIngredients(updated);
                            }}
                            className="w-full p-2 bg-black/40 border border-white/10 rounded-xl font-mono text-white text-center text-xs font-bold"
                          />
                        </div>

                        {/* Unit Display */}
                        <div className="w-20 shrink-0 text-center">
                          <span className="px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-purple-200 font-mono text-xs block truncate">
                            {row.unit || "Porsi"}
                          </span>
                        </div>

                        {/* Unit Cost input */}
                        <div className="w-28 shrink-0">
                          <input
                            type="number"
                            step="100"
                            min="0"
                            placeholder="Harga Satuan"
                            value={row.unitCost}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const updated = [...formIngredients];
                              updated[idx].unitCost = val;
                              setFormIngredients(updated);
                            }}
                            className="w-full p-2 bg-black/40 border border-white/10 rounded-xl font-mono text-emerald-400 text-right text-xs font-bold"
                          />
                        </div>

                        {/* Line Total */}
                        <div className="w-28 shrink-0 text-right font-mono font-bold text-white text-xs">
                          Rp {Math.round(lineTotal).toLocaleString("id-ID")}
                        </div>

                        {/* Delete row */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFormIngredientRow(idx)}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-600 hover:text-white transition-all cursor-pointer shrink-0"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Live Summary Card (Dark container adhering to theme) */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <span className="text-[10px] text-purple-300 uppercase font-extrabold block">TOTAL HPP BAHAN + OPS</span>
                  <span className="text-sm font-black font-mono text-emerald-400 block mt-0.5">
                    Rp {Math.round(formTotalHpp ?? 0).toLocaleString("id-ID")}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-purple-300 uppercase font-extrabold block">SIMULASI JUAL</span>
                  <span className="text-sm font-black font-mono text-indigo-300 block mt-0.5">
                    Rp {(formSellingPrice ?? 0).toLocaleString("id-ID")}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-purple-300 uppercase font-extrabold block">
                    HARGA + PPN ({newRecPpn}%)
                  </span>
                  <span className="text-sm font-black font-mono text-amber-300 block mt-0.5">
                    Rp {Math.round(formPriceWithPpn ?? 0).toLocaleString("id-ID")}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-purple-300 uppercase font-extrabold block">FOOD COST %</span>
                  <span
                    className={`text-sm font-black font-mono block mt-0.5 ${
                      formFoodCostPct <= 35
                        ? "text-emerald-400"
                        : formFoodCostPct <= 45
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {formFoodCostPct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddRecipeOpen(false);
                    setEditingRecipeId(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Menu &amp; Resep</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// LayoutDashboardIcon helper
function LayoutDashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
