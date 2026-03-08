import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProperties, generateId } from '@/lib/store';
import { formatCurrency } from '@/lib/receipt-utils';
import { PROPERTY_TYPES, type Property } from '@/types/lmnp';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const emptyProperty: Omit<Property, 'id'> = {
  name: '', address: '', type: 'appartement', surface: 0,
  acquisitionValue: 0, acquisitionDate: '', taxRegime: 'reel-simplifie',
  monthlyCoproCharges: 0, annualPropertyTax: 0,
};

export default function Properties() {
  const [properties, setProperties] = useProperties();
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState<Omit<Property, 'id'>>(emptyProperty);
  const [open, setOpen] = useState(false);

  const openNew = () => { setEditing(null); setForm(emptyProperty); setOpen(true); };
  const openEdit = (p: Property) => { setEditing(p); setForm({ ...p }); setOpen(true); };

  const save = () => {
    if (editing) {
      setProperties(prev => prev.map(p => p.id === editing.id ? { ...form, id: editing.id } : p));
    } else {
      setProperties(prev => [...prev, { ...form, id: generateId() }]);
    }
    setOpen(false);
  };

  const remove = (id: string) => setProperties(prev => prev.filter(p => p.id !== id));

  const updateForm = (key: string, value: string | number) => setForm(prev => ({ ...prev, [key]: value }));

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
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Charges copro/mois (€)</Label><Input type="number" value={form.monthlyCoproCharges || ''} onChange={e => updateForm('monthlyCoproCharges', +e.target.value)} /></div>
                <div><Label>Taxe foncière/an (€)</Label><Input type="number" value={form.annualPropertyTax || ''} onChange={e => updateForm('annualPropertyTax', +e.target.value)} /></div>
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
                <TableHead>Surface</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Copro/mois</TableHead>
                <TableHead>Taxe foncière</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{PROPERTY_TYPES[p.type]}</TableCell>
                  <TableCell>{p.surface} m²</TableCell>
                  <TableCell>{formatCurrency(p.acquisitionValue)}</TableCell>
                  <TableCell>{formatCurrency(p.monthlyCoproCharges)}</TableCell>
                  <TableCell>{formatCurrency(p.annualPropertyTax)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
