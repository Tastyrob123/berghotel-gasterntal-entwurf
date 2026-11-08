/* Studio · Berghotel Gasterntal. Das Werkzeug, mit dem die Seite gepflegt wird. Ohne Bibliothek. Aufbau wie das Studio der Salt-&-Silver-Seite. */
(() => {
'use strict';
/* Der Schreibtisch (17.10.2026): dieses frühere Studio läuft als alt.html weiter; der Schreibtisch bettet seine Ansichten ein (Saison & Takt, Zimmer & Preise,
   Ässe u trinke, Anlass, Das Haus, Menü & Seiten, Bilder, Besuche, Zugang, einzelne Listen). Eingebettet ohne Rand und Leiste; jede gespeicherte Änderung
   meldet es an den Schreibtisch, dann stimmen Leiste, Rand und Zahlen dort sofort. */
const EIN = new URLSearchParams(location.search).has('eingebettet') && window.parent !== window;
if (EIN) document.documentElement.classList.add('eingebettet');
const melden = () => { if (EIN) window.parent.postMessage({ bureau: 'geaendert' }, '*'); };
/* Ist Die Tafel (La Carte) angeschlossen, pflegt sie Zeilen, Preise, Rubriken und PDF der Karte; «Ässe u trinke» bleibt hier dann nur zum Ansehen,
   damit nie zwei Werkzeuge dieselben Zeilen ändern (wie Ruedihus). Der Schreibtisch öffnet die Ansicht dann mit ?tafel=1. */
const TAFEL = EIN && new URLSearchParams(location.search).has('tafel');
if (TAFEL) document.documentElement.classList.add('tafel');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const h = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
const KNI = `<i>${PF}</i>`;
const IK = {  // Strichzeichen im Stil der Seite (1,4 px, runde Enden)
  haus: '<path d="M3 11 12 4l9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-6h4v6"/>',
  seiten: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>',
  uhr: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  bett: '<path d="M3 18V8"/><path d="M3 15h18v3"/><path d="M3 12h18v3"/><path d="M6 12V9.5h5V12"/>',
  karte: '<path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3"/><path d="M7 11v10"/><path d="M16 3c-2 1.5-2.5 5-2.5 8 0 1.5 1 2 2.5 2V21"/>',
  glocke: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  balken: '<path d="M4 20V11M10 20V5M16 20v-7M2 20h20"/>',
  bild: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 17 5-5 3.5 3.5 2.5-2.5L20 17"/><circle cx="16" cy="9.5" r="1.5"/>',
  tal: '<path d="M2 19 8.5 8l4 6.5L15 11l7 8z"/><circle cx="18" cy="6" r="2"/>',
  menue: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  lupe: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/>',
  stift: '<path d="m4 20 4.5-1 10-10-3.5-3.5-10 10z"/><path d="m13.5 7 3.5 3.5"/>',
  verlauf: '<path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4.5h4.5"/><path d="M12 8v4.5l3 1.5"/>',
  schluessel: '<circle cx="8" cy="14" r="4.5"/><path d="m11.5 10.5 8-8M16 6l2.5 2.5M13.5 8.5 16 11"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
};
const ik = n => `<span class="ik" aria-hidden="true"><svg viewBox="0 0 24 24">${IK[n] || IK.haus}</svg></span>`;
const SYM = {
  links: '<svg viewBox="0 0 14 14"><path d="m9 2-5 5 5 5"/></svg>', rechts: '<svg viewBox="0 0 14 14"><path d="m5 2 5 5-5 5"/></svg>',
  hoch: '<svg viewBox="0 0 14 14"><path d="m2.5 9 4.5-4.5L11.5 9"/></svg>', runter: '<svg viewBox="0 0 14 14"><path d="m2.5 5 4.5 4.5L11.5 5"/></svg>',
  zu: '<svg viewBox="0 0 14 14"><path d="m3 3 8 8M11 3l-8 8"/></svg>', auge: '<svg viewBox="0 0 16 14"><path d="M1 7s2.6-4.5 7-4.5S15 7 15 7s-2.6 4.5-7 4.5S1 7 1 7Z"/><circle cx="8" cy="7" r="1.9"/></svg>',
  augezu: '<svg viewBox="0 0 16 14"><path d="M1 7s2.6-4.5 7-4.5S15 7 15 7s-2.6 4.5-7 4.5S1 7 1 7Z"/><path d="m3 1 10 12"/></svg>',
  bild: '<svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="2"/><path d="m3 11 3.2-3 2.3 2 2-1.6L13 11"/></svg>',
  korb: '<svg viewBox="0 0 14 14"><path d="M2.5 4h9M5.5 4V2.5h3V4M3.5 4l.6 7.5h5.8L10.5 4"/></svg>',
  rechner: '<svg viewBox="0 0 16 14"><rect x="1.5" y="1.5" width="13" height="8.5" rx="1.4"/><path d="M5.5 12.5h5"/></svg>', handy: '<svg viewBox="0 0 14 16"><rect x="3.5" y="1.5" width="7" height="13" rx="1.6"/></svg>',
  stift: '<svg viewBox="0 0 14 14"><path d="m2 12 2.5-.5 7-7-2-2-7 7z"/></svg>',
};
const NAV = [['uebersicht', 'Übersicht', 'haus'], ['seiten', 'Seiten & Texte', 'seiten'], ['saison', 'Saison & Zeiten', 'uhr'], ['zimmer', 'Zimmer & Preise', 'bett'], ['karte', 'Ässe u trinke', 'karte'], ['anlass', 'Anlass & Hinweis', 'glocke'], ['bilder', 'Bilder', 'bild'],
  null, ['hausS', 'Das Haus', 'tal'], ['menue', 'Menü & Seiten', 'menue'], ['google', 'Google & Co.', 'lupe'], ['besuche', 'Besuche & Anfragen', 'balken'],
  null, ['aenderungen', 'Änderungen', 'stift'], ['verlauf', 'Verlauf', 'verlauf'], ['zugang', 'Zugang', 'schluessel']];
const ARTZ = { fakt: 'uhr', text: 'seiten', karte: 'karte', bild: 'bild', liste: 'tal', hinweis: 'glocke', anlass: 'glocke', seite: 'menue', google: 'lupe' };
const REIHEN = { speisen: 'Speisen', getraenke: 'Getränke' };
const sicht = $('#sicht');
let Z = null, W = null, V = null, OFFEN = false, PROBE = false, NEUB = {};

// ---------------------------------------------------------------- Fehler festhalten (liest die Prüfung, studio/pruefung.html)
const SPEICHER = 'bg_studio_fehler';
function merkeFehler(art, text) {
  try {
    const l = JSON.parse(localStorage.getItem(SPEICHER) || '[]');
    l.unshift({ zeit: new Date().toISOString(), art, text: String(text ?? '').slice(0, 400), ort: location.hash });
    localStorage.setItem(SPEICHER, JSON.stringify(l.slice(0, 30)));
  } catch (e) {}
}
// M19: fehlt ein kleines Vorschaubild, nimmt die Kachel die bisherige Fassung (data-ersatz); ein Zuhörer statt onerror, das die Sicherheitsregel blockt
document.addEventListener('error', e => { const i = e.target; if (i && i.tagName === 'IMG' && i.dataset.ersatz && !i.__ersatz) { i.__ersatz = 1; i.src = i.dataset.ersatz; } }, true);
addEventListener('error', ev => merkeFehler('skript', (ev.message || 'Fehler') + (ev.filename ? ` (${ev.filename.split('/').pop().split('?')[0]}:${ev.lineno})` : '')));
addEventListener('unhandledrejection', ev => merkeFehler('versprechen', (ev.reason && ev.reason.message) || ev.reason));
let LETZTER = null;  // der letzte Fehler mit Lexikon-Stichwort, damit sag() den Weg zur Prüfung anhängen kann
function fehlerMit(text, lex) { const e = new Error(text); e.lex = lex || null; LETZTER = e; return e; }

// ---------------------------------------------------------------- Verbindung
async function api(was, daten, roh) {
  const o = daten === undefined ? {} : { method: 'POST', headers: roh ? { 'X-Studio': '1' } : { 'X-Studio': '1', 'Content-Type': 'application/json' }, body: roh ? daten : JSON.stringify(daten) };
  let r;
  try { r = await fetch('/studio/api/' + was, o); } catch (e) { merkeFehler('verbindung', was + ': ' + e.message); throw fehlerMit('Keine Verbindung zum Studio.', 'keine-verbindung'); }
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && was !== 'status') { tor('an'); throw fehlerMit(j.fehler || 'Bitte anmelden.', 'abgemeldet'); }
  if (!r.ok) {
    if (r.status >= 500 || r.status === 494 || r.status === 431) merkeFehler('server', `${was}: ${r.status} ${j.fehler || ''}`);
    const zuGross = r.status === 494 || r.status === 431;
    throw fehlerMit(j.fehler || (zuGross ? 'Der Browser schickt zu viel gespeicherten Stand mit. Setzen Sie die Probe in der Prüfung zurück.' : r.status >= 500 ? 'Im Studio ist etwas schiefgegangen.' : 'Das hat nicht geklappt.'), j.lex || (zuGross ? 'kekse-zu-gross' : r.status >= 500 ? 'server-fehler' : null));
  }
  return j;
}
async function aendern(a) { Z = await api('aendern', a); rand(); leiste(); melden(); return Z; }
function sag(text, fehler) {
  $$('#meldung div').forEach(x => { if (x.textContent === text || x.firstChild && x.firstChild.textContent === text) x.remove(); });
  const d = document.createElement('div');
  d.textContent = text;
  if (fehler) {
    d.className = 'f';
    const lex = LETZTER && LETZTER.message === text ? LETZTER.lex : null;
    if (lex) { const a = document.createElement('a'); a.href = 'pruefung.html#lex-' + lex; a.textContent = 'Was tun?'; a.style.cssText = 'margin-left:10px;color:#fff;text-decoration:underline;text-underline-offset:3px'; d.appendChild(a); }
  }
  $('#meldung').appendChild(d);
  setTimeout(() => d.remove(), fehler ? 6500 : 2600);
}
const mal = (n, eins, viele) => `${n} ${n === 1 ? eins : viele}`;
function datum(z) {
  const d = new Date(z);
  return isNaN(d) ? '' : d.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
}
const tagText = iso => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? `${m[3]}.${m[2]}.${m[1]}` : (iso || ''); };
function bildadr(k) {
  if (!k) return '';
  if (NEUB[k]) return NEUB[k];
  const b = Z && Z.bilder.find(x => x.key === k);
  return b ? b.adresse : `/assets/img/${k}-s.webp`;
}
const bildGross = k => { const b = Z && Z.bilder.find(x => x.key === k); return b ? b.gross : /g$/.test(k || '') && /^u-/.test(k || ''); };

// ---------------------------------------------------------------- Tor
function tor(art) {
  $('#app').hidden = true;
  const t = $('#tor');
  t.hidden = false;
  const neu = art === 'neu';
  t.innerHTML = `<img class="tor__bild" src="/assets/img/haus-profil-m.webp" alt="">
  <div class="tor__k">
    <img class="tor__m" src="/assets/logo/schrift-berghotel-gasterntal.svg" alt="Berghotel Gasterntal">
    <h1>Das <em>Studio.</em></h1>
    <p>${neu ? 'Legen Sie ein Passwort fest. Damit kommen nur Sie an die Inhalte der Website.' : 'Hier pflegen Sie die Website: Saison, Zeiten, Preise, Karte, Texte und Bilder.'}</p>
    <form autocomplete="off">
      <label class="feld"><span>${neu ? 'Neues Passwort' : 'Passwort'}</span><input type="password" name="p" autocomplete="${neu ? 'new-password' : 'current-password'}" required minlength="${neu ? 10 : 1}" autofocus></label>
      ${neu ? '<label class="feld"><span>Noch einmal</span><input type="password" name="p2" autocomplete="new-password" required></label>' : ''}
      <div class="fehler" role="alert"></div>
      <button class="kn kn--breit" type="submit">${neu ? 'Passwort festlegen' : 'Öffnen'}${KNI}</button>
    </form>
    ${neu ? '<p class="tor__f">Mindestens 10 Zeichen. Sie können es später unter «Zugang» ändern.</p>' : ''}
  </div>`;
  const f = $('form', t), fe = $('.fehler', t);
  f.addEventListener('submit', async ev => {
    ev.preventDefault();
    fe.textContent = '';
    if (neu && f.p.value !== f.p2.value) { fe.textContent = 'Die beiden Eingaben sind nicht gleich.'; return; }
    try { await api(neu ? 'einrichten' : 'anmelden', { passwort: f.p.value }); t.hidden = true; t.innerHTML = ''; await laden(); } catch (e) { fe.textContent = e.message; }
  });
}

