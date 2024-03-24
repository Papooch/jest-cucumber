"use strict";
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
exports.createDefineFeature = void 0;
var scenario_validation_1 = require("./validation/scenario-validation");
var step_definition_validation_1 = require("./validation/step-definition-validation");
var tag_filtering_1 = require("./tag-filtering");
var createDefineFeature = function (jestLike) {
    var processScenarioTitleTemplate = function (scenarioTitle, parsedFeature, options, parsedScenario, parsedScenarioOutline) {
        if (options && options.scenarioNameTemplate) {
            try {
                return (options &&
                    options.scenarioNameTemplate({
                        featureTitle: parsedFeature.title,
                        scenarioTitle: scenarioTitle.toString(),
                        featureTags: parsedFeature.tags,
                        scenarioTags: (parsedScenario || parsedScenarioOutline).tags,
                    }));
            }
            catch (err) {
                throw new Error("An error occurred while executing a scenario name template. \nTemplate:\n".concat(options.scenarioNameTemplate, "\nError:").concat(err.message));
            }
        }
        return scenarioTitle;
    };
    var checkForPendingSteps = function (scenarioFromStepDefinitions) {
        var scenarioPending = false;
        scenarioFromStepDefinitions.steps.forEach(function (step) {
            try {
                if (step.stepFunction.toString().indexOf('pending()') !== -1) {
                    // eslint-disable-next-line no-new-func
                    var pendingTest = new Function("\n                        let isPending = false;\n\n                        const pending = function () {\n                            isPending = true;\n                        };\n\n                        (".concat(step.stepFunction, ")();\n\n                        return isPending;\n                    "));
                    scenarioPending = pendingTest();
                }
            }
            catch (err) {
                // Ignore
            }
        });
        return scenarioPending;
    };
    var getTestFunction = function (skippedViaTagFilter, only, skip, concurrent) {
        if (skip || skippedViaTagFilter) {
            return jestLike.test.skip;
        }
        if (only) {
            return jestLike.test.only;
        }
        if (concurrent) {
            return jestLike.test.concurrent;
        }
        return jestLike.test;
    };
    var defineScenario = function (scenarioTitle, scenarioFromStepDefinitions, parsedScenario, only, skip, concurrent, timeout) {
        if (only === void 0) { only = false; }
        if (skip === void 0) { skip = false; }
        if (concurrent === void 0) { concurrent = false; }
        if (timeout === void 0) { timeout = undefined; }
        var testFunction = getTestFunction(parsedScenario.skippedViaTagFilter, only, skip, concurrent);
        testFunction(scenarioTitle, function () {
            return scenarioFromStepDefinitions.steps.reduce(function (promiseChain, nextStep, index) {
                var parsedStep = parsedScenario.steps[index];
                var stepArgument = parsedStep.stepArgument;
                var matches = (0, step_definition_validation_1.matchSteps)(parsedStep.stepText, scenarioFromStepDefinitions.steps[index].stepMatcher);
                var matchArgs = [];
                if (matches && matches.length) {
                    matchArgs = matches.slice(1);
                }
                var args = __spreadArray([], matchArgs, true);
                if (stepArgument !== undefined && stepArgument !== null) {
                    args.push(stepArgument);
                }
                return promiseChain.then(function () {
                    return Promise.resolve()
                        .then(function () { return nextStep.stepFunction.apply(nextStep, args); })
                        .catch(function (error) {
                        var formattedError = error;
                        formattedError.message = "Failing step: \"".concat(parsedStep.stepText, "\"\n\nStep arguments: ").concat(JSON.stringify(args), "\n\nError: ").concat(error.message);
                        throw formattedError;
                    });
                });
            }, Promise.resolve());
        }, timeout);
    };
    var createDefineStepFunction = function (scenarioFromStepDefinitions) {
        return function (stepMatcher, stepFunction) {
            var stepDefinition = {
                stepMatcher: stepMatcher,
                stepFunction: stepFunction,
            };
            scenarioFromStepDefinitions.steps.push(stepDefinition);
        };
    };
    var createDefineScenarioFunction = function (featureFromStepDefinitions, parsedFeature, only, skip, concurrent) {
        if (only === void 0) { only = false; }
        if (skip === void 0) { skip = false; }
        if (concurrent === void 0) { concurrent = false; }
        var defineScenarioFunction = function (scenarioTitle, stepsDefinitionFunctionCallback, timeout) {
            var scenarioFromStepDefinitions = {
                title: scenarioTitle,
                steps: [],
            };
            featureFromStepDefinitions.scenarios.push(scenarioFromStepDefinitions);
            stepsDefinitionFunctionCallback({
                defineStep: createDefineStepFunction(scenarioFromStepDefinitions),
                given: createDefineStepFunction(scenarioFromStepDefinitions),
                when: createDefineStepFunction(scenarioFromStepDefinitions),
                then: createDefineStepFunction(scenarioFromStepDefinitions),
                and: createDefineStepFunction(scenarioFromStepDefinitions),
                but: createDefineStepFunction(scenarioFromStepDefinitions),
                pending: function () {
                    // Nothing to do
                },
            });
            var parsedScenario = parsedFeature.scenarios.filter(function (s) { return s.title.toLowerCase() === scenarioTitle.toLowerCase(); })[0];
            var parsedScenarioOutline = parsedFeature.scenarioOutlines.filter(function (s) { return s.title.toLowerCase() === scenarioTitle.toLowerCase(); })[0];
            var options = parsedFeature.options;
            // eslint-disable-next-line no-param-reassign
            scenarioTitle = processScenarioTitleTemplate(scenarioTitle, parsedFeature, options, parsedScenario, parsedScenarioOutline);
            (0, step_definition_validation_1.ensureFeatureFileAndStepDefinitionScenarioHaveSameSteps)(options, parsedScenario || parsedScenarioOutline, scenarioFromStepDefinitions);
            if (checkForPendingSteps(scenarioFromStepDefinitions)) {
                xtest(scenarioTitle, function () {
                    // Nothing to do
                }, undefined);
            }
            else if (parsedScenario) {
                defineScenario(scenarioTitle, scenarioFromStepDefinitions, parsedScenario, only, skip, concurrent, timeout);
            }
            else if (parsedScenarioOutline) {
                parsedScenarioOutline.scenarios.forEach(function (scenario) {
                    defineScenario(scenario.title || scenarioTitle, scenarioFromStepDefinitions, scenario, only, skip, concurrent, timeout);
                });
            }
        };
        return defineScenarioFunction;
    };
    var createDefineScenarioFunctionWithAliases = function (featureFromStepDefinitions, parsedFeature) {
        var defineScenarioFunctionWithAliases = createDefineScenarioFunction(featureFromStepDefinitions, parsedFeature);
        defineScenarioFunctionWithAliases.only = createDefineScenarioFunction(featureFromStepDefinitions, parsedFeature, true, false, false);
        defineScenarioFunctionWithAliases.skip = createDefineScenarioFunction(featureFromStepDefinitions, parsedFeature, false, true, false);
        defineScenarioFunctionWithAliases.concurrent = createDefineScenarioFunction(featureFromStepDefinitions, parsedFeature, false, false, true);
        return defineScenarioFunctionWithAliases;
    };
    return function defineFeature(featureFromFile, scenariosDefinitionCallback) {
        var featureFromDefinedSteps = {
            title: featureFromFile.title,
            scenarios: [],
        };
        var parsedFeatureWithTagFiltersApplied = (0, tag_filtering_1.applyTagFilters)(featureFromFile);
        if (parsedFeatureWithTagFiltersApplied.scenarios.length === 0 &&
            parsedFeatureWithTagFiltersApplied.scenarioOutlines.length === 0) {
            return;
        }
        jestLike.describe(featureFromFile.title, function () {
            scenariosDefinitionCallback(createDefineScenarioFunctionWithAliases(featureFromDefinedSteps, parsedFeatureWithTagFiltersApplied));
            (0, scenario_validation_1.checkThatFeatureFileAndStepDefinitionsHaveSameScenarios)(parsedFeatureWithTagFiltersApplied, featureFromDefinedSteps);
        });
    };
};
exports.createDefineFeature = createDefineFeature;
//# sourceMappingURL=feature-definition-creation.js.map