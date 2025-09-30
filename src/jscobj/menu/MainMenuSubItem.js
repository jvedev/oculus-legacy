var MainMenuSubItem = {};

(function () {
    async function click(ev) {
        let definition = {},
            ds = ev.invokeObject.dataset

        if (ds.optionTyp !== 'PGM') {
            return;
        }

        for (let key in ds) {
            if (key.indexOf('option') === 0) {
                definition[key.replace('option', '').toUpperCase()] = ds[key]
            }
        }
        definition.IDT = ds.optionIdt;
        colapseAllMenus();

        // Check for collapse in user settings
        if (SCOPE.main.Settings.get('AUTO_COLLAPSE_ENV_MENU')) {
            // Get the clicked menu
            let triggerMenu = XDOM.getParentByTagName(ev.invokeObject, 'imp-menu');

            if (triggerMenu) {
                // Add a hide class to the menu
                triggerMenu.classList.add('imp-menu-hide');

                // Remove element focus
                document.activeElement.blur();

                // Timeout to remove the hide class (timeout longer than animation delay)
                setTimeout(() => {
                    // Remove the class
                    triggerMenu.classList.remove('imp-menu-hide');
                }, 600);
            }
        }

        if (window.SCOPE.session &&
            window.SCOPE.session.SESSION &&
            window.SCOPE.session.SESSION.jobId) {
            // Hide all current modals in this session
            window.SCOPE.main.Dialogue.hideModalGroup([window.SCOPE.session.SESSION.jobId]);
        }

        const {clickPath, textPath} = getClickPath(ev.invokeObject);
        definition.clickPath = clickPath;
        definition.textPath = textPath;

        await NAV.Session.newSession(definition, 0);

        return true;
    }


    function getClickPath(obj) {
        let clickPath = [obj.dataset.index || obj.parentNode.dataset.index];
        let textPath = [obj.innerText];
        let parent = obj.parentNode;

        while (parent !== null) {
            parent = XDOM.getParentByAttribute(parent.parentNode, 'data-index');
            if (!parent) {
                return {clickPath, textPath: textPath.join(' » ')};
            }
            if (parent.classList.contains('mainMenuButton')) {
                textPath.unshift(parent.querySelector('span').innerText);
            } else {
                textPath.unshift(parent.querySelector('h3').innerText);
            }

            clickPath.unshift(parent.dataset.index);
        }

        return {clickPath:'', textPath:''};
    }

    this.click = click;

}).apply(MainMenuSubItem);

