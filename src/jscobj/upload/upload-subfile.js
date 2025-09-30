var SubfileUpload = {};

(function () {
    /**
     * initialisation of component
     */
    function update(obj) {
        const uploads = XDOM.queryAll('[data-component="upload"]');
        uploads.forEach(registerEvents);
    }

    function registerEvents(obj) {
        obj.addEventListener('dragenter', dragenter, false);
        obj.addEventListener('dragleave', dragleave, false);
        obj.addEventListener('dragover', dragover, false);
        obj.addEventListener('drop', drop, false);
    }    

    function highlight(obj){
        if(obj.dataset.isTarget =="true"){
            return;
        }
        obj.dataset.isTarget = true;
        let rect = obj.getBoundingClientRect();
        obj.style.top = (rect.top-10)+'px';
        obj.style.left = (rect.left-10)+'px';
        obj.classList.remove("pth-upload");
        obj.innerHTML = getCapt('lblUploadDragFileHere');
    }
    
    function unhighlight(obj){
        obj.style.top = '';
        obj.style.left = '';
        obj.dataset.istarget = false;
        obj.classList.add("pth-upload");
        obj.innerHTML ='';
    }

    function dragenter(e) {
        highlight(e.target);
        preventDefaults(e);
    }

    function dragleave(e) {
        unhighlight(e.target);
        preventDefaults(e);
    }

    function dragover(e) {
        highlight(e.target);
        preventDefaults(e);
    }

    function drop(e) {
        unhighlight(e.target);
        let dt = e.dataTransfer,
            files = dt.files,
            fileList = e.currentTarget.querySelector(".fileList");
        //handleFiles(files);
        preventDefaults(e);
    }

    this.update = update;
}).apply(SubfileUpload);
