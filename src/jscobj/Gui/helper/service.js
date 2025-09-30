GUI.Services = function(obj){
  this.definitions = obj.serviceData;
  this.services ={};
  this.init();
};

GUI.Services.prototype.init= function(){
  for(var s in this.definitions){
    this.services[s] = new GUI.Service(this.definitions[s],s);
  }
};

GUI.Services.prototype.get = function(id){
  return this.services[id];
};

/**
 * vertaald service definitie naar oud format t.b.v. oude code service en choice popups
 * @param key
 * @returns
 */
GUI.Services.prototype.getOldFormat = function(key){
  var foNewService = this.services[key];
  var foOldService = {};
  if(!foNewService){
    return null;
  }
  foOldService.TTL = foNewService.title;
  foOldService.OPT = [];
 // foOldService.OPT = foNewService.options;
   for(var o in foNewService.options){
     foOldService.OPT[o] = foNewService.options[o];
     //foOldService.OPT.push([o,foNewService.options[o]]);
   }
  return foOldService;
};

GUI.Service = function(obj,id){
  this.id = id;
  this.title = '';
  this.options = [];
  this.init(obj);
};

GUI.Service.prototype.init = function(obj){
  //this.initOptions(obj.ServiceDftLang.options);
  if(!obj || !(obj.ServiceDftLang || obj.ServiceUserLang) ){
    this.title = getCapt('gNOSERVICEOBJECT');
    this.options = [];
    return;
  }
  this.title = obj.ServiceDftLang.title;
  this.options = obj.ServiceDftLang.options;
  if(obj.ServiceUserLang){
   // this.initOptions(obj.ServiceUserLang.options);
    this.options = obj.ServiceUserLang.options;
    if(obj.ServiceUserLang.title !=''){
      this.title = obj.ServiceUserLang.title;
    }
  }
};


GUI.Service.prototype.get = function(key){
  var serviceDescription = "";

  for ( var i = 0, l = this.options.length; i < l; i++) {
    if (key.toUpperCase() == this.options[i][0].toUpperCase() ) {
      serviceDescription = this.options[i][1];
      break;
    }
  }

  return serviceDescription;

  //if(this.options[key]){
  //  return this.options[key];
  //}
  //return '';
};

//GUI.Service.prototype.initOptions = function(options){
//  var key = '';
//  var value = '';

//  for(var i = 0, l = options.length;i<l;i++){
//    key = options[i][0];
//    value = options[i][1];
//    this.options[key] = value;
//  }
//};