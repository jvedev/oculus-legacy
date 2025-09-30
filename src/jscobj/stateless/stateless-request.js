/**
 * request object t.b.v. stateles requests
 * bouwt een request op op basis van het caler object
 *
 * @param {type} args argumentenin json format met de volgende waarde:
 *   callerObject : domObject uit het aanroepende scherm met bijbehorende info over dir request
 *   type : waarde uit ENUM.requestType dit bepaald of er data, html of allebij terug wordt geschreven
 *   onResponse: pointer naar javascript on response handler
 *
 * @returns {Stateless.request}
 */
Stateless.request = function (args) {
    this.type = '';
    this.onResponse = null;
    this.requestFieldsArray = null;
    this.recordNumber = null;
    this.sourceLocation = null;
    this.macroName = null;
    this.environmentConditions = null;
    this.calerId = '';
    this.requestCount = Stateless.request.requestCount++;
    this.page =null;
    this.uri = '';
    this.init(args);
};
Stateless.request.count = 0;

/**
 * initalisatie vanuit een caler Object in combinatie met een al bestaande page Object
 * vaak is dit een icoon in de aanroepende pagina
 * @param {HTMLElement} obj  B.V. icoon
 * @param {StateLess.Page} page pagina Object
 * @returns {void}
 */
Stateless.request.prototype.initExternal = function (obj, page) {
    this.initFromObject(obj);
};

Stateless.request.prototype.setType = function (type) {
    //do we need a panel definition
    //check if the definitions is allready there.
    const needsDefinition = !this.page?.data?.panelDef;

    // If we need a panel definition.
    // Or, when in debug mode we always need to have the definition and data
    if(needsDefinition || SESSION.session.debugMode){
        this.type = ENUM.requestType.all;
    }else{
        //We only need data
        this.type = ENUM.requestType.data;
    }


    this.data['CONFIG'] = this.type;
};
/**
 * initalisatie vanuit een caler Object vaak is dit een icoon in de aanroepende pagina
 * dit wordt gebruikt bij het openen van een Stateles page vanuit het aanroepende scherm
 * @param {HTMLElement} obj B.V. icoon
 * @returns {void}
 */
Stateless.request.prototype.initFromObject = function (obj) {
    const guiPage = XDOM.getEditWindow(obj);
    if (guiPage) {
        this.guidData = guiPage.data;
    }
    this.environmentConditions = obj.dataset.environmentConditions;
    this.requestPrefix = obj.getAttribute('data-parm-prefix') || '';
    this.recordNumber = obj.getAttribute('data-record-number');
    this.sourceLocation = obj.getAttribute('data-macro-location');
    this.macroName = obj.getAttribute('data-macro-name');
    this.calerId = obj.id;
    this.invoke = this?.page?.parentPage?.resubmit ? "*RELOAD": "*EXTERNAL";
    this.setType();

};

/**
 * static teler deze wordt gebruikt om response te matchen met de juiste call te matchen
 */
Stateless.request.requestCount = 0;

/**
 * initalisatie vanuit een al bestaande page Object
 * dit wordt gebruikt bij het submitten van een Stateless.Page object
 * @param {StateLess.Page} page pagina Object
 * @returns {void}
 */
Stateless.request.prototype.initFromPage = function (page) {
    this.invoke = '*INTERNAL';
    this.setType()
    this.environmentConditions = page.environmentConditions;
    this.sourceLocation = page.sourceLocation;
    this.macroName = page.macroName;
    this.calerId = page.id;
    this.onResponse = page.onResponse;
    SESSION.submitFromScope = page.id;
};

/**
 * basis initialisatie
 * @param {type} args javascript object in json format mogelijke members zijn:
 * callerObject en of page hierbij is
 * callerObject een domObject B.V.  een icoon uit de aanroepende pagina
 * page is een al eerder geinstatieerd StateLess.Page Object
 * @returns {undefined}
 */
Stateless.request.prototype.init = function (args) {
    this.data = new Stateless.FormData();
    this.page = args.page;
    if (args.callerObject && args.page) {
        this.initExternal(args.callerObject, args.page);
        this.onResponse = args.onResponse;
        this.prepare();
        return;
    }

    if (args.callerObject) {
        this.initFromObject(args.callerObject);
        this.type = args.type;
        this.onResponse = args.onResponse;
    }
    if (args.page) {
        this.initFromPage(args.page);
    }
    this.prepare();
};

