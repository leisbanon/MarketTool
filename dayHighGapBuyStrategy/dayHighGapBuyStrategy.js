var $dayHighGapBuyStrategy = {
	data:function() {
		return {
			excelTables:[], // Excel 数据保存对象
			// 页面渲染数据对象 
			renderList: [],
			
			selectDaySize: 10, // 查询数据的范围
			noMainBoard: 0, // 非主板个股数量
		}
	},
	mounted:function() {
	},
	methods: {
		// 查看昨日量价博弈
		openPlayingWin:function(item) {
			var beginTime = moment(item.date).subtract(1, 'days').format('YYYY-MM-DD');
			var params = "code=" + item.code + '&beginTime=' + beginTime + '&onceDay=true';
			window.open('../volPriceAnalysis/量价计算研测.html?' + params);
		},
		//  列表策略位率变更触发
		listStrategyRateChange:function(event, index) {
			this.renderList[index].strategyRate = event.target.value;
		},
		// 列表涨板位变更触发
		listRisePlateCountChange:function(event, index) {
			this.renderList[index].risePlateCount = event.target.value;
		},
		// 剩余差幅
		afterDiffRate:function(item) {
			var price = this.excelStrategyPositionPrices(item);
			return this.diffRateCompute(price, item._todayClose)
		},
		// 浮动策略位价
		floatStrategyPositionPrices:function(item) {
			var strategyPrice = this.strategyPositionPriceTwo(item, item.strategyRate, item.risePlateCount);
			var result = Number(strategyPrice) + (strategyPrice * 0.166 / 100)
			return (result || 0).toFixed(2);
		},
		// 列表策略位价计算
		excelStrategyPositionPrices:function(item) {
			return this.strategyPositionPriceTwo(item, item.strategyRate, item.risePlateCount);
		},
		// 获取连续涨板的次数
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
		// 迭代器
		iterator:function(object, callback) {
			var _this = this;
			var params = {
				code: object.code,
				time: 'day',
				beginDay: moment().subtract(_this.selectDaySize, 'days').format('YYYYMMDD'),
			};
			
			_this.fetchStockRealKlineData(params,function(data) {
				var dataList = data.dataList;
				dataList.forEach(function(item, index) {
					if(index != dataList.length - 1) {
						var yesterdayClose = dataList[index + 1].close; // 昨日收盘价
						item.diffRate = _this.diffRateCompute(item.close, yesterdayClose); // 当日涨跌幅
						item.date = moment(item.time).format('YYYY-MM-DD');
					}
				})
				
				var renderObject = new Object();
				for(var i = 0;i < dataList.length;i++) {
					var item = dataList[i];
					if(i != 0 && item.diffRate && Number(item.diffRate) >= 9.9) {
						// 涨板次数
						var risePlateCount = _this.getRisePlateCount(dataList, item.date);
						
						Object.assign(renderObject, {
							code: object.code,
							name: object.name,
							plate: object.plate,
							date: dataList[i - 1].date,
							diffRate: dataList[i - 1].diffRate,
							
							openPrice: dataList[i - 1].open,
							maxPrice: dataList[i - 1].max,
							closePrice: dataList[i - 1].close,
							strategyRate: 33,
							risePlateCount: risePlateCount,
							yesterdayClose: item.close,
							
							_todayClose: dataList[0].close,
							_todayInYesterdayClose: dataList[1].close,
						});
						
						console.log(JSON.stringify(renderObject))
						_this.renderList.push(renderObject);
						break;
					}
				}
				
				callback(true);
			}).catch(function(message) {
				alert(message);
			})
		},
		// 迭代获取数据信息
		iterationFetch:function(eachIndex) {
			var _this = this;
			eachIndex = eachIndex ? eachIndex : 0;
			var object = this.excelTables[eachIndex];
			if(object) {
				dataMessage: 'Loading...',
				this.iterator(object, function() {
					eachIndex += 1;
					_this.iterationFetch(eachIndex);
				});
			}else {
				// 结束数据处理
				for(var item of _this.renderList) {
					// 剩余差幅
					item._afterDiffRate = _this.afterDiffRate(item);
				}
				
				// Array Sort
				this.renderList.sort(function(v1, v2) {
					return v2._afterDiffRate - v1._afterDiffRate;
				})
				
				// console.log(JSON.stringify(_this.renderList))
			}
		},
		// 读取文件
		handleFiles:function(input) {
			var _this = this;
			var files = (input || document.getElementById("excel_file") ).files;
			if(files.length == 0) { return };
			
			var eachReadyFile = function() {
				let reader = new FileReader();
				reader.onload = function(e) {
					var results = e.target.result.split('\n');
					var titles = results[0].replace(/\s/g, '').split(',');
					var stocks = results.filter(function(item, index) {
						if(item && index != 0) { 
							return item.split(',')
						};
					});
					
					var keys = {
						"自选股": { key: 'name' },
						"代码": { key: 'code' },
						"行业": { key: 'plate' }
					}
					
					Object.keys(keys).forEach(function(keyname) {
						for(var index in titles) {
							if(titles[index].search(keyname) != -1) {
								keys[keyname]['baseIndex'] = index;
								break;
							}
						}
					});
					
					var stockList = new Array();
					for(var item of stocks) {
						var stockObject = new Object();
						var list = item.replace(/\s/g, '').split(',');
						Object.keys(keys).forEach(function(keyname) {
							stockObject[keys[keyname]['key']] = list[keys[keyname]['baseIndex']]
						})
						stockList.push(stockObject);
					}
					
					// 数组组合处理
					var newList = stockList.filter(function(item) {
						var code = item.code;
						if(['6', '0'].includes(code.substr(0, 1))) {
							return item;
						}else {
							_this.noMainBoard += 1;
							return false;
						}
					});
					
					// console.log(JSON.stringify(newList));
					
					_this.excelTables = newList;
					_this.iterationFetch();
				};
				reader.readAsText(files[0], 'gb2312');
			}
			
			_this.renderList.splice(0, _this.renderList.length);
			this.noMainBoard = 0;
			eachReadyFile();
		},
		// 刷新
		refresh:function() {
			this.renderList.splice(0, this.renderList.length);
			this.noMainBoard = 0;
			this.iterationFetch();
		},
		// 重置
		resetFile:function() {
			this.noMainBoard = 0;
			this.excelTables.splice(0, this.excelTables.length);
			this.renderList.splice(0, this.renderList.length);
			document.getElementById('excel_file').value = '';
		},
	}
}