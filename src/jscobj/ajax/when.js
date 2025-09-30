/* global XDOM, SESSION */

function When() {
}

When.update = function (serviceDomObj, serviceResponse) {
    var foPageObjects = null;
    var foServiceResponse = serviceResponse;
    var obj = null,
        fsField = '',
        fsValue = '';
    if (serviceDomObj) {
        foPageObjects = XDOM.queryAllScope('[data-when-field]', serviceDomObj.domObject);
    } else {
        foPageObjects = XDOM.queryAllScope('[data-when-field]');
    }
    if (foPageObjects) {
        for (var i = 0, l = foPageObjects.length; i < l; i++) {
            obj = foPageObjects[i];
            fsField = obj.getAttribute('data-when-field');
            fsValue = obj.getAttribute('data-when-value');

            if (!SESSION.activeData.headerAttributes || !fsField) {
                return;
            }

            if (!serviceResponse) {
                if (fsField === 'MODEF' && fsValue === '*NOTADD') {
                    if (SESSION.activeData.headerData.MODEF === 'ADD') {
                        When.set(obj, 'unavailable');
                    } else {
                        When.set(obj, 'available');
                    }
                } else if (SESSION.activeData.headerAttributes[fsField] === fsValue) {
                    When.set(obj, 'available');
                } else {
                    When.set(obj, 'unavailable');
                }
            } else {
                if (foServiceResponse && foServiceResponse[fsField] != undefined) {
                    if (foServiceResponse[fsField] === fsValue) {
                        When.set(obj, 'available');
                    } else {
                        When.set(obj, 'unavailable');
                    }
                }
            }
        }
    }
};

When.set = function (obj, value) {
    if (!obj) {
        return;
    }
    if (obj.dataset.screenMode == '*SUBVIEW') {
        When.set(XDOM.getObject('p-' + obj.id), value);
        //obj.parentNode.parentNode.setAttribute('data-when', value);
    }

    obj.setAttribute('data-when', value);
    When.setHeader(obj, value);
    When.setLabel(obj, value);
};

When.setLabel = function (obj, value) {
    const label = XDOM.queryScope(`[for="${obj.id}"]`);
    if (!label) {
        return;
    }
    label.setAttribute('data-when', value)
}
When.setHeader = function (obj, value) {
    let thCell = null;



    if (!obj.getAttribute('data-to-axis')) {
        return;
    }
    const head = XDOM.getParentByTagName(obj, 'THEAD');
    if (!head) {
        return;
    }


    thCell = XDOM.getParentByTagName(obj, 'TH');
    let axis = thCell.getAttribute('data-axis');

    //determine how manu rows we have
   const totalRows = head.querySelectorAll('tr').length
    //can't do a while loop because collspan might make some ths cels disapear so just try it 10 times
    for(let row = 1; row <= totalRows ; row++){
        const nextAxis = axis.replace('R2', `R${row}`);
        const thCell = head.querySelector("[data-axis='" + nextAxis +"']");
        if(thCell){ //does this cel actualy exists (might not because of rowspan
            thCell.setAttribute('data-default-cursor', (value === 'unavailable'))
        }
    }



    //
    // axis = thCell1.getAttribute('data-axis').replace('R2', 'R1');
    // thCell2 = head.querySelector("[data-axis='" + axis + "']");
    // axis = thCell1.getAttribute('data-axis').replace('R2', 'R3');
    // thCell3 = head.querySelector("[data-axis='" + axis + "']");
    //
    //
    // if (value === 'unavailable') {
    //     if (thCell1) {
    //         thCell1.setAttribute('data-default-cursor', 'true');
    //     }
    //     if (thCell2) {
    //         thCell2.setAttribute('data-default-cursor', 'true');
    //     }
    //     if (thCell3) {
    //         thCell3.setAttribute('data-default-cursor', 'true');
    //     }
    // } else {
    //     if (thCell1) {
    //         thCell1.setAttribute('data-default-cursor', 'false');
    //     }
    //     if (thCell2) {
    //         thCell2.setAttribute('data-default-cursor', 'false');
    //     }
    //     if (thCell3) {
    //         thCell3.setAttribute('data-default-cursor', 'false');
    //     }
    // }
};
