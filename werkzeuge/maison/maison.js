/* Die Stube (La Maison) · Berghotel Gasterntal (17.10.2026). Gebaut von _werkzeuge/maison/bau.py aus quelle/maison.js, nicht in der Ausgabe ändern.
   Gruss, Datum, Fensterfront, Auftritte und der Stand je Werkzeug. Stand nur aus den Daten der Werkzeuge selbst (nichts geschätzt): Wege als Daten
   in der Seite (#maison-wege), ein Weg darf eine Liste sein (antwortet der erste nicht, gilt der nächste). Werte gehen nur als Zahl in die Seite. */
(function () {
/* Jede Seite öffnet oben, auch nach Neuladen und Zurück (Robert 18.10.2026 18:30: «… dass … die Links oben die Seite zeigen») */
try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ganz = function (x) { var n = parseInt(x, 10); return isFinite(n) && n > 0 ? n : 0; };
  var tag = function (d) { return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
  var setze = function (key, html) { $$('[data-stand="' + key + '"]').forEach(function (el) { el.innerHTML = html; }); };
  var zahl = function (key, wert) { $$('[data-zahl="' + key + '"]').forEach(function (el) { el.textContent = wert; }); };

  /* Gruss und Datum; ?gruss=morgen|tag|abend für das Standbild der Werkbank */
  var h = new Date().getHours();
  var fest = { morgen: 8, tag: 13, abend: 20 }[(/[?&]gruss=(morgen|tag|abend)/.exec(location.search) || [])[1]]; if (fest) h = fest;
  $('#gruss').textContent = h >= 5 && h < 11 ? 'Guten Morgen.' : h >= 11 && h < 18 ? 'Guten Tag.' : 'Guten Abend.';
  $('#datum').textContent = new Date().toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  /* Buchstaben-Rollen nur in den Namen der Leiste */
  $$('.rl').forEach(function (el) {
    el.innerHTML = el.textContent.split('').map(function (z, i) { return '<b style="--n:' + i + '">' + esc(z) + '</b>'; }).join('');
  });

  /* Fensterfront: die Fenster kommen herauf, wenn die sechs Raumbilder hinter den Fensterkreuzen dekodiert sind (höchstens 1,4 s) */
  var pfosten = $('.ff__front');
  (function () {
    if (!pfosten) return;
    var los = function () { pfosten.classList.add('bereit'); };
    var uhr = setTimeout(los, 1400);
    Promise.all($$('.ff__raum', pfosten).map(function (im) { return (im.decode ? im.decode() : Promise.resolve()).catch(function () {}); }))
      .then(function () { clearTimeout(uhr); requestAnimationFrame(los); });
  })();

  /* Raum zum Fenster: Zeiger, Tastatur-Fokus oder Antippen eines Fensters zeigt links seinen Raum, harter Schnitt, erst wenn das Bild da ist (M16).
     Die Läden des gewählten Fensters sind rot (.an), alle anderen schiefergrau. */
  var S = $$('.ff__f'), R = $$('.ff__gross'), U = $$('.ff__unter span'), jetzt = 'ruhe', will = 'ruhe';
  /* M23 (Robert 18.10.2026): in Ruhe das Haus; Zeiger oder Fokus auf einem Fenster zeigt links den echten Bildschirm dieses Werkzeugs, weich überblendet.
     Erst entpacken, dann zeigen. Verlässt der Zeiger die Fensterfront, kommt das Haus zurück. Die Läden des gewählten Fensters sind rot, nichts bewegt sich. */
  var bild = function (i) { return R.filter(function (r) { return r.getAttribute('data-raum') === String(i); })[0]; };
  var zeige = function (i) {
    will = i; if (i === jetzt) return;
    var im = bild(i); if (!im) return; if (im.loading === 'lazy') im.loading = 'eager';
    var fertig = function () {
      if (will !== i) return;
      R.forEach(function (r) { r.classList.toggle('an', r === im); });
      U.forEach(function (u) { u.classList.toggle('an', u.getAttribute('data-raum') === String(i)); });
      S.forEach(function (s, j) { s.classList.toggle('an', j === i); });
      jetzt = i;
    };
    (im.decode ? im.decode() : Promise.resolve()).then(fertig, fertig);
  };
  if (pfosten) pfosten.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch') zeige('ruhe'); });
  S.forEach(function (s, i) {
    s.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') zeige(i); });
    s.addEventListener('focus', function () { zeige(i); });
  });
  /* Die übrigen Räume laden, sobald der erste da ist (ruhig, nach dem Auftakt) */
  if (R[0]) {
    var weiter = function () { setTimeout(function () { R.forEach(function (r) { if (r.loading === 'lazy') r.loading = 'eager'; r.addEventListener('load', function () { if (r.decode) r.decode().catch(function () {}); }, { once: true }); }); }, 900); };
    if (R[0].complete) weiter(); else R[0].addEventListener('load', weiter, { once: true });
  }

  /* Taste 1 bis 6 öffnet das Werkzeug des Fensters (M12), still, solange der Rundgang offen ist */
  addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || document.querySelector('.rdg-karte')) return;
    var k = S[+e.key - 1]; if (k) { zeige(+e.key - 1); k.classList.add('gedrueckt'); setTimeout(function () { location.href = k.href; }, 180); }
  });

  /* Auftritte: ein Abschnitt fährt als Ganzes los, sobald er am unteren Rand auftaucht; jedes Stück mit seiner Staffel (--i) */
  var alle = $$('[data-r]');
  /* Kommt ein Stück an, lädt es seine Bilder sofort (M15: der Safari-Kern am Handy holte ein Bild im Blick sonst nie) */
  var wecke = function (el) { (el.tagName === 'IMG' ? [el] : $$('img[loading="lazy"]', el)).forEach(function (i) { if (!i.complete || !i.naturalWidth) i.loading = 'eager'; }); };
  var an = function (el) { el.classList.add('da'); wecke(el); };
  if ('IntersectionObserver' in window) {
    /* Robert 18.10.2026 18:17 («zu früh, zu schnell») und 17:46 («stell das bitte überall sicher»): jedes Stück fährt für sich los, wenn rund ein Fünftel
       davon im Bild ist (bei sehr hohen ein Fünftel des Fensters), nicht mehr der ganze Saal auf einmal unter dem Rand. Nach oben weit offen: wer springt, überspringt nichts. */
    var fuenftel = function (e) { return e.isIntersecting && (e.intersectionRatio >= 0.2 || e.intersectionRect.height >= window.innerHeight * 0.2); };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (fuenftel(e)) { an(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '100000px 0px 0px 0px', threshold: [0, 0.05, 0.1, 0.15, 0.2] });
    alle.forEach(function (el) { io.observe(el); });
    $$('.m-zahlen[data-r]').forEach(function (z) { [].slice.call(z.children).forEach(function (k, i) { k.style.setProperty('--j', Math.min(i, 6)); }); });   /* die Zahlen eines Saals kommen einzeln, 0,12 s auseinander */
    /* Goldband läuft nur, solange es im Bild ist (M07) */
    var band = $('[data-laufband]');
    if (band) new IntersectionObserver(function (es) { band.classList.toggle('laeuft', es[0].isIntersecting); }).observe(band);
    /* Leiste: die Etappe im Blick ist markiert (M01) */
    var punkte = {};
    $$('.m-insel__p').forEach(function (a) { punkte[a.getAttribute('href').slice(1)] = a; });
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var a = punkte[e.target.id]; if (a) a.classList.toggle('an', e.isIntersecting); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    Object.keys(punkte).forEach(function (id) { var s = document.getElementById(id); if (s) sio.observe(s); });
  } else {
    alle.forEach(function (el) { el.classList.add('da'); });
  }

  /* Stand-Wege (gesetzt von bau.py als Daten, kein eingebettetes Skript wegen der Sicherheitsregel online) */
  var WEGE = {}; try { WEGE = JSON.parse($('#maison-wege').textContent) || {}; } catch (e) { /* ohne Wege: jede Zeile ohne Zahl */ }
  var hole = function (k) {
    var w = [].concat(WEGE[k] || []).filter(Boolean);
    var weiter = function (i) {
      return i >= w.length ? Promise.reject(new Error('kein Weg')) : fetch(w[i], { cache: 'no-store', credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error(r.status)); })
        .then(function (d) { return d && typeof d === 'object' ? d : Promise.reject(new Error('leer')); })
        .catch(function () { return weiter(i + 1); });
    };
    return weiter(0);
  };

  /* Le Bureau: {aenderungen, zuletzt:{zeit}, bereiche:[…], seiten, sprachen?} */
  hole('bureau').then(function (u) {
    var a = ganz(u.aenderungen), z = u.zuletzt;
    if (Array.isArray(u.bereiche) && u.bereiche.length) zahl('bereiche', u.bereiche.length);
    if (ganz(u.seiten)) zahl('seiten', ganz(u.seiten));
    var sp = Array.isArray(u.sprachen) ? u.sprachen.length : ganz(u.sprachen);
    /* Le Bureau meldet zusätzliche Sprachen; 0 oder leer heisst: die Website ist nur deutsch («Nur Deutsch, nichts zu übersetzen») */
    if (sp) zahl('sprachen', sp); else if (u.sprachen === 0 || (Array.isArray(u.sprachen) && !u.sprachen.length)) zahl('sprachen', 'Deutsch');
    var zd = z && z.zeit ? new Date(String(z.zeit).replace(' ', 'T')) : null, zul = zd && !isNaN(zd) ? tag(zd) : '';
    /* M27 (Robert 18.10.2026): nie leer; solange nichts im Entwurf liegt und nichts veröffentlicht ist, steht ein beschriftetes Beispiel da */
    if (!a && !zul) { setze('bureau-kurz', '<b>2 im Entwurf</b> · Beispiel'); setze('bureau', '<b>Beispiel:</b> 2 Änderungen im Entwurf, Saisonschluss und ein Foto der Gaststube. Zuletzt veröffentlicht am 16.10.'); return; }
    setze('bureau-kurz', a ? '<b>' + a + ' im Entwurf</b>' : (zul ? 'Veröffentlicht ' + esc(zul) : 'Nichts offen'));
    setze('bureau', (a ? '<b>' + a + ' Änderung' + (a > 1 ? 'en' : '') + ' im Entwurf.</b> ' : 'Nichts offen im Entwurf. ') + (zul ? 'Zuletzt veröffentlicht am ' + esc(zul) + '.' : 'Noch nichts veröffentlicht.'));
  }).catch(function () { setze('bureau-kurz', 'Website des Hauses'); setze('bureau', 'Der Stand ist gerade nicht abrufbar.'); });

  /* La Carte: {karten:[{entwurf, pdf_zeit:"dd.mm.yyyy hh:mm"}]} */
  hole('carte').then(function (d) {
    var k = Array.isArray(d.karten) ? d.karten : null; if (!k) throw new Error('ohne Karten');
    var e = k.filter(function (x) { return x && x.entwurf; }).length;
    var sortier = function (s) { var m = String(s).match(/(\d+)\.(\d+)\.(\d+)\s+(\d+):(\d+)/); return m ? m[3] + m[2] + m[1] + m[4] + m[5] : ''; };
    var pdf = k.map(function (x) { return x && x.pdf_zeit || ''; }).filter(function (s) { return sortier(s); }).sort(function (a, b) { return sortier(a) < sortier(b) ? 1 : -1; })[0];
    zahl('karten', k.length);
    zahl('entwurf', e);
    if (pdf) { var m = String(pdf).match(/(\d+)\.(\d+)\./); zahl('pdf', ('0' + m[1]).slice(-2) + '.' + ('0' + m[2]).slice(-2) + '.'); }
    setze('carte-kurz', e ? '<b>' + e + ' im Entwurf</b>' : k.length + (k.length === 1 ? ' Karte, veröffentlicht' : ' Karten, alle veröffentlicht'));
  }).catch(function () { setze('carte-kurz', 'Karten des Hauses'); });

  /* L’Imprimerie: keine Änderungen, die sich zeigen liessen; die Zahl der fertigen Vorlagen aus ihrer Liste [{art, format, zahl}] */
  hole('imprimerie').then(function (l) {
    if (!Array.isArray(l) || !l.length) throw new Error('leer');
    var z = 0, arten = {}; l.forEach(function (x) { z += ganz(x && x.zahl); if (x && x.art) arten[String(x.art)] = 1; });
    var a = Object.keys(arten).length; if (!z) throw new Error('leer');
    setze('imprimerie-kurz', z + ' Vorlagen in ' + a + (a === 1 ? ' Art' : ' Arten'));
  }).catch(function () { setze('imprimerie-kurz', 'Vorlagen, druckfertig'); });

  /* La Réception: {anfragen_neu, anfragen_offen, ohne_antwort, fragen_gesamt} */
  hole('reception').then(function (r) {
    var u = {}; ['anfragen_neu', 'anfragen_offen', 'ohne_antwort', 'fragen_gesamt'].forEach(function (k) { u[k] = ganz(r[k]); });
    var teile = [];
    if (u.anfragen_neu) teile.push('<b>' + u.anfragen_neu + (u.anfragen_neu === 1 ? ' neue Anfrage' : ' neue Anfragen') + '</b>');
    else if (u.anfragen_offen) teile.push(u.anfragen_offen + (u.anfragen_offen === 1 ? ' Anfrage offen' : ' Anfragen offen'));
    if (u.ohne_antwort) teile.push('<b>' + u.ohne_antwort + (u.ohne_antwort === 1 ? ' Frage ohne Antwort' : ' Fragen ohne Antwort') + '</b>');
    var kurz = teile.length ? teile.join(' · ') : 'Nichts offen';
    setze('reception-kurz', kurz);
    setze('reception', teile.length ? kurz : 'Nichts offen · ' + u.fragen_gesamt + (u.fragen_gesamt === 1 ? ' Frage' : ' Fragen') + ' bisher');
  }).catch(function () { setze('reception-kurz', 'Rezeption im Chat'); setze('reception', '&nbsp;'); });

  /* Le Livre: stand:{fotos, ki, ue, dateien} (ki = mit KI erzeugt, ue = nachgeschärft) */
  hole('livre').then(function (d) {
    var s = d.stand || {}, f = ganz(s.fotos), da = ganz(s.dateien), ki = ganz(s.ki), ue = ganz(s.ue);
    if (!f && !da) throw new Error('leer');
    setze('livre-kurz', f + ' Fotos · ' + da + ' Dateien');
    var dazu = [ki ? ki + ' mit KI erzeugt' : '', ue ? ue + ' nachgeschärft' : ''].filter(Boolean);
    setze('livre', f + ' Fotos in fertigen Grössen' + (dazu.length ? ', davon ' + dazu.join(' und ') + ', alle gekennzeichnet' : '') + '. ' + da + ' Dateien für Agenturen und Druckereien, dazu die Markenprüfung.');
  }).catch(function () { setze('livre-kurz', 'Fotos, Dateien, Markenprüfung'); setze('livre', '&nbsp;'); });

  /* Le Registre: Werte der Zählung ohne Cookies. Vorführ-Betrieb: Beispielwerte, als Beispiel beschriftet (R20) */
  var RN = {}; try { RN = JSON.parse($('#maison-registre').textContent) || {}; } catch (e) {}
  /* Ersatzweg Le Registre (abgelegte Beispielwerte beispiel/30.json): die Ablage enthält heute den ganzen Tag. Was nach der jetzigen Uhrzeit von
     Selden begänne, fällt weg, genau wie im Werkzeug (registre.js kuerzen/werteAus), sonst stünde «heute» zu hoch (F31). */
  var jetztZuerich = function () {
    try { return new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date()); }
    catch (e) { return new Date().toTimeString().slice(0, 8); }
  };
  var pyRund = function (x, st) {   /* wie Python round() (registre.js pyRund) */
    st = st || 0; if (x == null || !isFinite(x)) return x;
    var f = Math.pow(10, st), y = Math.abs(x) * f, b = Math.floor(y), r = y - b;
    var k = r > 0.5 + 1e-9 ? b + 1 : r < 0.5 - 1e-9 ? b : (b % 2 ? b + 1 : b);
    return (x < 0 ? -k : k) / f;
  };
  /* Seitenarten wie im Besucherbuch des Hauses (_werkzeuge/registre/registre.js ART/artVon, geliefert 17.10.2026) */
  var ART = { essen: ['essen.html'], erleben: ['sauna.html', 'picknick.html'], feste: ['feste.html'], weg: ['anreise.html', 'abreise.html', 'lage.html', 'offen.html'] };
  var artVon = function (x) { return x === 'index.html' ? 'start' : /^zimmer[.-]/.test(x) ? 'zimmer' : Object.keys(ART).filter(function (k) { return ART[k].indexOf(x) >= 0; })[0] || 'sonst'; };
  var kuerze = function (d) {
    var R = d.roh; if (!R || !R.heute_voll || !Array.isArray(d.besuche) || !Array.isArray(d.je_tag) || !d.summe) return d;
    var jetzt = jetztZuerich(), heute = d.bis, u = d.summe, t = d.je_tag[d.je_tag.length - 1];
    var weg = d.besuche.filter(function (b) { return b.tag === heute && (b.zs || b.z + ':00') > jetzt; });
    if (!weg.length) return d;
    var SS = {}; (R.S || []).forEach(function (x) { SS[x[0] + '|' + x[1] + '|' + x[2]] = x[3]; });
    var laender = {}; (R.laender || []).forEach(function (x) { laender[x.k] = x.n; });
    weg.forEach(function (b) {
      u.besuche--; u.seiten -= b.seiten; if (b.buchung) u.buchung--; if (b.anfrage) u.anfrage--; if (b.kontakt) u.kontakt--; if (b.route) u.route--; u.heute--;
      t.besuche--; t.seiten -= b.seiten; if (b.buchung) t.buchung--;
      var l = b.l || '??'; if (l in laender) laender[l]--;
      (b.weg || []).forEach(function (x) { var a = artVon(x.s); ['seite'].concat(x.e || []).forEach(function (e) { var k = e + '|' + a + '|' + b.g; SS[k] = (SS[k] || 0) - 1; }); });
    });
    u.laender = Object.keys(laender).filter(function (k) { return laender[k] > 0 && k !== '??' && k !== ''; }).length;
    var sum = function (e, a) { var z = 0; Object.keys(SS).forEach(function (k) { var p = k.split('|'); if (p[0] === e && (a == null || p[1] === a)) z += SS[k]; }); return z; };
    var wert = function (z, v, mehr) { var o = { zahl: z, von: v, anteil: v ? pyRund(Math.min(100, 100 * z / v), 1) : null }; for (var k in mehr || {}) o[k] = mehr[k]; return o; };
    var auf = sum('seite');
    /* die neun Werte des Gasterntal, dieselbe Rechnung wie registre.js werteAus (kein Buchungssystem: Anfrage ans Haus oder Booking.com) */
    d.werte = { start: wert(sum('buchung', 'start') + sum('booking', 'start'), sum('seite', 'start')), zimmer: wert(sum('buchung', 'zimmer') + sum('booking', 'zimmer'), sum('seite', 'zimmer')),
      booking: wert(sum('booking'), sum('buchung') + sum('booking'), { anfrage: sum('buchung') }), abbruch: wert(Math.max(0, sum('fenster') - sum('buchung')), sum('fenster')),
      tisch: wert(sum('tisch'), auf, { essen: sum('tisch', 'essen') }),
      anfrage: wert(sum('anfrage'), auf, { erleben: sum('anfrage', 'erleben'), feste: sum('anfrage', 'feste'), weg: sum('anfrage', 'weg') }),
      kontakt: wert(sum('anruf') + sum('mail'), auf, { anruf: sum('anruf'), mail: sum('mail') }), chat: wert(sum('chat'), auf),
      route: wert(sum('route'), auf, { weg: sum('route', 'weg') }) };
    d.leer = !u.besuche;
    return d;
  };
  if ($('#registre')) hole('registre').then(kuerze).then(function (m) {
    var n = function (x) { return Number(x || 0).toLocaleString('de-CH'); };
    var w = m.werte || {};
    var aufrufe = function (z) { return z === 1 ? 'Aufruf' : 'Aufrufen'; };
    Object.keys(RN).forEach(function (key) {
      var x = w[key] || {}, von = ganz(x.von), da = von > 0, anteil = Number(x.anteil);
      /* Sätze wie im Besucherbuch des Hauses (registre.js, Ansicht «Zur Buchung», k('…', '…', x => …)) */
      var mal_ = function (z) { z = ganz(z); return z === 1 ? 'einmal' : n(z) + ' Mal'; };
      var mal = function (z, eins, viele) { z = ganz(z); return z === 1 ? eins : n(z) + ' ' + viele; };
      var bei = ' bei ' + n(von) + ' ' + aufrufe(von);
      var klein = key === 'booking' ? n(x.zahl) + ' von ' + n(von) + ' Schritten zur Buchung, ' + mal(x.anfrage, 'eine Zimmer-Anfrage', 'Zimmer-Anfragen') + ' direkt ans Haus'
        : key === 'abbruch' ? n(x.zahl) + ' von ' + n(von) + (von === 1 ? ' geöffneten Fenster' : ' geöffneten Fenstern')
        : key === 'tisch' ? mal_(x.zahl) + ' geöffnet' + bei + ', davon ' + n(x.essen) + ' auf «Ässe u trinke»'
        : key === 'anfrage' ? mal(x.zahl, 'eine Anfrage', 'Anfragen') + bei + ', davon ' + n(x.erleben) + ' von Sauna oder Picknick, ' + n(x.feste) + ' von «Feste», ' + n(x.weg) + ' von Anreise und Weg'
        : key === 'kontakt' ? mal_(x.anruf) + ' die Nummer, ' + mal_(x.mail) + ' die Mail-Adresse,' + bei
        : key === 'chat' ? mal_(x.zahl) + ' geöffnet,' + bei
        : key === 'route' ? mal_(x.zahl) + ' geöffnet,' + bei + ', davon ' + n(x.weg) + ' von Anreise, Weg und Tal'
        : n(x.zahl) + ' von ' + n(von) + ' ' + aufrufe(von) + (RN[key] ? ' ' + RN[key] : '');
      $$('[data-mw="' + key + '"]').forEach(function (el) { el.textContent = da && isFinite(anteil) ? anteil.toLocaleString('de-CH', { maximumFractionDigits: 1 }) + ' %' : '–'; });
      $$('[data-mk="' + key + '"]').forEach(function (el) { el.textContent = da ? klein : 'Noch nichts gezählt'; });
    });
    /* Weg des Gastes (Robert 18.10.2026 20:03, Fassung C): Besuche → Buchungsfenster → weiter zu Booking.com oder Anfrage → gebucht */
    var su = m.summe || {}, bes = ganz(su.besuche), fen = ganz((w.abbruch || {}).von), wb = w.booking || {}, wei = ganz(wb.von), bk = ganz(wb.zahl), anf = ganz(wb.anfrage);
    var ORD = ['', 'jeder', 'jeder zweite', 'jeder dritte', 'jeder vierte', 'jeder fünfte', 'jeder sechste', 'jeder siebte', 'jeder achte', 'jeder neunte', 'jeder zehnte', 'jeder elfte', 'jeder zwölfte', 'jeder dreizehnte', 'jeder vierzehnte', 'jeder fünfzehnte'];
    var jeder = function (teil, ganzes) { var q = teil ? Math.round(ganzes / teil) : 0; return q >= 1 && q < ORD.length ? 'etwa ' + ORD[q] + ' Besuch' : ''; };
    var anteil = function (teil, ganzes) { if (!ganzes) return ''; var p = teil / ganzes; return p > 0.7 && p < 0.8 ? 'drei von vier davon' : p >= 0.45 && p <= 0.55 ? 'die Hälfte davon' : Math.round(100 * p) + ' % davon'; };
    $$('[data-wg]').forEach(function (el) {
      var k = el.getAttribute('data-wg');
      if (k === 'besuche') { el.setAttribute('data-zaehl', bes); el.textContent = bes ? n(bes) : '–'; }
      if (k === 'fenster') { el.setAttribute('data-zaehl', fen); el.textContent = fen ? n(fen) : '–'; }
      if (k === 'weiter') { el.setAttribute('data-zaehl', wei); el.textContent = wei ? n(wei) : '–'; }
      if (k === 'besuche-satz') el.textContent = 'auf der Website, in ' + n(ganz(m.tage) || 30) + ' Tagen';
      if (k === 'fenster-satz') el.textContent = fen ? jeder(fen, bes) || anteil(fen, bes) : 'Noch nichts gezählt';
      if (k === 'weiter-satz') el.textContent = wei ? anteil(wei, fen) + ': ' + (bk === 1 ? 'einmal' : n(bk) + ' Mal') + ' zu Booking.com, ' + (anf === 1 ? 'eine Anfrage' : n(anf) + ' Anfragen') + ' ans Haus' : 'Noch nichts gezählt';
      if (k === 'hinweis') el.textContent = m.leer ? 'Noch keine Besuche gezählt.' : (m.beispiel ? 'Beispielwerte, bis die Website echte Besuche zählt · ' : '') + 'letzte ' + n(m.tage) + ' Tage';
    });
    /* die drei Zahlen zählen einmal hoch, wenn der Weg zu einem Fünftel im Bild ist */
    var vx = $('.vx-c');
    if (vx && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var zio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!fuenftel(e)) return; zio.disconnect();
        $$('[data-zaehl]', vx).forEach(function (b, i) { var z = +b.getAttribute('data-zaehl'); if (!z) return; var t0 = performance.now() + i * 120;
          (function s(t) { var p = Math.max(0, Math.min(1, (t - t0) / 1100)), q = 1 - Math.pow(1 - p, 3); b.textContent = n(Math.round(z * q)); if (p < 1) requestAnimationFrame(s); })(performance.now()); }); }); },
        { rootMargin: '100000px 0px 0px 0px', threshold: [0, 0.05, 0.1, 0.15, 0.2] });
      zio.observe(vx);
    }
    var u = m.summe || {};
    /* «Heute»: Besuche und Klicks zur Buchung des heutigen Tages (letzter Eintrag in je_tag, F40); ohne Wert «–» */
    var jt = Array.isArray(m.je_tag) && m.je_tag.length ? m.je_tag[m.je_tag.length - 1] : null;
    setze('registre-heute', u.heute !== undefined && isFinite(Number(u.heute)) ? n(u.heute) : '–');
    setze('registre-buchung', jt && jt.buchung !== undefined && isFinite(Number(jt.buchung)) ? n(jt.buchung) : '–');
    if (m.beispiel) $$('.ff__zeile').forEach(function (z) { z.classList.add('beispiel'); z.setAttribute('title', 'Beispielwerte, bis die Website echte Besuche zählt'); });
    var bs = ganz(u.besuche);   /* Stand auf dem Fensterbrett: Besuche des Zeitraums, Beispielwerte als solche benannt (R20) */
    setze('registre-kurz', m.leer || !bs ? 'Noch keine Besuche gezählt' : n(bs) + (bs === 1 ? ' Besuch' : ' Besuche') + ' in ' + n(ganz(m.tage)) + ' Tagen' + (m.beispiel ? ' · Beispiel' : ''));
    setze('besuche', m.leer ? 'Noch keine Besuche gezählt.'
      : (m.beispiel ? 'Beispielwerte · ' : '') + 'Letzte ' + n(m.tage) + ' Tage · ' + n(u.besuche) + (u.besuche === 1 ? ' Besuch' : ' Besuche') + ' · ' + n(u.seiten) + (u.seiten === 1 ? ' angesehene Seite' : ' angesehene Seiten') + (u.laender ? ' · ' + n(u.laender) + (u.laender === 1 ? ' Land' : ' Länder') : ''));
  }).catch(function () { setze('registre-kurz', 'Besuche ohne Namen'); setze('besuche', 'Die Zählung ist gerade nicht abrufbar.'); setze('registre-heute', '–'); setze('registre-buchung', '–'); });
  window.MAISON_BEREIT = true;   /* Startfehler-Tür (R04): ohne dieses Zeichen öffnet fehler.js die Tür */
})();
