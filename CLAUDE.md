# UPD Dashboard — Laravel

NoPixel GTA roleplay police department dashboard. Being migrated from a static HTML/Supabase site to a full Laravel application. The original static site lives at `C:\Users\t\Desktop\PD Dashboard` and is still live while this is being built.

## What This Is

A dashboard for UPD (and other department) officers providing: 10-codes, case laws, constitution, phonetics, jurisdiction maps, court reference, templates, roster, BOLO board, notepad, subpoena analyser, quote board, training quizzes, and street guesser.

---

## Current Status

**Phase 1 complete.** Packages installed, Filament scaffolded, assets copied, all 20 pages converted to Blade views.

### What's done
- Laravel 13 installed at this directory
- All packages installed: Socialite + Discord driver, Spatie Permission, Filament v4, Pusher PHP SDK, Intervention Image
- npm packages: laravel-echo, pusher-js
- `.env` configured with placeholder keys for Discord OAuth, Pusher, Discord webhook
- AppServiceProvider registers Discord Socialite driver
- bootstrap/app.php registers Spatie middleware aliases + custom middleware
- Two middleware stubs created (EnsureProfileComplete, EnsureUserIsActive)
- SQLite migrations run (default Laravel tables)
- Filament admin panel scaffolded at `/admin`
- All static assets copied to `public/css`, `public/js`, `public/assets`
- Blade layout created at `resources/views/layouts/app.blade.php`
- All 20 pages converted to Blade views in `resources/views/pages/`
- PageController and all routes defined in `routes/web.php`

### What still needs building (in order)
1. **MySQL** — switch `.env` from SQLite to MySQL, re-run migrations
2. **Phase 2** — Discord OAuth controller + callback, User migration with all profile fields
3. **Phase 2.5** — Profile setup page (ic_name, badge_number, department, rank, avatar)
4. **Phase 3** — Spatie permissions seeder, starter roles, default role config in Filament
5. **Phase 4** — MySQL migrations for bolos, quotes, notes, subpoena_cases, audit_logs
6. **Phase 5** — API controllers replacing Supabase JS calls, Pusher broadcasting events
7. **Phase 6** — Wire middleware to routes, add @can checks to layout nav
8. **Phase 7** — Filament resources (Users, Content, BOLOs, Quotes, Audit Logs, Role presets)
9. **Phase 8** — Discord webhook logging moved server-side
10. **Phase 9** — 20i deployment

---

## Stack

| Concern | Solution |
|---|---|
| Framework | Laravel 13 (PHP 8.5) |
| Database | MySQL (SQLite for local dev currently) |
| Auth | Discord OAuth via Laravel Socialite + SocialiteProviders/Discord |
| Permissions | Spatie Laravel Permission |
| Admin panel | Filament v4 at `/admin` |
| Real-time | Pusher + Laravel Echo (Reverb can't run on shared hosting) |
| Avatar processing | Intervention Image (WEBP conversion) |
| Hosting | 20i shared hosting |

---

## Key Architectural Decisions

- **No Reverb** — 20i shared hosting can't run persistent processes. Pusher is used instead.
- **Standard routing** — the SPA `nav.js` router from the static site is gone. Each page is a real URL. Active nav state is set via `request()->routeIs()` in the Blade layout.
- **Blade layout** — one shared layout (`layouts/app.blade.php`) replaces the duplicated sidebar across 20 HTML files.
- **Discord is identity only** — Discord roles are not used for permissions. Permissions are managed entirely within the dashboard by admins via Filament.
- **Profile setup gates access** — after first Discord login, users must complete a profile form (ic_name, badge_number, department, rank, avatar) before reaching the dashboard. Admins then activate accounts.
- **Notes + subpoena cases move to DB** — currently localStorage on the static site; in this version they'll be stored in MySQL per user, enabling cross-device access.

---

## PHP Extensions Required

These were all enabled in php.ini during setup — needed on 20i too (enable in StackCP):
- `ext-intl` (required by Filament)
- `ext-zip` (required by openspout/Filament)
- `ext-pdo_sqlite` (local dev)
- `ext-pdo_mysql` (production)

---

## File Structure

```
app/
  Http/
    Controllers/
      PageController.php    — one method per page, returns blade view
    Middleware/
      EnsureProfileComplete.php   — redirects to /profile/setup if not complete
      EnsureUserIsActive.php      — logs out and redirects if account not activated
  Models/
    User.php                — needs updating with all profile fields
  Providers/
    AppServiceProvider.php  — Discord Socialite event listener registered here

bootstrap/
  app.php                   — Spatie middleware aliases + custom middleware aliases

config/
  services.php              — Discord OAuth client_id/secret/redirect

resources/views/
  layouts/
    app.blade.php           — master layout: sidebar, head, common scripts
  pages/
    home.blade.php          — all 20 pages as @extends('layouts.app')
    codes.blade.php
    ... (18 more)

routes/
  web.php                   — all 20 page routes + future auth/API routes

public/
  css/styles.css            — copied from static site (unchanged)
  js/                       — all JS files copied from static site
  assets/                   — images copied from static site
  js/filament/              — Filament's published assets
```

---

## Permissions System

All permissions managed in the dashboard, not Discord. Defined via Spatie.

```
view_codes, view_laws, view_constitution, view_jurisdiction, view_court,
view_templates, view_phonetics, view_roster,
view_bolo, manage_bolo, view_notepad, view_subpoena,
view_quotes, submit_quotes, delete_any_quote,
view_quizzes, view_guesser,
access_admin, manage_users, manage_roles, manage_content, view_audit_logs
```

Starter roles: Recruit, Officer, Senior Officer, Supervisor, Admin.
A configurable default role is applied when admins activate new users.

---

## User Profile Fields

Users log in with Discord (identity only), then complete a profile:
- `discord_id`, `discord_username`, `discord_avatar` — from OAuth
- `ic_name` — in-character full name
- `badge_number` — unique, numeric
- `department` — LSPD / BCSO / SASM / EMS / Dispatch (user selects)
- `rank` — free text (e.g. "Patrol Officer")
- `callsign` — admin-assigned only
- `avatar_source` — 'discord' or 'upload'
- `avatar_path` — path to uploaded WEBP
- `profile_complete` — bool, false until onboarding form submitted
- `is_active` — bool, false until admin activates

---

## Environment Variables Needed

```
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=https://yourdomain.com/auth/discord/callback

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=mt1

DISCORD_WEBHOOK_URL=

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=upd_dashboard
DB_USERNAME=
DB_PASSWORD=
```

---

## Running Locally

```bash
php artisan serve        # start dev server at http://localhost:8000
php artisan migrate      # run migrations
php artisan filament:install --panels  # if re-scaffolding admin
```

The Filament admin panel is at `/admin`. It needs a user with `access_admin` permission.

---

## 20i Deployment Checklist

1. Enable in StackCP PHP settings: `ext-intl`, `ext-zip`, `ext-pdo_mysql`
2. SSH in, clone repo
3. `composer install --no-dev --optimize-autoloader`
4. Copy `.env.example` → `.env`, fill in production values
5. `php artisan key:generate`
6. `php artisan migrate`
7. `php artisan storage:link`
8. Set document root to `/public`
9. Upload pre-built `/public/build` (run `npm run build` locally first)
10. Add cron: `* * * * * php /path/to/artisan schedule:run`
