var SessionTab = {};
(function () {
    let tab = null;
    placeHolder = null;

    function click(ev) {
        if (window.SCOPE.session?.SESSION?.jobId) {
            // Hide all current modals in this session
            window.SCOPE.main.Dialogue.hideModalGroup([window.SCOPE.session.SESSION.jobId]);

        }

        if (isActive(ev.invokeObject)) {
            return;
        }
        let jobNr = ev.invokeObject.dataset.sessionJobNr,
            session = NAV.Session.getByJobNr(jobNr);

        activate(jobNr);

        if (session) {
            session.activate();
        }

        // Show hidden modals in this session
        window.SCOPE.main.Dialogue.showModalGroup([jobNr]);

        return true;
    }

    function close(ev) {
        let tab = P.getParentByAttribute(ev.invokeObject, 'data-session-job-nr');
        closeTab(tab);
    }

    function closeJob(nr) {
        let tab = SCOPE.mainDoc.querySelector(`[data-session-job-nr="${nr}"]`);
        closeTab(tab);
    }


    /**
     * @param {HTMLElement} initialTab
     * @returns {HTMLElement} sibling to current tab in the folowing order of vailability
     * 1 visible tab to the right if not available
     * 2 visable tab to the left  if not available
     * 3 first available hidden but not disabled tab
     */
    function getNextTab(initialTab) {
        const stayInAdminAfterClosingSession = SCOPE.main.Settings.get('KEEP_ENV_AFTER_SESSION_CLOSE'),
            currentAdminId = initialTab.dataset.adminId;
        let hiddenTab = SCOPE.mainDoc.querySelector('.sessionTabContainer[data-hidden="true"]:not([data-disabled="true"])'),
            queryAll = '.sessionTabContainer:not([data-hidden="true"]):not([data-disabled="true"])',
            queryAdminOnly = queryAll + `[data-admin-id="${currentAdminId}"]`,
            posibleNextTabs = null;

        if (stayInAdminAfterClosingSession) {
            posibleNextTabs = SCOPE.mainDoc.querySelectorAll(queryAdminOnly);
            hiddenTab = null;
        } else {
            posibleNextTabs = SCOPE.mainDoc.querySelectorAll(queryAll)
        }
        let tabIndex = Array.prototype.indexOf.call(posibleNextTabs, initialTab);

        return posibleNextTabs[tabIndex + 1] || posibleNextTabs[tabIndex - 1] || hiddenTab;
    }

    function closeTab(tab) {
         let jobNr = tab.dataset.sessionJobNr,
            isActive = tab.dataset.buttonState=="active",
            session = NAV.Session.getByJobNr(jobNr),
            nextSession = getNextTab(tab.parentNode);

        window.SCOPE.main.Dialogue.deleteModalGroup([window.SCOPE.session.SESSION.jobId]);

        if (session) {
            XDOM.removeDOMObject(tab.parentNode);
            setFixedWidth();
            session.close(tab.dataset.reason || 'close-tab-clicked', isActive);
            AdminMenu.update();
        }
        if(!isActive){
            return;
        }
        if (nextSession) {
            XDOM.invokeClick(nextSession.querySelector('a'));
            AdminControler.setHiddenTabs(nextSession, false);
            return;
        }
        MainMenu.clearClickPath();
        let homeBtn = document.querySelector('.mainMenuButton[data-event-class="Home"]');
        XDOM.invokeClick(homeBtn);
        //MAIN.MainMenu.focus();
    }

    function getDom(jobNr) {
        placeHolder = XDOM.getObject('sessionTabWrapper');
        tab = placeHolder.querySelector('[data-session-job-nr="' + jobNr + '"]');
    }

    /**
     * @param {*} jobNr
     */
    function activate(jobNr, session) {
        if (!OCULUS.extendedNav) {
            return;
        }
        getDom(jobNr);
        deActivateAll();
        Home.close();

        const adminId = tab.dataset.adminId,
            tabs = SCOPE.mainDoc.querySelectorAll(`.sessionTabContainer[data-admin-id="${adminId}"] a`);

        tabs.forEach(tab => tab.setAttribute('data-last-open', false));

        Administration.activate(adminId, false, session);
        //SCOPE.main.newTheme.setMain(tab.dataset.color);
        tab.setAttribute('data-button-state', 'active');
        tab.setAttribute('data-last-open', true);
    }

    function deActivateAll() {
        P.setAttributesToNodeList('.sessionTab', 'data-button-state', 'inactive');
    }


    /**
     * @todo jve
     * @param {*} jobNr
     * @param {*} fsProcedureTitle
     */
    function setTitle(jobNr, procedureTitle, nonProcedureTitle, procedureDescription) {
        let span = null;
        let title = '';

        if (SCOPE.main.Settings.get('SESSION_TAB_TITLE_ORIGIN') == '*PROCEDURE') {
            title = procedureTitle;
        } else {
            title = nonProcedureTitle;
        }

        getDom(jobNr);
        if (!tab) {
            return;
        }
        tab.dataset.procedureTitle = procedureTitle;
        tab.dataset.nonProcedureTitle = nonProcedureTitle;
        tab.title = title;
        if (procedureDescription) {
            span = tab.querySelector('span');
            if (span) {
                span.innerHTML = procedureDescription;
            }
        }
    }

    function load(item) {
        XDOM.invokeClick(item);
    }

    /**
     * updating tabTitles
     */
    function updateTitles() {
        //getAll tabs
        const tabs = [...SCOPE.mainDoc.querySelectorAll('#sessionTabWrapper .sessionTabContainer a')]
        const useProcedure = SCOPE.main.Settings.get('SESSION_TAB_TITLE_ORIGIN') == '*PROCEDURE';
        tabs.forEach(tab => {
            if (useProcedure) {
                tab.title = tab.dataset.procedureTitle
            } else {
                tab.title = tab.dataset.nonProcedureTitle
            }
        })
    }

    function toggle() {
        const currentSessionTab = getCurrentActiveTab(),
            activeSessions = Array.prototype.slice.call(
                SCOPE.mainDoc.querySelectorAll('#sessionTabWrapper .sessionTabContainer:not([data-hidden="true"]) a')
            ),
            index = activeSessions.indexOf(currentSessionTab) + 1,
            nextSessionTab = activeSessions[index] || activeSessions[0];
        if (nextSessionTab != currentSessionTab) {
            XDOM.invokeClick(nextSessionTab);
        }
    }

    function left(item) {
        if (item && item.parentNode.previousElementSibling) {
            MAIN.focusMenu(item.parentNode.previousElementSibling.querySelector('a'));
        }
    }

    function right(item) {
        if (item && item.parentNode.nextElementSibling) {
            MAIN.focusMenu(item.parentNode.nextElementSibling.querySelector('a'));
        }
    }

    function hotkey(kCode, item) {
        switch (kCode) {
            case keyCode.arrowRight:
                right(item);
                break;
            case keyCode.arrowLeft:
                left(item);
                break;
            case keyCode.enter:
                load(item);
                break;
        }
    }

    /**
     * @todo jve
     * @param {*} jobNr
     * @param {*} status attentionWarning|attentionError|ok
     */
    function setJobStatus(jobNr, status) {
        getDom(jobNr);
        if (!tab) {
            return;
        } //sessie al gesloten
        icon = tab.querySelector(`i`);

        if (!icon) {
            return;
        }
        switch (status) {
            case '':
            case 'ok':
                P.hide(icon);
                break;
            case 'attentionWarning':
                P.show(icon);
                icon.setAttribute('data-font-color', 'alert');
                icon.class = 'pth-exclamation-triangle';
                break;
            case 'attentionError':
                P.show(icon);
                icon.setAttribute('data-font-color', 'error');
                icon.class = 'pth-exclamation-triangle';
                break;
        }
    }

    function remove(jobNr) {
        getDom(jobNr);
        XDOM.removeDOMObject(tab);
    }

    function setIDT(definition) {
        if (definition.IDT) {
            return;
        }
        let env = definition.ENV,
            admin = SCOPE.mainDoc.querySelector(`.administrationOption[data-option-env="${env}"]`);
        if (admin) {
            definition.IDT = admin.getAttribute('data-option-idt');
            return;
        }
        definition.IDT = '';
    }

    function setFixedWidth() {
        let placeHolder = XDOM.getObject('sessionTabWrapper');
        if (placeHolder.querySelectorAll('.sessionTabContainer').length > SETTINGS.maxSessionTabsWithFixedWidth) {
            placeHolder.setAttribute('data-min-width', 'false');
        } else {
            placeHolder.setAttribute('data-min-width', 'true');
        }
    }

    function render(SESSION) {

        let placeHolder = XDOM.getObject('sessionTabWrapper'),
            definition = SESSION.session.option;

        definition.adminName = SESSION.companyName;
        definition.color = SCOPE.main.newTheme.getTheme(definition.ENV);
        definition.jobNr = SESSION.jobId;



        setIDT(definition);

        if (SCOPE.main.Settings.get('SESSION_TAB_TITLE_ORIGIN') == '*PROCEDURE') {
            definition.fixed = 'fixed-width';
        } else {
            definition.fixed = '';
        }

        if (SESSION.session.homePage) {
            placeHolder.innerHTML = template.session.hometab(definition) + placeHolder.innerHTML;
        } else {
            placeHolder.innerHTML += template.session.tab(definition);
        }
        if (!OCULUS.extendedNav) {
            return;
        }
        AdminMenu.update();
        setFixedWidth();
        $('#sessionTabWrapper').sortable('refresh');
    }

    function keyup(ev) {
        let nav = XDOM.getParentByTagName(ev.invokeObject, 'nav'),
            item = nav.querySelector('[data-focus="true"][data-hotkey-handler]');
        return hotkey(ev.event.keyCode, item);
    }

    function closeThisSession(target) {
        XDOM.invokeClick(target.querySelector('[data-click="close"]'));
    }

    function closeNode(query) {
        const toClose = SCOPE.mainDoc.querySelectorAll(query);
        toClose.forEach(tab => XDOM.invokeClick(tab));
    }

    function closeOthers(target) {
        const job = target.dataset.sessionJobNr;

        closeNode(`.sessionTab:not([data-session-job-nr="${job}"]):not([data-hidden="true"]) [data-click="close"]`);
    }

    function closeAll() {
        closeNode(`.sessionTabContainer:not([data-hidden="true"]) [data-click="close"]`);
    }

    // function showOnlyThisAdmin(target) {
    //   const adminId = target.dataset.adminId;
    //   showAdminTabs(adminId);
    // }

    function hideAllTabs() {
        const toHide = SCOPE.mainDoc.querySelectorAll('.sessionTabContainer');
        toHide.forEach(tab => P.hide(tab));
    }

    function showAdminTabs(adminId, newSession = false) {
        hideAllTabs();
        const toShow = SCOPE.mainDoc.querySelectorAll(`.sessionTabContainer[data-admin-id="${adminId}"]`),
            nextSessionTab = getlastopenTabOfAdmin(adminId);
        toShow.forEach(tab => P.show(tab));
        XDOM.invokeClick(nextSessionTab);
    }

    function getCurrentActiveTab() {
        return SCOPE.mainDoc.querySelector('.sessionTabContainer [data-button-state="active"]');
    }

    function getlastopenTabOfAdmin(adminId) {
        return SCOPE.mainDoc.querySelector(`.sessionTabContainer[data-admin-id="${adminId}"] a[data-last-open=true]`);
    }

    function nextAdmin(adminId = SCOPE.main.AdminMenu.getActiveId()) {
        const adminIds = SCOPE.main.AdminMenu.adminIds,
            index = adminIds.indexOf(adminId) + 1,
            nextAdminId = adminIds[index] || adminIds[0],
            currentTab = getCurrentActiveTab(),
            nextSessionTab = getlastopenTabOfAdmin(nextAdminId);

        if (!currentTab) {
            return; //no tabs are shown unable to loop through admins
        }

        if (nextSessionTab) {
            if (nextAdminId == currentTab.dataset.adminId) {
                //next admin is the current admin only one admin open so ignore the command
                return;
            }
            showAdminTabs(nextAdminId);
        } else {
            nextAdmin(nextAdminId); //no session tabs open for the administration
        }
    }

    function contextmenu(ev) {
        const captions = getCaptionSet('SessionContext');
        const {multipleVisableAdmins} = AdminControler.getOpenAdmins(),
            moreThanOneSession = SCOPE.mainDoc.querySelectorAll('.sessionTabContainer:not([data-hidden="true"])').length > 1;

        // Declare section arrays
        const thisAdmin = [];
        const allAdmins = [];
        const thisSession = [];
        const allSessions = [];

        // Create a new context menu
        const ctx = new SCOPE.main.ImpCtx(document.getElementById('applicationMainWrapper'), ev.event);

        // Check for multiple active admins
        if (multipleVisableAdmins) {
            // Sort the sessions by admin
            allAdmins.push(SCOPE.main.ImpCtx.item(
                captions.sort,
                null,
                null,
                () => {
                    SessionMenus.sort();
                }
            ));
        }

        // Close the selected session
        allSessions.push(SCOPE.main.ImpCtx.item(
            captions.close,
            'fas fa-times-circle',
            null,
            () => {
                closeThisSession(ev.invokeObject);
            }
        ));

        // Check for multiple open sessions
        if (moreThanOneSession) {
            // Close all other open sessions
            allSessions.push(SCOPE.main.ImpCtx.item(
                captions.closeOthers,
                null,
                null,
                () => {
                    closeOthers(ev.invokeObject);
                }
            ));

            // Check if the multiple sessions are from multiple admins
            if (multipleVisableAdmins) {
                // Hide sessions from this administration
                thisAdmin.push(SCOPE.main.ImpCtx.item(
                    captions.closeThisAdmin,
                    'fas fa-times-circle',
                    null,
                    () => {
                        AdminControler.closeAdmin(ev.invokeObject);
                    }
                ));

                // Show only sessions from this administration
                thisAdmin.push(SCOPE.main.ImpCtx.item(
                    captions.showThisAdmin,
                    'fas fa-eye-slash',
                    null,
                    () => {
                        AdminControler.showOnlyThisAdmin(ev.invokeObject);
                    }
                ));
            }

            // Close all open sessions
            allSessions.push(SCOPE.main.ImpCtx.item(
                captions.closeAll,
                null,
                null,
                () => {
                    closeAll(ev.invokeObject);
                }
            ));
        }


        // Check for this session actions and add to context
        if (thisSession.length) {
            ctx.add(SCOPE.main.ImpCtx.section(ev.invokeObject.innerText, thisSession));
        }

        // Check for single session related actions and add to context
        if (thisAdmin.length) {
            allAdmins.push(SCOPE.main.ImpCtx.item(
                ev.invokeObject.getAttribute('data-administration-name'),
                'fas fa-caret-right',
                [SCOPE.main.ImpCtx.section(null, thisAdmin)],
                null
                )
            );
            //   ctx.add(SCOPE.main.ImpCtx.section(, thisAdmin));
        }

        // Check for session related actions and add to context
        if (allSessions.length) {
            ctx.add(SCOPE.main.ImpCtx.section('Sessies', allSessions));
        }

        // Check for session related actions and add to context
        if (allAdmins.length) {
            ctx.add(SCOPE.main.ImpCtx.section('Administraties', allAdmins));
        }

        // Open the context menu
        ctx.openCtx();

        // Attach open context menu to the scope for iframe closes
        SCOPE.main.ctx = ctx;
    }

    this.activate = activate;
    this.closeAll = closeAll;
    this.nextAdmin = nextAdmin;
    this.showAdminTabs = showAdminTabs;
    this.contextmenu = contextmenu;
    this.activate = activate;
    this.deActivateAll = deActivateAll;
    //this.setTheme = setTheme;
    this.setTitle = setTitle;
    this.setJobStatus = setJobStatus;
    this.remove = remove;
    this.newTab = render;
    this.getDom = getDom;
    this.close = close;
    this.closeTab = closeTab;
    this.closeJob = closeJob;
    this.click = click;
    this.hotkey = hotkey;
    this.keyup = keyup;
    this.toggle = toggle;
    this.updateTitles = updateTitles;
}.apply(SessionTab));
