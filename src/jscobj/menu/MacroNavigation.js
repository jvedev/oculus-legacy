var MacroNavigation = {};

(function () {
    function activate(ev){
        let obj = ev.invokeObject;
        // if(obj.dataset.buttonEnabled=="false"){
        //     return;
        // }
        XDOM.invokeClick(obj)
        ev.cancel();
    }
    function focus(obj){
        //is the object an actual button?
        if(!obj?.dataset?.eventClass) return false;
        //is the buttopn enabled

        if(obj.dataset.buttonEnabled=="false") return false;
        //we are all good so focus
        obj.focus();
        return true;
    }

    function down(obj){
        let next = obj.nextSibling;
        while(next){
            if(focus(next)){
                return true;
            }
            next = next.nextSibling;
        }
        return false;
    }

    function macroHelp(){
        Help.macro();
    }


    function up(obj){
        let next = obj.previousSibling;
        while(next){
            if(focus(next)){
                return;
            }
            next = next.previousSibling;
        }
    }

    function keyup(ev){
       
        switch(ev.keyCode){
            case keyCode.enter:
            case keyCode.space:
                activate(ev);

                break;
            case keyCode.arrowDown:
                down(ev.invokeObject);
                break;
            case keyCode.arrowUp:
                up(ev.invokeObject);
            default: 
                return false;   
       }
       return true;
    }

this.macroHelp = macroHelp;
this.keydown = keyup;
this.down = down;
}).apply( MacroNavigation);
