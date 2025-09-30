/**
 * 
 * @param id van het zichbare input veld
 * @param isProtected geeft aan of veld protected is of niet
 */

Barcode = function (obj) {
	this.id								= obj.id;
  this.dom 							= {};
  this.count						= 0;
  this.totalCount				= 0;
  this.isProtected 			= false;
  this.init();
}

/**
 * @override GuiBaseObject
 */
Barcode.prototype.init = function(){
	this.dom.input 				= XDOM.getObject(this.id);
  this.dom.counter 			= XDOM.getObject(this.id + '_COUNT');
  this.dom.total 				= XDOM.getObject(this.id + '_CNT');
  this.dom.last 				= XDOM.getObject(this.id + '_LAST');
  this.dom.parentObject = XDOM.getObject('DTADIV'); 
  Barcode.instances[this.id] = this;
};


Barcode.prepareDom = function(){
	var pageObjects = XDOM.queryAllScope('[data-barcode="reader"]');
	var barcodeObject = null;

	for(var i=0,l=pageObjects.length;i<l;i++){
	  barcodeObject = new Barcode(pageObjects[i]);
	}
};

	
	
Barcode.prototype.handleKeyUp = function(){
	var fsBarcode = XDOM.getObjectValue(this.dom.input);
  if(GLOBAL.charCode == keyCode.enter){
    if(fsBarcode.length == 0){
      SESSION.activePage.autoSubmitInputObject = GLOBAL.eventSourceElement;
      Command.enter();
    }else{
      this.addBarcode(fsBarcode);
    }
  }
  return true;
};


Barcode.prototype.addBarcode = function(fsBarcode){
  this.count++;
  this.totalCount++;
  var foInput = XDOM.createElement('INPUT',this.id + '_' + this.count);
  
  foInput.type="hidden";
  foInput.name = this.id + '_' + this.count;
  if(this.isProtected){
    foInput.readOnly = true;
    foInput.className += ' protect';
  }

  this.dom.parentObject.appendChild(foInput);
  XDOM.setObjectValue( foInput,fsBarcode);
  XDOM.setObjectValue( this.dom.input,'');
  XDOM.setObjectValue( this.dom.last,fsBarcode);

  XDOM.setObjectValue( this.dom.counter, this.count.toString());
  XDOM.setObjectValue( this.dom.total, 	 this.totalCount.toString());
};

Barcode.handleKeyUp = function(e){
	if((GLOBAL.eventSourceElement) && (GLOBAL.eventSourceElement.getAttribute("data-barcode")=="reader")){
		XDOM.cancelEvent(e);
		if(Barcode.instances[GLOBAL.eventSourceElement.id]){
			Barcode.instances[GLOBAL.eventSourceElement.id].handleKeyUp();
    	return true;
		}
  }
  return false;
};



Barcode.handleKeyDown = function(){
	if((GLOBAL.eventSourceElement) && (GLOBAL.eventSourceElement.getAttribute("data-barcode")=="reader")){
    GLOBAL.eventSourceElement.setAttribute("data-block-autosubmit", "true");
  }
};

Barcode.update = function(){
	var pageObjects = XDOM.queryAllScope('[data-barcode="reader"]');
	var barcodeObject = null;
	
	for(var i=0,l=pageObjects.length;i<l;i++){
	  barcodeObjectId = pageObjects[i].id;
	  Barcode.instances[barcodeObjectId].resetValues();
	}
};

Barcode.prototype.resetValues = function(){
	
	for(var i=1,l=this.totalCount;i<=l;i++){
		XDOM.removeDOMObject(this.id+"_"+i);
	}
	
	this.count						= 0;
  //this.totalCount				= 0;
  
  XDOM.setObjectValue( this.dom.counter, this.count.toString());
  //XDOM.setObjectValue( this.dom.total, 	 this.totalCount.toString());
};