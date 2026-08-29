export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  source: "Instagram" | "WhatsApp" | "Walk-in" | "Website" | "Referral";
  interest: "Wedding Event" | "Corporate Gathering" | "Birthday Party" | "VIP Table" | "Catering";
  estimatedGuests: number;
  status: "New" | "Contacted" | "Qualified" | "Unqualified";
  assignedTo: string;
  createdAt: string;
  notes: string;
}

export interface Opportunity {
  id: string;
  title: string;
  customerName: string;
  company?: string;
  phone: string;
  stage: "New Lead" | "Contacted" | "Quotation Sent" | "Negotiation" | "Closed Won" | "Closed Lost";
  dealValue: number;
  eventDate: string;
  guestCount: number;
  probability: number;
  assignedTo: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: "VIP" | "Regular" | "Corporate";
  totalVisits: number;
  totalSpend: number;
  lastVisit: string;
  favoriteMenu: string;
  preferredSeating: string;
  notes: string;
}

export interface Activity {
  id: string;
  customerName: string;
  type: "Call" | "Meeting" | "WhatsApp" | "Food Tasting" | "Site Visit";
  subject: string;
  date: string;
  time: string;
  staffName: string;
  status: "Completed" | "Scheduled" | "Cancelled";
  notes: string;
}

export interface QuotationItem {
  name: string;
  category: "Buffet Package" | "Beverage" | "Decoration" | "Live Music" | "Service Fee";
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerPhone: string;
  eventName: string;
  eventDate: string;
  guestCount: number;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  status: "Draft" | "Sent" | "Approved" | "Rejected";
  createdAt: string;
  validUntil: string;
}

export interface WhatsAppMessage {
  id: string;
  sender: "customer" | "staff";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
}

export interface WhatsAppChat {
  id: string;
  customerName: string;
  phone: string;
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
  messages: WhatsAppMessage[];
}

export const MOCK_LEADS: Lead[] = [];
export const MOCK_OPPORTUNITIES: Opportunity[] = [];
export const MOCK_CUSTOMERS: Customer[] = [];
export const MOCK_ACTIVITIES: Activity[] = [];
export const MOCK_QUOTATIONS: Quotation[] = [];
export const MOCK_WHATSAPP_CHATS: WhatsAppChat[] = [];
