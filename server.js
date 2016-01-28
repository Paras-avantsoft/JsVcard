var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var vcard = require('./src/vCard');

http.createServer(function(req, res) {
    console.log(vcard.ready);

    // >>>>>> On Server process <<<
    // vcard.convertJsonToVCF(<config from PD>);
    // create file on amazonS3 from the above converted string
    // and get the url and send that url to client



    // >>>>>> On local for testing <<<<<
    // create dummy page that call /config url
    // in the below code pass dummy object
    // that should return the vcf compatible text
    // we will create locally file and pass that url in request param
    // on client html page we will change window.location in new tab with vcf url


    if (req.url === '/config') {
        var body = "",
            vcfname = '';
        console.log(req.url);
        req.on('data', function(chunk) {
            body += chunk;
        });
        req.on('end', function() {
            console.log(body);
            vcfname = JSON.parse(body).vcfname +'.vcf';
            // res.writeHead('name', vcfname);
            // var jsonObj = JSON.parse(body);
            // console.log(jsonObj);
            fs.writeFile(__dirname + '/' + vcfname, JSON.parse(body).data, function(err){
                if (err) throw err;
            });
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', '*');
            res.setHeader('Access-Control-Allow-Headers', '*');
            res.setHeader('200',{"Content-Type":"text/vcard"});
            res.write(vcfname);
            res.end();
        });
    }
    // res.end();
}).listen(4786);
