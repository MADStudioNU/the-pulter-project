<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" exclude-result-prefixes="tei" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0">

  <xsl:output method="text" omit-xml-declaration="yes" indent="no" encoding="UTF-8" media-type="text/x-json"/>

  <xsl:include href="poems.xsl"/>

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

  <xsl:template match="/">
    <xsl:value-of select="concat('PPS.addResource(', '{')"/>
    <xsl:value-of select="concat('&quot;id&quot;:&quot;p',$poemID, '&quot;,')"/>
    <xsl:value-of select="concat('&quot;type&quot;:', '&quot;poem&quot;', ',')"/>
    <xsl:value-of select="concat('&quot;poemRef&quot;:',$poemID, ',')"/>
    <xsl:value-of select="concat('&quot;title&quot;:&quot;', $fullTitle, '&quot;,')"/>
    <xsl:value-of select="'&quot;body&quot;:&quot;'"/>
<!--    <xsl:apply-templates select="//tei:body">-->
<!--      <xsl:with-param name="witId" select="$elementalEditionId"/>-->
<!--    </xsl:apply-templates>-->
    <xsl:value-of select="'&quot;,'"/>
    <xsl:value-of select="'&quot;meta&quot;:&quot;'"/>
<!--    <xsl:apply-templates select="//tei:app[@type='headnote']">-->
<!--      <xsl:with-param name="witId" select="$elementalEditionId"/>-->
<!--    </xsl:apply-templates>-->
    <xsl:value-of select="'meta stuff'"/>
    <xsl:value-of select="concat('&quot;}', ');')"/>
  </xsl:template>

  <xsl:template match="tei:body">
    <xsl:param name="witId"/>
    <xsl:apply-templates select="node()[name() != 'head']">
      <xsl:with-param name="witId" select="$witId"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="tei:head">
    <xsl:param name="witId"/>
    <xsl:apply-templates>
      <xsl:with-param name="witId" select="$witId"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="tei:lg">
    <xsl:param name="witId"/>
    <xsl:apply-templates>
      <xsl:with-param name="witId" select="$witId"/>
    </xsl:apply-templates>
    <xsl:text> </xsl:text>
  </xsl:template>

  <xsl:template match="tei:lg[last()]">
    <xsl:param name="witId"/>
    <xsl:apply-templates>
      <xsl:with-param name="witId" select="$witId"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="tei:l">
    <xsl:param name="witId"/>
      <xsl:apply-templates>
        <xsl:with-param name="witId" select="$witId"/>
      </xsl:apply-templates>
    <xsl:text> </xsl:text>
  </xsl:template>

  <xsl:template match="tei:l[last()]">
    <xsl:param name="witId"/>
    <xsl:apply-templates>
      <xsl:with-param name="witId" select="$witId"/>
    </xsl:apply-templates>
  </xsl:template>

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
  <!-- TEMPLATES END -->

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
</xsl:stylesheet>
