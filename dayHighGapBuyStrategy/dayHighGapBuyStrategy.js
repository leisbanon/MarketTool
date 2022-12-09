var $dayHighGapBuyStrategy = {
	data:function() {
		return {
			filename: '',
			selectDaySize: 23, // 查询数据的范围
			excelTables:[], // Excel 数据保存对象
			
			results: {
				requestCounts: 0, // 正在请求查询的总数
				renderList: [],
				loadingComplete: true, // 是否加载完成
				noMainBoard: 0, // 非主板个股数量
				requestFails: [], // 请求失败的个股数据集
				noSearchInfo: [], // 指定周期未查询到的数据计算
				triggerStrategyInvalid: [], // 已触发策略失效的个股数据集
			},
			
			originResults: {},
		}
	},
	mounted:function() {
		this.originResults = JSON.parse(JSON.stringify(this.results));
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
			this.results.renderList[index].strategyRate = event.target.value;
		},
		// 列表涨板位变更触发
		listRisePlateCountChange:function(event, index) {
			this.results.renderList[index].risePlateCount = event.target.value;
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
		// 迭代器
		iterator:function(object, callback) {
			var _this = this;
			var params = {
				code: object.code,
				time: 'day',
				beginDay: moment().subtract(_this.selectDaySize, 'days').format('YYYYMMDD'),
			};
			
			var basicInfo = { code: object.code,name: object.name };
			_this.fetchStockRealKlineData(params,function(data) {
				var dataList = data.dataList;
				dataList.forEach(function(item, index) {
					if(index != dataList.length - 1) {
						var yesterdayClose = dataList[index + 1].close; // 昨日收盘价
						item.diffRate = _this.diffRateCompute(item.close, yesterdayClose); // 当日涨跌幅
						item.date = moment(item.time).format('YYYY-MM-DD');
					}
				});
				
				var renderObject = new Object();
				var isSearch = false;
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
						
						// 置入规则
						var isTriggerAtValid = _this.isTriggerStrategyPositionPrice(dataList, renderObject);
						if(isTriggerAtValid) {
							_this.results.renderList.push(renderObject);
							setTimeout(function() { window.scrollTo(0, document.body.scrollHeight) }, 10)
						}else {
							_this.results.triggerStrategyInvalid.push(basicInfo);
						}
						
						isSearch = true;
						break;
					}
				}
				
				!isSearch ? _this.results.noSearchInfo.push(basicInfo) : '';
			}).catch(function(message) {
				_this.results.requestFails.push(basicInfo);
			}).finally(function() {
				callback();
			})
		},
		// 迭代获取数据信息
		iterationFetch:function(eachIndex) {
			var _this = this;
			eachIndex = eachIndex ? eachIndex : 0;
			var object = this.excelTables[eachIndex];
			if(object) {
				this.results.loadingComplete = false;
				this.results.requestCounts += 1;
				this.iterator(object, function() {
					eachIndex += 1;
					setTimeout(function() {
						_this.iterationFetch(eachIndex);
					}, 75)
				});
			}else {
				// 结束数据处理
				for(var item of _this.results.renderList) {
					// 剩余差幅
					item._afterDiffRate = _this.afterDiffRate(item);
				}
				
				// Array Sort
				this.results.renderList.sort(function(v1, v2) {
					return v2._afterDiffRate - v1._afterDiffRate;
				})
				
				this.results.loadingComplete = true;
				console.log(JSON.stringify(_this.results.renderList))
			}
		},
		// 读取文件
		handleFiles:function(e) {
			var _this = this;
			var file = e.files[0];
			if(!file) { return };
			this.filename = file.name;
			
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
						if(['60', '00'].includes(code.substr(0, 2))) {
							return item;
						}else {
							_this.results.noMainBoard += 1;
							return false;
						}
					});
					
					// console.log(JSON.stringify(newList));
					_this.excelTables = newList;
					_this.iterationFetch();
					document.getElementById("saveImport").value = '';
				};
				reader.readAsText(file, 'gb2312');
			}
			
			this.resetList('choice');
			eachReadyFile();
		},
		// 刷新
		refresh:function() {
			this.resetList('refresh');
			this.iterationFetch();
		},
		// 重置
		resetList:function(symbol) {
			for(var key in this.results) {
				this.results[key] = JSON.parse(JSON.stringify(this.originResults[key]));
			}
			
			if(!symbol) {
				document.getElementById("selectImport").value = '';
				document.getElementById("saveImport").value = '';
			}
		},
	}
}