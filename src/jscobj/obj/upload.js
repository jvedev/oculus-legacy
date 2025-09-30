/*
ID: het id van de placeholder DIV
enabled javascript true of false waarde
allow:
         *ALL		default, alles toegestaan
         *IMAGE	jpg, jpeg, png, gif, tiff
         *OFFICE 	doc, docx, xls, xlsx, ppt, pptx
         *CSV	Csv
*/

Upload = function(obj) {
  this.baseId = obj.getAttribute('data-upload-base-id');
  this.dom = {};
  this.dom.input = XDOM.getObject(this.baseId);
  this.dom.clearButton = XDOM.getObject(this.baseId + '_DEL');
  this.dom.selectButton = XDOM.getObject(this.baseId + '_SCH');
  this.dom.display = XDOM.getObject(this.baseId + '_DSP');
  this.dom.orgFile = XDOM.getObject(this.baseId + '_ORG');
  this.statusFieldId = this.dom.selectButton.getAttribute('data-upload-status-field');
  this.filenameFieldId = this.baseId;
  this.dom.statusField = XDOM.getObject(this.statusFieldId);
  this.allow = this.dom.selectButton.getAttribute('data-upload-filetype');
  this.isAutoSubmit = this.dom.input.getAttribute('data-autosubmit') === 'true';
  this.orgStatus = this.dom.statusField.value;
  this.uploadedFileName = '';
};

Upload.filter = {};
Upload.filter['*OFFICE'] =
  '.docx, .docm, .dotx, .dotm, .xlsx, .xlsm, .xltx, .xltm, .xlsb, .xlam, .pptx, .pptm, .potx, .potm, .ppam, .ppsx, .ppsm, .sldx, .sldm, .thmx, .pdf, .xls, .doc, .ppt, .xps';
Upload.filter['*DATA'] = '.csv, .xlm';
Upload.filter['*WORD'] = '.docx, .docm, .dotx, .dotm, .doc';
Upload.filter['*EXCEL'] = '.xlsx, .xlsm, .xltx, .xltm, .xlsb, .xlam, .xls';
Upload.filter['*XML'] = '.xml';
Upload.filter['*CSV'] = '.csv';
Upload.filter['*PDF'] = '.pdf';
Upload.filter['*IMAGE'] = 'image/*';
Upload.filter['*ALL'] = '*.*';

/**
 * Enumeratie om status weer te geven:
 * B, blank: veld was leeg en veld is leeg
 * S, select: veld was leeg en veld is gevuld
 * C, changed: veld was gevuld en veld is gevuld met een andere waarde
 * D, delete:  veld was gevuld en veld is leeg
 * P, processed Veld was gevuld en veld is verwerkt op server
 */
Upload.state = {
  blank: 'B',
  selected: 'S',
  changed: 'C',
  deleted: 'D',
  processed: 'P',
  error: 'E'
};

/**
 *
 **/
/*Upload.update = function(obj){
  var pageObjects = XDOM.queryAll('[data-upload-status-field]');
  var uploadObject = null;

  for(var i=0,l=pageObjects.length;i<l;i++){
    uploadObject = new Upload(pageObjects[i]);
    uploadObject.update();
  }
};*/

Upload.prepareDom = function() {
  var pageObjects = XDOM.queryAllScope('[data-upload-status-field]:not([data-component])');
  var uploadObject = null;

  for (var i = 0, l = pageObjects.length; i < l; i++) {
    uploadObject = new Upload(pageObjects[i]);
    uploadObject.prepare();
  }
};

Upload.update = function() {
  var statusFieldObjects = XDOM.queryAllScope('[data-upload-status-field]:not([data-component])');
  var uploadInputObjects = XDOM.queryAllScope('[data-upload-inputfield]:not([data-component])');

  var statusObject = null;
  var inputObject = null;
  var uploadObject = null;

  for (var i = 0, l = uploadInputObjects.length; i < l; i++) {
    inputObject = uploadInputObjects[i];
    uploadObject = new Upload(inputObject);
    uploadObject.dom.input.value = '';
    XDOM.addEventListener(inputObject, 'change', Upload.onSelect);
  }

  for (var i = 0, l = statusFieldObjects.length; i < l; i++) {
    statusObject = new Upload(statusFieldObjects[i]);
    statusObject.update();
  }

  // if (uploadInputObjects.length > 0 && !SESSION.stack.currentMacro.uploadCredentialsChecked) {
  //   Upload.identifyToServer();
  // }
};

Upload.handleClick = function() {
  if (XDOM.GLOBAL.getAttribute('data-upload-select')) {
    Upload.openFile();
    return true;
  }
  if (XDOM.GLOBAL.getAttribute('data-upload-clear')) {
    Upload.clear();
    return true;
  }
  return false;
};

Upload.prototype.prepare = function() {
  this.dom.selectButton.setAttribute('data-upload-select', 'true');
  this.dom.clearButton.setAttribute('data-upload-clear', 'true');
  this.dom.input.setAttribute('data-upload-inputfield', 'true');
  this.dom.display.setAttribute('data-upload-hasFile', 'false');
  this.dom.display.innerHTML = getCapt('gNOFILESELECTED');

  this.orgFileName = this.dom.orgFile.value;

  this.setFilter();
};

