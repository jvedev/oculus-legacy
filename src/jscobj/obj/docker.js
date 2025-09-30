


const docker = {};

(function () {
  const dockOffset = 50;
  let dockPanel =  null,
      parentObj = null,
      parentWith = null;

  function init(){
    parentObj = XDOM.getObject('DTADIV');
    parentWith = parentObj.offsetWidth;
    dockPanel = XDOM.getObject("dockPanel");
    dockPanel.addEventListener("drop", drag.drop);
    dockPanel.addEventListener("dragover", drag.over);
  }

  function show(obj){
    if(!obj || !obj.dataset.dockable){
      return;
    }
    const x = GLOBAL.eventObject.clientX;
    init(obj);    
    if(x<dockOffset){
      dockPanel.dataset.dock = "left";
      return;
    }

    if(x > parentWith -dockOffset ){
      dockPanel.dataset.dock = "right";
      return;
    }
    dockPanel.dataset.dock = "";
  }


  function dock(obj){
      if(!obj || !obj.dataset.dockable){
        return;
      }
      const side = dockPanel.dataset.dock;
      
      if(!side){return};
      saveSize(obj)
      obj.removeAttribute("style");
      obj.dataset.docked=side;
      updatePanelSort(obj);
      clear()
  }

  function clear(){
    if(dockPanel){
      dockPanel.dataset.dock = "";
    }
    
  }


  function saveSize(obj){
    //kopieer de style voor breedte en hoogte 
    obj.dataset.orgWidth = obj.style.width;
    obj.dataset.orgHeight = obj.style.height;
  }

  function cleanup(obj){
    delete obj.dataset.docked;
    delete obj.dataset.orgWidth;
    delete obj.dataset.orgHeight;
    delete obj.dataset.docked;
  }

  function resetSize(obj){
    obj.style.width = obj.dataset.orgWidth;
    obj.style.height = obj.dataset.orgHeight;
  }
  
  function resetPosition(obj){
    const docked = obj.dataset.docked,
          width = parseInt(obj.dataset.orgWidth.replace('px',''));
    
    obj.style.top = "0px";
    if(docked == "left"){
      obj.style.left = '0px';
      return;
    }

    obj.style.left = (parentWith-width) + 'px';

  }
  
  function unDock(obj){
    if(!obj || !obj.dataset.dockable){
      return;
    }

    if(!obj.dataset.docked){
      return;
    }
    resetPosition(obj)
    resetSize(obj)
    cleanup(obj);
  }
  this.clear = clear;
  this.unDock = unDock;
  this.show = show;
  this.dock = dock;
}).apply(docker);




