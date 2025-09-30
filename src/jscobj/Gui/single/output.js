GUI.Output = function (obj) {
  GUI.Output.baseConstructor.call(this,obj);
  this.dataType = nullWhenEmpty(obj.dataType);
  this.blankWhenZero = nullWhenEmpty(obj.blankWhenZero);
  this.thousandSeparator  = nullWhenEmpty(obj.thousandSeparator);
  this.decimalSeparator = ',';
  this.scaleCss = '';
  this.maxScaleSystemLimit  = nullWhenEmpty(obj.maxScaleSystemLimit);
  this.maxScaleField = nullWhenEmpty(obj.maxScaleField);
};

XDOM.extendObject(GUI.Output, GUI.BaseObject);

/**
 * @override GuiBaseObject
 */
GUI.Output.prototype.init = function(){
  this.base(GUI.Output, 'init');

  if(!this.blankWhenZero){
    this.blankWhenZero = ENUM.blankWhenZero.blank;
  }

  if(!this.thousandSeparator){
    this.thousandSeparator = ENUM.thousandSeparator.none;
  }else if(this.thousandSeparator == ENUM.thousandSeparator.period){
		this.decimalSeparator = ',';
	}else if(this.thousandSeparator == ENUM.thousandSeparator.comma){
    this.decimalSeparator = '.';
  }

  this.setDefaults();
  this.setValue();
};

/**
 * haalt de waarde op uit de dataset
 */
GUI.Output.prototype.setValue = function(){

  this.base(GUI.Output, 'setValue');

  XDOM.setAttribute(this.dom.domObject, "data-old-value", this.value);
  XDOM.setAttribute(this.dom.domObject, "data-output-value", this.value);

  if(this.dataType == ENUM.dataType.decimal){
  	if(this.blankWhenZero == ENUM.blankWhenZero.blank && isZero(this.value)){
      this.value='';
  	}
  }
  if(this.value==''){
    this.value=' ';
  }else{
    this.formatNumber();
  }
};

/**
 * voegd voor een numerieke waarde duizend tekens toe
 */
GUI.Output.prototype.formatNumber = function(){
  if(this.dataType != ENUM.dataType.decimal) {return;}
  this.formatThousandSeparator();
  this.formatMaxScale();

};

GUI.Output.prototype.formatMaxScale = function(){
	  if(!this.maxScaleField){return;};
	  var maxScale= this.getDataValue(this.maxScaleField);
	  var foScale = formatMaxScale(this.value,this.maxScaleSystemLimit, maxScale,this.decimalSeparator);
	  this.value = foScale.value;
	  this.scaleCss = foScale.cssClass;


};


GUI.Output.prototype.formatThousandSeparator = function(){
   var fsSeparator = '';
	 var fsDecimal = '';
	 var fsInteger = '';
	 var faNumber = null;
	 var rgx = /(\d+)(\d{3})/;

	 switch(this.thousandSeparator)  {
	   case ENUM.thousandSeparator.period:
	     fsSeparator = ".";
	     break;
	   case ENUM.thousandSeparator.comma:
	     fsSeparator = ",";
	     break;
	   case ENUM.thousandSeparator.none:
	     return;
	     break;
	  }


	  faNumber = this.value.split(this.decimalSeparator);
	  fsInteger = faNumber[0];
	  fsDecimal = faNumber.length > 1 ? this.decimalSeparator + faNumber[1] : '';

	  while (rgx.test(fsInteger)) {
	    fsInteger = fsInteger.replace(rgx, '$1' + fsSeparator + '$2');
	  }
	  this.value = fsInteger + fsDecimal;
};

/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.Output.prototype.render = function(){

  this.dom.domObject = XDOM.createElement("output",this.id, this.getCssClass());
  this.setPosAndDimentions();
  this.updateState();

	FieldAttribute.setAttentionLevel(this);

  return this.dom.domObject;
};



/**
 * @override GuiBaseObject
 */
GUI.Output.prototype.updateState = function(){
  this.base(GUI.Output, 'updateState');
  if(!this.dom.domObject){
    this.dom.domObject = XDOM.getObject(this.id);
  }
  this.dom.domObject.className  = this.getCssClass();
  this.dom.domObject.innerText = this.value;

  XDOM.setAttribute(this.dom.domObject, "data-output-value", this.value);
};

/**
 * @override GuiBaseObject
 * @returns cssClasses
 */
GUI.Output.prototype.getCssClass = function(){
  fsCss = this.base(GUI.Output, 'getCssClass');
  fsCss += ' ' + this.dataType;
  fsCss += ' ' + this.scaleCss;
  return fsCss;
};