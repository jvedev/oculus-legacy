/* global Subfile, QuickSearch, XDOM, SESSION, GLOBAL, Mask, Command, keyCode, handleFocus, handleBlur, BrowserDetect, GUI, Trigger, fp */

function INP(){}
/**
 *
 */

INP.updateDom= function(){

	INP.registerEvents(XDOM.queryAll('INPUT,TEXTAREA, A.checkbox'));
	//INP.registerEvents(XDOM.queryAll('TEXTAREA'));
};





INP.handleKeyDown =  function(){
   GLOBAL.keydownValue  = GLOBAL.eventSourceElement.value;
   GLOBAL.keydownObject = GLOBAL.eventSourceElement;
   handleNumericPoint();
};

/**
 * als een veld ongeacht zijn type auto submit is zal er altijd een 
 * een autosubmit volgen als bij keyup de maximale lengte is bereikt
 * ongeacht of hij veranderd is of niet 
 * Keyboard handling tbv INPUT elementen
 * @returns {Boolean}
 */
INP.handleKeyUp =  function(){
	//alles betreffende FP wordt door de FP uitgevoerd en hoeft hier dus niet te gebeuren.
  if(	GLOBAL.charCode === keyCode.tab ||
  		GLOBAL.charCode === keyCode.enter ||
  		GLOBAL.charCode === keyCode.shift ||
  		GLOBAL.charCode === keyCode.arrowUp ||
  		GLOBAL.charCode === keyCode.arrowRight ||
  		GLOBAL.charCode === keyCode.arrowDown ||
  		GLOBAL.charCode === keyCode.F4 ||
  		GLOBAL.charCode === keyCode.F2 ||
  		GLOBAL.charCode === keyCode.arrowLeft
  		){
    INP.returnToErrorField();
    return;
  }

  if(XDOM.fieldIsChanged(GLOBAL.eventSourceElement)){
    Command.resetEnter();
  }

	//ook bij het invoeren van dezelfde waarde mag er een FP uitgevoerd worden.
   if(Mask.isMask(GLOBAL.eventSourceElement)){
     SESSION.activePage.lastChangedMaskId = GLOBAL.eventSourceElement.getAttribute("data-mask-target");
   }

   if(GLOBAL.eventSourceElement.value && 
     GLOBAL.eventSourceElement.value.length >= GLOBAL.eventSourceElement.maxLength){

  	if(GLOBAL.keydownObject.id === GLOBAL.eventSourceElement.id){
  	 var isMask = Mask.isMask(GLOBAL.eventSourceElement);
  	 var isLastPart =  Mask.isLastPart(GLOBAL.eventSourceElement);
  	 if(isMask && isLastPart){
  	 	Mask.completeAllParts(SESSION.activePage.lastChangedMaskId);
  	  INP.handelTriggersAndAutoSubmits(GLOBAL.eventSourceElement, isMask, isLastPart);
  	 }else{
  	 		INP.handelTriggersAndAutoSubmits(GLOBAL.eventSourceElement, isMask, isLastPart);
     }
 		}
   }

};
  // ***************************************************************************
  // Voegt events toe aan INPUT elementen
  // return: --
  // ***************************************************************************
INP.registerEvents = function(foNodeList) {
  var foInp = null;
  for(var i = 0,l = foNodeList.length;i<l;i++){
    foInp=foNodeList[i];

		if(foInp.hasAttribute("data-setDefault-events") && !XDOM.getBooleanAttribute(foInp, "data-setDefault-events")){
			return;
		}

    XDOM.setAttribute(foInp, "autocomplete", "off" );
    foInp.setAttribute("data-focus-action","INP.handleOnFocus");
    foInp.setAttribute("data-blur-action","INP.handleOnBlur");

    XDOM.addEventListener(foInp, 'focus', handleFocus);
    XDOM.addEventListener(foInp, 'blur', handleBlur);
  }
  return;
};





INP.handleOnFocus = function(source = GLOBAL.eventSourceElement) {

    if(GLOBAL.eventObject.currentTarget.readOnly){
        //When the current target is readonly, we use next on the related target.
        //If we were to do this on the current target changes are it is in a field set with no focusable element.
        fp.next(GLOBAL.eventObject._event.relatedTarget);
        return;
    }
    let sourceId = source.id
  if(SESSION.submitInProgress){
    return;
  }

 
  if(!isIn(sourceId,['ENTER','ACCEPT','RETURN'])){
    if(SESSION.activePage.lastFocusedField != sourceId){
      source.dataset.selectAllNow = true;
    }else{
      source.dataset.selectAllNow = false;
    }

    SESSION.activePage.lastSelectedInput 	= source;
    SESSION.activePage.selectedObjectId 	= sourceId;
    SESSION.activePage.lastFocusedField = sourceId;
  }
  
  

  if(SESSION.activePage.autoSubmitInputObject){
    SESSION.activePage.autoSubmitInputObject.focus();
    SESSION.activePage.autoSubmitInputObject = null;
    return false;
  }
  if(XDOM.GLOBAL.getAttribute("data-thousand-separator")==="on"){
   	GLOBAL.eventSourceElement.value=unformatThousand(source.value);
   	INP.select();
  }

  Mask.handleFocus(source);
	Subfile.selectRow(source);

  if(BrowserDetect.isIE){ //fix voor select in maskers bij auto FP
  	INP.select();
  }

  XDOM.setAttribute(source, "data-old-value", source.value);
  return;
};



