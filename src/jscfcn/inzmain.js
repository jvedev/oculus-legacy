/* global BrowserDetect, XDOM */

async function inzMain() {
    await Promise.all([
        loadSettings(),
        SCOPE.main.newTheme.load()]);
    onLoadApp();
    window.controllerType = 'net.data';
}

/**
 *  resuming from inzMain making it posible to do skip parts
 */
function onLoadApp() {
    disableBackButton()
    checkForSupportedBrowser();
    setGlobals();
    setEvents();
    setHoverTitle();
    setCaptions();
    setLandingspageVersion();
    Zoom.init();
    initPasswordExpiration();
    initScreenMode();
    setWebUser();
    main();
}

/**
 * resuming from onLoadApp making it posible to do skip parts
 */
function disableBackButton() {
    window.history.pushState(null, "", window.location.href);

    window.addEventListener('popstate', function () {
        window.history.pushState(null, "", window.location.href);

        // iOS-specific workaround
        if (navigator.userAgent.includes('iPad') || navigator.userAgent.includes('iPhone')) {
            setTimeout(() => {
                Confirm.show({
                    title: getCapt('titleLogOut'),
                    message: getCapt('msgLogOut'),
                    handler: ok => {
                        if (ok) top.location.reload();
                    }
                });
            }, 0);
        } else {
            Confirm.show({
                title: getCapt('titleLogOut'),
                message: getCapt('msgLogOut'),
                handler: ok => {
                    if (ok) top.location.reload();
                }
            });
        }
    });
}





/**
 * loading the main settings
 */
async function loadSettings() {
    if (!minVersion('*8A')) {
        return;
    }
    return SCOPE.main.Settings.load()
}

function setWebUser() {
    if(["WEB", "GAST"].includes(OCULUS.signOnMethode)){
        //this is a web or guest user
        //remove the settings button
        document.getElementById("settingsBtn").remove();
    }
}
function initPasswordExpiration() {


    if (hasValue(OCULUS.passwordExpirationDays) && OCULUS.passwordExpirationDays === "") {
        return;
    }

    // Todo: Decide where to keep templates like this. This is very specific to the password expiration, though.
    const template = `
        <h3 slot="header">${getCapt('passwordTitle')}</h3>
        <i slot="header" class="control-icon dialogue-close fas fa-times"></i>
        <p id="settingContentMessage" class="confirmMessage">${getCapt('gMSGPASSWORDEXPIRES1')} ${OCULUS.passwordExpirationDays} ${getCapt('gMSGPASSWORDEXPIRES2')}</p>
        <div class="wrap-centre">
            <a role="button" tabindex="0" id="alertOk" class="impButton dialogue-close">
                ${getCapt('btnOk')}
            </a>   
            <a role="button" tabindex="0" id="changePass" class="impButton dialogue-close">
                ${getCapt('gpasswordChangeButton')}
            </a>                              
        </div>    
    `;

    let dialogue = window.Dialogue.create(
        "alert-dialogue",
        template,
        "center",
        "false",
        "dialogue-medium"
    );

    window.Dialogue.open(dialogue);

    // Todo: decide whether to invoke the listener this way.
    document.getElementById("changePass").addEventListener('click', (e) => {
        e.preventDefault();

        // XDOM invoke for legacy versions, else do sidebar stuff
        if (OCULUS.navigatorVersion == '*7D') {
            XDOM.invokeClick(document.getElementById('settingsBtn'));
            XDOM.invokeClick(document.getElementById('changePasswordBtn'));
        } else {
            window.Sidebar.launchResetPassword();
        }
    });
}

function setGlobals() {
    OCULUS.sessionResolution = XDOM.returnResolutionMode();
    OCULUS.procedureHelpUrl = null;
    //OCULUS.debugMode = SCOPE.main.Settings.get('ENABLE_DEBUG_TOOLS');

}

function setEvents() {
    window.onkeydown = OCULUS.checkKeyCode;
    window.onkeyup = OCULUS.removeKeyCode;

    //XDOM.addEventListener(window, "resize", function() {
    //  SCREEN.handleResize();
    //});
}

