/**
 * @author jesse.zhang
 */
var options;

function load() {
    InitializeDuration();
	options = Xrm.Page.getControl("new_subcategorysftk").getAttribute().getOptions();
}

function Form_onsave() {
    if (Xrm.Page.getAttribute("new_isalldayeventtask").getValue() == true) {
        var objEndTime = Xrm.Page.getAttribute("scheduledend");
        var objStartTime = Xrm.Page.getAttribute("scheduledstart");
        var startTime = new Date(objStartTime.getValue());
        var endTime = new Date(objEndTime.getValue());
        startTime.setHours(0, 0, 0, 0);
        endTime.setHours(0, 0, 0, 0);
        endTime.addDays(1);
        objStartTime.setValue(startTime);
        objEndTime.setValue(endTime);
        objStartTime.setSubmitMode("always");
        objEndTime.setSubmitMode("always");
    }
}

function Start_onchange() {
    var objStartTime = Xrm.Page.getAttribute("scheduledstart");
    var startTime = new Date(objStartTime.getValue());
    startTime.setSeconds(1);
    objStartTime.setValue(startTime);
}

function ShowDateOrTime() {
    if (Xrm.Page.getAttribute("new_isalldayeventtask").getValue() == true) {
        //All Day Event
        Xrm.Page.getControl("scheduledstart").setVisible(false);
        Xrm.Page.getControl("scheduledend").setVisible(false);
       
    }
    else { ////not All Day Event
        Xrm.Page.getControl("scheduledstart").setVisible(true);
        Xrm.Page.getControl("scheduledend").setVisible(true);
       
    }
}

function Duration_onchange() {
    var objEndTime = Xrm.Page.getAttribute("scheduledend");
    var objStartTime = Xrm.Page.getAttribute("scheduledstart");
    var startTime = new Date(objStartTime.getValue());
    var endTime = new Date(objEndTime.getValue());
    var duration = Xrm.Page.getAttribute("actualdurationminutes").getValue();

    if (Xrm.Page.getAttribute("new_isalldayeventtask").getValue() == true) {
        if (duration % 1440 == 0) {
            startTime.setHours(endTime.getHours(), endTime.getMinutes());
            startTime.addDays((duration / 1440) - 1);
        }
        else {
            Xrm.Page.getAttribute("new_isalldayeventtask").setValue(false);
            ShowDateOrTime();
        }
    }
    if (Xrm.Page.getAttribute("new_isalldayeventtask").getValue() == false) {
        startTime.setMinutes(startTime.getMinutes() + duration);
    }
    objEndTime.setValue(startTime);
    Xrm.Page.getControl("scheduledstart").setDisabled(true);
}

function End_onchange() {
    var objEndTime = Xrm.Page.getAttribute("scheduledend");
    var objStartTime = Xrm.Page.getAttribute("scheduledstart");
    var startTime = new Date(objStartTime.getValue());
    var endTime = new Date(objEndTime.getValue());
    if (Xrm.Page.getAttribute("new_isalldayeventtask").getValue() == true) {
        startTime.setHours(0, 0, 0, 0);
        endTime.setHours(0, 0, 0, 0);
        endTime.addDays(1);
        endTime.setSeconds(1);
    }
    else {
        startTime.setSeconds(0);
    }
    startTime = startTime.Format("yyyy-mm-ddThh:MM:ss");
    endTime = endTime.Format("yyyy-mm-ddThh:MM:ss")

    var objDuration = Xrm.Page.getAttribute("actualdurationminutes");
    if (dateDiff('M', startTime, endTime) > 0) {
        objDuration.setValue(dateDiff('M', startTime, endTime));
        Xrm.Page.getControl("scheduledstart").setDisabled(false);
    }
    else {
        if (Xrm.Page.getControl("scheduledstart").getDisabled()) {
            return;
        }
    }
}

function InitializeDuration() {
    var startTime = Xrm.Page.getAttribute("scheduledstart");
    var endTime = Xrm.Page.getAttribute("scheduledend");
    var duration = Xrm.Page.getAttribute("actualdurationminutes");
    var FORM_TYPE_CREATE = 1;
    var formType = Xrm.Page.ui.getFormType();
    if (formType == FORM_TYPE_CREATE) {
        var now = new Date();
        var time = new Date();
        if (now.getMinutes() < 30) {
            time.setMinutes(30);
        }
        else {
            time.setHours(time.getHours() + 1);
            time.setMinutes(0);
        }
        time.setSeconds(0);
        startTime.setValue(time);
        duration.setValue(null);
        
    }
    else {
        ShowDateOrTime();
        Duration_onchange();
    }
}