var $kLineAnalysis = {
	data:function() {
		return {
		}
	},
	mounted:function() {
	},
	methods:{
		/**
		 * 日内最高涨跌幅均值计算
		 * @param { String } key 数据列 key
		 * @param { String } field 计算字段
		 */
		dayDiffAverageRateCommon:function(key, field) {
			var list = this.dataRuleGroup[key].map(function(item) {
				return Number(item[field])
			});
			
			if(list.length > 0) {
				var value = list.reduce(function(total, num) {
					return total + num;
				});
				
				return (value / this.dataRuleGroup[key].length).toFixed(2)
			}
		},
		/**
		 * 
		 * @param { String } key 数据列 key
		 * @param { String } type compute max or min
		 * @param { String } field 计算字段
		 */
		dayDiffRateCommon:function(key, type, field) {
			var list = this.dataRuleGroup[key].map(function(item) {
				return Number(item[field])
			});
			
			if(key == 'hollowLines') {
				return Math[type].apply(null, list);
			}else {
				return Math[type == 'max' ? 'min' : 'max'].apply(null, list);
			}
		},
		formatRenderText:function(keyString) {
			return keyString == 'hollowLines' ? '涨幅' : '跌幅';
		},
	}
}