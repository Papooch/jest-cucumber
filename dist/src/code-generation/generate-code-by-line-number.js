"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCodeWithSeparateFunctionsFromFeature = exports.generateCodeFromFeature = exports.ObjectTypeEnum = void 0;
var scenario_generation_1 = require("./scenario-generation");
var step_generation_1 = require("./step-generation");
var ObjectTypeEnum;
(function (ObjectTypeEnum) {
    ObjectTypeEnum[ObjectTypeEnum["scenario"] = 0] = "scenario";
    ObjectTypeEnum[ObjectTypeEnum["scenarioOutline"] = 1] = "scenarioOutline";
    ObjectTypeEnum[ObjectTypeEnum["step"] = 2] = "step";
})(ObjectTypeEnum || (exports.ObjectTypeEnum = ObjectTypeEnum = {}));
var findObjectByLineNumber = function (feature, lineNumber) {
    var found = null;
    var type = ObjectTypeEnum.scenario;
    feature.scenarioOutlines.forEach(function (scenarioOutline) {
        if (scenarioOutline.lineNumber === lineNumber) {
            found = scenarioOutline;
            type = ObjectTypeEnum.scenarioOutline;
        }
        scenarioOutline.steps.forEach(function (step, index) {
            if (step.lineNumber === lineNumber) {
                found = { steps: scenarioOutline.steps, index: index };
                type = ObjectTypeEnum.step;
            }
        });
    });
    feature.scenarios.forEach(function (scenario) {
        if (scenario.lineNumber === lineNumber) {
            found = scenario;
            type = ObjectTypeEnum.scenario;
        }
        scenario.steps.forEach(function (step, index) {
            if (step.lineNumber === lineNumber) {
                found = { steps: scenario.steps, index: index };
                type = ObjectTypeEnum.step;
            }
        });
    });
    return found ? { object: found, type: type } : null;
};
var generateCodeFromFeature = function (feature, lineNumber) {
    var objectAtLine = findObjectByLineNumber(feature, lineNumber);
    if (objectAtLine === null) {
        return null;
    }
    switch (objectAtLine.type) {
        case ObjectTypeEnum.scenario:
        case ObjectTypeEnum.scenarioOutline:
            return (0, scenario_generation_1.generateScenarioCode)(objectAtLine.object);
        case ObjectTypeEnum.step:
            return (0, step_generation_1.generateStepCode)(objectAtLine.object.steps, objectAtLine.object.index, false);
        default:
            return null;
    }
};
exports.generateCodeFromFeature = generateCodeFromFeature;
var generateCodeWithSeparateFunctionsFromFeature = function (feature, lineNumber) {
    var objectAtLine = findObjectByLineNumber(feature, lineNumber);
    if (objectAtLine === null) {
        return null;
    }
    switch (objectAtLine.type) {
        case ObjectTypeEnum.scenario:
        case ObjectTypeEnum.scenarioOutline:
            return (0, scenario_generation_1.generateScenarioCodeWithSeparateStepFunctions)(objectAtLine.object);
        case ObjectTypeEnum.step:
            return (0, step_generation_1.generateStepCode)(objectAtLine.object.steps, objectAtLine.object.index, true);
        default:
            return null;
    }
};
exports.generateCodeWithSeparateFunctionsFromFeature = generateCodeWithSeparateFunctionsFromFeature;
//# sourceMappingURL=generate-code-by-line-number.js.map