// ---------------------------------------------------------------- Rahmen
async function laden() {
  Z = await api('stand');
  $('#app').hidden = false;
  rand();
  leiste();
  zeige();
}
function rand() {
  const n = Z.aenderungen.length, teil = location.hash.split('/')[1] || 'uebersicht', an = teil === 'seite' ? 'seiten' : teil;
  $('#rand').innerHTML = `<a class="rand__marke" href="#/uebersicht"><img src="/assets/logo/schrift-berghotel-gasterntal.svg" alt="Berghotel Gasterntal"><span>Studio</span></a>
  <nav aria-label="Bereiche">${NAV.map(p => p ? `<a href="#/${p[0]}" class="${an === p[0] ? 'an' : ''}">${ik(p[2])}${p[1]}${p[0] === 'aenderungen' && n ? `<b>${n}</b>` : ''}</a>` : '<div class="rand__trenn"></div>').join('')}</nav>
  <div class="rand__fuss"><a href="/live/index.html" target="_blank" rel="noopener">Website ansehen ${PF}</a><a href="pruefung.html" title="Prüft Verbindung, Browser, Daten und Bau; kennt jede Fehlerquelle">Prüfung</a>${OFFEN || PROBE ? '' : '<button type="button" data-akt="abmelden">Abmelden</button>'}</div>`;
  const aktiv = $('#rand nav a.an');
  if (aktiv && innerWidth <= 860) aktiv.scrollIntoView({ block: 'nearest', inline: 'center' });
}
function kopf(titel, text, rechts = '') {
  return `<header class="kopfz"><div><h1>${titel}</h1>${text ? `<p>${text}</p>` : ''}</div><div class="kopfz__r">${rechts}</div></header>`;
}
// ---------------------------------------------------------------- Besuche & Anfragen: was Gäste auf der Website tun (Tasty Studios, 10.10.2026, Vorlage Waldhotel Doldenhorn)
// Die Website meldet Ereignisse an /api/zahlen (online im Blob-Speicher, am Rechner in _dienste/zahlen.jsonl). Keine Kekse, keine Adressen, keine Namen.
async function besucheS() {
  const titel = 'Besuche <em>& Anfragen.</em>';
  sicht.innerHTML = `<div class="in">${kopf(titel, 'Was Gäste auf der Website tun: Besuche, Klicks auf «Buchen», Anfragen für Zimmer, Tisch, Sauna und Transport, Gutscheine der letzten 30 Tage.')}<div class="leerbild">${ik('balken')}<b>Einen Moment.</b><p>Die Zahlen werden geladen.</p></div></div>`;
  let ev;
  try { const r = await fetch('/api/zahlen', { cache: 'no-store' }); if (!r.ok) throw new Error(r.status); ev = (await r.json()).ereignisse || []; }
  catch (e) { sicht.querySelector('.in').innerHTML = kopf(titel, '') + `<div class="leerbild">${ik('balken')}<b>Gerade nicht erreichbar.</b><p>Die Zahlen liegen im Speicher der Online-Fassung der Website.</p></div>`; return; }
  const n = t => ev.filter(e => e.t === t).length;
  const zaehle = (L, f) => { const m = {}; L.forEach(e => { const k = f(e); if (k) m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
  const WAS = { tisch: 'Tisch', sauna: 'Sauna', transport: 'Transport ab Kandersteg' };
  const FORM = { zimmer: 'Zimmeranfrage', exklusiv: 'Das Hotel exklusiv', gutschein: 'Gutschein', anreise: 'Vor der Anreise' };
  let land = k => k; try { const dn = new Intl.DisplayNames(['de-CH'], { type: 'region' }); land = k => { try { return dn.of(k); } catch (e) { return k; } }; } catch (e) {}
  const liste = (t, L, name, leer) => { const max = L.length ? L[0][1] : 1; return `<section class="zrang"><h3>${t}</h3>${L.length ? L.slice(0, 8).map(([k, v]) => `<div class="zrang__z"><span>${h(name ? name(k) : k)}</span><i style="--w:${Math.max(4, Math.round(v / max * 100))}%"></i><b>${v}</b></div>`).join('') : `<p class="zrang__leer">${leer}</p>`}</section>`; };
  const tage = []; for (let i = 13; i >= 0; i--) tage.push(new Date(Date.now() - i * 864e5).toISOString().slice(0, 10));
  const proTag = tage.map(t => ev.filter(e => e.t === 'seite' && String(e.zeit).slice(0, 10) === t).length), maxT = Math.max(1, ...proTag);
  sicht.querySelector('.in').innerHTML = kopf(titel, 'Die letzten 30 Tage. Gezählt wird ohne Kekse und ohne Adressen, Prüfläufe zählen nicht mit.') +
    `<section class="zkacheln"><div><b>${n('seite')}</b><span>Seitenaufrufe</span></div><div><b>${n('buchen')}</b><span>Klicks auf «Buchen»</span></div><div><b>${n('tisch')}</b><span>Tisch, Sauna, Transport</span></div><div><b>${n('formular')}</b><span>Anfragen und Gutscheine</span></div></section>
    <section class="zrang"><h3>Seitenaufrufe, die letzten 14 Tage</h3><div class="ztage">${proTag.map((v, i) => `<div title="${v}"><i style="--h:${Math.max(2, Math.round(v / maxT * 100))}%"></i><span>${new Date(tage[i]).getDate()}.</span></div>`).join('')}</div></section>
    <div class="zrang-raster">
    ${liste('Gefragte Zimmer', zaehle(ev.filter(e => e.t === 'formular' && e.f === 'zimmer' && e.z), e => e.z), null, 'Noch keine Zimmeranfrage mit gewähltem Zimmer.')}
    ${liste('Tisch, Sauna, Transport', zaehle(ev.filter(e => e.t === 'tisch'), e => e.p), k => WAS[k] || k, 'Noch keine Reservation.')}
    ${liste('Anfragen und Gutscheine', zaehle(ev.filter(e => e.t === 'formular'), e => e.f), k => FORM[k] || k, 'Noch keine Anfrage über die Website.')}
    ${liste('Länder', zaehle(ev.filter(e => e.t === 'seite'), e => e.l), land, 'Noch kein Land erkannt.')}
    ${liste('Meistbesuchte Seiten', zaehle(ev.filter(e => e.t === 'seite'), e => e.s), null, 'Noch keine Besuche.')}
    </div>`;
}
const SICHTEN = { liste: listeS, besuche: besucheS, uebersicht, seiten, seite, saison: saisonS, zimmer: zimmerS, karte: karteS, anlass: anlassS, bilder, hausS, menue: menueS, google: googleS, aenderungen: aenderungenS, verlauf, zugang };
let hier = location.hash;
function zeige(halte) {
  if (!Z) return;
  const [, name = 'uebersicht', arg] = location.hash.split('/');
  W = null;
  offen = null;
  hier = location.hash;
  if (halte !== true) sicht.scrollTop = 0;
  (SICHTEN[name] || uebersicht)(arg ? decodeURIComponent(arg) : undefined);
  const nav = NAV.find(p => p && p[0] === (name === 'seite' ? 'seiten' : name));
  document.title = (nav ? nav[1] + ' · ' : '') + 'Studio · Berghotel Gasterntal';
  rand();
}
addEventListener('hashchange', () => {
  if (offen && offen() && location.hash !== hier) {
    const ziel = location.hash;
    history.replaceState(null, '', hier || '#/uebersicht');
    frage('Noch nicht <em>gespeichert.</em>', 'Sie haben Angaben geändert und noch nicht auf «Speichern» gedrückt. Wenn Sie weitergehen, gehen sie verloren.', 'Ohne Speichern weiter', async () => { offen = null; location.hash = ziel; });
    return;
  }
  if (!Z) return;
  fensterZu();  // ein offener Dialog gehört zur alten Ansicht
  zeige();
  leiste();
});

// ---------------------------------------------------------------- Entwurfsleiste, Liste, Quittung
const HAKEN = '<svg viewBox="0 0 16 16"><path d="m3.5 8.5 3 3 6-7"/></svg>';
let letzteZahl = null, BLITZ = null, offen = null;
function vor(z) {
  const m = Math.round((Date.now() - new Date(z)) / 60000);
  return isNaN(m) ? '' : m < 1 ? 'gerade eben' : m < 60 ? `vor ${m} Min.` : m < 1440 ? `vor ${Math.round(m / 60)} Std.` : datum(z);
}
const nachZeit = () => [...Z.aenderungen].sort((a, b) => (b.zeit || '').localeCompare(a.zeit || ''));
function leiste() {
  const el = $('#leiste'), n = Z.aenderungen.length, neueste = nachZeit()[0], zuletzt = Z.verlauf.find(v => !v.anfang);
  el.innerHTML = n ? `<button class="leiste__l" type="button" data-akt="lade" aria-label="Liste der Änderungen zeigen"><i class="leiste__z">${n}</i><span><b>${n === 1 ? 'Änderung' : 'Änderungen'} im Entwurf</b><small>Zuletzt: ${h(neueste.satz)}${neueste.zeit ? ' · ' + vor(neueste.zeit) : ''}</small></span></button>
    <div class="leiste__r"><button class="kn kn--klein kn--linie" type="button" data-akt="lade">Liste zeigen</button><a class="kn kn--klein kn--linie" href="/entwurf/${W ? encodeURIComponent(W.datei) : 'index.html'}" target="_blank" rel="noopener">Entwurf ansehen</a><button class="kn kn--hell" type="button" data-akt="raus">Veröffentlichen${KNI}</button></div>`
    : `<div class="leiste__l"><i class="leiste__z ok">${HAKEN}</i><span><b>Alles veröffentlicht</b><small>${zuletzt ? 'Stand vom ' + datum(zuletzt.zeit) : 'Die Website zeigt den neuesten Stand.'}</small></span></div>
    <div class="leiste__r"><a class="kn kn--klein kn--linie" href="/live/index.html" target="_blank" rel="noopener">Website ansehen</a></div>`;
  if (letzteZahl !== null && letzteZahl !== n && n) $('.leiste__z', el).classList.add('hupf');
  letzteZahl = n;
  if (!$('#lade').hidden) lade();
}
function kurzdiff(c) {
  if (c.art === 'bild') return `<span class="mini"><img src="${h(c.vorher)}" alt=""><i>→</i><img src="${h(c.nachher)}" alt=""></span>`;
  if (c.art === 'karte' || c.art === 'liste') return c.punkte.slice(0, 4).map(p => `<span class="zl"><b>${h(p.name)}</b> ${h(p.text)}</span>`).join('') + (c.punkte.length > 4 ? `<span class="zl">und ${c.punkte.length - 4} weitere</span>` : '');
  if (c.art === 'google') return c.teile.slice(0, 4).map(t => `<span class="zl">${h(t.feld)}: ${t.vorher ? `<s>${h(t.vorher)}</s> → ` : ''}<b>${h(t.nachher)}</b></span>`).join('');
  return `<span class="zl"><s>${h(c.vorher) || 'leer'}</s> → <b>${h(c.nachher) || 'leer'}</b></span>`;
}
function lade() {
  const l = $('#lade'), cs = nachZeit();
  l.hidden = false;
  l.innerHTML = `<div class="lade__k" role="dialog" aria-label="Ihr Entwurf"><header><div><h2>Ihr <em>Entwurf.</em></h2><p>${cs.length ? 'Gespeichert, aber noch nicht auf der Website. Erst «Veröffentlichen» macht es für Gäste sichtbar.' : 'Nichts offen. Alles steht auf der Website.'}</p></div>
      <button class="rund" type="button" data-akt="ladezu" aria-label="Schliessen">${SYM.zu}</button></header>
    <ol class="lade__l">${cs.map(c => `<li data-id="${h(c.id)}"><span class="lade__z">${ik(ARTZ[c.art])}</span><div><b>${h(c.titel)}</b><small>${h(c.ort || '')}${c.zeit ? ' · ' + vor(c.zeit) : ''}</small><p>${kurzdiff(c)}</p>
      <div class="lade__a">${c.stellen.length ? '<button class="link" type="button" data-akt="sehen">Auf der Seite ansehen</button>' : ''}<button class="link" type="button" data-akt="weg">Zurücknehmen</button></div></div></li>`).join('')}</ol>
    ${cs.length ? `<footer><button class="link" type="button" data-akt="alles">Alles zurücknehmen</button><button class="kn kn--hell" type="button" data-akt="raus">Veröffentlichen${KNI}</button></footer>` : ''}</div>`;
}
function ladeZu() { const l = $('#lade'); l.hidden = true; l.innerHTML = ''; }
async function aktAenderung(akt, id, seite) {
  const c = Z.aenderungen.find(x => x.id === id), n = Z.aenderungen.length;
  try {
    if (akt === 'sehen' && c) { ladeZu(); vergleich(c, seite); }
    else if (akt === 'weg' && c) { await aendern({ art: 'verwerfen', id: c.id }); sag('Zurückgenommen: ' + c.titel); neuZeichnen(); }
    else if (akt === 'alles') frage('Alles <em>zurücknehmen?</em>', `${mal(n, 'Änderung geht', 'Änderungen gehen')} verloren. Die Website bleibt, wie sie ist.`, 'Alles zurücknehmen', async () => { await aendern({ art: 'verwerfen', id: 'alles' }); sag('Der Entwurf ist leer.'); neuZeichnen(); });
    else if (akt === 'raus') { ladeZu(); veroeffentlichen(); }
  } catch (e) { sag(e.message, true); }
}
function quittung(titel, text, o = {}) {
  const m = $('#meldung');
  $$('.quitt', m).forEach(x => x.remove());
  const d = document.createElement('div'), c = o.id && Z.aenderungen.find(x => x.id === o.id);
  d.className = 'quitt';
  d.setAttribute('role', 'status');
  d.innerHTML = `<i>${HAKEN}</i><div><b>${h(titel)}</b>${text ? `<span>${h(text)}</span>` : ''}<small>Im Entwurf gespeichert. Auf der Website erst nach dem Veröffentlichen.</small>
    <div class="quitt__a">${c && c.stellen.length ? '<button type="button" data-q="sehen">Vorher/Nachher ansehen</button>' : ''}${o.zurueck ? '<button type="button" data-q="zurueck">Rückgängig</button>' : ''}</div></div>
    <button class="quitt__zu" type="button" data-q="zu" aria-label="Schliessen">${SYM.zu}</button>`;
  d.addEventListener('click', async ev => {
    const b = ev.target.closest('[data-q]');
    if (!b) return;
    d.remove();
    if (b.dataset.q === 'sehen') { const x = Z.aenderungen.find(y => y.id === o.id); if (x) vergleich(x, o.seite); }
    if (b.dataset.q === 'zurueck') { try { await aendern(o.zurueck); sag('Rückgängig gemacht.'); neuZeichnen(); } catch (e) { sag(e.message, true); } }
  });
  m.appendChild(d);
  setTimeout(() => d.remove(), 10000);
}
async function tun(a, q) {
  try { await aendern(a); if (q) quittung(q.titel, q.text, q); return true; } catch (e) { sag(e.message, true); return false; }
}
function neuZeichnen() {
  if (W) return neuLaden({});
  const y = sicht.scrollTop;
  zeige(true);
  sicht.scrollTop = y;
}
const chipsH = (name, opt, wert) => `<div class="chips" data-chips="${name}">${opt.map(([v, t]) => `<button type="button" data-v="${h(v)}" class="${String(v) === String(wert) ? 'an' : ''}">${h(t)}</button>`).join('')}</div>`;
const schalter = (id, an, text) => `<label class="schalter"><input type="checkbox" id="${id}"${an ? ' checked' : ''}><i></i><span>${text}</span></label>`;
document.addEventListener('click', ev => {
  const c = ev.target.closest('.chips button');
  if (!c) return;
  $$('button', c.parentNode).forEach(x => x.classList.toggle('an', x === c));
  c.parentNode.dispatchEvent(new CustomEvent('wahl', { bubbles: true, detail: { name: c.parentNode.dataset.chips, wert: c.dataset.v } }));
});

// ---------------------------------------------------------------- Übersicht
function uebersicht() {
  const n = Z.aenderungen.length, st = new Date().getHours(), cs = nachZeit(), f = Z.felder, a = Z.anlass;
  const tuer = (akt, z, titel, text) => `<button class="tuer" type="button" data-los="${akt}">${ik(z)}<b>${titel}</b><span>${text}</span><i>${PF}</i></button>`;
  const d0 = new Date(), heute = `${d0.getFullYear()}-${String(d0.getMonth() + 1).padStart(2, '0')}-${String(d0.getDate()).padStart(2, '0')}`, offenBis = f['saison.schluss'].wert, auf = f['saison.auf'].wert;
  const saisonT = heute <= offenBis ? `Offen bis ${tagText(offenBis)}` : `Eröffnung ${tagText(auf)}`;
  sicht.innerHTML = `<div class="in">${kopf(st < 11 ? 'Guten <em>Morgen.</em>' : st < 18 ? 'Guten <em>Tag.</em>' : 'Guten <em>Abend.</em>', 'Suchen Sie sich aus, was Sie tun möchten. Alles wird zuerst im Entwurf gespeichert. Unten sehen Sie jederzeit, was offen ist, und stellen es mit einem Knopf auf die Website.')}
  ${Z.fehler ? `<p class="hinweis" style="margin-bottom:14px"><b>Der Entwurf lässt sich gerade nicht bauen.</b> ${h(Z.fehler)} <a class="link" href="pruefung.html#lex-entwurf-baut-nicht">Zur Prüfung</a></p>` : ''}
  <div class="heute">
    <a href="#/saison"><span>Saison</span><b>${h(saisonT)}</b><small>${h(f['zeiten.offen'].wert)} · ${h(f['zeiten.kueche'].wert)}</small><i>Saison und Zeiten ändern</i></a>
    <a href="#/anlass"><span>Nächster Anlass</span><b>${a.an && a.titel ? h(a.titel) : 'Kein Anlass angekündigt'}</b><small>${a.an && a.titel ? h(tagText(a.datum) + (a.zeit ? ', ' + a.zeit : '')) : 'Wildabend, Fondueplausch, Konzert …'}</small><i>Anlass ankündigen</i></a>
    <a href="#/anlass"><span>Hinweis für Gäste</span><b>${Z.hinweis.an && Z.hinweis.text ? 'Eingeschaltet' : 'Ausgeschaltet'}</b><small>${Z.hinweis.an && Z.hinweis.text ? h(Z.hinweis.text.slice(0, 70)) : 'Strasse gesperrt, Betriebsferien, Bus fährt nicht'}</small><i>Hinweis setzen</i></a>
  </div>
  <h2 class="zw">Was möchten Sie tun?</h2>
  <div class="raster r-3">
    ${tuer('saison', 'uhr', 'Saison oder Zeiten ändern', 'Saisonschluss, Eröffnung, Öffnungszeiten, Küche. Einmal ändern, auf jeder Seite richtig.')}
    ${tuer('zimmer', 'bett', 'Zimmerpreis ändern', 'Preise, Package, Hotel exklusiv, Sauna.')}
    ${tuer('karte/speisen', 'karte', 'Karte pflegen', 'Gericht oder Preis ändern, neue Zeile, ganze Rubrik.')}
    ${tuer('anlass', 'glocke', 'Anlass ankündigen', 'Wildabend und Co. oben auf «Ässe u trinke», verschwindet nach dem Datum von selbst.')}
    ${tuer('seiten', 'seiten', 'Text ändern', 'Seite öffnen, auf den Text klicken, schreiben.')}
    ${tuer('bilder', 'bild', 'Bild tauschen', 'Ein Foto ersetzen, überall wo es zu sehen ist.')}
  </div>
  ${n ? `<h2 class="zw">Im Entwurf<span>${String(n).padStart(2, '0')}</span></h2><section class="blatt offenes">${cs.slice(0, 4).map(c => `<div class="offenes__z" data-id="${h(c.id)}"><span class="lade__z" style="width:40px;height:40px">${ik(ARTZ[c.art])}</span><div><b>${h(c.satz)}</b><small>${h(c.ort || '')}${c.zeit ? ' · ' + vor(c.zeit) : ''}</small></div>
      ${c.stellen.length ? '<button class="kn kn--klein kn--linie" type="button" data-akt="sehen">Ansehen</button>' : ''}</div>`).join('')}
      <div class="offenes__f"><button class="link" type="button" data-akt="lade">${n > 4 ? `Alle ${n} zeigen` : 'Liste öffnen'}</button><button class="kn kn--klein" type="button" data-akt="raus">Veröffentlichen${KNI}</button></div></section>` : ''}</div>`;
  sicht.querySelector('.in').addEventListener('click', ev => {
    const t = ev.target.closest('[data-los]'), s = ev.target.closest('[data-akt="sehen"]');
    if (s) return aktAenderung('sehen', s.closest('[data-id]').dataset.id);
    if (t) location.hash = '#/' + t.dataset.los;
  });
}

// ---------------------------------------------------------------- Seiten
function seiten() {
  const gruppen = [...new Set(Z.seiten.map(s => s.gruppe))];
  sicht.innerHTML = `<div class="in">${kopf('Seiten <em>& Texte.</em>', 'Suchen Sie sich eine Seite aus. Sie öffnet sich so, wie Gäste sie sehen. Ein Klick auf einen Text oder ein Bild, und Sie können es ändern.')}
  ${gruppen.map(g => `<h2 class="zw">${g}<span>${String(Z.seiten.filter(s => s.gruppe === g).length).padStart(2, '0')}</span></h2><div class="raster r-4">${Z.seiten.filter(s => s.gruppe === g).map(s =>
    `<a class="sk" href="#/seite/${encodeURIComponent(s.datei)}"><span class="sk__b">${s.bild ? `<img src="${bildadr(s.bild)}" alt="" loading="lazy">` : ''}</span><span class="sk__t"><b>${h(s.name)}</b><span>${mal(s.texte, 'Text', 'Texte')} · ${mal(s.bilder, 'Bild', 'Bilder')}</span></span></a>`).join('')}</div>`).join('')}</div>`;
}

// ---------------------------------------------------------------- Seite bearbeiten
const RSTIL = `.studio-hov,.studio-an{position:absolute;z-index:2147483000;pointer-events:none;border-radius:5px;display:none;box-sizing:border-box}
.studio-hov{outline:calc(1.5px*var(--studio-k,1)) dashed #c5000f;outline-offset:calc(4px*var(--studio-k,1))}
.studio-hov::before{content:attr(data-w);position:absolute;left:-4px;bottom:calc(100% + 9px*var(--studio-k,1));background:#c5000f;color:#fff;font:500 10px/1 'DM Mono',ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;padding:6px 8px;border-radius:5px;white-space:nowrap;transform:scale(var(--studio-k,1));transform-origin:0 100%}
.studio-hov[data-w=""]::before{display:none}
.studio-an{outline:calc(2px*var(--studio-k,1)) solid #c5000f;outline-offset:calc(4px*var(--studio-k,1));background:rgba(197,0,15,.07)}
.studio-werk [data-e]{cursor:text}.studio-werk img[data-b]{cursor:pointer;pointer-events:auto!important}.studio-werk .hinweisband{display:none!important}`;
function richte(d, werk) {
  if (!d.getElementById('studio-stil')) {
    const s = d.createElement('style');
    s.id = 'studio-stil';
    s.textContent = RSTIL;
    d.head.appendChild(s);
  }
  if (werk) d.documentElement.classList.add('studio-werk');
  const k = c => { const b = d.createElement('div'); b.className = c; d.body.appendChild(b); return b; };
  return { hov: k('studio-hov'), an: k('studio-an') };
}
function rahme(box, el, wort) {
  if (!box) return;
  const r = el && el.isConnected ? el.getBoundingClientRect() : null;
  if (!r || (!r.width && !r.height)) { box.style.display = 'none'; return false; }
  const d = el.ownerDocument, w = d.defaultView, wirt = el.closest('dialog') || d.body;
  if (box.parentNode !== wirt) wirt.appendChild(box);
  let x = r.left + w.scrollX, y = r.top + w.scrollY;
  if (wirt !== d.body) { const wr = wirt.getBoundingClientRect(); x = r.left - wr.left + wirt.scrollLeft - wirt.clientLeft; y = r.top - wr.top + wirt.scrollTop - wirt.clientTop; }
  Object.assign(box.style, { display: 'block', left: x + 'px', top: y + 'px', width: r.width + 'px', height: r.height + 'px' });
  box.dataset.w = wort || '';
  return true;
}
function passe(fr, wirt, soll) {
  const tu = () => {
    if (wirt.classList.contains('handy')) { fr.style.cssText = ''; try { fr.contentDocument.documentElement.style.setProperty('--studio-k', '1'); } catch (e) {} return; }
    const w = wirt.clientWidth, hoch = wirt.clientHeight;
    if (!w) return;
    const k = Math.min(1, w / soll);
    fr.style.cssText = `position:absolute;left:0;top:0;width:${k < 1 ? soll : w}px;height:${hoch / k}px;transform-origin:0 0;transform:${k < 1 ? `scale(${k})` : 'none'}`;
    try { fr.contentDocument.documentElement.style.setProperty('--studio-k', (1 / k).toFixed(3)); } catch (e) {}
  };
  fr.addEventListener('load', tu);
  new ResizeObserver(tu).observe(wirt);
  tu();
  return tu;
}
function zeig(el) {
  for (let p = el.parentElement; p; p = p.parentElement) {
    if (p.getAttribute('role') === 'tabpanel' && p.hidden) {  // Reiter der Seite (Speisen/Getränke, Zimmer/Tisch) öffnen
      const d = p.ownerDocument, tab = d.getElementById(p.getAttribute('aria-labelledby') || '');
      if (tab) { [...tab.parentElement.querySelectorAll('[role=tab]')].forEach(t => { t.setAttribute('aria-selected', t === tab ? 'true' : 'false'); const pn = d.getElementById(t.getAttribute('aria-controls') || ''); if (pn) pn.hidden = t !== tab; }); }
      else p.hidden = false;
    } else if (p.hidden) p.hidden = false;
    if (p.tagName === 'DIALOG' && !p.open) { try { p.showModal(); } catch (e) { p.setAttribute('open', ''); } }
    if (p.tagName === 'DETAILS') p.open = true;
  }
}
function artVon(q, rein) {
  if (!rein) return 'text';
  const k = q[0].split(':')[0];
  return k === 'k' || k === 'kr' ? 'gericht' : k === 'l' ? 'liste' : k === 'seite' ? 'eigene' : k === 'hinweis' ? 'hinweis' : k === 'anlass' ? 'anlass' : 'angabe';
}
const WORT = { gericht: 'Auf der Karte ändern', liste: 'Eintrag bearbeiten', eigene: 'Seite bearbeiten', hinweis: 'Hinweis bearbeiten', anlass: 'Anlass bearbeiten', angabe: 'Angabe ändern', text: 'Text ändern' };
function ziel(d, x, y) {
  const els = d.elementsFromPoint(x, y).filter(e => !/^studio-/.test(e.className));
  if (!els.length) return null;
  let t = els[0].closest('[data-e]') || els.slice(0, 5).find(e => e.matches('[data-e]'));
  const b = els.find(e => e.matches('img[data-b]'));
  if (!t && b) return { art: 'bild', el: b, wort: 'Bild tauschen' };
  if (!t) return null;
  const q = (t.dataset.q || '').split(' ').filter(Boolean), rein = t.hasAttribute('data-rein'), art = artVon(q, rein);
  return { art, el: t, q, wort: WORT[art] };
}
function zielVon(el) {
  const q = (el.dataset.q || '').split(' ').filter(Boolean), rein = el.hasAttribute('data-rein');
  return { art: artVon(q, rein), el, q };
}
function seite(datei) {
  const s = Z.seiten.find(x => x.datei === datei) || Z.seiten[0];
  const gruppen = [...new Set(Z.seiten.map(x => x.gruppe))];
  sicht.innerHTML = `<div class="werk">
    <div class="werk__leiste">
      <a class="rund" href="#/seiten" title="Zurück zu den Seiten" aria-label="Zurück zu den Seiten">${SYM.links}</a>
      <select id="w-seite" aria-label="Seite">${gruppen.map(g => `<optgroup label="${g}">${Z.seiten.filter(x => x.gruppe === g).map(x => `<option value="${h(x.datei)}"${x.datei === s.datei ? ' selected' : ''}>${h(x.name)}</option>`).join('')}</optgroup>`).join('')}</select>
      <button class="rund an" type="button" data-akt="geraet" data-g="rechner" title="Wie am Rechner" aria-label="Wie am Rechner">${SYM.rechner}</button>
      <button class="rund" type="button" data-akt="geraet" data-g="handy" title="Wie am Handy" aria-label="Wie am Handy">${SYM.handy}</button>
      <span class="werk__hin">Klicken Sie in der Seite auf einen Text oder ein Bild. Rechts ändern Sie es und bestätigen mit «Übernehmen».</span>
    </div>
    <div class="werk__buehne" id="w-buehne"><iframe id="w-rahmen" title="${h(s.name)}" src="/entwurf/${encodeURIComponent(s.datei)}?nomotion"></iframe></div>
    <aside class="pruef" id="w-pruef" aria-live="polite"></aside>
  </div>`;
  W = { datei: s.datei, fr: $('#w-rahmen'), sel: null, y: 0, wieder: null };
  W.passe = passe(W.fr, $('#w-buehne'), 1280);
  W.fr.addEventListener('load', werkBereit);
  $('#w-seite').addEventListener('change', ev => { location.hash = '#/seite/' + encodeURIComponent(ev.target.value); });
  pruefLeer();
}
function werkBereit() {
  if (!W) return;
  const d = W.fr.contentDocument;
  if (!d || !d.body) return;
  const w = d.defaultView;
  Object.assign(W, richte(d, true), { sel: null });
  d.addEventListener('mousemove', ev => { const t = ziel(d, ev.clientX, ev.clientY); rahme(W.hov, t && (!W.sel || t.el !== W.sel.el) ? t.el : null, t && t.wort); }, true);
  d.documentElement.addEventListener('mouseleave', () => W && rahme(W.hov, null));
  d.addEventListener('click', ev => {
    if (ev.target.closest && ev.target.closest('a[href]')) ev.preventDefault();
    const t = ziel(d, ev.clientX, ev.clientY);
    if (t) waehle(t);
  }, true);
  d.addEventListener('submit', ev => ev.preventDefault(), true);
  const nach = () => { if (W && W.sel) rahme(W.an, W.sel.el); };
  w.addEventListener('scroll', nach, { passive: true, capture: true });
  w.addEventListener('resize', nach);
  if (W.wieder) {
    const m = W.wieder, el = m.q ? d.querySelector(`[data-q="${m.q}"]`) || d.querySelector(`[data-q~="${m.q}"]`) : m.b ? d.querySelector(`img[data-b="${m.b}"][data-bn="${m.n}"]`) : m.e ? d.querySelector(`[data-e="${m.e}"][data-en="${m.n}"]`) : null;
    W.wieder = null;
    if (el) {
      zeig(el);
      el.scrollIntoView({ block: 'center', inline: 'center' });
      setTimeout(() => {  // nach dem Speichern: Stelle wieder zeigen; Dialoge (Karte, Listen, eigene Seiten) nicht noch einmal öffnen
        if (!W || !el.isConnected) return;
        const t = el.matches('img') ? { art: 'bild', el } : zielVon(el);
        if (['gericht', 'liste', 'eigene', 'hinweis', 'anlass'].includes(t.art)) { W.sel = t; rahme(W.an, el); } else waehle(t);
      }, 150);
      return;
    }
    w.scrollTo(0, W.y);
  }
  pruefLeer();
}
function neuLaden(merk) {
  if (!W) return;
  const w = W.fr.contentWindow;
  W.y = w.scrollY;
  W.wieder = merk || {};
  w.location.reload();
}
function pruefLeer() {
  if (!W) return;
  W.sel = null;
  rahme(W.an, null);
  const hier = Z.aenderungen.filter(c => c.stellen.some(x => x.seite === W.datei));
  $('#w-pruef').innerHTML = `<div class="pruef__leer">${ik('seiten')}<b>Klicken Sie in die Seite.</b><p>Alles, was rot umrandet wird, können Sie ändern.</p>
    <ul><li><b>Text</b>Überschriften, Absätze, Knöpfe</li><li><b>Bild</b>Foto tauschen</li><li><b>Angabe</b>Saison, Zeiten, Preise, Karte</li></ul></div>
    ${hier.length ? `<div class="pruef__offen"><h3>Auf dieser Seite im Entwurf</h3>${hier.slice(0, 6).map(c => `<button type="button" data-id="${h(c.id)}"><b>${h(c.satz)}</b><small>Vorher/Nachher ansehen</small></button>`).join('')}</div>` : ''}`;
  $$('.pruef__offen button').forEach(b => b.addEventListener('click', () => aktAenderung('sehen', b.dataset.id, W.datei)));
}
function waehle(t) {
  if (W.sel && W.sel.orig !== undefined && W.sel.el.isConnected && !W.sel.fertig) spiegel(W.sel, W.sel.orig);
  W.sel = t;
  rahme(W.hov, null);
  rahme(W.an, t.el);
  const tu = {
    text: pruefText, angabe: pruefAngabe, bild: pruefBild,
    gericht: t => { const p = t.q[0].split(':'); pruefLeer(); if (p[0] === 'kr') rubrikFenster(p[1], +p[2]); else gerichtFenster(p[1], +p[2], +p[3], t.q[0]); },
    liste: t => { const [, key, i] = t.q[0].split(':'); pruefLeer(); listeFenster(key, +i); },
    eigene: t => { pruefLeer(); seiteFenster(t.q[0].split(':')[1]); },
    hinweis: () => { location.hash = '#/anlass'; }, anlass: () => { location.hash = '#/anlass'; },
  };
  tu[t.art](t);
}
const woSteht = (n, s) => n > 1 ? `Steht an <b>${n} Stellen</b>${s > 1 ? ` auf <b>${s} Seiten</b>` : ''}.` : '';
function spiegel(t, html) {
  const d = t.el.ownerDocument, alle = t.ueberall ? $$(`[data-e="${t.el.dataset.e}"]:not([data-rein])`, d) : [t.el];
  alle.forEach(e => { e.innerHTML = html; });
  $$(`[data-spiegel] [data-e="${t.el.dataset.e}"][data-en="${t.el.dataset.en}"]`, d).forEach(e => { e.innerHTML = html; });  // unsichtbare Kopien (Schatten, Laufband) folgen sofort mit
  rahme(W.an, t.el);
}
function rein(html) {
  return html.replace(/<div[^>]*>|<p[^>]*>/gi, '<br>').replace(/<\/(div|p)>/gi, '').replace(/\r?\n/g, '<br>').replace(/^(<br>)+/, '').replace(/&nbsp;/g, ' ');
}
function pruefText(t) {
  const el = t.el, hs = el.dataset.e, n = +el.dataset.en, lauf = el.hasAttribute('data-lauf'), m = Z.mehrfach[hs];
  const tag = el.closest('h1,h2,h3,h4,.d1,.d2,.d3') ? 'Überschrift' : el.closest('a,button') ? 'Knopf oder Link' : 'Text';
  const link = el.closest('a[href]'), intern = link && /^[\w\-]+\.html/.test(link.getAttribute('href') || '') ? link.getAttribute('href').split('#')[0] : null;
  t.orig = el.innerHTML;
  t.ueberall = !!m;
  const angaben = t.q.filter(q => Z.felder[q]).map(q => Z.felder[q]);
  $('#w-pruef').innerHTML = `<h2>${tag}</h2>
    <div class="schreib" id="w-schreib" contenteditable="true" spellcheck="true" role="textbox" aria-multiline="true" aria-label="${tag}"></div>
    ${m ? `<div><div class="wahl2" role="group" aria-label="Wo ändern"><button type="button" class="an" data-wo="1">Überall</button><button type="button" data-wo="0">Nur an dieser Stelle</button></div>
      <p class="hinweis" style="margin-top:10px" id="w-wo">${woSteht(m[0], m[1])} Sie ändern alle auf einmal.</p></div>` : ''}
    ${angaben.length ? `<p class="hinweis">In diesem Satz steht eine Angabe, die an vielen Stellen gleich ist: <b>${angaben.map(a => h(a.label)).join(', ')}</b>. Ändern Sie sie besser unter «Saison & Zeiten». Schreiben Sie den Satz hier um, folgt er ihr nicht mehr von selbst.</p>` : ''}
    <div class="pruef__kn"><button class="kn kn--breit" type="button" id="w-ok">Übernehmen${KNI}</button>
      <button class="link" type="button" id="w-ab" style="justify-self:center">Abbrechen</button>
      ${el.hasAttribute('data-neu') ? '<button class="link" type="button" id="w-ur" style="justify-self:center">Ursprünglichen Text zurückholen</button>' : ''}
      ${intern && Z.seiten.some(s => s.datei === intern) ? `<a class="link" href="#/seite/${encodeURIComponent(intern)}" style="justify-self:center">Zur verlinkten Seite wechseln</a>` : ''}</div>`;
  const box = $('#w-schreib');
  box.innerHTML = t.orig.replace(/\s*\n\s*/g, ' ');
  const anfang = rein(box.innerHTML);
  box.addEventListener('input', () => spiegel(t, rein(box.innerHTML)));
  box.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') { ev.preventDefault(); if (!lauf && !ev.metaKey && !ev.ctrlKey) document.execCommand('insertLineBreak'); else if (ev.metaKey || ev.ctrlKey) $('#w-ok').click(); }
  });
  box.addEventListener('paste', ev => { ev.preventDefault(); document.execCommand('insertText', false, (ev.clipboardData || window.clipboardData).getData('text/plain')); });
  $$('.wahl2 button').forEach(b => b.addEventListener('click', () => {
    spiegel(t, t.orig);
    t.ueberall = b.dataset.wo === '1';
    $$('.wahl2 button').forEach(x => x.classList.toggle('an', x === b));
    $('#w-wo').innerHTML = t.ueberall ? `${woSteht(m[0], m[1])} Sie ändern alle auf einmal.` : 'Nur diese eine Stelle ändert sich. Alle anderen bleiben, wie sie sind.';
    spiegel(t, rein(box.innerHTML));
  }));
  $('#w-ab').addEventListener('click', () => { spiegel(t, t.orig); pruefLeer(); });
  const ur = $('#w-ur');
  if (ur) ur.addEventListener('click', async () => {
    try { await aendern({ art: 'text-weg', h: hs, seite: W.datei, n }); t.fertig = true; sag('Der ursprüngliche Text steht wieder da.'); neuLaden({ e: hs, n }); } catch (e) { sag(e.message, true); }
  });
  $('#w-ok').addEventListener('click', async () => {
    const neu = rein(box.innerHTML);
    if (neu === t.orig || neu === anfang) { spiegel(t, t.orig); pruefLeer(); return; }
    try {
      await aendern({ art: 'text', h: hs, seite: W.datei, n, neu, ueberall: t.ueberall, lauf });
      t.fertig = true;
      el.setAttribute('data-neu', '');
      pruefLeer();
      quittung('Text gespeichert', box.textContent.trim().slice(0, 90), { id: t.ueberall ? `t:${hs}||` : `t:${hs}|${W.datei}|${n}`, seite: W.datei });
    } catch (e) { sag(e.message, true); }
  });
  box.focus();
  const sel = getSelection(), r = document.createRange();
  r.selectNodeContents(box);
  r.collapse(false);
  sel.removeAllRanges();
  sel.addRange(r);
}
function feldInput(p, f, id) {
  const typ = f.art === 'datum' ? 'date' : f.art === 'zahl' ? 'number' : f.art === 'mail' ? 'email' : f.art === 'link' ? 'url' : 'text';
  const extra = f.art === 'zahl' ? ' inputmode="numeric" min="0"' : f.art === 'tel' ? ' inputmode="tel"' : '';
  return `<label class="feld" data-p="${p}"><span>${h(f.label)}${f.wert !== f.stand ? '<i class="marke rot">Im Entwurf geändert</i>' : ''}</span><input${id ? ` id="${id}"` : ''} type="${typ}" value="${h(f.wert)}"${extra}>${f.art === 'pdf' ? `<small>${h(f.wert.replace('assets/pdf/', ''))} · <button class="link" type="button" data-pdf="${p}">neue PDF hochladen</button></small>` : f.stellen ? `<small>steht an ${mal(f.stellen, 'Stelle', 'Stellen')} auf ${mal(f.seiten, 'Seite', 'Seiten')}${f.wert !== f.stand ? ` · <button class="link" type="button" data-sehen="f:${p}">vorher/nachher ansehen</button>` : ''}</small>` : f.art === 'link' ? '<small>hinter den Knöpfen der Seite</small>' : ''}</label>`;
}
function pruefAngabe(t) {
  const felder = t.q.map(q => [q, Z.felder[q]]).filter(x => x[1]);
  if (!felder.length) return pruefLeer();
  const f0 = felder[0][1];
  $('#w-pruef').innerHTML = `<h2>${h(f0.gruppe || 'Angabe')}</h2>
    ${felder.map(([q, f]) => feldInput(q, f).replace('<i class="marke rot">Im Entwurf geändert</i>', '')).join('')}
    <p class="hinweis">${woSteht(f0.stellen, f0.seiten) || 'Diese Angabe gilt für die ganze Website.'} Sie ändern sie hier für alle auf einmal.</p>
    <div class="pruef__kn"><button class="kn kn--breit" type="button" id="w-ok">Übernehmen${KNI}</button><button class="link" type="button" id="w-ab" style="justify-self:center">Abbrechen</button>
    <a class="link" href="#/saison" style="justify-self:center">Alle Angaben</a></div>`;
  const ins = $$('#w-pruef input');
  ins.forEach(i => i.addEventListener('keydown', ev => { if (ev.key === 'Enter') $('#w-ok').click(); }));
  $('#w-ab').addEventListener('click', pruefLeer);
  $('#w-ok').addEventListener('click', async () => {
    try {
      const werte = {}, alte = {};
      ins.forEach(i => { const p = i.closest('[data-p]').dataset.p; if (i.value.trim() !== Z.felder[p].wert) { werte[p] = i.value; alte[p] = Z.felder[p].wert; } });
      const ps = Object.keys(werte);
      if (!ps.length) return pruefLeer();
      await aendern({ art: 'fakten', werte });
      quittung(mal(ps.length, 'Angabe', 'Angaben') + ' gespeichert', ps.map(p => Z.felder[p].label).join(', '), { id: 'f:' + ps[0], seite: W.datei, zurueck: { art: 'fakten', werte: alte } });
      neuLaden({ e: t.el.dataset.e, n: t.el.dataset.en });
    } catch (e) { sag(e.message, true); }
  });
  ins[0].focus();
  ins[0].select();
}
function pruefBild(t, neu) {
  const key = t.el.dataset.b, b = Z.bilder.find(x => x.key === key) || { seiten: [], gross: false };
  const sende = async (wert, titel) => { if (await tun({ art: 'bild', key, neu: wert }, { titel, text: mal(b.seiten.length, 'Seite', 'Seiten') + ' betroffen', id: 'b:' + key, seite: W.datei, zurueck: { art: 'bild', key, neu: b.neu || null } })) neuLaden({ b: key, n: t.el.dataset.bn }); };
  if (neu) {
    $('#w-pruef').innerHTML = `<h2>Neues Bild</h2><div class="bildvor"><img src="${h(neu.adresse)}" alt=""></div>
      <p class="hinweis">Es ersetzt das bisherige Bild${b.seiten.length > 1 ? ` auf <b>${b.seiten.length} Seiten</b>` : ''}.${neu.hinweis ? ' ' + h(neu.hinweis) : ''}</p>
      <div class="pruef__kn"><button class="kn kn--breit" type="button" id="w-ok">Bild übernehmen${KNI}</button><button class="link" type="button" id="w-ab" style="justify-self:center">Abbrechen</button></div>`;
    $('#w-ok').addEventListener('click', () => sende(neu.key, 'Bild getauscht'));
    $('#w-ab').addEventListener('click', () => pruefBild(t));
    return;
  }
  $('#w-pruef').innerHTML = `<h2>Bild</h2><div class="bildvor"><img src="${h(t.el.currentSrc || t.el.src)}" alt=""></div>
    <p class="hinweis">${b.seiten.length > 1 ? `Dieses Bild ist auf <b>${b.seiten.length} Seiten</b> zu sehen: ${b.seiten.slice(0, 6).map(s => h(s.name)).join(', ')}. Ein neues Bild ersetzt es überall.` : 'Dieses Bild ist nur auf dieser Seite zu sehen.'}
    ${b.sonder ? ` Als ${b.sonder} wird das neue Foto so vorbereitet wie das bisherige (Dunkel für die Schrift ins Bild gerechnet). Am besten ein Querformat mit mindestens 2400 Pixeln Breite.` : ''}</p>
    <div class="ablage" id="w-ablage" tabindex="0" role="button"><b>Neues Bild wählen</b><span>oder hierher ziehen · JPG, PNG, WebP</span></div>
    ${b.neu ? '<button class="link" type="button" id="w-alt" style="justify-self:center;align-self:center">Ursprüngliches Bild zurückholen</button>' : ''}`;
  ablage($('#w-ablage'), key, r => pruefBild(t, r));
  const alt = $('#w-alt');
  if (alt) alt.addEventListener('click', () => sende(null, 'Ursprüngliches Bild zurückgeholt'));
}

// ---------------------------------------------------------------- Hochladen
function waehleDatei(accept) {
  return new Promise(ok => {
    const i = $('#datei');
    i.value = '';
    i.accept = accept || 'image/jpeg,image/png,image/webp';
    i.onchange = () => { ok(i.files[0] || null); i.accept = 'image/jpeg,image/png,image/webp'; };
    i.click();
  });
}
async function ladeHoch(datei, fuer) {
  if (!datei) return null;
  if (!/^image\/(jpeg|png|webp)$/.test(datei.type)) { sag('Bitte ein JPG, PNG oder WebP wählen.', true); return null; }
  sag('Das Bild wird vorbereitet …');
  try {
    const r = await api('hochladen?fuer=' + encodeURIComponent(fuer || ''), datei, true);
    NEUB[r.key] = r.adresse;
    if (r.hinweis) sag(r.hinweis, true);
    return r;
  } catch (e) { sag(e.message, true); return null; }
}
async function hochladen(fuer) { return ladeHoch(await waehleDatei(), fuer); }
function ablage(el, fuer, dann) {
  const los = async d => { const r = await ladeHoch(d, fuer); if (r) dann(r); };
  el.addEventListener('click', async () => los(await waehleDatei()));
  el.addEventListener('keydown', async ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); los(await waehleDatei()); } });
  el.addEventListener('dragover', ev => { ev.preventDefault(); el.classList.add('drauf'); });
  el.addEventListener('dragleave', () => el.classList.remove('drauf'));
  el.addEventListener('drop', ev => { ev.preventDefault(); el.classList.remove('drauf'); los(ev.dataTransfer.files[0]); });
}
async function pdfHoch(pfad) {
  const d = await waehleDatei('application/pdf,.pdf');
  if (!d) return null;
  if (d.type !== 'application/pdf' && !/\.pdf$/i.test(d.name)) { sag('Bitte eine PDF wählen.', true); return null; }
  sag('Die PDF wird abgelegt …');
  try {
    const r = await api('hochladen?art=pdf&name=' + encodeURIComponent(d.name), d, true);
    if (await tun({ art: 'fakt', pfad, wert: r.pfad }, { titel: 'Karte als PDF ersetzt', text: `${d.name} (${r.kb} kB)`, id: 'f:' + pfad, zurueck: { art: 'fakt', pfad, wert: Z.felder[pfad].wert } })) neuZeichnen();
  } catch (e) { sag(e.message, true); }
}

