function Panel(id, classname,obj) {
    this.id = id;
    this.width = '';
    this.height = '';
    this.title = '';
    this.header = {};
    this.header.title = '';
    this.domObject = null;
    this.guiObject = null;
    this.screenDiv = null;
    this.headerDiv = null;
    this.headerTextDiv = null;
    this.bodyDiv = null;
    Panel.instances[this.id] = this;
    this.alignTo = false;
    this.visible = false;
    this.content = [];
    this.onDrop = null;
    this.onFocus = null;
    this.onShow = null;
    this.onClose = null;
    this.inline = null;
    if (!classname) {
        this.classname = '';
    } else {
        this.classname = classname;
    }



}

Panel.instances = [];

Panel.closePanelClick = function () {
    var id = XDOM.GLOBAL.getAttribute("close-panel-id");
    if (id) {
        if (Panel.instances[id].onClose) {
            Panel.instances[id].onClose();
        }
        Panel.instances[id].close();
        return true;
    }
    return false;
};

Panel.startDragging = function (e, id) {
    if (BrowserDetect.isIE || BrowserDetect.isSafari) {
        return;
    }
    var foEvent = XDOM.getEvent(e);

    if (foEvent.srcElement.id == "MEXIT") {
        return;
    }
    var foInstance = Panel.instances[id];
    Dragger.guiObject = foInstance;
    Dragger.domObject = foInstance.domObject;
    GLOBAL.mouseKeyDown = true;
    Dragger.start(e);
};

Panel.focus = function (id) {
    if (Panel.instances[id].onFocus) {
        Panel.instances[id].onFocus();
    }
};

Panel.prototype.close = function () {
    if (!this.visible) {
        return;
    }
    this.domObject.style.display = 'none';
    //this.headerDiv.style.cursor = 'default';
    //this.headerDiv.style.cursor = 'move';
    this.visible = false;

//	if(this.onClose){
//	  this.onClose();
//	}

    ScreenBlokker.hide();
};

Panel.prototype.render = function () {

    var obj = null;
    this.domObject = XDOM.createElement('DIV', this.id, 'popup popup-panel ' + this.classname);
    if (this.inline) {

        this.domObject.style.width = "100%";//(100/this.cols) * this.cols-2 +
        this.domObject.style.height = "100%";//(100/this.rows) * this.rows-2 +
    } else {
        if (this.width) {
            this.domObject.style.width = this.width;
        }
        if (this.height) {
            this.domObject.style.height = this.height;
        } else {
            this.domObject.style.height = "auto";
        }
    }


    this.domObject.id = this.id;
    this.domObject.setAttribute("data-update-dom-depth", "false");
    updatePanelSort(this.domObject);

    this.screenDiv.appendChild(this.domObject);
    this.renderHeader();
    this.renderBody();

    for (var s in this.content) {
        obj = this.content[s];
        if (typeof (obj) == 'object') {
            this.bodyDiv.appendChild(obj);
        }

    }


    this.visible = true;

};

Panel.prototype.setTitle = function (title) {
    this.title = title;
    this.headerTextDiv.childNodes[0].nodeValue = this.title;
};
Panel.prototype.renderHeader = function () {
    //if(this.inline){return;}
    var foTitel = XDOM.createTextNode(this.title);
    var fsPanelId = this.id;

    this.headerDiv = XDOM.createElement('DIV');
    this.headerTitleIcon = null;
    this.headerDiv.id = "panel-header-" + this.id;
    this.headerDiv.className = "panelHeader theme-background-color";
    this.headerTextDiv = XDOM.createElement('DIV', null, 'panelTitle');

    if (this.inline) {
        if (this.panelIconClass && this.panelIconClass != "") {
            this.headerTitleIcon = XDOM.createElement('i', null, 'panelHeaderIcon ' + getFontPrefix(this.panelIconGroup) + this.panelIconClass);
            this.headerDiv.appendChild(this.headerTitleIcon);
        }
    }

    this.headerTextDiv.appendChild(foTitel);


    this.headerDiv.appendChild(this.headerTextDiv);

    if (this.inline) {
        this.headerDiv.style.cursor = 'default';
    } else {
        var foExit = XDOM.createElement('DIV');
        foExit.id = 'MEXIT';
        foExit.className = 'popup-close pth-icon';
        foExit.setAttribute("close-panel-id", this.id);
        this.headerTextDiv.appendChild(foExit);
        this.headerDiv.style.cursor = 'move';

        this.headerDiv.setAttribute("data-mouseDown-action", "Dragger.start");
        this.headerDiv.setAttribute("data-dragger-objId", this.id);

        this.headerTextDiv.setAttribute("data-mouseDown-action", "Dragger.start");
        this.headerTextDiv.setAttribute("data-dragger-objId", this.id);

    }

    this.domObject.appendChild(this.headerDiv);
    return;
};


Panel.prototype.renderBody = function () {
    if (this.bodyDiv && this.bodyDiv.parent) {
        this.bodyDiv.parent.removeChild(this.bodyDiv);
    }
    this.bodyDiv = XDOM.createElement('DIV');
    this.bodyDiv.id = "panel-body-" + this.id;
    this.bodyDiv.className = "panelBody";

    this.domObject.appendChild(this.bodyDiv);
};

Panel.prototype.add = function (domHTMLObject, id) {
    var foDomObject = domHTMLObject;
    if (domHTMLObject.domObject) {
        foDomObject = domHTMLObject.domObject;
    }
    if (!id) {
        this.content[this.content.length] = foDomObject;
    } else {
        this.content[id] = foDomObject;
    }
    if (this.bodyDiv) {
        this.bodyDiv.appendChild(foDomObject);
    }
};

Panel.prototype.getContent = function (id) {
    return this.content[id];
};

Panel.prototype.clearContent = function (id) {
    if (id) { // verwijder 1 instantie 1
        if (this.content[id] && this.content[id].parent) {
            this.content[id].parent.removeChild(this.content[id]);
            this.content[id] = null;
        }
    } else { // schrijf de body opnieuw
        this.content = [];
        this.renderBody();
    }
    return;
};

Panel.prototype.contentExists = function (id) {
    if (this.content[id]) {
        return true;
    }
    return false;
};

Panel.prototype.show = function () {
    if (!this.domObject) {
        this.render();
    } else {
        updatePanelSort(this.domObject);
    }
    if (this.onShow) {
        this.onShow();
    }
    if (this.onFocus) {
        this.onFocus();
    }

    if (this.modal) {
        ScreenBlokker.show(this.z - 1);
    }
    this.domObject.style.display = '';

    this.visible = true;

    if (this.alignTo && !this.inline) {
        var position = alignTo(this.domObject, this.alignTo);
        this.domObject.style.top = position.top + 'px';
        this.domObject.style.left = position.left + 'px';
    }
};

