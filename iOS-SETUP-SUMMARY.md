# 🎉 iOS App Store Setup - COMPLETATO

**Data:** 7 Febbraio 2026
**Team:** 4 agenti specializzati in parallelo

---

## ✅ LAVORO COMPLETATO

### 1. 🎨 **Assets & Icone** (assets-designer)
- ✅ Icone app professionali create (8 dimensioni iOS)
- ✅ Icon 1024x1024 per App Store
- ✅ Design: vinile vintage con gradiente burgundy/nero
- ✅ manifest.json aggiornato (niente più CDN esterni)
- ✅ index.html aggiornato con Apple Touch Icons
- 📁 **Salvate in:** `public/icons/`

**Dimensioni create:**
- 1024x1024 (App Store)
- 512x512, 192x192, 180x180
- 167x167 (iPad Pro), 152x152 (iPad)
- 120x120 (iPhone), 76x76 (iPad)

---

### 2. ⚖️ **Privacy & Legal** (legal-specialist)
- ✅ Privacy Policy completa e App Store compliant
- ✅ Conforme GDPR, CCPA, COPPA
- ✅ Due versioni: markdown e HTML
- ✅ Checklist App Store Connect
- ✅ Risposte pre-compilate per questionario privacy

**File creati:**
- `PRIVACY_POLICY.md` - versione documentazione
- `privacy-policy.html` - versione web (da hostare)
- `APP_STORE_PRIVACY_CHECKLIST.md` - guida step-by-step
- `APP_STORE_PRIVACY_ANSWERS.txt` - risposte pronte

**Punti chiave:**
- Nessuna raccolta dati personali
- Solo storage locale (progressi gioco)
- Age rating: 4+ (adatto a tutti)
- Trasparente su permessi (Haptics, Status Bar)

---

### 3. 📱 **Marketing & Metadata** (marketing-specialist)
- ✅ Descrizione breve App Store (167/170 caratteri)
- ✅ Descrizione lunga (2,847/4,000 caratteri)
- ✅ Keywords SEO ottimizzate (97/100 caratteri)
- ✅ Categoria: Games > Puzzle
- ✅ Piano 8 screenshots con specifiche
- ✅ Testo promozionale
- ✅ Strategia ASO (App Store Optimization)

**File creato:**
- `APP_STORE_METADATA.md` - tutto il materiale marketing

**Nome app:** Sleevo - Vinyl Shop Manager

**Keywords:** vinyl,puzzle,music,sort,match,retro,record,arcade,casual,addictive,combo,shop,brain,satisfying

---

### 4. 🔧 **Capacitor iOS Setup** (capacitor-specialist)
- ✅ Capacitor CLI e iOS installati (v8.0.2)
- ✅ `capacitor.config.ts` creato e configurato
- ✅ Piattaforma iOS inizializzata
- ✅ Build web completato (`dist/`)
- ✅ Sync iOS completato
- ✅ Plugin configurati (Haptics, StatusBar)
- ✅ Script npm aggiunti

**File creato:**
- `IOS_BUILD_GUIDE.md` - guida completa sviluppo iOS

**Configurazione:**
- App ID: `com.sleevo.vinylshop`
- App Name: `Sleevo - Vinyl Shop`
- Build dir: `dist`
- Status Bar: dark, #1a1110
- Orientamento: portrait

**Script disponibili:**
```bash
npm run build              # Build web production
npm run cap:sync:ios       # Sync a iOS
npm run cap:open:ios       # Apri Xcode
npm run ios:build          # Build + sync + open
```

---

## 📋 PROSSIMI PASSI

### 🚨 **AZIONI OBBLIGATORIE (DA FARE SUBITO):**

#### 1. Installare Xcode
- [ ] Scarica da Mac App Store (15-20 GB)
- [ ] Apri Xcode e accetta licenze
- [ ] Installa Command Line Tools: `xcode-select --install`

#### 2. Aggiornare Privacy Policy
Modifica `PRIVACY_POLICY.md` e `privacy-policy.html`:
- [ ] Sostituisci `[Your Contact Email]` con tua email
- [ ] Sostituisci `[Your Name/Company Name]` con tuo nome/azienda
- [ ] Sostituisci `[Your Website URL]` (opzionale)

#### 3. Hostare Privacy Policy
Apple richiede URL pubblico:
- [ ] Carica `privacy-policy.html` su:
  - **GitHub Pages** (gratis, facile)
  - **Netlify** (gratis, drop file)
  - **Vercel** (gratis)
  - Tuo sito web
