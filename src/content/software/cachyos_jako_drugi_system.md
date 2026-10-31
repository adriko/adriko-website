---
title: "CachyOS jako drugi system: oddzielam pracę od gier (instalacja i dev-stack)"
description: "Praktyczny przewodnik instalacji CachyOS (Arch Linux) na osobnym dysku M.2 obok Windows 11. Dlaczego wybrałem CachyOS zamiast Ubuntu czy Fedory, przygotowanie pendrive'a w Rufusie, bezpieczny dual-boot i konfiguracja minimalistycznego środowiska deweloperskiego."
date: "2026-10-31"
tags:
  [
    "linux",
    "cachyos",
    "arch",
    "development",
    "wayland",
    "workstation",
    "dual-boot",
  ]
---

Miałem prosty cel: definitywnie oddzielić środowisko do codziennej pracy i programowania od platformy do gier.

Mój Windows 11 na dysku Kingston 1 TB zostaje maszyną czysto gamingową — dla mnie po godzinach oraz dla chrześniaków, którzy wpadają z wizytą i mają fazę na Robloxa. Z kolei do tworzenia stron, pisania skryptów w Pythonie i projektów w Javie potrzebowałem czegoś zupełnie innego: systemu szybkiego, stabilnego, który nie marnuje zasobów komputera i nie robi niczego za moimi plecami.

Przy okazji chciałem wreszcie naprawdę poznać Linuksa. Zamiast ciągłego wyklikiwania wszystkiego myszką w okienkach, wolałem wejść do terminala, oswoić się z klawiaturą i zrozumieć, jak ten system naprawdę działa pod maską.

Wybór padł na **CachyOS**. Poniżej zebrałem całą procedurę: od przygotowania nośnika instalacyjnego, przez konfigurację BIOS-u i dual-boota, aż po wdrożenie czystego stosu programistycznego.

---

## 1. Sprzęt i dlaczego dwa fizyczne dyski?

Dzielenie jednego dysku NVMe na partycje dla Windowsa i Linuksa zawsze niesie ryzyko: **duże aktualizacje Windows potrafią nadpisać partycję EFI** lub uszkodzić strukturę bootloadera.

Zastosowałem najbezpieczniejszą metodę: **pełna fizyczna separacja na poziomie nośników**.

- **Dysk 1 (Kingston NVMe 1 TB):** Windows 11, gry, platforma rozrywkowa.
- **Dysk 2 (WD NVMe 512 GB):** CachyOS, projekty, repozytoria, narzędzia dev.

Trafił mi się na OLX używany dysk M.2 NVMe Western Digital o pojemności 512 GB w świetnej cenie. Wyciągnąłem z szafy kupiony już ładnych kilka lat temu zapasowy radiator M.2 od _be quiet!_ i wpiąłem całość w wolny slot płyty głównej.

### Platforma sprzętowa:

- **Procesor:** Intel Core i5-10600K @ 4.1 GHz (Comet Lake)
- **Płyta główna:** MSI Z490-A PRO
- **Pamięć RAM:** HyperX Fury 32 GB (4x8 GB) DDR4 3200 MHz CL16
- **Karta graficzna:** ASUS TUF Gaming GeForce RTX 3070 OC (8 GB VRAM)
- **Monitor:** LG 27” 1440p 144 Hz (DisplayPort)

Drugi slot M.2 na płycie działa w standardzie PCIe 3.0 (poprzez chipset Z490), co w praktyce daje transfery rzędu 3000 MB/s — do kompilacji kodu, pracy z bazami danych i serwera deweloperskiego Astro jest to zapas prędkości aż nadto.

---

## 2. Dlaczego akurat CachyOS? (Konfrontacja z Ubuntu, Fedorą i czystym Archem)

Zanim podjąłem decyzję, przeanalizowałem popularne alternatywy:

### Ubuntu

Dla wielu to domyślny wybór na start, ale dla mnie odpada w przedbiegach. Jest ociężałe, zaśmiecone preinstalowanymi narzędziami i forsowanym na siłę ekosystemem Snap (pakiety zamykane w powolnych kontenerach, gdzie nawet przeglądarka potrafi startować kilka sekund). Do tego dochodzi przestarzały zestaw bibliotek w wydaniach LTS i telemetria Canonicala.

