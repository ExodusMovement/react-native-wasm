## potential approaches:

- via webview component (will only support async functions)
- bundle a VM, e.g. https://github.com/perlin-network/life

## alternatives to WASM

- convert wasm to JS with [binaryen's](https://github.com/WebAssembly/binaryen) experimental wasm2js. At this point you might as well just use emscripten to convert to asm.js in the first place

## iOS nonsense

- WebAssembly broken on iOS 11.2: https://github.com/aspnet/Blazor/issues/73#issuecomment-364213098
- no support for WebAssembly.instantiateStreaming/compileStreaming()
- loading local files from WebView: https://stackoverflow.com/questions/24882834/wkwebview-not-loading-local-files-under-ios-8/28676439#28676439

### hacks for synchronous communication with WebView

- workaround/hack via javascript `prompt()` function: https://stackoverflow.com/questions/29249132/wkwebview-complex-communication-between-javascript-native-code/49474323#49474323

## Android nonsense

### hacks for synchronous communication with WebView

- sync JS via native-side loop + timer: https://stackoverflow.com/questions/37475073/android-main-thread-blocking-webview-thread

## How to load WASM:

- docs: https://developers.google.com/web/updates/2018/04/loading-wasm
- extending RN packager (if embedding in bundle): https://github.com/facebook/react-native/issues/505#issuecomment-273472688

## Questions

- how big are the .wasm files? Can we send them to the WebView as base64 or are they so big that we should run a static server on the main JS thread?

- how to load WASM in WebView?
  - inline in HTML
  - send as base64 via postMessage
  - load native-side
  - load WASM from some server - requires being online, but can maybe be cached until next app upgrade
  - to read: https://stackoverflow.com/questions/51538919/wkwebview-load-files-from-both-bundle-and-document-directory

## possible architectures:

- Avoid custom native code as much as possible. Use WebView from the JS side, without writing code to manage the webview native-side
  - issues: WebView is a react native component, so it needs to be rendered to work. This makes using it as a static util trickier.
  - 1. JS
  - - 2. importWasm(react-native-static-server url for '/path/to/assets/somemodule.wasm') OR
    - 2. importWasm('...wasmBase64...')
      - 3. WebView loads wasm, registers module by an id in some object, returns id, api
        - 4.  JS side resolves importWasm call with proxy to make api calls with this id
- Create a RN bridge around a native-side WebView instance. Still unclear how to easily fetch WASM from JS (assuming we're not embedding a WASM string)

## desired usage

```js
// load
const wasmModule = await WASM.import('/path/to/assets/somemodule.wasm')
// use like any other JS module with async-only apis
// probably with limited types
const result = await wasmModule.doMagic('hi', { blah: 'ho' })
```
