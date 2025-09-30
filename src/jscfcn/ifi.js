// // if(!top.serverName){
// top.serverName = "pths02";
// // }
//
// // if(!top.idePort){
// //   top.idePort = 13371;
// // }
//
// var devTools = {};
//
// (function () {
//
//     const server = (window.location.protocol + "//" + top.serverName + ":" + top.idePort).toUpperCase();
//     const windows = {};
//     const captions = getCaptionSet("deftools")
//
//     function prepareDom() {
//         if (!GLOBAL.inDeveloperMode || SESSION.activePage.screenType == '*SCH') {
//             return;
//         }
//
//         let placeHolder = SESSION.activeFrame.frameElement.contentDocument.querySelector('.session-user-buttons'),
//             buttons = `
//     <div class="defButtonContainer">
//
//        <div class="session-user-button theme-hover-background-color" >
//           <i class="fa fa-database"  title="${captions.ipmf}" data-event-class="devTools" data-click="openIPMF" ></i>
//        </div>
//        <div class="session-user-button theme-hover-background-color" >
//          <i class="fa fa-link" title="${captions.directLink}" data-event-class="devTools" data-click="createLink" ></i>
//        </div>
//        <div class="session-user-button theme-hover-background-color" >
//          <i class="fas fa-bug" title="${captions.reportBug}" data-event-class="devTools" data-click="showLocation"></i>
//        </div>
//        <div class="session-user-button theme-hover-background-color" >
//          <i class="fas fa-toggle-on" title="${captions.switchCacheOff}" data-event-class="devTools" data-click="toggleCache"></i>
//        </div>
//     `;
//
//         if (top.ifiAvailable) {
//             buttons += `<div class="session-user-button theme-hover-background-color" >
//            <i class="fa fa-code" data-event-class="devTools" data-click="openIfi" ></i>
//         </div>`;
//         }
//         buttons += `</div>`; // close tag defButtonContainer
//         placeHolder.innerHTML = buttons + placeHolder.innerHTML;
//
//         SESSION.activeFrame.frameElement.contentDocument.querySelector("body").setAttribute("data-developer", "true");
//         XDOM.addEventListener(window, 'message', onMessage);
//         updateToggle()
//         subscribe (window.SCOPE.main.mainState.devTools ,updateToggle)
//     }
//
//     function updateToggle() {
//         const {useCache} = window.SCOPE.main.mainState.devTools;
//         const toggle = SCOPE.pageDoc.querySelector('[data-event-class="devTools"][data-click="toggleCache"]')
//         if(!toggle) return;
//         toggle.title = useCache ? captions.switchCacheOff : captions.switchCacheOn;
//         toggle.className = useCache  ? "fas fa-toggle-on" : "fas fa-toggle-off";
//     }
//
//     function onMessage(e) {
//         if (e.origin.toUpperCase() !== server) {
//             return;
//         }
//         if (devTools[e.data]) {
//             devTools[e.data]();
//         }
//     };
//
//     function refresh() {
//         Command.submit();
//     };
//
//     function screenshot() {
//         alert('screenshot op cliboard en ook de stack uitschrijven')
//     }
//
//     function createLink() {
//         SCOPE.main.directLink.startCollecting();
//     }
//
//
//     // function toggleCache(ev) {
//     //     const toggle = ev.event.target;
//     //     //toggle
//     //     SCOPE.main.mainState = !toggle.className.includes('toggle-on');
//     //     update()
//     //     console.log("toggleCache(ev), ", SCOPE.main.mainState);
//     // }
//
//     function showLocation() {
//         OclDefTools.location()
//     }
//
//     function openIPMF() {
//         var uri = '/' + SESSION.stack.currentSession.signOnMethode + '/ndpcgi/'
//             + SESSION.stack.currentSession.jobNr
//             + '/box/ndmctl/debug.ndm/showipmf?PFMJOBID=' + SESSION.stack.currentSession.jobNr
//             + "&AUTHTOKEN=" + SESSION.AUTHTOKEN;
//         window.open(uri, 'popupWindow', 'width=600,height=600,top=0,left=850, title=0, titlebar=0, toolbar=0, menubar=0, location=0, directories=0, status=0, resizable=1, scrollbars=1, alwaysRaised=yes, dependent=yes');
//     };
//
//
//     function update() {
//         let ifiButton = SCOPE.pageDoc.querySelector('[data-click="openIfi"]');
//         if (!ifiButton) {
//             return;
//         }
//         let app = SESSION.stack.currentMacro.application,
//             idlWindow = 'app',
//             macro = SESSION.activePage.macroName;
//
//         if (SESSION.activePage.screenType === '*SCH') {
//             app = 'dbs';
//             idlWindow = 'search';
//         }
//
//         ifiButton.setAttribute("data-app", app);
//         ifiButton.setAttribute("data-macro", macro);
//         ifiButton.setAttribute("data-window", idlWindow);
//
//     }
//
//     function openIfi(ev) {
//         if (!GLOBAL.inDeveloperMode) {
//             return;
//         }
//         let app = ev.invokeObject.dataset.app,
//             macro = ev.invokeObject.dataset.macro,
//             windowName = ev.invokeObject.dataset.window,
//             uri = server + "/client/index.php";
//
//         uri += "?remoteAction=open";
//         uri += "&userName=" + OCULUS.remoteUser;
//         uri += "&groupId=" + PFMBOX.PFMGRPID;
//         uri += "&filId=" + PFMBOX.sPFMFILID;
//         uri += "&app=" + app;
//         uri += "&macro=" + macro;
//         uri += "&origin=" + location.origin;
//         uri += "&dataServer=" + location.href.split('/usr')[0];
//
//         if (windows[windowName] && !windows[windowName].closed) {
//             windows[windowName].location.href = uri;
//         } else {
//             windows[windowName] = window.open(uri);
//         }
//     };
//
//     this.screenshot = screenshot;
//     this.prepareDom = prepareDom;
//     this.update = update;
//     this.openIPMF = openIPMF;
//     this.openIfi = openIfi;
//     this.refresh = refresh;
//     this.createLink = createLink;
//     this.showLocation = showLocation;
//     this.toggleCache = toggleCache;
//     this.update = update
// }).apply(devTools);
//
//
//
//
//
//
//
//
//
