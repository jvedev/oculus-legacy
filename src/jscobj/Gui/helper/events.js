GUI.events = function () {
};

GUI.events.register = function (inp) {
    inp.setAttribute("data-focus-action", "INP.handleOnFocus");
    inp.setAttribute("data-blur-action", "INP.handleOnBlur");
};

GUI.events.keyDown = function () {
    foPanel = XDOM.GLOBAL.getEditWindow();
    if (!foPanel) {
        return false;
    }
    switch (GLOBAL.charCode) {
        case keyCode.enter:
            if (XDOM.GLOBAL.getAttribute('data-datatype') != ENUM.dataType.memo) {
                SESSION.submitFromScope = XDOM.GLOBAL.getAttribute('data-panel-id');
                foPanel.send('ACCEPT', XDOM.GLOBAL.getAttribute('data-real-name'));
            }
            break;
    }
    return true;
};

GUI.events.change = function (foInp) {
    addAttributes(foInp);
    var foPanel = XDOM.getEditWindow(foInp);
    if (!foPanel) {
        return false;
    }
    var foGuiObj = foPanel.getGuiObject(foInp.id);
    foPanel.footer.setMessage();
    foGuiObj.updateByUser();
    GUI.events.autoSubmit(foInp);
    return true;
};


GUI.events.autoSubmit = function (obj) {
    if (!isAutoSubmitField(obj)) {
        return;
    }
    let inp = getCurrendFocused() || obj,
        panel = XDOM.getEditWindow(obj),
        PanelId = XDOM.GLOBAL.getAttribute('data-panel-id');
    realName = obj.dataset.realName;

    SESSION.submitFromScope = PanelId;
    if (inp.dataset.panelId == PanelId) {
        realName = inp.dataset.realName;
    }
    panel.send('ENTER', realName);
} 