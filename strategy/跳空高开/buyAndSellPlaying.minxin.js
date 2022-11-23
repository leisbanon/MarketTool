var $buyAndSellPlayingMinxin = {
	data:function() {
		return {
			
		}
	},
	mounted:function() {
		
	},
	computed:{
		isParamsEmpty:function() {
			return !this.resForm.close_price || !this.resForm.max_price;
		}
	},
	methods:{
		/**
		 * BUY-RATE 与 SELL-RATE 博弈比值
		 */
		clBuy_clSell_rate:function(symbol) {
			if(this.isParamsEmpty) { return '/' };
			
			var diffCount = Number(this.buyDiff()) + Number(this.ciDiff());
			if(symbol == 'buy') {
				return (this.buyDiff() / diffCount * 100).toFixed(2) + '%';
			}else {
				return (this.ciDiff() / diffCount * 100).toFixed(2) + '%';
			}
		},
		// 收盘价绝对支撑比
		clBuyRate:function() {
			if(this.isParamsEmpty) { return '/' };
			
			var number = (this.resForm.close_price - this.resForm.min_price) / this.resForm.close_price * 100;
			return number.toFixed(2);
		},
		// 收盘价绝对抛压比
		clSellRate:function() {
			if(this.isParamsEmpty) { return '/' };
			
			var number = (this.resForm.close_price - this.resForm.max_price) / this.resForm.close_price * 100;
			return Math.abs(number.toFixed(2));
		},
		/**
		 * 收盘支撑绝对价差
		 */
		buyDiff:function() {
			if(this.isParamsEmpty) { return '/' };
			
			var number = (this.resForm.close_price - this.resForm.min_price);
			return number.toFixed(2);
		}
	}
}