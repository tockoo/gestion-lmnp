import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useProperties, useTenants } from '@/lib/store';
import { formatCurrency, formatDateFR } from '@/lib/receipt-utils';
import type { Tenant } from '@/types/lmnp';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const emptyTenant: Omit<Tenant, 'id'> = {
  propertyId: '', firstName: '', lastName: '', email: '', phone: '',
  entryDate: '', exitDate: undefined, monthlyRentHC: 0, monthlyCharges: 0,
  deposit: 0, status: 'actif',
};

export default function Tenants() {
  const { data: properties } = useProperties();
  const { data: tenants, add, update, remove } = useTenants();
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [form, setForm] = useState<Omit<Tenant, 'id'>>(emptyTenant);
  const [open, setOpen] = useState(false);

  const openNew = () => { setEditing(null); setForm({ ...emptyTenant, propertyId: properties[0]?.id || '' }); setOpen(true); };
  const openEdit = (t: Tenant) => { setEditing(t); setForm({ ...t }); setOpen(true); };

  const save = async () => {
    try {
      if (editing) {
        await update({ ...form, id: editing.id });
      } else {
        await add(form);
      }
      setOpen(false);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleRemove = async (id: string) => {
    try { await remove(id); } catch (err: any) { toast.error(err.message); }
  };

  const updateForm = (key: string, value: string | number | undefined) => setForm(prev => ({ ...prev, [key]: value }));
  const propName = (id: string) => properties.find(p => p.id === id)?.name || '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Locataires</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Ajouter un locataire</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? 'Modifier le locataire' : 'Nouveau locataire'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Bien</Label>
                <Select value={form.propertyId} onValueChange={v => updateForm('propertyId', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Prénom</Label><Input value={form.firstName} onChange={e => updateForm('firstName', e.target.value)} /></div>
                <div><Label>Nom</Label><Input value={form.lastName} onChange={e => updateForm('lastName', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} /></div>
                <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => updateForm('phone', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Date d'entrée</Label><Input type="date" value={form.entryDate} onChange={e => updateForm('entryDate', e.target.value)} /></div>
                <div><Label>Date de sortie</Label><Input type="date" value={form.exitDate || ''} onChange={e => updateForm('exitDate', e.target.value || undefined)} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Loyer HC (€)</Label><Input type="number" value={form.monthlyRentHC || ''} onChange={e => updateForm('monthlyRentHC', +e.target.value)} /></div>
                <div><Label>Charges (€)</Label><Input type="number" value={form.monthlyCharges || ''} onChange={e => updateForm('monthlyCharges', +e.target.value)} /></div>
                <div><Label>Dépôt (€)</Label><Input type="number" value={form.deposit || ''} onChange={e => updateForm('deposit', +e.target.value)} /></div>
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={v => updateForm('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="parti">Parti</SelectItem>
                  </SelectContent>
                </Select>
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
                <TableHead>Bien</TableHead>
                <TableHead>Entrée</TableHead>
                <TableHead>Sortie</TableHead>
                <TableHead>Loyer HC</TableHead>
                <TableHead>Charges</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.firstName} {t.lastName}</TableCell>
                  <TableCell>{propName(t.propertyId)}</TableCell>
                  <TableCell>{formatDateFR(t.entryDate)}</TableCell>
                  <TableCell>{t.exitDate ? formatDateFR(t.exitDate) : '—'}</TableCell>
                  <TableCell>{formatCurrency(t.monthlyRentHC)}</TableCell>
                  <TableCell>{formatCurrency(t.monthlyCharges)}</TableCell>
                  <TableCell>
                    <Badge variant={t.status === 'actif' ? 'default' : 'secondary'} className={t.status === 'actif' ? 'bg-success text-success-foreground' : ''}>
                      {t.status === 'actif' ? 'Actif' : 'Parti'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleRemove(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {tenants.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Aucun locataire</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
