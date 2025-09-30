/* global fp, XDOM */
/**
 * subfile body field progression object
 * @returns {fp.subfileBody}
 */
fp.subfileBody = function(obj,container){
  fp.subfileBody.baseConstructor.call(this,obj,container);
};
XDOM.extendObject(fp.subfileBody, fp);


/**
 * initialisatie 
 */
fp.subfileBody.prototype.init = function(){
  if(!this.container){
    return false;
  }
  this.type = 'subfileBody';
  this.y = parseInt(XDOM.getParentAttribute(this.obj,"data-record-number"));
  this.axis = this.obj.getAttribute("data-axis");
  this.totatalRecords = this.container.getElementsByTagName("tbody").length;
  return true;
};

/**
 * haalt alle elementen op van de record y binnen de huidige container
 * geordend van links naar rechts
 */
fp.subfileBody.prototype.getRow = function(){
  if(!this.container){
    this.row = [];
    return;
  }
  var query = "input[data-record-number='" + this.y + "']:not([type='hidden']):not([data-hidden='true']):not([data-protected='true'])",
      inputs = this.container.querySelectorAll(query),
      query = "a[data-record-number='" + this.y + "']:not([type='hidden']):not([data-hidden='true']):not([data-protected='true'])",
      As = this.container.querySelectorAll(query);
  this.row = Array.prototype.slice.call(inputs).concat(Array.prototype.slice.call(As));
  this.orderRow();
};

fp.subfileBody.handleSelection = function(progression){
  if(progression.type === 'subfileBody'){
    return false;
  }
  
  let selectionProgression = fp.subfileBody.getselectionProgression();

  if(!selectionProgression){
    return false;
  }


  switch(GLOBAL.charCode){
    case keyCode.arrowUp:
      return selectionProgression.up();
      break
    case keyCode.arrowDown:
      return selectionProgression.down();
      break;
    default:
     return false;
     break;
  }
  return false;
}

fp.subfileBody.getselectionProgression = function(){
  var tbody  = XDOM.query('[data-record-selected="true"]'),
      obj = null;
//oplossing bedenken waneer wel en waneer niet 
  if(!tbody){ return null;}
  obj = tbody.querySelectorAll('a:not([data-axis="registration-radio"]), input')[0];
  if(!obj){return null;}
  return fp.get(obj);
}


fp.subfileBody.prototype.up = function(fromPrevious){
  var query = '',
      obj = null;
  this.y--;
  
  if(this.y>0 && fromPrevious){
    this.last();
    return;
  }
  
  while(this.y>0){
    query = "[data-record-number='" + this.y + "'][data-axis='" + this.axis + "']:not([type='hidden']):not([data-hidden='true']):not([data-protected='true'])";
    obj =  this.container.querySelector(query);
    if(obj){
      XDOM.focus(obj);
      return;
    }
    this.y--;
  }
   
  if(this.y===0){
    this.gotoHeader();
  }        
};
/**
 * gaat naar de het laatste element in de regel
 * @returns {undefined}
 */
fp.subfileBody.prototype.last = function(){
  this.getRow();
  XDOM.focus(this.row[this.row.length-1]);
  
};
/**
 * gaat naar de het eerste element in de regel
 * @returns {undefined}
 */
fp.subfileBody.prototype.first = function(){
  this.getRow();
  XDOM.focus(this.row[0]);
};
/**
 * gaat naar het invoer veld direct onder het huidige veld
 * als last = true dan wordt deze functie aangeroepen door de functie fp.next()
 * de cursor wordt dan op het eerste beschikbare veld van de volgende regel gezet
 * @param {boolean} fromNext
 * @returns {undefined}
 */
fp.subfileBody.prototype.down = function(fromNext){
  var query = '',
      obj = null;
  this.y++;
  if(fromNext){
    this.first();
    return;
  }
  while(this.y<=this.totatalRecords){
    query = "[data-record-number='" + this.y + "'][data-axis='" + this.axis + "']:not([type='hidden']):not([data-hidden='true']):not([data-protected='true'])";
    obj =  this.container.querySelector(query);
    if(obj){
      XDOM.focus(obj);
      return;
    }
    this.y++;
  }
};


fp.subfileBody.prototype.gotoHeader = function(){
  var headerId = this.container.getAttribute("data-sfl-header-id"),
      container = XDOM.getObject(headerId),
      header = new fp.subfileHead(null,container);
  header.y = 0;
  header.first();
};