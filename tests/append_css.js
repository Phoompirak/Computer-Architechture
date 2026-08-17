const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

const newCSS = `
/* ==========================================================================
   MODULE 3: BOOLEAN LAWS & STEP-BY-STEP (MATCHING REFERENCE UI)
   ========================================================================== */
.laws_content, .step_example_content {
  padding: 16px;
  background: #ffffff;
  border-radius: var(--radius-lg);
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.laws_grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.law_column {
  background: #f8fafc;
  border-radius: var(--radius-md);
  border: 1.5px solid #cbd5e1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.law_col_header {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1e3a8a;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.law_col_header h5 {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  margin: 0;
  flex: 1;
}

.law_num {
  width: 24px;
  height: 24px;
  background: #fff;
  color: #1e3a8a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.law_item {
  background: #fff;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.law_name {
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}

.law_name svg {
  color: #3b82f6;
}

.law_eqs {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f1f5f9;
  padding: 8px;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-weight: 600;
  color: #334155;
}

/* Step-by-Step UI */
.step_example_header {
  text-align: center;
  margin-bottom: 20px;
}

.step_example_header h3 {
  color: #1e3a8a;
  font-family: var(--font-heading);
  font-size: 1.4rem;
  margin-bottom: 8px;
}

.step_example_eq {
  font-size: 1.1rem;
  font-weight: bold;
  color: #334155;
  background: #f1f5f9;
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 8px;
}

.step_example_eq span {
  font-family: ui-monospace, Consolas, monospace;
  color: #1e3a8a;
  font-size: 1.2rem;
}

.step_example_body {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 16px;
}

.step_table_container {
  overflow-x: auto;
}

.step_table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.1);
}

.step_table th {
  background: #1e3a8a;
  color: #fff;
  padding: 10px;
  font-family: var(--font-heading);
}

.step_table td {
  padding: 10px;
  border-bottom: 1px solid #bfdbfe;
  border-right: 1px solid #bfdbfe;
  vertical-align: top;
  font-size: 0.9rem;
}

.step_table td span {
  font-family: ui-monospace, Consolas, monospace;
  font-weight: bold;
  color: #1e3a8a;
}

.step_circle {
  width: 28px;
  height: 28px;
  background: #1e3a8a;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin: 0 auto;
}

.rule_circle {
  width: 28px;
  height: 28px;
  background: #15803d;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin: 0 auto;
}

.rule_circle.small {
  width: 20px;
  height: 20px;
  font-size: 0.8rem;
  display: inline-flex;
}

.rules_legend {
  background: #f8fafc;
  border: 1.5px solid #bfdbfe;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.rules_legend h4 {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1e3a8a;
  margin-bottom: 8px;
  border-bottom: 1px solid #bfdbfe;
  padding-bottom: 4px;
}

.rules_legend ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rules_legend li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.diagram_box {
  background: #f0f5ff;
  border: 2px solid #93c5fd;
  border-radius: 8px;
  padding: 12px;
}

.diagram_title {
  background: #3b82f6;
  color: #fff;
  text-align: center;
  padding: 6px;
  border-radius: 4px;
  font-weight: bold;
  margin-bottom: 12px;
}

.diagram_item {
  margin-bottom: 12px;
}

.d_step {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 4px;
}

.step_example_footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  gap: 16px;
}

.final_ans {
  background: #dc2626;
  color: #fff;
  padding: 10px 20px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  font-size: 1.1rem;
}

.final_ans span {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 1.3rem;
  background: #fff;
  color: #dc2626;
  padding: 2px 10px;
  border-radius: 12px;
}

.final_note {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f0fdf4;
  border: 2px solid #86efac;
  padding: 10px 16px;
  border-radius: 8px;
  color: #166534;
  font-weight: 600;
  font-size: 0.95rem;
}

@media (max-width: 900px) {
  .laws_grid {
    grid-template-columns: 1fr;
  }
  .step_example_body {
    grid-template-columns: 1fr;
  }
  .step_example_footer {
    flex-direction: column;
    align-items: stretch;
  }
}
`;

fs.writeFileSync('style.css', css + newCSS);
