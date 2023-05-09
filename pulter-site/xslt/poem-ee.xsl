<?xml version="1.0" encoding="UTF-8"?>

<!--suppress CheckValidXmlInScriptTagBody -->
<xsl:stylesheet version="1.0" exclude-result-prefixes="tei" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0">
  <xsl:strip-space elements="*"/>
  <xsl:output omit-xml-declaration="yes" indent="no"/>

  <!-- INCLUDES BEGIN  -->
  <xsl:include href="poems.xsl"/>
  <xsl:include href="dropcaps.xsl"/>
  <!-- INCLUDES END  -->

  <!-- VARIABLES BEGIN  -->
  <xsl:variable name="resourceId" select="/tei:TEI/@xml:id"/>
  <xsl:variable name="poemID" select="substring-after($resourceId, 'mads.pp.')"/>
  <xsl:variable name="isPublished" select="boolean(count($witnesses[starts-with(@xml:id, $elementalEditionId)]) &gt; 0)" />
  <xsl:variable name="projectName">The Pulter Project</xsl:variable>
  <xsl:variable name="elementalEditionId">ee</xsl:variable>
  <xsl:variable name="poemPosterObject">
    <xsl:call-template name="poemPoster">
      <xsl:with-param name="poemId">
        <xsl:value-of select="$poemID"/>
      </xsl:with-param>
    </xsl:call-template>
  </xsl:variable>

  <xsl:variable name="hasCurations">
    <xsl:call-template name="hasCurations">
      <xsl:with-param name="poemId">
        <xsl:value-of select="$poemID"/>
      </xsl:with-param>
    </xsl:call-template>
  </xsl:variable>

  <xsl:variable name="fullTitle">
    <xsl:choose>
      <xsl:when test="//tei:titleStmt/tei:title != ''">
        <xsl:value-of select="//tei:titleStmt/tei:title"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:text>Coming soon</xsl:text>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="truncatedTitle">
    <xsl:call-template name="truncateText">
      <xsl:with-param name="string" select="$fullTitle"/>
      <xsl:with-param name="length" select="40"/>
    </xsl:call-template>
  </xsl:variable>

  <!-- Meta desc witness name chunk -->
  <xsl:variable name="elementalEditionWitnessName">
    <xsl:value-of
      select="normalize-space(//tei:witness[@xml:id = $elementalEditionId]//text()[ancestor::tei:persName])"/>
  </xsl:variable>

  <!-- Meta desc witness affiliation chunk  -->
  <xsl:variable name="elementalEditionWitnessPostfix">
    <xsl:choose>
      <xsl:when
        test="translate(normalize-space($elementalEditionWitnessName), $upperCaseAlphabet, $lowerCaseAlphabet) = 'leah knight'">
        <xsl:text>, Brock University, 2018</xsl:text>
      </xsl:when>

      <xsl:when
        test="translate(normalize-space($elementalEditionWitnessName), $upperCaseAlphabet, $lowerCaseAlphabet) = 'wendy wall'">
        <xsl:text>, Northwestern University, 2018</xsl:text>
      </xsl:when>

      <xsl:otherwise>
        <xsl:value-of select="''"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- Meta desc keywords chunk -->
  <xsl:variable name="keywordsMetaDescChunk">
    <xsl:call-template name="poemsTopKeywordsChunk">
      <xsl:with-param name="poemId" select="$poemID"/>
      <xsl:with-param name="numberOfKeywords" select="4"/>
    </xsl:call-template>
  </xsl:variable>

  <!-- TODO:
      check if poem is untitled
  -->
  <xsl:variable name="isUntitled" select="boolean(0)"/>

  <!-- TODO:
      how do we call this untitled poem then?
  -->
  <xsl:variable name="untitledTitle" select="''"/>

  <xsl:variable name="lowerCaseAlphabet" select="'abcdefghijklmnopqrstuvwxyz'"/>
  <xsl:variable name="upperCaseAlphabet" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"/>

  <!-- TODO:
      grab the first line (and truncate if necessary)
  -->
  <xsl:variable name="firstLine">
    <xsl:for-each select="//tei:l[@n=1]//tei:rdg[@wit='#ee']//text()[not(ancestor::tei:note)]">
      <xsl:value-of select="."/>
    </xsl:for-each>
  </xsl:variable>

  <xsl:variable name="firstLineNormalized" select="normalize-space($firstLine)"/>

  <!-- Find the first character of the very first line -->
  <xsl:variable name="dropCap">
    <xsl:choose>
      <!-- Special case for Poem 32 that starts with a “ff” ligature -->
      <xsl:when test="$poemID = 32">
        <xsl:value-of select="'ff'"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="translate(substring($firstLineNormalized, 1, 1), $upperCaseAlphabet, $lowerCaseAlphabet)"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- Witnesses -->
  <xsl:variable name="witnesses" select="//tei:witness[@xml:id]"/>
  <!-- VARIABLES END -->

  <!-- TEMPLATES BEGIN -->
  <!-- Root -->
  <xsl:template match="/">
    <html lang="en">
      <xsl:call-template name="htmlHead"/>
      <body>
        <xsl:attribute name="class">
          <xsl:value-of select="concat('pp ee single-poem poem-', $poemID)"/>
        </xsl:attribute>

        <xsl:call-template name="mainContainer"/>

        <!-- Vendor scripts -->
        <script type="text/javascript">
          <xsl:attribute name="src">
            <xsl:value-of select="'/scripts/vendors/vendors.js'"/>
          </xsl:attribute>
          <xsl:text> </xsl:text>
        </script>

        <!-- The app -->
        <script type="text/javascript">
          <xsl:attribute name="src">
            <xsl:value-of select="'/scripts/app.js'"/>
          </xsl:attribute>
          <xsl:text> </xsl:text>
        </script>

        <!-- Init -->
        <script>
          <xsl:value-of select="'TPP.initPoem({'"/>
          <xsl:value-of select="concat('id: ', $poemID)"/>
          <xsl:value-of select="concat(', title: &quot;', $fullTitle, '&quot;')"/>
          <xsl:value-of select="concat(', isPublished: ', string($isPublished))"/>
          <xsl:value-of select="concat(', poster: ', $poemPosterObject)"/>
          <xsl:value-of select="concat(', hasCtx: ', $hasCurations)"/>
          <xsl:value-of select="'});'"/>
        </script>
      </body>
    </html>
  </xsl:template>

  <!-- HTML Head -->
  <xsl:template name="htmlHead">
    <head>
      <script async="true" src="//www.googletagmanager.com/gtag/js?id=UA-122500056-2"><xsl:comment/></script>
      <script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'UA-122500056-2');</script>
      <meta charset="utf-8"/>
      <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
      <meta name="description" content="A poem by Hester Pulter (ca. 1605-1678){$keywordsMetaDescChunk}. Elemental Edition, edited by Leah Knight (Brock University) and Wendy Wall (Northwestern University)."/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
      <link rel="manifest" href="/site.webmanifest"/>
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"/>
      <meta name="msapplication-TileColor" content="#da532c"/>
      <meta name="theme-color" content="#282828"/>
      <meta property="og:title" content="{$fullTitle} | Elemental Edition" />
      <meta name="og:description" content="A poem by Hester Pulter (ca. 1605-1678){$keywordsMetaDescChunk}. Elemental Edition, edited by Leah Knight (Brock University) and Wendy Wall (Northwestern University)." />
      <meta property="og:image" content="https://pulterproject.northwestern.edu/images/headnote-posters/h{$poemID}og.jpg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@pulterproject" />
      <meta name="twitter:creator" content="@wendywall61" />
      <title>
        <xsl:value-of select="concat(
                    $fullTitle,
                    ' | ',
                    'Elemental Edition'
                    )"/>
      </title>
      <link rel="stylesheet" type="text/css" href="/styles/styles.css"/>
    </head>
  </xsl:template>

  <!-- Main container -->
  <xsl:template name="mainContainer">
    <div class="mc">
      <div class="masthead">
        <div class="content">
          <a class="to-index" href="/#poems">
            <img class="logo" src="/images/pp-logo-comp.svg"/>
          </a>
          <div class="pp-search-box">
            <div class="search">
              <input id="search-input" type="text" placeholder="Search the site" maxlength="50" autocomplete="off" />
              <div class="results-box">
                <ul class="results">
                  <li class="init">No results</li>
                </ul>
              </div>
            </div>
          </div>
          <div class="tools">
            <div class="toggles">
              <div class="edition-toggle toggle">
                <a href="#0" class="curr">Elemental</a>
                <a href="/poems/vm/{$poemID}" target="_blank" title="Open this poem in the the comparison tool" class="to-vm">
                  <img class="i" src="/images/compare-icon-b.svg"/>
                </a>
                <a href="/poems/ae/{$poemID}" title="Switch to the Amplified Edition">Amplified</a>
              </div>
              <div class="page-toggle toggle">
                <a href="#0">Manuscript</a>
              </div>
              <div class="gloss-toggle toggle">
                <a href="#0">Notes</a>
              </div>
              <div class="lines-toggle toggle">
                <a href="#0">#</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <xsl:element name="div">
        <xsl:attribute name="id">
          <xsl:value-of select="'poem-sheet-list'"/>
        </xsl:attribute>
        <xsl:choose>
          <xsl:when test="$isPublished">
            <xsl:call-template name="poemContainer">
              <xsl:with-param name="witId" select="$elementalEditionId"/>
            </xsl:call-template>
          </xsl:when>
          <xsl:otherwise>
            <xsl:element name="section">
              <xsl:attribute name="class">
                <xsl:value-of select="'poem collapsed not-yet'"/>
              </xsl:attribute>
              <header>
                <div><h1 class="dynamic-title poem-title-line sssi-regular"></h1></div>
              </header>
              <main class="lato it">
                <div class="poem-body">
                  <ul class="line-sims">
                    <li></li>
                    <li></li>
                    <li></li>
                  </ul>
                  <p class="message">The Elemental Edition of this poem has not been published yet.<br/>Please check back later.</p>
                </div>
                <div class="not-yet-actions">
                  <a class="pp-action" href="#" onclick="window.history.go(-1);return false;">Go back</a>
                  <a class="pp-action" href="/#poems">Poem index</a>
                </div>
              </main>
              <footer class="poem-footer">
                <img class="separator" src="/images/macron.svg" alt="Macron symbol indicating the end of a poem."/>
              </footer>
            </xsl:element>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:element>
      <xsl:if test="$hasCurations = 'true' and $isPublished">
        <section id="ctxs" class="lato">
          <header>
            <div class="label">
              <img src="/images/pp-formal.jpg"/>
              <span>Curations</span>
            </div>
            <div class="id-box">
              <a href="#poem-sheet-list">
                <span class="lato idx">
                  <xsl:value-of select="$poemID"/>
                </span><h3>
                <xsl:call-template name="truncateText">
                  <xsl:with-param name="string" select="$fullTitle"/>
                  <xsl:with-param name="length" select="22"/>
                </xsl:call-template>
              </h3>
              </a>
            </div>
            <div class="explanatory curation-blurb muted"><span class="it">Curations</span> offer an array of verbal and visual materials that invite contemplation of different ways in which a particular poem might be contextualized. Sources, analogues, and glimpses into earlier or subsequent cultural phenomena all might play into possible readings of a given poem. <span class="muter asap">Don't show again</span></div>
          </header>
          <ul class="ctxs">
            <xsl:call-template name="curations">
              <xsl:with-param name="poemId" select="$poemID"/>
            </xsl:call-template>
          </ul>
        </section>
      </xsl:if>
    </div>
    <footer id="footer" class="lato">
      <div class="footer-box">
        <div class="footer">
          <div class="left">
            <div class="logo-box">
              <a href="/">
                <img class="logo" src="/images/pp-formal.jpg"/>
                <h5>T<span class="small-cap">he</span> P<span class="small-cap">ulter</span> P<span class="small-cap">roject</span></h5>
              </a>
            </div>
            <p>Copyright © <span class="copyright-year">2023</span><br/> Wendy Wall, Leah Knight, Northwestern University, <a href="/about-the-project.html#who">others</a>.</p>
            <p>Except where otherwise noted, this site is licensed<br/> under a Creative Commons CC BY-NC-SA 4.0 License.</p>
          </div><nav class="right">
          <h6>
            <a href="/how-to-cite-the-pulter-project.html">How to cite</a>
          </h6>
          <h6>
            <a href="/about-the-project.html">About the project</a>
          </h6>
          <h6>
            <a href="/about-project-conventions.html">Editorial conventions</a>
          </h6>
          <h6>
            <a href="/about-hester-pulter-and-the-manuscript.html">Who is Hester Pulter?</a>
          </h6>
          <h6>
            <a href="/scholarship.html">Scholarship</a>
          </h6>
          <h6>
            <a href="mailto:pulterproject@gmail.com" target="_blank">Get in touch</a>
          </h6>
        </nav>
        </div>
      </div>
      <a class="app-reset" onclick="TPP.resetState(); return false;">
        <xsl:text> </xsl:text>
      </a>
    </footer>
  </xsl:template>

  <!-- Poem pane -->
  <xsl:template name="poemContainer">
    <xsl:param name="witId"/>
    <section id="ee" class="poem collapsed">
      <a href="#" title="To the previous poem" class="nav prev" data-dir="prev">
        <img src="/images/triangle-down-w.svg"/>
      </a>
      <a href="#" title="To the next poem" class="nav next" data-dir="next">
        <img src="/images/triangle-down-w.svg"/>
      </a>
      <div class="drop-cap-box">
        <div class="initially">
          <xsl:call-template name="dropCapInitially">
            <xsl:with-param name="dropCap" select="$dropCap"/>
          </xsl:call-template>
        </div>
        <div class="eventually">
          <xsl:call-template name="dropCapEventually">
            <xsl:with-param name="dropCap" select="$dropCap"/>
          </xsl:call-template>
        </div>
        <xsl:text> </xsl:text>
      </div>
      <div class="print-only print-attribution-box">
        <div>
          <img class="logo" src="/images/pp-formal.jpg"/>
          <div class="attribution">T<span class="small-cap">he</span> P<span class="small-cap">ulter</span> P<span class="small-cap">roject</span></div>
        </div>
        <div class="url">pulterproject.northwestern.edu</div>
      </div>
      <header>
        <xsl:apply-templates select="//tei:head[not(ancestor::tei:figure)]">
          <xsl:with-param name="witId" select="$witId"/>
        </xsl:apply-templates>
      </header>
      <div class="headnote-toggle">
        <xsl:choose>
          <xsl:when test="//tei:head/tei:app[@type='headnote']/tei:rdg[@wit=concat('#', $witId)]/tei:note[@type='headnote']">
              <div class="pp-action">
                <a href="#"><span class="label"><xsl:text> </xsl:text></span></a>
              </div>
          </xsl:when>
          <xsl:otherwise>
            <xsl:text> </xsl:text>
          </xsl:otherwise>
        </xsl:choose>
      </div>
      <main class="cormorant-garamond">
        <div class="poem-body">
          <xsl:apply-templates select="//tei:body">
            <xsl:with-param name="witId" select="$witId"/>
          </xsl:apply-templates>
        </div>
      </main>

      <footer class="poem-footer">
        <img class="separator" src="/images/macron.svg" alt="Macron symbol indicating the end of a poem."/>
        <div class="meta">
          <div class="witness">
            <p class="nl">Elemental Edition,</p>
            <p><span class="by">edited by</span><xsl:text> </xsl:text><span class="who">Leah Knight</span><xsl:text> </xsl:text><span class="by">and</span><xsl:text> </xsl:text><span class="who">Wendy Wall</span><a href="#" class="editor-note-trigger sssi-regular" data-featherlight-close-icon="" data-featherlight-other-close=".dismiss" data-featherlight="#editorial-note" data-featherlight-variant="editorial-note">i</a></p>
          </div>
        </div>
        <div id="editorial-note" class="editorial-note-box">
          <span class="dismiss"><xsl:text> </xsl:text></span>
          <h3 class="sssi-regular">Editorial Note</h3>
          <div class="c lato">
            <p class="lato">The aim of the elemental edition is to make the poems accessible to the largest variety of readers, which involves modernizing spelling and punctuation as well as adding basic glosses. Spelling and punctuation reflect current standard American usage; punctuation highlights syntax which might otherwise be obscure. Outmoded but still familiar word forms (“thou,” “‘tis,” “hold’st”) are not modernized, and we do not modernize grammar when the sense remains legible.</p>
            <p class="lato">After a brief headnote aimed at offering a “way in” to the poem’s unique qualities and connections with other verse by Pulter or her contemporaries, the edition features a minimum of notes and interpretative framing to allow more immediate engagement with the poem. Glosses clarify synonyms or showcase various possible meanings in Pulter’s time. Other notes identify named people and places or clarify obscure material. We rely (without citation) primarily on the Oxford English Dictionary (OED), the Oxford Reference database, and the King James Version (KJV) of the Bible. When we rely on Alice Eardley’s edition of Pulter’s work, we cite her text generally (“Eardley”); other sources are cited in full. The result is an edition we consider a springboard for further work on Pulter’s poetry.</p>
            <p class="lato">See the full conventions for the elemental edition <a href="/about-project-conventions.html#elemental-edition" target="_blank">here</a>.</p>
          </div>
          <img class="separator print-hide" src="/images/macron.svg" alt="Macron symbol indicating the end of a poem."/>
          <div class="witness-box lato">
            <ul class="witnesses">
              <li class="witness">
                <a href="https://brocku.ca/humanities/english-language-and-literature/faculty/leah-knight/" target="_blank">
                  <span class="who">Leah Knight</span>, <span class="aff">Brock University</span>
                </a>
              </li>
              <li class="witness">
                <a href="https://www.english.northwestern.edu/people/faculty/wall-wendy.html" target="_blank"><span class="who">Wendy Wall</span>, <span class="aff">Northwestern University</span></a>
              </li>
            </ul>
          </div>
        </div>

        <xsl:variable name="elementalEditionSegsWithNotes" select="//tei:rdg[@wit=concat('#', $elementalEditionId)]//tei:seg[./tei:note][not(ancestor::tei:app[@type='headnote']) and not(ancestor::tei:app[@type='editorialnote'])]"/>
        <xsl:if test="count($elementalEditionSegsWithNotes)">
          <xsl:element name="ul">
            <xsl:attribute name="class">
              <xsl:value-of select="'poem-notes'"/>
            </xsl:attribute>
            <xsl:for-each select="$elementalEditionSegsWithNotes">
              <xsl:element name="li">
                <xsl:attribute name="id">
                  <xsl:value-of select="concat('poem-note-', position())"/>
                </xsl:attribute>
                <xsl:element name="span">
                  <xsl:attribute name="class">
                    <xsl:value-of select="'dismiss'"/>
                  </xsl:attribute>
                  <xsl:text> </xsl:text>
                </xsl:element>

                <xsl:element name="h5">
                  <xsl:attribute name="class">
                    <xsl:value-of select="'note-title'"/>
                  </xsl:attribute>
                  <xsl:apply-templates/>
                </xsl:element>
                <xsl:element name="div">
                  <xsl:variable name="notes" select="./tei:note"/>
                  <xsl:choose>
                    <xsl:when test="count($notes) &gt; 1">
                      <xsl:attribute name="class">
                        <xsl:value-of select="'content multi'"/>
                      </xsl:attribute>
                    </xsl:when>
                    <xsl:otherwise>
                      <xsl:attribute name="class">
                        <xsl:value-of select="'content'"/>
                      </xsl:attribute>
                    </xsl:otherwise>
                  </xsl:choose>
                  <xsl:for-each select="./tei:note">
                    <xsl:variable name="noteType" select="@type"/>

                    <xsl:element name="div">
                      <xsl:choose>
                        <xsl:when test="$noteType">
                          <xsl:attribute name="class">
                            <xsl:value-of select="concat('note-box ', $noteType)"/>
                          </xsl:attribute>
                        </xsl:when>
                        <xsl:otherwise>
                          <xsl:attribute name="class">
                            <xsl:value-of select="'note-box'"/>
                          </xsl:attribute>
                        </xsl:otherwise>
                      </xsl:choose>
                      <xsl:apply-templates/>
                    </xsl:element>
                  </xsl:for-each>
                </xsl:element>
              </xsl:element>
            </xsl:for-each>
          </xsl:element>
        </xsl:if>
      </footer>
    </section>
  </xsl:template>

  <!-- Body template -->
  <xsl:template match="tei:body">
    <xsl:param name="witId"/>
    <xsl:apply-templates select="node()[name() != 'head']">
      <xsl:with-param name="witId" select="$witId"/>
    </xsl:apply-templates>
  </xsl:template>

  <!-- Poem header -->
  <xsl:template match="tei:head">
    <xsl:param name="witId"/>
    <xsl:apply-templates>
      <xsl:with-param name="witId" select="$witId"/>
    </xsl:apply-templates>
  </xsl:template>

  <!-- Header of a figure (title of an image) -->
  <xsl:template match="tei:head/tei:app[@type='headnote']//tei:figure//tei:head">
    <xsl:param name="witId"/>
    <xsl:element name="div">
      <xsl:attribute name="class">
        <xsl:value-of select="'figure-header'"/>
      </xsl:attribute>
      <xsl:apply-templates>
        <xsl:with-param name="witId" select="$witId"/>
      </xsl:apply-templates>
    </xsl:element>
  </xsl:template>

  <!-- Poem title -->
  <xsl:template match="tei:head/tei:app[@type = 'title']">
    <xsl:param name="witId"/>
    <div class="poster">
      <xsl:variable name="posterDarkUrl" select="concat('/images/headnote-posters/h', $poemID, 'd.jpg')"/>
      <xsl:variable name="posterLightUrl" select="concat('/images/headnote-posters/h', $poemID, 'l.jpg')"/>
      <xsl:if test="$poemPosterObject != 'false'">
        <img src="{$posterDarkUrl}"/>
        <img src="{$posterLightUrl}"/>
      </xsl:if>
    </div>
    <div class="poem-title">
      <span class="poem-title-line poem-index lato">
        <xsl:value-of select="concat('Poem ', $poemID)"/>
      </span>
      <h1 class="poem-title-line sssi-regular">
        <xsl:apply-templates>
          <xsl:with-param name="witId" select="$witId"/>
        </xsl:apply-templates>
      </h1>
    </div>
  </xsl:template>

  <!-- Context notes inside titles (act like subtitles) -->
  <xsl:template match="tei:head/tei:app[@type = 'title']/tei:rdg/tei:note[@type = 'context']">
    <div class="sub">
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <!-- Headnote -->
  <xsl:template match="tei:head/tei:app[@type='headnote']">
    <xsl:param name="witId"/>

    <xsl:if test="./tei:rdg[@wit=concat('#', $witId)]/tei:note[@type='headnote']">
      <div class="expand-box">

        <div class="witness-box">
          <a href="#" class="editor-note-trigger sssi-regular" data-featherlight-close-icon="" data-featherlight-other-close=".dismiss" data-featherlight="#editorial-note" data-featherlight-variant="editorial-note">
            <span class="by">Edited by</span><xsl:text> </xsl:text><span class="who">Leah Knight</span><xsl:text> </xsl:text><span class="by">and</span><xsl:text> </xsl:text><span class="who">Wendy Wall</span>
          </a>
        </div>

        <div class="headnote lato">
          <xsl:apply-templates>
            <xsl:with-param name="witId" select="$witId"/>
          </xsl:apply-templates>

          <xsl:variable name="innerNotes" select=".//tei:seg[./tei:note][ancestor::tei:rdg[@wit=concat('#', $witId)]]"/>

          <xsl:if test="boolean($innerNotes)">
            <xsl:element name="ul">
              <xsl:attribute name="class">
                <xsl:value-of select="'block-notes'"/>
              </xsl:attribute>
              <xsl:for-each select="$innerNotes">
                <xsl:variable name="position" select="position()"/>
                <xsl:element name="li">
                  <xsl:attribute name="id">
                    <xsl:value-of select="concat('headnote-fn-', $position)"/>
                  </xsl:attribute>
                  <xsl:attribute name="class">
                    <xsl:value-of select="'block-note'"/>
                  </xsl:attribute>
                  <xsl:element name="a">
                    <xsl:attribute name="class">
                      <xsl:value-of select="'footnote-fn'"/>
                    </xsl:attribute>
                    <xsl:attribute name="href">
                      <xsl:value-of select="concat('#headnote-fna-', $position)"/>
                    </xsl:attribute>
                    <xsl:value-of select="concat($position, '.&#160;')"/>
                  </xsl:element>
                  <xsl:apply-templates select="./tei:note/node()"/>
                </xsl:element>
              </xsl:for-each>
            </xsl:element>

          </xsl:if>
        </div>
        <div class="poem-details-options">
          <xsl:element name="a">
            <xsl:attribute name="class">
              <xsl:value-of select="'pp-action ext to-vm'"/>
            </xsl:attribute>
            <xsl:attribute name="href">
              <xsl:value-of select="concat('/poems/vm/', $poemID)"/>
            </xsl:attribute>
            Compare Editions
          </xsl:element>

          <xsl:if test="$hasCurations = 'true'">
            <span class="by">or</span>
            <a class="pp-action int to-ctx" href="#ctxs">See Curations</a>
          </xsl:if>
        </div>
      </div>
    </xsl:if>

    <a href="#0" class="poster-info-trigger sssi-regular">i</a>
  </xsl:template>

  <!-- Note of a type 'headnote' -->
  <xsl:template match="tei:note[@type='headnote']">
    <xsl:param name="witId"/>
    <xsl:apply-templates>
      <xsl:with-param name="witId" select="$witId"/>
    </xsl:apply-templates>
  </xsl:template>

  <!-- Headnote footnotes triggers -->
  <xsl:template match="tei:seg[./tei:note][(ancestor::tei:app[@type='headnote'])]">
    <xsl:param name="witId"/>

    <xsl:element name="a">
      <xsl:variable name="noteIndex" select="count(preceding::tei:seg[./tei:note][ancestor::tei:rdg[@wit=concat('#', $witId)]//tei:note[@type='headnote']]) + 1"/>
      <xsl:attribute name="id">
        <xsl:value-of select="concat('headnote-fna-', $noteIndex)"/>
      </xsl:attribute>
      <xsl:attribute name="class">
        <xsl:value-of select="'headnote-fna'"/>
      </xsl:attribute>
      <xsl:attribute name="href">
        <xsl:value-of select="concat('#headnote-fn-', $noteIndex)"/>
      </xsl:attribute>
      <xsl:apply-templates>
        <xsl:with-param name="witId" select="$witId"/>
      </xsl:apply-templates>
    </xsl:element>
  </xsl:template>

  <!-- Editorial note -->
  <xsl:template match="tei:head/tei:app[@type = 'editorialnote']"/>
  <!--<xsl:template match="tei:head/tei:app[@type = 'editorialnote']">-->
    <!--<xsl:param name="witId"/>-->

    <!--<div class="editorial-note lato">-->
      <!--<xsl:apply-templates>-->
        <!--<xsl:with-param name="witId" select="$witId"/>-->
      <!--</xsl:apply-templates>-->
    <!--</div>-->
  <!--</xsl:template>-->

  <!--<xsl:template match="tei:note[@type = 'editorialnote']">-->
    <!--<xsl:apply-templates/>-->
  <!--</xsl:template>-->

  <!-- Line group -->
  <xsl:template match="tei:lg">
    <xsl:param name="witId"/>
    <div>
      <xsl:attribute name="class">
        <xsl:value-of select="name(.)"/>

        <xsl:if test="@type">
          <xsl:text> </xsl:text>
          <xsl:value-of select="@type"/>
        </xsl:if>
      </xsl:attribute>

      <xsl:apply-templates>
        <xsl:with-param name="witId" select="$witId"/>
      </xsl:apply-templates>
    </div>
  </xsl:template>

  <!-- Line -->
  <xsl:template match="tei:l">
    <xsl:param name="witId"/>
    <xsl:variable name="tagClass" select="name(.)"/>
    <xsl:variable name="lineHasCurrentReading" select="tei:app/tei:rdg[@wit=concat('#', $witId)]"/>

    <xsl:if test="$lineHasCurrentReading">
      <xsl:element name="div">
        <xsl:attribute name="class">
          <xsl:choose>
            <xsl:when test="@rend">
              <xsl:value-of select="concat($tagClass, ' ', @rend)"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="$tagClass"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:attribute>

        <xsl:variable name="lineNumberValue">
          <xsl:choose>
            <xsl:when test="@n">
              <xsl:value-of select="@n"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="count(preceding::tei:l[descendant::tei:rdg]) + 1"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:variable>

        <xsl:attribute name="id">
          <xsl:value-of select="concat('tppl-', $witId, '-', $lineNumberValue)"/>
        </xsl:attribute>

        <xsl:element name="span">
          <xsl:attribute name="class">
            <xsl:value-of select="'line-number-value'"/>
          </xsl:attribute>
          <xsl:value-of select="$lineNumberValue"/>
        </xsl:element>

        <xsl:apply-templates>
          <xsl:with-param name="witId" select="$witId"/>
        </xsl:apply-templates>
      </xsl:element>
    </xsl:if>
  </xsl:template>

  <!-- Apparatus -->
  <xsl:template match="tei:app">
    <xsl:param name="witId"/>

    <xsl:apply-templates>
      <xsl:with-param name="witId" select="$witId"/>
    </xsl:apply-templates>
  </xsl:template>

  <!-- Class Assignment Logic for rdg -->
  <xsl:template match="tei:rdg">
    <xsl:param name="witId"/>

    <xsl:choose>
      <xsl:when test="@rend and @wit = concat('#', $witId)">
        <xsl:element name="div">
          <xsl:attribute name="class">
            <xsl:value-of select="concat('reading-rendering ', @rend)"/>
          </xsl:attribute>
          <xsl:choose>
            <xsl:when test="@wit = concat('#', $witId)">
              <xsl:apply-templates>
                <xsl:with-param name="witId" select="$witId"/>
              </xsl:apply-templates>
            </xsl:when>
            <xsl:otherwise/>
          </xsl:choose>
        </xsl:element>
      </xsl:when>

      <xsl:otherwise>
        <xsl:choose>
          <xsl:when test="@wit = concat('#', $witId)">
            <xsl:apply-templates>
              <xsl:with-param name="witId" select="$witId"/>
            </xsl:apply-templates>
          </xsl:when>
          <xsl:otherwise/>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Page breaks and image viewer triggers -->
  <xsl:template match="tei:pb">
    <div class="pb">
      <xsl:variable name="imageId" select="translate(@facs, '#', '')"/>
      <span class="facsimile-toggle">
        <xsl:attribute name="data-image-id">
          <xsl:value-of select="$imageId"/>
        </xsl:attribute>
        <img class="mock" src="/images/page-mock.svg"/>
      </span>
    </div>
  </xsl:template>

  <!-- Line break -->
  <xsl:template match="tei:lb"><br/></xsl:template>

  <xsl:template match="tei:fw"/>

  <!-- <seg> that has a <note> attached -->
  <xsl:template match="tei:seg[./tei:note][not(ancestor::tei:app[@type='headnote']) and not(ancestor::tei:app[@type='editorialnote'])]">
    <xsl:variable name="currentSegNotesCount" select="count(./tei:note)"/>
    <xsl:variable name="noteId" select="count(preceding::tei:seg[./tei:note][ancestor::tei:rdg[@wit=concat('#', $elementalEditionId)]][not(ancestor::tei:app[@type='headnote']) and not(ancestor::tei:app[@type='editorialnote'])]) + 1"/>

    <xsl:element name="div">
      <xsl:attribute name="class">
        <xsl:value-of select="'poem-note-trigger'"/>
      </xsl:attribute>
      <xsl:attribute name="data-note-content-type">
        <xsl:choose>
          <xsl:when test="./tei:note/*">
            <xsl:value-of select="'html'"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="'text'"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>
      <xsl:attribute name="data-notes-count">
        <xsl:value-of select="$currentSegNotesCount"/>
      </xsl:attribute>
      <xsl:attribute name="data-note-length">
        <xsl:value-of select="string-length(./tei:note)"/>
      </xsl:attribute>
      <xsl:attribute name="data-note-edition">
        <xsl:value-of select="$elementalEditionId"/>
      </xsl:attribute>
      <xsl:attribute name="data-note-type">
        <xsl:value-of select="./tei:note/attribute::type"/>
      </xsl:attribute>
      <xsl:if test="./ancestor::tei:note[@type = 'editorialnote']">
        <xsl:attribute name="data-force-full-size">
          <xsl:value-of select="'true'"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:attribute name="data-note-id">
        <xsl:value-of select="$noteId"/>
      </xsl:attribute>
      <xsl:apply-templates/>
      <xsl:element name="span">
        <xsl:attribute name="class">
          <xsl:value-of select="'print-only footnote-ref'"/>
        </xsl:attribute>
        <xsl:value-of select="$noteId"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <!-- Note which is inside a seg should yield nothing -->
  <xsl:template match="tei:seg/tei:note"/>

  <!-- Segments and their renditions -->
  <xsl:template match="tei:seg">
    <xsl:element name="span">
      <xsl:if test="@id">
        <xsl:attribute name="id">
          <xsl:value-of select="@id"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:attribute name="class">
        <xsl:if test="@type">
          <xsl:text>type-</xsl:text>
          <xsl:value-of select="@type"/>
        </xsl:if>
        <xsl:if test="@rend">
          <xsl:text> </xsl:text>
          <xsl:value-of select="@rend"/>
        </xsl:if>
      </xsl:attribute>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <!-- Various named segments -->
  <xsl:template match="tei:author | tei:foreign | tei:title | tei:hi | tei:del | tei:add">
    <xsl:choose>
      <xsl:when test="./@rend">
        <xsl:element name="span">
          <xsl:attribute name="class">
            <xsl:value-of select="./@rend"/>
          </xsl:attribute>
          <xsl:apply-templates/>
        </xsl:element>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- TEI del -->
  <xsl:template match="tei:del">
    <xsl:element name="span">
      <xsl:attribute name="class">
        <xsl:value-of select="'deleted'"/>
      </xsl:attribute>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <!-- Milestones -->
  <xsl:template match="tei:milestone">
    <xsl:if test="@unit = 'poem-section'">
      <xsl:element name="div">
        <xsl:attribute name="class">
          <xsl:value-of select="concat('milestone ', @rend)"/>
        </xsl:attribute>
        <xsl:value-of select="@n"/>
      </xsl:element>
    </xsl:if>
  </xsl:template>

  <!-- DIV -->
  <xsl:template
    match="tei:div">
    <xsl:param name="witId"/>

    <xsl:element name="div">
      <xsl:attribute name="class">
        <xsl:value-of select="name(.)"/>

        <xsl:if test="@type">
          <xsl:text> </xsl:text>
          <xsl:text>type-</xsl:text>
          <xsl:value-of select="@type"/>
        </xsl:if>

        <xsl:if test="@rend">
          <xsl:text> </xsl:text>
          <xsl:text>rend-</xsl:text>
          <xsl:value-of select="@rend"/>
        </xsl:if>
      </xsl:attribute>
      <xsl:apply-templates>
        <xsl:with-param name="witId" select="$witId"/>
      </xsl:apply-templates>
    </xsl:element>
  </xsl:template>

  <!-- Cite -->
  <xsl:template match="tei:cite">
    <xsl:param name="witId"/>

    <xsl:element name="div">
      <xsl:attribute name="class">
        <xsl:value-of select="'citation-box'"/>
      </xsl:attribute>
      <xsl:apply-templates>
        <xsl:with-param name="witId" select="$witId"/>
      </xsl:apply-templates>
    </xsl:element>
  </xsl:template>

  <!-- Quote -->
  <xsl:template match="tei:quote">
    <xsl:param name="witId"/>
    <xsl:element name="div">
      <xsl:attribute name="class">
        <xsl:value-of select="'citation'"/>
      </xsl:attribute>
      <xsl:apply-templates>
        <xsl:with-param name="witId" select="$witId"/>
      </xsl:apply-templates>
    </xsl:element>
  </xsl:template>

  <!-- Lines inside quotes -->
  <xsl:template match="tei:quote//tei:lg/tei:l">
    <xsl:element name="div">
      <xsl:attribute name="class">
        <xsl:value-of select="'l'"/>
      </xsl:attribute>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <!-- TEI -> HTML -->
  <xsl:template match="tei:p | tei:u">
    <xsl:param name="witId"/>
    <!-- We cannot use the HTML <p>...</p> element here because of the
  different qualities of a TEI <p> and an HTML <p>. For example,
  TEI allows certain objects to be nested within a paragraph (like
  <table>...</table>) that HTML does not -->
    <xsl:choose>
      <xsl:when
        test="ancestor::tei:note or ancestor::tei:fileDesc or ancestor::tei:encodingDesc or tei:notesStmt">
        <p>
          <xsl:attribute name="class">
            <xsl:value-of select="@rend"/>
          </xsl:attribute>
          <xsl:apply-templates>
            <xsl:with-param name="witId" select="$witId"/>
          </xsl:apply-templates>
        </p>
      </xsl:when>
      <xsl:otherwise>
        <div class="paragraph">
          <xsl:apply-templates>
            <xsl:with-param name="witId" select="$witId"/>
          </xsl:apply-templates>
        </div>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Basic ref -->
  <xsl:template match="tei:ref">
    <a class="link">
      <xsl:if test="@target">
        <xsl:attribute name="href">
          <xsl:value-of select="@target"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@type">
        <xsl:attribute name="class">
          <xsl:value-of select="@type"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@type='new-window-url'">
        <xsl:attribute name="target">
          <xsl:text>_blank</xsl:text>
        </xsl:attribute>
      </xsl:if>
      <xsl:apply-templates/>
    </a>
  </xsl:template>

  <!-- PP Poem links -->
  <xsl:template match="tei:ref[@type = 'pp-poem-ref']">
    <xsl:variable name="referencedPoemID" select="./@corresp"/>
    <xsl:element name="a">
      <xsl:attribute name="href">
        <xsl:value-of select="concat('/poems/', $referencedPoemID)" />
      </xsl:attribute>
      <xsl:attribute name="title">
        <xsl:value-of select="concat('Go to Poem ', $referencedPoemID)" />
      </xsl:attribute>
      <xsl:attribute name="target">
        <xsl:value-of select="'_blank'"/>
      </xsl:attribute>
      <xsl:attribute name="class">
        <xsl:value-of select="'pp-poem-ref'"/>
      </xsl:attribute>
      <xsl:apply-templates/>

      <xsl:element name="span">
        <xsl:attribute name="class">
          <xsl:value-of select="'idx'"/>
        </xsl:attribute>
        <xsl:value-of select="$referencedPoemID"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <!-- External Curation/Exploration refs -->
  <xsl:template match="tei:ref[@type = 'pp-curation-ref' or @type = 'pp-exploration-ref']">
    <a class="link">
      <xsl:if test="@target">
        <xsl:attribute name="href">
          <xsl:value-of select="@target"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:attribute name="class">
        <xsl:value-of select="@type"/>
      </xsl:attribute>
      <xsl:attribute name="target">
        <xsl:text>_blank</xsl:text>
      </xsl:attribute>
      <xsl:apply-templates/>
    </a>
  </xsl:template>

  <!-- Types of renderings of text fragments -->
  <xsl:template match="tei:emph">
    <xsl:param name="witId"/>
    <span>
      <xsl:attribute name="class">
        <xsl:value-of select="@rend"/>
      </xsl:attribute>

      <xsl:apply-templates>
        <xsl:with-param name="witId" select="$witId"/>
      </xsl:apply-templates>
    </span>
  </xsl:template>

  <!-- Template for tei:add element -->
  <xsl:template match="tei:add">
    <xsl:param name="witId"/>
    <span>
      <xsl:attribute name="class">
        <xsl:value-of select="name(.)"/>
        <xsl:if test="@rend">
          <xsl:text> rend-</xsl:text>
          <xsl:value-of select="@rend"/>
        </xsl:if>
        <xsl:if test="@place">
          <xsl:text> place-</xsl:text>
          <xsl:value-of select="@place"/>
        </xsl:if>
      </xsl:attribute>
      <xsl:apply-templates>
        <xsl:with-param name="witId" select="$witId"/>
      </xsl:apply-templates>
    </span>
  </xsl:template>

  <!-- Bibliographic references -->
  <xsl:template match="tei:bibl">
    <xsl:param name="witId"/>
    <xsl:apply-templates>
      <xsl:with-param name="witId" select="$witId"/>
    </xsl:apply-templates>
  </xsl:template>

  <!-- Bibliographic reference titles -->
  <xsl:template match="tei:bibl/tei:title">
    <xsl:param name="witId"/>
    <span>
      <xsl:attribute name="class">
        <xsl:value-of select="'italic'"/>
      </xsl:attribute>

      <xsl:apply-templates>
        <xsl:with-param name="witId" select="$witId"/>
      </xsl:apply-templates>
    </span>
  </xsl:template>

  <!-- Bibliographic reference titles inside cits -->
  <xsl:template match="tei:cit/tei:bibl">
    <xsl:param name="witId"/>
    <xsl:element name="div">
      <xsl:attribute name="class">
        <xsl:value-of select="'citation-bibl'"/>
      </xsl:attribute>
      <xsl:apply-templates>
        <xsl:with-param name="witId" select="$witId"/>
      </xsl:apply-templates>
    </xsl:element>
  </xsl:template>

  <!-- Figures -->
  <xsl:template match="tei:figure">
    <xsl:param name="witId"/>
    <xsl:element name="div">
      <xsl:attribute name="class">
        <xsl:value-of select="'figure-box'"/>
      </xsl:attribute>
      <xsl:apply-templates>
        <xsl:with-param name="witId" select="$witId"/>
      </xsl:apply-templates>
    </xsl:element>
  </xsl:template>

  <!-- Graphics (only images so far) -->
  <xsl:template match="tei:graphic">
    <img src="{@url}"/>
  </xsl:template>

  <!-- Figure descriptions in figures -->
  <xsl:template match="tei:figure/tei:figDesc">
    <xsl:param name="witId"/>
    <xsl:element name="div">
      <xsl:attribute name="class">
        <xsl:value-of select="'figure-desc'"/>
      </xsl:attribute>
      <xsl:apply-templates>
        <xsl:with-param name="witId" select="$witId"/>
      </xsl:apply-templates>
    </xsl:element>
  </xsl:template>

  <!-- Bibliographic references in figures -->
  <xsl:template match="tei:figure/tei:bibl">
    <xsl:param name="witId"/>
    <xsl:element name="div">
      <xsl:attribute name="class">
        <xsl:value-of select="'bibl'"/>
      </xsl:attribute>
      <xsl:apply-templates>
        <xsl:with-param name="witId" select="$witId"/>
      </xsl:apply-templates>
    </xsl:element>
  </xsl:template>

  <!-- Words -->
  <xsl:template match="//tei:w">
    <xsl:element name="span">
      <xsl:attribute name="class">
        <xsl:value-of select="'word'"/>
      </xsl:attribute>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <!-- Abbreviations -->
  <xsl:template match="//tei:abbr">
    <xsl:element name="span">
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="/tei:TEI/tei:teiHeader/tei:fileDesc">
    <div id="bibPanel">
      <xsl:attribute name="class">
        <xsl:text>ui-widget-content ui-resizable panel noDisplay</xsl:text>
      </xsl:attribute>
      <div class="panelBanner">
        Bibliographic Information
      </div>
      <div class="bibContent">
        <h2>
          <xsl:value-of select="$fullTitle"/>
        </h2>
        <xsl:if test="tei:titleStmt/tei:author">
          <h3>by
            <xsl:value-of select="tei:titleStmt/tei:author"/>
          </h3>
        </xsl:if>
        <xsl:if test="tei:sourceDesc">
          <h4>Original Source</h4>
          <xsl:apply-templates select="tei:sourceDesc"/>
        </xsl:if>
        <h4>Witness List</h4>
        <ul>
          <xsl:for-each select="$witnesses">
            <li>
              <strong>
                <xsl:text>Witness </xsl:text>
                <xsl:value-of select="@xml:id"/>
                <xsl:text>:</xsl:text>
              </strong>
              <xsl:text> </xsl:text>
              <xsl:value-of select="."/>
            </li>
          </xsl:for-each>
        </ul>
        <xsl:if test="tei:notesStmt/tei:note[@anchored = 'true' and not(@type = 'image')]">
          <h4>Textual Notes</h4>
          <xsl:for-each
            select="tei:notesStmt/tei:note[@anchored = 'true' and not(@type = 'image')]">
            <div class="note">
              <xsl:if test="@type">
                <em class="label">
                  <xsl:value-of select="@type"/>
                  <xsl:text>:</xsl:text>
                </em>
                <xsl:text> </xsl:text>
              </xsl:if>
              <xsl:apply-templates/>
              <xsl:if test="position() != last()">
                <hr/>
              </xsl:if>
            </div>
          </xsl:for-each>
        </xsl:if>
        <h4>Electronic Edition Information:</h4>
        <xsl:if test="tei:titleStmt/tei:respStmt">
          <h5>Responsibility Statement:</h5>
          <ul>
            <xsl:for-each select="tei:titleStmt/tei:respStmt">
              <li>
                <xsl:value-of
                  select="concat(translate(substring(tei:resp, 1, 1), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), substring(tei:resp, 2, string-length(tei:resp)))"/>
                <xsl:for-each select="tei:name | tei:persName | tei:orgName | tei:other">
                  <xsl:text> </xsl:text>
                  <xsl:value-of select="."/>
                  <xsl:choose>
                    <xsl:when test="position() = last()"/>
                    <xsl:when test="position() = last() - 1">
                      <xsl:if test="last() &gt; 2">
                        <xsl:text>,</xsl:text>
                      </xsl:if>
                      <xsl:text> and </xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                      <xsl:text>, </xsl:text>
                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:for-each>
              </li>
            </xsl:for-each>
            <xsl:if test="tei:titleStmt/tei:sponsor">
              <li>
                <xsl:text>Sponsored by </xsl:text>
                <xsl:for-each
                  select="tei:titleStmt/tei:sponsor/tei:orgName | tei:titleStmt/tei:sponsor/tei:persName | tei:titleStmt/tei:sponsor/tei:name | tei:titleStmt/tei:sponsor/tei:other">
                  <xsl:apply-templates select="."/>
                  <xsl:choose>
                    <xsl:when test="position() = last()"/>
                    <xsl:when test="position() = last() - 1">
                      <xsl:if test="last() &gt; 2">
                        <xsl:text>,</xsl:text>
                      </xsl:if>
                      <xsl:text> and </xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                      <xsl:text>, </xsl:text>
                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:for-each>
              </li>
            </xsl:if>
            <xsl:if test="tei:titleStmt/tei:funder">
              <li>
                <xsl:text>Funding provided by </xsl:text>
                <xsl:for-each
                  select="tei:titleStmt/tei:funder/tei:orgName | tei:titleStmt/tei:funder/tei:persName | tei:titleStmt/tei:funder/tei:name | tei:titleStmt/tei:funder/tei:other">
                  <xsl:apply-templates select="."/>
                  <xsl:choose>
                    <xsl:when test="position() = last()"/>
                    <xsl:when test="position() = last() - 1">
                      <xsl:if test="last() &gt; 2">
                        <xsl:text>,</xsl:text>
                      </xsl:if>
                      <xsl:text> and </xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                      <xsl:text>, </xsl:text>
                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:for-each>
              </li>
            </xsl:if>
          </ul>
        </xsl:if>
        <xsl:apply-templates select="tei:publicationStmt"/>
        <xsl:if test="tei:encodingDesc/tei:editorialDecl">
          <h4>Encoding Principles</h4>
          <xsl:apply-templates select="tei:encodingDesc/tei:editorialDecl"/>
        </xsl:if>
        <xsl:apply-templates select="/tei:TEI/tei:teiHeader/tei:encodingDesc"/>

      </div>
    </div>
    <xsl:if test="//tei:notesStmt/tei:note[@type = 'critIntro']">
      <div id="critPanel">
        <xsl:attribute name="class">
          <xsl:text>ui-widget-content ui-resizable panel noDisplay</xsl:text>
        </xsl:attribute>

        <div class="panelBanner">
          <img class="closePanel" title="Close panel"
               src="../vm-images/closePanel.png" alt="X (Close panel)"/>
          Critical
          Introduction
        </div>
        <div class="critContent">
          <h4>Critical Introduction</h4>
          <xsl:for-each select="//tei:notesStmt">
            <xsl:apply-templates select="tei:note[@type = 'critIntro']"/>
          </xsl:for-each>
        </div>
      </div>
    </xsl:if>
  </xsl:template>

  <xsl:template match="tei:publicationStmt">
    <h5>Publication Details:</h5>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="tei:publicationStmt/tei:publisher">
    <p>
      <xsl:text>Published by </xsl:text>
      <xsl:apply-templates/>
      <xsl:text>.</xsl:text>
    </p>
  </xsl:template>

  <xsl:template match="tei:publicationStmt/tei:availability">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="/tei:TEI/tei:teiHeader/tei:encodingDesc">
    <h4>Encoding Principles</h4>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="/tei:TEI/tei:teiHeader/tei:encodingDesc/tei:editorialDecl">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="//tei:encodingDesc/tei:classDecl"/>

  <xsl:template match="//tei:encodingDesc/tei:tagsDecl"/>

  <xsl:template match="//tei:encodingDesc/tei:charDecl"/>
  <!-- TEMPLATES END -->

  <!-- UTILITIES BEGIN -->
  <!-- Identity template -->
  <xsl:template match="node()|@*" name="identity">
    <xsl:copy>
      <xsl:apply-templates select="node()|@*"/>
    </xsl:copy>
  </xsl:template>

  <!-- Normalize space -->
  <xsl:template match="//tei:body//text()[normalize-space()]">
    <span class="t"><xsl:value-of select="."/></span>
  </xsl:template>

  <!-- Truncate text -->
  <xsl:template name="truncateText">
    <xsl:param name="string"/>
    <xsl:param name="length"/>
    <xsl:choose>
      <xsl:when test="string-length($string) > $length">
        <xsl:value-of select="concat(substring($string, 1, $length), '…')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$string"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!-- UTILITIES END -->

</xsl:stylesheet>
