var $level2DataAnalysis2Minxin = {
	data:function() {
		return {
			sellLevelCount: 0,
			buyLevelCount: 0,
			
			stock: {
				openPrice: 0, // 拟股票收盘价
				date: '', // 日期
			},
			
			dataArray: [], // 数据队列格式化保集合列表
			robot:[],
		}
	},
	mounted:function() {
	},
	methods:{
		initExecute:function() {
			// debugger
			try{
				this.errorMes = '';
				this.dataArray = this.form.queueData.replace(/\ /g, '').split(/\n/);
				this.robot = JSON.parse(this.dataArray[0]);
				
				var column_0 = this.robot[0];
				var column_1 = this.robot[1];
				var code = this.robot[2];
				var date = this.robot[3];
				
				if(column_0 && column_1 && code.length == 6 && date) {
					this.level2DataAnalysis_2();
					
					this.fetchCodeInfo();
				}else {
					alert('首行信息数据录入无效! ');
					
				}
			}catch(e){
				alert('数据解析失败! ');
			}
		},
		// 千档行情数据解析二
		level2DataAnalysis_2:function() {
			try{
				this.sellLevelCount = this.robot[0];
				this.buyLevelCount = this.robot[1];
				this.dataArray.splice(0, 1);
				var content = JSON.parse(JSON.stringify(this.dataArray))
				
				var sellBuyBlockLength = this.sellLevelCount + this.buyLevelCount;
				// console.log(JSON.stringify(content))
				
				// 卖盘价格委托队列
				var sellPriceQueue = content.slice(0, this.sellLevelCount).reverse();
				console.log('%c 卖盘价格委托队列 >> size：' + sellPriceQueue.length, 'color:red;font-size:14px;');
				console.log(JSON.stringify(sellPriceQueue));
				
				// --买盘价格委托队列--
				var buyPriceQueue = content.slice(this.sellLevelCount, sellBuyBlockLength);
				console.log('%c 买盘价格委托队列 >> size：' + buyPriceQueue.length, 'color:red;font-size:14px;');
				console.log(JSON.stringify(buyPriceQueue));
				
				// --卖盘数量队列--
				var sellVolQueue = content.slice(sellBuyBlockLength, sellBuyBlockLength + this.sellLevelCount).reverse();
				console.log('%c 卖盘数量委托队列 >> size：' + sellVolQueue.length, 'color:red;font-size:14px;');
				console.log(JSON.stringify(sellVolQueue));
				
				// --买盘数量队列--
				var buyVolQueue = content.slice(sellBuyBlockLength + this.sellLevelCount, sellBuyBlockLength * 2);
				console.log('%c 买盘数量委托队列 >> size：' + buyVolQueue.length, 'color:red;font-size:14px;');
				console.log(JSON.stringify(buyVolQueue));
				
				// 图表加载之前，检查队列数据是否准确有效
				if(sellPriceQueue.length != sellVolQueue.length || buyPriceQueue.length != buyVolQueue.length) {
					alert('数据队列数量不一致。');
					return;
				}
				
				// 匹配委托价格队列是否存在特殊字符
				var regPrice = (/[^0-9,.].*/g);
				if(regPrice.test(sellPriceQueue.toString()) || regPrice.test(buyPriceQueue.toString())) {
					alert('委托委托价格队列存在特殊字符!');
					return;
				}
				
				// 匹配成交量队列是否存在特殊字符
				var reg = (/[^0-9,].*/g);
				var sellsStr = sellVolQueue.toString();
				var buysStr = buyVolQueue.toString();
				if(reg.test(sellsStr) || reg.test(buysStr)) {
					sellsStr.search(reg) ? this.errorMes += sellsStr.substr(sellsStr.search(reg), 10) : '';
					buysStr.search(reg) > 0 ? this.errorMes += buysStr.substr(buysStr.search(reg), 10) : '';
					console.error('委托买卖盘中，其成交量队列数据校验错误，存在特殊字符!');
					return;
				}
				
				// 计算函数
				for(var key of Object.keys(this.count)) { this.count[key] = 0 }
				for(var i = 0;i < sellPriceQueue.length;i++) {
					this.count.sellPlateAmountCount += Number(sellPriceQueue[i]) * Number(sellVolQueue[i]);
					this.count.sellPlateVolCount += Number(sellVolQueue[i]);
				}
				for(var i = 0;i < buyPriceQueue.length;i++) {
					this.count.buyPlateAmountCount += Number(buyPriceQueue[i]) * Number(buyVolQueue[i]);
					this.count.buyPlateVolCount += Number(buyVolQueue[i]);
				}
				
				this.stock.openPrice = Number((sellPriceQueue[sellPriceQueue.length - 1] / 1.1).toFixed(2));
				this.stock.date = moment(this.robot[3]).format('YYYY-MM-DD');
				
				// 加载可视化图表
				this.loadEchart('sell-plate-chart',{
					priceQueue: sellPriceQueue,
					volQueue: sellVolQueue,
				});
				
				this.loadEchart('buy-plate-chart',{
					priceQueue: buyPriceQueue,
					volQueue: buyVolQueue,
				});
			}catch(e){
				console.log('数据队列录入错误! ')
				alert('数据队列录入错误! ')
			}
		},
		fetchCodeInfo:function() {
			var _this = this;
			var code = this.robot[2];
			this.fetchStockInfo(code, function(data) {
				Object.assign(_this.stock, data);
				
				// console.log(JSON.stringify(_this.stock))
			})
		},
	}
}