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

1. Ves a <https://console.firebase.google.com> i crea un projecte nou (per exemple `tavernapp`).
   No cal activar Google Analytics.
2. **Firestore Database** → *Crear base de dades* → mode **producció** → ubicació `europe-southwest1` (Madrid).
3. **Authentication** → *Comença* → pestanya *Sign-in method* → activa **Anònim**.
4. **Configuració del projecte** (roda dentada) → *Les teves aplicacions* → icona `</>` (Web) → registra l'app.
   Copia els valors de `firebaseConfig`.
5. Copia `.env.example` a `.env.local` i omple-hi els valors:

```bash
cp .env.example .env.local
```

6. Publica les regles de seguretat de Firestore (fitxer `firestore.rules`):

```bash
npx -y firebase-tools@15 login
```

```bash
npx -y firebase-tools@15 use --add
```

```bash
npm run rules:deploy
```

> Si el desplegament de les regles dona un error de compilació, avisa: les regles fan servir
> `hashing.sha256()` per verificar el codi del restaurant i s'han de validar contra el teu projecte.
> Les pots provar a la consola: *Firestore → Regles → Zona de proves de regles*.

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

## 5. Primera tablet (configuració inicial)

1. Obre l'adreça de l'app amb **Safari** a l'iPad.
2. Toca **Comparteix** (quadre amb fletxa) → **Afegeix a la pantalla d'inici** → **Afegeix**.
3. Obre l'app **des de la icona** (no des de Safari: l'iPad guarda les dades de l'app instal·lada a part).
4. Omple l'assistent:
   - nom del restaurant i nom de la tablet (Sala, Barra…),
   - **PIN de 4 xifres** per al mode edició,
   - **codi del restaurant** (p. ex. `TAVERNA-7KQ4-M2XP`): **apunta'l**, és el que permet vincular les
     altres tablets i no es torna a mostrar (en pots generar un de nou des de Configuració),
   - opcionalment, dades d'exemple per veure com funciona.

## 6. Les altres tablets

1. Instal·la l'app igual que abans (Safari → Comparteix → Afegeix a la pantalla d'inici).
2. Obre-la des de la icona: demanarà el **codi del restaurant** i un nom per a la tablet.
3. Fet: veurà la mateixa carta i els canvis de qualsevol tablet apareixeran a totes en temps real.

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

- Botó **Edita** (a dalt a la dreta) → PIN. La barra es torna ambre mentre s'edita.
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
- **Tablets vinculades**: llista de tablets amb accés. Si una tablet es perd o marxa algú, desvincula-la i
  genera un **codi nou**.
- **Còpia de seguretat**: exporta un fitxer amb tota la carta (fotos incloses) via *Desa a Fitxers*, i
  restaura'l si cal. Recomanable fer-ne una de tant en tant.

---

## Seguretat

- No hi ha usuaris ni contrasenyes: cada tablet s'identifica de manera anònima i invisible.
- **Només les tablets vinculades amb el codi del restaurant** poden llegir o modificar res; ho imposen
  les regles de Firestore al servidor, no l'app. El codi es guarda xifrat (hash SHA-256).
- El **PIN** del mode edició evita canvis per error; no és una barrera contra algú amb coneixements tècnics
  que tingui una tablet vinculada.
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
- `src/features/` — pantalles (inici, menjar, begudes, informació, configuració, vinculació).
- `src/ui/` — components tàctils reutilitzables.
- `worker/` — Cloudflare Worker: serveix l'app i fa de pont amb DeepL (`/api/translate`).
- `firestore.rules` — regles d'accés (vinculació de tablets).
- `npm run icons` — regenera icones i pantalles d'inici de l'iPad a partir de `public/logo.svg`.
