/// <reference path="DynamicForm.js" />
/// <reference path="XrmServiceToolkit.js" />

function Form_onload()
{
    if (Xrm.Page.getAttribute("customerid").getValue() == null) 
    {
        alert("Case cannot be created without a valid Account. Please create it from a Lead, Opportunity or an Account, so that the Account field is populated automatically.");
        Xrm.Page.ui.close();
    }
	
    /*Deprecate Case Type Values = SE-Solution/Proposal Presentation, TS-Solution/Proposal Presentation, AD-Billable Service
      AD-Bill T&L or Other cost, SE-Offering Presentation, SE-Internal Monitoring/Training, SE-RFI reponse
      SE-Create /Update Material, SE-RFQ Response, Se-Technical Assessment//Due Diligence, TS-RFP rresponse
      AD-customer Credit Validation, LS-Non Disclosure/Confidentiality Agreement Support, LS-Legal Q&A Support, LS-Contract Support, LS-Amendment Support*/

    Xrm.Page.Cascades.Deprecate("new_casetypecase", ["100000002", "100000009", "100000016", "100000017",
        "100000000", "100000001", "100000003", "100000004", "100000006", "100000008", "100000007", "100000011", "100000011",
        "100000012", "100000013", "100000014", "100000015"
    ]);
    Xrm.Page.Cascades.Filter("new_casetypecase");
	
    /*Deprecate StatusReason Option = Waiting for Signature */

    //Xrm.Page.getControl("statuscode").removeOption(100000011);
    //Xrm.Page.Cascades.Filter("statuscode");

    DisableSigner();
    CheckTeamMember();
    StatusReason_onchange();
}

function DisableSigner() 
{
   Xrm.Page.getAttribute("new_usertosign").setRequiredLevel("none");
   Xrm.Page.getAttribute("new_signersteam").setRequiredLevel("none");
   Xrm.Page.getControl("new_usertosign").setVisible(false);
   Xrm.Page.getControl("new_signersteam").setVisible(false);
}

function CheckTeamMember() 
{
    var userid = XrmServiceToolkit.Soap.GetCurrentUserId();

    Xrm.Page.getControl("new_qualificatorname").setDisabled(true);
    Xrm.Page.getControl("new_qualificationscore").setDisabled(true);
    Xrm.Page.getControl("new_proposalqualityscore").setDisabled(true);

    //Validate if User belongs to Assigned Team and Enable Qualification Fields if true 

    if (Xrm.Page.getAttribute("new_assignedteam").getValue() != null) 
	{
        var team = Xrm.Page.getAttribute("new_assignedteam").getValue()[0].id;
        var _userTeam = null;
        XrmServiceToolkit.Rest.RetrieveMultiple("TeamMembershipSet", "$filter = TeamId eq guid'" + team + "'", function(results) 
		{
            _userTeam = results;
        },
        // ReSharper disable once UnusedParameter
        function(error) {},
        function onComplete() {},
        false);

        for (var i = 0; i < _userTeam.length; i++) 
		{
            if (_userTeam[i]["SystemUserId"] == userid) 
            {
                Xrm.Page.getControl("new_qualificatorname").setDisabled(false);
                Xrm.Page.getControl("new_qualificationscore").setDisabled(false);
                Xrm.Page.getControl("new_proposalqualityscore").setDisabled(false);
            }
        }
    }
}

