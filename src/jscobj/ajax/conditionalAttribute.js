/* global ENUM, SESSION */

/**
 * Conditional attributes zijn attributen die een gedrag vertonen op basis van data buiten het eigenlijke veld
 * er zijn twee argumenten:
 * @param data-condition-attribute attribute die aangeeft wat er moet gebeuren op basis vcan het indicator veld Mogelijk waarde zijn:
 *  - *RIGHT
 *  - *CENTER
 *  - *HIDDEN
 *  - *PROTECT
 *  - *MSG     :  attention level
 *  - *INF     :  attention level
 *  - *ATN     :  attention level
 *  - *ALR     :  attention level
 *  - *ERR     :  attention level
 * @param data-condition-field-id  verwijzing naar een veld in het currentrecord.attributes deel van de json response van ajax
 * totdat we echt met ajax gaan werken komen indicators in de variabele : (SESSION.activeFrame.IdfJSON.header) die weer in SESSION.activePage.headerIndicators wordt gezet
 */

/**
 * object voor het vastleggen van Conditional Attribute's
 *
 * @returns {ConditionalAttribute}
 */

function ConditionalAttribute() {
}

/**
 * tijdelijke update actie later als ajaxi is geimplementeerd wordt dit rechtstreeks bij het zetten van de waarde in het object aangeroepen
 */
ConditionalAttribute.update = function () {

    var foPageObjects = XDOM.queryAllScope('[data-condition-attribute]');
    for (var i = 0, l = foPageObjects.length; i < l; i++) {
        ConditionalAttribute.apply(foPageObjects[i]);
    }
};


ConditionalAttribute.apply = function (obj) {
    let attribute = obj.getAttribute("data-condition-attribute");
    if (!attribute) {
        return;
    } //--> // MVB verplaatst

    let indicatorField = obj.getAttribute("data-condition-field-id");
    let envIndicatorField = obj.dataset.conditionEnvId;
    let recordNr = getClientRecordNr(obj);
    let indicator = null;
    if (envIndicatorField && SESSION.activeData.environmentConditions) {
        indicator = SESSION.activeData.environmentConditions[envIndicatorField];
    } else if (recordNr || recordNr === 0) {
        if (attribute === '*SEL') {
            indicator = SESSION.activeData.subfileData[recordNr][indicatorField];
        } else {
            indicator = SESSION.activeData.subfileAttributes[recordNr][indicatorField];
        }
    } else {
        indicator = SESSION.activeData.headerData[indicatorField];
    }

    //check if indicator field is present
    if (!hasValue(indicator)) {
        //we are missing an indicator field

        //test is we are in developerMode
        const developerMode = SCOPE.main.Settings.get('ENABLE_DEBUG_TOOLS');

        //not developer mode just leave
        if (!developerMode) return false

        //we are in developer mode so show a message
        SCOPE.main.Dialogue.alert('Het indicatorveld: "' + indicatorField + '" voor Conditional Attribute is niet gedefinieerd',`Conditional Attribute niet gedefinieerd`);
        return false;
    }

    ConditionalAttribute.set(obj, attribute, (indicator === '1' || indicator === 'true' ));
};

ConditionalAttribute.set = function (obj, attribute, set) {
    var parentObj = obj;

    if (getClientRecordNr(obj) != null) {
        parentObj = XDOM.getParentByTagName(obj, 'TD');
    }

    switch (attribute) {
        case "*RIGHT":
            if (set) {
                parentObj.style.textAlign = ENUM.align.right;
            } else {
                parentObj.style.textAlign = '';
            }
            break;
        case "*CENTER":
            if (set) {
                parentObj.style.textAlign = ENUM.align.center;
            } else {
                parentObj.style.textAlign = '';
            }
            break;
        case '*HIDDEN':
            if (set) {
                FieldAttribute.hide(obj);
                FieldAttribute.disable(obj);

            } else {
                FieldAttribute.unHide(obj);
                FieldAttribute.enable(obj);
            }
            break;
        case '*VISIBLE':
            if (set) {
                FieldAttribute.unHide(obj);
                FieldAttribute.enable(obj);
            } else {
                FieldAttribute.hide(obj);
                FieldAttribute.disable(obj);
            }
            break;
        case '*REQUIRED':
            if (set) {
                obj.setAttribute("data-required", "true");
            } else {
                obj.setAttribute("data-required", "unknown");
            }
            break;
        case '*PROTECT':
            if (set) {
                FieldAttribute.protect(obj);
            } else {
                FieldAttribute.unProtect(obj);
            }
            break;
        case '*MSG':
        case '*INF':
        case '*ATN':
        case '*ALR':
        case '*ERR':
        case '*SEL':
            if (set) {
                parentObj.setAttribute("data-attention-level", ENUM.attentionLevelToCode[attribute]);
            } else {
                parentObj.setAttribute("data-attention-level", null);
            }
            break;
    }
};