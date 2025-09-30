/**
 * class voor 1 losse thread van messages
 * @returns
 */
function MessageThread(){
  this.initialMessage=false;
  this.lastMessage=false;
  this.autoExit = false;
  this.hasErrors = false;
  this.threadNumber = 0;
}

/**
 * message controler
 * @returns
 */
function Messages(){
  this.threads=new Array();
  this.currentThread= null;
  this.timeOutPointer = null;
  this.popUpDomObject = null;
  this.resultable = null;
  this.scrollValue = 0;
  this.exitMessage = '';
  this.exitCode = null;
}

Messages.update = function(){
  Messages.closeWindow();
  Messages.reopen();
};

/**
 * enum van returncodes
 */
Messages.returnCode = {
    'initialMessage':'IM',
    'message':'MG',
    'noMessage':'',
    'notFound':'NF',
    'lastMessage':'LM',
    'error':'ER',
    'ok':'OK'
};


/**
 * static aanmaken van nieuwe thread
 */
Messages.newThread = function(command){
  if (command == 'ACCEPT' && SESSION.activePage.messageQueue == '*EXC') {
    var foMessage = Messages.currentInstance;
    var msgThread = new MessageThread();
    foMessage.threads.push(msgThread);

	  msgThread.threadNumber = foMessage.threads.length;

    if(!foMessage.currentThread){
      foMessage.currentThread = foMessage.threads.shift();
      foMessage.timeOutPointer = setTimeout("Messages.requestMessage()", 100);
    }
  }
};

/**
 * static aanvragen van nieuwe message
 * @returns {Boolean}
 */
Messages.requestMessage = function() {

  // ***************************************************************************
  // Aanroep van het programma dat kijkt of er een bericht is.
  // parms:  tDELAY=eventueel met een vertraging uitvoeren om de server te
  //         ontlasten.
  // return: --
  // ***************************************************************************
  var fdDATE=new Date();
  var ftTMSTM=fdDATE.getTime();
  var fsDIRPT=OCULUS.monitorJobCGI
    + "/box/ndmctl/rcvnetmsg.ndm/NetMessage.xml?gCD_LNG=" + SESSION.language 
    + "&JOBNR="    + SESSION.jobId
    + "&JOBKEY="   + PFMBOX.JOBKEY
    + "&PFMFILID=" + PFMBOX.gCD_ENV
    + "&AUTHTOKEN="+ SESSION.AUTHTOKEN 
    + "&TMSTM="    + ftTMSTM;
   advAJAX.get({
    url : fsDIRPT,
    tag : {},
    onSuccess : function(obj) { Messages.handleResponse(obj);}
  });
 return true;
};



Messages.closeWindow = function(){
  var foMessage = Messages.currentInstance;
  if(foMessage.popUpDomObject && !foMessage.currentThread){
		Messages.close();
  }
};

/**
 * static als de pagina wordt herladen en er worden nog berichten opgehaald dan wordt
 * het venster met de vorige berichten door middel van deze functie weer getoond
 */
Messages.reopen = function(){
  var foMessage = Messages.currentInstance;
  if(!foMessage.popUpDomObject){
    return; //-->
  }

	if(foMessage.currentThread){
		if(foMessage.currentThread.hasErrors){
		  setMessage( foMessage.currentThread.returnCode, foMessage.currentThread.messageText);
	  	var cmdDiv = XDOM.getObject("CMDDIV");
	  	cmdDiv.className = "STS_E";
	  }
	}


//  var foMAIN=XDOM.getObject('messageWrapper');
//  foMAIN.appendChild(foMessage.popUpDomObject);
//  foMessage.timeOutPointer = setTimeout("Messages.requestMessage()", 100);
};

/**
 * static handeld andwoordt van de server af
 * @param obj
 */
Messages.handleResponse = function(obj){
  Messages.currentInstance.handleResponse(obj);
};

/**
 * static sluit het berichten scherm mits er geen berichten meer worden opgehaald
 * deze functie wordt aan het einde van elke thread bij een "last Message" (LM) aangeroepen. als er echter tussentijds
 */
Messages.close = function(){

    var foMessage = Messages.currentInstance;
	  var foMAIN=XDOM.getObject('messageWrapper');
	  foMAIN.className = 'hidden';

	  setMessage( foMessage.exitCode, foMessage.exitMessage);
	  foMessage.exitMessage = '';
	  foMessage.exitCode = '';

	  if(!foMessage.currentThread ){ //er is nog een nieuwe thread die berichten moet tonen er kan dus niet gesloten worden
	    XDOM.removeDOMObject(foMessage.popUpDomObject);
	    foMessage.popUpDomObject = null;
	  }

	  setCursor();

  return;
};

/**
 * static placeholder voor huidige controler
 */
