(function(){

////////////////////////////////////////////////////////////////////////////////

var fs, path;
var process;

fs = require('fs');
path = require('path');
process = require('child_process');

////////////////////////////////////////////////////////////////////////////////

exports.init = function(manager){
    if (!manager.hasDomain('lintyai'))
        manager.registerDomain('lintyai', {
            major: 1,
            minor: 0
        });

    manager.registerCommand('lintyai', 'commander', commander, true);
};

////////////////////////////////////////////////////////////////////////////////

function commander(exec, cb){
    process.exec(exec, function(err, stdout, stderr){
        cb(null, stderr + stdout);
    });
}

////////////////////////////////////////////////////////////////////////////////

}());
