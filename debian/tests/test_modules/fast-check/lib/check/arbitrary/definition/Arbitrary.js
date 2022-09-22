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
exports.__esModule = true;
var Shrinkable_1 = require("./Shrinkable");
/**
 * Abstract class able to generate values on type `T`
 *
 * The values generated by an instance of Arbitrary can be previewed - with {@link sample}
 * - or classified - with {@link statistics}.
 */
var Arbitrary = /** @class */ (function () {
    function Arbitrary() {
    }
    /**
     * Create another arbitrary by filtering values against `predicate`
     *
     * All the values produced by the resulting arbitrary
     * satisfy `predicate(value) == true`
     *
     * @example
     * ```typescript
     * const integerGenerator: Arbitrary<number> = ...;
     * const evenIntegerGenerator: Arbitrary<number> = integerGenerator.filter(e => e % 2 === 0);
     * // new Arbitrary only keeps even values
     * ```
     *
     * @param predicate Predicate, to test each produced element. Return true to keep the element, false otherwise
     * @returns New arbitrary filtered using predicate
     */
    Arbitrary.prototype.filter = function (predicate) {
        var arb = this;
        return new /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_1.prototype.generate = function (mrng) {
                var g = arb.generate(mrng);
                while (!predicate(g.value)) {
                    g = arb.generate(mrng);
                }
                return g.filter(predicate);
            };
            class_1.prototype.withBias = function (freq) {
                return arb.withBias(freq).filter(predicate);
            };
            return class_1;
        }(Arbitrary))();
    };
    /**
     * Create another arbitrary by mapping all produced values using the provided `mapper`
     * Values produced by the new arbitrary are the result of applying `mapper` value by value
     *
     * @example
     * ```typescript
     * const rgbChannels: Arbitrary<{r:number,g:number,b:number}> = ...;
     * const color: Arbitrary<string> = rgbChannels.map(ch => `#${(ch.r*65536 + ch.g*256 + ch.b).toString(16).padStart(6, '0')}`);
     * // transform an Arbitrary producing {r,g,b} integers into an Arbitrary of '#rrggbb'
     * ```
     *
     * @param mapper Map function, to produce a new element based on an old one
     * @returns New arbitrary with mapped elements
     */
    Arbitrary.prototype.map = function (mapper) {
        var arb = this;
        return new /** @class */ (function (_super) {
            __extends(class_2, _super);
            function class_2() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_2.prototype.generate = function (mrng) {
                return arb.generate(mrng).map(mapper);
            };
            class_2.prototype.withBias = function (freq) {
                return arb.withBias(freq).map(mapper);
            };
            return class_2;
        }(Arbitrary))();
    };
    /**
     * Create another Arbitrary with no shrink values
     *
     * @example
     * ```typescript
     * const dataGenerator: Arbitrary<string> = ...;
     * const unshrinkableDataGenerator: Arbitrary<string> = dataGenerator.noShrink();
     * // same values no shrink
     * ```
     *
     * @returns Create another arbitrary with no shrink values
     */
    Arbitrary.prototype.noShrink = function () {
        var arb = this;
        return new /** @class */ (function (_super) {
            __extends(class_3, _super);
            function class_3() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_3.prototype.generate = function (mrng) {
                return new Shrinkable_1["default"](arb.generate(mrng).value);
            };
            class_3.prototype.withBias = function (freq) {
                return arb.withBias(freq).noShrink();
            };
            return class_3;
        }(Arbitrary))();
    };
    /**
     * Create another Arbitrary having bias - by default return itself
     *
     * @param freq The biased version will be used one time over freq - if it exists - freq must be superior or equal to 2 to avoid any lock
     */
    Arbitrary.prototype.withBias = function (freq) {
        return this;
    };
    /**
     * Create another Arbitrary that cannot be biased
     *
     * @param freq The biased version will be used one time over freq - if it exists
     */
    Arbitrary.prototype.noBias = function () {
        var arb = this;
        return new /** @class */ (function (_super) {
            __extends(class_4, _super);
            function class_4() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_4.prototype.generate = function (mrng) {
                return arb.generate(mrng);
            };
            return class_4;
        }(Arbitrary))();
    };
    return Arbitrary;
}());
exports.Arbitrary = Arbitrary;
exports["default"] = Arbitrary;
//# sourceMappingURL=Arbitrary.js.map