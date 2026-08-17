const queryH = document.querySelector('#query');
const inputNumberic = document.querySelector('#inputNumberic');
const outputNumberic = document.querySelector('#outputNumberic');
const fromBase = document.querySelector('#fromBaseNumericSelect');
const toBase = document.querySelector('#toBaseNumericSelect');
const shortDivisionSteps = document.querySelector('#shortDivisionSteps');
const tabStandardBtn = document.querySelector('#tabStandardBtn');
const tabGroupingBtn = document.querySelector('#tabGroupingBtn');

// i18n Bilingual Translation System (TH / EN)
const translations = {
  th: {
    subtitle: 'ชุดเครื่องมือคำนวณและจำลองสถาปัตยกรรมคอมพิวเตอร์',
    quick_access_title: 'เมนูทางลัด (Quick Access)',
    card_1: 'แปลงเลขฐาน',
    card_2: 'พีชคณิตบูลีน',
    card_3: 'คอมพลีเมนต์มีเครื่องหมาย',
    card_4: 'คณิตศาสตร์เลขฐาน',
    enter_number: 'กรอกตัวเลข',
    input_numberic_ph: 'กรอกตัวเลข (เช่น 1010, 1F, 255)',
    from_base: 'จากฐานเลข',
    to_base: 'ไปยังฐานเลข',
    tab_standard: 'วิธีมาตรฐาน (หารสั้น/กระจายหลัก)',
    tab_grouping: 'วิธีจัดกลุ่มบิต / ตารางเทียบ',
    boolean_label: 'สมการบูลีน และ ตัวจำลองวงจรลอจิก',
    boolean_expr_ph: 'กรอกสมการลอจิก (เช่น A AND B, A OR (NOT B), A XOR B)',
    live_var_title: 'สวิตช์ปรับค่าตัวแปรแบบเรียลไทม์:',
    truth_table_title: 'ตารางความจริง และ รูปแบบสมการมินเทอม / แมกซ์เทอม',
    simplification_title: 'ขั้นตอนการลดรูปสมการพร้อมระบุกฎพีชคณิตบูลีน',
    kmap_title: 'แผนผังคาร์โนห์ (ลดรูป K-Map ด้วยรหัสเกรย์)',
    circuit_title: 'ตัวจำลองแผนผังวงจรลอจิกเกต (Logic Gates)',
    complement_label: 'คำนวณคอมพลีเมนต์และเลขฐานสองมีเครื่องหมาย',
    complement_ph: 'กรอกเลขฐานสอง (เช่น 10110)',
    complement_title: 'ผลลัพธ์ 1\'s และ 2\'s Complement',
    arithmetic_label: 'คณิตศาสตร์เลขฐาน (+, -, ×, ÷)',
    select_base: 'เลือกฐานเลข',
    operand1_ph: 'ตัวตั้ง (Operand 1)',
    operand2_ph: 'ตัวดำเนินการ (Operand 2)',
    arithmetic_steps_title: 'ขั้นตอนการคำนวณ (แปลงเป็นฐาน 10)'
  },
  en: {
    subtitle: 'Computer Architecture Suite & Visualizer',
    quick_access_title: 'Quick Access',
    card_1: 'Base Converter',
    card_2: 'Boolean Algebra',
    card_3: 'Signed Complements',
    card_4: 'Base Arithmetic',
    enter_number: 'Enter Number',
    input_numberic_ph: 'Type a number (e.g. 1010, 1F, 255)',
    from_base: 'From Base',
    to_base: 'To Base',
    tab_standard: 'Standard Method (Division / Expansion)',
    tab_grouping: 'Bit Grouping / Table Method',
    boolean_label: 'Boolean Expression & Logic Simulator',
    boolean_expr_ph: 'Enter logic expression (e.g. A AND B, A OR (NOT B))',
    live_var_title: 'Live Variable Inputs:',
    truth_table_title: 'Truth Table & Canonical Expressions',
    simplification_title: 'Step-by-Step Simplification with Laws',
    kmap_title: 'Karnaugh Map (K-map Gray Code Simplification)',
    circuit_title: 'Logic Circuit Visualizer',
    complement_label: 'Signed Binary & Complement Calculator',
    complement_ph: 'Enter binary number (e.g. 10110)',
    complement_title: '1\'s & 2\'s Complement Results',
    arithmetic_label: 'Base Arithmetic (+, -, ×, ÷)',
    select_base: 'Select Base',
    operand1_ph: 'Operand 1',
    operand2_ph: 'Operand 2',
    arithmetic_steps_title: 'Step-by-Step Calculation (Decimal Base)'
  }
};

let currentLang = localStorage.getItem('comparch_lang') || 'th';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('comparch_lang', lang);

  const langToggleBtn = document.getElementById('langToggleBtn');
  if (langToggleBtn) {
    langToggleBtn.querySelector('.lang_flag').textContent = lang === 'th' ? '🇹🇭' : '🇬🇧';
    langToggleBtn.querySelector('.lang_label').textContent = lang.toUpperCase();
  }

  const dict = translations[lang] || translations.th;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.placeholder = dict[key];
  });
}

const langToggleBtn = document.getElementById('langToggleBtn');
if (langToggleBtn) {
  langToggleBtn.addEventListener('click', () => {
    const nextLang = currentLang === 'th' ? 'en' : 'th';
    setLanguage(nextLang);
  });
}

// Navigation & Persistence Logic
const quickCards = document.querySelectorAll('.quick_card');
const moduleViews = document.querySelectorAll('.module_view');

const LS_VIEW_KEY = 'comparch_active_view';
const LS_INPUTS_KEY = 'comparch_inputs';

function saveAppState() {
  const activeCard = document.querySelector('.quick_card.active');
  const activeView = activeCard ? activeCard.getAttribute('data-view') : 'number-converter';
  localStorage.setItem(LS_VIEW_KEY, activeView);

  const inputsData = {
    inputNumberic: document.querySelector('#inputNumberic')?.value || '',
    fromBaseNumericSelect: document.querySelector('#fromBaseNumericSelect')?.value || '16',
    toBaseNumericSelect: document.querySelector('#toBaseNumericSelect')?.value || '10',
    booleanExprInput: document.querySelector('#booleanExprInput')?.value || 'A AND B',
    complementInput: document.querySelector('#complementInput')?.value || '10110',
    arithmeticBaseSelect: document.querySelector('#arithmeticBaseSelect')?.value || '10',
    arithmeticInput1: document.querySelector('#arithmeticInput1')?.value || '',
    arithmeticOpSelect: document.querySelector('#arithmeticOpSelect')?.value || '+',
    arithmeticInput2: document.querySelector('#arithmeticInput2')?.value || ''
  };
  localStorage.setItem(LS_INPUTS_KEY, JSON.stringify(inputsData));
}

function restoreAppState() {
  const savedView = localStorage.getItem(LS_VIEW_KEY);
  if (savedView) {
    const targetCard = document.querySelector(`.quick_card[data-view="${savedView}"]`);
    if (targetCard) {
      quickCards.forEach(c => c.classList.remove('active'));
      targetCard.classList.add('active');
      moduleViews.forEach(view => {
        if (view.id === `view-${savedView}`) {
          view.classList.add('active');
        } else {
          view.classList.remove('active');
        }
      });
    }
  }

  const savedInputs = localStorage.getItem(LS_INPUTS_KEY);
  if (savedInputs) {
    try {
      const data = JSON.parse(savedInputs);
      if (data.inputNumberic !== undefined && document.querySelector('#inputNumberic')) 
        document.querySelector('#inputNumberic').value = data.inputNumberic;
      if (data.fromBaseNumericSelect !== undefined && document.querySelector('#fromBaseNumericSelect')) 
        document.querySelector('#fromBaseNumericSelect').value = data.fromBaseNumericSelect;
      if (data.toBaseNumericSelect !== undefined && document.querySelector('#toBaseNumericSelect')) 
        document.querySelector('#toBaseNumericSelect').value = data.toBaseNumericSelect;
      if (data.booleanExprInput !== undefined && document.querySelector('#booleanExprInput')) 
        document.querySelector('#booleanExprInput').value = data.booleanExprInput;
      if (data.complementInput !== undefined && document.querySelector('#complementInput')) 
        document.querySelector('#complementInput').value = data.complementInput;
      if (data.arithmeticBaseSelect !== undefined && document.querySelector('#arithmeticBaseSelect')) 
        document.querySelector('#arithmeticBaseSelect').value = data.arithmeticBaseSelect;
      if (data.arithmeticInput1 !== undefined && document.querySelector('#arithmeticInput1')) 
        document.querySelector('#arithmeticInput1').value = data.arithmeticInput1;
      if (data.arithmeticOpSelect !== undefined && document.querySelector('#arithmeticOpSelect')) 
        document.querySelector('#arithmeticOpSelect').value = data.arithmeticOpSelect;
      if (data.arithmeticInput2 !== undefined && document.querySelector('#arithmeticInput2')) 
        document.querySelector('#arithmeticInput2').value = data.arithmeticInput2;
    } catch(e) {
      console.warn('Failed to parse saved state:', e);
    }
  }
}

function setupClearButtons() {
  document.querySelectorAll('.input_inner').forEach(container => {
    const input = container.querySelector('input[type="text"]');
    const clearBtn = container.querySelector('.btn_clear_input');
    if (!input || !clearBtn) return;

    const toggleClearBtn = () => {
      clearBtn.style.display = input.value.length > 0 ? 'flex' : 'none';
    };

    input.addEventListener('input', () => {
      toggleClearBtn();
      saveAppState();
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      toggleClearBtn();
      input.dispatchEvent(new Event('input'));
      input.focus();
      saveAppState();
    });

    toggleClearBtn();
  });
}

