/* Prüfung · Studio · Berghotel Gasterntal. Die Kontrollinstanz des Studios: eigenständig, ohne studio.js, ohne Bibliothek.
   Sie prüft (1) Verbindung und Browser von hier aus, (2) fragt den Server nach seiner eigenen Prüfung (/studio/api/pruefung),
   (3) bietet begrenzte Reparaturen an (/studio/api/reparieren) und (4) kennt im Lexikon jede bekannte Fehlerquelle mit Ursache und Weg.
   Jeder Punkt hat ein Stichwort (lex), das Server und Oberfläche gleich benutzen. Steht hier ein Stichwort nicht, ist das ein Fehler im Lexikon. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const h = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const HAKEN = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7"/></svg>';
const KREUZ = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8"/></svg>';
const RUF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v6"/><circle cx="8" cy="12.3" r=".9" fill="currentColor" stroke="none"/></svg>';
const PF = '<i><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg></i>';
const SPEICHER = 'bg_studio_fehler';   // dort legt studio.js seine Fehler ab (dieselbe Adresse, derselbe Browser)
const EIGENE_V = (/[?&]v=([\w-]+)/.exec(($('script[src*="pruefung.js"]') || {}).src || '') || [])[1] || '';

// ---------------------------------------------------------------- Der Schreibtisch (17.10.2026): Meldungen mit Stichwort («STELLE · …»). «Was tun?» in der Quittung
// öffnet hier #m-<stichwort> (eigene Kennungen, damit sie nicht mit den Prüfpunkten kollidieren, Fund Doldenhorn F72). Texte nach dem Lexikon des Doldenhorn und des Ruedihus.
const LEX_SCHREIBTISCH = [
  { id: 'm-konflikt', titel: 'KONFLIKT · In einem anderen Fenster wurde gespeichert', sehen: 'Der Schreibtisch nimmt «Speichern» nicht an und lädt die Liste neu; Ihre gelben Eingaben stehen noch da.',
    grund: 'Der Schreibtisch ist in zwei Fenstern (oder auf zwei Rechnern) offen, und im anderen wurde inzwischen gespeichert. Damit nichts still überschrieben wird, vergleicht er den Stand des Entwurfs vor jedem Speichern.',
    tun: 'Ansehen, was das andere Fenster gespeichert hat, dann noch einmal «Speichern». Am besten nur in einem Fenster arbeiten.', worte: 'konflikt zwei fenster überschrieben 409 gleichzeitig' },
  { id: 'm-herkunft', titel: 'HERKUNFT · Anfrage von einer fremden Seite', sehen: 'Eine Meldung «Diese Anfrage kam von einer fremden Seite oder Adresse und wurde abgewiesen».',
    grund: 'Eine Anfrage kam nicht vom Schreibtisch selbst, sondern von einer anderen Adresse. So kann keine fremde Seite heimlich etwas an der Website ändern.',
    tun: 'Den Schreibtisch immer über seine eigene Adresse öffnen. Erscheint die Meldung beim normalen Arbeiten: Robert Bescheid geben.', worte: 'herkunft fremd 403 421 adresse abgewiesen' },
  { id: 'm-grenze', titel: 'GRENZE · Zu viele Anfragen in kurzer Zeit', sehen: 'Eine Meldung «Zu viele Anfragen in kurzer Zeit».',
    grund: 'Mehr als 60 Speicherungen oder 600 Abfragen in einer Minute vom selben Rechner. Der Schreibtisch macht eine Minute Pause, damit niemand den Server überlasten kann. Nichts geht verloren.',
    tun: 'Eine Minute warten, dann noch einmal.', worte: 'grenze zu viele 429 minute pause' },
  { id: 'm-groesse', titel: 'GROESSE · Die Anfrage ist zu gross', sehen: 'Ein Foto oder eine Eingabe wird abgewiesen, «grösser als 32 MB» oder «grösser als 25 MB».',
    grund: 'Eine Datei oder Eingabe ist grösser als 32 MB (ein Foto: höchstens 25 MB). Sie wird abgewiesen, bevor sie den Server belastet.',
    tun: 'Foto kleiner exportieren: für die Website reichen 2000 Pixel Breite (meist 1 bis 3 MB).', worte: 'gross mb foto datei 413 zu gross' },
  { id: 'm-stelle', titel: 'STELLE · Diese Stelle oder Seite gibt es nicht mehr', sehen: 'Ein Text, Abschnitt oder eine Seite lässt sich nicht mehr öffnen oder ausblenden.',
    grund: 'Die Website wurde inzwischen neu gebaut. Der Schreibtisch kennt die alte Stelle noch.',
    tun: 'Seite neu laden. Bleibt es: unter «Entwurf & Vergleich» nachsehen, ob die Änderung ihre Stelle verloren hat, und neu eingeben.', worte: 'stelle abschnitt seite nicht mehr umgebaut' },
  { id: 'm-bild', titel: 'BILD · Mit dem Foto stimmt etwas nicht', sehen: 'Ein Foto wird nicht übernommen: zu klein, zu gross, kein Bild oder ein iPhone-Foto im HEIC-Format.',
    grund: 'Fotos brauchen mindestens 900 Pixel Breite (Startbild, Fenster und Seitenköpfe 1400), höchstens 25 MB, und müssen JPG, PNG oder WebP sein. Auf der Website ändert sich nichts.',
    tun: 'Ein JPG, PNG oder WebP nehmen, mindestens 900, besser 2000 Pixel breit. iPhone: unter Einstellungen → Kamera → Formate «Maximale Kompatibilität».', worte: 'bild foto pixel heic klein hochladen' },
  { id: 'm-eingabe', titel: 'EINGABE · Die Eingabe passt nicht', sehen: 'Eine Meldung mit dem Stichwort EINGABE, die Eingabe steht noch im Feld.',
    grund: 'Ein Feld ist leer, wo etwas stehen muss, oder die Anfrage liess sich nicht lesen. Nichts wurde gespeichert.',
    tun: 'Den Satz der Meldung lesen und das Feld ergänzen. Um etwas ganz wegzunehmen: «Abschnitt ausblenden» statt leeren Text.', worte: 'eingabe leer feld ungültig' },
  { id: 'm-angabe', titel: 'ANGABE · Die Angabe passt nicht', sehen: 'Telefon, E-Mail, Link oder ein Datum wird nicht übernommen.',
    grund: 'Telefon ohne Ziffern, E-Mail ohne @, Link ohne https://, ein Datum, das es nicht gibt, oder ein leeres Pflichtfeld. Die Angabe wurde nicht übernommen, damit kein falscher Knopf auf der Website steht.',
    tun: 'Telefon wie 033 675 81 81, E-Mail vollständig, Links mit https:// am Anfang, Datum mit dem Kalender wählen.', worte: 'angabe telefon mail link datum falsch' },
  { id: 'm-hinweis', titel: 'HINWEIS · Der Hinweis für Gäste passt nicht', sehen: 'Der Hinweis wird nicht gespeichert.',
    grund: 'Hinweis eingeschaltet ohne Text, Datum nicht lesbar, «bis» vor «ab» oder ein Link ohne https://. Das Band auf der Website bleibt, wie es war.',
    tun: 'Text eintragen, Datum mit dem Kalender wählen, Link mit https:// oder eine Seite wie anreise.html.', worte: 'hinweis band gäste text datum link' },
  { id: 'm-laeuft', titel: 'LAEUFT · Es wird gerade veröffentlicht', sehen: '«Es wird gerade veröffentlicht. Einen Moment.»',
    grund: 'Ein Veröffentlichen ist noch nicht fertig. Ein zweites startet erst, wenn das erste fertig ist.',
    tun: 'Warten, bis «Ist online.» oder «Nicht veröffentlicht.» erscheint; der Schreibtisch zeigt den Fortschritt auch nach dem Neuladen.', worte: 'läuft veröffentlichen warten' },
  { id: 'm-pruefung', titel: 'PRUEFUNG · Vor dem Umschalten ist etwas aufgefallen', sehen: '«Nicht veröffentlicht.» mit einem Befund; die Website ist unverändert.',
    grund: 'Der Schreibtisch setzt beim Veröffentlichen alle Seiten zuerst in einem Bauordner und prüft sie: jede Seite endet sauber, keine Kennzeichen der Vorschau, keine Seite um mehr als 40 % kleiner, keine alte Telefonnummer oder Adresse mehr, jede Änderung an ihrer Stelle.',
    tun: 'Den Satz der Meldung lesen. Steht dort «hat ihre Stelle nicht gefunden»: unter «Entwurf & Vergleich» die Änderung neu eingeben. Sonst Robert Bescheid geben.', worte: 'prüfung veröffentlichen befund bauordner' },
  { id: 'm-nachpruefung', titel: 'NACHPRUEFUNG · Nach dem Übernehmen nicht gleich', sehen: '«Nicht veröffentlicht.», obwohl die Prüfung vorher grün war.',
    grund: 'Nach dem Übernehmen vergleicht der Schreibtisch jede neue Seite Byte für Byte mit der geprüften. Eine stimmte nicht (Platte voll, Datei von aussen geändert). Alles wurde aus der Sicherung zurückgestellt: die Website ist unverändert.',
    tun: 'Noch einmal veröffentlichen. Bleibt es: Robert Bescheid geben.', worte: 'nachprüfung byte gleich zurückgestellt' },
  { id: 'm-bau', titel: 'BAU · Die Seiten liessen sich nicht setzen', sehen: 'Speichern oder Veröffentlichen scheitert mit dem Stichwort BAU.',
    grund: 'Der Bau der Website mit den Änderungen ist gescheitert. Nichts wurde gespeichert oder veröffentlicht, die Website ist unverändert.',
    tun: 'Oben «Noch einmal prüfen». Ist der Punkt «Entwurf bauen» rot: «Entwurf neu bauen». Sonst Robert Bescheid geben.', worte: 'bau bauen seiten gescheitert' },
  { id: 'm-verlauf', titel: 'VERLAUF · Diese Fassung gibt es nicht mehr', sehen: 'Eine frühere Fassung lässt sich nicht zurückholen.',
    grund: 'Die Fassung liegt nicht mehr im Verlauf oder ist beschädigt. Nichts wurde geändert.',
    tun: 'Seite neu laden und eine andere Fassung wählen. «Ursprünglicher Stand» geht immer.', worte: 'verlauf fassung zurückholen' },
  { id: 'm-rueckgaengig', titel: 'RUECKGAENGIG · Dieser Schritt ist nicht mehr da', sehen: '«Rückgängig» in einer Quittung geht nicht mehr.',
    grund: 'Der Schreibtisch hebt die letzten 80 Speicherungen für «Rückgängig» auf; in der Probe-Fassung nur bis zum nächsten Neustart des Servers. Der Entwurf ist unverändert.',
    tun: 'Unter «Entwurf & Vergleich» einzelne Änderungen zurücknehmen oder unter «Frühere Fassungen» zurückholen.', worte: 'rückgängig schritt' },
  { id: 'm-seite', titel: 'SEITE · Das ist keine Seite der Website', sehen: 'Die Vorschau rechts bleibt leer oder meldet «keine Seite der Website».',
    grund: 'Die Vorschau sollte eine Seite zeigen, die es im Entwurf nicht gibt, meist nach einem Umbau oder einer entfernten eigenen Seite.',
    tun: 'Den Schreibtisch neu laden und die Seite neu wählen.', worte: 'seite vorschau leer' },
  { id: 'm-weg', titel: 'WEG · Unbekannte Anfrage', sehen: 'Eine Meldung mit dem Stichwort WEG.',
    grund: 'Oberfläche und Server passen nicht zusammen: eine Datei wurde ersetzt, die andere noch nicht.',
    tun: 'Oben «Studio frisch laden» oder die Seite mit Cmd+Shift+R neu laden.', worte: 'weg unbekannt fassung' },
  { id: 'm-zugang', titel: 'ZUGANG · Bitte anmelden', sehen: 'Der Schreibtisch verlangt eine Anmeldung.',
    grund: 'Der Schreibtisch ist mit Passwort geschützt und Sie sind nicht (mehr) angemeldet. Die Anmeldung hält 12 Stunden.',
    tun: 'Unter «Zugang» anmelden, dann weiterarbeiten. Ungespeicherte Eingaben bleiben im Fenster stehen.', worte: 'zugang anmelden passwort' },
  { id: 'm-verbindung', titel: 'VERBINDUNG · Keine Verbindung zum Schreibtisch', sehen: 'Speichern scheitert mit «Keine Verbindung zum Schreibtisch».',
    grund: 'Der Browser erreicht den Server nicht (Netz weg, Server aus). Nichts wurde gespeichert; Ihre Eingaben sind noch im Fenster, gelb markiert.',
    tun: 'Verbindung prüfen, dann noch einmal «Speichern». Die Eingaben gehen nicht verloren, solange das Fenster offen bleibt.', worte: 'verbindung netz offline speichern' },
  { id: 'm-server', titel: 'SERVER · Unerwarteter Fehler', sehen: 'Eine Meldung mit dem Stichwort SERVER.',
    grund: 'Etwas, mit dem der Schreibtisch nicht gerechnet hat. Der Fehler steht im Fehlerprotokoll unten. Ihre Eingaben sind noch im Fenster.',
    tun: 'Oben «Noch einmal prüfen» und «Bericht kopieren», an Robert schicken.', worte: 'server fehler unerwartet' },
  { id: 'schreibtisch-teile', titel: 'Teile des Schreibtischs fehlen', sehen: 'Der Punkt «Der Schreibtisch» ist rot.',
    grund: 'Eine Datei des Schreibtischs (Programm oder Oberfläche) liegt nicht auf dem Server, meist nach einem unvollständigen Hochladen.',
    tun: 'Robert Bescheid geben. Bis dahin laufen die früheren Ansichten weiter unter /studio/alt.html.', worte: 'schreibtisch teile fehlen datei' },
  { id: 'bauordner', titel: 'Reste eines abgebrochenen Veröffentlichens', sehen: 'Der Punkt «Bauordner» ist gelb.',
    grund: 'Ein Veröffentlichen wurde abgebrochen (Server neu gestartet, Rechner ausgeschaltet). Der Bauordner neben der Website blieb liegen. Die Website selbst ist davon nicht betroffen.',
    tun: 'Unter «Reparieren» «Bauordner wegräumen» drücken (zweimal klicken).', worte: 'bauordner reste abgebrochen veröffentlichen' },
];
// ---------------------------------------------------------------- Lexikon: jede bekannte Fehlerquelle, in Alltagssprache
// Felder: titel · sehen (was Sie sehen) · grund (woran es liegt) · tun (was Sie tun) · worte (Suchbegriffe, durch Leerzeichen)
const LEX = [
  { id: 'keine-verbindung', titel: 'Das Studio antwortet nicht', sehen: 'Die Seite bleibt leer oder zeigt «Keine Verbindung zum Studio». Nichts lässt sich speichern.',
    grund: 'Ihr Gerät hat kein Internet, oder der Server des Studios ist nicht erreichbar. Lokal (localhost): das Programm serve.py läuft nicht mehr.',
    tun: 'Erst eine andere Website öffnen: geht die, liegt es am Studio. Dann diese Prüfung neu laden; der Punkt «Studio erreichbar» sagt, ob der Server antwortet. Lokal: serve.py neu starten. Online: ein paar Minuten warten und noch einmal versuchen.',
    worte: 'verbindung offline weiss leer antwortet nicht server aus internet laden' },
  { id: 'kekse-zu-gross', titel: 'Der Browser schickt zu viel gespeicherten Stand mit (Probe-Fassung)', sehen: 'Jede Anfrage scheitert, auch die Prüfung meldet «antwortet nicht» oder die Zahl 494. Vorher war viel im Entwurf und im Verlauf.',
    grund: 'In der Probe-Fassung reist Ihr ganzer Stand im Gedächtnis des Browsers (Cookies) mit. Der Server nimmt nur rund 29 kB Kopfzeilen an. Wird Ihr Stand grösser, kommt keine Anfrage mehr durch. Das Studio hält ihn unter 22 kB; der Punkt «Ihr Stand im Browser» warnt vorher.',
    tun: 'Unten «Probe zurücksetzen» drücken. Das leert den gespeicherten Stand dieses Browsers; die echte Website ist davon nie betroffen. Danach beginnen Sie wieder mit dem veröffentlichten Stand.',
    worte: '494 cookies kekse gross probe zurücksetzen antwortet nicht kopfzeilen' },
  { id: 'kekse-aus', titel: 'Der Browser merkt sich nichts (Cookies aus)', sehen: 'Nach dem Anmelden landen Sie sofort wieder vor dem Passwort. In der Probe-Fassung ist nach jedem Klick alles weg.',
    grund: 'Cookies sind in diesem Browser abgeschaltet oder für diese Adresse blockiert. Das Studio braucht sie für die Anmeldung (und in der Probe für Ihren Stand).',
    tun: 'In den Einstellungen des Browsers Cookies für diese Adresse erlauben, oder ein privates Fenster schliessen und ein normales nehmen. Dann die Prüfung neu laden.',
    worte: 'cookies aus blockiert anmeldung hält nicht privat fenster' },
  { id: 'alte-fassung', titel: 'Der Browser zeigt eine ältere Fassung des Studios', sehen: 'Knöpfe fehlen oder tun etwas anderes als beschrieben. Die Prüfung meldet, dass die Fassung nicht zur Fassung des Servers passt.',
    grund: 'Der Browser hat die Dateien des Studios aus seinem Zwischenspeicher genommen, obwohl auf dem Server eine neuere liegen. Jede neue Fassung bekommt eine eigene Marke (?v=); passt die nicht, ist der Zwischenspeicher alt.',
    tun: '«Studio frisch laden» unten drücken. Hilft das nicht: Seite mit gedrückter Umschalttaste neu laden oder den Zwischenspeicher des Browsers leeren.',
    worte: 'alt fassung version cache zwischenspeicher neu laden knopf fehlt' },
  { id: 'abgemeldet', titel: 'Sie sind abgemeldet', sehen: 'Beim Speichern erscheint das Passwortfeld, oder es heisst «Bitte anmelden». Entwurf und Vergleich zeigen «Bitte im Studio anmelden».',
    grund: 'Eine Anmeldung gilt zwölf Stunden, danach meldet das Studio von selbst ab. Auch nach «Alle Anmeldungen beenden» oder nach einem neuen Passwort ist jeder abgemeldet.',
    tun: 'Passwort eingeben. Nichts ist verloren: der Entwurf liegt auf dem Server, nicht im Browser.',
    worte: 'anmelden passwort abgemeldet 401 bitte anmelden zwölf stunden' },
  { id: 'passwort-vergessen', titel: 'Passwort vergessen oder noch keines festgelegt', sehen: 'Das Studio verlangt ein Passwort, Sie kennen es nicht. Oder: es verlangt ein neues, obwohl Sie schon eines hatten.',
    grund: 'Das Passwort liegt nur als Prüfsumme auf dem Server; niemand kann es nachsehen. Fehlt die Datei zugang.json, verlangt das Studio ein neues.',
    tun: 'Robert Bescheid geben: er nimmt die Datei zugang.json aus dem Ordner inhalt, und beim nächsten Öffnen legen Sie ein neues Passwort fest. Ihre Inhalte bleiben alle erhalten.',
    worte: 'passwort vergessen neu festlegen zugang einrichten' },
  { id: 'zu-viele-versuche', titel: 'Anmeldung kurz gesperrt', sehen: '«Zu viele Versuche. Bitte in … Sekunden noch einmal.»',
    grund: 'Nach fünf falschen Passwörtern hintereinander wartet das Studio 30 Sekunden. Das bremst jeden, der Passwörter durchprobiert.',
    tun: 'Eine halbe Minute warten, dann in Ruhe eingeben. Grossschreibung und Leerzeichen prüfen.',
    worte: 'gesperrt versuche sekunden passwort falsch' },
  { id: 'zugang-offen', titel: 'Das Studio ist ohne Passwort offen', sehen: 'Unter «Zugang» steht «Offen». Jeder kommt ohne Passwort hinein.',
    grund: 'Für die Einrichtung liegt im Ordner inhalt eine Datei namens offen. Solange sie da ist, fragt das Studio nicht nach einem Passwort.',
    tun: 'Sobald Sie wirklich mit dem Studio arbeiten: Robert Bescheid geben, er nimmt die Datei weg. Beim nächsten Öffnen legen Sie Ihr Passwort fest.',
    worte: 'offen ohne passwort zugang schutz' },
  { id: 'nicht-gespeichert', titel: 'Geändert, aber nicht gespeichert', sehen: 'Die Leiste unter einer Karte ist gelb: «… noch nicht gespeichert». Beim Weitergehen fragt das Studio nach.',
    grund: 'Angaben werden erst mit «Speichern» in den Entwurf übernommen. Was nur im Feld steht, geht beim Wechsel der Ansicht verloren.',
    tun: 'Auf «Speichern» an der Karte drücken. Die Leiste wird grün und zeigt, dass es im Entwurf liegt.',
    worte: 'gelb speichern leiste verloren weitergehen' },
  { id: 'nicht-veroeffentlicht', titel: 'Gespeichert, aber nicht auf der Website', sehen: 'Im Studio steht die Änderung, auf der Website nicht. Unten steht «… Änderungen im Entwurf».',
    grund: 'Das Studio arbeitet in zwei Stufen: Entwurf und Website. Gespeichert heisst: im Entwurf. Erst «Veröffentlichen» stellt es für Gäste auf die Website.',
    tun: 'Unten in der Leiste «Veröffentlichen» drücken, die Liste prüfen, bestätigen. Danach «Website ansehen».',
    worte: 'veröffentlichen entwurf website nicht sichtbar gäste' },
  { id: 'website-alt', titel: 'Die Website zeigt noch den alten Stand', sehen: 'Veröffentlicht, aber im Browser steht noch das Alte.',
    grund: 'Der Browser zeigt die Seite aus seinem Zwischenspeicher. Online werden Bilder bis zu zehn Minuten zwischengespeichert, Seiten nicht.',
    tun: 'Die Website neu laden (am Handy nach unten ziehen). Bei Bildern bis zu zehn Minuten warten. Im Studio zeigt «Website ansehen» immer den neuesten Stand.',
    worte: 'alt website zwischenspeicher neu laden bild zehn minuten' },
  { id: 'entwurf-baut-nicht', titel: 'Die Seite lässt sich nicht bauen', sehen: 'Rote Meldung «Der Entwurf lässt sich gerade nicht bauen» oder «Die Seite liess sich nicht bauen». Speichern wird abgewiesen.',
    grund: 'Aus Ihren Inhalten und dem Bauplan entsteht bei jeder Änderung die ganze Seite neu. Wenn dabei etwas nicht zusammenpasst (ein kaputter Eintrag, eine fehlende Datei, ein Fehler im Bauplan), bricht der Bau ab. Ihre vorige Änderung bleibt dabei erhalten.',
    tun: 'Unten «Entwurf neu bauen». Hilft das nicht, «Entwurf aufräumen» (nimmt heraus, was keine Stelle mehr hat). Als Letztes «Entwurf leeren». Bleibt es rot, steht die Ursache im Fehlerprotokoll: Bericht an Robert.',
    worte: 'bauen fehler rot entwurf speichern abgewiesen bau' },
  { id: 'datei-beschaedigt', titel: 'Eine Datei mit Inhalten ist beschädigt', sehen: '«Die Datei entwurf.json ist beschädigt» oder «stand.json ist beschädigt». Das Studio verweigert das Speichern, damit nichts überschrieben wird.',
    grund: 'Die Datei wurde unterbrochen geschrieben (Rechner aus, Platte voll) oder von Hand verändert. Das Studio liest sie absichtlich nicht als leer, sonst wären mit dem nächsten Speichern alle Änderungen weg. Von jeder Fassung bleibt die vorige als Sicherung.',
    tun: '«Letzte Sicherung zurückholen» unten. Für den veröffentlichten Stand gibt es den eigenen Griff. Ohne Sicherung: einen Stand aus dem Verlauf zurückholen.',
    worte: 'beschädigt datei json sicherung zurückholen stand entwurf' },
  { id: 'inhalt-passt-nicht', titel: 'Einträge im Entwurf passen nicht mehr zur Seite', sehen: 'Die Prüfung zählt Punkte, die «keine Stelle mehr haben». Eine Änderung zeigt keine Wirkung.',
    grund: 'Der Bauplan der Seite wurde geändert (ein Satz umgebaut, ein Bild entfernt), nachdem Sie dort etwas geändert hatten. Die Änderung hängt am alten Satz und findet ihn nicht mehr.',
    tun: '«Entwurf aufräumen» nimmt genau diese Einträge heraus, alles andere bleibt. Dann die Stelle in «Seiten & Texte» neu ändern.',
    worte: 'verwaist keine stelle wirkung aufräumen text' },
  { id: 'verwaiste-texte', titel: 'Ein geänderter Text hat keine Stelle mehr', sehen: 'Unter «Änderungen» steht «Diese Stelle gibt es auf der Seite nicht mehr».',
    grund: 'Wie bei «Einträge passen nicht mehr»: der ursprüngliche Satz wurde in der Vorlage umgebaut.',
    tun: 'Die Änderung zurücknehmen oder «Entwurf aufräumen». Den Text an der neuen Stelle noch einmal ändern.',
    worte: 'text stelle nicht mehr änderung wirkung' },
  { id: 'bild-fehlt', titel: 'Ein Foto fehlt auf der Platte', sehen: 'Auf der Seite ist ein leeres Bild. Die Prüfung nennt ein Foto, das nicht mehr da ist.',
    grund: 'Ein hochgeladenes Foto wurde aus dem Ordner assets/img entfernt, oder der Upload ist unvollständig geblieben.',
    tun: 'Das Foto in «Bilder» noch einmal hochladen. Oder «Entwurf aufräumen»: dann steht wieder das ursprüngliche Bild da.',
    worte: 'bild fehlt leer foto hochladen' },
  { id: 'bild-zu-gross', titel: 'Foto zu gross oder nicht lesbar', sehen: '«Das Bild ist grösser als 30 MB», «… zu gross» oder «Die Datei ist kein Bild».',
    grund: 'Das Studio nimmt JPG, PNG und WebP bis 30 MB und bis etwa 8000 Pixel Breite. Fotos aus Kameras im Rohformat (RAW, HEIC) kann es nicht lesen.',
    tun: 'Das Foto am Handy oder Rechner als JPG sichern (Teilen → als JPG) und noch einmal hochladen. 2400 bis 4000 Pixel Breite reichen für jede Stelle.',
    worte: 'bild gross mb pixel heic raw format hochladen' },
  { id: 'bild-format', titel: 'Datei ist kein lesbares Bild', sehen: '«Die Datei ist kein Bild, das wir lesen können (JPG, PNG, WebP).»',
    grund: 'HEIC vom iPhone, PDF, RAW oder eine beschädigte Datei.',
    tun: 'Als JPG sichern und noch einmal hochladen.',
    worte: 'heic pdf raw bild format kein bild' },
  { id: 'pdf-format', titel: 'Die PDF der Karte lässt sich nicht hochladen', sehen: '«Die Datei ist keine PDF» oder «… grösser als 25 MB».',
    grund: 'Nur echte PDF-Dateien bis 25 MB. Ein Foto der Karte ist kein PDF.',
    tun: 'Die Karte aus dem Schreibprogramm als PDF sichern (nicht als Bild), dann unter «Ässe u trinke» ganz unten hochladen.',
    worte: 'pdf karte hochladen gross' },
  { id: 'pil-fehlt', titel: 'Fotos können auf diesem Rechner nicht verarbeitet werden', sehen: 'Beim Hochladen eines Fotos kommt ein Fehler, obwohl die Datei in Ordnung ist. Die Prüfung meldet das Werkzeug als fehlend.',
    grund: 'Das Programm, das Fotos verkleinert (Pillow), ist auf dem Rechner, auf dem das Studio läuft, nicht eingerichtet.',
    tun: 'Robert Bescheid geben (Befehl: pip3 install pillow). Alles andere im Studio geht weiter.',
    worte: 'pillow bild verarbeiten fehlt hochladen rechner' },
  { id: 'quellen-fehlen', titel: 'Dateien des Bauplans fehlen', sehen: 'Die Prüfung nennt Dateien wie bau.py oder manifest.json als fehlend. Nichts baut mehr.',
    grund: 'Im Projektordner wurde etwas verschoben oder gelöscht.',
    tun: 'Nichts selbst verschieben. Robert Bescheid geben, er holt die Dateien aus der Sicherung zurück.',
    worte: 'bauplan dateien fehlen bau.py manifest' },
  { id: 'schreibschutz', titel: 'Der Ordner mit den Inhalten ist schreibgeschützt', sehen: 'Jedes Speichern scheitert, die Prüfung meldet «schreibgeschützt».',
    grund: 'Die Rechte des Ordners inhalt wurden geändert, die Platte ist voll oder nur lesbar eingehängt.',
    tun: 'Platz auf der Platte prüfen (Punkt «Platz auf dem Rechner»). Sonst Robert Bescheid geben.',
    worte: 'schreibgeschützt rechte ordner speichern scheitert' },
  { id: 'speicher-voll', titel: 'Wenig Platz auf dem Rechner', sehen: 'Hochladen oder Veröffentlichen bricht ab. Die Prüfung zeigt wenige GB frei.',
    grund: 'Jedes Foto wird in drei Grössen gesichert, jede Veröffentlichung im Verlauf. Das braucht Platz.',
    tun: 'Platz schaffen (Papierkorb, Downloads). Unter 300 MB speichert das Studio nichts mehr.',
    worte: 'platz speicher voll gb platte' },
  { id: 'live-fehlt', titel: 'Auf der Website fehlen Seiten', sehen: 'Eine Seite der Website zeigt «Nicht gefunden».',
    grund: 'Die veröffentlichten Dateien wurden verschoben, oder eine Veröffentlichung ist abgebrochen.',
    tun: 'Irgendetwas Kleines ändern und veröffentlichen: das baut alle Seiten neu. Oder im Verlauf den letzten Stand zurückholen und veröffentlichen.',
    worte: 'nicht gefunden 404 seite fehlt website' },
  { id: 'verlauf-unvollstaendig', titel: 'Ein Stand im Verlauf lässt sich nicht zurückholen', sehen: '«Dieser Stand ist nicht mehr vollständig gespeichert» oder «Diesen Stand gibt es nicht».',
    grund: 'Die Datei dieses Stands ist beschädigt. In der Probe-Fassung fallen ältere Stände absichtlich weg, damit der Stand im Browser klein bleibt.',
    tun: 'Einen anderen Stand aus dem Verlauf nehmen. Der ursprüngliche Stand («Stand vor der ersten Änderung») ist immer da.',
    worte: 'verlauf zurückholen stand unvollständig' },
  { id: 'server-fehler', titel: 'Im Studio ist etwas Unvorhergesehenes passiert', sehen: '«Im Studio ist etwas schiefgegangen» oder «Die Eingabe liess sich nicht lesen».',
    grund: 'Ein Fehler, den niemand vorgesehen hat. Das Studio hält ihn im Fehlerprotokoll fest, mit allem, was Robert braucht.',
    tun: 'Noch einmal versuchen. Kommt es wieder: Bericht kopieren und an Robert schicken. Ihre Inhalte sind davon nicht betroffen.',
    worte: 'schiefgegangen 500 fehler unvorhergesehen protokoll' },
  { id: 'oberflaeche-fehler', titel: 'Ein Fehler in der Oberfläche des Studios', sehen: 'Ein Knopf tut nichts, eine Ansicht bleibt leer. Die Prüfung zeigt Einträge unter «Fehler in der Oberfläche».',
    grund: 'Ein Fehler im Programm des Studios in diesem Browser. Es merkt sich die letzten Fehler für diese Prüfung.',
    tun: '«Studio frisch laden». Kommt es wieder: Bericht an Robert, er sieht darin genau, wo es passiert ist.',
    worte: 'knopf tut nichts leer ansicht fehler skript' },
  { id: 'werk-leer', titel: 'In «Seiten & Texte» bleibt die Seite leer', sehen: 'Der grosse Bereich mit der Seite bleibt weiss oder zeigt «Nicht gefunden».',
    grund: 'Der Entwurf der Seite konnte nicht geladen werden: nicht gebaut, abgemeldet, oder die Seite wurde gelöscht.',
    tun: 'Prüfen, ob der Punkt «Entwurf-Seite» grün ist. Sonst «Entwurf neu bauen». Bei «Bitte im Studio anmelden»: neu anmelden.',
    worte: 'seite leer weiss rahmen werk nicht gefunden' },
  { id: 'vergleich-leer', titel: 'Der Vergleich zeigt die Stelle nicht', sehen: 'Im Vorher/Nachher steht «Diese Stelle ist gerade eingeklappt» oder «Hier stand das vorher noch nicht».',
    grund: 'Die Stelle liegt in einem Reiter, Dialog oder Klappbereich, oder sie ist neu (vorher gab es sie nicht). Das ist kein Fehler.',
    tun: 'In der Seite den Reiter öffnen, oder mit den Pfeilen zur nächsten Stelle.',
    worte: 'vergleich vorher nachher stelle eingeklappt' },
  { id: 'anlass-unsichtbar', titel: 'Der Anlass steht nicht auf der Seite', sehen: 'Gespeichert, veröffentlicht, aber auf «Ässe u trinke» kein Kasten.',
    grund: 'Der Anlass ist ausgeschaltet, hat kein Datum oder keinen Namen, oder das Datum ist vorbei. Nach dem Datum nimmt die Seite ihn von selbst weg.',
    tun: 'Unter «Anlass & Hinweis»: Schalter an, Datum in der Zukunft, Name eingetragen. Speichern und veröffentlichen.',
    worte: 'anlass kasten nicht sichtbar datum vorbei' },
  { id: 'hinweis-unsichtbar', titel: 'Der Hinweis für Gäste ist nicht zu sehen', sehen: 'Hinweis gespeichert, aber unten auf der Seite steht nichts.',
    grund: 'Ausgeschaltet, leerer Text, oder Sie sind ausserhalb von «Zeigen ab» und «Zeigen bis». Die Seite prüft das Datum beim Öffnen mit der Uhr des Besuchers. Im Entwurf-Fenster des Studios ist der Streifen absichtlich ausgeblendet.',
    tun: 'Schalter an, Text eintragen, Zeitraum prüfen. Auf der echten Website nachsehen, nicht im Entwurf-Fenster.',
    worte: 'hinweis streifen nicht sichtbar zeitraum' },
  { id: 'uhrzeit', titel: 'Die Uhr stimmt nicht', sehen: 'Ein Anlass verschwindet zu früh oder zu spät; die Prüfung meldet, dass Ihre Uhr von der des Studios abweicht.',
    grund: 'Anlass und Hinweis hängen am Datum. Geht die Uhr des Rechners oder des Servers falsch, stimmt der Tag nicht.',
    tun: 'Datum und Uhrzeit des Geräts automatisch stellen lassen. Weicht die Uhr des Studios ab: Robert Bescheid geben.',
    worte: 'uhr zeit datum falsch abweichung' },
  { id: 'menue-voll', titel: 'Das Menü nimmt keinen weiteren Punkt', sehen: '«Das Menü fasst höchstens acht Punkte.»',
    grund: 'Mehr Punkte passen oben auf der Seite nicht nebeneinander, auch nicht am Handy.',
    tun: 'Einen Punkt mit dem Auge aus dem Menü nehmen, dann den neuen hinzufügen.',
    worte: 'menü acht punkte voll' },
  { id: 'browser-alt', titel: 'Der Browser ist zu alt', sehen: 'Teile des Studios sehen falsch aus oder reagieren nicht. Die Prüfung meldet fehlende Fähigkeiten des Browsers.',
    grund: 'Das Studio braucht einen Browser der letzten zwei Jahre (Safari, Chrome, Firefox, Edge).',
    tun: 'Den Browser aktualisieren oder einen anderen nehmen. Am iPhone: iOS aktualisieren.',
    worte: 'browser alt safari chrome aktualisieren fähigkeiten' },
  { id: 'dateien-fehlen', titel: 'Dateien des Studios laden nicht', sehen: 'Das Studio sieht nackt aus (keine Farben, keine Schrift) oder lädt gar nicht.',
    grund: 'studio.css oder studio.js kommen nicht an: unterbrochene Verbindung, ein Blocker im Browser, oder die Dateien fehlen auf dem Server.',
    tun: 'Neu laden. Werbeblocker für diese Adresse ausschalten. Bleibt der Punkt rot: Bericht an Robert.',
    worte: 'nackt keine farben schrift css js lädt nicht blocker' },
  { id: 'probe-fassung', titel: 'Was die Probe-Fassung anders macht', sehen: 'Oben steht «Probe-Fassung · Ihre Änderungen bleiben in diesem Browser». Hochladen geht nicht, es gibt kein Passwort.',
    grund: 'Die Probe-Fassung läuft online ohne eigenen Server. Jeder Besucher arbeitet in seiner eigenen Kopie; der Stand reist im Browser mit. Nichts davon erreicht die echte Website. «Website ansehen» zeigt den Stand, den Sie in dieser Kopie veröffentlicht haben.',
    tun: 'Alles ausprobieren. Zum Zurücksetzen: unten «Probe zurücksetzen». Das echte Studio hat Passwort, Hochladen und einen festen Verlauf.',
    worte: 'probe fassung hochladen passwort kopie browser' },
];
LEX.push(...LEX_SCHREIBTISCH);

// ---------------------------------------------------------------- Werkzeug
const P = { hier: [], dort: [], status: null, pr: null, dauer: {} };
function meld(text, fehler) {
  const d = document.createElement('div');
  d.textContent = text;
  if (fehler) d.className = 'f';
  $('#meldung').appendChild(d);
  setTimeout(() => d.remove(), fehler ? 6000 : 3200);
}
async function hole(url, o = {}, ms = 25000) {
  const ab = new AbortController(), t0 = performance.now(), t = setTimeout(() => ab.abort(), ms);
  try {
    const r = await fetch(url, { cache: 'no-store', credentials: 'same-origin', ...o, signal: ab.signal });
    const text = await r.text();
    let json = null;
    try { json = JSON.parse(text); } catch (e) {}
    return { ok: r.ok, status: r.status, text, json, dauer: Math.round(performance.now() - t0), kopf: r.headers };
  } catch (e) {
    return { ok: false, status: 0, text: '', json: null, dauer: Math.round(performance.now() - t0), fehler: e.name === 'AbortError' ? 'keine Antwort in ' + Math.round(ms / 1000) + ' Sekunden' : e.message };
  } finally { clearTimeout(t); }
}
const punkt = (id, titel, stand, text, lex, mehr = {}) => ({ id, titel, stand, text, lex: lex || null, ...mehr });
const kekseGroesse = () => document.cookie.split(';').map(s => s.trim()).filter(s => /^bg_/.test(s)).reduce((a, s) => a + s.length + 2, 0);
const kekseTeile = () => { const m = /(?:^|;\s*)bg_zn=(\d+)/.exec(document.cookie); return m ? +m[1] : 0; };
function eigeneFehler() { try { return JSON.parse(localStorage.getItem(SPEICHER) || '[]'); } catch (e) { return []; } }

// ---------------------------------------------------------------- Prüfung von hier aus (Verbindung, Browser)
async function pruefeHier() {
  const p = [];
  zeichne();
  p.push(punkt('netz', 'Internet', navigator.onLine ? 'ok' : 'fehler', navigator.onLine ? 'Dieses Gerät ist mit einem Netz verbunden.' : 'Dieses Gerät meldet: kein Netz. Prüfen Sie WLAN oder Mobilfunk.', navigator.onLine ? null : 'keine-verbindung'));
  const kekse = navigator.cookieEnabled;
  p.push(punkt('kekse', 'Gedächtnis des Browsers (Cookies)', kekse ? 'ok' : 'fehler', kekse ? 'Der Browser merkt sich Anmeldung und Stand.' : 'Cookies sind abgeschaltet. Die Anmeldung hält nicht, in der Probe-Fassung geht jede Änderung verloren.', kekse ? null : 'kekse-aus'));
  P.hier = p.slice(); zeichne();
  const s = await hole('/studio/api/status', {}, 15000);
  P.dauer.status = s.dauer;
  const gr = kekseGroesse();
  if (!s.ok) {
    const zuGross = s.status === 494 || s.status === 431 || (s.status === 0 && gr > 15000);
    p.push(punkt('verbindung', 'Studio erreichbar', 'fehler',
      zuGross ? `Der Server nimmt die Anfrage nicht an${s.status ? ' (Antwort ' + s.status + ')' : ''}: der Browser schickt ${Math.round(gr / 1024)} kB gespeicherten Stand mit, das ist zu viel. «Probe zurücksetzen» unten behebt das.`
        : s.status ? `Der Server antwortet mit ${s.status} statt mit dem Stand des Studios.` : `Keine Antwort vom Studio (${s.fehler || 'unbekannt'}).`,
      zuGross ? 'kekse-zu-gross' : s.status >= 500 ? 'server-fehler' : 'keine-verbindung', { zuGross }));
    P.hier = p.slice(); zeichne();
    return;
  }
  P.status = s.json || {};
  const st = P.status;
  p.push(punkt('verbindung', 'Studio erreichbar', 'ok', `Der Server antwortet in ${s.dauer} ms${st.probe ? ' (Probe-Fassung auf Vercel)' : ''}.`, null));
  if (st.probe || gr) {
    const teile = kekseTeile(), anteil = gr / 22000;
    p.push(punkt('stand-browser', 'Gespeicherter Stand in diesem Browser', anteil < .5 ? 'ok' : anteil < .85 ? 'hinweis' : 'fehler',
      st.probe ? `${Math.max(1, Math.round(gr / 1024))} kB in ${teile} ${teile === 1 ? 'Teil' : 'Teilen'} (höchstens 6). ` + (anteil < .5 ? 'Alles im grünen Bereich.' : anteil < .85 ? 'Das wird viel; ältere Stände im Verlauf fallen von selbst weg.' : 'Nahe an der Grenze. Setzen Sie die Probe zurück, bevor nichts mehr antwortet.')
        : `${Math.max(1, Math.round(gr / 1024))} kB an Studio-Daten im Browser.`, anteil < .5 ? (st.probe ? 'probe-fassung' : null) : 'kekse-zu-gross'));
  }
  // Fassung: die Marke des Servers gegen die Marke, mit der studio.js und diese Seite geladen wurden
  const seite = await hole('/studio/', {}, 15000);
  const mv = /(?:bureau|studio)\.js\?v=([\w-]+)/.exec(seite.text || '');   // /studio/ ist seit 17.10.2026 der Schreibtisch (bureau.js)
  const geladen = mv ? mv[1] : '';
  if (!st.version) p.push(punkt('fassung', 'Fassung des Studios', 'hinweis', 'Der Server nennt keine Fassung. Das ist eine ältere Fassung des Servers.', 'alte-fassung'));
  else if (!/^[0-9a-f]{8}$/.test(geladen) && !/^[0-9a-f]{8}$/.test(EIGENE_V)) p.push(punkt('fassung', 'Fassung des Studios', 'ok', `Fassung ${st.version} (lokal, ohne Stempel im Browser).`, null));
  else if ((geladen && geladen !== st.version) || (EIGENE_V && /^[0-9a-f]{8}$/.test(EIGENE_V) && EIGENE_V !== st.version))
    p.push(punkt('fassung', 'Fassung des Studios', 'hinweis', `Der Browser hat Fassung ${geladen || EIGENE_V} geladen, auf dem Server liegt ${st.version}. «Studio frisch laden» holt die neue.`, 'alte-fassung'));
  else p.push(punkt('fassung', 'Fassung des Studios', 'ok', `Fassung ${st.version}, Browser und Server stimmen überein.`, null));
  P.hier = p.slice(); zeichne();
  // Uhr
  if (st.zeit) {
    const diff = Math.abs(new Date(st.zeit) - Date.now()) / 1000;
    p.push(punkt('uhr', 'Uhr dieses Geräts', diff > 300 ? 'hinweis' : 'ok', diff > 300 ? `Ihre Uhr weicht ${Math.round(diff / 60)} Minuten von der Uhr des Studios ab. Anlass und Hinweis hängen am Datum.` : 'Ihre Uhr und die Uhr des Studios stimmen überein.', diff > 300 ? 'uhrzeit' : null));
  }
  // Stand und Seiten
  const stand = await hole('/studio/api/stand', {}, 30000);
  P.dauer.stand = stand.dauer;
  if (stand.ok && stand.json) p.push(punkt('stand', 'Stand des Studios laden', stand.dauer > 8000 ? 'hinweis' : 'ok', `Alle Inhalte kommen an (${(stand.text.length / 1024).toFixed(0)} kB in ${(stand.dauer / 1000).toFixed(1)} s)${stand.json.aenderungen ? `, ${stand.json.aenderungen.length} ${stand.json.aenderungen.length === 1 ? 'Änderung' : 'Änderungen'} im Entwurf` : ''}.` + (stand.dauer > 8000 ? ' Das ist langsam; beim ersten Aufruf nach einer Pause ist das normal.' : ''), null));
  else if (stand.status === 401) p.push(punkt('stand', 'Stand des Studios laden', 'hinweis', 'Sie sind nicht angemeldet. Die Punkte, die Inhalte betreffen, sind deshalb nur eingeschränkt prüfbar.', 'abgemeldet'));
  else p.push(punkt('stand', 'Stand des Studios laden', 'fehler', (stand.json && stand.json.fehler) || `Der Stand lässt sich nicht laden (${stand.status || stand.fehler}).`, (stand.json && stand.json.lex) || (stand.status >= 500 ? 'server-fehler' : 'keine-verbindung')));
  P.hier = p.slice(); zeichne();
  const [ent, vor] = await Promise.all([hole('/entwurf/index.html?nomotion', {}, 30000), hole('/vorher/index.html?nomotion', {}, 30000)]);
  const seiteOk = r => r.ok && /data-e="/.test(r.text);
  p.push(punkt('entwurf-seite', 'Entwurf-Seite (für «Seiten & Texte»)', seiteOk(ent) ? 'ok' : ent.status === 403 ? 'hinweis' : 'fehler',
    seiteOk(ent) ? `Die Startseite des Entwurfs lädt (${(ent.text.length / 1024).toFixed(0)} kB) und hat ${(ent.text.match(/data-e="/g) || []).length} anklickbare Stellen.` : ent.status === 403 ? 'Nur angemeldet zu sehen.' : ent.ok ? 'Die Seite lädt, aber ohne anklickbare Stellen: der Entwurf ist nicht als Entwurf gebaut.' : `Die Entwurf-Seite kommt nicht an (${ent.status || ent.fehler}).`,
    seiteOk(ent) ? null : ent.status === 403 ? 'abgemeldet' : 'werk-leer'));
  p.push(punkt('vorher-seite', 'Vergleichs-Seite (Vorher)', vor.ok ? 'ok' : vor.status === 403 ? 'hinweis' : 'fehler', vor.ok ? 'Die Seite für den Vergleich lädt.' : vor.status === 403 ? 'Nur angemeldet zu sehen.' : `Kommt nicht an (${vor.status || vor.fehler}).`, vor.ok ? null : vor.status === 403 ? 'abgemeldet' : 'werk-leer'));
  P.hier = p.slice(); zeichne();
  const dateien = ['/studio/bureau.js', '/studio/bureau.css', '/studio/studio.js', '/studio/studio.css', '/assets/fonts/barlowsemi-600.woff2', '/assets/logo/schrift-berghotel-gasterntal.svg', '/assets/img/haus-giebel-s.webp'];
  const rs = await Promise.all(dateien.map(d => hole(d, { method: 'GET' }, 20000)));
  const kaputt = dateien.filter((d, i) => !rs[i].ok);
  p.push(punkt('dateien', 'Dateien des Studios und der Seite', kaputt.length ? 'fehler' : 'ok', kaputt.length ? 'Nicht ladbar: ' + kaputt.map(d => d.split('/').pop()).join(', ') + '.' : `Programm, Gestaltung, Schrift, Schriftzug und ein Foto laden (${rs.map(r => r.dauer).reduce((a, b) => Math.max(a, b), 0)} ms die langsamste).`, kaputt.length ? 'dateien-fehlen' : null));
  const faehig = { 'Grösse der Ansicht beobachten': 'ResizeObserver' in window, 'Moderne Auswahl in der Gestaltung (:has)': (() => { try { return CSS.supports('selector(:has(a))'); } catch (e) { return false; } })(), 'Daten abrufen': 'fetch' in window, 'Lokales Gedächtnis': (() => { try { localStorage.setItem('_p', '1'); localStorage.removeItem('_p'); return true; } catch (e) { return false; } })(), 'Verschachtelte Dialoge': 'HTMLDialogElement' in window };
  const fehlt = Object.entries(faehig).filter(([, ok]) => !ok).map(([n]) => n);
  p.push(punkt('browser', 'Browser', fehlt.length ? 'hinweis' : 'ok', (fehlt.length ? 'Diesem Browser fehlt: ' + fehlt.join(', ') + '. ' : 'Dieser Browser kann alles, was das Studio braucht. ') + `${Math.max(innerWidth, document.documentElement.clientWidth)} × ${Math.max(innerHeight, document.documentElement.clientHeight)} Pixel${Math.max(innerWidth, document.documentElement.clientWidth) < 860 ? ' (Handy-Ansicht)' : ''}.`, fehlt.length ? 'browser-alt' : null, { ua: navigator.userAgent }));
  const ef = eigeneFehler(), frisch = ef.filter(x => Date.now() - new Date(x.zeit) < 86400000);
  p.push(punkt('oberflaeche', 'Fehler in der Oberfläche des Studios', frisch.length ? 'hinweis' : 'ok', frisch.length ? `${frisch.length} ${frisch.length === 1 ? 'Fehler' : 'Fehler'} in den letzten 24 Stunden in diesem Browser. Die Einträge stehen im Fehlerprotokoll unten.` : ef.length ? `Keine Fehler in den letzten 24 Stunden (${ef.length} ältere).` : 'Keine Fehler festgehalten.', frisch.length ? 'oberflaeche-fehler' : null));
  P.hier = p; zeichne();
}

// ---------------------------------------------------------------- Prüfung des Servers
async function pruefeDort() {
  const r = await hole('/studio/api/pruefung', {}, 45000);
  if (r.ok && r.json && r.json.punkte) { P.pr = r.json; P.dort = r.json.punkte; }
  else {
    P.pr = null;
    const gr = kekseGroesse(), zuGross = r.status === 494 || r.status === 431 || (r.status === 0 && gr > 15000);
    P.dort = [punkt('server-pruefung', 'Prüfung auf dem Server', 'fehler', zuGross ? 'Der Server nimmt keine Anfrage an, weil der Browser zu viel gespeicherten Stand mitschickt. «Probe zurücksetzen» unten.' : r.status ? `Der Server antwortet mit ${r.status}${r.json && r.json.fehler ? ': ' + r.json.fehler : ''}.` : `Keine Antwort (${r.fehler || 'unbekannt'}).`, zuGross ? 'kekse-zu-gross' : (r.json && r.json.lex) || (r.status >= 500 ? 'server-fehler' : 'keine-verbindung'))];
  }
  zeichne();
}

// ---------------------------------------------------------------- Zeichnen
const ZEICHEN = { ok: HAKEN, hinweis: RUF, fehler: KREUZ, laeuft: '…', unbekannt: '?' };
function punktH(x) {
  const lex = x.lex && LEX.find(l => l.id === x.lex);
  return `<div class="punkt s-${x.stand}" data-id="${h(x.id)}"><i>${ZEICHEN[x.stand] || '?'}</i><div><b>${h(x.titel)}</b><p>${h(x.text)}</p>${x.funde && x.funde.length ? `<ul>${x.funde.map(f => `<li>${h(f)}</li>`).join('')}</ul>` : ''}</div>
    <div class="punkt__r">${lex && x.stand !== 'ok' ? `<button class="link" type="button" data-lex="${h(lex.id)}">Was tun?</button>` : lex ? `<button class="link" type="button" data-lex="${h(lex.id)}">Mehr dazu</button>` : ''}</div></div>`;
}
function zeichne(fertig) {
  const alle = P.hier.concat(P.dort);
  $('#hier').innerHTML = P.hier.map(punktH).join('') || '<div class="punkt s-laeuft"><i>…</i><div><b>Wird geprüft</b></div></div>';
  $('#dort').innerHTML = P.dort.map(punktH).join('') || '<div class="punkt s-laeuft"><i>…</i><div><b>Der Server prüft sich selbst</b><p>Das dauert ein paar Sekunden, beim ersten Mal nach einer Pause länger.</p></div></div>';
  $('#n-hier').textContent = P.hier.length ? `${P.hier.filter(x => x.stand === 'ok').length} von ${P.hier.length} in Ordnung` : '';
  $('#n-dort').textContent = P.dort.length ? `${P.dort.filter(x => x.stand === 'ok').length} von ${P.dort.length} in Ordnung` : '';
  const f = alle.filter(x => x.stand === 'fehler').length, w = alle.filter(x => x.stand === 'hinweis').length;
  const a = $('#ampel');
  if (!fertig) { a.className = 'ampel s-laeuft'; a.innerHTML = `<i>…</i><div><b>Die Prüfung läuft.</b><p>${alle.length} ${alle.length === 1 ? 'Punkt' : 'Punkte'} geprüft, es kommen noch welche.</p></div>`; }
  else {
    a.className = 'ampel ' + (f ? 's-fehler' : w ? 's-hinweis' : 's-ok');
    a.innerHTML = `<i>${f ? KREUZ : w ? RUF : HAKEN}</i><div><b>${f ? `${f} ${f === 1 ? 'Ding geht' : 'Dinge gehen'} nicht.` : w ? `Läuft, ${w} ${w === 1 ? 'Punkt ist' : 'Punkte sind'} auffällig.` : 'Alles in Ordnung.'}</b>
      <p>${f ? 'Die roten Punkte unten sagen, woran es liegt. Hinter «Was tun?» steht der Weg; die Griffe unter «Reparieren» beheben das meiste mit einem Klick.' : w ? 'Nichts ist kaputt. Die gelben Punkte lohnen einen Blick, bevor sie zu einem Problem werden.' : `Alle ${alle.length} Punkte sind grün: Verbindung, Browser, Dateien, Bau und Inhalte.`}</p>
      <small>Geprüft ${new Date().toLocaleString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}${P.status && P.status.version ? ' · Fassung ' + P.status.version : ''}${P.pr && P.pr.programm ? ' · ' + P.pr.programm : ''}</small></div>
      <div class="pr__kn"><button class="kn kn--klein" type="button" id="bericht">Bericht kopieren${PF}</button></div>`;
    $('#bericht').addEventListener('click', bericht);
  }
  griffe();
  protokoll();
  $('#fassung').textContent = `Prüfung ${/^[0-9a-f]{8}$/.test(EIGENE_V) ? 'Fassung ' + EIGENE_V + ' · ' : ''}${P.pr && P.pr.laeuft_seit ? 'Studio läuft seit ' + new Date(P.pr.laeuft_seit).toLocaleString('de-CH', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + ' · ' : ''}${location.host}`;
}

// ---------------------------------------------------------------- Reparieren
let WARTE = null;
function griffe() {
  const g = [], probe = P.status && P.status.probe, pr = P.pr, verbunden = !!P.status;
  const dort = id => P.dort.find(x => x.id === id) || {};
  g.push({ id: 'laden', titel: 'Studio frisch laden', text: 'Holt Programm und Gestaltung neu vom Server, am Zwischenspeicher des Browsers vorbei. Erster Griff bei allem, was «komisch» aussieht.', knopf: 'Frisch laden', tun: () => { location.href = '/studio/?neu=' + Date.now(); } });
  if (probe || (!verbunden && kekseGroesse() > 0)) g.push({ id: 'kekse', titel: 'Probe zurücksetzen', text: 'Leert den gespeicherten Stand dieses Browsers. Danach beginnen Sie wieder mit der veröffentlichten Website. Die echte Website ist nie betroffen.', knopf: 'Zurücksetzen', heikel: true, tun: async () => {
    await hole('/studio/api/reparieren', { method: 'POST', headers: { 'X-Studio': '1', 'Content-Type': 'application/json' }, body: JSON.stringify({ was: 'kekse' }) }, 20000);
    ['bg_gast', 'bg_zn', ...Array.from({ length: 8 }, (_, i) => 'bg_z' + i)].forEach(n => { document.cookie = `${n}=; Path=/; Max-Age=0; SameSite=Lax`; });
    meld('Die Probe ist zurückgesetzt.');
    setTimeout(start, 400);
  } });
  if (verbunden && !probe) g.push({ id: 'neubau', titel: 'Entwurf neu bauen', text: 'Baut Entwurf und Vergleich aus Ihren Inhalten neu. Hilft, wenn Seiten im Entwurf fehlen oder «lässt sich nicht bauen» steht. Ihre Inhalte bleiben.', knopf: 'Neu bauen', server: 'neubau' });
  if (verbunden && probe) g.push({ id: 'neubau', titel: 'Entwurf neu bauen', text: 'Baut Entwurf und Vergleich Ihrer Kopie neu.', knopf: 'Neu bauen', server: 'neubau' });
  if (dort('inhalt').aufraeumen) g.push({ id: 'aufraeumen', titel: 'Entwurf aufräumen', text: 'Nimmt nur die Einträge heraus, die keine Stelle mehr auf der Seite haben (unten im Punkt «Inhalte passen zur Seite» aufgezählt). Alles andere bleibt.', knopf: 'Aufräumen', server: 'aufraeumen' });
  if (verbunden && (dort('entwurf').sicherung || dort('entwurf').stand === 'fehler')) g.push({ id: 'sicherung', titel: 'Letzte Sicherung des Entwurfs zurückholen', text: 'Setzt die Datei des Entwurfs auf die vorige Fassung zurück (die vom Speichern davor). Nötig, wenn sie beschädigt ist.', knopf: 'Zurückholen', heikel: true, server: 'sicherung-zurueck' });
  if (verbunden && dort('stand').stand === 'fehler') g.push({ id: 'stand-sicherung', titel: 'Letzte Sicherung des veröffentlichten Stands zurückholen', text: 'Setzt den veröffentlichten Stand auf die Fassung vor der letzten Veröffentlichung zurück und baut die Website neu. Nur, wenn die Datei beschädigt ist.', knopf: 'Zurückholen', heikel: true, server: 'stand-sicherung-zurueck' });
  if (verbunden) g.push({ id: 'leeren', titel: 'Entwurf leeren', text: 'Nimmt alle nicht veröffentlichten Änderungen zurück. Die Website bleibt, wie sie ist. Letzter Griff, wenn der Entwurf sich nicht mehr bauen lässt.', knopf: 'Entwurf leeren', heikel: true, server: 'entwurf-leeren' });
  if (pr && pr.eingerichtet && !probe && !pr.offen) g.push({ id: 'abmelden', titel: 'Alle Anmeldungen beenden', text: 'Meldet jeden ab, auch an anderen Geräten. Beim nächsten Öffnen wird das Passwort verlangt. Sinnvoll nach der Arbeit an einem fremden Rechner.', knopf: 'Alle abmelden', server: 'abmelden-alle' });
  if (verbunden && dort('bauordner').bauordner) g.push({ id: 'bauordner', titel: 'Bauordner wegräumen', text: 'Räumt die Reste eines abgebrochenen Veröffentlichens weg. Die Website ist davon nie betroffen.', knopf: 'Wegräumen', server: 'bauordner-leeren' });
  const ef = eigeneFehler();
  if (ef.length || (pr && pr.protokoll && pr.protokoll.length)) g.push({ id: 'protokoll', titel: 'Fehlerprotokoll leeren', text: 'Löscht die festgehaltenen Fehler, hier im Browser und auf dem Server. Vorher den Bericht kopieren, falls Robert ihn noch braucht.', knopf: 'Protokoll leeren', tun: async () => {
    try { localStorage.removeItem(SPEICHER); } catch (e) {}
    if (verbunden) await hole('/studio/api/reparieren', { method: 'POST', headers: { 'X-Studio': '1', 'Content-Type': 'application/json' }, body: JSON.stringify({ was: 'protokoll-leeren' }) }, 20000);
    meld('Das Fehlerprotokoll ist leer.');
    start();
  } });
  $('#griffe').innerHTML = g.map(x => `<div class="griff${x.heikel ? ' heikel' : ''}" data-g="${h(x.id)}"><b>${h(x.titel)}</b><p>${h(x.text)}</p><button class="kn kn--klein${x.heikel ? '' : ' kn--linie'}" type="button">${h(x.knopf)}${PF}</button></div>`).join('');
  $$('#griffe .griff').forEach(el => {
    const x = g.find(y => y.id === el.dataset.g), b = $('button', el);
    b.addEventListener('click', async () => {
      /* Der Schreibtisch (R23): jede Reparatur erst nach dem zweiten Klick */
      if (x.id !== 'laden' && WARTE !== x.id) { WARTE = x.id; const alt = b.innerHTML; b.innerHTML = 'Wirklich? Noch einmal klicken' + PF; setTimeout(() => { if (WARTE === x.id) { WARTE = null; b.innerHTML = alt; } }, 6000); return; }
      WARTE = null;
      b.disabled = true;
      b.firstChild.textContent = 'Läuft …';
      try {
        if (x.tun) await x.tun();
        else {
          const r = await hole('/studio/api/reparieren', { method: 'POST', headers: { 'X-Studio': '1', 'Content-Type': 'application/json' }, body: JSON.stringify({ was: x.server }) }, 90000);
          if (r.ok && r.json) { meld(r.json.text || 'Erledigt.'); if (r.json.pruefung) { P.pr = r.json.pruefung; P.dort = r.json.pruefung.punkte; } await start(); }
          else { meld((r.json && r.json.fehler) || (r.status === 401 ? 'Dafür müssen Sie im Studio angemeldet sein.' : `Das hat nicht geklappt (${r.status || r.fehler}).`), true); if (r.json && r.json.lex) oeffneLex(r.json.lex); }
        }
      } catch (e) { meld(e.message, true); }
      b.disabled = false;
      b.innerHTML = h(x.knopf) + PF;
    });
  });
}

