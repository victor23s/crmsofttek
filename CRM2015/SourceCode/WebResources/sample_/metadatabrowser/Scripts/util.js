 // =====================================================================
//  This file is part of the Microsoft Dynamics CRM SDK code samples.
//
//  Copyright (C) Microsoft Corporation.  All rights reserved.
//
//  This source code is intended only as a supplement to Microsoft
//  Development Tools and/or on-line documentation.  See these other
//  materials for detailed information regarding Microsoft code samples.
//
//  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
//  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
//  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//  PARTICULAR PURPOSE.
// =====================================================================

/*
This library contains utility functions
*/

function copyToClipboard(stringData, eventSource) {
    if (stringData != null) {
        if (window.clipboardData.setData("Text", stringData)) {
            if (eventSource != null) {
                eventSource.innerText = "Done";
            }
        }
        else {
            alert("Error: " + stringData + " has NOT been copied to your clipboard.");
        }
    }
    else {}
};
function IsEntityEditable(entity) {
    if (entity.IsCustomizable.Value && !entity.IsIntersect.Value || (entity.IsCustomEntity.Value || entity.IsMappable.Value || entity.IsRenameable.Value)) { //handle exceptions to the rule
        //RoleTemplatePrivileges					28    - no Display Name
        //AnnualFiscalCalendar							2000	 - no node in tree
        //SemiAnnualFiscalCalendar			2001	 - no node in tree
        //QuarterlyFiscalCalendar				2002	 - no node in tree
        //MonthlyFiscalCalendar						2003	 - no node in tree
        //FixedMonthlyFiscalCalendar	2004	 - no node in tree
        if ((entity.ObjectTypeCode == 28) || (entity.ObjectTypeCode == 2000) || (entity.ObjectTypeCode == 2001) || (entity.ObjectTypeCode == 2002) || (entity.ObjectTypeCode == 2003) || (entity.ObjectTypeCode == 2004)) {
            return false;
        }
        else {
            return true;
        }
    }
    else {
        return false;
    }
};

function copyCommand(textToCopy, ContextMenuItemLabel) {
    var copyCommandHTML = "<div onclick=\"parent.copyToClipboard('" + textToCopy + "', this);\" ";
    copyCommandHTML += "onmouseover=\"this.style.backgroundColor='#CEE3F6';\" onmouseout=\"this.style.backgroundColor='#F6F8FA';\" ";
    copyCommandHTML += "style=\"padding-left:5px; \">" + ContextMenuItemLabel + "</div>";
    return copyCommandHTML;
}

function IsEntityCustomizable(entity) {

    if (entity.IsManaged) {
        return entity.IsCustomizable.Value
    }
    else {
        return true;
    }

}

function addToFavorites(url) {

    window.external.AddFavorite(url, "Entity Metadata Browser for " + getContext().getOrgUniqueName());

}

function getContext() {
    var context;
    var errorMessage = "Unable to retrieve the Context.";
    if (typeof GetGlobalContext != "undefined") {
        context = GetGlobalContext();
    }
    else {
        if (typeof Xrm.Page.context != "undefined") {
            context = Xrm.Page.context;
        }
        else {
            throw new Error(errorMessage);
        }
    }
    return context;
}

function getServerUrl() {
    var ServerUrl;
    ServerUrl = getContext().getServerUrl();

    if (ServerUrl.match(/\/$/)) {
        ServerUrl = ServerUrl.substring(0, ServerUrl.length - 1);
    }
    return ServerUrl;
}