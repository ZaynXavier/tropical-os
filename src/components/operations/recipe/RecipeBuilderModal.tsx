/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.7 — RECIPE BUILDER & DETAIL MODAL
 * Interactive Modal for creating, editing, calculating BOM, and auditing versions.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  DollarSign,
  ChefHat,
  Scale,
  Percent,
  Layers,
  History,
  FileText,
  Save,
  CheckCircle,
  Copy,
  ChevronDown,
  Sparkles,
  Info,
} from 'lucide-react';
import { Recipe, RecipeIngredient, RecipeInstructionStep, RecipeCategory, RecipeDifficulty, RecipeStatus, RecipeVersionHistory } from '../../../types/recipe';
import { InventoryItem } from '../../../types/inventory';
import { inventoryService } from '../../../services/inventoryService';
import { recipeService } from '../../../services/recipeService';

interface RecipeBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (recipe: Recipe) => void;
  initialRecipe?: Recipe | null;
  currentUser?: { id: string; name: string };
}

const CATEGORIES: RecipeCategory[] = [
  'Main Course',
  'Appetizer',
  'Beverage',
  'Dessert',
  'Sauce / Semi-Finished',
  'Soup / Broth',
  'Side Dish',
  'Bakery / Pastry',
];

const DIFFICULTIES: RecipeDifficulty[] = ['EASY', 'MEDIUM', 'HARD', 'CHEF_SPECIAL'];

