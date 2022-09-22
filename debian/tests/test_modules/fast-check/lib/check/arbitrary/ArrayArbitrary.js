"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var Stream_1 = require("../../stream/Stream");
var Arbitrary_1 = require("./definition/Arbitrary");
var Shrinkable_1 = require("./definition/Shrinkable");
var IntegerArbitrary_1 = require("./IntegerArbitrary");
/** @hidden */
var ArrayArbitrary = /** @class */ (function (_super) {
    __extends(ArrayArbitrary, _super);
    function ArrayArbitrary(arb, minLength, maxLength, preFilter) {
        if (preFilter === void 0) { preFilter = function (tab) { return tab; }; }
        var _this = _super.call(this) || this;
        _this.arb = arb;
        _this.minLength = minLength;
        _this.maxLength = maxLength;
        _this.preFilter = preFilter;
        _this.lengthArb = IntegerArbitrary_1.integer(minLength, maxLength);
        return _this;
    }
    ArrayArbitrary.prototype.wrapper = function (itemsRaw, shrunkOnce) {
        var _this = this;
        var items = this.preFilter(itemsRaw);
        return new Shrinkable_1["default"](items.map(function (s) { return s.value; }), function () {
            return _this.shrinkImpl(items, shrunkOnce).map(function (v) { return _this.wrapper(v, true); });
        });
    };
    ArrayArbitrary.prototype.generate = function (mrng) {
        var _this = this;
        var size = this.lengthArb.generate(mrng);
        var items = __spread(Array(size.value)).map(function () { return _this.arb.generate(mrng); });
        return this.wrapper(items, false);
    };
    ArrayArbitrary.prototype.shrinkImpl = function (items, shrunkOnce) {
        var _this = this;
        // shrinking one by one is the not the most comprehensive
        // but allows a reasonable number of entries in the shrink
        if (items.length === 0) {
            return Stream_1.Stream.nil();
        }
        var size = this.lengthArb.shrinkableFor(items.length, shrunkOnce);
        return size
            .shrink()
            .map(function (l) { return items.slice(items.length - l.value); })
            .join(items[0].shrink().map(function (v) { return [v].concat(items.slice(1)); }))
            .join(items.length > this.minLength
            ? this.shrinkImpl(items.slice(1), false)
                .filter(function (vs) { return _this.minLength <= vs.length + 1; })
                .map(function (vs) { return [items[0]].concat(vs); })
            : Stream_1.Stream.nil());
    };
    ArrayArbitrary.prototype.withBias = function (freq) {
        var arb = this;
        var lowBiasedarb = new ArrayArbitrary(this.arb.withBias(freq), this.minLength, this.maxLength, this.preFilter);
        var highBiasedArb = this.minLength !== this.maxLength
            ? new ArrayArbitrary(this.arb.withBias(freq), this.minLength, this.minLength + Math.floor(Math.log(this.maxLength - this.minLength) / Math.log(2)), this.preFilter)
            : new ArrayArbitrary(this.arb.withBias(freq), this.minLength, this.maxLength, this.preFilter);
        return new /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_1.prototype.generate = function (mrng) {
                return mrng.nextInt(1, freq) === 1
                    ? mrng.nextInt(1, freq) === 1
                        ? highBiasedArb.generate(mrng)
                        : lowBiasedarb.generate(mrng)
                    : arb.generate(mrng);
            };
            return class_1;
        }(Arbitrary_1.Arbitrary))();
    };
    return ArrayArbitrary;
}(Arbitrary_1.Arbitrary));
exports.ArrayArbitrary = ArrayArbitrary;
function array(arb, aLength, bLength) {
    if (bLength == null)
        return new ArrayArbitrary(arb, 0, aLength == null ? 10 : aLength);
    return new ArrayArbitrary(arb, aLength || 0, bLength);
}
exports.array = array;
//# sourceMappingURL=ArrayArbitrary.js.map