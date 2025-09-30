GUI.InfoWindow = function(obj) {
  GUI.InfoWindow.baseConstructor.call(this);
  this.id = obj.getAttribute('data-info-id');
  this.iconId = obj.id;
  this.recordNumber = obj.getAttribute('data-record-number');
  this.screenMode = obj.getAttribute('data-screen-mode');
  this.triggerFields = obj.getAttribute('data-trigger-fields') + ' ' + obj.getAttribute('data-trigger-macros');
  this.environmentConditions  = obj.dataset.environmentConditions;
  this.requestFieldsArray = eval(obj.getAttribute('data-parm-object'));
  this.requestPrefix = obj.getAttribute('data-parm-prefix') || '';
  this.sourceLocation = obj.getAttribute('data-macro-location');
  this.macroName = obj.getAttribute('data-macro-name');
  this.fieldProgressionPartId = null;
  this.cssClass = 'info-panel popup-panel';
  this.openDelay = 300; // miliseconde waarna een infowindow opent door een hover op een input;
  this.closeDelay = 500; // miliseconde waarna een infowindow opent door een hover op een input;
  this.applyToRow = '*ALL';
  this.baseRequest = '';
  this.objectCount = '';
  this.dataOnly = false;
  this.eventsRegistered = false;
  this.timer = null;
  this.closeTimer = null;
  this.hovering = false;
  //this.openByHover = false;
  //this.requiredReturnFields = null;
  this.requiredOutputFields = '';
  this.requiredOutputBooleans = '';
  this.inSubfile = false;
  this.cellAxis = null;
  this.indicatorAxis = null;
  this.authorizationFields = null;
  this.condHiddenLines = [];

  this.panelBackgroundColor = '';
  this.panelIconGroup = 'fontAwesome';
  this.panelIconClass = '';

  this.panelId = 'p-' + this.iconId;

  //dubbele aanpassing waardoor infowindows niet meer worden gesloten.
  //if(this.recordNumber){
  //this.panelId += '-' + this.recordNumber;
  //}

  // if(GUI.BasePanel.instances[this.panelId]){
  // 	this.panelId = this.panelId+'_'+Object.keys(GUI.BasePanel.instances).length.toString();
  // }

  // obj.setAttribute('data-panel-id', this.panelId);
  //obj.setAttribute('data-panel-id-in-use', this.panelId);

  this.cacheKey = this.macroName + '-' + this.sourceLocation; // alle info windows met de zelfde macroName en sourceLocation
  // hebben de zelfde layout en hoeven daarom maar 1 keer gerenderd
  // worden
  if (this.triggerFields) {
    this.triggerFields = this.triggerFields.split(' ');
  } else {
    this.triggerFields = [];
  }
  GUI.BasePanel.instances[this.panelId] = this;
};

XDOM.extendObject(GUI.InfoWindow, GUI.BasePanel);
GUI.InfoWindow.renderCache = {};
GUI.InfoWindow.configCache = {};

GUI.InfoWindow.getWindow = function(obj) {
  var infoWindow = XDOM.getEditWindow('p-' + obj.id);
  if (infoWindow) {
    return infoWindow;
  }
  return new GUI.InfoWindow(obj);
};

GUI.InfoWindow.prototype.init = function() {
  let promise
  this.renderIcon();
  this.registerTrigger();
  if (this.screenMode === GUI.BasePanel.screenMode.subview) {
    promise = this.iniEmbed();
  } else {
    if (this.inSubfile) {
      this.registerSFLEvents();
    } else {
      this.registerEvents();
    }
  }
  GUI.BasePanel.instances[this.panelId] = this;
  return promise;
};

GUI.InfoWindow.prototype.registerTrigger = function() {
  var foThis = this;
  for (var i = 0, l = this.triggerFields.length; i < l; i++) {
    var invoker = this.triggerFields[i]; //var binnen scope in verband met doorgeven by value niet byref(pointer)
    const desc =   `edit or info window: ${this.macroName} is triggered by field change`;
    Trigger.register(invoker, 'panel' + this.id, 'GUI.InfoWindow.openByTrigger' + this.id, function() {
      GUI.InfoWindow.openByTrigger(foThis);
    }, desc);
  }
};

