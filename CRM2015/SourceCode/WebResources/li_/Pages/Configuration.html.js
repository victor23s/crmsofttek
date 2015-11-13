 /// <reference path="../Scripts/Libraries/jquery.js" />
/// <reference path="../Scripts/Libraries/SP.Core.js" />
/// <reference path="../Scripts/Libraries/SP.OrgService.js" />

(function ($) {
    //storing the configId for multiple saves.
    var configId = null;


    function attachEvents() {
        $('#saveButton').click(function () {
            saveConfigInfo();
        });
    }

    function isOnline() {
        return Xrm.Page.context.getClientUrl().indexOf(".dynamics.com") > 0;
    }

    function saveConfigInfo() {
        if (isValidToSave()) {
            var crmConfig = {
                'li_secretkey': $('#secretKey').val(),
                'li_apikey': $('#apiKey').val()
            };

            if (configId == null) {
                SP.OrgService.create('li_configuration', crmConfig, function (id) {
                    configId = id;
                    postSave(false);
                },
                function (error) {
                    alert("An error has occurred while creating the existing configuration record:\n\n" + error.message);
                    postSave(true);
                });
            }
            else {
                SP.OrgService.update('li_configuration', configId, crmConfig, function () {
                    postSave(false);
                },
                function (error) {
                    if (error.message != null && error.message.indexOf('LinkedIn.Crm.Plugins.ValidateLinkedInAutKeysPlugin' > -1)) {
                        // This means the validation errored
                        SP.Log.log(error.message);
                        alert("The API Key and Secret Key entered are not valid. Please check the key and try again.");
                    }
                    else {
                        alert("An error has occurred while updating the existing configuration record:\n\n" + error.message);
                    }

                    postSave(true);
                });
            }
        }
    }

    function preSave() {

        $(".xrm-dialog-formBody").hide();
        $('#saveButton').attr('disabled', true);
        $(".xrm-dialog-formLoading").show();

    }

    function postSave(isError) {
        if (!isError) {
            alert('Configuration successfully saved.');
        }

        $(".xrm-dialog-formBody").show();
        $('#saveButton').attr('disabled', false);
        $(".xrm-dialog-formLoading").hide();

    }

    function validateKeys() {
        // Validating the keys is done in a plugin.
        // Just keeping this in case it gets moved.
        preSave();
        return true;
    }

    function isValidToSave() {
        var alertText = [];
        if (!$('#secretKey').val()) alertText.push("secret key");
        if (!$('#apiKey').val()) alertText.push("api key");

        if (alertText.length > 0) {
            alert("Please enter the " + alertText.join(' and '));
            return false;
        }
        else {
            return validateKeys();
        }
    }

    function retrieveConfigInfo() {
        var fetchXml = ['<fetch version="1.0" count="1" page="1" output-format="xml-platform" mapping="logical">', '<entity name="li_configuration">', '<attribute name="li_configurationid"/>', '<attribute name="li_secretkey" />', '<attribute name="li_apikey" />', '<filter>', '<condition attribute="statecode" operator="eq" value="0"/>', '</filter>', '</entity>', '</fetch>'].join('');

        SP.OrgService.retrieveMultiple(SP.Fetch.htmlEncode(fetchXml), function (records) {
            if (records != null && records.length > 0) {
                $('#secretKey').val(records[0].li_secretkey);
                $('#apiKey').val(records[0].li_apikey);
                configId = records[0].li_configurationid.Value;
            }

        },
        function (error) {
            alert("An error has occurred while retrieving the existing configuration record:\n\n" + error.message);
        });
    }
    function showOnlineMessage() {
        $(document.body).css("margin", "0").children().remove();
        $(document.body).height("100%");
        $(document.body).width("100%");
        $("<iframe></iframe>").attr("src", "NoConfiguration.html").attr("id", "no-support").attr("frameborder", "0").height("100%").width("100%").appendTo(document.body);

    }

    $(function () {
        if (!isOnline()) {

            attachEvents();
            retrieveConfigInfo();
            $(".xrm-dialog-formLoading").hide();
        }
        else {
            showOnlineMessage();
        }
    });
})(jQuery);