// ---------------------------------------------------------------- Saison & Zeiten (Angaben in Karten, Speichern je Karte)
const KARTEN_IK = { Saison: 'uhr', 'Öffnungszeiten': 'uhr', 'Kontakt und Adresse': 'haus', Links: 'menue', 'Takt der Chluse': 'tal', 'Feste: die Zahlen': 'glocke' };
const KARTEN_HIN = {
  Saison: 'Saisonschluss und Eröffnung stehen an einer Stelle. Die Seite rechnet daraus selbst: Tage bis zum Schluss, in der Schliesszeit die Eröffnung, gesperrte Tage im Kalender der Anfrage. Der Satz zu Gasternbus und Transport steht auf «Sind wir offen?» und «Der Weg hinunter».',
  'Takt der Chluse': 'Vier Minuten je Stunde: ab wann und bis wann hinauf, ab wann und bis wann hinunter. Die Uhr, die Beispiele und die Anzeige «Jetzt» folgen daraus. Die Worte daneben («Viertel vor bis fünf nach») ändern Sie auf der Startseite per Klick. Die zwei letzten Felder sagen, wann man am Hotel am besten losfährt; daraus rechnet die Seite «Der Weg hinunter» die nächsten Abfahrten.',
  'Feste: die Zahlen': 'Die Zahlen bei den Festen: auf der Startseite, auf «Feste und Gruppen» und in den Sätzen dazu.',
  Links: 'Wohin die Knöpfe führen: Booking.com, die Route, der Fahrplan. Die Karte als PDF laden Sie hier hoch.',
};
function saisonS() {
  const gruppen = [...new Set(Object.values(Z.felder).map(f => f.gruppe))];
  const fuss = '<div class="sichern"><i></i><span></span><button class="link" type="button" data-akt="verwerfen">Verwerfen</button><button class="kn kn--klein" type="button" data-akt="sichern">Speichern' + KNI + '</button></div>';
  sicht.innerHTML = `<div class="in">${kopf('Saison <em>& Zeiten.</em>', 'Jede Angabe gibt es nur einmal. Tragen Sie sie ein und drücken Sie unten an der Karte auf «Speichern». Danach stimmt sie auf jeder Seite: Startseite, Zimmer, Karte, Fuss der Seite, Anfrage.')}
    <div class="raster r-2">${gruppen.map(g => `<section class="blatt haus" data-karte="${h(g)}"><div class="haus__k">${ik(KARTEN_IK[g] || 'uhr')}<h3>${h(g)}</h3></div>
      <div class="haus__t">${KARTEN_HIN[g] ? `<p class="hinweis">${KARTEN_HIN[g]}</p>` : ''}${g === 'Saison' ? '<div class="sosteht"><span>So steht es auf der Seite</span><div></div></div>' : ''}${Object.entries(Z.felder).filter(([, f]) => f.gruppe === g).map(([p, f]) => feldInput(p, f)).join('')}</div>${fuss}</section>`).join('')}</div></div>`;
  const wurzel = sicht.querySelector('.in');
  const pruefe = karte => {
    const anders = $$('.feld', karte).filter(l => { const d = $('input', l).value.trim() !== Z.felder[l.dataset.p].wert; l.classList.toggle('offen', d); return d; });
    const s = $('.sichern', karte), imEntwurf = $$('.feld', karte).filter(l => Z.felder[l.dataset.p].wert !== Z.felder[l.dataset.p].stand).length;
    s.classList.toggle('offen', !!anders.length);
    s.classList.toggle('entwurf', !anders.length && !!imEntwurf);
    $$('button', s).forEach(b => { b.disabled = !anders.length; });
    $('span', s).textContent = anders.length ? mal(anders.length, 'Angabe', 'Angaben') + ' noch nicht gespeichert' : imEntwurf ? `Gespeichert, ${imEntwurf} im Entwurf` : 'Nichts geändert';
    const so = $('.sosteht div', karte);
    if (so) { const w = p => { const i = $(`[data-p="saison.${p}"] input`, karte); return i ? i.value.trim() : ''; }; so.textContent = `Offen bis ${tagText(w('schluss'))} · Eröffnung ${w('auf').slice(0, 4)}: ${tagText(w('auf'))} (${w('vorbehalt')})`; }
    return anders;
  };
  $$('.haus', wurzel).forEach(pruefe);
  offen = () => !!$('.feld.offen', sicht);
  wurzel.addEventListener('input', ev => { const k = ev.target.closest('.haus'); if (k) pruefe(k); });
  wurzel.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.matches('.feld input')) { ev.preventDefault(); const k = ev.target.closest('.haus'); if (pruefe(k).length) $('[data-akt="sichern"]', k).click(); } });
  wurzel.addEventListener('click', async ev => {
    const s = ev.target.closest('[data-sehen]'), pd = ev.target.closest('[data-pdf]'), b = ev.target.closest('[data-akt]'), karte = b && b.closest('.haus');
    if (s) { ev.preventDefault(); const c = Z.aenderungen.find(x => x.id === s.dataset.sehen); if (c) vergleich(c); return; }
    if (pd) { ev.preventDefault(); pdfHoch(pd.dataset.pdf); return; }
    if (!karte) return;
    if (b.dataset.akt === 'verwerfen') { $$('.feld', karte).forEach(l => { $('input', l).value = Z.felder[l.dataset.p].wert; }); pruefe(karte); return; }
    if (b.dataset.akt === 'sichern') {
      const anders = pruefe(karte), werte = {}, alte = {};
      anders.forEach(l => { werte[l.dataset.p] = $('input', l).value; alte[l.dataset.p] = Z.felder[l.dataset.p].wert; });
      const namen = anders.map(l => Z.felder[l.dataset.p].label), erste = Object.keys(werte)[0];
      b.disabled = true;
      const ok = await tun({ art: 'fakten', werte }, { titel: mal(anders.length, 'Angabe', 'Angaben') + ' gespeichert', text: `${karte.dataset.karte} · ${namen.slice(0, 3).join(', ')}${namen.length > 3 ? ' …' : ''}`, id: 'f:' + erste, zurueck: { art: 'fakten', werte: alte } });
      b.disabled = false;
      if (ok) { offen = null; neuZeichnen(); }
    }
  });
}

