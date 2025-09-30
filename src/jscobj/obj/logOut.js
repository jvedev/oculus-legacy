var LogOut = {};
(function() {
  function click(ev) {
    let message = getCapt('msgLogOut');

    Confirm.show({
      title: getCapt('titleLogOut'),
      message: message,
      handler: ok => {
        if (ok) logout();
      }
    });

    return;
  }

  function reload() {
    window.top.document.querySelector('#landingPageFrame').contentWindow.location.reload();
  }

  function newWindow() {
    window.open(window.top.location.href, '_blank');
  }
  async function logout() {
    await NAV.Session.closeAll('log-out');
    if (!window.top.authenticationToken) {
      $.ajax({
        url: location.href + '?userAction=logout',
        username: OCULUS.remoteUser,
        password: 'logout',
        async: false,
        statusCode: { 401: function() {} }
      });
    }

    if(window.top.$){
      var defaultRoot = window.top.$('#landingPageFrame').attr('data-default-root');
      window.top.$('#landingPageFrame').prop('src', defaultRoot);
      window.top.$('#landingPageFrame').attr('data-show-message', 'logout');
      window.top.logout = true;
      return false;
    }


    window.top.location.reload();
    return false;
  }
  this.newWindow = newWindow;
  this.click = click;
  this.reload = reload;
}.apply(LogOut));
