"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateScenarioCodeWithSeparateStepFunctions = exports.generateScenarioCode = void 0;
var step_generation_1 = require("./step-generation");
var utils_1 = require("./utils");
var scenarioTemplate = function (scenarioTitle, steps, stepKeywords) {
    return "test('".concat(scenarioTitle.replace(/'+/g, "\\'"), "', ({ ").concat(stepKeywords.join(', '), " }) => {\n").concat((0, utils_1.indent)(steps, 1).slice(0, -1), "\n});");
};
var getStepKeywords = function (scenario) {
    var stepKeywords = [];
    scenario.steps.forEach(function (step) {
        if (stepKeywords.indexOf(step.keyword) === -1) {
            stepKeywords.push(step.keyword);
        }
    });
    return stepKeywords;
};
var generateScenarioCode = function (scenario) {
    var stepsCode = scenario.steps.map(function (step, index) { return (0, step_generation_1.generateStepCode)(scenario.steps, index); });
    var stepKeywords = getStepKeywords(scenario);
    return scenarioTemplate(scenario.title, stepsCode.join('\n\n'), stepKeywords);
};
exports.generateScenarioCode = generateScenarioCode;
var generateScenarioCodeWithSeparateStepFunctions = function (scenario) {
    var stepFunctionCode = scenario.steps.map(function (step, index) { return (0, step_generation_1.generateStepCode)(scenario.steps, index, true); });
    var stepFunctionCalls = scenario.steps.map(function (step, index) { return (0, step_generation_1.generateStepFunctionCall)(scenario.steps, index); });
    var stepKeywords = getStepKeywords(scenario);
    return "".concat(stepFunctionCode.join('\n\n'), "\n\n").concat(scenarioTemplate(scenario.title, stepFunctionCalls.join('\n'), stepKeywords));
};
exports.generateScenarioCodeWithSeparateStepFunctions = generateScenarioCodeWithSeparateStepFunctions;
//# sourceMappingURL=scenario-generation.js.map