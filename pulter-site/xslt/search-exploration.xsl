<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text" omit-xml-declaration="yes" indent="no" encoding="UTF-8" media-type="text/x-json"/>

  <xsl:template match="*|text()"><xsl:apply-templates/></xsl:template>

  <xsl:template name="encode-string">
    <xsl:param name="s" select="''"/>
    <xsl:param name="encoded" select="''"/>

    <xsl:choose>
      <xsl:when test="$s = ''">
        <xsl:value-of select="$encoded"/>
      </xsl:when>
      <xsl:when test="contains($s, '&quot;')">
        <xsl:call-template name="encode-string">
          <xsl:with-param name="s" select="substring-after($s,'&quot;')"/>
          <xsl:with-param name="encoded"
                          select="concat($encoded,substring-before($s,'&quot;'),'\&quot;')"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="concat($encoded, $s)"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="html">
    <xsl:call-template name="jsonOutput">
      <xsl:with-param name="explorationTitle" select="//title/text()"/>
      <xsl:with-param name="explorationContent" select="normalize-space(//main)"/>
      <xsl:with-param name="responsibility" select="//header//span[@class='who']/text()"/>
    </xsl:call-template>
  </xsl:template>

  <xsl:template name="jsonOutput">
    <xsl:param name="explorationTitle"/>
    <xsl:param name="explorationContent"/>
    <xsl:param name="responsibility"/>

    <xsl:variable name="explorationContentEscaped">
      <xsl:call-template name="encode-string">
        <xsl:with-param name="s" select="$explorationContent"/>
      </xsl:call-template>
    </xsl:variable>

    <xsl:value-of select="'PPS.addResource({'"/>
    <xsl:value-of select="'id:&quot;&quot;,'"/>
    <xsl:value-of select="'type:&quot;ctx&quot;,'"/>
    <xsl:value-of select="'subtype:&quot;exploration&quot;,'"/>
    <xsl:value-of select="concat('title:&quot;', normalize-space($explorationTitle), '&quot;,')"/>
    <xsl:value-of select="concat('body:&quot;', normalize-space($explorationContentEscaped), '&quot;,')"/>
    <xsl:value-of select="concat('responsibility:&quot;', normalize-space($responsibility), '&quot;')"/>
    <xsl:value-of select="concat('}', ');')"/>
  </xsl:template>
</xsl:stylesheet>
