"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setJestCucumberConfiguration = exports.getJestCucumberConfiguration = exports.defaultConfiguration = exports.defaultErrorSettings = void 0;
exports.defaultErrorSettings = {
    scenariosMustMatchFeatureFile: true,
    stepsMustMatchFeatureFile: true,
    allowScenariosNotInFeatureFile: false,
};
exports.defaultConfiguration = {
    tagFilter: undefined,
    scenarioNameTemplate: undefined,
    errors: exports.defaultErrorSettings,
};
var globalConfiguration = {};
var getJestCucumberConfiguration = function (options) {
    var mergedOptions = __assign(__assign(__assign({}, exports.defaultConfiguration), globalConfiguration), (options || {}));
    if (mergedOptions.errors === true) {
        mergedOptions.errors = exports.defaultErrorSettings;
    }
    return mergedOptions;
};
exports.getJestCucumberConfiguration = getJestCucumberConfiguration;
var setJestCucumberConfiguration = function (options) {
    globalConfiguration = options;
};
exports.setJestCucumberConfiguration = setJestCucumberConfiguration;
//# sourceMappingURL=configuration.js.map