import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProperties } from '@/lib/store';
import { formatCurrency } from '@/lib/receipt-utils';
import { PROPERTY_TYPES, RENTAL_TYPES, type Property, type Depreciation } from '@/types/lmnp';
import { Plus, Pencil, Trash2, Home, Plane } from 'lucide-react';
import { toast } from 'sonner';

const emptyDepreciation: Depreciation = {
  buildingValue: 0, buildingYears: 25, furnitureValue: 0, furnitureYears: 7,
};

const emptyProperty: Omit<Property, 'id'> = {
  name: '', address: '', type: 'appartement', surface: 0,
  acquisitionValue: 0, acquisitionDate: '', taxRegime: 'reel-simplifie',
  monthlyCoproCharges: 0, annualPropertyTax: 0, rentalType: 'longue-duree',
  nightlyRate: undefined, depreciation: { ...emptyDepreciation },
};

export default function Properties() {
  const { data: properties, add, update, remove } = useProperties();
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState<Omit<Property, 'id'>>(emptyProperty);
  const [open, setOpen] = useState(false);

  const openNew = () => { setEditing(null); setForm({ ...emptyProperty, depreciation: { ...emptyDepreciation } }); setOpen(true); };
  const openEdit = (p: Property) => { setEditing(p); setForm({ ...p, depreciation: p.depreciation ? { ...p.depreciation } : { ...emptyDepreciation } }); setOpen(true); };

  const save = async () => {
    try {
      if (editing) {
        await update({ ...form, id: editing.id });
      } else {
        await add(form);
      }
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRemove = async (id: string) => {
    try { await remove(id); } catch (err: any) { toast.error(err.message); }
  };

  const updateForm = (key: string, value: string | number | undefined) => setForm(prev => ({ ...prev, [key]: value }));
  const updateDepreciation = (key: keyof Depreciation, value: number) => {
    setForm(prev => ({ ...prev, depreciation: { ...(prev.depreciation || emptyDepreciation), [key]: value } }));
  };

  const calcAnnualDepreciation = (p: Property) => {
    if (!p.depreciation) return 0;
    const d = p.depreciation;
    const buildingAnnual = d.buildingYears > 0 ? d.buildingValue / d.buildingYears : 0;
    const furnitureAnnual = d.furnitureYears > 0 ? d.furnitureValue / d.furnitureYears : 0;
    return Math.round((buildingAnnual + furnitureAnnual) * 100) / 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes biens</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Ajouter un bien</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? 'Modifier le bien' : 'Nouveau bien'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div><Label>Nom</Label><Input value={form.name} onChange={e => updateForm('name', e.target.value)} /></div>
              <div><Label>Adresse</Label><Input value={form.address} onChange={e => updateForm('address', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={v => updateForm('type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(PROPERTY_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Surface (m²)</Label><Input type="number" value={form.surface || ''} onChange={e => updateForm('surface', +e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Valeur d'acquisition (€)</Label><Input type="number" value={form.acquisitionValue || ''} onChange={e => updateForm('acquisitionValue', +e.target.value)} /></div>
                <div><Label>Date d'acquisition</Label><Input type="date" value={form.acquisitionDate} onChange={e => updateForm('acquisitionDate', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Régime fiscal</Label>
                  <Select value={form.taxRegime} onValueChange={v => updateForm('taxRegime', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="micro-bic">Micro-BIC</SelectItem>
                      <SelectItem value="reel-simplifie">Réel simplifié</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type de location</Label>
                  <Select value={form.rentalType} onValueChange={v => updateForm('rentalType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(RENTAL_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              {form.rentalType === 'courte-duree' && (
                <div><Label>Tarif par nuit (€)</Label><Input type="number" value={form.nightlyRate || ''} onChange={e => updateForm('nightlyRate', +e.target.value)} /></div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Charges copro/mois (€)</Label><Input type="number" value={form.monthlyCoproCharges || ''} onChange={e => updateForm('monthlyCoproCharges', +e.target.value)} /></div>
                <div><Label>Taxe foncière/an (€)</Label><Input type="number" value={form.annualPropertyTax || ''} onChange={e => updateForm('annualPropertyTax', +e.target.value)} /></div>
              </div>

              <Separator />
              <h3 className="font-semibold text-sm">Amortissements</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Valeur bâtiment (€)</Label><Input type="number" value={form.depreciation?.buildingValue || ''} onChange={e => updateDepreciation('buildingValue', +e.target.value)} /></div>
                <div><Label>Durée (années)</Label><Input type="number" value={form.depreciation?.buildingYears || ''} onChange={e => updateDepreciation('buildingYears', +e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Valeur mobilier (€)</Label><Input type="number" value={form.depreciation?.furnitureValue || ''} onChange={e => updateDepreciation('furnitureValue', +e.target.value)} /></div>
                <div><Label>Durée (années)</Label><Input type="number" value={form.depreciation?.furnitureYears || ''} onChange={e => updateDepreciation('furnitureYears', +e.target.value)} /></div>
              </div>

              <Button onClick={save} className="w-full">{editing ? 'Enregistrer' : 'Ajouter'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Surface</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Amort./an</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{PROPERTY_TYPES[p.type]}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {p.rentalType === 'courte-duree' ? <Plane className="h-3 w-3" /> : <Home className="h-3 w-3" />}
                      {RENTAL_TYPES[p.rentalType || 'longue-duree']}
                    </Badge>
                  </TableCell>
                  <TableCell>{p.surface} m²</TableCell>
                  <TableCell>{formatCurrency(p.acquisitionValue)}</TableCell>
                  <TableCell>{formatCurrency(calcAnnualDepreciation(p))}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleRemove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {properties.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Aucun bien enregistré</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
