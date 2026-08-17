const rawExpr = "Y=AB(C+C)'D";
const clean = rawExpr.replace(/^[A-Z](?:\s*\([^)]*\))?\s*=\s*/i, '').trim();
console.log('clean:', clean);

function evaluateBooleanExpr(rawExpr, scope) {
  let jsExpr = normalizeBooleanExpression(rawExpr);

  Object.keys(scope).forEach(v => {
    const reg = new RegExp(`\\b${v}\\b`, 'g');
    jsExpr = jsExpr.replace(reg, scope[v] ? '1' : '0');
  });

  try {
    const result = Function(`"use strict"; return Boolean(${jsExpr})`)();
    return result ? 1 : 0;
  } catch (e) {
    return null;
  }
}

function normalizeBooleanExpression(rawExpr) {
  if (!rawExpr) return '';
  let expr = rawExpr.trim();
  expr = expr.replace(/^[A-Z](?:\s*\([^)]*\))?\s*=\s*/i, '');
  expr = expr.replace(/([A-Z]|\))\s*['’‘′\`´~]/g, '(!$1)');
  for (let p = 0; p < 4; p++) {
    expr = expr.replace(/([A-Za-z0-9_!]+|\([^)]+\))\s*\bNAND\b\s*([A-Za-z0-9_!]+|\([^)]+\))/gi, '!($1 && $2)');
    expr = expr.replace(/([A-Za-z0-9_!]+|\([^)]+\))\s*\bNOR\b\s*([A-Za-z0-9_!]+|\([^)]+\))/gi, '!($1 || $2)');
    expr = expr.replace(/([A-Za-z0-9_!]+|\([^)]+\))\s*\bXNOR\b\s*([A-Za-z0-9_!]+|\([^)]+\))/gi, '!($1 ^ $2)');
  }
  expr = expr.replace(/\bXOR\b/gi, ' ^ ');
  expr = expr.replace(/\bAND\b/gi, ' && ');
  expr = expr.replace(/\bOR\b/gi, ' || ');
  expr = expr.replace(/\bNOT\b/gi, ' ! ');
  expr = expr.replace(/~/g, ' ! ');
  expr = expr.replace(/·|\*/g, ' && ');
  expr = expr.replace(/\+/g, ' || ');
  for (let pass = 0; pass < 5; pass++) {
    expr = expr.replace(/([A-Z]|\))\s*([A-Z]|\(|\!)/g, '$1 && $2');
  }
  return expr;
}

const testScope = { A: 1, B: 1, C: 1, D: 1, E: 1, F: 1 };
const res = evaluateBooleanExpr(clean, testScope);
console.log('Result for Y=AB(C+C)\'D:', res);
