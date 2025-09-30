/* global Stateless, XDOM, SETTINGS, SESSION, Subfile, Logical, GLOBAL */

Stateless.subfile = function(pageObject) {
  this.page = pageObject;
  this.sflObject = null;
  this.inputIds = [];
  this.fieldProgressionIndex = 5;
  this.reload = false;
};

Stateless.subfile.pageSize = 30;

Stateless.subfile.prototype.filterData = function() {
  if (!this.page.data.subfileAttributes) {
    return;
  }
  var raw = this.page.data.subfileData.slice(0), //copy of subfile data
    rawAttributes = this.page.data.subfileAttributes.slice(0),
    record = null,
    recordAttributes = null;

  this.page.data.subfileData = [];
  this.page.data.removedSubfileData = [];
  this.page.data.subfileAttributes = [];
  for (var i = 0, l = raw.length; i < l; i++) {
    record = raw[i];
    recordAttributes = rawAttributes[i];
    if (recordAttributes["SF_DSP"] === "0") {
      //komt niet meer voor in selectie
      this.page.data.removedSubfileData.push(record);
    } else {
      this.page.data.subfileData.push(record);
      this.page.data.subfileAttributes.push(recordAttributes);
    }
  }
};

Stateless.subfile.prototype.setscrollPoss = function() {
  let bodyDiv = XDOM.getObject(this.page.prefix + "SFL");
  body = XDOM.query('[data-record-selected="true"]', bodyDiv);

  bodyDiv.dataset.scrollPosition = bodyDiv.scrollTop;
  if (body) {
    bodyDiv.dataset.selectedRecord = body.dataset.recordNumber;
  }
};

Stateless.subfile.prototype.scrollsUp = function(obj) {
  var bodyDiv = GLOBAL.eventSourceElement,
    lastPos = parseInt(bodyDiv.dataset.scrollPosition),
    newPos = bodyDiv.scrollTop;
  bodyDiv.dataset.scrollPosition = bodyDiv.scrollTop;

  return lastPos > newPos;
};

Stateless.subfile.prototype.update = function() {
  if (this.sflObject) {
    this.filterData();
    this.sflObject.updateColumnHeading(
      XDOM.getObject(this.page.prefix + "COLHDGTBL")
    );
    this.sflObject.update(this.reload);
    Subfile.fixHeaderLogical(this.page.prefix);
    this.adjustHeight();
    this.scrollTop();
    this.reload = false;
  }
};

Stateless.subfile.prototype.getReturnValues = function(tBody) {
  let returnToCaller = tBody.getAttribute("data-subfile-return-to-caller");
  if (!returnToCaller) {
    return;
  }
  let dataFields = returnToCaller.split(" "),
    recordNumber = getClientRecordNr(tBody),
    record = this.page.data.subfileData[recordNumber],
    returnValues = [];

  for (var i = 0, l = dataFields.length; i < l; i++) {
    returnValues.push(record[dataFields[i]]);
  }
  return returnValues;
};
Stateless.subfile.prototype.append = function(data) {
  if (!this.appendset) {
    return false;
  }

  this.appendset = false;
  //this.page.data.headerData.WS_SSR = data.headerData.WS_SSR;
  this.page.data.headerData.WS_SER = data.headerData.WS_SER;
  if (this.page.data.subfileData.length === 0) {
    return; //er is geen data meer om toe te voegen
  }

  this.page.data.subfileData = this.page.data.subfileData.concat(
    data.subfileData
  );
  if (this.page.data.subfileAttributes) {
    this.page.data.subfileAttributes = this.page.data.subfileAttributes.concat(
      data.subfileAttributes
    );
    this.sflObject.attributes = this.page.data.subfileAttributes;
  }

  this.page.setValues();
  if (data.subfileData.length == 0) {
    this.page.setMessage(getCapt('msgNoMoreData'), "signal");
  } else {
    this.page.setMessage();
  }

  this.sflObject.data = this.page.data.subfileData;
  this.sflObject.renderNextRecords();
  this.setscrollPoss();
  return true;
};

