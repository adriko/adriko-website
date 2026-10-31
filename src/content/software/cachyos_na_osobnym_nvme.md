---
title: "CachyOS na osobnym NVMe: oddzielam pracę od gier (instalacja i dev-stack)"
date: "2026-10-31"
tags:
  [
    "cachyos",
    "linux",
    "dual-boot",
    "wayland",
    "astro",
    "python",
    "java",
    "pnpm",
  ]
description: "Praktyczny przewodnik instalacji CachyOS na dedykowanym dysku M.2 obok Windowsa 11. Pełna separacja fizyczna, konfiguracja Wayland na RTX 3070 przy 144 Hz, Btrfs ze Snapperem oraz minimalistyczny dev-stack (Astro, Python z uv, Java z IntelliJ)."
---

Miałem prosty cel: definitywnie oddzielić środowisko do codziennej pracy i programowania od platformy rozrywkowej.

Mój Windows 11 na dysku Kingston 1 TB zostaje maszyną czysto gamingową — dla mnie po godzinach oraz dla siostrzeńca i siostrzenicy, którzy wpadają z wizytą i mają aktualnie nieposkromioną fazę na Robloxa. Z kolei do webdevu w Astro, pisania skryptów w Pythonie i projektów w Javie potrzebowałem systemu szybkiego, pozbawionego telemetrycznego szumu i zoptymalizowanego pod sprzęt. Wybór padł na **CachyOS** — dystrybucję opartą na Arch Linux, która na stronie głównej wita hasłem _„Blazingly fast OS”_. I powiem krótko: jest faktycznie szybka.

Poniższy wpis to moja kompletna dokumentacja wdrożeniowa krok po kroku — notatka dla mnie z przyszłości na wypadek reinstalacji oraz gotowy poradnik dla każdego, kto chce czystego, bezpiecznego dual-boota na dwóch osobnych dyskach.

---

## 1. Sprzęt i dlaczego dwa fizyczne dyski?

Każdy, kto choć raz bawił się w dzielenie jednego dysku NVMe na partycje dla Windowsa i Linuksa, prędzej czy później trafił na ten sam problem: **duże aktualizacje Windows potrafią bez ostrzeżenia nadpisać partycję EFI** albo uszkodzić strukturę bootloadera.

Zamiast ryzykować walkę po kolejnej łatce systemu z Redmond, zastosowałem najbezpieczniejszą metodę: **pełna fizyczna separacja na poziomie nośników**.

- **Dysk 1 (Kingston NVMe 1 TB):** Windows 11, gry, Steam, Roblox.
- **Dysk 2 (WD NVMe 512 GB):** CachyOS, projekty, repozytoria, narzędzia dev.

Trafił mi się na OLX używany dysk M.2 NVMe Western Digital o pojemności 512 GB w bardzo przyzwoitej cenie. W szafie leżał zapasowy cooler M.2 od _be quiet!_, więc spiąłem całość i zamontowałem dysk w wolnym gnieździe M.2 na mojej płycie głównej.

### Platforma sprzętowa:

- **Procesor:** Intel Core i5-10600K @ 4.1 GHz
- **Płyta główna:** MSI Z490-A PRO
- **Pamięć RAM:** HyperX Fury 32 GB (4x8 GB) DDR4 3200 MHz CL16
- **Karta graficzna:** ASUS TUF Gaming GeForce RTX 3070 OC
- **Monitor:** LG 27" 1440p 144 Hz (DisplayPort)

Drugi slot M.2 na płycie działa w standardzie PCIe 3.0 (poprzez chipset Z490), co w praktyce daje transfery rzędu 3000 MB/s — do kompilacji kodu, pracy z bazami danych i serwera deweloperskiego Astro jest to zapas prędkości aż nadto.

---

## 2. Przygotowanie gruntu: Windows 11 i BIOS (MSI)

Zanim włożysz pendrive do portu USB, musisz zneutralizować dwa mechanizmy, które zablokują start Linuksa lub uszkodzą dane na partycjach NTFS.

### Krok 2.1: Wyłączenie Fast Startup w Windowsie

Mechanizm szybkiego uruchamiania w Windows nie wyłącza komputera do zera, lecz wprowadza jądro systemu w stan hybrydowej hibernacji. W efekcie partycje NTFS zostają zablokowane (_hibernation flag_). Jeśli Linux spróbuje uzyskać do nich dostęp, grozi to uszkodzeniem systemu plików.

Otwórz w Windowsie **PowerShell** lub **CMD** jako Administrator i wykonaj:

```powershell
powercfg /h off
```

