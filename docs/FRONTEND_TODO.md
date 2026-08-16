# Frontend TODO

Status audytu: 2026-08-16.

Ten plik jest zrodlem prawdy dla brakujacych widokow i akcji po stronie frontendu. Aktualizuj checkboxy po kazdym skonczonym kroku, zeby nie trzeba bylo ponownie robic pelnego audytu backendu.

## Aktualnie zaimplementowane

- [x] Layout aplikacji z glowna nawigacja.
- [x] Strona startowa.
- [x] Katalog zegarkow.
- [x] Filtrowanie katalogu zegarkow po marce, mechanizmie, srednicy i wodoszczelnosci.
- [x] Szczegoly zegarka.
- [x] Lista recenzji zegarka.
- [x] Dodawanie recenzji zegarka przez zalogowanego uzytkownika.
- [x] Lista komentarzy pod zegarkiem jako drzewo.
- [x] Dodawanie komentarza i odpowiedzi pod zegarkiem przez zalogowanego uzytkownika.
- [x] Lista artykulow.
- [x] Szczegoly artykulu.
- [x] Logowanie.
- [x] Rejestracja.
- [x] Przechowywanie sesji JWT i odswiezanie access tokena.
- [x] Podstawowy widok profilu zalogowanego uzytkownika.
- [x] Podstawowa obsluga bledow API.

## Najblizszy priorytet

### Posty spolecznosciowe

- [x] Encja/API frontendu dla postow.
- [x] Publiczna lista zaakceptowanych postow.
- [x] Wyszukiwanie postow po tekscie.
- [x] Filtrowanie postow po hashtagu.
- [x] Szczegoly posta.
- [ ] Tworzenie posta przez zalogowanego uzytkownika.
- [ ] Formularz hashtagow przy tworzeniu/edycji posta.
- [ ] Widok "moje posty" z filtrami statusu: `PENDING`, `APPROVED`, `REJECTED`.
- [ ] Pokazanie powodu odrzucenia posta.
- [ ] Edycja wlasnego posta.
- [ ] Usuwanie wlasnego posta.
- [ ] Upload zdjecia do posta.
- [x] Lista komentarzy pod postem.
- [x] Dodawanie komentarza i odpowiedzi pod postem.
- [ ] Usuwanie komentarzy pod postem.

### Zgloszenia zegarkow do katalogu

- [ ] Encja/API frontendu dla zgloszen zegarkow.
- [ ] Formularz zgloszenia zegarka.
- [ ] Pola podstawowe: marka, model, kod referencyjny.
- [ ] Pola techniczne: typ mechanizmu, kaliber, srednica, grubosc, lug-to-lug, szerokosc paska, wodoszczelnosc, szklo, material koperty.
- [ ] Widok "moje zgloszenia zegarkow".
- [ ] Filtrowanie moich zgloszen po statusie.
- [ ] Pokazanie powodu odrzucenia zgloszenia.

### Moderacja

- [ ] Dodac trase `/moderation`, bo link jest juz widoczny w nawigacji.
- [ ] Ograniczyc widocznosc linku "Moderacja" do `ROLE_MODERATOR` i `ROLE_ADMIN`.
- [ ] Widok kolejki postow do moderacji.
- [ ] Filtrowanie postow moderacyjnych po statusie.
- [ ] Zatwierdzanie posta.
- [ ] Odrzucanie posta z powodem.
- [ ] Widok kolejki zgloszen zegarkow do moderacji.
- [ ] Filtrowanie zgloszen zegarkow po statusie.
- [ ] Zatwierdzanie zgloszenia zegarka.
- [ ] Odrzucanie zgloszenia zegarka z powodem.

## Sredni priorytet

### Profil i konto

- [ ] Edycja profilu: nazwa uzytkownika i email.
- [ ] Upload avatara.
- [ ] Zmiana hasla.
- [ ] Usuniecie/anonymizacja konta.
- [ ] Publiczny widok profilu uzytkownika po `GET /api/users/{id}`.

### Recenzje

- [ ] Widok "moje recenzje" z `/api/users/me/reviews`.
- [ ] Edycja wlasnej recenzji.
- [ ] Usuwanie wlasnej recenzji.
- [ ] Akcje moderatora/admina do usuwania cudzych recenzji, jesli maja byc dostepne w UI.

### Komentarze pod zegarkami

- [ ] Usuwanie wlasnych komentarzy pod zegarkiem.
- [ ] Usuwanie komentarzy przez moderatora/admina.
- [ ] Lepszy komunikat przy osiagnieciu maksymalnej glebokosci odpowiedzi.

### Powiadomienia

- [ ] Encja/API frontendu dla powiadomien.
- [ ] Lista powiadomien zalogowanego uzytkownika.
- [ ] Badge/licznik nieprzeczytanych powiadomien przy ikonie dzwonka.
- [ ] Oznaczanie powiadomienia jako przeczytane.
- [ ] Linkowanie powiadomien do zasobu, np. posta albo zgloszenia zegarka.

### Artykuly

- [ ] Tworzenie artykulu dla `ROLE_JOURNALIST` i `ROLE_ADMIN`.
- [ ] Edycja artykulu.
- [ ] Usuwanie artykulu.
- [ ] Upload obrazka naglowkowego artykulu.
- [ ] Ograniczenie widocznosci akcji artykulow wedlug roli.

## Nizszy priorytet / dopracowanie

### Admin

- [ ] Panel admina uzytkownikow.
- [ ] Lista uzytkownikow z paginacja.
- [ ] Zmiana roli uzytkownika.
- [ ] Zabezpieczenie UI przed odebraniem sobie roli admina.

### Hashtagi

- [ ] Encja/API frontendu dla hashtagow.
- [ ] Lista hashtagow.
- [ ] Autocomplete hashtagow przy tworzeniu posta.
- [ ] Klikniecie hashtagu prowadzi do listy postow z filtrem.

### Wyszukiwanie globalne

- [ ] Podlaczenie pola wyszukiwania w headerze.
- [ ] Ustalic zakres wyszukiwania: zegarki, artykuly, posty, hashtagi.
- [ ] Widok wynikow wyszukiwania albo szybkie sugestie.

### Jakosc frontendu

- [ ] Frontendowe testy komponentow.
- [ ] Frontendowe testy przeplywow uzytkownika.
- [ ] Wspolne komponenty dla pustych stanow.
- [ ] Wspolne komponenty dla bledow i retry.
- [ ] Wspolne komponenty formularzy dla pol tekstowych, uploadu plikow i statusow mutacji.
- [ ] Role-based route guards dla `USER`, `JOURNALIST`, `MODERATOR`, `ADMIN`.
- [ ] Przejrzec teksty w UI i usunac techniczne opisy, ktore byly pomocne w fazie budowy.

## Sugerowana kolejnosc prac

1. Posty publiczne: lista, szczegoly, komentarze.
2. Tworzenie i "moje posty".
3. Zgloszenia zegarkow: formularz i moje zgloszenia.
4. Moderacja postow i zgloszen zegarkow.
5. Rozbudowa profilu konta.
6. Powiadomienia.
7. Panel admina.
8. Testy frontendu i porzadkowanie wspolnych komponentow.
