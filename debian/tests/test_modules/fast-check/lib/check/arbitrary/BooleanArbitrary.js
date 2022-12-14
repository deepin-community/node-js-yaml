"use strict";
exports.__esModule = true;
var IntegerArbitrary_1 = require("./IntegerArbitrary");
/**
 * For boolean values - `true` or `false`
 */
function boolean() {
    return IntegerArbitrary_1.integer(0, 1)
        .map(function (v) { return v === 1; })
        .noBias();
}
exports.boolean = boolean;
//# sourceMappingURL=BooleanArbitrary.js.map