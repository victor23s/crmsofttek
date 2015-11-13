/// <reference path="JQuery.js" />
/// <reference path="Json2.js" />
/// <reference path="XrmServiceToolkit.js" />
if (typeof XrmSolutions == 'undefined') { XrmSolutions = {}; }
if (typeof XrmSolutions.CloseAccount == 'undefined') { XrmSolutions.CloseAccount = {}; }
if (typeof XrmSolutions.Account == 'undefined') { XrmSolutions.Account = {}; }

XrmSolutions.CloseAccount.OnLoad = function () {


    var $context = GetGlobalContext();

    var $requestXml = "<s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/'>" +
  "<s:Body>" +
  "  <Execute xmlns='http://schemas.microsoft.com/xrm/2011/Contracts/Services' xmlns:i='http://www.w3.org/2001/XMLSchema-instance'>" +
  "    <request i:type='a:RetrieveAttributeRequest' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts'>" +
  "      <a:Parameters xmlns:b='http://schemas.datacontract.org/2004/07/System.Collections.Generic'>" +
  "        <a:KeyValuePairOfstringanyType>" +
  "          <b:key>MetadataId</b:key>" +
  "          <b:value i:type='c:guid' xmlns:c='http://schemas.microsoft.com/2003/10/Serialization/'>00000000-0000-0000-0000-000000000000</b:value>" +
  "        </a:KeyValuePairOfstringanyType>" +
  "        <a:KeyValuePairOfstringanyType>" +
  "          <b:key>RetrieveAsIfPublished</b:key>" +
  "          <b:value i:type='c:boolean' xmlns:c='http://www.w3.org/2001/XMLSchema'>true</b:value>" +
  "        </a:KeyValuePairOfstringanyType>" +
  "        <a:KeyValuePairOfstringanyType>" +
  "          <b:key>EntityLogicalName</b:key>" +
  "          <b:value i:type='c:string' xmlns:c='http://www.w3.org/2001/XMLSchema'>opportunity</b:value>" +
  "        </a:KeyValuePairOfstringanyType>" +
  "        <a:KeyValuePairOfstringanyType>" +
  "          <b:key>LogicalName</b:key>" +
  "          <b:value i:type='c:string' xmlns:c='http://www.w3.org/2001/XMLSchema'>statuscode</b:value>" +
  "        </a:KeyValuePairOfstringanyType>" +
  "      </a:Parameters>" +
  "      <a:RequestId i:nil='true' />" +
  "      <a:RequestName>RetrieveAttribute</a:RequestName>" +
  "    </request>" +
  "  </Execute>" +
  "</s:Body>" +
"</s:Envelope>";



    var $req = new XMLHttpRequest();
    $req.open("POST", $context.prependOrgName("/XRMServices/2011/Organization.svc/web"), false)
    $req.setRequestHeader("Accept", "application/xml, text/xml, */*");
    $req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
    $req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");
    $req.send($requestXml);
    var $selectResolution = document.getElementById("selResolution");

    var $idToRemove = [
      "4",
      "5",
      "200001"
    ];

    var index;
    var flag = false;

    var strResponse = $req.responseText;
  
    /*---Start Function: Added to get values for a dropdown from XML--it works for any explorer*/
    var posLabel = strResponse.indexOf("<c:Label>");
    var strNodes = strResponse.substring(posLabel, strResponse.length);

    var strlabelNodes = strNodes.split("a:LocalizedLabels");
    var strvalue = "";
    var valueState = "";
    var cStateStart = 0, cStateEnd = 0;
    var posStartLabel = 0; posEndlabel = 0, posStartValue = 0, posEndValue = 0;
    for (var i in strlabelNodes) {

        cStateStart = strlabelNodes[i].indexOf("<c:State>");
        cStateEnd = strlabelNodes[i].indexOf("</c:State>");
        if (cStateStart != 0) {
            posStartLabel = strlabelNodes[i].indexOf("<a:Label>");
            posEndlabel = strlabelNodes[i].indexOf("</a:Label>");
            posStartValue = strlabelNodes[i].indexOf("<c:Value>");
            posEndValue = strlabelNodes[i].indexOf("</c:Value>");

            valueState = strlabelNodes[i].substring(cStateStart + 9, cStateEnd);
            if (valueState == "2") {
                var $newOption = document.createElement('option');
                $newOption.text = strlabelNodes[i].substring(posStartLabel + 9, posEndlabel).replace("&lt;", "<").replace("&gt;", ">");
                $newOption.value = strlabelNodes[i].substring(posStartValue + 9, posEndValue);

                for (index = 0; index < $idToRemove.length; ++index) {
                    if ($newOption.value == $idToRemove[index]) {
                        flag = true;
                    }
                }
                if (!flag) {
                    $selectResolution.add($newOption);
                }
                flag = false;                
            }
        }
    }

    // Setup current Datetime
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) { dd = '0' + dd } if (mm < 10) { mm = '0' + mm } var today = mm + '/' + dd + '/' + yyyy;
    document.getElementById("DateInput").value = today;


};

