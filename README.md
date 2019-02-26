## desired usage

A true shim for the WebAssembly global would be best, but is probably impossible, due to the async nature of communcation with WebView

A nice second best would be an almost-shim, a la:

```js
// load
const wasmModule = await WebAssembly.instantiateStreaming('/path/to/assets/somemodule.wasm')
// use as with WebAssembly, but everything's async
const result = await wasmModule.instance.exports.doSomething('hi', { blah: 'ho' })
``` 

## potential approaches:

- via webview component (will only support async functions)
- for sync invocations 
  - maybe it's possible to bundle a VM, e.g. https://github.com/perlin-network/life
  - hacks, such as:
    - iOS: workaround/hack via javascript `prompt()` function: https://stackoverflow.com/questions/29249132/wkwebview-complex-communication-between-javascript-native-code/49474323#49474323
    - Android: - sync JS via native-side loop + timer: https://stackoverflow.com/questions/37475073/android-main-thread-blocking-webview-thread

for now, it looks like async is enough

### JS only vs JS + Native-side WebView manipulation

JS-only would be cleanest, but we may need additional control over the WebView, e.g. to make it load .wasm from local assets. Still need to experiment to see if `fetch('/path/to/somemodule.wasm')` can be made to work

## alternatives to WASM

- emscripten
- convert wasm to JS with [binaryen's](https://github.com/WebAssembly/binaryen) experimental wasm2js. But at this point you might as well just use emscripten to convert to asm.js in the first place

## iOS nonsense

- WebAssembly broken on iOS 11.2: https://github.com/aspnet/Blazor/issues/73#issuecomment-364213098
- no support for WebAssembly.instantiateStreaming/compileStreaming()
- loading local files from WebView: https://stackoverflow.com/questions/24882834/wkwebview-not-loading-local-files-under-ios-8/28676439#28676439

## How to load WASM

- docs: https://developers.google.com/web/updates/2018/04/loading-wasm
- extending RN packager (if embedding in .wasm in bundle): https://github.com/facebook/react-native/issues/505#issuecomment-273472688

## Questions

- how to load WASM in WebView?
  - `fetch()` from local assets (so far unsuccessful)
  - load WASM from some server - requires being online, but can maybe be cached until next app upgrade
  - inline in HTML
  - inline in main bundle, send as base64 via postMessage. This sounds slow. Monero's wasm alone is a >1MB binary.
  - load from native-side (don't know if possible)

## potentially useful tools / modules / SO questions

[comlink](https://github.com/GoogleChromeLabs/comlink) module that creates a proxy object that works across postMessage. Will need [proxy-polyfill](https://github.com/GoogleChrome/proxy-polyfill)

wkwebview (not exactly what's needed but could be helpful)
- loading files from doc folder: https://stackoverflow.com/questions/39336235/wkwebview-does-load-resources-from-local-document-folder?rq=1
- requesting files from doc folder: https://stackoverflow.com/a/49637828 (same as https://stackoverflow.com/a/49638654)
- allowing wkwebview to access a local file (sort of): https://stackoverflow.com/a/52953127
- https://stackoverflow.com/questions/51538919/wkwebview-load-files-from-both-bundle-and-document-directory