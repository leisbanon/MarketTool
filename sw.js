self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open('market-tool-cache-v1').then(cache => {
			cache.addAll([
				'/',
				'/index.html',
				'/stock/stock.html',
				'/entrust/index.html',
				'/entrust/index_2.html',
				'/static/css/main.css',
				'/static/js/vue@v2.6.js',
				'/static/js/accounting.min.js',
				'/static/js/axios.min.js',
				'/static/js/moment.js',
				'/stockCommon.minxin.js'
			])
		})
	)
})

// self.addEventListener('fetch', event => {
// 	console.log(event.request.url)
// })