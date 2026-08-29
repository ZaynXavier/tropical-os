/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.7 — RECIPE MANAGEMENT VIEW
 * Master Recipe Catalog with BOM, Food Cost percentages, Version Control, and Search/Filters.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ChefHat,
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  Copy,
  Archive,
  CheckCircle2,
  AlertTriangle,
  Layers,
  DollarSign,
  Clock,
  RotateCcw,
  Sparkles,
  TrendingUp,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Recipe, RecipeCategory, RecipeFilterParams, RecipeStatus } from '../../../types/recipe';
import { recipeService } from '../../../services/recipeService';
import { RecipeBuilderModal } from './RecipeBuilderModal';
import { RecipeDetailModal } from './RecipeDetailModal';

const CATEGORIES: { label: string; value: RecipeCategory | 'ALL' }[] = [
  { label: 'Semua Kategori', value: 'ALL' },
  { label: 'Main Course', value: 'Main Course' },
  { label: 'Appetizer', value: 'Appetizer' },
  { label: 'Beverage', value: 'Beverage' },
  { label: 'Dessert', value: 'Dessert' },
  { label: 'Sauce / Semi-Finished', value: 'Sauce / Semi-Finished' },
  { label: 'Soup / Broth', value: 'Soup / Broth' },
  { label: 'Side Dish', value: 'Side Dish' },
];

interface RecipeManagementViewProps {
  currentUser?: { id: string; name: string; role?: string };
}

