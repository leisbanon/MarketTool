self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open('market-tool-cache-v1').then(catch => {
			return catch.addAll([
				'/',
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