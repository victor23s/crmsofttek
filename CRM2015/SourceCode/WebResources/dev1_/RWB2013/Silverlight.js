﻿ //v5.1.20125.0
if (!window.Silverlight) window.Silverlight = {};
Silverlight._silverlightCount = 0;
Silverlight.__onSilverlightInstalledCalled = false;
Silverlight.fwlinkRoot = "http://go2.microsoft.com/fwlink/?LinkID=";
Silverlight.__installationEventFired = false;
Silverlight.onGetSilverlight = null;
Silverlight.onSilverlightInstalled = function () {
    window.location.reload(false)
};
Silverlight.isInstalled = function (version) {
    if (version == undefined) version = null;
    var isVersionSupported = false;
    try {
        var tryOlderIE = false;
        try {
            var plugin = navigator.plugins["Silverlight Plug-In"];
            if (plugin) if (version === null) isVersionSupported = true;
            else {
                var actualVer = plugin.description;
                if (actualVer === "1.0.30226.2") actualVer = "2.0.30226.2";
                var actualVerArray = actualVer.split(".");
                while (actualVerArray.length > 3) actualVerArray.pop();
                while (actualVerArray.length < 4) actualVerArray.push(0);
                var reqVerArray = version.split(".");
                while (reqVerArray.length > 4) reqVerArray.pop();
                var requiredVersionPart, actualVersionPart, index = 0;
                do {
                    requiredVersionPart = parseInt(reqVerArray[index]);
                    actualVersionPart = parseInt(actualVerArray[index]);
                    index++
                } while (index < reqVerArray.length && requiredVersionPart === actualVersionPart);
                if (requiredVersionPart <= actualVersionPart && !isNaN(requiredVersionPart)) isVersionSupported = true
            } else tryOlderIE = true
        } catch(e) {
            tryOlderIE = true
        }
        if (tryOlderIE) {
            var control = new ActiveXObject("AgControl.AgControl");
            if (version === null) isVersionSupported = true;
            else if (control.IsVersionSupported(version)) isVersionSupported = true;
            control = null
        }
    } catch(e) {
        isVersionSupported = false
    }
    return isVersionSupported
};
Silverlight.WaitForInstallCompletion = function () {
    if (!Silverlight.isBrowserRestartRequired && Silverlight.onSilverlightInstalled) {
        try {
            navigator.plugins.refresh()
        } catch(e) {}
        if (Silverlight.isInstalled(null) && !Silverlight.__onSilverlightInstalledCalled) {
            Silverlight.onSilverlightInstalled();
            Silverlight.__onSilverlightInstalledCalled = true
        } else setTimeout(Silverlight.WaitForInstallCompletion, 3000)
    }
};
Silverlight.__startup = function () {
    navigator.plugins.refresh();
    Silverlight.isBrowserRestartRequired = Silverlight.isInstalled(null);
    if (!Silverlight.isBrowserRestartRequired) {
        Silverlight.WaitForInstallCompletion();
        if (!Silverlight.__installationEventFired) {
            Silverlight.onInstallRequired();
            Silverlight.__installationEventFired = true
        }
    } else if (window.navigator.mimeTypes) {
        var mimeSL2 = navigator.mimeTypes["application/x-silverlight-2"],
        mimeSL2b2 = navigator.mimeTypes["application/x-silverlight-2-b2"],
        mimeSL2b1 = navigator.mimeTypes["application/x-silverlight-2-b1"],
        mimeHighestBeta = mimeSL2b1;
        if (mimeSL2b2) mimeHighestBeta = mimeSL2b2;
        if (!mimeSL2 && (mimeSL2b1 || mimeSL2b2)) {
            if (!Silverlight.__installationEventFired) {
                Silverlight.onUpgradeRequired();
                Silverlight.__installationEventFired = true
            }
        } else if (mimeSL2 && mimeHighestBeta) if (mimeSL2.enabledPlugin && mimeHighestBeta.enabledPlugin) if (mimeSL2.enabledPlugin.description != mimeHighestBeta.enabledPlugin.description) if (!Silverlight.__installationEventFired) {
            Silverlight.onRestartRequired();
            Silverlight.__installationEventFired = true
        }
    }
    if (!Silverlight.disableAutoStartup) if (window.removeEventListener) window.removeEventListener("load", Silverlight.__startup, false);
    else window.detachEvent("onload", Silverlight.__startup)
};
if (!Silverlight.disableAutoStartup) if (window.addEventListener) window.addEventListener("load", Silverlight.__startup, false);
else window.attachEvent("onload", Silverlight.__startup);
Silverlight.createObject = function (source, parentElement, id, properties, events, initParams, userContext) {
    var slPluginHelper = {},
    slProperties = properties,
    slEvents = events;
    slPluginHelper.version = slProperties.version;
    slProperties.source = source;
    slPluginHelper.alt = slProperties.alt;
    if (initParams) slProperties.initParams = initParams;
    if (slProperties.isWindowless && !slProperties.windowless) slProperties.windowless = slProperties.isWindowless;
    if (slProperties.framerate && !slProperties.maxFramerate) slProperties.maxFramerate = slProperties.framerate;
    if (id && !slProperties.id) slProperties.id = id;
    delete slProperties.ignoreBrowserVer;
    delete slProperties.inplaceInstallPrompt;
    delete slProperties.version;
    delete slProperties.isWindowless;
    delete slProperties.framerate;
    delete slProperties.data;
    delete slProperties.src;
    delete slProperties.alt;
    if (Silverlight.isInstalled(slPluginHelper.version)) {
        for (var name in slEvents) if (slEvents[name]) {
            if (name == "onLoad" && typeof slEvents[name] == "function" && slEvents[name].length != 1) {
                var onLoadHandler = slEvents[name];
                slEvents[name] = function (sender) {
                    return onLoadHandler(document.getElementById(id), userContext, sender)
                }
            }
            var handlerName = Silverlight.__getHandlerName(slEvents[name]);
            if (handlerName != null) {
                slProperties[name] = handlerName;
                slEvents[name] = null
            } else throw "typeof events." + name + " must be 'function' or 'string'"
        }
        slPluginHTML = Silverlight.buildHTML(slProperties)
    } else slPluginHTML = Silverlight.buildPromptHTML(slPluginHelper);
    if (parentElement) parentElement.innerHTML = slPluginHTML;
    else return slPluginHTML
};
Silverlight.buildHTML = function (slProperties) {
    var htmlBuilder = [];
    htmlBuilder.push('<object type="application/x-silverlight" data="data:application/x-silverlight,"');
    if (slProperties.id != null) htmlBuilder.push(' id="' + Silverlight.HtmlAttributeEncode(slProperties.id) + '"');
    if (slProperties.width != null) htmlBuilder.push(' width="' + slProperties.width + '"');
    if (slProperties.height != null) htmlBuilder.push(' height="' + slProperties.height + '"');
    htmlBuilder.push(" >");
    delete slProperties.id;
    delete slProperties.width;
    delete slProperties.height;
    for (var name in slProperties) if (slProperties[name]) htmlBuilder.push('<param name="' + Silverlight.HtmlAttributeEncode(name) + '" value="' + Silverlight.HtmlAttributeEncode(slProperties[name]) + '" />');
    htmlBuilder.push("</object>");
    return htmlBuilder.join("")
};
Silverlight.createObjectEx = function (params) {
    var parameters = params,
    html = Silverlight.createObject(parameters.source, parameters.parentElement, parameters.id, parameters.properties, parameters.events, parameters.initParams, parameters.context);
    if (parameters.parentElement == null) return html
};
Silverlight.buildPromptHTML = function (slPluginHelper) {
    var slPluginHTML = "",
    urlRoot = Silverlight.fwlinkRoot,
    version = slPluginHelper.version;
    if (slPluginHelper.alt) slPluginHTML = slPluginHelper.alt;
    else {
        if (!version) version = "";
        slPluginHTML = "<a href='javascript:Silverlight.getSilverlight(\"{1}\");' style='text-decoration: none;'><img src='{2}' alt='Get Microsoft Silverlight' style='border-style: none'/></a>";
        slPluginHTML = slPluginHTML.replace("{1}", version);
        slPluginHTML = slPluginHTML.replace("{2}", urlRoot + "161376")
    }
    return slPluginHTML
};
Silverlight.getSilverlight = function (version) {
    if (Silverlight.onGetSilverlight) Silverlight.onGetSilverlight();
    var shortVer = "",
    reqVerArray = String(version).split(".");
    if (reqVerArray.length > 1) {
        var majorNum = parseInt(reqVerArray[0]);
        if (isNaN(majorNum) || majorNum < 2) shortVer = "1.0";
        else shortVer = reqVerArray[0] + "." + reqVerArray[1]
    }
    var verArg = "";
    if (shortVer.match(/^\d+\056\d+$/)) verArg = "&v=" + shortVer;
    Silverlight.followFWLink("149156" + verArg)
};
Silverlight.followFWLink = function (linkid) {
    top.location = Silverlight.fwlinkRoot + String(linkid)
};
Silverlight.HtmlAttributeEncode = function (strInput) {
    var c, retVal = "";
    if (strInput == null) return null;
    for (var cnt = 0; cnt < strInput.length; cnt++) {
        c = strInput.charCodeAt(cnt);
        if (c > 96 && c < 123 || c > 64 && c < 91 || c > 43 && c < 58 && c != 47 || c == 95) retVal = retVal + String.fromCharCode(c);
        else retVal = retVal + "&#" + c + ";"
    }
    return retVal
};
Silverlight.default_error_handler = function (sender, args) {
    var iErrorCode, errorType = args.ErrorType;
    iErrorCode = args.ErrorCode;
    var errMsg = "\nSilverlight error message     \n";
    errMsg += "ErrorCode: " + iErrorCode + "\n";
    errMsg += "ErrorType: " + errorType + "       \n";
    errMsg += "Message: " + args.ErrorMessage + "     \n";
    if (errorType == "ParserError") {
        errMsg += "XamlFile: " + args.xamlFile + "     \n";
        errMsg += "Line: " + args.lineNumber + "     \n";
        errMsg += "Position: " + args.charPosition + "     \n"
    } else if (errorType == "RuntimeError") {
        if (args.lineNumber != 0) {
            errMsg += "Line: " + args.lineNumber + "     \n";
            errMsg += "Position: " + args.charPosition + "     \n"
        }
        errMsg += "MethodName: " + args.methodName + "     \n"
    }
    alert(errMsg)
};
Silverlight.__cleanup = function () {
    for (var i = Silverlight._silverlightCount - 1; i >= 0; i--) window["__slEvent" + i] = null;
    Silverlight._silverlightCount = 0;
    if (window.removeEventListener) window.removeEventListener("unload", Silverlight.__cleanup, false);
    else window.detachEvent("onunload", Silverlight.__cleanup)
};
Silverlight.__getHandlerName = function (handler) {
    var handlerName = "";
    if (typeof handler == "string") handlerName = handler;
    else if (typeof handler == "function") {
        if (Silverlight._silverlightCount == 0) if (window.addEventListener) window.addEventListener("unload", Silverlight.__cleanup, false);
        else window.attachEvent("onunload", Silverlight.__cleanup);
        var count = Silverlight._silverlightCount++;
        handlerName = "__slEvent" + count;
        window[handlerName] = handler
    } else handlerName = null;
    return handlerName
};
Silverlight.onRequiredVersionAvailable = function () {};
Silverlight.onRestartRequired = function () {};
Silverlight.onUpgradeRequired = function () {};
Silverlight.onInstallRequired = function () {};
Silverlight.IsVersionAvailableOnError = function (sender, args) {
    var retVal = false;
    try {
        if (args.ErrorCode == 8001 && !Silverlight.__installationEventFired) {
            Silverlight.onUpgradeRequired();
            Silverlight.__installationEventFired = true
        } else if (args.ErrorCode == 8002 && !Silverlight.__installationEventFired) {
            Silverlight.onRestartRequired();
            Silverlight.__installationEventFired = true
        } else if (args.ErrorCode == 5014 || args.ErrorCode == 2106) {
            if (Silverlight.__verifySilverlight2UpgradeSuccess(args.getHost())) retVal = true
        } else retVal = true
    } catch(e) {}
    return retVal
};
Silverlight.IsVersionAvailableOnLoad = function (sender) {
    var retVal = false;
    try {
        if (Silverlight.__verifySilverlight2UpgradeSuccess(sender.getHost())) retVal = true
    } catch(e) {}
    return retVal
};
Silverlight.__verifySilverlight2UpgradeSuccess = function (host) {
    var retVal = false,
    version = "5.1.20125",
    installationEvent = null;
    try {
        if (host.IsVersionSupported(version + ".99")) {
            installationEvent = Silverlight.onRequiredVersionAvailable;
            retVal = true
        } else if (host.IsVersionSupported(version + ".0")) installationEvent = Silverlight.onRestartRequired;
        else installationEvent = Silverlight.onUpgradeRequired;
        if (installationEvent && !Silverlight.__installationEventFired) {
            installationEvent();
            Silverlight.__installationEventFired = true
        }
    } catch(e) {}
    return retVal
}