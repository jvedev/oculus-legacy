var MainMenuButton = {};

(function () {
    function close(){
        colapseAllMenus();
    }
    function hotkey(kCode, item){

    }
    function render(def){
        let subMenu = new window.SCOPE.main.Menu(def);

        return subMenu.button;
    }

    this.render = render;
    this.close = close;
    this.hotKey = hotkey;
}).apply(MainMenuButton);
