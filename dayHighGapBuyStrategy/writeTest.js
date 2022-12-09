var $writeTest = {
	data:function() {
		return {
			triggerStrategyRateMax: 2.33,
			
			// passStock: [],
			// failStocks: [],
			
			minMaxRates: [],
			strategyMaxRates: [],
		}
	},
	methods: {
		dataCompute:function() {
		},
		testComplete:function() {
			this.minMaxRates.sort(function(v1, v2) { return v1.rate - v2.rate });
			console.log(JSON.stringify(this.minMaxRates));
			
			var rates1 = this.minMaxRates.map(function(item) { return item.rate });
			console.log(rates1)
			
			var count1 = rates1.reduce(function(total, number) { return Number(total) + Number(number) });
			console.log('Average：'+ (count1 / rates1.length));
			console.log('%c*************************', 'color: #f00')
			
			
			this.strategyMaxRates.sort(function(v1, v2) { return v1.rate - v2.rate });
			console.log(JSON.stringify(this.strategyMaxRates));
			
			var rates2 = this.strategyMaxRates.map(function(item) { return item.rate });
			console.log(rates2)
			
			var count2 = rates2.reduce(function(total, number) { return Number(total) + Number(number) });
			console.log('Average：'+ (count2 / rates2.length))
		},
		onRunTest:function(dataList, renderObject) {
			debugger;
			var _dataList = JSON.parse(JSON.stringify(dataList)).reverse();
			var dataIndex = _dataList.findIndex(function(item, index) {
				return moment(item.date).format('YYYY-MM-DD') == renderObject.date;
			});
			
			// 策略中日内 “最低价” 集合
			var readyRangeMin = _dataList.slice(dataIndex, _dataList.length).map(function(item) { return Number(item.min) });
			// 策略中日内 “最高价” 集合
			var readyRangeMax = _dataList.slice(dataIndex, _dataList.length).map(function(item) { return Number(item.max) });
			
			// 策略位价
			var strategyPrices = this.excelStrategyPositionPrices(renderObject);
			// 策略日内最低价
			var dayMinPrice = 0;
			// 策略日内最高价
			var dayMaxPrice = 0;
			
			// 递归日内 “最低价” 与 “最高价” 比率
			var diffMaxMinRate = 0;
			// 递归日内 “策略价” 与 “最高价” 比率
			var diffStrategyMaxRate = 0;
			
			for(var i = 0;i <= readyRangeMin.length;i++) {
				var value = readyRangeMin[i];
				if(value <= strategyPrices) {
					// debugger
					
					dayMinPrice = value;
					var rangeMaxSlices = readyRangeMax.slice(i + 1, (i + 1 + 3));
					dayMaxPrice = Math.max.apply(false, rangeMaxSlices.length > 0 ? rangeMaxSlices : [value]);
					
					diffMaxMinRate = this.diffRateCompute(dayMaxPrice, dayMinPrice);
					diffStrategyMaxRate = this.diffRateCompute(dayMaxPrice, strategyPrices);
					
					
					var coreHighRate = this.diffRateCompute((Number(renderObject.openPrice) + Number(renderObject.maxPrice)) / 2, renderObject.yesterdayClose)
					var object = { code: renderObject.code, name: renderObject.name, date:renderObject.date, coreHighRate: coreHighRate };
					this.minMaxRates.push(Object.assign({rate: diffMaxMinRate}, object))
					this.strategyMaxRates.push(Object.assign({rate: diffStrategyMaxRate}, object))
					break;
				}
			}
			
			console.log('策略价：' + strategyPrices)
			console.log('策略日内最低价：' + dayMinPrice)
			console.log('策略日内最高价：' + dayMaxPrice)
			
			console.log('%c minPrice Rate：' + diffMaxMinRate + '%', 'color:#6495ED;')
			console.log("%c strategyPrice Rate => " + diffStrategyMaxRate + '%', 'color:rgb(255, 69, 0);');
			console.log('************************')
		}
	}
}