### Fedora

Bardzo nowoczesna i stabilna dystrybucja, ale menedżer pakietów DNF jest zauważalnie wolniejszy od linuksowego wzorca, jakim jest `pacman`. Dodatkowo restrykcyjna polityka licencyjna Fedory zmusza do manualnego doinstalowywania repozytoriów RPM Fusion, by uzyskać kodeki czy zamknięte sterowniki Nvidia.

### Czysty Arch Linux

Arch to genialna szkoła Linuksa — system typu _rolling release_, menedżer `pacman` i potężna baza repozytorium AUR. Jednak manualna instalacja od zera (`pacstrap`, ręczna konfiguracja fstab, zram, demonów i modułów dkms pod kartę Nvidia) to czasochłonny proces. Szukałem dystrybucji, która daje całą surowość i zalety Archa, ale robi techniczny fundament od razu zgodnie ze sztuką.

### Dlaczego CachyOS wygrywa:

1. **Radykalna optymalizacja wydajności:** Pakiety i jądro w CachyOS są kompilowane ze specjalnymi flagami pod nowoczesne zestawy instrukcji procesorów (`x86-64-v3` oraz `x86-64-v4`). Mój procesor Intel Core i5-10600K obsługuje maksymalnie standard **x86-64-v3** (AVX, AVX2, FMA3, BMI1, BMI2 — instrukcje `v4` wymagają AVX-512, których 10. generacja desktopowa fizycznie nie posiada). Instalator CachyOS automatycznie wykrywa te możliwości sprzętowe i podpina zoptymalizowane repozytoria `v3`, co zapewnia natychmiastową responsywność systemu.
2. **Minimalizm i selekcja:** Instalator pozwala wybrać czyste środowisko KDE Plasma bez pakietów biurowych, gier czy zbędnych aplikacji w tle. Dostajesz czystą bazę, na której instalujesz tylko to, czego sam potrzebujesz.
3. **Out-of-the-box pod karty Nvidia i Wayland:** Bezproblemowa obsługa najnowszych sterowników własnościowych Nvidia na sesji Wayland z obsługą 144 Hz i adaptacyjnego odświeżania (VRR).
4. **Btrfs + Snapper w standardzie:** Bezobsługowa konfiguracja migawek systemu plików zintegrowana bezpośrednio z menu startowym bootloadera.

---

## 3. Przygotowanie gruntu pod Windows 11 i BIOS (MSI)

Zanim włożysz pendrive do portu USB, musisz zneutralizować mechanizmy blokujące Linuksa.

### Krok 3.1: Wyłączenie Fast Startup i hibernacji w Windowsie

Szybkie uruchamianie wprowadza jądro Windowsa w stan hibernacji, blokując partycje NTFS (tzw. _hibernation flag_), co uniemożliwia ich bezpieczne współdzielenie i może prowadzić do błędów systemu plików.

Otwórz w Windowsie **PowerShell** lub **Wiersz polecenia (CMD)** jako Administrator i wykonaj:

```cmd
:: Wyłączenie pliku hibernacji i mechanizmu Fast Startup
powercfg /h off
```

### Krok 3.2: Wyłączenie Secure Boot w BIOS-ie płyty MSI

CachyOS korzysta ze specjalnie zoptymalizowanych jąder kompilowanych pod instrukcje x86-64-v3 oraz modułów sterownika własnościowego Nvidia, które wymagają wyłączenia weryfikacji podpisów Secure Boot.

1. Zrestartuj komputer i wciskaj klawisz **Delete**, aby wejść do UEFI/BIOS płyty MSI.
2. Przełącz widok na tryb zaawansowany klawiszem **F7** (_Advanced Mode_).
3. Przejdź do: `Settings` → `Security` → `Secure Boot`.
4. Zmień wartość `Secure Boot` na **Disabled**.
5. Wciśnij **F10**, zapisz ustawienia i wyłącz komputer.

---

