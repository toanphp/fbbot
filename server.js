
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
var logMessage = require('./lib/logMessage.js');

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
var server = http.createServer(app);
// var request = require("request");



/**
 * tự động nhắc khách khi chưa đặt lịch xong mà ko thấy chat trong 15p = 900000 mili giây
 * tự động xóa khách đã chat quá 1 ngày = 86400000 mili giây
 */
customersLog.cronJob(900000, 86400000, function(id){
  var cancellationButtons = [
    {
      "type":"postback",
      "title":"Tiếp",
      "payload":"DATLICHKHAM_KHONGHUY"
    },
    {
      "type":"postback",
      "title":"Ếu",
      "payload":"DATLICHKHAM_HUY"
    }
  ];
  send.sendButton(id, "Bạn chưa đặt xong lịch khám. Bạn có muốn đặt lịch tiếp không?", cancellationButtons);
});

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
app.post('/webhook', async function(req, res) {
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


          // Welcome
          customersLog.lanTruyCapCuoi(senderId, timestamp, function() {
            var choosingChatType= [
              {
                type:"postback",
                title:"Đặt Lịch Khám",
                payload:"DATLICHKHAM"
              },
              {
                type:"postback",
                title:"Tiếp tục chat vs sóc",
                payload:"CHATVSSOC"
              }
            ];
            send.sendButton(senderId, "Chào mừng bạn đến với SIDC!", choosingChatType);
          });


          if (message.message) {
            
            if (message.message.text) {
              var rawText = message.message.text;
              logMessage.log(senderId, timestamp, rawText);
              if(typeof message.message.is_echo == 'undefined') {
                var text = boVietTat(rawText);
                var text = text.trim();
                var textKhongDau = bodauTiengViet(text);

                var cancellationKW = [
                  ["huy", "lich"],
                  ["khong muon ", "lich nua"],
                  ["thoi", "cam on"]
                ];

                // Kiểm tra tin nhắn có chứa các từ trong "bookingKW"
                var cancellationStatus= checkMessage(textKhongDau, cancellationKW);  

                if(cancellationStatus==true && typeof customersLog.getInfo(senderId).datlich != "undefined") {
                  var cancellationButtons = [
                    {
                      "type":"postback",
                      "title":"Đúng rồi đấy",
                      "payload":"DATLICHKHAM_HUY"
                    },
                    {
                      "type":"postback",
                      "title":"Không",
                      "payload":"DATLICHKHAM_KHONGHUY"
                    }
                  ];
                  send.sendButton(senderId, "Có phải bạn muốn hủy đặt lịch không?", cancellationButtons);
                } else {


                  
                  // Đổi lại thông tin
                  var changingNameKW = [
                    ["doi lai ten"]
                  ];
                  var changingPlaceKW = [
                    ["doi lai dia diem"]
                  ];
                  var changingDateKW = [
                    ["doi lai ngay"]
                  ];
                  var changingTimeKW = [
                    ["doi lai thoi gian"]
                  ];

                  var changingName = checkMessage(textKhongDau, changingNameKW); 
                  var changingPlace = checkMessage(textKhongDau, changingPlaceKW); 
                  var changingDate = checkMessage(textKhongDau, changingDateKW); 
                  var changingTime = checkMessage(textKhongDau, changingTimeKW); 

                  if(changingName == true && typeof customersLog.getInfo(senderId).datlich.name!= 'undefined'
                        && customersLog.getInfo(senderId).datlich.name!= '') {
                      customersLog.del(senderId, "name");
                    } 
                  if(changingPlace == true && typeof customersLog.getInfo(senderId).datlich.place!= 'undefined'
                      && customersLog.getInfo(senderId).datlich.place!= '') {
                    customersLog.del(senderId, "place");
                  } 
                  if(changingDate == true && typeof customersLog.getInfo(senderId).datlich.date!= 'undefined'
                      && customersLog.getInfo(senderId).datlich.date!= '') {
                    customersLog.del(senderId, "date");
                  } 
                  if(changingTime == true && typeof customersLog.getInfo(senderId).datlich.time!= 'undefined'
                      && customersLog.getInfo(senderId).datlich.time!= '') {
                    customersLog.del(senderId, "time");
                  } 


                  
                  // // thời gian khám
                  // customersLog.taoLichKham(senderId, "duration", function(status) {
                  //   var choice = parseInt(text);
                  //   if(status==true) {
                  //     if(isNaN(choice)==false && choice>=1 && choice<=5) {
                  //       var durations = [900000, 1800000, 1800000, 3600000, 4500000];
                        
                  //       customersLog.dienThongTinLichKham(senderId, "duration", durations[choice-1], function(status){
                  //         if(status==false) console.log("ko dc");
                  //       });
                  //     } else {
                  //       send.sendMessage(senderId, "Bạn vui lòng chọn 1 trong các số thứ tự trong danh sách trên");
                  //     }
                      
                      
                  //   }
                  //   // else {
                  //   //   send.sendMessage(senderId, "Bạn bị làm sao nhể?");
                  //   // }
                    
                  // });







                  // thời gian khám (hỏi)
                  await customersLog.taoLichKham(senderId, "duration", function(status) {

                    console.log("THOI GIAN KHAM");
                    
                    if(status==true) {

                      // Triệu chứng
                      var layCaoRangKW = [
                        ["chảy máu"],
                        ["mảng bám"],
                        ["lấy cao"]
                      ];

                      var hanRangKW = [
                        ["hàn", "răng"]
                      ];
                      var sauRangKW = [
                        ["có mùi"],
                        ["hôi"]
                      ];
                      var koVaoTuyKW = [
                        ["không buốt"],
                        ["không bị buốt"],
                        ["không hề buốt"],
                        ["không có buốt"],
                      ];

                      var nhoRangKW = [
                        ["nhổ răng"]
                      ];
                      var implantKW = [
                        ["trồng răng"]
                      ];
                      
                      // var layCaoRang = false; 
                      // var hanRang = false; 
                      // var voRang = false; 
                      // var sauRang = false; 
                      // var koVaoTuy = false; 

                      // TIẾP TỤC Ở ĐÂY
                      logMessage.get(senderId, 86400000, function(cuMessages) {
                        console.log("ALL MESSAGESSSSSSS:", cuMessages);
                        var layCaoRang = checkMessage(cuMessages, layCaoRangKW); 
                        var hanRang = checkMessage(cuMessages, hanRangKW); 
                        var sauRang = checkMessage(cuMessages, sauRangKW); 
                        var koVaoTuy = checkMessage(cuMessages, koVaoTuyKW); 

                        // console.log("LAYCAORANG:", layCaoRang);
                        // console.log("HANRANG:", hanRang);
                        // console.log("SAURANG:", sauRang);
                        // console.log("KOVAOTUY:", koVaoTuy);

                        // setTimeout(function(){
                          if(layCaoRang == true) {
                            console.log("laycaorang==true");
                            customersLog.dienThongTinLichKham(senderId, "duration", 180000, function(status){
                              if(status==false) console.log("ko dc");
                              console.log("customersLog2", customersLog.getInfo(senderId));
                              
                            });
                          } else if(layCaoRang==false) {
                            console.log("laycaorang==false");
                          }
                        // }, 5000);
                      });
                      


                      
                      

                    
                      
                      
                    }
                    // else {
                    //   send.sendMessage(senderId, "Bạn bị làm sao nhể?");
                    // }
                    
                  });
                  
    





                  // tên
                  customersLog.taoLichKham(senderId, "name", function(status) {
                    if(status==true) {
                      var name = text.toUpperCase();
                      var la = name.indexOf("LÀ ");
                      if(la > -1) name = name.slice(la+3);
                      if(name.search(/\d+/g) > -1) {
                        send.sendMessage(senderId, "Đây có vẻ như không phải tên thật của bạn. Bạn vui lòng điền lại tên thật của mình.");
                      } else if(name.split(" ").length < 2) {
                        send.sendMessage(senderId, "Đây có vẻ như không phải tên đầy đủ của bạn. Bạn vui lòng điền lại tên đầy đủ của mình (gồm cả họ và tên).");
                      } else {
                        customersLog.dienThongTinLichKham(senderId, "name", name, function(status){
                          if(status==false) console.log("ko dc");
                        });
                      }
                    }
                    else {
                      send.sendMessage(senderId, "Bạn vui lòng cho biết tên đầy đủ của mình!");
                    }
                    
                  });
  
  
                  
                  // chi nhánh
                  customersLog.taoLichKham(senderId, "place", function(status) {
                    console.log("PLACEEEEE_STATUS:", status);
                    if(status==true && typeof message.message.quick_reply != "undefined" 
                        && message.message.quick_reply.payload.split('-').includes('DATLICHKHAM_DD')){
                          var placeKW = message.message.quick_reply.payload.split('-')[1];
                          var places = {
                            "HN": "Hà Nội",
                            "QN": "Quảng Ninh",
                            "DN": "Đà Nẵng",
                            "DL": "Đà Lạt",
                            "NT": "Nha Trang",
                            "HCM": "Tp. Hồ Chí Minh"
                          };
                          console.log("PLACEEEEEEE:", placeKW);
                          customersLog.dienThongTinLichKham(senderId, "place", places[placeKW], function(status){
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
                          "title":"Quảng Ninh",
                          "payload":"DATLICHKHAM_DD-QN"
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
  
                  
    
                  // ngày
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
  
  
                  // thời gian
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
            }
            if(typeof message.message.quick_reply != "undefined") {
              console.log("QUICK_REPLYYYYYYYYYYYY:", message.message.quick_reply);
            }
            
            
          } 
          if(message.postback) {
            var payload = message.postback.payload;
            if(payload == "DATLICHKHAM") {
              customersLog.taoLichKham(senderId, "init");
              // send.sendMessage(
              //   senderId, 
              //   "Bạn vui lòng chọn 1 trong số các số thứ tự tương ứng với nội dung khám:\n " + 
              //   "1. Đây là lần khám đầu tiên của tôi\n " + 
              //   "2. Lấy cao răng\n " + 
              //   "3. Hàn răng\n " + 
              //   "4. Nhổ răng sữa\n " + 
              //   "5. Nhổ răng vĩnh viễn" 
              // );
              send.sendMessage(senderId, "Bạn hãy kể triệu chứng hoặc yêu cầu khám của mình.");
              
            } else if(payload == "DATLICHKHAM_HUY") {
              customersLog.huyDatLich(senderId, function(status){
                if(status==true) { 
                  var rebookingButtons = [
                    {
                      "type":"postback",
                      "title":"Có",
                      "payload":"DATLICHKHAM"
                    },
                    {
                      "type":"postback",
                      "title":"Không, cảm ơn!",
                      "payload":"CHATVSSOC"
                    }
                  ];
                  send.sendButton(senderId, "Lịch đã hủy thành công. Bạn có muốn đặt lịch lại không?", rebookingButtons);

                } else {
                  send.sendMessage(senderId, "Lịch chưa được hủy. Xin bạn vui lòng thử lại.");
                }
              });
            } else if(payload == "DATLICHKHAM_KHONGHUY") {
              send.sendMessage(senderId, "Xin lỗi bạn. Xin vui lòng tiếp tục đặt lịch");
            } else if(payload == "CHATVSSOC") {
              send.sendMessage(senderId, "Bây giờ bạn có thể tiếp tục chat với nhân viên chăm sóc khách hàng của SIDC");
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



/**
 * Kiểm tra cấu trúc tin nhắn
 * @param {@code string} text 
 * @param {@code array} KW 
 * KW = [
 *  ["huy", "lich"],
 *  ["khong muon ", "lich nua"],
 *  ["thoi", "cam on"]
 * ];
 * @param {@code function} callback 
 */
function checkMessage(text, KW) {
  var status = false;
  for(var words of KW) {
    for(var word of words) {
      if(text.indexOf(word) > -1) {
        status = true;
      } else {
        status = false;
        break;
      }
    }
    if(status == true) break;
  }
  return status;
}


// function checkMessage2(text, KW) {
//   var status = false;
//   var array = [];
//   for(var words of KW) {
//     var count = 0;
//     for(var j=0; j<words.length; j++) {
//       if(text.indexOf(words[j]) > -1) {
//         count++;
//     }
//     if(count == words.length) {
//       return true;
//     } else {

//     }
//   }
//   return status;
// }


/**
 * Thêm dữ liệu vào database
 * @param {@code int} id 
 */
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

/**
 * 
 * @param {@code string} str 
 */
function bodauTiengViet(str) {
  str = str.toLowerCase();
  // bỏ dấu 
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");

  return str;
}

function boVietTat(str) {
  str = str.toLowerCase();
  
  // bỏ viết tắt
  str = str.replace(/ko/g, "không");
  str = str.replace(/vs/g, "với");

  // thay thế từ ngữ đồng nghĩa, vùng miền
  str = str.replace(/nướu/g, "lợi");
  str = str.replace(/vôi/g, "cao");

  return str;
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