var $depositRateComputeMinxin = {
	data:function() {
		return {
		}
	},
	mounted:function() {
	},
	computed:{
	},
	methods:{
		// 初始化存款计算入口
		initDepositEntry:function() {
			this.allMoneyMaps = [];
			
			switch (this.form.loanType){
				case 'UNACTIVE': // 定期存款
					break;
				case 'ACTIVE': // 活期存款
					break;
			}
		},
	}
}