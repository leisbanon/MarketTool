var $strategy = {
	data:function() {
		return {
		}
	},
	mounted:function() {
	},
	methods: {
		// 平均策略位价计算
		averageStrategyPositionCompute:function(params) {
			var value = params || this.resForm;
			
			// 回归位价
			var flybackPrice = 0;
			if(this.isIntraday) {
				flybackPrice = value.closePrice;
			}else {
				flybackPrice = value.yesterdayClose;
			}
			// console.log('平均策略回归位价 => ' + flybackPrice);
			
			var strategyPrice = (flybackPrice - (flybackPrice * this.averageStrategyPositionRate / 100)).toFixed(3);
			// console.log('平均策略位价 => ' + strategyPrice);
			return strategyPrice;
		},
		// 相对策略位价计算
		relativeStrategyPositionCompute:function(params) {
			var value = params || this.resForm;
			var coreHighRate = value.coreHighRate || this.coreHighRate;
			var relativeStrategyPositionRate = value.relativeStrategyPositionRate || this.relativeStrategyPositionRate;
			
			// 回归位价
			var flybackPrice = 0;
			if(this.isIntraday) {
				flybackPrice = value.closePrice;
			}else if(coreHighRate > 0) {
				flybackPrice = value.openPrice - (value.openPrice * coreHighRate / 100);
			}else {
				flybackPrice = value.yesterdayClose;
			}
			// console.log('相对策略回归位价 => ' + flybackPrice);
			
			var strategyPrice = (flybackPrice - (flybackPrice * relativeStrategyPositionRate / 100)).toFixed(3);
			// console.log('相对策略位价 => ' + strategyPrice);
			return strategyPrice;
		},
	}
}