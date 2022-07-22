var $commonMinxin = {
	data:function() {
		return {
			maskLoading: true,
			
			stock:{
				name:'', // 个股名称
				code:'', // 个股代码
				isRequest: false,
			},
			
			globalUrl:{
				BOND_INFO_URL:'http://route.showapi.com/2690-1', // 查询可转债基本信息 https://www.showapi.com/apiGateway/view/2690/1#tabs
				BOND_HISOTRY_URL:'http://route.showapi.com/2690-3', // 可转债历史行情查询 https://www.showapi.com/apiGateway/view/2690/3#tabs
			},
			
			signdata:{ // 数据请求签名参数
				showapi_timestamp: window.moment().format('YYYYMMDDHHMMSS'),
				showapi_appid: '1031930',
				showapi_sign: 'd8adf0358b1644ae99d7d06b2644dfd9',
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
		reset:function() {
			this.stock.isRequest = false;
		},
		/**
		 * 查询可转债基本信息
		 * @param {Object} text 个股名称|编码|拼音
		 */
		fetchBondInfo:function(text, callback) {
			var _this = this;
			
			var params = JSON.parse(JSON.stringify(this.signdata));
			params['bond_code'] = text
			
			axios({
				method: 'post',
				url: this.globalUrl['BOND_INFO_URL'],
				data: params,
			}).then(function(res) {
				var resbody = res.data.showapi_res_body;
				if(resbody.ret_code != 0) {
					alert(resbody.remark);
					return;
				}
				
				if(resbody.ret_code == 0) {
					var reslist = resbody.contentlist;
					if(reslist.length > 0) {
						callback({
							name: reslist[0].bond_short_name,
							code: reslist[0].bond_code,
						})
					}else {
						alert('无查询数据...')
					}
				}
			})
		},
		/**
		 * 查询可转债历史日线数据
		 * @param {Object} code
		 * @param {Object} beginTime
		 * @param {Object} endTime
		 */
		fetchBondHistory:function(code, beginTime, endTime, callback) {
			var _this = this;
			var params = JSON.parse(JSON.stringify(this.signdata));
			Object.assign(params, {
				bond_code: code,
				start_date: moment(beginTime).format('YYYYMMDD'),
				end_date: moment(endTime).format('YYYYMMDD'),
			})
			
			axios({
				method: 'post',
				url: this.globalUrl['BOND_HISOTRY_URL'],
				data: params,
			}).then(function(res) {
				var data = res.data;
				if(data.showapi_res_code == 0) {
					var resbody = data.showapi_res_body;
					if(resbody.ret_code == 0) {
						resbody.contentlist.length > 0 ? callback(resbody.contentlist) : alert('无查询数据...');
					}else {
						alert(resbody.remark)
					}
				}
			})
		}
	}
}