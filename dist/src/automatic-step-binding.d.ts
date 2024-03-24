import { ParsedFeature } from './models';
import { StepsDefinitionCallbackFunction, IJestLike } from './feature-definition-creation';
export declare const createAutoBindSteps: (jestLike: IJestLike) => (features: ParsedFeature[], stepDefinitions: StepsDefinitionCallbackFunction[]) => void;
