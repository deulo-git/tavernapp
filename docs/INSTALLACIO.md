# TavernApp — Guia d'instal·lació i ús

PWA per a iPad (en horitzontal) perquè el personal del restaurant pugui assessorar els clients:
carta de **Menjar**, **Begudes** (vins, cerveses, licors) i **Informació** (dades del restaurant i fitxes
per explicar coses als turistes), amb traducció automàtica a castellà, anglès i francès.

## Com funciona (resum)

| Peça | Servei | Cost |
|---|---|---|
| Dades compartides entre les 3 tablets (temps real, funciona sense connexió) | Firebase Firestore, pla **Spark** | Gratuït |
| Identificació invisible de cada tablet | Firebase Authentication (anònima) | Gratuït |
| Allotjament de l'app + traductor | Cloudflare Workers | Gratuït |
| Traducció automàtica CA → ES/EN/FR | DeepL API Free (500.000 caràcters/mes) | Gratuït |

Les fotos es redueixen a l'iPad i es guarden dins Firestore (no cal Firebase Storage ni targeta de crèdit).

---

## 1. Preparar l'ordinador (només per publicar l'app)

1. Instal·la [Node.js](https://nodejs.org) 20 o superior.
2. A la carpeta del projecte:

```bash
npm install
```

## 2. Firebase (dades)

> **Ja fet** per al projecte `tavernapp-964e1b` (consola:
> <https://console.firebase.google.com/project/tavernapp-964e1b/overview>). La configuració web és a
> `.env.local` (no es puja a git). Aquests passos només cal repetir-los en un ordinador nou o per a un
> projecte nou.

1. Inicia sessió amb el compte de Google del restaurant:

```bash
npx -y firebase-tools@15 login
```

2. Crea el projecte (l'identificador ha de ser únic a tot Google) i deixa'l com a projecte per defecte a
   `.firebaserc`:

```bash
npx -y firebase-tools@15 projects:create tavernapp-xxxxxx --display-name TavernApp
```

3. Registra l'app web i copia la configuració que mostra el segon comandament a `.env.local`
   (a partir de `.env.example`):

```bash
npx -y firebase-tools@15 apps:create web TavernApp
```

```bash
npx -y firebase-tools@15 apps:sdkconfig web
```

4. Crea la base de dades a Madrid (si diu que l'API no està activada, activa-la amb l'enllaç que mostra i
   torna-ho a provar al cap d'un parell de minuts):

```bash
npx -y firebase-tools@15 firestore:databases:create "(default)" --location europe-southwest1
```

5. Activa l'inici de sessió anònim (definit a `firebase.json`) i publica les regles de seguretat
   (`firestore.rules`):

```bash
npx -y firebase-tools@15 deploy --only auth
```

```bash
npm run rules:deploy
```

> Les regles acabades de publicar poden trigar **fins a 10 minuts** a aplicar-se a les connexions en temps
> real. Si just després de crear el projecte l'app diu "No s'ha pogut accedir a la base de dades
> (permission-denied)", espera uns minuts i toca *Torna-ho a provar*.

### Projecte de proves

Hi ha un segon projecte, `tavernapp-test-1926b6` ("TavernApp PROVES"), per provar canvis sense tocar les
dades reals. La seva configuració és a `.env.staging.local` (tampoc no es puja a git):

```bash
npm run dev:staging
```

Si no el necessites, el pots esborrar a la consola de Firebase: *Configuració del projecte → General →
Suprimeix el projecte*.

## 3. DeepL (traducció)

1. Crea un compte **DeepL API Free** a <https://www.deepl.com/pro-api> (pot demanar una targeta per
   verificar la identitat, però el pla Free no cobra mai: quan s'esgota la quota, simplement s'atura).
2. A *Compte → Claus API* copia la clau (acaba en `:fx`).

## 4. Cloudflare (publicar l'app)

1. Crea un compte gratuït a <https://dash.cloudflare.com>.
2. Inicia sessió des de l'ordinador:

```bash
npx wrangler login
```

3. Desa la clau de DeepL com a secret (no queda mai dins l'app):

```bash
npx wrangler secret put DEEPL_API_KEY
```

4. Publica:

```bash
npm run deploy
```

Al final mostra l'adreça de l'app, del tipus `https://tavernapp.<el-teu-subdomini>.workers.dev`.
Cada cop que es canvia el codi, es torna a executar `npm run deploy`; les tablets mostraran
"Hi ha una versió nova de l'app · Actualitza ara".

## 5. Instal·lar l'app a cada iPad

No hi ha configuració inicial ni codis: les tres tablets veuen el mateix des del primer moment.

1. Obre **https://tavernapp.tavernapp.workers.dev** amb **Safari** a l'iPad.
2. Toca **Comparteix** (quadre amb fletxa) → **Afegeix a la pantalla d'inici** → **Afegeix**.
3. Obre l'app **des de la icona**. Els canvis de qualsevol tablet apareixen a totes en temps real.

El PIN del mode edició és **6998** (es pot canviar a *Informació → Configuració*).

## 6. Colors de la carta

Cada categoria de menjar té el seu color a la graella (per exemple: blau per als platets, verd per als
plats, rosa per a les postres). Es canvia en mode edició, a *Menjar → Categories*. Les begudes tenen un
color per tipus: lila per als vins, groc per a les cerveses i taronja per als licors.

## 7. Ajustos recomanats de l'iPad

- **Bloqueig de rotació** en horitzontal (Centre de control). L'iPad no deixa que una web bloquegi
  l'orientació per si sola.
- *Configuració → Pantalla i brillantor → Bloqueig automàtic*: posa-hi un temps llarg durant el servei.
- Opcional: *Accessibilitat → Accés guiat* per deixar l'iPad fixat a l'app.

---

## Ús diari (per al personal)

- **Inici**: tres botons grans, *Menjar*, *Begudes* i *Informació*.
- **Cercar**: el cercador ignora accents ("tomaquet" troba "tomàquet").
- **Al·lèrgies del client**: marca-les i s'amagaran els plats/begudes que les contenen; els que poden
  tenir-ne traces es marquen amb un avís.
- **Fitxa d'un plat**: foto, explicació (pestanyes CA/ES/EN/FR), al·lèrgens, ingredients, preparació
  (només personal) i begudes recomanades.
- **Mostra al client**: pantalla neta amb la foto, el text en l'idioma del client i els al·lèrgens, sense
  informació interna.
- **Informació → El restaurant**: horaris, contacte i **QR del wifi** per ensenyar al client.
- **Informació → Fitxes per al client**: explicacions per als turistes (Fires de Girona, Temps de Flors…)
  en quatre idiomes.

### Mode edició

- Botó **Edita** (a dalt a la dreta) → PIN. La barra es torna groga mentre s'edita.
- Apareixen els botons **+ Afegeix**, ✏️ editar, 🗑 eliminar i ↑↓ per ordenar.
- En eliminar es demana confirmació i hi ha uns segons per **Desfer**.
- En desar, l'explicació es tradueix automàticament. Les traduccions es poden revisar i corregir a mà
  (secció *Explicació en altres idiomes*). Si després es canvia el text en català, l'app pregunta si
  cal tornar a traduir o mantenir les correccions.
- Es surt sol del mode edició després de 10 minuts sense tocar res.
- Sense connexió també es pot editar: els canvis es guarden a la tablet i s'envien en tornar la connexió
  (l'indicador de dalt mostra "Sense connexió · N pendents"). La traducció es fa quan torna la connexió.

### Configuració (Informació → Configuració, en mode edició)

- Nom de la tablet, canviar el PIN, tema clar/fosc.
- **Còpia de seguretat**: exporta un fitxer amb tota la carta (fotos incloses) via *Desa a Fitxers*, i
  restaura'l si cal. Recomanable fer-ne una de tant en tant.

---

## Seguretat

- No hi ha usuaris ni contrasenyes: cada tablet s'identifica de manera anònima i invisible.
- **Qualsevol persona que obri l'adreça de l'app la pot veure i, tècnicament, modificar**: no hi ha codi ni
  login, tal com es va decidir. Les regles de Firestore només barren l'accés a scripts sense sessió i
  rebutgen documents mal formats o massa grans. Per això és important **no difondre l'adreça** i fer
  **còpies de seguretat** periòdiques.
- El **PIN** del mode edició evita canvis per error del personal; es comprova a la tablet, no al servidor.
- La clau de DeepL només és al servidor de Cloudflare. L'endpoint de traducció limita mida i freqüència
  de peticions.

## Límits dels plans gratuïts

| Servei | Límit | Ús esperat amb 3 tablets |
|---|---|---|
| Firestore | 50.000 lectures/dia, 20.000 escriptures/dia, 1 GiB | Molt per sota |
| DeepL Free | 500.000 caràcters/mes | Unes poques desenes de milers |
| Cloudflare Workers | 100.000 peticions/dia | Molt per sota |

---

## Desenvolupament

```bash
npm run dev
```

Sense `.env.local`, l'app funciona en **mode demo**: les dades es guarden només al navegador i les
traduccions són simulades (`[ES] text…`, definit a `.dev.vars`). Per provar DeepL de veritat en local,
posa la clau a `.dev.vars` i treu `TRANSLATE_MOCK=1`.

```bash
npm test
```

```bash
npm run lint
```

```bash
npm run typecheck
```

Estructura principal:

- `src/domain/` — tipus, al·lèrgens UE, especificacions de begudes, cerca, traduccions, imatges.
- `src/data/` — repositoris (Firestore i demo local), estat global, traduccions en segon pla, còpies.
- `src/features/` — pantalles (inici, menjar, begudes, informació, configuració).
- `src/ui/` — components tàctils reutilitzables.
- `worker/` — Cloudflare Worker: serveix l'app i fa de pont amb DeepL (`/api/translate`).
- `firestore.rules` — regles d'accés i validació de dades.
- `npm run icons` — regenera icones i pantalles d'inici de l'iPad a partir de `public/logo.png`.
