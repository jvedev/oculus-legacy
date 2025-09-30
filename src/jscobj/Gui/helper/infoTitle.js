GUI.infoTitle = {};


GUI.infoTitle.prepareDom = function () {
    var pageObjects = XDOM.queryAllScope('[data-title-origin="*LBL"]');
    GUI.infoTitle.registerNodeList(pageObjects);
};

GUI.infoTitle.update = function () {
    var pageObjects = XDOM.queryAllScope('[data-title-origin="*VAR"]');
    GUI.infoTitle.registerNodeList(pageObjects);
};

GUI.infoTitle.registerNodeList = function (nodeList) {
    for (var i = 0, l = nodeList.length; i < l; i++) {
        GUI.infoTitle.register(nodeList[i]);
    }
};

GUI.infoTitle.register = function (id, captions) {
    var obj = XDOM.getObject(id);
    if (!obj) {
        return;
    }
    var title = '';

    var captionCode = obj.getAttribute('data-title-variable');
    var recordNr = getClientRecordNr(obj);
    switch (obj.getAttribute('data-title-origin')) {
        case '*VAR':
            if (recordNr != null) {
                title = SESSION.activeData.subfileData[recordNr][captionCode];
            } else {
                title = SESSION.activeData.headerData[captionCode];
            }
            title = XDOM.hexDecode(title);
            break;
        case '*LBL':

            if (isStatelessObject(obj)) {
                title = Stateless.Page.getCaption(captionCode);
                if (title) {
                    break;
                }
            }
            title = getCapt(captionCode);
            break;
        default:
            title = captions;
            break;
    }
    obj.setAttribute('title', title);
    return;
};
