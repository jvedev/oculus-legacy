/* global P, keyCode */
var SecondMenu = {};
(function () {
    let admin = null,
        buttons = [];

    function getButtons() {
        buttons = [];

      if (minVersion('*8A')) {
          buttons.push({
              id: 'none',
              title: 'none',
              icon: '',
              eventClass: '',
              action: '',
              state: 'disabled'
          });
          buttons.push({
              id: 'none',
              title: 'none',
              icon: '',
              eventClass: '',
              action: '',
              state: 'disabled'
          });
          buttons.push({
              id: 'none',
              title: 'none',
              icon: '',
              eventClass: '',
              action: '',
              state: 'disabled'
          });

          buttons.push({
              id: 'sideBav',
              title: 'Sidebar',
              icon: 'fas fa-arrow-left',
              eventClass: 'Sidebar',
              action: 'open',
              state: 'enabled'
          });
          buttons.push({
              id: 'user-settings',
              title: 'settings',
              icon: 'fa fa-cogs',
              eventClass: 'userSettings',
              action: 'open',
              state: 'enabled'
          });
          buttons.push({
              id: 'chooseSkin',
              title: 'SESSIONMENU_THEME_HOVER_TXT',
              icon: 'fa fa-palette',
              eventClass: 'newTheme',
              action: 'pick',
              state: 'enabled'
          });


      }

    buttons.push({
      id: 'homeButton',
      title: getCapt('txtHome'),
      icon: 'fas fa-home',
      eventClass: 'Home',
      action: 'click',
      state: hasHome() ? 'enabled' : 'disabled'
    });

        buttons.push({
            id: 'mainMenuHelpButton',
            title: getCapt('txtHelp'),
            icon: 'fas fa-question',
            eventClass: 'Help',
            action: 'mainMenu',
            state: 'disabled'
        });

        if (minVersion('*8A')) {
            buttons.push({
                id: 'openfavouritesButton',
                title: getCapt('txtfavourites'),
                icon: 'fas fa-star',
                eventClass: 'Favourites',
                action: 'show',
                state: 'enabled'
            });
        }

        for (let i = 8; buttons.length < i;) {
            buttons.push({
                icon: '',
                state: 'disabled'
            })
        }
    }

    function hasHome() {
        const adminDef = Administration.get(admin.IDT);
        const homeApp = adminDef.homeApp || admin.homeAppDir; //backwards compatibility 7C, 7D
        return !!homeApp;
    }

    function render(adminDef) {
        let burger = SCOPE.mainDoc.querySelector('imp-burger')
        if (burger) {//is the burger menu  already there?
            burger.remove();
        }
        admin = adminDef;
        getButtons();
        burger = document.createElement('imp-burger');

        burger.innerHTML = buttons.map(renderButton).join('');

        P.query('.secondMainMenu').appendChild(burger);
    }

    function renderButton(def) {
        def.IDT = admin.IDT;
        def.ENV = admin.ENV;
        return template.secondMainMenuButon(def);
    }

    this.render = render;
}.apply(SecondMenu));
