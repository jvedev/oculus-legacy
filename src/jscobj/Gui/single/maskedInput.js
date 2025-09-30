GUI.MaskedInput = function (obj) {
    GUI.MaskedInput.baseConstructor.call(this,obj);
    this.type = 'masked-input';
    this.width = null; //overwrite de definitie deze property mag niet worden gezet
    this.editMask = obj.editMask;
    //this.check = obj.validateMask; //*CHECK | *NOCHECK
    this.check =  (obj.validateMask =="*CHECK") ? true : false;
    this.forFieldProgression = false;
};

XDOM.extendObject(GUI.MaskedInput, GUI.BaseInputObject);

/**
 * @override GuiBaseObject
 */
GUI.MaskedInput.prototype.init = function(){
  this.base(GUI.Input, 'init');
  this.setDefaults();
  this.setValue();
};



/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.MaskedInput.prototype.render = function(){
  this.dom.inputObject = XDOM.createElement("INPUT", this.id, this.getCssClass() );
  this.dom.inputObject.name = this.id;
  this.dom.inputObject.type = "text";
  this.dom.inputObject.setAttribute( "data-panel-id", this.panelId);
  this.dom.inputObject.setAttribute( "data-real-name", this.realName);
  this.dom.inputObject.setAttribute( "data-line", this.y);
  this.dom.inputObject.setAttribute( "data-xpos", this.x);
  this.dom.inputObject.setAttribute( "data-validate-mask", this.check);
  this.dom.inputObject.setAttribute( "data-datatype", "*DTA");
  this.dom.inputObject.setAttribute( "data-mask",  this.editMask);
  //this.dom.inputObject.setAttribute( "data-fieldprogression-part",  this.parentObject.fieldProgressionPartId);

  //this.dom.inputObject.setAttribute("data-focus-action","INP.handleOnFocus");
 	//this.dom.inputObject.setAttribute("data-blur-action","INP.handleOnBlur");

  //container
  this.dom.domObject = Mask.renderInput(this.dom.inputObject, this.isProtected);

  this.dom.domObject.appendChild(this.dom.inputObject);

  this.setPosAndDimentions();
  this.updateState();

  return this.dom.domObject;
};

/**
 * @override GuiBaseObject
 * @returns cssClasses
 */
GUI.MaskedInput.prototype.getCssClass = function(){
  fsCss = this.base(GUI.Input, 'getCssClass');
  fsCss += ' ' + this.dataType;
  return fsCss;
};


/**
 * @override GuiBaseObject
 */
GUI.MaskedInput.prototype.updateState = function(){
  this.base(GUI.MaskedInput, 'updateState');
  var fsCssClasses = this.getCssClass();
  if(!this.dom.domObject){
    this.dom.domObject = XDOM.getObject(this.id);
  }

  this.dom.domObject.className  = fsCssClasses + ' mask';
  this.dom.inputObject.value = this.value;
  Mask.setValue(this.dom.inputObject, this.value);

};

GUI.MaskedInput.prototype.updateByUser = function(){
  if(!this.dom.domObject){
    this.dom.domObject = XDOM.getObject(this.id);
  }
  this.value = this.dom.inputObject.value;
  this.base(GUI.MaskedInput, 'updateState');

  var fsCssClasses = this.getCssClass();

  this.dom.domObject.className  = fsCssClasses + ' mask';

};


//
//GUI.MaskedInput.inOrout = function(){
//  var fsNewFieldId = XDOM.GLOBAL.getAttribute('data-mask-target');
//  var fsPreviousMaskId = XDOM.getAttribute(SESSION.activePage.lastFocusedField , 'data-mask-target');
//  if(fsNewFieldId === fsPreviousMaskId){
//    if(fsPreviousMaskId){
//    	if(XDOM.fieldIsChanged(SESSION.activePage.lastFocusedField)){
//        GUI.MaskedInput.changePart(SESSION.activePage.lastFocusedField);
//      }
//      return;
//    }
//  	//geen masker in of uit en we zitten ook niet in een masker
//  	return;
//  }
//
//  if(fsNewFieldId){
//    /**
//     * focus is op een nieuw masker element we ondhouden de oude waarde
//     */
//     GUI.MaskedInput.setOldValue(fsNewFieldId);
//  }
//  if(fsPreviousMaskId){
//  	/**
//  	 * we verlaten en masker check of er een change is ontstaan
//  	 */
//  	 if(XDOM.fieldIsChanged(fsPreviousMaskId)){
//  	 	 GUI.MaskedInput.changePart(SESSION.activePage.lastFocusedField);
//       GUI.MaskedInput.change(fsPreviousMaskId);
//     }
//  }
//};

//GUI.MaskedInput.changePart = function(fsId){
//  var foInp = XDOM.getObject(fsId);
//  var foMask = foProp.maskElement;
//  var foPanel = XDOM.GLOBAL.getEditWindow();
//
//  if(foPanel.validateField(foInp)){
//    foMask.complete();
//   // foPanel.footer.setMessage();
//  }
//
//};

//GUI.MaskedInput.change = function(fsId){
//	GUI.events.change(fsId);
//  var foInp = XDOM.getObject(fsId);
//  var foProp = definitions.getPropertyObject(fsId);
//  var foPanel = XDOM.GLOBAL.getEditWindow();
//  foProp.mask.complete();
//  foPanel.validateField(foInp);
//};

//GUI.MaskedInput.setOldValue= function (fsId){
//	var foObj = XDOM.getObject(fsId);
//	XDOM.setAttribute(foObj, "data-old-value", foObj.value);
//};

//GUI.MaskedInput.keyUp = function(){
//	if(!GLOBAL.objectProperties.mask){
//	  return;
//	}
//	foPanel = XDOM.GLOBAL.getEditWindow();
//	if(GLOBAL.objectProperties.maskElement){
//  	if(XDOM.GLOBAL.fieldIsChanged()){
//      foPanel.footer.setMessage();//verwijder de boodschap op het scherm
//	    if(GLOBAL.eventSourceElement.value.length >= GLOBAL.eventSourceElement.maxLength){
//	     //foPanel.fieldProgression.next(); //alleen een fieldprogression als er een verandering is
//	     return true;
//	    }
//    }
//    GLOBAL.objectProperties.mask.getValue();
//    if(GLOBAL.charCode==keyCode.F4){
//      var fsMaskTarget = XDOM.GLOBAL.getAttribute('data-mask-target');
//      if(fsMaskTarget){
//        CALFCN.OPNCAL(fsMaskTarget);
//      }
//    }
//    return true;
//  }
//
//  return false;
//};

