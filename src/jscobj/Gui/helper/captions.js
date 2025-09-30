/* global SESSION */

function Captions(obj){
  this.defaultCaptions = obj.captionsDftLang;
  this.userCaptions = obj.captionsUserLang;
}

Captions.returnCaption = function(key){
	
	var domCaptions = SESSION.activePage.domCaptions;
	
  if(domCaptions.userCaptions && hasValue(domCaptions.userCaptions[key])){
    return domCaptions.userCaptions[key];
  }
  if(domCaptions.defaultCaptions && hasValue(domCaptions.defaultCaptions[key])){
    return domCaptions.defaultCaptions[key];
  }
  return null;
};

Captions.prototype.get = function(key){
  if(this.userCaptions && hasValue(this.userCaptions[key])){
    return this.userCaptions[key];
  }
  if(this.defaultCaptions && hasValue(this.defaultCaptions[key])){
    return this.defaultCaptions[key];
  }
  return 'error undefined caption: ' + key;
};


Captions.getTitle = function (origin,captionCode, defaultText, recordNr){
  let title = '';
	switch(origin){
		case "*VAR":
  	  if(recordNr != null){
        title = SESSION.activeData.subfileData[recordNr][captionCode];
      }else{
        title= SESSION.activeData.headerData[captionCode];
      }
			break;
		case "*LBL":
			title = getCaption(captionCode, captionCode + ": niet bekend");
			break;
		default:
			title = defaultText ;
			break;
  }
  return title || '';
  
}