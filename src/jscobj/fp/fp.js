/* global GLOBAL, Stateless, XDOM, keyCode, FieldProgression, ENUM */

function fp(obj , container){
  this.x = 0;
  this.y = 0;
  this.obj = obj;
  this.container = container || XDOM.getParentByAttribute(obj,"data-fieldprogression-index");
  this.row = [];
  this.type = "";
};

/**
 * gaat naar het eerste veld van de regel
 * @returns {undefined}
 */
fp.prototype.first = function(){
  this.getRow();
  if(this.row.length === 0){
    return false;
  }
  XDOM.focus(this.row[0]);
  return true;
};
/**
 * gaat naar het laatste veld van de regel
 * @returns {undefined}
 */
fp.prototype.last = function(){
  this.getRow();
  if(this.row.length === 0){
    return false;
  }
  XDOM.focus(this.row[this.row.length-1]);
  return true;
};

fp.toEndOnSelectionAll = function(){
  let field = GLOBAL.eventSourceElement;
  if(field.maxLength==1 && XDOM.fieldIsChanged(field) && XDOM.getObjectValue(field)){
    return false;
  }
  fp.setCursorToEnd();
  return true;
}

/**
 * gaat naar het element rechts van het huidige element 
 * als deze niet is gevonden dan wordt .down() aangeroepen
 */
fp.prototype.next = function(){
  if (GLOBAL.eventSourceElement.type === "text" && GLOBAL.eventSourceElement.value != '') {
    switch (GLOBAL.selection) {
      case ENUM.selection.unKnown:
      case ENUM.selection.none:
      case ENUM.selection.start:
        return false; //navigatie binnen textElement
        break;
      case ENUM.selection.all:
        if(fp.toEndOnSelectionAll()){
          return true; //cursor naar het einde van het veld niet bij een lengte van 1 en een verandering 
        }
        break;
      case ENUM.selection.end:
        //verder gaan met fieldprogression
        break;
    }
  }
  this.getRow();
  var pos = this.row.indexOf(this.obj)+1;
  for(var l=this.row.length;pos<l;pos++){
    if(this.row[pos]){
       XDOM.focus(this.row[pos]);
       return;
    }
  }
  //is deze regel de subfile header dan niets doen 
  if(this.type!="subfileHead"){
    //geen element meer op de zelfde regel ga een regel naar beneden
    this.down(true);
  }

};




/**
 * gaat naar het element links van het huidige element 
 * als deze niet is gevonden dan wordt .up() aangeroepen
 */
fp.prototype.previous = function(){
  if (GLOBAL.eventSourceElement.type == "text" && GLOBAL.eventSourceElement.value != '') {
      switch (GLOBAL.selection) {
        case ENUM.selection.unKnown:
        case ENUM.selection.none:
        case ENUM.selection.end:
          return false; //navigatie binnen textElement
          break;
        case ENUM.selection.all:
          return true; //cursor naar het begin van het veld
          break;
        case ENUM.selection.start:
          break;
      }
    }
    
  this.getRow();
  var pos = this.row.indexOf(this.obj)-1;
  for(;pos>=0;pos--){
    if(this.row[pos]){
       XDOM.focus(this.row[pos]);
       return;
    }
  }
  //geen element meer op de zelfde regel ga een regel naar beneden
  this.up(true);
};

/**
 * verkrijgt een fp object afhankelijk van waar object in de pagina is gedefinieerd
 * @param {type} objIn
 * @returns {fp}
 */
fp.get = function(objIn){
  var obj = objIn || GLOBAL.eventSourceElement,
      tr = XDOM.getParentByTagName(obj,'TR'),
      progression = null,
      tag = 'DIV';
  
  
  if(obj.tagName==="TBODY" || obj.tagName==="THEAD"){
    tag=obj.tagName; 
  }
  
  if(tr){
    tag = tr.parentNode.tagName;
  }
  
  
  switch(tag){
    case "TBODY":
      progression = new fp.subfileBody(obj);
      break;
    case "THEAD":
      progression = new fp.subfileHead(obj);
      break;
    case "DIV": // single line ellement
      progression = new fp.singleLine(obj);
      break;
    default: //body
      return;
      break;
    
  }
  if(progression.init()){
    return progression;
  }
  return null;
  
};

