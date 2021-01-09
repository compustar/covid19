function initExtensions(){
    google.visualization.DataTable.prototype.getValues = function (col) {
        var n = this.getNumberOfRows();
        var result = [];
        for (var i = 0; i < n; i++) {
            result.push(this.getValue(i, col));
        }
        return result;
    };
    
    google.visualization.DataTable.prototype.setValues = function (col, start, values, rowFactory) {
        var rows = data.getNumberOfRows();
        for (var i = 0; i < values.length; i++) {
            if (start + i >= rows) {
                this.addRow(rowFactory.newRow(this));
            }
            this.setValue(start + i, col, values[i]);
        }
    }

    google.visualization.DataTable.prototype.getAverage = function (data_col, days) {
        return getAverage(this, data_col, days);
    }

    google.visualization.DataTable.prototype.addAverage = function (data_col, days, columnName){
        var values = this.getAverage(data_col, days);
    
        var col = this.addColumn("number", columnName);
        this.setValues(col, 0, values);
    }

    google.visualization.DataTable.prototype.getColumnIndices = function () {
        var result = {};
        for (var i = 0, cols = data.getNumberOfColumns(); i < cols; i++) {
            result[this.getColumnLabel(i)] = i;
        }
        return result;
    }
}

function RowFactory() {
    this.newRow = function (data) {
        var cols = data.getNumberOfColumns();
        var rows = data.getNumberOfRows();
        var row = [];
        for (var j = 0; j < cols; j++) {
            row.push(null);
        }
        lastDate = data.getValue(rows - 1, 0);
        row[0] = lastDate.addDays(1);
        return row;
    }
}