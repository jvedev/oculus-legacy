var ContextMenu = {};
(function() {
  let contextItem = null,
    menuItems = null,
    menu = null,
    onCloseHandler = null;

  enabled = true;
  /**
   * opens context menu
   * @param {PTHEvent} ev
   */
  function open(ev, Items, onOpen, onClose) {
    if (!enabled || Items.length == 0) {
      return;
    }

    onCloseHandler = onClose;
    menuItems = Items;
    contextItem = ev.invokeObject;
    menu = SCOPE.mainDoc.querySelector('[data-component="context-menu"]');
    menu.innerHTML = `<ul> ${menuItems.map(renderItem).join('')} </ul>`;
    menu.style.display = 'block';
    menu.style.left = `${ev.event.pageX}px`;
    menu.style.top = `${ev.event.pageY}px`;
    ev.event.preventDefault();
    if (onOpen) {
      onOpen(ev);
    }}

  function renderItem(item, index) {
    return `<li data-event-class="ContextMenu" data-index="${index}">
                  ${item.caption}
              </li>`;
  }

  function click(ev) {
    const menuItem = ev.invokeObject,
      index = menuItem.dataset.index;

    if (menuItems[index]) {
      menuItems[index].handler(contextItem);
    }

    close();
  }

  function close() {
    if (menu) {
      menu.style.display = 'none';
    }
    if (onCloseHandler) {
      onCloseHandler();
    }
    contextItem = null;
    menu = null;
    onCloseHandler = null;
  }

  function clickOutside(e) {
    if (e.target.dataset.eventClass != 'ContextMenu') {
      close();
    }
  }

  function toggleContextMenu(ev) {
    enabled = !enabled;
    const icon1 = SCOPE.mainDoc.querySelector('#contextBtn i'),
      icon2 = SCOPE.mainDoc.querySelector('#disableContext i') || icon1;
    if (enabled) {
      icon1.style.setProperty('color', '', '');
      icon2.style.setProperty('color', '', '');
    } else {
      icon1.style.setProperty('color', 'red', 'important');
      icon2.style.setProperty('color', 'red', 'important');
    }
  }

  this.clickOutside = clickOutside;
  this.click = click;
  this.open = open;
  this.toggleContextMenu = toggleContextMenu;
}.apply(ContextMenu));
