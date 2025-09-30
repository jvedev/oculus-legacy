/**
 * gets element by id
 * @param {string} id
 * @returns {domObject} domobject
 */
P.get = function(id){
    return document.getElementById(id);
};

/**
 * query selector
 * @param {string} q query selector
 * @returns {domObject} first object to meet the query selector criteria
 */
P.query = function (q){
    return document.querySelector(q);
}

P.getParentAttribute = function(obj,attribute){
    let out = obj,
        ret = obj.getAttribute(attribute) || '';
    while(out && out.parentNode && !ret){
      out = out.parentNode;
      if(out.getAttribute){
        ret = out.getAttribute(attribute);
      }
      if(ret){
        return ret;
      }
    }
    return ret;
  };

P.getParentByAttribute = function(obj,attribute){
  let out = obj;
  while(out && out.parentNode && !out.getAttribute(attribute)){
    out=out.parentNode;
  }
  if(out.getAttribute && out.getAttribute(attribute)){
    return out;
  }
  return null;
};

P.copyProperties = function(from, to){
  for(let key in from) {
    to[key]=from[key];
  }
}

P.Def2Attributes = function(definition){
  let attributes = `  `;
  for(let key in definition){
      attributes += ` data-option-${key}="${definition[key]}" `;
  }
  return attributes;
}

P.Attributes2Def = function(ds){
  let definition = {}
  for(let key in ds){
    if(key.indexOf('option')==0){
        definition[key.replace('option','').toUpperCase()]=ds[key]
    }
  }
  return definition;
}

P.hide = function(obj){
  if(!obj){return;}
  obj.setAttribute("data-hidden",true);
}
P.show = function(obj){
  if(!obj){return;}
  obj.setAttribute("data-hidden",false);
}

// P.autoCollapse = function(obj){
//   let resetObject = obj;//voor timeout scope
//   obj.setAttribute("data-auto-collapse", true)
//   setTimeout(function(){resetObject.setAttribute("data-auto-collapse", false);},1000);
// }

P.queryOverAllFrames = function(query){
  let ret = document.querySelector(query);
  if(ret){
    return ret;
  }
  if(SESSIONDOC){
    ret = SESSIONDOC.querySelector(query);
    if(ret){
      return ret;
    }
  }
  if(PAGEDOC){
    ret = PAGEDOC.querySelector(query);
    if(ret){
      return ret;
    }
  }
}

P.setAttributesToNodeListAllFrames = function(query, attribute, value){
  P.setAttributesToNodeList(document.querySelectorAll(query),attribute, value);
  if(SESSIONDOC){
    P.setAttributesToNodeList(SESSIONDOC.querySelectorAll(query),attribute, value);
  }
  if(PAGEDOC){
    P.setAttributesToNodeList(PAGEDOC.querySelectorAll(query),attribute, value);
  }
}

P.setAttributesToNodeList = function(nodeList ,attribute, value){
  let objects;
  if(typeof nodeList === 'string' ){
    objects = XDOM.queryAll(nodeList);
    if(!objects){
      objects = document.querySelectorAll(nodeList)
    }
  }else{
    objects = nodeList;
  }
  if(!objects){
   return;
  }
  for(var i = 0,l=objects.length;i<l;i++){
   objects[i].setAttribute(attribute,value);
  }
};

function isActive(obj){
  return (obj.dataset.buttonState=="active" ||  obj.parentNode.dataset.buttonState=="active");
}

function getFocusedMenuItem(){
  return P.queryOverAllFrames('[data-focus="true"]');
}

function removeFocus(){

  P.setAttributesToNodeListAllFrames('[data-focus="true"]', "data-focus", "false");
  P.setAttributesToNodeListAllFrames('[data-initial-focus="true"]', "data-initial-focus", "false")
}

function colapseAllMenus(){
  P.setAttributesToNodeListAllFrames('[data-open-subitems="true"]',"data-open-subitems", "false");
  P.setAttributesToNodeListAllFrames('[data-hover="true"]',"data-hover", "false");
}
function deActivateMenuHover(){
  P.setAttributesToNodeListAllFrames('[data-hover-enabled="true"]',"data-hover-enabled", "false");
}
function deActivateMenus(){
  P.setAttributesToNodeListAllFrames('[data-menu-active="true"][data-hover-enabled="true"]',"data-hover-enabled", "false");
  P.setAttributesToNodeListAllFrames('[data-menu-active="true"]',"data-menu-active", "false");
}

function activateMenu(obj){
  deActivateMenus();
  let menu = XDOM.getParentByTagName(obj, "nav");

  if(!menu){return;}
  menu.setAttribute("data-menu-active", "true");
  menu.setAttribute("data-hover-enabled", "true");
}

function setMenuModus(item, modus){
  let nav = XDOM.getParentByTagName(item, "nav");
  nav.setAttribute("data-menu-mode", modus);
}


function focusMenu(item){
     removeFocus();
     activateMenu(item);

    if(!item){return;}

    item.setAttribute("data-focus", "true");
    if(item.tagName=="A"){
      item.focus();
      return;
    }
    let a = item.querySelector("a");
    if(a){
      a.focus();
    }
}

function setHotkeys(options, field, reserved = ''){

  return; //nog geen hotkeys in fase 1

  let allowed = /^[a-z0-9A-Z]/;
  options.map(o=>{
    value = o[field];
    for(let s of value){
      let sUp = s.toUpperCase();
      if(reserved.indexOf(sUp)==-1 && allowed.test(s)){
        reserved+=sUp
        o[field] = value.replace(s,`<span data-hotkey="${sUp}">${s}</span>`);
        break;
      }
    }
    return o
  })
  return reserved;
}
/* global P, G, MainMenu */
var keyCode = {
  'backSpace' : 8,
  'tab' : 9,
  'enter' : 13,
  'shift' : 16,
  'ctrl' : 17,
  'altgr' : 17,
  'alt' : 18,
  'escape' : 27,
  'space' : 32,
  'pageUp' : 33,
  'pageDown' : 34,
  'home' : 36,
  'arrowLeft' : 37,
  'arrowUp' : 38,
  'arrowRight' : 39,
  'arrowDown' : 40,
  'del' : 46,
  'k0': 48,
  'k1': 49,
  'k2': 50,
  'k3': 51,
  'k4': 52,
  'k5': 53,
  'k6': 54,
  'k7': 55,
  'k8': 56,
  'k9': 57,
  'a': 65,
  'f': 70,
  'h': 72,
  'm' : 77,
  'n' : 78,
  'w' : 87,
  'p' : 80,
  's' : 83,
  'q' : 81,
  'w' : 87,
  'numpadPoint':110,
  'point':110,
  'F1' : 112,
  'F2' : 113,
  'F3' : 112,
  'F4' : 115,
  'F5' : 116,
  'F6' : 117,
  'F7' : 118,
  'F8' : 119,
  'F9' : 120,
  'F10' : 121,
  'F11' : 122,
  'F12' : 123,
  'apostrophe': 222

};



