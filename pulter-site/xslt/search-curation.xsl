<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <xsl:output method="text" omit-xml-declaration="yes" indent="no" encoding="UTF-8" media-type="text/x-json"/>

  <xsl:template match="*|text()"><xsl:apply-templates/></xsl:template>

  <xsl:template match="title">
    <xsl:value-of select="./text()"/>
  </xsl:template>

  <xsl:template match="html">
    <xsl:call-template name="jsonOutput">
      <xsl:with-param name="foo" select="body/@class"/>
    </xsl:call-template>
    <xsl:text> ~~~ </xsl:text>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:variable name="resourceId" select="/xhtml:body/@class"/>
  <xsl:variable name="curationID" select="substring-after($resourceId, '/poems/')"/>

  <xsl:template name="jsonOutput">
    <xsl:param name="foo"/>
    <xsl:value-of select="$foo"/>
<!--    <xsl:value-of select="concat('PPS.addResource(', '{')"/>-->
<!--    <xsl:value-of select="concat('&quot;id&quot;:&quot;c',curationID, '&quot;,')"/>-->
<!--    <xsl:value-of select="concat('&quot;type&quot;:', '&quot;curation&quot;', ',')"/>-->
<!--    <xsl:value-of select="concat('&quot;in_type_id&quot;: ',curationID, ',')"/>-->
<!--    <xsl:value-of select="concat('&quot;title&quot;:&quot;', $fullTitle, '&quot;,')"/>-->
<!--    <xsl:value-of select="'&quot;body&quot;:&quot;'"/>-->
<!--    <xsl:apply-templates select="//tei:body">-->
<!--      <xsl:with-param name="witId" select="$elementalEditionId"/>-->
<!--    </xsl:apply-templates>-->
<!--    <xsl:value-of select="'&quot;,'"/>-->
<!--    <xsl:value-of select="'&quot;headnote&quot;:&quot;'"/>-->
<!--    <xsl:apply-templates select="//tei:app[@type='headnote']">-->
<!--      <xsl:with-param name="witId" select="$elementalEditionId"/>-->
<!--    </xsl:apply-templates>-->
<!--    <xsl:value-of select="concat('&quot;}', ');')"/>-->
  </xsl:template>

<!--  <xsl:template match="xhtml:body">-->
<!--    <xsl:apply-templates select="*"/>-->
<!--&lt;!&ndash;    <xsl:value-of select="'foo!'"/>&ndash;&gt;-->
<!--&lt;!&ndash;        <xsl:copy>&ndash;&gt;-->
<!--&lt;!&ndash;          <xsl:copy-of select="@*"/>&ndash;&gt;-->
<!--&lt;!&ndash;          <xsl:apply-templates select="*"/>&ndash;&gt;-->
<!--&lt;!&ndash;        </xsl:copy>&ndash;&gt;-->
<!--  </xsl:template>-->
</xsl:stylesheet>
