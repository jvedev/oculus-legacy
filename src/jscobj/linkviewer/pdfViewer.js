
const PdfViewer = {};
(function () {
  function getViewer(viewerObj){
    XDOM.removeAllChilds(viewerObj);
    pfdViewObj = document.createElement("iframe");
    pfdViewObj.className = "pdfViewerContainer";
    viewerObj.appendChild(pfdViewObj);
    return pfdViewObj;
  };


  function setValue(viewerObj,objValue ){
    var pdfPreviewContainer =getViewer(viewerObj)
    if(!pdfPreviewContainer){
      return;
    }
    pdfPreviewContainer.setAttribute("src", SESSION.pdfViewer+"?file="+objValue);
  }
  
  
  Linkviewer.plugins.PDF = setValue;
    
}).apply(PdfViewer);