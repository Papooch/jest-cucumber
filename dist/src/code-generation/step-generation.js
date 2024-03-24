"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStepFunctionCall = exports.generateStepCode = exports.getStepKeyword = void 0;
var utils_1 = require("./utils");
var stepTextArgumentRegex = /([-+]?[0-9]*\.?[0-9]+)|"([^"<]+)"|"?<([^"<]*)>"?/g;
var stepTemplate = function (stepKeyword, stepMatcher, stepArgumentVariables) {
    return "".concat(stepKeyword, "(").concat(stepMatcher, ", (").concat(stepArgumentVariables.join(', '), ") => {\n\n});");
};
var getStepFunctionWrapperName = function (stepKeyword, stepText) {
    return "".concat(stepKeyword, "_").concat(stepText
        .replace(stepTextArgumentRegex, 'X')
        .replace(/\s/g, '_')
        .replace(/[^A-Za-z0-9_]/g, ''));
};
var stepWrapperFunctionTemplate = function (stepKeyword, stepText, stepMatcher, stepArgumentVariables) {
    return "export const ".concat(getStepFunctionWrapperName(stepKeyword, stepText), " = (").concat(stepKeyword, ") => {\n").concat((0, utils_1.indent)(stepTemplate(stepKeyword, stepMatcher, stepArgumentVariables), 1).slice(0, -1), "\n}");
};
var stepWrapperFunctionCallTemplate = function (stepText, stepKeyword) {
    return "".concat(getStepFunctionWrapperName(stepKeyword, stepText), "(").concat(stepKeyword, ")");
};
var escapeRegexCharacters = function (text) {
    return text.replace(/\$/g, '\\$').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
};
var convertStepTextToRegex = function (step) {
    var stepText = escapeRegexCharacters(step.stepText);
    var matches = stepTextArgumentRegex.exec(stepText);
    var finalStepText = stepText;
    while (matches) {
        var fullMatch = matches[0], numberMatch = matches[1], stringMatch = matches[2];
        if (numberMatch) {
            finalStepText = finalStepText.replace(numberMatch, '(\\d+)');
        }
        else if (stringMatch) {
            finalStepText = finalStepText.replace(stringMatch, '(.*)');
        }
        else {
            finalStepText = finalStepText.replace(fullMatch, '(.*)');
        }
        matches = stepTextArgumentRegex.exec(stepText);
    }
    return "/^".concat(finalStepText, "$/");
};
var getStepArguments = function (step) {
    var stepArgumentVariables = [];
    var index = 0;
    while (stepTextArgumentRegex.exec(step.stepText)) {
        stepArgumentVariables.push("arg".concat(index));
        index += 1;
    }
    if (step.stepArgument) {
        if (typeof step.stepArgument === 'string') {
            stepArgumentVariables.push('docString');
        }
        else {
            stepArgumentVariables.push('table');
        }
    }
    return stepArgumentVariables;
};
var getStepMatcher = function (step) {
    var stepMatcher = '';
    if (step.stepText.match(stepTextArgumentRegex)) {
        stepMatcher = convertStepTextToRegex(step);
    }
    else {
        stepMatcher = "'".concat(step.stepText.replace(/'+/g, "\\'"), "'");
    }
    return stepMatcher;
};
var getStepKeyword = function (steps, stepPosition) {
    return steps[stepPosition].keyword;
};
exports.getStepKeyword = getStepKeyword;
var generateStepCode = function (steps, stepPosition, generateWrapperFunction) {
    if (generateWrapperFunction === void 0) { generateWrapperFunction = false; }
    var step = steps[stepPosition];
    var stepKeyword = (0, exports.getStepKeyword)(steps, stepPosition);
    var stepMatcher = getStepMatcher(step);
    var stepArguments = getStepArguments(step);
    if (generateWrapperFunction) {
        return stepWrapperFunctionTemplate(stepKeyword, step.stepText, stepMatcher, stepArguments);
    }
    return stepTemplate(stepKeyword, stepMatcher, stepArguments);
};
exports.generateStepCode = generateStepCode;
var generateStepFunctionCall = function (steps, stepPosition) {
    var step = steps[stepPosition];
    var stepKeyword = (0, exports.getStepKeyword)(steps, stepPosition);
    return stepWrapperFunctionCallTemplate(step.stepText, stepKeyword);
};
exports.generateStepFunctionCall = generateStepFunctionCall;
//# sourceMappingURL=step-generation.js.map