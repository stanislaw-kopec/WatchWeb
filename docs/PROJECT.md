# WatchWeb - wymagania projektu

## 1. Cel projektu

WatchWeb to backend aplikacji dla pasjonatow zegarkow. Projekt ma pokazac praktyczne uzycie nowoczesnej Javy, Spring Boota i dobrych praktyk backendowych w aplikacji z kilkoma domenami biznesowymi.

Aplikacja laczy:

* portal spolecznosciowy,
* blog branzowy,
* katalog zegarkow,
* system recenzji i ocen.

Glowny nacisk technologiczny projektu: **Java 25 + Spring Boot 4.1.x**.

## 2. Stack technologiczny

| Obszar | Wymaganie |
| --- | --- |
| Jezyk | Java 25 |
| Framework | Spring Boot 4.1.x |
| API | REST |
| Dokumentacja API | OpenAPI 3 / Swagger UI przez springdoc-openapi |
| Bezpieczenstwo | Spring Security, JWT, refresh tokeny, BCrypt |
| ORM | Spring Data JPA, Hibernate |
| Baza danych | PostgreSQL |
| Migracje | Flyway |
| Walidacja | Jakarta Validation |
| Testy | JUnit 5, Mockito, Testcontainers |
| Storage plikow | lokalny storage w development, MinIO/S3 w production |
| Build | Maven |

Nowy kod powinien byc pisany z zalozeniem, ze docelowym runtime jest Java 25.

## 3. Architektura

Projekt powinien uzywac podejscia **package-by-feature**. Logika biznesowa ma byc grupowana wedlug domen, a nie wedlug technicznych warstw.

Docelowy uklad:

```text
src/main/java/com/watchweb/app/
├── config/
├── exception/
├── infrastructure/
│   └── storage/
├── security/
└── domain/
    ├── auth/
    ├── user/
    ├── post/
    ├── article/
    ├── watch/
    ├── review/
    ├── comment/
    └── hashtag/
```

Typowa struktura domeny:

```text
domain/<feature>/
├── controller/
├── service/
├── repository/
├── entity/
└── dto/
```

Globalne sprawy techniczne, takie jak konfiguracja, bezpieczenstwo, obsluga bledow i storage, powinny pozostac poza `domain/`.

## 4. Wymagania funkcjonalne

### 4.1 Uzytkownicy i autoryzacja

System powinien obslugiwac:

* rejestracje,
* logowanie,
* JWT access token,
* refresh token,
* wylogowanie przez uniewaznienie refresh tokena,
* haszowanie hasel przez BCrypt,
* role uzytkownikow.

Tokeny:

* access token: 15 minut,
* refresh token: 7 dni.

Role:

| Rola | Uprawnienia |
| --- | --- |
| `ROLE_USER` | profil, posty, komentarze, recenzje, zglaszanie zegarkow do katalogu |
| `ROLE_MODERATOR` | uprawnienia uzytkownika oraz moderacja postow i zgloszen zegarkow |
| `ROLE_JOURNALIST` | uprawnienia uzytkownika oraz artykuly publikowane bez moderacji |
| `ROLE_ADMIN` | moderacja, zarzadzanie trescia i uzytkownikami |

### 4.2 Posty i moderacja

Uzytkownicy moga tworzyc posty o zegarkach, opcjonalnie ze zdjeciami i hashtagami.

Cykl zycia posta:

```text
PENDING -> APPROVED
PENDING -> REJECTED
REJECTED -> PENDING po edycji
```

Wymagania:

* post zwyklego uzytkownika startuje jako `PENDING`,
* administrator moze zaakceptowac albo odrzucic post,
* odrzucony post przechowuje `rejectionReason`,
* edycja odrzuconego posta cofa go do `PENDING`,
* zwykly uzytkownik nie moze ominac moderacji.

### 4.3 Artykuly

Artykuly sa tworzone przez uzytkownikow z rola `ROLE_JOURNALIST`.

Wymagania:

* artykul ma tytul, tresc, autora i opcjonalny obraz naglowkowy,
* dziennikarz moze publikowac artykuly bez moderacji,
* artykuly powinny byc listowane z paginacja,
* API nie powinno zwracac encji JPA bezposrednio.

### 4.4 Katalog zegarkow

Katalog zegarkow powinien przechowywac:

