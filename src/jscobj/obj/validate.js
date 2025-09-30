var Validate = {};
// Validation and editing definitions
// tested for characters except those in the expression
var gaREGEXP = {};
gaREGEXP['*TXT'] = new RegExp(/[^\x20-\x7E\xA0-\xFF]/); //POM-2757 reqexp \u20AC deel is het euro teken heb ik er uit gehaald om dat euro tekens niet mogen in een TXT veld was dus new RegExp(/[^\x20-\x7E\xA0-\xFF\u20AC]/);
gaREGEXP['*MEMO'] = new RegExp(/[^\x20-\x7E\x0D\x0A\xA0-\xFF\x80]/);
gaREGEXP['*UCS2'] = new RegExp(/[\uD800-\uDFFF]/); ////====>>> \u000A\u000D OVERLEG MET MVB WAAROM GEEN ENTERS?

//zie codetabel op: https://www.ascii.cl/htmlcodes.htm
// A-Z a-z 0-9 spatie *.,-_ extra: + 2B / 2F ( 28 ) 29 # 23 : 3A ; 3B = 3D | 7C
gaREGEXP['*DTA']=new RegExp(/[^\x20\x23\x2A\x2C\x2D\x2E\x5F\x30-\x39\x41-\x5A\x61-\x7A\x23\x28\x29\x2B\x3A\x3B\x3D\x2F\x7C]/);
gaREGEXP['*DEC'] = new RegExp();
gaREGEXP['*VARDEC'] = new RegExp();
gaREGEXP['*DIG'] = new RegExp(/[^\x30-\x39\x20]/); // 0-9 en spatie
gaREGEXP['*DIGITS']=new RegExp(/^[ ]*?[0-9]*[ ]*?$/);  //0-9 voor en achter spaties
gaREGEXP['*ALPHANUM'] = new RegExp(/[^a-zA-Z0-9 ]/); //niet (^) a-z of A-Z of 0-9 of " " (spatie)
gaREGEXP['*QUARTER'] = new RegExp(/[^1-4]/); // 1-4
gaREGEXP['*ALPHA'] = new RegExp(/^[a-zA-Z ]+$/);  //0-9 voor en achter spaties
//gaREGEXP['*ALPHA'] = new RegExp(/^[ ]*?[a-zA-Z]*[ ]*?$/); // a tm z en A tm Z
gaREGEXP['*QUICKSEARCH']=new RegExp(/[^\xC0-\xFF\x20\x21\x22\x23\x2A\x2C\x2D\x2E\x5F\x30-\x5A\x61-\x7A\x23\x26\x28\x29\x2B\x3A\x3B\x3D\x2F\x7C\xB4]/);

Validate.test = function(id){

	var obj = XDOM.getObject(id);

	var value = "";
	if(obj.value != null){
		value = obj.value;
	}

	var returnValue = null;

	if(!value || value.trim()=='' || obj.type == 'hidden'){
		return true;
	}
	switch(XDOM.getAttribute(obj,"data-datatype")){
		case "*MEMO":
		  returnValue = TextArea.validate(obj);
		  if(returnValue){
		  	returnValue = Validate.memo(obj);
		  }
			return returnValue;

		  break;
		case "*MASK":
		  return Validate.mask(obj);
		  break;
		case "*QUICKSEARCH":
		  return Validate.quickSearch(obj);
		  break;
		case '*DEC':
		  return Validate.dec(obj);
		  break;
		case '*DTA':
		  return Validate.data(obj);
		  break;
		case '*TXT':
		case '*PWD':
		  return Validate.text(obj);
		  break;
		}
	return true;
};



Validate.handleError = function (message, obj){
  panel = XDOM.getEditWindow(obj);
  if(panel){
    panel.footer.setMessage('F',message);
  }else{
    setMessage('F',message);
  }
  INP.focusErrorField(obj);
};

