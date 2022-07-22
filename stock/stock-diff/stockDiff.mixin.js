var $stockDiffMinxin = {
	data:function() {
		return {
		}
	},
	mounted:function() {
	},
	methods:{
		/**
		 * 计算区间的平均值匹配
		 * @param {Object} key
		 * @param {Object} childKey
		 */
		getSectionAverageCompute:function(key, childKey) {
			return (this.averageMap[key][childKey] / this.dataRuleGroup.length || 0).toFixed(2);
		},
		/**
		 * 综合添加平均值计算
		 * @param {Object} key
		 * @param {Object} childKey
		 */
		statisAverageCompute:function(key, childKey) {
			if(this.statisCountMap[key].length == 0) { return 0 }
			
			var size = this.statisCountMap[key].reduce(function(total, value) {
				if(typeof total == 'object') {
					return Number(total[childKey]) + Number(value[childKey])
				}else {
					return total + Number(value[childKey])
				}
			})
			
			// console.log(size)
			if(this.statisCountMap[key].length > 1) {
				return (size / this.statisCountMap[key].length).toFixed(2);
			}else {
				return size[childKey];
			}
		},
	}
}