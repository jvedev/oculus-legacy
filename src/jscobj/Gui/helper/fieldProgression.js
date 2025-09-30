
GUI.fieldProgression = function(){
  this.lines = [];
};

GUI.fieldProgression.prototype.add = function(obj){
  if(!obj.forFieldProgression){
    return;
  }
  var x = parseInt(obj.x);
  var y = parseInt(obj.y);
  var id = obj.id;
  
  if (!this.lines[y]) {
    this.lines[y] = [];
  }
  this.lines[y][x] = id;
};
GUI.fieldProgression.prototype.setTabindex = function(base) {
  var fiTabindex= base + 1;
  var fsFirstId = this.getFirstElement();
  var foObject = XDOM.getObject(fsFirstId);
  var fsId = this.getNextElement(foObject);
  foObject.tabIndex  =fiTabindex++;
  while(fsId!=fsFirstId){
    foObject = XDOM.getObject(fsId);
    foObject.tabIndex  =fiTabindex++;
    fsId = this.getNextElement(foObject);
  }
};
GUI.fieldProgression.prototype.goLeft = function() {
  var fsId = null;
  if (GLOBAL.eventSourceElement.type == "text" && GLOBAL.eventSourceElement.value != '') {
    switch (GLOBAL.selection) {
      case ENUM.selection.unKnown:
      case ENUM.selection.none:
      case ENUM.selection.end:
        return false; //navigatie binnen textElement
        break;
      case ENUM.selection.all:
        XDOM.setCursor(GLOBAL.eventSourceElement, 0);
        return true; //cursor naar het begin van het veld
        break;
      case ENUM.selection.start:
        //verder gaan met fieldprogression
        break;
    }
  }
  
  fsId = this.getPrevioustElement(GLOBAL.eventSourceElement);
  if (!fsId) {
    return false;
  }
  return XDOM.focus(fsId);
};

GUI.fieldProgression.prototype.goRight = function() {
  var fsId = null;
  if (GLOBAL.eventSourceElement.type == "text" && GLOBAL.eventSourceElement.value != '') {
    switch (GLOBAL.selection) {
      case ENUM.selection.unKnown:
      case ENUM.selection.none:
      case ENUM.selection.start:
        return false; //navigatie binnen textElement
        break;
      case ENUM.selection.all:
        XDOM.setCursor(GLOBAL.eventSourceElement, GLOBAL.eventSourceElement.value.length);
        return true; //cursor naar het einde van het veld
        break;
      case ENUM.selection.end:
        //verder gaan met fieldprogression
        break;
    }
  }

  fsId = this.getNextElement(GLOBAL.eventSourceElement);
  if (!fsId) {
    return false;
  }
  return XDOM.focus(fsId);
};

/**
 * naar boven
 * bij pijltje naar boeven naar de vorige regel het eerste element
 * in een subfile naar het bovenliggende element
 * @returns {undefined}
 */
GUI.fieldProgression.prototype.goUp = function() {
  var fsId = null;
  var fiLine = parseInt(XDOM.getAttribute(GLOBAL.eventSourceElement,'data-line'));
  fsId = this.getPreviousLineElement(fiLine);
  return XDOM.focus(fsId);
};


/**
 * naar beneden
 * bij pijltje naar beneden naar de volgende regel het eerste element
 * in een subfile naar het bovenliggende element
 * @returns {undefined}
 */
GUI.fieldProgression.prototype.goDown = function() {
  var fsId = null;
  var fiLine = parseInt(XDOM.getAttribute(GLOBAL.eventSourceElement,'data-line'));
  fsId = this.getNextLineElement(fiLine);
  return XDOM.focus(fsId);
};

GUI.fieldProgression.prototype.next = function() {
  var fsId = this.getNextElement(GLOBAL.eventSourceElement);
  if (!fsId) {
    return false;
  }
  return XDOM.focus(fsId);
};

