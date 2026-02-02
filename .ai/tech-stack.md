# Tech Stack - Board Games Collection (Grota)

## 2. Frontend

- Framework: Astro (statyczny generator stron, szybkie czasy ladowania).
- UI: HTML/CSS/JS generowane statycznie, bez backendu.
- Responsywnosc: ukierunkowanie na mobile-first.

## 3. Dane i integracje

- Zrodlo danych: publiczny CSV z Google Sheets.
- Pobieranie danych: na etapie builda.
- Obrazki: zewnetrzne API (np. BoardGameGeek).
- Cache obrazkow: realizowany w pipeline GitHub Actions.

## 4. Build, CI/CD i hosting

- CI/CD: GitHub Actions.
- Harmonogram: CRON raz dziennie + manualny `workflow_dispatch`.
- Hosting: GitHub Pages (brak kosztow utrzymania).
- Strategia bledow: przy bledzie pobierania CSV build upada, a produkcja zostaje na ostatniej poprawnej wersji.

## 5. Warstwa danych po stronie klienta

- Format danych: statyczny JSON wygenerowany podczas builda.
- Filtrowanie i sortowanie: w pelni po stronie klienta.
- Pamiec ustawien: `localStorage` (widok i motyw).

## 6. UX i wydajnosc

- Sticky Header z wyszukiwarka i filtrami.
- Tryb jasny/ciemny.
- Docelowy wynik Lighthouse: >90 (Performance, Accessibility, Best Practices).
- Limit rozmiaru strony: <1MB (bez cache).
