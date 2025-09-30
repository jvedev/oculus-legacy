var  User = {};

(function () {

	function gotoLogin(ok){
		if(ok){window.top.location.reload();}
		let id =SCOPE.session.SESSIONFRAME.frameElement.id.split('_')[1],
			session = NAV.Session.instances[id];

		SessionTab.closeJob(session.jobNr);
		return;
	}

	function errorUser(){
		//inloggen of annuleren 
		let obj = {};
		obj.title = getCapt('errorNewSessionTitle');
		obj.txtYes =getCapt('errorNewSessionBtnLogin');
		obj.txtNo = getCapt('errorNewSessionBtnClose');
		obj.handler = gotoLogin;
		obj.message=errorNewSession();
		Confirm.show(obj);	
	}
	function check(){
		 if(!SCOPE.session){
		 	return true;
		 }

		if(SCOPE.session.PFMRMTUS !== OCULUS.remoteUser){
			console.log('check user mislukt');
			return true;
			errorUser();
			return false;
		}
		return true;
	}

	
	
	function  errorNewSession(){
		return `${getCapt('errorNewSession1')} ${SCOPE.session.PFMRMTUS} <br>
				${getCapt('errorNewSession2')} ${SCOPE.session.PFMRMTUS} <br><br>
				${getCapt('errorNewSession3')}`;
	  }

	this.check = check;
}).apply( User);

