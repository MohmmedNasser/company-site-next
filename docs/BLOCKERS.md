# Open items — resolve before Phase 9 (Laravel)

- [ ] Stop Laragon permanently (conflicts with Herd on port 80)
- [ ] DBngin: create MySQL **8.4 LTS** — not 9.x (innovation track,
      no hosting parity), not Laragon's 5.7 (EOL, incomplete JSON support)
- [ ] Decide port: 3306 if Laragon is off, otherwise 3307
- [ ] Enable "Automatically start service on Login"
- [ ] CREATE DATABASE company_site with utf8mb4 / utf8mb4_unicode_ci
- [ ] Laravel repo goes in ~/Projects/apex-site/company-site-api/,
      served via `herd link` — never inside ~/Herd
- [ ] .env uses 127.0.0.1, not localhost (socket vs TCP)
