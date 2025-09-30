var UploadCommon = {};

(function () {
    const filterDev = {
        '*OFFICE':
            '.docx, .docm, .dotx, .dotm, .xlsx, .xlsm, .xltx, .xltm, .xlsb, .xlam, .pptx, .pptm, .potx, .potm, .ppam, .ppsx, .ppsm, .sldx, .sldm, .thmx, .pdf, .xls, .doc, .ppt, .xps',
        '*DATA': '.csv, .xlm',
        '*WORD': '.docx, .docm, .dotx, .dotm, .doc',
        '*EXCEL': '.xlsx, .xlsm, .xltx, .xltm, .xlsb, .xlam, .xls',
        '*XML': '.xml',
        '*CSV': '.csv',
        '*PDF': '.pdf',
        '*IMAGE': 'image/*',
        '*ALL': '*.*'
    };

    function getFilter(obj) {
        let dynamicAllow = SESSION.activeData.headerAttributes[obj.dataset.uploadFiletypeField],
            allow = obj.dataset.uploadFiletype,
            filter = filterDev[allow] || filterDev['*ALL']; //fallback will alwasy be *ALL

        // in case of a dynamic field value
        if (dynamicAllow) {
            //set filter to dynamic preset from filterdev or if non existent set dynamicAllow directly
            filter = filterDev[dynamicAllow] ||  dynamicAllow;
        }

        if (!filter) {
            setMessage('F', 'onbekende file definitie voor upload: ' + allow);
            return;
        }
        return filter;
    }

    function setFilter(obj) {
        const filter = getFilter(obj),
            fileObject = getFileInput(obj);
        if (!filter || !fileObject) {
            return;
        }
        fileObject.accept = filter;
        return fileObject;
    }

    function getFileInput(obj) {
        return obj.querySelector('input[type="file"]');
    }

    /**
     * opens native file selector object;
     * @param {pthEvent} ev
     */
    function openFileDialog(ev) {
        const parent = getParent(ev.invokeObject),
            fileObject = setFilter(parent);
        XDOM.invokeClick(fileObject);
    }

    function getParent(obj) {
        return XDOM.getParentByAttribute(obj, 'data-component');
    }

    this.getFilter = getFilter;
    this.openFileDialog = openFileDialog;
}.apply(UploadCommon));
