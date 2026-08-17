const queryH = document.querySelector('#query');
const inputNumberic = document.querySelector('#inputNumberic');
const outputNumberic = document.querySelector('#outputNumberic');
const fromBase = document.querySelector('#fromBaseNumericSelect');
const toBase = document.querySelector('#toBaseNumericSelect');
const shortDivisionSteps = document.querySelector('#shortDivisionSteps');
const tabStandardBtn = document.querySelector('#tabStandardBtn');
const tabGroupingBtn = document.querySelector('#tabGroupingBtn');

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
   NAVIGATION MODULE ROUTER
   ========================================================================== */
const navLinks = document.querySelectorAll('.nav_link');
const moduleViews = document.querySelectorAll('.module_view');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    const targetViewId = link.getAttribute('data-view');

    navLinks.forEach(l => {
      if (l.getAttribute('data-view') === targetViewId) {
        l.classList.add('active');
      } else {
        l.classList.remove('active');
      }
    });

    moduleViews.forEach(view => {
      if (view.id === `view-${targetViewId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });
  });
});

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

function evaluateBooleanExpr(expr, scope) {
  let jsExpr = expr.toUpperCase();
  jsExpr = jsExpr.replace(/\bNAND\b/g, 'NAND_OP');
  jsExpr = jsExpr.replace(/\bNOR\b/g, 'NOR_OP');
  jsExpr = jsExpr.replace(/\bXOR\b/g, '^');
  jsExpr = jsExpr.replace(/\bXNOR\b/g, 'XNOR_OP');
  jsExpr = jsExpr.replace(/\bAND\b/g, '&&');
  jsExpr = jsExpr.replace(/\bOR\b/g, '||');
  jsExpr = jsExpr.replace(/\bNOT\b/g, '!');

  // Replace variables
  Object.keys(scope).forEach(v => {
    const reg = new RegExp(`\\b${v}\\b`, 'g');
    jsExpr = jsExpr.replace(reg, scope[v] ? 'true' : 'false');
  });

  // Handle custom NAND/NOR/XNOR
  jsExpr = jsExpr.replace(/(\w+|\([^)]+\))\s*NAND_OP\s*(\w+|\([^)]+\))/g, '!($1 && $2)');
  jsExpr = jsExpr.replace(/(\w+|\([^)]+\))\s*NOR_OP\s*(\w+|\([^)]+\))/g, '!($1 || $2)');
  jsExpr = jsExpr.replace(/(\w+|\([^)]+\))\s*XNOR_OP\s*(\w+|\([^)]+\))/g, '!($1 ^ $2)');

  try {
    const result = Function(`"use strict"; return (${jsExpr})`)();
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

  // Detect variables used (A, B, C)
  const varsFound = [];
  ['A', 'B', 'C'].forEach(v => {
    if (new RegExp(`\\b${v}\\b`, 'i').test(expr)) {
      varsFound.push(v);
    }
  });

  if (varsFound.length === 0) {
    varsFound.push('A', 'B'); // default fallback
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
  let tableHtml = `<table class="truth_table"><thead><tr><th>m#</th>`;
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
    const resText = r.res !== null ? `<span class="${r.res === 1 ? 'val_high' : 'val_low'}">${r.res}</span>` : 'Error';
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
          <table class="ref-table" style="max-width: 320px; margin: 0 auto;">
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
    } else {
      // 3-variable K-map (A vertical 0,1 | BC horizontal Gray Code 00, 01, 11, 10)
      // Map indices:
      // A=0: 00(m0), 01(m1), 11(m3), 10(m2)
      // A=1: 00(m4), 01(m5), 11(m7), 10(m6)
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
  // Filter binary digits only
  raw = raw.replace(/[^01]/g, '');

  if (!raw) {
    complementResultContainer.innerHTML = '<p style="color: #888;">Please enter a binary number.</p>';
    return;
  }

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

  // Signed Decimal value (MSB as sign bit)
  const isNegative = raw[0] === '1';
  let signedDec = 0;
  if (isNegative && raw.length > 1) {
    // 2's complement decimal formula
    const absVal = parseInt(twosComp, 2);
    signedDec = -absVal;
  } else {
    signedDec = parseInt(raw, 2);
  }

  complementResultContainer.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div class="gate_card">
        <span class="gate_label">Original Binary:</span>
        <code style="font-size: 1.1rem; font-weight: bold; color: #1e293b;">${escapeHTML(raw)}</code>
      </div>
      <div class="gate_card">
        <span class="gate_label">1's Complement (กลับบิต):</span>
        <code style="font-size: 1.1rem; font-weight: bold; color: #0072ff;">${escapeHTML(onesComp)}</code>
      </div>
      <div class="gate_card">
        <span class="gate_label">2's Complement (1's + 1):</span>
        <code style="font-size: 1.1rem; font-weight: bold; color: #16a34a;">${escapeHTML(twosComp)}</code>
      </div>
      <div class="gate_card" style="background: #fdf4ff; border-color: #c084fc;">
        <span class="gate_label" style="color: #9333ea;">Signed Decimal Value:</span>
        <strong style="font-size: 1.15rem; color: #9333ea;">${signedDec}</strong>
      </div>
    </div>
  `;
}

// Initial renders for new modules
renderBooleanAlgebra();
renderComplementCalculator();

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