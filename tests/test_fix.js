function fixPostfixNot(expr) {
    let result = '';
    for (let i = 0; i < expr.length; i++) {
        if (/['’‘′\`´~]/.test(expr[i])) {
            let j = result.length - 1;
            while (j >= 0 && /\s/.test(result[j])) j--;
            if (j >= 0) {
                if (/[A-Z]/i.test(result[j])) {
                    result = result.substring(0, j) + '(!' + result[j] + ')' + result.substring(j + 1);
                } else if (result[j] === ')') {
                    let parenCount = 1;
                    let k = j - 1;
                    while (k >= 0 && parenCount > 0) {
                        if (result[k] === ')') parenCount++;
                        else if (result[k] === '(') parenCount--;
                        k--;
                    }
                    if (parenCount === 0) {
                        k++;
                        result = result.substring(0, k) + '(!' + result.substring(k, j + 1) + ')' + result.substring(j + 1);
                    } else {
                        result += expr[i];
                    }
                } else {
                     result += expr[i];
                }
            }
        } else {
            result += expr[i];
        }
    }
    return result;
}

console.log(fixPostfixNot("AB(C+C ' )D"));
console.log(fixPostfixNot("(A+B)'"));
console.log(fixPostfixNot("C'"));
