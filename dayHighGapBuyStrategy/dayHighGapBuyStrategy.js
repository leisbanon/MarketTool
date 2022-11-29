var $dayHighGapBuyStrategy = {
	data:function() {
		return {
			excelTables:[], // Excel 数据保存对象
			
			// 页面渲染数据对象 
			renderList: [],
			
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
		//  列表策略位率变更事件
		eStrategyInputChange:function(event, index) {
			this.renderList[index].strategyRate = event.target.value;
		},
		// 列表策略位价计算
		excelStrategyPositionPrices:function(item) {
			if(item.yesterdayClose && item.openPrice) {
				var opRate = this.diffRateCompute(item.openPrice, item.yesterdayClose);
				var strategyRate = opRate - (opRate * item.strategyRate / 100);
				
				// 回归位价
				var flybackPrice = item.openPrice - (item.openPrice * opRate / 100);
				// 策略位价
				var strategyPrice = flybackPrice - (flybackPrice * strategyRate / 100);
				return strategyPrice.toFixed(2);
			}
		},
		// 迭代器
		iterator:function(object, callback) {
			var _this = this;
			var params = {
				code: object.code,
				time: 'day',
				beginDay: moment(object.date).subtract(3, 'days').format('YYYYMMDD'),
			}
			
			var renderObject = new Object();
			_this.fetchStockRealKlineData(params,function(data) {
				var dataList = data.dataList.reverse();
				for(var i = 0;i < dataList.length;i++) {
					var item = dataList[i];
					if(item['time'] == moment(object.date).format('YYYYMMDD')) {
						Object.assign(renderObject, {
							code: object.code,
							name: object.name,
							openPrice: item.open,
							maxPrice: item.max,
							minPrice: item.min,
							closePrice: item.close,
							strategyRate: 33,
							date: object.date,
							
							yesterdayClose: dataList[i - 1].close,
							yesterdayDate: dataList[i - 1].date,
						});
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
				// Array Sort
				this.renderList.sort(function(v1, v2) {
					var diffRateCompute_v1 = _this.diffRateCompute(v1.closePrice, v1.yesterdayClose);
					var diffRateCompute_v2 = _this.diffRateCompute(v2.closePrice, v2.yesterdayClose);
					return diffRateCompute_v1 - diffRateCompute_v2;
				})
				
				// console.log(JSON.stringify(_this.renderList))
			}
		},
		// 读取文件
		handleFiles:function(input) {
			var _this = this;
			var files = (input || document.getElementById("excel_file") ).files;
			
			var eachReadyFile = function() {
				let reader = new FileReader();
				reader.onload = function(e) {
					var results = e.target.result.split('\n');
					var date = results[0].replace(/\r/g, '');
					var titles = results[1].replace(/\s/g, '').split(',');
					var stocks = results.filter(function(item, index) {
						// 0: Date, 1: Header
						if(item && index != 0 && index != 1) { 
							return item.split(',')
						};
					});
					
					var keys = {
						"自选股": { key: 'name' },
						"代码": { key: 'code' }
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
							item.date = date;
							return item;
						}else {
							_this.noMainBoard += 1;
							return false;
						}
					});
					
					// console.log(newList)
					
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