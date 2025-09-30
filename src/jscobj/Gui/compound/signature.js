GUI.Signature = function(obj) {
  this.baseId = obj.id;
  this.dom = {};
  this.canvasWrapper = null;
  this.canvasObj = null;
  this.buttonsBar = null;
  this.clearButton = null;
  this.submitButton = null;
  this.isProtected = null;
  this.buttonsBarHeight = 25;
  this.hasDrawn = false;

  this.returnField = null;
  this.backgroundImage = null;

  this.dateField = null;
  this.timeField = null;
  this.cityField = null;
  this.nameField = null;

  this.conditionField = null;
  this.conditionAttribute = null;

  this.referenceLabel = null;
  this.referenceField = null;

  this.position = {
    xPos: obj.getAttribute('data-element-xpos'),
    yPos: obj.getAttribute('data-element-ypos')
  };
  this.dimentions = {
    width: obj.getAttribute('data-element-xsize'),
    height: obj.getAttribute('data-element-ysize')
  };
};

GUI.Signature.instances = [];
GUI.Signature.currentInstanceId = null;

GUI.Signature.Drawer = {
  isDrawing: false,
  canvasId: null,
  touchstart: function(coors, context) {
    context.beginPath();
    context.moveTo(coors.x, coors.y);
    this.isDrawing = true;
  },
  touchmove: function(coors, context, obj) {
    if (this.isDrawing) {
      context.lineTo(coors.x, coors.y);
      context.stroke();
      if (obj && obj.hasDrawn == false) {
        obj.hasDrawn = true;
      }
    }
  },
  touchend: function(coors, context) {
    if (this.isDrawing) {
      this.touchmove(coors, context);
      this.isDrawing = false;
    }
  },
  mousedown: function(coors, context) {
    context.beginPath();
    context.moveTo(coors.x, coors.y);
    this.isDrawing = true;
  },
  mousemove: function(coors, context, obj) {
    if (this.isDrawing) {
      context.lineTo(coors.x, coors.y);
      context.stroke();
      if (obj && obj.hasDrawn == false) {
        obj.hasDrawn = true;
      }
    }
  },
  mouseup: function(coors, context) {
    if (this.isDrawing) {
      this.mousemove(coors, context);
      this.isDrawing = false;
    }
  },
  mouseout: function(coors, context) {
    if (this.isDrawing) {
      this.mousemove(coors, context);
      this.isDrawing = false;
    }
  }
};

GUI.Signature.prototype.setVars = function() {
  var obj = XDOM.getObject(this.baseId);
  if (!obj) {
    return;
  }

  this.timeField = obj.getAttribute('data-signature-time')  || ''
  this.dateField =
    SESSION.activePage.headerData[obj.getAttribute('data-signature-date-field')] ||
      obj.getAttribute('data-signature-date')  || '';


  this.cityField =
    SESSION.activePage.headerData[obj.getAttribute('data-signature-city')] || '';

  this.nameField =
    SESSION.activePage.headerData[obj.getAttribute('data-signature-name')] || '';

  this.signatureUrl =
    SESSION.activePage.headerData[
      obj.getAttribute('data-signature-return-field')
    ] || '';

  this.conditionField =
    SESSION.activePage.headerData[obj.getAttribute('data-condition-field-id')] || '';

  this.conditionAttribute = obj.getAttribute('data-condition-attribute') || '';

  this.returnField = obj.getAttribute('data-signature-return-field')  || '';

  this.referenceLabel = getCaption(
    obj.getAttribute('data-signature-reference-label'), ''
  )
  this.referenceField =
    SESSION.activePage.headerData[
      obj.getAttribute('data-signature-reference-field')
    ] || '';

  this.isProtected = obj.getAttribute('data-protected');
  XDOM.createInputField(this.returnField , this.signatureUrl);
  return;
};

/**
 * voorbereiding van het dom object het zetten van event Handlers
 */
