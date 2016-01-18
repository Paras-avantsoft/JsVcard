/**
 * @module jsvCard
 */

/**
 * vCard parser.
 * Uses Iconv library.
 * Requires JavaScript >= 1.6
 * @class vCard
 * @constructor
 */
var vCard = function() {
    var self = this;

    this.ready = false;

    if (!Array.indexOf) {
        Array.prototype.indexOf = function(obj, start) {
            for (var i = (start || 0); i < this.length; i++) {
                if (this[i] == obj) {
                    return i;
                }
            }
            return -1;
        };
    }

    /**
     * Handles the normal file loading
     * @method handleLoad
     */
    this.handleLoad = function(evt) {

        if (self.ready === true) {
            this.ready = false;
            console.log(self.ipcvcarddata);
            return self.ipcvcarddata;
        }

        if (!evt && this.ready === false) {
            setTimeout(function() {
                this.handleLoad();
            }, 1000);
        } else if (evt && this.ready === false) {
            var files = evt.files;
            if (files !== undefined && files[0] !== undefined) {
                self.loadFromFile(files[0]);
            }
            evt.value = "";
        }
    };

    /*
     * Loads the vCard from a file using the File API (checked before calling)
     * file - a File object that represents the selected file to load
     */
    this.loadFromFile = function(file) {
        var reader = new FileReader(),
            me = this;

        reader.onload = function(e) {
            me.ipcvcarddata = self.parsevCardData(e.target.result);
            me.ready = true;
        };
        me.handleLoad();
        reader.readAsBinaryString(file);
    };

    this.parsevCardData = function(data) {
        var cardData = self.parsevCard(self.parseDirectoryMimeType(data)),
            workAdr = cardData.adr.work,
            cUrl = cardData.url,
            userAdr = workAdr.street+", "+workAdr.location+", "+workAdr.region+"-"+workAdr.postalcode,
            userConfig = {
                "full_name": {
                    "text": cardData.fn
                    // "clickUrl": cUrl.full_name
                },
                "company_mail": {
                    // "clickUrl": cUrl.company_mail,
                    "text": cardData.email.work
                },
                "company_video": {
                    "clickUrl": cUrl.company_video
                    // "activeDisplayType": "image",
                    // "type": "absolute",
                    // "absolutePath": cUrl.company_video_apath
                },
                "company_message": {
                    "text": "company tag line or \nsome multi line message"
                    // "clickUrl": cUrl.company_message,
                    // "fontFamily": "Slackey",
                    // "absoluteFontPath": cUrl.company_message_apath
                },
                "job_title": {
                    "text": cardData.title
                },
                "company_name": {
                    // "clickUrl": cUrl.company_name,
                    "text": cardData.org
                },
                "company_logo": {
                    // "clickUrl": cUrl.company_logo,
                    "activeDisplayType": "image",
                    "type": "absolute",
                    "absolutePath": cUrl.company_logo_apath
                },
                "company_web": {
                    "clickUrl": cUrl.company_web
                },
                "company_phone": {
                    // "vType": "phone",
                    "clickUrl": cardData.tel.work
                },
                "company_map": {
                    "text": userAdr
                    // "clickUrl": [{
                    //     "url": cUrl.company_map
                    // }]
                },
                "photo_album": {
                    // "clickUrl": cUrl.photo_album,
                    "images": [{
                        "type": "absolute",
                        "filename": "",
                        "absolutePath": cUrl.photo_album_apath1
                    }, {
                        "type": "absolute",
                        "filename": "",
                        "absolutePath": cUrl.photo_album_apath1
                    }]
                },
                "social_facebook": {
                    "clickUrl": cUrl.social_facebook
                },
                "social_twitter": {
                    "clickUrl": cUrl.social_twitter
                },
                "social_gplus": {
                    "clickUrl": cUrl.social_gplus
                },
                "social_linkedin": {
                    "clickUrl": cUrl.social_linkedin
                },
                "social_pineterest": {
                    "clickUrl": cUrl.social_pineterest
                },
                "social_tumblr": {
                    "clickUrl": cUrl.social_tumblr
                },
                "social_web": {
                    "clickUrl": cUrl.social_web
                },
                "company_audio": {
                    "clickUrl": cUrl.company_audio
                    // "activeDisplayType": "image"
                },
                "company_pdf": {
                    "clickUrl": cUrl.company_pdf
                },
                "user_photo": {
                    "absolutePath": cardData.photo,
                    "activeDisplayType": "image",
                    // "clickUrl": cardData.photo,
                    "type": "absolute"
                }
            };
            debugger;
        this.createVCardFile(userConfig);
        return userConfig;
    };

    this.createVCardFile = function(vCard) {
        var config = vCard,
            lb = "\r\n",
            vCardText,
            textFile = null,
            data;

        vCardText = "BEGIN:VCARD"+lb+
                    "VERSION:3.0"+lb+
                    "PRODID:-//Apple Inc.//Mac OS X 10.11.2//EN"+lb+
                    "N:"+config.full_name.text+lb+
                    "FN:"+ config.full_name.text +lb+
                    "ORG:"+ config.company_name.text +lb+
                    "TITLE:"+ config.job_title.text +lb+
                    "EMAIL;type=WORK:"+ config.company_mail.text +lb+
                    "TEL;type=work;type=VOICE;type=pref:"+ config.company_phone.clickUrl +lb+
                    "ADR;type=work;type=pref:"+ config.company_map.text +lb+
                    // "URL;type=full_name;type=pref:"+ config.full_name.clickUrl +lb+
                    // "URL;type=company_mail;type=pref:"+ config.company_mail.clickUrl+lb+
                    "URL;type=company_video;type=pref:"+ config.company_video.clickUrl+lb+
                    // "URL;type=company_message;type=pref:"+ config.company_message.clickUrl+lb+
                    // "URL;type=company_name;type=pref:"+ config.company_name.clickUrl+lb+
                    // "URL;type=company_logo;type=pref:"+ config.company_logo.clickUrl+lb+
                    "URL;type=company_web;type=pref:"+ config.company_web.clickUrl+lb+
                    // "URL;type=company_map;type=pref:"+ config.company_map.clickUrl.url+lb+
                    // "URL;type=photo_album;type=pref:"+ config.photo_album.clickUrl+lb+
                    "URL;type=social_facebook;type=pref:"+ config.social_facebook.clickUrl+lb+
                    "URL;type=social_twitter;type=pref:"+ config.social_twitter.clickUrl+lb+
                    "URL;type=social_gplus;type=pref:"+ config.social_gplus.clickUrl+lb+
                    "URL;type=social_pineterest;type=pref:"+ config.social_pineterest.clickUrl+lb+
                    "URL;type=social_tumblr;type=pref:"+ config.social_tumblr.clickUrl+lb+
                    "URL;type=social_web;type=pref:"+ config.social_web.clickUrl+lb+
                    "URL;type=company_audio;type=pref:"+ config.company_audio.clickUrl+lb+
                    "URL;type=company_pdf;type=pref:"+ config.company_pdf.clickUrl+lb+
                    // "URL;type=company_video_apath;type=pref:"+ config.company_video.absolutePath+lb+
                    // "URL;type=company_message_apath;type=pref:"+ config.company_message.absolutePath+lb+
                    "URL;type=company_logo_apath;type=pref:"+ config.company_logo.absolutePath+lb+
                    "URL;type=photo_album_apath1;type=pref:"+ config.photo_album.images[0].absolutePath+lb+
                    "URL;type=photo_album_apath2;type=pref:"+ config.photo_album.images[1].absolutePath+lb+
                    "URL;type=user_photo_apath;type=pref:"+ config.user_photo.absolutePath+lb+
                    "PHOTO;VALUE=URL;TYPE=PNG:"+ config.user_photo.absolutePath +lb+
                    "END:VCARD";

        data = new Blob([vCardText], {type: "text/vcard"});
        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (textFile !== null) {
          window.URL.revokeObjectURL(textFile);
        }

        textFile = window.URL.createObjectURL(data);

        var link = document.getElementById("downloadlink");
        link.href = textFile;
    };


    /**
     * Parses a single content line as described in RFC2425
     * Note: the value is not parsed.
     * Note: the ending CRLF may be omitted
     * @method parseDirectoryMimeTypeRow
     * @param {String} row unfolded content line
     * @return for each content line an object is returned (see return statement for the object structure)
     */
    this.parseDirectoryMimeTypeRow = function(orig_row) {
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
        // Note: in vcard 2.1 the param-value is not mandatory (this way we can have params with null values)

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
    };

    /**
     * Based on RFC 2425
     * Parses a string of ASCII charachers in an object representing the directory entry.
     * @method parseDirectoryMimeType
     */
    this.parseDirectoryMimeType = function(text) {
        var unfold = /\r\n(\t|\x20)/;

        // Perform unfolding
        text = text.replace(unfold, "");

        var rows = text.split("\r\n");
        var parsed_rows = [];

        for (i = 0; i < rows.length; i++) {
            // Avoid empty lines
            if (rows[i].length > 0) {
                parsed_rows[i] = this.parseDirectoryMimeTypeRow(rows[i]);
            }
        }
        return parsed_rows;
    };

    /**
     * Searches in data for the specified element. It works in a case insensitive manner.
     * @method findElement
     * @param {Array} data required. The associative array to search in.
     * @param {String} elementName required. the element name to search for.
     * @param {String} elementValue optional. The element value to search for. If null we search forn null value. In not specified we don't search for a particular value.
     * @returns {Integer} the index in 'data' for the found element or -1 if not found.
     */
    this.findElement = function(data, elementName, elementValue) {
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
    };

    this.decodeQuotedPrintableHelper = function(str, prefix) {
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
    };

    // "=E3=81=82=E3=81=84" => [ 0xE3, 0x81, 0x82, 0xE3, 0x81, 0x84 ]
    this.decodeQuotedPrintable = function(str) {
        str = str.replace(/_/g, " "); // RFC 2047.
        return this.decodeQuotedPrintableHelper(str, "=");
    };

    /**
     * Decodes the value of the element based on the "encoding" and "charset"
     * parameters
     * @method decodeText
     * @param {Object} x.params Contains the parameters
     * @param {Object} x.value Contains the value
     * @returns {String} The decoded value
     */
    this.decodeText = function(x) {
        // Default encoding
        var encoding = "7bit";
        var ind = self.findElement(x.params, 'encoding');
        if (ind != -1) {
            encoding = x.params[ind].value.toLowerCase();
        }

        var charset = "ascii";
        ind = self.findElement(x.params, 'charset');
        if (ind != -1) {
            charset = x.params[ind].value.toLowerCase();
        }

        var binary_value = [];

        switch (encoding) {
            case "base64":
                binary_value = Base64.decode(x.value).split('');
                break;
            case "quoted-printable":
                binary_value = self.decodeQuotedPrintable(x.value);
                break;
            default: // 7bit or 8bit
                binary_value = x.value.split('');
        }

        // Convert all chars to numbers
        for (var i = 0; i < binary_value.length; i++) {
            binary_value[i] = binary_value[i].charCodeAt(0);
        }

        return Iconv.decode(binary_value, charset);
    };

    this.decodeEmail = function(x) {
        // Default encoding
        var encoding = "7bit";
        var ind = self.findElement(x.params, 'encoding');
        if (ind != -1) {
            encoding = x.params[ind].value.toLowerCase();
        }

        var charset = "ascii";
        ind = self.findElement(x.params, 'charset');
        if (ind != -1) {
            charset = x.params[ind].value.toLowerCase();
        }

        var binary_value = [];

        switch (encoding) {
            case "base64":
                binary_value = Base64.decode(x.value).split('');
                break;
            case "quoted-printable":
                binary_value = self.decodeQuotedPrintable(x.value);
                break;
            default: // 7bit or 8bit
                binary_value = x.value.split('');
        }

        // Convert all chars to numbers
        for (var i = 0; i < binary_value.length; i++) {
            binary_value[i] = binary_value[i].charCodeAt(0);
        }

        return Iconv.decode(binary_value, charset);
    };

    this.decodeAdr = function(x) {
        var value = self.decodeText(x);
        var spladr = value.split(";");
        return {
            po: spladr[0],
            extension: spladr[1],
            street: spladr[2],
            location: spladr[3],
            region: spladr[4],
            postalcode: spladr[5],
            country: spladr[6]
        };
    };

    this.decodeN = function(x) {
        var value = self.decodeText(x);
        var spln = value.split(";");
        return {
            last: spln[0],
            first: spln[1],
            middle: spln[2],
            prefix: spln[3],
            postfix: spln[4]
        };
    };

    /**
     * To decode the Tel tag in vCard 2.1 we must separate two sets of parameters
     * because they can be in pairs or even in trio like HOME;VOICE or WORK;FAX;PREF
     * or CAR;VOICE.
     * <br><br>
     * This leads to a very big number of duplicates but leaves the choose on how to
     * access to the data from clients.
     * <br><br>
     * This could lead to correclty parse some strange pairs like PAGER;MODEM but this
     * system is the most flexible and meaningful (suggestions accepted here).
     * 
     * examples:<br>
     * TEL;HOME;VOICE;FAX;MODEM:555-132 => this gets parsed 4 times.<br>
     * 1st (HOME) => {voice:"555-132", fax:"555-132", modem:"555-132"}<br>
     * 2nd (VOICE)=> {home:"555-132"}<br>
     * 3rd (FAX)  => {home:"555-132"}<br>
     * 4th (MODEM)=> {home:"555-132"}<br>
     * <br>
     * TEL;HOME;VOICE;FAX;WORK;PREF:1231231231 => this gets parsed 5 times<br>
     * 1st (HOME) => {voice:"1231231231", fax:"1231231231", pref:"1231231231"}<br>
     * 2nd (VOICE)=> {home:"1231231231", work:"1231231231"}<br>
     * 3rd (FAX)  => {home:"1231231231", work:"1231231231"}<br>
     * 4th (WORK) => {voice:"1231231231", fax:"1231231231", pref:"1231231231"}<br>
     * 5th (PREF) => {home:"1231231231", work:"1231231231"}<br>
     * @method decodeTel
     */
    this.decodeTel = function(x) {
        var value = self.decodeText(x);
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
    };

    this.decodeTelV3 = function(x) {
        var value = self.decodeText(x);
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
    };

    this.decodeNotSupported = function(val, params) {
        console.log("This vCard element is currently not supported.");
    };

    /**
     * This object defines the structure the vcard object will have.<br>
     * It is structured as a tree with functions as leafs.<br>
     * First level branches properties are matched against attributes names.<br>
     * Other levels are mathed against parameters (depending on vcard version)<br>
     * For each match the leaf function gets called with the value as argument to get the right representation.<br>
     * @property vcard21Struct
     */
    var vcard21Struct = {
        // Parse even those.
        begin: this.decodeText,
        end: this.decodeText,
        version: this.decodeText,

        n: this.decodeN,
        fn: this.decodeText,
        adr: {
            home: this.decodeAdr,
            work: this.decodeAdr,
            dom: this.decodeAdr,
            intl: this.decodeAdr,
            postal: this.decodeAdr,
            parcel: this.decodeAdr
        },
        label: {
            home: this.decodeText,
            work: this.decodeText,
            dom: this.decodeText,
            intl: this.decodeText,
            postal: this.decodeText,
            parcel: this.decodeText
        },
        tel: {
            voice: this.decodeTel,
            fax: this.decodeTel,
            modem: this.decodeTel,
            isdn: this.decodeTel,
            msg: this.decodeTel,
            video: this.decodeTel,
            pref: this.decodeTel,
            work: this.decodeTel,
            home: this.decodeTel,
            cell: this.decodeTel,
            pager: this.decodeTel,
            bbs: this.decodeTel,
            car: this.decodeTel
        },
        email: {
            internet: this.decodeText,
            aol: this.decodeText,
            applelink: this.decodeText,
            attmail: this.decodeText,
            cis: this.decodeText,
            eworld: this.decodeText,
            ibmmail: this.decodeText,
            mcimail: this.decodeText,
            powershare: this.decodeText,
            prodigy: this.decodeText,
            tlx: this.decodeText,
            x400: this.decodeText
        },
        mailer: this.decodeText,
        tz: this.decodeText,
        geo: this.decodeText,
        title: this.decodeText,
        role: this.decodeText,
        logo: this.decodeNotSupported,
        agent: this.decodeNotSupported,
        org: this.decodeText,
        note: this.decodeText,
        rev: this.decodeText,
        sound: {
            wave: this.decodeNotSupported,
            pcm: this.decodeNotSupported,
            aiff: this.decodeNotSupported
        },
        url: this.decodeText,
        uid: this.decodeText,
        key: {
            pgp: this.decodeNotSupported,
            x509: this.decodeNotSupported
        },
        photo: this.decodeNotSupported,
        bday: this.decodeText,

        // Non-standard?
        nickname: this.decodeText
    };

    var vcard3Struct = {
        begin: this.decodeText,
        end: this.decodeText,
        version: this.decodeText,

        n: this.decodeN,
        fn: this.decodeText,
        prodid: this.decodeText,
        'x-ablabel': this.decodeText,
        'x-socialprofile': this.decodeText,
        'x-abuid': this.decodeText,
        'x-maidenname': this.decodeText,
        'x-phonetic-first-name': this.decodeText,
        'x-phonetic-last-name': this.decodeText,
        'x-aim': this.decodeText,
        'impp': this.decodeText,
        'x-abdate': this.decodeText,
        adr: {
            home: this.decodeAdr,
            work: this.decodeAdr,
            dom: this.decodeAdr,
            intl: this.decodeAdr,
            postal: this.decodeAdr,
            parcel: this.decodeAdr
        },
        label: {
            home: this.decodeText,
            work: this.decodeText,
            dom: this.decodeText,
            intl: this.decodeText,
            postal: this.decodeText,
            parcel: this.decodeText
        },
        tel: {
            voice: this.decodeTelV3,
            fax: this.decodeTelV3,
            modem: this.decodeTelV3,
            isdn: this.decodeTelV3,
            msg: this.decodeTelV3,
            video: this.decodeTelV3,
            pref: this.decodeTelV3,
            work: this.decodeTelV3,
            home: this.decodeTelV3,
            cell: this.decodeTelV3,
            pager: this.decodeTelV3,
            bbs: this.decodeTelV3,
            car: this.decodeTelV3,
            iphone: this.decodeTelV3,
            main: this.decodeTelV3,
            other: this.decodeTelV3
        },
        email: {
            internet: this.decodeEmail,
            aol: this.decodeEmail,
            applelink: this.decodeEmail,
            attmail: this.decodeEmail,
            cis: this.decodeEmail,
            eworld: this.decodeEmail,
            ibmmail: this.decodeEmail,
            mcimail: this.decodeEmail,
            powershare: this.decodeEmail,
            prodigy: this.decodeEmail,
            tlx: this.decodeEmail,
            x400: this.decodeEmail,
            work: this.decodeEmail,
            other: this.decodeEmail,
            home: this.decodeEmail,
            "company_mail": this.decodeEmail
        },
        mailer: this.decodeText,
        tz: this.decodeText,
        geo: this.decodeText,
        title: this.decodeText,
        role: this.decodeText,
        logo: this.decodeText,
        agent: this.decodeText,
        org: this.decodeText,
        note: this.decodeText,
        rev: this.decodeText,
        "sort-string": this.decodeText,
        sound: {
            wave: this.decodeText,
            pcm: this.decodeText,
            aiff: this.decodeText
        },
        url: {
            "full_name": this.decodeText,
            "company_mail": this.decodeText,
            "company_video": this.decodeText,
            "company_message": this.decodeText,
            "company_name": this.decodeText,
            "company_logo": this.decodeText,
            "company_web": this.decodeText,
            "company_phone": this.decodeText,
            "company_map": this.decodeText,
            "photo_album": this.decodeText,
            "social_facebook": this.decodeText,
            "social_twitter": this.decodeText,
            "social_gplus": this.decodeText,
            "social_linkedin": this.decodeText,
            "social_pineterest": this.decodeText,
            "social_tumblr": this.decodeText,
            "social_web": this.decodeText,
            "company_audio": this.decodeText,
            "company_pdf": this.decodeText,
            "company_video_apath": this.decodeText,
            "company_message_apath": this.decodeText,
            "company_logo_apath": this.decodeText,
            "photo_album_apath1": this.decodeText,
            "photo_album_apath2": this.decodeText,
            "user_photo_apath": this.decodeText
        },
        uid: this.decodeText,
        key: {
            pgp: this.decodeText,
            x509: this.decodeText
        },
        photo: this.decodeText,
        bday: this.decodeText,
        nickname: this.decodeText
    };

    /**
     * RFC 2426<br>
     * http://www.imc.org/pdi/vcard-21.txt<br>
     * Parses a vCard. The data should come from parseDirectoryMimeType(text)<br>
     * <br>
     * Note: it parses the first vcard it finds without warning for the existance of other vcards.
     * If you wish to parse other vcards in the same content you should split it and call this function
     * multiple times.
     * @method parsevCard
     * @param data an array of parsed contentlines
     * @return an object representing the parsed vcard content
     */
    this.parsevCard = function(data) {
        var begin = 0,
            end = 0;

        // Isolate the first vcard
        begin = this.findElement(data, 'begin', 'vcard');
        if (begin < 0) {
            throw "Cannot find 'begin:vcard'";
        }

        end = this.findElement(data, 'end', 'vcard');
        if (end < 0) {
            throw "Cannot find 'end:vcard'";
        }

        data = data.slice(begin, end);

        // Evaluate the version number
        var versionIndex = this.findElement(data, 'version');
        if (versionIndex < 0) {
            throw "Cannot find 'version:'";
        }

        var version = data[versionIndex].value;

        var ret = {};
        if (version == "2.1") {

            for (var i = 0; i < data.length; i++) {
                var row = data[i];
                var tagName = row.name.toLowerCase();

                if (vcard21Struct[tagName] === undefined) {
                    throw "Undefined vcard tag: " + row.name;
                }

                if (typeof vcard21Struct[tagName] == "object") {
                    // We are parsing a tag that has parameters

                    // Cycle through the parameters
                    for (var par = 0; par < row.params.length; par++) {

                        var paramName = row.params[par].name.toLowerCase();
                        if (typeof vcard21Struct[tagName][paramName] == "function") {
                            if (ret[tagName] === undefined) {
                                ret[tagName] = {};
                            }
                            var result = vcard21Struct[tagName][paramName]({
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
                } else if (typeof vcard21Struct[tagName] == "function") {
                    // We are parsing a simple valued tag
                    ret[tagName] = vcard21Struct[tagName]({
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
    };
};
