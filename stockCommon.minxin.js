var $commonMinxin = {
	data:function() {
		return {
			maskLoading: true,
			
			stock:{
				name:'', // 个股名称
				code:'', // 个股代码
				pinyin:'', // 个股拼音
				
				isRequest: false, // 标志: 防止多次触发同类请求字段
			},
			
			globalUrl:{
				STOCK_REAL_KLINE_DATA_URL: 'https://route.showapi.com/131-50',
				STOCK_INFO_URL:'https://route.showapi.com/131-43', // 查询股票信息 https://www.showapi.com/apiGateway/view/131/43#tabs
				STOCK_HISOTRY_URL:'https://route.showapi.com/131-47', // 查询股票历史日线行情 https://www.showapi.com/apiGateway/view/131/47#tabs
				STOCK_TIME_URL: 'https://route.showapi.com/131-46', // 查询股票历史行情详情（五档数据）https://www.showapi.com/apiGateway/view/131/46#tabs
				DP_MARKET_URL: 'https://route.showapi.com/131-56', // 查询大盘行情数据 https://www.showapi.com/apiGateway/view/131/56#tabs
			},
			
			signdata:{ // 数据请求签名参数
				showapi_timestamp: window.moment().format('YYYYMMDDHHMMSS'),
				showapi_appid: '1031930',
				showapi_sign: 'd8adf0358b1644ae99d7d06b2644dfd9',
				type: "bfq",
			},
		}
	},
	mounted:function() {
		let _this = this;
		Vue.nextTick(function() {
			document.getElementById("mask-loading").remove();
			document.getElementById("app").style.overflow = 'initial';
		})
		
		axios.defaults.headers['Content-Type'] = 'multipart/form-data';
		axios.defaults.headers['responseType'] = 'json';
		
		axios.interceptors.response.use(function(response) {
			var data = response.data;
			if(data.showapi_res_code != 0) {
				console.error(data.showapi_res_error)
				alert(data.showapi_res_error)
				return Promise.reject('数据接口请求失败...');
			} else {
				return response;
			}
		},function(error) {
			return Promise.reject(error);
		})
		
		// serviceWorker 使用Service Worker Allowed HTTP标头来允许作用域
		// The path of the provided scope ('/') is not under the max scope allowed ('/MarketTool/'). Adjust the scope, move the Service Worker script, or use the Service-Worker-Allowed HTTP header to allow the scope.
		this.installSW();
	},
	methods:{
		/**
		 * 页面注册 Service Worker
		 */
		async installSW() {
			if("serviceWorker" in navigator) {
				try{
					var registration = await navigator.serviceWorker.register('/MarketTool/sw.js', { scope: "/" })
					
					if (registration.installing) {
						console.log("正在安装 Service worker");
					} else if (registration.waiting) {
						console.log("已安装 Service worker installed");
					} else if (registration.active) {
						console.log("激活 Service worker");
					}
				}catch(error){
					console.error(`注册失败：${error}`);
				}
			}
		},
		/**
		 * 复制到剪切板
		 * @param {Object} text
		 */
		copyText:function(t) {
			var _this = this;
			if (!navigator.clipboard) {
				var ele = document.createElement("input");
				ele.value = t;
				document.body.appendChild(ele);
				ele.select();
				document.execCommand("copy");
				document.body.removeChild(ele);
				if (document.execCommand("copy")) {
					this.showToast('复制成功');
				} else {
					this.showToast('复制失败');
				}
			} else {
				navigator.clipboard.writeText(t).then(function () {
					_this.showToast('复制成功');
				}).catch(function () {
					_this.showToast('复制失败');
				})
			}
		},
		showTooltip:function(message, event) {
			var _targetNode = event.target;
			_targetNode.style.position = 'relative';
			
			
			var tooltip = _targetNode.querySelector('[tooltip="tooltip"');
			// Create Tooltip Node
			var createTooltip = function() {
				// delete all body tooltip node
				var tooltips = document.body.querySelectorAll('[tooltip="tooltip"');
				for(var i = 0;i < tooltips.length;i++) {
					tooltips[i].parentNode.removeChild(tooltips[i]);
				}
				
				tooltip = document.createElement('div');
				tooltip.setAttribute('tooltip', 'tooltip');
				tooltip.setAttribute('tooltip', 'tooltip');
				tooltip.innerHTML = message;
				_targetNode.appendChild(tooltip);
				
				tooltip.addEventListener('click', function(e) { e.stopPropagation() })
			}
			
			tooltip ? _targetNode.removeChild(tooltip) : createTooltip();
		},
		showToast:function(message, time) {
			var toastEl = document.body.querySelector('#toast');
			toastEl ? document.body.removeChild(toastEl) : '';
			
			var toast = document.createElement('div');
			toast.setAttribute('class','toast');
			toast.setAttribute('id','toast');
			toast.innerHTML = message;
			document.body.appendChild(toast);
			
			setTimeout(function() { document.body.removeChild(toast) }, time ? time : 1300)
			
			// toast component event stop propagation
			toast.addEventListener('click',function(e) { e.stopPropagation() });
			toast.addEventListener('touchstart',function(e) { e.stopPropagation() });
		},
		reset:function() {
			this.stock.isRequest = false;
		},
		/**
		 * 查询股票K线实时行情数据
		 * @param {Object} params
		 * @param {Object} callback
		 */
		fetchStockRealKlineData:function(data, callback) {
			var _this = this;
			var params = JSON.parse(JSON.stringify(this.signdata));
			Object.assign(params, data);
			
			var _finally = null;
			var _catch = null;
			var chainObject = {
				then:function() { },
				catch:function(fun) { 
					_catch = fun;
					return {
						finally:function(fun) { _finally = fun }
					}
				},
				finally:function(fun) { _finally = fun }
			}
			
			axios({
				method: 'post',
				url: this.globalUrl['STOCK_REAL_KLINE_DATA_URL'],
				data: params,
			}).then(function(res) {
				var data = res.data;
				if(data.showapi_res_code == 0) {
					var resbody = data.showapi_res_body;
					if(resbody.ret_code == 0) {
						if(resbody.dataList.length > 0) {
							callback(resbody);
						}else {
							_catch instanceof Function ? _catch('无查询数据...') : '';
						}
					}else {
						_catch instanceof Function ? _catch(resbody.remark) : '';
					}
				}
			}).finally(function() {
				_finally instanceof Function ? _finally() : '';
			}) 
			
			return chainObject;
		},
		/**
		 * 查询股票基本信息
		 * @param {Object} text 个股名称|编码|拼音
		 */
		fetchStockInfo:function(text, callback) {
			var _this = this;
			
			var istext = isNaN(Number(text));
			var params = JSON.parse(JSON.stringify(this.signdata));
			// 动态查询条件判断
			if(/^[a-zA-Z]{3,4}$/.test(text)) {
				params['pinyin'] = text;
			}else if(isNaN(Number(text))) {
				params['name'] = text;
			}else {
				params['code'] = text;
			}
			
			axios({
				method: 'post',
				url: this.globalUrl['STOCK_INFO_URL'],
				data: params,
			}).then(function(res) {
				var resbody = res.data.showapi_res_body;
				if(resbody.ret_code != 0) {
					alert(resbody.remark);
					return;
				}
				
				if(resbody.ret_code == 0) {
					var reslist = resbody.list;
					if(reslist.length > 0) {
						callback({
							name: reslist[0].name,
							code: reslist[0].code,
							pinyin: reslist[0].pinyin,
						})
					}else {
						alert('无查询数据...')
					}
				}
			})
		},
		/**
		 * 查询个股历史日线数据
		 * @param {Object} code
		 * @param {Object} beginTime
		 * @param {Object} endTime
		 */
		fetchStockHistory:function(code, beginTime, endTime, callback) {
			var _this = this;
			var params = JSON.parse(JSON.stringify(this.signdata));
			Object.assign(params, {
				begin: beginTime,
				end: endTime,
				code: code,
			})
			
			axios({
				method: 'post',
				url: this.globalUrl['STOCK_HISOTRY_URL'],
				data: params,
			}).then(function(res) {
				var data = res.data;
				if(data.showapi_res_code == 0) {
					var resbody = data.showapi_res_body;
					if(resbody.ret_code == 0) {
						resbody.list.length > 0 ? callback(resbody.list) : alert('无查询数据...');
					}else {
						alert(resbody.remark)
					}
				}
			})
		},
		/**
		 * 查询股票历史行情详情（五档数据）
		 * @param {Object} code
		 * @param {Object} callback
		 */
		fetchStockTime:function(code, callback) {
			var _this = this;
			var params = JSON.parse(JSON.stringify(this.signdata));
			Object.assign(params, {
				stocks: code,
				needIndex: 0,
			})
			
			axios({
				method: 'post',
				url: this.globalUrl['STOCK_TIME_URL'],
				data: params,
			}).then(function(res) {
				var data = res.data;
				if(data.showapi_res_code == 0) {
					var resbody = data.showapi_res_body;
					if(resbody.ret_code == 0) {
						resbody.list.length > 0 ? callback(resbody.list) : alert('无查询数据...');
					}else {
						alert(resbody.remark)
					}
				}
			})
		},
		/**
		 * 查询大盘行情
		 * @param {Object} code 上深创大盘代码
		 * @param {Object} month 月份
		 */
		fetch_dp_market:function(code, month, callback) {
			var _this = this;
			var params = JSON.parse(JSON.stringify(this.signdata));
			Object.assign(params, {
				code: code,
				month: month,
			})
			
			axios({
				method: 'post',
				url: this.globalUrl['DP_MARKET_URL'],
				data: params,
			}).then(function(res) {
				var data = res.data;
				if(data.showapi_res_code == 0) {
					var resbody = data.showapi_res_body;
					if(resbody.ret_code == 0) {
						resbody.list.length > 0 ? callback(resbody.list) : alert('无查询数据...');
					}else {
						alert(resbody.remark)
					}
				}
			})
		}
	}
}