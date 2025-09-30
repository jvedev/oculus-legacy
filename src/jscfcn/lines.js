var Lines = {};
(function() {
  /**
   * voor het conditioneel verberen en weer zichbaar maken van regels
   * een bijna gelijke functionalitijd is te vinden in @see GUI.Lines
   * @type type
   */
  const maxLine = SETTINGS.maxLines + 1;
  let statelessPageId = null;

  /**
   * past regels aan of deze al dan niet zichtbaar zijn binnen een gui scherm (infowindow/edit window)
   * verzameld de juiste regels die verborgen moeten worden
   * @see GUI.update
   * @param {type} pageId als deze is ingevuld wordt er van een stateless pagina uitgegeaan
   * @returns {void}
   */
  function update() {
    const conditionalLines = XDOM.parse(SESSION.activePage.viewProperties.condHiddenLines);
    applyToAllContexts(conditionalLines, SESSION.activeData.headerData);
  }

  /**
   * past regels aan of deze al dan niet zichtbaar zijn binnen een gui scherm (infowindow/edit window)
   * verzameld de juiste regels die verborgen moeten worden
   * een bijna gelijke functionalitijd is te vinden in @see jsfcn/Lines
   * @param {type} GuiPanel
   * @returns {undefined}
   */
  function guiUpdate(GuiPanel) {
    if (!GuiPanel.condHiddenLines) {
      return;
    }
    statelessPageId = GuiPanel.id;
    applyToAllContexts(GuiPanel.condHiddenLines, GuiPanel.data);
    statelessPageId = null;
  }

  /**
   * apply's hidden lines and line offsets as a result of them
   * to all contexts
   * @param {*} conditionalLines
   * @param {*} data
   */
  function applyToAllContexts(conditionalLines, data) {
    const lineContexts = getLinesByContext(conditionalLines, data);
    reset();
    //apply hidden lines to all contexts
    lineContexts.forEach((lines, context) => {
      apply(context, lines);
    });
  }

  /**
   * clusters lines into a map using context as key
   * @param {array of line objects} conditionalLines
   * @param {data} data
   * @returns {map of array of numbers}
   */
  function getLinesByContext(conditionalLines, data) {
    const lineContexts = new Map();
    const envData = SESSION.activeData.environmentConditions || {};

    //collect all lines to be hidden
    //differentiate between contexts
    conditionalLines.forEach(line => {
      const context = line.context || '';
      if (data[line.cond.field] != 1 && envData[line.cond.env]!='true') {
        return;
      }
      if (!lineContexts.has(context)) {
        lineContexts.set(context, []);
      }
      lineContexts.get(context).push(parseInt(line.lineNbr));
    });

    return lineContexts;
  }

  /**
   * loop through the lines
   * update hidden and offset
   * @see GUI.Lines.apply
   * @returns {undefined}
   */
  function apply(context, lines) {
    lines.sort((a, b) => a - b);

    //find first line
    let line = lines[0],
        offset = 0;

    for (; line < maxLine + 1; line++) {
      if (lines.indexOf(line) > -1) {
        //line is hidden
        XDOM.setAttributesToNodeList(queryLines(context, line, false), 'data-hidden-line', 'true');
        //all folowing line's will be offset
        offset++;
        continue;
      }
      //apply the offset
      XDOM.setAttributesToNodeList(queryLines(context, line, true), 'data-y-pos', line - offset);
    }
  }

  /**
   * reset set all lines visible and remove the offset
   * @see GUI.Lines.reset
   * @returns {undefined}
   */
  function reset() {
    var query = '';
    offset = 0;
    if (statelessPageId) {
      query += "[data-stateless-page-id='" + statelessPageId + "']";
    }
    XDOM.setAttributesToNodeList("[data-hidden-line='true']" + query, 'data-hidden-line', 'false');
    XDOM.setAttributesToNodeList('[data-y-pos]' + query, 'data-y-pos', null);
  }

  /**
   * collects all ellements with the same line within the context
   * when private statelessPageId (via guiUpdate)
   * is set context wil be ignored and alle line elements of a stateles page wil be returned
   *
   * @param {string} context can be *main or id of a fieldset
   * @param {number} line
   * @param {boolean} includeFiedset wther or not it will include fieldset tags
   * @returns {NodeList} all ellements with the same line within the context
   */
  function queryLines(context, line, includeFiedset) {
    let query = '';
    const fieldSetSelector = !includeFiedset ? ':not(fieldset)' : '';

    if (statelessPageId) {
      query += `[data-stateless-page-id="${statelessPageId}"].line${line}`;
      return SCOPE.pageDoc.querySelectorAll(query);
    }

    if (context == '*MAIN') {
      query = `#DTADIV > .line${line}${fieldSetSelector}`;
    } else {
      query = `#${context} > div > .line${line}${fieldSetSelector}`;
    }
    return SCOPE.pageDoc.querySelectorAll(query);
  }

  this.guiUpdate = guiUpdate;
  this.update = update;
}.apply(Lines));
