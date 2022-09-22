(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.fastcheck = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"../../stream/Stream":41,"./IntegerArbitrary":8,"./definition/Arbitrary":19,"./definition/Shrinkable":21}],2:[function(require,module,exports){
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

},{"./IntegerArbitrary":8}],3:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var IntegerArbitrary_1 = require("./IntegerArbitrary");
/** @hidden */
function CharacterArbitrary(min, max, mapToCode) {
    if (mapToCode === void 0) { mapToCode = function (v) { return v; }; }
    return IntegerArbitrary_1.integer(min, max)
        .map(function (n) { return String.fromCharCode(mapToCode(n)); })
        .noBias();
}
/**
 * For single printable ascii characters - char code between 0x20 (included) and 0x7e (included)
 * @see https://www.ascii-code.com/
 */
function char() {
    // Only printable characters: https://www.ascii-code.com/
    return CharacterArbitrary(0x20, 0x7e);
}
exports.char = char;
/**
 * For single hexadecimal characters - 0-9 or a-f
 */
function hexa() {
    function mapper(v) {
        return v < 10
            ? v + 48 // 0-9
            : v + 97 - 10; // a-f
    }
    return CharacterArbitrary(0, 15, mapper);
}
exports.hexa = hexa;
/**
 * For single base64 characters - A-Z, a-z, 0-9, + or /
 */
function base64() {
    function mapper(v) {
        if (v < 26)
            return v + 65; // A-Z
        if (v < 52)
            return v + 97 - 26; // a-z
        if (v < 62)
            return v + 48 - 52; // 0-9
        return v === 62 ? 43 : 47; // +/
    }
    return CharacterArbitrary(0, 63, mapper);
}
exports.base64 = base64;
/**
 * For single ascii characters - char code between 0x00 (included) and 0x7f (included)
 */
function ascii() {
    return CharacterArbitrary(0x00, 0x7f);
}
exports.ascii = ascii;
/**
 * For single characters - all values in 0x0000-0xffff can be generated
 *
 * WARNING:
 *
 * Some generated characters might appear invalid regarding UCS-2 and UTF-16 encoding.
 * Indeed values within 0xd800 and 0xdfff constitute surrogate pair characters and are illegal without their paired character.
 */
function char16bits() {
    return CharacterArbitrary(0x0000, 0xffff);
}
exports.char16bits = char16bits;
/**
 * For single unicode characters defined in the BMP plan - char code between 0x0000 (included) and 0xffff (included) and without the range 0xd800 to 0xdfff (surrogate pair characters)
 */
function unicode() {
    // Characters in the range: U+D800 to U+DFFF
    // are called 'surrogate pairs', they cannot be defined alone and come by pairs
    // JavaScript function 'fromCodePoint' can handle those
    // This unicode builder is able to produce a subset of UTF-16 characters called UCS-2
    // You can refer to 'fromCharCode' documentation for more details
    var gapSize = 0xdfff + 1 - 0xd800;
    function mapping(v) {
        if (v < 0xd800)
            return v;
        return v + gapSize;
    }
    return CharacterArbitrary(0x0000, 0xffff - gapSize, mapping);
}
exports.unicode = unicode;
/**
 * For single unicode characters - any of the code points defined in the unicode standard
 *
 * WARNING: Generated values can have a length greater than 1.
 *
 * @see https://tc39.github.io/ecma262/#sec-utf16encoding
 */
function fullUnicode() {
    // Might require a polyfill if String.fromCodePoint is missing
    // from the node version or web-browser
    // Be aware that 'characters' can have a length greater than 1
    // More details on: https://tc39.github.io/ecma262/#sec-utf16encoding
    // This unicode builder is able to produce all the UTF-16 characters
    // It only produces valid UTF-16 code points
    var gapSize = 0xdfff + 1 - 0xd800;
    function mapping(v) {
        if (v < 0xd800)
            return v;
        return v + gapSize;
    }
    // Do not call CharacterArbitrary or use fromCodePoint in it
    // String.fromCodePoint is unknown for older versions of node
    return IntegerArbitrary_1.integer(0x0000, 0x10ffff - gapSize)
        .map(function (n) { return String.fromCodePoint(mapping(n)); })
        .noBias();
}
exports.fullUnicode = fullUnicode;

},{"./IntegerArbitrary":8}],4:[function(require,module,exports){
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
/** @hidden */
var ConstantArbitrary = /** @class */ (function (_super) {
    __extends(ConstantArbitrary, _super);
    function ConstantArbitrary(values) {
        var _this = _super.call(this) || this;
        _this.values = values;
        return _this;
    }
    ConstantArbitrary.prototype.generate = function (mrng) {
        var _this = this;
        if (this.values.length === 1)
            return new Shrinkable_1["default"](this.values[0]);
        var id = mrng.nextInt(0, this.values.length - 1);
        if (id === 0)
            return new Shrinkable_1["default"](this.values[0]);
        function g(v) {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Shrinkable_1["default"](v)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }
        return new Shrinkable_1["default"](this.values[id], function () { return Stream_1.stream(g(_this.values[0])); });
    };
    return ConstantArbitrary;
}(Arbitrary_1["default"]));
/**
 * For `value`
 * @param value The value to produce
 */
function constant(value) {
    return new ConstantArbitrary([value]);
}
exports.constant = constant;
/**
 * For one of `v0` or `...values` values - all equiprobable
 * @param v0 One of the value to produce (all values shrink to this one)
 * @param values Other possible values
 */
function constantFrom(v0) {
    var values = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        values[_i - 1] = arguments[_i];
    }
    return new ConstantArbitrary(__spread([v0], values));
}
exports.constantFrom = constantFrom;

},{"../../stream/Stream":41,"./definition/Arbitrary":19,"./definition/Shrinkable":21}],5:[function(require,module,exports){
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
var SetArbitrary_1 = require("./SetArbitrary");
var TupleArbitrary_1 = require("./TupleArbitrary");
/** @hidden */
function toObject(items) {
    var obj = {};
    try {
        for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
            var keyValue = items_1_1.value;
            obj[keyValue[0]] = keyValue[1];
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (items_1_1 && !items_1_1.done && (_a = items_1["return"])) _a.call(items_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return obj;
    var e_1, _a;
}
/**
 * For dictionaries with keys produced by `keyArb` and values from `valueArb`
 * @param keyArb Arbitrary used to generate the keys of the object
 * @param valueArb Arbitrary used to generate the values of the object
 */
function dictionary(keyArb, valueArb) {
    return SetArbitrary_1.set(TupleArbitrary_1.tuple(keyArb, valueArb), function (t1, t2) { return t1[0] === t2[0]; }).map(toObject);
}
exports.dictionary = dictionary;

},{"./SetArbitrary":14,"./TupleArbitrary":18}],6:[function(require,module,exports){
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

},{"./IntegerArbitrary":8,"./TupleArbitrary":18}],7:[function(require,module,exports){
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
var Arbitrary_1 = require("./definition/Arbitrary");
/** @hidden */
var FrequencyArbitrary = /** @class */ (function (_super) {
    __extends(FrequencyArbitrary, _super);
    function FrequencyArbitrary(warbs) {
        var _this = _super.call(this) || this;
        _this.warbs = warbs;
        _this.summedWarbs = warbs
            .reduce(function (p, c) {
            return p.concat({
                weight: p[p.length - 1].weight + c.weight,
                arbitrary: c.arbitrary
            });
        }, [{ weight: 0, arbitrary: warbs[0].arbitrary }])
            .slice(1);
        _this.totalWeight = _this.summedWarbs[_this.summedWarbs.length - 1].weight;
        return _this;
    }
    FrequencyArbitrary.prototype.generate = function (mrng) {
        var selected = mrng.nextInt(0, this.totalWeight - 1);
        return this.summedWarbs.find(function (warb) { return selected < warb.weight; }).arbitrary.generate(mrng);
    };
    FrequencyArbitrary.prototype.withBias = function (freq) {
        return new FrequencyArbitrary(this.warbs.map(function (v) { return ({ weight: v.weight, arbitrary: v.arbitrary.withBias(freq) }); }));
    };
    return FrequencyArbitrary;
}(Arbitrary_1["default"]));
/**
 * For one of the values generated by `warb0` or `...warbs` - the probability of selecting the ith warb is of `warb[i].weight / sum(warb[j].weight)`
 * @param warb0 One of the (Arbitrary, weight) that might be called to produce a value
 * @param warbs Other possible (Arbitrary, weight)
 */
function frequency(warb0) {
    var warbs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        warbs[_i - 1] = arguments[_i];
    }
    return new FrequencyArbitrary(__spread([warb0], warbs));
}
exports.frequency = frequency;

},{"./definition/Arbitrary":19}],8:[function(require,module,exports){
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var Stream_1 = require("../../stream/Stream");
var Arbitrary_1 = require("./definition/Arbitrary");
var ArbitraryWithShrink_1 = require("./definition/ArbitraryWithShrink");
var Shrinkable_1 = require("./definition/Shrinkable");
/** @hidden */
var IntegerArbitrary = /** @class */ (function (_super) {
    __extends(IntegerArbitrary, _super);
    function IntegerArbitrary(min, max) {
        var _this = _super.call(this) || this;
        _this.min = min === undefined ? IntegerArbitrary.MIN_INT : min;
        _this.max = max === undefined ? IntegerArbitrary.MAX_INT : max;
        return _this;
    }
    IntegerArbitrary.prototype.wrapper = function (value, shrunkOnce) {
        var _this = this;
        return new Shrinkable_1["default"](value, function () { return _this.shrink(value, shrunkOnce).map(function (v) { return _this.wrapper(v, true); }); });
    };
    IntegerArbitrary.prototype.generate = function (mrng) {
        return this.wrapper(mrng.nextInt(this.min, this.max), false);
    };
    IntegerArbitrary.prototype.shrink_to = function (value, target, shrunkOnce) {
        var realGap = value - target;
        function shrink_decr() {
            var gap, toremove;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        gap = shrunkOnce ? Math.floor(realGap / 2) : realGap;
                        toremove = gap;
                        _a.label = 1;
                    case 1:
                        if (!(toremove > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, value - toremove];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        toremove = Math.floor(toremove / 2);
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }
        function shrink_incr() {
            var gap, toremove;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        gap = shrunkOnce ? Math.ceil(realGap / 2) : realGap;
                        toremove = gap;
                        _a.label = 1;
                    case 1:
                        if (!(toremove < 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, value - toremove];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        toremove = Math.ceil(toremove / 2);
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }
        return realGap > 0 ? Stream_1.stream(shrink_decr()) : Stream_1.stream(shrink_incr());
    };
    IntegerArbitrary.prototype.shrink = function (value, shrunkOnce) {
        if (this.min <= 0 && this.max >= 0) {
            return this.shrink_to(value, 0, shrunkOnce === true);
        }
        return value < 0
            ? this.shrink_to(value, this.max, shrunkOnce === true)
            : this.shrink_to(value, this.min, shrunkOnce === true);
    };
    IntegerArbitrary.prototype.pureBiasedArbitrary = function () {
        var log2 = function (v) { return Math.floor(Math.log(v) / Math.log(2)); };
        if (this.min === this.max) {
            return new IntegerArbitrary(this.min, this.max);
        }
        if (this.min < 0) {
            return this.max > 0
                ? new IntegerArbitrary(-log2(-this.min), log2(this.max)) // min and max != 0
                : new IntegerArbitrary(this.max - log2(this.max - this.min), this.max); // max-min != 0
        }
        // min >= 0, so max >= 0
        return new IntegerArbitrary(this.min, this.min + log2(this.max - this.min)); // max-min != 0
    };
    IntegerArbitrary.prototype.withBias = function (freq) {
        var arb = this;
        var smallArb = this.pureBiasedArbitrary();
        return new /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_1.prototype.generate = function (mrng) {
                return mrng.nextInt(1, freq) === 1 ? smallArb.generate(mrng) : arb.generate(mrng);
            };
            return class_1;
        }(Arbitrary_1.Arbitrary))();
    };
    IntegerArbitrary.MIN_INT = 0x80000000 | 0;
    IntegerArbitrary.MAX_INT = 0x7fffffff | 0;
    return IntegerArbitrary;
}(ArbitraryWithShrink_1.ArbitraryWithShrink));
function integer(a, b) {
    return b === undefined ? new IntegerArbitrary(undefined, a) : new IntegerArbitrary(a, b);
}
exports.integer = integer;
function nat(a) {
    return new IntegerArbitrary(0, a);
}
exports.nat = nat;

},{"../../stream/Stream":41,"./definition/Arbitrary":19,"./definition/ArbitraryWithShrink":20,"./definition/Shrinkable":21}],9:[function(require,module,exports){
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
var loremIpsum = require("lorem-ipsum");
var Arbitrary_1 = require("./definition/Arbitrary");
var Shrinkable_1 = require("./definition/Shrinkable");
var IntegerArbitrary_1 = require("./IntegerArbitrary");
/** @hidden */
var LoremArbitrary = /** @class */ (function (_super) {
    __extends(LoremArbitrary, _super);
    function LoremArbitrary(maxWordsCount, sentencesMode) {
        var _this = _super.call(this) || this;
        _this.arbWordsCount = IntegerArbitrary_1.nat(maxWordsCount || 5);
        _this.sentencesMode = sentencesMode || false;
        return _this;
    }
    LoremArbitrary.prototype.generate = function (mrng) {
        var numWords = this.arbWordsCount.generate(mrng).value;
        var loremString = loremIpsum({
            count: numWords,
            units: this.sentencesMode ? 'sentences' : 'words',
            random: function () { return mrng.nextDouble(); }
        });
        return new Shrinkable_1["default"](loremString);
    };
    return LoremArbitrary;
}(Arbitrary_1["default"]));
function lorem(maxWordsCount, sentencesMode) {
    return new LoremArbitrary(maxWordsCount, sentencesMode);
}
exports.lorem = lorem;

},{"./IntegerArbitrary":8,"./definition/Arbitrary":19,"./definition/Shrinkable":21,"lorem-ipsum":383}],10:[function(require,module,exports){
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
var ArrayArbitrary_1 = require("./ArrayArbitrary");
var BooleanArbitrary_1 = require("./BooleanArbitrary");
var ConstantArbitrary_1 = require("./ConstantArbitrary");
var DictionaryArbitrary_1 = require("./DictionaryArbitrary");
var FloatingPointArbitrary_1 = require("./FloatingPointArbitrary");
var IntegerArbitrary_1 = require("./IntegerArbitrary");
var OneOfArbitrary_1 = require("./OneOfArbitrary");
var StringArbitrary_1 = require("./StringArbitrary");
var ObjectConstraints = /** @class */ (function () {
    function ObjectConstraints(key, values, maxDepth) {
        this.key = key;
        this.values = values;
        this.maxDepth = maxDepth;
    }
    ObjectConstraints.prototype.next = function () {
        return new ObjectConstraints(this.key, this.values, this.maxDepth - 1);
    };
    /**
     * Default value of ObjectConstraints.Settings.values field
     */
    ObjectConstraints.defaultValues = function () {
        return [
            BooleanArbitrary_1.boolean(),
            IntegerArbitrary_1.integer(),
            FloatingPointArbitrary_1.double(),
            StringArbitrary_1.string(),
            OneOfArbitrary_1.oneof(StringArbitrary_1.string(), ConstantArbitrary_1.constant(null), ConstantArbitrary_1.constant(undefined)),
            OneOfArbitrary_1.oneof(FloatingPointArbitrary_1.double(), ConstantArbitrary_1.constant(-0), ConstantArbitrary_1.constant(0), ConstantArbitrary_1.constant(Number.NaN), ConstantArbitrary_1.constant(Number.POSITIVE_INFINITY), ConstantArbitrary_1.constant(Number.NEGATIVE_INFINITY), ConstantArbitrary_1.constant(Number.EPSILON), ConstantArbitrary_1.constant(Number.MIN_VALUE), ConstantArbitrary_1.constant(Number.MAX_VALUE), ConstantArbitrary_1.constant(Number.MIN_SAFE_INTEGER), ConstantArbitrary_1.constant(Number.MAX_SAFE_INTEGER))
        ];
    };
    ObjectConstraints.from = function (settings) {
        function getOr(access, value) {
            return settings != null && access() != null ? access() : value;
        }
        return new ObjectConstraints(getOr(function () { return settings.key; }, StringArbitrary_1.string()), getOr(function () { return settings.values; }, ObjectConstraints.defaultValues()), getOr(function () { return settings.maxDepth; }, 2));
    };
    return ObjectConstraints;
}());
exports.ObjectConstraints = ObjectConstraints;
/** @hidden */
var anythingInternal = function (subConstraints) {
    var potentialArbValue = __spread(subConstraints.values); // base
    if (subConstraints.maxDepth > 0) {
        potentialArbValue.push(objectInternal(subConstraints.next())); // sub-object
        potentialArbValue.push.apply(// sub-object
        potentialArbValue, __spread(subConstraints.values.map(function (arb) { return ArrayArbitrary_1.array(arb); }))); // arrays of base
        potentialArbValue.push(ArrayArbitrary_1.array(anythingInternal(subConstraints.next()))); // mixed content arrays
    }
    if (subConstraints.maxDepth > 1) {
        potentialArbValue.push(ArrayArbitrary_1.array(objectInternal(subConstraints.next().next()))); // array of Object
    }
    return OneOfArbitrary_1.oneof.apply(void 0, __spread([potentialArbValue[0]], potentialArbValue.slice(0)));
};
/** @hidden */
var objectInternal = function (constraints) {
    return DictionaryArbitrary_1.dictionary(constraints.key, anythingInternal(constraints));
};
function anything(settings) {
    return anythingInternal(ObjectConstraints.from(settings));
}
exports.anything = anything;
function object(settings) {
    return objectInternal(ObjectConstraints.from(settings));
}
exports.object = object;
/** @hidden */
function jsonSettings(stringArbitrary, maxDepth) {
    var key = stringArbitrary;
    var values = [BooleanArbitrary_1.boolean(), IntegerArbitrary_1.integer(), FloatingPointArbitrary_1.double(), stringArbitrary, ConstantArbitrary_1.constant(null)];
    return maxDepth != null ? { key: key, values: values, maxDepth: maxDepth } : { key: key, values: values };
}
function jsonObject(maxDepth) {
    return anything(jsonSettings(StringArbitrary_1.string(), maxDepth));
}
exports.jsonObject = jsonObject;
function unicodeJsonObject(maxDepth) {
    return anything(jsonSettings(StringArbitrary_1.unicodeString(), maxDepth));
}
exports.unicodeJsonObject = unicodeJsonObject;
function json(maxDepth) {
    var arb = maxDepth != null ? jsonObject(maxDepth) : jsonObject();
    return arb.map(JSON.stringify);
}
exports.json = json;
function unicodeJson(maxDepth) {
    var arb = maxDepth != null ? unicodeJsonObject(maxDepth) : unicodeJsonObject();
    return arb.map(JSON.stringify);
}
exports.unicodeJson = unicodeJson;

},{"./ArrayArbitrary":1,"./BooleanArbitrary":2,"./ConstantArbitrary":4,"./DictionaryArbitrary":5,"./FloatingPointArbitrary":6,"./IntegerArbitrary":8,"./OneOfArbitrary":11,"./StringArbitrary":15}],11:[function(require,module,exports){
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
var Arbitrary_1 = require("./definition/Arbitrary");
/** @hidden */
var OneOfArbitrary = /** @class */ (function (_super) {
    __extends(OneOfArbitrary, _super);
    function OneOfArbitrary(arbs) {
        var _this = _super.call(this) || this;
        _this.arbs = arbs;
        return _this;
    }
    OneOfArbitrary.prototype.generate = function (mrng) {
        var id = mrng.nextInt(0, this.arbs.length - 1);
        return this.arbs[id].generate(mrng);
    };
    OneOfArbitrary.prototype.withBias = function (freq) {
        return new OneOfArbitrary(this.arbs.map(function (a) { return a.withBias(freq); }));
    };
    return OneOfArbitrary;
}(Arbitrary_1["default"]));
/**
 * For one of the values generated by `arb0` or `...arbs` - `arb0` and `...arbs` are equiprobable
 *
 * @param arb0 One of the arbitrary that might be called to produce a value
 * @param arbs Other possible arbitraries
 */
function oneof(arb0) {
    var arbs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        arbs[_i - 1] = arguments[_i];
    }
    return new OneOfArbitrary(__spread([arb0], arbs));
}
exports.oneof = oneof;

},{"./definition/Arbitrary":19}],12:[function(require,module,exports){
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var Arbitrary_1 = require("./definition/Arbitrary");
var Shrinkable_1 = require("./definition/Shrinkable");
var IntegerArbitrary_1 = require("./IntegerArbitrary");
/** @hidden */
var OptionArbitrary = /** @class */ (function (_super) {
    __extends(OptionArbitrary, _super);
    function OptionArbitrary(arb, frequency) {
        var _this = _super.call(this) || this;
        _this.arb = arb;
        _this.frequency = frequency;
        _this.isOptionArb = IntegerArbitrary_1.nat(frequency); // 1 chance over <frequency> to have non null
        return _this;
    }
    OptionArbitrary.extendedShrinkable = function (s) {
        function g() {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Shrinkable_1["default"](null)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }
        return new Shrinkable_1["default"](s.value, function () {
            return s
                .shrink()
                .map(OptionArbitrary.extendedShrinkable)
                .join(g());
        });
    };
    OptionArbitrary.prototype.generate = function (mrng) {
        return this.isOptionArb.generate(mrng).value === 0
            ? new Shrinkable_1["default"](null)
            : OptionArbitrary.extendedShrinkable(this.arb.generate(mrng));
    };
    OptionArbitrary.prototype.withBias = function (freq) {
        return new OptionArbitrary(this.arb.withBias(freq), this.frequency);
    };
    return OptionArbitrary;
}(Arbitrary_1.Arbitrary));
function option(arb, freq) {
    return new OptionArbitrary(arb, freq == null ? 5 : freq);
}
exports.option = option;

},{"./IntegerArbitrary":8,"./definition/Arbitrary":19,"./definition/Shrinkable":21}],13:[function(require,module,exports){
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
var OptionArbitrary_1 = require("./OptionArbitrary");
var TupleArbitrary_1 = require("./TupleArbitrary");
/** @hidden */
function rawRecord(recordModel) {
    var keys = Object.keys(recordModel);
    var arbs = keys.map(function (v) { return recordModel[v]; });
    return TupleArbitrary_1.genericTuple(arbs).map(function (gs) {
        var obj = {};
        for (var idx = 0; idx !== keys.length; ++idx)
            obj[keys[idx]] = gs[idx];
        return obj;
    });
}
function record(recordModel, constraints) {
    if (constraints == null || (constraints.withDeletedKeys !== true && constraints.with_deleted_keys !== true))
        return rawRecord(recordModel);
    var updatedRecordModel = {};
    try {
        for (var _a = __values(Object.keys(recordModel)), _b = _a.next(); !_b.done; _b = _a.next()) {
            var k = _b.value;
            updatedRecordModel[k] = OptionArbitrary_1.option(recordModel[k].map(function (v) { return ({ value: v }); }));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_b && !_b.done && (_c = _a["return"])) _c.call(_a);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return rawRecord(updatedRecordModel).map(function (obj) {
        var nobj = {};
        try {
            for (var _a = __values(Object.keys(obj)), _b = _a.next(); !_b.done; _b = _a.next()) {
                var k = _b.value;
                if (obj[k] != null)
                    nobj[k] = obj[k].value;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a["return"])) _c.call(_a);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return nobj;
        var e_2, _c;
    });
    var e_1, _c;
}
exports.record = record;

},{"./OptionArbitrary":12,"./TupleArbitrary":18}],14:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var ArrayArbitrary_1 = require("./ArrayArbitrary");
/** @hidden */
function subArrayContains(tab, upperBound, includeValue) {
    for (var idx = 0; idx < upperBound; ++idx) {
        if (includeValue(tab[idx]))
            return true;
    }
    return false;
}
/** @hidden */
function swap(tab, idx1, idx2) {
    var temp = tab[idx1];
    tab[idx1] = tab[idx2];
    tab[idx2] = temp;
}
/** @hidden */
function buildCompareFilter(compare) {
    return function (tab) {
        var finalLength = tab.length;
        var _loop_1 = function (idx) {
            if (subArrayContains(tab, idx, function (t) { return compare(t.value, tab[idx].value); })) {
                --finalLength;
                swap(tab, idx, finalLength);
            }
        };
        for (var idx = tab.length - 1; idx !== -1; --idx) {
            _loop_1(idx);
        }
        return tab.slice(0, finalLength);
    };
}
exports.buildCompareFilter = buildCompareFilter;
function set(arb, aLength, bLength, compareFn) {
    var minLength = bLength == null || typeof bLength !== 'number' ? 0 : aLength;
    var maxLength = aLength == null || typeof aLength !== 'number' ? 10 : typeof bLength === 'number' ? bLength : aLength;
    var compare = compareFn != null
        ? compareFn
        : typeof bLength === 'function'
            ? bLength
            : typeof aLength === 'function'
                ? aLength
                : function (a, b) { return a === b; };
    var arrayArb = new ArrayArbitrary_1.ArrayArbitrary(arb, minLength, maxLength, buildCompareFilter(compare));
    if (minLength === 0)
        return arrayArb;
    return arrayArb.filter(function (tab) { return tab.length >= minLength; });
}
exports.set = set;

},{"./ArrayArbitrary":1}],15:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var ArrayArbitrary_1 = require("./ArrayArbitrary");
var CharacterArbitrary_1 = require("./CharacterArbitrary");
/** @hidden */
function StringArbitrary(charArb, aLength, bLength) {
    var arrayArb = aLength != null ? (bLength != null ? ArrayArbitrary_1.array(charArb, aLength, bLength) : ArrayArbitrary_1.array(charArb, aLength)) : ArrayArbitrary_1.array(charArb);
    return arrayArb.map(function (tab) { return tab.join(''); });
}
/** @hidden */
function Base64StringArbitrary(minLength, maxLength) {
    if (minLength > maxLength)
        throw new Error('Minimal length should be inferior or equal to maximal length');
    if (minLength % 4 !== 0)
        throw new Error('Minimal length of base64 strings must be a multiple of 4');
    if (maxLength % 4 !== 0)
        throw new Error('Maximal length of base64 strings must be a multiple of 4');
    return StringArbitrary(CharacterArbitrary_1.base64(), minLength, maxLength).map(function (s) {
        switch (s.length % 4) {
            case 0:
                return s;
            case 3:
                return s + "=";
            case 2:
                return s + "==";
            default:
                return s.slice(1); // remove one extra char to get to %4 == 0
        }
    });
}
function stringOf(charArb, aLength, bLength) {
    return StringArbitrary(charArb, aLength, bLength);
}
exports.stringOf = stringOf;
function string(aLength, bLength) {
    return StringArbitrary(CharacterArbitrary_1.char(), aLength, bLength);
}
exports.string = string;
function asciiString(aLength, bLength) {
    return StringArbitrary(CharacterArbitrary_1.ascii(), aLength, bLength);
}
exports.asciiString = asciiString;
function string16bits(aLength, bLength) {
    return StringArbitrary(CharacterArbitrary_1.char16bits(), aLength, bLength);
}
exports.string16bits = string16bits;
function unicodeString(aLength, bLength) {
    return StringArbitrary(CharacterArbitrary_1.unicode(), aLength, bLength);
}
exports.unicodeString = unicodeString;
function fullUnicodeString(aLength, bLength) {
    return StringArbitrary(CharacterArbitrary_1.fullUnicode(), aLength, bLength);
}
exports.fullUnicodeString = fullUnicodeString;
function hexaString(aLength, bLength) {
    return StringArbitrary(CharacterArbitrary_1.hexa(), aLength, bLength);
}
exports.hexaString = hexaString;
function base64String(aLength, bLength) {
    var minLength = aLength != null && bLength != null ? aLength : 0;
    var maxLength = bLength == null ? (aLength == null ? 16 : aLength) : bLength;
    return Base64StringArbitrary(minLength + 3 - (minLength + 3) % 4, maxLength - maxLength % 4); // base64 length is always a multiple of 4
}
exports.base64String = base64String;

},{"./ArrayArbitrary":1,"./CharacterArbitrary":3}],16:[function(require,module,exports){
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
var Arbitrary_1 = require("./definition/Arbitrary");
var TupleArbitrary_generic_1 = require("./TupleArbitrary.generic");
/** @hidden */
var Tuple1Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple1Arbitrary, _super);
    function Tuple1Arbitrary(arb0) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0]);
        return _this;
    }
    Tuple1Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple1Arbitrary.prototype.withBias = function (freq) {
        return new Tuple1Arbitrary(this.arb0.withBias(freq));
    };
    return Tuple1Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple1Arbitrary = Tuple1Arbitrary;
;
/** @hidden */
var Tuple2Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple2Arbitrary, _super);
    function Tuple2Arbitrary(arb0, arb1) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1]);
        return _this;
    }
    Tuple2Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple2Arbitrary.prototype.withBias = function (freq) {
        return new Tuple2Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq));
    };
    return Tuple2Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple2Arbitrary = Tuple2Arbitrary;
;
/** @hidden */
var Tuple3Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple3Arbitrary, _super);
    function Tuple3Arbitrary(arb0, arb1, arb2) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2]);
        return _this;
    }
    Tuple3Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple3Arbitrary.prototype.withBias = function (freq) {
        return new Tuple3Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq));
    };
    return Tuple3Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple3Arbitrary = Tuple3Arbitrary;
;
/** @hidden */
var Tuple4Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple4Arbitrary, _super);
    function Tuple4Arbitrary(arb0, arb1, arb2, arb3) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3]);
        return _this;
    }
    Tuple4Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple4Arbitrary.prototype.withBias = function (freq) {
        return new Tuple4Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq));
    };
    return Tuple4Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple4Arbitrary = Tuple4Arbitrary;
;
/** @hidden */
var Tuple5Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple5Arbitrary, _super);
    function Tuple5Arbitrary(arb0, arb1, arb2, arb3, arb4) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.arb4 = arb4;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3, arb4]);
        return _this;
    }
    Tuple5Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple5Arbitrary.prototype.withBias = function (freq) {
        return new Tuple5Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq), this.arb4.withBias(freq));
    };
    return Tuple5Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple5Arbitrary = Tuple5Arbitrary;
;
/** @hidden */
var Tuple6Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple6Arbitrary, _super);
    function Tuple6Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.arb4 = arb4;
        _this.arb5 = arb5;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3, arb4, arb5]);
        return _this;
    }
    Tuple6Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple6Arbitrary.prototype.withBias = function (freq) {
        return new Tuple6Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq), this.arb4.withBias(freq), this.arb5.withBias(freq));
    };
    return Tuple6Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple6Arbitrary = Tuple6Arbitrary;
;
/** @hidden */
var Tuple7Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple7Arbitrary, _super);
    function Tuple7Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.arb4 = arb4;
        _this.arb5 = arb5;
        _this.arb6 = arb6;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3, arb4, arb5, arb6]);
        return _this;
    }
    Tuple7Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple7Arbitrary.prototype.withBias = function (freq) {
        return new Tuple7Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq), this.arb4.withBias(freq), this.arb5.withBias(freq), this.arb6.withBias(freq));
    };
    return Tuple7Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple7Arbitrary = Tuple7Arbitrary;
;
/** @hidden */
var Tuple8Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple8Arbitrary, _super);
    function Tuple8Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.arb4 = arb4;
        _this.arb5 = arb5;
        _this.arb6 = arb6;
        _this.arb7 = arb7;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7]);
        return _this;
    }
    Tuple8Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple8Arbitrary.prototype.withBias = function (freq) {
        return new Tuple8Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq), this.arb4.withBias(freq), this.arb5.withBias(freq), this.arb6.withBias(freq), this.arb7.withBias(freq));
    };
    return Tuple8Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple8Arbitrary = Tuple8Arbitrary;
;
/** @hidden */
var Tuple9Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple9Arbitrary, _super);
    function Tuple9Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.arb4 = arb4;
        _this.arb5 = arb5;
        _this.arb6 = arb6;
        _this.arb7 = arb7;
        _this.arb8 = arb8;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8]);
        return _this;
    }
    Tuple9Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple9Arbitrary.prototype.withBias = function (freq) {
        return new Tuple9Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq), this.arb4.withBias(freq), this.arb5.withBias(freq), this.arb6.withBias(freq), this.arb7.withBias(freq), this.arb8.withBias(freq));
    };
    return Tuple9Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple9Arbitrary = Tuple9Arbitrary;
;
/** @hidden */
var Tuple10Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple10Arbitrary, _super);
    function Tuple10Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.arb4 = arb4;
        _this.arb5 = arb5;
        _this.arb6 = arb6;
        _this.arb7 = arb7;
        _this.arb8 = arb8;
        _this.arb9 = arb9;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9]);
        return _this;
    }
    Tuple10Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple10Arbitrary.prototype.withBias = function (freq) {
        return new Tuple10Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq), this.arb4.withBias(freq), this.arb5.withBias(freq), this.arb6.withBias(freq), this.arb7.withBias(freq), this.arb8.withBias(freq), this.arb9.withBias(freq));
    };
    return Tuple10Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple10Arbitrary = Tuple10Arbitrary;
;
/** @hidden */
var Tuple11Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple11Arbitrary, _super);
    function Tuple11Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.arb4 = arb4;
        _this.arb5 = arb5;
        _this.arb6 = arb6;
        _this.arb7 = arb7;
        _this.arb8 = arb8;
        _this.arb9 = arb9;
        _this.arb10 = arb10;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10]);
        return _this;
    }
    Tuple11Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple11Arbitrary.prototype.withBias = function (freq) {
        return new Tuple11Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq), this.arb4.withBias(freq), this.arb5.withBias(freq), this.arb6.withBias(freq), this.arb7.withBias(freq), this.arb8.withBias(freq), this.arb9.withBias(freq), this.arb10.withBias(freq));
    };
    return Tuple11Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple11Arbitrary = Tuple11Arbitrary;
;
/** @hidden */
var Tuple12Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple12Arbitrary, _super);
    function Tuple12Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.arb4 = arb4;
        _this.arb5 = arb5;
        _this.arb6 = arb6;
        _this.arb7 = arb7;
        _this.arb8 = arb8;
        _this.arb9 = arb9;
        _this.arb10 = arb10;
        _this.arb11 = arb11;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11]);
        return _this;
    }
    Tuple12Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple12Arbitrary.prototype.withBias = function (freq) {
        return new Tuple12Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq), this.arb4.withBias(freq), this.arb5.withBias(freq), this.arb6.withBias(freq), this.arb7.withBias(freq), this.arb8.withBias(freq), this.arb9.withBias(freq), this.arb10.withBias(freq), this.arb11.withBias(freq));
    };
    return Tuple12Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple12Arbitrary = Tuple12Arbitrary;
;
/** @hidden */
var Tuple13Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple13Arbitrary, _super);
    function Tuple13Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.arb4 = arb4;
        _this.arb5 = arb5;
        _this.arb6 = arb6;
        _this.arb7 = arb7;
        _this.arb8 = arb8;
        _this.arb9 = arb9;
        _this.arb10 = arb10;
        _this.arb11 = arb11;
        _this.arb12 = arb12;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12]);
        return _this;
    }
    Tuple13Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple13Arbitrary.prototype.withBias = function (freq) {
        return new Tuple13Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq), this.arb4.withBias(freq), this.arb5.withBias(freq), this.arb6.withBias(freq), this.arb7.withBias(freq), this.arb8.withBias(freq), this.arb9.withBias(freq), this.arb10.withBias(freq), this.arb11.withBias(freq), this.arb12.withBias(freq));
    };
    return Tuple13Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple13Arbitrary = Tuple13Arbitrary;
;
/** @hidden */
var Tuple14Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple14Arbitrary, _super);
    function Tuple14Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.arb4 = arb4;
        _this.arb5 = arb5;
        _this.arb6 = arb6;
        _this.arb7 = arb7;
        _this.arb8 = arb8;
        _this.arb9 = arb9;
        _this.arb10 = arb10;
        _this.arb11 = arb11;
        _this.arb12 = arb12;
        _this.arb13 = arb13;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13]);
        return _this;
    }
    Tuple14Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple14Arbitrary.prototype.withBias = function (freq) {
        return new Tuple14Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq), this.arb4.withBias(freq), this.arb5.withBias(freq), this.arb6.withBias(freq), this.arb7.withBias(freq), this.arb8.withBias(freq), this.arb9.withBias(freq), this.arb10.withBias(freq), this.arb11.withBias(freq), this.arb12.withBias(freq), this.arb13.withBias(freq));
    };
    return Tuple14Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple14Arbitrary = Tuple14Arbitrary;
;
/** @hidden */
var Tuple15Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple15Arbitrary, _super);
    function Tuple15Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.arb4 = arb4;
        _this.arb5 = arb5;
        _this.arb6 = arb6;
        _this.arb7 = arb7;
        _this.arb8 = arb8;
        _this.arb9 = arb9;
        _this.arb10 = arb10;
        _this.arb11 = arb11;
        _this.arb12 = arb12;
        _this.arb13 = arb13;
        _this.arb14 = arb14;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14]);
        return _this;
    }
    Tuple15Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple15Arbitrary.prototype.withBias = function (freq) {
        return new Tuple15Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq), this.arb4.withBias(freq), this.arb5.withBias(freq), this.arb6.withBias(freq), this.arb7.withBias(freq), this.arb8.withBias(freq), this.arb9.withBias(freq), this.arb10.withBias(freq), this.arb11.withBias(freq), this.arb12.withBias(freq), this.arb13.withBias(freq), this.arb14.withBias(freq));
    };
    return Tuple15Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple15Arbitrary = Tuple15Arbitrary;
