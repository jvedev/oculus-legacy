var userSettings = {};
(function () {
    let themes = [
        'PINK',
        'RED',
        'ORANGE',
        'YELLOW',
        'GREEN',
        'MINT',
        'AQUA',
        'BLUE',
        'PURPLE',
        'GREY'
    ];

    function open() {
        if (minVersion('*8A')) {
            Sidebar.open('launchFreshSettings', true);
        } else {
            ModalPanel.open(template.userSettings.container());
            renderZoom();
            renderThemes();
        }
    }

    function themePicker() {
        ModalPanel.open(template.userSettings.ThemeContainer());
        sessionThemePickerButtons();
    }


    function renderZoom() {
        let placeHolder = XDOM.getObject('zoomContentField');
        placeHolder.innerHTML = MAIN.OCULUS.zoomFactors
            .map(template.userSettings.zoomButton)
            .join('');
        let activeButton = placeHolder.querySelector(
            `.zoomBtn[data-zoom-key="${MAIN.OCULUS.zoomFactor}"]`
        );
        if (activeButton) {
            activeButton.setAttribute('data-button-state', 'active');
        }
    }

    function sessionThemePickerButtons() {
        let placeHolder = XDOM.getObject('themeContentField');
        let environment = SCOPE.session.SESSION.session.enviroment
        placeHolder.innerHTML = themes
            .map(template.userSettings.currentSessionThemeButton)
            .join('');
        activeButton = placeHolder.querySelector(
            `.userThemeBtn[data-color="${SCOPE.main.newTheme.getTheme(environment)}"]`
        );
        if (activeButton) {
            activeButton.setAttribute('data-button-state', 'active');
        }
    }


    function renderThemes() {
        let placeHolder = XDOM.getObject('themeContentField');
        const currentEnvironemt = SCOPE.mainDoc.body.getAttribute('data-active-environment') || 'MAIN';
        placeHolder.innerHTML = themes
            .map(template.userSettings.themeButton)
            .join('');
        activeButton = placeHolder.querySelector(
            `.userThemeBtn[data-color="${SCOPE.main.newTheme.getTheme(currentEnvironemt)}"]`
        );
        if (activeButton) {
            activeButton.setAttribute('data-button-state', 'active');
        }
    }

    function showPart(ev) {
        let part = ev.invokeObject.dataset.part,
            title = ev.invokeObject.dataset.title,
            overallPlaceHolder = XDOM.getObject('settingsOptionsContent'),
            titlePlaceholder = XDOM.getObject('settingContentTitle'),
            buttons = document.querySelectorAll(
                '#settingsOptions .settingsMenuBtn[data-button-state]'
            ),
            placeHolder = overallPlaceHolder.querySelector(
                `[data-placeholder="${part}"]`
            );

        XDOM.setAttributesToNodeList(
            overallPlaceHolder.querySelectorAll('[data-placeholder]'),
            'data-open',
            'false'
        );
        activateOneButton(buttons, ev.invokeObject);

        placeHolder.setAttribute('data-open', 'true');
        titlePlaceholder.innerHTML = title;
        //ev.invokeObject.setAttribute("data-button-state", "active");
    }

    function setThemeBase(ev) {
        let buttons = ev.invokeObject.parentElement.querySelectorAll(
            '[data-button-state]'
        );
        activateOneButton(buttons, ev.invokeObject);
        //get the active environment
        const adminTile = XDOM.query('a div.administrationOption[data-button-state="active"]');
        const activeSessionEnv = NAV.Session?.currentInstance?.enviroment;
        const activeTileEnv = adminTile?.getAttribute('data-option-env')

        //get the environemten this is either from the active session, the active admin tile or main
        const environment = activeSessionEnv || activeTileEnv || 'MAIN'
        const theme = ev.invokeObject.dataset.color || SCOPE.main.newTheme.getTheme(environment);
        return {environment, theme}
    }

    /**
     * sets theme for this job (session)
     *
     * @param ev
     */
    function setSession(ev) {

        const {environment, theme} = setThemeBase(ev)
        if (minVersion('*8A')) {
            SCOPE.main.newTheme.update(environment, theme);
            return;
        }
        const job = SCOPE.session.SESSION.session.jobNr
        SCOPE.main.newTheme.updateJobOnly(job, theme);
    }

    async function setTheme(ev) {
        let {environment, theme} = setThemeBase(ev);
        if(!minVersion("8A")){
            //we must be in 7D here you can only set the main colour.
            environment = 'MAIN';
        }
        const result = await SCOPE.main.newTheme.update(environment, theme);
        displaySavedMsg(result);
    }

    function setZoom(ev) {
        const buttons = document.querySelectorAll(
            '#zoomContentField [data-button-state]'
        );
        activateOneButton(buttons, ev.invokeObject);
        Zoom.set(ev.invokeObject.dataset.zoomKey);
        Zoom.save();
    }

    function savePassword(ev) {
        oculusChangePassword();
    }

    function close() {
        ModalPanel.click();
    }

    function print() {
        let printScreenFrame = XDOM.getObject('printScreenContentField');

        if (printScreenFrame) {
            printScreenFrame.contentWindow.focus();
            printScreenFrame.contentWindow.print();
        }
    }

    function download(e) {
        let placeHolder = XDOM.getObject('printScreenContentField'),
            eventObject = e.invokeObject,
            printScreenCanvas = XDOM.getObject(
                'printScreenCanvas',
                placeHolder.contentDocument.body
            );
        const canvasFileName = printScreenCanvas.dataset.fileName;

        eventObject.href = printScreenCanvas.toDataURL();
        eventObject.download = canvasFileName;
    }

    function copy() {
        let placeHolder = XDOM.getObject('printScreenContentField'),
            printScreenCanvas = XDOM.getObject(
                'printScreenCanvas',
                placeHolder.contentDocument.body
            );

        // Try/catch for https check on secure content
        try {
            // Check the secure content and throw an exception
            if (!window.isSecureContext) throw "Connection not secure, try running over https or localhost for clipboard access";

            // If fine then run code
            printScreenCanvas.toBlob(blob => navigator.clipboard.write([new ClipboardItem({'image/png': blob})]));
        } catch (error) {
            // Log other errors
            console.log(error);
        }
    }

    this.keydown = ModalPanel.keydown;
    this.setSession = setSession;
    this.themePicker = themePicker;
    this.printScreen = window.print.printScreen;
    this.setZoom = setZoom;
    this.savePassword = savePassword;
    this.setTheme = setTheme;
    this.showPart = showPart;
    this.open = open;
    this.close = close;
    this.print = print;
    this.download = download;
    this.copy = copy;
    //this.copy = copy;
}.apply(userSettings));

