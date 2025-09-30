/**
 *  disabled of niet
 *  data-button-enabled-field-id = indicator veld met waarde 1/0 voor true/false
 *  data-button-default-enabled  = true/false -> als indicator niet gevonden is, is dit de waarde
 *
 *
 *  data-modef-field-id          = Modef  (veld die aangeeft welke knop er actief is)
 *  data-modef-active-condition  = ADD/UPDATE/DELETE (wat voor knop is dit)
 *
 *  wordt op true gezet als de knop aanklikbaar is, dat wil zeggen actief en niet
 *  data-button-enabled
 *
 *  logica:
 *  een knop is disabled actief of enabled en niet actieve
 *  enabled en niet actieve
 *
 *   modef-add-disabled
 *   modef-add-enabled
 *   modef-add-active
 *
 *   modef-update-disabled
 *   modef-update-enabled
 *   modef-update-active
 *
 *   modef-delete-disabled
 *   modef-delete-enabled
 *   modef-delete-active
 *
 */
var Modef = {};

/**
 * wordt uitgevoerd bij het opnieuw laden van de pagina en bepaald welke Modef knoppen er actief, inactief en disabled worden aan de hand van de data
 */
Modef.update = function(){
    var modefButtons = XDOM.queryAll('[data-modef-field-id]',SESSION.activeForm);
	var commandButtons = XDOM.queryAll('[data-wscmd-type]',SESSION.activeForm);

	for(var i=0,l=modefButtons.length;i<l;i++){
		Modef.set(modefButtons[i]);
	}

	for(var i=0,l=commandButtons.length;i<l;i++){
		Modef.set(commandButtons[i]);
	}


};

/**
*
**/
Modef.set = function(obj){
	let defaultEnabled = obj.getAttribute("data-button-default-enabled"),
	    enabledField   = obj.getAttribute("data-button-enabled-field-id"),
	    hiddenField    = obj.getAttribute("data-button-hidden-field-id"),
	    modef          = obj.getAttribute("data-modef-active-condition"),
		headerAttributes = SESSION.activeData.headerAttributes || {},
	   isEnabled       =( (headerAttributes[enabledField]==1) || defaultEnabled=="true"),
	   isHidden        =(headerAttributes[hiddenField]==1);

	if(isHidden){ Modef.setHidden(obj); }else{	Modef.setVisible(obj);  }

	if(SESSION.activeData.headerData.MODEF && (SESSION.activeData.headerData.MODEF == modef)){
  Modef.setActive(obj);
 }else if(isEnabled){
  Modef.setEnabled(obj);
 }else{
  Modef.setDisabled(obj);
 }

};

/**
 * Maakt de modef knop waarop geklikt is actief en de andere actieve knop
 * inactief. Daarna wordt het commando ENTER uitgevoerd.
 */
Modef.handleOnClick = function(){
	  if(!XDOM.GLOBAL.getBooleanAttribute("data-button-clickable")){
	  	return false;
	  }
	  var activeButton = XDOM.query('[data-button-state="active"]',SESSION.activeForm);
	  if (activeButton) {
		  Modef.setEnabled(activeButton);
	  }
	  XDOM.setObjectValue('MODEF',XDOM.GLOBAL.getAttribute("data-modef-active-condition"));
	  Modef.setActive(GLOBAL.eventSourceElement);
	  Command.enter();
	  return true;
};


Modef.setEnabled = function(foObj){
 foObj.setAttribute("data-button-enabled","true");
	foObj.setAttribute("data-button-clickable","true");
	foObj.setAttribute("data-button-state","inactive");
};

Modef.setDisabled = function(foObj){
	foObj.setAttribute("data-button-enabled","false");
	foObj.setAttribute("data-button-clickable","false");
	foObj.setAttribute("data-button-state","inactive");
};

Modef.setActive = function(foObj){
	foObj.setAttribute("data-button-enabled","true");
	foObj.setAttribute("data-button-clickable","false");
	foObj.setAttribute("data-button-state","active");
};


Modef.setVisible = function(foObj){
 foObj.setAttribute("data-hidden","false");
};

Modef.setHidden = function(foObj){
 foObj.setAttribute("data-hidden","true");;
};