Messages.currentInstance = new Messages();
// ***************************************************************************
// Afhandeling van het antwoord van de server als er een bericht is
// parms:  fOBJ=Ajax request object
// return: --
// Als er een bericht is en deze begint niet met code NF dan wordt er een
// popup JOBMSG getoond. Vervolgens wordt er een nieuwe aanvraag gedaan met
// kleine vertraging. Bij elk antwoord met code NF wordt de vertraging groter
// om de server te ontlasten.
// Als antwoord OK dan wordt de popup na .. tijd gesloten.
// ***************************************************************************
Messages.prototype.handleResponse = function(obj) {

  if(!this.currentThread) { return; } //-->
  var xmlDoc = XDOM.getXML(obj.responseText);
 	this.currentThread.returnCode 	= xmlDoc.getElementsByTagName("returnCode")[0].childNodes[0].nodeValue;
	this.currentThread.autoExitCode = xmlDoc.getElementsByTagName("userExit")[0].childNodes[0].nodeValue;

  switch(this.currentThread.returnCode){

    case Messages.returnCode.initialMessage:
      this.currentThread.initialMessage = true;
      this.timeOutPointer = setTimeout("Messages.requestMessage()", 250);
      break;

    case Messages.returnCode.noMessage:
    case Messages.returnCode.notFound:
      this.timeOutPointer = setTimeout("Messages.requestMessage()", 250);
      break;

    case Messages.returnCode.lastMessage:
      if(!this.currentThread.initialMessage){
        //oude last message deze negeren dit zou niet voor mogen komen;
        this.timeOutPointer = setTimeout("Messages.requestMessage()", 250);
        return;
      }

      this.closeThread();
      break;
    case Messages.returnCode.error:
      this.currentThread.hasErrors = true;
      this.currentThread.autoExit=(this.currentThread.autoExitCode != 'U');
      this.displayMessage(obj);
      setMessage( this.currentThread.returnCode, this.currentThread.messageText);
      var cmdDiv = XDOM.getObject("CMDDIV");
      cmdDiv.className = "STS_E";

      this.timeOutPointer = setTimeout("Messages.requestMessage()", 500);
      break;
    case Messages.returnCode.ok:
      this.currentThread.autoExit=(this.currentThread.autoExitCode !='U');
      this.displayMessage(obj);
      this.timeOutPointer = setTimeout("Messages.requestMessage()", 500);
      break;
    case Messages.returnCode.message:
      this.displayMessage(obj);
      this.timeOutPointer = setTimeout("Messages.requestMessage()", 50);
      break;
  }
};

/**
 * sluit huidige messageThread
 */
Messages.prototype.closeThread = function(){
  this.currentThread.lastMessage=true;
  if(this.currentThread.hasErrors){
    this.exitCode = 'F';
  }

  if(this.currentThread.autoExit){
    setTimeout("Messages.close()",2000);
  }

  this.currentThread = this.threads.shift();
  if(!this.currentThread){
    clearTimeout(this.timeOutPointer);
  }else{
    this.timeOutPointer = setTimeout("Messages.requestMessage()", 100);
  }
  return;
};

/**
 * renderen van de popup van het boodschappenscherm
 * @param obj
 */
Messages.prototype.renderPopup = function(obj){
  if(this.popUpDomObject){return;} //-->

  var foMAIN=XDOM.getObject('messageWrapper');

  foMAIN.className = '';

  this.popUpDomObject=XDOM.createElement('div','JOBMSG');
  this.popUpDomObject.setAttribute("data-click-action", "Messages.close");

  foMAIN.appendChild(this.popUpDomObject);
  positionDiv(this.popUpDomObject);

  var fiBRWDIM=getBrowserDim();
  var fiWDT=this.popUpDomObject.offsetWidth;
  this.popUpDomObject.style.left=(fiBRWDIM.BRWWDT/2)-(fiWDT/2)+'px';
  this.popUpDomObject.style.left = "0px";
  this.popUpDomObject.innerHTML='<div class="popTitle theme-background-color">' +  getCapt('gUSER') + ': '+  PFMBOX.PFMRMTUS
    +' -' + getCapt('gJOB') + ': '+SESSION.jobId+' <div id="closeMsgBtn" class="MEXIT popup-close pth-icon"></div> </div>'
    +'<div id="JOBMSGDIV">'
    +'<table id="JOBMSGTBL">'
    +'<colgroup><col id="COL1" class="xsize03" /><col id="COL2"  /></colgroup></table></div>';

  this.resultable =XDOM.getObject('JOBMSGTBL');

  var closeBtn = XDOM.getObject('closeMsgBtn');
  closeBtn.setAttribute("data-click-action", "Messages.close");
};

function positionDiv() {
  // ***************************************************************************
  // Positioneerd het opgegeven object in het midden van de beschikbare
  // hoogte en breedte van de browser.
  // parms: foDIV=te positioneren object
  // return: --
  // ***************************************************************************
  var foDIV = arguments[0];

  var fiBRWDIM = getBrowserDim();
  var fiWDT = foDIV.offsetWidth;
  foDIV.style.left = (fiBRWDIM.BRWWDT / 2) - (fiWDT / 2) + 'px';
  return;
}




/**
 * uitschrijven van 1 bericht naar het boodschappen scherm
 * @param obj
 */
Messages.prototype.displayMessage = function(obj){

  this.renderPopup();
  //this.currentThread.messageText = obj.responseText.substr(5);

  var xmlDoc = XDOM.getXML(obj.responseText);
  if(!xmlDoc.getElementsByTagName("messageText")[0].childNodes[0]){
    return;
  }
 	this.currentThread.messageText 	= xmlDoc.getElementsByTagName("messageText")[0].childNodes[0].nodeValue;


  var foTr = XDOM.createElement('TR',null);
  var foTd = XDOM.createElement('TD',null, null);
  var foIcon = XDOM.createElement('i',null,'pth-icon msg_'+this.currentThread.returnCode);
  var foTxtTd = XDOM.createElement('TD',null);
  var foTxtNode = XDOM.createTextNode(this.currentThread.messageText);

  this.resultable.appendChild(foTr);
  foTd.appendChild(foIcon);
  foTr.appendChild(foTd);
  foTr.appendChild(foTxtTd);
  foTxtTd.appendChild(foTxtNode);


	//scroll to results in msg div
  var resultContainer = XDOM.getObject('JOBMSGDIV');
  if(resultContainer){
  	resultContainer.scrollTop = resultContainer.scrollHeight;
  }
  this.exitMessage = this.currentThread.messageText;
  return;
};
