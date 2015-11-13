 /// <reference path="LinkedInConfig.js" />

(function ($) {

    // Entity-specific variables, are populated in the populateFormDataVariables function
    var Xrm, formType, entityType, entityId, objectType, entityName,

    // Enum for Form Types
    FormTypes = {
        CREATE: 1,
        UPDATE: 2,
        READONLY: 3,
        DISABLED: 4,
        QUICKCREATE: 5,
        BULKEDIT: 6
    },

    // Enum for LinkedIn Action Types
    LIActionTypes = {
        Message: 157550000,
        InMail: 157550001,
        Invite: 157550002,
        IntroRequest: 157550003
    };

    function scrubText(s) {
        return (s || "").replace(/'/g, "\'");
    }

    function populateFormDataVariables() {
        if (!Xrm) {
            alert("Unable to view Member Profile.  This page must be viewed in the context of a Dynamics CRM form.");
            return;
        }

        formType = Xrm.Page.ui.getFormType();
        entityId = Xrm.Page.data.entity.getId();
        entityType = Xrm.Page.data.entity.getEntityName();
        objectType = entityType.charAt(0).toUpperCase() + entityType.slice(1);

        switch (entityType) {
        case "contact":
            case "lead":
            var firstNameField = Xrm.Page.getAttribute("firstname"),
            lastNameField = Xrm.Page.getAttribute("lastname"),
            fullNameField = Xrm.Page.getAttribute("fullname"),
            name = "";

            if (firstNameField) {
                name = firstNameField.getValue() + " ";
            }
            if (lastNameField) {
                name += lastNameField.getValue();
            }
            if (!name && fullNameField) {
                name = fullNameField.getValue();
            }

            entityName = name;
            break;
        case "opportunity":
            var nameField = Xrm.Page.getAttribute("name"),
            name = "";

            if (nameField) {
                name = nameField.getValue();
            }

            entityName = name;
            break;
        }
    }

    function hideMemberProfileTab() {
        Xrm.Page.ui.tabs.forEach(function (tab, tabIndex) {
            if (tab.getName() === "linkedinmemberprofile" || tab.getLabel() === "LinkedIn Member Profile") {
                tab.setVisible(false);
                return false;
            }
        });
    }

    function loadMemberProfile() {
        if (!Xrm) {
            return;
        }

        if (formType !== FormTypes.UPDATE) {
            hideMemberProfileTab();
        }
        else {
            switch (entityType) {
            case "contact":
                getMemberInfoFromContact(entityId, loadLinkedInFrame);
                break;
            case "lead":
                getMemberInfoFromLead(entityId, loadLinkedInFrame);
                break;
            case "opportunity":
                getMemberInfoFromOpportunity(entityId, loadLinkedInFrame);
                break;
            default:
                alert("The Member Profile is not supported on the " + entityType + " form.");
                break;
            }
        }
    }

    function getMemberInfoFromAccount(accountId, callback, memberToken) {
        SP.OrgService.retrieve("account", accountId, ["emailaddress1", "name"], function (account) {
            callback(memberToken, "", "", account.emailaddress1, account.name);
        },
        function (error) {
            alert("Unable to retrieve the value of the li_companyid field:\n\n" + error.message);
        });
    }

    function getMemberInfoFromContact(contactId, callback, fallbackMemberTok) {
        SP.OrgService.retrieve("contact", contactId, ["li_membertoken", "firstname", "lastname", "emailaddress1", "parentcustomerid"], function (contact) {
            var memberToken = contact.li_membertoken || fallbackMemberTok;

            var companyName = "";
            if (contact.parentcustomerid && contact.parentcustomerid.LogicalName === "account") {
                companyName = contact.parentcustomerid.Name;
            }

            callback(memberToken, contact.firstname, contact.lastname, contact.emailaddress1, companyName);
        },
        function (error) {
            alert("Unable to retrieve the value of the li_membertoken field:\n\n" + error.message);
        });
    }

    function getMemberInfoFromLead(leadId, callback) {
        SP.OrgService.retrieve("lead", leadId, ["li_membertoken", "firstname", "lastname", "emailaddress1", "companyname"], function (lead) {
            callback(lead.li_membertoken, lead.firstname, lead.lastname, lead.emailaddress1, lead.companyname);
        },
        function (error) {
            alert("Unable to retrieve the value of the li_membertoken field:\n\n" + error.message);
        });
    }

    function getMemberInfoFromOpportunity(opportunityId, callback) {
        SP.OrgService.retrieve("opportunity", opportunityId, ["li_membertoken", "customerid"], function (opportunity) {
            if (opportunity.li_membertoken) {
                callback(opportunity.li_membertoken, "", "", "", "");
            }
            else if (opportunity.customerid) {
                switch (opportunity.customerid.LogicalName) {
                case "account":
                    getMemberInfoFromAccount(opportunity.customerid.Id, callback, opportunity.li_membertoken);
                    break;
                case "contact":
                    getMemberInfoFromContact(opportunity.customerid.Id, callback, opportunity.li_membertoken);
                    break;
                }
            }
            else {
                callback("", "", "", "", "");
            }
        },
        function (error) {
            alert("Unable to retrieve the value of the li_companyid field:\n\n" + error.message);
        });
    }

    function loadLinkedInFrame(memberToken, firstName, lastName, email, companyName) {
        memberToken = memberToken || "";
        firstName = scrubText(firstName);
        lastName = scrubText(lastName);
        email = scrubText(email);
        companyName = scrubText(companyName);

        var paramScript = document.createElement("script");
        paramScript.setAttribute("type", LinkedInConfig.parameterScriptType);
        paramScript.setAttribute("data-crm", "dynamics");
        paramScript.setAttribute("data-app-name", "member");
        paramScript.setAttribute("data-member-token", memberToken);
        paramScript.setAttribute("data-first-name", firstName);
        paramScript.setAttribute("data-last-name", lastName);
        paramScript.setAttribute("data-email", email);
        paramScript.setAttribute("data-company-name", companyName);
        paramScript.setAttribute("data-object-type", objectType);

        document.body.appendChild(paramScript);

        var mainScript = document.createElement("script");
        mainScript.setAttribute("defer", "defer");
        mainScript.setAttribute("type", "text/javascript");
        mainScript.setAttribute("src", LinkedInConfig.mainScriptSource);
        mainScript.text = LinkedInConfig.mainScriptBody;

        document.body.appendChild(mainScript);
    }

    function associate(companyInfo) {
        SP.OrgService.update(entityType, entityId, {
            "li_membertoken": companyInfo.memberToken
        },
        null, function (error) {
            alert("Unable to save the LinkedIn id '" + companyId + "' to this record.:\n\n" + error.message);
        });
    }

    function disassociate() {
        var entity = {
            "li_membertoken": new SP.OrgService.NullValue()
        };

        SP.OrgService.update(entityType, entityId, entity, null, function (error) {
            alert("Unable to clear the LinkedIn Member Token value of this record.:\n\n" + error.message);
        });
    }

    //    function createActivity(activityInfo) {
    //        var now = new SP.OrgService.DateTime(new Date());

    //        var activityTypeValue;
    //        var activityTypeName;
    //        switch (activityInfo.updateType) {
    //            case "message":
    //                activityTypeValue = LIActionTypes.Message;
    //                activityTypeName = "Message";
    //                break;
    //            case "inmail":
    //                activityTypeValue = LIActionTypes.InMail;
    //                activityTypeName = "InMail";
    //                break;
    //            case "invite":
    //                activityTypeValue = LIActionTypes.Invite;
    //                activityTypeName = "Invite";
    //                break;
    //            case "intro":
    //                activityTypeValue = LIActionTypes.IntroRequest;
    //                activityTypeName = "Intro Request";
    //                break;
    //        }

    //        var activity = {
    //            "li_type": new SP.OrgService.OptionSetValue(activityTypeValue, activityTypeName),
    //            "scheduledend": now,
    //            "scheduledstart": now,
    //            "regardingobjectid": new SP.OrgService.EntityReference(entityId, entityType, entityName),
    //            "subject": activityInfo.subject,
    //            "description": activityInfo.content
    //        }

    //        SP.OrgService.create("li_linkedinaction", activity,
    //            function () {
    //                alert(activity.subject);
    //            },
    //            function (error) {
    //                alert("Unable to create the LinkedIn Action.:\n\n" + error.message);
    //            });
    //    }

    $(function () {
        // Load the configuration settings, specified in LinkedInConfig.js
        LinkedInConfig.loadSettings();
        Xrm = Xrm || window.parent.Xrm;

        if (LinkedInConfig.isOffline) {
            hideMemberProfileTab();
            return;
        }

        if (LinkedInConfig.isIE7 && !LinkedInConfig.supportsFlash) {

            $(document.body).css("margin", "0").children().remove();

            $("<iframe></iframe>").attr("src", "NoSupport.html").attr("id", "no-support").attr("frameborder", "0").appendTo(document.body);
        }
        else {
            LinkedInConfig.callbackContainer.associate = associate;
            LinkedInConfig.callbackContainer.disassociate = disassociate;
            //LinkedInConfig.callbackContainer.activity = createActivity;

            populateFormDataVariables();
            loadMemberProfile();
        }
    });

})(jQuery);