/**
 *
 */
class Admin {
     constructor(definition){
        definition.LGO = definition.LGO || 'userFiles/adminIcons/fallback_icon.png';
        this.mainItems = [];
        P.copyProperties(definition,this);
        this.init(definition);
    }

    init(definition){
        setHotkeys(definition.OPT,'DSC');
        for(let opt of definition.OPT){
            opt.IDT = this.IDT;
            this.add(opt);
        }
    }

    add(definition){
        this.mainItems.push(new MainMenuItem(definition));
    }
}

class AdministrationMenu {
    constructor(definition){
        this.administrations = [];
        this.links = [];
        this.init(definition);
    }

    init(definition){
        if(!definition.OPT){
            return;
        }
        for(let opt of definition.OPT){
            this.add(opt);
        }
    }

    add(definition){
        switch(definition.TYP){
            case 'LNK':
                definition.ICO = definition.ICO || "fa-link"
                this.links.push(definition);
                break;
            case 'MNU':
                this.administrations.push(new Admin(definition))
                break;
        }
    }
}

class MainMenuItem  {


    constructor(definition){
        definition.ICO = definition.ICO || 'fa-question-circle';
        P.copyProperties(definition,this);
        this.menuItems = [];
        this.init(definition);
    }

    init(definition){
        /*RKR VERWIJDEREN NA TEST 24052018*/ if(!definition.OPT){return;}
        for(let i =0, l = definition.OPT.length;i<l;i++ ){
            let opt = definition.OPT[i];
            opt.index = i;
            opt.IDT = this.IDT;
            this.add(opt);
        }
    }
    add(definition){
        this.menuItems.push(new MenuItem(definition));
    }
}

class MenuItem  {
     constructor(definition){
        this.menuItems = [];
        P.copyProperties(definition,this);
        this.init(definition);
    }

    init(definition){
        if(!definition.OPT){return;}
        for(let opt of definition.OPT ){
            opt.IDT = this.IDT;
            this.add(opt);
        }
    }

    add(definition){
        this.menuItems.push(new MenuItem(definition));
    }
}










