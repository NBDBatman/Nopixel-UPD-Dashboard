# UPD Dashboard — Laravel Migration Plan

## Overview

Migrate the current static HTML/Supabase dashboard to a full Laravel application backed by MySQL. Discord OAuth replaces the custom callsign login. A Filament admin panel allows content management and per-user permission control.

---

## Stack Decisions

| Concern | Current | Target |
|---|---|---|
| Language | Vanilla JS (static) | Laravel 11 (PHP 8.2+) |
| Database | Supabase (PostgreSQL) | MySQL |
| Auth | Custom code + localStorage | Discord OAuth (Laravel Socialite) |
| Real-time | Supabase Presence/Channels | Pusher + Laravel Echo |
| Admin | None | Filament v3 |
| Permissions | None | Spatie Laravel Permission |
| Frontend | SPA (nav.js swapping #main) | Blade templates (standard routing) |
| Hosting | Static file host | PHP server (VPS or shared hosting) |

---

## Phase 1 — Laravel Setup

### 1.1 Install Laravel
```bash
composer create-project laravel/laravel upd-dashboard
cd upd-dashboard
```

### 1.2 Configure MySQL
- Set up `.env` with DB credentials
- Create database `upd_dashboard`

### 1.3 Install Core Packages
```bash
composer require laravel/socialite          # Discord OAuth
composer require socialiteproviders/discord # Discord Socialite driver
composer require spatie/laravel-permission  # Roles & permissions
composer require filament/filament          # Admin panel
composer require intervention/image        # Avatar WEBP conversion
php artisan filament:install --panels

npm install --save-dev laravel-echo pusher-js  # Frontend real-time
```

---

## Phase 2 — Discord Authentication

### 2.1 Discord App Setup
- Create application at https://discord.com/developers/applications
- Add OAuth2 redirect URI: `https://yourdomain.com/auth/discord/callback`
- Copy Client ID and Client Secret to `.env`

### 2.2 User Model & Migration
```
users table:
  - id
  - discord_id (unique)
  - discord_username
  - discord_avatar
  - display_name       ← what shows in the online bar (set by admin or pulled from Discord)
  - callsign           ← assigned by admin
  - department         ← e.g. UPD, SASM
  - is_active          ← admin can deactivate accounts
  - last_seen_at
  - created_at / updated_at
```

### 2.3 Auth Flow
1. User clicks "Login with Discord"
2. Redirected to Discord OAuth consent screen
3. Discord returns to `/auth/discord/callback`
4. Find or create user by `discord_id`
5. New users land on a "pending approval" screen until an admin assigns their callsign and activates them
6. Session stored server-side (standard Laravel sessions)

### 2.4 Middleware
- `auth` — must be logged in
- `profile_complete` — must have completed profile setup (custom middleware)
- `active` — account must be activated by admin (custom middleware)

---

## Phase 2.5 — Profile Setup & Management

### 2.5.1 First-Login Onboarding Flow
After a user logs in with Discord for the first time they are redirected to a profile setup page before reaching the dashboard. They cannot access any other page until this is complete (`profile_complete` middleware).

**Profile setup page collects:**
- **In-character name** — their character's full name (e.g. "Nathan Barr"), separate from their Discord username
- **Badge number** — their department badge number (numeric, unique)
- **Department** — dropdown select, one of:
  - LSPD (Los Santos Police Department)
  - BCSO (Blaine County Sheriff's Office)
  - SASM (San Andreas State Marshals)
  - EMS (Emergency Medical Services)
  - Dispatch
- **Rank** — free-text field, the user types their in-character rank (e.g. "Patrol Officer", "Detective", "Sergeant"). Admins can correct this if needed. Shown on the profile card and roster.
- **Profile image** — choice of:
  - Keep Discord avatar (default)
  - Upload a custom image (stored in `storage/app/public/avatars`, max 2MB, JPG/PNG/WEBP)

On submit the account is marked as `profile_complete = true` and lands on the pending approval screen until an admin activates them.

### 2.5.2 Users Table — Additional Fields
```
avatar_source      ← 'discord' or 'upload'
avatar_path        ← path to uploaded image (null if using Discord)
ic_name            ← in-character name (e.g. "Nathan Barr")
badge_number       ← unique badge number
department         ← LSPD / BCSO / SASM / EMS / Dispatch
rank               ← free-text in-character rank (e.g. "Patrol Officer")
profile_complete   ← bool, false until onboarding form submitted
```

### 2.5.3 Profile Edit Page
After activation, users can return to edit their profile at any time via a settings page accessible from the online bar or sidebar footer.

**Editable fields:**
- In-character name
- Badge number (must remain unique — validated server-side)
- Profile image (re-upload or revert to Discord avatar)

**Not user-editable** (admin only):
- Callsign
- Permissions / role

Admins can still override the department a user selected if it was entered incorrectly.

### 2.5.4 How Profile Info Is Used Across the Site
| Field | Where it appears |
|---|---|
| IC name | Online presence bar, BOLO "added by", quote submissions, audit logs |
| Badge number | Online bar pill, profile card |
| Department | Online bar pill, roster, admin user list |
| Rank | Online bar pill, roster, profile card |
| Callsign | Online bar pill (e.g. "2-Lincoln-3 · Nathan Barr") |
| Avatar | Online bar pill, admin user list, future profile cards |

### 2.5.5 Avatar Storage
- Uploaded avatars stored at `storage/app/public/avatars/{user_id}.webp`
- Converted to WEBP on upload for consistency (using Laravel's `intervention/image` package)
- Served via `/storage/avatars/{user_id}.webp`
- If `avatar_source = 'discord'`, the Discord CDN URL is used directly

### 2.5.6 Admin Overrides
In the Filament admin panel, admins can:
- Edit any user's IC name, badge number, callsign, department
- Reset a user's avatar back to their Discord one
- View which avatar source a user is using

---

## Phase 3 — Permissions System

All permissions are managed entirely within the dashboard by admins. Discord roles are not used for permissions — Discord is only used for identity (login).

### 3.1 Permission Definitions (Spatie)

```
# Reference pages
view_codes
view_laws
view_constitution
view_jurisdiction
view_court
view_templates
view_phonetics
view_roster

# Operations
view_bolo
manage_bolo          ← add / edit / resolve / delete
view_notepad
view_subpoena
view_quotes
submit_quotes
delete_any_quote     ← can delete quotes they didn't submit

# Training
view_quizzes
view_guesser

# Admin
access_admin         ← can enter the admin panel
manage_users         ← can activate/deactivate, assign callsigns, edit permissions
manage_roles         ← can create / edit / delete roles and their permission sets
manage_content       ← can edit laws, codes, templates, etc. via admin panel
view_audit_logs
```

### 3.2 Roles

Roles are named groups of permissions. Assigning a role to a user grants all permissions in that role instantly. Roles are fully configurable in the admin panel — admins can create, rename, reorder, and delete roles, and edit which permissions each one includes.

**Built-in starter roles (editable):**

| Role | Intended for | Example permission set |
|---|---|---|
| Recruit | New / probationary officers | view_codes, view_laws, view_phonetics, view_quizzes, view_guesser |
| Officer | Full sworn officers | All view_* permissions + manage_bolo, submit_quotes, view_subpoena |
| Senior Officer | Experienced officers | Everything Officer has + delete_any_quote, view_audit_logs |
| Supervisor | Supervisors / command | Everything Senior Officer has + manage_users |
| Admin | Full access | All permissions including manage_roles, manage_content, access_admin |

These are starting points — the names, permission sets, and number of roles can all be changed freely in the admin panel.

**How roles and direct permissions interact (Spatie standard behaviour):**
- A user can have a role, direct permissions, or both
- Direct permissions stack on top of role permissions (so you can give one user an extra permission without changing their role)
- Removing a role removes all permissions that came from it, but leaves any directly assigned permissions intact

### 3.3 Default Role

A **default role** setting in the admin panel determines which role is automatically assigned when an admin activates a new user. This can be changed at any time and takes effect for future activations only.

- Default is configurable per-department if needed (e.g. new UPD recruits get "Recruit", new SASP recruits get a different role)
- Admins can override the default at the point of activation — when approving a new user in the panel there is a role dropdown that pre-fills with the default but can be changed before saving

### 3.4 How Permissions Are Applied
- Nav items hidden if user lacks the corresponding `view_*` permission
- Controllers check permissions via `$this->authorize()` or `Gate::allows()`
- Blade shows/hides sections with `@can('view_bolo')` directives
- Admins can assign a role, individual permissions, or both to any user

---

## Phase 4 — Database Migration

All Supabase tables move to MySQL via Laravel migrations.

### 4.1 Tables to Create

**bolos**
```
id, vehicle, plate, owner, suspect, reason, priority,
resolved, added_by (user_id FK), created_at, updated_at
```

**quotes**
```
id, quote, said_by, context, submitted_by (user_id FK),
upvotes, created_at, updated_at
```

**quote_votes**
```
id, quote_id (FK), user_id (FK), created_at
-- replaces localStorage vote tracking; enforces one vote per user server-side
```

**notes**
```
id, user_id (FK), title, content, pinned, color, emoji,
tags (JSON), archived, deleted, deleted_at, modified_at, created_at
-- notes move from localStorage to DB; enables cross-device sync
```

**subpoena_cases**
```
id, user_id (FK), name, color, archived, deleted, deleted_at,
phone_data (JSON), bank_data (JSON), created_at, updated_at
-- subpoena cases move from localStorage to DB
```

**audit_logs**
```
id, user_id (FK), action, summary, created_at
-- replaces bolo_logs; unified log for all actions
```

**content tables** (managed via admin panel)
```
laws          — id, name, ruling, category, order
codes         — id, code, meaning, priority, order
templates     — id, title, body, order
```

### 4.2 Data Migration
- Export existing Supabase data to JSON
- Write Laravel seeders to import into MySQL
- Notes and subpoena cases: users import their own on first login (export from old site, import to new)

---

## Phase 5 — Backend (Controllers & API)

Replace Supabase JS client calls with Laravel API routes.

### 5.1 Route Structure
```
/                          → dashboard home
/codes                     → 10-codes
/phonetics                 → phonetics
/laws                      → case laws
... (one route per page)

/api/bolos                 GET, POST
/api/bolos/{id}            PUT, DELETE, PATCH (resolve)
/api/quotes                GET, POST
/api/quotes/{id}           DELETE
/api/quotes/{id}/vote      POST
/api/notes                 GET, POST
/api/notes/{id}            PUT, DELETE
/api/subpoena/cases        GET, POST
/api/subpoena/cases/{id}   PUT, DELETE

/admin                     → Filament panel
/auth/discord              → redirect to Discord
/auth/discord/callback     → handle OAuth return
/auth/logout
```

### 5.2 Broadcasting (Real-time)
Using **Pusher** (managed WebSocket service) + Laravel Echo on the frontend. Pusher is used because 20i shared hosting cannot run persistent processes like Reverb requires. Pusher's free tier (200 concurrent connections, 200k messages/day) is more than sufficient for a small department.

Set `BROADCAST_CONNECTION=pusher` in `.env` with Pusher credentials.

```php
// Events
BoloCreated, BoloUpdated, BoloDeleted
QuoteCreated, QuoteDeleted, QuoteVoted
UserPresenceUpdated   ← replaces Supabase presence channel
```

Channels:
- `bolos` — public channel, all authenticated users
- `quotes` — public channel
- `presence.dashboard` — presence channel for the online bar

---

## Phase 6 — Frontend Conversion

### 6.1 Blade Templates
- Convert each HTML page to a Blade template
- Shared sidebar extracted to `layouts/sidebar.blade.php`
- Nav items wrapped in `@can` directives
- Single layout file `layouts/app.blade.php` replaces the duplicated nav across 20 files

```blade
{{-- layouts/app.blade.php --}}
<html>
  <head>...</head>
  <body>
    @include('layouts.sidebar')
    <main>@yield('content')</main>
    @include('layouts.online-bar')
  </body>
</html>
```

### 6.2 Navigation
Replace the SPA `nav.js` router with standard Laravel routing. Each nav link is a standard `<a href="">` to a real URL. No more `fetch` + DOM swap. Page loads are fast since Laravel serves pre-rendered Blade — no flash or re-initialisation issues.

### 6.3 JavaScript Updates
- Remove all Supabase JS client calls
- Replace with `fetch('/api/...')` to Laravel endpoints
- Replace Supabase real-time with Laravel Echo:
  ```js
  Echo.join('presence.dashboard')
    .here(users => renderOnlineBar(users))
    .joining(user => addToBar(user))
    .leaving(user => removeFromBar(user));

  Echo.channel('bolos').listen('BoloCreated', () => reloadBolos());
  ```
- All existing quiz JS, guesser JS, phonetics JS stays unchanged
- Notes and subpoena JS updated to call `/api/notes` and `/api/subpoena` instead of localStorage

### 6.4 Existing CSS
Carry across unchanged — all CSS custom properties and component styles work as-is.

---

## Phase 7 — Filament Admin Panel

### 7.1 Resources (pages in the admin panel)

**Users**
- List all users with Discord avatar, callsign, department, last seen
- Activate / deactivate accounts
- Assign callsign and department
- Grant / revoke individual permissions
- Assign to a role (Recruit, Officer, Senior Officer, Admin) which applies a permission preset

**Content Management**
- Case Laws — add, edit, reorder, delete
- 10-Codes — add, edit, reorder, delete  
- Templates — add, edit, reorder, delete
- (Constitution, Jurisdiction, Court pages remain static Blade for now)

**BOLO Board**
- View all BOLOs including resolved and expired
- Force-delete any BOLO

**Quotes**
- View all quotes
- Delete any quote
- See vote counts

**Audit Logs**
- Searchable table of all audit log entries
- Filter by user, action type, date range

**Permission Presets**
- Define named presets (e.g. "Recruit", "Officer") with a set of permissions
- Applying a preset to a user grants those permissions instantly

### 7.2 Admin Access
- Only users with `access_admin` permission reach the Filament panel
- Filament's built-in auth is replaced with a guard that checks the `access_admin` permission on the existing user session

---

## Phase 8 — Discord Logging

Discord webhooks stay — the existing `_discordLog` function continues to work since it just posts to a webhook URL. No changes needed except the webhook URL moves from a JS constant to a Laravel `.env` variable, and webhook calls move server-side (more secure — webhook URL not exposed in browser JS).

```php
// app/Services/DiscordLogger.php
Http::post(env('DISCORD_WEBHOOK_URL'), [
  'embeds' => [[
    'title' => $title,
    'description' => $description,
    'color' => $color,
    'fields' => $fields,
  ]]
]);
```

---

## Phase 9 — Hosting & Deployment (20i)

### 20i Shared Hosting — What Works
- PHP 8.2+ ✓ (selectable in StackCP)
- MySQL 8.0+ ✓
- SSH access ✓ (run Composer and Artisan commands)
- Cron jobs ✓ (via StackCP — used for Laravel scheduler)
- File storage ✓ (uploaded avatars, logs)
- `.env` file ✓ (place in document root or above public/)

### 20i Shared Hosting — Constraints
- **No persistent processes** — Reverb cannot run here; Pusher is used instead (already accounted for in Phase 5.2)
- **No Supervisor / PM2** — queue workers cannot run continuously
- **Queue handling** — set `QUEUE_CONNECTION=database` and run via cron every minute:
  ```
  * * * * * php /path/to/artisan queue:work --stop-when-empty
  ```
  This processes any queued jobs (e.g. Discord webhook posts, audit log writes) once per minute rather than instantly. Acceptable for logging — not user-facing.
- **Node.js not available at runtime** — assets must be compiled locally (`npm run build`) and the compiled `/public/build` folder uploaded. No hot-reload on the server.

### Deployment Steps
1. SSH into 20i server
2. Clone or upload project files (excluding `node_modules`)
3. Run `composer install --no-dev --optimize-autoloader` via SSH
4. Set correct PHP version in StackCP
5. Point document root to `/public`
6. Copy `.env.example` to `.env`, fill in credentials (DB, Discord OAuth, Pusher)
7. Run `php artisan key:generate` via SSH
8. Run `php artisan migrate` via SSH
9. Run `php artisan storage:link` via SSH (for avatar uploads)
10. Upload pre-compiled `/public/build` folder (built locally with `npm run build`)
11. Add cron job in StackCP: `* * * * * php /path/to/artisan schedule:run`

### Environment Variables Needed
```
APP_URL=https://yourdomain.com
DB_HOST / DB_DATABASE / DB_USERNAME / DB_PASSWORD
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
DISCORD_REDIRECT_URI=https://yourdomain.com/auth/discord/callback
PUSHER_APP_ID / PUSHER_APP_KEY / PUSHER_APP_SECRET / PUSHER_APP_CLUSTER
DISCORD_WEBHOOK_URL
```

---

## Migration Order

1. **Phase 1** — Laravel install + packages
2. **Phase 2** — Discord OAuth + user model
3. **Phase 4** — Database migrations (schema only)
4. **Phase 5** — API controllers (BOLOs first as the most critical shared feature)
5. **Phase 6** — Blade template conversion (starting with layout + home page)
6. **Phase 3** — Permissions wired into existing routes + nav
7. **Phase 5 cont.** — Remaining API endpoints (quotes, notes, subpoena)
8. **Phase 5 cont.** — Reverb broadcasting
9. **Phase 7** — Filament admin panel
10. **Phase 8** — Discord logging moved server-side
11. **Phase 9** — Deployment

---

## What Improves Over the Current Site

| Current limitation | After migration |
|---|---|
| Anyone with the access code can log in | Real Discord identity — no shared codes |
| No way to restrict features per user | Full per-user permission control |
| Notes/subpoena cases lost if browser data cleared | Stored in DB, accessible from any device |
| Webhook URL visible in browser JS | Moved server-side, never exposed |
| Upvotes tracked in localStorage (bypassable) | One vote per user enforced in DB |
| 20 HTML files all contain duplicate nav markup | Single Blade layout file |
| No content editing without touching code | Filament admin panel for laws, codes, templates |
| SPA navigation can break/full-reload | Standard routing — no SPA fragility |
