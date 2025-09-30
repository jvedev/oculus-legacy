
/**
 * bepaalt css class ob basis van object 
 * @param object
 * @returns {GUI.CssClass}
 */

GUI.CssClass = function(object){
  this.object = object;
  this.widthPreFix = '';
};


/**
 * verkrijgt alle css classes
 * @returns {string} de css classes voor dit object 
 */
GUI.CssClass.prototype.getClass = function(){
  if(this.object.type=='input'){
    this.widthPreFix = 'xInp';
  }else{
    this.widthPreFix = 'x';
  }
  var fsCss =  
         this.getCssColorClass() + 
         this.getCssAlignClass() + 
         this.getVisabilityClass() +
         this.getDecorationClass() + 
         this.getPosAndSizesClass();
  return fsCss;
};


/**
 * geeft class terug op basis van 
 * @returns {String}
 */
GUI.CssClass.prototype.getDecorationClass = function(){
  var fsCss = '';
  if(this.object.textLevel){
    fsCss += ' txtLevel'+ this.object.textLevel;
  }
  if(this.object.underline){
    fsCss += ' underline';
  }
  if(this.object.showAsLabel){
    fsCss += ' dataAsLabel';
  }
  // if(this.object.upperCase){
  //   fsCss += ' text-uppercase';
  // }


  return fsCss;
};

/**
 * verkrijgt een class op basis van zichtbaarheid
 * @returns {string} css class
 */
GUI.CssClass.prototype.getVisabilityClass = function(){
  if(this.object.conditionalAttributes.isHidden || this.object.isHidden){
    return ' hidden';
  }
  if(this.object.conditionalAttributes.isProtected || this.object.isProtected){
    return ' protected ';
  }
  return '';
};


/**
 * maakt css classes op basis van 
 * attentionLevel, backgroundColor, textColor en conditional attributes en signed
 * als een attentionLevel is gezet dan heeft textColor,  backgroundColor, en conditional attributes(voor zover van toepassing) en signed geen invloed
 * als signed is gezet en de display waarde van dit element is kleiner dan 0 dan heeft textColor geen invloed
 * als een conditional attribute is gezet dan heeft textColor en  backgroundColor geen invloed 
 * @returns {String}
 */
GUI.CssClass.prototype.getCssColorClass = function(){
  var fsCss = '';
  
  if(this.object.textColor){
    fsCss = " font_" + this.object.textColor + " ";
  }

  if(this.object.backgroundColor){
    fsCss+= " bkgd_" + this.object.backgroundColor + " ";
  }

  if(this.object.isProtected || this.object.conditionalAttributes.isProtected){
    fsCss+= " protect ";
  }


  if (this.object.textColorField) {
    fsCss+= " font_" + this.object.getColor(this.object.textColorField);
  }
  if (this.object.backgroundColorField) {
    fsCss+=" bkgd_" + this.object.getColor(this.object.backgroundColorField)
  }
  
  return fsCss;
};



/**
 * maakt css classes op basis van 
 * textAlign
 * @returns {String}
 */
GUI.CssClass.prototype.getCssAlignClass = function(){
  if(this.object.type=="memo"){
  }
 var fsAlign = '';
  
 if(this.object.conditionalAttributes.align){
   fsAlign = this.object.conditionalAttributes.align;
 }else if(this.object.textAlign){
   fsAlign =this.object.textAlign ;
 }else if(this.object.dataType == ENUM.dataType.decimal){
   fsAlign = ENUM.textAlign.right;
 }
  
  
 
 if(fsAlign){
   this.widthPreFix += fsAlign;
   return " align" + fsAlign + " ";
 }
 // geen align bekent dan default
 this.widthPreFix += "Left";
 return '';
};



GUI.CssClass.prototype.getPosAndSizesClass = function(){
  var w = this.object.width;
  var h = this.object.height;
  var x = this.object.x;
  var y = this.object.y;
  var fsPosition = ' line' + (y);
  
  
  fsPosition += ' xpos';

  if(x<10){
    fsPosition += '00' + x;
  }else if (x<100){
    fsPosition += '0' + x;
  }else{
    fsPosition += x;
  }
  
  fsPosition += ' ';

  if(h){
    fsPosition += ' lines'; 
    if(h < 10){
      fsPosition += 0;
    }
    fsPosition += h + ' ';
  }
  
  
  
  
  if(!w){
    return fsPosition;
  }
  
  if(w<10){
    return fsPosition += this.widthPreFix + '0' + w;
  }
  if(w<=20){
    return fsPosition += this.widthPreFix + w;
  }
  if(w<=25){
    return fsPosition += this.widthPreFix + '25';
  }
  if(w<=30){
    return  fsPosition += this.widthPreFix + '30';
  }
  if(w<=40){
    return fsPosition += this.widthPreFix + '40';
  }
  if(w<=50){ 
    return fsPosition += this.widthPreFix + '50';
  }
  if(w<=60){
    return fsPosition += this.widthPreFix + '60';
  }
  if(w<=70){
    return fsPosition += this.widthPreFix + '70';
  }
  if(w<=80){
    return fsPosition += this.widthPreFix + '80';
  }
  if(w<=90){
    return fsPosition += this.widthPreFix +'90';
  }

  
  
  
  
  return fsPosition += this.widthPreFix + '105';
};

//GUI.CssClass.prototype.isSigned = function(){
//  if(this.object.dataType != ENUM.dataType.decimal){return false;}
//  var fsValue = this.object.value.replace(',','.');
//  var fiValue = parseFloat(fsValue);
//  if(fiValue< 0 ){ 
//    return true;
//  }
//  return false;
//};