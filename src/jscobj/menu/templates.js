const template = {};

template.session = {};
template.session.tab = function (def) {
    return `<div class="sessionTabContainer ${def.fixed}"
              data-default-theme = "${def.defaultTheme}" 
              data-admin-id = "${def.IDT}"
              
              >
            <a  data-last-open="true"
                role="button" tabindex="0"
                class="sessionTab theme-border-color theme-inactive-background-color"
                data-color = "${def.color}"
                data-event-class="SessionTab"
                data-hotkey-handler="SessionTab"
                data-focus = ""
                data-session-job-nr="${def.jobNr}"
                data-enviroment = "${def.ENV}"
                data-admin-id = "${def.IDT}"
                data-administration-name = "${def.adminName}"
                data-session-description = "${def.DSC}"

            >
                <i data-font-color="alert" data-hidden="true" class="pth-exclamation-triangle"></i>
                <span >${def.DSC}</span>
                <i class="pth-close closeIcon" data-event-class="SessionTab" data-click="close" ></i>
            </a>
    </div>`;
};

template.session.hometab = function (def) {
    return `<div class="sessionTabContainer"
               data-homepage= "true"
               data-default-theme = "${def.defaultTheme}"  data-admin-id = "${def.IDT}">
             <a role="button" tabindex="0"  class="sessionTab theme-border-color theme-inactive-background-color"
                 data-color = "${def.color}"
                 data-event-class="SessionTab"
                 data-hotkey-handler="SessionTab"
                 data-focus = ""
                 data-session-job-nr="${def.jobNr}"
                 data-admin-id = "${def.IDT}"
                 data-enviroment = "${def.ENV}"
                 data-administration-name = "${def.adminName}"
                 data-session-description = "${def.DSC}"

             >
                 <i data-font-color="alert" data-hidden="true" class="pth-exclamation-triangle"></i>
                 <i class="pth-home homeTab theme-font-color"></i>
                 ${template.session.hometab.closeButton()}
                 
             </a>
     </div>`;
};
template.session.hometab.closeButton = () => {
    if (SCOPE.main.Settings.get('ALLOW_CLOSE_HOME')) {
        return '<i class="pth-close closeIcon" data-event-class="Home" data-click="closeTab" ></i>'
    }
    return '';
};

template.mainMenu = {};


template.subProcedure = {};
template.subProcedure.dummy = `<div class="  col-md float-left subProcedureBtnContainer" ></div>`;
template.subProcedure.title = function (def) {
    return `<span  class="subprocedure-single-button-title">${def.option.DSC} (${def.option.TTL}) - ${
        def.option.SBP
    }</span>`;
};

//theme-active-background-color theme-active-border-color theme-focus-background-color theme-focus-border-color theme-hover-background-color

template.subProcedure.fixedButton = function (maxWidth, def, hidden = false) {
    return `
    <div class=" col-md float-left subProcedureBtnContainer" data-enable-max-width="${maxWidth}" data-hidden="${hidden}">
        <a  role="button" tabindex="0" class="subProcedureBtn theme-active-background-color theme-hover-background-color"
            data-event-class="SubProcedureButton"
            data-hotkey-handler="SubProcedureButton"
            data-focus = ""
            data-fixed="true"
            data-hidden=${def.hidden || 'false'}
            data-available="${def.available}"
            data-nr="${def.optionNr}"
            title="${def.option.TTL} (${def.option.SBP})"
            ${XDOM.Def2Attributes(def.option)} >
            <span class="">${def.option.DSC}</span>
        </a>
    </div>`;
};

template.subProcedure.dropDownOneButton = function (def) {
    return `<div class="container-full dropdown-content theme-active-background-color theme-focus-background-color theme-focus-border-color" data-hidden="true">
                    <div class="row row-no-margin row-no-padding row-subprocedure-menu" >
                        <div role="button" tabindex="0" data-hidden="true" data-only-option="true" ${XDOM.Def2Attributes(
        def
    )} ></div>
                    </div>
                </div>`;
};

template.subProcedure.dropDownButton = function (def) {
    return `
    <div role="button" tabindex="0" class=" float-left dropdown-item"
        data-event-class="SubProcedureButton"
        data-hotkey-handler="SubProcedureButton"
        data-available="${def.available}"
        data-focus = ""
        title="${def.option.TTL} (${def.option.SBP})"
        ${XDOM.Def2Attributes(def.option)} >
        <!--${userOrDevTitle(def.option.TTL, def.option.SBP)}-->
        <span class="">${def.option.DSC}</span>
    </div>`;
};

