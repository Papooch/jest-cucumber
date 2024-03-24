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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTagFilters = void 0;
var cachedTagFilterFunctions = {};
var convertTagFilterExpressionToFunction = function (tagFilterExpression) {
    var tagRegex = /(@[A-Za-z-_0-9]+)/g;
    var tags = [];
    var match = null;
    var newTagFilterExpression = "".concat(tagFilterExpression);
    do {
        match = tagRegex.exec(tagFilterExpression);
        if (match) {
            newTagFilterExpression = newTagFilterExpression.replace(match[1], "(tags.indexOf(\"".concat(match[1].toLowerCase(), "\")!==-1)"));
            if (tags.indexOf(match[1]) !== -1) {
                tags.push(match[1]);
            }
        }
    } while (match);
    newTagFilterExpression = newTagFilterExpression.replace(/(\s+not|not\s+|\s+not\s+)/g, ' ! ');
    newTagFilterExpression = newTagFilterExpression.replace(/(\s+or|or\s+|\s+or\s+)/g, ' || ');
    newTagFilterExpression = newTagFilterExpression.replace(/(\s+and|and\s+|\s+and\s+)/g, ' && ');
    newTagFilterExpression = newTagFilterExpression.replace(/[ \t\n\r]+/g, '');
    var tagFilterFunction;
    try {
        // eslint-disable-next-line no-new-func
        tagFilterFunction = new Function('tags', "return ".concat(newTagFilterExpression, ";"));
        tagFilterFunction([]);
    }
    catch (error) {
        throw new Error("Could not parse tag filter \"".concat(tagFilterExpression, "\""));
    }
    return tagFilterFunction;
};
var checkIfScenarioMatchesTagFilter = function (tagFilterExpression, feature, scenario) {
    var featureAndScenarioTags = __spreadArray(__spreadArray([], scenario.tags.map(function (tag) { return tag.toLowerCase(); }), true), feature.tags.map(function (tag) { return tag.toLowerCase(); }), true);
    var tagFilterFunction = cachedTagFilterFunctions[tagFilterExpression];
    if (!tagFilterFunction) {
        tagFilterFunction = convertTagFilterExpressionToFunction(tagFilterExpression);
        cachedTagFilterFunctions[tagFilterExpression] = tagFilterFunction;
    }
    return tagFilterFunction(featureAndScenarioTags);
};
var setScenarioSkipped = function (parsedFeature, scenario) {
    var skippedViaTagFilter = !checkIfScenarioMatchesTagFilter(parsedFeature.options.tagFilter, parsedFeature, scenario);
    return __assign(__assign({}, scenario), { skippedViaTagFilter: skippedViaTagFilter });
};
var applyTagFilters = function (parsedFeature) {
    if (parsedFeature.options.tagFilter === undefined) {
        return parsedFeature;
    }
    var scenarios = parsedFeature.scenarios.map(function (scenario) { return setScenarioSkipped(parsedFeature, scenario); });
    var scenarioOutlines = parsedFeature.scenarioOutlines.map(function (scenarioOutline) {
        return __assign(__assign({}, setScenarioSkipped(parsedFeature, scenarioOutline)), { scenarios: scenarioOutline.scenarios.map(function (scenario) { return setScenarioSkipped(parsedFeature, scenario); }) });
    });
    return __assign(__assign({}, parsedFeature), { scenarios: scenarios, scenarioOutlines: scenarioOutlines });
};
exports.applyTagFilters = applyTagFilters;
//# sourceMappingURL=tag-filtering.js.map