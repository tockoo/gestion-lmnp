import jsPDF from 'jspdf';
import type { Receipt, Tenant, Property, Expense, Settings } from '@/types/lmnp';
import { MONTHS_FR, EXPENSE_CATEGORIES, type ExpenseCategory } from '@/types/lmnp';
import { formatDateFR, formatCurrency } from './receipt-utils';

export function generateReceiptPDF(receipt: Receipt, tenant: Tenant, property: Property) {
  const doc = new jsPDF();
  const m = MONTHS_FR[receipt.month - 1];
  let y = 30;

  doc.setFontSize(18);
  doc.text(`QUITTANCE DE LOYER — ${m} ${receipt.year}`, 20, y);
  y += 15;

  doc.setFontSize(11);
  const lines = [
    `Bien : ${property.name} — ${property.address}`,
    `Locataire : ${tenant.firstName} ${tenant.lastName}`,
    `Période : du ${formatDateFR(receipt.periodStart)} au ${formatDateFR(receipt.periodEnd)}`,
    '',
    `Loyer HC : ${formatCurrency(receipt.rentHC)}`,
    `Charges : ${formatCurrency(receipt.charges)}`,
    `TOTAL : ${formatCurrency(receipt.total)}`,
    '',
    receipt.paidDate ? `Payé le : ${formatDateFR(receipt.paidDate)}` : 'Statut : Impayé',
  ];

  for (const line of lines) {
    doc.text(line, 20, y);
    y += 8;
  }

  doc.save(`quittance_${property.name.replace(/\s+/g, '_')}_${m}_${receipt.year}.pdf`);
}

export function generateTaxSummaryPDF(
  year: number,
  settings: Settings,
  properties: Property[],
  tenants: Tenant[],
  receipts: Receipt[],
  expenses: Expense[],
) {
  const doc = new jsPDF();
  let y = 25;

  doc.setFontSize(18);
  doc.text(`RÉCAPITULATIF LMNP — Année ${year}`, 20, y);
  y += 12;

  doc.setFontSize(11);
  doc.text(`Propriétaire : ${settings.ownerName}`, 20, y); y += 7;
  doc.text('Régime : Réel simplifié', 20, y); y += 14;

  for (const prop of properties) {
    if (y > 250) { doc.addPage(); y = 25; }

    doc.setFontSize(14);
    doc.text(`=== BIEN : ${prop.name} ===`, 20, y); y += 10;

    const propReceipts = receipts.filter(r => r.propertyId === prop.id && r.year === year);
    const totalRentHC = propReceipts.reduce((s, r) => s + (r.status !== 'impaye' ? r.rentHC : 0), 0);
    const totalCharges = propReceipts.reduce((s, r) => s + (r.status !== 'impaye' ? r.charges : 0), 0);
    const totalRecettes = totalRentHC + totalCharges;

    doc.setFontSize(11);
    doc.text('RECETTES', 20, y); y += 7;
    doc.text(`  Loyers HC encaissés : ${formatCurrency(totalRentHC)}`, 20, y); y += 7;
    doc.text(`  Charges locataires encaissées : ${formatCurrency(totalCharges)}`, 20, y); y += 7;
    doc.text(`  Total recettes : ${formatCurrency(totalRecettes)}`, 20, y); y += 10;

    const propExpenses = expenses.filter(e => (e.propertyId === prop.id || e.propertyId === 'all') && e.taxDeductible && e.date.startsWith(String(year)));
    const byCategory: Partial<Record<ExpenseCategory, number>> = {};
    for (const e of propExpenses) {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amountTTC;
    }
    const totalDepenses = propExpenses.reduce((s, e) => s + e.amountTTC, 0);

    doc.text('DÉPENSES DÉDUCTIBLES', 20, y); y += 7;
    for (const [cat, label] of Object.entries(EXPENSE_CATEGORIES)) {
      const amount = byCategory[cat as ExpenseCategory] || 0;
      if (amount > 0) {
        doc.text(`  ${label} : ${formatCurrency(amount)}`, 20, y); y += 7;
      }
    }
    doc.text(`  Total dépenses : ${formatCurrency(totalDepenses)}`, 20, y); y += 7;
    doc.text(`RÉSULTAT NET : ${formatCurrency(totalRecettes - totalDepenses)}`, 20, y); y += 14;
  }

  doc.save(`recapitulatif_lmnp_${year}.pdf`);
}
