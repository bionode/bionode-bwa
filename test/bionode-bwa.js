var bwa = require('../')
var fs = require('fs')
var crypto = require('crypto')
var request = require('request')
var should = require('should')
var tool = require('tool-stream')
var through = require('through2')
var async = require('async')

require('mocha')

describe("Align reads to reference with BWA", function() {
  this.timeout(6000000);
  var referencePath = 'test/reference.fasta.gz'
  var readsPath = 'test/reads.fastq.gz'
  var alignmentPath = 'test/alignment.sam'

  it("should take paths for reference, reads and aligment. Reference should be indexed first.", function(done) {
    var referenceURL = 'http://ftp.ncbi.nlm.nih.gov/genbank/genomes/Eukaryotes/protozoa/Guillardia_theta/Guith1/Primary_Assembly/unplaced_scaffolds/FASTA/unplaced.scaf.fa.gz'
    var readsURL = 'http://ftp.sra.ebi.ac.uk//vol1/fastq/SRR070/SRR070675/SRR070675.fastq.gz'
    var downloads = [
      download(referenceURL, referencePath),
      download(readsURL, readsPath)
    ]
    async.parallel(downloads, alignReadsToRef)

    function alignReadsToRef() {
      var mem = bwa() // default to mem
      mem([referencePath, readsPath, alignmentPath])
      .on('data', function(data) { checksum(data, '3dae171586e8f5fda2737795ff2e39df711701cb', done) })
    }
  })

  it("should align using a Stream that takes arrays of paths for reference and reads.", function(done) {
    var mem = bwa('mem -x pacbio')
    var memStream = mem() // we will pass arguments with write
    memStream.write([referencePath, readsPath])
    memStream.end()
    memStream.on('data', function(data) { checksum(data, 'a2ac465ac0d9e0879a9f9a43108e36b682f2e018', done) })
  })
})

function download(url, path) {
  return function task(callback) {
    var read = request(url)
    var write = fs.createWriteStream(path)
    read
    .pipe(write)
    .on('finish', callback)
    .on('error', callback)
  }
}

function checksum(data, hash, cb) {
  if (['index', 'aln'].indexOf(data.operation) === -1 && data.status === 'finished') {
    var alignmentFile = fs.createReadStream(data.sam)
    var shasum = crypto.createHash('sha1')
    alignmentFile.on('data', function(d) { shasum.update(d) })
    alignmentFile.on('end', function() {
      var sha1 = shasum.digest('hex');
      sha1.should.eql(hash)
      cb()
    })
  }
}