function StatusReason_onchange() 
{
    var today = new Date();
    var ValStatusReason = Xrm.Page.getAttribute("statuscode").getValue();
    var objDueDate = Xrm.Page.getControl("new_duedatecase");
    var objEstStartDate = Xrm.Page.getAttribute("new_eststartdate");
    var objEstEndDate = Xrm.Page.getAttribute("new_estenddate");
    var objEstEffort = Xrm.Page.getAttribute("new_esteffort");
    var objActStartDate = Xrm.Page.getAttribute("new_actstartdate");
    var objActEndDate = Xrm.Page.getAttribute("new_actenddate");
    var objActEffort = Xrm.Page.getAttribute("new_acteffort");

    DisableSigner();
	
    objEstStartDate.setRequiredLevel("none");
    objEstEndDate.setRequiredLevel("none");
    objEstEffort.setRequiredLevel("none");
    objActEffort.setRequiredLevel("none");
    Xrm.Page.getControl("new_duedatecase").setDisabled(false);
    Xrm.Page.getControl("new_assignedto").setDisabled(false);
    Xrm.Page.getAttribute("new_assignedto").setRequiredLevel("none");
    Xrm.Page.getControl("new_rejectedreasoncases").setDisabled(true);        
    Xrm.Page.getAttribute("new_rejectedreasoncases").setRequiredLevel("none");
    
    if (ValStatusReason != null) 
    {
        //If ValStatusReason != New make AssignedTo Required
	if (ValStatusReason != 200000)
	{
            Xrm.Page.getAttribute("new_assignedto").setRequiredLevel("required");
	}
	   
        // ValStatusReason = 100000007 - Reviewing OR ValStatusReason = 1 - In Progress OR ValStatusReason = 4 - Completed OR 
	// ValStatusReason = 100000006 - Reworking
        
        if (ValStatusReason == 100000007 || ValStatusReason == 1 || ValStatusReason == 4 || ValStatusReason == 100000006) 
	{
            // Make Estimates Required or Disabled		
            if (objEstStartDate.getValue() == null && objEstEndDate.getValue() == null && objEstEffort.getValue() == null)
            {
                objEstStartDate.setRequiredLevel("required");
                objEstEndDate.setRequiredLevel("required");
                objEstEffort.setRequiredLevel("required");
            }
            else
            {
                Xrm.Page.getControl("new_eststartdate").setDisabled(true);
                Xrm.Page.getControl("new_estenddate").setDisabled(true);
                Xrm.Page.getControl("new_esteffort").setDisabled(true);            
            }
			
            // Update Actual Start Date
            if (objActStartDate.getValue() == null)
            {
                objActStartDate.setValue(today);
                objActStartDate.setSubmitMode("always");
            }
			
            //Update Acutal End Date and Set Act Effort Required if ValStatusReason = Completed OR Reworking
            if (ValStatusReason == 4 || ValStatusReason == 100000006) 
            {
                objActEndDate.setValue(today);
                objActEndDate.setSubmitMode("always");
                objActEffort.setRequiredLevel("required");
            }
			
            objDueDate.setDisabled(true);
        } 
       
        // IF ValStatusReason = Rejected 
        
        if (ValStatusReason == 100000008) 
        {
            var AssignedToUser = Xrm.Page.getAttribute("new_assignedto").getValue();
			
            // Validate if AssignedTo is not empty (so the Notification can be submitted)
            if (AssignedToUser != null)
            {
	         // Make Rejection Reason Editable and Required
                Xrm.Page.getControl("new_rejectedreasoncases").setDisabled(false);
                Xrm.Page.getAttribute("new_rejectedreasoncases").setRequiredLevel("required");
                Xrm.Page.getAttribute("new_rejectedreasoncases").setSubmitMode("always");                        
               
                // Make Estimates Editable or Read Only
                if (objEstStartDate.getValue() == null && objEstEndDate.getValue() == null && objEstEffort.getValue() == null)
                {
                    Xrm.Page.getControl("new_eststartdate").setDisabled(false);
                    Xrm.Page.getControl("new_estenddate").setDisabled(false);
                    Xrm.Page.getControl("new_esteffort").setDisabled(false);            
                }
                else
                {
                    Xrm.Page.getControl("new_eststartdate").setDisabled(true);
                    Xrm.Page.getControl("new_estenddate").setDisabled(true);
                    Xrm.Page.getControl("new_esteffort").setDisabled(true);            
                }
               
                // Update Act Start Date if not empty
                if (objActStartDate.getValue() == null)
                {
                    objActStartDate.setValue(today);
                    objActStartDate.setSubmitMode("always");
                }

                // Update Act End Date and make Act Effort Required
                objActEndDate.setValue(today);
                objActEndDate.setSubmitMode("always");
                objActEffort.setRequiredLevel("required");				
            }
            else 
            {
                alert("Please make sure that this Request is Assigned, before trying to Reject it");
            }			           
        }   

        // ValStatusReason = 2 - On Hold OR ValStatusReason = 3 - Waiting for Details OR ValStatusReason = 100000011 - Waiting for Signature
		
        if (ValStatusReason == 2 || ValStatusReason == 3 || ValStatusReason == 100000011) 
	    {
            objDueDate.setDisabled(false);
            
            // Make Est Start Date Editable or Read Only
            if (objEstStartDate.getValue() == null)
            {
                Xrm.Page.getControl("new_eststartdate").setDisabled(false);
            }
            else
            {
                Xrm.Page.getControl("new_eststartdate").setDisabled(true);
            }
 
            // Make Est End Date and Effort Editable or Required
            if (objEstEndDate.getValue() == null && objEstEffort.getValue() == null)
            {
                Xrm.Page.getControl("new_estenddate").setDisabled(false);
                Xrm.Page.getControl("new_esteffort").setDisabled(false);            
            }
            else
            {
                Xrm.Page.getControl("new_estenddate").setDisabled(false);
                Xrm.Page.getControl("new_esteffort").setDisabled(false);            
                objEstEndDate.setRequiredLevel("required");
                objEstEffort.setRequiredLevel("required");                  
            }
               
            objActEffort.setRequiredLevel("none");				
        }
    } 
}

