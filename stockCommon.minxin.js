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
	},
	methods:{
		showToast:function(message) {
			var toastEl = document.body.querySelector('#toast');
			toastEl ? document.body.removeChild(toastEl) : '';
			
			var toast = document.createElement('div');
			toast.setAttribute('class','toast');
			toast.setAttribute('id','toast');
			toast.innerHTML = message;
			document.body.appendChild(toast);
			
			setTimeout(function() { document.body.removeChild(toast) }, 800)
			
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
		}
	}
}