/**
 * sluit eventueel open quicksearch scherm en opent quickSearch
 * @param {type} FoInfoWindow
 * @returns {undefined}
 */
GUI.InfoWindow.openByTrigger = function(FoInfoWindow) {
  FoInfoWindow.request();
};
GUI.InfoWindow.prototype.checkRendered = function(){
  const body  = XDOM.getObject(this.iconId).parentNode.querySelector('.panelBody');
  if(body) { //excluding the meta div
    return;
  }
  if(this.dom.domObject){
    this.dom.domObject.remove();
    this.dom.domObject = null;
  }
  this.isInitialised = false;

}

GUI.InfoWindow.prototype.iniEmbed = function() {
  this.checkRendered();
  if (this.isInitialised) {
    this.dataOnly = true;
    return this.request();

  }

  this.clearCache();
  this.isVisible = false;
  if (!this.dom.icon) {
    this.cssClass = 'info-panel';
  }

  return this.request();
};

GUI.InfoWindow.prototype.clearCache = function() {
  GUI.InfoWindow.configCache[this.cacheKey] = null;
  GUI.InfoWindow.renderCache[this.cacheKey] = null;
  this.isInitialised = false;
  this.dataOnly = false;
};

GUI.InfoWindow.prototype.renderIcon = function(recordNumber) {
  var foObj = null,
    foIcon = null;
  var foTd = XDOM.getAxis(this.cellAxis, recordNumber);
  if (
    !foTd ||
    !(this.applyToRow === '*ALL' || isIn(recordNumber, this.applyToRow)) ||
    this.screenMode === GUI.BasePanel.screenMode.subview
  ) {
    return;
  }

  foIcon = XDOM.createElement('DIV', null, 'infoProgram');
  foTd.appendChild(foIcon);

  foIcon.setAttribute('data-panel-id', this.panelId);
  foIcon.setAttribute('data-record-number', recordNumber);
  foIcon.setAttribute('data-click-action', 'GUI.InfoWindow.handleClick');
  foIcon.setAttribute('data-mouseover-action', 'GUI.InfoWindow.handleMouseOver');
  foIcon.setAttribute('data-mouseout-action', 'GUI.InfoWindow.handleMouseOut');

  for (var a in foTd.childNodes) {
    foObj = foTd.childNodes[a];
    if (foObj.id) {
      XDOM.setAttribute(foObj, 'data-panel-id', this.panelId);
      XDOM.setAttribute(foObj, 'data-record-number', recordNumber);
      foObj.setAttribute('data-mouseover-action', 'GUI.InfoWindow.handleMouseOver');
      foObj.setAttribute('data-mouseout-action', 'GUI.InfoWindow.handleMouseOut');
    }
  }
};

GUI.InfoWindow.handleClick = function(e) {
  XDOM.cancelEvent(e);
  var recordNr = XDOM.GLOBAL.getAttribute('data-record-number');
  var foPanel = GUI.InfoWindow.getWindow(GLOBAL.eventSourceElement);
  GLOBAL.eventSourceElement.dataset.openByClick = true;
  // 3 times the king!
  if (foPanel?.dom?.domObject?.getAttribute('data-hidden')!='true') {
    return;
  }

  foPanel.close();
  foPanel.recordNumber = recordNr;
  foPanel.dom.icon = GLOBAL.eventSourceElement;

  foPanel.open();
  return false;
};

GUI.InfoWindow.handleMouseOver = function(e) {
  XDOM.getEvent(e);
  var foPanel = GUI.InfoWindow.getWindow(GLOBAL.eventSourceElement);
  foPanel.close();
  foPanel.dom.icon = GLOBAL.eventSourceElement;
  foPanel.handleMouseOver();
};

GUI.InfoWindow.handleMouseOut = function(e) {
  XDOM.getEvent(e);

  let foPanel = GUI.BasePanel.instances['p-' + GLOBAL.eventSourceElement.id];
  //var foPanel = GUI.InfoWindow.getWindow(GLOBAL.eventSourceElement);
  if (foPanel) {
    foPanel.handleMouseOut();
  }
};