XrmSolutions.CloseAccount.CloseAccount = function () {

    var $flag = XrmSolutions.Account.Required();

    if ($flag == true) {
        //We take the argument sent in the Dialog //
        var $linkAccount = window.dialogArguments;
        //We update the state code

        XrmSolutions.Account.UpdateRecord($linkAccount);
        window.close();
    }



};

XrmSolutions.Account.Deprecated = function () {

    var $idToRemove = [
        "4",
        "5",
        "200001"
    ];


    var $indexToRemove = null;
    var $control = document.getElementById("selResolution");
    for (var $index in $control.childNodes) {
        if (typeof ($control.childNodes[$index]) != "number") {
            for (index = 0; index < $idToRemove.length; ++index) {
                if ($control.childNodes[$index].value == $idToRemove[index]) {
                    $indexToRemove = $index;
                }
                if ($indexToRemove != null) {
                    $control.removeChild($control[$indexToRemove]);
                }
                $indexToRemove = null;
            }
        }
    }



};

XrmSolutions.Account.Required = function () {

    var $description = document.getElementById("description").value;
    var $actualRevenue = document.getElementById("actualRevenue").value;
    var $closeDate = document.getElementById("DateInput").value;
    var returnDate = false;
    var returnDescription = false;
    var returnRevenue = false;
    //
    //******************************** Function to validate a CloseDate field
    //
    var validformat = /^\d{2}\/\d{2}\/\d{4}$/; //Basic check for format validity

    if (!validformat.test($closeDate)) {
        alert("Invalid Date Format. Please correct and submit again.");
        returnDate = false;
    }
    else { //Detailed check for valid date ranges
        var monthfield = $closeDate.split("/")[0];
        var dayfield = $closeDate.split("/")[1];
        var yearfield = $closeDate.split("/")[2];
        var dayobj = new Date(yearfield, monthfield - 1, dayfield);
        if ((dayobj.getMonth() + 1 != monthfield) || (dayobj.getDate() != dayfield) || (dayobj.getFullYear() != yearfield)) {
            alert("Invalid Day, Month, or Year range detected. Please correct and submit again.");
            returnDate = false;
        }
        else
            returnDate = true;
    }

    //*********************************** Validate that Description contain Data
    if ($description == "" || $description == null || !$description || /^\s*$/.test($description)) {

        alert("Please enter a reason for close as lost");
        returnDescription = false;
    }
    else
        returnDescription = true;
    //******************************** Validate Actual Revenue value

    if ($actualRevenue != null && $actualRevenue != '')
        returnRevenue = true;
    else
        alert("Please check the Act Revenue field");


    //**************  Validate that all  required  fields are full,

    if (returnDescription == true && returnDate == true && returnRevenue == true)
        return true;
    else
        return false;
};

