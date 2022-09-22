"use strict";
exports.__esModule = true;
var IProperty_1 = require("./IProperty");
/**
 * Property, see {@link IProperty}
 *
 * Prefer using {@link property} instead
 */
var Property = /** @class */ (function () {
    function Property(arb, predicate) {
        this.arb = arb;
        this.predicate = predicate;
        this.isAsync = function () { return false; };
    }
    Property.prototype.generate = function (mrng, runId) {
        return runId != null ? this.arb.withBias(IProperty_1.runIdToFrequency(runId)).generate(mrng) : this.arb.generate(mrng);
    };
    Property.prototype.run = function (v) {
        try {
            var output = this.predicate(v);
            return output == null || output === true ? null : 'Property failed by returning false';
        }
        catch (err) {
            if (err instanceof Error && err.stack)
                return err + "\n\nStack trace: " + err.stack;
            return "" + err;
        }
    };
    return Property;
}());
exports.Property = Property;
//# sourceMappingURL=Property.generic.js.map