GUI.fieldProgression.prototype.getPrevioustElement = function(id) {
  var foObj = XDOM.getObject(id);
  var fiLine = parseInt(XDOM.getAttribute(foObj,'data-line'));
  var fiXpos = parseInt(XDOM.getAttribute(foObj,'data-xpos'));
  var faLines = this.lines[fiLine];
  var fiMaxXpos = null;
  
  for (var s in faLines) {
    if(s>=fiXpos){continue;}
    if(s>fiMaxXpos){
      fiMaxXpos = s;
    }
  }  
  
  if(fiMaxXpos!=null){
    return faLines[fiMaxXpos];  
  }else{
    return  this.getPreviousLineElement(fiLine);
  }
};

GUI.fieldProgression.prototype.getNextElement = function(id) {
  var foObj = XDOM.getObject(id);
  var fiLine = parseInt(XDOM.getAttribute(foObj,'data-line'));
  var fiXpos = parseInt(XDOM.getAttribute(foObj,'data-xpos'));
  var faLines = this.lines[fiLine];
  var fiMinXpos = null;
  var x = null;
  
  for (var s in faLines) {
    x = parseInt(s);
    if(x<=fiXpos){continue;}
    if(!fiMinXpos || x<fiMinXpos){
      fiMinXpos = x;
    }
  }  
  
  if(fiMinXpos!=null){
    return faLines[fiMinXpos];  
  }else{
    return  this.getNextLineElement(fiLine);
  }
};


/**
 * 
 * @returns het eerste element (links boven in)
 */
GUI.fieldProgression.prototype.getFirstElement = function() {
  var y = null;
  var minLine = null;
  for(var l in this.lines){
    y = parseInt(l);
    if(!minLine || minLine > y){
      minLine=y;
    }
  }
  return this.getFirstLineElement(minLine);
};

/**
 * 
 * @returns het eerste element van de laatste regel (links onder in)
 */
GUI.fieldProgression.prototype.getLasttElement = function() {
  var y = null, maxY = null, l = null;
  for( l in this.lines){
    y = parseInt(l);
    if(!maxY || maxY < y ){
      maxY = y;
    }
  }
  return this.getFirstLineElement(maxY);
};





/**
 * retourneerd het eerste element uit de rele aangegeven door line 
 * @param line
 * @returns
 */
GUI.fieldProgression.prototype.getFirstLineElement = function(line) {
  var faLines = this.lines[line];
  var x, minX = null;
  for(var l in faLines){
    x = parseInt(l);
    if(!minX || minX>x){
      minX = x;
    }
  }
  if(minX){
    return faLines[minX];  
  }
  return null;
};


GUI.fieldProgression.prototype.getNextLineElement = function(line) {
  //zoek de volgende regel op 
 var y, minY = null;
  
  for (var l in this.lines) {
    y = parseInt(l);
    if(y<=line){continue;}
    if(!minY || minY > y){
      minY = y;
    }
  }
  
  if(minY){
    return this.getFirstLineElement(minY);
  }
  
  
  //geen regel gevonden we line was de laatste regel retourneer het eerste veld uit het scherm  
    return this.getFirstElement();
};




GUI.fieldProgression.prototype.getPreviousLineElement = function(line) {
  var maxY = null, y=null, id=null;
  for (var l in this.lines) {
    y = parseInt(l);
    if(y >=line){continue;}
    if (!maxY || maxY < y) {
      maxY = y;
    }
  }
  id = this.getFirstLineElement(maxY);
  if(!id){
    id = this.getLasttElement();
  }
  return id;
};



GUI.fieldProgression.prototype.keyUp = function() {
	
	if(XDOM.GLOBAL.getAttribute('data-datatype')==ENUM.dataType.memo){
		return; //geen field progression op een textarea
	}
  switch(GLOBAL.charCode){
      case keyCode.arrowLeft:
        this.goLeft();
        break;
      case keyCode.arrowRight:
        this.goRight();
        break;
      case keyCode.arrowUp:
        this.goUp();
        break;
      case keyCode.arrowDown:
        this.goDown();
        break;
      default:
        return false;
    }
  return true;
};