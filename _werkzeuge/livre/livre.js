/* Das Hausbuch (Le Livre) · Berghotel Gasterntal. Die Marke des Hauses zum Arbeiten (Nachbau von Le Livre des Waldhotel Doldenhorn, dahinter
   Carlton-Europe und Grand Beau-Rivage, dort nur gelesen): Bildarchiv mit fertigen Grössen, Dateien (Schriftzug, Raute, Name, Tapete, Farben,
   Schriften, Zeichen der Karte 2026), Markenprüfung für Entwürfe, Markenbuch (buch.html).
   Rahmen (Kopf, Rand, Leiste, Startbild, Knöpfe) aus dem gemeinsamen Paket «Werkzeug-Oberfläche» (Rahmen «Die Bühne», Kleid gasterntal, oberflaeche.js → WO),
   gleich wie in den anderen Werkzeugen des Hauses. Daten: livre.json (gebaut von bau.py), Downloads und Prüfung über den Server-Teil (server.py lokal,
   online/livre_online.py). Gespeichert wird nichts, ausser «Ergebnis sichern» legt auf Wunsch eine Datei auf diesem Rechner ab.
   Fehlermelder, Ladezeichen und Startfehler laufen vorher in start.js. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const IC = d => `<svg class="wo-ic" viewBox="0 0 16 16" aria-hidden="true">${d}</svg>`;
const PF = IC('<path d="M4 12 12 4M5.5 4H12v6.5"/>');
const PU = IC('<path d="M8 2v9M3.8 7 8 11.2 12.2 7M3 14h10"/>');
const PO = IC('<path d="M8 12V3M3.8 7 8 2.8 12.2 7M3 14h10"/>');
const ZU = IC('<path d="M3 3l10 10M13 3 3 13"/>');
const LUPE = IC('<circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3.5 3.5"/>');
const KOPIE = IC('<rect x="5" y="5" width="8.5" height="8.5" rx="1.6"/><path d="M3 10.5V3.8A1.3 1.3 0 0 1 4.3 2.5H10.5"/>');
const BUCH = IC('<path d="M2.5 3.2c2-.8 3.8-.6 5.5.6 1.7-1.2 3.5-1.4 5.5-.6v9.6c-2-.8-3.8-.6-5.5.6-1.7-1.2-3.5-1.4-5.5-.6z"/><path d="M8 3.8v9.6"/>');
const PFEIL = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5"/></svg>';
const S_ = 'berghotel-gasterntal';
const ZEICHEN_N = `<img src="dateien/${S_}-raute-talwand.svg" alt="" width="22" height="46" decoding="async">`;
const MARKE = 'buch.html', DAT = 'dateien/', ORIG = 'original/', ANLEITUNG = 'anleitung.html';
const H_ = window.WO_HAUS || { wege: {} };
const WEBSITE = '/';
const IMPRIMERIE = '../imprimerie/';      // immer relativ, nie nach Port (F18): lokal _werkzeuge/imprimerie/, online werkzeuge/imprimerie/
const okey = k => k.replace(/\//g, '-');

/* Knopf im Stil des Pakets (wo-kn): Text, Zeichen, Art gold|hell|dunkel|glas, Zusätze (href, download, id, klein, attr) */
function kn(text, ic, art = 'dunkel', o = {}) {
  const k = `wo-kn wo-kn--${art}${o.klein ? ' wo-kn--klein' : ''}${o.klasse ? ' ' + o.klasse : ''}`;
  const a = (o.id ? ` id="${o.id}"` : '') + (o.attr ? ' ' + o.attr : '');
  const innen = `<span>${esc(text)}</span><i>${ic || PF}</i>`;
  return o.href != null ? `<a class="${k}" href="${esc(o.href)}"${o.download != null ? ` download${o.download ? `="${esc(o.download)}"` : ''}` : ''}${o.neu ? ' target="_blank" rel="noopener"' : ''}${a}>${innen}</a>`
    : `<button class="${k}" type="button"${a}>${innen}</button>`;
}

/* ---------------------------------------------------------------- Sprachen der Oberfläche
   Freigeschaltet ist Deutsch (die Website des Hauses spricht Deutsch). Der Wechsel ist gebaut: weitere Sprachen kommen als Eintrag in SPRACHEN und T
   (Übersetzungen erst auf Roberts Wort). Mit ?sprachen=probe erscheint eine Probe-Sprache, die jeden Text in ‹ › setzt: so lässt sich der Wechsel prüfen. */
