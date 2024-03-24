"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureFeatureFileAndStepDefinitionScenarioHaveSameSteps = exports.matchSteps = void 0;
var scenario_generation_1 = require("../code-generation/scenario-generation");
var step_generation_1 = require("../code-generation/step-generation");
var matchSteps = function (stepFromFeatureFile, stepMatcher) {
    if (typeof stepMatcher === 'string') {
        return stepFromFeatureFile.toLocaleLowerCase() === stepMatcher.toLocaleLowerCase();
    }
    if (stepMatcher instanceof RegExp) {
        return stepFromFeatureFile.match(stepMatcher);
    }
    return false;
};
exports.matchSteps = matchSteps;
var ensureFeatureFileAndStepDefinitionScenarioHaveSameSteps = function (options, parsedScenario, scenarioFromStepDefinitions) {
    if (options && options.errors === false) {
        return;
    }
    if (options && options.errors && !options.errors.stepsMustMatchFeatureFile) {
        return;
    }
    if (!parsedScenario) {
        return;
    }
    var errors = [];
    var parsedScenarioSteps = [];
    if (parsedScenario.scenarios) {
        var parsedScenarioOutlineScenarios = parsedScenario.scenarios;
        if (parsedScenarioOutlineScenarios && parsedScenarioOutlineScenarios.length) {
            parsedScenarioSteps = parsedScenarioOutlineScenarios[0].steps;
        }
        else {
            parsedScenarioSteps = [];
        }
    }
    else if (parsedScenario.steps) {
        parsedScenarioSteps = parsedScenario.steps;
    }
    var parsedStepCount = parsedScenarioSteps.length;
    var stepDefinitionCount = scenarioFromStepDefinitions.steps.length;
    if (parsedStepCount !== stepDefinitionCount) {
        errors.push("Scenario \"".concat(parsedScenario.title, "\" has ").concat(parsedStepCount, " step(s) in the feature file, but ").concat(stepDefinitionCount, " step definition(s) defined. Try adding the following code:\n\n").concat((0, scenario_generation_1.generateScenarioCode)(parsedScenario)));
    }
    else {
        parsedScenarioSteps.forEach(function (parsedStep, index) {
            var stepFromStepDefinitions = scenarioFromStepDefinitions.steps[index];
            if (!stepFromStepDefinitions || !(0, exports.matchSteps)(parsedStep.stepText, stepFromStepDefinitions.stepMatcher)) {
                errors.push("Expected step #".concat(index + 1, " in scenario \"").concat(parsedScenario.title, "\" to match \"").concat(parsedStep.stepText, "\". Try adding the following code:\n\n").concat((0, step_generation_1.generateStepCode)(parsedScenario.steps, index)));
            }
        });
    }
    if (errors.length) {
        throw new Error(errors.join('\n\n'));
    }
};
exports.ensureFeatureFileAndStepDefinitionScenarioHaveSameSteps = ensureFeatureFileAndStepDefinitionScenarioHaveSameSteps;
//# sourceMappingURL=step-definition-validation.js.map