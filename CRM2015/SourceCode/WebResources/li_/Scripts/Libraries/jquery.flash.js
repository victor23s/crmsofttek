﻿ (function ($) {
    if (typeof $.browser === "undefined" || !$.browser) {
        var browser = {};
        $.extend(browser);
    }
    var pluginList = {
        flash: {
            activex: "ShockwaveFlash.ShockwaveFlash.7",
            plugin: /flash/gim
        },
        sl: {
            activex: ["AgControl.AgControl"],
            plugin: /silverlight/gim
        },
        pdf: {
            activex: "PDF.PdfCtrl",
            plugin: /adobe\s?acrobat/gim
        },
        qtime: {
            activex: "QuickTime.QuickTime",
            plugin: /quicktime/gim
        },
        wmp: {
            activex: "WMPlayer.OCX",
            plugin: /(windows\smedia)|(Microsoft)/gim
        },
        shk: {
            activex: "SWCtl.SWCtl",
            plugin: /shockwave/gim
        },
        rp: {
            activex: "RealPlayer",
            plugin: /realplayer/gim
        },
        java: {
            activex: navigator.javaEnabled(),
            plugin: /java/gim
        }
    };
    var isSupported = function (p) {
        if (window.ActiveXObject) {
            try {
                new ActiveXObject(pluginList[p].activex);
                $.browser[p] = true;
            } catch(e) {
                $.browser[p] = false;
            }
        } else {
            $.each(navigator.plugins, function () {
                if (this.name.match(pluginList[p].plugin)) {
                    $.browser[p] = true;
                    return false;
                } else {
                    $.browser[p] = false;
                }
            });
        }
    };
    $.each(pluginList, function (i, n) {
        isSupported(i);
    });
})(jQuery);