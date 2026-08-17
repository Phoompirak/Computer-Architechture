const fs = require('fs');
const code = fs.readFileSync('main.js', 'utf8');
const normalizeStr = code.substring(code.indexOf('function normalizeBooleanExpression'), code.indexOf('function evaluateBooleanExpr'));
eval(normalizeStr);
console.log(normalizeBooleanExpression("Y=AB(C+C')D"));
