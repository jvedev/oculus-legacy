/**
 * voor het analizeren en definieeren van custom maskers
 */
CustomMask = {};

CustomMask.knownParts = ['A','C','D','N','Z','I'];

CustomMask.partDefinition = function(start, type){
	    this.start = start;
	    this.end = 0;
	    this.maxLength = null;  // MVB maxLength
	    this.inputClass = '';
	    this.outputClass = '';
	    this.delimiter = '';
	    this.delimiterCss = null;
	    this.message = '';
	    this.validate = '';
	    this.custom = true;
	    this.type = type;
	    this.validate = this.getDataType(type);
};

CustomMask.partDefinition.prototype.complete = function(end, type){
	 this.end = end;

   if(!isIn(type,CustomMask.knownParts)){
   	this.delimiter += type;
   }
   this.maxLength = this.end - this.start;  // MVB maxLength
   this.delimiterCss = CustomMask.getDelimiterClass(this.delimiter);
   this.getInputClass();
   this.getOutputClass();
};

CustomMask.partDefinition.prototype.getInputClass = function(){
 switch (this.type){
	 case 'A':
	 case 'C':
	 case 'Z':
		 this.inputClass =' data customInputMskDTA_';
		 break;
	 case 'D':
	 case 'I':
	 case 'N':
		 this.inputClass = ' dec customInputMskDEC_';
		 break;
	}
	if(this.maxLength < 9){  // MVB maxLength
  	this.inputClass  += '0' ;
  }
  this.inputClass  += this.maxLength;  // MVB maxLength
};

CustomMask.partDefinition.prototype.getOutputClass = function(){
	this.outputClass = 'customOutputMsk';
	 switch (this.type){
		 case 'A':
		 case 'C':
		 case 'Z':
			 this.outputClass += 'DTA_';
			 break;
		 case 'D':
		 case 'I':
		 case 'N':
			 this.outputClass += 'DEC_';
			 break;
	}
	if(this.maxLength < 9){
		this.outputClass  += '0' ;
	}
	this.outputClass += this.maxLength;  // MVB maxLength
};

CustomMask.partDefinition.prototype.getDataType = function(){
	switch (this.type){
	 case 'A':
		 return '*ALPHANUM';
		 break;
	 case 'Z':
	 case 'C':
		 return '*DTA';
		 break;
	 case 'D':
	 case 'N':
	 case 'I':
		 return '*DIG';
		 break;
	}
};

CustomMask.getDelimiterClass = function(fsDelimiter){
	if(!fsDelimiter){return;}
	var fsSmallDelimiters = ':/\\.,;\'\"}{[]-_)(*^!`~=+|';
	switch (fsDelimiter){

		case ':':
		  return "colonDelim";
		  break;
		case '/':
 			return "slashDelim";
 			break;
		case ' ':
		  return "spaceDelim";
		  break;
		case '-':
		  return "minusDelim";
		  break;
		case '.':
		  return "periodDelim";
		  break;
		default:
			if(fsSmallDelimiters.indexOf(fsDelimiter) > -1){
			   return "sMaskDelimiter3";
			}else{
		    if(fsDelimiter.length < 10){
          return 'mskxsinp0' + fsDelimiter.length;
			  }
			  return 'mskxsinp' + fsDelimiter.length;
			}
			break;
	}
};

CustomMask.get = function (def){
  if(!def){
    return;
  }
  var defArray = def.split('');
  var currentChar = '';
  var lastChar = '';
  var partDef = null;
  var position = 0;
  Mask.definitions[def] =[];

  //opbouwen van array van mask elementen en delimiters
  for (var i = 0,l=defArray.length; i<l;i++){
    currentChar = defArray[i];
    if(lastChar!=currentChar){
    	if(partDef){
    		partDef.complete(position,currentChar);
      }
      if(isIn(currentChar,CustomMask.knownParts)){
   	    partDef = new CustomMask.partDefinition(position,currentChar);
   	    Mask.definitions[def].push(partDef);

      }
    }
    if(isIn(currentChar,CustomMask.knownParts)){
     position++;
    }
    lastChar = currentChar;
  }
  //laatste element afmaken
  partDef.complete(position,currentChar);
  return Mask.definitions[def];
};