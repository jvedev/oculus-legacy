/* global SESSION */

function Trigger(functionPointer) {
  this.functionPointer = functionPointer;
}
//placeHolder to Log the trigger to;
Trigger.log = "# Trigger sequence \n\n";
/**
 * registratie van triggers
 * @param {type} invoker
 * @param {type} caller
 * @param {type} id
 * @param {function} functionPointer
 * @returns {undefined}
 */
Trigger.register = function(invoker, id, caller, functionPointer, description) {
  if (!SESSION.activePage.triggers[invoker]) {
    SESSION.activePage.triggers[invoker] = {};
  }
  if (!SESSION.activePage.triggers[invoker][caller]) {
    SESSION.activePage.triggers[invoker][caller] = {};
  }
  const executeTrigger = () => {
    functionPointer();
    let value = XDOM.getObjectValue(invoker) || '';
    if(value){
      value =  `value: "${value}"`;
    }
    Trigger.log += `${description} ${invoker} ${value}\n`;
  };
  SESSION.activePage.triggers[invoker][caller].execute = executeTrigger;
  SESSION.activePage.triggers[invoker][caller].id = id;
};

/**
 * vuurt alle triggers af van alle velded die worden doorgegeven
 * trigger fucties worden eerst verzameld waarbij er vanuitgegaan dat het object
 * waar de trigger van is en de functie naam uniek is om te voorkomen dat fucties per object meerdere malen wordt aangesproken
 * @param fields {array} van id van velden als string
 * @returns {boolean} al dan geen triggers afgevuurd
 */
Trigger.fire = function(fields) {
  var triggersTofire = {};
  var triggerKey = '';
  var result = false;
  var triggers = null;
  var triggerObj = null;

  if (!fields) {
    return false;
  }
  //verzamel alle geldige triggers
  //omdate het kan zijn dat meerdere velden het zelfde object trigeren worden deze eerst verzameld
  //zodat elke trigger maximaal 1 keer wordt geexicuteerd
  for (var i = 0, l = fields.length; i < l; i++) {
    if(!fields[i]){ //fields can be an empty string
      continue;
    }
    triggerObj = XDOM.getObject(fields[i]);
    if (triggerObj && 'value' in triggerObj) {
      if (!XDOM.fieldIsChanged(fields[i])) {
        continue;
      }
    }

    triggers = SESSION.activePage.triggers[fields[i]];
    for (var s in triggers) {
      triggerKey = s + ':' + triggers[s].id;
      triggersTofire[triggerKey] = triggers[s].execute;
    }
  }
  for (var t in triggersTofire) {
    triggersTofire[t]();
    result = true;
  }

  return result;
};

Trigger.hasTriger = function(obj) {
  if (SESSION.activePage.triggers[obj.id]) {
    return true;
  }
  return false;
};

Trigger.setAxisField = function(obj) {
  const srcDiv =  XDOM.getObject('SCRDIV');
  var fsName = 'trigger_' + obj.getAttribute('data-axis');
  var fsValue = XDOM.getObjectValue(obj);

  var foInput = XDOM.getObject(fsName);
  if (foInput) {
    XDOM.setOldvalue(foInput);
    foInput.value = fsValue;

    return;
  }

  foInput = XDOM.createElement('input', fsName);
  foInput.setAttribute('name', fsName);
  foInput.setAttribute('type', 'hidden');
  foInput.setAttribute('value', fsValue);
  foInput.setAttribute('data-clear-after-submit', 'true');
  srcDiv.appendChild(foInput);
  return;
};

Trigger.fillIPMF = function(recordNr) {
  var macroURL = SESSION.stack.currentMacro.getCurrentUrl();
  var impfURL =
    macroURL +
    '?SubmitForIPMF=true' +
    '&SubmitFromView=true' +
    '&SelectedSubfileRecord=' +
    recordNr;

  advAJAX.get({
    url: impfURL,
    onError: function(response) {},
    onSuccess: function(response) {},
    onRetry: function(response) {}
  });

  return;
};
