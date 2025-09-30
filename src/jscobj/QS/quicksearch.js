

/**
 * QuickSearch object
 *
 * @param obj
 * - target
 * - minLengt
 * - searchFields
 * - requestFields
 * - returnFields
 * - macro
 * - srcLoc
 * - properties
 * - axis
 * - applyToRow *ALL of regel nummers waarop snelzoeken in een subfile van toepassing is
 * - triggerFields array van veldnamen als string bij een verandering van die velden wordt snelzoeken geactiveerd
 * - screenMode    *SUBVIEW inline anders als popup
 * - LimitResults  *YES|*NO resp maximaal 500 of 25 regels tonen
 * @returns {QuickSearch}
 */

function QuickSearch(obj) {
  this.type = 'quicksearch';
  this.id = obj.getAttribute('data-quicksearch-id');
  this.targetId = obj.getAttribute('data-to-id').trim();
  this.srcLocation = obj.getAttribute('data-macro-location');
  this.minLength = parseInt(
    obj.getAttribute('data-quicksearch-activate-after')
  );
  this.activateSearch = obj.getAttribute('data-activate-search');
  this.requestFieldsArray = eval(obj.getAttribute('data-parm-object'));
  this.requestPrefix = obj.getAttribute('data-parm-prefix') || '';
  this.returnFields = obj.getAttribute('data-return-fields').split(' ');
  this.clearFields = (obj.dataset.clearFields || '').split(' ');
  this.environmentConditions  = obj.dataset.environmentConditions;
  this.panelheight = parseInt(
    obj.getAttribute('data-quicksearch-panel-height')
  );
  this.panelWidth = parseInt(obj.getAttribute('data-quicksearch-panel-width'));
  this.macro = obj.getAttribute('data-macro-name');
  this.invokerBaseId = obj.getAttribute('data-invoker-baseId');
  this.triggerAction = obj.getAttribute('data-job-parm-action');

  this.recordNumber = obj.getAttribute('data-record-number');
  this.maxResults = QuickSearch.DefaultmaxResults;
  this.titleVariable = 'mTX_TTL';
  this.titleOrigin = '*LBL';
  this.iconId = obj.id;
  this.qsId =
    SESSION.activePage.macroName +
    '-' +
    this.id +
    '-' +
    this.macro +
    '-' +
    this.targetId;
  this.embeddedInMacro = SESSION.activePage.macroName;
  if (obj.getAttribute('data-quicksearch-limit-results') === '*NO') {
    this.maxResults = 500;
  }
  this.requestCounter = 0;
  this.axis = null;
  this.height = obj.getAttribute('data-subview-width');
  this.width = obj.getAttribute('data-subview-lines');
  this.triggerMacros = obj.getAttribute('data-trigger-macros') || '';
  this.triggerFields = obj.getAttribute('data-trigger-fields') || '';
  this.inSubfile = obj.getAttribute('data-record-number') !== null;
  this.messageWidth = null;
  this.HeaderAxis = null;
  this.targetAxis = null;
  this.applyToRow = null;
  this.errorMsg = null;
  this.autoOpen = true;
  this.paramString = '';
  this.target = XDOM.getObject(this.targetId);
  if (!this.srcLocation) {
    this.srcLocation = 'DBS';
  }

  // wordt in de eerste onResponce geinitialiseerd
  this.returnDataFields = [];
  this.displayFields = [];
  this.searchFields = [];
  this.searchFieldsLength = 0;
  this.requestFieldsLength = this.requestFieldsArray.length;
  this.delay = QuickSearch.defaultDelay;

  //data objecten
  this.data = null;
  this.subfileAttributes = null;

  this.requiredOutputObj = null;
  this.displayData = [];
  this.displaySubfileAttributes = [];
  this.exceedsMaxResults = false;
  this.cursor = -1;
  this.dom = {};

  //hulp variabelen
  this.openOnRequest = false;
  this.selectionRequest = '';
  this.requestArguments = null;
  this.isInitialised = false;
  this.lastPreFix = ''; //laatste waarde van het selectie voor de keyup event op dat veld
  this.isRendered = false;
  this.requery = false; // geeft aan of er al eerder een request is gedaan
  this.totalHeight = 0;
  this.proObj = {};

  //display elementen
  this.messagePlaceHolder = null;
  this.descriptionPlaceHolder = null;
  this.resultNumberPlaceHolder = null;
  this.NrResultsCaptionPlaceHolder = null;
  this.inline = true;
  this.table = new Table(this.qsId + '_table');
  this.table.qsId = this.qsId;
  this.panel = new Panel(this.qsId + '_panel', 'quickSearch');
  this.panel.rows = this.panelheight;
  this.panel.cols = this.panelWidth;
  this.panel.modal = false;
  this.panel.guiObject = this;
  this.panel.placeHolder = null;
  this.panel.panelBackgroundColor = '';
  this.panel.panelIconGroup = obj.getAttribute("data-fieldset-icon-group") || "fontAwesome";
  this.panel.panelIconClass = obj.getAttribute("data-fieldset-icon-class") || "";


  this.embeddedSizes = {};
  this.sortfields = {};
  this.sortField = '';
  this.sortSequence = '';
  this.sortCaseSensitive = false;
  this.SortDefined = false;
  this.invoke = ENUM.invoke.external;
  this.invokee = null;
  this.iconGroup = obj.getAttribute('data-fieldset-icon-group');
  this.iconClass = obj.getAttribute('data-fieldset-icon-class');


  QuickSearch.instances[this.qsId] = this;
  //  QuickSearch.instances[this.id] = this;
  this.setScreenMode(obj);
  this.updateID();
}

QuickSearch.prototype.setScreenMode = function(obj) {
  var sScreenMode = obj.getAttribute('data-screen-mode');
  var sSubViewId = obj.id.replace('QSR_', '');
  var targetObj = this.getTarget();
  if (sScreenMode === '*SUBVIEW') {
    this.panel.screenDiv = obj.parentNode
    this.inline = true;
  } else {
    this.panel.alignTo = targetObj;

    //Als target een mask is dan gebruiken we de container om uit te lijnen
    if (Mask.isMask(targetObj)) {
      this.panel.alignTo = Mask.getContainer(targetObj);
    }

    //als de input/output hidden is gebruiken we het icoon/knopje om de positie te bepalen (POM-1647)
    if (isHidden(this.panel.alignTo)) {
      this.panel.alignTo = XDOM.getObject(this.iconId);
    }

    this.inline = false;
    this.panel.screenDiv = XDOM.getObject('DTADIV');
    this.panel.onShow = function() {
      ScreenBlokker.guiObject = this.guiObject;
      ScreenBlokker.onclick = function() {
        ScreenBlokker.guiObject.selectField.focus();
        setCursorToEnd(ScreenBlokker.guiObject.selectField);
      };
    };
  }

  setSubviewNoMargin(sSubViewId, sScreenMode);
  this.panel.inline = this.inline;
  this.setDefaultMinLength();
};

