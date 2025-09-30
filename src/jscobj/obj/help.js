var Help = {};

(function () {

    /**
     * checks if a url actualy exists
     * @param url
     * @returns {Promise<boolean>}
     */
    async function isURLAlive(url) {
        try {
            //get the url
            const response = await fetch(url);

            //if it is not there it should
            if(response.status==404) return false;


            //Because apache server actually does not return a 404 status we have to see if there is 404 mentioned somewhere in the title tag of the returning 404 page
            //this is VERY unreliable because custom 404 pages might be defined completely different
            //however this is implemented as a fallback. Implemented for PRSH-002564
            //get the response text
            const text = await response.text();

            // this reg expression tests if there is a title tag containing 404 somewhere.
            // this does not work for instance
            // <title>Invoeren verkooporders - Artikelgegevens - GHON0404F0</title>
            //however the node server seems to not pass status codes correctly so firs propper check should actually work
            //const regex = /<title\b[^>]*>(.*?)404(.*?)<\/title>/i;
            //do we have a 404 somewhere or not (and god help us if some joker ever decides to put a 404 string somewhere in the title
            //return !regex.test(text)
            return !text.toLowerCase().includes("<title>404 niet gevonden</title>")


        } catch (error) {
            // An error occurred, so the URL is not alive
            return false;
        }
    }



    async function mainMenu() {
        return openHelpItemDefinition( SCOPE.session.SESSION.menuDefinitionVarName);

    }
    async function procedure(ev) {
        if (!ev.invokeObject.dataset.buttonEnabled == 'true') return;
        return openHelpItemDefinition(SESSION.session.stack.currentProcedure.procedureName);
    }


    async function macro() {
        if(!SESSION.assistAvailable) return;
        //get the macroName topview overwrites currentMacro is Topview is active
        const item = TopView?.currentInstance?.programName || SESSION.stack.currentMacro.macroName;
        return openHelpItemDefinition(item);
    }

    function show(url){
        const newWindow = window.open(url, "_blank", 'height=700, width=925, title=0, titlebar=0, toolbar=0, menubar=0, location=0, directories=0, status=0, resizable=1, scrollbars=1, alwaysRaised=yes, dependent=yes');

        if (!newWindow?.opener) {
            newWindow.opener = self;
        }
        newWindow.focus();
    }

    async function openExternal(url) {
        show(url);
    }
    async function open(url) {

        const uri = url + '?TIMESTAMP=' + new Date().getTime();

        //first test if url is actualy there
        if(!await isURLAlive(uri)) {
            SCOPE.main.Dialogue.alert(getCapt('noHelpFileGenerated'));
            return;
        }
        show(uri);


    }

    function update() {
        let button = PAGEDOC.querySelector('.leftSection  [data-click="macroHelp"]');
        if (button) {
            button.setAttribute('data-button-enabled', SESSION.assistAvailable);
        }
        button = PAGEDOC.querySelector('nav.session-user-buttons [data-button-icon="help"]');

        if (!button) return;
        button.setAttribute('data-button-enabled', SESSION.assistAvailable);

        //hide procedure help when in topview !! turns falsy/truthy into real boolean.
        button.setAttribute("data-hidden", !!TopView.currentInstance)
    }


    function cheatSheet() {
        let content = `
    <div id="help-wrapper"  data-event-class="userSettings" >
      <div id="settingsTitle">
        <span id="settingsTitleLabel">${getCapt('gCHEATSHEET')}</span>
        <i role="button" tabindex="0" data-title-origin="*LBL"  data-title-variable="cCANCEL_TTL" data-click="close" data-event-class="userSettings"  class="icon pth-close  pull-right settingsCloseBtn"> </i>
      </div>

      <div class="modal-panel-content" >
      <div class="hotkey-cheat-list" >
      
      <div><span> tab </span><span>${getCapt('hotkeyTab')}</span></div>  
      <div><span> Shift + Tab </span><span>${getCapt('hotkeyShiftTab')}</span></div>
      <!--div><span> Shift + &darr; </span><span>${getCapt('hotkeyShiftDown')}</span></div-->
      <div><span> </span><span></span></div>  
        <div><span> Alt + [1-9] </span><span>${getCapt('hotkeynr')}</span></div>
        <div><span> Alt + A </span><span>${getCapt('hotkeya')}</span></div>
        <div><span> Alt + Ctrl + A </span><span>${getCapt('hotkeyCrtla')}</span></div>
        <div><span> Alt + F </span><span>${getCapt('hotkeyf')}</span></div>
        <div><span> Alt + H </span><span>${getCapt('hotkeyh')}</span></div>
        <div><span> Alt + M </span><span>${getCapt('hotkeym')}</span></div>
        <div><span> Alt + N </span><span>${getCapt('hotkeyn')}</span></div>
        <div><span> Alt + P </span><span>${getCapt('hotkeyp')}</span></div>
        <div><span> Alt + Q </span><span>${getCapt('hotkeyq')}</span></div>
        <div><span> Alt + S  </span><span>${getCapt('hotkeys')}</span></div>
        <div><span> Alt + W  </span><span>${getCapt('hotkeyw')}</span></div>
        <div><span> Alt + Home </span><span>${getCapt('hotkeyHome')}</span></div>
        <div><span> Alt + F1 </span><span>${getCapt('hotkeyAltF1')}</span></div>
 
      </div>
      <div class="hotkey-cheat-list" >
        <div><span> F4 </span><span>${getCapt('hotkeyF4')}</span></div>
        <div><span> F7 </span><span>${getCapt('hotkeyF7')}</span></div>
        <div><span> F8 </span><span>${getCapt('hotkeyF8')}</span></div>
        <div><span> F9 </span><span>${getCapt('hotkeyF9')}</span></div>
        <div><span> F10 </span><span>${getCapt('hotkeyF10')}</span></div>
        <div><span> F11 </span><span>${getCapt('hotkeyF11')}</span></div>
        <div><span> F12 ${getCapt('hotkeyOr')} ESC </span><span>${getCapt('hotkeyF12')}</span></div>
        <div><span> </span><span></span></div>  
        <div><span> Shift + F7 </span><span>${getCapt('hotkeyShiftF7')}</span></div>
        <div><span> Shift + F8 </span><span>${getCapt('hotkeyShiftF8')}</span></div>
        <div><span> Shift + F9 </span><span>${getCapt('hotkeyShiftF9')}</span></div>
        <div><span> Shift + F10 </span><span>${getCapt('hotkeyShiftF10')}</span></div>
        

      </div> 
   
      
      
      
      
      
      </div>
    </div>
    </div>`;
        ModalPanel.open(content);
    };

    function fallbackUrl(item) {
        return SCOPE.session.SESSION.assistDir + item + '.htm?TIMESTAMP=' + new Date().getTime();
    }

    async function openHelpItemDefinition(item) {
        if(!SCOPE?.session?.SESSION) return;
        const fallback = fallbackUrl(item)

        //7C, 7E, 8A support external texts , 7B en 7D does not.
        if(["*7A", "*7B", "*7D"].includes(getVersion())){
            return open(fallback);
        }

        const {language, dftLanguage, session}  = SCOPE.session.SESSION
        const environment = session.enviroment
        const {userGroup, signOnMethode,remoteUser} = OCULUS

        const url =
            '/ndscgi/box/ndmctl/HelpUrls.ndm/GetHelpUrls.json?' +
            'PFMFILID=' +
            environment +
            '&PFMGRPID=' +
            userGroup +
            '&PFMSOMTD=' +
            signOnMethode +
            '&USRID=' +
            remoteUser +
            '&UserLanguage=' +
            language +
            '&DefaultLanguage=' +
            dftLanguage +
            '&ItemId=' +
            item;

        const result =  await fetch(url).then(response => response.json());
        const {helpUrlDefaultLanguage, location} = result?.helpText;
        //fallback on old behaviour
        if(!helpUrlDefaultLanguage || location ==="notFound") return open(fallback)
        return openExternal(helpUrlDefaultLanguage);
    }

    this.cheatSheet = cheatSheet;
    this.update = update;
    this.mainMenu = mainMenu;
    this.procedure = procedure;
    this.macro = macro;
}.apply(Help));
