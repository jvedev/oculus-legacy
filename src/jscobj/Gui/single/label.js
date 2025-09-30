GUI.Label = function(obj) {
   GUI.Label.baseConstructor.call(this,obj);
   this.text = '';
   this.captionId = nullWhenEmpty(obj.id);
};

XDOM.extendObject(GUI.Label, GUI.BaseObject);

/**
 * @override GuiBaseObject
 */
GUI.Label.prototype.init = function(){
  this.base(GUI.Label, 'init');
  this.setDefaults();
  this.text =  this.parentObject.captions.get(this.captionId);
};

/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.Label.prototype.render = function(){

  this.dom.domObject = XDOM.createElement("LABEL",this.id);
  this.dom.domObject.appendChild(XDOM.createTextNode(this.text));

  FieldAttribute.setAttentionLevel(this);

  this.setPosAndDimentions();
  this.updateState();
  return this.dom.domObject;
};
/**
 * @override GuiBaseObject
 */
GUI.Label.prototype.updateState = function(){
  if(!this.dom.domObject){
    this.dom.domObject = XDOM.getObject(this.id);
  }
  this.base(GUI.Label, 'updateState');
  this.dom.domObject.className  = this.getCssClass();
};

/**
 * @override GuiBaseObject
 * @returns cssClasses
 */
GUI.Label.prototype.getCssClass = function(){
  return this.base(GUI.Label, 'getCssClass');
};
