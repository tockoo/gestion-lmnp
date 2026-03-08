import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Property, Tenant, Expense, Receipt, Settings, Reservation, Depreciation } from '@/types/lmnp';

export function generateId(): string {
  return crypto.randomUUID();
}

// ── Mappers DB ↔ App ──

function dbToProperty(row: any): Property {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    type: row.type,
    surface: Number(row.surface),
    acquisitionValue: Number(row.acquisition_value),
    acquisitionDate: row.acquisition_date,
    taxRegime: row.tax_regime,
    monthlyCoproCharges: Number(row.monthly_copro_charges),
    annualPropertyTax: Number(row.annual_property_tax),
    rentalType: row.rental_type,
    nightlyRate: row.nightly_rate != null ? Number(row.nightly_rate) : undefined,
    depreciation: {
      buildingValue: Number(row.depreciation_building_value),
      buildingYears: Number(row.depreciation_building_years),
      furnitureValue: Number(row.depreciation_furniture_value),
      furnitureYears: Number(row.depreciation_furniture_years),
    },
  };
}

function propertyToDb(p: Omit<Property, 'id'>, userId: string) {
  return {
    user_id: userId,
    name: p.name,
    address: p.address,
    type: p.type,
    surface: p.surface,
    acquisition_value: p.acquisitionValue,
    acquisition_date: p.acquisitionDate,
    tax_regime: p.taxRegime,
    monthly_copro_charges: p.monthlyCoproCharges,
    annual_property_tax: p.annualPropertyTax,
    rental_type: p.rentalType,
    nightly_rate: p.nightlyRate ?? null,
    depreciation_building_value: p.depreciation?.buildingValue ?? 0,
    depreciation_building_years: p.depreciation?.buildingYears ?? 25,
    depreciation_furniture_value: p.depreciation?.furnitureValue ?? 0,
    depreciation_furniture_years: p.depreciation?.furnitureYears ?? 7,
  };
}

function dbToTenant(row: any): Tenant {
  return {
    id: row.id,
    propertyId: row.property_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    entryDate: row.entry_date,
    exitDate: row.exit_date ?? undefined,
    monthlyRentHC: Number(row.monthly_rent_hc),
    monthlyCharges: Number(row.monthly_charges),
    deposit: Number(row.deposit),
    status: row.status,
  };
}

function tenantToDb(t: Omit<Tenant, 'id'>, userId: string) {
  return {
    user_id: userId,
    property_id: t.propertyId,
    first_name: t.firstName,
    last_name: t.lastName,
    email: t.email,
    phone: t.phone,
    entry_date: t.entryDate,
    exit_date: t.exitDate ?? null,
    monthly_rent_hc: t.monthlyRentHC,
    monthly_charges: t.monthlyCharges,
    deposit: t.deposit,
    status: t.status,
  };
}

function dbToReservation(row: any): Reservation {
  return {
    id: row.id,
    propertyId: row.property_id,
    guestName: row.guest_name,
    guestEmail: row.guest_email ?? undefined,
    guestPhone: row.guest_phone ?? undefined,
    checkIn: row.check_in,
    checkOut: row.check_out,
    nightlyRate: Number(row.nightly_rate),
    nights: Number(row.nights),
    totalAmount: Number(row.total_amount),
    platformFees: Number(row.platform_fees),
    cleaningFees: Number(row.cleaning_fees),
    status: row.status,
    platform: row.platform,
    notes: row.notes ?? undefined,
  };
}

function reservationToDb(r: Omit<Reservation, 'id'>, userId: string) {
  return {
    user_id: userId,
    property_id: r.propertyId,
    guest_name: r.guestName,
    guest_email: r.guestEmail ?? null,
    guest_phone: r.guestPhone ?? null,
    check_in: r.checkIn,
    check_out: r.checkOut,
    nightly_rate: r.nightlyRate,
    nights: r.nights,
    total_amount: r.totalAmount,
    platform_fees: r.platformFees,
    cleaning_fees: r.cleaningFees,
    status: r.status,
    platform: r.platform,
    notes: r.notes ?? null,
  };
}

