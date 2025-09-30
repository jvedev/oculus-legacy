GUI.Hidden = function(obj) {
   GUI.Hidden.baseConstructor.call(this,obj);
   this.text = '';
   this.constValue = null;
   this.forFieldProgression = false;
};

XDOM.extendObject(GUI.Hidden, GUI.Input);

/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.Hidden.prototype.render = function(){
  this.dom.domObject = XDOM.createElement("input",this.id);
  this.dom.domObject.name = this.name;
  this.dom.domObject.type = "hidden";
  XDOM.setAttribute(this.dom.domObject, "data-panel-id", this.panelId);
  XDOM.setAttribute(this.dom.domObject, "data-datatype", "hidden");
  XDOM.setAttribute(this.dom.domObject, "data-real-name", this.realName);
  
  this.updateState();
  return this.dom.domObject;
};

GUI.Hidden.prototype.init = function(){
  if(this.value!="*ID"){
    this.constValue = this.value;
  }
    
  this.setDefaults();
  this.base(GUI.Hidden, 'init');
};  
  
GUI.Hidden.prototype.updateState = function(){
  if(!this.dom.domObject){
    this.dom.domObject = XDOM.getObject(this.id);
  }
  if(this.constValue){
    this.dom.domObject.value = this.constValue;  
  }else{
    this.dom.domObject.value = this.value;
  }
};