QuickSearch.panelBorderWidth = 12;

QuickSearch.prototype.getTarget = function() {
  return XDOM.getObject(this.targetId);
};
QuickSearch.prototype.initObj = function() {
  this.registerTrigger();

  if (this.inline) {
    this.show();
  }
};

QuickSearch.prototype.renderIcon = function() {
  if (!this.inSubfile || this.dom.icon || this.inline) {
    return;
  } //-->
  this.dom.td = XDOM.getAxis(this.axis, this.recordNumber);
  if (this.dom.td) {
    this.iconId = 'QUICKSEARCH_' + this.qsId;
    this.dom.icon = XDOM.createElement('DIV', this.iconId, 'quickSearch');
    this.dom.td.appendChild(this.dom.icon);
  }
};

QuickSearch.prototype.registerSFLEvents = function() {};

QuickSearch.prototype.setDefaultMinLength = function() {
  // zet de default minlength als deze niet is gedefinieerd
  var targetObj = this.getTarget();
  if (this.minLength === '0' || this.inline) {
    this.minLength = 0;
    return; //omdat 0 gelijk is aan false
  }
  if (hasValue(this.minLength)) {
    return;
  }

  if (targetObj.maxLength > 0) {
    this.minLength = QuickSearch.DefaultMinLength[targetObj.maxLength];
    if (!this.minLength) {
      this.minLength =
        QuickSearch.DefaultMinLength[QuickSearch.DefaultMinLength.length - 1];
    }
  }
};

QuickSearch.prototype.update = async function() {
  if (this.inline) {
    this.requery = true;
    this.data = null;
    return this.request();
  } else {
    this.close();
    return Promise.resolve();
  }
};

/**
 * keyup event handler voor QuickSearch object
 * @param iKeyCode
 * @param eventFromSelectField
 * @returns
 */
QuickSearch.prototype.handleKeyUp = function(iKeyCode, eventFromSelectField) {
  var selectedFieldValue = XDOM.getObjectValue(this.selectFieldId);
  var validateResponse = null;
  var targetObj = this.getTarget();
  if (iKeyCode) {
    switch (iKeyCode) {
      case keyCode.arrowDown:
        if (this.getRowSelectionDown()) {
          this.table.rowDown();
        }
        return true;
        break;
      case keyCode.arrowUp:
        if (this.getRowSelectionUp()) {
          this.table.rowUp();
        }
        return true;
        break;
      case keyCode.enter:
        this.select(true);
        return true;
        break;
      case keyCode.F12:
      case keyCode.escape:
        this.close();
        return true;
        break;
      case keyCode.tab:
      case keyCode.shift:
        return true;
        break;
      case keyCode.F4:
        this.close();
        var obj = XDOM.query(
          '[data-to-id="' + targetObj.id + '"][data-search-id]'
        );
        if (obj) {
          XDOM.invokeClick(obj);
        }
        return true;
    }
  }
  if (!eventFromSelectField) {
    return false;
  }
  Stateless.setSubviewActive(this.selectFieldId);
  if (this.lastPreFix === selectedFieldValue) {
    // er is geen een change
    return false;
  }
  this.lastPreFix = selectedFieldValue;

  //check searchinput

  if (selectedFieldValue.length > 0) {
    validateResponse = Validate.test(this.selectFieldId);

    if (!validateResponse.succeed) {
      this.showMessage(validateResponse.message);
      return;
    }
  }

  if (selectedFieldValue.length < this.minLength) {
    this.updateResultIndicator();
    this.table.update(null);
    this.table.setSize();
    this.checkInput();
    return;
  }

  if (
    !this.data ||
    this.data.length > QuickSearch.subSelectOnClient ||
    this.requestParamChanged() ||
    this.errorMsg === ENUM.quicksearchErrors.subfileFull
  ) {
    this.requery = true;
    this.data = null;
    SESSION.submitFromScope = this.selectFieldId;
    this.request();
    return;
  }

  this.getSubSelection();
  this.table.update(this);

  if (
    this.displayData.length == 1 &&
    selectedFieldValue != targetObj.value &&
    this.displayData[0][this.keyField] == selectedFieldValue.toUpperCase()
  ) {
    QuickSearch.blockRequest = false;
    QuickSearch.OnSelect(this.qsId, 0, true);
  }

  this.table.setSize();
  this.updateResultIndicator();
};

// controle speciaal voor snelzoek. Indien de bovenste regel is
// geselecteerd en de gebruiker drukt op arrow UP dan blijft de cursor staan en schiet niet meer naar het laatste record.
QuickSearch.prototype.getRowSelectionUp = function() {
  if (this.table.cursor <= 0) {
    return false;
  }
  return true;
};

// controle speciaal voor snelzoek. Indien de onderste regel is
// geselecteerd en de gebruiker drukt op arrow DOWN dan blijft de cursor staan en schiet niet meer naar het eerste record.
QuickSearch.prototype.getRowSelectionDown = function() {
  if (this.table.cursor >= this.table.displayedRecords.length - 1) {
    return false;
  }
  return true;
};

QuickSearch.prototype.splitSelection = function(fsValue) {
  var requestArguments = fsValue.split(' ');
  var faReturn = [];
  if (requestArguments.length > 1) {
    faReturn[0] = requestArguments[0];
    faReturn[1] = requestArguments.slice(1).join(' ');
  } else {
    faReturn[0] = fsValue;
    faReturn[1] = '';
  }
  return faReturn;
};

QuickSearch.prototype.requestParamChanged = function() {
  var selectedFieldValue = XDOM.getObjectValue(this.selectFieldId) || '';
  var currentRequestArguments = this.splitSelection(selectedFieldValue);

  var firstArgumentSame = currentRequestArguments[0].startsWith(
    this.requestArguments[0]
  );
  var secondArgumentSame = currentRequestArguments[1].startsWith(
    this.requestArguments[1]
  );

  if (!this.requestArguments) {
    return true;
  }

  if (
    firstArgumentSame &&
    secondArgumentSame &&
    this.requestArguments[0] != ''
  ) {
    return false;
  }

  return true;
};

QuickSearch.prototype.updateResultIndicator = function() {
  if (this.exceedsMaxResults) {
    this.resultNumberPlaceHolder.innerHTML = '> ' + this.maxResults;
  } else {
    this.resultNumberPlaceHolder.innerHTML = this.displayData.length;
  }
  this.checkInput();
};

/**
 * close: sluit het sugest window
 * @param closeBySelection
 * @returns
 */
