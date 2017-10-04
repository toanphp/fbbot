
// Facebook chat bot
var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var router = express();
var fs = require('fs');
var customersLog = require('./lib/customersLog.js');
var language = require('cld');
var lngDetector = new (require('languagedetect'));
var send = require('./lib/send.js');
var database = require('./lib/database.js');
var calendar = require('./lib/calendar.js');

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
var server = http.createServer(app);
// var request = require("request");

// tự động xóa khách đã chat quá 1 ngày 
customersLog.del();

app.get('/', function(req, res) {
  res.send("Home page. Server running okay.1313213");
});

// Đây là đoạn code để tạo Webhook
app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === 'ma_xac_minh_cua_ban') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

// Xử lý khi có người nhắn tin cho bot
app.post('/webhook', function(req, res) {
  var entries = req.body.entry;
  console.log('entries', entries);
  if(typeof entries !== 'undefined') {
    for (var entry of entries) {
      var messaging = entry.messaging;
      console.log('messaging', messaging);
      if(typeof messaging !== 'undefined') {
        for (var message of messaging) {
          var senderId = message.sender.id;
          var timestamp = message.timestamp;


          // welcome
          customersLog.log(senderId, timestamp, function() {
            var chooseChatType= [
              {
                type:"postback",
                title:"Đặt Lịch Khám",
                payload:"DATLICHKHAM"
              },
              {
                type:"postback",
                title:"Tiếp tục chat",
                payload:"CHATVSSOC"
              }
            ];
            send.sendButton(senderId, "Chào mừng bạn đến với SIDC!", chooseChatType);
          });


          if (message.message) {
            if(typeof message.message.is_echo == 'undefined') {
              if (message.message.text) {
                var rawText = message.message.text;
                var text = rawText.trim();
      

                customersLog.taoLichKham(senderId, "duration", function(status) {
                  var choice = parseInt(text);
                  if(status==true)  {
                    if(isNaN(choice)==false && choice>=1 && choice<=5) {
                      var durations = [900000, 1800000, 1800000, 3600000, 4500000];
                      
                      customersLog.dienThongTinLichKham(senderId, "duration", durations[choice-1], function(status){
                        if(status==false) console.log("ko dc");
                      });
                    } else {
                      send.sendMessage(senderId, "Bạn vui lòng chọn 1 trong các số thứ tự trong danh sách trên");
                    }
                    
                    
                  }
                  // else {
                  //   send.sendMessage(senderId, "Bạn bị làm sao nhể?");
                  // }
                  
                });
                
  
                customersLog.taoLichKham(senderId, "name", function(status) {
                  if(status==true) {
                    if(text.match(/\d+/g)!=null) {
                      send.sendMessage(senderId, "Đây có vẻ như không phải tên thật của bạn. Bạn vui lòng điền lại tên thật của mình.");
                    } else if(text.split(" ").length < 2) {
                      send.sendMessage(senderId, "Đây có vẻ như không phải tên đầy đủ của bạn. Bạn vui lòng điền lại tên đầy đủ của mình (gồm cả họ và tên).");
                    } else {
                      var name = text.toUpperCase();
                      customersLog.dienThongTinLichKham(senderId, "name", name, function(status){
                        if(status==false) console.log("ko dc");
                      });
                    }
                  }
                  else {
                    send.sendMessage(senderId, "Bạn vui lòng cho biết tên đầy đủ của mình!");
                  }
                  
                });


                customersLog.taoLichKham(senderId, "place", function(status) {
                  console.log("PLACEEEEE_STATUS:", status);
                  if(status==true && typeof message.message.quick_reply != "undefined" 
                      && message.message.quick_reply.payload.split('-').includes('DATLICHKHAM_DD')){
                        var placeCode = message.message.quick_reply.payload.split('-')[1];
                        var places = {
                          "HN": "Hà Nội",
                          "DN": "Đà Nẵng",
                          "DL": "Đà Lạt",
                          "NT": "Nha Trang",
                          "HCM": "Tp. Hồ Chí Minh"
                        };
                        console.log("PLACEEEEEEE:", placeCode);
                        customersLog.dienThongTinLichKham(senderId, "place", places[placeCode], function(status){
                          if(status==false) console.log("ko dc");
                        });                
                      
                  } else {
                    var branch = [
                      {
                        "content_type":"text",
                        "title":"Hà Nội",
                        "payload":"DATLICHKHAM_DD-HN"
                      },
                      {
                        "content_type":"text",
                        "title":"Đà Nẵng",
                        "payload":"DATLICHKHAM_DD-DN"
                      },
                      {
                        "content_type":"text",
                        "title":"Đà Lạt",
                        "payload":"DATLICHKHAM_DD-DL"
                      },
                      {
                        "content_type":"text",
                        "title":"Nha Trang",
                        "payload":"DATLICHKHAM_DD-NT"
                      },
                      {
                        "content_type":"text",
                        "title":"TP.Hồ Chí Minh",
                        "payload":"DATLICHKHAM_DD-HCM"
                      }
                    ];
                    send.sendQuickReplies(senderId, "Bạn muốn đến khám tại chi nhánh nào của SIDC?", branch);
                  }
                  
                });

                
  
  
                customersLog.taoLichKham(senderId, "date", function(status) {
                  if(status==true) {
                    var inputDate = text.split("/");
                    var newDate = inputDate[1]+"/"+inputDate[0]+"/"+inputDate[2];
                    var myTimestamp = new Date(newDate).getTime();
                    if(inputDate.length == 3 && isNaN(myTimestamp) == false) {
                      if(myTimestamp>=Date.now()){
                        customersLog.dienThongTinLichKham(senderId, "date", newDate, function(status){
                          if(status==false) console.log("ko dc");
                        });
                      } else {
                        send.sendMessage(senderId, "Bạn vui lòng nhập 1 ngày trong tương lai.");
                      }
                      
                    } else {
                      send.sendMessage(senderId, "Bạn vui lòng nhập lại ngày/tháng/năm theo cấu tạo sau: nn/TT/NNNN");
                    }
                  } 
                  else {
                    send.sendMessage(senderId, "Bạn muốn khám vào ngày nào?\nBạn vui lòng nhập ngày/tháng/năm theo cấu tạo sau: nn/TT/NNNN");
                    
                  }
                });



                customersLog.taoLichKham(senderId, "time", function(status) {
                    
                    var log = customersLog.getInfo(senderId);
                    var tenKhach = log.datlich.name;
                    var diaDiem = log.datlich.place;
                    var ngay = log.datlich.date;
                    var thoiGianKham = log.datlich.duration;
                    calendar.layLichTrong(diaDiem, ngay, thoiGianKham, function(data){
                      var choice = parseInt(text);
                      console.log("LUA CHONNNNNNNNN:", choice);
                      if(data!={}) {
                        if(status==true && isNaN(choice)==false && choice>=1 && choice<=Object.keys(data).length) {
                          // console.log("LUA CHONNNNNNNNN:", choice);
                          var time = Object.keys(data)[choice-1];
                          var dentist = Object.values(data)[choice-1];
                          console.log("TIMEEEEEEEE:", time);
                          customersLog.dienThongTinLichKham(senderId, "time", time, function(status){
                            if(status==false) console.log("ko dc");
                          });
                          customersLog.dienThongTinLichKham(senderId, "dentist", dentist, function(status){
                            if(status==true) send.sendMessage(
                              senderId, 
                              "SIDC đã đặt lịch cho bạn:" + "\n" + 
                              tenKhach + "\n" + 
                              "Khám tại: " + diaDiem + "\n" + 
                              "Thời gian: " + ngay+" "+time + "\n" + 
                              "Bác sĩ: " + dentist + "\n" + 
                              "Cảm ơn bạn đã chọn SIDC.");
                          });
                        } else {
                          // console.log("THOI GIANNNNNNN:", data);
                          var appointments = data;
                          var buttons = [];
                          var i = 1;
                          var appointmentsMessage = "Bạn có thể chọn 1 trong các lịch khám sau đây:"
                          for(var key in appointments) {
                            appointmentsMessage += "\n " + i + ". " + key + " - " + appointments[key];
                            i++;
                          }
                          send.sendMessage(senderId, appointmentsMessage);
                          
                        }
                      } else {
                        send.sendMessage(senderId, "Không có lịch trống trong ngày mà bạn đã chọn");
                      }
                      
                    });
                    
                });


  
                
  
              }
            }
            if(typeof message.message.quick_reply != "undefined") {
              console.log("QUICK_REPLYYYYYYYYYYYY:", message.message.quick_reply);
            }
            
            
          } 
          if(message.postback) {
            var payload = message.postback.payload;
            if(payload == "DATLICHKHAM") {
              send.sendMessage(senderId, "Nội dung khám:\n 1. Đây là lần khám đầu tiên của tôi\n 2. Lấy cao răng\n 3. Hàn răng\n 4. Nhổ răng sữa\n 5. Nhổ răng vĩnh viễn ");
              customersLog.taoLichKham(senderId, "init");
            } 

            // send.sendMessage(senderId, "payload: " + payload);
          }



          // Kiểm tra số trường đã log

          console.log("customersLog", customersLog.getInfo(senderId));

          
          
        }
        
        

      }
      if(typeof entry.standby !== 'undefined') {
        console.log(entry.standby);
      }
      
    }
  }
  

  res.status(200).send("OK");
});

// Thêm dữ liệu vào database
function guiThongTin(id) {
  var customer = customersLog.getInfo(id);
  var phongKham = customer.datlich.place;
  var tenKhach = customer.datlich.name;
  var tenBacSi = customer.datlich.dentist;
  var ngay = customer.datlich.date;
  var batDau = customer.datlich.time;
  var thoiLuong = customer.datlich.duration;
  calendar.luuThongTin(phongKham, tenKhach, tenBacSi, ngay, batDau, thoiLuong, function(data){
    // 
  });
  
}

// // Phát hiện ngôn ngữ
// language.detect(text, function(err, result) {
//   console.log("cld:", text);
//   console.log(result);
// });
// console.log("lngDetector:", lngDetector.detect(text, 1));




app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "0.0.0.0");

server.listen(app.get('port'), app.get('ip'), function() {
  console.log("Chat bot server listening at %s:%d ", app.get('ip'), app.get('port'));
});