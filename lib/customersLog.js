

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


exports.taoLichKham2 = function(id, field) {
    if(typeof customers[id]["datlich"] == 'undefined' ) {
        if(field=="init") customers[id]["datlich"] = {};
    } else {
        if(field=="duration" && typeof customers[id]["datlich"]["duration"]=="undefined") {
            customers[id]["datlich"]["duration"] = "";
            return true;
        } else if(field=="duration" && customers[id]["datlich"]["duration"]=="") {
            return true;
        } else if(customers[id]["datlich"]["duration"]!=''){
            if(field=="name" && typeof customers[id]["datlich"]["name"]=="undefined") {
                customers[id]["datlich"]["name"] = "";
                return false;
            } else if(field=="name" && customers[id]["datlich"]["name"]=="") {
                return true;
            } else if(customers[id]["datlich"]["name"]!=""){
                if(field=="place" && typeof customers[id]["datlich"]["place"]=="undefined") {
                    customers[id]["datlich"]["place"] = "";
                    return false;
                } else if(field=="place" && customers[id]["datlich"]["place"]=="") {
                    return true;
                } else if(customers[id]["datlich"]["place"]!=''){
                    if(field=="date" && typeof customers[id]["datlich"]["date"]=="undefined") {
                        customers[id]["datlich"]["date"] = "";
                        return false;
                    } else if(field=="date" && customers[id]["datlich"]["date"]=="") {
                        return true;
                    } else if(customers[id]["datlich"]["date"]!=""){
                        if(field=="time" && typeof customers[id]["datlich"]["time"]=="undefined") {
                            customers[id]["datlich"]["time"] = "";
                            return false;
                        } else if(field=="time" && customers[id]["datlich"]["time"]=="") {
                            return true;
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
            if(customers[id]["datlich"][field]!="") {
                callback(true);
            } else {
                callback(false);
            }
    } 
    else {
        callback(false);
    }
    
}

/**
 * 
 */
exports.huyDatLich = function(id, callback=function(){}) {
    delete customers[id]["datlich"];
    if(typeof customers[id]["datlich"] == "undefined") {
        callback(true);
    } else {
        callback(false);
    }
}

exports.lanTruyCapCuoi = function(id, timestamp, callback) {
    if (typeof customers[id] == 'undefined') {
        customers[id] = {};
        customers[id]["lastTime"] = timestamp;
        callback();
    }
    customers[id]["lastTime"] = timestamp;
}

/**
 * Xóa bản ghi quá 1 khoảng thời gian
 * duration: timestamp in milisecond
 */
exports.cronJob = function(remindTime, deleteTime, callback=function(){}) {
    setInterval(function(){
        var keys = Object.keys(customers);
        for(var key of keys) {
            if(customers[key]["lastTime"] + deleteTime <= Date.now()) {
                delete customers[key];
            } else if(typeof customers[key]["datlich"] != 'undefined' 
                        && (customers[key]["datlich"] != {} || Object.values(customers[key]["datlich"]).indexOf("")>-1)
                            && customers[key]["lastTime"] + remindTime >= Date.now()
                                && customers[key]["lastTime"] + remindTime < Date.now() + 1000) {
                callback(key);
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


exports.del = function(id, field){
    // xóa trường cần đổi
    delete customers[id]["datlich"][field];
    // xóa trường cuối cùng
    if(customers[id]["datlich"][Object.keys(customers[id]["datlich"])[Object.keys(customers[id]["datlich"]).length-1]]==""){
        delete customers[id]["datlich"][Object.keys(customers[id]["datlich"])[Object.keys(customers[id]["datlich"]).length-1]];
    }
}




