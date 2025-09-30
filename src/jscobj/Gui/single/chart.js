function legend(parent, data) {
    parent.className = 'legend';
    var datas = data.hasOwnProperty('datasets') ? data.datasets : data;
    // remove possible children of the parent
    while (parent.hasChildNodes()) {
        parent.removeChild(parent.lastChild);
    }
    datas.forEach(function (d) {
        var title = document.createElement('span');
        title.className = 'title';
        title.style.borderColor = d.hasOwnProperty('backgroundColor') ? d.backgroundColor : d.color;
        title.style.borderStyle = 'solid';
        parent.appendChild(title);
        var text = document.createTextNode(d.title);
        title.appendChild(text);
    });
}

GUI.Chart = function (obj) {
    GUI.Chart.baseConstructor.call(this, obj);
    this.dataFields = obj.data; //twee dimentionale array met namen van velden die de data bevatten
    this.chartObject = null;
    this.chartType = obj.subtype;
    this.labels = obj.labels;
    this.updateded = false;
    this.legend = obj.legend;
    this.x = 1;
    this.y = 2;
    this.ySize = parseInt(obj.lines);
    this.xSize = parseInt(obj.xSize);
    this.graphicContext = null;

    // Setup mutation observer
    this.loadObserver = new MutationObserver((mutation) => {
        // Callback function for mutation observer
        if (window.SCOPE.pageDoc.contains(this.dom.canvasObject)) {
            // Set the sizes
            this.setContainerSizes();

            // Update the chart
            this.updateState();

            // Disconnect the observer
            this.loadObserver.disconnect();
        }
    });
};

XDOM.extendObject(GUI.Chart, GUI.BaseObject);

/**
 * @override GuiBaseObject
 */
GUI.Chart.prototype.init = function () {
    this.base(GUI.Chart, 'init');
};

GUI.Chart.prototype.render = function () {
    this.dom.domObject = XDOM.createElement('DIV', null, "chartWrapper " + this.getCssClass());
    this.renderChart();

    // Start the loadObserver on the pageDoc
    this.loadObserver.observe(
        window.SCOPE.pageDoc,
        {
            attributes: false,
            childList: true,
            characterData: false,
            subtree: true
        }
    );

    return this.dom.domObject;
}
/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.Chart.prototype.renderChart = function () {

    this.dom.canvasObject = XDOM.createElement('canvas', this.id, null);
    this.dom.chartLegend = XDOM.createElement('DIV', null, "lineLegend");

    this.dom.domObject.appendChild(this.dom.canvasObject);
    this.dom.domObject.appendChild(this.dom.chartLegend);



};

// Removed, not needed
GUI.Chart.prototype.afterAppend = function () {};

// Set container sizes
GUI.Chart.prototype.setContainerSizes = function () {

    if (this.xSize != "auto"){
        this.dom.domObject.style.width = (this.xSize * 9) + "px";
        this.dom.canvasObject.style.width = (this.xSize * 9) + "px";
        this.dom.canvasObject.width = (this.xSize * 9);
    }

    // if (this.ySize != "auto"){
    //     this.dom.domObject.style.height = (this.parentObject.sizes.lineHeightPx * this.ySize) + "px";
    //     this.dom.canvasObject.style.height = (this.parentObject.sizes.lineHeightPx * this.ySize - 5) + "px";
    //     this.dom.canvasObject.height = (this.parentObject.sizes.lineHeightPx * this.ySize - 5);
    // }
    this.dom.canvasObject.style.height = '100%';
    // this.dom.canvasObject.height = '100%';
};

GUI.Chart.prototype.resetChart = function () {
    //verwijder all dom objecten
    // XDOM.removeDOMObject(this.dom.domObject);
    XDOM.removeDOMObject(this.dom.canvasObject);
    XDOM.removeDOMObject(this.dom.chartLegend);
    this.renderChart()
    this.updateded = false;






};

/**
 * @override GuiBaseObject
 */
