const matchChars = ['a', 'b', 'c', 'a', 'b', 'x'];

function findAB(str) {
    let state = getFindN(0)
    for (char of str) {
        state = state(char);
    }
    return state === end;
}

function getFindN(n) {
    return (inputChar) => {
        if (matchChars[n] === inputChar) {
            if (n === matchChars.length - 1) {
                return end;
            } else {
                return getFindN(n + 1);
            }
        } else {
            if (n === 5 && inputChar === 'c') {
                return getFindN(3);
            }
            return getFindN(0);
        }
    }
}

function end(char) {
    return end;
}


console.log(findAB("123abcabxdeqwe"));
console.log(findAB("qwegaqb"));
console.log(findAB("123abcabcabxdeqwe"));