import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProperties, useTenants, useReceipts, useExpenses, useSettings } from '@/lib/store';
import { generateReceiptsForYear, formatCurrency } from '@/lib/receipt-utils';
import { MONTHS_FR } from '@/types/lmnp';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const [properties] = useProperties();
  const [tenants] = useTenants();
  const [receipts] = useReceipts();
  const [expenses] = useExpenses();
  const [settings] = useSettings();
  const year = settings.activeFiscalYear;

  const yearReceipts = useMemo(() => {
    const generated = generateReceiptsForYear(year, tenants, receipts);
    return generated;
  }, [year, tenants, receipts]);

  const totalRecettes = useMemo(() =>
    yearReceipts.filter(r => r.status !== 'impaye').reduce((s, r) => s + r.amountReceived, 0),
  [yearReceipts]);

  const totalDepenses = useMemo(() =>
    expenses.filter(e => e.date.startsWith(String(year))).reduce((s, e) => s + e.amountTTC, 0),
  [expenses, year]);

  const resultatNet = totalRecettes - totalDepenses;

  const chartData = useMemo(() => {
    return MONTHS_FR.map((m, i) => {
      const monthNum = i + 1;
      const rec = yearReceipts.filter(r => r.month === monthNum && r.status !== 'impaye').reduce((s, r) => s + r.amountReceived, 0);
      const dep = expenses.filter(e => e.date.startsWith(String(year)) && new Date(e.date).getMonth() === i).reduce((s, e) => s + e.amountTTC, 0);
      return { mois: m.slice(0, 3), recettes: rec, depenses: dep };
    });
  }, [yearReceipts, expenses, year]);

  const alerts = useMemo(() => {
    const a: string[] = [];
    const unpaid = yearReceipts.filter(r => r.status === 'impaye' && r.month <= new Date().getMonth() + 1);
    if (unpaid.length > 0) a.push(`${unpaid.length} quittance(s) impayée(s)`);
    const noActiveTenant = properties.filter(p => !tenants.some(t => t.propertyId === p.id && t.status === 'actif'));
    if (noActiveTenant.length > 0) a.push(`${noActiveTenant.length} bien(s) sans locataire actif`);
    return a;
  }, [yearReceipts, properties, tenants]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tableau de bord — {year}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Recettes</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalRecettes)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Dépenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalDepenses)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Résultat Net</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${resultatNet >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(resultatNet)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Per property */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {properties.map(p => {
          const propRec = yearReceipts.filter(r => r.propertyId === p.id && r.status !== 'impaye').reduce((s, r) => s + r.amountReceived, 0);
          const propDep = expenses.filter(e => (e.propertyId === p.id || e.propertyId === 'all') && e.date.startsWith(String(year))).reduce((s, e) => s + e.amountTTC, 0);
          return (
            <Card key={p.id} className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{p.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Recettes</span><span className="text-success font-medium">{formatCurrency(propRec)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Dépenses</span><span className="text-destructive font-medium">{formatCurrency(propDep)}</span></div>
                <div className="flex justify-between border-t pt-1"><span className="font-medium">Net</span><span className={`font-bold ${propRec - propDep >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(propRec - propDep)}</span></div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart */}
      <Card className="shadow-md">
        <CardHeader><CardTitle>Recettes vs Dépenses par mois</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="recettes" name="Recettes" fill="hsl(142, 71%, 37%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="depenses" name="Dépenses" fill="hsl(0, 84%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="shadow-md border-destructive/30">
          <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /> Alertes</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {alerts.map((a, i) => <li key={i} className="text-sm text-muted-foreground">• {a}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
