var Zoom = {};
(function () {
	let zoomIn = false;
	function set(level){
		if(minVersion('*8A')) {
			return;
		}
		const zoomFactor = level || SCOPE.main.Settings.get('ZOOM_FACTOR')
		zoomIN = false;
		if(MAIN.OCULUS.zoomLevel < zoomFactor) {
			zoomIN == true;
		}
		MAIN.OCULUS.zoomFactor = level;
		MAIN.OCULUS.zoomLevel =  zoomFactor;
		session(zoomFactor);
		main(zoomFactor);
	}

	function session(){
		for (let ses of NAV.Session.instances) {
			if (ses && ses.zoom) {
				if (zoomIN) {
					ses.zoomIn();
				} else {
					ses.zoomOut();
				}
			}
		}
	}

	function main(level) {
		if(minVersion('*8A')) {
			return;
		}
		const zoomFactor = level || SCOPE.main.Settings.get('ZOOM_FACTOR');
		let bodyObj = document.getElementsByTagName('body')[0],
			zoomObject = MAIN.OCULUS.zoomFactors[zoomFactor];
		
		if(!bodyObj){return;}

		if (BrowserDetect.isFirefox) {
			if (zoomObject.scaleFactor == "1") {
				bodyObj.style.MozTransform = "none";
			} else {
				bodyObj.style.MozTransform = `scale("${zoomObject.scaleFactor})`;
			}
		} else {
			bodyObj.style.zoom = zoomObject.zoomFactor;
		}
	};
  
	function save(zoomFactor) {
		var fsDIRPT = OCULUS.monitorJobCGI + '/box/ndmctl/saveSettings.ndm/main?USER_ZOOMFACTOR=' + MAIN.OCULUS.zoomLevel 
			+ '&USER_ID=' + OCULUS.remoteUser 
			+ "&AUTHTOKEN=" + SESSION.AUTHTOKEN                 
			+ '&PFMGRPID=' + OCULUS.userGroup;
		MAIN.OCULUS.originZoomLevel = MAIN.OCULUS.zoomLevel;

		advAJAX.get({url : fsDIRPT, onError : function(obj) {
			console.log('saveZoomFactor  ajax call mislukt');
		}, onSuccess : function(obj) {
			var xmlDoc = XDOM.getXML(obj.responseText);
			var returnCode = xmlDoc.getElementsByTagName("returnCode")[0].childNodes[0].nodeValue;
			if (returnCode == "OK") {
				displaySavedMsg("zoomFactor");
			} else {
				displaySavedMsg("failure");
			}
		}, onRetry : function(obj) {
			console.log('Opnieuw proberen');
			} 
		});
	};

	
  function init() {
	// const zoomFactor = SCOPE.main.Settings.get('ZOOM_FACTOR');
	// if (!OCULUS.zoomFactor) {
	//   MAIN.OCULUS.zoomLevel = "100";
	// } else {
	//   MAIN.OCULUS.zoomLevel = OCULUS.zoomFactor;
	// }
	main();
  }  

  this.init = init;
  this.set = set;
  this.save = save;

}).apply( Zoom);