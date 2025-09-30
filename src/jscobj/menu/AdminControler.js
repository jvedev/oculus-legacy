var AdminControler = {};
(function() {
  let adminId = '';

  function init(invokeObject) {
    adminId = invokeObject.dataset.adminId;
  }

  /**
   * 
   */
  function getOpenAdmins() {
    const openAdmins = new Map(),
    visibleAdmins = new Map();
    hiddenAdmins = new Map()
    Q('.sessionTabContainer').forEach(tab => {
      openAdmins.set(tab.dataset.adminId, tab.dataset.adminId);
      if(tab.dataset.hidden == 'true'){
        hiddenAdmins.set(tab.dataset.adminId, tab.dataset.adminId);
      }else{
        visibleAdmins.set(tab.dataset.adminId, tab.dataset.adminId);
      }
    });

    return { openAdmins:openAdmins,
      visibleAdmins:visibleAdmins,
      hiddenAdmins:hiddenAdmins,
      multipleVisableAdmins:(visibleAdmins.size>1),
      moreThanOneAdmin:(openAdmins.size>1)
    }
  }

  /**
   *
   * @param {HTMLElement} invokeObject
   */
  function showOnlyThisAdmin(invokeObject) {
    if (!invokeObject) {
      return;
    }
    hideAllAdmins();
    setHidden(invokeObject, false);
  }

  function hideAllAdmins() {
    const tabs = Q(`.sessionTabContainer`),
      frames = Q(`.sessionFrame`); //, .MainMenuByAdmin
    tabs.forEach(tab => tab.setAttribute('data-hidden', true));
    frames.forEach(frame => frame.setAttribute('data-hidden', true));
  }

  /**
   * @param {HTMLElement} invokeObject
   */
  function closeAdmin(invokeObject) {
    init(invokeObject);
    const toClose = Q(`.sessionTabContainer[data-admin-id="${adminId}"] [data-click="close"]`);
    toClose.forEach(tab => XDOM.invokeClick(tab));
  }

  function showAllAdmins(invokeObject) {
    const tabs = Q(`.sessionTabContainer`);
    tabs.forEach(tab => tab.setAttribute('data-hidden', false));
  }

  /**
   * @param {HTMLElement} invokeObject
   * @param {boolean} hidden
   *
   * @returns {boolean} admin has open sessions
   */
  function setHidden(invokeObject, hidden) {
    init(invokeObject);
    const frames = Q(`.sessionFrame[data-admin-id="${adminId}"], .MainMenuByAdmin[data-admin-id="${adminId}"]`),
      toHideIsActive = Q(`.sessionTabContainer[data-admin-id="${adminId}"]`).length > 0,
      hasTabs = setHiddenTabs(invokeObject, hidden);
    //tabs.forEach(tab => tab.setAttribute('data-hidden', hidden));
    if (hidden) {
      frames.forEach(frame => frame.setAttribute('data-hidden', hidden));
      if (toHideIsActive) {
        showAnOtherAdmin();
      }
    } else {
      activateLastOpenTab();
    }
    return hasTabs;
  }

  /**
   * sets hidden property of tabs
   * @param {HTMLElement} invokeObject
   * @param {boolean} hidden
   *
   * @returns {boolean} admin has open sessions
   */
  function setHiddenTabs(invokeObject, hidden) {
    init(invokeObject);
    const tabs = Q(`.sessionTabContainer[data-admin-id="${adminId}"]`);
    tabs.forEach(tab => tab.setAttribute('data-hidden', hidden));
    return tabs.length > 0;
  }

  /**
   * enables/disables administrations
   * @param {HTMLElement} invokeObject
   * @param {boolean} disabled
   */
  function setDisabled(invokeObject, disabled) {
    init(invokeObject);

    const frames = Q(`.sessionFrame[data-admin-id="${adminId}"], .MainMenuByAdmin[data-admin-id="${adminId}"]`),
      tabs = SCOPE.mainDoc.querySelectorAll(`.sessionTabContainer[data-admin-id="${adminId}"]`);

    invokeObject.setAttribute('data-disabled', disabled);
    frames.forEach(frame => frame.setAttribute('data-disabled', disabled));
    tabs.forEach(tab => {
      tab.setAttribute('data-hidden', disabled);
      tab.setAttribute('data-disabled', disabled);
    });

    if (disabled) {
      showAnOtherAdmin();
    } else {
      activateLastOpenTab();
    }
  }

  /**
   * opens last activated session tab given (global to closure scope)  current admin
   */
  function activateLastOpenTab() {
    const lastOpenTab = Q(`.sessionTabContainer[data-admin-id="${adminId}"] a[data-last-open=true]`)[0],
      admintab = Q(`.administrationOption[data-admin-id="${adminId}"]`)[0];

    if (lastOpenTab) {
      // admintab.setAttribute('data-button-state', ''); //this is needed otherwise the onclick event wil not do anything

      lastOpenTab.setAttribute('data-button-state', ''); //this is needed otherwise the onclick event wil not do anything
      // XDOM.invokeClick(admintab);
      XDOM.invokeClick(lastOpenTab);
      //does this job has its own particular colour?
      //is so we need to set main again to reflect the colour of the environment not the colour of the job
      if(lastOpenTab.getAttribute('data-skin-assigned-to-job')){
        SCOPE.main.newTheme.setMain()
      }
      return true;
    }
    return false;
  }

  /**
   * shows an other available admin
   */
  function showAnOtherAdmin() {
    //try to get the first admin tab that is not hidden or disabled
    //if it's not there try a hidden tab
    let adminTab =
      Q(`.sessionTabContainer:not([data-disabled="true"])[data-hidden="false"]:not([data-admin-id="${adminId}"])`)[0] ||
      Q(`.sessionTabContainer:not([data-disabled="true"]):not([data-admin-id="${adminId}"])`)[0];
    if (adminTab) {
      setHidden(adminTab, false);
    }
  }

  /** helper function to shorthand  SCOPE.mainDoc.querySelectorAl
   * @param {string} domquery
   * @returns {NodeList}
   */
  function Q(query) {
    return SCOPE.mainDoc.querySelectorAll(query);
  }

  /** helper yo get basic propertys from invokeObject
   * @param {HTMLElement}
   * @returns {adminId:String, disabled:boolean, hidden:boolean, openTabs:boolean}
   */
  function getInvokeProps(invokeObject) {
    return {
      disabled: invokeObject.dataset.disabled == 'true',
      hidden: Q(`.sessionTabContainer[data-hidden="true"][data-admin-id="${adminId}"]`).length > 0,
      openTabs: Q(`.sessionTabContainer[data-admin-id="${adminId}"]`).length > 0
    };
  }

  function forceAdminHeaderOpen() {
    Q(`.applicationHeader`)[0].setAttribute('data-forced-open', true);
  }
  function removeForceAdminHeaderOpen() {
    Q(`.applicationHeader`)[0].setAttribute('data-forced-open', false);

    document.removeEventListener('closeCtxMenu', removeForceAdminHeaderOpen);
  }
  /**
   * opens context menu for Admin tile
   * @param {PTHEvent} ev
   */
  function adminContext(ev) {
    init(ev.invokeObject);
    //const admins = getOpenAdmins(ev.invokeObject),
     const {moreThanOneAdmin} = getOpenAdmins(ev.invokeObject),
       enforceSingleAdminSessions = SCOPE.main.Settings.get('SHOW_SINGLE_ENV_SESSIONS'),
      { disabled, hidden, openTabs } = getInvokeProps(ev.invokeObject),
      def = [],
      captions = getCaptionSet('AdminContext');;

    // Declare section arrays
    const thisAdmin = [];
    const allAdmin = [];

    // Check for disabled
    if (disabled) {
      // Toggle enabled
      thisAdmin.push(SCOPE.main.ImpCtx.item(
        captions.enable, 
        'fas fa-times-circle', 
        null, 
        () => { 
          setDisabled(ev.invokeObject, false); 
    }
      ));
    } else {
      // Check if single admin session is forced
      if (!enforceSingleAdminSessions) {
        // Check for open tabs and open admin sessions
        if (moreThanOneAdmin && openTabs) {
          // Show sessions from this admin
          thisAdmin.push(SCOPE.main.ImpCtx.item(
            captions.showThisAdmin,
            'fas fa-eye-slash',
            null,
            () => { 
              showOnlyThisAdmin(ev.invokeObject); 
            }
          ));
        }
        // Check if hidden
        if (hidden) {
          // Show sessions from this administration
          thisAdmin.push(SCOPE.main.ImpCtx.item(
            captions.unhide,
            'fas fa-eye',
            null,
            () => { 
              setHidden(ev.invokeObject, false);
        }
          ));  
        // Check for open tabs and open admin sessions
        } else if (moreThanOneAdmin && openTabs) {
          // Hide
          thisAdmin.push(SCOPE.main.ImpCtx.item(
            captions.hide,
            'fas fa-eye-slash',
            null,
            () => { 
              setHidden(ev.invokeObject, true); 
            }
          ));          
        }
      //   // Disable
      //   thisAdmin.push(SCOPE.main.ImpCtx.item(
      //     captions.disable,
      //     'fas fa-eye-slash',
      //     null,
      //     () => { 
      //       setHidden(ev.invokeObject, true);
      // }
     //   ));
        // Check if sessions are open
      if (openTabs) {
          // Close all sessions for this administration
          thisAdmin.push(SCOPE.main.ImpCtx.item(
            captions.closeThisAdmin,
            'fas fa-times-circle',
            null,
            () => {
              closeAdmin(ev.invokeObject);
            }
          ));
        }
      }
      }

    // Create a new context menu
    let ctx = new SCOPE.main.ImpCtx(document.getElementById('applicationHeader'), ev.event);

    // Add sections to context menu
    if (thisAdmin.length) {
    ctx.add(SCOPE.main.ImpCtx.section(ev.invokeObject.getAttribute('data-option-dsc'), thisAdmin));
    }
   
    if (allAdmin.length) {
      ctx.add(SCOPE.main.ImpCtx.section('Administratie', allAdmin));
    }

    // Hold the admin header open
    forceAdminHeaderOpen();

    // Open the context menu
    ctx.openCtx();

    // Attach open context menu to the scope for iframe closes
    SCOPE.main.ctx = ctx;
    // Setup event listener for context menu close
    const closeCtx = () => {
      // Allow admin header to toggle again
      removeForceAdminHeaderOpen();

      document.removeEventListener('closeCtx', closeCtx);
    }

    document.addEventListener('closeCtx', closeCtx);

  }

  function updateFromSettings(){
    if(SCOPE.main.Settings.get('SHOW_SINGLE_ENV_SESSIONS')){
      //show Only tabs that belong to the current active session tab
      const activeTab = SCOPE.mainDoc.querySelector('.sessionTab[data-button-state="active"]');
      showOnlyThisAdmin(activeTab);
      return;
    }

    showAllAdmins();
  }


  this.updateFromSettings = updateFromSettings;
  this.setHiddenTabs = setHiddenTabs;
  this.closeAdmin = closeAdmin;
  this.setHidden = setHidden;
  this.showOnlyThisAdmin = showOnlyThisAdmin;
  this.showAllAdmins = showAllAdmins;
  this.adminContext = adminContext;
  this.getOpenAdmins = getOpenAdmins;
}.apply(AdminControler));
