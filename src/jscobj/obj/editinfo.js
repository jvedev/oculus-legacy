/* global Stateless, SESSION, GLOBAL, ENUM, Logical, XDOM, state, GUI */
/*
 * SESSION.activeData.headerAttributes (data.header)
 *
 */
var EditInfo={pageType:"EditInfo"};


/**
 * wordt aangeroepen bij het openen van de onderliggende macro page.updateDom
 * @returns {void}
 */
EditInfo.close = function(){
  XDOM.focus(this.toId);
};


/**
 * @release
 *
 * @returns {Boolean} abbort
 */

EditInfo.onReturnOk = function(){
  Stateless.panel.close(this.id);
  return true;
};


/**
 * wordt aangeroepen door de klick op een icoon
 * @param {type} obj obj kan leeg zijn of het dom object van het icoontje zijn
 * @returns {void}
 */
EditInfo.open = function(obj){
  var callerObject = obj || GLOBAL.eventSourceElement;
  var id = callerObject.id ,
      page = Stateless.Page.get(id),
      panel = Stateless.panel.get(id);

  if(panel){ // al eerder aangeroepen geweest

    if(callerObject.dataset.screenMode!=="*SUBVIEW"  && !XDOM.getBooleanAttribute(panel,"data-hidden")){
      //paneel is nog zichtbaar dus niets doen
      return;
    }
    Stateless.request.get(
     {callerObject:callerObject,
      onResponse:EditInfo.onResponse,
      page:page});
    return;
  }
  Stateless.request.get(
              {callerObject:callerObject,
               onResponse:EditInfo.onResponse,
               type:ENUM.requestType.all});
};

EditInfo.Focus = function(id){
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

EditInfo.onReturn = function(){};

EditInfo.onResponse = function(response){
   Stateless.panel.open(response, EditInfo);
};

/**
 * deze functie wordt als referentie aan een page object gehangen
 * daarom verweist this naar een instantie van het stateles page object
 */
EditInfo.accept = function(){
  if(this.inputIsChanged || XDOM.GLOBAL.fieldIsChanged()){
    this.submit('ENTER'); //submit pagina want creteria zijn veranderd
    return;
  }else{
    //er zijn geen creteria veranderd
    //zet de selectie terug en sluit het scherm
    this.submit('ACCEPT');
  }
};

/**
 * deze functie wordt als referentie aan een page object gehangen
 * darom verweist this naar een instantie van het stateles page object
 */
EditInfo.reset = function(){
  this.submit('RESET');
};
/**
 * deze functie wordt als referentie aan een page object gehangen
 * darom verweist this naar een instantie van het stateles page object
 */
EditInfo.submit = function(){
  new Stateless.request(  {callerObject:XDOM.getObject(this.id),
                           type:ENUM.requestType.data,
                           onResponse:EditInfo.onResponse});
};


EditInfo.updateDom = function(){
   var subviewParts = XDOM.queryAll('[data-stateless-type="*EDIT"][data-screen-mode="*SUBVIEW"],[data-stateless-type="*INFO"][data-screen-mode="*SUBVIEW"]'),
        part = null;
  for(var i = 0, l=subviewParts.length; i<l; i++) {
    part = subviewParts[i];
    EditInfo.open(part);
  }
};





