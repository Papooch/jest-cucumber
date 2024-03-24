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
exports.loadFeatures = exports.loadFeature = exports.parseFeature = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
var fs_1 = require("fs");
var glob_1 = require("glob");
var path_1 = require("path");
var callsites_1 = require("callsites");
var gherkin_1 = require("@cucumber/gherkin");
var uuid_1 = require("uuid");
var configuration_1 = require("./configuration");
var parseDataTableRow = function (astDataTableRow) {
    return astDataTableRow.cells.map(function (col) { return col.value; });
};
var parseDataTable = function (astDataTable, astDataTableHeader) {
    var headerRow;
    var bodyRows;
    if (astDataTableHeader) {
        headerRow = parseDataTableRow(astDataTableHeader);
        bodyRows = astDataTable;
    }
    else {
        headerRow = parseDataTableRow(astDataTable.rows[0]);
        bodyRows = astDataTable && astDataTable.rows && astDataTable.rows.length && astDataTable.rows.slice(1);
    }
    if (bodyRows && bodyRows.length > 0) {
        return bodyRows.map(function (nextRow) {
            var parsedRow = parseDataTableRow(nextRow);
            return parsedRow.reduce(function (rowObj, nextCol, index) {
                var _a;
                return __assign(__assign({}, rowObj), (_a = {}, _a[headerRow[index]] = nextCol, _a));
            }, {});
        });
    }
    return [];
};
var parseStepArgument = function (astStep) {
    if (astStep) {
        switch (astStep.argument) {
            case 'dataTable':
                return parseDataTable(astStep.dataTable);
            case 'docString':
                return astStep.docString.content;
            default:
                return null;
        }
    }
    else {
        return null;
    }
};
var parseStep = function (astStep) {
    return {
        stepText: astStep.text,
        keyword: astStep.keyword.trim().toLowerCase(),
        stepArgument: parseStepArgument(astStep),
        lineNumber: astStep.location.line,
    };
};
var parseSteps = function (astScenario) {
    return astScenario.steps.map(function (astStep) { return parseStep(astStep); });
};
var parseTags = function (ast) {
    if (!ast.tags) {
        return [];
    }
    return ast.tags.map(function (tag) { return tag.name.toLowerCase(); });
};
var parseScenario = function (astScenario) {
    return {
        title: astScenario.name,
        steps: parseSteps(astScenario),
        tags: parseTags(astScenario),
        lineNumber: astScenario.location.line,
    };
};
var parseScenarioOutlineExampleSteps = function (exampleTableRow, scenarioSteps) {
    return scenarioSteps.map(function (scenarioStep) {
        var stepText = Object.keys(exampleTableRow).reduce(function (processedStepText, nextTableColumn) {
            return processedStepText.replace(new RegExp("<".concat(nextTableColumn, ">"), 'g'), exampleTableRow[nextTableColumn]);
        }, scenarioStep.stepText);
        var stepArgument = '';
        if (scenarioStep.stepArgument) {
            if (Array.isArray(scenarioStep.stepArgument)) {
                stepArgument = scenarioStep.stepArgument.map(function (stepArgumentRow) {
                    var modifiedStepArgumentRow = __assign({}, stepArgumentRow);
                    Object.keys(exampleTableRow).forEach(function (nextTableColumn) {
                        Object.keys(modifiedStepArgumentRow).forEach(function (prop) {
                            modifiedStepArgumentRow[prop] = modifiedStepArgumentRow[prop].replace(new RegExp("<".concat(nextTableColumn, ">"), 'g'), exampleTableRow[nextTableColumn]);
                        });
                    });
                    return modifiedStepArgumentRow;
                });
            }
            else {
                stepArgument = scenarioStep.stepArgument;
                if (typeof scenarioStep.stepArgument === 'string' || scenarioStep.stepArgument instanceof String) {
                    Object.keys(exampleTableRow).forEach(function (nextTableColumn) {
                        stepArgument = stepArgument.replace(new RegExp("<".concat(nextTableColumn, ">"), 'g'), exampleTableRow[nextTableColumn]);
                    });
                }
            }
        }
        return __assign(__assign({}, scenarioStep), { stepText: stepText, stepArgument: stepArgument });
    });
};
var getOutlineDynamicTitle = function (exampleTableRow, title) {
    return title.replace(/<(\S*)>/g, function (_, firstMatch) {
        return exampleTableRow[firstMatch || ''];
    });
};
var parseScenarioOutlineExample = function (exampleTableRow, outlineScenario, exampleSetTags) {
    return {
        title: getOutlineDynamicTitle(exampleTableRow, outlineScenario.title),
        steps: parseScenarioOutlineExampleSteps(exampleTableRow, outlineScenario.steps),
        tags: Array.from(new Set(__spreadArray(__spreadArray([], outlineScenario.tags, true), exampleSetTags, true))),
    };
};
var parseScenarioOutlineExampleSet = function (astExampleSet, outlineScenario) {
    var exampleTable = parseDataTable(astExampleSet.tableBody, astExampleSet.tableHeader);
    return exampleTable.map(function (tableRow) { return parseScenarioOutlineExample(tableRow, outlineScenario, parseTags(astExampleSet)); });
};
var parseScenarioOutlineExampleSets = function (astExampleSets, outlineScenario) {
    var exampleSets = astExampleSets.map(function (astExampleSet) {
        return parseScenarioOutlineExampleSet(astExampleSet, outlineScenario);
    });
    return exampleSets.reduce(function (scenarios, nextExampleSet) {
        return __spreadArray(__spreadArray([], scenarios, true), nextExampleSet, true);
    }, []);
};
var parseScenarioOutline = function (astScenarioOutline) {
    var outlineScenario = parseScenario(astScenarioOutline.scenario);
    return {
        title: outlineScenario.title,
        scenarios: parseScenarioOutlineExampleSets(astScenarioOutline.scenario.examples, outlineScenario),
        tags: outlineScenario.tags,
        steps: outlineScenario.steps,
        lineNumber: astScenarioOutline.scenario.location.line,
    };
};
var parseScenarios = function (astFeature) {
    return astFeature.children
        .filter(function (child) {
        var keywords = ['Scenario Outline', 'Scenario Template'];
        return child.scenario && keywords.indexOf(child.scenario.keyword) === -1;
    })
        .map(function (astScenario) { return parseScenario(astScenario.scenario); });
};
var parseScenarioOutlines = function (astFeature) {
    return astFeature.children
        .filter(function (child) {
        var keywords = ['Scenario Outline', 'Scenario Template'];
        return child.scenario && keywords.indexOf(child.scenario.keyword) !== -1;
    })
        .map(function (astScenarioOutline) { return parseScenarioOutline(astScenarioOutline); });
};
var collapseBackgrounds = function (astChildren, backgrounds) {
    var backgroundSteps = backgrounds.reduce(function (allBackgroundSteps, nextBackground) {
        return __spreadArray(__spreadArray([], allBackgroundSteps, true), nextBackground.steps, true);
    }, []);
    return astChildren.map(function (child) {
        var newChild = __assign({}, child);
        if (newChild.scenario) {
            newChild.scenario.steps = __spreadArray(__spreadArray([], backgroundSteps, true), newChild.scenario.steps, true);
        }
        return newChild;
    });
};
var parseBackgrounds = function (ast) {
    return ast.children.filter(function (child) { return child.background; }).map(function (child) { return child.background; });
};
var collapseRulesAndBackgrounds = function (astFeature) {
    var featureBackgrounds = parseBackgrounds(astFeature);
    var children = collapseBackgrounds(astFeature.children, featureBackgrounds).reduce(function (newChildren, nextChild) {
        if (nextChild.rule) {
            var rule = nextChild.rule;
            var ruleBackgrounds = parseBackgrounds(rule);
            return __spreadArray(__spreadArray([], newChildren, true), collapseBackgrounds(rule.children, __spreadArray(__spreadArray([], featureBackgrounds, true), ruleBackgrounds, true)), true);
        }
        return __spreadArray(__spreadArray([], newChildren, true), [nextChild], false);
    }, []);
    return __assign(__assign({}, astFeature), { children: children });
};
var createTranslationMap = function (translateDialect) {
    var englishDialect = gherkin_1.dialects.en;
    var translationMap = {};
    var props = [
        'and',
        'background',
        'but',
        'examples',
        'feature',
        'given',
        'scenario',
        'scenarioOutline',
        'then',
        'when',
        'rule',
    ];
    // eslint-disable-next-line no-restricted-syntax
    for (var _i = 0, props_1 = props; _i < props_1.length; _i++) {
        var prop = props_1[_i];
        var dialectWords = translateDialect[prop];
        var translationWords = englishDialect[prop];
        var index = 0;
        var defaultWordIndex = null;
        // eslint-disable-next-line no-restricted-syntax
        for (var _a = 0, dialectWords_1 = dialectWords; _a < dialectWords_1.length; _a++) {
            var dialectWord = dialectWords_1[_a];
            // skip "* " word
            if (dialectWord.indexOf('*') !== 0) {
                if (translationWords[index] !== undefined) {
                    translationMap[dialectWord] = translationWords[index];
                    if (defaultWordIndex === null) {
                        // set default when non is set yet
                        defaultWordIndex = index;
                    }
                }
                else if (defaultWordIndex !== null) {
                    translationMap[dialectWord] = translationWords[defaultWordIndex];
                }
                else {
                    throw new Error("No translation found for ".concat(dialectWord));
                }
            }
            index += 1;
        }
    }
    return translationMap;
};
var translateKeywords = function (astFeature) {
    var languageDialect = gherkin_1.dialects[astFeature.language];
    var translationMap = createTranslationMap(languageDialect);
    // eslint-disable-next-line no-param-reassign
    astFeature.language = 'en';
    // eslint-disable-next-line no-param-reassign
    astFeature.keyword = translationMap[astFeature.keyword] || astFeature.keyword;
    // eslint-disable-next-line no-restricted-syntax
    for (var _i = 0, _a = astFeature.children; _i < _a.length; _i++) {
        var child = _a[_i];
        if (child.background) {
            child.background.keyword = translationMap[child.background.keyword] || child.background.keyword;
        }
        if (child.scenario) {
            child.scenario.keyword = translationMap[child.scenario.keyword] || child.scenario.keyword;
            // eslint-disable-next-line no-restricted-syntax
            for (var _b = 0, _c = child.scenario.steps; _b < _c.length; _b++) {
                var step = _c[_b];
                step.keyword = translationMap[step.keyword] || step.keyword;
            }
            // eslint-disable-next-line no-restricted-syntax
            for (var _d = 0, _e = child.scenario.examples; _d < _e.length; _d++) {
                var example = _e[_d];
                example.keyword = translationMap[example.keyword] || example.keyword;
            }
        }
    }
    return astFeature;
};
var parseFeature = function (featureText, options) {
    var ast;
    try {
        var builder = new gherkin_1.AstBuilder(uuid_1.v4);
        ast = new gherkin_1.Parser(builder).parse(featureText);
    }
    catch (err) {
        throw new Error("Error parsing feature Gherkin: ".concat(err.message));
    }
    var astFeature = collapseRulesAndBackgrounds(ast.feature);
    if (astFeature.language !== 'en') {
        astFeature = translateKeywords(astFeature);
    }
    return {
        title: astFeature.name,
        scenarios: parseScenarios(astFeature),
        scenarioOutlines: parseScenarioOutlines(astFeature),
        tags: parseTags(astFeature),
        options: (0, configuration_1.getJestCucumberConfiguration)(options),
    };
};
exports.parseFeature = parseFeature;
var loadFeature = function (featureFilePath, options) {
    var callSite = (0, callsites_1.default)()[1];
    var fileOfCaller = (callSite && callSite.getFileName()) || '';
    var dirOfCaller = (0, path_1.dirname)(fileOfCaller);
    var absoluteFeatureFilePath = (0, path_1.resolve)(options && options.loadRelativePath ? dirOfCaller : '', featureFilePath);
    try {
        var featureText = (0, fs_1.readFileSync)(absoluteFeatureFilePath, 'utf8');
        return (0, exports.parseFeature)(featureText, options);
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error("Feature file not found (".concat(absoluteFeatureFilePath, ")"));
        }
        throw err;
    }
};
exports.loadFeature = loadFeature;
var loadFeatures = function (globPattern, options) {
    var featureFiles = (0, glob_1.sync)(globPattern);
    return featureFiles.map(function (featureFilePath) { return (0, exports.loadFeature)(featureFilePath, options); });
};
exports.loadFeatures = loadFeatures;
//# sourceMappingURL=parsed-feature-loading.js.map