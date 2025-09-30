
GUI.SessionLauncher = function(obj) {
  GUI.SessionLauncher.baseConstructor.call(this,obj);
  this.environment=obj.environment;

  this.environmentField = obj.environmentField;
  this.datafield = this.environmentField;
  this.authorizedFor = obj.authorizedFor;
  this.location=obj.location;
  this.locationType=obj.locationType;
  this.parms=obj.parms;
  this.formFields=obj.formFields;
  this.label=obj.label;
  this.title=obj.title;
  this.whenField=obj.whenField;
  this.whenValue=obj.whenValue;
  this.value = '';
};

XDOM.extendObject(GUI.SessionLauncher, GUI.BaseInputObject);

/**
* @override GuiBaseObject
* @returns HTMLDomObject
*/
GUI.SessionLauncher.prototype.render = function(){
 var fsLabel=  this.parentObject.captions.get(this.label);
 var fsTitle=  this.parentObject.captions.get(this.title);
 this.dom.domObject = XDOM.createElement("DIV",this.id,"launchSessionPlaceHolder");
 this.dom.icon = XDOM.createElement("DIV",this.id + "_icon","launchSessionButton pth-newSession dataSectionButton theme-hover-color");
 this.dom.label = XDOM.createElement("label",this.id + "_label","launchSessionLabel");

 this.dom.domObject.appendChild(this.dom.icon);
 this.dom.domObject.appendChild(this.dom.label);

 this.dom.label.appendChild(XDOM.createTextNode(fsLabel));

 this.dom.icon.setAttribute("data-new-session-id", this.id);
 this.dom.icon.setAttribute("data-new-session-environment", this.environment);
 this.dom.icon.setAttribute("data-new-session-environment-field-id",this.environmentField);
 this.dom.icon.setAttribute("data-new-session-authorized-for",this.authorizedFor);

 this.dom.icon.setAttribute("data-new-session-location", this.location);
 this.dom.icon.setAttribute("data-new-session-location-type", this.locationType);
 this.dom.icon.setAttribute("data-new-session-params", this.parms);
 this.dom.icon.setAttribute("data-new-session-form-fields", this.formFields);
 this.dom.icon.setAttribute("data-new-session-title",fsLabel);
 this.dom.icon.setAttribute("data-new-session-description",fsTitle);

 this.dom.icon.setAttribute("data-when-field", this.whenField);
 this.dom.icon.setAttribute("data-when-value", this.whenValue);

 GUI.infoTitle.register(this.dom.icon, fsTitle);

 this.setPosAndDimentions();
 this.updateState();
 return this.dom.domObject;
};

GUI.SessionLauncher.prototype.init = function(){
  this.base(GUI.SessionLauncher, 'init');
  var faFields = this.formFields.split(' ');
  for(var i = 0, l=faFields.length;i<l;i++){
    faFields[i] = this.panelId + '-' + faFields[i];
  }
  this.formFields = faFields.join(' ');
};


GUI.SessionLauncher.prototype.registerEvents = function(){

};



/**
* @override GuiBaseObject
*/
GUI.SessionLauncher.prototype.updateState = function(){
 if(!this.dom.domObject){
   this.dom.domObject = XDOM.getObject(this.id);
 }

 this.base(GUI.SessionLauncher, 'updateState');
 this.dom.domObject.className  = this.getCssClass();
 this.setValue();
 NAV.sessionLauncher.authorize(this.dom.icon);
};

/**
* @override GuiBaseObject
* @returns cssClasses
*/
GUI.SessionLauncher.prototype.getCssClass = function(){
 var fsCssClass =  this.base(GUI.SessionLauncher, 'getCssClass');
 fsCssClass +=" sessionLauncher";
 return fsCssClass;
};


/**
 * haalt de waarde op uit de dataset
 */
GUI.SessionLauncher.prototype.setValue = function(){
    this.base(GUI.SessionLauncher, 'setValue');
    if(this.environmentField){
      this.dom.icon.setAttribute("data-new-session-environment", this.value);
    }else{
      this.dom.icon.setAttribute("data-new-session-environment",SESSION.enviroment);
    }

  };