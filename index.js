const path = require('path');
const loaderUtils = require('loader-utils');

/*
input param
{
  file: string|array; // filepath, like 'config.js'
  hasInjectToHtml?: boolean; // default to be true. if false, plugin can inject the files to html.
  html?: string; // default to be 'index.html'
}
features:
1.generate a file include build hash;
2.rename filename to new one which include hash, format xxx.yyy.[hash].[js|css]
3.replace file with new filename in index.html
 */
class BuildHashPlugin {
	constructor(options) {
		this.options = {
			file: [],
			hasInjectToHtml: true,
			html: 'index.html',
			hashNumber: 8,
		};

		if (!options) {
			return;
		}

		if (options.file) {
			if (typeof options.file === 'string') {
				this.options.file.push(options.file);
			} else if (Object.prototype.toString.call(options.file) === '[object Array]') {
				this.options.file = options.file;
			} else {
				const err = new Error('file is required, should be string or array!');
				throw err;
			}
		} else {
			const err = new Error('file is required, should be string or array!');
			throw err;
		}

		if (options.hasInjectToHtml) {
			this.options.hasInjectToHtml = options.hasInjectToHtml;
		}

		if (options.html) {
			this.options.html = options.html;
		}
	}

	analyzeFile(file) {
		const fileArry = file.split('/');
		let filename = file,
				filepath = file;
		if (fileArry.length >= 1) {
			filename = fileArry[fileArry.length - 1];
		}
		return {
			filename,
			filepath,
		};
	}

	generateNewFilename(filename, hash) {
		const file = filename.split('.');
		if (file.length < 2) {
			return filename;
		} else {
			const filetype = file[file.length - 1];
			file.fill(hash, file.length - 1).push(filetype);
			return file.join('.');
		}
	}

	apply(compiler) {
		const indexFile = path.resolve(compiler.options.output.path || '.', this.options.html); // index.html

		compiler.hooks.afterEmit.tap('BuildHashPlugin', (compilation, callback) => {
			const that = this;

			(this.options.file || []).forEach((fileItem) => {
				const file = that.analyzeFile(fileItem);
				const filename = file.filename;
				const filepath = file.filepath;
				const staticFile = path.resolve(compiler.options.output.path || '.', filepath);

				const buffer = compiler.outputFileSystem.readFileSync(staticFile, 'utf8');
				const contentHash = loaderUtils.getHashDigest(buffer);
				const contentHash8 = contentHash.substring(0,8);

				const newFilename = this.generateNewFilename(filename, contentHash8);
				// Step 1: replace filename in index.html
				if (this.options.hasInjectToHtml) {
					let indexHtml = compiler.outputFileSystem.readFileSync(indexFile, 'utf8');
					indexHtml = indexHtml.replace(filename, newFilename); //TODO use filepath to check
					compiler.outputFileSystem.writeFileSync(indexFile, indexHtml, callback);
				}
				// Step 2: rename filename
				const newFile = staticFile.replace(filename, newFilename);
				compiler.outputFileSystem.renameSync(staticFile, newFile);
				if (!this.options.hasInjectToHtml) {
					//TODO: need inject the file to html
				}
			});
		});
	}
}

module.exports = BuildHashPlugin;