GUI.Chart.prototype.updateState = function () {
    var fieldValue = '';
    var colorPicker = 0;
    var maxColors = 4; // is 5 colors starting with zero
    var dataSet = {};
    var dataArray = [];
    var colorObj = null;

    this.base(GUI.Chart, 'updateState');
    this.resetChart();

    var barChartData = {};

    // Structure the bar chart data
    barChartData.labels = [];
    barChartData.datasets = [];

    // Format the labels

    for (var i = 0, l = this.labels.length; i < l; i++) {
        fieldValue = this.labels[i];
        barChartData.labels.push(this.currentData[fieldValue]);
    }

    for (var i = 0, l = this.dataFields.length; i < l; i++) {
        var data = [];
        for (var a = 0, b = this.dataFields[i].length; a < b; a++) {
            fieldValue = this.dataFields[i][a];
            data.push(this.currentData[fieldValue]);
        }

        if (MAIN.NAV.Session.currentInstance.skinColor && GUI.Chart.Config.chartColors[MAIN.NAV.Session.currentInstance.skinColor + "_" + colorPicker]) {
            //use a spread to create a new object and not passing the reference
            colorObj = {...GUI.Chart.Config.chartColors[MAIN.NAV.Session.currentInstance.skinColor + "_" + colorPicker]};
        } else {
            //default color
            //use a spread to create a new object and not passing the reference
            colorObj = {...GUI.Chart.Config.chartColors["BLUE_" + colorPicker]};
        }

        barChartData.datasets[i] = colorObj;
        barChartData.datasets[i].data = data;
        barChartData.datasets[i].label = this.currentData[this.legend[i]];

        if (colorPicker < maxColors) {
            colorPicker++;
            continue;
        }

        colorPicker = 0;
        continue;
    }

    // @GSC Don't thin we need the legend anymore
    // legend(this.dom.chartLegend, barChartData);

    // Pull the type from the obfuscation
    const type = this.chartType.replace('*V', '').toLowerCase();

    // Create the chart
    this.chartObject = new window.SCOPE.session.Chart(
        this.dom.canvasObject.getContext("2d"),
        {
            type: type,
            data: barChartData,
            options: {
                responsive: true,
                maintainAspectRatio:false
            }
        }
    );
    this.setContainerSizes();
};


GUI.Chart.Config = {};

//chartColors[ENUM.skin.blue] = [colors.1,colors.2],colors.0;

GUI.Chart.Config.chartColors = [];

GUI.Chart.Config.chartColors["GREY_0"] = {
    backgroundColor: "rgba(0,0,0,1)",
    borderColor: "rgba(122,122,122,1)",
    hoverBackgroundColor: "rgba(0,0,0,1)",
    hoverBorderColor: "rgba(122,122,122,1)"
};
GUI.Chart.Config.chartColors["GREY_1"] = {
    backgroundColor: "rgba(58,58,58,1)",
    borderColor: "rgba(122,122,122,1)",
    hoverBackgroundColor: "rgba(58,58,58,1)",
    hoverBorderColor: "rgba(122,122,122,1)"
};
GUI.Chart.Config.chartColors["GREY_2"] = {
    backgroundColor: "rgba(123,123,123,1)",
    borderColor: "rgba(122,122,122,1)",
    hoverBackgroundColor: "rgba(123,123,123,1)",
    hoverBorderColor: "rgba(122,122,122,1)"
};
GUI.Chart.Config.chartColors["GREY_3"] = {
    backgroundColor: "rgba(233,233,233,1)",
    borderColor: "rgba(122,122,122,1)",
    hoverBackgroundColor: "rgba(233,233,233,1)",
    hoverBorderColor: "rgba(122,122,122,1)"
};
GUI.Chart.Config.chartColors["GREY_4"] = {
    backgroundColor: "rgba(255,255,255,1)",
    borderColor: "rgba(122,122,122,1)",
    hoverBackgroundColor: "rgba(255,255,255,1)",
    hoverBorderColor: "rgba(122,122,122,1)"
};

GUI.Chart.Config.chartColors["BLUE_0"] = {
    backgroundColor: "rgba(0,167,255,1)",
    borderColor: "rgba(0,96,147,1)",
    hoverBackgroundColor: "rgba(0,167,255,1)",
    hoverBorderColor: "rgba(0,96,147,1)"
};
GUI.Chart.Config.chartColors["BLUE_1"] = {
    backgroundColor: "rgba(0,125,192,1)",
    borderColor: "rgba(0,96,147,1)",
    hoverBackgroundColor: "rgba(0,125,192,1)",
    hoverBorderColor: "rgba(0,96,147,1)"
};
GUI.Chart.Config.chartColors["BLUE_2"] = {
    backgroundColor: "rgba(0,96,147,1)",
    borderColor: "rgba(0,96,147,1)",
    hoverBackgroundColor: "rgba(0,96,147,1)",
    hoverBorderColor: "rgba(0,96,147,1)"
};
GUI.Chart.Config.chartColors["BLUE_3"] = {
    backgroundColor: "rgba(0,60,92,1)",
    borderColor: "rgba(0,96,147,1)",
    hoverBackgroundColor: "rgba(0,60,92,1)",
    hoverBorderColor: "rgba(0,96,147,1)"
};
GUI.Chart.Config.chartColors["BLUE_4"] = {
    backgroundColor: "rgba(0,22,34,1)",
    borderColor: "rgba(0,96,147,1)",
    hoverBackgroundColor: "rgba(0,22,34,1)",
    hoverBorderColor: "rgba(0,96,147,1)"
};

