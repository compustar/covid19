Date.prototype.addDays = function(days) {
    var result = new Date(this);
    result.setDate(this.getDate() + parseInt(days));
    return result;
};

Date.prototype.removeTime = function() {
    var result = new Date(this.getFullYear(), this.getMonth(), this.getDate());
    return result;
};

Array.prototype.getAverage = function (days) {
    return getAverage(this, days);
}

function getAverage(data, data_col, days){

    if (arguments.length == 2) {
        days = data_col;
        n = data.length;
        getValue = function(i) { return data[i]; }
    } else {
        n = data.getNumberOfRows();
        getValue = function(i) { return data.getValue(i, data_col); }
    }

    var result = [];
    var sum_7d = 0;
    for (var i = 0; i < days; i++) {
        sum_7d += getValue(i);
        result.push(null);
    }
    result[days - 1] = sum_7d/days;
    for (var i = days; i < n; i++) {
        sum_7d = sum_7d - getValue(i - days) + getValue(i);
        result.push(sum_7d/days);
    }
    return result;
}
