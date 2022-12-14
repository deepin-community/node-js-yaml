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
//# sourceMappingURL=StringArbitrary.js.map