# Rails API + React Integration

Este repositorio ahora incluye un backend Rails API en `/Users/alan/trellcord/backend`.

## 1. Opcion recomendada (Docker, un solo comando)

```bash
cd /Users/alan/trellcord
docker compose up --build
```

Servicios:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- Postgres: `localhost:5432`

Para detener:

```bash
docker compose down
```

## 2. Opcion manual (sin Docker)

### Backend (Rails + PostgreSQL)

```bash
cd /Users/alan/trellcord/backend
cp .env.example .env
bundle install
bin/rails db:create db:migrate db:seed
bin/rails s -p 3001
```

### Frontend (React)

```bash
cd /Users/alan/trellcord
cp .env.example .env
npm install
npm start
```

El frontend usara `REACT_APP_API_URL=http://localhost:3001/api/v1`.

## 3. Usuario demo

- Email: `alan@example.com`
- Password: `password123`

## 4. Endpoints principales

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `PATCH /api/v1/auth/me`
- `PATCH /api/v1/auth/password`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/validate-reset-token`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/settings`
- `PATCH /api/v1/settings`
- `GET /api/v1/boards`
- `POST /api/v1/boards`
- `POST /api/v1/boards/join`
- `PATCH /api/v1/boards/:id`
- `DELETE /api/v1/boards/:id`
- `GET /api/v1/boards/:board_id/channels`
- `POST /api/v1/boards/:board_id/channels`
- `GET /api/v1/boards/:board_id/channels/:channel_id/messages`
- `POST /api/v1/boards/:board_id/channels/:channel_id/messages`
- `WS /cable?token=<jwt>`

Header para endpoints autenticados:

```txt
Authorization: Bearer <token>
```

Para unirse con codigo:

```json
{
  "invite_code": "ABC12345"
}
```

Nota para `forgot-password` en desarrollo: el backend devuelve `resetUrl` en la respuesta para poder probar el flujo sin proveedor SMTP.

Para tiempo real, suscribete a ActionCable con:

```json
{
  "command": "subscribe",
  "identifier": "{\"channel\":\"BoardChatChannel\",\"board_channel_id\":\"<id>\"}"
}
```

## 6. Migraciones nuevas

Si ya habias levantado el proyecto antes, ejecuta migraciones:

```bash
cd /Users/alan/trellcord/backend
bin/rails db:migrate
```

Con Docker:

```bash
cd /Users/alan/trellcord
docker compose exec backend bin/rails db:migrate
```

## 5. Troubleshooting rapido

Si ves un error tipo `` `windows` is not a valid platform `` al hacer `bundle install`, estas usando un Ruby/Bundler viejo del sistema (usualmente `/usr/bin/ruby`).

Verifica:

```bash
which ruby
ruby -v
which bundle
bundle -v
```

Debes usar Ruby 3.x y Bundler 2.x (no Ruby 2.6 + Bundler 1.x).