QuickSearch.prototype.close = function(closeBySelection) {
  var targetObj = this.getTarget();
  if (this.inline) {
    return;
  }
  if (targetObj) {
    targetObj.setAttribute('data-block-autosubmit', 'false');
  }

  if (this.invokee) {
    this.invokee.setAttribute('data-no-completion', 'false');
  }

  this.requery = false;
  this.data = null;

  if (!this.panel.visible) {
    this.invokee = null;
    return;
  }

  XDOM.setObjectValue(this.selectFieldId, '');

  if (this.panel) {
    this.panel.close();
    if (this.qsId && QuickSearch.instances[this.qsId]) {
      QuickSearch.gotFocus = false;
    }
  }
  if (closeBySelection) {
    //er heeft een selectie plaats gevonden
    //focus mag niet meer op de invokee gezet worden;
    this.invokee = null;
  }
  this.focusTarget();
  this.invokee = null;
  SESSION.activePage.modalObject = null;
};

QuickSearch.prototype.focusTarget = function() {
  var targetObj = this.getTarget();
  if (!targetObj) {
    return;
  }
  if (Mask.isMask(targetObj)) {
    //als invokee is gedefinieerd dan moet de focus terug
    //gaan naar het juiste deel van het masker (er wordt is geen waarde terug gezet
    //als invokee niet is defnieerd dan naar het laatste deel
    if (this.invokee) {
      targetObj = this.invokee;
    } else {
      targetObj = Mask.getLastPart(targetObj);
    }
  }
  XDOM.focus(targetObj);
  setCursorToEnd(targetObj);
};

/**
 * doet een request naar de server
 * @returns
 */
QuickSearch.prototype.request = async function () {
  let qsId = this.qsId;
  let selectedFieldValue = XDOM.getObjectValue(this.selectFieldId) || '';
  if (hasValue(selectedFieldValue) && this.panel.visible) {
    this.selectionRequest = selectedFieldValue;
  }
  let url =
      '/ndscgi/' +
      this.srcLocation +
      '/ndmctl/' +
      this.macro +
      '.ndm/JSON?PFMSOMTD=' +
      PFMBOX.PFMSOMTD +
      '&PFMFILID=' +
      PFMBOX.sPFMFILID +
      '&USRID=' +
      PFMBOX.PFMRMTUS +
      '&AUTHTOKEN=' +
      SESSION.AUTHTOKEN +
      '&requestCount=' +
      ++this.requestCounter +
      '&pPanelWidth= ' +
      this.panelWidth +
      '&pPanelHeight= ' +
      this.panelheight;
  url += '&SortDefined=' + this.SortDefined;
  url += '&invoke=' + this.invoke;
  url += '&WS_SRT=' + this.sortField;
  url += '&WS_SEQ=' + this.sortSequence;

  url += '&WS_TRN=';
  if (this.sortCaseSensitive) {
    url += 'T';
  }

  if (this.environmentConditions) {
    url += '&EnvConditions=' + encodeURIComponent(this.environmentConditions);
  }

  this.invoke = ENUM.invoke.external;
  if (this.selectionRequest.length < this.minLength && !this.openOnRequest) {
    //geen data nodig
    if (this.isInitialised) {
      //geen request dus geen data en geen config nodig
      this.onResponse();
      return;
    }
    //alleen config nodig
    url += '&CONFIG=all';
    url += this.getParamString();
  } else {
    //wel data nodig
    if (this.isInitialised) {
      //geen config nodig
      url += '&CONFIG=data';
    } else {
      //data en config nodig
      url += '&CONFIG=all';
    }
    this.paramString = this.getParamString();

    if (this.paramString === 'invalid') {
      return;
    }

    url += this.paramString;
  }

  if (this.isRendered) {
    this.resultNumberPlaceHolder.setAttribute('data-hidden', 'true');
    this.quickSearchLoader.setAttribute('data-hidden', 'false');
  }

  setSubviewLoading(this.quickSearchLoader, true);
  QuickSearch.response = await fetch(url).then(response => response.json())
  QuickSearch.handleRequest(qsId);

};

QuickSearch.prototype.getParamString = function() {
  return this.buildParameterString();
};



QuickSearch.prototype.buildParameterString = function() {

  var foField = null;
  var fsValue = '';
  var fsLocation = null;
  var fiRecordNr = '';
  var fsRequestUri = '&PRMLEN=' + this.requestFieldsArray.length;
  var constValue = null;
  var fieldObjName = '';
  var targetObj = this.getTarget();

  for (var i = 0; i < this.requestFieldsArray.length; i++) {
    const fieldName = this.requestFieldsArray[i].field;
    fieldObjName = this.requestPrefix + fieldName;
    fsRequestUri += '&PRM' + (i + 1) + '=';
    fsLocation = this.requestFieldsArray[i].location;
    foField = XDOM.getObject(fieldObjName);
    fiRecordNr = null;
    fsValue = '';

    if (!foField || (foField && foField.tagName !== 'INPUT')) {
      switch (fsLocation) {
        case 'headerData':
          //remove macroname prefix

          if (this.invokerBaseId) {
            fieldObjName = fieldObjName.replace(this.invokerBaseId + '-', '');
            fsValue = encodeURIField(
              GUI.BasePanel.instances[this.invokerBaseId].data[fieldObjName]
            );
          } else {
            fsValue = encodeURIField(
                SESSION.activeData.headerData[fieldName]
            );
          }
          break;
        case 'subfileData':
          fiRecordNr = parseInt(this.recordNumber) - 1; //array begint bij 0 en recordnummer bij 1
          if (fiRecordNr >= 0) {
            foField = XDOM.getObject(fieldObjName + '_' + this.recordNumber);
            if (!foField || (foField && foField.tagName !== 'INPUT')) {
              fsValue = encodeURIField(
                SESSION.activePage.subfileData[fiRecordNr][fieldName]
              );
            }
          }
          break;
        default:
          constValue = foField.getAttribute('data-const-value');
          if (constValue) {
            fsValue = constValue;
          }
          break;
      }
    }

    if (!foField) {
      foField = XDOM.getObject('trigger_' + fieldObjName);
    }

    if (foField && foField.tagName === 'INPUT') {
      if (foField === targetObj) {
        fsValue = encodeURIField(this.selectionRequest);
      } else {
        if (!Validate.test(foField)) {
          return 'invalid';
        }
        fsValue = encodeURIField(XDOM.getObjectValue(foField));
      }
    }

    if (fsValue && fsValue != 'undefined') {
      fsRequestUri += fsValue;
    }
  }

  if (this.requiredReturnFields && this.requiredReturnFields != 'undefined') {
    fsRequestUri += this.returnRequiredString();
  }

  this.requestArguments = this.splitSelection(this.selectionRequest);
  return fsRequestUri;
};

