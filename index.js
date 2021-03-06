var express = require('express')
var path = require('path')
var busboy = require('connect-busboy')

var pdfFillForm = require('pdf-fill-form');
var fs = require('fs');

var app = express()

//var sourcePDF = 'documento.pdf'
var destinationPDF = 'rellenado.pdf'
var fields;

var bodyParser = require('body-parser')
app.use(busboy())
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


var html = "<html><body><form method='post' action='/download'>"



app.get('/', (req, res) => {
  res.send('<form method="post" action="/form" enctype="multipart/form-data"> \
  <input type="file" name="myPdf" accept="application/pdf"> \
  <input type="submit"> \
  </form>')
})

app.post('/pdf', (req, res) => {
  console.log("Solicitado /pdf")
  var fstream
  req.pipe(req.busboy)
  req.busboy.on('file', function (fieldname, file, filename) {
    console.log("Sent " + filename)
    sourcePDF = path.join(__dirname, 'img', filename)

    console.log(req.headers)

    res.send("hola")
/*
    if (req.body) {
      var pdf = pdfFillForm.writeSync(sourcePDF, req.body, { "save": "pdf" } );
      fs.writeFile(destinationPDF, pdf, (err) => {
        if (!err)
        res.download(destinationPDF)
        else
        res.send("ERROR NIÑO")
      });
    }
    else {
      fstream = fs.createWriteStream(sourcePDF)
      file.pipe(fstream)
      fstream.on('close', function () {
        console.log("Upload finished of " + filename)
        pdfFillForm.read(path.join(__dirname, 'img', filename))
        .then(function(result) {
          res.write(JSON.stringify(result, null, "\t"))
        })
      })
    }*/
  })

})

app.post('/form', (req, res) => {
  console.log("Solicitado /form")
   var fstream;
   req.pipe(req.busboy);
   req.busboy.on('file', function (fieldname, file, filename) {
       console.log("Uploading: " + filename);

       sourcePDF = path.join(__dirname, 'img', filename)

       //Path where image will be uploaded
       fstream = fs.createWriteStream(__dirname + '/img/' + filename);
       file.pipe(fstream);
       fstream.on('close', function () {
           console.log("Upload Finished of " + filename);
           pdfFillForm.read(path.join(__dirname, 'img', filename))
           .then(function(result) {
               for (var i = 0; i < result.length; i++) {
                 var field = result[i]
                 if (field.type == 'text')
                  var string = `${field.name}: <input type='text' name='${field.id}' value='${field.value}'><br>`
                 else {
                   var string = `<select name='${field.id}'>`
                   for (var j = 0; j < field.choices.length; j++) {
                     var choice = field.choices[j]
                     string += `<option name='value='${choice}'>${choice}</option>`
                   }
                   string += '</select>'
                 }
                 html += string
                 if (i == result.length - 1) {
                   html += "<input type='submit' value='submit'></form></body></html>"
                   res.send(html)
                 }
               }
           }, function(err) {
               console.log(err);
           });
       });
   });
})

app.post('/download', (req, res) => {
  console.log("Solicitado /download")
  var pdf = pdfFillForm.writeSync(sourcePDF, req.body, { "save": "pdf" } );
  fs.writeFile(destinationPDF, pdf, (err) => {
    if (!err)
      res.download(destinationPDF)
    else
      res.send("ERROR NIÑO")
  });
})


app.listen(5000)