// ---------------------------------------------------------------- Listen (Zimmerarten, Zimmer, Exklusiv, Package, Sauna, Nicht/Dafür, Produzenten, Etappen, Häuser)
const feldWert = (x, f) => f[2] === 'wahl' ? wahlName(f[3], x[f[0]]) : f[2] === 'schalter' ? (x[f[0]] ? f[1] : '') : String(x[f[0]] ?? '');
function wahlName(ref, i) { const g = Z.listen[ref]; const x = g && g.liste.filter(y => !y.aus)[+i]; return x ? listeName(x, g) : ''; }
const listeName = (x, g) => { const f = g.felder.find(f => f[2] === 'text' && x[f[0]]) || g.felder.find(f => f[2] === 'lang' && x[f[0]]); return f ? String(x[f[0]]).slice(0, 80) : ''; };
function listeStatus(g) {
  const norm = l => JSON.stringify(l.map(x => Object.fromEntries(g.felder.map(f => [f[0], x[f[0]] ?? '']))));
  const a = g.stand, b = g.liste, na = a.map(x => listeName(x, g)), nb = b.map(x => listeName(x, g)), gleich = a.length === b.length;
  return { status: b.map((x, i) => { const j = na.includes(nb[i]) ? na.indexOf(nb[i]) : (gleich && !nb.includes(na[i]) ? i : -1); return j < 0 ? 'neu' : (norm([a[j]]) !== norm([x]) ? 'anders' : ''); }), weg: a.filter((y, i) => !nb.includes(na[i]) && !(gleich && !na.includes(nb[i]))) };
}
function listeBlatt(key) {
  const g = Z.listen[key];
  if (!g) return '';
  const st = listeStatus(g), bildF = g.felder.find(f => f[2] === 'bild'), zweit = g.felder.filter(f => !['bild', 'schalter'].includes(f[2]) && f[0] !== g.felder.find(x => x[2] === 'text')[0]).slice(0, 3);
  const schalt = g.felder.find(f => f[2] === 'schalter');
  const zeile = (x, i) => `<div class="gz${BLITZ === key + ':' + i ? ' blitz' : ''}" data-i="${i}">
      ${(() => { const eig = bildF && x[bildF[0]] ? bildadr(x[bildF[0]]) : '', lb = eig || (window.listenBild ? window.listenBild(key, i, listeName(x, g)) : ''); return bildF || lb ? `<button class="gz__b" type="button" data-akt="edit" tabindex="-1" aria-hidden="true">${lb ? `<img src="${lb}" alt="" loading="lazy" decoding="async">` : SYM.bild}</button>` : ''; })()}
      <button class="gz__t" type="button" data-akt="edit" title="Bearbeiten"><b>${h(listeName(x, g)) || '<i>ohne Namen</i>'}${schalt && x[schalt[0]] ? `<em>${h(schalt[1])}</em>` : ''}</b>${zweit.map(f => feldWert(x, f)).filter(Boolean).length ? `<span>${h(zweit.map(f => feldWert(x, f)).filter(Boolean).join(' · '))}</span>` : ''}</button>
      <span class="gz__s">${st.status[i] === 'neu' ? '<i class="marke rot">Neu im Entwurf</i>' : st.status[i] === 'anders' ? '<i class="marke rot">Geändert</i>' : ''}</span><span class="gz__p"></span>
      <div class="gz__r"><button class="rund" type="button" data-akt="hoch" aria-label="Nach oben"${i === 0 ? ' disabled' : ''}>${SYM.hoch}</button><button class="rund" type="button" data-akt="runter" aria-label="Nach unten"${i === g.liste.length - 1 ? ' disabled' : ''}>${SYM.runter}</button>
        <button class="rund" type="button" data-akt="weg" title="Entfernen" aria-label="Entfernen">${SYM.korb}</button><button class="kn kn--klein kn--linie" type="button" data-akt="edit">Bearbeiten</button></div></div>`;
  return `<section class="blatt gruppe" data-l="${h(key)}"><div class="gruppe__k"><h3>${h(g.label)}<span>${String(g.liste.length).padStart(2, '0')}</span></h3>${g.eigen ? '<i class="marke rot">Im Entwurf geändert</i>' : ''}<button class="kn kn--klein" type="button" data-akt="neu">${h(g.wort)} hinzufügen${KNI}</button></div>
    ${g.hinweis ? `<p class="gruppe__hin">${h(g.hinweis)}</p>` : ''}
    <div class="zeilen">${g.liste.map(zeile).join('')}${st.weg.map(y => `<div class="gz weg"><span class="gz__t"><b>${h(listeName(y, g))}</b></span><span class="gz__s"><i class="marke grau">Entfernt, noch nicht veröffentlicht</i></span><span class="gz__p"></span><div class="gz__r"><button class="kn kn--klein kn--linie" type="button" data-akt="hol" data-n="${h(listeName(y, g))}">Zurückholen</button></div></div>`).join('')}
      ${g.liste.length || st.weg.length ? '' : '<p class="gz leer">Noch nichts in dieser Liste.</p>'}</div>
    ${g.eigen ? '<div class="gruppe__f"><button class="link" type="button" data-akt="std">Alle Änderungen in dieser Liste zurücknehmen</button></div>' : ''}</section>`;
}
function platzNach(stand, y, liste, name) {
  for (let k = stand.indexOf(y) - 1; k >= 0; k--) {
    const j = liste.findIndex(x => name(x) === name(stand[k]));
    if (j >= 0) return j + 1;
  }
  return 0;
}
function listenKlick(ev) {
  const b = ev.target.closest('[data-akt]'), sec = b && b.closest('[data-l]');
  if (!sec) return false;
  const key = sec.dataset.l, g = Z.listen[key], z = b.closest('.gz'), i = z && z.dataset.i !== undefined ? +z.dataset.i : -1, akt = b.dataset.akt;
  const alt = g.liste.map(x => ({ ...x })), l = alt.map(x => ({ ...x })), nm = x => listeName(x, g);
  const sende = async (liste, titel, text) => { if (await tun({ art: 'liste', key, liste }, { titel, text, id: 'l:' + key, zurueck: { art: 'liste', key, liste: alt } })) neuZeichnen(); };
  if (akt === 'neu') listeFenster(key);
  else if (akt === 'edit') listeFenster(key, i);
  else if (akt === 'std') frage('Änderungen <em>zurücknehmen?</em>', `«${g.label}» steht danach wieder so da wie auf der Website.`, 'Zurücknehmen', async () => { await aendern({ art: 'verwerfen', id: 'l:' + key }); sag('Zurückgenommen: ' + g.label); neuZeichnen(); });
  else if (akt === 'hol') { const y = g.stand.find(x => nm(x) === b.dataset.n), pos = platzNach(g.stand, y, l, nm); l.splice(pos, 0, { ...y }); BLITZ = key + ':' + pos; sende(l, 'Wieder da', nm(y)); }
  else if (akt === 'hoch' && i > 0) { [l[i - 1], l[i]] = [l[i], l[i - 1]]; BLITZ = key + ':' + (i - 1); sende(l, 'Reihenfolge gespeichert', nm(l[i - 1])); }
  else if (akt === 'runter' && i < l.length - 1) { [l[i + 1], l[i]] = [l[i], l[i + 1]]; BLITZ = key + ':' + (i + 1); sende(l, 'Reihenfolge gespeichert', nm(l[i + 1])); }
  else if (akt === 'weg') frage('Eintrag <em>entfernen?</em>', `«${nm(alt[i])}» verschwindet aus «${g.label}». Bis zum Veröffentlichen können Sie ihn zurückholen.`, 'Entfernen', async () => { l.splice(i, 1); await sende(l, 'Entfernt', nm(alt[i])); });
  else return false;
  return true;
}
function listenSeite(titel, text, keys, link) {
  sicht.innerHTML = `<div class="in">${kopf(titel, text, link ? `<a class="kn kn--linie" href="/entwurf/${link}" target="_blank" rel="noopener">Seite im Entwurf ansehen</a>` : '')}${keys.map(listeBlatt).join('')}</div>`;
  const blitz = $('.gz.blitz', sicht);
  BLITZ = null;
  if (blitz) blitz.scrollIntoView({ block: 'center' });
  sicht.querySelector('.in').addEventListener('click', listenKlick);
}
/* Der Schreibtisch: eine einzelne Liste des Hauses (#/liste/<Schlüssel>), z. B. «Der Weg hinunter» oder «Das Tal: die Orte der Karte» */
function listeS(key) { const g = Z.listen[key]; if (!g) return uebersicht(); listenSeite(h(g.label).replace(/^(\S+)(.*)$/, (m, a, c) => c ? `${a}<em>${c}</em>` : `<em>${a}</em>`), h(g.hinweis || ''), [key], ''); }
function zimmerS() { listenSeite('Zimmer <em>& Preise.</em>', 'Die Zimmerarten mit ihren Fotos, jede Preiszeile, das Hotel exklusiv, das Package mit dem Waldhotel Doldenhorn und die Zahlen der Sauna. Jede Änderung wird bestätigt und steht danach auf der Zimmer-Seite und auf der Startseite.', ['zimmerarten', 'zimmer', 'exklusiv', 'package', 'sauna'], 'zimmer.html'); }
function hausS() { listenSeite('Das <em>Haus.</em>', 'Was die Startseite über das Haus erzählt: «Was Sie hier nicht finden», der Weg hinauf in vier Etappen, die Produzenten der Küche und die Häuser der Familie im Fuss jeder Seite.', ['nicht', 'dafuer', 'etappen', 'produzenten', 'haeuser'], 'index.html'); }
function feldH(f, wert, id) {
  const [k, label, art, ref] = f;
  if (art === 'lang') return `<label class="feld"><span>${h(label)}</span><textarea id="${id}" rows="5">${h(wert ?? '')}</textarea></label>`;
  if (art === 'zahl') return `<label class="feld"><span>${h(label)}</span><input id="${id}" inputmode="numeric" value="${h(String(wert ?? ''))}"></label>`;
  if (art === 'link') return `<label class="feld"><span>${h(label)}</span><input id="${id}" inputmode="url" value="${h(wert ?? '')}" placeholder="https://…"></label>`;
  if (art === 'wahl') { const g = Z.listen[ref]; return `<div class="feld" data-wahl="${k}"><span>${h(label)}</span>${chipsH('w-' + k, (g ? g.liste.filter(x => !x.aus) : []).map((x, i) => [i, listeName(x, g)]), wert ?? 0)}</div>`; }
  if (art === 'schalter') return `<div class="feld" data-schalter="${k}">${schalter(id, !!wert, label)}</div>`;
  if (art === 'bild') return `<div class="feld" data-bildfeld="${k}"><span>${h(label)}</span><div class="fotowahl">${wert ? `<img src="${bildadr(wert)}" alt="">` : `<div class="fotowahl__leer">${ik('bild')}</div>`}<div><button class="kn kn--klein kn--linie" type="button" data-akt="foto">${wert ? 'Anderes Foto' : 'Foto wählen'}</button>${wert ? '<button class="link" type="button" data-akt="ohnefoto">Ohne Foto</button>' : ''}</div></div></div>`;
  return `<label class="feld"><span>${h(label)}</span><input id="${id}" maxlength="400" value="${h(wert ?? '')}"></label>`;
}
function listeFenster(key, i) {
  const g = Z.listen[key], neu = i === undefined, st = neu ? {} : { ...g.liste[i] };
  if (neu) g.felder.forEach(f => { if (f[2] === 'wahl') st[f[0]] = 0; if (f[2] === 'schalter') st[f[0]] = true; });
  const wort = g.wort || 'Eintrag';
  fenster(`<h2>${neu ? `${h(wort)} <em>hinzufügen.</em>` : `${h(wort)} <em>bearbeiten.</em>`}</h2><p class="form2__ort" style="margin-top:6px">${h(g.label)}</p>
    <div class="form1">${g.felder.map((f, n) => feldH(f, st[f[0]], 'lf-' + n)).join('')}</div>
    <div class="fehler" id="lf-f" role="alert"></div>
    <div class="fenster__kn"><button class="kn kn--linie" type="button" data-zu>Abbrechen</button><button class="kn" type="button" id="lf-ok">${neu ? 'Hinzufügen' : 'Speichern'}${KNI}</button></div>`, true);
  const f = $('#fenster');
  const lies = () => { g.felder.forEach((fd, n) => { const el = $('#lf-' + n); if (!el) return; st[fd[0]] = fd[2] === 'schalter' ? el.checked : el.value; }); };
  f.bei = ev => { const n = ev.detail.name.replace(/^w-/, ''); st[n] = +ev.detail.wert; };
  f.onclick = async ev => {
    const b = ev.target.closest('[data-akt]');
    if (!b) return;
    const bf = g.felder.find(x => x[2] === 'bild');
    if (b.dataset.akt === 'foto') { const r = await hochladen(''); if (r) { lies(); st[bf[0]] = r.key; $(`[data-bildfeld="${bf[0]}"]`).outerHTML = feldH(bf, st[bf[0]], ''); } }
    if (b.dataset.akt === 'ohnefoto') { lies(); st[bf[0]] = ''; $(`[data-bildfeld="${bf[0]}"]`).outerHTML = feldH(bf, '', ''); }
  };
  $('#lf-ok').addEventListener('click', async ev => {
    lies();
    const fe = $('#lf-f');
    fe.textContent = '';
    if (!listeName(st, g)) { fe.textContent = 'Bitte mindestens das erste Feld ausfüllen.'; return; }
    const alt = g.liste.map(x => ({ ...x })), liste = alt.map(x => ({ ...x }));
    if (neu) liste.push(st); else liste[i] = st;
    ev.target.disabled = true;
    const ok = await tun({ art: 'liste', key, liste }, { titel: neu ? `${wort} hinzugefügt` : `${wort} gespeichert`, text: `${listeName(st, g)} · ${g.label}`, id: 'l:' + key, zurueck: { art: 'liste', key, liste: alt } });
    ev.target.disabled = false;
    if (!ok) return;
    fensterZu();
    BLITZ = key + ':' + (neu ? liste.length - 1 : i);
    const ziel = location.hash.startsWith('#/liste/') ? location.hash : ['zimmerarten', 'zimmer', 'exklusiv', 'package', 'sauna'].includes(key) ? '#/zimmer' : '#/hausS';   // eine einzelne Liste (Der Schreibtisch) bleibt stehen
    if (W) neuLaden({}); else if (location.hash !== ziel) location.hash = ziel; else neuZeichnen();
  });
  const erstes = $('#lf-0');
  if (erstes) erstes.focus();
}

