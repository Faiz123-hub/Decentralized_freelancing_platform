export class BaseErr extends Error {
    constructor(message, code) {
        super(message);
        this.message = message;
        this.code = code;
    }
}
//# sourceMappingURL=base.js.map