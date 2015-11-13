/// <reference path="JQuery.js" />
/// <reference path="Json2.js" />
/// <reference path="XrmServiceToolkit.js" />
if (typeof XrmSolutions == 'undefined') {
    XrmSolutions = {};
}
if (typeof XrmSolutions.CloseAccount == 'undefined') {
    XrmSolutions.CloseAccount = {};
}
if (typeof XrmSolutions.Account == 'undefined') {
    XrmSolutions.Account = {};
}

function getServerUrl() {
    ///<summary>
    /// Returns the URL for the SOAP endpoint using the context information available in the form
    /// or HTML Web resource.
    ///</summary>
    var OrgServicePath = "/XRMServices/2011/Organization.svc/web";
    var serverUrl = "";

    if (typeof GetGlobalContext == "function") {
        var context = GetGlobalContext();
        serverUrl = context.getClientUrl();
    }
    else {
        if (typeof Xrm.Page.context == "object") {
            serverUrl = Xrm.Page.context.getClientUrl();
        }
        else {
            throw new Error("Unable to access the server URL");
        }
    }

    if (serverUrl.match(/\/$/)) {
        serverUrl = serverUrl.substring(0, serverUrl.length - 1);
    }

    serverUrl = serverUrl + OrgServicePath;

    //alert("Server URL = " + serverUrl);
    return serverUrl;
}

//function parentExists() {
//    var opener = window.dialogArguments;
//    return (opener == null) ? false : true;
//}
//// Double KeyPress safari Solve with this
//document.onkeydown = function (evt) {
//    var cancelKeyPress;
//    var nUsAg = navigator.userAgent;
//    evt = evt || window.event;
//    if (parentExists()) {
//        if (nUsAg.indexOf("Safari") != -1) {
//            cancelKeyPress = /^(46|8|37|39|49|50|51|52|53|54|55|56|57|58|48|190)$/.test("" + evt.keyCode);
//            if (cancelKeyPress) {
//                return true;
//            }
//            else {
//                return false;
//            }
//        }
//    }
//}

