GUI.MemoIn = function (obj) {
  GUI.MemoIn.baseConstructor.call(this,obj);
  this.maxLength = obj.maxLength;
  this.forFieldProgression = true;
};

XDOM.extendObject(GUI.MemoIn, GUI.Input);

/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.MemoIn.prototype.render = function(){
  this.dom.domObject = XDOM.createElement("TEXTAREA", this.id);
  this.dom.domObject.name = this.id;
  this.dom.domObject.maxLength = this.maxLength;
  this.dom.domObject.type="text";
  this.dom.domObject.readOnly = !!this.isProtected;

  XDOM.setAttribute(this.dom.domObject, "data-panel-id", this.panelId);
  XDOM.setAttribute(this.dom.domObject, "data-panel-id", this.panelId);
  XDOM.setAttribute(this.dom.domObject, "autocomplete", "off" );
  XDOM.setAttribute(this.dom.domObject, "data-datatype", this.dataType);
  XDOM.setAttribute(this.dom.domObject, "data-real-name", this.realName);
  XDOM.setAttribute(this.dom.domObject, "data-line", this.y);
  XDOM.setAttribute(this.dom.domObject, "data-xpos", this.x);
  XDOM.setAttribute(this.dom.domObject, "data-prompt-field", false);

  if(this.ucs2){
    this.dom.domObject.setAttribute("data-unicode", "true");
  }
  this.dom.domObject.setAttribute("data-to-upper", !!this.upperCase);
  if(this.autoSubmit){
    XDOM.setAttribute(this.dom.domObject, "data-autosubmit", "true");
  }

  this.setPosAndDimentions();
  this.updateState();
  //this.registerEvents();
  return this.dom.domObject;
};


