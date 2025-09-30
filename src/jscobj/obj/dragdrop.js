/* global GLOBAL, XDOM */

var Dragger = function(){};

Dragger.start = function(obj){
	var id = obj.getAttribute("data-dragger-objId");
	Dragger.dragDrop.moveThisObject = XDOM.getObject(id);
	if(!Dragger.dragDrop.moveThisObject){
		Dragger.dragDrop.moveThisObject = obj;
	}

	Dragger.dragDrop.startDragMouse();

	XDOM.cancelEvent();
};

Dragger.dragDrop = {

  moveThisObject: undefined,
  dragHandlerObject: undefined,
  initialMouseX: undefined,
  initialMouseY: undefined,
  startX: undefined,
  startY: undefined,
  dXKeys: undefined,
  dYKeys: undefined,
  draggedObject: undefined,
  dockable:false,

  startDragMouse: function () {

    Dragger.dragDrop.startDrag(Dragger.dragDrop.moveThisObject);

    Dragger.dragDrop.initialMouseX = GLOBAL.eventObject.clientX;
    Dragger.dragDrop.initialMouseY = GLOBAL.eventObject.clientY;
    XDOM.addEventListener(SESSION.activeFrame.document,'mousemove',Dragger.dragDrop.dragMouse);
    XDOM.addEventListener(SESSION.activeFrame.document,'mouseup',Dragger.dragDrop.releaseElement);
    XDOM.addEventListener(SESSION.activeFrame.document,'onmouseout',Dragger.dragDrop.releaseElement);

    return false;
  },
  startDrag: function (obj) {
    if (Dragger.dragDrop.draggedObject) {
    	Dragger.dragDrop.releaseElement();
    }

    //Dragger.dragDrop.dockable =obj.dataset.dockable;
    Dragger.dragDrop.startX = obj.offsetLeft;
    Dragger.dragDrop.startY = obj.offsetTop;
    Dragger.dragDrop.draggedObject = obj;

    // if(Dragger.dragDrop.dockable){
    //   docker.unDock(Dragger.dragDrop.draggedObject);
    // }

    obj.className += ' dragged';


  },
  dragMouse: function (e) {
  	var evt = e || window.event;

  	XDOM.getEvent(evt);

    var fiX = GLOBAL.eventObject.clientX - Dragger.dragDrop.initialMouseX;
    var fiY = GLOBAL.eventObject.clientY - Dragger.dragDrop.initialMouseY;
    Dragger.dragDrop.setPosition(fiX,fiY);
    // if(Dragger.dragDrop.dockable){
    //docker.show(Dragger.dragDrop.draggedObject);
    //}
    return false;
  },
  setPosition: function (fiX,fiY) {
    if(!Dragger.dragDrop.draggedObject){
      return;
    }
  	Dragger.dragDrop.draggedObject.style.left = Dragger.dragDrop.startX + fiX + 'px';
   	Dragger.dragDrop.draggedObject.style.top = Dragger.dragDrop.startY + fiY + 'px';
    Dragger.dragDrop.draggedObject.style.marginTop  = '0px'; //na drag en drop wordt deze eigenschap mee gerekend in de positie
		var newYpos = Dragger.dragDrop.draggedObject.style.top.substr(0, Dragger.dragDrop.draggedObject.style.top.length-2);
  var containerHeight = XDOM.getObject("DTADIV").offsetHeight - 25;


		if((newYpos) < 0){
		  Dragger.dragDrop.draggedObject.style.top = '0px';
  }

  if((newYpos) > containerHeight){
		  Dragger.dragDrop.draggedObject.style.top = containerHeight+'px';
  }


  },
  releaseElement: function() {

    XDOM.removeEventListener(SESSION.activeFrame.document,'mousemove',Dragger.dragDrop.dragMouse);
    XDOM.removeEventListener(SESSION.activeFrame.document,'mouseup',Dragger.dragDrop.releaseElement);
    XDOM.removeEventListener(SESSION.activeFrame.document,'onmouseout',Dragger.dragDrop.releaseElement);
    if(Dragger.dragDrop.draggedObject){
      Dragger.dragDrop.draggedObject.className = Dragger.dragDrop.draggedObject.className.replace(/dragged/,'');
      Dragger.dragDrop.draggedObject = null;
    }
  }

};
