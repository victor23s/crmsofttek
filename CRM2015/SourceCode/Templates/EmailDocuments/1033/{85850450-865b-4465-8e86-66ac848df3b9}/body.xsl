﻿<?xml version="1.0"?><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"><xsl:output method="text" indent="no" /><xsl:template match="/data"><![CDATA[<p><span style="font-size:8pt;line-height:150%;font-family:Verdana">Microsoft Dynamics CRM :Import ]]><xsl:choose><xsl:when test="asyncoperation/name"><xsl:value-of select="asyncoperation/name" /></xsl:when><xsl:otherwise></xsl:otherwise></xsl:choose><![CDATA[ failed.</span></p><p><span style="font-size:8pt;line-height:150%;font-family:Verdana">Name: ]]><xsl:choose><xsl:when test="asyncoperation/name"><xsl:value-of select="asyncoperation/name" /></xsl:when><xsl:otherwise></xsl:otherwise></xsl:choose><![CDATA[</p> <p><span style="font-size:8pt;line-height:150%;font-family:Verdana">Started: ]]><xsl:choose><xsl:when test="asyncoperation/createdon"><xsl:value-of select="asyncoperation/createdon" /></xsl:when><xsl:otherwise></xsl:otherwise></xsl:choose><![CDATA[</p> <p><p><span style="font-size:8pt;line-height:150%;font-family:Verdana"><A href=https://softtek.crm.dynamics.com/import/edit.aspx?id=]]><xsl:choose><xsl:when test="asyncoperation/regardingobjectid"><xsl:value-of select="asyncoperation/regardingobjectid" /></xsl:when><xsl:otherwise></xsl:otherwise></xsl:choose><![CDATA[>View your import in Microsoft Dynamics CRM.</A></span></span></p></span></p></span><p><span style="font-size:8pt;line-height:150%;font-family:Verdana">If the link does not open, paste the following link into Internet Explorer:</span><p><p><span style="font-size:8pt;line-height:150%;font-family:Verdana">Import: <A href=https://softtek.crm.dynamics.com/import/edit.aspx?id=]]><xsl:choose><xsl:when test="asyncoperation/regardingobjectid"><xsl:value-of select="asyncoperation/regardingobjectid" /></xsl:when><xsl:otherwise></xsl:otherwise></xsl:choose><![CDATA[>https://softtek.crm.dynamics.com/import/edit.aspx?id=]]><xsl:choose><xsl:when test="asyncoperation/regardingobjectid"><xsl:value-of select="asyncoperation/regardingobjectid" /></xsl:when><xsl:otherwise></xsl:otherwise></xsl:choose><![CDATA[</A></span><p><span style="font-size:8pt;line-height:150%;font-family:Verdana">For information about how to resolve failures, in Microsoft Dynamics CRM, on the Help menu, click Troubleshooting, and then click Importing records - troubleshooting.]]></xsl:template></xsl:stylesheet>