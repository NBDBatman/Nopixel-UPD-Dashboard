# UPD Dashboard

A static quick-reference dashboard for UPD patrol use. It includes 10-codes, phonetic alphabets, case law summaries, constitutional reference material, jurisdiction map, court procedure notes, report templates, changelog, credits, and an integrated Street Guesser training tab.

## Project Structure

```text
.
├── index.html                 Main dashboard markup
├── styles.css                 Dashboard styling and responsive layout
├── app.js                     Dashboard data, navigation, rendering, and Street Guesser integration
├── changelog.json             Changelog data
├── assets/
│   ├── UPD_Placeholder.webp   Logo and favicon
│   └── map-jurisdictions.jpg  Jurisdiction map
├── Report_Templates/          Markdown report templates loaded by the Templates tab
└── StreetGuesser/
    ├── database.js            Street data
    └── images/map.png         Street Guesser map image
```

## Credits

- Created by MercuryHQ.
- Street Guesser game by LittlePepperBot: https://github.com/LittlePepperBot/StreetGuesser
- Information used in the dashboard credited to @donnzy (251 Troy Drax) and @unicornfrapp (595 Remi Ironside).
- Interface icons provided by Font Awesome.

## License

Released under the MIT License.
