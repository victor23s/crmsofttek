/// <reference path="XrmPageTemplate.js" />
/// <reference path="new_softtek_scripts_util_dynamicform.js" />
/// <reference path="new_XrmServiceToolkit" />
if (typeof(SofttekCrm) == "undefined") {
    SofttekCrm = {

        __namespace: true
    };
}

var SOToptions;
var SVoptions;
var quoteIsInSW = false;

function CheckCloseDate() {
    var dtProjectStartDate = new Date(Xrm.Page.getAttribute("new_estimatedprojectstartdate").getValue());
    var dtEstCloseDate = new Date(Xrm.Page.getAttribute("estimatedclosedate").getValue());
    if (dtProjectStartDate < dtEstCloseDate) {
        if (!window.confirm("Estimated Close Date should be less than the Estimated Proj. Start Date, do you want to save it?")) {           
        }
    }
}

function OppTypeFieldValidations() {
    /* Make Estimated FTEs required when Opp Type = Rate Card and Validate Est Revenue is 0 -- Req 211951 */

    var optOppType = Xrm.Page.getAttribute("new_opportunitytypeopp").getSelectedOption();
    var attEstFTEs = Xrm.Page.getAttribute("new_estimatedftes");
    var attEstRev = Xrm.Page.getAttribute("estimatedvalue");
    var attEstMonthRev = Xrm.Page.getAttribute("new_estimatedmonthlyrevenue");

    if (optOppType != null) {

        //TODO: Convertir cantidad a negativo del Est Revenue (estimatedvalue)
        if (optOppType.value == "100000003" && attEstRev.getValue() != null) {
            attEstRev.setValue(Math.abs(attEstRev.getValue()) * -1);
        }
        else if (attEstRev.getValue() != null) {
            attEstRev.setValue(Math.abs(attEstRev.getValue()));
        }

        //Validamos si el campo de Est Monthly Revenue contiene una cantidad y si el Opp type es distinto de Scope Decrease
        //para convertirlo a cantidad positiva
        if (attEstMonthRev.getValue() != null && optOppType.value == "100000003") {
            attEstMonthRev.setValue(Math.abs(attEstMonthRev.getValue()) * -1);
        }
        else if (attEstMonthRev.getValue() != null && optOppType.value != "100000003") {
            attEstMonthRev.setValue(Math.abs(attEstMonthRev.getValue()));
        }

        if (optOppType.value == "100000004") {            
            attEstFTEs.setRequiredLevel("required");

            if (attEstRev.getValue() != 0) {
                alert("Est. Revenue should be 0 when Opportunity Type = Rate Card");
                attEstRev.setValue(0);
                estimatedvalue_onchange();
            }
        }
        else {
            attEstFTEs.setRequiredLevel("none");
        }
    }
}

function CheckProjectID() {
    var optSofttekMarket = Xrm.Page.getAttribute("new_softtekmarket").getSelectedOption();
    var optOppType = Xrm.Page.getAttribute("new_opportunitytypeopp").getSelectedOption();

    if (optOppType != null && optSofttekMarket != null) {
        if (optSofttekMarket.value == "100000001" || optSofttekMarket.value == "100000006") {
            Xrm.Page.getControl("new_projectid").setDisabled(false);

            if (optOppType.value == "100000000" || optOppType.value == "100000004") {
				Xrm.Page.getAttribute("new_projectid").setRequiredLevel("none");
			   Xrm.Page.getAttribute("new_projectid").setValue(null);
            }
            else {
				Xrm.Page.getAttribute("new_projectid").setRequiredLevel("required");
            }
        }
        else {
            if (optOppType.value == "100000000" || optOppType.value == "100000004") {
				Xrm.Page.getAttribute("new_projectid").setValue(null);
                Xrm.Page.getControl("new_projectid").setDisabled(true);
				Xrm.Page.getAttribute("new_projectid").setRequiredLevel("none");
            }
            else {               
                Xrm.Page.getControl("new_projectid").setDisabled(false);
				Xrm.Page.getAttribute("new_projectid").setRequiredLevel("required");
            }
        }
    }
    else {
		Xrm.Page.getAttribute("new_projectid").setValue(null);
        Xrm.Page.getControl("new_projectid").setDisabled(true);
		Xrm.Page.getAttribute("new_projectid").setRequiredLevel("none");
    }
}

