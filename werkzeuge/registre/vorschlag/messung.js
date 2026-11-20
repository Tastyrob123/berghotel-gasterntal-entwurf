/* Besucher · Berghotel Gasterntal: Zählung auf der Website (Tasty Studios 17.10.2026). VORSCHLAG, noch nicht eingebaut: der Einbau
   in bau.py und das Hochladen gehören dem Werkbank-Chat des Gasterntal (Anleitung: _werkzeuge/registre/LIEFERUNG.md, «Anschluss an die Website»).
   Ziel: assets/js/messung.js, auf jeder Seite vor </body> als <script src="assets/js/messung.js?v=…" defer></script>, nach anfrage.js und main.js.
   Vorbild: messung.js des Waldhotel Doldenhorn (dort _werkzeuge/registre/vorschlag/messung.js, nur gelesen), Ereignisse des Gasterntal.

   Je Seite geht eine Zeile an /api/registre (lokal studio.py des Hauses, online die Funktion api/registre.py, gleiche Adresse):
       r1 <seitenaufruf> <datei> <sprache> <geraet> <sekunden> <ereignisse|-> <herkunft|->
   einmal beim Öffnen (0 Sekunden), bei jedem gezählten Klick und beim Verlassen (Sekunden, in denen die Seite sichtbar war).
   Ohne Cookies und ohne Kennung im Gerät: «seitenaufruf» ist eine Zufallsfolge, die nur in dieser Variablen lebt und mit der Seite endet.
   Dass die Seiten eines Besuchs zusammenfinden, Land und Ort bestimmt der Server aus der Verbindung (registre.py); die Adresse speichert er nicht.
   «herkunft» ist nur der Name der Website, von der der Gast kam (zum Beispiel www.gasterntal.ch), nie die ganze Adresse.
   «sprache» ist die Sprache des Browsers (die Website gibt es nur deutsch), sonst «xx».
   Nicht gezählt: automatische Browser (Prüfläufe), Seiten im Rahmen, die Werkzeuge und Beigaben des Hauses, Entwurfs-, Konzept- und Auswahlseiten und Geräte,
   auf denen das Team in «Besucher» «Dieses Gerät nicht mitzählen» gewählt hat (localStorage «bg-nicht-zaehlen», das Einzige, was je im Gerät steht).
   Das Anfrage-Fenster (assets/js/anfrage.js) und das Buchen-Fenster (main.js) bleiben unberührt: gezählt wird nur, dass etwas geöffnet oder abgeschickt
   wurde, nie ein Inhalt. Die Zimmermappe (mappe.html) und die Rezeption im Chat (rezeption/, gemeldet als «rezeption.html») zählen mit, wenn ihr Bau
   diese Datei einbindet.

   Ereignisse:
     fenster  Buchen-Fenster geöffnet (Knopf mit data-buchen ausser «tisch», oder die Leiste «Anreise · Abreise · Gäste» abgeschickt)
     buchung  Zimmer angefragt: das Anfrage-Fenster kam aus dem Buchen-Fenster oder trägt «Zimmer» im Anliegen und wurde erfolgreich abgeschickt
     booking  weiter zu Booking.com (Link)
     tisch    «Tisch und Sauna» geöffnet (Knopf data-buchen="tisch" oder der Reiter im Buchen-Fenster)
     anfrage  jede andere Anfrage, die im Anfrage-Fenster erfolgreich abgeschickt wurde (Tisch und Sauna, Sauna, Picknick, Fahrt hinunter, Exklusiv,
              Vor der Anreise, Fest, freie Nachricht)
     anruf    Telefonnummer des Hauses angeklickt (033 675 81 81 oder 079 437 03 78; die Nummer des Gasternbusses zählt nicht)
     mail     Mail-Adresse angeklickt (mailto:, öffnet auf der Website das Anfrage-Fenster)
     chat     Rezeption im Chat geöffnet (.gast-knopf)
     route    Route nach Selden oder hinunter nach Kandersteg geöffnet (Link zu Google Maps)
   Die ältere Zählung «Zahlen fürs Haus» (dienste.js → /api/zahlen, 10.10.2026) und der Besuchs-Melder besuch.js (nur online, ~/Desktop/Website-Projekte/_Besuche/)
   bleiben unberührt und werden hier nicht doppelt gezählt: jede Zählung hat ihren eigenen Empfänger. */
