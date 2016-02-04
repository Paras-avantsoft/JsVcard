/**
 * @module jsvCard
 */

/**
 * @author: Paras (Contr. Harshal)
 * vCard parser.
 * Uses Iconv & Base64 library.
 * Requires JavaScript >= 1.6
 * @class vCard
 * @constructor
 */
var Base64 = require('./Base64');
var Iconv = require('./Iconv');
var vCard = {
    ready: false,

    /**
     * Handles the normal file loading
     * @method handleLoad
     */
    handleLoad: function(evt) {
        if (typeof evt === 'string') {
            var jsonData = vCard.parsevCardData(evt);
            return jsonData;
        } else {
            if (vCard.ready === true) {
                vCard.ready = false;
                console.log(vCard.ipcvcarddata);
                return vCard.ipcvcarddata;
            }

            if (!evt && vCard.ready === false) {
                setTimeout(function() {
                    vCard.handleLoad();
                }, 1000);
            } else if (evt && vCard.ready === false) {
                var files = evt.files;
                if (files !== undefined && files[0] !== undefined) {
                    vCard.loadFromFile(files[0]);
                }
                evt.value = "";
            }
        }
    },

    /*
     * Loads the vCard from a file using the File API (checked before calling)
     * file - a File object that represents the selected file to load
     */
    loadFromFile: function(file) {
        var reader = new FileReader(),
            me = vCard;

        reader.onload = function(e) {
            me.ipcvcarddata = vCard.parsevCardData(e.target.result);
            me.ready = true;
        };
        me.handleLoad();
        reader.readAsBinaryString(file);
    },

    parsevCardData: function(data) {
        var cardData = vCard.parsevCard(vCard.parseDirectoryMimeType(data)),
            workAdr = cardData.adr.work,
            cUrl = cardData.url,
            userAdr = workAdr.addr,
            userConfig = {
                config: {
                    "full_name": {
                        "text": cardData.fn
                    },
                    "company_mail": {
                        "clickUrl": cardData.email.work
                    },
                    "company_video": {
                        "clickUrl": cUrl.video
                    },
                    "company_message": {
                        "text": cardData.note
                    },
                    "job_title": {
                        "text": cardData.title
                    },
                    "company_name": {
                        "text": cardData.org
                    },
                    "company_logo": {
                        "activeDisplayType": "image",
                        "type": "absolute",
                        "absolutePath": cUrl.logo
                    },
                    "company_web": {
                        "clickUrl": cUrl.companyurl
                    },
                    "company_phone": {
                        "clickUrl": cardData.tel.work
                    },
                    "company_map": {
                        "text": userAdr
                    },
                    "photo_album": {
                        "images": [{
                            "type": "absolute",
                            "filename": "",
                            "absolutePath": cUrl.album1
                        }, {
                            "type": "absolute",
                            "filename": "",
                            "absolutePath": cUrl.album2
                        }]
                    },
                    "social_facebook": {
                        "clickUrl": cUrl.facebook
                    },
                    "social_twitter": {
                        "clickUrl": cUrl.twitter
                    },
                    "social_gplus": {
                        "clickUrl": cUrl.googleplus
                    },
                    "social_linkedin": {
                        "clickUrl": cUrl.linkedin
                    },
                    "social_pineterest": {
                        "clickUrl": cUrl.pineterest
                    },
                    "social_tumblr": {
                        "clickUrl": cUrl.tumblr
                    },
                    "social_web": {
                        "clickUrl": cUrl.socialurl
                    },
                    "company_audio": {
                        "clickUrl": cUrl.audio
                    },
                    "company_pdf": {
                        "clickUrl": cUrl.pdf
                    },
                    "user_photo": {
                        "absolutePath": cardData.photo,
                        "activeDisplayType": "image",
                        "type": "absolute"
                    }
                },
                "viewCardPath": ""
            };
            console.log(cUrl);
        return userConfig;
    },

    convertJsonToVCF: function(configs) {
        console.log(configs);
        var lb = "\r\n",
            config = configs.viewCardPath ? configs.config : configs,
            i = 0;

        if (!config) {
            return 'no vcf data found';
        }
        // console.log(config);
        var prefix = [
                "BEGIN:VCARD",
                "VERSION:3.0",
                "PRODID:-//Apple Inc.//Mac OS X 10.11.2//EN"
            ],
            suffix = ["END:VCARD"],
            vcfBody = [],
            vCardText = [];

        for (var key in config) {
            var obj;
            if (key.indexOf('full_name') !== -1) {
                obj = config[key];
                // console.log(obj.text);
                if (obj.hidden !== true) {
                    vcfBody.push("N:;" + obj.text + ";;;");
                    vcfBody.push("FN:" + obj.text);
                }
            }
            if (key.indexOf('company_name') !== -1) {
                obj = config[key];
                // console.log(obj.text);
                (obj.hidden !== true) && vcfBody.push("ORG:" + obj.text);
            }
            if (key.indexOf('job_title') !== -1) {
                obj = config[key];
                // console.log(obj.text);
                (obj.hidden !== true) && vcfBody.push("TITLE:" + obj.text);
            }
            if (key.indexOf('company_mail') !== -1) {
                obj = config[key];
                // console.log(obj.clickUrl);
                (obj.hidden !== true) && vcfBody.push("EMAIL;type=WORK;type=pref:" + obj.clickUrl);
            }
            if (key.indexOf('company_phone') !== -1) {
                obj = config[key];
                // console.log(obj.clickUrl);
                (obj.hidden !== true) && vcfBody.push("TEL;type=work" + (i === 0 ? "" : i) + ";type=VOICE;type=pref:" + obj.clickUrl);
                i++;
            }
            if (key.indexOf('company_map') !== -1) {
                obj = config[key];
                // console.log(obj.text.replace(/(?:\r\n|\r|\n)/g, ', '));
                (obj.hidden !== true) && vcfBody.push("ADR;type=work;type=pref:" + obj.text.replace(/(?:\r\n|\r|\n)/g, ', '));
            }
            if (key.indexOf('company_video') !== -1) {
                obj = config[key];
                // console.log(obj.clickUrl);
                (obj.hidden !== true) && vcfBody.push("URL;type=video;type=pref:" + obj.clickUrl);
            }
            if (key.indexOf('company_web') !== -1) {
                obj = config[key];
                // console.log(obj.clickUrl);
                (obj.hidden !== true) && vcfBody.push("URL;type=companyurl;type=pref:" + obj.clickUrl);
            }
            if (key.indexOf('social_facebook') !== -1) {
                obj = config[key];
                // console.log(obj.clickUrl);
                (obj.hidden !== true) && vcfBody.push("URL;type=facebook;type=pref:" + obj.clickUrl);
            }
            if (key.indexOf('social_linkedin') !== -1) {
                obj = config[key];
                // console.log(obj.clickUrl);
                (obj.hidden !== true) && vcfBody.push("URL;type=linkedin;type=pref:" + obj.clickUrl);
            }
            if (key.indexOf('social_twitter') !== -1) {
                obj = config[key];
                // console.log(obj.clickUrl);
                (obj.hidden !== true) && vcfBody.push("URL;type=twitter;type=pref:" + obj.clickUrl);
            }
            if (key.indexOf('social_gplus') !== -1) {
                obj = config[key];
                // console.log(obj.clickUrl);
                (obj.hidden !== true) && vcfBody.push("URL;type=googleplus;type=pref:" + obj.clickUrl);
            }
            if (key.indexOf('social_pineterest') !== -1) {
                obj = config[key];
                // console.log(obj.clickUrl);
                (obj.hidden !== true) && vcfBody.push("URL;type=pineterest;type=pref:" + obj.clickUrl);
            }
            if (key.indexOf('social_tumblr') !== -1) {
                obj = config[key];
                // console.log(obj.clickUrl);
                (obj.hidden !== true) && vcfBody.push("URL;type=tumblr;type=pref:" + obj.clickUrl);
            }
            if (key.indexOf('social_web') !== -1) {
                obj = config[key];
                // console.log(obj.clickUrl);
                (obj.hidden !== true) && vcfBody.push("URL;type=socialurl;type=pref:" + obj.clickUrl);
            }
            if (key.indexOf('company_audio') !== -1) {
                obj = config[key];
                // console.log(obj.clickUrl);
                (obj.hidden !== true) && vcfBody.push("URL;type=audio;type=pref:" + obj.clickUrl);
            }
            if (key.indexOf('company_pdf') !== -1) {
                obj = config[key];
                // console.log(obj.clickUrl);
                (obj.hidden !== true) && vcfBody.push("URL;type=pdf;type=pref:" + obj.clickUrl);
            }
            if (key.indexOf('company_logo') !== -1) {
                obj = config[key];
                // console.log(obj.absolutePath);
                (obj.hidden !== true) && vcfBody.push("URL;type=logo;type=pref:" + obj.absolutePath);
            }
            if (key.indexOf('photo_album') !== -1) {
                obj = config[key];

                if (obj.hidden !== true) {
                    var photoAlbum1 = obj.images[0] && obj.images[0].absolutePath,
                        photoAlbum2 = obj.images[1] && obj.images[1].absolutePath;

                    // console.log(obj.images);
                    vcfBody.push("URL;type=album1;type=pref:" + photoAlbum1);
                    vcfBody.push("URL;type=album2;type=pref:" + photoAlbum2);
                }
            }
            if (key.indexOf('user_photo') !== -1) {
                obj = config[key];
                // console.log(obj.absolutePath);
                if (obj.hidden !== true) {
                    vcfBody.push("URL;type=userPhoto;type=pref:" + obj.absolutePath);
                    vcfBody.push("PHOTO;VALUE=URL;TYPE=PNG:" + obj.absolutePath);
                }
            }
            if (key.indexOf('company_message') !== -1) {
                obj = config[key];
                // console.log(obj.text.replace(/(?:\r\n|\r|\n)/g, ', '));
                (obj.hidden !== true) && vcfBody.push("NOTE:" + obj.text.replace(/(?:\r\n|\r|\n)/g, ', '));
            }
        };

        // Add this extra config 'viewCardPath' if its available in requested json
        if (configs.viewCardPath) {
            // console.log("URL;type=My up to date contact info;type=pref:" + configs.viewCardPath);
            vcfBody.push("URL;type=My up to date contact info;type=pref:" + configs.viewCardPath);
        }

        vCardText = prefix.concat(vcfBody).concat(suffix).filter(function(n) {
            return (n != '' || n != undefined)
        }).join(lb);
        console.log(vCardText);

        // var photoAlbum1 = config.photo_album && config.photo_album.images[0] && config.photo_album.images[0].absolutePath,
        //     photoAlbum2 = config.photo_album && config.photo_album.images[1] && config.photo_album.images[1].absolutePath,
        //     vCardText = ["BEGIN:VCARD",
        //         "VERSION:3.0",
        //         "PRODID:-//Apple Inc.//Mac OS X 10.11.2//EN",
        //     (config.full_name && config.full_name.hidden !== true) && ("N:" + config.full_name.text),
        //     (config.full_name && config.full_name.hidden !== true) && ("FN:" + config.full_name.text),
        //     (config.company_name && config.company_name.hidden !== true) && ("ORG:" + config.company_name.text),
        //     (config.job_title && config.job_title.hidden !== true) && ("TITLE:" + config.job_title.text),
        //     (config.company_mail && config.company_mail.hidden !== true) && ("EMAIL;type=WORK;type=pref:" + config.company_mail.text),
        //     (config.company_phone && config.company_phone.hidden !== true) && ("TEL;type=work;type=VOICE;type=pref:" + config.company_phone.clickUrl),
        //     (config.company_map && config.company_map.hidden !== true)&& ("ADR;type=work;type=pref:" + config.company_map.text.replace(/(?:\r\n|\r|\n)/g, ', ')),
        //     (config.company_video && config.company_video.hidden !== true) && ("URL;type=company_video;type=pref:" + config.company_video.clickUrl),
        //     (config.company_web && config.company_web.hidden !== true) && ("URL;type=company_web;type=pref:" + config.company_web.clickUrl),
        //     (config.social_facebook && config.social_facebook.hidden !== true) && ("URL;type=social_facebook;type=pref:" + config.social_facebook.clickUrl),
        //     (config.social_linkedin && config.social_linkedin.hidden !== true) && ("URL;type=social_linkedin;type=pref:" + config.social_linkedin.clickUrl),
        //     (config.social_twitter && config.social_twitter.hidden !== true) && ("URL;type=social_twitter;type=pref:" + config.social_twitter.clickUrl),
        //     (config.social_gplus && config.social_gplus.hidden !== true) && ("URL;type=social_gplus;type=pref:" + config.social_gplus.clickUrl),
        //     (config.social_pineterest && config.social_pineterest.hidden !== true) && ("URL;type=social_pineterest;type=pref:" + config.social_pineterest.clickUrl),
        //     (config.social_tumblr && config.social_tumblr.hidden !== true) && ("URL;type=social_tumblr;type=pref:" + config.social_tumblr.clickUrl),
        //     (config.social_web && config.social_web.hidden !== true) && ("URL;type=social_web;type=pref:" + config.social_web.clickUrl),
        //     (config.company_audio && config.company_audio.hidden !== true) && ("URL;type=company_audio;type=pref:" + config.company_audio.clickUrl),
        //     (config.company_pdf && config.company_pdf.hidden !== true) && ("URL;type=company_pdf;type=pref:" + config.company_pdf.clickUrl),
        //     (config.company_logo && config.company_logo.hidden !== true) && ("URL;type=company_logo_apath;type=pref:" + config.company_logo.absolutePath),
        //     (photoAlbum1) && ("URL;type=photo_album_apath1;type=pref:" + photoAlbum1),
        //     (photoAlbum2) && ("URL;type=photo_album_apath2;type=pref:" + photoAlbum2),
        //     (config.user_photo && config.user_photo.hidden !== true) && ("URL;type=user_photo_apath;type=pref:" + config.user_photo.absolutePath),
        //     (config.viewCardPath && config.viewCardPath.hidden !== true) && ("URL;type=My up to date contact info;type=pref:" + config.viewCardPath),
        //     (config.user_photo && config.user_photo.hidden !== true) && ("PHOTO;VALUE=URL;TYPE=PNG:" + config.user_photo.absolutePath),
        //     (config.company_message && config.company_message.hidden !== true) && ("NOTE:"+ config.company_message.text.replace(/(?:\r\n|\r|\n)/g, ', ')),
        //     "END:VCARD"
        // ].filter(function(n){ return (n != '' || n != undefined)}).join(lb);

        return vCardText;
    },

    /**
     * Parses a single content line as described in RFC2425
     * Note: the value is not parsed.
     * Note: the ending CRLF may be omitted
     * @method parseDirectoryMimeTypeRow
     * @param {String} row unfolded content line
     * @return for each content line an object is returned (see return statement for the object structure)
     */
    parseDirectoryMimeTypeRow: function(orig_row) {
        var SAFE_CHAR_REGEXP_STR = '[\\x09\\x20\\x21\\x23-\\x2B\\x2D-\\x39\\x3C-\\x7E\\x80-\\xFF]';
        var QSAFE_CHAR_REGEXP_STR = '[\\x09\\x20\\x21\\x23-\\x7E\\x80-\\xFF]';
        var GROUP_REGEXP_STR = '[a-zA-Z0-9\\-]+';

        var row = orig_row;
        // contentline  = [group "."] name *(";" param) ":" value CRLF
        // group        = 1*(ALPHA / DIGIT / "-")

        var group = null;
        var group_regexp = new RegExp('^(' + GROUP_REGEXP_STR + ")\\.");
        var group_arr = group_regexp.exec(row);
        if (group_arr instanceof Array) {
            group = group_arr[1];
            row = row.substring(group_arr[0].length); // cut away group from row to simplify later parsing
        }

        // Assume the same regex we used for group parsing
        var name = null;
        var name_regexp = new RegExp('^(' + GROUP_REGEXP_STR + ')(:|;)');
        var name_arr = name_regexp.exec(row);
        if (name_arr instanceof Array) {
            name = name_arr[1];
            row = row.substring(name_arr[1].length); // cut away name from row to simplify later parsing but keep tailing ';' or ':'
        } else {
            throw "Wrong format: no name found in contentline. Line: " + orig_row;
        }
        // param        = param-name "=" param-value *("," param-value)
        // Note: in vcard 2.1 the param-value is not mandatory (vCard way we can have params with null values)

        var params = [];
        if (name_arr instanceof Array && name_arr[2] == ';') {
            // parse parameters
            var single_param_regex = new RegExp('^;(' + GROUP_REGEXP_STR + ')(=(' + SAFE_CHAR_REGEXP_STR + '*|"' + QSAFE_CHAR_REGEXP_STR + '"))?(:|;)');
            var cont = true;
            do {
                param_arr = single_param_regex.exec(row);
                if (param_arr instanceof Array) {
                    var param_name = param_arr[1];
                    var param_value = null;

                    if (param_arr[2] !== undefined) {
                        param_value = param_arr[3];
                    }

                    // Remove DQUOTE
                    if (param_value !== null && param_value[0] == '"') {
                        param_value = param_value.slice(1, -1);
                    }

                    params[params.length] = {
                        name: param_name,
                        value: param_value
                    };
                    cont = (param_arr[4] == ';') && (param_arr[0].length > 0);

                    // Strip the param away from row except for the tailing ';' or ':'
                    row = row.substring(param_arr[0].length - 1);
                } else {
                    cont = false;
                }
            } while (cont);
        }

        var value = null;
        var value_regexp = new RegExp('^:(.*)(\x0D\x0A)?$');
        var value_arr = value_regexp.exec(row);
        if (value_arr instanceof Array) {
            value = value_arr[1];
        } else {
            throw "Wrong format: no value found in contentline. Line: " + orig_row;
        }

        // Remove DQUOTE
        if (value !== null && value[0] == '"') {
            value = value.slice(1, -1);
        }

        return {
            group: group,
            params: params,
            name: name,
            value: value
        };
    },

    /**
     * Based on RFC 2425
     * Parses a string of ASCII charachers in an object representing the directory entry.
     * @method parseDirectoryMimeType
     */
    parseDirectoryMimeType: function(text) {
        var unfold = /\r\n(\t|\x20)/;

        // Perform unfolding
        text = text.replace(unfold, "");

        var rows = text.split("\r\n");
        var parsed_rows = [];

        for (i = 0; i < rows.length; i++) {
            // Avoid empty lines
            if (rows[i].length > 0) {
                parsed_rows[i] = vCard.parseDirectoryMimeTypeRow(rows[i]);
            }
        }
        return parsed_rows;
    },

    /**
     * Searches in data for the specified element. It works in a case insensitive manner.
     * @method findElement
     * @param {Array} data required. The associative array to search in.
     * @param {String} elementName required. the element name to search for.
     * @param {String} elementValue optional. The element value to search for. If null we search forn null value. In not specified we don't search for a particular value.
     * @returns {Integer} the index in 'data' for the found element or -1 if not found.
     */
    findElement: function(data, elementName, elementValue) {
        var i = 0;

        if (elementValue === undefined) {
            while (i < data.length &&
                data[i].name.toLowerCase() != elementName.toLowerCase()) {
                i++;
            }
        } else if (elementValue === null) {
            while (i < data.length &&
                (data[i].name.toLowerCase() != elementName.toLowerCase() ||
                    data[i].value !== null)) {
                i++;
            }
        } else {
            while ((i < data.length) &&
                (data[i].name.toLowerCase() != elementName.toLowerCase() ||
                    data[i].value.toLowerCase() != elementValue.toLowerCase())) {
                i++;
            }
        }

        if (i == data.length) {
            return -1;
        } else {
            return i;
        }
    },

    decodeQuotedPrintableHelper: function(str, prefix) {
        var decoded_bytes = [];
        for (var i = 0; i < str.length;) {
            if (str.charAt(i) == prefix) {
                decoded_bytes.push(String.fromCharCode(parseInt(str.substr(i + 1, 2), 16)));
                i += 3;
            } else {
                decoded_bytes.push(str[i]);
                ++i;
            }
        }
        return decoded_bytes;
    },

    // "=E3=81=82=E3=81=84" => [ 0xE3, 0x81, 0x82, 0xE3, 0x81, 0x84 ]
    decodeQuotedPrintable: function(str) {
        str = str.replace(/_/g, " "); // RFC 2047.
        return vCard.decodeQuotedPrintableHelper(str, "=");
    },

    /**
     * Decodes the value of the element based on the "encoding" and "charset"
     * parameters
     * @method decodeText
     * @param {Object} x.params Contains the parameters
     * @param {Object} x.value Contains the value
     * @returns {String} The decoded value
     */
    decodeText: function(x) {
        // Default encoding
        var encoding = "7bit";
        var me = vCard;
        var ind = me.findElement(x.params, 'encoding');
        if (ind != -1) {
            encoding = x.params[ind].value.toLowerCase();
        }

        var charset = "ascii";
        ind = me.findElement(x.params, 'charset');
        if (ind != -1) {
            charset = x.params[ind].value.toLowerCase();
        }

        var binary_value = [];

        switch (encoding) {
            case "base64":
                binary_value = Base64.decode(x.value).split('');
                break;
            case "quoted-printable":
                binary_value = me.decodeQuotedPrintable(x.value);
                break;
            default: // 7bit or 8bit
                binary_value = x.value.split('');
        }

        // Convert all chars to numbers
        for (var i = 0; i < binary_value.length; i++) {
            binary_value[i] = binary_value[i].charCodeAt(0);
        }

        return Iconv.decode(binary_value, charset);
    },

    decodeEmail: function(x) {
        // Default encoding
        var encoding = "7bit";
        var ind = vCard.findElement(x.params, 'encoding');
        if (ind != -1) {
            encoding = x.params[ind].value.toLowerCase();
        }

        var charset = "ascii";
        ind = vCard.findElement(x.params, 'charset');
        if (ind != -1) {
            charset = x.params[ind].value.toLowerCase();
        }

        var binary_value = [];

        switch (encoding) {
            case "base64":
                binary_value = Base64.decode(x.value).split('');
                break;
            case "quoted-printable":
                binary_value = vCard.decodeQuotedPrintable(x.value);
                break;
            default: // 7bit or 8bit
                binary_value = x.value.split('');
        }

        // Convert all chars to numbers
        for (var i = 0; i < binary_value.length; i++) {
            binary_value[i] = binary_value[i].charCodeAt(0);
        }

        return Iconv.decode(binary_value, charset);
    },

    decodeAdr: function(x) {
        var value = vCard.decodeText(x);
        var spladr = value.split(";");
        return {
            addr: spladr[0],
            // extension: spladr[1],
            // street: spladr[2],
            // location: spladr[3],
            // region: spladr[4],
            // postalcode: spladr[5],
            // country: spladr[6]
        };
    },

    decodeN: function(x) {
        var value = vCard.decodeText(x);
        var spln = value.split(";");
        return {
            last: spln[0],
            first: spln[1],
            middle: spln[2],
            prefix: spln[3],
            postfix: spln[4]
        };
    },

    /**
     * To decode the Tel tag in vCard 2.1 we must separate two sets of parameters
     * because they can be in pairs or even in trio like HOME;VOICE or WORK;FAX;PREF
     * or CAR;VOICE.
     * <br><br>
     * vCard leads to a very big number of duplicates but leaves the choose on how to
     * access to the data from clients.
     * <br><br>
     * vCard could lead to correclty parse some strange pairs like PAGER;MODEM but vCard
     * system is the most flexible and meaningful (suggestions accepted here).
     *
     * examples:<br>
     * TEL;HOME;VOICE;FAX;MODEM:555-132 => vCard gets parsed 4 times.<br>
     * 1st (HOME) => {voice:"555-132", fax:"555-132", modem:"555-132"}<br>
     * 2nd (VOICE)=> {home:"555-132"}<br>
     * 3rd (FAX)  => {home:"555-132"}<br>
     * 4th (MODEM)=> {home:"555-132"}<br>
     * <br>
     * TEL;HOME;VOICE;FAX;WORK;PREF:1231231231 => vCard gets parsed 5 times<br>
     * 1st (HOME) => {voice:"1231231231", fax:"1231231231", pref:"1231231231"}<br>
     * 2nd (VOICE)=> {home:"1231231231", work:"1231231231"}<br>
     * 3rd (FAX)  => {home:"1231231231", work:"1231231231"}<br>
     * 4th (WORK) => {voice:"1231231231", fax:"1231231231", pref:"1231231231"}<br>
     * 5th (PREF) => {home:"1231231231", work:"1231231231"}<br>
     * @method decodeTel
     */
    decodeTel: function(x) {
        var value = vCard.decodeText(x);
        var matched = false;
        var ret = {};
        var set1 = ["voice", "fax", "modem", "isdn", "msg", "pref", "video"];
        var set2 = ["home", "work", "cell", "pager", "bbs"];

        var set = set1.indexOf(x.parsing.toLowerCase()) >= 0;
        var parsing_set = set ? set1 : set2;
        var params_set = set ? set2 : set1;

        for (var i = 0; i < x.params.length; i++) {
            var par = x.params[i];
            var name = par.name.toLowerCase();
            if (params_set.indexOf(name) >= 0) {
                ret[name] = value;
            }
        }
        return ret;
    },

    decodeTelV3: function(x) {
        var value = vCard.decodeText(x);
        var matched = false;
        var ret;
        var set1 = ["voice", "fax", "modem", "isdn", "msg", "pref", "video"];
        var set2 = ["home", "work", "cell", "pager", "bbs"];

        var set = set1.indexOf(x.parsing.toLowerCase()) >= 0;
        var parsing_set = set ? set1 : set2;
        var params_set = set ? set2 : set1;

        for (var i = 0; i < x.params.length; i++) {
            var par = x.params[i];
            var name = par.value.toLowerCase();
            if (params_set.indexOf(name) >= 0) {
                ret = value;
            }
        }
        return ret;
    },

    decodeNotSupported: function(val, params) {
        console.log("vCard vCard element is currently not supported.");
    },

    /**
     * RFC 2426<br>
     * http://www.imc.org/pdi/vcard-21.txt<br>
     * Parses a vCard. The data should come from parseDirectoryMimeType(text)<br>
     * <br>
     * Note: it parses the first vcard it finds without warning for the existance of other vcards.
     * If you wish to parse other vcards in the same content you should split it and call vCard function
     * multiple times.
     * @method parsevCard
     * @param data an array of parsed contentlines
     * @return an object representing the parsed vcard content
     */
    parsevCard: function(data) {
        var begin = 0,
            end = 0;

        // Isolate the first vcard
        begin = vCard.findElement(data, 'begin', 'vcard');
        if (begin < 0) {
            throw "Cannot find 'begin:vcard'";
        }

        end = vCard.findElement(data, 'end', 'vcard');
        if (end < 0) {
            throw "Cannot find 'end:vcard'";
        }

        data = data.slice(begin, end);

        // Evaluate the version number
        var versionIndex = vCard.findElement(data, 'version');
        if (versionIndex < 0) {
            throw "Cannot find 'version:'";
        }

        var version = data[versionIndex].value;

        var ret = {};
        if (version == "2.1") {

            for (var i = 0; i < data.length; i++) {
                var row = data[i];
                var tagName = row.name.toLowerCase();

                if (vCard.vcard21Struct[tagName] === undefined) {
                    throw "Undefined vcard tag: " + row.name;
                }

                if (typeof vCard.vcard21Struct[tagName] == "object") {
                    // We are parsing a tag that has parameters

                    // Cycle through the parameters
                    for (var par = 0; par < row.params.length; par++) {

                        var paramName = row.params[par].name.toLowerCase();
                        if (typeof vCard.vcard21Struct[tagName][paramName] == "function") {
                            if (ret[tagName] === undefined) {
                                ret[tagName] = {};
                            }
                            var result = vCard.vcard21Struct[tagName][paramName]({
                                value: row.value,
                                params: row.params,
                                parsing: paramName
                            });
                            if (ret[tagName][paramName] === undefined) {
                                ret[tagName][paramName] = result;
                            } else {
                                // If we alredy have the result, we merge in the new one
                                for (var n in result) {
                                    if (result.hasOwnProperty(n)) {
                                        ret[tagName][paramName][n] = result[n];
                                    }
                                }
                            }
                        }
                        //else ignore the parameter (could be a ENCODING or a CHARSET param...)
                    }
                } else if (typeof vCard.vcard21Struct[tagName] == "function") {
                    // We are parsing a simple valued tag
                    ret[tagName] = vCard.vcard21Struct[tagName]({
                        value: row.value,
                        params: row.params,
                        parsing: tagName
                    });
                } else {
                    throw "Malformed vcard21Struct";
                }
            }
        } else if (version == "3.0") {

            for (var i = 0; i < data.length; i++) {
                var row = data[i];
                var tagName = row.name.toLowerCase();
                console.log(vcard3Struct);
                if (vcard3Struct[tagName] === undefined) {
                    throw "Undefined vcard tag: " + row.name;
                }
                if (typeof vcard3Struct[tagName] == "object") {
                    // We are parsing a tag that has parameters

                    // Cycle through the parameters
                    for (var par = 0; par < row.params.length; par++) {

                        var paramName = row.params[par].value.toLowerCase();
                        if (typeof vcard3Struct[tagName][paramName] == "function") {
                            if (ret[tagName] === undefined) {
                                ret[tagName] = {};
                            }
                            var result = vcard3Struct[tagName][paramName]({
                                value: row.value,
                                params: row.params,
                                parsing: paramName
                            });
                            if (ret[tagName][paramName] === undefined) {
                                ret[tagName][paramName] = result;
                            } else {
                                // If we alredy have the result, we merge in the new one
                                for (var n in result) {
                                    if (result.hasOwnProperty(n)) {
                                        ret[tagName][paramName][n] = result[n];
                                    }
                                }
                            }
                        }
                        //else ignore the parameter (could be a ENCODING or a CHARSET param...)
                    }
                } else if (typeof vcard3Struct[tagName] == "function") {
                    // We are parsing a simple valued tag
                    ret[tagName] = vcard3Struct[tagName]({
                        value: row.value,
                        params: row.params,
                        parsing: tagName
                    });
                } else {
                    throw "Malformed vcard3Struct";
                }
            }
        } else {
            throw "Unsupported vcard version";
        }

        return ret;
    }
};
var vcard3Struct = {
    begin: vCard.decodeText,
    end: vCard.decodeText,
    version: vCard.decodeText,

    n: vCard.decodeN,
    fn: vCard.decodeText,
    prodid: vCard.decodeText,
    'x-ablabel': vCard.decodeText,
    'x-socialprofile': vCard.decodeText,
    'x-abuid': vCard.decodeText,
    'x-maidenname': vCard.decodeText,
    'x-phonetic-first-name': vCard.decodeText,
    'x-phonetic-last-name': vCard.decodeText,
    'x-aim': vCard.decodeText,
    'impp': vCard.decodeText,
    'x-abdate': vCard.decodeText,
    adr: {
        home: vCard.decodeAdr,
        work: vCard.decodeAdr,
        dom: vCard.decodeAdr,
        intl: vCard.decodeAdr,
        postal: vCard.decodeAdr,
        parcel: vCard.decodeAdr
    },
    label: {
        home: vCard.decodeText,
        work: vCard.decodeText,
        dom: vCard.decodeText,
        intl: vCard.decodeText,
        postal: vCard.decodeText,
        parcel: vCard.decodeText
    },
    tel: {
        voice: vCard.decodeTelV3,
        fax: vCard.decodeTelV3,
        modem: vCard.decodeTelV3,
        isdn: vCard.decodeTelV3,
        msg: vCard.decodeTelV3,
        video: vCard.decodeTelV3,
        pref: vCard.decodeTelV3,
        work: vCard.decodeTelV3,
        home: vCard.decodeTelV3,
        cell: vCard.decodeTelV3,
        pager: vCard.decodeTelV3,
        bbs: vCard.decodeTelV3,
        car: vCard.decodeTelV3,
        iphone: vCard.decodeTelV3,
        main: vCard.decodeTelV3,
        other: vCard.decodeTelV3
    },
    email: {
        internet: vCard.decodeEmail,
        aol: vCard.decodeEmail,
        applelink: vCard.decodeEmail,
        attmail: vCard.decodeEmail,
        cis: vCard.decodeEmail,
        eworld: vCard.decodeEmail,
        ibmmail: vCard.decodeEmail,
        mcimail: vCard.decodeEmail,
        powershare: vCard.decodeEmail,
        prodigy: vCard.decodeEmail,
        tlx: vCard.decodeEmail,
        x400: vCard.decodeEmail,
        work: vCard.decodeEmail,
        other: vCard.decodeEmail,
        home: vCard.decodeEmail
    },
    mailer: vCard.decodeText,
    tz: vCard.decodeText,
    geo: vCard.decodeText,
    title: vCard.decodeText,
    role: vCard.decodeText,
    logo: vCard.decodeText,
    agent: vCard.decodeText,
    org: vCard.decodeText,
    note: vCard.decodeText,
    rev: vCard.decodeText,
    "sort-string": vCard.decodeText,
    sound: {
        wave: vCard.decodeText,
        pcm: vCard.decodeText,
        aiff: vCard.decodeText
    },
    url: {
        "full_name": vCard.decodeText,
        "company_mail": vCard.decodeText,
        "video": vCard.decodeText,
        "compamny_message": vCard.decodeText,
        "company_name": vCard.decodeText,
        "logo": vCard.decodeText,
        "companyurl": vCard.decodeText,
        "company_phone": vCard.decodeText,
        "map": vCard.decodeText,
        "photo_album": vCard.decodeText,
        "facebook": vCard.decodeText,
        "twitter": vCard.decodeText,
        "googleplus": vCard.decodeText,
        "linkedin": vCard.decodeText,
        "pineterest": vCard.decodeText,
        "tumblr": vCard.decodeText,
        "socialurl": vCard.decodeText,
        "audio": vCard.decodeText,
        "pdf": vCard.decodeText,
        "video": vCard.decodeText,
        "logo": vCard.decodeText,
        "album1": vCard.decodeText,
        "album2": vCard.decodeText,
        "user_photo_apath": vCard.decodeText
    },
    uid: vCard.decodeText,
    key: {
        pgp: vCard.decodeText,
        x509: vCard.decodeText
    },
    photo: vCard.decodeText,
    bday: vCard.decodeText,
    nickname: vCard.decodeText
};


