export type ErrorOptions = {
    scenariosMustMatchFeatureFile: boolean;
    stepsMustMatchFeatureFile: boolean;
    allowScenariosNotInFeatureFile: boolean;
};
export type Options = {
    loadRelativePath?: boolean;
    tagFilter?: string;
    errors?: ErrorOptions | boolean;
    scenarioNameTemplate?: (vars: ScenarioNameTemplateVars) => string;
};
export type ScenarioNameTemplateVars = {
    featureTitle: string;
    scenarioTitle: string;
    scenarioTags: string[];
    featureTags: string[];
};
export declare const defaultErrorSettings: {
    scenariosMustMatchFeatureFile: boolean;
    stepsMustMatchFeatureFile: boolean;
    allowScenariosNotInFeatureFile: boolean;
};
export declare const defaultConfiguration: Options;
export declare const getJestCucumberConfiguration: (options?: Options) => {
    loadRelativePath?: boolean | undefined;
    tagFilter?: string | undefined;
    errors?: boolean | ErrorOptions | undefined;
    scenarioNameTemplate?: ((vars: ScenarioNameTemplateVars) => string) | undefined;
};
export declare const setJestCucumberConfiguration: (options: Options) => void;
