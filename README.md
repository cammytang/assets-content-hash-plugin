# assets-content-hash-plugin

This Webpack plugin will

1. generate contenthash for every file you pass by param 'file';
2. rename filename to new one which include hash, format xxx.yyy.[hash].[js|css]
3. replace file with new filename in index.html

***TODO: Auto inject assets file to index.html with correct meta tag.***

## Why Is This Useful?

You may use some static files in index.html, which are assets under public path.

When these static files changed, user may can't get the updated ones because of browser cache. Containing content hash in filename can avoid the cache issue.



### Example output:

The output is a file whose name contains its content hash:

```html
my-app/build/config.510e9f86.js
```

sync filename in build/index.html

```html
<script src='https://myapp.com/config.510e9f86.js'></script>
```

## Install

```sh
npm install assets-content-hash-plugin
```

## Configuration

In your webpack config include the plug-in. And add it to your config:

```js
import AssetsContentHashPlugin from 'assets-content-hash-plugin';
// ...
module.exports = {
    // ....
    plugins: [new AssetsContentHashPlugin({
      file:['config.js','common.css']
    })]
}
```

### Options

You can pass the following options:

#### `file`
Required. string or string array. Asset file path.

#### `html`

Optional. `index.html` by default.

### Dependency
```html
loader-utils 
```
