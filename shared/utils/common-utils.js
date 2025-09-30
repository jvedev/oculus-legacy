/**
 * bepaald of het element focus kan hebben
 **/
export function canHaveFocus(obj) {
    if (obj && obj.tagName == "INPUT" && (isIn(obj.type, ["text", "password", "button"]))) {
        return true;
    }
    return false;
}

/**
 * verkrijgt record nummer zoals gedefinieerd in het attribute data-record-number -1
 * data-record-number is een server side record dat wil zeggen 1 based client side is het 0 based
 * @param obj
 */
export function getRecordNumber(obj) {
    var nr = obj.getAttribute("data-record-number");
    if (nr) {
        return parseInt(nr);
    }
    return null;
}

export function addInputField(name, value) {
    var input = XDOM.getObject(name);
    if (input) {
        input.value = value;
        return;
    }

    input = XDOM.createElement('input', name);
    input.setAttribute('name', name);
    input.setAttribute('type', 'hidden');
    input.value = value;
    SESSION.activeForm.appendChild(input);
    return;
}

var useTimer = false;

export function time(label) {
    if (useTimer) {
        console.time(label);
    }
}

export function timeEnd(label) {
    if (useTimer) {
        console.timeEnd(label);
    }
}

export function scrollIntoView(oElement, oContainer) {
    var containerTopPos = oContainer.scrollTop;
    var containerBottomPos = (containerTopPos + oContainer.clientHeight);
    var selectedRowTopPos = oElement.offsetTop;
    var selectedRowBottomPos = (selectedRowTopPos + oElement.clientHeight);

    if (selectedRowTopPos < containerTopPos) {
        oContainer.scrollTop = selectedRowTopPos;
    } else if (selectedRowBottomPos > containerBottomPos) {
        oContainer.scrollTop = (selectedRowBottomPos - oContainer.clientHeight);
    }

    return;
}

export function activateOneButton(setInactive, setActive) {
    XDOM.setAttributesToNodeList(setInactive, "data-button-state", "inactive");
    setActive.setAttribute("data-button-state", "active");
}

export function isActive(obj) {
    return (obj.dataset.buttonState == "active" || obj.parentNode.dataset.buttonState == "active");
}