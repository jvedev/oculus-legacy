function AttentionLevel (){};

/**
 * tijdelijke update actie later als ajaxi is geimplementeerd wordt dit rechtstreeks bij het zetten van de waarde in het object aangeroepen
 */
AttentionLevel.update = function(){
	var foPageObjects = XDOM.queryAllScope('[data-attention-field-id]');
	for(var i=0,l=foPageObjects.length;i<l;i++){
		AttentionLevel.apply(foPageObjects[i]);
	}
};

AttentionLevel.apply = function(obj){
    var indicatorField = XDOM.getAttribute(obj,"data-attention-field-id");
    if(!indicatorField){return;}
    var recordNr = 	getClientRecordNr(obj);
    var level = null, parentObj = null, attributes = null;
    
    if(recordNr || recordNr==0){
      attributes = SESSION.activeData.subfileAttributes[recordNr];
      level = attributes[indicatorField];
      parentObj = XDOM.getParentByTagName(obj, 'TD');
      parentObj.setAttribute("data-attention-level", level);
      return;
    }
    level = SESSION.activeData.headerAttributes[indicatorField];
    
    if(Mask.isPart(obj) && obj.parentElement.tagName=="DIV"){
      obj.parentNode.setAttribute("data-attention-level", level);
    }
  	obj.setAttribute("data-attention-level", level);
    
};
