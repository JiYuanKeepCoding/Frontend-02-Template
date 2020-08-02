const STATE = {
    UNMATCHED: 0,
    MATCHING: 1,
    MATCHED: 2
}

const matchChars = ['a', 'b', 'c', 'd', 'e'];

function findAB(str) {
    let matchingChars = []; 
    let state = STATE.UNMATCHED;

    function nextState(char) {
        if (state === STATE.UNMATCHED && char === matchChars[0]) {
            matchingChars.push(char);
            return STATE.MATCHING;
        } else if (state === STATE.MATCHING && char === matchChars[matchingChars.length]) {
            matchingChars.push(char);
            if (matchingChars.length === matchChars.length) {
                return STATE.MATCHED;
            } else {
                return STATE.MATCHING;
            }
        } else {
            if (char === matchChars[0]) {
                matchingChars = [char];
                return STATE.MATCHING;
            } else {
                matchingChars = [];
                return STATE.UNMATCHED;
            }
        }
    }
    
    for (char of str) {
        state = nextState(char);
        if (state === STATE.MATCHED) {
            return true;
        }
    }
    return false;
} 

console.log(findAB("123ababcdeqwe"));
console.log(findAB("qwegaqb"))