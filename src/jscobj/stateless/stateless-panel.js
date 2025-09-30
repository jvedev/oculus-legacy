/* global XDOM, BrowserDetect, Panel, Dragger, GLOBAL, SETTINGS, SESSION, ENUM, keyCode */
Stateless = {};

/**
 * paneel ten behoeve van verschillende stateless popups
 * @type type
 */
Stateless.panel = {};

/**
 *
 * @param {string} id
 * @returns {domObject} Stateless.panel;
 */
Stateless.panel.get = function(id){
  return XDOM.getObject('stateless-panel-' + id);
};

Stateless.panel.focus = function(id){
  var panel = Stateless.panel.get(id),
      query = "input:not([type='hidden']):not([data-hidden='true']):not([type='button']),textarea:not([data-hidden='true'])",
      obj = panel.querySelector(query);
  XDOM.focus(obj);
};




/**
 * toont paneel of renderd deze als deze er niet meer is
 * @param {static.response} res
 * @param {static class} partLogic
 * @returns {void}
 */
Stateless.panel.open = function(response,partLogic ){
  var panel  = Stateless.panel.get(response.calerId),
      calerObj = XDOM.getObject(response.calerId),
      parentObj = XDOM.getObject('stateless-panel-' + response.calerId + '-body');
      panelId = 'stateless-panel-' + response.calerId,
      panelObj = XDOM.getObject(panelId);


  if(panel){
    panel.setAttribute("data-hidden", "false");
  }else{//paneel nog niet eerder gerenderd
    parentObj = Stateless.panel.render(response);
  }

  if(response.type === ENUM.requestType.data){
    Stateless.Page.update(response);
  }else{
    Stateless.Page.new(parentObj,response,partLogic);
  }
  if(calerObj.dataset.screenMode=="*SUBVIEW"){
    return;
  }

  Stateless.panel.alignTo(panelObj,response.calerId);
  //update zIndex
  updatePanelSort(panelObj);

};

Stateless.panel.render = function(res){
  var calerObj = XDOM.getObject(res.calerId);
  if(calerObj.dataset.screenMode=="*SUBVIEW"){
     return Stateless.panel.renderSubview(res, calerObj);
  }

  return Stateless.panel.renderPopup(res);

};



Stateless.panel.renderSubview = function(res,parentObj){
  var panelId = 'stateless-panel-' + res.calerId,
      panelObj = XDOM.createElement('DIV',panelId,'stateless-subview-panel includeBackground'),
      header = XDOM.createElement('DIV', null,"panelHeader theme-background-color"),
      headerTitleIcon = null,
      headerTextDiv = XDOM.createElement('DIV',null,'panelTitle'),
      bodyDiv 	= XDOM.createElement('DIV', 'panel-body-' + res.calerId, "stateless-panel-wrapper" ),
      fieldsetObj = XDOM.getParentByTagName(parentObj, "fieldset"),
      panelIconGroup = fieldsetObj.getAttribute("data-fieldset-icon-group") || "fontAwesome",
      panelIconClass = fieldsetObj.getAttribute("data-fieldset-icon-class") || "";


  parentObj.style.width = "100%";
  parentObj.style.height = "100%";

  panelObj.setAttribute("data-stateless-panel-id",res.calerId);
  bodyDiv.id = panelId + "-body";
  headerTextDiv.setAttribute("data-stateless-panel-title", res.calerId);
  setSubviewNoMargin(fieldsetObj,"*SUBVIEW");

  if(panelIconClass && panelIconClass != ""){
     headerTitleIcon = XDOM.createElement('i',null,'panelHeaderIcon '+ getFontPrefix(panelIconGroup)+panelIconClass);
     header.appendChild(headerTitleIcon);
   }

  parentObj.appendChild(panelObj);
  panelObj.appendChild(header);
  header.appendChild(headerTextDiv);
  headerTextDiv.appendChild(Stateless.panel.getTitle(res));
   panelObj.appendChild(bodyDiv);
  return bodyDiv;
};
/**
 * renderd een popup panel t.b.v stateles onderdelen
 * data is een  json verzamelobject met de volgende properties:
 * id:     id van panel moet unique binnen een macro zijn
 * parent: id van parent object (als niet ingevuld is dit DTADIV)
 * width:  breedte in colommen
 * height: hoogte in regels
 * title: caption voor de titel in de header
 * alignTo: id van object tenopzichte waarvan p[aneel moet worden uitgeleind
 * @param {object} res
 * @returns {panel body dom object}
 */
