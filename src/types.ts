/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Roofing company subscriber
export interface RoofingCompany {
  id: string;
  email: string;
  companyName: string;
  stripeConnectId: string;
  stripeStatus: "active" | "pending" | "none";
  twilioPhoneNumber: string;
  calendarConnected: boolean;
  createdAt: string;
  updatedAt: string;
  physicalAddress?: string;
}

// Conversation message object
export interface ChatMessage {
  sender: "homeowner" | "sarah";
  text: string;
  timestamp: string;
}

// Homeowner sales funnel lead
export interface Lead {
  id: string;
  rooferId: string;
  homeownerName: string;
  homeownerPhone: string;
  homeownerChannel: "sms" | "instagram" | "web";
  homeownerUsername?: string;
  status: "new" | "conversing" | "qualified" | "scheduled" | "won" | "lost";
  neighborhood?: string;
  bookingTime?: string; // ISO UTC format
  transcript: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// Billing loop model
export interface Transaction {
  id: string;
  rooferId: string;
  leadId: string;
  amount: number;
  platformFee: number; // 2% platform fee
  status: "pending" | "paid" | "failed";
  paymentMethod: "ach" | "card";
  description: string;
  payerRouting?: string;
  payerAccount?: string;
  createdAt: string;
  updatedAt: string;
}

// API status payloads
export interface DashboardStats {
  totalLeads: number;
  qualifiedLeads: number;
  ratio: number;
  revenueGenerated: number;
  platformFeesPaid: number;
}

export interface TenantLeadSummary {
  id: string;
  homeownerName: string;
  homeownerPhone: string;
  homeownerChannel: string;
  status: string;
  neighborhood?: string;
  bookingTime?: string;
  createdAt: string;
}

export interface TenantStats {
  companyId: string;
  companyName: string;
  stripeConnectId: string;
  stripeStatus: string;
  totalLeads: number;
  totalQualified: number;
  totalRoofsBooked: number;
  totalVolume: number;
  platformFeesGenerated: number;
  leads: TenantLeadSummary[];
}

export interface AdminDashboardStats {
  totalProcessedVolume: number;
  totalPlatformProfit: number;
  availableBalance: number;
  pendingBalance: number;
  tenants: TenantStats[];
  totpSecret: string;
  liveStripeUsed?: boolean;
  totpCode?: string;
}
