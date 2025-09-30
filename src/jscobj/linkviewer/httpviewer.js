
const httpViewer = {};
(function () {
  
  function getViewer(viewerObj){
    let httpViewObj = viewerObj.querySelector("iframe");
    if(httpViewObj){
        return httpViewObj;
    }
    
    httpViewObj = document.createElement("iframe");
    httpViewObj.className = "pdfViewerContainer";
    viewerObj.appendChild(httpViewObj);
    return httpViewObj;
  };

  // function checkUri(viewerObj,uri){
  //   const xmlHttpRequest = new XMLHttpRequest();
  //   xmlHttpRequest.viewerObj = viewerObj;
  //   xmlHttpRequest.addEventListener('load', load);
  //   xmlHttpRequest.addEventListener('error', error);
  //   xmlHttpRequest.open("GET", uri, true);
  //   xmlHttpRequest.send();

  //   if(xmlHttpRequest.status === 404){
  //     error(viewerObj)
  //   }
  // }

  function load(resonse){
    const viewContainer =getViewer(viewerObj)
    if(!viewContainer){return;}
    viewContainer.srcdoc = this.responseText;
    viewContainer.src = "data:text/html;charset=utf-8," + escape(this.responseText);
    //viewContainer.setAttribute("src", uri);
  }

  // function error(viewerObj){
    
  //    viewerObj.innerHtml = "SORRY de pagina bestaat niet meer";
    
  // }


  function setValue(viewerObj,uri ){
    const viewContainer =getViewer(viewerObj)
    if(!viewContainer){return;}
    viewContainer.setAttribute("src",uri);
  }
  
  
  Linkviewer.plugins.HTTP = setValue;
    
}).apply(httpViewer);