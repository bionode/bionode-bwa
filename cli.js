#!/usr/bin/env node
var bwa = require('./')
var through = require('through2')
var minimist = require('minimist')

var argv = minimist(process.argv.slice(2))
var filenames = argv._.slice(1)
var operationArgs = argv._[0]
Object.keys(argv).forEach(function(key) {
  if (key !== '_') {
    operationArgs += ' -' + key + ' ' + argv[key]
  }
})

var operation = bwa(operationArgs)
operation(filenames)
.on('data', console.log)
.on('error', console.log)
