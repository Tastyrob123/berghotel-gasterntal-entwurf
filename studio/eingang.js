/* Eingang · Studio · Berghotel Gasterntal (17.10.2026). Die Anfragen aus dem Anfrage-Fenster der Website (assets/js/anfrage.js) für das Team:
   Anliegen, Datum, Personen, Name, Kontakt, Nachricht. Alles geht an gasterntal@doldenhorn.ch; sortiert wird nach Art (Zimmer, Tisch und Sauna, Picknick und Fahrt, Übrige),
   abgelesen am Anliegen, das die Formulare der Seite vorbelegen. Vorlage: Eingang des Waldhotel Doldenhorn (studio/eingang.js), dort nach La Réception des Grand Beau-Rivage
   (Filter Neu/Offen/Erledigt, Detail, gelesen beim Öffnen, erledigt/wieder offen, löschen, alle zwei Minuten von selbst nachsehen).
   Liest und schreibt nur über /api/anfragen (online api/anfragen.js mit dem privaten Blob-Speicher, lokal studio.py → _dienste/anfragen.jsonl + anfragen_stand.json).
   Aus dem Eingang wird nichts verschickt und kein Mailprogramm geöffnet (17.10.2026): «Antwort-Text kopieren» legt Anrede und Anfrage in die Zwischenablage.
   Der Eingang ist im Gastgeber (La Réception, _werkzeuge/reception/) aufgegangen; diese Seite bleibt nur als Rückfall (eingang-fehler.js leitet weiter). */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const h = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
const KNI = `<i>${PF}</i>`;
const SYM_OK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7"/></svg>';
const IK = {  // Strichzeichen wie im Studio (studio.js IK)
  brief: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  haus: '<path d="M3 11 12 4l9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-6h4v6"/>',
};
const ik = n => `<span class="ik" aria-hidden="true"><svg viewBox="0 0 24 24">${IK[n]}</svg></span>`;
/* Art der Anfrage, abgelesen am Anliegen (die Formulare der Seite belegen es vor: «Anfrage Zimmer …», «Tisch …», «Sauna in der alten Käserei, …»,
   «Luxus-Picknick, …», «Fahrt hinunter nach Kandersteg, …», «Das Hotel exklusiv, …», «Vor der Anreise: …») */
const AB = { zimmer: 'Zimmer', tisch: 'Tisch & Sauna', draussen: 'Picknick & Fahrt', sonst: 'Übrige' };
const AB_SATZ = { zimmer: 'Zimmeranfragen und das Hotel exklusiv', tisch: 'Tisch reservieren, Sauna in der alten Käserei', draussen: 'Luxus-Picknick, Fahrt hinunter nach Kandersteg', sonst: 'Vor der Anreise und alle übrigen Fragen' };
const art = t => /zimmer|exklusiv/i.test(t) ? 'zimmer' : /sauna|tisch|essen|abendessen|mittag|zmorge/i.test(t) ? 'tisch' : /picknick|fahrt|hinunter|abreise/i.test(t) ? 'draussen' : '';
const ab = a => art(String(a.anliegen || '')) || art(String(a.seite || '')) || 'sonst';   // erst das Anliegen, nur wenn es nichts sagt die Seite, von der die Anfrage kam
const SEITEN = { 'index': 'Startseite', 'zimmer': 'Zimmer', 'essen': 'Ässe u trinke', 'sauna': 'Sauna', 'picknick': 'Luxus-Picknick', 'feste': 'Feste und Gruppen', 'offen': 'Sind wir offen?',
  'anreise': 'Vor Ihrer Anreise', 'abreise': 'Der Weg hinunter', 'lage': 'Das Tal', 'rechtliches': 'Rechtliches' };