;
/** @hidden */
var Tuple16Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple16Arbitrary, _super);
    function Tuple16Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.arb4 = arb4;
        _this.arb5 = arb5;
        _this.arb6 = arb6;
        _this.arb7 = arb7;
        _this.arb8 = arb8;
        _this.arb9 = arb9;
        _this.arb10 = arb10;
        _this.arb11 = arb11;
        _this.arb12 = arb12;
        _this.arb13 = arb13;
        _this.arb14 = arb14;
        _this.arb15 = arb15;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15]);
        return _this;
    }
    Tuple16Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple16Arbitrary.prototype.withBias = function (freq) {
        return new Tuple16Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq), this.arb4.withBias(freq), this.arb5.withBias(freq), this.arb6.withBias(freq), this.arb7.withBias(freq), this.arb8.withBias(freq), this.arb9.withBias(freq), this.arb10.withBias(freq), this.arb11.withBias(freq), this.arb12.withBias(freq), this.arb13.withBias(freq), this.arb14.withBias(freq), this.arb15.withBias(freq));
    };
    return Tuple16Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple16Arbitrary = Tuple16Arbitrary;
;
/** @hidden */
var Tuple17Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple17Arbitrary, _super);
    function Tuple17Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.arb4 = arb4;
        _this.arb5 = arb5;
        _this.arb6 = arb6;
        _this.arb7 = arb7;
        _this.arb8 = arb8;
        _this.arb9 = arb9;
        _this.arb10 = arb10;
        _this.arb11 = arb11;
        _this.arb12 = arb12;
        _this.arb13 = arb13;
        _this.arb14 = arb14;
        _this.arb15 = arb15;
        _this.arb16 = arb16;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16]);
        return _this;
    }
    Tuple17Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple17Arbitrary.prototype.withBias = function (freq) {
        return new Tuple17Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq), this.arb4.withBias(freq), this.arb5.withBias(freq), this.arb6.withBias(freq), this.arb7.withBias(freq), this.arb8.withBias(freq), this.arb9.withBias(freq), this.arb10.withBias(freq), this.arb11.withBias(freq), this.arb12.withBias(freq), this.arb13.withBias(freq), this.arb14.withBias(freq), this.arb15.withBias(freq), this.arb16.withBias(freq));
    };
    return Tuple17Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple17Arbitrary = Tuple17Arbitrary;
;
/** @hidden */
var Tuple18Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple18Arbitrary, _super);
    function Tuple18Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.arb4 = arb4;
        _this.arb5 = arb5;
        _this.arb6 = arb6;
        _this.arb7 = arb7;
        _this.arb8 = arb8;
        _this.arb9 = arb9;
        _this.arb10 = arb10;
        _this.arb11 = arb11;
        _this.arb12 = arb12;
        _this.arb13 = arb13;
        _this.arb14 = arb14;
        _this.arb15 = arb15;
        _this.arb16 = arb16;
        _this.arb17 = arb17;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17]);
        return _this;
    }
    Tuple18Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple18Arbitrary.prototype.withBias = function (freq) {
        return new Tuple18Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq), this.arb4.withBias(freq), this.arb5.withBias(freq), this.arb6.withBias(freq), this.arb7.withBias(freq), this.arb8.withBias(freq), this.arb9.withBias(freq), this.arb10.withBias(freq), this.arb11.withBias(freq), this.arb12.withBias(freq), this.arb13.withBias(freq), this.arb14.withBias(freq), this.arb15.withBias(freq), this.arb16.withBias(freq), this.arb17.withBias(freq));
    };
    return Tuple18Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple18Arbitrary = Tuple18Arbitrary;
;
/** @hidden */
var Tuple19Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple19Arbitrary, _super);
    function Tuple19Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.arb4 = arb4;
        _this.arb5 = arb5;
        _this.arb6 = arb6;
        _this.arb7 = arb7;
        _this.arb8 = arb8;
        _this.arb9 = arb9;
        _this.arb10 = arb10;
        _this.arb11 = arb11;
        _this.arb12 = arb12;
        _this.arb13 = arb13;
        _this.arb14 = arb14;
        _this.arb15 = arb15;
        _this.arb16 = arb16;
        _this.arb17 = arb17;
        _this.arb18 = arb18;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18]);
        return _this;
    }
    Tuple19Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple19Arbitrary.prototype.withBias = function (freq) {
        return new Tuple19Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq), this.arb4.withBias(freq), this.arb5.withBias(freq), this.arb6.withBias(freq), this.arb7.withBias(freq), this.arb8.withBias(freq), this.arb9.withBias(freq), this.arb10.withBias(freq), this.arb11.withBias(freq), this.arb12.withBias(freq), this.arb13.withBias(freq), this.arb14.withBias(freq), this.arb15.withBias(freq), this.arb16.withBias(freq), this.arb17.withBias(freq), this.arb18.withBias(freq));
    };
    return Tuple19Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple19Arbitrary = Tuple19Arbitrary;
;
/** @hidden */
var Tuple20Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple20Arbitrary, _super);
    function Tuple20Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18, arb19) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.arb4 = arb4;
        _this.arb5 = arb5;
        _this.arb6 = arb6;
        _this.arb7 = arb7;
        _this.arb8 = arb8;
        _this.arb9 = arb9;
        _this.arb10 = arb10;
        _this.arb11 = arb11;
        _this.arb12 = arb12;
        _this.arb13 = arb13;
        _this.arb14 = arb14;
        _this.arb15 = arb15;
        _this.arb16 = arb16;
        _this.arb17 = arb17;
        _this.arb18 = arb18;
        _this.arb19 = arb19;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18, arb19]);
        return _this;
    }
    Tuple20Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple20Arbitrary.prototype.withBias = function (freq) {
        return new Tuple20Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq), this.arb4.withBias(freq), this.arb5.withBias(freq), this.arb6.withBias(freq), this.arb7.withBias(freq), this.arb8.withBias(freq), this.arb9.withBias(freq), this.arb10.withBias(freq), this.arb11.withBias(freq), this.arb12.withBias(freq), this.arb13.withBias(freq), this.arb14.withBias(freq), this.arb15.withBias(freq), this.arb16.withBias(freq), this.arb17.withBias(freq), this.arb18.withBias(freq), this.arb19.withBias(freq));
    };
    return Tuple20Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple20Arbitrary = Tuple20Arbitrary;
;
/** @hidden */
var Tuple21Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple21Arbitrary, _super);
    function Tuple21Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18, arb19, arb20) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.arb4 = arb4;
        _this.arb5 = arb5;
        _this.arb6 = arb6;
        _this.arb7 = arb7;
        _this.arb8 = arb8;
        _this.arb9 = arb9;
        _this.arb10 = arb10;
        _this.arb11 = arb11;
        _this.arb12 = arb12;
        _this.arb13 = arb13;
        _this.arb14 = arb14;
        _this.arb15 = arb15;
        _this.arb16 = arb16;
        _this.arb17 = arb17;
        _this.arb18 = arb18;
        _this.arb19 = arb19;
        _this.arb20 = arb20;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18, arb19, arb20]);
        return _this;
    }
    Tuple21Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple21Arbitrary.prototype.withBias = function (freq) {
        return new Tuple21Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq), this.arb4.withBias(freq), this.arb5.withBias(freq), this.arb6.withBias(freq), this.arb7.withBias(freq), this.arb8.withBias(freq), this.arb9.withBias(freq), this.arb10.withBias(freq), this.arb11.withBias(freq), this.arb12.withBias(freq), this.arb13.withBias(freq), this.arb14.withBias(freq), this.arb15.withBias(freq), this.arb16.withBias(freq), this.arb17.withBias(freq), this.arb18.withBias(freq), this.arb19.withBias(freq), this.arb20.withBias(freq));
    };
    return Tuple21Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple21Arbitrary = Tuple21Arbitrary;
;
/** @hidden */
var Tuple22Arbitrary = /** @class */ (function (_super) {
    __extends(Tuple22Arbitrary, _super);
    function Tuple22Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18, arb19, arb20, arb21) {
        var _this = _super.call(this) || this;
        _this.arb0 = arb0;
        _this.arb1 = arb1;
        _this.arb2 = arb2;
        _this.arb3 = arb3;
        _this.arb4 = arb4;
        _this.arb5 = arb5;
        _this.arb6 = arb6;
        _this.arb7 = arb7;
        _this.arb8 = arb8;
        _this.arb9 = arb9;
        _this.arb10 = arb10;
        _this.arb11 = arb11;
        _this.arb12 = arb12;
        _this.arb13 = arb13;
        _this.arb14 = arb14;
        _this.arb15 = arb15;
        _this.arb16 = arb16;
        _this.arb17 = arb17;
        _this.arb18 = arb18;
        _this.arb19 = arb19;
        _this.arb20 = arb20;
        _this.arb21 = arb21;
        _this.tupleArb = new TupleArbitrary_generic_1.GenericTupleArbitrary([arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18, arb19, arb20, arb21]);
        return _this;
    }
    Tuple22Arbitrary.prototype.generate = function (mrng) {
        return this.tupleArb.generate(mrng);
    };
    Tuple22Arbitrary.prototype.withBias = function (freq) {
        return new Tuple22Arbitrary(this.arb0.withBias(freq), this.arb1.withBias(freq), this.arb2.withBias(freq), this.arb3.withBias(freq), this.arb4.withBias(freq), this.arb5.withBias(freq), this.arb6.withBias(freq), this.arb7.withBias(freq), this.arb8.withBias(freq), this.arb9.withBias(freq), this.arb10.withBias(freq), this.arb11.withBias(freq), this.arb12.withBias(freq), this.arb13.withBias(freq), this.arb14.withBias(freq), this.arb15.withBias(freq), this.arb16.withBias(freq), this.arb17.withBias(freq), this.arb18.withBias(freq), this.arb19.withBias(freq), this.arb20.withBias(freq), this.arb21.withBias(freq));
    };
    return Tuple22Arbitrary;
}(Arbitrary_1["default"]));
exports.Tuple22Arbitrary = Tuple22Arbitrary;
;
/**
 * For tuples of [T0,T1,T2,T3,T4,T5,T6,T7,T8,T9,T10,T11,T12,T13,T14,T15,T16,T17,T18,T19,T20,T21]
 * @param arb0 Arbitrary responsible for T0
* @param arb1 Arbitrary responsible for T1
* @param arb2 Arbitrary responsible for T2
* @param arb3 Arbitrary responsible for T3
* @param arb4 Arbitrary responsible for T4
* @param arb5 Arbitrary responsible for T5
* @param arb6 Arbitrary responsible for T6
* @param arb7 Arbitrary responsible for T7
* @param arb8 Arbitrary responsible for T8
* @param arb9 Arbitrary responsible for T9
* @param arb10 Arbitrary responsible for T10
* @param arb11 Arbitrary responsible for T11
* @param arb12 Arbitrary responsible for T12
* @param arb13 Arbitrary responsible for T13
* @param arb14 Arbitrary responsible for T14
* @param arb15 Arbitrary responsible for T15
* @param arb16 Arbitrary responsible for T16
* @param arb17 Arbitrary responsible for T17
* @param arb18 Arbitrary responsible for T18
* @param arb19 Arbitrary responsible for T19
* @param arb20 Arbitrary responsible for T20
* @param arb21 Arbitrary responsible for T21
 */
function tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18, arb19, arb20, arb21) {
    if (arb21) {
        return new Tuple22Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18, arb19, arb20, arb21);
    }
    if (arb20) {
        return new Tuple21Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18, arb19, arb20);
    }
    if (arb19) {
        return new Tuple20Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18, arb19);
    }
    if (arb18) {
        return new Tuple19Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18);
    }
    if (arb17) {
        return new Tuple18Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17);
    }
    if (arb16) {
        return new Tuple17Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16);
    }
    if (arb15) {
        return new Tuple16Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15);
    }
    if (arb14) {
        return new Tuple15Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14);
    }
    if (arb13) {
        return new Tuple14Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13);
    }
    if (arb12) {
        return new Tuple13Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12);
    }
    if (arb11) {
        return new Tuple12Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11);
    }
    if (arb10) {
        return new Tuple11Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10);
    }
    if (arb9) {
        return new Tuple10Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9);
    }
    if (arb8) {
        return new Tuple9Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8);
    }
    if (arb7) {
        return new Tuple8Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7);
    }
    if (arb6) {
        return new Tuple7Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5, arb6);
    }
    if (arb5) {
        return new Tuple6Arbitrary(arb0, arb1, arb2, arb3, arb4, arb5);
    }
    if (arb4) {
        return new Tuple5Arbitrary(arb0, arb1, arb2, arb3, arb4);
    }
    if (arb3) {
        return new Tuple4Arbitrary(arb0, arb1, arb2, arb3);
    }
    if (arb2) {
        return new Tuple3Arbitrary(arb0, arb1, arb2);
    }
    if (arb1) {
        return new Tuple2Arbitrary(arb0, arb1);
    }
    if (arb0) {
        return new Tuple1Arbitrary(arb0);
    }
}
exports.tuple = tuple;

},{"./TupleArbitrary.generic":17,"./definition/Arbitrary":19}],17:[function(require,module,exports){
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
var Stream_1 = require("../../stream/Stream");
var Arbitrary_1 = require("./definition/Arbitrary");
var Shrinkable_1 = require("./definition/Shrinkable");
/** @hidden */
var GenericTupleArbitrary = /** @class */ (function (_super) {
    __extends(GenericTupleArbitrary, _super);
    function GenericTupleArbitrary(arbs) {
        var _this = _super.call(this) || this;
        _this.arbs = arbs;
        for (var idx = 0; idx !== arbs.length; ++idx) {
            var arb = arbs[idx];
            if (arb == null || arb.generate == null)
                throw new Error("Invalid parameter encountered at index " + idx + ": expecting an Arbitrary");
        }
        return _this;
    }
    GenericTupleArbitrary.wrapper = function (shrinkables) {
        return new Shrinkable_1["default"](shrinkables.map(function (s) { return s.value; }), function () {
            return GenericTupleArbitrary.shrinkImpl(shrinkables).map(GenericTupleArbitrary.wrapper);
        });
    };
    GenericTupleArbitrary.prototype.generate = function (mrng) {
        return GenericTupleArbitrary.wrapper(this.arbs.map(function (a) { return a.generate(mrng); }));
    };
    GenericTupleArbitrary.shrinkImpl = function (value) {
        // shrinking one by one is the not the most comprehensive
        // but allows a reasonable number of entries in the shrink
        var s = Stream_1.Stream.nil();
        var _loop_1 = function (idx) {
            s = s.join(value[idx].shrink().map(function (v) {
                return value
                    .slice(0, idx)
                    .concat([v])
                    .concat(value.slice(idx + 1));
            }));
        };
        for (var idx = 0; idx !== value.length; ++idx) {
            _loop_1(idx);
        }
        return s;
    };
    GenericTupleArbitrary.prototype.withBias = function (freq) {
        return new GenericTupleArbitrary(this.arbs.map(function (a) { return a.withBias(freq); }));
    };
    return GenericTupleArbitrary;
}(Arbitrary_1["default"]));
exports.GenericTupleArbitrary = GenericTupleArbitrary;
/**
 * For tuples produced by the provided `arbs`
 * @param arbs Ordered list of arbitraries
 */
function genericTuple(arbs) {
    return new GenericTupleArbitrary(arbs);
}
exports.genericTuple = genericTuple;

},{"../../stream/Stream":41,"./definition/Arbitrary":19,"./definition/Shrinkable":21}],18:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var TupleArbitrary_generated_1 = require("./TupleArbitrary.generated");
exports.tuple = TupleArbitrary_generated_1.tuple;
var TupleArbitrary_generic_1 = require("./TupleArbitrary.generic");
exports.genericTuple = TupleArbitrary_generic_1.genericTuple;

},{"./TupleArbitrary.generated":16,"./TupleArbitrary.generic":17}],19:[function(require,module,exports){
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

},{"./Shrinkable":21}],20:[function(require,module,exports){
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
var Arbitrary_1 = require("./Arbitrary");
var Shrinkable_1 = require("./Shrinkable");
/**
 * Abstract class able to generate and shrink values on type `T`
 */
var ArbitraryWithShrink = /** @class */ (function (_super) {
    __extends(ArbitraryWithShrink, _super);
    function ArbitraryWithShrink() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Build the Shrinkable associated to value
     *
     * @param value Value to shrink
     * @param shrunkOnce Indicate whether its the first shrink
     * @returns Shrinkable associated to value
     */
    ArbitraryWithShrink.prototype.shrinkableFor = function (value, shrunkOnce) {
        var _this = this;
        return new Shrinkable_1["default"](value, function () { return _this.shrink(value, shrunkOnce === true).map(function (v) { return _this.shrinkableFor(v, true); }); });
    };
    return ArbitraryWithShrink;
}(Arbitrary_1["default"]));
exports.ArbitraryWithShrink = ArbitraryWithShrink;

},{"./Arbitrary":19,"./Shrinkable":21}],21:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var Stream_1 = require("../../../stream/Stream");
/**
 * A Shrinkable<T> holds an internal value of type `T`
 * and can shrink it to smaller `T` values
 */
var Shrinkable = /** @class */ (function () {
    /**
     * @param value Internal value of the shrinkable
     * @param shrink Function producing Stream of shrinks associated to value
     */
    function Shrinkable(value, shrink) {
        if (shrink === void 0) { shrink = function () { return Stream_1["default"].nil(); }; }
        this.value = value;
        this.shrink = shrink;
    }
    /**
     * Create another shrinkable by mapping all values using the provided `mapper`
     * Both the original value and the shrunk ones are impacted
     *
     * @param mapper Map function, to produce a new element based on an old one
     * @returns New shrinkable with mapped elements
     */
    Shrinkable.prototype.map = function (mapper) {
        var _this = this;
        return new Shrinkable(mapper(this.value), function () { return _this.shrink().map(function (v) { return v.map(mapper); }); });
    };
    /**
     * Create another shrinkable
     * by filtering its shrunk values against `predicate`
     *
     * All the shrunk values produced by the resulting `Shrinkable<T>`
     * satisfy `predicate(value) == true`
     *
     * @param predicate Predicate, to test each produced element. Return true to keep the element, false otherwise
     * @returns New shrinkable filtered using predicate
     */
    Shrinkable.prototype.filter = function (predicate) {
        var _this = this;
        return new Shrinkable(this.value, function () {
            return _this.shrink()
                .filter(function (v) { return predicate(v.value); })
                .map(function (v) { return v.filter(predicate); });
        });
    };
    return Shrinkable;
}());
exports["default"] = Shrinkable;

},{"../../../stream/Stream":41}],22:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var TupleArbitrary_1 = require("../arbitrary/TupleArbitrary");
var AsyncProperty_generic_1 = require("./AsyncProperty.generic");
function asyncProperty(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18, arb19, arb20, arb21, arb22, arb23) {
    if (arb22) {
        var p_1 = arb22;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18, arb19, arb20, arb21), function (t) { return p_1(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15], t[16], t[17], t[18], t[19], t[20], t[21]); });
    }
    if (arb21) {
        var p_2 = arb21;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18, arb19, arb20), function (t) { return p_2(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15], t[16], t[17], t[18], t[19], t[20]); });
    }
    if (arb20) {
        var p_3 = arb20;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18, arb19), function (t) { return p_3(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15], t[16], t[17], t[18], t[19]); });
    }
    if (arb19) {
        var p_4 = arb19;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18), function (t) { return p_4(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15], t[16], t[17], t[18]); });
    }
    if (arb18) {
        var p_5 = arb18;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17), function (t) { return p_5(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15], t[16], t[17]); });
    }
    if (arb17) {
        var p_6 = arb17;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16), function (t) { return p_6(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15], t[16]); });
    }
    if (arb16) {
        var p_7 = arb16;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15), function (t) { return p_7(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15]); });
    }
    if (arb15) {
        var p_8 = arb15;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14), function (t) { return p_8(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14]); });
    }
    if (arb14) {
        var p_9 = arb14;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13), function (t) { return p_9(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13]); });
    }
    if (arb13) {
        var p_10 = arb13;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12), function (t) { return p_10(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12]); });
    }
    if (arb12) {
        var p_11 = arb12;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11), function (t) { return p_11(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11]); });
    }
    if (arb11) {
        var p_12 = arb11;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10), function (t) { return p_12(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10]); });
    }
    if (arb10) {
        var p_13 = arb10;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9), function (t) { return p_13(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9]); });
    }
    if (arb9) {
        var p_14 = arb9;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8), function (t) { return p_14(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8]); });
    }
    if (arb8) {
        var p_15 = arb8;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7), function (t) { return p_15(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7]); });
    }
    if (arb7) {
        var p_16 = arb7;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6), function (t) { return p_16(t[0], t[1], t[2], t[3], t[4], t[5], t[6]); });
    }
    if (arb6) {
        var p_17 = arb6;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5), function (t) { return p_17(t[0], t[1], t[2], t[3], t[4], t[5]); });
    }
    if (arb5) {
        var p_18 = arb5;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4), function (t) { return p_18(t[0], t[1], t[2], t[3], t[4]); });
    }
    if (arb4) {
        var p_19 = arb4;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3), function (t) { return p_19(t[0], t[1], t[2], t[3]); });
    }
    if (arb3) {
        var p_20 = arb3;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1, arb2), function (t) { return p_20(t[0], t[1], t[2]); });
    }
    if (arb2) {
        var p_21 = arb2;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0, arb1), function (t) { return p_21(t[0], t[1]); });
    }
    if (arb1) {
        var p_22 = arb1;
        return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.tuple(arb0), function (t) { return p_22(t[0]); });
    }
}
exports.asyncProperty = asyncProperty;

},{"../arbitrary/TupleArbitrary":18,"./AsyncProperty.generic":23}],23:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var IProperty_1 = require("./IProperty");
/**
 * Asynchronous property, see {@link IProperty}
 *
 * Prefer using {@link asyncProperty} instead
 */
