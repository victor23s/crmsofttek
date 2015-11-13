 // =====================================================================
//  This file is part of the Microsoft Dynamics CRM SDK code samples.
//
//  Copyright (C) Microsoft Corporation.  All rights reserved.
//
//  This source code is intended only as a supplement to Microsoft
//  Development Tools and/or on-line documentation.  See these other
//  materials for detailed information regarding Microsoft code samples.
//
//  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
//  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
//  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//  PARTICULAR PURPOSE.
// =====================================================================

/*
This library creates the grid control
*/

if (typeof(SDK) == "undefined") {
    SDK = {
        __namespace: true
    };
}
SDK.DataGrid = {
    simpleGrid: function (parentElement, config) {
        //Define functions START
        this.loadData = function (data) { ///<summary>
            /// Loads the data into the grid
            ///</summary>
            this._data = data;
            this.clearTable();
            this.writeTable();
            if (this.dataTable.children[0] != null) {
                this.dataTable.children[0].click();
            }
        };

        this.writeTable = function () { ///<summary>
            /// Writes the data into the table
            ///</summary>
            //Data is an array
            if (this._data instanceof Array) {
                for (var i = 0; i < this._data.length; i++) {
                    var item = this._data[i];
                    var row = document.createElement("tr");
                    row.className = "dataRow";
                    //Set the row id based on the configuration key
                    row.id = item[config.key];
                    row.onclick = this.selectRow;
                    //Allows for setting expando value flags in the row
                    if (typeof config.setFlags != "undefined") {
                        for (var x = 0; x < config.setFlags.length; x++) {
                            row.setAttribute(config.setFlags[x].flag, config.setFlags[x].setter(item));
                        }
                    }
                    //Add cells to each row based on the configuration data.
                    for (var n = 0; n < config.columns.length; n++) {
                        var propertyName = config.columns[n].property;
                        var initialWidth = parseInt(config.columns[n].initialWidth, 10);
                        var cell = document.createElement("td");
                        cell.className = "dataCell";
                        var value = document.createElement("div");
                        value.className = "dataValue";
                        //Allows for display rules for types of data.
                        switch (config.columns[n].type) {
                        case "simpleLabel":
                            value.innerText = (item[propertyName].UserLocalizedLabel == null) ? config.nullValueString : item[propertyName].UserLocalizedLabel.Label;
                            break;
                        default:
                            value.innerText = item[propertyName];
                            break;
                        }
                        //Show Popup context menu for div contents of cell
                        if (typeof config.columns[n].contextMenu != "undefined") {
                            var showCommands = config.columns[n].contextMenu;
                            value.onmousedown = showCommands;
                            value.style.cursor = "pointer";
                            value.title = "Right click for actions.";
                        }
                        cell.appendChild(value);
                        if (!isNaN(initialWidth)) {
                            cell.style.width = initialWidth + "px";
                            cell.style.maxWidth = initialWidth + "px";
                        }
                        row.appendChild(cell);
                    }
                    this.dataTable.appendChild(row);
                }
            }
            //Data is an object
            else {
                for (var i in this._data) {
                    if (i == "ExtensionData") {
                        continue;
                    }
                    var property = this._data[i];
                    //Don't include Array properties if showComplex == false
                    if (!config.showComplex) {
                        if (property instanceof Array) {
                            continue;
                        }
                    }
                    //Don't include any functions
                    if ((property instanceof Function) == false) {
                        var row = document.createElement("tr");
                        row.className = "dataRow";
                        //Appending 'Row' in an effort to prevent duplicate id values.
                        row.id = i + "Row";
                        for (var n in config.columns) {
                            var initialWidth = parseInt(config.columns[n].initialWidth, 10);
                            var cell = document.createElement("td");
                            cell.className = "dataCell";
                            var value = document.createElement("div");
                            value.className = "dataValue";
                            //The first column is the property name;
                            if (n == 0) {
                                value.innerText = i;
                            }
                            else {
                                if (property == null) {
                                    value.innerText = config.nullValueString;
                                }
                                else {
                                    //How property values are rendered depends on the configuration setting
                                    if (config.showComplex) {
                                        this.renderComplexObjects(value, property, i);
                                    }
                                    else {
                                        this.renderSimpleObjects(value, property, i);
                                    }

                                }
                            }
                            //Show Popup context menu for div contents of cell
                            if (typeof config.columns[n].contextMenu != "undefined") {
                                if (config.showComplex && n > 0 && property != null) {
                                    //Context menus don't work with complex values
                                    if ((typeof property.CanBeChanged == "undefined") && //BooleanManagedProperty
                                    (typeof property.LocalizedLabels == "undefined") && //Label
                                    (typeof property.OptionSetType == "undefined") && //OptionSet
                                    (typeof property.Behavior == "undefined") && //AssociatedMenuConfiguration
                                    (typeof property.Assign == "undefined")) //CascadeConfiguration
                                    {
                                        var showCommands = config.columns[n].contextMenu;
                                        value.onmousedown = showCommands;
                                        value.style.cursor = "pointer";
                                        value.title = "Right click for actions.";
                                    }
                                }
                                else {
                                    var showCommands = config.columns[n].contextMenu;
                                    value.onmousedown = showCommands;
                                    value.style.cursor = "pointer";
                                    value.title = "Right click for actions.";
                                }
                            }
                            cell.appendChild(value);
                            if (!isNaN(initialWidth)) {
                                cell.style.width = initialWidth + "px";
                            }
                            row.appendChild(cell);
                        }
                        this.dataTable.appendChild(row);
                    }
                }
            }
            // Hide the loading panel
            this.loadingDiv.style.display = "none";
        };

        this.clearTable = function () { ///<summary>
            /// Clears all rows from the dataTable
            ///</summary>
            for (var i = this.dataTable.children.length; i > 0; i--) {
                this.dataTable.removeChild(this.dataTable.children[i - 1]);
            }
        };

        this.refresh = function () { ///<summary>
            /// Refreshes the table
            ///</summary>
            this.clearTable();
            this.writeTable();
            this.filterRows();
        };

        this.filterRows = function () {
            ///<summary
            /// Filters the rows in the display table
            ///</summary>
            // Arrays treated differently than objects
            if (config.grid._data instanceof Array) {
                var visibleRows = [];
                for (var i = 0; i < config.grid._data.length; i++) {
                    var item = config.grid._data[i];
                    //The row id value is the config.key value
                    var row = config.grid.dataTable.children.namedItem(item[config.key])
                    //var row = itemRows.namedItem(item[config.key]);
                    var show = true;
                    for (var n = 0; n < config.filters.length; n++) {
                        //Loop through the configured filters.
                        //If any of them return false the item will not be shown.
                        show = config.filters[n].evaluator(item);
                        if (!show) {
                            break;
                        }
                    }
                    if (show) {
                        row.style.display = "block";
                        visibleRows.push(row);
                    }
                    else {
                        row.style.display = "none";
                    }
                }
                if (visibleRows.length > 0) {
                    visibleRows[0].click();
                }
                else {
                    config.whenNoRowsVisible();
                }
            }
            else {
                //The data source is an object so loop through properties
                var visibleRows = [];
                for (var i in config.grid._data) {
                    var value = config.grid._data[i];
                    //Row is appended to the property name to set the id for the row
                    // in an attempt to reduce the chance that a duplicate id attribute is set.
                    //var row = itemRows.namedItem(i + "Row");
                    var row = config.grid.dataTable.children.namedItem(i + "Row")
                    if (row != null) {
                        var show = true;
                        for (var n = 0; n < config.filters.length; n++) {
                            show = config.filters[n].evaluator(i, value);
                            if (!show) {
                                break;
                            }
                        }
                        if (show) {
                            row.style.display = "block";
                            visibleRows.push(row);
                        }
                        else {
                            row.style.display = "none";
                        }
                    }
                }
                if (visibleRows.length > 0) {
                    visibleRows[0].click();
                }
            }
        };

        this.renderSimpleObjects = function (value, property, propertyName) { ///<summary>
            /// Renders the value for simple objects
            ///</summary>
            switch (typeof property) {
            case "object":
                if (property instanceof Array) {
                    //just provide a count of the array length + propertyName
                    value.innerText = property.length + " " + propertyName;
                }
                else {
                    //BooleanManagedProperty
                    if (typeof property.CanBeChanged != "undefined") {
                        value.innerText = property.Value;
                    }
                    else {
                        //Label
                        if (typeof property.LocalizedLabels != "undefined") {
                            value.innerText = (property.UserLocalizedLabel == null) ? config.nullValueString : property.UserLocalizedLabel.Label;
                        }
                        else {
                            //This shouldn't happen if all types are accounted for.
                            if (SDK.DataGrid.isEmpty(property)) {
                                value.innerText = config.nullValueString;
                            }
                            else {
                                //SimpleObjects
                                value.innerText = "unrecognized object";
                            }
                        }
                    }
                }
                break;
            default:
                //This should handle String, Boolean, or Number types.
                value.innerText = property;
                break;
            }
        };

        this.renderComplexObjects = function (value, property, propertyName) { ///<summary>
            /// Renders the value for complex objects
            ///</summary>
            switch (typeof property) {
            case "object":
                if (propertyName != "Targets") {
                    if (property instanceof Array) {
                        if (property.length > 0) {
                            //Allow clicking on an array to perform a configurable action
                            var actionfound = false;

                            for (var i = 0; i < config.arrayPropertyActions.length; i++) {
                                if (config.arrayPropertyActions[i].property == propertyName) {
                                    value.className = "propertyNavigationLink";
                                    value.innerText = property.length + " " + propertyName;
                                    value.onclick = config.arrayPropertyActions[i].action;
                                    actionfound = true;
                                    break;
                                }
                            }
                            if (!actionfound) {
                                value.innerText = property.length + " " + propertyName;
                            }
                        }
                        else {
                            value.innerText = "No " + propertyName;
                        }
                    }
                    else {
                        //BooleanManagedProperty
                        if (typeof property.CanBeChanged != "undefined") {
                            //value.innerText = property.Value;
                            value.appendChild(this.renderExpandingCell(property, property.Value));
                        }
                        else {
                            //Label
                            if (typeof property.LocalizedLabels != "undefined") {
                                //value.innerText = (property.UserLocalizedLabel == null) ? config.nullValueString : property.UserLocalizedLabel.Label;
                                if (property.UserLocalizedLabel == null) {
                                    value.innerText = config.nullValueString;
                                }
                                else {
                                    value.appendChild(this.renderExpandingCell(property, property.UserLocalizedLabel.Label));
                                }
                            }
                            else {
                                //OptionSet
                                if (typeof property.OptionSetType != "undefined") {
                                    value.appendChild(this.renderOptionSetProperty(property));
                                }
                                else {
                                    //AssociatedMenuConfiguration
                                    if (typeof property.Behavior != "undefined") {
                                        value.appendChild(this.renderSimpleObjectPropertyTable(property));
                                    }
                                    else {
                                        //CascadeConfiguration
                                        if (typeof property.Assign != "undefined") {
                                            value.appendChild(this.renderSimpleObjectPropertyTable(property));
                                        }
                                        else {
                                            // Some empty objects that should be null
                                            if (SDK.DataGrid.isEmpty(property)) {
                                                value.innerText = config.nullValueString;
                                            }
                                            else {
                                                //Complex Objects
                                                //This shouldn't happen if all types are accounted for.
                                                value.innerText = "unrecognized object";
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                else {

                    value.innerText = property.toString();

                }
                break;
            default:
                //This should handle String, Boolean, or Number types.
                value.innerText = property;
                break;
            }
        };

        this.selectRow = function () { ///<summary>
            ///	Calls the configuration function when a row is clicked
            ///</summary>
            var selectedRow = this;
            var rows = config.grid.dataTable.children.tags("tr");
            for (var i = 0; i < rows.length; i++) {
                rows.item(i).className = "dataRow";
            }
            selectedRow.className = "selectedDataRow";
            config.onRowSelect(selectedRow.id);
        };

        this.showContextMenu = function (srcElement, commands, popupWidth) { ///<summary>
            ///	Displays a popup based on grid configuration.
            /// This method is called from the method specified in the configuration column contextmenu function
            ///</summary>
            if (event.button == 2) {
                var oPopup = window.createPopup();
                var oPopupBody = oPopup.document.body;
                oPopupBody.oncontextmenu = function () {
                    return false;
                };
                oPopupBody.onselectstart = function () {
                    return false;
                };
                //Including style information inline.
                oPopupBody.style.border = "solid black 1px";
                var contextHTML = "<div style=\"font-family: Segoe UI; font-size: x-small; background-color: #F6F8FA; cursor:pointer; margin:0; padding:0; \">";
                for (var i = 0; i < commands.length; i++) {
                    contextHTML += commands[i];
                }
                contextHTML += "</div>";
                oPopupBody.innerHTML = contextHTML;
                //Get the correct height for the popup
                oPopup.show(0, 0, popupWidth, 0);
                var actualHeight = oPopupBody.scrollHeight + 2;
                oPopup.hide();
                oPopup.show(event.screenX, event.screenY, popupWidth, actualHeight);
            }
        };

        this.toggleLabelDisplay = function () { ///<summary>
            /// Provides the capability to expand and contract complex property information
            ///</summary>
            var showComplex;
            if (this.innerText == "(+)") {
                this.innerText = "(-)"
                showComplex = true;
            }
            else {
                this.innerText = "(+)"
                showComplex = false;
            }
            var simpleLabel = this.nextSibling.firstChild;
            var complexLabel = simpleLabel.nextSibling;
            if (showComplex) {
                complexLabel.style.display = "block";
                simpleLabel.style.display = "none";
            }
            else {
                complexLabel.style.display = "none";
                simpleLabel.style.display = "block";
            }
        };

        this.renderExpandingCell = function (oProperty, displayProperty) { ///<summary>
            /// Renders an expanding cell for complex properties
            ///</summary>
            var container = document.createElement("div");
            var table = document.createElement("table");
            table.setAttribute("rules", "groups");
            table.className = "expandoTable"
            var row = document.createElement("tr");
            var toggleCell = document.createElement("td");
            toggleCell.innerText = "(+)";
            toggleCell.className = "toggleLink";
            toggleCell.onclick = this.toggleLabelDisplay;
            row.appendChild(toggleCell);
            var dataCell = document.createElement("td")
            var simpleValue = document.createElement("div");
            simpleValue.className = "simpleLabel";
            simpleValue.innerText = displayProperty;
            dataCell.appendChild(simpleValue);
            var complexValue = document.createElement("div");
            complexValue.className = "complexLabel";
            var detailTable = document.createElement("table");
            detailTable.setAttribute("rules", "groups");
            detailTable.className = "detailTable";
            for (var propertyName in oProperty) {
                var propertyRow = document.createElement("tr");
                var propertyNameCell = document.createElement("td");
                propertyNameCell.className = "detailCell";
                propertyNameCell.innerText = propertyName + ":";
                propertyRow.appendChild(propertyNameCell);
                var propertyValueCell = document.createElement("td");
                switch (typeof oProperty[propertyName]) {
                case "object":
                    if (oProperty[propertyName] == null) {
                        propertyValueCell.innerText = config.nullValueString;
                    }
                    else {
                        if (propertyName == "LocalizedLabels") {
                            var LocalizedLabels = oProperty[propertyName];
                            var number = LocalizedLabels.length
                            var text = (number == 1) ? number + " Localized Label" : number + " Localized Labels";
                            propertyValueCell.appendChild(this.renderExpandingCell(LocalizedLabels, text));
                        }
                        else {
                            propertyValueCell.appendChild(this.renderSimpleObjectPropertyTable(oProperty[propertyName]));
                        }
                    }
                    break;
                default:
                    propertyValueCell.innerText = oProperty[propertyName];
                    break;
                }
                propertyRow.appendChild(propertyValueCell);
                detailTable.appendChild(propertyRow);
            }
            complexValue.appendChild(detailTable);
            dataCell.appendChild(complexValue);
            row.appendChild(dataCell);
            table.appendChild(row);
            container.appendChild(table);
            return container;
        };

        this.renderSimpleObjectPropertyTable = function (object) { ///<summary>
            /// Renders a simple object property table
            ///</summary>
            var table = document.createElement("table");
            table.setAttribute("rules", "groups");
            table.className = "detailTable";
            for (var propertyName in object) {
                var row = document.createElement("tr");
                var propertyNameCell = document.createElement("td");
                propertyNameCell.className = "detailCell";
                propertyNameCell.innerText = propertyName + ":";
                row.appendChild(propertyNameCell);
                var propertyValueCell = document.createElement("td");
                if (object[propertyName] == null) {
                    propertyValueCell.innerText = config.nullValueString;
                }
                else {
                    if (typeof object[propertyName] == "object") {
                        if (typeof object[propertyName].LocalizedLabels != "undefined") {
                            if (object[propertyName].UserLocalizedLabel == null) {
                                propertyValueCell.innerText = config.nullValueString;
                            }
                            else {
                                propertyValueCell.appendChild(this.renderExpandingCell(object[propertyName], object[propertyName].UserLocalizedLabel.Label));
                            }
                        }
                        else {
                            propertyValueCell.appendChild(this.renderSimpleObjectPropertyTable(object[propertyName]));
                        }
                    }
                    else {
                        propertyValueCell.innerText = object[propertyName].toString();
                    }
                }
                row.appendChild(propertyValueCell);
                table.appendChild(row);
            }
            return table;
        };

        this.renderOptionSetProperty = function (optionsetProperty) { ///<summary>
            /// Renders an optionset property
            ///</summary>
            var container = document.createElement("div");
            var table = document.createElement("table");
            table.setAttribute("rules", "groups");
            table.className = "expandoTable"
            var row = document.createElement("tr");
            var toggleCell = document.createElement("td");
            toggleCell.innerText = "(+)";
            toggleCell.className = "toggleLink";
            toggleCell.onclick = this.toggleLabelDisplay;
            row.appendChild(toggleCell);
            var dataCell = document.createElement("td")
            var simpleValue = document.createElement("div");
            if (typeof optionsetProperty.Options != "undefined") {
                var simpleOptionsTable = document.createElement("table")
                for (var i = 0; i < optionsetProperty.Options.length; i++) {
                    var simpleOptionMetadataRow = document.createElement("tr");
                    simpleOptionMetadataValue = document.createElement("td");
                    if ((typeof optionsetProperty.Options[i].OptionMetadata == "undefined") && (typeof optionsetProperty.Options[i].StatusOptionMetadata == "object")) {
                        simpleOptionMetadataValue.appendChild(this.renderExpandingCell(optionsetProperty.Options[i].StatusOptionMetadata, optionsetProperty.Options[i].StatusOptionMetadata.Value + " : " + optionsetProperty.Options[i].StatusOptionMetadata.Label.UserLocalizedLabel.Label));
                    }
                    else {
                        if ((typeof optionsetProperty.Options[i].OptionMetadata == "undefined") && (typeof optionsetProperty.Options[i].StateOptionMetadata == "object")) {
                            simpleOptionMetadataValue.appendChild(this.renderExpandingCell(optionsetProperty.Options[i].StateOptionMetadata, optionsetProperty.Options[i].StateOptionMetadata.Value + " : " + optionsetProperty.Options[i].StateOptionMetadata.Label.UserLocalizedLabel.Label));
                        }
                        else {
                            simpleOptionMetadataValue.appendChild(this.renderExpandingCell(optionsetProperty.Options[i].OptionMetadata, optionsetProperty.Options[i].OptionMetadata.Value + " : " + optionsetProperty.Options[i].OptionMetadata.Label.UserLocalizedLabel.Label));
                        }

                    }

                    simpleOptionMetadataRow.appendChild(simpleOptionMetadataValue);
                    simpleOptionsTable.appendChild(simpleOptionMetadataRow);
                }
                simpleValue.appendChild(simpleOptionsTable);
            }
            else {
                var simpleBooleanOptionsTable = document.createElement("table")
                var falseOptionRow = document.createElement("tr");
                var falseOptionLabel = document.createElement("td");
                falseOptionLabel.innerText = "FalseOption:";
                falseOptionRow.appendChild(falseOptionLabel);
                var falseOptionValue = document.createElement("td")
                falseOptionValue.appendChild(this.renderExpandingCell(optionsetProperty.FalseOption, optionsetProperty.FalseOption.Value + " : " + optionsetProperty.FalseOption.Label.UserLocalizedLabel.Label));
                falseOptionRow.appendChild(falseOptionValue);
                simpleBooleanOptionsTable.appendChild(falseOptionRow);
                var trueOptionRow = document.createElement("tr");
                var trueOptionLabel = document.createElement("td");
                trueOptionLabel.innerText = "TrueOption:";
                trueOptionRow.appendChild(trueOptionLabel);
                var trueOptionValue = document.createElement("td")
                trueOptionValue.appendChild(this.renderExpandingCell(optionsetProperty.TrueOption, optionsetProperty.TrueOption.Value + " : " + optionsetProperty.TrueOption.Label.UserLocalizedLabel.Label));
                trueOptionRow.appendChild(trueOptionValue);
                simpleBooleanOptionsTable.appendChild(trueOptionRow);
                simpleValue.appendChild(simpleBooleanOptionsTable);
            }
            dataCell.appendChild(simpleValue);
            var complexValue = document.createElement("div");
            complexValue.className = "complexLabel";
            var optionSetTable = document.createElement("table");
            for (var subProperty in optionsetProperty) {
                switch (subProperty) {
                case "Description":
                    var descriptionRow = document.createElement("tr");
                    var descriptionLabel = document.createElement("td");
                    descriptionLabel.innerText = "Description:";
                    descriptionRow.appendChild(descriptionLabel);
                    var descriptionValue = document.createElement("td");
                    if (optionsetProperty.Description.UserLocalizedLabel == null) {
                        descriptionValue.innerText = config.nullValueString;
                    }
                    else {
                        descriptionValue.appendChild(this.renderExpandingCell(optionsetProperty.Description, optionsetProperty.Description.UserLocalizedLabel.Label));
                    }
                    descriptionRow.appendChild(descriptionValue)
                    optionSetTable.appendChild(descriptionRow);
                    break;
                case "DisplayName":
                    var displayNameRow = document.createElement("tr");
                    var displayNameLabel = document.createElement("td");
                    displayNameLabel.innerText = "DisplayName:";
                    displayNameRow.appendChild(displayNameLabel);
                    var displayNameValue = document.createElement("td");
                    if (optionsetProperty.DisplayName.UserLocalizedLabel == null) {
                        displayNameValue.innerText = config.nullValueString;
                    }
                    else {
                        displayNameValue.appendChild(this.renderExpandingCell(optionsetProperty.DisplayName, optionsetProperty.DisplayName.UserLocalizedLabel.Label));
                    }
                    displayNameRow.appendChild(displayNameValue)
                    optionSetTable.appendChild(displayNameRow);
                    break;
                case "FalseOption":
                    var falseOptionRow = document.createElement("tr");
                    var falseOptionLabel = document.createElement("td");
                    falseOptionLabel.innerText = "FalseOption:";
                    falseOptionRow.appendChild(falseOptionLabel);
                    falseOptionValue = document.createElement("td");
                    falseOptionValue.appendChild(this.renderExpandingCell(optionsetProperty.FalseOption, optionsetProperty.FalseOption.Value + " : " + optionsetProperty.FalseOption.Label.UserLocalizedLabel.Label));
                    falseOptionRow.appendChild(falseOptionValue);
                    optionSetTable.appendChild(falseOptionRow);
                    break;
                case "IsCustomizable":
                    var isCustomizableRow = document.createElement("tr");
                    var isCustomizableLabel = document.createElement("td");
                    isCustomizableLabel.innerText = "IsCustomizable:";
                    isCustomizableRow.appendChild(isCustomizableLabel);
                    isCustomizableValue = document.createElement("td");
                    isCustomizableValue.appendChild(this.renderExpandingCell(optionsetProperty.IsCustomizable, optionsetProperty.IsCustomizable.Value));
                    isCustomizableRow.appendChild(isCustomizableValue);
                    optionSetTable.appendChild(isCustomizableRow);
                    break;
                case "IsCustomOptionSet":
                    var isCustomOptionSetRow = document.createElement("tr");
                    var isCustomOptionSetLabel = document.createElement("td");
                    isCustomOptionSetLabel.innerText = "IsCustomOptionSet:";
                    isCustomOptionSetRow.appendChild(isCustomOptionSetLabel);
                    isCustomOptionSetValue = document.createElement("td");
                    isCustomOptionSetValue.innerText = optionsetProperty.IsCustomOptionSet;
                    isCustomOptionSetRow.appendChild(isCustomOptionSetValue);
                    optionSetTable.appendChild(isCustomOptionSetRow);
                    break;
                case "IsGlobal":
                    var isGlobalRow = document.createElement("tr");
                    var isGlobalLabel = document.createElement("td");
                    isGlobalLabel.innerText = "IsGlobal:";
                    isGlobalRow.appendChild(isGlobalLabel);
                    isGlobalValue = document.createElement("td");
                    isGlobalValue.innerText = optionsetProperty.IsGlobal;
                    isGlobalRow.appendChild(isGlobalValue);
                    optionSetTable.appendChild(isGlobalRow);
                    break;
                case "IsManaged":
                    var isManagedRow = document.createElement("tr");
                    var isManagedLabel = document.createElement("td");
                    isManagedLabel.innerText = "IsManaged:";
                    isManagedRow.appendChild(isManagedLabel);
                    isManagedValue = document.createElement("td");
                    isManagedValue.innerText = optionsetProperty.IsManaged;
                    isManagedRow.appendChild(isManagedValue);
                    optionSetTable.appendChild(isManagedRow);
                    break;
                case "MetadataId":
                    var metadataIdRow = document.createElement("tr");
                    var metadataIdLabel = document.createElement("td");
                    metadataIdLabel.innerText = "MetadataId:";
                    metadataIdRow.appendChild(metadataIdLabel);
                    metadataIdValue = document.createElement("td");
                    metadataIdValue.innerText = optionsetProperty.MetadataId;
                    metadataIdRow.appendChild(metadataIdValue);
                    optionSetTable.appendChild(metadataIdRow);
                    break;
                case "Name":
                    var nameRow = document.createElement("tr");
                    var nameLabel = document.createElement("td");
                    nameLabel.innerText = "Name:";
                    nameRow.appendChild(nameLabel);
                    nameValue = document.createElement("td");
                    nameValue.innerText = optionsetProperty.Name;
                    nameRow.appendChild(nameValue);
                    optionSetTable.appendChild(nameRow);
                    break;
                case "Options":
                    var optionsRow = document.createElement("tr");
                    var optionsRowLabel = document.createElement("td");
                    optionsRowLabel.innerText = "Options:";
                    optionsRow.appendChild(optionsRowLabel);
                    var optionsRowValue = document.createElement("td")
                    var optionsTable = document.createElement("table")
                    for (var i = 0; i < optionsetProperty.Options.length; i++) {
                        var OptionMetadataRow = document.createElement("tr");
                        var OptionMetadataLabel = document.createElement("td");
                        OptionMetadataLabel.innerText = i + ":";
                        OptionMetadataRow.appendChild(OptionMetadataLabel);
                        OptionMetadataValue = document.createElement("td");

                        if ((typeof optionsetProperty.Options[i].OptionMetadata == "undefined") && (typeof optionsetProperty.Options[i].StatusOptionMetadata == "object")) {
                            OptionMetadataValue.appendChild(this.renderExpandingCell(optionsetProperty.Options[i].StatusOptionMetadata, optionsetProperty.Options[i].StatusOptionMetadata.Value + " : " + optionsetProperty.Options[i].StatusOptionMetadata.Label.UserLocalizedLabel.Label));
                        }
                        else {
                            if ((typeof optionsetProperty.Options[i].OptionMetadata == "undefined") && (typeof optionsetProperty.Options[i].StateOptionMetadata == "object")) {
                                OptionMetadataValue.appendChild(this.renderExpandingCell(optionsetProperty.Options[i].StateOptionMetadata, optionsetProperty.Options[i].StateOptionMetadata.Value + " : " + optionsetProperty.Options[i].StateOptionMetadata.Label.UserLocalizedLabel.Label));
                            }
                            else {
                                OptionMetadataValue.appendChild(this.renderExpandingCell(optionsetProperty.Options[i].OptionMetadata, optionsetProperty.Options[i].OptionMetadata.Value + " : " + optionsetProperty.Options[i].OptionMetadata.Label.UserLocalizedLabel.Label));
                            }

                        }

                        OptionMetadataRow.appendChild(OptionMetadataValue);
                        optionsTable.appendChild(OptionMetadataRow);
                    }
                    optionsRowValue.appendChild(optionsTable);
                    optionsRow.appendChild(optionsRowValue);
                    optionSetTable.appendChild(optionsRow);
                    break;
                case "OptionSetType":
                    var optionSetTypeRow = document.createElement("tr");
                    var optionSetTypeLabel = document.createElement("td");
                    optionSetTypeLabel.innerText = "OptionSetType:";
                    optionSetTypeRow.appendChild(optionSetTypeLabel);
                    optionSetTypeValue = document.createElement("td");
                    optionSetTypeValue.innerText = optionsetProperty.OptionSetType;
                    optionSetTypeRow.appendChild(optionSetTypeValue);
                    optionSetTable.appendChild(optionSetTypeRow);
                    break;
                case "TrueOption":
                    var trueOptionRow = document.createElement("tr");
                    var trueOptionLabel = document.createElement("td");
                    trueOptionLabel.innerText = "TrueOption:";
                    trueOptionRow.appendChild(trueOptionLabel);
                    trueOptionValue = document.createElement("td");
                    trueOptionValue.appendChild(this.renderExpandingCell(optionsetProperty.TrueOption, optionsetProperty.TrueOption.Value + " : " + optionsetProperty.TrueOption.Label.UserLocalizedLabel.Label));
                    trueOptionRow.appendChild(trueOptionValue);
                    optionSetTable.appendChild(trueOptionRow);
                    break;
                }
            }
            complexValue.appendChild(optionSetTable);
            dataCell.appendChild(complexValue);
            row.appendChild(dataCell);
            table.appendChild(row);
            container.appendChild(table);
            return container;
        };

        this.separatorDrag = function () { ///<summary>
            /// Resize the width of columns when the mouse moves
            ///</summary>
            var columnWidth = config.columns[config.columnBeingResized].initialWidth;
            try {
                columnWidth = event.x - config.columns[config.columnBeingResized].heading.offsetLeft;
                if (columnWidth > 0 && event.x < (config.grid.container.offsetWidth - 20)) {
                    config.columns[config.columnBeingResized].initialWidth = (columnWidth - config.columnBeingResized);
                    config.columns[config.columnBeingResized].heading.style.pixelWidth = columnWidth;
                }
            }
            catch(e) {}
        };

        this.separatorDragEnd = function () { ///<summary>
            /// Ends the drag operation when resizing column widths
            ///</summary>
            config.grid.container.detachEvent("onmousemove", config.grid.separatorDrag)
            config.grid.container.detachEvent("onmouseup", config.grid.separatorDragEnd);
            config.grid.container.detachEvent("onmouseleave", config.grid.separatorDragEnd);
            config.grid.refresh();
        };

        this.separatorMouseDown = function () { ///<summary>
            /// Starts the separator drag operation to resize column widths
            ///</summary>
            config.columnBeingResized = event.srcElement.columnIndex;
            config.grid.container.attachEvent("onmousemove", config.grid.separatorDrag);
            config.grid.container.attachEvent("onmouseup", config.grid.separatorDragEnd);
            config.grid.container.attachEvent("onmouseleave", config.grid.separatorDragEnd);
        };

        //Define functions END

        //The Grid
        this.container = document.createElement("div");
        this.container.className = "simpleGridContainer";
        //Disable Selecting and context menu
        this.container.onselectstart = function () {
            return false;
        };
        this.container.oncontextmenu = function () {
            return false;
        };
        this.headerContainer = document.createElement("div");
        this.headerContainer.className = "headerContainer";
        if (config.filters.length > 0) {
            // Increase the height of the header container to allow for displaying filters
            // above the column headings.
            // 22 pixels is the expected height of the columnHeaderContainer
            // CSS class specifies 20 but there is some overlap unless the extra 2 pixels are added.
            this.headerContainer.style.pixelHeight = (config.filterAreaHeight + 22)
            this.filterContainer = document.createElement("div");
            this.filterContainer.className = "filterContainer";
            // You must manually adjust the height using the config.
            this.filterContainer.style.pixelHeight = config.filterAreaHeight;
            this.filterTable = document.createElement("table");
            this.filterTable.className = "filterTable";
            this.filterTableRow = document.createElement("tr");
            this.filterTableLabel = document.createElement("td");
            this.filterTableLabel.className = "filterTableLabel";
            this.filterTableLabel.innerText = "Filter: ";
            this.filterTableRow.appendChild(this.filterTableLabel);
            // Rendering the filters in the Filter Container
            for (var i = 0; i < config.filters.length; i++) {
                var filter = config.filters[i];
                var controlContainer = document.createElement("td");
                controlContainer.className = "controlContainer";
                var controlLabel = document.createElement("span");
                controlLabel.className = "controlLabel";
                controlLabel.innerText = filter.label;
                controlContainer.appendChild(controlLabel);
                var controlSpan = document.createElement("span");
                var control = filter.creator();
                control.className = "filterControl";
                control.attachEvent(filter.event, this.filterRows);
                controlSpan.appendChild(control);
                controlContainer.appendChild(controlSpan);
                this.filterTableRow.appendChild(controlContainer);
            }
            this.filterTable.appendChild(this.filterTableRow);
            this.filterContainer.appendChild(this.filterTable);
            this.headerContainer.appendChild(this.filterContainer);
        }
        //Render the column headers based on the configuration information
        this.columnHeaderContainer = document.createElement("div");
        //Fixes a cosmetic issue
        if (config.filters.length == 0) {
            this.columnHeaderContainer.className = "columnHeaderContainerNoFilters"
        }
        else {
            this.columnHeaderContainer.className = "columnHeaderContainer";
        }
        for (var i in config.columns) {
            var label = config.columns[i].label;
            var initialWidth = parseInt(config.columns[i].initialWidth, 10);
            var header = document.createElement("div");
            header.className = "simpleGridColumn";
            config.columns[i].heading = header;
            if (!isNaN(initialWidth)) {
                header.style.width = (initialWidth + 2) + "px";
            }
            var labelText = document.createElement("div")
            labelText.className = "labelText";
            labelText.innerText = label;
            header.appendChild(labelText);
            this.columnHeaderContainer.appendChild(header);
            if (i < (config.columns.length - 1)) {
                var separator = document.createElement("div");
                separator.className = "separator";
                separator.innerText = " ";
                separator.setAttribute("columnIndex", i);
                separator.attachEvent("onmousedown", this.separatorMouseDown);
                this.columnHeaderContainer.appendChild(separator);
            }
        }
        this.headerContainer.appendChild(this.columnHeaderContainer);
        this.container.appendChild(this.headerContainer);
        //Render the data area
        this.dataContainer = document.createElement("div");
        this.dataContainer.className = "dataContainer";
        //Adds screen to view while data is loading.
        this.loadingDiv = document.createElement("div");
        this.loadingDiv.className = "loadingDiv";
        var loadingDivContent = document.createElement("div");
        loadingDivContent.className = "loadingDivContent";
        var image = document.createElement("img");
        image.setAttribute("src", "Images/progress.gif");
        var text = document.createElement("p");
        text.innerText = "Loading...";
        loadingDivContent.appendChild(image);
        loadingDivContent.appendChild(text);
        this.loadingDiv.appendChild(loadingDivContent);
        this.dataContainer.appendChild(this.loadingDiv);
        this.dataTable = document.createElement("table");
        this.dataTable.setAttribute("rules", "groups");
        this.dataTable.className = "dataTable";
        this.dataContainer.appendChild(this.dataTable);
        //Keep the data container sized correctly.
        this.dataContainer.onresize = function () {
            this.style.pixelHeight = (this.parentElement.clientHeight - this.previousSibling.clientHeight);
        }
        this.container.appendChild(this.dataContainer);
        parentElement.appendChild(this.container);
        this._data = [];
    },
    isEmpty: function (obj) { ///<summary>
        /// A utility function to determine if an object is empty.
        ///</summary>
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }
        return true;
    },
    __namespace: true
};