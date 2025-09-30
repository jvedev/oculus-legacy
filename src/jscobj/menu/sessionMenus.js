var SessionMenus = {};
(function () {
    async function load(procedureName, subProcedureName) {
        let procedure = SESSION.session.getProcedure(procedureName),
            subProcedure = procedure.getSubProcedure(subProcedureName);
        ProcedureMenu.activate(procedureName);

        if (!subProcedure) {
            return;
        }
        Search.close();
        if (!NAV.Procedure.currentInstance || NAV.Procedure.currentInstance.PRC !== procedureName) {
            await procedure.load(subProcedure);
        } else {
            await subProcedure.load();
        }

        SubProcedureButton.activate(subProcedureName);
    }

    function updateFromMain() {
        let procedureName = SESSION.stack.currentProcedure.PRC,
            subProcedureName = SESSION.stack.currentSubprocedure.SBP,
            procedure = SESSION.session.getProcedure(procedureName),
            suprocedurePlaceholder = document.getElementById('subProcedureMenu');

        if (!SESSION.stack.currentSubprocedure.isTarget) {
            // huidige subProcedure is geen target
            suprocedurePlaceholder.innerHTML = subProcedureMenu.render(procedure.subProcedures);
            SubProcedureButton.activate(subProcedureName);
        }
        MacroTab.activate();
    }

    function sort() {
        const tabs = Array.prototype.slice.call(SCOPE.mainDoc.querySelectorAll('.sessionTabContainer')),
            container = SCOPE.mainDoc.getElementById('sessionTabWrapper');
        tabs.sort((a, b) => (a.dataset.adminId > b.dataset.adminId ? 1 : -1));
        tabs.forEach(tab => tab.remove());
        tabs.forEach(tab => container.appendChild(tab));
        $('#sessionTabWrapper').sortable('refresh');
    }


    function getOptions(admins) {
        const def = [];

        admins.forEach(adminId => {
            def.push(getContextAdminOption(adminId));
        });
        return def;
    }

    /**
     *
     * @param adminId
     * @returns {null|Object[]}
     */
    function getContextAdminOption(adminId) {
        const captions = getCaptionSet('SessionContext');
        const admin = SCOPE.mainDoc.querySelector(`.administrationOption[data-option-idt="${adminId}"]`);
        if (!admin) {
            return null;
        }
        // Return the admins in nested context format
        return SCOPE.main.ImpCtx.item(
            admin.getAttribute('data-option-dsc'),
            'fas fa-caret-right',
            [
                SCOPE.main.ImpCtx.section(null, [
                    SCOPE.main.ImpCtx.item(
                        captions.showAll,
                        'fas fa-eye',
                        null,
                        () => {
                            AdminControler.setHidden(admin, false);
                        }
                    )
                ]),
            ],
            null
        );
    }

    function checkAvailableAdmins() {
        const tabs = SCOPE.mainDoc.querySelectorAll(`.sessionTabContainer:not([data-disabled="true"])`);
        let firstAdmin = '',
            hasMultipleVisableAdmins = false,
            hasHiddenAdmins = false;
        tabs.forEach(tab => {
            if (tab.dataset.hidden !== 'true') {
                if (!firstAdmin) {
                    firstAdmin = tab.dataset.adminId;
                }
                if (firstAdmin !== tab.dataset.adminId) {
                    hasMultipleVisableAdmins = true;
                }
            } else {
                hasHiddenAdmins = true;
            }
        });

        return {hasHiddenAdmins: hasHiddenAdmins, hasMultipleVisableAdmins: hasMultipleVisableAdmins};
    }

    function hasMoreThanOneSession() {
        return SCOPE.mainDoc.querySelectorAll(`.sessionTabContainer:not([data-hidden="true"])`).length > 1;
    }

    function contextmenu(ev) {

        const {hiddenAdmins} = AdminControler.getOpenAdmins();
        const enforceSingleAdminSessions = SCOPE.main.Settings.get('SHOW_SINGLE_ENV_SESSIONS');
        const {hasHiddenAdmins, hasMultipleVisableAdmins} = checkAvailableAdmins();
        const captions = getCaptionSet('SessionContext');
        // Declare section arrays
        const admin = [];
        const session = [];

        if (hasMultipleVisableAdmins) {
            // Sort the sessions by admin
            admin.push(SCOPE.main.ImpCtx.item(
                captions.sort,
                'fas fa-sort',
                null,
                () => {
                    sort(ev.invokeObject);
                }
            ));
        }

        if (hasHiddenAdmins) {
            // Get the hidden admins
            let hAdmins = getOptions(hiddenAdmins);

            // Push the hidden admins to the context menu
            hAdmins.forEach((hAdmin) => {
                admin.push(hAdmin);
            });

            if (!enforceSingleAdminSessions) {
                // Show all hidden tabs
                admin.push(SCOPE.main.ImpCtx.item(
                    captions.showAll,
                    'fas fa-eye',
                    null,
                    () => {
                        AdminControler.showAllAdmins();
                    }
                ));
            }
        }

        if (hasMoreThanOneSession()) {
            // Close all open tabs
            session.push(SCOPE.main.ImpCtx.item(
                captions.closeAll,
                'fas fa-times-circle',
                null,
                () => {
                    SCOPE.main.SessionTab.closeAll();
                }
            ));
        }

        // Create a new context menu SCOPE.mainDoc.body
        const ctx = new SCOPE.main.ImpCtx(SCOPE.mainDoc.body, ev.event);

        // Check for session related actions and add to context
        if (session.length) {
            ctx.add(SCOPE.main.ImpCtx.section('Sessies', session));
        }

        // Check for admin related actions and add to context
        if (admin.length) {
            ctx.add(SCOPE.main.ImpCtx.section('Administratie', admin));
        }

        // Add no options
        if (!session.length && !admin.length) {
            return;
            //ctx.add(SCOPE.main.ImpCtx.section('Geen opties', []));
        }

        // Open the context menu
        ctx.openCtx();

        // Attach open context menu to the scope for iframe closes
        SCOPE.main.ctx = ctx;
    }

    //   function showFirstEnabledAdmin() {
    //     tab = SCOPE.mainDoc.querySelector(`.sessionTabContainer:not([data-disabled="true"])`);
    //     if (tab) {
    //       SessionTab.showOnlyThisAdmin(tab);
    //     }
    //   }

    //   function disableTabs(target) {
    //     const adminId = target.dataset.adminId,
    //       tabs = SCOPE.mainDoc.querySelectorAll(`.sessionTabContainer[data-admin-id="${adminId}"]`),
    //       hasHiddenTabs =
    //         SCOPE.mainDoc.querySelectorAll(`.sessionTabContainer[data-hidden="true"]:not([data-disabled="true"])`).length >
    //         0;
    //     tabs.forEach(tab => tab.setAttribute('data-hidden', true));
    //     tabs.forEach(tab => tab.setAttribute('data-disabled', true));
    //     // if (hasHiddenTabs) {
    //     //   showFirstEnabledAdmin(adminId);
    //     // }
    //   }

    //   function enableTabs(target) {
    //     const adminId = target.dataset.adminId,
    //       tabs = SCOPE.mainDoc.querySelectorAll(`.sessionTabContainer[data-admin-id="${adminId}"]`),
    //       hasHiddenTabs =
    //         SCOPE.mainDoc.querySelectorAll(`.sessionTabContainer[data-hidden="true"]:not([data-disabled="true"])`).length >
    //         0;
    //     tabs.forEach(tab => tab.setAttribute('data-hidden', false));
    //     tabs.forEach(tab => tab.setAttribute('data-disabled', false));
    //     if (hasHiddenTabs) {
    //       SessionTab.showOnlyThisAdmin(target);
    //     }
    //   }

    //   function setDisabled(invokeObject, disabled) {
    //     const adminId = target.dataset.adminId,
    //       tabs = SCOPE.mainDoc.querySelectorAll(`.sessionTabContainer[data-admin-id="${adminId}"]`);
    //     tabs.forEach(tab => tab.setAttribute('data-hidden', disabled));
    //     tabs.forEach(tab => tab.setAttribute('data-disabled', disabled));
    //   }

    //   this.disableTabs = disableTabs;
    //   this.enableTabs = enableTabs;
    this.sort = sort;
    this.contextmenu = contextmenu;
    this.updateFromMain = updateFromMain;
    this.load = load;
}.apply(SessionMenus));

SCOPE.main.SessionMenus = SessionMenus;
