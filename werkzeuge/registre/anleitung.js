/* Anleitung Das Besucherbuch · Berghotel Gasterntal: Bild gross mit Klick, Esc schliesst; das Zeichen des Hauses (die Raute der Laube, wie .laube der Website)
   (eigene Datei: online laufen eingebettete Skripte ohne Prüfsumme nicht). */
(function () {
  var g = document.getElementById('gross'), im = g.querySelector('img');
  function zu() { g.hidden = true; }
  document.addEventListener('click', function (e) { var b = e.target.closest('.bild'); if (b) { im.src = b.querySelector('img').src; im.alt = b.querySelector('img').alt; g.hidden = false; } else if (e.target.closest('#gross')) zu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zu(); });
  document.getElementById('zeichen').innerHTML = '<path d="M22 14 30 46 22 78 14 46z"/><circle cx="22" cy="6" r="3"/><circle cx="22" cy="86" r="3"/>';
})();
