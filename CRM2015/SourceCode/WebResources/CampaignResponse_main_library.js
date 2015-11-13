/**
 * @author jesse.zhang
 */
var FORM_TYPE_CREATE = 1;
var FORM_TYPE_UPDATE = 2;
var formType;

var SVoptions;

function Filter_SofttekVertical() {
    /*var optSofttekMarket = Xrm.Page.getAttribute("new_softtekmarket_campaignresponse").getSelectedOption();
	var optMarketScope = Xrm.Page.getAttribute("new_marketscopecampaignresponse").getSelectedOption();
	var optSofttekVertical = Xrm.Page.getAttribute("new_softtekverticalcampaignresponse").getSelectedOption();
	var oSofttekVertical = Xrm.Page.getControl("new_softtekverticalcampaignresponse");
	if (optSofttekMarket != null && optMarketScope != null) {
		if ((optSofttekVertical == null) || (optSofttekVertical != null && optSofttekVertical.text != "Manufactura y BC" && optSofttekVertical.text != "Telcos" && optSofttekVertical.text != "Business Development" && optSofttekVertical.text != "Resto del Mercado" && optSofttekVertical.text != "Software & High Tech")) {
			//Manufactura y BC, Telcos, Business Development, Resto del Mercado, Software & High Tech are removed
			oSofttekVertical.setDisabled(false);
			var strSofttekMarket = optSofttekMarket.text;
			var strMarketScope = optMarketScope.text;
			oSofttekVertical.clearOptions();
			if (strSofttekMarket == "USA & Canada") {
				if (strMarketScope == "Global") {
					oSofttekVertical.addOption(SVoptions[0]);
					oSofttekVertical.addOption(SVoptions[6]);
				}
				else {
					for (var i = 0; i <= 4; i++) {
						oSofttekVertical.addOption(SVoptions[i]);
					}
					oSofttekVertical.addOption(SVoptions[9]);
					oSofttekVertical.addOption(SVoptions[10]);
					oSofttekVertical.addOption(SVoptions[5]);
					oSofttekVertical.addOption(SVoptions[7]);
					oSofttekVertical.addOption(SVoptions[8]);
					oSofttekVertical.removeOption(SVoptions[1].value);
				}
			}
			else 
				if (strSofttekMarket == "Mexico & Central America") {
					if (strMarketScope == "Global") {
						for (var i = 11; i <= 14; i++) 
							oSofttekVertical.addOption(SVoptions[i]);
					}
					else {
						for (var i = 15; i <= 29; i++) {
							oSofttekVertical.addOption(SVoptions[i]);
						}
						oSofttekVertical.addOption(SVoptions[8]);
						oSofttekVertical.removeOption(SVoptions[18].value);
						oSofttekVertical.removeOption(SVoptions[19].value);
						oSofttekVertical.removeOption(SVoptions[20].value);
						oSofttekVertical.removeOption(SVoptions[24].value);
					}
				}
				else {
					oSofttekVertical.addOption(SVoptions[5]);
				}
			if (optSofttekVertical != null) {
				Xrm.Page.getAttribute("new_softtekverticalcampaignresponse").setValue(optSofttekVertical.value);
			}
		}
	}
	else {
		Xrm.Page.getAttribute("new_softtekverticalcampaignresponse").setValue(null);
		oSofttekVertical.setDisabled(true);
	}*/
}

function form_onload() {
    formType = Xrm.Page.ui.getFormType();
    caseTypeOnchange();
    SVoptions = Xrm.Page.getAttribute("new_softtekverticalcampaignresponse").getOptions();
    /*if (SVoptions[0].text == "") {
		SVoptions.shift();
	}*/
    Filter_SofttekVertical();
}

function initialLayout() {
    //section Description
    Xrm.Page.getControl('description').getParent().setVisible(false);
    //section Existing Lead
    Xrm.Page.getControl('new_existinglead').getParent().setVisible(false);
    Xrm.Page.getAttribute("new_existinglead").setRequiredLevel("none");
    //section Existing Contact
    Xrm.Page.getControl('new_existingcontact').getParent().setVisible(false);
    Xrm.Page.getAttribute("new_existingcontact").setRequiredLevel("none");
    //section Existing Account
    Xrm.Page.getControl('new_existingaccount').getParent().setVisible(false);
    Xrm.Page.getAttribute("new_existingaccount").setRequiredLevel("none");
    //section New Account
    Xrm.Page.getControl('companyname').getParent().setVisible(false);
    Xrm.Page.getAttribute("companyname").setRequiredLevel("none");
    //section Contact Information
    Xrm.Page.getControl('firstname').getParent().setVisible(false);
    Xrm.Page.getAttribute("firstname").setRequiredLevel("none");
    Xrm.Page.getAttribute("lastname").setRequiredLevel("none");
}