GUI.InfoWindow.handlePanelClick = function() {
  let id = XDOM.GLOBAL.getAttribute('data-eventarg-id');
  let icon = XDOM.getObject(GUI.BasePanel.instances[id].iconId);
  icon.dataset.openByClick = true;

  //GUI.BasePanel.instances[id].openByHover = false;
};

GUI.InfoWindow.prototype.handleMouseOut = function() {
  this.hovering = false;
  let icon = XDOM.getObject(this.iconId);
  if (icon.dataset.openByClick == 'true') {
    return;
  }
  var fsCommand = "GUI.InfoWindow.closeDelayed('" + this.panelId + "')";
  this.closeTimer = setTimeout(fsCommand, this.closeDelay);
  this.cancelDelayedOpen();
};

GUI.InfoWindow.prototype.handleMouseOver = function() {
  var fsCommand = "GUI.InfoWindow.openDelayed('" + this.panelId + "')";
  this.hovering = true;
  GUI.BasePanel.instances[this.panelId] = this;
  this.timer = setTimeout(fsCommand, this.openDelay);
};

GUI.InfoWindow.closeDelayed = function(id) {
  let instance = GUI.BasePanel.instances[id];
  let icon = XDOM.getObject(instance.iconId);
  if (icon.dataset.openByClick != 'true') {
    instance.close('false');
  }
};

GUI.InfoWindow.openDelayed = function(id) {
  if (this.isVisible) {
    return;
  } // -->
  var instance = GUI.BasePanel.instances[id];
  if (instance.hovering) {
    //instance.openByHover = true;
    instance.request();
  }
};

GUI.InfoWindow.prototype.cancelDelayedOpen = function() {
  clearTimeout(this.timer);
  this.timer = null;
};



GUI.InfoWindow.prototype.open = function() {
  //this.openByHover = false;
  let icon = XDOM.getObject(this.iconId);
  icon.dataset.openByClick = 'true';

  if (this.isVisible) {
    return;
  } // -->
  this.cancelDelayedOpen();
  this.request();
};


/**
 * verkrijgt data
 * voor stateless pannels en statefull pannels is dit SESSION.activeData
 * maar voor aanroepen vanuit edit en info window gaat dit via de panel.data Gui
 */
GUI.InfoWindow.prototype.getPanelData = function() {
  let panelId = XDOM.getAttribute(this.iconId, 'data-panel-id'),
    panel = XDOM.getEditWindow(panelId);

  if (panel && panel.data) {
    return { headerData: panel.data };
  }
  return SESSION.activeData;
};

GUI.InfoWindow.prototype.buildParameterString = function() {
  var foField = null;
  var fsValue = '';
  var fsLocation = null;
  var constValue = null;
  var fsRequestUri = '&PRMLEN=' + this.requestFieldsArray.length;
  var fiRecordNr = null;
  var fieldObjName = '';
  var data = this.getPanelData();

  this.hasParams = false;

  for (var i = 0; i < this.requestFieldsArray.length; i++) {
    fieldObjName = this.requestPrefix + this.requestFieldsArray[i].field;
    fsRequestUri += '&PRM' + (i + 1) + '=';
    fsLocation = this.requestFieldsArray[i].location;
    foField = XDOM.getObject(fieldObjName);
    fiRecordNr = null;
    fsValue = '';

    if (!foField || (foField && foField.tagName !== 'INPUT')) {
      switch (fsLocation) {
        case 'headerData':
          fsValue = encodeURIComponent(data.headerData[this.requestFieldsArray[i].field]);
          break;
        case 'subfileData':
          fiRecordNr = parseInt(this.recordNumber) - 1; //array begint bij 0 en recordnummer bij 1
          if (fiRecordNr >= 0) {
            foField = XDOM.getObject(fieldObjName + '_' + this.recordNumber);
            if (!foField || (foField && foField.tagName !== 'INPUT')) {
              fsValue = encodeURIComponent(data.subfileData[fiRecordNr][this.requestFieldsArray[i].field]);
            }
          }
          break;
        case 'directValue':
          fsValue = encodeURIComponent(this.requestFieldsArray[i].value);
          break;
        default:
          if(foField){
            constValue = foField.getAttribute('data-const-value');
            if (constValue) {
              fsValue = constValue;
            }
          }
          break;
      }
    }

    if (!foField) {
      foField = XDOM.getObject('trigger_' + fieldObjName);
    }

    if (foField) {
      if (foField === this.target) {
        fsValue = encodeURIComponent(this.selectionRequest);
      } else {
        if (!Validate.test(foField)) {
          return 'invalid';
        }
        fsValue = encodeURIComponent(XDOM.getObjectValue(foField));
      }
    }

    if (fsValue) {
      this.hasParams = true;
    } else {
      fsValue = '';
    }
    fsRequestUri += fsValue;
  }
  return fsRequestUri;
};