// ---------------------------------------------------------------- Karte: Speisen und Getränke, Rubrik für Rubrik
const preisVon = g => g.zw ? '' : g.pr ? g.pr.map(([a, p]) => (a ? a + ' ' : '') + p).join(' / ') : (g.w || []).filter(Boolean).join(' / ');
const zeileVon = g => g.zw ? '' : [g.z, g.en, g.zus].filter(Boolean).join(' · ');
function karteStatus(reihe) {
  const k = Z.karte[reihe], a = k.stand, b = k.liste, ida = a.map(r => r.id);
  const norm = g => JSON.stringify(g);
  return b.map(r => {
    const q = a[ida.indexOf(r.id)];
    if (!q) return { rubrik: 'neu', zeilen: r.l.map(() => 'neu'), weg: [] };
    const na = q.l.map(x => x.n);
    return { rubrik: (q.t !== r.t || (q.zus || '') !== (r.zus || '') || JSON.stringify(q.kopf || []) !== JSON.stringify(r.kopf || [])) ? 'anders' : '',
      zeilen: r.l.map(x => { const y = q.l[na.indexOf(x.n)]; return !y ? 'neu' : norm(x) !== norm(y) ? 'anders' : ''; }), weg: q.l.filter(y => !r.l.some(x => x.n === y.n)) };
  });
}
function karteS(reihe) {
  reihe = REIHEN[reihe] ? reihe : 'speisen';
  const k = Z.karte[reihe], st = karteStatus(reihe), wegR = k.stand.filter(q => !k.liste.some(r => r.id === q.id));
  /* Bilder in jeder Liste (Robert 19.10.2026): ein Gericht zeigt nur ein Foto, das es wirklich zeigt; sonst trägt die Rubrik ihr Bild */
  const kb = (art, n) => window.kartenBild ? window.kartenBild(reihe, art, n) : '';
  const zeile = (g, i, gi, s, letzte) => `<div class="gz${g.aus ? ' aus' : ''}${g.zw ? ' zw' : ''}${BLITZ === gi + ':' + g.n ? ' blitz' : ''}" data-i="${i}">
      ${kb('z', g.n) ? `<button class="gz__b" type="button" data-akt="edit" tabindex="-1" aria-hidden="true"><img src="${kb('z', g.n)}" alt="" loading="lazy" decoding="async"></button>` : ''}
      <button class="gz__t" type="button" data-akt="edit" title="Bearbeiten"><b>${h(g.n)}</b>${zeileVon(g) ? `<span>${h(zeileVon(g))}</span>` : ''}</button>
      <span class="gz__s">${g.aus ? '<i class="marke grau">Ausgeblendet</i>' : ''}${s === 'neu' ? '<i class="marke rot">Neu im Entwurf</i>' : s === 'anders' ? '<i class="marke rot">Geändert</i>' : ''}</span>
      <span class="gz__p">${h(preisVon(g))}</span>
      <div class="gz__r"><button class="rund" type="button" data-akt="hoch" title="Nach oben" aria-label="Nach oben"${i === 0 ? ' disabled' : ''}>${SYM.hoch}</button><button class="rund" type="button" data-akt="runter" title="Nach unten" aria-label="Nach unten"${letzte ? ' disabled' : ''}>${SYM.runter}</button>
        <button class="rund" type="button" data-akt="aus" title="${g.aus ? 'Wieder zeigen' : 'Vorübergehend ausblenden'}" aria-label="${g.aus ? 'Wieder zeigen' : 'Ausblenden'}">${g.aus ? SYM.augezu : SYM.auge}</button>
        <button class="rund" type="button" data-akt="weg" title="Von der Karte nehmen" aria-label="Von der Karte nehmen">${SYM.korb}</button>
        <button class="kn kn--klein kn--linie" type="button" data-akt="edit">Bearbeiten</button></div></div>`;
  const rubrik = (r, gi) => `<section class="blatt gruppe${r.aus ? ' aus' : ''}" data-g="${gi}"><div class="gruppe__k">${kb('g', r.t) ? `<span class="ug__b" aria-hidden="true"><img src="${kb('g', r.t)}" alt="" loading="lazy" decoding="async"></span>` : ''}<h3>${h(r.t)}<span>${String(r.l.filter(x => !x.aus && !x.zw).length).padStart(2, '0')}</span>${r.zus ? `<small>${h(r.zus)}</small>` : ''}${r.kopf && r.kopf.length ? `<small>Spalten: ${h(r.kopf.join(' · '))}</small>` : ''}</h3>
        ${st[gi].rubrik === 'neu' ? '<i class="marke rot">Neue Rubrik</i>' : st[gi].rubrik === 'anders' ? '<i class="marke rot">Rubrik geändert</i>' : ''}${r.aus ? '<i class="marke grau">Ausgeblendet</i>' : ''}
        <div class="gruppe__r" style="margin-left:auto"><button class="rund" type="button" data-akt="r-hoch" title="Rubrik nach oben" aria-label="Rubrik nach oben"${gi === 0 ? ' disabled' : ''}>${SYM.hoch}</button><button class="rund" type="button" data-akt="r-runter" title="Rubrik nach unten" aria-label="Rubrik nach unten"${gi === k.liste.length - 1 ? ' disabled' : ''}>${SYM.runter}</button>
          <button class="rund" type="button" data-akt="r-aus" title="${r.aus ? 'Rubrik wieder zeigen' : 'Rubrik ausblenden'}" aria-label="Rubrik ausblenden">${r.aus ? SYM.augezu : SYM.auge}</button><button class="rund" type="button" data-akt="r-weg" title="Rubrik von der Karte nehmen" aria-label="Rubrik entfernen">${SYM.korb}</button><button class="rund" type="button" data-akt="r-edit" title="Rubrik umbenennen" aria-label="Rubrik bearbeiten">${SYM.stift}</button></div>
        <button class="kn kn--klein" type="button" data-akt="neu" style="margin-left:0">Zeile hinzufügen${KNI}</button></div>
      <div class="zeilen">${r.l.map((g, i) => zeile(g, i, gi, st[gi].zeilen[i], i === r.l.length - 1)).join('')}${st[gi].weg.map(y => `<div class="gz weg"><span class="gz__t"><b>${h(y.n)}</b></span><span class="gz__s"><i class="marke grau">Entfernt, noch nicht veröffentlicht</i></span><span class="gz__p"></span>
        <div class="gz__r"><button class="kn kn--klein kn--linie" type="button" data-akt="hol" data-n="${h(y.n)}">Zurückholen</button></div></div>`).join('')}
        ${r.l.length || st[gi].weg.length ? '' : '<p class="gz leer">Noch nichts in dieser Rubrik.</p>'}</div></section>`;
  sicht.innerHTML = `<div class="in">${kopf('Ässe u <em>trinke.</em>', 'Ihre Karte 2026, Rubrik für Rubrik. Mit «Bearbeiten» öffnen Sie eine Zeile, mit «Zeile hinzufügen» legen Sie eine neue an, mit dem Stift ändern Sie die Rubrik. Jede Änderung wird bestätigt und steht danach auf «Ässe u trinke», der Auszug auch auf der Startseite. Die PDF der Karte laden Sie unten getrennt hoch.',
      `<a class="kn kn--linie" href="/entwurf/essen.html" target="_blank" rel="noopener">Karte im Entwurf ansehen</a><button class="kn" type="button" data-akt="neu-oben">Zeile hinzufügen${KNI}</button>`)}
    <div class="reihenwahl">${Object.entries(REIHEN).map(([r, n]) => `<a class="${r === reihe ? 'an' : ''}" href="#/karte/${r}">${n}<span>${mal(Z.karte[r].liste.reduce((a, g) => a + g.l.filter(x => !x.zw).length, 0), 'Zeile', 'Zeilen')}</span></a>`).join('')}<button class="kn kn--klein kn--linie" type="button" data-akt="r-neu" style="margin-left:auto;color:var(--tinte)">Neue Rubrik</button></div>
    ${k.geaendert ? '<p class="hinweis" style="margin:8px 0 0"><b>Im Entwurf geändert.</b> <button class="link" type="button" data-akt="std">Alle Änderungen an den ' + REIHEN[reihe] + ' zurücknehmen</button></p>' : ''}
    ${TAFEL ? '<p class="hinweis tafel-hin">Zeilen, Preise, Rubriken und PDF der Karte pflegt Die Tafel (Knopf oben im Schreibtisch). Hier steht die Karte nur zum Ansehen.</p>' : ''}
    ${k.liste.map(rubrik).join('')}
    ${wegR.map(q => `<section class="blatt gruppe"><div class="gruppe__k"><h3 style="text-decoration:line-through;color:var(--leise)">${h(q.t)}</h3><i class="marke grau">Rubrik entfernt, noch nicht veröffentlicht</i><button class="kn kn--klein kn--linie" type="button" data-akt="r-hol" data-id="${h(q.id)}" style="margin-left:auto">Zurückholen</button></div></section>`).join('')}
    <h2 class="reiheT">Karte als PDF</h2>
    <section class="blatt"><p class="gruppe__hin" style="padding:0">Hinter dem Knopf «Karte 2026 als PDF» auf «Ässe u trinke». Laden Sie die neue Karte hoch, der Knopf zeigt danach auf die neue Datei.</p>
      <div class="sichern offen sichern--still" style="margin-top:14px"><i></i><span>${h((Z.felder['link.pdf'] || { wert: '' }).wert.replace('assets/pdf/', ''))}</span><button class="kn kn--klein" type="button" data-akt="pdf">Neue PDF hochladen${KNI}</button></div></section></div>`;
  const blitz = $('.gz.blitz', sicht);
  BLITZ = null;
  if (blitz) blitz.scrollIntoView({ block: 'center' });
  sicht.querySelector('.in').addEventListener('click', ev => {
    const b = ev.target.closest('[data-akt]');
    if (!b) return;
    if (TAFEL) { sag('Zeilen, Preise, Rubriken und PDF der Karte pflegt Die Tafel (Knopf oben im Schreibtisch).'); return; }
    const akt = b.dataset.akt, alt = JSON.parse(JSON.stringify(k.liste)), l = JSON.parse(JSON.stringify(k.liste));
    const sende = async (rubriken, titel, text) => { if (await tun({ art: 'karte', reihe, rubriken }, { titel, text, id: 'k:' + reihe, zurueck: { art: 'karte', reihe, rubriken: alt } })) neuZeichnen(); };
    if (akt === 'neu-oben') return gerichtFenster(reihe, undefined, undefined);
    if (akt === 'pdf') return pdfHoch('link.pdf');
    if (akt === 'r-neu') return rubrikFenster(reihe);
    if (akt === 'std') return frage('Änderungen <em>zurücknehmen?</em>', `Die ${REIHEN[reihe]} stehen danach wieder so da wie auf der Website.`, 'Zurücknehmen', async () => { await aendern({ art: 'verwerfen', id: 'k:' + reihe }); sag('Zurückgenommen: ' + REIHEN[reihe]); neuZeichnen(); });
    if (akt === 'r-hol') { const q = k.stand.find(x => x.id === b.dataset.id); l.splice(platzNach(k.stand, q, l, x => x.id), 0, JSON.parse(JSON.stringify(q))); return sende(l, 'Rubrik wieder da', q.t); }
    const sec = b.closest('.gruppe[data-g]');
    if (!sec) return;
    const gi = +sec.dataset.g, r = l[gi], z = b.closest('.gz'), i = z && z.dataset.i !== undefined ? +z.dataset.i : -1;
    if (akt === 'neu') return gerichtFenster(reihe, gi);
    if (akt === 'edit') return gerichtFenster(reihe, gi, i);
    if (akt === 'r-edit') return rubrikFenster(reihe, gi);
    if (akt === 'r-hoch' && gi > 0) { [l[gi - 1], l[gi]] = [l[gi], l[gi - 1]]; return sende(l, 'Reihenfolge gespeichert', `${r.t} steht jetzt weiter oben`); }
    if (akt === 'r-runter' && gi < l.length - 1) { [l[gi + 1], l[gi]] = [l[gi], l[gi + 1]]; return sende(l, 'Reihenfolge gespeichert', `${r.t} steht jetzt weiter unten`); }
    if (akt === 'r-aus') { r.aus = !r.aus; return sende(l, r.aus ? 'Rubrik ausgeblendet' : 'Rubrik wieder sichtbar', r.t); }
    if (akt === 'r-weg') return frage('Rubrik von der Karte <em>nehmen?</em>', `«${r.t}» mit ${mal(r.l.length, 'Zeile', 'Zeilen')} verschwindet von der Karte. Bis zum Veröffentlichen können Sie sie zurückholen.`, 'Rubrik entfernen', async () => { l.splice(gi, 1); await sende(l, 'Rubrik entfernt', r.t); });
    if (akt === 'hol') { const q = k.stand.find(x => x.id === r.id), y = q && q.l.find(x => x.n === b.dataset.n); if (!y) return; r.l.splice(platzNach(q.l, y, r.l, x => x.n), 0, { ...y }); BLITZ = gi + ':' + y.n; return sende(l, 'Wieder auf der Karte', y.n); }
    if (akt === 'hoch' && i > 0) { [r.l[i - 1], r.l[i]] = [r.l[i], r.l[i - 1]]; BLITZ = gi + ':' + r.l[i - 1].n; return sende(l, 'Reihenfolge gespeichert', `${r.l[i - 1].n} steht jetzt weiter oben`); }
    if (akt === 'runter' && i < r.l.length - 1) { [r.l[i + 1], r.l[i]] = [r.l[i], r.l[i + 1]]; BLITZ = gi + ':' + r.l[i + 1].n; return sende(l, 'Reihenfolge gespeichert', `${r.l[i + 1].n} steht jetzt weiter unten`); }
    if (akt === 'aus') { r.l[i].aus = !r.l[i].aus; BLITZ = gi + ':' + r.l[i].n; return sende(l, r.l[i].aus ? 'Ausgeblendet' : 'Wieder sichtbar', r.l[i].aus ? `${r.l[i].n} steht vorerst nicht auf der Karte` : r.l[i].n); }
    if (akt === 'weg') return frage('Von der Karte <em>nehmen?</em>', `«${r.l[i].n}» verschwindet aus ${r.t}. Bis zum Veröffentlichen können Sie es mit einem Klick zurückholen.`, 'Von der Karte nehmen', async () => { const n = r.l[i].n; r.l.splice(i, 1); await sende(l, 'Von der Karte genommen', n); });
  });
}
function gerichtFenster(reihe, gi, i, qMerk) {
  const k = Z.karte[reihe], neu = i === undefined, sp = reihe === 'speisen';
  let grW = gi === undefined ? 0 : gi, pos = 'ende';
  const st = neu ? (sp ? { n: '', z: '', en: '', pr: [['', '']], aus: false } : { n: '', zus: '', w: [], aus: false, zw: false }) : JSON.parse(JSON.stringify(k.liste[gi].l[i]));
  if (!sp && !neu) st.zw = !!st.zw;
  if (!sp && !st.w) st.w = [];
  const rubrikVon = () => k.liste[grW] || k.liste[0];
  fenster(`<h2>${neu ? 'Neue <em>Zeile.</em>' : 'Zeile <em>bearbeiten.</em>'}</h2>
    <div class="form2"><div class="form2__l">
      ${neu ? `<div class="feld"><span>Rubrik</span>${chipsH('rubrik', k.liste.map((r, n) => [n, r.t]), grW)}</div>` : `<p class="form2__ort">${h(REIHEN[reihe])} · ${h(k.liste[gi].t)}</p>`}
      ${sp ? '' : `<div class="feld"><span>Art</span>${chipsH('zw', [['0', 'Getränk mit Preis'], ['1', 'Zwischenzeile (z. B. «Weisse»)']], st.zw ? '1' : '0')}</div>`}
      <label class="feld"><span>Name</span><input id="g-n" maxlength="140" value="${h(st.n)}" placeholder="${sp ? 'z. B. Tomatesalat' : 'z. B. Rugenbräu'}"></label>
      <div id="g-rest"></div>
      ${neu ? `<div class="feld"><span>Platz in der Rubrik</span>${chipsH('pos', [['ende', 'Am Ende'], ['anfang', 'Ganz oben']], pos)}</div>` : ''}
      ${schalter('g-an', !st.aus, 'Auf der Karte zeigen')}
    </div><div class="form2__r"><span class="mono leise">So steht es auf der Karte</span><div id="g-vor"></div></div></div>
    <div class="fehler" id="g-f" role="alert"></div>
    <div class="fenster__kn"><button class="kn kn--linie" type="button" data-zu>Abbrechen</button><button class="kn" type="button" id="g-ok">${neu ? 'Auf die Karte setzen' : 'Speichern'}${KNI}</button></div>`, true);
  const f = $('#fenster');
  const liesRest = () => {
    if (sp) { st.z = ($('#g-z') || {}).value || ''; st.en = ($('#g-en') || {}).value || ''; st.pr = $$('.preisz', f).map(z => [$('.a', z).value.trim(), $('.p', z).value.trim()]); }
    else if (!st.zw) { st.zus = ($('#g-zus') || {}).value || ''; st.w = $$('[data-w]', f).map(x => x.value.trim()); }
  };
  const restH = () => {
    if (sp) $('#g-rest').innerHTML = `<label class="feld"><span>Zeile darunter (freiwillig)</span><input id="g-z" maxlength="300" value="${h(st.z)}" placeholder="z. B. Mit Lauchgemüse"></label>
      <label class="feld"><span>Englische Zeile (freiwillig)</span><input id="g-en" maxlength="300" value="${h(st.en)}" placeholder="z. B. Bowl of tomato salad"></label>
      <div class="feld"><span>Preise in Franken</span><div id="g-preise" style="display:grid;gap:8px">${(st.pr.length ? st.pr : [['', '']]).map(([a, p]) => `<div class="preisz"><input class="a" maxlength="40" value="${h(a)}" placeholder="Angabe, z. B. pro Person (freiwillig)"><input class="p" maxlength="40" inputmode="decimal" value="${h(p)}" placeholder="z. B. 16.00"><button class="rund" type="button" data-akt="pweg" aria-label="Preis entfernen">${SYM.zu}</button></div>`).join('')}</div>
      <small><button class="link" type="button" data-akt="pneu">Weiterer Preis (z. B. kleine Portion)</button></small></div>`;
    else if (st.zw) $('#g-rest').innerHTML = '<p class="hinweis">Eine Zwischenzeile hat keinen Preis. Sie teilt die Rubrik, zum Beispiel in Weisse und Rote.</p>';
    else {
      const kopf = rubrikVon().kopf || [], n = Math.max(kopf.length, 1);
      const felder = kopf.length ? kopf.map((kp, j) => [kp, j]) : [['Mass (freiwillig, z. B. 33cl)', 0], ['Preis', 1]];
      $('#g-rest').innerHTML = `<label class="feld"><span>Zusatz (freiwillig)</span><input id="g-zus" maxlength="120" value="${h(st.zus || '')}" placeholder="z. B. mit und ohne"></label>
        <div class="feld"><span>${kopf.length ? 'Preise je Spalte' : 'Mass und Preis'}</span><div class="raster" style="grid-template-columns:repeat(${felder.length},minmax(0,1fr))">${felder.map(([lab, j]) => `<label class="feld"><span>${h(lab)}</span><input data-w="${j}" maxlength="40" value="${h((st.w || [])[j] || '')}" placeholder="${kopf.length ? 'z. B. 5.50 oder leer' : j ? 'z. B. 5.50' : 'z. B. 33cl'}"></label>`).join('')}</div>
        ${kopf.length ? '<small>Leer lassen, wo es diese Grösse nicht gibt.</small>' : '<small>Ohne Mass steht nur der Preis da (z. B. Aperol Spritz 12.00).</small>'}</div>`;
      void n;
    }
  };
  const vorH = () => {
    const r = rubrikVon(), g = { ...st, n: $('#g-n').value.trim() || 'Name' };
    let z;
    if (g.zw) z = `<div class="zw">${h(g.n)}</div>`;
    else if (sp) z = `<div class="gang"><b>${h(g.n)}</b><em>${(g.pr || []).filter(x => x[1]).map(([a, p]) => (a ? `<small>${h(a)}</small>` : '') + h(p)).join('') || '<small>Preis</small>'}</em>${g.z || g.en ? `<span>${h([g.z, g.en].filter(Boolean).join(' · '))}</span>` : ''}</div>`;
    else { const kopf = r.kopf || []; z = `<div class="gang"><b>${h(g.n)}${g.zus ? `<br><small style="font-weight:400;color:var(--leise)">${h(g.zus)}</small>` : ''}</b><em>${kopf.length ? kopf.map((kp, j) => (g.w || [])[j] ? `<small>${h(kp)}</small>${h(g.w[j])}<br>` : '').join('') : (g.w || []).filter(Boolean).map((w, j, arr) => (arr.length === 2 && j === 0 ? `<small>${h(w)}</small>` : h(w))).join('')}</em></div>`; }
    $('#g-vor').innerHTML = `<div class="vk${$('#g-an').checked ? '' : ' aus'}"><h3>${h(r.t)}${r.zus ? `<small>${h(r.zus)}</small>` : ''}</h3>${z}</div><p class="vor__h">${$('#g-an').checked ? h(REIHEN[reihe]) + ' · ' + h(r.t) : 'Ausgeblendet: steht vorerst nicht auf der Karte.'}</p>`;
  };
  restH(); vorH();
  f.oninput = () => { liesRest(); vorH(); $('#g-f').textContent = ''; };
  f.bei = ev => {
    const { name, wert } = ev.detail;
    liesRest();
    if (name === 'rubrik') { grW = +wert; if (!sp) restH(); }
    if (name === 'zw') { st.zw = wert === '1'; restH(); }
    if (name === 'pos') pos = wert;
    vorH();
  };
  f.onclick = ev => {
    const b = ev.target.closest('[data-akt]');
    if (!b) return;
    liesRest();
    if (b.dataset.akt === 'pneu') { st.pr.push(['', '']); restH(); $$('.preisz .p', f).pop().focus(); }
    if (b.dataset.akt === 'pweg') { st.pr.splice($$('.preisz', f).indexOf(b.closest('.preisz')), 1); if (!st.pr.length) st.pr = [['', '']]; restH(); }
    vorH();
  };
  $('#g-ok').addEventListener('click', async ev => {
    liesRest();
    const n = $('#g-n').value.trim(), fe = $('#g-f');
    if (!n) { fe.textContent = 'Bitte einen Namen eintragen.'; $('#g-n').focus(); return; }
    const alt = JSON.parse(JSON.stringify(k.liste)), l = JSON.parse(JSON.stringify(k.liste)), r = l[grW];
    if (r.l.some((x, j) => x.n.toLowerCase() === n.toLowerCase() && (neu || j !== i))) { fe.textContent = `«${n}» steht schon in ${r.t}. Bitte einen anderen Namen wählen.`; return; }
    let eintrag;
    if (sp) { const pr = st.pr.filter(x => x[1]); if (!pr.length) { fe.textContent = 'Bitte mindestens einen Preis eintragen.'; return; } eintrag = { n, z: st.z.trim(), en: st.en.trim(), pr, aus: !$('#g-an').checked }; }
    else if (st.zw) eintrag = { n, zw: true, aus: !$('#g-an').checked };
    else { if (!(st.w || []).some(Boolean)) { fe.textContent = 'Bitte einen Preis eintragen.'; return; } eintrag = { n, zus: (st.zus || '').trim(), w: st.w, aus: !$('#g-an').checked }; }
    if (neu) { if (pos === 'anfang') r.l.unshift(eintrag); else r.l.push(eintrag); } else r.l[i] = eintrag;
    if (!neu && JSON.stringify(eintrag) === JSON.stringify(alt[gi].l[i])) { fensterZu(); sag('Nichts geändert, nichts gespeichert.'); return; }
    ev.target.disabled = true;
    const ok = await tun({ art: 'karte', reihe, rubriken: l }, { titel: neu ? 'Zeile hinzugefügt' : 'Zeile gespeichert', text: `${n} · ${r.t}`, id: 'k:' + reihe, zurueck: { art: 'karte', reihe, rubriken: alt } });
    ev.target.disabled = false;
    if (!ok) return;
    fensterZu();
    BLITZ = grW + ':' + n;
    if (W) neuLaden(qMerk ? { q: qMerk } : {}); else if (location.hash !== '#/karte/' + reihe) location.hash = '#/karte/' + reihe; else neuZeichnen();
  });
  $('#g-n').focus();
}
function rubrikFenster(reihe, gi) {
  const k = Z.karte[reihe], neu = gi === undefined, sp = reihe === 'speisen', r = neu ? { t: '', zus: '', kopf: [], l: [], aus: false } : JSON.parse(JSON.stringify(k.liste[gi]));
  let spalten = sp ? 0 : (r.kopf || []).length, pos = 'ende';
  fenster(`<h2>${neu ? 'Neue <em>Rubrik.</em>' : 'Rubrik <em>bearbeiten.</em>'}</h2><p class="form2__ort" style="margin-top:6px">${h(REIHEN[reihe])}</p>
    <div class="form1">
      <label class="feld"><span>Name der Rubrik</span><input id="r-t" maxlength="80" value="${h(r.t)}" placeholder="${sp ? 'z. B. Suppä' : 'z. B. Bier'}"></label>
      ${sp ? `<label class="feld"><span>Zusatz unter dem Namen (freiwillig)</span><input id="r-zus" maxlength="200" value="${h(r.zus || '')}" placeholder="z. B. ab 2 Personen"></label>`
      : `<div class="feld"><span>Spalten</span>${chipsH('spalten', [['0', 'Mass und Preis je Zeile'], ['1', 'Eine Spalte (z. B. 75cl)'], ['3', 'Drei Spalten (z. B. 1dl · 2dl · 5dl)']], spalten)}<div id="r-kopf" class="raster" style="margin-top:8px"></div><small>Die Spaltenköpfe stehen über den Zeilen der Rubrik.</small></div>`}
      ${neu ? `<div class="feld"><span>Platz</span>${chipsH('pos', [['ende', 'Am Ende der Karte'], ['anfang', 'Ganz oben']], pos)}</div>` : ''}
    </div>
    <div class="fehler" id="r-f" role="alert"></div>
    <div class="fenster__kn"><button class="kn kn--linie" type="button" data-zu>Abbrechen</button><button class="kn" type="button" id="r-ok">${neu ? 'Rubrik anlegen' : 'Speichern'}${KNI}</button></div>`);
  const f = $('#fenster');
  const kopfH = () => { const el = $('#r-kopf'); if (!el) return; el.style.gridTemplateColumns = `repeat(${Math.max(spalten, 1)},minmax(0,1fr))`; el.innerHTML = spalten ? Array.from({ length: spalten }, (_, j) => `<input data-k="${j}" maxlength="20" value="${h((r.kopf || [])[j] || '')}" placeholder="z. B. ${['1dl', '2dl', '5dl'][j]}">`).join('') : ''; };
  kopfH();
  f.bei = ev => { if (ev.detail.name === 'spalten') { r.kopf = $$('[data-k]', f).map(x => x.value.trim()); spalten = +ev.detail.wert; kopfH(); } if (ev.detail.name === 'pos') pos = ev.detail.wert; };
  $('#r-ok').addEventListener('click', async ev => {
    const t = $('#r-t').value.trim(), fe = $('#r-f');
    if (!t) { fe.textContent = 'Bitte einen Namen eintragen.'; return; }
    const alt = JSON.parse(JSON.stringify(k.liste)), l = JSON.parse(JSON.stringify(k.liste));
    const eintrag = { ...r, t };
    if (sp) eintrag.zus = $('#r-zus').value.trim(); else { eintrag.kopf = spalten ? $$('[data-k]', f).map(x => x.value.trim()) : []; if (spalten && eintrag.kopf.some(x => !x)) { fe.textContent = 'Bitte jeden Spaltenkopf ausfüllen.'; return; } }
    if (neu) { delete eintrag.id; if (pos === 'anfang') l.unshift(eintrag); else l.push(eintrag); } else l[gi] = eintrag;
    ev.target.disabled = true;
    const ok = await tun({ art: 'karte', reihe, rubriken: l }, { titel: neu ? 'Rubrik angelegt' : 'Rubrik gespeichert', text: `${t} · ${REIHEN[reihe]}`, id: 'k:' + reihe, zurueck: { art: 'karte', reihe, rubriken: alt } });
    ev.target.disabled = false;
    if (!ok) return;
    fensterZu();
    if (W) neuLaden({}); else if (location.hash !== '#/karte/' + reihe) location.hash = '#/karte/' + reihe; else neuZeichnen();
  });
  $('#r-t').focus();
}

