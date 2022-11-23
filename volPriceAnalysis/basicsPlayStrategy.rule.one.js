// 一：基础策略
var $basicsPlayStrategyRule = {
	data:function() {
		return {
			_symbolChartKey: '', // 标识当前创建图表视图的键值
		}
	},
	methods:{
		reseBasicscPlay:function() {
			var _this = this;
		},
		
		/**
		 * 执行基础策略计算
		 * playSymbolStatus -> 空方博弈结果状态标识符
		 */
		executeBasicsPlayStrategy:function(chartdata, key) {
			this._symbolChartKey = key;
			this.reseBasicscPlay();
			
			for(var item of chartdata)  {
				// 当日跌幅
				if(Number(item.diffRate) <= 0) {
					item['playSymbolStatus'] = -1;
					continue;
				}
				// 当日收盘价小于开盘价
				if(item['close'] - item['open'] <= 0) {
					item['playSymbolStatus'] = -1;
					continue;
				}
				
				// 十字星，且结果绝对价格差距很小
				if(Math.abs(item['close'] - item['open']) == 0.01 && item.diffRate <= 0.04) {
					item['playSymbolStatus'] = -1;
					continue;
				}
			}
			
			this.setDataStragery(chartdata);
		},
		// 载入数据策略
		setDataStragery:function(chartdata) {
			var _this = this;
			// 组合所有交易数据 “收盘价” 队列
			var xAxis_closePriceList = chartdata.map(function(item) {
				return Number(item['close']);
			});
			
			// 所有交易数据 “成交量” 队列
			var yAxis_volDataList = chartdata.map(function(item) {
				return Number(item['volumn'])
			});
			
			// Assgin charts config option
			var assginConfigOption = {
				visualMap: {
					show: false,
					dimension: 0,
					pieces: [],
				},
			}
			var chartVisualMapObject = chartdata.forEach(function(item, index) {
				var color = item.playSymbolStatus == -1 ? '#00FF60' : '#FF4500';
				assginConfigOption.visualMap.pieces.push({
					gt: index - 1,
					lte: index,
					color: color,
				})
			});
			
			// 加载图表数据
			var loaddata = function(type) {
				var selectId = ['vol-chart', type, _this._symbolChartKey].join('-');
				var seriesOption = {
					id: selectId,
					type: type,
					name: 'Volumn',
					data: yAxis_volDataList,
					itemStyle: {
						color:'rgb(255,167,0)'
					}
				}
				
				var chartNode = document.querySelector('#' + selectId);
				if(chartNode) {
					var chartInstance = echarts.getInstanceByDom(chartNode);
					_this.loadCharts(chartInstance, xAxis_closePriceList, [seriesOption], assginConfigOption);
				}
			}
			
			loaddata('bar');
			loaddata('line');
			_this.addLevelDataCount(chartdata, this._symbolChartKey);
		},
		// 多级别成交量博弈总量比计算
		addLevelDataCount:function(chartdata, type) {
			// console.log('One Strategy Count Compute =>' + type);
			var solidVolCount = 0;
			var solidAmountCount = 0;
			
			var hollowVolCount = 0;
			var hollowAmountCount = 0;
			
			var volSymbolRate = 0;
			var amountSymbolRate = 0;
			for(var item of chartdata) {
				// 成交量统计
				if(item['playSymbolStatus'] === -1) {
					solidVolCount += Number(item['volumn']);
					solidAmountCount += item['close'] * item['volumn'] / 100;
				}else {
					hollowVolCount += Number(item['volumn']);
					hollowAmountCount += item['close'] * item['volumn'] / 100;
				}
			}
			
			// 多空成交量比率
			volSymbolRate = ((hollowVolCount - solidVolCount) / solidVolCount * 100).toFixed(2);
			// 多空成交额比率
			amountSymbolRate = ((hollowAmountCount - solidAmountCount) / solidAmountCount * 100).toFixed(2);
			
			this.levelPlayingCount.push({
				type: type,
				count:{
					size: chartdata.length,
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