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