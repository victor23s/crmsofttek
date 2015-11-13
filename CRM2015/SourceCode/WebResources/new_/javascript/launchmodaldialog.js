function LaunchModalDialog(dialogId, typeName, recordId) {
    var serverUrl = Xrm.Page.context.getClientUrl();
    recordId = recordId.replace("{", "");
    recordId = recordId.replace("}", "");

    dialogId = dialogId.replace("{", "");
    dialogId = dialogId.replace("}", "");


    // Load modal
    var serverUri = serverUrl + '/cs/dialog/rundialog.aspx';

    var mypath = serverUri + '?DialogId=%7b' + dialogId.toUpperCase() + '%7d&EntityName=' + typeName + '&ObjectId=%7b' + recordId + '%7d';

    // First item from selected contacts only
    window.showModalDialog(mypath);

    // Reload form.
    window.location.reload(true);
}