function initialValue() {
    Xrm.Page.getAttribute("new_existinglead").setValue(null);
    Xrm.Page.getAttribute("new_existingaccount").setValue(null);
    Xrm.Page.getAttribute("new_existingcontact").setValue(null);
    Xrm.Page.getAttribute("companyname").setValue(null);
    Xrm.Page.getAttribute("new_noofemployeerangecampaignresponse").setValue(null);
    Xrm.Page.getAttribute("new_industrysofttek").setValue(null);
    Xrm.Page.getAttribute("firstname").setValue(null);
    Xrm.Page.getAttribute("lastname").setValue(null);
    Xrm.Page.getAttribute("emailaddress").setValue(null);
    Xrm.Page.getAttribute("telephone").setValue(null);
    Xrm.Page.getAttribute("new_jobtitlecampaignresponse").setValue(null);
    Xrm.Page.getAttribute("new_citycampaignresponse").setValue(null);
    Xrm.Page.getAttribute("new_countryregioncampaignresponse").setValue(null);
    Xrm.Page.getAttribute("new_stateprovincecampaignresponse").setValue(null);
}

function caseTypeOnchange() {
    initialLayout();
    var optCase = Xrm.Page.getAttribute("new_casescampaignresponse").getSelectedOption();
    if (optCase != null) {
        switch (optCase.text) {
        case "Existing Lead":
            Xrm.Page.getControl('new_existinglead').getParent().setVisible(true);
            Xrm.Page.getControl('description').getParent().setVisible(true);
            Xrm.Page.getAttribute("new_existinglead").setRequiredLevel("required");
            break;
        case "Existing Account & Existing Contact":
            Xrm.Page.getControl('new_existingcontact').getParent().setVisible(true);
            Xrm.Page.getControl('new_existingaccount').getParent().setVisible(true);
            Xrm.Page.getControl('description').getParent().setVisible(true);
            Xrm.Page.getAttribute("new_existingcontact").setRequiredLevel("required");
            Xrm.Page.getAttribute("new_existingaccount").setRequiredLevel("required");
            break;
        case "Existing Account & New Contact":
            Xrm.Page.getControl('new_existingaccount').getParent().setVisible(true);
            Xrm.Page.getControl('firstname').getParent().setVisible(true);
            Xrm.Page.getControl('description').getParent().setVisible(true);
            Xrm.Page.getAttribute("new_existingaccount").setRequiredLevel("required");
            Xrm.Page.getAttribute("firstname").setRequiredLevel("required");
            Xrm.Page.getAttribute("lastname").setRequiredLevel("required");
            break
        case "New Account & New Contact":
            Xrm.Page.getControl('companyname').getParent().setVisible(true);
            Xrm.Page.getControl('firstname').getParent().setVisible(true);
            Xrm.Page.getControl('description').getParent().setVisible(true);
            Xrm.Page.getAttribute("companyname").setRequiredLevel("required");
            Xrm.Page.getAttribute("firstname").setRequiredLevel("required");
            Xrm.Page.getAttribute("lastname").setRequiredLevel("required");
        }
    }
}

function case_onchange() {
    if (formType == FORM_TYPE_UPDATE) {
        if (confirm("You are changing your Case Type Selection. All related information will be removed")) {
            initialValue();
        }
        else return;
    }
    caseTypeOnchange();
}

function SofttekMarket_onchange() {
    Xrm.Page.getAttribute("new_softtekverticalcampaignresponse").setValue(null);

    //  Xrm.Page.getControl("new_softtekverticalcampaignresponse").setDisabled(true);
    //Filter_SofttekVertical();
}

function MarketScope_onchange() {
    Xrm.Page.getAttribute("new_softtekverticalcampaignresponse").setValue(null);
    //	Filter_SofttekVertical();
}