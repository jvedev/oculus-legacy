/**
 * bepaald verschillende attributen op basis van de huidige data
 * als het dataField gelijk is aan de string "true" dan wordt het attribute gezet
 * @param attributes
 * @param parentObject
 * @returns {GUI.ConditionalAttribute}
 */

GUI.ConditionalAttribute = function(obj, parentObject){
 this.attribute =  obj.condAttrValue;
 this.indicatorField =obj.condAttrBoolean;
 this.parentObject = parentObject;
};

/**
 * bepaald de verschillende attributen op dasis van de huidige data set
 */
GUI.ConditionalAttribute.prototype.update = function(){
  if(!this.attribute && this.attribute!=''){return;}
  var apply = this.parentObject.getDataValue(this.indicatorField) == '1';
  var obj =    this.parentObject.dom.domObject;       
  ConditionalAttribute.set(obj,this.attribute,apply) ; 
};





 
  

                              