//screen functions
function SCREEN() {}

SCREEN.initScreenSize = function(scrSize, sessionObj, isSessionOverlay) {
  var foSession = sessionObj;
  var screenSize = scrSize;
  var foActiveFrame = null;
  var fsLargeScreen = 'largeScreen';
  var fsHighScreen = 'highScreen';
  var fsMediumScreen = 'mediumScreen';

  if (foSession && screenSize) {
    foActiveFrame = foSession.frameObject;
    var oldMacroResolution = foSession.macroResolution;

    if (isSessionOverlay) {
      if(SCOPE.session.SESSION.activePage.screenType!=='*SCH'){
        SCOPE.sessionDoc.getElementById('topViewheader').setAttribute('data-screen-size', screenSize);
      }
    } else {
      switch (screenSize) {
        case ENUM.screenSize.large:
          if (foActiveFrame.getAttribute('data-screen-size') !== fsLargeScreen) {
            foActiveFrame.setAttribute('data-screen-size', fsLargeScreen);
          }

          foSession.macroResolution = fsLargeScreen;

          break;
        case ENUM.screenSize.high:
          if (foActiveFrame.getAttribute('data-screen-size') !== fsHighScreen) {
            foActiveFrame.setAttribute('data-screen-size', fsHighScreen);
          }
          foSession.macroResolution = fsHighScreen;
          break;
        default:
          if (foActiveFrame.getAttribute('data-screen-size') !== fsMediumScreen) {
            foActiveFrame.setAttribute('data-screen-size', fsMediumScreen);
          }
          foSession.macroResolution = fsMediumScreen;

          break;
      }
    }

    if (foSession.macroResolution !== oldMacroResolution) {
      foSession.updateResolutionMode();
    }
  }
};

SCREEN.handleMacroLoad = function(macroScreenSize) {
  var bodyWrapper = document.getElementById('applicationMainWrapper');
  var currentInstance = NAV.Session.currentInstance;
  var sessionWrapper = currentInstance?XDOM.getObject('sessionContainer', currentInstance.frameObject.contentDocument):null;
  switch (macroScreenSize) {
    case ENUM.screenSize.large:
      bodyWrapper.setAttribute('data-screen-size', 'largeScreen');
      if (sessionWrapper) {
        sessionWrapper.setAttribute('data-screen-size', 'largeScreen');
      }
      break;
    case ENUM.screenSize.high:
      bodyWrapper.setAttribute('data-screen-size', 'highScreen');
      if (sessionWrapper) {
        sessionWrapper.setAttribute('data-screen-size', 'highScreen');
      }
      break;
    default:
      bodyWrapper.setAttribute('data-screen-size', 'defaultScreen');
      if (sessionWrapper) {
        sessionWrapper.setAttribute('data-screen-size', 'defaultScreen');
      }
      break;
  }
  SCREEN.marcoScreenSize = macroScreenSize;
};
