
/**
 * voor de vertaling van messageCodes naar taal afhankelijke strings
 * @version V8R3M22 POM-2275 alert naar setMessage overgezet, tekst in variabele t.b.v. vertaaling
 */
var MESSAGES = {};
var ERRORMESSAGES = {};
/**
 * wordt bij prepareDom aangeroepen omdat dan pas de taalafhankelijke variabelen zijn geladen
 * @returns {void}
 */
MESSAGES.prepare = function(){
  MESSAGES.Success=getCapt('msgSuccess');
  MESSAGES.HandlerError=getCapt('msgHandlerError');
  MESSAGES.ArchiveNotFound=getCapt('msgArchiveNotFound');
  MESSAGES.ConfError=getCapt('msgConfError');
  MESSAGES.KeyError=getCapt('msgKeyError');
  MESSAGES.DocNotFound=getCapt('msgDocNotFound');
  MESSAGES.SymLinkError=getCapt('msgSymLinkError');
  MESSAGES.extentionNotSupported=getCapt('msgExtentionNotSupported');


  ERRORMESSAGES['HeaderRequired'] 	= {"caption": getCapt('gQSEARCHHEADERREQUIRED'), messageLevel:'message'	};
  ERRORMESSAGES['InputRequired']  	= {"caption": getCapt('gQSEARCHINPUTREQUIRED'), 	messageLevel:'OK'	};
  ERRORMESSAGES['InvalidInput']  		= {"caption": getCapt('gQSEARCHINVALIDINPUT'), 	messageLevel:'error'	};
  ERRORMESSAGES['SqlPrepareError'] 	= {"caption": getCapt('gQSEARCHSQLPREPAREERR'), 	messageLevel:'error'	};
  ERRORMESSAGES['SqlFetchError'] 		= {"caption": getCapt('gQSEARCHSQLFETCHERR'), 		messageLevel:'error'	};
  ERRORMESSAGES['ResultSetEmpty'] 	= {"caption": getCapt('gQSEARCHRESULTSETEMPTY'), messageLevel:'OK'	};
  ERRORMESSAGES['SubfileFull'] 	    = {"caption": "", messageLevel:'OK'	};
  ERRORMESSAGES['ParameterError'] 	    = {"caption": getCapt('gMESSAGEPARAMETERERROR'), messageLevel:'error'	};
  ERRORMESSAGES['DataError'] 	    = {"caption": getCapt('gMESSAGEDATAERROR'), messageLevel:'error'	};
  ERRORMESSAGES['DataWarning'] 	    = {"caption": getCapt('gMESSAGEDATAWARNING'), messageLevel:'warning'	};
  ERRORMESSAGES['GenericError'] 	    = {"caption": getCapt('gMESSAGEGENERIC'), messageLevel:'error'	};

     


};

