var SessionUserAction = {};
(function() {
  function skin() {
    MAIN.userSettings.themePicker();
  }
  function print(ev) {
    MAIN.userSettings.printScreen();
  }
  function close(ev) {
    if (ev.invokeObject.dataset.buttonEnabled !== 'true') {
      return;
    }

    if (SESSION.isSingleView) {
      TopView.close();
      return; //=> actieve scherm is een topview dus sluit dit scherm eerst.
    }

    // Depending on the extendedNav we search for the actie or just the single session tab close button
    let query = OCULUS.extendedNav?'.sessionTab[data-button-state="active"] .closeIcon':'.sessionTab .closeIcon'

    let closeButton = MAINDOC.querySelector(query);
    if (!closeButton) {
      return;
    }
    closeButton.dataset.reason = 'session-opions-close-clicked';
    XDOM.invokeClick(closeButton);
  }
  function help(ev) {
    Help.procedure(ev);
  }

  function favourites(ev) {
    if (ev.invokeObject.dataset.buttonEnabled !== 'true') {
      return;
    }
    SCOPE.main.Favourites.add(SESSION.session);
  }

  this.favourites = favourites;
  this.skin = skin;
  this.print = print;
  this.close = close;
  this.help = help;
}.apply(SessionUserAction));
