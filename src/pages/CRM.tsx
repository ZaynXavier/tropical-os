import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MASTER_NAVIGATION } from '../config/navigation';
import { permissionService } from '../services/permissionService';
import { CrmDashboardView } from '../components/crm/CrmDashboardView';
import { ModernCrmDashboardView } from '../components/crm/ModernCrmDashboardView';
import { UnifiedWhatsAppHub } from '../components/crm/UnifiedWhatsAppHub';
import { WhatsAppQrLoginView } from '../components/crm/WhatsAppQrLoginView';
import { ReservationCalendarView } from '../components/crm/ReservationCalendarView';
import { FollowUpCalendarView } from '../components/crm/FollowUpCalendarView';
import { CrmCustomers } from '../components/crm/CrmCustomers';
import { CrmLeads } from '../components/crm/CrmLeads';
import { CrmPipeline } from '../components/crm/CrmPipeline';
import { CrmWhatsApp } from '../components/crm/CrmWhatsApp';
import { CrmWhatsAppBlast } from '../components/crm/CrmWhatsAppBlast';
import { CrmCalendar } from '../components/crm/CrmCalendar';
import {
  MOCK_CUSTOMERS,
  MOCK_LEADS,
  MOCK_OPPORTUNITIES,
  MOCK_WHATSAPP_CHATS,
  MOCK_ACTIVITIES,
  Customer,
  Lead,
  Opportunity,
} from '../data/mockCrmData';
import { Bot, QrCode } from 'lucide-react';

export default function CRM() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const crmModule = MASTER_NAVIGATION.find((m) => m.id === 'crm');

  const availableSubmodules = (crmModule?.submodules || []).filter((sub) =>
    permissionService.canViewSubmodule(currentUser, 'crm', sub)
  );

  const activeSubParam = searchParams.get('sub') || (availableSubmodules[0]?.subParam || 'dashboard');

  // State persistence in local memory
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [, setActiveChatPhone] = useState<string>('+62 812-3456-7890');
  const [, setActiveChatName] = useState<string>('Bpk. Hendra Gunawan');

  const handleOpenWhatsApp = (phone: string, name: string) => {
    setActiveChatPhone(phone);
    setActiveChatName(name);
    setSearchParams({ sub: 'whatsapp' });
  };

  const handleNavigateTab = (subTab: string) => {
    setSearchParams({ sub: subTab });
  };

  const handleAddCustomer = (newCustomer: Omit<Customer, 'id'>) => {
    const customer: Customer = {
      ...newCustomer,
      id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
    };
    setCustomers((prev) => [customer, ...prev]);
  };

  const handleAddLead = (newLead: Omit<Lead, 'id' | 'createdAt'>) => {
    const lead: Lead = {
      ...newLead,
      id: `LEAD-${String(leads.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLeads((prev) => [lead, ...prev]);
  };

  const handleUpdateLeadStatus = (id: string, newStatus: Lead['status']) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
  };

  const handleConvertToOpportunity = (lead: Lead) => {
    const newOpp: Opportunity = {
      id: `OPP-${String(opportunities.length + 1).padStart(3, '0')}`,
      title: `${lead.interest} - ${lead.name}`,
      customerName: lead.name,
      company: lead.company,
      phone: lead.phone,
      stage: 'Contacted',
      dealValue: lead.estimatedGuests * 150000,
      eventDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      guestCount: lead.estimatedGuests,
      probability: 60,
      assignedTo: currentUser?.name || 'Alya Staff CRM',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setOpportunities((prev) => [newOpp, ...prev]);
    handleUpdateLeadStatus(lead.id, 'Qualified');
    setSearchParams({ sub: 'pipeline' });
  };

  const handleUpdateOpportunityStage = (id: string, newStage: Opportunity['stage']) => {
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, stage: newStage } : o)));
  };

  const renderContent = () => {
    switch (activeSubParam) {
      case 'dashboard':
      case 'overview':
        return (
          <ModernCrmDashboardView
            leads={leads}
            opportunities={opportunities}
            customers={customers}
            onNavigateTab={(tab) => setSearchParams({ sub: tab })}
            onOpenWhatsApp={handleOpenWhatsApp}
          />
        );

      case 'whatsapp':
      case 'chat':
        return (
          <CrmWhatsApp
            chats={MOCK_WHATSAPP_CHATS}
            currentStaffName={currentUser?.fullName || currentUser?.name || 'Tim CRM'}
          />
        );

      case 'blast':
      case 'whatsapp-blast':
        return (
          <CrmWhatsAppBlast
            leads={leads}
            opportunities={opportunities}
            customers={customers}
            onOpenWhatsAppChat={handleOpenWhatsApp}
          />
        );

      case 'whatsapp-qr':
      case 'qr':
      case 'login':
        return <WhatsAppQrLoginView />;

      case 'whatsapp-unified':
        return <UnifiedWhatsAppHub />;

      case 'reservation':
      case 'reservation-calendar':
        return <ReservationCalendarView />;

      case 'follow-up':
      case 'follow-up-calendar':
        return <FollowUpCalendarView />;

      case 'customers':
        return (
          <CrmCustomers
            customers={customers}
            onAddCustomer={handleAddCustomer}
            onOpenWhatsApp={handleOpenWhatsApp}
          />
        );

      case 'leads':
        return (
          <CrmLeads
            leads={leads}
            onAddLead={handleAddLead}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onConvertToOpportunity={handleConvertToOpportunity}
            onOpenWhatsApp={handleOpenWhatsApp}
          />
        );

      case 'pipeline':
        return (
          <CrmPipeline
            opportunities={opportunities}
            onUpdateStage={handleUpdateOpportunityStage}
            onOpenAddDeal={() => setSearchParams({ sub: 'leads' })}
          />
        );

      case 'calendar':
      default:
        return <CrmCalendar opportunities={opportunities} activities={MOCK_ACTIVITIES} />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Submodule Navigation Tabs */}
      <div className="bg-[#151B2B] rounded-2xl border border-white/10 p-2 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {availableSubmodules.map((sub) => {
            const isActive = sub.subParam === activeSubParam;
            return (
              <button
                key={sub.id}
                onClick={() => setSearchParams({ sub: sub.subParam })}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main CRM Content */}
      {renderContent()}
    </div>
  );
}
