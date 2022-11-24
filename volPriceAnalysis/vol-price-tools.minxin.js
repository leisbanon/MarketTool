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
			if(screenfull.isFullscreen && screenfull.element.getAttribute('id') == 'chart-wrapper') {
				screenfull.element.style.overflow = 'auto';
			}else {
				screenfull.element.style.overflow = 'hidden';
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
			
			if(event.keyCode == 84) {
				_this.toogleStrategy();
				return;
			}
			
			// C
			if(event.keyCode == 67) {
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
			el = el ? el : document.getElementById("chart-wrapper");
			screenfull.toggle(el);
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