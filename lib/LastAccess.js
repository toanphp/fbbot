var customers = {};
var day = 86400000; // 1 day = 86400000 miliseconds


var logFunc = {
    find: function(id, callback) {
        //do something
    },
    log: function(id, timestamp, callback) {
        if (typeof customers.id == 'undefined') {
            customers.id = timestamp;
            callback();
        }
        customers.id = timestamp;
    }, 
    del: function() {
        setInterval(function(){
            var keys = Object.keys(customers);
            for(var key of keys) {
                if(customers[key] + day <= Date.now()) {
                    delete customers[key];
                }
            }
        }, 1000);
    }
};

module.exports = {
    lastAccess: function() {
        return logFunc;
    }
};