//document.addEventListener("DOMContentLoaded",main);

const G = {}; //Global objects
const P = {}; //pantheon general functions

OCULUS.environmentTheme = {};

function main() {
  top.SCOPE = SCOPE;
  SCOPE.landingPage = top;
  SCOPE.main = window;
  SCOPE.mainDoc = document;
  Events.register();

  if (OCULUS.extendedNav) {
    G.userMenu = new AdministrationMenu(USRMNU);
    AdminMenu.render(G.userMenu);
  } else {
    // Add tablet mode to the main document
    SCOPE.mainDoc.body.classList.add('tablet-mode');

    document.querySelector('.application-logo img').src = `/userFiles/images/productlogo_OCL.png`;
  }
  disableExtendedNav();

  window.Sidebar = createSideBar('sidebar', document.body);
  // this is because of chrome trouble
  setTimeout(function () {
    loadDirectLink();
  }, 300);

}

function disableExtendedNav() {
  if (OCULUS.extendedNav) {
    return;
  }
  AdminMenu.tabletMode();
  NAV.Session.directStart();
}

function inDevelopment(){
  return (OCULUS.devStage == '*DEV');
}



