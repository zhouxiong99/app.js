
var app = (function(document, undefined) {
	var $ = function() {};
	$.version = "1.0.0.0"; //版本号
	$.appType = "1"; //1-开发；2-测试；3-生产
	$.debug = true; //是否显示调试日志
	$.log = function(arg) {
		$.debug && console.log(arg);
	};
	$.defaultToken = ""; //签名暂时不用
	$.appId = ""; //appId暂时不用
	$.moveIstouch = 0;
	$.methed = {
		user_login: "user.login",
		user_getInfo: "user.getInfo",
	}; //方法对象
	$.getUrl = function() {
		switch($.appType) {
			case "1":
				{
					return ""; //开发环境
				};
			case "2":
				{
					return "http://fportal.bblink.cn/niubility/portal/api"; //测试环境
				};
			case "3":
				{
					return "http://portal.bblink.cn/niubility/portal/api"; //线上环境
				};
		}
	};

	$.getQueryString = function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return unescape(r[2]);
		return null; //获取地址栏Url参数
	};
	$.getSearch = function() {
		var qs = location.search.length > 0 ? location.search.substring(1) : '';
		var items = qs.length > 0 ? qs.split('&') : [];
		var arg = {},
			item, name, value;
		for(var i = 0, len = items.length; i < len; i++) {
			item = items[i].split('=');
			name = item[0];
			value = item[1];
			arg[name] = value;
		}
		return arg; //获取地址栏Url参数对象
	};
	$.createTimestamp = function() {
		return parseInt(new Date().getTime() / 1000) + ''; //请求时间戳
	};
	$.os = function() {
		var ua = navigator.userAgent.toLowerCase(),
			app = navigator.appVersion;
		return {
			weixin: ua.match(/MicroMessenger/i) == "micromessenger", //是否为微信
			mobile: !!ua.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
		};
	}();

	/**
	 * 兼容 AMD 模块
	 **/
	if(typeof define === 'function' && define.amd) {
		define('app', [], function() {
			return $;
		});
	}
	return $;

})(document);

/**
 * 扩展方法
 * @param {Object} undefined
 */

(function(undefined) {
	if(String.prototype.toKeyName === undefined) { // fix for iOS 3.2
		/**
		 * 拼接缓存key名称
		 */
		String.prototype.toKeyName = function() {
			var s = this + '_';
			for(var i = 0; i < arguments.length; i++) {
				s += arguments[i] + '_';
			}
			return s;
		};
	}
	Object.setPrototypeOf = Object.setPrototypeOf || function(obj, proto) {
		obj['__proto__'] = proto;
		return obj;
	};
})();

/**
 * 缓存管理
 * @param {Object} $ app类
 * @param {Object} win
 */
