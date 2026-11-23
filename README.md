# Better Ocampo

Independent community guide for the Municipality of Ocampo, Camarines Sur. This is not a municipal website. No municipal website was found when this was checked. Public updates from the LGU are on the [LGU Facebook page](https://www.facebook.com/101706771551898).

The site is published at [https://www.betterocampo.org](https://www.betterocampo.org). The repository is [github.com/ejsinfuego/betterocampo](https://github.com/ejsinfuego/betterocampo). It started from the [Better Local Gov](https://github.com/iyanski/betterlocalgov) starter.

Service guides do not copy another city's offices, fees, or schedules. Local fees, collection days, and service hotlines stay blank until a public source is checked. Office numbers and emails on the contact page are the ones that could be read from the LGU directory. The header lists PNP, BFP, RHU, and MDRRMO numbers confirmed with the LGU, plus national 911. Office mobiles on the contact page can differ.

The interface is English. Other language files are not published yet.

## Develop

Requirements: Node.js 18+, npm, and Git.

```bash
git clone https://github.com/ejsinfuego/betterocampo.git
cd betterocampo
npm install
npm run dev
```

Open `http://localhost:5173`.

| Script                  | What it does                                         |
| ----------------------- | ---------------------------------------------------- |
| `npm run dev`           | Rebuild the search index and start the dev server    |
| `npm run build`         | Typecheck and production build                       |
| `npm run preview`       | Preview the production build                         |
| `npm run lint`          | Run ESLint                                           |
| `npm run format`        | Format with Prettier                                 |
| `npm run index-content` | Rebuild `src/data/search-index.json` and the sitemap |

Search is a local MiniSearch index. See [docs/search.md](docs/search.md).

## Content

```
content/services/       Service guides (markdown) and category lists (YAML)
content/government/     Officials, budget, ordinances, and contact pages
src/data/services.yaml  Service categories shown in the app
src/data/government.yaml
```

A page can have a companion JSON file with the same slug. `{PLACEHOLDER}` tokens in the markdown are replaced from that JSON, then from `VITE_<KEY>` environment variables. `content/government/departments/executive.json` fills the mayor and vice mayor fields.

`npm run index-content` reads those JSON files when it builds the search index. Re-run it after editing content.

## Contributing

Open an issue or pull request on [ejsinfuego/betterocampo](https://github.com/ejsinfuego/betterocampo).

- Leave a fee, schedule, or hotline blank when you cannot point to a public source.
- Do not leave `TODO` notes in a markdown page. Those lines are rendered on the site.
- Do not publish a phone number or email when digits or letters in the source could not be read.

## License

[CC0 1.0](LICENSE).