function ValidateProjectID() {
    var selectedSofttekMarket = Xrm.Page.getAttribute("new_softtekmarket").getSelectedOption();
    var projectID = Xrm.Page.getAttribute("new_projectid").getValue();

    /* Validate 1-0000000000 or 2-0000000000 for USA, MEX & Cloud (using SAP) and ABCDE99 for the rest (using Intrasoft) */
    //validation to Europe is included here as a 1-0000000005
    if (selectedSofttekMarket.value == "100000000" || selectedSofttekMarket.value == "100000001" || selectedSofttekMarket.value == "100000006" || selectedSofttekMarket.value == "100000005") {
        if (projectID.match(/\b[1-2]-\d{10}\b/g) == null) {
            var message = "The Format of Project ID is not correct! Valid Format: 1-0000000000";
            alert(message);
            Xrm.Page.getAttribute("new_projectid").setValue(null);
        }
    }
    else {
        if (projectID.match(/\b[A-Z]{5}\d{2}\b/g) == null) {
            var message = "The Format of Project ID is not correct! Valid Format: ABCDE99";
            alert(message);
            Xrm.Page.getAttribute("new_projectid").setValue(null);
        }
    }
}

function setEstimatedEndDate() {
    var oProjectEndDate = Xrm.Page.getAttribute("new_estimatedprojectenddate");
    var dtProjectStartDate = new Date(Xrm.Page.getAttribute("new_estimatedprojectstartdate").getValue());
    var dtProjectEndDate = new Date(Xrm.Page.getAttribute("new_estimatedprojectstartdate").getValue());
    var intProjectDuration = Xrm.Page.getAttribute("new_estimatedprojectduration").getValue();

    if (intProjectDuration != null && Xrm.Page.getAttribute("new_estimatedprojectstartdate").getValue() != null) {
        dtProjectEndDate.setMonth(dtProjectStartDate.getMonth() + intProjectDuration);
        dtProjectEndDate.setDate(dtProjectStartDate.getDate() - 1);
        oProjectEndDate.setValue(dtProjectEndDate);
        if (dtProjectEndDate.getFullYear() > dtProjectStartDate.getFullYear()) {
            Xrm.Page.getAttribute("new_multiyearopp").setValue(true);
        }
        else {
            Xrm.Page.getAttribute("new_multiyearopp").setValue(false);
        }
    }
    else {
        oProjectEndDate.setValue(null);
        Xrm.Page.getAttribute("new_multiyearopp").setValue(null);
    }

    oProjectEndDate.setSubmitMode("always");
    Xrm.Page.getAttribute("new_multiyearopp").setSubmitMode("always");
}

