// --卖盘价格队列--

// --买盘价格队列--

// --卖盘委托队列--

// --买盘委托队列--
var $level2DataAnalysis1Minxin = {
	data:function() {
		return {
			// queueData: "--卖盘价格队列--\n33.50\n33.48\n33.45\n33.44\n33.38\n33.20\n33.02\n33.00\n32.98\n32.48\n32.32\n32.10\n32.01\n32.00\n31.99\n31.98\n31.88\n31.80\n31.70\n31.68\n31.67\n31.60\n31.58\n31.54\n31.52\n31.51\n31.50\n31.49\n31.48\n31.47\n31.45\n31.43\n31.42\n31.40\n31.39\n31.33\n31.31\n31.30\n31.20\n31.18\n31.17\n31.16\n31.15\n31.14\n31.13\n31.12\n31.10\n31.09\n31.08\n31.07\n31.06\n31.00\n30.98\n30.95\n30.93\n30.86\n30.66\n30.65\n30.60\n30.34\n30.33\n30.30\n30.24\n30.23\n30.22\n30.19\n30.02\n30.00\n29.99\n29.85\n29.83\n29.80\n29.79\n29.78\n29.77\n29.72\n29.70\n29.66\n29.62\n29.60\n29.52\n29.51\n29.50\n29.49\n29.47\n--卖盘价格队列--\n--买盘价格队列--\n29.18\n29.11\n29.10\n29.00\n28.80\n28.75\n28.66\n28.65\n28.63\n28.62\n28.61\n28.60\n28.57\n28.56\n28.55\n28.53\n28.51\n28.50\n28.49\n28.47\n28.46\n28.45\n28.44\n28.43\n28.42\n28.40\n28.39\n28.38\n28.36\n28.35\n28.32\n28.30\n28.28\n28.25\n28.23\n28.20\n28.18\n28.15\n28.14\n28.11\n28.10\n28.02\n28.01\n28.00\n27.92\n27.91\n27.90\n27.89\n27.80\n27.66\n27.65\n27.64\n27.63\n27.62\n27.61\n27.60\n27.58\n27.57\n27.56\n27.55\n27.54\n27.53\n27.51\n27.50\n27.49\n27.48\n27.45\n27.43\n27.42\n27.41\n--买盘价格队列--\n--卖盘委托队列--\n1114\n1\n6\n70\n13\n8\n98\n19\n5\n5\n23\n10\n11\n239\n1\n5\n1\n10\n1\n1\n10\n1\n25\n10\n10\n5\n67\n48\n17\n1\n15\n10\n3\n4\n25\n40\n1\n26\n57\n35\n5\n1\n126\n50\n315\n2\n74\n2\n10\n15\n34\n68\n2\n20\n5\n20\n120\n5\n12\n5\n2\n10\n10\n1\n10\n1\n46\n4\n1\n4\n1\n10\n5\n26\n67\n47\n10\n14\n6\n5\n6\n15\n37\n35\n29\n--卖盘委托队列--\n--买盘委托队列--\n66\n3\n3\n15\n7\n10\n101\n2\n23\n1\n10\n88\n9\n20\n7\n13\n6\n55\n15\n2\n21\n2\n1\n10\n2\n101\n10\n13\n21\n3\n2\n171\n10\n2\n5\n55\n10\n2\n2\n10\n101\n1\n59\n299\n5\n3\n50\n2\n101\n18\n12\n26\n15\n13\n10\n27\n9\n48\n23\n24\n7\n25\n1\n63\n37\n4\n147\n55\n148\n540\n--买盘委托队列--",
		}
	},
	mounted:function() {
	},
	computed:{
	},
	methods:{
		level2DataAnalysis_1:function() {
			if(!this.form.queueData) {
				alert('请录入有效的数据队列。')
				return;
			}
			
			var content = this.form.queueData.replace(/\ /g, '');
			
			try{
				console.log('%c 卖盘队列 >>>>>>>>>>>>>>>>>>', 'color:red;font-size:14px;');
				// --卖盘价格委托队列--
				var sellPriceQueue = (/--卖盘价格队列--(.|\n)*--卖盘价格队列--/g).exec(content)[0].split(/\n/).reverse();
				sellPriceQueue.pop();
				sellPriceQueue.shift();
				console.log(JSON.stringify(sellPriceQueue));
				console.log('%c Length => ' +  sellPriceQueue.length, 'color:red;font-size:16px;');
				
				console.log('%c 买盘队列 >>>>>>>>>>>>>>>>>>', 'color:red;font-size:14px;');
				// --买盘价格委托队列--
				var buyPriceQueue = (/--买盘价格队列--(.|\n)*--买盘价格队列--/g).exec(content)[0].split(/\n/)
				buyPriceQueue.pop();
				buyPriceQueue.shift();
				console.log(JSON.stringify(buyPriceQueue));
				console.log('%c Length => ' +  buyPriceQueue.length, 'color:red;font-size:16px;');
				
				// --卖盘数量队列--
				var sellVolQueue = (/--卖盘委托队列--(.|\n)*--卖盘委托队列--/g).exec(content)[0].split(/\n/).reverse();
				sellVolQueue.pop();
				sellVolQueue.shift();
				console.log(JSON.stringify(sellVolQueue));
				console.log('%c Length => ' +  sellVolQueue.length, 'color:red;font-size:16px;');
				
				// --买盘数量队列--
				var buyVolQueue = (/--买盘委托队列--(.|\n)*--买盘委托队列--/g).exec(content)[0].split(/\n/)
				buyVolQueue.pop();
				buyVolQueue.shift();
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
				alert('数据队列录入错误! ')
			}
		},
	}
}