(function($, win) {
	$.Cache = {
		keyTime: 'keyTime',
		key: {
			user: 'user',
			openId: 'openId',
			token: 'token',
		},
		init: function() {
			$.Cache.del($.Cache.key.user.toKeyName());
			$.Cache.del($.Cache.key.openId.toKeyName());
			$.Cache.del($.Cache.key.token.toKeyName());
		},
		set: function(k, v, t) {
			if(localStorage) //浏览器是否支持localStorage
			{
				localStorage.setItem(k, v);
				if(t != undefined) {
					var time = new Date().getTime();
					localStorage.setItem($.Cache.key.toKeyName(k), time + t * 1000);
				}
			} else {
				try {
					$.Cookie.set(k, v);
				} catch(cerror) {
					$.toast('浏览器设置不支持存储模式!');
				}
			}
		},
		setObject: function(k, v, t) {
			if(localStorage) {
				localStorage.setItem(k, JSON.stringify(v));
				if(t != undefined) {
					var time = new Date().getTime();
					localStorage.setItem($.Cache.keyTime.toKeyName(k), time + t * 1000);
				}
			} else {
				try {
					$.Cookie.set(k, JSON.stringify(v));
				} catch(cerror) {
					$.toast('浏览器设置不支持存储模式!');
				}
			}
		},
		get: function(k, fun, t) {
			var v;
			if(!localStorage) {
				v = $.Cookie ? $.Cookie.get(k) : null;
				if(fun != undefined) {
					v = fun();
					localStorage.setItem(k, v);
				}
			} else {
				//超时删除缓存中存在的原有值
				var t1 = localStorage.getItem($.Cache.keyTime.toKeyName(k));
				t1 = t1 == null ? 0 : parseInt(t1);
				var time = new Date().getTime();
				//缓存值过期处理
				if(t1 != 0 && t1 < time) {
					localStorage.removeItem(k);
				}
				if(t != undefined) {
					localStorage.setItem($.Cache.keyTime.toKeyName(k), time + t * 1000);
				}
				v = localStorage.getItem(k);
				if(v == null) {
					v = $.Cookie ? $.Cookie.get(k) : null;
					if(fun != undefined) {
						v = fun();
						localStorage.setItem(k, v);
					}
				}
			}
			return v;
		},
		getInt: function(k, fun, t) {
			var v = $.Cache.get(k, fun, t);
			return v == null ? 0 : parseInt(v);
		},
		getFloat: function(k, fun, t) {
			var v = $.Cache.get(k, fun, t);
			return v == null ? 0 : parseFloat(v);
		},
		getBoolean: function(k, fun, t) {
			var v = $.Cache.get(k, fun, t);
			return v == 'true' ? true : false;
		},
		getObject: function(k, fun, t) {
			var v = $.Cache.get(k, fun, t);
			return v == null ? null : JSON.parse(v);
		},
		getArray: function(k, fun, t) {
			var v = $.Cache.get(k, fun, t);
			return v == null ? [] : JSON.parse(v);
		},
		getString: function(k, fun, t) {
			var v = $.Cache.get(k, fun, t);
			return v == null ? '' : v.toString();
		},
		del: function(k) {
			localStorage.removeItem(k);
			localStorage.removeItem($.Cache.keyTime.toKeyName(k));
		}
	};

	$.User = {
		openId: '',
		nick: '',
		sex: '',
		head: '',
		qRCode: '',
		name: '',
		mobile: '',
		birth: '',
		set: function(u) {
			$.Cache.setObject($.Cache.key.user.toKeyName(), u);
		},
		get: function() {
			var u = $.Cache.getObject($.Cache.key.user.toKeyName());
			return u || $.User;
		},
		setToken: function(token) {
			$.Cache.set($.Cache.key.token.toKeyName(), token);
		},
		getToken: function() {
			return $.Cache.getString($.Cache.key.token.toKeyName());
		},
		delToken: function() {
			return $.Cache.del($.Cache.key.token.toKeyName());
		},
	};

	// Cookie存储模式

	$.Cookie = {
		set: function(k, v) {
			document.cookie = k + "=" + escape(v) + ";path=/";
		},
		get: function(k) {
			var arr, reg = new RegExp("(^| )" + k + "=([^;]*)(;|$)");
			if(arr = document.cookie.match(reg))
				return unescape(arr[2]);
			else
				return null;
		},
		del: function(k) {
			document.cookie = k + "=" + undefined + ";path=/";
		}
	};
})(app, window);

