var $volPriceControllerMinxin = {
	data:function() {
		return {
			datazoomIndex:[0, 100],
			
			// 级别数据计算统计
			levelPlayingCount: [], 
		}
	},
	mounted:function() {
	},
	methods:{
		test:function() {
			var chartsBox = document.querySelectorAll('.chart-box');
			var chart = chartsBox[7];
			var chartInstance = echarts.getInstanceByDom(chart);
			// console.log(chartInstance)
			chartInstance.clear();
		},
		// 策略入口控制器
		startStrategyController:function() {
			var _this = this;
			_this.levelPlayingCount = [];
			
			Object.keys(this.levelTimes).forEach(function(key) {
				var chartdata = _this.levelTimes[key];
				if(_this.form.strategyType == 'STRATEGY_ONE') {
					_this.executeBasicsPlayStrategy(chartdata, key);
					return;
				}
				
				if(_this.form.strategyType == 'STRATEGY_TWO') {
					_this.executeFullvolPlayAverageStrategy(chartdata, key);
					return;
				}
			})
		},
		/**
		 * 加载图表
		 * @param { Object } chartInstance 图表实例
		 * @param { Array } xAxisData 图表 x 轴坐标
		 * @param { Array } series  图表系列数据配置
		 * @param { Object } assginConfigOption 合并配置
		 */
		loadCharts:function(chartInstance, xAxisData, series, assginConfigOption) {
			var _this = this;
			var baseOption = {
				title:{
					show: series[0].data.length == 0,
					textStyle: {
						color: "#888888",
						fontStyle: 'italic',
						fontSize: 20,
					},
					text: "暂无数据",
					left: "center",
					top: "center"
				},
				xAxis: {
					data: xAxisData,
					nameLocation: 'end',
					nameRotate: 45,
					type: 'category',
				},
				yAxis: {
					type: 'value',
					nameLocation: 'end',
					nameRotate: 45,
					// min: 'dataMin',
					// max: 'dataMax',
				},
				grid: {
					width: 'auto',
					left: '12%',
					right: '3%',
					bottom: 60,
				},
				legend: {
					show: true,
					type: 'plain',
					top: 10,
					left: 'left',
				},
				tooltip:{
					show: true,
					trigger: 'axis',
					// alwaysShowContent: true,
					// showContent:false,
					hideDelay: 300,
					axisPointer:{
						type: 'cross',
					},
					formatter:function(params, ticket) {
						var div = document.createElement('div');
						
						// 时间
						var time = params[0].seriesId.split('-')[3];
						var dataIndex = params[0].dataIndex;
						var levelData = _this.levelTimes[time][dataIndex];
						
						if(time == 'day') {
							time = moment(levelData['date']).format('周E');
						}else {
							time = moment(levelData['date']).format('HH:mm');
						}
						
						// 成交量
						var volumnCount = _this.formatVolText(levelData.volumn);
						
						// 总金额
						var amountCount = _this.formatAmountText(levelData.amountCount);
						
						var boxList = [
							{ 'text': moment(levelData['date']).format('YY-MM-DD'), value: time, color: 'rgb(255, 69, 0)' },
							{ 'text': '收盘', value: levelData.close, color: 'rgb(255, 69, 0)' },
							{ 'text': '开盘', value: levelData.open, color: 'rgb(255, 69, 0)' },
							{ 'text': '昨收', value: levelData.yesterdayClose, color: 'rgb(255, 69, 0)' },
							{ 'text': '最高', value: levelData.max },
							{ 'text': '最低', value: levelData.min },
							{ 'text': '成交量', value: volumnCount, marginRight: '0' },
							// { 'text': '涨跌幅', value: levelData.diffRate + '%' },
							// { 'text': '总金额', value: amountCount,  },
						]
						
						var ul = document.createElement('ul');
						ul.style="font-size: 15px;margin: 0;padding: 0;list-style: none;display: flex;";
						for(var item of boxList) {
							var li = document.createElement('li');
							li.style="font-size: 14px;margin-bottom: 0px;text-align: center;margin-right:"+(item.marginRight || '28px')+";";
							li.innerHTML = '<span style="margin-bottom: 6px;text-decoration: underline;display: block;font-weight: 400;font-style: italic;">'+item.text+'</span><span style="display: block;color:'+item.color+'">'+item.value+'</span>'
							ul.appendChild(li);
						}
						
						div.append(ul);
						return div;
					}
				},
				dataZoom: [
					{ type: 'inside', start: this.datazoomIndex[0],end: this.datazoomIndex[1] },
					{ type: 'slider', start: this.datazoomIndex[0],end: this.datazoomIndex[1], moveHandleSize: 8,height:20,bottom: 15, },
				],
				brush:{
					toolbox: ['rect', 'keep', 'clear'],
				},
				toolbox:{
					show: true,
					iconStyle:{ borderColor: '#B6B6B6' },
					feature:{
						myTool2:{
							show: true,
							title: '全屏',
							icon: 'path://M128 687.968V896h207.968a16 16 0 1 1 0 32H128a32 32 0 0 1-32-32v-208.032a16 16 0 0 1 32 0z m800 0.032V896a32 32 0 0 1-32 32h-208.032a16 16 0 1 1 0-32H896v-208a16 16 0 0 1 32 0zM928 128v208a16 16 0 0 1-32 0V128h-208.032a16 16 0 1 1 0-32H896a32 32 0 0 1 32 32z m-576.032-16a16 16 0 0 1-16 16H128v207.968a16 16 0 0 1-32 0V128a32 32 0 0 1 32-32h207.968a16 16 0 0 1 16 16z',
							onclick:function(params, chart){
								var element = chart.getDom();
								_this.fullpage(element);
							},
						},
						magicType:{
							type: ['stack']
						},
						dataView: {},
					}
				},
				backgroundColor: '#FFFFFF',
				series:series,
			};
			
			// 合并配置项
			if(series[0].type == 'bar') {
				baseOption.tooltip.showContent = false;
			}
			Object.assign(baseOption, assginConfigOption);
			// console.log('baseOption => ' + JSON.stringify(baseOption))
			
			// 输入图表数据
			chartInstance.setOption(baseOption, true);
		},
		// 添加图表行为事件
		echartsEvent:function(element) {
			var _this = this;
			var chartInstance = echarts.getInstanceByDom(element);
			chartInstance.on('dblclick', function(params) {
				var key = params.seriesId.split('-')[3]
				_this.levelTimes[key].splice(params['dataIndex'], 1);
				_this.startStrategyController();
			});
			
			chartInstance.on('datazoom', function(params) {
				var distance = (params.batch instanceof Array && params.batch.length > 0) ? params.batch[0] : params;
				_this.datazoomIndex[0] = distance['start'];
				_this.datazoomIndex[1] = distance['end'];
			});
			
			chartInstance.on('click', function(params) {
				var nextChartInstance = echarts.getInstanceByDom(this.getDom().nextElementSibling);
				nextChartInstance.dispatchAction({
					type: 'dataZoom',
					start: _this.datazoomIndex[0],
					end: _this.datazoomIndex[1],
				});
				
				nextChartInstance.dispatchAction({
					type: 'showTip',
					seriesIndex: 0,
					dataIndex:params['dataIndex'],
				});
			})
		},
		// 动态创出可视化图表
		createEcharts:function() {
			for(var level of Object.keys(this.levelIndex)) {
				var chartBarId = 'vol-chart-bar-' + level;
				var chartLineId = 'vol-chart-line-' + level;
				
				var levelTitle = document.createElement('div');
				levelTitle.setAttribute('class', 'level-title');
				levelTitle.innerText = level + ' Minute';
				
				if(!this.levelIndex[level]) {
					var dayBar = document.querySelector('#' + chartBarId);
					dayBar ? dayBar.parentNode.removeChild(dayBar) : '';
					
					var dayLine = document.querySelector('#' + chartLineId);
					dayLine ? dayLine.parentNode.removeChild(dayLine) : '';
					continue;
				};
				
				var volChartBar = document.querySelector('#' + chartBarId);
				if(!volChartBar) {
					volChartBar = document.createElement('div');
					volChartBar.setAttribute('class', 'chart-box');
					volChartBar.setAttribute('id', 'vol-chart-bar-' + level);
					volChartBar.innerHTML = '<div class="level-title">'+level+'</div>';
					
					document.getElementById("chart-wrapper").appendChild(volChartBar);
					echarts.init(volChartBar);
					this.echartsEvent(volChartBar);
					volChartBar.appendChild(levelTitle.cloneNode(true));
				}
				
				
				var volChartLine = document.querySelector('#' + chartLineId);
				if(!volChartLine) {
					volChartLine = document.createElement('div');
					volChartLine.setAttribute('class', 'chart-box');
					volChartLine.setAttribute('id', 'vol-chart-line-' + level);
					
					document.getElementById("chart-wrapper").appendChild(volChartLine);
					echarts.init(volChartLine);
					this.echartsEvent(volChartLine);
					volChartLine.appendChild(levelTitle.cloneNode(true));
				}
			}
		},
	}
}