function Form_onload() {
    var sysUserId = "4c64fb3e-d944-e411-bda5-a45d36fd41d8";
    XrmServiceToolkit.Rest.RetrieveMultiple("SystemUserRolesSet", "$filter= SystemUserId eq guid'" + sysUserId + "'",
    function (results) {
        item = results;
    },
    // ReSharper disable once UnuentityIdsedParameter
    function (error) {
        alert("Error = " + error);
    },
    function onComplete() {},
    false);

    var fetch = '<fetch distinct="false" mapping="logical" output-format="xml-platform" version="1.0">-<entity name="account"><attribute name="name"/><attribute name="primarycontactid"/><attribute name="telephone1"/><attribute name="ownerid"/><attribute name="createdon"/><attribute name="createdby"/><attribute name="new_validationstatus"/><attribute name="new_validatedon"/><attribute name="statuscode"/><attribute name="statecode"/><attribute name="new_softtekvertical1"/><attribute name="new_softtekmarket1"/><attribute name="new_softtekcountry1"/><attribute name="modifiedon"/><attribute name="modifiedby"/><attribute name="new_marketscopeaccount"/><attribute name="accountid"/><order descending="false" attribute="name"/>-<filter type="and"><condition attribute="name" value="GE Oil Gas PII Pipeline Solutions" operator="eq"/></filter></entity></fetch>';
    var fetchTable = XrmServiceToolkit.Soap.Fetch(fetch);

    var entityId = Xrm.Page.data.entity.getId();

    var item = null;

    if (entityId != null && entityId != "") {
        entityId = entityId.replace("{", "").replace("}", "");

        XrmServiceToolkit.Rest.RetrieveMultiple("OpportunitySet", "$filter= OpportunityId eq guid'" + entityId + "'",
        function (results) {
            item = results;
        },
        // ReSharper disable once UnuentityIdsedParameter
        function (error) {
            alert("Error = " + error);
        },
        function onComplete() {},
        false);
    }
    ////    FormType.Disabled  =  4,
    if (Xrm.Page.ui.getFormType() != 4) {
        //Update for Delivery Model
        var optDeliveryModel = Xrm.Page.getAttribute("new_deliverymodelopp").getSelectedOption();
        
        //if ((optDeliveryModel == null) || (optDeliveryModel != null && optDeliveryModel.value != 100000000 && optDeliveryModel.value != 100000001 && optDeliveryModel.value != 100000002 && optDeliveryModel.value != 100000003)) {		
		//OMTV
		if (optDeliveryModel != null && optDeliveryModel.value != 100000000 && optDeliveryModel.value != 100000001 && optDeliveryModel.value != 100000002 && optDeliveryModel.value != 100000003) {			
            Xrm.Page.getControl("new_deliverymodelopp").removeOption(100000000);
            Xrm.Page.getControl("new_deliverymodelopp").removeOption(100000001);
            Xrm.Page.getControl("new_deliverymodelopp").removeOption(100000002);
            Xrm.Page.getControl("new_deliverymodelopp").removeOption(100000003);

        }

        CheckQuoteStatus();
        CheckProjectID();
        OppTypeFieldValidations();		
    }
}

function sectiondisable(sectionname, disablestatus) {
    var ctrlName = Xrm.Page.ui.controls.get();

    for (var k in ctrlName) {
        var ctrl = ctrlName[k];
        var ctrlSection = ctrl.getParent().getName();

        if (ctrlSection == sectionname) {
            ctrl.setDisabled(disablestatus);
        }
    }
}

