﻿<?xml version="1.0" ?><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"><xsl:output method="text" indent="no"/><xsl:template match="/data"><![CDATA[ABM de Cuentas SHH - ]]><xsl:choose><xsl:when test="account/name"><xsl:value-of select="account/name" /></xsl:when><xsl:otherwise>Valued Customer</xsl:otherwise></xsl:choose><![CDATA[,]]></xsl:template></xsl:stylesheet>