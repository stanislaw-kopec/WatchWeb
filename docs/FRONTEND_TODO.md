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
- [x] Tworzenie posta przez zalogowanego uzytkownika.
- [x] Formularz hashtagow przy tworzeniu/edycji posta.
- [x] Widok "moje posty" z filtrami statusu: `PENDING`, `APPROVED`, `REJECTED`.
- [x] Pokazanie powodu odrzucenia posta.
- [x] Edycja wlasnego posta.
- [x] Usuwanie wlasnego posta.
- [x] Upload zdjecia do posta.
- [x] Lista komentarzy pod postem.
- [x] Dodawanie komentarza i odpowiedzi pod postem.
- [x] Usuwanie komentarzy pod postem.

### Zgloszenia zegarkow do katalogu

- [x] Encja/API frontendu dla zgloszen zegarkow.
- [x] Formularz zgloszenia zegarka.
- [x] Pola podstawowe: marka, model, kod referencyjny.
- [x] Pola techniczne: typ mechanizmu, kaliber, srednica, grubosc, lug-to-lug, szerokosc paska, wodoszczelnosc, szklo, material koperty.
- [x] Widok "moje zgloszenia zegarkow".
- [x] Filtrowanie moich zgloszen po statusie.
- [x] Pokazanie powodu odrzucenia zgloszenia.

### Moderacja

- [x] Dodac trase `/moderation`, bo link jest juz widoczny w nawigacji.
- [x] Ograniczyc widocznosc linku "Moderacja" do `ROLE_MODERATOR` i `ROLE_ADMIN`.
- [x] Widok kolejki postow do moderacji.
- [x] Filtrowanie postow moderacyjnych po statusie.
- [x] Zatwierdzanie posta.
- [x] Odrzucanie posta z powodem.
- [x] Widok kolejki zgloszen zegarkow do moderacji.
- [x] Filtrowanie zgloszen zegarkow po statusie.
- [x] Zatwierdzanie zgloszenia zegarka.
- [x] Odrzucanie zgloszenia zegarka z powodem.

## Sredni priorytet

### Profil i konto

- [x] Edycja profilu: nazwa uzytkownika i email.
- [x] Upload avatara.
- [x] Zmiana hasla.
- [x] Usuniecie/anonymizacja konta.
- [x] Widok profilu uzytkownika po `GET /api/users/{id}` dla zalogowanych uzytkownikow.

### Recenzje

- [x] Widok "moje recenzje" z `/api/users/me/reviews`.
- [x] Edycja wlasnej recenzji.
- [x] Usuwanie wlasnej recenzji.
- [x] Akcje moderatora/admina do usuwania cudzych recenzji, jesli maja byc dostepne w UI.

### Komentarze pod zegarkami

- [x] Usuwanie wlasnych komentarzy pod zegarkiem.
- [x] Usuwanie komentarzy przez moderatora/admina.
- [x] Lepszy komunikat przy osiagnieciu maksymalnej glebokosci odpowiedzi.

### Powiadomienia

- [x] Encja/API frontendu dla powiadomien.
- [x] Lista powiadomien zalogowanego uzytkownika.
- [x] Badge/licznik nieprzeczytanych powiadomien przy ikonie dzwonka.
- [x] Oznaczanie powiadomienia jako przeczytane.
- [x] Linkowanie powiadomien do zasobu, np. posta albo zgloszenia zegarka.

### Artykuly

- [x] Tworzenie artykulu dla `ROLE_JOURNALIST` i `ROLE_ADMIN`.
- [x] Edycja artykulu.
- [x] Usuwanie artykulu.
- [x] Upload obrazka naglowkowego artykulu.
- [x] Ograniczenie widocznosci akcji artykulow wedlug roli.

## Nizszy priorytet / dopracowanie

### Admin

- [x] Panel admina uzytkownikow.
- [x] Lista uzytkownikow z paginacja.
- [x] Zmiana roli uzytkownika.
- [x] Zabezpieczenie UI przed odebraniem sobie roli admina.

### Hashtagi

- [x] Encja/API frontendu dla hashtagow.
- [x] Lista hashtagow.
- [x] Autocomplete hashtagow przy tworzeniu posta.
- [x] Klikniecie hashtagu prowadzi do listy postow z filtrem.

### Wyszukiwanie globalne

- [x] Podlaczenie pola wyszukiwania w headerze.
- [x] Ustalic zakres wyszukiwania: zegarki po marce, artykuly, posty, hashtagi.
- [x] Widok wynikow wyszukiwania albo szybkie sugestie.

### Jakosc frontendu

- [ ] Frontendowe testy komponentow.
- [ ] Frontendowe testy przeplywow uzytkownika.
- [ ] Wspolne komponenty dla pustych stanow.
- [ ] Wspolne komponenty dla bledow i retry.
- [ ] Wspolne komponenty formularzy dla pol tekstowych, uploadu plikow i statusow mutacji.
- [x] Role-based route guards dla `USER`, `JOURNALIST`, `MODERATOR`, `ADMIN`.
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
