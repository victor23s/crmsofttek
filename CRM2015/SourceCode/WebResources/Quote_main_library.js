/// <reference path="JQuery.js" />
/// <reference path="Json2.js" />
/// <reference path="XrmServiceToolkit.js" />
/// <reference path="CRMUtils.js" />
/// <reference path="SaveAndRefresh.js" />
function SetRateCardReqs() {
    /* Make Delivery Manager Not Required and Est FTEs Required and Validate Est Revenue is 0 when Opp Type == Rate Card -- Req 211951 */
    var optOppType = Xrm.Page.getAttribute("new_opportunitytypequote").getSelectedOption();
    var attEstFTEs = Xrm.Page.getAttribute("new_estimatedftes");
    var attDelivMgr = Xrm.Page.getAttribute("new_deliverymanagerquote");
    var attEstRev = Xrm.Page.getAttribute("new_estrevenuequote");

    if (optOppType != null) {
        if (optOppType.value != "100000004") {
            attDelivMgr.setRequiredLevel("required");
        } else {
            attDelivMgr.setRequiredLevel("none");
            attEstFTEs.setRequiredLevel("required");

            if (attEstRev.getValue() != 0) {
                alert("Est. Revenue should be 0 when Opportunity Type = Rate Card");
                attEstRev.setValue(0);
                estimatedvalue_onchange()
            }
        }
    }
}

function Form_onload() {
    setPriceList();

    Enabled_sw_checkbox();
    var opportunity = Xrm.Page.getAttribute("opportunityid").getValue();

    if (opportunity == null) {
        alert("Quote cannot be created without a valid Account. Please create it from an Opportunity.");
        Xrm.Page.ui.close();
    }

    //Set Default Value for Discount
    if (Xrm.Page.getAttribute("discountpercentage").getValue() == null) {
        Xrm.Page.getAttribute("discountpercentage").setValue(0.00);
        Xrm.Page.getAttribute("discountpercentage").setSubmitMode("always");
    }

    var optSofttekMarket = Xrm.Page.getAttribute("new_softtekmarketquote").getSelectedOption();
    if (optSofttekMarket != null && optSofttekMarket.text == "USA & Canada") {
        Xrm.Page.getAttribute("new_ebitda").setRequiredLevel("required");
    }

    //Update for Delivery Model
    var optDeliveryModel = Xrm.Page.getAttribute("new_deliverymodel").getSelectedOption();
    if ((optDeliveryModel == null) || (optDeliveryModel != null && optDeliveryModel.value != 100000000 && optDeliveryModel.value != 100000001 && optDeliveryModel.value != 100000002 && optDeliveryModel.value != 100000003)) {
        Xrm.Page.getControl("new_deliverymodel").removeOption(100000000);
        Xrm.Page.getControl("new_deliverymodel").removeOption(100000001);
        Xrm.Page.getControl("new_deliverymodel").removeOption(100000002);
        Xrm.Page.getControl("new_deliverymodel").removeOption(100000003);
    }
    //Update for approval status
    Xrm.Page.getControl("new_approvalstatus").removeOption(100000004); //remove acknowledge
    Xrm.Page.getControl("new_approvalstatus").removeOption(100000005); //remove not required
    //Set the Assigned Team
    Xrm.Page.getAttribute("new_assignedteam").setSubmitMode("always");

    //SW process
    SingleWindowPhase1();

    //Enable Est Proj Start Date according Quote Status
    var status = Xrm.Page.getAttribute("statecode").getValue();
    var statusReason = Xrm.Page.getAttribute("statuscode").getValue();
    if (status == 0 && (statusReason == 100000001 || statusReason == 100000000)) { // Draft and ( Submitted OR Pending Approval)
        //alert(" Status: " + status + "\n Status Reason: " + statusReason);
        Xrm.Page.getControl("new_estprojstartdate").setDisabled(false);
    }

    /* Make Delivery Manager Required when Opp Type != Rate Card and Validate Est. Revenue is 0 -- Req 211951 */
    SetRateCardReqs();

    //Calculate Total Revenue
    CalculateRevenue();
	
}

function Enabled_sw_checkbox() {
    var grossmargin = Xrm.Page.getAttribute("new_grossmargin").getValue();
    var grossprofit = Xrm.Page.getAttribute("new_grossprofit").getValue();
    var subcontractorsquote = Xrm.Page.getAttribute("new_subcontractorsquote").getValue();
    var penalty = Xrm.Page.getAttribute("new_penalty").getValue();
    var paymentterms = Xrm.Page.getAttribute("new_paymentterms").getValue();
    var deliverymanagerquote = Xrm.Page.getAttribute("new_deliverymanagerquote").getValue();


    if (grossmargin == null || grossprofit == null || subcontractorsquote == null || penalty == null || paymentterms == null || deliverymanagerquote == null) {

        Xrm.Page.getControl("new_submitsw").setDisabled(true);
    } else {
        Xrm.Page.getControl("new_submitsw").setDisabled(false);
    }
}

function setPriceList() {
    if (Xrm.Page.getAttribute("pricelevelid").getValue() == null) {
        //Set Default Price List
        // 1st Paramter is Price List Name, 2nd Paramter is Price List GUID
        var currency = Xrm.Page.getAttribute("transactioncurrencyid").getValue()[0].name;
        var orgName = Xrm.Page.context.getOrgUniqueName();
        if (orgName == "onesofttek0") { //DEV
            if (currency == "US Dollar") {
                setSimpleLookupValue("pricelevelid", "pricelevel", "{bEDF0021F-037F-E411-894D-6C3BE5A82FE8}", "Softtek Price List Dollar");
            } else if (currency == "Peso") {
                setSimpleLookupValue("pricelevelid", "pricelevel", "{b40957033-037F-E411-894D-6C3BE5A82FE8}", "Softtek Price List Peso");
            }
        }
    }
}

