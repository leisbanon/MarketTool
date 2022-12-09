var $tools =  {
	data: function() {
		return {
			selectRange:{ // 选择范围
				beginRate: 10,
				endRate: -5.33,
			},
			
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
		
		var pageInput = document.querySelectorAll('input');
		for(var input of pageInput) {
			var type = input.getAttribute('type');
			if(!['date', 'file'].includes(type)) {
				this.keyupEventListenerStop(input);
			}
		}
	},
	methods: {
		keyupEventListenerStop:function(input) {
			input.addEventListener('keyup', function(event) {
			if([84, 65].indexOf(event.keyCode) != -1) {
					event.stopPropagation();
				}
			})
		},
		coreConsoleAction:function(symbolKey, action) {
			var _this = this;
			this.renderConsoleSymbol = symbolKey;
			var datalist = this.results[symbolKey];
			
			if(symbolKey == 'renderList') {
				datalist = datalist.filter(function(item) {
					var restDiffRate = Number(_this.afterDiffRate(item));
					if(restDiffRate >= - Math.abs(_this.selectRange.endRate) && restDiffRate <= _this.selectRange.beginRate) {
						return true;
					}else {
						return false;
					}
				});
			}
			
			action != 'change' ? _this.toogleConsole() : '';
			this.renderConsoleList = datalist;
		},
		// 导出面板初选的数据
		consoleExportCoreData:function() {
			if(this.renderConsoleList.length == 0) {
				alert('LIST DATA EMPEY...')
				return;
			}
			
			var day = moment().format('YYYYMMDD');
			var title = document.querySelector('#numberRuleCount .title').innerText.replace(/[：,\n]/g, '');
			var filename = this.filename + '【'+title+'】' + day
			
			var isPromptText = window.prompt('请输入文件名称: ', filename);
			if(isPromptText) {
				var blob = new Blob([JSON.stringify(this.renderConsoleList)], {type: "text/plain;charset=utf-8"});
				saveAs(blob, isPromptText + ".txt");
			}
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
		onRenderlistBoxClick:function(event) {
			var nodes = document.querySelectorAll('.renderlist-box');
			for(var node of nodes) {
				node.style.backgroundColor = 'transparent';
			}
			event.currentTarget.style.backgroundColor = 'rgba(221, 221, 221, 0.2)';
		},
		copyStrategyPrice:function(event) {
			var text = event.currentTarget.parentElement.querySelector('.strategy-text').innerText;
			var clipboardInput = document.getElementById("clipboardInput");
			clipboardInput.value = text;
			clipboardInput.select();
			document.execCommand('copy');
			this.showToast('复制成功!');
		},
	}
}