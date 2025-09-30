var UploadThumbnail = {};

(function() {
  /**
   * creats icon or image preview dependinig on content
   * @param {HTMLElement} parent
   * @param {File} fileName
   */
  async function set(parent, file) {

    const fileIsUrl = typeof file == 'string',
      fileName = fileIsUrl ? file : file.name;
    if (isImage(getExtention(fileName))) {
      if (fileIsUrl) {
        setFromUrl(parent,fileName);
      } else {
        await setFromFile(parent, file);
      }
    } else {
      setIcon(parent, fileName);
    }
  }

  /**
   * creats icon
   * @param {HTMLElement} parent
   * @param {String} fileName
   */
  function setIcon(parent, fileName) {
    let img = parent.querySelector('img'),
      icon = parent.querySelector('[data-icon]');
    icon.setAttribute('data-icon', getExtention(fileName));
    img.style.display = 'none';
    icon.style.display = 'inline';
  }

  function setFromUrl(parent, file) {
    let img = parent.querySelector('img'),
      icon = parent.querySelector('[data-icon]');
    icon.style.display = 'none';
    img.style.display = 'inline';
    img.src = file;
  }

  /**
   * creats image thumbnail from a file object
   * @param {HTMLElement} parent
   * @param {File} fileName
   */
  async function setFromFile(parent, file) {
    let img = parent.querySelector('img'),
      icon = parent.querySelector('[data-icon]'),
      reader = await readerAsDataURL(file);
    icon.style.display = 'none';
    img.style.display = 'inline';
    img.src = reader.result;
  }

  /**
   * hides thumbnail or icon
   */
  function remove(parent) {
    let img = parent.querySelector('img'),
      icon = parent.querySelector('[data-icon]');
    img.style.display = 'none';
    img.src = '';
    icon.style.display = 'none';
  }

  /**
   * creates a preview of an image on mouseover
   * @param {event} e
   */
  function mouseover(e) {
/*    let currentPreview = XDOM.query('.UploadThumbnail-image-preview'),
      container = XDOM.query('#DTADIV'),
      x = 0,
      y = 0,
      obj = e.target.cloneNode();
    if (currentPreview) {
      if (currentPreview.src == obj.src) {
        return;
      }
      currentPreview.remove();
    }
    obj.addEventListener('mouseout', e => e.target.remove());
    obj.className = 'UploadThumbnail-image-preview';
    container.appendChild(obj);
    x = e.clientX - obj.offsetWidth / 2;
    y = e.clientY - obj.offsetHeight / 2;
    if (x + obj.offsetWidth > container.offsetWidth) {
      x = container.offsetWidth - obj.offsetWidth - 10;
    }
    if (x < 0) {
      x = 10;
    }
    if (y + obj.offsetHeight > container.offsetHeight) {
      y = container.offsetHeight - obj.offsetHeight - 10;
    }
    if (y < 0) {
      y = 10;
    }
    obj.style.left = x + 'px';
    obj.style.top = y + 'px'; */
  }

  this.remove = remove;
  this.set = set;
  this.mouseover = mouseover;
}.apply(UploadThumbnail));
