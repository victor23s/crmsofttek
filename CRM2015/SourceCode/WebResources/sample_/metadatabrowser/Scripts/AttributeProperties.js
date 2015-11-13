var emptyAttributePropertySearchValue = "   Type Property Name",
attributePropertiesGridConfig = {
    showComplex: true,
    columns: [{
        label: "Property",
        initialWidth: "175",
        contextMenu: attributePropertyNameContextMenuCommands
    },
    {
        label: "Value",
        initialWidth: "*",
        contextMenu: attributePropertyValueContextMenuCommands
    }],
    filters: [{
        creator: searchAttributePropertiesTextBox,
        event: "onkeyup",
        evaluator: attributePropertiesStringSearch,
        label: ""
    }],
    filterAreaHeight: 30,
    nullValueString: "(null)"
};
function attributePropertyNameContextMenuCommands() {
    var a = [],
    c = 140,
    b = copyCommand(this.innerText, "Copy Property Name");
    a.push(b);
    attributePropertiesGridConfig.grid.showContextMenu(this, a, c)
}
function attributePropertyValueContextMenuCommands() {
    var c = this.innerText.replace(/'/g, "\\'"),
    a = [],
    d = 140,
    b = copyCommand(c, "Copy Property Value");
    a.push(b);
    attributePropertiesGridConfig.grid.showContextMenu(this, a, d)
}
function searchAttributePropertiesTextBox() {
    var a = document.createElement("input");
    a.setAttribute("type", "text");
    a.setAttribute("id", "attributePropertiesSearchTextBox");
    a.setAttribute("title", "Filter Properties using property name.");
    a.value = emptyAttributePropertySearchValue;
    a.onclick = function () {
        if (this.value == emptyAttributePropertySearchValue) this.value = ""
    };
    a.onblur = function () {
        if (this.value == "") this.value = emptyAttributePropertySearchValue
    };
    return a
}
function attributePropertiesStringSearch(b) {
    var a = document.getElementById("attributePropertiesSearchTextBox").value.toLowerCase();
    if (a != emptyAttributePropertySearchValue.toLowerCase()) if (b.toLowerCase().indexOf(a) == -1) return false;
    return true
}