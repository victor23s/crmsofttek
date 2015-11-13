var emptyManyToManyRelationshipSearchValue = "    Type search value",
manyToManyRelationshipsGridConfig = {
    initialWidth: .6,
    showComplex: false,
    key: "SchemaName",
    onRowSelect: selectManyToManyRelationship,
    columns: [{
        property: "SchemaName",
        type: "string",
        label: "Schema Name",
        initialWidth: "150",
        contextMenu: manyToManyRelationshipSchemaNameContextMenuCommands
    },
    {
        property: "IntersectEntityName",
        type: "string",
        label: "Intersect Entity",
        initialWidth: "100",
        contextMenu: manyToManyRelationshipIntersectEntityNameContextMenuCommands
    },
    {
        property: "Entity1LogicalName",
        type: "string",
        label: "Entity 1",
        initialWidth: "100",
        contextMenu: manyToManyRelationshipEntity1LogicalNameContextMenuCommands
    },
    {
        property: "Entity1IntersectAttribute",
        type: "string",
        label: "Entity 1 Attribute",
        initialWidth: "150",
        contextMenu: manyToManyRelationshipEntity1IntersectAttributeNameContextMenuCommands
    },
    {
        property: "Entity2LogicalName",
        type: "string",
        label: "Entity 2",
        initialWidth: "100",
        contextMenu: manyToManyRelationshipEntity2LogicalNameContextMenuCommands
    },
    {
        property: "Entity2IntersectAttribute",
        type: "string",
        label: "Entity 2 Attribute",
        initialWidth: "*",
        contextMenu: manyToManyRelationshipEntity2IntersectAttributeNameContextMenuCommands
    }],
    filters: [{
        creator: customManyToManyRelationshipSelectControl,
        event: "onchange",
        evaluator: isCustomManyToManyRelationship,
        label: ""
    },
    {
        creator: manyToManyRelationshipCustomizablititySelectControl,
        event: "onchange",
        evaluator: manyToManyRelationshipCustomizabilityFilter,
        label: ""
    },
    {
        creator: manyToManyRelationshipSearchTextBox,
        event: "onkeyup",
        evaluator: manyToManyRelationshipStringSearch,
        label: ""
    }],
    whenNoRowsVisible: clearManyToManyRelationshipPropertiesGrid,
    filterAreaHeight: 30,
    nullValueString: "(null)"
};
function selectManyToManyRelationship(b) {
    for (var a = 0; a < entityMetadata.ManyToManyRelationships.length; a++) if (entityMetadata.ManyToManyRelationships[a].ManyToManyRelationshipMetadata.SchemaName == b) {
        manyToManyRelationshipPropertiesGridConfig.grid.loadData(entityMetadata.ManyToManyRelationships[a].ManyToManyRelationshipMetadata);
        manyToManyRelationshipPropertiesGridConfig.grid.filterRows();
        break
    }
}
function manyToManyRelationshipSchemaNameContextMenuCommands() {
    var c = 130,
    a = [],
    b = copyCommand(this.innerText, "Copy Schema Name");
    a.push(b);
    manyToManyRelationshipsGridConfig.grid.showContextMenu(this, a, c)
}
function manyToManyRelationshipIntersectEntityNameContextMenuCommands() {
    var c = 170,
    a = [],
    b = copyCommand(this.innerText, "Copy Intersect Entity Name");
    a.push(b);
    manyToManyRelationshipsGridConfig.grid.showContextMenu(this, a, c)
}
function manyToManyRelationshipEntity1LogicalNameContextMenuCommands() {
    var c = 170,
    a = [],
    b = copyCommand(this.innerText, "Copy Entity 1 Logical Name");
    a.push(b);
    manyToManyRelationshipsGridConfig.grid.showContextMenu(this, a, c)
}
function manyToManyRelationshipEntity1IntersectAttributeNameContextMenuCommands() {
    var c = 230,
    a = [],
    b = copyCommand(this.innerText, "Copy Entity 1 Intersect Attribute Name");
    a.push(b);
    manyToManyRelationshipsGridConfig.grid.showContextMenu(this, a, c)
}
function manyToManyRelationshipEntity2LogicalNameContextMenuCommands() {
    var c = 180,
    a = [],
    b = copyCommand(this.innerText, "Copy Entity 2 Logical Name");
    a.push(b);
    manyToManyRelationshipsGridConfig.grid.showContextMenu(this, a, c)
}
function manyToManyRelationshipEntity2IntersectAttributeNameContextMenuCommands() {
    var c = 230,
    a = [],
    b = copyCommand(this.innerText, "Copy Entity 2 Intersect Attribute Name");
    a.push(b);
    manyToManyRelationshipsGridConfig.grid.showContextMenu(this, a, c)
}
function clearManyToManyRelationshipPropertiesGrid() {
    manyToManyRelationshipPropertiesGridConfig.grid.loadData({})
}
function customManyToManyRelationshipSelectControl() {
    var a = document.createElement("select");
    a.setAttribute("id", "filterForCustomManyToManyRelationship");
    a.options[0] = new Option("Custom : All", "all");
    a.options[1] = new Option("Only Custom", "custom");
    a.options[2] = new Option("Not Custom", "notcustom");
    a.setAttribute("title", "Filter Many-To-Many Relationships based on whether they are custom.");
    return a
}
function isCustomManyToManyRelationship(b) {
    var a = document.getElementById("filterForCustomManyToManyRelationship"),
    c = a.options[a.selectedIndex].value;
    switch (c) {
    case "all":
        return true;
        break;
    case "custom":
        return b.IsCustomManyToManyRelationship;
        break;
    case "notcustom":
        return !b.IsCustomManyToManyRelationship
    }
}
function manyToManyRelationshipCustomizablititySelectControl() {
    var a = document.createElement("select");
    a.setAttribute("id", "filterForManyToManyRelationshipCustomizability");
    a.options[0] = new Option("Customizable: All", "all");
    a.options[1] = new Option("Only Customizable", "customizable");
    a.options[2] = new Option("Non-Customizable", "noncustomizable");
    a.setAttribute("title", "Filter Many-To-ManyRelationships based on whether they are customizable");
    return a
}
function manyToManyRelationshipCustomizabilityFilter(b) {
    var a = document.getElementById("filterForManyToManyRelationshipCustomizability"),
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
function manyToManyRelationshipSearchTextBox() {
    var a = document.createElement("input");
    a.setAttribute("type", "text");
    a.setAttribute("id", "manyToManyRelationshipSearchTextBox");
    a.setAttribute("title", "Search Many-To-Many Relationships for matching SchemaName, IntersectEntityName, Entity1LogicalName, Entity1IntersectAttribute, Entity2LogicalName, Entity2IntersectAttribute,  or MetadataId");
    a.value = emptyManyToManyRelationshipSearchValue;
    a.onclick = function () {
        if (this.value == emptyManyToManyRelationshipSearchValue) this.value = ""
    };
    a.onblur = function () {
        if (this.value == "") this.value = emptyManyToManyRelationshipSearchValue
    };
    return a
}
function manyToManyRelationshipStringSearch(b) {
    var a = document.getElementById("manyToManyRelationshipSearchTextBox").value.toLowerCase();
    if (a != emptyManyToManyRelationshipSearchValue.toLowerCase()) {
        var i = b.SchemaName.toLowerCase().indexOf(a) != -1,
        h = b.MetadataId.toLowerCase() == a,
        e = b.IntersectEntityName.toLowerCase().indexOf(a) != -1,
        f = b.Entity1LogicalName.toLowerCase().indexOf(a) != -1,
        c = b.Entity1IntersectAttribute.toLowerCase().indexOf(a) != -1,
        g = b.Entity2LogicalName.toLowerCase().indexOf(a) != -1,
        d = b.Entity2IntersectAttribute.toLowerCase().indexOf(a) != -1;
        if (!i && !h && !e && !f && !c && !g && !d) return false
    }
    return true
}