(function () {
  'use strict';
  var n = navigator, d = document, w = window;
  if (w.__registre || !n.sendBeacon || n.webdriver || w.self !== w.top) return;
  try { if (w.localStorage.getItem('bg-nicht-zaehlen') === '1') return; } catch (e) { /* privat: zählt normal */ }
  var teile = location.pathname.split('/'), datei = teile.pop() || 'index.html';
  if (teile.length === 2 && teile[1] === 'rezeption' && /^(index\.html)?$/.test(location.pathname.split('/').pop())) datei = 'rezeption.html';   /* /rezeption/ */
  else if (teile.length > 2 || /^(studio|_werkzeuge|werkzeuge|werkbank|_werkbank|maison|marke|reception|registre|imprimerie|mission-control|potenzialanalyse|unterlagen|drucksachen|feed|material|kleber|entwurf|vorher)$/.test(teile[1] || '')) return;
  if (!/^[a-z0-9-]{1,60}\.html$/.test(datei) || /varianten|^konzept|^bildauswahl|^vorschau/.test(datei)) return;
  w.__registre = 1;
  var SPRACHEN = ' de en fr it nl es pt zh ja ko ar ';
  var sp = String(n.language || 'de').slice(0, 2).toLowerCase();
  if (SPRACHEN.indexOf(' ' + sp + ' ') < 0) sp = 'xx';
  var breit = function (px) { return !!(w.matchMedia && w.matchMedia('(max-width:' + px + 'px)').matches); };
  var geraet = breit(700) ? 'handy' : breit(1060) ? 'tablet' : 'rechner';
  var her = '-';
  try { var r = d.referrer ? new URL(d.referrer).hostname.toLowerCase() : ''; if (r && r !== location.hostname && /^[a-z0-9.-]{3,60}$/.test(r)) her = r; } catch (e) {}
  var HAUS_TEL = /^tel:\+?(41336758181|41794370378|0336758181|0794370378)$/;
  var pv, war, liste, sichtbar, seit, gesendet;
  function neu() {
    pv = (Math.random().toString(36) + '000000').slice(2, 8);
    war = {}; liste = []; sichtbar = 0; gesendet = '';
    seit = d.visibilityState === 'hidden' ? 0 : Date.now();
    sende();
  }
  function sek() { return Math.min(1800, Math.round((sichtbar + (seit ? Date.now() - seit : 0)) / 1000)); }
  function sende() {
    var zeile = 'r1 ' + pv + ' ' + datei + ' ' + sp + ' ' + geraet + ' ' + sek() + ' ' + (liste.length ? liste.join(',') : '-') + ' ' + her;
    if (zeile === gesendet) return;
    gesendet = zeile;
    try { n.sendBeacon('/api/registre', zeile); } catch (e) {}   /* wartet auf keine Antwort */
  }
  function zaehle(was) {
    if (war[was]) return;
    war[was] = 1; liste.push(was);
    sende();
  }
  function weg() { if (seit) { sichtbar += Date.now() - seit; seit = 0; } sende(); }
  neu();
  d.addEventListener('visibilitychange', function () { if (d.visibilityState === 'hidden') weg(); else if (!seit) seit = Date.now(); });
  w.addEventListener('pagehide', weg);
  w.addEventListener('pageshow', function (e) { if (e.persisted) neu(); });   /* zurück aus dem Seitenspeicher des Browsers: neuer Aufruf */

  var ausBuchen = 0;   /* das nächste Anfrage-Fenster kommt aus dem Buchen-Fenster (Zimmer) */
  d.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var b = t.closest('[data-buchen]');
    if (b) { zaehle(b.getAttribute('data-buchen') === 'tisch' ? 'tisch' : 'fenster'); return; }
    if (t.closest('dialog.buchen [role="tab"]')) { if (t.closest('#bt-tisch')) zaehle('tisch'); return; }
    var g = t.closest('.gast-knopf'); if (g) { if (g.getAttribute('aria-expanded') !== 'true') zaehle('chat'); return; }
    var a = t.closest('a[href]'); if (!a) return;
    var h = (a.getAttribute('href') || '').replace(/\s/g, '');
    if (/(^|\.)booking\.com$/i.test(a.hostname || '')) zaehle('booking');
    else if (/^tel:/i.test(h)) { if (HAUS_TEL.test(h)) zaehle('anruf'); }
    else if (/^mailto:/i.test(h)) zaehle('mail');
    else if (/(^|\.)google\.[a-z.]+$/i.test(a.hostname || '') && /\/maps/.test(a.pathname || '')) zaehle('route');
  }, true);
  d.addEventListener('submit', function (e) {
    var f = e.target; if (!f || !f.matches) return;
    if (f.matches('dialog.buchen form[data-zimmer]')) { ausBuchen = 1; return; }   /* öffnet danach das Anfrage-Fenster */
    if (f.matches('form.leiste')) { zaehle('fenster'); return; }   /* Leiste «Anreise · Abreise · Gäste» öffnet das Buchen-Fenster */
    if (f.matches('dialog.anf form.anf__form')) wartet(f, ausBuchen || /zimmer/i.test((f.elements.anliegen && f.elements.anliegen.value) || ''));
  }, true);
  /* Abgeschickt ist eine Anfrage erst, wenn das Haus sie angenommen hat: das Fenster zeigt dann «Vielen Dank» (anfrage.js blendet .anf__danke ein).
     Nachgesehen wird kurz, höchstens 20 Sekunden; scheitert das Senden, zählt nichts. */
  function wartet(f, zimmer) {
    var dlg = f.closest('dialog'), bis = Date.now() + 20000;
    (function schau() {
      var dank = dlg && dlg.querySelector('.anf__danke');
      if (dank && !dank.hidden) { zaehle(zimmer ? 'buchung' : 'anfrage'); ausBuchen = 0; return; }
      if (Date.now() < bis && dlg && dlg.open) setTimeout(schau, 250);
    })();
  }
  d.addEventListener('close', function (e) { if (e.target && e.target.matches && e.target.matches('dialog.anf')) ausBuchen = 0; }, true);
})();
