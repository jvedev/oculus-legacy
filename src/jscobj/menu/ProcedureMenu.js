var ProcedureMenu = {};
(function () {

    function load(item) {
        let singleItem = item.querySelector('[data-main-menu="true"] > [data-option-typ="PGM"]');
        MAIN.colapseAllMenus();
        XDOM.invokeClick(singleItem);
    }

    function down(item) {
        if (item.parentNode.dataset.hasOptions == "false") {
            return; //er is maar 1 subprocedure en deze knop heeft geen dropdown
        }
        if (item.parentNode.dataset.openSubitems != "true") {//item nog niet geopend
            MAIN.colapseAllMenus();
            item.parentNode.setAttribute("data-open-subitems", "true");
            item.setAttribute("data-hover", "true");
            return;
        }
        let firstSubItem = item.parentNode.querySelector('div.dropdown-item');
        MAIN.focusMenu(firstSubItem);

    }

    function left(item) {
        let nr = parseInt(item.dataset.nr) - 1,
            prevItem = document.querySelector(`.procedureBtnContainer a[data-nr="${nr}"]`);
        if (!prevItem) {
            return;
        }
        focus(prevItem);
    }

    function right(item) {
        let nr = parseInt(item.dataset.nr) + 1,
            nextItem = document.querySelector(`.procedureBtnContainer a[data-nr="${nr}"]`);
        if (!nextItem) {
            return;
        }
        focus(nextItem);
    }

    function focus(item) {
        MAIN.colapseAllMenus();
        MAIN.focusMenu(item);
    }

    function hotkey(kCode, item) {
        switch (kCode) {
            case keyCode.arrowRight:
                right(item);
                break;
            case keyCode.arrowLeft:
                left(item);
                break;
            case keyCode.arrowDown:
            case keyCode.space:
                down(item);
                break;
            case keyCode.enter:
                load(item);
                break
        }
    }

    function keyup(ev) {
        let item = document.querySelector('[data-focus="true"][data-hotkey-handler]');
        if (item) {
            let handlerClass = window[item.dataset.hotkeyHandler];
            if (handlerClass) {
                handlerClass.hotkey(ev.event.keyCode, item)
            }
            return;
        }
        return true;
    }

    /**
     *
     * @param {string} PRC procedure name
     * @param {string} SBP subprocedure name
     * @TODO JVE Search.close();  hoort hier niet naar een (sub)procedure onload of zo iets
     */
    function load(subProcedureButton) {
        let procedureName = '',
            procedure = null,
            subProcedureName = '',
            subProcedure = null;
        procedureName = XDOM.Attributes2Def(subProcedureButton).PRC
        procedure = SESSION.session.getProcedure(procedureName);
        subProcedureName = XDOM.Attributes2Def(subProcedureButton).SBP ||
            procedure.defaultSubProcedureName ||
            procedure.subProcedures[0].SBP;

        subProcedure = procedure.getSubProcedure(subProcedureName);

        if (!subProcedureButton) {
            subProcedureButton = document.querySelector(`[data-option-sbp="${subProcedureName}"]`);
        }

        activate(procedure.PRC);
        if (!subProcedure) {
            return;
        }
        SubProcedureButton.activate(subProcedureButton);
        Search.close();
        procedure.load(subProcedure);

    }

    function click(ev) {
        if (ev.invokeObject.tagName == "BODY" || isActive(ev.invokeObject)) {
            return;
        }
        let procedureBtn = ev.invokeObject,
            procedureName = XDOM.Attributes2Def(procedureBtn).PRC,
            procedure = SESSION.session.getProcedure(procedureName),
            subProcedureButton = XDOM.getParentByAttribute(procedureBtn,'data-only-option'),
            subProcedureName =  procedure.defaultSubProcedure?procedure.defaultSubProcedure.SBP :'';
        if (subProcedureButton) {
            subProcedureName = XDOM.Attributes2Def(subProcedureButton).SBP || subProcedureName;
        }

        SessionMenus.load(procedureName, subProcedureName);
        return true;
    }


    function mousedown() {
        SESSION.session.cancelBlurEvent = true;
    }

    function renderSingleProcedure(options) {
        let procedureOptions = options.filter(o => typeof o !== "string");
        if (procedureOptions.length > 1 ) {
            return false
        }
        if(procedureOptions.length==0){//only menu options
            return null;
        }
        procedureOptions[0].hidden = true;
        procedureOptions = procedureOptions.map(o => renderButton(o, 1)).join('');
        XDOM.getObject("procedureMenu").setAttribute("data-hide-menu", "true");
        return procedureOptions;
    }

    function splitOptions(options) {
        let setSize = Math.ceil(options.length / 2);
        return [options.slice(0, setSize), options.slice(setSize)];
    }

    function renderButtonGroup(group) {
        group.nr = group.options.length;

        if(group.nr===0){
            return '';
        }

        let buttons = group.options.map(renderButton)
        if (group.canSplit) {
            if (buttons.length % 2) {
                buttons.push(template.procedure.dummy);
            }
            let splitSize = Math.ceil(buttons.length / 2);
            let upperRow = buttons.slice(0, splitSize);
            let lowerRow = buttons.slice(splitSize)
            upperRow.push('<div class="clearfix hidden-xl"></div>');
            buttons = upperRow.concat(lowerRow);
        }
        group.buttons = buttons.join('');

        return template.procedure.buttonGroup(group);
    }

    function renderMultipleProcedures(options) {
        if (typeof options[0] !== "string") {
            options.unshift(""); // eerste element altijd een string voor title
        }
        let optionCount = options.filter(o => typeof o !== "string").length
        splitpos = Math.ceil(optionCount / 2);
        let option = null,
            buttonGroups = [],
            buttonCount = 0;


        for (let i = 0, l = options.length; i < l; i++) {
            option = options[i];
            if (typeof option === "string") {
                buttonGroups.push({title: option, options: []});
            } else {
                buttonCount++;
                option.useMaxWidth = (optionCount < 8);

                option.split = '';
                if (buttonCount == splitpos) {
                    option.split = '<div class="clearfix hidden-xl"></div>';
                }
                buttonGroups[buttonGroups.length - 1].options.push(option);
                buttonGroups[buttonGroups.length - 1].canSplit = (optionCount > 10);
            }
        }
        return template.procedure.singleRow(buttonGroups.map(renderButtonGroup).join(''), buttonCount);
    }

    function renderButton(procedure) {
        if (typeof procedure == 'string') {
            return;
        }
        procedure.initOptions();
        let subProcedures = subProcedureMenu.renderPullDown(procedure.subProcedures);

        procedure.hasOptions = (procedure.subProcedures.length > 1);
        procedure.option.hidden = (procedure.hidden == true);
        return template.procedure.button(procedure, subProcedures);
    }

    function mouseover(e) {
        if (e.target.dataset.openSubitems == "true") {
            return;
        }
        MAIN.colapseAllMenus();
        MAIN.removeFocus();
        enableHover();
    }

    function enableHover() {
        administrationMainMenu = document.getElementById("procedureMenu");
        administrationMainMenu.setAttribute("data-hover-enabled", "true");
    }
    function renderInvalidProcedures(){
        console.clear();
        console.log('deze procedure heeft geen geldige opties:');

        SESSION.session.invalidProcedures.forEach(prc=>{
                console.log(`    - ${prc.reason}    for ${prc.PRC} (${prc.DSC})` );
        })



        let apps = '';
        for (let [key, value] of Object.entries(SESSION.session.validApps)) {
            if(value){
                apps += key + ', ';
            }
        }
        console.log('geldige Applicaties zijn:', apps);


        let mods = '';
        for (let [key, value] of Object.entries(SESSION.session.validModules)) {
            if(value){
                mods += key + ', ';
            }
        }
        console.log('geldige Modules zijn:', mods);

        return `    <div class=" col-md float-left ">
            <a role="button" tabindex="0" class="procedureBtn" data-option-status="definitionMissing">
              Deze procedure heeft geen geldige opties, zie de log file voor meer informatie
            </a>
        </div>`;
    }

    function render(procedures) {
        let buttonsBar = renderSingleProcedure(procedures) || renderMultipleProcedures(procedures),
            placeHolder = SESSIONDOC.querySelector(".procedureMenu .row");

        if(!SESSION.session.hasValidProcedures){
            buttonsBar = renderInvalidProcedures();
        }

        placeHolder.innerHTML = buttonsBar;
        XDOM.addEventListenerToNode(".procedureBtnContainer", "mouseover", mouseover, placeHolder);
        MAIN.activateMenu(placeHolder);

        // Check tablet mode and hide
        if (SCOPE.mainDoc.body.classList.contains('tablet-mode')) {
            SESSIONDOC.querySelectorAll('.procedureMenu')[0].classList.add('tablet-hidden');
        }
    }


    function focusMenu() {
        if (SESSION.session.getDefaultPRC()) {
            return;
        }
        let item = SESSIONDOC.querySelector(".procedureMenu .row .procedureBtnContainer a");
        if(!item){
            return;
        }
        MAIN.focusMenu(item);
        item.setAttribute("data-initial-focus", "true");

    }

    function updateFromMain() {
        let procedureName = SESSION.stack.currentProcedure.PRC,
            subProcedureName = SESSION.stack.currentSubprocedure.SBP,
            procedure = SESSION.session.getProcedure(procedureName),
            suprocedurePlaceholder = document.getElementById("subProcedureMenu");

        suprocedurePlaceholder.innerHTML = subProcedureMenu.render(procedure.subProcedures);
        SubProcedureButton.activate(subProcedureName);
        activate(procedureName);
    }

    function activate(procedureName) {
        let procedureButton = document.querySelector(`[data-option-prc="${procedureName}"]`),
            buttons = document.querySelectorAll(`.procedureBtnContainer a[data-button-state="active"]`);
        activateOneButton(buttons, procedureButton);
    }


    this.left = left;
    this.right = right;
    this.load = load;
    this.render = render;
    this.activate = activate;
    this.click = click;
    this.keyup = keyup;
    this.hotkey = hotkey;
    this.down = down;
    this.mousedown = mousedown;
    this.updateFromMain = updateFromMain;
    this.focusMenu = focusMenu;
}).apply(ProcedureMenu);


