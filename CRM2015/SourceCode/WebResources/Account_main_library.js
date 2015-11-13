/// <reference path="../../Common/XrmPageTemplate.js" />
/// <reference path="../../Common/new_CRM.Utils.js" />
/// <reference path="../../Common/new_softtek_scripts_util_dynamicform.js" />
/**
* @author jesse.zhang
*/

var SVoptions;
var OrganizedArray = new Array();

function Filter_SofttekVertical() {
  
}

function Form_onload() {
    SVoptions = Xrm.Page.getAttribute("new_softtekvertical1").getOptions();
    if (SVoptions[0].text == "") {
        SVoptions.shift();
    }
    Filter_SofttekVertical();
    Xrm.Page.Cascades.Deprecate("new_serviceoffering", ["100000008"]);

    Xrm.Page.Cascades.Filter("new_serviceoffering");

    var status = Xrm.Page.getAttribute("statecode").getValue();
    if (status == 1) {
        Xrm.Page.getControl("new_softtekvertical1").setDisabled(true);
    }
}

function DragDrop(args) {
    args.moveText = args.moveText || "";

    if (!args.obj) return;
    if (!args.target) return;

    isIE = document.all;
    var obj = args.obj;
    obj.style.cursor = "move";
    obj.onmousedown = function (e) { //????
        if (!document.all) e.preventDefault();
        document.body.style.cursor = 'default';
        if (args.dragStart) {
            args.dragStart(this);
        }
        var opos = getObjPos(this);
        var cpos = getCurPos(e);
        this.moveFlag = true;
        var md = document.createElement("div");
        document.body.appendChild(md);
        this.md = md;

        with(md.style) { //???????
            position = "absolute";
            border = "1px solid #f00";
            background = "transparent";
            fontSize = "19pt";

            md.innerHTML = args.moveText;
            height = (this.offsetHeight - (isIE ? 2 : 2)) + "px";
            if (args.moveText == "") width = (this.offsetWidth - (isIE ? 0 : 2)) + "px";
            top = cpos.y - parseInt(md.offsetHeight);
            left = cpos.x - parseInt(md.offsetWidth) / 2;
        }

        obj.target = null;
        tas = args.target;
        ts = new Array();
        tas.length ? ts = tas : ts[0] = tas;
        tsc = ts.length;
        obj.docMmove = document.onmousemove;
        document.onmousemove = function (e) { //????
            if (!obj.moveFlag) return false;
            document.body.style.cursor = 'default';
            var Pos = getCurPos(e);
            obj.target = null;
            var nmd = obj.md;
            nmd.style.left = Pos.x - parseInt(nmd.offsetWidth) / 2 + 'px';
            nmd.style.top = Pos.y - parseInt(nmd.offsetHeight) + 'px';
            if (args.btouch) for (i = 0; i < tsc; i++) {
                args.btouch(ts[i]);
            }
            for (i = tsc - 1; i >= 0; i--) {
                if (checkTouch(nmd, ts[i]) && args.touch) {
                    obj.target = ts[i];
                    args.touch(obj);
                    break;
                }
            }
            return false;
        };
        obj.docContextMenu = document.oncontextmenu;
        document.oncontextmenu = function () {
            return false;
        };
        obj.docMup = document.onmouseup;
        document.onmouseup = function (e) { //????
            obj.moveFlag = false;
            document.body.style.cursor = 'auto';
            if (obj.md) document.body.removeChild(obj.md);
            if (obj.onmouseup) obj.onmouseup();

            if (args.dragEnd && obj.target) {
                args.btouch(obj.target);
                args.dragEnd(obj);
                obj.target = null;
            }
            setTimeout(function () { //??????
                document.onmouseup = obj.docMup;
                obj.docMup = null;
                document.oncontextmenu = obj.docContextMenu;
                obj.docContextMenu = null;
                document.onmousemove = obj.docMmove;
                obj.docMmove = null;
            },
            10);
        };

    };
    //????DIV?????
    function checkTouch(o1, o2) {
        p1 = getObjPos(o1);
        p2 = getObjPos(o2);
        x1 = p1.x;
        y1 = p1.y;
        x2 = p2.x;
        y2 = p2.y;
        w1 = o1.offsetWidth;
        h1 = o1.offsetHeight;
        w2 = o2.offsetWidth;
        h2 = o2.offsetHeight;
        return ((x1 - x2 <= 0) && (x2 - x1 < w1) || (x1 - x2 >= 0) && (x1 - x2 < w2)) && ((y1 - y2 <= 0) && (y2 - y1 < h1) || (y1 - y2 >= 0) && (y1 - y2 < h2));
    };
    //????????????
    function getObjPos(o) {
        var x = y = 0;
        if (o.getBoundingClientRect) {
            var box = o.getBoundingClientRect();
            var D = document.documentElement;
            x = box.left + Math.max(D.scrollLeft, document.body.scrollLeft) - D.clientLeft;
            y = box.top + Math.max(D.scrollTop, document.body.scrollTop) - D.clientTop;
        }
        else {
            for (; o != document.body; x += o.offsetLeft, y += o.offsetTop, o = o.offsetParent);
        }
        return {
            'x': x,
            'y': y
        };
    };
    //????????
    function getCurPos(e) {
        e = e || window.event;
        var D = document.documentElement;
        if (e.pageX) return {
            x: e.pageX,
            y: e.pageY
        };
        return {
            x: e.clientX + D.scrollLeft - D.clientLeft,
            y: e.clientY + D.scrollTop - D.clientTop
        };
    };
}

function drag(oo) {
    DragDrop({
        obj: oo,
        //????
        moveText : '',
        //?????
        //????????,o?????
        dragStart : function (o) {
            o.style.background = '#f00';
        },

        //???????????,o?????,o.target?????
        //??????????????,???????
        dragEnd : function (o) {
            rebuildTree(o.id, o.target.id)
            // back(o);
        },

        //????,????
        target : ObjectList,

        //???????????,??????,t?????, ???????????
        btouch : function (t) {
            fbtouch(t)
        },

        //??????????,????, o?????,
        //o.target??????,???????????
        touch : function (o) {
            ftouch(o)
        }
    });
}

function fbtouch(t) {
    t.style.border = "1px solid black";
}

function ftouch(o) {
    o.target.style.border = "2px solid red";
}

