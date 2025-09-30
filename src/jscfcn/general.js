/**
 * controleerd op het bestaan van een variabele
 * @param name variabele naam als string
 * @param windowName optioneel referentie naar window
 * @returns boolean
 */
function isSet(name, windowName) {
  if (name == null || (isNaN(name) && (!name || name == ''))) {
    return;
  } //-->
  var fsName = name.toString();
  var faParts = fsName.split('.');
  fsName = faParts[0];
  for (var l = faParts.length, i = 0; i < l; i++) {
    if (i > 0) {
      fsName += '.' + faParts[i];
    }
    if (!isSetTest(fsName, windowName)) {
      return false;
    }
  }
  return true;
}

/**
 * controleerd op het bestaan van een variabele
 * @param name variabele naam als string
 * @param windowName optioneel referentie naar window
 * @returns boolean
 */
function isSetTest(name, windowName) {
  var fsTEST = 'typeof ' + name + "!='undefined'";
  var foDOC = window;
  if (windowName) {
    foDOC = windowName;
  }
  try {
    if (foDOC.eval(fsTEST)) {
      return true;
    }
  } catch (e) {}
  return false;
}

function hasValue(fo) {
  return !(typeof fo == 'undefined' || fo == null);
}

var blockedKeyCodes = [
  123, //F12
  116, //F5
  112, //F1
  34, //page up
  33, //page down
  8 //backspace
];

var blockedShiftKeyCodes = [
  118, // shift F7
  119, // shift F8
  120, // shift F9
  121 // shift F10
];
var blockedAltKeyCodes = [
  keyCode.k1,
  keyCode.k2,
  keyCode.k3,
  keyCode.k4,
  keyCode.k5,
  keyCode.k6,
  keyCode.k7,
  keyCode.k8,
  keyCode.k9,
  keyCode.home,
  keyCode.f,
  keyCode.a,
  keyCode.h,
  keyCode.q,
  keyCode.p,
  keyCode.w,
  keyCode.m,
  keyCode.n,
  keyCode.s,
  keyCode.arrowLeft,
  keyCode.arrowRight
];

var specialBlockedKeyCodes = new Array();
specialBlockedKeyCodes[8] = {
  rejectedFields: [],
  acceptedFields: ['text', 'password', 'textarea']
};
specialBlockedKeyCodes[33] = {
  rejectedFields: ['textarea'],
  acceptedFields: ['ALL']
};
specialBlockedKeyCodes[34] = {
  rejectedFields: ['textarea'],
  acceptedFields: ['ALL']
};
OCULUS.checkKeyCode = function(e) {
  XDOM.getEvent(e);

  //console.log("KEYCODE: "+e.keyCode + " CHAR CODE: "+GLOBAL.charCode);

  if (GLOBAL.eventObject) {
    if (GLOBAL.eventObject.altKey && 
      (e.keyCode<keyCode.numpad0 && e.keyCode>keyCode.numpad9)
      ) {
      GLOBAL.eventObject.cancel();
      return false;
    }

    if (GLOBAL.eventObject.shiftKey && blockedShiftKeyCodes.indexOf(GLOBAL.charCode) >= 0) {
      GLOBAL.eventObject.cancel();
      return false;
    }

    if (blockedKeyCodes.indexOf(GLOBAL.charCode) >= 0) {
      if (GLOBAL.pressedBlockedKey != GLOBAL.charCode) {
        GLOBAL.pressedBlockedKey = GLOBAL.charCode;
      }

      if (specialBlockedKeyCodes[GLOBAL.charCode]) {
        if (specialBlockedKeyCodes[GLOBAL.charCode].rejectedFields.indexOf(GLOBAL.eventSourceElement.type) >= 0) {
          GLOBAL.eventObject.cancel();
          return false;
        }

        if (
          specialBlockedKeyCodes[GLOBAL.charCode].acceptedFields.indexOf(GLOBAL.eventSourceElement.type) >= 0 ||
          specialBlockedKeyCodes[GLOBAL.charCode].acceptedFields.indexOf('ALL') >= 0
          || GLOBAL.eventSourceElement.tagName.indexOf('-') > -1 //webcomponent
        ) {
          return true;
        }
      }
      GLOBAL.eventObject.cancel();
      return false;
    }
    return true;
  }
  return true;
};

OCULUS.removeKeyCode = function(e) {
  XDOM.cancelEvent();
  GLOBAL.pressedBlockedKey = null;
  return;
};
/**
 * combines two objects
 * @param {object} obj1 
 * @param {object} obj2 
 */
function merge(obj1, obj2) {
  var newObj = {}
  for (var key in obj1) {
    newObj[key] = obj1[key];
  }
  for (var key in obj2) {
    newObj[key] = obj2[key];
  }
  return newObj;
}

function minVersion(version){
  return (OCULUS.navigatorVersion && OCULUS.navigatorVersion >= version);
}

function getVersion() {
    if (OCULUS.navigatorVersion) {
        return OCULUS.navigatorVersion;
    }
    return '*7A';
}


function isHybrid(){
  return (window.top.pfmSystemType=='hybrid');
}

function userOrDevTitle() {
  if (OCULUS.debugMode) {
    let ret = arguments[0] || ''; //let op arguments is geen array dus gen map of join gebruiken
    for (let i = 1, l = arguments.length; i < l; i++) {
      ret += ' - ' + arguments[i];
    }
    return ret;

    return arguments.join('-');
  }
  return arguments[0] || '';
}

function screenType(){
  return SESSION.activePage.screenType;
}
