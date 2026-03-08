import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useProperties, useTenants, useReceipts, useSettings } from '@/lib/store';
import { generateReceiptsForYear, formatCurrency, formatDateFR } from '@/lib/receipt-utils';
import { generateReceiptPDF } from '@/lib/pdf-utils';
import { MONTHS_FR, type Receipt } from '@/types/lmnp';
import { FileDown, RefreshCw, Eye, Pencil } from 'lucide-react';

export default function Receipts() {
  const [properties] = useProperties();
  const [tenants] = useTenants();
  const [receipts, setReceipts] = useReceipts();
  const [settings] = useSettings();
  const year = settings.activeFiscalYear;
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Receipt>>({});

  const regenerate = () => {
    const generated = generateReceiptsForYear(year, tenants, receipts);
    setReceipts(generated);
  };

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

  const openView = (r: Receipt) => {
    setSelectedReceipt(r);
    setEditMode(false);
    setEditForm({});
  };

  const openEdit = (r: Receipt) => {
    setSelectedReceipt(r);
    setEditMode(true);
    setEditForm({ ...r });
  };

  const saveEdit = () => {
    if (selectedReceipt && editForm) {
      updateReceipt(selectedReceipt.id, editForm);
      setSelectedReceipt({ ...selectedReceipt, ...editForm } as Receipt);
      setEditMode(false);
    }
  };

  const statusColor = (s: string) => {
    if (s === 'paye') return 'bg-success text-success-foreground';
    if (s === 'partiel') return 'bg-yellow-500 text-white';
    return 'bg-destructive text-destructive-foreground';
  };

  const statusLabel = (s: string) => s === 'paye' ? 'Payé' : s === 'partiel' ? 'Partiel' : 'Impayé';

  const propName = (id: string) => properties.find(p => p.id === id)?.name || '—';
  const propAddress = (id: string) => properties.find(p => p.id === id)?.address || '';

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
                    <TableHead className="w-32">Actions</TableHead>
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
                        <Badge className={statusColor(r.status)}>{statusLabel(r.status)}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(r.amountReceived)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openView(r)} title="Voir"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(r)} title="Modifier"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => downloadPDF(r.id)} title="PDF"><FileDown className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      {/* Detail / Edit Dialog */}
      <Dialog open={!!selectedReceipt} onOpenChange={open => { if (!open) setSelectedReceipt(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editMode ? 'Modifier la quittance' : 'Détail de la quittance'}
            </DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                <div className="font-semibold text-base">QUITTANCE DE LOYER — {MONTHS_FR[(editMode ? (editForm.month || selectedReceipt.month) : selectedReceipt.month) - 1]} {selectedReceipt.year}</div>
                <div><span className="text-muted-foreground">Bien :</span> {propName(selectedReceipt.propertyId)} — {propAddress(selectedReceipt.propertyId)}</div>
                <div><span className="text-muted-foreground">Locataire :</span> {tenantName(selectedReceipt.tenantId)}</div>
                <div><span className="text-muted-foreground">Période :</span> {formatDateFR(selectedReceipt.periodStart)} au {formatDateFR(selectedReceipt.periodEnd)}</div>
              </div>

              {editMode ? (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Loyer HC (€)</Label><Input type="number" value={editForm.rentHC ?? ''} onChange={e => setEditForm(f => ({ ...f, rentHC: +e.target.value, total: (+e.target.value) + (f.charges || 0) }))} /></div>
                    <div><Label>Charges (€)</Label><Input type="number" value={editForm.charges ?? ''} onChange={e => setEditForm(f => ({ ...f, charges: +e.target.value, total: (f.rentHC || 0) + (+e.target.value) }))} /></div>
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <Select value={editForm.status || 'impaye'} onValueChange={v => setEditForm(f => ({ ...f, status: v as Receipt['status'] }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paye">Payé</SelectItem>
                        <SelectItem value="impaye">Impayé</SelectItem>
                        <SelectItem value="partiel">Partiel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Montant encaissé (€)</Label><Input type="number" value={editForm.amountReceived ?? ''} onChange={e => setEditForm(f => ({ ...f, amountReceived: +e.target.value }))} /></div>
                    <div><Label>Date de paiement</Label><Input type="date" value={editForm.paidDate || ''} onChange={e => setEditForm(f => ({ ...f, paidDate: e.target.value }))} /></div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveEdit} className="flex-1">Enregistrer</Button>
                    <Button variant="outline" onClick={() => setEditMode(false)}>Annuler</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Loyer HC :</span> <span className="font-medium">{formatCurrency(selectedReceipt.rentHC)}</span></div>
                    <div><span className="text-muted-foreground">Charges :</span> <span className="font-medium">{formatCurrency(selectedReceipt.charges)}</span></div>
                    <div><span className="text-muted-foreground">Total :</span> <span className="font-bold">{formatCurrency(selectedReceipt.total)}</span></div>
                    <div><span className="text-muted-foreground">Encaissé :</span> <span className="font-medium">{formatCurrency(selectedReceipt.amountReceived)}</span></div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Statut :</span>
                    <Badge className={statusColor(selectedReceipt.status)}>{statusLabel(selectedReceipt.status)}</Badge>
                  </div>
                  {selectedReceipt.paidDate && (
                    <div className="text-sm"><span className="text-muted-foreground">Payé le :</span> {formatDateFR(selectedReceipt.paidDate)}</div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => openEdit(selectedReceipt)}><Pencil className="h-4 w-4 mr-2" />Modifier</Button>
                    <Button onClick={() => downloadPDF(selectedReceipt.id)}><FileDown className="h-4 w-4 mr-2" />Télécharger PDF</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
