var fs = require('fs');

// // async log
// exports.log = function(id, timestamp, message){
//     fs.readFile(__dirname + '/../data/messages.json', 'utf8', (err, data) => {
//         if(err) {
//             throw err;
//         }
//         data = JSON.parse(data);
//         if(!data[id]) {
//             data[id] = {}; 
//         }
//         data[id][timestamp] = message;
//         data = JSON.stringify(data);
//         fs.writeFile(__dirname + '/../data/messages.json', data, 'utf8', (err) => {
//             if(err) {
//                 throw err;
//             } else {
//                 console.log("MESSAGE HAS BEEN SAVED");
//             }
            
//         });
//     });
// }

// sync log
exports.log = async function(id, timestamp, message){
    var data = await fs.readFileSync(__dirname + '/../data/messages.json', 'utf8');
        
    data = JSON.parse(data);
    if(!data[id]) {
        data[id] = {}; 
    }
    data[id][timestamp] = message;
    data = JSON.stringify(data);

    await fs.writeFileSync(__dirname + '/../data/messages.json', data, 'utf8');
            
    console.log("MESSAGE HAS BEEN SAVED");    
        
    
}

/**
 * id: id của khách hàng 
 * duration: khoảng thời gian cần lấy tin nhắn (timestamp)
 */
exports.get = async function(id, duration) {
    var result;
    var data = await fs.readFileSync(__dirname + '/../data/messages.json', 'utf8');
    if(data) {
        var dataJSON = JSON.parse(data);
        for(var key in dataJSON[id]) {
            if(parseInt(key) + duration >= Date.now()) {
                result += dataJSON[id][key] + " ";
            }
        }
    } else {
        throw new Error("không đọc được file");
    }
    
    return result;



    // fs.readFile(__dirname + '/../data/messages.json', 'utf8', (err, data) => {
    //     if(err) throw err;
    //     var result = "";
    //     var dataJSON = JSON.parse(data);
    //     for(var key in dataJSON[id]) {
    //         if(parseInt(key) + duration <= Date.now()) {
    //             result += dataJSON[id][key] + " ";
    //         }
    //     }
    //     return result;
    // });

    
}