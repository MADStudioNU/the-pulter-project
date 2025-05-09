const XML_SOURCES_FOLDER = 'pulter-poems/';
const SITE_BASE = 'pulter-site/';
const PRODUCTION_SITE_BASE = 'dist/';
const POEMS_DESTINATION_FOLDER = SITE_BASE + 'poems';
const EE_SUBFOLDER = '/ee';
const AE_SUBFOLDER = '/ae';
const VM_SUBFOLDER = '/vm';
const SEARCH_FOLDER = SITE_BASE + 'search';
const PULTER_POEM_MANIFEST_FILE_NAME = 'pulter-manifest.json';
const PULTER_POEM_MANIFEST_LOCATION = SITE_BASE + PULTER_POEM_MANIFEST_FILE_NAME;
const EE_TRANSFORMATION = SITE_BASE + 'xslt/poem-ee.xsl';
const AE_TRANSFORMATION = SITE_BASE + 'xslt/poem-ae.xsl';
const PSEUDO_TRANSFORMATION = SITE_BASE + 'xslt/poem-pseudo.xsl';
const VM_TRANSFORMATION = SITE_BASE + 'versioning-machine/src/vmachine.xsl';
const PP_SEARCH_EE_TRANSFORMATION = SITE_BASE + 'xslt/search-ee.xsl';
const PP_SEARCH_AE_TRANSFORMATION = SITE_BASE + 'xslt/search-ae.xsl';
const PP_SEARCH_CURATION_TRANSFORMATION = SITE_BASE + 'xslt/search-curation.xsl';
const PP_SEARCH_EXPLORATION_TRANSFORMATION = SITE_BASE + 'xslt/search-exploration.xsl';
const LUNR_INIT_PARTIAL = SITE_BASE + 'scripts/partials/_search-index-init.js';
const ELASTICLUNR_LIBRARY = './node_modules/elasticlunr/elasticlunr.min.js';
const LIVE_SITE_BASE_URL = '//pulterproject.northwestern.edu';
const SINGLE_POEM_TRANSFORMATION_FLAG = 'single';

// Vendor scripts
const vendorScripts = [
  'node_modules/jquery/dist/jquery.min.js',
  'node_modules/animejs/anime.min.js',
  'node_modules/featherlight/release/featherlight.min.js',
  'node_modules/imagesloaded/imagesloaded.pkgd.min.js',
  SITE_BASE + 'scripts/vendors/includes/smooth-scroll.min.js',
  SITE_BASE + 'scripts/vendors/includes/polyfills.min.js',
  'node_modules/drift-zoom/dist/Drift.min.js',
  'node_modules/isotope-layout/dist/isotope.pkgd.min.js',
  'node_modules/isotope-packery/packery-mode.pkgd.min.js',
  'node_modules/store2/dist/store2.min.js',
  'node_modules/store2/src/store.cache.js'
];

// Modules
const appendPrepend = require('gulp-append-prepend');
const gulp = require('gulp');
const concat = require('gulp-concat');
const dashify = require('dashify');
const flatMap = require('gulp-flatmap');
const fs = require('fs');
const sass = require('gulp-sass')(require('sass'));
const sourceMaps = require('gulp-sourcemaps');
const minifyCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();
const path = require('path');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const source = require('vinyl-source-stream');
const childProcess = require('child_process');
const uglify = require('gulp-uglify');
const xslt = require('gulp-xsltproc');
const argv = require('yargs').argv;
const es = require('event-stream');
const _ = require('lodash');
let filter; // will use dynamic import to use this

// Variable to hold the current value of the poem manifest
let _manifest;

// App version
let _version;

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

function getXSLTProcOptions(xslFileName, isHTML) {
  return {
    warning_as_error: true,
    metadata: false,
    stylesheet: xslFileName,
    debug: true,
    maxBuffer: undefined,
    inputIsHTML: isHTML
  }
}