function SingleWindowPhase1() {
    //disabled Approvals Section ---------Step 1,2
    BlockApprovalsSection();
    var userid = XrmServiceToolkit.Soap.GetCurrentUserId();

    //----------Have not sent to Approvers
    if (Xrm.Page.getAttribute("new_sendtoapprove").getValue() == false) {
        //--------Submitted to SW-------
        if (Xrm.Page.getAttribute("new_submitsw").getValue() == true) {
            Xrm.Page.getControl("new_submitsw").setDisabled(true);
            //Block General And Details Section
            BlockOrUnblockGeneralAndDetailsSection(true);

            //------------Assigned To is not set-------
            if (Xrm.Page.getAttribute("new_assignedto").getValue() == null) {
                //Validate if User belongs to Assigned Team and allow or block it
                if (Xrm.Page.getAttribute("new_assignedteam").getValue() != null) {
                    var team = Xrm.Page.getAttribute("new_assignedteam").getValue()[0].id;
                    var _UserTeam = null;
                    XrmServiceToolkit.Rest.RetrieveMultiple("TeamMembershipSet", "$filter= TeamId eq guid'" + team + "'", function(results) {
                            _UserTeam = results;
                        },
                        // ReSharper disable once UnusedParameter
                        function(error) {},
                        function onComplete() {},
                        false);

                    for (var i = 0; i < _UserTeam.length; i++) {
                        if (_UserTeam[i]["SystemUserId"] == userid) {
                            Xrm.Page.getControl("new_assignedto").setDisabled(false);
                        }
                    }
                }
            } else
            //----------Assigned user is set-------
            if (Xrm.Page.getAttribute("new_assignedto").getValue()[0].id.replace("{", "").replace("}", "") == userid.toUpperCase()) {
                Xrm.Page.getControl("new_rejectorcancelquotebyassignedtouser").setDisabled(false);
                RejectByAssignedTo_onchange();
            }
        } else { //----------NOT Submitted to SW -------
            if (Xrm.Page.getAttribute("new_assignedteam").getValue() == null) {
                Xrm.Page.getControl("new_submitsw").setDisabled(true);
            }
        }
    } else {
        //--------------After Sending email notification "Approval Request"---step 6-----start---
        var optApprovalStatus = Xrm.Page.getAttribute("new_approvalstatus").getSelectedOption();

        if (optApprovalStatus.text == "Waiting for Approval") {
            BlockOrUnblockGeneralAndDetailsSection(true);
            Xrm.Page.getControl("new_submitsw").setDisabled(true);

            if (Xrm.Page.getAttribute('new_finalapprover').getValue()[0].id.replace("{", "").replace("}", "") == userid.toUpperCase() || Xrm.Page.getAttribute("new_assignedto").getValue()[0].id.replace("{", "").replace("}", "") == userid.toUpperCase()) {
                Xrm.Page.getControl("new_statusappbrml").setDisabled(false);
            }

            if (Xrm.Page.getAttribute('new_admapprover').getValue()[0].id.replace("{", "").replace("}", "") == userid.toUpperCase() || Xrm.Page.getAttribute("new_assignedto").getValue()[0].id.replace("{", "").replace("}", "") == userid.toUpperCase()) {
                Xrm.Page.getControl("new_statusappadm").setDisabled(false);
            }

            if (Xrm.Page.getAttribute('new_cooaprover').getValue()[0].id.replace("{", "").replace("}", "") == userid.toUpperCase() || Xrm.Page.getAttribute("new_assignedto").getValue()[0].id.replace("{", "").replace("}", "") == userid.toUpperCase()) {
                Xrm.Page.getControl("new_statusappcoo").setDisabled(false);
            }

            if (Xrm.Page.getAttribute("new_assignedto").getValue()[0].id.replace("{", "").replace("}", "") == userid.toUpperCase()) {
                Xrm.Page.getControl("new_approvalstatus").setDisabled(false);
            }
        }

        if (optApprovalStatus.text == "Approved" && Xrm.Page.getAttribute("statuscode").getValue() == 1) {
            //If status reason = In progress & Approval Status = Approved
            //then this quote is Rejected / Cancelled
            Xrm.Page.getAttribute("new_approvalstatus").setValue(parseInt(Xrm.Page.getAttribute("new_approvalstatus").getOptions()[0].value));
            Xrm.Page.getAttribute("new_submitsw").setValue(false);
            Xrm.Page.getAttribute("new_assignedto").setValue(null);
            Xrm.Page.getAttribute("new_approvellevel").setValue(null);
            Xrm.Page.getAttribute("new_finalapprover").setValue(null);
            Xrm.Page.getAttribute("new_statusappbrml").setValue(null);
            Xrm.Page.getAttribute("new_cooaprover").setValue(null);
            Xrm.Page.getAttribute("new_statusappcoo").setValue(null);
            Xrm.Page.getAttribute("new_admapprover").setValue(null);
            Xrm.Page.getAttribute("new_statusappadm").setValue(null);
            Xrm.Page.getAttribute("new_sendtoapprove").setValue(false);
            Xrm.Page.getAttribute("new_cancelrejectionreason").setValue(null);

            Xrm.Page.getAttribute("new_approvalstatus").setSubmitMode("always");
            Xrm.Page.getAttribute("new_submitsw").setSubmitMode("always");
            Xrm.Page.getAttribute("new_assignedto").setSubmitMode("always");
            Xrm.Page.getAttribute("new_approvellevel").setSubmitMode("always");
            Xrm.Page.getAttribute("new_finalapprover").setSubmitMode("always");
            Xrm.Page.getAttribute("new_statusappbrml").setSubmitMode("always");
            Xrm.Page.getAttribute("new_cooaprover").setSubmitMode("always");
            Xrm.Page.getAttribute("new_statusappcoo").setSubmitMode("always");
            Xrm.Page.getAttribute("new_admapprover").setSubmitMode("always");
            Xrm.Page.getAttribute("new_statusappadm").setSubmitMode("always");
            Xrm.Page.getAttribute("new_sendtoapprove").setSubmitMode("always");
            Xrm.Page.getAttribute("new_cancelrejectionreason").setSubmitMode("always");

            var entityId = Xrm.Page.data.entity.getId();
        }
    }
}

function ApprovalStatus_onchange() {
    var optApprovalStatus = Xrm.Page.getAttribute("new_approvalstatus").getSelectedOption();
    if (optApprovalStatus.text == "Rejected" || optApprovalStatus.text == "Cancelled") {
        Xrm.Page.getControl("new_cancelrejectionreason").setDisabled(false);
    } else {
        Xrm.Page.getControl("new_cancelrejectionreason").setDisabled(true);
    }
    if(optApprovalStatus.text == "Approved")    
        Xrm.Page.getAttribute("new_documenturllink").setRequiredLevel("required");    
    else
        Xrm.Page.getAttribute("new_documenturllink").setRequiredLevel("none");
}

