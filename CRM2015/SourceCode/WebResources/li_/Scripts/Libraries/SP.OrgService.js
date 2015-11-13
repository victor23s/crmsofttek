/// <reference path="SP.Core.js" />

Sonoma.namespace("OrgService").extend((function () {

    // Begin Private

    /*-- Constants --*/

    var _namespaces = {
        xrm: "xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\"",
        crm: "xmlns:c=\"http://schemas.microsoft.com/crm/2011/Contracts\"",
        collection: "xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\"",
        arrays: "xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\"",
        xml: "xmlns:c=\"http://www.w3.org/2001/XMLSchema\"",
        serialization: "xmlns:c=\"http://schemas.microsoft.com/2003/10/Serialization/\""
    };

    /*-- Helper Methods --*/

    function _buildColumnSet(columns) {
        var retrieveAllColumns = (Sonoma.type(columns) !== "array");
        var columnSet = ["<columnSet ", _namespaces.xrm, ">", "<a:AllColumns>", retrieveAllColumns.toString(), "</a:AllColumns>", "<a:Columns ", _namespaces.arrays, ">"];
        if (!retrieveAllColumns) {
            for (var i = 0; i < columns.length; i++) {
                if (Sonoma.type(columns[i]) === "string") {
                    columnSet.push(Sonoma.String.format("<b:string>{0}</b:string>", columns[i]));
                }
            }
        }
        columnSet.push("</a:Columns>");
        columnSet.push("</columnSet>");
        return columnSet.join("");
    }

    function _handleResponse(req, successCallback, errorCallback) {
        if (req.readyState == 4) {
            if (req.status == 200) {
                if (successCallback != null) {
                    successCallback(req.responseXML);
                }
            }
            else if (req.status === 0) {
                // Ajax cancelled by browser, ignore
                return;
            }
            else {
                errorCallback(_getError(req.responseXML));
            }
        }
    }

    function _getError(faultXml) {
        var errorMessage = "Unknown Error (Unable to parse the fault)";
        if (typeof faultXml == "object") {
            try {
                var bodyNode = faultXml.firstChild.firstChild;
                //Retrieve the fault node
                for (var i = 0; i < bodyNode.childNodes.length; i++) {
                    var node = bodyNode.childNodes[i];

                    //NOTE: This comparison does not handle the case where the XML namespace changes
                    if ("s:Fault" == node.nodeName) {
                        for (var j = 0; j < node.childNodes.length; j++) {
                            var faultStringNode = node.childNodes[j];
                            if ("faultstring" == faultStringNode.nodeName) {
                                errorMessage = faultStringNode.text || faultStringNode.textContent;
                                break;
                            }
                        }
                        break;
                    }
                }
            }
            catch(e) {}
        }
        return new Error(errorMessage);
    }

    function _buildError(message) {
        return new Error(message);
    }

    function _mergeObjects(o1, o2) {
        var o3 = {};
        for (var attrname in o1) {
            o3[attrname] = o1[attrname];
        }
        for (var attrname in o2) {
            o3[attrname] = o2[attrname];
        }
        return o3;
    }

    function _isUndefined(o) {
        return (o === undefined);
    }

    function _isNull(o) {
        return (o === null);
    }

    function _buildEntityXml(logicalName, id, entity) {
        if (Sonoma.type(entity) !== "object") return;
        if (_isNull(id)) id = "00000000-0000-0000-0000-000000000000";
        if (_isNull(logicalName)) {
            alert("LogicalName was not specified, cannot continue operation.");
        }

        var request = ["<entity ", _namespaces.xrm, ">", "<a:Attributes ", _namespaces.collection, ">", _buildAttributeXml(entity), "</a:Attributes>", "<a:EntityState i:nil=\"true\" />", "<a:FormattedValues ", _namespaces.collection, " />", "<a:Id>" + id + "</a:Id>", "<a:LogicalName>" + logicalName + "</a:LogicalName>", "<a:RelatedEntities ", _namespaces.collection, " />", "</entity>"];

        return request.join("");
    }

    function _buildAttributeXml(entity) {
        var attributeXml = [];
        for (var attr in entity) {
            if (attr != "Metadata") {
                if (entity.hasOwnProperty(attr)) {
                    attributeXml.push("<a:KeyValuePairOfstringanyType>");
                    attributeXml.push(Sonoma.String.format("<b:key>{0}</b:key>", attr));
                    if ((typeof entity[attr]).toLowerCase() == "object" && entity[attr] != null) {
                        attributeXml.push(entity[attr].toXml());
                    }
                    else if (Sonoma.type(entity[attr]) === "number") {
                        attributeXml.push("<b:value i:type=\"c:int\" " + _namespaces.xml + ">" + entity[attr] + "</b:value>");
                    }
                    else if (Sonoma.type(entity[attr]) === "string") {
                        attributeXml.push("<b:value i:type=\"c:string\" " + _namespaces.xml + ">" + entity[attr] + "</b:value>");
                    }
                    else {
                        throw new Error("Parsing of invalid attribute type attempted.");
                    }

                    attributeXml.push("</a:KeyValuePairOfstringanyType>");
                }
            }
        }

        return attributeXml.join("");
    }

    function _parseCreate(xml, successCallback, errorCallback) {
        var id = Sonoma.Xml.selectSingleNode(xml, "s:Envelope/s:Body/CreateResponse/CreateResult").text;
        if (successCallback != null) successCallback(id);
        else return id;
    }

    function _parseRetrieve(xml, fields, successCallback, errorCallback) {
        var entity = _parseEntity(Sonoma.Xml.selectSingleNode(xml, "s:Envelope/s:Body/RetrieveResponse/RetrieveResult"), fields);
        if (successCallback != null) successCallback(entity);
        else return entity;
    }

    function _parseRetrieveMultiple(xml, successCallback, errorCallback) {
        // Parse paging data
        var paging = _parsePaging(xml);
        var entitiesXml = Sonoma.Xml.selectSingleNode(xml, "s:Envelope/s:Body/RetrieveMultipleResponse/RetrieveMultipleResult/a:Entities");
        var entities = [];
        if (entitiesXml.childNodes.length > 0) {
            for (var i = 0; i < entitiesXml.childNodes.length; i++) {
                entities.push(_parseEntity(entitiesXml.childNodes[i]));
            }
            if (successCallback != null) successCallback(entities, paging);
            else return {
                Entities: entities,
                Paging: paging
            };
        }
        else {
            if (successCallback != null) successCallback(null);
            else return {
                Entities: null,
                Paging: null
            };
        }
    }

    function _parsePaging(xml) {
        var paging = {
            MoreRecords: false,
            TotalRecordCount: -1,
            PagingCookie: null
        };
        var pagingXml = Sonoma.Xml.selectSingleNode(xml, "s:Envelope/s:Body/RetrieveMultipleResponse/RetrieveMultipleResult");

        if (Sonoma.Xml.selectSingleNode(pagingXml, "a:TotalRecordCount") != null && !isNaN(parseInt(Sonoma.Xml.selectSingleNode(pagingXml, "a:TotalRecordCount").text, 10))) paging.TotalRecordCount = parseInt(Sonoma.Xml.selectSingleNode(pagingXml, "a:TotalRecordCount").text, 10);
        if (Sonoma.Xml.selectSingleNode(pagingXml, "a:PagingCookie") != null) paging.PagingCookie = Sonoma.Xml.selectSingleNode(pagingXml, "a:PagingCookie").text.replace(/</g, "&amp;lt;").replace(/>/g, "&amp;gt;").replace(/"/g, "&amp;quot;");
        if (Sonoma.Xml.selectSingleNode(pagingXml, "a:MoreRecords") != null) paging.MoreRecords = (Sonoma.Xml.selectSingleNode(pagingXml, "a:MoreRecords").text == "true");
        return paging;
    }

    function _parseEntity(entityXml, fields) {
        var entity = {};
        entity.Metadata = {};
        entity.Metadata.RelatedEntityCount = 0;
        entity.Metadata.AttributeCount = 0;
        if (Sonoma.type(fields) === "array") {
            for (var i = 0; i < fields.length; i++) {
                entity[fields[i]] = null;
            }
        }
        var formattedValues = {};
        var formattedValuesXml = Sonoma.Xml.selectSingleNode(entityXml, "a:FormattedValues");
        if (formattedValuesXml.childNodes.length > 0) {
            for (var i = 0; i < formattedValuesXml.childNodes.length; i++) {
                var attributeKey = Sonoma.Xml.selectSingleNode(formattedValuesXml.childNodes[i], "b:key").text;
                var attributeValue = Sonoma.Xml.selectSingleNode(formattedValuesXml.childNodes[i], "b:value").text;
                if (attributeKey != null) formattedValues[attributeKey] = attributeValue;
            }
        }
        var attributesData = Sonoma.Xml.selectSingleNode(entityXml, "a:Attributes");
        if (attributesData.childNodes.length > 0) {
            //There are attributes
            entity.Metadata.AttributeCount = attributesData.childNodes.length;
            entity.Metadata.RelatedEntityCount = 0;
            for (var i = 0; i < attributesData.childNodes.length; i++) {
                var attributeData = attributesData.childNodes[i];
                var attributeType = Sonoma.Xml.selectSingleNode(attributeData, "b:value").getAttribute("i:type");
                var attributeValue = Sonoma.Xml.selectSingleNode(attributeData, "b:value").text;
                var attributeKey = Sonoma.Xml.selectSingleNode(attributeData, "b:key").text;
                switch (attributeType) {
                case "c:guid":
                    attributeValue = _parseGuid(attributeData);
                    break;
                case "a:OptionSetValue":
                    attributeValue = _parseOptionSetValue(formattedValues, attributeData, attributeKey);
                    break;
                case "a:EntityReference":
                    attributeValue = _parseEntityReference(attributeData);
                    break;
                case "a:Money":
                    attributeValue = _parseMoney(formattedValues, attributeData, attributeKey);
                    break;
                case "c:dateTime":
                    attributeValue = _parseDate(formattedValues, attributeData, attributeKey);
                    break;
                case "c:decimal":
                    attributeValue = _parseDecimal(formattedValues, attributeData, attributeKey);
                    break;
                case "c:int":
                    attributeValue = _parseInt(attributeData);
                    break;
                case "c:boolean":
                    attributeValue = _parseBoolean(formattedValues, attributeData, attributeKey);
                    break;
                case "a:AliasedValue":
                    entity.Metadata.AttributeCount--;
                    entity.Metadata.RelatedEntityCount++;
                    attributeValue = _parseAliasedValue(formattedValues, attributeData, attributeKey);
                    attributeKey = _parseAliasedKey(attributeData);
                    // Correct linked aliased attributes
                    if (attributeKey == null) {
                        entity[Sonoma.Xml.selectSingleNode(attributeData, "b:key").text] = attributeValue[Sonoma.Xml.selectSingleNode(attributeData, "b:value/a:AttributeLogicalName").text];
                    }
                    if (entity.hasOwnProperty(attributeKey)) entity[attributeKey] = _mergeObjects(entity[attributeKey], attributeValue);
                    else if (attributeKey != null) entity[attributeKey] = attributeValue;
                    attributeKey = null;
                    break;
                case "c:string":
                    break;
                default:
                    break;
                }
                if (attributeKey != null) entity[attributeKey] = attributeValue;
            }
        }

        entity.Metadata.Id = Sonoma.Xml.selectSingleNode(entityXml, "a:Id").text;
        entity.Metadata.LogicalName = Sonoma.Xml.selectSingleNode(entityXml, "a:LogicalName").text;
        // Current version doesn't utilize RelatedEntities collection
        //entity.RelatedEntities = null;
        return entity;
    }

    function _parseOptionSetValue(formattedValues, attributeData, attributeKey, isSubAttribute) {
        var value = new Sonoma.OrgService.OptionSetValue();
        if (!isSubAttribute) value.Value = parseInt(Sonoma.Xml.selectSingleNode(attributeData, "b:value/a:Value").text, 10);
        else value.Value = parseInt(Sonoma.Xml.selectSingleNode(attributeData, "b:value/a:Value/a:Value").text, 10);
        if (formattedValues != null && formattedValues.hasOwnProperty(attributeKey)) value.Label = formattedValues[attributeKey];
        return value;
    }

    function _parseEntityReference(attributeData, isSubAttribute) {
        var value = new Sonoma.OrgService.EntityReference();
        var path = "b:value/";
        if (isSubAttribute) path = "b:value/a:Value/";
        if (!_isNull(Sonoma.Xml.selectSingleNode(attributeData, path + "a:Id"))) value.Id = Sonoma.Xml.selectSingleNode(attributeData, path + "a:Id").text;
        if (!_isNull(Sonoma.Xml.selectSingleNode(attributeData, path + "a:Name"))) value.Name = Sonoma.Xml.selectSingleNode(attributeData, path + "a:Name").text;
        if (!_isNull(Sonoma.Xml.selectSingleNode(attributeData, path + "a:LogicalName"))) value.LogicalName = Sonoma.Xml.selectSingleNode(attributeData, path + "a:LogicalName").text;
        return value;
    }

    function _parseMoney(formattedValues, attributeData, attributeKey, isSubAttribute) {
        var value = new Sonoma.OrgService.Money();
        var path = "b:value/";
        if (isSubAttribute) path = "b:value/a:Value/";
        value.Value = parseFloat(Sonoma.Xml.selectSingleNode(attributeData, path + "a:Value").text);
        if (formattedValues != null && formattedValues.hasOwnProperty(attributeKey)) value.DisplayValue = formattedValues[attributeKey];
        return value;
    }

    function _parseGuid(attributeData, isSubAttribute) {
        var value = new Sonoma.OrgService.Guid();
        var path = "b:value";
        if (isSubAttribute) path = "b:value/a:Value";
        value.Value = Sonoma.Xml.selectSingleNode(attributeData, path).text;
        return value;
    }

    function _parseInt(attributeData, isSubAttribute) {
        if (!isSubAttribute) return parseInt(Sonoma.Xml.selectSingleNode(attributeData, "b:value").text, 10);
        return parseInt(Sonoma.Xml.selectSingleNode(attributeData, "b:value/a:Value").text, 10);
    }

    function _parseDecimal(formattedValues, attributeData, attributeKey, isSubAttribute) {
        var value = new Sonoma.OrgService.Decimal();
        var path = "b:value";
        if (isSubAttribute) path = "b:value/a:Value";
        value.Value = parseFloat(Sonoma.Xml.selectSingleNode(attributeData, path).text, 10);
        if (formattedValues != null && formattedValues.hasOwnProperty(attributeKey)) value.DisplayValue = formattedValues[attributeKey];
        return value;
    }

    function _parseBoolean(formattedValues, attributeData, attributeKey, isSubAttribute) {
        var value = new Sonoma.OrgService.Boolean();
        var path = "b:value";
        if (isSubAttribute) path = "b:value/a:Value";
        value.Value = (Sonoma.Xml.selectSingleNode(attributeData, path).text == "true");
        if (formattedValues != null && formattedValues.hasOwnProperty(attributeKey)) value.DisplayValue = formattedValues[attributeKey];
        return value;
    }

    function _parseDate(formattedValues, attributeData, attributeKey, isSubAttribute) {
        var value = new Sonoma.OrgService.DateTime();
        var path = "b:value";
        if (isSubAttribute) path = "b:value/a:Value";
        value.UTC = Sonoma.Xml.selectSingleNode(attributeData, path).text;
        if (formattedValues != null && formattedValues.hasOwnProperty(attributeKey)) {
            value.DisplayValue = formattedValues[attributeKey];
            var tempVal = Sonoma.Date.parse(value.UTC);
            value.Value = new Date(tempVal);
        }
        return value;
    }

    function _parseAliasedKey(attributeData) {
        var alias = Sonoma.Xml.selectSingleNode(attributeData, "b:key").text;
        var aliasedParts = alias.split(".");
        if (aliasedParts.length != 2) return null;
        else return aliasedParts[0];
    }

    function _parseAliasedValue(formattedValues, attributeData, attributeKey) {
        var value = {
            _type: "Entity"
        };
        var attributeName = Sonoma.Xml.selectSingleNode(attributeData, "b:value/a:AttributeLogicalName").text;
        var attributeType = Sonoma.Xml.selectSingleNode(attributeData, "b:value/a:Value").getAttribute("i:type");
        var attributeValue = Sonoma.Xml.selectSingleNode(attributeData, "b:value/a:Value").text;
        switch (attributeType) {
        case "c:guid":
            attributeValue = _parseGuid(attributeData, true);
            break;
        case "a:OptionSetValue":
            attributeValue = _parseOptionSetValue(formattedValues, attributeData, attributeKey, true);
            break;
        case "a:EntityReference":
            attributeValue = _parseEntityReference(attributeData, true);
            break;
        case "a:Money":
            attributeValue = _parseMoney(formattedValues, attributeData, attributeKey, true);
            break;
        case "c:dateTime":
            attributeValue = _parseDate(formattedValues, attributeData, attributeKey, true);
            break;
        case "c:decimal":
            attributeValue = _parseDecimal(formattedValues, attributeData, attributeKey, true);
            break;
        case "c:int":
            attributeValue = _parseInt(attributeData, true);
            break;
        case "c:boolean":
            attributeValue = _parseBoolean(formattedValues, attributeData, attributeKey, true);
            break;
        case "a:AliasedValue":
            alert('Unsupported parsing of multitiered aliased/linked entities');
            break;
        case "c:string":
            break;
        default:
            break;
        }
        if (attributeName != null) value[attributeName] = attributeValue;
        return value;
    }

    // Private function that creates a return object for synchronous calls
    function _getReturnObject(returnValue, successFlag) {
        return {
            Success: successFlag,
            Value: returnValue
        };
    }

    function _buildGenericRequest(type, name, parameters) {
        var request = ["<request i:type=\"c:" + type + "\" ", _namespaces.xrm, " ", _namespaces.crm, ">", "<a:Parameters ", _namespaces.collection, ">", parameters, "</a:Parameters>", "<a:RequestId i:nil=\"true\" />", "<a:RequestName>", name, "</a:RequestName>", "</request>"];

        return request.join("");
    }

    function _buildKeyValueXmlPair(name, value) {
        var pair = ["<a:KeyValuePairOfstringanyType>", "<b:key>", name, "</b:key>", value, "</a:KeyValuePairOfstringanyType>"];

        return pair.join("");
    }

    /*-- Service Methods --*/

    function deleteRecord(logicalName, id, successCallback, errorCallback) {
        _deleteRecordInternal(logicalName, id, successCallback, errorCallback, true);
    }

    function deleteRecordSync(logicalName, id) {
        return _deleteRecordInternal(logicalName, id, null, null, false);
    }

    function _deleteRecordInternal(logicalName, id, successCallback, errorCallback, isAsync) {
        var request = ["<entityName>", logicalName, "</entityName>", "<id>", id, "</id>"].join("");

        if (isAsync) execute(request, "Delete", successCallback, errorCallback);
        else return executeSync(request, "Delete");
    }

    function create(logicalName, entity, successCallback, errorCallback) {
        _createInternal(logicalName, entity, successCallback, errorCallback, true);
    }

    function createSync(logicalName, entity) {
        return _createInternal(logicalName, entity, null, null, false);
    }

    function _createInternal(logicalName, entity, successCallback, errorCallback, isAsync) {
        var request = _buildEntityXml(logicalName, null, entity);

        if (isAsync) {
            execute(request, "Create", function (responseXml) {
                _parseCreate(responseXml, successCallback, errorCallback);
            },
            errorCallback);
        }
        else {
            var result = executeSync(request, "Create");
            if (result.Success == true) return _getReturnObject(_parseCreate(result.Value, null, null), true);
            else return result;
        }
    }

    function update(logicalName, id, entity, successCallback, errorCallback) {
        _updateInternal(logicalName, id, entity, successCallback, errorCallback, true);
    }

    function updateSync(logicalName, id, entity) {
        return _updateInternal(logicalName, id, entity, null, null, false);
    }

    function _updateInternal(logicalName, id, entity, successCallback, errorCallback, isAsync) {
        var request = _buildEntityXml(logicalName, id, entity);

        if (isAsync) execute(request, "Update", successCallback, errorCallback);
        else return executeSync(request, "Update");
    }

    function retrieve(logicalName, id, fields, successCallback, errorCallback) {
        _retrieveInternal(logicalName, id, fields, successCallback, errorCallback, true);
    }

    function retrieveSync(logicalName, id, fields) {
        return _retrieveInternal(logicalName, id, fields, null, null, false);
    }

    function _retrieveInternal(logicalName, id, fields, successCallback, errorCallback, isAsync) {
        var request = ["<entityName>", logicalName, "</entityName>", "<id>", id, "</id>"];

        request.push(_buildColumnSet(fields));

        if (isAsync) {
            execute(request.join(""), "Retrieve", function (responseXML) {
                _parseRetrieve(responseXML, fields, successCallback, errorCallback);
            },
            errorCallback);
        }
        else {
            var result = executeSync(request.join(""), "Retrieve");
            if (result.Success == true) return _getReturnObject(_parseRetrieve(result.Value, fields, null, null), true);
            else return result;
        }
    }

    function retrieveMultiple(fetchXml, successCallback, errorCallback) {
        _retrieveMultipleInternal(fetchXml, successCallback, errorCallback, true);
    }

    function retrieveMultipleSync(fetchXml) {
        return _retrieveMultipleInternal(fetchXml, null, null, false);
    }

    function _retrieveMultipleInternal(fetchXml, successCallback, errorCallback, isAsync) {
        var request = ["<query i:type=\"a:FetchExpression\" ", _namespaces.xrm, ">", "<a:Query>", fetchXml, "</a:Query>", "</query>"].join("");

        if (isAsync) {
            execute(request, "RetrieveMultiple", function (responseXML) {
                _parseRetrieveMultiple(responseXML, successCallback, errorCallback);
            },
            errorCallback);
        }
        else {
            var result = executeSync(request, "RetrieveMultiple");
            if (result.Success == true) return _getReturnObject(_parseRetrieveMultiple(result.Value, null, null), true);
            else return result;
        }
    }

    function setState(entityReference, state, status, successCallback, errorCallback) {
        _setStateInternal(entityReference, state, status, successCallback, errorCallback, true);
    }

    function setStateSync(entityReference, state, status) {
        return _setStateInternal(entityReference, state, status, null, null, false);
    }

    function _setStateInternal(entityReference, state, status, successCallback, errorCallback, isAsync) {
        var parameters = [
        _buildKeyValueXmlPair("EntityMoniker", entityReference.toXml()), _buildKeyValueXmlPair("State", state.toXml()), _buildKeyValueXmlPair("Status", status.toXml())].join("");

        var request = _buildGenericRequest("SetStateRequest", "SetState", parameters);

        if (isAsync) execute(request, "Execute", successCallback, errorCallback);
        else return executeSync(request, "Execute");
    }

    function assign(assigneeId, targetEntityReference, successCallback, errorCallback) {
        _assignInternal(assigneeId, targetEntityReference, successCallback, errorCallback, true);
    }

    function assignSync(assigneeId, targetEntityReference) {
        return _assignInternal(assigneeId, targetEntityReference, null, null, false);
    }

    function _assignInternal(assigneeId, targetEntityReference, successCallback, errorCallback, isAsync) {
        var parameters = [
        _buildKeyValueXmlPair("Target", targetEntityReference.toXml()), "<a:KeyValuePairOfstringanyType>", "<b:key>Assignee</b:key>", "<b:value i:type=\"a:EntityReference\">", "<a:Id>" + assigneeId + "</a:Id>", "<a:LogicalName>systemuser</a:LogicalName>", "<a:Name i:nil=\"true\" />", "</b:value>", "</a:KeyValuePairOfstringanyType>"].join("");

        var request = _buildGenericRequest("AssignRequest", "Assign", parameters);

        if (isAsync) execute(request, "Execute", successCallback, errorCallback);
        else return executeSync(request, "Execute");
    }

    function associate(entityReference1, entityReference2, relationshipName, successCallback, errorCallback) {
        _associateInternal(entityReference1, entityReference2, relationshipName, successCallback, errorCallback, true);
    }

    function associateSync(entityReference1, entityReference2, relationshipName) {
        return _associateInternal(entityReference1, entityReference2, relationshipName, null, null, false);
    }

    function _associateInternal(entityReference1, entityReference2, relationshipName, successCallback, errorCallback, isAsync) {
        var parameters = [
        _buildKeyValueXmlPair("Moniker1", entityReference1.toXml()), _buildKeyValueXmlPair("Moniker2", entityReference2.toXml()), "<a:KeyValuePairOfstringanyType>", "<b:key>RelationshipName</b:key>", "<b:value i:type=\"d:string\" xmlns:d=\"http://www.w3.org/2001/XMLSchema\">", relationshipName, "</b:value>", "</a:KeyValuePairOfstringanyType>"].join("");

        var request = _buildGenericRequest("AssociateEntitiesRequest", "AssociateEntities", parameters);

        if (isAsync) execute(request, "Execute", successCallback, errorCallback);
        else return executeSync(request, "Execute");
    }

    function disassociate(entityReference1, entityReference2, relationshipName, successCallback, errorCallback) {
        _disassociateInternal(entityReference1, entityReference2, relationshipName, successCallback, errorCallback, true);
    }

    function disassociateSync(entityReference1, entityReference2, relationshipName) {
        return _disassociateInternal(entityReference1, entityReference2, relationshipName, null, null, false);
    }

    function _disassociateInternal(entityReference1, entityReference2, relationshipName, successCallback, errorCallback, isAsync) {
        var parameters = [
        _buildKeyValueXmlPair("Moniker1", entityReference1.toXml()), _buildKeyValueXmlPair("Moniker2", entityReference2.toXml()), "<a:KeyValuePairOfstringanyType>", "<b:key>RelationshipName</b:key>", "<b:value i:type=\"d:string\" xmlns:d=\"http://www.w3.org/2001/XMLSchema\">", relationshipName, "</b:value>", "</a:KeyValuePairOfstringanyType>"].join("");

        var request = _buildGenericRequest("DisassociateEntitiesRequest", "DisassociateEntities", parameters);

        if (isAsync) execute(request, "Execute", successCallback, errorCallback);
        else return executeSync(request, "Execute");
    }

    function execute(body, requestType, successCallback, errorCallback) {
        _executeInternal(body, requestType, successCallback, errorCallback, true);
    }

    function executeSync(body, requestType) {
        return _executeInternal(body, requestType, null, null, false);
    }

    function _executeInternal(body, requestType, successCallback, errorCallback, isAsync) {
        if (_isUndefined(isAsync)) isAsync = true;
        var request = ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">", "<s:Body>", "<", requestType, " xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\"", " xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">", body, "</", requestType, ">", "</s:Body>", "</s:Envelope>"].join("");

        var req = new XMLHttpRequest();
        req.open("POST", Sonoma.getServerUrl() + "/XRMServices/2011/Organization.svc/web", isAsync);
        // Responses will return XML. It isn't possible to return JSON.
        req.setRequestHeader("Accept", "application/xml, text/xml, */*");
        req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/" + requestType);
        if (isAsync) {
            req.onreadystatechange = function () {
                _handleResponse(req, successCallback, errorCallback);
            };
            req.send(request);
        }
        else {
            req.send(request);

            if (req.status == 200) return _getReturnObject(req.responseXML, true);
            else return _getReturnObject(_getError(req.responseXML), false);
        }
    }

    /* -- Attribute Classes -- */
    function CRMAttribute() {

}

    CRMAttribute.prototype.toXml = function () {
        alert("toXml() is not implemented for the object " + this._internalGetName() + ".");
    };

    CRMAttribute.prototype.toString = function () {
        return "Not implemented";
    };

    CRMAttribute.subClass = function (obj) {
        var fnRegex = /\W*function\s+([\w\$]+)\(/;

        obj.prototype = new CRMAttribute();
        obj.prototype._internalGetName = function () {
            var match = fnRegex.exec(obj.toString()) || [];
            return match[1] || "No Name";
        };
    };

    function NullValue() {
        if (! (this instanceof arguments.callee)) {
            return new NullValue();
        }
    }

    CRMAttribute.subClass(NullValue);

    NullValue.prototype.toXml = function () {
        return "<b:value i:nil=\"true\" />";
    };
    NullValue.prototype.toString = function () {
        return "null";
    };

    // Use CrmBoolean because Boolean is a reserved JavaScript type (that should never be used).
    function CrmBoolean(value, displayValue) {
        if (! (this instanceof CrmBoolean)) {
            return new CrmBoolean(value, displayValue);
        }

        this._type = Sonoma.OrgService.attributeTypes.Boolean;
        this.Value = value;
        this.DisplayValue = displayValue;
    }

    CRMAttribute.subClass(CrmBoolean);

    CrmBoolean.prototype.toXml = function () {
        var attributeXml;

        attributeXml = ["<b:value i:type=\"c:boolean\" ", _namespaces.xml, ">", this.Value, "</b:value>"].join("");

        return attributeXml;
    };
    CrmBoolean.prototype.toString = function () {
        if (this.Label) {
            return this.DisplayValue;
        }
        else {
            return this.Value;
        }
    };

    function DateTime(value, displayValue, utc) {
        if (! (this instanceof arguments.callee)) return new DateTime(value, displayValue, utc);

        this._type = Sonoma.OrgService.attributeTypes.DateTime;
        this.Value = value;
        this.DisplayValue = displayValue;
        this.UTC = utc;
    }

    CRMAttribute.subClass(DateTime);

    DateTime.prototype.toXml = function () {
        var attributeXml = ["<b:value i:type=\"c:dateTime\" ", _namespaces.xml, ">", Sonoma.Date.toISOString(this.Value), "</b:value>"].join("");
        return attributeXml;
    };
    DateTime.prototype.toString = function () {
        if (this.DisplayValue != null) return this.DisplayValue;
        else return this.Value;
    };

    function Decimal(value, displayValue) {
        if (! (this instanceof arguments.callee)) return new Decimal(value, displayValue);

        this._type = Sonoma.OrgService.attributeTypes.Decimal;
        this.Value = value;
        this.DisplayValue = displayValue;
    }

    CRMAttribute.subClass(Decimal);

    Decimal.prototype.toXml = function () {
        var attributeXml = ["<b:value i:type=\"c:decimal\" ", _namespaces.xml, ">", this.Value, "</b:value>"].join("");
        return attributeXml;
    };
    Decimal.prototype.toString = function () {
        if (this.DisplayValue != null) return this.DisplayValue;
        else return this.Value;
    };

    function Double(value, displayValue) {
        if (! (this instanceof arguments.callee)) return new Double(value, displayValue);

        this._type = Sonoma.OrgService.attributeTypes.Double;
        this.Value = value;
        this.DisplayValue = displayValue;
    }

    CRMAttribute.subClass(Double);

    Double.prototype.toXml = function () {
        var attributeXml = ["<b:value i:type=\"c:double\" ", _namespaces.xml, ">", this.Value, "</b:value>"].join("");
        return attributeXml;
    };
    Double.prototype.toString = function () {
        if (this.DisplayValue != null) return this.DisplayValue;
        else return this.Value;
    };

    function EntityReference(id, logicalName, name) {
        if (! (this instanceof arguments.callee)) return new EntityReference(id, logicalName, name);

        this._type = Sonoma.OrgService.attributeTypes.EntityReference;
        this.Id = id;
        this.LogicalName = logicalName;
        this.Name = name;
    }

    CRMAttribute.subClass(EntityReference);

    EntityReference.prototype.toXml = function () {
        return attributeXml = ["<b:value i:type=\"a:EntityReference\">", "<a:Id>" + this.Id + "</a:Id>", "<a:LogicalName>" + this.LogicalName + "</a:LogicalName>", "<a:Name i:nil=\"true\" />", "</b:value>"].join("");
    };
    EntityReference.prototype.toString = function () {
        return this.Name;
    };

    function Guid(value, displayValue) {
        if (! (this instanceof arguments.callee)) return new Guid(value, displayValue);

        this._type = Sonoma.OrgService.attributeTypes.Guid;
        this.Value = value;
    }

    CRMAttribute.subClass(Guid);

    Guid.prototype.toXml = function () {
        var attributeXml = ["<b:value i:type=\"c:guid\" ", _namespaces.serialization, ">", this.Value, "</b:value>"].join("");
        return attributeXml;
    };
    Guid.prototype.toString = function () {
        return this.Value;
    };

    function Money(value, displayValue) {
        if (! (this instanceof arguments.callee)) return new Money(value, displayValue);

        this._type = Sonoma.OrgService.attributeTypes.Money;
        this.Value = value;
        this.DisplayValue = displayValue;
    }

    CRMAttribute.subClass(Money);

    Money.prototype.toXml = function () {
        var attributeXml = ["<b:value i:type=\"a:Money\">", "<a:Value>" + this.Value + "</a:Value>", "</b:value>"].join("");
        return attributeXml;
    };
    Money.prototype.toString = function () {
        if (this.DisplayValue != null) return this.DisplayValue;
        else return this.Value;
    };

    function OptionSetValue(value, label) {
        if (! (this instanceof arguments.callee)) return new OptionSetValue(value, label);

        this._type = Sonoma.OrgService.attributeTypes.OptionSetValue;
        this.Value = value;
        this.Label = label;
    }

    CRMAttribute.subClass(OptionSetValue);

    OptionSetValue.prototype.toXml = function () {
        var attributeXml = ["<b:value i:type=\"a:OptionSetValue\">", "<a:Value>" + this.Value + "</a:Value>", "</b:value>"].join("");
        return attributeXml;
    };
    OptionSetValue.prototype.toString = function () {
        if (this.Label != null) return this.Label;
        else return this.Value;
    };

    function ActivityPartyArray(parties) {
        if (! (this instanceof ActivityPartyArray)) {
            return new ActivityPartyArray(parties);
        }

        this._type = "ActivityPartyArray";
        this.EntityReferences = parties;
    }

    CRMAttribute.subClass(ActivityPartyArray);

    ActivityPartyArray.prototype.toXml = function () {
        var valueXml = [],
        i = 0,
        template,
        attributeXml;

        for (i = 0; i < this.EntityReferences.length; i++) {
            template = ["<a:Entity>", "<a:Attributes>", "<a:KeyValuePairOfstringanyType>", "<b:key>partyid</b:key>", "<b:value i:type=\"a:EntityReference\">", "<a:Id>", this.EntityReferences[i].Id, "</a:Id>", "<a:LogicalName>", this.EntityReferences[i].LogicalName, "</a:LogicalName>", "<a:Name i:nil=\"true\" />", "</b:value>", "</a:KeyValuePairOfstringanyType>", "</a:Attributes>", "<a:EntityState i:nil=\"true\" />", "<a:FormattedValues />", "<a:Id>00000000-0000-0000-0000-000000000000</a:Id>", "<a:LogicalName>activityparty</a:LogicalName>", "<a:RelatedEntities />", "</a:Entity>"].join("");
            valueXml.push(template);
        }

        attributeXml = ["<b:value i:type=\"a:ArrayOfEntity\">", valueXml.join(""), "</b:value>"].join("");
        return attributeXml;
    };
    ActivityPartyArray.prototype.toString = function () {
        return "";
    };
    // End Private

    // Begin Public
    return {
        /*-- Service Methods --*/
        create: create,
        createSync: createSync,
        update: update,
        updateSync: updateSync,
        deleteRecord: deleteRecord,
        deleteRecordSync: deleteRecordSync,
        retrieve: retrieve,
        retrieveSync: retrieveSync,
        retrieveMultiple: retrieveMultiple,
        retrieveMultipleSync: retrieveMultipleSync,
        setState: setState,
        setStateSync: setStateSync,
        assign: assign,
        assignSync: assignSync,
        associate: associate,
        associateSync: associateSync,
        disassociate: disassociate,
        disassociateSync: disassociateSync,
        execute: execute,
        executeSync: executeSync,

        /*-- Attribute Classes --*/
        CRMAttribute: CRMAttribute,
        NullValue: NullValue,
        Boolean: CrmBoolean,
        DateTime: DateTime,
        Decimal: Decimal,
        Double: Double,
        EntityReference: EntityReference,
        Guid: Guid,
        Money: Money,
        OptionSetValue: OptionSetValue,
        ActivityPartyArray: ActivityPartyArray
    };

    // End Public
})());

Sonoma.namespace("Fetch").extend((function () {

    // Begin Private

    /*-- Helpers --*/

    function _parseAttributes(attributes) {
        if (Sonoma.type(attributes) === "array") {
            var returnValue = "";
            for (var i = 0; i < attributes.length; i++) {
                returnValue += attributes[i];
            }
            return returnValue;
        }
        else if (!_isUndefined(attributes) && !_isNull(attributes)) return attributes;
        else return "";
    }

    function _parseLinkEntities(linkEntities) {
        var linkEntity = [];
        if (!_isNull(linkEntities) && !_isUndefined(linkEntities)) {
            if (Sonoma.type(linkEntities) === "array") {
                for (var i = 0; i < linkEntities.length; i++) {
                    linkEntity.push(linkEntities[i]);
                }
            }
            else {
                linkEntity.push(linkEntities);
            }

            return linkEntity.join("");
        }
        else return "";
    }

    function _parseConditions(conditions) {
        if (Sonoma.type(conditions) === "array") {
            var returnValue = "";
            for (var i = 0; i < conditions.length; i++) {
                returnValue += conditions[i];
            }
            return returnValue;
        }
        else if (!_isUndefined(conditions) && !_isNull(conditions)) return conditions;
        else return "";
    }

    function _isUndefined(o) {
        return (o === undefined);
    }

    function _isNull(o) {
        return (o === null);
    }

    /*-- Artificial Classes --*/

    function attribute(name) {
        return Sonoma.String.format("&lt;attribute name='{0}' /&gt;", name);
    }

    function linkEntity(toEntityName, fromAttributeName, toAttributeName, alias, linkType, attributes, filter, linkEntities) {
        if (!_isNull(linkType) && !_isUndefined(linkType)) linkType = Sonoma.String.format(" link-type='{0}'", linkType);
        else linkType = "";
        if (_isNull(alias) || _isUndefined(alias)) alias = toAttributeName;
        var linkEntity = [
        Sonoma.String.format("&lt;link-entity name='{0}' from='{1}' to='{2}' alias='{3}'{4}&gt;", toEntityName, fromAttributeName, toAttributeName, alias, linkType), _parseAttributes(attributes), filter, _parseLinkEntities(linkEntities)];
        linkEntity.push("&lt;/link-entity&gt;");
        return linkEntity.join("");
    }

    function filter(type, conditions) {
        var filter = [
        Sonoma.String.format("&lt;filter type='{0}'&gt;", type), _parseConditions(conditions), "&lt;/filter&gt;"];
        return filter.join("");
    }

    function condition(attribute, operator, value) {
        switch (operator) {
        case "not-null":
            case "null":
            case "ne-businessid":
            case "ne-userid":
            case "eq-businessid":
            case "eq-userid":
            return Sonoma.String.format("&lt;condition attribute='{0}' operator='{1}' /&gt;", attribute, operator);
            break;
        case "eq":
            case "ne":
            return Sonoma.String.format("&lt;condition attribute='{0}' operator='{1}' value='{2}' /&gt;", attribute, operator, value);
            break;
        case "in":
            case "not-in":
            return Fetch.conditionMultiValue(attribute, operator, value);
            break;
        default:
            return "";
            break;
        }
    }

    function conditionMultiValue(attribute, operator, values) {
        var condition = [
        Sonoma.String.format("&lt;condition attribute='{0}' operator='{1}'&gt;", attribute, operator)];
        if (Sonoma.type(values) === "array") {
            for (var i = 0; i < values.length; i++) {
                condition.push(Sonoma.String.format("&lt;value&gt;{0}&lt;/value&gt;", values[i]));
            }
        }
        else if (!_isUndefined(values) && !_isNull(values)) condition.push(values);
        condition.push("&lt;/condition&gt;");
        return condition.join("");
    }

    function createXml(logicalName, attributes, filter, linkEntities, isDistinct, count, page, pagingCookie) {
        var paging = " ";
        if (!_isUndefined(count) && !_isNull(count)) paging += Sonoma.String.format("count='{0}'", count);
        if (_isUndefined(isDistinct)) isDistinct = false;
        if (!_isUndefined(page) && !_isNull(page)) {
            if (paging.length != 1) paging += " ";
            paging += Sonoma.String.format("page='{0}'", page);
        }
        if (!_isUndefined(pagingCookie) && !_isNull(pagingCookie)) {
            if (paging.length != 1) paging += " ";
            paging += Sonoma.String.format("paging-cookie='{0}'", pagingCookie);
        }
        if (paging.length == 1) paging = "";
        var fetchXml = [
        Sonoma.String.format("&lt;fetch mapping='logical'{0} ", paging), "version='1.0' returntotalrecordcount='true'", Sonoma.String.format(" distinct='{0}'&gt;", isDistinct), Sonoma.String.format("&lt;entity name='{0}'&gt;", logicalName), _parseAttributes(attributes), filter, _parseLinkEntities(linkEntities)];
        fetchXml.push("&lt;/entity&gt;");
        fetchXml.push("&lt;/fetch&gt;");
        return fetchXml.join("");
    }

    /*-- Transformation Methods --*/

    function createQuery(logicalName, attributes, filter, linkEntities, isDistinct, count, page, pagingCookie) {
        if (_isUndefined(logicalName)) logicalName = null;
        if (_isUndefined(attributes)) attributes = null;
        if (_isUndefined(filter)) filter = null;
        if (_isUndefined(linkEntities)) linkEntities = null;
        if (_isUndefined(count)) count = null;
        if (_isUndefined(page)) page = null;
        if (_isUndefined(pagingCookie)) pagingCookie = null;
        if (_isUndefined(isDistinct)) isDistinct = false;
        var fetchQuery = {
            EntityLogicalName: logicalName,
            Attributes: attributes,
            Fitler: filter,
            LinkEntities: linkEntities,
            Count: count,
            Page: page,
            PagingCookie: pagingCookie,
            IsDistinct: isDistinct
        };
        return fetchQuery;
    }

    function stringify(fetchQuery) {
        return createXml(fetchQuery.EntityLogicalName, fetchQuery.Attributes, fetchQuery.Fitler, fetchQuery.LinkEntities, fetchQuery.IsDistinct, fetchQuery.Count, fetchQuery.Page, fetchQuery.PagingCookie);
    }

    function htmlEncode(fetchXml) {
        if (Sonoma.type(fetchXml) === "array") fetchXml = fetchXml.join("");
        if (Sonoma.type(fetchXml) !== "string") {
            fetchXml = fetchXml.toString();
        }
        return fetchXml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // End Private

    // Begin Public
    return {

        /* -- Artificial Classes -- */
        attribute: attribute,
        linkEntity: linkEntity,
        filter: filter,
        condition: condition,
        conditionMultiValue: conditionMultiValue,

        /* -- Transformation Methods --*/
        createXml: createXml,
        createQuery: createQuery,
        stringify: stringify,
        htmlEncode: htmlEncode
    };
    // End Public
})());