var AsyncProperty = /** @class */ (function () {
    function AsyncProperty(arb, predicate) {
        this.arb = arb;
        this.predicate = predicate;
        this.isAsync = function () { return true; };
    }
    AsyncProperty.prototype.generate = function (mrng, runId) {
        return runId != null ? this.arb.withBias(IProperty_1.runIdToFrequency(runId)).generate(mrng) : this.arb.generate(mrng);
    };
    AsyncProperty.prototype.run = function (v) {
        return __awaiter(this, void 0, void 0, function () {
            var output, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.predicate(v)];
                    case 1:
                        output = _a.sent();
                        return [2 /*return*/, output == null || output === true ? null : 'Property failed by returning false'];
                    case 2:
                        err_1 = _a.sent();
                        if (err_1 instanceof Error && err_1.stack)
                            return [2 /*return*/, err_1 + "\n\nStack trace: " + err_1.stack];
                        return [2 /*return*/, "" + err_1];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AsyncProperty;
}());
exports.AsyncProperty = AsyncProperty;

},{"./IProperty":25}],24:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var AsyncProperty_generated_1 = require("./AsyncProperty.generated");
exports.asyncProperty = AsyncProperty_generated_1.asyncProperty;
var AsyncProperty_generic_1 = require("./AsyncProperty.generic");
exports.AsyncProperty = AsyncProperty_generic_1.AsyncProperty;

},{"./AsyncProperty.generated":22,"./AsyncProperty.generic":23}],25:[function(require,module,exports){
"use strict";
exports.__esModule = true;
/**
 * @hidden
 * Convert runId (IProperty) into a frequency (Arbitrary)
 *
 * @param runId Id of the run starting at 0
 * @returns Frequency of bias starting at 2
 */
exports.runIdToFrequency = function (runId) { return 2 + Math.floor(Math.log(runId + 1) / Math.log(100)); };

},{}],26:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var TupleArbitrary_1 = require("../arbitrary/TupleArbitrary");
var Property_generic_1 = require("./Property.generic");
function property(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18, arb19, arb20, arb21, arb22, arb23) {
    if (arb22) {
        var p_1 = arb22;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18, arb19, arb20, arb21), function (t) { return p_1(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15], t[16], t[17], t[18], t[19], t[20], t[21]); });
    }
    if (arb21) {
        var p_2 = arb21;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18, arb19, arb20), function (t) { return p_2(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15], t[16], t[17], t[18], t[19], t[20]); });
    }
    if (arb20) {
        var p_3 = arb20;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18, arb19), function (t) { return p_3(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15], t[16], t[17], t[18], t[19]); });
    }
    if (arb19) {
        var p_4 = arb19;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17, arb18), function (t) { return p_4(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15], t[16], t[17], t[18]); });
    }
    if (arb18) {
        var p_5 = arb18;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16, arb17), function (t) { return p_5(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15], t[16], t[17]); });
    }
    if (arb17) {
        var p_6 = arb17;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15, arb16), function (t) { return p_6(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15], t[16]); });
    }
    if (arb16) {
        var p_7 = arb16;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14, arb15), function (t) { return p_7(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15]); });
    }
    if (arb15) {
        var p_8 = arb15;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13, arb14), function (t) { return p_8(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14]); });
    }
    if (arb14) {
        var p_9 = arb14;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12, arb13), function (t) { return p_9(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13]); });
    }
    if (arb13) {
        var p_10 = arb13;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11, arb12), function (t) { return p_10(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12]); });
    }
    if (arb12) {
        var p_11 = arb12;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10, arb11), function (t) { return p_11(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11]); });
    }
    if (arb11) {
        var p_12 = arb11;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9, arb10), function (t) { return p_12(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10]); });
    }
    if (arb10) {
        var p_13 = arb10;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8, arb9), function (t) { return p_13(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9]); });
    }
    if (arb9) {
        var p_14 = arb9;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7, arb8), function (t) { return p_14(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8]); });
    }
    if (arb8) {
        var p_15 = arb8;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6, arb7), function (t) { return p_15(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7]); });
    }
    if (arb7) {
        var p_16 = arb7;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5, arb6), function (t) { return p_16(t[0], t[1], t[2], t[3], t[4], t[5], t[6]); });
    }
    if (arb6) {
        var p_17 = arb6;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4, arb5), function (t) { return p_17(t[0], t[1], t[2], t[3], t[4], t[5]); });
    }
    if (arb5) {
        var p_18 = arb5;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3, arb4), function (t) { return p_18(t[0], t[1], t[2], t[3], t[4]); });
    }
    if (arb4) {
        var p_19 = arb4;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2, arb3), function (t) { return p_19(t[0], t[1], t[2], t[3]); });
    }
    if (arb3) {
        var p_20 = arb3;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1, arb2), function (t) { return p_20(t[0], t[1], t[2]); });
    }
    if (arb2) {
        var p_21 = arb2;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0, arb1), function (t) { return p_21(t[0], t[1]); });
    }
    if (arb1) {
        var p_22 = arb1;
        return new Property_generic_1.Property(TupleArbitrary_1.tuple(arb0), function (t) { return p_22(t[0]); });
    }
}
exports.property = property;

},{"../arbitrary/TupleArbitrary":18,"./Property.generic":27}],27:[function(require,module,exports){
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

},{"./IProperty":25}],28:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var Property_generated_1 = require("./Property.generated");
exports.property = Property_generated_1.property;
var Property_generic_1 = require("./Property.generic");
exports.Property = Property_generic_1.Property;

},{"./Property.generated":26,"./Property.generic":27}],29:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
/** @hidden */
var timeoutAfter = function (timeMs) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                return setTimeout(function () {
                    resolve("Property timeout: exceeded limit of " + timeMs + " milliseconds");
                }, timeMs);
            })];
    });
}); };
/** @hidden */
var TimeoutProperty = /** @class */ (function () {
    function TimeoutProperty(property, timeMs) {
        this.property = property;
        this.timeMs = timeMs;
        this.isAsync = function () { return true; };
    }
    TimeoutProperty.prototype.generate = function (mrng, runId) {
        return this.property.generate(mrng, runId);
    };
    TimeoutProperty.prototype.run = function (v) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.race([this.property.run(v), timeoutAfter(this.timeMs)])];
            });
        });
    };
    return TimeoutProperty;
}());
exports.TimeoutProperty = TimeoutProperty;

},{}],30:[function(require,module,exports){
"use strict";
exports.__esModule = true;
/** @hidden */
var UnbiasedProperty = /** @class */ (function () {
    function UnbiasedProperty(property) {
        var _this = this;
        this.property = property;
        this.isAsync = function () { return _this.property.isAsync(); };
        this.generate = function (mrng, runId) { return _this.property.generate(mrng); };
        this.run = function (v) { return _this.property.run(v); };
    }
    return UnbiasedProperty;
}());
exports.UnbiasedProperty = UnbiasedProperty;

},{}],31:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var TimeoutProperty_1 = require("../property/TimeoutProperty");
var UnbiasedProperty_1 = require("../property/UnbiasedProperty");
var QualifiedParameters_1 = require("./configuration/QualifiedParameters");
var RunExecution_1 = require("./reporter/RunExecution");
var Tosser_1 = require("./Tosser");
var PathWalker_1 = require("./utils/PathWalker");
var utils_1 = require("./utils/utils");
/** @hidden */
function runIt(property, initialValues, verbose) {
    var runExecution = new RunExecution_1.RunExecution(verbose);
    var done = false;
    var values = initialValues;
    while (!done) {
        done = true;
        var idx = 0;
        try {
            for (var values_1 = __values(values), values_1_1 = values_1.next(); !values_1_1.done; values_1_1 = values_1.next()) {
                var v = values_1_1.value;
                var out = property.run(v.value);
                if (out != null) {
                    runExecution.fail(v.value, idx, out);
                    values = v.shrink();
                    done = false;
                    break;
                }
                ++idx;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (values_1_1 && !values_1_1.done && (_a = values_1["return"])) _a.call(values_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    return runExecution;
    var e_1, _a;
}
/** @hidden */
function asyncRunIt(property, initialValues, verbose) {
    return __awaiter(this, void 0, void 0, function () {
        var runExecution, done, values, idx, values_2, values_2_1, v, out, e_2_1, e_2, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    runExecution = new RunExecution_1.RunExecution(verbose);
                    done = false;
                    values = initialValues;
                    _b.label = 1;
                case 1:
                    if (!!done) return [3 /*break*/, 10];
                    done = true;
                    idx = 0;
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 7, 8, 9]);
                    values_2 = __values(values), values_2_1 = values_2.next();
                    _b.label = 3;
                case 3:
                    if (!!values_2_1.done) return [3 /*break*/, 6];
                    v = values_2_1.value;
                    return [4 /*yield*/, property.run(v.value)];
                case 4:
                    out = _b.sent();
                    if (out != null) {
                        runExecution.fail(v.value, idx, out);
                        values = v.shrink();
                        done = false;
                        return [3 /*break*/, 6];
                    }
                    ++idx;
                    _b.label = 5;
                case 5:
                    values_2_1 = values_2.next();
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 9];
                case 7:
                    e_2_1 = _b.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 9];
                case 8:
                    try {
                        if (values_2_1 && !values_2_1.done && (_a = values_2["return"])) _a.call(values_2);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 9: return [3 /*break*/, 1];
                case 10: return [2 /*return*/, runExecution];
            }
        });
    });
}
/** @hidden */
function decorateProperty(rawProperty, qParams) {
    var propA = rawProperty.isAsync() && qParams.timeout != null ? new TimeoutProperty_1.TimeoutProperty(rawProperty, qParams.timeout) : rawProperty;
    return qParams.unbiased === true ? new UnbiasedProperty_1.UnbiasedProperty(propA) : propA;
}
function check(rawProperty, params) {
    if (rawProperty == null || rawProperty.generate == null)
        throw new Error('Invalid property encountered, please use a valid property');
    if (rawProperty.run == null)
        throw new Error('Invalid property encountered, please use a valid property not an arbitrary');
    var qParams = QualifiedParameters_1.QualifiedParameters.read(params);
    var property = decorateProperty(rawProperty, qParams);
    var generator = Tosser_1.toss(property, qParams.seed);
    function g() {
        var idx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    idx = 0;
                    _a.label = 1;
                case 1:
                    if (!(idx < qParams.numRuns)) return [3 /*break*/, 4];
                    return [4 /*yield*/, generator.next().value()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    ++idx;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    }
    var initialValues = qParams.path.length === 0 ? g() : PathWalker_1.pathWalk(qParams.path, g());
    return property.isAsync()
        ? asyncRunIt(property, initialValues, qParams.verbose).then(function (e) {
            return e.toRunDetails(qParams.seed, qParams.path, qParams.numRuns);
        })
        : runIt(property, initialValues, qParams.verbose).toRunDetails(qParams.seed, qParams.path, qParams.numRuns);
}
exports.check = check;
function assert(property, params) {
    var out = check(property, params);
    if (property.isAsync())
        return out.then(utils_1.throwIfFailed);
    else
        utils_1.throwIfFailed(out);
}
exports.assert = assert;

},{"../property/TimeoutProperty":29,"../property/UnbiasedProperty":30,"./Tosser":33,"./configuration/QualifiedParameters":34,"./reporter/RunExecution":35,"./utils/PathWalker":36,"./utils/utils":37}],32:[function(require,module,exports){
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
var Stream_1 = require("../../stream/Stream");
var Property_1 = require("../property/Property");
var UnbiasedProperty_1 = require("../property/UnbiasedProperty");
var QualifiedParameters_1 = require("./configuration/QualifiedParameters");
var Tosser_1 = require("./Tosser");
var PathWalker_1 = require("./utils/PathWalker");
/** @hidden */
function toProperty(generator, qParams) {
    var prop = !generator.hasOwnProperty('isAsync')
        ? new Property_1.Property(generator, function () { return true; })
        : generator;
    return qParams.unbiased === true ? new UnbiasedProperty_1.UnbiasedProperty(prop) : prop;
}
/** @hidden */
function streamSample(generator, params) {
    var qParams = QualifiedParameters_1.QualifiedParameters.readOrNumRuns(params);
    var tossedValues = Stream_1.stream(Tosser_1["default"](toProperty(generator, qParams), qParams.seed));
    if (qParams.path.length === 0) {
        return tossedValues.take(qParams.numRuns).map(function (s) { return s().value; });
    }
    return Stream_1.stream(PathWalker_1.pathWalk(qParams.path, tossedValues.map(function (s) { return s(); })))
        .take(qParams.numRuns)
        .map(function (s) { return s.value; });
}
/**
 * Generate an array containing all the values that would have been generated during {@link assert} or {@link check}
 *
 * @example
 * ```typescript
 * fc.sample(fc.nat(), 10); // extract 10 values from fc.nat() Arbitrary
 * fc.sample(fc.nat(), {seed: 42}); // extract values from fc.nat() as if we were running fc.assert with seed=42
 * ```
 *
 * @param generator {@link IProperty} or {@link Arbitrary} to extract the values from
 * @param params Integer representing the number of values to generate or {@link Parameters} as in {@link assert}
 */
function sample(generator, params) {
    return __spread(streamSample(generator, params));
}
exports.sample = sample;
/**
 * Gather useful statistics concerning generated values
 *
 * Print the result in `console.log` or `params.logger` (if defined)
 *
 * @example
 * ```typescript
 * fc.statistics(
 *     fc.nat(999),
 *     v => v < 100 ? 'Less than 100' : 'More or equal to 100',
 *     {numRuns: 1000, logger: console.log});
 * // Classify 1000 values generated by fc.nat(999) into two categories:
 * // - Less than 100
 * // - More or equal to 100
 * // The output will be sent line by line to the logger
 * ```
 *
 * @param generator {@link IProperty} or {@link Arbitrary} to extract the values from
 * @param classify Classifier function that can classify the generated value in zero, one or more categories (with free labels)
 * @param params Integer representing the number of values to generate or {@link Parameters} as in {@link assert}
 */
function statistics(generator, classify, params) {
    var qParams = QualifiedParameters_1.QualifiedParameters.readOrNumRuns(params);
    var recorded = {};
    try {
        for (var _a = __values(streamSample(generator, params)), _b = _a.next(); !_b.done; _b = _a.next()) {
            var g = _b.value;
            var out = classify(g);
            var categories = Array.isArray(out) ? out : [out];
            try {
                for (var categories_1 = __values(categories), categories_1_1 = categories_1.next(); !categories_1_1.done; categories_1_1 = categories_1.next()) {
                    var c = categories_1_1.value;
                    recorded[c] = (recorded[c] || 0) + 1;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (categories_1_1 && !categories_1_1.done && (_c = categories_1["return"])) _c.call(categories_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_b && !_b.done && (_d = _a["return"])) _d.call(_a);
        }
        finally { if (e_2) throw e_2.error; }
    }
    var data = Object.entries(recorded)
        .sort(function (a, b) { return b[1] - a[1]; })
        .map(function (i) { return [i[0], (i[1] * 100.0 / qParams.numRuns).toFixed(2) + "%"]; });
    var longestName = data.map(function (i) { return i[0].length; }).reduce(function (p, c) { return Math.max(p, c); }, 0);
    var longestPercent = data.map(function (i) { return i[1].length; }).reduce(function (p, c) { return Math.max(p, c); }, 0);
    try {
        for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
            var item = data_1_1.value;
            qParams.logger(item[0].padEnd(longestName, '.') + ".." + item[1].padStart(longestPercent, '.'));
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (data_1_1 && !data_1_1.done && (_e = data_1["return"])) _e.call(data_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    var e_2, _d, e_1, _c, e_3, _e;
}
exports.statistics = statistics;

},{"../../stream/Stream":41,"../property/Property":28,"../property/UnbiasedProperty":30,"./Tosser":33,"./configuration/QualifiedParameters":34,"./utils/PathWalker":36}],33:[function(require,module,exports){
"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var prand = require("pure-rand");
var Random_1 = require("../../random/generator/Random");
/** @hidden */
function lazyGenerate(generator, rng, idx) {
    return function () { return generator.generate(new Random_1["default"](rng), idx); };
}
/** @hidden */
function toss(generator, seed) {
    var idx, rng;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                idx = 0;
                rng = prand.mersenne(seed);
                _a.label = 1;
            case 1:
                rng = prand.skipN(rng, 42);
                return [4 /*yield*/, lazyGenerate(generator, rng, idx++)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}
exports["default"] = toss;
exports.toss = toss;

},{"../../random/generator/Random":40,"pure-rand":390}],34:[function(require,module,exports){
"use strict";
exports.__esModule = true;
/**
 * @hidden
 *
 * Configuration extracted from incoming Parameters
 *
 * It handles and set the default settings that will be used by runners.
 */
var QualifiedParameters = /** @class */ (function () {
    function QualifiedParameters() {
    }
    /**
     * Extract a runner configuration from Parameters
     * @param p Incoming Parameters
     */
    QualifiedParameters.read = function (p) {
        return {
            seed: QualifiedParameters.readSeed(p),
            numRuns: QualifiedParameters.readNumRuns(p),
            timeout: QualifiedParameters.readTimeout(p),
            logger: QualifiedParameters.readLogger(p),
            path: QualifiedParameters.readPath(p),
            unbiased: QualifiedParameters.readUnbiased(p),
            verbose: QualifiedParameters.readVerbose(p)
        };
    };
    /**
     * Extract a runner configuration from Parameters
     * or build one based on a maximal number of runs
     *
     * @param p Incoming Parameters or maximal number of runs
     */
    QualifiedParameters.readOrNumRuns = function (p) {
        if (p == null)
            return QualifiedParameters.read();
        if (typeof p === 'number')
            return QualifiedParameters.read({ numRuns: p });
        return QualifiedParameters.read(p);
    };
    QualifiedParameters.readSeed = function (p) { return (p != null && p.seed != null ? p.seed : Date.now()); };
    QualifiedParameters.readNumRuns = function (p) {
        var defaultValue = 100;
        if (p == null)
            return defaultValue;
        if (p.numRuns != null)
            return p.numRuns;
        if (p.num_runs != null)
            return p.num_runs;
        return defaultValue;
    };
    QualifiedParameters.readTimeout = function (p) { return (p != null && p.timeout != null ? p.timeout : null); };
    QualifiedParameters.readPath = function (p) { return (p != null && p.path != null ? p.path : ''); };
    QualifiedParameters.readUnbiased = function (p) { return p != null && p.unbiased === true; };
    QualifiedParameters.readVerbose = function (p) { return p != null && p.verbose === true; };
    QualifiedParameters.readLogger = function (p) {
        if (p != null && p.logger != null)
            return p.logger;
        return function (v) {
            // tslint:disable-next-line:no-console
            console.log(v);
        };
    };
    return QualifiedParameters;
}());
exports.QualifiedParameters = QualifiedParameters;

},{}],35:[function(require,module,exports){
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
/**
 * @hidden
 *
 * Report the status of a run
 *
 * It receives notification from the runner in case of failures
 */
var RunExecution = /** @class */ (function () {
    function RunExecution(storeFailures) {
        var _this = this;
        this.storeFailures = storeFailures;
        this.isSuccess = function () { return _this.pathToFailure == null; };
        this.firstFailure = function () { return (_this.pathToFailure ? +_this.pathToFailure.split(':')[0] : -1); };
        this.numShrinks = function () { return (_this.pathToFailure ? _this.pathToFailure.split(':').length - 1 : 0); };
        this.allFailures = [];
    }
    RunExecution.prototype.fail = function (value, id, message) {
        if (this.storeFailures)
            this.allFailures.push(value);
        if (this.pathToFailure == null)
            this.pathToFailure = "" + id;
        else
            this.pathToFailure += ":" + id;
        this.value = value;
        this.failure = message;
    };
    RunExecution.prototype.toRunDetails = function (seed, basePath, numRuns) {
        return this.isSuccess()
            ? {
                failed: false,
                numRuns: numRuns,
                numShrinks: 0,
                seed: seed,
                counterexample: null,
                counterexamplePath: null,
                error: null,
                failures: []
            }
            : {
                failed: true,
                numRuns: this.firstFailure() + 1,
                numShrinks: this.numShrinks(),
                seed: seed,
                counterexample: this.value,
                counterexamplePath: RunExecution.mergePaths(basePath, this.pathToFailure),
                error: this.failure,
                failures: this.allFailures
            };
    };
    RunExecution.mergePaths = function (offsetPath, path) {
        if (offsetPath.length === 0)
            return path;
        var offsetItems = offsetPath.split(':');
        var remainingItems = path.split(':');
        var middle = +offsetItems[offsetItems.length - 1] + +remainingItems[0];
        return __spread(offsetItems.slice(0, offsetItems.length - 1), ["" + middle], remainingItems.slice(1)).join(':');
    };
    return RunExecution;
}());
exports.RunExecution = RunExecution;

},{}],36:[function(require,module,exports){
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

},{"../../../stream/Stream":41}],37:[function(require,module,exports){
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

},{}],38:[function(require,module,exports){
"use strict";
exports.__esModule = true;
require("core-js");
var AsyncProperty_1 = require("./check/property/AsyncProperty");
exports.asyncProperty = AsyncProperty_1.asyncProperty;
var Property_1 = require("./check/property/Property");
exports.property = Property_1.property;
var Runner_1 = require("./check/runner/Runner");
exports.assert = Runner_1.assert;
exports.check = Runner_1.check;
var Sampler_1 = require("./check/runner/Sampler");
exports.sample = Sampler_1.sample;
exports.statistics = Sampler_1.statistics;
var ArrayArbitrary_1 = require("./check/arbitrary/ArrayArbitrary");
exports.array = ArrayArbitrary_1.array;
var BooleanArbitrary_1 = require("./check/arbitrary/BooleanArbitrary");
exports.boolean = BooleanArbitrary_1.boolean;
var CharacterArbitrary_1 = require("./check/arbitrary/CharacterArbitrary");
exports.ascii = CharacterArbitrary_1.ascii;
exports.base64 = CharacterArbitrary_1.base64;
exports.char = CharacterArbitrary_1.char;
exports.char16bits = CharacterArbitrary_1.char16bits;
exports.fullUnicode = CharacterArbitrary_1.fullUnicode;
exports.hexa = CharacterArbitrary_1.hexa;
exports.unicode = CharacterArbitrary_1.unicode;
var ConstantArbitrary_1 = require("./check/arbitrary/ConstantArbitrary");
exports.constant = ConstantArbitrary_1.constant;
exports.constantFrom = ConstantArbitrary_1.constantFrom;
var Arbitrary_1 = require("./check/arbitrary/definition/Arbitrary");
exports.Arbitrary = Arbitrary_1["default"];
var Shrinkable_1 = require("./check/arbitrary/definition/Shrinkable");
exports.Shrinkable = Shrinkable_1["default"];
var DictionaryArbitrary_1 = require("./check/arbitrary/DictionaryArbitrary");
exports.dictionary = DictionaryArbitrary_1.dictionary;
var FloatingPointArbitrary_1 = require("./check/arbitrary/FloatingPointArbitrary");
exports.double = FloatingPointArbitrary_1.double;
exports.float = FloatingPointArbitrary_1.float;
var FrequencyArbitrary_1 = require("./check/arbitrary/FrequencyArbitrary");
exports.frequency = FrequencyArbitrary_1.frequency;
var IntegerArbitrary_1 = require("./check/arbitrary/IntegerArbitrary");
exports.integer = IntegerArbitrary_1.integer;
exports.nat = IntegerArbitrary_1.nat;
var LoremArbitrary_1 = require("./check/arbitrary/LoremArbitrary");
exports.lorem = LoremArbitrary_1.lorem;
var ObjectArbitrary_1 = require("./check/arbitrary/ObjectArbitrary");
exports.anything = ObjectArbitrary_1.anything;
exports.json = ObjectArbitrary_1.json;
exports.object = ObjectArbitrary_1.object;
exports.ObjectConstraints = ObjectArbitrary_1.ObjectConstraints;
exports.unicodeJson = ObjectArbitrary_1.unicodeJson;
var OneOfArbitrary_1 = require("./check/arbitrary/OneOfArbitrary");
exports.oneof = OneOfArbitrary_1.oneof;
var OptionArbitrary_1 = require("./check/arbitrary/OptionArbitrary");
exports.option = OptionArbitrary_1.option;
var RecordArbitrary_1 = require("./check/arbitrary/RecordArbitrary");
exports.record = RecordArbitrary_1.record;
var SetArbitrary_1 = require("./check/arbitrary/SetArbitrary");
exports.set = SetArbitrary_1.set;
var StringArbitrary_1 = require("./check/arbitrary/StringArbitrary");
exports.asciiString = StringArbitrary_1.asciiString;
exports.base64String = StringArbitrary_1.base64String;
exports.fullUnicodeString = StringArbitrary_1.fullUnicodeString;
exports.hexaString = StringArbitrary_1.hexaString;
exports.string = StringArbitrary_1.string;
exports.string16bits = StringArbitrary_1.string16bits;
exports.stringOf = StringArbitrary_1.stringOf;
exports.unicodeString = StringArbitrary_1.unicodeString;
var TupleArbitrary_1 = require("./check/arbitrary/TupleArbitrary");
exports.genericTuple = TupleArbitrary_1.genericTuple;
exports.tuple = TupleArbitrary_1.tuple;
var Random_1 = require("./random/generator/Random");
exports.Random = Random_1.Random;
var Stream_1 = require("./stream/Stream");
exports.Stream = Stream_1.Stream;
exports.stream = Stream_1.stream;

},{"./check/arbitrary/ArrayArbitrary":1,"./check/arbitrary/BooleanArbitrary":2,"./check/arbitrary/CharacterArbitrary":3,"./check/arbitrary/ConstantArbitrary":4,"./check/arbitrary/DictionaryArbitrary":5,"./check/arbitrary/FloatingPointArbitrary":6,"./check/arbitrary/FrequencyArbitrary":7,"./check/arbitrary/IntegerArbitrary":8,"./check/arbitrary/LoremArbitrary":9,"./check/arbitrary/ObjectArbitrary":10,"./check/arbitrary/OneOfArbitrary":11,"./check/arbitrary/OptionArbitrary":12,"./check/arbitrary/RecordArbitrary":13,"./check/arbitrary/SetArbitrary":14,"./check/arbitrary/StringArbitrary":15,"./check/arbitrary/TupleArbitrary":18,"./check/arbitrary/definition/Arbitrary":19,"./check/arbitrary/definition/Shrinkable":21,"./check/property/AsyncProperty":24,"./check/property/Property":28,"./check/runner/Runner":31,"./check/runner/Sampler":32,"./random/generator/Random":40,"./stream/Stream":41,"core-js":42}],39:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
exports.__esModule = true;
var fc = require("./fast-check-default");
exports["default"] = fc;
__export(require("./fast-check-default"));

},{"./fast-check-default":38}],40:[function(require,module,exports){
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
exports.__esModule = true;
var prand = require("pure-rand");
var Random = /** @class */ (function () {
    /**
     * Create a mutable random number generator
     * @param internalRng Immutable random generator from pure-rand library
     */
    function Random(internalRng) {
        this.internalRng = internalRng;
    }
    /**
     * Clone the random number generator
     */
    Random.prototype.clone = function () {
        return new Random(this.internalRng);
    };
    Random.prototype.uniformIn = function (rangeMin, rangeMax) {
        var _a = __read(prand.uniformIntDistribution(rangeMin, rangeMax)(this.internalRng), 2), v = _a[0], nrng = _a[1];
        this.internalRng = nrng;
        return v;
    };
    /**
     * Generate an integer having `bits` random bits
     * @param bits Number of bits to generate
     */
    Random.prototype.next = function (bits) {
        return this.uniformIn(0, (1 << bits) - 1);
    };
    /**
     * Generate a random boolean
     */
    Random.prototype.nextBoolean = function () {
        return this.uniformIn(0, 1) === 1;
    };
    Random.prototype.nextInt = function (min, max) {
        return this.uniformIn(min == null ? Random.MIN_INT : min, max == null ? Random.MAX_INT : max);
    };
    /**
     * Generate a random floating point number between 0.0 (included) and 1.0 (excluded)
     */
    Random.prototype.nextDouble = function () {
        var a = this.next(26);
        var b = this.next(27);
        return (a * Random.DBL_FACTOR + b) * Random.DBL_DIVISOR;
    };
    Random.MIN_INT = 0x80000000 | 0;
    Random.MAX_INT = 0x7fffffff | 0;
    Random.DBL_FACTOR = Math.pow(2, 27);
    Random.DBL_DIVISOR = Math.pow(2, -53);
    return Random;
}());
exports.Random = Random;
exports["default"] = Random;

},{"pure-rand":390}],41:[function(require,module,exports){
"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var Stream = /** @class */ (function () {
    // /*DEBUG*/ // no double iteration
    // /*DEBUG*/ private isLive: boolean;
    /**
     * Create a Stream based on `g`
     * @param g Underlying data of the Stream
     */
    function Stream(g) {
        this.g = g;
        // /*DEBUG*/ this.isLive = true;
    }
    /**
     * Create an empty stream of T
     */
    Stream.nil = function () {
        function g() {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        }
        return new Stream(g());
    };
    // /*DEBUG*/ private closeCurrentStream() {
    // /*DEBUG*/   if (! this.isLive) throw new Error('Stream has already been closed');
    // /*DEBUG*/   this.isLive = false;
    // /*DEBUG*/ }
    Stream.prototype.next = function () {
        return this.g.next();
    };
    Stream.prototype[Symbol.iterator] = function () {
        // /*DEBUG*/ this.closeCurrentStream();
        return this.g;
    };
    /**
     * Map all elements of the Stream using `f`
     *
     * WARNING: It closes the current stream
     *
     * @param f Mapper function
     */
    Stream.prototype.map = function (f) {
        function helper(v) {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, f(v)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }
        return this.flatMap(helper);
    };
    /**
     * Flat map all elements of the Stream using `f`
     *
     * WARNING: It closes the current stream
     *
     * @param f Mapper function
     */
    Stream.prototype.flatMap = function (f) {
        // /*DEBUG*/ this.closeCurrentStream();
        function helper(g) {
            var g_1, g_1_1, v, e_1_1, e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, 6, 7]);
                        g_1 = __values(g), g_1_1 = g_1.next();
                        _b.label = 1;
                    case 1:
                        if (!!g_1_1.done) return [3 /*break*/, 4];
                        v = g_1_1.value;
                        return [5 /*yield**/, __values(f(v))];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        g_1_1 = g_1.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (g_1_1 && !g_1_1.done && (_a = g_1["return"])) _a.call(g_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }
        return new Stream(helper(this.g));
    };
    /**
     * Drop elements from the Stream while `f(element) === true`
     *
     * WARNING: It closes the current stream
     *
     * @param f Drop condition
     */
    Stream.prototype.dropWhile = function (f) {
        var foundEligible = false;
        function helper(v) {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(foundEligible || !f(v))) return [3 /*break*/, 2];
                        foundEligible = true;
                        return [4 /*yield*/, v];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }
        return this.flatMap(helper);
    };
    /**
     * Drop `n` first elements of the Stream
     *
     * WARNING: It closes the current stream
     *
     * @param n Number of elements to drop
     */
    Stream.prototype.drop = function (n) {
        var idx = 0;
        function helper(v) {
            return idx++ < n;
        }
        return this.dropWhile(helper);
    };
    /**
     * Take elements from the Stream while `f(element) === true`
     *
     * WARNING: It closes the current stream
     *
     * @param f Take condition
     */
    Stream.prototype.takeWhile = function (f) {
        // /*DEBUG*/ this.closeCurrentStream();
        function helper(g) {
            var cur;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cur = g.next();
                        _a.label = 1;
                    case 1:
                        if (!(!cur.done && f(cur.value))) return [3 /*break*/, 3];
                        return [4 /*yield*/, cur.value];
                    case 2:
                        _a.sent();
                        cur = g.next();
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/];
                }
            });
        }
        return new Stream(helper(this.g));
    };
    /**
     * Take `n` first elements of the Stream
     *
     * WARNING: It closes the current stream
     *
     * @param n Number of elements to take
     */
    Stream.prototype.take = function (n) {
        var idx = 0;
        function helper(v) {
            return idx++ < n;
        }
        return this.takeWhile(helper);
    };
    /**
     * Filter elements of the Stream
     *
     * WARNING: It closes the current stream
     *
     * @param f Elements to keep
     */
    Stream.prototype.filter = function (f) {
        function helper(v) {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!f(v)) return [3 /*break*/, 2];
                        return [4 /*yield*/, v];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }
        return this.flatMap(helper);
    };
    /**
     * Check whether all elements of the Stream are successful for `f`
     *
     * WARNING: It closes the current stream
     *
     * @param f Condition to check
     */
    Stream.prototype.every = function (f) {
        try {
            // /*DEBUG*/ this.closeCurrentStream();
            for (var _a = __values(this.g), _b = _a.next(); !_b.done; _b = _a.next()) {
                var v = _b.value;
                if (!f(v)) {
                    return false;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a["return"])) _c.call(_a);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return true;
        var e_2, _c;
    };
    /**
     * Check whether one of the elements of the Stream is successful for `f`
     *
     * WARNING: It closes the current stream
     *
     * @param f Condition to check
     */
    Stream.prototype.has = function (f) {
        try {
            // /*DEBUG*/ this.closeCurrentStream();
            for (var _a = __values(this.g), _b = _a.next(); !_b.done; _b = _a.next()) {
                var v = _b.value;
                if (f(v)) {
                    return [true, v];
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a["return"])) _c.call(_a);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return [false, null];
        var e_3, _c;
    };
    /**
     * Join `others` Stream to the current Stream
     *
     * WARNING: It closes the current stream and the other ones (as soon as it iterates over them)
     *
     * @param others Streams to join to the current Stream
     */
    Stream.prototype.join = function () {
        var others = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            others[_i] = arguments[_i];
        }
        function helper(c) {
            var others_1, others_1_1, s, e_4_1, e_4, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [5 /*yield**/, __values(c)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, 8, 9]);
                        others_1 = __values(others), others_1_1 = others_1.next();
                        _b.label = 3;
                    case 3:
                        if (!!others_1_1.done) return [3 /*break*/, 6];
                        s = others_1_1.value;
                        return [5 /*yield**/, __values(s)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        others_1_1 = others_1.next();
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        e_4_1 = _b.sent();
                        e_4 = { error: e_4_1 };
                        return [3 /*break*/, 9];
                    case 8:
                        try {
                            if (others_1_1 && !others_1_1.done && (_a = others_1["return"])) _a.call(others_1);
                        }
                        finally { if (e_4) throw e_4.error; }
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        }
        return new Stream(helper(this));
    };
    /**
     * Take the `nth` element of the Stream of the last (if it does not exist)
     *
     * WARNING: It closes the current stream
     *
     * @param nth Position of the element to extract
     */
    Stream.prototype.getNthOrLast = function (nth) {
        // /*DEBUG*/ this.closeCurrentStream();
        var remaining = nth;
        var last = null;
        try {
            for (var _a = __values(this.g), _b = _a.next(); !_b.done; _b = _a.next()) {
                var v = _b.value;
                if (remaining-- === 0)
                    return v;
                last = v;
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a["return"])) _c.call(_a);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return last;
        var e_5, _c;
    };
    return Stream;
}());
exports.Stream = Stream;
exports["default"] = Stream;
/**
 * Create a Stream based on `g`
 * @param g Underlying data of the Stream
 */
function stream(g) {
    return new Stream(g);
}
exports.stream = stream;

},{}],42:[function(require,module,exports){
require('./shim');
require('./modules/core.dict');
require('./modules/core.get-iterator-method');
require('./modules/core.get-iterator');
require('./modules/core.is-iterable');
require('./modules/core.delay');
require('./modules/core.function.part');
require('./modules/core.object.is-object');
require('./modules/core.object.classof');
require('./modules/core.object.define');
require('./modules/core.object.make');
require('./modules/core.number.iterator');
require('./modules/core.regexp.escape');
require('./modules/core.string.escape-html');
require('./modules/core.string.unescape-html');
module.exports = require('./modules/_core');

},{"./modules/_core":63,"./modules/core.delay":171,"./modules/core.dict":172,"./modules/core.function.part":173,"./modules/core.get-iterator":175,"./modules/core.get-iterator-method":174,"./modules/core.is-iterable":176,"./modules/core.number.iterator":177,"./modules/core.object.classof":178,"./modules/core.object.define":179,"./modules/core.object.is-object":180,"./modules/core.object.make":181,"./modules/core.regexp.escape":182,"./modules/core.string.escape-html":183,"./modules/core.string.unescape-html":184,"./shim":381}],43:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],44:[function(require,module,exports){
var cof = require('./_cof');
module.exports = function (it, msg) {
  if (typeof it != 'number' && cof(it) != 'Number') throw TypeError(msg);
  return +it;
};

},{"./_cof":58}],45:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};

},{"./_hide":82,"./_wks":170}],46:[function(require,module,exports){
module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};

},{}],47:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":91}],48:[function(require,module,exports){
// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
'use strict';
var toObject = require('./_to-object');
var toAbsoluteIndex = require('./_to-absolute-index');
var toLength = require('./_to-length');

module.exports = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
  var O = toObject(this);
  var len = toLength(O.length);
  var to = toAbsoluteIndex(target, len);
  var from = toAbsoluteIndex(start, len);
  var end = arguments.length > 2 ? arguments[2] : undefined;
  var count = Math.min((end === undefined ? len : toAbsoluteIndex(end, len)) - from, len - to);
  var inc = 1;
  if (from < to && to < from + count) {
    inc = -1;
    from += count - 1;
    to += count - 1;
  }
  while (count-- > 0) {
    if (from in O) O[to] = O[from];
    else delete O[to];
    to += inc;
    from += inc;
  } return O;
};

},{"./_to-absolute-index":155,"./_to-length":159,"./_to-object":160}],49:[function(require,module,exports){
// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
'use strict';
var toObject = require('./_to-object');
var toAbsoluteIndex = require('./_to-absolute-index');
var toLength = require('./_to-length');
module.exports = function fill(value /* , start = 0, end = @length */) {
  var O = toObject(this);
  var length = toLength(O.length);
  var aLen = arguments.length;
  var index = toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);
  var end = aLen > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
  while (endPos > index) O[index++] = value;
  return O;
};

},{"./_to-absolute-index":155,"./_to-length":159,"./_to-object":160}],50:[function(require,module,exports){
var forOf = require('./_for-of');

module.exports = function (iter, ITERATOR) {
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

},{"./_for-of":79}],51:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');
var toAbsoluteIndex = require('./_to-absolute-index');
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"./_to-absolute-index":155,"./_to-iobject":158,"./_to-length":159}],52:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx = require('./_ctx');
var IObject = require('./_iobject');
var toObject = require('./_to-object');
var toLength = require('./_to-length');
var asc = require('./_array-species-create');
module.exports = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || asc;
  return function ($this, callbackfn, that) {
    var O = toObject($this);
    var self = IObject(O);
    var f = ctx(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};

},{"./_array-species-create":55,"./_ctx":65,"./_iobject":87,"./_to-length":159,"./_to-object":160}],53:[function(require,module,exports){
var aFunction = require('./_a-function');
var toObject = require('./_to-object');
var IObject = require('./_iobject');
var toLength = require('./_to-length');

module.exports = function (that, callbackfn, aLen, memo, isRight) {
  aFunction(callbackfn);
  var O = toObject(that);
  var self = IObject(O);
  var length = toLength(O.length);
  var index = isRight ? length - 1 : 0;
  var i = isRight ? -1 : 1;
  if (aLen < 2) for (;;) {
    if (index in self) {
      memo = self[index];
      index += i;
      break;
    }
    index += i;
    if (isRight ? index < 0 : length <= index) {
      throw TypeError('Reduce of empty array with no initial value');
    }
  }
  for (;isRight ? index >= 0 : length > index; index += i) if (index in self) {
    memo = callbackfn(memo, self[index], index, O);
  }
  return memo;
};

},{"./_a-function":43,"./_iobject":87,"./_to-length":159,"./_to-object":160}],54:[function(require,module,exports){
var isObject = require('./_is-object');
var isArray = require('./_is-array');
var SPECIES = require('./_wks')('species');

module.exports = function (original) {
  var C;
  if (isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};

},{"./_is-array":89,"./_is-object":91,"./_wks":170}],55:[function(require,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = require('./_array-species-constructor');

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};

},{"./_array-species-constructor":54}],56:[function(require,module,exports){
'use strict';
var aFunction = require('./_a-function');
var isObject = require('./_is-object');
var invoke = require('./_invoke');
var arraySlice = [].slice;
var factories = {};

var construct = function (F, len, args) {
  if (!(len in factories)) {
    for (var n = [], i = 0; i < len; i++) n[i] = 'a[' + i + ']';
    // eslint-disable-next-line no-new-func
    factories[len] = Function('F,a', 'return new F(' + n.join(',') + ')');
  } return factories[len](F, args);
};

module.exports = Function.bind || function bind(that /* , ...args */) {
  var fn = aFunction(this);
  var partArgs = arraySlice.call(arguments, 1);
  var bound = function (/* args... */) {
    var args = partArgs.concat(arraySlice.call(arguments));
    return this instanceof bound ? construct(fn, args.length, args) : invoke(fn, args, that);
  };
  if (isObject(fn.prototype)) bound.prototype = fn.prototype;
  return bound;
};

},{"./_a-function":43,"./_invoke":86,"./_is-object":91}],57:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof');
var TAG = require('./_wks')('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

},{"./_cof":58,"./_wks":170}],58:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],59:[function(require,module,exports){
'use strict';
var dP = require('./_object-dp').f;
var create = require('./_object-create');
var redefineAll = require('./_redefine-all');
var ctx = require('./_ctx');
var anInstance = require('./_an-instance');
var forOf = require('./_for-of');
var $iterDefine = require('./_iter-define');
var step = require('./_iter-step');
var setSpecies = require('./_set-species');
var DESCRIPTORS = require('./_descriptors');
var fastKey = require('./_meta').fastKey;
var validate = require('./_validate-collection');
var SIZE = DESCRIPTORS ? '_s' : 'size';

var getEntry = function (that, key) {
  // fast case
  var index = fastKey(key);
  var entry;
  if (index !== 'F') return that._i[index];
  // frozen object case
  for (entry = that._f; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
};

module.exports = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, NAME, '_i');
      that._t = NAME;         // collection type
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = validate(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function (key) {
        var that = validate(this, NAME);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.n;
          var prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that._f == entry) that._f = next;
          if (that._l == entry) that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        validate(this, NAME);
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.n : this._f) {
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while (entry && entry.r) entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(validate(this, NAME), key);
      }
    });
    if (DESCRIPTORS) dP(C.prototype, 'size', {
      get: function () {
        return validate(this, NAME)[SIZE];
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var entry = getEntry(that, key);
    var prev, index;
    // change existing entry
    if (entry) {
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if (!that._f) that._f = entry;
      if (prev) prev.n = entry;
      that[SIZE]++;
      // add to index
      if (index !== 'F') that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function (C, NAME, IS_MAP) {
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function (iterated, kind) {
      this._t = validate(iterated, NAME); // target
      this._k = kind;                     // kind
      this._l = undefined;                // previous
    }, function () {
      var that = this;
      var kind = that._k;
      var entry = that._l;
      // revert to the last existing entry
      while (entry && entry.r) entry = entry.p;
      // get next entry
      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if (kind == 'keys') return step(0, entry.k);
      if (kind == 'values') return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};

},{"./_an-instance":46,"./_ctx":65,"./_descriptors":69,"./_for-of":79,"./_iter-define":95,"./_iter-step":97,"./_meta":106,"./_object-create":111,"./_object-dp":113,"./_redefine-all":134,"./_set-species":141,"./_validate-collection":167}],60:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = require('./_classof');
var from = require('./_array-from-iterable');
module.exports = function (NAME) {
  return function toJSON() {
    if (classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};

},{"./_array-from-iterable":50,"./_classof":57}],61:[function(require,module,exports){
'use strict';
var redefineAll = require('./_redefine-all');
var getWeak = require('./_meta').getWeak;
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var anInstance = require('./_an-instance');
var forOf = require('./_for-of');
var createArrayMethod = require('./_array-methods');
var $has = require('./_has');
var validate = require('./_validate-collection');
var arrayFind = createArrayMethod(5);
var arrayFindIndex = createArrayMethod(6);
var id = 0;

// fallback for uncaught frozen keys
var uncaughtFrozenStore = function (that) {
  return that._l || (that._l = new UncaughtFrozenStore());
};
var UncaughtFrozenStore = function () {
  this.a = [];
};
var findUncaughtFrozen = function (store, key) {
  return arrayFind(store.a, function (it) {
    return it[0] === key;
  });
};
UncaughtFrozenStore.prototype = {
  get: function (key) {
    var entry = findUncaughtFrozen(this, key);
    if (entry) return entry[1];
  },
  has: function (key) {
    return !!findUncaughtFrozen(this, key);
  },
  set: function (key, value) {
    var entry = findUncaughtFrozen(this, key);
    if (entry) entry[1] = value;
    else this.a.push([key, value]);
  },
  'delete': function (key) {
    var index = arrayFindIndex(this.a, function (it) {
      return it[0] === key;
    });
    if (~index) this.a.splice(index, 1);
    return !!~index;
  }
};

module.exports = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, NAME, '_i');
      that._t = NAME;      // collection type
      that._i = id++;      // collection id
      that._l = undefined; // leak store for uncaught frozen objects
      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function (key) {
        if (!isObject(key)) return false;
        var data = getWeak(key);
        if (data === true) return uncaughtFrozenStore(validate(this, NAME))['delete'](key);
        return data && $has(data, this._i) && delete data[this._i];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key) {
        if (!isObject(key)) return false;
        var data = getWeak(key);
        if (data === true) return uncaughtFrozenStore(validate(this, NAME)).has(key);
        return data && $has(data, this._i);
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var data = getWeak(anObject(key), true);
    if (data === true) uncaughtFrozenStore(that).set(key, value);
    else data[that._i] = value;
    return that;
  },
  ufstore: uncaughtFrozenStore
};

},{"./_an-instance":46,"./_an-object":47,"./_array-methods":52,"./_for-of":79,"./_has":81,"./_is-object":91,"./_meta":106,"./_redefine-all":134,"./_validate-collection":167}],62:[function(require,module,exports){
'use strict';
var global = require('./_global');
var $export = require('./_export');
var redefine = require('./_redefine');
var redefineAll = require('./_redefine-all');
var meta = require('./_meta');
var forOf = require('./_for-of');
var anInstance = require('./_an-instance');
var isObject = require('./_is-object');
var fails = require('./_fails');
var $iterDetect = require('./_iter-detect');
var setToStringTag = require('./_set-to-string-tag');
var inheritIfRequired = require('./_inherit-if-required');

module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var O = {};
  var fixMethod = function (KEY) {
    var fn = proto[KEY];
    redefine(proto, KEY,
      KEY == 'delete' ? function (a) {
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'has' ? function has(a) {
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'get' ? function get(a) {
        return IS_WEAK && !isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'add' ? function add(a) { fn.call(this, a === 0 ? 0 : a); return this; }
        : function set(a, b) { fn.call(this, a === 0 ? 0 : a, b); return this; }
    );
  };
  if (typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    var instance = new C();
    // early implementations not supports chaining
    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
    // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
    var THROWS_ON_PRIMITIVES = fails(function () { instance.has(1); });
    // most early implementations doesn't supports iterables, most modern - not close it correctly
    var ACCEPT_ITERABLES = $iterDetect(function (iter) { new C(iter); }); // eslint-disable-line no-new
    // for early implementations -0 and +0 not the same
    var BUGGY_ZERO = !IS_WEAK && fails(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new C();
      var index = 5;
      while (index--) $instance[ADDER](index, index);
      return !$instance.has(-0);
    });
    if (!ACCEPT_ITERABLES) {
      C = wrapper(function (target, iterable) {
        anInstance(target, C, NAME);
        var that = inheritIfRequired(new Base(), target, C);
        if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }
    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);
    // weak collections should not contains .clear method
    if (IS_WEAK && proto.clear) delete proto.clear;
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F * (C != Base), O);

  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

  return C;
};

},{"./_an-instance":46,"./_export":73,"./_fails":75,"./_for-of":79,"./_global":80,"./_inherit-if-required":85,"./_is-object":91,"./_iter-detect":96,"./_meta":106,"./_redefine":135,"./_redefine-all":134,"./_set-to-string-tag":142}],63:[function(require,module,exports){
var core = module.exports = { version: '2.5.5' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],64:[function(require,module,exports){
'use strict';
var $defineProperty = require('./_object-dp');
var createDesc = require('./_property-desc');

module.exports = function (object, index, value) {
  if (index in object) $defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};

},{"./_object-dp":113,"./_property-desc":133}],65:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":43}],66:[function(require,module,exports){
'use strict';
// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
var fails = require('./_fails');
var getTime = Date.prototype.getTime;
var $toISOString = Date.prototype.toISOString;

var lz = function (num) {
  return num > 9 ? num : '0' + num;
};

// PhantomJS / old WebKit has a broken implementations
module.exports = (fails(function () {
  return $toISOString.call(new Date(-5e13 - 1)) != '0385-07-25T07:06:39.999Z';
}) || !fails(function () {
  $toISOString.call(new Date(NaN));
})) ? function toISOString() {
  if (!isFinite(getTime.call(this))) throw RangeError('Invalid time value');
  var d = this;
  var y = d.getUTCFullYear();
  var m = d.getUTCMilliseconds();
  var s = y < 0 ? '-' : y > 9999 ? '+' : '';
  return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
    '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
    'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
    ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
} : $toISOString;

},{"./_fails":75}],67:[function(require,module,exports){
'use strict';
var anObject = require('./_an-object');
var toPrimitive = require('./_to-primitive');
var NUMBER = 'number';

module.exports = function (hint) {
  if (hint !== 'string' && hint !== NUMBER && hint !== 'default') throw TypeError('Incorrect hint');
  return toPrimitive(anObject(this), hint != NUMBER);
};

},{"./_an-object":47,"./_to-primitive":161}],68:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],69:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":75}],70:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":80,"./_is-object":91}],71:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],72:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};

},{"./_object-gops":119,"./_object-keys":122,"./_object-pie":123}],73:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var hide = require('./_hide');
var redefine = require('./_redefine');
var ctx = require('./_ctx');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":63,"./_ctx":65,"./_global":80,"./_hide":82,"./_redefine":135}],74:[function(require,module,exports){
var MATCH = require('./_wks')('match');
module.exports = function (KEY) {
  var re = /./;
  try {
    '/./'[KEY](re);
  } catch (e) {
    try {
      re[MATCH] = false;
      return !'/./'[KEY](re);
    } catch (f) { /* empty */ }
  } return true;
};

},{"./_wks":170}],75:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],76:[function(require,module,exports){
'use strict';
var hide = require('./_hide');
var redefine = require('./_redefine');
var fails = require('./_fails');
var defined = require('./_defined');
var wks = require('./_wks');

module.exports = function (KEY, length, exec) {
  var SYMBOL = wks(KEY);
  var fns = exec(defined, SYMBOL, ''[KEY]);
  var strfn = fns[0];
  var rxfn = fns[1];
  if (fails(function () {
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  })) {
    redefine(String.prototype, KEY, strfn);
    hide(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return rxfn.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return rxfn.call(string, this); }
    );
  }
};

},{"./_defined":68,"./_fails":75,"./_hide":82,"./_redefine":135,"./_wks":170}],77:[function(require,module,exports){
'use strict';
// 21.2.5.3 get RegExp.prototype.flags
var anObject = require('./_an-object');
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};

},{"./_an-object":47}],78:[function(require,module,exports){
'use strict';
// https://tc39.github.io/proposal-flatMap/#sec-FlattenIntoArray
var isArray = require('./_is-array');
var isObject = require('./_is-object');
var toLength = require('./_to-length');
var ctx = require('./_ctx');
var IS_CONCAT_SPREADABLE = require('./_wks')('isConcatSpreadable');

function flattenIntoArray(target, original, source, sourceLen, start, depth, mapper, thisArg) {
  var targetIndex = start;
  var sourceIndex = 0;
  var mapFn = mapper ? ctx(mapper, thisArg, 3) : false;
  var element, spreadable;

  while (sourceIndex < sourceLen) {
    if (sourceIndex in source) {
      element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];

      spreadable = false;
      if (isObject(element)) {
        spreadable = element[IS_CONCAT_SPREADABLE];
        spreadable = spreadable !== undefined ? !!spreadable : isArray(element);
      }

      if (spreadable && depth > 0) {
        targetIndex = flattenIntoArray(target, original, element, toLength(element.length), targetIndex, depth - 1) - 1;
      } else {
        if (targetIndex >= 0x1fffffffffffff) throw TypeError();
        target[targetIndex] = element;
      }

      targetIndex++;
    }
    sourceIndex++;
  }
  return targetIndex;
}

module.exports = flattenIntoArray;

},{"./_ctx":65,"./_is-array":89,"./_is-object":91,"./_to-length":159,"./_wks":170}],79:[function(require,module,exports){
var ctx = require('./_ctx');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var anObject = require('./_an-object');
var toLength = require('./_to-length');
var getIterFn = require('./core.get-iterator-method');
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;

},{"./_an-object":47,"./_ctx":65,"./_is-array-iter":88,"./_iter-call":93,"./_to-length":159,"./core.get-iterator-method":174}],80:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],81:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],82:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":69,"./_object-dp":113,"./_property-desc":133}],83:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":80}],84:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":69,"./_dom-create":70,"./_fails":75}],85:[function(require,module,exports){
var isObject = require('./_is-object');
var setPrototypeOf = require('./_set-proto').set;
module.exports = function (that, target, C) {
  var S = target.constructor;
  var P;
  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf) {
    setPrototypeOf(that, P);
  } return that;
};

},{"./_is-object":91,"./_set-proto":140}],86:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};

},{}],87:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":58}],88:[function(require,module,exports){
// check on default Array iterator
var Iterators = require('./_iterators');
var ITERATOR = require('./_wks')('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};

},{"./_iterators":98,"./_wks":170}],89:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};

},{"./_cof":58}],90:[function(require,module,exports){
// 20.1.2.3 Number.isInteger(number)
var isObject = require('./_is-object');
var floor = Math.floor;
module.exports = function isInteger(it) {
  return !isObject(it) && isFinite(it) && floor(it) === it;
};

},{"./_is-object":91}],91:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],92:[function(require,module,exports){
// 7.2.8 IsRegExp(argument)
var isObject = require('./_is-object');
var cof = require('./_cof');
var MATCH = require('./_wks')('match');
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
};

},{"./_cof":58,"./_is-object":91,"./_wks":170}],93:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};

},{"./_an-object":47}],94:[function(require,module,exports){
'use strict';
var create = require('./_object-create');
var descriptor = require('./_property-desc');
var setToStringTag = require('./_set-to-string-tag');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};

},{"./_hide":82,"./_object-create":111,"./_property-desc":133,"./_set-to-string-tag":142,"./_wks":170}],95:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var $export = require('./_export');
var redefine = require('./_redefine');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var $iterCreate = require('./_iter-create');
var setToStringTag = require('./_set-to-string-tag');
var getPrototypeOf = require('./_object-gpo');
var ITERATOR = require('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

},{"./_export":73,"./_hide":82,"./_iter-create":94,"./_iterators":98,"./_library":100,"./_object-gpo":120,"./_redefine":135,"./_set-to-string-tag":142,"./_wks":170}],96:[function(require,module,exports){
var ITERATOR = require('./_wks')('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};

},{"./_wks":170}],97:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],98:[function(require,module,exports){
module.exports = {};

},{}],99:[function(require,module,exports){
var getKeys = require('./_object-keys');
var toIObject = require('./_to-iobject');
module.exports = function (object, el) {
  var O = toIObject(object);
  var keys = getKeys(O);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) if (O[key = keys[index++]] === el) return key;
};

},{"./_object-keys":122,"./_to-iobject":158}],100:[function(require,module,exports){
module.exports = false;

},{}],101:[function(require,module,exports){
// 20.2.2.14 Math.expm1(x)
var $expm1 = Math.expm1;
module.exports = (!$expm1
  // Old FF bug
  || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
  // Tor Browser bug
  || $expm1(-2e-17) != -2e-17
) ? function expm1(x) {
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : Math.exp(x) - 1;
} : $expm1;

},{}],102:[function(require,module,exports){
// 20.2.2.16 Math.fround(x)
var sign = require('./_math-sign');
var pow = Math.pow;
var EPSILON = pow(2, -52);
var EPSILON32 = pow(2, -23);
var MAX32 = pow(2, 127) * (2 - EPSILON32);
var MIN32 = pow(2, -126);

var roundTiesToEven = function (n) {
  return n + 1 / EPSILON - 1 / EPSILON;
};

module.exports = Math.fround || function fround(x) {
  var $abs = Math.abs(x);
  var $sign = sign(x);
  var a, result;
  if ($abs < MIN32) return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
  a = (1 + EPSILON32 / EPSILON) * $abs;
  result = a - (a - $abs);
  // eslint-disable-next-line no-self-compare
  if (result > MAX32 || result != result) return $sign * Infinity;
  return $sign * result;
};

},{"./_math-sign":105}],103:[function(require,module,exports){
// 20.2.2.20 Math.log1p(x)
module.exports = Math.log1p || function log1p(x) {
  return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : Math.log(1 + x);
};

},{}],104:[function(require,module,exports){
// https://rwaldron.github.io/proposal-math-extensions/
module.exports = Math.scale || function scale(x, inLow, inHigh, outLow, outHigh) {
  if (
    arguments.length === 0
      // eslint-disable-next-line no-self-compare
      || x != x
      // eslint-disable-next-line no-self-compare
      || inLow != inLow
      // eslint-disable-next-line no-self-compare
      || inHigh != inHigh
      // eslint-disable-next-line no-self-compare
      || outLow != outLow
      // eslint-disable-next-line no-self-compare
      || outHigh != outHigh
  ) return NaN;
  if (x === Infinity || x === -Infinity) return x;
  return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow;
};

},{}],105:[function(require,module,exports){
// 20.2.2.28 Math.sign(x)
module.exports = Math.sign || function sign(x) {
  // eslint-disable-next-line no-self-compare
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
};

},{}],106:[function(require,module,exports){
var META = require('./_uid')('meta');
var isObject = require('./_is-object');
var has = require('./_has');
var setDesc = require('./_object-dp').f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !require('./_fails')(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};

},{"./_fails":75,"./_has":81,"./_is-object":91,"./_object-dp":113,"./_uid":165}],107:[function(require,module,exports){
var Map = require('./es6.map');
var $export = require('./_export');
var shared = require('./_shared')('metadata');
var store = shared.store || (shared.store = new (require('./es6.weak-map'))());

var getOrCreateMetadataMap = function (target, targetKey, create) {
  var targetMetadata = store.get(target);
  if (!targetMetadata) {
    if (!create) return undefined;
    store.set(target, targetMetadata = new Map());
  }
  var keyMetadata = targetMetadata.get(targetKey);
  if (!keyMetadata) {
    if (!create) return undefined;
    targetMetadata.set(targetKey, keyMetadata = new Map());
  } return keyMetadata;
};
var ordinaryHasOwnMetadata = function (MetadataKey, O, P) {
  var metadataMap = getOrCreateMetadataMap(O, P, false);
  return metadataMap === undefined ? false : metadataMap.has(MetadataKey);
};
var ordinaryGetOwnMetadata = function (MetadataKey, O, P) {
  var metadataMap = getOrCreateMetadataMap(O, P, false);
  return metadataMap === undefined ? undefined : metadataMap.get(MetadataKey);
};
var ordinaryDefineOwnMetadata = function (MetadataKey, MetadataValue, O, P) {
  getOrCreateMetadataMap(O, P, true).set(MetadataKey, MetadataValue);
};
var ordinaryOwnMetadataKeys = function (target, targetKey) {
  var metadataMap = getOrCreateMetadataMap(target, targetKey, false);
  var keys = [];
  if (metadataMap) metadataMap.forEach(function (_, key) { keys.push(key); });
  return keys;
};
var toMetaKey = function (it) {
  return it === undefined || typeof it == 'symbol' ? it : String(it);
};
var exp = function (O) {
  $export($export.S, 'Reflect', O);
};

module.exports = {
  store: store,
  map: getOrCreateMetadataMap,
  has: ordinaryHasOwnMetadata,
  get: ordinaryGetOwnMetadata,
  set: ordinaryDefineOwnMetadata,
  keys: ordinaryOwnMetadataKeys,
  key: toMetaKey,
  exp: exp
};

},{"./_export":73,"./_shared":144,"./es6.map":214,"./es6.weak-map":320}],108:[function(require,module,exports){
var global = require('./_global');
var macrotask = require('./_task').set;
var Observer = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var isNode = require('./_cof')(process) == 'process';

module.exports = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(global.navigator && global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    var promise = Promise.resolve();
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};

},{"./_cof":58,"./_global":80,"./_task":154}],109:[function(require,module,exports){
'use strict';
// 25.4.1.5 NewPromiseCapability(C)
var aFunction = require('./_a-function');

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}

module.exports.f = function (C) {
  return new PromiseCapability(C);
};

},{"./_a-function":43}],110:[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
var toObject = require('./_to-object');
var IObject = require('./_iobject');
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
  } return T;
} : $assign;

},{"./_fails":75,"./_iobject":87,"./_object-gops":119,"./_object-keys":122,"./_object-pie":123,"./_to-object":160}],111:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = require('./_an-object');
var dPs = require('./_object-dps');
var enumBugKeys = require('./_enum-bug-keys');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":47,"./_dom-create":70,"./_enum-bug-keys":71,"./_html":83,"./_object-dps":114,"./_shared-key":143}],112:[function(require,module,exports){
var dP = require('./_object-dp');
var gOPD = require('./_object-gopd');
var ownKeys = require('./_own-keys');
var toIObject = require('./_to-iobject');