function RejectByAssignedTo_onchange() {
    if (Xrm.Page.getAttribute("new_rejectorcancelquotebyassignedtouser").getValue() == true) {
        Xrm.Page.getControl("new_approvellevel").setDisabled(true);
        Xrm.Page.getControl("new_finalapprover").setDisabled(true);
        Xrm.Page.getControl("new_cooaprover").setDisabled(true);
        Xrm.Page.getControl("new_admapprover").setDisabled(true);
        Xrm.Page.getControl("new_sendtoapprove").setDisabled(true);
        Xrm.Page.getAttribute("new_sendtoapprove").setValue(false);
        Xrm.Page.getControl("new_cancelrejectionreason").setDisabled(false);
        Xrm.Page.getAttribute("new_cancelrejectionreason").setRequiredLevel("required");
    } else {
        //User(Assigned to) can complete approval process section
        Xrm.Page.getControl("new_approvellevel").setDisabled(false);
        Xrm.Page.getControl("new_finalapprover").setDisabled(false);
        Xrm.Page.getControl("new_cooaprover").setDisabled(false);
        Xrm.Page.getControl("new_admapprover").setDisabled(false);
        Xrm.Page.getControl("new_sendtoapprove").setDisabled(false);
        Xrm.Page.getAttribute("new_cancelrejectionreason").setValue(null);
        Xrm.Page.getControl("new_cancelrejectionreason").setDisabled(true);
        Xrm.Page.getAttribute("new_cancelrejectionreason").setRequiredLevel("none");
    }
}

function BlockApprovalsSection() {
    Xrm.Page.getControl("new_rejectorcancelquotebyassignedtouser").setDisabled(true);
    Xrm.Page.getControl("new_assignedto").setDisabled(true);
    Xrm.Page.getControl("new_approvellevel").setDisabled(true);
    Xrm.Page.getControl("new_finalapprover").setDisabled(true);
    Xrm.Page.getControl("new_statusappbrml").setDisabled(true);
    Xrm.Page.getControl("new_cooaprover").setDisabled(true);
    Xrm.Page.getControl("new_statusappcoo").setDisabled(true);
    Xrm.Page.getControl("new_admapprover").setDisabled(true);
    Xrm.Page.getControl("new_statusappadm").setDisabled(true);
    Xrm.Page.getControl("new_sendtoapprove").setDisabled(true);
    Xrm.Page.getControl("new_cancelrejectionreason").setDisabled(true);
    Xrm.Page.getControl("new_approvalstatus").setDisabled(true);
}
//Deprecated
/*function OnchangeSW ()
{
	var submitSW = Xrm.Page.getAttribute("new_submitsw").getValue();
    var statusReason = Xrm.Page.getAttribute("statuscode").getValue();
    var documentUrl = Xrm.Page.getAttribute("new_documenturllink").getValue();
	 if (submitSW == true && statusReason == 1 && documentUrl == null) 
        Xrm.Page.getAttribute("new_documenturllink").setRequiredLevel("required");
	else
	Xrm.Page.getAttribute("new_documenturllink").setRequiredLevel("none");
}*/

function Form_onsave(context) {
    var submitSW = Xrm.Page.getAttribute("new_submitsw").getValue();
    var assignedTo = Xrm.Page.getAttribute("new_assignedto").getValue();
    var OpportunityId = Xrm.Page.getAttribute("opportunityid").getValue()[0].id;
    var statusReason = Xrm.Page.getAttribute("statuscode").getValue();
    var documentUrl = Xrm.Page.getAttribute("new_documenturllink").getValue();

    //Checking if softtek market is equal to usa & canada
    var optSofttekMarket = Xrm.Page.getAttribute("new_softtekmarketquote").getValue();

    // Make Document URL required if the status is In progress and Sw is true
    if (submitSW == true && statusReason == 1 && documentUrl == null) {
        Xrm.Page.getAttribute("new_documenturllink").setRequiredLevel("required");
        alert("You need to provide a document URL before submitting the Quote");
        
    } else {            
 
            InitializeRevenueDistribution();

            /* Make Delivery Manager Required when Opp Type != Rate Card and Validate Est. Revenue is 0 -- Req 211951 */
            SetRateCardReqs();

            var canSave = SetMDLValue(context);

            if (!canSave)
                return;

            if (Xrm.Page.getAttribute("new_rejectorcancelquotebyassignedtouser").getValue() == true &&
                Xrm.Page.getAttribute("new_submitsw").getValue() == true) {
                var counter = Xrm.Page.getAttribute("new_counter").getValue();
                if (counter != null) {
                    Xrm.Page.getAttribute("new_counter").setValue(counter + 1);
                } else {
                    Xrm.Page.getAttribute("new_counter").setValue(1);
                }
                if (Xrm.Page.getAttribute("new_assignedto").getValue() != null)
                    setSimpleLookupValue("new_assignedto_hidden", "systemuser", Xrm.Page.getAttribute("new_assignedto").getValue()[0].id, Xrm.Page.getAttribute("new_assignedto").getValue()[0].name);
                Xrm.Page.getAttribute("new_assignedto").setValue(null);
                Xrm.Page.getAttribute("new_submitsw").setValue(false);
                Xrm.Page.getAttribute("new_counter").setSubmitMode("always");
                Xrm.Page.getAttribute("new_submitsw").setSubmitMode("always");
                Xrm.Page.getAttribute("new_assignedto").setSubmitMode("always");
                Xrm.Page.getAttribute("new_assignedteam").setSubmitMode("always");
            } else {
                CheckBeforeApprovalRequest(context);
                AfterApprovalChanged(context);
                UpdateOpp();
            }
    }
      
	var approvalStatus = ApprovalValidations();
	if (approvalStatus != 0) {
		Xrm.Page.getAttribute("new_approvalstatus").setValue(approvalStatus);
		Xrm.Page.getAttribute("new_approvalstatus").setSubmitMode("always");
	} 
}