function CheckQuoteStatus() {
    var opportunityId = Xrm.Page.data.entity.getId();

    if (opportunityId != null && opportunityId != '') {
        var haveQuote = false;
        var items = null;

        opportunityId = opportunityId.replace("{", "").replace("}", "");

        XrmServiceToolkit.Rest.RetrieveMultiple("QuoteSet", "$filter= OpportunityId/Id eq guid'" + opportunityId + "'",

        function (results) {
            items = results;
        },
        // ReSharper disable once UnusedParameter
        function (error) {
            alert("Error = " + error);
        },
        function onComplete() {},
        false);

        if (items != null) {
            for (i = 0; i < items.length; i++) {
                //StateCode= 0 - "Draft" and StatusCode= 1 - In progress
                if (items[i]["StateCode"].Value == 0 && items[i]["StatusCode"].Value == 1) {
                    haveQuote = true;
                    if (items[i]["new_SubmitSW"] == true) {
                        //Controls from Is Top X Opportunity Section
                        Xrm.Page.getControl("new_topxoppowner").setDisabled(false);
                        Xrm.Page.getControl("new_topxoppleader").setDisabled(false);
                        Xrm.Page.getControl("new_topxoppmarketleader").setDisabled(false);

                        //Controls from Strategy Section
                        Xrm.Page.getControl("new_whydosomethingdifferent").setDisabled(false);
                        Xrm.Page.getControl("new_whynow").setDisabled(false);
                        Xrm.Page.getControl("new_whysofttek").setDisabled(false);
                        Xrm.Page.getControl("new_strategytowin").setDisabled(false);
                        Xrm.Page.getControl("new_riskstoovercome").setDisabled(false);
                        //	Other controls
                        Xrm.Page.getControl("estimatedclosedate").setDisabled(false);
                        Xrm.Page.getControl("campaignid").setDisabled(false);
                        Xrm.Page.getControl("originatingleadid").setDisabled(false);
                        Xrm.Page.getControl("new_systech").setDisabled(false);
                        disableClassificationSection(false);
                    }

                    if (Xrm.Page.getAttribute("new_quoteventanillaunica").getValue() == null || items[i]["QuoteId"].toUpperCase() != Xrm.Page.getAttribute("new_quoteventanillaunica").getValue()[0].id.replace("{", "").replace("}", "")) {
                        setSimpleLookupValue("new_quoteventanillaunica", "quote", items[i]["QuoteId"], items[i]["Name"]);
                    }
                    //draft quote	
                    if (items[i]["StatusCode"].Value != 1) {
                        quoteIsInSW = true;
                    }
                }
                else
                // //StatusCode = 1 - "Active", StateCode= 0 - "Draft" AND StatusCode= 100000001- Submitted OR StatusCode= 100000000- Pending Approval
                if (items[i]["StateCode"].Value == 1 || (items[i]["StateCode"].Value == 0 && (items[i]["StatusCode"].Value == 100000001 || items[i]["StatusCode"].Value == 100000000))) {
                    haveQuote = true;
                    quoteIsInSW = true;
                    if (Xrm.Page.getAttribute("new_quoteventanillaunica").getValue() == null || items[i]["QuoteId"].toUpperCase() != Xrm.Page.getAttribute("new_quoteventanillaunica").getValue()[0].id.replace("{", "").replace("}", "")) {
                        setSimpleLookupValue("new_quoteventanillaunica", "quote", items[i]["QuoteId"], items[i]["Name"]);
                    }
                    //active quote
                    Xrm.Page.getControl("new_topxoppowner").setDisabled(false);
                    Xrm.Page.getControl("new_topxoppleader").setDisabled(false);
                    Xrm.Page.getControl("new_topxoppmarketleader").setDisabled(false);

                    //Controls from Strategy Section
                    Xrm.Page.getControl("new_whydosomethingdifferent").setDisabled(false);
                    Xrm.Page.getControl("new_whynow").setDisabled(false);
                    Xrm.Page.getControl("new_whysofttek").setDisabled(false);
                    Xrm.Page.getControl("new_strategytowin").setDisabled(false);
                    Xrm.Page.getControl("new_riskstoovercome").setDisabled(false);

                    //	Other controls
                    disableClassificationSection(true);	

					Xrm.Page.getControl("new_estimatedprojectstartdate").setDisabled(false); //------------
					
					// || StateCode= 1 - "Active" and ( StatusCode= 2 - "Approved"
					if (items[i]["StatusCode"].Value == 2){
						Xrm.Page.getControl("new_estimatedprojectstartdate").setDisabled(true); //------------
					}
					
                }
                else
                //Statecode = 2 - "Won"
                if (items[i]["StateCode"].Value == 2) {
                    haveQuote = true;
                    if (Xrm.Page.getAttribute("new_quoteventanillaunica").getValue() == null || items[i]["QuoteId"].toUpperCase() != Xrm.Page.getAttribute("new_quoteventanillaunica").getValue()[0].id.replace("{", "").replace("}", "")) {
                        //******Comentado para probar la funcionalidad en safari, Activar despues de las pruebas
                        setSimpleLookupValue("new_quoteventanillaunica", "quote", items[i]["QuoteId"], items[i]["Name"]);                      
                    }
                    disableClassificationSection(true);
                }
				else
				// If StateCode= 0 - "Draft" and  ( StatusCode= 100000001 - "Submitted" OR StatusCode= 100000000 - "Pending Approval")
				if ((items[i]["StateCode"].Value == 0 && (items[i]["StatusCode"].Value == 100000001 || items[i]["StatusCode"].Value == 100000000))) {
					Xrm.Page.getControl("new_estimatedprojectstartdate").setDisabled(false); //------------
				}
            }
        }
        else {
            disableClassificationSection(false);
        }

        if (!haveQuote) {
            if (Xrm.Page.getAttribute("new_quoteventanillaunica").getValue() != null) {
                Xrm.Page.getAttribute("new_quoteventanillaunica").setValue(null);
                Xrm.Page.getAttribute("new_quoteventanillaunica").setSubmitMode("always");
            }
        }
    }
}