const seite = p => { const k = String(p || '').replace(/^\/+|\.html$/g, '').split('/').pop() || 'index'; return SEITEN[k] || k; };
const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/* Probe-Einträge (Prüfläufe, Tests) sichtbar kennzeichnen, damit niemand ihnen antwortet */
const probe = a => /\b(probe|prüfung|pruefung|test|qa)\b/i.test([a.name, a.anliegen, a.kontakt].join(' ')) || /@example\.(com|org)$/i.test(a.kontakt || '');
const BEISPIEL = { id: 'beispiel', beispiel: true, stand: 'neu', zeit: new Date().toISOString(), an: 'gasterntal@doldenhorn.ch', anliegen: 'Anfrage Zimmer 14.06.2027 bis 16.06.2027, 2 Personen', datum: '2027-06-14', personen: '2',
  name: 'Beispiel: Anna Muster', kontakt: 'anna.muster@beispiel.ch', seite: '/zimmer.html', sprache: 'de',
  nachricht: 'Beispiel einer Anfrage, so wie sie aus dem Fenster der Website hier ankommt. Wir möchten zwei Nächte bleiben und am zweiten Abend die Sauna reservieren.' };

let A = null, FILTER = 'offen', ABT = 'alle', WAHL = null, ZEIGE_BEISPIEL = false, ZULETZT = null, MITHALT = '';

function sag(t, fehler) {
  const d = document.createElement('div'); d.className = fehler ? 'f' : ''; d.textContent = t;
  const m = $('#meldung'); m.appendChild(d); while (m.children.length > 3) m.firstChild.remove();
  setTimeout(() => d.remove(), 6000);
}
async function api(koerper) {
  let r;
  try { r = await fetch('/api/anfragen', koerper ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(koerper), cache: 'no-store' } : { cache: 'no-store' }); }
  catch (e) { const f = new Error('Keine Verbindung. Bitte die Internetverbindung prüfen und noch einmal versuchen.'); f.netz = true; throw f; }
  let j = {}; try { j = await r.json(); } catch (e) {}
  if (!r.ok) throw new Error(r.status === 403 ? 'Der Eingang darf die Anfragen hier nicht lesen. Bitte über die Adresse des Studios öffnen.' : (j.fehler || 'Das hat nicht geklappt.'));
  return j;
}
function zeitText(z) {
  const d = new Date(z); if (isNaN(d)) return '';
  const heute = new Date(), gestern = new Date(Date.now() - 864e5), uhr = d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === heute.toDateString()) return 'Heute, ' + uhr + ' Uhr';
  if (d.toDateString() === gestern.toDateString()) return 'Gestern, ' + uhr + ' Uhr';
  return d.toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'long', year: d.getFullYear() === heute.getFullYear() ? undefined : 'numeric' }) + ', ' + uhr + ' Uhr';
}
function wunsch(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim());
  return m ? new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : String(s || '');
}
const liste = () => (A || []).concat(ZEIGE_BEISPIEL ? [BEISPIEL] : []);
const passt = a => (FILTER === 'alle' || (FILTER === 'neu' ? a.stand === 'neu' : FILTER === 'erledigt' ? a.stand === 'erledigt' : a.stand !== 'erledigt')) && (ABT === 'alle' || ab(a) === ABT);

// ---------------------------------------------------------------- Rahmen
function rand() {
  const neu = (A || []).filter(a => a.stand === 'neu').length;
  $('#rand').innerHTML = `<a class="rand__marke" href="./#/uebersicht"><img src="/assets/logo/schrift-berghotel-gasterntal.svg" alt="Berghotel Gasterntal"><span>Studio</span></a>
  <nav aria-label="Bereiche"><a href="./#/uebersicht">${ik('haus')}Zum Studio</a><div class="rand__trenn"></div>
    <a href="eingang.html" class="an" aria-current="page">${ik('brief')}Eingang${neu ? `<b>${neu}</b>` : ''}</a></nav>
  <div class="rand__fuss"><a href="/" target="_blank" rel="noopener">Website ansehen ${PF}</a><a href="pruefung.html" target="_blank" rel="noopener">Prüfung ${PF}</a></div>`;
}
function leiste() {
  $('#leiste').innerHTML = `<div class="leiste__l"><span><b>${ZULETZT ? 'Nachgesehen um ' + ZULETZT.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }) + '<span class="eg-uhr"> Uhr</span>' : 'Die Anfragen werden geladen'}</b><small>Neue Anfragen erscheinen von selbst, alle zwei Minuten wird nachgesehen.</small></span></div>
  <div class="leiste__r"><button class="kn kn--klein" type="button" data-akt="neu">Jetzt nachsehen${KNI}</button></div>`;
}

