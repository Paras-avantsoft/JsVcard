var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var vcard = require('./src/vCard');

http.createServer(function(req, res) {
    if (url.parse(req.url,true).pathname === '/configdata') {
        console.log("url >>>", req.url);
        var uId = url.parse(req.url,true).query.uId,
            obj = '';

        console.log("uId >>>", uId);
        console.log("exists >>>>", fs.existsSync("./src/vcard.json"));
        fs.readFile('./src/vcard.json', 'utf8', function (err, data) {
            if (err) throw err;
            obj = JSON.parse(data);
            console.log(obj);
        });
        var jsonData = vcard.convertJsonToVCF(obj);
        fs.writeFile(__dirname + '/' + uId +'-myvcard.vcf', jsonData, function(err){
            if (err) throw err;
        });
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('200',{"Content-Type":"text/vcard"});
        res.write(uId +'-myvcard.vcf');
        res.end();
    }

    // xyz.substr(xyz.indexOf('BEGIN:vcard'), xyz.indexOf(END:vcard) + 9)

    if (req.url === '/vcardimport') {
        var body,
            vcfData = '',
            jsonData = {};
        req.on('data', function(chunk) {
            body += chunk;
        });
        req.on('end', function() {

            var endString = (body.indexOf('END:VCARD')-165) + '';

            vcfData = body.substr(body.indexOf('BEGIN:VCARD'), endString);

            console.log(vcfData);

            jsonData = vcard.handleLoad(vcfData);
            console.log(jsonData);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', '*');
            res.setHeader('Access-Control-Allow-Headers', '*');
            res.setHeader('200',{"Content-Type":"text/vcard"});
            res.write('');
            res.end();
        });
    }
    // res.end();
}).listen(4786);
