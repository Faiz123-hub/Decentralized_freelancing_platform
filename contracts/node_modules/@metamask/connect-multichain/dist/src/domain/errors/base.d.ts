import type { ErrorCodes } from './types';
export declare abstract class BaseErr<C extends string, T extends ErrorCodes> extends Error {
    readonly message: `${C}Err${T}: ${string}`;
    readonly code: T;
    constructor(message: `${C}Err${T}: ${string}`, code: T);
}
//# sourceMappingURL=base.d.ts.map