// ---------------------------------------------------------------- Anlass & Hinweis
function anlassS() {
  const a = Z.anlass, hw = Z.hinweis;
  const seitenOpt = Z.seiten.map(s => `<option value="${h(s.datei)}"${hw.link === s.datei ? ' selected' : ''}>${h(s.name)}</option>`).join('');
  sicht.innerHTML = `<div class="in">${kopf('Anlass <em>& Hinweis.</em>', 'Zwei Dinge, die sich oft ändern: der Kasten für einen Anlass oben auf «Ässe u trinke» (Wildabend, Fondueplausch) und ein Hinweis für Gäste unten auf jeder Seite (Strasse gesperrt, Bus fährt nicht, Betriebsferien). Beide verschwinden nach ihrem Datum von selbst.')}
    <div class="raster r-2">
    <section class="blatt" data-teil="anlass"><h3 style="margin-bottom:6px">Anlass</h3><div class="form1">
      ${schalter('an-an', a.an, 'Anlass zeigen')}
      <div class="raster r-2"><label class="feld"><span>Datum</span><input id="an-datum" type="date" value="${h(a.datum)}"></label><label class="feld"><span>Zeit</span><input id="an-zeit" maxlength="40" value="${h(a.zeit)}" placeholder="z. B. ab 18:00"></label></div>
      <label class="feld"><span>Name des Anlasses</span><input id="an-titel" maxlength="80" value="${h(a.titel)}" placeholder="z. B. Wildabend"></label>
      <label class="feld"><span>Was es gibt</span><textarea id="an-was" rows="2" maxlength="300" placeholder="z. B. Vorspeisen, Salate, Spezialitäten vom Hirsch …">${h(a.was)}</textarea></label>
      <label class="feld"><span>Preis</span><input id="an-preis" maxlength="120" value="${h(a.preis)}" placeholder="z. B. CHF 67.00 (Kinder ab 3 Jahren CHF 3.00 pro Jahr)"></label>
      <label class="feld"><span>Wie man sich anmeldet</span><input id="an-wie" maxlength="200" value="${h(a.wie)}" placeholder="z. B. Reservation erforderlich Tel 033 675 81 81"></label>
      <div class="feld"><span>So sieht es aus</span><div class="anvor" id="an-vor"></div></div>
      <p class="hinweis">Nach dem Datum nimmt die Seite den Kasten von selbst weg. Für den nächsten Anlass tragen Sie hier einfach das neue Datum ein.</p>
      <div class="sichern offen sichern--still"><i></i><span id="an-stand"></span><button class="kn kn--klein" type="button" id="an-ok">Speichern${KNI}</button></div>
    </div></section>
    <section class="blatt" data-teil="hinweis"><h3 style="margin-bottom:6px">Hinweis für Gäste</h3><div class="form1">
      ${schalter('hw-an', hw.an, 'Hinweis zeigen')}
      <label class="feld"><span>Text</span><textarea id="hw-text" rows="2" maxlength="300" placeholder="z. B. Die Naturstrasse ist bis Freitag gesperrt. Wir holen Sie in Kandersteg ab, rufen Sie uns an.">${h(hw.text)}</textarea></label>
      <div class="raster r-2"><label class="feld"><span>Zeigen ab (freiwillig)</span><input id="hw-von" type="date" value="${h(hw.von)}"></label><label class="feld"><span>Zeigen bis (freiwillig)</span><input id="hw-bis" type="date" value="${h(hw.bis)}"></label></div>
      <div class="raster r-2"><label class="feld"><span>Link (freiwillig)</span><select id="hw-link"><option value="">Kein Link</option>${seitenOpt}</select></label><label class="feld"><span>Beschriftung des Links</span><input id="hw-lt" maxlength="60" value="${h(hw.linktext)}" placeholder="Mehr"></label></div>
      <div class="feld"><span>So sieht es aus</span><div class="hwvor" id="hw-vor"></div></div>
      <p class="hinweis">Der Streifen liegt unten am Rand jeder Seite. Gäste können ihn wegklicken.</p>
      <div class="sichern offen sichern--still"><i></i><span id="hw-stand"></span><button class="kn kn--klein" type="button" id="hw-ok">Speichern${KNI}</button></div>
    </div></section></div></div>`;
  const anVor = () => {
    const an = $('#an-an').checked, d = $('#an-datum').value, m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
    const MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'], TG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const dt = m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
    $('#an-vor').className = 'anvor' + (an && m && $('#an-titel').value.trim() ? '' : ' aus');
    $('#an-vor').innerHTML = `<div class="anvor__tag"><b>${dt ? dt.getDate() : '–'}.</b><span>${dt ? MON[dt.getMonth()] + ' ' + dt.getFullYear() : 'Datum'}<br>${dt ? TG[dt.getDay()] : ''} ${h($('#an-zeit').value)}</span></div><div><h4>${h($('#an-titel').value.trim() || 'Name des Anlasses')}</h4><p>${h([$('#an-was').value.trim(), $('#an-preis').value.trim()].filter(Boolean).join(' · '))}</p><p>${h($('#an-wie').value.trim())}</p></div>`;
    $('#an-stand').textContent = an && m && $('#an-titel').value.trim() ? `Steht bis ${tagText(d)} oben auf «Ässe u trinke»` : 'Ausgeschaltet, kein Kasten auf der Seite';
  };
  const hwVor = () => { const t = $('#hw-text').value.trim(), lt = $('#hw-lt').value.trim() || 'Mehr', an = $('#hw-an').checked; $('#hw-vor').className = 'hwvor' + (an && t ? '' : ' aus'); $('#hw-vor').innerHTML = `<i class="punkt"></i><p>${h(t || 'Ihr Hinweis …')}${$('#hw-link').value ? ` <a>${h(lt)}</a>` : ''}</p>`; $('#hw-stand').textContent = an && t ? 'Wird unten auf jeder Seite gezeigt' : 'Ausgeschaltet, nichts zu sehen'; };
  anVor(); hwVor();
  sicht.querySelector('[data-teil="anlass"]').addEventListener('input', anVor);
  sicht.querySelector('[data-teil="hinweis"]').addEventListener('input', hwVor);
  $('#an-ok').addEventListener('click', async () => {
    const neu = { an: $('#an-an').checked, datum: $('#an-datum').value, zeit: $('#an-zeit').value, titel: $('#an-titel').value, was: $('#an-was').value, preis: $('#an-preis').value, wie: $('#an-wie').value };
    if (await tun({ art: 'anlass', anlass: neu }, { titel: neu.an ? 'Anlass gespeichert' : 'Anlass ausgeschaltet', text: neu.titel.trim() ? `${neu.titel.trim()} · ${tagText(neu.datum)}` : '', id: 'x:anlass', zurueck: { art: 'anlass', anlass: a } })) neuZeichnen();
  });
  $('#hw-ok').addEventListener('click', async () => {
    const neu = { an: $('#hw-an').checked, text: $('#hw-text').value, von: $('#hw-von').value, bis: $('#hw-bis').value, link: $('#hw-link').value, linktext: $('#hw-lt').value };
    if (await tun({ art: 'hinweis', hinweis: neu }, { titel: neu.an && neu.text.trim() ? 'Hinweis gespeichert' : 'Hinweis ausgeschaltet', text: neu.text.trim().slice(0, 80), id: 'h:hinweis', zurueck: { art: 'hinweis', hinweis: hw } })) neuZeichnen();
  });
}

// ---------------------------------------------------------------- Bilder
function bilder(filter) {
  const wahl = [['', 'Alle']].concat(Z.seiten.map(s => [s.datei, s.name]));
  const liste = Z.bilder.filter(b => !filter || b.seiten.some(s => s.datei === filter));
  sicht.innerHTML = `<div class="in">${kopf('Bil<em>der.</em>', 'Jedes Foto der Website. Klicken Sie auf ein Bild, wählen Sie ein neues und bestätigen Sie. Es ändert sich dann überall, wo es zu sehen ist. Grosse Flächenbilder (Startbild, Fenster, Seitenköpfe) werden beim Hochladen so vorbereitet wie das bisherige.')}
    <div class="filter">${wahl.map(([d, n]) => `<button type="button" data-f="${h(d)}" class="${(filter || '') === d ? 'an' : ''}">${h(n)}</button>`).join('')}</div>
    <div class="mauer">${liste.map(b => `<button class="bk" type="button" data-key="${h(b.key)}"><img src="${b.neu ? h(b.adresse) : '/studio/mini/' + encodeURIComponent(b.key) + '.webp'}" data-ersatz="${h(b.adresse)}" alt="" loading="lazy" decoding="async">${b.neu ? '<i>Getauscht</i>' : ''}${b.sonder ? `<u>${h(b.sonder)}</u>` : ''}<span>${mal(b.seiten.length, 'Seite', 'Seiten')}</span><em>Tauschen</em></button>`).join('')}</div></div>`;
  sicht.querySelector('.in').addEventListener('click', ev => {
    const f = ev.target.closest('[data-f]'), k = ev.target.closest('[data-key]');
    if (f) location.hash = '#/bilder' + (f.dataset.f ? '/' + encodeURIComponent(f.dataset.f) : '');
    if (k) bildFenster(k.dataset.key);
  });
}
function bildFenster(key, neu) {
  const b = Z.bilder.find(x => x.key === key);
  if (!b) return;
  fenster(`<h2>Bild <em>tauschen.</em></h2>
    ${neu ? `<div class="vn vn--bild"><div class="alt"><span>Bisher</span><img src="${h(b.adresse)}" alt=""></div><svg viewBox="0 0 22 22"><path d="M3 11h15M13 6l5 5-5 5"/></svg><div class="neu"><span>Neu</span><img src="${h(neu.adresse)}" alt=""></div></div>
      <p>Das neue Bild ersetzt das bisherige auf ${b.seiten.length > 1 ? `<b>${b.seiten.length} Seiten</b>: ${b.seiten.slice(0, 6).map(s => h(s.name)).join(', ')}` : `der Seite <b>${h(b.seiten[0].name)}</b>`}.${neu.hinweis ? ' ' + h(neu.hinweis) : ''}</p>
      <div class="fenster__kn"><button class="kn kn--linie" type="button" data-zu>Abbrechen</button><button class="kn kn--linie" type="button" id="f-anders">Anderes Bild</button><button class="kn" type="button" id="f-ok">Bild übernehmen${KNI}</button></div>`
    : `<div class="bz"><div class="bz__b"><img src="${h(b.adresse)}" alt=""></div>
      <div><p style="margin:0"><b>Zu sehen auf</b></p><ul>${b.seiten.slice(0, 8).map(s => `<li>${h(s.name)}${s.zahl > 1 ? ` (${s.zahl} ×)` : ''}</li>`).join('')}</ul>
        ${b.was ? `<p class="hinweis" style="margin-top:14px">${h(b.was)}</p>` : ''}
        ${b.sonder ? `<p class="hinweis" style="margin-top:14px">Dieses Foto ist ein ${b.sonder}. Ein neues Bild wird genauso vorbereitet (Dunkel für die Schrift ins Bild gerechnet). Am besten ein Querformat mit mindestens 2400 Pixeln Breite.</p>` : ''}
        <div class="ablage" id="f-ablage" tabindex="0" role="button" style="margin-top:16px"><b>Neues Bild wählen</b><span>oder hierher ziehen · JPG, PNG, WebP</span></div>
        ${b.neu ? '<p style="margin-top:14px;text-align:center"><button class="link" type="button" id="f-alt">Ursprüngliches Bild zurückholen</button></p>' : ''}</div></div>`}`, true);
  const sende = async (wert, titel) => {
    if (await tun({ art: 'bild', key, neu: wert }, { titel, text: mal(b.seiten.length, 'Seite', 'Seiten') + ' betroffen', id: 'b:' + key, zurueck: { art: 'bild', key, neu: b.neu || null } })) { fensterZu(); neuZeichnen(); }
  };
  if (neu) {
    $('#f-ok').addEventListener('click', () => sende(neu.key, 'Bild getauscht'));
    $('#f-anders').addEventListener('click', async () => { const r = await hochladen(key); if (r) bildFenster(key, r); });
  } else {
    ablage($('#f-ablage'), key, r => bildFenster(key, r));
    const alt = $('#f-alt');
    if (alt) alt.addEventListener('click', () => sende(null, 'Ursprüngliches Bild zurückgeholt'));
  }
}

