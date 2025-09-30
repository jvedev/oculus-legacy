var subProcedureMenu = {};

(function () {
     function splitButtons(buttons){
        if(buttons.length % 2 === 1){
         buttons.push(template.procedure.dummy)
        }
        let setSize = buttons.length/2;
        return [buttons.slice(0,setSize).join(''),buttons.slice(setSize).join('')];
    }

     function render(subProcedures){

       let optionCount = subProcedures.length || 1,
           enableMaxWidth = false;

       if(optionCount < 8){
          enableMaxWidth = true;
        }

        let buttons = subProcedures.map(o=>template.subProcedure.fixedButton(enableMaxWidth, o));
        XDOM.getObject("navigationWrapper").setAttribute("data-hide-menu", "false");
        if(subProcedures.length > 8){
            buttons = splitButtons(buttons);
            return template.subProcedure.doubleRow(buttons);
        }
        if(subProcedures.length == 1){
            XDOM.getObject("navigationWrapper").setAttribute("data-hide-menu", "true");
            return "";
            //return template.subProcedure.title(subProcedures[0]) + template.subProcedure.fixedButton(subProcedures[0], true);
        }

        return template.subProcedure.singleRow(buttons.join(''));
    }


    function renderPullDown(subProcedures){
        if(subProcedures.length==1){
            return template.subProcedure.dropDownOneButton(subProcedures[0].option)
        }
        let buttons = subProcedures.map(template.subProcedure.dropDownButton).join('');
        return template.subProcedure.dropDown(buttons);
    }

    function toggleSubProcMenu(){
      let procedureMenuWrapper = XDOM.getObject("procedureMenu");
      if(procedureMenuWrapper){
         procedureMenuWrapper.setAttribute("data-submenu-visible", SCOPE.sessionDoc.getElementById("toggleSubprocedureMenu").checked);
      }
    }

    this.toggleSubProcMenu = toggleSubProcMenu;
    this.render = render;
    this.renderPullDown = renderPullDown;
}).apply( subProcedureMenu);

