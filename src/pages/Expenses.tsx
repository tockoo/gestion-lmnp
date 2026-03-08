import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useProperties, useExpenses, generateId } from '@/lib/store';
import { formatCurrency, formatDateFR } from '@/lib/receipt-utils';
import { EXPENSE_CATEGORIES, type Expense, type ExpenseCategory } from '@/types/lmnp';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, Paperclip, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const emptyExpense: Omit<Expense, 'id'> = {
  propertyId: '', category: 'travaux', amountTTC: 0, date: '',
  description: '', invoiceRef: '', taxDeductible: true,
  attachmentUrl: undefined, attachmentName: undefined,
};

export default function Expenses() {
  const [properties] = useProperties();
  const [expenses, setExpenses] = useExpenses();
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<Omit<Expense, 'id'>>(emptyExpense);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const openNew = () => { setEditing(null); setForm({ ...emptyExpense, propertyId: properties[0]?.id || '' }); setOpen(true); };
  const openEdit = (e: Expense) => { setEditing(e); setForm({ ...e }); setOpen(true); };

  const save = () => {
    if (editing) {
      setExpenses(prev => prev.map(e => e.id === editing.id ? { ...form, id: editing.id } : e));
    } else {
      setExpenses(prev => [...prev, { ...form, id: generateId() }]);
    }
    setOpen(false);
  };

  const remove = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));
  const updateForm = (key: string, value: string | number | boolean | undefined) => setForm(prev => ({ ...prev, [key]: value }));
  const propName = (id: string) => id === 'all' ? 'Tous les biens' : properties.find(p => p.id === id)?.name || '—';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${generateId()}.${ext}`;
      const { error } = await supabase.storage.from('invoices').upload(path, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('invoices').getPublicUrl(path);
      updateForm('attachmentUrl', publicUrl);
      updateForm('attachmentName', file.name);
      toast.success('Facture uploadée');
    } catch (err: any) {
      toast.error('Erreur upload: ' + (err.message || 'erreur inconnue'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dépenses</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Ajouter une dépense</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? 'Modifier la dépense' : 'Nouvelle dépense'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Bien</Label>
                <Select value={form.propertyId} onValueChange={v => updateForm('propertyId', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les biens</SelectItem>
                    {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Catégorie</Label>
                <Select value={form.category} onValueChange={v => updateForm('category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Montant TTC (€)</Label><Input type="number" value={form.amountTTC || ''} onChange={e => updateForm('amountTTC', +e.target.value)} /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => updateForm('date', e.target.value)} /></div>
              </div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => updateForm('description', e.target.value)} /></div>
              <div><Label>Référence facture</Label><Input value={form.invoiceRef} onChange={e => updateForm('invoiceRef', e.target.value)} /></div>
              <div className="flex items-center gap-2">
                <Checkbox checked={form.taxDeductible} onCheckedChange={v => updateForm('taxDeductible', !!v)} id="deductible" />
                <Label htmlFor="deductible">Déductible fiscalement</Label>
              </div>

              {/* Pièce jointe */}
              <div className="space-y-2">
                <Label>Pièce jointe (facture)</Label>
                <div className="flex items-center gap-2">
                  <Input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFileUpload} />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Paperclip className="h-4 w-4 mr-2" />}
                    {uploading ? 'Upload...' : 'Joindre un fichier'}
                  </Button>
                  {form.attachmentName && (
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">{form.attachmentName}</span>
                  )}
                </div>
                {form.attachmentUrl && (
                  <a href={form.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                    <ExternalLink className="h-3 w-3" /> Voir le fichier
                  </a>
                )}
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
                <TableHead>Date</TableHead>
                <TableHead>Bien</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Déductible</TableHead>
                <TableHead>Pièce jointe</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.sort((a, b) => b.date.localeCompare(a.date)).map(e => (
                <TableRow key={e.id}>
                  <TableCell>{formatDateFR(e.date)}</TableCell>
                  <TableCell>{propName(e.propertyId)}</TableCell>
                  <TableCell>{EXPENSE_CATEGORIES[e.category]}</TableCell>
                  <TableCell>{e.description}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(e.amountTTC)}</TableCell>
                  <TableCell>
                    <Badge variant={e.taxDeductible ? 'default' : 'secondary'} className={e.taxDeductible ? 'bg-success text-success-foreground' : ''}>
                      {e.taxDeductible ? 'Oui' : 'Non'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {e.attachmentUrl ? (
                      <a href={e.attachmentUrl} target="_blank" rel="noopener noreferrer">
                        <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-accent">
                          <Paperclip className="h-3 w-3" />
                          {e.attachmentName || 'Fichier'}
                        </Badge>
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Aucune dépense</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
