const
    adminChange = new Event('adminChange');

var Administration = {};
(function () {
    function click(ev) {

        const adminId = ev.invokeObject.dataset.optionIdt;

        if (onClick(adminId, ev.invokeObject)) {
            loadHome(adminId, ev.invokeObject)
        }
    }


    function loadHome(adminId, obj) {

        if (AdminControler.setHidden(obj, false, true)) {
            return;
        }
        if (obj.dataset.autoLoadHome === 'false') {
            return;
        }
        Home.open(adminId);
    }

    function onClick(adminId, obj) {
        if(obj.dataset.disabled == 'true') {
            return false
        }
        AdminMenu.collapse();
        obj.dataset.mainMenuSlide = 0;
        activate(adminId, true);


        return true;
    }

    function openDirect(enviroment) {
        const adminTile = SCOPE.mainDoc.querySelector(`.administrationOption[data-option-env="${enviroment}"]`);
        if(!adminTile){
            return false;
        }
        onClick(adminTile.dataset.optionIdt, adminTile);
        return true;
    }


    function shiftSlide(nr) {
        let admin = P.query('header [data-focus="true"]') || P.query('header [data-button-state="active"]'),
            currentIndex = XDOM.getParentAttribute(admin, 'data-slick-index') || 0,
            index = (parseInt(currentIndex) || 0) + nr;
        let newAdmin = P.query(`header [data-slick-index="${index}"] .administrationOption`);

        if (newAdmin) {
            focusMenu(newAdmin);
            $('.administrationMenu').slick('slickGoTo', index);
        }
        return newAdmin;
    }

    function keyup(ev) {
        switch (ev.event.keyCode) {
            case keyCode.arrowRight:
                this.shiftSlide(1);
                break;
            case keyCode.arrowLeft:
                this.shiftSlide(-1);
                break;
            case keyCode.arrowDown:
            case keyCode.enter:
                // First check to se iw the event originates from an input element. PRSH-002657
                // If so don execute this event
                if(ev.event.target.tagName=='INPUT') return false;

                let invokeObject = P.query(`[data-focus="true"]`);
                XDOM.invokeClick(invokeObject);
                break;
        }
        if (ev.event.altKey && ev.keyCode == keyCode.a) {
            AdminMenu.collapse();
        }

        ev.event.stopPropagation();
        return true;
    }

    function activate(adminId, toStart, session) {
        let newAdminButton = P.query(`.administrationOption[data-admin-id ="${adminId}"]`),
            currentAdminButton = P.query('.administrationOption[data-button-state="active"]');
        if (!newAdminButton) {
            return;
        } //model administratie
        let admin = get(adminId) || get(session.option.IDTORG),
            administrationName = P.query('#administrationName');

        if (currentAdminButton) {
            currentAdminButton.setAttribute('data-button-state', 'inactive');
        }

        if (newAdminButton) {
            newAdminButton.setAttribute('data-button-state', 'active');
        }
        if (admin) {
            administrationName.innerHTML = admin.DSC;
        }
        if (session) {
            administrationName.innerHTML = session.companyName; //admin.DSC;
        }

        MainMenu.render(admin, toStart);
        SecondMenu.render(admin);
        Home.toggle(admin);
        setVisablility(newAdminButton);

        // Make the admin id accessible globally & fire admin change event
        if (this.activeAdmin !== admin.ENV) {
            this.activeAdmin = admin.ENV;
            window.SCOPE.mainDoc.dispatchEvent(adminChange);
        }
        SCOPE.mainDoc.body.setAttribute('data-active-environment', admin.ENV)
        SCOPE.main.newTheme.setMain('');
    }


    function setVisablility(newAdminButton) {
        if (SCOPE.main.Settings.get('SHOW_SINGLE_ENV_SESSIONS')) {
            AdminControler.showOnlyThisAdmin(newAdminButton);
        }
    }

    function get(adminId) {
        return G.userMenu.administrations.filter(o => o.IDT == adminId)[0];
    }

    function contextmenu(ev) {
        AdminControler.adminContext(ev);
    }

    this.openDirect = openDirect;
    this.contextmenu = contextmenu;
    this.get = get;
    this.click = click;
    this.activate = activate;
    this.keyup = keyup;
    this.shiftSlide = shiftSlide;
    this.activeAdmin = '';
}.apply(Administration));
