/* global Administration, P, MainMenu, XDOM, SearchAdmin */
var AdminMenu = {};
(function () {
    const adminIds = [];

    function keyup(ev) {
        if (isOpen()) {
            Administration.keyup(ev);
            return;
        }

        let part = document.querySelector('.MainMenuByAdmin');
        if (part) {
            MainMenu.keyup(ev);
        }
        return true;
    }

    function focusFirst() {
        // Check for administration options
        let admin = P.query('a .administrationOption');

        // Focus on the first administration
        let focus = SCOPE.mainDoc.querySelectorAll('.administrationMenu .slick-track .administration-button')[0];

        // Check if there is an administration
        if (admin) {
            // Set focus
            admin.setAttribute('data-focus', 'true');
            focus.focus();
        }
    }

    /**
     * als er maar 1 administratie is (of alleen maar de zoek)
     * dan wordt deze geactiveerd
     */
    function activateOnlyAdmin() {
        let admins = document.querySelectorAll(
            '.administrationOption[data-event-class="Administration"]'
        );

        // Check number of admins
        if (admins.length === 1) {
            // If only 1 admin then delay collapse of admin menu (min 300ms) because of Chrome bug [POM-4905]
            setTimeout(function () {
                XDOM.invokeClick(admins[0]);
            }, 300);
        }
    }

    function mapAdmin(admin) {
        const autoLoadHome = SCOPE.main.Settings.get('AUTO_LOAD_HOME', admin.ENV);
        const environment = admin.ENV
        const color = SCOPE.main.newTheme.getTheme(environment);
        const defaultTheme = SCOPE.main.newTheme.isMainTheme(environment);
        return {
            option: admin,
            color,
            defaultTheme,
            autoLoadHome
        };
    }

    function setProductLogo() {
        let image = document.querySelector('.application-logo img');
        let src = `/images/productlogo_OCL.png`;

        if (top.applicationType) {
            src = `/images/productlogo_${top.applicationType}.png`;
        }

        image.src = src;
    }

    function setAdminIds(administrations) {
        administrations.map(admin => adminIds.push(admin.IDT));
    }


    async function render(def) {
        setProductLogo();
        setAdminIds(def.administrations);
        const placeHolder = P.query('.administrationMenu');
        const links = def.links.map(template.link.item).join('');
        const admins = def.administrations.map(mapAdmin);

        let innerHtml = template.link.tile(links);
        innerHtml += admins.map(template.admin).join('');
        placeHolder.innerHTML = innerHtml;

        $('.administrationMenu').slick(Slicksettings.administration);

        focusFirst();
        activateOnlyAdmin();
        setFilterIcon();

        // Lets hack the arrows back
        let prev = document.querySelectorAll('.slick-prev');
        let next = document.querySelectorAll('.slick-next');

        [...prev].forEach(button => {
            button.innerHTML = `<i class="fas fa-chevron-left"></i>`;
        });

        [...next].forEach(button => {
            button.innerHTML = `<i class="fas fa-chevron-right"></i>`;
        });
    }

    function setFilterIcon() {
        let nrOfAdmins = MAINDOC.querySelectorAll('.administration-button').length;
        let showAfter = SCOPE.main.Settings.get('SHOW_ENV_SEARCH_AFTER') || 0;
        MAINDOC.querySelector(`.administrationHeader  i`).setAttribute(
            'data-hidden',
            nrOfAdmins < showAfter
        );
    }

    function isOpen() {
        let part = P.query('header');
        return part.offsetHeight > 200;
    }

    function toggle() {
        if (isOpen()) {
            collapse();
        } else {
            open();
        }
    }

    function open() {
        header = P.query('header');
        header.setAttribute('data-forced-open', 'true');
        focusFirst();
    }

    function tabletMode(enviroment) {
        if (OCULUS.extendedNav) {
            return;
        }

        SCOPE.mainDoc.querySelector("#applicationHeader").setAttribute("data-hidden","true")
        SCOPE.mainDoc.querySelector(".administrationHeaderInformation").classList.add("no-margin-top")

        P.setAttributesToNodeList(
            '.administrationOption:not(.tileWrapper)',
            'data-hidden',
            'true'
        );
        P.setAttributesToNodeList('.sessionTabWrapper', 'data-hidden', 'true');
        P.setAttributesToNodeList('.administrationMainMenu', 'data-hidden', 'true');
        collapse();
        if (enviroment) {
            P.setAttributesToNodeList(
                `.administrationOption[data-option-env="${enviroment}"]`,
                'data-hidden',
                'false'
            );
        }
    }

    function collapse() {
        let header = P.query('header');
        header.setAttribute('data-initial-collapse', false);
        header.setAttribute('data-forced-open', 'false');
        header.setAttribute('data-auto-collapse', true);
        setTimeout(function () {
            header.setAttribute('data-auto-collapse', false);
        }, 2000); // 2s allows chrome to adjust to collapse
        if (SCOPE.session && SCOPE.session.setCursor) {
            SCOPE.session.setCursor();
        }
    }

    function toggleFilter() {
        let filterField = MAINDOC.querySelector(
            'section .administrationHeader input'
            ),
            closeIcon = MAINDOC.querySelector(
                'section .administrationHeader i.pth-close'
            ),
            showIcon = MAINDOC.querySelector(
                'section .administrationHeader i.pth-search'
            ),
            isHidden = filterField.dataset.hidden == 'true';

        if (isHidden) {
            closeIcon.dataset.hidden = false;
            showIcon.dataset.hidden = true;
            filterField.dataset.hidden = false;
            filterField.focus();
            return;
        }
        closeIcon.dataset.hidden = true;
        showIcon.dataset.hidden = false;
        filterField.dataset.hidden = true;
        filterField.value = '';
        filter();
    }

    function filter() {
        let filterField = MAINDOC.querySelector(
            'section .administrationHeader input'
            ),
            value = filterField.value.toLowerCase();

        if (!value.trim()) {
            $('.administration-button').fadeIn('fast', function () {
            });
            return; //=>
        }

        $(
            '.administration-button:not([data-filter-value*="' + value + '"])'
        ).fadeOut('fast', function () {
        });
        $(
            '.administration-button[data-filter-value*="' + value + '"]'
        ).fadeIn('fast', function () {
        });
    }

    function getActiveId() {
        const currentAdminButton = SCOPE.mainDoc.querySelector(
            '.administrationOption[data-button-state="active"]'
        );
        if (currentAdminButton) {
            return currentAdminButton.dataset.adminId;
        }
    }

    /**
     * updates counter part of admin tiles
     */
    function update() {
        //get all admin tile counters
        const adminTilesCounter = [...SCOPE.mainDoc.querySelectorAll('.administrationOption .session-counter')];
        const sessionPerAdmin = {};
        //iterate over sesion tabs
        [...SCOPE.mainDoc.querySelectorAll('.sessionTabContainer')].forEach(tab => {

            let adminId = tab.dataset.adminId
            if (!sessionPerAdmin[adminId]) {
                //there is no admin registerd jet
                sessionPerAdmin[adminId] = 1;
            }else{
                //add one mor session
                sessionPerAdmin[adminId]++;
            }
        })

        // go over all the administartion tiles
        adminTilesCounter.forEach(counter => {
            const nrOfSessionsOpen = sessionPerAdmin[counter.parentNode.dataset.adminId] || '';
            counter.innerText = nrOfSessionsOpen;
            if (nrOfSessionsOpen) {
                // no sessions for this admin so hide the counter
                counter.classList.remove('hidden');
            } else {
                // show the counter
                counter.classList.add('hidden');
            }
        })
    }

    this.update = update;
    this.adminIds = adminIds;
    this.getActiveId = getActiveId;
    this.filter = filter;
    this.toggleFilter = toggleFilter;
    this.tabletMode = tabletMode;
    this.collapse = collapse;
    this.toggle = toggle;
    this.render = render;
    this.keyup = keyup;
}.apply(AdminMenu));