## 4. Pobranie ISO i przygotowanie pendrive'a w programie Rufus

1. Ze strony [cachyos.org/download](https://cachyos.org/download/) pobieramy obraz ISO. Warto wiedzieć, że CachyOS nie wydaje już osobnych obrazów pod konkretne środowiska graficzne — pobieramy jeden zunifikowany obraz: **CachyOS Desktop Edition** (drugi dostępny obraz, _Handheld Edition_, dedykowany jest konsolom przenośnym pokroju Steam Decka czy ROG Ally). Wybór środowiska KDE Plasma następuje dopiero w instalatorze.
2. Pobieramy narzędzie **Rufus** na Windowsie.
3. Wkładamy pendrive (min. 8 GB) i ustawiamy parametry:
   - **Urządzenie:** Twój pendrive.
   - **Wybór bootowania:** Wskaż pobrany plik `.iso` CachyOS.
   - **Schemat partycjonowania:** **`GPT`** (krytyczne dla nowoczesnych płyt z UEFI).
   - **Docelowy system:** **`UEFI (bez CSM)`**.
   - Po kliknięciu **Start**, jeśli Rufus wyświetli komunikat o trybie zapisu hybrydowego, wybierz **Zapisz w trybie obrazu DD** (_DD Image mode_). Zapewnia to bezbłędny rozruch dystrybucji opartych na Archu.
4. Wpinamy przygotowany pendrive w tylny port USB na płycie głównej komputera.

---

## 5. Wybory w instalatorze (Minimalizm, Btrfs i Limine)

1. Włączamy komputer i od razu wciskamy klawisz **F11** (_Boot Menu_ płyty MSI).
2. Wybieramy pozycję z nośnikiem USB poprzedzoną przedrostkiem **UEFI: [Nazwa Pendrive'a]**.
3. W menu rozruchowym wybieramy domyślną pozycję **CachyOS default**.
4. Po załadowaniu środowiska live w oknie powitalnym _CachyOS Hello_ klikamy przycisk **Launch Installer**.

### Parametry instalacji krok po kroku:

- **Język i lokalizacja (Welcome & Location):**
  - W oknie początkowym jako język systemu wybieramy **American English** (ułatwia to diagnozowanie ewentualnych błędów w terminalu).
  - W sekcji _Location_ ustawiamy strefę czasową: Region: **Europe**, Zone: **Warsaw**.
- **Układ klawiatury (Keyboard):**
  - Wybieramy układ **Polish (default)**.
- **Menedżer rozruchu (Bootloader):**
  - Wybieramy **Limine**. To niezwykle szybki, nowoczesny i minimalistyczny bootloader, który bezproblemowo obsługuje konfiguracje wielodyskowe oraz bezpośredni rozruch kernela.
- **Partycjonowanie dysku (Partitions):**
  - Wybieramy opcję **Erase disk** (_Wyczyść dysk_).
  - **KRYTYCZNE:** Bezwzględnie upewnij się w rozwijanej liście nośników u góry, że wybrałeś właściwy dysk **WD 512 GB**, a nie Kingston 1 TB z Windowsem!
  - **System plików:** Zaznaczamy **Btrfs**. Zapewnia domyślną kompresję `zstd` w locie oraz automatyczny układ podwoluminów przygotowany pod narzędzie Snapper.
  - **Pamięć wymiany (Swap):** Wybieramy **No Swap**. Skompresowaną pamięć wymiany w RAM (`zram`) CachyOS konfiguruje domyślnie na poziomie bazowym przez `systemd-zram-generator`. Przy 32 GB RAM fizyczna partycja wymiany na dysku NVMe jest zbędna i generuje jedynie niepotrzebne cykle zapisu komórek pamięci.
- **Środowisko graficzne (Desktop):**
  - Zaznaczamy **KDE Plasma**.
- **Selekcja pakietów (Packages):**
  - Kierujemy się zasadą czystej bazy — odznaczamy zbędne pakiety biurowe czy odtwarzacze multimedialne. Zostawiamy jedynie pakiety podstawowe i ewentualne wsparcie druku (_Printing Support_), jeśli z niego korzystasz.
- **Konfiguracja konta (Users):**
  - _Your name:_ Wpisujemy imię i nazwisko użytkownika.
  - _Username:_ Podajemy nazwę użytkownika dla powłoki i katalogu domowego.
  - _Password:_ Wprowadzamy oraz potwierdzamy silne hasło systemowe do logowania i poleceń administracyjnych `sudo`.
- **Finalizacja (Summary & Install):**
  - Weryfikujemy w oknie _Summary_ dysk docelowy oraz układ partycji.
  - Klikamy **Install** -> **Install Now**.
  - Po ukończeniu procesu instalacji zaznaczamy opcję **Restart now**, klikamy **Done** i wyjmujemy nośnik instalacyjny USB.

> **Ważne po instalacji:** Wejdź raz jeszcze do BIOS-u (`Delete`) i w sekcji `Settings → Boot → UEFI Hard Disk Drive BBS Priorities` upewnij się, że **Limine** lub dysk WD 512 GB znajduje się na pozycji **Boot Option #1**. Dzięki temu komputer zawsze wystartuje do menu wyboru systemu.

---

## 6. Pierwsze kroki w systemie: Snapper i powłoka Bash

### 6.1. Utworzenie migawki początkowej (Snapper)

Zanim zmienimy jakikolwiek plik konfiguracyjny, tworzymy czysty punkt przywracania:

```bash
# Sprawdzenie gotowości narzędzia Snapper
sudo snapper list

# Zapisanie pierwszej migawki bazowej
sudo snapper create -d "Czysty system bazowy po instalacji"
```

### 6.2. Przełączenie domyślnej powłoki na Bash

CachyOS domyślnie uruchamia powłokę Fish. Choć wygląda nowocześnie, nie zachowuje pełnej zgodności ze standardem POSIX, co uniemożliwia bezpośrednie wklejanie standardowych skryptów powłoki.

Najpierw ustawiamy Bash jako domyślną powłokę dla konta w pliku `/etc/passwd`:

```bash
# Przełączenie bieżącego okna na bash
bash

# Ustawienie Bash jako systemowej powłoki użytkownika
chsh -s /usr/bin/bash
```

**Pułapka w KDE Konsole:** Samo polecenie `chsh` nie wystarczy. W CachyOS domyślny profil emulatora terminala Konsole ma w swojej konfiguracji na sztywno wpisaną komendę `/usr/bin/fish`. Należy to skorygować w interfejsie graficznym:

1. W oknie terminala Konsole kliknij w menu górnym: **Ustawienia** (_Settings_) → **Zarządzaj profilami...** (_Manage Profiles..._).
2. Zaznacz bieżący/domyślny profil i kliknij **Edytuj** (_Edit_).
3. Na karcie **Ogólne** (_General_), w polu **Polecenie** (_Command_) zmień `/usr/bin/fish` na `/usr/bin/bash`.
4. Kliknij **Zastosuj** i zatwierdź.

Tworzymy plik `~/.bash_profile`, aby sesja logowania KDE poprawnie wczytywała zmienne środowiskowe:

```bash
cat << 'EOF' > "$HOME/.bash_profile"
if [ -f "$HOME/.bashrc" ]; then
  . "$HOME/.bashrc"
fi
EOF
```

---

## 7. Weryfikacja Dual-Boot w bootloaderze Limine

Współczesny instalator CachyOS zazwyczaj automatycznie wykrywa menedżera rozruchu Windowsa na drugim fizycznym dysku i tworzy odpowiedni wpis chainloadingu podczas instalacji.

W CachyOS konfiguracją bootloadera zarządza automatyczny skrypt pomocniczy (`limine-entry-tool`), który jest uruchamiany przez hooki menedżera `pacman` przy każdej aktualizacji jądra Linux.

Sprawdzamy, czy Limine poprawnie rozpoznał partycję Windows 11 na dysku Kingston:

```bash
cat /boot/limine.conf 2>/dev/null || cat /boot/limine/limine.conf 2>/dev/null
```

Jeśli na liście widnieje wpis `/Windows 11`, konfiguracja jest gotowa. Gdyby instalator pominął drugi dysk:

1. Odczytaj unikalny identyfikator `PARTUUID` partycji EFI Windowsa (znajdziesz ją na dysku Kingston):
   ```bash
   lsblk -o NAME,SIZE,FSTYPE,PARTUUID,MOUNTPOINTS | grep -E "vfat|FSTYPE"
   ```
2. Otwórz plik konfiguracyjny do edycji (`sudo nano /boot/limine.conf`) i dopisz manualny wpis:
   ```text
   /Windows 11
       comment: Windows 11 Boot Manager
       protocol: efi_chainload
       image_path: guid(TUTAJ_WKLEJ_PARTUUID):/EFI/Microsoft/Boot/bootmgfw.efi
   ```

_Uwaga:_ Przy dwóch fizycznych nośnikach najczystszym zabezpieczeniem na wypadek jakichkolwiek problemów z bootloaderem jest natywny wybór dysku bezpośrednio przez menu rozruchowe płyty głównej MSI (klawisz **F11** podczas włączania komputera).

---

## 8. Monitor LG 27" 144 Hz i akceleracja Nvidia (Wayland)

Karta graficzna GeForce RTX 3070 (architektura Ampere) działa na sesji Wayland w CachyOS bezproblemowo i stabilnie dzięki najnowszym własnościowym sterownikom Nvidia z pełną obsługą synchronizacji jawnej (**Explicit Sync** / `linux-drm-syncobj-v1`), co całkowicie wyeliminowało dawne problemy z migotaniem klatek czy artefaktami pod Waylandem.

1. **Ustawienia ekranu w KDE Plasma:**
   - Otwórz: **Ustawienia systemowe** → **Ekran i monitor**.
   - Rozdzielczość: `2560x1440 (16:9)`.
   - Częstotliwość odświeżania: `144 Hz`.
   - Skalowanie: `100%`.
   - **Adaptacyjne odświeżanie (VRR):** Przestaw opcję na **Automatycznie** (_Automatic_) lub **Zawsze** (_Always_). W połączeniu z kablem DisplayPort zapewnia to prawidłowe działanie technologii G-Sync Compatible na pulpicie i w grach przy 144 Hz (ustawienie _Automatycznie_ zapobiega ewentualnemu subtelnemu migotaniu podświetlenia matrycy podczas wyświetlania statycznego pulpitu).
   - Kliknij **Zastosuj**.
2. **Weryfikacja sterowników i akceleracji w terminalu:**

```bash
echo "Sesja: $XDG_SESSION_TYPE"
nvidia-smi --query-gpu=driver_version,name,temperature.gpu,power.draw --format=csv
```

---

## 9. Zwiększenie limitów jądra Linux (`inotify`)

Nowoczesne środowiska webowe (Astro, Vite) oraz indeksatory JetBrains obserwują w czasie rzeczywistym tysiące plików wewnątrz katalogów `node_modules`. Zwiększamy limity jądra, aby zapobiec awariom procesów z błędem `ENOSPC`:

```bash
sudo tee /etc/sysctl.d/40-dev-limits.conf > /dev/null << 'EOF'
fs.inotify.max_user_watches=524288
fs.inotify.max_user_instances=1024
fs.file-max=2097152
EOF

sudo sysctl --system
```

---

## 10. Instalacja stosu deweloperskiego (Astro, Python, Java)

### Ważna uwaga: Python i restrykcja PEP 668 (EXTERNALLY-MANAGED)

W CachyOS (podobnie jak w czystym Arch Linux) środowisko systemowe Pythona jest oznaczone jako zarządzane zewnętrznie zgodnie ze standardem **PEP 668**. Próba wykonania polecenia `pip install <pakiet>` bezpośrednio w globalnej powłoce zostanie zablokowana przez system, aby zapobiec nadpisaniu plików zarządzanych przez menedżer `pacman`.

Prawidłowe podejście w CachyOS opiera się na 3 ścieżkach:

1. **Pakiety globalne:** Instalujemy przez systemowego pacmana, np. `sudo pacman -S python-pip` lub `sudo pacman -S python-requests`.
2. **Narzędzia CLI w Pythonie:** Instalujemy w izolacji za pomocą `pipx` (`pacman -S python-pipx`).
3. **Środowiska projektowe:** Korzystamy z błyskawicznego narzędzia **`uv`** (`uv venv`, `uv pip install`) lub klasycznego `python -m venv .venv`.

Instalujemy oficjalne pakiety binarne i nowoczesne narzędzia CLI:

```bash
# 1. Pełna aktualizacja systemu
sudo pacman -Syu

# 2. Narzędzia bazowe, runtime i nowoczesne CLI
sudo pacman -S --needed --noconfirm \
  base-devel git github-cli paru \
  nodejs pnpm \
  python uv ipython ruff python-pipx \
  jdk-openjdk maven \
  intellij-idea-community-edition \
  ttf-jetbrains-mono-nerd wl-clipboard pacutils \
  btop bat fzf eza zoxide ripgrep fd

# 3. Instalacja oficjalnego wydania binarnego Visual Studio Code z AUR
paru -S --needed --noconfirm visual-studio-code-bin
```

---

## 11. Konfiguracja czcionki w terminalu Konsole

Profil systemowy `Built-in [Read-only]` w KDE Plasma 6 jest zablokowany przed edycją. Aby przypisać czcionkę ze znakami Powerline/Nerd Font:

1. W oknie **Konsole** przejdź do: **Ustawienia** (_Settings_) → **Zarządzaj profilami...** (_Manage Profiles..._).
2. Kliknij **`+ Nowy...`** (_+ New..._).
3. Wpisz nazwę: `Mainframe`.
4. Przejdź do zakładki **Wygląd** (_Appearance_) → w sekcji **Czcionka** kliknij **Wybierz...**.
5. Wskaż **JetBrainsMono Nerd Font**, ustaw rozmiar na `11` lub `12` pt i kliknij **OK**.
6. Zapisz profil, zaznacz go na liście i kliknij **Ustaw jako domyślny** (_Set as Default_).

---

## 12. Ścieżki systemowe i ergonomia terminala

Rejestrujemy zmienne w usłudze sesji graficznej systemd (dzięki temu IDE uruchamiane ze skrótów KDE natychmiast widzą ścieżki deweloperskie) oraz dopisujemy narzędzia do `~/.bashrc`:

```bash
# Zmienne sesji graficznej systemd
mkdir -p "$HOME/.config/environment.d"
cat << 'EOF' > "$HOME/.config/environment.d/10-workstation.conf"
PNPM_HOME="${HOME}/.local/share/pnpm"
PATH="${HOME}/.local/share/pnpm:${HOME}/.local/bin:${PATH}"
IDEA_VM_OPTIONS="${HOME}/.config/JetBrains/idea64.vmoptions"
EOF

# Utworzenie lokalnych katalogów binarnych
mkdir -p "$HOME/.local/share/pnpm" "$HOME/.local/bin"

# Konfiguracja środowiska interaktywnego Bash
cat << 'EOF' >> "$HOME/.bashrc"

# --- Zmienne srodowiskowe i sciezki PATH ---
export PNPM_HOME="$HOME/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac

case ":$PATH:" in
  *":$HOME/.local/bin:"*) ;;
  *) export PATH="$HOME/.local/bin:$PATH" ;;
esac

export IDEA_VM_OPTIONS="$HOME/.config/JetBrains/idea64.vmoptions"

# --- Ergonomiczne aliasy CLI ---
alias ls='eza --group-directories-first'
alias ll='eza -lh --group-directories-first --git'
alias la='eza -lha --group-directories-first --git'
alias cat='bat --paging=never --style=plain'

# --- Inicjalizacja zoxide (inteligentne cd) i fzf ---
if command -v zoxide &>/dev/null; then
  eval "$(zoxide init bash)"
fi

if command -v fzf &>/dev/null; then
  eval "$(fzf --bash)"
fi
EOF

source "$HOME/.bashrc"
```

---

## 13. Konfiguracja VS Code i IntelliJ IDEA

### 13.1. Visual Studio Code

Wymuszamy natywne renderowanie okna pod serwerem Wayland:

```bash
mkdir -p "$HOME/.config"
cat << 'EOF' > "$HOME/.config/code-flags.conf"
--ozone-platform-hint=auto
--enable-features=WaylandWindowDecorations
EOF

# Instalacja oficjalnych rozszerzeń
code --install-extension astro-build.astro-vscode --force
code --install-extension bradlc.vscode-tailwindcss --force
code --install-extension esbenp.prettier-vscode --force
code --install-extension charliermarsh.ruff --force
code --install-extension ms-python.python --force
code --install-extension vscjava.vscode-java-pack --force
```

Konfigurujemy plik ustawień edytora `~/.config/Code/User/settings.json`:

```json
{
  "editor.fontFamily": "'JetBrainsMono Nerd Font', 'JetBrains Mono', monospace",
  "editor.fontLigatures": true,
  "editor.fontSize": 14,
  "editor.lineHeight": 1.5,
  "npm.packageManager": "pnpm",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "terminal.integrated.defaultProfile.linux": "bash",
  "terminal.integrated.fontFamily": "'JetBrainsMono Nerd Font'",
  "[astro]": {
    "editor.defaultFormatter": "astro-build.astro-vscode"
  },
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.codeActionsOnSave": {
      "source.fixAll.ruff": "explicit",
      "source.organizeImports.ruff": "explicit"
    }
  },
  "[java]": {
    "editor.defaultFormatter": "redhat.java"
  }
}
```

### 13.2. IntelliJ IDEA

Przypisujemy 4 GB pamięci operacyjnej na stertę maszyny wirtualnej JVM:

```bash
mkdir -p "$HOME/.config/JetBrains"
cat << 'EOF' > "$HOME/.config/JetBrains/idea64.vmoptions"
-Xms1024m
-Xmx4096m
-XX:ReservedCodeCacheSize=512m
-XX:+UseG1GC
-XX:SoftRefLRUPolicyMSPerMB=50
-Dsun.tools.attach.enable.attach.self=true
-Dawt.useSystemAAFontSettings=on
-Dswing.aatext=true
EOF
```

W ustawieniach IDE (**Settings** → **Editor** → **Font**) ustawiamy czcionkę `JetBrainsMono Nerd Font` o rozmiarze `14` z włączonymi ligaturami.

---

## 14. Konfiguracja Git i autoryzacja kluczem SSH na GitHub

Wszystkie operacje z repozytoriami zdalnymi wykonujemy przez protokół SSH.

1. Ustawienie tożsamości w Git:

```bash
git config --global user.name "Adrian"
git config --global user.email "adriankorzen@gmail.com"
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global core.autocrlf input
```

2. Generowanie klucza Ed25519 bez hasła (dla płynnej pracy z edytorami kodu):

```bash
mkdir -p "$HOME/.ssh" && chmod 700 "$HOME/.ssh"
ssh-keygen -t ed25519 -C "adriko@mainframe" -f "$HOME/.ssh/id_ed25519" -N ""
chmod 600 "$HOME/.ssh/id_ed25519"
chmod 644 "$HOME/.ssh/id_ed25519.pub"
```

3. Konfiguracja klienta SSH:

```bash
cat << 'EOF' > "$HOME/.ssh/config"
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes
  AddKeysToAgent yes
EOF
chmod 600 "$HOME/.ssh/config"
```

4. Skopiowanie klucza publicznego do schowka:

```bash
wl-copy < "$HOME/.ssh/id_ed25519.pub"
```

5. Na stronie [GitHub SSH Settings](https://github.com/settings/keys) kliknij **New SSH key**, wklej zawartość schowka i zatwierdź.
6. Test połączenia:

```bash
ssh -T -o StrictHostKeyChecking=accept-new git@github.com
```

_Oczekiwana odpowiedź:_ `Hi adriko! You've successfully authenticated, but GitHub does not provide shell access.`

7. Klonowanie repozytoriów roboczych:

```bash
mkdir -p "$HOME/projects" && cd "$HOME/projects"
git clone git@github.com:adriko/adriko-journal.git
git clone git@github.com:adriko/adriko-website.git
git clone git@github.com:adriko/kuba-website.git
git clone git@github.com:adriko/v3-website.git
git clone git@github.com:adriko/maciej-website.git
```

---

## 15. Skrypt weryfikacyjny (Smoke Test)

Po restarcie komputera (`reboot`) uruchamiamy w terminalu skrypt sprawdzający poprawność całego środowiska:

```bash
cat << 'EOF' > /tmp/check_env.sh
#!/usr/bin/env bash
printf "%-25s: %s\n" "Uzytkownik" "$USER"
printf "%-25s: %s\n" "Host" "$(hostname)"
printf "%-25s: %s\n" "Powloka" "$BASH_VERSION"
printf "%-25s: %s\n" "Sesja" "$XDG_SESSION_TYPE"
printf "%-25s: %s\n" "Git user.name" "$(git config --global user.name)"
printf "%-25s: %s\n" "Git user.email" "$(git config --global user.email)"
printf "%-25s: %s\n" "Node.js" "$(node -v 2>/dev/null || echo 'BRAK')"
printf "%-25s: %s\n" "pnpm" "$(pnpm -v 2>/dev/null || echo 'BRAK')"
printf "%-25s: %s\n" "Python" "$(python --version 2>/dev/null || echo 'BRAK')"
printf "%-25s: %s\n" "uv" "$(uv --version 2>/dev/null || echo 'BRAK')"
printf "%-25s: %s\n" "Java" "$(javac -version 2>&1 || echo 'BRAK')"
printf "%-25s: %s\n" "VS Code" "$(code --version 2>/dev/null | head -n 1 || echo 'BRAK')"
printf "%-25s: %s\n" "inotify watches" "$(cat /proc/sys/fs/inotify/max_user_watches)"
nvidia-smi --query-gpu=name,driver_version --format=csv,noheader
ssh -T -o StrictHostKeyChecking=accept-new git@github.com 2>&1 | head -n 1
EOF
chmod +x /tmp/check_env.sh && /tmp/check_env.sh && rm -f /tmp/check_env.sh
```

Wszystkie pozycje powinny zwrócić poprawne identyfikatory wersji oprogramowania, a autoryzacja GitHub potwierdzi bezhasłowy dostęp po kluczu SSH.

---

## Notatki na przyszłość: Eksploracja Hyprland i środowisk kafelkowych

Obecna konfiguracja opiera się na dojrzałym środowisku KDE Plasma, które gwarantuje pełną stabilność podczas codziennej pracy nad zleceniami. Równocześnie bardzo intryguje mnie koncepcja pełnej obsługi pulpitu wyłącznie za pomocą skrótów klawiaturowych (_keyboard-driven workflow_) oraz automatycznego kafelkowania okien (_tiling window manager_).

Próba wdrożenia wtyczek tilingowych (takich jak Polonium) wewnątrz KDE Plasma pokazała, że hybrydowe rozwiązania potrafią kolidować z menedżerem okien KWin. Jeśli w przyszłości zdecyduję się na przejście na pełny tiling, logicznym krokiem będzie wdrożenie czystego ekosystemu dedykowanego pod ten styl pracy:

- **Hyprland:** Nowoczesny, dynamiczny kompozytor Wayland oferujący automatyczne dzielenie okien, animacje i wsparcie dla monitorów o wysokim odświeżaniu.
- **Yazi:** Superszybki, asynchroniczny menedżer plików w terminalu napisany w Rust, sterowany całkowicie klawiszami Vi.
- **Rofi-wayland:** Błyskawiczny launcher aplikacji i menu operacji wywoływany jednym skrótem klawiszowym.
- **Quickshell:** Elastyczny framework oparty na Qt/QML i C++ do tworzenia autorskich paneli statusu i widżetów na Waylandzie (nowoczesna alternatywa dla Waybara).

Gdy nadejdzie moment na gruntowne przetestowanie i wdrożenie czystego Hyprlanda obok KDE, ten wpis doczeka się drugiej części. Na ten moment CachyOS z KDE Plasma tworzy bezbłędną, niesamowicie szybką stację roboczą.