_Weryfikacja:_ Polecenie całkowicie wyłącza plik hibernacji (`hiberfil.sys`) oraz powiązany z nim mechanizm Fast Startup.

### Krok 2.2: Wyłączenie Secure Boot w BIOS-ie płyty MSI

CachyOS korzysta ze specjalnie zoptymalizowanych jąder kompilowanych pod zestawy instrukcji x86-64-v3/v4 oraz zewnętrznych modułów sterownika Nvidia. Domyślny klucz Secure Boot w UEFI zablokuje rozruch takiego jądra.

1. Zrestartuj komputer i wciskaj klawisz **Delete**, aby wejść do UEFI/BIOS płyty MSI.
2. Przełącz widok na tryb zaawansowany klawiszem **F7** (_Advanced Mode_).
3. Przejdź do: `Settings` → `Security` → `Secure Boot`.
4. Zmień wartość `Secure Boot` na **Disabled**.
5. Wciśnij **F10**, zapisz ustawienia i zrestartuj komputer.

---

## 3. Przygotowanie nośnika i start instalatora

1. Obraz ISO pobieramy z oficjalnej strony [cachyos.org](https://cachyos.org/).
2. Przygotowujemy pendrive w programie **Rufus**:
   - Schemat partycjonowania: **GPT**
   - Docelowy system: **UEFI (non CSM)**
   - Tryb zapisu: w razie pytania wybieramy tryb **DD** (lub domyślny ISO).
3. Wpinamy pendrive do tylnego portu USB na płycie głównej.
4. Odpalamy komputer i od razu stukamy w klawisz **F11** (_Boot Menu_ płyt MSI).
5. Wybieramy nośnik z przedrostkiem `UEFI: [Nazwa Pendrive'a]`.
6. W menu startowym wybieramy pierwszą pozycję: **CachyOS**.

Po kilkunastu sekundach ukazuje się pulpit CachyOS z oknem powitalnym _CachyOS Hello_. Klikamy przycisk **Launch Installer** i wybieramy instalator sieciowy (**Online Installer**).

---

## 4. Wybory w instalatorze (Minimalizm i Btrfs)

Aby system był lekki i pozbawiony zbędnych programów:

1. **Środowisko graficzne:** Wybieramy **KDE Plasma**. W wydaniu CachyOS jest czysta, zoptymalizowana i ma bezbłędne wsparcie dla protokołu Wayland na kartach Nvidia RTX z serii 30xx. Odznaczamy zbędne pakiety biurowe czy odtwarzacze.
2. **Bootloader:** Wybieramy **Limine**. To nowoczesny, niesamowicie szybki bootloader, który w przeciwieństwie do GRUB-a ma czytelną składnię konfiguracyjną i nie sprawia problemów przy dwóch dyskach NVMe.
3. **System plików:** Wybieramy **Btrfs**. Zapewnia natywną kompresję `zstd` (oszczędność miejsca i szybszy odczyt na NVMe) oraz bezpośrednią integrację z narzędziem migawek **Snapper**.
4. **Partycjonowanie dysku (Kluczowy krok):**
   - Wybieramy opcję **Erase disk** (_Wyczyść dysk_).
   - **Bezwzględnie upewnij się w rozwijanej liście u góry, że wybrałeś dysk WD 512 GB, a nie Kingston 1 TB z Windowsem!**
   - Instalator automatycznie utworzy partycję `/boot` (FAT32) oraz partycję główną `/` (Btrfs) z podwolumenami `@`, `@home` i `@snapshots`.

Klikamy instalację. Po zakończeniu pobierania pakietów restartujemy komputer i wyjmujemy pendrive.

---

## 5. Siatka bezpieczeństwa Btrfs i pierwsza migawka (Snapper)

Zanim zmienimy cokolwiek w świeżym systemie, tworzymy punkt przywracania. Jeśli w trakcie konfiguracji cokolwiek pójdzie nie tak, cofnięcie systemu do stanu czystego po instalacji zajmuje 5 sekund bezpośrednio z menu rozruchowego Limine.

Otwórz terminal **Konsole** (`Ctrl + Alt + T`):

```bash
# 1. Sprawdzenie statusu konfiguracji Snappera
sudo snapper list

# 2. Utworzenie migawki stanu początkowego
sudo snapper create -d "Czysty system bazowy po instalacji"
```

---

## 6. Domyślna powłoka Bash

CachyOS domyślnie uruchamia powłokę Fish. Choć wygląda efektownie, nie jest w pełni zgodna ze składnią POSIX, co utrudnia wklejanie standardowych skryptów środowiskowych i funkcji instalacyjnych.

Przełączamy powłokę na klasyczny, niezawodny Bash:

```bash
# Przełączenie bieżącego okna na bash
bash

# Zmiana powłoki logowania dla użytkownika
chsh -s /usr/bin/bash
```

Tworzymy plik `~/.bash_profile`, aby środowisko graficzne KDE Plasma poprawnie wczytywało zmienne i ścieżki:

```bash
cat << 'EOF' > "$HOME/.bash_profile"
if [ -f "$HOME/.bashrc" ]; then
  . "$HOME/.bashrc"
fi
EOF
```

---

## 7. Weryfikacja Dual-Boot w bootloaderze Limine

Instalator CachyOS zazwyczaj automatycznie wykrywa menedżera rozruchu Windows 11 znajdującego się na drugim dysku Kingston.

Sprawdzamy plik konfiguracyjny Limine:

```bash
cat /boot/limine.conf 2>/dev/null || cat /boot/limine/limine.conf 2>/dev/null
```

> **Zasada:** Jeśli na liście widzisz wpis `/Windows 11` lub `Windows Boot Manager`, bootloader poprawnie spiął oba dyski. Możesz pominąć poniższą ręczną konfigurację.

Gdyby wpisu brakowało:

1. Znajdź identyfikator `PARTUUID` partycji EFI Windowsa na dysku Kingston 1 TB:
   ```bash
   lsblk -o NAME,SIZE,FSTYPE,PARTUUID,MOUNTPOINTS | grep -E "vfat|FSTYPE"
   ```
2. Otwórz konfigurację Limine do edycji:
   ```bash
   sudo nano /boot/limine.conf
   ```
   _(Jeśli plik jest pusty, użyj: `sudo nano /boot/limine/limine.conf`)_.
3. Dopisz na końcu pliku blok przekazania rozruchu:
   ```text
   /Windows 11
       comment: Windows 11 Boot Manager
       protocol: efi_chainload
       image_path: guid(TUTAJ_WKLEJ_PARTUUID):/EFI/Microsoft/Boot/bootmgfw.efi
   ```
   _(Zastąp `TUTAJ_WKLEJ_PARTUUID` skopiowanym ciągiem, zapisz: `Ctrl + O`, `Enter`, wyjdź: `Ctrl + X`)_.

---

## 8. Monitor LG 27" 144 Hz i akceleracja Nvidia (Wayland)

1. **Ustawienia monitora w KDE Plasma:**
   - Przejdź do: **Ustawienia systemowe** (_System Settings_) → **Ekran i monitor** (_Display & Monitor_).
   - Ustaw rozdzielczość: `2560x1440 (16:9)`.
   - Częstotliwość odświeżania: `144 Hz`.
   - Skalowanie: `100%`.
   - Częstotliwość adaptacyjna (Adaptive Sync / VRR): `Zawsze` (_Always_).
   - Kliknij **Zastosuj**.

2. **Weryfikacja akceleracji karty RTX 3070 w terminalu:**

```bash
echo "Sesja: $XDG_SESSION_TYPE"
nvidia-smi --query-gpu=driver_version,name,temperature.gpu,power.draw --format=csv
```

_Sesja musi zwrócić `wayland`, a sterownik Nvidia poprawnie odczytać temperaturę i pobór mocy karty._

---

## 9. Zwiększenie limitów jądra Linux (`inotify`)

Serwery deweloperskie Vite/Astro oraz indeksatory IDE (takie jak IntelliJ czy VS Code) nasłuchują zmian w tysiącach plików jednocześnie (zwłaszcza wewnątrz folderów `node_modules`). Standardowe limity systemowe mogą spowodować błąd braku wolnych deskryptorów `ENOSPC`.

Zwiększamy limity trwale w konfiguracji jądra:

```bash
sudo tee /etc/sysctl.d/40-dev-limits.conf > /dev/null << 'EOF'
fs.inotify.max_user_watches=524288
fs.inotify.max_user_instances=1024
fs.file-max=2097152
EOF

# Natychmiastowe załadowanie zmian bez restartu
sudo sysctl --system
```

---

## 10. Instalacja stosu deweloperskiego (Astro, Python, Java)

Wybieramy najszybsze mirrory i instalujemy wyłącznie oficjalne pakiety binarne oraz nowoczesne narzędzia CLI:

```bash
# Optymalizacja serwerów lustrzanych CachyOS i Arch Linux
sudo cachyos-rate-mirrors

# Pełna aktualizacja systemu
sudo pacman -Syu

# Kompletny zestaw narzędzi bazowych, dev-stack i czcionka JetBrains Mono
sudo pacman -S --needed --noconfirm \
  base-devel git github-cli paru \
  nodejs pnpm \
  python uv ipython ruff \
  jdk-openjdk maven \
  intellij-idea-community-edition \
  ttf-jetbrains-mono-nerd wl-clipboard pacutils \
  btop bat fzf eza zoxide ripgrep fd
```

Instalujemy oficjalne wydanie **Visual Studio Code** z AUR (wersja `-bin` ma bezpośredni dostęp do oficjalnego Marketplace rozszerzeń Microsoftu):

```bash
paru -S --needed --noconfirm visual-studio-code-bin
```

---

## 11. Konfiguracja profilu terminala Konsole

Domyślny profil systemowy w Konsole (`Built-in`) jest zablokowany przed edycją. Aby ustawić czcionkę o stałej szerokości:

1. W oknie **Konsole** kliknij: **Ustawienia** (_Settings_) → **Zarządzaj profilami...** (_Manage Profiles..._).
2. Kliknij **`+ Nowy...`** (_+ New..._).
3. Nazwij profil: `Mainframe`.
4. W zakładce **Wygląd** (_Appearance_) kliknij przycisk **Wybierz...** przy czcionce.
5. Wybierz **JetBrainsMono Nerd Font** (rozmiar `11` lub `12` pt) i kliknij **OK**.
6. Zaznacz profil `Mainframe` na liście, kliknij **Ustaw jako domyślny** (_Set as Default_) i zatwierdź przyciskiem **Zastosuj**.

---

## 12. Ścieżki systemowe, aliasy i ergonomia powłoki

Rejestrujemy zmienne środowiskowe w sesji systemd użytkownika, aby edytory uruchamiane z menu graficznego widziały `pnpm` i `PATH`, a nowoczesne aliasy dopisujemy do `~/.bashrc`:

```bash
# 1. Zmienne sesji graficznej
mkdir -p "$HOME/.config/environment.d"
cat << 'EOF' > "$HOME/.config/environment.d/10-workstation.conf"
PNPM_HOME="${HOME}/.local/share/pnpm"
PATH="${HOME}/.local/share/pnpm:${HOME}/.local/bin:${PATH}"
IDEA_VM_OPTIONS="${HOME}/.config/JetBrains/idea64.vmoptions"
EOF

# 2. Utworzenie folderów binarnych użytkownika
mkdir -p "$HOME/.local/share/pnpm" "$HOME/.local/bin"

# 3. Ergonomiczne aliasy i integracja narzędzi w .bashrc
cat << 'EOF' >> "$HOME/.bashrc"

# --- Zmienne środowiskowe i ścieżki ---
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

# --- Błyskawiczna nawigacja zoxide (komenda z) oraz wyszukiwarka fzf ---
if command -v zoxide &>/dev/null; then
  eval "$(zoxide init bash)"
fi

if command -v fzf &>/dev/null; then
  eval "$(fzf --bash)"
fi
EOF

# Przeładowanie powłoki
source "$HOME/.bashrc"
```

---

## 13. Konfiguracja edytorów kodu

### Visual Studio Code (Natywny Wayland 144 Hz)

Domyślnie aplikacje oparte na Electronie mogą uruchamiać się przez warstwę XWayland, co ogranicza odświeżanie i rozmywa czcionki przy skalowaniu. Wymuszamy natywnego Waylanda:

```bash
mkdir -p "$HOME/.config"
cat << 'EOF' > "$HOME/.config/code-flags.conf"
--ozone-platform-hint=auto
--enable-features=WaylandWindowDecorations
EOF
```

Instalujemy rozszerzenia i konfigurujemy `settings.json`:

```bash
# Instalacja wtyczek pod Astro, Pythona i Javę
code --install-extension astro-build.astro-vscode --force
code --install-extension bradlc.vscode-tailwindcss --force
code --install-extension esbenp.prettier-vscode --force
code --install-extension charliermarsh.ruff --force
code --install-extension ms-python.python --force
code --install-extension vscjava.vscode-java-pack --force

# Konfiguracja środowiska VS Code
mkdir -p "$HOME/.config/Code/User"
cat << 'EOF' > "$HOME/.config/Code/User/settings.json"
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
EOF
```

### IntelliJ IDEA Community Edition

Konfigurujemy maszynę wirtualną Javy, przypisując jej optymalne 4 GB sterty RAM (dla pamięci 32 GB):

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

_W GUI IntelliJ:_ Przejdź do `Settings` (`Ctrl + Alt + S`) → `Editor` → `Font`, wybierz `JetBrainsMono Nerd Font`, rozmiar `14` i zaznacz `Enable ligatures`.

---

## 14. Konfiguracja Git i bezpieczne klucze SSH pod GitHub

Praca z repozytoriami przez HTTPS wymaga generowania uciążliwych tokenów PAT. Konfigurujemy nowoczesne, bezpieczne uwierzytelnianie przez klucz kryptograficzny Ed25519:

```bash
# 1. Globalne dane autora
git config --global user.name "Adrian Korzeń"
git config --global user.email "twoj-email@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase false

# 2. Generowanie klucza Ed25519 bez hasła blokującego
mkdir -p "$HOME/.ssh" && chmod 700 "$HOME/.ssh"
ssh-keygen -t ed25519 -C "adriko@mainframe" -f "$HOME/.ssh/id_ed25519" -N ""
chmod 600 "$HOME/.ssh/id_ed25519"
chmod 644 "$HOME/.ssh/id_ed25519.pub"

# 3. Konfiguracja klienta SSH
cat << 'EOF' > "$HOME/.ssh/config"
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes
  AddKeysToAgent yes
EOF
chmod 600 "$HOME/.ssh/config"

# 4. Skopiowanie klucza publicznego do schowka Waylanda
wl-copy < "$HOME/.ssh/id_ed25519.pub"
```

Teraz wystarczy wejść na stronę `https://github.com/settings/keys`, kliknąć **New SSH key**, wkleić zawartość schowka i zatwierdzić.

Sprawdzamy połączenie:

```bash
ssh -T -o StrictHostKeyChecking=accept-new git@github.com
```

_Oczekiwana odpowiedź serwera:_ `Hi adriko! You've successfully authenticated...`.

Teraz możemy bezpiecznie sklonować nasze projekty do folderu `~/projects`:

```bash
mkdir -p "$HOME/projects" && cd "$HOME/projects"
git clone git@github.com:adriko/adriko-website.git
```

---

## 15. Skrypt weryfikacyjny całego środowiska (Smoke Test)

Zapisz i uruchom poniższy test, aby upewnić się, że po restarcie wszystkie komponenty stacji roboczej odpowiadają prawidłowo:

```bash
cat << 'EOF' > /tmp/check_env.sh
#!/usr/bin/env bash
printf "%-25s: %s\n" "Użytkownik" "$USER"
printf "%-25s: %s\n" "Powłoka" "$BASH_VERSION"
printf "%-25s: %s\n" "Typ sesji" "$XDG_SESSION_TYPE"
printf "%-25s: %s\n" "Node.js" "$(node -v 2>/dev/null || echo 'BRAK')"
printf "%-25s: %s\n" "pnpm" "$(pnpm -v 2>/dev/null || echo 'BRAK')"
printf "%-25s: %s\n" "Python" "$(python --version 2>/dev/null || echo 'BRAK')"
printf "%-25s: %s\n" "uv (Python manager)" "$(uv --version 2>/dev/null || echo 'BRAK')"
printf "%-25s: %s\n" "Java" "$(javac -version 2>&1 || echo 'BRAK')"
printf "%-25s: %s\n" "VS Code" "$(code --version 2>/dev/null | head -n 1 || echo 'BRAK')"
printf "%-25s: %s\n" "inotify watches" "$(cat /proc/sys/fs/inotify/max_user_watches)"
nvidia-smi --query-gpu=name,driver_version --format=csv,noheader
ssh -T -o StrictHostKeyChecking=accept-new git@github.com 2>&1 | head -n 1
EOF
chmod +x /tmp/check_env.sh && /tmp/check_env.sh && rm -f /tmp/check_env.sh
```

---

## Podsumowanie i plany na przyszłość

Komputer przy domyślnym starcie bezdotykowo ładuje CachyOS. Gdy przychodzi weekend albo ochota na partyjkę w sieci — wciskam przy starcie **F11**, wybieram dysk Kingston z Windowsem 11 i odpalam gry na pełnych obrotach RTX-a 3070. Żadne systemy nie wchodzą sobie w drogę, a środowisko pracy pod Astro i Pythona wstaje w kilka sekund.

Obecna konfiguracja opiera się na stabilnym KDE Plasma. Równocześnie bardzo intryguje mnie koncepcja pełnej obsługi pulpitu wyłącznie za pomocą skrótów klawiaturowych (_keyboard-driven workflow_) oraz automatycznego kafelkowania okien (_tiling window manager_).

Kiedy przyjdzie czas na przetestowanie czystego środowiska **Hyprland** (wraz z menedżerem plików **Yazi**, launcherem **Rofi-wayland** i panelami **Quickshell**), niniejszy wpis rozbuduję o dedykowany moduł poświęcony temu ekosystemowi.
