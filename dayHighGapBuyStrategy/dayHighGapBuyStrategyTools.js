var $tools =  {
	data: function() {
		return {
			choiceDiffRate: 5.33,
			
			renderConsoleList: [],
			renderConsoleSymbol: '',
		}
	},
	mounted:function() {
		var _this = this;
		
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
			// T
			if(event.keyCode == 84) {
				_this.backTop();
				return;
			}
			
			// A
			if(event.keyCode == 65) {
				_this.coreConsoleAction('renderList');
				return;
			}
		})
		
	},
	methods: {
		coreConsoleAction:function(symbolKey) {
			var _this = this;
			this.renderConsoleSymbol = symbolKey;
			var datalist = this.results[symbolKey];
			
			if(symbolKey == 'renderList') {
				datalist = datalist.filter(function(item) {
					var restDiffRate = _this.afterDiffRate(item);
					if(Number(restDiffRate) >= - _this.choiceDiffRate) {
						return true;
					}else {
						return false;
					}
				});
			}
			
			_this.toogleConsole();
			this.renderConsoleList = datalist;
		},
		// 导出保存加载的数据
		exportCoreData:function() {
			if(this.results.renderList.length == 0) {
				alert('LIST DATA EMPEY...')
				return;
			}
			
			var day = moment().format('YYYYMMDD');
			var filename = this.filename + '【日内涨停交易策略导出】' + day
			
			var isPromptText = window.prompt('请输入文件名称: ', filename);
			if(isPromptText) {
				var blob = new Blob([JSON.stringify(this.results.renderList)], {type: "text/plain;charset=utf-8"});
				saveAs(blob, isPromptText + ".txt");
			}
		},
		// 导入保存的数据
		importCoreData:function(e) {
			var _this = this;
			var file = e.files[0];
			if(!file) { return };
			
			var readerReport = new FileReader();
			readerReport.readAsText(file, "UTF-8");
			readerReport.onload = function (e) {
				_this.excelTables = JSON.parse(readerReport.result);
				_this.results.renderList = JSON.parse(readerReport.result);
				document.getElementById("selectImport").value = '';
			};
		},
		// 回顶部
		backTop:function() {
			window.scrollTo(0, 0);
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
	}
}