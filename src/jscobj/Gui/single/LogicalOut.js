GUI.LogicalOut = function (obj) {
  	GUI.LogicalOut.baseConstructor.call(this,obj);
    this.type = 'LogicalOut';
		this.onValue = obj.onValue;
    //this.defaultValue = nullWhenEmpty(obj.defaultValue);

    if(obj.offValue == "*UNDEF"){
    	obj.offValue = "";
    }

    this.offValue = obj.offValue;
};

XDOM.extendObject(GUI.LogicalOut, GUI.BaseObject);

/**
 * @override GuiBaseObject
 */
GUI.LogicalOut.prototype.init = function(){
  this.base(GUI.LogicalOut, 'init');
  this.setValue();
};

//GUI.LogicalOut.prototype.setValue = function(){
//  this.base(GUI.LogicalOut, 'setValue');
//  if(!this.defaultValue){
//    this.defaultValue = '1';
//  }
//};


/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.LogicalOut.prototype.render = function(){
  this.dom.domObject = XDOM.createElement("p",this.id, this.getCssClass());

  XDOM.setAttribute(this.dom.domObject, "data-datatype", "logical");
  XDOM.setAttribute(this.dom.domObject, "data-real-name", this.realName);
  XDOM.setAttribute(this.dom.domObject, "data-line", this.y);
  XDOM.setAttribute(this.dom.domObject, "data-xpos", this.x);
  XDOM.setAttribute(this.dom.domObject, "data-panel-id", this.panelId);

  this.setPosAndDimentions();
  this.updateState();
  return this.dom.domObject;
};


/**
 * @override GuiBaseObject
 * @returns cssClasses
 */
GUI.LogicalOut.prototype.getCssClass = function(){
  fsCss = this.base(GUI.Input, 'getCssClass');
  fsCss += ' checkbox pth-icon dataSectionButton theme-hover-color';

  return fsCss;
};

/**
 * @override GuiBaseObject
 */

GUI.LogicalOut.prototype.updateState = function(){
	this.base(GUI.LogicalIn, 'updateState');
	if(!this.dom.domObject){
    this.dom.domObject = XDOM.getObject(this.id);
  }

  this.dom.domObject.className  = this.getCssClass();

  if(this.value==this.onValue){
    this.dom.domObject.setAttribute("data-logical-state",   Logical.state.checked);
  }else if(this.offValue == '' || this.value==this.offValue){
    this.dom.domObject.setAttribute("data-logical-state",   Logical.state.unchecked);
  }else{
    this.dom.domObject.setAttribute("data-logical-state",   Logical.state.unknown);
  }
};

