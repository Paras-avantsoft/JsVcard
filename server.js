var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

http.createServer(function(req, res) {
    if (req.url === '/config') {
        var body = "";
        console.log(req.url);
        req.on('data', function(chunk) {
            body += chunk;
        });
        req.on('end', function() {
            console.log(body);
            // var jsonObj = JSON.parse(body);
            // console.log(jsonObj);
            fs.writeFile(__dirname + '/ipcvcard.vcf', body, function(err){
                if (err) throw err;
            });
        });
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader(200,{"Content-Type":"text/vcard"});
        res.write('ipcvcard.vcf');
    }
    res.end();
}).listen(4786);
