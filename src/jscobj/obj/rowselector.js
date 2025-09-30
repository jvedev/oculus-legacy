/* global XDOM, NAV, Logical, GLOBAL, MultiSelect */

NAV.Rowselector = {};
NAV.Rowselector.lastRowCliked = null;

NAV.Rowselector.toggleAll = function(obj) {
  var value = XDOM.getObjectValue(obj),
      bodyId = XDOM.getParentAttribute(obj,"data-sfl-body-id") || 'SFL',
      bodyContainer = XDOM.getObject(bodyId),
      selectors = null,
      checkBoxValue = (value==="SLTALL");
  if(!bodyContainer){return;}
  selectors = bodyContainer.querySelectorAll("[data-rowselector='true'], [data-multiselect='true']");
  for ( var i = 0, l = selectors.length; i < l; i++) {
    if(checkBoxValue){
      Logical.check(selectors[i]);
    }else{
      Logical.uncheck(selectors[i]);
    }
  }
  MultiSelect.toggleAll(checkBoxValue);
  //do we have an auto sum field if so we have to auto submit
  if(SESSION.activePage.autoSumFields){
      Command.autoSum();
  }
};





NAV.Rowselector.clearAllLogicals = function() {
  var selectors = XDOM.queryAll("[data-rowselector='true'], [data-multiselect='true']");
  for ( var i = 0, l = selectors.length; i < l; i++) {
    Logical.uncheck(selectors[i]);
    
  }
   
};

NAV.Rowselector.handleClick = function(obj){
  var nr = getRecordNumber(obj);
  var value = Logical.getObjValue(obj);

  if(!NAV.Rowselector.lastRowCliked){
     NAV.Rowselector.lastRowCliked = nr;
     return;
  }
  if(!GLOBAL.eventObject.shiftKey){
    return;
  }

  if(nr<NAV.Rowselector.lastRowCliked){
    NAV.Rowselector.selectBetween(nr,NAV.Rowselector.lastRowCliked,value);
  }
  if(NAV.Rowselector.lastRowCliked<nr){
    NAV.Rowselector.selectBetween(NAV.Rowselector.lastRowCliked,nr,value);
  }
  NAV.Rowselector.lastRowCliked = null;
};

NAV.Rowselector.selectBetween = function(start, end, value) {
  var foSelector = null;
  for ( var i = start; i < end; i++) {
    foSelector = XDOM.queryScope("[data-multiselect='true'][data-record-number='" + i + "'],[data-rowselector='true'][data-record-number='" + i + "']");
    if (foSelector) {
      Logical.setObjValue(foSelector,value);
    }
  }
};