quickCards.forEach(card => {
  card.addEventListener('click', () => {
    const targetView = card.getAttribute('data-view');
    if (!targetView) return;

    quickCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');

    moduleViews.forEach(view => {
      if (view.id === `view-${targetView}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    saveAppState();
  });
});

let currentActiveTab = 'standard';

const digits = '0123456789ABCDEF';

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function toDecimal(value, base) {
  const cleanValue = value.trim().toUpperCase();
  let decimal = 0n;
  const baseBig = BigInt(base);

  for (let i = 0; i < cleanValue.length; i++) {
    const char = cleanValue[i];
    const digitIndex = digits.indexOf(char);

    if (digitIndex === -1 || digitIndex >= base) {
      throw new Error(`Invalid digit '${char}' for base ${base}`);
    }

    decimal = decimal * baseBig + BigInt(digitIndex);
  }

  return decimal;
}

function fromDecimal(value, base) {
  if (value === 0n) return '0';

  let quotient = value < 0n ? -value : value;
  let result = '';
  const baseBig = BigInt(base);

  while (quotient > 0n) {
    const remainder = Number(quotient % baseBig);
    result = digits[remainder] + result;
    quotient = quotient / baseBig;
  }

  return result;
}

function getExpansionSteps(value, base) {
  const cleanValue = value.trim().toUpperCase();
  const n = cleanValue.length;
  const terms = [];
  let decimal = 0n;
  const baseBig = BigInt(base);

  for (let i = 0; i < n; i++) {
    const char = cleanValue[i];
    const digitVal = digits.indexOf(char);
    const power = n - 1 - i;
    const termVal = BigInt(digitVal) * (baseBig ** BigInt(power));
    decimal += termVal;
    terms.push({
      char,
      digitVal,
      power,
      termVal: termVal.toString(),
      multiplier: base === 16 && digitVal >= 10 ? `${char} (${digitVal})` : `${char}`
    });
  }

  const formulaParts = terms.map(t => `(${escapeHTML(t.multiplier)} &times; ${base}<sup>${t.power}</sup>)`);
  const calcParts = terms.map(t => `${t.termVal}`);

  return {
    decimal,
    html: `
      <div class="step-expansion">
        <p><strong>Positional Expansion (กระจายตามค่าประจำหลัก):</strong></p>
        <p>(${escapeHTML(cleanValue)})<sub>${base}</sub></p>
        <p>= ${formulaParts.join(' + ')}</p>
        <p>= ${calcParts.join(' + ')}</p>
        <p>= <strong>${decimal.toString()}</strong><sub>10</sub></p>
      </div>
    `
  };
}

function getFractionalExpansionSteps(fracStr, base) {
  let fracVal = 0;
  const terms = [];

  for (let i = 0; i < fracStr.length; i++) {
    const char = fracStr[i];
    const digitVal = digits.indexOf(char);
    const power = -(i + 1);
    const val = digitVal * Math.pow(base, power);
    fracVal += val;
    terms.push({
      char,
      digitVal,
      power,
      val: val.toFixed(6).replace(/\.?0+$/, ''),
      multiplier: base === 16 && digitVal >= 10 ? `${char} (${digitVal})` : `${char}`
    });
  }

  const formulaParts = terms.map(t => `(${escapeHTML(t.multiplier)} &times; ${base}<sup>${t.power}</sup>)`);
  const calcParts = terms.map(t => `${t.val}`);

  return {
    fracVal,
    html: `
      <div class="step-expansion" style="margin-top: 10px;">
        <p><strong>Positional Expansion ส่วนทศนิยม:</strong></p>
        <p>(0.${escapeHTML(fracStr)})<sub>${base}</sub></p>
        <p>= ${formulaParts.join(' + ')}</p>
        <p>= ${calcParts.join(' + ')}</p>
        <p>= <strong>${fracVal.toString()}</strong><sub>10</sub></p>
      </div>
    `
  };
}

function getShortDivisionHtml(decimalValue, base, targetName) {
  const baseBig = BigInt(base);
  if (decimalValue === 0n) {
    return `
      <div class="step-division">
        <p><strong>Short Division to ${escapeHTML(targetName)} (หารสั้นด้วย ${base}):</strong></p>
        <ul>
          <li>0 &divide; ${base} = 0 เศษ <strong>0</strong></li>
        </ul>
        <p>Result: <strong>0</strong><sub>${base}</sub></p>
      </div>
    `;
  }

  const steps = [];
  const remainders = [];
  let current = decimalValue < 0n ? -decimalValue : decimalValue;

  while (current > 0n) {
    const quotient = current / baseBig;
    const remainder = Number(current % baseBig);
    const remainderChar = digits[remainder];
    remainders.unshift(remainderChar);

    steps.push({
      current: current.toString(),
      quotient: quotient.toString(),
      remainder: remainderChar,
      text: `${current.toString()} &divide; ${base} = ${quotient.toString()} เศษ <strong>${remainderChar}</strong>`
    });
    current = quotient;
  }

  const finalStr = remainders.join('');

  return `
    <div class="step-division">
      <p><strong>Short Division to ${escapeHTML(targetName)} (หารสั้นด้วย ${base}):</strong></p>
      <ul>
        ${steps.map(s => `<li>${s.text}</li>`).join('')}
      </ul>
      <p>อ่านเศษจากล่างขึ้นบน &rarr; (<strong>${escapeHTML(finalStr)}</strong>)<sub>${base}</sub></p>
    </div>
  `;
}

function getFractionalMultiplicationHtml(fracVal, base, targetName) {
  if (fracVal <= 0) return { resultStr: '', html: '' };

  const steps = [];
  let current = fracVal;
  let resultStr = '';
  const maxSteps = 8;
  let isRepeating = false;

  for (let step = 0; step < maxSteps; step++) {
    if (current <= 0.000000001) break;

    const multiplied = current * base;
    const intPart = Math.floor(multiplied);
    const nextFrac = multiplied - intPart;
    const digitChar = digits[intPart];

    steps.push({
      input: current.toFixed(6).replace(/\.?0+$/, ''),
      multiplied: multiplied.toFixed(6).replace(/\.?0+$/, ''),
      intPart: digitChar
    });

    resultStr += digitChar;
    current = nextFrac;

    if (step === maxSteps - 1 && current > 0.000001) {
      isRepeating = true;
    }
  }

  if (isRepeating) {
    resultStr += '...';
  }

  return {
    resultStr,
    html: `
      <div class="step-division" style="margin-top: 10px;">
        <p><strong>Repeated Multiplication ส่วนทศนิยม (คูณสะสมด้วย ${base}):</strong></p>
        <ul>
          ${steps.map(s => `<li>${s.input} &times; ${base} = ${s.multiplied} &rarr; ดึง <strong>${s.intPart}</strong></li>`).join('')}
        </ul>
        <p>อ่านตัวเลขที่ดึงจากบนลงล่าง &rarr; (0.<strong>${escapeHTML(resultStr)}</strong>)<sub>${base}</sub> ${isRepeating ? '<span style="color: #d97706;">(ทศนิยมซ้ำ - แสดง 8 ตำแหน่ง)</span>' : ''}</p>
      </div>
    `
  };
}

function getReferenceTableHtml(base, highlightedDigits = new Set()) {
  const isHex = base === 16;
  const count = isHex ? 16 : 8;
  const padLen = isHex ? 4 : 3;
  const baseName = isHex ? '16 (Hexadecimal)' : '8 (Octal)';

  let rows = '';
  for (let i = 0; i < count; i++) {
    const digitChar = digits[i];
    const binStr = i.toString(2).padStart(padLen, '0');
    const isHighlight = highlightedDigits.has(digitChar);
    const rowClass = isHighlight ? 'class="highlighted"' : '';
    const star = isHighlight ? ' ★' : '';

    if (isHex) {
      const decNotation = i >= 10 ? `${i} (${digitChar})` : `${i}`;
      rows += `
        <tr ${rowClass}>
          <td>${decNotation}${star}</td>
          <td><code>${binStr}</code></td>
        </tr>
      `;
    } else {
      rows += `
        <tr ${rowClass}>
          <td>${digitChar}${star}</td>
          <td><code>${binStr}</code></td>
        </tr>
      `;
    }
  }

  return `
    <div class="ref-table-wrapper">
      <table class="ref-table">
        <thead>
          <tr>
            <th>เลขฐาน ${baseName}</th>
            <th>เลขฐาน 2 (${padLen} บิต)</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function getBinaryToOctHexGroupingHtml(cleanValue, targetBase, targetName) {
  const groupSize = targetBase === 16 ? 4 : 3;

  const isNeg = cleanValue.startsWith('-');
  const absValue = isNeg ? cleanValue.slice(1) : cleanValue;

  const parts = absValue.split('.');
  const intStr = parts[0] || '0';
  const fracStr = parts[1] || null;

  const usedDigits = new Set();
  const intCards = [];

  const intPadCount = (groupSize - (intStr.length % groupSize)) % groupSize;
  const paddedInt = '0'.repeat(intPadCount) + intStr;

  for (let i = 0; i < paddedInt.length; i += groupSize) {
    const chunk = paddedInt.slice(i, i + groupSize);
    const digitVal = parseInt(chunk, 2);
    const digitChar = digits[digitVal];
    usedDigits.add(digitChar);

    let chunkHtml = '';
    for (let c = 0; c < chunk.length; c++) {
      const overallIndex = i + c;
      if (overallIndex < intPadCount) {
        chunkHtml += `<span class="padded-zeros">${chunk[c]}</span>`;
      } else {
        chunkHtml += chunk[c];
      }
    }

    intCards.push({
      bitsHtml: chunkHtml,
      digit: digitChar
    });
  }

  const fracCards = [];
  if (fracStr !== null && fracStr.length > 0) {
    const fracPadCount = (groupSize - (fracStr.length % groupSize)) % groupSize;
    const paddedFrac = fracStr + '0'.repeat(fracPadCount);

    for (let i = 0; i < paddedFrac.length; i += groupSize) {
      const chunk = paddedFrac.slice(i, i + groupSize);
      const digitVal = parseInt(chunk, 2);
      const digitChar = digits[digitVal];
      usedDigits.add(digitChar);

      let chunkHtml = '';
      for (let c = 0; c < chunk.length; c++) {
        const originalIndex = i + c;
        if (originalIndex >= fracStr.length) {
          chunkHtml += `<span class="padded-zeros">${chunk[c]}</span>`;
        } else {
          chunkHtml += chunk[c];
        }
      }

      fracCards.push({
        bitsHtml: chunkHtml,
        digit: digitChar
      });
    }
  }

  const intResult = intCards.map(c => c.digit).join('');
  const fracResult = fracCards.length > 0 ? '.' + fracCards.map(c => c.digit).join('') : '';
  const finalResult = (isNeg ? '-' : '') + intResult + fracResult;

  let diagramHtml = '<div class="grouping-diagram">';
  if (isNeg) {
    diagramHtml += '<span class="group-dot" style="font-size: 1.6rem; font-weight: bold; color: #ef4444;">-</span>';
  }
  intCards.forEach(c => {
    diagramHtml += `
      <div class="group-card">
        <span class="group-bits">${c.bitsHtml}</span>
        <span class="group-arrow">&darr;</span>
        <span class="group-digit">${c.digit}</span>
      </div>
    `;
  });

  if (fracCards.length > 0) {
    diagramHtml += '<span class="group-dot">.</span>';
    fracCards.forEach(c => {
      diagramHtml += `
        <div class="group-card">
          <span class="group-bits">${c.bitsHtml}</span>
          <span class="group-arrow">&darr;</span>
          <span class="group-digit">${c.digit}</span>
        </div>
      `;
    });
  }
  diagramHtml += '</div>';

  return `
    <div>
      <p><strong>วิธีจัดกลุ่มบิต (Bit Grouping Method):</strong></p>
      <p>&bull; จัดกลุ่มทีละ <strong>${groupSize} บิต</strong> (เนื่องจาก 2<sup>${groupSize}</sup> = ${targetBase})</p>
      <p>&bull; จำนวนเต็มแบ่งจากขวาไปซ้าย (เติม <span class="padded-zeros">0 สีแดง</span> ข้างหน้าหากไม่ครบ ${groupSize} บิต)${fracCards.length > 0 ? '<br>&bull; ทศนิยมแบ่งจากซ้ายไปขวา (เติม <span class="padded-zeros">0 สีแดง</span> ข้างหลังหากไม่ครบ ' + groupSize + ' บิต)' : ''}</p>
      ${diagramHtml}
      <p>ดังนั้น (${escapeHTML(cleanValue)})<sub>2</sub> = (<strong>${escapeHTML(finalResult)}</strong>)<sub>${targetBase}</sub></p>
      <p style="margin-top: 10px; font-weight: bold; color: #024092;">ตารางเทียบเลขฐาน (Reference Table):</p>
      ${getReferenceTableHtml(targetBase, usedDigits)}
    </div>
  `;
}

function getOctHexToBinaryGroupingHtml(cleanValue, sourceBase, sourceName) {
  const padLen = sourceBase === 16 ? 4 : 3;

  const isNeg = cleanValue.startsWith('-');
  const absValue = isNeg ? cleanValue.slice(1) : cleanValue;

  const parts = absValue.split('.');
  const intStr = parts[0] || '0';
  const fracStr = parts[1] || null;

  const usedDigits = new Set();
  const intCards = [];

  for (let i = 0; i < intStr.length; i++) {
    const char = intStr[i];
    const val = digits.indexOf(char);
    const binStr = val.toString(2).padStart(padLen, '0');
    usedDigits.add(char);
    intCards.push({
      digit: char,
      bits: binStr
    });
  }

  const fracCards = [];
  if (fracStr !== null) {
    for (let i = 0; i < fracStr.length; i++) {
      const char = fracStr[i];
      const val = digits.indexOf(char);
      const binStr = val.toString(2).padStart(padLen, '0');
      usedDigits.add(char);
      fracCards.push({
        digit: char,
        bits: binStr
      });
    }
  }

  const intResult = intCards.map(c => c.bits).join('');
  const fracResult = fracCards.length > 0 ? '.' + fracCards.map(c => c.bits).join('') : '';
  const finalResult = (isNeg ? '-' : '') + intResult + fracResult;

  let diagramHtml = '<div class="grouping-diagram">';
  if (isNeg) {
    diagramHtml += '<span class="group-dot" style="font-size: 1.6rem; font-weight: bold; color: #ef4444;">-</span>';
  }
  intCards.forEach(c => {
    diagramHtml += `
      <div class="group-card">
        <span class="group-digit">${c.digit}</span>
        <span class="group-arrow">&darr;</span>
        <span class="group-bits">${c.bits}</span>
      </div>
    `;
  });

  if (fracCards.length > 0) {
    diagramHtml += '<span class="group-dot">.</span>';
    fracCards.forEach(c => {
      diagramHtml += `
        <div class="group-card">
          <span class="group-digit">${c.digit}</span>
          <span class="group-arrow">&darr;</span>
          <span class="group-bits">${c.bits}</span>
        </div>
      `;
    });
  }
  diagramHtml += '</div>';

  return `
    <div>
      <p><strong>วิธีกระจายบิตจากตาราง (Direct Table Lookup):</strong></p>
      <p>&bull; แทนค่าแต่ละหลักของ ${escapeHTML(sourceName)} ด้วยเลขฐานสอง <strong>${padLen} บิต</strong></p>
      ${diagramHtml}
      <p>ดังนั้น (${escapeHTML(cleanValue)})<sub>${sourceBase}</sub> = (<strong>${escapeHTML(finalResult)}</strong>)<sub>2</sub></p>
      <p style="margin-top: 10px; font-weight: bold; color: #024092;">ตารางเทียบเลขฐาน (Reference Table):</p>
      ${getReferenceTableHtml(sourceBase, usedDigits)}
    </div>
  `;
}

function getOctalHexIntermediateGroupingHtml(cleanValue, fromBaseVal, toBaseVal, fromName, toName) {
  const fromPad = fromBaseVal === 16 ? 4 : 3;

  const isNeg = cleanValue.startsWith('-');
  const absValue = isNeg ? cleanValue.slice(1) : cleanValue;

  let binaryString = isNeg ? '-' : '';
  for (let i = 0; i < absValue.length; i++) {
    if (absValue[i] === '.') {
      binaryString += '.';
    } else {
      const digitVal = digits.indexOf(absValue[i]);
      binaryString += digitVal.toString(2).padStart(fromPad, '0');
    }
  }

  const step1Html = getOctHexToBinaryGroupingHtml(cleanValue, fromBaseVal, fromName);
  const step2Html = getBinaryToOctHexGroupingHtml(binaryString, toBaseVal, toName);

  return `
    <div>
      <p><strong>การแปลงระหว่าง ${escapeHTML(fromName)} กับ ${escapeHTML(toName)} ผ่านเลขฐาน 2:</strong></p>
      <div style="margin-bottom: 12px;">
        <p><strong>ขั้นตอนที่ 1:</strong> แปลง ${escapeHTML(fromName)} เป็นเลขฐาน 2 (กระจายทีละ ${fromPad} บิต)</p>
        ${step1Html}
      </div>
      <hr style="border: 0; border-top: 1px dashed #ccc; margin: 14px 0;">
      <div>
        <p><strong>ขั้นตอนที่ 2:</strong> จัดกลุ่มเลขฐาน 2 ใหม่เพื่อแปลงเป็น ${escapeHTML(toName)}</p>
        ${step2Html}
      </div>
    </div>
  `;
}

function renderConversion() {
  const fromBaseVal = parseInt(fromBase.value, 10);
  const toBaseVal = parseInt(toBase.value, 10);
  const fromName = fromBase.options[fromBase.selectedIndex]?.text || `Base ${fromBaseVal}`;
  const toName = toBase.options[toBase.selectedIndex]?.text || `Base ${toBaseVal}`;

  if (queryH) {
    queryH.textContent = `Your selection: From ${fromName} To ${toName}`;
  }

  const rawValue = inputNumberic.value.trim();
  if (rawValue === '' || rawValue === '-') {
    if (outputNumberic) {
      outputNumberic.innerHTML = '';
      outputNumberic.style.display = 'none';
    }
    shortDivisionSteps.innerHTML = '<p style="color: #888; margin: 0;">Please enter a number to convert.</p>';
    return;
  }

  try {
    const cleanValue = rawValue.toUpperCase();
    const isNeg = cleanValue.startsWith('-');
    const absValue = isNeg ? cleanValue.slice(1) : cleanValue;

    if (currentActiveTab === 'standard') {
      const parts = absValue.split('.');
      const intPart = parts[0] || '0';
      const fracPart = parts[1] || null;

      const decimalInt = toDecimal(intPart, fromBaseVal);
      const resultInt = fromDecimal(decimalInt, toBaseVal);

      let totalResult = (isNeg ? '-' : '') + resultInt;
      let stepsHtml = '';

      let fracExpansion = { fracVal: 0, html: '' };
      let fracMultiplication = { resultStr: '', html: '' };

      if (fracPart !== null && fracPart.length > 0) {
        if (fromBaseVal !== 10) {
          fracExpansion = getFractionalExpansionSteps(fracPart, fromBaseVal);
        } else {
          fracExpansion.fracVal = parseFloat('0.' + fracPart);
        }

        if (toBaseVal !== 10) {
          fracMultiplication = getFractionalMultiplicationHtml(fracExpansion.fracVal, toBaseVal, toName);
          if (fracMultiplication.resultStr) {
            totalResult += '.' + fracMultiplication.resultStr;
          }
        } else {
          totalResult = (isNeg ? '-' : '') + (Number(decimalInt) + fracExpansion.fracVal).toString();
        }
      }

      if (outputNumberic) {
        outputNumberic.style.display = 'block';
        outputNumberic.innerHTML = `<strong>Result (${escapeHTML(toName)}):</strong> <span style="font-size: 1.2rem; color: #1a73e8; font-weight: bold;">${escapeHTML(totalResult)}</span><sub>${toBaseVal}</sub>`;
      }

      if (fromBaseVal === toBaseVal) {
        stepsHtml = `<p>ค่าอยู่ในฐานเดียวกัน (<strong>${escapeHTML(fromName)}</strong>) ไม่ต้องแปลงค่า: <strong>${escapeHTML(cleanValue)}</strong><sub>${fromBaseVal}</sub></p>`;
      } else if (toBaseVal === 10) {
        const exp = getExpansionSteps(intPart, fromBaseVal);
        stepsHtml = exp.html + (fracPart ? fracExpansion.html : '');
      } else if (fromBaseVal === 10) {
        const divHtml = getShortDivisionHtml(decimalInt, toBaseVal, toName);
        stepsHtml = divHtml + (fracPart ? fracMultiplication.html : '');
      } else {
        const exp = getExpansionSteps(intPart, fromBaseVal);
        const divHtml = getShortDivisionHtml(decimalInt, toBaseVal, toName);

        stepsHtml = `
          <div style="margin-bottom: 12px;">
            <p><strong>ขั้นตอนที่ 1:</strong> แปลงส่วนจำนวนเต็มจาก ${escapeHTML(fromName)} เป็น Decimal (ฐาน 10)</p>
            ${exp.html}
            ${fracPart ? fracExpansion.html : ''}
          </div>
          <hr style="border: 0; border-top: 1px dashed #ccc; margin: 14px 0;">
          <div>
            <p><strong>ขั้นตอนที่ 2:</strong> แปลง Decimal (ฐาน 10) เป็น ${escapeHTML(toName)}</p>
            ${divHtml}
            ${fracPart ? fracMultiplication.html : ''}
          </div>
        `;
      }

      if (isNeg) {
        stepsHtml = `<p style="color: #ef4444; font-weight: bold; margin-bottom: 8px;">ℹ️ คำนวณด้วยค่าสัมบูรณ์ แล้วใส่เครื่องหมายลบ (-) ด้านหน้าผลลัพธ์</p>` + stepsHtml;
      }

      shortDivisionSteps.innerHTML = stepsHtml;
    } else {
      // Bit Grouping Tab
      if (fromBaseVal === 10 || toBaseVal === 10) {
        shortDivisionSteps.innerHTML = `
          <div style="padding: 10px; background: #fff8e1; border-left: 4px solid #ffb300; border-radius: 4px;">
            <p style="margin: 0; color: #795548;"><strong>หมายเหตุ:</strong> วิธีจัดกลุ่มบิต (Bit Grouping) ใช้สำหรับการแปลงระหว่างเลขฐาน <strong>2, 8, 16</strong> ที่เป็นเลขยกกำลังของ 2 (2<sup>1</sup>, 2<sup>3</sup>, 2<sup>4</sup>) เท่านั้น</p>
            <p style="margin: 6px 0 0; color: #795548;">สำหรับการแปลงที่เกี่ยวข้องกับเลขฐาน 10 (Decimal) กรุณาสลับไปดูที่แท็บ <strong>"วิธีมาตรฐาน (หารสั้น/กระจายหลัก)"</strong></p>
          </div>
        `;
        return;
      }

      if (fromBaseVal === toBaseVal) {
        shortDivisionSteps.innerHTML = `<p>ค่าอยู่ในฐานเดียวกัน (<strong>${escapeHTML(fromName)}</strong>) ไม่ต้องแปลงค่า: <strong>${escapeHTML(cleanValue)}</strong><sub>${fromBaseVal}</sub></p>`;
        return;
      }

      for (let i = 0; i < absValue.length; i++) {
        const c = absValue[i];
        if (c !== '.') {
          const idx = digits.indexOf(c);
          if (idx === -1 || idx >= fromBaseVal) {
            throw new Error(`Invalid digit '${c}' for base ${fromBaseVal}`);
          }
        }
      }

      let groupingHtml = '';
      if (fromBaseVal === 2 && (toBaseVal === 8 || toBaseVal === 16)) {
        groupingHtml = getBinaryToOctHexGroupingHtml(cleanValue, toBaseVal, toName);
      } else if ((fromBaseVal === 8 || fromBaseVal === 16) && toBaseVal === 2) {
        groupingHtml = getOctHexToBinaryGroupingHtml(cleanValue, fromBaseVal, fromName);
      } else if ((fromBaseVal === 8 && toBaseVal === 16) || (fromBaseVal === 16 && toBaseVal === 8)) {
        groupingHtml = getOctalHexIntermediateGroupingHtml(cleanValue, fromBaseVal, toBaseVal, fromName, toName);
      }

      shortDivisionSteps.innerHTML = groupingHtml;
    }
  } catch (error) {
    if (outputNumberic) {
      outputNumberic.style.display = 'block';
      outputNumberic.innerHTML = `<span style="color: #d32f2f;">Invalid number '${escapeHTML(rawValue)}' for ${escapeHTML(fromName)}</span>`;
    }
    shortDivisionSteps.innerHTML = `<p style="color: #d32f2f; margin: 0;">ข้อผิดพลาด: '${escapeHTML(rawValue)}' ไม่ใช่ตัวเลขที่ถูกต้องในระบบ ${escapeHTML(fromName)}</p>`;
  }
}

function getRegexForBase(base) {
  switch (base) {
    case 2:
      return /^[0-1.-]*$/;
    case 8:
      return /^[0-7.-]*$/;
    case 10:
      return /^[0-9.-]*$/;
    case 16:
      return /^[0-9A-Fa-f.-]*$/;
    default:
      return /^[0-9A-Za-z.-]*$/;
  }
}

function sanitizeInput() {
  const baseVal = parseInt(fromBase.value, 10);
  const regex = getRegexForBase(baseVal);
  let value = inputNumberic.value;

  // Max 64 characters safety limit to avoid rendering performance lag
  if (value.length > 64) {
    value = value.slice(0, 64);
  }

  let cleanValue = '';
  let dotCount = 0;

  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char === '-') {
      if (i === 0) {
        cleanValue += char;
      }
    } else if (char === '.') {
      if (dotCount === 0) {
        cleanValue += char;
        dotCount++;
      }
    } else if (regex.test(char)) {
      cleanValue += char;
    }
  }

  if (value !== cleanValue) {
    inputNumberic.value = cleanValue;
  }
}

if (tabStandardBtn && tabGroupingBtn) {
  tabStandardBtn.addEventListener('click', () => {
    currentActiveTab = 'standard';
    tabStandardBtn.classList.add('active');
    tabGroupingBtn.classList.remove('active');
    renderConversion();
  });

  tabGroupingBtn.addEventListener('click', () => {
    currentActiveTab = 'grouping';
    tabGroupingBtn.classList.add('active');
    tabStandardBtn.classList.remove('active');
    renderConversion();
  });
}

fromBase.addEventListener('change', () => {
  sanitizeInput();
  renderConversion();
});

toBase.addEventListener('change', renderConversion);

inputNumberic.addEventListener('input', () => {
  sanitizeInput();
  renderConversion();
});

renderConversion();

/* ==========================================================================
   MODULE 2: BOOLEAN ALGEBRA & LOGIC GATES ENGINE
   ========================================================================== */
const booleanExprInput = document.querySelector('#booleanExprInput');
const truthTableContainer = document.querySelector('#truthTableContainer');
const logicGateDiagramContainer = document.querySelector('#logicGateDiagramContainer');
const opBtns = document.querySelectorAll('.op_btn');
const varToggles = document.querySelectorAll('.var_toggle');

const boolVarState = { A: 0, B: 0, C: 0 };

// Quick operator insert buttons
opBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const op = btn.getAttribute('data-op');
    if (booleanExprInput) {
      const cur = booleanExprInput.value.trim();
      booleanExprInput.value = cur ? `${cur} ${op} ` : `${op} `;
      renderBooleanAlgebra();
    }
  });
});

// Variable toggle switches
varToggles.forEach(toggle => {
  toggle.addEventListener('click', () => {
    const varName = toggle.getAttribute('data-var');
    boolVarState[varName] = boolVarState[varName] === 1 ? 0 : 1;

    const valEl = toggle.querySelector('.var_val');
    if (valEl) valEl.textContent = boolVarState[varName];

    if (boolVarState[varName] === 1) {
      toggle.classList.add('is_high');
    } else {
      toggle.classList.remove('is_high');
    }

    renderBooleanAlgebra();
  });
});

if (booleanExprInput) {
  booleanExprInput.addEventListener('input', renderBooleanAlgebra);
}

function validateBooleanExpression(rawExpr) {
  if (!rawExpr || !rawExpr.trim()) {
    return { isValid: false, error: 'กรุณากรอกสมการบูลีน (Boolean expression is empty)' };
  }
  const clean = rawExpr.replace(/^[A-Z]\s*=\s*/i, '').trim();
  if (!clean) {
    return { isValid: false, error: 'กรุณากรอกสมการบูลีนหลังเครื่องหมาย = (Expression is empty)' };
  }

  // Check balanced parentheses
  let parenDepth = 0;
  for (let i = 0; i < clean.length; i++) {
    if (clean[i] === '(') parenDepth++;
    else if (clean[i] === ')') parenDepth--;
    if (parenDepth < 0) {
      return { isValid: false, error: 'วงเล็บปิดเกิน หรือวงเล็บไม่ถูกต้อง (Mismatched parentheses)' };
    }
  }
  if (parenDepth !== 0) {
    return { isValid: false, error: 'วงเล็บเปิดไม่ครบ หรือปิดไม่สมบูรณ์ (Unclosed parenthesis)' };
  }

  // Check invalid consecutive operators
  if (/\b(AND|OR|NAND|NOR|XOR|XNOR)\s+(AND|OR|NAND|NOR|XOR|XNOR)\b/i.test(clean) ||
      /\+\s*\+/g.test(clean) ||
      /\*\s*\*/g.test(clean) ||
      /\|\|\s*\|\|/g.test(clean) ||
      /\&\&\s*\&\&/g.test(clean)) {
    return { isValid: false, error: 'มีตัวดำเนินการซ้ำซ้อนติดกัน (Consecutive binary operators)' };
  }

  // Check trailing binary operator at end of expression
  if (/\b(AND|OR|NAND|NOR|XOR|XNOR|\+|\*|·|&|\|)\s*$/i.test(clean)) {
    return { isValid: false, error: 'สมการยังไม่สมบูรณ์ มีตัวดำเนินการค้างท้าย (Trailing operator at end)' };
  }

  // Check starting with binary operator (excluding NOT / ! / ~ / ')
  if (/^\s*(AND|OR|NAND|NOR|XOR|XNOR|\+|\*|·|&|\|)/i.test(clean)) {
    return { isValid: false, error: 'สมการไม่สามารถขึ้นต้นด้วยตัวดำเนินการทวิภาค (Leading binary operator)' };
  }

  // Test evaluation with all true / all false scope
  const testScope = { A: 1, B: 1, C: 1, D: 1, E: 1, F: 1 };
  const res = evaluateBooleanExpr(clean, testScope);
  if (res === null) {
    return { isValid: false, error: 'ไวยากรณ์สมการไม่ถูกต้องตามหลักบูลีน (Syntax Error in Boolean Expression)' };
  }

  return { isValid: true, error: null };
}

function normalizeBooleanExpression(rawExpr) {
  if (!rawExpr) return '';
  let expr = rawExpr.trim();

  // 1. Remove output variable prefix (e.g., Y = , F = , Z =)
  expr = expr.replace(/^[A-Z]\s*=\s*/i, '');

  // 2. Normalize NOT notation: C' -> (!C), C’ -> (!C), ~C -> (!C)
  expr = expr.replace(/([A-Z]|\))\s*['’~]/g, '(!$1)');

  // 3. Transform compound operators NAND, NOR, XNOR first
  for (let p = 0; p < 4; p++) {
    expr = expr.replace(/([A-Za-z0-9_!]+|\([^)]+\))\s*\bNAND\b\s*([A-Za-z0-9_!]+|\([^)]+\))/gi, '!($1 && $2)');
    expr = expr.replace(/([A-Za-z0-9_!]+|\([^)]+\))\s*\bNOR\b\s*([A-Za-z0-9_!]+|\([^)]+\))/gi, '!($1 || $2)');
    expr = expr.replace(/([A-Za-z0-9_!]+|\([^)]+\))\s*\bXNOR\b\s*([A-Za-z0-9_!]+|\([^)]+\))/gi, '!($1 ^ $2)');
  }

  // 4. Standardize logic operator keywords
  expr = expr.replace(/\bXOR\b/gi, ' ^ ');
  expr = expr.replace(/\bAND\b/gi, ' && ');
  expr = expr.replace(/\bOR\b/gi, ' || ');
  expr = expr.replace(/\bNOT\b/gi, ' ! ');
  expr = expr.replace(/·|\*/g, ' && ');
  expr = expr.replace(/\+/g, ' || ');

  // 5. Insert implicit AND between single uppercase variables / parentheses:
  for (let pass = 0; pass < 5; pass++) {
    expr = expr.replace(/([A-Z]|\))\s*([A-Z]|\(|\!)/g, '$1 && $2');
  }

  return expr;
}