function rebuildTree(source, destination) {
    var num1, num2;
    for (var i = 0; i < oldArray.length; i++) {
        if (oldArray[i][0] == source) {
            num1 = i;
        }
        if (oldArray[i][0] == destination) {
            num2 = i;
        }
    }
    if (num1 != null && num2 != null && num1 != num2) {
        oldArray[num1][1] = oldArray[num2][0];

        OrganizedArray = null;
        OrganizedArray = new Array();
        for (var i = 0; i < oldArray.length; i++) {
            OrganizedArray[i] = new Array(oldArray[i].length);
        }
        generateOrganizedArray();
        drawTree(OrganizedArray);
    }
}

function updateObjectList() {
    ObjectList = [];
    for (var i = 0; i < OrganizedArray.length; i++) {
        ObjectList.push(document.getElementById(OrganizedArray[i][0]));
        drag(document.getElementById(OrganizedArray[i][0]));
    }
}
/**
* @author joyyang ,modified by jesse.zhang
*/
// append div for holding tree
function initialize() {
    ObjectList = [];

    var displayDiv = "<a href='javascript:t.collapseAll();'>Collapse All</a><br/><a href='javascript:t.expandAll();'>Expand All</a><br/><div id='myTreeContainer' style='overflow:scroll'>&nbsp;</div>";
    var Otree = document.getElementById("new_orgnizationtree_d");
    Otree.innerHTML = displayDiv;
    Otree.width = '800px';
    Otree.height = '600px';

    var xmlStr = document.createElement("xml:namespace");
    xmlStr.setAttribute('ns', 'urn:schemas-microsoft-com:vml');
    xmlStr.setAttribute('prefix', 'v');
    document.getElementsByTagName('head')[0].appendChild(xmlStr);
    createStyleSheet('v\\:*{ behavior:url(#default#VML);}', '')
    LoadECOTreeCSS();
}
//------------ ECOTree CSS Start-------------------------------------------------
function LoadECOTreeCSS() {
    var str = "";
    str = str + ".maingroup {";
    str = str + "position: absolute;";
    str = str + "width: 980px;";
    str = str + "height: 570px;";
    str = str + "overflow: scroll;";
    str = str + "}";

    str = str + ".maindiv {";
    str = str + "position: relative;";
    str = str + "width: 980px;";
    str = str + "height: 570px;";
    str = str + "overflow: scroll;";
    str = str + "}";

    str = str + ".econode {";
    str = str + "position: absolute;";
    str = str + "text-overflow: clip;";
    str = str + "font-family: Verdana, Geneva, Arial, Helvetica, sans-serif;";
    str = str + "font-size: 8px;";
    str = str + "padding: 2px;";
    str = str + "}";

    str = str + "a.ecolink:visited {";
    str = str + "text-decoration: none;	";
    str = str + "color: black;";
    str = str + "}";

    str = str + "a.ecolink:hover {";
    str = str + "text-decoration: underline;";
    str = str + "}";

    str = str + ".copy {";
    str = str + "			font-family : 'Verdana';";
    str = str + "			font-size : 10px;";
    str = str + "			color : #CCCCCC;";
    str = str + "		}";

    str = str + "a : hover{";
    str = str + "text-decoration: underline;";
    str = str + "}";

    createStyleSheet(str, 'cssTree1')
}

function createStyleSheet(cssText, id) {
    var doc = document;
    var ss;
    var head = doc.getElementsByTagName("head")[0];
    var rules = doc.createElement("style");
    rules.setAttribute("type", "text/css");
    if (id) {
        rules.setAttribute("id", id);
    }
    if (true) {
        head.appendChild(rules);
        ss = rules.styleSheet;
        ss.cssText = cssText;
    } else {
        try {
            rules.appendChild(doc.createTextNode(cssText));
        } catch(e) {
            rules.cssText = cssText;
        }
        head.appendChild(rules);
        ss = rules.styleSheet ? rules.styleSheet : (rules.sheet || doc.styleSheets[doc.styleSheets.length - 1]);
    }
    cacheStyleSheet(ss);
    return ss;
}

function cacheStyleSheet(ss) {
    var rules = {};
    try {
        var ssRules = ss.cssRules || ss.rules;
        for (var j = ssRules.length - 1; j >= 0; --j) {
            rules[ssRules[j].selectorText] = ssRules[j];
        }
    } catch(e) {}
}

//------------ ECOTree CSS End-------------------------------------------------
//------------ ECOTree JS Start-------------------------------------------------
ECONode = function (id, pid, dsc, con, w, h, c, bc, target, meta) {
    this.id = id;
    this.pid = pid;
    this.dsc = dsc;
    this.con = con;
    this.w = w;
    this.h = h;
    this.c = c;
    this.bc = bc;
    this.target = target;
    this.meta = meta;

    this.siblingIndex = 0;
    this.dbIndex = 0;

    this.XPosition = 0;
    this.YPosition = 0;
    this.prelim = 0;
    this.modifier = 0;
    this.leftNeighbor = null;
    this.rightNeighbor = null;
    this.nodeParent = null;
    this.nodeChildren = [];

    this.isCollapsed = false;
    this.canCollapse = false;

    this.isSelected = false;
}

ECONode.prototype._getLevel = function () {
    if (this.nodeParent.id == -1) {
        return 0;
    }
    else return this.nodeParent._getLevel() + 1;
}

ECONode.prototype._isAncestorCollapsed = function () {
    if (this.nodeParent.isCollapsed) {
        return true;
    }
    else {
        if (this.nodeParent.id == -1) {
            return false;
        }
        else {
            return this.nodeParent._isAncestorCollapsed();
        }
    }
}

ECONode.prototype._setAncestorsExpanded = function () {
    if (this.nodeParent.id == -1) {
        return;
    }
    else {
        this.nodeParent.isCollapsed = false;
        return this.nodeParent._setAncestorsExpanded();
    }
}

ECONode.prototype._getChildrenCount = function () {
    if (this.isCollapsed) return 0;
    if (this.nodeChildren == null) return 0;
    else return this.nodeChildren.length;
}

ECONode.prototype._getLeftSibling = function () {
    if (this.leftNeighbor != null && this.leftNeighbor.nodeParent == this.nodeParent) return this.leftNeighbor;
    else return null;
}

ECONode.prototype._getRightSibling = function () {
    if (this.rightNeighbor != null && this.rightNeighbor.nodeParent == this.nodeParent) return this.rightNeighbor;
    else return null;
}

