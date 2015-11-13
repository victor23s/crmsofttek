var currentEntity, entityMetadata, emptySearchValue = "    Type search value",
entitiesGridConfig = {
    showComplex: false,
    key: "SchemaName",
    onRowSelect: selectEntity,
    columns: [{
        property: "SchemaName",
        type: "string",
        label: "Schema Name",
        initialWidth: "200",
        contextMenu: schemaNameContextMenuCommands
    },
    {
        property: "DisplayName",
        type: "simpleLabel",
        label: "Display Name",
        initialWidth: "200",
        contextMenu: displayNameContextMenuCommands
    },
    {
        property: "Description",
        type: "simpleLabel",
        label: "Description",
        initialWidth: "*",
        contextMenu: descriptionContextMenuCommands
    }],
    filters: [{
        creator: customEntitySelectControl,
        event: "onchange",
        evaluator: isCustomEntity,
        label: ""
    },
    {
        creator: customizablititySelectControl,
        event: "onchange",
        evaluator: customizabilityFilter,
        label: ""
    },
    {
        creator: searchTextBox,
        event: "onkeyup",
        evaluator: stringSearch,
        label: ""
    },
    {
        creator: intersectSelectControl,
        event: "onchange",
        evaluator: isIntersectEntity,
        label: ""
    },
    {
        creator: ownershipSelectControl,
        event: "onchange",
        evaluator: filterByOwnershipType,
        label: ""
    }],
    whenNoRowsVisible: clearEntityPropertiesGrid,
    filterAreaHeight: 30,
    nullValueString: "(null)"
};
function retrieveAllEntitiesCallback(a) {
    entityMetadata = a;
    entitiesGridConfig.grid.loadData(entityMetadata);
    entityPropertiesGridConfig.grid.loadData(entityMetadata[0])
}
function selectEntity(b) {
    for (var a = 0; a < entityMetadata.length; a++) if (entityMetadata[a].SchemaName == b) {
        currentEntity = entityMetadata[a];
        entityPropertiesGridConfig.grid.loadData(currentEntity);
        entityPropertiesGridConfig.grid.filterRows();
        break
    }
}
function schemaNameContextMenuCommands() {
    this.parentElement.click();
    var e = 130,
    a = [],
    b = "<div onclick=\"parent.viewEntityDetails('" + this.innerText.toLowerCase() + "');\" ";
    b += "onmouseover=\"this.style.backgroundColor='#CEE3F6';\" onmouseout=\"this.style.backgroundColor='#F6F8FA';\" ";
    b += 'style="padding-left:5px; border-bottom:solid black 1px; ">View Details</div>';
    a.push(b);
    if (IsEntityEditable(currentEntity)) {
        var c = '<div onclick="parent.editEntityInDefaultSolution();" ';
        c += "onmouseover=\"this.style.backgroundColor='#CEE3F6';\" onmouseout=\"this.style.backgroundColor='#F6F8FA';\" ";
        c += 'style="padding-left:5px; border-bottom:solid black 1px; ">Edit</div>';
        a.push(c)
    }
    var d = copyCommand(this.innerText, "Copy Schema Name");
    a.push(d);
    entitiesGridConfig.grid.showContextMenu(this, a, e)
}
function descriptionContextMenuCommands() {
    this.parentElement.click();
    var b = [],
    d = 115,
    c = this.innerText.replace(/'/g, "\\'"),
    a = "<div onclick=\"parent.copyToClipboard('" + c + "', this);\" ";
    a += "onmouseover=\"this.style.backgroundColor='#CEE3F6';\" onmouseout=\"this.style.backgroundColor='#F6F8FA';\" ";
    a += 'style="padding-left:5px; ">Copy Description </div>';
    b.push(a);
    entitiesGridConfig.grid.showContextMenu(this, b, d)
}
function displayNameContextMenuCommands() {
    this.parentElement.click();
    var b = [],
    c = 130,
    a = "<div onclick=\"parent.copyToClipboard('" + this.innerText + "', this);\" ";
    a += "onmouseover=\"this.style.backgroundColor='#CEE3F6';\" onmouseout=\"this.style.backgroundColor='#F6F8FA';\" ";
    a += 'style="padding-left:5px; ">Copy Display Name </div>';
    b.push(a);
    entitiesGridConfig.grid.showContextMenu(this, b, c)
}
function isCustomEntity(b) {
    var a = document.getElementById("filterForCustomEntity"),
    c = a.options[a.selectedIndex].value;
    switch (c) {
    case "all":
        return true;
        break;
    case "custom":
        return b.IsCustomEntity;
        break;
    case "notcustom":
        return !b.IsCustomEntity
    }
}
function customEntitySelectControl() {
    var a = document.createElement("select");
    a.setAttribute("id", "filterForCustomEntity");
    a.options[0] = new Option("Custom : All", "all");
    a.options[1] = new Option("Only Custom", "custom");
    a.options[2] = new Option("Not Custom", "notcustom");
    a.setAttribute("title", "Filter entities based on whether they are custom entities.");
    return a
}
function customizablititySelectControl() {
    var a = document.createElement("select");
    a.setAttribute("id", "filterForEntityCustomizability");
    a.options[0] = new Option("Customizable : All", "all");
    a.options[1] = new Option("Only Customizable", "customizable");
    a.options[2] = new Option("Non-Customizable", "noncustomizable");
    a.setAttribute("title", "Filter entities based on whether they are customizable");
    return a
}
function customizabilityFilter(b) {
    var a = document.getElementById("filterForEntityCustomizability"),
    c = a.options[a.selectedIndex].value;
    switch (c) {
    case "all":
        return true;
        break;
    case "customizable":
        return IsEntityCustomizable(b);
        break;
    case "noncustomizable":
        return !IsEntityCustomizable(b)
    }
}
function searchTextBox() {
    var a = document.createElement("input");
    a.setAttribute("type", "text");
    a.setAttribute("id", "searchEntityTextBox");
    a.setAttribute("title", "Search entities for matching SchemaName, DisplayName, ObjectTypeCode, or MetadataId");
    a.value = emptySearchValue;
    a.onclick = function () {
        if (this.value == emptySearchValue) this.value = ""
    };
    a.onblur = function () {
        if (this.value == "") this.value = emptySearchValue
    };
    return a
}
function stringSearch(b) {
    var a = document.getElementById("searchEntityTextBox").value.toLowerCase();
    if (a != emptySearchValue.toLowerCase()) {
        var d = b.SchemaName.toLowerCase().indexOf(a) != -1,
        e = b.ObjectTypeCode == parseInt(a, 10),
        c = b.MetadataId.toLowerCase() == a;
        if (b.DisplayName.UserLocalizedLabel == null) {
            if (!d && !e && !c) return false
        } else {
            var f = b.DisplayName.UserLocalizedLabel.Label.toLowerCase().indexOf(a) != -1;
            if (!d && !f && !e && !c) return false
        }
    }
    return true
}
function intersectSelectControl() {
    var a = document.createElement("select");
    a.setAttribute("id", "filterForIsIntersect");
    a.options[0] = new Option("IsIntersect : All", "all");
    a.options[1] = new Option("Only Intersect", "intersect");
    a.options[2] = new Option("Non-Intersect", "nonintersect");
    a.setAttribute("title", "Filter entities based on whether they are Intersect entities.");
    return a
}
function isIntersectEntity(b) {
    var a = document.getElementById("filterForIsIntersect"),
    c = a.options[a.selectedIndex].value;
    switch (c) {
    case "all":
        return true;
        break;
    case "intersect":
        return b.IsIntersect;
        break;
    case "nonintersect":
        return !b.IsIntersect
    }
}
function ownershipSelectControl() {
    var a = document.createElement("select");
    a.setAttribute("id", "filterbyOwnerShip");
    a.options[0] = new Option("Ownership : All", "all");
    a.options[1] = new Option("Business owned", "BusinessOwned");
    a.options[2] = new Option("No ownership", "None");
    a.options[3] = new Option("Organization owned", "OrganizationOwned");
    a.options[4] = new Option("User owned", "UserOwned");
    a.setAttribute("title", "Filter entities based on the type of Ownership.");
    return a
}
function filterByOwnershipType(a) {
    var b = document.getElementById("filterbyOwnerShip"),
    c = b.options[b.selectedIndex].value;
    switch (c) {
    case "all":
        return true;
        break;
    case "BusinessOwned":
        return a.OwnershipType == "BusinessOwned";
        break;
    case "BusinessParented":
        return a.OwnershipType == "BusinessParented";
        break;
    case "None":
        return a.OwnershipType == "None";
        break;
    case "OrganizationOwned":
        return a.OwnershipType == "OrganizationOwned";
        break;
    case "TeamOwned":
        return a.OwnershipType == "TeamOwned";
        break;
    case "UserOwned":
        return a.OwnershipType == "UserOwned"
    }
}
function clearEntityPropertiesGrid() {
    entityPropertiesGridConfig.grid.loadData({})
}
function viewEntityDetails(a) {
    var b = encodeURIComponent("LogicalName=" + a);
    window.open("EntityMetaDataBrowser.htm?Data=" + b, "_blank", "height=600,width=1024,status=yes,toolbar=no,menubar=yes,resizable=yes")
}
function editEntityInDefaultSolution() {
    window.open(getServerUrl() + "/tools/solution/edit.aspx?def_category=9801&def_type=" + currentEntity.ObjectTypeCode + "&id=%7bfd140aaf-4df4-11dd-bd17-0019b9312238%7d", "_blank", "height=660,width=1020,resizable=yes,location=no,menubar=no,toolbar=no", null)
}