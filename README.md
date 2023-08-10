# The Pulter Project Central

## Welcome
This repository contains the codebase of [The Pulter Project](https://pulterproject.northwestern.edu/). Two large image collections are included in the form of submodules:
* [Poem Poster Images](https://github.com/MADStudioNU/the-pulter-project-posters)
* [Manuscript Facsimile Images](https://github.com/MADStudioNU/the-pulter-project-facs)

## For the Editors
These are the folders of interest for the contributing parties, as well as the editors:
* `/pulter-poems` — TEI XML encoded poems, the gold;
* `/pulter-site/pages` — static pages of the site;
* `/pulter-site/curations` — poem curations (HTML pages);
* `/pulter-site/explorations` — explorations (HTML pages).

## For the Developers
### How to Start
1. Make sure your machine has Node.js (use [nvm](https://github.com/nvm-sh/nvm) to manage multiple Node versions)
2. Install gulp-cli tool globally: `npm install gulp-cli -g`.
3. Install [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable).
4. Run `yarn`.

You should have the following terminal commands available:
* `gulp` — boots up the development web server with automatic JS/CSS compilation and browser reloading; this it the default mode for active development;
* `gulp xslt:poems` — builds an array of HTML pages representing the whole corpus of the poems and their editions; the generated structure goes under `/poems`;
* `gulp xslt:manifest` — builds JSON manifest (`/pulter-manifest.json`) of the poems;
* `gulp xslt:index` — builds the main index page;
* `gulp xslt:search` — builds the search functionality;
* `gulp xslt` — runs all the commands from `xslt` namespace; re-compiles the whole site;
* `gulp build` — builds a production version of the site and puts it in `/dist`.

### Development Instance
[![CI/CD](https://github.com/MADStudioNU/the-pulter-project/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/MADStudioNU/the-pulter-project/actions/workflows/ci-cd.yml)

Branch `develop` is built and deployed to the ["preview site"](https://pulterproject-preview-c7ga82m1pzxmbn.netlify.app/#poems) on every push with changes withing these folders: `./pulter-poems` and `./pulter-site`. The commiter may choose to skip the build by including `[skip ci]` string in the commit message.

Or use this one-liner to deploy to Netlify manually: `npm run build; netlify deploy -p -d dist/;`.

### Staging Instance
Branch `master` is automatically deployed to the [AWS S3 staging site](http://mads-static-sites-dev-pulterproject-dev.s3-website.us-east-2.amazonaws.com).

### Production Instance
[![CI/CD](https://github.com/MADStudioNU/the-pulter-project/actions/workflows/ci-cd.yml/badge.svg?branch=master)](https://github.com/MADStudioNU/the-pulter-project/actions/workflows/ci-cd.yml)

Branch `master` is deployed to the [AWS S3 production site](https://pulterproject.northwestern.edu/#poems) upon review of the staging site and a sign-off from @sergei-kalugin.

### Current Delta
Poems that are published on the preview site but not on the production site:
> A040 (Hatton), A083 (Ward)

Curations:
> C040a (Hatton), C040b (Hatton)

Explorations:
> —
