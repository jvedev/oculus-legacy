 GUI.DataSet = function(obj) {
   GUI.DataSet.baseConstructor.call(this,obj);
   this.dataType = nullWhenEmpty(obj.dataType);
   this.definition = obj;
   this.recordHeight = null;
   this.headerHeight = null;
   this.footerHeight = null;
   this.recordRows = null;
   this.headerRows = null;
   this.footerRows = null;
   this.subfileObjects = [];
   this.headerObjects = [];
   this.footerObjects = [];
   this.text = '';
   this.widthPx = null;
   this.sizesInPixels = true; //de grote wordt niet bepaald door css maar als width en height
};

XDOM.extendObject(GUI.DataSet, GUI.BaseObject);

GUI.DataSet.prototype.init = function(){
  this.base(GUI.DataSet, 'init');
  var faSubfileElements = this.definition.subfile;
  var faHeaderElements = this.definition.header;
  var faFooterElements = this.definition.footer;
  var foObjDev = null;
  var foGuiObject = null;
  var currentRow = 0;
  var currentHeight = null;
 
  this.setDefaults();
  
  this.captions = this.parentObject.captions; 
  
 
  for(var i = 0, l = faSubfileElements.length;i<l;i++){
    foObjDev = faSubfileElements[i];
    
    
    foGuiObject = GUI.factory.get(foObjDev, this);
    
    currentRow = parseInt(foGuiObject.y);
    currentHeight = parseInt(foGuiObject.height);
    if(!isNaN(currentHeight)){
      currentRow +=currentHeight;
    }
    if(currentRow > this.recordRows){
      this.recordRows = currentRow;
    }
    
    
    foGuiObject.rowNumber = i;
    foGuiObject.partOff = GUI.DataSet.Part.record;
    foGuiObject.init();
    this.subfileObjects[foGuiObject.id]=foGuiObject;
  }

  
  
  
  currentHeight = 0;
  currentRow = 0;
  for(var i = 0, l = faHeaderElements.length;i<l;i++){
    foObjDev = faHeaderElements[i];
    
    
    foGuiObject = GUI.factory.get(foObjDev);
    
    currentRow = parseInt(foGuiObject.y);
    currentHeight = parseInt(foGuiObject.height);
    if(!isNaN(currentHeight)){
      currentRow +=currentHeight;
    }
    if(currentRow > this.headerRows){
      this.headerRows = currentRow;
    }
    foGuiObject.partOff = GUI.DataSet.Part.header;
    foGuiObject.parentObject = this;
    foGuiObject.init();
    this.headerObjects[foGuiObject.id]=foGuiObject;
  }
  
  
  
  currentHeight = 0;
  currentRow = 0;
  for(var i = 0, l = faFooterElements.length;i<l;i++){
    foObjDev = faFooterElements[i];
    foGuiObject = GUI.factory.get(foObjDev, this);
    currentRow = parseInt(foGuiObject.y);
    currentHeight = parseInt(foGuiObject.height);
    if(!isNaN(currentHeight)){
      currentRow +=currentHeight;
    }
    if(currentRow > this.footerRows){
      this.footerRows = currentRow;
    }
    foGuiObject.partOff = GUI.DataSet.Part.footer;
    foGuiObject.init();
    this.footerObjects[foGuiObject.id]=foGuiObject;
  }

  if(this.headerRows){this.headerRows++;}
  if(this.footerRows){this.footerRows++;}
  this.recordRows++;
  this.headerHeight = this.parentObject.sizes.lineHeight  * (this.headerRows);
  this.footerHeight = this.parentObject.sizes.lineHeight  * (this.footerRows); 
  this.bodyHeight = this.parentObject.sizes.lineHeight  * (this.height-this.headerRows-this.footerRows);
  this.footerHeight += 'px';
  this.headerHeight += 'px';
  this.bodyHeight += 'px';
  
  this.recordHeight = this.parentObject.sizes.lineHeight * this.recordRows + 'px';
  
  
};


