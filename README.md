# Det Store Hyttetur Oppgjøret™ 🏔️💰

Delt oppgjørsside for hytteturen. Alle tre (Adrian, Sander, Johannes) kan åpne
**samme adresse**, krysse av for det de skal betale – og se hverandres valg **live**.
Alt regnes ut automatisk: fellesvarer deles likt på tre, egne varer legges til den enkelte.

## Filer

| Fil | Hva det er |
|---|---|
| `det-store-hyttetur-oppgjoret.html` | Selve siden (kan også åpnes direkte uten server – da i lokal modus) |
| `server.js` | Liten server uten avhengigheter: deler siden + synkroniserer valgene |
| `package.json` | For hosting-tjenester (`npm start` → `node server.js`) |
| `state.json` | Opprettes automatisk – husker alle avkrysninger mellom omstarter |

---

## 1. Test lokalt (2 minutter)

1. Installer [Node.js](https://nodejs.org) hvis du ikke har det (versjon 18 eller nyere).
2. Åpne en terminal i denne mappen og kjør:

   ```bash
   node server.js
   ```

3. Åpne **http://localhost:3000** i nettleseren.

Nederst til venstre viser et lite merke status:
- 🟢 **«Delt · tilkoblet»** – alt synkroniseres live
- ⚪ **«Lokal modus – endringer deles ikke»** – siden er åpnet uten server

## 2. Dele med de andre på hytta (samme wifi)

1. Kjør `node server.js` på maskinen din.
2. Finn din lokale IP-adresse:
   - **Windows:** `ipconfig` (se på «IPv4-adresse», f.eks. `192.168.1.42`)
   - **Mac/Linux:** `ifconfig` eller `ip addr` (f.eks. `192.168.1.42`)
3. Adrian og Sander åpner `http://192.168.1.42:3000` på sine telefoner/PC-er.
   (Tillat Node.js i brannmuren hvis Windows spør.)

## 3. Hoste på nettet (så de kan velge hjemmefra)

Siden trenger en liten Node-server – den kan ligge gratis hos flere tjenester:

### Render.com (enklest, gratis)

1. Lag en gratis konto på [render.com](https://render.com).
2. Legg denne mappen i et GitHub-repo (eller bruk «Public Git repo»-valget).
3. **New +** → **Web Service** → velg repoet.
4. Fyll inn:
   - **Build Command:** (la stå tom, eller `npm install`)
   - **Start Command:** `node server.js`
   - **Instance Type:** Free
5. Trykk **Create Web Service**. Etter et par minutter får du en adresse som
   `https://hyttetur-oppgjor.onrender.com` – send den til de andre. Ferdig! 🎉

### Andre gode alternativer

- **Railway.app** – samme oppskrift som Render.
- **Glitch.com** – dra inn filene, den kjører Node automatisk.
- **Fly.io** – for deg som vil ha mer kontroll.
- **Egen PC + tunnel** – kjør lokalt (steg 1) og del med f.eks.
  `npx cloudflared tunnel --url http://localhost:3000` (krever ingen konto).

### Ting å vite om gratisplaner

- Tjenesten kan «sove» etter noen minutters inaktivitet – første åpning tar da ~30 sek.
- `state.json` ligger på tjenestens disk. På enkelte gratisplaner nullstilles disken
  ved omstart/redeploy – da starter alle valgene på «Felles» igjen.
  For én hyttetur er det helt uproblematisk; vil du ha permanent lagring, kan man
  senere bytte til en liten database.

---

## Slik brukes siden

- **Alt står som «Felles»** i utgangspunktet. Trykk på **Adrian**, **Sander** eller
  **Johannes** på de varene den personen skal betale selv.
- **Fellesvarene** deles automatisk likt på tre (øredifferansen fordeles så summen
  alltid stemmer på kronen).
- **Statistikken** viser stolpediagram over hvem som betaler hva, og **Oppgjøret**
  nederst viser fasiten per person.
- **Live-synk:** når noen endrer en vare, oppdateres de andres sider automatisk
  i løpet av et øyeblikk (de trenger ikke trykke noe).
- Vil dere nullstille alt? Slett `state.json` og start serveren på nytt.

God hyttetur! 🪵🔥
