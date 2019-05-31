// Constants
var XML_SOURCES_FOLDER = 'pulter-poems/',
  SITE_BASE = 'pulter-site/',
  PRODUCTION_SITE_BASE = 'dist/',
  POEMS_DESTINATION_FOLDER = SITE_BASE + 'poems',
  EE_SUBFOLDER = '/ee',
  AE_SUBFOLDER = '/ae',
  VM_SUBFOLDER = '/vm',
  SEARCH_DOCS_DESTINATION_FOLDER = SITE_BASE + 'search',
  PULTER_POEM_MANIFEST_FILE_NAME = 'pulter-manifest.json',
  PULTER_POEM_MANIFEST_LOCATION = SITE_BASE + PULTER_POEM_MANIFEST_FILE_NAME,
  EE_TRANSFORMATION = SITE_BASE + 'xslt/poem-ee.xsl',
  AE_TRANSFORMATION = SITE_BASE + 'xslt/poem-ae.xsl',
  PSEUDO_TRANSFORMATION = SITE_BASE + 'xslt/poem-pseudo.xsl',
  VM_TRANSFORMATION = SITE_BASE + 'versioning-machine/src/vmachine.xsl',
  PP_SEARCH_DOC_TRANSFORMATION = SITE_BASE + 'xslt/search-ee.xsl',
  LUNR_INIT_PARTIAL = SITE_BASE + 'scripts/partials/_search-index-init.js',
  ELASTICLUNR_LIBRARY = './node_modules/elasticlunr/elasticlunr.min.js',
  LIVE_SITE_BASE_URL = '//pulterproject.northwestern.edu';

var appendPrepend = require('gulp-append-prepend');
var gulp = require('gulp');
var gulpUtil = require('gulp-util');
var concat = require('gulp-concat');
var dashify = require('dashify');
var debug = require('gulp-debug');
var flatMap = require('gulp-flatmap');
var fs = require('fs');
var sass = require('gulp-sass');
var sourceMaps = require('gulp-sourcemaps');
var loadJSON = require('load-json-file');
var minifyCSS = require('gulp-clean-css');
var browserSync = require('browser-sync').create();
var shell = require('gulp-shell');
var path = require('path');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var xslt = require('gulp-xslt2');

var vendorScripts = [
  'node_modules/jquery/dist/jquery.js',
  'node_modules/flowtype.js/flowtype.js',
  'node_modules/animejs/anime.min.js',
  'node_modules/featherlight/release/featherlight.min.js',
  'node_modules/imagesloaded/imagesloaded.pkgd.js',
  SITE_BASE + 'scripts/vendors/includes/smooth-scroll.js',
  SITE_BASE + 'scripts/vendors/includes/polyfills.js',
  'node_modules/drift-zoom/dist/Drift.min.js',
  'node_modules/isotope-layout/dist/isotope.pkgd.min.js',
  'node_modules/store2/dist/store2.min.js',
  'node_modules/store2/src/store.cache.js'
];

/* Utility functions */
function isNumber(obj) {
  return obj !== undefined && typeof(obj) === 'number' && !isNaN(obj);
}

function filterById(collection, id) {
  return collection.filter(function (item) {
    return +item.id === id;
  })
}

function getJSRedirectString(url, ignoreHash) {
  return '<!DOCTYPE html><html><head><link rel="canonical" href="' + LIVE_SITE_BASE_URL + url + '" /><script type=\"text/javascript\">var hash=window.location.hash.split(\"#\")[1];window.location.replace(\"' + url + (ignoreHash?'\"' : '\"+(hash?\"#\"+hash:\"\")') + ')</script></head><body></body></html>';
}

/* DEV Tasks */
gulp.task('browserSync', function (cb) {
  browserSync.init({
    server: {
      baseDir: SITE_BASE
    },
    options: {
      reloadDelay: 200
    },
    notify: true,
    logLevel: 'debug',
    logConnections: true,
    reloadDebounce: 200
  }, cb);
});

