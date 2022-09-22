"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
exports.__esModule = true;
var Stream_1 = require("../../../stream/Stream");
/** @hidden */
function pathWalk(path, initialValues) {
    var values = Stream_1.stream(initialValues);
    var segments = path.split(':').map(function (text) { return +text; });
    if (segments.length === 0)
        return values;
    values = values.drop(segments[0]);
    try {
        for (var _a = __values(segments.slice(1)), _b = _a.next(); !_b.done; _b = _a.next()) {
            var s = _b.value;
            values = values
                .getNthOrLast(0)
                .shrink()
                .drop(s);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_b && !_b.done && (_c = _a["return"])) _c.call(_a);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return values;
    var e_1, _c;
}
exports.pathWalk = pathWalk;
//# sourceMappingURL=PathWalker.js.map