/*
template.subProcedure.doubleRow = function(buttons){
    return `
    <div class="container-full" >
        <div class=" row row-no-margin row-no-padding ">
            <div class="col-lg-12 col-xl-6 float-left" >
                <div class=" row row-no-margin row-no-padding row-subprocedure-menu">
                    ${buttons[0]}
                </div>
            </div>
            <div class="col-lg-12 col-xl-6  float-left">
                <div class=" row row-no-margin row-no-padding row-subprocedure-menu">
                    ${buttons[1]}
                </div>
            </div>
        </div>
    </div>`;
};

*/
template.subProcedure.doubleRow = function (buttons) {
    return `
    <div class="container-full " >
        <div class=" row row-no-margin row-no-padding ">
            <div class="col-lg-12 float-left" >
              <div class=" row row-no-margin row-no-padding row-single-section row-subprocedure-menu">
                ${buttons[0]}
                <div class="clearfix hidden-xl"></div>
                ${buttons[1]}
              </div>
            </div>
        </div>
    </div>`;
};

template.subProcedure.singleRow = function (buttons) {
    return `
    <div class="container-full " >
        <div class=" row row-no-margin row-no-padding ">
            <div class="col-lg-12 float-left" >
            <div class=" row row-no-margin row-no-padding row-single-section row-subprocedure-menu">
                    ${buttons}
                </div>
            </div>
        </div>
    </div>`;
};

template.subProcedure.dropDown = function (buttons) {
    return `
    <div class="dropdown-content theme-active-background-color theme-focus-background-color theme-focus-border-color" >
            <div class=" row row-no-margin row-no-padding row-subprocedure-menu">
                ${buttons}
            </div>
    </div>`;
};

template.procedure = {};

template.procedure.dummy = `<div class="dummyBtn  col-md  hidden-xl float-left procedureBtnContainer" ></div>`;

template.procedure.buttonGroup = function (buttonGroup) {
    return `
            <div class="button-group theme-border-color" data-flex-button-count="${buttonGroup.nr}">
              <div class="row row-no-padding row-no-margin button-group-row">
                <div class="procedure-subtitle  col-md float-left" data-hidden=${buttonGroup.title.trim() ===
    ''}> <span> ${buttonGroup.title} </span></div>
              </div>
              <div class="row row-no-padding row-no-margin button-group-row">
                ${buttonGroup.buttons}
              </div>
            </div>`;
};

template.procedure.button = function (procedure, subProcedures) {
    return `<div class=" col-md float-left procedureBtnContainer"
                    data-has-options="${procedure.hasOptions}"
                    data-enable-max-width="${procedure.maxWidth}"
                    data-focus = "" data-hidden=${procedure.option.hidden}>
                    <a role="button" tabindex="0" class="procedureBtn theme-active-background-color theme-active-border-color theme-hover-background-color theme-hover-border-color theme-focus-background-color theme-focus-border-color"
                            data-event-class="ProcedureMenu"
                            data-hotkey-handler="ProcedureMenu"
                            data-nr="${procedure.optionNr}"
                            title="${procedure.option.DSC} (${procedure.option.TTL}), ${procedure.option.PRC}"
                            ${XDOM.Def2Attributes(procedure.option)}>
                        <div><span>${procedure.option.DSC}</span></div>
                        <i class="pth-icon hasDropdownList theme-active-color theme-focus-font-color" data-button-icon="arrowDown"> </i>
                        ${subProcedures}
                    </a>
            </div>`;
};

template.procedure.title = function (option) {
    return `<span class="procedure-single-button-title"> ${userOrDevTitle(
        option.DSC + ' (' + option.TTL + ')',
        option.PRC
    )}</span>`;
};
template.procedure.singleRow = function (buttons, buttonCount) {
    return `
    <div class="col  float-left" >
        <div class=" row row-no-margin row-no-padding row-single-section row-procedure-menu">
          <div class=" row row-no-margin row-no-padding container-procedure-menu-buttons" data-button-count="${buttonCount}">
            ${buttons}
          </div>
        </div>
    </div>`;
};

template.procedure.doubleRow = function (buttons) {
    return `
    <div class="col  float-left" >
        <div class=" row row-no-margin row-no-padding row-single-section row-procedure-menu">
            ${buttons[0]}
            <div class="clearfix hidden-xl"></div>
            ${buttons[1]}
        </div>
    </div>`;
};

