GUI.LogicalIn = function (obj) {
    GUI.LogicalIn.baseConstructor.call(this,obj);
    this.type = 'LogicalIn';
    this.onValue = obj.onValue;
    if(obj.offValue == "*UNDEF"){
    	obj.offValue = "";
    }

    this.offValue = obj.offValue;
};

XDOM.extendObject(GUI.LogicalIn,GUI.Input);

/**
 * @override GuiBaseObject
 * @returns HTMLhiddenObject
 */
GUI.LogicalIn.prototype.render = function(){
  var foFrag = document.createDocumentFragment();
  this.dom.domObject =  XDOM.createElement("a",this.id );
  this.dom.domObject.type='button';

  XDOM.setAttribute(this.dom.domObject, "data-datatype", "logical");
  XDOM.setAttribute(this.dom.domObject, "data-real-name", this.realName);
  XDOM.setAttribute(this.dom.domObject, "data-line", this.y);
  XDOM.setAttribute(this.dom.domObject, "data-xpos", this.x);
  XDOM.setAttribute(this.dom.domObject, "data-panel-id", this.panelId);
  XDOM.setAttribute(this.dom.domObject, "data-prompt-field", false);

  if(this.autoSubmit){
    XDOM.setAttribute(this.dom.domObject, "data-autosubmit", "true");
  }

  this.dom.hiddenObject = XDOM.createElement("input",this.id + '-out');
  this.dom.hiddenObject.name = this.name;
  this.dom.hiddenObject.type = "hidden";


  XDOM.setAttribute(this.dom.hiddenObject, "data-panel-id", this.panelId);
  XDOM.setAttribute(this.dom.hiddenObject, "data-datatype", "*LGL");
  XDOM.setAttribute(this.dom.hiddenObject, "data-real-name", this.realName);
  XDOM.setAttribute(this.dom.hiddenObject, "data-on-value", this.onValue);
  XDOM.setAttribute(this.dom.hiddenObject, "data-off-value", this.offValue);


  foFrag.appendChild(this.dom.hiddenObject);
  foFrag.appendChild(this.dom.domObject);

  this.registerEvents();
  this.updateState();
  return foFrag;

};

GUI.LogicalIn.prototype.registerEvents = function(){
  GUI.events.register(this.dom.domObject);
  this.dom.domObject.setAttribute("data-click-action","GUI.LogicalIn.handleOnClick");
  this.dom.domObject.setAttribute("data-keyup-action","GUI.LogicalIn.handleKeyUp");
};

GUI.LogicalIn.prototype.toggle = function(){
  if(this.value==this.onValue){
    this.value= this.offValue;
  }else{
    this.value= this.onValue;
  }
  this.dom.hiddenObject.value = this.value;
};

GUI.LogicalIn.prototype.updateByUser = function(){
  this.base(GUI.Input, 'updateState');
  if(!this.dom.domObject){
    this.dom.domObject = XDOM.getObject(this.id);
  }
  this.dom.domObject.className  = this.getCssClass();
  if(this.isProtected){}
};

/**
 * @override GuiBaseObject
 */
GUI.LogicalIn.prototype.updateState = function(){
	this.base(GUI.LogicalIn, 'updateState');
  this.dom.domObject.className  = this.getCssClass();
  this.dom.hiddenObject.value = this.value;

  if(this.value==this.onValue){
    this.dom.domObject.setAttribute("data-logical-state",   Logical.state.checked);
  }else if(this.offValue == '' || this.value==this.offValue){
    this.dom.domObject.setAttribute("data-logical-state",   Logical.state.unchecked);
  }else{
    this.dom.domObject.setAttribute("data-logical-state",   Logical.state.unknown);
  }

  //this.isProtected = false;
  //if(XDOM.getAttribute(this.dom.domObject, 'data-protected') == 'true'){
 // 	this.isProtected = true;
  //}
};




/**
 * @override GuiBaseObject
 * @returns cssClasses
 */
GUI.LogicalIn.prototype.getCssClass = function(){
  fsCss = this.base(GUI.Input, 'getCssClass');
  fsCss += ' checkbox pth-icon dataSectionButton theme-hover-color ';

  return fsCss;
};

GUI.LogicalIn.toggle = function(fsId){
  var foPanel 		= XDOM.GLOBAL.getEditWindow();
  var foGuiObj 		= foPanel.getGuiObject(fsId);

	if(foGuiObj.isProtected){
    return;
  }

  foGuiObj.toggle();
  GUI.events.change(XDOM.getObject(fsId));
  foGuiObj.updateState();
};

GUI.LogicalIn.handleKeyDown = function(e){
  XDOM.getEvent(e);
  OCULUS.checkKeyCode(e);
  XDOM.setSelection();
  if(GLOBAL.charCode==keyCode.enter){
    XDOM.cancelEvent(e);
      foPanel.send('ACCEPT',XDOM.GLOBAL.getAttribute('data-real-name'));
  }
};

GUI.LogicalIn.handleKeyUp = function(){

  if(isLogical(GLOBAL.eventSourceElement) && GLOBAL.charCode==keyCode.space){
    GUI.LogicalIn.toggle(GLOBAL.eventSourceElement.id);
    return true;
  }
};

GUI.LogicalIn.handleOnClick = function(){
  GUI.LogicalIn.toggle(GLOBAL.eventSourceElement.id);
};