ECONode.prototype._getChildAt = function (i) {
    return this.nodeChildren[i];
}

ECONode.prototype._getChildrenCenter = function (tree) {
    node = this._getFirstChild();
    node1 = this._getLastChild();
    return node.prelim + ((node1.prelim - node.prelim) + tree._getNodeSize(node1)) / 2;
}

ECONode.prototype._getFirstChild = function () {
    return this._getChildAt(0);
}

ECONode.prototype._getLastChild = function () {
    return this._getChildAt(this._getChildrenCount() - 1);
}

ECONode.prototype._drawChildrenLinks = function (tree) {
    var s = [];
    var xa = 0,
    ya = 0,
    xb = 0,
    yb = 0,
    xc = 0,
    yc = 0,
    xd = 0,
    yd = 0;
    var node1 = null;

    switch (tree.config.iRootOrientation) {
    case ECOTree.RO_TOP:
        xa = this.XPosition + (this.w / 2);
        ya = this.YPosition + this.h;
        break;

    case ECOTree.RO_BOTTOM:
        xa = this.XPosition + (this.w / 2);
        ya = this.YPosition;
        break;

    case ECOTree.RO_RIGHT:
        xa = this.XPosition;
        ya = this.YPosition + (this.h / 2);
        break;

    case ECOTree.RO_LEFT:
        xa = this.XPosition + this.w;
        ya = this.YPosition + (this.h / 2);
        break;
    }

    for (var k = 0; k < this.nodeChildren.length; k++) {
        node1 = this.nodeChildren[k];

        switch (tree.config.iRootOrientation) {
        case ECOTree.RO_TOP:
            xd = xc = node1.XPosition + (node1.w / 2);
            yd = node1.YPosition;
            xb = xa;
            switch (tree.config.iNodeJustification) {
            case ECOTree.NJ_TOP:
                yb = yc = yd - tree.config.iLevelSeparation / 2;
                break;
            case ECOTree.NJ_BOTTOM:
                yb = yc = ya + tree.config.iLevelSeparation / 2;
                break;
            case ECOTree.NJ_CENTER:
                yb = yc = ya + (yd - ya) / 2;
                break;
            }
            break;

        case ECOTree.RO_BOTTOM:
            xd = xc = node1.XPosition + (node1.w / 2);
            yd = node1.YPosition + node1.h;
            xb = xa;
            switch (tree.config.iNodeJustification) {
            case ECOTree.NJ_TOP:
                yb = yc = yd + tree.config.iLevelSeparation / 2;
                break;
            case ECOTree.NJ_BOTTOM:
                yb = yc = ya - tree.config.iLevelSeparation / 2;
                break;
            case ECOTree.NJ_CENTER:
                yb = yc = yd + (ya - yd) / 2;
                break;
            }
            break;

        case ECOTree.RO_RIGHT:
            xd = node1.XPosition + node1.w;
            yd = yc = node1.YPosition + (node1.h / 2);
            yb = ya;
            switch (tree.config.iNodeJustification) {
            case ECOTree.NJ_TOP:
                xb = xc = xd + tree.config.iLevelSeparation / 2;
                break;
            case ECOTree.NJ_BOTTOM:
                xb = xc = xa - tree.config.iLevelSeparation / 2;
                break;
            case ECOTree.NJ_CENTER:
                xb = xc = xd + (xa - xd) / 2;
                break;
            }
            break;

        case ECOTree.RO_LEFT:
            xd = node1.XPosition;
            yd = yc = node1.YPosition + (node1.h / 2);
            yb = ya;
            switch (tree.config.iNodeJustification) {
            case ECOTree.NJ_TOP:
                xb = xc = xd - tree.config.iLevelSeparation / 2;
                break;
            case ECOTree.NJ_BOTTOM:
                xb = xc = xa + tree.config.iLevelSeparation / 2;
                break;
            case ECOTree.NJ_CENTER:
                xb = xc = xa + (xd - xa) / 2;
                break;
            }
            break;
        }

        switch (tree.render) {
        case "CANVAS":
            tree.ctx.save();
            tree.ctx.strokeStyle = tree.config.linkColor;
            tree.ctx.beginPath();
            switch (tree.config.linkType) {
            case "M":
                tree.ctx.moveTo(xa, ya);
                tree.ctx.lineTo(xb, yb);
                tree.ctx.lineTo(xc, yc);
                tree.ctx.lineTo(xd, yd);
                break;

            case "B":
                tree.ctx.moveTo(xa, ya);
                tree.ctx.bezierCurveTo(xb, yb, xc, yc, xd, yd);
                break;
            }
            tree.ctx.stroke();
            tree.ctx.restore();
            break;

        case "VML":
            switch (tree.config.linkType) {
            case "M":
                s.push('<v:polyline points="');
                s.push(xa + ' ' + ya + ' ' + xb + ' ' + yb + ' ' + xc + ' ' + yc + ' ' + xd + ' ' + yd);
                s.push('" strokecolor="' + tree.config.linkColor + '"><v:fill on="false" /></v:polyline>');
                break;
            case "B":
                s.push('<v:curve from="');
                s.push(xa + ' ' + ya + '" control1="' + xb + ' ' + yb + '" control2="' + xc + ' ' + yc + '" to="' + xd + ' ' + yd);
                s.push('" strokecolor="' + tree.config.linkColor + '"><v:fill on="false" /></v:curve>');
                break;
            }
            break;

        }
    }

    return s.join('');
}

