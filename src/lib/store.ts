import { useState, useCallback } from 'react';
import type { Property, Tenant, Expense, Receipt, Settings, Reservation } from '@/types/lmnp';

const KEYS = {
  properties: 'lmnp_properties',
  tenants: 'lmnp_tenants',
  receipts: 'lmnp_receipts',
  expenses: 'lmnp_expenses',
  settings: 'lmnp_settings',
  reservations: 'lmnp_reservations',
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
export const useReservations = () => useLocalStorage<Reservation[]>(KEYS.reservations, []);
export const useSettings = () => useLocalStorage<Settings>(KEYS.settings, { ownerName: 'Mon Nom', activeFiscalYear: 2025 });

export function initDemoData() {
  if (localStorage.getItem(KEYS.initialized)) return;

  localStorage.setItem(KEYS.properties, JSON.stringify([]));
  localStorage.setItem(KEYS.tenants, JSON.stringify([]));
  localStorage.setItem(KEYS.expenses, JSON.stringify([]));
  localStorage.setItem(KEYS.reservations, JSON.stringify([]));
  localStorage.setItem(KEYS.receipts, JSON.stringify([]));
  localStorage.setItem(KEYS.settings, JSON.stringify({ ownerName: '', activeFiscalYear: 2025 }));
  localStorage.setItem(KEYS.initialized, 'true');
}

export function resetAllData() {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  window.location.reload();
}

export function generateId(): string {
  return crypto.randomUUID();
}
