function utf8Encoding(str) {
    const codePoints = str2CodePoints(str);
    const bytes = [];
    for (let i = 0; i < codePoints.length; i ++) {
        let codePoint = codePoints[i];
        const byteCount = calculateByteCount(codePoint);
        if (byteCount === 1) {
            bytes.push(codePoint & 0xFF);
        } else {
            let j = (byteCount - 1) * 6;
            //第一个字节后四位 与上 utf8约定的表示字节数量的前四位
            firstByte = (codePoint >> j) | (0xFF >> (8 - byteCount) << (8 - byteCount));
            bytes.push(firstByte);
            //塞进了bytes之后前几位就不需要了，清除掉
            codePoint = codePoint & maxNbitNumber(j);
            //每6位生成一个字节，塞到bytes里面
            for (let k = 1; k < byteCount; k ++) {
                let afterByte;
                if (codePoint < minNbitNumber(6)) {
                    afterByte = (codePoint >> (j - 6 * k)) | minNbitNumber(8);
                } else {
                    afterByte = (codePoint >> (j - 6 * k)) | minNbitNumber(8);
                    codePoint = codePoint & maxNbitNumber(j - 6 * k);
                }
                bytes.push(afterByte);
            }
        }
    }
    console.log(bytes.map(byte => {
        return byte.toString(16);
    }).join(","));
    return Buffer.from(bytes);
}

function str2CodePoints(str) {
    return str.split('').map(char => {
        return char.codePointAt(0);
    });
}

function calculateByteCount(codePoint) {
    if (codePoint < maxNbytesCodePoint(1)) {
        return 1;
    } else if (codePoint < maxNbytesCodePoint(2)) {
        return 2;
    } else if (codePoint < maxNbytesCodePoint(3)) {
        return 3;
    } else {
        return 4;
    }
}

function maxNbytesCodePoint(n) {
    if (n === 1) {
        return Math.pow(2, 7) - 1;
    }
    //第一个字节4个有效位，后面的字节6个有效位
    return Math.pow(2, 6 * (n - 1) + 4) - 1;
}

function maxNbitNumber(n) {
    return Math.pow(2, n) - 1;
}

function minNbitNumber(n) {
    return Math.pow(2, n - 1);
}


console.log(utf8Encoding("哈喽world"))