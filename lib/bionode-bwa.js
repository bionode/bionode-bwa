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
// Check https://github.com/lh3/bwa for a list of parameters that can be passed to bwa.
// Examples:
//
//     $ npm install -g bionode-bwa
//
//     # bionode-bwa [operation] [arguments...]
//     $ bionode-bwa mem reference.fasta.gz reads.fastq.gz alignment.sam SRR1509835.bwa

var fs = require('fs')
var zlib = require('zlib')
var path = require('path')
var spawn = require('child_process').spawn
var through = require('through2')
var split = require('split')
var debug = require('debug')('bionode-bwa')

module.exports = exports = BWA

// ## BWA
// Takes a BWA operation and returns a Stream that accepts arguments for it.
// For example, for ```mem```, arguments can be a string of space separated filenames
// like ```reference.fasta reads.fastq alignment.sam``` or an array with filenames or variables
// ```[referenceFasta, 'reads.fastq', outputPath]```.
// If the output for sam is omitted, the current directory will be used.
//
//     var bwa = require('bionode-bwa')
//     var mem = bwa('mem')
//     mem('ref.fasta.gz, reads.fastq.gz')
//     .on('data', console.log)
//     => { operation: 'mem',
//          status: 'processing',
//          reference: 'reference.fasta.gz',
//          progress: { total: 11355, current: 0, percent: 0 },
//          sequences: [ 'reads.fastq.gz' ],
//          sam: 'reads.sam' }
//        [...]
//        { operation: 'mem',
//          status: 'finished',
//          reference: 'reference.fasta.gz',
//          progress: { total: 11355, current: 11355, percent: 100 },
//          sequences: [ 'reads.fastq.gz' ],
//          sam: 'reads.sam' }
//
// A callback style can also be used:
//
//     var mem = bwa('mem -x pacbio')
//     mem([ref, reads, alignment], function(err, data) {
//       console.log(data)
//     })
//     => { operation: 'mem',
//          status: 'finished',
//          reference: 'reference.fasta.gz',
//          progress: { total: 11355, current: 11355, percent: 100 },
//          sequences: [ 'reads.fastq.gz' ],
//          sam: 'alignment.sam' }
//
// Or pipes, for example, from a file with just a list of string like ```reference.fasta reads.fastq alignment.sam``` .
//
//     var split = require('split')
//     var mem = bwa() // when operation is omitted, 'mem' is used as default
//     fs.createReadStream('filenamesList.txt')
//     .pipe(split())
//     .pipe(mem())
//     .on('data', console.log)

function BWA(args) {
  var args = args || 'mem'
  var bwaPath = path.join(__dirname, '../bwa/bwa')

  return bwaStream

  function bwaStream(params, callback) {
    var stream = through.obj(transform)
    if (params) { stream.write(params); stream.end() }
    if (callback) {
      var result
      stream.on('data', function(data) {
        result = data
      })
      stream.on('end', function() {
        callback(null, result)
      })
      stream.on('error', callback)
    }
    return stream

    function transform(obj, enc, next) {
      var self = this

      if (typeof obj === 'string') { obj = obj.split(' ') }

      if (obj[0] === '') { return next() }

      if (obj.length > 4) { self.emit('error', new Error('Too many arguments')); next() }

      var options = args.split(' ')
      var operation = options[0]

      var reference
      var sequences = []
      var sam
      var sai
      obj.forEach(function(filename) {
        var filenameLC = filename.toLowerCase()
        if (filenameLC.match(/\.(fasta|fa$|fa.gz$|fna$|fna.gz$)/)) { reference = filename }
        else if (filenameLC.match(/\.(fastq|fq$|fq.gz$)/)) { sequences.push(filename) }
        else if (filenameLC.match(/\.(sam)/)) { sam = filename }
        else if (filenameLC.match(/\.(sai)/)) { sai = filename }
      })
      if (!sai && operation === 'aln') { sai =  sequences[0].replace(/\.(fast|fq|fa).*/, '.sai')}
      if (!sam && operation !== 'aln') { sam =  sequences[0].replace(/\.(fast|fq|fa).*/, '.sam')}

      var log = {
        operation: operation,
        status: 'processing',
        reference: reference
      }
      if (['index', 'mem'].indexOf(operation) !== -1) {
        log.progress = { total: 0, current: 0, percent: 0 }
      }

      fs.exists(reference + '.bwt', gotReferenceIndexExists)
      function gotReferenceIndexExists(exists) {
        if (!exists) {
          log.operation = 'index'
          var bwa = spawn(bwaPath, ['index', reference])

          bwa.stderr.on('data', function(data) {
            debug('bwa index', data.toString())
            if (['index', 'mem'].indexOf(operation) !== -1) {
              log.progress = logging('index', log.progress, data)
            }
            self.push(log)
          })

          bwa.on('close', function() {
            log.status = 'finished'
            self.push(log)
            alignSequences(self)
          })
        }
        else { alignSequences(self) }
      }

      function alignSequences(self) {
        var lineCount = through()
        var linesCounter = 0
        sequences.forEach(pipeLineCount)
        function pipeLineCount(sequencePath) {
          var unzip = sequencePath.match(/.gz$/) ? zlib.createGunzip() : through()
          fs.createReadStream(sequencePath)
          .pipe(unzip)
          .pipe(lineCount)
        }

        lineCount
        .pipe(split())
        .on('data', function(data) { linesCounter += 1 })
        .on('end', function() { gotLinesCount(self) })

        function gotLinesCount(self) {
          var sequencesNum = Math.round(linesCounter / 4)
          options.push(reference)
          if (sai && operation !== 'aln') { options.push(sai) }
          if (sequences) { options = options.concat(sequences) }
          if (sai && operation === 'aln') { options.push(sai) }
          debug('bwa align options', options)

          log.operation = operation
          log.sequences = sequences
          if (sam) { log.sam = sam }
          if (sai) { log.sai = sai }
          log.status = 'processing'
          if (['index', 'mem'].indexOf(operation) !== -1) {
            log.progress = { total: sequencesNum, current: 0, percent: 0 }
          }

          var bwa = spawn(bwaPath, options)

          bwa.stderr.on('data', function(data) {
            debug('bwa align', data.toString())
            if (['index', 'mem'].indexOf(operation) !== -1) {
              log.progress = logging(operation, log.progress, data)
            }
            self.push(log)
          })
          var output = operation === 'aln' ? sai : sam
          var outputFile = fs.createWriteStream(output)
          bwa.stdout.on('data', function(data) { outputFile.write(data) })

          bwa.on('close', function(code) {
            if (code) {
              self.emit('error', new Error('Unknown error, check that "'+obj[0]+'" exists'))
            }
            else {
              log.status = 'finished'
              outputFile.end()
              self.push(log)
              next()
            }
          })
        }
      }

      function logging(op, progress, data) {
        var bwaLog = data.toString()
        if (op === 'index') {
          if (bwaLog.indexOf('BWTIncCreate') !== -1) {
            progress.total = Number(bwaLog.split(', ')[0].replace('[BWTIncCreate] textLength=', ''))
          }
          if (bwaLog.indexOf('characters processed') !== -1) {
            progress.current = Number(bwaLog.split(' ')[4])
          }
        }
        else if (op === 'mem') {
          if (bwaLog.indexOf('Processed') !== -1) {
            progress.current = Number(bwaLog.split(' ')[2])
          }
        }
        if (progress.current && progress.total) {
          progress.percent = Math.round(progress.current * 100 / progress.total)
        }
        return progress
      }
    }
  }
}
