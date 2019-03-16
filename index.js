'use strict';
var md5 = require('md5');
var request = require('request');
var xml2js = require('xml2js');
var parseString = xml2js.parseString;
var builder = new xml2js.Builder();

/**
 * @description Extension method add
 * @param  {String} name  property
 * @param  {Object Or String} value property value
 * @return {Object}       function
 */
Function.prototype.add = Function.prototype.add || function(name, value) {
	this.prototype[name] = value;
	return this;
};

/**
 * @description Extension method inherits
 * @param  {Object} superConstructor superConstructor
 * @return {Object}                  function
 */
Function.prototype.inherits = Function.prototype.inherits || function(superConstructor) {
	var arr = arguments;
	if (Array.isArray(arguments[0]) && arguments.length === 1) {
		arr = arguments[0];
	}
	for (var item = arr.length; item >= 0; item--) {
		for (var key in arr[item]) {
			this.prototype[key] = arr[item][key];
		}
	}
	return this;
};

/**
 * @constructor WXPayUrl
 * @description微信支付URL
 */
function WXPayUrl() {}
WXPayUrl.add('url', {
	unifiedorder: 'https://api.mch.weixin.qq.com/pay/unifiedorder', //统一下单
	orderquery: 'https://api.mch.weixin.qq.com/pay/orderquery', //查询订单
	closeorder: 'https://api.mch.weixin.qq.com/pay/closeorder', //关闭订单
	refund: 'https://api.mch.weixin.qq.com/pay/refund', //申请退款
	refundquery: 'https://api.mch.weixin.qq.com/pay/refundquery', //查询退款
	downloadbill: 'https://api.mch.weixin.qq.com/pay/downloadbill', //下载对账单
	report: 'https://api.mch.weixin.qq.com/pay/report' //交易保障
});
/**
 * @description 微信支付工具类函数
 */
function Utils() {
	this.init = function() {};
}
Utils
	.add('options', {})
	.add('parseWXReturnXML', function(xmlObject) {
		var newObject = {};
		xmlObject = xmlObject.xml || {};
		for (var key in xmlObject) {
			newObject[key] = xmlObject[key][0];
		}
		return newObject;
	})
	.add('createNonceStr', function() {
		return Math.random().toString(36).substr(2, 15);
	})
	.add('createTimeStamp', function() {
		return parseInt(new Date().getTime() / 1000) + '';
	})
	.add('sign', function(options) {
		var ops = options || {};
		var
			keys =
			Object.keys(ops)
			.filter(function(item) {
				return ops[item] !== undefined && ops[item] !== '' && ['pfx', 'partner_key', 'sign', 'key'].indexOf(item) < 0;
			})
			.sort()
			.map(function(key) {
				return key + '=' + ops[key];
			})
			.join('&') + '&key=' + this.partner_key;
		return md5(keys).toUpperCase();
	});

/**
 * @description 微信小程序支付
 * @constructor WeixinPay
 * @author kingwell
 * @Date(2016-11-22)
 */
function WeiXinPay() {
	this.init.apply(this, arguments);
}

WeiXinPay
//继承 
	.inherits(new Utils(), new WXPayUrl())
	/**
	 * @description init
	 */
	.add('init', function() {
		for (var key in arguments[0]) {
			this[key] = arguments[0][key];
		}
	})
	/**
	 * 创建统一订单
	 * @param  {[type]} options       [description]
	 * @param  {[type]} fn)           {		var       that  [description]
	 * @param  {[type]} }            [description]
	 * @param  {[type]} function(err, response,     body) {			console.log('body', body);			parseString(body, function(err, result) {				fn(that.parseWXReturnXML(result));			} [description]
	 * @return {[type]}               [description]
	 */
	.add('createUnifiedOrder', function(param, fn) {
		var that = this;
		var ops = param || {};
		var nonce_str = that.createNonceStr();

		ops.appid = that.appid;
		ops.openid = that.openid;
		ops.mch_id = that.mch_id;
		ops.nonce_str = nonce_str;
		ops.sign = that.sign(ops);
		request({
			url: that.url.unifiedorder,
			method: 'POST',
			body: builder.buildObject(ops),
			agentOptions: {
				pfx: that.pfx,
				passphrase: that.mch_id
			}
		}, function(err, response, body) {
			parseString(body, function(err, result) {
				fn(that.parseWXReturnXML(result));
			});
		});
		return that;
	})
	/**
	 * @description 查寻订单
	 * @param  {Object} param
	 * @param  {Function} fn) callback
	 * @return {Object} Constructor
	 */
	.add('queryOrder', function(param, fn) {
		var that = this;
		param.nonce_str = param.nonce_str || that.createNonceStr();

		param.appid = that.appid;
		param.mch_id = that.mch_id;
		param.sign = that.sign(param);

		request({
			url: that.url.orderquery,
			method: 'POST',
			body: builder.buildObject(param)
		}, function(err, response, body) {
			parseString(body, function(err, result) {
				fn(that.parseWXReturnXML(result));
			});
		});
		return that;
	})
	/**
	 * @description 关闭订单
	 * @param  {Object} param
	 * @param  {Function} fn) callback
	 * @return {Object} Constructor
	 */
	.add('closeorder', function(param, fn) {
		var that = this;
		param.appid = this.appid;
		param.mch_id = this.mch_id;
		param.nonce_str = param.nonce_str || that.createNonceStr();
		param.sign = that.sign(param);
		request({
			url: this.url.closeorder,
			method: 'POST',
			body: builder.buildObject(param)
		}, function(err, response, body) {
			parseString(body, function(err, result) {
				fn(that.parseWXReturnXML(result));
			});
		});

	})	/**
	 * @description 企业转账到零钱
	 * @param  {Object} param
	 * @param  {Function} fn) callback
	 * @return {Object} Constructor
	 */
	.add('enterpriseTransfer', function(param, fn) {
		var that = this;
		param.mch_appid = this.mch_appid;
		param.openid = this.openid;
		param.mchid = this.mchid;
		param.nonce_str = param.nonce_str || that.createNonceStr();
		param.sign = that.sign(param);
		request({
			url: this.url.transfer,
			method: 'POST',
			body: builder.buildObject(param),
			agentOptions: {
				pfx: that.pfx,
				passphrase: that.mchid
			}
		}, function(err, response, body) {
			parseString(body, function(err, result) {
				fn(that.parseWXReturnXML(result));
			});
		});

	});
module.exports = WeiXinPay;