module.exports = function define(target, mixin) {
  var keys = ownKeys(toIObject(mixin));
  var length = keys.length;
  var i = 0;
  var key;
  while (length > i) dP.f(target, key = keys[i++], gOPD.f(mixin, key));
  return target;
};

},{"./_object-dp":113,"./_object-gopd":116,"./_own-keys":126,"./_to-iobject":158}],113:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":47,"./_descriptors":69,"./_ie8-dom-define":84,"./_to-primitive":161}],114:[function(require,module,exports){
var dP = require('./_object-dp');
var anObject = require('./_an-object');
var getKeys = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};

},{"./_an-object":47,"./_descriptors":69,"./_object-dp":113,"./_object-keys":122}],115:[function(require,module,exports){
'use strict';
// Forced replacement prototype accessors methods
module.exports = require('./_library') || !require('./_fails')(function () {
  var K = Math.random();
  // In FF throws only define methods
  // eslint-disable-next-line no-undef, no-useless-call
  __defineSetter__.call(null, K, function () { /* empty */ });
  delete require('./_global')[K];
});

},{"./_fails":75,"./_global":80,"./_library":100}],116:[function(require,module,exports){
var pIE = require('./_object-pie');
var createDesc = require('./_property-desc');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var has = require('./_has');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};

},{"./_descriptors":69,"./_has":81,"./_ie8-dom-define":84,"./_object-pie":123,"./_property-desc":133,"./_to-iobject":158,"./_to-primitive":161}],117:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject');
var gOPN = require('./_object-gopn').f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":118,"./_to-iobject":158}],118:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = require('./_object-keys-internal');
var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};

},{"./_enum-bug-keys":71,"./_object-keys-internal":121}],119:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],120:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = require('./_has');
var toObject = require('./_to-object');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

},{"./_has":81,"./_shared-key":143,"./_to-object":160}],121:[function(require,module,exports){
var has = require('./_has');
var toIObject = require('./_to-iobject');
var arrayIndexOf = require('./_array-includes')(false);
var IE_PROTO = require('./_shared-key')('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"./_array-includes":51,"./_has":81,"./_shared-key":143,"./_to-iobject":158}],122:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":71,"./_object-keys-internal":121}],123:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;

},{}],124:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export');
var core = require('./_core');
var fails = require('./_fails');
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};

},{"./_core":63,"./_export":73,"./_fails":75}],125:[function(require,module,exports){
var getKeys = require('./_object-keys');
var toIObject = require('./_to-iobject');
var isEnum = require('./_object-pie').f;
module.exports = function (isEntries) {
  return function (it) {
    var O = toIObject(it);
    var keys = getKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) if (isEnum.call(O, key = keys[i++])) {
      result.push(isEntries ? [key, O[key]] : O[key]);
    } return result;
  };
};

},{"./_object-keys":122,"./_object-pie":123,"./_to-iobject":158}],126:[function(require,module,exports){
// all object keys, includes non-enumerable and symbols
var gOPN = require('./_object-gopn');
var gOPS = require('./_object-gops');
var anObject = require('./_an-object');
var Reflect = require('./_global').Reflect;
module.exports = Reflect && Reflect.ownKeys || function ownKeys(it) {
  var keys = gOPN.f(anObject(it));
  var getSymbols = gOPS.f;
  return getSymbols ? keys.concat(getSymbols(it)) : keys;
};

},{"./_an-object":47,"./_global":80,"./_object-gopn":118,"./_object-gops":119}],127:[function(require,module,exports){
var $parseFloat = require('./_global').parseFloat;
var $trim = require('./_string-trim').trim;

module.exports = 1 / $parseFloat(require('./_string-ws') + '-0') !== -Infinity ? function parseFloat(str) {
  var string = $trim(String(str), 3);
  var result = $parseFloat(string);
  return result === 0 && string.charAt(0) == '-' ? -0 : result;
} : $parseFloat;

},{"./_global":80,"./_string-trim":152,"./_string-ws":153}],128:[function(require,module,exports){
var $parseInt = require('./_global').parseInt;
var $trim = require('./_string-trim').trim;
var ws = require('./_string-ws');
var hex = /^[-+]?0[xX]/;

module.exports = $parseInt(ws + '08') !== 8 || $parseInt(ws + '0x16') !== 22 ? function parseInt(str, radix) {
  var string = $trim(String(str), 3);
  return $parseInt(string, (radix >>> 0) || (hex.test(string) ? 16 : 10));
} : $parseInt;

},{"./_global":80,"./_string-trim":152,"./_string-ws":153}],129:[function(require,module,exports){
'use strict';
var path = require('./_path');
var invoke = require('./_invoke');
var aFunction = require('./_a-function');
module.exports = function (/* ...pargs */) {
  var fn = aFunction(this);
  var length = arguments.length;
  var pargs = new Array(length);
  var i = 0;
  var _ = path._;
  var holder = false;
  while (length > i) if ((pargs[i] = arguments[i++]) === _) holder = true;
  return function (/* ...args */) {
    var that = this;
    var aLen = arguments.length;
    var j = 0;
    var k = 0;
    var args;
    if (!holder && !aLen) return invoke(fn, pargs, that);
    args = pargs.slice();
    if (holder) for (;length > j; j++) if (args[j] === _) args[j] = arguments[k++];
    while (aLen > k) args.push(arguments[k++]);
    return invoke(fn, args, that);
  };
};

},{"./_a-function":43,"./_invoke":86,"./_path":130}],130:[function(require,module,exports){
module.exports = require('./_global');

},{"./_global":80}],131:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};

},{}],132:[function(require,module,exports){
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var newPromiseCapability = require('./_new-promise-capability');

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

},{"./_an-object":47,"./_is-object":91,"./_new-promise-capability":109}],133:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],134:[function(require,module,exports){
var redefine = require('./_redefine');
module.exports = function (target, src, safe) {
  for (var key in src) redefine(target, key, src[key], safe);
  return target;
};

},{"./_redefine":135}],135:[function(require,module,exports){
var global = require('./_global');
var hide = require('./_hide');
var has = require('./_has');
var SRC = require('./_uid')('src');
var TO_STRING = 'toString';
var $toString = Function[TO_STRING];
var TPL = ('' + $toString).split(TO_STRING);

require('./_core').inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});

},{"./_core":63,"./_global":80,"./_has":81,"./_hide":82,"./_uid":165}],136:[function(require,module,exports){
module.exports = function (regExp, replace) {
  var replacer = replace === Object(replace) ? function (part) {
    return replace[part];
  } : replace;
  return function (it) {
    return String(it).replace(regExp, replacer);
  };
};

},{}],137:[function(require,module,exports){
// 7.2.9 SameValue(x, y)
module.exports = Object.is || function is(x, y) {
  // eslint-disable-next-line no-self-compare
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};

},{}],138:[function(require,module,exports){
'use strict';
// https://tc39.github.io/proposal-setmap-offrom/
var $export = require('./_export');
var aFunction = require('./_a-function');
var ctx = require('./_ctx');
var forOf = require('./_for-of');

module.exports = function (COLLECTION) {
  $export($export.S, COLLECTION, { from: function from(source /* , mapFn, thisArg */) {
    var mapFn = arguments[1];
    var mapping, A, n, cb;
    aFunction(this);
    mapping = mapFn !== undefined;
    if (mapping) aFunction(mapFn);
    if (source == undefined) return new this();
    A = [];
    if (mapping) {
      n = 0;
      cb = ctx(mapFn, arguments[2], 2);
      forOf(source, false, function (nextItem) {
        A.push(cb(nextItem, n++));
      });
    } else {
      forOf(source, false, A.push, A);
    }
    return new this(A);
  } });
};

},{"./_a-function":43,"./_ctx":65,"./_export":73,"./_for-of":79}],139:[function(require,module,exports){
'use strict';
// https://tc39.github.io/proposal-setmap-offrom/
var $export = require('./_export');

module.exports = function (COLLECTION) {
  $export($export.S, COLLECTION, { of: function of() {
    var length = arguments.length;
    var A = new Array(length);
    while (length--) A[length] = arguments[length];
    return new this(A);
  } });
};

},{"./_export":73}],140:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object');
var anObject = require('./_an-object');
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};

},{"./_an-object":47,"./_ctx":65,"./_is-object":91,"./_object-gopd":116}],141:[function(require,module,exports){
'use strict';
var global = require('./_global');
var dP = require('./_object-dp');
var DESCRIPTORS = require('./_descriptors');
var SPECIES = require('./_wks')('species');

module.exports = function (KEY) {
  var C = global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};

},{"./_descriptors":69,"./_global":80,"./_object-dp":113,"./_wks":170}],142:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":81,"./_object-dp":113,"./_wks":170}],143:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":144,"./_uid":165}],144:[function(require,module,exports){
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});
module.exports = function (key) {
  return store[key] || (store[key] = {});
};

},{"./_global":80}],145:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = require('./_an-object');
var aFunction = require('./_a-function');
var SPECIES = require('./_wks')('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};

},{"./_a-function":43,"./_an-object":47,"./_wks":170}],146:[function(require,module,exports){
'use strict';
var fails = require('./_fails');

module.exports = function (method, arg) {
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call
    arg ? method.call(null, function () { /* empty */ }, 1) : method.call(null);
  });
};

},{"./_fails":75}],147:[function(require,module,exports){
var toInteger = require('./_to-integer');
var defined = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

},{"./_defined":68,"./_to-integer":157}],148:[function(require,module,exports){
// helper for String#{startsWith, endsWith, includes}
var isRegExp = require('./_is-regexp');
var defined = require('./_defined');

module.exports = function (that, searchString, NAME) {
  if (isRegExp(searchString)) throw TypeError('String#' + NAME + " doesn't accept regex!");
  return String(defined(that));
};

},{"./_defined":68,"./_is-regexp":92}],149:[function(require,module,exports){
var $export = require('./_export');
var fails = require('./_fails');
var defined = require('./_defined');
var quot = /"/g;
// B.2.3.2.1 CreateHTML(string, tag, attribute, value)
var createHTML = function (string, tag, attribute, value) {
  var S = String(defined(string));
  var p1 = '<' + tag;
  if (attribute !== '') p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
  return p1 + '>' + S + '</' + tag + '>';
};
module.exports = function (NAME, exec) {
  var O = {};
  O[NAME] = exec(createHTML);
  $export($export.P + $export.F * fails(function () {
    var test = ''[NAME]('"');
    return test !== test.toLowerCase() || test.split('"').length > 3;
  }), 'String', O);
};

},{"./_defined":68,"./_export":73,"./_fails":75}],150:[function(require,module,exports){
// https://github.com/tc39/proposal-string-pad-start-end
var toLength = require('./_to-length');
var repeat = require('./_string-repeat');
var defined = require('./_defined');

module.exports = function (that, maxLength, fillString, left) {
  var S = String(defined(that));
  var stringLength = S.length;
  var fillStr = fillString === undefined ? ' ' : String(fillString);
  var intMaxLength = toLength(maxLength);
  if (intMaxLength <= stringLength || fillStr == '') return S;
  var fillLen = intMaxLength - stringLength;
  var stringFiller = repeat.call(fillStr, Math.ceil(fillLen / fillStr.length));
  if (stringFiller.length > fillLen) stringFiller = stringFiller.slice(0, fillLen);
  return left ? stringFiller + S : S + stringFiller;
};

},{"./_defined":68,"./_string-repeat":151,"./_to-length":159}],151:[function(require,module,exports){
'use strict';
var toInteger = require('./_to-integer');
var defined = require('./_defined');

module.exports = function repeat(count) {
  var str = String(defined(this));
  var res = '';
  var n = toInteger(count);
  if (n < 0 || n == Infinity) throw RangeError("Count can't be negative");
  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) res += str;
  return res;
};

},{"./_defined":68,"./_to-integer":157}],152:[function(require,module,exports){
var $export = require('./_export');
var defined = require('./_defined');
var fails = require('./_fails');
var spaces = require('./_string-ws');
var space = '[' + spaces + ']';
var non = '\u200b\u0085';
var ltrim = RegExp('^' + space + space + '*');
var rtrim = RegExp(space + space + '*$');

var exporter = function (KEY, exec, ALIAS) {
  var exp = {};
  var FORCE = fails(function () {
    return !!spaces[KEY]() || non[KEY]() != non;
  });
  var fn = exp[KEY] = FORCE ? exec(trim) : spaces[KEY];
  if (ALIAS) exp[ALIAS] = fn;
  $export($export.P + $export.F * FORCE, 'String', exp);
};

// 1 -> String#trimLeft
// 2 -> String#trimRight
// 3 -> String#trim
var trim = exporter.trim = function (string, TYPE) {
  string = String(defined(string));
  if (TYPE & 1) string = string.replace(ltrim, '');
  if (TYPE & 2) string = string.replace(rtrim, '');
  return string;
};

module.exports = exporter;

},{"./_defined":68,"./_export":73,"./_fails":75,"./_string-ws":153}],153:[function(require,module,exports){
module.exports = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
  '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

},{}],154:[function(require,module,exports){
var ctx = require('./_ctx');
var invoke = require('./_invoke');
var html = require('./_html');
var cel = require('./_dom-create');
var global = require('./_global');
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (require('./_cof')(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};

},{"./_cof":58,"./_ctx":65,"./_dom-create":70,"./_global":80,"./_html":83,"./_invoke":86}],155:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":157}],156:[function(require,module,exports){
// https://tc39.github.io/ecma262/#sec-toindex
var toInteger = require('./_to-integer');
var toLength = require('./_to-length');
module.exports = function (it) {
  if (it === undefined) return 0;
  var number = toInteger(it);
  var length = toLength(number);
  if (number !== length) throw RangeError('Wrong length!');
  return length;
};

},{"./_to-integer":157,"./_to-length":159}],157:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],158:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":68,"./_iobject":87}],159:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":157}],160:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":68}],161:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":91}],162:[function(require,module,exports){
'use strict';
if (require('./_descriptors')) {
  var LIBRARY = require('./_library');
  var global = require('./_global');
  var fails = require('./_fails');
  var $export = require('./_export');
  var $typed = require('./_typed');
  var $buffer = require('./_typed-buffer');
  var ctx = require('./_ctx');
  var anInstance = require('./_an-instance');
  var propertyDesc = require('./_property-desc');
  var hide = require('./_hide');
  var redefineAll = require('./_redefine-all');
  var toInteger = require('./_to-integer');
  var toLength = require('./_to-length');
  var toIndex = require('./_to-index');
  var toAbsoluteIndex = require('./_to-absolute-index');
  var toPrimitive = require('./_to-primitive');
  var has = require('./_has');
  var classof = require('./_classof');
  var isObject = require('./_is-object');
  var toObject = require('./_to-object');
  var isArrayIter = require('./_is-array-iter');
  var create = require('./_object-create');
  var getPrototypeOf = require('./_object-gpo');
  var gOPN = require('./_object-gopn').f;
  var getIterFn = require('./core.get-iterator-method');
  var uid = require('./_uid');
  var wks = require('./_wks');
  var createArrayMethod = require('./_array-methods');
  var createArrayIncludes = require('./_array-includes');
  var speciesConstructor = require('./_species-constructor');
  var ArrayIterators = require('./es6.array.iterator');
  var Iterators = require('./_iterators');
  var $iterDetect = require('./_iter-detect');
  var setSpecies = require('./_set-species');
  var arrayFill = require('./_array-fill');
  var arrayCopyWithin = require('./_array-copy-within');
  var $DP = require('./_object-dp');
  var $GOPD = require('./_object-gopd');
  var dP = $DP.f;
  var gOPD = $GOPD.f;
  var RangeError = global.RangeError;
  var TypeError = global.TypeError;
  var Uint8Array = global.Uint8Array;
  var ARRAY_BUFFER = 'ArrayBuffer';
  var SHARED_BUFFER = 'Shared' + ARRAY_BUFFER;
  var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
  var PROTOTYPE = 'prototype';
  var ArrayProto = Array[PROTOTYPE];
  var $ArrayBuffer = $buffer.ArrayBuffer;
  var $DataView = $buffer.DataView;
  var arrayForEach = createArrayMethod(0);
  var arrayFilter = createArrayMethod(2);
  var arraySome = createArrayMethod(3);
  var arrayEvery = createArrayMethod(4);
  var arrayFind = createArrayMethod(5);
  var arrayFindIndex = createArrayMethod(6);
  var arrayIncludes = createArrayIncludes(true);
  var arrayIndexOf = createArrayIncludes(false);
  var arrayValues = ArrayIterators.values;
  var arrayKeys = ArrayIterators.keys;
  var arrayEntries = ArrayIterators.entries;
  var arrayLastIndexOf = ArrayProto.lastIndexOf;
  var arrayReduce = ArrayProto.reduce;
  var arrayReduceRight = ArrayProto.reduceRight;
  var arrayJoin = ArrayProto.join;
  var arraySort = ArrayProto.sort;
  var arraySlice = ArrayProto.slice;
  var arrayToString = ArrayProto.toString;
  var arrayToLocaleString = ArrayProto.toLocaleString;
  var ITERATOR = wks('iterator');
  var TAG = wks('toStringTag');
  var TYPED_CONSTRUCTOR = uid('typed_constructor');
  var DEF_CONSTRUCTOR = uid('def_constructor');
  var ALL_CONSTRUCTORS = $typed.CONSTR;
  var TYPED_ARRAY = $typed.TYPED;
  var VIEW = $typed.VIEW;
  var WRONG_LENGTH = 'Wrong length!';

  var $map = createArrayMethod(1, function (O, length) {
    return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
  });

  var LITTLE_ENDIAN = fails(function () {
    // eslint-disable-next-line no-undef
    return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
  });

  var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function () {
    new Uint8Array(1).set({});
  });

  var toOffset = function (it, BYTES) {
    var offset = toInteger(it);
    if (offset < 0 || offset % BYTES) throw RangeError('Wrong offset!');
    return offset;
  };

  var validate = function (it) {
    if (isObject(it) && TYPED_ARRAY in it) return it;
    throw TypeError(it + ' is not a typed array!');
  };

  var allocate = function (C, length) {
    if (!(isObject(C) && TYPED_CONSTRUCTOR in C)) {
      throw TypeError('It is not a typed array constructor!');
    } return new C(length);
  };

  var speciesFromList = function (O, list) {
    return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
  };

  var fromList = function (C, list) {
    var index = 0;
    var length = list.length;
    var result = allocate(C, length);
    while (length > index) result[index] = list[index++];
    return result;
  };

  var addGetter = function (it, key, internal) {
    dP(it, key, { get: function () { return this._d[internal]; } });
  };

  var $from = function from(source /* , mapfn, thisArg */) {
    var O = toObject(source);
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var iterFn = getIterFn(O);
    var i, length, values, result, step, iterator;
    if (iterFn != undefined && !isArrayIter(iterFn)) {
      for (iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++) {
        values.push(step.value);
      } O = values;
    }
    if (mapping && aLen > 2) mapfn = ctx(mapfn, arguments[2], 2);
    for (i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++) {
      result[i] = mapping ? mapfn(O[i], i) : O[i];
    }
    return result;
  };

  var $of = function of(/* ...items */) {
    var index = 0;
    var length = arguments.length;
    var result = allocate(this, length);
    while (length > index) result[index] = arguments[index++];
    return result;
  };

  // iOS Safari 6.x fails here
  var TO_LOCALE_BUG = !!Uint8Array && fails(function () { arrayToLocaleString.call(new Uint8Array(1)); });

  var $toLocaleString = function toLocaleString() {
    return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
  };

  var proto = {
    copyWithin: function copyWithin(target, start /* , end */) {
      return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
    },
    every: function every(callbackfn /* , thisArg */) {
      return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    fill: function fill(value /* , start, end */) { // eslint-disable-line no-unused-vars
      return arrayFill.apply(validate(this), arguments);
    },
    filter: function filter(callbackfn /* , thisArg */) {
      return speciesFromList(this, arrayFilter(validate(this), callbackfn,
        arguments.length > 1 ? arguments[1] : undefined));
    },
    find: function find(predicate /* , thisArg */) {
      return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    },
    findIndex: function findIndex(predicate /* , thisArg */) {
      return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    },
    forEach: function forEach(callbackfn /* , thisArg */) {
      arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    indexOf: function indexOf(searchElement /* , fromIndex */) {
      return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    },
    includes: function includes(searchElement /* , fromIndex */) {
      return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    },
    join: function join(separator) { // eslint-disable-line no-unused-vars
      return arrayJoin.apply(validate(this), arguments);
    },
    lastIndexOf: function lastIndexOf(searchElement /* , fromIndex */) { // eslint-disable-line no-unused-vars
      return arrayLastIndexOf.apply(validate(this), arguments);
    },
    map: function map(mapfn /* , thisArg */) {
      return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    reduce: function reduce(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
      return arrayReduce.apply(validate(this), arguments);
    },
    reduceRight: function reduceRight(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
      return arrayReduceRight.apply(validate(this), arguments);
    },
    reverse: function reverse() {
      var that = this;
      var length = validate(that).length;
      var middle = Math.floor(length / 2);
      var index = 0;
      var value;
      while (index < middle) {
        value = that[index];
        that[index++] = that[--length];
        that[length] = value;
      } return that;
    },
    some: function some(callbackfn /* , thisArg */) {
      return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    sort: function sort(comparefn) {
      return arraySort.call(validate(this), comparefn);
    },
    subarray: function subarray(begin, end) {
      var O = validate(this);
      var length = O.length;
      var $begin = toAbsoluteIndex(begin, length);
      return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(
        O.buffer,
        O.byteOffset + $begin * O.BYTES_PER_ELEMENT,
        toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - $begin)
      );
    }
  };

  var $slice = function slice(start, end) {
    return speciesFromList(this, arraySlice.call(validate(this), start, end));
  };

  var $set = function set(arrayLike /* , offset */) {
    validate(this);
    var offset = toOffset(arguments[1], 1);
    var length = this.length;
    var src = toObject(arrayLike);
    var len = toLength(src.length);
    var index = 0;
    if (len + offset > length) throw RangeError(WRONG_LENGTH);
    while (index < len) this[offset + index] = src[index++];
  };

  var $iterators = {
    entries: function entries() {
      return arrayEntries.call(validate(this));
    },
    keys: function keys() {
      return arrayKeys.call(validate(this));
    },
    values: function values() {
      return arrayValues.call(validate(this));
    }
  };

  var isTAIndex = function (target, key) {
    return isObject(target)
      && target[TYPED_ARRAY]
      && typeof key != 'symbol'
      && key in target
      && String(+key) == String(key);
  };
  var $getDesc = function getOwnPropertyDescriptor(target, key) {
    return isTAIndex(target, key = toPrimitive(key, true))
      ? propertyDesc(2, target[key])
      : gOPD(target, key);
  };
  var $setDesc = function defineProperty(target, key, desc) {
    if (isTAIndex(target, key = toPrimitive(key, true))
      && isObject(desc)
      && has(desc, 'value')
      && !has(desc, 'get')
      && !has(desc, 'set')
      // TODO: add validation descriptor w/o calling accessors
      && !desc.configurable
      && (!has(desc, 'writable') || desc.writable)
      && (!has(desc, 'enumerable') || desc.enumerable)
    ) {
      target[key] = desc.value;
      return target;
    } return dP(target, key, desc);
  };

  if (!ALL_CONSTRUCTORS) {
    $GOPD.f = $getDesc;
    $DP.f = $setDesc;
  }

  $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
    getOwnPropertyDescriptor: $getDesc,
    defineProperty: $setDesc
  });

  if (fails(function () { arrayToString.call({}); })) {
    arrayToString = arrayToLocaleString = function toString() {
      return arrayJoin.call(this);
    };
  }

  var $TypedArrayPrototype$ = redefineAll({}, proto);
  redefineAll($TypedArrayPrototype$, $iterators);
  hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
  redefineAll($TypedArrayPrototype$, {
    slice: $slice,
    set: $set,
    constructor: function () { /* noop */ },
    toString: arrayToString,
    toLocaleString: $toLocaleString
  });
  addGetter($TypedArrayPrototype$, 'buffer', 'b');
  addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
  addGetter($TypedArrayPrototype$, 'byteLength', 'l');
  addGetter($TypedArrayPrototype$, 'length', 'e');
  dP($TypedArrayPrototype$, TAG, {
    get: function () { return this[TYPED_ARRAY]; }
  });

  // eslint-disable-next-line max-statements
  module.exports = function (KEY, BYTES, wrapper, CLAMPED) {
    CLAMPED = !!CLAMPED;
    var NAME = KEY + (CLAMPED ? 'Clamped' : '') + 'Array';
    var GETTER = 'get' + KEY;
    var SETTER = 'set' + KEY;
    var TypedArray = global[NAME];
    var Base = TypedArray || {};
    var TAC = TypedArray && getPrototypeOf(TypedArray);
    var FORCED = !TypedArray || !$typed.ABV;
    var O = {};
    var TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];
    var getter = function (that, index) {
      var data = that._d;
      return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
    };
    var setter = function (that, index, value) {
      var data = that._d;
      if (CLAMPED) value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
      data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
    };
    var addElement = function (that, index) {
      dP(that, index, {
        get: function () {
          return getter(this, index);
        },
        set: function (value) {
          return setter(this, index, value);
        },
        enumerable: true
      });
    };
    if (FORCED) {
      TypedArray = wrapper(function (that, data, $offset, $length) {
        anInstance(that, TypedArray, NAME, '_d');
        var index = 0;
        var offset = 0;
        var buffer, byteLength, length, klass;
        if (!isObject(data)) {
          length = toIndex(data);
          byteLength = length * BYTES;
          buffer = new $ArrayBuffer(byteLength);
        } else if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
          buffer = data;
          offset = toOffset($offset, BYTES);
          var $len = data.byteLength;
          if ($length === undefined) {
            if ($len % BYTES) throw RangeError(WRONG_LENGTH);
            byteLength = $len - offset;
            if (byteLength < 0) throw RangeError(WRONG_LENGTH);
          } else {
            byteLength = toLength($length) * BYTES;
            if (byteLength + offset > $len) throw RangeError(WRONG_LENGTH);
          }
          length = byteLength / BYTES;
        } else if (TYPED_ARRAY in data) {
          return fromList(TypedArray, data);
        } else {
          return $from.call(TypedArray, data);
        }
        hide(that, '_d', {
          b: buffer,
          o: offset,
          l: byteLength,
          e: length,
          v: new $DataView(buffer)
        });
        while (index < length) addElement(that, index++);
      });
      TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
      hide(TypedArrayPrototype, 'constructor', TypedArray);
    } else if (!fails(function () {
      TypedArray(1);
    }) || !fails(function () {
      new TypedArray(-1); // eslint-disable-line no-new
    }) || !$iterDetect(function (iter) {
      new TypedArray(); // eslint-disable-line no-new
      new TypedArray(null); // eslint-disable-line no-new
      new TypedArray(1.5); // eslint-disable-line no-new
      new TypedArray(iter); // eslint-disable-line no-new
    }, true)) {
      TypedArray = wrapper(function (that, data, $offset, $length) {
        anInstance(that, TypedArray, NAME);
        var klass;
        // `ws` module bug, temporarily remove validation length for Uint8Array
        // https://github.com/websockets/ws/pull/645
        if (!isObject(data)) return new Base(toIndex(data));
        if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
          return $length !== undefined
            ? new Base(data, toOffset($offset, BYTES), $length)
            : $offset !== undefined
              ? new Base(data, toOffset($offset, BYTES))
              : new Base(data);
        }
        if (TYPED_ARRAY in data) return fromList(TypedArray, data);
        return $from.call(TypedArray, data);
      });
      arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function (key) {
        if (!(key in TypedArray)) hide(TypedArray, key, Base[key]);
      });
      TypedArray[PROTOTYPE] = TypedArrayPrototype;
      if (!LIBRARY) TypedArrayPrototype.constructor = TypedArray;
    }
    var $nativeIterator = TypedArrayPrototype[ITERATOR];
    var CORRECT_ITER_NAME = !!$nativeIterator
      && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined);
    var $iterator = $iterators.values;
    hide(TypedArray, TYPED_CONSTRUCTOR, true);
    hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
    hide(TypedArrayPrototype, VIEW, true);
    hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

    if (CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)) {
      dP(TypedArrayPrototype, TAG, {
        get: function () { return NAME; }
      });
    }

    O[NAME] = TypedArray;

    $export($export.G + $export.W + $export.F * (TypedArray != Base), O);

    $export($export.S, NAME, {
      BYTES_PER_ELEMENT: BYTES
    });

    $export($export.S + $export.F * fails(function () { Base.of.call(TypedArray, 1); }), NAME, {
      from: $from,
      of: $of
    });

    if (!(BYTES_PER_ELEMENT in TypedArrayPrototype)) hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);

    $export($export.P, NAME, proto);

    setSpecies(NAME);

    $export($export.P + $export.F * FORCED_SET, NAME, { set: $set });

    $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);

    if (!LIBRARY && TypedArrayPrototype.toString != arrayToString) TypedArrayPrototype.toString = arrayToString;

    $export($export.P + $export.F * fails(function () {
      new TypedArray(1).slice();
    }), NAME, { slice: $slice });

    $export($export.P + $export.F * (fails(function () {
      return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString();
    }) || !fails(function () {
      TypedArrayPrototype.toLocaleString.call([1, 2]);
    })), NAME, { toLocaleString: $toLocaleString });

    Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
    if (!LIBRARY && !CORRECT_ITER_NAME) hide(TypedArrayPrototype, ITERATOR, $iterator);
  };
} else module.exports = function () { /* empty */ };

},{"./_an-instance":46,"./_array-copy-within":48,"./_array-fill":49,"./_array-includes":51,"./_array-methods":52,"./_classof":57,"./_ctx":65,"./_descriptors":69,"./_export":73,"./_fails":75,"./_global":80,"./_has":81,"./_hide":82,"./_is-array-iter":88,"./_is-object":91,"./_iter-detect":96,"./_iterators":98,"./_library":100,"./_object-create":111,"./_object-dp":113,"./_object-gopd":116,"./_object-gopn":118,"./_object-gpo":120,"./_property-desc":133,"./_redefine-all":134,"./_set-species":141,"./_species-constructor":145,"./_to-absolute-index":155,"./_to-index":156,"./_to-integer":157,"./_to-length":159,"./_to-object":160,"./_to-primitive":161,"./_typed":164,"./_typed-buffer":163,"./_uid":165,"./_wks":170,"./core.get-iterator-method":174,"./es6.array.iterator":195}],163:[function(require,module,exports){
'use strict';
var global = require('./_global');
var DESCRIPTORS = require('./_descriptors');
var LIBRARY = require('./_library');
var $typed = require('./_typed');
var hide = require('./_hide');
var redefineAll = require('./_redefine-all');
var fails = require('./_fails');
var anInstance = require('./_an-instance');
var toInteger = require('./_to-integer');
var toLength = require('./_to-length');
var toIndex = require('./_to-index');
var gOPN = require('./_object-gopn').f;
var dP = require('./_object-dp').f;
var arrayFill = require('./_array-fill');
var setToStringTag = require('./_set-to-string-tag');
var ARRAY_BUFFER = 'ArrayBuffer';
var DATA_VIEW = 'DataView';
var PROTOTYPE = 'prototype';
var WRONG_LENGTH = 'Wrong length!';
var WRONG_INDEX = 'Wrong index!';
var $ArrayBuffer = global[ARRAY_BUFFER];
var $DataView = global[DATA_VIEW];
var Math = global.Math;
var RangeError = global.RangeError;
// eslint-disable-next-line no-shadow-restricted-names
var Infinity = global.Infinity;
var BaseBuffer = $ArrayBuffer;
var abs = Math.abs;
var pow = Math.pow;
var floor = Math.floor;
var log = Math.log;
var LN2 = Math.LN2;
var BUFFER = 'buffer';
var BYTE_LENGTH = 'byteLength';
var BYTE_OFFSET = 'byteOffset';
var $BUFFER = DESCRIPTORS ? '_b' : BUFFER;
var $LENGTH = DESCRIPTORS ? '_l' : BYTE_LENGTH;
var $OFFSET = DESCRIPTORS ? '_o' : BYTE_OFFSET;

// IEEE754 conversions based on https://github.com/feross/ieee754
function packIEEE754(value, mLen, nBytes) {
  var buffer = new Array(nBytes);
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0;
  var i = 0;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  var e, m, c;
  value = abs(value);
  // eslint-disable-next-line no-self-compare
  if (value != value || value === Infinity) {
    // eslint-disable-next-line no-self-compare
    m = value != value ? 1 : 0;
    e = eMax;
  } else {
    e = floor(log(value) / LN2);
    if (value * (c = pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }
    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * pow(2, eBias - 1) * pow(2, mLen);
      e = 0;
    }
  }
  for (; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8);
  e = e << mLen | m;
  eLen += mLen;
  for (; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8);
  buffer[--i] |= s * 128;
  return buffer;
}
function unpackIEEE754(buffer, mLen, nBytes) {
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = eLen - 7;
  var i = nBytes - 1;
  var s = buffer[i--];
  var e = s & 127;
  var m;
  s >>= 7;
  for (; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8);
  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8);
  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : s ? -Infinity : Infinity;
  } else {
    m = m + pow(2, mLen);
    e = e - eBias;
  } return (s ? -1 : 1) * m * pow(2, e - mLen);
}

