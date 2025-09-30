oculusImage =  {}
oculusImage.prepareDom = function(){
	var Objects = XDOM.queryAllScope("[data-datatype='*IMG']");
	for(var i=0,l=Objects.length;i<l;i++){
		oculusImage.setDimentions(Objects[i]);
	}
};

oculusImage.update = function(){}

oculusImage.setObjValue = function(obj,value){

  obj.innerHTML='';
  if(!value){
    return;
  }
  var imageObject =  new Image();

  imageObject.id = obj.id +"_IMG";

  imageObject.setAttribute("data-click-action","oculusImage.expand");
  obj.appendChild(imageObject);
  XDOM.addEventListener(imageObject, 'error', oculusImage.onError);
  imageObject.src = value;
}

oculusImage.setDimentions= function(obj){
  var xPos = obj.getAttribute("data-element-xpos");
  var yPos = obj.getAttribute("data-element-ypos");
  var width = obj.getAttribute("data-element-xsize");
  var height = obj.getAttribute("data-element-ysize");
  var newHeight = obj.getAttribute("data-element-lines");

  if(!xPos){
     return;
  }

  if(yPos)      {   obj.className += ' ypos'+yPos;                   }
  if(xPos)      {   obj.className += ' xpos'+int2css(xPos, 3);       }
  if(width)     {   obj.className	+= ' xsize'+int2css(width, 2);     }
  if(height)    {   obj.className	+= ' ysize'+int2css(height, 2);    }
  if(newHeight) {   obj.className	+= ' lines'+int2css(newHeight, 2); }
};

oculusImage.onError = function(e){
	XDOM.getEvent(e);
	var imgDiv = GLOBAL.eventSourceElement.parentNode;
	if(imgDiv){
		imgDiv.innerHTML=getCapt('gIMGNOTAVAIL');
	}
};


oculusImage.expand = function(){


  var sourceImage = GLOBAL.eventSourceElement;
  if(!sourceImage.src){
   return false;
  }


  var dataDiv = XDOM.getObject("DTADIV");
  var overlay = XDOM.createElement("DIV","whiteOverlay",null);
  dataDiv.appendChild(overlay);


  var thisImage = XDOM.createElement("img", sourceImage.id, 'draggable' );
      thisImage.src = sourceImage.src;
      thisImage.setAttribute("data-mouseDown-action", "Dragger.start");
      thisImage.setAttribute("data-dragger-objId", "imgViewer");

      thisImage.onload = function(){
        var imgTop  = (dataDiv.clientHeight - thisImage.height) *0.5;
        var imgLeft = (dataDiv.clientWidth - thisImage.width) *0.5;

        // Position wrapper (flashes on Chrome)
        imgWrapper.style.left = imgLeft + 'px';
        imgWrapper.style.top = imgTop + 'px';
        
        thisImage.setAttribute('style', "opacity: 1;");
        overlay.setAttribute('style', "opacity: 1;");        
      };
  var imgWrapper = XDOM.createElement("DIV","imgViewer","imgViewer");
      imgWrapper.setAttribute('draggable', "true");
      imgWrapper.setAttribute("data-mouseDown-action", "Dragger.start");

      // CSS
      imgWrapper.style.opacity = 0; 
      imgWrapper.style.transition = 'opacity .5s ease-in';

  var imgCloseBtn = XDOM.createElement("DIV",null,"pth-close closeImagePopup");
      imgWrapper.appendChild(thisImage);
      imgWrapper.appendChild(imgCloseBtn);

      overlay.setAttribute("data-click-action","closeHighSlide")
      imgCloseBtn.setAttribute("data-click-action","closeHighSlide")

      dataDiv.appendChild(imgWrapper);

      // HACKING!!!!!! YAY
      setTimeout(()=> {
        // Set opacity to 1
        imgWrapper.style.opacity = 1; 
      }, 1);
      
      //Dragger.dragDrop.initElement(imgWrapper);

};