(function($, doc, win) {

	$.createLoading = function() {
		return $.loading = doc.getElementById("app_LOADING"),
			$.loading || ($.loading = doc.createElement("div"),
				$.loading.id = "app_LOADING", $.loading.className = "load-container",
				$.loading.innerHTML = '<div class="loader">努力加载中...</div>'),
			$.loading
	}();

	/**
	 * 显示等待 防止内容滚动
	 */
	$.showWaiting = function() {
		$.touchMove();
		app.moveIstouch = "1";
		doc.body.appendChild($.createLoading);
		doc.getElementById("app_LOADING").addEventListener("doubletap", function() {
			$.closeWaiting();
		})
	};

	//列表加载中显示 loadmore
	$.loadModeDiv = function(msg) {
		var ldiv = doc.querySelector(".tagDiv");
		if(ldiv == null) {
			ldiv = doc.createElement("div");
			ldiv.className = "tagDiv";
			ldiv.innerText = msg;
			doc.body.appendChild(ldiv);
		} else {
			ldiv.innerText = msg;
		}
	};

	//列表加载完成去掉 loadmore
	$.loadModeDivClear = function() {
		jQuery(".tagDiv") && jQuery(".tagDiv").eq(0).remove();
	};

	//提示信息
	$.toast = function(msg) {
		var t = '<div class="toast anim-toast">' + msg + '</div>';
		jQuery(doc.body).append(t);
		$.clearToast(3000);
	};

	$.clearToast = function(t) {
		setTimeout(function() {
			jQuery('.toast').eq(0) && jQuery('.toast').eq(0).remove();
		}, t == undefined ? 3000 : t);
	};

	$.closeWaiting = function() {
		app.moveIstouch = "0";
		$.loading && $.loading.parentNode && $.loading.parentNode.removeChild($.loading);
	};

	$.touchMove = function() {
		doc.addEventListener('touchmove', function(e) {
			if(app.moveIstouch == "1") {
				e.preventDefault();
				e.stopPropagation();
			} else {
				doc.removeEventListener('touchmove', false);
			}
		}, false);
	};

	//程序出错  双击再次加载
	$.showError = function(msg, callBack) {
		$.err = doc.getElementById("app_Error");
		if(!$.err) {
			app.moveIstouch = "1";
			$.touchMove();
			$.err = doc.createElement("div");
			$.err.id = "app_Error", $.err.className = "loaderrordiv";
			$.err.innerHTML = '<div><i class="loaderrori"></i><h3>' + msg + '</h3></div>';
			$.err.addEventListener('tap', function() {
				$.closeError();
				callBack && callBack();
			});
			doc.body.appendChild($.err);
		} else {
			app.moveIstouch = "0";
			$.err.style.display = '';
		}
	};
	$.divShowLoading = function(el) {
		jQuery(el).append('<div class="loading clearfix" style="height:2rem;line-height:2rem;text-align:center;font-size:.5rem;">正在加载中...</div>');
	};
	$.divRemoveLoading = function(el) {
		jQuery('.loading', jQuery(el)).remove();
	};
	$.closeError = function() {
		app.moveIstouch = "0";
		$.err.style.display = 'none'; //&& a.err.parentNode && a.err.parentNode.removeChild(a.err)
	};

	//获取元素dom位置
	$.getElementPosition = function(elem) {
		var defaultRect = {
			top: 0,
			left: 0
		};
		var rect = (elem.getBoundingClientRect && elem.getBoundingClientRect()) || defaultRect;
		var ret = {
			top: rect.top + document.body.scrollTop,
			left: rect.left + document.body.scrollLeft
		}
		return ret;
	};

	/**
	 * 自动移动当前标签至可见位置，已防止虚拟键盘弹出挡住当前标签
	 * @param {String} selector 支持的标签选择器
	 */
	$.autoScroll = function(selector) {
		selector = selector || 'input';
		jQuery(selector).each(function() {
			var self = this;
			self.addEventListener('focus', function() {
				var self = this;
				var elP = $.getElementPosition(self);
				setTimeout(function() {
					if(doc.documentElement.clientHeight / 2 < elP.top + self.offsetHeight * 3) {
						doc.body.style.height = doc.documentElement.clientHeight * 1.5 + 'px';
						var top = elP.top - self.offsetHeight * 2;
						win.scrollTo(0, top);
					}
				}, 200);
			});
			self.addEventListener('blur', function() {
				var self = this;
				doc.body.style.height = '';
			});
		});
	}
})(app, document, window);

