 /// <reference path="LinkedInConfig.js" />

(function ($) {

    // Entity-specific variables, are populated in the populateFormDataVariables function
    var Xrm, formType, entityType, entityId, objectType,

    // Enum for Form Types
    FormTypes = {
        CREATE: 1,
        UPDATE: 2,
        READONLY: 3,
        DISABLED: 4,
        QUICKCREATE: 5,
        BULKEDIT: 6
    };

    $.findInArray = function (array, property, element) {
        var args = [].slice.call(arguments, 0),
        element = args.pop();

        if (args.length === 2) {
            property = args.pop();
        } else {
            property = null;
        }

        array = args.pop();

        for (var i = 0; i < array.length; i++) {
            if (property && array[i][property] == element) {
                return array[i];
            }
            else if (array[i] == element) {
                return array[i];
            }
        }

        return null;
    }

    function scrubText(s) {
        return (s || "").replace(/'/g, "\'");
    }

    function populateFormDataVariables() {
        if (!Xrm) {
            alert("Unable to view Company Profile. This page must be viewed in the context of a Dynamics CRM form.");
            return;
        }

        formType = Xrm.Page.ui.getFormType();
        entityId = Xrm.Page.data.entity.getId();
        entityType = Xrm.Page.data.entity.getEntityName();
        objectType = entityType.charAt(0).toUpperCase() + entityType.slice(1);
    }

    function hideCompanyProfileTab() {
        Xrm.Page.ui.tabs.forEach(function (tab, tabIndex) {
            if (tab.getName() === "linkedincompanyprofile" || tab.getLabel() === "LinkedIn Company Profile") {
                tab.setVisible(false);
                return false;
            }
        });
    }

    function loadCompanyProfile() {
        if (!Xrm) {
            return;
        }

        if (formType !== FormTypes.UPDATE) {
            hideCompanyProfileTab();
        }
        else {
            switch (entityType) {
            case "account":
                getCompanyInfoFromAccount(entityId, loadLinkedInFrame);
                break;
            case "contact":
                getCompanyInfoFromContact(entityId, loadLinkedInFrame);
                break;
            case "lead":
                getCompanyInfoFromLead(entityId, loadLinkedInFrame);
                break;
            case "opportunity":
                getCompanyInfoFromOpportunity(entityId, loadLinkedInFrame);
                break;
            default:
                alert("The Company Profile is not supported on the " + entityType + " form.");
                break;
            }
        }
    }

    function getMemberTokensByLICompanyId(companyId, companyName, objectType, callback) {
        var fetchXml = ['<fetch version="1.0" output-format="xml-platform" mapping="logical">', '<entity name="contact">', '<attribute name="li_membertoken"/>', '<filter>', '<condition attribute="statecode" operator="eq" value="0"/>', '<condition attribute="li_companyid" operator="eq" value="', companyId, '" />', '<condition attribute="li_membertoken" operator="not-null"/>', '</filter>', '</entity>', '</fetch>'].join('');

        SP.OrgService.retrieveMultiple(SP.Fetch.htmlEncode(fetchXml), function (contacts) {
            var accountAndSubContactIds = [],
            contacts = contacts || [];

            var accountEntry = {
                companyId: companyId,
                memberTokens: []
            };
            accountAndSubContactIds.push(accountEntry);

            for (var i = 0; i < contacts.length; i++) {
                var contact = contacts[i];

                if (contact.li_membertoken && !accountEntry.memberTokens.contains(contact.li_membertoken)) {
                    accountEntry.memberTokens.push(contact.li_membertoken);
                }
            }

            callback(companyId, companyName, objectType, accountAndSubContactIds);
        },
        function (error) {
            alert("An error has occurred while retrieving the contact records:\n\n" + error.message);
        });
    }

    function getCompanyInfoFromAccount(accountId, callback, fallbackCoId) {
        var fetchXml = ['<fetch version="1.0" output-format="xml-platform" mapping="logical">', '<entity name="account">', '<attribute name="li_companyid"/>', '<attribute name="name"/>', '<filter type="and">', '<condition attribute="accountid" operator="eq" value="', accountId, '"/>', '</filter>', '</entity>', '</fetch>'].join('');

        SP.OrgService.retrieveMultiple(SP.Fetch.htmlEncode(fetchXml), function (accounts) {
            var memberTokens = [],
            accounts = accounts || [],
            liCompanyId = fallbackCoId || "",
            accountName = "",
            account = accounts[0];

            if (account) {
                liCompanyId = account.li_companyid || liCompanyId;
                accountName = account.name;

                if (liCompanyId) {

                    getMemberTokensByLICompanyId(account.li_companyid, accountName, objectType, function (p1, p2, p3,
                    /* First 3 params are irrelevant */
                    accountAndSubContactIds) {
                        callback(liCompanyId, accountName, objectType, accountAndSubContactIds);
                    });

                    if (account.li_companyid && SP.Guid.decapsulate(accountId).toLowerCase() !== SP.Guid.decapsulate(entityId).toLowerCase()) {
                        // If the company id was pulled from a different entity then the one we're currently on (parent company for example),
                        // the "associate" function will not be triggered by the LI iframe (since we're passing in a company id,
                        // so as far as the plugin knows, this record has already been associated).
                        // Therefore, we need to check if this record needs to be updated with the account.li_companyid value and if so, update it.

                        var fetchXml = ['<fetch mapping="logical" count="1"> ', '	<entity name="', entityType, '">', '		<filter>', '			<condition attribute="', entityType, 'id" operator="eq" value="', entityId, '" />', '           <condition attribute="li_companyid" operator="eq" value="', account.li_companyid, '" />', '        </filter>', '    </entity>', '</fetch>'].join("");

                        SP.OrgService.retrieveMultiple(SP.Fetch.htmlEncode(fetchXml), function (results) {
                            if (!results || results.length === 0) {
                                associate({
                                    companyId: account.li_companyid
                                });
                            }
                        });
                    }

                    // The callback parameter has already been called within the anonymous function passed into getMemberTokensByLICompanyId.
                    return;
                }
            }

            callback(liCompanyId, accountName, objectType, [{
                companyId: liCompanyId,
                memberTokens: memberTokens
            }]);
        },
        function (error) {
            alert("An error has occurred while retrieving the account records:\n\n" + error.message);
        });
    }

    function getCompanyInfoFromLead(leadId, callback) {
        SP.OrgService.retrieve("lead", leadId, ["li_companyid", "companyname"], function (lead) {
            getMemberTokensByLICompanyId(lead.li_companyid, lead.companyname, objectType, callback);
        },
        function (error) {
            alert("Unable to retrieve the value of the li_companyid field:\n\n" + error.message);
        });
    }

    function getCompanyInfoFromContact(contactId, callback, fallbackCoId) {
        SP.OrgService.retrieve("contact", contactId, ["li_companyid", "parentcustomerid"], function (contact) {
            fallbackCoId = contact.li_companyid || fallbackCoId;
            if (fallbackCoId) {
                getMemberTokensByLICompanyId(fallbackCoId, "", objectType, callback);
            }
            else if (contact.parentcustomerid) {
                switch (contact.parentcustomerid.LogicalName) {
                case "account":
                    getCompanyInfoFromAccount(contact.parentcustomerid.Id, callback, fallbackCoId);
                    break;
                case "contact":
                    getCompanyInfoFromContact(contact.parentcustomerid.Id, callback, fallbackCoId);
                    break;
                }
            }
            else {
                callback("", "", objectType, [{
                    companyId: "",
                    memberTokens: []
                }]);
            }
        },
        function (error) {
            alert("Unable to retrieve the value of the li_companyid field:\n\n" + error.message);
        });
    }

    function getCompanyInfoFromOpportunity(opportunityId, callback) {
        SP.OrgService.retrieve("opportunity", opportunityId, ["li_companyid", "customerid"], function (opportunity) {
            if (opportunity.li_companyid) {
                getMemberTokensByLICompanyId(opportunity.li_companyid, "", objectType, callback);
            }
            else if (opportunity.customerid) {
                switch (opportunity.customerid.LogicalName) {
                case "account":
                    getCompanyInfoFromAccount(opportunity.customerid.Id, callback, opportunity.li_companyid);
                    break;
                case "contact":
                    getCompanyInfoFromContact(opportunity.customerid.Id, callback, opportunity.li_companyid);
                    break;
                }
            }
            else {
                callback("", "", objectType, [{
                    companyId: "",
                    memberTokens: []
                }]);
            }
        },
        function (error) {
            alert("Unable to retrieve the value of the li_companyid field:\n\n" + error.message);
        });
    }

    function loadLinkedInFrame(companyId, companyName, objectType, linkedInIds) {
        companyId = companyId || "";
        companyName = scrubText(companyName);

        var paramScript = document.createElement("script");
        paramScript.setAttribute("type", LinkedInConfig.parameterScriptType);
        paramScript.setAttribute("data-crm", "dynamics");
        paramScript.setAttribute("data-app-name", "company");
        paramScript.setAttribute("data-company-id", companyId);
        paramScript.setAttribute("data-company-name", companyName);
        paramScript.setAttribute("data-object-type", objectType);

        var dataCompanies = "";
        if (linkedInIds) {
            dataCompanies = JSON.stringify(linkedInIds);
        }

        paramScript.setAttribute("data-companies", dataCompanies);

        document.body.appendChild(paramScript);

        var mainScript = document.createElement("script");
        mainScript.setAttribute("defer", "defer");
        mainScript.setAttribute("type", "text/javascript");
        mainScript.setAttribute("src", LinkedInConfig.mainScriptSource);
        mainScript.text = LinkedInConfig.mainScriptBody;

        document.body.appendChild(mainScript);
    }

    Array.prototype.contains = function (element) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == element) return true;
        }
        return false;
    }

    function associate(companyInfo) {
        SP.OrgService.update(entityType, entityId, {
            "li_companyid": companyInfo.companyId
        },
        function () {
            // Success.  Refresh the page so that when it loads again, the data-companies attribute can be populated.
            // (We can't send the data-companies info to the iframe if we don't know the linkedin id.)
            location.reload();
        },
        function (error) {
            alert("Unable to save the LinkedIn id '" + companyId + "' to this record.:\n\n" + error.message);
        });
    }

    function disassociate() {
        var entity = {
            "li_companyid": new SP.OrgService.NullValue()
        };

        SP.OrgService.update(entityType, entityId, entity, null, function (error) {
            alert("Unable to clear the LinkedIn Company Id value of this record.:\n\n" + error.message);
        });
    }

    $(function () {
        LinkedInConfig.loadSettings();
        Xrm = Xrm || window.parent.Xrm;

        if (LinkedInConfig.isOffline) {
            hideCompanyProfileTab();
            return;
        }

        if (LinkedInConfig.isIE7 && !LinkedInConfig.supportsFlash) {

            $(document.body).css("margin", "0").children().remove();

            $("<iframe></iframe>").attr("src", "NoSupport.html").attr("id", "no-support").attr("frameborder", "0").appendTo(document.body);
        }
        else {
            LinkedInConfig.callbackContainer.associate = associate;
            LinkedInConfig.callbackContainer.disassociate = disassociate;

            populateFormDataVariables();
            loadCompanyProfile();
        }
    });

})(jQuery);