function unpackI32(bytes) {
  return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
}
function packI8(it) {
  return [it & 0xff];
}
function packI16(it) {
  return [it & 0xff, it >> 8 & 0xff];
}
function packI32(it) {
  return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
}
function packF64(it) {
  return packIEEE754(it, 52, 8);
}
function packF32(it) {
  return packIEEE754(it, 23, 4);
}

function addGetter(C, key, internal) {
  dP(C[PROTOTYPE], key, { get: function () { return this[internal]; } });
}

function get(view, bytes, index, isLittleEndian) {
  var numIndex = +index;
  var intIndex = toIndex(numIndex);
  if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
  var store = view[$BUFFER]._b;
  var start = intIndex + view[$OFFSET];
  var pack = store.slice(start, start + bytes);
  return isLittleEndian ? pack : pack.reverse();
}
function set(view, bytes, index, conversion, value, isLittleEndian) {
  var numIndex = +index;
  var intIndex = toIndex(numIndex);
  if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
  var store = view[$BUFFER]._b;
  var start = intIndex + view[$OFFSET];
  var pack = conversion(+value);
  for (var i = 0; i < bytes; i++) store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
}

if (!$typed.ABV) {
  $ArrayBuffer = function ArrayBuffer(length) {
    anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
    var byteLength = toIndex(length);
    this._b = arrayFill.call(new Array(byteLength), 0);
    this[$LENGTH] = byteLength;
  };

  $DataView = function DataView(buffer, byteOffset, byteLength) {
    anInstance(this, $DataView, DATA_VIEW);
    anInstance(buffer, $ArrayBuffer, DATA_VIEW);
    var bufferLength = buffer[$LENGTH];
    var offset = toInteger(byteOffset);
    if (offset < 0 || offset > bufferLength) throw RangeError('Wrong offset!');
    byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
    if (offset + byteLength > bufferLength) throw RangeError(WRONG_LENGTH);
    this[$BUFFER] = buffer;
    this[$OFFSET] = offset;
    this[$LENGTH] = byteLength;
  };

  if (DESCRIPTORS) {
    addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
    addGetter($DataView, BUFFER, '_b');
    addGetter($DataView, BYTE_LENGTH, '_l');
    addGetter($DataView, BYTE_OFFSET, '_o');
  }

  redefineAll($DataView[PROTOTYPE], {
    getInt8: function getInt8(byteOffset) {
      return get(this, 1, byteOffset)[0] << 24 >> 24;
    },
    getUint8: function getUint8(byteOffset) {
      return get(this, 1, byteOffset)[0];
    },
    getInt16: function getInt16(byteOffset /* , littleEndian */) {
      var bytes = get(this, 2, byteOffset, arguments[1]);
      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
    },
    getUint16: function getUint16(byteOffset /* , littleEndian */) {
      var bytes = get(this, 2, byteOffset, arguments[1]);
      return bytes[1] << 8 | bytes[0];
    },
    getInt32: function getInt32(byteOffset /* , littleEndian */) {
      return unpackI32(get(this, 4, byteOffset, arguments[1]));
    },
    getUint32: function getUint32(byteOffset /* , littleEndian */) {
      return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
    },
    getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
      return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
    },
    getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
      return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
    },
    setInt8: function setInt8(byteOffset, value) {
      set(this, 1, byteOffset, packI8, value);
    },
    setUint8: function setUint8(byteOffset, value) {
      set(this, 1, byteOffset, packI8, value);
    },
    setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
      set(this, 2, byteOffset, packI16, value, arguments[2]);
    },
    setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
      set(this, 2, byteOffset, packI16, value, arguments[2]);
    },
    setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
      set(this, 4, byteOffset, packI32, value, arguments[2]);
    },
    setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
      set(this, 4, byteOffset, packI32, value, arguments[2]);
    },
    setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
      set(this, 4, byteOffset, packF32, value, arguments[2]);
    },
    setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
      set(this, 8, byteOffset, packF64, value, arguments[2]);
    }
  });
} else {
  if (!fails(function () {
    $ArrayBuffer(1);
  }) || !fails(function () {
    new $ArrayBuffer(-1); // eslint-disable-line no-new
  }) || fails(function () {
    new $ArrayBuffer(); // eslint-disable-line no-new
    new $ArrayBuffer(1.5); // eslint-disable-line no-new
    new $ArrayBuffer(NaN); // eslint-disable-line no-new
    return $ArrayBuffer.name != ARRAY_BUFFER;
  })) {
    $ArrayBuffer = function ArrayBuffer(length) {
      anInstance(this, $ArrayBuffer);
      return new BaseBuffer(toIndex(length));
    };
    var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];
    for (var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j;) {
      if (!((key = keys[j++]) in $ArrayBuffer)) hide($ArrayBuffer, key, BaseBuffer[key]);
    }
    if (!LIBRARY) ArrayBufferProto.constructor = $ArrayBuffer;
  }
  // iOS Safari 7.x bug
  var view = new $DataView(new $ArrayBuffer(2));
  var $setInt8 = $DataView[PROTOTYPE].setInt8;
  view.setInt8(0, 2147483648);
  view.setInt8(1, 2147483649);
  if (view.getInt8(0) || !view.getInt8(1)) redefineAll($DataView[PROTOTYPE], {
    setInt8: function setInt8(byteOffset, value) {
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    },
    setUint8: function setUint8(byteOffset, value) {
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    }
  }, true);
}
setToStringTag($ArrayBuffer, ARRAY_BUFFER);
setToStringTag($DataView, DATA_VIEW);
hide($DataView[PROTOTYPE], $typed.VIEW, true);
exports[ARRAY_BUFFER] = $ArrayBuffer;
exports[DATA_VIEW] = $DataView;

},{"./_an-instance":46,"./_array-fill":49,"./_descriptors":69,"./_fails":75,"./_global":80,"./_hide":82,"./_library":100,"./_object-dp":113,"./_object-gopn":118,"./_redefine-all":134,"./_set-to-string-tag":142,"./_to-index":156,"./_to-integer":157,"./_to-length":159,"./_typed":164}],164:[function(require,module,exports){
var global = require('./_global');
var hide = require('./_hide');
var uid = require('./_uid');
var TYPED = uid('typed_array');
var VIEW = uid('view');
var ABV = !!(global.ArrayBuffer && global.DataView);
var CONSTR = ABV;
var i = 0;
var l = 9;
var Typed;

var TypedArrayConstructors = (
  'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'
).split(',');

while (i < l) {
  if (Typed = global[TypedArrayConstructors[i++]]) {
    hide(Typed.prototype, TYPED, true);
    hide(Typed.prototype, VIEW, true);
  } else CONSTR = false;
}

module.exports = {
  ABV: ABV,
  CONSTR: CONSTR,
  TYPED: TYPED,
  VIEW: VIEW
};

},{"./_global":80,"./_hide":82,"./_uid":165}],165:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],166:[function(require,module,exports){
var global = require('./_global');
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';

},{"./_global":80}],167:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it, TYPE) {
  if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};

},{"./_is-object":91}],168:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var LIBRARY = require('./_library');
var wksExt = require('./_wks-ext');
var defineProperty = require('./_object-dp').f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};

},{"./_core":63,"./_global":80,"./_library":100,"./_object-dp":113,"./_wks-ext":169}],169:[function(require,module,exports){
exports.f = require('./_wks');

},{"./_wks":170}],170:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":80,"./_shared":144,"./_uid":165}],171:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var $export = require('./_export');
var partial = require('./_partial');
// https://esdiscuss.org/topic/promise-returning-delay-function
$export($export.G + $export.F, {
  delay: function delay(time) {
    return new (core.Promise || global.Promise)(function (resolve) {
      setTimeout(partial.call(resolve, true), time);
    });
  }
});

},{"./_core":63,"./_export":73,"./_global":80,"./_partial":129}],172:[function(require,module,exports){
'use strict';
var ctx = require('./_ctx');
var $export = require('./_export');
var createDesc = require('./_property-desc');
var assign = require('./_object-assign');
var create = require('./_object-create');
var getPrototypeOf = require('./_object-gpo');
var getKeys = require('./_object-keys');
var dP = require('./_object-dp');
var keyOf = require('./_keyof');
var aFunction = require('./_a-function');
var forOf = require('./_for-of');
var isIterable = require('./core.is-iterable');
var $iterCreate = require('./_iter-create');
var step = require('./_iter-step');
var isObject = require('./_is-object');
var toIObject = require('./_to-iobject');
var DESCRIPTORS = require('./_descriptors');
var has = require('./_has');

// 0 -> Dict.forEach
// 1 -> Dict.map
// 2 -> Dict.filter
// 3 -> Dict.some
// 4 -> Dict.every
// 5 -> Dict.find
// 6 -> Dict.findKey
// 7 -> Dict.mapPairs
var createDictMethod = function (TYPE) {
  var IS_MAP = TYPE == 1;
  var IS_EVERY = TYPE == 4;
  return function (object, callbackfn, that /* = undefined */) {
    var f = ctx(callbackfn, that, 3);
    var O = toIObject(object);
    var result = IS_MAP || TYPE == 7 || TYPE == 2
          ? new (typeof this == 'function' ? this : Dict)() : undefined;
    var key, val, res;
    for (key in O) if (has(O, key)) {
      val = O[key];
      res = f(val, key, object);
      if (TYPE) {
        if (IS_MAP) result[key] = res;          // map
        else if (res) switch (TYPE) {
          case 2: result[key] = val; break;     // filter
          case 3: return true;                  // some
          case 5: return val;                   // find
          case 6: return key;                   // findKey
          case 7: result[res[0]] = res[1];      // mapPairs
        } else if (IS_EVERY) return false;      // every
      }
    }
    return TYPE == 3 || IS_EVERY ? IS_EVERY : result;
  };
};
var findKey = createDictMethod(6);

var createDictIter = function (kind) {
  return function (it) {
    return new DictIterator(it, kind);
  };
};
var DictIterator = function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._a = getKeys(iterated);   // keys
  this._i = 0;                   // next index
  this._k = kind;                // kind
};
$iterCreate(DictIterator, 'Dict', function () {
  var that = this;
  var O = that._t;
  var keys = that._a;
  var kind = that._k;
  var key;
  do {
    if (that._i >= keys.length) {
      that._t = undefined;
      return step(1);
    }
  } while (!has(O, key = keys[that._i++]));
  if (kind == 'keys') return step(0, key);
  if (kind == 'values') return step(0, O[key]);
  return step(0, [key, O[key]]);
});

function Dict(iterable) {
  var dict = create(null);
  if (iterable != undefined) {
    if (isIterable(iterable)) {
      forOf(iterable, true, function (key, value) {
        dict[key] = value;
      });
    } else assign(dict, iterable);
  }
  return dict;
}
Dict.prototype = null;

function reduce(object, mapfn, init) {
  aFunction(mapfn);
  var O = toIObject(object);
  var keys = getKeys(O);
  var length = keys.length;
  var i = 0;
  var memo, key;
  if (arguments.length < 3) {
    if (!length) throw TypeError('Reduce of empty object with no initial value');
    memo = O[keys[i++]];
  } else memo = Object(init);
  while (length > i) if (has(O, key = keys[i++])) {
    memo = mapfn(memo, O[key], key, object);
  }
  return memo;
}

function includes(object, el) {
  // eslint-disable-next-line no-self-compare
  return (el == el ? keyOf(object, el) : findKey(object, function (it) {
    // eslint-disable-next-line no-self-compare
    return it != it;
  })) !== undefined;
}

function get(object, key) {
  if (has(object, key)) return object[key];
}
function set(object, key, value) {
  if (DESCRIPTORS && key in Object) dP.f(object, key, createDesc(0, value));
  else object[key] = value;
  return object;
}

function isDict(it) {
  return isObject(it) && getPrototypeOf(it) === Dict.prototype;
}

$export($export.G + $export.F, { Dict: Dict });

$export($export.S, 'Dict', {
  keys: createDictIter('keys'),
  values: createDictIter('values'),
  entries: createDictIter('entries'),
  forEach: createDictMethod(0),
  map: createDictMethod(1),
  filter: createDictMethod(2),
  some: createDictMethod(3),
  every: createDictMethod(4),
  find: createDictMethod(5),
  findKey: findKey,
  mapPairs: createDictMethod(7),
  reduce: reduce,
  keyOf: keyOf,
  includes: includes,
  has: has,
  get: get,
  set: set,
  isDict: isDict
});

},{"./_a-function":43,"./_ctx":65,"./_descriptors":69,"./_export":73,"./_for-of":79,"./_has":81,"./_is-object":91,"./_iter-create":94,"./_iter-step":97,"./_keyof":99,"./_object-assign":110,"./_object-create":111,"./_object-dp":113,"./_object-gpo":120,"./_object-keys":122,"./_property-desc":133,"./_to-iobject":158,"./core.is-iterable":176}],173:[function(require,module,exports){
var path = require('./_path');
var $export = require('./_export');

// Placeholder
require('./_core')._ = path._ = path._ || {};

$export($export.P + $export.F, 'Function', { part: require('./_partial') });

},{"./_core":63,"./_export":73,"./_partial":129,"./_path":130}],174:[function(require,module,exports){
var classof = require('./_classof');
var ITERATOR = require('./_wks')('iterator');
var Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};

},{"./_classof":57,"./_core":63,"./_iterators":98,"./_wks":170}],175:[function(require,module,exports){
var anObject = require('./_an-object');
var get = require('./core.get-iterator-method');
module.exports = require('./_core').getIterator = function (it) {
  var iterFn = get(it);
  if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};

},{"./_an-object":47,"./_core":63,"./core.get-iterator-method":174}],176:[function(require,module,exports){
var classof = require('./_classof');
var ITERATOR = require('./_wks')('iterator');
var Iterators = require('./_iterators');
module.exports = require('./_core').isIterable = function (it) {
  var O = Object(it);
  return O[ITERATOR] !== undefined
    || '@@iterator' in O
    // eslint-disable-next-line no-prototype-builtins
    || Iterators.hasOwnProperty(classof(O));
};

},{"./_classof":57,"./_core":63,"./_iterators":98,"./_wks":170}],177:[function(require,module,exports){
'use strict';
require('./_iter-define')(Number, 'Number', function (iterated) {
  this._l = +iterated;
  this._i = 0;
}, function () {
  var i = this._i++;
  var done = !(i < this._l);
  return { done: done, value: done ? undefined : i };
});

},{"./_iter-define":95}],178:[function(require,module,exports){
var $export = require('./_export');

$export($export.S + $export.F, 'Object', { classof: require('./_classof') });

},{"./_classof":57,"./_export":73}],179:[function(require,module,exports){
var $export = require('./_export');
var define = require('./_object-define');

$export($export.S + $export.F, 'Object', { define: define });

},{"./_export":73,"./_object-define":112}],180:[function(require,module,exports){
var $export = require('./_export');

$export($export.S + $export.F, 'Object', { isObject: require('./_is-object') });

},{"./_export":73,"./_is-object":91}],181:[function(require,module,exports){
var $export = require('./_export');
var define = require('./_object-define');
var create = require('./_object-create');

$export($export.S + $export.F, 'Object', {
  make: function (proto, mixin) {
    return define(create(proto), mixin);
  }
});

},{"./_export":73,"./_object-create":111,"./_object-define":112}],182:[function(require,module,exports){
// https://github.com/benjamingr/RexExp.escape
var $export = require('./_export');
var $re = require('./_replacer')(/[\\^$*+?.()|[\]{}]/g, '\\$&');

$export($export.S, 'RegExp', { escape: function escape(it) { return $re(it); } });

},{"./_export":73,"./_replacer":136}],183:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $re = require('./_replacer')(/[&<>"']/g, {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
});

$export($export.P + $export.F, 'String', { escapeHTML: function escapeHTML() { return $re(this); } });

},{"./_export":73,"./_replacer":136}],184:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $re = require('./_replacer')(/&(?:amp|lt|gt|quot|apos);/g, {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'"
});

$export($export.P + $export.F, 'String', { unescapeHTML: function unescapeHTML() { return $re(this); } });

},{"./_export":73,"./_replacer":136}],185:[function(require,module,exports){
// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
var $export = require('./_export');

$export($export.P, 'Array', { copyWithin: require('./_array-copy-within') });

require('./_add-to-unscopables')('copyWithin');

},{"./_add-to-unscopables":45,"./_array-copy-within":48,"./_export":73}],186:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $every = require('./_array-methods')(4);

$export($export.P + $export.F * !require('./_strict-method')([].every, true), 'Array', {
  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
  every: function every(callbackfn /* , thisArg */) {
    return $every(this, callbackfn, arguments[1]);
  }
});

},{"./_array-methods":52,"./_export":73,"./_strict-method":146}],187:[function(require,module,exports){
// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
var $export = require('./_export');

$export($export.P, 'Array', { fill: require('./_array-fill') });

require('./_add-to-unscopables')('fill');

},{"./_add-to-unscopables":45,"./_array-fill":49,"./_export":73}],188:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $filter = require('./_array-methods')(2);

$export($export.P + $export.F * !require('./_strict-method')([].filter, true), 'Array', {
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter(this, callbackfn, arguments[1]);
  }
});

},{"./_array-methods":52,"./_export":73,"./_strict-method":146}],189:[function(require,module,exports){
'use strict';
// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var $export = require('./_export');
var $find = require('./_array-methods')(6);
var KEY = 'findIndex';
var forced = true;
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
require('./_add-to-unscopables')(KEY);

},{"./_add-to-unscopables":45,"./_array-methods":52,"./_export":73}],190:[function(require,module,exports){
'use strict';
// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var $export = require('./_export');
var $find = require('./_array-methods')(5);
var KEY = 'find';
var forced = true;
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  find: function find(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
require('./_add-to-unscopables')(KEY);

},{"./_add-to-unscopables":45,"./_array-methods":52,"./_export":73}],191:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $forEach = require('./_array-methods')(0);
var STRICT = require('./_strict-method')([].forEach, true);

$export($export.P + $export.F * !STRICT, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: function forEach(callbackfn /* , thisArg */) {
    return $forEach(this, callbackfn, arguments[1]);
  }
});

},{"./_array-methods":52,"./_export":73,"./_strict-method":146}],192:[function(require,module,exports){
'use strict';
var ctx = require('./_ctx');
var $export = require('./_export');
var toObject = require('./_to-object');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var toLength = require('./_to-length');
var createProperty = require('./_create-property');
var getIterFn = require('./core.get-iterator-method');

$export($export.S + $export.F * !require('./_iter-detect')(function (iter) { Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = getIterFn(O);
    var length, result, step, iterator;
    if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for (result = new C(length); length > index; index++) {
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"./_create-property":64,"./_ctx":65,"./_export":73,"./_is-array-iter":88,"./_iter-call":93,"./_iter-detect":96,"./_to-length":159,"./_to-object":160,"./core.get-iterator-method":174}],193:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $indexOf = require('./_array-includes')(false);
var $native = [].indexOf;
var NEGATIVE_ZERO = !!$native && 1 / [1].indexOf(1, -0) < 0;

$export($export.P + $export.F * (NEGATIVE_ZERO || !require('./_strict-method')($native)), 'Array', {
  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
    return NEGATIVE_ZERO
      // convert -0 to +0
      ? $native.apply(this, arguments) || 0
      : $indexOf(this, searchElement, arguments[1]);
  }
});

},{"./_array-includes":51,"./_export":73,"./_strict-method":146}],194:[function(require,module,exports){
// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
var $export = require('./_export');

$export($export.S, 'Array', { isArray: require('./_is-array') });

},{"./_export":73,"./_is-array":89}],195:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables');
var step = require('./_iter-step');
var Iterators = require('./_iterators');
var toIObject = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"./_add-to-unscopables":45,"./_iter-define":95,"./_iter-step":97,"./_iterators":98,"./_to-iobject":158}],196:[function(require,module,exports){
'use strict';
// 22.1.3.13 Array.prototype.join(separator)
var $export = require('./_export');
var toIObject = require('./_to-iobject');
var arrayJoin = [].join;

// fallback for not array-like strings
$export($export.P + $export.F * (require('./_iobject') != Object || !require('./_strict-method')(arrayJoin)), 'Array', {
  join: function join(separator) {
    return arrayJoin.call(toIObject(this), separator === undefined ? ',' : separator);
  }
});

},{"./_export":73,"./_iobject":87,"./_strict-method":146,"./_to-iobject":158}],197:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var toIObject = require('./_to-iobject');
var toInteger = require('./_to-integer');
var toLength = require('./_to-length');
var $native = [].lastIndexOf;
var NEGATIVE_ZERO = !!$native && 1 / [1].lastIndexOf(1, -0) < 0;

$export($export.P + $export.F * (NEGATIVE_ZERO || !require('./_strict-method')($native)), 'Array', {
  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
  lastIndexOf: function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
    // convert -0 to +0
    if (NEGATIVE_ZERO) return $native.apply(this, arguments) || 0;
    var O = toIObject(this);
    var length = toLength(O.length);
    var index = length - 1;
    if (arguments.length > 1) index = Math.min(index, toInteger(arguments[1]));
    if (index < 0) index = length + index;
    for (;index >= 0; index--) if (index in O) if (O[index] === searchElement) return index || 0;
    return -1;
  }
});

},{"./_export":73,"./_strict-method":146,"./_to-integer":157,"./_to-iobject":158,"./_to-length":159}],198:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $map = require('./_array-methods')(1);

$export($export.P + $export.F * !require('./_strict-method')([].map, true), 'Array', {
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: function map(callbackfn /* , thisArg */) {
    return $map(this, callbackfn, arguments[1]);
  }
});

},{"./_array-methods":52,"./_export":73,"./_strict-method":146}],199:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var createProperty = require('./_create-property');

// WebKit Array.of isn't generic
$export($export.S + $export.F * require('./_fails')(function () {
  function F() { /* empty */ }
  return !(Array.of.call(F) instanceof F);
}), 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function of(/* ...args */) {
    var index = 0;
    var aLen = arguments.length;
    var result = new (typeof this == 'function' ? this : Array)(aLen);
    while (aLen > index) createProperty(result, index, arguments[index++]);
    result.length = aLen;
    return result;
  }
});

},{"./_create-property":64,"./_export":73,"./_fails":75}],200:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $reduce = require('./_array-reduce');

$export($export.P + $export.F * !require('./_strict-method')([].reduceRight, true), 'Array', {
  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
  reduceRight: function reduceRight(callbackfn /* , initialValue */) {
    return $reduce(this, callbackfn, arguments.length, arguments[1], true);
  }
});

},{"./_array-reduce":53,"./_export":73,"./_strict-method":146}],201:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $reduce = require('./_array-reduce');

$export($export.P + $export.F * !require('./_strict-method')([].reduce, true), 'Array', {
  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
  reduce: function reduce(callbackfn /* , initialValue */) {
    return $reduce(this, callbackfn, arguments.length, arguments[1], false);
  }
});

},{"./_array-reduce":53,"./_export":73,"./_strict-method":146}],202:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var html = require('./_html');
var cof = require('./_cof');
var toAbsoluteIndex = require('./_to-absolute-index');
var toLength = require('./_to-length');
var arraySlice = [].slice;

// fallback for not array-like ES3 strings and DOM objects
$export($export.P + $export.F * require('./_fails')(function () {
  if (html) arraySlice.call(html);
}), 'Array', {
  slice: function slice(begin, end) {
    var len = toLength(this.length);
    var klass = cof(this);
    end = end === undefined ? len : end;
    if (klass == 'Array') return arraySlice.call(this, begin, end);
    var start = toAbsoluteIndex(begin, len);
    var upTo = toAbsoluteIndex(end, len);
    var size = toLength(upTo - start);
    var cloned = new Array(size);
    var i = 0;
    for (; i < size; i++) cloned[i] = klass == 'String'
      ? this.charAt(start + i)
      : this[start + i];
    return cloned;
  }
});

},{"./_cof":58,"./_export":73,"./_fails":75,"./_html":83,"./_to-absolute-index":155,"./_to-length":159}],203:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $some = require('./_array-methods')(3);

$export($export.P + $export.F * !require('./_strict-method')([].some, true), 'Array', {
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: function some(callbackfn /* , thisArg */) {
    return $some(this, callbackfn, arguments[1]);
  }
});

},{"./_array-methods":52,"./_export":73,"./_strict-method":146}],204:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var aFunction = require('./_a-function');
var toObject = require('./_to-object');
var fails = require('./_fails');
var $sort = [].sort;
var test = [1, 2, 3];

$export($export.P + $export.F * (fails(function () {
  // IE8-
  test.sort(undefined);
}) || !fails(function () {
  // V8 bug
  test.sort(null);
  // Old WebKit
}) || !require('./_strict-method')($sort)), 'Array', {
  // 22.1.3.25 Array.prototype.sort(comparefn)
  sort: function sort(comparefn) {
    return comparefn === undefined
      ? $sort.call(toObject(this))
      : $sort.call(toObject(this), aFunction(comparefn));
  }
});

},{"./_a-function":43,"./_export":73,"./_fails":75,"./_strict-method":146,"./_to-object":160}],205:[function(require,module,exports){
require('./_set-species')('Array');

},{"./_set-species":141}],206:[function(require,module,exports){
// 20.3.3.1 / 15.9.4.4 Date.now()
var $export = require('./_export');

$export($export.S, 'Date', { now: function () { return new Date().getTime(); } });

},{"./_export":73}],207:[function(require,module,exports){
// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
var $export = require('./_export');
var toISOString = require('./_date-to-iso-string');

// PhantomJS / old WebKit has a broken implementations
$export($export.P + $export.F * (Date.prototype.toISOString !== toISOString), 'Date', {
  toISOString: toISOString
});

},{"./_date-to-iso-string":66,"./_export":73}],208:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var toObject = require('./_to-object');
var toPrimitive = require('./_to-primitive');

