const injected = function(global) {
	const postMessage = obj => window.ReactNativeWebView.postMessage(JSON.stringify(obj))
	const isPromise = val => typeof val !== 'undefined' && typeof val.then === 'function'

	// setInterval(() => {
	// 	fetch('fact.wasm') //.then(console.log, console.error)
	// 	fetch('web/fact.wasm') //.then(console.log, console.error)
	// 	fetch('/fact.wasm') //.then(console.log, console.error)
	// }, 2000)

	const loadWasmFromArrayBuffer = buffer =>
		WebAssembly.compile(buffer).then(wasmModule => WebAssembly.instantiate(wasmModule))

	const importWasmFromUrl = url =>
		fetch(url)
			.then(res => res.arrayBuffer())
			.then(loadWasmFromArrayBuffer)
			.then(instance => Object.keys(instance.exports))

	const context = {
		echo: message => Promise.resolve(message),
		importWasmFromUrl
	}

	const onmessage = e => {
		const { method, args, callbackId } = JSON.parse(e.data)
		const callback = (error, result) =>
			postMessage({
				type: 'callback',
				callbackId,
				error: error && { message: error.message, name: error.name },
				result
			})

		let syncResult
		try {
			syncResult = context[method].apply(null, args)
		} catch (err) {
			return callback(err)
		}

		if (isPromise(syncResult)) {
			syncResult.then(result => callback(null, result), callback)
		} else {
			callback(null, syncResult)
		}
	}

	document.addEventListener('message', onmessage)
	window.addEventListener('message', onmessage)

	postMessage({
		type: 'event',
		event: 'ready',
		data: {
			hasWebAssembly: 'WebAssembly' in global
		}
	})
}

module.exports = `(${injected})(window)`