const SPRACHEN = [['de', 'DE', 'Deutsch']];
const T = {
de: {
  name: 'Das Hausbuch', unter: 'Marke', start: 'Übersicht', arbeiten: 'Arbeiten', nachschlagen: 'Nachschlagen', bilder: 'Bildarchiv', dateien: 'Logo & Dateien', pruefung: 'Markenprüfung', buch: 'Markenbuch',
  anleitung: 'Anleitung', maison: 'Die Stube', website: 'Website ansehen', sprache: 'Sprache', rundgang: 'Kurzer Rundgang', bereiche: 'Bereiche',
  morgen: 'Guten Morgen.', tag: 'Guten Tag.', abend: 'Guten Abend.', frage: 'Was brauchen Sie heute?',
  start_satz: 'Das Hausbuch ist die Marke des Hauses zum Arbeiten: alle Fotos in fertigen Grössen für Instagram, Website und Druck, Schriftzug, Raute, Tapete und Farben als Dateien, und eine Prüfung für Entwürfe von Agenturen und aus dem Haus.',
  k_bilder: 'Alle Fotos der Website, nach Bereich und Herkunft. Jedes als Beitrag, Story, für die Website oder den Druck.',
  k_dateien: 'Der Schriftzug für helle und dunkle Flächen, die Raute, die Tapete und die Farbwerte zum Kopieren.',
  k_pruefung: 'Ein Entwurf als Bild oder PDF. Das Hausbuch sagt, was zum Haus passt und was nicht, Punkt für Punkt.',
  k_buch: 'Schriftzug, Farben und ihre Herkunft im Tal, Schriften, Tapete, Bilder und Ton, nach denen alles gestaltet ist.',
  oeffnen: 'Öffnen', lesen: 'Lesen', haeufig: 'Häufig', gebraucht: 'gebraucht',
  ue_kurz: 'mit KI bearbeitet', z_haus: 'Fotos des Hauses', z_frei: 'frei lizenziert', z_ue: 'mit KI bearbeitet', z_dateien: 'Dateien',
  l_fotos: 'Fotos', l_fotos_s: '{0} des Hauses, {1} frei lizenziert vom Tal. Jedes in vier fertigen Grössen.',
  l_ue: 'Vorher, nachher', l_ue_s: '{0} Fotos sind mit KI bearbeitet: Licht, Farbe, Flächen. Das Original liegt jeweils daneben.',
  l_dat: 'Dateien', l_dat_s: 'Schriftzug, Raute, Name, Tapete, Farben und Schriften, einzeln oder als ein Paket.',
  stand: '{0} Fotos · {1} Dateien',
  recht_t: 'Bildrechte', recht: 'Die Fotos gehören dem Berghotel Gasterntal, der Familie Maeder und den jeweiligen Fotografen. Frei lizenzierte Fotos nur mit dem genannten Namen und der Lizenz. Mit KI bearbeitete Fotos sind gekennzeichnet.',
  alles_zip: 'Alle Dateien (ZIP)',
  b_titel: 'Das Bildarchiv', b_satz: 'Ein Klick auf ein Foto öffnet es. Dort laden Sie es in der Grösse, die Sie brauchen, und wählen bei Beitrag und Story den Ausschnitt.',
  suchen: 'Suchen, zum Beispiel «Sauna» oder «Fondue»', bereich: 'Bereich', saison: 'Saison', format: 'Format', herkunft: 'Herkunft', alle: 'Alle',
  b_haus: 'Das Haus von aussen', b_zimmer: 'Zimmer', b_stube: 'Stuben', b_essen: 'Essen & Trinken', b_sauna: 'Sauna in der alten Käserei', b_feste: 'Feste', b_einzel: 'Einzelheiten', b_tal: 'Weg & Tal', b_familie: 'Schwesterhäuser',
  s_sommer: 'Sommer', s_herbst: 'Herbst', s_winter: 'Winter', s_jahr: 'Ohne Jahreszeit', f_hoch: 'Hochformat', f_quer: 'Querformat', f_quadrat: 'Quadrat',
  h_haus: 'Fotos des Hauses', h_frei: 'Frei lizenziert', h_ki: 'Mit KI erzeugt', h_ue: 'Mit KI bearbeitet',
  im_titel: 'In der Werkstatt gestalten', im_beitrag: 'Als Instagram-Beitrag', im_story: 'Als Story', im_satz: 'Öffnet Die Werkstatt mit diesem Foto und Ihrem Ausschnitt.',
  treffer: '{0} von {1} Fotos', keine: 'Kein Foto passt. Ein Filter weniger hilft.', mehr: 'Mehr zeigen', zuruecksetzen: 'Filter zurücksetzen',
  ki: 'KI', ki_lang: 'Mit KI bearbeitet', ki_satz: 'Licht, Farbe und Flächen sind mit KI überarbeitet, der Raum ist das echte Foto.',
  frei_satz: 'Frei lizenziert: verwenden nur mit dem Namen des Fotografen und der Lizenz, wie unter «Quelle» genannt.',
  ue_satz: 'Licht, Farbe und Flächen sind mit KI überarbeitet, der Raum ist das echte Foto.', archiv: 'Aus dem Archiv. Nicht einfärben, nicht überarbeiten.',
  quelle: 'Quelle', original: 'Grösste Fassung', vermerk: 'Vermerk', laden: 'Laden', grossen: 'Grössen', ausschnitt: 'Ausschnitt: das Feld im Bild ziehen.',
  g_instagram: 'Instagram-Beitrag', g_story: 'Story', g_web: 'Website', g_druck: 'Druck',
  i_instagram: '1080 × 1350, JPG', i_story: '1080 × 1920, JPG', i_web: 'längste Seite 2000 px, JPG', i_druck: 'volle Auflösung, {0} × {1}, JPG', i_druck_web: 'in Website-Grösse (Original nicht hinterlegt), JPG',
  ohne_server: 'Fertige Grössen brauchen den Server-Teil des Hausbuchs. Ohne ihn lädt der Knopf das Foto in Website-Grösse.',
  vn_vorher: 'Vorher', vn_nachher: 'Nachher', vn_schieber: 'Schieber', vn_t_vorher: 'Vorher · so geliefert', vn_t_nachher: 'Nachher · mit KI bearbeitet', vn_t_schieber: 'Vorher links · nachher rechts',
  vn_hilfe: 'Mit «Vorher» sehen Sie das Foto, wie das Haus es geliefert hat.', vn_orig: 'Vorher laden',
  d_titel: 'Logo & Dateien', d_satz: 'Alles, was eine Agentur oder eine Druckerei braucht. SVG bleibt in jeder Grösse scharf, PNG hat einen durchsichtigen Grund.',
  d_schriftzug: 'Der Schriftzug', d_schriftzug_s: 'Aus dem Willkommensschreiben des Hauses nachgezeichnet. Die Form bleibt, nur die Farbe wechselt: Holz und Blatt auf Dunkel, Talwand, Tinte und Tanne auf Hell.',
  d_teile: 'Die Teile', d_teile_s: '«Berghotel» und «Gasterntal» einzeln, dazu «Ässe u trinke» aus der Karte. Für Kopfzeilen, Rubriken und kleine Flächen.',
  d_raute: 'Die Raute', d_raute_s: 'Das kleine Zeichen aus den Balkonbrettern am Giebel: Siegel, Profilbild, Zierlinie.',
  d_name: 'Name', d_name_s: 'Der Name in Barlow Semi Condensed, der Titelschrift der Website. Für Kopfzeilen und Unterschriften.',
  d_karte: 'Zeichen der Karte 2026', d_karte_s: 'So wie es das Haus heute auf seiner Karte zeigt, unverändert: ein erzeugtes Bild, im Satz fehlt ein Buchstabe («NAUR»). Zum Nachschlagen, nicht für Neues.',
  d_tapete: 'Tapete', d_tapete_s: 'Die Raute der Laube als Muster, so wie die Website sie zeigt: Holz auf der Talwand, dazu Tinte auf Papier.',
  d_farben: 'Farben', d_farben_s: 'Ein Klick kopiert den Wert. Der Laden ist nur ein Punkt, nie eine Fläche. Die Farben des heutigen Auftritts stehen getrennt und gelten nicht für Neues.', d_schriften: 'Schriften',
  d_schriften_s: 'Drei Schriften, frei lizenziert. Für die Website als WOFF2, für Druck und Programme als ZIP mit TTF und Hinweis.',
  hell: 'für helle Flächen', dunkel: 'für dunkle Flächen', kopiert: 'Kopiert', regeln: 'Regeln im Markenbuch',
  v_holz: 'Holz', v_blatt: 'Blatt', v_talwand: 'Talwand', v_tinte: 'Tinte', v_tanne: 'Tanne', v_original: 'Original', v_papier: 'Auf Papier', v_t_talwand: 'Auf der Talwand', v_alle: 'Alle',
  v_berghotel: '«Berghotel»', v_gasterntal: '«Gasterntal»', v_aesse: '«Ässe u trinke»',
  p_titel: 'Die Markenprüfung', p_satz: 'Laden Sie einen Entwurf hoch, etwa ein Plakat, einen Beitrag oder den Flyer einer Agentur. Die Farben werden gemessen, Bild, Schrift, Schriftzug und Ton beurteilt Claude.',
  p_feld: 'Entwurf hierher ziehen', p_feld2: 'oder wählen · Bild oder PDF, bis 30 MB', p_waehlen: 'Datei wählen', p_pruefen: 'Prüfen', p_beispiel: 'Beispiel ansehen',
  p_beispiel_hand: 'Beispiel: Dieser Entwurf ist eigens gezeichnet, so wie ihn eine Agentur schicken könnte. Die Farben sind wirklich gemessen; die Rückmeldung dazu ist für dieses Beispiel von Hand geschrieben, weil die Prüfung mit Claude hier nicht aufgerufen wird. Die echte Prüfung antwortet im selben Aufbau.',
  p_beispiel_h: 'Beispiel: Dieser Entwurf ist eigens gezeichnet. Die Rückmeldung stammt unverändert von der Prüfung.',
  p_probe: 'Beispiel: Die Farben sind wirklich gemessen. Schrift, Zeichen, Bild und Ton zeigen ein Beispiel-Urteil, so wie die Prüfung antwortet, sobald sie eingeschaltet ist.',
  p_privat: 'Nichts wird gespeichert. Der Entwurf geht nur für die Prüfung an den Server und ist danach weg.',
  p_schritt1: 'Farben messen', p_schritt2: 'Entwurf ansehen', p_schritt3: 'Rückmeldung schreiben', p_dauer: 'Das dauert meist eine halbe Minute.',
  p_gesamt: 'Insgesamt', p_punkte: 'Punkt für Punkt', p_farben: 'Gemessene Farben', p_farben_s: 'Ohne KI gemessen, gegen die Palette des Hauses. Fotos im Entwurf zählen mit.',
  p_rahmen: '{0} % der Fläche in den Farben des Hauses', p_ton: 'Im Ton des Hauses', p_neu: 'Neuen Entwurf prüfen', p_sichern: 'Ergebnis sichern', p_kopie: 'Als Text kopieren',
  p_gleich: 'passt', p_nah: 'nah', p_fremd: 'fremd', p_naechste: 'nächste Hausfarbe', p_schwarz: 'Reines Schwarz auf {0} % der Fläche. Geschrieben wird in Tinte {1}.',
  u_passt: 'passt', u_achten: 'achten', u_passt_nicht: 'passt nicht',
  ber: { farben: 'Farben', schrift: 'Schrift', zeichen: 'Schriftzug', abstand: 'Abstand', bild: 'Bild', ton: 'Ton' },
  p_ki_fehler: 'Die Beurteilung durch Claude war gerade nicht möglich ({0}). Die Messung der Farben steht links.', p_fehler: 'Die Prüfung ging nicht durch',
  p_seiten: '{0} Seiten, geprüft die ersten {1}', p_text: 'Gelesener Text', fehler_verb: 'Der Server-Teil des Hausbuchs antwortet nicht.',
  schliessen: 'Schliessen', fehler_json: 'Die Daten des Hausbuchs (livre.json) fehlen.',
  p_typ: 'Diese Datei ist kein Bild und keine PDF. Erlaubt sind JPG, PNG, WebP und PDF.', p_gross: 'Die Datei ist grösser als 30 MB.', p_pdf_online: 'Online geht eine PDF bis 3 MB. Bitte kleiner speichern oder die erste Seite als Bild prüfen.', p_offline: 'Keine Verbindung. Der Entwurf bleibt gewählt, bitte noch einmal prüfen, sobald das Netz wieder da ist.', fehler_code: 'Der Server antwortete mit Fehler {0}.',
  tuer_t: 'Das Hausbuch startet nicht.', tuer_neu: 'Neu laden', tuer_hilfe: 'Hilft das nicht: die Anleitung öffnen oder Tasty Studios Bescheid geben.'
}
};
if (/[?&]sprachen=probe\b/.test(location.search)) {   // nur für die Prüfung des Sprachwechsels: jeder Text in ‹ ›
  SPRACHEN.push(['pr', 'PR', 'Probe (nur Prüfung)']);
  const um = x => typeof x === 'string' ? '‹' + x + '›' : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, um(v)])) : x;
  T.pr = um(T.de);
}
let SP = (() => { try { const q = new URLSearchParams(location.search).get('sprache'); if (q && T[q]) return q; const m = localStorage.getItem('bg-livre-sprache'); return m && T[m] ? m : 'de'; } catch (e) { return 'de'; } })();
const t = (k, ...a) => { let s = (T[SP] && T[SP][k] != null ? T[SP][k] : T.de[k]); if (typeof s === 'string') a.forEach((x, i) => { s = s.split('{' + i + '}').join(x); }); return s; };
const zahl = n => Number(n).toLocaleString('de-CH');