Validate.getDecimalPatern = function(signed, thousandSeparator, intLength, decimalLength){
  var patern = '';
  if(signed){
    patern = "(-)";
  }
  if(thousandSeparator){
    for(var i=0;i<intLength;i++){
    	if(i%3==0 && i!=intLength && i>0){
    	  patern = SETTINGS.thousandSeparator + patern;
    	}
    	patern ='#' + patern;
    }
  }else{
    patern +='#'.times(intLength);
  }


  if(decimalLength > 0){
    patern +=',' + '#'.times(decimalLength);
  }
  return patern;
};

Validate.mask = function(obj){
  var message = '';
	if (!Mask.isValidPart(obj)) {
		message = Mask.getErrorMessage(obj);
		Validate.handleError(message,obj);
		return false;
	}
	return true;
};

Validate.quickSearch = function(obj){

	var regEx = null;
	var value = '';
	var pos =null;
	var character = '';
	var msg = '';
	var returnObj = { succeed: true, message: "" }
	value = obj.value;

	regEx = gaREGEXP['*QUICKSEARCH'];

	if(regEx.test(value)) {
	  pos = value.search(regEx);
	  character = value.substring(pos, pos+1);
	  msg = getCapt('gVLD003') + character + getCapt('gVLD004');
	  returnObj.succeed = false;
	  returnObj.message = msg;
	  return returnObj;
	}

  return returnObj;
};


Validate.data = function(obj){

	var regEx = null;
	var value = '';
	var pos =null;
	var character = '';

	value = obj.value;

  //controleer op voorloop spaties
  if (!XDOM.getBooleanAttribute(obj,"data-left-blank") && value.indexOf(' ')==0){
     Validate.handleError(getCapt('gVLD008'),obj);
     return false;
  }

  if(XDOM.getBooleanAttribute(obj,"data-digits")){
    return Validate.digits(obj);
  }

  if(XDOM.getBooleanAttribute(obj,"data-alpha")){
    return Validate.alpha(obj);
  }

	regEx = gaREGEXP['*DTA'];

	if(regEx.test(value)) {
	  pos = value.search(regEx);
	  character = value.substring(pos, pos+1);
	  message = getCapt('gVLD003') + character + getCapt('gVLD004');
	  Validate.handleError(message,obj);
	  return false;
	}

  return true;
};

Validate.digits = function(obj){
  var regEx = gaREGEXP['*DIGITS'];
  if (!regEx.test(obj.value)){
  	Validate.handleError(getCapt('gVLD007'),obj);
    return false;
  }
  return true;
};

Validate.UCS2 = function(obj){
  var regEx = gaREGEXP['*UCS2'];
  var message = "";
  var pos = null;
  var character = null;
  var charString = null;

  if (regEx.test(obj.value)){
    pos = obj.value.search(regEx);
    character  = obj.value.substring(pos, pos+1);
		charString = Validate.getInvalidKey(character);
  	message = getCapt('gVLD003') + charString + getCapt('gVLD004');

  	Validate.handleError(message,obj);
    return false;
  }
  return true;
};

Validate.alpha = function(obj){
  var regEx = gaREGEXP['*ALPHA'];
  if (!regEx.test(obj.value)){
  	Validate.handleError(getCapt('gVLD009'),obj);
    return false;
  }
  return true;
};


Validate.text = function(obj){
  var regEx = null;
  var value = '', pos=null, character= '';

  regEx = gaREGEXP['*TXT'];
  value = obj.value;

  if(XDOM.getBooleanAttribute(obj,"data-unicode")){
 	 return Validate.UCS2(obj);
 	}

  if (regEx.test(value)) {
    pos=value.search(regEx);
    character=value.substring(pos, pos+1);
    message = getCapt('gVLD003') + character + getCapt('gVLD004');
    Validate.handleError(message,obj);
    return false;
  }

  if(obj.getAttribute("data-to-upper")=='true'){
    value = value.toUpperCase()
  }

  if(!obj.maxLength){
   return true;
  }

  if(value.length <= parseInt(obj.maxLength)){
    return true;
  }
  Validate.handleError(getCapt('gVLD010') + obj.maxLength + getCapt('gVLD011') ,obj);
  return false
};

