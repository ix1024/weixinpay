# 微信支付

[![npm version](https://badge.fury.io/js/weixinpay.svg)](http://badge.fury.io/js/weixinpay)

## install 
> npm install weixinpay

## Usage

> var weixinpay = require('weixinpay');

    router.get('/wxpay', function(req, res, next) {
        var order = req.query.order || 'bookingNos';
        var ip = req.ip.replace('::ffff:', '');
        var appid = '';
        var secret = '';
        var mch_id = '';
        var openid = '';

        var unifiedorder = new weixinpay.Unifiedorder({
            appid: appid, //微信小程序AppID
            key: secret, //key为在微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置  
            attach: '测试描述', //支付信息描述
            body: 'App支付测试', //
            mch_id: mch_id, //账户ID
            openid: openid, //用户OpenID
            bookingNo: order, //订单号
            total_fee: 10, //支付金额，单位：分
            trade_type: 'JSAPI', //支付类型 JSAPI，NATIVE，APP
            notify_url: 'https://xxx.xxx.xxx/', //通知地址
            ip: ip, // 用户IP地址
            complete: function(reponse, body) {
                res.send(body);
            }

        });

    });

    ## response 

    {
        return_code: "SUCCESS",
        err_code: "",
        err_code_des: "",
        return_msg: "OK",
        appId: "",
        timeStamp: "1479728322",
        nonceStr: "yrrutvhmvgta9k9",
        signType: "MD5",
        package: "",
        paySign: ""
    }