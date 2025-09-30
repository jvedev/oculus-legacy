/**
 * bepaald verschillende attributen op basis van de huidige data
 * als het dataField gelijk is aan de string "true" dan wordt het attribute gezet
 * @param attributes
 * @param parentObject
 * @returns {GUI.ConditionalAttribute}
 */

GUI.AttentionLevel = function(obj, parentObject){
 this.attentionLevelField = nullWhenEmpty(obj.attentionLevelField);
 this.parentObject = parentObject;
};

/**
 * bepaald de verschillende attributen op dasis van de huidige data set
 */
GUI.AttentionLevel.prototype.update = function(){
  if(!this.attentionLevelField){return;}
  var attentionLevel = this.parentObject.getDataValue(this.attentionLevelField);
  var obj =    this.parentObject.dom.domObject;   
  obj.setAttribute("data-attention-level",attentionLevel);
};





 
  

                              