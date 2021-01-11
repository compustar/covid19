dateFormatter = {
    from: function(value) {
        return new Date(value.getYear() + "-" + value.getMonth() + "-" + value.getDate());
    },
    to: function(value) {
        return new Date(value).toLocaleDateString("zh-HK", {dateStyle: "short"});
    }
}

function ChartController(chartElement, chart, data, viewFactory) {
    var view = data;
    if (!!viewFactory) {
        view = viewFactory(data);
    }
    var controller = this;

    this.options = {
        chartArea: {
            left:50,
            right:10, // !!! works !!!
            bottom:50,  // !!! works !!!
            top:50,
            width:"100%",
            height:"100%"
        },
        legend: { position: 'bottom' },
        animation: {
            duration: 500,
            easing: "out"
        },
        hAxis:{
            format: 'd MMM yyyy',
            viewWindow: {
                min: new Date(2020, 6, 5)
            }
        },
        vAxis: {
            viewWindow: {
                min: 0
            }
        }
    };
    this.redraw = function (newData) {
        if (newData) {
            view = newData;
            if (!!viewFactory) {
                view = viewFactory(newData);
            }
        }
        chart.draw(view, this.options);
    }

    this.initSlider = function (sliderElementId, sliderInited){
        var dateSlider = document.getElementById(sliderElementId);
        if (!!!sliderInited) {
            start = data.getValue(0,0).getTime();
            end = data.getValue(data.getNumberOfRows() - 1,0).getTime()
            noUiSlider.create(dateSlider, {
            // Create two timestamps to define a range.
                range: {
                    min: start,
                    max: end
                },

            // Steps of one day
                step: 24 * 60 * 60 * 1000,

            // Two more timestamps indicate the handle starting positions.
                start: [start, end],

                tooltips: [dateFormatter, dateFormatter],

            // No decimals
                format: wNumb({
                    decimals: 0
                })
            });
        }
        dateSlider.noUiSlider.on('set', function (values, handle) {
            controller.options.hAxis.viewWindow.min = new Date(parseInt(values[0]));
            controller.options.hAxis.viewWindow.max = new Date(parseInt(values[1]));
            controller.redraw();
        });
    }

    this.getImageURI = function () {
        return chart.getImageURI();
    }

    chartElement.addEventListener('dblclick', function(e){
        var img = controller.getImageURI();
        SimpleLightbox.open({
            items: [img]
        });

    });

}

ChartController.initedSliders = {}
ChartController.create = function (parameters) {
    var controller = parameters.factory(parameters.data, parameters.containerId);
    var sliderId = parameters.sliderId;
    if (sliderId) {
        if (ChartController.initedSliders[sliderId]) {
            controller.initSlider(sliderId, true);
        } else {
            controller.initSlider(sliderId);
            ChartController.initedSliders[sliderId] = true;
        }
    }
    return controller;
}

function prepareData(response) {
    var result = {};
    data = response.getDataTable();
    data.addAverage(1, 7, "7d_actual_avg");
    data.addAverage(2, 7, "7d_unlinked_avg");
    last = data.getNumberOfRows();
    addPredictedValues(data, 1, "predicted", 16, 26, 84);
    addPredictedValues(data, 1, "predicted", 140, 160, last);
    addPredictedValues(data, 2, "predicted_unlinked", 16, 26, 84);
    addPredictedValues(data, 2, "predicted_unlinked", 140, 160, last);
    result.base = data;

    return result;
}

