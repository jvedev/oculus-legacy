/* global XDOM, BrowserDetect, Panel, Dragger, GLOBAL, SETTINGS, SESSION, ENUM, keyCode, PdfViewer */
const popupPanel = {};

(function () {
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

  let panelId = '';


 function render (obj){
    const
      ds = obj.dataset || obj,
      id = obj.id || ds.id,
      title = ds.directTitle || '';

    panelId = 'popup-panel-' + id;

    const
        panelObj = XDOM.createElement('DIV',panelId,'stateless-panel includeBackground'),
        header = XDOM.createElement('DIV', null,"panelHeader theme-background-color"),
        parentObj = XDOM.getObject('DTADIV'),
        headerTextDiv = XDOM.createElement('DIV', null, "panelTitle"),
        closeIcon = XDOM.createElement('DIV',null,'popup-close pth-icon'),
        bodyDiv 	= XDOM.createElement('DIV', 'panel-body-' + id, "stateless-panel-wrapper" ),// cssclass
        titleText = title || Captions.getTitle(ds.titleOrigin, ds.popupTitle , title, getClientRecordNr(obj) ),
        titleNode =  XDOM.createTextNode(titleText),
        headerTextNode = null,
        width = parseInt(ds.cols) * SETTINGS.charWidth+ 'px', //6px voor binnekant border
        height = parseInt(ds.rows) * SETTINGS.lineHeight + 18  + 'px'; //3px voor de bovekant border

    if(ds.resizable){
      panelObj.dataset.isResizable = "true";
    }

    headerTextDiv.setAttribute("data-click-action","popupPanel.handleHeaderClick");
    header.setAttribute("data-click-action","popupPanel.handleHeaderClick");
    closeIcon.setAttribute("data-click-action","popupPanel.close");
    closeIcon.setAttribute("data-popup-panel-id",id);
    panelObj.style.width = width;
    panelObj.style.height = height;
    panelObj.setAttribute("data-popup-panel-id",id);
    panelObj.setAttribute("data-popup-type","panel");
    panelObj.setAttribute("data-update-dom-depth","true");
    panelObj.setAttribute("data-dockable", ds.dockable);
    updatePanelSort(panelObj);
    bodyDiv.id = panelId + "-body";

    setDragable(header);
    setDragable(headerTextDiv);
    setDragable(closeIcon);

    headerTextDiv.setAttribute("popup-panel-title", id);
    
    parentObj.appendChild(panelObj);
    panelObj.appendChild(header);
      header.appendChild(headerTextDiv);
      headerTextDiv.appendChild(titleNode);
      headerTextDiv.appendChild(closeIcon);
    panelObj.appendChild(bodyDiv);
    Stateless.panel.alignTo(panelId,id);
    return bodyDiv;
  };

  function setDragable(obj){
  //  if(!BrowserDetect.isChrome){return;}
    obj.draggable = true;
    obj.addEventListener("dragstart", drag.start);
    obj.dataset.dragtype = "panel";
    obj.dataset.dragObject = panelId;
    obj.dataset.allowDrop = "panel";
    obj.dataset.allowDropOn = "*ALL";
  }


  function open(obj){
     const callerObject = XDOM.getObject(obj) || GLOBAL.eventSourceElement;
     const placeHolder = render(callerObject);
     return placeHolder;
  }

  function close(panelId){
    drag.cleanup();
    docker.clear();
    let id = panelId,
        panel = XDOM.query('[data-show-on-top][data-popup-type]', SESSION.activeForm);

    if(!id && GLOBAL.eventSourceElement){
      GLOBAL.eventSourceElement.dataset.popupPanelId;
    }

    if(id){
      panel =  XDOM.query("[data-popup-type][data-popup-panel-id='" + id + "']");
    }


    if(panel){
      XDOM.removeDOMObject(panel);
      updatePanelSort();
      return true;
    }
    return false;
  }


  function handleHeaderClick(){
    let obj = XDOM.getParentByAttribute(GLOBAL.eventSourceElement,'data-update-dom-depth');
    updatePanelSort(obj);
  }
    
  this.handleHeaderClick = handleHeaderClick;
  this.open = open;
  this.close = close;
}).apply(popupPanel);