GUI.InfoWindow.prototype.request = function() {
  GUI.InfoWindow.closeByMacroId(this.panelId);
  if (!this.useCache) {
    this.clearCache();
  }
  var fbAskLayout = !this.isInitialised;
  var fsrequestParams = this.buildParameterString();
  var fsrequiredString = '';
  var fsRequestUri =
    '/ndscgi/' +
    this.sourceLocation +
    '/ndmctl/' +
    this.macroName +
    '.ndm/JSON?PFMSOMTD=' +
    PFMBOX.PFMSOMTD +
    '&PFMFILID=' +
    PFMBOX.sPFMFILID +
    '&USRID=' +
    PFMBOX.PFMRMTUS +
    '&AUTHTOKEN=' +
    SESSION.AUTHTOKEN +
    fsrequestParams;

  if(this.environmentConditions){
    fsRequestUri +=  '&EnvConditions='+ encodeURIComponent(this.environmentConditions) ;
  }
  this.baseRequest = fsRequestUri;

  if (fbAskLayout && GUI.InfoWindow.configCache[this.cacheKey]) {
    fbAskLayout = false;
  }
  GUI.BasePanel.instances[this.panelId] = this;

  if (!this.hasParams && !fbAskLayout && !this.dataOnly) {
    // geen data nodig
    fsRequestUri += '&CONFIG=data';
  } else {
    // wel data nodig
    if (fbAskLayout) {
      // data en config nodig
      fsRequestUri += '&CONFIG=all';
    } else {
      // geen config nodig
      fsrequiredString = this.returnRequiredString();
      fsRequestUri += '&CONFIG=data' + fsrequiredString;
    }
  }
  let icon = XDOM.getObject(this.iconId);
  icon.dataset.isLoading == 'true';

  const promise = fetch(fsRequestUri)
      .then(response=>response.json())
      .then(json=> {
        GUI.InfoWindow.handleResponse(json,{ id: this.panelId, invoke: '*EXTERNAL' })
      })
  return promise;
};

/**
 * return required fields
 */
GUI.InfoWindow.prototype.returnRequiredString = function() {
  //var requiredReturnFields = this.requiredReturnFields;
  var requiredReturnFields = GUI.InfoWindow.configCache[this.cacheKey].requiredData;

  var requireSting = '';

  for (var value in requiredReturnFields) {
    requireSting += '&' + value.toString() + '=';
    requireSting += encodeURIComponent(requiredReturnFields[value]);
  }

  return requireSting;
};

/**
 * renderd het info window.
 */