/* ---------------------------------------------------------------- Zustand */
const S = { d: null, server: null, ansicht: 'start', f: { q: '', b: 'alle', s: 'alle', f: 'alle', h: 'alle' }, n: 48, datei: null, ergebnis: null };
const ANSICHTEN = ['start', 'bilder', 'dateien', 'pruefung'];
const FORMATE = { instagram: [1080, 1350], story: [1080, 1920] };
const FOTO = { start: '', bilder: 'stube', dateien: 'haus-giebel', pruefung: 'kaeserei' };   // Foto der Bühne je Ansicht (Übersicht: das Haus von aussen aus dem Kleid)
const fotoVon = a => FOTO[a] ? `/assets/img/${FOTO[a]}-l.webp` : (H_.foto || '/assets/img/haus-profil-l.webp');
const hex = k => ((S.d && S.d.farben.find(f => f.k === k)) || {}).h || '';

/* ---------------------------------------------------------------- Grundgerüst (Paket «Werkzeug-Oberfläche») */
function kopf() {
  const titel = { start: t('start'), bilder: t('bilder'), dateien: t('dateien'), pruefung: t('pruefung') }[S.ansicht];
  const st = S.d ? t('stand', zahl(S.d.stand.fotos), zahl(S.d.stand.dateien)) : '';
  $('#kopf').innerHTML = WO.kopf({ werkzeug: 'marke', unter: t('unter'), titel, stand: st, anleitung: ANLEITUNG, website: WEBSITE, marke: 'data-gehe="start"', markeHref: '#start' });
  if (SPRACHEN.length > 1) {
    const akt = SPRACHEN.find(x => x[0] === SP) || SPRACHEN[0];
    $('#kopf .wo-kopf__r').insertAdjacentHTML('afterbegin', `<div class="li-sp"><button class="li-sp__k" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="${esc(t('sprache'))}">${esc(akt[1])}<i>${PFEIL}</i></button>
      <ul role="listbox">${SPRACHEN.map(([k, kurz, name]) => `<li><button type="button" role="option" data-sp="${k}" ${k === SP ? 'aria-selected="true"' : ''}><span>${esc(name)}</span><small>${esc(kurz)}</small></button></li>`).join('')}</ul></div>`);
    const sp = $('.li-sp'), k = $('.li-sp__k');
    k.onclick = e => { e.stopPropagation(); const o = sp.classList.toggle('offen'); k.setAttribute('aria-expanded', o); };
    $$('[data-sp]', sp).forEach(b => b.onclick = () => wechsle(b.dataset.sp));
  }
  $$('#kopf [data-gehe]').forEach(x => x.onclick = e => { e.preventDefault(); gehe(x.dataset.gehe); });
}
document.addEventListener('click', () => { const sp = $('.li-sp'); if (sp) { sp.classList.remove('offen'); $('.li-sp__k').setAttribute('aria-expanded', false); } });

function rand() {
  const e = (key, text, z = '') => ({ text, zahl: z, an: S.ansicht === key, attr: `data-gehe="${key}"` });
  $('#rand').innerHTML = WO.rand([
    { eintraege: [e('start', t('start'))] },
    { titel: t('arbeiten'), eintraege: [e('bilder', t('bilder'), S.d ? zahl(S.d.stand.fotos) : ''), e('dateien', t('dateien'), S.d ? zahl(S.d.stand.dateien) : ''), e('pruefung', t('pruefung'))] },
    { titel: t('nachschlagen'), eintraege: [{ text: t('buch'), href: MARKE, extra: `<em class="wo-rand__z">${esc(t('lesen'))}</em>` }] }
  ], { website: WEBSITE, anleitung: ANLEITUNG });
  $('#rand .wo-rand__wege').insertAdjacentHTML('afterbegin', `<a href="${esc(H_.wege.zentrale || '/_werkzeuge/maison/')}">${esc(t('maison'))}${WO.ic('haus')}</a>`);
  /* Sprache am Handy: der Kopf zeigt dort nur Marke und «Bereiche», darum steht die Wahl auch im Rand (nur sichtbar unter 900 px) */
  if (SPRACHEN.length > 1) $('#rand .wo-rand__wege').insertAdjacentHTML('beforeend', `<div class="li-sp-r" role="group" aria-label="${esc(t('sprache'))}">${SPRACHEN.map(([k, kurz, name]) => `<button type="button" data-sp="${k}" aria-pressed="${k === SP}" title="${esc(name)}">${esc(kurz)}</button>`).join('')}</div>`);
  $$('#rand [data-sp]').forEach(b => b.onclick = () => wechsle(b.dataset.sp));
  $$('#rand [data-gehe]').forEach(b => b.onclick = () => gehe(b.dataset.gehe));
}

function leiste() {
  $('#leiste').innerHTML = WO.leiste({ titel: t('recht_t'), satz: t('recht'), knoepfe: kn(t('alles_zip'), PU, 'gold', { href: `${DAT}${S_}-marke.zip`, download: '', klein: true }) });
}

function gehe(a) {
  S.ansicht = a;
  try { localStorage.setItem('bg-livre-ansicht', a); } catch (e) { /* privat */ }
  history.replaceState(null, '', location.pathname + location.search + '#' + a);
  kopf(); rand(); zeichne();
  scrollTo({ top: 0 });
}
function wechsle(sp) {
  SP = sp;
  try { localStorage.setItem('bg-livre-sprache', sp); } catch (e) { /* privat */ }
  document.documentElement.lang = sp === 'de' ? 'de-CH' : sp;
  kopf(); rand(); leiste(); zeichne(true);
}

/* Startbild einer Ansicht (R16): WO.startbild als Bühne mit eigenem Foto, Titel mit Akzent im letzten Wort */
function titel(ansicht, h1, satz, knoepfe = '') {
  const z = h1.length > 1 ? `${esc(h1.slice(0, -1).join(' '))} <em>${esc(h1[h1.length - 1])}</em>` : esc(h1[0]);
  return WO.startbild({ werkzeug: 'marke', art: 'buehne', foto: fotoVon(ansicht), h1: z, satz: esc(satz), knoepfe });
}
function teile(s) { const i = s.lastIndexOf(' '); return i > 0 ? [s.slice(0, i), s.slice(i + 1)] : [s]; }

function zeichne(still = false) {
  const el = $('#ansicht');
  const a = S.ansicht;
  el.innerHTML = a === 'bilder' ? bilder() : a === 'dateien' ? dateien() : a === 'pruefung' ? pruefung() : start();
  if (a === 'bilder') bilderLeben(); else if (a === 'dateien') dateienLeben(); else if (a === 'pruefung') pruefungLeben(); else startLeben();
  auftritte(el, still);
}

/* Auftritte (R17): federnd hereinschweben, sobald im Bild, nur transform; deckend ab dem ersten Bild (kein Aufblenden aus 0), höchstens 22 je Wechsel */
let IO = null, IO2 = null;
const RUHIG = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function auftritte(r, still) {
  const alle = $$('[data-r]', r).filter(x => !x.classList.contains('da'));
  if (still || !('IntersectionObserver' in window) || RUHIG()) { alle.forEach(x => x.classList.add('da')); return; }
  /* Robert 18.10.2026 17:46 («stell das bitte überall sicher») und 18:17 («zu früh, zu schnell»): jedes Stück kommt, wenn rund ein Fünftel im Bild ist,
     auch nach dem 22. (vorher standen sie still); nach oben weit offen, wer springt, überspringt nichts */
  const fuenftel = e => e.isIntersecting && (e.intersectionRatio >= 0.2 || e.intersectionRect.height >= innerHeight * 0.2);
  if (!IO) IO = new IntersectionObserver(es => es.forEach(e => { if (fuenftel(e)) { e.target.classList.add('da'); IO.unobserve(e.target); } }), { rootMargin: '100000px 0px 0px 0px', threshold: [0, 0.05, 0.1, 0.15, 0.2] });
  alle.forEach(x => IO.observe(x));
}