// ---------------------------------------------------------------- Ansicht
function zeichne() {
  const l = liste(), n = s => l.filter(a => !a.beispiel && (s === 'offen' ? a.stand !== 'erledigt' : a.stand === s)).length, neu = n('neu');
  const sicht = l.filter(passt);
  if (WAHL && !l.some(a => a.id === WAHL)) WAHL = null;
  const zahlAb = k => l.filter(a => !a.beispiel && a.stand !== 'erledigt' && ab(a) === k).length;
  $('#ansicht').innerHTML = `<header class="kopfz"><div><h1>Eingang. <em>Anfragen von der Website.</em></h1>
      <p>Alles, was Gäste über das Anfrage-Fenster der Website schicken, landet hier: Zimmer, Tisch und Sauna, Luxus-Picknick, die Fahrt hinunter und jede andere Frage ans Haus.</p></div></header>
    <section class="lage eg-lage"><div><h2>${neu ? `${neu} ${neu === 1 ? 'neue Anfrage' : 'neue Anfragen'} <em>warten.</em>` : n('offen') ? `Alles gelesen, <em>${n('offen')} noch offen.</em>` : 'Alles <em>beantwortet.</em>'}</h2>
      <p>${A && A.length ? `${A.length} ${A.length === 1 ? 'Anfrage' : 'Anfragen'} im Eingang, ${n('erledigt')} erledigt.` : 'Noch keine Anfrage. Sobald ein Gast das Fenster auf der Website abschickt, steht sie hier.'}</p></div>
      <div class="eg-zahlen">${Object.keys(AB).map(k => `<button type="button" data-abt="${k}" class="${ABT === k ? 'an' : ''}" title="${h(AB_SATZ[k])}"><b>${zahlAb(k)}</b><span>${AB[k]}</span></button>`).join('')}</div></section>
    <div class="eg-filter" role="toolbar" aria-label="Filter">
      <div class="eg-schalter">${[['neu', 'Neu', neu], ['offen', 'Offen', n('offen')], ['erledigt', 'Erledigt', n('erledigt')], ['alle', 'Alle', (A || []).length]].map(([k, t, z]) => `<button type="button" data-f="${k}" class="${FILTER === k ? 'an' : ''}" aria-pressed="${FILTER === k}">${t}<i>${z}</i></button>`).join('')}</div>
      ${ABT !== 'alle' ? `<button type="button" class="eg-ab-weg" data-abt="alle">Nur ${AB[ABT]} ${'<svg viewBox="0 0 14 14" aria-hidden="true"><path d="m3 3 8 8M11 3l-8 8"/></svg>'}</button>` : ''}
    </div>
    <div class="eg-werk">
      <div class="eg-liste" role="list">${sicht.length ? sicht.map(karte).join('') : leer()}</div>
      <div class="eg-detail" id="eg-detail">${detail(l.find(a => a.id === WAHL))}</div>
    </div>`;
  rand();
}
function karte(a) {
  const k = ab(a);
  return `<button type="button" role="listitem" class="eg-a${a.id === WAHL ? ' an' : ''}${a.stand === 'neu' ? ' neu' : ''}${a.stand === 'erledigt' ? ' fertig' : ''}" data-id="${h(a.id)}">
    <span class="eg-a__k"><span class="eg-ab eg-ab--${k}">${AB[k]}</span>${a.beispiel ? '<em class="marke hell">Beispiel</em>' : probe(a) ? '<em class="marke grau">Probe</em>' : ''}${a.stand === 'erledigt' ? '<em class="marke grau">Erledigt</em>' : ''}<small>${h(zeitText(a.zeit))}</small></span>
    <b>${h(a.anliegen || 'Ohne Betreff')}</b>
    <span class="eg-a__w">${h(a.name)}${a.datum ? ' · ' + h(wunsch(a.datum)) : ''}${a.personen ? ' · ' + h(a.personen) + (a.personen === '1' ? ' Person' : ' Personen') : ''}</span>
    ${a.nachricht ? `<span class="eg-a__n">${h(a.nachricht.slice(0, 140))}${a.nachricht.length > 140 ? ' …' : ''}</span>` : ''}</button>`;
}
function leer() {
  const satz = !A || !A.length ? 'Noch keine Anfrage im Eingang.' : FILTER === 'neu' ? 'Keine neue Anfrage.' : FILTER === 'erledigt' ? 'Noch nichts erledigt.' : 'Hier ist gerade nichts offen.';
  return `<div class="eg-leer"><b>${satz}</b><span>${ABT !== 'alle' ? 'Gefiltert nach ' + AB[ABT] + '. ' : ''}So sieht eine Anfrage aus, wenn sie ankommt:</span>
    <button class="kn kn--linie kn--klein" type="button" data-akt="beispiel">${ZEIGE_BEISPIEL ? 'Beispiel ausblenden' : 'Beispiel ansehen'}</button></div>`;
}
function detail(a) {
  if (!a) return `<div class="eg-d eg-d--leer"><span class="ik">${IK.brief}</span><b>Eine Anfrage wählen.</b><span>Links antippen, hier steht dann alles, was der Gast geschickt hat.</span></div>`;
  const k = ab(a), mail = MAIL.test(a.kontakt || ''), tel = !mail && /^[+\d][\d\s/().-]{5,}$/.test(a.kontakt || '');
  const zeile = (t, w) => w ? `<div><dt>${t}</dt><dd>${w}</dd></div>` : '';
  const betreff = 'Ihre Anfrage: ' + (a.anliegen || 'Berghotel Gasterntal');
  const anrede = 'Guten Tag ' + String(a.name || '').replace(/^Beispiel:\s*/, '') + '\n\nvielen Dank für Ihre Anfrage.\n\n\n\nFreundliche Grüsse\nBerghotel Gasterntal\n\n---\nIhre Anfrage vom ' + zeitText(a.zeit) + ':\n' + [a.anliegen, a.datum && 'Datum: ' + wunsch(a.datum), a.personen && 'Personen: ' + a.personen, a.nachricht].filter(Boolean).join('\n');
  return `<article class="eg-d blatt" data-id="${h(a.id)}">
    <header class="eg-d__k"><span class="eg-ab eg-ab--${k}">${AB[k]}</span><small>${h(a.an || 'gasterntal@doldenhorn.ch')}</small>
      ${a.beispiel ? '<em class="marke hell">Beispiel</em>' : probe(a) ? '<em class="marke grau">Probe-Eintrag, nicht beantworten</em>' : ''}</header>
    <h2>${h(a.anliegen || 'Ohne Betreff')}</h2>
    <p class="eg-d__z">Eingegangen ${h(zeitText(a.zeit))}${a.seite ? ` · über die Seite <a href="${h(a.seite)}" target="_blank" rel="noopener">${h(seite(a.seite))}</a>` : ''}${a.sprache && a.sprache !== 'de' ? ' · Sprache ' + h(a.sprache.toUpperCase()) : ''}</p>
    <dl class="eg-d__l">${zeile('Name', h(a.name))}${zeile('Kontakt', mail ? `<span class="eg-mail">${h(a.kontakt)}</span>` : tel ? `<a href="tel:${h(a.kontakt.replace(/[^+\d]/g, ''))}">${h(a.kontakt)}</a>` : h(a.kontakt))}
      ${zeile('Datum', a.datum ? h(wunsch(a.datum)) : '<span class="leise">ohne Angabe</span>')}${zeile('Personen', a.personen ? h(a.personen) : '<span class="leise">ohne Angabe</span>')}</dl>
    <div class="eg-d__n"><span class="mono leise">Nachricht</span>${a.nachricht ? `<p>${h(a.nachricht).replace(/\n/g, '<br>')}</p>` : '<p class="leise">Der Gast hat nichts dazugeschrieben.</p>'}</div>
    <div class="eg-d__r">
      ${a.beispiel ? '<button class="kn kn--linie kn--klein" type="button" data-akt="beispiel">Beispiel ausblenden</button>' : mail ? `<button class="kn" type="button" data-akt="antworttext" data-text="${h('Betreff: ' + betreff + '\n\n' + anrede)}">Antwort-Text kopieren${KNI}</button>` : tel ? `<a class="kn" href="tel:${h(a.kontakt.replace(/[^+\d]/g, ''))}">Anrufen${KNI}</a>` : ''}
      ${a.beispiel ? '' : '<button class="kn kn--linie kn--klein" type="button" data-akt="kopieren">Anfrage kopieren</button>'}
      ${a.beispiel ? '' : a.stand === 'erledigt' ? '<button class="kn kn--linie kn--klein" type="button" data-akt="offen">Wieder offen</button>' : `<button class="kn kn--hell kn--klein" type="button" data-akt="erledigt">Erledigt<i>${SYM_OK}</i></button>`}
      ${a.beispiel ? '' : `<button class="kn kn--linie kn--klein eg-weg" type="button" data-akt="loeschen">${MITHALT === a.id ? 'Wirklich löschen?' : 'Löschen'}</button>`}
    </div>
    <p class="eg-d__f leise">${a.beispiel ? 'Das ist ein Beispiel, kein echter Gast.' : mail ? 'Antwort-Text kopieren legt Betreff, Anrede und die Anfrage in die Zwischenablage. Verschickt wird hier nichts, und es öffnet sich kein Mailprogramm. Mit Brief und Gestaltung antworten Sie im Gastgeber.' : tel ? 'Der Gast hat eine Telefonnummer angegeben. Anrufen wählt sie auf diesem Gerät.' : 'Der Gast hat weder eine Mail-Adresse noch eine Telefonnummer angegeben, nur das, was oben unter Kontakt steht.'}</p>
  </article>`;
}