XrmSolutions.Account.UpdateRecord = function (opportunity) {
    //// Prepare variables for updating a Opportunity.

    var $e = document.getElementById("selResolution");
    var $status = $e.options[$e.selectedIndex].value; // StatusReason value
    var $statecode = 2; //0 - Open, 1 - Won, 2 - Lost  
    XrmSolutions.Account.UpdateRecordDescription(opportunity);


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
    if (req.readyState == 4) {
        if (req.status == 200) {
            if (successCallback != null)
            { successCallback(); }
        }
        else {
            errorCallback(XrmSolutions.Account._getError(req.responseXML));
        }
    }
};

XrmSolutions.Account._getError = function (faultXml) {
    ///<summary>
    /// Parses the WCF fault returned in the event of an error.
    ///</summary>
    ///<param name="faultXml" Type="XML">
    /// The responseXML property of the XMLHttpRequest response.
    ///</param>
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
        catch (e) { };
    }
    return new Error(errorMessage);
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

XrmSolutions.Account.UpdateRecordDescription = function (account) {
    //// Prepare variables for updating an Account 

    var accId = account.replace("{", "").replace("{", "");

    //*****************************  Run Workflow to set statecode to Lost

    var url = XrmSolutions.Account._getServerUrl();
    var entityId = accId;
    var workflowId = '6ab3c4da-0914-46c5-ac40-12088d6982ce';

    var OrgServicePath = "/XRMServices/2011/Organization.svc/web";
    url = url + OrgServicePath;
    var request;
    request = "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">" +
                "<s:Body>" +
                    "<Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">" +
                        "<request i:type=\"b:ExecuteWorkflowRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\" xmlns:b=\"http://schemas.microsoft.com/crm/2011/Contracts\">" +
                            "<a:Parameters xmlns:c=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">" +
								"<a:KeyValuePairOfstringanyType>" +
									"<c:key>EntityId</c:key>" +
									"<c:value i:type=\"d:guid\" xmlns:d=\"http://schemas.microsoft.com/2003/10/Serialization/\">" + entityId + "</c:value>" +
								"</a:KeyValuePairOfstringanyType>" +
								"<a:KeyValuePairOfstringanyType>" +
									"<c:key>WorkflowId</c:key>" +
									"<c:value i:type=\"d:guid\" xmlns:d=\"http://schemas.microsoft.com/2003/10/Serialization/\">" + workflowId + "</c:value>" +
								"</a:KeyValuePairOfstringanyType>" +
							"</a:Parameters>" +
                            "<a:RequestId i:nil=\"true\" />" +
                            "<a:RequestName>ExecuteWorkflow</a:RequestName>" +
                        "</request>" +
                    "</Execute>" +
                "</s:Body>" +
			  "</s:Envelope>";

    var req = new XMLHttpRequest();
    req.open("POST", url, false)
    //// Responses will return XML. It isn't possible to return JSON.
    req.setRequestHeader("Accept", "application/xml, text/xml, */*");
    req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
    req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status === 200) {                
                handleStateChange(entityId);
            } else {
            }
        }
    };
    req.send(request);
    //************************  end  process to  set statecode. *******************************************************//


};

function handleStateChange(entityId) {
    //*******************************************GET the entity properties and wait until statecode change  ***********************//

    var item = null;
    var flag = false;
  
    while (!flag) {
        XrmServiceToolkit.Rest.RetrieveMultiple(
         "OpportunitySet",
         "$filter= OpportunityId eq guid'" + entityId + "'",
         function (results) {
             item = results;
         },
         // ReSharper disable once UnuentityIdsedParameter
        function (error) {
        },
        function onComplete() {
        },
        false);
           
        if (item != null && item[0].StateCode.Value == 2) {
            flag = true;
        }
    }
    //**************************************************Update status and description ********************************************//

    var items = null;
    var $description = document.getElementById("description").value;
    var str = document.getElementById("actualRevenue").value;
    var $actualRevenue = str.substring(1, str.lenght);
    var accId = entityId.replace("{", "").replace("{", "");
    var acc = {};
    var $e = document.getElementById("selResolution");
    var $status = $e.options[$e.selectedIndex].value; //Status Reason
    acc.new_LossReason = $description;
    acc.StatusCode = { Value: $status };
    acc.ActualValue = { Value: $actualRevenue };
     
    XrmServiceToolkit.Rest.Update(
        accId,
        acc,
        "OpportunitySet",
        function () {            
        },
        function (error) {
        },
        false
    );

   
}

