'use strict';
/**
 * =====微信支付相关功能=====
 */

var crypto = require('crypto');
var request = require('request');
var utils = require('npm-utils-kingwell');

/**
 * 获取随机字符串
 * @return {String} string
 */
var createNonceStr = function() {
	return Math.random().toString(36).substr(2, 15);
};


/**
 * 获取时间戳
 * @return {[Number]} 
 */
var createTimeStamp = function() {
	return parseInt(new Date().getTime() / 1000) + '';
};


/**
 * 创建统一下单
 * @constructor Unifiedorder
 * @param {Object} [varname] [description]
 */
var Unifiedorder = function() {
	this.init.apply(this, arguments);
};
var fn = Unifiedorder.prototype;
fn.init = function(options) {
	var ops = options || {};
	for (var key in ops) {
		this[key] = ops[key];
	}
	this.order();
};
/**
 * 统一下单URL
 * @type {String}
 */
fn.url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
fn.createTimeStamp = createTimeStamp;
fn.createNonceStr = createNonceStr;
fn.signType = "MD5";
fn.complete = function() {};
/**
 * get xml value
 * @return {String}
 */
fn.getXMLNodeValue = function(node_name, xml) {
	try {
		var tmp = xml.split("<" + node_name + ">");
		var _tmp = tmp[1].split("</" + node_name + ">");
		return _tmp[0];
	} catch (ev) {
		return '';
	}
};


/**
 * Join Object to String
 * @return {[type]} [description]
 */
fn.raw = function(args) {
	var keys = Object.keys(args);
	var newArgs = {};
	var string = '';
	keys = keys.sort()

	keys.forEach(function(key) {
		newArgs[key] = args[key];
	});

	for (var k in newArgs) {
		string += '&' + k + '=' + newArgs[k];
	}
	string = string.substr(1);
	return string;
};

/**
 * [paysignjs description]
 * @param  {[type]} appid     [description]
 * @param  {[type]} nonceStr  [description]
 * @param  {[type]} packages  [description]
 * @param  {[type]} signType  [description]
 * @param  {[type]} timeStamp [description]
 * @return {[type]}           [description]
 */
fn.paysignjs = function(appid, nonceStr, packages, signType, timeStamp) {
	var that = this;
	var ret = {
		appId: appid,
		nonceStr: nonceStr,
		package: packages,
		signType: signType,
		timeStamp: timeStamp
	};
	var string = this.raw(ret);
	string = string + '&key=' + that.key;
	var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
	return sign.toUpperCase();
};
/**
 * [paysignjsapi description]
 * @param  {[type]} appid            [description]
 * @param  {[type]} attach           [description]
 * @param  {[type]} body             [description]
 * @param  {[type]} mch_id           [description]
 * @param  {[type]} nonce_str        [description]
 * @param  {[type]} notify_url       [description]
 * @param  {[type]} openid           [description]
 * @param  {[type]} out_trade_no     [description]
 * @param  {[type]} spbill_create_ip [description]
 * @param  {[type]} total_fee        [description]
 * @param  {[type]} trade_type       [description]
 * @return {[type]}                  [description]
 */
fn.paysignjsapi = function(appid, attach, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type) {
	var ret = {
		appid: appid,
		attach: attach,
		body: body,
		mch_id: mch_id,
		nonce_str: nonce_str,
		notify_url: notify_url,
		openid: openid,
		out_trade_no: out_trade_no,
		spbill_create_ip: spbill_create_ip,
		total_fee: total_fee,
		trade_type: trade_type
	};
	var string = this.raw(ret);
	string = string + '&key=' + this.key; //key为在微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置  
	var crypto = require('crypto');
	var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
	return sign.toUpperCase();
};

// 此处的attach不能为空值 否则微信提示签名错误 
fn.order = function() {
	var that = this;
	//var deferred = Q.defer();
	//var appid = config.member_config.appid;
	var nonce_str = that.createNonceStr();
	var timeStamp = that.createTimeStamp();
	var formData = "<xml>";
	formData += "<appid>" + that.appid + "</appid>"; //appid  
	formData += "<attach>" + that.attach + "</attach>"; //附加数据  
	formData += "<body>" + that.body + "</body>";
	formData += "<mch_id>" + that.mch_id + "</mch_id>"; //商户号  
	formData += "<nonce_str>" + nonce_str + "</nonce_str>"; //随机字符串，不长于32位。  
	formData += "<notify_url>" + that.notify_url + "</notify_url>";
	formData += "<openid>" + that.openid + "</openid>";
	formData += "<out_trade_no>" + that.bookingNo + "</out_trade_no>";
	formData += "<spbill_create_ip>" + that.ip + "</spbill_create_ip>";
	formData += "<total_fee>" + that.total_fee + "</total_fee>";
	formData += "<trade_type>" + that.trade_type + "</trade_type>";
	formData += "<sign>" + this.paysignjsapi(that.appid, that.attach, that.body, that.mch_id, nonce_str, that.notify_url, that.openid, that.bookingNo, that.ip, that.total_fee, that.trade_type) + "</sign>";
	formData += "</xml>";


	request({
		url: that.url,
		method: 'POST',
		body: formData
	}, function(err, response, body) {
		var body = body.toString('utf-8') || '';
		var getCodeText = function(str) {
			return str.slice(9, -3);
		};
		var result = {
			return_code: getCodeText(that.getXMLNodeValue('return_code', body)),
			err_code: getCodeText(that.getXMLNodeValue('err_code', body)),
			err_code_des: getCodeText(that.getXMLNodeValue('err_code_des', body)),
			return_msg: getCodeText(that.getXMLNodeValue('return_msg', body))
		};

		console.log(body);
		console.log(222222222, that.complete.toString())

		if (!err &&
			response.statusCode == 200 &&
			result.return_code.toUpperCase() !== 'FAIL' &&
			!result.err_code_des
		) {

			var prepay_id = that.getXMLNodeValue('prepay_id', body.toString("utf-8")) || '';
			var tmp = prepay_id.split('[');
			var tmp1 = tmp[2].split(']');
			//签名  
			var _paySignjs = that.paysignjs(that.appid, nonce_str, 'prepay_id=' + tmp1[0], that.signType, timeStamp);

			result.appId = that.appid;
			result.timeStamp = timeStamp;
			result.nonceStr = nonce_str;
			result.signType = that.signType;
			result.package = tmp1[0];
			result.paySign = _paySignjs;
			that.complete(response, result);

		} else {

			that.complete(response, result);

		}
	});

};
var wxPay = {
	createNonceStr: createNonceStr,
	createTimeStamp: createTimeStamp,
	Unifiedorder: Unifiedorder
};

module.exports = wxPay;