/* ---------------------------------------------------------------- Übersicht */
function start() {
  const h = new Date().getHours();
  const gruss = h >= 5 && h < 11 ? t('morgen') : h >= 11 && h < 18 ? t('tag') : t('abend');
  const st = S.d.stand;
  const foto = k => (S.d.fotos.find(f => f.k === k) || {}).fs || '';
  const lg = (ic, mk, b, p, ziel) => `<div class="wo-lg"><i class="wo-lg__z">${WO.ic(ic)}</i><span class="wo-mk">${esc(mk)}</span><b>${b}</b><p>${esc(p)}</p><a class="wo-lk" href="#${ziel}" data-gehe="${ziel}">${esc(t('oeffnen'))}</a></div>`;
  const ag = (ziel, img, ic, name, satz, i, href) => `<${href ? `a href="${href}"` : `button type="button" data-gehe="${ziel}"`} class="wo-ag" data-r style="--i:${i}">
      <span class="wo-ag__b">${img}</span><span class="wo-ag__t"><i class="wo-ag__z">${WO.ic(ic)}</i><b>${esc(name)}</b><span>${esc(satz)}</span></span></${href ? 'a' : 'button'}>`;
  return `${WO.startbild({ werkzeug: 'marke', art: 'voll', h1: `<span data-wo-gruss>${esc(gruss)}</span> <em>${esc(t('frage'))}</em>`, satz: esc(t('start_satz')),
      knoepfe: kn(t('anleitung'), BUCH, 'gold', { href: ANLEITUNG, neu: true }) + kn(t('buch'), PF, 'glas', { href: MARKE }) })}
    <div class="wo-lage" data-r>
      ${lg('foto', t('l_fotos'), zahl(st.fotos), t('l_fotos_s', zahl(st.haus), zahl(st.frei)), 'bilder')}
      ${lg('auge', t('l_ue'), zahl(st.ue), t('l_ue_s', zahl(st.ue)), 'bilder')}
      ${lg('kopie', t('l_dat'), zahl(st.dateien), t('l_dat_s'), 'dateien')}
    </div>
    <h2 class="wo-zw">${esc(t('haeufig'))} <em>${esc(t('gebraucht'))}</em></h2>
    <div class="wo-aufg li-aufg">
      ${ag('bilder', `<span class="li-stapel"><img src="${foto('z-doppel')}" alt="" decoding="async"><img src="${foto('e-plaettli')}" alt="" decoding="async"><img src="${foto('t-kuehe')}" alt="" decoding="async"></span>`, 'foto', t('bilder'), t('k_bilder'), 0)}
      ${ag('dateien', `<span class="li-logo laube-d"><img src="${DAT}${S_}-schriftzug-holz.svg" alt="" decoding="async"></span>`, 'kopie', t('dateien'), t('k_dateien'), 1)}
      ${ag('pruefung', `<span class="li-pr-bild"><span class="li-pr-f">${S.d.farben.filter(x => x.g !== 'heute').slice(0, 9).map(x => `<i style="background:${x.h}"></i>`).join('')}</span><span class="li-pr-de"><b>ΔE</b><small>2000</small></span></span>`, 'auge', t('pruefung'), t('k_pruefung'), 2)}
      ${ag('', `<img src="${foto('haus-giebel')}" alt="" loading="lazy" decoding="async">`, 'buch', t('buch'), t('k_buch'), 3, MARKE)}
    </div>`;
}
function startLeben() { $$('#ansicht [data-gehe]').forEach(b => b.onclick = e => { e.preventDefault(); gehe(b.dataset.gehe); }); }

/* ---------------------------------------------------------------- Bildarchiv */
function titelVon(f) { return (f.t && (f.t[SP] || f.t.de)) || f.k; }
function gefiltert() {
  const F = S.f, q = F.q.trim().toLowerCase();
  return S.d.fotos.filter(f => (F.b === 'alle' || f.b === F.b) && (F.s === 'alle' || f.s === F.s) && (F.f === 'alle' || f.f === F.f || (F.f === 'quer' && f.f === 'quadrat'))
    && (F.h === 'alle' || (F.h === 'ue' ? f.ue : f.art === F.h)) && (!q || Object.values(f.t).join(' ').toLowerCase().includes(q) || f.k.includes(q) || String(t('b_' + f.b)).toLowerCase().includes(q)));
}
function wahl(key, werte) {
  return `<div class="li-wahl"><span class="wo-mk">${esc(t(key === 'b' ? 'bereich' : key === 's' ? 'saison' : key === 'f' ? 'format' : 'herkunft'))}</span><div class="wo-wahl li-wahl2" role="group">
    ${[['alle', t('alle')], ...werte].map(([w, n]) => `<button type="button" data-f="${key}" data-w="${w}" aria-pressed="${S.f[key] === w}">${esc(n)}</button>`).join('')}</div></div>`;
}
const da = (feld, w) => S.d.fotos.some(f => feld === 'ue' ? f.ue : f[feld] === w);
function bilder() {
  const saison = ['sommer', 'herbst', 'winter', 'jahr'].filter(s => da('s', s)).map(s => [s, t('s_' + s)]);
  const herkunft = [['haus', t('h_haus')], ['frei', t('h_frei')], ['ki', t('h_ki')]].filter(([w]) => da('art', w)).concat(da('ue') ? [['ue', t('h_ue')]] : []);
  return `${titel('bilder', teile(t('b_titel')), t('b_satz'))}
    <div class="li-filter" data-r>
      <label class="wo-such li-suche">${LUPE}<input type="search" id="li-q" value="${esc(S.f.q)}" placeholder="${esc(t('suchen'))}" autocomplete="off" maxlength="200"></label>
      ${wahl('b', S.d.bereiche.map(b => [b, t('b_' + b)]))}
      <div class="li-wahl-reihe">${saison.length > 1 ? wahl('s', saison) : ''}${wahl('f', [['hoch', t('f_hoch')], ['quer', t('f_quer')]])}</div>
      ${wahl('h', herkunft)}
      <p class="li-treffer"><span id="li-n"></span><button class="link" type="button" id="li-reset">${esc(t('zuruecksetzen'))}</button></p>
    </div>
    <div class="li-raster" id="li-raster"></div>
    <div class="li-mehr" id="li-mehr"></div>`;
}
function kachel(f, i) {
  return `<button class="li-f li-f--${f.f}" type="button" data-k="${esc(f.k)}" data-r style="--i:${i % 6}" aria-label="${esc(titelVon(f))}">
    <img src="${esc(f.fm || f.fs)}" alt="" loading="lazy" decoding="async" draggable="false">
    ${f.art === 'ki' ? `<span class="li-ki" title="${esc(t('h_ki'))}">${esc(t('ki'))}</span>` : ''}
    <span class="li-f__n">${esc(titelVon(f))}</span></button>`;
}
function raster(neu = false, mehr = false) {
  const L = gefiltert();
  if (neu) S.n = 48;
  $('#li-n').textContent = t('treffer', zahl(L.length), zahl(S.d.fotos.length));
  const r = $('#li-raster');
  const vor = mehr && !r.querySelector('.li-leer') ? r.children.length : 0;
  if (vor) r.insertAdjacentHTML('beforeend', L.slice(vor, S.n).map((f, i) => kachel(f, vor + i)).join(''));
  else r.innerHTML = L.length ? L.slice(0, S.n).map(kachel).join('') : `<p class="li-leer">${esc(t('keine'))}</p>`;
  $('#li-mehr').innerHTML = L.length > S.n ? kn(t('mehr'), PU, 'hell', { id: 'li-mehr-k' }) : '';
  if ($('#li-mehr-k')) $('#li-mehr-k').onclick = () => { S.n += 48; raster(false, true); };
  [].slice.call(r.children, vor).forEach(b => { if (b.dataset.k) b.onclick = () => detail(b.dataset.k); });
  auftritte(r);
  if (S.mehrIO) S.mehrIO.disconnect();
  if ($('#li-mehr-k') && 'IntersectionObserver' in window) { S.mehrIO = new IntersectionObserver(es => { if (es[0].isIntersecting) { S.n += 48; raster(false, true); } }, { rootMargin: '600px' }); S.mehrIO.observe($('#li-mehr-k')); }
}
function bilderLeben() {
  raster(true);
  let uhr;
  $('#li-q').oninput = e => { clearTimeout(uhr); uhr = setTimeout(() => { S.f.q = e.target.value; raster(true); }, 160); };
  $$('[data-f]').forEach(b => b.onclick = () => {
    S.f[b.dataset.f] = b.dataset.w;
    $$(`[data-f="${b.dataset.f}"]`).forEach(x => x.setAttribute('aria-pressed', x === b));
    raster(true);
  });
  $('#li-reset').onclick = () => { S.f = { q: '', b: 'alle', s: 'alle', f: 'alle', h: 'alle' }; zeichne(true); };
}