function evaluateBooleanExpr(rawExpr, scope) {
  let jsExpr = normalizeBooleanExpression(rawExpr);

  // Replace variable names with scope boolean values (1 / 0)
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

function renderBooleanAlgebra() {
  if (!booleanExprInput || !truthTableContainer) return;

  const expr = booleanExprInput.value.trim();
  if (!expr) {
    truthTableContainer.innerHTML = '<p style="color: #888;">Please enter a boolean expression.</p>';
    if (logicGateDiagramContainer) logicGateDiagramContainer.innerHTML = '';
    return;
  }

  // Validate syntax
  const validation = validateBooleanExpression(expr);
  if (!validation.isValid) {
    truthTableContainer.innerHTML = `<div class="warning_banner error_banner">⚠️ ${escapeHTML(validation.error)}</div>`;
    const simplificationStepsContainer = document.querySelector('#simplificationStepsContainer');
    if (simplificationStepsContainer) simplificationStepsContainer.innerHTML = '';
    const kmapContainer = document.querySelector('#kmapContainer');
    if (kmapContainer) kmapContainer.innerHTML = '';
    if (logicGateDiagramContainer) logicGateDiagramContainer.innerHTML = '';
    return;
  }

  // Clean expression for variable detection (strip Y= prefix)
  const cleanForVars = expr.replace(/^[A-Z]\s*=\s*/i, '');

  // Detect variables used in expression (A, B, C, D, E, F...)
  const varsFound = [];
  const candidateVars = ['A', 'B', 'C', 'D', 'E', 'F'];
  candidateVars.forEach(v => {
    if (new RegExp(`\\b${v}\\b`, 'i').test(cleanForVars)) {
      varsFound.push(v);
    }
  });

  if (varsFound.length === 0) {
    varsFound.push('A', 'B'); // default fallback
  }

  // Ensure boolVarState has entry for all detected variables
  varsFound.forEach(v => {
    if (boolVarState[v] === undefined) {
      boolVarState[v] = 0;
    }
  });

  // Dynamically update Live Variable Inputs buttons
  const varSwitchesList = document.querySelector('#varSwitchesList');
  if (varSwitchesList) {
    varSwitchesList.innerHTML = varsFound.map(v => `
      <button type="button" class="var_toggle ${boolVarState[v] === 1 ? 'is_high' : ''}" data-var="${v}">
        ${v}: <strong class="var_val">${boolVarState[v]}</strong>
      </button>
    `).join('');

    // Rebind event listeners
    const newToggles = varSwitchesList.querySelectorAll('.var_toggle');
    newToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const varName = toggle.getAttribute('data-var');
        boolVarState[varName] = boolVarState[varName] === 1 ? 0 : 1;
        renderBooleanAlgebra();
      });
    });
  }

  const numRows = Math.pow(2, varsFound.length);
  const rows = [];
  const mintermIndices = [];
  const maxtermIndices = [];
  const mintermExprs = [];
  const maxtermExprs = [];

  for (let i = 0; i < numRows; i++) {
    const scope = {};
    varsFound.forEach((v, idx) => {
      const bitShift = varsFound.length - 1 - idx;
      scope[v] = (i >> bitShift) & 1;
    });

    const res = evaluateBooleanExpr(expr, scope);

    // Minterm term construction (1 -> A, 0 -> A')
    const mintermTerms = varsFound.map(v => scope[v] === 1 ? v : `${v}'`);
    const mintermStr = mintermTerms.join('');

    // Maxterm term construction (0 -> A, 1 -> A')
    const maxtermTerms = varsFound.map(v => scope[v] === 0 ? v : `${v}'`);
    const maxtermStr = `(${maxtermTerms.join(' + ')})`;

    if (res === 1) {
      mintermIndices.push(i);
      mintermExprs.push(mintermStr);
    } else if (res === 0) {
      maxtermIndices.push(i);
      maxtermExprs.push(maxtermStr);
    }

    // Check if this row matches the live variable toggles
    let isCurrentRow = true;
    varsFound.forEach(v => {
      if (scope[v] !== boolVarState[v]) isCurrentRow = false;
    });

    rows.push({
      index: i,
      scope,
      res,
      mintermStr,
      maxtermStr,
      isCurrentRow
    });
  }

  // Render Truth Table with Minterm & Maxterm columns
  let tableHtml = '';
  if (varsFound.length > 4) {
    tableHtml += `<div class="warning_banner info_banner">ℹ️ พบตัวแปร ${varsFound.length} ตัว (${varsFound.join(', ')}) &rarr; แสดงตารางความจริง ${numRows} แถว (K-map และการวาดวงจรรองรับสูงสุด 4 ตัวแปร)</div>`;
  }

  tableHtml += `<table class="truth_table"><thead><tr><th>m#</th>`;
  varsFound.forEach(v => {
    tableHtml += `<th>${v}</th>`;
  });
  tableHtml += `<th>Output (F)</th><th>Minterm (m)</th><th>Maxterm (M)</th></tr></thead><tbody>`;

  rows.forEach(r => {
    const activeClass = r.isCurrentRow ? 'class="active_eval_row"' : '';
    tableHtml += `<tr ${activeClass}>`;
    tableHtml += `<td style="color: #64748b; font-size: 0.82rem;">m${r.index}</td>`;
    varsFound.forEach(v => {
      tableHtml += `<td>${r.scope[v]}</td>`;
    });
    const resText = r.res !== null ? `<span class="${r.res === 1 ? 'val_high' : 'val_low'}">${r.res}</span>` : '<span style="color: #dc2626; font-weight: bold;">Error</span>';
    tableHtml += `<td>${resText}</td>`;
    tableHtml += `<td style="font-family: monospace; color: #16a34a; font-weight: bold;">${r.res === 1 ? r.mintermStr : '-'}</td>`;
    tableHtml += `<td style="font-family: monospace; color: #dc2626; font-weight: bold;">${r.res === 0 ? r.maxtermStr : '-'}</td>`;
    tableHtml += `</tr>`;
  });

  tableHtml += `</tbody></table>`;

  // Add Canonical SOP & POS summary boxes
  const sopNotation = mintermIndices.length > 0 ? `Σm(${mintermIndices.join(', ')})` : '0';
  const posNotation = maxtermIndices.length > 0 ? `ΠM(${maxtermIndices.join(', ')})` : '1';
  const sopExpression = mintermExprs.length > 0 ? mintermExprs.join(' + ') : '0';
  const posExpression = maxtermExprs.length > 0 ? maxtermExprs.join(' · ') : '1';

  tableHtml += `
    <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 16px;">
      <div class="gate_card" style="background: #f0fdf4; border-color: #86efac;">
        <span class="gate_label" style="color: #16a34a;">Canonical SOP (Minterm):</span>
        <div style="text-align: right;">
          <strong style="font-family: monospace; font-size: 1rem; color: #15803d;">F = ${sopNotation}</strong><br>
          <span style="font-family: monospace; font-size: 0.88rem; color: #166534;">= ${escapeHTML(sopExpression)}</span>
        </div>
      </div>
      <div class="gate_card" style="background: #fef2f2; border-color: #fca5a5;">
        <span class="gate_label" style="color: #dc2626;">Canonical POS (Maxterm):</span>
        <div style="text-align: right;">
          <strong style="font-family: monospace; font-size: 1rem; color: #b91c1c;">F = ${posNotation}</strong><br>
          <span style="font-family: monospace; font-size: 0.88rem; color: #991b1b;">= ${escapeHTML(posExpression)}</span>
        </div>
      </div>
    </div>
  `;

  truthTableContainer.innerHTML = tableHtml;

  // Render Step-by-Step Simplification (กฎที่ใช้ในแต่ละขั้นตอน)
  const simplificationStepsContainer = document.querySelector('#simplificationStepsContainer');
  if (simplificationStepsContainer) {
    simplificationStepsContainer.innerHTML = renderStepByStepSimplification(mintermIndices, varsFound, mintermExprs);
  }

  // Render K-map (Gray Code order 00, 01, 11, 10)
  const kmapContainer = document.querySelector('#kmapContainer');
  if (kmapContainer) {
    let kmapHtml = '';

    if (varsFound.length === 2) {
      // 2-variable K-map (A vertical, B horizontal)
      const grid = [
        [rows[0].res, rows[1].res], // A=0: B=0(m0), B=1(m1)
        [rows[2].res, rows[3].res]  // A=1: B=0(m2), B=1(m3)
      ];

      kmapHtml = `
        <div class="ref-table-wrapper" style="overflow-x: auto;">
          <table class="ref-table" style="max-width: 340px; margin: 0 auto;">
            <thead>
              <tr>
                <th style="background: #e2e8f0;">A \\ B</th>
                <th>B = 0</th>
                <th>B = 1</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>A = 0</th>
                <td class="${grid[0][0] === 1 ? 'highlighted' : ''}"><strong>${grid[0][0]}</strong> <small style="color: #64748b;">(m0)</small></td>
                <td class="${grid[0][1] === 1 ? 'highlighted' : ''}"><strong>${grid[0][1]}</strong> <small style="color: #64748b;">(m1)</small></td>
              </tr>
              <tr>
                <th>A = 1</th>
                <td class="${grid[1][0] === 1 ? 'highlighted' : ''}"><strong>${grid[1][0]}</strong> <small style="color: #64748b;">(m2)</small></td>
                <td class="${grid[1][1] === 1 ? 'highlighted' : ''}"><strong>${grid[1][1]}</strong> <small style="color: #64748b;">(m3)</small></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    } else if (varsFound.length === 3) {
      // 3-variable K-map (A vertical 0,1 | BC horizontal Gray Code 00, 01, 11, 10)
      const grayCols = [
        { label: '00', m0: 0, m1: 4 },
        { label: '01', m0: 1, m1: 5 },
        { label: '11', m0: 3, m1: 7 },
        { label: '10', m0: 2, m1: 6 }
      ];

      kmapHtml = `
        <div class="ref-table-wrapper" style="overflow-x: auto;">
          <table class="ref-table">
            <thead>
              <tr>
                <th style="background: #e2e8f0;">A \\ BC</th>
                <th>BC = 00</th>
                <th>BC = 01</th>
                <th>BC = 11</th>
                <th>BC = 10</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>A = 0</th>
                ${grayCols.map(c => {
                  const val = rows[c.m0] ? rows[c.m0].res : 0;
                  return `<td class="${val === 1 ? 'highlighted' : ''}"><strong>${val}</strong> <small style="color: #64748b;">(m${c.m0})</small></td>`;
                }).join('')}
              </tr>
              <tr>
                <th>A = 1</th>
                ${grayCols.map(c => {
                  const val = rows[c.m1] ? rows[c.m1].res : 0;
                  return `<td class="${val === 1 ? 'highlighted' : ''}"><strong>${val}</strong> <small style="color: #64748b;">(m${c.m1})</small></td>`;
                }).join('')}
              </tr>
            </tbody>
          </table>
        </div>
        <p style="font-size: 0.82rem; color: #64748b; margin-top: 6px; text-align: center;">* คอลัมน์เรียงตามลำดับ <strong>Gray Code (00, 01, 11, 10)</strong> ตามสไลด์บทที่ 5</p>
      `;
    } else if (varsFound.length >= 4) {
      // 4-variable K-map (AB vertical Gray Code 00, 01, 11, 10 | CD horizontal Gray Code 00, 01, 11, 10)
      const grayRows = [
        { label: '00', cols: [0, 1, 3, 2] },
        { label: '01', cols: [4, 5, 7, 6] },
        { label: '11', cols: [12, 13, 15, 14] },
        { label: '10', cols: [8, 9, 11, 10] }
      ];

      kmapHtml = `
        <div class="ref-table-wrapper" style="overflow-x: auto;">
          <table class="ref-table">
            <thead>
              <tr>
                <th style="background: #e2e8f0;">AB \\ CD</th>
                <th>CD = 00</th>
                <th>CD = 01</th>
                <th>CD = 11</th>
                <th>CD = 10</th>
              </tr>
            </thead>
            <tbody>
              ${grayRows.map(r => `
                <tr>
                  <th>AB = ${r.label}</th>
                  ${r.cols.map(mIdx => {
                    const val = rows[mIdx] ? rows[mIdx].res : 0;
                    return `<td class="${val === 1 ? 'highlighted' : ''}"><strong>${val}</strong> <small style="color: #64748b;">(m${mIdx})</small></td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <p style="font-size: 0.82rem; color: #64748b; margin-top: 6px; text-align: center;">* ตาราง K-map 4 ตัวแปร เรียงลำดับ <strong>Gray Code (00, 01, 11, 10)</strong> ตามสไลด์บทที่ 5 หน้า 26 & 30</p>
      `;
    }

    kmapContainer.innerHTML = kmapHtml;
  }

  // Render Live Circuit Simulation
  if (logicGateDiagramContainer) {
    const liveScope = {};
    varsFound.forEach(v => liveScope[v] = boolVarState[v]);
    const liveResult = evaluateBooleanExpr(expr, liveScope);

    let circuitHtml = `
      <div class="circuit_container">
        <p style="font-weight: 600; color: #475569; margin-bottom: 8px;">Live Signal Gate Status (สถานะสัญญาณลอจิกเรียลไทม์):</p>
    `;

    varsFound.forEach(v => {
      const val = boolVarState[v];
      circuitHtml += `
        <div class="gate_card">
          <span class="gate_label">Input ${v}</span>
          <span class="signal_badge ${val === 1 ? 'high' : 'low'}">${val === 1 ? 'HIGH (1)' : 'LOW (0)'}</span>
        </div>
      `;
    });

    circuitHtml += `
        <div class="gate_card" style="background: #f0f9ff; border-color: #0072ff; margin-top: 6px;">
          <span class="gate_label" style="color: #0072ff;">Circuit Output (F)</span>
          <span class="signal_badge ${liveResult === 1 ? 'high' : 'low'}">${liveResult === 1 ? 'HIGH (1)' : 'LOW (0)'}</span>
        </div>
      </div>
    `;

    logicGateDiagramContainer.innerHTML = circuitHtml;
  }
}

function renderStepByStepSimplification(mintermIndices, varsFound, mintermExprs) {
  if (!mintermIndices || mintermIndices.length === 0) {
    return `
      <div class="gate_card" style="background: #fef2f2; border-color: #fca5a5;">
        <span class="gate_label" style="color: #dc2626;">สรุปผลลัพธ์:</span>
        <strong style="font-family: monospace; font-size: 1.1rem; color: #dc2626;">Y = 0</strong>
      </div>
    `;
  }

  const numVars = varsFound.length;
  const totalMinterms = Math.pow(2, numVars);
  if (mintermIndices.length === totalMinterms) {
    return `
      <div class="gate_card" style="background: #f0fdf4; border-color: #86efac;">
        <span class="gate_label" style="color: #16a34a;">สรุปผลลัพธ์:</span>
        <strong style="font-family: monospace; font-size: 1.1rem; color: #16a34a;">Y = 1</strong>
      </div>
    `;
  }

  const steps = [];
  const initExpr = mintermExprs.join(' + ');

  // Step 1: Canonical SOP / Grouping
  steps.push({
    num: 1,
    target: `พจน์ทั้งหมด (${mintermExprs.join(', ')})`,
    law: `Canonical SOP Form (สมการมาตรฐานจาก Minterm)`,
    result: `Y = ${initExpr}`
  });

  // Step 2: Combining adjacent terms (Distributive Law & Complement Law)
  if (mintermExprs.length > 1) {
    const grouped = [];
    for (let i = 0; i < mintermIndices.length; i++) {
      for (let j = i + 1; j < mintermIndices.length; j++) {
        const m1 = mintermIndices[i];
        const m2 = mintermIndices[j];
        const diff = m1 ^ m2;
        if ((diff & (diff - 1)) === 0) {
          const e1 = mintermExprs[i];
          const e2 = mintermExprs[j];
          let common = '';
          for (let k = 0; k < e1.length; k++) {
            if (e1[k] === e2[k]) {
              common += e1[k];
            }
          }
          if (common && !grouped.includes(common)) {
            grouped.push(common);
          }
        }
      }
    }

    if (grouped.length > 0) {
      steps.push({
        num: 2,
        target: `ดึงตัวร่วมพจน์คู่ประชิด (${mintermExprs.slice(0, 2).join(' + ')})`,
        law: `Distributive Law: X(Y + Y') = XY + XY'`,
        result: `Y = ${grouped.join(' + ')}`
      });

      steps.push({
        num: 3,
        target: `การตัดพจน์ตรงข้าม`,
        law: `Complement Law: Y + Y' = 1 & Identity Law: X · 1 = X`,
        result: `Y = ${grouped.join(' + ')}`
      });
    }
  }

  // Generate Step HTML Cards
  let html = `<div class="steps_grid">`;
  steps.forEach(s => {
    html += `
      <div class="step_card">
        <div class="step_card_header">Step ${s.num}</div>
        <div class="step_card_row"><strong>พจน์ที่จัดการ:</strong> ${escapeHTML(s.target)}</div>
        <div class="step_card_row"><strong>กฎที่ใช้:</strong> <span style="color: var(--primary); font-weight: 700;">${escapeHTML(s.law)}</span></div>
        <div class="step_card_row" style="background: #f8fafc; padding: 6px 8px; border-radius: 6px; margin-top: 6px;">
          <strong>ผลลัพธ์ย่อย:</strong> <code style="font-family: monospace; font-size: 0.95rem; color: #0284c7; font-weight: bold;">${escapeHTML(s.result)}</code>
        </div>
      </div>
    `;
  });
  html += `</div>`;

  const finalSimplified = steps[steps.length - 1].result.replace('Y = ', '');
  html += `
    <div class="gate_card" style="background: #f0fdf4; border-color: #86efac; margin-top: 14px;">
      <div>
        <span class="gate_label" style="color: #16a34a;">🏆 สรุปผลลัพธ์รูปที่ง่ายที่สุด (Final Answer):</span><br>
        <span style="font-size: 0.85rem; color: #166534;">ลดรูปด้วยกฎพีชคณิตบูลีน ประหยัดเกตและประมวลผลได้เร็วที่สุด</span>
      </div>
      <strong style="font-family: monospace; font-size: 1.25rem; color: #15803d;">Y = ${escapeHTML(finalSimplified)}</strong>
    </div>
  `;

  return html;
}