function disableClassificationSection(disable) {
    // Classification  Section
    Xrm.Page.getControl("new_softtekmarket").setDisabled(disable); //--------------
    Xrm.Page.getControl("new_marketscope_opp").setDisabled(disable); //----------
    Xrm.Page.getControl("new_serviceoffering").setDisabled(disable); //-----------
    Xrm.Page.getControl("new_salespracticeownerid").setDisabled(disable); //----------------
    Xrm.Page.getControl("new_technologygroup").setDisabled(disable); //-------
    Xrm.Page.getControl("new_opportunitytypeopp").setDisabled(disable); //------------
    Xrm.Page.getControl("new_deliverymodelopp").setDisabled(disable); //--------------
    Xrm.Page.getControl("new_systech").setDisabled(disable); //-------------
    Xrm.Page.getControl("new_softtekcountryopp").setDisabled(disable); //----------------
    Xrm.Page.getControl("new_softtekvertical1").setDisabled(disable); //-----------------
    Xrm.Page.getControl("new_serviceofferingtype").setDisabled(disable); //-------------
    Xrm.Page.getControl("new_projectid").setDisabled(disable); //------------
    //Market Distribution Section
    Xrm.Page.getControl("new_brazileffort").setDisabled(disable);
    Xrm.Page.getControl("new_chinaeffort").setDisabled(disable);
    Xrm.Page.getControl("new_europeeffort").setDisabled(disable);
    Xrm.Page.getControl("new_mexicoeffort").setDisabled(disable);
    Xrm.Page.getControl("new_ssheffort").setDisabled(disable);
    Xrm.Page.getControl("new_unitedstateeffort").setDisabled(disable);
    Xrm.Page.getControl("originatingleadid").setDisabled(disable); //-----------------------
    Xrm.Page.getControl("campaignid").setDisabled(disable); //--------------------------
    Xrm.Page.getControl("customerid").setDisabled(disable); //-----------------------
    Xrm.Page.getControl("new_gdcresponsibleopp").setDisabled(disable); //--------------------------
    Xrm.Page.getControl("estimatedvalue").setDisabled(disable); //---------------Est Revenue
    Xrm.Page.getControl("new_estimatedprojectduration").setDisabled(disable); //------------
    Xrm.Page.getControl("new_positionfteeffort").setDisabled(disable); //--------------Est Proj Hours
    Xrm.Page.getControl("new_estimatedprojectstartdate").setDisabled(disable); //------------
    Xrm.Page.getControl("new_estimatedftes").setDisabled(disable); //---------------------
    Xrm.Page.getControl("new_estimatedprojectenddate").setDisabled(disable); //----------------    
}

function disableOppFormFields(exceptions) {
    Xrm.Page.ui.controls.forEach(function (control, index) {
        if (doesControlHaveAttribute(control)) {
            SectionLabel = control.getParent().getLabel();
            var disabledControl = true;
            exceptions.forEach(function (ex) {
                if (ex.extype == "category") {
                    if (ex.name == SectionLabel) disabledControl = false;
                }
                else {
                    if (ex.name == control.getName()) disabledControl = false;
                }

            });
            control.setDisabled(disabledControl);
        }
    });
}

function InitializeRevenueDistribution() {
    if (Xrm.Page.getAttribute("new_unitedstateeffort").getValue() == null) {
        Xrm.Page.getAttribute("new_unitedstateeffort").setValue(0.00);
        Xrm.Page.getAttribute("new_unitedstateeffort").setSubmitMode("always");
    }
    if (Xrm.Page.getAttribute("new_chinaeffort").getValue() == null) {
        Xrm.Page.getAttribute("new_chinaeffort").setValue(0.00);
        Xrm.Page.getAttribute("new_chinaeffort").setSubmitMode("always");
    }
    if (Xrm.Page.getAttribute("new_europeeffort").getValue() == null) {
        Xrm.Page.getAttribute("new_europeeffort").setValue(0.00);
        Xrm.Page.getAttribute("new_europeeffort").setSubmitMode("always");
    }
    if (Xrm.Page.getAttribute("new_brazileffort").getValue() == null) {
        Xrm.Page.getAttribute("new_brazileffort").setValue(0.00);
        Xrm.Page.getAttribute("new_brazileffort").setSubmitMode("always");
    }
    if (Xrm.Page.getAttribute("new_mexicoeffort").getValue() == null) {
        Xrm.Page.getAttribute("new_mexicoeffort").setValue(0.00);
        Xrm.Page.getAttribute("new_mexicoeffort").setSubmitMode("always");
    }
    if (Xrm.Page.getAttribute("new_ssheffort").getValue() == null) {
        Xrm.Page.getAttribute("new_ssheffort").setValue(0.00);
        Xrm.Page.getAttribute("new_ssheffort").setSubmitMode("always");
    }
}

