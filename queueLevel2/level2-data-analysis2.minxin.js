var $level2DataAnalysis2Minxin = {
	data:function() {
		return {
			sellLevelCount: 0,
			buyLevelCount: 0,
			
			stock: {
				openPrice: 0, // 股票收盘价
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
				this.dataArray = this.form.queueData.replace(/\ /g, '').split(/\n/);
				this.robot = JSON.parse(this.dataArray[0]);
				var code = this.robot[2];
				var date = this.robot[3];
				
				if(code && date && code.length == 6) {
					this.fetchCodeInfo();
				}else {
					this.level2DataAnalysis_2();
				}
			}catch(e){
				console.log('数据队列录入错误! ')
				alert('数据队列录入错误! ')
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
				console.log(JSON.stringify(sellPriceQueue));
				console.log('%c Length => ' +  sellPriceQueue.length, 'color:red;font-size:16px;');
				
				console.log('%c 买盘队列 >>>>>>>>>>>>>>>>>>', 'color:red;font-size:14px;');
				// --买盘价格委托队列--
				var buyPriceQueue = content.slice(this.sellLevelCount, sellBuyBlockLength);
				console.log(JSON.stringify(buyPriceQueue));
				console.log('%c Length => ' +  buyPriceQueue.length, 'color:red;font-size:16px;');
				
				// --卖盘数量队列--
				var sellVolQueue = content.slice(sellBuyBlockLength, sellBuyBlockLength + this.sellLevelCount).reverse();;
				console.log(JSON.stringify(sellVolQueue));
				console.log('%c Length => ' +  sellVolQueue.length, 'color:red;font-size:16px;');
				
				// --买盘数量队列--
				var buyVolQueue = content.slice(sellBuyBlockLength + this.sellLevelCount, sellBuyBlockLength * 2);
				console.log(JSON.stringify(buyVolQueue));
				console.log('%c Length => ' +  buyVolQueue.length, 'color:red;font-size:16px;');
				
				
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
				if(reg.test(sellVolQueue.toString()) || reg.test(buyVolQueue.toString())) {
					alert('委托买卖盘中，其成交量队列数据校验错误，存在特殊字符!');
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
				
				this.count.sellPriceNo1 = sellPriceQueue[0];
				this.count.buyPriceNo1 = buyPriceQueue[0];
				
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
				Object.assign(_this.stock,data);
				_this.getStockHistory();
			})
		},
		/**
		 * 获取个股行情数据
		 */
		getStockHistory:function() {
			var _this = this;
			var code = this.robot[2];
			var date = this.robot[3];
			
			var beginTime = moment(date).subtract(5, 'days').format('YYYY-MM-DD');
			var endTime = moment().format('YYYY-MM-DD');
			this.fetchStockHistory(code, beginTime, endTime, function(list) {
				var index = moment().format('YYYY-MM-DD') == moment(date).format('YYYY-MM-DD') ? 0 : 1;
				_this.stock.openPrice = list[index].close_price;
				
				_this.level2DataAnalysis_2();
			})
		},
	}
}