export const RecipeBuilderModal: React.FC<RecipeBuilderModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialRecipe,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'ingredients' | 'instructions' | 'versions'>('details');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [versionHistory, setVersionHistory] = useState<RecipeVersionHistory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changeReason, setChangeReason] = useState('');

  // Form State
  const [recipeCode, setRecipeCode] = useState('');
  const [recipeName, setRecipeName] = useState('');
  const [menuCategory, setMenuCategory] = useState<RecipeCategory>('Main Course');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<RecipeStatus>('ACTIVE');
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [targetFoodCostPercentage, setTargetFoodCostPercentage] = useState<number>(30);
  const [targetMarginPercentage, setTargetMarginPercentage] = useState<number>(70);
  const [yieldQuantity, setYieldQuantity] = useState<number>(1);
  const [yieldUnit, setYieldUnit] = useState<string>('Portion');
  const [portionSize, setPortionSize] = useState<number>(1);
  const [portionUnit, setPortionUnit] = useState<string>('Portion');
  const [totalPortions, setTotalPortions] = useState<number>(1);
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState<number>(10);
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>('MEDIUM');
  const [stationName, setStationName] = useState<string>('Kitchen Hot Line');
  const [packagingCost, setPackagingCost] = useState<number>(0);
  const [laborOverheadCost, setLaborOverheadCost] = useState<number>(0);

  // Ingredients & Instructions
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [instructions, setInstructions] = useState<RecipeInstructionStep[]>([]);

  // Load Inventory Master Data
  useEffect(() => {
    if (isOpen) {
      inventoryService.getInventoryItems().then((items) => setInventoryItems(items || []));
    }
  }, [isOpen]);

  // Populate Form on Edit or Reset on Create
  useEffect(() => {
    if (!isOpen) return;

    if (initialRecipe) {
      setRecipeCode(initialRecipe.recipeCode || '');
      setRecipeName(initialRecipe.recipeName || '');
      setMenuCategory(initialRecipe.menuCategory || 'Main Course');
      setDescription(initialRecipe.description || '');
      setStatus(initialRecipe.status || 'ACTIVE');
      setSellingPrice(initialRecipe.sellingPrice ?? 0);
      setTargetFoodCostPercentage(initialRecipe.targetFoodCostPercentage ?? 30);
      setTargetMarginPercentage(initialRecipe.targetMarginPercentage ?? 70);
      setYieldQuantity(initialRecipe.yieldQuantity ?? 1);
      setYieldUnit(initialRecipe.yieldUnit || 'Portion');
      setPortionSize(initialRecipe.portionSize ?? 1);
      setPortionUnit(initialRecipe.portionUnit || 'Portion');
      setTotalPortions(initialRecipe.totalPortions ?? 1);
      setPreparationTimeMinutes(initialRecipe.preparationTimeMinutes ?? 10);
      setCookingTimeMinutes(initialRecipe.cookingTimeMinutes ?? 10);
      setDifficulty(initialRecipe.difficulty || 'MEDIUM');
      setStationName(initialRecipe.stationName || 'Kitchen Hot Line');
      setPackagingCost(initialRecipe.packagingCost ?? 0);
      setLaborOverheadCost(initialRecipe.laborOverheadCost ?? 0);
      setIngredients(initialRecipe.ingredients ? [...initialRecipe.ingredients] : []);
      setInstructions(initialRecipe.instructions ? [...initialRecipe.instructions] : []);
      setChangeReason('');

      // Load versions
      recipeService.getRecipeVersions(initialRecipe.id).then((v) => setVersionHistory(v || []));
    } else {
      const randomCode = `RCP-${Math.floor(100 + Math.random() * 900)}`;
      setRecipeCode(randomCode);
      setRecipeName('');
      setMenuCategory('Main Course');
      setDescription('');
      setStatus('ACTIVE');
      setSellingPrice(50000);
      setTargetFoodCostPercentage(30);
      setTargetMarginPercentage(70);
      setYieldQuantity(1);
      setYieldUnit('Portion');
      setPortionSize(1);
      setPortionUnit('Portion');
      setTotalPortions(1);
      setPreparationTimeMinutes(10);
      setCookingTimeMinutes(12);
      setDifficulty('MEDIUM');
      setStationName('Kitchen Hot Line');
      setPackagingCost(1500);
      setLaborOverheadCost(2500);
      setIngredients([]);
      setInstructions([
        { stepNumber: 1, title: 'Persiapan Bahan & Mise en Place', description: 'Timbang semua bahan sesuai takaran resep.', timeMinutes: 5 },
        { stepNumber: 2, title: 'Proses Memasak', description: 'Masak dengan suhu dan durasi sesuai standar.', timeMinutes: 7 },
        { stepNumber: 3, title: 'Plating & Garnish', description: 'Tata di atas piring saji dengan rapi dan bersih.', timeMinutes: 2 },
      ]);
      setVersionHistory([]);
      setChangeReason('');
    }
  }, [isOpen, initialRecipe]);

  // Helper map for inventory item lookup
  const invMap = useMemo(() => {
    return new Map(inventoryItems.map((item) => [item.id, item]));
  }, [inventoryItems]);

  // Dynamic Live Calculations
  const calculatedMetrics = useMemo(() => {
    const rawMaterialCost = ingredients.reduce((acc, curr) => {
      const lineCost = curr.totalCost ?? ((curr.effectiveQuantity ?? curr.quantity ?? 0) * (curr.unitCost ?? 0));
      return acc + (Number.isFinite(lineCost) ? lineCost : 0);
    }, 0);

    const totalCost = rawMaterialCost + (packagingCost ?? 0) + (laborOverheadCost ?? 0);
    const portions = Math.max(1, totalPortions ?? yieldQuantity ?? 1);
    const hppPerPortion = Math.round(totalCost / portions);
    const grossProfit = Math.max(0, (sellingPrice ?? 0) - hppPerPortion);
    const foodCostPct = (sellingPrice ?? 0) > 0 ? Number(((hppPerPortion / sellingPrice) * 100).toFixed(2)) : 0;
    const marginPct = (sellingPrice ?? 0) > 0 ? Number(((grossProfit / sellingPrice) * 100).toFixed(2)) : 0;

    return {
      rawMaterialCost,
      totalCost,
      hppPerPortion,
      grossProfit,
      foodCostPct,
      marginPct,
    };
  }, [ingredients, packagingCost, laborOverheadCost, totalPortions, yieldQuantity, sellingPrice]);

  // Handle Ingredient Addition
  const handleAddIngredient = () => {
    if (inventoryItems.length === 0) return;
    const firstItem = inventoryItems[0];
    const unitCost = firstItem.averageCost || firstItem.lastPurchaseCost || 0;

    const newIng: RecipeIngredient = {
      id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      recipeId: initialRecipe?.id || '',
      inventoryItemId: firstItem.id,
      inventoryItemSku: firstItem.sku,
      inventoryItemName: firstItem.name,
      quantity: 0.1,
      unit: firstItem.unit || 'Kg',
      preparationLossPercentage: 0,
      cookingLossPercentage: 0,
      totalLossPercentage: 0,
      effectiveQuantity: 0.1,
      unitCost,
      totalCost: Math.round(0.1 * unitCost),
    };

    setIngredients((prev) => [...prev, newIng]);
  };

  // Handle Ingredient Update
  const handleUpdateIngredient = (index: number, updates: Partial<RecipeIngredient>) => {
    setIngredients((prev) => {
      const copy = [...prev];
      const current = { ...copy[index], ...updates };

      // If inventoryItemId changed, sync details
      if (updates.inventoryItemId && updates.inventoryItemId !== copy[index].inventoryItemId) {
        const item = invMap.get(updates.inventoryItemId);
        if (item) {
          current.inventoryItemId = item.id;
          current.inventoryItemSku = item.sku;
          current.inventoryItemName = item.name;
          current.unit = item.unit || 'Kg';
          current.unitCost = item.averageCost || item.lastPurchaseCost || 0;
        }
      }

      const prepLoss = Math.max(0, Number(current.preparationLossPercentage) || 0);
      const cookLoss = Math.max(0, Number(current.cookingLossPercentage) || 0);
      const totalLoss = prepLoss + cookLoss;
      const baseQty = Math.max(0, Number(current.quantity) || 0);
      const effectiveQty = Number((baseQty * (1 + totalLoss / 100)).toFixed(4));
      const lineCost = Math.round(effectiveQty * (current.unitCost || 0));

      current.preparationLossPercentage = prepLoss;
      current.cookingLossPercentage = cookLoss;
      current.totalLossPercentage = totalLoss;
      current.effectiveQuantity = effectiveQty;
      current.totalCost = lineCost;

      copy[index] = current;
      return copy;
    });
  };

  // Handle Ingredient Deletion
  const handleDeleteIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Instruction Addition
  const handleAddInstruction = () => {
    const nextStep = instructions.length + 1;
    setInstructions((prev) => [
      ...prev,
      {
        stepNumber: nextStep,
        title: `Langkah ${nextStep}`,
        description: '',
        timeMinutes: 5,
      },
    ]);
  };

  // Handle Instruction Update
  const handleUpdateInstruction = (index: number, updates: Partial<RecipeInstructionStep>) => {
    setInstructions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  // Handle Instruction Deletion
  const handleDeleteInstruction = (index: number) => {
    setInstructions((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, stepNumber: i + 1 }))
    );
  };

  // Submit Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim()) {
      alert('Nama resep wajib diisi.');
      return;
    }
    if (!recipeCode.trim()) {
      alert('Kode resep wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialRecipe) {
        // Update existing recipe with new version
        const updated = await recipeService.updateRecipe(
          initialRecipe.id,
          {
            recipeCode,
            recipeName,
            menuCategory,
            description,
            status,
            sellingPrice,
            targetFoodCostPercentage,
            targetMarginPercentage,
            yieldQuantity,
            yieldUnit,
            portionSize,
            portionUnit,
            totalPortions,
            preparationTimeMinutes,
            cookingTimeMinutes,
            totalTimeMinutes: (preparationTimeMinutes ?? 0) + (cookingTimeMinutes ?? 0),
            difficulty,
            stationName,
            packagingCost,
            laborOverheadCost,
            ingredients,
            instructions,
          },
          changeReason || 'Pembaruan spesifikasi resep & BOM',
          currentUser
        );
        onSaved(updated);
      } else {
        // Create new recipe
        const created = await recipeService.createRecipe(
          {
            recipeCode,
            recipeName,
            menuCategory,
            description,
            status,
            sellingPrice,
            targetFoodCostPercentage,
            targetMarginPercentage,
            yieldQuantity,
            yieldUnit,
            portionSize,
            portionUnit,
            totalPortions,
            preparationTimeMinutes,
            cookingTimeMinutes,
            totalTimeMinutes: (preparationTimeMinutes ?? 0) + (cookingTimeMinutes ?? 0),
            difficulty,
            stationName,
            packagingCost,
            laborOverheadCost,
            ingredients,
            instructions,
          },
          currentUser
        );
        onSaved(created);
      }
      onClose();
    } catch (err: any) {
      alert(`Gagal menyimpan resep: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#151b2b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {initialRecipe ? `Edit Resep: ${initialRecipe.recipeName}` : 'Buat Master Resep Baru'}
                </h2>
                {initialRecipe && (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                    v{initialRecipe.version ?? 1}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Formula standar, komposisi bahan baku (BOM), dan kalkulasi otomatis HPP & Food Cost.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Metrics Floating Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 p-4 bg-[#111827] border-b border-white/10 text-xs">
          <div className="bg-[#1e293b]/60 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[10px]">Harga Jual</span>
            <span className="text-sm font-bold text-emerald-400">
              Rp {(sellingPrice ?? 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#1e293b]/60 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[10px]">HPP per Porsi</span>
            <span className="text-sm font-bold text-purple-400">
              Rp {(calculatedMetrics.hppPerPortion ?? 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#1e293b]/60 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[10px]">Food Cost %</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-sm font-bold ${
                  calculatedMetrics.foodCostPct <= (targetFoodCostPercentage ?? 30)
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {calculatedMetrics.foodCostPct ?? 0}%
              </span>
              <span className="text-[10px] text-slate-500">
                (Tgt: {targetFoodCostPercentage ?? 30}%)
              </span>
            </div>
          </div>
          <div className="bg-[#1e293b]/60 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[10px]">Gross Margin</span>
            <span className="text-sm font-bold text-sky-400">
              {calculatedMetrics.marginPct ?? 0}%
            </span>
          </div>
          <div className="bg-[#1e293b]/60 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[10px]">Laba per Porsi</span>
            <span className="text-sm font-bold text-amber-400">
              Rp {(calculatedMetrics.grossProfit ?? 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#1e293b]/60 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[10px]">Total Item Bahan</span>
            <span className="text-sm font-bold text-white">
              {ingredients.length} Bahan Baku
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 px-6 bg-[#151b2b]">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'details'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" /> Detail & Biaya
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ingredients')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'ingredients'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Komposisi Bahan (BOM) ({ingredients.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('instructions')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'instructions'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" /> Instruksi Memasak ({instructions.length})
          </button>
          {initialRecipe && (
            <button
              type="button"
              onClick={() => setActiveTab('versions')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'versions'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" /> Histori Versi ({versionHistory.length})
            </button>
          )}
        </div>

        {/* Tab Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: DETAILS & FINANCIAL SPECS */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Kode Resep / Menu <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={recipeCode}
                    onChange={(e) => setRecipeCode(e.target.value)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    placeholder="Contoh: RCP-STK-001"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nama Resep / Menu <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    placeholder="Contoh: Meltique Beef Sirloin Steak 200g"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Kategori Menu</label>
                  <select
                    value={menuCategory}
                    onChange={(e) => setMenuCategory(e.target.value as RecipeCategory)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Status Resep</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RecipeStatus)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="ACTIVE">ACTIVE (Digunakan POS / Prep)</option>
                    <option value="DRAFT">DRAFT (Dalam Uji Coba)</option>
                    <option value="ARCHIVED">ARCHIVED (Diarsipkan)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Stasiun Pembuatan</label>
                  <input
                    type="text"
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    placeholder="Contoh: Kitchen Hot Line / Bar"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Tingkat Kesulitan</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as RecipeDifficulty)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Deskripsi Resep</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  placeholder="Catatan profil rasa, garnish, dan instruksi penyajian tamu..."
                />
              </div>

              {/* Financial & Costing Parameters */}
              <div className="bg-[#151b2b] p-4 rounded-xl border border-white/10 space-y-4">
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" /> Parameter Finansial & Biaya Porsi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Harga Jual (Selling Price)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-500">Rp</span>
                      <input
                        type="number"
                        min="0"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full bg-[#1e293b] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Target Food Cost %</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={targetFoodCostPercentage}
                        onChange={(e) => setTargetFoodCostPercentage(Math.max(1, Number(e.target.value) || 30))}
                        className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-purple-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-500">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Biaya Kemasan (Takeaway)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-500">Rp</span>
                      <input
                        type="number"
                        min="0"
                        value={packagingCost}
                        onChange={(e) => setPackagingCost(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full bg-[#1e293b] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Alokasi Overhead / Labor</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-500">Rp</span>
                      <input
                        type="number"
                        min="0"
                        value={laborOverheadCost}
                        onChange={(e) => setLaborOverheadCost(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full bg-[#1e293b] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Yield & Time Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Hasil Masak (Yield Quantity)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={yieldQuantity}
                      onChange={(e) => setYieldQuantity(Math.max(0.1, Number(e.target.value) || 1))}
                      className="w-2/3 bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="text"
                      value={yieldUnit}
                      onChange={(e) => setYieldUnit(e.target.value)}
                      className="w-1/3 bg-[#1e293b] border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-purple-500 text-center"
                      placeholder="Porsi/Kg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Total Porsi Standar</label>
                  <input
                    type="number"
                    min="1"
                    value={totalPortions}
                    onChange={(e) => setTotalPortions(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Prep Time (Menit)</label>
                  <input
                    type="number"
                    min="0"
                    value={preparationTimeMinutes}
                    onChange={(e) => setPreparationTimeMinutes(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Cook Time (Menit)</label>
                  <input
                    type="number"
                    min="0"
                    value={cookingTimeMinutes}
                    onChange={(e) => setCookingTimeMinutes(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {initialRecipe && (
                <div>
                  <label className="block text-xs font-medium text-amber-300 mb-1">
                    Alasan Perubahan Versi (Audit Trail)
                  </label>
                  <input
                    type="text"
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    className="w-full bg-[#1e293b] border border-amber-500/30 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="Contoh: Penyesuaian porsi daging & kenaikan harga mentega..."
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INGREDIENTS BILL OF MATERIALS (BOM) */}
          {activeTab === 'ingredients' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Daftar Bahan Baku & Takaran (BOM)</h3>
                  <p className="text-xs text-slate-400">
                    Terhubung langsung dengan Master Inventaris. Biaya dihitung otomatis berdasarkan Average Cost.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20"
                >
                  <Plus className="w-4 h-4" /> Tambah Bahan
                </button>
              </div>

              {ingredients.length === 0 ? (
                <div className="p-8 text-center bg-[#151b2b] rounded-2xl border border-dashed border-white/10">
                  <ChefHat className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">Belum ada bahan yang ditambahkan</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Klik tombol "Tambah Bahan" di atas untuk memasukkan bahan baku dari inventaris.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 font-medium">
                          <th className="py-2.5 px-3 min-w-[220px]">Bahan Baku (Inventaris)</th>
                          <th className="py-2.5 px-2 w-24">Jumlah</th>
                          <th className="py-2.5 px-2 w-20">Satuan</th>
                          <th className="py-2.5 px-2 w-24">Prep Loss %</th>
                          <th className="py-2.5 px-2 w-24">Cook Loss %</th>
                          <th className="py-2.5 px-2 w-24">Qty Efektif</th>
                          <th className="py-2.5 px-2 min-w-[100px]">Harga Satuan</th>
                          <th className="py-2.5 px-2 min-w-[100px] text-right">Subtotal Biaya</th>
                          <th className="py-2.5 px-2 w-10 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {ingredients.map((ing, idx) => (
                          <tr key={ing.id || idx} className="hover:bg-white/[0.02]">
                            {/* Inventory Item Dropdown */}
                            <td className="py-2.5 px-3">
                              <select
                                value={ing.inventoryItemId}
                                onChange={(e) => handleUpdateIngredient(idx, { inventoryItemId: e.target.value })}
                                className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                              >
                                {inventoryItems.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name} ({item.sku}) - Rp {(item.averageCost || item.lastPurchaseCost || 0).toLocaleString('id-ID')}/{item.unit}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Base Quantity */}
                            <td className="py-2.5 px-2">
                              <input
                                type="number"
                                step="0.001"
                                min="0"
                                value={ing.quantity}
                                onChange={(e) =>
                                  handleUpdateIngredient(idx, { quantity: Math.max(0, Number(e.target.value) || 0) })
                                }
                                className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                              />
                            </td>

                            {/* Unit */}
                            <td className="py-2.5 px-2">
                              <span className="text-slate-400 font-mono">{ing.unit || 'Kg'}</span>
                            </td>

                            {/* Prep Loss % */}
                            <td className="py-2.5 px-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={ing.preparationLossPercentage ?? 0}
                                onChange={(e) =>
                                  handleUpdateIngredient(idx, {
                                    preparationLossPercentage: Math.max(0, Number(e.target.value) || 0),
                                  })
                                }
                                className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center focus:outline-none focus:border-purple-500"
                              />
                            </td>

                            {/* Cook Loss % */}
                            <td className="py-2.5 px-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={ing.cookingLossPercentage ?? 0}
                                onChange={(e) =>
                                  handleUpdateIngredient(idx, {
                                    cookingLossPercentage: Math.max(0, Number(e.target.value) || 0),
                                  })
                                }
                                className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center focus:outline-none focus:border-purple-500"
                              />
                            </td>

                            {/* Effective Qty */}
                            <td className="py-2.5 px-2 text-slate-300 font-mono">
                              {ing.effectiveQuantity ?? ing.quantity} {ing.unit}
                            </td>

                            {/* Unit Cost */}
                            <td className="py-2.5 px-2 text-slate-400 font-mono">
                              Rp {(ing.unitCost ?? 0).toLocaleString('id-ID')}
                            </td>

                            {/* Subtotal Cost */}
                            <td className="py-2.5 px-2 text-right font-mono font-semibold text-purple-400">
                              Rp {(ing.totalCost ?? 0).toLocaleString('id-ID')}
                            </td>

                            {/* Delete */}
                            <td className="py-2.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteIngredient(idx)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Bar */}
                  <div className="p-3.5 bg-[#151b2b] rounded-xl border border-white/10 flex flex-wrap items-center justify-between text-xs gap-3">
                    <div className="text-slate-400">
                      Total Biaya Bahan Baku:{' '}
                      <span className="font-bold text-white">
                        Rp {(calculatedMetrics.rawMaterialCost ?? 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      HPP Bahan Baku / Porsi:{' '}
                      <span className="font-bold text-purple-400">
                        Rp {Math.round((calculatedMetrics.rawMaterialCost ?? 0) / Math.max(1, totalPortions)).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INSTRUCTIONS */}
          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Langkah & Standar Memasak (SOP)</h3>
                  <p className="text-xs text-slate-400">
                    Panduan instruksi kerja bagi cook/barista untuk menjaga konsistensi rasa dan plating.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddInstruction}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20"
                >
                  <Plus className="w-4 h-4" /> Tambah Langkah
                </button>
              </div>

              <div className="space-y-3">
                {instructions.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-[#151b2b] rounded-xl border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xs font-bold">
                          {step.stepNumber}
                        </span>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleUpdateInstruction(idx, { title: e.target.value })}
                          className="bg-[#1e293b] border border-white/10 rounded-lg px-3 py-1 text-xs text-white font-semibold focus:outline-none focus:border-purple-500 w-64"
                          placeholder="Judul langkah..."
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <input
                            type="number"
                            min="1"
                            value={step.timeMinutes ?? 5}
                            onChange={(e) =>
                              handleUpdateInstruction(idx, { timeMinutes: Math.max(1, Number(e.target.value) || 1) })
                            }
                            className="w-14 bg-[#1e293b] border border-white/10 rounded-lg px-1.5 py-0.5 text-xs text-white text-center font-mono focus:outline-none focus:border-purple-500"
                          />
                          <span>menit</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteInstruction(idx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={step.description}
                      onChange={(e) => handleUpdateInstruction(idx, { description: e.target.value })}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      placeholder="Uraian detail teknis langkah memasak..."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          value={step.criticalPoints || ''}
                          onChange={(e) => handleUpdateInstruction(idx, { criticalPoints: e.target.value })}
                          className="w-full bg-[#1e293b] border border-amber-500/20 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 focus:outline-none focus:border-amber-500"
                          placeholder="Critical Point (e.g. Suhu minyak 175°C, jangan gosong)"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={step.temperatureCelsius || ''}
                          onChange={(e) =>
                            handleUpdateInstruction(idx, {
                              temperatureCelsius: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                          placeholder="Target Suhu (°C) (opsional)"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: VERSION HISTORY SNAPSHOTS */}
          {activeTab === 'versions' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Histori Versi & Audit Perubahan Resep</h3>
                <p className="text-xs text-slate-400">
                  Setiap kali resep diperbarui, snapshot otomatis tersimpan untuk audit trail dan perbandingan HPP historis.
                </p>
              </div>

              <div className="space-y-3">
                {versionHistory.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-4 bg-[#151b2b] rounded-xl border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-bold font-mono bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded">
                          v{ver.version}
                        </span>
                        <span className="text-xs font-bold text-white">{ver.recipeName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(ver.snapshotDate).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 italic">"{ver.changeReason}"</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-white/5 text-slate-400">
                      <div>
                        Harga Jual: <span className="text-white font-semibold">Rp {(ver.sellingPrice ?? 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div>
                        HPP: <span className="text-purple-400 font-semibold">Rp {(ver.calculatedHpp ?? 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div>
                        Food Cost:{' '}
                        <span className="text-emerald-400 font-semibold">{ver.foodCostPercentage ?? 0}%</span>
                      </div>
                      <div>
                        Diubah oleh: <span className="text-slate-300">{ver.changedByName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="p-4 bg-[#151b2b] border-t border-white/10 -mx-6 -mb-6 flex items-center justify-between">
            <div className="text-xs text-slate-400 hidden sm:block">
              Semua perubahan tersimpan lokal dengan perlindungan nilai nullish.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Menyimpan...' : initialRecipe ? 'Simpan Pembaruan Resep' : 'Simpan Master Resep'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