function Form_onsave(context) {   
    
    CheckCloseDate();
    InitializeRevenueDistribution();
    OppTypeFieldValidations();
	CheckProjectID();
    var canSave = SetMDLValue(context);
    if (canSave) {
        UpdateQuote(context);
		UpdateQuoteStartDate(context);
    }
}

function UpdateQuoteStartDate(context) {    
    if (Xrm.Page.getAttribute("new_quoteventanillaunica").getValue() != null) {
        var entityId = Xrm.Page.getAttribute("new_quoteventanillaunica").getValue()[0].id;
        var item = null;
        if (entityId != null) {
            XrmServiceToolkit.Rest.RetrieveMultiple("QuoteSet", "$filter= QuoteId eq guid'" + entityId + "'",
            function (results) {
                item = results;
            },
            // ReSharper disable once UnuentityIdsedParameter
            function (error) {
                alert("Error = " + error);
            },
            function onComplete() {},
            false);
        }
	if (item.length > 0)
		if (item[0].StateCode.Value != 1 && item[0].StatusCode.Value != 2){
		// Update the  Quote Record
				var quote = {};
				quote.new_EstProjStartDate = Xrm.Page.getAttribute("new_estimatedprojectstartdate").getValue().toCRMFormat();

				XrmServiceToolkit.Rest.Update(
				entityId, quote, "QuoteSet", function () {               
				},
				function (error) {
					alert("Error = " + error);
				},
				false);
		}
  }
}

function SetMDLValue(context) {
    //If a single field contains 100% then MDL = No									
    //IF 100% is divided among multiple fields then Value is Yes									
    // This section changed from Effort to Revenue in the title
    var ObjMultipleDeliveryLocations = Xrm.Page.getAttribute("new_multipledeliverylocations");

    var BrazilEffort = Xrm.Page.getAttribute('new_brazileffort').getValue();
    var ChinaEffort = Xrm.Page.getAttribute('new_chinaeffort').getValue();
    var EuropeEffort = Xrm.Page.getAttribute('new_europeeffort').getValue();
    var MexicoEffort = Xrm.Page.getAttribute('new_mexicoeffort').getValue();
    var SSHEffort = Xrm.Page.getAttribute('new_ssheffort').getValue();
    var USAEffort = Xrm.Page.getAttribute('new_unitedstateeffort').getValue();

    var TotalEffort = BrazilEffort + ChinaEffort + EuropeEffort + MexicoEffort + SSHEffort + USAEffort;
    if (TotalEffort != 100.00) {
        alert('The Sum of Market Distributed Revenue % should be 100');
        context.getEventArgs().preventDefault();
        return false;
    }
    else {

        if (BrazilEffort == 100 || ChinaEffort == 100 || EuropeEffort == 100 || MexicoEffort == 100 || SSHEffort == 100 || USAEffort == 100) {
            ObjMultipleDeliveryLocations.setValue(false)
        }
        else {
            ObjMultipleDeliveryLocations.setValue(true)
        }
        ObjMultipleDeliveryLocations.setSubmitMode("always");
    }
    return true;
}

function SofttekMarket_onchange() {
    CheckProjectID();

    Xrm.Page.ui.refreshRibbon();
}

function MarketScope_onchange() {
    Filter_SofttekVertical();
}

