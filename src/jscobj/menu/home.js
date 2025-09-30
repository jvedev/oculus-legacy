/* global P, keyCode */
var Home = {};
(function () {
    function hideHomeSessionTabs() {
        const homeTabs = [...SCOPE.mainDoc.querySelectorAll('.sessionTabWrapper .sessionTabContainer[data-homepage= "true"]')];
        homeTabs.forEach(element => {
            element.setAttribute('data-hidden',
                'true')
        });
        // P.setAttributesToNodeListAllFrames(
        //   `.sessionTabWrapper .sessionTabContainer[data-homepage= "true"]`,
        //   'data-hidden',
        //   'true'
        // );
    }

    function gotoHomeSession(admin) {
        let tab = document.querySelector(`.sessionTabContainer[data-homepage= "true"] [data-admin-id="${admin.IDT}"]`);
        if (!tab) {
            return false;
        }
        tab.parentNode.setAttribute('data-hidden', 'false');
        XDOM.invokeClick(tab);
        return true;
    }

    async function session(admin) {
        if (!SCOPE.main.Settings.get('AUTO_LOAD_HOME')) {
            return;
        }
        hideHomeSessionTabs();
        admin.homeApp = admin.homeApp || admin.homeAppDir; //backwards compatibility 7C, 7D
        if (!admin.homeApp) {
            return false;
        }
        if (gotoHomeSession(admin)) {
            return true;
        }
        // document.querySelector(`.sessionTabWrapper [data-admin-id="${admin.IDT}"]`);
        //data-admin-id="E1" data-homepage="true"
        //homeType = "*SBP";

        const definition = {
            DSC: 'Home',
            TTL: 'Home',
            ENV: admin.ENV,
            IDT: admin.IDT,
            APP: admin.homeApp,
            PGM: admin.homeOption,
            TYP: 'HOME',
            HOMETYPE: admin.homeType,
            SON: 'USR'
        };


        await NAV.Session.newSession(definition, 0, true);
    }

    function show(ev) {
        admin = Administration.get(ev) || Administration.get(ev.invokeObject.dataset.adminId);
        toggle(admin);
    }

    /**
     * opent de home pagina
     * @param {*} ev event object
     */
    function click(ev) {
        if (ev.invokeObject.dataset.buttonState == "disabled") {
            return;
        }
        open(ev);
    }

    /**
     * opent de home pagina
     * @param {*} ev event object
     */
    function open(ev) {
        let home = null,
            admin = Administration.get(ev) || Administration.get(ev.invokeObject.dataset.adminId);
        hideHomeSessionTabs();

        if (session(admin)) {
            return;
        }

        home = get(admin);
        NAV.Session.hideAll();
        home.setAttribute('data-hidden', 'false');
    }

    function toggle(admin) {
        let tab = document.querySelector(`.sessionTabContainer[data-homepage= "true"] [data-admin-id="${admin.IDT}"]`);
        hideHomeSessionTabs();
        if (!tab) {
            return false;
        }
        tab.parentNode.setAttribute('data-hidden', 'false');
    }

    function get(admin) {
        let home = document.querySelector(`iframe[data-admin-id="${admin.IDT}"]`);
        if (home) {
            //home exists

            return home;
        }
        //no home for this admin create one
        return createFrame(admin);
    }

    function createFrame(admin) {
        let sessionWrapper = XDOM.getObject('sessionWrapper'),
            frameObject = XDOM.createElement('IFRAME', null, 'sessionFrame');

        frameObject.setAttribute('data-admin-id', admin.IDT);
        frameObject.setAttribute('data-hidden', 'true');
        sessionWrapper.appendChild(frameObject);
        frameObject.contentDocument.write(template.home.content(admin));
        return frameObject;
    }

    function close() {
        P.setAttributesToNodeList('.admin-home-page', 'data-hidden', 'true');
    }

    function closeTab(ev) {
        let tab = P.getParentByAttribute(ev.invokeObject, 'data-session-job-nr');
        let adminTile = SCOPE.mainDoc.querySelector(`.administrationOption[data-admin-id=${tab.dataset.adminId}]`);
        adminTile.dataset.autoLoadHome = 'false';
        SessionTab.closeTab(tab);
    }

    this.closeTab = closeTab;
    this.click = click;
    this.show = show;
    this.close = close;
    this.open = open;
    this.toggle = toggle;
}.apply(Home));