// ---------------------------------------------------------------- Protokoll (Server + Browser)
function protokoll() {
  const server = (P.pr && P.pr.protokoll) || [], eigene = eigeneFehler();
  const alle = server.map(x => ({ zeit: x.zeit, art: 'Server · ' + x.art, text: x.text, mehr: x.mehr })).concat(eigene.map(x => ({ zeit: x.zeit, art: 'Browser · ' + x.art, text: x.text + (x.ort ? ' (' + x.ort + ')' : '') }))).sort((a, b) => String(b.zeit).localeCompare(String(a.zeit))).slice(0, 40);
  $('#n-proto').textContent = alle.length ? `${alle.length} ${alle.length === 1 ? 'Eintrag' : 'Einträge'}` : '';
  $('#proto').innerHTML = alle.length ? alle.map(x => `<li><span>${h(new Date(x.zeit).toLocaleString('de-CH', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }))}</span><span>${h(x.art)}</span><span>${h(x.text)}</span>${x.mehr ? `<details><summary>Einzelheiten für Robert</summary><pre>${h(x.mehr)}</pre></details>` : ''}</li>`).join('')
    : '<li class="leer">Keine Fehler festgehalten. Wenn etwas schiefgeht, steht es hier mit Uhrzeit und Ursache.</li>';
}

