/* global P, keyCode */
var MainMenu = {};
(function () {
    function keyup(ev) {

    }

    function render(administration, toStart) {
        let placeHolder = P.query(`.firstMainMenu  .MainMenuByAdmin`),
            innerHTML = '';

        if (placeHolder && placeHolder.dataset.adminId == administration.IDT) {
            if (toStart) {
                // reset();
                focus();
            }

            return;
        }
        XDOM.removeDOMObject(placeHolder);

        P.query('.firstMainMenu').innerHTML += `<div class="MainMenuByAdmin" data-admin-id="${administration.IDT}" ></div>`;
        placeHolder = P.query(`.firstMainMenu  .MainMenuByAdmin[data-admin-id="${administration.IDT}"]`);

        //setting the index
        let index = 0;

        // For each menu button
        for (let item of administration.mainItems) {
            //adding index
            item.index = index++;

            // Append the live elements to the placeholder
            placeHolder.appendChild(MainMenuButton.render(item));
        }


        XDOM.addEventListenerToNode(".mainMenuButton", "mouseenter", mouseenter, placeHolder);

        $("#sessionTabWrapper").sortable({
            forcePlaceholderSize: true,
            axis: "x",
            delay: 300,
            items: '.sessionTabContainer:not([data-homepage= "true"])'
        });

        slick();
        focus();

        // Lets hack the arrows back
        let prev = document.querySelectorAll('.slick-prev');
        let next = document.querySelectorAll('.slick-next');


        [...prev].forEach((button) => {
            button.innerHTML = `<i class="fas fa-chevron-left"></i>`;
        });

        [...next].forEach((button) => {
            button.innerHTML = `<i class="fas fa-chevron-right"></i>`;
        });

        updateMode()
    }

    function mouseenter(e) {

    }

    /**
     * http://kenwheeler.github.io/slick/
     * @param {*} adminId
     */
    function slick() {
        let menu = $(`.firstMainMenu .MainMenuByAdmin`);

        menu.slick(Slicksettings.mainMenu);

        // Use slick 'setposition' event to reverse the slick translate on the mega menu (bit hacky)
        menu.on('setPosition', (event, slick) => {

            // Select the menus
            let menus = document.querySelectorAll('imp-menu');

            // Check if the menu is 'mega'
            if (menus[0] && menus[0].getAttribute('mode') == 'mega') {

                // Get the transform from the slick track
                let transform = slick.$slideTrack[0].style.transform;

                // Snip and convert to get the true translate
                let transformValue = Math.abs(transform.substr(12, transform.length - 8).split(', ')[0].replace('px', ''));

                // Reverse the translate on the actual menu
                [...menus].forEach((menu) => {
                    menu.style.transform = `translate3d(${transformValue}px, 0, 0)`;
                });
            }
        });

        // Switch to mouse control
        let track = document.getElementById('administrationMainMenu');

        track.addEventListener('mousemove', (event) => {
            // Add mouse class / remove keynoard class
            track.classList.remove('keyboard-control');
            track.classList.add('mouse-control');
        });
    }

    function keyFocus(adminMenu) {
        // Whirly reset the slicky slider slickly
        let menu = $(`.firstMainMenu .MainMenuByAdmin`);
        menu.slick('slickGoTo', 0);

        window.Menu.keyFocus(adminMenu);
    }

    //adding appropriate classes to the menu items to highlight them all
    function update(clickPath = []) {
        clearClickPath();
        // start at the main menu button
        let query = `.mainMenuButton`;
        for (let i = 0, l = clickPath.length; i < l; i++) {
            query += `[data-index="${clickPath[i]}"] `;
            let item = SCOPE.mainDoc.querySelector(query);
            if (!item) {
                return;
            }
            item.classList.add('in-click-path');

        }
    }

    function clearClickPath() {
        //remove current clickpath
        [...SCOPE.mainDoc.querySelectorAll('.in-click-path')].forEach(obj => {
            obj.classList.remove('in-click-path');
        });

    }


    /**
     * updates mode of menu depending on settings
     * posible setting could be *TEXT | *ICON | *BOTH
     */
    function updateMode() {

        // get the menu
        const menu = SCOPE.mainDoc.querySelector(`.administrationMainMenu`);
        const setting = SCOPE.main.Settings.get('MAIN_MENU_MODUS');
        menu.classList.remove('no-text', 'no-icon');
        switch (setting) {
            //text only
            case '*TEXT':
                menu.classList.add('no-icon');
                return;
            //icon only
            case '*ICON':
                menu.classList.add('no-text');
                return;
            //icon and text
            default:
            //do nothing
        }
    }

    this.updateMode = updateMode;

    this.clearClickPath = clearClickPath;
    this.update = update;
    this.keyFocus = keyFocus;
    this.keyup = keyup;
    this.render = render;
}).apply(MainMenu);

