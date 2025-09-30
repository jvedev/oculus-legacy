/**
 * object voor het vastleggen van file Links
 * @param fsURL
 * @returns
 */
function Batch(){}
Batch.prepareDom  = function(){
  var textCode = '', text='';
  var messageDiv = XDOM.query('[data-message-label]',SESSION.activeForm);
  if(messageDiv){
   textCode = messageDiv.getAttribute("data-message-label");
   text = getCaption(textCode);
   setMessage("A",text);
  }
};

Batch.update  = function(){
  if(SESSION.activePage.immediateSubmit){
    FieldAttribute.hide(XDOM.getObject('ACCEPT'));
    Command.execute('ACCEPT');
  }
  
};
 