var $loanRateComputeMinxin = {
	data:function() {
		return {
			
		}
	},
	mounted:function() {
	},
	computed:{
		
	},
	methods:{
		// 初始化贷款计算入口
		initLoanEntry:function() {
			this.allMoneyMaps = [];
			
			switch (this.form.loanType){
				case 'DEBJ': // 等额本金
					this.DEBJComputeRobot();
					break;
				case 'DEBX': // 等额本息
					this.DEBXComputeRobot();
					break;
			}
		},
		/**
		 * 等额本息计算器
		 */
		DEBXComputeRobot:function() {
			var allMoneyMaps = [
				// {
				// 	currentMoneyCount:0, // 月偿还 “本息”
				// 	eachSameBackMoney:0, // 月偿还 “本金”
				// 	currentInterestMoney:0, // 月偿还 “利息”
				// 	surplusCurrentMoney:0, // 月偿还 “剩余本金”
				// }
			];
			
			// 计算贷款总周期（月）
			var _formatMonthSize = 0; 
			_formatMonthSize = this.form.cycleUnit == 'MONTH' ? this.form.cycleSize : this.form.cycleSize * 12;
			// console.log('贷款周期/月：' + _formatMonthSize)
			
			// 计算月利率 = 年利率 / 12
			var _monthRate = 0;
			_monthRate = (this.form.rateUnit == 'MONTH' ? this.form.rateSize : this.form.rateSize / 12);
			// console.log('月利率：' + _monthRate + '%');
			
			// 计算每月的偿还本息
			var _upperFormula = _monthRate / 100 * Math.pow(1 + _monthRate / 100, _formatMonthSize);
			var _downFormula = Math.pow(1 + _monthRate / 100, _formatMonthSize) - 1;
			var _currentMoneyCount = _upperFormula /_downFormula * this.form.choiceAmount;
			// console.log('每月相同本息还款：' + this.formatMoney(_currentMoneyCount));
			
			// // 剩余本金
			var _surplusCurrentMoney = Number(this.form.choiceAmount);
			
			for(var i = 0;i < _formatMonthSize;i++) {
				_surplusCurrentMoney = (i == 0) ? _surplusCurrentMoney : _surplusCurrentMoney * (1 + _monthRate / 100) - _currentMoneyCount;
				
				// 偿还利息
				var _currentInterestMoney = _surplusCurrentMoney * _monthRate / 100;
				
				// 偿还本金
				var _eachSameBackMoney = _currentMoneyCount - _currentInterestMoney;
				
				allMoneyMaps.push({
					eachSameBackMoney: _eachSameBackMoney, // 本金
					eachSameBackMoney_formula: _currentMoneyCount.toFixed(2) + '-' + _currentInterestMoney.toFixed(2) + '=' + (_currentMoneyCount - _currentInterestMoney).toFixed(2),
					
					currentInterestMoney: _currentInterestMoney, // 利息,
					currentInterestMoney_formula: _surplusCurrentMoney.toFixed(2) + '*' + Number(_monthRate).toFixed(3) + '/' + 100 + '=' + (_surplusCurrentMoney * _monthRate / 100).toFixed(2),
					
					currentMoneyCount: _currentMoneyCount, // 本息
					currentMoneyCount_formula: '/',
					
					surplusCurrentMoney: _surplusCurrentMoney * (1 + _monthRate / 100) - _currentMoneyCount, // 剩余本金
					surplusCurrentMoney_formula: _surplusCurrentMoney.toFixed(2) + '* (' + 1 + '+' + Number(_monthRate).toFixed(3) + '/' + 100 + ') -' + _currentMoneyCount.toFixed(2) + '=' + (_surplusCurrentMoney * (1 + _monthRate / 100) - _currentMoneyCount).toFixed(2)
				})
			}
			
			this.allMoneyMaps = allMoneyMaps;
		},
		/**
		 * 等额本金计算器
		 */
		DEBJComputeRobot:function() {
			var allMoneyMaps = [
				// {
				// 	currentMoneyCount:0, // 月偿还 “本息”
				// 	eachSameBackMoney:0, // 月偿还 “本金”
				// 	currentInterestMoney:0, // 月偿还 “利息”
				// 	surplusCurrentMoney:0, // 月偿还 “剩余本金”
				// }
			];
			
			// 计算贷款总周期（月）
			var _formatMonthSize = 0; 
			_formatMonthSize = this.form.cycleUnit == 'MONTH' ? this.form.cycleSize : this.form.cycleSize * 12;
			// console.log('贷款周期/月：' + _formatMonthSize)
			
			// 计算月利率 = 年利率 / 12
			var _monthRate = 0;
			_monthRate = (this.form.rateUnit == 'MONTH' ? this.form.rateSize : this.form.rateSize / 12);
			// console.log('月利率：' + _monthRate + '%');
			
			// 计算每月的偿还本金
			var _eachSameBackMoney = this.form.choiceAmount / _formatMonthSize;
			// console.log('每月相同本金还款：' + this.formatMoney(_eachSameBackMoney));
			
			for(var i = 0;i < _formatMonthSize;i++) {
				// 利息
				var _currentInterestMoney = (this.form.choiceAmount - (i * _eachSameBackMoney)) * _monthRate / 100;
				
				// 本息
				var _currentMoneyCount = (_eachSameBackMoney + _currentInterestMoney);
				
				allMoneyMaps.push({
					eachSameBackMoney: _eachSameBackMoney, // 本金
					eachSameBackMoney_formula: this.form.choiceAmount + '/' + _formatMonthSize + '=' + _eachSameBackMoney.toFixed(2),
					
					currentInterestMoney: _currentInterestMoney, // 利息,
					currentInterestMoney_formula: '(' + this.form.choiceAmount + '-' + '(' + i + '*' + _eachSameBackMoney.toFixed(2) + '))' + '*' + Number(_monthRate).toFixed(3) + '/' + 100 + '=' + _currentInterestMoney.toFixed(2),
					
					currentMoneyCount: _currentMoneyCount, // 本息
					currentMoneyCount_formula: _eachSameBackMoney.toFixed(2) + '+' + _currentInterestMoney.toFixed(2) + '=' + _currentMoneyCount.toFixed(2),
					
					surplusCurrentMoney: this.form.choiceAmount - ((i + 1) * _eachSameBackMoney).toFixed(2), // 剩余本金
					surplusCurrentMoney_formula: this.form.choiceAmount + '-' + '((' + i + '+' + 1 + ')' + '*' + _eachSameBackMoney.toFixed(2) + ')=' + (this.form.choiceAmount - ((i + 1) * _eachSameBackMoney)).toFixed(2),
				})
			}
			
			this.allMoneyMaps = allMoneyMaps;
			// console.log(JSON.stringify(allMoneyMaps))
		},
		/**
		 * 根据每月还款/首月还款 金额反推利率
		 */
		onReckon:function() {
			console.log('>>>>>>>>>>')
		}
	}
}