const drag = {};

(function() {
  let type = '',
    allowDrop = '';
  (dropAction = ''), (objToMove = ''), (mouseStartX = 0), (mouseStartY = 0), (objToMoveX = 0), (objToMoveY = 0);

  function move() {
    const moveX = GLOBAL.eventObject.clientX - mouseStartX,
      moveY = GLOBAL.eventObject.clientY - mouseStartY;
    if (!objToMove) {
      return;
    }
    objToMove.style.left = objToMoveX + moveX + 'px';
    objToMove.style.top = objToMoveY + moveY + 'px';
  }

  function createDropZone() {
    if (type != 'panel') {
      return;
    }
    let dropzone = XDOM.getObject('propPanel');
    const dtaDiv = XDOM.getObject('DTADIV');
    zIndex = parseInt(objToMove.style.zIndex) - 1;
    if (!dropzone) {
      (dropzone = XDOM.createElement('DIV', 'propPanel')), dtaDiv.appendChild(dropzone);
    }
    dropzone.style.zIndex = zIndex;
  }

  function start(e) {
    XDOM.getEvent(e);
    type = GLOBAL.dataset.dragtype;
    allowDrop = GLOBAL.dataset.allowDropOn;
    objToMove = XDOM.getObject(GLOBAL.dataset.dragObject);
    docker.unDock(objToMove);
    mouseStartX = GLOBAL.eventObject.clientX;
    mouseStartY = GLOBAL.eventObject.clientY;
    objToMoveX = objToMove.offsetLeft;
    objToMoveY = objToMove.offsetTop;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(document.createElement('div'), 0, 0);
    createDropZone();
  }

  function over(e) {
    XDOM.getEvent(e);
    move();
    docker.show(objToMove);
    const dropAllowedFor = (GLOBAL.dataset.allowDrop || '').split(',');
    if (allowDrop == '*ALL' || dropAllowedFor.indexOf(type) > -1) {
      e.preventDefault();
    }
  }

  function cleanup() {
    XDOM.cancelEvent();
    XDOM.removeDOMObject('propPanel');
    objToMove = null;
  }

  function drop(e) {
    XDOM.getEvent(e);
    docker.dock(objToMove);
    cleanup();
  }
  this.cleanup = cleanup;
  this.drop = drop;
  this.over = over;
  this.start = start;
}.apply(drag));