function dbToReceipt(row: any): Receipt {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    propertyId: row.property_id,
    month: row.month,
    year: row.year,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    rentHC: Number(row.rent_hc),
    charges: Number(row.charges),
    total: Number(row.total),
    status: row.status,
    amountReceived: Number(row.amount_received),
    paidDate: row.paid_date ?? undefined,
  };
}

function receiptToDb(r: Omit<Receipt, 'id'>, userId: string) {
  return {
    user_id: userId,
    tenant_id: r.tenantId,
    property_id: r.propertyId,
    month: r.month,
    year: r.year,
    period_start: r.periodStart,
    period_end: r.periodEnd,
    rent_hc: r.rentHC,
    charges: r.charges,
    total: r.total,
    status: r.status,
    amount_received: r.amountReceived,
    paid_date: r.paidDate ?? null,
  };
}

function dbToExpense(row: any): Expense {
  return {
    id: row.id,
    propertyId: row.property_id,
    category: row.category,
    amountTTC: Number(row.amount_ttc),
    date: row.date,
    description: row.description,
    invoiceRef: row.invoice_ref,
    taxDeductible: row.tax_deductible,
    attachmentUrl: row.attachment_url ?? undefined,
    attachmentName: row.attachment_name ?? undefined,
  };
}

function expenseToDb(e: Omit<Expense, 'id'>, userId: string) {
  return {
    user_id: userId,
    property_id: e.propertyId,
    category: e.category,
    amount_ttc: e.amountTTC,
    date: e.date,
    description: e.description,
    invoice_ref: e.invoiceRef,
    tax_deductible: e.taxDeductible,
    attachment_url: e.attachmentUrl ?? null,
    attachment_name: e.attachmentName ?? null,
  };
}

function dbToSettings(row: any): Settings {
  return {
    ownerName: row.owner_name,
    activeFiscalYear: row.active_fiscal_year,
  };
}

// ── Generic CRUD hook factory ──

function useCrudHook<T extends { id: string }>(
  table: string,
  queryKey: string,
  fromDb: (row: any) => T,
  toDb: (item: Omit<T, 'id'>, userId: string) => any,
) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from(table).select('*');
      if (error) throw error;
      return (data || []).map(fromDb);
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (item: Omit<T, 'id'>) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await (supabase as any).from(table).insert(toDb(item, user.id));
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...rest }: T) => {
      if (!user) throw new Error('Not authenticated');
      const dbData = toDb(rest as any, user.id);
      const { error } = await (supabase as any).from(table).update(dbData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from(table).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  });

  return {
    data,
    isLoading,
    add: addMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  };
}

// ── Exported hooks ──

export function useProperties() {
  return useCrudHook<Property>('properties', 'properties', dbToProperty, propertyToDb);
}

export function useTenants() {
  return useCrudHook<Tenant>('tenants', 'tenants', dbToTenant, tenantToDb);
}

export function useReservations() {
  return useCrudHook<Reservation>('reservations', 'reservations', dbToReservation, reservationToDb);
}

export function useReceipts() {
  return useCrudHook<Receipt>('receipts', 'receipts', dbToReceipt, receiptToDb);
}

export function useExpenses() {
  return useCrudHook<Expense>('expenses', 'expenses', dbToExpense, expenseToDb);
}

export function useSettings() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('settings').select('*').maybeSingle();
      if (error) throw error;
      if (!data) return { ownerName: '', activeFiscalYear: 2025 } as Settings;
      return dbToSettings(data);
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (s: Settings) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await (supabase as any).from('settings').upsert({
        user_id: user.id,
        owner_name: s.ownerName,
        active_fiscal_year: s.activeFiscalYear,
      }, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });

  return {
    data: data || { ownerName: '', activeFiscalYear: 2025 },
    isLoading,
    save: saveMutation.mutateAsync,
  };
}

export async function resetAllData() {
  await Promise.all([
    supabase.from('receipts').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    supabase.from('reservations').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    supabase.from('tenants').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    supabase.from('properties').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    supabase.from('settings').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
  ]);
  window.location.reload();
}
