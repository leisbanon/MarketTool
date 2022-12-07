var $writeRules =  {
	data:function() {
		return {
			triggerStrategyRateMax: 5.33,
		}
	},
	methods:{
		// 判断是否已经触发绝对位价，相对触发涨幅空间：this.triggerStrategyRateMax %
		isTriggerStrategyPositionPrice:function(dataList, renderObject) {
			var dataIndex = dataList.reverse().findIndex(function(item, index) {
				return moment(item.date).format('YYYY-MM-DD') == renderObject.date;
			});
			
			// 策略中日内 “最低价” 集合
			var readyRangeMin = dataList.slice(dataIndex, dataList.length).map(function(item) { return Number(item.min) });
			// 策略中日内 “最高价” 集合
			var readyRangeMax = dataList.slice(dataIndex, dataList.length).map(function(item) { return Number(item.max) });
			
			// 策略位价
			var strategyPrices = this.excelStrategyPositionPrices(renderObject);
			// 策略中日内最底价
			var dayMinPrice = Math.min.apply(false, readyRangeMin);
			// 策略中日内最高价
			var dayMaxPrice = 0;
			
			// 递归日内剩余策略价与 “最高价” 比率
			var diffStrategyMinRate = this.diffRateCompute(strategyPrices, dayMinPrice);
			// 递归日内剩余策略价与 “最高价” 比率
			var diffStrategyMaxRate = 0;
			
			for(var i = 0;i <= readyRangeMin.length;i++) {
				var value = readyRangeMin[i];
				if(value <= strategyPrices) {
					dayMaxPrice = Math.max.apply(false, readyRangeMax.slice(i, dataList.length));
					diffStrategyMaxRate = this.diffRateCompute(dayMaxPrice, strategyPrices);
					break;
				}
			}
			
			// console.log('策略价：' + strategyPrices)
			// console.log('日内最小值：' + dayMinPrice)
			// console.log('日内剩余策略价的比率：' + diffStrategyMinRate + '%')
			
			// console.log("dayMaxPrice => " + JSON.stringify(dayMaxPrice))
			// console.log("diffStrategyMaxRate => " + diffStrategyMaxRate + '%')
			// console.log('************************')
			
			if(diffStrategyMinRate > 0 && diffStrategyMaxRate > this.triggerStrategyRateMax) {
				return false;
			}
			
			return true;
		},
		// 加载连续涨板的次数
		getRisePlateCount:function(dataList, date) {
			var _risePlateCount = 1;
			var eachCounts = function(listIndex) {
				var diffRate = dataList[listIndex].diffRate;
				if(diffRate && Number(diffRate) >= 9.9) {
					_risePlateCount += 1;
					eachCounts(listIndex + 1);
				}
			}
			
			for(var index = 0;index < dataList.length;index++) {
				var item = dataList[index];
				if(moment(item.date).format('YYYY-MM-DD') == date) {
					eachCounts(index + 1);
					break;
				}
			}
			return _risePlateCount;
		},
	}
}