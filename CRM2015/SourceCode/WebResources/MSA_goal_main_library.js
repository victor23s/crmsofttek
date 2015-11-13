function Form_onload() {
    // Returns date in "m/d/yyyy" format.
    Date_FormatMDYYYY = function (dtDate) {
        var iMonth = dtDate.getMonth() + 1;
        var iDay = dtDate.getDate();
        var iYear = dtDate.getFullYear();

        return sMonth + "/" + sDay + "/" + sYear;
    }

    Date_AddDays = function (dtDate, iDays) {
        var iMilliseconds = iDays * 24 * 60 * 60 * 1000;
        return new Date(new Date().setTime(dtDate.getTime() + iMilliseconds));
    }

    // Regenerate and set Name base on Owner, Time Period and Start/End Dates.
    // Called in Owner, Time Period and Start Date OnChange events.
    Name_Regenerate = function () {
        // Returns date in "m/d/yyyy" format.
        Date_Format = function (dtDate) {
            var iMonth = dtDate.getMonth() + 1;
            var iDay = dtDate.getDate();
            var iYear = dtDate.getFullYear();

            return iMonth + "/" + iDay + "/" + iYear;
        }

        var aoOwnerNameLookup = Xrm.Page.getAttribute("ownerid").getValue();
        var sTimePeriodIndex = Xrm.Page.getAttribute("msa_timeperiod").getValue();
        var sStartDate = Xrm.Page.getAttribute("msa_startdate").getValue();

        if (aoOwnerNameLookup && sTimePeriodIndex && sStartDate) {
            var sOwnerName = aoOwnerNameLookup[0].name;
            var dtStartDate = new Date(sStartDate);
            var sTimePeriodDescription;
            switch (sTimePeriodIndex) {
            case "1":
                // Annually
            case "2":
                // Semiannually
            case "3":
                // Quarterly
            case "5":
                // 4-Week Period
                sTimePeriodDescription = Xrm.Page.getAttribute("msa_timeperiod").getSelectedOption().text;
                var dtEndDate = new Date(Xrm.Page.getAttribute("msa_enddate").getValue());
                sTimePeriodDescription += " [" + Date_Format(dtStartDate) + " - " + Date_Format(dtEndDate) + "]"
                break;
            case "4":
                // Monthly
                var asMonths = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
                sTimePeriodDescription = asMonths[dtStartDate.getMonth()];
                sTimePeriodDescription += " " + dtStartDate.getFullYear();
                break;
            default:
                // Should never happen, but...
                sTimePeriodDescription = "";
            }

            // Set the value of the Name field.
            var oName = Xrm.Page.getAttribute("msa_name");
            oName.Disabled = false;
            oName.setValue(sOwnerName + " - " + sTimePeriodDescription);
            oName.Disabled = true;
            oName.ForceSubmit = true;
        }
        else {
            // Either owner, time period, or start date isn't set yet.  Do nothing.
        }
    }

    // Ensures Start Dates are at the beginning of the Time Period.
    // Called in Time Period and Start Date OnChange events.
    __StartDate_Validating = false;
    StartDate_Validate = function () {
        if (!__StartDate_Validating) {
            __StartDate_Validating = true; // Avoid endless event loop.
            var oStartDate = Xrm.Page.getAttribute("msa_startdate");
            var sStartDate = oStartDate.getValue();
            if (sStartDate) {

                var dtCurrentStartDate = new Date(sStartDate);
                var dtNewStartDate = new Date(dtCurrentStartDate);
                var sTimePeriodIndex = Xrm.Page.getAttribute("msa_timeperiod").getValue();
                switch (sTimePeriodIndex) {
                case "1":
                    // Annually
                case "2":
                    // Semiannually
                case "3":
                    // Quarterly
                case "4":
                    // Monthly
                    // Allowing for annually, semiannually, and quarterly beginning in a non-standard
                    // month, but always enforcing that we start on the 1st of the month.
                    dtNewStartDate.setDate(1);
                    break;
                case "5":
                    // 4-Week Period:  Set to the prior Monday (if not already a Monday).
                    var iDay = dtNewStartDate.getDay();
                    var iDaysToSubtract = ((iDay > 0) ? iDay - 1 : 6);
                    dtNewStartDate = Date_AddDays(dtNewStartDate, -iDaysToSubtract);
                    break;
                default:
                    // Should never happen, but...
                    dtNewStartDate = null;
                }

                if (dtNewStartDate.getTime() != dtCurrentStartDate.getTime()) {
                    // Start Date needs adjustment.
                    oStartDate.setValue(dtNewStartDate);
                }

            } // if (sStartDate)
            __StartDate_Validating = false;
        }
    }

    // Recalculate and set End Date base on Time Period and Start Date.
    // Called in Time Period and Start Date OnChange events.
    EndDate_Recalculate = function () {
        // Warning:  This function is only guaranteed to work
        // when adding 1 to 12 months, which is all we need here
        // and why this helper function is scoped private.
        Date_AddMonths = function (dtDate, iMonths) {
            var dtNewDate = new Date(dtDate);
            var iCurrentMonth = dtDate.getMonth();
            if (iCurrentMonth + iMonths <= 11) {
                // Still in the current year.
                dtNewDate.setMonth(iCurrentMonth + iMonths);
            }
            else {
                // Rolling over into the next year.
                dtNewDate.setMonth(iCurrentMonth + iMonths - 12);
                dtNewDate.setFullYear(dtDate.getFullYear() + 1);
            }
            return dtNewDate;
        }

        // Calculate the end date.
        var dtEndDate;
        var sStartDate = Xrm.Page.getAttribute("msa_startdate").getValue();
        if (sStartDate) {
            var dtStartDate = new Date(sStartDate);
            var sTimePeriodIndex = Xrm.Page.getAttribute("msa_timeperiod").getValue();
            switch (sTimePeriodIndex) {
            case "1":
                // Annually
                dtEndDate = Date_AddMonths(dtStartDate, 12);
                dtEndDate = Date_AddDays(dtEndDate, -1);
                break;
            case "2":
                // Semiannually
                dtEndDate = Date_AddMonths(dtStartDate, 6);
                dtEndDate = Date_AddDays(dtEndDate, -1);
                break;
            case "3":
                // Quarterly
                dtEndDate = Date_AddMonths(dtStartDate, 3);
                dtEndDate = Date_AddDays(dtEndDate, -1);
                break;
            case "4":
                // Monthly
                dtEndDate = Date_AddMonths(dtStartDate, 1);
                dtEndDate = Date_AddDays(dtEndDate, -1);
                break;
            case "5":
                // 4-Week Period
                dtEndDate = Date_AddDays(dtStartDate, 27);
                break;
            default:
                // Should never happen, but...
                dtEndDate = null;
            }
        }
        else {
            dtEndDate = null;
        }

        // Set the value of the End Date field.
        var oEndDate = Xrm.Page.getAttribute("msa_enddate");
        oEndDate.Disabled = false;
        oEndDate.setValue(dtEndDate);
        oEndDate.Disabled = true;
        oEndDate.ForceSubmit = true;
    }

    Retrieve_Internal = function (sQueryExprInnerXML) {
        var sRequest = "<?xml version=\"1.0\" encoding=\"utf-8\"?> \n" + "<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\"" + " xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"" + " xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"> \n" + Xrm.Page.context.getAuthenticationHeader() + "\n" + "  <soap:Body> \n" + "    <RetrieveMultiple xmlns=\"http://schemas.microsoft.com/crm/2007/WebServices\"> \n" + "      <query xmlns:q1=\"http://schemas.microsoft.com/crm/2006/Query\" xsi:type=\"q1:QueryExpression\"> \n" + sQueryExprInnerXML + "\n" + "</query> \n" + "    </RetrieveMultiple> \n" + "  </soap:Body> \n" + "</soap:Envelope> \n";

        var oXMLHTTP = new ActiveXObject("Msxml2.XMLHTTP");
        oXMLHTTP.open("POST", "/mscrmservices/2007/crmservice.asmx", false);
        oXMLHTTP.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/crm/2007/WebServices/RetrieveMultiple");
        oXMLHTTP.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
        oXMLHTTP.setRequestHeader("Content-Length", sRequest.length);
        try {
            oXMLHTTP.send(sRequest);
            var oResponseXMLDocument = oXMLHTTP.responseXML;
            return oResponseXMLDocument;
        }
        catch(e) {
            alert("Error sending request to server: " + e.description);
            return null;
        }
    }

    RetrieveSingleValue_Internal = function (sQueryExprInnerXML, sValueAttribute) {
        var oResponseXMLDocument = Retrieve_Internal(sQueryExprInnerXML);

        try {
            var sXPathExpr = "//RetrieveMultipleResult/BusinessEntities/BusinessEntity/q1:" + sValueAttribute;
            var oValueXMLNode = oResponseXMLDocument.selectSingleNode(sXPathExpr);
            if (oValueXMLNode) {
                try {
                    return oValueXMLNode.text;
                }
                catch(e) {
                    alert("Error retrieving value of '" + sValueAttribute + "' from results XML: " + e.description);
                    return null;
                }
            }
            else {
                // Don't err out.  Assume value really isn't found, meaning it's null.
                //alert("Value for '" + sValueAttribute + "' not found in results XML.");
                return null;
            }
        }
        catch(e) {
            alert("Error retrieving '" + sValueAttribute + "' from results XML: " + e.description);
            return null;
        }
    }

    RetrieveSingleValueNoCriteria = function (sEntityName, sValueAttribute) {
        var sQueryExprInnerXML = "<q1:EntityName>" + sEntityName + "</q1:EntityName> \n" + "<q1:ColumnSet xsi:type=\"q1:ColumnSet\"> \n" + "  <q1:Attributes> \n" + "    <q1:Attribute>" + sValueAttribute + "</q1:Attribute> \n" + "  </q1:Attributes> \n" + "</q1:ColumnSet> \n" + "<q1:Distinct>false</q1:Distinct> \n" + "<q1:PageInfo> \n" + "  <q1:PageNumber>1</q1:PageNumber> \n" + "  <q1:Count>1</q1:Count> \n" + "</q1:PageInfo>";

        return RetrieveSingleValue_Internal(sQueryExprInnerXML, sValueAttribute);
    }

    // If we're creating, updating, quick-creating, or bulk-editing ...
    if (Xrm.Page.ui.getFormType() == 1 || Xrm.Page.ui.getFormType() == 2 || Xrm.Page.ui.getFormType() == 5 || Xrm.Page.ui.getFormType() == 6) {
        var oTimePeriod = Xrm.Page.getAttribute("msa_timeperiod");
        // ... Time Period is defined on the form ...
        if (oTimePeriod) {
            // ... and Time Period is not yet set.
            if (oTimePeriod.getValue() == null) {
                // Then from the organization's fiscal period
                // determine the corresponding Time Period Value.
                var sFiscalPeriodType = RetrieveSingleValueNoCriteria("organization", "fiscalperiodtype");
                var iTimePeriod;
                switch (sFiscalPeriodType) {
                case "2000":
                    // Annually
                    iTimePeriod = 1;
                    break;
                case "2001":
                    // Semiannually
                    iTimePeriod = 2;
                    break;
                case "2002":
                    // Quarterly
                    iTimePeriod = 3;
                    break;
                case "2003":
                    // Monthly
                    iTimePeriod = 4;
                    break;
                case "2004":
                    // 4-Week Period
                    iTimePeriod = 5;
                    break;
                case "0":
                    alert("You must first select fiscal year settings in\nSettings > Business Management > Fiscal Year Settings");
                    iTimePeriod = 0;
                    break;
                default:
                    alert("Invalid FiscalPeriodType: " + sFiscalPeriodType);
                    iTimePeriod = 0;
                }
                if (iTimePeriod > 0) {
                    // Set the value of the Time Period picklist
                    var bDisabled = oTimePeriod.Disabled;
                    if (bDisabled) {
                        oTimePeriod.Disabled = false;
                    }
                    oTimePeriod.setValue(iTimePeriod);
                    if (bDisabled) {
                        oTimePeriod.Disabled = true;
                        oTimePeriod.ForceSubmit = true;
                    }
                }
            }
        }
    }
}
function ownerid_onchange() {
    Name_Regenerate();
}
function msa_timeperiod_onchange() {
    StartDate_Validate();
    EndDate_Recalculate();
    Name_Regenerate();
}
function msa_startdate_onchange() {
    StartDate_Validate();
    EndDate_Recalculate();
    Name_Regenerate();
}