$export($export.P + $export.F * require('./_fails')(function () {
  return new Date(NaN).toJSON() !== null
    || Date.prototype.toJSON.call({ toISOString: function () { return 1; } }) !== 1;
}), 'Date', {
  // eslint-disable-next-line no-unused-vars
  toJSON: function toJSON(key) {
    var O = toObject(this);
    var pv = toPrimitive(O);
    return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
  }
});

},{"./_export":73,"./_fails":75,"./_to-object":160,"./_to-primitive":161}],209:[function(require,module,exports){
var TO_PRIMITIVE = require('./_wks')('toPrimitive');
var proto = Date.prototype;

if (!(TO_PRIMITIVE in proto)) require('./_hide')(proto, TO_PRIMITIVE, require('./_date-to-primitive'));

},{"./_date-to-primitive":67,"./_hide":82,"./_wks":170}],210:[function(require,module,exports){
var DateProto = Date.prototype;
var INVALID_DATE = 'Invalid Date';
var TO_STRING = 'toString';
var $toString = DateProto[TO_STRING];
var getTime = DateProto.getTime;
if (new Date(NaN) + '' != INVALID_DATE) {
  require('./_redefine')(DateProto, TO_STRING, function toString() {
    var value = getTime.call(this);
    // eslint-disable-next-line no-self-compare
    return value === value ? $toString.call(this) : INVALID_DATE;
  });
}

},{"./_redefine":135}],211:[function(require,module,exports){
// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
var $export = require('./_export');

$export($export.P, 'Function', { bind: require('./_bind') });

},{"./_bind":56,"./_export":73}],212:[function(require,module,exports){
'use strict';
var isObject = require('./_is-object');
var getPrototypeOf = require('./_object-gpo');
var HAS_INSTANCE = require('./_wks')('hasInstance');
var FunctionProto = Function.prototype;
// 19.2.3.6 Function.prototype[@@hasInstance](V)
if (!(HAS_INSTANCE in FunctionProto)) require('./_object-dp').f(FunctionProto, HAS_INSTANCE, { value: function (O) {
  if (typeof this != 'function' || !isObject(O)) return false;
  if (!isObject(this.prototype)) return O instanceof this;
  // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
  while (O = getPrototypeOf(O)) if (this.prototype === O) return true;
  return false;
} });

},{"./_is-object":91,"./_object-dp":113,"./_object-gpo":120,"./_wks":170}],213:[function(require,module,exports){
var dP = require('./_object-dp').f;
var FProto = Function.prototype;
var nameRE = /^\s*function ([^ (]*)/;
var NAME = 'name';

// 19.2.4.2 name
NAME in FProto || require('./_descriptors') && dP(FProto, NAME, {
  configurable: true,
  get: function () {
    try {
      return ('' + this).match(nameRE)[1];
    } catch (e) {
      return '';
    }
  }
});

},{"./_descriptors":69,"./_object-dp":113}],214:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');
var validate = require('./_validate-collection');
var MAP = 'Map';

// 23.1 Map Objects
module.exports = require('./_collection')(MAP, function (get) {
  return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key) {
    var entry = strong.getEntry(validate(this, MAP), key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value) {
    return strong.def(validate(this, MAP), key === 0 ? 0 : key, value);
  }
}, strong, true);

},{"./_collection":62,"./_collection-strong":59,"./_validate-collection":167}],215:[function(require,module,exports){
// 20.2.2.3 Math.acosh(x)
var $export = require('./_export');
var log1p = require('./_math-log1p');
var sqrt = Math.sqrt;
var $acosh = Math.acosh;

$export($export.S + $export.F * !($acosh
  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
  && Math.floor($acosh(Number.MAX_VALUE)) == 710
  // Tor Browser bug: Math.acosh(Infinity) -> NaN
  && $acosh(Infinity) == Infinity
), 'Math', {
  acosh: function acosh(x) {
    return (x = +x) < 1 ? NaN : x > 94906265.62425156
      ? Math.log(x) + Math.LN2
      : log1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
  }
});

},{"./_export":73,"./_math-log1p":103}],216:[function(require,module,exports){
// 20.2.2.5 Math.asinh(x)
var $export = require('./_export');
var $asinh = Math.asinh;

function asinh(x) {
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : Math.log(x + Math.sqrt(x * x + 1));
}

// Tor Browser bug: Math.asinh(0) -> -0
$export($export.S + $export.F * !($asinh && 1 / $asinh(0) > 0), 'Math', { asinh: asinh });

},{"./_export":73}],217:[function(require,module,exports){
// 20.2.2.7 Math.atanh(x)
var $export = require('./_export');
var $atanh = Math.atanh;

// Tor Browser bug: Math.atanh(-0) -> 0
$export($export.S + $export.F * !($atanh && 1 / $atanh(-0) < 0), 'Math', {
  atanh: function atanh(x) {
    return (x = +x) == 0 ? x : Math.log((1 + x) / (1 - x)) / 2;
  }
});

},{"./_export":73}],218:[function(require,module,exports){
// 20.2.2.9 Math.cbrt(x)
var $export = require('./_export');
var sign = require('./_math-sign');

$export($export.S, 'Math', {
  cbrt: function cbrt(x) {
    return sign(x = +x) * Math.pow(Math.abs(x), 1 / 3);
  }
});

},{"./_export":73,"./_math-sign":105}],219:[function(require,module,exports){
// 20.2.2.11 Math.clz32(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  clz32: function clz32(x) {
    return (x >>>= 0) ? 31 - Math.floor(Math.log(x + 0.5) * Math.LOG2E) : 32;
  }
});

},{"./_export":73}],220:[function(require,module,exports){
// 20.2.2.12 Math.cosh(x)
var $export = require('./_export');
var exp = Math.exp;

$export($export.S, 'Math', {
  cosh: function cosh(x) {
    return (exp(x = +x) + exp(-x)) / 2;
  }
});

},{"./_export":73}],221:[function(require,module,exports){
// 20.2.2.14 Math.expm1(x)
var $export = require('./_export');
var $expm1 = require('./_math-expm1');

$export($export.S + $export.F * ($expm1 != Math.expm1), 'Math', { expm1: $expm1 });

},{"./_export":73,"./_math-expm1":101}],222:[function(require,module,exports){
// 20.2.2.16 Math.fround(x)
var $export = require('./_export');

$export($export.S, 'Math', { fround: require('./_math-fround') });

},{"./_export":73,"./_math-fround":102}],223:[function(require,module,exports){
// 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
var $export = require('./_export');
var abs = Math.abs;

$export($export.S, 'Math', {
  hypot: function hypot(value1, value2) { // eslint-disable-line no-unused-vars
    var sum = 0;
    var i = 0;
    var aLen = arguments.length;
    var larg = 0;
    var arg, div;
    while (i < aLen) {
      arg = abs(arguments[i++]);
      if (larg < arg) {
        div = larg / arg;
        sum = sum * div * div + 1;
        larg = arg;
      } else if (arg > 0) {
        div = arg / larg;
        sum += div * div;
      } else sum += arg;
    }
    return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
  }
});

},{"./_export":73}],224:[function(require,module,exports){
// 20.2.2.18 Math.imul(x, y)
var $export = require('./_export');
var $imul = Math.imul;

// some WebKit versions fails with big numbers, some has wrong arity
$export($export.S + $export.F * require('./_fails')(function () {
  return $imul(0xffffffff, 5) != -5 || $imul.length != 2;
}), 'Math', {
  imul: function imul(x, y) {
    var UINT16 = 0xffff;
    var xn = +x;
    var yn = +y;
    var xl = UINT16 & xn;
    var yl = UINT16 & yn;
    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
  }
});

},{"./_export":73,"./_fails":75}],225:[function(require,module,exports){
// 20.2.2.21 Math.log10(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  log10: function log10(x) {
    return Math.log(x) * Math.LOG10E;
  }
});

},{"./_export":73}],226:[function(require,module,exports){
// 20.2.2.20 Math.log1p(x)
var $export = require('./_export');

$export($export.S, 'Math', { log1p: require('./_math-log1p') });

},{"./_export":73,"./_math-log1p":103}],227:[function(require,module,exports){
// 20.2.2.22 Math.log2(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  log2: function log2(x) {
    return Math.log(x) / Math.LN2;
  }
});

},{"./_export":73}],228:[function(require,module,exports){
// 20.2.2.28 Math.sign(x)
var $export = require('./_export');

$export($export.S, 'Math', { sign: require('./_math-sign') });

},{"./_export":73,"./_math-sign":105}],229:[function(require,module,exports){
// 20.2.2.30 Math.sinh(x)
var $export = require('./_export');
var expm1 = require('./_math-expm1');
var exp = Math.exp;

// V8 near Chromium 38 has a problem with very small numbers
$export($export.S + $export.F * require('./_fails')(function () {
  return !Math.sinh(-2e-17) != -2e-17;
}), 'Math', {
  sinh: function sinh(x) {
    return Math.abs(x = +x) < 1
      ? (expm1(x) - expm1(-x)) / 2
      : (exp(x - 1) - exp(-x - 1)) * (Math.E / 2);
  }
});

},{"./_export":73,"./_fails":75,"./_math-expm1":101}],230:[function(require,module,exports){
// 20.2.2.33 Math.tanh(x)
var $export = require('./_export');
var expm1 = require('./_math-expm1');
var exp = Math.exp;

$export($export.S, 'Math', {
  tanh: function tanh(x) {
    var a = expm1(x = +x);
    var b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  }
});

},{"./_export":73,"./_math-expm1":101}],231:[function(require,module,exports){
// 20.2.2.34 Math.trunc(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  trunc: function trunc(it) {
    return (it > 0 ? Math.floor : Math.ceil)(it);
  }
});

},{"./_export":73}],232:[function(require,module,exports){
'use strict';
var global = require('./_global');
var has = require('./_has');
var cof = require('./_cof');
var inheritIfRequired = require('./_inherit-if-required');
var toPrimitive = require('./_to-primitive');
var fails = require('./_fails');
var gOPN = require('./_object-gopn').f;
var gOPD = require('./_object-gopd').f;
var dP = require('./_object-dp').f;
var $trim = require('./_string-trim').trim;
var NUMBER = 'Number';
var $Number = global[NUMBER];
var Base = $Number;
var proto = $Number.prototype;
// Opera ~12 has broken Object#toString
var BROKEN_COF = cof(require('./_object-create')(proto)) == NUMBER;
var TRIM = 'trim' in String.prototype;

// 7.1.3 ToNumber(argument)
var toNumber = function (argument) {
  var it = toPrimitive(argument, false);
  if (typeof it == 'string' && it.length > 2) {
    it = TRIM ? it.trim() : $trim(it, 3);
    var first = it.charCodeAt(0);
    var third, radix, maxCode;
    if (first === 43 || first === 45) {
      third = it.charCodeAt(2);
      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if (first === 48) {
      switch (it.charCodeAt(1)) {
        case 66: case 98: radix = 2; maxCode = 49; break; // fast equal /^0b[01]+$/i
        case 79: case 111: radix = 8; maxCode = 55; break; // fast equal /^0o[0-7]+$/i
        default: return +it;
      }
      for (var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++) {
        code = digits.charCodeAt(i);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if (code < 48 || code > maxCode) return NaN;
      } return parseInt(digits, radix);
    }
  } return +it;
};

if (!$Number(' 0o1') || !$Number('0b1') || $Number('+0x1')) {
  $Number = function Number(value) {
    var it = arguments.length < 1 ? 0 : value;
    var that = this;
    return that instanceof $Number
      // check on 1..constructor(foo) case
      && (BROKEN_COF ? fails(function () { proto.valueOf.call(that); }) : cof(that) != NUMBER)
        ? inheritIfRequired(new Base(toNumber(it)), that, $Number) : toNumber(it);
  };
  for (var keys = require('./_descriptors') ? gOPN(Base) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES6 (in case, if modules with ES6 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
  ).split(','), j = 0, key; keys.length > j; j++) {
    if (has(Base, key = keys[j]) && !has($Number, key)) {
      dP($Number, key, gOPD(Base, key));
    }
  }
  $Number.prototype = proto;
  proto.constructor = $Number;
  require('./_redefine')(global, NUMBER, $Number);
}

},{"./_cof":58,"./_descriptors":69,"./_fails":75,"./_global":80,"./_has":81,"./_inherit-if-required":85,"./_object-create":111,"./_object-dp":113,"./_object-gopd":116,"./_object-gopn":118,"./_redefine":135,"./_string-trim":152,"./_to-primitive":161}],233:[function(require,module,exports){
// 20.1.2.1 Number.EPSILON
var $export = require('./_export');

$export($export.S, 'Number', { EPSILON: Math.pow(2, -52) });

},{"./_export":73}],234:[function(require,module,exports){
// 20.1.2.2 Number.isFinite(number)
var $export = require('./_export');
var _isFinite = require('./_global').isFinite;

$export($export.S, 'Number', {
  isFinite: function isFinite(it) {
    return typeof it == 'number' && _isFinite(it);
  }
});

},{"./_export":73,"./_global":80}],235:[function(require,module,exports){
// 20.1.2.3 Number.isInteger(number)
var $export = require('./_export');

$export($export.S, 'Number', { isInteger: require('./_is-integer') });

},{"./_export":73,"./_is-integer":90}],236:[function(require,module,exports){
// 20.1.2.4 Number.isNaN(number)
var $export = require('./_export');

$export($export.S, 'Number', {
  isNaN: function isNaN(number) {
    // eslint-disable-next-line no-self-compare
    return number != number;
  }
});

},{"./_export":73}],237:[function(require,module,exports){
// 20.1.2.5 Number.isSafeInteger(number)
var $export = require('./_export');
var isInteger = require('./_is-integer');
var abs = Math.abs;

$export($export.S, 'Number', {
  isSafeInteger: function isSafeInteger(number) {
    return isInteger(number) && abs(number) <= 0x1fffffffffffff;
  }
});

},{"./_export":73,"./_is-integer":90}],238:[function(require,module,exports){
// 20.1.2.6 Number.MAX_SAFE_INTEGER
var $export = require('./_export');

$export($export.S, 'Number', { MAX_SAFE_INTEGER: 0x1fffffffffffff });

},{"./_export":73}],239:[function(require,module,exports){
// 20.1.2.10 Number.MIN_SAFE_INTEGER
var $export = require('./_export');

$export($export.S, 'Number', { MIN_SAFE_INTEGER: -0x1fffffffffffff });

},{"./_export":73}],240:[function(require,module,exports){
var $export = require('./_export');
var $parseFloat = require('./_parse-float');
// 20.1.2.12 Number.parseFloat(string)
$export($export.S + $export.F * (Number.parseFloat != $parseFloat), 'Number', { parseFloat: $parseFloat });

},{"./_export":73,"./_parse-float":127}],241:[function(require,module,exports){
var $export = require('./_export');
var $parseInt = require('./_parse-int');
// 20.1.2.13 Number.parseInt(string, radix)
$export($export.S + $export.F * (Number.parseInt != $parseInt), 'Number', { parseInt: $parseInt });

},{"./_export":73,"./_parse-int":128}],242:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var toInteger = require('./_to-integer');
var aNumberValue = require('./_a-number-value');
var repeat = require('./_string-repeat');
var $toFixed = 1.0.toFixed;
var floor = Math.floor;
var data = [0, 0, 0, 0, 0, 0];
var ERROR = 'Number.toFixed: incorrect invocation!';
var ZERO = '0';

var multiply = function (n, c) {
  var i = -1;
  var c2 = c;
  while (++i < 6) {
    c2 += n * data[i];
    data[i] = c2 % 1e7;
    c2 = floor(c2 / 1e7);
  }
};
var divide = function (n) {
  var i = 6;
  var c = 0;
  while (--i >= 0) {
    c += data[i];
    data[i] = floor(c / n);
    c = (c % n) * 1e7;
  }
};
var numToString = function () {
  var i = 6;
  var s = '';
  while (--i >= 0) {
    if (s !== '' || i === 0 || data[i] !== 0) {
      var t = String(data[i]);
      s = s === '' ? t : s + repeat.call(ZERO, 7 - t.length) + t;
    }
  } return s;
};
var pow = function (x, n, acc) {
  return n === 0 ? acc : n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc);
};
var log = function (x) {
  var n = 0;
  var x2 = x;
  while (x2 >= 4096) {
    n += 12;
    x2 /= 4096;
  }
  while (x2 >= 2) {
    n += 1;
    x2 /= 2;
  } return n;
};

$export($export.P + $export.F * (!!$toFixed && (
  0.00008.toFixed(3) !== '0.000' ||
  0.9.toFixed(0) !== '1' ||
  1.255.toFixed(2) !== '1.25' ||
  1000000000000000128.0.toFixed(0) !== '1000000000000000128'
) || !require('./_fails')(function () {
  // V8 ~ Android 4.3-
  $toFixed.call({});
})), 'Number', {
  toFixed: function toFixed(fractionDigits) {
    var x = aNumberValue(this, ERROR);
    var f = toInteger(fractionDigits);
    var s = '';
    var m = ZERO;
    var e, z, j, k;
    if (f < 0 || f > 20) throw RangeError(ERROR);
    // eslint-disable-next-line no-self-compare
    if (x != x) return 'NaN';
    if (x <= -1e21 || x >= 1e21) return String(x);
    if (x < 0) {
      s = '-';
      x = -x;
    }
    if (x > 1e-21) {
      e = log(x * pow(2, 69, 1)) - 69;
      z = e < 0 ? x * pow(2, -e, 1) : x / pow(2, e, 1);
      z *= 0x10000000000000;
      e = 52 - e;
      if (e > 0) {
        multiply(0, z);
        j = f;
        while (j >= 7) {
          multiply(1e7, 0);
          j -= 7;
        }
        multiply(pow(10, j, 1), 0);
        j = e - 1;
        while (j >= 23) {
          divide(1 << 23);
          j -= 23;
        }
        divide(1 << j);
        multiply(1, 1);
        divide(2);
        m = numToString();
      } else {
        multiply(0, z);
        multiply(1 << -e, 0);
        m = numToString() + repeat.call(ZERO, f);
      }
    }
    if (f > 0) {
      k = m.length;
      m = s + (k <= f ? '0.' + repeat.call(ZERO, f - k) + m : m.slice(0, k - f) + '.' + m.slice(k - f));
    } else {
      m = s + m;
    } return m;
  }
});

},{"./_a-number-value":44,"./_export":73,"./_fails":75,"./_string-repeat":151,"./_to-integer":157}],243:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $fails = require('./_fails');
var aNumberValue = require('./_a-number-value');
var $toPrecision = 1.0.toPrecision;

$export($export.P + $export.F * ($fails(function () {
  // IE7-
  return $toPrecision.call(1, undefined) !== '1';
}) || !$fails(function () {
  // V8 ~ Android 4.3-
  $toPrecision.call({});
})), 'Number', {
  toPrecision: function toPrecision(precision) {
    var that = aNumberValue(this, 'Number#toPrecision: incorrect invocation!');
    return precision === undefined ? $toPrecision.call(that) : $toPrecision.call(that, precision);
  }
});

},{"./_a-number-value":44,"./_export":73,"./_fails":75}],244:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./_export');

$export($export.S + $export.F, 'Object', { assign: require('./_object-assign') });

},{"./_export":73,"./_object-assign":110}],245:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', { create: require('./_object-create') });

},{"./_export":73,"./_object-create":111}],246:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperties: require('./_object-dps') });

},{"./_descriptors":69,"./_export":73,"./_object-dps":114}],247:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperty: require('./_object-dp').f });

},{"./_descriptors":69,"./_export":73,"./_object-dp":113}],248:[function(require,module,exports){
// 19.1.2.5 Object.freeze(O)
var isObject = require('./_is-object');
var meta = require('./_meta').onFreeze;

require('./_object-sap')('freeze', function ($freeze) {
  return function freeze(it) {
    return $freeze && isObject(it) ? $freeze(meta(it)) : it;
  };
});

},{"./_is-object":91,"./_meta":106,"./_object-sap":124}],249:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = require('./_to-iobject');
var $getOwnPropertyDescriptor = require('./_object-gopd').f;

require('./_object-sap')('getOwnPropertyDescriptor', function () {
  return function getOwnPropertyDescriptor(it, key) {
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});

},{"./_object-gopd":116,"./_object-sap":124,"./_to-iobject":158}],250:[function(require,module,exports){
// 19.1.2.7 Object.getOwnPropertyNames(O)
require('./_object-sap')('getOwnPropertyNames', function () {
  return require('./_object-gopn-ext').f;
});

},{"./_object-gopn-ext":117,"./_object-sap":124}],251:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = require('./_to-object');
var $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return $getPrototypeOf(toObject(it));
  };
});

},{"./_object-gpo":120,"./_object-sap":124,"./_to-object":160}],252:[function(require,module,exports){
// 19.1.2.11 Object.isExtensible(O)
var isObject = require('./_is-object');

require('./_object-sap')('isExtensible', function ($isExtensible) {
  return function isExtensible(it) {
    return isObject(it) ? $isExtensible ? $isExtensible(it) : true : false;
  };
});

},{"./_is-object":91,"./_object-sap":124}],253:[function(require,module,exports){
// 19.1.2.12 Object.isFrozen(O)
var isObject = require('./_is-object');

require('./_object-sap')('isFrozen', function ($isFrozen) {
  return function isFrozen(it) {
    return isObject(it) ? $isFrozen ? $isFrozen(it) : false : true;
  };
});

},{"./_is-object":91,"./_object-sap":124}],254:[function(require,module,exports){
// 19.1.2.13 Object.isSealed(O)
var isObject = require('./_is-object');

require('./_object-sap')('isSealed', function ($isSealed) {
  return function isSealed(it) {
    return isObject(it) ? $isSealed ? $isSealed(it) : false : true;
  };
});

},{"./_is-object":91,"./_object-sap":124}],255:[function(require,module,exports){
// 19.1.3.10 Object.is(value1, value2)
var $export = require('./_export');
$export($export.S, 'Object', { is: require('./_same-value') });

},{"./_export":73,"./_same-value":137}],256:[function(require,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = require('./_to-object');
var $keys = require('./_object-keys');

require('./_object-sap')('keys', function () {
  return function keys(it) {
    return $keys(toObject(it));
  };
});

},{"./_object-keys":122,"./_object-sap":124,"./_to-object":160}],257:[function(require,module,exports){
// 19.1.2.15 Object.preventExtensions(O)
var isObject = require('./_is-object');
var meta = require('./_meta').onFreeze;

require('./_object-sap')('preventExtensions', function ($preventExtensions) {
  return function preventExtensions(it) {
    return $preventExtensions && isObject(it) ? $preventExtensions(meta(it)) : it;
  };
});

},{"./_is-object":91,"./_meta":106,"./_object-sap":124}],258:[function(require,module,exports){
// 19.1.2.17 Object.seal(O)
var isObject = require('./_is-object');
var meta = require('./_meta').onFreeze;

require('./_object-sap')('seal', function ($seal) {
  return function seal(it) {
    return $seal && isObject(it) ? $seal(meta(it)) : it;
  };
});

},{"./_is-object":91,"./_meta":106,"./_object-sap":124}],259:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', { setPrototypeOf: require('./_set-proto').set });

},{"./_export":73,"./_set-proto":140}],260:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var classof = require('./_classof');
var test = {};
test[require('./_wks')('toStringTag')] = 'z';
if (test + '' != '[object z]') {
  require('./_redefine')(Object.prototype, 'toString', function toString() {
    return '[object ' + classof(this) + ']';
  }, true);
}

},{"./_classof":57,"./_redefine":135,"./_wks":170}],261:[function(require,module,exports){
var $export = require('./_export');
var $parseFloat = require('./_parse-float');
// 18.2.4 parseFloat(string)
$export($export.G + $export.F * (parseFloat != $parseFloat), { parseFloat: $parseFloat });

},{"./_export":73,"./_parse-float":127}],262:[function(require,module,exports){
var $export = require('./_export');
var $parseInt = require('./_parse-int');
// 18.2.5 parseInt(string, radix)
$export($export.G + $export.F * (parseInt != $parseInt), { parseInt: $parseInt });

},{"./_export":73,"./_parse-int":128}],263:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var global = require('./_global');
var ctx = require('./_ctx');
var classof = require('./_classof');
var $export = require('./_export');
var isObject = require('./_is-object');
var aFunction = require('./_a-function');
var anInstance = require('./_an-instance');
var forOf = require('./_for-of');
var speciesConstructor = require('./_species-constructor');
var task = require('./_task').set;
var microtask = require('./_microtask')();
var newPromiseCapabilityModule = require('./_new-promise-capability');
var perform = require('./_perform');
var promiseResolve = require('./_promise-resolve');
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = require('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
Wrapper = require('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});

},{"./_a-function":43,"./_an-instance":46,"./_classof":57,"./_core":63,"./_ctx":65,"./_export":73,"./_for-of":79,"./_global":80,"./_is-object":91,"./_iter-detect":96,"./_library":100,"./_microtask":108,"./_new-promise-capability":109,"./_perform":131,"./_promise-resolve":132,"./_redefine-all":134,"./_set-species":141,"./_set-to-string-tag":142,"./_species-constructor":145,"./_task":154,"./_wks":170}],264:[function(require,module,exports){
// 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
var $export = require('./_export');
var aFunction = require('./_a-function');
var anObject = require('./_an-object');
var rApply = (require('./_global').Reflect || {}).apply;
var fApply = Function.apply;
// MS Edge argumentsList argument is optional
$export($export.S + $export.F * !require('./_fails')(function () {
  rApply(function () { /* empty */ });
}), 'Reflect', {
  apply: function apply(target, thisArgument, argumentsList) {
    var T = aFunction(target);
    var L = anObject(argumentsList);
    return rApply ? rApply(T, thisArgument, L) : fApply.call(T, thisArgument, L);
  }
});

},{"./_a-function":43,"./_an-object":47,"./_export":73,"./_fails":75,"./_global":80}],265:[function(require,module,exports){
// 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
var $export = require('./_export');
var create = require('./_object-create');
var aFunction = require('./_a-function');
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var fails = require('./_fails');
var bind = require('./_bind');
var rConstruct = (require('./_global').Reflect || {}).construct;

// MS Edge supports only 2 arguments and argumentsList argument is optional
// FF Nightly sets third argument as `new.target`, but does not create `this` from it
var NEW_TARGET_BUG = fails(function () {
  function F() { /* empty */ }
  return !(rConstruct(function () { /* empty */ }, [], F) instanceof F);
});
var ARGS_BUG = !fails(function () {
  rConstruct(function () { /* empty */ });
});

$export($export.S + $export.F * (NEW_TARGET_BUG || ARGS_BUG), 'Reflect', {
  construct: function construct(Target, args /* , newTarget */) {
    aFunction(Target);
    anObject(args);
    var newTarget = arguments.length < 3 ? Target : aFunction(arguments[2]);
    if (ARGS_BUG && !NEW_TARGET_BUG) return rConstruct(Target, args, newTarget);
    if (Target == newTarget) {
      // w/o altered newTarget, optimization for 0-4 arguments
      switch (args.length) {
        case 0: return new Target();
        case 1: return new Target(args[0]);
        case 2: return new Target(args[0], args[1]);
        case 3: return new Target(args[0], args[1], args[2]);
        case 4: return new Target(args[0], args[1], args[2], args[3]);
      }
      // w/o altered newTarget, lot of arguments case
      var $args = [null];
      $args.push.apply($args, args);
      return new (bind.apply(Target, $args))();
    }
    // with altered newTarget, not support built-in constructors
    var proto = newTarget.prototype;
    var instance = create(isObject(proto) ? proto : Object.prototype);
    var result = Function.apply.call(Target, instance, args);
    return isObject(result) ? result : instance;
  }
});

},{"./_a-function":43,"./_an-object":47,"./_bind":56,"./_export":73,"./_fails":75,"./_global":80,"./_is-object":91,"./_object-create":111}],266:[function(require,module,exports){
// 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
var dP = require('./_object-dp');
var $export = require('./_export');
var anObject = require('./_an-object');
var toPrimitive = require('./_to-primitive');

// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
$export($export.S + $export.F * require('./_fails')(function () {
  // eslint-disable-next-line no-undef
  Reflect.defineProperty(dP.f({}, 1, { value: 1 }), 1, { value: 2 });
}), 'Reflect', {
  defineProperty: function defineProperty(target, propertyKey, attributes) {
    anObject(target);
    propertyKey = toPrimitive(propertyKey, true);
    anObject(attributes);
    try {
      dP.f(target, propertyKey, attributes);
      return true;
    } catch (e) {
      return false;
    }
  }
});

},{"./_an-object":47,"./_export":73,"./_fails":75,"./_object-dp":113,"./_to-primitive":161}],267:[function(require,module,exports){
// 26.1.4 Reflect.deleteProperty(target, propertyKey)
var $export = require('./_export');
var gOPD = require('./_object-gopd').f;
var anObject = require('./_an-object');

$export($export.S, 'Reflect', {
  deleteProperty: function deleteProperty(target, propertyKey) {
    var desc = gOPD(anObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  }
});

},{"./_an-object":47,"./_export":73,"./_object-gopd":116}],268:[function(require,module,exports){
'use strict';
// 26.1.5 Reflect.enumerate(target)
var $export = require('./_export');
var anObject = require('./_an-object');
var Enumerate = function (iterated) {
  this._t = anObject(iterated); // target
  this._i = 0;                  // next index
  var keys = this._k = [];      // keys
  var key;
  for (key in iterated) keys.push(key);
};
require('./_iter-create')(Enumerate, 'Object', function () {
  var that = this;
  var keys = that._k;
  var key;
  do {
    if (that._i >= keys.length) return { value: undefined, done: true };
  } while (!((key = keys[that._i++]) in that._t));
  return { value: key, done: false };
});

$export($export.S, 'Reflect', {
  enumerate: function enumerate(target) {
    return new Enumerate(target);
  }
});

},{"./_an-object":47,"./_export":73,"./_iter-create":94}],269:[function(require,module,exports){
// 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
var gOPD = require('./_object-gopd');
var $export = require('./_export');
var anObject = require('./_an-object');

$export($export.S, 'Reflect', {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
    return gOPD.f(anObject(target), propertyKey);
  }
});

},{"./_an-object":47,"./_export":73,"./_object-gopd":116}],270:[function(require,module,exports){
// 26.1.8 Reflect.getPrototypeOf(target)
var $export = require('./_export');
var getProto = require('./_object-gpo');
var anObject = require('./_an-object');

$export($export.S, 'Reflect', {
  getPrototypeOf: function getPrototypeOf(target) {
    return getProto(anObject(target));
  }
});

},{"./_an-object":47,"./_export":73,"./_object-gpo":120}],271:[function(require,module,exports){
// 26.1.6 Reflect.get(target, propertyKey [, receiver])
var gOPD = require('./_object-gopd');
var getPrototypeOf = require('./_object-gpo');
var has = require('./_has');
var $export = require('./_export');
var isObject = require('./_is-object');
var anObject = require('./_an-object');

function get(target, propertyKey /* , receiver */) {
  var receiver = arguments.length < 3 ? target : arguments[2];
  var desc, proto;
  if (anObject(target) === receiver) return target[propertyKey];
  if (desc = gOPD.f(target, propertyKey)) return has(desc, 'value')
    ? desc.value
    : desc.get !== undefined
      ? desc.get.call(receiver)
      : undefined;
  if (isObject(proto = getPrototypeOf(target))) return get(proto, propertyKey, receiver);
}

$export($export.S, 'Reflect', { get: get });

},{"./_an-object":47,"./_export":73,"./_has":81,"./_is-object":91,"./_object-gopd":116,"./_object-gpo":120}],272:[function(require,module,exports){
// 26.1.9 Reflect.has(target, propertyKey)
var $export = require('./_export');

$export($export.S, 'Reflect', {
  has: function has(target, propertyKey) {
    return propertyKey in target;
  }
});

},{"./_export":73}],273:[function(require,module,exports){
// 26.1.10 Reflect.isExtensible(target)
var $export = require('./_export');
var anObject = require('./_an-object');
var $isExtensible = Object.isExtensible;

$export($export.S, 'Reflect', {
  isExtensible: function isExtensible(target) {
    anObject(target);
    return $isExtensible ? $isExtensible(target) : true;
  }
});

},{"./_an-object":47,"./_export":73}],274:[function(require,module,exports){
// 26.1.11 Reflect.ownKeys(target)
var $export = require('./_export');

$export($export.S, 'Reflect', { ownKeys: require('./_own-keys') });

},{"./_export":73,"./_own-keys":126}],275:[function(require,module,exports){
// 26.1.12 Reflect.preventExtensions(target)
var $export = require('./_export');
var anObject = require('./_an-object');
var $preventExtensions = Object.preventExtensions;

$export($export.S, 'Reflect', {
  preventExtensions: function preventExtensions(target) {
    anObject(target);
    try {
      if ($preventExtensions) $preventExtensions(target);
      return true;
    } catch (e) {
      return false;
    }
  }
});

},{"./_an-object":47,"./_export":73}],276:[function(require,module,exports){
// 26.1.14 Reflect.setPrototypeOf(target, proto)
var $export = require('./_export');
var setProto = require('./_set-proto');

if (setProto) $export($export.S, 'Reflect', {
  setPrototypeOf: function setPrototypeOf(target, proto) {
    setProto.check(target, proto);
    try {
      setProto.set(target, proto);
      return true;
    } catch (e) {
      return false;
    }
  }
});

},{"./_export":73,"./_set-proto":140}],277:[function(require,module,exports){
// 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
var dP = require('./_object-dp');
var gOPD = require('./_object-gopd');
var getPrototypeOf = require('./_object-gpo');
var has = require('./_has');
var $export = require('./_export');
var createDesc = require('./_property-desc');
var anObject = require('./_an-object');
var isObject = require('./_is-object');

function set(target, propertyKey, V /* , receiver */) {
  var receiver = arguments.length < 4 ? target : arguments[3];
  var ownDesc = gOPD.f(anObject(target), propertyKey);
  var existingDescriptor, proto;
  if (!ownDesc) {
    if (isObject(proto = getPrototypeOf(target))) {
      return set(proto, propertyKey, V, receiver);
    }
    ownDesc = createDesc(0);
  }
  if (has(ownDesc, 'value')) {
    if (ownDesc.writable === false || !isObject(receiver)) return false;
    if (existingDescriptor = gOPD.f(receiver, propertyKey)) {
      if (existingDescriptor.get || existingDescriptor.set || existingDescriptor.writable === false) return false;
      existingDescriptor.value = V;
      dP.f(receiver, propertyKey, existingDescriptor);
    } else dP.f(receiver, propertyKey, createDesc(0, V));
    return true;
  }
  return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
}

$export($export.S, 'Reflect', { set: set });

},{"./_an-object":47,"./_export":73,"./_has":81,"./_is-object":91,"./_object-dp":113,"./_object-gopd":116,"./_object-gpo":120,"./_property-desc":133}],278:[function(require,module,exports){
var global = require('./_global');
var inheritIfRequired = require('./_inherit-if-required');
var dP = require('./_object-dp').f;
var gOPN = require('./_object-gopn').f;
var isRegExp = require('./_is-regexp');
var $flags = require('./_flags');
var $RegExp = global.RegExp;
var Base = $RegExp;
var proto = $RegExp.prototype;
var re1 = /a/g;
var re2 = /a/g;
// "new" creates a new object, old webkit buggy here
var CORRECT_NEW = new $RegExp(re1) !== re1;

if (require('./_descriptors') && (!CORRECT_NEW || require('./_fails')(function () {
  re2[require('./_wks')('match')] = false;
  // RegExp constructor can alter flags and IsRegExp works correct with @@match
  return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
}))) {
  $RegExp = function RegExp(p, f) {
    var tiRE = this instanceof $RegExp;
    var piRE = isRegExp(p);
    var fiU = f === undefined;
    return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
      : inheritIfRequired(CORRECT_NEW
        ? new Base(piRE && !fiU ? p.source : p, f)
        : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? $flags.call(p) : f)
      , tiRE ? this : proto, $RegExp);
  };
  var proxy = function (key) {
    key in $RegExp || dP($RegExp, key, {
      configurable: true,
      get: function () { return Base[key]; },
      set: function (it) { Base[key] = it; }
    });
  };
  for (var keys = gOPN(Base), i = 0; keys.length > i;) proxy(keys[i++]);
  proto.constructor = $RegExp;
  $RegExp.prototype = proto;
  require('./_redefine')(global, 'RegExp', $RegExp);
}

require('./_set-species')('RegExp');

},{"./_descriptors":69,"./_fails":75,"./_flags":77,"./_global":80,"./_inherit-if-required":85,"./_is-regexp":92,"./_object-dp":113,"./_object-gopn":118,"./_redefine":135,"./_set-species":141,"./_wks":170}],279:[function(require,module,exports){
// 21.2.5.3 get RegExp.prototype.flags()
if (require('./_descriptors') && /./g.flags != 'g') require('./_object-dp').f(RegExp.prototype, 'flags', {
  configurable: true,
  get: require('./_flags')
});

},{"./_descriptors":69,"./_flags":77,"./_object-dp":113}],280:[function(require,module,exports){
// @@match logic
require('./_fix-re-wks')('match', 1, function (defined, MATCH, $match) {
  // 21.1.3.11 String.prototype.match(regexp)
  return [function match(regexp) {
    'use strict';
    var O = defined(this);
    var fn = regexp == undefined ? undefined : regexp[MATCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
  }, $match];
});

},{"./_fix-re-wks":76}],281:[function(require,module,exports){
// @@replace logic
require('./_fix-re-wks')('replace', 2, function (defined, REPLACE, $replace) {
  // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
  return [function replace(searchValue, replaceValue) {
    'use strict';
    var O = defined(this);
    var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
    return fn !== undefined
      ? fn.call(searchValue, O, replaceValue)
      : $replace.call(String(O), searchValue, replaceValue);
  }, $replace];
});

},{"./_fix-re-wks":76}],282:[function(require,module,exports){
// @@search logic
require('./_fix-re-wks')('search', 1, function (defined, SEARCH, $search) {
  // 21.1.3.15 String.prototype.search(regexp)
  return [function search(regexp) {
    'use strict';
    var O = defined(this);
    var fn = regexp == undefined ? undefined : regexp[SEARCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
  }, $search];
});

},{"./_fix-re-wks":76}],283:[function(require,module,exports){
// @@split logic
require('./_fix-re-wks')('split', 2, function (defined, SPLIT, $split) {
  'use strict';
  var isRegExp = require('./_is-regexp');
  var _split = $split;
  var $push = [].push;
  var $SPLIT = 'split';
  var LENGTH = 'length';
  var LAST_INDEX = 'lastIndex';
  if (
    'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
    'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
    'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
    '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
    '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
    ''[$SPLIT](/.?/)[LENGTH]
  ) {
    var NPCG = /()??/.exec('')[1] === undefined; // nonparticipating capturing group
    // based on es5-shim implementation, need to rework it
    $split = function (separator, limit) {
      var string = String(this);
      if (separator === undefined && limit === 0) return [];
      // If `separator` is not a regex, use native split
      if (!isRegExp(separator)) return _split.call(string, separator, limit);
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      var splitLimit = limit === undefined ? 4294967295 : limit >>> 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var separator2, match, lastIndex, lastLength, i;
      // Doesn't need flags gy, but they don't hurt
      if (!NPCG) separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
      while (match = separatorCopy.exec(string)) {
        // `separatorCopy.lastIndex` is not reliable cross-browser
        lastIndex = match.index + match[0][LENGTH];
        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index));
          // Fix browsers whose `exec` methods don't consistently return `undefined` for NPCG
          // eslint-disable-next-line no-loop-func
          if (!NPCG && match[LENGTH] > 1) match[0].replace(separator2, function () {
            for (i = 1; i < arguments[LENGTH] - 2; i++) if (arguments[i] === undefined) match[i] = undefined;
          });
          if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
          lastLength = match[0][LENGTH];
          lastLastIndex = lastIndex;
          if (output[LENGTH] >= splitLimit) break;
        }
        if (separatorCopy[LAST_INDEX] === match.index) separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
      }
      if (lastLastIndex === string[LENGTH]) {
        if (lastLength || !separatorCopy.test('')) output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
    };
  // Chakra, V8
  } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
    $split = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : _split.call(this, separator, limit);
    };
  }
  // 21.1.3.17 String.prototype.split(separator, limit)
  return [function split(separator, limit) {
    var O = defined(this);
    var fn = separator == undefined ? undefined : separator[SPLIT];
    return fn !== undefined ? fn.call(separator, O, limit) : $split.call(String(O), separator, limit);
  }, $split];
});

},{"./_fix-re-wks":76,"./_is-regexp":92}],284:[function(require,module,exports){
'use strict';
require('./es6.regexp.flags');
var anObject = require('./_an-object');
var $flags = require('./_flags');
var DESCRIPTORS = require('./_descriptors');
var TO_STRING = 'toString';
var $toString = /./[TO_STRING];

var define = function (fn) {
  require('./_redefine')(RegExp.prototype, TO_STRING, fn, true);
};

// 21.2.5.14 RegExp.prototype.toString()
if (require('./_fails')(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
  define(function toString() {
    var R = anObject(this);
    return '/'.concat(R.source, '/',
      'flags' in R ? R.flags : !DESCRIPTORS && R instanceof RegExp ? $flags.call(R) : undefined);
  });
// FF44- RegExp#toString has a wrong name
} else if ($toString.name != TO_STRING) {
  define(function toString() {
    return $toString.call(this);
  });
}

},{"./_an-object":47,"./_descriptors":69,"./_fails":75,"./_flags":77,"./_redefine":135,"./es6.regexp.flags":279}],285:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');
var validate = require('./_validate-collection');
var SET = 'Set';

// 23.2 Set Objects
module.exports = require('./_collection')(SET, function (get) {
  return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value) {
    return strong.def(validate(this, SET), value = value === 0 ? 0 : value, value);
  }
}, strong);

},{"./_collection":62,"./_collection-strong":59,"./_validate-collection":167}],286:[function(require,module,exports){
'use strict';
// B.2.3.2 String.prototype.anchor(name)
require('./_string-html')('anchor', function (createHTML) {
  return function anchor(name) {
    return createHTML(this, 'a', 'name', name);
  };
});

},{"./_string-html":149}],287:[function(require,module,exports){
'use strict';
// B.2.3.3 String.prototype.big()
require('./_string-html')('big', function (createHTML) {
  return function big() {
    return createHTML(this, 'big', '', '');
  };
});

},{"./_string-html":149}],288:[function(require,module,exports){
'use strict';
// B.2.3.4 String.prototype.blink()
require('./_string-html')('blink', function (createHTML) {
  return function blink() {
    return createHTML(this, 'blink', '', '');
  };
});

},{"./_string-html":149}],289:[function(require,module,exports){
'use strict';
// B.2.3.5 String.prototype.bold()
require('./_string-html')('bold', function (createHTML) {
  return function bold() {
    return createHTML(this, 'b', '', '');
  };
});

},{"./_string-html":149}],290:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $at = require('./_string-at')(false);
$export($export.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos) {
    return $at(this, pos);
  }
});

},{"./_export":73,"./_string-at":147}],291:[function(require,module,exports){
// 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
'use strict';
var $export = require('./_export');
var toLength = require('./_to-length');
var context = require('./_string-context');
var ENDS_WITH = 'endsWith';
var $endsWith = ''[ENDS_WITH];

$export($export.P + $export.F * require('./_fails-is-regexp')(ENDS_WITH), 'String', {
  endsWith: function endsWith(searchString /* , endPosition = @length */) {
    var that = context(this, searchString, ENDS_WITH);
    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
    var len = toLength(that.length);
    var end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
    var search = String(searchString);
    return $endsWith
      ? $endsWith.call(that, search, end)
      : that.slice(end - search.length, end) === search;
  }
});

},{"./_export":73,"./_fails-is-regexp":74,"./_string-context":148,"./_to-length":159}],292:[function(require,module,exports){
'use strict';
// B.2.3.6 String.prototype.fixed()
require('./_string-html')('fixed', function (createHTML) {
  return function fixed() {
    return createHTML(this, 'tt', '', '');
  };
});

},{"./_string-html":149}],293:[function(require,module,exports){
'use strict';
// B.2.3.7 String.prototype.fontcolor(color)
require('./_string-html')('fontcolor', function (createHTML) {
  return function fontcolor(color) {
    return createHTML(this, 'font', 'color', color);
  };
});

},{"./_string-html":149}],294:[function(require,module,exports){
'use strict';
// B.2.3.8 String.prototype.fontsize(size)
require('./_string-html')('fontsize', function (createHTML) {
  return function fontsize(size) {
    return createHTML(this, 'font', 'size', size);
  };
});

},{"./_string-html":149}],295:[function(require,module,exports){
var $export = require('./_export');
var toAbsoluteIndex = require('./_to-absolute-index');
var fromCharCode = String.fromCharCode;
var $fromCodePoint = String.fromCodePoint;

// length should be 1, old FF problem
$export($export.S + $export.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function fromCodePoint(x) { // eslint-disable-line no-unused-vars
    var res = [];
    var aLen = arguments.length;
    var i = 0;
    var code;
    while (aLen > i) {
      code = +arguments[i++];
      if (toAbsoluteIndex(code, 0x10ffff) !== code) throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
      );
    } return res.join('');
  }
});

},{"./_export":73,"./_to-absolute-index":155}],296:[function(require,module,exports){
// 21.1.3.7 String.prototype.includes(searchString, position = 0)
'use strict';
var $export = require('./_export');
var context = require('./_string-context');
var INCLUDES = 'includes';

$export($export.P + $export.F * require('./_fails-is-regexp')(INCLUDES), 'String', {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~context(this, searchString, INCLUDES)
      .indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
  }
});

},{"./_export":73,"./_fails-is-regexp":74,"./_string-context":148}],297:[function(require,module,exports){
'use strict';
// B.2.3.9 String.prototype.italics()
require('./_string-html')('italics', function (createHTML) {
  return function italics() {
    return createHTML(this, 'i', '', '');
  };
});

},{"./_string-html":149}],298:[function(require,module,exports){
'use strict';
var $at = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

},{"./_iter-define":95,"./_string-at":147}],299:[function(require,module,exports){
'use strict';
// B.2.3.10 String.prototype.link(url)
require('./_string-html')('link', function (createHTML) {
  return function link(url) {
    return createHTML(this, 'a', 'href', url);
  };
});

},{"./_string-html":149}],300:[function(require,module,exports){
var $export = require('./_export');
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');

$export($export.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function raw(callSite) {
    var tpl = toIObject(callSite.raw);
    var len = toLength(tpl.length);
    var aLen = arguments.length;
    var res = [];
    var i = 0;
    while (len > i) {
      res.push(String(tpl[i++]));
      if (i < aLen) res.push(String(arguments[i]));
    } return res.join('');
  }
});

},{"./_export":73,"./_to-iobject":158,"./_to-length":159}],301:[function(require,module,exports){
var $export = require('./_export');

$export($export.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: require('./_string-repeat')
});

},{"./_export":73,"./_string-repeat":151}],302:[function(require,module,exports){
'use strict';
// B.2.3.11 String.prototype.small()
require('./_string-html')('small', function (createHTML) {
  return function small() {
    return createHTML(this, 'small', '', '');
  };
});

},{"./_string-html":149}],303:[function(require,module,exports){
// 21.1.3.18 String.prototype.startsWith(searchString [, position ])
'use strict';
var $export = require('./_export');
var toLength = require('./_to-length');
var context = require('./_string-context');
var STARTS_WITH = 'startsWith';
var $startsWith = ''[STARTS_WITH];

$export($export.P + $export.F * require('./_fails-is-regexp')(STARTS_WITH), 'String', {
  startsWith: function startsWith(searchString /* , position = 0 */) {
    var that = context(this, searchString, STARTS_WITH);
    var index = toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length));
    var search = String(searchString);
    return $startsWith
      ? $startsWith.call(that, search, index)
      : that.slice(index, index + search.length) === search;
  }
});

},{"./_export":73,"./_fails-is-regexp":74,"./_string-context":148,"./_to-length":159}],304:[function(require,module,exports){
'use strict';
// B.2.3.12 String.prototype.strike()
require('./_string-html')('strike', function (createHTML) {
  return function strike() {
    return createHTML(this, 'strike', '', '');
  };
});

},{"./_string-html":149}],305:[function(require,module,exports){
'use strict';
// B.2.3.13 String.prototype.sub()
require('./_string-html')('sub', function (createHTML) {
  return function sub() {
    return createHTML(this, 'sub', '', '');
  };
});

},{"./_string-html":149}],306:[function(require,module,exports){
'use strict';
// B.2.3.14 String.prototype.sup()
require('./_string-html')('sup', function (createHTML) {
  return function sup() {
    return createHTML(this, 'sup', '', '');
  };
});

},{"./_string-html":149}],307:[function(require,module,exports){
'use strict';
// 21.1.3.25 String.prototype.trim()
require('./_string-trim')('trim', function ($trim) {
  return function trim() {
    return $trim(this, 3);
  };
});

},{"./_string-trim":152}],308:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global = require('./_global');
var has = require('./_has');
var DESCRIPTORS = require('./_descriptors');
var $export = require('./_export');
var redefine = require('./_redefine');
var META = require('./_meta').KEY;
var $fails = require('./_fails');
var shared = require('./_shared');
var setToStringTag = require('./_set-to-string-tag');
var uid = require('./_uid');
var wks = require('./_wks');
var wksExt = require('./_wks-ext');
var wksDefine = require('./_wks-define');
var enumKeys = require('./_enum-keys');
var isArray = require('./_is-array');
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var createDesc = require('./_property-desc');
var _create = require('./_object-create');
var gOPNExt = require('./_object-gopn-ext');
var $GOPD = require('./_object-gopd');
var $DP = require('./_object-dp');
var $keys = require('./_object-keys');
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !require('./_library')) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);

},{"./_an-object":47,"./_descriptors":69,"./_enum-keys":72,"./_export":73,"./_fails":75,"./_global":80,"./_has":81,"./_hide":82,"./_is-array":89,"./_is-object":91,"./_library":100,"./_meta":106,"./_object-create":111,"./_object-dp":113,"./_object-gopd":116,"./_object-gopn":118,"./_object-gopn-ext":117,"./_object-gops":119,"./_object-keys":122,"./_object-pie":123,"./_property-desc":133,"./_redefine":135,"./_set-to-string-tag":142,"./_shared":144,"./_to-iobject":158,"./_to-primitive":161,"./_uid":165,"./_wks":170,"./_wks-define":168,"./_wks-ext":169}],309:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $typed = require('./_typed');
var buffer = require('./_typed-buffer');
var anObject = require('./_an-object');
var toAbsoluteIndex = require('./_to-absolute-index');
var toLength = require('./_to-length');
var isObject = require('./_is-object');
var ArrayBuffer = require('./_global').ArrayBuffer;
var speciesConstructor = require('./_species-constructor');
var $ArrayBuffer = buffer.ArrayBuffer;
var $DataView = buffer.DataView;
var $isView = $typed.ABV && ArrayBuffer.isView;
var $slice = $ArrayBuffer.prototype.slice;
var VIEW = $typed.VIEW;
var ARRAY_BUFFER = 'ArrayBuffer';