/* Detail: grosses Bild, Herkunft, Grössen, Ausschnitt für Beitrag und Story, bei bearbeiteten Fotos Vorher/Nachher (L09) */
function detail(k) {
  const f = S.d.fotos.find(x => x.k === k); if (!f) return;
  const fx = { instagram: { x: .5, y: .5 }, story: { x: .5, y: .5 } };
  let aktiv = 'instagram';
  const imp = g => `${IMPRIMERIE}?haus=gasterntal&foto=${encodeURIComponent(k)}&art=${g === 'story' ? 'story' : 'insta'}&x=${fx[g].x.toFixed(3)}&y=${fx[g].y.toFixed(3)}`;
  const link = g => S.server ? `api/bild?k=${encodeURIComponent(k)}&f=${g}${fx[g] ? `&x=${fx[g].x.toFixed(3)}&y=${fx[g].y.toFixed(3)}` : ''}` : f.fl;
  const nurWeb = S.nurWeb === true || (S.nurWeb && S.nurWeb.has(k));
  const zeile = g => `<li class="li-gr" data-g="${g}"><span><b>${esc(t('g_' + g))}</b><small>${esc(g === 'druck' ? (nurWeb ? t('i_druck_web') : t('i_druck', zahl(f.w), zahl(f.h))) : t('i_' + g))}</small></span>
    ${kn(t('laden'), PU, 'dunkel', { href: link(g), download: '', klein: true, attr: `data-laden="${g}"` })}</li>`;
  const art = f.art === 'ki' ? `<p class="li-hinweis li-hinweis--ki"><b>${esc(t('h_ki'))}</b>${esc(t('ki_satz'))}</p>` : f.alt ? `<p class="li-hinweis">${esc(t('archiv'))}</p>` : f.art === 'frei' ? `<p class="li-hinweis">${esc(t('frei_satz'))}</p>` : f.ue ? `<p class="li-hinweis li-hinweis--ue"><b>${esc(t('ki_lang'))}</b>${esc(t('ue_satz'))}${f.vn ? ' ' + esc(t('vn_hilfe')) : ''}</p>` : '';
  const vn = f.vn ? `<img class="li-vn__v" src="${ORIG}${esc(okey(k))}.webp" alt="" decoding="async" draggable="false"><span class="li-vn__gr"><i><svg viewBox="0 0 20 12" width="20" height="12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 1 1 6l5 5M14 1l5 5-5 5"/></svg></i></span><span class="li-vn__t" id="li-vnt">${esc(t('vn_t_nachher'))}</span>
      <div class="li-vn__bar" role="group" aria-label="${esc(t('vn_vorher') + ' / ' + t('vn_nachher'))}"><button type="button" data-vn="vorher" aria-pressed="false">${esc(t('vn_vorher'))}</button><button type="button" data-vn="nachher" aria-pressed="true">${esc(t('vn_nachher'))}</button><button type="button" data-vn="schieber" aria-pressed="false">${esc(t('vn_schieber'))}</button></div>` : '';
  fenster(`<div class="li-det">
    <div class="li-det__b"><div class="li-det__bild" id="li-bild" data-m="nachher" tabindex="-1"><img src="${esc(f.fl)}" alt="${esc(titelVon(f))}" decoding="async" draggable="false"><span class="li-rahmen" id="li-rahmen" hidden></span>${vn}</div>
      <p class="leise li-det__hilfe">${esc(t('ausschnitt'))}</p></div>
    <div class="li-det__t">
      <p class="wo-mk">${esc(t('b_' + f.b))} · ${esc(t('s_' + f.s))} · ${esc(t('f_' + f.f))}</p>
      <h2>${esc(titelVon(f))}</h2>
      ${art}
      <dl class="li-meta"><dt>${esc(t('quelle'))}</dt><dd>${esc(f.q)}</dd><dt>${esc(t('original'))}</dt><dd>${zahl(f.w)} × ${zahl(f.h)} px</dd>${f.vk ? `<dt>${esc(t('vermerk'))}</dt><dd>${esc(f.vk)}</dd>` : ''}</dl>
      <p class="wo-mk li-det__gr">${esc(t('grossen'))}</p>
      <ul class="li-grl">${['instagram', 'story', 'web', 'druck'].map(zeile).join('')}</ul>
      ${f.vn ? `<p class="li-orig">${kn(t('vn_orig'), PU, 'hell', { href: `${ORIG}${okey(k)}.webp`, download: `${S_}-${okey(k)}-vorher.webp`, klein: true })}</p>` : ''}
      ${S.server ? '' : `<p class="leise">${esc(t('ohne_server'))}</p>`}
      <div class="li-imp"><p class="wo-mk li-det__gr">${esc(t('im_titel'))}</p>
        <div class="li-imp__k">${kn(t('im_beitrag'), PF, 'dunkel', { href: imp('instagram'), neu: true, klein: true, attr: 'data-imp="instagram"' })}${kn(t('im_story'), PF, 'hell', { href: imp('story'), neu: true, klein: true, attr: 'data-imp="story"' })}</div>
        <p class="leise">${esc(t('im_satz'))}</p></div>
    </div></div>`);
  const bildEl = $('#li-bild'), rahmen = $('#li-rahmen'), img = $('img', bildEl);
  function setze() {
    const g = FORMATE[aktiv];
    if (!img.naturalWidth || !document.body.contains(bildEl)) { rahmen.hidden = true; return; }
    const W = bildEl.clientWidth, H = bildEl.clientHeight, ziel = g ? g[0] / g[1] : W / H;
    let w = W, h = H;
    if (W / H > ziel) w = H * ziel; else h = W / ziel;
    const p = fx[aktiv] || { x: .5, y: .5 };
    rahmen.classList.toggle('li-rahmen--ganz', !g);
    rahmen.style.transform = `translate(${(W - w) * p.x}px,${(H - h) * p.y}px)`;
    const sk = Math.min(1, 2000 / Math.max(f.w, f.h)), masse = g ? `${g[0]} × ${g[1]}` : aktiv === 'web' ? `${Math.round(f.w * sk)} × ${Math.round(f.h * sk)}` : `${zahl(f.w)} × ${zahl(f.h)}`;
    if (w > W - 6 && h > H - 6) { w -= 12; h -= 12; rahmen.style.transform = 'translate(6px,6px)'; }
    rahmen.style.width = w + 'px'; rahmen.style.height = h + 'px';
    rahmen.dataset.g = t('g_' + aktiv) + ' · ' + masse + ' px';
    rahmen.classList.remove('blitz'); void rahmen.offsetWidth; rahmen.classList.add('blitz');
    rahmen.hidden = false;
    $$('[data-laden]').forEach(a => a.href = link(a.dataset.laden));
    $$('[data-imp]').forEach(a => a.href = imp(a.dataset.imp));
  }
  img.complete ? setze() : img.addEventListener('load', setze);
  $$('.li-gr').forEach(li => {
    const an = () => { aktiv = li.dataset.g; $$('.li-gr').forEach(x => x.classList.toggle('an', x === li)); setze(); };
    li.addEventListener('mouseenter', an); li.addEventListener('focusin', an); li.addEventListener('touchstart', an, { passive: true });
  });
  $('.li-gr').classList.add('an');
  let zug = null;   // Rahmen ziehen (F32: kein Bild-Ziehen, preventDefault im pointerdown)
  rahmen.addEventListener('pointerdown', e => { e.preventDefault(); zug = { x: e.clientX, y: e.clientY, p: { ...(fx[aktiv] || { x: .5, y: .5 }) } }; rahmen.setPointerCapture(e.pointerId); rahmen.classList.add('zieht'); });
  rahmen.addEventListener('pointermove', e => {
    if (!zug || !fx[aktiv]) return;
    const W = bildEl.clientWidth, H = bildEl.clientHeight, w = rahmen.offsetWidth, h = rahmen.offsetHeight;
    fx[aktiv] = { x: W - w > 1 ? Math.min(1, Math.max(0, zug.p.x + (e.clientX - zug.x) / (W - w))) : .5, y: H - h > 1 ? Math.min(1, Math.max(0, zug.p.y + (e.clientY - zug.y) / (H - h))) : .5 };
    setze();
  });
  const los = () => { zug = null; rahmen.classList.remove('zieht'); };
  rahmen.addEventListener('pointerup', los); rahmen.addEventListener('pointercancel', los);
  bildEl.addEventListener('dragstart', e => e.preventDefault());
  addEventListener('resize', setze);
  S.fensterZu = () => removeEventListener('resize', setze);
  if (f.vn) vorherNachher(bildEl, setze);
}
/* Vorher / Nachher: Knöpfe unten im Bild, Schieber zieht eine Kante über das Bild (folgt Maus und Finger, auch in Firefox, F32) */
function vorherNachher(v, setze) {
  function modus(m) {
    v.setAttribute('data-m', m); $('#li-vnt').textContent = t('vn_t_' + m);
    $$('[data-vn]', v).forEach(b => b.setAttribute('aria-pressed', b.dataset.vn === m ? 'true' : 'false'));
    if (m === 'schieber') v.style.setProperty('--p', '50%');
    if (m === 'nachher') setze();
  }
  $$('[data-vn]', v).forEach(b => b.addEventListener('click', e => { e.stopPropagation(); modus(b.dataset.vn); }));
  let zieht = false;
  const hin = e => { const r = v.getBoundingClientRect(); v.style.setProperty('--p', Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)).toFixed(1) + '%'); };
  v.addEventListener('pointerdown', e => { if (v.dataset.m !== 'schieber' || e.target.closest('.li-vn__bar')) return; e.preventDefault(); zieht = true; v.setPointerCapture(e.pointerId); hin(e); });
  v.addEventListener('pointermove', e => { if (zieht) hin(e); });
  v.addEventListener('pointerup', () => { zieht = false; });
  v.addEventListener('pointercancel', () => { zieht = false; });
  v.addEventListener('keydown', e => { if (e.key === 'v' || e.key === 'V') modus(v.dataset.m === 'vorher' ? 'nachher' : 'vorher'); });
}

