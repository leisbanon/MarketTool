var $entrustMixin = {
	data() {
		return {
			sh_value: null,
			sz_value: null,
			cy_value: null,
		}
	},
	mounted() {
		// this.dpQuery()
	},
	methods: {
		resetMarketForm() {
			var formkey = ['sh_value', 'sz_value', 'cy_value']
			for(var key of formkey) {
				this[key] = null
			}
		},
		// 大盘行情查询
		dpQuery() {
			var _this = this
			_this.resetMarketForm()
			
			var month = window.moment(this.form.date).format('YYYYMM')
			// 上证
			_this.__fetch_db_market('000001', month).then(function(v_sh) {
				_this.sh_value = v_sh
				// 深证
				_this.__fetch_db_market('399001', month).then(function(v_sz) {
					_this.sz_value = v_sz
				})
				// 创业
				_this.__fetch_db_market('399006', month).then(function(v_cy) {
					_this.cy_value = v_cy
				})
			})
		},
		// 上证行情
		__fetch_db_market(code, month) {
			let _this = this
			var __then = null
			var callback = {
				then:function(fun) {
					__then = fun
				}
			}
			this.fetch_dp_market(code, month, function(data) {
				data = Array.isArray(data) ? data : []
				let isExist = false
				for(var item of data) {
					if(item.date == _this.form.date) {
						isExist = true
						__then(item)
						break
					}
				}
				
				if(!isExist) alert(`日期【${ _this.form.date }】未查询到...`)
			})
			
			return callback
		}
	}
}