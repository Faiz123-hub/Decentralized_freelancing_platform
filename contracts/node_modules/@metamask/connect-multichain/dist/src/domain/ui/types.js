/**
 * Abstract Modal class with shared functionality across all models
 */
export class Modal {
    // eslint-disable-next-line @typescript-eslint/parameter-properties
    constructor(options) {
        this.options = options;
    }
    get isMounted() {
        return this.instance !== undefined;
    }
    get data() {
        if (typeof this.options === 'object' &&
            this.options &&
            'link' in this.options) {
            return this.options.link;
        }
        if (typeof this.options === 'object' &&
            this.options &&
            'otpCode' in this.options) {
            return this.options.otpCode;
        }
        throw new Error('Invalid options');
    }
    set data(data) {
        if (typeof this.options === 'object' &&
            this.options &&
            'link' in this.options) {
            this.options.link = data;
        }
        if (typeof this.options === 'object' &&
            this.options &&
            'otpCode' in this.options) {
            this.options.otpCode = data;
        }
    }
}
//# sourceMappingURL=types.js.map