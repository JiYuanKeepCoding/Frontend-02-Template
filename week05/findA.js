function findA(str) {
    const aOccurs = [];
    str.split("").forEach((char, i) => {
        if (char === 'a') {
            aOccurs.push(i);
        }
    })
    return aOccurs;
}

console.log(findA("aabbaa"));