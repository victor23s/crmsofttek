var emptyOneToManyRelationshipPropertiesSearchValue = "   Type Property Name",
oneToManyRelationshipPropertiesGridConfig = {
    showComplex: true,
    columns: [{
        label: "Property",
        initialWidth: "200",
        contextMenu: oneToManyRelationshipPropertyNameContextMenuCommands
    },
    {
        label: "Value",
        initialWidth: "*",
        contextMenu: oneToManyRelationshipPropertyValueContextMenuCommands
    }],
    filters: [{
        creator: oneToManyRelationshipPropertiesSearchTextBox,
        event: "onkeyup",
        evaluator: oneToManyRelationshipPropertiesStringSearch,
        label: ""
    }],
    filterAreaHeight: 30,
    nullValueString: "(null)"
};
function oneToManyRelationshipPropertyNameContextMenuCommands() {
    var a = [],
    c = 140,
    b = copyCommand(this.innerText, "Copy Property Name");
    a.push(b);
    oneToManyRelationshipPropertiesGridConfig.grid.showContextMenu(this, a, c)
}
function oneToManyRelationshipPropertyValueContextMenuCommands() {
    var c = this.innerText.replace(/'/g, "\\'"),
    a = [],
    d = 140,
    b = copyCommand(c, "Copy Property Value");
    a.push(b);
    oneToManyRelationshipPropertiesGridConfig.grid.showContextMenu(this, a, d)
}
function oneToManyRelationshipPropertiesSearchTextBox() {
    var a = document.createElement("input");
    a.setAttribute("type", "text");
    a.setAttribute("id", "oneToManyRelationshipPropertiesSearchTextBox");
    a.setAttribute("title", "Filter Properties using property name.");
    a.value = emptyOneToManyRelationshipPropertiesSearchValue;
    a.onclick = function () {
        if (this.value == emptyOneToManyRelationshipPropertiesSearchValue) this.value = ""
    };
    a.onblur = function () {
        if (this.value == "") this.value = emptyOneToManyRelationshipPropertiesSearchValue
    };
    return a
}
function oneToManyRelationshipPropertiesStringSearch(b) {
    var a = document.getElementById("oneToManyRelationshipPropertiesSearchTextBox").value.toLowerCase();
    if (a != emptyOneToManyRelationshipPropertiesSearchValue.toLowerCase()) if (b.toLowerCase().indexOf(a) == -1) return false;
    return true
}