var LinkedInConfig = window.LinkedInConfig || (function () {

    var onPremApiKey; //ncokbz2lwpr2
    var onLineApiKey = "I81xSnqMsku2TP7blN_mAABnwRHGzz8-ALLyS0S6fNny_y-fVgaPmCoZQgtuCOcu";

    var mainScriptSource = "https://platform.linkedin.com/in.js";
    var maxActivityRecords = 1000;

    // SFDC-specific values
    var scriptParamPrefix = "sf";
    var callbackContainer = (window.SFDC = {});
    var parameterScriptType = "IN/SFDC";
    var extensionsParamValue = "SFDC@https://www.linkedin.com/scds/common/u/js/extensions/sfdc.js";

    var Xrm = window.Xrm || window.parent.Xrm || window.top.Xrm;

    function isOffline() {
       //return !Xrm.Page.context.isOutlookOnline();
        var status = Xrm.Page.context.client.getClientState();
        if (status == 'Online')
            return false;
        else
            return true;    
}

    function isIE7() {
        return jQuery.browser.version.indexOf("7") === 0;
    }

    function supportsFlash() {
        return jQuery.browser.flash;
    }

    function getApiKey() {
        var isCRMOnline = Xrm.Page.context.getClientUrl().indexOf(".dynamics.com") > 0;
        if (isCRMOnline) return onLineApiKey;

        if (onPremApiKey) return onPremApiKey;

        var configQuery = ['<fetch distinct="false" mapping="logical" output-format="xml-platform" version="1.0" count="1">', '<entity name="li_configuration">', '<attribute name="li_apikey"/>', '</entity>', '</fetch>'].join('');

        var configResults = SP.OrgService.retrieveMultipleSync(SP.Fetch.htmlEncode(configQuery));
        if (!configResults || !configResults.Success || !configResults.Value || !configResults.Value.Entities || configResults.Value.Entities.length == 0) {
            alert('No configuration settings returned. Please complete the configuration page in the LinkedIn solution.');
            return;
        }

        onPremApiKey = configResults.Value.Entities[0].li_apikey;
        return onPremApiKey;
    }

    function getMainScriptBody() {
        return ["api_key:", getApiKey(), "\n", "extensions:", extensionsParamValue].join("");
    }

    function loadSettings() {
        window.LinkedInConfig = {
            scriptParamPrefix: scriptParamPrefix,
            parameterScriptType: parameterScriptType,
            callbackContainer: callbackContainer,
            mainScriptBody: getMainScriptBody(),
            mainScriptSource: mainScriptSource,
            maxActivityRecords: maxActivityRecords,
            isOffline: isOffline(),
            isIE7: isIE7(),
            supportsFlash: supportsFlash()
        };
    }

    return {
        loadSettings: loadSettings
    };
})();