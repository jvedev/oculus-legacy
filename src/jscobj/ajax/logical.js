/* global state, NAV, XDOM, GLOBAL, SESSION, advAJAX, keyCode */

Logical = function(){};

Logical.state ={
	checked:'checked',
	unchecked:'unchecked',
	unknown:'unknown'
};

Logical.mode ={
	input:'In',
	output:'Out'
};

Logical.getDisplayObj = function(obj){
 let objId = "";

 if(!obj){ return null; }; //-->

 objId =  obj.id.replace('-checkbox','');
 return XDOM.getObject(objId) || obj;
};

Logical.hide = function(obj){
  var foDisplayObject = Logical.getDisplayObj(obj);
  if(foDisplayObject){
    foDisplayObject.setAttribute("data-hidden", "true");
  }else{
    obj.setAttribute("data-hidden", "true");
  }

};

Logical.unHide= function(obj){
  var foDisplayObject = Logical.getDisplayObj(obj);
  if(foDisplayObject){
    foDisplayObject.setAttribute("data-hidden", "");
  }else{
    obj.setAttribute("data-hidden", "");
  }
};


Logical.protect= function(obj){
  var foDisplayObject = Logical.getDisplayObj(obj);
  if(foDisplayObject){
    foDisplayObject.setAttribute("data-protected", "true");
  }
};
Logical.unProtect= function(obj){
  var foDisplayObject = Logical.getDisplayObj(obj);
  if(foDisplayObject){
    foDisplayObject.setAttribute("data-protected", "false");
  }
};

Logical.update = function() {

  var foPageObjects = XDOM.queryAllScope('[data-datatype="*LGL"]');
  var foObj = null;
	var foValue = null;

  for (var i = 0, l = foPageObjects.length; i < l; i++) {
    foObj = foPageObjects[i];
    foValue = Logical.getObjValue(foObj);
    Logical.setObjValue(foObj, foValue);
  }
};

function isLogical(objIn){
  var obj = XDOM.getObject(objIn);
  if(!obj){ return false; }
  return (obj.id.indexOf('-checkbox') > -1 || (obj.getAttribute("data-datatype")==="*LGL" || obj.getAttribute("data-logical-state")));
}

Logical.getFieldName = function(fieldName){
    return fieldName.replace("-checkbox","");
};


/**
 * handeld click event op td af waar een logical in zit
 * @returns {undefined}
 */
Logical.handleTdClick = function(){
  var foInput = GLOBAL.eventSourceElement.querySelector("[data-datatype='*LGL']");
  if(foInput){
    Logical.clickHandler(foInput);
  }
};

/**
 * Maak alle checkboxjes leeg in werkenmet scherm
 * @returns {undefined}
 */
Logical.clearSelection = function(){
	var macroURL = SESSION.stack.currentMacro.getCurrentUrl();
	var impfURL = "";
	if(!SESSION.submitInProgress){

		if(GLOBAL.eventSourceElement.getAttribute("data-datatype")==="*LGL"){

			SESSION.submitInProgress = true;

			impfURL =  macroURL + "?ClearSelection=true";

		  advAJAX.get({
		    url : impfURL,
		    onError:    function(response) {SESSION.submitInProgress = false;},
		    onSuccess : function(response) {
					NAV.Rowselector.clearAllLogicals();

					var foClearAllChc =  XDOM.getObject("SLTALL-checkbox");
					if(foClearAllChc){
						Logical.setObjValue(foClearAllChc, "");
					}
					Logical.setLogicalCounter("0");

					SESSION.submitInProgress = false;
		    },
		    onRetry :   function(response) {SESSION.submitInProgress = false;}
		  });
	  }
	}
};


/**
 * handeld een rechtstreeks click event af
 * @returns {Boolean}
 * #POM-2495 - Toegevoegd controle of een object visible of hidden is. Bij een hidden checkbox geen clickevent.
 */
Logical.handleOnClick = function(){
 if(!isLogical(GLOBAL.eventSourceElement) || SESSION.submitInProgress || GLOBAL.eventSourceElement.type == ENUM.dataType.hidden){
  return false;
 }

	//var fsDisplayId = GLOBAL.eventSourceElement.id.replace('-checkbox','');
	var fsDisplayId = GLOBAL.eventSourceElement.id+'-checkbox';
	var foInput = XDOM.getObject(fsDisplayId);
	Logical.clickHandler(foInput);
  return true;
};

Logical.clickHandler = function(foInput){
  if(!foInput || foInput.tagName!=="INPUT"){
    return;
  }

  if(XDOM.getBooleanAttribute(foInput, "data-protected")){
  	return;
  }

  Logical.toggle(foInput);

	//werken met schermen
  if(foInput.getAttribute("data-sfl-all-selector")){
    NAV.Rowselector.toggleAll(foInput);
    return true;
  }






  //select op 1 regel
  if(foInput.getAttribute("data-rowselector") || foInput.getAttribute("data-multiselect")){
    NAV.Rowselector.handleClick(foInput);
  }


  handleOnChange(foInput);

  return true;
};

/**
 * mouseup omdat enter bij focus op knop een onclick geeft
 */
Logical.handleKeyUp = function(){
	if( isLogical(GLOBAL.eventSourceElement) && GLOBAL.charCode === keyCode.space && !XDOM.GLOBAL.getBooleanAttribute("data-protected")){
		let inpObj = XDOM.getObject(GLOBAL.eventSourceElement.id + '-checkbox');
		Logical.toggle(inpObj);
    handleOnChange(inpObj);
    return true;
  }
  return false;
};

