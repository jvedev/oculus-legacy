
/* global Stateless */
/**
 * wrapper om formdate te verzamelen maar om ook nog als get te kunnen versturen 
 * het native formdata is helaas niet uit te vragen vandaar de dubbele boekhouding
 * @returns {Stateless.FormData}
 */
Stateless.FormData = function(){
   this.data = {};
   this.formData= new FormData();
   this.recordCount = 0;
};
/**
 * resets state 
 * @returns {void}
 */
Stateless.FormData.prototype.clear = function(){
  this.data = {};
  this.formData= new FormData();
  this.recordCount = 0;
};

/**
 * sets value of field
 * @param {string} name
 * @param {obj} value
 * @returns {void}
 */
Stateless.FormData.prototype.append = function(name,value){
  if(!name){return;}
  this.data[name] = value;
  this.formData.append(name,value);
  this.recordCount++;
};

/**
 * @returns {String} querystring of name value collection url encoded
 */
Stateless.FormData.prototype.queryString = function(){
  var queryString = '';
  for(var name  in this.data){
    queryString += "&" + name +'=' + encodeURIComponent(this.data[name]);
  }
  
  queryString =  queryString.replace('&',''); //remove first &
  return queryString;
};