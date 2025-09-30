/**
 * bij data attributen is de waarde in het veld bepaalend voor het uiterlijk van het veld
 *   
 * de volgende data attributen zijn bekend:
 * data-left-zero 
 * data-left-blank 
 * data-signed 
 * data-to-upper 
 * data-digits
 * 
 * is de waarde van deze eigenschappen "true" an dienen de aanpassingen te worden gedaan 
 * 
 */

function DataAttribute(){}
/**
 * verzameld alle dom objecten die een data attribute hebben en past deze velde aan op basis van die attributen
 * later bij ajax worden de velden aangepast op het moment dat ze met een waarde worden gevuld door middel van de aanroep DataAttribute.apply
 * de volgende data attributen zijn bekend:
 * 
 * data-left-zero 
 * data-left-blank 
 * data-signed 
 * data-to-upper 
 * data-digits
 * 
 */
DataAttribute.update = function(){
	var pageObjects = XDOM.queryAll('[data-value-when-zero]');
	for(var i=0,l=pageObjects.length;i<l;i++){
		DataAttribute.apply(pageObjects[i]);
	}
};	


DataAttribute.apply = function(obj){
  if(obj.getAttribute("data-value-when-zero")=="*BLANK"){DataAttribute.whenZero(obj);}
  if(XDOM.getBooleanAttribute(obj,"data-left-zero")){ DataAttribute.leftZero(obj); }
  if(XDOM.getBooleanAttribute(obj,"data-left-blank")){ DataAttribute.leftBlank(obj); }
  if(XDOM.getBooleanAttribute(obj,"data-to-upper")){ DataAttribute.upperCase(obj); }
  if(XDOM.getBooleanAttribute(obj,"data-digits")){ DataAttribute.upperCase(obj); }
};

DataAttribute.leftZero = function(obj){
  var maxLength = obj.getAttribute("maxLength");   
  if (obj.value && obj.value.length > '0') {
   obj.value=obj.value.lftzro(maxLength);
  }
};

DataAttribute.leftBlank = function(obj){
  var maxLength = obj.getAttribute("maxLength");
  obj.value=obj.value.lftblk(maxLength);
  obj.setAttribute("value", obj.value);
  return;
};

DataAttribute.upperCase = function(obj){
  if(obj.tagName=="INPUT" || obj.tagName=="TEXTAREA" ){
    obj.value=obj.value.toUpperCase();
    obj.setAttribute("value", obj.value);
  }
  return;
};

DataAttribute.whenZero = function(obj){
  if(obj.getAttribute("data-value-when-zero")!="*BLANK"){
    return;
  }
  var value = XDOM.getObjectValue(obj)
  value = value.replace(',','.');
  value = parseFloat(value);
  if(value==0){
    XDOM.setObjectValue(obj,'');
		setOldValue(obj); //zet de oldvalue ook weer op leeg ivm autosubmit
  }
}

function isAutoSubmitField(obj){
  if(!obj) return false;
  return (XDOM.getBooleanAttribute(obj,"data-autosubmit") ||
          XDOM.getBooleanAttribute(obj,"data-refresh-caller"));
}

/**
 * zoekt in de lijst van velden of er een veld is dat een autosubmit heeft
 * @param fields
 */
function hasAutoSubmitFields(fields){
  for(let i=0,l=fields.length;i<l;i++){
    if(isAutoSubmitField(fields[i])){
      return true;
    }
  }
}