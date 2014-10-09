var bwa = require('../')
var fs = require('fs')
var crypto = require('crypto')
var request = require('request')
var tool = require('tool-stream')
var through = require('through2')
var async = require('async')
var test = require('tape')

test("Align reads to reference with BWA", function (t) {
  t.plan(2)
  var referencePath = 'test/reference.fasta.gz'
  var readsPath = 'test/reads.fastq.gz'
  var alignmentPath = 'test/alignment.sam'
  var referenceURL = 'http://ftp.ncbi.nlm.nih.gov/genbank/genomes/Eukaryotes/protozoa/Guillardia_theta/Guith1/Primary_Assembly/unplaced_scaffolds/FASTA/unplaced.scaf.fa.gz'
  var readsURL = 'http://ftp.sra.ebi.ac.uk//vol1/fastq/SRR070/SRR070675/SRR070675.fastq.gz'

  var downloads = [
    download(referenceURL, referencePath),
    download(readsURL, readsPath)
  ]
  async.parallel(downloads, alignReadsToRef)

  function alignReadsToRef() {
    var msg = "should take paths for reference, reads and aligment. Reference should be indexed first."
    var mem = bwa() // default to mem
    mem([referencePath, readsPath, alignmentPath])
    .on('data', function(data) { checksum(data, '3dae171586e8f5fda2737795ff2e39df711701cb', msg, t) })

    var msg = "should align using a Stream that takes arrays of paths for reference and reads."
    var mem = bwa('mem -x pacbio')
    var memStream = mem() // we will pass arguments with write
    memStream.write([referencePath, readsPath])
    memStream.end()
    memStream.on('data', function(data) { checksum(data, 'a2ac465ac0d9e0879a9f9a43108e36b682f2e018', msg, t) })
  }
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

function checksum(data, hash, msg, t) {
  if (['index', 'aln'].indexOf(data.operation) === -1 && data.status === 'finished') {
    t.ok(fs.statSync(data.sam).size > 5500000, "check that it aligned something")
    // var alignmentFile = fs.createReadStream(data.sam)
    // var shasum = crypto.createHash('sha1')
    // alignmentFile.on('data', function(d) { shasum.update(d) })
    // alignmentFile.on('end', function() {
    //   var sha1 = shasum.digest('hex');
    //   t.equal(sha1, hash, msg)
    // })
  }
}
