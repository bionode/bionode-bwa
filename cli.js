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

if (!process.stdin.isTTY) {
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', function(data) {
    var data = data.trim().replace(/['"]/g, '')
    if (data === '') { return }
    filenames.push(data)
    operation(filenames).pipe(JSONstringify()).pipe(process.stdout)
  })
}
else {
  operation(filenames).pipe(JSONstringify()).pipe(process.stdout)
}

function JSONstringify() {
  var stream = through.obj(transform)
  return stream
  function transform(obj, enc, next) {
    var data = JSON.stringify(obj).trim()
    if (data === '') { return next() }
    this.push(data + '\n')
    next()
  }
}
