<p align="center">
  <a href="http://bionode.io">
    <img height="200" width="200" title="bionode" alt="bionode logo" src="https://rawgithub.com/bionode/bionode/master/docs/bionode-logo.min.svg"/>
  </a>
  <br/>
  <a href="http://bionode.io/">bionode.io</a>
</p>

# bionode-bwa

> A Node.js wrapper for the Burrow-Wheeler Aligner (BWA).

[![npm](https://img.shields.io/npm/v/bionode-bwa.svg?style=flat-square)](http://npmjs.org/package/bionode-bwa)[![Build Status][travis-image]][travis-url]
[![Travis](https://img.shields.io/travis/bionode/bionode-bwa.svg?style=flat-square)](https://travis-ci.org/bionode/bionode-bwa)
[![Coveralls](https://img.shields.io/coveralls/bionode/bionode-bwa.svg?style=flat-square)](http://coveralls.io/r/bionode/bionode-bwa)
[![Dependencies](http://img.shields.io/david/bionode/bionode-bwa.svg?style=flat-square)](http://david-dm.org/bionode/bionode-bwa)
[![npm](https://img.shields.io/npm/dt/bionode-bwa.svg?style=flat-square)](https://www.npmjs.com/package/bionode-bwa)
[![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg?style=flat-square)](https://gitter.im/bionode/bionode-bwa)


## Install

You need to install the latest Node.JS first, please check [nodejs.org](http://nodejs.org) or do the following:

```bash
# Ubuntu
sudo apt-get install npm
# Mac
brew install node
# Both
npm install -g n
n stable
```

To use `bionode-bwa` as a command line tool, you can install it globally with `-g`.

```bash
npm install bionode-bwa -g
```

Or, if you want to use it as a JavaScript library, you need to install it in your local project folder inside the `node_modules` directory by doing the same command **without** `-g`.

```bash
npm i bionode-bwa # 'i' can be used as shorcut to 'install'
```


## Usage

If you're using bionode-bwa with Node.js, you can require the module:

```js
var bwa = require('bionode-bwa')
// aligment path is optional, reads name used instead with sam suffix
bwa('reference.fasta.gz', 'reads.fastq.gz', 'alignment.sam')
.on('data', console.log)
```

```js
var options = {
  operation: 'mem',
  params: '-t 4'
}
var stream = bwa(options) // Use BWA mem algorithm with 4 threads
var obj = {
  reference: 'reference.fasta.gz',
  reads: ['reads.fastq.gz']
}
stream.write(obj)
```

Please read the [documentation](http://rawgit.com/bionode/bionode-bwa/master/docs/bionode-bwa.html) for the methods exposed by bionode-bwa.  
Check [BWA's documentation](http://bio-bwa.sourceforge.net/bwa.shtml) for the arguments that can be passed.


### Command line examples
```sh
$ bionode-bwa reference.fasta.gz reads.fastq.gz --alignment out.sam
$ echo '{"reference": "ref.fasta.gz", "reads": "[p1.fq, p2.fq]"}' | bionode-bwa  -
```


## Contributing
We welcome all kinds of contributions at all levels of experience, please read the [CONTRIBUTING.md](CONTRIBUTING.md) to get started!


## Communication channels

Don't be shy! Come talk to us :smiley:

* **Email** [mail@bionode.io](mailto:mail@bionode.io)
* **Chat room** [http://gitter.im/bionode/bionode](http://gitter.im/bionode/bionode)
* **IRC** #bionode on Freenode
* **Twitter** [@bionode](http://twitter.com/@bionode)


## License

bionode-bwa is licensed under the [MIT](https://raw.github.com/bionode/bionode/master/LICENSE) license.  
Check [ChooseALicense.com](http://choosealicense.com/licenses/mit) for details.

[npm-url]: http://npmjs.org/package/bionode-bwa
[npm-image]: http://img.shields.io/npm/v/bionode-bwa.svg?style=flat-square
[travis-url]: http:////travis-ci.org/bionode/bionode-bwa
[travis-image]: http://img.shields.io/travis/bionode/bionode-bwa.svg?style=flat-square
[coveralls-url]: http:////coveralls.io/r/bionode/bionode-bwa
[coveralls-image]: http://img.shields.io/coveralls/bionode/bionode-bwa.svg?style=flat-square
[depstat-url]: http://david-dm.org/bionode/bionode-bwa
[depstat-image]: http://img.shields.io/david/bionode/bionode-bwa.svg?style=flat-square
[js-standard-style-url]: https://github.com/feross/standard
[js-standard-style-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[gitter-image]: http://img.shields.io/badge/gitter-bionode/bionode--bwa-brightgreen.svg?style=flat-square
[gitter-url]: https://gitter.im/bionode/bionode-bwa
[waffle-image]: https://badge.waffle.io/bionode/bionode-bwa.png?label=ready&title=issues%20ready
[waffle-url]: https://waffle.io/bionode/bionode-bwa
[doi-url]: http://dx.doi.org/10.5281/zenodo.11487
[doi-image]: http://img.shields.io/badge/doi-10.5281/zenodo.11487-blue.svg?style=flat-square