function oculusChangePassword() {

    var user = OCULUS.remoteUser;
    var currentPW = null;
    var newPW = null;
    var validatePW = null;

    var validateFields = ["currentPasswordInput", "newPasswordInput", "validatePasswordInput"];

    var validateObj = null;
    var hasErrors = false;

    validateFields.forEach(function (entry) {

        validateObj = XDOM.getObject(entry);
        if (validateObj === null || validateObj.value === "") {
            hasErrors = true;
            XDOM.classNameReplaceOrAdd(validateObj, 'validateError', 'validateError');
        } else {

            switch (entry) {
                case "currentPasswordInput":
                    currentPW = validateObj.value;
                    break;
                case "newPasswordInput":
                    newPW = validateObj.value;
                    break;
                case "validatePasswordInput":
                    validatePW = validateObj.value;
                    break;
            }

            XDOM.classNameRemove(validateObj, 'validateError');
        }

    });

    if (!hasErrors) {
        changePassword(user, currentPW, newPW, validatePW);
    }
}

function initScreenMode() {
    //var cssSheet = null;
    //FF probleem - disable van een stylesheet moet na het laden gebeuren
    //cssSheet = document.getElementById("dynamicFullHDStyle");
    //cssSheet.disabled = true;
    OCULUS.sessionResolution = XDOM.returnResolutionMode();
}


function setLandingspageVersion() {
    var bodyObj = document.getElementsByTagName('body')[0];
    if (bodyObj) {
        bodyObj.setAttribute("data-active-landingspage-version", top.landingspageVersion);
        bodyObj.setAttribute("data-compatible-landingspage-version", OCULUS.compatibleLandingspage);
    }
}

function changePassword(user, currentPW, newPW, valPW) {
    const current = encodeURIComponent(currentPW)
    const newPassword = encodeURIComponent(newPW)
    const repeatPassword = encodeURIComponent(valPW)

    const  url = OCULUS.monitorJobCGI + '/box/ndmctl/saveSettings.ndm/main?USER_ID=' + user +
        '&USER_PASSWORD_CURRENT=' + current +
        '&USER_PASSWORD_NEW=' + newPassword +
        '&USER_PASSWORD_REPEAT=' + repeatPassword
        + '&PFMGRPID=' + OCULUS.userGroup;


    advAJAX.get({
        url: url, onError: function () {
            console.log('changePassword  ajax call mislukt');
        }, onSuccess: function (obj) {

            var xmlDoc = XDOM.getXML(obj.responseText);
            var returnTxt = null;
            var returnCode = xmlDoc.getElementsByTagName("returnCode")[0].childNodes[0].nodeValue;

            if (xmlDoc.getElementsByTagName("messageText")[0].childNodes[0]) {
                returnTxt = xmlDoc.getElementsByTagName("messageText")[0].childNodes[0].nodeValue;
            }

            // clear inputfields
            var clearFields = ["currentPasswordInput", "newPasswordInput", "validatePasswordInput"];
            var clearObj = null;

            clearFields.forEach(function (entry) {
                clearObj = XDOM.getObject(entry);
                if (clearObj) {
                    clearObj.value = "";
                    clearObj.innerHTML = "";
                }
            });

            if (returnCode === "OK") {
                displaySavedMsg("passwordChanged");
            } else {
                displaySavedMsg("passwordError", returnTxt);
            }
        }, onRetry: function () {
            console.log('Opnieuw proberen');
        }
    });
}

var messageTimer = null;

function setCaptions() {
    jQuery.each($("[data-set-caption]"), function (i, val) {
        $(val).html(getCapt(val.dataset.setCaption));
    });
}

function setHoverTitle() {
    jQuery.each($("[data-set-title]"), function (i, val) {
        $(val).attr("title", getCapt(val.dataset.setTitle));

    });
}

function displaySavedMsg(fsSavedObj, fsMsgTxt) {

    var msgObj = XDOM.getObject("settingsOptionsMsg");
    if(!msgObj) return;
    var msgValue = "";
    if (fsSavedObj === "theme") {
        msgValue = getCapt('gMSGSAVINGTHEME');
    } else if (fsSavedObj === "zoomFactor") {
        msgValue = getCapt('gMSGSAVINGZOOMFACTOR');
    } else if (fsSavedObj === "screenSetting") {
        msgValue = getCapt('gMSGSAVINGSCREENSETTING');
    } else if (fsSavedObj === "passwordChanged") {
        msgValue = getCapt('gMSGSAVINGPASSWORD');
    } else if (fsSavedObj === "passwordError") {
        msgValue = fsMsgTxt;
    } else {
        msgValue = getCapt('gMSGSAVINGERROR');
    }

    msgObj.className = "show";
    msgObj.innerHTML = msgValue;

    clearTimeout(messageTimer);
    messageTimer = setTimeout(hideSavedMsg, 10000);

}

function hideSavedMsg() {
    var msgObj = XDOM.getObject("settingsOptionsMsg");
    if (msgObj) {
        msgObj.className = "hide";
    }

}