$export($export.G + $export.W + $export.F * (ArrayBuffer !== $ArrayBuffer), { ArrayBuffer: $ArrayBuffer });

$export($export.S + $export.F * !$typed.CONSTR, ARRAY_BUFFER, {
  // 24.1.3.1 ArrayBuffer.isView(arg)
  isView: function isView(it) {
    return $isView && $isView(it) || isObject(it) && VIEW in it;
  }
});

$export($export.P + $export.U + $export.F * require('./_fails')(function () {
  return !new $ArrayBuffer(2).slice(1, undefined).byteLength;
}), ARRAY_BUFFER, {
  // 24.1.4.3 ArrayBuffer.prototype.slice(start, end)
  slice: function slice(start, end) {
    if ($slice !== undefined && end === undefined) return $slice.call(anObject(this), start); // FF fix
    var len = anObject(this).byteLength;
    var first = toAbsoluteIndex(start, len);
    var final = toAbsoluteIndex(end === undefined ? len : end, len);
    var result = new (speciesConstructor(this, $ArrayBuffer))(toLength(final - first));
    var viewS = new $DataView(this);
    var viewT = new $DataView(result);
    var index = 0;
    while (first < final) {
      viewT.setUint8(index++, viewS.getUint8(first++));
    } return result;
  }
});