template.userSettings = {};

template.userSettings.currentSessionThemeButton = function (theme) {
    return `
		<div data-color="${theme}" data-click="setSession" data-event-class="userSettings" class="userThemeBtn">
			<span class="background-color"></span>
		</div>`;
};

template.userSettings.themeButton = function (theme) {
    return `
		<div data-color="${theme}" data-click="setTheme" data-event-class="userSettings" class="userThemeBtn ">
			<span class="background-color"></span>
		</div>`;
};

template.userSettings.zoomButton = function (def) {
    return `<div class="zoomBtn" data-zoom-key="${def.zoomKey}" data-click="setZoom" data-event-class="userSettings">
					<span class="zoomFactor">${def.buttonTxt}</span>
				</div>`;
};

template.userSettings.container = function () {
    return `
  <div id="settingsWrapper"  data-event-class="'userSettings" >
    <div id="settingsTitle">
      <span id="settingsTitleLabel">${getCapt('gSETTINGS')}</span>
       <i role="button" tabindex="0" data-title-origin="*LBL" data-title-variable="cCANCEL_TTL" data-click="close" data-event-class="userSettings"  class="icon pth-close pull-right settingsCloseBtn"> </i>

</div>
<div id="settingsOptions">
  <div id="selectThemBtn" data-click="showPart" title="${getCapt('gCOLORSCHEME')}"  data-title="${getCapt('gCOLORSCHEME')}" data-part="theme" data-event-class="userSettings" data-button-state="active" class="settingsMenuBtn btnDefault theme-hover-color theme-active-color theme-active-color">
     <i class="pth-icon" data-button-icon="skin"> <span class="applicationTooltip">${getCapt('gCOLORSCHEMES')}</span> </i>
  </div>
  <div id="selectZoomBtn" data-click="showPart" title="${getCapt('gZOOMFACTOR')}"  data-title="${getCapt('gZOOMFACTOR')}" data-part="zoom" data-event-class="userSettings"  class="settingsMenuBtn btnDefault theme-hover-color theme-active-color theme-active-color">
		   <i class="pth-icon" data-button-icon="zoom"> <span class="applicationTooltip">${getCapt('gSCREENFORMATS')}</span> </i>
  </div>
  <div id="changePasswordBtn" data-click="showPart" title="${getCapt('gCHANGEPASSWORD')}"   data-title="${getCapt('gCHANGEPASSWORD')}" data-part="password" data-event-class="userSettings"  class="settingsMenuBtn btnDefault theme-hover-color theme-active-color theme-active-color">
       <i class="pth-icon"  data-button-icon="password"> <span class="applicationTooltip">${getCapt('gCHANGEPASSWORD')}</span> </i>
  </div>
 </div>
<div id="settingsOptionsContent">
  <span id="settingContentTitle">${getCapt('gCOLORSCHEME')}</span>
  <span id="themeContentField" data-placeholder = "theme" data-open="true"></span>
  <span id="zoomContentField" data-placeholder = "zoom" ></span>
  <span id="passwordContentField"  data-placeholder = "password">
    <form>

      <div class="form-group row row-no-padding row-no-margin">
        <label for="userNameOutput" class="col-5 col-form-label">${getCapt('gUSERNAME')}</label>
        <div class="col-7">
  		      <output id="userNameOutput">${OCULUS.remoteUser}</output>
  		    </div>
  		  </div>

      <div class="form-group row row-no-padding row-no-margin">
        <label for="currentPasswordInput" class="col-5 col-form-label">${getCapt('gCURRENTPASSWORD')}</label>
        <div class="col-7">
  		       <input id="currentPasswordInput" type="password" size="40">
  		    </div>
  		  </div>

      <div class="form-group row row-no-padding row-no-margin">
        <label for="newPasswordInput" class="col-5 col-form-label">${getCapt('gNEWPASSWORD')}</label>
        <div class="col-7">
  		       <input id="newPasswordInput" type="password" size="40">
  		    </div>
  		  </div>

      <div class="form-group row row-no-padding row-no-margin">
        <label for="validatePasswordInput" class="col-5 col-form-label">${getCapt('gVALIDATEPASSWORD')}</label>
        <div class="col-7">
  		       <input id="validatePasswordInput" type="password" size="40">
  		    </div>
  		  </div>

      <a data-event-class="userSettings" data-click="savePassword" class="btn saveSettingsBtn theme-background-color" id="submitBtnInput" href="#">
        <i class="pth-icon pth-succes icon-large"></i> ${getCapt('cACCUPD_VAL')}
      </a>


      <!--<button type="button" id="submitBtnInput" class="btn btn-primary"></button>-->
    </form>


  </span>
  <div id="settingsOptionsMsg" class="hide"></div>
</div></div>`;
};

template.userSettings.ThemeContainer = function () {
    return `
  <div id="settingsWrapper"  data-event-class="userSettings" >
		<div id="settingsTitle">
      <span id="settingsTitleLabel">${getCapt('gCOLORSCHEME')}</span>
      <i role="button" tabindex="0" data-title-origin="*LBL"  data-title-variable="cCANCEL_TTL" data-click="close" data-event-class="userSettings"  class="icon pth-close  pull-right settingsCloseBtn"> </i>
		</div>

		<div id="sessionSettingsOptionsContent">
  		<span id="themeContentField" data-placeholder = "theme" data-open="true"></span>
		<div>
	</div>`;
};

