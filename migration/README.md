# Migrazione MySQL → Sanity

Lo script legge esclusivamente il database `Sql400500_2` nel dump allegato. Migra tutte le righe visibili nelle pagine pubbliche del vecchio sito; `IN_EVIDENZA` non è un filtro di pubblicazione, ma stabilisce soltanto cosa appariva in primo piano.

## Mappatura

- `tb_gallery` con `ESPOSIZIONE=0` → `galleria`
- `tb_img` delle gallerie pubbliche → `opera`, con immagine originale da `images/`
- `tb_news` → `notizia`
- `tb_recensioni` → `recensione`
- `tb_esposizioni` → `esposizione`
- immagini `<img>` nei testi → asset Sanity nel campo `immagini`
- URL `images/thumbs/thumb_*` → immagine originale omonima in `images/`, quando disponibile
- `tb_esposizioni.ID_GALLERIA` → immagini della galleria associate all'esposizione
- HTML entity-encoded e Base64 testuale → Portable Text pulito
- immagini `data:image/...;base64,...` → file binari e asset Sanity

Se un'immagine referenziata nell'HTML non è presente nell'archivio, la migrazione tenta di scaricarla dall'URL originale. Redirect e timeout sono gestiti; risposte non immagine e download falliti non bloccano gli altri contenuti e vengono registrati in `migration/reports/asset-download-failures.json`.

Le immagini incorporate vengono tolte dal corpo Portable Text perché gli schemi correnti ammettono immagini nel campo separato `immagini`. Gli asset identici sono caricati una sola volta.

## Comandi

Analisi locale, senza connessioni o scritture su Sanity:

```powershell
npm run migration:analyze
```

Il report viene scritto in `migration/reports/analysis.json`; una preview senza riferimenti asset viene scritta in `migration/transformed/preview.ndjson`.

Per la migrazione reale impostare il token solo nella sessione corrente:

```powershell
$env:SANITY_API_WRITE_TOKEN = '...'
npm run migration:run -- --execute --confirm=MIGRATE_PRODUCTION_CONTENT
```

Il comando reale esegue obbligatoriamente, in quest'ordine:

1. elimina documenti pubblicati e bozze di tipo `galleria`, `opera`, `notizia`, `recensione`, `esposizione`;
2. elimina gli asset precedentemente collegati a quei documenti se non sono più referenziati altrove;
3. carica e deduplica le immagini legacy;
4. tenta il recupero degli asset mancanti dai rispettivi URL remoti;
5. importa documenti e riferimenti con ID deterministici, così una nuova esecuzione converge sullo stesso risultato.

La rimozione delle `galleria` è necessaria perché contengono riferimenti forti alle opere di test e perché vengono ricostruite dal database legacy.
Documenti pubblicati, bozze e relativi target vengono eliminati nella stessa transazione atomica, così i riferimenti forti interni all'insieme non possono lasciare una pulizia parziale.
