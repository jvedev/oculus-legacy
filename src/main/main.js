// Main entry point
import { 
    TOP, MAIN, SESSION, SCOPE, MAINDOC, PAGEDOC, SESSIONDOC, 
    SETTINGS, GLOBAL, OCULUS, PFMCON, APP, PFMBOX 
} from '../../shared/globals/main-vars.js';
import '../../shared/utils/string-prototypes.js';
import { Events } from '../../shared/classes/Events.js';
import { 
    canHaveFocus, 
    getRecordNumber, 
    addInputField, 
    time, 
    timeEnd, 
    scrollIntoView, 
    activateOneButton, 
    isActive 
} from '../../shared/utils/common-utils.js';

// Make global variables available globally
window.TOP = TOP;
window.MAIN = MAIN;
window.SESSION = SESSION;
window.SCOPE = SCOPE;
window.MAINDOC = MAINDOC;
window.PAGEDOC = PAGEDOC;
window.SESSIONDOC = SESSIONDOC;
window.SETTINGS = SETTINGS;
window.GLOBAL = GLOBAL;
window.OCULUS = OCULUS;
window.PFMCON = PFMCON;
window.APP = APP;
window.PFMBOX = PFMBOX;

// Make Events class available globally
window.Events = Events;

// Make utility functions available globally
window.canHaveFocus = canHaveFocus;
window.getRecordNumber = getRecordNumber;
window.addInputField = addInputField;
window.time = time;
window.timeEnd = timeEnd;
window.scrollIntoView = scrollIntoView;
window.activateOneButton = activateOneButton;
window.isActive = isActive;

// Main specific constants and functions
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

// Make main specific functions available globally
window.G = G;
window.P = P;
window.main = main;
window.disableExtendedNav = disableExtendedNav;
window.inDevelopment = inDevelopment;

// Load the rest of the original main.js content
// This will be extracted into separate modules as well
// For now, we'll include a placeholder for the remaining functions