ECOTree = function (obj, elm) {
    this.config = {
        iMaxDepth: 100,
        iLevelSeparation: 40,
        iSiblingSeparation: 40,
        iSubtreeSeparation: 80,
        iRootOrientation: ECOTree.RO_TOP,
        iNodeJustification: ECOTree.NJ_TOP,
        topXAdjustment: 0,
        topYAdjustment: 0,
        render: "AUTO",
        linkType: "M",
        linkColor: "blue",
        nodeColor: "#CCCCFF",
        nodeFill: ECOTree.NF_GRADIENT,
        nodeBorderColor: "blue",
        nodeSelColor: "#FFFFCC",
        levelColors: ["#5555FF", "#8888FF", "#AAAAFF", "#CCCCFF"],
        levelBorderColors: ["#5555FF", "#8888FF", "#AAAAFF", "#CCCCFF"],
        colorStyle: ECOTree.CS_NODE,
        useTarget: true,
        searchMode: ECOTree.SM_DSC,
        selectMode: ECOTree.SL_MULTIPLE,
        defaultNodeWidth: 80,
        defaultNodeHeight: 40,
        defaultTarget: 'javascript:void(0);',
        /*expandedImage : './img/less.gif',
        collapsedImage : './img/plus.gif',
        transImage : './img/trans.gif'*/
        expandedImage: 'https://rc.crm.dynamics.com/rc/regcont/en_us/live/articles/arrowdown.gif',
        collapsedImage: 'https://rc.crm.dynamics.com/rc/regcont/en_us/live/articles/arrowright.gif',
        transImage: './img/trans.gif'
    }

    this.version = "1.1";
    this.obj = obj;
    this.elm = document.getElementById(elm);
    this.self = this;
    this.render = (this.config.render == "AUTO") ? ECOTree._getAutoRenderMode() : this.config.render;
    this.ctx = null;
    this.canvasoffsetTop = 0;
    this.canvasoffsetLeft = 0;

    this.maxLevelHeight = [];
    this.maxLevelWidth = [];
    this.previousLevelNode = [];

    this.rootYOffset = 0;
    this.rootXOffset = 0;

    this.nDatabaseNodes = [];
    this.mapIDs = {};

    this.root = new ECONode(-1, null, null, 2, 2);
    this.iSelectedNode = -1;
    this.iLastSearch = 0;

}

//Constant values
//Tree orientation
ECOTree.RO_TOP = 0;
ECOTree.RO_BOTTOM = 1;
ECOTree.RO_RIGHT = 2;
ECOTree.RO_LEFT = 3;

//Level node alignment
ECOTree.NJ_TOP = 0;
ECOTree.NJ_CENTER = 1;
ECOTree.NJ_BOTTOM = 2;

//Node fill type
ECOTree.NF_GRADIENT = 0;
ECOTree.NF_FLAT = 1;

//Colorizing style
ECOTree.CS_NODE = 0;
ECOTree.CS_LEVEL = 1;

//Search method: Title, metadata or both
ECOTree.SM_DSC = 0;
ECOTree.SM_META = 1;
ECOTree.SM_BOTH = 2;

//Selection mode: single, multiple, no selection
ECOTree.SL_MULTIPLE = 0;
ECOTree.SL_SINGLE = 1;
ECOTree.SL_NONE = 2;

ECOTree._getAutoRenderMode = function () {
    var r = "VML";
    var is_ie6 = /msie 6\.0/i.test(navigator.userAgent);
    var is_ff = /Firefox/i.test(navigator.userAgent);
    if (is_ff) r = "CANVAS";
    return r;
}

