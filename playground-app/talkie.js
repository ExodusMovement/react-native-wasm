import { Alert } from 'react-native'

const createTalkie = () => {
	let setWebView
	let ready

	const webViewPromise = new Promise(resolve => {
		setWebView = resolve
	})

	const readyPromise = new Promise(resolve => {
		ready = resolve
	})

	let callbackId = 0
	const pending = {}

	const exec = (method, args) =>
		Promise.all([webViewPromise, readyPromise]).then(
			([webView]) =>
				new Promise((resolve, reject) => {
					callbackId = (callbackId + 1) & 0xffff
					pending[callbackId] = { resolve, reject }
					webView.postMessage(
						JSON.stringify({
							callbackId,
							method,
							args
						})
					)
				})
		)

	const onMessage = e => {
		const data = JSON.parse(e.nativeEvent.data)
		const { type, error, result, callbackId } = data
		if (type === 'event') {
			if (data.event === 'ready') ready(data.data)
			return
		}

		const defer = pending[callbackId]
		if (!defer) {
			console.error('unmatched calback')
			return
		}

		delete pending[callbackId]
		if (error) {
			defer.reject(new Error(error.message))
		} else {
			defer.resolve(result)
		}
	}

	const onError = e => {
		Alert.alert(`error: ${e}`)
	}

	const hasWebAssembly = () => readyPromise.then(data => data.hasWebAssembly)

	return {
		setWebView,
		exec,
		onMessage,
		onError,
		hasWebAssembly
	}
}

export default createTalkie
