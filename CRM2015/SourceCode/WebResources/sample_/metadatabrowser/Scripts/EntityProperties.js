var emptyPropertyNameSearchValue = "  Type Property Name",
entityPropertiesGridConfig = {
    showComplex: true,
    columns: [{
        label: "Property",
        initialWidth: "300",
        contextMenu: propertyNameContextMenuCommands
    },
    {
        label: "Value",
        initialWidth: "*",
        contextMenu: propertyValueContextMenuCommands
    }],
    filters: [{
        creator: searchPropertiesTextBox,
        event: "onkeyup",
        evaluator: searchEntityProperties,
        label: ""
    }],
    filterAreaHeight: 30,
    arrayPropertyActions: [{
        property: "Attributes",
        action: clickAttributesProperty
    },
    {
        property: "ManyToManyRelationships",
        action: clickManyToManyRelationshipsProperty
    },
    {
        property: "ManyToOneRelationships",
        action: clickManyToOneRelationshipsProperty
    },
    {
        property: "OneToManyRelationships",
        action: clickOneToManyRelationshipsProperty
    },
    {
        property: "Privileges",
        action: clickPrivilegesProperty
    }],
    nullValueString: "(null)"
};
function propertyNameContextMenuCommands() {
    this.parentElement.click();
    var a = [],
    c = 140,
    b = copyCommand(this.innerText, "Copy Property Name");
    a.push(b);
    entityPropertiesGridConfig.grid.showContextMenu(this, a, c)
}
function propertyValueContextMenuCommands() {
    this.parentElement.click();
    var a = [],
    d = 140,
    c = this.innerText.replace(/'/g, "\\'"),
    b = copyCommand(c, "Copy Property Value");
    a.push(b);
    entityPropertiesGridConfig.grid.showContextMenu(this, a, d)
}
function searchPropertiesTextBox() {
    var a = document.createElement("input");
    a.setAttribute("type", "text");
    a.setAttribute("id", "searchTextBox");
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
function searchEntityProperties(b) {
    var a = document.getElementById("searchTextBox").value.toLowerCase();
    if (a != emptyPropertyNameSearchValue.toLowerCase()) if (b.toLowerCase().indexOf(a) == -1) return false;
    return true
}
function clickAttributesProperty() {
    AttributesNavButton.click()
}
function clickManyToManyRelationshipsProperty() {
    ManyToManyRelationshipsNavButton.click()
}
function clickManyToOneRelationshipsProperty() {
    ManyToOneRelationshipsNavButton.click()
}
function clickOneToManyRelationshipsProperty() {
    OneToManyRelationshipsNavButton.click()
}
function clickPrivilegesProperty() {
    PrivilegesNavButton.click()
}