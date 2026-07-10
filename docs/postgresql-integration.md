# PostgreSQL Integration Guide

This project now uses PostgreSQL as the default runtime database for the backend. The Angular frontend continues to use the backend API, so once the backend is connected, the full app is connected.

## 1. Start PostgreSQL (Docker)

From the `backend` folder:

```powershell
Set-Location backend
Copy-Item .env.example .env -ErrorAction SilentlyContinue
docker compose -f docker-compose.postgres.yml up -d
```

Container defaults:

- Database: `hyhub`
- Username: `hyhub_app`
- Password: `hyhub_app`

## 2. Run Backend

```powershell
Set-Location backend
$env:DB_URL = "jdbc:postgresql://localhost:5432/hyhub"
$env:DB_USERNAME = "hyhub_app"
$env:DB_PASSWORD = "hyhub_app"
.\mvnw.cmd spring-boot:run
```

The backend defaults to the `postgres` profile through `application.properties`, so `SPRING_PROFILES_ACTIVE` is only needed if you want to switch away from PostgreSQL.

## 3. Verify Schema and Migrations

- Flyway executes migrations from `classpath:db/migration`.
- JPA runs in `validate` mode and fails startup when schema drifts.
- The backend applies the same migration history used by the app in other environments.

## 4. Operational Notes

- Connection pool is configured through Hikari parameters in `application-postgres.properties`.
- Use environment variables to tune pool sizes and timeouts.
- Keep migration files immutable once deployed to shared environments.

## 5. Optional H2 Fallback

If you need the previous file-based local mode:

```powershell
Set-Location backend
$env:SPRING_PROFILES_ACTIVE = "local"
.\mvnw.cmd spring-boot:run
```