/**
 * return required fields
 */
QuickSearch.prototype.returnRequiredString = function() {
  var requiredReturnFields = this.requiredReturnFields;
  var requireSting = '';

  for (var value in requiredReturnFields) {
    requireSting += '&' + value.toString() + '=';
    requireSting += encodeURIField(requiredReturnFields[value]);
  }

  return requireSting;
};
QuickSearch.prototype.getTargetValue = function() {
  var targetObj = this.getTarget();
  var retValue = Mask.getRawValue(targetObj);
  if (!retValue) {
    retValue = XDOM.getObjectValue(targetObj);
  }
  return retValue;
};

QuickSearch.prototype.show = function(delayedOpen) {
  var foField = this.getTarget();
  var selectedField = XDOM.getObject(this.selectFieldId);
  var requestString = null;
  foField.setAttribute('data-block-autosubmit', 'true');

  requestString = this.getTargetValue();

  if (requestString.length < this.minLength && delayedOpen) {
    QuickSearch.blockRequest = false;
    return;
  }

  this.selectionRequest = requestString;

  if (selectedField && this.panel.visible) {
    selectedField.value = this.selectionRequest;
    setCursorToEnd(selectedField);
  }

  this.hideMessage();
  this.request();
};

QuickSearch.prototype.onResponse = function(response) {
  var selectedField = XDOM.getObject(this.selectFieldId);
  var selectedFieldValue = XDOM.getObjectValue(selectedField) || '';
  var targetObj = this.getTarget();
  if (
    response &&
    response.basicConfig &&
    response.basicConfig.requestCount < this.requestCounter
  ) {
    return;
  }
  if (response && response.subfile) {
    this.data = response.subfile;
    this.subfileAttributes = response.subfileAttributes || [];
  } else {
    this.data = [];
    this.subfileAttributes = [];
  }

  this.init(response);
  //bij 1 resultaat die gelijk is aan het verzoek en het scherm is niet geopend door middel van
  if (
    this.data.length === 1 &&
    selectedFieldValue !== targetObj.value &&
    this.data[0][this.keyField] === selectedFieldValue.toUpperCase()
  ) {
    this.table.data = this.data;
    QuickSearch.blockRequest = false;
    QuickSearch.OnSelect(this.qsId, 0, true, true);
    return;
  }

  //f2 of f4 of via klikken op een icoon (openOnRequest = true) dan niet renderen en het scherm verder gewoon sluiten
  if (
    !this.openOnRequest &&
    this.data.length === 1 &&
    this.returnfieldsMatch() &&
    !this.inline
  ) {
    this.table.data = this.data;
    QuickSearch.blockRequest = false;
    QuickSearch.OnSelect(this.qsId, 0, true);
    return;
  }

  //bij automatisch openen - in de response van de marco staat false en de definitie laat het afhangen van de macro...
  if (
    !this.autoOpen &&
    this.activateSearch === '*MACRO' &&
    !this.openOnRequest
  ) {
    //unblock autosubmit for input (it will be set)
    targetObj.setAttribute('data-block-autosubmit', false);
    return;
  }

  //=======================================================>>
  //OPLOSSING POM-2341
  //=======================================================>>

  var targetObj = this.getTarget();
  var toIdValue = targetObj.value || '';
  var sendNewRequest = false;

  //if QS is open get seachField value
  if (this.panel.visible) {
    if (this.selectionRequest !== selectedFieldValue) {
      this.selectionRequest = selectedFieldValue;
      sendNewRequest = true;
    }
    //else get value from target field
  } else {
    if (this.selectionRequest !== toIdValue) {
      this.selectionRequest = toIdValue;
      sendNewRequest = true;
    }
  }

  if (sendNewRequest) {
    //check of er een nieuwe request uit moet of dat we kunnen filteren...
    if (!this.isRendered) {
      this.renderQuickSearch();
    }
    this.getSubSelection();
    if (this.displayData.length == 0) {
      this.request();
      return;
    }
  }

  //=======================================================>>

  if (this.selectionRequest.length >= this.minLength) {
    if (
      this.paramString !== this.getParamString() &&
      this.data.length >= QuickSearch.subSelectOnClient
    ) {
      this.request();
      return;
    }
  }

  QuickSearch.blockRequest = false;

  if (this.isRendered) {
    if (!this.panel.visible) {
      //wordt opnieuw aangeroepen nadat hij gesloten was
      this.panel.show();
      selectedField.value = this.getTargetValue();
      this.lastPreFix = selectedField.value;
    }
    this.getSubSelection();
    this.updateResultIndicator();
    this.table.update(this);
    this.table.setSize();
  } else {
    this.render();
    this.renderResults();
    this.panel.show();
    this.table.setSize();
    this.setDescriptionSize();
    this.updateResultIndicator();
    this.updateRequestArguments()
  }

  //controle op fouten of boodschappen
  this.handleMessages(response);
  this.setDescription(response);
  this.setHeaderTitle(response);
  this.onReloadByMacrotrigger();
  this.focusSelectField();
  setSubviewLoading(this.quickSearchLoader, false);
  setCursorFromStateless();
};

QuickSearch.prototype.saveCurrentState = function(index) {
  this.beforeReload = {
    cursor: this.table.cursor,
    orgCursor: this.table.cursor,
    top: this.table.body.domObject.scrollTop,
    selectionFound: false
  };
};

QuickSearch.prototype.findLastSelected = function(index) {
  if (!this.beforeReload || this.beforeReload.selectionFound) {
    return;
  }
  let record = this.displayData[index];
  for (let fieldName in this.lastSelectedKey) {
    if (record[fieldName] !== this.lastSelectedKey[fieldName]) {
      return;
    }
  }
  this.beforeReload.cursor = index;
  this.beforeReload.selectionFound = true;
};

QuickSearch.prototype.onReloadByMacrotrigger = function(response) {
  if (!this.beforeReload) {
    return;
  }

  let cursor = this.beforeReload.cursor;
  let fromTop = this.beforeReload.top;

  if (cursor > this.data.length) {
    cursor = this.data.length;
  }

  this.table.cursor = cursor;
  this.table.highLightRow();
  if (cursor == this.beforeReload.orgCursor) {
    this.table.body.domObject.scrollTop = this.beforeReload.top;
  }
  this.beforeReload = null;
};

QuickSearch.prototype.focusSelectField = function(response) {
  const selectedField = XDOM.getObject(this.selectFieldId);
  if (!Stateless.canHaveFocus(selectedField)) {
    return;
  }
  selectedField.focus();
  //setCursorToEnd(selectedField); aanpassing ivm POM-3499
};

