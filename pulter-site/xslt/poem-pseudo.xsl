<?xml version="1.0" encoding="UTF-8"?>

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

  <!-- TODO:
      find the first character of the very first line
  -->
  <xsl:variable name="dropCap"
                select="translate(substring($firstLineNormalized, 1, 1), $upperCaseAlphabet, $lowerCaseAlphabet)"/>

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
          <xsl:value-of select="concat('pp single-poem pseudo poem-', $poemID)"/>
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
          <xsl:value-of select="'PP.initPoem({'"/>
          <xsl:value-of select="concat('id: ', $poemID)"/>
          <xsl:value-of select="concat(', title: &quot;', $fullTitle, '&quot;')"/>
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
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'UA-122500056-2');
      </script>
      <meta charset="utf-8"/>
      <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=3"/>
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=3"/>
      <link rel="manifest" href="/site.webmanifest"/>
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"/>
      <meta name="msapplication-TileColor" content="#da532c"/>
      <meta name="theme-color" content="#282828"/>
      <meta property="og:title" content="{$fullTitle}" />
      <title><xsl:value-of select="$fullTitle"/></title>
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
              <input id="search-input" type="text" placeholder="Search Elemental Edition" maxlength="50" autocomplete="off" />
              <div class="results-box">
                <ul class="results">
                  <li class="init">No results</li>
                </ul>
              </div>
            </div>
          </div>
          <div class="tools">
            <div class="toggles">
              <div class="page-toggle toggle cormorant-garamond">
                <a href="#pp">Manuscript</a>
              </div>
              <!--<div class="gloss-toggle toggle cormorant-garamond">-->
                <!--<a href="#pp">Glosses</a>-->
              <!--</div>-->
            </div>
          </div>
        </div>
      </div>

      <xsl:call-template name="poemContainer">
        <xsl:with-param name="witId" select="$elementalEditionId"/>
      </xsl:call-template>
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
            <p>Copyright © 2018<br/> Wendy Wall, Leah Knight, Northwestern University, <a href="/about-the-project.html#who">others</a>.</p>
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
      <a class="app-reset" onclick="PP.resetState(); return false;">
        <xsl:text> </xsl:text>
      </a>
    </footer>
  </xsl:template>

  <!-- Poem pane -->
  <xsl:template name="poemContainer">
    <xsl:param name="witId"/>

    <div id="poem-sheet-list">
      <section class="poem">
        <a href="#" class="nav prev" data-dir="prev">
          <img src="/images/triangle-down-w.svg"/>
        </a>
        <a href="#" class="nav next" data-dir="next">
          <img src="/images/triangle-down-w.svg"/>
        </a>
        <header>
          <xsl:apply-templates select="//tei:head">
            <xsl:with-param name="witId" select="$witId"/>
          </xsl:apply-templates>
        </header>
        <main class="lato">
          <xsl:apply-templates select="//tei:body">
            <xsl:with-param name="witId" select="$witId"/>
          </xsl:apply-templates>
          <div class="by">Edited by Leah Knight and Wendy Wall</div>
        </main>
      </section>
    </div>
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

  <!-- Poem title -->
  <xsl:template match="tei:head/tei:app[@type = 'title']">
    <xsl:param name="witId"/>
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

  <!-- Headnote -->
  <xsl:template match="tei:head/tei:app[@type = 'headnote']">
    <xsl:param name="witId"/>
    <!--<div class="gloss-toggle for-collapsed cormorant-garamond">-->
    <!--Glosses are-->
    <!--</div>-->
  </xsl:template>

  <!-- Note of a type 'headnote' inside a headnote -->
  <!-- Not sure why we encode head notes this way but ok. -->
  <xsl:template match="tei:note[@type = 'headnote']">
    <xsl:apply-templates/>
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

      <xsl:if test="@n">
        <xsl:if test="@type">
          <xsl:attribute name="data-order">
            <xsl:value-of select="@n"/>
          </xsl:attribute>
        </xsl:if>
      </xsl:if>

      <xsl:apply-templates>
        <xsl:with-param name="witId" select="$witId"/>
      </xsl:apply-templates>
    </div>
  </xsl:template>

  <!-- Line -->
  <xsl:template match="tei:l">
    <xsl:param name="witId"/>
    <xsl:variable name="tagClass" select="name(.)"/>

    <div>
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

      <xsl:attribute name="data-order">
        <xsl:choose>
          <xsl:when test="@n">
            <xsl:value-of select="@n"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of
              select="count(preceding::tei:l[descendant::tei:rdg]) + 1"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>

      <xsl:apply-templates>
        <xsl:with-param name="witId" select="$witId"/>
      </xsl:apply-templates>
    </div>
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
      <xsl:when test="@wit = concat('#', $witId)">
        <xsl:apply-templates>
          <xsl:with-param name="witId" select="$witId"/>
        </xsl:apply-templates>
      </xsl:when>
      <xsl:otherwise/>
    </xsl:choose>
  </xsl:template>

  <!--
      Page breaks and image viewer triggers
  -->
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

  <xsl:template match="tei:fw"/>

  <!-- <seg> that has a <note> attached -->
  <xsl:template match="tei:seg[./tei:note]">
    <xsl:variable name="truncatedHeader">
      <xsl:call-template name="truncateText">
        <xsl:with-param name="string" select="node()"/>
        <xsl:with-param name="length" select="30"/>
      </xsl:call-template>
    </xsl:variable>

    <span class="inline-note">
      <xsl:attribute name="data-note-head">
        <xsl:value-of select="$truncatedHeader"/>
      </xsl:attribute>
      <xsl:attribute name="data-note-body">
        <xsl:value-of select="./tei:note"/>
      </xsl:attribute>
      <xsl:attribute name="data-note-type">
        <xsl:value-of select="./tei:note/attribute::type"/>
      </xsl:attribute>
      <xsl:apply-templates/>
    </span>
  </xsl:template>

  <!-- Note which is inside a <seg></seg> should yield nothing -->
  <xsl:template match="tei:seg/tei:note"/>

  <!-- Segments and their renditions -->
  <xsl:template match="tei:seg">
    <xsl:element name="span">
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
      <xsl:value-of select="."/>
    </a>
  </xsl:template>

  <!-- Poem links -->
  <xsl:template match="tei:ref[@type = 'pp-poem-ref']">
    <xsl:variable name="referencedPoemID" select="./@corresp"/>
    <xsl:element name="a">
      <xsl:attribute name="href">
        <xsl:value-of select="concat('/poems/', $referencedPoemID)" />
      </xsl:attribute>
      <xsl:attribute name="title">
        <xsl:value-of select="concat('Go to Poem ', $referencedPoemID)" />
      </xsl:attribute>
      <!--<xsl:attribute name="target">-->
        <!--<xsl:value-of select="'_blank'"/>-->
      <!--</xsl:attribute>-->
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

  <!-- TEI del -->
  <xsl:template match="tei:del">
    <xsl:element name="span">
      <xsl:attribute name="class">
        <xsl:value-of select="'deleted'"/>
      </xsl:attribute>
      <xsl:apply-templates/>
    </xsl:element>
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
