/* Der Schreibtisch · Berghotel Gasterntal: Fehlermelder (R03), steht als erstes Skript im Kopf. Wie Grand Beau-Rivage über das Waldhotel Doldenhorn (studio/fehlermelder.js dort):
   Skriptfehler in den Browser (localStorage «bg_studio_fehler», dieselbe Liste wie studio.js und der Eingang, liest die Prüfung studio/pruefung.html) und an den
   Server (studio/api/b/fehler). Netzfehler nie melden (Safari meldete sonst die eigene gescheiterte Meldung in einer Schleife, 9'969 Fehler am 15.10.), höchstens 20 je Seite,
   eigener Fehlschlag nie erneut. */
(function () {
  var zahl = 0, still = false;
  function merk(t) {
    t = String(t);
    if (++zahl > 20 || /Load failed|access control|abort|NetworkError|Failed to fetch|Network request failed/i.test(t)) return;
    try { var a = JSON.parse(localStorage.getItem('bg_studio_fehler') || '[]'); a.unshift({ zeit: new Date().toISOString(), art: 'schreibtisch', text: ('Der Schreibtisch: ' + t).slice(0, 400), ort: (location.pathname.split('/').pop() || 'index.html') }); localStorage.setItem('bg_studio_fehler', JSON.stringify(a.slice(0, 30))); } catch (e) { }
    if (still) return;
    try { fetch('/studio/api/b/fehler', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Studio': '1' }, body: JSON.stringify({ text: t.slice(0, 600) }), keepalive: true }).catch(function () { still = true; }); } catch (e) { still = true; }
  }
  window.addEventListener('error', function (e) { if (e.target && e.target !== window) return; merk((e.message || 'Fehler') + ' · ' + (e.filename || '').split('/').pop() + ':' + (e.lineno || '')); }, true);
  window.addEventListener('unhandledrejection', function (e) { merk('Versprechen: ' + ((e.reason && e.reason.message) || e.reason)); });
  window.bureauMerk = merk;
})();