function estimatedvalue_onchange() {
    var optOppType = Xrm.Page.getAttribute("new_opportunitytypeopp").getSelectedOption();
    var attEstRev = Xrm.Page.getAttribute("estimatedvalue");

    if (optOppType != null && optOppType.value == "100000003") {
        attEstRev.setValue(Math.abs(attEstRev.getValue()) * -1);
    }

    if (Xrm.Page.getAttribute("new_estimatedprojectduration").getValue() != null) {
        var estimatedmonthlyrevenue = Xrm.Page.getAttribute("estimatedvalue").getValue() / Xrm.Page.getAttribute("new_estimatedprojectduration").getValue();
        Xrm.Page.getAttribute("new_estimatedmonthlyrevenue").setValue(estimatedmonthlyrevenue);
    }
    else {
        Xrm.Page.getAttribute("new_estimatedmonthlyrevenue").setValue(null);
    }

    Xrm.Page.getAttribute("new_estimatedmonthlyrevenue").setSubmitMode("always");
}

function onDiscountChange() {
    var discount = Xrm.Page.getAttribute("discountpercentage").getValue();
    var estRevenue = Xrm.Page.getAttribute("estimatedvalue").getValue();
    if (discount != null && estRevenue != null) {
        var discountAmount = estRevenue * discount / 100;
        Xrm.Page.getAttribute("discountamount").setValue(discountAmount);
        Xrm.Page.getAttribute("totalamount").setValue(estRevenue - discountAmount);
	}
    else {
        Xrm.Page.getAttribute("discountamount").setValue(null);
        Xrm.Page.getAttribute("totalamount").setValue(null);
    }
	 Xrm.Page.getAttribute("totalamount").setSubmitMode("always");
        
}

function new_estimatedprojectduration_onchange() {
    if (Xrm.Page.getAttribute("new_estimatedprojectduration").getValue() != null) {
        var estimatedmonthlyrevenue = Xrm.Page.getAttribute("estimatedvalue").getValue() / Xrm.Page.getAttribute("new_estimatedprojectduration").getValue();
        Xrm.Page.getAttribute("new_estimatedmonthlyrevenue").setValue(estimatedmonthlyrevenue);

        if (Xrm.Page.getAttribute("new_estimatedprojectduration").getValue() > 12) {
            Xrm.Page.getAttribute("new_multiyearsale").setValue(true);
        }
        else {
            Xrm.Page.getAttribute("new_multiyearsale").setValue(false);
        }
    }
    else {
        Xrm.Page.getAttribute("new_estimatedmonthlyrevenue").setValue(null);
    }
    Xrm.Page.getAttribute("new_estimatedmonthlyrevenue").setSubmitMode("always");

    setEstimatedEndDate();
}

function new_estimatedprojectstartdate_onchange() {
    setEstimatedEndDate();
}