GUI.Chart.Config.chartColors["AQUA_0"] = {
    backgroundColor: "rgba(0,72,83,1)",
    borderColor: "rgba(0,129,149,1)",
    hoverBackgroundColor: "rgba(0,72,83,1)",
    hoverBorderColor: "rgba(0,129,149,1)"
};
GUI.Chart.Config.chartColors["AQUA_1"] = {
    backgroundColor: "rgba(0,110,127,1)",
    borderColor: "rgba(0,129,149,1)",
    hoverBackgroundColor: "rgba(0,110,127,1)",
    hoverBorderColor: "rgba(0,129,149,1)"
};
GUI.Chart.Config.chartColors["AQUA_2"] = {
    backgroundColor: "rgba(0,129,149,1)",
    borderColor: "rgba(0,129,149,1)",
    hoverBackgroundColor: "rgba(0,129,149,1)",
    hoverBorderColor: "rgba(0,129,149,1)"
};
GUI.Chart.Config.chartColors["AQUA_3"] = {
    backgroundColor: "rgba(0,163,188,1)",
    borderColor: "rgba(0,129,149,1)",
    hoverBackgroundColor: "rgba(0,163,188,1)",
    hoverBorderColor: "rgba(0,129,149,1)"
};
GUI.Chart.Config.chartColors["AQUA_4"] = {
    backgroundColor: "rgba(0,198,229,1)",
    borderColor: "rgba(0,129,149,1)",
    hoverBackgroundColor: "rgba(0,198,229,1)",
    hoverBorderColor: "rgba(0,129,149,1)"
};

GUI.Chart.Config.chartColors["GREEN_0"] = {
    backgroundColor: "rgba(53,111,0,1)",
    borderColor: "rgba(86,181,0,1)",
    hoverBackgroundColor: "rgba(53,111,0,1)",
    hoverBorderColor: "rgba(86,181,0,1)"
};
GUI.Chart.Config.chartColors["GREEN_1"] = {
    backgroundColor: "rgba(68,143,0,1)",
    borderColor: "rgba(86,181,0,1)",
    hoverBackgroundColor: "rgba(68,143,0,1)",
    hoverBorderColor: "rgba(86,181,0,1)"
};
GUI.Chart.Config.chartColors["GREEN_2"] = {
    backgroundColor: "rgba(86,181,0,1)",
    borderColor: "rgba(86,181,0,1)",
    hoverBackgroundColor: "rgba(86,181,0,1)",
    hoverBorderColor: "rgba(86,181,0,1)"
};
GUI.Chart.Config.chartColors["GREEN_3"] = {
    backgroundColor: "rgba(105,220,0,1)",
    borderColor: "rgba(86,181,0,1)",
    hoverBackgroundColor: "rgba(105,220,0,1)",
    hoverBorderColor: "rgba(86,181,0,1)"
};
GUI.Chart.Config.chartColors["GREEN_4"] = {
    backgroundColor: "rgba(122,255,0,1)",
    borderColor: "rgba(86,181,0,1)",
    hoverBackgroundColor: "rgba(122,255,0,1)",
    hoverBorderColor: "rgba(86,181,0,1)"
};

GUI.Chart.Config.chartColors["ORANGE_0"] = {
    backgroundColor: "rgba(123,66,0,1)",
    borderColor: "rgba(209,112,0,1)",
    hoverBackgroundColor: "rgba(123,66,0,1)",
    hoverBorderColor: "rgba(209,112,0,1)"
};
GUI.Chart.Config.chartColors["ORANGE_1"] = {
    backgroundColor: "rgba(160,86,0,1)",
    borderColor: "rgba(209,112,0,1)",
    hoverBackgroundColor: "rgba(160,86,0,1)",
    hoverBorderColor: "rgba(209,112,0,1)"
};
GUI.Chart.Config.chartColors["ORANGE_2"] = {
    backgroundColor: "rgba(209,112,0,1)",
    borderColor: "rgba(209,112,0,1)",
    hoverBackgroundColor: "rgba(209,112,0,1)",
    hoverBorderColor: "rgba(209,112,0,1)"
};
GUI.Chart.Config.chartColors["ORANGE_3"] = {
    backgroundColor: "rgba(255,144,0,1)",
    borderColor: "rgba(209,112,0,1)",
    hoverBackgroundColor: "rgba(255,144,0,1)",
    hoverBorderColor: "rgba(209,112,0,1)"
};
GUI.Chart.Config.chartColors["ORANGE_4"] = {
    backgroundColor: "rgba(255,188,60,1)",
    borderColor: "rgba(209,112,0,1)",
    hoverBackgroundColor: "rgba(255,188,0,1)",
    hoverBorderColor: "rgba(209,112,0,1)"
};

