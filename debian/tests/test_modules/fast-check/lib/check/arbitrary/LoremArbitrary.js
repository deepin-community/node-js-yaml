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
//# sourceMappingURL=LoremArbitrary.js.map