/**
 * factory functie die Stateless.request initialiseerd
 * en vervolgens een get request uitvoert
 * @param {type} args
 * @returns {Promise<void>}
 */
Stateless.request.get = function (args) {
    const request = new Stateless.request(args);
    return request.get();
};


Stateless.request.prototype.setRequestFieldsArray = function (obj) {
    this.requestFieldsArray = [];
    const requestObject = obj?obj:XDOM.getObject(this.calerId);//this.page.id
    if(!requestObject) return this.requestFieldsArray;
    const json =  requestObject.getAttribute('data-parm-object').replace(/'/g, '"')
    if(!json) return this.requestFieldsArray;
    this.requestFieldsArray =  JSON.parse(json);
    return this.requestFieldsArray;
}

/**
 * hulpfunctie die op basis van het caler argument een aanroep doet
 * via het caler object worden aanroepende velden etc doorgegeven
 * @returns {String}
 */
Stateless.request.prototype.getParamFromCaler = function () {
    let fieldObj = null,
        value = '',
        location = null,
        constValue = null,
        recordNr = 0,
        fieldObjName = '',
        headerData = this.guidData || this.page?.parentPage?.data?.headerData || SESSION.activeData.headerData,
        subfileData = SESSION.activeData.subfileData;

    const requestFieldsArray = this.setRequestFieldsArray();

    this.data.append('PRMLEN', requestFieldsArray?.length ||'0');



    if (this.recordNumber) {
        recordNr = parseInt(this.recordNumber) - 1;
    }
    for (var i = 0; i < requestFieldsArray.length; i++) {
        fieldObjName = this.requestPrefix + requestFieldsArray[i].field;
        location = requestFieldsArray[i].location;
        fieldObj = XDOM.getObject(fieldObjName,SCOPE.pageDoc);
        value = '';
        if (!fieldObj || (fieldObj && fieldObj.tagName !== 'INPUT')) {
            switch (location) {
                case 'headerData':
                    value = headerData[requestFieldsArray[i].field];
                    break;
                case 'subfileData':
                    if (recordNr >= 0) {
                        fieldObj = XDOM.getObject(fieldObjName + '_' + this.recordNumber,SCOPE.pageDoc);
                        if (!fieldObj || (fieldObj && fieldObj.tagName !== 'INPUT')) {
                            value = subfileData[recordNr][requestFieldsArray[i].field];
                        }
                    }
                    break;
                default:
                    if (!fieldObj) {
                        break;
                    }
                    constValue = fieldObj.getAttribute('data-const-value');
                    if (constValue) {
                        value = constValue;
                    }
                    break;
            }
        }

        if (!fieldObj) {
            fieldObj = XDOM.getObject('trigger_' + fieldObjName, SCOPE.pageDoc);
        }

        if (fieldObj) {
            if (Validate.test(fieldObj)) {
                value = XDOM.getObjectValue(fieldObj);
            } else {
                return 'invalid';
            }
        }
        if(!value){
            value= "";
        }
        this.data.append('PRM' + (i + 1), value);
    }
};

/**
 * parameters die altijd bij elke request nodig zijn
 * worden toegevoegd aan het custom Stateless.formData object
 * deze waarden worden gebruikt bij het submitten van een stateless pagina (al dan niet via een get of post)
 * @returns {undefined}
 */
Stateless.request.prototype.setDefaultDataValues = function () {
    var resubmitConstants = {};
    var resubmitVariables = {};
    if (this.page) {
        resubmitConstants = this.page.resubmitConstants || {};
        resubmitVariables = this.page.data.resubmitVariables || {};
    }
    this.appendOnce('PFMSOMTD', PFMBOX.PFMSOMTD);
    this.appendOnce('PFMFILID', PFMBOX.sPFMFILID);
    this.appendOnce('USRID', PFMBOX.PFMRMTUS);
    this.appendOnce('AUTHTOKEN', SESSION.AUTHTOKEN);
    this.appendOnce('CONFIG', this.type);
    this.appendOnce('INVOKE', this.invoke);
    this.appendOnce('requestCount', Stateless.request.count++);

    if (this.environmentConditions) {
        this.data.append('EnvConditions', this.environmentConditions);
    }

    if (this.invoke === '*EXTERNAL') {
        this.getParamFromCaler();
    }
    for (var field in resubmitConstants) {
        this.data.append(field, resubmitConstants[field]);
    }
    for (var field in resubmitVariables) {
        this.data.append(field, resubmitVariables[field]);
    }
};

/**
 * appends field if it is  not already  defined  in the url
 * @param name
 * @param value
 */
Stateless.request.prototype.appendOnce = function (name, value) {
    //does uri includes the field?
    if (this.uri.includes(`?${name}=`) || this.uri.includes(`&${name}=`)) {
        return;
    }
    this.data.append(name, value);
}


/**
 * voorberijden dit object voor het maken van een van een XMLHttpRequest
 * de basis url en basis waarden worden ingesteld en de eventlistners geregistreerd
 * @returns {void}
 */
Stateless.request.prototype.prepare = function () {
    this.XMLHttpRequest = new XMLHttpRequest();
    this.uri = '/ndscgi/' + this.sourceLocation + '/ndmctl/' + this.macroName + '.ndm/MAIN';
    this.uri += `?PFMSOMTD=${PFMBOX.PFMSOMTD}`;
    this.uri += `&PFMFILID=${PFMBOX.sPFMFILID}`;
    this.uri += `&USRID=${PFMBOX.PFMRMTUS}`;
    this.uri += `&AUTHTOKEN=${SESSION.AUTHTOKEN}`;

    this.XMLHttpRequest.addEventListener('load', Stateless.request.responseHandler);
    this.XMLHttpRequest.requestObject = this;

    this.setDefaultDataValues();
};

/**
 * maakt een post en wordt gebruikt vanuit Stateless.Page
 * op dit moment wordt post op de server nog niet ondersteund
 * inplaats daarvan wordt get aangeroepen
 * @returns {void}
 */
Stateless.request.prototype.post = function () {
    this.getParamFromCaler();
    if (!minVersion('*8A')) {
        this.get();
        return;
    }
    this.XMLHttpRequest.open("post", this.uri, true);
    this.XMLHttpRequest.send(this.data.formData);
};

/**
 * maakt een get request
 * @returns {void}
 */

Stateless.request.prototype.get = async function () {
    if(this.page && this.invoke == "*RELOAD"){
        this.getParamFromCaler();
        this.page.setFormData(this)
    }
    this.uri += '&' + this.data.queryString();

    if (this.page && this.uri.length > 7000) {
        this.page.toggelProtected(false);
        this.page.setMessage('veel te lang ', 'error');
        return;
    }


    const text =  await fetch(this.uri).then(response => response.text());
    return this.fetchResponseHandler(text);

};

/**
 * Afhandeling van de response en roept de functiepointer
 * onResponse aan
 * @param {native response} response
 * @returns {Promise<void>}
 */
Stateless.request.prototype.fetchResponseHandler = function (response) {
    //resolve the response
    const result = AJAX.resolveResponse(response);
    //get macro properties
    const macroProperties = result.data.macroProperties;

    //create callback function bind to this so when it is called this wil still be an instance of Stateless.request
    const callBack = function () {
            this.onResponse(this);
        }.bind(this);


    //set the data
    this.data = result.data;
    if (result.pageDef) {
        this.html = result.pageDef;

        if (macroProperties.viewDataUri) {
            //this wil return a promise when the scriptag onload and the callback was fired
            return AJAX.Page.loadScriptTagPromised(macroProperties.viewDataUri, callBack);
        }
    }
    //no page def just call the callBack
    callBack()

    //resolve the promise
    return Promise.resolve();
};

/**
 * Afhandeling van de response en roept de functiepointer
 * onResponse aan
 * @param {native response} response
 * @returns {void}
 */
Stateless.request.responseHandler = function (response) {
    var result = AJAX.resolveResponse(response),
        macroProperties = result.data.macroProperties,
        statelessCaller = this,
        callBack = function () {
            statelessCaller.requestObject.onResponse(statelessCaller.requestObject);
        };
    this.requestObject.data = result.data;
    if (result.pageDef) {
        this.html = result.pageDef;

        if (macroProperties.viewDataUri) {
            AJAX.Page.loadScriptTag(macroProperties.viewDataUri, callBack);
            return;
        }
    }
    callBack();
    //this.requestObject.onResponse(this.requestObject);
};
