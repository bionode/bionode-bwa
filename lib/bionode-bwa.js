// # bionode-bwa
// > A Node.js wrapper for the Burrow-Wheeler Aligner (BWA).
// >
// > doi: [?](?)
// > author: [Bruno Vieira](http://bmpvieira.com)
// > email: <mail@bmpvieira.com>
// > license: [MIT](https://raw.githubusercontent.com/bionode/bionode-bwa/master/LICENSE)
//
// ---
//
// ## Usage
// This module can be used in Node.js as described further below, or as a command line tool.
// Check https://github.com/lh3/bwa for a list of parameters that can be passed to bwa (currently only mem and index are supported).
// Examples:
//
//     $ npm install -g bionode-bwa
//
//     # bionode-bwa <reference> [reads...] <options>
//     $ bionode-bwa reference.fasta.gz reads.fastq.gz --alignment alignment.sam

var fs = require('fs')
var zlib = require('zlib')
var path = require('path')
var spawn = require('child_process').spawn
var through = require('through2')
var split = require('split')
var pumpify = require('pumpify')
var concat = require('concat-stream')
var debug = require('debug')('bionode-bwa')

module.exports = exports = BWA

// ## BWA
// Takes a BWA operation and returns a Stream that accepts arguments for it.
// Currently only 'index' and 'mem' are supported.
// If the output for alignment is omitted, the current reads basename will be used.
//
//     var bwa = require('bionode-bwa')
//     bwa('ref.fasta.gz', 'reads.fastq.gz')
//     .on('data', console.log)
//     => { operation: 'mem',
//          status: 'processing',
//          reference: 'reference.fasta.gz',
//          progress: { total: 11355, current: 0, percent: 0 },
//          sequences: [ 'reads.fastq.gz' ],
//          alignment: 'reads.sam' }
//        [...]
//        { operation: 'mem',
//          status: 'finished',
//          reference: 'reference.fasta.gz',
//          progress: { total: 11355, current: 11355, percent: 100 },
//          sequences: [ 'reads.fastq.gz' ],
//          alignment: 'reads.sam' }
//
// A callback style can also be used:
//
//     bwa(ref, reads, alignment, function(err, data) {
//       console.log(data)
//     })
//     => { operation: 'mem',
//          status: 'finished',
//          reference: 'reference.fasta.gz',
//          progress: { total: 11355, current: 11355, percent: 100 },
//          sequences: [ 'reads.fastq.gz' ],
//          sam: 'alignment.sam' }
//
// Or pipes:
//
//     var options = { operation: 'mem', params: '-x pacbio' }
//     var stream = bwa(options)
//     stream.write({reference: ref, reads: [pair1, pair2]})
//     stream.on('data', console.log)

var bwaPath = path.join(__dirname, '../bwa/bwa')

function BWA (reference, reads, alignment, cb) {
  var opts = reference
  if (typeof reference === 'string') {
    opts = {
      reference: reference,
      params: '',
      reads: reads,
      operation: 'mem',
      alignment: alignment
    }
  }
  var stream = through.obj(transform)
  if (opts.reads) { stream.write(opts.reads); stream.end() }
  if (cb) { stream.pipe(concat(cb)) }
  return stream

  function transform (obj, enc, next) {
    var self = this
    var log = Object.create(opts)
    log.status = 'processing'
    log.progress = { total: 0, current: 0, percent: 0 }
    opts.reference = opts.reference || obj.reference
    opts.reads = opts.reads || obj.reads
    opts.reads = Array.isArray(opts.reads) ? opts.reads : [opts.reads]
    opts.operation = opts.operation || 'mem'
    if (!opts.alignment) {
      opts.alignment = opts.reads[0]
      .replace('.gz', '')
      .substr(0, opts.reads[0].lastIndexOf('.')) + '.sam'
    }
    debug('opts', opts)
    if (!opts.reference || !opts.reads) {
      self.emit('error', new Error('Missing arguments: ' + opts))
      return next()
    }
    fs.stat(opts.reference + '.bwt', gotReferenceIndexExists)

    function gotReferenceIndexExists (err, stat) {
      debug('bwa ref exists', opts.reference + '.bwt')
      if (!err && stat && stat.isFile()) { return alignSequences() }

      log.operation = 'index'
      var bwa = spawn(bwaPath, ['index', opts.reference])

      bwa.stderr.on('data', function (data) {
        debug('bwa index', data.toString())
        log.progress = logging('index', log.progress, data)
        self.push(log)
      })

      bwa.on('close', function () {
        log.status = 'finished'
        debug('bwa close', opts)
        self.push(log)
        if (opts.operation === 'index') { return next() }
        alignSequences()
      })

      bwa.on('error', function (error) { self.emit('error', error) })
    }

    function alignSequences () {
      opts.reads.forEach(pipeLineCount)
      function pipeLineCount (reads) {
        var count = 0
        var compressed = reads.match(/.gz$/)
        var unzip = compressed ? zlib.createGunzip() : through()
        var counter = pumpify(
          fs.createReadStream(reads),
          unzip,
          split(),
          through(function (obj, enc, next) { count++; next() })
        )
        counter.resume()
        counter.on('end', function () { gotLinesCount(count) })
      }
      function gotLinesCount (count) {
        var sequencesNum = Math.round(count / 4)
        log.status = 'processing'
        log.operation = opts.operation
        log.progress = { total: sequencesNum, current: 0, percent: 0 }
        var options = [
          opts.operation,
          opts.reference,
          opts.reads.join(' ')
        ]
        if (opts.params) {
          opts.params.split(' ').forEach(function (param, i) {
            options.splice(1 + i, 0, param)
          })
        }
        debug('bwa options', options)

        var bwa = spawn(bwaPath, options)
        bwa.stderr.on('data', function (data) {
          debug('bwa align', data.toString())
          log.progress = logging(opts.operation, log.progress, data)
          self.push(log)
        })
        debug('bwa output', opts)
        bwa.stdout.pipe(fs.createWriteStream(opts.alignment))
        bwa.on('close', function (code) {
          debug('bwa code', code)
          if (code) {
            var error = new Error('Unknown error. Maybe check that "' + obj[0] + '" exists')
            self.emit('error', error)
          }
          log.status = 'finished'
          self.push(log)
          next()
        })
        bwa.on('error', function (error) { self.emit('error', error) })
      }
    }
  }
}

function logging (operation, progress, data) {
  var bwaLog = data.toString()
  if (operation === 'index') {
    if (bwaLog.indexOf('BWTIncCreate') !== -1) {
      var total = bwaLog
      .split(', ')[0]
      .replace('[BWTIncCreate] textLength=', '')
      progress.total = Number(total)
    }
    if (bwaLog.indexOf('characters processed') !== -1) {
      progress.current = Number(bwaLog.split(' ')[4])
    }
  } else if (operation === 'mem') {
    if (bwaLog.indexOf('Processed') !== -1) {
      progress.current = Number(bwaLog.split(' ')[2])
    }
  }
  if (progress.current && progress.total) {
    var percent = progress.current * 100 / progress.total
    progress.percent = Math.round(percent)
  }
  return progress
}
