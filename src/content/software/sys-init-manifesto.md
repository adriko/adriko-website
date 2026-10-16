---
title: "SYS_INIT // Geneza adriko.net: od Deus Ex i Terminatora po cyfrowy bunkier"
date: "2026-10-16"
tags: ["manifesto", "cyberpunk", "retro", "deus-ex", "astro", "terminal"]
description: "Inauguracyjny wpis na adriko.net. Czym jest ten projekt, skąd wzięła się fascynacja retrotechnologią i cyberpunkiem oraz jak zbudowany jest tutejszy interfejs."
---

Współczesny internet bywa męczący. Zdominowany przez algorytmiczne tablice, powtarzalne layouty i bezduszny, masowy clickbait, stracił gdzieś ten surowy, fascynujący charakter, którym zarażał na przełomie tysiącleci. 

**adriko.net** to moja odpowiedź na ten przesyt — prywatny cyfrowy bunkier, niezależne archiwum i przestrzeń zbudowana z czystej pasji do technologii, fantastyki naukowej i mechanicznej precyzji.

---

### Korzenie: kineskopy, CRT i mroczna przyszłość

Moje zamiłowanie do science fiction nie zaczęło się wczoraj. Kształtowało się na przełomie lat 80. i 90. przed ekranem telewizora, gdzie na kasetach VHS królowały produkcje bezkompromisowe: duszny horror i biomechanika w *Alienie*, chłodny, stalowy szkielet T-800 w *Terminatorze 2* oraz kultowa wizja podróży w czasie w *Powrocie do Przyszłości*. Te filmy miały w sobie coś namacalnego — technologię, która miała swoją fizyczną wagę, wydawała dźwięki przekaźników i nie ukrywała przed widzem kabli ani śrub.

Gdy w domu pojawił się pierwszy pecet, kinematografia natychmiast połączyła się z grami. Moje wczesne cyfrowe wspomnienia to przede wszystkim dwie rewolucje:

* **Deus Ex (2000)** — tytuł, który zdefiniował moje postrzeganie cyberpunku. Mroczny, deszczowy Nowy Jork, nanotechnologiczne augmentacje, spiski korporacyjne, muzyka skomponowana na trackerach i absolutna swoboda w podejściu do celu. To nie była tylko gra; to był kompletny, wiarygodny świat z pogranicza transhumanizmu.
* **Half-Life (1998)** — pamiętny wjazd wagonikiem do podziemnego kompleksu Black Mesa. Surowy, laboratoryjny realizm, w którym technologia wymyka się spod kontroli, a gracz musi polegać na sprycie i fizyce otoczenia.

Ta estetyka — połączenie uniksowej surowości, neonowego minimalizmu i cyberpunkowej wizji przyszłości — została ze mną na stałe.

---

### Manifest: Czym jest to miejsce?

Nie planuję tworzyć kolejnego portalu informacyjnego, który goni za newsami z dwuminutowym wyprzedzeniem. adriko.net to subiektywna baza wiedzy i autorski dziennik operacyjny. Znajdziesz tu:

1. **Analizy i wrażenia popkulturowe** — szczerą opinię o obejrzanym filmie sci-fi, ukończonej grze czy książce, która została w pamięci na dłużej.
2. **Sprzęt i gadżety** — testy urządzeń codziennego użytku, smartwatchy, nowinek ze świata mobile i desktopowych maszyn. Bez marketingowego żargonu, z perspektywy praktycznego użytkownika.
3. **Software i OS** — ciekawostki ze świata systemów uniksowych, narzędzi terminalowych, programowania, automatyzacji i środowisk pracy.
4. **Mechanika i motoryzacja** — inżynieryjne majstersztyki na dwóch i czterech kołach, od bezkompromisowych nakedów pokroju Triumpha Street Triple po ciekawe premiery rynkowe.

---

### Architektura pod maską: TTY, AMI BIOS i Astro

Sama strona również musiała odzwierciedlać ten klimat. Zamiast gotowych, ociężałych szablonów platform blogowych, platforma została postawiona na frameworku **Astro**, stawiając na lekkość, natywny HTML i format Markdown dla każdego artykułu.

Interfejs czerpie garściami z retro-komputerów i estetyki wojskowych terminali HUD:

* **BIOS Boot Overlay** — ekran startowy stylizowany na klasyczny AMI BIOS v4.02 z lat 90. Wylicza pamięć, skanuje strukturę katalogów (`./database`, `./hardware`, `./software`, `./gear`), a na desktopie i telefonie pozwala na zatrzymanie sekwencji spacją lub tapnięciem w ekran.
* **Telemetria taktyczna w stopce** — algorytm solarny NOAA oraz obliczenia fazy księżyca w czasie rzeczywistym dla precyzyjnych koordynatów geograficznych (Jarosław, PL).
* **Interaktywny panel wyszukiwania (Grep/CLI)** — filtr działający natychmiastowo z poziomu terminalowej linii poleceń.
* **Przełącznik widoków** — możliwość przeglądania archiwum w formie nowoczesnych kart (`[VIEW: CARDS]`) lub klasycznego, uniksowego drzewa plików (`[VIEW: TREE]`).

Zapraszam do eksploracji rejestru. System działa nominalnie.