Stateless.panel.renderPopup = function(res){
  var panelId = 'stateless-panel-' + res.calerId,
      calerObj = XDOM.getObject(res.calerId);
      panelObj = XDOM.createElement('DIV',panelId,'stateless-panel includeBackground'),
      header = XDOM.createElement('DIV', null,"panelHeader theme-background-color"),
      parentObj = XDOM.getObject('DTADIV'),
      headerTextDiv = XDOM.createElement('DIV',null,'panelTitle'),
	     closeIcon = XDOM.createElement('DIV',null,'popup-close pth-icon'),
      bodyDiv 	= XDOM.createElement('DIV', 'panel-body-' + res.calerId, "stateless-panel-wrapper" ),// cssclass
      title = '',
      headerTextNode = null,
      width = parseInt(res.data.panelDef.xSize) * SETTINGS.charWidth + 6 + 'px', //6px voor binnekant border
      height = parseInt(res.data.panelDef.ySize) * SETTINGS.lineHeight + 18  + 'px'; //3px voor de bovekant border

  closeIcon.setAttribute("data-click-action","Stateless.panel.closeClick");
  closeIcon.setAttribute("data-stateless-panel-id",res.calerId);
  panelObj.style.width = width;
  panelObj.style.height = height;
  panelObj.setAttribute("data-stateless-panel-id",res.calerId);
  panelObj.setAttribute("data-stateless-panel-modi",XDOM.getAttribute(calerObj, "data-open-options"));
  panelObj.setAttribute("data-update-dom-depth","true");
  panelObj.setAttribute("data-hidden","false");
  updatePanelSort(panelObj);

  bodyDiv.id = panelId + "-body";
	header.setAttribute("data-mouseDown-action", "Dragger.start");
	header.setAttribute("data-dragger-objId", panelId);
	headerTextDiv.setAttribute("data-mouseDown-action", "Dragger.start");
	headerTextDiv.setAttribute("data-dragger-objId", panelId);
	headerTextDiv.setAttribute("data-stateless-panel-title", res.calerId);

  parentObj.appendChild(panelObj);
  	panelObj.appendChild(header);
      header.appendChild(headerTextDiv);
      headerTextDiv.appendChild(Stateless.panel.getTitle(res));
      headerTextDiv.appendChild(closeIcon);
   panelObj.appendChild(bodyDiv);
   Stateless.panel.alignTo(panelId,res.calerId);
  return bodyDiv;
};


Stateless.panel.getTitle  = function(res){
  if(res.data.panelDef.titleOrigin==="*VAR"){
    title = res.data.headerData[res.data.panelDef.titleVariable] || '';
  }else{
    title = res.data.captionsDftLang[res.data.panelDef.titleVariable] || '';
  }
  return XDOM.createTextNode(title);
}

/**
 * positioneed paneel
 * @param {type} panelId id van het paneel
 * @param {type} alignToId id ten opzichte waarvan het paneel moet worden uitgelijd
 */
Stateless.panel.alignTo = function(panelId,alignToId){
  if(!panelId || !alignToId){return;}
  var panel = XDOM.getObject(panelId),
      alignToObj = XDOM.getObject(alignToId),
      position = alignTo(panel,alignToObj);
  panel.style.top = position.top + 'px';
  panel.style.left = position.left + 'px';
};