QuickSearch.prototype.renderQuickSearch = function() {
  this.render();
  this.renderResults();
  this.panel.show();
  this.table.setSize();
  this.setDescriptionSize();
  this.updateResultIndicator();
  this.focusSelectField();
};

QuickSearch.prototype.updateRequestArguments = function() {
  this.requestArguments  = this.splitSelection( XDOM.getObjectValue(this.selectFieldId) || '');
}

QuickSearch.prototype.setDescriptionSize = function() {
  var fiLeft = this.descriptionPlaceHolder.offsetLeft;
  var fiNextLeft = this.NrResultsCaptionPlaceHolder.offsetLeft;
  var fiWidth = fiNextLeft - fiLeft - 5;
  this.descriptionPlaceHolder.style.width = fiWidth + 'px';
};

QuickSearch.prototype.showMessage = function(text, level) {
  if (text === '') {
    this.hideMessage();
    return;
  }
  this.messagePlaceHolder.innerHTML = text;
  this.messagePlaceHolder.style.display = '';
  /*  this.messagePlaceHolder.style.width =  'calc(100% - 42px)';*/
  this.messagePlaceHolder.className = 'STS_' + level;
};

QuickSearch.prototype.hideMessage = function() {
  if (this.messagePlaceHolder) {
    this.messagePlaceHolder.style.display = 'none';
  }
};

QuickSearch.checkAutoOpen = function(autoOpenState) {
  switch (autoOpenState) {
    case '*MANUAL':
      return false;
      break;
    default:
      return true;
      break;
  }
};

QuickSearch.prototype.checkInput = function() {
  var fsMessage = '';
  var selectedFieldValue = XDOM.getObjectValue(this.selectFieldId) || '';
  this.hideMessage();

  if (selectedFieldValue.length < this.minLength) {
    fsMessage = getCapt('gQSEARCHNOTENOUGHIMPUT1');
    fsMessage += this.minLength.toString();
    if (this.minLength === 1) {
      fsMessage += getCapt('gQSEARCHNOTENOUGHIMPUT2');
    } else {
      fsMessage += getCapt('gQSEARCHNOTENOUGHIMPUT3');
    }
    this.resultNumberPlaceHolder.innerHTML = '';
    this.requestArguments = '';
  } else if (this.displayData.length === 0) {
    fsMessage = getCapt('gQSEARCHRESULTSETEMPTY');
  }

  this.showMessage(fsMessage, 'OK');
};

QuickSearch.prototype.handleMessages = function(response) {
  this.checkInput();

  if (!response || !response.data) return;

  this.errorMsg = response.data.WS_ERR;

  var foMessage = QuickSearch.error[response.data.WS_ERR];
  if (foMessage) {
    this.showMessage(foMessage.caption, foMessage.messageLevel);
  }
  return;
};

QuickSearch.prototype.setDescription = function(response) {
  if (response && response.data && response.data.WS_DSC) {
    this.descriptionPlaceHolder.innerHTML = response.data.WS_DSC;
  } else {
    this.descriptionPlaceHolder.innerHTML = '';
  }
};

QuickSearch.prototype.setHeaderTitle = function(response) {
  var title = '';
  if (!response) {
    return; //aangeroepen zonder response gebeurd als het zoek creteria te kort is
    // in dat geval hoeft de title niet opneiuw worden gezet
  }

  this.table.header.update(response.data);
  if (response.basicConfig) {
    var titleText =
      getCapt('cTX_SSN') +
      ': ' +
      response.basicConfig.jobNbr +
      ' \x0A' +
      getCapt('cTX_PGM') +
      ': ' +
      response.basicConfig.macroId;
    GUI.infoTitle.register(this.panel.headerDiv, titleText);
  }

  if (this.titleOrigin === '*LBL') {
    title = this.captions[this.titleVariable];
  } else {
    if (response.data) {
      title = response.data[this.titleVariable];
    }
  }
  this.panel.setTitle(title);
};

QuickSearch.prototype.init = function(response) {
  if (this.isInitialised || !response || !response.config) {
    return;
  }
  var config = response.config;
  var faCols = config.dataCols;
  var foDataCol = null;
  var faHeaders = [];
  var faTableRows = [];
  var fiCol = null;
  var fiRow = null;
  var fsHeaderText = '';
  var fiTotalCols = 0;
  var fiTotalwidth = 0;
  var fiWidth = 0;
  var fsDataType = '';
  var foField = null;
  var fsClassExtend = '';
  var infoPrograms = {};
  this.returnDataFields = config.returnField.split(' ');
  this.requiredReturnFields = config.requiredData;

  this.keyField = this.returnDataFields[this.returnDataFields.length - 1];
  this.captions = config.captionsUserLang;
  if (!this.captions) {
    this.captions = config.captionsDftLang;
  }
  for (var fiCols = config.dataCols.length, i = 0; i < fiCols; i++) {
    foDataCol = faCols[i];
    fiRow = parseInt(foDataCol.rowNum) - 1; //posities in netdata 1-based javascript 0-based
    fiCol = parseInt(foDataCol.colNum) - 1;
    if (fiCol > fiTotalCols) {
      fiTotalCols = fiCol;
    }
    if (
      foDataCol.search === '*YES'
      //&& config.returnField.indexOf(foDataCol.fieldId) === -1 oud zeer altijd zoeken op een veld met search="*YES" N.A.V. POM-2890
    ) {
      this.searchFields[this.searchFields.length] = foDataCol.fieldId;
    }
    if (foDataCol.type === 'infoProgram') {
      infoPrograms[foDataCol.toId] = foDataCol;
    }
    if (
      foDataCol.labelVariable &&
      foDataCol.labelVariable.length > 0 &&
      foDataCol.display === '*YES'
    ) {
      if (!faHeaders[fiRow]) {
        faHeaders[fiRow] = [];
      }
      faHeaders[fiRow][fiCol] = foDataCol;
    }
    if (foDataCol.display === '*YES') {
      this.displayFields.push(foDataCol.fieldId); //pom-1202
      if (!faTableRows[fiRow]) {
        faTableRows[fiRow] = [];
      }
      faTableRows[fiRow][fiCol] = foDataCol;
    }
  }

  for (var fiYLength = faHeaders.length, y = 0; y < fiYLength; y++) {
    if (y > 0) {
      this.table.header.newRow();
    }
    for (var x = 0; x <= fiTotalCols; x++) {
      var foFieldDev = faHeaders[y][x];
      if (foFieldDev) {
        if (foFieldDev.labelOrigin === '*LBL') {
          fsHeaderText = this.captions[foFieldDev.labelVariable];
        } else {
          fsHeaderText = ' ';
        }
        fsDataType = foFieldDev.dataType;
      } else {
        fsHeaderText = ' ';
        fsDataType = '';
      }

      foField = new TableField(fsHeaderText);
      foField.qsId = this.qsId;
      foField.dataType = fsDataType;
      foField.cssClass = 'quickSearch-table-header';

      if (foFieldDev) {
        foField.labelOrigin = foFieldDev.labelOrigin;
        foField.labelVariable = foFieldDev.labelVariable;
        foField.fieldName = foFieldDev.fieldId;
        foField.sortAscend = foFieldDev.sortAscend;
        foField.sortDescend = foFieldDev.sortDescend;
        foField.sortSensitivity = foFieldDev.sortSensitivity;
        foField.sortId = foFieldDev.sortId;
        foField.textAlign = foFieldDev.textAlign;
      }

      if (foField.sortAscend === 'true' || foField.sortDescend === 'true') {
        this.SortDefined = true;
      }

      foField.quickSearch = this;
      this.table.header.addField(foField);
    }
  }

  for (var fiYLength = faTableRows.length, y = 0; y < fiYLength; y++) {
    if (y > 0) {
      this.table.body.newRow();
    }
    for (var x = 0; x <= fiTotalCols; x++) {
      fsClassExtend = '';
      foFieldDev = faTableRows[y][x];
      if (foFieldDev) {
        foField = new TableField(foFieldDev.fieldId);
        foField.dataType = foFieldDev.dataType;
        foField.maxScaleSystemLimit = foFieldDev.maxScaleSystemLimit;
        foField.maxScaleField = foFieldDev.maxScaleField;
        foField.blankWhenZero = foFieldDev.blankWhenZero;
        foField.thousandSeparator = foFieldDev.thousandSeparator;
        foField.attentionField = foFieldDev.AttnField;
        foField.textAlign = foFieldDev.textAlign;
        foField.hintOrigin = foFieldDev.hintOrigin;
        foField.hintVariable = foFieldDev.hintVariable;

        foField.setInfoProgram(infoPrograms[foFieldDev.fieldId]);

        if (foFieldDev.colWidth) {
          fiWidth = parseInt(foFieldDev.colWidth);
          fiTotalwidth += fiWidth;
          this.table.columns[x] = fiWidth;
        }
      } else {
        foField = new TableField('');
      }

      if (foField.dataType === '*DEC') {
        fsClassExtend = 'decimal';
      }
      foField.cssClass = 'quickSearch-table-entry ' + fsClassExtend;

      GUI.MaskedOutput.isOutputMask(foField, foFieldDev);
      GUI.Link.isLink(foField, foFieldDev);
      this.table.body.addField(foField);
    }
  }

  this.setSize(fiTotalwidth);
  this.searchFieldsLength = this.searchFields.length;
  this.titleVariable = response.config.panelDef.titleVariable;
  this.titleOrigin = response.config.panelDef.titleOrigin;
  this.autoOpen =
    (response.config.panelDef.autoOpen === 'false') !==
    Boolean(response.config.panelDef.autoOpen);
  this.isInitialised = true;
  return;
};