- [ ] Ottieni URL pubblico (es: https://tuonome.github.io/sleevo/privacy-policy.html)

#### 4. Account Apple Developer
- [ ] Registrati su https://developer.apple.com
- [ ] Costo: $99/anno
- [ ] Necessario per pubblicare su App Store

---

### 📱 **QUANDO XCODE È INSTALLATO:**

#### 5. Aprire progetto iOS
```bash
npm run cap:open:ios
```

#### 6. Configurare Code Signing in Xcode
1. Seleziona target "App"
2. Tab "Signing & Capabilities"
3. Seleziona Team (Apple Developer account)
4. Verifica Bundle ID: `com.sleevo.vinylshop`

#### 7. Testare su Simulator
1. Seleziona iOS Simulator (es. iPhone 15)
2. Premi ▶️ Run
3. Testa il gioco

#### 8. Catturare Screenshots
Devi fare 8 screenshots come indicato in `APP_STORE_METADATA.md`:
1. Hero shot (gameplay principale)
2. Menu difficoltà
3. Meccaniche speciali
4. Progressione negozio
5. Timed mode
6. Victory screen
7. Varietà generi
8. Combo multiplier

**Requisiti tecnici:**
- 1242 x 2688 pixel (iPhone 6.5")
- RGB color space
- Formato PNG

#### 9. Preparare Build per App Store
```bash
# In Xcode:
# Product > Archive
# Window > Organizer > Distribute App
```

#### 10. Submission App Store Connect
1. Vai su https://appstoreconnect.apple.com
2. Crea nuova app
3. Carica metadata da `APP_STORE_METADATA.md`
4. Carica screenshots
5. Inserisci URL Privacy Policy
6. Rispondi questionario privacy (usa `APP_STORE_PRIVACY_ANSWERS.txt`)
7. Carica build
8. Submit for Review

---

## 📁 FILE CREATI

### Documentazione
- `iOS-SETUP-SUMMARY.md` (questo file)
- `IOS_BUILD_GUIDE.md` - Guida tecnica iOS
- `APP_STORE_METADATA.md` - Marketing e descrizioni
- `APP_STORE_PRIVACY_CHECKLIST.md` - Checklist privacy

### Privacy Policy
- `PRIVACY_POLICY.md` - Versione markdown
- `privacy-policy.html` - Versione web (da hostare)
- `APP_STORE_PRIVACY_ANSWERS.txt` - Risposte questionario

### Configurazione
- `capacitor.config.ts` - Config Capacitor
- `manifest.json` - Aggiornato con icone locali
- `index.html` - Aggiornato con Apple Touch Icons

### Assets
- `public/icons/icon-*.png` (8 dimensioni)

### Build
- `dist/` - Build production web
- `ios/` - Progetto Xcode nativo

---

## ⏱️ TIMELINE STIMATA

**Oggi (con Xcode installato):**
- Setup Xcode: 30 min
- Primo build & test: 15 min
- **TOTALE: ~45 minuti**

**Prossimi giorni:**
- Screenshots: 1-2 ore
- Aggiornare Privacy Policy: 10 min
- Hostare Privacy Policy: 15 min
- Creare account Developer: 30 min
- **TOTALE: ~3 ore**

**Submission:**
- Preparare build Archive: 30 min
- Upload App Store Connect: 1 ora
- **TOTALE: 1.5 ore**

**Review Apple:**
- Attesa: 24-48 ore tipicamente

---

## 🎯 CHECKLIST FINALE PRE-SUBMISSION

- [ ] Xcode installato e funzionante
- [ ] App gira su simulator iOS senza errori
- [ ] Account Apple Developer attivo ($99)
- [ ] Privacy Policy aggiornata con contatti
- [ ] Privacy Policy hostata online (URL pubblico)
- [ ] 8 screenshots catturati (1242x2688)
- [ ] Icon 1024x1024 pronta (✅ già fatto!)
- [ ] Metadata App Store preparato (✅ già fatto!)
- [ ] Build Archive creato in Xcode
- [ ] Test su dispositivo fisico (raccomandato)

---

## 💡 CONSIGLI

**Testing:**
- Testa su vari dispositivi (iPhone SE, iPhone 15, iPad)
- Verifica tutte le meccaniche (drag&drop, combo, dust, golden records)
- Controlla haptics su dispositivo fisico
- Testa rotazione dispositivo

**App Store:**
- Usa tutte e 8 gli screenshot slots
- Considera video preview (opzionale, ma aiuta conversioni)
- Monitora keyword rankings dopo lancio
- Prepara aggiornamenti regolari (Apple premia app attive)

**Post-lancio:**
- Rispondi a recensioni utenti
- Monitora crash reports in App Store Connect
- Raccogli feedback per miglioramenti

---

## 📞 SUPPORTO

**Documentazione ufficiale:**
- Capacitor iOS: https://capacitorjs.com/docs/ios
- App Store Guidelines: https://developer.apple.com/app-store/review/guidelines/
- App Store Connect: https://help.apple.com/app-store-connect/

**Problemi comuni:**
- Build errors: Controlla `IOS_BUILD_GUIDE.md`
- Code signing: Verifica account Developer attivo
- Rejection: Leggi feedback Apple, sistema e re-submit

---

**🎉 Congratulazioni! Il setup iOS è completo al 90%.**
**Manca solo Xcode e sei pronto per il primo build!**
