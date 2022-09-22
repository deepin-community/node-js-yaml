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
//# sourceMappingURL=Runner.js.map