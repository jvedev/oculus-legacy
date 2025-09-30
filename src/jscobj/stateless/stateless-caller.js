/**
 *  aan sfl body data-subfile-clickable="*MULTISELECT" toevoegen
 *  aan de logical buton: data-click-action="ignore"
 *
 */


/* global Stateless, SESSION, GLOBAL, ENUM, Logical, XDOM, state */
/*
 * SESSION.activeData.headerAttributes (data.header)
 *
 */
Stateless.caller={};

/**
 * wordt aangeroepen bij het openen van de onderliggende macro page.updateDom
 * @returns {void}
 */
Stateless.caller.updateDom = function(){};
Stateless.caller.onReturnOk = function(){
  XDOM.setObjectValue(this.toId,this.data.headerData['WS_CD1_RTN'].trim());
  Stateless.panel.close(this.id);
  return true;
};


/**
 * wordt aangeroepen door de klick op een icoon
 * @param {type} obj obj kan leeg zijn of het dom object van het icoontje zijn
 * @returns {void}
 */
Stateless.caller.open = function(obj){
  var callerObject = obj || GLOBAL.eventSourceElement;
  var id = callerObject.id ,
      page = Stateless.Page.get(id),
      panel = Stateless.panel.get(id);
  //voor testen 
XDOM.setObjectValue('LEGEND_ENT','292994') ; 
  if(panel){ // al eerder aangeroepen geweest
    if(panel.style.display===''){
      //paneel is nog zichtbaar dus niets doen
      return;
    }
    Stateless.request.get(
     {callerObject:GLOBAL.eventSourceElement,
      onResponse:Stateless.caller.onResponse,
      page:page});
    return;
  }
  Stateless.request.get(
              {callerObject:GLOBAL.eventSourceElement,
               onResponse:Stateless.caller.onResponse,
               type:ENUM.requestType.all});
};

Stateless.caller.Focus = function(id){
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

Stateless.caller.onReturn = function(){};

Stateless.caller.onResponse = function(response){
  Stateless.panel.open(response, Stateless.caller);
  Stateless.caller.Focus(response.calerId);
};

/**
 * deze functie wordt als referentie aan een page object gehangen
 * darom verweist this naar een instantie van het stateles page object
 */
Stateless.caller.accept = function(){
  if(this.inputIsChanged || XDOM.GLOBAL.fieldIsChanged()){
    this.submit('ENTER'); //submit pagina want creteria zijn veranderd
    return;
  }else{
    //er zijn geen creteria veranderd
    //zet de selectie terug en sluit het scherm
    this.submit('ACCEPT');
  }

  Stateless.caller.setButtonValues(this.id);
};

/**
 * deze functie wordt als referentie aan een page object gehangen
 * darom verweist this naar een instantie van het stateles page object
 */
Stateless.caller.reset = function(){
  this.submit('RESET');
};
/**
 * deze functie wordt als referentie aan een page object gehangen
 * darom verweist this naar een instantie van het stateles page object
 */
Stateless.caller.submit = function(){
  new Stateless.request(  {callerObject:XDOM.getObject(this.id),
                           type:ENUM.requestType.data,
                           onResponse:Stateless.caller.onResponse});
};

Stateless.caller.handleOnClick = function(body){
  var checkBox = body.querySelector("[data-datatype='*LGL']"),
      pageId = body.getAttribute("data-stateless-page-id"),
      page = Stateless.Page.get(pageId);
  Stateless.Page.setScope(page);
  Logical.toggle(checkBox);
  Stateless.caller.onChange(page);
  Stateless.Page.setScope();
};


Stateless.caller.prepareDom = function(){

};

Stateless.caller.onChange = function(page){
  
};

Stateless.caller.update = function(page){
  
};