/* ==========================================================================
   MODULE 3: 1's & 2's COMPLEMENT CALCULATOR ENGINE
   ========================================================================== */
const complementInput = document.querySelector('#complementInput');
const complementResultContainer = document.querySelector('#complementResultContainer');

if (complementInput) {
  complementInput.addEventListener('input', renderComplementCalculator);
}

function renderComplementCalculator() {
  if (!complementInput || !complementResultContainer) return;

  let raw = complementInput.value.trim();
  const hasInvalidChars = /[^01]/.test(raw);
  raw = raw.replace(/[^01]/g, '');

  if (!raw) {
    complementResultContainer.innerHTML = '<div class="warning_banner error_banner">⚠️ กรุณากรอกเลขฐานสอง (0 และ 1 เท่านั้น)</div>';
    return;
  }

  const bitLength = raw.length;

  // 1's Complement (Flip bits)
  let onesComp = '';
  for (let i = 0; i < raw.length; i++) {
    onesComp += raw[i] === '0' ? '1' : '0';
  }

  // 2's Complement (1's Complement + 1)
  let twosCompArr = onesComp.split('');
  let carry = 1;

  for (let i = twosCompArr.length - 1; i >= 0; i--) {
    if (twosCompArr[i] === '1' && carry === 1) {
      twosCompArr[i] = '0';
    } else if (twosCompArr[i] === '0' && carry === 1) {
      twosCompArr[i] = '1';
      carry = 0;
    }
  }
  const twosComp = twosCompArr.join('');

  // MSB Sign Bit analysis
  const msb = raw[0];
  const isNegative = msb === '1';
  let signedDec = 0n;

  if (isNegative) {
    if (raw.length === 1) {
      signedDec = -1n;
    } else {
      let absVal = 0n;
      for (let i = 0; i < twosComp.length; i++) {
        absVal = (absVal << 1n) | (twosComp[i] === '1' ? 1n : 0n);
      }
      signedDec = -absVal;
    }
  } else {
    for (let i = 0; i < raw.length; i++) {
      signedDec = (signedDec << 1n) | (raw[i] === '1' ? 1n : 0n);
    }
  }

  // Unsigned Decimal value
  let unsignedDec = 0n;
  for (let i = 0; i < raw.length; i++) {
    unsignedDec = (unsignedDec << 1n) | (raw[i] === '1' ? 1n : 0n);
  }

  // Representable Range for N-bit signed number: [-2^(N-1), 2^(N-1) - 1]
  const minSigned = -(1n << BigInt(bitLength - 1));
  const maxSigned = (1n << BigInt(bitLength - 1)) - 1n;
  const maxUnsigned = (1n << BigInt(bitLength)) - 1n;

  let warningHtml = '';
  if (hasInvalidChars) {
    warningHtml = `<div class="warning_banner">⚠️ ระบบกรองอักขระที่ไม่ใช่ 0 และ 1 ออกให้โดยอัตโนมัติ</div>`;
  }

  complementResultContainer.innerHTML = `
    ${warningHtml}
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div class="gate_card">
        <div>
          <span class="gate_label">Original Binary (${bitLength} bits):</span>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">บิตเครื่องหมาย (MSB) = <strong>${msb}</strong> &rarr; ${isNegative ? '<span style="color: #dc2626; font-weight: bold;">จำนวนติดลบ (-)</span>' : '<span style="color: #16a34a; font-weight: bold;">จำนวนบวก (+)</span>'}</p>
        </div>
        <code style="font-size: 1.15rem; font-weight: bold; color: #1e293b;">${escapeHTML(raw)}<sub>2</sub></code>
      </div>
      
      <div class="gate_card">
        <div>
          <span class="gate_label">1's Complement (กลับบิต 0 &harr; 1):</span>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">Bitwise Inversion</p>
        </div>
        <code style="font-size: 1.15rem; font-weight: bold; color: #0284c7;">${escapeHTML(onesComp)}<sub>2</sub></code>
      </div>

      <div class="gate_card">
        <div>
          <span class="gate_label">2's Complement (1's Complement + 1):</span>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">รูปติดลบแท้จริงในระบบคอมพิวเตอร์</p>
        </div>
        <code style="font-size: 1.15rem; font-weight: bold; color: #16a34a;">${escapeHTML(twosComp)}<sub>2</sub></code>
      </div>

      <div class="gate_card" style="background: #faf5ff; border-color: #e9d5ff;">
        <div>
          <span class="gate_label" style="color: #6b21a8;">Signed Decimal Value (ค่าฐาน 10 มีเครื่องหมาย):</span>
          <p style="font-size: 0.82rem; color: #7e22ce; margin-top: 2px;">ช่วงที่รองรับได้ใน ${bitLength} บิต: [${minSigned.toString()}, ${maxSigned.toString()}]</p>
        </div>
        <strong style="font-size: 1.35rem; color: #6b21a8;">${signedDec.toString()}<sub>10</sub></strong>
      </div>

      <div class="gate_card" style="background: #f8fafc; border-color: #cbd5e1;">
        <div>
          <span class="gate_label" style="color: #475569;">Unsigned Decimal Value (ค่าฐาน 10 ไม่มีเครื่องหมาย):</span>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">ช่วงที่รองรับได้: [0, ${maxUnsigned.toString()}]</p>
        </div>
        <strong style="font-size: 1.15rem; color: #334155;">${unsignedDec.toString()}<sub>10</sub></strong>
      </div>
    </div>
  `;
}

