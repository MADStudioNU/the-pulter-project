<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" exclude-result-prefixes="tei" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0">

  <xsl:output method="text" omit-xml-declaration="yes" indent="no" encoding="UTF-8" media-type="text/x-json"/>

  <!-- INCLUDES BEGIN  -->
  <xsl:include href="poems.xsl"/>
  <!-- INCLUDES END  -->

  <!-- VARIABLES BEGIN  -->
  <xsl:variable name="resourceId" select="/tei:TEI/@xml:id"/>
  <xsl:variable name="poemID" select="substring-after($resourceId, 'mads.pp.')"/>
  <xsl:variable name="elementalEditionId">ee</xsl:variable>
  <xsl:variable name="fullTitle">
    <xsl:choose>
      <xsl:when test="//tei:titleStmt/tei:title != ''">
        <xsl:value-of select="//tei:titleStmt/tei:title"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:text>Untitled</xsl:text>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="truncatedTitle">
    <xsl:call-template name="truncateText">
      <xsl:with-param name="string" select="$fullTitle"/>
      <xsl:with-param name="length" select="40"/>
    </xsl:call-template>
  </xsl:variable>


  <!-- Meta desc keywords chunk -->
  <xsl:variable name="keywordsMetaDescChunk">
    <xsl:call-template name="poemsTopKeywordsChunk">
      <xsl:with-param name="poemId" select="$poemID"/>
      <xsl:with-param name="numberOfKeywords" select="4"/>
    </xsl:call-template>
  </xsl:variable>

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
  <!-- VARIABLES END -->

  <!-- TEMPLATES BEGIN -->
  <!-- Root -->
  <xsl:template match="/">
    <xsl:value-of select="concat('PPS.addPoem(', '{')"/>
    <xsl:value-of select="concat('&quot;id&quot;: ', $poemID, ',')"/>
    <xsl:value-of select="concat('&quot;title&quot;: &quot;', $fullTitle, '&quot;,')"/>
    <xsl:value-of select="'&quot;body&quot;: &quot;'"/>
    <xsl:apply-templates select="//tei:body">
      <xsl:with-param name="witId" select="$elementalEditionId"/>
    </xsl:apply-templates>
    <xsl:value-of select="concat('&quot;}', ');')"/>
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

  <!-- Headnote -->
  <xsl:template match="tei:head/tei:app[@type = 'headnote']">
    <xsl:param name="witId"/>

    <div class="expand-box">
      <div class="headnote lato">
        <xsl:apply-templates>
          <xsl:with-param name="witId" select="$witId"/>
        </xsl:apply-templates>
      </div>
    </div>

    <a href="#pp" class="poster-info-trigger sssi-regular">i</a>
  </xsl:template>

  <!-- Line group -->
  <xsl:template match="tei:lg">
    <xsl:param name="witId"/>
    <xsl:apply-templates>
      <xsl:with-param name="witId" select="$witId"/>
    </xsl:apply-templates>
    <xsl:text> </xsl:text>
  </xsl:template>

  <!-- Last line group -->
  <xsl:template match="tei:lg[last()]">
    <xsl:param name="witId"/>
    <xsl:apply-templates>
      <xsl:with-param name="witId" select="$witId"/>
    </xsl:apply-templates>
  </xsl:template>

  <!-- Line -->
  <xsl:template match="tei:l">
    <xsl:param name="witId"/>
      <xsl:apply-templates>
        <xsl:with-param name="witId" select="$witId"/>
      </xsl:apply-templates>
    <xsl:text> </xsl:text>
  </xsl:template>

  <!-- Last line -->
  <xsl:template match="tei:l[last()]">
    <xsl:param name="witId"/>
    <xsl:apply-templates>
      <xsl:with-param name="witId" select="$witId"/>
    </xsl:apply-templates>
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

  <xsl:template match="tei:fw"/>

  <!-- Note which is inside a <seg></seg> should yield nothing -->
  <xsl:template match="tei:seg/tei:note"/>

  <!-- No milestones -->
  <xsl:template match="tei:milestone"/>

  <xsl:template match="tei:seg">
    <xsl:apply-templates/>
  </xsl:template>

  <!-- Consecutive segs need a space between them -->
  <xsl:template match="tei:seg[following-sibling::tei:seg]">
    <xsl:apply-templates/>
    <xsl:text> </xsl:text>
  </xsl:template>
  <!-- TEMPLATES END -->

  <!-- UTILITIES BEGIN -->
  <!-- Identity template -->
  <xsl:template match="node()|@*" name="identity">
    <xsl:copy>
      <xsl:apply-templates select="node()|@*"/>
    </xsl:copy>
  </xsl:template>

  <!-- Truncate text -->
  <xsl:template name="truncateText">
    <xsl:param name="string"/>
    <xsl:param name="length"/>
    <xsl:choose>
      <xsl:when test="string-length($string) > $length">
        <xsl:value-of select="concat(substring($string, 1, $length), '...')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$string"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!-- UTILITIES END -->
</xsl:stylesheet>