// ---------------------------------------------------------------- Menü & eigene Seiten
function menueS() {
  const nav = Z.nav, bekannt = Z.seiten.map(s => [s.datei, s.name]).concat(Object.entries(Z.eigene_seiten).map(([k, p]) => [k + '.html', p.titel]));
  const name = hf => (bekannt.find(([d]) => d === hf) || [hf, hf])[1];
  sicht.innerHTML = `<div class="in">${kopf('Menü <em>& Seiten.</em>', 'Das Hauptmenü oben auf jeder Seite und Ihre eigenen Seiten. Eine neue Seite bekommt Foto, Einleitung und Abschnitte und kann ins Menü, zum Beispiel «Wandern» oder «Winter».', `<button class="kn" type="button" data-akt="seite-neu">Neue Seite${KNI}</button>`)}
    <h2 class="zw" style="margin-top:0">Hauptmenü</h2>
    <section class="blatt gruppe" data-nav><div class="gruppe__k"><h3>Menüpunkte<span>${String(nav.filter(x => !x.aus).length).padStart(2, '0')}</span></h3><button class="kn kn--klein" type="button" data-akt="nav-neu">Menüpunkt hinzufügen${KNI}</button></div>
      <div class="zeilen">${nav.map((x, i) => `<div class="gz gz--nav${x.aus ? ' aus' : ''}" data-i="${i}">${window.seitenBild && window.seitenBild(x.h) ? `<span class="gz__b" aria-hidden="true"><img src="${window.seitenBild(x.h)}" alt="" loading="lazy" decoding="async"></span>` : ''}<span class="gz__t"><input class="n" value="${h(x.t)}" maxlength="40" aria-label="Beschriftung"><span>${h(name(x.h))}</span></span><span class="gz__s"></span><span class="gz__p"></span>
        <div class="gz__r"><button class="rund" type="button" data-akt="hoch" aria-label="Nach oben"${i === 0 ? ' disabled' : ''}>${SYM.hoch}</button><button class="rund" type="button" data-akt="runter" aria-label="Nach unten"${i === nav.length - 1 ? ' disabled' : ''}>${SYM.runter}</button><button class="rund" type="button" data-akt="aus" aria-label="${x.aus ? 'Zeigen' : 'Ausblenden'}" title="${x.aus ? 'Im Menü zeigen' : 'Aus dem Menü nehmen'}">${x.aus ? SYM.augezu : SYM.auge}</button></div></div>`).join('')}</div>
      <div class="gruppe__f"><span class="leise" style="font-size:13.5px">Die Beschriftung ändern Sie direkt in der Zeile.</span><div class="sichern offen sichern--still" style="margin-left:auto"><i></i><span>Menü</span><button class="kn kn--klein" type="button" data-akt="nav-ok">Speichern${KNI}</button></div></div></section>
    <h2 class="zw">Eigene Seiten<span>${String(Object.keys(Z.eigene_seiten).length).padStart(2, '0')}</span></h2>
    <div class="raster r-4">${Object.entries(Z.eigene_seiten).map(([sl, p]) => `<button class="sk" type="button" data-akt="seite" data-slug="${h(sl)}"><span class="sk__b">${p.bild ? `<img src="${bildadr(p.bild)}" alt="">` : ''}</span><span class="sk__t"><b>${h(p.titel)}</b><span>${sl}.html${Z.nav.some(x => x.h === sl + '.html' && !x.aus) ? ' · im Menü' : ''}</span></span></button>`).join('')}
      <button class="pk--neu" type="button" data-akt="seite-neu"><i>+</i><b>Neue Seite</b><span>mit Foto, Text und Abschnitten</span></button></div></div>`;
  const wurzel = sicht.querySelector('.in');
  const liesNav = () => $$('[data-nav] .gz').map(z => ({ t: $('.n', z).value.trim(), h: nav[+z.dataset.i].h, aus: z.classList.contains('aus') }));
  wurzel.addEventListener('click', async ev => {
    const b = ev.target.closest('[data-akt]');
    if (!b) return;
    const akt = b.dataset.akt, z = b.closest('.gz');
    if (akt === 'seite-neu') return seiteFenster();
    if (akt === 'seite') return seiteFenster(b.dataset.slug);
    if (akt === 'nav-neu') {
      const frei = bekannt.filter(([d]) => !nav.some(x => x.h === d));
      fenster(`<h2>Menüpunkt <em>hinzufügen.</em></h2><label class="feld" style="margin-top:18px"><span>Seite</span><select id="nv-h">${frei.map(([d, n]) => `<option value="${h(d)}">${h(n)}</option>`).join('')}</select></label><label class="feld" style="margin-top:14px"><span>Beschriftung im Menü</span><input id="nv-t" maxlength="40"></label>
        <div class="fenster__kn"><button class="kn kn--linie" type="button" data-zu>Abbrechen</button><button class="kn" type="button" id="nv-ok">Hinzufügen${KNI}</button></div>`);
      $('#nv-h').addEventListener('change', () => { $('#nv-t').value = name($('#nv-h').value); });
      $('#nv-t').value = frei.length ? name(frei[0][0]) : '';
      $('#nv-ok').addEventListener('click', async () => { const l = liesNav().concat([{ t: $('#nv-t').value.trim() || name($('#nv-h').value), h: $('#nv-h').value, aus: false }]); if (await tun({ art: 'nav', liste: l }, { titel: 'Menüpunkt hinzugefügt', text: l[l.length - 1].t, zurueck: { art: 'nav', liste: nav } })) { fensterZu(); neuZeichnen(); } });
      return;
    }
    const l = liesNav(), i = z ? +z.dataset.i : -1;
    if (akt === 'hoch' && i > 0) [l[i - 1], l[i]] = [l[i], l[i - 1]];
    else if (akt === 'runter' && i >= 0 && i < l.length - 1) [l[i + 1], l[i]] = [l[i], l[i + 1]];
    else if (akt === 'aus' && i >= 0) l[i].aus = !l[i].aus;
    else if (akt !== 'nav-ok') return;
    if (await tun({ art: 'nav', liste: l }, { titel: 'Menü gespeichert', text: l.filter(x => !x.aus).map(x => x.t).join(' · '), zurueck: { art: 'nav', liste: nav } })) neuZeichnen();
  });
}
function seiteFenster(slug) {
  const neu = !slug, p0 = neu ? null : Z.eigene_seiten[slug];
  const st = neu ? { titel: '', h1: '', intro: '', beschr: '', bild: null, im_menue: true, abschnitte: [{ u: '', t: '', b: null }] } : JSON.parse(JSON.stringify(p0));
  if (!neu) st.im_menue = Z.nav.some(x => x.h === slug + '.html' && !x.aus);
  fenster(`<h2>${neu ? 'Neue <em>Seite.</em>' : 'Seite <em>bearbeiten.</em>'}</h2>${neu ? '' : `<p class="form2__ort" style="margin-top:6px">${h(slug)}.html</p>`}
    <div class="form1">
      <div class="raster r-2"><label class="feld"><span>Titel der Seite</span><input id="ps-titel" maxlength="80" value="${h(st.titel)}" placeholder="z. B. Wandern"></label><label class="feld"><span>Grosse Überschrift</span><input id="ps-h1" maxlength="120" value="${h(st.h1)}" placeholder="Leer = Titel der Seite"></label></div>
      <label class="feld"><span>Einleitung</span><textarea id="ps-intro" rows="3" maxlength="600">${h(st.intro)}</textarea></label>
      <div class="feld" id="ps-bild"></div>
      <div class="feld"><span>Abschnitte</span><div id="ps-abs"></div><button class="link" type="button" data-akt="abs-neu" style="justify-self:start;margin-top:8px">Abschnitt hinzufügen</button></div>
      ${schalter('ps-menue', st.im_menue, 'Im Hauptmenü zeigen')}
      <label class="feld"><span>Beschreibung bei Google (freiwillig)</span><input id="ps-beschr" maxlength="320" value="${h(st.beschr)}"></label>
    </div>
    <div class="fehler" id="ps-f" role="alert"></div>
    <div class="fenster__kn">${neu ? '' : '<button class="link" type="button" id="ps-weg" style="margin-right:auto">Seite löschen</button>'}<button class="kn kn--linie" type="button" data-zu>Abbrechen</button><button class="kn" type="button" id="ps-ok">${neu ? 'Seite anlegen' : 'Speichern'}${KNI}</button></div>`, true);
  const f = $('#fenster');
  const lies = () => { st.titel = $('#ps-titel').value.trim(); st.h1 = $('#ps-h1').value.trim(); st.intro = $('#ps-intro').value; st.beschr = $('#ps-beschr').value.trim(); st.im_menue = $('#ps-menue').checked; $$('.abs', f).forEach((a, i) => { st.abschnitte[i].u = $('.abs-u', a).value.trim(); st.abschnitte[i].t = $('.abs-t', a).value; }); };
  const mal2 = () => {
    $('#ps-bild').innerHTML = `<span>Foto im Seitenkopf</span><div class="fotowahl">${st.bild ? `<img src="${bildadr(st.bild)}" alt="">` : `<div class="fotowahl__leer">${ik('bild')}</div>`}<div><button class="kn kn--klein kn--linie" type="button" data-akt="foto">${st.bild ? 'Anderes Foto' : 'Foto wählen'}</button>${st.bild ? '<button class="link" type="button" data-akt="ohnefoto">Ohne Foto</button>' : ''}</div></div>`;
    $('#ps-abs').innerHTML = st.abschnitte.map((a, i) => `<div class="abs" data-i="${i}"><div class="abs__k"><b>Abschnitt ${i + 1}</b><button class="link" type="button" data-akt="abs-weg" data-i="${i}">Entfernen</button></div><input class="abs-u" maxlength="120" value="${h(a.u)}" placeholder="Überschrift"><textarea class="abs-t" rows="4" placeholder="Text. Eine Leerzeile beginnt einen neuen Absatz.">${h(a.t)}</textarea>
      <div class="abs__b">${a.b ? `<img src="${bildadr(a.b)}" alt="">` : ''}<button class="link" type="button" data-akt="abs-foto" data-i="${i}">${a.b ? 'Anderes Foto' : 'Foto zum Abschnitt'}</button>${a.b ? `<button class="link" type="button" data-akt="abs-ohne" data-i="${i}">Ohne Foto</button>` : ''}</div></div>`).join('');
  };
  mal2();
  f.onclick = async ev => {
    const b = ev.target.closest('[data-akt]');
    if (!b) return;
    const akt = b.dataset.akt, i = +b.dataset.i;
    lies();
    if (akt === 'foto') { const r = await hochladen(''); if (r) st.bild = r.key; }
    else if (akt === 'ohnefoto') st.bild = null;
    else if (akt === 'abs-neu') st.abschnitte.push({ u: '', t: '', b: null });
    else if (akt === 'abs-weg') st.abschnitte.splice(i, 1);
    else if (akt === 'abs-foto') { const r = await hochladen(''); if (r) st.abschnitte[i].b = r.key; }
    else if (akt === 'abs-ohne') st.abschnitte[i].b = null;
    else return;
    mal2();
  };
  const weg = $('#ps-weg');
  if (weg) weg.addEventListener('click', () => frage('Seite <em>löschen?</em>', `«${p0.titel}» verschwindet von der Website und aus dem Menü.`, 'Löschen', async () => { if (await tun({ art: 'seite-weg', slug }, { titel: 'Seite gelöscht', text: p0.titel })) { fensterZu(); neuZeichnen(); } }));
  $('#ps-ok').addEventListener('click', async ev => {
    lies();
    if (!st.titel) { $('#ps-f').textContent = 'Bitte einen Titel eintragen.'; return; }
    ev.target.disabled = true;
    try {
      const davor = new Set(Object.keys(Z.eigene_seiten));
      await aendern({ art: 'seite', slug: slug || '', seite: st });
      const ns = slug || Object.keys(Z.eigene_seiten).find(k => !davor.has(k));
      if (ns) {
        const hf = ns + '.html', da = Z.nav.find(x => x.h === hf);
        if (st.im_menue && !da) await aendern({ art: 'nav', liste: Z.nav.concat([{ t: st.titel, h: hf, aus: false }]) }).catch(e => sag(e.message, true));
        else if (st.im_menue && da && da.aus) await aendern({ art: 'nav', liste: Z.nav.map(x => x.h === hf ? { ...x, aus: false } : x) }).catch(e => sag(e.message, true));
        else if (!st.im_menue && da && !da.aus) await aendern({ art: 'nav', liste: Z.nav.filter(x => x.h !== hf) }).catch(e => sag(e.message, true));
      }
      quittung(neu ? 'Seite angelegt' : 'Seite gespeichert', `${st.titel} · ${ns}.html`, { id: 'p:' + ns, zurueck: neu ? { art: 'seite-weg', slug: ns } : { art: 'seite', slug, seite: p0 } });
      fensterZu();
      if (location.hash.startsWith('#/menue')) neuZeichnen(); else location.hash = '#/menue';
    } catch (e) { $('#ps-f').textContent = e.message; }
    ev.target.disabled = false;
  });
  $('#ps-titel').focus();
}

// ---------------------------------------------------------------- Google-Texte und Bildbeschreibungen
function googleS(filter) {
  const datei = filter && Z.seo[filter] ? filter : 'index.html', so = Z.seo[datei], sd = Z.seiten.find(s => s.datei === datei);
  const alts = Object.entries(Z.alt).filter(([k]) => Z.bilder.some(b => b.key === k && b.seiten.some(x => x.datei === datei)));
  sicht.innerHTML = `<div class="in">${kopf('Google <em>& Co.</em>', 'Was Google und andere Suchmaschinen über jede Seite zeigen, und die Beschreibung jedes Bildes für Menschen, die nicht sehen können.')}
    <div class="filter">${Z.seiten.map(s => `<button type="button" data-f="${h(s.datei)}" class="${s.datei === datei ? 'an' : ''}">${h(s.name)}</button>`).join('')}</div>
    <section class="blatt" style="max-width:820px"><h3>Bei Google: ${h(sd ? sd.name : datei)}</h3><div class="form1" style="margin-top:16px">
      <label class="feld"><span>Titel (so steht es im Browser-Reiter und bei Google)</span><input id="se-titel" maxlength="120" value="${h(so.eigen.titel || '')}" placeholder="${h(so.titel)}"><small><span id="se-tz">${(so.eigen.titel || so.titel).length}</span> Zeichen, bis 60 sind ideal</small></label>
      <label class="feld"><span>Beschreibung (die zwei Zeilen unter dem Titel)</span><textarea id="se-beschr" rows="3" maxlength="320" placeholder="${h(so.beschr)}">${h(so.eigen.beschr || '')}</textarea><small><span id="se-bz">${(so.eigen.beschr || so.beschr).length}</span> Zeichen, bis 155 sind ideal · leer lassen heisst: Vorgabe behalten</small></label>
      <div class="gvor"><b id="gv-t">${h(so.eigen.titel || so.titel)}</b><i>berghotel-gasterntal.ch › ${h(datei.replace('.html', ''))}</i><p id="gv-b">${h(so.eigen.beschr || so.beschr)}</p></div>
      <div class="sichern offen sichern--still"><i></i><span>Google-Text</span><button class="kn kn--klein" type="button" id="se-ok">Speichern${KNI}</button></div></div></section>
    <h2 class="zw">Bildbeschreibungen<span>${String(alts.length).padStart(2, '0')}</span></h2>
    <section class="blatt" style="padding:4px 0">${alts.map(([k, a]) => `<div class="ware" data-alt="${h(k)}"><img src="${bildadr(k)}" alt=""><label class="feld"><span>Beschreibung${a.eigen ? ' <i class="marke rot">Im Entwurf geändert</i>' : ''}</span><input maxlength="200" value="${h(a.eigen || '')}" placeholder="${h(a.standard || 'Was ist auf dem Bild zu sehen?')}"></label><button class="kn kn--klein kn--linie" type="button" data-akt="alt-ok">Speichern</button></div>`).join('') || '<p class="gz leer">Auf dieser Seite gibt es keine Bilder.</p>'}</section></div>`;
  const wurzel = sicht.querySelector('.in');
  wurzel.addEventListener('input', () => { const t = $('#se-titel').value.trim() || so.titel, b = $('#se-beschr').value.trim() || so.beschr; $('#gv-t').textContent = t; $('#gv-b').textContent = b; $('#se-tz').textContent = t.length; $('#se-bz').textContent = b.length; });
  wurzel.addEventListener('click', async ev => {
    const f = ev.target.closest('[data-f]'), b = ev.target.closest('[data-akt]');
    if (f) { location.hash = '#/google/' + encodeURIComponent(f.dataset.f); return; }
    if (!b) return;
    if (b.dataset.akt === 'alt-ok') { const z = b.closest('[data-alt]'), k = z.dataset.alt, alt = Z.alt[k].eigen; if (await tun({ art: 'alt', key: k, text: $('input', z).value }, { titel: 'Bildbeschreibung gespeichert', text: $('input', z).value.trim().slice(0, 80) || 'Vorgabe', id: 'a:' + k, zurueck: { art: 'alt', key: k, text: alt } })) neuZeichnen(); }
  });
  $('#se-ok').addEventListener('click', async () => { if (await tun({ art: 'seo', datei, titel: $('#se-titel').value, beschr: $('#se-beschr').value }, { titel: 'Google-Text gespeichert', text: sd ? sd.name : datei, id: 'g:' + datei, zurueck: { art: 'seo', datei, titel: so.eigen.titel || '', beschr: so.eigen.beschr || '' } })) neuZeichnen(); });
}

// ---------------------------------------------------------------- Änderungen
function aenderungenS() {
  const cs = nachZeit(), n = cs.length;
  const pfeil = '<svg viewBox="0 0 22 22"><path d="M3 11h15M13 6l5 5-5 5"/></svg>';
  const kern = c => {
    if (c.art === 'bild') return `<div class="vn"><div class="alt"><span>Vorher</span><img src="${h(c.vorher)}" alt=""></div>${pfeil}<div class="neu"><span>Nachher</span><img src="${h(c.nachher)}" alt=""></div></div>`;
    if (c.art === 'karte' || c.art === 'liste') return `<ul class="punkte">${c.punkte.map(p => `<li class="${p.was}"><i>${{ neu: 'Neu', weg: 'Entfernt', anders: 'Geändert', reihe: 'Sortiert' }[p.was]}</i><div><b>${h(p.name)}</b> <span>${h(p.text)}</span>${p.rubrik ? `<u>${h(p.rubrik)}</u>` : ''}</div></li>`).join('')}</ul>`;
    if (c.art === 'google') return c.teile.map(t => `<div class="vn"><div class="alt"><span>${h(t.feld)} vorher</span>${h(t.vorher) || '–'}</div>${pfeil}<div class="neu"><span>${h(t.feld)} nachher</span>${h(t.nachher)}</div></div>`).join('');
    return `<div class="vn"><div class="alt"><span>Vorher</span>${h(c.vorher) || '–'}</div>${pfeil}<div class="neu"><span>Nachher</span>${h(c.nachher) || '–'}</div></div>`;
  };
  const karteC = c => `<article class="aend" data-id="${h(c.id)}"><div class="aend__z">${ik(ARTZ[c.art])}</div>
    <div><h3>${h(c.titel)}<small>${h(c.ort || '')}${c.zeit ? ' · gespeichert ' + vor(c.zeit) : ''}</small></h3>${kern(c)}
      ${c.verwaist ? '<p class="hinweis" style="margin-top:14px">Diese Stelle gibt es auf der Seite nicht mehr. Die Änderung hat deshalb keine Wirkung.</p>' : ''}
      ${c.seiten.length ? `<div class="wo"><span>${c.anzahl > 1 ? mal(c.anzahl, 'Stelle', 'Stellen') + ' auf' : 'Steht auf'}</span>${c.seiten.slice(0, 9).map(s => `<button type="button" data-akt="sehen" data-seite="${h(s.datei)}">${h(s.name)}${s.zahl > 1 ? `<b>${s.zahl}</b>` : ''}</button>`).join('')}</div>` : ''}</div>
    <div class="aend__r">${c.stellen.length ? '<button class="kn kn--klein" type="button" data-akt="sehen">Vorher/Nachher ansehen</button>' : ''}<button class="link" type="button" data-akt="weg">Zurücknehmen</button></div></article>`;
  sicht.innerHTML = `<div class="in">${kopf('Ände<em>rungen.</em>', n ? 'Das ist im Entwurf gespeichert. Schauen Sie sich jede Stelle vorher und nachher an. Erst mit «Veröffentlichen» sehen es Ihre Gäste.' : '',
      n ? `<button class="kn kn--linie" type="button" data-akt="alles">Alles zurücknehmen</button><button class="kn" type="button" data-akt="raus">${mal(n, 'Änderung', 'Änderungen')} veröffentlichen${KNI}</button>` : '')}
    ${n ? cs.map(karteC).join('') : `<div class="leerbild">${ik('check')}<b>Nichts offen.</b><p>Alles, was Sie geändert haben, steht auf der Website.</p><a class="kn" href="#/uebersicht">Zur Übersicht${KNI}</a></div>`}</div>`;
  sicht.querySelector('.in').addEventListener('click', ev => {
    const b = ev.target.closest('[data-akt]');
    if (!b || !['sehen', 'weg'].includes(b.dataset.akt)) return;
    ev.stopPropagation();
    aktAenderung(b.dataset.akt, b.closest('.aend').dataset.id, b.dataset.seite);
  });
}
function veroeffentlichen() {
  const cs = nachZeit(), n = cs.length;
  if (!n) return;
  fenster(`<h2>Auf die Website <em>stellen?</em></h2><p>${mal(n, 'Änderung wird', 'Änderungen werden')} sofort für alle sichtbar. Jeden früheren Stand können Sie im Verlauf zurückholen.</p>
    <ul class="quittliste">${cs.map(c => `<li>${ik(ARTZ[c.art])}<span>${h(c.satz)}</span></li>`).join('')}</ul>
    <label class="feld" style="margin-top:18px"><span>Notiz für den Verlauf (freiwillig)</span><input id="f-notiz" maxlength="200" placeholder="z. B. Herbstkarte, neue Saison"></label>
    <div class="fenster__kn"><button class="kn kn--linie" type="button" data-zu>Abbrechen</button><button class="kn" type="button" id="f-ok">Jetzt veröffentlichen${KNI}</button></div>`);
  $('#f-ok').addEventListener('click', async ev => {
    ev.target.disabled = true;
    ev.target.firstChild.textContent = 'Wird veröffentlicht …';
    try {
      Z = await api('veroeffentlichen', { notiz: $('#f-notiz').value }); melden();
      rand();
      leiste();
      fenster(`<div class="erfolg"><i>${HAKEN}</i><h2>Veröffent<em>licht.</em></h2><p>Die Website zeigt jetzt den neuen Stand. Das ist live:</p></div>
        <ul class="quittliste ok">${cs.map(c => `<li><i>${HAKEN}</i><span>${h(c.satz)}</span></li>`).join('')}</ul>
        <div class="fenster__kn"><a class="kn kn--linie" href="/live/index.html" target="_blank" rel="noopener">Website ansehen</a><button class="kn" type="button" data-zu>Fertig${KNI}</button></div>`);
      if (W) neuLaden({}); else zeige(true);
    } catch (e) { sag(e.message, true); ev.target.disabled = false; ev.target.firstChild.textContent = 'Jetzt veröffentlichen'; }
  });
}

