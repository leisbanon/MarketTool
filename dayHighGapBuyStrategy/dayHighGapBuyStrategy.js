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
					var workbook = XLSX.read(e.target.result, {type: 'binary'});
					var _sheetNames = workbook.SheetNames
					var _sheets = workbook.Sheets[_sheetNames];
					// console.log(JSON.stringify(_sheets));
					
					// 日期
					var date = _sheets['E1'].w;
					date = date.split('\n')[1].replace(/\./g, '-');
					
					// 处理为 Array
					var index = {
						'A': 'code',
						'B': 'name',
						'H': 'hightRate', // 高开幅
					}
					var indexKeys = Object.keys(index);
					var excelTables = [];
					for(var key in _sheets) {
						var iKey = key.substr(0,1);
						var iValue = key.substr(1, key.toString().length);
						if(iKey == 'A') {
							if(indexKeys.includes(iKey) && Object.prototype.toString.call(_sheets[key]) === '[object Object]') {
								var _stockObject = new Object();
								indexKeys.forEach(function(vkey) {
									if(iValue != 1) {
										_stockObject[index[vkey]] = _sheets[vkey + iValue].w;
										// _stockObject.date = date;
									}
								});
								(_stockObject.name && !['undefined', 'false', 'null'].includes(_stockObject.name)) ? excelTables.push(_stockObject) : '';
								continue;
							}
						}
					}
					
					// 数组组合处理
					var newList = excelTables.filter(function(item) {
						var code = item.code;
						if(['6', '0'].includes(code.substr(0, 1))) {
							item.code = code.substr(0, 6);
							item.date = date;
							return item;
						}else {
							_this.noMainBoard += 1;
							return false;
						}
					});
					
					_this.excelTables = newList;
					_this.renderList.splice(0, _this.renderList.length);
					_this.iterationFetch();
				};
				reader.readAsBinaryString(files[0]);
			}
			eachReadyFile();
		},
		// 刷新
		refresh:function() {
			this.renderList.splice(0, this.renderList.length);
			this.iterationFetch();
		},
		// 重置
		resetFile:function() {
			this.excelTables.splice(0, this.excelTables.length);
			this.renderList.splice(0, this.renderList.length);
			document.getElementById('excel_file').value = '';
		},
	}
}