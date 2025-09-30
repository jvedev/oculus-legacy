
const ImageViewer = {};
(function () {
  function setValue(viewerObj,uri ){
    const imageObject =  new Image();
    XDOM.removeAllChilds(viewerObj);
    viewerObj.appendChild(imageObject);
    //XDOM.addEventListener(imageObject, 'error', oculusImage.onError);
    imageObject.src = uri;
  }
  //Linkviewer.plugins.JPG = setValue;
    
}).apply(ImageViewer);