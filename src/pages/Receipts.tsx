import { useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useProperties, useTenants, useReceipts, useSettings } from '@/lib/store';
import { generateReceiptsForYear, formatCurrency, formatDateFR } from '@/lib/receipt-utils';
import { generateReceiptPDF } from '@/lib/pdf-utils';
import { MONTHS_FR } from '@/types/lmnp';
import { FileDown, RefreshCw } from 'lucide-react';

export default function Receipts() {
  const [properties] = useProperties();
  const [tenants] = useTenants();
  const [receipts, setReceipts] = useReceipts();
  const [settings] = useSettings();
  const year = settings.activeFiscalYear;

  const regenerate = () => {
    const generated = generateReceiptsForYear(year, tenants, receipts);
    setReceipts(generated);
  };

  // Auto-generate on first load if empty
  useEffect(() => {
    if (receipts.length === 0 && tenants.length > 0) regenerate();
  }, []); // eslint-disable-line

  const receiptsByProperty = useMemo(() => {
    const yearReceipts = receipts.filter(r => r.year === year);
    const grouped: Record<string, typeof yearReceipts> = {};
    for (const r of yearReceipts) {
      if (!grouped[r.propertyId]) grouped[r.propertyId] = [];
      grouped[r.propertyId].push(r);
    }
    return grouped;
  }, [receipts, year]);

  const updateReceipt = (id: string, updates: Record<string, unknown>) => {
    setReceipts(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const tenantName = (id: string) => {
    const t = tenants.find(t => t.id === id);
    return t ? `${t.firstName} ${t.lastName}` : '—';
  };

  const downloadPDF = (receiptId: string) => {
    const r = receipts.find(r => r.id === receiptId);
    if (!r) return;
    const t = tenants.find(t => t.id === r.tenantId);
    const p = properties.find(p => p.id === r.propertyId);
    if (t && p) generateReceiptPDF(r, t, p);
  };

  const statusColor = (s: string) => {
    if (s === 'paye') return 'bg-success text-success-foreground';
    if (s === 'partiel') return 'bg-yellow-500 text-white';
    return 'bg-destructive text-destructive-foreground';
  };

  const statusLabel = (s: string) => s === 'paye' ? 'Payé' : s === 'partiel' ? 'Partiel' : 'Impayé';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quittances — {year}</h1>
        <Button variant="outline" onClick={regenerate}><RefreshCw className="h-4 w-4 mr-2" />Regénérer</Button>
      </div>

      {properties.map(prop => {
        const propReceipts = receiptsByProperty[prop.id] || [];
        if (propReceipts.length === 0) return null;

        return (
          <Card key={prop.id} className="shadow-md">
            <CardHeader><CardTitle>{prop.name}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mois</TableHead>
                    <TableHead>Locataire</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Loyer HC</TableHead>
                    <TableHead>Charges</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Encaissé</TableHead>
                    <TableHead>Date paiement</TableHead>
                    <TableHead>PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propReceipts.sort((a, b) => a.month - b.month).map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{MONTHS_FR[r.month - 1]}</TableCell>
                      <TableCell>{tenantName(r.tenantId)}</TableCell>
                      <TableCell className="text-xs">{formatDateFR(r.periodStart)} — {formatDateFR(r.periodEnd)}</TableCell>
                      <TableCell>{formatCurrency(r.rentHC)}</TableCell>
                      <TableCell>{formatCurrency(r.charges)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(r.total)}</TableCell>
                      <TableCell>
                        <Select value={r.status} onValueChange={v => updateReceipt(r.id, { status: v })}>
                          <SelectTrigger className="w-28 h-8">
                            <Badge className={statusColor(r.status)}>{statusLabel(r.status)}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paye">Payé</SelectItem>
                            <SelectItem value="impaye">Impayé</SelectItem>
                            <SelectItem value="partiel">Partiel</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input type="number" className="w-24 h-8" value={r.amountReceived || ''} onChange={e => updateReceipt(r.id, { amountReceived: +e.target.value })} />
                      </TableCell>
                      <TableCell>
                        <Input type="date" className="w-36 h-8" value={r.paidDate || ''} onChange={e => updateReceipt(r.id, { paidDate: e.target.value })} />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => downloadPDF(r.id)}><FileDown className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
