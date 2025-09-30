/* global XDOM, BrowserDetect, Panel, Dragger, GLOBAL, SETTINGS, SESSION, ENUM, keyCode, PdfViewer */
const Linkviewer = {};
(function () {
  let placeHolder = null,
      uri = '',
      extension = '',
      uriType = '',
      callerObject = null,
      viewType = "*FIXED",
      plugins = {},
      popupSettings = {
        titleOrigin:'*LBL',
        popupTitle:'linkviewer',
        rows:'22',
        cols:'95',
        resizable:true,
        dockable:true
      }


  function getPlugin(args){
     let pluginName = args.extention || args.protocol || '';
     pluginName = pluginName.replace('*','');
     return plugins[pluginName];
  }

  function getPlaceHolder(args){
    if(args.isFixed){
      return XDOM.getObject(args.id);
    }
    popupSettings.id = args.id;
    popupSettings.directTitle = args.fileName || " ";
    return popupPanel.open(popupSettings);
  };

  

  function open(args){
    if(!supports(args)){return false;}
    if(!args.uri && !args.isFixed){ return false;}
    let plugin      = getPlugin(args);
        placeHolder = getPlaceHolder(args);
    if(placeHolder.dataset.lastUri == args.uri){
      return true; //huidige uri wordt al getoond niets meer doen 
    }
    placeHolder.dataset.lastUri = args.uri;
    
    
    XDOM.removeAllChilds(placeHolder);
    if(!plugin){return false;}
    plugin(placeHolder, args.uri);
    return true;
  }

  function supports(args){
    let pluginName = args.extention || args.protocol || '';
    pluginName = pluginName.replace('*','');
    if(plugins[pluginName]) {return true};
    return false;
  }

  this.plugins = plugins;
  this.open = open;
  this.supports = supports;

}).apply(Linkviewer);
