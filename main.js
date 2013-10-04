define(function(require, exports, module){

////////////////////////////////////////////////////////////////////////////////

var ext_utils;
var registry;
var current;

ext_utils = brackets.getModule('utils/ExtensionUtils');
ext_utils.loadStyleSheet(module, 'main.css');

registry = {};

////////////////////////////////////////////////////////////////////////////////

brackets.getModule('utils/AppInit').appReady(function(){
    var editor = brackets.getModule('editor/EditorManager');

    $(editor).on('activeEditorChange', onActiveEditorChange);
    $(brackets.getModule('document/DocumentManager')).on('documentSaved', onDocumentSaved);

    onActiveEditorChange(null, editor.getActiveEditor());
});

////////////////////////////////////////////////////////////////////////////////

var config = require('./config');

function onActiveEditorChange(event, editor){
    var file, lang;
    var gutters;

    if (!editor || !editor.document)
        return;

    file = editor.document.file.fullPath;
    lang = editor.document.getLanguage().getId();

    registry[file] = registry[file] || {
        cm: null, widget: [], data: null,
        config: config[lang], check: davayProveryai
    };
    current = registry[file];
    current.cm = editor._codeMirror;

    gutters = editor._codeMirror.getOption('gutters');

    if (gutters.indexOf('lintyai-gutter') == -1){
        gutters.push('lintyai-gutter');
        editor._codeMirror.setOption('gutters', gutters);
    }

    onDocumentSaved(null, editor.document);
}

////////////////////////////////////////////////////////////////////////////////

function onDocumentSaved(event, document){
    if (document.file.isDirty || !current.config)
        return;

    if (!event && current.data !== null)
        return current.check();

    lintyai(function(){
        var dir, cmd;

        dir = ext_utils.getModulePath(module, 'node/node_modules/.bin');
        cmd = current.config.cmd.replace('%s', dir);

        this.commander(cmd + ' "' + document.file.fullPath + '"').
        done(function(data){
            current.data = data;
            current.check();
        });
    });
}

////////////////////////////////////////////////////////////////////////////////

function davayProveryai(){
    var gutter, widget;
    var lint;

    gutter = $('<div class="lintyai-gutter">&nbsp;</div>');
    widget = $('<div class="lintyai-line-widget" />');

    this.cm.clearGutter('lintyai-gutter');

    for (var i in this.widget)
        this.widget[i].clear();

    this.widget = [];

    if (!this.data || !(lint = this.config.re(this.data)))
        return;

    if (lint.line)
        lint = [lint];

    for (var i in lint){
        var type;

        if (this.config.type){
            for (type in this.config.type){
                if (this.config.type[type].test(lint[i].message))
                    break;

                type = null;
            }
        }

        this.cm.setGutterMarker(
            (lint[i].line - 1),
            'lintyai-gutter', gutter.clone().addClass(type)[0]
        );

        this.widget.push(this.cm.addLineWidget(
            (lint[i].line - 1),
            widget.clone().addClass(type).text(lint[i].message.trim())[0],
            {coverGutter: true}
        ));
    }
}

////////////////////////////////////////////////////////////////////////////////

var node = new (brackets.getModule('utils/NodeConnection'));

function lintyai(cb){
    if (node.domains.lintyai)
        return cb.call(node.domains.lintyai);

    node.connect(true).done(function(){
        var path = ext_utils.getModulePath(module, 'node/commander');

        node.loadDomains([path], true).done(function(){
            cb.call(node.domains.lintyai);
        });
    });
}

////////////////////////////////////////////////////////////////////////////////

});