GUI.InfoWindow.prototype.render = function() {
  //var fsId = this.panelId;
  if (!this.useCache && this.dom.domObject) {//	POM-4281
    this.dom.domObject.remove();
    this.dom.domObject = null;
  }

  if (this.screenMode === GUI.BasePanel.screenMode.subview) {
    this.setSize = false;
    this.placeHolder = XDOM.getObject(this.iconId)?.parentNode;
    if(!this.placeHolder){
      //this one is removed by field authorisation so don't bother
      return;
    }
    this.placeHolder.setAttribute('data-screen-mode', GUI.BasePanel.screenMode.subview);

    this.panelBackgroundColor = this.placeHolder.parentNode.getAttribute('data-fieldset-background-color');
    this.panelIconGroup = this.placeHolder.parentNode.getAttribute('data-fieldset-icon-group');
    this.panelIconClass = this.placeHolder.parentNode.getAttribute('data-fieldset-icon-class');
    this.fieldProgressionPartId = this.placeHolder.parentNode.getAttribute('fieldPprogression-part');
    if (this.dataSet) {
      this.repositionElements();
    }
  } else {
    this.fieldProgressionPartId = this.panelId;
    this.placeHolder = XDOM.getObject('DTADIV');
  }

  this.base(GUI.InfoWindow, 'render');

  if (this.inSubfile) {
    this.placeHolder.insertBefore(this.dom.domObject, this.placeHolder.firstChild);
  } else {
    this.placeHolder.appendChild(this.dom.domObject);
  }

  GUI.InfoWindow.renderCache[this.cacheKey] = this.dom.domObject;
  this.dom.domObject.setAttribute('data-click-action', 'GUI.InfoWindow.handlePanelClick');
  this.dom.domObject.setAttribute('data-eventarg-id', this.panelId);
  this.dom.domObject.setAttribute('data-update-dom-depth', 'true');

  updatePanelSort(this.dom.domObject);

  XDOM.addEventListenerToNode('[data-focus-action]', 'focus', handleFocus, this.dom.domObject);
  XDOM.addEventListenerToNode('[data-blur-action]', 'blur', handleBlur, this.dom.domObject);
  XDOM.addEventListenerToNode('[data-mouseover-action]', 'mouseover', handleMouseOver, this.dom.domObject);
  XDOM.addEventListenerToNode('[data-mouseout-action]', 'mouseout', handleMouseOut, this.dom.domObject);
  this.alignPanel();
  this.isVisible = true;
};

GUI.InfoWindow.prototype.show = function() {
  if (this.screenMode == GUI.BasePanel.screenMode.subview) {
    //RKR ~ Return als het om een subview gaat. Het object staat er al dus hoeft niet getoond te worden.
    //Dit is aangepast omdat bij Bieman berichten niet werden getoond in een editwindow.
    return;
    //this.placeHolder = XDOM.getObject(this.iconId).parentNode;
  } else {
    this.placeHolder = XDOM.getObject('DTADIV');
  }

  if (this.inSubfile) {
    this.placeHolder.insertBefore(this.dom.domObject, this.placeHolder.firstChild);
  } else {
    this.placeHolder.appendChild(this.dom.domObject);
    this.dom.domObject.setAttribute('data-hidden', 'false');
    this.alignPanel();
  }

  updatePanelSort(this.dom.domObject);

  this.base(GUI.InfoWindow, 'show');
};

GUI.InfoWindow.closeByMacroId = function(macro) {
  for (var id in GUI.BasePanel.instances) {
    if (GUI.BasePanel.instances[id].macroName === macro) {
      GUI.BasePanel.instances[id].close();
    }
  }
};

GUI.InfoWindow.prototype.onResponse = function(response) {
  this.data = response.data;
  this.subfileData = nullWhenEmpty(response.subfileData);
  var foConfig = GUI.InfoWindow.configCache[this.cacheKey];
  var position = null,
    icon = 0;
  if (this.dom.icon) {
    icon = XDOM.getObject(this.dom.icon.id);
    if (!icon) {
      this.close(); //aanroepend element is niet meer in het scherm te zien
    }
  }

  if (!this.isInitialised) {
    if (!foConfig) {

      GUI.InfoWindow.configCache[this.cacheKey] = response.config;
      foConfig = response.config;
    }

    this.condHiddenLines = foConfig.condHiddenLines;
    this.definition = foConfig.panelDef;
    this.authorizationFields = foConfig.authorizationData;
    this.captions = new Captions(foConfig);
    this.services = new GUI.Services(foConfig);
    this.base(GUI.InfoWindow, 'init');

    //if (this.openByHover && !this.hovering) {
    //	return;
    //}

    this.render();
  } else {
    if (!this.dom.domObject && GUI.InfoWindow.renderCache[this.cacheKey]) {
      this.dom.domObject = GUI.InfoWindow.renderCache[this.cacheKey];
    }
    if (this.dom.domObject) {
      this.show();
      this.update();
    } else {
      this.render();
    }
  }

  if (response && response.basicConfig) {
    var titleText =
      getCapt('cTX_SSN') + ': ' + response.basicConfig.jobNbr + ' \x0A' + getCapt('cTX_PGM') + ': ' + response.basicConfig.macroId;
    GUI.infoTitle.register(this.dom.header, titleText);
  }

  When.update(this.dom, this.data);
  Lines.guiUpdate(this);
};

