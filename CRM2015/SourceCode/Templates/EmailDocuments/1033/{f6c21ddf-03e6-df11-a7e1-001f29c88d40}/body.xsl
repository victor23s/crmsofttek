﻿<?xml version="1.0" ?><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"><xsl:output method="text" indent="no"/><xsl:template match="/data"><![CDATA[<font face="Tahoma, Verdana, Arial" size=2>Dear ]]><xsl:choose><xsl:when test="contact/fullname"><xsl:value-of select="contact/fullname" /></xsl:when><xsl:otherwise></xsl:otherwise></xsl:choose><![CDATA[,  
<p class=MsoNormal>It was a great pleasure to meeting you at the &quot;China – Latin America Summit&quot; in Chengdu. I would like to know if you be so kind to introduce us with your IT organization management, we would like to share how Softtek can add value to the Information Technology area of your company. Softtek is a global provider of IT and business process solutions with close to 6,000 associates across 30 offices in China, North America, Latin America and Europe. Softtek provides in-depth, high-quality and cost-effective solutions to top-tier corporations. </p>
<p class=MsoNormal>Looking forward to contact you again.</p>
<p class=MsoNormal>Regards, </p>
<p class=MsoNormal><span lang=ES-MX>Gustavo Carrillo<br></span><span lang=ES-MX>General Manager Softtek China<br></span><span lang=ES-MX>+86 186 1180 3636</span></p></font>]]></xsl:template></xsl:stylesheet>