template.menu = {};
template.menu.program = function (def) {
    return `
    <div class="dropdown-item"
        role="button" tabindex="0" class="dropdown-item"
        title="${def.TTL} (${def.PGM})"
        data-event-class="MainMenuSubItem"
        data-admin-id="${this.IDT}"
        data-focus = ""
        data-hotkey-handler="MainMenuSubItem"
        ${XDOM.Def2Attributes(def)}>
        <!--${userOrDevTitle(def.TTL, def.ENV, def.APP, def.PGM)}-->
        <a>
            <span>${def.DSC}</span>
        </a>
    </div>`;
};

template.menu.entry = function (item, subItems) {
    return `
    <div class="dropdown-item"
        data-test="geen"
        data-focus = ""
        data-hotkey-handler="MainMenuSubItem"
        data-event-class="MainMenuSubItem"
        
        data-admin-id="${item.IDT}"
        ${XDOM.Def2Attributes(item.definition)}>
        <a role="button" tabindex="0" >
            <span class="dropDownArrow">${item.DSC}</span>
        </a>
        ${subItems}
    </div>`;
};

template.admin = function (def) {
    const homeApp = def.homeApp || def.homeAppDir || ''; //backwards compatibility 7C, 7D
    return `<a role="button" tabindex="0" class="administration-button" data-environment="${def.option.ENV}" data-filter-value="${def.option.DSC.toLowerCase()}" data-color= "${
        def.color
    }" data-default-theme = "${def.defaultTheme}">
                <div class="administrationOption  theme-background-color"
                     title="${userOrDevTitle(def.option.TTL, def.option.ENV)}"
                     ${XDOM.Def2Attributes(def.option)}
                     data-button-state="inactive"
                     data-admin-id="${def.option.IDT}"
                     data-focus = ""
                     data-event-class="Administration"
                     data-auto-load-home = "${def.autoLoadHome}"
                     data-option-pgm="${def.homeOption || ''}"
                     data-option-env="${def.option.ENV}"
                     data-option-app="${homeApp}"
                     >
                    <div class="icon">
                      <img src="/${def.option.LGO}" name="administationLogo" alt = "${userOrDevTitle(def.option.TTL, def.option.ENV)}" title="${userOrDevTitle(
        def.option.TTL,
        def.option.ENV
    )}" />
                    </div>
                    <div class="text"> <span>${def.option.DSC}</span></div>
                    <div class="session-counter"></div>
                </div>
            </a>`;
};

template.link = {};
template.link.item = function (item) {
    return `
    <a href="${item.LNK}" class="col-sm-4 col-lg-3 linkTile" target="_blank">
        <i class="icon fa ${item.ICO}" > <span class="applicationTooltip">${item.DSC}</span> </i>

    </a>`;
};

template.link.tile = function (links) {
    return `
           <div class="administrationOption tileWrapper" >
             <div class="row row-no-padding row-no-margin show-grid">
               ${links}
             </div>
           </div>
            `;
};
template.macro = {};
template.macro.singleRow = function (buttons) {
    return `${buttons}`;
};

template.macro.tab = function (macro, index) {
    return `<a  role="button" tabindex="0" title="${macro.TTL} (ALT + ${index + 1}), ${macro.MCR}"
            class="macro-tab theme-active-border-color theme-focus-border-color"
            data-hotkey-handler="MacroTab"
            data-macro-index="${index + 1}"
            data-hotkey-down-handler="MacroTab"
            data-block-autosubmit="true"
            data-event-class="MacroTab"
            ${XDOM.Def2Attributes(macro)}
            data-button-state="">
          <span>${macro.DSC}</span>
        </a>`;
};

template.secondMainMenuButon = function (def) {
    return `<a role="button" 
               class="burger-button"
               tabindex="0"
               data-event-class="${def.eventClass}"
               data-click="${def.action}"
               data-admin-id = "${def.IDT}"
               data-button-state="${def.state}"
               data-env="${def.ENV}">
               <i class="${def.icon}"></i>
            </a>`;
};

template.home = {};

template.home.content = function (admin) {
    return `<div style="font-family: 'arial'; 
                      margin-top:300px; 
                      font-size:20px; 
                      width:100%; 
                      text-align:center; 
                      overflow: hidden;
          ">
          <span style="position: relative; float:left; font-family: 'arial'; width:100%; font-size:22px; font-weight: bold;">Actieve administratie:</span> <span style="position: relative; float:left; font-family: 'arial'; width:100%; font-size:30px; color: #4e4e4e;">${
        admin.DSC
    } </span></div>`;
};
