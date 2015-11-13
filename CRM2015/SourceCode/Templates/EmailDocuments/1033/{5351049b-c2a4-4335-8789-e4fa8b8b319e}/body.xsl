﻿<?xml version="1.0" ?><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"><xsl:output method="text" indent="no"/><xsl:template match="/data"><![CDATA[<p><span style="font-size:8pt;line-height:150%;font-family:Verdana">This Microsoft Dynamics CRM bulk deletion system job completed successfully.</span></p><p><span style="font-size:8pt;line-height:150%;font-family:Verdana">Name: ]]><xsl:choose><xsl:when test="asyncoperation/name"><xsl:value-of select="asyncoperation/name" /></xsl:when><xsl:otherwise>[Bulk Deletion task]</xsl:otherwise></xsl:choose><![CDATA[</span></p><p><span style="font-size:8pt;line-height:150%;font-family:Verdana">Started: ]]><xsl:choose><xsl:when test="asyncoperation/createdon"><xsl:value-of select="asyncoperation/createdon" /></xsl:when><xsl:otherwise></xsl:otherwise></xsl:choose><![CDATA[</span></p><p><span style="font-size:8pt;line-height:150%;font-family:Verdana"><span style="font-size:8pt;line-height:150%;font-family:Verdana">To view the status of this job, either:</span></span></p><p><span style="font-size:8pt;line-height:150%;font-family:Verdana"><span style="font-size:8pt;line-height:150%;font-family:Verdana">Click <A href=https://softtek.crm.dynamics.com/tools/asyncoperation/edit.aspx?id=]]><xsl:choose><xsl:when test="asyncoperation/asyncoperationid"><xsl:value-of select="asyncoperation/asyncoperationid" /></xsl:when><xsl:otherwise></xsl:otherwise></xsl:choose><![CDATA[>https://softtek.crm.dynamics.com/tools/asyncoperation/edit.aspx?id=]]><xsl:choose><xsl:when test="asyncoperation/asyncoperationid"><xsl:value-of select="asyncoperation/asyncoperationid" /></xsl:when><xsl:otherwise></xsl:otherwise></xsl:choose><![CDATA[</A></span></span></p><p><span style="font-size:8pt;line-height:150%;font-family:Verdana"><span style="font-size:8pt;line-height:150%;font-family:Verdana">or</span></span></p>
					<p><span style="font-size:8pt;line-height:150%;font-family:Verdana"><span style="font-size:8pt;line-height:150%;font-family:Verdana"><span style="font-size:8pt;line-height:150%;font-family:Verdana">Log on to Microsoft Dynamics CRM. click settings, click Data Management, and then click Bulk Record Deletion.</span></span></span></p><p><span style="font-size:8pt;line-height:150%;font-family:Verdana"><span style="font-size:8pt;line-height:150%;font-family:Verdana"><span style="font-size:8pt;line-height:150%;font-family:Verdana"><span style="font-size:8pt;line-height:150%;font-family:Verdana"></span></span></span> </p></span>]]></xsl:template></xsl:stylesheet>
				