define(function(require, exports, module){

////////////////////////////////////////////////////////////////////////////////

var app;
var config;
var mirrors;
var registry;

app = brackets.getModule('utils/AppInit');
config = require('./config');
mirrors = {};
registry = {};

brackets.getModule('utils/ExtensionUtils').loadStyleSheet(module, 'main.css');

////////////////////////////////////////////////////////////////////////////////

app.appReady(function(){
    var editor = brackets.getModule('editor/EditorManager');

    $(editor).on('activeEditorChange', onActiveEditorChange);
    $(brackets.getModule('document/DocumentManager')).on('documentSaved', onDocumentSaved);

    onActiveEditorChange(null, editor.getActiveEditor());
});

////////////////////////////////////////////////////////////////////////////////

function onActiveEditorChange(event, editor){
    var gutters;
    var cm;

    if (!editor || !editor.document)
        return;

    cm = mirrors[editor.document.file.fullPath] = editor._codeMirror;
    gutters = cm.getOption('gutters');

    if (gutters.indexOf('lintyai-gutter') == -1){
        gutters.push('lintyai-gutter');
        cm.setOption('gutters', gutters);
    }

    onDocumentSaved(null, editor.document);
}

////////////////////////////////////////////////////////////////////////////////

function onDocumentSaved(event, document){
    var file, ext;
    var gutter, widget;

    file = document.file.fullPath;
    ext = file.split('.').pop().toLowerCase();

    registry[file] = registry[file] || [];

    gutter = $('<div class="lintyai-gutter">&nbsp;</div>');
    widget = $('<div class="lintyai-line-widget" />');

    !document.file.isDirty && config[ext] &&
    lintyai(function(){
        this.commander(config[ext].cmd + ' "' + file + '"').
        fail(function(err){
            console.error('[lintayi] ' + err);
        }).
        done(function(data){
            var lint;

            mirrors[file].clearGutter('lintyai-gutter');

            for (var i in registry[file])
                registry[file][i].clear();

            if (!data || !(lint = config[ext].re(data)))
                return;

            if (lint.line)
                lint = [lint];

            for (var i in lint){
                var type;

                if (config[ext].type){
                    for (type in config[ext].type){
                        if (config[ext].type[type].test(lint[i].message))
                            break;

                        type = null;
                    }
                }

                mirrors[file].setGutterMarker(
                    (lint[i].line - 1),
                    'lintyai-gutter', gutter.clone().addClass(type)[0]
                );

                registry[file].push(mirrors[file].addLineWidget(
                    (lint[i].line - 1),
                    widget.clone().addClass(type).text(lint[i].message.trim())[0],
                    {coverGutter: true}
                ));
            }
        });
    });
}

////////////////////////////////////////////////////////////////////////////////

function lintyai(cb){
    var node = new (brackets.getModule('utils/NodeConnection'));

    if (node.domains.lintyai)
        return cb.call(node.domains.lintyai);

    node.connect(true).done(function(){
        var utils, path;

        utils = brackets.getModule('utils/ExtensionUtils');
        path = [];

        path.push(utils.getModulePath(module, 'node/commander'));

        node.loadDomains(path, true).done(function(){
            cb.call(node.domains.lintyai);
        });
    });
}

////////////////////////////////////////////////////////////////////////////////

});
