import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/lib/store';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [settings, setSettings] = useSettings();

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Paramètres</h1>
      <Card className="shadow-md">
        <CardHeader><CardTitle>Informations propriétaire</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nom du propriétaire</Label>
            <Input value={settings.ownerName} onChange={e => setSettings({ ...settings, ownerName: e.target.value })} />
          </div>
          <div>
            <Label>Année fiscale active</Label>
            <Input type="number" value={settings.activeFiscalYear} onChange={e => setSettings({ ...settings, activeFiscalYear: +e.target.value })} />
          </div>
          <Button onClick={() => toast.success('Paramètres sauvegardés')}>Sauvegarder</Button>
        </CardContent>
      </Card>
      <Card className="shadow-md border-destructive/30">
        <CardHeader><CardTitle className="text-destructive">Réinitialiser</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Supprimer toutes les données et recharger les données de démonstration.</p>
          <Button variant="destructive" onClick={() => { localStorage.clear(); window.location.reload(); }}>Réinitialiser les données</Button>
        </CardContent>
      </Card>
    </div>
  );
}
