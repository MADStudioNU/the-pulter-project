var TPP = (function ($) {
  // Enable caching globally
  $.ajaxSetup({
    cache: true
  });

  return {
    version: undefined,
    gtag: 'UA-122500056-2',
    getPoemIndex: function () {
      return $.get('/pulter-manifest.json');
    },
    getSearchScript: function () {
      return $.getScript('/search/pulter-search.js');
    },
    initHome: function () {
      console.log('%c Welcome to the Pulter Project.', 'background: #FBF0FF; color: #330657;');
      console.log('%c⚡ MADStudio', 'background: #FBF0FF; color: #330657;');

      // Isotope instance for the poem index
      var $i;

      // Isotope instance for the Connection index
      var $ii;
      // An object to store connection active filters
      var ii_filters = {};

      // Local vars
      // URL hash ('undefined' if no hash present)
      var hash = window.location.hash.split('#')[1];

      // Store
      var pulterState = pulterState || store.namespace('pulterState');

      // DOM variables
      var $body = $('#page');
      var $content = $body.find('#c');
      var $poemSection = $content.find('#poems-section');
      var $connectionSection = $content.find('#connections-section');
      var $connectionFiltersBox = $connectionSection.find('.connection-filters');
      var $connectionAuthorFilterGroup = $connectionFiltersBox.find('#connection-author-filters');
      var $connectionKeywordFilterGroup = $connectionFiltersBox.find('#connection-keyword-filters');
      var $connectionEmptySetMessage = $connectionSection.find('.empty-set-message');
      var $poemListGrid = $poemSection.find('.poem-list');
      var $connectionListGrid = $connectionSection.find('.connections-list');
      var $intro = $body.find('#intro');
      var $actions = $intro.find('.actions');
      var $toPoemsAction = $actions.find('#to-poems');
      var $toConnectionsAction = $actions.find('#to-connections');
      var $dropUps = $actions.find('.pseudo');
      var $toIntro = $body.find('.to-intro');
      var $poemFSStatus = $content.find('.status-box.for-poems').find('.status');
      var $connectionsFSStatus = $content.find('.status-box.for-connections').find('.status');
      var $filterStatus = $connectionsFSStatus.find('.filter-status');
      var $connectionTriggers = $connectionListGrid.find('.connection');
      var $resourceTypeTabBox = $content.find('.resource-type-tabs');
      var $toolbar = $content.find('.toolbar');
      var $resourceTypeTabs = $resourceTypeTabBox.find('.resource-tab');
      var $connectionsTab = $resourceTypeTabBox.find('.connections-tab');
      var $poemsTab = $resourceTypeTabBox.find('.poems-tab');

      /* Other variables to hold useful info (state) */
      // An array to hold all the filter classes that are currently displayed
      var allClassesDisplayed = [];

      // Initial state of UI
      setTimeout(function () {
        if (hash && hash !== '0') {
          // Check if the Connections tab is requested
          if (hash === 'poems') {
            toPoems()
          } else if (hash === 'connections') {
            toConnections();
          }

          $content.fadeIn();
          $intro.addClass('animation-skipped');
        } else {
          // Load intro
          $intro.fadeIn();

          // If not played recently
          if (!pulterState.get('enoughSplashAnimation')) {
            playSplashAnimation();
            pulterState.set('enoughSplashAnimation', true, 60 * 60 * 24);
          } else {
            // Otherwise, skip and just show elements
            $('.anmtd, .eventually, .actions-box').addClass('skipped');
          }
        }
      }, 0)

      // Various click event handlers
      // To the splash page
      $toIntro.on('click', toIntro);

      // To Poem Index
      $toPoemsAction.on('click', function () {
        activatePoemIndex();
        initOrAdjustPoemIsotope();
      });

      // To Connection Index
      $toConnectionsAction.on('click', function() {
        activateConnectionIndex();
      });

      $dropUps.on('click', function () {
        $(this).toggleClass('expanded');
      });

      // Poem links on curation cards
      $connectionTriggers
        .find('.poem-new-tab')
        .on('click', function (e) {
          e.stopPropagation();
        });

      // Connection lightbox
      $connectionTriggers.on('click', function () {
        var type = $(this).data('connection-type');
        var hash = $(this).data('connection-hash');
        var title = $(this).data('connection-title');
        var poemId = $(this).data('poem-id');
        var poemTitle = $(this).data('poem-title');

        if (hash && type) {
          TPP.openConnectionLightbox(
            type,
            hash,
            title,
            poemId,
            poemTitle,
            'home'
          );
        }

        return false;
      });

      // Prevent note triggers from switching to a different tab
      $resourceTypeTabs
        .find('.note-trigger')
        .on('click', function (e) {
        e.stopPropagation();
      });

      // Resource type tabs toggle
      $resourceTypeTabs.on('click', function (event, uiOnly) {
        var $tab = $(this);
        if ($tab.hasClass('active')) {
          return false;
        } else {
          var type = $tab.data('resource-type');

          if (type) {
            $resourceTypeTabs.toggleClass('active');
            var classToAdd = type + '-on';
            $tab
              .closest('.resource-type-tabs')
              .attr('class', 'resource-type-tabs ' + classToAdd);

            if (!uiOnly) {
              if (type === 'connections') {
                window.location.hash = 'connections';
              }

              if (type === 'poems') {
                window.location.hash = 'poems';
              }
            }
          } else {
            return false;
          }
        }
      });

      // Check if we need to open a connection right away
      var $connectionListItem = getConnectionElFromHash(hash);

      // If it's present
      if ($connectionListItem) {
        // Switch to the Connections tab (UI only mode)...
        activateConnectionIndex(true);
        initOrAdjustConnectionIsotope();

        // ... and open the connection
        TPP.openConnectionLightbox(
          $connectionListItem.dataset.connectionType,
          $connectionListItem.dataset.connectionHash,
          $connectionListItem.dataset.conectionTitle,
          $connectionListItem.dataset.poemId,
          $connectionListItem.dataset.poemTitle,
          'home'
        );
      }

      // Hash change event logic
      function onHashChange() {
        var h = window.location.hash.split('#')[1];

        if(!h) {
          toIntro();
        } else if (h === 'poems') {
          toPoems();
        } else if (h === 'connections') {
          toConnections();
        }
      }

      // Attaching the event listener
      window.addEventListener('hashchange', onHashChange);

      // Scroll watcher
      var scrollWatcher = debounce(
        function () {
          var windowScrolled = $(window).scrollTop();

          // If on Poem Index
          if ($poemSection.hasClass('enabled')) {
            if (windowScrolled >= $poemListGrid.offset().top) {
              $body.addClass('scrolled');
            } else {
              $body.removeClass('scrolled');
            }
          }

          // If on Connection Index
          if ($connectionSection.hasClass('enabled')) {
            if (windowScrolled >= $connectionListGrid.offset().top) {
              $body.addClass('scrolled');
            } else {
              $body.removeClass('scrolled');
            }
          }
        }, 300
      );

      // Attaching the event handler
      $(window).on('scroll', scrollWatcher);

      // Become aware of the PP environment
      var manifest;
      var numPoems;
      var numConnections = $connectionTriggers.length;
      var indexRequest = this.getPoemIndex();

      indexRequest
        .done(function (data) {
          manifest = data;
          numPoems = manifest.poems.length;

          if (manifest.poems && numPoems > 0) {
            resetPoemStatusString();
          }

          if (manifest.connections) {
            buildConnectionFilters(manifest.connections);
          }
        })
        .fail(function () {
          console.log('Manifest loading error! Falling back to id based HTML linking.');
        });

      // Version imprint
      this.addVerCopyImprint();

      // Try to enable search
      this.enableSearch($body);

      function toIntro() {
        $intro.fadeIn();
        $content.fadeOut(200);
        window.location.hash = '';
      }

      function activatePoemIndex(uiOnly) {
        $connectionSection.removeClass('enabled').hide();
        $content.fadeIn();
        $intro.hide();
        $poemSection.addClass('enabled').fadeIn();
        $poemsTab.trigger('click', uiOnly);
      }

      function activateConnectionIndex(uiOnly) {
        $poemSection.removeClass('enabled').hide();
        $content.fadeIn();
        $intro.hide();
        $connectionSection.addClass('enabled').fadeIn();
        $connectionsTab.trigger('click', uiOnly);
      }

      function getConnectionElFromHash(hash) {
        var selector = '.connection[data-connection-hash="' + hash + '"]';
        var $el = $connectionListGrid.find(selector);
        return $el.length ? $el[0] : false;
      }

      function buildConnectionFilters(connectionFilterObject) {
        // Assemble connection filter lists
        var contributorListItems = connectionFilterObject.contributors
          .map(function (contributor) {
            return '<li class="connection-filter" data-filter=".' + contributor.className + '">' + contributor.displayName + '</li>';
          });

        var keywordListItems = connectionFilterObject.keywords
          .map(function (contributor) {
            return '<li class="connection-filter" data-filter=".' + contributor.className + '">' + contributor.displayName + '</li>';
          });

        $connectionAuthorFilterGroup.append($(contributorListItems.join('')));
        $connectionKeywordFilterGroup.append($(keywordListItems.join('')));

        $connectionFiltersBox
          .find('.connection-filter')
          .on('click', function () {
            var $this = $(this);
            var filterGroup = $this.parent().data('filter-group');
            var filterTerm = $this.data('filter');

            // Update the UI
            // If author is selected then switch to a requested one
            if (filterGroup === 'author') {
              $this.siblings().removeClass('on');
              $this.toggleClass('on');
            }

            // If keyword is selected then add/remove the requested one
            if (filterGroup === 'keyword') {
              $this.toggleClass('on');
            }

            // Pass the data to the dedicated filtering function
            setConnectionFilter(filterGroup, filterTerm);
        })

        $connectionFiltersBox
          .find('.dismiss')
          .on('click', function () {
            $connectionFiltersBox.removeClass('expanded');

            $toolbar
              .find('.connection-index-filters')
              .find('.all-filters-trigger')
              .removeClass('enabled');
          });
      }

      // Initialize the Isotope instances
      // For the poems
      function initOrAdjustPoemIsotope() {
        // The poems
        if (!$i) {
          setTimeout(function () {
            $i = $poemListGrid.isotope({
              layoutMode: 'vertical'
            });

            // Click event handlers
            $poemListGrid
              .find('.filter-tag')
              .on('click', function () {
                var $self = $(this);
                var keyword = $self.data('filter');

                $poemFSStatus.addClass('hi');
                $i.isotope({ filter: keyword });
                $('html,body').scrollTop(0);

                var num = $i.isotope('getFilteredItemElements').length;

                $poemFSStatus
                  .find('.filter-status')
                  .text(
                    num +
                    (+num > 1 ? ' poems ' : ' poem ') +
                    ' matching ' + keyword.slice(1).toUpperCase().replace('/-/g', ' ') + ' '
                  );

                return false;
              });

            // Reset action
            $poemFSStatus
              .find('.status-reset')
              .on('click', function () {
                $i.isotope({ filter: '*' });
                $poemFSStatus.removeClass('hi');
                resetPoemStatusString();
              });
          }, 100);
        } else {
          $i.isotope('layout');
        }
      }

      // For the connections
      function initOrAdjustConnectionIsotope() {
          if (!$ii) {
            setTimeout(function () {
              $ii = $connectionListGrid.isotope({
                layoutMode: 'packery',
                itemSelector: '.connection'
              });

              var totalNumberOfItems = $ii.isotope('getItemElements').length;
              resetConnectionStatusString(totalNumberOfItems);

              // Click event handlers
              var $connectionTypeFilterButtons = $toolbar
                .find('.connection-index-filters')
                .find('.filter');

              $connectionTypeFilterButtons
                .on('click', '.label', function () {
                  var $this = $(this);
                  var isFilterDropdownTrigger = $this.hasClass('all-filters-trigger');

                  if (isFilterDropdownTrigger) {
                    $this.toggleClass('enabled');
                    $connectionFiltersBox.toggleClass('expanded');
                  } else {
                    var filterGroup = $this.data('filter-group');
                    var filterTerm = $this.data('filter');

                    if (!$this.hasClass('active')) {
                      $connectionTypeFilterButtons
                        .find('.label')
                        .removeClass('active');
                      $this.toggleClass('active');
                    }

                    setConnectionFilter(filterGroup, filterTerm);
                  }
                });

              // Reset action
              $connectionsFSStatus
                .find('.status-reset')
                .on('click', function () {
                  $ii.isotope({ filter: '*' });
                  $connectionsFSStatus.removeClass('hi');
                  $connectionTypeFilterButtons.find('.label').removeClass('active');

                  // reset the counter
                  resetConnectionStatusString(totalNumberOfItems);
                  resetConnectionFilters();
                });
            }, 100);
          } else {
            $ii.isotope('layout');
          }
      }

      function toPoems() {
        activatePoemIndex();
        initOrAdjustPoemIsotope();
      }

      function toConnections() {
        activateConnectionIndex();
        initOrAdjustConnectionIsotope();
      }

      function setConnectionFilter(filterGroup, filterTerm) {
        // Default filtering logic (one at a time)
        if (filterGroup !== 'keyword') {
          // If the filter is already active, remove it
          if (ii_filters[filterGroup] === filterTerm) {
            // Toggle logic for the author filter
            if (filterGroup === 'author') {
              delete ii_filters[filterGroup];
            }
          } else {
            ii_filters[filterGroup] = filterTerm;
          }
        } else {
          // Filtering logic for keywords is different (one or more at a time)
          // get current value of keyword filterGroup
          var _keywords =
            ii_filters.keyword ?
              ii_filters.keyword
                .split('.')
                .splice(1)
                .map(function (keyword) {
                  return '.' + keyword;
                }) : [];

          // If the filter is already active, remove it
          if (_keywords.indexOf(filterTerm) > -1) {
            _keywords = _keywords.filter(function (keyword) {
              return keyword !== filterTerm;
            });
          } else {
            // Otherwise, add it
            _keywords.push(filterTerm);
          }

          // Write the resulting string back to the filter object
          ii_filters.keyword = _keywords.join('');
        }

        // Peek into the filter object
        // console.log(ii_filters);

        // Build the final filter string
        var finalFilterValue = Object.keys(ii_filters)
          .map(function (key) {
            return ii_filters[key];
          })
          .join('');

        // Perform the filtering
        $ii.isotope({
          filter: finalFilterValue
        });

       // Additional logic for the UI
        var currentFilteredSet = $ii.isotope('getFilteredItemElements');

        // How big is the set?
        var num = currentFilteredSet.length;

        // Start new set of classes
        allClassesDisplayed.length = 0;

        if (num < numConnections) {
          currentFilteredSet.forEach(function (filteredItem) {
            var itemClassList = filteredItem.className.split(' ');
            allClassesDisplayed = allClassesDisplayed.concat(itemClassList);
          })
        } else {
          allClassesDisplayed.length = 0;
        }

        // Logic of "muting" the filter triggers that are not present in the currently filtered set

        console.log(finalFilterValue)

        // todo: optimize the logic below
        if (
          filterGroup === 'type' ||
          filterGroup === 'keyword'
        ) {
            $connectionFiltersBox
              .find('.connection-filter')
              .removeClass('muted')
              .each(function (index, triggerElement) {
                var $trigger = $(triggerElement);

                if (allClassesDisplayed.indexOf($trigger.data('filter').slice(1)) === -1) {
                  $trigger.addClass('muted');
                }
              })
        }

        if (filterGroup === 'author') {
          $connectionKeywordFilterGroup
            .find('.connection-filter')
            .removeClass('muted')
            .each(function (index, triggerElement) {
              var $trigger = $(triggerElement);

              if (allClassesDisplayed.indexOf($trigger.data('filter').slice(1)) === -1) {
                $trigger.addClass('muted');
              }
            })

          // If
          if (!ii_filters['author']) {
            $connectionAuthorFilterGroup
              .find('.connection-filter')
              .removeClass('muted')
              .each(function (index, triggerElement) {
                var $trigger = $(triggerElement);

                if (allClassesDisplayed.indexOf($trigger.data('filter').slice(1)) === -1) {
                  $trigger.addClass('muted');
                }
              })
          }
        }

        // Show everything if no filters are active
        if (num === numConnections) {
          $connectionFiltersBox
            .find('.connection-filter')
            .removeClass('muted');
        }

        // $connectionAuthorFilterGroup
        // $connectionKeywordFilterGroup

        // Special case: if there's only one result select all the
        if (num === 1) {}

        // Indicate that the filter state is active if the filtered set is smaller than all the connections
        if (num < numConnections) {
          $connectionsFSStatus.addClass('hi');
        } else  {
          $connectionsFSStatus.removeClass('hi');
        }

        // Make sure the beginning of the resulting set is visible
        $('html,body').scrollTop(0);

        /* Update the filter status string */
        // What type of connection is showing?
        var filteredConnectionType = ii_filters['type'] ? ii_filters['type'].slice(1) : 'connection';

        $filterStatus
          .find('.type')
          .text(
            'Showing ' + num + ' ' +
            filteredConnectionType.charAt(0).toUpperCase() +
            filteredConnectionType.slice(1) +
            (num > 1 ? 's' : '')
          );

        if (ii_filters['author']) {
          var $authorTxt = $('<span class="txt"></span>');
          var className = ii_filters['author'].slice(1);
          var displayName = manifest.connections.contributors
            .filter(function (contributor) {
              return contributor.className === className;
            })[0].displayName;

          $filterStatus
            .find('.author')
            .text('')
            .append($authorTxt)
            .find('.txt')
            .text(displayName)
            .before(' by ');
        } else {
          $filterStatus
            .find('.author')
            .text('');
        }

        if (ii_filters['keyword']) {
          var $keywordsTxt = $('<span class="txt"></span>');

          var displayNames = ii_filters['keyword']
            .split('.')
            .splice(1)
            .map((function (keyword) {
              return manifest.connections.keywords
                .filter(function (keywordObj) {
                  return keywordObj.className === keyword;
                })[0].displayName;
            }))
            .join(', ');

          $filterStatus
            .find('.keywords')
            .text('')
            .append($keywordsTxt)
            .find('.txt')
            .text(displayNames)
            .before(' matching ');
        } else {
          $filterStatus
            .find('.keywords')
            .text('');
        }

        // Display empty set messages if needed
        if (num === 0) {
          var emptySetMessage = 'Nothing matches the filters';
          resetConnectionFilterParts();
          $filterStatus.find('.type').text(emptySetMessage);
          $connectionEmptySetMessage.fadeIn(200);
        } else {
          $connectionEmptySetMessage.hide();
        }
      }

      function resetConnectionFilters() {
        // UI
        $connectionFiltersBox
          .find('.connection-filter')
          .removeClass('on');

        $connectionEmptySetMessage.hide();

        $connectionFiltersBox
          .find('.connection-filter')
          .removeClass('muted')

        // Model
        ii_filters = {};
        $ii.filter('*');
        allClassesDisplayed.length = 0;
      }

      function resetPoemStatusString() {
        $poemFSStatus
          .find('.filter-status')
          .text(manifest.poems.filter(
            function(poem) {
              return poem.isPublished;
            }).length + ' poems '
        );
      }

      function resetConnectionFilterParts () {
        $filterStatus.find('.type').text('');
        $filterStatus.find('.author').text('');
        $filterStatus.find('.keywords').text('');
      }

      function resetConnectionStatusString(totalNumberOfConnections) {
        resetConnectionFilterParts();

        $connectionsFSStatus
          .find('.filter-status')
          .find('.type')
          .text('Showing all ' + totalNumberOfConnections + ' Connections');
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
          var poemManifest;
          var manifestOfPublished;
          var indexRequest = TPP.getPoemIndex();

          // Show page contents
          renderPoemElements();

          // Version imprint
          TPP.addVerCopyImprint();

          indexRequest
            .done(function (data) {
              poemManifest = data.poems;
              manifestOfPublished = poemManifest.filter(function (poem) {
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
            if (!$poster.data('long-headnote')) {
              setPosterImage($poster, config.id, 'd');
            }
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
              var selector = '.ctx[data-curation-hash="' + hash + '"]';
              var $curationEl = $ctxs.find(selector);
              var curationTitle = $curationEl.find('a').data('curation-title');

              if ($curationEl.length) {
                TPP.openConnectionLightbox(
                  'curation',
                  hash,
                  curationTitle,
                  config.id,
                  config.title,
                  'poem'
                );
              }
            }

            // Curation lightbox triggers
            $ctxs.find('.ctx').off().on('click', '.text', function (e) {
              var $target = $(e.delegateTarget);
              var cHash = $target.data('curation-hash');
              var cTitle = $target.find('a').data('curation-title');
              $target.find('a').blur();

              if (cHash) {
                TPP.openConnectionLightbox(
                  'curation',
                  cHash,
                  cTitle,
                  config.id,
                  config.title,
                  'poem'
                );
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
                // not the upper edge, but a bit lower
                'background-position': 'center 10%'
              });
            }
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
              var poemObj = poemManifest.filter(function (el) {
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
          'Unable to initialize the poem. The poem id is invalid or it wasn’t provided.'
        );
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
                    var isAmplifiedEdition = isPoemMatch && res.subtype.indexOf('a') === 0;
                    var isExploration = !isPoemMatch && res.subtype === 'exploration';
                    var $line = $('<li class="search-result"></li>');
                    $line.addClass(isPoemMatch ? 'poem-match' : 'ctx-match');

                    // Link to the resource
                    var resourceHref =
                      isExploration ?
                        '/#' + res.ref :
                        ('/poems' + (isAmplifiedEdition ? '/ae/' : '/ee/') +
                        res.poemRef +
                        (
                          isPoemMatch ?
                            (isAmplifiedEdition ? '#' + res.subtype : '') :
                            '#' + res.ref.substring(res.ref.indexOf('-') + 1)
                        ));

                    var $link = $('<a target="_blank" href="' + resourceHref + '"></a>');
                    var $resNumberChunk = $('<span class="pn"></span>');
                    var $resTitleChunk = $('<h4 class="pt"></h4>');
                    var $resLabelChunk = $('<span class="pe"></span>');
                    var $resRespChunk = $('<div class="pa"></div>');

                    $resNumberChunk.text(res.poemRef);
                    $resTitleChunk.text(res.title);
                    $resLabelChunk.text(getResourceLabel(res.type, res.subtype) + ' by ');

                    $link
                      .append($resNumberChunk)
                      .append($resTitleChunk);

                    $resRespChunk
                      .text(res.responsibility)
                      .prepend($resLabelChunk);

                    $link.append($resRespChunk)

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

            // Highlight
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
      var $imprint = $('<div class="tpp-version-imprint">' + version + '</div>');
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
    },
    openConnectionLightbox: function (
      type,
      requestedHash,
      connectionTitle,
      correspondingPoemId,
      correspondingPoemTitle,
      triggerSource
    ) {
      var connectionPageUrl;

      if (type === 'curation') {
        connectionPageUrl = '/curations/c' + correspondingPoemId + '-' + requestedHash + '.html';
      } else if (type === 'exploration') {
        connectionPageUrl = '/explorations/' + requestedHash + '.html';
      }

      if (connectionPageUrl) {
        var oldHash = window.location.hash;
        var connectionAjaxPath = connectionPageUrl + ' #content';
        var loadingMessage = 'Loading the ' + type + '…';

        $.featherlight(connectionAjaxPath, {
          variant: 'connection',
          closeIcon: '',
          type: 'ajax',
          openSpeed: 400,
          closeSpeed: 200,
          otherClose: '.dismiss',
          loading: '<p class="lato spinner">' + loadingMessage + '</p>',
          beforeOpen: function () {
            if (requestedHash) {
              window.location.hash = requestedHash;
            }
          },
          afterOpen: function() {
            gtag('config', TPP.gtag, {
              'page_title': connectionTitle || requestedHash,
              'page_path': connectionPageUrl
            });

            if (type === 'curation') {
              var indexSpan = '<span class="idx lato">' + correspondingPoemId + '</span>';
              var titleSpan = '<span class="t">' + correspondingPoemTitle + '</span>';
              var correspondingPoemUrl = '/poems/ae/' + correspondingPoemId;
              var out = '<a href="' + correspondingPoemUrl + '" target="_blank" class="poem-ref">' + indexSpan + titleSpan + '</a>';

              var $lightboxContent = $('.featherlight-content');
              $lightboxContent.prepend(out);
              $lightboxContent
                .find('.poem-ref')
                .on('click', function () {
                  if (triggerSource === 'poem') {
                    $.featherlight.current().close();
                    return false;
                  }
                });
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
            // If on the poem page
            if (triggerSource === 'poem') {
              window.location.hash = '0';
              // If on homepage
            } else if (triggerSource === 'home') {
              if (oldHash !== '#' + requestedHash) {
                window.location.hash = oldHash;
              } else {
                window.location.hash = 'connections';
              }
            }
          }
        });
      }

      return false;
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

        // Tag the real one, so it doesn't show in print
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

  // Resource label getter
  function getResourceLabel(type, subtype) {
    var label = '';

    if (subtype.indexOf('a') === 0) {
      label = 'Amplified Edition';
    } else if (subtype === 'ee') {
      label = 'Elemental Edition';
    } else if (subtype === 'curation') {
      label = 'Curation';
    } else if (subtype === 'exploration') {
      label = 'Exploration';
    }

    return label;
  }
})(jQuery);
