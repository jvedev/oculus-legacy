
function FieldColors(){};

/**
 * tijdelijke update actie later als ajaxi is geimplementeerd wordt dit rechtstreeks bij het zetten van de waarde in het object aangeroepen
 */
 
FieldColors.update = function(){
  
	var foPageObjects = XDOM.queryAllScope('[data-color-apply]');
	for(var i=0,l=foPageObjects.length;i<l;i++){
		FieldColors.setColors(foPageObjects[i]);
	}
};


FieldColors.setColors = function (fieldObj) {   

	var colorField = '', colorName = '', applyTo = '', colorValue = '', classPrefix = '', classSuffix = '';

  colorField = fieldObj.getAttribute('data-color-field');
  colorName = fieldObj.getAttribute('data-color-name');
	applyTo = fieldObj.getAttribute('data-color-apply');

	if(colorField){
		colorValue = SESSION.activeData.headerAttributes[colorField];
		colorName  = colorValue;
  }else if(colorName) {
    colorValue = colorName;
  }
  
  if(!colorValue || colorValue == "" || colorValue == "#" ){
    if(applyTo=="*FONT"){
    	fieldObj.setAttribute("data-font-color", "null" );
    }else if(applyTo=="*BKGD" ){ 
  		fieldObj.setAttribute("data-background-color", "null" );
  	}
  	XDOM.removeAttribute(fieldObj, "style")
  	return;
  }

  if(colorValue.indexOf('*') == 0){ // fixed colors (*RED, *BLUE etc)
    classSuffix = colorName.substr(1);
    if(applyTo=="*FONT"){
    	fieldObj.setAttribute('data-font-color', classSuffix.toLowerCase());
    }else if(applyTo=="*BKGD" ){
    	fieldObj.setAttribute('data-background-color', classSuffix.toLowerCase());
    }
  }else{
		if(applyTo=="*FONT"){
			fieldObj.style.color = colorValue;
		}else if(applyTo=="*BKGD" ){
			fieldObj.style.backgroundColor = colorValue;
		}
	}
  
};