export const RecipeManagementView: React.FC<RecipeManagementViewProps> = ({ currentUser }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<RecipeStatus | 'ALL'>('ALL');
  const [selectedFoodCostRange, setSelectedFoodCostRange] = useState<'ALL' | 'UNDER_TARGET' | 'ON_TARGET' | 'OVER_TARGET'>('ALL');

  // Modal States
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Load Recipes
  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const data = await recipeService.getRecipes({
        searchQuery,
        category: selectedCategory,
        status: selectedStatus,
        foodCostRange: selectedFoodCostRange,
      });
      setRecipes(data || []);
    } catch (e) {
      console.error('[RecipeManagementView] Error fetching recipes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [searchQuery, selectedCategory, selectedStatus, selectedFoodCostRange]);

  // Overall Catalog Statistics
  const stats = useMemo(() => {
    const total = recipes.length;
    const active = recipes.filter((r) => r.status === 'ACTIVE').length;
    const drafts = recipes.filter((r) => r.status === 'DRAFT').length;

    let sumFoodCost = 0;
    let countedSellable = 0;
    let highMarginCount = 0;

    recipes.forEach((r) => {
      if (r.sellingPrice > 0) {
        const metrics = recipeService.calculateRecipeMetrics(r);
        sumFoodCost += metrics.foodCostPercentage ?? 0;
        countedSellable++;
        if ((metrics.grossMarginPercentage ?? 0) >= 70) {
          highMarginCount++;
        }
      }
    });

    const avgFoodCost = countedSellable > 0 ? Number((sumFoodCost / countedSellable).toFixed(1)) : 28.5;

    return { total, active, drafts, avgFoodCost, highMarginCount };
  }, [recipes]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingRecipe(null);
    setIsBuilderOpen(true);
  };

  const handleOpenEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsBuilderOpen(true);
  };

  const handleOpenDetail = (recipe: Recipe) => {
    setDetailRecipe(recipe);
    setIsDetailOpen(true);
  };

  const handleDuplicate = async (recipe: Recipe) => {
    try {
      const duplicated = await recipeService.duplicateRecipe(recipe.id, currentUser);
      await fetchRecipes();
      setDetailRecipe(duplicated);
      setIsDetailOpen(true);
    } catch (err: any) {
      alert(`Gagal menduplikasi resep: ${err.message || 'Unknown error'}`);
    }
  };

  const handleArchive = async (recipe: Recipe) => {
    if (confirm(`Yakin ingin mengarsipkan resep "${recipe.recipeName}"?`)) {
      try {
        await recipeService.archiveRecipe(recipe.id, currentUser);
        await fetchRecipes();
      } catch (err: any) {
        alert(`Gagal mengarsipkan resep: ${err.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Summary Banner */}
      <div className="bg-gradient-to-br from-[#151B2B] to-[#1E2438] rounded-2xl border border-white/10 p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-purple-600/20 rounded-xl border border-purple-500/30 text-purple-400">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Master Recipe Management
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Formula resep standar, Bill of Materials (BOM), kalkulasi HPP real-time, dan audit trail histori versi.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Master Resep
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-[#0f172a]/60 backdrop-blur-sm p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Master Resep
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{stats.total}</span>
              <span className="text-xs text-slate-400 font-medium">Menu</span>
            </div>
          </div>

          <div className="bg-[#0f172a]/60 backdrop-blur-sm p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
              Resep Aktif (Live)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">{stats.active}</span>
              <span className="text-xs text-emerald-400/80 font-medium">Digunakan POS & Prep</span>
            </div>
          </div>

          <div className="bg-[#0f172a]/60 backdrop-blur-sm p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">
              Rata-rata Food Cost %
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-purple-400">{stats.avgFoodCost}%</span>
              <span className="text-xs text-slate-400 font-medium">Target: 30%</span>
            </div>
          </div>

          <div className="bg-[#0f172a]/60 backdrop-blur-sm p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-sky-400 block tracking-wider">
              High Margin Menu
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-sky-400">{stats.highMarginCount}</span>
              <span className="text-xs text-sky-400/80 font-medium">Margin &gt; 70%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode resep, nama menu, bahan baku..."
              className="w-full bg-[#1E2438] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-[#1E2438] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>

            <select
              value={selectedFoodCostRange}
              onChange={(e) => setSelectedFoodCostRange(e.target.value as any)}
              className="bg-[#1E2438] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Semua Food Cost</option>
              <option value="UNDER_TARGET">Under Target (&lt; 30%)</option>
              <option value="ON_TARGET">On Target (±2%)</option>
              <option value="OVER_TARGET">Over Target (&gt; 32%)</option>
            </select>

            <div className="flex items-center bg-[#1E2438] border border-white/10 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-[#1E2438] text-slate-400 hover:text-white hover:bg-[#252c44]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recipe List View */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Memuat data resep master...
        </div>
      ) : recipes.length === 0 ? (
        <div className="p-12 text-center bg-[#151B2B] rounded-2xl border border-dashed border-white/10">
          <ChefHat className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Tidak ada resep yang sesuai</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Coba ubah kata kunci pencarian atau filter kategori di atas untuk menemukan resep yang diinginkan.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => {
            const metrics = recipeService.calculateRecipeMetrics(recipe);
            return (
              <div
                key={recipe.id}
                className="bg-[#151B2B] rounded-2xl border border-white/10 p-5 hover:border-purple-500/40 transition-all shadow-lg flex flex-col justify-between group"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                          {recipe.recipeCode} (v{recipe.version ?? 1})
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            recipe.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : recipe.status === 'DRAFT'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                          }`}
                        >
                          {recipe.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-purple-300 transition-colors">
                        {recipe.recipeName}
                      </h3>
                      <span className="text-[11px] text-slate-400">{recipe.menuCategory}</span>
                    </div>
                  </div>

                  {/* Financial & Portions Grid */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-[#111827]/70 rounded-xl border border-white/5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Harga Jual</span>
                      <span className="font-bold text-emerald-400">
                        Rp {(metrics.sellingPrice ?? 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">HPP Porsi</span>
                      <span className="font-bold text-purple-400">
                        Rp {(metrics.totalHppPerPortion ?? 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Food Cost %</span>
                      <span
                        className={`font-bold ${
                          metrics.foodCostPercentage <= (metrics.targetFoodCostPercentage ?? 30)
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {metrics.foodCostPercentage ?? 0}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Gross Margin</span>
                      <span className="font-bold text-sky-400">
                        {metrics.grossMarginPercentage ?? 0}%
                      </span>
                    </div>
                  </div>

                  {/* Recipe Stats Pills */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      {(recipe.ingredients || []).length} Bahan
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {recipe.totalTimeMinutes ?? 15} Menit
                    </span>
                    <span>•</span>
                    <span>Yield: {recipe.yieldQuantity ?? 1} {recipe.yieldUnit || 'Porsi'}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-white/10">
                  <button
                    onClick={() => handleOpenDetail(recipe)}
                    className="flex-1 py-1.5 px-2.5 bg-[#1E2438] hover:bg-[#28314d] text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-purple-400" /> Detail & SOP
                  </button>

                  <button
                    onClick={() => handleOpenEdit(recipe)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                    title="Edit & Versi Baru"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDuplicate(recipe)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                    title="Duplikasi Resep"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {recipe.status !== 'ARCHIVED' && (
                    <button
                      onClick={() => handleArchive(recipe)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Arsipkan Resep"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-[#151B2B] rounded-2xl border border-white/10 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-medium bg-[#1E2438]/50">
                  <th className="py-3 px-4">Kode & Versi</th>
                  <th className="py-3 px-4">Nama Resep</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3 text-right">Harga Jual</th>
                  <th className="py-3 px-3 text-right">HPP Porsi</th>
                  <th className="py-3 px-3 text-center">Food Cost %</th>
                  <th className="py-3 px-3 text-center">Margin %</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recipes.map((recipe) => {
                  const metrics = recipeService.calculateRecipeMetrics(recipe);
                  return (
                    <tr key={recipe.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-mono font-bold text-purple-300">
                        {recipe.recipeCode} <span className="text-[10px] text-slate-400">v{recipe.version ?? 1}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {recipe.recipeName}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {(recipe.ingredients || []).length} Bahan • {recipe.totalTimeMinutes ?? 15} Menit
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{recipe.menuCategory}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                        Rp {(metrics.sellingPrice ?? 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-purple-400">
                        Rp {(metrics.totalHppPerPortion ?? 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        <span
                          className={`font-bold px-2 py-0.5 rounded ${
                            metrics.foodCostPercentage <= (metrics.targetFoodCostPercentage ?? 30)
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          {metrics.foodCostPercentage ?? 0}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-sky-400">
                        {metrics.grossMarginPercentage ?? 0}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            recipe.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : recipe.status === 'DRAFT'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}
                        >
                          {recipe.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenDetail(recipe)}
                            className="p-1.5 text-purple-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                            title="Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(recipe)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(recipe)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                            title="Duplikat"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <RecipeBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onSaved={fetchRecipes}
        initialRecipe={editingRecipe}
        currentUser={currentUser}
      />

      <RecipeDetailModal
        recipe={detailRecipe}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleOpenEdit}
      />
    </div>
  );
};