GUI.DataSet.prototype.resetHeight = function(height){
	this.height+=height;
	this.bodyHeight = this.parentObject.sizes.lineHeight  * (this.height-this.headerRows-this.footerRows);
	this.bodyHeight += 'px';
};



/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.DataSet.prototype.render = function(){
  this.dom.domObject = XDOM.createElement("DIV",this.id,'dataset');
  this.setPosAndDimentions(this);
  this.renderHeader();
  this.renderBody();
  this.renderFooter();
  this.updateState();
  return this.dom.domObject;
};


GUI.DataSet.prototype.renderBody = function(){
  this.dom.body = XDOM.createElement( 'DIV', "dataset-body-" + this.id, "dataset-Body");
  this.dom.body.style.height = this.bodyHeight;
  for(var i =0,l=this.subfileData.length;i<l;i++){
    this.renderRecord(i);
  }
  this.dom.domObject.appendChild(this.dom.body);
};



GUI.DataSet.prototype.renderRecord = function(i){
  var foRecordDiv = XDOM.createElement( 'DIV', "dataset-record-" + i, "dataset-record");
  foRecordDiv.style.height = this.recordHeight;
  for(var id in  this.subfileObjects){
    
    this.subfileObjects[id].currentData = this.subfileData[i];
    this.subfileObjects[id].setValue();
    foRecordDiv.appendChild( this.subfileObjects[id].render());
   }
  this.dom.body.appendChild(foRecordDiv);
};




GUI.DataSet.prototype.renderFooter = function(){
  this.dom.footer = XDOM.createElement( 'DIV', "dataset-footer-" + this.id, "dataset-footer");
  this.dom.footer.style.height = this.footerHeight;
  for(var id in  this.footerObjects){
    this.footerObjects[id].currentData = this.currentData;
    this.footerObjects[id].setValue();
    this.dom.footer.appendChild( this.footerObjects[id].render());
   }
  this.dom.domObject.appendChild(this.dom.footer);
};

GUI.DataSet.prototype.renderHeader = function(){
  this.dom.header = XDOM.createElement( 'DIV', "dataset-header-" + this.id, "dataset-header");
  this.dom.header.style.height = this.headerHeight;
  for(var id in  this.headerObjects){
    this.headerObjects[id].currentData = this.currentData;
    this.headerObjects[id].setValue();
    this.dom.header.appendChild( this.headerObjects[id].render());
   }
  this.dom.domObject.appendChild(this.dom.header);
};










/**
 * @override GuiBaseObject
 */
GUI.DataSet.prototype.updateState = function(){
  if(!this.dom.domObject){
    this.dom.domObject = XDOM.getObject(this.id);
  }
  this.base(GUI.DataSet, 'updateState');
  this.dom.domObject.className  = this.getCssClass();
};


GUI.DataSet.prototype.setPosAndDimentions = function(obj){
  var fiColWidth = 100/ this.width;
  if(obj==this){ //zichzelf wel renderen als onderdeel van parent maar niet voor onderdelen die genest zijn 
    this.base(GUI.DataSet, 'setPosAndDimentions');
    return;
  }
  
  
  obj.dom.domObject.style.top = this.parentObject.sizes.lineHeightPx * (obj.y -.5) + 'PX';

  if(obj.width){
    obj.dom.domObject.style.width = floor(obj.width * fiColWidth ,2) + "%";
  }
  
  if(obj.height){
    obj.dom.domObject.style.height = this.parentObject.sizes.lineHeightPx * obj.height + "px";
  }  
  
  obj.dom.domObject.style.left = floor(obj.x * fiColWidth ,2) + "%";// this.parentObject.sizes.colWidthPx * obj.x + 'px';
  
};

GUI.DataSet.prototype.getHeightPx = function(nr){
  return nr * 20 + "px";
  //return this.parentObject.getHeightPx(nr);
};

GUI.DataSet.prototype.getWidthPx = function(nr){
  return nr * 7 + "px";
};

GUI.DataSet.Part = {'header':'header','footer':'footer','record':'record'};



