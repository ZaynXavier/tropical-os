/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.5 — INVENTORY FILTERS
 * Filter controls for Inventory Master View.
 */

import React from 'react';
import { StockStatus, ExpiryRiskLevel } from '../../../types/inventory';
import { Search, Filter, RefreshCw } from 'lucide-react';

interface InventoryFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedStatus: StockStatus | 'ALL';
  onStatusChange: (status: StockStatus | 'ALL') => void;
  selectedExpiryRisk: ExpiryRiskLevel | 'ALL';
  onExpiryRiskChange: (risk: ExpiryRiskLevel | 'ALL') => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  onReset: () => void;
}

const CATEGORIES = [
  'ALL',
  'Meat',
  'Seafood',
  'Poultry',
  'Vegetable',
  'Fruit',
  'Dairy',
  'Dry Goods',
  'Beverage',
  'Condiment',
  'Packaging',
  'Cleaning Chemical',
  'Other',
];

const LOCATIONS = [
  'ALL',
  'Central Storage',
  'Walk-in Freezer',
  'Walk-in Chiller',
  'Veg Chiller',
  'Kitchen Prep',
  'Bar Storage',
  'Service Packaging',
];

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedExpiryRisk,
  onExpiryRiskChange,
  selectedLocation,
  onLocationChange,
  onReset,
}) => {
  return (
    <div className="bg-[#151B2B] p-4 rounded-2xl border border-white/10 space-y-3">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari SKU, Nama Barang, Supplier, Kategori..."
            className="w-full bg-[#1E2438] text-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-500"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full lg:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-[#1E2438] text-white text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
          >
            <option value="ALL" className="bg-[#151B2B]">Semua Kategori</option>
            {CATEGORIES.filter((c) => c !== 'ALL').map((cat) => (
              <option key={cat} value={cat} className="bg-[#151B2B]">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Status Filter */}
        <div className="w-full lg:w-44">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as any)}
            className="w-full bg-[#1E2438] text-white text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
          >
            <option value="ALL" className="bg-[#151B2B]">Semua Status Stok</option>
            <option value="OPTIMAL" className="bg-[#151B2B]">Optimal</option>
            <option value="LOW_STOCK" className="bg-[#151B2B]">Low Stock (≤ Reorder)</option>
            <option value="CRITICAL" className="bg-[#151B2B]">Kritis (≤ Minimum)</option>
            <option value="OUT_OF_STOCK" className="bg-[#151B2B]">Habis (0)</option>
          </select>
        </div>

        {/* Expiry Risk Filter */}
        <div className="w-full lg:w-44">
          <select
            value={selectedExpiryRisk}
            onChange={(e) => onExpiryRiskChange(e.target.value as any)}
            className="w-full bg-[#1E2438] text-white text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
          >
            <option value="ALL" className="bg-[#151B2B]">Semua Risiko Expiry</option>
            <option value="EXPIRED" className="bg-[#151B2B]">Expired / Kedaluwarsa</option>
            <option value="CRITICAL_EXPIRING" className="bg-[#151B2B]">Kritis (&lt; 7 Hari)</option>
            <option value="WARNING_EXPIRING" className="bg-[#151B2B]">Peringatan (&lt; 30 Hari)</option>
            <option value="SAFE" className="bg-[#151B2B]">Aman (&gt; 30 Hari)</option>
          </select>
        </div>

        {/* Location Filter */}
        <div className="w-full lg:w-44">
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full bg-[#1E2438] text-white text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc} className="bg-[#151B2B]">
                {loc === 'ALL' ? 'Semua Lokasi' : loc}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="px-3.5 py-2.5 bg-[#1E2438] hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