function prepareConfirmedChart(data, elementId){
    var chartElement = document.getElementById(elementId);
    var chart = new google.visualization.ComboChart(chartElement);
    controller = new ChartController(chartElement, chart, data, function(data){ 
        var view = new google.visualization.DataView(data);
        view.hideColumns([3,4]);
        return view;
    });
    controller.options.title = '\u672c\u5730\u500b\u6848';
    controller.options.curveType = 'function';
    controller.options.chartArea.right = 130;
    controller.options.legend.position = "right"
    controller.options.legend.textStyle = {
        fontSize: 9
      };
    controller.options.series = {
        2: { lineDashStyle: [10, 2] },
        3: { lineDashStyle: [10, 2] },
        4: { lineDashStyle: [2, 2] },
        5: { lineDashStyle: [2, 2] },
        6: { lineDashStyle: [2, 2] },
        7: { lineDashStyle: [2, 2] },
    };
    
    controller.redraw();
    return controller;
}

function preparePrelimChart(data, elementId){
    var chartElement = document.getElementById(elementId);
    var chart = new google.visualization.ComboChart(chartElement);
    var controller = new ChartController(chartElement, chart, data, function(data){ 
        var view = new google.visualization.DataView(data);
        view.hideColumns([1,2,5,6,7,8,9,10])
        return view;
    });
    controller.options.title = '\u521d\u6b65\u53ca\u5448\u5831';
    controller.options.curveType = 'function';

    controller.redraw();
    return controller;
}

function prepareUnlinkedRatioChart(data, elementId){
    var dt = new google.visualization.DataTable();
    dt.addColumn('date', 'Date');
    dt.addColumn('number', 'Ratio');
    var rows = data.getNumberOfRows();
    for (var i = 0; i < rows; i++) {
        if (data.getValue(i, 1)) {
            var date = data.getValue(i, 0);
            var ratio = data.getValue(i, 2) / data.getValue(i, 1);
            dt.addRow([date, ratio])
        }
    }
    var formatter = new google.visualization.NumberFormat({pattern: '#%'});
    formatter.format(dt, 1);
    var chartElement = document.getElementById(elementId);
    var chart = new google.visualization.ComboChart(chartElement);
    var controller = new ChartController(chartElement, chart, dt);

    controller.options.title = '\u0055\u006e\u006c\u0069\u006e\u006b\u0065\u0064\u6bd4\u4f8b';
    controller.options.vAxis.viewWindow.max = 1
    controller.options.vAxis.format = 'percent'
    controller.options.legend = 'none';

    controller.redraw();
    return controller;
}

function prepareRtChart(data, elementId){
    var json = JSON.parse(data.toJSON());
    
    json.cols[2].role = 'interval';
    json.cols[3].role = 'interval';
    var dt = new google.visualization.DataTable(json);
    var dv = new google.visualization.DataView(dt);
    dv.setColumns([0,{
        type: 'number',
        calc: function () {
            return 1;
        }},1,2,3
    ])
    var chartElement = document.getElementById(elementId);
    var chart = new google.visualization.LineChart(chartElement);
    var controller = new ChartController(chartElement, chart, dv);

    controller.options.title = 'Effective Production Rate (Rt)';
    controller.options.intervals = { 'style':'area' };
    controller.options.legend = 'none';
    controller.options.series = {
        0: { lineDashStyle: [10, 2] }
    };
    controller.redraw();
    return controller;
}

function prepareDistrictChart(data, elementId){
    var json = JSON.parse(data.toJSON());
    
    json.cols[0].role = 'annotation';    

    var dt = new google.visualization.DataTable(json);
    var dv = new google.visualization.DataView(dt);
    dv.setColumns([1, 5, 0, 2, 3, 4])
    var chartElement = document.getElementById(elementId);
    var chart = new google.visualization.ScatterChart(chartElement);
    var controller = new ChartController(chartElement, chart, dv);

    controller.options.title = '\u904e\u53bb\u0031\u0034\u65e5\u78ba\u8a3a\u8005\u6240\u4f4f\u5730\u5340';
    controller.options.trendlines = { 0: {opacity: 0.2} }
    controller.options.hAxis = {title: '\u4eba\u53e3\u5bc6\u5ea6\u0020\u0028\u6bcf\u5e73\u65b9\u516c\u91cc\u0029'};
    controller.redraw();
    return controller;
}
