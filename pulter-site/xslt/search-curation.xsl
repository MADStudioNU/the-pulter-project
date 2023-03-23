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
      <xsl:with-param name="curationTitle" select="//title/text()"/>
      <xsl:with-param name="curationBody" select="normalize-space(//main)"/>
      <xsl:with-param name="curationAuthorship" select="//header/div/span[@class='who']/text()"/>
    </xsl:call-template>
  </xsl:template>

  <xsl:template name="jsonOutput">
    <xsl:param name="curationTitle"/>
    <xsl:param name="curationBody"/>
    <xsl:param name="curationAuthorship"/>

    <xsl:variable name="curationBodyEscaped">
      <xsl:call-template name="encode-string">
        <xsl:with-param name="s" select="$curationBody"/>
      </xsl:call-template>
    </xsl:variable>

    <xsl:value-of select="concat('PPS.addResource(', '{')"/>
    <xsl:value-of select="concat('&quot;id&quot;:&quot;', '&quot;,')"/>
    <xsl:value-of select="concat('&quot;type&quot;:', '&quot;curation&quot;', ',')"/>
    <xsl:value-of select="concat('&quot;poemRef&quot;:','&quot;&quot;', ',')"/>
    <xsl:value-of select="concat('&quot;title&quot;:&quot;', $curationTitle, '&quot;,')"/>
<!--    <xsl:value-of select="concat('&quot;body&quot;:&quot;', $curationBodyEscaped, '&quot;,')"/>-->
<!--    <xsl:value-of select="concat('&quot;meta&quot;:&quot;', '&quot;,')"/>-->
    <xsl:value-of select="concat('&quot;authorship&quot;:&quot;', $curationAuthorship, '&quot;')"/>
    <xsl:value-of select="concat('}', ');')"/>
  </xsl:template>
</xsl:stylesheet>
