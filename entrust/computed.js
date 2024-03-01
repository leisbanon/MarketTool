var $Computed = {
	data() {
		return {
		}
	},
	methods: {
		/**
		 * 获取个股行情数据
		 */
		getStockHistory(code, beginTime, endTime) {
			return new Promise(resolve => {
				this.fetchStockHistory(code, beginTime, endTime, (list) => {
					for(let index in list) {
						let c_date_value = list[index]
						if(c_date_value.date == beginTime) {
							let n_date_value = list[index - 1]
							// console.log('n_date_value => ', n_date_value)
							resolve({ c_date_value, n_date_value })
							break
						}
					}
				})
			})
		},
		// 成交单边格式
		priceOneSideFormat(price) {
			let value = price / 2
			if(value < 1) {
				value = `${ (value * 10000).toFixed(3) * 1 }万`
			}else {
				value = `${ value }亿`
			}
			return value
		},
		/**
		 * 涨跌幅计算
		 */
		diffRateCompute(closePrice, openPrice) {
			var result = (closePrice - openPrice) / openPrice * 100;
			if(!isFinite(result) || Number.isNaN(result)) {
				result = 0
			}
			return (result || 0).toFixed(2);
		},
		test__computed() {
			let list = this.dataList
			
			const uIteration = async (uIndex = 0) => {
				let item = list[uIndex]
				if(!item) {
					document.getElementById("text-computed").style.opacity = '1'
					console.log('完毕...')
					return
				}
				
				let code = item.code
				let date = item.date
				let name = item.name
				let priceOneSide = this.priceOneSideFormat(item.volPrice) // 成交额(单边)
				let eBuyMoneyRate = item.eBuyMoneyRate // 量比
				let eMarketCountRate = item.eMarketCountRate // 市值比
				let marketCount = item.marketCount // 有效流通市值
				
				let beginTime = date
				let endTime = window.moment().format('YYYY-MM-DD')
				let data = await this.getStockHistory(code, beginTime, endTime)
				let { c_date_value, n_date_value } = data || {}
				
				// 测算日
				let { open_price: cOpenPrice, close_price: cClosePrice, min_price: cMinPrice, max_price: cMaxPrice } = c_date_value
				let isYZB = cMinPrice == cMaxPrice // 是否一字板
				
				// 下一日
				let n_diff_rate = n_date_value.diff_rate // 涨跌幅
				let n_open_price = n_date_value.open_price // 开盘价
				let n_min_price = n_date_value.min_price // 最低价
				let n_max_price = n_date_value.max_price // 最高价
				let n_close_price = n_date_value.close_price // 收盘价
				let n_is_yzb = n_min_price == n_max_price // 是否一字板
				
				// 下一日结果
				let nr_openbuy_isval = n_close_price > n_open_price // 开盘价买入是否盈利
				let nr_openbuy_israte = this.diffRateCompute(n_close_price, n_open_price) // 开盘价买入盈亏比例
				let nr_isgap = n_open_price > cOpenPrice // 是否高开
				let nr_gap_rate = this.diffRateCompute(n_open_price, cClosePrice) // 高低开比例
				
				console.log(`%c${ uIndex + 1 }. 名称: ${ name }(${ code }) - 日期: ${ date }`, 'color: #3ab54a')
				console.log(
					`测算日 ==> `,
					`是否一字板: ${ isYZB ? '是' : '否' } -`,
					`收盘价: ${ cClosePrice	 } -`,
					`成交额单边: ${ priceOneSide } -`,
					`量比: ${ eBuyMoneyRate }% -`,
					`市值比: ${ eMarketCountRate }% -`,
					`有效流通市值: ${ marketCount }亿 -`
				)
				console.log(
					`下一日 ==> `,
					`是否一字板: ${ n_is_yzb ? '是' : '否' } -`,
					`涨跌幅: ${ n_diff_rate }% -`,
					`开盘价: ${ n_open_price } -`,
					`最低价: ${ n_min_price } -`,
					`收盘价: ${ n_close_price } -`,
				)
				console.log(
					`下一日结果 ==> `,
					`高低开比例: ${ nr_gap_rate }% -`,
					`开盘价买入盈亏比例: ${ nr_openbuy_israte }% -`
				)
				console.log('%c ****************************************** End ******************************************', 'color: #F00')
				
				
				uIteration(uIndex + 1)
			}
			
			document.getElementById("text-computed").style.opacity = '0.3'
			uIteration()
		}
	}
}