XrmSolutions.CloseAccount.OnLoad = function () {

    var $context = GetGlobalContext();

    var $requestXml = "<s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/'>" + "<s:Body>" + "  <Execute xmlns='http://schemas.microsoft.com/xrm/2011/Contracts/Services' xmlns:i='http://www.w3.org/2001/XMLSchema-instance'>" + "    <request i:type='a:RetrieveAttributeRequest' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts'>" + "      <a:Parameters xmlns:b='http://schemas.datacontract.org/2004/07/System.Collections.Generic'>" + "        <a:KeyValuePairOfstringanyType>" + "          <b:key>MetadataId</b:key>" + "          <b:value i:type='c:guid' xmlns:c='http://schemas.microsoft.com/2003/10/Serialization/'>00000000-0000-0000-0000-000000000000</b:value>" + "        </a:KeyValuePairOfstringanyType>" + "        <a:KeyValuePairOfstringanyType>" + "          <b:key>RetrieveAsIfPublished</b:key>" + "          <b:value i:type='c:boolean' xmlns:c='http://www.w3.org/2001/XMLSchema'>true</b:value>" + "        </a:KeyValuePairOfstringanyType>" + "        <a:KeyValuePairOfstringanyType>" + "          <b:key>EntityLogicalName</b:key>" + "          <b:value i:type='c:string' xmlns:c='http://www.w3.org/2001/XMLSchema'>account</b:value>" + "        </a:KeyValuePairOfstringanyType>" + "        <a:KeyValuePairOfstringanyType>" + "          <b:key>LogicalName</b:key>" + "          <b:value i:type='c:string' xmlns:c='http://www.w3.org/2001/XMLSchema'>statuscode</b:value>" + "        </a:KeyValuePairOfstringanyType>" + "      </a:Parameters>" + "      <a:RequestId i:nil='true' />" + "      <a:RequestName>RetrieveAttribute</a:RequestName>" + "    </request>" + "  </Execute>" + "</s:Body>" + "</s:Envelope>";

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var url = getServerUrl();
    var txtResp = "";
    //url = serverUrl;
    var req = new XMLHttpRequest();

    req.open("POST", url, false)
    // Responses will return XML. It isn't possible to return JSON.
    req.setRequestHeader("Accept", "application/xml, text/xml, */*");
    req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
    req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");

    req.onreadystatechange = function () {
        if (req.readyState == 4) {
            req.onreadystatechange = null; //Addresses potential memory leak issue with IE
            if (req.status == 200) {
                //Success
                txtResp = req.responseText;
                LoadScript('https://onesofttekdev.crm.dynamics.com//WebResources/new_XrmServiceToolkit');
                //alert("Success \ntxtResp = " + txtResp);
            }
            else {
                alert(_getError(req.responseText));
            }
        }
    };

    req.send($requestXml);

    try {
        var strResponse = req.responseText;

        var $selectResolution = document.getElementById("selResolution");
        //var $results = req.responseXML.selectSingleNode("s:Envelope/s:Body/ExecuteResponse/ExecuteResult/a:Results");
        /*---Start Function: Added to get values for a dropdown from XML--it works for any explorer*/
        var posLabel = strResponse.indexOf("<c:Label>");
        var strNodes = strResponse.substring(posLabel, strResponse.length);

        var strlabelNodes = strNodes.split("a:LocalizedLabels");
        var strvalue = "";
        var valueState = "";
        var cStateStart = 0,
        cStateEnd = 0;
        var posStartLabel = 0;
        posEndlabel = 0,
        posStartValue = 0,
        posEndValue = 0;
        for (var i in strlabelNodes) {

            cStateStart = strlabelNodes[i].indexOf("<c:State>");
            cStateEnd = strlabelNodes[i].indexOf("</c:State>");
            if (cStateStart != 0) {
                posStartLabel = strlabelNodes[i].indexOf("<a:Label>");
                posEndlabel = strlabelNodes[i].indexOf("</a:Label>");
                posStartValue = strlabelNodes[i].indexOf("<c:Value>");
                posEndValue = strlabelNodes[i].indexOf("</c:Value>");

                valueState = strlabelNodes[i].substring(cStateStart + 9, cStateEnd);
                if (valueState == "1") {
                    var $newOption = document.createElement('option');
                    $newOption.text = strlabelNodes[i].substring(posStartLabel + 9, posEndlabel)
                    $newOption.value = strlabelNodes[i].substring(posStartValue + 9, posEndValue);
                    $selectResolution.add($newOption);
                }
            }
        }
        /*--------------End Function-----*/

        //if ($results != null) {
        //    $results = $results.firstChild.childNodes[1].selectNodes("./c:OptionSet/c:Options/c:OptionMetadata[c:State=1]");
        //    for (var $i = 0; $i < $results.length - 1; $i++) {
        //        var $newOption = document.createElement('option');
        //        //IE functions
        //        $newOption.text = $results[$i].selectSingleNode("./c:Label/a:LocalizedLabels/a:LocalizedLabel/a:Label").nodeTypedValue;
        //        $newOption.value = $results[$i].selectSingleNode('./c:Value').nodeTypedValue;
        //        //End
        //        $selectResolution.add($newOption);
        //    }
        //}
        XrmSolutions.Account.Deprecated();
    }
    catch(err) {
        alert(err.toString());
    }

};

XrmSolutions.CloseAccount.CloseAccount = function () {

    var $flag = XrmSolutions.Account.Required();
    if ($flag == true) {
        //We take the argument sent in the Dialog /
        var $linkAccount = window.dialogArguments;
        //We use the method of Slice to get the ID of this entity
        var $idAccount = $linkAccount.slice($linkAccount.indexOf("{") + 1, $linkAccount.indexOf("}"));

        //We update the state code
        //statecode
        XrmSolutions.Account.UpdateRecord($idAccount);

        //  window.returnValue = {};
        window.close();

    }
};

XrmSolutions.Account.Deprecated = function () {

    var $idToRemove = "2";
    var $indexToRemove = null;
    var $control = document.getElementById("selResolution");
    for (var $index in $control.childNodes) {
        if (typeof($control.childNodes[$index]) != "number") {
            if ($control.childNodes[$index].value == $idToRemove) {
                $indexToRemove = $index;
            }
        }
    }
    if ($indexToRemove != null) {
        $control.removeChild($control[$indexToRemove]);
    }

};

