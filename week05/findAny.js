function findAny(str, substr) {

    const matchChars = substr.split('');
    let stateSet = new Set();
    
    function getFindN(n) {
        return (inputChar) => {
            if (matchChars[n] === inputChar) {
                if (n === matchChars.length - 1) {
                    return end;
                } else {
                    return getFindN(n + 1);
                }
            } else {
                return getFindN(0);
            }
        }
    }

    for (char of str) {
        let newStateSet = new Set();
        stateSet.add(getFindN(0));
        for (state of stateSet) {
            newStateSet.add(state(char));
        }
        stateSet = newStateSet;
    }
    return stateSet.has(end);
}



function end(char) {
    return end;
}


console.log(findAny("123abcabxdeqwe", "abcabx"));
console.log(findAny("qwegaqb", "abcabx"));
console.log(findAny("123abababababxqwebxdeqwe","abababx"));