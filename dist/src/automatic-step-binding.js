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
exports.createAutoBindSteps = void 0;
var step_definition_validation_1 = require("./validation/step-definition-validation");
var feature_definition_creation_1 = require("./feature-definition-creation");
var step_generation_1 = require("./code-generation/step-generation");
var globalSteps = [];
var registerStep = function (stepMatcher, stepFunction) {
    globalSteps.push({ stepMatcher: stepMatcher, stepFunction: stepFunction });
};
var createAutoBindSteps = function (jestLike) {
    var defineFeature = (0, feature_definition_creation_1.createDefineFeature)(jestLike);
    return function (features, stepDefinitions) {
        stepDefinitions.forEach(function (stepDefinitionCallback) {
            stepDefinitionCallback({
                defineStep: registerStep,
                given: registerStep,
                when: registerStep,
                then: registerStep,
                and: registerStep,
                but: registerStep,
                pending: function () {
                    // Nothing to do
                },
            });
        });
        var errors = [];
        features.forEach(function (feature) {
            defineFeature(feature, function (test) {
                var scenarioOutlineScenarios = feature.scenarioOutlines.map(function (scenarioOutline) { return (__assign(__assign({}, scenarioOutline.scenarios[0]), { 
                    // we need to use the original title with un-expanded placeholders,
                    // otherwise it will try to match the expanded version in the feature file and fail.
                    title: scenarioOutline.title })); });
                var scenarios = __spreadArray(__spreadArray([], feature.scenarios, true), scenarioOutlineScenarios, true);
                scenarios.forEach(function (scenario) {
                    test(scenario.title, function (options) {
                        scenario.steps.forEach(function (step, stepIndex) {
                            var matches = globalSteps.filter(function (globalStep) { return (0, step_definition_validation_1.matchSteps)(step.stepText, globalStep.stepMatcher); });
                            if (matches.length === 1) {
                                var match = matches[0];
                                options.defineStep(match.stepMatcher, match.stepFunction);
                            }
                            else if (matches.length === 0) {
                                var stepCode = (0, step_generation_1.generateStepCode)(scenario.steps, stepIndex, false);
                                errors.push("No matching step found for step \"".concat(step.stepText, "\" in scenario \"").concat(scenario.title, "\" in feature \"").concat(feature.title, "\". Please add the following step code: \n\n").concat(stepCode));
                            }
                            else {
                                var matchingCode = matches.map(function (match) { return "".concat(match.stepMatcher.toString(), "\n\n").concat(match.stepFunction.toString()); });
                                errors.push("".concat(matches.length, " step definition matches were found for step \"").concat(step.stepText, "\" in scenario \"").concat(scenario.title, "\" in feature \"").concat(feature.title, "\". Each step can only have one matching step definition. The following step definition matches were found:\n\n").concat(matchingCode.join('\n\n')));
                            }
                        });
                    });
                });
            });
        });
        if (errors.length) {
            throw new Error(errors.join('\n\n'));
        }
    };
};
exports.createAutoBindSteps = createAutoBindSteps;
//# sourceMappingURL=automatic-step-binding.js.map