function AfterApprovalChanged(context) {
    var optApprovalStatus = Xrm.Page.getAttribute("new_approvalstatus").getSelectedOption();
    if (Xrm.Page.getAttribute("new_sendtoapprove").getValue() == true && Xrm.Page.getControl("new_sendtoapprove").getDisabled() == true) {
        var date = new Date();
        date = date.Format("dd/mm/yyyy");
		if(Xrm.Page.getAttribute("new_assignedto").getValue() != null)
			var strAssignedTo = Xrm.Page.getAttribute("new_assignedto").getValue()[0].name;
		if(Xrm.Page.getAttribute("new_finalapprover").getValue() != null)
			var strFinaApprover = Xrm.Page.getAttribute("new_finalapprover").getValue()[0].name;
		if(Xrm.Page.getAttribute("new_admapprover").getValue() != null)
			var strSalesApprover = Xrm.Page.getAttribute("new_admapprover").getValue()[0].name;
		if(Xrm.Page.getAttribute("new_cooaprover").getValue() != null)
			var strOperApprover = Xrm.Page.getAttribute("new_cooaprover").getValue()[0].name;
		if(Xrm.Page.getAttribute("new_approvellevel").getValue() != null)
		    var strApprovelLevel = Xrm.Page.getAttribute("new_approvellevel").getSelectedOption().text;
        var strHistory = (Xrm.Page.getAttribute("new_approvalhistory").getValue() == null) ? "" : Xrm.Page.getAttribute("new_approvalhistory").getValue() + "\n";
        if (optApprovalStatus.text == "Rejected" || optApprovalStatus.text == "Cancelled") {
            //Rejected or Cancelled
            if (Xrm.Page.getAttribute("new_cancelrejectionreason").getValue() == null) {
                alert("Please write the Rejected/Cancelled Reason!");
                context.getEventArgs().preventDefault();
            } else {
                if (optApprovalStatus.text == "Rejected") {
                    var rejections = Xrm.Page.getAttribute("new_rejection").getValue();
                    if (rejections != null) {
                        Xrm.Page.getAttribute("new_rejection").setValue(rejections + 1);
                    } else {
                        Xrm.Page.getAttribute("new_rejection").setValue(1);
                    }
                    Xrm.Page.getAttribute("new_rejection").setSubmitMode("always");
                }
                //Set Approval History
                //Rejected-10/01/2012-Cynthia Martinez-Jesse Zhang-Level 4 - BRM + DM + BRML + PxM / ADM + COO + CEO			
                strHistory += optApprovalStatus.text + "-" + date + "-" + strAssignedTo + "-" + strSalesApprover + "-" + strOperApprover + "-" + strFinaApprover + "-" + strApprovelLevel;
                Xrm.Page.getAttribute("new_approvalhistory").setValue(strHistory);
                //step 6.1
                //Section "Approval process" must be cleared
                //Caution: Don't Clear Cancel /Rejection Reason field
                Xrm.Page.getAttribute("new_submitsw").setValue(false);
                Xrm.Page.getAttribute("new_approvellevel_hidden").setValue(Xrm.Page.getAttribute("new_approvellevel").getSelectedOption().text);
                Xrm.Page.getAttribute("new_finalapprover_hidden").setValue(Xrm.Page.getAttribute("new_finalapprover").getValue()[0].name);
                setSimpleLookupValue("new_assignedto_hidden", "systemuser", Xrm.Page.getAttribute("new_assignedto").getValue()[0].id, Xrm.Page.getAttribute("new_assignedto").getValue()[0].name);
                setSimpleLookupValue("new_finalapprover_hidden", "systemuser", Xrm.Page.getAttribute("new_finalapprover").getValue()[0].id, Xrm.Page.getAttribute("new_finalapprover").getValue()[0].name);
                setSimpleLookupValue("new_salesapproverhidden", "systemuser", Xrm.Page.getAttribute("new_admapprover").getValue()[0].id, Xrm.Page.getAttribute("new_admapprover").getValue()[0].name);
                setSimpleLookupValue("new_operationsapproverhidden", "systemuser", Xrm.Page.getAttribute("new_cooaprover").getValue()[0].id, Xrm.Page.getAttribute("new_cooaprover").getValue()[0].name);
                Xrm.Page.getAttribute("new_approvellevel").setValue(null);
                Xrm.Page.getAttribute("new_finalapprover").setValue(null);
                Xrm.Page.getAttribute("new_assignedto").setValue(null);
                Xrm.Page.getAttribute("new_sendtoapprove").setValue(false);
                Xrm.Page.getAttribute("new_statusappbrml").setValue(null);
                Xrm.Page.getAttribute("new_cooaprover").setValue(null);
                Xrm.Page.getAttribute("new_statusappcoo").setValue(null);
                Xrm.Page.getAttribute("new_admapprover").setValue(null);
                Xrm.Page.getAttribute("new_statusappadm").setValue(null);
                Xrm.Page.getAttribute("new_submitsw").setSubmitMode("always");
                Xrm.Page.getAttribute("new_assignedto").setSubmitMode("always");
                Xrm.Page.getAttribute("new_approvellevel").setSubmitMode("always");
                Xrm.Page.getAttribute("new_approvellevel_hidden").setSubmitMode("always");
                Xrm.Page.getAttribute("new_finalapprover").setSubmitMode("always");
                Xrm.Page.getAttribute("new_sendtoapprove").setSubmitMode("always");
                Xrm.Page.getAttribute("new_approvalhistory").setSubmitMode("always");
                Xrm.Page.getAttribute("new_statusappbrml").setSubmitMode("always");
                Xrm.Page.getAttribute("new_cooaprover").setSubmitMode("always");
                Xrm.Page.getAttribute("new_statusappcoo").setSubmitMode("always");
                Xrm.Page.getAttribute("new_admapprover").setSubmitMode("always");
                Xrm.Page.getAttribute("new_statusappadm").setSubmitMode("always");
            }
        } else if (optApprovalStatus.text == "Approved" && Xrm.Page.getAttribute("statuscode").getValue() != 2) {
            //Set Approval History
            //Rejected-10/01/2012-Cynthia Martinez-Jesse Zhang-Level 4 - BRM + DM + BRML + PxM / ADM + COO + CEO
            strHistory += optApprovalStatus.text + "-" + date + "-" + strAssignedTo + "-" + strSalesApprover + "-" + strOperApprover + "-" + strFinaApprover + "-" + strApprovelLevel;
            Xrm.Page.getAttribute("new_approvalhistory").setValue(strHistory);
            Xrm.Page.getAttribute("new_approvalhistory").setSubmitMode("always");
        }
    }
}

