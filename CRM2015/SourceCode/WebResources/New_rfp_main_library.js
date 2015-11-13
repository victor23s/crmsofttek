function IFRAME_Sharepoint_onload() {

}
function Form_onload() {
    /**
* @author joyyang
*/

    if (Xrm.Page.getAttribute("statuscode").getValue() == 1) Xrm.Page.getAttribute("new_closedon").setValue(null);

    if (Xrm.Page.getAttribute("statuscode").getValue() == 2) Xrm.Page.getAttribute("new_closedon").setValue(new Date());

    Xrm.Page.getControl("new_rfpnumber").setDisabled(true);
    var UrlParams = new Array();
    var url = window.location.href;
    url = url.split('?')[1];

    if (url != null) {
        var aParams = url.split('&');
        for (i = 0; i < aParams.length; i++) {
            var aParam = aParams[i].split('=');
            UrlParams[aParam[0]] = aParam[1];
        }
        var rfpID = UrlParams['id'];
        if (rfpID == null) {} else {
            rfpID = rfpID.substr(1, (rfpID.length - 2));
            Xrm.Page.getAttribute("new_rfpnumber").setValue(rfpID);
            Xrm.Page.getAttribute("new_rfpnumber").setSubmitMode("always");
        }
    }
}
function Form_onsave() {
    if (Xrm.Page.getAttribute("new_aseteamlocation").getValue() == 2) { // US
        alert("Please create RFP in kintana.");
        event.returnValue = false;
    }

    if (Xrm.Page.getAttribute("new_aseteamlocation").getValue() == 3) { // Other
        alert("Please check with local ASE team.");
        event.returnValue = false;
    }
}
function new_aseteamlocation_onchange() {
    if (Xrm.Page.getAttribute("new_aseteamlocation").getValue() == 2) { // US
        alert("Please create RFP in kintana.");
    }

    if (Xrm.Page.getAttribute("new_aseteamlocation").getValue() == 3) { // Other
        alert("Please check with local ASE team.");
    }
}