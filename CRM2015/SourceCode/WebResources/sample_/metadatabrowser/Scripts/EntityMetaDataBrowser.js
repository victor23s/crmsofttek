var entityMetadata, EntityHeader, NavigationArea, DetailArea, PropertiesDataContainer, AttributesDataContainer, AttributesListArea, AttributesSeparator, AttributeProperties, OneToManyDataContainer, OneToManyDataListArea, OneToManyDataSeparator, OneToManyDataProperties, ManyToOneDataContainer, ManyToOneDataListArea, ManyToOneDataSeparator, ManyToOneDataProperties, ManyToManyDataContainer, ManyToManyDataListArea, ManyToManyDataSeparator, ManyToManyDataProperties, PrivilegesDataContainer, PropertiesNavButton, AttributesNavButton, OneToManyRelationshipsNavButton, ManyToOneRelationshipsNavButton, ManyToManyRelationshipsNavButton, PrivilegesNavButton;
onload = function () {
    EntityHeader = document.getElementById("EntityHeader");
    NavigationArea = document.getElementById("NavigationArea");
    DetailArea = document.getElementById("DetailArea");
    PropertiesDataContainer = document.getElementById("PropertiesDataContainer");
    AttributesDataContainer = document.getElementById("AttributesDataContainer");
    AttributesListArea = document.getElementById("AttributesListArea");
    AttributesSeparator = document.getElementById("AttributesSeparator");
    AttributesSeparator.onmousedown = onAttributesSeparatorDragStart;
    AttributeProperties = document.getElementById("AttributeProperties");
    OneToManyDataContainer = document.getElementById("OneToManyDataContainer");
    OneToManyDataListArea = document.getElementById("OneToManyDataListArea");
    OneToManyDataSeparator = document.getElementById("OneToManyDataSeparator");
    OneToManyDataSeparator.onmousedown = oneToManySeparatorDragStart;
    OneToManyDataProperties = document.getElementById("OneToManyDataProperties");
    ManyToOneDataContainer = document.getElementById("ManyToOneDataContainer");
    ManyToOneDataListArea = document.getElementById("ManyToOneDataListArea");
    ManyToOneDataSeparator = document.getElementById("ManyToOneDataSeparator");
    ManyToOneDataSeparator.onmousedown = manyToOneSeparatorDragStart;
    ManyToOneDataProperties = document.getElementById("ManyToOneDataProperties");
    ManyToManyDataContainer = document.getElementById("ManyToManyDataContainer");
    ManyToManyDataListArea = document.getElementById("ManyToManyDataListArea");
    ManyToManyDataSeparator = document.getElementById("ManyToManyDataSeparator");
    ManyToManyDataSeparator.onmousedown = manyToManySeparatorDragStart;
    ManyToManyDataProperties = document.getElementById("ManyToManyDataProperties");
    PrivilegesDataContainer = document.getElementById("PrivilegesDataContainer");
    PropertiesNavButton = document.getElementById("PropertiesNavButton");
    PropertiesNavButton.onclick = navigateToArea;
    AttributesNavButton = document.getElementById("AttributesNavButton");
    AttributesNavButton.onclick = navigateToArea;
    OneToManyRelationshipsNavButton = document.getElementById("OneToManyRelationshipsNavButton");
    OneToManyRelationshipsNavButton.onclick = navigateToArea;
    ManyToOneRelationshipsNavButton = document.getElementById("ManyToOneRelationshipsNavButton");
    ManyToOneRelationshipsNavButton.onclick = navigateToArea;
    ManyToManyRelationshipsNavButton = document.getElementById("ManyToManyRelationshipsNavButton");
    ManyToManyRelationshipsNavButton.onclick = navigateToArea;
    PrivilegesNavButton = document.getElementById("PrivilegesNavButton");
    PrivilegesNavButton.onclick = navigateToArea;
    var a = getDataParams();
    try {
        SDK.MetaData.RetrieveEntityAsync(SDK.MetaData.EntityFilters.All, a.LogicalName, null, false, retrieveEntityCallback, function (a) {
            alert(a.message)
        })
    } catch(b) {
        errorAndClose()
    }
    entityPropertiesGridConfig.grid = new SDK.DataGrid.simpleGrid(PropertiesDataContainer, entityPropertiesGridConfig);
    attributesGridConfig.grid = new SDK.DataGrid.simpleGrid(AttributesListArea, attributesGridConfig);
    attributePropertiesGridConfig.grid = new SDK.DataGrid.simpleGrid(AttributeProperties, attributePropertiesGridConfig);
    oneToManyRelationshipsGridConfig.grid = new SDK.DataGrid.simpleGrid(OneToManyDataListArea, oneToManyRelationshipsGridConfig);
    oneToManyRelationshipPropertiesGridConfig.grid = new SDK.DataGrid.simpleGrid(OneToManyDataProperties, oneToManyRelationshipPropertiesGridConfig);
    manyToOneRelationshipsGridConfig.grid = new SDK.DataGrid.simpleGrid(ManyToOneDataListArea, manyToOneRelationshipsGridConfig);
    manyToOneRelationshipPropertiesGridConfig.grid = new SDK.DataGrid.simpleGrid(ManyToOneDataProperties, manyToOneRelationshipPropertiesGridConfig);
    manyToManyRelationshipsGridConfig.grid = new SDK.DataGrid.simpleGrid(ManyToManyDataListArea, manyToManyRelationshipsGridConfig);
    manyToManyRelationshipPropertiesGridConfig.grid = new SDK.DataGrid.simpleGrid(ManyToManyDataProperties, manyToManyRelationshipPropertiesGridConfig);
    privilegesGridConfig.grid = new SDK.DataGrid.simpleGrid(PrivilegesDataContainer, privilegesGridConfig);
    sizeLayout()
};
onresize = function () {
    sizeLayout()
};
function sizeLayout() {
    var a = document.body.offsetHeight - EntityHeader.offsetHeight;
    NavigationArea.style.pixelHeight = a;
    DetailArea.style.pixelHeight = a - 2;
    DetailArea.style.pixelWidth = document.body.offsetWidth - (NavigationArea.offsetWidth + 2);
    sizeAttributeColumns();
    sizeOneToManyColumns();
    sizeManyToOneColumns();
    sizeManyToManyColumns()
}
function sizeAttributeColumns() {
    AttributesListArea.style.pixelWidth = AttributesDataContainer.offsetWidth * attributesGridConfig.initialWidth;
    AttributeProperties.style.pixelWidth = AttributesDataContainer.offsetWidth - (AttributesListArea.offsetWidth + AttributesSeparator.offsetWidth + 2)
}
function sizeOneToManyColumns() {
    OneToManyDataListArea.style.pixelWidth = OneToManyDataContainer.offsetWidth * oneToManyRelationshipsGridConfig.initialWidth;
    OneToManyDataProperties.style.pixelWidth = OneToManyDataContainer.offsetWidth - (OneToManyDataListArea.offsetWidth + OneToManyDataSeparator.offsetWidth + 2)
}
function sizeManyToOneColumns() {
    ManyToOneDataListArea.style.pixelWidth = ManyToOneDataContainer.offsetWidth * manyToOneRelationshipsGridConfig.initialWidth;
    ManyToOneDataProperties.style.pixelWidth = ManyToOneDataContainer.offsetWidth - (ManyToOneDataListArea.offsetWidth + ManyToOneDataSeparator.offsetWidth + 2)
}
function sizeManyToManyColumns() {
    ManyToManyDataListArea.style.pixelWidth = ManyToManyDataContainer.offsetWidth * manyToManyRelationshipsGridConfig.initialWidth;
    ManyToManyDataProperties.style.pixelWidth = ManyToManyDataContainer.offsetWidth - (ManyToManyDataListArea.offsetWidth + ManyToManyDataSeparator.offsetWidth + 2)
}
function retrieveEntityCallback(a) {
    entityMetadata = a;
    entityPropertiesGridConfig.grid.loadData(entityMetadata);
    if (entityMetadata.Attributes.length > 0) AttributesNavButton.className = "navigationButton";
    if (entityMetadata.OneToManyRelationships.length > 0) OneToManyRelationshipsNavButton.className = "navigationButton";
    if (entityMetadata.ManyToOneRelationships.length > 0) ManyToOneRelationshipsNavButton.className = "navigationButton";
    if (entityMetadata.ManyToManyRelationships.length > 0) ManyToManyRelationshipsNavButton.className = "navigationButton";
    if (entityMetadata.Privileges.length > 0) PrivilegesNavButton.className = "navigationButton";
    setDocumentTitle()
}
function navigateToArea() {
    var e = [PropertiesNavButton, AttributesNavButton, OneToManyRelationshipsNavButton, ManyToOneRelationshipsNavButton, ManyToManyRelationshipsNavButton, PrivilegesNavButton];
    if (this.className == "navigationButton") {
        for (var a = 0; a < e.length; a++) if (e[a].className == "selectedNavigationButton") e[a].className = "navigationButton";
        this.className = "selectedNavigationButton";
        switch (this.id) {
        case "PropertiesNavButton":
            showArea(PropertiesDataContainer);
            break;
        case "AttributesNavButton":
            showArea(AttributesDataContainer);
            attributesGridConfig.grid.loadData(entityMetadata.Attributes);
            attributesGridConfig.grid.filterRows();
            attributePropertiesGridConfig.grid.loadData(entityMetadata.Attributes[0]);
            attributePropertiesGridConfig.grid.filterRows();
            sizeAttributeColumns();
            break;
        case "OneToManyRelationshipsNavButton":
            showArea(OneToManyDataContainer);
            for (var d = [], a = 0; a < entityMetadata.OneToManyRelationships.length; a++) d.push(entityMetadata.OneToManyRelationships[a].OneToManyRelationshipMetadata);
            oneToManyRelationshipsGridConfig.grid.loadData(d);
            oneToManyRelationshipsGridConfig.grid.filterRows();
            oneToManyRelationshipPropertiesGridConfig.grid.loadData(d[0]);
            oneToManyRelationshipPropertiesGridConfig.grid.filterRows();
            sizeOneToManyColumns();
            break;
        case "ManyToOneRelationshipsNavButton":
            showArea(ManyToOneDataContainer);
            for (var c = [], a = 0; a < entityMetadata.ManyToOneRelationships.length; a++) c.push(entityMetadata.ManyToOneRelationships[a].OneToManyRelationshipMetadata);
            manyToOneRelationshipsGridConfig.grid.loadData(c);
            manyToOneRelationshipsGridConfig.grid.filterRows();
            manyToOneRelationshipPropertiesGridConfig.grid.loadData(c[0]);
            manyToOneRelationshipPropertiesGridConfig.grid.filterRows();
            sizeManyToOneColumns();
            break;
        case "ManyToManyRelationshipsNavButton":
            showArea(ManyToManyDataContainer);
            for (var b = [], a = 0; a < entityMetadata.ManyToManyRelationships.length; a++) b.push(entityMetadata.ManyToManyRelationships[a].ManyToManyRelationshipMetadata);
            manyToManyRelationshipsGridConfig.grid.loadData(b);
            manyToManyRelationshipsGridConfig.grid.filterRows();
            manyToManyRelationshipPropertiesGridConfig.grid.loadData(b[0]);
            manyToManyRelationshipPropertiesGridConfig.grid.filterRows();
            sizeManyToManyColumns();
            break;
        case "PrivilegesNavButton":
            showArea(PrivilegesDataContainer);
            for (var f = [], a = 0; a < entityMetadata.Privileges.length; a++) f.push(entityMetadata.Privileges[a].SecurityPrivilegeMetadata);
            privilegesGridConfig.grid.loadData(f);
            privilegesGridConfig.grid.filterRows()
        }
    }
}
function showArea(c) {
    for (var b = [PropertiesDataContainer, AttributesDataContainer, OneToManyDataContainer, ManyToOneDataContainer, ManyToManyDataContainer, PrivilegesDataContainer], a = 0; a < b.length; a++) b[a].className = "DetailItem";
    c.className = "SelectedDetailItem"
}
function getDataParams() {
    var a = [];
    if (location.search != "") {
        a = location.search.substr(1).split("&");
        for (var b in a) a[b] = a[b].replace(/\+/g, " ").split("=");
        var e = false;
        for (var b in a) if (a[b][0].toLowerCase() == "data") {
            e = true;
            var d = decodeURIComponent(a[b][1]).split("&"),
            c = [];
            for (var b in d) c.push(d[b].replace(/\+/g, " ").split("="));
            if (c[0][0] == "LogicalName") return {
                LogicalName: c[0][1]
            };
            else errorAndClose()
        } ! e && errorAndClose()
    } else errorAndClose()
}
function errorAndClose() {
    var a = "This page requires parameters to be passed to it so that it can retrieve information about a specific entity.";
    alert(a);
    window.close()
}
function setDocumentTitle() {
    var b = entityMetadata.DisplayName.UserLocalizedLabel != null ? entityMetadata.DisplayName.UserLocalizedLabel.Label : entityMetadata.SchemaName,
    a = b + " Entity Metadata";
    EntityHeader.innerText = a;
    document.title = a
}
function onAttributesSeparatorDragStart() {
    AttributesDataContainer.onmousemove = onAttributesSeparatorDrag;
    AttributesDataContainer.onmouseup = onAttributesSeparatorDragEnd
}
function onAttributesSeparatorDragEnd() {
    AttributesDataContainer.onmousemove = null
}
function onAttributesSeparatorDrag() {
    attributesGridConfig.initialWidth = (event.clientX - AttributesDataContainer.offsetLeft) / AttributesDataContainer.offsetWidth;
    sizeAttributeColumns()
}
function oneToManySeparatorDragStart() {
    OneToManyDataContainer.onmousemove = oneToManySeparatorDrag;
    OneToManyDataContainer.onmouseup = oneToManySeparatorDragEnd
}
function oneToManySeparatorDragEnd() {
    OneToManyDataContainer.onmousemove = null
}
function oneToManySeparatorDrag() {
    oneToManyRelationshipsGridConfig.initialWidth = (event.clientX - OneToManyDataContainer.offsetLeft) / OneToManyDataContainer.offsetWidth;
    sizeOneToManyColumns()
}
function manyToOneSeparatorDragStart() {
    ManyToOneDataContainer.onmousemove = manyToOneSeparatorDrag;
    ManyToOneDataContainer.onmouseup = manyToOneSeparatorDragEnd
}
function manyToOneSeparatorDragEnd() {
    ManyToOneDataContainer.onmousemove = null
}
function manyToOneSeparatorDrag() {
    manyToOneRelationshipsGridConfig.initialWidth = (event.clientX - ManyToOneDataContainer.offsetLeft) / ManyToOneDataContainer.offsetWidth;
    sizeManyToOneColumns()
}
function manyToManySeparatorDragStart() {
    ManyToManyDataContainer.onmousemove = manyToManySeparatorDrag;
    ManyToManyDataContainer.onmouseup = manyToManySeparatorDragEnd
}
function manyToManySeparatorDragEnd() {
    ManyToManyDataContainer.onmousemove = null
}
function manyToManySeparatorDrag() {
    manyToManyRelationshipsGridConfig.initialWidth = (event.clientX - ManyToManyDataContainer.offsetLeft) / ManyToManyDataContainer.offsetWidth;
    sizeManyToManyColumns()
}