//validation that approval section is not empty
function CheckBeforeApprovalRequest(context) {
    if (Xrm.Page.getAttribute("new_sendtoapprove").getValue() == true && Xrm.Page.getControl("new_sendtoapprove").getDisabled() == false) {
        if (Xrm.Page.getAttribute("new_approvellevel").getValue() == null || Xrm.Page.getAttribute("new_admapprover").getValue() == null || Xrm.Page.getAttribute("new_finalapprover").getValue() == null || Xrm.Page.getAttribute("new_cooaprover").getValue() == null) {
            alert("All 3 Approvers need to be entered to submit the notification!");
            context.getEventArgs().preventDefault();
        } else {
            var assignedTo = Xrm.Page.getAttribute("new_assignedto").getValue()[0].id;
            var financeApprover = Xrm.Page.getAttribute("new_finalapprover").getValue()[0].id;
            var salesApprover = Xrm.Page.getAttribute("new_admapprover").getValue()[0].id;
            var operationsApprover = Xrm.Page.getAttribute("new_cooaprover").getValue()[0].id;
            if (assignedTo == financeApprover || assignedTo == salesApprover || assignedTo == operationsApprover || salesApprover == operationsApprover || salesApprover == financeApprover || operationsApprover == financeApprover) {
                alert("The 'Assigned To' and Approvers cannot be the same user, please change the Approver!");
                context.getEventArgs().preventDefault();
            }
        }
    }
}

function BlockOrUnblockGeneralAndDetailsSection(bool) {
    //Blocked general, details
    Xrm.Page.getControl("new_originlead").setDisabled(bool);
    Xrm.Page.getControl("new_systech").setDisabled(bool);
    Xrm.Page.getControl("campaignid").setDisabled(bool);
    Xrm.Page.getControl("description").setDisabled(bool);
    Xrm.Page.getControl("new_estprojdurationquote").setDisabled(bool);
    Xrm.Page.getControl("new_quoteeffort").setDisabled(bool);
    Xrm.Page.getControl("new_deliverymodel").setDisabled(bool);
    Xrm.Page.getControl("new_estimatedftes").setDisabled(bool);
    Xrm.Page.getControl("new_estprojstartdate").setDisabled(bool);
    Xrm.Page.getControl("new_gdcresponsible").setDisabled(bool);
    Xrm.Page.getControl("new_deliverymanagerquote").setDisabled(bool);
    Xrm.Page.getControl("new_externalprojleader").setDisabled(bool);
    Xrm.Page.getControl("new_estrevenuequote").setDisabled(bool);
    Xrm.Page.getControl("discountpercentage").setDisabled(bool);
    Xrm.Page.getControl("new_paymentterms").setDisabled(bool);
    Xrm.Page.getControl("new_usaeffort").setDisabled(bool);
    Xrm.Page.getControl("new_chinaeffort").setDisabled(bool);
    Xrm.Page.getControl("new_europeeffort").setDisabled(bool);
    Xrm.Page.getControl("new_mexicoeffort").setDisabled(bool);
    Xrm.Page.getControl("new_brazileffort").setDisabled(bool);
    Xrm.Page.getControl("new_ssheffort").setDisabled(bool);
    Xrm.Page.getControl("new_grossmargin").setDisabled(bool);
    Xrm.Page.getControl("new_subcontractorsquote").setDisabled(bool);
    Xrm.Page.getControl("new_ebitda").setDisabled(bool);
    Xrm.Page.getControl("new_penalty").setDisabled(bool);
    Xrm.Page.getControl("new_grossprofit").setDisabled(bool);
    Xrm.Page.getControl("name").setDisabled(bool);
    Xrm.Page.getControl("effectivefrom").setDisabled(bool);
    Xrm.Page.getControl("customerid").setDisabled(bool);
    Xrm.Page.getControl("ownerid").setDisabled(bool);
    Xrm.Page.getControl("effectiveto").setDisabled(bool);
    Xrm.Page.getControl("expireson").setDisabled(bool);
}

function AssignTeam() {
    var ObjAssignedTeam = Xrm.Page.getAttribute("new_assignedteam").getValue();
    var ObjMarket = Xrm.Page.getAttribute("new_softtekmarketquote").getValue();
    if (ObjMarket != null) {
        var entityName = 'team';
        var items = null;
        XrmServiceToolkit.Rest.RetrieveMultiple("TeamSet", "$filter= new_SofttekMarketTeam/Value eq " + ObjMarket + " and new_AreaTeam/Value eq 100000001 ", //+ ObjMarket + "' ",//&$filter= new_AreaTeam/Value eq 100000001 ", //"$select = * ",
            function(results) {
                items = results;
            },
            // ReSharper disable once UnusedParameter
            function(error) {},
            function onComplete() {},
            false);

        if (items.length > 0) {
            var teamID = items[0]["TeamId"];
            var teamName = items[0]["Name"];
            if (teamID != null) {
                setSimpleLookupValue("new_assignedteam", "team", teamID, teamName);
            }
        }

        //Asignación de Equipo para Mercado Cloud
        if (ObjMarket == 100000006) {
            var teamID = "{57526b71-0861-e311-8b1d-6c3be5bd5e64}";
            var teamName = "MEX A&V";
            setSimpleLookupValue("new_assignedteam", "team", teamID, teamName);

        }
    } else {
        Xrm.Page.getAttribute("new_assignedteam").setValue(null);
        Xrm.Page.getAttribute("new_assignedteam").setSubmitMode("always");
    }
}