/* ==========================================================================
   MODULE 4: BASE ARITHMETIC ENGINE
   ========================================================================== */
const arithmeticBaseSelect = document.getElementById('arithmeticBaseSelect');
const arithmeticOpSelect = document.getElementById('arithmeticOpSelect');
const arithmeticInput1 = document.getElementById('arithmeticInput1');
const arithmeticInput2 = document.getElementById('arithmeticInput2');
const arithmeticStepsContainer = document.getElementById('arithmeticStepsContainer');

function sanitizeArithmeticInputs() {
  if (!arithmeticBaseSelect) return;
  const base = parseInt(arithmeticBaseSelect.value, 10);
  let regex = /^[0-9A-F]$/i;
  if (base === 2) regex = /^[01]$/;
  else if (base === 8) regex = /^[0-7]$/;
  else if (base === 10) regex = /^[0-9]$/;

  const sanitizeStr = (str) => {
    let clean = '';
    const uppercase = str.toUpperCase();
    const isNeg = uppercase.startsWith('-');
    const startIdx = isNeg ? 1 : 0;
    for (let i = startIdx; i < uppercase.length; i++) {
      if (regex.test(uppercase[i])) {
        clean += uppercase[i];
      }
    }
    return (isNeg && clean ? '-' : '') + clean;
  };

  if (arithmeticInput1) {
    arithmeticInput1.value = sanitizeStr(arithmeticInput1.value.trim());
  }
  if (arithmeticInput2) {
    arithmeticInput2.value = sanitizeStr(arithmeticInput2.value.trim());
  }
}

