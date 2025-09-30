/* global P, keyCode */
var keyNav = {};

(function () {
    let menus = {},
        focused = null,
        handler = null,
        activeMenu = '',
        firstAlt = false,
        currentMenu = null;

    const order = ['TABDIV', 'subProcedureMenu', 'procedureMenu', 'sessionTabWrapper', 'administrationMainMenu'];

    function reset() {
        menus = {};
        focused = null;
        focusedPart = '';
        handler = null;
        currentMenu = null;
    }

    function init() {
        reset();
        getMenus();
        getCurrentMenu();
    }

    function getLoadedMenu(menu) {
        if (menu && menu.querySelector('[data-hotkey-handler]')) {
            return menu;
        }
        return null;
    }

    function getMenus() {
        let procedureMenu = null,
            subProcedureMenu = null;

        menus.sessionTabWrapper = getLoadedMenu(MAINDOC.getElementById('sessionTabWrapper'));
        menus.administrationMainMenu = getLoadedMenu(MAINDOC.getElementById('administrationMainMenu'));
        if (PAGEDOC) {
            menus.TABDIV = getLoadedMenu(PAGEDOC.getElementById('TABDIV'));
        }
        if (SESSIONDOC) {
            subProcedureMenu = getLoadedMenu(SESSIONDOC.getElementById('subProcedureMenu'));
            procedureMenu = getLoadedMenu(SESSIONDOC.getElementById('procedureMenu'));

            if (subProcedureMenu && subProcedureMenu.dataset.hideMenu !== 'true') {
                if (!SCOPE.sessionDoc.getElementById('toggleSubprocedureMenu').checked) {
                    //submenu is hidden
                    menus.subProcedureMenu = subProcedureMenu;
                }
            }
            if (procedureMenu && procedureMenu.dataset.hideMenu !== 'true') {
                menus.procedureMenu = procedureMenu;
            }
        }
    }

    function setNextMenu() {
        if (firstAlt && currentMenu) {
            firstAlt = false;
            return;
        }

        let next = order.indexOf(activeMenu);

        for (let i = 0, l = order.length; i < l; i++) {
            next++;
            if (next >= l) {
                next = 0;
            }
            currentMenu = menus[order[next]];
            if (currentMenu) {
                return;
            }
        }
    }

    function getCurrentMenu() {
        activeMenu = '';
        currentMenu = null;

        let menu = null;

        for (let id in menus) {
            menu = menus[id];

            if (menu && menu.dataset.menuOnTop == 'true') {
                currentMenu = menu;
                activeMenu = id;
                return;
            }
        }
    }

    function getActiveMenu() {
        if (currentMenu) {
            return;
        }

        let focused = getFocusedMenuItem();

        if (focused) {
            currentMenu = XDOM.getParentByTagName(focused, 'NAV');
            activeMenu = currentMenu.id;
        }
        if (currentMenu) {
            return;
        }

        getFirstAvailableMenu();
    }

    function getFirstAvailableMenu() {
        let retMenu = null,
            i = 0;
        while (!retMenu && i < order.length) {
            retMenu = menus[order[i++]];
        }
        currentMenu = retMenu;
        activeMenu = currentMenu.id;
    }

    function handleAltKey(ev) {
        if (ev.keyCode == keyCode.alt || ev.keyCode == keyCode.altgr) {
            if (ev.event.type == 'keyup') {
                focusActiveMenu();
            } else {
                firstAlt = true;
            }
        }
    }

    function closeActiveSession(ev) {
        // if (!ev.altKey) {
        //     return;
        // }
        let btn = MAINDOC.querySelector('.sessionTabWrapper [data-button-state="active"] [data-click="close"]');
        if (!btn) {
            return;
        }

        let tab = btn.parentNode,
            message = `${getCapt('msgCloseSession1')}<b>${tab.dataset.sessionDescription}</b>${getCapt('msgCloseSession2')}
                       <b>${tab.dataset.administrationName}</b>
                       ${getCapt('msgCloseSession3')}
                       ${getCapt('msgCloseSession4')} `;
        Confirm.show({
            title: getCapt('titleCloseSession'),
            message: message,
            group: window.SCOPE.session.SESSION.jobId,
            handler: ok => {
                if (ok) {
                    btn.dataset.reason = 'alt-q';
                    XDOM.invokeClick(btn);
                }
            }
        });
    }

    function print() {

        let button = P.queryOverAllFrames(
            'nav.session-user-buttons [data-button-icon="print"][data-button-enabled="true"]:not([data-hidden="true"])'
        );
        if (button) {
            XDOM.invokeClick(button);
        }
    }

    function focusMacroNavigation(ev) {
        block();
        if (ev.invokeObject && ev.invokeObject.dataset.eventClass == 'MacroNavigation') {
            if (SCOPE.session.MacroNavigation.down(ev.invokeObject)) {
                ev.cancel();
                return;
            }
        }
        let button = PAGEDOC.querySelector(`.leftSection [data-event-class="MacroNavigation"]`);
        if (button) {
            button.focus();
        }
        ev.cancel();
    }

    function focusWorkspace(ev) {
        if (SCOPE.session) {
            SCOPE.session.setCursor('MAIN');
        }
    }

    function gotoMacro(ev) {
        let nr = String.fromCharCode(ev.keyCode);
        let macroTab = PAGEDOC.querySelector(`#TABDIV a[data-macro-index="${nr}"]`);
        XDOM.invokeClick(macroTab);
    }

    function edgeBugBlokkerHandler(e) {
        if (blocksAreOn()) {
            if (e.keyCode == keyCode.m || e.keyCode == keyCode.f) {
                return false;
            }
            if (e.type != 'keydown') {
                focusActiveMenu();
            }
            e.stopPropagation();
            e.returnValue = false;
            return true;
        }
        return false;
    }




    function alt(ev) {
        if (!ev.event.altKey) {
            return false;
        }


        //handling keydown just to prevent default behaviour
        if (ev.event.type == 'keydown') {
            switch (ev.keyCode) {
                case keyCode.home:
                    XDOM.invokeClick(SCOPE.mainDoc.querySelector('[ data-event-class="Home"]'));
                    ev.cancel();
                    return true;
                case keyCode.f:
                    focusMacroNavigation(ev);
                    ev.cancel();
                    return true;
                case keyCode.w:
                    focusWorkspace(ev);
                    return true;
            }
        }

        if (ev.event.type == 'keyup') {
            switch (ev.keyCode) {
                case keyCode.k1:
                case keyCode.k2:
                case keyCode.k3:
                case keyCode.k4:
                case keyCode.k5:
                case keyCode.k6:
                case keyCode.k7:
                case keyCode.k8:
                case keyCode.k9:
                    gotoMacro(ev);
                    return true;
                case keyCode.a:
                    MAIN.AdminMenu.toggle();
                    return true;

                case keyCode.h:
                    Help.cheatSheet();
                    return true;
                // case keyCode.home:
                //     XDOM.invokeClick(SCOPE.mainDoc.querySelector('[ data-event-class="Home"]'));
                //     ev.cancel();
                //     return true;
                case keyCode.q:
                    closeActiveSession(ev);
                    return true;
                case keyCode.p:
                    print();
                    return true;
                case keyCode.m:
                    loopMenu(ev.invokeObject);
                    return true;
                case keyCode.n:
                    toggleSubProcMenu();
                    return true;
                case keyCode.s:
                    SessionTab.toggle(ev.invokeObject);
                    return true;
            }
        }
        return false;
    }

    function toggleSubProcMenu() {
        let procedureMenuWrapper = XDOM.getObject('procedureMenu', SCOPE.sessionDoc);
        if (procedureMenuWrapper) {
            procedureMenuWrapper.setAttribute(
                'data-submenu-visible',
                SCOPE.sessionDoc.getElementById('toggleSubprocedureMenu').checked
            );
        }

        SCOPE.sessionDoc.getElementById('toggleSubprocedureMenu').checked = !SCOPE.sessionDoc.getElementById(
            'toggleSubprocedureMenu'
        ).checked;
    }

    function blocksAreOn() {
        // if(SCOPE.sessionDoc){
        //   return SCOPE.mainDoc.querySelector('[data-overlay="true"]')
        // }
        return SCOPE.mainDoc.querySelector('[data-overlay="true"]')

        //return P.queryOverAllFrames('[data-overlay="true"]');
    }

    function block() {
        MAINDOC.body.setAttribute('data-overlay', 'true');
        if (SESSIONDOC) {
            SESSIONDOC.body.setAttribute('data-overlay', 'true');
        }
        if (PAGEDOC) {
            PAGEDOC.body.setAttribute('data-overlay', 'true');
        }
    }

    function unBlock() {
        MAINDOC.body.setAttribute('data-overlay', 'false');
        if (SESSIONDOC) {
            SESSIONDOC.body.setAttribute('data-overlay', 'false');
        }
        if (PAGEDOC) {
            PAGEDOC.body.setAttribute('data-overlay', 'false');
        }
    }

    function focusActiveMenu() {
        init();
        unBlock();

        if (currentMenu) {
            colapseAllMenus();
            currentMenu.removeAttribute('data-menu-on-top');
            focusButton(currentMenu);
        }

        reset();
    }

    function loopMenu(obj) {
        init(obj);
        getActiveMenu();
        setNextMenu();
        toggle();
        reset();
    }

    function focusButton(menu) {
        if (menu.id === "administrationMainMenu") {
            window.SCOPE.main.MainMenu.keyFocus(menu);
            return
        }

        let button = menu.querySelector(`[data-button-state="active"]`) || menu.querySelector(`[data-hotkey-handler]`);

        focusMenu(button);
    }

    function toggle() {
        block();
        for (let id in menus) {
            if (menus[id]) {
                menus[id].removeAttribute('data-menu-on-top');
            }
        }
        currentMenu.setAttribute('data-menu-on-top', 'true');
    }

    function enableHover() {
        getMenus();
        if (menus.administrationMainMenu) {
            menus.administrationMainMenu.setAttribute('data-hover-enabled', 'true');
        }
        if (menus.procedureMenu) {
            menus.procedureMenu.setAttribute('data-hover-enabled', 'true');
        }
    }

    function disableHover() {
        getMenus();
        if (menus.administrationMainMenu) {
            menus.administrationMainMenu.setAttribute('data-hover-enabled', 'false');
        }
        if (menus.procedureMenu) {
            menus.procedureMenu.setAttribute('data-hover-enabled', 'false');
        }
    }

    function hotkey(ev) {
        focused = getFocusedMenuItem();
        if (!focused || !getHandler(focused.dataset.hotkeyHandler)) {
            return false;
        }

        if (ev.event.type == 'keydown' && handler) {
            disableHover();
        }
        if (ev.event.type == 'keydown' && handler.hotkeyDown) {
            handler.hotkeyDown(ev.keyCode, focused, ev);
        } else if (ev.event.type == 'keyup') {
            handler.hotkey(ev.keyCode, focused, ev);
        }

        reset();
        return true;
    }

    function getHandler(handlerClass) {
        handler = null;
        if (MAIN[handlerClass]) {
            handler = MAIN[handlerClass];
            return true;
        }
        let frame = document.querySelector('iframe[data-hidden="false"]');
        if (frame && frame.contentWindow[handlerClass]) {
            handler = frame.contentWindow[handlerClass];
            return true;
        }
        return false;
    }

    // if( !(ev.event.type == "keyup" || ev.event.type == "keydown") ||
    // P.query("header").offsetHeight > 200){

    function canHandle(ev) {
        if (ev.event.type != 'keyup' && ev.event.type != 'keydown') {
            return false;
        }
        if (P.query('[data-event-class="ModalPanel"][data-hidden="false"]')) {
            return false;
        }
        //Hotkey alt a is alowed since this is moved to the keyup
        if (P.query('header').offsetHeight > 200 && ev.event.keyCode in [keyCode.a,keyCode.w] ) {
            return false;
        }
        return true;
    }

    /**
     * Handler for alt+ crtl ckey stroke combinations
     * @param ev {pthEvent}
     * @returns {boolean} has handled
     */
    function handleAltCrtl(ev){
        //do we have a crtl + alt keystroke?
        if(!(ev.event.ctrlKey && ev.event.altKey)){
            return false;
        }

        //cancel all alt + crtl events on keyup
        if(ev.event.type=='keyup'){
            ev.cancel();
            return true;
        }

        switch (ev.keyCode) {
            case keyCode.a:
                SCOPE.main.SessionTab.nextAdmin();
                ev.cancel();
                return true;
        }

        return false;
    }
    function handle(ev) {
        if (!canHandle(ev)) {
            return false;
        }
        // console.log('================================');
        // console.log('ev.event.type',ev.event.type);
        // console.log('ev.event.ctrlKey',ev.event.ctrlKey);
        // console.log('ev.event.altKey',ev.event.altKey);
        // console.log('ev.event.key',ev.event.key);

        if(handleAltCrtl(ev)){
            return true;
        }

        if (handleAltKey(ev)) {
            return true;
        }

        if (alt(ev)) {
            ev.cancel();
            return true;
        }

        return hotkey(ev);
    }

    this.edgeBugBlokkerHandler = edgeBugBlokkerHandler;
    this.handle = handle;
    this.enableHover = enableHover;
}.apply(keyNav));