Upload.prototype.update = function() {
  this.orgStatus = SESSION.activeData.headerData[this.statusFieldId];
  if (!this.orgStatus) {
    this.orgStatus = Upload.state.blank;
  }

  this.status = this.orgStatus;
  switch (this.status) {
    case Upload.state.blank:
    case Upload.state.processed:
    case Upload.state.deleted:
      this.dom.orgFile.value = '';
      this.dom.input.value = '';
      this.dom.clearButton.style.display = 'none';
      this.orgFileName = getCapt('gNOFILESELECTED');
      this.status = Upload.state.blank;
      break;
    case Upload.state.error:
    case Upload.state.changed:
      this.status = Upload.state.selected;
      break;
    default:
      this.dom.clearButton.style.display = 'block';
      break;
  }

  if (this.orgFileName) {
    this.dom.display.innerHTML = this.orgFileName;
  }

  this.dom.statusField.value = this.status;
  this.orgStatus = this.status;
};

Upload.openFile = function(e) {
  XDOM.cancelEvent(e);
  var uploadObject = new Upload(GLOBAL.eventSourceElement);
  XDOM.invokeClick(uploadObject.dom.input);
  return false;
};

Upload.clear = function(e) {
  XDOM.cancelEvent(e);
  var uploadObject = new Upload(GLOBAL.eventSourceElement);
  uploadObject.clear();
};

Upload.onSelect = function(e) {
  XDOM.getEvent(e);
  var uploadObject = new Upload(GLOBAL.eventSourceElement);
  uploadObject.onSelect();
};

Upload.prototype.setFilter = function() {
  var allow = null;
  var filter = null;

  allow = this.dom.selectButton.getAttribute('data-upload-filetype-field');
  if (allow) {
    filter = SESSION.activeData.headerAttributes[allow];
    if (filter) {
      XDOM.setAttribute(this.dom.input, 'accept', filter);
      return;
    }
  }

  allow = this.dom.selectButton.getAttribute('data-upload-filetype');
  if (!allow) {
    return;
  }

  if (allow.indexOf('*') > -1) {
    filter = Upload.filter[this.allow];
    if (!filter) {
      setMessage('F', 'onbekende file definitie voor upload: ' + allow);
      return;
    }
  } else {
    filter = allow;
  }

  if (filter) {
    XDOM.setAttribute(this.dom.input, 'accept', filter);
  }
  return;
};

Upload.prototype.clear = function() {
  this.dom.display.setAttribute('data-upload-hasFile', 'false');
  this.dom.input.value = '';
  this.dom.clearButton.style.display = 'none';
  this.dom.display.innerHTML = getCapt('gNOFILESELECTED');

  if (this.orgStatus == Upload.state.blank) {
    this.status = Upload.state.blank;
  } else {
    this.status = Upload.state.deleted;
  }
  this.dom.statusField.value = this.status;
  this.dom.orgFile.value = '';
};

Upload.prototype.onSelect = function() {
  var fsPath = '';
  var faPath = null;
  fsPath = this.dom.input.value;
  if (fsPath != '') {
    this.dom.display.setAttribute('data-upload-hasFile', 'true');
    faPath = fsPath.split('\\');
    fsPath = faPath[faPath.length - 1];
    this.dom.display.innerHTML = fsPath;
    this.dom.orgFile.value = fsPath;
    if (this.orgStatus == Upload.state.blank) {
      this.status = Upload.state.selected;
    } else {
      this.status = Upload.state.changed;
    }
    this.dom.statusField.value = this.status;

    this.dom.clearButton.style.display = '';

    if (this.isAutoSubmit) {
      Command.enter();
    }
  } //else{
  //this.clear();
  //}
};

Upload.setFormEncType = function(command) {
  var inputObject = null;
  var uploadObject = null;
  var uploadInputObjects = XDOM.queryAllScope('[data-upload-inputfield]');

  if (command != 'ACCEPT' && command != 'ENTER') {
    for (var i = 0, l = uploadInputObjects.length; i < l; i++) {
      inputObject = uploadInputObjects[i];
      uploadObject = new Upload(inputObject);
      uploadObject.dom.input.value = '';
      uploadObject.dom.clearButton.style.display = 'none';
    }

    SESSION.activeForm.enctype = 'application/x-www-form-urlencoded';
    SESSION.activeForm.encoding = 'application/x-www-form-urlencoded';
    return;
  }

  if (XDOM.queryScope("[data-upload-hasFile='true']")) {
    SESSION.activeForm.enctype = 'multipart/form-data';
    SESSION.activeForm.encoding = 'multipart/form-data';
  } else {
    SESSION.activeForm.enctype = 'application/x-www-form-urlencoded';
    SESSION.activeForm.encoding = 'application/x-www-form-urlencoded';
  }
};

Upload.resetFormEncType = function() {
  SESSION.activeForm.enctype = 'application/x-www-form-urlencoded';
  SESSION.activeForm.encoding = 'application/x-www-form-urlencoded';
};

// /**
//  * IE11 fix bij veranderen enctype/encoding
//  * raakt hij de browser zijn credentials kwijt
//  * pom-1413
//  */
// Upload.identifyToServer = function() {
//   var fdTIME = new Date();
//   var TMSTM = fdTIME.getTime();
//   var fsDIRPT =
//     SESSION.activePage.pageUrl +
//     '?JOBNR=' +
//     SESSION.jobKey +
//     '&PFMFILID=' +
//     SESSION.enviroment +
//     '&TMSTM=' +
//     TMSTM +
//     '&CheckCredentials=true';
//   if (SESSION.submitInProgress) {
//     setTimeout(Upload.identifyToServer, 200);
//     return;
//   }
//   SESSION.submitInProgress = true;

//   advAJAX.get({
//     url: fsDIRPT,
//     onError: function(obj) {
//       console.log('Identify failed');
//     },
//     onSuccess: function(obj) {
//       SESSION.stack.currentMacro.uploadCredentialsChecked = true;
//       SESSION.submitInProgress = false;
//       console.log(SESSION.submitInProgress);
//     },
//     onRetry: function(obj) {
//       console.log('Identify retry');
//     }
//   });
// };