if (arithmeticOpSelect) {
  arithmeticOpSelect.addEventListener('change', () => {
    calculateBaseArithmetic();
    saveAppState();
  });
}

if (arithmeticBaseSelect && arithmeticInput1 && arithmeticInput2) {
  arithmeticBaseSelect.addEventListener('change', () => {
    sanitizeArithmeticInputs();
    calculateBaseArithmetic();
    saveAppState();
  });
  arithmeticInput1.addEventListener('input', () => {
    sanitizeArithmeticInputs();
    calculateBaseArithmetic();
  });
  arithmeticInput2.addEventListener('input', () => {
    sanitizeArithmeticInputs();
    calculateBaseArithmetic();
  });
}

function calculateBaseArithmetic() {
  if (!arithmeticStepsContainer) return;
  const base = parseInt(arithmeticBaseSelect.value, 10);
  const currentMathOp = arithmeticOpSelect ? arithmeticOpSelect.value : '+';
  let val1 = arithmeticInput1.value.trim().toUpperCase();
  let val2 = arithmeticInput2.value.trim().toUpperCase();

  if (!val1 || !val2) {
    arithmeticStepsContainer.innerHTML = '<p style="color: #888;">Please enter both operands to see calculations.</p>';
    return;
  }

  // Support negative sign in front
  let isNeg1 = false;
  let isNeg2 = false;

  if (val1.startsWith('-')) { isNeg1 = true; val1 = val1.substring(1); }
  if (val2.startsWith('-')) { isNeg2 = true; val2 = val2.substring(1); }

  if (!val1 || !val2) {
    arithmeticStepsContainer.innerHTML = '<div class="warning_banner error_banner">⚠️ กรุณากรอกตัวเลขให้ครบถ้วน</div>';
    return;
  }

  let regex = /^[0-9A-F]+$/;
  if (base === 2) regex = /^[01]+$/;
  else if (base === 8) regex = /^[0-7]+$/;
  else if (base === 10) regex = /^[0-9]+$/;

  if (!regex.test(val1) || !regex.test(val2)) {
    arithmeticStepsContainer.innerHTML = `<div class="warning_banner error_banner">⚠️ ตัวเลขมีอักขระที่ไม่ถูกต้องสำหรับเลขฐาน ${base}</div>`;
    return;
  }

  // Convert to BigInt Decimals for 100% precision
  let dec1 = 0n;
  let dec2 = 0n;
  const baseBig = BigInt(base);

  for (let i = 0; i < val1.length; i++) {
    dec1 = dec1 * baseBig + BigInt(digits.indexOf(val1[i]));
  }
  for (let i = 0; i < val2.length; i++) {
    dec2 = dec2 * baseBig + BigInt(digits.indexOf(val2[i]));
  }

  if (isNeg1) dec1 = -dec1;
  if (isNeg2) dec2 = -dec2;

  let resultDec = 0n;
  let remainderDec = 0n;
  let operatorStr = '';
  let operatorSymbol = currentMathOp;

  switch(currentMathOp) {
    case '+': 
      resultDec = dec1 + dec2; 
      operatorStr = 'Addition (+) การบวก'; 
      break;
    case '-': 
      resultDec = dec1 - dec2; 
      operatorStr = 'Subtraction (-) การลบ'; 
      break;
    case '*': 
      resultDec = dec1 * dec2; 
      operatorStr = 'Multiplication (×) การคูณ'; 
      operatorSymbol = '×';
      break;
    case '/': 
      if (dec2 === 0n) {
        arithmeticStepsContainer.innerHTML = `<div class="warning_banner error_banner">⚠️ ไม่สามารถหารด้วยศูนย์ได้ (Cannot divide by zero)</div>`;
        return;
      }
      resultDec = dec1 / dec2;
      remainderDec = dec1 % dec2;
      operatorStr = 'Division (÷) การหาร';
      operatorSymbol = '÷';
      break;
  }

  // Convert resultDec to target base using BigInt
  function bigIntToBase(val, b) {
    if (val === 0n) return '0';
    let q = val < 0n ? -val : val;
    let res = '';
    const bBig = BigInt(b);
    while (q > 0n) {
      const rem = Number(q % bBig);
      res = digits[rem] + res;
      q = q / bBig;
    }
    return (val < 0n ? '-' : '') + res;
  }

  let resultBase = bigIntToBase(resultDec, base);
  let remainderStr = '';
  if (currentMathOp === '/' && remainderDec !== 0n) {
    const remBase = bigIntToBase(remainderDec, base);
    remainderStr = ` (เศษ: ${remainderDec.toString()}<sub>10</sub> = <strong>${remBase}</strong><sub>${base}</sub>)`;
  }

  const html = `
    <div class="steps_grid">
      <div class="step_card">
        <div class="step_card_header">Step 1: Convert to Decimal (แปลงเป็นฐาน 10)</div>
        <div class="step_card_row"><strong>Operand 1:</strong> (${isNeg1 ? '-' : ''}${escapeHTML(val1)})<sub>${base}</sub> = <strong>${dec1.toString()}</strong><sub>10</sub></div>
        <div class="step_card_row"><strong>Operand 2:</strong> (${isNeg2 ? '-' : ''}${escapeHTML(val2)})<sub>${base}</sub> = <strong>${dec2.toString()}</strong><sub>10</sub></div>
      </div>
      <div class="step_card">
        <div class="step_card_header">Step 2: Decimal ${escapeHTML(operatorStr)}</div>
        <div class="step_card_row" style="font-family: monospace; font-size: 1.1rem; text-align: center;">
          ${dec1.toString()} ${operatorSymbol} ${dec2.toString()} = <strong>${resultDec.toString()}</strong> ${remainderDec !== 0n ? `(เศษ: ${remainderDec.toString()})` : ''}
        </div>
      </div>
      <div class="step_card">
        <div class="step_card_header">Step 3: Convert Result back to Base ${base}</div>
        <div class="step_card_row"><strong>Result:</strong> (${resultDec.toString()})<sub>10</sub> = <strong>${resultBase}</strong><sub>${base}</sub></div>
        ${remainderDec !== 0n ? `<div class="step_card_row"><strong>Remainder:</strong> (${remainderDec.toString()})<sub>10</sub> = <strong>${bigIntToBase(remainderDec, base)}</strong><sub>${base}</sub></div>` : ''}
      </div>
    </div>
    
    <div class="gate_card" style="background: #f0fdf4; border-color: #86efac; margin-top: 14px; text-align: center;">
      <span class="gate_label" style="color: #16a34a;">🏆 Final Result (Base ${base})</span>
      <strong style="font-family: monospace; font-size: 1.5rem; color: #15803d; display: block; margin-top: 8px;">
        ${resultBase}${remainderDec !== 0n ? ` (เศษ: ${bigIntToBase(remainderDec, base)})` : ''}
      </strong>
    </div>
  `;

  arithmeticStepsContainer.innerHTML = html;
}

// Initialize language & restore app state from localStorage before initial renders
setLanguage(currentLang);
restoreAppState();

// Initial renders for modules
renderBooleanAlgebra();
renderComplementCalculator();
calculateBaseArithmetic();
setupClearButtons();

// Global listener to save state on select changes
document.querySelectorAll('select').forEach(sel => {
  sel.addEventListener('change', saveAppState);
});

/* ==========================================================================
   PROGRESSIVE WEB APP (PWA) SERVICE WORKER REGISTRATION
   ========================================================================== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('Service Worker registered successfully:', reg.scope))
      .catch((err) => console.log('Service Worker registration failed:', err));
  });
}