QuickSearch.prototype.setSize = function(fiTotalWidth) {
  if (this.sizes) {
    return;
  }
  var totalWidth = fiTotalWidth;
  totalWidth *= SETTINGS.charWidth;
  totalWidth += SETTINGS.scrollBarWidth;
  totalWidth += QuickSearch.panelBorderWidth;
  this.panel.width = totalWidth.toString() + 'px';
  this.messageWidth = totalWidth - 20 + 'px';

  if (this.inline) {
    var fiTotalHeight = this.panel.screenDiv.offsetHeight;
    this.sizes = {};
    this.sizes.lineHeight = 20;
    this.sizes.headerHeight = 30;
    this.table.sizes.totalHeight = fiTotalHeight - 2 * this.sizes.headerHeight;

    this.table.sizes.totalWidth =
      floor(100 / this.panelWidth, 2) * (this.panelWidth - 1);
    this.table.totalLines = this.panelheight - 2;
    this.table.inline = true;
    this.sizes.headerHeight += 'px';
  }
};

/**
 * rendert de resultaten (onderste deel van QuickSearch scherm)
 * @returns
 */
QuickSearch.prototype.renderResults = function() {
  var foContent = null;
  this.getSubSelection();

  if (this.panel.contentExists('result')) {
    this.table.update(this);
  } else {
    this.table.data = this.displayData;
    this.table.subfileAttributes = this.displaySubfileAttributes;
    this.table.captions = this.captions;
    foContent = this.table.render();
    this.panel.add(foContent, 'result');
  }
  this.table.setSize();
  this.updateResultIndicator();
  this.table.select(0);
  return;
};

QuickSearch.prototype.getSubSelection = function() {
  var selectedField = XDOM.getObject(this.selectFieldId);
  var selectedFieldValue = this.selectionRequest.trim();
  if (selectedField) {
    //als selectedField niet bestaat dan is het scherm nog niet gerenderd
    selectedFieldValue = selectedField.value;
  }
  var fidata = 0;
  var fiResults = 1;
  var fsSelection = selectedFieldValue.toUpperCase();
  var newIndex = 0;
  this.displayData = [];
  this.displaySubfileAttributes = [];

  var selection = this.splitSelection(fsSelection);
  this.exceedsMaxResults = false;
  if (!this.data || fsSelection.length < this.minLength) {
    return [];
  }
  fidata = this.data.length;
  for (this.cursor = 0; this.cursor < fidata; this.cursor++) {
    if (this.isInSelection(selection)) {
      this.displayData[newIndex] = this.data[this.cursor];
      this.findLastSelected(newIndex);
      this.displaySubfileAttributes[newIndex] =
        this.subfileAttributes[this.cursor] || {};
      newIndex++;

      if (++fiResults > this.maxResults) {
        this.exceedsMaxResults = true;
        return;
      }
    }
  }
  return;
};

/**
 * zet de sleutel waarde van het geselecteerde veld terug naar het target veld
 * @param {type} setFocus
 * @param {type} returnFromResponse
 * @returns {undefined}
 */
