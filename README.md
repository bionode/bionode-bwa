<p align="center">
  <a href="http://bionode.io">
    <img height="200" width="200" title="bionode" alt="bionode logo" src="https://rawgithub.com/bionode/bionode/master/docs/bionode-logo.min.svg"/>
  </a>
  <br/>
  <a href="http://bionode.io/">bionode.io</a>
</p>
# bionode-bwa
> A Node.js wrapper for the Burrow-Wheeler Aligner (BWA).

[![NPM](https://nodei.co/npm/bionode-bwa.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/bionode-bwa/)

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Standard style][js-standard-style-image]][js-standard-style-url]  
[![Gitter chat][gitter-image]][gitter-url]
[![DOI][doi-image]][doi-url]  
[![Stories in Ready at waffle.io][waffle-image]][waffle-url]


Install
-------

Install bionode-bwa with [npm](http://npmjs.org/bionode-bwa):

```sh
$ npm install bionode-bwa
```
To use it as a command line tool, you can install it globally by adding ```-g``` .

Usage
-----

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

Contributing
------------

To contribute, clone this repo locally and commit your code on a separate branch.

Please write unit tests for your code, and check that everything works by running the following before opening a pull-request:

```sh
$ npm test
```

Please also check for code coverage:

```sh
$ npm run coverage
```

To rebuild the documentation using the comments in the code:

```sh
$ npm run build-docs
```
Check the [issues](http://waffle.io/bionode/bionode-bwa) for ways to contribute.

Contacts
--------
Bruno Vieira <[mail@bmpvieira.com](mailto:mail@bmpvieira.com)> [@bmpvieira](//twitter.com/bmpvieira)  
For BWA support contact [Heng Li](https://github.com/lh3/bwa)

License
-------

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
