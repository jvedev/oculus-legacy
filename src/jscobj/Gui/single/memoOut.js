GUI.MemoOut = function (obj) {
  GUI.MemoOut.baseConstructor.call(this,obj);
  this.dataType = nullWhenEmpty(obj.dataType);
  this.type='memo';
};
XDOM.extendObject(GUI.MemoOut, GUI.BaseObject);

/**
 * @override GuiBaseObject
 */
GUI.MemoOut.prototype.init = function(){
  this.base(GUI.MemoOut, 'init');
  this.setDefaults();
  this.setValue();
};

/**
 * haalt de waarde op uit de dataset
 */
GUI.MemoOut.prototype.setValue = function(){
  this.base(GUI.MemoOut, 'setValue');
};


/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.MemoOut.prototype.render = function(){
  this.dom.domObject = XDOM.createElement("pre",this.id);
  this.setPosAndDimentions();
  this.updateState();
  return this.dom.domObject;
};



/**
 * @override GuiBaseObject
 */
GUI.MemoOut.prototype.updateState = function(){
  this.base(GUI.MemoOut, 'updateState');
  if(!this.dom.domObject){
    this.dom.domObject = XDOM.getObject(this.id);
  }
  this.dom.domObject.className  = this.getCssClass();

  this.dom.domObject.innerText = this.value;
};

/**
 * @override GuiBaseObject
 * @returns cssClasses
 */
GUI.MemoOut.prototype.getCssClass = function(){
  fsCss = this.base(GUI.MemoOut, 'getCssClass');
  return fsCss;
};