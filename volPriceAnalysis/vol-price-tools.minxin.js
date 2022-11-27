var $volPriceToolsMinxin = {
	data:function() {
		return {
			
		}
	},
	mounted:function() {
		var _this = this;
		
		// Screen Fullpage
		screenfull.onchange(function(params) {
			_this.zoomCharts();
			var classname = params.srcElement.getAttribute('class');
			var id = params.srcElement.getAttribute('id');
			
			if(id && id.indexOf('line') == -1 && classname && classname.indexOf('chart-box') != -1) {
				var chartInstance = echarts.getInstanceByDom(params.srcElement);
				chartInstance.setOption({
					tooltip:{
						showContent: screenfull.isFullscreen
					}
				});
			}
		})
				
		// Tools
		var toolsNode = document.getElementById("tools");
		toolsNode.addEventListener('mouseenter', function() {
			toolsNode.style.transform = 'translateX(0)';
		})
		toolsNode.addEventListener('mouseleave', function() {
			toolsNode.style.transform = 'translateX(-95px)';
		})
		
		// Keyup
		document.addEventListener('keyup',function(event) {
			// console.log(event.keyCode);
			
			// T
			if(event.keyCode == 84) {
				_this.toogleStrategy();
				return;
			}
			
			// A
			if(event.keyCode == 65) {
				_this.toogleConsole();
				return;
			}
			
			// R
			if(event.keyCode == 82) {
				_this.zoomCharts();
				return;
			}
			
			// F
			if(event.keyCode == 70) {
				_this.fullpage();
				return;
			}
		})
	},
	methods: {
		// 切换策略
		toogleStrategy:function() {
			var strategyArray = ['STRATEGY_ONE', 'STRATEGY_TWO'];
			var strategyIndex = strategyArray.indexOf(this.form.strategyType);
			
			if(strategyIndex == strategyArray.length - 1) {
				this.form.strategyType = strategyArray[0];
			}else {
				this.form.strategyType = strategyArray[strategyIndex + 1];
			}
			this.startStrategyController();
		},
		// 全屏
		fullpage:function(el) {
			el instanceof Element ? screenfull.toggle(el): screenfull.toggle();
		},
		// 显示 Console
		toogleConsole:function() {
			var consoleNode = document.getElementById("console-count");
			var display = window.getComputedStyle(consoleNode).display;
			
			var hideConsole = function() {
				consoleNode.style.transform = 'translateY(-100%)';
				setTimeout(function() {
					document.body.style.overflow = 'auto';
					consoleNode.style.display = 'none';
					consoleNode.style.transform = 'translateY(0)';
				}, 500);
			}
			
			var showConsole = function() {
				document.body.style.overflow = 'hidden';
				consoleNode.style.display = 'block';
			}
			
			if(display == 'block') {
				 hideConsole();
			}else {
				showConsole();
			}
		},
		// 重装图表
		zoomCharts:function() {
			for(var chart of document.querySelectorAll('.chart-box')) {
				var chartInstance = echarts.getInstanceByDom(chart);
				chartInstance.dispatchAction({
					type: 'dataZoom',
					start: 0,
					end: 100,
				});
				
				chartInstance.resize();
			}
		},
	}
}