GUI.Chart.Config.chartColors["RED_0"] = {
    backgroundColor: "rgba(132,0,5,1)",
    borderColor: "rgba(223,0,9,1)",
    hoverBackgroundColor: "rgba(132,0,5,1)",
    hoverBorderColor: "rgba(223,0,9,1)"
};
GUI.Chart.Config.chartColors["RED_1"] = {
    backgroundColor: "rgba(180,0,7,1)",
    borderColor: "rgba(223,0,9,1)",
    hoverBackgroundColor: "rgba(180,0,7,1)",
    hoverBorderColor: "rgba(223,0,9,1)"
};
GUI.Chart.Config.chartColors["RED_2"] = {
    backgroundColor: "rgba(223,0,9,1)",
    borderColor: "rgba(223,0,9,1)",
    hoverBackgroundColor: "rgba(223,0,9,1)",
    hoverBorderColor: "rgba(223,0,9,1)"
};
GUI.Chart.Config.chartColors["RED_3"] = {
    backgroundColor: "rgba(247,2,12,1)",
    borderColor: "rgba(223,0,9,1)",
    hoverBackgroundColor: "rgba(247,2,12,1)",
    hoverBorderColor: "rgba(223,0,9,1)"
};
GUI.Chart.Config.chartColors["RED_4"] = {
    backgroundColor: "rgba(254,71,78,1)",
    borderColor: "rgba(223,0,9,1)",
    hoverBackgroundColor: "rgba(254,71,78,1)",
    hoverBorderColor: "rgba(223,0,9,1)"
};

GUI.Chart.Config.chartColors["PURPLE_0"] = {
    backgroundColor: "rgba(49,0,83,1)",
    borderColor: "rgba(107,0,178,1)",
    hoverBackgroundColor: "rgba(49,0,83,1)",
    hoverBorderColor: "rgba(107,0,178,1)"
};
GUI.Chart.Config.chartColors["PURPLE_1"] = {
    backgroundColor: "rgba(81,0,135,1)",
    borderColor: "rgba(107,0,178,1)",
    hoverBackgroundColor: "rgba(81,0,135,1)",
    hoverBorderColor: "rgba(107,0,178,1)"
};
GUI.Chart.Config.chartColors["PURPLE_2"] = {
    backgroundColor: "rgba(107,0,178,1)",
    borderColor: "rgba(107,0,178,1)",
    hoverBackgroundColor: "rgba(107,0,178,1)",
    hoverBorderColor: "rgba(107,0,178,1)"
};
GUI.Chart.Config.chartColors["PURPLE_3"] = {
    backgroundColor: "rgba(130,0,216,1)",
    borderColor: "rgba(107,0,178,1)",
    hoverBackgroundColor: "rgba(130,0,216,1)",
    hoverBorderColor: "rgba(107,0,178,1)"
};
GUI.Chart.Config.chartColors["PURPLE_4"] = {
    backgroundColor: "rgba(171,45,255,1)",
    borderColor: "rgba(107,0,178,1)",
    hoverBackgroundColor: "rgba(171,45,255,1)",
    hoverBorderColor: "rgba(107,0,178,1)"
};

GUI.Chart.Config.chartColors["PINK_0"] = {
    backgroundColor: "rgba(134,0,71,1)",
    borderColor: "rgba(219,0,116,1)",
    hoverBackgroundColor: "rgba(134,0,71,1)",
    hoverBorderColor: "rgba(219,0,116,1)"
};
GUI.Chart.Config.chartColors["PINK_1"] = {
    backgroundColor: "rgba(160,0,85,1)",
    borderColor: "rgba(219,0,116,1)",
    hoverBackgroundColor: "rgba(160,0,85,1)",
    hoverBorderColor: "rgba(219,0,116,1)"
};
GUI.Chart.Config.chartColors["PINK_2"] = {
    backgroundColor: "rgba(219,0,116,1)",
    borderColor: "rgba(219,0,116,1)",
    hoverBackgroundColor: "rgba(219,0,116,1)",
    hoverBorderColor: "rgba(219,0,116,1)"
};
GUI.Chart.Config.chartColors["PINK_3"] = {
    backgroundColor: "rgba(255,0,135,1)",
    borderColor: "rgba(219,0,116,1)",
    hoverBackgroundColor: "rgba(255,0,135,1)",
    hoverBorderColor: "rgba(219,0,116,1)"
};
GUI.Chart.Config.chartColors["PINK_4"] = {
    backgroundColor: "rgba(255,100,182,1)",
    borderColor: "rgba(219,0,116,1)",
    hoverBackgroundColor: "rgba(255,100,182,1)",
    hoverBorderColor: "rgba(219,0,116,1)"
};


XDOM.extendObject(GUI.Chart.Config, GUI.Chart);