// ---------------------------------------------------------------- Lexikon
function lexikon(filter) {
  const f = (filter || '').trim().toLowerCase();
  const treffer = l => !f || [l.titel, l.sehen, l.grund, l.tun, l.worte, l.id].join(' ').toLowerCase().includes(f);
  const liste = LEX.filter(treffer);
  $('#n-lex').textContent = f ? `${liste.length} von ${LEX.length} Einträgen` : `${LEX.length} bekannte Fehlerquellen`;
  $('#lex').innerHTML = liste.map(l => `<details id="lex-${h(l.id)}"${f ? ' open' : ''}><summary>${h(l.titel)}<small>${h(l.id)}</small></summary>
    <div class="lex__t"><div><b>Was Sie sehen</b>${h(l.sehen)}</div><div><b>Woran es liegt</b>${h(l.grund)}</div><div><b>Was Sie tun</b>${h(l.tun)}</div></div></details>`).join('') || '<p class="hinweis">Nichts gefunden. Versuchen Sie ein anderes Wort, zum Beispiel «speichern», «Bild» oder «Passwort».</p>';
}
function oeffneLex(id) {
  $('#such').value = '';
  lexikon('');
  const d = $('#lex-' + id);
  if (!d) { meld('Zu diesem Punkt gibt es noch keinen Eintrag im Lexikon (' + id + ').', true); return; }
  $$('#lex details').forEach(x => { x.open = x === d; x.classList.toggle('treffer', x === d); });
  d.scrollIntoView({ block: 'start', behavior: 'smooth' });
  history.replaceState(null, '', '#lex-' + id);
}

