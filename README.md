# UPD Dashboard

A static quick-reference dashboard for UPD patrol use. Covers 10-codes, phonetic alphabets, case law summaries, constitutional reference, jurisdiction map, court procedure notes, report templates, live roster, changelog, credits, and an integrated Street Guesser training tool.

Navigation is handled client-side — clicking between pages swaps only the main content area with no full page reload or flash.

## Project Structure

```text
.
├── index.html                  Home — response codes, pursuit comms, radio channels, unit caps,
│                               use of force, keybinds, legal standards, Miranda, chain of command
├── codes.html                  10-Codes — grouped by priority with filterable card grid
├── phonetics.html              Phonetic Alphabets — NATO and American side-by-side tables
├── laws.html                   Case Laws — searchable law summaries with detail panel
├── constitution.html           Constitution — full San Andreas constitutional reference
├── jurisdiction.html           Jurisdiction Map — SA law enforcement boundary map
├── court.html                  Court — court procedure notes
├── templates.html              Templates — structured report templates loaded from Report_Templates/
├── roster.html                 Roster — live data from Google Sheets with search, sort, and filters
├── guesser.html                Street Guesser — interactive map training game
├── changelog.html              Changelog — version history rendered from changelog.json
├── credits.html                Credits
│
├── css/
│   └── styles.css              All dashboard styles
│
├── js/
│   ├── nav.js                  Client-side SPA router — intercepts nav clicks, swaps #main content
│   ├── utils.js                Shared helpers (escapeHtml, hl)
│   ├── codes.js                10-Codes data and rendering
│   ├── laws.js                 Case Laws data and rendering
│   ├── templates.js            Templates loader and rendering
│   ├── changelog.js            Changelog rendering (reads changelog.json)
│   ├── roster.js               Roster — fetches live CSV + HTML from Google Sheets
│   └── guesser.js              Street Guesser engine (Vec, SGStreet, SGEngine)
│
├── partials/
│   └── sidebar.html            Shared sidebar markup reference
│
├── changelog.json              Changelog entries
│
├── assets/
│   ├── UPD_Placeholder.webp    Logo and favicon
│   ├── map-jurisdictions.jpg   Jurisdiction map image
│   └── *.png                   Division badge images
│
├── Report_Templates/           Markdown report template files loaded by the Templates tab
│
└── StreetGuesser/
    ├── database.js             Street coordinate data
    └── images/map.png          Street Guesser map image
```

## Credits

- Created by MercuryHQ.
- Street Guesser game by LittlePepperBot: https://github.com/LittlePepperBot/StreetGuesser
- Information used in the dashboard credited to @donnzy (251 Troy Drax) and @unicornfrapp (595 Remi Ironside).
- Interface icons provided by Font Awesome.

## License

Released under the MIT License.