function InitializeRevenueDistribution() {
    if (Xrm.Page.getAttribute("new_usaeffort").getValue() == null) {
        Xrm.Page.getAttribute("new_usaeffort").setValue(0.00);
        Xrm.Page.getAttribute("new_usaeffort").setSubmitMode("always");
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

function SetMDLValue(context) {
    //If a single field contains 100% then MDL = No									
    //IF 100% is divided among multiple fields then Value is Yes									
    // This section changed from Effort to Revenue in the title -- ticket 99221
    var ObjMultipleDeliveryLocations = Xrm.Page.getAttribute("new_multipledeliverylocations");

    var BrazilEffort = Xrm.Page.getAttribute('new_brazileffort').getValue();
    var ChinaEffort = Xrm.Page.getAttribute('new_chinaeffort').getValue();
    var EuropeEffort = Xrm.Page.getAttribute('new_europeeffort').getValue();
    var MexicoEffort = Xrm.Page.getAttribute('new_mexicoeffort').getValue();
    var SSHEffort = Xrm.Page.getAttribute('new_ssheffort').getValue();
    var USAEffort = Xrm.Page.getAttribute('new_usaeffort').getValue();

    var TotalEffort = BrazilEffort + ChinaEffort + EuropeEffort + MexicoEffort + SSHEffort + USAEffort;

    if (TotalEffort != 100.00) {
        alert('The Sum of Market Distributed Revenue % should be 100.');
        context.getEventArgs().preventDefault();
        return false;
    } else {
        if (BrazilEffort == 100 || ChinaEffort == 100 || EuropeEffort == 100 || MexicoEffort == 100 || SSHEffort == 100 || USAEffort == 100) {
            ObjMultipleDeliveryLocations.setValue(false)
        } else {
            ObjMultipleDeliveryLocations.setValue(true)
        }

        ObjMultipleDeliveryLocations.setSubmitMode("always");
    }

    return true;
}

function setEstimatedEndDate() {
    var oProjectEndDate = Xrm.Page.getAttribute("new_estprojenddate");
    var dtProjectStartDate = new Date(Xrm.Page.getAttribute("new_estprojstartdate").getValue());
    var dtProjectEndDate = new Date(Xrm.Page.getAttribute("new_estprojstartdate").getValue());
    var intProjectDuration = Xrm.Page.getAttribute("new_estprojdurationquote").getValue();

    if (intProjectDuration != null && Xrm.Page.getAttribute("new_estprojstartdate").getValue() != null) {
        dtProjectEndDate.setMonth(dtProjectStartDate.getMonth() + intProjectDuration);
        dtProjectEndDate.setDate(dtProjectStartDate.getDate() - 1);
        oProjectEndDate.setValue(dtProjectEndDate);
        if (dtProjectEndDate.getFullYear() > dtProjectStartDate.getFullYear()) {
            Xrm.Page.getAttribute("new_multiyearopp").setValue(true);
        } else {
            Xrm.Page.getAttribute("new_multiyearopp").setValue(false);
        }
    } else {
        oProjectEndDate.setValue(null);
    }
    oProjectEndDate.setSubmitMode("always");
}

function estimatedvalue_onchange() {
    oppTypeFieldValidation();

    if (Xrm.Page.getAttribute("new_estprojdurationquote").getValue() != null) {
        var estimatedmonthlyrevenue = Xrm.Page.getAttribute("new_estrevenuequote").getValue() / Xrm.Page.getAttribute("new_estprojdurationquote").getValue();
        Xrm.Page.getAttribute("new_estimatedmonthlyrevenue").setValue(estimatedmonthlyrevenue);
    } else {
        Xrm.Page.getAttribute("new_estimatedmonthlyrevenue").setValue(null);
    }
    Xrm.Page.getAttribute("new_estimatedmonthlyrevenue").setSubmitMode("always");
    CalculateRevenue();
}

function new_estimatedprojectduration_onchange() {
    if (Xrm.Page.getAttribute("new_estprojdurationquote").getValue() != null) {
        var estimatedmonthlyrevenue = Xrm.Page.getAttribute("new_estrevenuequote").getValue() / Xrm.Page.getAttribute("new_estprojdurationquote").getValue();
        Xrm.Page.getAttribute("new_estimatedmonthlyrevenue").setValue(estimatedmonthlyrevenue);

        if (Xrm.Page.getAttribute("new_estprojdurationquote").getValue() > 12) {
            Xrm.Page.getAttribute("new_multiyearsale").setValue(true);
        } else {
            Xrm.Page.getAttribute("new_multiyearsale").setValue(false);
        }
    } else {
        Xrm.Page.getAttribute("new_estimatedmonthlyrevenue").setValue(null);
    }
    Xrm.Page.getAttribute("new_estimatedmonthlyrevenue").setSubmitMode("always");

    setEstimatedEndDate();
}

function new_estimatedprojectstartdate_onchange() {

    setEstimatedEndDate();
}

function CalculateRevenue() {
    var Discount = Xrm.Page.getAttribute("discountpercentage").getValue();
    var EstRevenue = Xrm.Page.getAttribute("new_estrevenuequote").getValue();
	var DiscountAmount = 0.00;
	if (EstRevenue != null) {
		if(Discount > 0 && Discount <= 100) 
			DiscountAmount = EstRevenue * Discount / 100;
		else 
			Xrm.Page.getAttribute("discountpercentage").setValue(null);
		Xrm.Page.getAttribute("discountamount").setValue(DiscountAmount);
		Xrm.Page.getAttribute("new_totalrevenuequote").setValue(EstRevenue - DiscountAmount);
		Xrm.Page.getAttribute("new_testtotalrevenuequote").setValue(EstRevenue - DiscountAmount);
	}
}

function getValue(obj) {
    if (obj != null || obj != undefined) {
        return obj.getValue();
    }
    return '';
}

function getNumber(obj) {
    if (obj != null || obj != undefined) {
        return obj.getValue().toString();
    }
    return '';
}

function getDate(obj) {
    if (obj != null || obj != undefined) {
        return obj.getValue().toCRMFormat();
    }
    return 0.00;
}

function UpdateOppDate() {
    var entityId = Xrm.Page.getAttribute("opportunityid").getValue()[0].id;
    var item = null;

    XrmServiceToolkit.Rest.RetrieveMultiple("OpportunitySet", "$filter= OpportunityId eq guid'" + entityId + "'", // "$select=*",//"$filter= SystemUserId eq guid'" + entityId + "'",
        function(results) {
            item = results;
        },
        // ReSharper disable once UnuentityIdsedParameter
        function(error) {},
        function onComplete() {},
        false);

    if (item.length > 0)
        if (item[0].StatusCode.Value != null && item[0].StatusCode.Value == 1) {
            // Update the  Opportunity est start date
            var opportunity = {};
            opportunity.New_EstimatedProjectStartDate = Xrm.Page.getAttribute("new_estprojstartdate").getValue();
            //.toCRMFormat();

            XrmServiceToolkit.Rest.Update(
                entityId, opportunity, "OpportunitySet",
                function() {},
                function(error) {
                    alert("Error = " + error);
                },
                false);
        }
}

function UpdateOpp() {
    var entityId = Xrm.Page.getAttribute("opportunityid").getValue()[0].id;
    var item = null;

    XrmServiceToolkit.Rest.RetrieveMultiple("OpportunitySet", "$filter= OpportunityId eq guid'" + entityId + "'", // "$select=*",//"$filter= SystemUserId eq guid'" + entityId + "'",
        function(results) {
            item = results;
        },
        // ReSharper disable once UnuentityIdsedParameter
        function(error) {},
        function onComplete() {},
        false);

    // If Opp is Open
	//if (Xrm.Page.getAttribute("statuscode").getValue() != null && Xrm.Page.getAttribute("statuscode").getValue() == 1) {
	 if (item[0].StateCode.Value != null && item[0].StateCode.Value == 0) {
        var entityName = "opportunity";
        var estFteEffort = Xrm.Page.getAttribute("new_estimatedftes").getValue();
        var estHrsEffort = Xrm.Page.getAttribute("new_quoteeffort").getValue();
        var opp = {};

        if (Xrm.Page.getAttribute("new_originlead").getValue() != null) opp.OriginatingLeadId = {
            Id: Xrm.Page.getAttribute("new_originlead").getValue()[0].id,
            LogicalName: "lead"
        };
        else opp.OriginatingLeadId = null;

        if (Xrm.Page.getAttribute("campaignid").getValue() != null) opp.CampaignId = {
            Id: Xrm.Page.getAttribute("campaignid").getValue()[0].id,
            LogicalName: "campaign"
        };
        else opp.CampaignId = null;

        opp.new_Systech = Xrm.Page.getAttribute("new_systech").getValue();
        opp.EstimatedValue = {
            Value: Xrm.Page.getAttribute("new_estrevenuequote").getValue().toString()
        };
        opp.New_estimatedprojectduration = Xrm.Page.getAttribute("new_estprojdurationquote").getValue();

        if (estHrsEffort != null) opp.New_PositionFteEffort = parseFloat(estHrsEffort).toFixed(2);
        else opp.New_PositionFteEffort = null;

        opp.New_EstimatedMonthlyRevenue = {
            Value: Xrm.Page.getAttribute("new_estimatedmonthlyrevenue").getValue().toString()
        };

        if (estFteEffort != null) opp.new_EstimatedFTEs = parseFloat(estFteEffort).toFixed(2);
        else opp.new_EstimatedFTEs = null;
		
        opp.New_EstimatedProjectStartDate = Xrm.Page.getAttribute("new_estprojstartdate").getValue().toCRMFormat();
        opp.New_EstimatedProjectEndDate = Xrm.Page.getAttribute("new_estprojenddate").getValue().toCRMFormat();

        if (Xrm.Page.getAttribute("new_gdcresponsible").getValue() != null) opp.new_GDCResponsibleOpp = {
            Value: Xrm.Page.getAttribute("new_gdcresponsible").getValue()
        };
        else opp.new_GDCResponsibleOpp = null;

        opp.new_MultiYearSale = Xrm.Page.getAttribute("new_multiyearsale").getValue();
        opp.new_MultiyearOpp = Xrm.Page.getAttribute("new_multiyearopp").getValue();

        opp.New_UnitedStateEffort = parseFloat(Xrm.Page.getAttribute("new_usaeffort").getValue()).toFixed(2);
        opp.new_MexicoEffort = parseFloat(Xrm.Page.getAttribute("new_mexicoeffort").getValue()).toFixed(2);
        opp.New_ChinaEffort = parseFloat(Xrm.Page.getAttribute("new_chinaeffort").getValue()).toFixed(2);
        opp.new_BrazilEffort = parseFloat(Xrm.Page.getAttribute("new_brazileffort").getValue()).toFixed(2);
        opp.New_EuropeEffort = parseFloat(Xrm.Page.getAttribute("new_europeeffort").getValue()).toFixed(2);
        opp.new_SSHEffort = parseFloat(Xrm.Page.getAttribute("new_ssheffort").getValue()).toFixed(2);

		if(Xrm.Page.getAttribute("new_documenturllink").getValue() != null)
			opp.new_DocumentURL = Xrm.Page.getAttribute("new_documenturllink").getValue();
		
        var entityId = Xrm.Page.getAttribute("opportunityid").getValue()[0].id.replace("{", "").replace("}", "");

        XrmServiceToolkit.Rest.Update(
            entityId, opp, "OpportunitySet",
            function() {},
            function(error) {
                alert("Error = " + error);
            },
            false);
    }
}
function oppTypeFieldValidation() {
    var optOppType = Xrm.Page.getAttribute("new_opportunitytypequote").getSelectedOption();
    var attEstRev = Xrm.Page.getAttribute("new_estrevenuequote");

    if (optOppType.value == "100000003") {
        attEstRev.setValue(Math.abs(attEstRev.getValue()) * -1);
    }
}


function slsApproved() {
	var slsStatus = Xrm.Page.getAttribute("new_statusappadm").getValue();
	if (slsStatus == 100000001) {
		var setUservalue = [];
		  setUservalue[0] = {};
		  setUservalue[0].id = XrmServiceToolkit.Soap.GetCurrentUserId().replace("{", "").replace("}", "");
		  setUservalue[0].entityType = 'systemuser'; 
		  setUservalue[0].name = Xrm.Page.context.getUserName();
		Xrm.Page.getAttribute("new_slsapprovalby").setValue(setUservalue)
		var userid = XrmServiceToolkit.Soap.GetCurrentUserId();
		Xrm.Page.getAttribute("new_slsapprovalon").setValue(new Date());
		Xrm.Page.getAttribute("new_slsapprovalby").setSubmitMode("always");
		Xrm.Page.getAttribute("new_slsapprovalon").setSubmitMode("always");
	}
}
	
function opApproved() {
	var opStatus = Xrm.Page.getAttribute("new_statusappcoo").getValue();
	if (opStatus == 100000001) {
		var setUservalue = [];
		  setUservalue[0] = {};
		  setUservalue[0].id = Xrm.Page.context.getUserId().replace("{", "").replace("}", "");
		  setUservalue[0].entityType = 'systemuser'; 
		  setUservalue[0].name = Xrm.Page.context.getUserName();
		Xrm.Page.getAttribute("new_opapprovalby").setValue(setUservalue)
		var userid = XrmServiceToolkit.Soap.GetCurrentUserId();
		Xrm.Page.getAttribute("new_opapprovalon").setValue(new Date());
		Xrm.Page.getAttribute("new_opapprovalby").setSubmitMode("always");
		Xrm.Page.getAttribute("new_opapprovalon").setSubmitMode("always");
		}
}

function finApproved() {
	var finStatus = Xrm.Page.getAttribute("new_statusappbrml").getValue();
	if (finStatus == 100000001) {
		var setUservalue = [];
		  setUservalue[0] = {};
		  setUservalue[0].id = Xrm.Page.context.getUserId().replace("{", "").replace("}", "");
		  setUservalue[0].entityType = 'systemuser'; 
		  setUservalue[0].name = Xrm.Page.context.getUserName();
		Xrm.Page.getAttribute("new_finapprovalby").setValue(setUservalue)
		var userid = XrmServiceToolkit.Soap.GetCurrentUserId();
		Xrm.Page.getAttribute("new_finapprovalon").setValue(new Date());
		Xrm.Page.getAttribute("new_finapprovalby").setSubmitMode("always");
		Xrm.Page.getAttribute("new_finapprovalon").setSubmitMode("always");
	}
}

function ApprovalValidations() {
	var status = Xrm.Page.getAttribute("statecode").getValue();
	var statusReason = Xrm.Page.getAttribute("statuscode").getValue();
	var salesApproverStatus = Xrm.Page.getAttribute("new_statusappadm").getValue();
	var operationsApproverStatus = Xrm.Page.getAttribute("new_statusappcoo").getValue();
	var financeApproveStatus = Xrm.Page.getAttribute("new_statusappbrml").getValue();
	var approvalLevel = Xrm.Page.getAttribute("new_approvellevel").getValue();
	// If the Quote Status == "Draft" and StatusReason == "In Progress"
	if (status == 0 && statusReason == 100000000) {
		// If Approval Level == 1, 2, 5 AND sales Approver status == Approved
		if ((approvalLevel == 100000000 || approvalLevel == 100000001 || approvalLevel == 100000004) && salesApproverStatus == 100000001) {
			switch(operationsApproverStatus) {
				case 100000001: // Approved
					switch(financeApproveStatus) {
						case 100000001: // approved:
							return 100000001; // approved
						break;
						case 100000002: // rejected:
							return 100000002; // rejected
						break;
						case 100000003: // cancelled:
							return 100000003; // cancelled
						break;
					}
				break;
				case 100000003: // Cancelled
					switch(financeApproveStatus) {
						case 100000000: // waiting for approval:
						case 100000001: //approved:
						case 100000002: // rejected:
						case 100000003: // cancelled:
							return 100000003; // cancelled
						break;
					}
				break;
				case 100000002: // Rejected
					switch(financeApproveStatus) {
						case 100000000: // waiting for approval:
						case 100000001: // approved:
						case 100000002: // rejected:
						case 100000003: // cancelled:
							return 100000002; // rejected
						break;
					}
				break;
				case 100000000: // Waiting for Approval
					switch(financeApproveStatus) {
						case 100000002: // rejected:
							return 100000002; // rejected
						break;
						case 100000003: // cancelled:	
							return 100000003; // cancelled
						break;
					}	
				break;
			}
		}
		// if Approval Level == 3 AND Sales Approver Status == (Acknowledged OR Not Required)
		if ((approvalLevel == 100000002 ) && (salesApproverStatus == 100000004 || salesApproverStatus == 100000005)) {
			switch(operationsApproverStatus) {
				case 100000001: // Approved
					switch(financeApproveStatus) {
						case 100000000: // waiting for approval:
							return 100000000; // waiting for approval
						break;
						case 100000001: // approved:
							return 100000001; // approved
						break;
						case 100000002: // rejected:
							return 100000002; // rejected
						break;
						case 100000003: // cancelled:
							return 100000003; // cancelled
						break;
					}
				break;
				case 100000003: // Cancelled
					switch(financeApproveStatus) {
						case 100000000: // waiting for approval:
						case 100000001: //approved:
						case 100000002: // rejected:
						case 100000003: // cancelled:
							return 100000003; // cancelled
						break;
					}
				break;
				case 100000002: // Rejected
					switch(financeApproveStatus) {
						case 100000000: // waiting for approval:
						case 100000001: // approved:
						case 100000002: // rejected:
						case 100000003: // cancelled:
							return 100000002; // rejected
						break;
					}
				break;
				case 100000000: // Waiting for Approval
					switch(financeApproveStatus) {
						case 100000000: // waiting for approval:
						case 100000001: // approved:
							return 100000000; // waiting for approval
						break;
						case 100000002: // rejected:
							return 100000002; // rejected
						break;
						case 100000003: // cancelled:	
							return 100000003; // cancelled
						break;
					}	
				break;
			}
		}
		// if Approval Level == 4 AND Operations Approver Status: == (Acknowledged OR Not Required)
		if ((approvalLevel == 100000003) && (operationsApproverStatus == 100000004 || operationsApproverStatus == 100000005)) {
			// if Finance Approver Status == (Acknowledged OR Not Required)
			if(financeApproveStatus == 100000004 || financeApproveStatus == 100000005) {
				switch(salesApproverStatus) {
					case 100000000: // waiting for approval:
						return 100000000; // waiting for approval
					break;
					case 100000001: // approved:
						return 100000001; // approved
					break;
					case 100000002: // rejected:
						return 100000002; // rejected
					break;
				}
			}
			// else if Finance Approver Status == Cancelled AND Sales Approver Status == Cancelled
			else if (financeApproveStatus == 100000003 && salesApproverStatus == 100000003)
				return 100000003; // Cancelled
		}
		return 0;
	}
	else
		return 0;
}