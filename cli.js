#!/usr/bin/env node
var bwa = require('./')
var yargs = require('yargs')
var json = require('ndjson')

var argv = yargs.argv
var options = {
  reference: argv._.length > 1 ? argv._[0] : null,
  reads: argv._.length > 1 ? argv._.slice(1) : null,
  alignment: argv.alignment,
  operation: argv.operation
}

var stream = bwa(options)
stream.pipe(json.stringify()).pipe(process.stdout)
stream.on('error', console.warn)

if (argv._[argv._.length - 1] === '-') {
  process.stdin
  .pipe(json.parse())
  .pipe(stream)
}
