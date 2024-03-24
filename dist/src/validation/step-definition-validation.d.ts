import { ParsedScenario, ParsedScenarioOutline, ScenarioFromStepDefinitions } from '../models';
import { Options } from '../configuration';
export declare const matchSteps: (stepFromFeatureFile: string, stepMatcher: string | RegExp) => boolean | RegExpMatchArray | null;
export declare const ensureFeatureFileAndStepDefinitionScenarioHaveSameSteps: (options: Options, parsedScenario: ParsedScenario | ParsedScenarioOutline, scenarioFromStepDefinitions: ScenarioFromStepDefinitions) => void;