XrmSolutions.Account.Required = function () {
    var $description = document.getElementById("description").value;

    if ($description == "" || $description == null || !$description || /^\s*$/.test($description)) {
        alert("Please enter a reason for inactive account");
        return false
    }
    else return true
};

XrmSolutions.Account.UpdateRecord = function (account) {
    // Prepare variables for updating a contact.
    // var authenticationHeader = Xrm.Page.context.getAuthenticationHeader();
    try {
        var $e = document.getElementById("selResolution");
        var $status = $e.options[$e.selectedIndex].value;
        var $statecode = 1; //1 - Inactive, 0 - Active
        XrmSolutions.Account.UpdateRecordDescription(account, $statecode, $status);

    }
    catch(err) {
        alert(err.toString());
    }
};

XrmSolutions.Account.SetStateResponse = function (req, successCallback, errorCallback) {
    ///<summary>
    /// Recieves the assign response
    ///</summary>
    ///<param name="req" Type="XMLHttpRequest">
    /// The XMLHttpRequest response
    ///</param>
    ///<param name="successCallback" Type="Function">
    /// The function to perform when an successfult response is returned.
    /// For this message no data is returned so a success callback is not really necessary.
    ///</param>
    ///<param name="errorCallback" Type="Function">
    /// The function to perform when an error is returned.
    /// This function accepts a JScript error returned by the _getError function
    ///</param>
    try {
        if (req.readyState == 4) {
            if (req.status == 200) {
                if (successCallback != null) {
                    successCallback();
                }
            }
            else {
                errorCallback = XrmSolutions.Account._getError(req.responseXML);
            }
        }
    }
    catch(err) {
        alert("XrmSolutions.Account.SetStateResponse" + err.toString());
    }
};

XrmSolutions.Account._getError = function (faultXml) {
    ///<summary>
    /// Parses the WCF fault returned in the event of an error.
    ///</summary>
    ///<param name="faultXml" Type="XML">
    /// The responseXML property of the XMLHttpRequest response.
    ///</param>
    try {
        var $errorMessage = "Unknown Error (Unable to parse the fault)";
        if (typeof faultXml == "object") {
            try {
                var $bodyNode = faultXml.firstChild.firstChild;
                //Retrieve the fault node
                for (var $i = 0; $i < $bodyNode.childNodes.length; $i++) {
                    var $node = bodyNode.childNodes[i];
                    //NOTE: This comparison does not handle the case where the XML namespace changes
                    if ("s:Fault" == node.nodeName) {
                        for (var $j = 0; $j < $node.childNodes.length; $j++) {
                            var $faultStringNode = $node.childNodes[$j];
                            if ("faultstring" == $faultStringNode.nodeName) {
                                $errorMessage = $faultStringNode.text;
                                break;
                            }
                        }
                        break;
                    }
                }
            }
            catch(e) {};
        }
        return new Error($errorMessage);
    }
    catch(err) {
        alert("XrmSolutions.Account._getError" + err.toString());
    }
};

XrmSolutions.Account._getServerUrl = function () {
    ///<summary>
    /// Returns the URL for the SOAP endpoint using the $context information available in the HTML Web resource.
    ///</summary>
    var $OrgServicePath = "/XRMServices/2011/Organization.svc/web";
    var $serverUrl = "";
    var $context = GetGlobalContext();
    $serverUrl = $context.getClientUrl();
    if ($serverUrl.match(/\/$/)) {
        $serverUrl = $serverUrl.substring(0, $serverUrl.length - 1);
    }
    return $serverUrl + $OrgServicePath;
};

