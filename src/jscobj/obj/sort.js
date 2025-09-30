/* global Stateless, XDOM, Command, SESSION, GLOBAL */

function SortButton(){}
/**
 * static onclick handler voor sort buttons
 */
SortButton.handleOnClick = function(){
  Stateless.Page.set(GLOBAL.eventSourceElement);
  var page =  Stateless.Page.get();
  var currentFilter = XDOM.queryScope("[data-sort-active='true']");
  var oldField = '';
  var oldSequence = '';
  var sortField =  XDOM.GLOBAL.getAttribute("data-sort-field-name");
  var sequence =  XDOM.GLOBAL.getAttribute("data-sort-sequence");
  var caseSensitve =  '';
  
  if(XDOM.GLOBAL.getAttribute("data-sort-case-sensitve")==="*NOCASE"){
    caseSensitve = 'T';
  };
  
  if(currentFilter){
    currentFilter.setAttribute("data-sort-active","false");
    oldField = currentFilter.getAttribute("data-sort-field-name");
    oldSequence = currentFilter.getAttribute("data-sort-sequence");
    if(oldField===sortField && oldSequence===sequence){
      sortField = '';
      sequence = '';
      caseSensitve = '';
    }
  }
  if(page){
    page.setAdditionValue('WS_SRT', sortField.replace(page.prefix,''));
    page.setAdditionValue('WS_SEQ', sequence);
    page.setAdditionValue('WS_TRN', caseSensitve);
    
    page.submit('ENTER');
  }else{
    XDOM.createInputField('WS_SRT', sortField);
    XDOM.createInputField('WS_SEQ', sequence);
    XDOM.createInputField('WS_TRN', caseSensitve);
    Command.enter();
  }
  Stateless.Page.set();
  return;
};
/**
 * zet alle sorteer knoppen die geactiveerd zijn op niet geactiveerd
 * @returns {undefined}
 */
SortButton.deActivate = function(){
  var objects = XDOM.queryAll("[data-sort-active='true']");
  for(var i =0,l=objects.length;i<l;i++){
    objects[i].setAttribute("data-sort-active","false");
  }
};



/**
 * Toevoegen kolomsorterings knoppen
 * @param {string} prefix prefix alleen ingevuld in vanuit stateles pages
 */
SortButton.update = function(prefix) {
  
  if(!SESSION.activeData.headerData){
    return;
  }

  var sortField = SESSION.activeData.headerData['WS_SRT'] ;
  var sequence = SESSION.activeData.headerData['WS_SEQ']; // 'A' of 'D'
  SortButton.deActivate();

  if(!sortField){return;}
  if(prefix){
    sortField = prefix + sortField;
  }
  var sortButton = XDOM.query("[data-sort-field-name='" + sortField + "'][data-sort-sequence='" +sequence + "']"  );

  if(sortButton){
    sortButton.setAttribute("data-sort-active","true");
  }
  return;
};

/**
 * bereid de knoppen voor en zet het title attribute.
 * @returns {undefined}
 */
SortButton.prepareDom = function(){
  var objects = XDOM.queryAll("[data-sort-sequence='D']");
  var sortCount = XDOM.queryAll("[data-sort-sequence]");
 
  for(var i = 0,l=objects.length;i<l;i++){
    objects[i].title=getCapt('cSRTDSC_TTL');
  }
  
  objects = XDOM.queryAll("[data-sort-sequence='A']");
  
  for(var i = 0,l=objects.length;i<l;i++){
    objects[i].title=getCapt('cSRTASC_TTL');
  }
  
  if(sortCount.length > 0){
  	XDOM.createInputField('WS_SRT', '');
  	XDOM.createInputField('WS_SEQ', '');
  	XDOM.createInputField('WS_TRN', '');
  }
  return;
};