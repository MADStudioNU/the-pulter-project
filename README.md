# _The Pulter Project_ Central

## Welcome
This repository contains the codebase of [The Pulter Project](https://pulterproject.northwestern.edu/). Two image collections and a family tree browser tool are included in the form of submodules:
* [Poem Poster Images](https://github.com/MADStudioNU/the-pulter-project-posters)
* [Manuscript Facsimile Images](https://github.com/MADStudioNU/the-pulter-project-facs)

## Encoders

### Style Guide
[This collection of pages](https://github.com/MADStudioNU/the-pulter-project/wiki) provides guidance on various aspects of TPP content encoding.

### Files
These are the folders of interest for the contributing parties (encoders, editors, etc.):
* `/pulter-poems` — TEI XML encoded poems, the gold;
* `/pulter-site/pages` — static pages of the site;
* `/pulter-site/curations` — poem curations (HTML pages);
* `/pulter-site/explorations` — explorations (HTML pages).

## Developers
### Local Setup
1. Make sure your machine has Node.js (use [nvm](https://github.com/nvm-sh/nvm) to manage multiple Node versions)
2. Install gulp-cli tool globally: `npm install gulp-cli -g`.
3. Install [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable).
4. Run `yarn`.

### Available CLI Commands
* `gulp` — boots up the development web server with automatic JS/CSS compilation and browser reloading; this it the default mode for active development;
* `gulp xslt:poems` — builds an array of HTML pages representing the whole corpus of the poems and their editions; the generated structure goes under `/poems`;
* `gulp xslt:poems:ae --single 'pulter_078.xml'` — run the transformation for a single poem;
* `gulp xslt:manifest` — builds JSON manifest (`/pulter-manifest.json`) of the poems;
* `gulp xslt:index` — builds the main index page;
* `gulp xslt:search` — builds the search functionality;
* `gulp xslt` — runs all the commands from `xslt` namespace; re-compiles the whole site;
* `gulp build` — builds a production version of the site and puts it in `/dist`.

## Deployments

### Development Instance
[![CI/CD](https://github.com/MADStudioNU/the-pulter-project/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/MADStudioNU/the-pulter-project/actions/workflows/ci-cd.yml)

Branch `develop` is built and deployed to the ["preview site"](https://pulterproject-preview-c7ga82m1pzxmbn.netlify.app/#poems) on every push that changes files in these folders: `./pulter-poems` and `./pulter-site`. Encoder may choose to skip the build by including `[skip ci]` in the commit message.

It is also possible to deploy directly to Netlify by running `npm run build; netlify deploy -p -d dist/;`.

### Staging Instance
Branch `master` is automatically deployed to the [AWS S3 staging site](http://mads-static-sites-dev-pulterproject-dev.s3-website.us-east-2.amazonaws.com). This instance is used to verify that the build you are about to deploy to prod looks/works as intended.

### Production Instance
[![CI/CD](https://github.com/MADStudioNU/the-pulter-project/actions/workflows/ci-cd.yml/badge.svg?branch=master)](https://github.com/MADStudioNU/the-pulter-project/actions/workflows/ci-cd.yml)

Branch `master` is deployed to the [AWS S3 production site](https://pulterproject.northwestern.edu/#poems) upon review of the staging site and a sign-off from @sergei-kalugin, @emwitty or @lhn4977.

## Current Delta
This keeps track of an important difference between deployments. Below is the content published on the preview site but _not_ on the production site.

### Poems
> A110 (_Aristomenes_ by Tara L. Lyons)

### Curations
> C110a (_Aristomenes in History_ by Tara L. Lyons)

### Explorations
> —
