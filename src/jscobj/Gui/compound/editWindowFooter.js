/**
 * Footer ten behoeven van editPanel
 */
GUI.EditWindowFooter = function(panel){
  GUI.EditWindowFooter.baseConstructor.call(this,{'type':'updateFooter','id':'updateFooter'});
  this.message = '';
  this.errorLevel = '';
  this.parentObject = panel;
};
XDOM.extendObject(GUI.EditWindowFooter, GUI.BaseObject);

/**
 * opbouwen van footer object
 */
GUI.EditWindowFooter.prototype.render = function(){

 // this.y = this.parentObject.definition.ySize - 3;

  this.dom.domObject  = XDOM.createElement('DIV', null,  this.parentObject.cssClass + "-footer  edit-panel-footer");
  this.dom.messageDiv  = XDOM.createElement('DIV', null,  "edit-window-message");
  this.dom.messagePlaceholder = XDOM.createElement('P');
  this.dom.messageDiv.appendChild(this.dom.messagePlaceholder);

  this.dom.domObject.appendChild(this.dom.messageDiv);
  this.dom.panelFooterButtonsPlaceHolder = XDOM.createElement('DIV', null,  "edit-window-buttons");
  //this.dom.pannelFooterButtons = XDOM.createElement('DIV', null,  "pannelFooterButtons");

  this.dom.domObject.appendChild(this.dom.panelFooterButtonsPlaceHolder);
 // this.dom.panelFooterButtonsPlaceHolder.appendChild(this.dom.pannelFooterButtons);

  this.dom.saveButton = XDOM.createElement('DIV', null,  "edit-save-icon pth-icon");
  this.dom.saveButton.setAttribute("data-for-panel", this.parentObject.panelId);
  this.dom.saveButton.setAttribute("data-click-action","GUI.EditWindow.handleSubmit");
  this.dom.panelFooterButtonsPlaceHolder.appendChild(this.dom.saveButton);
  this.dom.refreshButton = XDOM.createElement('DIV', null,  "edit-refresh-icon pth-icon");
  this.dom.refreshButton.setAttribute("data-for-panel", this.parentObject.panelId);
  this.dom.refreshButton.setAttribute("data-click-action","GUI.EditWindow.handleReset");
  this.dom.panelFooterButtonsPlaceHolder.appendChild(this.dom.refreshButton);
  this.updateState();

  return this.dom.domObject;
};

/**
 *
 */
GUI.EditWindowFooter.prototype.init = function(){};


/**
 * registratie van events en het zetten van een eventuele message
 */
GUI.EditWindowFooter.prototype.updateState = function(){
  // registreren van events

  if(this.message){
    this.dom.messagePlaceholder.innerHTML = this.message;
    this.dom.messageDiv.className = "edit-window-message " + ENUM.attentionLevelReverse[this.errorLevel];
    this.dom.messageDiv.setAttribute("data-message-level" , this.errorLevel);

  }else{
    this.dom.messagePlaceholder.innerHTML = '';
    this.dom.messageDiv.className = "empty-edit-window-message";
    this.dom.messageDiv.setAttribute("data-message-level" , null);


  }

};

GUI.EditWindowFooter.prototype.setMessage = function(errorLevel,message){
	this.errorLevel = errorLevel;
	this.message = message;
	this.updateState();
};

GUI.EditWindowFooter.prototype.clearMessage = function(message,errorLevel){
	this.errorLevel = '';
	this.message = '';
	this.updateState();
};