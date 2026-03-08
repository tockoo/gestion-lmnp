import { useState, useCallback } from 'react';
import type { Property, Tenant, Expense, Receipt, Settings } from '@/types/lmnp';

const KEYS = {
  properties: 'lmnp_properties',
  tenants: 'lmnp_tenants',
  receipts: 'lmnp_receipts',
  expenses: 'lmnp_expenses',
  settings: 'lmnp_settings',
  initialized: 'lmnp_initialized',
};

export function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStored(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      localStorage.setItem(key, JSON.stringify(newValue));
      return newValue;
    });
  }, [key]);

  return [stored, setValue];
}

export const useProperties = () => useLocalStorage<Property[]>(KEYS.properties, []);
export const useTenants = () => useLocalStorage<Tenant[]>(KEYS.tenants, []);
export const useReceipts = () => useLocalStorage<Receipt[]>(KEYS.receipts, []);
export const useExpenses = () => useLocalStorage<Expense[]>(KEYS.expenses, []);
export const useSettings = () => useLocalStorage<Settings>(KEYS.settings, { ownerName: 'Mon Nom', activeFiscalYear: 2025 });

export function initDemoData() {
  if (localStorage.getItem(KEYS.initialized)) return;

  const properties: Property[] = [
    {
      id: 'prop-1',
      name: 'Studio Paris 75011',
      address: '14 rue de la Roquette, 75011 Paris',
      type: 'studio',
      surface: 28,
      acquisitionValue: 180000,
      acquisitionDate: '2020-01-15',
      taxRegime: 'reel-simplifie',
      monthlyCoproCharges: 80,
      annualPropertyTax: 950,
    },
    {
      id: 'prop-2',
      name: 'T2 Lyon 69003',
      address: '8 avenue Félix Faure, 69003 Lyon',
      type: 'appartement',
      surface: 45,
      acquisitionValue: 220000,
      acquisitionDate: '2021-06-01',
      taxRegime: 'reel-simplifie',
      monthlyCoproCharges: 120,
      annualPropertyTax: 1200,
    },
  ];

  const tenants: Tenant[] = [
    {
      id: 'ten-1',
      propertyId: 'prop-1',
      firstName: 'Thomas',
      lastName: 'Bernard',
      email: 'thomas.bernard@email.com',
      phone: '06 12 34 56 78',
      entryDate: '2024-09-01',
      exitDate: '2025-02-28',
      monthlyRentHC: 850,
      monthlyCharges: 50,
      deposit: 850,
      status: 'parti',
    },
    {
      id: 'ten-2',
      propertyId: 'prop-1',
      firstName: 'Marie',
      lastName: 'Dupont',
      email: 'marie.dupont@email.com',
      phone: '06 98 76 54 32',
      entryDate: '2025-03-01',
      monthlyRentHC: 850,
      monthlyCharges: 50,
      deposit: 850,
      status: 'actif',
    },
    {
      id: 'ten-3',
      propertyId: 'prop-2',
      firstName: 'Karim',
      lastName: 'Ouali',
      email: 'karim.ouali@email.com',
      phone: '07 11 22 33 44',
      entryDate: '2025-03-15',
      monthlyRentHC: 950,
      monthlyCharges: 80,
      deposit: 950,
      status: 'actif',
    },
  ];

  const expenses: Expense[] = [
    {
      id: 'exp-1',
      propertyId: 'prop-1',
      category: 'travaux',
      amountTTC: 340,
      date: '2025-02-14',
      description: 'Remplacement robinetterie cuisine',
      invoiceRef: 'FAC-2025-001',
      taxDeductible: true,
    },
    {
      id: 'exp-2',
      propertyId: 'prop-1',
      category: 'copropriete',
      amountTTC: 240,
      date: '2025-04-01',
      description: 'Charges copropriété Q1 2025',
      invoiceRef: 'COPRO-Q1-2025',
      taxDeductible: true,
    },
    {
      id: 'exp-3',
      propertyId: 'prop-2',
      category: 'taxe-fonciere',
      amountTTC: 1200,
      date: '2025-10-15',
      description: 'Taxe foncière 2025',
      invoiceRef: 'TF-2025-LYON',
      taxDeductible: true,
    },
  ];

  localStorage.setItem(KEYS.properties, JSON.stringify(properties));
  localStorage.setItem(KEYS.tenants, JSON.stringify(tenants));
  localStorage.setItem(KEYS.expenses, JSON.stringify(expenses));
  localStorage.setItem(KEYS.settings, JSON.stringify({ ownerName: 'Jean Dupont', activeFiscalYear: 2025 }));
  localStorage.setItem(KEYS.initialized, 'true');
}

export function generateId(): string {
  return crypto.randomUUID();
}
