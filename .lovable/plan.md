

## App de bureau sur Mac via PWA

La solution la plus simple est de transformer votre app en **PWA (Progressive Web App)**. Cela vous permettra de l'installer depuis votre navigateur et de l'ouvrir comme une app native depuis votre Dock sur Mac — sans passer par l'App Store.

### Ce que ça donne
- Une icône sur votre bureau / dans le Dock
- L'app s'ouvre dans sa propre fenêtre (sans barre d'adresse)
- Fonctionne hors-ligne pour la navigation
- Même base de données cloud, rien ne change côté données

### Modifications techniques

1. **Installer `vite-plugin-pwa`** et configurer dans `vite.config.ts` avec manifest (nom, icônes, couleurs)
2. **Ajouter les icônes PWA** dans `/public` (192x192, 512x512)
3. **Ajouter les meta tags** dans `index.html` (theme-color, apple-touch-icon, etc.)
4. **Ajouter `/~oauth` au `navigateFallbackDenylist`** du service worker pour ne pas casser l'authentification

### Comment installer sur Mac
Une fois déployé : ouvrir l'app dans Chrome → menu ⋮ → "Installer Gestion LMNP" → l'app apparaît dans le Dock.

