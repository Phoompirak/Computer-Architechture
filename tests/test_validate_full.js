const fs = require('fs');
const code = fs.readFileSync('main.js', 'utf8');

const domMock = `
global.document = {
    querySelector: () => ({ addEventListener: () => {}, innerHTML: '', style: {}, classList: { add: ()=>{}, remove: ()=>{} } }),
    querySelectorAll: () => [],
    getElementById: () => ({ addEventListener: () => {}, innerHTML: '', style: {}, classList: { add: ()=>{}, remove: ()=>{} } }),
};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.window = { addEventListener: () => {} };
global.navigator = {};
`;

try {
    eval(domMock + code);
    console.log("Validation result:", validateBooleanExpression("Y=AB(C+C')D"));
    console.log("Validation result with prime:", validateBooleanExpression("Y=AB(C+C\u2032)D"));
    
    // What if it errors in generateTruthTable? Let's check:
    console.log("Normalized expression:", normalizeBooleanExpression("AB(C+C')D"));
} catch (e) {
    console.error("Error during evaluation:", e);
}
