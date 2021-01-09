function LogModel(values, start, end) {
    var data = [];
    for (var i = start; i < Math.min(values.length, end); i++) {
        data.push([i - start, Math.log(values[i] + 1)])
    }

    const myRegression = regression.polynomial(data, {
        order: 2,
        precision: 4
    });

    this.r2 = myRegression.r2;

    this.rmse = 0;
    n = myRegression.points.length;
    for (var i = 0; i < n; i++) {
        var e = values[i + start] - Math.exp(Math.log(myRegression.points[i][1]) - 1);
        this.rmse += e**2;
    }
    this.rmse = Math.sqrt(this.rmse / n);

    this.predict = function (a, b) {
        var result = [];
        for (var i = a; i <= b; i++) {
            result.push(Math.exp(myRegression.predict(i)[1]) - 1);
        }
        return result;
    }
}

function RatioModel(values, start, end) {
    var data = [];
    values = values.getAverage(7)
    for (var i = start; i < Math.min(values.length, end); i++) {
        data.push([i - start, values[i]/values[i-1]])
    }

    const myRegression = regression.linear(data, { precision: 4 });

    this.r2 = myRegression.r2;

    this.rmse = 0;
    n = myRegression.points.length;
    var last = values[start - 4];
    for (var i = 0; i < n; i++) {
        var value = myRegression.points[i][1] * last;
        var e = values[i + start] - value;
        last = value;
        this.rmse += e**2;
    }
    this.rmse = Math.sqrt(this.rmse / n);

    this.predict = function (a, b) {
        var result = [];
        var lastValue = values[a + start - 4]
        for (var i = a; i <= b; i++) {
            var value = myRegression.predict(i)[1] * lastValue;
            result.push(value);
            lastValue = value
        }
        return result;
    }

}