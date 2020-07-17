function stringToNumber(str) {
    const notation = getNotation(str)
    const numArray = str2NumArray(str, notation);
    let numResult = 0;
    numArray.forEach((num, i) => {
        //根据进制得出实际number
        numResult += num * Math.pow(notation, numArray.length - i - 1);
    })
    return numResult;
}

function numberToString(num, notation) {
    let numStr = '';
    //短除法拼字符串
    while (num > 0) {
        const m = num % notation;
        num = Math.floor(num/notation);
        numStr = m + numStr;
    }
    return numStr;
}

function str2NumArray(str, notation) {
    if (notation !== 10) {
        str = str.substr(2);
    }
    return str.split('').map(char => {
        const cp = char.codePointAt(0);
        let result = Number.MAX_SAFE_INTEGER;
        if (cp >= 48 && cp <= 57) {
            result = cp - 48;
        } else if (cp >= 97 && cp <= 102){
            result = cp - 87;
        }
        if (notation < result) {
            const err = `${str} is not supported in ${notation} notation`;
            throw err
        }
        return result;
    });
}

function getNotation(str) {
    const mapping = {'0x': 16, '0b': 2, '0o': 8};
    let notation = mapping[str.substr(0,2)];
    return notation? notation : 10;
}

console.log(stringToNumber('0x130'));
console.log(stringToNumber('0b100'));
console.log(stringToNumber('0o130'));
console.log(stringToNumber('130'));
console.log(numberToString(304, 16));
console.log(numberToString(4, 2));
console.log(numberToString(88, 8));
console.log(numberToString(130, 10));