Validate.memo = function(obj){
  var regEx = null;
  var value = '', pos=null, character= '';
  var charString = "";
  regEx = gaREGEXP['*MEMO'];
  value = obj.value;

  if(XDOM.getBooleanAttribute(obj,"data-unicode")){
    return Validate.UCS2(obj);
  }

  if (regEx.test(value)) {
    pos = value.search(regEx);
    character  = value.substring(pos, pos+1);
		charString = Validate.getInvalidKey(character);

    let message = getCapt('gVLD003') + charString + getCapt('gVLD004');
   	obj.selectionStart = pos;
   	obj.selectionEnd = pos+1;
   	obj.focus ();
    Validate.handleError(message,obj);
    return false;
  }
  return true;
};

Validate.getInvalidKey = function(character){

    var fsCharacter = null;
        fsCharacter = character;


		if(!fsCharacter){
			return "";
		}

		var charCode = fsCharacter.charCodeAt(0);
    switch(charCode){
    	case 9:
    	  charString = "<tab>";
    	  break;
    	case 8195:
    		charString = "<enter>";
    	  break;
    	default:
				charString = character;
    	  break;
    }

    return charString;

};

Validate.dec = function(obj){
	var result = true;
	if(obj.getAttribute("data-maxscale-system-limit")){
    result = Validate.scale(obj);
	}else{
		result = Validate.decimal(obj);
	}

	if(result && obj.value.trim()=='-'){
    obj.value='';
  }
	return result;
};


Validate.decimal = function(obj){ // MVB aangepast
	var error = false;
  var value = obj.value.trim();
	var signed = XDOM.getBooleanAttribute(obj,"data-signed");
	var thousandSeparator = (obj.getAttribute("data-thousand-separator")=="on");
  if(thousandSeparator){
		value = unformatThousand(value);
	}
  var parts = value.split(SETTINGS.decimalSeparator);
  var decimalLength = parseInt(obj.getAttribute("data-scale"));
  var intLength = parseInt(obj.getAttribute("data-precision"))-decimalLength;
  if(value.indexOf('.')>0){
    error = true;
  }
  //formaat begrijpelijk maken voor javascript (123,12 wordt 123.12)
  value = parts.join('.');

  if(value.substr(0,1) == '-' && !signed) {
      Validate.handleError(getCapt('gVLD005'),obj);
      return false;
  }

  //checken voor geldigheid nummer;
  if(isNaN(value)){
  	 error = true;
  }

  if(parts.length > 2){
  	error = true;
  }

	var negativeCorrection = 0;
	if(value.substr(0,1) == '-'){
		//value is een negatieve waarde. Het - teken moet niet meegeteld worden bij de toegestane lengte.
		negativeCorrection = 1;
	}


  if(parts[0].length > (intLength + negativeCorrection)){
  	error = true;
  }
  if(parts[1] && parts[1].length > decimalLength){
  	error = true;
  }
  if(error){
  	message =  getCapt('gVLD001') + Validate.getDecimalPatern(signed, thousandSeparator, intLength, decimalLength);
  	Validate.handleError(message,obj);
  	return false;
  }
  //er is geen fout opgetreden
  return true;

};

Validate.scale = function(obj){
	var scaleObj = new MaxScale(obj);
	var message = '';
  if(!Validate.decimal(obj)){
     message = getCapt('gVLD001') + scaleObj.getPatern();
     Validate.handleError(message,obj);
    return false;
  }
	if(!scaleObj.validate()){
     message = getCapt('gVLD001') + scaleObj.getPatern();
     Validate.handleError(message,obj);
     return false;
	}
	scaleObj.obj = null;
	scaleObj = null;
	return true;
};


Validate.All=function(){
  var faInputs = XDOM.queryAll('INPUT[data-datatype]:not([data-stateless-page-id]), TEXTAREA[data-datatype]:not([data-stateless-page-id])');
  var foInput = null;
  for(var i = 0, l = faInputs.length;i<l;i++){
    foInput = faInputs[i];
    if(!Validate.test(foInput)){
      return false;
    }else{
      addAttributes(foInput);
    }
  }

  return true;

};




