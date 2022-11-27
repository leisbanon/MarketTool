var $fullvolPlayAverageStrategyRule = {
	data:function() {
		return {
			riseLimit: 0.1, // 最大上涨幅度限制 10% 
			_symbolChartKey: '', // 标识当前创建图表视图的键值
			
			dayAveragePriceDateList:[], // 组合所有交易数据 “日内平均价” 队列
			
			xAxis_dateList: [], // X轴，组合所有交易数据 “日期” 队列
			yAxis_volDataList: { // Y轴，组合所有交易数据 “成交量” 队列
				buyVolumns: [],
				sellVolumns: [],
			}
		}
	},
	methods:{
		reseFullvolPlay:function() {
			var _this = this;
			this.xAxis_dateList = [];
			
			Object.keys(_this.yAxis_volDataList).forEach(function(key) {
				_this.yAxis_volDataList[key] = [];
			});
		},
		/**
		 * 全量博弈加权均值
		 */
		executeFullvolPlayAverageStrategy:function(chartdata, key) {
			// console.log(JSON.stringify(chartdata));
			var _this = this;
			this._symbolChartKey = key;
			_this.reseFullvolPlay();
			
			this.xAxis_dateList = chartdata.map(function(item) {
				if(key == 'day') {
					return moment(item['date']).format('MM-DD');
				}else {
					return moment(item['date']).format('HH:mm');
				}
			});
			
			this.dayAveragePriceDateList = chartdata.map(function(item) {
				return (Number(item['max']) + Number(item['min'])) / 2;
			});
			
			for(var i = 0;i < chartdata.length;i++) {
				var item = chartdata[i];
				
				var minPrice = Number(item['min']);
				var maxPrice = Number(item['max']);
				var openPrice = Number(item['open']);
				var closePrice = Number(item['close']);
				var vol = Number(item['volumn']);
				var date = item['date'];
				var yesterdayClose = Number(item['yesterdayClose']); // 昨日收盘价
				var diffRate = Number(item['diffRate']); // 涨跌幅
				
				// 涨停价
				var riseLimitPrice = Number((yesterdayClose + (yesterdayClose * this.riseLimit) - 0.01).toFixed(2));
				// 跌停价
				var downLimitPrice = Number((yesterdayClose - (yesterdayClose * this.riseLimit) + 0.01).toFixed(2));
				
				var createRuleData = function() {
					// A. 一字板涨停，后续所有的量为主动性买入，成交归纳为主动性卖出；
					if(minPrice == maxPrice && closePrice >= riseLimitPrice) {
						_this.yAxis_volDataList.buyVolumns.push(0);
						_this.yAxis_volDataList.sellVolumns.push(vol);
						return;
					}
					
					// B. 一字板跌停，后续所有的量为主动性卖出，成交归纳为主动性买入；
					if(minPrice == maxPrice && closePrice <= downLimitPrice) {
						_this.yAxis_volDataList.buyVolumns.push(vol);
						_this.yAxis_volDataList.sellVolumns.push(0);
						return;
					}
					
					// C. 涨停个股，主动性买盘大于所有主动性卖盘，所有成交归纳为买入
					if(closePrice >= riseLimitPrice) {
						_this.yAxis_volDataList.buyVolumns.push(vol);
						_this.yAxis_volDataList.sellVolumns.push(0);
						return;
					}
					
					// D. 跌停个股，主动性卖盘大于所有主动性买盘，所有成交归纳为卖出
					if(closePrice <= downLimitPrice) {
						_this.yAxis_volDataList.buyVolumns.push(0);
						_this.yAxis_volDataList.sellVolumns.push(vol);
						return;
					}
					
					// 收盘支撑绝对价差
					var clBuyDiff = closePrice - minPrice;
					// 收盘抛压绝对价差
					var clSellDiff = maxPrice - closePrice;
					// 多方博弈比
					var clBuyRate = (clBuyDiff / (maxPrice - minPrice) * 100).toFixed(2);
					// 空方博弈比
					var clSellRate = (clSellDiff / (maxPrice - minPrice) * 100).toFixed(2);
					
					var buyVol = (vol * clBuyRate /  100).toFixed(2);
					var sellVol = (vol - buyVol).toFixed(2);
					_this.yAxis_volDataList.buyVolumns.push(Number(buyVol));
					_this.yAxis_volDataList.sellVolumns.push(Number(sellVol));
				}
				createRuleData();
			}
			// console.log(JSON.stringify(_this.yAxis_volDataList))
			
			// 加载图表数据
			var loaddata = function(type) {
				var series = [];
				var selectId = ['vol-chart', type, _this._symbolChartKey].join('-');
				
				new Array('多方买盘', '空方卖盘').forEach(function(value, index) {
					var seriesOption = {
						name: value,
						type: type,
						stack: type == 'bar',
						itemStyle:{ },
					}
					
					if(value == '多方买盘') {
						seriesOption.id = selectId + '-buy';
						seriesOption.data = _this.yAxis_volDataList.buyVolumns;
						seriesOption.itemStyle.color = 'rgb(255, 69, 0)';
					}else {
						seriesOption.id = selectId + '-sell';
						seriesOption.data = _this.yAxis_volDataList.sellVolumns;
						seriesOption.itemStyle.color = '#00FF60';
					}
					series.push(seriesOption);
				})
				
				var chartNode = document.querySelector('#' + selectId);
				if(chartNode) {
					var chartInstance = echarts.getInstanceByDom(chartNode);
					_this.loadCharts(chartInstance, _this.xAxis_dateList, series);
				}
			}
			loaddata('bar');
			loaddata('line');
			_this.addLevelDataCount_2(_this._symbolChartKey);
		},
		// 多级别成交量博弈总量比计算
		addLevelDataCount_2:function(type) {
			// console.log('Two Strategy Count Compute =>' + type);
			// console.log(JSON.stringify(this.dayAveragePriceDateList))
			
			var solidVolCount = 0;
			var solidAmountCount = 0;
			
			var hollowVolCount = 0;
			var hollowAmountCount = 0;
			
			var volSymbolRate = 0;
			var amountSymbolRate = 0;
			
			// 成交量统计
			for(var index = 0;index < this.yAxis_volDataList['sellVolumns'].length;index++) {
				var value = this.yAxis_volDataList['sellVolumns'][index];
				solidVolCount += value;
				solidAmountCount += value * this.dayAveragePriceDateList[index] / 100;
			}
			
			for(var index = 0;index < this.yAxis_volDataList['buyVolumns'].length;index++) {
				var value_2 = this.yAxis_volDataList['buyVolumns'][index];
				hollowVolCount += value_2;
				hollowAmountCount += value_2 * this.dayAveragePriceDateList[index] / 100;
			}
			
			// 多空成交量比率
			volSymbolRate = ((hollowVolCount - solidVolCount) / hollowVolCount * 100).toFixed(2);
			// 多空成交额比率
			amountSymbolRate = ((hollowAmountCount - solidAmountCount) / hollowAmountCount * 100).toFixed(2);
			
			this.levelPlayingCount.push({
				type: type,
				count:{
					size: this.xAxis_dateList.length,
					solidVolCount: solidVolCount,
					solidAmountCount: solidAmountCount,
					
					hollowVolCount: hollowVolCount,
					hollowAmountCount: hollowAmountCount,
					
					volSymbolRate: volSymbolRate,
					amountSymbolRate: amountSymbolRate,
				}
			});
			// console.log(JSON.stringify(this.levelPlayingCount))
		},
	}
}