(function($) {

	//日期格式化
	$.timeFormat = function(t, f) {
		if(f == null || f == '') {
			f = 'yyyy-MM-dd';
		}
		var newDate = new Date();
		newDate.setTime(t);
		var date = {
			"M+": newDate.getMonth() + 1,
			"d+": newDate.getDate(),
			"h+": newDate.getHours(),
			"m+": newDate.getMinutes(),
			"s+": newDate.getSeconds(),
			"q+": Math.floor((newDate.getMonth() + 3) / 3),
			"S+": newDate.getMilliseconds()
		};
		if(/(y+)/i.test(f)) {
			f = f.replace(RegExp.$1, (newDate.getFullYear() + '').substr(4 - RegExp.$1.length));
		}
		for(var k in date) {
			if(new RegExp("(" + k + ")").test(f)) {
				f = f.replace(RegExp.$1, RegExp.$1.length == 1 ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
			}
		}
		return f;
	};

	$.post = function(method, data, callback, errorCallBack, async) {
		var furl = $.getUrl();
		var cr = $.sign(method, data); //请求参数处理

		$.log("请求地址:" + furl + ",发送请求：" + JSON.stringify(cr));

		async = async == undefined ? true : false; //异步参数
		var jquery = require('jquery');
		jquery.ajax({
			url: furl,
			type: "post",
			dataType: "json",
			crossDomain: !0,
			async: async,
			data: JSON.stringify(cr),
			contentType: 'application/json; charset=utf-8',
			timeout: 5000,
			success: function(res) {
				$.log('返回结果:' + JSON.stringify(res));
				if(res && res.code == 0) {
					if(res.hasOwnProperty('totalCount')) {
						var data = {
							totalCount: res.totalCount,
							data: res.data == null ? "{}" : res.data
						};
						callback(data);
					} else {
						callback(res.data == null ? "{}" : res.data);
					}
				} else {
					$.toast(res.msg);
					errorCallBack && errorCallBack(); //错误回掉函数处理
				}
			},
			error: function(result, textStatus, errorThrown) {
				$.closeWaiting();
				var httpCode = result.status;
				if(httpCode == "404" || result.statusText.indexOf("NetworkError") != -1) {
					//$.toast("服务器异常,请稍后重试!");
					window.location.href = '/error.html';
				} else {
					$.toast("连接超时,请稍后重试!");
				}
			}
		});
	};
	$.sign = function(m, data) {
		var cr = {};
		cr.method = m;
		if(data.hasOwnProperty('pager')) {
			cr.pager = JSON.stringify(data.pager);
			data.pager = undefined;
			data.hasOwnProperty('data') && (cr.data = JSON.stringify(data));
		} else {
			cr.data = JSON.stringify(data);
		}
		return cr;
	};

	$.get = function(url, callback) {
		var jquery = require('jquery');
		jquery.ajax({
			url: $.getUrl() + url,
			timeout: 5000,
			success: function(res) {
				$.log('返回结果:' + JSON.stringify(res));
				callback(res);
			},
			error: function(result, textStatus, errorThrown) {
				$.closeWaiting();
				var httpCode = result.status;
				if(httpCode == "404" || result.statusText.indexOf("NetworkError") != -1) {
					window.location.href = '/error.html';
				} else {
					$.toast("连接超时,请稍后重试!");
				}
			}
		});
	};

})(app);

// 第三方 插件 定义导入

(function() {

	var vue = require('vue');
	vue.filter('f-imgUrl', function(v, w, h) {
		if(v) {
			if(w) {
				v = v + "?imageView2/0/w/" + w + "";
			}
			if(h) {
				v = v + "/h/" + h + "";
			}
			return v;
		}
		return '';
	});
	vue.filter('f-time', function(v, f) {
		if(f) {
			return app.timeFormat(v, f);
		} else {
			return app.timeFormat(v, 'yyyy-MM-dd hh:mm:ss');
		}
	});

})();

// 更新缓存 离线缓存
//(function(win) {
//	setTimeout(function() {
//		var appCache = win.applicationCache;
//		if (appCache.status && appCache.status == appCache.UPDATEREADY) {
//			appCache.update(); //为了通过编程更新cache，首先调用 applicationCache.update()
//			appCache.swapCache(); //更新缓存
//			if (win.confirm('程序有新版本,您确定要更新吗?')) {
//				win.location.reload();
//			};
//		}
//	}, 2000);
//})(window);

//全局版本控制 V=1.0.0.0
(function(doc) {
	jQuery(doc).ready(
		function() {
			var links = doc.getElementsByTagName('link');
			for(var i = 0; i < links.length; i++) {
				links[i].getAttribute('rel') == "stylesheet" && links[i].setAttribute("href", links[i].href + '?v=' + app.version);
			}
		}
	);
})(document);