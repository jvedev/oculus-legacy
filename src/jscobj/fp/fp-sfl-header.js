/* global fp, XDOM */
/**
 * subfile header field progression object
 * @returns {fp.subfileHead}
 */
fp.subfileHead = function(obj,container){
  fp.subfileHead.baseConstructor.call(this,obj,container);
};
XDOM.extendObject(fp.subfileHead, fp);


/**
 * initialisatie 
 */
fp.subfileHead.prototype.init = function(){
  this.type = 'subfileHead';
  this.y = parseInt(this.obj.getAttribute("data-line"));
  return true;
};

/**
 * haalt alle input elementen op van de header binnen de huidige container
 * geordend van links naar rechts
 */
fp.subfileHead.prototype.getRow = function(){
  if(!this.container){
    this.row = [];
    return;
  }
  var query = "input:not([type='hidden']):not([data-hidden='true']):not([data-protected='true'])," + 
              "a[data-line='" + this.y + "'].checkbox:not([type='hidden']):not([data-hidden='true']):not([data-protected='true'])";
  this.row = Array.prototype.slice.call(this.container.querySelectorAll(query));
  this.orderRow();
};

/**
 * het is niet mogelijk om vanuit de header regel om hoog te gaan 
 * @returns {undefined}
 */
fp.subfileHead.prototype.up = function(){};

/**
 * omdat een subfile header altijd maar 1 regel met inputs heeft 
 * ga je met het pijltje down naar de eerste regel van de body
 * @returns {undefined}
 */
fp.subfileHead.prototype.down = function(){
  var bodyId = this.container.getAttribute("data-sfl-body-id"),
      container = XDOM.getObject(bodyId),
      bodyFp = new fp.subfileBody(null,container);
  bodyFp.y = 1;
  bodyFp.first();
};