// ---------------------------------------------------------------- Vergleich vorher / nachher
function vergleich(c, seiteDatei) {
  const stellen = c.stellen.length ? c.stellen : [];
  if (!stellen.length) return;
  V = { c, stellen, i: Math.max(0, seiteDatei ? stellen.findIndex(s => s.seite === seiteDatei) : 0), geraet: 'rechner', box: {}, seite: {} };
  const v = $('#vergleich');
  v.hidden = false;
  v.innerHTML = `<div class="vgl__k"><button class="rund" type="button" data-akt="zu" title="Schliessen" aria-label="Schliessen">${SYM.zu}</button>
      <h2>${h(c.titel)}<small>${h(c.ort || '')}</small></h2>
      <select id="v-seite" aria-label="Seite"${c.seiten.length < 2 ? ' hidden' : ''}>${c.seiten.map(s => `<option value="${h(s.datei)}">${h(s.name)}${s.zahl > 1 ? ` (${s.zahl} Stellen)` : ''}</option>`).join('')}</select>
      <div class="vgl__nav"><button class="rund" type="button" data-akt="vor" aria-label="Vorherige Stelle">${SYM.links}</button><span id="v-zahl"></span><button class="rund" type="button" data-akt="nach" aria-label="Nächste Stelle">${SYM.rechts}</button>
        <button class="rund an" type="button" data-g="rechner" aria-label="Wie am Rechner">${SYM.rechner}</button><button class="rund" type="button" data-g="handy" aria-label="Wie am Handy">${SYM.handy}</button></div></div>
    <div class="vgl__b" id="v-b">${['vorher', 'entwurf'].map(p => `<div class="vgl__s"><span>${p === 'vorher' ? 'Vorher <b>so steht es jetzt auf der Website</b>' : 'Nachher <b>so sieht es nach dem Veröffentlichen aus</b>'}</span>
      <div class="vgl__r"><iframe id="v-${p}" title="${p === 'vorher' ? 'Vorher' : 'Nachher'}"></iframe><div class="vgl__m" id="vm-${p}"></div><div class="vgl__leer" id="vl-${p}" hidden></div></div></div>`).join('')}</div>`;
  v.onclick = ev => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.dataset.akt === 'zu') return vglZu();
    if (b.dataset.akt === 'vor') V.i = (V.i - 1 + V.stellen.length) % V.stellen.length;
    else if (b.dataset.akt === 'nach') V.i = (V.i + 1) % V.stellen.length;
    else if (b.dataset.g) {
      V.geraet = b.dataset.g;
      $('#v-b').classList.toggle('handy', V.geraet === 'handy');
      $$('.vgl__r', v).forEach(r => r.classList.toggle('handy', V.geraet === 'handy'));
      $$('[data-g]', v).forEach(x => x.classList.toggle('an', x === b));
      V.passe.forEach(f => f());
      setTimeout(() => ['vorher', 'entwurf'].forEach(vglMarke), 350);
      return;
    }
    else return;
    vglLade();
  };
  $('#v-seite').addEventListener('change', ev => { V.i = Math.max(0, V.stellen.findIndex(s => s.seite === ev.target.value)); vglLade(); });
  V.passe = [];
  ['vorher', 'entwurf'].forEach(p => {
    const fr = $('#v-' + p);
    V.passe.push(passe(fr, fr.parentNode, 1280));
    fr.addEventListener('load', () => {
      const d = fr.contentDocument;
      if (!d || !d.body || !V) return;
      V.box[p] = richte(d, false).an;
      d.addEventListener('click', ev => { if (ev.target.closest && ev.target.closest('a[href]')) ev.preventDefault(); }, true);
      d.defaultView.addEventListener('wheel', () => requestAnimationFrame(() => { const a = $('#v-' + (p === 'vorher' ? 'entwurf' : 'vorher')); try { a.contentWindow.scrollTo(0, d.defaultView.scrollY); vglRahmen(); } catch (e) {} }), { passive: true });
      d.defaultView.addEventListener('scroll', vglRahmen, { passive: true });
      vglMarke(p);
    });
  });
  vglLade();
}
function vglZu() { V = null; const v = $('#vergleich'); v.hidden = true; v.innerHTML = ''; }
function vglFinde(d, st, p) {
  if (st.oben) return null;
  if (st.b) return d.querySelector(`img[data-b="${st.b}"][data-bn="${st.n}"]`);
  const genau = () => d.querySelector(`[data-e="${st.h}"][data-en="${st.n}"]`);
  if (V.c.art !== 'karte' || p === (st.vorher ? 'vorher' : 'entwurf')) return genau();
  return $$(`[data-e="${st.h}"]`, d).find(e => e.textContent.trim() === st.t) || null;
}
function vglRahmen() {
  if (!V) return;
  ['vorher', 'entwurf'].forEach(p => { const el = V.el && V.el[p]; if (el) rahme(V.box[p], el); });
}
function vglMarke(p) {
  if (!V) return;
  const fr = $('#v-' + p), d = fr.contentDocument, st = V.stellen[V.i], leer = $('#vl-' + p), m = $('#vm-' + p);
  if (!d || !d.body || V.seite[p] !== st.seite || d.readyState === 'loading') return;
  V.el = V.el || {};
  let el = vglFinde(d, st, p);
  leer.hidden = true;
  if (st.oben) { d.defaultView.scrollTo(0, 0); rahme(V.box[p], null); m.innerHTML = ''; V.el[p] = null; return; }
  if (el) {
    zeig(el);
    el = el.closest('.gang,.spalten3,.zwischen') || el;
    el.scrollIntoView({ block: 'center', inline: 'center' });
    if (!rahme(V.box[p], el)) { leer.hidden = false; leer.textContent = 'Diese Stelle ist auf der Seite gerade eingeklappt und erst nach einem Klick zu sehen.'; }
  } else {
    rahme(V.box[p], null);
    leer.hidden = false;
    leer.textContent = p === 'vorher' ? 'Hier stand das vorher noch nicht.' : 'Hier steht es nach dem Veröffentlichen nicht mehr.';
  }
  V.el[p] = el;
  const hoehe = d.documentElement.scrollHeight || 1;
  m.innerHTML = V.stellen.map((s, i) => {
    if (s.seite !== st.seite) return '';
    const e = i === V.i ? el : vglFinde(d, s, p);
    const r = e && e.getBoundingClientRect();
    return r && (r.width || r.height) ? `<i class="${i === V.i ? 'an' : ''}" style="top:${((r.top + d.defaultView.scrollY) / hoehe * 100).toFixed(2)}%"></i>` : '';
  }).join('');
}
function vglLade() {
  const st = V.stellen[V.i], name = (V.c.seiten.find(s => s.datei === st.seite) || {}).name || st.seite;
  $('#v-zahl').textContent = `Stelle ${V.i + 1} von ${V.stellen.length} · ${name}`;
  $('#v-seite').value = st.seite;
  ['vorher', 'entwurf'].forEach(p => {
    const fr = $('#v-' + p);
    if (V.seite[p] !== st.seite) { V.seite[p] = st.seite; V.el = {}; fr.src = `/${p}/${encodeURIComponent(st.seite)}?nomotion`; } else vglMarke(p);
  });
}

// ---------------------------------------------------------------- Verlauf und Zugang
function verlauf() {
  const vs = Z.verlauf;
  sicht.innerHTML = `<div class="in">${kopf('Ver<em>lauf.</em>', vs.length ? 'Jede Veröffentlichung wird aufgehoben. Holen Sie einen früheren Stand zurück, liegt er zuerst als Entwurf bereit. Sie prüfen ihn und veröffentlichen dann.' : '')}
    ${vs.length ? `<ol class="lauf">${vs.map((v, i) => `<li><div class="blatt"><div><time>${v.anfang ? 'Ursprünglicher Stand' : datum(v.zeit)}</time>
      <p>${v.anfang ? 'So war die Website, bevor im Studio zum ersten Mal etwas geändert wurde.' : (v.notiz ? `<b>${h(v.notiz)}</b> · ` : '') + h(v.punkte.slice(0, 6).join(' · ')) + (v.punkte.length > 6 ? ` und ${v.punkte.length - 6} weitere` : '')}</p></div>
      ${i === 0 ? '<span class="mono leise">Das ist der Stand der Website</span>' : `<button class="kn kn--klein kn--linie" type="button" data-id="${h(v.id)}">Diesen Stand zurückholen</button>`}</div></li>`).join('')}</ol>`
    : `<div class="leerbild">${ik('verlauf')}<b>Noch nichts veröffentlicht.</b><p>Sobald Sie zum ersten Mal etwas veröffentlichen, finden Sie hier jeden Stand der Website und können ihn zurückholen.</p></div>`}</div>`;
  sicht.querySelector('.in').addEventListener('click', ev => {
    const b = ev.target.closest('[data-id]');
    if (!b) return;
    frage('Stand <em>zurückholen?</em>', 'Der frühere Stand wird als Entwurf geladen. Was Sie gerade an unveröffentlichten Änderungen haben, wird dabei ersetzt. Auf der Website ändert sich erst etwas, wenn Sie veröffentlichen.', 'Zurückholen', async () => {
      Z = await api('zurueck', { id: b.dataset.id }); melden();
      sag('Der frühere Stand liegt als Entwurf bereit.');
      location.hash = '#/aenderungen';
    });
  });
}
const PRUEF_BLATT = `<section class="blatt"><h3>Prüfung</h3><p style="margin:14px 0 20px;color:rgba(26,31,33,.7)">Wenn etwas hakt: die Prüfung geht Verbindung, Browser, Dateien, Bau und Inhalte durch, kennt jede bekannte Fehlerquelle und behebt das meiste mit einem Klick. Sie läuft auch, wenn das Studio selbst nicht mehr lädt. Adresse zum Merken: <b>/studio/pruefung.html</b></p><a class="kn kn--linie" href="pruefung.html">Prüfung öffnen${KNI}</a></section>`;
function zugang() {
  if (PROBE) {
    sicht.innerHTML = `<div class="in">${kopf('Zu<em>gang.</em>', 'Die Probe-Fassung braucht kein Passwort. Jeder Besucher arbeitet in seiner eigenen Kopie, die echte Website bleibt, wie sie ist.')}
      <div class="raster r-2"><section class="blatt"><h3>Im echten Studio</h3><p style="margin-top:12px;color:rgba(26,31,33,.7)">Dort legen Sie beim ersten Öffnen Ihr eigenes Passwort fest und können es hier jederzeit ändern. Nach zwölf Stunden meldet es Sie von selbst ab.</p></section>${PRUEF_BLATT}</div></div>`;
    return;
  }
  if (OFFEN) {
    sicht.innerHTML = `<div class="in">${kopf('Zu<em>gang.</em>', 'Das Studio ist gerade ohne Passwort offen. Sobald Sie wirklich damit arbeiten, wird der Schutz eingeschaltet.')}
      <div class="raster r-2"><section class="blatt"><h3>Offen</h3><p style="margin-top:12px;color:rgba(26,31,33,.7)">Jeder, der die Adresse kennt, kann gerade ändern und veröffentlichen. Zum Einschalten des Schutzes sagen Sie Robert Bescheid.</p></section>${PRUEF_BLATT}</div></div>`;
    return;
  }
  sicht.innerHTML = `<div class="in">${kopf('Zu<em>gang.</em>', 'Das Studio ist mit einem Passwort geschützt. Nach zwölf Stunden meldet es Sie von selbst ab.')}
    <div class="raster r-2"><section class="blatt"><h3>Passwort ändern</h3><form id="z-form" style="display:grid;gap:14px;margin-top:18px" autocomplete="off">
      <label class="feld"><span>Bisheriges Passwort</span><input type="password" name="alt" autocomplete="current-password" required></label>
      <label class="feld"><span>Neues Passwort</span><input type="password" name="neu" autocomplete="new-password" required minlength="10"><small>Mindestens 10 Zeichen</small></label>
      <label class="feld"><span>Noch einmal</span><input type="password" name="neu2" autocomplete="new-password" required></label>
      <div class="fehler" role="alert" style="text-align:left"></div><div><button class="kn" type="submit">Passwort ändern${KNI}</button></div></form></section>
    <section class="blatt"><h3>Abmelden</h3><p style="margin:14px 0 20px;color:rgba(26,31,33,.7)">An einem fremden Rechner melden Sie sich am besten ab, wenn Sie fertig sind. Entwürfe bleiben erhalten.</p><button class="kn kn--linie" type="button" data-akt="abmelden">Abmelden</button></section>${PRUEF_BLATT}</div></div>`;
  const f = $('#z-form');
  f.addEventListener('submit', async ev => {
    ev.preventDefault();
    const fe = $('.fehler', f);
    fe.textContent = '';
    if (f.neu.value !== f.neu2.value) { fe.textContent = 'Die beiden neuen Eingaben sind nicht gleich.'; return; }
    try { await api('passwort', { alt: f.alt.value, neu: f.neu.value }); f.reset(); sag('Das Passwort ist geändert.'); } catch (e) { fe.textContent = e.message; }
  });
}

// ---------------------------------------------------------------- Fenster
function fenster(html, breit) {
  const f = $('#fenster');
  f.hidden = false;
  f.oninput = f.onclick = f.bei = null;
  $$('.quitt').forEach(x => { if (!html.includes('class="erfolg"')) x.remove(); });
  f.innerHTML = `<div class="fenster__k${breit ? ' breit' : ''}" role="dialog" aria-modal="true"><button class="rund zu" type="button" data-zu aria-label="Schliessen">${SYM.zu}</button>${html}</div>`;
  const erstes = $('input,button.kn', f);
  if (erstes) erstes.focus();
}
function fensterZu() { const f = $('#fenster'); f.hidden = true; f.innerHTML = ''; }
function frage(titel, text, knopf, tun) {
  fenster(`<h2>${titel}</h2><p>${text}</p><div class="fenster__kn"><button class="kn kn--linie" type="button" data-zu>Abbrechen</button><button class="kn" type="button" id="f-ja">${knopf}${KNI}</button></div>`);
  $('#f-ja').addEventListener('click', async () => { try { await tun(); fensterZu(); } catch (e) { sag(e.message, true); } });
}
$('#fenster').addEventListener('click', ev => { if (ev.target.closest('[data-zu]')) fensterZu(); });
$('#fenster').addEventListener('wahl', ev => { const f = $('#fenster'); if (f.bei) f.bei(ev); });
$('#lade').addEventListener('click', ev => { if (ev.target.id === 'lade') ladeZu(); });
addEventListener('keydown', ev => {
  if (ev.key !== 'Escape') return;
  if (!$('#fenster').hidden) fensterZu(); else if (V) vglZu(); else if (!$('#lade').hidden) ladeZu();
});
document.addEventListener('click', async ev => {
  const b = ev.target.closest('[data-akt]');
  if (!b) return;
  const akt = b.dataset.akt, imLade = b.closest('#lade');
  if (akt === 'abmelden') { try { await api('abmelden', {}); } catch (e) {} Z = null; ladeZu(); tor('an'); }
  if (akt === 'lade') { if ($('#lade').hidden) lade(); else ladeZu(); }
  if (akt === 'ladezu') ladeZu();
  if (akt === 'raus' || akt === 'alles') aktAenderung(akt);
  if (imLade && (akt === 'sehen' || akt === 'weg')) aktAenderung(akt, b.closest('[data-id]').dataset.id);
  if (akt === 'geraet' && W) {
    $('#w-buehne').classList.toggle('handy', b.dataset.g === 'handy');
    W.passe();
    $$('[data-akt="geraet"]').forEach(x => x.classList.toggle('an', x === b));
    setTimeout(() => { if (W && W.sel) rahme(W.an, W.sel.el); }, 300);
  }
});

(async () => {
  try {
    const s = await api('status');
    OFFEN = !!s.offen;
    PROBE = !!s.probe;
    // Fassung: trägt das Skript eine Marke (?v=…, online gestempelt) und nennt der Server eine andere, zeigt der Browser eine alte Fassung
    const eigene = (/[?&]v=([\w-]+)/.exec(($('script[src*="studio.js"]') || {}).src || '') || [])[1] || '';
    if (s.version && /^[0-9a-f]{8}$/.test(eigene) && eigene !== s.version) setTimeout(() => { LETZTER = fehlerMit('Der Browser zeigt eine ältere Fassung des Studios. Bitte neu laden.', 'alte-fassung'); sag(LETZTER.message, true); }, 800);
    if (s.offen || s.probe) await laden(); else if (!s.eingerichtet) tor('neu'); else if (!s.angemeldet) tor('an'); else await laden();
  } catch (e) {
    merkeFehler('start', e.message);
    const lex = e.lex || 'keine-verbindung';
    $('#app').hidden = true;
    const t = $('#tor');
    t.hidden = false;
    t.innerHTML = `<div class="tor__k"><img class="tor__m" src="/assets/logo/schrift-berghotel-gasterntal.svg" alt="Berghotel Gasterntal"><h1>Das Studio <em>lädt nicht.</em></h1>
      <p>${h(e.message)}</p><p style="margin-top:10px">Die Prüfung findet heraus, woran es liegt, und bringt es meist mit einem Klick in Ordnung. Sie läuft auch ohne das Studio.</p>
      <div style="display:grid;gap:10px;margin-top:24px"><a class="kn kn--breit" href="pruefung.html#lex-${h(lex)}">Prüfung öffnen${KNI}</a><button class="link" type="button" onclick="location.reload()" style="justify-self:center">Noch einmal versuchen</button></div></div>`;
  }
})();
})();