// ---------------------------------------------------------------- Bericht
async function bericht() {
  const z = x => `${x.stand === 'ok' ? 'OK     ' : x.stand === 'hinweis' ? 'HINWEIS' : 'FEHLER '} ${x.titel}: ${x.text}${x.funde ? '\n' + x.funde.map(f => '         - ' + f).join('\n') : ''}`;
  const t = [`Prüfung Studio Berghotel Gasterntal · ${new Date().toLocaleString('de-CH')} · ${location.href}`,
    `Fassung Server ${P.status && P.status.version || '?'} · Prüfung ${EIGENE_V || '?'} · ${P.pr && P.pr.programm || ''}${P.status && P.status.probe ? ' · Probe-Fassung' : ''}`,
    `Browser: ${navigator.userAgent} · ${innerWidth}×${innerHeight} · Cookies ${navigator.cookieEnabled ? 'an' : 'aus'} · ${kekseGroesse()} B Studio-Cookies · Antwortzeit status ${P.dauer.status || '?'} ms, stand ${P.dauer.stand || '?'} ms`,
    '', '— Verbindung und Browser —', ...P.hier.map(z), '', '— Studio —', ...P.dort.map(z), '',
    '— Fehlerprotokoll —', ...((P.pr && P.pr.protokoll) || []).slice(0, 20).map(x => `${x.zeit} Server ${x.art}: ${x.text}${x.mehr ? '\n' + x.mehr : ''}`), ...eigeneFehler().slice(0, 20).map(x => `${x.zeit} Browser ${x.art}: ${x.text} ${x.ort || ''}`)].join('\n');
  try { await navigator.clipboard.writeText(t); meld('Der Bericht ist kopiert. Fügen Sie ihn in eine Nachricht an Robert ein.'); }
  catch (e) { const ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); meld('Der Bericht ist kopiert.'); } catch (e2) { meld('Kopieren ging nicht. Markieren Sie die Punkte oben und kopieren Sie sie von Hand.', true); } ta.remove(); }
}

// ---------------------------------------------------------------- Start
async function start() {
  P.hier = []; P.dort = []; P.status = null; P.pr = null;
  zeichne(false);
  await Promise.all([pruefeHier(), pruefeDort()]);
  zeichne(true);
}
document.addEventListener('click', ev => { const b = ev.target.closest('[data-lex]'); if (b) oeffneLex(b.dataset.lex); });
$('#nochmal').addEventListener('click', start);
$('#such').addEventListener('input', ev => lexikon(ev.target.value));
addEventListener('error', ev => { try { const l = eigeneFehler(); l.unshift({ zeit: new Date().toISOString(), art: 'pruefung', text: String(ev.message || '').slice(0, 300), ort: 'pruefung.html' }); localStorage.setItem(SPEICHER, JSON.stringify(l.slice(0, 30))); } catch (e) {} });
lexikon('');
start().then(() => { const m = /^#(?:lex-)?(m-[\w-]+)$|^#lex-([\w-]+)/.exec(location.hash); if (m) oeffneLex(m[1] || m[2]); });   // #m-<stichwort> aus dem Schreibtisch, #lex-<id> aus der Prüfung
})();
