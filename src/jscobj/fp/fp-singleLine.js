/* global fp, XDOM, SETTINGS */
/**
 * single line field progression object
 * @returns {fp.singleLine}
 */
fp.singleLine = function(obj,container){
  fp.singleLine.baseConstructor.call(this,obj,container);
};
XDOM.extendObject(fp.singleLine, fp);


/**
 * initialisatie 
 */
fp.singleLine.prototype.init = function(){
  this.type = 'singleLine';
  this.y = parseInt(this.obj.getAttribute("data-line"));
  return true;
};


/**
 * haalt alle elementen op van de regel y binnen de huidige container
 * geordend van links naar rechts
 */
fp.singleLine.prototype.getRow = function(){
  if(!this.container){
    this.row = [];
    return;
  }
  var query = "input[data-line='" + this.y + "']:not([type='hidden']):not([data-hidden='true']):not([data-protected='true']), " +
              "a[data-line='" + this.y + "'].checkbox:not([type='hidden']):not([data-hidden='true']):not([data-protected='true']), " +
              "textarea[data-line='" + this.y + "']:not([type='hidden']):not([data-hidden='true']):not([data-protected='true'])" 
      rawRow = this.container.querySelectorAll(query);
  this.row = [];
  //haal alle elementen uit de array die niet binnen deze container vallen 
  //dat kan gebeuren bij een normale single line element in een pagina
  //waar ook een of meer subfiles, extended velden(onder de subfile), subviews of popup windows in staan
  for(var i=0,l=rawRow.length;i<l;i++){
    if(fp.isInContainer(rawRow[i],this.container)){
      this.row.push(rawRow[i]);
    }
  }
  this.orderRow();
};

/**
 * verplaatste de focus naar het meest linkse veld 
 * van de dichtsbijzijnde regel boven het huidige veld
 * die een input veld heeft
 * is die er niet dan de eerste regel vanaf de onderkant van het scherm
 * @returns {undefined}
 */
fp.singleLine.prototype.up = function(fromPrevious){
  var currentRow = this.y;
  this.y--;

  while(this.y > 0){
    if(fromPrevious && this.last()){
        return;
    } 
    if(this.first()){
        return;
    }
    this.y--;
  }
  this.y=SETTINGS.maxLines;
  while(this.y > currentRow){
    if(fromPrevious && this.last()){
        return;
    } 
    if(this.first()){
      return;
    }
    this.y--;
  }
  
};


/**
 * verplaatste de focus naar het meest linkse veld 
 * van de dichtsbijzijnde regel onder het huidige veld
 * die een input veld heeft
 * is die er niet dan de eerste regel vanaf de bovenkant van het scherm
 * @returns {undefined}
 */
fp.singleLine.prototype.down = function(){
  var currentRow = this.y;
  this.y++;

  while(this.y < SETTINGS.maxLines){
    if(this.first()){
      return;
    }
    this.y++;
  }
  this.y=1;
  while(this.y < currentRow){
    if(this.first()){
      return;
    }
    this.y++;
  }
  
};
