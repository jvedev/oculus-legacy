 GUI.Image = function(obj) {
   GUI.Image.baseConstructor.call(this,obj);
   this.uri = obj.imageURI;
   this.image = null;
   this.sizesInPixels = true; //de grote wordt niet bepaald door css maar als width en height
   this.errorMsgObj = null;
};

XDOM.extendObject(GUI.Image, GUI.BaseObject);

/**
 * @override GuiBaseObject
 */
GUI.Image.prototype.init = function(){
  this.base(GUI.Image, 'init');
  GUI.Images[this.id] = this;
};

/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.Image.prototype.render = function(){
  this.dom.domObject = XDOM.createElement("DIV",this.id);
  var foImage =  new Image();
  //this.setPosAndDimentions();

//  var fiMaxHeightPx =   this.parentObject.getHeightPx(this.height);
 var fiMaxWidthtPx =  this.parentObject.getWidthPx(this.width);

	//if(parseInt(fiMaxHeightPx)<= 0){ fiMaxHeightPx = "none"; }
	if(parseInt(fiMaxWidthtPx)<= 0){ fiMaxWidthtPx = "none"; }

  foImage.id = this.id+"_IMG";
  foImage.style.maxWidth  = '100%';
  foImage.style.height  = 'auto';
  foImage.style.width 	= 'auto';
  foImage.style.cursor = '-webkit-zoom-in';
  foImage.setAttribute("data-click-action", "oculusImage.expand" );

  this.dom.domObject.appendChild(foImage);
  this.dom.domObject.className  = this.getCssClass();
  if(this.height) {
    foImage.style.maxHeight = '100%';
    this.dom.domObject.className  += ' lines'+int2css(this.height, 2);
  }
  this.dom.image = foImage;
  this.updateState();
  return this.dom.domObject;
};


/**
 * @override GuiBaseObject
 */
GUI.Image.prototype.updateState = function(){
  this.base(GUI.Image, 'updateState');

  if(this.value){
    this.dom.image.src = this.value;
  }else if(this.uri){
    this.dom.image.src = this.currentData[this.uri];
  }else{
  	GUI.Image.onError(this.dom.image);
  	return;
  }

  GUI.Image.onSucces(this.dom.image);
  //this.dom.image.onerror = function(){this.dom.image.onerror(this.dom.image);};

};

GUI.Image.prototype.onError = function(){
  if(!this.dom.domObject){
    this.dom.domObject = XDOM.getObject(this.id);
  }
  this.dom.domObject.appendChild(this.dom.errorMessage);
};

GUI.Images ={};


GUI.Image.onError = function(foImage){

  if(XDOM.getObject("imgError")){
  	return;
  }

  var foParent = foImage.parentNode;
  foImage.style.display = "none";

  this.errorMsgObj = XDOM.createElement("p","imgError",null);
  foParent.appendChild(this.errorMsgObj);
};

GUI.Image.onSucces = function(foImage){

  if(XDOM.getObject("imgError")){

	  var foParent = foImage.parentNode;
	  foImage.style.display = "block";

		XDOM.removeDOMObject(this.errorMsgObj);
	}

};