// ---------------------------------------------------------------- Bedienen
async function lade(still) {
  try {
    const j = await api();
    const neu = JSON.stringify(j.anfragen || []), alt = JSON.stringify(A || null);
    ZULETZT = new Date();
    if (neu !== alt) { A = j.anfragen || []; if (!still || !document.activeElement || !document.activeElement.closest('.eg-d')) zeichne(); }
    leiste();
    document.documentElement.classList.add('eg-bereit');
  } catch (e) {
    if (!A) { tuer(e.message); return; }
    if (!still) sag(e.message, true);
  }
}
function tuer(grund) {
  document.documentElement.classList.add('eg-bereit');
  rand(); leiste();
  $('#ansicht').innerHTML = `<div class="eg-tuer eg-tuer--innen" role="alert"><h1>Der Eingang startet nicht.</h1><p>${h(grund)}</p>
    <div class="eg-d__r"><button class="kn kn--klein" type="button" data-akt="neu">Noch einmal versuchen${KNI}</button><a class="link" href="pruefung.html">Prüfung öffnen</a></div></div>`;
}
async function setze(a, tun) {
  if (a.beispiel) return;
  const vorher = a.stand;
  try {
    const j = await api({ tun, id: a.id });
    if (tun === 'loeschen') { A = A.filter(x => x.id !== a.id); WAHL = null; sag('Gelöscht.'); }
    else { a.stand = j.stand || (tun === 'offen' ? 'gelesen' : tun); if (tun !== 'gelesen') sag(tun === 'erledigt' ? 'Als erledigt markiert.' : 'Wieder offen.'); }
    zeichne();
  } catch (e) { a.stand = vorher; sag(e.message, true); }
}
document.addEventListener('click', ev => {
  const z = ev.target.closest('[data-akt],[data-f],[data-abt],.eg-a'); if (!z) return;
  if (z.dataset.f) { FILTER = z.dataset.f; MITHALT = ''; return zeichne(); }
  if (z.dataset.abt) { ABT = ABT === z.dataset.abt ? 'alle' : z.dataset.abt; MITHALT = ''; return zeichne(); }
  if (z.classList.contains('eg-a')) {
    WAHL = z.dataset.id; MITHALT = '';
    const a = liste().find(x => x.id === WAHL);
    zeichne();
    if (innerWidth <= 980) $('#eg-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (a && a.stand === 'neu' && !a.beispiel) setze(a, 'gelesen');
    return;
  }
  const akt = z.dataset.akt, a = liste().find(x => x.id === (z.closest('.eg-d') || {}).dataset?.id);
  if (akt === 'neu') return lade();
  if (akt === 'beispiel') { ZEIGE_BEISPIEL = !ZEIGE_BEISPIEL; if (!ZEIGE_BEISPIEL && WAHL === 'beispiel') WAHL = null; if (ZEIGE_BEISPIEL) { WAHL = 'beispiel'; FILTER = FILTER === 'erledigt' ? 'offen' : FILTER; ABT = 'alle'; } return zeichne(); }
  if (!a) return;
  if (akt === 'antworttext') return navigator.clipboard.writeText(z.dataset.text || '').then(() => sag('Antwort-Text kopiert.'), () => sag('Kopieren ging nicht. Bitte den Text markieren und kopieren.', true));
  if (akt === 'kopieren') {
    const t = [a.anliegen, 'Von: ' + a.name + ' (' + a.kontakt + ')', a.datum && 'Datum: ' + wunsch(a.datum), a.personen && 'Personen: ' + a.personen, 'Art: ' + AB[ab(a)], a.nachricht && '\n' + a.nachricht].filter(Boolean).join('\n');
    navigator.clipboard.writeText(t).then(() => sag('Anfrage kopiert.'), () => sag('Kopieren ging nicht. Bitte den Text markieren und kopieren.', true));
  }
  if (akt === 'erledigt' || akt === 'offen') setze(a, akt);
  if (akt === 'loeschen') {
    if (MITHALT !== a.id) { MITHALT = a.id; z.textContent = 'Wirklich löschen?'; setTimeout(() => { if (MITHALT === a.id) { MITHALT = ''; const b = $('.eg-d [data-akt="loeschen"]'); if (b) b.textContent = 'Löschen'; } }, 5000); return; }
    MITHALT = ''; setze(a, 'loeschen');
  }
});
document.addEventListener('keydown', ev => {
  if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp') return;
  if (ev.target.closest && ev.target.closest('input,textarea')) return;
  const l = liste().filter(passt), i = l.findIndex(a => a.id === WAHL); if (!l.length) return;
  const n = l[Math.max(0, Math.min(l.length - 1, i + (ev.key === 'ArrowDown' ? 1 : -1)))]; if (!n || n.id === WAHL) return;
  ev.preventDefault(); WAHL = n.id; zeichne(); const b = $(`.eg-a[data-id="${CSS.escape(n.id)}"]`); if (b) b.focus();
  if (n.stand === 'neu' && !n.beispiel) setze(n, 'gelesen');
});

rand(); leiste();
lade();
setInterval(() => { if (!document.hidden) lade(true); }, 120000);
addEventListener('visibilitychange', () => { if (!document.hidden && ZULETZT && Date.now() - ZULETZT > 60000) lade(true); });
})();