GUI.Signature.prepareDom = function() {
  var pageSignatureObjects = XDOM.queryAllScope('.signature-place-holder');
  var signatureObj = null;

  for (var i = 0, l = pageSignatureObjects.length; i < l; i++) {
    signatureObj = new GUI.Signature(pageSignatureObjects[i]);
    signatureObj.setDimentions();
    signatureObj.renderCanvas();
    signatureObj.renderButtons();
    signatureObj.setEvents();
    signatureObj.setBackground('#f2f2f2');

    signatureObj.prepareCanvas();
    signatureObj.disableButtons();
    GUI.Signature.instances[pageSignatureObjects[i].id] = signatureObj;
  }
};


GUI.Signature.prototype.setEvents = function() {
 if ('ontouchstart' in window) {
	      // navigator.userAgent.match(
    //   /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|AppleWebKit|IEMobile/i
    // )
    XDOM.addEventListener(this.canvasObj, 'touchstart', GUI.Signature.Draw);
    XDOM.addEventListener(this.canvasObj, 'touchmove', GUI.Signature.Draw);
    XDOM.addEventListener(this.canvasObj, 'touchend', GUI.Signature.Draw);
    XDOM.addEventListener(this.canvasObj, 'touchmove', function(event) {
      event.preventDefault();
    });
  } else {
    XDOM.addEventListener(this.canvasObj, 'mousedown', GUI.Signature.Draw);
    XDOM.addEventListener(this.canvasObj, 'mousemove', GUI.Signature.Draw);
    XDOM.addEventListener(this.canvasObj, 'mouseup', GUI.Signature.Draw);
    XDOM.addEventListener(this.canvasObj, 'mouseout', GUI.Signature.Draw);
    XDOM.addEventListener(this.canvasObj, 'mousedown', function(event) {
      event.preventDefault();
    });
  }

  //set button events
  this.clearButton.setAttribute(
    'data-click-action',
    'GUI.Signature.clearCanvas'
  );
  this.submitButton.setAttribute(
    'data-click-action',
    'GUI.Signature.sendCanvas'
  );
};

GUI.Signature.prototype.setDimentions = function() {
  this.canvasWrapper = XDOM.getObject(this.baseId);

  this.canvasWrapper.className += ' line' + this.position['yPos']; //y is in procenten van de hele pagina
  this.canvasWrapper.className += ' xpos' + int2css(this.position['xPos'], 3);

  this.canvasWrapper.className +=
    ' xsize' + int2css(this.dimentions['width'], 2);
  this.canvasWrapper.className +=
    ' lines' + int2css(this.dimentions['height'], 2);
};

GUI.Signature.prototype.renderCanvas = function() {
  this.canvasObj = XDOM.createElement('canvas');
  this.buttonsBar = XDOM.createElement('div', null, 'buttonsBar');

  XDOM.setAttribute(this.canvasObj, 'data-signature-id', this.baseId);

  this.canvasObj.width = this.canvasWrapper.clientWidth;
  this.canvasObj.height =
  this.canvasWrapper.clientHeight - this.buttonsBarHeight;

  this.buttonsBar.style.width = this.canvasWrapper.clientWidth + 'px';
  this.buttonsBar.style.height = this.buttonsBarHeight + 'px';

  this.canvasWrapper.appendChild(this.canvasObj);
  this.canvasWrapper.appendChild(this.buttonsBar);
};

GUI.Signature.prototype.renderButtons = function() {
  this.clearButton = XDOM.createElement(
    'div',
    'clearBtn_' + this.baseId,
    'defaultIconBtn signature-clear-button'
  );
  XDOM.setAttribute(this.clearButton, 'data-signature-id', this.baseId);
  XDOM.setAttribute(this.clearButton, 'data-button', 'undo');

  this.submitButton = XDOM.createElement(
    'div',
    'SIGN',
    'defaultIconBtn signature-submit-button'
  );
  XDOM.setAttribute(this.submitButton, 'data-signature-id', this.baseId);
  XDOM.setAttribute(this.submitButton, 'data-button', 'accept');

  GUI.infoTitle.register(this.clearButton, getCapt('gSIGNATURE_CLEAR'));
  GUI.infoTitle.register(this.submitButton, getCapt('gSIGNATURE_SUBMIT'));

  this.buttonsBar.appendChild(this.submitButton);
  this.buttonsBar.appendChild(this.clearButton);
};

