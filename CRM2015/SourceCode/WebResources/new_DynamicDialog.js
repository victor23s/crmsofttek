/// <reference path="JavaScript1.js" />
if (typeof($DynamicDialog) == "undefined") {
    $DynamicDialog = {
        __namespace: true
    };
}

window.onload = function () {
    var $utilityLibrary = "../WebResources/new_CRM.Utils";
    var $xmlHttp = new ActiveXObject("Micrsoft.XMLHTTP");
    $xmlHttp.open("GET", $utilityLibrary, false);
    $xmlHttp.send();
    eval($xmlHttp.responseText);
    alert("DynamicDialog Loaded");
};