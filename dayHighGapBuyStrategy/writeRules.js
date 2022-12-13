var $writeRules =  {
	data:function() {
		return {
			triggerStrategyRateMax: 2.33,
			coreRule: 'minPrice',
		}
	},
	methods:{
		// 判断是否已经触发绝对位价，相对触发涨幅空间：this.triggerStrategyRateMax %
		isTriggerStrategyPositionPrice:function(dataList, renderObject) {
			// debugger;
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
					// if(i == readyRangeMin.length) { break };
					
					dayMinPrice = value;
					var rangeMaxSlices = readyRangeMax.slice(i + 1, _dataList.length);
					dayMaxPrice = Math.max.apply(false, rangeMaxSlices.length > 0 ? rangeMaxSlices : [value]);
					
					diffMaxMinRate = this.diffRateCompute(dayMaxPrice, dayMinPrice);
					diffStrategyMaxRate = this.diffRateCompute(dayMaxPrice, strategyPrices);
					break;
				}
			}
			
			console.log('策略价：' + strategyPrices)
			console.log('策略日内最低价：' + dayMinPrice)
			console.log('策略日内最高价：' + dayMaxPrice)
			
			var isVaild = true;
			if(this.coreRule == 'minPrice') {
				diffMaxMinRate >= this.triggerStrategyRateMax ? isVaild = false : '';
				// console.log('minPrice Rate：' + diffMaxMinRate + '%')
			}
			
			if(this.coreRule == 'strategyPrice') {
				diffStrategyMaxRate >= this.triggerStrategyRateMax ? isVaild = false : '';
				// console.log("strategyPrice Rate => " + diffStrategyMaxRate + '%')
			}
			// console.log('************************')
			
			return isVaild;
		},
		// 加载连续涨板的次数
		getRisePlateCount:function(dataList, date) {
			var _plateCount = 1;
			var _plateDate = '';
			
			var eachCounts = function(listIndex) {
				var diffRate = dataList[listIndex].diffRate;
				if(diffRate && Number(diffRate) >= 9.9) {
					_plateCount += 1;
					_plateDate = dataList[listIndex].date;
					eachCounts(listIndex + 1);
				}else {
					
				}
			}
			
			for(var index = 0;index < dataList.length;index++) {
				var item = dataList[index];
				if(moment(item.date).format('YYYY-MM-DD') == date) {
					eachCounts(index + 1);
					break;
				}
			}
			return {
				_plateCount: _plateCount,
				_plateDate: _plateDate,
			};
		},
	}
}