XrmSolutions.Account.UpdateRecordDescription = function (account, $statecode, $status) {

    try {
        var accId = account.replace("{", "").replace("{", "");
        var entityId = accId;
        var $requestMain = ""
        $requestMain += "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">";
        $requestMain += "  <s:Body>";
        $requestMain += "    <Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">";
        $requestMain += "      <request i:type=\"b:SetStateRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\" xmlns:b=\"http://schemas.microsoft.com/crm/2011/Contracts\">";
        $requestMain += "        <a:Parameters xmlns:c=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">";
        $requestMain += "          <a:KeyValuePairOfstringanyType>";
        $requestMain += "            <c:key>EntityMoniker</c:key>";
        $requestMain += "            <c:value i:type=\"a:EntityReference\">";
        $requestMain += "              <a:Id>" + entityId + "</a:Id>";
        $requestMain += "              <a:LogicalName>account</a:LogicalName>";
        $requestMain += "              <a:Name i:nil=\"true\" />";
        $requestMain += "            </c:value>";
        $requestMain += "          </a:KeyValuePairOfstringanyType>";
        $requestMain += "          <a:KeyValuePairOfstringanyType>";
        $requestMain += "            <c:key>State</c:key>";
        $requestMain += "            <c:value i:type=\"a:OptionSetValue\">";
        $requestMain += "              <a:Value>" + $statecode + "</a:Value>";
        $requestMain += "            </c:value>";
        $requestMain += "          </a:KeyValuePairOfstringanyType>";
        $requestMain += "          <a:KeyValuePairOfstringanyType>";
        $requestMain += "            <c:key>Status</c:key>";
        $requestMain += "            <c:value i:type=\"a:OptionSetValue\">";
        $requestMain += "              <a:Value>" + $status + "</a:Value>";
        $requestMain += "            </c:value>";
        $requestMain += "          </a:KeyValuePairOfstringanyType>";
        $requestMain += "        </a:Parameters>";
        $requestMain += "        <a:RequestId i:nil=\"true\" />";
        $requestMain += "        <a:RequestName>SetState</a:RequestName>";
        $requestMain += "        <a:RequestName>SetStatus</a:RequestName>";
        $requestMain += "      </request>";
        $requestMain += "    </Execute>";
        $requestMain += "  </s:Body>";
        $requestMain += "</s:Envelope>";

        var $req = new XMLHttpRequest();
        $req.open("POST", XrmSolutions.Account._getServerUrl(), false)
        // Responses will return XML. It isn't possible to return JSON.
        $req.setRequestHeader("Accept", "application/xml, text/xml, */*");
        $req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
        $req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");

        $req.onreadystatechange = function () {

            if ($req.readyState === 4) {
                if ($req.status === 200) {
                    handleStateChange(entityId);
                } else {
                    //alert('No esta listo');
                }
            }
        };
        $req.send($requestMain);

    }
    catch(err) {
        alert("XrmSolutions.Account.UpdateRecordDescription " + err);
    }

};

function handleStateChange(entityId) {
    // Prepare variables for updating an Account
    var $description = document.getElementById("description").value;
    var items = null;
    var accId = entityId.replace("{", "").replace("{", "");
    var acc = {};
    acc.new_InactiveReason = $description;

    XrmServiceToolkit.Rest.Update(
    accId, acc, "AccountSet", function () {
        //alert("ok");
    },
    function (error) {
        //alert(error);
    },
    false);
}
/*
window.onunload = refreshParent = function refreshParent() {
    window.opener.location.reload(true);
}*/

function openDialogTest(accountId) {

    var nAgt = navigator.userAgent;
    //var dialog = "https://onesofttekdev.crm.dynamics.com//WebResources/new_AccountTest.htm";
    var dialog2 = "/WebResources/new_AccountTest.htm";
    var url = Xrm.Page.context.getClientUrl() + dialog2;

    // cambios hecho por omar soto
    if (nAgt.indexOf("Safari") != -1) {
        var windowsOpen = window.open(url, '', 'width=400,height=410,resizable=0,status=0,scrollbars=0');
        windowsOpen.dialogArguments = accountId.toString();

        //document.location.reload(true);
    }
    else {
        window.showModalDialog(url, accountId.toString(), 'width=100,height=200,resizable=1,status=1,scrollbars=1');
        window.location.reload(true);
    }

    //terminan los cambios
    //codigo original abajo
    //var dialog = "https://onesofttekdev.crm.dynamics.com//WebResources/new_AccountTest.htm";
    //window.showModalDialog(dialog, accountId.toString(), 'width=100,height=200,resizable=1,status=1,scrollbars=1');
    //window.location.reload(true);
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