/**
 * selecteerd het input veld als deze voor het eerst wordt benaderd
 * @param {type} obj
 */
INP.select = function(obj){

	var focusedField = null;

	if(obj){
		focusedField = XDOM.getObject(obj);
	} else {
		focusedField = GLOBAL.eventSourceElement;
	}

  if(focusedField.tagName !== 'INPUT'){return;}
  if(isHidden(focusedField)){return;}

  SESSION.activePage.lastFocusedField = focusedField.id;

  if(focusedField.type==='text' || focusedField.type==='password'){
    focusedField.select();
  }
};

INP.handleOnBlur = function(e) {
  var isChanged = false;
  if(!SESSION.activePage){
    return;
  }

  XDOM.getEvent(e);

  QuickSearch.onTargetBlur();
  Subfile.deselectRow();
  isChanged = XDOM.GLOBAL.fieldIsChanged();

  if(XDOM.GLOBAL.getAttribute("data-thousand-separator")==="on"){
 	 GLOBAL.eventSourceElement.value=formatThousand(GLOBAL.eventSourceElement.value);
  }

  if(Mask.handleOnBlur(GLOBAL.eventSourceElement, isChanged)){
     return;
  }

  if(isChanged){
    handleOnChange(GLOBAL.eventSourceElement);
  }

  SESSION.activePage.previousField = GLOBAL.eventSourceElement;

  return;
};

INP.focusErrorField = function(foField){
  SESSION.activePage.lastErrorField = foField;
};

INP.returnToErrorField = function(){
  var foFocusField = SESSION.activePage.lastErrorField;
  SESSION.activePage.lastErrorField = null;
  if(!foFocusField){

    return false;
  }

  GLOBAL.eventObject.remapKeyCode();
  GLOBAL.eventObject.cancel();
  XDOM.focus(foFocusField);
  return true;
};





INP.handelTriggersAndAutoSubmits = function (fsField, isMask, isLastPart){
  var foField = XDOM.getObject(fsField);
  var fsPanelId = null;
  var foEdit = null;
  var fbAutosubmit = isAutoSubmitField(foField);
	var fbIsText = (XDOM.getAttribute(foField,"data-datatype")==="*TXT");
	var fbSubmit = true;
	var fbValidMsk = true;
 
  //POM-2652 geen autosubmit of snelzoek als veld onveranderd blijft
  if(!XDOM.fieldIsChanged(foField)){
    if(!fbIsText){
      fp.next(foField);
    }
    return;
  }

  if (((isMask && isLastPart) || !isMask) && fbAutosubmit && !XDOM.getBooleanAttribute(foField,"data-block-autosubmit")) {
    fsPanelId = XDOM.getAttribute(foField,'data-panel-id');
    if(fsPanelId){
      Stateless.setSubviewActive(foField);
      foEdit = GUI.BasePanel.instances[fsPanelId];
      foEdit.send('ENTER',foField.id.replace(fsPanelId + '-' ,''));
      return;
    }

		if(isMask){
			fbSubmit = Mask.validateAllParts(fsField);
		}

		if(fbSubmit){
      Stateless.setSubviewActive(foField);
    	SESSION.activePage.autoSubmitInputObject = foField;
    	Command.enter();
    	return true;
    }

 		return false;

  }else if(Trigger.fire([foField.id])){
    Stateless.setSubviewActive(foField);
    return true;
  }

  
  // inputvelenden van het data type *txt hebben geen automatisch field progression omdat deze velden erg lang kunnen zijn en je daardoor onbedoeld het volgende veld zou kunnen overschrijven 
  if((!fbAutosubmit || (isMask && !isLastPart)) && !fbIsText){

  	if(isMask){
  		if(!Mask.validatePart(fsField)){
  			fbValidMsk = false;
  		}
  	}

  	if(fbValidMsk){
  	  if(isMask){
  	    if(Mask.selectNextPart(foField)){
  	      return false;
  	    }
  	  }
  		fp.next(foField);
  	}
  }
  return false;
};



