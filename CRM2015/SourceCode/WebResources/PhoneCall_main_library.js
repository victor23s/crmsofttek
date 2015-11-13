var options;

function Form_onload() {
    InitializeDuration();

    options = Xrm.Page.getControl("new_subcategorysftk").getAttribute().getOptions();
}

function Form_onsave() {
    if (Xrm.Page.getAttribute("new_isalldayevent").getValue() == true) {
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
    Xrm.Page.data.setFormDirty(true);
}

function Start_onchange() {
    var objStartTime = Xrm.Page.getAttribute("scheduledstart");
    var startTime = new Date(objStartTime.getValue());

    startTime.setSeconds(1);
    objStartTime.setValue(startTime);

    Duration_onchange();
}

function AllDayEvent_onchange() {
    Xrm.Page.getAttribute("new_isalldayevent").setValue(!Xrm.Page.getAttribute("new_isalldayevent").getValue());
    End_onchange();
    ShowDateOrTime();
}

function ShowDateOrTime() {
    if (Xrm.Page.getAttribute("new_isalldayevent").getValue() == true) {
        //All Day Event
        Xrm.Page.getControl("scheduledstart").setVisible(false);
        Xrm.Page.getControl("scheduledend").setVisible(false);
    }
    else {
        ////not All Day Event
        Xrm.Page.getControl("scheduledstart").setVisible(true);
        Xrm.Page.getControl("scheduledend").setVisible(true);
    }
}

function Duration_onchange() {
    var objStartTime = Xrm.Page.getAttribute("scheduledstart");
    var objEndTime = Xrm.Page.getAttribute("scheduledend");
    var startTime = new Date(objStartTime.getValue());
    var endTime = new Date(objEndTime.getValue());
    var duration = Xrm.Page.getAttribute("actualdurationminutes").getValue();

    if (Xrm.Page.getAttribute("new_isalldayevent").getValue() == true) {
        if (duration % 1440 == 0) {
            startTime.setHours(endTime.getHours(), endTime.getMinutes());
            startTime.addDays((duration / 1440) - 1);
        }
        else {
            Xrm.Page.getAttribute("new_isalldayevent").setValue(false);
            ShowDateOrTime();
        }
    }

    if (Xrm.Page.getAttribute("new_isalldayevent").getValue() == false) {
        startTime.setMinutes(startTime.getMinutes() + duration);
    }

    objEndTime.setValue(startTime);
    //Xrm.Page.getControl("scheduledstart").setDisabled(true);
}

function End_onchange() {
    var objStartTime = Xrm.Page.getAttribute("scheduledstart");
    var objEndTime = Xrm.Page.getAttribute("scheduledend");
    var startTime = new Date(objStartTime.getValue());
    var endTime = new Date(objEndTime.getValue());

    if (Xrm.Page.getAttribute("new_isalldayevent").getValue() == true) {
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
            alert("You must specify an end time that happens after the start time.");
            Duration_onchange();
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

function dateDiff(date1, date2) {
    var hours = (date1 - date2) / 3600000;
    return hours
}