QuickSearch.prototype.select = function(setFocus, returnFromResponse) {
  var fbTriggersEvent = false;
  var selectedFieldValue = XDOM.getObjectValue(this.selectFieldId) || '';
  if (this.inSubfile) {
    this.selectSfl();
    return;
  }
  var faRecord = this.table.getCurrentRecord();
  var fiRetFields = this.returnFields.length;
  var fsFieldId = '';
  var foRetField = null;
  var fsRetValue = null;
  var fsPanelId = null;
  var foEdit = null;
  var targetObj = this.getTarget();
  XDOM.focus(this.selectFieldId);
  Stateless.setSubviewActive(this.selectFieldId);
  this.lastSelectedKey = {};
  //clear the fields if any
  XDOM.clearFields(this.clearFields);
  if (faRecord) {
    for (var i = 0; i < fiRetFields; i++) {
      fsFieldId = this.returnFields[i];
      foRetField = XDOM.getObject(fsFieldId);
      this.lastSelectedKey[fsFieldId] = faRecord[this.returnDataFields[i]];
      if (foRetField) {
        if (Trigger.hasTriger(foRetField)) {
          fbTriggersEvent = true;
        }
        XDOM.setObjectValue(foRetField, faRecord[this.returnDataFields[i]]);
      }
    }
  } else {
    //zet alleen de waarde terug (qua lengte) die in het targetField mag staan
    fsRetValue = selectedFieldValue.substr(
      0,
      XDOM.getObject(this.targetId).maxLength
    );
    XDOM.setObjectValue(this.targetId, fsRetValue);
  }
  resetMessage();
  this.close(true);
  if (this.triggerAction === ENUM.triggerAction.update) {
    Stateless.setSubviewActive(this.selectFieldId);
    Command.ipmfSubmitOnly();
  } else {
    if (isAutoSubmitField(targetObj)) {
      fsPanelId = XDOM.getAttribute(targetObj, 'data-panel-id');

      if (fsPanelId) {
        foEdit = GUI.BasePanel.instances[fsPanelId];
        foEdit.send('ENTER', targetObj.id.replace(fsPanelId + '-', ''));
        return;
      }

      if (!returnFromResponse) {
        Command.enter();
        return;
      }
    }
  }

  if (!isAutoSubmitField(targetObj) && fbTriggersEvent) {
    Trigger.fire(this.returnFields.concat(this.clearFields));
    XDOM.setOldvalue(this.returnFields.concat(this.clearFields));
    return;
  }

  if (setFocus) {
    fp.next(targetObj);
  }

  return;
};

/**
 * zet de sleutel waarde van het geselecteerde veld terug naar het target veld
 * @returns
 */
QuickSearch.prototype.selectSfl = function() {
  var faRecord = this.table.getCurrentRecord();
  var fiRetFields = this.returnFields.length;
  var fsFieldId = '';
  var fsValue = '';
  if (faRecord) {
    for (var i = 0; i < fiRetFields; i++) {
      fsFieldId = this.returnFields[i];
      fsValue = faRecord[this.returnDataFields[i]];
      XDOM.setAxisValue(fsFieldId, this.recordNumber, fsValue);
    }
  }
  Subfile.setChanged(this.recordNumber);
  resetMessage();
  this.close(true);
  INP.handelTriggersAndAutoSubmits(XDOM.getAxis(fsFieldId, this.recordNumber));
};

/**
 * controleerd of het huidige record aangegeven door cursor in data array
 * een veld uit de searchFields array bevat bevat waarvan de waarde voldoet aan een like %[waarde uit selectie veld]%
 * of het sleutelveld bevat dat voldoet aan like [waarde uit selectie veld]%
 * @param selection
 * @returns {boolean}
 */
QuickSearch.prototype.isInSelection = function(selection) {
  var searchString = '';
  var fsFieldId = '';
  var fbResult = false;
  var record = this.data[this.cursor];
  // stel de zoek string samen
  for (var i = 0; i < this.searchFieldsLength; i++) {
    fsFieldId = this.searchFields[i];
    searchString += ' ' + record[fsFieldId].toUpperCase();
  }

  //fbResult = this.valueInRecord(selection[0],searchString);
  //fbResult = this.valueInRecord(selection[1],searchString);

  fbResult =
    this.valueInRecord(selection[0], searchString) &&
    this.valueInRecord(selection[1], searchString);

  return fbResult;
};

