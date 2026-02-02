# Dokument wymagań produktu (PRD) - Board Games Collection (Grota)

## 1. Przegląd produktu

Aplikacja Board Games Collection to proste, wydajne narzędzie webowe typu "read-only", służące do przeglądania inwentarza gier planszowych dostępnych w lokalnym miejscu spotkań "Grota". Aplikacja zastępuje nieczytelny plik Excel nowoczesnym interfejsem graficznym zoptymalizowanym pod urządzenia mobilne.

Projekt opiera się na generatorze stron statycznych (Astro) i wykorzystuje GitHub Actions do automatycznego odświeżania danych pobieranych z publicznego arkusza Google Sheets. Kluczowym aspektem jest wydajność ("lekkość"), brak kosztów utrzymania (GitHub Pages) oraz wysoka użyteczność mobilna (Sticky Header, filtry).

## 2. Problem użytkownika

Obecnie lista gier dostępnych w Grocie jest utrzymywana w pliku Excel. Użytkownicy (gracze) napotykają następujące problemy:

- Brak czytelności na urządzeniach mobilnych (konieczność przesuwania arkusza w poziomie/pionie).
- Brak wizualizacji (brak okładek gier), co utrudnia rozpoznanie tytułów.
- Trudności w szybkim filtrowaniu gier pod kątem liczby graczy lub poziomu trudności.
- Brak szybkiej informacji o specyfice gry (czas gry, waga) bez wchodzenia w szczegóły wiersza w Excelu.

Rozwiązanie ma na celu umożliwienie bywalcowi Groty wyciągnięcia telefonu i w ciągu kilku sekund znalezienia gry pasującej do jego grupy, np. "Szukam średnio-trudnej gry dla 4 osób".

## 3. Wymagania funkcjonalne

### 3.1. Pobieranie i Przetwarzanie Danych

- System pobiera dane z publicznego pliku CSV (Google Sheets) podczas procesu budowania strony (build time).
- System mapuje dane liczbowe (np. waga gry) na zrozumiałe kategorie trudności (Łatwy, Średni, Trudny) oraz przypisuje im odpowiednie ikony i kolory.
- System pobiera okładki gier z zewnętrznego API (np. BoardGameGeek) i cachuje je w infrastrukturze GitHub Actions, aby zminimalizować ruch sieciowy i przyspieszyć ładowanie.

### 3.2. Prezentacja Danych (Widoki)

- Widok Kafelkowy (Grid): Prezentuje okładkę gry, tytuł oraz ikony parametrów (gracze, czas, trudność).
- Widok Listy (List): Widok kompaktowy bez okładek, skupiony na nazwie i ikonach parametrów, pozwalający wyświetlić więcej pozycji na jednym ekranie.
- Obsługa błędów graficznych (Fallback): W przypadku braku okładki, system generuje tło o deterministycznym kolorze (na podstawie nazwy) z generyczną ikoną.

### 3.3. Wyszukiwanie, Filtrowanie i Sortowanie

- Wyszukiwarka tekstowa (Live Search) przeszukująca bazę po nazwie gry.
- Filtr liczby graczy działający na zasadzie "zawiera się" (inclusive range).
- Sortowanie po: Nazwie (A-Z), Trudności (rosnąco/malejąco), Liczbie graczy (według wartości minimalnej).

### 3.4. Interfejs i UX

- Sticky Header: Pasek wyszukiwania i ikona filtrów zawsze widoczne przy przewijaniu.
- Motywy: Przełącznik trybu jasnego i ciemnego (Light/Dark mode).
- Pamięć ustawień: Zapisywanie preferencji widoku i motywu w localStorage.

## 4. Granice produktu

### Wchodzi w zakres (In-Scope)

- Aplikacja webowa (RWD) hostowana na GitHub Pages.
- Automatyczna aktualizacja danych raz na dobę (CRON).
- Wizualizacja poziomu trudności za pomocą dedykowanych ikon (Tarcza, Miecz, Topór).
- Optymalizacja pod kątem Google Lighthouse (>90 pkt).

### Nie wchodzi w zakres (Out-of-Scope)

- System logowania i konta użytkowników.
- Możliwość edycji danych lub dodawania gier przez stronę www (edycja tylko w Excelu).
- Dynamiczne filtrowanie po stronie serwera (wszystko dzieje się po stronie klienta na statycznym JSONie).
- Integracja z kalendarzem lub systemem rezerwacji (Discord button jest wykluczony).
- Widoki szczegółowe gier (modal/podstrona) – wszystkie informacje są na kafelku.

## 5. Historyjki użytkowników

### Sekcja A: Przeglądanie i Widoczność

ID: US-001
Tytuł: Wyświetlanie listy gier
Opis: Jako użytkownik, chcę zobaczyć listę wszystkich dostępnych gier zaraz po wejściu na stronę, aby móc przejrzeć ofertę Groty.
Kryteria akceptacji:

1. Po załadowaniu strony użytkownik widzi listę gier pobraną z pliku Excel.
2. Domyślny widok jest posortowany alfabetycznie.
3. Każdy element (kafelek) zawiera: Nazwę, Liczbę graczy, Czas gry, Ikonę trudności.
4. Interfejs ładuje się poniżej 2 sekund na łączu 4G.

