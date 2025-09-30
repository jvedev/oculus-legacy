GUI.Constant = function(obj) {
   GUI.Label.baseConstructor.call(this,obj);
   this.constant = obj.constant;
};

XDOM.extendObject(GUI.Constant, GUI.Label);

/**
 * @override GuiBaseObject
 */
GUI.Constant.prototype.init = function(){
  this.base(GUI.Constant, 'init');
  this.setDefaults();
};

/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.Constant.prototype.render = function(){
  this.dom.domObject = XDOM.createElement("LABEL",this.id);
  this.dom.domObject.innerHTML = this.constant; //innerHTML i.v.m. ge-scapede codes 
  this.dom.domObject.setAttribute("data-const-value",this.constant )
  this.setPosAndDimentions();
  this.updateState();
  return this.dom.domObject;
};