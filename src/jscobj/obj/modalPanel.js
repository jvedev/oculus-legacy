var ModalPanel = {};
(function() {
  let closeHandler = null;
  let parentObject = null;
  
  function open(content, onclose, parent) {
    let somethingToFocus = null,
    bodyBlocker = parent || XDOM.getObject('bodyBlocker');
    parentObject = parent;
    closeHandler = onclose;

    bodyBlocker.innerHTML = content;
    bodyBlocker.dataset.hidden = 'false';
    bodyBlocker.setAttribute('data-event-class', 'ModalPanel');
    somethingToFocus = bodyBlocker.querySelector('[role="button"]');
    if (somethingToFocus) {
      somethingToFocus.focus();
    }
    return bodyBlocker;
  }
  function click() {
    if (closeHandler) {
      closeHandler();
    }
    let bodyBlocker = parentObject || XDOM.getObject('bodyBlocker');
    bodyBlocker.innerHTML = '';
    bodyBlocker.dataset.hidden = 'true';
    parentObject = null;
  }
  function keydown(ev) {
    switch (ev.keyCode) {
      case keyCode.F12:
      case keyCode.escape:
        click();
        break;
    }
  }

  this.open = open;
  this.click = click;
  this.close = click;
  this.keydown = keydown;
}.apply(ModalPanel));
