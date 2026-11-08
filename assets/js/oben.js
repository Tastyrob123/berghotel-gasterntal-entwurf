/* Jede Seite ohne #-Stelle öffnet oben, auch nach Neuladen, Wiederöffnen und Zurück (Robert 18.10.2026 18:30: «… dass … die Links oben die Seite zeigen») */
try { if (!location.hash && 'scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