QuickSearch.prototype.valueInRecord = function(searchValue, searchString) {
  var record = this.data[this.cursor];
  var fsDataValue = null;
  var searchArguments = null;
  var patern = '';
  if (searchValue === '') {
    return true;
  }

  //maak een array met alle zoekwoorden
  searchArguments = searchValue.split(' ');

  //start het maken van een regular expression .*
  patern = '.*';

  //voeg aan de regular expression de zoekwoorden toe - (?=.*ZOEKWOORD)
  for (var l = searchArguments.length, i = 0; i < l; i++) {
    //escape alle zoekwoorden met speciale tekens zodat de regEx blijft kloppen
    searchArguments[i] = searchArguments[i].replace(
      /[-[\]{}()*+?.,\\^$|#\s]/g,
      '\\$&'
    );

    //combine de zoektermen
    patern += '(?=.*' + searchArguments[i] + ')';
  }

  //creeer regular expression met (I)gnore case sensitive en (G) global
  patern = new RegExp(patern, 'ig');

  //check de zoekstring of hij alle zoekwoorden bevat
  if (patern.test(searchString)) {
    return true;
  }

  for (var l = this.returnFields.length, i = 0; i < l; i++) {
    let returnField = this.returnDataFields[i];
    if (this.displayFields.indexOf(returnField) > -1) {
      //pom1202
      continue;
    }
    fsDataValue = record[returnField];

    if (fsDataValue.startsWith(searchValue)) {
      return true;
    }
  }
  return false;
};

QuickSearch.prototype.returnfieldsMatch = function() {
  var fsFieldValue = '';
  var fsDataValue = null;
  for (var l = this.returnFields.length, i = 0; i < l; i++) {
    if (this.recordNumber) {
      fsFieldValue = XDOM.getAxisValue(this.returnFields[i], this.recordNumber);
    } else {
      fsFieldValue = XDOM.getObjectValue(this.returnFields[i]);
    }

    fsDataValue = this.data[0][this.returnDataFields[i]];
    if (fsDataValue) {
      if (fsFieldValue.toUpperCase() !== fsDataValue.toUpperCase()) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
};

QuickSearch.prototype.updateID = function() {
  var objects = XDOM.queryAll("[data-quicksearch-id='" + this.id + "']");
  for (var i = 0, l = objects.length; i < l; i++) {
    objects[i].setAttribute('data-quicksearch-id', this.qsId);
  }
};

QuickSearch.prototype.render = function() {
  var foInputLine = null;
  var selectField = null;
  var targetObj = this.getTarget();
  if (!this.isRendered) {
    this.panel.title = this.captions['mTX_TTL'];
    if (!this.inline) {
      this.panel.onDrop = function() {
        setCursorToEnd(this.guiObject.selectField);
      };
      this.panel.onClose = function() {
        if (SESSION.activePage.modalObject) {
          SESSION.activePage.modalObject.close();
        }
      };
    }
    foInputLine = XDOM.createElement(
      'DIV',
      'quickSearch-inputLine',
      'searchRow'
    );
    this.selectFieldId = this.qsId + '_search';
    selectField = XDOM.createElement('INPUT', this.selectFieldId, null);

    selectField.setAttribute('autocomplete', 'off');
    selectField.type = 'text';
    selectField.setAttribute('data-quicksearch-selectField', 'true');
    selectField.setAttribute('data-setDefault-events', 'false');
    selectField.setAttribute('data-quicksearch-id', this.qsId);
    selectField.setAttribute('data-datatype', '*QUICKSEARCH');
    selectField.placeholder = getCapt('gQSEARCHEMPTYFIELD');

    if (this.inline) {
      selectField.addEventListener('click', QuickSearch.selectFieldClick)
      selectField.value = '';
    } else {
      selectField.value = this.getTargetValue();
    }

    this.descriptionPlaceHolder = XDOM.createElement(
      'DIV',
      null,
      'quickSearch-description'
    );

    this.resultNumberPlaceHolder = XDOM.createElement(
      'DIV',
      null,
      'quickSearch-nrResults'
    );
    this.resultNumberPlaceHolder.setAttribute('data-hidden', 'false');

    this.quickSearchLoader = XDOM.createElement(
      'DIV',
      null,
      'quickSearch-loader'
    );
    this.quickSearchLoader.setAttribute('data-hidden', 'true');

    this.NrResultsCaptionPlaceHolder = XDOM.createElement(
      'DIV',
      null,
      'textResultFound quickSearch-nrResults-caption'
    );
    this.NrResultsCaptionPlaceHolder.appendChild(
      XDOM.createTextNode(getCapt('gQSEARCHRESULTS') + ':')
    );

    foInputLine.appendChild(selectField);
    foInputLine.appendChild(this.descriptionPlaceHolder);
    foInputLine.appendChild(this.resultNumberPlaceHolder);
    foInputLine.appendChild(this.quickSearchLoader);
    foInputLine.appendChild(this.NrResultsCaptionPlaceHolder);

    this.messagePlaceHolder = XDOM.createElement(
      'DIV',
      'quickSearch-message',
      'quickSearch-message'
    );

    this.panel.add(foInputLine, 'inputPart');
    this.panel.add(this.messagePlaceHolder, 'message');

    if (this.inline) {
      foInputLine.style.height = this.sizes.headerHeight;
    }

    this.isRendered = true;
    this.register();
  }

  if (!this.requery) {
    this.lastPreFix = this.getTargetValue();
    targetObj.value = this.lastPreFix;
  }

  QuickSearch.blockRequest = false;
  return;
};

QuickSearch.prototype.register = function() {
  // var qsId = this.qsId;
  // this.table.onClick = 	function(){QuickSearch.OnSelect(qsId,false);};
};

/**
 * static
 */
QuickSearch.delayedOpen = null;
QuickSearch.blockRequest = false;
QuickSearch.currentInstance = null;
QuickSearch.response = null;
// settings
QuickSearch.subSelectOnClient = 1000; //maximum aantal waarbinnen een subselectie op de client wordt gemaakt
QuickSearch.defaultDelay = 850;
QuickSearch.messageDelay = 2000;
QuickSearch.DefaultmaxResults = 50;
QuickSearch.lineHeight = 16;
QuickSearch.ResultlinesByRecord = [];
QuickSearch.ResultlinesByRecord[1] = 10;
QuickSearch.ResultlinesByRecord[2] = 8;
QuickSearch.ResultlinesByRecord[3] = 5;
QuickSearch.DefaultMinLength = [];
QuickSearch.DefaultMinLength[1] = 1;
QuickSearch.DefaultMinLength[2] = 1;
QuickSearch.DefaultMinLength[3] = 1;
QuickSearch.DefaultMinLength[4] = 2;
QuickSearch.DefaultMinLength[5] = 2;
QuickSearch.DefaultMinLength[6] = 2;
QuickSearch.DefaultMinLength[7] = 3;

QuickSearch.error = [];
QuickSearch.error['HeaderRequired'] = {
  caption: getCapt('gQSEARCHHEADERREQUIRED'),
  messageLevel: 'M'
};
QuickSearch.error['InputRequired'] = {
  caption: getCapt('gQSEARCHINPUTREQUIRED'),
  messageLevel: 'OK'
};
QuickSearch.error['InvalidInput'] = {
  caption: getCapt('gQSEARCHINVALIDINPUT'),
  messageLevel: 'E'
};
QuickSearch.error['SqlPrepareError'] = {
  caption: getCapt('gQSEARCHSQLPREPAREERR'),
  messageLevel: 'E'
};
QuickSearch.error['SqlFetchError'] = {
  caption: getCapt('gQSEARCHSQLFETCHERR'),
  messageLevel: 'E'
};
QuickSearch.error['ResultSetEmpty'] = {
  caption: getCapt('gQSEARCHRESULTSETEMPTY'),
  messageLevel: 'OK'
};

QuickSearch.prototype.registerTrigger = function() {
  if (!this.triggerFields && !this.triggerMacros) {
    return;
  }
  var triggers = this.triggerFields.split(' ');
  var foThis = this;
  for (var i = 0, l = triggers.length; i < l; i++) {
    var fsFieldId = triggers[i]; //var binnen scope in verband met doorgeven by value niet byref(pointer)
    const desc = `QuickSearch: ${this.macro} triggered by field change `;
    Trigger.register(
      fsFieldId,
      'QuickSearch-' + this.macro,
      'QuickSearch.openByTrigger' + this.macro,
      function() {
        QuickSearch.openByTrigger(fsFieldId, foThis);
      },
      desc
    );
  }
  var triggers = this.triggerMacros.split(' ');
  for (var i = 0, l = triggers.length; i < l; i++) {
    var macro = triggers[i]; //var binnen scope in verband met doorgeven by value niet byref(pointer)
    const desc = `QuickSearch: ${this.macro} triggered by macro :`;
    Trigger.register(
      macro,
      'QuickSearch-' + this.macro,
      'QuickSearch.openByTrigger' + this.macro,
      function() {
        QuickSearch.openByTrigger(macro, foThis, true);
      },
      desc
    );
  }
};

QuickSearch.prototype.sort = function(fieldName, sequence, caseSensitive) {
  this.sortField = fieldName;
  this.sortSequence = sequence;

  this.sortCaseSensitive = caseSensitive;
  this.request();
};

QuickSearch.prototype.resetSortButtons = function() {
  var foObj = null;
  for (var fieldName in this.sortfields) {
    foObj = XDOM.getObject(this.qsId + '-A-' + fieldName);
    if (foObj) {
      foObj.className = 'srtascavl pth-icon dataSectionButton';
      foObj.setAttribute('data-sort-active', 'false');
    }
    foObj = XDOM.getObject(this.qsId + '-D-' + fieldName);
    if (foObj) {
      foObj.className = 'srtdscavl pth-icon dataSectionButton';
      foObj.setAttribute('data-sort-active', 'false');
    }
  }
};
