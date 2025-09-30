// //https://www.smashingmagazine.com/2018/01/drag-drop-file-uploader-vanilla-js/
// var multiUpload = {};

// (function () {
//     function prepareDom(){
        
//         SCOPE.pageDoc.querySelectorAll('[data-component="multiUpload"]').forEach(obj => render(obj))
//     }

//     function update(){
//         SCOPE.pageDoc.querySelectorAll('[data-component="multiUpload"]').forEach(obj=>{
//             fileList = obj.querySelector(".fileList");
//             const fieldNames = obj.dataset.name.split(' ');
//             fieldNames.forEach(field=>setEntry( headerData[field],'server'));
//         });
//     }

//     function render(obj){
        
//         obj.innerHTML = `<div class="fileList"></div>
//         <div class="footer" >
//         <div class="label">${lblUploadDragFilesHere}</div>
//         <i class="pth-icon pth-upload dataSectionButton theme-hover-color" 
//         data-event-class="SingleUpload" 
//         data-click="openFileDialog" 
//         data-title-origin="*LBL" 
//         data-title-variable="ttlUploadSelectFile" ></i>
//         </div>
//         `
//     }
//     function registerEvents(obj) {
//         obj.addEventListener('dragenter', dragenter, false);
//         obj.addEventListener('dragleave', dragleave, false);
//         obj.addEventListener('dragover', dragover, false);
//         obj.addEventListener('drop', drop, false);
//     }


//     function dragenter(e) {
//         highlight(e.currentTarget);
//         preventDefaults(e);
//     }

//     function dragleave(e) {
//         unhighlight(e.currentTarget);
//         preventDefaults(e);
//     }

//     function dragover(e) {
//         highlight(e.currentTarget);
//         preventDefaults(e);
//     }

//     function drop(e) {
//         unhighlight(e.currentTarget);
//         let dt = e.dataTransfer,
//             files = dt.files,
//             fileList = e.currentTarget.querySelector(".fileList")
//         handleFiles(files);
//         preventDefaults(e);
//     }

//     function highlight(obj) {
//         obj.classList.add('highlight');
//     }

//     function unhighlight(obj) {
//         obj.classList.remove('highlight');
//     }

//     function unDeleteFile(e) {
//         e.target.parentNode.dataset.state = "server";
//     }

//     function deleteFile(e) {
//         let obj = e.target.parentNode;
//         if (obj.dataset.state == 'local') {
//             obj.remove();
//             return;
//         }
//         obj.dataset.state = "delete";

//     }

   



//     function handleFiles(files) {
//         let filesIterator = ([...files])
//         //filesIterator.forEach(uploadFile);
//         filesIterator.forEach(addFile);
//     }
  
//     function addFile(file) {
//         let reader = new FileReader();
//         reader.readAsDataURL(file)
//         reader.onloadend = function () {setEntry( file.name,'local',reader)};
//     }

//     function setEntry(fileName,state, reader=null){
//         if(!fileName){return;}
//         let extention = fileName.substr(fileName.lastIndexOf('.') + 1).toUpperCase();
//         fileList.innerHTML += `<div class="file" data-state="${state}" data-file-name="${fileName}">
//         ${getIcon(reader,fileName, extention )}
//         <label>${fileName}</label>
//         <i  data-click="deleteFile" title="${captions.delete_file}" data-event-class="multiUpload" class="fa fa-times"></i>
//         <i  data-click="unDeleteFile" title="${captions.unDelete_file}" data-event-class="multiUpload" class="fa fa-refresh"></i>
//         </div>`
//     }

//     function getIcon(reader, fileName, extention) {
//         if (isImage(extention)) {
//             if(reader){
//                 return `<img onmouseover="multiUpload.previewImage(event)" data-event-class="multiUpload" src="${reader.result}"></img>`;
//             }else{
//                 return `<img onmouseover="multiUpload.previewImage(event)" data-event-class="multiUpload" src="${fileName}"></img>`;
//             }
            
//         }
//         return `<i class="fa fa-icon"  data-icon="${extention}"></i>`
//     }

//     function isImage(extention) {
//         return imageExtentions.indexOf(extention)>-1;
//     }


//     function previewImage(e) {
//         let currentPreview = document.querySelector(".multiUpload-image-preview"),
//             container = document.getElementById("DTADIV"),
//             x = 0,
//             y = 0,
//             obj = e.target.cloneNode();
//         if (currentPreview) {
//             if (currentPreview.src == obj.src) {
//                 return;
//             }
//             currentPreview.remove();
//         }
//         obj.addEventListener("mouseout", e => e.target.remove());
//         obj.className = 'multiUpload-image-preview';
//         container.appendChild(obj);
//         x = e.clientX - (obj.offsetWidth / 2);
//         y = e.clientY - (obj.offsetHeight / 2);
//         if (x + obj.offsetWidth > container.offsetWidth) {
//             x = container.offsetWidth - obj.offsetWidth - 10;
//         }
//         if (x < 0) {
//             x = 10;
//         }
//         if (y + obj.offsetHeight > container.offsetHeight) {
//             y = container.offsetHeight - obj.offsetHeight - 10;
//         }
//         if (y < 0) {
//             y = 10;
//         }
//         obj.style.left = x + 'px';
//         obj.style.top = y + 'px';
//     }

//     function uploadFile(file) {
//         console.log('uploadddddddddddd');
//         return;
//         let url = 'YOUR URL HERE'
//         let formData = new FormData()

//         formData.append('file', file)

//         fetch(url, {
//                 method: 'POST',
//                 body: formData
//             })
//             .then(() => { /* Done. Inform the user */ })
//             .catch(() => { /* Error. Inform the user */ })
//     }

//     this.prepareDom = prepareDom;
//     this.update = update;
//     this.deleteFile = deleteFile;
//     this.unDeleteFile = unDeleteFile;
//     //this.previewImage = previewImage;
// }).apply(multiUpload);