GUI.Signature.prototype.enableCanvas = function() {
  this.setBackground('#ffffff');
  this.prepareCanvas();
  this.enableButtons();
};

GUI.Signature.prototype.disableCanvas = function() {
  this.setBackground('#f2f2f2');
  this.prepareCanvas();
  this.disableButtons();
};

GUI.Signature.prototype.disableButtons = function() {
  XDOM.setAttribute(this.submitButton, 'data-button-disabled', true);
  XDOM.setAttribute(this.clearButton, 'data-button-disabled', true);
};

GUI.Signature.prototype.enableButtons = function() {
  XDOM.setAttribute(this.submitButton, 'data-button-disabled', false);
  XDOM.setAttribute(this.clearButton, 'data-button-disabled', false);
};

GUI.Signature.update = function() {
  var pageObjects = XDOM.queryAllScope('.signature-place-holder');
  var signatureObject = null;
  for (var i = 0, l = pageObjects.length; i < l; i++) {
    signatureObject = GUI.Signature.instances[pageObjects[i].id];
    signatureObject.update();
  }
};

GUI.Signature.prototype.update = function() {
  this.isProtected = XDOM.getAttribute(this.baseId, 'data-protected');
  switch (this.isProtected) {
    case 'true':
      this.disableCanvas();
      break;
    default:
      this.enableCanvas();
      break;
  }
};



GUI.Signature.prototype.getDateTime = function() {
  let dateString = '';
  if (this.dateField && this.dateField.length == 8) {

    dateString =  this.dateField.substr(0, 2) +
        '-' +
        this.dateField.substr(2, 2) +
        '-' +
        this.dateField.substr(4, 4);
  }

  //do a trim because one or the other or both can be empty and we check later on if we have something at all
  return (dateString+ ' ' + this.timeField).trim();
}


GUI.Signature.prototype.getTopCanvasLine = function() {
  //generate line @ top
  let city = this.cityField
  let dateTime = this.getDateTime();

  //when both are set combine the two
  if(city && dateTime) {
    return city + ', ' + dateTime;
  }

  // only one is set so combine it wil return only the content of one.
  return city + dateTime;

}


GUI.Signature.prototype.setBackgroundImage = function() {
  if (!this.signatureUrl) return false;

    GUI.Signature.currentInstanceId = this.baseId;

    this.backgroundImage = new Image();
    //this.backgroundImage.onload = GUI.Signature.backgroundImageOnLoad(this.baseId);

    this.backgroundImage.onload = function() {
      GUI.Signature.backgroundImageOnLoad(GUI.Signature.currentInstanceId);
    };

    this.backgroundImage.src = this.signatureUrl;
    return true;

}
GUI.Signature.prototype.prepareCanvas = function() {
  this.setVars();

  const context = this.canvasObj.getContext('2d');
  context.restore(); //clear canvas
  if(this.setBackgroundImage()) return;



  context.textBaseline = 'top';
  context.fillStyle = '#000000';
  context.lineWidth = '0.3';
  context.font = '12px Arial';


  context.fillText(this.getTopCanvasLine(), 10, 10);

  //generate line @ middle
  context.fillStyle = '#aaa';
  context.fillText(this.referenceLabel + ' - ' + this.referenceField, 10, this.canvasObj.height / 2 - 5);

  //generate line @ bottom
  context.fillStyle = '#000';
  context.fillText(this.nameField, 10, this.canvasObj.height - 20);

  this.hasDrawn = false;
};

GUI.Signature.prototype.approved = function() {
  if (this.isProtected && this.hasDrawn) {
    return true;
  }

  return false;
};

GUI.Signature.backgroundImageOnLoad = function(baseId) {
  var signatureObject = GUI.Signature.instances[baseId];

  if (signatureObject) {
    signatureObject.setCanvasBackGround();
  }
};

GUI.Signature.prototype.setCanvasBackGround = function() {
  this.setBackground('#ffffff');

  var context = this.canvasObj.getContext('2d');
  context.drawImage(
    this.backgroundImage,
    0,
    0,
    this.canvasObj.offsetWidth,
    this.canvasObj.offsetHeight
  );
  GUI.Signature.currentInstanceId = null;
};