gulp.task('images-deploy', function () {
  return gulp.src([
    SITE_BASE + 'images/**/*',
    '!' + SITE_BASE + 'images/**/*.md',
    '!' + SITE_BASE + 'images/**/*.codekit3'
  ])
    .pipe(plumber())
    .pipe(gulp.dest(PRODUCTION_SITE_BASE + 'images'));
});

gulp.task('vendor-scripts', function () {
  return gulp.src(vendorScripts)
    .pipe(plumber())
    .pipe(concat('vendors.js'))
    .on('error', gulpUtil.log)
    .pipe(gulp.dest(SITE_BASE + 'scripts/vendors'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('vendor-scripts-deploy', function () {
  return gulp.src(vendorScripts)
    .pipe(plumber())
    .pipe(concat('vendors.js'))
    .on('error', gulpUtil.log)
    .pipe(uglify())
    .pipe(gulp.dest(PRODUCTION_SITE_BASE + 'scripts/vendors'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('scripts', function () {
  return gulp.src([
    SITE_BASE + 'scripts/src/**/*.js'
  ])
    .pipe(plumber())
    .pipe(concat('app.js'))
    .on('error', gulpUtil.log)
    .pipe(gulp.dest(SITE_BASE + 'scripts'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('scripts-deploy', function () {
  return gulp.src([
    SITE_BASE + 'scripts/src/**/*.js'
  ])
    .pipe(plumber())
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest(PRODUCTION_SITE_BASE + 'scripts'));
});

gulp.task('styles', function () {
  return gulp.src(SITE_BASE + 'styles/scss/pulter.scss')
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(sourceMaps.init())
    .pipe(sass({
      errLogToConsole: true,
      includePaths: [
        SITE_BASE + 'styles/scss/'
      ]
    }))
    .pipe(plumber())
    .on('error', gulpUtil.log)
    .pipe(concat('styles.css'))
    .pipe(sourceMaps.write())
    .pipe(gulp.dest(SITE_BASE + 'styles'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('styles-deploy', function () {
  return gulp.src(SITE_BASE + 'styles/scss/pulter.scss')
    .pipe(plumber())
    .pipe(sass({
      includePaths: [
        SITE_BASE + 'styles/scss'
      ]
    }))
    .pipe(concat('styles.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest(PRODUCTION_SITE_BASE + 'styles'));
});

gulp.task('html', function () {
  return gulp.src(SITE_BASE + '*.html')
    .pipe(plumber())
    .pipe(browserSync.reload({stream: true}))
    .on('error', gulpUtil.log);
});

// Move over production ready files
gulp.task('files-deploy', function (done) {
  gulp.src([
    SITE_BASE + '*',
    '!'+ SITE_BASE +'xslt',
    '!'+ SITE_BASE +'pages'
  ])
    .pipe(plumber())
    .pipe(gulp.dest(PRODUCTION_SITE_BASE));

  // Copy poems
  gulp.src(SITE_BASE + 'poems/**/*')
    .pipe(plumber())
    .pipe(gulp.dest(PRODUCTION_SITE_BASE + 'poems'));

  // Copy curations
  gulp.src(SITE_BASE + 'curations/**/*')
    .pipe(plumber())
    .pipe(gulp.dest(PRODUCTION_SITE_BASE + 'curations'));

  // Copy explorations
  gulp.src(SITE_BASE + 'explorations/**/*')
    .pipe(plumber())
    .pipe(gulp.dest(PRODUCTION_SITE_BASE + 'explorations'));

  // Copy pages
  gulp.src(SITE_BASE + 'pages/*')
    .pipe(plumber())
    .pipe(gulp.dest(PRODUCTION_SITE_BASE));

  // Copy what we need from VM
  gulp.src([
    SITE_BASE + 'versioning-machine/**/*',
    '!' + SITE_BASE + '/versioning-machine/schema/**'
  ], { nodir: true })
    .pipe(plumber())
    .pipe(gulp.dest(PRODUCTION_SITE_BASE + 'versioning-machine'));

  // Copy the manifest
  gulp.src(PULTER_POEM_MANIFEST_LOCATION)
    .pipe(plumber())
    .pipe(gulp.dest(PRODUCTION_SITE_BASE));

  // Copy the Elemental Edition search script
  gulp.src(SITE_BASE + 'search/ee-search.js', { allowEmpty: true })
    .pipe(plumber())
    .pipe(gulp.dest(PRODUCTION_SITE_BASE + 'search'));

  // Copy Google verification for
  gulp.src(SITE_BASE + 'google1cf954f664c9b7de.html')
    .pipe(plumber())
    .pipe(gulp.dest(PRODUCTION_SITE_BASE));

  // Copy the fonts
  gulp.src(SITE_BASE + 'fonts/**/*')
    .pipe(plumber())
    .pipe(gulp.dest(PRODUCTION_SITE_BASE + 'fonts'));

  done();
});

gulp.task('clean', shell.task('rm -rf ' + PRODUCTION_SITE_BASE));

gulp.task('default',
  gulp.series(
    'browserSync',
    'vendor-scripts',
    'scripts',
    'styles', function () {
      gulp.watch(SITE_BASE + 'scripts/src/**', gulp.series('scripts'));
      gulp.watch(SITE_BASE + 'styles/scss/**', gulp.series('styles'));
      gulp.watch(SITE_BASE + 'versioning-machine/**/*.css').on('change', browserSync.reload);
      gulp.watch(SITE_BASE + '**/*.html', gulp.series('html'));
    })
);

gulp.task('deploy', gulp.series('clean', gulp.parallel('vendor-scripts-deploy', 'scripts-deploy', 'styles-deploy', 'images-deploy'), 'files-deploy', (done) => {
  done();
}));

/* XSLT Tasks */
gulp.task('xslt:erase', function(done) {
  shell.task([
    'rm -rf ' + POEMS_DESTINATION_FOLDER,
    'rm -rf ' + SEARCH_DOCS_DESTINATION_FOLDER
  ]);

  done();
});

gulp.task('xslt:index', function () {
  return gulp.src(SITE_BASE + 'xslt/_poemsHTML.xml')
    .pipe(debug())
    .pipe(xslt(SITE_BASE + 'xslt/poems.xsl'))
    .pipe(concat('index.html'))
    .pipe(gulp.dest(SITE_BASE));
});

gulp.task('xslt:manifest', function () {
  return gulp.src(SITE_BASE + 'xslt/_poemsJSON.xml')
    .pipe(debug())
    .pipe(xslt(SITE_BASE + 'xslt/poems.xsl'))
    .pipe(concat(PULTER_POEM_MANIFEST_FILE_NAME))
    .pipe(gulp.dest(SITE_BASE));
});

gulp.task('xslt:lunrBuildSearchIndex', function () {
  return Promise.all([
    loadJSON(PULTER_POEM_MANIFEST_LOCATION).then(
      function (data) {
        var poemsInManifest = data;
        return gulp.src(XML_SOURCES_FOLDER + 'pulter_*.xml')
          .pipe(flatMap(function (stream, xmlFile) {
            var fileName = path.basename(xmlFile.path),
              poemId = fileName
                .replace(/\.[^/.]+$/, '')
                .replace('pulter_', '');
            poemId = +poemId;

            var filtered = filterById(poemsInManifest, poemId);
            var isPublished = filtered.length > 0 && filtered[0].isPublished;
            var isPseudo = filtered[0] ? (filtered[0].hasOwnProperty('isPseudo')) : false;

            if (isPublished && !isPseudo && isNumber(poemId)) {
              return gulp.src(xmlFile.path)
                .pipe(xslt(PP_SEARCH_DOC_TRANSFORMATION))
                .pipe(plumber())
                .pipe(rename('doc_' + poemId + '.js'))
            } else {
              return gulp.src('blank.txt', { allowEmpty: true });
            }
          }))
          .pipe(concat('ee-search.js'))
          .pipe(appendPrepend.prependFile(LUNR_INIT_PARTIAL))
          .pipe(appendPrepend.prependFile(ELASTICLUNR_LIBRARY))
          .pipe(gulp.dest(SITE_BASE + 'search'));
      }, function () {
        console.log('ERROR: couldn\'t load the poem manifest!');
        return gulpUtil.noop();
      })
  ]);
});

gulp.task('xslt:lunr', gulp.series('xslt:erase', 'xslt:lunrBuildSearchIndex', (done) => {
  done();
}));

gulp.task('sitemap', function () {
  var prefix = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  var suffix = '</urlset>';
  var protocol = 'http:';

  var pages = [
    protocol + LIVE_SITE_BASE_URL + '/',
    protocol + LIVE_SITE_BASE_URL + '/#poems',
    protocol + LIVE_SITE_BASE_URL + '/about-hester-pulter-and-the-manuscript.html',
    protocol + LIVE_SITE_BASE_URL + '/about-project-conventions.html',
    protocol + LIVE_SITE_BASE_URL + '/about-the-project.html',
    protocol + LIVE_SITE_BASE_URL + '/how-to-cite-the-pulter-project.html',
    protocol + LIVE_SITE_BASE_URL + '/scholarship.html'
  ];

  return Promise.all([
    loadJSON(PULTER_POEM_MANIFEST_LOCATION).then(
      function (data) {
        console.log('Hi! Sitemap Builder is here!');
        var publishedPoems = data.filter(function (poemObj) {
          return poemObj.isPublished;
        });
        var poemUrls = [];
        var triads = publishedPoems.map(function (poemObject) {
          var slug = dashify(poemObject.seo, { condense: true });

          return [
            protocol + LIVE_SITE_BASE_URL + '/poems/ee/' + slug + '/',
            protocol + LIVE_SITE_BASE_URL + '/poems/ae/' + slug + '/',
            protocol + LIVE_SITE_BASE_URL + '/poems/vm/' + slug + '/'
          ]
        });

        var length = triads.length;
        for (var i = 0; i < length; i++) {
          poemUrls = poemUrls.concat(triads[i]);
        }

        var curations = fs.readdirSync(SITE_BASE + 'curations')
          .filter(function (itemName) {
            var publishedWithThisId = [];
            var id = +itemName.split('-')[0].slice(1);

            if (typeof id === 'number' && !isNaN(id)) {
              publishedWithThisId = publishedPoems.filter(function (poem) {
                return +poem.id === id;
              });
            }

            return (itemName.indexOf('.html') > -1 && publishedWithThisId.length);
          })
          .map(function (curationFileName) {
            return protocol + LIVE_SITE_BASE_URL + '/curations/' + curationFileName;
          });

        var explorations = fs.readdirSync(SITE_BASE + 'explorations')
          .filter(function (itemName) { return itemName.indexOf('.html') > -1; })
          .map(function (curationFileName) {
            return protocol + LIVE_SITE_BASE_URL + '/explorations/' + curationFileName;
          });

        var urls = pages.concat(poemUrls, curations, explorations);

        urls = urls.map(function (url) {
          var priority = .5;

          if (url.indexOf('//pulterproject.northwestern.edu/#poems') > -1) {
            priority = .75;
          }

          if (
            url.indexOf('curations') > -1 ||
            url.indexOf('explorations') > -1
          ) {
            priority = .33;
          }

          if (url.indexOf('/poems/vm') > -1) {
            priority = .25
          }

          if (url.indexOf('/poems/ae') > -1) {
            priority = .45
          }

          return '<url><loc>' + url + '</loc><priority>' + priority + '</priority></url>';
        }).join('\n');

        var stream = source('null.xml');
        stream.end(prefix + urls + suffix);
        stream
          .pipe(rename('site.xml'))
          .pipe(gulp.dest(SITE_BASE));
      }, function () {
        console.log('ERROR: couldn\'t load the poem manifest!');
        return gulpUtil.noop();
      })
  ]);
});

gulp.task('xslt:poems', function () {
  // Silence ./poems/
  var streamN = source('null.html');
  streamN.end(getJSRedirectString('/#poems', true));
  streamN.pipe(rename('/index.html'))
    .pipe(gulp.dest(POEMS_DESTINATION_FOLDER));

  // Silence ./poems/ee
  var streamEE = source('null.html');
  streamEE.end(getJSRedirectString('/poems' + EE_SUBFOLDER + '/1', true));
  streamEE.pipe(rename('/index.html'))
    .pipe(gulp.dest(POEMS_DESTINATION_FOLDER + EE_SUBFOLDER));

  // Silence ./poems/ae
  var streamAE = source('null.html');
  streamAE.end(getJSRedirectString('/poems' + AE_SUBFOLDER + '/1', true));
  streamAE.pipe(rename('/index.html'))
    .pipe(gulp.dest(POEMS_DESTINATION_FOLDER + AE_SUBFOLDER));

  // Silence ./poems/vm
  var streamVM = source('null.html');
  streamVM.end(getJSRedirectString('/poems' + VM_SUBFOLDER + '/1', true));
  streamVM.pipe(rename('/index.html'))
    .pipe(gulp.dest(POEMS_DESTINATION_FOLDER + VM_SUBFOLDER));

  return Promise.all([
    loadJSON(PULTER_POEM_MANIFEST_LOCATION).then(
      function (data) {
        console.log('Hi! EE Publisher is here!');
        var poemsInManifest = data;
        console.log('Poems in the manifest: ' + poemsInManifest.length + '.');

        return gulp.src(XML_SOURCES_FOLDER + 'pulter_*.xml')
          .pipe(flatMap(function (stream, xmlFile) {
            console.log('|');

            var fileName = path.basename(xmlFile.path),
              poemId = fileName
                .replace(/\.[^/.]+$/, '')
                .replace('pulter_', '');
            poemId = +poemId;
            console.log('Poem #' + poemId + ', Elemental Edition.');
            console.log('Source: ' + fileName);

            var filtered = filterById(poemsInManifest, poemId);
            var isPublished = filtered.length > 0;

            console.log(isPublished ? '✓Published to' : '𐄂Not published');

            if (isPublished && isNumber(poemId)) {
              var poemObject = filtered[0];
              var slug = poemObject.seo;

              slug = slug ?
                dashify(slug, {condense: true}) :
                'poem-' + poemId;

              console.log('https:' + LIVE_SITE_BASE_URL + '/poems' + EE_SUBFOLDER + '/' + slug);

              // Write /poems/{$edition}/{$id} redirect page
              var stream1 = source('redirect.html');
              stream1.end(getJSRedirectString('/poems' + EE_SUBFOLDER + '/' + slug));
              stream1
                .pipe(rename(poemId + '/index.html'))
                .pipe(gulp.dest(POEMS_DESTINATION_FOLDER + EE_SUBFOLDER));

              // Write /poems/{$id} redirect page to EE
              var stream2 = source('redirect.html');
              stream2.end(getJSRedirectString('/poems' + EE_SUBFOLDER + '/' + slug));
              stream2
                .pipe(rename(poemId + '/index.html'))
                .pipe(gulp.dest(POEMS_DESTINATION_FOLDER));

              // Write SEO friendly page
              return gulp.src(xmlFile.path)
                .pipe(
                  xslt(
                    poemObject.isPseudo ?
                      PSEUDO_TRANSFORMATION :
                      EE_TRANSFORMATION
                  )
                )
                .pipe(plumber())
                .pipe(rename(slug + '/index.html'))
            } else {
              return gulp.src('blank.txt');
            }
          }))
          .pipe(gulp.dest(POEMS_DESTINATION_FOLDER + EE_SUBFOLDER));
      }, function () {
        console.log('ERROR: couldn\'t load the poem manifest!');
        return gulpUtil.noop();
      }),

    loadJSON(PULTER_POEM_MANIFEST_LOCATION).then(
      function (data) {
        console.log('Hi! AE Publisher is here!');
        var poemsInManifest = data;

        return gulp.src(XML_SOURCES_FOLDER + 'pulter_*.xml')
          .pipe(flatMap(function (stream, xmlFile) {
            console.log('|');

            var fileName = path.basename(xmlFile.path),
              poemId = fileName
                .replace(/\.[^/.]+$/, '')
                .replace('pulter_', '');
            poemId = +poemId;
            console.log('Poem #' + poemId + ', Amplified Edition.');
            console.log('Source: ' + fileName);

            var filtered = filterById(poemsInManifest, poemId);
            var isPublished = filtered.length > 0;

            console.log(isPublished ? '✓Published to' : '𐄂Not published');

            if (isPublished && isNumber(poemId)) {
              var poemObject = filtered[0];
              var slug = poemObject.seo;

              slug = slug ?
                dashify(slug, {condense: true}) :
                'poem-' + poemId;

              console.log('https:' + LIVE_SITE_BASE_URL + '/poems' + AE_SUBFOLDER + '/' + slug);

              // Write the redirect page
              var streamN = source('redirect.html');
              streamN.end(getJSRedirectString('/poems' + AE_SUBFOLDER + '/' + slug));
              streamN
                .pipe(rename(poemId + '/index.html'))
                .pipe(gulp.dest(POEMS_DESTINATION_FOLDER + AE_SUBFOLDER));

              // Write SEO friendly page
              return gulp.src(xmlFile.path)
                .pipe(
                  xslt(
                    poemObject.isPseudo ?
                      PSEUDO_TRANSFORMATION :
                      AE_TRANSFORMATION
                  )
                )
                .pipe(plumber())
                .pipe(rename(slug + '/index.html'))
            } else {
              return gulp.src('blank.txt');
            }
          }))
          .pipe(gulp.dest(POEMS_DESTINATION_FOLDER + AE_SUBFOLDER));
      }, function () {
        console.log('ERROR: couldn\'t load the poem manifest!');
        return gulpUtil.noop();
      }),

    loadJSON(PULTER_POEM_MANIFEST_LOCATION).then(
      function (data) {
        console.log('Hi! VM Publisher is here!');
        var poemsInManifest = data;

        return gulp.src(XML_SOURCES_FOLDER + 'pulter_*.xml')
          .pipe(flatMap(function (stream, xmlFile) {
            console.log('|');

            var fileName = path.basename(xmlFile.path),
              poemId = fileName
                .replace(/\.[^/.]+$/, '')
                .replace('pulter_', '');
            poemId = +poemId;
            console.log('Poem #' + poemId + ', VM page.');
            console.log('Source: ' + fileName);

            var filtered = filterById(poemsInManifest, poemId);
            var isPublished = filtered.length > 0;

            console.log(isPublished ? '✓Published to' : '𐄂Not published');

            if (isPublished && isNumber(poemId)) {
              var poemObject = filtered[0];
              var slug = poemObject.seo;

              slug = slug ?
                dashify(slug, {condense: true}) :
                'poem-' + poemId;

              console.log('http:' + LIVE_SITE_BASE_URL + '/poems' + VM_SUBFOLDER + '/' + slug);

              // Write the redirect page
              var streamN = source('redirect.html');
              streamN.end(getJSRedirectString('/poems' + VM_SUBFOLDER + '/' + slug));
              streamN
                .pipe(rename(poemId + '/index.html'))
                .pipe(gulp.dest(POEMS_DESTINATION_FOLDER + VM_SUBFOLDER));

              // Write SEO friendly page
              return gulp.src(xmlFile.path)
                .pipe(xslt(VM_TRANSFORMATION))
                .pipe(plumber())
                .pipe(rename(slug + '/index.html'))
            } else {
              return gulp.src('blank.txt');
            }
          }))
          .pipe(gulp.dest(POEMS_DESTINATION_FOLDER + VM_SUBFOLDER));
      }, function () {
        console.log('ERROR: couldn\'t load the poem manifest!');
        return gulpUtil.noop();
      })
  ]);
});

gulp.task('xslt', gulp.series('xslt:erase', 'xslt:manifest', 'xslt:index', 'xslt:lunr', 'xslt:poems', 'sitemap', (done) => {
  done();
}));
