var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var vcard = require('./src/vCard');

http.createServer(function(req, res) {

    // VCF EXPORT
    if (url.parse(req.url,true).pathname === '/configdata') {
        // console.log("url >>>", req.url);
        var uId = url.parse(req.url,true).query.uId;

        // console.log("uId >>>", uId);
        // console.log("exists >>>>", fs.existsSync("./src/vcard.json"));
        fs.readFile('./src/vcard.json', 'utf8', function (err, data) {
            if (err) throw err;
            var obj = JSON.parse(data);
            var vcfData = vcard.convertJsonToVCF(obj);
             console.log(vcfData);
            fs.writeFile(__dirname + '/' + uId +'-myvcard.vcf', vcfData, function(err){
                if (err) throw err;
            });
        });
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('200',{"Content-Type":"text/vcard"});
        res.write(uId +'-myvcard.vcf');
        res.end();
    }
    
    // VCF IMPORT
    if (req.url === '/vcardimport') {
        var body,
            vcfData = '',
            jsonData = {};
        req.on('data', function(chunk) {
            body += chunk.toString();
        });
        req.on('end', function() {
            vcfData = body.substring(body.indexOf('BEGIN:VCARD'), (body.indexOf('END:VCARD')+9));

            // console.log(vcfData);

            jsonData = vcard.handleLoad(vcfData);
            // console.log(jsonData);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', '*');
            res.setHeader('Access-Control-Allow-Headers', '*');
            res.setHeader('200',{"Content-Type":"text/vcard"});
            res.write(JSON.stringify(jsonData));
            res.end();
        });
    }
    // res.end();
}).listen(4786);
