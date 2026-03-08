import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProperties, useTenants, useReceipts, useExpenses, useReservations, useSettings } from '@/lib/store';
import { formatCurrency } from '@/lib/receipt-utils';
import { generateTaxSummaryPDF } from '@/lib/pdf-utils';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/types/lmnp';
import { FileDown } from 'lucide-react';

export default function TaxSummary() {
  const { data: properties } = useProperties();
  const { data: tenants } = useTenants();
  const { data: receipts } = useReceipts();
  const { data: expenses } = useExpenses();
  const { data: reservations } = useReservations();
  const { data: settings } = useSettings();
  const year = settings.activeFiscalYear;

  const summaryData = useMemo(() => {
    return properties.map(prop => {
      const propReceipts = receipts.filter(r => r.propertyId === prop.id && r.year === year && r.status !== 'impaye');
      const totalRentHC = propReceipts.reduce((s, r) => s + r.rentHC, 0);
      const totalCharges = propReceipts.reduce((s, r) => s + r.charges, 0);

      const propReservations = reservations.filter(r =>
        r.propertyId === prop.id && r.status !== 'annulee' &&
        r.checkIn.startsWith(String(year))
      );
      const totalReservations = propReservations.reduce((s, r) => s + r.totalAmount, 0);

      const totalRecettes = totalRentHC + totalCharges + totalReservations;

      const propExpenses = expenses.filter(e => (e.propertyId === prop.id || e.propertyId === 'all') && e.taxDeductible && e.date.startsWith(String(year)));
      const byCategory: Partial<Record<ExpenseCategory, number>> = {};
      for (const e of propExpenses) {
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amountTTC;
      }
      const totalDepenses = propExpenses.reduce((s, e) => s + e.amountTTC, 0);

      let depreciationBuilding = 0;
      let depreciationFurniture = 0;
      if (prop.depreciation && prop.taxRegime === 'reel-simplifie') {
        const d = prop.depreciation;
        if (d.buildingYears > 0) depreciationBuilding = Math.round(d.buildingValue / d.buildingYears * 100) / 100;
        if (d.furnitureYears > 0) depreciationFurniture = Math.round(d.furnitureValue / d.furnitureYears * 100) / 100;
      }
      const totalDepreciation = depreciationBuilding + depreciationFurniture;

      return {
        property: prop, totalRentHC, totalCharges, totalReservations, totalRecettes,
        byCategory, totalDepenses, depreciationBuilding, depreciationFurniture, totalDepreciation,
        resultatNet: totalRecettes - totalDepenses - totalDepreciation,
      };
    });
  }, [properties, receipts, expenses, reservations, year]);

  const globalTotals = useMemo(() => ({
    recettes: summaryData.reduce((s, d) => s + d.totalRecettes, 0),
    depenses: summaryData.reduce((s, d) => s + d.totalDepenses, 0),
    depreciation: summaryData.reduce((s, d) => s + d.totalDepreciation, 0),
    net: summaryData.reduce((s, d) => s + d.resultatNet, 0),
  }), [summaryData]);

  const exportPDF = () => {
    generateTaxSummaryPDF(year, settings, properties, tenants, receipts, expenses);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Récapitulatif fiscal — {year}</h1>
        <Button onClick={exportPDF}><FileDown className="h-4 w-4 mr-2" />Export PDF Récapitulatif {year}</Button>
      </div>

      <Card className="shadow-md">
        <CardHeader><CardTitle>Synthèse globale</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Poste</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow><TableCell>Recettes brutes</TableCell><TableCell className="text-right text-success font-medium">{formatCurrency(globalTotals.recettes)}</TableCell></TableRow>
              <TableRow><TableCell>Charges déductibles</TableCell><TableCell className="text-right text-destructive font-medium">{formatCurrency(globalTotals.depenses)}</TableCell></TableRow>
              <TableRow><TableCell>Amortissements</TableCell><TableCell className="text-right text-destructive font-medium">{formatCurrency(globalTotals.depreciation)}</TableCell></TableRow>
              <TableRow className="font-bold border-t-2"><TableCell>Résultat net imposable</TableCell><TableCell className={`text-right ${globalTotals.net >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(globalTotals.net)}</TableCell></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {summaryData.map(({ property: prop, totalRentHC, totalCharges, totalReservations, totalRecettes, byCategory, totalDepenses, depreciationBuilding, depreciationFurniture, totalDepreciation, resultatNet }) => (
        <Card key={prop.id} className="shadow-md">
          <CardHeader><CardTitle>{prop.name}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Recettes</h3>
              <Table>
                <TableBody>
                  <TableRow><TableCell>Loyers HC encaissés</TableCell><TableCell className="text-right">{formatCurrency(totalRentHC)}</TableCell></TableRow>
                  <TableRow><TableCell>Charges locataires encaissées</TableCell><TableCell className="text-right">{formatCurrency(totalCharges)}</TableCell></TableRow>
                  {totalReservations > 0 && (
                    <TableRow><TableCell>Recettes location courte durée</TableCell><TableCell className="text-right">{formatCurrency(totalReservations)}</TableCell></TableRow>
                  )}
                  <TableRow className="font-medium border-t"><TableCell>Total recettes</TableCell><TableCell className="text-right text-success">{formatCurrency(totalRecettes)}</TableCell></TableRow>
                </TableBody>
              </Table>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Dépenses déductibles</h3>
              <Table>
                <TableBody>
                  {Object.entries(EXPENSE_CATEGORIES).map(([cat, label]) => {
                    const amount = byCategory[cat as ExpenseCategory] || 0;
                    if (amount === 0) return null;
                    return <TableRow key={cat}><TableCell>{label}</TableCell><TableCell className="text-right">{formatCurrency(amount)}</TableCell></TableRow>;
                  })}
                  <TableRow className="font-medium border-t"><TableCell>Total dépenses</TableCell><TableCell className="text-right text-destructive">{formatCurrency(totalDepenses)}</TableCell></TableRow>
                </TableBody>
              </Table>
            </div>
            {totalDepreciation > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Amortissements</h3>
                <Table>
                  <TableBody>
                    {depreciationBuilding > 0 && <TableRow><TableCell>Amortissement immobilier ({prop.depreciation?.buildingYears} ans)</TableCell><TableCell className="text-right">{formatCurrency(depreciationBuilding)}</TableCell></TableRow>}
                    {depreciationFurniture > 0 && <TableRow><TableCell>Amortissement mobilier ({prop.depreciation?.furnitureYears} ans)</TableCell><TableCell className="text-right">{formatCurrency(depreciationFurniture)}</TableCell></TableRow>}
                    <TableRow className="font-medium border-t"><TableCell>Total amortissements</TableCell><TableCell className="text-right text-destructive">{formatCurrency(totalDepreciation)}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Résultat net</span>
                <span className={resultatNet >= 0 ? 'text-success' : 'text-destructive'}>{formatCurrency(resultatNet)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
