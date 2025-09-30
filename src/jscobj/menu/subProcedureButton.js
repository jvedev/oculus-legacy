var SubProcedureButton = {};
(function () {



    function left(item){
        let nr=parseInt(item.dataset.nr) -1,
            prevItem= document.querySelector(`.subProcedureBtn[data-nr="${nr}"]`);
        if(!prevItem){
            return;
        }
         MAIN.focusMenu(prevItem);
    }

    function right(item){
        let nr=parseInt(item.dataset.nr) +1,
        nextItem= document.querySelector(`.subProcedureBtn[data-nr="${nr}"]`);
        if(!nextItem){
            return;
        }
         MAIN.focusMenu(nextItem);
    }


    // function left(item){

    //     if(item && item.parentNode.previousElementSibling){
    //         MAIN.focusMenu(item.parentNode.previousElementSibling.querySelector('a'));
    //     }

    // }

    // function right(item){

    //     if(item && item.parentNode.nextElementSibling){
    //         MAIN.focusMenu(item.parentNode.nextElementSibling.querySelector('a'));
    //     }
    // }

    function down(item){
        if(!item.nextElementSibling){
            return;
        }
        MAIN.focusMenu(item.nextElementSibling);
    }

    function nextProcedure(item){
        MAIN.colapseAllMenus();
        ProcedureMenu.right(item.parentNode.parentNode.parentNode);
    }

    function prevProcedure(item){
        MAIN.colapseAllMenus();
        ProcedureMenu.left(item.parentNode.parentNode.parentNode);
    }

    function up(item){
        if(item.previousElementSibling){
            MAIN.focusMenu(item.previousElementSibling);
            return;
        }
        MAIN.colapseAllMenus();
        MAIN.focusMenu(item.parentNode.parentNode.parentNode);
    }

    function hotkey(kCode, item){
        if(item.dataset.fixed==="true"){
            switch(kCode){
                case keyCode.arrowRight:
                    right(item);
                    break;
                case keyCode.arrowLeft:
                    left(item);
                    break;
                case keyCode.space:
                case keyCode.enter:
                    open(item);
                    break
            }
            return;
        }
        switch(kCode){
            case keyCode.arrowUp:
                up(item);
                break;
            case keyCode.arrowRight:
                nextProcedure(item);
                break;
            case keyCode.arrowLeft:
                prevProcedure(item);
                break;
            case keyCode.arrowDown:
                down(item);
                break;
            case keyCode.enter:
            case keyCode.space:
                open(item);
                break
        }
    }
    function keyup(ev){
        let item = document.querySelector('[data-focus="true"][data-hotkey-handler]');
        if(item){
            let handlerClass = window[item.dataset.hotkeyHandler];
            if(handlerClass){
                handlerClass.hotkey(ev.event.keyCode, item)
            }
            return true;
        }
        return false;
    }
    function close(btn){
       // if(btn.dataset.fixed=="true"){return;}
        let procedureButton = XDOM.getParentByAttribute(btn, "data-open-subitems");
        MAIN.removeFocus(SESSIONDOC);
        if(!procedureButton){
            return;
        }
        procedureButton.setAttribute("data-open-subitems","false");
        procedureButton.querySelector("a").setAttribute("data-hover","false");
    }


    function open(btn){
        if(SESSION.submitInProgress) return;
        close(btn);

        let pocedureName = XDOM.Attributes2Def(btn).PRC,
          subProcedureName = XDOM.Attributes2Def(btn).SBP;
          activate(subProcedureName);
          SessionMenus.load(pocedureName,subProcedureName);
    }

    function click(ev){
        if(isActive(ev.invokeObject)){return;}
        if(ev.invokeObject.dataset.available ==="false"){
            SCOPE.main.Dialogue.alert(`Subprocedure : ${ev.invokeObject.title} ${getCapt('gSRV001')}`,getCapt('gSRV001'));
            return;
        }
        open(ev.invokeObject);
        return true;
    }

    function mousedown(){
        SESSION.session.cancelBlurEvent = true;
    }

    function activate(subProcedure){
        let  subProcedureButton1 = document.querySelector(`#subProcedureMenu [data-option-sbp="${subProcedure}"]`),
             subProcedureButton2 = document.querySelector(`#procedureMenu [data-option-sbp="${subProcedure}"]`),
             buttons1 = document.querySelectorAll('#subProcedureMenu [data-button-state], #procedureMenu [data-option-sbp]'),
             buttons2 = document.querySelectorAll('#procedureMenu [data-subprocedure-active]');

        if(subProcedureButton1){
            XDOM.setAttributesToNodeList(buttons1,"data-button-state", "inactive");
            subProcedureButton1.setAttribute("data-button-state", "active");

        }
        if(subProcedureButton2){
            XDOM.setAttributesToNodeList(buttons2,"data-subprocedure-active", "false");
            subProcedureButton2.setAttribute("data-subprocedure-active", "true");
        }
    }

    this.keyup = keyup;
    this.click = click;
    this.hotkey = hotkey;
    this.mousedown = mousedown;
    this.activate = activate;
}).apply( SubProcedureButton);
