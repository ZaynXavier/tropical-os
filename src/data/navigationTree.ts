/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Role, Division, SectionType } from "../types";

export interface SubMenuItem {
  id: string;
  name: string;
  path: string;
  subTabKey?: string;
  badge?: string | number;
  badgeColor?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  path: string;
  iconName: string;
  section: SectionType;
  allowedRoles?: Role[];
  allowedDivisions?: Division[];
  badge?: string | number;
  badgeColor?: string;
  subItems?: SubMenuItem[];
}

export const NAVIGATION_TREE: MenuItem[] = [
  // MAIN
  {
    id: "dashboard",
    name: "Dashboard",
    path: "/dashboard",
    iconName: "LayoutDashboard",
    section: "MAIN",
    allowedRoles: ["MANAGER", "SUPERVISOR", "STAFF"],
    allowedDivisions: ["CRM", "WAITER", "KITCHEN", "BARISTA", "CASHIER", "PURCHASING", "DISHWASH_CLEANING", "FINANCE", "CONTENT_CREATOR"],
    subItems: [
      { id: "dash-overview", name: "Overview", path: "/dashboard?sub=overview", subTabKey: "overview" },
      { id: "dash-activity", name: "Activity", path: "/dashboard?sub=activity", subTabKey: "activity" },
      { id: "dash-statistic", name: "Statistic", path: "/dashboard?sub=statistic", subTabKey: "statistic" },
      { id: "dash-performance", name: "Performance Cases", path: "/dashboard?sub=performance", subTabKey: "performance" },
    ],
  },

  // CUSTOMER / CRM
  {
    id: "crm",
    name: "CRM",
    path: "/crm",
    iconName: "Users",
    section: "CUSTOMER",
    badge: 5,
    badgeColor: "bg-[#EF4444]",
    allowedRoles: ["MANAGER", "SUPERVISOR"],
    allowedDivisions: ["CRM"],
    subItems: [
      { id: "crm-dashboard", name: "Dashboard CRM", path: "/crm?sub=dashboard", subTabKey: "dashboard" },
      { id: "crm-pipeline", name: "Pipeline & Deals", path: "/crm?sub=pipeline", subTabKey: "pipeline" },
      { id: "crm-leads", name: "Leads Prospek", path: "/crm?sub=leads", subTabKey: "leads", badge: 5, badgeColor: "bg-red-500" },
      { id: "crm-customers", name: "Klien & VIP", path: "/crm?sub=customers", subTabKey: "customers" },
      { id: "crm-activities", name: "Aktivitas Follow-Up", path: "/crm?sub=activities", subTabKey: "activities" },
      { id: "crm-calendar", name: "Kalender Event", path: "/crm?sub=calendar", subTabKey: "calendar" },
      { id: "crm-whatsapp", name: "WhatsApp Chat", path: "/crm?sub=whatsapp", subTabKey: "whatsapp", badge: 3, badgeColor: "bg-emerald-500" },
      { id: "crm-blast", name: "WhatsApp Blast (AI)", path: "/crm?sub=blast", subTabKey: "blast", badge: "AI", badgeColor: "bg-gradient-to-r from-purple-600 to-pink-500" },
      { id: "crm-quotations", name: "Quotations", path: "/crm?sub=quotations", subTabKey: "quotations" },
      { id: "crm-analytics", name: "Sales Analytics", path: "/crm?sub=analytics", subTabKey: "analytics" },
    ],
  },

  // OPERATIONS
  {
    id: "operations",
    name: "Operations",
    path: "/operations",
    iconName: "Briefcase",
    section: "OPERATIONS",
    allowedRoles: ["MANAGER", "SUPERVISOR"],
    allowedDivisions: ["WAITER", "KITCHEN", "BARISTA", "KASIR", "HOUSEKEEPING"],
    subItems: [
      { id: "ops-todaystasks", name: "Today's Tasks", path: "/operations?sub=todaystasks", subTabKey: "todaystasks" },
      { id: "ops-checklist", name: "Checklist", path: "/operations?sub=checklist", subTabKey: "checklist" },
      { id: "ops-operationalreport", name: "Operational Report", path: "/operations?sub=operationalreport", subTabKey: "operationalreport" },
      { id: "ops-shiftreport", name: "Shift Report", path: "/operations?sub=shiftreport", subTabKey: "shiftreport" },
      { id: "ops-announcements", name: "Announcements", path: "/operations?sub=announcements", subTabKey: "announcements" },
      { id: "ops-approval", name: "Approval", path: "/operations?sub=approval", subTabKey: "approval" },
    ],
  },

  // WASTING LOG
  {
    id: "wasting",
    name: "Wasting Log",
    path: "/wasting",
    iconName: "Trash2",
    section: "OPERATIONS",
    allowedRoles: ["MANAGER", "SUPERVISOR"],
    allowedDivisions: ["KITCHEN", "BARISTA"],
    subItems: [
      { id: "waste-overview", name: "Overview", path: "/wasting?sub=overview", subTabKey: "overview" },
      { id: "waste-input", name: "Input Wasting", path: "/wasting?sub=input", subTabKey: "input" },
      { id: "waste-history", name: "History", path: "/wasting?sub=history", subTabKey: "history" },
      { id: "waste-analytics", name: "Analytics", path: "/wasting?sub=analytics", subTabKey: "analytics" },
    ],
  },

  // PURCHASING & PO
  {
    id: "purchasing",
    name: "Purchasing & PO",
    path: "/purchasing",
    iconName: "ShoppingBag",
    section: "PROCUREMENT",
    allowedRoles: ["MANAGER", "SUPERVISOR"],
    allowedDivisions: ["PURCHASING"],
    subItems: [
      { id: "pur-overview", name: "Overview", path: "/purchasing?sub=overview", subTabKey: "overview" },
      { id: "pur-suppliers", name: "Suppliers", path: "/purchasing?sub=suppliers", subTabKey: "suppliers" },
      { id: "pur-request", name: "Purchase Request", path: "/purchasing?sub=request", subTabKey: "request" },
      { id: "pur-order", name: "Purchase Order", path: "/purchasing?sub=order", subTabKey: "order" },
      { id: "pur-receipt", name: "Goods Receipt", path: "/purchasing?sub=receipt", subTabKey: "receipt" },
      { id: "pur-quality", name: "Quality Check", path: "/purchasing?sub=quality", subTabKey: "quality" },
    ],
  },

  // BATCH PRODUKSI
  {
    id: "production",
    name: "Batch Produksi",
    path: "/production",
    iconName: "Layers",
    section: "PROCUREMENT",
    allowedRoles: ["MANAGER", "SUPERVISOR"],
    allowedDivisions: ["PURCHASING", "KITCHEN"],
    subItems: [
      { id: "prod-overview", name: "Overview", path: "/production?sub=overview", subTabKey: "overview" },
      { id: "prod-plan", name: "Production Plan", path: "/production?sub=plan", subTabKey: "plan" },
      { id: "prod-recipes", name: "Recipes", path: "/production?sub=recipes", subTabKey: "recipes" },
      { id: "prod-batch", name: "Production Batch", path: "/production?sub=batch", subTabKey: "batch" },
      { id: "prod-usage", name: "Material Usage", path: "/production?sub=usage", subTabKey: "usage" },
      { id: "prod-yield", name: "Yield", path: "/production?sub=yield", subTabKey: "yield" },
      { id: "prod-variance", name: "Variance", path: "/production?sub=variance", subTabKey: "variance" },
      { id: "prod-history", name: "Production History", path: "/production?sub=history", subTabKey: "history" },
    ],
  },

  // STOCK INVENTORY
  {
    id: "inventory",
    name: "Stock Inventory",
    path: "/inventory",
    iconName: "Package",
    section: "PROCUREMENT",
    allowedRoles: ["MANAGER", "SUPERVISOR"],
    allowedDivisions: ["PURCHASING", "BARISTA"],
    subItems: [
      { id: "inv-overview", name: "Overview", path: "/inventory?sub=overview", subTabKey: "overview" },
      { id: "inv-products", name: "Products", path: "/inventory?sub=products", subTabKey: "products" },
      { id: "inv-categories", name: "Categories", path: "/inventory?sub=categories", subTabKey: "categories" },
      { id: "inv-units", name: "Units", path: "/inventory?sub=units", subTabKey: "units" },
      { id: "inv-stock", name: "Stock", path: "/inventory?sub=stock", subTabKey: "stock" },
      { id: "inv-movement", name: "Stock Movement", path: "/inventory?sub=movement", subTabKey: "movement" },
      { id: "inv-opname", name: "Stock Opname", path: "/inventory?sub=opname", subTabKey: "opname" },
      { id: "inv-adjustment", name: "Adjustment", path: "/inventory?sub=adjustment", subTabKey: "adjustment" },
      { id: "inv-alerts", name: "Stock Alerts", path: "/inventory?sub=alerts", subTabKey: "alerts", badge: 3, badgeColor: "bg-amber-500" },
    ],
  },

  // FINANCE & COSTING
  {
    id: "finance",
    name: "Finance & Costing",
    path: "/finance",
    iconName: "DollarSign",
    section: "FINANCE",
    allowedRoles: ["MANAGER"],
    allowedDivisions: ["FINANCE"],
    subItems: [
      { id: "fin-overview", name: "Overview", path: "/finance?sub=overview", subTabKey: "overview" },
      { id: "fin-cashbank", name: "Cash & Bank", path: "/finance?sub=cashbank", subTabKey: "cashbank" },
      { id: "fin-income", name: "Income", path: "/finance?sub=income", subTabKey: "income" },
      { id: "fin-expenses", name: "Expenses", path: "/finance?sub=expenses", subTabKey: "expenses" },
      { id: "fin-receivables", name: "Receivables", path: "/finance?sub=receivables", subTabKey: "receivables" },
      { id: "fin-payables", name: "Payables", path: "/finance?sub=payables", subTabKey: "payables" },
      { id: "fin-transactions", name: "Transactions", path: "/finance?sub=transactions", subTabKey: "transactions" },
      { id: "fin-pettycash", name: "Petty Cash", path: "/finance?sub=pettycash", subTabKey: "pettycash" },
      { id: "fin-budget", name: "Budget", path: "/finance?sub=budget", subTabKey: "budget" },
      { id: "fin-journal", name: "Journal", path: "/finance?sub=journal", subTabKey: "journal" },
      { id: "fin-accounts", name: "Accounts", path: "/finance?sub=accounts", subTabKey: "accounts" },
      { id: "fin-reports", name: "Finance Reports", path: "/finance?sub=reports", subTabKey: "reports" },
    ],
  },
  {
    id: "hpp",
    name: "HPP Calculator",
    path: "/hpp",
    iconName: "Calculator",
    section: "FINANCE",
    allowedRoles: ["MANAGER"],
    allowedDivisions: ["FINANCE"],
    subItems: [
      { id: "hpp-overview", name: "Overview", path: "/hpp?sub=overview", subTabKey: "overview" },
      { id: "hpp-ingredients", name: "Ingredients", path: "/hpp?sub=ingredients", subTabKey: "ingredients" },
      { id: "hpp-recipes", name: "Recipes", path: "/hpp?sub=recipes", subTabKey: "recipes" },
      { id: "hpp-menucost", name: "Menu Cost", path: "/hpp?sub=menucost", subTabKey: "menucost" },
      { id: "hpp-costanalysis", name: "Cost Analysis", path: "/hpp?sub=costanalysis", subTabKey: "costanalysis" },
      { id: "hpp-simulator", name: "Price Simulator", path: "/hpp?sub=simulator", subTabKey: "simulator" },
    ],
  },

  // MARKETING / CONTENT
  {
    id: "content",
    name: "Content Creator",
    path: "/content",
    iconName: "FileVideo",
    section: "MARKETING",
    allowedRoles: ["MANAGER"],
    allowedDivisions: ["CONTENT_CREATOR"],
    subItems: [
      { id: "cnt-overview", name: "Overview", path: "/content?sub=overview", subTabKey: "overview" },
      { id: "cnt-calendar", name: "Content Calendar", path: "/content?sub=calendar", subTabKey: "calendar" },
      { id: "cnt-ideas", name: "Content Ideas", path: "/content?sub=ideas", subTabKey: "ideas" },
      { id: "cnt-production", name: "Content Production", path: "/content?sub=production", subTabKey: "production" },
      { id: "cnt-library", name: "Content Library", path: "/content?sub=library", subTabKey: "library" },
      { id: "cnt-publishing", name: "Publishing", path: "/content?sub=publishing", subTabKey: "publishing" },
      { id: "cnt-campaigns", name: "Campaigns", path: "/content?sub=campaigns", subTabKey: "campaigns" },
      { id: "cnt-analytics", name: "Analytics", path: "/content?sub=analytics", subTabKey: "analytics" },
    ],
  },

  // PEOPLE
  {
    id: "hr",
    name: "Human Resources",
    path: "/hr",
    iconName: "UserCheck",
    section: "PEOPLE",
    allowedRoles: ["MANAGER", "SUPERVISOR", "STAFF"],
    allowedDivisions: [],
    subItems: [
      { id: "hr-overview", name: "Overview", path: "/hr?sub=overview", subTabKey: "overview" },
      { id: "hr-mgmt", name: "Data Karyawan", path: "/hr?sub=mgmt", subTabKey: "mgmt" },
      { id: "hr-org", name: "Struktur Organisasi", path: "/hr?sub=org", subTabKey: "org" },
      { id: "hr-salary", name: "Pengaturan Gaji", path: "/hr?sub=salary", subTabKey: "salary" },
      { id: "hr-overtime", name: "Lembur", path: "/hr?sub=overtime", subTabKey: "overtime" },
      { id: "hr-deductions", name: "Potongan", path: "/hr?sub=deductions", subTabKey: "deductions" },
      { id: "hr-leave", name: "Pengajuan Istirahat", path: "/hr?sub=leave", subTabKey: "leave" },
      { id: "hr-docs", name: "Dokumen HR", path: "/hr?sub=docs", subTabKey: "docs" },
      { id: "hr-kpi", name: "Checklist & KPI", path: "/hr?sub=kpi", subTabKey: "kpi" },
      { id: "hr-history", name: "Riwayat HR", path: "/hr?sub=history", subTabKey: "history" },
    ],
  },

  // ANALYTICS
  {
    id: "reports",
    name: "Reports",
    path: "/reports",
    iconName: "BarChart3",
    section: "ANALYTICS",
    allowedRoles: ["MANAGER", "SUPERVISOR"],
    allowedDivisions: ["KASIR", "FINANCE"],
    subItems: [
      { id: "rep-revenue", name: "Revenue", path: "/reports?sub=revenue", subTabKey: "revenue" },
      { id: "rep-sales", name: "Sales", path: "/reports?sub=sales", subTabKey: "sales" },
      { id: "rep-crm", name: "CRM", path: "/reports?sub=crm", subTabKey: "crm" },
      { id: "rep-inventory", name: "Inventory", path: "/reports?sub=inventory", subTabKey: "inventory" },
      { id: "rep-purchasing", name: "Purchasing", path: "/reports?sub=purchasing", subTabKey: "purchasing" },
      { id: "rep-production", name: "Production", path: "/reports?sub=production", subTabKey: "production" },
      { id: "rep-hpp", name: "HPP", path: "/reports?sub=hpp", subTabKey: "hpp" },
      { id: "rep-finance", name: "Finance", path: "/reports?sub=finance", subTabKey: "finance" },
      { id: "rep-operations", name: "Operations", path: "/reports?sub=operations", subTabKey: "operations" },
      { id: "rep-wasting", name: "Wasting", path: "/reports?sub=wasting", subTabKey: "wasting" },
      { id: "rep-hr", name: "HR", path: "/reports?sub=hr", subTabKey: "hr" },
      { id: "rep-payroll", name: "Payroll", path: "/reports?sub=payroll", subTabKey: "payroll" },
      { id: "rep-kpi", name: "KPI", path: "/reports?sub=kpi", subTabKey: "kpi" },
      { id: "rep-content", name: "Content", path: "/reports?sub=content", subTabKey: "content" },
    ],
  },

  // SYSTEM
  {
    id: "settings",
    name: "Settings",
    path: "/settings",
    iconName: "Settings",
    section: "SYSTEM",
    allowedRoles: ["MANAGER"],
    allowedDivisions: [],
    subItems: [
      { id: "set-company", name: "Company", path: "/settings?sub=company", subTabKey: "company" },
      { id: "set-users", name: "Users", path: "/settings?sub=users", subTabKey: "users" },
      { id: "set-roles", name: "Roles", path: "/settings?sub=roles", subTabKey: "roles" },
      { id: "set-divisions", name: "Divisions", path: "/settings?sub=divisions", subTabKey: "divisions" },
      { id: "set-employees", name: "Employees", path: "/settings?sub=employees", subTabKey: "employees" },
      { id: "set-products", name: "Products", path: "/settings?sub=products", subTabKey: "products" },
      { id: "set-categories", name: "Categories", path: "/settings?sub=categories", subTabKey: "categories" },
      { id: "set-units", name: "Units", path: "/settings?sub=units", subTabKey: "units" },
      { id: "set-suppliers", name: "Suppliers", path: "/settings?sub=suppliers", subTabKey: "suppliers" },
      { id: "set-crmpipeline", name: "CRM Pipeline", path: "/settings?sub=crmpipeline", subTabKey: "crmpipeline" },
      { id: "set-checklists", name: "Checklist Templates", path: "/settings?sub=checklists", subTabKey: "checklists" },
      { id: "set-forms", name: "Digital Forms", path: "/settings?sub=forms", subTabKey: "forms" },
      { id: "set-approval", name: "Approval Workflow", path: "/settings?sub=approval", subTabKey: "approval" },
      { id: "set-system", name: "System Settings", path: "/settings?sub=system", subTabKey: "system" },
    ],
  },
];

