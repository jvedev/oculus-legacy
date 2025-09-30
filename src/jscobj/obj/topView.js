/**
 * object voor het vastleggen van promptScherm instellingen
 * @param {HTMLElement} obj
 * @returns {TopView}
 */

function TopView(obj) {
  const paramObject = (obj.dataset.parmObject || '').replace(/\'/g, '"') || '{}';
  this.programName = obj.getAttribute('data-macro-name');
  this.programLocation = obj.getAttribute('data-macro-location');
  this.field = obj.getAttribute('data-to-id');
  this.targetField = this.field;
  this.titleFromTarget = obj.title;
  this.returnTargetFields = obj.getAttribute('data-return-fields') || '';
  this.recordNumber = obj.getAttribute('data-record-number');
  this.parmFields = obj.getAttribute('data-topview-parm-fields');
  this.parmNames = obj.getAttribute('data-topview-parm-names');
  this.environmentConditions  = obj.getAttribute('data-environment-conditions');
  this.requestFieldsArray = JSON.parse(paramObject);
  this.axis = obj.getAttribute('data-axis');
  this.clearFields = (obj.dataset.clearFields || '').split(' ');
  this.inSubfile = false;
  this.dom = {};


  if (this.returnTargetFields) {
    this.returnTargetFields = this.returnTargetFields.split(' ');
  }

  if (this.parmFields) {
    this.parmFields = this.parmFields.split(' ');
  }

  if (this.parmNames) {
    this.parmNames = this.parmNames.split(' ');
  }
}

TopView.currentInstance = null;
TopView.prototype.init = function() {};

TopView.prototype.getToIDField = function() {
  let field = XDOM.getObject(this.field);
  if(!field) {
    //field could be defined as subfile field but should be header field
    const headerField = this.field.replace(`_${this.recordNumber}`, '');
    field = XDOM.getObject(headerField);
  }
  return field;

}


TopView.prototype.close = function(returnValues = this.getReturnValues(), close = false) {
  let focusObj = null;
  let autoClose = SESSION.activePage.viewProperties.autoClose == 'true';

  SESSION.isSingleView = false;
  TopView.currentInstance = null;

  AJAX.Page.returnToCaller();
  TopView.closeTopViewFrame();

  let fieldObj =  this.getToIDField()

  if (autoClose || close) {
    const returnDomFields = this.setReturnValues(returnValues);
    if (hasAutoSubmitFields([...returnDomFields, fieldObj])) {
      Command.enter();
      return;
    }
    Trigger.fire(this.returnTargetFields.concat(this.clearFields));
    XDOM.setOldvalue(this.clearFields);
  }

  fieldObj = XDOM.getObject(fieldObj);

  if (Mask.isMask(fieldObj)) {
    focusObj = fieldObj.getAttribute('data-last-selected-part');
    if (focusObj) {
      XDOM.focus(focusObj);
    }
  } else {
    XDOM.focus(fieldObj);
  }
};

TopView.prototype.getReturnValues = function() {

  if (!SESSION.activePage.returnToCaller || !SESSION.activePage.data.headerData) {
    return; //==>>
  }

  //fieldNames in topView frame
  let returnFields = SESSION.activePage.returnToCaller;
  //fieldValues in topView frame
  let returnValues = SESSION.activePage.data.headerData;
  //returnFields in caller macro frame
  let targetFields = this.returnTargetFields;
  //return array with fields and values
  let returnFieldsArray = Array();

  //temporarily vars
  let fsValue = null;
  let fsField = null;

  //check if targetfields are definied
  if(!targetFields){
    return [];
  }

  for (var i = 0, l = returnFields.length; i < l; i++) {
    //check if value exists in response
    if ((fsValue = returnValues[returnFields[i]])) {
      //check if target field exists
      if ((fsField = targetFields[i])) {
        //update return array
        returnFieldsArray[i] = {
          targetObject: fsField,
          targetValue: fsValue
        };
      }
    }
  }

  return returnFieldsArray;
};

TopView.prototype.setReturnValues = function(returnParams) {
  var returnArray = returnParams;
  var targetObject = null;
  var targetValue = null;

  var changedFields = [];

  //if(this.recordNumber){
  //  this.adaptreturnTargetFields();
  //}

  if (!returnParams) {
    return changedFields;
  } // -->

  for (var i = 0, l = returnArray.length; i < l; i++) {
    targetObject = XDOM.getObject(returnArray[i].targetObject);
    targetValue = returnArray[i].targetValue;
    //Subfile.setChanged(this.recordNumber);

    if (targetObject && targetValue) {
      XDOM.setObjectValue(targetObject, targetValue);
      changedFields.push(targetObject)
    }
  }
  //clear values if any
  XDOM.clearFields(this.clearFields);
  resetMessage();
  return changedFields;
};

TopView.prototype.paramStringPart = function(field, index) {
  let fieldName = field.field,
    trigerFieldName = 'trigger_' + fieldName,
    recordCursor = parseInt(this.recordNumber) - 1,
    fieldObject = XDOM.getObject(fieldName) || XDOM.getObject(trigerFieldName),
    fieldValue = XDOM.getObjectValue(fieldObject),
    ret = 'parmValue' + (index + 1) + '=';

  if (fieldObject && !Validate.test(fieldObject)) {
    throw new Error('validation');
  }
  switch (field.location) {
    case 'headerData':
      fieldValue = fieldValue || SESSION.activeData.headerData[field.field];
      break;
    case 'subfileData':
      fieldName = field.field + '_' + this.recordNumber;
      trigerFieldName = trigerFieldName + '_' + this.recordNumber;
      (fieldObject = XDOM.getObject(fieldName) || XDOM.getObject(trigerFieldName)),
        (fieldValue = XDOM.getObjectValue(fieldObject) || SESSION.activeData.subfileData[recordCursor][field.field]);
      break;
    case 'directValue':
      dataValue = field.value;
      break;
    default:
      //comst value
      fieldValue = fieldObject.getAttribute('data-const-value');
  }

  return ret + encodeURIComponent(fieldValue);
};

TopView.prototype.buildNewParameterString = function() {
  if (!this.parmFields || this.parmFields.length == 0) {
    return;
  }

  let request =
    '&parmLength=' +
    this.parmFields.length +
    '&' +
    this.parmNames.map((value, index) => 'parmName' + (index + 1) + '=' + value).join('&') +
    '&' +
    this.requestFieldsArray.map((value, index) => this.paramStringPart(value, index)).join('&');
  return request;
};

TopView.prototype.buildParameterString = function() {
  if (this.requestFieldsArray) {
    return this.buildNewParameterString();
  }
  var parmFields = this.parmFields || null;
  var parmNames = this.parmNames || null;
  var parmObject = null;
  var parmObjName = null;
  var parmName = null;
  var parmValue = null;
  var parmLength = 0;
  var parmNumber = 0;
  var parmString = '';

  if (parmFields && parmFields.length > 0) {
    parmLength = parmFields.length;

    parmString += '&parmLength=' + parmLength;

    for (var count = 0, totalCount = parmFields.length; count < totalCount; count++) {
      if (parmFields[count]) {
        parmObjName = parmFields[count].trim();
      }

      if (parmNames[count]) {
        parmName = parmNames[count].trim();
      }

      parmNumber = count + 1;
      parmObject = XDOM.getObject(parmObjName);

      if (!parmObject) {
        SCOPE.main.Dialogue.alert(getCapt('gSCH001') + parmName + getCapt('gSCH002'));
        throw new Error('invalid');
        break;
      }
      if (!Validate.test(parmObject)) {
        throw new Error('invalid');
      }

      parmValue = XDOM.getObjectValue(parmObject).trim();

      if (count > 0) {
        parmString += '&';
      }

      parmString += '&parmName' + parmNumber + '=' + parmName + '&parmValue' + parmNumber + '=' + parmValue;
    }
  }

  return parmString;
};


/**
 * Opent het zoek venster
 *
 * @returns
 */

TopView.openDelayed = function() {
  var foTopView = TopView.currentInstance;

  TopView.currentInstance = null;
  foTopView.open();
};

TopView.prototype.open = function() {
  var params = '', url = '';

  if (Mask.isMask(GLOBAL.eventSourceElement)) {
    Mask.returnValues(GLOBAL.keydownObject);
  }

  if (SESSION.submitInProgress) {
    return;
  }

  if (TopView.currentInstance) {
    return;
  }
  TopView.currentInstance = this;

  if (SESSION.submitInProgress) {
    setTimeout(TopView.openDelayed, 20);
    XDOM.cancelEvent();
    return true;
  }

  KeepAlive.cancel(); // stopt de keep alive job om dubbele requests te voorkomen
  QuickSearch.cancelDelayedOpen();

  try {
    params = this.buildParameterString() || '';
  } catch (e) {
    TopView.currentInstance = null;
    return;
  }

  SESSION.submitInProgress = true;

  SESSION.activePage.serviceIsActive = true; // Service Function activated

  closeAllModalObjects();

  if (!PFMVAR['*TOPVIEW']) {
    PFMVAR['*TOPVIEW'] = {};
  }

  protectPage();

  url =
    SESSION.alias +
    '/' +
    this.programLocation +
    '/ndmctl/' +
    this.programName +
    '.ndm/main?PFMJOBID=' +
    SESSION.jobId +
    params;

  // wizard
  if(GLOBAL.eventSourceElement.dataset.eventClass === 'Wizard'){
    url += '&InitWizard=true&Wizard=true&wizardCode=' + GLOBAL.eventSourceElement.dataset.wizardName;
  }else{ //normal topview
    url += '&TopView=true';
  }

  if(this.environmentConditions){
    url +=  '&EnvConditions='+ encodeURIComponent(this.environmentConditions) ;
  }

  MAIN.NAV.Session.currentInstance.checkStatus();
  AJAX.Page.setCallerCaller(SESSION.activePage.macroProperties.cacheKey);
  SESSION.isSingleView = true;
  AJAX.get(url, AJAX.handleResponse);

  return false;
};

TopView.prototype.getURL = function() {
  return (
    SESSION.alias + '/' + this.programLocation + '/ndmctl/' + this.programName + '.ndm/main?PFMJOBID=' + SESSION.jobId
  );
};

TopView.addNavigationToFrame = function(screenType) {
  if (!SESSION.isSingleView) {
    return;
  }

  var TopViewScreen = SESSION.activeFrame.document.getElementsByTagName('body')[0];
  var exitBtn = XDOM.createElement('div', 'CANCEL', 'btn28px floatRight');

  TopViewScreen.setAttribute('data-topView-obj', 'true'); //voor css selectors

  exitBtn.setAttribute('data-title-origin', '*LBL');
  exitBtn.setAttribute('data-title-variable', 'cCANCEL_TTL');
  exitBtn.setAttribute('data-wscmd-type', '*CNL');

  if (screenType !== '*SCH') {
    exitBtn.setAttribute('data-screen-type', '*TOPVIEW');
  }

  TopViewScreen.appendChild(exitBtn);
};

TopView.closeTopViewFrame = function() {
  SESSION.activePage.serviceIsActive = false; // Service Function deactivated
  if (PFMVAR['*TOPVIEW']) {
    PFMVAR['*TOPVIEW'] = null;
  }
  showFrame(SESSION.activePage.screenType);
  setFrames('*PGM');
  TopView.topViewBlocker(false);
  SESSION.isSingleView = false;
  SESSION.subScope = null;
  setTitle();
};

/**
 * Sluit het zoek venster Als op het ontvangende veld een AUTOSBM is gedefinieerd dan wordt deze uitgevoerd.
 *
 * @param values
 *          waarde van een eventueel gekozen sleutel
 * @param returnFields
 *          veld waarin de waarde terecht moet komen
 * @param toId
 *          veld waarop de focus terecht moet komen
 * @returns {void}
 */
TopView.close = function(values) {

  // Close all 'singleView' (lol) windows
  window.SCOPE.main.Dialogue.deleteModalGroup(['singleView']);

  let returnValues;

  returnValues = values;

  if (TopView.currentInstance) {
    TopView.currentInstance.close(returnValues);
  }
  Wizard.close();
};

TopView.handleOnClick = function() {
  var foTopView = new TopView(GLOBAL.eventSourceElement);
  foTopView.open();
  return true;
};

TopView.topViewBlocker = function(fbBlock) {
  var foBlocker = XDOM.getObject('topViewBlocker');

  if (foBlocker) {
    if (fbBlock) {
      foBlocker.setAttribute('data-blocker', 'on');
    } else {
      foBlocker.setAttribute('data-blocker', 'off');
    }
  }
};

/**
 * Iterates over all dom elements in scope, having data-macro-desc as an attribute and sets the title accordingly.
 */
TopView.prepareDom = function() {
  //query the relevant dom objects destructure in an array
  const topViewIcons = [...XDOM.queryAll('[data-macro-desc]')];

  //iterate over all elements
  topViewIcons.forEach(icon=>{
    if(!icon.dataset.macroDesc) return;
    //set the title
    icon.title = icon.dataset.macroDesc;
  })
};