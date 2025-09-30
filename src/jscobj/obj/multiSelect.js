/**
 *  aan sfl body data-subfile-clickable="*MULTISELECT" toevoegen
 *  aan de logical buton: data-click-action="ignore"
 *
 */


/* global Stateless, SESSION, GLOBAL, ENUM, Logical, XDOM, state, GUI */
/*
 * SESSION.activeData.headerAttributes (data.header)
 *
 */
var MultiSelect={pageType:"MultiSelect"};


/**
 * wordt aangeroepen bij het openen van de onderliggende macro page.updateDom
 * @returns {void}
 */
MultiSelect.updateDom = function(){
  var multiSelectObjects = null,
      multiSelectCounterField = null,
      multiSelectCounterValue = "",
      buttonHoverTitle        = "";

  multiSelectObjects = XDOM.queryAllScope("div[data-select-counter-id]");


  if(!multiSelectObjects){
   return;
  }

  for(let i=0,l=multiSelectObjects.length;i<l;i++){
   multiSelectCounterField = multiSelectObjects[i].dataset["selectCounterId"];

   if(multiSelectCounterField){
     multiSelectCounterValue = SESSION.activeData.headerData[multiSelectCounterField] || '0';
   }

   MultiSelect.updateButtonValues(multiSelectObjects[i].id, multiSelectCounterValue);
  };

  return;
};

MultiSelect.setButtonValues = function(objId){

  var objectId = null,
      objCounter = null,
      countValue = "0",
      buttonObject = null,
      buttonHoverTitle = "",

  objectId = objId;
  objCounter = XDOM.query(".logicalCounter[data-stateless-page-id='"+ objId + "']");

  if(!objectId || !objCounter){ return; }

  countValue = XDOM.getObjectValue(objCounter);

  buttonObject = XDOM.getObject(objectId);

  if(!buttonObject){ return; }

  MultiSelect.updateButtonValues(buttonObject, countValue);
};

MultiSelect.updateButtonValues = function(objId, objVal){
  var objectId = null,
      countValue = null,
      buttonObject = null,
      buttonHoverTitle = "",

  objectId = objId;
  countValue = objVal;

  if(!objectId || countValue === null){ return; }

  buttonObject = XDOM.getObject(objectId);
  if(!buttonObject){ return; }

  buttonHoverTitle = getCapt('cPMTMLTSLT_TTL1')+" "+countValue;

  //add hover title to multiselectbutton
  GUI.infoTitle.register(buttonObject, buttonHoverTitle);
  buttonObject.setAttribute("data-multiSelect-selected", countValue);
  return;
};



MultiSelect.close = function(){
  XDOM.focus(this.toId);
};


/**
 * @release
 *
 * @returns {Boolean} abbort
 */
MultiSelect.onReturnOk = function(){
  XDOM.setObjectValue(this.toId,this.data.headerData['WS_CD1_RTN'].trim());
  Stateless.panel.close(this.id);
  if (isAutoSubmitField(XDOM.getObject(this.toId))) {
    Command.execute('ENTER', true);
  }
  return true;
};


/**
 * wordt aangeroepen door de klick op een icoon
 * @param {type} obj obj kan leeg zijn of het dom object van het icoontje zijn
 * @returns {void}
 */
MultiSelect.open = function(obj){
  var callerObject = obj || GLOBAL.eventSourceElement;
  var id = callerObject.id ,
      page = Stateless.Page.get(id),
      panel = Stateless.panel.get(id);

  if(panel){ // al eerder aangeroepen geweest
    if(!XDOM.getBooleanAttribute(panel,"data-hidden")){
    //if(panel.style.display===''){
      //paneel is nog zichtbaar dus niets doen
      return;
    }
    Stateless.request.get(
     {callerObject:GLOBAL.eventSourceElement,
      onResponse:MultiSelect.onResponse,
      page:page});
    return;
  }
  Stateless.request.get(
              {callerObject:GLOBAL.eventSourceElement,
               onResponse:MultiSelect.onResponse,
               type:ENUM.requestType.all});
};

MultiSelect.Focus = function(id){
  var panel = Stateless.panel.get(id),
      obj = panel.querySelector('[data-record-number="1"][type="button"]');
  if(obj){ //eerste regel
    XDOM.focus(obj);
    return;
  }
  //nog geen regels
  //focus op het panel
  Stateless.panel.focus(id);
};

MultiSelect.onReturn = function(){};

MultiSelect.onResponse = function(response){
  Stateless.panel.open(response, MultiSelect);
  MultiSelect.Focus(response.calerId);
};

/**
 * deze functie wordt als referentie aan een page object gehangen
 * darom verweist this naar een instantie van het stateles page object
 */
MultiSelect.accept = function(){
  if(this.inputIsChanged || XDOM.GLOBAL.fieldIsChanged()){
    this.submit('ENTER'); //submit pagina want creteria zijn veranderd
    return;
  }else{
    //er zijn geen creteria veranderd
    //zet de selectie terug en sluit het scherm
    this.submit('ACCEPT');
  }

  MultiSelect.setButtonValues(this.id);
};

