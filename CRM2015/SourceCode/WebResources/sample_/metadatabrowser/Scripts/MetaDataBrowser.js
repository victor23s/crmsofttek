var header, masterContainer, entityList, separator, simpleEntityProperties, EntityListWidth = .6;
function resizeColumns() {
    entityList.style.pixelWidth = masterContainer.offsetWidth * EntityListWidth - 8;
    simpleEntityProperties.style.pixelWidth = masterContainer.offsetWidth * (1 - EntityListWidth) - separator.offsetWidth - 8
}
function sizeHeight() {
    masterContainer.style.pixelHeight = document.body.offsetHeight - header.offsetHeight - 5
}
function startSeparatorDrag() {
    masterContainer.onmousemove = separatorDrag;
    masterContainer.onmouseup = endSeparatorDrag
}
function endSeparatorDrag() {
    masterContainer.onmousemove = null
}
function separatorDrag() {
    EntityListWidth = (event.clientX - masterContainer.offsetLeft) / masterContainer.offsetWidth;
    resizeColumns()
}
window.onload = function () {
    header = document.getElementById("header");
    masterContainer = document.getElementById("masterContainer");
    entityList = document.getElementById("entityList");
    separator = document.getElementById("separator");
    simpleEntityProperties = document.getElementById("simpleEntityProperties");
    resizeColumns();
    sizeHeight();
    SDK.MetaData.RetrieveAllEntitiesAsync(SDK.MetaData.EntityFilters.Entity, false, retrieveAllEntitiesCallback, function (a) {
        alert(a.message)
    });
    entitiesGridConfig.grid = new SDK.DataGrid.simpleGrid(entityList, entitiesGridConfig);
    entityPropertiesGridConfig.grid = new SDK.DataGrid.simpleGrid(simpleEntityProperties, entityPropertiesGridConfig);
    separator.onmousedown = startSeparatorDrag
};
window.onresize = function () {
    resizeColumns();
    sizeHeight()
}