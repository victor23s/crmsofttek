var emptyManyToManyRelationshipPropertiesSearchValue = "   Type Property Name",
manyToManyRelationshipPropertiesGridConfig = {
    showComplex: true,
    columns: [{
        label: "Property",
        initialWidth: "200",
        contextMenu: manyToManyRelationshipPropertyNameContextMenuCommands
    },
    {
        label: "Value",
        initialWidth: "*",
        contextMenu: manyToManyRelationshipPropertyValueContextMenuCommands
    }],
    filters: [{
        creator: ManyToManyRelationshipPropertieSearchTextBox,
        event: "onkeyup",
        evaluator: ManyToManyRelationshipPropertieStringSearch,
        label: ""
    }],
    filterAreaHeight: 30,
    nullValueString: "(null)"
};
function manyToManyRelationshipPropertyNameContextMenuCommands() {
    var a = [],
    c = 140,
    b = copyCommand(this.innerText, "Copy Property Name");
    a.push(b);
    manyToManyRelationshipPropertiesGridConfig.grid.showContextMenu(this, a, c)
}
function manyToManyRelationshipPropertyValueContextMenuCommands() {
    var a = [],
    c = 140,
    b = copyCommand(this.innerText, "Copy Property Value");
    a.push(b);
    manyToManyRelationshipPropertiesGridConfig.grid.showContextMenu(this, a, c)
}
function ManyToManyRelationshipPropertieSearchTextBox() {
    var a = document.createElement("input");
    a.setAttribute("type", "text");
    a.setAttribute("id", "manyToManyRelationshipPropertiesSearchTextBox");
    a.setAttribute("title", "Filter Properties using property name.");
    a.value = emptyManyToManyRelationshipPropertiesSearchValue;
    a.onclick = function () {
        if (this.value == emptyManyToManyRelationshipPropertiesSearchValue) this.value = ""
    };
    a.onblur = function () {
        if (this.value == "") this.value = emptyManyToManyRelationshipPropertiesSearchValue
    };
    return a
}
function ManyToManyRelationshipPropertieStringSearch(b) {
    var a = document.getElementById("manyToManyRelationshipPropertiesSearchTextBox").value.toLowerCase();
    if (a != emptyManyToManyRelationshipPropertiesSearchValue.toLowerCase()) if (b.toLowerCase().indexOf(a) == -1) return false;
    return true
}