function findAB(str) {
    const stack = [];
    for (char of str) {
        if (stack.length > 0) {
            if (char === 'b') {
                return true;
            } else {
                stack.pop();
            }
        } else if (char === 'a') {
            stack.push(char);
        }
    }
    return false;
} 

console.log(findAB("qwegabc"));
console.log(findAB("qwegaqb"))