/**
 * deze functie wordt als referentie aan een page object gehangen
 * darom verweist this naar een instantie van het stateles page object
 */
MultiSelect.reset = function(){
  this.submit('RESET');
};
/**
 * deze functie wordt als referentie aan een page object gehangen
 * darom verweist this naar een instantie van het stateles page object
 */
MultiSelect.submit = function(){
  new Stateless.request(  {callerObject:XDOM.getObject(this.id),
                           type:ENUM.requestType.data,
                           onResponse:MultiSelect.onResponse});
};

MultiSelect.handleOnClick = function(body){
  var checkBox = body.querySelector("[data-datatype='*LGL']"),
      pageId = body.getAttribute("data-stateless-page-id"),
      page = Stateless.Page.get(pageId);
  Stateless.Page.setScope(page);
  Logical.toggle(checkBox);
  MultiSelect.onChange(page);
  Stateless.Page.setScope();
};


MultiSelect.prepareDom = function(){
  var tbody = XDOM.query('[data-subfile-clickable="*MULTISELECT"]'),
      checkbox = null,
      selectWrapper  = XDOM.query('.clearSelectWrapper'),
      clearSelection  = XDOM.query('.clearSelection');
  if(clearSelection){
    clearSelection.setAttribute("data-hidden","true"); //wordt onterecht als true meegegeven
  }
  if(selectWrapper){
    selectWrapper.setAttribute("data-hidden","false"); //wordt onterecht als true meegegeven
  }
  if(tbody){
    checkbox = tbody.querySelector("[data-datatype='*LGL']");
    checkbox.setAttribute("data-multiselect", "true");
  }
};


//MultiSelect.getSelection = function(id){
//  var selectedArray = [],
//      parent = XDOM.getObject(id + "-SFLTBL"),
//      checkBox = null,
//      keyInput = null,
//      keyValue = '',
//      checkBoxes = parent.querySelectorAll('[value="SLT"]');
//
//  for(var i=0,l=checkBoxes.length;i<l;i++){
//    checkBox = checkBoxes[i];
//    keyInput = checkBox.parentNode.querySelector("[type='hidden']:not([data-datatype='*LGL']");
//    keyValue = XDOM.getObjectValue(keyInput);
//    selectedArray.push(keyValue);
//  }
//  return selectedArray;
//};



MultiSelect.onChange = function(page){
  if(!page || page.type !=="MultiSelect"){
    return false;
  }
  var tbody = XDOM.getParentByTagName(GLOBAL.eventSourceElement,'TBODY');
  if(!tbody){return;}

  var recordNr = parseInt(tbody.getAttribute("data-record-number")) -1,
      selector = tbody.querySelector("input[data-datatype='*LGL']"),
     // initialValue = page.data.subfileData[recordNr]["SF_SLT_INZ"],
      currentValue = XDOM.getObjectValue(selector);

  page.data.subfileData[recordNr]["SF_SLT"] = currentValue;
 // MultiSelect.markChanged(tbody,initialValue);
  MultiSelect.updateCounter(page);
  return true;
};

MultiSelect.update = function(page){
  if(page.type=='MultiSelect'){
    MultiSelect.updateCounter(page);
  }
};

MultiSelect.updateCounter = function(page){
  var counter = XDOM.query(".logicalCounter[data-stateless-page-id='"+ page.id + "']"),
      nr =0,
      data = [];
  if(page.data.removedSubfileData){
    data = page.data.subfileData.concat(page.data.removedSubfileData);
  }else{
    data = page.data.subfileData;
  }


  for(var i =0,l=data.length;i<l;i++ ){
    if(data[i]["SF_SLT"]==="1"){
      nr++;
    }
  }
  XDOM.setObjectValue(counter,nr);
};

MultiSelect.markChanged = function(tbody,initialValue){
//  if(SESSION.activeData.macroProperties.macroType !=="*MLTSLT"){
//    return;
//  }
//  var selector = tbody.querySelector("input[data-datatype='*LGL']"),
//  currentValue = XDOM.getObjectValue(selector);
//  tbody.setAttribute("data-selector-changed", (currentValue !==initialValue ));
//
};


MultiSelect.toggleAll = function(selected){
  var page = Stateless.Page.get();
  if(!page ||  page.type !=="MultiSelect" ){
   return;
  }

  var data = page.data.subfileData;
      //sfl = XDOM.getObject(page.subfile.sflObject.id);
     // tbodys = sfl.getElementsByTagName("TBODY");


  for(var i=0,l=data.length;i<l;i++){
    if(selected){
      data[i]['SF_SLT'] = '1';
    }else{
      data[i]['SF_SLT'] = '0';
    }
//    if(tbodys[i]){
//      MultiSelect.markChanged(tbodys[i], data[i]["SF_SLT_INZ"]);
//    }
  }
  MultiSelect.updateCounter(page);
};

