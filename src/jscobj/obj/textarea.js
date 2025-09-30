function TextArea(){}

TextArea.warningTreshold = 50;

TextArea.handleKeyUp = function(){
	if(GLOBAL.eventObjectTAG != "TEXTAREA" ){
		return false
	}
	if(GLOBAL.eventSourceElement.readOnly){
		return true;
	}

	GLOBAL.eventSourceElement.setAttribute("data-block-autosubmit", "false");

	var fiTextLength = TextArea.getLength(GLOBAL.eventSourceElement);
	var fiMaxLength = GLOBAL.eventSourceElement.maxLength;

  if(fiTextLength==fiMaxLength){
		setEventsMessage('F',fiTextLength + getCapt('gTXTAREAMAX5') + fiMaxLength);
	}else if(fiTextLength>=fiMaxLength){
		setEventsMessage('F',getCapt('gTXTAREAMAX1') + fiMaxLength + getCapt('gTXTAREAMAX2'));
	}else if(fiTextLength>(fiMaxLength - TextArea.warningTreshold)){
		setEventsMessage('G',fiTextLength + getCapt('gTXTAREAMAX3') + fiMaxLength);
	}else  {
		setEventsMessage('A',fiTextLength + getCapt('gTXTAREAMAX3') + fiMaxLength);
	}
	return true;
};

TextArea.validate = function(obj){
		var fiTextLength = TextArea.getLength(obj);
	  var fiMaxLength = obj.maxLength;
	  if(fiTextLength > fiMaxLength){
	    setMessage('F', getCapt('gTXTAREAMAX1') + fiMaxLength + getCapt('gTXTAREAMAX4'));
      return false;
	  }
    return true;
};

TextArea.getLength = function(obj){
  var fsText =  XDOM.getObjectValue(obj);
	fsText = fsText.replace(/(\r\n)/g, "yy");
  fsText = fsText.replace(/(\n\r)/g, "zz");
  fsText = fsText.replace(/\r/g, "qq");
  fsText = fsText.replace(/\n/g, "--");
  return fsText.length;
};

TextArea.handleKeyDown = function(){
	if((GLOBAL.eventObjectTAG == "TEXTAREA") && (GLOBAL.charCode == keyCode.enter)){
		GLOBAL.eventSourceElement.setAttribute("data-block-autosubmit", "true");
  }
};