# 微信小程序支付

[![npm version](https://badge.fury.io/js/weixinpay.svg)](http://badge.fury.io/js/weixinpay)

## 安装

    npm install weixinpay --save

## 使用

    var weixinpay = require('weixinpay');


    var weixinpay = new WeiXinPay({
       // pfx: fs.readFileSync('xxx/xxx/apiclient_cert.p12'),可选，退款需要
        appid: config.WXSetting.appid,//微信小程序appid
        openid: config.WXSetting.openid,//用户openid
        mch_id: config.WXSetting.mch_id,//商户帐号ID
        partner_key: config.WXSetting.secret,//秘钥
    });


### 创建统一下单



    router.get('/unifiedorder', function(req, res, next) {

        var order = req.query.order || 'bookingNos';
        var totalFee = req.query.totalFee || 1;
        var ip = req.ip.replace('::ffff:', '');

        weixinpay
            .createUnifiedOrder({
                body: '支付测试ddddddddddddddd',
                out_trade_no: order,
                total_fee: totalFee,
                spbill_create_ip: ip,
                notify_url: 'https://xxx.xxx.com/',
                trade_type: 'JSAPI',
                product_id: '1234567890'
            }, function(body) {
                res.send(body);
            });
    });


#### response 1 正常
    
    {
        return_code: "SUCCESS",
        return_msg: "OK",
        appid: "xae2ad8c364555262x",
        mch_id: "2209909803",
        nonce_str: "GB3qnPyB41ofpLR9",
        sign: "6674254B6sA9823803D1D64A86721EFB",
        result_code: "SUCCESS",
        prepay_id: "wx202613221881546ce5e4a1f70798435680",
        trade_type: "JSAPI"
    }

#### response 2订单重复

    {
        return_code: "SUCCESS",
        return_msg: "OK",
        appid: "xae2ad8c364555262x",
        mch_id: "2209909803",
        nonce_str: "NxwTR38TS7u3rLaZ",
        sign: "6674254B6sA9823803D1D64A86721EFB",
        result_code: "FAIL",
        err_code: "OUT_TRADE_NO_USED",
        err_code_des: "商户订单号重复"
    }


 

### 查寻订单



    router.get('/orderquery', function(req, res, next) {
       var order = req.query.order || 'bookingNos';
        wxpay.queryOrder({
            transaction_id: order
        }, function(err, order) {
            console.log(order);
            res.send(order);
        });
    });


### 关闭订单


    router.get('/closeorder', function(req, res, next) {
        var order = req.query.order || 'bookingNos';
        weixinpay.closeorder({
            transaction_id: order
        }, function(body) {
            res.send(body);
        });

    });

### 调用小程序支付方法
    
    wx.requestPayment({
       'timeStamp': '',
       'nonceStr': '',
       'package': '',
       'signType': 'MD5',
       'paySign': '',
       'success':function(res){
       },
       'fail':function(res){
       }
    })
