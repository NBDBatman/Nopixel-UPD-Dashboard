# UPD Dashboard

A static quick-reference dashboard for UPD patrol use. Covers 10-codes, phonetic alphabets, case law summaries, constitutional reference, jurisdiction map, court procedure notes, report templates, live roster, BOLO board, training tools, changelog, and credits.

Navigation is handled client-side — clicking between pages swaps only the main content area with no full page reload or flash.

## Project Structure

```text
.
├── index.html                  Home — response codes, pursuit comms, radio channels, unit caps,
│                               use of force, keybinds, legal standards, Miranda, chain of command
├── codes.html                  10-Codes — grouped by priority with filterable card grid
├── phonetics.html              Phonetic Alphabets — NATO and American tables + plate/name converter
├── laws.html                   Case Laws — searchable law summaries with detail panel
├── constitution.html           Constitution — full San Andreas constitutional reference
├── jurisdiction.html           Jurisdiction Map — SA law enforcement boundary map
├── court.html                  Court — court procedure notes
├── templates.html              Templates — structured report templates loaded from Report_Templates/
├── roster.html                 Roster — live data from Google Sheets with search, sort, and filters
├── bolo.html                   BOLO Board — active lookout notices, persisted in localStorage
├── guesser.html                Street Guesser — interactive map training game
├── quiz.html                   Phonetics Quiz — NATO/American alphabet multiple-choice trainer
├── tcquiz.html                 10-Codes Quiz — 20-question random multiple-choice quiz
├── changelog.html              Changelog — timeline view rendered from changelog.json
├── credits.html                Credits — contributors, tools used, and license
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
│   ├── changelog.js            Changelog timeline rendering (reads changelog.json)
│   ├── roster.js               Roster — fetches live CSV + HTML from Google Sheets
│   ├── phonetics.js            Plate/name phonetic converter
│   ├── quiz.js                 Phonetics Quiz engine
│   ├── tcquiz.js               10-Codes Quiz engine
│   ├── bolo.js                 BOLO Board — add, edit, resolve, delete, 311 copy
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
