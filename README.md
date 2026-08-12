# WatchWeb

Backend aplikacji dla pasjonatow zegarkow, napisany w Javie 25 i Spring Boot.

Projekt laczy:

* portal spolecznosciowy dla wlascicieli i fanow zegarkow,
* blog branzowy,
* katalog zegarkow,
* system recenzji i ocen.

## Glowne zalozenia

* Java 25 jako docelowa wersja jezyka i runtime.
* Spring Boot 4.1.x jako glowny framework aplikacyjny.
* Architektura package-by-feature pod domenami biznesowymi.
* REST API zabezpieczone przez Spring Security, JWT i refresh tokeny.
* Dokumentacja REST API przez OpenAPI 3 i Swagger UI.
* PostgreSQL jako podstawowa baza danych.
* Flyway do migracji schematu.
* Testy jednostkowe i integracyjne z JUnit 5 oraz Testcontainers.

## Dokumentacja

Szczegolowe wymagania projektowe znajduja sie w [docs/PROJECT.md](docs/PROJECT.md).

Zasady pracy nad kodem i konwencje architektoniczne sa opisane w [AGENTS.md](AGENTS.md).

## Uruchomienie

Najprostszy sposob uruchomienia calego backendu z baza:

```powershell
docker compose up --build
```

Po starcie aplikacji Swagger UI jest dostepny pod:

```text
http://localhost:8081/swagger-ui.html
```

## Dane startowe

Uruchomienie przez Docker Compose wlacza profil `dev`, ktory automatycznie tworzy przykladowe dane do testowania API i przyszlego frontendu.

Haslo dla wszystkich kont demo:

```text
Password123
```

Konta demo:

```text
admin@watchweb.local
moderator@watchweb.local
journalist@watchweb.local
user@watchweb.local
collector@watchweb.local
```