/**
 * past de oorspronkelijke titel van het paneel aan naar de nieuwe
 * @param {type} id
 * @param {type} title text voor in de title balk
 */
Stateless.panel.updateTitle = function(id, title){
  var headerText  = XDOM.query('[data-stateless-panel-title="' + id + '"');
  if(headerText){
    headerText.title = title;
  }
};

Stateless.panel.closeClick = function(){
  var id = XDOM.GLOBAL.getAttribute("data-stateless-panel-id");
  Stateless.panel.close(id);
};

/**
 * sluit paneel
 * @param {type} idIn
 * @returns {boolean} success
 */
Stateless.panel.close = function(idIn){
  Stateless.Page.setScope(); // het panel zit buiten de scope van de page

  var id               = idIn || XDOM.GLOBAL.getAttribute("data-stateless-page-id"),
      page             = Stateless.Page.get(id),
      panelId          = null,
      panelObj         = null,
      panelObjects     = XDOM.queryAll("[data-update-dom-depth='true']:not([data-hidden='true'])"),
      parentObject     = false;
      zIndexValue      = null,

      firstZIndexValue = 0,
      firstZIndexObj   = null,

      secondTopZIndexValue = 0,
      secondTopZIndexObj   = null;

  if(panelObjects){
    if(panelObjects.length <= 0){
     //no panels found
     return false;
    }
  }else{
    //no panels found
    return false;
  }


  for(var i=0,l=panelObjects.length;i<l;i++){

   panelObj = panelObjects[i];
   if(panelObj){


    if(parentObject = XDOM.getParentByAttribute(panelObj, "data-screen-mode")){
     if(parentObject.getAttribute("data-screen-mode") == GUI.BasePanel.screenMode.subview){
     //return false;
     continue;
     }
    }

     zIndexValue = panelObj.style.zIndex;

     if(parseInt(zIndexValue) > parseInt(firstZIndexValue)){

      secondTopZIndexValue  = firstZIndexValue;
      secondTopZIndexObj    = firstZIndexObj;

      firstZIndexObj    = panelObj;
      firstZIndexValue  = zIndexValue;

     }else if(zIndexValue > secondTopZIndexValue){
      secondTopZIndexValue  = zIndexValue;
      secondTopZIndexObj    = panelObj;
     }
   }
  }

  if(firstZIndexObj){
    //page.closeHandler();
    firstZIndexObj.setAttribute("data-forced", "true");
    firstZIndexObj.setAttribute("data-hidden", "true");

   if(secondTopZIndexObj){
    updatePanelSort(secondTopZIndexObj);
   }

   return true;
  }

 return false;
};


Stateless.panel.handleKeyDown = function(){
  var page = Stateless.Page.get();
  if(!page){return false;}
  if(GLOBAL.charCode === keyCode.escape || GLOBAL.charCode === keyCode.F12) {
     return Stateless.panel.close(page.id);
  }
  return false;

};



/**
 * event ten behoeve van het verslepen van een panel
 * @param {type} e
 * @param {type} id
 * @returns {undefined}
 */
Stateless.panel.startDragging = function(e, id){
  if(BrowserDetect.isIE || BrowserDetect.isSafari){return;}
	var foEvent = XDOM.getEvent(e);

	if(foEvent.srcElement.id==="MEXIT"){return;}
	var foInstance = Panel.instances[id];
	Dragger.guiObject = foInstance;
	Dragger.domObject = foInstance.domObject;
	GLOBAL.mouseKeyDown = true;
	Dragger.start(e);
};

Stateless.panel.closeAll = function(){
  let closeObjects = XDOM.queryAll('[data-click-action="Stateless.panel.closeClick"]');
  for(let i = 0, l = closeObjects.length;i<l;i++ ){
    XDOM.invokeClick(closeObjects[i]);
  }
  return(closeObjects.length > 0);
};
