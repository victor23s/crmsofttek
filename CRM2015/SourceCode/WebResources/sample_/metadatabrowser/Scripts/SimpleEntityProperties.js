var emptyPropertyNameSearchValue = "   Type Property Name",
entityPropertiesGridConfig = {
    showComplex: false,
    columns: [{
        label: "Property",
        initialWidth: "200",
        contextMenu: propertyNameContextMenuCommands
    },
    {
        label: "Simple Value",
        initialWidth: "*",
        contextMenu: propertyValueContextMenuCommands
    }],
    filters: [{
        creator: searchEntityPropertiesTextBox,
        event: "onkeyup",
        evaluator: EntityPropertyNameSearch,
        label: ""
    }],
    filterAreaHeight: 30,
    nullValueString: "(null)"
};
function propertyNameContextMenuCommands() {
    var a = [],
    c = 140,
    b = copyCommand(this.innerText, "Copy Property Name");
    a.push(b);
    entityPropertiesGridConfig.grid.showContextMenu(this, a, c)
}
function propertyValueContextMenuCommands() {
    var a = [],
    d = 140,
    c = this.innerText.replace(/'/g, "\\'"),
    b = copyCommand(c, "Copy Property Value");
    a.push(b);
    entityPropertiesGridConfig.grid.showContextMenu(this, a, d)
}
function searchEntityPropertiesTextBox() {
    var a = document.createElement("input");
    a.setAttribute("type", "text");
    a.setAttribute("id", "PropertiesSearchTextBox");
    a.setAttribute("title", "Filter Properties using property name.");
    a.value = emptyPropertyNameSearchValue;
    a.onclick = function () {
        if (this.value == emptyPropertyNameSearchValue) this.value = ""
    };
    a.onblur = function () {
        if (this.value == "") this.value = emptyPropertyNameSearchValue
    };
    return a
}
function EntityPropertyNameSearch(b) {
    var a = document.getElementById("PropertiesSearchTextBox").value.toLowerCase();
    if (a != emptyPropertyNameSearchValue.toLowerCase()) if (b.toLowerCase().indexOf(a) == -1) return false;
    return true
}