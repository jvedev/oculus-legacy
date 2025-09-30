/* events */
/* Load Timestamp 13:57:33.257 */
/* global XDOM, GLOBAL, keyCode */

export class Events {
    static register(p = window) {
        p.addEventListener('click', Events.handleClick);
        p.addEventListener('contextmenu', Events.contextmenu);
        p.addEventListener('mousedown', Events.handleAllEvents);
        p.addEventListener('mouseup', Events.handleAllEvents);
        p.addEventListener('keyup', Events.handleKeyUp);
        p.addEventListener('keydown', Events.handleKeydown);
        p.addEventListener('mouseenter', Events.handleAllEvents);
    }

    static contextmenu(e) {
        if (e.altKey) {
            return false;
        }

        if (SCOPE.main.ctx) {
            SCOPE.mainDoc.dispatchEvent(SCOPE.main.ctx.menu.closeCtx);
        }

        return Events.handleAllEvents(e);
    }
    static handleClick(e) {
        if (e.button === 2) {
            return false;
        } //firefoxbug

        if (SCOPE.main.ctx) {
            SCOPE.mainDoc.dispatchEvent(SCOPE.main.ctx.menu.closeCtx);
        }
        return Events.handleAllEvents(e);
    }

    static handleKeyUp(e) {
        return Events.handleAllEvents(e);
    }

    static handleKeydown(e) {
        return Events.handleAllEvents(e);
    }

    static handleAllEvents(e) {
        let event = Events.set(e);
        if (SCOPE.main.keyNav.edgeBugBlokkerHandler(e)) {
            return true;
        }
        if (event.handle()) {
            Events.stop(e);
            return true;
        }
        return false;
    }

    static set(e) {
        if (e) {
            GLOBAL.event = new Events(e);
        }
        return GLOBAL.event;
    }

    static stop(e) {
        //let event = Events.set(e);
        e.stopPropagation();
    }

    static cancel(e) {
        let event = Events.set(e);
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    cancel() {
        this.event.preventDefault();
        this.event.cancelBubble = true;
        this.event.stopImmediatePropagation();
    }

    constructor(e) {
        this.event = e;
        this.keyCode = e.keyCode;
        this.altKey = e.altKey;
        this.source = e.target;
        this.type = e.type;
    }

    static debugHelp(e) {
        let id = e.source.id;
        //  let ds = e.source.dataset;
        let type = e.event.type;
        // let code = e.keyCode;
        // let hotkeyHandler = ds.hotkeyHandler;
        switch (type) {
            case 'mousedown':
                id = id;
                break;
            case 'keyup':
                id = id;
                break;
            case 'keydown':
                id = id;
                break;
            case 'mouseenter':
                id = id;
                break;
        }
    }

    static getHandler(className, handler) {
        if (window[className] && window[className][handler]) {
            return window[className][handler];
        }
    }

    handle() {
        let className = 'AdminMenu',
            eventType = this.event.type,
            action = '';
        Events.debugHelp(this);

        this.invokeObject = XDOM.getParentByAttribute(this.source, 'data-event-class');
        if (this.invokeObject) {
            className = this.invokeObject.dataset.eventClass;
            eventType = this.invokeObject.getAttribute('data-' + this.event.type) || this.event.type;
            if(className=='none'){
                return true;
            }
        }

        if (MAIN.keyNav.handle(this)) {
            return true;
        }
        if (window[className] && window[className][eventType]) {
            window[className][eventType](this);
            return false;
        }
        if (window['handle' + eventType]) {
            window['handle' + eventType](this.event); //oude event handlers
            return true;
        }
        if(eventType==='print'){
            return;
        }
        if (window[eventType] && typeof window[eventType]=='function') {
            window[eventType](this);
            return true;
        }
    }
}