// Filter navigation tree based on user permissions
export function getFilteredNavigationTree(user: any): MenuItem[] {
  if (!user) return [];

  const userRole: string = user.role || user.accessLevel || "";
  const userDivision: string = (user.division || user.department || "").toUpperCase();

  // OWNER strictly only sees Dashboard
  if (userRole === "OWNER" || user.accessLevel === "OWNER") {
    return NAVIGATION_TREE.filter((item) => item.id === "dashboard");
  }

  // HR Officer strictly only sees Tropical HR and Development
  const isHROfficer =
    userDivision === "HR" ||
    userRole.toUpperCase().includes("HR") ||
    (user.primaryPosition && user.primaryPosition.toUpperCase().includes("HR")) ||
    (Array.isArray(user.additionalResponsibilities) &&
      user.additionalResponsibilities.some((r: string) => r.toUpperCase().includes("HR")));

  if (isHROfficer && userRole !== "MANAGER") {
    return NAVIGATION_TREE.filter((item) => item.id === "hr" || item.id === "development");
  }

  if (userRole === "MANAGER") {
    return NAVIGATION_TREE;
  }

  // Normalize legacy divisions
  const isCashierDiv = userDivision === "CASHIER" || userDivision === "KASIR";
  const isDishwashDiv = userDivision === "DISHWASH_CLEANING" || userDivision === "HOUSEKEEPING";

  return NAVIGATION_TREE.filter((item) => {
    // 1. Dashboard is accessible by everyone
    if (item.id === "dashboard") return true;

    // 2. Settings is strictly MANAGER only
    if (item.id === "settings") return false;

    // 3. HR is accessible for Staff (Self-Service: Slip Gaji, Lembur, Istirahat, Dokumen) & Management
    if (item.id === "hr") {
      return true;
    }

    // 4. Check explicit allowedRoles
    if (item.allowedRoles && item.allowedRoles.includes(userRole as Role)) {
      if (userRole === "SUPERVISOR") return true;
    }

    // 5. Check allowedDivisions for Staff
    if (item.allowedDivisions && item.allowedDivisions.length > 0) {
      return item.allowedDivisions.some((d) => {
        const divUpper = d.toUpperCase();
        if (divUpper === userDivision) return true;
        if (isCashierDiv && (divUpper === "CASHIER" || divUpper === "KASIR")) return true;
        if (isDishwashDiv && (divUpper === "DISHWASH_CLEANING" || divUpper === "HOUSEKEEPING")) return true;
        return false;
      });
    }

    return false;
  }).map((item) => {
    // Hide manager-only subItems from STAFF and SUPERVISOR
    if (userRole === "STAFF" && item.subItems) {
      if (item.id === "hr") {
        const allowedStaffHRSubItems = ["hr-overtime", "hr-leave", "hr-docs", "hr-kpi"];
        return {
          ...item,
          subItems: item.subItems.filter((sub) => allowedStaffHRSubItems.includes(sub.id)),
        };
      }
      return {
        ...item,
        subItems: item.subItems.filter((sub) => sub.id !== "ops-approval" && sub.id !== "hr-approval"),
      };
    }

    if (userRole === "SUPERVISOR" && item.subItems) {
      if (item.id === "hr") {
        // Supervisor cannot see salary/payroll or deductions
        const forbiddenSupervisorHRSubItems = ["hr-salary", "hr-deductions"];
        return {
          ...item,
          subItems: item.subItems.filter((sub) => !forbiddenSupervisorHRSubItems.includes(sub.id)),
        };
      }
    }
    return item;
  });
}
