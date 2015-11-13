var currentOneToManyRelationship, emptyOneToManyRelationshipSearchValue = "    Type search value",
oneToManyRelationshipsGridConfig = {
    initialWidth: .6,
    showComplex: false,
    key: "SchemaName",
    onRowSelect: selectOneToManyRelationship,
    columns: [{
        property: "SchemaName",
        type: "string",
        label: "Schema Name",
        initialWidth: "200",
        contextMenu: oneToManyRelationshipSchemaNameContextMenuCommands
    },
    {
        property: "ReferencingEntity",
        type: "string",
        label: "Referencing Entity",
        initialWidth: "200",
        contextMenu: oneToManyRelationshipReferencingEntityContextMenuCommands
    },
    {
        property: "ReferencingAttribute",
        type: "string",
        label: "Referencing Attribute",
        initialWidth: "*",
        contextMenu: oneToManyRelationshipReferencingAttributeContextMenuCommands
    }],
    filters: [{
        creator: customOneToManyRelationshipSelectControl,
        event: "onchange",
        evaluator: isCustomOneToManyRelationship,
        label: ""
    },
    {
        creator: oneToManyRelationshipCustomizablititySelectControl,
        event: "onchange",
        evaluator: oneToManyRelationshipCustomizabilityFilter,
        label: ""
    },
    {
        creator: oneToManyRelationshipSearchTextBox,
        event: "onkeyup",
        evaluator: oneToManyRelationshipStringSearch,
        label: ""
    }],
    whenNoRowsVisible: clearOneToManyRelationshipPropertiesGrid,
    filterAreaHeight: 30,
    nullValueString: "(null)"
};
function selectOneToManyRelationship(b) {
    for (var a = 0; a < entityMetadata.OneToManyRelationships.length; a++) if (entityMetadata.OneToManyRelationships[a].OneToManyRelationshipMetadata.SchemaName == b) {
        oneToManyRelationshipPropertiesGridConfig.grid.loadData(entityMetadata.OneToManyRelationships[a].OneToManyRelationshipMetadata);
        oneToManyRelationshipPropertiesGridConfig.grid.filterRows();
        break
    }
}
function oneToManyRelationshipSchemaNameContextMenuCommands() {
    var c = 130,
    a = [],
    b = copyCommand(this.innerText, "Copy Schema Name");
    a.push(b);
    oneToManyRelationshipsGridConfig.grid.showContextMenu(this, a, c)
}
function oneToManyRelationshipReferencingAttributeContextMenuCommands() {
    var c = 210,
    a = [],
    b = copyCommand(this.innerText, "Copy Referencing Attribute Name");
    a.push(b);
    oneToManyRelationshipsGridConfig.grid.showContextMenu(this, a, c)
}
function oneToManyRelationshipReferencingEntityContextMenuCommands() {
    var a = [],
    c = 200,
    b = copyCommand(this.innerText, "Copy Referencing Entity Name");
    a.push(b);
    oneToManyRelationshipsGridConfig.grid.showContextMenu(this, a, c)
}
function clearOneToManyRelationshipPropertiesGrid() {
    oneToManyRelationshipPropertiesGridConfig.grid.loadData({})
}
function isCustomOneToManyRelationship(b) {
    var a = document.getElementById("filterForCustomOneToManyRelationship"),
    c = a.options[a.selectedIndex].value;
    switch (c) {
    case "all":
        return true;
        break;
    case "custom":
        return b.IsCustomOneToManyRelationship;
        break;
    case "notcustom":
        return !b.IsCustomOneToManyRelationship
    }
}
function customOneToManyRelationshipSelectControl() {
    var a = document.createElement("select");
    a.setAttribute("id", "filterForCustomOneToManyRelationship");
    a.options[0] = new Option("Custom : All", "all");
    a.options[1] = new Option("Only Custom", "custom");
    a.options[2] = new Option("Not Custom", "notcustom");
    a.setAttribute("title", "Filter One-To-Many relationships based on whether they are custom.");
    return a
}
function oneToManyRelationshipCustomizablititySelectControl() {
    var a = document.createElement("select");
    a.setAttribute("id", "filterForOneToManyRelationshipCustomizability");
    a.options[0] = new Option("Customizable: All", "all");
    a.options[1] = new Option("Only Customizable", "customizable");
    a.options[2] = new Option("Non-Customizable", "noncustomizable");
    a.setAttribute("title", "Filter One-To-ManyRelationships based on whether they are customizable");
    return a
}
function oneToManyRelationshipCustomizabilityFilter(b) {
    var a = document.getElementById("filterForOneToManyRelationshipCustomizability"),
    c = a.options[a.selectedIndex].value;
    switch (c) {
    case "all":
        return true;
        break;
    case "customizable":
        return b.IsCustomizable.Value == true;
        break;
    case "noncustomizable":
        return b.IsCustomizable.Value == false
    }
}
function oneToManyRelationshipSearchTextBox() {
    var a = document.createElement("input");
    a.setAttribute("type", "text");
    a.setAttribute("id", "oneToManyRelationshipSearchTextBox");
    a.setAttribute("title", "Search One-To-ManyRelationships for matching SchemaName, Referencing entity, Referencing Attribute, or MetadataId");
    a.value = emptyOneToManyRelationshipSearchValue;
    a.onclick = function () {
        if (this.value == emptyOneToManyRelationshipSearchValue) this.value = ""
    };
    a.onblur = function () {
        if (this.value == "") this.value = emptyOneToManyRelationshipSearchValue
    };
    return a
}
function oneToManyRelationshipStringSearch(b) {
    var a = document.getElementById("oneToManyRelationshipSearchTextBox").value.toLowerCase();
    if (a != emptyOneToManyRelationshipSearchValue.toLowerCase()) {
        var f = b.SchemaName.toLowerCase().indexOf(a) != -1,
        e = b.MetadataId.toLowerCase() == a,
        d = b.ReferencingEntity.toLowerCase().indexOf(a) != -1,
        c = b.ReferencingAttribute.toLowerCase().indexOf(a) != -1;
        if (!f && !e && !d && !c) return false
    }
    return true
}