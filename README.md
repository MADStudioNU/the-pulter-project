# The Pulter Project Central

## Welcome
This repository contains everything the project needs to live and evolve except two image collections: manuscript facsimiles ("facs" folder which is [currently on Box](https://northwestern.app.box.com/folder/30331780748)) and [poem posters](https://github.com/MADStudioNU/the-pulter-project-posters).

## For the Editors
These are the folders of the utmost interest for the contributing parties, as well as the editors:
* `/pulter-poems` — TEI XML encoded poems, the gold;
* `/pulter-site/pages` — static pages of the site;
* `/pulter-site/curations` — poem curations (HTML pages);
* `/pulter-site/explorations` — explorations (HTML pages).

## For the Developers
### How to Start
1. Make sure your machine has Node 8 (use [nvm](https://github.com/nvm-sh/nvm) to manage multiple Node versions) 
2. As well as [Java 8 runtime](https://adoptopenjdk.net/) installed.
3. Install gulp-cli tool globally: `npm install gulp-cli -g`.
4. Run `yarn install`.

You should have the following terminal commands available:
* `gulp` — boots up the development web server with automatic JS/CSS compilation and browser reloading; this it the default mode for active development;
* `gulp xslt:poems` — builds an array of HTML pages representing the whole corpus of the poems and their editions; the generated structure goes under `/poems`;
* `gulp xslt:manifest` — builds JSON manifest (`/pulter-manifest.json`) of the poems;
* `gulp xslt:index` — builds the main index page;
* `gulp xslt:lunr` — builds the search functionality;
* `gulp xslt` — runs all the commands from `xslt` namespace; re-compiles the whole site;
* `gulp deploy` — builds a production version of the site and puts it in `/dist`.

### Development and Production
Branch `develop` is deployed to the ["preview site"](https://pulterproject-dev-4slasb7dfnyuier8z7y2.netlify.app/#poems).

Install Netlify CLI tool: `npm install netlify-cli -g. Log in using [TPP's credentials](https://slate.weinberg.northwestern.edu/display/FCS/Pulter+Project+Internet+Accounts).

Use this one-liner to publish the site: `gulp xslt:manifest; gulp xslt; gulp deploy; netlify deploy -p -d dist/;`.

Branch `master` is deployed to the [production site](https://pulterproject.northwestern.edu/#poems).

#### Current Delta
Poems that are published on the preview site but not on the production site.
> c12 A55
