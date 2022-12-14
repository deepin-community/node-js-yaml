"use strict";
exports.__esModule = true;
var IntegerArbitrary_1 = require("./IntegerArbitrary");
var TupleArbitrary_1 = require("./TupleArbitrary");
/** @hidden */
function next(n) {
    return IntegerArbitrary_1.integer(0, (1 << n) - 1);
}
/** @hidden */
var floatInternal = function () {
    // uniformaly in the range 0 (inc.), 1 (exc.)
    return next(24).map(function (v) { return v / (1 << 24); });
};
function float(a, b) {
    if (a === undefined)
        return floatInternal();
    if (b === undefined)
        return floatInternal().map(function (v) { return v * a; });
    return floatInternal().map(function (v) { return a + v * (b - a); });
}
exports.float = float;
/** @hidden */ var doubleFactor = Math.pow(2, 27);
/** @hidden */ var doubleDivisor = Math.pow(2, -53);
/** @hidden */
var doubleInternal = function () {
    // uniformaly in the range 0 (inc.), 1 (exc.)
    return TupleArbitrary_1.tuple(next(26), next(27)).map(function (v) { return (v[0] * doubleFactor + v[1]) * doubleDivisor; });
};
function double(a, b) {
    if (a === undefined)
        return doubleInternal();
    if (b === undefined)
        return doubleInternal().map(function (v) { return v * a; });
    return doubleInternal().map(function (v) { return a + v * (b - a); });
}
exports.double = double;
//# sourceMappingURL=FloatingPointArbitrary.js.map