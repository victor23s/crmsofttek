var emptyManyToOneRelationshipPropertiesSearchValue = "   Type Property Name",
manyToOneRelationshipPropertiesGridConfig = {
    showComplex: true,
    columns: [{
        label: "Property",
        initialWidth: "200",
        contextMenu: manyToOneRelationshipPropertyNameContextMenuCommands
    },
    {
        label: "Value",
        initialWidth: "*",
        contextMenu: manyToOneRelationshipPropertyValueContextMenuCommands
    }],
    filters: [{
        creator: manyToOneRelationshipPropertySearchTextBox,
        event: "onkeyup",
        evaluator: manyToOneRelationshipPropertyStringSearch,
        label: ""
    }],
    filterAreaHeight: 30,
    nullValueString: "(null)"
};
function manyToOneRelationshipPropertyNameContextMenuCommands() {
    var a = [],
    c = 140,
    b = copyCommand(this.innerText, "Copy Property Name ");
    a.push(b);
    manyToOneRelationshipPropertiesGridConfig.grid.showContextMenu(this, a, c)
}
function manyToOneRelationshipPropertyValueContextMenuCommands() {
    var a = [],
    c = 140,
    b = copyCommand(this.innerText, "Copy Property Value");
    a.push(b);
    manyToOneRelationshipPropertiesGridConfig.grid.showContextMenu(this, a, c)
}
function manyToOneRelationshipPropertySearchTextBox() {
    var a = document.createElement("input");
    a.setAttribute("type", "text");
    a.setAttribute("id", "manyToOneRelationshipPropertiesSearchTextBox");
    a.setAttribute("title", "Filter Properties using property name.");
    a.value = emptyManyToOneRelationshipPropertiesSearchValue;
    a.onclick = function () {
        if (this.value == emptyManyToOneRelationshipPropertiesSearchValue) this.value = ""
    };
    a.onblur = function () {
        if (this.value == "") this.value = emptyManyToOneRelationshipPropertiesSearchValue
    };
    return a
}
function manyToOneRelationshipPropertyStringSearch(b) {
    var a = document.getElementById("manyToOneRelationshipPropertiesSearchTextBox").value.toLowerCase();
    if (a != emptyManyToOneRelationshipPropertiesSearchValue.toLowerCase()) if (b.toLowerCase().indexOf(a) == -1) return false;
    return true
}