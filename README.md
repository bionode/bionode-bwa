<p align="center">
  <a href="http://bionode.io">
    <img height="200" width="200" title="bionode" alt="bionode logo" src="https://rawgithub.com/bionode/bionode/master/docs/bionode-logo.min.svg"/>
  </a>
  <br/>
  <a href="http://bionode.io/">bionode.io</a>
</p>
# bionode-bwa [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coveralls Status][coveralls-image]][coveralls-url] [![Dependency Status][depstat-image]][depstat-url] [![DOI][doi-image]][doi-url]

> A Node.js wrapper for the Burrow-Wheeler Aligner (BWA).

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
var mem = bwa('mem -t 4') // Use BWA mem algorithm with 4 threads
mem('reference.fasta.gz reads.fastq.gz alignment.sam')
.on('data', console.log)
```

Please read the [documentation](http://rawgit.com/bionode/bionode-bwa/master/docs/bionode-bwa.html) for the methods exposed by bionode-bwa.  
Check [BWA's documentation](http://bio-bwa.sourceforge.net/bwa.shtml) for the arguments that can be passed.

### Command line examples
```sh
$ bionode-bwa mem reference.fasta.gz reads.fastq.gz alignment.sam
$ bionode-bwa mem -t 4 reference.fasta.gz reads.fastq.gz
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
Check the [issues](http://github.com/bionode/bionode-bwa/issues) for ways to contribute.

Contacts
--------
Bruno Vieira <[mail@bmpvieira.com](mailto:mail@bmpvieira.com)> [@bmpvieira](//twitter.com/bmpvieira)  
For BWA support contact [Heng Li](https://github.com/lh3/bwa)

License
-------

bionode-bwa is licensed under the [MIT](https://raw.github.com/bionode/bionode/master/LICENSE) license.  
Check [ChooseALicense.com](http://choosealicense.com/licenses/mit) for details.

[npm-url]: //npmjs.org/package/bionode-bwa
[npm-image]: https://badge.fury.io/js/bionode-bwa.png
[travis-url]: //travis-ci.org/bionode/bionode-bwa
[travis-image]: https://travis-ci.org/bionode/bionode-bwa.png?branch=master
[coveralls-url]: //coveralls.io/r/bionode/bionode-bwa
[coveralls-image]: https://coveralls.io/repos/bionode/bionode-bwa/badge.png
[depstat-url]: http://david-dm.org/bionode/bionode-bwa
[depstat-image]: http://david-dm.org/bionode/bionode-bwa.png
[doi-url]: http://dx.doi.org/
[doi-image]: https://zenodo.org/badge/xxxx/bionode/bionode-bwa.png

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/bionode/bionode-bwa/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
