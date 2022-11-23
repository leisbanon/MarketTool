var $upAndDownLinePlayingMinxin = {
	data:function() {
		return {
			
		}
	},
	mounted:function() {
		
	},
	methods:{
		/**
		 * OP-RATE 与 CI-RATE 博弈比值
		 */
		op_ci_rate() {
			var number = (this.opRate() - this.ciRate()) / this.opRate() * 100;
			if(!isNaN(number)) {
				return number.toFixed(2) + '%';
			}else {
				return '/'
			}
		},
		/**
		 * 收盘价绝对升幅
		 */
		ciRate() {
			if(this.resForm.close_price && this.resForm.max_price) {
				var result = (this.resForm.close_price - this.resForm.max_price) / this.resForm.close_price * 100;
				return Math.abs((result || 0)).toFixed(2);
			}else {
				return '/'
			}
		},
		/**
		 * 开盘价绝对跌幅
		 */
		opRate() {
			if(this.resForm.open_price && this.resForm.min_price) {
				var result = (this.resForm.open_price - this.resForm.min_price) / this.resForm.open_price * 100;
				return (result || 0).toFixed(2);
			}else {
				return '/'
			}
		},
		/**
		 * 开盘绝对价差
		 */
		opDiff() {
			if(this.resForm.open_price && this.resForm.min_price) {
				return Math.abs((this.resForm.open_price - this.resForm.min_price)).toFixed(2);
			}else {
				return '/'
			}
		},
		/**
		 * 收盘绝对价差
		 */
		ciDiff() {
			if(this.resForm.close_price && this.resForm.max_price) {
				return Math.abs((this.resForm.close_price - this.resForm.max_price)).toFixed(2);
			}else {
				return '/'
			}
		},
	}
}