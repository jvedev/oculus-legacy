var SingleUpload = {};

(function () {
        // /**
        //  * types of file filter
        //  */
        // const filterDev = {
        //   '*OFFICE':
        //     '.docx, .docm, .dotx, .dotm, .xlsx, .xlsm, .xltx, .xltm, .xlsb, .xlam, .pptx, .pptm, .potx, .potm, .ppam, .ppsx, .ppsm, .sldx, .sldm, .thmx, .pdf, .xls, .doc, .ppt, .xps',
        //   '*DATA': '.csv, .xlm',
        //   '*WORD': '.docx, .docm, .dotx, .dotm, .doc',
        //   '*EXCEL': '.xlsx, .xlsm, .xltx, .xltm, .xlsb, .xlam, .xls',
        //   '*XML': '.xml',
        //   '*CSV': '.csv',
        //   '*PDF': '.pdf',
        //   '*IMAGE': 'image/*',
        //   '*ALL': '*.*'
        // };

        /**
         * Enumeratie om status weer te geven:
         * B, blank: field was leeg en veld is leeg
         * S, select: veld was leeg en veld is gevuld
         * C, changed: veld was gevuld en veld is gevuld met een andere waarde
         * D, delete:  veld was gevuld en veld is leeg
         * P, processed Veld was gevuld en veld is verwerkt op server
         */

        /**
         * actions to be performed by the server
         */
        const serverAction = {
            delete: 'D',
            change: 'C',
            upload: 'S',
            none: ''
        };

        /**
         * update of component
         * @param {HTMLElement} obj
         */
        function update() {
            const uploads = XDOM.queryAll('[data-component="upload"]');
            uploads.forEach(updateComponent);
        }

        /**
         * update of component
         * @param {HTMLElement} obj
         */
        function updateComponent(obj) {
            const fileInputElement = getFileInput(obj)
            Array.from(obj.children).forEach(registerEvents);
            registerEvents(obj);
            setValue(obj);

            // Add hover
            if (obj) {
                registerHoverEvent(obj);
            }

            fileInputElement.addEventListener('change', onChange, false);
            obj.addEventListener('drop', drop, false);
            obj.addEventListener('paste', paste, false);
            obj.querySelector('img').addEventListener('mouseover', UploadThumbnail.mouseover, false);
            setDeleteIcons(obj);
        }

        function showHideDelete(obj, deleteIcon) {
            // hide delete field
            deleteIcon.style.display = 'none';

            const {
                deleteField,
                state
            } = obj.dataset;

            const headerData = SESSION.activeData.headerData;

            // do we have a delete field if not we don't show delete so return
            if (!deleteField) {
                return;
            }

            // is there something to delete if not we don't show delete so return
            if (state != 'server') {
                return;
            }

            // is delete enabled field explicitly set to "1" we don't show delete so return
            if (headerData[deleteField + '_HDN'] == '1') {
                return;
            }

            // so it must be true than
            deleteIcon.style.display = 'inline-block';
        }


        /**
         * indicates weather or not the delete-field is enabled
         * @param obj
         * @param deleteIcon
         */
        function enableDelete(obj, deleteIcon) {
            const {
                deleteField,
            } = obj.dataset;


            const headerData = SESSION.activeData.headerData;
            // is the "delete enabled" field present and explicitly set to "0"
            const disabled = (headerData[deleteField + '_AVL'] == '0')
            if (disabled) {
                deleteIcon.setAttribute('data-button-enabled', 'false')
                return;
            }
            deleteIcon.setAttribute('data-button-enabled', 'true')
        }


        function setDeleteIcons(obj) {
            const deleteIcon = obj.querySelector('[data-click="deleteServer"]');
            //do we have a delete button
            if (!deleteIcon) {
                return;
            }
            showHideDelete(obj, deleteIcon);
            enableDelete(obj, deleteIcon);

        }


        /**
         * sets filter to file input object
         * @param {HTMLInputElement} obj file input object
         */
        function setFilter(obj) {
            const filter = UploadCommon.getFilter(obj),
                fileObject = getFileInput(obj);
            if (!filter || !fileObject) {
                return;
            }
            fileObject.accept = filter;
            return fileObject;
        }

        /**
         * gets the file input element
         * @param {HTMLElement} [parentObject] parent object
         * @returns {HTMLInputElement} file input element
         */
        function getFileInput(parentObject) {
            // Get input
            let input = parentObject.querySelector('input[type="file"]');

            // Clean input if no state change
            cleanInput(input);

            // Return input
            return input;
        }

        /**
         * gets the delete input element
         * @param {HTMLElement} [parentObject] parent object
         * @param {string} [status]
         */
        function setDelete(parentObject, value) {
            const el = parentObject.querySelector('input[data-upload-field-type="delete"]');
            if (!el) return;
            el.value = value;
        }

        /**
         * sets the current status
         * @param {HTMLElement} [parentObject] parent object
         * @param {string} [status]
         * @returns {HTMLInputElement} file input element
         */
        function setState(parentObject, status) {
            parentObject.querySelector('input[data-upload-field-type="status"]').value = status;
        }

        /**
         * clickhandler for showing the uploaded file
         * @param {PthEvent} ev
         */
        function click(ev) {
            if (ev.invokeObject.classList.contains('icons')) {
                Link.open(getParent(ev.invokeObject));
            }
        }

        /**
         * sets the alias if any
         * otherwise it sets the file name directly
         * @param {HTMLElement} obj
         * @param {string} uri
         */
        function setAlias(obj, uri) {
            let alias = '';
            //   switch (obj.dataset.linkAliasType) { -- MVB
            switch (obj.dataset.aliasType) {
                case '*IMG':
                    break; // no alias only an icon or thumbnail
                case '*VAR':
                    alias = SESSION.activeData.headerAttributes[obj.dataset.aliasField];
                    break;
                case '*LBL':
                    alias = getCaption(obj.dataset.linkAlias, ''); //set to one space to prevent default value
                    break;
                default:
                    alias = getFilenameFromUrl(uri);
                    break;
            }
            setFileName(obj, alias);
        }

        /**
         * set value to this object
         * @param {HTMLElement} obj
         */
        async function setValue(obj) {
            let uri = SESSION.activeData.headerData[obj.dataset.linkField] || '',
                state = uri ? 'server' : 'empty';

            obj.dataset.uri = uri;
            obj.dataset.serverHasFile = uri != '';
            obj.dataset.state = state;
            obj.dataset.extension = getExtention(uri);

            if (!checkState()) {
                // Get input and thumbnail
                let input = obj.querySelector('input[type="file"]');
                let thumbnail = obj.querySelector('.upload-image img');

                cleanInput(input);

                // Grab image from server
                if (uri) {
                    setAlias(obj, uri);
                } else {
                    setFileName(obj);
                }
                setFilter(obj);

                await UploadThumbnail.set(obj, uri);
            } else if (SESSION.activeData.headerData['STFIM_STS'] == 'D') {
                // If state is delete then make sure that data-state is set to delete
                obj.dataset.state = 'delete';
            }
        }

        function checkState() {
            // Return boolean if state has changed
            return ((SESSION.activeData.headerData['STFIM_STS'] == 'C') || (SESSION.activeData.headerData['STFIM_STS'] == 'D'));
        }

        function cleanInput(input) {
            // Check whether a change has been made
            if (!checkState()) {
                // Reset the input value
                input.value = '';
            }
        }

        function registerHoverEvent(obj) {
            // Get the image from the object and register a mouesover event for overflow handling
            let image = obj.querySelector('.upload-image img');

            image.addEventListener('mouseover', () => {
                setOverflow(image, obj);
            });
        }

        function setOverflow(element, parent) {
            // Get iframe body for height calculations (we are using the viewport width)
            let form = parent.closest('body');

            // Setup initial direction variables
            let vertical = 'top';
            let horizontal = 'left'

            // Get height and width scaled by *6
            let height = (element.clientHeight * 6) + parent.offsetTop;
            let width = (element.clientWidth * 6) + parent.offsetLeft;

            // Check height for overflow on bottom of page
            if ((height) > (form.scrollHeight - 32)) {
                vertical = 'bottom';

                element.classList.add('bottom');
                element.classList.remove('top');
            } else {
                element.classList.add('top');
                element.classList.remove('bottom');
            }

            // Check width for overflow on bottom of page
            if ((width) > (window.innerWidth - 36)) {
                horizontal = 'right';
            }

            // Set transform direction
            element.style.transformOrigin = (vertical + ' ' + horizontal);
        }

        /**
         * sets dragevents
         * @param {HTMLElement} obj
         */
        function registerEvents(obj) {
            obj.addEventListener('dragenter', dragenter, false);
            obj.addEventListener('dragleave', dragleave, false);
            obj.addEventListener('dragover', dragover, false);
        }

        /**
         * apply highlight style
         * @param {HTMLElement} obj
         */
        function highlight(obj) {
            obj.classList.add('upload-highlight');
        }

        /**
         * removes highlight style
         * @param {HTMLElement} obj
         */
        function unhighlight(obj) {
            obj.classList.remove('upload-highlight');
        }

        /**
         * drag enter event handler
         * @param {PthEvent} e
         */
        function dragenter(e) {
            highlight(getParent(e.target));
            preventDefaults(e);
        }

        /**
         * dragleave event handler
         * @param {PthEvent} e
         */
        function dragleave(e) {
            unhighlight(getParent(e.target));
            preventDefaults(e);
        }

        /**
         * dragover event handler
         * @param {PthEvent} e
         */
        function dragover(e) {
            highlight(getParent(e.target));
            preventDefaults(e);
        }

        /**
         * checks file name length when not defined by a data-length attribute in the parent it will default to (defaultlength = 200)
         * @param parentObj
         * @param file
         * @returns {boolean}
         */
        function checkLength(parentObj, file) {
            const defaultLength = 200;
            const maxLength = parseInt(parentObj.dataset.length) || defaultLength;
            if (file.name.length <= maxLength) {
                return true
            }

            //build up message
            let message = getCapt('UploadFileNameToLong1')
            message += file.name.substring(0, 20) + '... ';
            message += getCapt('UploadFileNameToLong2');
            message += file.name.length;
            message += getCapt('UploadFileNameToLong3');
            message += maxLength;
            setMessage("A", message);

            return false;

        }


        /**
         * sets selected file
         * @param {HTMLElement} parentObj
         * @param {file} file
         */
        async function setFile(parentObj, file) {
            if (parentObj.dataset.state == 'server') {
                return;
            }
            //check file length
            if (!checkLength(parentObj, file)) return;

            setFileName(parentObj, file.name);
            parentObj.dataset.state = 'local';
            setForUpload(parentObj);

            return await UploadThumbnail.set(parentObj, file);
        }

        /**
         * onChange event handler
         * @param {PthEvent} e
         */
        async function onChange(e) {
            preventDefaults(e);
            const fileInput = e.target,
                file = fileInput.files[0],
                parentObj = getParent(fileInput);
            await setFile(parentObj, file);
        }


        /**
         * drop event handler
         * @param {PthEvent} e
         */
        async function drop(e) {
            preventDefaults(e);

            const file = e.dataTransfer.files[0],
                parentObj = getParent(e.target),
                fileInput = parentObj.querySelector('input[type="file"]');

            unhighlight(parentObj);
            fileInput.files = e.dataTransfer.files;
            await setFile(parentObj, file);
        }

        async function paste(e) {

            const data = e.clipboardData || e.dataTransfer;
            const parentObj = getParent(e.target);
            const fileInput = parentObj.querySelector('input[type="file"]');
            preventDefaults(e);

            if (!data) {
                return;
            }

            unhighlight(parentObj);

            // Clipboard isn't async enabled so we need to clone it into a DataTransfer (pretty close to a clipboard clone)
            let transfer = new DataTransfer();

            // Loop the files and add them as new files into the transfer
            for (let i = 0; i < data.files.length; i++) {
                transfer.items.add(
                    new File(
                        [data.files[i].slice(0, data.files[i].size, data.files[i].type)],
                        data.files[i].name
                    )
                )
            }

            await setFile(parentObj, data.files[0]);

            fileInput.files = transfer.files;
        }

        /**
         *
         * @param {HTMLElement} parent
         * @param {String} fileName
         */
        function setFileName(parent, fileName = getCapt('lblUploadDragFileHere')) {
            parent.querySelector('.label').innerHTML = fileName;

            // Get file extension
            let fileExtension = getFileExtension(fileName);

            // Check string isn't empty and add class
            if (fileExtension) {
                parent.setAttribute('data-fileType', fileExtension);
            } else if (parent.hasAttribute('data-fileType')) {
                parent.removeAttribute('data-fileType');
            }
        }

// Get the file extension
        function getFileExtension(filename) {
            return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
        }

        /**
         * unsets file to be deleted
         * @param {PthEvent} ev
         */
        function unDeleteFile(ev) {
            const parentObj = getParent(ev.invokeObject);
            parentObj.dataset.state = 'server';
            setForUpload(parentObj);
        }

        /**
         * removes preview and set file to be deleted
         * @param {PthEvent} ev
         */
        function deleteServer(ev) {
            const parentObj = getParent(ev.invokeObject);

            //check if delete is disabled
            if (ev.invokeObject.classList.contains('disabled')) {
                return;
            }
            parentObj.dataset.state = 'delete';
            setState(parentObj, 1);
            setForDelete(parentObj);

            // Set delete state to mimic empty behaviour
            UploadThumbnail.remove(parentObj);
            setFileName(parentObj, getCapt('lblUploadDragFileHere'));
        }

        /**
         * removes local file
         * like clearing an input field
         * @param {PthEvent} ev
         */
        function deleteLocal(ev) {
            deleteServer(ev);
            const parentObj = getParent(ev.invokeObject),
                fileInput = getFileInput(parentObj);
            fileInput.files = null;
            fileInput.value = null;
            UploadThumbnail.remove(parentObj);
            setFileName(parentObj, getCapt('lblUploadDragFileHere'));
            parentObj.dataset.state = 'empty';
            setForDelete(parentObj);
        }

        /**
         * sets server action to be performed
         * for deleting
         * @param {HTMLElement} parent
         */
        function setForDelete(parent) {
            if (parent.dataset.serverHasFile) {
                setState(parent, serverAction.delete);
                setDelete(parent, '1');
            } else {
                setState(parent, serverAction.none);
                setDelete(parent, '');
            }
        }

        /**
         * sets server action to be performed
         * for uploading
         * @param {HTMLElement} parent
         */
        function setForUpload(parent) {
            setDelete(parent, '');
            if (parent.dataset.serverHasFile) {
                setState(parent, serverAction.change);
            } else {
                setState(parent, serverAction.upload);
            }
        }

        /**
         * @param {HTMLElement} obj
         * @returns {HTMLElement} parent Object
         */
        function getParent(obj) {
            return XDOM.getParentByAttribute(obj, 'data-component');
        }

        /**
         * opens native file selector object;
         * @param {PthEvent} ev
         */
        function openFileDialog(ev) {
            UploadCommon.openFileDialog(ev);
            // const parent = ev.invokeObject,
            //   fileObject = getFileInput(parent);
            // XDOM.invokeClick(fileObject);
        }

        this.openFileDialog = openFileDialog;
        this.unDeleteFile = unDeleteFile;
        this.deleteServer = deleteServer;
        this.deleteLocal = deleteLocal;
        this.update = update;
        this.click = click;
    }.apply(SingleUpload)
)
;
