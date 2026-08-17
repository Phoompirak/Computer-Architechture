const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

// Replace MODULE 3
const targetMod3 = `/* ==========================================================================
   MODULE 3: 1's & 2's COMPLEMENT CALCULATOR ENGINE
   ========================================================================== */`;
   
const targetMod4 = `/* ==========================================================================
   MODULE 4: BASE ARITHMETIC ENGINE
   ========================================================================== */`;
   
const idxMod3 = code.indexOf(targetMod3);
const idxMod4 = code.indexOf(targetMod4);

if (idxMod3 !== -1 && idxMod4 !== -1) {
    const newMod3 = `/* ==========================================================================
   MODULE 3: BOOLEAN LAWS & STEP-BY-STEP UI
   ========================================================================== */
const tabLawsBtn = document.getElementById('tabLawsBtn');
const tabStepExampleBtn = document.getElementById('tabStepExampleBtn');
const lawsContent = document.getElementById('lawsContent');
const stepExampleContent = document.getElementById('stepExampleContent');

if (tabLawsBtn && tabStepExampleBtn) {
  tabLawsBtn.addEventListener('click', () => {
    tabLawsBtn.classList.add('active');
    tabStepExampleBtn.classList.remove('active');
    lawsContent.style.display = 'block';
    stepExampleContent.style.display = 'none';
  });

  tabStepExampleBtn.addEventListener('click', () => {
    tabStepExampleBtn.classList.add('active');
    tabLawsBtn.classList.remove('active');
    stepExampleContent.style.display = 'block';
    lawsContent.style.display = 'none';
  });
}

`;
    code = code.substring(0, idxMod3) + newMod3 + code.substring(idxMod4);
}

// Remove renderComplementCalculator() from initial renders
code = code.replace('renderComplementCalculator();', '');

// Remove complementInput from saveAppState
code = code.replace(/complementInput\.value/g, '\"\"');

fs.writeFileSync('main.js', code);
