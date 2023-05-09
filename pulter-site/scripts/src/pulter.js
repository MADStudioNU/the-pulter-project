var TPP = (function ($) {
  // Enable caching globally
  $.ajaxSetup({
    cache: true
  });

  return {
    version: undefined,
    getPoemIndex: function () {
      return $.get('/pulter-manifest.json');
    },
    getSearchScript: function () {
      return $.getScript('/search/pulter-search.js');
    },
    initHome: function () {
      console.log('%c Welcome to the Pulter Project.', 'background: #FBF0FF; color: #330657;');
      console.log('%c⚡ MADStudio', 'background: #FBF0FF; color: #330657;');

      // Isotope instance
      var $i;

      // Local vars
      var hash = window.location.hash.split('#')[1]; // 'undefined' if not

      // Store
      var pulterState = pulterState || store.namespace('pulterState');

      // DOM variables
      var $body = $('#page');
      var $content = $body.find('#c');
      var $poemList = $content.find('.poem-list');
      var $intro = $body.find('#intro');
      var $actions = $intro.find('.actions');
      var $readAction = $actions.find('#read-action');
      var $explorationsAction = $actions.find('#explorations-action');
      var $dropUps = $actions.find('.pseudo');
      var $toIntro = $body.find('.to-intro');
      var $status = $body.find('.status');
      var $imgCollection = $body.find('#pp-home-image-collection');
      var $explorationBlurb = $('.exploration-blurb');
      var $explorationTriggers = $('.exploration-trigger');

      // Images status
      $imgCollection.imagesLoaded()
        .always(function () {
          if (hash && hash !== '0') {
            // Show UI
            $content.fadeIn(600);
            $intro.addClass('animation-skipped');

            setTimeout(function () {
              enableInteractivity();

              if (hash === 'explorations') {
                $('#' + hash)[0].scrollIntoView();
              }
            }, 400);

          } else {
            // Load intro
            $intro.fadeIn(600);

            // If not played recently
            if (!pulterState.get('enoughSplashAnimation')) {
              playSplashAnimation();
              pulterState.set('enoughSplashAnimation', true, 60 * 60 * 24);
            } else {
              // Otherwise, skip and just show elements
              $('.anmtd, .eventually, .actions-box').addClass('skipped');
            }
          }
        });

      // Various click event handlers
      $toIntro.on('click', navigateToIntro);
      $readAction.on('click', navigateToIndex);
      $explorationsAction.on('click', navigateToExplorations);

      $dropUps.on('click', function () {
        $(this).toggleClass('expanded');
      });

      // Exploration lightboxes
      $explorationTriggers.on('click', function () {
        var eHash = $(this).data('ctx-hash');
        if (eHash) { openExploration(eHash); }
        return false;
      });

      // Check if we need to open exploration right away
      if (explorationIsPresent(hash)) {
        openExploration(hash);
      }

      // Hash change event logic
      function onHashChange() {
        var h = window.location.hash.split('#')[1];

        if(!h) { navigateToIntro(); }
        else if (h === 'poems') { navigateToIndex(); }
      }

      // Attaching the event listener
      window.addEventListener('hashchange', onHashChange);

      // Exploration blurb logic
      if (!pulterState.has('muteExplorationBlurb')) {
        $explorationBlurb.removeClass('muted').show();

        $explorationBlurb.find('.muter').on('click', function () {
          $explorationBlurb.addClass('muted');
          pulterState.set('muteExplorationBlurb', true);
        });
      }

      // Scroll watcher
      var scrollWatcher = debounce(
        function () {
          var $w = $(window);

          if (
            $w.scrollTop() >= $poemList.offset().top
          ) {
            $body.addClass('scrolled');
          } else {
            $body.removeClass('scrolled');
          }

          if (
            $w.scrollTop() >= $poemList.outerHeight()
          ) {
            $body.addClass('beyond');
          } else {
            $body.removeClass('beyond');
          }
        }, 300
      );

      // Attaching the event handler
      $(window).on('scroll', scrollWatcher);

      // Become aware of the PP environment
      var poems = [];
      var indexRequest = this.getPoemIndex();
      indexRequest
        .done(function (data) {
          poems = data;
          if (poems) {
            onManifestAcquired();
          }
        })
        .fail(function () {
          console.log('Manifest loading error! Falling back to id based HTML linking.');
        });

      // Version imprint
      this.addVerCopyImprint();

      // Try to enable search
      this.enableSearch($body);

      function navigateToIntro() {
        $intro.fadeIn(600);
        $content.fadeOut();
        window.location.hash = '';
      }

      function navigateToIndex() {
        $content.fadeIn(600);
        $intro.hide();
        window.location.hash = 'poems';
        setTimeout(function () {
          enableInteractivity();
        }, 400);
      }

      function navigateToExplorations() {
        $content.fadeIn(600);
        $intro.hide();
        window.location.hash = 'explorations';
        $('.to-exploration-action').trigger('click');
        setTimeout(function () {
          enableInteractivity();
          $('#explorations')[0].scrollIntoView();
        }, 400);
      }

      function explorationIsPresent(hash) {
        var selector = '.exploration-trigger[data-ctx-hash="' + hash + '"]';
        var $e = $('.exploration-list').find(selector);
        return $e.length > 0;
      }

      function onManifestAcquired() {
        // Enable JS linking
        $('.js-link').on('click', function () {
          var $self = $(this);
          var type = $self.data('resource-type');
          var poemId = $self.data('poem-id');
          var poemObj = poems.filter(function (poem) {
            return +poem.id === poemId;
          })[0];

          if (poemObj) {
            window.location.href = '/poems/ee/' + dashify(poemObj.seo) + (type === 'curation' ? '/#ctxs' : '');
          }
          return false;
        });
        resetStatusString();
      }

      function enableInteractivity() {
        if (!$i) {
          $i = $('.grid').isotope({
            layoutMode: 'vertical',
            // stagger: 10,
            // getSortData: {}
          });

          // $i.on('arrangeComplete', function (event, filteredItems) {
          //   $status.find('.poem-counter').text(filteredItems.length);
          // });

          // Click event handlers
          $('.filter-tag').on('click', function () {
            var $self = $(this);
            var keyword = $self.data('filter');

            $status.addClass('hi');
            $i.isotope({ filter: keyword });
            $('html,body').scrollTop(0);

            var num = $i.isotope('getFilteredItemElements').length;

            $status
              .find('.filter-status')
              .text(
                num +
                (+num > 1 ? ' poems ' : ' poem ') +
                ' matching “' + keyword.slice(1).toUpperCase().replace('/-/g', ' ') + '” '
              );

            return false;
          });

          $('.status-reset').on('click', function () {
            $i.isotope({ filter: '*' });
            $status.removeClass('hi');
            resetStatusString();
          });
        } else {
          $i.isotope('layout');
        }
      }

      function openExploration(eHash) {
        var ctxUrl = '/explorations/' + eHash + '.html #content';
        var oldHash = window.location.hash;

        $.featherlight(ctxUrl, {
          variant: 'curation',
          closeIcon: '',
          type: 'ajax',
          openSpeed: 400,
          closeSpeed: 200,
          otherClose: '.dismiss',
          loading: '<p class="lato spinner">Loading the exploration…</p>',
          beforeOpen: function () {
            if (eHash) {
              window.location.hash = eHash;
            }
          },
          afterContent: function () {
            var $imagesWithZoom = $('img[data-zoom]');
            $imagesWithZoom.on('click', function () {
              var $imageWithZoom = $(this);
              var imageSrc = $imageWithZoom.attr('src');
              var zoomImgSrc = $imageWithZoom.data('zoom');

              if (imageSrc && zoomImgSrc) {
                var $image;

                $.featherlight(imageSrc, {
                  type: 'image',
                  variant: 'facs',
                  closeIcon: 'Close',
                  loading: 'One second…',
                  afterContent: function () {
                    $image = $('.featherlight-image');
                    $image.attr('data-zoom', zoomImgSrc);

                    new Drift($image[0], {
                      inlinePane: true,
                      hoverDelay: 400
                    });
                  },
                  beforeClose: function () {
                    $('.drift-zoom-pane').remove();
                  }
                });
              }
            });
          },
          afterClose: function () {
            if (oldHash !== eHash) {
              window.location.hash = oldHash;
            }
          }
        });
      }

      function resetStatusString() {
        $status.find('.filter-status')
          .text('' + poems.filter(
            function(poem) {
              return poem.isPublished;
            }).length + ' poems '
        );
      }

      function playSplashAnimation() {
        // Intro animation
        var introTimeline = anime.timeline({}),

          // Fading in the first SVG
          animateTheBlueprintCanvas = {
            targets: '.initially',
            duration: 200,
            opacity: [
              { value: 1, duration: 200, delay: 0 },
              { value: 0, duration: 10, delay: 2000 }
            ],
            easing: 'easeInOutQuad'
          },

          // "Drawing" the lines
          drawTheBlueprint = {
            targets: '.blueprint-path',
            strokeDashoffset: [anime.setDashoffset, 0],
            duration: 2000,
            delay: function (t, i) {
              return i * 250;
            },
            offset: '-=2300',
            easing: 'easeInOutQuad'
          },

          // Fading in the second SVG
          showTheEmblem = {
            targets: '.eventually',
            opacity: 1,
            duration: 500,
            offset: '-=400',
            easing: 'linear'
          },

          // Scaling down
          shrinkTheEmblem = {
            targets: '.eventually',
            scale: [4, 1],
            top: ['50%', 0],
            delay: 0,
            duration: 600,
            easing: 'easeInOutQuad'
          },

          // Revealing the rest
          elementsAnimation = {
            targets: '.anmtd',
            translateY: ['1em', 0],
            opacity: [0, 1],
            duration: 600,
            offset: '-=400',
            easing: 'easeInOutQuad',
            delay: function (target, index) {
              return 200 * index;
            }
          },

          // Actions panel entrance
          actionBoxAnimation = {
            targets: '.actions-box',
            opacity: [0, 1],
            duration: 600,
            easing: 'easeInOutQuad'
          };

        // Let's go!
        introTimeline
          .add(animateTheBlueprintCanvas)
          .add(drawTheBlueprint)
          .add(showTheEmblem)
          .add(shrinkTheEmblem)
          .add(elementsAnimation)
          .add(actionBoxAnimation);
      }
    },
    initPoem: function (params) {
      var $body = $('body');

      // Default options (for a poem)
      var defaults = {
        id: 0,
        title: '',
        poster: false,
        hasCtx: false
      };

      // Poem config object construction
      var pConfig = Object.assign(defaults, params);

      // Do we know enough to start reading?
      if (isNumber(+pConfig.id) && pConfig.id > 0) {
        var l1 =
          'Hello and welcome to Hester Pulter’s “' +
          pConfig.title +
          '” (Poem ' +
          pConfig.id +
          ').';

        console.log('%c' + l1, 'background: #FBF0FF; color: #330657;');
        console.log('%c⚡ MADStudio', 'background: #FBF0FF; color: #330657;');

        // Kick off the UI
        readThePoem(pConfig);

        // Search
        this.enableSearch($body);

        function readThePoem(config) {
          // Store
          var pulterState = pulterState || store.namespace('pulterState');

          // DOM variables
          var $poemSheetList = $body.find('#poem-sheet-list');
          var $poster = $body.find('.poster');
          var $posterInfoTrigger = $body.find('.poster-info-trigger');
          var $glossToggle = $body.find('.gloss-toggle');
          var $pageToggle = $body.find('.page-toggle');
          var $lineNumbersToggle = $body.find('.lines-toggle');
          var $headnoteToggles = $body.find('.headnote-toggle');
          var $facsimileToggle = $body.find('.facsimile-toggle');
          var $poemNoteTriggers = $body.find('.poem-note-trigger');
          var $lineNumberLinkTriggers = $body.find('.line-number-value');
          var $navs = $body.find('.nav');
          var $ctxs;
          var $curationBlurb = $('.curation-blurb');

          // Read the storage and set the states if needed
          if (pulterState.has('pagesOn')) { $body.addClass('pages-on'); }
          if (pulterState.has('glossesOn')) { $body.addClass('glosses-on'); }
          if (pulterState.has('linesOn')) { $body.addClass('lines-on'); }

          // Local variables
          var manifest;
          var manifestOfPublished;
          var indexRequest = TPP.getPoemIndex();

          // Show page contents
          renderPoemElements();

          // Version imprint
          TPP.addVerCopyImprint();

          indexRequest
            .done(function (data) {
              manifest = data;
              manifestOfPublished = manifest.filter(function (poem) {
                return poem.isPublished !== false;
              });
              onManifestAcquired();
            })
            .fail(function () {
              console.log('Manifest loading error!');
            });

          // Set the posters
          if (config.poster) {
            $body.addClass('has-poster');
            setPosterImage($poster, config.id, 'd');
          }

          // Curations related logic
          if (config.hasCtx) {
            $body.addClass('ctx');
            $ctxs = $body.find('#ctxs');

            if (config.poster) {
              setPosterImage($ctxs, config.id, 'l');
            }

            // Is hash present?
            var hash = window.location.hash.split('#')[1]; // 'undefined' if not

            if (hash) {
              var selector = '.ctx[data-ctx-hash="' + hash + '"]',
                $c = $ctxs.find(selector);

              if ($c.length) {
                openCuration(config, $c.data('ctx-hash'));
              }
            }

            // Curation lightbox triggers
            $ctxs.find('.ctx').off().on('click', '.text', function (e) {
              var $target = $(e.delegateTarget);
              var cHash = $target.data('ctx-hash');
              var cTitle = $target.find('a').data('curation-title');
              $target.find('a').blur();

              if (cHash) {
                openCuration(config, cHash, cTitle);
              }

              return false;
            });
          }

          /* Click event handlers */
          // Headnote toggle
          $headnoteToggles.on('click', '.pp-action', function () {
            var $edition = $(this).closest('.poem');
            $edition.toggleClass('expanded collapsed');

            if ($edition.hasClass('expanded')) {
              gtag('event', 'headnote_expanded', {
                'event_category': 'engagement',
                'value': +config.id
              });
            }
            return false;
          });

          // Note triggers
          $glossToggle.on('click', function () {
            if (pulterState.has('glossesOn')) {
              if ($body.hasClass('glosses-on')) {
                configureViewSetting('glosses', false);
              } else {
                configureViewSetting('glosses', true);
              }
            } else {
              configureViewSetting('glosses', true);

              // Questionable, but this is what Wendy & Leah want
              $headnoteToggles
                .closest('.poem')
                .removeClass('collapsed')
                .addClass('expanded');
            }
          });

          // Facsimile image viewer triggers
          $pageToggle.on('click', function () {
            if (pulterState.has('pagesOn')) {
              if ($body.hasClass('pages-on')) {
                configureViewSetting('pages', false);
              } else {
                configureViewSetting('pages', true);
              }
            } else {
              configureViewSetting('pages', true);
            }
          });

          // Line number toggle
          $lineNumbersToggle.on('click', function () {
            if (pulterState.has('linesOn')) {
              if ($body.hasClass('lines-on')) {
                configureViewSetting('lines', false);
              } else {
                configureViewSetting('lines', true);
              }
            } else {
              configureViewSetting('lines', true);
            }
          });

          // Curation blurb logic
          if (!pulterState.has('muteCurationBlurb')) {
            $curationBlurb.removeClass('muted').show();

            $curationBlurb.find('.muter').on('click', function () {
              $curationBlurb.addClass('muted');
              pulterState.set('muteCurationBlurb', true);
            });
          }

          // Poem note triggers
          $poemNoteTriggers.on('click', function () {
            var $self = $(this),
              noteId = $self.data('note-id'),
              notesCount = $self.data('notes-count'),
              forceFullSize = $self.data('force-full-size') || false,
              noteLength = $self.data('note-length'),
              noteVariant = (
                noteLength > 300 ||
                notesCount > 1 ||
                forceFullSize
              ) ? 'full-sized-note' : 'compact-note',
              yOffset = $self.offset().top - $self.closest('.poem').offset().top - 16, // Bump it up a bit (16px) for a more natural alignment
              $noteMarkup = $('#poem-note-' + noteId);

            gtag('event', 'note_revealed', {
              'event_category': 'engagement',
              'event_label': $self.text()
            });

            $self.addClass('active');

            $.featherlight($noteMarkup, {
              variant: noteVariant,
              closeIcon: '',
              otherClose: '.dismiss',
              root: $self.closest('.poem'),
              beforeContent: function () {
                if (noteVariant === 'compact-note') {
                  var lightbox = this;

                  $('.featherlight-content').css({top: yOffset});
                  $('html').removeClass('with-featherlight');
                  $(window).one('scroll', function () {
                    lightbox.close();
                  });
                }
              },
              afterClose: function () {
                $self.removeClass('active');
              }
            });
          });

          // Facs
          $facsimileToggle.on('click', function () {
            var $self = $(this);
            var imageId = $self.data('image-id');

            gtag('event', 'facsimile_viewed', {
              'event_category': 'engagement',
              'event_label': imageId
            });

            if (imageId) {
              $.featherlight('/images/facs/' + imageId + '_th.jpg', {
                type: 'image',
                variant: 'facs',
                closeIcon: 'Close',
                loading: 'One second…',
                afterContent: function () {
                  var $image = $('.featherlight-image');
                  $image.attr('data-zoom', '/images/facs/' + imageId + '.jpg');

                  new Drift($image[0], {
                    inlinePane: true,
                    hoverDelay: 400
                  });
                },
                beforeClose: function () {
                  $('.drift-zoom-pane').remove();
                }
              });
            }
          });

          // Trigger poster info lightbox
          $posterInfoTrigger.on('click', function () {
            var $self = $(this);
            var $noteMarkup = '<div class="poster-box' + (config.poster.statement ? ' padded' : '') + '"><div class="image-box"><img src="/images/headnote-posters/h' + config.id + 'p.jpg"  alt=""/></div>' + (config.poster.statement ? ('<div class="source-statement"><a ' + (config.poster.link ? ('href="' + config.poster.link + '" target="_blank" class="ref"') : '') + '>' + config.poster.statement + '</a></div>') : '') + '</div>';

            $self.addClass('active');
            $self.blur();

            $.featherlight($noteMarkup, {
              variant: 'poster-info',
              closeIcon: '',
              otherClose: '.image-box'
            });

            return false;
          });

          // Trigger clipboard copying of a line deep link
          $lineNumberLinkTriggers.on('click', function () {
            var $self = $(this);
            var $theLine = $self.closest('.l');
            var hash = '#' + $self.closest('.l').attr('id');
            var fullLink = window.location.origin + window.location.pathname + hash;

            if (navigator.clipboard) {
              navigator.clipboard.writeText(fullLink)
                .then(function () {
                  if ($theLine.find('.link-copy-confirmation').length === 0) {
                    var confirmationEl = '<span class="link-copy-confirmation">Link to line copied!</span>';
                    $theLine.addClass('when-link-copied');
                    $theLine.append(confirmationEl);

                    setTimeout(function () {
                      $theLine.removeClass('when-link-copied');
                      $theLine.find('.link-copy-confirmation').remove();
                    }, 1500);
                  }
                }, function () {
                  console.log('Sorry, unable to copy!');
                });
            }
          });

          // Highlight the line if arrived with a "deep link"
          var isLineDeepLinkPresent = window.location.hash.indexOf('#tppl-') > -1;
          if (isLineDeepLinkPresent) {
            var lineElId = window.location.hash;
            var $line = $(lineElId);

            if ($line.length > 0) {
              setTimeout(function () {
                $('body').animate({
                  scrollTop: $line.offset().top - 100
                }, 2500, 'swing');

                $line.addClass('linked-line-highlight');

                setTimeout(function () {
                  $line.removeClass('linked-line-highlight');
                }, 5000);
              }, 1000);
            }
          }

          // "Renders" the poem
          function renderPoemElements() {
            var animateTheBlueprintCanvas = {
                targets: '.initially',
                opacity: [
                  {value: 1, duration: 0},
                  {value: 0, duration: 800, delay: 2000}
                ],
                // easing: 'easeInOutQuad'
                easing: 'linear'
              },
              drawTheBluePrint = {
                targets: '.bp',
                strokeDashoffset: [anime.setDashoffset, 0],
                duration: 2600,
                delay: function (t, i) {
                  return i * 250;
                },
                offset: '-=2500',
                easing: 'easeInOutQuad'
              },
              showTheDropCap = {
                targets: '.eventually',
                opacity: 1,
                duration: 600,
                offset: '-=1000',
                easing: 'linear'
              },
              showTheTitle = {
                targets: '.poem-title',
                offset: '-=2600',
                opacity: {
                  value: [0, 1],
                  duration: 600,
                  easing: 'easeInQuad'
                },
                translateY: {
                  value: ['-1em', 0],
                  duration: 800,
                  easing: 'easeOutQuad'
                },
                delay: function (target, index) {
                  return 400 * index;
                }
              },
              showTheHeadnoteToggle = {
                targets: '.headnote-toggle',
                offset: '-=2000',
                opacity: {
                  value: [0, 1],
                  duration: 600
                }
              },
              showThePoem = {
                targets: '.poem-body .l',
                offset: '-=2200',
                opacity: {
                  value: [0, 1],
                  duration: 600,
                  easing: 'easeInQuad'
                },
                translateY: {
                  value: ['-.5em', 0],
                  duration: 400,
                  easing: 'easeOutQuad'
                },
                translateX: {
                  value: ['-.25em', 0],
                  duration: 400,
                  easing: 'easeOutQuad'
                },
                easing: 'easeInOutElastic',
                delay: function (target, index) {
                  // Animate only the first 50 lines
                  return index < 50 ? 30 * index : 50 * 30;
                }
              },
              showThePageBreaks = {
                targets: '.pb',
                offset: '-=2200',
                opacity: {
                  value: [0, 1],
                  duration: 600
                }
              },
              showTheMilestones = {
                targets: '.milestone',
                offset: '-=1950',
                opacity: {
                  value: [0, .5],
                  duration: 600
                }
              },
              poemAnimationTimeLine = anime.timeline();

            poemAnimationTimeLine
              .add(animateTheBlueprintCanvas)
              .add(drawTheBluePrint)
              .add(showTheDropCap)
              .add(showTheTitle)
              .add(showTheHeadnoteToggle)
              .add(showThePageBreaks)
              .add(showTheMilestones)
              .add(showThePoem);
          }

          // Sets the poster image to a given element
          function setPosterImage($el, poemId, themeId) {
            var prefix, root, suffix;

            if (poemId && themeId) {
              prefix = 'url("/images/headnote-posters/h';
              root = poemId + themeId;
              suffix = '.jpg")';

              var url = prefix + root + suffix + '';

              // Position the image properly
              $el.css({
                'background-image': url,
                'background-repeat': 'no-repeat',
                'background-size': 'cover',
                'background-position': 'center 10%' // not the upper edge, but a bit lower
              });
            }
          }

          // Opens a curation
          function openCuration(config, curationHash, curationTitle) {
            var ctxUrl =
              '/curations/c' +
              config.id + '-' +
              curationHash +
              '.html #content';

            var gagPagePath =
              '/curations/c' +
              config.id + '-' +
              curationHash +
              '.html';

            $.featherlight(ctxUrl, {
              variant: 'curation',
              closeIcon: '',
              type: 'ajax',
              openSpeed: 400,
              closeSpeed: 200,
              otherClose: '.dismiss',
              loading: '<p class="lato spinner">Loading the curation…</p>',
              beforeOpen: function () {
                if (curationHash) {
                  window.location.hash = curationHash;
                }
              },
              afterOpen: function() {
                gtag('config', 'UA-122500056-2', {
                  'page_title': curationTitle || curationHash,
                  'page_path': gagPagePath
                });
                var idxSpan = '<span class="idx lato">' + config.id + '</span>';
                var titleSpan = '<span class="t">' + config.title + '</span>';
                var out = '<a href="../#" class="poem-ref">' + idxSpan + titleSpan + '</a>';

                $('.featherlight-content').prepend(out);
                $('.poem-ref').on('click', function () {
                  $.featherlight.current().close();
                  return false;
                });
              },
              afterClose: function () {
                window.location.hash = '0';
                gtag('config', 'UA-122500056-2', {
                  'page_title': $('title').text()
                });
              }
            });
          }

          // In-poem navigation
          function onManifestAcquired() {
            $navs.addClass('on');
            var currentIdx;

            $.each(manifestOfPublished, function (idx, el) {
              if (+el.id === config.id) {
                currentIdx = idx;
                return false;
              }
            });

            $navs.on('click', function () {
              var dir = $(this).data('dir');

              if (currentIdx !== 'undefined') {
                var destinationIdx;

                if (dir === 'next') {
                  destinationIdx = currentIdx + 1 < manifestOfPublished.length ?
                    currentIdx + 1 :
                    0;
                }

                if (dir === 'prev') {
                  destinationIdx = currentIdx - 1 >= 0 ?
                    currentIdx - 1 :
                    manifestOfPublished.length - 1;
                }

                if (destinationIdx !== 'undefined') {
                  window.location.href = '../' + dashify(manifestOfPublished[destinationIdx].seo);
                }
              }

              return false;
            });

            // If not published
            if (config.isPublished === false) {
              var poemObj = manifest.filter(function (el) {
                return +el.id === config.id
              });

              // Set the title from the manifest
              if (poemObj && poemObj.length > 0) {
                $body.find('.dynamic-title').text(poemObj[0].title);
              }
            }
          }

          function configureViewSetting(settingKey, value) {
            if (value) {
              $body.addClass(settingKey + '-on');
              pulterState.set(settingKey + 'On', true);
            } else {
              $body.removeClass(settingKey + '-on');
              pulterState.remove(settingKey + 'On');
            }
          }

          /* Scroll related functionality */
          // Scroll watcher
          var scrollWatcher = debounce(function () {
            if ($(window).scrollTop() >= $poemSheetList.offset().top + $poemSheetList.outerHeight() - 200) {
              $body.addClass('so');
            } else {
              $body.removeClass('so');
            }
          }, 250);

          // Attaching the event handler
          $(window).on('scroll', scrollWatcher);
        }
      } else {
        console.log(
          'Unable to initialize the poem. The id is invalid or it wasn’t provided.'
        );
        // TODO: Write an error handler for this case
      }

      // Print footnote numbers adjustment
      setNoteNumbersForPrint();
    },
    resetState: function () {
      var pulterState = pulterState || store.namespace('pulterState');
      pulterState.clear();
    },
    enableSearch: function ($contextEl) {
      var $searchBox = $contextEl.find('.pp-search-box');
      var $searchInput = $searchBox.find('#search-input');
      var $searchResults = $searchBox.find('.results-box');

      // Try to enable search
      var searchScriptRequest = this.getSearchScript();
      searchScriptRequest
        .done(function () {
          setTimeout(function () {
            $searchBox.fadeIn();
            search($searchInput, $searchResults);
          }, 800);
        })
        .fail(function () {
          console.log('Sorry, search script couldn’t be loaded.');
        });

      function search($searchInput, $searchResults) {
        var q = '';
        var searchItemIsClicked = false;

        // Search results keyboard navigation current position
        var keyboardPos = undefined;

        $searchInput.on('blur', function () {
          if (searchItemIsClicked) {
            $searchInput.focus();
            searchItemIsClicked = false;
          } else {
            $searchResults.fadeOut(200);
          }
        });

        $searchInput.on('focus', function () {
          if (
            q.trim().length > 2 ||
            !isNaN(q)
          ) {
            $searchResults.fadeIn(300);
          }
        });

        var searchInputWatcher = debounce(
          function() {
            var query = $searchInput.val().trim();

            if (q !== query) {
              q = query;
              var results = [];

              if (
                query.length > 2 ||
                !isNaN(query) // for the lookup by ID
              ) {
                PPS.search(query, {
                  fields: {
                    title: { boost: 1 },
                    body: { boost: 1 },
                    poemRef: { boost: 1 },
                    meta: { boost: .9 },
                    responsibility: { boost: .9 }
                  },
                  expand: true
                }).map(function (item) {
                  var res = PPS.getResource(item.ref);

                  results.push({
                    type: res.type,
                    subtype: res.subtype,
                    poemRef: res.poemRef,
                    ref: item.ref,
                    score: item.score,
                    title: res.title,
                    responsibility: res.responsibility
                  });
                });

                if (results.length > 0 && q.length > 0) {
                  $searchResults
                    .fadeIn(300)
                    .find('li')
                    .replaceWith('');

                  $.each(results, function (idx, res) {
                    var isPoemMatch = res.type === 'poem';
                    var hasResp = !isPoemMatch || (isPoemMatch && res.subtype !== 'ee');
                    var $line = $('<li class="search-result"></li>');
                    $line.addClass(isPoemMatch ? 'poem-match' : 'ctx-match');

                    var $link = $('<a href="/poems/ee/' + res.poemRef + (isPoemMatch ? '' : '#' + res.ref.substring(res.ref.indexOf('-') + 1)) + '"></a>');

                    var $resNumberChunk = $('<span class="pn"></span>');
                    var $resTitleChunk = $('<h4 class="pt"></h4>');
                    var $resRespChunk = $('<div class="pa"></div>');

                    $resNumberChunk.text(res.poemRef);
                    $resTitleChunk.text(res.title);

                    $link
                      .append($resNumberChunk)
                      .append($resTitleChunk);

                    if (hasResp) {
                      $resRespChunk.text(res.responsibility);
                      $link.append($resRespChunk)
                    }

                    $line
                      .append($link);

                    $searchResults
                      .find('.results')
                      .append($line);
                  });

                  // Set the initial value for the keyboard nav
                  keyboardPos = 0;

                  // Prevent input blur
                  $('.search-result').on('mousedown', function () {
                    searchItemIsClicked = true;
                  });
                } else {
                  $searchResults.fadeOut(200);
                  keyboardPos = undefined;
                }
              } else {
                $searchResults
                  .find('li')
                  .replaceWith('');

                if (query.length > 0) {
                  $searchResults
                    .find('.results')
                    .append('<li class="init lato">The query is too short.</li>');
                } else {
                  $searchResults.fadeOut(200);
                }

                keyboardPos = undefined;
              }
            }
          }
        )

        $searchInput.on('keyup', function (e) {
          var key = e.keyCode;

          // was up/down/enter pressed with search results present?
          if (
            (key === 38 || key === 40 || key === 13) &&
            keyboardPos !== undefined &&
            !(key === 38 && keyboardPos === 0) &&
            !(key === 13 && keyboardPos === 0)
          ) {
            var $resultListItems = $searchResults.find('.search-result');
            var nOfResults = $resultListItems.length;

            if (key === 38) {
              keyboardPos = (keyboardPos > 1) ?
                keyboardPos - 1 : 1;
            }

            if (key === 40) {
              keyboardPos = (keyboardPos < nOfResults) ?
                keyboardPos + 1 : nOfResults;
            }

            // Show and highlight the item
            $resultListItems.removeClass('highlighted');
            var targetItem = $resultListItems[keyboardPos - 1]
            var $targetItem = $(targetItem);

            // show
            var targetOffset = $targetItem.offset().top;
            var targetHeight = $targetItem.outerHeight();
            var scrollableOffset = $searchResults.offset().top;
            var scrollableHeight = $searchResults.height();
            var scrollableScroll = $searchResults.scrollTop();

            var relativeAdjustmentDown = (targetOffset + targetHeight) - (scrollableHeight + scrollableOffset);
            var relativeAdjustmentUp = scrollableOffset - targetOffset;

            if (relativeAdjustmentDown > 0) {
              $searchResults.scrollTop(scrollableScroll + relativeAdjustmentDown);
            }

            if (relativeAdjustmentUp > 0) {
              var scrollValue = scrollableScroll - relativeAdjustmentUp;
              $searchResults.scrollTop(scrollValue);
            }

            // highlight
            $targetItem.addClass('highlighted');

            // Enter
            if (key === 13) {
              var link = $targetItem.find('a')[0];
              link.click();
            }
          } else {
            searchInputWatcher(e);
          }
        });

        // Blur on esc key hit
        $(document).keyup(function(e) {
          if (e.keyCode === 27) {
            $searchInput.blur();
          }
        });
      }
    },
    addVerCopyImprint: function () {
      var version = this.version;
      var year = new Date().getFullYear();

      var $footer = $('.footer');
      var $imprint = $(`<div class="tpp-version-imprint">${version}</div>`);
      var $logoBox = $footer.find('.logo-box');
      var $copyrightYear = $footer.find('.copyright-year');

      if (
        version &&
        $logoBox.length > 0
      ) {
        $logoBox.append($imprint);
      }

      if (year) {
        $copyrightYear.text(year);
      }
    }
  };

  // Footnote adjustment implementation
  function setNoteNumbersForPrint() {
    var $refs = $('.footnote-ref');

    $.each($refs, function (idx, ref) {
      var $ref = $(ref);
      var $donor = $ref.closest('.poem-note-trigger').next('.t');
      var followingChar = $donor.text().charAt(0);

      if (
        [',', '.', ':', ';', '!', '?', '”', ')', '…']
        .indexOf(followingChar) > -1
      ) {
        var $acceptor = $ref.prev('.t');

        // Add the print only character to the "lemma"
        var $printOnlyEl = $('<span class="print-only"></span>');
        $printOnlyEl.text(followingChar);
        $acceptor.append($printOnlyEl);

        // Tag the real one so it doesn't show in print
        var $printHideEl = $('<span class="print-hide"></span>');
        $printHideEl.text(followingChar);
        $donor.text($donor.text().slice(1)).prepend($printHideEl);
      }
    })
  }

  /* Utility functions */
  // Is this a number?
  function isNumber(obj) {
    return obj !== undefined &&
      typeof(obj) === 'number' &&
      !isNaN(obj);
  }

  // De-bouncer
  function debounce(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this,
        args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait || 200);
      if (callNow) {
        func.apply(context, args);
      }
    };
  }

  // Dashifier
  function dashify(str) {
    if (typeof str !== 'string') {
      throw new TypeError('expected a string');
    }

    return str.trim()
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\W/g, function (m) {
        return /[À-ž]/.test(m) ? m : '-';
      })
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-')
      .toLowerCase();
  }
})(jQuery);
