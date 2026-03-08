

## Plan : Réinitialiser les données et démarrer à zéro

L'app charge actuellement des données de démonstration au premier lancement via `initDemoData()` dans `src/lib/store.ts`. Pour démarrer avec des données vierges, voici ce qu'il faut faire :

### Modifications

1. **`src/lib/store.ts`** : Supprimer ou désactiver l'appel à `initDemoData()` et ajouter un bouton/mécanisme de reset
   - Modifier la fonction `initDemoData()` pour qu'elle initialise des tableaux vides au lieu de données démo
   - Garder la structure (clés localStorage) mais sans contenu pré-rempli

2. **`src/pages/Settings.tsx`** : Ajouter un bouton "Réinitialiser toutes les données" dans les paramètres
   - Confirmation avant suppression (alert dialog)
   - Vide toutes les clés localStorage et recharge la page

3. **`src/pages/Index.tsx`** : S'assurer que `initDemoData()` initialise à vide (juste les clés, pas de contenu)

Cela permettra de repartir de zéro immédiatement et de saisir vos propres biens, locataires et dépenses.

