var request = require("request");

exports.layLichTrong = function(diaDiem, ngay, thoiGianKham, callback) {
    var post_data = {
        "dia_diem": diaDiem,
        "ngay": ngay,
        "thoi_gian_kham": thoiGianKham
    };
    
    request.post(
        'https://www.tendomain.tm/duongdan',
        { json: post_data },
        function(error, response, body) {
            // if(!error && response.statusCode == 200) {
                // console.log(body);
            // }
            var data = {
                    "8:00": "Bs. Giang",
                    "9:00": "Bs. Thoại",
                    "10:00": "Bs. Thoại",
                    "11:00": "Bs. Giang",
                    "16:00": "Bs. Thoại"
                };
            callback(data);
        }
    );
}

exports.luuThongTin = function(phongKham, tenKhach, bacSi, ngay, batDau, thoiLuong, callback) {
    var post_data = {
        "phong_kham": phongKham,
        "ten_khach": tenKhach,
        "ten_bac_si": bacSi,
        "ngay": ngay,
        "bat_dau": batDau,
        "thoi_luong": thoiLuong
    };

    request.post(
        'https://www.tendomain.tm/duongdan',
        { json: post_data },
        function(error, response, body) {
            if(!error && response.statusCode == 200) {
                callback(body);
            } // v...v
        }
    );
}