/**
 * vCard object defines the structure the vcard object will have.<br>
 * It is structured as a tree with functions as leafs.<br>
 * First level branches properties are matched against attributes names.<br>
 * Other levels are mathed against parameters (depending on vcard version)<br>
 * For each match the leaf function gets called with the value as argument to get the right representation.<br>
 * @property vcard21Struct
 */
var vcard21Struct = {
    // Parse even those.
    begin: vCard.decodeText,
    end: vCard.decodeText,
    version: vCard.decodeText,

    n: vCard.decodeN,
    fn: vCard.decodeText,
    adr: {
        home: vCard.decodeAdr,
        work: vCard.decodeAdr,
        dom: vCard.decodeAdr,
        intl: vCard.decodeAdr,
        postal: vCard.decodeAdr,
        parcel: vCard.decodeAdr
    },
    label: {
        home: vCard.decodeText,
        work: vCard.decodeText,
        dom: vCard.decodeText,
        intl: vCard.decodeText,
        postal: vCard.decodeText,
        parcel: vCard.decodeText
    },
    tel: {
        voice: vCard.decodeTel,
        fax: vCard.decodeTel,
        modem: vCard.decodeTel,
        isdn: vCard.decodeTel,
        msg: vCard.decodeTel,
        video: vCard.decodeTel,
        pref: vCard.decodeTel,
        work: vCard.decodeTel,
        home: vCard.decodeTel,
        cell: vCard.decodeTel,
        pager: vCard.decodeTel,
        bbs: vCard.decodeTel,
        car: vCard.decodeTel
    },
    email: {
        internet: vCard.decodeText,
        aol: vCard.decodeText,
        applelink: vCard.decodeText,
        attmail: vCard.decodeText,
        cis: vCard.decodeText,
        eworld: vCard.decodeText,
        ibmmail: vCard.decodeText,
        mcimail: vCard.decodeText,
        powershare: vCard.decodeText,
        prodigy: vCard.decodeText,
        tlx: vCard.decodeText,
        x400: vCard.decodeText
    },
    mailer: vCard.decodeText,
    tz: vCard.decodeText,
    geo: vCard.decodeText,
    title: vCard.decodeText,
    role: vCard.decodeText,
    logo: vCard.decodeNotSupported,
    agent: vCard.decodeNotSupported,
    org: vCard.decodeText,
    note: vCard.decodeText,
    rev: vCard.decodeText,
    sound: {
        wave: vCard.decodeNotSupported,
        pcm: vCard.decodeNotSupported,
        aiff: vCard.decodeNotSupported
    },
    url: vCard.decodeText,
    uid: vCard.decodeText,
    key: {
        pgp: vCard.decodeNotSupported,
        x509: vCard.decodeNotSupported
    },
    photo: vCard.decodeNotSupported,
    bday: vCard.decodeText,

    // Non-standard?
    nickname: vCard.decodeText
};

module.exports = vCard;
