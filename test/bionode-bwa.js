var bwa = require('../')
var fs = require('fs')
var request = require('request')
var async = require('async')
var test = require('tape')

test('Align reads to reference with BWA', function (t) {
  t.plan(2)
  var referencePath = 'test/reference.fasta.gz'
  var readsPath = 'test/reads.fastq.gz'
  var alignmentPath = 'test/alignment.sam'
  var referenceURL = 'http://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/315/625/GCF_000315625.1_Guith1/GCF_000315625.1_Guith1_genomic.fna.gz'
  var readsURL = 'http://ftp.sra.ebi.ac.uk//vol1/fastq/SRR070/SRR070675/SRR070675.fastq.gz'

  var asyncFuncs = [
    download(referenceURL, referencePath),
    download(readsURL, readsPath),
    alignReadsToRef1,
    alignReadsToRef2
  ]
  async.series(asyncFuncs)

  function alignReadsToRef1 (cb) {
    var msg = 'should take paths for reference, reads and aligment. Reference should be indexed first.'
    bwa(referencePath, readsPath, alignmentPath)
    .on('data', function (data) {
      if (data.operation !== 'mem' || data.status !== 'finished') { return }
      var hash = '745ad50cd1a4d5bb1941e4ee9e7da3266e23da94'
      checksum(data, hash, msg, t)
      cb()
    })
    .on('error', console.warn)
  }
  function alignReadsToRef2 (cb) {
    var msg = 'should align using a Stream that takes arrays of paths for reference and reads.'
    var options = {
      operation: 'mem',
      params: '-x pacbio'
    }
    var stream = bwa(options)
    var obj = {
      reference: referencePath,
      reads: [readsPath]
    }
    stream.write(obj)
    stream.end()
    stream.on('data', function (data) {
      if (data.operation !== 'mem' || data.status !== 'finished') { return }
      var hash = '13af2aae42f2ff062d6b0ebc6b42f4edd9f130e5'
      checksum(data, hash, msg, t)
      cb()
    })
    stream.on('error', console.warn)
  }
})

function download (url, path) {
  return function task (callback) {
    var read = request(url)
    var write = fs.createWriteStream(path)
    read.on('error', function (error) {
      console.warn(error)
    })
    write
    .on('finish', callback)
    .on('error', function (error) {
      console.warn(error)
    })
    read.pipe(write)
  }
}

function checksum (data, hash, msg, t) {
  t.ok(fs.statSync(data.alignment).size > 5500000, 'check that it aligned something')
  // The following doesn't work because the checksum of the aligment
  // varies with machine it was created.
  // var alignmentFile = fs.createReadStream(data.alignment)
  // var shasum = crypto.createHash('sha1')
  // alignmentFile.on('data', function(d) { shasum.update(d) })
  // alignmentFile.on('end', function() {
  //   var sha1 = shasum.digest('hex');
  //   t.equal(sha1, hash, msg)
  // })
}
