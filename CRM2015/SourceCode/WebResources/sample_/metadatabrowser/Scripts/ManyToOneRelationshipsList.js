var emptyManyToOneRelationshipSearchValue = "    Type search value",
manyToOneRelationshipsGridConfig = {
    initialWidth: .6,
    showComplex: false,
    key: "SchemaName",
    onRowSelect: selectManyToOneRelationship,
    columns: [{
        property: "SchemaName",
        type: "string",
        label: "Schema Name",
        initialWidth: "200",
        contextMenu: manyToOneRelationshipSchemaNameContextMenuCommands
    },
    {
        property: "ReferencingAttribute",
        type: "string",
        label: "Referencing Attribute",
        initialWidth: "150",
        contextMenu: manyToOneRelationshipReferencingAttributeContextMenuCommands
    },
    {
        property: "ReferencedEntity",
        type: "string",
        label: "Referenced Entity",
        initialWidth: "150",
        contextMenu: manyToOneRelationshipReferencedEntityContextMenuCommands
    },
    {
        property: "ReferencedAttribute",
        type: "string",
        label: "Referenced Attribute",
        initialWidth: "*",
        contextMenu: manyToOneRelationshipReferencedAttributeContextMenuCommands
    }],
    filters: [{
        creator: customManyToOneRelationshipSelectControl,
        event: "onchange",
        evaluator: isCustomManyToOneRelationship,
        label: ""
    },
    {
        creator: manyToOneRelationshipCustomizablititySelectControl,
        event: "onchange",
        evaluator: manyToOneRelationshipCustomizabilityFilter,
        label: ""
    },
    {
        creator: manyToOneRelationshipSearchTextBox,
        event: "onkeyup",
        evaluator: manyToOneRelationshipStringSearch,
        label: ""
    }],
    whenNoRowsVisible: clearManyToOneRelationshipPropertiesGrid,
    filterAreaHeight: 30,
    nullValueString: "(null)"
};
function selectManyToOneRelationship(b) {
    for (var a = 0; a < entityMetadata.ManyToOneRelationships.length; a++) if (entityMetadata.ManyToOneRelationships[a].OneToManyRelationshipMetadata.SchemaName == b) {
        manyToOneRelationshipPropertiesGridConfig.grid.loadData(entityMetadata.ManyToOneRelationships[a].OneToManyRelationshipMetadata);
        manyToOneRelationshipPropertiesGridConfig.grid.filterRows();
        break
    }
}
function manyToOneRelationshipSchemaNameContextMenuCommands() {
    this.parentElement.parentElement.click();
    var c = 130,
    a = [],
    b = copyCommand(this.innerText, "Copy Schema Name");
    a.push(b);
    manyToOneRelationshipsGridConfig.grid.showContextMenu(this, a, c)
}
function manyToOneRelationshipReferencingAttributeContextMenuCommands() {
    var c = 210,
    a = [],
    b = copyCommand(this.innerText, "Copy Referencing Attribute Name");
    a.push(b);
    manyToOneRelationshipsGridConfig.grid.showContextMenu(this, a, c)
}
function manyToOneRelationshipReferencedEntityContextMenuCommands() {
    var a = [],
    c = 200,
    b = copyCommand(this.innerText, "Copy Referenced Entity Name");
    a.push(b);
    manyToOneRelationshipsGridConfig.grid.showContextMenu(this, a, c)
}
function manyToOneRelationshipReferencedAttributeContextMenuCommands() {
    var a = [],
    c = 200,
    b = copyCommand(this.innerText, "Copy Referenced Attribute Name ");
    a.push(b);
    manyToOneRelationshipsGridConfig.grid.showContextMenu(this, a, c)
}
function clearManyToOneRelationshipPropertiesGrid() {
    manyToOneRelationshipPropertiesGridConfig.grid.loadData({})
}
function customManyToOneRelationshipSelectControl() {
    var a = document.createElement("select");
    a.setAttribute("id", "filterForCustomManyToOneRelationship");
    a.options[0] = new Option("Custom : All", "all");
    a.options[1] = new Option("Only Custom", "custom");
    a.options[2] = new Option("Not Custom", "notcustom");
    a.setAttribute("title", "Filter Many-To-One relationships based on whether they are custom.");
    return a
}
function isCustomManyToOneRelationship(b) {
    var a = document.getElementById("filterForCustomManyToOneRelationship"),
    c = a.options[a.selectedIndex].value;
    switch (c) {
    case "all":
        return true;
        break;
    case "custom":
        return b.IsCustomManyToOneRelationship;
        break;
    case "notcustom":
        return !b.IsCustomManyToOneRelationship
    }
}
function manyToOneRelationshipCustomizablititySelectControl() {
    var a = document.createElement("select");
    a.setAttribute("id", "filterForManyToOneRelationshipCustomizability");
    a.options[0] = new Option("Customizable: All", "all");
    a.options[1] = new Option("Only Customizable", "customizable");
    a.options[2] = new Option("Non-Customizable", "noncustomizable");
    a.setAttribute("title", "Filter One-To-ManyRelationships based on whether they are customizable");
    return a
}
function manyToOneRelationshipCustomizabilityFilter(b) {
    var a = document.getElementById("filterForManyToOneRelationshipCustomizability"),
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
function manyToOneRelationshipSearchTextBox() {
    var a = document.createElement("input");
    a.setAttribute("type", "text");
    a.setAttribute("id", "manyToOneRelationshipSearchTextBox");
    a.setAttribute("title", "Search Many-To-One Relationships for matching SchemaName, Referencing Attribute, Referenced Entity, Referenced Attribute, or MetadataId");
    a.value = emptyManyToOneRelationshipSearchValue;
    a.onclick = function () {
        if (this.value == emptyManyToOneRelationshipSearchValue) this.value = ""
    };
    a.onblur = function () {
        if (this.value == "") this.value = emptyManyToOneRelationshipSearchValue
    };
    return a
}
function manyToOneRelationshipStringSearch(b) {
    var a = document.getElementById("manyToOneRelationshipSearchTextBox").value.toLowerCase();
    if (a != emptyManyToOneRelationshipSearchValue.toLowerCase()) {
        var g = b.SchemaName.toLowerCase().indexOf(a) != -1,
        f = b.MetadataId.toLowerCase() == a,
        c = b.ReferencingAttribute.toLowerCase().indexOf(a) != -1,
        e = b.ReferencedEntity.toLowerCase().indexOf(a) != -1,
        d = b.ReferencedAttribute.toLowerCase().indexOf(a) != -1;
        if (!g && !f && !c && !e && !d) return false
    }
    return true
}