GUI.Signature.clearCanvas = function(e) {
  XDOM.getEvent(e);

  var canvasId = XDOM.getAttribute(
    GLOBAL.eventSourceElement,
    'data-signature-id'
  );

  if (GUI.Signature.instances[canvasId].approved) {
    if (
      XDOM.getBooleanAttribute(
        GUI.Signature.instances[canvasId].clearButton,
        'data-button-disabled'
      )
    ) {
      return;
    }

    GUI.Signature.instances[canvasId].setBackground('#ffffff');
    GUI.Signature.instances[canvasId].prepareCanvas();
  }
};

GUI.Signature.sendCanvas = function(e) {
  XDOM.getEvent(e);

  var canvasId = XDOM.getAttribute(
    GLOBAL.eventSourceElement,
    'data-signature-id'
  );
  if (!GUI.Signature.instances[canvasId].approved) {
    return;
  }

  var signObj = GUI.Signature.instances[canvasId];

  if (XDOM.getBooleanAttribute(signObj.submitButton, 'data-button-disabled')) {
    return;
  }

  var request = new XMLHttpRequest();
  var fd = new FormData();
  fd.append('blobName', 'signature');
  var fsUri = SESSION.activePage.pageUrl.replace('MAIN', 'UPLOAD');
  var faResponse = null;
  var dataURL = signObj.canvasObj.toDataURL('image/jpeg', 0.8);
  var blob = GUI.Signature.dataURItoBlob(dataURL);
  fd.append('signature', blob);
  request.open('POST', fsUri, false);
  request.send(fd);
  faResponse = request.responseText.split('=')[1];

  if (faResponse) {
    XDOM.createInputField(signObj.returnField, faResponse.trim());
  }
  Command.execute();
  delete SESSION.activePage.controlerFields[signObj.returnField];
};

GUI.Signature.prototype.setBackground = function(color) {
  var context = this.canvasObj.getContext('2d');
  context.fillStyle = color;
  context.fillRect(0, 0, this.canvasObj.width, this.canvasObj.height);
  context.strokeStyle = 'rgb(0,0,0)';
  context.lineWidth = 1;
  context.font = '12px Arial';
};

GUI.Signature.Draw = function(event) {
  XDOM.getEvent(event);
  var objId = GLOBAL.eventSourceElement;
  var canvasId = XDOM.getAttribute(objId, 'data-signature-id');
  if (GUI.Signature.instances[canvasId].isProtected == 'true') return;

  var coors = null;
  if (event.touches) {
    if (event.touches[0]) {
      coors = {
        x:
          event.targetTouches[0].pageX -
          (event.targetTouches[0].target.parentElement.offsetLeft +
            XDOM.getObject('DTADIV').offsetLeft),
        y:
          event.targetTouches[0].pageY -
          (event.targetTouches[0].target.parentElement.offsetTop +
            XDOM.getObject('DTADIV').offsetTop)
      };
      //Debug.add(event.targetTouches[0].pageX +" / "+ event.targetTouches[0].target.parentElement+" / "+XDOM.getObject("DTADIV").offsetLeft);
    }
  } else {
    coors = {
      x: event.offsetX == undefined ? event.layerX : event.offsetX,
      y: event.offsetY == undefined ? event.layerY : event.offsetY
    };
  }

  GUI.Signature.Drawer[event.type](
    coors,
    GLOBAL.eventSourceElement.getContext('2d'),
    GUI.Signature.instances[canvasId]
  );
};

GUI.Signature.dataURItoBlob = function(dataURI) {
  var dataObj = atob(dataURI.split(',')[1]);
  var bufferArray = new ArrayBuffer(dataObj.length);
  var contentArray = new Uint8Array(bufferArray);
  for (var i = 0, l = dataObj.length; i < l; i++) {
    contentArray[i] = dataObj.charCodeAt(i);
  }
  var blob = new Blob([bufferArray], { type: 'image/jpeg' });
  return blob;
};
