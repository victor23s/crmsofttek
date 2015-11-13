var emptyPrivilegeIdSearchValue = "   Paste PrivilegeId",
privilegesGridConfig = {
    showComplex: false,
    key: "PrivilegeId",
    onRowSelect: selectPrivilege,
    columns: [{
        property: "Name",
        type: "string",
        label: "Name",
        initialWidth: "175",
        contextMenu: privilegeNameContextMenuCommands
    },
    {
        property: "PrivilegeId",
        type: "string",
        label: "PrivilegeId",
        initialWidth: "275",
        contextMenu: privilegeIdContextMenuCommands
    },
    {
        property: "PrivilegeType",
        type: "string",
        label: "PrivilegeType",
        initialWidth: "100",
        contextMenu: privilegeTypeContextMenuCommands
    },
    {
        property: "CanBeBasic",
        type: "string",
        label: "CanBeBasic",
        initialWidth: "80",
        contextMenu: privilegeCanBeBasicContextMenuCommands
    },
    {
        property: "CanBeDeep",
        type: "string",
        label: "CanBeDeep",
        initialWidth: "80",
        contextMenu: privilegeCanBeDeepContextMenuCommands
    },
    {
        property: "CanBeGlobal",
        type: "string",
        label: "CanBeGlobal",
        initialWidth: "80",
        contextMenu: privilegeCanBeGlobalContextMenuCommands
    },
    {
        property: "CanBeLocal",
        type: "string",
        label: "CanBeLocal",
        initialWidth: "*",
        contextMenu: privilegeCanBeLocalContextMenuCommands
    }],
    filters: [{
        creator: privilegeSearchTextBox,
        event: "onkeyup",
        evaluator: privilegeStringSearch,
        label: ""
    }],
    whenNoRowsVisible: function () {},
    filterAreaHeight: 30,
    nullValueString: "(null)"
};
function selectPrivilege() {}
function privilegeIdContextMenuCommands() {
    var b = 120,
    a = [];
    a.push(copyCommand(this.innerText, "Copy Privilege Id"));
    privilegesGridConfig.grid.showContextMenu(this, a, b)
}
function privilegeNameContextMenuCommands() {
    var b = 140,
    a = [];
    a.push(copyCommand(this.innerText, "Copy Privilege Name"));
    privilegesGridConfig.grid.showContextMenu(this, a, b)
}
function privilegeTypeContextMenuCommands() {
    var b = 150,
    a = [];
    a.push(copyCommand(this.innerText, "Copy Privilege Type"));
    privilegesGridConfig.grid.showContextMenu(this, a, b)
}
function privilegeCanBeBasicContextMenuCommands() {
    var b = 150,
    a = [];
    a.push(copyCommand(this.innerText, "Copy CanBeBasic value"));
    privilegesGridConfig.grid.showContextMenu(this, a, b)
}
function privilegeCanBeDeepContextMenuCommands() {
    var b = 150,
    a = [];
    a.push(copyCommand(this.innerText, "Copy CanBeDeep value"));
    privilegesGridConfig.grid.showContextMenu(this, a, b)
}
function privilegeCanBeGlobalContextMenuCommands() {
    var b = 150,
    a = [];
    a.push(copyCommand(this.innerText, "Copy CanBeGlobal value"));
    privilegesGridConfig.grid.showContextMenu(this, a, b)
}
function privilegeCanBeLocalContextMenuCommands() {
    var b = 150,
    a = [];
    a.push(copyCommand(this.innerText, "Copy CanBeLocal value"));
    privilegesGridConfig.grid.showContextMenu(this, a, b)
}
function privilegeSearchTextBox() {
    var a = document.createElement("input");
    a.setAttribute("type", "text");
    a.setAttribute("id", "privilegeSearchTextBox");
    a.setAttribute("title", "Search Privileges using PrivilegeId");
    a.value = emptyPrivilegeIdSearchValue;
    a.onclick = function () {
        if (this.value == emptyPrivilegeIdSearchValue) this.value = ""
    };
    a.onblur = function () {
        if (this.value == "") this.value = emptyPrivilegeIdSearchValue
    };
    return a
}
function privilegeStringSearch(c) {
    var a = document.getElementById("privilegeSearchTextBox").value.toLowerCase();
    if (a != emptyPrivilegeIdSearchValue.toLowerCase()) {
        var b = c.PrivilegeId.toLowerCase() == a;
        if (!b) return false
    }
    return true
}