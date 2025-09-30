var MacroTab = {};
(function () {

    function load(item){
        XDOM.invokeClick(item);        
    }

    function left(item){

        if(item.previousElementSibling){
            focus(item.previousElementSibling);
        }
    }
     
    function right(item){
        if(item.nextElementSibling){
            focus(item.nextElementSibling);
        }
    }

    function focus(item){
        MAIN.focusMenu(item);
    }

    function hotkey(kCode, item){
        switch(kCode){
            case keyCode.arrowRight:
                right(item);
                break;
            case keyCode.arrowLeft:
                left(item);
                break;
            case keyCode.enter:
            case keyCode.space:
                load(item);
                break;
        }
    }

    function keyup(ev){
        let item = PAGEDOC.querySelector('[data-focus="true"][data-hotkey-handler]');
        return hotkey(ev.event.keyCode, item);
    }

    function hotkeyDown(kCode, item){
        if(kCode== keyCode.enter){
               load(item);
            return true
        }

    }
    function click(ev){
        if(ev.invokeObject.tagName == "BODY" || isActive(ev.invokeObject)){
            return;
        }
        let macroName =  XDOM.Attributes2Def(ev.invokeObject).MCR,
            macro = SESSION.stack.currentSubprocedure.getMacro(macroName);
        if(SESSION.submitInProgress){
            //er is al een submit het laden van de nieuwe macro wordt uitgesteld tot na de onload
            SESSION.NextMacroId = macroName;
            return;
        }
        SESSION.NextMacroId = null;
        Subfile.storeSubfilePos();  
        SESSION.stack.clearHistory(SESSION.stack.currentSubprocedure);
        macro.load();
        return true;
    }


    function mousedown(){
        SESSION.session.cancelBlurEvent = true;
    }


    function render(options){
        
        let placeholder = XDOM.getObject('TABDIV'),
            macros = options.map(template.macro.tab).join('');
  
        placeholder.innerHTML = template.macro.singleRow(macros);   
        activate()
    }

     function focusMenu(){
         MAIN.focusMenu(SESSIONDOC.querySelector(".procedureMenu .row .macroTabContainer"));
         SESSIONDOC.getElementsByTagName("a")[0].focus();
     }

    function updateFromMain(){
        activate();
    }

    function activate(macroName= SESSION.stack.currentMacro.MCR){
        let macroTab = PAGEDOC.querySelector(`a[data-option-mcr="${macroName}"]`),
            buttons = PAGEDOC.querySelectorAll(`.macroTabContainer a[data-button-state="active"]`);
        if(!macroTab) {
            return;
        }  
        activateOneButton(buttons, macroTab);
    }
    
    this.load = load;
    this.render = render;
    this.activate = activate;
    this.click = click;
    this.keyup = keyup;
    this.hotkey = hotkey;
    this.hotkeyDown = hotkeyDown;
    this.mousedown = mousedown;
    this.updateFromMain = updateFromMain;
    this.focusMenu = focusMenu;
}).apply( MacroTab);