function Form_onsave() 
{
    var AssignedToUser = Xrm.Page.getAttribute("new_assignedto").getValue();
    var SurveyURL = Xrm.Page.getAttribute("new_surveyurl").getValue();
	
    if (AssignedToUser != null) 
    {
        setURL();
    } 	
	
    FTRCounter_OnSave(AssignedToUser);
}

function setURL() 
{
    var entityObjectId = Xrm.Page.data.entity.getId();
    var dialogID = "{A466548E-31DD-4B9E-882B-DE084F07DA12}";
    var serverUrl = Xrm.Page.context.getClientUrl();

    if (serverUrl.match(/\/$/)) 
    {
        serverUrl = serverUrl.substring(0, serverUrl.length - 1);
    }

    var url = serverUrl + "/cs/dialog/rundialog.aspx?DialogId=" + dialogID + "&EntityName=incident&ObjectId=" + entityObjectId;    

    Xrm.Page.getAttribute("new_surveyurl").setValue(url);    
    Xrm.Page.getAttribute("new_surveyurl").setSubmitMode("always");
}

function FTRCounter_OnSave(AssignedToUser) 
{
    var userid = XrmServiceToolkit.Soap.GetCurrentUserId();

    if (AssignedToUser != null) 
    {
        var ValOwnerId = Xrm.Page.getAttribute("ownerid").getValue()[0].id;
        var ValStatusReason = Xrm.Page.getAttribute("statuscode").getValue();
		
	//Increase the FTR Counter in 1 if who is Rejecting is the Owner
        if (ValOwnerId.replace("{", "").replace("}", "") == userid.toUpperCase() && ValStatusReason == 100000008) 
	{
            var counter = Xrm.Page.getAttribute("new_ftrcountercases").getValue();
			
            if (counter != null) 
            {
                Xrm.Page.getAttribute("new_ftrcountercases").setValue(counter + 1);
            }
            else 
            {
                Xrm.Page.getAttribute("new_ftrcountercases").setValue(1);
            }
            
           Xrm.Page.getAttribute("new_ftrcountercases").setSubmitMode("always");
        }
    }
}

function EstEndDate_onchange() 
{
    var objDueDate = new Date();
    var objEstDate = new Date();

    objDueDate = Xrm.Page.getAttribute("new_duedatecase").getValue();
    objEstDate = Xrm.Page.getAttribute("new_estenddate").getValue();

    if (objEstDate > objDueDate) 
    {
        alert("The Estimated End Date is greater than the Due Date. \n\nWould you like to continue?");
    }
}

function validateDates_onchange(formContext) 
{
	var estStartDate = new Date();
        var estEndDate = new Date();
    
	estStartDate = Xrm.Page.getAttribute("new_eststartdate").getValue();
        estEndDate = Xrm.Page.getAttribute("new_estenddate").getValue();
	
	if (estStartDate > estEndDate) 
	{
            alert("The Estimated Start Date is greater than the End Date. Please verify.");
		
            var control = Xrm.Page.ui.controls.get("new_eststartdate");
		
            if (typeof(formContext) != 'undefined') 
	    {	
                formContext.getEventArgs().preventDefault(); 
                return false;
            }

	    control.setFocus();	
       }
}

