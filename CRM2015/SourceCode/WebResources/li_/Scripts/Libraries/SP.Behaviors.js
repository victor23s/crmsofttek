 /// <reference path="SP.Core.js" />

Sonoma.namespace("Behaviors").extend((function () {

    function initialize() {
        _setupButtons();
    }

    function _setupButtons() {
        var buttons = document.getElementsByTagName("button");
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].attachEvent("onmouseover", _buttonHover);
            buttons[i].attachEvent("onmouseout", _buttonHover);
        }
    };

    function _buttonHover(event) {
        if (!event.srcElement) return;

        if (event.srcElement.className.indexOf("button-hover") === -1) event.srcElement.className += " button-hover";
        else event.srcElement.className = event.srcElement.className.replace(/\bbutton-hover\b/, '');
    }

    /*-- Public --*/
    return {
        initialize: initialize
    };

})());

window.attachEvent("onload", Sonoma.Behaviors.initialize);