function openDialogTest(opportunityId) {
    var isdraft = false;
    
   var cansave = true;//MandatoryPopulated();
    if (cansave == true) {
       
        //***************** Validate if a Opp have an Active or Draft Quotes
        if (typeof opportunityId == "object")
            opportunityId = opportunityId[0]['Id'];
        else
            Xrm.Page.data.entity.save("save");

        opportunityId = opportunityId.replace("{", "").replace("}", "");

        var item = null;
        XrmServiceToolkit.Rest.RetrieveMultiple(
            "QuoteSet",
            "$filter= OpportunityId/Id eq guid'" + opportunityId + "'",
            function (results) {
                item = results;
            },
            // ReSharper disable once UnuentityIdsedParameter
         function (error) {
         },
        function onComplete() {
        },
            false);

        if (item.length > 0) {
            //StateCode= 0 -"Draft",  StateCode= 1 -"Active" 
            for (i = 0; i < item.length; i++) {
                //StateCode= 0 - "Draft" and StateCode= 1 - "Active"
                if (item[i]["StateCode"].Value == 0 || item[i]["StateCode"].Value == 1) {
                    isdraft = true;
                }
            } if (isdraft) {
                alert("There are still active or draft quotes associated with this opportunity. There must be closed before  the opportunity can  be closed.");
                window.close();
            } else { openWindow(opportunityId); }

        } else { openWindow(opportunityId); }
    }
    else
        Xrm.Page.data.entity.save("save");
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// cambios por omar soto
// funcion que verifica si una ventana popup se ha cerrado para hacer un refresh
window.onunload = refreshParent =
    function refreshParent() {
        var nAgt = navigator.userAgent;
        if (nAgt.indexOf('Safari') != -1) {
            window.opener.location.reload(true);
        }

    }

function openWindow(opportunityId) {

    var nAgt = navigator.userAgent;
    var dialog2 = "/WebResources/new_closeAsLost";
    var url = Xrm.Page.context.getClientUrl() + dialog2;
    
    if (nAgt.indexOf("Safari") != -1 || nAgt.indexOf("Firefox") != -1) {

            var windowsOpen = window.open(url, "", "dialogWidth:450px;dialogHeight:410px; resizable:0; status:0; scrollbars:0");
            windowsOpen.dialogArguments = opportunityId.toString();
        }
        else
        {
        
            window.showModalDialog(url, opportunityId.toString(), "dialogWidth:450px;dialogHeight:410px; resizable:0; status:0; scrollbars:0");
            window.location.reload(true);
        }

}

function MandatoryPopulated() {
    populated = true;    
    Xrm.Page.getAttribute(function (attribute, index) {
        if (attribute.getRequiredLevel() == "required") {

            if (getFreshValue(attribute.getName().toString()) === "") {
                populated = false;
                return populated;
            }

        }
    });

    return populated;
}
function getFreshValue(fieldName) {    
    var id = fieldName + '_i';
    var inputElement = document.getElementById(id);
    if (inputElement !== null) { //At the moment when you focus the field first, the input element get generated.(at least on CRM 2013)
        return inputElement.value;
    } else {
        if (Xrm.Page.getAttribute(fieldName).getValue() == null) {
            return "";
        }
        return Xrm.Page.getAttribute(fieldName).getValue(); //The value is not modified if the input element doesn't exist.

    }
}