function UpdateQuote(context) {    
    if (Xrm.Page.getAttribute("new_quoteventanillaunica").getValue() != null) {
        var entityId = Xrm.Page.getAttribute("new_quoteventanillaunica").getValue()[0].id;
        var item = null;
        if (entityId != null) {
            XrmServiceToolkit.Rest.RetrieveMultiple("QuoteSet", "$filter= QuoteId eq guid'" + entityId + "'",
            function (results) {
                item = results;
            },
            // ReSharper disable once UnuentityIdsedParameter
            function (error) {
                alert("Error = " + error);
            },
            function onComplete() {},
            false);
        }

        //StateCode= 0 -"Draft"
        if (item[0]["StateCode"].Value == 0 && item[0]["new_SubmitSW"] == false) {
            var fieldBdm;
            var projectId;
            var estimatedFte = Xrm.Page.getAttribute("new_estimatedftes").getValue();
            var quoteEffort = Xrm.Page.getAttribute("new_positionfteeffort").getValue();           
            // Update the  Quote Record
            var quote = {};

            quote.CustomerId = {
                Id: Xrm.Page.getAttribute("customerid").getValue()[0].id,
                LogicalName: "account"
            }; //ID
            if (Xrm.Page.getAttribute("originatingleadid").getValue() != null) quote.new_OriginLead = {
                Id: Xrm.Page.getAttribute("originatingleadid").getValue()[0].id,
                LogicalName: "lead"
            };
            else quote.new_OriginLead = null;

            if (Xrm.Page.getAttribute("campaignid").getValue() != null) quote.CampaignId = {
                Id: Xrm.Page.getAttribute("campaignid").getValue()[0].id,
                LogicalName: "campaign"
            };
            else quote.CampaignId = null;

            quote.new_SofttekMarketQuote = {
                Value: Xrm.Page.getAttribute("new_softtekmarket").getValue()
            };
            quote.new_SofttekCountryQuote = {
                Value: Xrm.Page.getAttribute("new_softtekcountryopp").getValue()
            };
            quote.new_MarketScopeQuote = {
                Value: Xrm.Page.getAttribute("new_marketscope_opp").getValue()
            };
            quote.new_SofttekVerticalQuote = {
                Value: Xrm.Page.getAttribute("new_softtekvertical1").getValue()
            };
            quote.new_ServiceOffering = {
                Value: Xrm.Page.getAttribute("new_serviceoffering").getValue()
            };
            quote.new_ServiceOfferingType = {
                Value: Xrm.Page.getAttribute("new_serviceofferingtype").getValue()
            };

            if (Xrm.Page.getAttribute("new_salespracticeownerid").getValue() != null) {
                fieldBdm = Xrm.Page.getAttribute("new_salespracticeownerid").getValue()[0].id;
            }
            else {
                fieldBdm = null;
            }

            quote.new_BDM = {
                Id: fieldBdm
            };
            quote.new_TechnologyGroup = {
                Value: Xrm.Page.getAttribute("new_technologygroup").getValue()
            };
            quote.new_OpportunityTypeQuote = {
                Value: Xrm.Page.getAttribute("new_opportunitytypeopp").getValue()
            };

            if (Xrm.Page.getControl("new_projectid").getDisabled() == true) projectId = "";
            else projectId = Xrm.Page.getAttribute("new_projectid").getValue();

            quote.new_ProjectIDQuote = projectId;

            quote.new_deliverymodel = {
                Value: Xrm.Page.getAttribute("new_deliverymodelopp").getValue()
            };
            quote.new_systech = Xrm.Page.getAttribute("new_systech").getValue();

            quote.new_EstRevenueQuote = {
                Value: Xrm.Page.getAttribute("estimatedvalue").getValue().toString()
            };
            quote.new_EstProjDurationQuote = Xrm.Page.getAttribute("new_estimatedprojectduration").getValue();

            if (quoteEffort != null) quote.New_QuoteEffort = quoteEffort.toString();
            else quote.New_QuoteEffort = null;

            quote.new_EstimatedMonthlyRevenue = {
                Value: Xrm.Page.getAttribute("new_estimatedmonthlyrevenue").getValue().toString()
            };

            if (estimatedFte != null) quote.new_estimatedftes = estimatedFte.toString();
            else quote.new_estimatedftes = null;

            quote.new_EstProjStartDate = Xrm.Page.getAttribute("new_estimatedprojectstartdate").getValue().toCRMFormat();
            quote.new_EstProjEndDate = Xrm.Page.getAttribute("new_estimatedprojectenddate").getValue().toCRMFormat();
            quote.new_GDCResponsible = {
                Value: Xrm.Page.getAttribute("new_gdcresponsibleopp").getValue()
            };
            quote.new_multiyearsale = Xrm.Page.getAttribute("new_multiyearsale").getValue();
            quote.new_multiyearopp = Xrm.Page.getAttribute("new_multiyearopp").getValue();

            quote.new_USAEffort = Xrm.Page.getAttribute("new_unitedstateeffort").getValue().toString();
            quote.new_MexicoEffort = Xrm.Page.getAttribute("new_mexicoeffort").getValue().toString();
            quote.new_EuropeEffort = Xrm.Page.getAttribute("new_europeeffort").getValue().toString();
            quote.new_SSHEffort = Xrm.Page.getAttribute("new_ssheffort").getValue().toString();
            quote.new_BrazilEffort = Xrm.Page.getAttribute("new_brazileffort").getValue().toString();
            quote.new_ChinaEffort = Xrm.Page.getAttribute("new_chinaeffort").getValue().toString();

            XrmServiceToolkit.Rest.Update(
            entityId, quote, "QuoteSet", function () {               
            },
            function (error) {
                alert("Error = " + error);
            },
            false);
        }
    }
}
