import type { Tenant, Receipt } from '@/types/lmnp';
import { generateId } from './store';

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function parseDate(d: string): Date {
  return new Date(d + 'T00:00:00');
}

export function generateReceiptsForYear(year: number, tenants: Tenant[], existingReceipts: Receipt[]): Receipt[] {
  const receipts: Receipt[] = [];

  for (const tenant of tenants) {
    const entry = parseDate(tenant.entryDate);
    const exit = tenant.exitDate ? parseDate(tenant.exitDate) : null;

    for (let month = 1; month <= 12; month++) {
      const daysInMonth = getDaysInMonth(year, month);
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month - 1, daysInMonth);

      if (entry > monthEnd) continue;
      if (exit && exit < monthStart) continue;

      const periodStartDate = entry > monthStart ? entry : monthStart;
      const periodEndDate = exit && exit < monthEnd ? exit : monthEnd;

      const startDay = periodStartDate.getDate();
      const endDay = periodEndDate.getDate();
      const activeDays = endDay - startDay + 1;
      const prorata = activeDays / daysInMonth;

      const rentHC = Math.round(tenant.monthlyRentHC * prorata * 100) / 100;
      const charges = Math.round(tenant.monthlyCharges * prorata * 100) / 100;
      const total = Math.round((rentHC + charges) * 100) / 100;

      const existing = existingReceipts.find(
        r => r.tenantId === tenant.id && r.month === month && r.year === year
      );

      if (existing) {
        receipts.push({ ...existing, rentHC, charges, total, periodStart: formatDate(periodStartDate), periodEnd: formatDate(periodEndDate) });
      } else {
        receipts.push({
          id: generateId(),
          tenantId: tenant.id,
          propertyId: tenant.propertyId,
          month,
          year,
          periodStart: formatDate(periodStartDate),
          periodEnd: formatDate(periodEndDate),
          rentHC,
          charges,
          total,
          status: 'impaye',
          amountReceived: 0,
        });
      }
    }
  }

  return receipts;
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateFR(dateStr: string): string {
  const d = parseDate(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}
