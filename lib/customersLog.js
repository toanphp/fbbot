var customers = {};
var day = 86400000; // 1 day = 86400000 miliseconds



exports.taoLichKham = function(id, field, callback=function(){}) {
    if(typeof customers[id]["datlich"] == 'undefined' ) {
        if(field=="init") customers[id]["datlich"] = {};
        // customers[id]["datlich"]["duration"] = '';
    } else {
        if(field=="duration" && typeof customers[id]["datlich"]["duration"]=="undefined") {
            customers[id]["datlich"]["duration"] = "";
            callback(true);
        } else if(field=="duration" && customers[id]["datlich"]["duration"]=="") {
            callback(true);
        } else if(customers[id]["datlich"]["duration"]!=''){
            if(field=="name" && typeof customers[id]["datlich"]["name"]=="undefined") {
                customers[id]["datlich"]["name"] = "";
                callback(false);
            } else if(field=="name" && customers[id]["datlich"]["name"]=="") {
                callback(true);
            } else if(customers[id]["datlich"]["name"]!=""){
                if(field=="place" && typeof customers[id]["datlich"]["place"]=="undefined") {
                    customers[id]["datlich"]["place"] = "";
                    callback(false);
                } else if(field=="place" && customers[id]["datlich"]["place"]=="") {
                    callback(true);
                } else if(customers[id]["datlich"]["place"]!=''){
                    if(field=="date" && typeof customers[id]["datlich"]["date"]=="undefined") {
                        customers[id]["datlich"]["date"] = "";
                        callback(false);
                    } else if(field=="date" && customers[id]["datlich"]["date"]=="") {
                        callback(true);
                    } else if(customers[id]["datlich"]["date"]!=""){
                        if(field=="time" && typeof customers[id]["datlich"]["time"]=="undefined") {
                            customers[id]["datlich"]["time"] = "";
                            callback(false);
                        } else if(field=="time" && customers[id]["datlich"]["time"]=="") {
                            callback(true);
                        } else {
                            // do something
                        }
                    }
                }
            }
            
        }
        
    }
    
    
    

}

exports.dienThongTinLichKham = function(id, field, data, callback=function(){}) {
    if(typeof customers[id] != 'undefined' &&
        typeof customers[id]["datlich"] != 'undefined') {
            customers[id]["datlich"][field] = data;
            callback(true);
    } 
    else {
        callback(false);
    }
    
}

exports.huyDatLich = function(id) {
    delete customers[id]["datlich"];
}

exports.log = function(id, timestamp, callback) {
    if (typeof customers[id] == 'undefined') {
        customers[id] = {};
        customers[id]["lastTime"] = timestamp;
        callback();
    }
    customers[id]["lastTime"] = timestamp;
}

exports.del = function() {
    setInterval(function(){
        var keys = Object.keys(customers);
        for(var key of keys) {
            if(customers[key]["lastTime"] + day <= Date.now()) {
                delete customers[key];
            }
        }
    }, 1000);
}

exports.getInfo = function(id=null) {
    if(id==null) {
        return customers;
    } else {
        return customers[id];
    }
    
}

