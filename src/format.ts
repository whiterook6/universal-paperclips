// create a number format for printing bigints with commas
const commas = new Intl.NumberFormat("en-US");
export const printNumberWithCommas = (bigInt: bigint | number): string => {
    return commas.format(bigInt);
};

const suffixes = [
    "", // 0
    "thousand", // 3
    "million", // 6
    "billion", // 9
    "trillion", // 12
    "quadrillion", //15 
    "quintillion", // 18
    "sextillion", // 21
    "septillion", // 24
    "octillion", // 27
    "nonillion", // 30
    "decillion", // 33
    "undecillion", // 36
    "duodecillion", // 39
    "tredecillion", // 42
    "quattuordecillion", // 45
    "quindecillion", // 48
    "sedecillion", // 51
    "septendecillion", // 54
    "octodecillion", // 57
    "novendecillion", // 60
    "vigintillion", // 63
    "unvigintillion", // 66
    "duovigintillion", // 69
    "tresvigintillion", // 72
    "quattuorvigintillion", // 75
    "quinvigintillion", // 78
    "sesvigintillion", // 81
    "septemvigintillion", // 84
    "octovigintillion", // 87
    "novemvigintillion", // 90
    "trigintillion", // 93
    "untrigintillion", // 96
    "duotrigintillion", // 99
    "trestrigintillion", // 102
    "quattuortrigintillion", // 105 
    "quintrigintillion", // 108
    "sestrigintillion", // 111
    "septentrigintillion", // 114
    "octotrigintillion", // 117
    "noventrigintillion", // 120
    "quadragintillion", // 123
    "unquadragintillion", // 126
    "duoquadragintillion", // 129
    "tresquadragintillion", // 132
    "quattuorquadragintillion", // 135
    "quinquadragintillion", // 138
    "sesquadragintillion", // 141
    "septenquadragintillion", // 144
    "octoquadragintillion", // 147
    "novenquadragintillion", // 150
    "quinquagintillion", // 153
    "unquinquagintillion", // 156
    "duoquinquagintillion", // 159
    "tresquinquagintillion", // 162
    "quattuorquinquagintillion", // 165
    "quinquinquagintillion", // 168
    "sesquinquagintillion", // 171
    "septenquinquagintillion", // 174
    "octoquinquagintillion", // 177
    "novenquinquagintillion", // 180
    "sexagintillion", // 183
    "unsexagintillion", // 186
    "duosexagintillion", // 189
    "tresexagintillion", // 192
    "quattuorsexagintillion", // 195
    "quinsexagintillion", // 198
    "sesexagintillion", // 201
    "septensexagintillion", // 204
    "octosexagintillion", // 207
    "novensexagintillion", // 210
    "septuagintillion", // 213
    "unseptuagintillion", // 216
    "duoseptuagintillion", // 219
    "treseptuagintillion", // 222
    "quattuorseptuagintillion", // 225
    "quinseptuagintillion", // 228
    "seseptuagintillion", // 231
    "septenseptuagintillion", // 234
    "octoseptuagintillion", // 237
    "novenseptuagintillion", // 240
    "octogintillion", // 243
    "unoctogintillion", // 246
    "duooctogintillion", // 249
    "tresoctogintillion", // 252
    "quattuoroctogintillion", // 255
    "quinoctogintillion", // 258
    "sexoctogintillion", // 261
    "septemoctogintillion", // 264
    "octooctogintillion", // 267
    "novemoctogintillion", // 270
    "nonagintillion", // 273
    "unnonagintillion", // 276
    "duononagintillion", // 279
    "trenonagintillion", // 282
    "quattuornonagintillion", // 285
    "quinnonagintillion", // 288
    "senonagintillion", // 291
    "septenonagintillion", // 294
    "octononagintillion", // 297
    "novenonagintillion", // 300    
];

/**
 * Prints numbers like
            1,000n => 1,000
            1,001n => 1,001
            9,999n => 9,999
           10,000n => 10 thousand
           12,340n => 12 thousand
          123,400n => 123 thousand
        1,234,000n => 1,000 thousand
       12,340,000n => 12,000 thousand
      123,400,000n => 123 million
    1,234,000,000n => 1,000 million
 */
export const printBigIntWithWords = (bigInt: bigint): string => {
    if (bigInt < 10000n){
        return printNumberWithCommas(bigInt);
    }

    let n = bigInt;
    let suffixesIndex = 0;
    while (n > 1000 && suffixesIndex < suffixes.length - 1) {
        n /= 1000n;
        suffixesIndex++;
    }
    if (n < 100 && suffixesIndex > 1){ // back up a step if we can
        return `${printNumberWithCommas(n * 1000n)} ${suffixes[suffixesIndex - 1]}`
    } else {
        return `${printNumberWithCommas(n)} ${suffixes[suffixesIndex]}`;
    }
}

/**
 * Prints a timestamp or age as Yy Dd Hh Mm S.SSSs
 */
export const printMillisecondsAsClock = (milliseconds: number): string => {
    if (milliseconds < 0) {
        return printMillisecondsAsClock(-milliseconds);
    }

    if (milliseconds < 1000) {
        return `${Math.floor(milliseconds)}ms`;
    }

    const seconds = milliseconds / 1000;
    if (seconds < 60){
        return `${seconds.toFixed(2)}s`;
    }

    const secondsMod = seconds % 60;
    const secondsPart = secondsMod < 10 ? `0${secondsMod.toFixed(2)}s` : `${secondsMod.toFixed(2)}s`;
    const minutes = Math.floor(milliseconds / (60 * 1000));
    if (minutes < 60) {
        return `${minutes}m ${secondsPart}`;
    }

    const minutesMod = minutes % 60;
    const minutesPart = minutesMod < 10 ? `0${minutesMod}m ${secondsPart}` : `${minutesMod}m ${secondsPart}`;
    const hours = Math.floor(milliseconds / (60 * 60 * 1000));
    if (hours < 24) {
        return `${hours}h ${minutesPart}`;
    }

    const hoursMod = hours % 24;
    const hoursPart = hoursMod < 10 ? `0${hoursMod}h ${minutesPart}` : `${hoursMod}h ${minutesPart}`;
    const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
    if (days < 365) {
        return `${days}d ${hoursPart}`;
    }

    const daysMod = days % 365;
    const years = Math.floor(milliseconds / (365 * 24 * 60 * 60 * 1000));
    if (daysMod < 10) {
        return `${years}y 00${daysMod}d ${hoursPart}`;
    } else if (daysMod < 100) {
        return `${years}y 0${daysMod}d ${hoursPart}`;
    } else {
        return `${years}y ${daysMod}d ${hoursPart}`;
    }
}