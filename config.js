define(function(require, exports, module){

////////////////////////////////////////////////////////////////////////////////

// http://jshint.com/
exports.js = {};
exports.js.cmd = 'D:/bin/lang/node/jshint';
exports.js.re = function(data){
    var result = [];

    data.split('\n').forEach(function(element){
        var match;

        element += '\n';
        match = /^(.+): line (\d+), col (\d+), /.exec(element);

        match && result.push({
            line: match[2],
            message: element.replace(match[0], '')
        });
    });

    return result;
};
exports.js.type = {
    warning: /Missing /
};

////////////////////////////////////////////////////////////////////////////////

// http://php.net/
exports.php = {};
exports.php.cmd = 'D:/bin/php -l';
exports.php.re = function(data){
    var match = /(.+) in (.+) on line (\d+)/.exec(data);

    if (data.indexOf('No syntax errors detected') == -1)
        return {
            line: match[3],
            message: match[1]
        };
};

////////////////////////////////////////////////////////////////////////////////

// http://lesscss.org/
exports.css =
exports.less = {};
exports.css.cmd = 'D:/bin/lang/node/lessc -l --no-color';
exports.css.re = function(data){
    var match = /(.+) in (.+) on line (\d+)/.exec(data);

    return {
        line: match[3],
        message: match[1]
    };
};

////////////////////////////////////////////////////////////////////////////////

// http://xmlsoft.org/
exports.xml = {};
exports.xml.cmd = 'D:/bin/lang/xmllint/xmllint --noout --debug';
exports.xml.re = function(data){
    var result = [];

    data.split('^\r\n').forEach(function(element){
        var match;

        element += '^';
        match = /^(.+):(\d+): /m.exec(element);

        match && result.push({
            line: match[2],
            message: element.replace(match[0], '')
        });
    });

    return result;
};

////////////////////////////////////////////////////////////////////////////////

// http://xmlsoft.org/
exports.html =
exports.htm = {};
exports.html.cmd = 'D:/bin/lang/xmllint/xmllint --noout --debug --html';
exports.html.re = exports.xml.re;

////////////////////////////////////////////////////////////////////////////////

// http://lua.org/
exports.lua = {};
exports.lua.cmd = 'D:/bin/lang/lua/bin/luac -p';
exports.lua.re = function(data){
    var match = /(.+): (.+):(\d+): /.exec(data);

    return {
        line: match[3],
        message: data.replace(match[0], '')
    };
};

////////////////////////////////////////////////////////////////////////////////

// https://github.com/zaach/jsonlint/
exports.json = {};
exports.json.cmd = 'D:/bin/lang/node/jsonlint -q';
exports.json.re = function(data){
    var match = /(.+) on line (\d+):/.exec(data);

    return {
        line: match[2],
        message: data.replace(match[0], '').trim().slice(0, -1)
    };
};

////////////////////////////////////////////////////////////////////////////////

});