* marke,
* model,
* kod referencyjny,
* dane techniczne w obiekcie osadzonym `WatchDetails`.

`WatchDetails` powinien obejmowac co najmniej:

* typ mechanizmu,
* kaliber,
* srednice koperty,
* grubosc,
* lug-to-lug,
* szerokosc paska,
* wodoszczelnosc,
* rodzaj szkla,
* material koperty.

Filtrowanie:

* marka,
* typ mechanizmu,
* zakres srednicy,
* minimalna wodoszczelnosc.

Wyszukiwanie i listowanie katalogu powinno uzywac paginacji. Dynamiczne filtrowanie powinno byc oparte o JPA Specifications.

Dodawanie nowych modeli zegarkow do katalogu powinno byc moderowane.

Zasady:

* zwykly uzytkownik moze utworzyc zgloszenie zegarka, ale nie dodaje go bezposrednio do katalogu,
* zgloszenie startuje ze statusem `PENDING`,
* `ROLE_MODERATOR` lub `ROLE_ADMIN` moze zaakceptowac albo odrzucic zgloszenie,
* po akceptacji powstaje rekord w katalogu `watches`,
* po odrzuceniu zgloszenie przechowuje powod odrzucenia,
* zaakceptowanego albo odrzuconego zgloszenia nie mozna moderowac ponownie,
* zatwierdzone zegarki musza miec unikalne polaczenie znormalizowanej marki i modelu,
* system nie powinien tworzyc zgloszenia, jesli taki zegarek juz istnieje w katalogu,
* system nie powinien tworzyc drugiego zgloszenia, jesli istnieje juz aktywne zgloszenie `PENDING` dla tej samej marki i modelu.

### 4.5 Recenzje

Uzytkownik moze dodac recenzje zegarka.

Wymagania:

* ocena od 1 do 10,
* tresc recenzji,
* jeden uzytkownik nie powinien duplikowac recenzji tego samego zegarka, chyba ze projekt jawnie dopusci aktualizacje istniejacej recenzji,
* zegarek przechowuje `averageRating` i `reviewsCount`,
* zmiana lub usuniecie recenzji musi aktualizowac statystyki zegarka.

### 4.6 Komentarze

Komentarze powinny tworzyc drzewo dyskusji.

Wymagania:

* relacja self-referencing przez `parent_id`,
* maksymalna glebokosc: 3 poziomy,
* soft delete zamiast fizycznego usuwania,
* usuniecie komentarza nie moze niszczyc struktury odpowiedzi,
* pobieranie drzewa komentarzy nie powinno powodowac oczywistego problemu N+1.

### 4.7 Hashtagi

Hashtagi powinny byc normalizowane przed zapisem.

Wymagania:

* male litery,
* usuwanie nieobslugiwanych znakow specjalnych,
* unikalnosc po nazwie,
* zachowanie ograniczenia `UNIQUE(name)` w bazie,
* bezpieczna obsluga rownoczesnego tworzenia tego samego hashtagu.

### 4.8 Pliki

Pliki sa uzywane dla:

* avatarow,
* zdjec w postach,
* obrazow naglowkowych artykulow.

Wymagania:

* maksymalny rozmiar: 5 MB,
* dozwolone typy: JPG, PNG, WEBP,
* baza danych przechowuje referencje albo URL, nie binarne dane pliku,
* logika biznesowa korzysta z abstrakcji `StorageService`,
* implementacje storage: lokalna dla developmentu, MinIO/S3 dla production.

## 5. Wymagania techniczne

### 5.1 Java 25

Projekt powinien byc kompilowany i uruchamiany na Java 25.

Zasady:

* `pom.xml` powinien miec ustawione `<java.version>25</java.version>`,
* dokumentacja i konfiguracja powinny wskazywac Java 25 jako wersje docelowa,
* mozna uzywac rekordow jako DTO,
* mozna korzystac z nowoczesnej skladni Javy, jesli poprawia czytelnosc i nie komplikuje projektu.

### 5.2 Spring Boot

Projekt powinien opierac sie na Spring Boot 4.1.x, zgodnie z konfiguracja Maven.

Zasady:

* konfiguracje globalne trafiaja do `config/`,
* autoryzacja i mechanizmy JWT trafiaja do `security/`,
* endpointy powinny zwracac DTO, nie encje,
* walidacja requestow powinna uzywac Jakarta Validation i `@Valid`,
* bledy API powinny miec spójny format przez globalny `@RestControllerAdvice`.

