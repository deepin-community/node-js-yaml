function toUint32(num) {
    return (num | 0) >= 0 ? num | 0 : (num | 0) + 4294967296;
}
function product32bits(a, b) {
    var alo = a & 0xffff;
    var ahi = (a >>> 16) & 0xffff;
    var blo = b & 0xffff;
    var bhi = (b >>> 16) & 0xffff;
    return alo * blo + ((alo * bhi + ahi * blo) << 16);
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
            var x = (mt[idx] & MersenneTwister.MASK_UPPER) + (mt[(idx + 1) % MersenneTwister.N] & MersenneTwister.MASK_LOWER);
            var xA = x >>> 1;
            if (x & 1) {
                xA ^= MersenneTwister.A;
            }
            mt[idx] = mt[(idx + MersenneTwister.M) % MersenneTwister.N] ^ xA;
        }
        return mt;
    };
    MersenneTwister.seeded = function (seed) {
        var out = Array(MersenneTwister.N);
        out[0] = seed;
        for (var idx = 1; idx !== MersenneTwister.N; ++idx) {
            var xored = out[idx - 1] ^ (out[idx - 1] >>> 30);
            out[idx] = (product32bits(MersenneTwister.F, xored) + idx) | 0;
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
        y ^= this.states[this.index] >>> MersenneTwister.U;
        y ^= (y << MersenneTwister.S) & MersenneTwister.B;
        y ^= (y << MersenneTwister.T) & MersenneTwister.C;
        y ^= y >>> MersenneTwister.L;
        return [toUint32(y), new MersenneTwister(this.states, this.index + 1)];
    };
    MersenneTwister.min = 0;
    MersenneTwister.max = 0xffffffff;
    MersenneTwister.N = 624;
    MersenneTwister.M = 397;
    MersenneTwister.R = 31;
    MersenneTwister.A = 0x9908b0df;
    MersenneTwister.F = 1812433253;
    MersenneTwister.U = 11;
    MersenneTwister.S = 7;
    MersenneTwister.B = 0x9d2c5680;
    MersenneTwister.T = 15;
    MersenneTwister.C = 0xefc60000;
    MersenneTwister.L = 18;
    MersenneTwister.MASK_LOWER = Math.pow(2, MersenneTwister.R) - 1;
    MersenneTwister.MASK_UPPER = Math.pow(2, MersenneTwister.R);
    return MersenneTwister;
}());
export default function (seed) {
    return MersenneTwister.from(seed);
}
