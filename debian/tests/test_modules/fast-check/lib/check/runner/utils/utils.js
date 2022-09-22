"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
exports.__esModule = true;
/** @hidden */
function prettyOne(value) {
    if (typeof value === 'string')
        return JSON.stringify(value);
    var defaultRepr = "" + value;
    if (/^\[object (Object|Null|Undefined)\]$/.exec(defaultRepr) === null)
        return defaultRepr;
    try {
        return JSON.stringify(value);
    }
    catch (err) {
        // ignored: object cannot be stringified using JSON.stringify
    }
    return defaultRepr;
}
/** @hidden */
function pretty(value) {
    if (Array.isArray(value))
        return "[" + __spread(value).map(pretty).join(',') + "]";
    return prettyOne(value);
}
/** @hidden */
function throwIfFailed(out) {
    if (out.failed) {
        throw new Error("Property failed after " + out.numRuns + " tests (seed: " + out.seed + ", path: " + out.counterexamplePath + "): " + pretty(out.counterexample) + "\nShrunk " + out.numShrinks + " time(s)\nGot error: " + out.error + "\n\n" + (out.failures.length === 0
            ? 'Hint: Enable verbose mode in order to have the list of all failing values encountered during the run'
            : "Encountered failures were:\n- " + out.failures.map(pretty).join('\n- ')));
    }
}
exports.throwIfFailed = throwIfFailed;
//# sourceMappingURL=utils.js.map