GUI.InfoWindow.handleResponse = function(response, tag) {
  var foWindow = GUI.BasePanel.instances[tag.id];
  let icon = XDOM.getObject(foWindow.iconId);

  if (!foWindow) {
    return;
  } // -->
  // if (response.responseText.startsWith('Fout')) {
  //   SCOPE.main.Dialogue.alert('GUI.InfoWindow.handleResponse: ' + response.responseText);
  // } else {
    foWindow.invoke = tag.invoke;
    foWindow.onResponse(response);
  // }
};

GUI.InfoWindow.prototype.registerEvents = function() {
  if (this.eventsRegistered) {
    return;
  }
  var foOutput = XDOM.getObject(this.id);
  if (!this.dom.icon) {
    this.dom.icon = XDOM.getObject(this.iconId);
  }
  if (this.dom.icon) {
    XDOM.setAttribute(this.dom.icon, 'data-panel-id', this.panelId);
    this.dom.icon.setAttribute('data-click-action', 'GUI.InfoWindow.handleClick');
    this.dom.icon.setAttribute('data-mouseover-action', 'GUI.InfoWindow.handleMouseOver');
    this.dom.icon.setAttribute('data-mouseout-action', 'GUI.InfoWindow.handleMouseOut');
  }

  if (foOutput.tagName === 'INPUT') {
    return;
  }
  foOutput.setAttribute('data-mouseover-action', 'GUI.InfoWindow.handleMouseOver');
  foOutput.setAttribute('data-mouseout-action', 'GUI.InfoWindow.handleMouseOut');
  foOutput.setAttribute('data-click-action', 'GUI.InfoWindow.handleClick');
  foOutput.setAttribute('data-panel-id', this.panelId);
};


GUI.InfoWindow.updateDom = function() {
  const prommises = [];
  var pageObjects = XDOM.queryAll('[data-info-id]');
  var obj = null;
  var infoWindow = null;
  var screenMode = '';
  for (var i = 0, l = pageObjects.length; i < l; i++) {
    obj = pageObjects[i];
    if(obj.dataset.when=="unavailable"){
      continue; //not visable because of when construction
    }
    screenMode = obj.getAttribute('data-screen-mode');
    if (screenMode !== GUI.BasePanel.screenMode.subview) {
      obj.setAttribute('data-click-action', 'GUI.InfoWindow.handleClick');
      obj.setAttribute('data-mouseover-action', 'GUI.InfoWindow.handleMouseOver');
      obj.setAttribute('data-mouseout-action', 'GUI.InfoWindow.handleMouseOut');
    }
    setSubviewNoMargin(obj, screenMode);
    if (screenMode === GUI.BasePanel.screenMode.subview || obj.getAttribute('data-trigger-fields')) {
      infoWindow = GUI.InfoWindow.getWindow(obj);
      prommises.push(infoWindow.init());
    }
  }
  return prommises;
};

GUI.InfoWindow.register = function(id, iconId, attributes) {
  var foOutput = XDOM.getObject(id);
  var foIcon = XDOM.getObject(iconId);

  if (foIcon) {
    XDOM.setAttributes(foIcon, attributes);
    foIcon.setAttribute('data-mouseover-action', 'GUI.InfoWindow.handleMouseOver');
    foIcon.setAttribute('data-mouseout-action', 'GUI.InfoWindow.handleMouseOut');
    foIcon.setAttribute('data-click-action', 'GUI.InfoWindow.handleClick');
  }
  foOutput.setAttribute('data-mouseover-action', 'GUI.InfoWindow.handleMouseOver');
  foOutput.setAttribute('data-mouseout-action', 'GUI.InfoWindow.handleMouseOut');
  foOutput.setAttribute('data-click-action', 'GUI.InfoWindow.handleClick');
  XDOM.setAttributes(foOutput, attributes);
};
