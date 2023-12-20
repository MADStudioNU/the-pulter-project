<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" exclude-result-prefixes="tei" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:tei="http://www.tei-c.org/ns/1.0">
  <xsl:output method="text" omit-xml-declaration="yes" indent="no" encoding="UTF-8" media-type="text/x-json"/>
  <xsl:include href="poems.xsl"/>
  <xsl:variable name="resourceId" select="/tei:TEI/@xml:id"/>
  <xsl:variable name="poemID" select="substring-after($resourceId, 'mads.pp.')"/>
  <xsl:variable name="amplifiedEditionPrefix">a</xsl:variable>

  <xsl:variable name="body">
    <xsl:apply-templates select="//tei:body">
      <xsl:with-param name="witId" select="$amplifiedEditionPrefix"/>
    </xsl:apply-templates>
  </xsl:variable>

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

  <xsl:template match="/">
    <xsl:for-each select="//tei:witness[starts-with(@xml:id, $amplifiedEditionPrefix)]">
      <xsl:value-of select="'PPS.addResource({'"/>
      <xsl:value-of select="concat('id:&quot;p',$poemID, '-', @xml:id ,'&quot;,')"/>
      <xsl:value-of select="'type:&quot;poem&quot;,'"/>
      <xsl:value-of select="concat('subtype:&quot;', @xml:id,'&quot;,')"/>
      <xsl:value-of select="concat('poemRef:',$poemID, ',')"/>
      <xsl:variable name="amplifiedEditionTitle">
        <xsl:apply-templates select="//tei:app[@type='title']">
          <xsl:with-param name="editionId" select="@xml:id"/>
        </xsl:apply-templates>
      </xsl:variable>
      <xsl:variable name="amplifiedEditionTitleEncoded">
        <xsl:call-template name="encode-string">
          <xsl:with-param name="s" select="normalize-space($amplifiedEditionTitle)"/>
        </xsl:call-template>
      </xsl:variable>
      <xsl:value-of select="concat('title:&quot;', $amplifiedEditionTitleEncoded, '&quot;,')"/>
      <xsl:variable name="meta">
        <xsl:apply-templates select="//tei:app[@type='headnote']">
          <xsl:with-param name="witId" select="@xml:id"/>
        </xsl:apply-templates>
      </xsl:variable>
      <xsl:value-of select="'meta:&quot;'"/>
      <xsl:call-template name="encode-string">
        <xsl:with-param name="s" select="normalize-space($meta)"/>
      </xsl:call-template>
      <xsl:value-of select="'&quot;,'"/>
      <xsl:value-of select="'responsibility:&quot;'"/>
      <xsl:variable name="responsibility">
        <xsl:call-template name="responsibility">
          <xsl:with-param name="witnessId" select="@xml:id"/>
        </xsl:call-template>
      </xsl:variable>
      <xsl:call-template name="encode-string">
        <xsl:with-param name="s" select="normalize-space($responsibility)"/>
      </xsl:call-template>
      <xsl:value-of select="concat('&quot;}', ');')"/>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="tei:app[@type='title']">
    <xsl:param name="editionId"/>
    <!--    <xsl:apply-templates select="node()[name() != 'note']">-->
    <xsl:apply-templates>
      <xsl:with-param name="witId" select="$editionId"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template name="responsibility">
    <xsl:param name="witnessId"/>
    <xsl:for-each select="//tei:witness[@xml:id = $witnessId]//tei:persName">
      <xsl:choose>
        <xsl:when test="not(position() = last())">
          <xsl:element name="span">
            <xsl:attribute name="class">
              <xsl:value-of select="'who'"/>
            </xsl:attribute>
            <xsl:value-of select="."/>
          </xsl:element>
          <xsl:text> </xsl:text>
          <xsl:element name="span">
            <xsl:attribute name="class">
              <xsl:value-of select="'by'"/>
            </xsl:attribute>
            <xsl:text>and</xsl:text>
          </xsl:element>
          <xsl:text> </xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <xsl:element name="span">
            <xsl:attribute name="class">
              <xsl:value-of select="'who'"/>
            </xsl:attribute>
            <xsl:value-of select="."/>
          </xsl:element>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:for-each>
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

    <xsl:template match="tei:lb">
      <xsl:value-of select="' '"/>
    </xsl:template>

  <xsl:template match="tei:fw"/>

  <!-- Note which is inside a <seg></seg> should yield nothing -->
  <xsl:template match="tei:seg/tei:note"/>

  <!-- No milestones -->
  <xsl:template match="tei:milestone"/>

  <xsl:template match="tei:seg">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="tei:seg[@type='context-within-title']"/>

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
