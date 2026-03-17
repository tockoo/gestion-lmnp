import jsPDF from 'jspdf';
import type { Receipt, Tenant, Property, Expense, Settings } from '@/types/lmnp';
import { MONTHS_FR, EXPENSE_CATEGORIES, type ExpenseCategory } from '@/types/lmnp';
import { formatDateFR, formatCurrency } from './receipt-utils';

export function generateReceiptPDF(receipt: Receipt, tenant: Tenant, property: Property, settings?: Settings) {
  const doc = new jsPDF();
  const m = MONTHS_FR[receipt.month - 1].toUpperCase();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  // Calculer le numéro de quittance (mois/année)
  const receiptNumber = `${receipt.month}/${receipt.year}`;
  
  // En-tête bleu avec titre
  doc.setFillColor(173, 216, 230);
  doc.rect(margin, y, pageWidth - 2 * margin, 20, 'F');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`QUITTANCE DE LOYER n°${receiptNumber}`, pageWidth / 2, y + 8, { align: 'center' });
  doc.text(`${m} ${receipt.year}`, pageWidth / 2, y + 15, { align: 'center' });
  y += 30;

  // Section Adresse de la location
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.rect(margin, y, pageWidth - 2 * margin, 20, 'S');
  doc.text('Adresse de la location :', margin + 2, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(property.address, margin + 2, y + 12);
  if (property.postalCode && property.city) {
    doc.text(`${property.postalCode} ${property.city}`, margin + 2, y + 18);
  }
  y += 30;

  // Texte de déclaration
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const ownerName = settings?.ownerName || 'le propriétaire';
  const declarationText = `je, soussigné ${ownerName}, propriétaire du logement désigné ci-dessus, déclare avoir reçu de Monsieur ${tenant.firstName} ${tenant.lastName}, le locataire, la somme de ${formatCurrency(receipt.total)} au titre du paiement du loyer et des charges pour la période de location du ${formatDateFR(receipt.periodStart)} au ${formatDateFR(receipt.periodEnd)}. je lui en donne quittance sous réserve de tous mes droits.`;
  
  const splitText = doc.splitTextToSize(declarationText, pageWidth - 2 * margin - 4);
  splitText.forEach((line: string) => {
    doc.text(line, margin + 2, y);
    y += 5;
  });
  y += 5;

  // Section Détail du règlement
  const detailBoxHeight = 50;
  doc.rect(margin, y, pageWidth - 2 * margin, detailBoxHeight, 'S');
  doc.setFont('helvetica', 'bold');
  doc.text('Détail du règlement', margin + 2, y + 6);
  
  doc.setFont('helvetica', 'normal');
  const rentAndCharges = receipt.rentHC + receipt.charges;
  doc.text(`Loyer et charges : ${formatCurrency(rentAndCharges)} euros`, margin + 2, y + 14);
  doc.text(`Total du loyer : ${formatCurrency(receipt.rentHC)} euros`, margin + 2, y + 21);
  doc.text(`Total du terme : ${formatCurrency(receipt.total)}`, margin + 2, y + 28);
  
  if (receipt.paidDate) {
    doc.text(`Paiement du locataire : ${formatCurrency(receipt.total)} payé par virement le ${formatDateFR(receipt.paidDate)}`, margin + 2, y + 35);
  }
  
  const balance = receipt.total - receipt.amountReceived;
  doc.setFont('helvetica', 'bold');
  doc.text(`Solde à régler : ${formatCurrency(balance)} euros`, margin + 2, y + 42);
  y += detailBoxHeight + 15;

  // Date et signature
  const today = new Date();
  const formattedToday = today.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Fait à ${property.city || 'Serris'} le ${formattedToday}`, margin + 2, y);
  y += 6;
  doc.text('Signature du bailleur :', margin + 2, y);
  y += 25;

  // Note légale en italique
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  const legalText = "Cette quittance annule tous les reçus qui auraient pu être établis précédemment en cas de paiement partiel du montant du présent terme. Elle est à conserver pendant cinq ans par le locataire (article 2224 du Code civil)";
  const splitLegal = doc.splitTextToSize(legalText, pageWidth - 2 * margin - 4);
  splitLegal.forEach((line: string) => {
    doc.text(line, margin + 2, y);
    y += 4;
  });

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
