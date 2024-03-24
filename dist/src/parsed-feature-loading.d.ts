import { Options } from './configuration';
import { ParsedFeature } from './models';
export declare const parseFeature: (featureText: string, options?: Options) => ParsedFeature;
export declare const loadFeature: (featureFilePath: string, options?: Options) => ParsedFeature;
export declare const loadFeatures: (globPattern: string, options?: Options) => ParsedFeature[];