Logical.isChecked = function(obj){
 return (Logical.getState(obj)===Logical.state.checked);
};



Logical.check = function(obj){
  if(Logical.isChecked(obj)){
    return;
  }
  Logical.toggle(obj);
};
Logical.uncheck = function(obj){
  if(!Logical.isChecked(obj)){
    return;
  }
  Logical.toggle(obj);
};

Logical.toggle = function(obj){
	var eState = Logical.getState(obj);
	var sValue = '';
  if(eState === Logical.state.checked){
    sValue = obj.getAttribute("data-off-value");
    if(sValue === '*UNDEF'){
      sValue = '';
    }
  }else{
    sValue = obj.getAttribute("data-on-value");
  }
  Logical.setObjValue(obj, sValue);
};

Logical.getState = function(obj){
  var fsValue = obj.getAttribute("data-value");
  if(!hasValue(fsValue)){
    fsValue = XDOM.getObjectValue(obj);
  }
  var fsOnValue = obj.getAttribute("data-on-value");
	var fsOffValue = obj.getAttribute("data-off-value");

	if(fsValue===fsOnValue){
		return Logical.state.checked;
	}
	if(fsValue===fsOffValue || fsOffValue==='*UNDEF'){
		return Logical.state.unchecked;
	}
	return Logical.state.unknown;
};

Logical.getObjValue = function(obj){
  let state =  obj.dataset.logicalState;
  let inp = XDOM.getObject(obj.id +'-checkbox' ) || obj;
  let retVal = '';


  switch(state){
	  case Logical.state.checked:
		  retVal =  inp.getAttribute("data-on-value") || 1;
		  break;
	  case Logical.state.unchecked:
		  retVal =  inp.getAttribute("data-off-value") === '*UNDEF'?'':inp.getAttribute("data-off-value")  || 0;
		  break;
	  case Logical.state.unknown:
	   //nothing
  }
  return retVal;
};

Logical.setObjValue = function(obj, oValue){
	let formField = XDOM.getObject(obj.id +'-checkbox' ),
			displayObject = obj;


    if(!hasValue(oValue)){return false;} //-->}

	if(!formField){
		formField = obj;
	}

	if(formField.dataset.datatype != "*LGL" && formField.dataset.sflAllSelector!="true"){ //&& !obj.dataset.logicalState
		return false;
	}

	if(hasValue(formField.value)){
		formField.value = oValue;
	}else{
		formField.setAttribute("data-value", oValue);
	}
	Logical.updateState(formField);
	return true;
};



Logical.updateState = function(formField,displayObject){

//	var foDisplayObject = XDOM.getObject(formField.id + "-checkbox");
 var checkboxObjectId = formField.id.replace('-checkbox','');
	var foDisplayObject = XDOM.getObject(checkboxObjectId);


	var fsState = Logical.getState(formField);
	if(!foDisplayObject &&  formField.parentNode){//in een subfile regel
    foDisplayObject = formField.parentNode.querySelector('#'+checkboxObjectId);
  }

	if(!foDisplayObject && displayObject){foDisplayObject = displayObject;}
 	if(!foDisplayObject){foDisplayObject = formField;}

	if(XDOM.getAttribute(foDisplayObject, "data-logical-state") !== fsState){
		if(XDOM.getAttribute(formField, "data-rowselector")){
			Logical.updateLogicalCounter(fsState);
			//do we have an auto sum field if so we have to auto submit
			if(SESSION.activePage.autoSumFields){
				//when the state changes is caused by select all don't autosum just jet first let it set all the values
				if(GLOBAL.eventSourceElement.id!='SLTALL'){
					Command.autoSum();
				}

			}
		}
	}

  foDisplayObject.setAttribute("data-logical-state", fsState);
};


Logical.updateLogicalCounter = function(fsState){

	var foCounterObject = null;
	var fiCurrentCount  = null;
		  foCounterObject = XDOM.getObject("logicalCounter");
		  fiCurrentCount  = XDOM.getObjectValue(foCounterObject);

	if(foCounterObject){

		switch(fsState){

			case "checked":
				fiCurrentCount++;
				break;
			case "unchecked":
				if(fiCurrentCount > 0){
					fiCurrentCount--;
				}
				break;
			default:
			  console.log('Fout bij afhandelen update logical counter');
			  break;
		}

		Logical.setLogicalCounter(fiCurrentCount);

	}
};


Logical.setLogicalCounter = function(fsCount){
	var foCounterWrapper = null;
	foCounterWrapper = XDOM.getObject("clearSelectWrapper");
  var fiCurrentCount = 0;
	var foCounterObject = null;
	foCounterObject = XDOM.getObject("logicalCounter");

	if(fsCount !== null){
		fiCurrentCount = fsCount;
	}

	if(foCounterObject){
		XDOM.setObjectValue(foCounterObject, String(fiCurrentCount));
	}

	if(foCounterWrapper){
		if(fiCurrentCount <= 0){

			XDOM.setAttribute(foCounterWrapper, "data-hidden", "true");
		}else{
			XDOM.setAttribute(foCounterWrapper, "data-hidden", "false");
		}
	}

	return;
};



