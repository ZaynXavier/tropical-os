# TROPICALOS — DATA OWNERSHIP & INTEGRATION MATRIX
**Audit Baseline:** Pre-Phase 3.8 Architectural Hardening  
**Scope:** Single Costing Engine, Single Stock Ledger, and Standard Cross-Domain Data Contracts.

---

## 1. Domain Ownership Rules

TropicalOS strictly separates **Operational Execution**, **Financial Reporting & Governance**, **Human Resources**, and **Customer Engagement**. No domain is permitted to create shadow/duplicate state or isolated calculations.

```
+-----------------------------------------------------------------------------------+
|                                  TROPICALOS DOMAIN BOUNDARIES                     |
+-----------------------------------------------------------------------------------+
|  OPERATIONS DOMAIN (Execution Owner)                                              |
|  - Inventory Master (32 SKUs, Stock Levels, Reorder Points, Min/Max)             |
|  - Stock Movement Ledger (Receipts, Production Usages, Wasting, Adjustments)      |
|  - Procurement & Receiving (PR, PO, Receiving Inspection, Vendor Price History)  |
|  - Master Recipes & Yield Matrix (BOM, Yield %, Packaging Specs, Serving Sizes)   |
|  - Production Batches (Planned vs Actual Yield, Recipe Deviations, Production Waste)|
|                                                                                   |
|  SHARED DATA CONTRACTS (Standard Interfaces in /src/types/contracts.ts)           |
|  * InventoryCostContract          * RecipeCostContract                            |
|  * ProductionBatchCostContract    * StockMovementRecordContract                   |
|  * SalesRevenueContract           * PayrollCostContract                           |
|                                                                                   |
|  FINANCE DOMAIN (Governance & Reporting Consumer)                                 |
|  - Reads RecipeCostContract for Menu Engineering Matrix & HPP Target vs Actual    |
|  - Reads SalesRevenueContract for P&L Gross Margin & Daily Revenue Aggregation     |
|  - Reads PayrollCostContract from HR for OPEX Labor Cost                          |
|  - Reads Procurement records for Accounts Payable & Expense Recognition           |
|  - DOES NOT modify inventory stock balances or recipe formulas directly           |
|                                                                                   |
|  HR DOMAIN (People & Payroll Owner)                                               |
|  - Employee Master (24 Personel across 6 Divisions)                               |
|  - Attendance & GPS Clock-In Logs                                                 |
|  - Shift Schedules, Breaks, Overtime SPL                                          |
|  - Salary Masters, Kasbon Advances, Adjustments & Monthly Payroll Calculation    |
|  - Exports PayrollCostContract to Finance OPEX                                    |
|                                                                                   |
|  CRM DOMAIN (Guest Engagement Owner)                                              |
|  - Customer Profiles, VIP Segments, WhatsApp Interaction History                  |
|  - Event Inquiries (Banquets, Weddings, Gatherings) & Deal Pipeline                |
|  - Reservations Calendar for Table/Gazebo/Pendopo allocation                     |
|                                                                                   |
|  CONTENT DOMAIN (Brand & Marketing Owner)                                         |
|  - Editorial Calendar (Reels, TikTok, Shorts, Stories)                            |
|  - Script Briefs, Hooks, Video Production Stages                                  |
|  - Influencer Outreach & Endorsement ROAS Simulation                              |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Entities & Ownership Matrix

| Entity Name | Primary Owner Domain | Persistent Storage Key | Authoritative Service | Consumer Domains | Access Pattern |
|---|---|---|---|---|---|
| **Inventory Master (SKU)** | Operations | `tropicalos_master_inventory` | `inventoryService` | Operations, Finance, Dashboard | Operations modifies via transactions; Finance reads via `InventoryCostContract`. |
| **Stock Movement Ledger** | Operations | `tropicalos_master_stock_movements` | `stockMovementService` | Operations, Finance, Audit | Append-only ledger recording all stock changes with monetary value and audit trail. |
| **Master Recipes & BOM** | Operations | `tropicalos_master_recipes` | `recipeService` | Operations, Finance, Dashboard | Operations updates recipe steps/ingredients; Finance reads via `RecipeCostContract`. |
| **Production Batches** | Operations | `tropicalos_production_batches` | `productionService` | Operations, Inventory, Finance | Operations executes batch; triggers automated raw material deductions via `stockMovementService`. |
| **Purchase Orders & Receiving** | Operations | `tropicalos_master_purchase_orders` | `purchaseOrderService` | Operations, Inventory, Finance | Receiving items updates inventory stock and cost price history automatically. |
| **POS Transactions & Sales** | Operations / Sales | `tropicalos_master_sales` | `salesService` | Operations, Finance, CRM, Dashboard | POS events record sales, cashier closings, and export `SalesRevenueContract`. |
| **Cashier Closings** | Operations / Sales | `tropicalos_cashier_closings` | `salesService` | Finance, Operations | Records end-of-shift cash drawer balance, variance, and supervisor sign-off. |
| **Employees & Roles** | HR | `tropicalos_master_employees` | `employeeService` | All Domains | Master personnel data, roles, division, contacts. |
| **Attendance & Clock-In** | HR | `tropicalos_master_attendance` | `attendanceService` | HR, Operations, Payroll | Records daily clock-in/out, GPS coordinates, photo, late duration. |
| **Payroll Records & Slips** | HR | `tropicalos_master_payroll_records` | `payrollService` | HR, Finance, Staff (Personal) | HR calculates salaries; Finance reads `PayrollCostContract` for monthly OPEX. |
| **SOP, IKA, Job Desc** | HR | `tropicalos_master_sops` | `sopService`, `ikaService`, `jobDescriptionService` | Operations, HR | Official restaurant operational standards & equipment handling guides. |
| **Customers & Leads** | CRM | `MOCK_CUSTOMERS`, `MOCK_LEADS` | CRM State Manager | CRM, Operations, Marketing | Customer profiles, event bookings, preferences. |
| **Editorial & Briefs** | Content | `INITIAL_BRIEFS`, `INITIAL_PRODUCTION` | Content State Manager | Marketing, Content | Content schedules, scripts, video pipeline. |

---

## 3. The Single Costing Engine Architecture

### Problem Avoided:
In traditional fragmented systems, Finance and Operations often calculate HPP independently using differing formulas, leading to conflicting food cost percentages and inaccurate margin reports.

### TropicalOS Solution:
1. **Source of Truth for Ingredient Costs:** `inventoryService` maintains the authoritative `averageCost` and `lastPurchaseCost` for each SKU.
2. **Formula Engine:** `recipeService.calculateRecipeMetrics(recipe)` is the **single calculation algorithm** used across the entire system.
3. **Calculation Pipeline:**
   $$\text{Raw Material Cost} = \sum (\text{Ingredient Quantity} \times \text{SKU Unit Cost})$$
   $$\text{Packaging Cost} = \sum (\text{Packaging Item Quantity} \times \text{SKU Unit Cost})$$
   $$\text{Total Recipe HPP} = \text{Raw Material Cost} + \text{Packaging Cost} + \text{Overhead Buffer}$$
   $$\text{Food Cost \%} = \left(\frac{\text{Total Recipe HPP}}{\text{Selling Price}}\right) \times 100$$
4. **Finance Consumption:** `hppService` and `HppDashboardView` **NEVER** re-compute ingredient math. They consume `recipeService.getRecipeCostContracts()` directly.

---

## 4. The Single Stock Movement Ledger Architecture

### Problem Avoided:
Modifying `currentStock` in multiple separate places without an audit log causes phantom inventory variances and irreconcilable end-of-month stocktakes.

### TropicalOS Solution:
1. **Single Entry Point:** Every stock adjustment (Purchasing Receiving, Production Material Out, Production Yield In, Wasting, Kitchen Spoilage, Physical Stock Opname Discrepancy) **MUST** pass through `stockMovementService.recordMovement()`.
2. **Atomic Synchronization:**
   - Appends an immutable record to `tropicalos_master_stock_movements`.
   - Adjusts the stock balance in `tropicalos_master_inventory`.
   - Updates the weighted average cost where applicable.
3. **Audit Readiness:** Every record captures: `timestamp`, `itemId`, `itemSku`, `itemName`, `movementType`, `quantity`, `unit`, `unitCost`, `totalValue`, `referenceNumber`, `reason`, and `performedBy`.

---

## 5. Cross-Domain Data Contracts

Standardized TypeScript contracts in `src/types/contracts.ts` enforce contract boundaries:
- `InventoryCostContract`: Provides SKU valuation, current balance, and latest purchasing costs.
- `RecipeCostContract`: Provides canonical portion HPP, food cost percentage, and gross profit per portion.
- `ProductionBatchCostContract`: Provides batch yield efficiency, raw cost consumed, and cost variance.
- `SalesRevenueContract`: Provides gross sales, discounts, net revenue, COGS, taxes, and payment method distribution.
- `PayrollCostContract`: Provides gross/net labor cost, basic wages, allowances, overtime, and deductions for financial reporting.
- `StockMovementRecordContract`: Standardized audit stream of physical goods flow throughout the restaurant.