// Manifest-related tasks and functions
gulp.task('xslt:manifest', function () {
  return gulp.src(SITE_BASE + 'xslt/_poemsJSON.xml')
    .pipe(xslt(getXSLTProcOptions(SITE_BASE + 'xslt/poems.xsl')))
    .pipe(concat(PULTER_POEM_MANIFEST_FILE_NAME))
    .pipe(gulp.dest(SITE_BASE));
});

gulp.task('xslt:processManifest', function () {
    return gulp.src(PULTER_POEM_MANIFEST_LOCATION)
      .pipe(optimizeManifest())
      .pipe(gulp.dest(SITE_BASE));
  }
);

gulp.task('getManifest',
  gulp.series(
    'xslt:manifest',
    'xslt:processManifest',
    function () {
      return gulp.src(PULTER_POEM_MANIFEST_LOCATION)
        .pipe(flatMap(function (stream, file) {
          _manifest = JSON.parse(file.contents.toString('utf-8'));
          return stream;
        }));
    })
);

function optimizeManifest () {
  return es.map(function (file, cb) {
    let json = JSON.parse(file.contents.toString('utf-8'));

    // Process the manifest
    if (json.connections) {
      // Remove elements that are empty strings (aka unpublished connections)
      if (json.connections.published) {
        json.connections.published = _.compact(json.connections.published);
      }

      if (json.connections.contributors) {
        json.connections.contributors = _.uniq(json.connections.contributors)
          .sort()
          .map((contributor) => {
            return {
              displayName: contributor.trim(),
              className: dashify(contributor.trim(), {condense: true})
            }
          })
      }

      if (json.connections.keywords) {
        json.connections.keywords = _.uniq(json.connections.keywords)
          .sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          })
          .map((keyword) => {
            return {
              displayName: keyword.trim(),
              className: dashify(keyword.trim(), {condense: true})
            }
          })
      }
    }

    // Update the vinyl file contents
    file.contents = new Buffer(JSON.stringify(json));

    // Send the updated file down the pipe
    cb(null, file);
  })
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
    .pipe(gulp.dest(SITE_BASE + 'scripts/vendors'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('vendor-scripts-deploy', function () {
  return gulp.src(vendorScripts)
    .pipe(plumber())
    .pipe(concat('vendors.js'))
    .pipe(uglify())
    .pipe(gulp.dest(PRODUCTION_SITE_BASE + 'scripts/vendors'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('getVersion', function () {
  return gulp.src('./package.json')
    .pipe(flatMap(function (stream, file) {
      _version = JSON.parse(file.contents.toString('utf-8')).version;
      console.log(_version);
      return stream;
    }));
});

gulp.task('scripts',
  gulp.series(
    'getVersion',
    function () {
      return gulp.src([
        SITE_BASE + 'scripts/src/*.js'
      ])
        .pipe(plumber())
        .pipe(concat('app.js'))
        .pipe(
          replace(
            'version: undefined',
            `version: '${_version}'`
          )
        )
        .pipe(gulp.dest(SITE_BASE + 'scripts'))
        .pipe(browserSync.reload({stream: true}));
    }
  )
);

gulp.task('scripts-deploy',
  gulp.series(
    'getVersion',
    function () {
      return gulp.src([
        SITE_BASE + 'scripts/src/*.js'
      ])
        .pipe(plumber())
        .pipe(concat('app.js'))
        .pipe(
          replace(
            'version: undefined',
            `version: '${_version}'`
          )
        )
        .pipe(uglify())
        .pipe(gulp.dest(PRODUCTION_SITE_BASE + 'scripts'));
    }
  )
);

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
    .pipe(browserSync.reload({ stream: true }));
});

// Move over production ready files
gulp.task('files-deploy',
  gulp.series(
    'getManifest',
    async function (done) {
      filter = await import('gulp-filter');
      done();
    },
    function (done) {
      // Copy
      gulp.src([
        SITE_BASE + '*',
        '!'+ SITE_BASE +'dropcaps',
        '!'+ SITE_BASE +'xslt',
        '!'+ SITE_BASE +'templates'
      ])
        .pipe(plumber())
        .pipe(gulp.dest(PRODUCTION_SITE_BASE));

      // Copy poems
      gulp.src(SITE_BASE + 'poems/**/*')
        .pipe(plumber())
        .pipe(gulp.dest(PRODUCTION_SITE_BASE + 'poems'));

      // Copy curations
      gulp.src(SITE_BASE + 'curations/*.html')
        .pipe(filter.default(
          function (file) {
            const fileHandle = file.stem.slice(file.stem.indexOf('-') + 1);
            return _manifest['connections']['published'].indexOf(fileHandle) > -1;
          }
        ))
        .pipe(plumber())
        .pipe(gulp.dest(PRODUCTION_SITE_BASE + 'curations'));

      // Copy curation images
      gulp.src(SITE_BASE + 'curations/img/**/*')
        .pipe(plumber())
        .pipe(gulp.dest(PRODUCTION_SITE_BASE + 'curations/img'));

      // Copy explorations
      gulp.src(SITE_BASE + 'explorations/*.html')
        .pipe(filter.default(
          function (file) {
            const fileHandle = file.stem;
            return _manifest['connections']['published'].indexOf(fileHandle) > -1;
          }
        ))
        .pipe(plumber())
        .pipe(gulp.dest(PRODUCTION_SITE_BASE + 'explorations'));

      // Copy exploration images
      gulp.src(SITE_BASE + 'explorations/img/**/*')
        .pipe(plumber())
        .pipe(gulp.dest(PRODUCTION_SITE_BASE + 'explorations/img'));

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

      // Copy the search script
      gulp.src(SITE_BASE + 'search/pulter-search.js', { allowEmpty: true })
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

      // // Copy the family tree build
      // gulp.src(SITE_BASE + 'family-tree/build/**/*')
      //   .pipe(plumber())
      //   .pipe(gulp.dest(PRODUCTION_SITE_BASE + 'family-tree/build'));

      done();
    }
  )
);

gulp.task('clean', function (done) {
  const command = 'rm -rf ' + PRODUCTION_SITE_BASE;
  childProcess.exec(command);
  done();
});

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

gulp.task('files',
  gulp.series('clean',
    gulp.parallel(
      'vendor-scripts-deploy',
      'scripts-deploy',
      'styles-deploy',
      'images-deploy'
    ),
    'files-deploy'
  )
);

/* Erasers */
gulp.task('xslt:erase:search', function(done) {
  const command = 'rm -rf ' + SEARCH_FOLDER;
  childProcess.exec(command);
  done();
});

gulp.task('xslt:erase:poems', function(done) {
  const command = 'rm -rf ' + POEMS_DESTINATION_FOLDER;
  childProcess.exec(command);
  done();
});

gulp.task('xslt:erase', gulp.series('xslt:erase:search', 'xslt:erase:poems'));

/* XSLT Tasks */
gulp.task('xslt:index', function () {
  return gulp.src(SITE_BASE + 'xslt/_poemsHTML.xml')
    .pipe(xslt(getXSLTProcOptions(SITE_BASE + 'xslt/poems.xsl')))
    .pipe(concat('index.html'))
    .pipe(gulp.dest(SITE_BASE));
});

gulp.task('xslt:search:elemental',
  gulp.series('getManifest', function () {
      return gulp.src(XML_SOURCES_FOLDER + 'pulter_*.xml')
        .pipe(flatMap(function (stream, xmlFile) {
          const fileName = path.basename(xmlFile.path);
          let poemId = fileName
            .replace(/\.[^/.]+$/, '')
            .replace('pulter_', '');
          poemId = +poemId;

          const filtered = filterById(_manifest['poems'], poemId);
          const isPublished = filtered.length > 0 && filtered[0].isPublished;
          const isPseudo = filtered[0] ? (filtered[0].hasOwnProperty('isPseudo')) : false;

          if (isPublished && !isPseudo && isNumber(poemId)) {
            return gulp.src(xmlFile.path)
              .pipe(xslt(getXSLTProcOptions(PP_SEARCH_EE_TRANSFORMATION)))
              .pipe(plumber())
              .pipe(rename('doc_' + poemId + '.js'))
          } else {
            return gulp.src('blank.txt', { allowEmpty: true });
          }
        }))
        .pipe(concat('_ee-search.js'))
        .pipe(gulp.dest(SEARCH_FOLDER + '/partials'));
    })
);

gulp.task('xslt:search:amplified',
  gulp.series('getManifest', function () {
    return gulp.src(XML_SOURCES_FOLDER + 'pulter_*.xml')
      .pipe(flatMap(function (stream, xmlFile) {
        const fileName = path.basename(xmlFile.path);
        let poemId = fileName
          .replace(/\.[^/.]+$/, '')
          .replace('pulter_', '');
        poemId = +poemId;

        const filtered = filterById(_manifest['poems'], poemId);
        const isPublished = filtered.length > 0 && filtered[0].isPublished;
        const isPseudo = filtered[0] ? (filtered[0].hasOwnProperty('isPseudo')) : false;

        if (isPublished && !isPseudo && isNumber(poemId)) {
          return gulp.src(xmlFile.path)
            .pipe(xslt(getXSLTProcOptions(PP_SEARCH_AE_TRANSFORMATION)))
            .pipe(plumber())
            .pipe(rename('doc_' + poemId + '.js'))
        } else {
          return gulp.src('blank.txt', { allowEmpty: true });
        }
      }))
      .pipe(concat('_ae-search.js'))
      .pipe(gulp.dest(SEARCH_FOLDER + '/partials'));
  })
);

gulp.task('xslt:search:curations',
  gulp.series(
    'getManifest',
    async function (done) {
      filter = await import('gulp-filter');
      done();
    },
    function () {
      return gulp.src([SITE_BASE + 'curations/*.html'])
        .pipe(
          filter.default(function (file) {
            const fileHandle = file.stem.slice(file.stem.indexOf('-') + 1);
            return _manifest['connections']['published'].indexOf(fileHandle) > -1;
          })
        )
        .pipe(flatMap(function (stream, file) {
          const fileStem = file.stem;

          return stream
            .pipe(
              xslt(
                getXSLTProcOptions(
                  PP_SEARCH_CURATION_TRANSFORMATION,
                  true
                )
              )
            )
            .pipe(
              replace('id:""', `id:"${fileStem}"`)
            )
            .pipe(
              replace('poemRef:""', `poemRef:${fileStem.split('-')[0].slice(1)}`)
            )
        }))
        .pipe(concat('_curation-search.js'))
        .pipe(gulp.dest(SEARCH_FOLDER + '/partials'));
    }
  )
);

gulp.task('xslt:search:explorations',
  gulp.series(
    'getManifest',
    async function (done) {
      filter = await import('gulp-filter');
      done();
    },
    function () {
      return gulp.src([SITE_BASE + 'explorations/*.html'])
        .pipe(
          filter.default(function (file) {
            return _manifest['connections']['published'].indexOf(file.stem) > -1;
          })
        )
        .pipe(flatMap(function (stream, file) {
          const fileStem = file.stem;
          return stream
            .pipe(
              xslt(
                getXSLTProcOptions(
                  PP_SEARCH_EXPLORATION_TRANSFORMATION,
                  true
                )
              )
            )
            .pipe(
              replace('id:""', `id:"${fileStem}"`)
            )
        }))
        .pipe(concat('_exploration-search.js'))
        .pipe(gulp.dest(SEARCH_FOLDER + '/partials'));
    }
  )
);

gulp.task('xslt:search',
  gulp.series(
    'xslt:search:elemental',
    'xslt:search:amplified',
    'xslt:search:curations',
    'xslt:search:explorations',
    function() {
      return gulp.src(SEARCH_FOLDER + '/partials/*.js')
        .pipe(concat('pulter-search.js'))
        .pipe(appendPrepend.prependFile(LUNR_INIT_PARTIAL))
        .pipe(appendPrepend.prependFile(ELASTICLUNR_LIBRARY))
        .pipe(uglify())
        .pipe(gulp.dest(SEARCH_FOLDER));
    })
);

gulp.task('sitemap',
  gulp.series('getManifest', function (done) {
    const prefix = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    const suffix = '</urlset>';
    const protocol = 'https:';
    const pages = [
      protocol + LIVE_SITE_BASE_URL + '/',
      protocol + LIVE_SITE_BASE_URL + '/#poems',
      protocol + LIVE_SITE_BASE_URL + '/#connections',
      protocol + LIVE_SITE_BASE_URL + '/about-hester-pulter-and-the-manuscript.html',
      protocol + LIVE_SITE_BASE_URL + '/about-project-conventions.html',
      protocol + LIVE_SITE_BASE_URL + '/about-the-project.html',
      protocol + LIVE_SITE_BASE_URL + '/how-to-cite-the-pulter-project.html',
      protocol + LIVE_SITE_BASE_URL + '/resources.html'
    ];

    console.log('Hi, sitemap builder is here.');

    const publishedPoems = _manifest['poems'].filter(function (poemObj) {
      return poemObj.isPublished;
    });
    let poemUrls = [];

    const triads = publishedPoems.map(function (poemObject) {
      const slug = dashify(poemObject.seo, {condense: true});

      return [
        protocol + LIVE_SITE_BASE_URL + '/poems/ee/' + slug + '/',
        protocol + LIVE_SITE_BASE_URL + '/poems/ae/' + slug + '/',
        protocol + LIVE_SITE_BASE_URL + '/poems/vm/' + slug + '/'
      ]
    });

    const length = triads.length;

    for (let i = 0; i < length; i++) {
      poemUrls = poemUrls.concat(triads[i]);
    }

    const curations = fs.readdirSync(SITE_BASE + 'curations')
      .filter(function (itemName) {
        let publishedWithThisId = [];
        const id = +itemName.split('-')[0].slice(1);
        const curationHash = itemName.slice(itemName.indexOf('-') + 1).replace('.html', '');
        const isPublished = _manifest['connections']['published'].indexOf(curationHash) > -1;

        if (isNumber(id) && isPublished) {
          publishedWithThisId = publishedPoems.filter(function (poem) {
            return +poem.id === id;
          });
        }

        return (
          itemName.indexOf('.html') > -1 &&
          publishedWithThisId.length
        );
      })
      .map(function (curationFileName) {
        return protocol + LIVE_SITE_BASE_URL + '/curations/' + curationFileName;
      });

    const explorations = fs.readdirSync(SITE_BASE + 'explorations')
      .filter(function (itemName) {
        const explorationHash = itemName.replace('.html', '');
        const isPublished = _manifest['connections']['published'].indexOf(explorationHash) > -1;

        return itemName.indexOf('.html') > -1 && isPublished;
      })
      .map(function (curationFileName) {
        return protocol + LIVE_SITE_BASE_URL + '/explorations/' + curationFileName;
      });

    let urls = pages.concat(poemUrls, curations, explorations);

    urls = urls.map(function (url) {
      let priority = .5;

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

    const stream = source('null.xml');
    stream.end(prefix + urls + suffix);
    stream
      .pipe(rename('sitemap.xml'))
      .pipe(gulp.dest(SITE_BASE));

    console.log('Sitemap has been built!');
    done();
  })
);

gulp.task('silenceDirs', function (done) {
  // Silence ./poems/
  const streamN = source('null.html');
  streamN.end(getJSRedirectString('/#poems', true));
  streamN.pipe(rename('/index.html'))
    .pipe(gulp.dest(POEMS_DESTINATION_FOLDER));

  // Silence ./poems/ee
  const streamEE = source('null.html');
  streamEE.end(getJSRedirectString('/poems' + EE_SUBFOLDER + '/1', true));
  streamEE.pipe(rename('/index.html'))
    .pipe(gulp.dest(POEMS_DESTINATION_FOLDER + EE_SUBFOLDER));

  // Silence ./poems/ae
  const streamAE = source('null.html');
  streamAE.end(getJSRedirectString('/poems' + AE_SUBFOLDER + '/1', true));
  streamAE.pipe(rename('/index.html'))
    .pipe(gulp.dest(POEMS_DESTINATION_FOLDER + AE_SUBFOLDER));

  // Silence ./poems/vm
  const streamVM = source('null.html');
  streamVM.end(getJSRedirectString('/poems' + VM_SUBFOLDER + '/1', true));
  streamVM.pipe(rename('/index.html'))
    .pipe(gulp.dest(POEMS_DESTINATION_FOLDER + VM_SUBFOLDER));

  done();
})

gulp.task('xslt:poems:ee',
  gulp.series('getManifest', function () {
    console.log('Hi! EE Publisher is here!');
    const poemsInManifest = _manifest['poems'];
    const singlePoemFlag = argv[SINGLE_POEM_TRANSFORMATION_FLAG];
    const sourceExpression=
      (
        singlePoemFlag !== undefined &&
        singlePoemFlag !== true
      ) ?
        singlePoemFlag : 'pulter_*.xml';

    return gulp.src(XML_SOURCES_FOLDER + sourceExpression)
      .pipe(flatMap(function (stream, xmlFile) {
        console.log('|');

        let fileName = path.basename(xmlFile.path),
          poemId = fileName
            .replace(/\.[^/.]+$/, '')
            .replace('pulter_', '');
        poemId = +poemId;
        console.log('Poem #' + poemId + ', Elemental Edition.');
        console.log('Source: ' + fileName);

        const filtered = filterById(poemsInManifest, poemId);
        const isPublished = filtered.length > 0;

        console.log(isPublished ? '✓Published to' : '𐄂Not published');

        if (isPublished && isNumber(poemId)) {
          const poemObject = filtered[0];
          let slug = poemObject.seo;

          slug = slug ?
            dashify(slug, {condense: true}) :
            'poem-' + poemId;

          console.log('https:' + LIVE_SITE_BASE_URL + '/poems' + EE_SUBFOLDER + '/' + slug);

          // Write /poems/{$edition}/{$id} redirect page
          const stream1 = source('redirect.html');
          stream1.end(getJSRedirectString('/poems' + EE_SUBFOLDER + '/' + slug));
          stream1
            .pipe(rename(poemId + '/index.html'))
            .pipe(gulp.dest(POEMS_DESTINATION_FOLDER + EE_SUBFOLDER));

          // Write /poems/{$id} redirect page to EE
          const stream2 = source('redirect.html');
          stream2.end(getJSRedirectString('/poems' + EE_SUBFOLDER + '/' + slug));
          stream2
            .pipe(rename(poemId + '/index.html'))
            .pipe(gulp.dest(POEMS_DESTINATION_FOLDER));

          // Write SEO friendly page
          return gulp.src(xmlFile.path)
            .pipe(
              xslt(
                poemObject.isPseudo ?
                  getXSLTProcOptions(PSEUDO_TRANSFORMATION) :
                  getXSLTProcOptions(EE_TRANSFORMATION)
              )
            )
            .pipe(plumber())
            .pipe(rename(slug + '/index.html'))
        } else {
          return gulp.src('blank.txt');
        }
      }))
      .pipe(gulp.dest(POEMS_DESTINATION_FOLDER + EE_SUBFOLDER));
  })
);

gulp.task('xslt:poems:ae',
  gulp.series('getManifest', function () {
    console.log('Hi! AE Publisher is here!');
    const poemsInManifest = _manifest['poems'];
    const singlePoemFlag = argv[SINGLE_POEM_TRANSFORMATION_FLAG];
    const sourceExpression=
      (
        singlePoemFlag !== undefined &&
        singlePoemFlag !== true
      ) ?
        singlePoemFlag : 'pulter_*.xml';

    return gulp.src(XML_SOURCES_FOLDER + sourceExpression)
      .pipe(flatMap(function (stream, xmlFile) {
        console.log('|');

        let fileName = path.basename(xmlFile.path),
          poemId = fileName
            .replace(/\.[^/.]+$/, '')
            .replace('pulter_', '');
        poemId = +poemId;
        console.log('Poem #' + poemId + ', Amplified Edition.');
        console.log('Source: ' + fileName);

        const filtered = filterById(poemsInManifest, poemId);
        const isPublished = filtered.length > 0;

        console.log(isPublished ? '✓Published to' : '𐄂Not published');

        if (isPublished && isNumber(poemId)) {
          const poemObject = filtered[0];
          let slug = poemObject.seo;

          slug = slug ?
            dashify(slug, {condense: true}) :
            'poem-' + poemId;

          console.log('https:' + LIVE_SITE_BASE_URL + '/poems' + AE_SUBFOLDER + '/' + slug);

          // Write the redirect page
          const streamN = source('redirect.html');
          streamN.end(getJSRedirectString('/poems' + AE_SUBFOLDER + '/' + slug));
          streamN
            .pipe(rename(poemId + '/index.html'))
            .pipe(gulp.dest(POEMS_DESTINATION_FOLDER + AE_SUBFOLDER));

          // Write SEO friendly page
          return gulp.src(xmlFile.path)
            .pipe(
              xslt(
                poemObject.isPseudo ?
                  getXSLTProcOptions(PSEUDO_TRANSFORMATION) :
                  getXSLTProcOptions(AE_TRANSFORMATION)
              )
            )
            .pipe(plumber())
            .pipe(rename(slug + '/index.html'))
        } else {
          return gulp.src('blank.txt');
        }
      }))
      .pipe(gulp.dest(POEMS_DESTINATION_FOLDER + AE_SUBFOLDER));
  })
);

gulp.task('xslt:poems:vm',
  gulp.series('getManifest', function () {
    console.log('Hi! VM Publisher is here!');
    const poemsInManifest = _manifest['poems'];
    const singlePoemFlag = argv[SINGLE_POEM_TRANSFORMATION_FLAG];
    const sourceExpression=
      (
        singlePoemFlag !== undefined &&
        singlePoemFlag !== true
      ) ?
        singlePoemFlag : 'pulter_*.xml';

    return gulp.src(XML_SOURCES_FOLDER + sourceExpression)
      .pipe(flatMap(function (stream, xmlFile) {
        console.log('|');

        let fileName = path.basename(xmlFile.path),
          poemId = fileName
            .replace(/\.[^/.]+$/, '')
            .replace('pulter_', '');
        poemId = +poemId;
        console.log('Poem #' + poemId + ', VM page.');
        console.log('Source: ' + fileName);

        const filtered = filterById(poemsInManifest, poemId);
        const isPublished = filtered.length > 0;

        console.log(isPublished ? '✓Published to' : '𐄂Not published');

        if (isPublished && isNumber(poemId)) {
          const poemObject = filtered[0];
          let slug = poemObject.seo;

          slug = slug ?
            dashify(slug, {condense: true}) :
            'poem-' + poemId;``

          console.log('https:' + LIVE_SITE_BASE_URL + '/poems' + VM_SUBFOLDER + '/' + slug);

          // Write the redirect page
          const streamN = source('redirect.html');
          streamN.end(getJSRedirectString('/poems' + VM_SUBFOLDER + '/' + slug));
          streamN
            .pipe(rename(poemId + '/index.html'))
            .pipe(gulp.dest(POEMS_DESTINATION_FOLDER + VM_SUBFOLDER));

          // Write SEO friendly page
          return gulp.src(xmlFile.path)
            .pipe(xslt(getXSLTProcOptions(VM_TRANSFORMATION)))
            .pipe(plumber())
            .pipe(rename(slug + '/index.html'))
        } else {
          return gulp.src('blank.txt');
        }
      }))
      .pipe(gulp.dest(POEMS_DESTINATION_FOLDER + VM_SUBFOLDER));
  })
);

gulp.task('xslt:poems',
  gulp.series(
    'silenceDirs',
    'xslt:poems:ee',
    'xslt:poems:ae',
    'xslt:poems:vm'
  )
);

gulp.task('xslt',
  gulp.series(
    'xslt:erase:poems',
    'xslt:index',
    'xslt:search',
    'xslt:poems',
    'sitemap'
  )
);

gulp.task('build',
  gulp.series(
    'xslt',
    'files'
  )
);