/**
 * controleerd of het obj container als parent heeft 
 * bij geneste containers wordt de meest directe parent als container beschouw
 * @param {type} obj
 * @param {type} container
 * @returns {Boolean}
 */
fp.isInContainer = function(obj, container){
 return (container=== XDOM.getParentByAttribute(obj,"data-fieldprogression-index"));
};

/**
 * hulp functie om een gesorteerde array te krijgen met alle elementen in de juiste volgorde
 * @param {type} a
 * @param {type} b
 * @returns {Number}
 */
fp.comparePos = function(a,b) {
  var aXpos =  parseInt(a.getAttribute("data-xpos"));
  var bXpos =  parseInt(b.getAttribute("data-xpos"));
  if(!aXpos){
    aXpos = 0;
  }
  if(!bXpos){
    bXpos = 0;
  }
  if (aXpos < bXpos)
     return -1;
  if (aXpos > bXpos)
    return 1;
  return 0;
};


/**
 * zet de elementen in this.row in de juiste volgorde
 */
fp.prototype.orderRow = function(){
  if(!this.row || this.row.length<=1){
    return;
  }
  this.row = Array.prototype.slice.call(this.row, 0);
  this.row.sort(fp.comparePos);
};

fp.next = function(obj){
  var progression = fp.get(obj);
      progression.next();
};

fp.handleKeyUp = function(){

   let progression = fp.get();
  //  if(fp.subfileBody.handleSelection(progression)){
  //    return true;
  //  }

  //controleer of de lengte van het veld de maxlength heeft 
  //in dat geval 
    
  if(!progression){
    return false;
  }
 
  switch(GLOBAL.charCode){
    case keyCode.arrowLeft:
      progression.previous();
      break;
    case keyCode.arrowRight:
      progression.next();
      break;
    case keyCode.arrowUp:
      progression.up();
      break;
    case keyCode.arrowDown:
      progression.down();
      break;
    default:
     return false;
     break;
  }
  
  GLOBAL.eventObject.cancel();
	GLOBAL.eventObject.remapKeyCode();
  return true;
};



/**
 * voor het bepalen van de selectie en 
 * in verband met het uitschakelen van scroll gedrag binnen chrome bij pijltjes toetesen 
 **/
fp.handleKeyDown = function(){
	XDOM.setSelection();

  if(GLOBAL.eventObject.ctrlKey){
    //FieldProgression.handleCrtlKeyDown();
  }
	if(GLOBAL.charCode===keyCode.arrowUp ||GLOBAL.charCode===keyCode.arrowDown){
	  //binnen een memoveld met er nog wel gewerkt kunnen worden met pijltje omhoog en naar beneden. 
	  if(GLOBAL.eventObjectTAG !== "TEXTAREA"){
	  	XDOM.cancelAndRemap();
	  }
  }
};

fp.setCursorToEnd = function() {
  XDOM.setCursor(GLOBAL.eventSourceElement, GLOBAL.eventSourceElement.value.length);
};

/**
 * zet de field progression index
 * @param {type} obj
 * @returns {undefined}
 */
fp.setIndex = function(obj){
  obj.setAttribute("data-fieldprogression-index", fp.counter++);
};
/**
 * conter voor data-fieldprogression-index
 * deze begint bij 5 omdat de eerste 4 vergeven zijn namelijk voor :
 * DTADIV (single line deel) 1
 * COLHDG 2
 * SFL 3 en
 * het extended deel 
 * @type Number
 */
fp.counter = 5;