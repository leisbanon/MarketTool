var $rateBaseMinxin = {
	data:function() {
		return {
			allMoneyMaps:[],
		}
	},
	mounted:function() {
	},
	computed:{
		
	},
	methods:{
		/**
		 * 取消数字的上浮点，并返回指定长度的
		 * @param { Number } number Number Data
		 * @param { Nujber } length Float length
		 */
		offFloorReturn:function(number, length) {
			var _number = number;
			var _length = length ? length : 4;
			
			var numberFloorIndex = _number.toString().indexOf('.');
			var value = numberFloorIndex > 0 ? _number.toString().substr(0, numberFloorIndex + 1 + _length) : _number.toString();
			return value
		},
		// 获取浮点
		getFloorFormat:function(unit, floorType) {
			var _number = (this.rateUnitFormat(unit) / 100).toString();
			var floorIndex = _number.indexOf('.');
			
			switch (floorType){
				case 'Y': // 元
					return Math.floor(_number);
					break;
				case 'M': // 毛
					return floorIndex > 0 ? _number.substr(floorIndex + 1, 1) | 0 : 0;
					break;
				case 'F': // 分
					return floorIndex > 0 ? _number.substr(floorIndex + 2, 1) | 0 : 0;
					break;
				case 'L': // 厘
					return floorIndex > 0 ? _number.substr(floorIndex + 3, 1) | 0 : 0;
					break;
				case 'H': // 毫
					return floorIndex > 0 ? _number.substr(floorIndex + 4, 1) | 0 : 0;
					break;
			}
		},
		/**
		 * 货币单位利率转换
		 */
		rateUnitFormat:function(unit) {
			// 计算月利率 = 年利率 / 12
			var _monthRate = (this.form.rateUnit == 'MONTH' ? this.form.rateSize : this.form.rateSize / 12);
			
			var rate = 0;
			switch (unit){
				case 'YEAR':
					rate = _monthRate * 12;
					break;
				case 'MONTH':
					rate = Number(_monthRate);
					break;
				case 'DAY':
					rate = _monthRate / 30;
					break;
			}
			
			var rateFloorIndex = rate.toString().indexOf('.');
			var number = rateFloorIndex > 0 ? rate.toString().substr(0, rateFloorIndex + 1 + 4) : rate.toString();
			return number
		},
		/**
		 * 查询 / 显示公式
		 * @param {Object} string
		 */
		onShowFormula:function(string, event) {
			var _targetNode = event.target;
			_targetNode.style.position = 'relative';
			
			
			var tooltip = _targetNode.querySelector('[tooltip="tooltip"');
			// Create Tooltip Node
			var createTooltip = function() {
				// delete all body tooltip node
				var tooltips = document.body.querySelectorAll('[tooltip="tooltip"');
				for(var i = 0;i < tooltips.length;i++) {
					tooltips[i].parentNode.removeChild(tooltips[i]);
				}
				
				tooltip = document.createElement('div');
				tooltip.setAttribute('tooltip', 'tooltip');
				tooltip.setAttribute('tooltip', 'tooltip');
				tooltip.innerHTML = string;
				_targetNode.appendChild(tooltip);
				
				tooltip.addEventListener('click', function(e) { e.stopPropagation() })
			}
			
			tooltip ? _targetNode.removeChild(tooltip) : createTooltip();
		},
		/**
		 * 合计函数
		 * @param {Object} key date render key
		 */
		amountCountFun:function(key) {
			var count = 0;
			this.allMoneyMaps.forEach(function(item) {
				count += Number(item[key]);
			});
			return this.formatMoney(count);
		},
	}
}