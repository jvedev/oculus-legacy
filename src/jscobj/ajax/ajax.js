/* global SESSION */

var AJAX = function () {
};

AJAX.loadMacro = function (macro) {
    if (SESSION.activePage) {
        closeAllModalObjects();
    }
    SESSION.submitFromScope = 'MAIN';
    var url = macro.url + '&TIMESTAMP=' + new Date().getTime();
    AJAX.get(url, AJAX.handleResponse);
};


AJAX.get = function (url, onResponse) {
    time('get');
    time('get (totaal)');
    var request = new XMLHttpRequest();
    request.addEventListener('load', onResponse);
    request.open("GET", url, true);
    request.send();
};
AJAX.getForm = function () {
    var formObjects = SESSION.activeForm.querySelectorAll("input:not([type='button']),textarea"),
        fd = new FormData(),
        obj = null,
        objVal = "";

    for (var i = 0, l = formObjects.length; i < l; i++) {
        obj = formObjects[i];
        objVal = "";
        if (obj.type === "file") {
            if (obj.files[0]) {

                objVal = obj.files[0];
            }
            fd.append(obj.name, objVal);
        } else {

            if (XDOM.getBooleanAttribute(obj, "data-unicode")) {
                objVal = XDOM.hexEncode(obj.value);
            } else if (obj.getAttribute("data-datatype") == "*MEMO") {
                objVal = XDOM.rightTrim(obj.value); //strip  all enters and spaces from the end of the string.
            } else {
                objVal = obj.value;
            }

            fd.append(obj.name, objVal);
        }
    }
    for (var field in SESSION.activePage.controlerFields) {
        if (SESSION.activePage.controlerFields[field]) {
            fd.append(field, SESSION.activePage.controlerFields[field]);
        }
    }

    return fd;
};

AJAX.postPartialUpdate = () => {
    let url = SESSION.activePage.pageUrl.split('?')[0];
    url += "?AUTHTOKEN=" + SESSION.AUTHTOKEN
    const request = new XMLHttpRequest();
    request.addEventListener('load', AJAX.handlePartialUpdate);
    request.open("POST", url, true);
    request.send(AJAX.getForm());
}

AJAX.handlePartialUpdate = response => {
    // let responseResult = AJAX.resolveResponse(response);
    const responseText = response.target ? response.target.responseText : response;
    const parser = new DOMParser();
    const doc = parser.parseFromString(responseText, "application/xml");

    //data will come in as overide data
    const overrideDataTag  = doc.getElementsByTagName("overrideData")[0];
    if(!overrideDataTag){
        return;
    }
    //get cdata section of tag
    let data = overrideDataTag.firstChild.data;

    //getting the right stuff out
    const {overrideData} = JSON.parse(data);

    // removing submit for select to prevent from being set by other submits
    XDOM.removeInput('SubmitForSelect')
    SESSION.activePage.partialUpDate(overrideData);
}






AJAX.postForm = function () {
    time('post (totaal)');
    time('post');
    let url = SESSION.activePage.pageUrl.split('?')[0];
    url += "?AUTHTOKEN=" + SESSION.AUTHTOKEN;
    SESSION.activePage.controlerFields["RequirePageDef"] =SESSION.session.debugMode

    const request = new XMLHttpRequest();
    request.addEventListener('load', AJAX.handleResponse);
    request.open("POST", url, true);
    request.send(AJAX.getForm());
};

