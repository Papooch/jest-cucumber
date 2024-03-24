"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indent = void 0;
var indent = function (stringToIndent, tabsToIndent) {
    var tabs = '';
    for (var i = 0; i < tabsToIndent; i++) {
        tabs = "".concat(tabs, "\t");
    }
    return stringToIndent
        .split('\n')
        .map(function (line) {
        if (line !== '') {
            return "".concat(tabs).concat(line, "\n");
        }
        return '\n';
    })
        .join('');
};
exports.indent = indent;
//# sourceMappingURL=utils.js.map