require('./_set-species')(ARRAY_BUFFER);

},{"./_an-object":47,"./_export":73,"./_fails":75,"./_global":80,"./_is-object":91,"./_set-species":141,"./_species-constructor":145,"./_to-absolute-index":155,"./_to-length":159,"./_typed":164,"./_typed-buffer":163}],310:[function(require,module,exports){
var $export = require('./_export');
$export($export.G + $export.W + $export.F * !require('./_typed').ABV, {
  DataView: require('./_typed-buffer').DataView
});

},{"./_export":73,"./_typed":164,"./_typed-buffer":163}],311:[function(require,module,exports){
require('./_typed-array')('Float32', 4, function (init) {
  return function Float32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

},{"./_typed-array":162}],312:[function(require,module,exports){
require('./_typed-array')('Float64', 8, function (init) {
  return function Float64Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

},{"./_typed-array":162}],313:[function(require,module,exports){
require('./_typed-array')('Int16', 2, function (init) {
  return function Int16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

},{"./_typed-array":162}],314:[function(require,module,exports){
require('./_typed-array')('Int32', 4, function (init) {
  return function Int32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

},{"./_typed-array":162}],315:[function(require,module,exports){
require('./_typed-array')('Int8', 1, function (init) {
  return function Int8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

},{"./_typed-array":162}],316:[function(require,module,exports){
require('./_typed-array')('Uint16', 2, function (init) {
  return function Uint16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

},{"./_typed-array":162}],317:[function(require,module,exports){
require('./_typed-array')('Uint32', 4, function (init) {
  return function Uint32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

},{"./_typed-array":162}],318:[function(require,module,exports){
require('./_typed-array')('Uint8', 1, function (init) {
  return function Uint8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

},{"./_typed-array":162}],319:[function(require,module,exports){
require('./_typed-array')('Uint8', 1, function (init) {
  return function Uint8ClampedArray(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
}, true);

},{"./_typed-array":162}],320:[function(require,module,exports){
'use strict';
var each = require('./_array-methods')(0);
var redefine = require('./_redefine');
var meta = require('./_meta');
var assign = require('./_object-assign');
var weak = require('./_collection-weak');
var isObject = require('./_is-object');
var fails = require('./_fails');
var validate = require('./_validate-collection');
var WEAK_MAP = 'WeakMap';
var getWeak = meta.getWeak;
var isExtensible = Object.isExtensible;
var uncaughtFrozenStore = weak.ufstore;
var tmp = {};
var InternalMap;

var wrapper = function (get) {
  return function WeakMap() {
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
};

var methods = {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key) {
    if (isObject(key)) {
      var data = getWeak(key);
      if (data === true) return uncaughtFrozenStore(validate(this, WEAK_MAP)).get(key);
      return data ? data[this._i] : undefined;
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value) {
    return weak.def(validate(this, WEAK_MAP), key, value);
  }
};

// 23.3 WeakMap Objects
var $WeakMap = module.exports = require('./_collection')(WEAK_MAP, wrapper, methods, weak, true, true);

// IE11 WeakMap frozen keys fix
if (fails(function () { return new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7; })) {
  InternalMap = weak.getConstructor(wrapper, WEAK_MAP);
  assign(InternalMap.prototype, methods);
  meta.NEED = true;
  each(['delete', 'has', 'get', 'set'], function (key) {
    var proto = $WeakMap.prototype;
    var method = proto[key];
    redefine(proto, key, function (a, b) {
      // store frozen objects on internal weakmap shim
      if (isObject(a) && !isExtensible(a)) {
        if (!this._f) this._f = new InternalMap();
        var result = this._f[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    });
  });
}

},{"./_array-methods":52,"./_collection":62,"./_collection-weak":61,"./_fails":75,"./_is-object":91,"./_meta":106,"./_object-assign":110,"./_redefine":135,"./_validate-collection":167}],321:[function(require,module,exports){
'use strict';
var weak = require('./_collection-weak');
var validate = require('./_validate-collection');
var WEAK_SET = 'WeakSet';

// 23.4 WeakSet Objects
require('./_collection')(WEAK_SET, function (get) {
  return function WeakSet() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function add(value) {
    return weak.def(validate(this, WEAK_SET), value, true);
  }
}, weak, false, true);

},{"./_collection":62,"./_collection-weak":61,"./_validate-collection":167}],322:[function(require,module,exports){
'use strict';
// https://tc39.github.io/proposal-flatMap/#sec-Array.prototype.flatMap
var $export = require('./_export');
var flattenIntoArray = require('./_flatten-into-array');
var toObject = require('./_to-object');
var toLength = require('./_to-length');
var aFunction = require('./_a-function');
var arraySpeciesCreate = require('./_array-species-create');

$export($export.P, 'Array', {
  flatMap: function flatMap(callbackfn /* , thisArg */) {
    var O = toObject(this);
    var sourceLen, A;
    aFunction(callbackfn);
    sourceLen = toLength(O.length);
    A = arraySpeciesCreate(O, 0);
    flattenIntoArray(A, O, O, sourceLen, 0, 1, callbackfn, arguments[1]);
    return A;
  }
});

require('./_add-to-unscopables')('flatMap');

},{"./_a-function":43,"./_add-to-unscopables":45,"./_array-species-create":55,"./_export":73,"./_flatten-into-array":78,"./_to-length":159,"./_to-object":160}],323:[function(require,module,exports){
'use strict';
// https://tc39.github.io/proposal-flatMap/#sec-Array.prototype.flatten
var $export = require('./_export');
var flattenIntoArray = require('./_flatten-into-array');
var toObject = require('./_to-object');
var toLength = require('./_to-length');
var toInteger = require('./_to-integer');
var arraySpeciesCreate = require('./_array-species-create');

$export($export.P, 'Array', {
  flatten: function flatten(/* depthArg = 1 */) {
    var depthArg = arguments[0];
    var O = toObject(this);
    var sourceLen = toLength(O.length);
    var A = arraySpeciesCreate(O, 0);
    flattenIntoArray(A, O, O, sourceLen, 0, depthArg === undefined ? 1 : toInteger(depthArg));
    return A;
  }
});

require('./_add-to-unscopables')('flatten');

},{"./_add-to-unscopables":45,"./_array-species-create":55,"./_export":73,"./_flatten-into-array":78,"./_to-integer":157,"./_to-length":159,"./_to-object":160}],324:[function(require,module,exports){
'use strict';
// https://github.com/tc39/Array.prototype.includes
var $export = require('./_export');
var $includes = require('./_array-includes')(true);

$export($export.P, 'Array', {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

require('./_add-to-unscopables')('includes');

},{"./_add-to-unscopables":45,"./_array-includes":51,"./_export":73}],325:[function(require,module,exports){
// https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-09/sept-25.md#510-globalasap-for-enqueuing-a-microtask
var $export = require('./_export');
var microtask = require('./_microtask')();
var process = require('./_global').process;
var isNode = require('./_cof')(process) == 'process';

$export($export.G, {
  asap: function asap(fn) {
    var domain = isNode && process.domain;
    microtask(domain ? domain.bind(fn) : fn);
  }
});

},{"./_cof":58,"./_export":73,"./_global":80,"./_microtask":108}],326:[function(require,module,exports){
// https://github.com/ljharb/proposal-is-error
var $export = require('./_export');
var cof = require('./_cof');

$export($export.S, 'Error', {
  isError: function isError(it) {
    return cof(it) === 'Error';
  }
});

},{"./_cof":58,"./_export":73}],327:[function(require,module,exports){
// https://github.com/tc39/proposal-global
var $export = require('./_export');

$export($export.G, { global: require('./_global') });

},{"./_export":73,"./_global":80}],328:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
require('./_set-collection-from')('Map');

},{"./_set-collection-from":138}],329:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
require('./_set-collection-of')('Map');

},{"./_set-collection-of":139}],330:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export = require('./_export');

$export($export.P + $export.R, 'Map', { toJSON: require('./_collection-to-json')('Map') });

},{"./_collection-to-json":60,"./_export":73}],331:[function(require,module,exports){
// https://rwaldron.github.io/proposal-math-extensions/
var $export = require('./_export');

$export($export.S, 'Math', {
  clamp: function clamp(x, lower, upper) {
    return Math.min(upper, Math.max(lower, x));
  }
});

},{"./_export":73}],332:[function(require,module,exports){
// https://rwaldron.github.io/proposal-math-extensions/
var $export = require('./_export');

$export($export.S, 'Math', { DEG_PER_RAD: Math.PI / 180 });

},{"./_export":73}],333:[function(require,module,exports){
// https://rwaldron.github.io/proposal-math-extensions/
var $export = require('./_export');
var RAD_PER_DEG = 180 / Math.PI;

$export($export.S, 'Math', {
  degrees: function degrees(radians) {
    return radians * RAD_PER_DEG;
  }
});

},{"./_export":73}],334:[function(require,module,exports){
// https://rwaldron.github.io/proposal-math-extensions/
var $export = require('./_export');
var scale = require('./_math-scale');
var fround = require('./_math-fround');

$export($export.S, 'Math', {
  fscale: function fscale(x, inLow, inHigh, outLow, outHigh) {
    return fround(scale(x, inLow, inHigh, outLow, outHigh));
  }
});

},{"./_export":73,"./_math-fround":102,"./_math-scale":104}],335:[function(require,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = require('./_export');

$export($export.S, 'Math', {
  iaddh: function iaddh(x0, x1, y0, y1) {
    var $x0 = x0 >>> 0;
    var $x1 = x1 >>> 0;
    var $y0 = y0 >>> 0;
    return $x1 + (y1 >>> 0) + (($x0 & $y0 | ($x0 | $y0) & ~($x0 + $y0 >>> 0)) >>> 31) | 0;
  }
});

},{"./_export":73}],336:[function(require,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = require('./_export');

$export($export.S, 'Math', {
  imulh: function imulh(u, v) {
    var UINT16 = 0xffff;
    var $u = +u;
    var $v = +v;
    var u0 = $u & UINT16;
    var v0 = $v & UINT16;
    var u1 = $u >> 16;
    var v1 = $v >> 16;
    var t = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
    return u1 * v1 + (t >> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >> 16);
  }
});

},{"./_export":73}],337:[function(require,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = require('./_export');

$export($export.S, 'Math', {
  isubh: function isubh(x0, x1, y0, y1) {
    var $x0 = x0 >>> 0;
    var $x1 = x1 >>> 0;
    var $y0 = y0 >>> 0;
    return $x1 - (y1 >>> 0) - ((~$x0 & $y0 | ~($x0 ^ $y0) & $x0 - $y0 >>> 0) >>> 31) | 0;
  }
});

},{"./_export":73}],338:[function(require,module,exports){
// https://rwaldron.github.io/proposal-math-extensions/
var $export = require('./_export');

$export($export.S, 'Math', { RAD_PER_DEG: 180 / Math.PI });

},{"./_export":73}],339:[function(require,module,exports){
// https://rwaldron.github.io/proposal-math-extensions/
var $export = require('./_export');
var DEG_PER_RAD = Math.PI / 180;

$export($export.S, 'Math', {
  radians: function radians(degrees) {
    return degrees * DEG_PER_RAD;
  }
});

},{"./_export":73}],340:[function(require,module,exports){
// https://rwaldron.github.io/proposal-math-extensions/
var $export = require('./_export');

$export($export.S, 'Math', { scale: require('./_math-scale') });

},{"./_export":73,"./_math-scale":104}],341:[function(require,module,exports){
// http://jfbastien.github.io/papers/Math.signbit.html
var $export = require('./_export');

$export($export.S, 'Math', { signbit: function signbit(x) {
  // eslint-disable-next-line no-self-compare
  return (x = +x) != x ? x : x == 0 ? 1 / x == Infinity : x > 0;
} });

},{"./_export":73}],342:[function(require,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = require('./_export');

$export($export.S, 'Math', {
  umulh: function umulh(u, v) {
    var UINT16 = 0xffff;
    var $u = +u;
    var $v = +v;
    var u0 = $u & UINT16;
    var v0 = $v & UINT16;
    var u1 = $u >>> 16;
    var v1 = $v >>> 16;
    var t = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
    return u1 * v1 + (t >>> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >>> 16);
  }
});

},{"./_export":73}],343:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var toObject = require('./_to-object');
var aFunction = require('./_a-function');
var $defineProperty = require('./_object-dp');

// B.2.2.2 Object.prototype.__defineGetter__(P, getter)
require('./_descriptors') && $export($export.P + require('./_object-forced-pam'), 'Object', {
  __defineGetter__: function __defineGetter__(P, getter) {
    $defineProperty.f(toObject(this), P, { get: aFunction(getter), enumerable: true, configurable: true });
  }
});

},{"./_a-function":43,"./_descriptors":69,"./_export":73,"./_object-dp":113,"./_object-forced-pam":115,"./_to-object":160}],344:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var toObject = require('./_to-object');
var aFunction = require('./_a-function');
var $defineProperty = require('./_object-dp');

// B.2.2.3 Object.prototype.__defineSetter__(P, setter)
require('./_descriptors') && $export($export.P + require('./_object-forced-pam'), 'Object', {
  __defineSetter__: function __defineSetter__(P, setter) {
    $defineProperty.f(toObject(this), P, { set: aFunction(setter), enumerable: true, configurable: true });
  }
});

},{"./_a-function":43,"./_descriptors":69,"./_export":73,"./_object-dp":113,"./_object-forced-pam":115,"./_to-object":160}],345:[function(require,module,exports){
// https://github.com/tc39/proposal-object-values-entries
var $export = require('./_export');
var $entries = require('./_object-to-array')(true);

$export($export.S, 'Object', {
  entries: function entries(it) {
    return $entries(it);
  }
});

},{"./_export":73,"./_object-to-array":125}],346:[function(require,module,exports){
// https://github.com/tc39/proposal-object-getownpropertydescriptors
var $export = require('./_export');
var ownKeys = require('./_own-keys');
var toIObject = require('./_to-iobject');
var gOPD = require('./_object-gopd');
var createProperty = require('./_create-property');

$export($export.S, 'Object', {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = toIObject(object);
    var getDesc = gOPD.f;
    var keys = ownKeys(O);
    var result = {};
    var i = 0;
    var key, desc;
    while (keys.length > i) {
      desc = getDesc(O, key = keys[i++]);
      if (desc !== undefined) createProperty(result, key, desc);
    }
    return result;
  }
});

},{"./_create-property":64,"./_export":73,"./_object-gopd":116,"./_own-keys":126,"./_to-iobject":158}],347:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var toObject = require('./_to-object');
var toPrimitive = require('./_to-primitive');
var getPrototypeOf = require('./_object-gpo');
var getOwnPropertyDescriptor = require('./_object-gopd').f;

// B.2.2.4 Object.prototype.__lookupGetter__(P)
require('./_descriptors') && $export($export.P + require('./_object-forced-pam'), 'Object', {
  __lookupGetter__: function __lookupGetter__(P) {
    var O = toObject(this);
    var K = toPrimitive(P, true);
    var D;
    do {
      if (D = getOwnPropertyDescriptor(O, K)) return D.get;
    } while (O = getPrototypeOf(O));
  }
});

},{"./_descriptors":69,"./_export":73,"./_object-forced-pam":115,"./_object-gopd":116,"./_object-gpo":120,"./_to-object":160,"./_to-primitive":161}],348:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var toObject = require('./_to-object');
var toPrimitive = require('./_to-primitive');
var getPrototypeOf = require('./_object-gpo');
var getOwnPropertyDescriptor = require('./_object-gopd').f;

// B.2.2.5 Object.prototype.__lookupSetter__(P)
require('./_descriptors') && $export($export.P + require('./_object-forced-pam'), 'Object', {
  __lookupSetter__: function __lookupSetter__(P) {
    var O = toObject(this);
    var K = toPrimitive(P, true);
    var D;
    do {
      if (D = getOwnPropertyDescriptor(O, K)) return D.set;
    } while (O = getPrototypeOf(O));
  }
});

},{"./_descriptors":69,"./_export":73,"./_object-forced-pam":115,"./_object-gopd":116,"./_object-gpo":120,"./_to-object":160,"./_to-primitive":161}],349:[function(require,module,exports){
// https://github.com/tc39/proposal-object-values-entries
var $export = require('./_export');
var $values = require('./_object-to-array')(false);

$export($export.S, 'Object', {
  values: function values(it) {
    return $values(it);
  }
});

},{"./_export":73,"./_object-to-array":125}],350:[function(require,module,exports){
'use strict';
// https://github.com/zenparsing/es-observable
var $export = require('./_export');
var global = require('./_global');
var core = require('./_core');
var microtask = require('./_microtask')();
var OBSERVABLE = require('./_wks')('observable');
var aFunction = require('./_a-function');
var anObject = require('./_an-object');
var anInstance = require('./_an-instance');
var redefineAll = require('./_redefine-all');
var hide = require('./_hide');
var forOf = require('./_for-of');
var RETURN = forOf.RETURN;

var getMethod = function (fn) {
  return fn == null ? undefined : aFunction(fn);
};

var cleanupSubscription = function (subscription) {
  var cleanup = subscription._c;
  if (cleanup) {
    subscription._c = undefined;
    cleanup();
  }
};

var subscriptionClosed = function (subscription) {
  return subscription._o === undefined;
};

var closeSubscription = function (subscription) {
  if (!subscriptionClosed(subscription)) {
    subscription._o = undefined;
    cleanupSubscription(subscription);
  }
};

var Subscription = function (observer, subscriber) {
  anObject(observer);
  this._c = undefined;
  this._o = observer;
  observer = new SubscriptionObserver(this);
  try {
    var cleanup = subscriber(observer);
    var subscription = cleanup;
    if (cleanup != null) {
      if (typeof cleanup.unsubscribe === 'function') cleanup = function () { subscription.unsubscribe(); };
      else aFunction(cleanup);
      this._c = cleanup;
    }
  } catch (e) {
    observer.error(e);
    return;
  } if (subscriptionClosed(this)) cleanupSubscription(this);
};

Subscription.prototype = redefineAll({}, {
  unsubscribe: function unsubscribe() { closeSubscription(this); }
});

var SubscriptionObserver = function (subscription) {
  this._s = subscription;
};

SubscriptionObserver.prototype = redefineAll({}, {
  next: function next(value) {
    var subscription = this._s;
    if (!subscriptionClosed(subscription)) {
      var observer = subscription._o;
      try {
        var m = getMethod(observer.next);
        if (m) return m.call(observer, value);
      } catch (e) {
        try {
          closeSubscription(subscription);
        } finally {
          throw e;
        }
      }
    }
  },
  error: function error(value) {
    var subscription = this._s;
    if (subscriptionClosed(subscription)) throw value;
    var observer = subscription._o;
    subscription._o = undefined;
    try {
      var m = getMethod(observer.error);
      if (!m) throw value;
      value = m.call(observer, value);
    } catch (e) {
      try {
        cleanupSubscription(subscription);
      } finally {
        throw e;
      }
    } cleanupSubscription(subscription);
    return value;
  },
  complete: function complete(value) {
    var subscription = this._s;
    if (!subscriptionClosed(subscription)) {
      var observer = subscription._o;
      subscription._o = undefined;
      try {
        var m = getMethod(observer.complete);
        value = m ? m.call(observer, value) : undefined;
      } catch (e) {
        try {
          cleanupSubscription(subscription);
        } finally {
          throw e;
        }
      } cleanupSubscription(subscription);
      return value;
    }
  }
});

var $Observable = function Observable(subscriber) {
  anInstance(this, $Observable, 'Observable', '_f')._f = aFunction(subscriber);
};

redefineAll($Observable.prototype, {
  subscribe: function subscribe(observer) {
    return new Subscription(observer, this._f);
  },
  forEach: function forEach(fn) {
    var that = this;
    return new (core.Promise || global.Promise)(function (resolve, reject) {
      aFunction(fn);
      var subscription = that.subscribe({
        next: function (value) {
          try {
            return fn(value);
          } catch (e) {
            reject(e);
            subscription.unsubscribe();
          }
        },
        error: reject,
        complete: resolve
      });
    });
  }
});

redefineAll($Observable, {
  from: function from(x) {
    var C = typeof this === 'function' ? this : $Observable;
    var method = getMethod(anObject(x)[OBSERVABLE]);
    if (method) {
      var observable = anObject(method.call(x));
      return observable.constructor === C ? observable : new C(function (observer) {
        return observable.subscribe(observer);
      });
    }
    return new C(function (observer) {
      var done = false;
      microtask(function () {
        if (!done) {
          try {
            if (forOf(x, false, function (it) {
              observer.next(it);
              if (done) return RETURN;
            }) === RETURN) return;
          } catch (e) {
            if (done) throw e;
            observer.error(e);
            return;
          } observer.complete();
        }
      });
      return function () { done = true; };
    });
  },
  of: function of() {
    for (var i = 0, l = arguments.length, items = new Array(l); i < l;) items[i] = arguments[i++];
    return new (typeof this === 'function' ? this : $Observable)(function (observer) {
      var done = false;
      microtask(function () {
        if (!done) {
          for (var j = 0; j < items.length; ++j) {
            observer.next(items[j]);
            if (done) return;
          } observer.complete();
        }
      });
      return function () { done = true; };
    });
  }
});

hide($Observable.prototype, OBSERVABLE, function () { return this; });

$export($export.G, { Observable: $Observable });

require('./_set-species')('Observable');

},{"./_a-function":43,"./_an-instance":46,"./_an-object":47,"./_core":63,"./_export":73,"./_for-of":79,"./_global":80,"./_hide":82,"./_microtask":108,"./_redefine-all":134,"./_set-species":141,"./_wks":170}],351:[function(require,module,exports){
// https://github.com/tc39/proposal-promise-finally
'use strict';
var $export = require('./_export');
var core = require('./_core');
var global = require('./_global');
var speciesConstructor = require('./_species-constructor');
var promiseResolve = require('./_promise-resolve');

$export($export.P + $export.R, 'Promise', { 'finally': function (onFinally) {
  var C = speciesConstructor(this, core.Promise || global.Promise);
  var isFunction = typeof onFinally == 'function';
  return this.then(
    isFunction ? function (x) {
      return promiseResolve(C, onFinally()).then(function () { return x; });
    } : onFinally,
    isFunction ? function (e) {
      return promiseResolve(C, onFinally()).then(function () { throw e; });
    } : onFinally
  );
} });

},{"./_core":63,"./_export":73,"./_global":80,"./_promise-resolve":132,"./_species-constructor":145}],352:[function(require,module,exports){
'use strict';
// https://github.com/tc39/proposal-promise-try
var $export = require('./_export');
var newPromiseCapability = require('./_new-promise-capability');
var perform = require('./_perform');

$export($export.S, 'Promise', { 'try': function (callbackfn) {
  var promiseCapability = newPromiseCapability.f(this);
  var result = perform(callbackfn);
  (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
  return promiseCapability.promise;
} });

},{"./_export":73,"./_new-promise-capability":109,"./_perform":131}],353:[function(require,module,exports){
var metadata = require('./_metadata');
var anObject = require('./_an-object');
var toMetaKey = metadata.key;
var ordinaryDefineOwnMetadata = metadata.set;

metadata.exp({ defineMetadata: function defineMetadata(metadataKey, metadataValue, target, targetKey) {
  ordinaryDefineOwnMetadata(metadataKey, metadataValue, anObject(target), toMetaKey(targetKey));
} });

},{"./_an-object":47,"./_metadata":107}],354:[function(require,module,exports){
var metadata = require('./_metadata');
var anObject = require('./_an-object');
var toMetaKey = metadata.key;
var getOrCreateMetadataMap = metadata.map;
var store = metadata.store;

metadata.exp({ deleteMetadata: function deleteMetadata(metadataKey, target /* , targetKey */) {
  var targetKey = arguments.length < 3 ? undefined : toMetaKey(arguments[2]);
  var metadataMap = getOrCreateMetadataMap(anObject(target), targetKey, false);
  if (metadataMap === undefined || !metadataMap['delete'](metadataKey)) return false;
  if (metadataMap.size) return true;
  var targetMetadata = store.get(target);
  targetMetadata['delete'](targetKey);
  return !!targetMetadata.size || store['delete'](target);
} });

},{"./_an-object":47,"./_metadata":107}],355:[function(require,module,exports){
var Set = require('./es6.set');
var from = require('./_array-from-iterable');
var metadata = require('./_metadata');
var anObject = require('./_an-object');
var getPrototypeOf = require('./_object-gpo');
var ordinaryOwnMetadataKeys = metadata.keys;
var toMetaKey = metadata.key;

var ordinaryMetadataKeys = function (O, P) {
  var oKeys = ordinaryOwnMetadataKeys(O, P);
  var parent = getPrototypeOf(O);
  if (parent === null) return oKeys;
  var pKeys = ordinaryMetadataKeys(parent, P);
  return pKeys.length ? oKeys.length ? from(new Set(oKeys.concat(pKeys))) : pKeys : oKeys;
};

metadata.exp({ getMetadataKeys: function getMetadataKeys(target /* , targetKey */) {
  return ordinaryMetadataKeys(anObject(target), arguments.length < 2 ? undefined : toMetaKey(arguments[1]));
} });

},{"./_an-object":47,"./_array-from-iterable":50,"./_metadata":107,"./_object-gpo":120,"./es6.set":285}],356:[function(require,module,exports){
var metadata = require('./_metadata');
var anObject = require('./_an-object');
var getPrototypeOf = require('./_object-gpo');
var ordinaryHasOwnMetadata = metadata.has;
var ordinaryGetOwnMetadata = metadata.get;
var toMetaKey = metadata.key;

var ordinaryGetMetadata = function (MetadataKey, O, P) {
  var hasOwn = ordinaryHasOwnMetadata(MetadataKey, O, P);
  if (hasOwn) return ordinaryGetOwnMetadata(MetadataKey, O, P);
  var parent = getPrototypeOf(O);
  return parent !== null ? ordinaryGetMetadata(MetadataKey, parent, P) : undefined;
};

metadata.exp({ getMetadata: function getMetadata(metadataKey, target /* , targetKey */) {
  return ordinaryGetMetadata(metadataKey, anObject(target), arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
} });

},{"./_an-object":47,"./_metadata":107,"./_object-gpo":120}],357:[function(require,module,exports){
var metadata = require('./_metadata');
var anObject = require('./_an-object');
var ordinaryOwnMetadataKeys = metadata.keys;
var toMetaKey = metadata.key;

metadata.exp({ getOwnMetadataKeys: function getOwnMetadataKeys(target /* , targetKey */) {
  return ordinaryOwnMetadataKeys(anObject(target), arguments.length < 2 ? undefined : toMetaKey(arguments[1]));
} });

},{"./_an-object":47,"./_metadata":107}],358:[function(require,module,exports){
var metadata = require('./_metadata');
var anObject = require('./_an-object');
var ordinaryGetOwnMetadata = metadata.get;
var toMetaKey = metadata.key;

metadata.exp({ getOwnMetadata: function getOwnMetadata(metadataKey, target /* , targetKey */) {
  return ordinaryGetOwnMetadata(metadataKey, anObject(target)
    , arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
} });

},{"./_an-object":47,"./_metadata":107}],359:[function(require,module,exports){
var metadata = require('./_metadata');
var anObject = require('./_an-object');
var getPrototypeOf = require('./_object-gpo');
var ordinaryHasOwnMetadata = metadata.has;
var toMetaKey = metadata.key;

var ordinaryHasMetadata = function (MetadataKey, O, P) {
  var hasOwn = ordinaryHasOwnMetadata(MetadataKey, O, P);
  if (hasOwn) return true;
  var parent = getPrototypeOf(O);
  return parent !== null ? ordinaryHasMetadata(MetadataKey, parent, P) : false;
};

metadata.exp({ hasMetadata: function hasMetadata(metadataKey, target /* , targetKey */) {
  return ordinaryHasMetadata(metadataKey, anObject(target), arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
} });

},{"./_an-object":47,"./_metadata":107,"./_object-gpo":120}],360:[function(require,module,exports){
var metadata = require('./_metadata');
var anObject = require('./_an-object');
var ordinaryHasOwnMetadata = metadata.has;
var toMetaKey = metadata.key;

metadata.exp({ hasOwnMetadata: function hasOwnMetadata(metadataKey, target /* , targetKey */) {
  return ordinaryHasOwnMetadata(metadataKey, anObject(target)
    , arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
} });

},{"./_an-object":47,"./_metadata":107}],361:[function(require,module,exports){
var $metadata = require('./_metadata');
var anObject = require('./_an-object');
var aFunction = require('./_a-function');
var toMetaKey = $metadata.key;
var ordinaryDefineOwnMetadata = $metadata.set;

$metadata.exp({ metadata: function metadata(metadataKey, metadataValue) {
  return function decorator(target, targetKey) {
    ordinaryDefineOwnMetadata(
      metadataKey, metadataValue,
      (targetKey !== undefined ? anObject : aFunction)(target),
      toMetaKey(targetKey)
    );
  };
} });

},{"./_a-function":43,"./_an-object":47,"./_metadata":107}],362:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.from
require('./_set-collection-from')('Set');

},{"./_set-collection-from":138}],363:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
require('./_set-collection-of')('Set');

},{"./_set-collection-of":139}],364:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export = require('./_export');

$export($export.P + $export.R, 'Set', { toJSON: require('./_collection-to-json')('Set') });

},{"./_collection-to-json":60,"./_export":73}],365:[function(require,module,exports){
'use strict';
// https://github.com/mathiasbynens/String.prototype.at
var $export = require('./_export');
var $at = require('./_string-at')(true);

$export($export.P, 'String', {
  at: function at(pos) {
    return $at(this, pos);
  }
});

},{"./_export":73,"./_string-at":147}],366:[function(require,module,exports){
'use strict';
// https://tc39.github.io/String.prototype.matchAll/
var $export = require('./_export');
var defined = require('./_defined');
var toLength = require('./_to-length');
var isRegExp = require('./_is-regexp');
var getFlags = require('./_flags');
var RegExpProto = RegExp.prototype;

var $RegExpStringIterator = function (regexp, string) {
  this._r = regexp;
  this._s = string;
};

require('./_iter-create')($RegExpStringIterator, 'RegExp String', function next() {
  var match = this._r.exec(this._s);
  return { value: match, done: match === null };
});

$export($export.P, 'String', {
  matchAll: function matchAll(regexp) {
    defined(this);
    if (!isRegExp(regexp)) throw TypeError(regexp + ' is not a regexp!');
    var S = String(this);
    var flags = 'flags' in RegExpProto ? String(regexp.flags) : getFlags.call(regexp);
    var rx = new RegExp(regexp.source, ~flags.indexOf('g') ? flags : 'g' + flags);
    rx.lastIndex = toLength(regexp.lastIndex);
    return new $RegExpStringIterator(rx, S);
  }
});

},{"./_defined":68,"./_export":73,"./_flags":77,"./_is-regexp":92,"./_iter-create":94,"./_to-length":159}],367:[function(require,module,exports){
'use strict';
// https://github.com/tc39/proposal-string-pad-start-end
var $export = require('./_export');
var $pad = require('./_string-pad');
var userAgent = require('./_user-agent');

// https://github.com/zloirock/core-js/issues/280
$export($export.P + $export.F * /Version\/10\.\d+(\.\d+)? Safari\//.test(userAgent), 'String', {
  padEnd: function padEnd(maxLength /* , fillString = ' ' */) {
    return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, false);
  }
});

},{"./_export":73,"./_string-pad":150,"./_user-agent":166}],368:[function(require,module,exports){
'use strict';
// https://github.com/tc39/proposal-string-pad-start-end
var $export = require('./_export');
var $pad = require('./_string-pad');
var userAgent = require('./_user-agent');

// https://github.com/zloirock/core-js/issues/280
$export($export.P + $export.F * /Version\/10\.\d+(\.\d+)? Safari\//.test(userAgent), 'String', {
  padStart: function padStart(maxLength /* , fillString = ' ' */) {
    return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, true);
  }
});

},{"./_export":73,"./_string-pad":150,"./_user-agent":166}],369:[function(require,module,exports){
'use strict';
// https://github.com/sebmarkbage/ecmascript-string-left-right-trim
require('./_string-trim')('trimLeft', function ($trim) {
  return function trimLeft() {
    return $trim(this, 1);
  };
}, 'trimStart');

},{"./_string-trim":152}],370:[function(require,module,exports){
'use strict';
// https://github.com/sebmarkbage/ecmascript-string-left-right-trim
require('./_string-trim')('trimRight', function ($trim) {
  return function trimRight() {
    return $trim(this, 2);
  };
}, 'trimEnd');

},{"./_string-trim":152}],371:[function(require,module,exports){
require('./_wks-define')('asyncIterator');

},{"./_wks-define":168}],372:[function(require,module,exports){
require('./_wks-define')('observable');

},{"./_wks-define":168}],373:[function(require,module,exports){
// https://github.com/tc39/proposal-global
var $export = require('./_export');

$export($export.S, 'System', { global: require('./_global') });

},{"./_export":73,"./_global":80}],374:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.from
require('./_set-collection-from')('WeakMap');

},{"./_set-collection-from":138}],375:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.of
require('./_set-collection-of')('WeakMap');

},{"./_set-collection-of":139}],376:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.from
require('./_set-collection-from')('WeakSet');

},{"./_set-collection-from":138}],377:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.of
require('./_set-collection-of')('WeakSet');

},{"./_set-collection-of":139}],378:[function(require,module,exports){
var $iterators = require('./es6.array.iterator');
var getKeys = require('./_object-keys');
var redefine = require('./_redefine');
var global = require('./_global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var wks = require('./_wks');
var ITERATOR = wks('iterator');
var TO_STRING_TAG = wks('toStringTag');
var ArrayValues = Iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true, // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true, // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME = collections[i];
  var explicit = DOMIterables[NAME];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  var key;
  if (proto) {
    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    if (explicit) for (key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);
  }
}

},{"./_global":80,"./_hide":82,"./_iterators":98,"./_object-keys":122,"./_redefine":135,"./_wks":170,"./es6.array.iterator":195}],379:[function(require,module,exports){
var $export = require('./_export');
var $task = require('./_task');
$export($export.G + $export.B, {
  setImmediate: $task.set,
  clearImmediate: $task.clear
});

},{"./_export":73,"./_task":154}],380:[function(require,module,exports){
// ie9- setTimeout & setInterval additional parameters fix
var global = require('./_global');
var $export = require('./_export');
var userAgent = require('./_user-agent');
var slice = [].slice;
var MSIE = /MSIE .\./.test(userAgent); // <- dirty ie9- check
var wrap = function (set) {
  return function (fn, time /* , ...args */) {
    var boundArgs = arguments.length > 2;
    var args = boundArgs ? slice.call(arguments, 2) : false;
    return set(boundArgs ? function () {
      // eslint-disable-next-line no-new-func
      (typeof fn == 'function' ? fn : Function(fn)).apply(this, args);
    } : fn, time);
  };
};
$export($export.G + $export.B + $export.F * MSIE, {
  setTimeout: wrap(global.setTimeout),
  setInterval: wrap(global.setInterval)
});

},{"./_export":73,"./_global":80,"./_user-agent":166}],381:[function(require,module,exports){
require('./modules/es6.symbol');
require('./modules/es6.object.create');
require('./modules/es6.object.define-property');
require('./modules/es6.object.define-properties');
require('./modules/es6.object.get-own-property-descriptor');
require('./modules/es6.object.get-prototype-of');
require('./modules/es6.object.keys');
require('./modules/es6.object.get-own-property-names');
require('./modules/es6.object.freeze');
require('./modules/es6.object.seal');
require('./modules/es6.object.prevent-extensions');
require('./modules/es6.object.is-frozen');
require('./modules/es6.object.is-sealed');
require('./modules/es6.object.is-extensible');
require('./modules/es6.object.assign');
require('./modules/es6.object.is');
require('./modules/es6.object.set-prototype-of');
require('./modules/es6.object.to-string');
require('./modules/es6.function.bind');
require('./modules/es6.function.name');
require('./modules/es6.function.has-instance');
require('./modules/es6.parse-int');
require('./modules/es6.parse-float');
require('./modules/es6.number.constructor');
require('./modules/es6.number.to-fixed');
require('./modules/es6.number.to-precision');
require('./modules/es6.number.epsilon');
require('./modules/es6.number.is-finite');
require('./modules/es6.number.is-integer');
require('./modules/es6.number.is-nan');
require('./modules/es6.number.is-safe-integer');
require('./modules/es6.number.max-safe-integer');
require('./modules/es6.number.min-safe-integer');
require('./modules/es6.number.parse-float');
require('./modules/es6.number.parse-int');
require('./modules/es6.math.acosh');
require('./modules/es6.math.asinh');
require('./modules/es6.math.atanh');
require('./modules/es6.math.cbrt');
require('./modules/es6.math.clz32');
require('./modules/es6.math.cosh');
require('./modules/es6.math.expm1');
require('./modules/es6.math.fround');
require('./modules/es6.math.hypot');
require('./modules/es6.math.imul');
require('./modules/es6.math.log10');
require('./modules/es6.math.log1p');
require('./modules/es6.math.log2');
require('./modules/es6.math.sign');
require('./modules/es6.math.sinh');
require('./modules/es6.math.tanh');
require('./modules/es6.math.trunc');
require('./modules/es6.string.from-code-point');
require('./modules/es6.string.raw');
require('./modules/es6.string.trim');
require('./modules/es6.string.iterator');
require('./modules/es6.string.code-point-at');
require('./modules/es6.string.ends-with');
require('./modules/es6.string.includes');
require('./modules/es6.string.repeat');
require('./modules/es6.string.starts-with');
require('./modules/es6.string.anchor');
require('./modules/es6.string.big');
require('./modules/es6.string.blink');
require('./modules/es6.string.bold');
require('./modules/es6.string.fixed');
require('./modules/es6.string.fontcolor');
require('./modules/es6.string.fontsize');
require('./modules/es6.string.italics');
require('./modules/es6.string.link');
require('./modules/es6.string.small');
require('./modules/es6.string.strike');
require('./modules/es6.string.sub');
require('./modules/es6.string.sup');
require('./modules/es6.date.now');
require('./modules/es6.date.to-json');
require('./modules/es6.date.to-iso-string');
require('./modules/es6.date.to-string');
require('./modules/es6.date.to-primitive');
require('./modules/es6.array.is-array');
require('./modules/es6.array.from');
require('./modules/es6.array.of');
require('./modules/es6.array.join');
require('./modules/es6.array.slice');
require('./modules/es6.array.sort');
require('./modules/es6.array.for-each');
require('./modules/es6.array.map');
require('./modules/es6.array.filter');
require('./modules/es6.array.some');
require('./modules/es6.array.every');
require('./modules/es6.array.reduce');
require('./modules/es6.array.reduce-right');
require('./modules/es6.array.index-of');
require('./modules/es6.array.last-index-of');
require('./modules/es6.array.copy-within');
require('./modules/es6.array.fill');
require('./modules/es6.array.find');
require('./modules/es6.array.find-index');
require('./modules/es6.array.species');
require('./modules/es6.array.iterator');
require('./modules/es6.regexp.constructor');
require('./modules/es6.regexp.to-string');
require('./modules/es6.regexp.flags');
require('./modules/es6.regexp.match');
require('./modules/es6.regexp.replace');
require('./modules/es6.regexp.search');
require('./modules/es6.regexp.split');
require('./modules/es6.promise');
require('./modules/es6.map');
require('./modules/es6.set');
require('./modules/es6.weak-map');
require('./modules/es6.weak-set');
require('./modules/es6.typed.array-buffer');
require('./modules/es6.typed.data-view');
require('./modules/es6.typed.int8-array');
require('./modules/es6.typed.uint8-array');
require('./modules/es6.typed.uint8-clamped-array');
require('./modules/es6.typed.int16-array');
require('./modules/es6.typed.uint16-array');
require('./modules/es6.typed.int32-array');
require('./modules/es6.typed.uint32-array');
require('./modules/es6.typed.float32-array');
require('./modules/es6.typed.float64-array');
require('./modules/es6.reflect.apply');
require('./modules/es6.reflect.construct');
require('./modules/es6.reflect.define-property');
require('./modules/es6.reflect.delete-property');
require('./modules/es6.reflect.enumerate');
require('./modules/es6.reflect.get');
require('./modules/es6.reflect.get-own-property-descriptor');
require('./modules/es6.reflect.get-prototype-of');
require('./modules/es6.reflect.has');
require('./modules/es6.reflect.is-extensible');
require('./modules/es6.reflect.own-keys');
require('./modules/es6.reflect.prevent-extensions');
require('./modules/es6.reflect.set');
require('./modules/es6.reflect.set-prototype-of');
require('./modules/es7.array.includes');
require('./modules/es7.array.flat-map');
require('./modules/es7.array.flatten');
require('./modules/es7.string.at');
require('./modules/es7.string.pad-start');
require('./modules/es7.string.pad-end');
require('./modules/es7.string.trim-left');
require('./modules/es7.string.trim-right');
require('./modules/es7.string.match-all');
require('./modules/es7.symbol.async-iterator');
require('./modules/es7.symbol.observable');
require('./modules/es7.object.get-own-property-descriptors');
require('./modules/es7.object.values');
require('./modules/es7.object.entries');
require('./modules/es7.object.define-getter');
require('./modules/es7.object.define-setter');
require('./modules/es7.object.lookup-getter');
require('./modules/es7.object.lookup-setter');
require('./modules/es7.map.to-json');
require('./modules/es7.set.to-json');
require('./modules/es7.map.of');
require('./modules/es7.set.of');
require('./modules/es7.weak-map.of');
require('./modules/es7.weak-set.of');
require('./modules/es7.map.from');
require('./modules/es7.set.from');
require('./modules/es7.weak-map.from');
require('./modules/es7.weak-set.from');
require('./modules/es7.global');
require('./modules/es7.system.global');
require('./modules/es7.error.is-error');
require('./modules/es7.math.clamp');
require('./modules/es7.math.deg-per-rad');
require('./modules/es7.math.degrees');
require('./modules/es7.math.fscale');
require('./modules/es7.math.iaddh');
require('./modules/es7.math.isubh');
require('./modules/es7.math.imulh');
require('./modules/es7.math.rad-per-deg');
require('./modules/es7.math.radians');
require('./modules/es7.math.scale');
require('./modules/es7.math.umulh');
require('./modules/es7.math.signbit');
require('./modules/es7.promise.finally');
require('./modules/es7.promise.try');
require('./modules/es7.reflect.define-metadata');
require('./modules/es7.reflect.delete-metadata');
require('./modules/es7.reflect.get-metadata');
require('./modules/es7.reflect.get-metadata-keys');
require('./modules/es7.reflect.get-own-metadata');
require('./modules/es7.reflect.get-own-metadata-keys');
require('./modules/es7.reflect.has-metadata');
require('./modules/es7.reflect.has-own-metadata');
require('./modules/es7.reflect.metadata');
require('./modules/es7.asap');
require('./modules/es7.observable');
require('./modules/web.timers');
require('./modules/web.immediate');
require('./modules/web.dom.iterable');
module.exports = require('./modules/_core');

},{"./modules/_core":63,"./modules/es6.array.copy-within":185,"./modules/es6.array.every":186,"./modules/es6.array.fill":187,"./modules/es6.array.filter":188,"./modules/es6.array.find":190,"./modules/es6.array.find-index":189,"./modules/es6.array.for-each":191,"./modules/es6.array.from":192,"./modules/es6.array.index-of":193,"./modules/es6.array.is-array":194,"./modules/es6.array.iterator":195,"./modules/es6.array.join":196,"./modules/es6.array.last-index-of":197,"./modules/es6.array.map":198,"./modules/es6.array.of":199,"./modules/es6.array.reduce":201,"./modules/es6.array.reduce-right":200,"./modules/es6.array.slice":202,"./modules/es6.array.some":203,"./modules/es6.array.sort":204,"./modules/es6.array.species":205,"./modules/es6.date.now":206,"./modules/es6.date.to-iso-string":207,"./modules/es6.date.to-json":208,"./modules/es6.date.to-primitive":209,"./modules/es6.date.to-string":210,"./modules/es6.function.bind":211,"./modules/es6.function.has-instance":212,"./modules/es6.function.name":213,"./modules/es6.map":214,"./modules/es6.math.acosh":215,"./modules/es6.math.asinh":216,"./modules/es6.math.atanh":217,"./modules/es6.math.cbrt":218,"./modules/es6.math.clz32":219,"./modules/es6.math.cosh":220,"./modules/es6.math.expm1":221,"./modules/es6.math.fround":222,"./modules/es6.math.hypot":223,"./modules/es6.math.imul":224,"./modules/es6.math.log10":225,"./modules/es6.math.log1p":226,"./modules/es6.math.log2":227,"./modules/es6.math.sign":228,"./modules/es6.math.sinh":229,"./modules/es6.math.tanh":230,"./modules/es6.math.trunc":231,"./modules/es6.number.constructor":232,"./modules/es6.number.epsilon":233,"./modules/es6.number.is-finite":234,"./modules/es6.number.is-integer":235,"./modules/es6.number.is-nan":236,"./modules/es6.number.is-safe-integer":237,"./modules/es6.number.max-safe-integer":238,"./modules/es6.number.min-safe-integer":239,"./modules/es6.number.parse-float":240,"./modules/es6.number.parse-int":241,"./modules/es6.number.to-fixed":242,"./modules/es6.number.to-precision":243,"./modules/es6.object.assign":244,"./modules/es6.object.create":245,"./modules/es6.object.define-properties":246,"./modules/es6.object.define-property":247,"./modules/es6.object.freeze":248,"./modules/es6.object.get-own-property-descriptor":249,"./modules/es6.object.get-own-property-names":250,"./modules/es6.object.get-prototype-of":251,"./modules/es6.object.is":255,"./modules/es6.object.is-extensible":252,"./modules/es6.object.is-frozen":253,"./modules/es6.object.is-sealed":254,"./modules/es6.object.keys":256,"./modules/es6.object.prevent-extensions":257,"./modules/es6.object.seal":258,"./modules/es6.object.set-prototype-of":259,"./modules/es6.object.to-string":260,"./modules/es6.parse-float":261,"./modules/es6.parse-int":262,"./modules/es6.promise":263,"./modules/es6.reflect.apply":264,"./modules/es6.reflect.construct":265,"./modules/es6.reflect.define-property":266,"./modules/es6.reflect.delete-property":267,"./modules/es6.reflect.enumerate":268,"./modules/es6.reflect.get":271,"./modules/es6.reflect.get-own-property-descriptor":269,"./modules/es6.reflect.get-prototype-of":270,"./modules/es6.reflect.has":272,"./modules/es6.reflect.is-extensible":273,"./modules/es6.reflect.own-keys":274,"./modules/es6.reflect.prevent-extensions":275,"./modules/es6.reflect.set":277,"./modules/es6.reflect.set-prototype-of":276,"./modules/es6.regexp.constructor":278,"./modules/es6.regexp.flags":279,"./modules/es6.regexp.match":280,"./modules/es6.regexp.replace":281,"./modules/es6.regexp.search":282,"./modules/es6.regexp.split":283,"./modules/es6.regexp.to-string":284,"./modules/es6.set":285,"./modules/es6.string.anchor":286,"./modules/es6.string.big":287,"./modules/es6.string.blink":288,"./modules/es6.string.bold":289,"./modules/es6.string.code-point-at":290,"./modules/es6.string.ends-with":291,"./modules/es6.string.fixed":292,"./modules/es6.string.fontcolor":293,"./modules/es6.string.fontsize":294,"./modules/es6.string.from-code-point":295,"./modules/es6.string.includes":296,"./modules/es6.string.italics":297,"./modules/es6.string.iterator":298,"./modules/es6.string.link":299,"./modules/es6.string.raw":300,"./modules/es6.string.repeat":301,"./modules/es6.string.small":302,"./modules/es6.string.starts-with":303,"./modules/es6.string.strike":304,"./modules/es6.string.sub":305,"./modules/es6.string.sup":306,"./modules/es6.string.trim":307,"./modules/es6.symbol":308,"./modules/es6.typed.array-buffer":309,"./modules/es6.typed.data-view":310,"./modules/es6.typed.float32-array":311,"./modules/es6.typed.float64-array":312,"./modules/es6.typed.int16-array":313,"./modules/es6.typed.int32-array":314,"./modules/es6.typed.int8-array":315,"./modules/es6.typed.uint16-array":316,"./modules/es6.typed.uint32-array":317,"./modules/es6.typed.uint8-array":318,"./modules/es6.typed.uint8-clamped-array":319,"./modules/es6.weak-map":320,"./modules/es6.weak-set":321,"./modules/es7.array.flat-map":322,"./modules/es7.array.flatten":323,"./modules/es7.array.includes":324,"./modules/es7.asap":325,"./modules/es7.error.is-error":326,"./modules/es7.global":327,"./modules/es7.map.from":328,"./modules/es7.map.of":329,"./modules/es7.map.to-json":330,"./modules/es7.math.clamp":331,"./modules/es7.math.deg-per-rad":332,"./modules/es7.math.degrees":333,"./modules/es7.math.fscale":334,"./modules/es7.math.iaddh":335,"./modules/es7.math.imulh":336,"./modules/es7.math.isubh":337,"./modules/es7.math.rad-per-deg":338,"./modules/es7.math.radians":339,"./modules/es7.math.scale":340,"./modules/es7.math.signbit":341,"./modules/es7.math.umulh":342,"./modules/es7.object.define-getter":343,"./modules/es7.object.define-setter":344,"./modules/es7.object.entries":345,"./modules/es7.object.get-own-property-descriptors":346,"./modules/es7.object.lookup-getter":347,"./modules/es7.object.lookup-setter":348,"./modules/es7.object.values":349,"./modules/es7.observable":350,"./modules/es7.promise.finally":351,"./modules/es7.promise.try":352,"./modules/es7.reflect.define-metadata":353,"./modules/es7.reflect.delete-metadata":354,"./modules/es7.reflect.get-metadata":356,"./modules/es7.reflect.get-metadata-keys":355,"./modules/es7.reflect.get-own-metadata":358,"./modules/es7.reflect.get-own-metadata-keys":357,"./modules/es7.reflect.has-metadata":359,"./modules/es7.reflect.has-own-metadata":360,"./modules/es7.reflect.metadata":361,"./modules/es7.set.from":362,"./modules/es7.set.of":363,"./modules/es7.set.to-json":364,"./modules/es7.string.at":365,"./modules/es7.string.match-all":366,"./modules/es7.string.pad-end":367,"./modules/es7.string.pad-start":368,"./modules/es7.string.trim-left":369,"./modules/es7.string.trim-right":370,"./modules/es7.symbol.async-iterator":371,"./modules/es7.symbol.observable":372,"./modules/es7.system.global":373,"./modules/es7.weak-map.from":374,"./modules/es7.weak-map.of":375,"./modules/es7.weak-set.from":376,"./modules/es7.weak-set.of":377,"./modules/web.dom.iterable":378,"./modules/web.immediate":379,"./modules/web.timers":380}],382:[function(require,module,exports){
var dictionary = {
  words: [
    'ad',
    'adipisicing',
    'aliqua',
    'aliquip',
    'amet',
    'anim',
    'aute',
    'cillum',
    'commodo',
    'consectetur',
    'consequat',
    'culpa',
    'cupidatat',
    'deserunt',
    'do',
    'dolor',
    'dolore',
    'duis',
    'ea',
    'eiusmod',
    'elit',
    'enim',
    'esse',
    'est',
    'et',
    'eu',
    'ex',
    'excepteur',
    'exercitation',
    'fugiat',
    'id',
    'in',
    'incididunt',
    'ipsum',
    'irure',
    'labore',
    'laboris',
    'laborum',
    'Lorem',
    'magna',
    'minim',
    'mollit',
    'nisi',
    'non',
    'nostrud',
    'nulla',
    'occaecat',
    'officia',
    'pariatur',
    'proident',
    'qui',
    'quis',
    'reprehenderit',
    'sint',
    'sit',
    'sunt',
    'tempor',
    'ullamco',
    'ut',
    'velit',
    'veniam',
    'voluptate'  
  ]
};

module.exports = dictionary;
},{}],383:[function(require,module,exports){
var generator = function() {
  var options = (arguments.length) ? arguments[0] : {}
    , count = options.count || 1
    , units = options.units || 'sentences'
    , sentenceLowerBound = options.sentenceLowerBound || 5
    , sentenceUpperBound = options.sentenceUpperBound || 15
    , paragraphLowerBound = options.paragraphLowerBound || 3
    , paragraphUpperBound = options.paragraphUpperBound || 7
    , format = options.format || 'plain'
    , words = options.words || require('./dictionary').words
    , random = options.random || Math.random
    , suffix = options.suffix;

  if (!suffix) {
    var isNode = typeof module !== 'undefined' && module.exports;
    var isReactNative = typeof product !== 'undefined' && product.navigator === 'ReactNative';

    if (!isReactNative && isNode) {
      suffix = require('os').EOL;
    } else {
      suffix = '\n';
    }
  }

  units = simplePluralize(units.toLowerCase());

  var randomInteger = function(min, max) {
    return Math.floor(random() * (max - min + 1) + min);
  };

  var randomWord = function(words) {
    return words[randomInteger(0, words.length - 1)];
  };

  var randomSentence = function(words, lowerBound, upperBound) {
    var sentence = ''
      , bounds = {min: 0, max: randomInteger(lowerBound, upperBound)};

    while (bounds.min < bounds.max) {
      sentence = sentence + ' ' + randomWord(words);
      bounds.min = bounds.min + 1;
    }

    if (sentence.length) {
      sentence = sentence.slice(1);
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    }

    return sentence;
  };

  var randomParagraph = function(words, lowerBound, upperBound, sentenceLowerBound, sentenceUpperBound) {
    var paragraph = ''
      , bounds = {min: 0, max: randomInteger(lowerBound, upperBound)};

    while (bounds.min < bounds.max) {
      paragraph = paragraph + '. ' + randomSentence(words, sentenceLowerBound, sentenceUpperBound);
      bounds.min = bounds.min + 1;
    }

    if (paragraph.length) {
      paragraph = paragraph.slice(2);
      paragraph = paragraph + '.';
    }

    return paragraph;
  }

  var iter = 0
    , bounds = {min: 0, max: count}
    , string = ''
    , prefix = ''
    , openingTag
    , closingTag;

  if (format == 'html') {
    openingTag = '<p>';
    closingTag = '</p>';
  }

  while (bounds.min < bounds.max) {
    switch (units.toLowerCase()) {
      case 'words':
        string = string + ' ' + randomWord(words);
        break;
      case 'sentences':
        string = string + '. ' + randomSentence(words, sentenceLowerBound, sentenceUpperBound);
        break;
      case 'paragraphs':
        var nextString = randomParagraph(words, paragraphLowerBound, paragraphUpperBound, sentenceLowerBound, sentenceUpperBound);

        if (format == 'html') {
          nextString = openingTag + nextString + closingTag;
          if (bounds.min < bounds.max - 1) {
            nextString = nextString + suffix; // Each paragraph on a new line
          }
        } else if (bounds.min < bounds.max - 1) {
          nextString = nextString + suffix + suffix; // Double-up the EOL character to make distinct paragraphs, like carriage return
        }

        string = string + nextString;

        break;
    }

    bounds.min = bounds.min + 1;
  }

  if (string.length) {
    var pos = 0;

    if (string.indexOf('. ') == 0) {
      pos = 2;
    } else if (string.indexOf('.') == 0 || string.indexOf(' ') == 0) {
      pos = 1;
    }

    string = string.slice(pos);

    if (units == 'sentences') {
      string = string + '.';
    }
  }

  return string;
};

function simplePluralize(string) {
  if (string.indexOf('s', string.length - 1) === -1) {
    return string + 's';
  }
  return string;
}

module.exports = generator;

},{"./dictionary":382,"os":384}],384:[function(require,module,exports){
exports.endianness = function () { return 'LE' };

exports.hostname = function () {
    if (typeof location !== 'undefined') {
        return location.hostname
    }
    else return '';
};

exports.loadavg = function () { return [] };

exports.uptime = function () { return 0 };

exports.freemem = function () {
    return Number.MAX_VALUE;
};

exports.totalmem = function () {
    return Number.MAX_VALUE;
};

exports.cpus = function () { return [] };

exports.type = function () { return 'Browser' };

exports.release = function () {
    if (typeof navigator !== 'undefined') {
        return navigator.appVersion;
    }
    return '';
};

exports.networkInterfaces
= exports.getNetworkInterfaces
= function () { return {} };

exports.arch = function () { return 'javascript' };

exports.platform = function () { return 'browser' };

exports.tmpdir = exports.tmpDir = function () {
    return '/tmp';
};

exports.EOL = '\n';

exports.homedir = function () {
	return '/'
};

},{}],385:[function(require,module,exports){
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
exports.__esModule = true;
var uniformIntDistribution = function (from, to) {
    var diff = to - from + 1;
    function helper(rng) {
        var nrng = rng;
        var MIN_RNG = rng.min();
        var NUM_VALUES = rng.max() - rng.min() + 1;
        if (diff <= NUM_VALUES) {
            var MAX_ALLOWED = NUM_VALUES - (NUM_VALUES % diff);
            while (true) {
                var _a = __read(nrng.next(), 2), v = _a[0], tmpRng = _a[1];
                var deltaV = v - MIN_RNG;
                nrng = tmpRng;
                return [deltaV % diff + from, nrng];
            }
        }
        var maxRandomValue = 1;
        var numIterationsRequired = 0;
        while (maxRandomValue < diff) {
            maxRandomValue *= NUM_VALUES;
            ++numIterationsRequired;
        }
        var maxAllowedRandom = diff * Math.floor(1. * maxRandomValue / diff);
        while (true) {
            var value = 0;
            for (var num = 0; num !== numIterationsRequired; ++num) {
                var _b = __read(nrng.next(), 2), v = _b[0], tmpRng = _b[1];
                value = NUM_VALUES * value + (v - MIN_RNG);
                nrng = tmpRng;
            }
            if (value < maxAllowedRandom) {
                var inDiff = value - diff * Math.floor(1. * value / diff);
                return [inDiff + from, nrng];
            }
        }
    }
    return helper;
};
exports.uniformIntDistribution = uniformIntDistribution;

},{}],386:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var MULTIPLIER = 0x000343fd;
var INCREMENT = 0x00269ec3;
var MASK = 0xffffffff;
var MASK_2 = (1 << 31) - 1;
var LinearCongruential = (function () {
    function LinearCongruential(seed) {
        this.seed = seed;
    }
    LinearCongruential.prototype.min = function () {
        return LinearCongruential.min;
    };
    LinearCongruential.prototype.max = function () {
        return LinearCongruential.max;
    };
    LinearCongruential.prototype.next = function () {
        var nextseed = (this.seed * MULTIPLIER + INCREMENT) & MASK;
        return [(nextseed & MASK_2) >> 16, new LinearCongruential(nextseed)];
    };
    LinearCongruential.min = 0;
    LinearCongruential.max = Math.pow(2, 15) - 1;
    return LinearCongruential;
}());
function default_1(seed) {
    return new LinearCongruential(seed);
}
exports["default"] = default_1;
;

},{}],387:[function(require,module,exports){
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
function toUint32(num) {
    return (num | 0) >= 0 ? (num | 0) : (num | 0) + 4294967296;
}
function toInt32(num) {
    return num | 0;
}
function productInUint32(a, b) {
    var a32 = toUint32(a);
    var alo = a32 & 0xffff;
    var ahi = (a32 >> 16) & 0xffff;
    var b32 = toUint32(b);
    var blo = b32 & 0xffff;
    var bhi = (b32 >> 16) & 0xffff;
    return toUint32(alo * blo + (alo * bhi + ahi * blo) * 0x10000);
}
function rshiftInUint32(a, shift) {
    return a < 0x80000000
        ? a >> shift
        : ((a - 0x80000000) >> shift) + (1 << (31 - shift));
}
var MersenneTwister = (function () {
    function MersenneTwister(states, index) {
        if (index >= MersenneTwister.N) {
            this.states = MersenneTwister.twist(states);
            this.index = 0;
        }
        else {
            this.states = states;
            this.index = index;
        }
    }
    MersenneTwister.twist = function (prev) {
        var mt = prev.slice();
        for (var idx = 0; idx !== MersenneTwister.N; ++idx) {
            var x = toUint32(toUint32(mt[idx] & MersenneTwister.MASK_UPPER) +
                toUint32(mt[(idx + 1) % MersenneTwister.N] & MersenneTwister.MASK_LOWER));
            var xA = rshiftInUint32(x, 1);
            if (x & 1) {
                xA = toUint32(xA ^ MersenneTwister.A);
            }
            mt[idx] = toUint32(mt[(idx + MersenneTwister.M) % MersenneTwister.N] ^ xA);
        }
        return mt;
    };
    MersenneTwister.seeded = function (seed) {
        var out = __spread(Array(MersenneTwister.N)).map(function () { return 0; });
        out[0] = seed;
        for (var idx = 1; idx !== MersenneTwister.N; ++idx) {
            if (toInt32(out[idx - 1]) < 0) {
                var rescaled = toInt32(out[idx - 1]) + 0x80000000;
                var xored = (rescaled ^ ((rescaled >> 30) + 2)) + 0x80000000;
                out[idx] = toUint32(productInUint32(MersenneTwister.F, xored) + idx);
            }
            else {
                var xored = (out[idx - 1] ^ (out[idx - 1] >> 30));
                out[idx] = toUint32(productInUint32(MersenneTwister.F, xored) + idx);
            }
        }
        return out;
    };
    MersenneTwister.from = function (seed) {
        return new MersenneTwister(MersenneTwister.seeded(seed), MersenneTwister.N);
    };
    MersenneTwister.prototype.min = function () {
        return MersenneTwister.min;
    };
    MersenneTwister.prototype.max = function () {
        return MersenneTwister.max;
    };
    MersenneTwister.prototype.next = function () {
        var y = this.states[this.index];
        y = toUint32(y ^ rshiftInUint32(this.states[this.index], MersenneTwister.U));
        y = toUint32(y ^ ((y << MersenneTwister.S) & MersenneTwister.B));
        y = toUint32(y ^ ((y << MersenneTwister.T) & MersenneTwister.C));
        y = toUint32(y ^ rshiftInUint32(y, MersenneTwister.L));
        return [y, new MersenneTwister(this.states, this.index + 1)];
    };
    MersenneTwister.min = 0;
    MersenneTwister.max = 0xffffffff;
    MersenneTwister.N = 624;
    MersenneTwister.M = 397;
    MersenneTwister.R = 31;
    MersenneTwister.A = 0x9908B0DF;
    MersenneTwister.F = 1812433253;
    MersenneTwister.U = 11;
    MersenneTwister.S = 7;
    MersenneTwister.B = 0x9D2C5680;
    MersenneTwister.T = 15;
    MersenneTwister.C = 0xEFC60000;
    MersenneTwister.L = 18;
    MersenneTwister.MASK_LOWER = (Math.pow(2, MersenneTwister.R)) - 1;
    MersenneTwister.MASK_UPPER = (Math.pow(2, MersenneTwister.R));
    return MersenneTwister;
}());
function default_1(seed) {
    return MersenneTwister.from(seed);
}
exports["default"] = default_1;
;

},{}],388:[function(require,module,exports){
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
exports.__esModule = true;
function generateN(rng, num) {
    var cur = rng;
    var out = [];
    for (var idx = 0; idx != num; ++idx) {
        var _a = __read(cur.next(), 2), value = _a[0], next = _a[1];
        out.push(value);
        cur = next;
    }
    return [out, cur];
}
exports.generateN = generateN;
function skipN(rng, num) {
    return generateN(rng, num)[1];
}
exports.skipN = skipN;

},{}],389:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var RandomGenerator_1 = require("./generator/RandomGenerator");
exports.generateN = RandomGenerator_1.generateN;
exports.skipN = RandomGenerator_1.skipN;
var LinearCongruential_1 = require("./generator/LinearCongruential");
exports.congruential = LinearCongruential_1["default"];
var MersenneTwister_1 = require("./generator/MersenneTwister");
exports.mersenne = MersenneTwister_1["default"];
var UniformDistribution_1 = require("./distribution/UniformDistribution");
exports.uniformIntDistribution = UniformDistribution_1.uniformIntDistribution;

},{"./distribution/UniformDistribution":385,"./generator/LinearCongruential":386,"./generator/MersenneTwister":387,"./generator/RandomGenerator":388}],390:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
exports.__esModule = true;
var prand = require("./pure-rand-default");
exports["default"] = prand;
__export(require("./pure-rand-default"));

},{"./pure-rand-default":389}]},{},[39])(39)
});