Stateless.subfile.prototype.getNextSet = function() {
  this.appendset = true;
  this.page.setMessage(getCapt('msgLoadingData'), "loading");
  this.page.submit("NXTSET");
};

Stateless.subfile.prototype.renderNextRecords = function(fromScroll) {
  if (this.sflObject.renderNextRecords()) {
    return;
  }
  if (fromScroll && this.page.type != "MultiSelect") {
    this.getNextSet();
  }
};

Stateless.subfile.prototype.scrollTop = function(e) {
  var bodyDiv = XDOM.getObject(this.page.prefix + "SFL"),
    selected = bodyDiv.dataset.selectedRecord;

  if (!this.reload) {
    bodyDiv.scrollTop = 0;
    this.setscrollPoss();
  }
  bodyDiv.scrollTop = bodyDiv.dataset.scrollPosition;
  if (selected) {
    let tbody = XDOM.query('tbody[data-record-number="' + selected + '"]');
    if (tbody) {
      tbody.setAttribute("data-record-selected", true);
    }
  }
  return;
};



Stateless.subfile.onScroll = function(e) {
  XDOM.getEvent(e);
  var obj = GLOBAL.eventSourceElement,
    minPxFromBottom = 100,
    pxFromBottom = obj.scrollHeight - obj.clientHeight - obj.scrollTop,
    page = Stateless.Page.get();

  Stateless.Page.setScope(page);
  if (Subfile.checkForChange(page)) {
    return;
  }

  if (pxFromBottom > minPxFromBottom) {
    return;
  }

  if (page && page.subfile) {
    if (page.subfile.scrollsUp()) {
      return;
    }
    page.subfile.renderNextRecords(true);
  }
  Stateless.Page.setScope();
};

Stateless.subfile.prototype.setTabelWidth = function(header, body) {
  var width = header.parentNode.offsetWidth - 16;
  header.getElementsByTagName("TABLE")[0].style.width = width + "px";
  body.getElementsByTagName("TABLE")[0].style.width = width + "px";
};

Stateless.subfile.prototype.setForReload = function() {
  //zet de eerste regel op 0
  this.setscrollPoss();
  this.reload = true;
};

Stateless.subfile.prototype.prepareSortButtons = function(headerDiv) {
  const prefix = this.page.prefix;
  [...headerDiv.querySelectorAll("[data-sort-field-name]")].forEach(div =>
    div.setAttribute(
      "data-sort-field-name",
      prefix + div.getAttribute("data-sort-field-name")
    )
  );
};

Stateless.subfile.prototype.prepare = function() {
  var headerDiv = XDOM.getObject(this.page.prefix + "COLHDG"),
    bodyDiv = XDOM.getObject(this.page.prefix + "SFL");

  if (!bodyDiv) {
    return;
  }

  headerDiv.setAttribute(
    "data-fieldprogression-index",
    this.fieldProgressionIndex++
  );
  bodyDiv.setAttribute(
    "data-fieldprogression-index",
    this.fieldProgressionIndex
  );
  Subfile.setHeaderBodyRef(this.page.prefix);
  XDOM.addEventListener(bodyDiv, "scroll", Stateless.subfile.onScroll);

  this.setTabelWidth(headerDiv, bodyDiv);
  this.prepareSortButtons(headerDiv);
  this.sflObject = new Subfile(this.page.prefix + "SFLTBL");
  this.sflObject.pageSize = Stateless.subfile.pageSize;
  this.sflObject.prefix = this.page.prefix;
  this.sflObject.prepareDom();
  this.sflObject.recordTemplate.setAttribute("data-stateless-id", this.page.id);
  Subfile.setHeaderBodyRef(this.page.prefix);
  Subfile.fixHeaderLogical(this.page.prefix);
};

Stateless.subfile.prototype.adjustHeight = function() {
  if (this.page.screenMode !== ENUM.screenMode.subview) {
    return;
  }

  let sflDiv = XDOM.getObject(this.sflObject.id).parentNode,
    sflTop = getObjPosTo(sflDiv, this.page.parentId).top,
    containerheight = this.page.parentId.offsetHeight,
    sflHeight = containerheight - sflTop - 30;
  sflDiv.style.height = sflHeight + "px";
};