ID: US-002
Tytuł: Przełączanie widoku (Grid/List)
Opis: Jako użytkownik, chcę mieć możliwość zmiany widoku z kafelków na listę kompaktową, aby szybciej skanować tytuły bez przewijania obrazków.
Kryteria akceptacji:

1. W nagłówku znajduje się przełącznik widoku.
2. Po wybraniu "Listy", okładki znikają, a elementy stają się niższe (wiersze).
3. Po wybraniu "Grid", wracają kafelki z okładkami.
4. Wybrany widok jest zapamiętywany po odświeżeniu strony (localStorage).

ID: US-003
Tytuł: Obsługa braku okładki (Fallback)
Opis: Jako użytkownik, chcę widzieć estetyczny zamiennik w przypadku braku okładki gry, aby interfejs pozostawał spójny.
Kryteria akceptacji:

1. Jeśli API nie zwróci zdjęcia lub wystąpi błąd ładowania, system wyświetla kolorowy prostokąt.
2. Kolor prostokąta jest generowany na podstawie nazwy gry (zawsze taki sam dla tej samej nazwy).
3. Na tle znajduje się generyczna ikona (np. pionek/kostka).

### Sekcja B: Wyszukiwanie i Filtrowanie

ID: US-004
Tytuł: Wyszukiwanie gry po nazwie
Opis: Jako użytkownik, chcę wpisać fragment nazwy gry w wyszukiwarkę, aby szybko znaleźć konkretny tytuł.
Kryteria akceptacji:

1. Pasek wyszukiwania jest widoczny w Sticky Headerze.
2. Lista gier filtruje się w czasie rzeczywistym podczas wpisywania znaków.
3. Wyszukiwanie ignoruje wielkość liter (case-insensitive).
4. Jeśli nie znaleziono żadnej gry, wyświetla się komunikat "Empty State" (np. "Nie znaleziono gier").

ID: US-005
Tytuł: Filtrowanie po liczbie graczy
Opis: Jako organizator spotkania dla 5 osób, chcę przefiltrować gry, które pomieszczą moją grupę, aby nie przeglądać gier tylko dla 2 lub 4 osób.
Kryteria akceptacji:

1. Użytkownik może wybrać liczbę graczy z listy rozwijanej lub przycisków (np. ikona ludzika + liczba).
2. Logika filtrowania jest "inclusive": Wybranie "5 graczy" pokazuje gry o zakresie np. "2-5", "1-8", "5-5".
3. Wybranie "5 graczy" UKRYWA gry o zakresie "2-4".

ID: US-006
Tytuł: Sortowanie gier
Opis: Jako nowy gracz, chcę posortować gry od najłatwiejszych, aby znaleźć coś na start.
Kryteria akceptacji:

1. Dostępna jest opcja sortowania według: Nazwy (A-Z, Z-A), Trudności (Łatwe -> Trudne, Trudne -> Łatwe), Liczby graczy (min. l. graczy rosnąco/malejąco).
2. Sortowanie zmienia kolejność wyświetlania elementów natychmiastowo.

ID: US-007
Tytuł: Resetowanie filtrów
Opis: Jako użytkownik, chcę jednym kliknięciem wyczyścić wyszukiwanie i filtry, aby wrócić do pełnej listy gier.
Kryteria akceptacji:

1. W przypadku, gdy aktywne są filtry lub wpisany tekst, dostępny jest przycisk "Wyczyść" (np. ikona X w wyszukiwarce lub przycisk w Empty State).
2. Kliknięcie przywraca pełną listę gier i domyślne sortowanie.

### Sekcja C: Personalizacja i System

ID: US-008
Tytuł: Tryb Ciemny/Jasny
Opis: Jako użytkownik korzystający z telefonu wieczorem w Grocie, chcę przełączyć aplikację w tryb ciemny, aby ekran mnie nie oślepiał.
Kryteria akceptacji:

1. Dostępny przełącznik motywu (ikona Słońca/Księżyca).
2. Tryb Ciemny zmienia tło na ciemnoszare/czarne, a tekst na jasny.
3. Wybrany motyw jest zapamiętywany w przeglądarce (localStorage).

ID: US-009
Tytuł: Automatyczna aktualizacja danych (System Story)
Opis: Jako administrator, chcę, aby strona sama pobierała nowe dane z Excela, abym nie musiał ręcznie jej przebudowywać.
Kryteria akceptacji:

1. Skonfigurowany Workflow w GitHub Actions.
2. Workflow uruchamia się codziennie o określonej godzinie (CRON) oraz na żądanie (workflow_dispatch).
3. W przypadku błędu pobierania CSV, build kończy się błędem, a strona na produkcji pozostaje w starej, działającej wersji (nie wyświetla pustej strony).

## 6. Metryki sukcesu

Poniższe wskaźniki posłużą do oceny, czy produkt spełnia założenia MVP:

1. Stabilność Buildów: 100% udanych automatycznych deployów, w których źródło danych (Excel) było dostępne i poprawne.
2. Wydajność (Core Web Vitals): Wynik w Google Lighthouse > 90 dla Performance, Accessibility oraz Best Practices.
3. Rozmiar strony: Całkowita waga przesyłanych danych przy pierwszym wejściu (bez cache) poniżej 1MB (dzięki optymalizacji obrazków i minimalizacji JS).
4. Responsywność: Brak błędów layoutu (overflow, ucięte teksty) na ekranach o szerokości 320px (iPhone SE/stare Androidy).