/* ---------------------------------------------------------------- Dateien */
function dateien() {
  const D = Object.fromEntries(S.d.dateien.map(x => [x.k, x]));
  const gr = n => { const b = S.d.groessen[n]; return b ? (b > 1e6 ? (b / 1e6).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB') : ''; };
  const knoepfe = liste => liste.filter(n => !n.endsWith('.webp') || liste.length === 1).map(n => kn(n.split('.').pop().toUpperCase(), PU, /\.(png|json|ase|css|jpg)$/.test(n) ? 'hell' : 'dunkel', { href: DAT + n, download: '', klein: true, attr: `title="${esc(n)} · ${gr(n)}"` })).join('');
  const block = (k, titel, satz, inhalt, i) => `<section class="li-d" id="d-${k}" data-r style="--i:${i % 2}"><header><h2 class="wo-zw li-d__t">${zwei(titel)}</h2><p class="leise">${esc(satz)}</p></header>${inhalt}</section>`;
  const vname = (g, v) => g === 'tapete' ? t('v_' + (v.k === 'talwand' ? 't_talwand' : v.k)) : g === 'teile' ? t('v_' + v.k.split('-')[0]) + ' · ' + t('v_' + v.k.split('-')[1]) : t('v_' + v.k);
  const tafeln = (g, breit) => `<div class="li-tafeln ${breit ? 'li-tafeln--breit' : ''}">${D[g].var.map(v => `<figure class="li-tafel li-tafel--${v.grund}">
      <div class="li-tafel__f"><img src="${DAT}${esc(v.dateien.find(x => x.endsWith('.svg')) || v.dateien[0])}" alt="" loading="lazy" decoding="async"></div>
      <figcaption><span><b>${esc(vname(g, v))}</b><small>${v.px ? zahl(v.px[0]) + ' × ' + zahl(v.px[1]) + ' px' : ''}</small></span><span class="li-kn">${knoepfe(v.dateien)}</span></figcaption></figure>`).join('')}</div>`;
  const gruppen = S.d.gruppen.map(g => {
    const fs = S.d.farben.filter(f => f.g === g.k); if (!fs.length) return '';
    return `<div class="li-fg${g.k === 'heute' ? ' li-fg--heute' : ''}" data-r><h3>${esc(g.n)}</h3><p class="leise">${esc(g.s)}</p><div class="li-farben">${fs.map((f, i) => `<button class="li-farbe" type="button" data-kopie="${f.h}" style="--c:${f.h};--i:${i % 6}">
      <span class="li-farbe__f"><span class="li-farbe__ok">${esc(t('kopiert'))}</span></span>
      <span class="li-farbe__n"><b>${esc(f.n)}</b><small>${esc(f.r)}</small></span>
      <span class="li-farbe__w"><span data-kopie-w="${f.h}">${f.h}</span><span data-kopie-w="rgb(${f.rgb.join(', ')})">RGB ${f.rgb.join(' · ')}</span></span></button>`).join('')}</div></div>`;
  }).join('');
  const schriften = S.d.schriften.map(s => `<li class="li-schrift"><span class="li-schrift__p f-${esc(s.k)}">${esc(s.p)}</span><span><b>${esc(s.n)}</b><small>${esc(s.r)} · ${esc(s.e)}</small></span>
      ${kn('WOFF2', PU, 'hell', { href: `/assets/fonts/${s.d}`, download: '', klein: true })}</li>`).join('');
  return `${titel('dateien', teile(t('d_titel')), t('d_satz'), kn(t('alles_zip'), PU, 'gold', { href: `${DAT}${S_}-marke.zip`, download: '' }) + kn(t('regeln'), PF, 'glas', { href: MARKE + '#zeichen' }))}
    ${block('schriftzug', t('d_schriftzug'), t('d_schriftzug_s'), tafeln('schriftzug', true), 0)}
    ${block('teile', t('d_teile'), t('d_teile_s'), tafeln('teile', true), 1)}
    ${block('raute', t('d_raute'), t('d_raute_s'), tafeln('raute'), 0)}
    ${block('name', t('d_name'), t('d_name_s'), tafeln('name', true), 1)}
    ${block('tapete', t('d_tapete'), t('d_tapete_s'), `<div class="li-tafeln">${D.tapete.var.map(v => `<figure class="li-tafel li-tafel--${v.grund}"><div class="li-tafel__f li-tapete" style="background-image:url(${DAT}${esc(v.dateien.find(x => x.endsWith('.webp')))})"></div>
      <figcaption><span><b>${esc(vname('tapete', v))}</b><small>${v.px[0]} × ${v.px[1]} px · ${String(Math.round(v.deck * 1000) / 10).replace('.', ',')} %</small></span><span class="li-kn">${knoepfe(v.dateien.filter(x => !x.endsWith('.webp')))}</span></figcaption></figure>`).join('')}</div>`, 0)}
    ${block('farben', t('d_farben'), t('d_farben_s'), `${gruppen}<div class="li-kn li-kn--mitte">${knoepfe(D.farben.var[0].dateien)}</div>`, 1)}
    ${block('schriften', t('d_schriften'), t('d_schriften_s'), `<ul class="li-schriften">${schriften}</ul><div class="li-kn li-kn--mitte">${knoepfe(D.schriften.var[0].dateien)}</div>`, 0)}
    ${block('karte', t('d_karte'), t('d_karte_s'), tafeln('karte'), 1)}`;
}
function zwei(s) { const i = s.lastIndexOf(' '); return i > 0 ? `${esc(s.slice(0, i))} <em>${esc(s.slice(i + 1))}</em>` : esc(s); }
function kopiere(w, el) {
  const ok = () => { if (el) { el.classList.add('kopiert'); setTimeout(() => el.classList.remove('kopiert'), 1400); } melde(t('kopiert') + ' · ' + w); };
  if (navigator.clipboard && isSecureContext) navigator.clipboard.writeText(w).then(ok, () => alt());
  else alt();
  function alt() { const x = document.createElement('textarea'); x.value = w; x.setAttribute('readonly', ''); x.style.position = 'fixed'; x.style.opacity = '0'; document.body.appendChild(x); x.select(); try { document.execCommand('copy'); ok(); } catch (e) { /* nichts */ } x.remove(); }
}
function dateienLeben() {
  $$('[data-kopie]').forEach(b => b.onclick = e => { const w = e.target.closest('[data-kopie-w]'); kopiere(w ? w.dataset.kopieW : b.dataset.kopie, b); });
}

/* ---------------------------------------------------------------- Markenprüfung */
function pruefung() {
  return `${titel('pruefung', teile(t('p_titel')), t('p_satz'))}<div id="li-pr"></div><div id="li-bsp-erg"></div>`;
}
function pruefungLeben() { S.ergebnis ? ergebnis(S.ergebnis) : feld(); if (!S.ergebnis && /[?&]beispiel=1/.test(location.search)) beispielPruefung(); }
/* Beispiel: ein eigens gezeichneter Entwurf (beispiel/entwurf.png), Farben wirklich gemessen, Rückmeldung von Hand (von_hand), überall so beschriftet */
async function beispielPruefung() {
  try {
    const r = await fetch('beispiel/pruefung.json', { cache: 'no-store' }); if (!r.ok) throw new Error(r.status);
    const j = await r.json(); j.beispiel = true;
    S.ergebnis = j; if (S.ansicht === 'pruefung') ergebnis(j);
  } catch (e) { melde(t('p_fehler'), true); }
}
function feld() {
  const d = S.datei;
  $('#li-pr').innerHTML = `<div class="platte li-feld" id="li-feld" data-r>
      <input type="file" id="li-datei" accept="image/jpeg,image/png,image/webp,application/pdf" hidden>
      <div class="li-feld__in">
        ${d ? `<div class="li-feld__vor">${d.bild ? `<img src="${d.bild}" alt="">` : `<span class="li-pdf">PDF</span>`}</div><p class="li-feld__name"><b>${esc(d.name)}</b><small>${(d.groesse / 1e6).toFixed(1).replace('.', ',')} MB</small></p>`
          : `<span class="li-feld__z">${ZEICHEN_N}</span><p class="li-feld__t">${esc(t('p_feld'))}</p><p class="leise">${esc(t('p_feld2'))}</p>`}
        <div class="li-feld__kn">${kn(t('p_waehlen'), PO, d ? 'hell' : 'dunkel', { id: 'li-waehle' })}${d ? kn(t('p_pruefen'), PF, 'gold', { id: 'li-los' }) : ''}</div>
        ${d ? '' : `<p class="li-bsp"><button class="link" type="button" id="li-bsp">${esc(t('p_beispiel'))}</button></p>`}
      </div>
      <p class="li-privat">${esc(t('p_privat'))}</p>
    </div>`;
  const inp = $('#li-datei'), fl = $('#li-feld');
  $('#li-waehle').onclick = () => inp.click();
  inp.onchange = () => inp.files[0] && nimm(inp.files[0]);
  ['dragenter', 'dragover'].forEach(n => fl.addEventListener(n, e => { e.preventDefault(); fl.classList.add('ueber'); }));
  ['dragleave', 'drop'].forEach(n => fl.addEventListener(n, e => { e.preventDefault(); fl.classList.remove('ueber'); }));
  fl.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) nimm(f); });
  if ($('#li-los')) $('#li-los').onclick = pruefe;
  if ($('#li-bsp')) $('#li-bsp').onclick = () => { const u = $('#li-bsp-erg'); if (u && u.firstChild) u.scrollIntoView({ behavior: RUHIG() ? 'auto' : 'smooth', block: 'start' }); else beispielPruefung(); };
  auftritte($('#li-pr'), true);
  beispielUnten(!d);
}
/* R20: unter dem leeren Feld steht immer eine fertige Beispiel-Prüfung, deutlich als Beispiel beschriftet */
async function beispielUnten(an) {
  const u = $('#li-bsp-erg'); if (!u) return;
  if (!an) { u.innerHTML = ''; return; }
  try {
    if (!S.bspJ) { const r = await fetch('beispiel/pruefung.json'); if (!r.ok) throw new Error(r.status); S.bspJ = await r.json(); S.bspJ.beispiel = true; }
    if (S.datei || S.ergebnis || S.ansicht !== 'pruefung' || !$('#li-bsp-erg')) return;
    $('#li-bsp-erg').innerHTML = '<div class="li-bsp-unten"></div>'; ergebnis(S.bspJ, $('#li-bsp-erg .li-bsp-unten'));
  } catch (e) { /* ohne Beispiel bleibt das Feld */ }
}
function nimm(f) {
  if (!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(f.type)) { melde(t('p_typ'), true); return; }
  if (f.size > 30 * 1024 * 1024) { melde(t('p_gross'), true); return; }
  if (f.type === 'application/pdf' && f.size > PDF_ONLINE && !LOKAL) { melde(t('p_pdf_online'), true); return; }
  const r = new FileReader();
  r.onload = () => { S.datei = { name: f.name, typ: f.type, groesse: f.size, daten: r.result, bild: f.type === 'application/pdf' ? '' : r.result }; feld(); };
  r.readAsDataURL(f);
}
/* L10: grosse Bilder vor dem Senden auf 2400 px verkleinern (online nimmt eine Funktion höchstens 4,5 MB). PDFs gehen unverändert. */
const PDF_ONLINE = 3 * 1024 * 1024, LOKAL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
function verkleinert(d) {
  return new Promise(ok => {
    if (!/^image\//.test(d.typ)) return ok(d.daten);
    const i = new Image();
    i.onload = () => {
      const m = Math.max(i.naturalWidth, i.naturalHeight), f = Math.min(1, 2400 / m);
      if (f === 1 && d.groesse < 2.5 * 1024 * 1024) return ok(d.daten);
      const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(i.naturalWidth * f)); c.height = Math.max(1, Math.round(i.naturalHeight * f));
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(i, 0, 0, c.width, c.height);
      try { ok(c.toDataURL('image/jpeg', .92)); } catch (e) { ok(d.daten); }
    };
    i.onerror = () => ok(d.daten);
    i.src = d.daten;
  });
}
async function pruefe() {
  const d = S.datei; if (!d) return;
  const schritte = [t('p_schritt1'), t('p_schritt2'), t('p_schritt3')];
  $('#li-pr').innerHTML = `<div class="platte li-lauf" data-r><div class="li-lauf__b">${d.bild ? `<img src="${d.bild}" alt="">` : `<span class="li-pdf">PDF</span>`}<span class="li-scan"></span></div>
    <div><ol class="li-schritte">${schritte.map((s, i) => `<li data-i="${i}"><i></i><span>${esc(s)}</span></li>`).join('')}</ol><p class="leise">${esc(t('p_dauer'))}</p></div></div>`;
  auftritte($('#li-pr'), true);
  const li = $$('.li-schritte li');
  let n = 0; li[0].classList.add('an');
  const uhr = setInterval(() => { if (n < 2) { li[n].classList.replace('an', 'fertig'); n++; li[n].classList.add('an'); } }, 1600);
  try {
    const daten = await verkleinert(d);
    const r = await fetch('api/pruefen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: d.name, typ: daten === d.daten ? d.typ : 'image/jpeg', daten, sprache: SP === 'pr' ? 'de' : SP }) });
    let j = {}; try { j = await r.json(); } catch (e) { /* leer */ }
    if (!r.ok) throw new Error(String(j.fehler || r.status).replace(/^[A-ZÄÖÜ-]+ · /, ''));
    clearInterval(uhr); li.forEach(x => { x.classList.remove('an'); x.classList.add('fertig'); });
    S.ergebnis = j;
    setTimeout(() => ergebnis(j), 380);
  } catch (e) {
    clearInterval(uhr);
    melde(t('p_fehler') + ': ' + (/Failed to fetch|NetworkError|Load failed/.test(e.message) ? (navigator.onLine === false ? t('p_offline') : t('fehler_verb')) : /^\d+$/.test(e.message) ? t('fehler_code', e.message) : e.message), true);
    feld();
  }
}
function ergebnis(j, ziel) {
  const Z = ziel || $('#li-pr');
  const m = j.messung, k = j.ki || {};
  const pr = x => Math.round(x * 100);
  // L04 (Robert 18.10.2026 13:40: «so richtig edel professionell»): ein Farbband mit den Anteilen in einer Zeile, darunter ein ruhiges Raster, höchstens acht Felder
  const T8 = m.toene.slice().sort((a, b) => b.anteil - a.anteil), zeig = T8.slice(0, 8), rest = T8.length - zeig.length;
  const band = `<div class="li-band" role="img" aria-label="${esc(t('p_rahmen', pr(m.im_rahmen)))}">${T8.map(x => `<i class="li-band--${x.urteil}" style="flex:${Math.max(x.anteil, .006)} 1 0;background:${x.hex}" title="${x.hex.toUpperCase()} · ${x.anteil < .01 ? '&lt;1' : pr(x.anteil)} %"></i>`).join('')}</div>`;
  const toene = zeig.map((x, i) => `<li class="li-fr li-fr--${x.urteil}" style="--i:${i}">
      <span class="li-fr__f" style="background:${x.hex}"></span>
      <span class="li-fr__w"><b>${x.anteil < .01 ? '&lt;1' : pr(x.anteil)} %</b><em>${esc(t('p_' + x.urteil))}</em></span>
      <span class="li-fr__h" title="${esc(t('p_naechste'))} · ΔE ${String(x.de).replace('.', ',')}"><code>${x.hex.toUpperCase()}</code><i style="background:${esc(x.palette)}"></i>${esc(x.name)}</span></li>`).join('') + (rest > 0 ? `<li class="li-fr li-fr--rest">+ ${rest} kleine Töne unter 1 %</li>` : '');
  const sonder = [m.schwarz > .01 ? t('p_schwarz', pr(m.schwarz), hex('tinte')) : ''].filter(Boolean);
  const reihe = { passt_nicht: 0, achten: 1, passt: 2 };
  const punkte = (k.punkte || []).slice().sort((a, b) => (reihe[a.urteil] ?? 1) - (reihe[b.urteil] ?? 1)).map((p, i) => `<li class="li-pk li-pk--${esc(p.urteil)}" data-r style="--i:${i}">
      <span class="li-pk__m"><em>${esc(t('u_' + p.urteil) || p.urteil)}</em><small>${esc((t('ber')[p.bereich]) || p.bereich)}</small></span>
      <span class="li-pk__t"><b>${esc(p.titel)}</b><span>${esc(p.text)}</span></span></li>`).join('');
  const ton = (k.ton || []).filter(x => x.stelle && x.vorschlag).map(x => `<li><s>${esc(x.stelle)}</s><span>${esc(x.vorschlag)}</span></li>`).join('');
  if (!ziel) { const u = $('#li-bsp-erg'); if (u) u.innerHTML = ''; }
  Z.innerHTML = `<div class="li-erg">
    <aside class="li-erg__l">
      <figure class="platte li-erg__bild" data-r><img src="${j.vorschau}" alt="${esc(j.name)}"><figcaption><b>${esc(j.name)}</b>${j.seiten > 1 ? `<small>${esc(t('p_seiten', j.seiten, Math.min(j.seiten, 3)))}</small>` : ''}</figcaption></figure>
      <section class="platte li-erg__farben" data-r><h3>${esc(t('p_farben'))}</h3><p class="leise">${esc(t('p_farben_s'))}</p>
        ${band}<p class="li-band__s"><b>${pr(m.im_rahmen)} %</b> ${esc(t('p_rahmen', pr(m.im_rahmen)).replace(/^\d+ % /, ''))}</p>
        <ol class="li-fraster">${toene}</ol>${sonder.length ? `<ul class="li-sonder">${sonder.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}</section>
    </aside>
    <div class="li-erg__r">
      ${j.beispiel ? `<p class="platte li-hinweis li-hinweis--bsp" data-r><b>Beispiel</b>${esc(t(j.von_hand ? 'p_beispiel_hand' : 'p_beispiel_h'))}</p>` : ''}
      ${j.probe ? `<p class="platte li-hinweis li-hinweis--probe" data-r><b>Beispiel</b>${esc(t('p_probe'))}</p>` : ''}
      ${j.ki_fehler ? `<p class="platte li-hinweis li-hinweis--ki" data-r>${esc(t('p_ki_fehler', String(j.ki_fehler).replace(/^[A-ZÄÖÜ-]+ · /, '')))}</p>` : `
      <section class="platte li-gesamt" data-r><p class="wo-mk">${esc(t('p_gesamt'))}${k.art ? ' · ' + esc(k.art) : ''}</p><p class="li-gesamt__s">${esc(k.gesamt || '')}</p></section>
      <h3 class="li-erg__h">${esc(t('p_punkte'))}</h3><ol class="li-punkte">${punkte}</ol>
      ${ton ? `<section class="platte li-tonvor" data-r><h3>${esc(t('p_ton'))}</h3><ul>${ton}</ul></section>` : ''}
      ${k.text ? `<details class="li-gelesen"><summary class="wo-mk">${esc(t('p_text'))}</summary><p>${esc(k.text)}</p></details>` : ''}`}
      <div class="li-erg__kn">${kn(t('p_neu'), PO, 'dunkel', { attr: 'data-neu' })}${kn(t('p_kopie'), KOPIE, 'hell', { attr: 'data-kopie-erg' })}${kn(t('p_sichern'), PU, 'hell', { attr: 'data-sichern' })}</div>
    </div></div>`;
  auftritte(Z);
  const q = x => Z.querySelector(x);
  q('[data-neu]').onclick = () => { S.ergebnis = null; S.datei = null; feld(); scrollTo({ top: 0, behavior: RUHIG() ? 'auto' : 'smooth' }); };
  q('[data-kopie-erg]').onclick = () => kopiere(alsText(j));
  q('[data-sichern]').onclick = () => sichere(j);
}
function alsText(j) {
  const m = j.messung, k = j.ki || {};
  const z = [`${t('name')} · ${t('pruefung')} · ${j.name}`, ''];
  if (j.beispiel) z.push(t('p_beispiel_hand'), '');
  if (j.probe) z.push(t('p_probe'), '');
  if (k.gesamt) z.push(k.gesamt, '');
  (k.punkte || []).forEach(p => z.push(`· ${(t('ber')[p.bereich]) || p.bereich} – ${t('u_' + p.urteil) || p.urteil}: ${p.titel}. ${p.text}`));
  z.push('', t('p_farben') + ':');
  m.toene.forEach(x => z.push(`  ${x.hex.toUpperCase()} ${Math.round(x.anteil * 100)} % → ${x.name} ${x.palette.toUpperCase()}, ΔE ${x.de} (${t('p_' + x.urteil)})`));
  (k.ton || []).forEach(x => z.push('', `«${x.stelle}» → «${x.vorschlag}»`));
  return z.join('\n');
}
function sichere(j) {
  // nur auf ausdrücklichen Wunsch: eine Datei auf diesem Rechner, nichts auf dem Server
  const html = `<!doctype html><meta charset="utf-8"><title>${esc(t('name'))} · ${esc(j.name)}</title><body style="font:15px/1.6 system-ui;max-width:820px;margin:40px auto;color:#1a1f21;background:#e9ecec;padding:0 20px">
    <h1 style="font:600 32px 'Arial Narrow',system-ui">${esc(t('pruefung'))}: ${esc(j.name)}</h1><img src="${j.vorschau}" style="max-width:360px;border-radius:12px"><pre style="white-space:pre-wrap;font:14px/1.6 system-ui">${esc(alsText(j))}</pre>
    <p style="color:#3b4423;font-size:12px">${esc(t('name'))} · ${esc(S.d.haus)}, ${esc(S.d.ort)} · ${new Date().toLocaleString('de-CH')}</p></body>`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  a.download = 'hausbuch-pruefung-' + (j.name.replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9äöü_-]+/gi, '-').toLowerCase().slice(0, 60) || 'entwurf') + '.html';
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

/* ---------------------------------------------------------------- Fenster, Meldung */
let VORHER_FOKUS = null;
function fenster(html) {
  const f = $('#fenster');
  VORHER_FOKUS = document.activeElement;
  f.innerHTML = `<div class="fenster__k li-fk" role="dialog" aria-modal="true" aria-label="${esc(t('bilder'))}"><button class="wo-kn wo-kn--rund fenster__zu" type="button" data-zu aria-label="${esc(t('schliessen'))}">${ZU}</button>${html}</div>`;
  f.hidden = false; document.body.classList.add('li-zu');
  $$('[data-zu]', f).forEach(b => b.onclick = fensterZu);
  f.onclick = e => { if (e.target === f) fensterZu(); };
  const zu = $('[data-zu]', f); if (zu) zu.focus({ preventScroll: true });
}
function fensterZu() {
  if (S.fensterZu) { S.fensterZu(); S.fensterZu = null; }
  $('#fenster').hidden = true; $('#fenster').innerHTML = ''; document.body.classList.remove('li-zu');
  if (VORHER_FOKUS && VORHER_FOKUS.focus) VORHER_FOKUS.focus({ preventScroll: true });
}
addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#fenster').hidden) fensterZu(); });
function melde(text, fehl = false) {
  const m = $('#meldung'); while (m.children.length >= 3) m.firstChild.remove();
  const q = document.createElement('div');
  q.className = 'wo-quittung li-quit' + (fehl ? ' fehl' : '');
  q.setAttribute('role', 'status');
  q.innerHTML = `<i>${fehl ? WO.ic('x') : WO.ic('haken')}</i><span><b>${esc(text)}</b></span><button type="button" aria-label="${esc(t('schliessen'))}">${WO.ic('x')}</button>`;
  q.querySelector('button').onclick = () => q.remove();
  m.appendChild(q);
  setTimeout(() => q.remove(), fehl ? 9000 : 2600);
}

/* ---------------------------------------------------------------- Start */
/* Startfehler-Tür (R04): statt einer leeren Fläche sagt das Hausbuch, dass und warum es nicht startet */
function startfehler(grund) {
  window.LIVRE_BEREIT = true; clearTimeout(window.LIVRE_LADE);
  $('#ansicht').innerHTML = `<div class="platte li-tuer" role="alert"><span class="li-tuer__z">${ZEICHEN_N}</span><h1>${esc(t('tuer_t'))}</h1>
    <p class="li-tuer__g">${esc(grund)}</p><p>${esc(t('tuer_hilfe'))}</p>
    <div class="titel__kn">${kn(t('tuer_neu'), PF, 'dunkel', { attr: 'data-neu' })}${kn(t('anleitung'), PF, 'hell', { href: ANLEITUNG, neu: true })}</div></div>`;
  const b = $('#ansicht [data-neu]'); if (b) b.onclick = () => location.reload();
}
/* Beigaben wie in den anderen Werkzeugen: «Zur Werkbank» (R19, nur aus der Werkbank geöffnet) und der kurze Rundgang (R18), Fassung wie livre.js (F08) */
function beigabe(src, daten) {
  const s = document.createElement('script'); s.src = src + '?v=' + ((($('script[src*="livre.js"]') || {}).src || '').split('v=')[1] || 1); s.defer = true;
  Object.entries(daten || {}).forEach(([k, v]) => s.setAttribute('data-' + k, v));
  document.body.appendChild(s);
}
/* Auftakt (R02): ruhig warten, bis Schriften und das Foto des Startbilds da sind, höchstens 2,5 s, dann alles auf einmal */
function bereit(ansicht) {
  const bild = new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = fotoVon(ansicht); if (i.decode) i.decode().then(r, r); });
  return Promise.race([Promise.all([document.fonts ? document.fonts.ready : 0, bild]), new Promise(r => setTimeout(r, 2500))]);
}
(async function () {
  document.documentElement.lang = SP === 'de' ? 'de-CH' : SP;
  try {
    if (!window.WO) throw new Error('Rahmen (oberflaeche.js) fehlt');
    const vorgeladen = $('link[rel="preload"][as="fetch"]');
    try {
      const r = await fetch(vorgeladen ? vorgeladen.getAttribute('href') : 'livre.json', vorgeladen ? {} : { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      S.d = await r.json();
      if (!S.d || !Array.isArray(S.d.fotos) || !S.d.stand || !Array.isArray(S.d.farben)) throw new Error('Form');
    } catch (e) { return startfehler(t('fehler_json') + ' (' + (/Failed to fetch|Load failed|NetworkError/.test(e.message) ? 'offline' : e.message) + ')'); }
    const h = location.hash.slice(1);
    try {
      const ausMaison = /\/maison\/?(index\.html)?([?#].*)?$/.test(document.referrer) && ((performance.getEntriesByType('navigation')[0] || {}).type !== 'reload');
      S.ansicht = ANSICHTEN.includes(h) ? h : ausMaison ? (localStorage.removeItem('bg-livre-ansicht'), 'start') : (ANSICHTEN.includes(localStorage.getItem('bg-livre-ansicht')) ? localStorage.getItem('bg-livre-ansicht') : 'start');
    } catch (e) { S.ansicht = 'start'; }
    await bereit(S.ansicht);
    clearTimeout(window.LIVRE_LADE);
    kopf(); rand(); leiste(); zeichne();
    document.body.classList.add('li-bereit'); window.LIVRE_BEREIT = true;
  } catch (e) { return startfehler(String(e && e.message || e).slice(0, 200)); }
  addEventListener('hashchange', () => { const a = location.hash.slice(1); if (ANSICHTEN.includes(a) && a !== S.ansicht) gehe(a); });
  fetch('api/stand', { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject()).then(j => { S.server = true; S.nurWeb = new Set(j.ohne_original || []); }).catch(() => { S.server = false; });
  beigabe('zur-werkbank.js', { zw: '', neben: '#rand', ueber: '#leiste' });
  beigabe('rundgang.js', { werkzeug: 'livre' });
})();
