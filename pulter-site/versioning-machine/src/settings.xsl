<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="xs"
  version="1.0">
  
  <xsl:variable name="vmImages">/versioning-machine/vm-images/</xsl:variable>
  <!-- include files in vm-images folder -->
  <xsl:variable name="pulterLogo"><xsl:value-of select="$vmImages"/><xsl:text>pp-formal.jpg</xsl:text></xsl:variable>
  <xsl:variable name="menuArrowUp"><xsl:value-of select="$vmImages"/><xsl:text>arrowup.png</xsl:text></xsl:variable>
  <xsl:variable name="menuArrowDown"><xsl:value-of select="$vmImages"/><xsl:text>arrowdown.png</xsl:text></xsl:variable>
  <xsl:variable name="closePanelButton"><xsl:value-of select="$vmImages"/><xsl:text>closePanel.png</xsl:text></xsl:variable>
  <xsl:variable name="imageIcon"><xsl:value-of select="$vmImages"/><xsl:text>image.png</xsl:text></xsl:variable>
  <!-- <xsl:variable name="bannerImg"><xsl:value-of select="$vmImages"/><xsl:text>HeaderBackground.png</xsl:text></xsl:variable> -->
  
  <!-- milestone related customizations -->
  <!-- showMilestoneAsImage shows image versions of milestone markers if 'image', inline text annotation if 'text' -->
  <xsl:variable name="curledLine"><xsl:value-of select="$vmImages"/><xsl:text>curledLine.svg</xsl:text></xsl:variable>
  <xsl:variable name="ascendLine"><xsl:value-of select="$vmImages"/><xsl:text>ascendLine.svg</xsl:text></xsl:variable>
  <xsl:variable name="horzLine"><xsl:value-of select="$vmImages"/><xsl:text>horzLine.svg</xsl:text></xsl:variable>
  <xsl:variable name="showMilestoneAs">image</xsl:variable>
  
  <!-- path to folder of facsimile images, the path is encoded in the TEI files like this: images/imagename.jpg -->
  <xsl:variable name="facsImageFolder"></xsl:variable>
  
  <!-- logoLink: path to samples page (VM logo links to this path) -->
  <xsl:variable name="logoLink">../samples.html</xsl:variable>
  
  <!-- include file form src folder -->
  <xsl:variable name="cssInclude">/versioning-machine/src/vmachine.css</xsl:variable>
  <xsl:variable name="cssJQuery-UI">/versioning-machine/src/js/jquery-ui-1.11.3/jquery-ui.min.css</xsl:variable>
  
  <!-- The JavaScript include file. -->
  <xsl:variable name="jsInclude">/versioning-machine/src/vmachine.js</xsl:variable>
  
  <!-- JQuery include files -->
  <xsl:variable name="jsJquery">/versioning-machine/src/js/jquery-1.11.2.min.js</xsl:variable>
  <xsl:variable name="jsJquery-UI">/versioning-machine/src/js/jquery-ui-1.11.3/jquery-ui.min.js</xsl:variable>
  
  <!-- ZoomPan files -->
  
  <xsl:variable name="cssJQueryZoomPan">/versioning-machine/src/panzoom/panzoom.css</xsl:variable>
  <xsl:variable name="jsJqueryZoomPan">/versioning-machine/src/panzoom/jquery.panzoom.min.js</xsl:variable>
  
  <!-- VM initial setup modifications -->
  <!-- NOTES PANEL: To change the VM so that the notes panel page does not
    appear at the initial load, change the below variable value from "true" to "false" below -->
  <xsl:variable name="displayNotes">false</xsl:variable>
  <!-- <xsl:variable name="displayTranscriptionNotes">false</xsl:variable>
      <xsl:variable name="displayElementalNotes">false</xsl:variable>
      <xsl:variable name="displayAmplifiedNotes">false</xsl:variable> -->
  
  <!-- BIB PANEL: To change the VM so that the bibliographic information page does not
    appear at the initial load, change the below variable value from "true" to "false" below -->
  <xsl:variable name="displayBibInfo">true</xsl:variable>
  
  <!-- SET NUMBER AS ZERO (default displayVersions) -->
  <xsl:variable name="displayVersions">0</xsl:variable>
  
  <!-- The initial display of version/witness panels can be modified by changing the below variable from "true" to "false" below -->
  <xsl:variable name="displayTranscription">false</xsl:variable>
  <xsl:variable name="displayAmplified">true</xsl:variable>
  <xsl:variable name="displayElemental">true</xsl:variable>
  
  <!-- CRIT PANEL: Critical information should be encoded as tei:notesStmt/tei:note[@type='critIntro'] in the TEI files
    To change the VM so that the critical information page does not appear at the initial load
    change the variable value from "true" to "false" -->
  <xsl:variable name="displayCritInfo">false</xsl:variable>
  
  <!-- To change the VM so that line numbers are hidden by default, change the variable below from
       "true" to "false" -->
  <xsl:variable name="displayLineNumbers">true</xsl:variable>
  
  <!-- Links to conventions prose -->
  <xsl:variable name="transcriptionConventionsHref">http://pulterproject.northwestern.edu/about-project-conventions.html#top</xsl:variable>
  <xsl:variable name="elementalEditionEditorialGuidelinesHref">http://pulterproject.northwestern.edu/about-project-conventions.html#elemental-edition</xsl:variable>
  <xsl:variable name="teiEncodingConventionsHref">http://pulterproject.northwestern.edu/about-project-conventions.html#tei</xsl:variable>  
  <xsl:variable name="howToCiteTheseVersionsURL">http://pulterproject.northwestern.edu/about-how-to-cite.html</xsl:variable>
  
</xsl:stylesheet>