AJAX.resolveResponse = function (response) {
    var xmlDoc = null,
        ipmfAction = '',
        json = '',
        pageDef = '',
        Tag = null,
        errorCallStack = null,
        errorMessage = '',
        data = null,
        result = {},
        responseText = response.target ? response.target.responseText : response;


    try {
        xmlDoc = XDOM.getXML(responseText);
        if (xmlDoc.getElementsByTagName("action")[0]) {
            ipmfAction = xmlDoc.getElementsByTagName("action")[0].childNodes[0].nodeValue;
            if (ipmfAction && (ipmfAction == "IPMF_Update")) {
                AJAX.Page.updateAfterIpmfSubmit();
                return;
            }
        }

        json = xmlDoc.getElementsByTagName("data")[0].childNodes[0].nodeValue;
        pageDef = xmlDoc.getElementsByTagName("pageDef")[0];
        Tag = xmlDoc.getElementsByTagName("errorMessage")[0];
        if (Tag) {
            errorMessage = Tag.childNodes[0].nodeValue;
            Tag = xmlDoc.getElementsByTagName("errorCallStack")[0];
            if (Tag) {
                errorCallStack = Tag.childNodes[0].nodeValue;
            }
        }
    } catch (e) {
        console.log(responseText);
        SCOPE.main.Dialogue.alert('net.data of xml format fout zie logfile van browser');
        return;
    }
    try {
        data = JSON.parse(json);
    } catch (e) {
        console.log(json);
        SCOPE.main.Dialogue.alert('json format fout zie logfile van browser');
        return;
    }

    if(data.overrideData){
        // Or, using array extras
        Object.entries(data.overrideData).forEach(([name, value]) => {
            data.headerData[name] = value
        });
    }


    if (data.viewProperties && data.viewProperties.netDataError) {
        SCOPE.main.Dialogue.alert(data.viewProperties.netDataError);
        if (pageDef) {
            console.clear();
            console.log(pageDef.textContent);
        }
    }
    if (errorMessage) {
        SCOPE.main.Dialogue.alert('er is een net data error opgetreden op de server \n zie logfile van browser');
        console.clear();
        console.log(errorMessage);
        console.log(errorCallStack);
    }
    result.data = data;
    if (pageDef) {
        result.pageDef = pageDef.textContent;
    }
    return result;
};

AJAX.getActivePage = function (data) {
    if (!data.macroProperties) {
        //no changes were made so set the the apropriate flag
        SESSION.activePage.resubmit = true;
        return;
    }
    SESSION.activePage = SESSION.pageStore[data.macroProperties.cacheKey];

    //we changed page so this was not submited from it self
    if(SESSION.activePage){
        SESSION.activePage.resubmit = false;
    }

};


AJAX.handleResponse = function (response) {
    var responseResult = null;
    responseResult = AJAX.resolveResponse(response);

    if (!responseResult) {
        return; //==>
    }

    AJAX.getActivePage(responseResult.data);
    if (SESSION.activePage) {    //pagina is ooit eerder in deze sessie opgeroepen of is de huidige pagina
        timeEnd('AJAX.handleResponse (script)');
        SESSION.activePage.reNew(responseResult);
    } else {//pagina nog niet bekend ga het render traject in
        AJAX.Page.newPage(responseResult.pageDef, responseResult.data);
    }
};
/**
 * Onload op script tag dat het laden van taal afhankelijke onderdelen zoals captions en serversources regeld
 * pas nadat deze is geladen is alles voor de pagina binnen en kan er verder worden gegaan met de onload procedure
 * @returns {undefined}
 */
AJAX.onload = function () {
    timeEnd('load text script (server)');
    timeEnd('AJAX.handleResponse (script)');
    SESSION.activeForm = SESSION.activeFrame.document.forms[0];

    SESSION.activeFrame.document.body.setAttribute("data-session-id", SESSION.id);



    showFrame(SESSION.activePage.screenType);

    SESSION.activePage.prepareDom();
    SESSION.activePage.autoRenewDom();

    // Ensure that the SESSIONFRAME has the right theme classes - TODO: @JVE is this ok?
    SESSIONFRAME.frameElement.contentDocument.body.classList.add(mainState().state.skinMode.value);
};

//   AJAX.fetchPost =function(url = ``, data = {}) {
//   // Default options are marked with *
//     return fetch(url, {
//         method: "POST", // *GET, POST, PUT, DELETE, etc.
//         mode: "cors", // no-cors, cors, *same-origin
//         cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
//         credentials: "same-origin", // include, *same-origin, omit
//         headers: {
//             "Content-Type": "application/json",
//             // "Content-Type": "application/x-www-form-urlencoded",
//         },
//         redirect: "follow", // manual, *follow, error
//         referrer: "no-referrer", // no-referrer, *client
//         body: JSON.stringify(data), // body data type must match "Content-Type" header
//     })
//     .then(response => response.json()); // parses response to JSON
// }