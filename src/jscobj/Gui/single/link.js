GUI.Link = function (obj) {
  GUI.Link.baseConstructor.call(this,obj);
  this.dataType = nullWhenEmpty(obj.dataType);
  this.protocol = nullWhenEmpty(obj.protocol);
  this.aliasField = nullWhenEmpty(obj.aliasField);
  this.aliasType = nullWhenEmpty(obj.aliasType);
  this.urlType = nullWhenEmpty(obj.urlType);
  this.aliasText = '';
  this.extension = '';
  this.type = 'Link';
};
XDOM.extendObject(GUI.Link, GUI.BaseObject);



GUI.Link.isLink = function(foField, foData){

		if(foField.dataType == "*LNK"){
			foField.protocol 		 = foData.protocol;
			foField.aliasType 	 = foData.aliasType;
		  foField.aliasField 	 = foData.aliasField;
		  if(foData.urlType == "*HashedUrl"){
	  		foField.urlType = foData.urlType;
	  	}
		}

	return;
};

/**
 * @override GuiBaseObject
 */
GUI.Link.prototype.init = function(){
  this.base(GUI.Link, 'init');
  this.setDefaults();
  if(!this.aliasType){
    this.aliasType = ENUM.aliasType.data;
  }
  if(this.aliasType == ENUM.aliasType.data && this.aliasField){ //voor link output
    this.datafield = this.aliasField;
  }
  this.setValue();
};



GUI.Link.prototype.setValue = function(){
  switch(this.aliasType){
  case ENUM.aliasType.label:
    this.aliasText = this.parentObject.captions.get(this.datafield);
    break;
  case ENUM.aliasType.data:
    this.aliasText = this.getDataValue(this.datafield);
    break;
  case ENUM.aliasType.image:
  	this.extension = this.getDataValue(this.aliasField);
    break;
  }
  this.base(GUI.Link, 'setValue');
};


/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.Link.prototype.render = function(showInSubfile){
  this.dom.domObject = XDOM.createElement("div",this.id, this.getCssClass());
  this.dom.link = XDOM.createElement("a",this.id + "-link");
  this.dom.domObject.appendChild(this.dom.link);

  this.updateState();

  if(showInSubfile){
		XDOM.classNameReplaceOrAdd(this.dom.domObject, 'linkInSubfile', 'linkInSubfile');
  }
  return this.dom.domObject;
};



/**
 * @override GuiBaseObject
 */
GUI.Link.prototype.updateState = function(){
  this.base(GUI.Link, 'updateState');

  if(!this.dom.domObject){
    this.dom.domObject = XDOM.getObject(this.id);
    this.dom.link = XDOM.getObject(this.id + "-link");
  }

  if(this.value == ""){
  	XDOM.removeDOMObject(this.dom.link);
  	this.dom.link = XDOM.createElement("a",this.id + "-link");
  	this.dom.domObject.appendChild(this.dom.link);
		return;
  }

  switch(this.protocol){
    case ENUM.protocol.http:
      this.dom.link.target = '_blank';

      if(this.value.indexOf("http") === 0)  {
      	this.dom.link.href = this.value;
      }else{
      	this.dom.link.href = 'http://' + this.value;
      }

      break;
    case ENUM.protocol.file:
      this.dom.link.target = "_blank";
      this.dom.link.href = this.value;
      break;
    case ENUM.protocol.mail:
      this.dom.link.target = "_top";
      this.dom.link.href = 'mailto:"' + this.value + '"';
      break;
  }

  if(this.aliasType == ENUM.aliasType.image){
  	XDOM.setAttribute(this.dom.link, "data-alias-field" , this.aliasField);
  	XDOM.setAttribute(this.dom.link, "data-alias-type" , this.aliasType);
  	XDOM.setAttribute(this.dom.link, "data-protocol" , this.protocol);
  	XDOM.setAttribute(this.dom.link, "data-icon" , this.extension);

  	this.dom.link.className = 'fa fa-icon dataSectionButton theme-hover-color';

  }

 	if(this.urlType == "*HashedUrl"){
 		XDOM.removeAttribute(this.dom.link,"target");

   this.dom.link.href 		= "javascript:void(0);";
  	XDOM.setAttribute(this.dom.link, "data-url-type" , this.urlType);
  	XDOM.setAttribute(this.dom.link, "value" , this.value);
  	XDOM.setAttribute(this.dom.link, "data-uri" , this.value);

  	XDOM.setAttribute(this.dom.link, "data-click-action" , "Link.handleOnClick");
  	XDOM.setAttribute(this.dom.link, "onclick" , "return false;");

  	this.dom.link.className = 'fa fa-icon dataSectionButton theme-hover-color';
	}


  this.dom.link.innerHTML = this.aliasText;
  this.dom.domObject.className  = this.getCssClass();

  XDOM.setAttribute(this.dom.link, "data-datatype" , "*LNK");


  if(this.parentObject){
  	this.setPosAndDimentions();
  }

};

/**
 * @override GuiBaseObject
 * @returns cssClasses
 */
GUI.Link.prototype.getCssClass = function(){
  return ' text ' + this.base(GUI.Link, 'getCssClass');
};