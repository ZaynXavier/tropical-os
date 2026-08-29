/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, NavigationItem } from "../types";

export const MOCK_USERS: User[] = [
  {
    id: "user-1",
    name: "Budi Santoso",
    email: "budi.santoso@tropicalgarden.co.id",
    role: "MANAGER",
    division: "FINANCE",
  },
  {
    id: "user-2",
    name: "Agus Pratama",
    email: "agus.pratama@tropicalgarden.co.id",
    role: "MANAGER",
    division: "WAITER",
  },
  {
    id: "user-3",
    name: "Siti Rahma",
    email: "siti.rahma@tropicalgarden.co.id",
    role: "SUPERVISOR",
    division: "WAITER",
  },
  {
    id: "user-4",
    name: "Dimas Anggara",
    email: "dimas.anggara@tropicalgarden.co.id",
    role: "SUPERVISOR",
    division: "KITCHEN",
  },
  {
    id: "user-5",
    name: "Rizky",
    email: "rizky@tropicalgarden.co.id",
    role: "STAFF",
    division: "WAITER",
  },
  {
    id: "user-6",
    name: "Maya",
    email: "maya@tropicalgarden.co.id",
    role: "STAFF",
    division: "BARISTA",
  },
  {
    id: "user-7",
    name: "Eko",
    email: "eko@tropicalgarden.co.id",
    role: "STAFF",
    division: "KASIR",
  },
  {
    id: "user-8",
    name: "Dewi",
    email: "dewi@tropicalgarden.co.id",
    role: "STAFF",
    division: "PURCHASING",
  },
  {
    id: "user-9",
    name: "Alya",
    email: "alya@tropicalgarden.co.id",
    role: "STAFF",
    division: "CRM",
  },
  {
    id: "user-10",
    name: "Rudi",
    email: "rudi@tropicalgarden.co.id",
    role: "STAFF",
    division: "HOUSEKEEPING",
  },
  {
    id: "user-11",
    name: "Nina",
    email: "nina@tropicalgarden.co.id",
    role: "STAFF",
    division: "FINANCE",
  },
];

export const NAVIGATION_ITEMS: NavigationItem[] = [
  // MAIN
  {
    name: "Dashboard",
    path: "/dashboard",
    iconName: "LayoutDashboard",
    section: "MAIN",
  },
  // CUSTOMER
  {
    name: "CRM",
    path: "/crm",
    iconName: "Users",
    section: "CUSTOMER",
    allowedRoles: ["MANAGER", "SUPERVISOR"],
    allowedDivisions: ["CRM"],
  },
  // OPERATIONS
  {
    name: "Operations",
    path: "/operations",
    iconName: "Briefcase",
    section: "OPERATIONS",
    allowedRoles: ["MANAGER", "SUPERVISOR"],
    allowedDivisions: ["WAITER", "KITCHEN", "BARISTA", "KASIR", "HOUSEKEEPING"],
  },
  {
    name: "Wasting",
    path: "/wasting",
    iconName: "Trash2",
    section: "OPERATIONS",
    allowedRoles: ["MANAGER", "SUPERVISOR"],
    allowedDivisions: ["KITCHEN"],
  },
  // PROCUREMENT
  {
    name: "Purchasing",
    path: "/purchasing",
    iconName: "ShoppingBag",
    section: "PROCUREMENT",
    allowedRoles: ["MANAGER", "SUPERVISOR"],
    allowedDivisions: ["PURCHASING"],
  },
  {
    name: "Production",
    path: "/production",
    iconName: "ChefHat",
    section: "PROCUREMENT",
    allowedRoles: ["MANAGER", "SUPERVISOR"],
    allowedDivisions: ["PURCHASING", "KITCHEN"],
  },
  {
    name: "Inventory",
    path: "/inventory",
    iconName: "Warehouse",
    section: "PROCUREMENT",
    allowedRoles: ["MANAGER", "SUPERVISOR"],
    allowedDivisions: ["PURCHASING", "BARISTA", "KITCHEN"],
  },
  // FINANCE
  {
    name: "Finance",
    path: "/finance",
    iconName: "DollarSign",
    section: "FINANCE",
    allowedRoles: ["MANAGER"],
    allowedDivisions: ["FINANCE"],
  },
  {
    name: "HPP Calculator",
    path: "/hpp",
    iconName: "Calculator",
    section: "FINANCE",
    allowedRoles: ["MANAGER"],
    allowedDivisions: ["FINANCE"],
  },
  // MARKETING
  {
    name: "Content",
    path: "/content",
    iconName: "FileVideo",
    section: "MARKETING",
    allowedRoles: ["MANAGER"],
    allowedDivisions: ["CONTENT_CREATOR"],
  },
  // PEOPLE
  {
    name: "HR",
    path: "/hr",
    iconName: "UserCheck",
    section: "PEOPLE",
    allowedRoles: ["MANAGER", "SUPERVISOR"],
    allowedDivisions: [], // HR is strictly for manager and supervisor, staff has employee self service but the HR module itself is managed
  },
  // ANALYTICS
  {
    name: "Reports",
    path: "/reports",
    iconName: "BarChart3",
    section: "ANALYTICS",
    allowedRoles: ["MANAGER", "SUPERVISOR"],
    allowedDivisions: ["KASIR"],
  },
  // SYSTEM
  {
    name: "Settings",
    path: "/settings",
    iconName: "Settings",
    section: "SYSTEM",
    allowedRoles: ["MANAGER"],
    allowedDivisions: [],
  },
];

// Helper to filter navigation items based on user's role and division
export function getFilteredNavigation(user: User): NavigationItem[] {
  if (user.role === "MANAGER") {
    return NAVIGATION_ITEMS;
  }
  
  if (user.role === "SUPERVISOR") {
    // Supervisor can see most items
    return NAVIGATION_ITEMS.filter(item => {
      if (item.path === "/settings") return false; // Settings is strictly for manager
      if (item.path === "/finance") return false;  // Finance is strictly for manager
      if (item.path === "/hpp") return false;      // HPP is strictly for manager
      if (item.path === "/content") return false;  // Content is for Content Creator staff and manager
      return true;
    });
  }

  // Staff division-based routing
  return NAVIGATION_ITEMS.filter(item => {
    // Dashboard is always visible
    if (item.path === "/dashboard") return true;

    // Check if user's division is in allowedDivisions
    if (item.allowedDivisions && item.allowedDivisions.includes(user.division)) {
      return true;
    }
    
    return false;
  });
}
