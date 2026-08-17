function normalizeBooleanExpression(rawExpr) {
  if (!rawExpr) return '';
  let expr = rawExpr.trim();

  expr = expr.replace(/^[A-Z](?:\s*\([^)]*\))?\s*=\s*/i, '');

  let newExpr = '';
  for (let i = 0; i < expr.length; i++) {
    if (/['’‘′\`´~]/.test(expr[i])) {
      let j = newExpr.length - 1;
      while (j >= 0 && /\s/.test(newExpr[j])) j--;
      if (j >= 0) {
        if (/[A-Z]/i.test(newExpr[j])) {
          newExpr = newExpr.substring(0, j) + '(!' + newExpr[j] + ')' + newExpr.substring(j + 1);
        } else if (newExpr[j] === ')') {
          let parenCount = 1;
          let k = j - 1;
          while (k >= 0 && parenCount > 0) {
            if (newExpr[k] === ')') parenCount++;
            else if (newExpr[k] === '(') parenCount--;
            k--;
          }
          if (parenCount === 0) {
            k++;
            newExpr = newExpr.substring(0, k) + '(!' + newExpr.substring(k, j + 1) + ')' + newExpr.substring(j + 1);
          } else {
            newExpr += expr[i];
          }
        } else {
          newExpr += expr[i];
        }
      } else {
        newExpr += expr[i];
      }
    } else {
      newExpr += expr[i];
    }
  }
  expr = newExpr;

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
    console.log("EVAL ERROR:", e.message, "EXPR:", jsExpr);
    return null;
  }
}

function validateBooleanExpression(rawExpr) {
  const clean = rawExpr.replace(/^[A-Z](?:\s*\([^)]*\))?\s*=\s*/i, '').trim();
  const testScope = { A: 1, B: 1, C: 1, D: 1, E: 1, F: 1 };
  const res = evaluateBooleanExpr(clean, testScope);
  if (res === null) {
    return { isValid: false, error: 'Syntax Error in Boolean Expression' };
  }

  return { isValid: true, error: null };
}

console.log(validateBooleanExpression("Y=AB(C+C')D"));