### 5.3 OpenAPI / Swagger

Projekt powinien dokumentowac API przez OpenAPI 3 i Swagger UI.

Wymagania:

* uzywac `springdoc-openapi` zgodnego ze Spring Boot 4.1.x,
* dodac globalna konfiguracje OpenAPI w `config/`,
* kazdy publiczny kontroler powinien miec adnotacje `@Tag`,
* kazdy endpoint powinien miec `@Operation` z krotkim opisem celu endpointu,
* wazne odpowiedzi powinny byc opisane przez `@ApiResponses` / `@ApiResponse`,
* requesty i response DTO powinny uzywac `@Schema` tam, gdzie poprawia to czytelnosc dokumentacji,
* endpointy zabezpieczone JWT powinny byc opisane schematem `bearerAuth`,
* dokumentacja Swagger nie moze zastepowac walidacji, testow ani prawidlowego modelu DTO.

Swagger UI powinien byc dostepny w development pod standardowym adresem:

```text
/swagger-ui.html
```

Specyfikacja OpenAPI powinna byc dostepna pod:

```text
/v3/api-docs
```

### 5.4 Baza danych

PostgreSQL jest glowna baza danych.

Wymagania:

* schemat bazy powinien byc wersjonowany przez Flyway,
* nie nalezy modyfikowac istniejacych migracji po ich zastosowaniu,
* nowe zmiany schematu powinny miec nowe migracje,
* nalezy respektowac klucze obce, unikalnosc i ograniczenia `NOT NULL`.

### 5.5 Testy

Wymagania:

* logika biznesowa powinna miec testy jednostkowe,
* zachowania zalezne od bazy danych powinny miec testy integracyjne,
* Testcontainers powinno byc preferowane dla testow z PostgreSQL,
* przy zmianach w moderacji, recenzjach, komentarzach, hashtagach i tokenach nalezy dodawac lub aktualizowac testy.

## 6. Zasady implementacji

* Nie wystawiac encji JPA bezposrednio z kontrolerow.
* Uzywac DTO, najlepiej rekordow tam, gdzie pasuja.
* Dokumentowac publiczne endpointy adnotacjami OpenAPI/Swagger.
* Unikac logiki biznesowej w kontrolerach.
* Nie oslabiać zasad autoryzacji dla wygody implementacji.
* Nie dodawac nowych wzorcow projektowych bez realnej potrzeby.
* Preferowac proste, jawne rozwiazania.
* Nie robic szerokich refaktorow przy okazji malej funkcji.

## 7. Wzorce uzywane w projekcie

| Wzorzec | Zastosowanie |
| --- | --- |
| Strategy | wybor implementacji storage plikow |
| Specification | dynamiczne filtrowanie zegarkow |
| Factory method | tworzenie DTO z encji, np. `fromEntity()` |
| Builder | tylko dla zlozonych encji, gdzie poprawia czytelnosc |
| Observer / Spring events | powiadomienia po moderacji postow |

## 8. Priorytety rozwoju

1. Uporzadkowanie konfiguracji Java 25 i Spring Boot 4.1.x.
2. Konfiguracja OpenAPI/Swagger jako standardu dokumentowania API.
3. Stabilny model uzytkownikow, rol i autoryzacji.
4. Posty z moderacja.
5. Katalog zegarkow z filtrowaniem.
6. Recenzje i aktualizowane statystyki.
7. Komentarze drzewiaste z limitem glebokosci.
8. Hashtagi i bezpieczna normalizacja.
9. Storage plikow przez `StorageService`.
10. Testy jednostkowe i integracyjne.

## 9. Kryteria gotowosci

Projekt mozna uznac za gotowy technicznie, gdy:

* uruchamia sie na Java 25,
* korzysta ze Spring Boot 4.1.x,
* ma spójne migracje Flyway,
* ma dostepna dokumentacje OpenAPI/Swagger dla publicznych endpointow,
* nie zwraca encji JPA z API,
* ma zabezpieczone endpointy wedlug rol,
* ma testy dla kluczowych reguł biznesowych,
* zachowuje package-by-feature,
* operacje na recenzjach, komentarzach i hashtagach sa spojne transakcyjnie.
