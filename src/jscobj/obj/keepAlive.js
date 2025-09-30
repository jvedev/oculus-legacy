function KeepAlive(){}

KeepAlive.totalTrys  = 5;
KeepAlive.interval = 90000; //normale interval //90000
KeepAlive.intervalOnFail = 20000; //interval bij valen
KeepAlive.tryCount = KeepAlive.totalTrys;
//KeepAlive.inProgress = false;

KeepAlive.timer = null;

KeepAlive.request = function(){

	if(SESSION.submitInProgress) { return; }

	if(SESSION.session.jobState=='END'){
	    return;
    }
	SESSION.submitInProgress = true;

  var fsPath = SESSION.cgiAliasDir + '/box/ndmctl/kpajob.ndm/kpajob?'+
              'PFMRMTUS=' + SESSION.remoteUser
              + '&PFMFILID=' + SESSION.enviroment
              + '&PFMJOBID=' + SESSION.jobId
              + "&AUTHTOKEN=" + SESSION.AUTHTOKEN 
  advAJAX.setDefaultParameters({}); // reset AJAX

  advAJAX.get({
    url : fsPath,
    onError : KeepAlive.onError,
    onSuccess :KeepAlive.onSuccess
  });

};

KeepAlive.onError = function(){
	if(!KeepAlive){
		return; //Sessie is gesloten maar KPA request was al onderweg
	}
	SESSION.submitInProgress = false;
	if(KeepAlive.tryCount > 0){
     KeepAlive.tryCount--;
     KeepAlive.timer = setTimeout(KeepAlive.request, KeepAlive.intervalOnFail);
  }else{
    window.status= "Activeren taak " + SESSION.jobId + " niet gelukt; sessie wordt afgesloten";
  }
  return;
};

KeepAlive.update = function(){
	window.status = '';
};

KeepAlive.onSuccess = function(){
	if(!KeepAlive){
		return; //Sessie is gesloten maar KPA request was al onderweg
	}
	SESSION.submitInProgress = false;
  KeepAlive.start();
};

KeepAlive.cancel = function(){
  // ***************************************************************************
  // Keep alive job stoppen
  // ***************************************************************************
  clearTimeout(KeepAlive.timer);
  KeepAlive.tryCount = KeepAlive.totalTrys;
  return;
};

KeepAlive.start = function(){
  // ***************************************************************************
  // Keep alive job gelukt - Volgende schedulen
  // ***************************************************************************

  KeepAlive.cancel();

  KeepAlive.timer = setTimeout(KeepAlive.request, KeepAlive.interval);
  return;
};




