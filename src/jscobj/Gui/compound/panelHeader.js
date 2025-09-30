/**
 * GUI.Header ten behoeven van GUI.Panel
 */
GUI.PanelHeader = function(definition,panel){
  this.panel = panel;
  this.titleVariable = null;

  if(definition.titleOrigin=="*VAR"){
    //set titleVariable to indicate this is a variable title and where to find the text 
    this.titleVariable = definition.titleVariable;
    this.title = panel.data[definition.titleVariable]
  } else{
    this.title = this.panel.captions.get(definition.title)
  } 
};
/**
 * update caption for the panel header
 */
GUI.PanelHeader.prototype.update = function(){
  if(this.titleVariable){ //only when titleVariable is set other cases the header is inmutable
    //this.panel.dom.headerTitle.innerHTML = this.panel.data[this.titleVariable];
    this.panel.dom.headerTitle.childNodes[0].nodeValue = this.panel.data[this.titleVariable];
  }
}

/**
 * opbouwen vean header voor GUI.Panel
 */
GUI.PanelHeader.prototype.render = function(){
  var dom = this.panel.dom;
  var fsId = this.panel.panelId;

//opbouw elementen
  var fsDraggClass = ' dragable';
  var fsIconClass = '';
  if(BrowserDetect.isIE || BrowserDetect.isSafari || this.panel.screenMode == GUI.BasePanel.screenMode.subview){
    fsDraggClass = ''; // wordt niet ondersteund door ie
  }
  dom.header  = XDOM.createElement('DIV', fsId + "-header", "panelHeader theme-background-color" + fsDraggClass);
  dom.headerTitle = XDOM.createElement('DIV',null,"panelTitle");
  dom.headerTitleText = XDOM.createTextNode(this.title);

//opbouw dom boom
  dom.headerTitle.appendChild(dom.headerTitleText);

  if(this.panel.screenMode == GUI.BasePanel.screenMode.subview){
     if(this.panel.panelIconClass && this.panel.panelIconClass != ""){
       dom.headerTitleIcon = XDOM.createElement('i',null,'panelHeaderIcon '+ getFontPrefix(this.panel.panelIconGroup)+this.panel.panelIconClass);
       dom.header.appendChild(dom.headerTitleIcon);
     }
  }

  dom.header.appendChild(dom.headerTitle);

  if(this.panel.screenMode != GUI.BasePanel.screenMode.subview){
    //dom.exitIcon = XDOM.createElement('DIV','MEXIT','popup-close');
    dom.exitIcon = XDOM.createElement('i','MEXIT','popup-close pth-icon');

    dom.headerTitle.appendChild(dom.exitIcon);
    dom.exitIcon.setAttribute("data-click-action","GUI.BasePanel.close");
    dom.exitIcon.setAttribute("aria-hidden","true");
    dom.exitIcon.setAttribute("data-eventarg-id",this.panel.panelId);

    //adding drag event handlers
    dom.header.setAttribute("data-eventarg-id",this.panel.panelId);
    dom.header.setAttribute("data-mouseDown-action", "Dragger.start");
    dom.header.setAttribute("data-dragger-objId", this.panel.dom.domObject.id);
    dom.headerTitle.setAttribute("data-eventarg-id",this.panel.panelId);
    dom.headerTitle.setAttribute("data-mouseDown-action", "Dragger.start");
    dom.headerTitle.setAttribute("data-dragger-objId", this.panel.dom.domObject.id);


  }

  dom.domObject.appendChild(this.panel.dom.header);

//registreren van events

};

GUI.PanelHeader.prototype.setInfoTitle = function(){


};