//CANVAS functions...
ECOTree._roundedRect = function (ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
    ctx.lineTo(x + width - radius, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    ctx.lineTo(x + width, y + radius);
    ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
    ctx.lineTo(x + radius, y);
    ctx.quadraticCurveTo(x, y, x, y + radius);
    ctx.fill();
    ctx.stroke();
}

ECOTree._canvasNodeClickHandler = function (tree, target, nodeid) {
    if (target != nodeid) return;
    tree.selectNode(nodeid, true);
}

//Layout algorithm
ECOTree._firstWalk = function (tree, node, level) {
    var leftSibling = null;

    node.XPosition = 0;
    node.YPosition = 0;
    node.prelim = 0;
    node.modifier = 0;
    node.leftNeighbor = null;
    node.rightNeighbor = null;
    tree._setLevelHeight(node, level);
    tree._setLevelWidth(node, level);
    tree._setNeighbors(node, level);
    if (node._getChildrenCount() == 0 || level == tree.config.iMaxDepth) {
        leftSibling = node._getLeftSibling();
        if (leftSibling != null) node.prelim = leftSibling.prelim + tree._getNodeSize(leftSibling) + tree.config.iSiblingSeparation;
        else node.prelim = 0;
    }
    else {
        var n = node._getChildrenCount();
        for (var i = 0; i < n; i++) {
            var iChild = node._getChildAt(i);
            ECOTree._firstWalk(tree, iChild, level + 1);
        }

        var midPoint = node._getChildrenCenter(tree);
        midPoint -= tree._getNodeSize(node) / 2;
        leftSibling = node._getLeftSibling();
        if (leftSibling != null) {
            node.prelim = leftSibling.prelim + tree._getNodeSize(leftSibling) + tree.config.iSiblingSeparation;
            node.modifier = node.prelim - midPoint;
            ECOTree._apportion(tree, node, level);
        }
        else {
            node.prelim = midPoint;
        }
    }
}

ECOTree._apportion = function (tree, node, level) {
    var firstChild = node._getFirstChild();
    var firstChildLeftNeighbor = firstChild.leftNeighbor;
    var j = 1;
    for (var k = tree.config.iMaxDepth - level; firstChild != null && firstChildLeftNeighbor != null && j <= k;) {
        var modifierSumRight = 0;
        var modifierSumLeft = 0;
        var rightAncestor = firstChild;
        var leftAncestor = firstChildLeftNeighbor;
        for (var l = 0; l < j; l++) {
            rightAncestor = rightAncestor.nodeParent;
            leftAncestor = leftAncestor.nodeParent;
            modifierSumRight += rightAncestor.modifier;
            modifierSumLeft += leftAncestor.modifier;
        }

        var totalGap = (firstChildLeftNeighbor.prelim + modifierSumLeft + tree._getNodeSize(firstChildLeftNeighbor) + tree.config.iSubtreeSeparation) - (firstChild.prelim + modifierSumRight);
        if (totalGap > 0) {
            var subtreeAux = node;
            var numSubtrees = 0;
            for (; subtreeAux != null && subtreeAux != leftAncestor; subtreeAux = subtreeAux._getLeftSibling())
            numSubtrees++;

            if (subtreeAux != null) {
                var subtreeMoveAux = node;
                var singleGap = totalGap / numSubtrees;
                for (; subtreeMoveAux != leftAncestor; subtreeMoveAux = subtreeMoveAux._getLeftSibling()) {
                    subtreeMoveAux.prelim += totalGap;
                    subtreeMoveAux.modifier += totalGap;
                    totalGap -= singleGap;
                }

            }
        }
        j++;
        if (firstChild._getChildrenCount() == 0) firstChild = tree._getLeftmost(node, 0, j);
        else firstChild = firstChild._getFirstChild();
        if (firstChild != null) firstChildLeftNeighbor = firstChild.leftNeighbor;
    }
}

ECOTree._secondWalk = function (tree, node, level, X, Y) {
    if (level <= tree.config.iMaxDepth) {
        var xTmp = tree.rootXOffset + node.prelim + X;
        var yTmp = tree.rootYOffset + Y;
        var maxsizeTmp = 0;
        var nodesizeTmp = 0;
        var flag = false;

        switch (tree.config.iRootOrientation) {
        case ECOTree.RO_TOP:
            case ECOTree.RO_BOTTOM:
            maxsizeTmp = tree.maxLevelHeight[level];
            nodesizeTmp = node.h;
            break;

        case ECOTree.RO_RIGHT:
            case ECOTree.RO_LEFT:
            maxsizeTmp = tree.maxLevelWidth[level];
            flag = true;
            nodesizeTmp = node.w;
            break;
        }
        switch (tree.config.iNodeJustification) {
        case ECOTree.NJ_TOP:
            node.XPosition = xTmp;
            node.YPosition = yTmp;
            break;

        case ECOTree.NJ_CENTER:
            node.XPosition = xTmp;
            node.YPosition = yTmp + (maxsizeTmp - nodesizeTmp) / 2;
            break;

        case ECOTree.NJ_BOTTOM:
            node.XPosition = xTmp;
            node.YPosition = (yTmp + maxsizeTmp) - nodesizeTmp;
            break;
        }
        if (flag) {
            var swapTmp = node.XPosition;
            node.XPosition = node.YPosition;
            node.YPosition = swapTmp;
        }
        switch (tree.config.iRootOrientation) {
        case ECOTree.RO_BOTTOM:
            node.YPosition = -node.YPosition - nodesizeTmp;
            break;

        case ECOTree.RO_RIGHT:
            node.XPosition = -node.XPosition - nodesizeTmp;
            break;
        }
        if (node._getChildrenCount() != 0) ECOTree._secondWalk(tree, node._getFirstChild(), level + 1, X + node.modifier, Y + maxsizeTmp + tree.config.iLevelSeparation);
        var rightSibling = node._getRightSibling();
        if (rightSibling != null) ECOTree._secondWalk(tree, rightSibling, level, X, Y);
    }
}

ECOTree.prototype._positionTree = function () {
    this.maxLevelHeight = [];
    this.maxLevelWidth = [];
    this.previousLevelNode = [];
    ECOTree._firstWalk(this.self, this.root, 0);

    switch (this.config.iRootOrientation) {
    case ECOTree.RO_TOP:
        case ECOTree.RO_LEFT:
        this.rootXOffset = this.config.topXAdjustment + this.root.XPosition;
        this.rootYOffset = this.config.topYAdjustment + this.root.YPosition;
        break;

    case ECOTree.RO_BOTTOM:
        case ECOTree.RO_RIGHT:
        this.rootXOffset = this.config.topXAdjustment + this.root.XPosition;
        this.rootYOffset = this.config.topYAdjustment + this.root.YPosition;
    }

    ECOTree._secondWalk(this.self, this.root, 0, 0, 0);
}

ECOTree.prototype._setLevelHeight = function (node, level) {
    if (this.maxLevelHeight[level] == null) this.maxLevelHeight[level] = 0;
    if (this.maxLevelHeight[level] < node.h) this.maxLevelHeight[level] = node.h;
}

ECOTree.prototype._setLevelWidth = function (node, level) {
    if (this.maxLevelWidth[level] == null) this.maxLevelWidth[level] = 0;
    if (this.maxLevelWidth[level] < node.w) this.maxLevelWidth[level] = node.w;
}

ECOTree.prototype._setNeighbors = function (node, level) {
    node.leftNeighbor = this.previousLevelNode[level];
    if (node.leftNeighbor != null) node.leftNeighbor.rightNeighbor = node;
    this.previousLevelNode[level] = node;
}

ECOTree.prototype._getNodeSize = function (node) {
    switch (this.config.iRootOrientation) {
    case ECOTree.RO_TOP:
        case ECOTree.RO_BOTTOM:
        return node.w;

    case ECOTree.RO_RIGHT:
        case ECOTree.RO_LEFT:
        return node.h;
    }
    return 0;
}

ECOTree.prototype._getLeftmost = function (node, level, maxlevel) {
    if (level >= maxlevel) return node;
    if (node._getChildrenCount() == 0) return null;

    var n = node._getChildrenCount();
    for (var i = 0; i < n; i++) {
        var iChild = node._getChildAt(i);
        var leftmostDescendant = this._getLeftmost(iChild, level + 1, maxlevel);
        if (leftmostDescendant != null) return leftmostDescendant;
    }

    return null;
}

ECOTree.prototype._selectNodeInt = function (dbindex, flagToggle) {
    if (this.config.selectMode == ECOTree.SL_SINGLE) {
        if ((this.iSelectedNode != dbindex) && (this.iSelectedNode != -1)) {
            this.nDatabaseNodes[this.iSelectedNode].isSelected = false;
        }
        this.iSelectedNode = (this.nDatabaseNodes[dbindex].isSelected && flagToggle) ? -1 : dbindex;
    }
    this.nDatabaseNodes[dbindex].isSelected = (flagToggle) ? !this.nDatabaseNodes[dbindex].isSelected : true;
}

ECOTree.prototype._collapseAllInt = function (flag) {
    var node = null;
    for (var n = 0; n < this.nDatabaseNodes.length; n++) {
        node = this.nDatabaseNodes[n];
        if (node.canCollapse) node.isCollapsed = flag;
    }
    this.UpdateTree();
}

ECOTree.prototype._selectAllInt = function (flag) {
    var node = null;
    for (var k = 0; k < this.nDatabaseNodes.length; k++) {
        node = this.nDatabaseNodes[k];
        node.isSelected = flag;
    }
    this.iSelectedNode = -1;
    this.UpdateTree();
}

ECOTree.prototype._drawTree = function () {
    var s = [];
    var node = null;
    var color = "";
    var border = "";

    for (var n = 0; n < this.nDatabaseNodes.length; n++) {
        node = this.nDatabaseNodes[n];

        switch (this.config.colorStyle) {
        case ECOTree.CS_NODE:
            color = node.c;
            border = node.bc;
            break;
        case ECOTree.CS_LEVEL:
            var iColor = node._getLevel() % this.config.levelColors.length;
            color = this.config.levelColors[iColor];
            iColor = node._getLevel() % this.config.levelBorderColors.length;
            border = this.config.levelBorderColors[iColor];
            break;
        }

        if (!node._isAncestorCollapsed()) {
            switch (this.render) {
            case "CANVAS":
                //Canvas part...
                this.ctx.save();
                this.ctx.strokeStyle = border;
                switch (this.config.nodeFill) {
                case ECOTree.NF_GRADIENT:
                    var lgradient = this.ctx.createLinearGradient(node.XPosition, 0, node.XPosition + node.w, 0);
                    lgradient.addColorStop(0.0, ((node.isSelected) ? this.config.nodeSelColor : color));
                    lgradient.addColorStop(1.0, "#F5FFF5");
                    this.ctx.fillStyle = lgradient;
                    break;

                case ECOTree.NF_FLAT:
                    this.ctx.fillStyle = ((node.isSelected) ? this.config.nodeSelColor : color);
                    break;
                }

                ECOTree._roundedRect(this.ctx, node.XPosition, node.YPosition, node.w, node.h, 5);
                this.ctx.restore();

                //HTML part...
                s.push('<div id="' + node.id + '" class="econode" style="{top:' + (node.YPosition + this.canvasoffsetTop) + '; left:' + (node.XPosition + this.canvasoffsetLeft) + '; width:' + node.w + '; height:' + node.h + ';}" ');
                if (this.config.selectMode != ECOTree.SL_NONE) s.push('onclick="javascript:ECOTree._canvasNodeClickHandler(' + this.obj + ',event.target.id,\'' + node.id + '\');" ');
                s.push('>');
                s.push('<font face=Verdana size=1>');
                if (node.canCollapse) {
                    s.push('<a id="c' + node.id + '" href="javascript:' + this.obj + '.collapseNode(\'' + node.id + '\', true);" >');
                    s.push('<img border=0 src="' + ((node.isCollapsed) ? this.config.collapsedImage : this.config.expandedImage) + '" >');
                    s.push('</a>');
                    //s.push('<img src="'+this.config.transImage+'" >');						
                }
                if (node.target && this.config.useTarget) {
                    s.push('<a id="t' + node.id + '" href="' + node.target + '" target=_blank>');
                    s.push(node.dsc);
                    s.push('</a>');
                }
                else {
                    s.push(node.dsc);
                }
                s.push(node.con);
                s.push('</font>');
                s.push('</div>');
                break;

            case "VML":
                s.push('<v:roundrect id="' + node.id + '" strokecolor="' + border + '" arcsize="0.18"	');
                s.push('style="position:absolute; top:' + node.YPosition + '; left:' + node.XPosition + '; width:' + node.w + '; height:' + node.h + '" ');
                if (this.config.selectMode != ECOTree.SL_NONE) s.push('href="javascript:' + this.obj + '.selectNode(\'' + node.id + '\', true);" ');
                s.push('>');
                s.push('<v:textbox inset="0.5px,0.5px,0.5px,0.5px" ><font face=Verdana size=1>');
                if (node.canCollapse) {
                    s.push('<a href="javascript:' + this.obj + '.collapseNode(\'' + node.id + '\', true);" >');
                    s.push('<img border=0 src="' + ((node.isCollapsed) ? this.config.collapsedImage : this.config.expandedImage) + '" >');
                    s.push('</a>');
                    //s.push('<img src="'+this.config.transImage+'" >');						
                }
                if (node.target && this.config.useTarget) {
                    s.push('<a href="' + node.target + '" target=_blank>');
                    s.push(node.dsc);
                    s.push('</a>');
                }
                else {
                    s.push(node.dsc);
                }
                s.push(node.con);
                s.push('</font></v:textbox>');
                switch (this.config.nodeFill) {
                case ECOTree.NF_GRADIENT:
                    s.push('<v:fill type=gradient color2="' + ((node.isSelected) ? this.config.nodeSelColor : color) + '" color="#F5FFF5" angle=90 />');
                    break;
                case ECOTree.NF_FLAT:
                    s.push('<v:fill type="solid" color="' + ((node.isSelected) ? this.config.nodeSelColor : color) + '" />');
                    break;
                }
                s.push('<v:shadow type="single" on="true" opacity="0.7" />');
                s.push('</v:roundrect>');
                break;
            }
            if (!node.isCollapsed) s.push(node._drawChildrenLinks(this.self));
        }
    }
    return s.join('');
}

ECOTree.prototype.toString = function () {
    var s = [];

    this._positionTree();

    switch (this.render) {
    case "CANVAS":
        s.push('<canvas id="ECOTreecanvas" width=2000 height=2000></canvas>');
        break;

    case "HTML":
        s.push('<div class="maindiv">');
        s.push(this._drawTree());
        s.push('</div>');
        break;

    case "VML":
        s.push('<v:group coordsize="10000, 10000" coordorigin="0, 0" style="position:absolute;width=10000px;height=10000px;" >');
        s.push(this._drawTree());
        s.push('</v:group>');
        break;
    }

    return s.join('');
}

// ECOTree API begins here...
ECOTree.prototype.UpdateTree = function () {
    this.elm.innerHTML = this;
    if (this.render == "CANVAS") {
        var canvas = document.getElementById("ECOTreecanvas");
        if (canvas && canvas.getContext) {
            this.canvasoffsetLeft = canvas.offsetLeft;
            this.canvasoffsetTop = canvas.offsetTop;
            this.ctx = canvas.getContext('2d');
            var h = this._drawTree();
            var r = this.elm.ownerDocument.createRange();
            r.setStartBefore(this.elm);
            var parsedHTML = r.createContextualFragment(h);
            //this.elm.parentNode.insertBefore(parsedHTML,this.elm)
            //this.elm.parentNode.appendChild(parsedHTML);
            this.elm.appendChild(parsedHTML);
            //this.elm.insertBefore(parsedHTML,this.elm.firstChild);
        }
    }
}

ECOTree.prototype.add = function (id, pid, dsc, con, w, h, c, bc, target, meta) {
    var nw = w || this.config.defaultNodeWidth; //Width, height, colors, target and metadata defaults...
    var nh = h || this.config.defaultNodeHeight;
    var color = c || this.config.nodeColor;
    var border = bc || this.config.nodeBorderColor;
    var tg = (this.config.useTarget) ? ((typeof target == "undefined") ? (this.config.defaultTarget) : target) : null;
    var metadata = (typeof meta != "undefined") ? meta : "";

    var pnode = null; //Search for parent node in database
    if (pid == -1) {
        pnode = this.root;
    }
    else {
        for (var k = 0; k < this.nDatabaseNodes.length; k++) {
            if (this.nDatabaseNodes[k].id == pid) {
                pnode = this.nDatabaseNodes[k];
                break;
            }
        }
    }

    var node = new ECONode(id, pid, dsc, con, nw, nh, color, border, tg, metadata); //New node creation...
    node.nodeParent = pnode; //Set it's parent
    pnode.canCollapse = true; //It's obvious that now the parent can collapse	
    var i = this.nDatabaseNodes.length; //Save it in database
    node.dbIndex = this.mapIDs[id] = i;
    this.nDatabaseNodes[i] = node;
    var h = pnode.nodeChildren.length; //Add it as child of it's parent
    node.siblingIndex = h;
    pnode.nodeChildren[h] = node;
}

ECOTree.prototype.searchNodes = function (str) {
    var node = null;
    var m = this.config.searchMode;
    var sm = (this.config.selectMode == ECOTree.SL_SINGLE);

    if (typeof str == "undefined") return;
    if (str == "") return;

    var found = false;
    var n = (sm) ? this.iLastSearch : 0;
    if (n == this.nDatabaseNodes.length) n = this.iLastSeach = 0;

    str = str.toLocaleUpperCase();

    for (; n < this.nDatabaseNodes.length; n++) {
        node = this.nDatabaseNodes[n];
        if (node.dsc.toLocaleUpperCase().indexOf(str) != -1 && ((m == ECOTree.SM_DSC) || (m == ECOTree.SM_BOTH))) {
            node._setAncestorsExpanded();
            this._selectNodeInt(node.dbIndex, false);
            found = true;
        }
        if (node.meta.toLocaleUpperCase().indexOf(str) != -1 && ((m == ECOTree.SM_META) || (m == ECOTree.SM_BOTH))) {
            node._setAncestorsExpanded();
            this._selectNodeInt(node.dbIndex, false);
            found = true;
        }
        if (sm && found) {
            this.iLastSearch = n + 1;
            break;
        }
    }
    this.UpdateTree();
    return node; // added by Joy
}

ECOTree.prototype.selectAll = function () {
    if (this.config.selectMode != ECOTree.SL_MULTIPLE) return;
    this._selectAllInt(true);
}

ECOTree.prototype.unselectAll = function () {
    this._selectAllInt(false);
}

ECOTree.prototype.collapseAll = function () {
    this._collapseAllInt(true);
    updateObjectList();
}

ECOTree.prototype.expandAll = function () {
    this._collapseAllInt(false);
    updateObjectList();
}

ECOTree.prototype.collapseNode = function (nodeid, upd) {
    var dbindex = this.mapIDs[nodeid];
    this.nDatabaseNodes[dbindex].isCollapsed = !this.nDatabaseNodes[dbindex].isCollapsed;
    if (upd) this.UpdateTree();
    updateObjectList();
}

ECOTree.prototype.selectNode = function (nodeid, upd) {
    this._selectNodeInt(this.mapIDs[nodeid], true);
    if (upd) this.UpdateTree();
    updateObjectList();
}

ECOTree.prototype.setNodeTitle = function (nodeid, title, upd) {
    var dbindex = this.mapIDs[nodeid];
    this.nDatabaseNodes[dbindex].dsc = title;
    if (upd) this.UpdateTree();
}

ECOTree.prototype.setNodeMetadata = function (nodeid, meta, upd) {
    var dbindex = this.mapIDs[nodeid];
    this.nDatabaseNodes[dbindex].meta = meta;
    if (upd) this.UpdateTree();
}

ECOTree.prototype.setNodeTarget = function (nodeid, target, upd) {
    var dbindex = this.mapIDs[nodeid];
    this.nDatabaseNodes[dbindex].target = target;
    if (upd) this.UpdateTree();
}

ECOTree.prototype.setNodeColors = function (nodeid, color, border, upd) {
    var dbindex = this.mapIDs[nodeid];
    if (color) this.nDatabaseNodes[dbindex].c = color;
    if (border) this.nDatabaseNodes[dbindex].bc = border;
    if (upd) this.UpdateTree();
}

ECOTree.prototype.getSelectedNodes = function () {
    var node = null;
    var selection = [];
    var selnode = null;

    for (var n = 0; n < this.nDatabaseNodes.length; n++) {
        node = this.nDatabaseNodes[n];
        if (node.isSelected) {
            selnode = {
                "id": node.id,
                "dsc": node.dsc,
                "meta": node.meta
            }
            selection[selection.length] = selnode;
        }
    }
    return selection;
}
//------------ ECOTree JS End-------------------------------------------------
// Prepare variables to retrieve the contacts.
//var searchAccount = Xrm.Page.data.entity.getId();
//var searchAccount = Xrm.Page.getAttribute("name").getValue();

function generateOrganizedArray() {
    for (var i = 0; i < oldArray.length; i++) {
        if (oldArray[i][1] == "-1") {
            var n = getFirstEmptyIndex();
            for (var j = 0; j < oldArray[i].length; j++) {
                OrganizedArray[n][j] = oldArray[i][j];
            }
        }
    }
    for (var i = 0; i < OrganizedArray.length; i++) {
        if (OrganizedArray[i][0] != null || OrganizedArray[i][0] != "") {
            putChild(OrganizedArray[i]);
        }
    }
}

function putChild(array) {
    if (getFirstEmptyIndex() == null) return;
    for (var i = 0; i < oldArray.length; i++) {
        if (oldArray[i][1] != "-1") {
            if (array[0] == oldArray[i][1]) {
                var n = getFirstEmptyIndex();
                for (var j = 0; j < oldArray[i].length; j++) {
                    OrganizedArray[n][j] = oldArray[i][j];
                }
                putChild(OrganizedArray[n]);
            }
        }
    }
}

function getFirstEmptyIndex() {
    for (var i = 0; i < OrganizedArray.length; i++) {
        if (OrganizedArray[i][0] == null || OrganizedArray[i][0] == "") {
            return i;
        }
    }
}

function print_2d_string_array(array) {
    document.writeln("<table border>");
    var row;
    for (row = 0; row < array.length; ++row) {
        document.writeln(" <tr>");
        var col;
        for (col = 0; col < array[row].length; ++col)
        document.writeln(" <td>" + array[row][col] + "</td>");
        document.writeln(" </tr>");
    }
    document.writeln("</table>");
}

function drawTree() {
    var myTree = null;
    //function CreateTree() {
    t = new ECOTree('t', 'myTreeContainer');
    t.config.colorStyle = ECOTree.CS_LEVEL;
    t.config.nodeFill = ECOTree.NF_FLAT;
    t.config.useTarget = true;
    t.config.selectMode = ECOTree.SL_NONE;
    t.config.defaultNodeWidth = 130;
    t.config.defaultNodeHeight = 95;
    t.config.iSubtreeSeparation = 10;
    t.config.iSiblingSeparation = 10;
    t.config.iLevelSeparation = 20;
    t.config.levelColors = ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"];
    t.config.levelBorderColors = ["#000066", "#000066", "#000066", "#000066"];
    t.config.nodeColor = "#000066";
    t.config.nodeBorderColor = "#000066";
    t.config.linkColor = "#000066";
    for (var i = 0; i < OrganizedArray.length; i++) {
        var contactID = "";
        var managerContactID = "";
        var fullname = "";
        var new_influencelevel = "";
        var new_perception = "";
        var new_netpromoter = "";
        var new_priority = "";
        var new_budget = "";
        var transactioncurrencyid = "";
        contactID = OrganizedArray[i][0];
        managerContactID = OrganizedArray[i][1];
        fullname = OrganizedArray[i][2];
        new_influencelevel = OrganizedArray[i][3];
        new_perception = OrganizedArray[i][4];
        new_netpromoter = OrganizedArray[i][5];
        new_priority = OrganizedArray[i][6];
        new_budget = OrganizedArray[i][7];
        transactioncurrencyid = OrganizedArray[i][8];

        var limitLen = 13;
        if (fullname != null) {
            fullname = (fullname.length > limitLen) ? fullname.substr(0, limitLen) + ".." : fullname;
        }

        if (new_influencelevel != null) {
            new_influencelevel = (new_influencelevel.length > limitLen) ? new_influencelevel.substr(0, limitLen) + ".." : new_influencelevel;
        }

        if (new_perception != null) {
            new_perception = (new_perception.length > limitLen) ? new_perception.substr(0, limitLen) + ".." : new_perception;
        }

        if (new_netpromoter != null) {
            new_netpromoter = (new_netpromoter.length > limitLen) ? new_netpromoter.substr(0, limitLen) + ".." : new_netpromoter;
        }

        if (new_priority != null) {
            new_priority = (new_priority.length > limitLen) ? new_priority.substr(0, limitLen) + ".." : new_priority;
        }

        var serverUrl = Xrm.Page.context.getClientUrl();
        if (serverUrl.match(/\/$/)) {
            serverUrl = serverUrl.substring(0, serverUrl.length - 1);
        }
        var targetURL = serverUrl + '/sfa/conts/edit.aspx?id=' + contactID;
        var nodesTitle = "<u>" + fullname + "</u>";

        var nodesContent = "<br>IL: " + new_influencelevel;

        nodesContent = nodesContent + "<br>PCT: " + new_perception;
        nodesContent = nodesContent + "<br>NP: " + new_netpromoter;
        nodesContent = nodesContent + "<br>PRT: " + new_priority;
        nodesContent = nodesContent + "<br>Bgt: " + transactioncurrencyid + ' ' + new_budget;

        t.add(contactID, managerContactID, nodesTitle, nodesContent, null, null, null, null, targetURL, null);

    }

    t.UpdateTree();
    updateObjectList();
}
function Form_onsave() {
    SaveOrganizationTree();
    var selectedStatusReason = Xrm.Page.getAttribute("new_validationstatus").getValue();
    if (selectedStatusReason == "100000002") {
        var counter = Xrm.Page.getAttribute("new_ftr").getValue();
        if (counter != null) {
            var countert = counter + 1;
            Xrm.Page.getAttribute("new_ftr").setValue(countert);
        }
        else {
            Xrm.Page.getAttribute("new_ftr").setValue(1);
        }
        Xrm.Page.getAttribute("new_ftr").setSubmitMode("always");

    }
    //location.reload();
}

function SaveOrganizationTree() {
    var CRM_FORM_TYPE_CREATE = 1;
    var CRM_FORM_TYPE_UPDATE = 2;
    if (Xrm.Page.ui.getFormType() == CRM_FORM_TYPE_UPDATE) {
        for (var i = 0; i < OrganizedArray.length; i++) {
            // Prepare variables for updating a contact.
            var contactId = OrganizedArray[i][0];
            var managerContactID = OrganizedArray[i][1];
            var authenticationHeader = Xrm.Page.context.getAuthenticationHeader();

            if (managerContactID != -1) {
                // Prepare the SOAP message.
                var xml = "<?xml version='1.0' encoding='utf-8'?>" + "<soap:Envelope xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'" + " xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'" + " xmlns:xsd='http://www.w3.org/2001/XMLSchema'>" + authenticationHeader + "<soap:Body>" + "<Update xmlns='http://schemas.microsoft.com/crm/2007/WebServices'>" + "<entity xsi:type='contact'>" + "<new_managercontactid>" + managerContactID + "</new_managercontactid>" + "<contactid>" + contactId + "</contactid>" + "</entity>" + "</Update>" + "</soap:Body>" + "</soap:Envelope>";
                // Prepare the xmlHttpObject and send the request.
                var xHReq = new ActiveXObject("Msxml2.XMLHTTP");
                xHReq.Open("POST", "/mscrmservices/2007/CrmService.asmx", false);
                xHReq.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/crm/2007/WebServices/Update");
                xHReq.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
                xHReq.setRequestHeader("Content-Length", xml.length);
                xHReq.send(xml);
                // Capture the result
                var resultXml = xHReq.responseXML;

                // Check for errors.
                var errorCount = resultXml.selectNodes('//error').length;
                if (errorCount != 0) {
                    var msg = resultXml.selectSingleNode('//description').nodeTypedValue;
                    alert(msg);
                }
            }
        }
    }
}

function SofttekMarket_onchange() {
    //Xrm.Page.getAttribute("new_softtekvertical1").setValue(null);
    Filter_SofttekVertical();
}

function MarketScope_onchange() {
    //Xrm.Page.getAttribute("new_softtekvertical1").setValue(null);
    Filter_SofttekVertical();
}