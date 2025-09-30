/* global advAJAX, OCULUS, PFMBOX, gErrorLink, MESSAGES, SESSION, XDOM, GLOBAL, self, BrowserDetect */

/**
 * object voor het vastleggen van file Links
 * @returns
 */

const Preference = {
    default: '*CONF',
    linkViewer: '*LNKVIEW',
    system: '*SYS'
};

const Link = {};
(function () {
    let uri = '',
        uriType = '',
        aliasField = '',
        extention = '',
        protocol = '',
        isFixed = false,
        aliasType = '',
        callerId = '';

    /**
     * initialises this
     * @param {HTMLElement} objIn
     */
    function init(obj = GLOBAL.eventSourceElement) {
        if (!obj) {
            return false;
        }

        const ds = obj.dataset;

        uri = (ds.uri || '').trim();
        uriType = ds.urlType;
        openPreference = ds.linkOpenPreference || Preference.default;
        protocol = ds.protocol || '';
        extention = ds.extension || '';
        isFixed = ds.viewType == '*FIXED';
        aliasType = ds.aliasType || ds.viewType;

        if (openPreference == Preference.default) {
            openPreference = SCOPE.main.Settings.get('URL_OPEN_PREFERENCE');
        }
        callerId = obj.id;
        return true;
    }

    /**
     * finds the alias
     * @param {HTMLElement} obj
     * @returns {String} alias
     */
    function getAlias(obj, sfl) {
        if (obj.dataset.fixedAlias) {
            return obj.dataset.fixedAlias;
        }

        let aliasField = obj.dataset.aliasField,
            data = SESSION.activeData.headerAttributes;
        const recordNr = obj.getAttribute('data-record-number');
        if (recordNr) {
            if (sfl && sfl.attributes) {
                return sfl.attributes[sfl.index][aliasField] || "";
            }

            if (SESSION.activePage.subfile && SESSION.activePage.subfile.attributes) {
                data = SESSION.activePage.subfile.attributes[serverToScript(recordNr)];
            } else {
                return '';
            }
        }
        return data[aliasField] || '';
    }

    /**
     * sets the alias depending on the aliastype
     * @param {HTMLElement} obj
     * @param {String} value
     * @param {object} data
     */
    function setAlias(obj, value, data = null) {
        let alias = getAlias(obj, data) || "";
        //is an alias applicable?

        extention = alias.toUpperCase();
        obj.dataset.extension = extention;
        switch (aliasType) {
            case '*LBL': //'*LBL':
                alias = getCaption(obj.dataset.aliasField);
                obj.innerHTML = alias;
                break;
            case '*VAR':
                obj.innerHTML = alias;
                break;
            case '*IMG':
                obj.setAttribute('data-icon', alias.toUpperCase()); //niet via dataset i.v.m. css
                break;
            case '*FIXED':
                break;
            default:
                obj.innerHTML = value;
                break;
        }
    }

    /**
     * voor het zetten van link objecten
     * @param obj
     * @param value
     */
    function setObjValue(obj, valueIN, data) {

        let value = (valueIN || '').trim();

        if (!init(obj)) {
            return;
        }

        if (value == '') {
            obj.classList.add('hidden');
        } else {
            obj.classList.remove('hidden');
        }

        setAlias(obj, value, data);

        if (protocol == '*HTTP' && value.indexOf('://') === -1) {
            value = 'http://' + value;
        }

        obj.dataset.uri = value;
        obj.href = 'javascript:void(0)';
        obj.dataset.clickAction = 'Link.handleOnClick';
        if (!value) {
            if (uriType === '*HashedUrl' && !isFixed) {
                obj.dataset.icon = '';
                obj.href = '';
            }
        }

        if (protocol == '*MAIL') {
            obj.href = 'mailto:' + value;
            obj.dataset.clickAction = '';
            //obj.innerHTML = value;
        }
        uri = value;
        setEmbeddedLinkViewerValue(obj);
    }

    function setEmbeddedLinkViewerValue(obj) {
        if (!isFixed) {
            return;
        }
        if (uriType === '*HashedUrl' && uri) {
            getHashedUri(obj);
            return;
        }
        openLink();
    }

    /**
     * default page update handler
     */
    function update(url) {
        openAutoLink();
        openGeneratedExcel(url);
    }

    /**
     * opens autolinks
     */
    function openAutoLink() {
        const a = XDOM.query('[data-activate-link="*AUTO"]:not([href=""]):not([href="javascript:void(0)"])');
        if (a) {
            XDOM.invokeClick(a);
        }
    }

    /**
     * opens file
     * @param {HTMLElement} obj
     */
    function open(obj) {
        if (!init(obj)) {
            return;
        }
        if (!uri || protocol == '*MAIL') {
            return;
        }

        XDOM.cancelEvent();
        if (uriType === '*HashedUrl' && hasValue(uri)) {
            getHashedUri(obj);
            return;
        }
        openLink();
    }

    /**
     * default click handler
     */
    function handleOnClick() {
        open(GLOBAL.eventSourceElement);
    }

    /**
     * returns filename without extention
     */
    function getFileName() {
        if (uriType === '*HashedUrl') {
            return '';
        }

        return uri.substring(uri.lastIndexOf('/') + 1, uri.lastIndexOf('.'));
    }

    /**
     * opens viewer object
     */
    function openViewer() {
        let args = {
            id: callerId,
            uri: uri,
            extention: extention,
            fileName: getFileName(),
            isFixed: isFixed,
            protocol: protocol
        };
        return Linkviewer.open(args);
    }

    /**
     * opens file as a new browser window or in a viewer
     */
    function openLink() {
        if ((openPreference == Preference.linkViewer || isFixed) && openViewer()) {
            return;
        }
        if (uri) {
            window.open(uri);
        }
    }

    /**
     * callback for getHashedUri when all is well
     * calls openLink
     * or logs error
     * @param {XHTTPresponse} response
     */
    function setHashedUri(response) {
        data = JSON.parse(response.target.responseText).docLinkResponse;
        if (!data) {
            setMessage('F', MESSAGES.DocNotFound);
        }

        if (data.resultCode !== 'Success') {
            setMessage('F', MESSAGES[data.resultCode] + ' [code:' + data.resultCode + ']');
            return;
        }
        init(this.callerObject);
        uri = (data.secureUrl || '').trim();
        openLink();
    }

    /**
     * requests url for hash callback setHashedUri
     * @param {HTMLEllement} callerObject
     */
    function getHashedUri(callerObject) {
        const xmlHttpRequest = new XMLHttpRequest(),
            request =
                '/ndscgi/box/ndmctl/' +
                'CreateDocLink.ndm/secure?' +
                'PFMFILID=' +
                PFMBOX.gCD_ENV +
                '&PFMGRPID=' +
                OCULUS.userGroup +
                '&PFMSOMTD=' +
                PFMBOX.PFMSOMTD +
                '&USRID=' +
                OCULUS.remoteUser +
                '&AUTHTOKEN=' +
                SESSION.AUTHTOKEN +
                '&HashCode=' +
                uri;
        xmlHttpRequest.callerObject = callerObject;
        xmlHttpRequest.addEventListener('load', setHashedUri);
        xmlHttpRequest.open('GET', request, true);
        xmlHttpRequest.send();
        return;
    }

    /**
     * creeert een A element en activeerd deze
     */
    function openGeneratedExcel(url) {
        url = url || SESSION.activePage.createdExcelUrl;
        if (!url) {
            return;
        }
        let a = SCOPE.sessionDoc.getElementById('WS_XLS_HREF');

        if (BrowserDetect.isFirefox) {
            window.open(url);
            return;
        }
        if (!a) {
            const form = SCOPE.pageDoc.getElementsByTagName('FORM')[0];
            if(!form) return;

            a = SCOPE.sessionDoc.createElement('A')
            a.id = 'WS_XLS_HREF';

            form.appendChild(a);
        }
        a.setAttribute('href', url);
        XDOM.invokeClick(a);
        return;
    }

    this.open = open;
    this.setObjValue = setObjValue;
    this.update = update;
    this.handleOnClick = handleOnClick;
}.apply(Link));
