var fs = require('fs');


exports.log = function(id, timestamp, message){
    fs.readFile(__dirname + '/../data/messages.json', 'utf8', (err, data) => {
        if(err) {
            throw err;
        }
        data = JSON.parse(data);
        if(!data[id]) {
            data[id] = {}; 
        }
        data[id][timestamp] = message;
        data = JSON.stringify(data);
        fs.writeFile(__dirname + '/../data/messages.json', data, 'utf8', (err) => {
            if(err) throw err;
            console.log("MESSAGE HAS BEEN SAVED");
        });
    });
}

/**
 * id: id của khách hàng 
 * duration: khoảng thời gian cần lấy tin nhắn (timestamp)
 */
exports.get = function(id, duration, callback) {
    fs.readFile(__dirname + '/../data/messages.json', 'utf8', (err, data) => {
        if(err) throw err;
        var result = "";
        var dataJSON = JSON.parse(data);
        for(var key in dataJSON[id]) {
            if(parseInt(key) + duration <= Date.now()) {
                result += dataJSON[id][key] + " ";
            }
        }
        callback(result);
    });
}