import React from 'react'
import { Alert, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import injectedJS from './injected-js'
import injectedHTML from './injected-html'
import createTalkie from './talkie'

const styles = StyleSheet.create({
	webView: {
		width: 0,
		height: 0
	}
})

export class Wasm extends React.Component {
	shouldComponentUpdate = () => false
	importFromBase64 = async wasmString => {}
	importFromPath = async path => {}
	constructor(props) {
		super(props)
		this.source = { html: injectedHTML(injectedJS) }
		this.talkie = createTalkie()
	}
	async componentDidMount() {
		this.talkie.setWebView(this.refs.webView)
		if (!(await this.talkie.hasWebAssembly())) {
			throw new Error('WebAssembly unavailable')
		}

		for (const url of ['fact.wasm', '/fact.wasm', 'web/fact.wasm', '/Documents/fact.wasm']) {
			try {
				await this.talkie.exec('importWasmFromUrl', [url])
			} catch (err) {
				console.warn('FAILED FOR ' + url)
			}
		}
	}
	componentWillUnmount() {
		throw new Error('BOO!!!')
	}
	render() {
		return (
			<WebView
				useWebKit={true}
				originWhitelist={['*']}
				javaScriptEnabled={true}
				ref="webView"
				style={styles.webView}
				source={this.source}
				onMessage={this.talkie.onMessage}
				onError={this.talkie.onError}
				baseUrl="web/"
			/>
		)
	}
}
