import React, { useState } from 'react';
import {
  UtensilsCrossed,
  DollarSign,
  Calculator,
  Percent,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Search,
  Plus,
  ArrowUpRight,
  Flame,
  Award,
  Sparkles
} from 'lucide-react';

interface RecipeCostItem {
  id: string;
  name: string;
  category: 'FOOD' | 'BEVERAGE' | 'DESSERT';
  portionCost: number;
  sellingPrice: number;
  foodCostPct: number;
  monthlySales: number;
  matrixCategory: 'STAR' | 'PLOWHORSE' | 'PUZZLE' | 'DOG';
  ingredients: { name: string; qty: string; unitPrice: number; total: number }[];
}

export const DedicatedHppDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'catalog' | 'matrix'>('calculator');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Recipe for Simulation
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeCostItem>({
    id: 'RCP-01',
    name: 'Gurame Bakar Sambal Matah Spesial',
    category: 'FOOD',
    portionCost: 28500,
    sellingPrice: 85000,
    foodCostPct: 33.5,
    monthlySales: 420,
    matrixCategory: 'STAR',
    ingredients: [
      { name: 'Ikan Gurame Segar (500g)', qty: '1 Ekor', unitPrice: 20000, total: 20000 },
      { name: 'Bumbu Marinasi Bakaran', qty: '50g', unitPrice: 3500, total: 3500 },
      { name: 'Sambal Matah & Minyak Kelapa', qty: '40g', unitPrice: 3000, total: 3000 },
      { name: 'Lalapan Segar & Garnish', qty: '1 Porsi', unitPrice: 2000, total: 2000 },
    ],
  });

  // Simulator Inputs
  const [simTargetFoodCost, setSimTargetFoodCost] = useState(32); // 32%
  const [simMarkupMultiplier, setSimMarkupMultiplier] = useState(3.0);

  const calculatedSellingPrice = Math.round(selectedRecipe.portionCost / (simTargetFoodCost / 100));
  const grossProfitMargin = Math.round(calculatedSellingPrice - selectedRecipe.portionCost);

  // Recipe List
  const recipeList: RecipeCostItem[] = [
    {
      id: 'RCP-01',
      name: 'Gurame Bakar Sambal Matah Spesial',
      category: 'FOOD',
      portionCost: 28500,
      sellingPrice: 85000,
      foodCostPct: 33.5,
      monthlySales: 420,
      matrixCategory: 'STAR',
      ingredients: [],
    },
    {
      id: 'RCP-02',
      name: 'Ayam Betutu Kuah Komplit',
      category: 'FOOD',
      portionCost: 19800,
      sellingPrice: 62000,
      foodCostPct: 31.9,
      monthlySales: 380,
      matrixCategory: 'STAR',
      ingredients: [],
    },
    {
      id: 'RCP-03',
      name: 'Signature Tropical Coconut Mocktail',
      category: 'BEVERAGE',
      portionCost: 7500,
      sellingPrice: 35000,
      foodCostPct: 21.4,
      monthlySales: 510,
      matrixCategory: 'STAR',
      ingredients: [],
    },
    {
      id: 'RCP-04',
      name: 'Iga Sapi Bakar Madu',
      category: 'FOOD',
      portionCost: 48000,
      sellingPrice: 110000,
      foodCostPct: 43.6,
      monthlySales: 160,
      matrixCategory: 'PUZZLE',
      ingredients: [],
    },
    {
      id: 'RCP-05',
      name: 'Es Cendol Durian Tropical',
      category: 'DESSERT',
      portionCost: 12000,
      sellingPrice: 32000,
      foodCostPct: 37.5,
      monthlySales: 290,
      matrixCategory: 'PLOWHORSE',
      ingredients: [],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-[#111827] border border-[#2D374E] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-600/30">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Kalkulator HPP &amp; Food Costing Dashboard
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PIC: Tasnim, Ulum, Dina &amp; GM
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Kalkulasi Harga Pokok Penjualan Resep Baku, Margin Keuntungan, dan Rekomendasi Harga Menu Resto
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-[#1E2438] text-xs font-bold text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Target Resto: 30.0% - 35.0% Food Cost
            </span>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="mt-4 pt-3 border-t border-[#2D374E] flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {[
            { id: 'calculator', label: 'Kalkulator & Simulator Resep', icon: Calculator },
            { id: 'matrix', label: 'Menu Engineering Matrix (Stars/Dogs)', icon: Award },
            { id: 'catalog', label: 'Katalog Bahan Baku & Yield', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E2438]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: KALKULATOR & SIMULATOR */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Recipe Selector & Ingredient Breakdown */}
          <div className="lg:col-span-7 bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#2D374E] pb-3">
              <div>
                <span className="text-xs text-amber-400 font-bold uppercase">Resep Aktif</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedRecipe.name}</h3>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Food Cost: {selectedRecipe.foodCostPct}%
              </span>
            </div>

            {/* Ingredients Table */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Rincian Bahan Baku &amp; Takaran Porsi
              </h4>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#2D374E] text-gray-400 font-semibold bg-[#111827]">
                      <th className="py-2.5 px-3">Bahan Baku</th>
                      <th className="py-2.5 px-3">Takaran</th>
                      <th className="py-2.5 px-3 text-right">Biaya Satuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D374E]">
                    {selectedRecipe.ingredients.map((ing) => (
                      <tr key={ing.name} className="hover:bg-[#111827]/50">
                        <td className="py-2.5 px-3 font-medium text-white">{ing.name}</td>
                        <td className="py-2.5 px-3 text-gray-300">{ing.qty}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-gray-200">
                          Rp {ing.total.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[#2D374E] bg-[#111827]/80 font-bold">
                      <td colSpan={2} className="py-3 px-3 text-white">
                        TOTAL HPP PER PORSI:
                      </td>
                      <td className="py-3 px-3 text-right text-amber-400 font-mono text-sm">
                        Rp {selectedRecipe.portionCost.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing Simulator */}
          <div className="lg:col-span-5 bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#2D374E] pb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Simulator Harga Jual &amp; Margin Resto
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-gray-300 mb-1">
                  <span>Target Food Cost %:</span>
                  <span className="text-amber-400 font-mono">{simTargetFoodCost}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="45"
                  value={simTargetFoodCost}
                  onChange={(e) => setSimTargetFoodCost(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>20% (High Margin)</span>
                  <span>32% (Ideal F&B)</span>
                  <span>45% (Tight)</span>
                </div>
              </div>

              {/* Simulation Output Cards */}
              <div className="p-4 rounded-xl bg-[#111827] border border-[#2D374E] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Harga Jual Saat Ini di Menu:</span>
                  <span className="text-sm font-bold text-white">
                    Rp {selectedRecipe.sellingPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[#2D374E] pt-2">
                  <span className="text-xs text-amber-300 font-semibold">
                    Rekomendasi Harga Baru ({simTargetFoodCost}% FC):
                  </span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    Rp {calculatedSellingPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[#2D374E] pt-2">
                  <span className="text-xs text-gray-400">Laba Kotor Per Porsi (Gross Profit):</span>
                  <span className="text-sm font-bold text-blue-400 font-mono">
                    Rp {grossProfitMargin.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                💡 <span className="font-bold">Rekomendasi Chef &amp; GM:</span> Dengan mempertahankan Food Cost di 32%, menu ini menghasilkan laba kotor optimal dan sangat kompetitif di segmen resto keluarga.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MENU ENGINEERING MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#2D374E] pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Menu Engineering Matrix (Boston Box F&amp;B)</h3>
              <p className="text-xs text-gray-400">
                Klasifikasi menu berdasarkan volume penjualan (Popularity) vs Margin keuntungan (Profitability)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500 text-gray-900 uppercase">
                ⭐ STARS (High Profit, High Sales)
              </span>
              <p className="text-xs text-gray-200 mt-2 font-medium">
                • Gurame Bakar Sambal Matah (420 porsi/bln - FC 33.5%)
              </p>
              <p className="text-xs text-gray-200 font-medium">
                • Signature Tropical Coconut Mocktail (510 porsi/bln - FC 21.4%)
              </p>
              <p className="text-[11px] text-emerald-300 italic pt-1">
                Aksi: Pertahankan konsistensi rasa dan kualitas bahan baku.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500 text-white uppercase">
                🐎 PLOWHORSES (Low Profit, High Sales)
              </span>
              <p className="text-xs text-gray-200 mt-2 font-medium">
                • Es Cendol Durian Tropical (290 porsi/bln - FC 37.5%)
              </p>
              <p className="text-[11px] text-blue-300 italic pt-1">
                Aksi: Naikkan harga sedikit (+Rp 2.000) atau kurangi porsi garnish tanpa menurunkan kepuasan.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-gray-900 uppercase">
                🧩 PUZZLES (High Profit, Low Sales)
              </span>
              <p className="text-xs text-gray-200 mt-2 font-medium">
                • Iga Sapi Bakar Madu (160 porsi/bln - FC 43.6%)
              </p>
              <p className="text-[11px] text-amber-300 italic pt-1">
                Aksi: Dorong upselling oleh waiter service & jadikan featured photo di media sosial.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500 text-white uppercase">
                🐕 DOGS (Low Profit, Low Sales)
              </span>
              <p className="text-xs text-gray-200 mt-2 font-medium">
                • Sup Buntut Goreng Mentega (40 porsi/bln - FC 48.0%)
              </p>
              <p className="text-[11px] text-rose-300 italic pt-1">
                Aksi: Pertimbangkan untuk dieliminasi dari menu atau ganti formula resep.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KATALOG BAHAN BAKU */}
      {activeTab === 'catalog' && (
        <div className="bg-[#1E2438] border border-[#2D374E] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">Katalog Master Bahan Baku &amp; Faktor Susut (Yield)</h3>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2D374E] text-gray-400 font-semibold bg-[#111827]">
                  <th className="py-2.5 px-3">Nama Bahan</th>
                  <th className="py-2.5 px-3">Satuan Pembelian</th>
                  <th className="py-2.5 px-3">Harga Beli Supplier</th>
                  <th className="py-2.5 px-3">Yield / Rendemen (%)</th>
                  <th className="py-2.5 px-3 text-right">Harga Bersih (Edible Portion)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D374E]">
                <tr className="hover:bg-[#111827]/50">
                  <td className="py-2.5 px-3 font-bold text-white">Ikan Gurame Hidup</td>
                  <td className="py-2.5 px-3 text-gray-300">Kilogram (kg)</td>
                  <td className="py-2.5 px-3 text-gray-300">Rp 38.000 / kg</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">85% (Sisik &amp; insang buang)</td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-400">Rp 44.700 / kg net</td>
                </tr>
                <tr className="hover:bg-[#111827]/50">
                  <td className="py-2.5 px-3 font-bold text-white">Daging Ayam Fillet Dada</td>
                  <td className="py-2.5 px-3 text-gray-300">Kilogram (kg)</td>
                  <td className="py-2.5 px-3 text-gray-300">Rp 48.000 / kg</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">95% (Trim lemak)</td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-400">Rp 50.500 / kg net</td>
                </tr>
                <tr className="hover:bg-[#111827]/50">
                  <td className="py-2.5 px-3 font-bold text-white">Bawang Merah Kupas Brebes</td>
                  <td className="py-2.5 px-3 text-gray-300">Kilogram (kg)</td>
                  <td className="py-2.5 px-3 text-gray-300">Rp 32.000 / kg</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">92%</td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-400">Rp 34.800 / kg net</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
