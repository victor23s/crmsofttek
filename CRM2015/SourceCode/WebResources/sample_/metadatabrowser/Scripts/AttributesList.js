var emptyAttributeSearchValue = "    Type search value",
currentAttribute, attributeTypesFiltered = false,
attributesGridConfig = {
    initialWidth: .625,
    showComplex: false,
    key: "SchemaName",
    onRowSelect: selectAttribute,
    columns: [{
        property: "SchemaName",
        type: "string",
        label: "Schema Name",
        initialWidth: "200",
        contextMenu: attributeSchemaNameContextMenuCommands
    },
    {
        property: "DisplayName",
        type: "simpleLabel",
        label: "Display Name",
        initialWidth: "200",
        contextMenu: attributeDisplayNameContextMenuCommands
    },
    {
        property: "Description",
        type: "simpleLabel",
        label: "Description",
        initialWidth: "*",
        contextMenu: attributeDescriptionContextMenuCommands
    }],
    filters: [{
        creator: customAttributeSelectControl,
        event: "onchange",
        evaluator: isCustomAttribute,
        label: ""
    },
    {
        creator: attributeCustomizablititySelectControl,
        event: "onchange",
        evaluator: attributeCustomizabilityFilter,
        label: ""
    },
    {
        creator: attributeTypeSelectControl,
        event: "onchange",
        evaluator: attributeTypeFilter,
        label: ""
    },
    {
        creator: attributeSearchTextBox,
        event: "onkeyup",
        evaluator: attributeStringSearch,
        label: ""
    }],
    whenNoRowsVisible: clearAttributePropertiesGrid,
    filterAreaHeight: 30,
    nullValueString: "(null)"
};
function attributeSchemaNameContextMenuCommands() {
    this.parentElement.parentElement.click();
    var c = 130,
    a = [],
    b = copyCommand(this.innerText, "Copy Schema Name");
    a.push(b);
    attributesGridConfig.grid.showContextMenu(this, a, c)
}
function attributeDisplayNameContextMenuCommands() {
    this.parentElement.parentElement.click();
    var a = [],
    c = 130,
    b = copyCommand(this.innerText, "Copy Display Name");
    a.push(b);
    attributesGridConfig.grid.showContextMenu(this, a, c)
}
function attributeDescriptionContextMenuCommands() {
    this.parentElement.parentElement.click();
    var a = [],
    c = 115,
    b = copyCommand(this.innerText, "Copy Description");
    a.push(b);
    attributesGridConfig.grid.showContextMenu(this, a, c)
}
function selectAttribute(b) {
    for (var a = 0; a < entityMetadata.Attributes.length; a++) if (entityMetadata.Attributes[a].SchemaName == b) {
        currentAttribute = entityMetadata.Attributes[a];
        attributePropertiesGridConfig.grid.loadData(currentAttribute);
        attributePropertiesGridConfig.grid.filterRows();
        break
    } ! attributeTypesFiltered && setAttributeTypes()
}
function setAttributeTypes() {
    for (var o = false, k = false, e = false, h = false, i = false, l = false, p = false, f = false, m = false, q = false, d = false, w = false, t = false, u = false, g = false, j = false, v = false, r = false, s = false, c = false, n = false, a = [], b = 0; b < entityMetadata.Attributes.length; b++) {
        var z = entityMetadata.Attributes[b];
        switch (z.AttributeType) {
        case "BigInt":
            if (!o) {
                a.push("BigInt");
                o = true
            }
            break;
        case "Boolean":
            if (!k) {
                a.push("Boolean");
                k = true
            }
            break;
        case "CalendarRules":
            if (!e) {
                a.push("CalendarRules");
                e = true
            }
            break;
        case "Customer":
            if (!h) {
                a.push("Customer");
                h = true
            }
            break;
        case "DateTime":
            if (!i) {
                a.push("DateTime");
                i = true
            }
            break;
        case "Decimal":
            if (!l) {
                a.push("Decimal");
                l = true
            }
            break;
        case "Double":
            if (!p) {
                a.push("Double");
                p = true
            }
            break;
        case "EntityName":
            if (!f) {
                a.push("EntityName");
                f = true
            }
            break;
        case "Integer":
            if (!m) {
                a.push("Integer");
                m = true
            }
            break;
        case "Lookup":
            if (!q) {
                a.push("Lookup");
                q = true
            }
            break;
        case "ManagedProperty":
            if (!d) {
                a.push("ManagedProperty");
                d = true
            }
            break;
        case "Memo":
            if (!w) {
                a.push("Memo");
                w = true
            }
            break;
        case "Money":
            if (!t) {
                a.push("Money");
                t = true
            }
            break;
        case "Owner":
            if (!u) {
                a.push("Owner");
                u = true
            }
            break;
        case "PartyList":
            if (!g) {
                a.push("PartyList");
                g = true
            }
            break;
        case "Picklist":
            if (!j) {
                a.push("Picklist");
                j = true
            }
            break;
        case "State":
            if (!v) {
                a.push("State");
                v = true
            }
            break;
        case "Status":
            if (!r) {
                a.push("Status");
                r = true
            }
            break;
        case "String":
            if (!s) {
                a.push("String");
                s = true
            }
            break;
        case "Uniqueidentifier":
            if (!c) {
                a.push("Uniqueidentifier");
                c = true
            }
            break;
        case "Virtual":
            if (!n) {
                a.push("Virtual");
                n = true
            }
        }
    }
    a.sort();
    for (var y = document.getElementById("filterForAttributeType"), b = 0; b < a.length; b++) {
        var x = a[b];
        y.options[b + 1] = new Option(x, x)
    }
    attributeTypesFiltered = true
}
function clearAttributePropertiesGrid() {
    attributePropertiesGridConfig.grid.loadData({})
}
function isCustomAttribute(b) {
    var a = document.getElementById("filterForCustomAttribute"),
    c = a.options[a.selectedIndex].value;
    switch (c) {
    case "all":
        return true;
        break;
    case "custom":
        return b.IsCustomAttribute;
        break;
    case "notcustom":
        return !b.IsCustomAttribute
    }
}
function customAttributeSelectControl() {
    var a = document.createElement("select");
    a.setAttribute("id", "filterForCustomAttribute");
    a.options[0] = new Option("Custom : All", "all");
    a.options[1] = new Option("Only Custom", "custom");
    a.options[2] = new Option("Not Custom", "notcustom");
    a.setAttribute("title", "Filter attribute based on whether they are custom attributes.");
    return a
}
function attributeCustomizablititySelectControl() {
    var a = document.createElement("select");
    a.setAttribute("id", "filterForAttributeCustomizability");
    a.options[0] = new Option("Customizable: All", "all");
    a.options[1] = new Option("Only Customizable", "customizable");
    a.options[2] = new Option("Non-Customizable", "noncustomizable");
    a.setAttribute("title", "Filter attributes based on whether they are customizable");
    return a
}
function attributeCustomizabilityFilter(b) {
    var a = document.getElementById("filterForAttributeCustomizability"),
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
function attributeTypeSelectControl() {
    var a = document.createElement("select");
    a.id = "filterForAttributeType";
    a.options[0] = new Option("All Types", "all");
    return a
}
function attributeTypeFilter(c) {
    var a = document.getElementById("filterForAttributeType"),
    b = a.options[a.selectedIndex].value;
    return b == "all" ? true : c.AttributeType == b
}
function attributeSearchTextBox() {
    var a = document.createElement("input");
    a.setAttribute("type", "text");
    a.setAttribute("id", "attributeSearchTextBox");
    a.setAttribute("title", "Search attributes for matching SchemaName, DisplayName, or MetadataId");
    a.value = emptyAttributeSearchValue;
    a.onclick = function () {
        if (this.value == emptyAttributeSearchValue) this.value = ""
    };
    a.onblur = function () {
        if (this.value == "") this.value = emptyAttributeSearchValue
    };
    return a
}
function attributeStringSearch(b) {
    var a = document.getElementById("attributeSearchTextBox").value.toLowerCase();
    if (a != emptyAttributeSearchValue.toLowerCase()) {
        var d = b.SchemaName.toLowerCase().indexOf(a) != -1,
        c = b.MetadataId.toLowerCase() == a;
        if (b.DisplayName.UserLocalizedLabel == null) {
            if (!d && !c) return false
        } else {
            var e = b.DisplayName.UserLocalizedLabel.Label.toLowerCase().indexOf(a) != -1;
            if (!d && !e && !c) return false
        }
    }
    return true
}