# DOU DefTech Jobs

[![Deploy to GitHub Pages](https://github.com/gebeto/dou-parser/actions/workflows/pages.yml/badge.svg)](https://github.com/gebeto/dou-parser/actions/workflows/pages.yml)

A fast, searchable list of every vacancy on the [DOU DefTech job board](https://deftech.dou.ua/jobs/), updated every day.

**Why?** The DefTech board shows only a few vacancies at a time, so you keep clicking "Більше вакансій" (More vacancies), and you can't search across all of them. This project collects every vacancy into one JSON file and puts it on a simple page where you can search everything instantly.

👉 **Live site:** https://gebeto.github.io/dou-parser/

## Features

- Finds every vacancy on the board, not just the first page
- Instant search across title, company, location and description
- Multi-word search: `react kyiv` finds jobs that contain *both* words
- Highlights matching words
- Search links you can share: https://gebeto.github.io/dou-parser/#q=react%20kyiv
- Dark mode follows your system setting
- Refreshes itself every day through GitHub Actions

## How it works

1. **Scrape**: [`index.js`](index.js) opens the job board and keeps loading more vacancies until there are none left, the same as clicking "More vacancies" by hand. It saves everything to `jobs.json`.
2. **Build**: [`build.js`](build.js) puts the search page ([`ui.html`](ui.html)) and `jobs.json` into the `dist/` folder.
3. **Publish**: a [GitHub Actions workflow](.github/workflows/pages.yml) runs both steps and uploads `dist/` to GitHub Pages.

## Requirements

- [Node.js](https://nodejs.org/) 20 or newer (22 recommended)
- npm (comes with Node.js)

## Getting started

```bash
git clone https://github.com/gebeto/dou-parser.git
cd dou-parser
npm install

npm start        # scrape all vacancies into jobs.json
npm run build    # copy the site into dist/
npm run serve    # preview at http://localhost:3000
```

While it scrapes, the progress looks like `loaded 120 / 450`. It finishes with `saved N jobs to jobs.json`.

## Output format

`jobs.json` is a list of vacancies. Each vacancy has these fields:

| Field         | Description                                 |
| ------------- | ------------------------------------------- |
| `title`       | Job title                                   |
| `description` | Short description from the listing          |
| `link`        | URL of the full vacancy on DOU              |
| `location`    | City or cities (may be empty for remote)    |
| `company`     | Hiring company                              |
| `date`        | Publication date, as shown on DOU (Ukrainian) |

Example:

```json
{
  "title": "Technical Writer",
  "description": "Шукаємо Technical Writer для забезпечення якісного документування результатів Discovery-фази Defence продукту…",
  "link": "https://deftech.dou.ua/jobs/companies/mod-of-ukraine/vacancies/377296/",
  "location": "Київ",
  "company": "Міністерство оборони України",
  "date": "20 жовтня"
}
```

## Project structure

```
.
├── index.js                    # scraper: deftech.dou.ua → jobs.json
├── build.js                    # copies ui.html + jobs.json into dist/
├── ui.html                     # the search page (one HTML file, no dependencies)
├── jobs.json                   # latest scraped data
└── .github/workflows/pages.yml # daily scrape + deploy to GitHub Pages
```

## Automatic updates

The workflow runs:

- on every push to `main`
- every day at 06:00 UTC
- by hand, from the **Actions** tab ("Run workflow")

To run it in your own fork, go to **Settings → Pages** and set **Source** to **GitHub Actions**.

## Limitations

- The scraper reads DOU's HTML. If DOU redesigns the site, the scraper may stop working until it's updated.
- It waits 300 ms between requests to keep the load on DOU light.
- The vacancy data belongs to DOU and the companies that posted it. This project only makes it easier to search.

## License

[MIT](LICENSE)

## Contact

Made by [@gebeto](https://github.com/gebeto). Found a bug or have an idea? [Open an issue](https://github.com/gebeto/dou-parser/issues).
