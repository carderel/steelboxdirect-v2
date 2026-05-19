import { useState } from 'react';
import { setCalculatorResult } from '../lib/attribution';

type Step = 'use' | 'quantity' | 'result';
type UseCase = 'equipment' | 'vehicles' | 'inventory' | 'workshop' | 'other';
type SizeResult = '20ft' | '40ft' | '40ft_hc';

interface CalculatorState {
  useCase: UseCase | null;
  useCaseOther: string;
  quantity: 'small' | 'medium' | 'large' | null;
  needsHeight: boolean;
}

const USE_CASES: Record<UseCase, { label: string; description: string }> = {
  equipment: {
    label: 'Farm/Construction Equipment',
    description: 'Tractors, mowers, tools, machinery',
  },
  vehicles: {
    label: 'Vehicles',
    description: 'Cars, ATVs, motorcycles, trailers',
  },
  inventory: {
    label: 'Inventory/Goods Storage',
    description: 'Boxes, pallets, merchandise, supplies',
  },
  workshop: {
    label: 'Workshop/Workspace',
    description: 'Work area, tools, projects',
  },
  other: {
    label: 'Other',
    description: 'Something else',
  },
};

const QUANTITY_OPTIONS = {
  equipment: [
    { value: 'small', label: '1-2 small items', description: 'Riding mower, small tractor, hand tools' },
    { value: 'medium', label: '2-4 medium items', description: 'Full-size tractor, multiple implements' },
    { value: 'large', label: '5+ items or large equipment', description: 'Multiple large machines, significant tool collection' },
  ],
  vehicles: [
    { value: 'small', label: '1-2 motorcycles/ATVs', description: 'Or similar small vehicles' },
    { value: 'medium', label: '1 car or 3-4 ATVs', description: 'Standard vehicle storage' },
    { value: 'large', label: '2+ cars or many vehicles', description: 'Multiple full-size vehicles' },
  ],
  inventory: [
    { value: 'small', label: 'Small amount', description: 'Fits in a large closet or small room' },
    { value: 'medium', label: 'Medium amount', description: 'Fills a one-car garage' },
    { value: 'large', label: 'Large amount', description: 'Fills a two-car garage or more' },
  ],
  workshop: [
    { value: 'small', label: 'Basic workspace', description: 'Workbench, some tools, small projects' },
    { value: 'medium', label: 'Full workshop', description: 'Multiple stations, equipment, storage' },
    { value: 'large', label: 'Large workshop', description: 'Significant equipment, vehicle work, large projects' },
  ],
  other: [
    { value: 'small', label: 'Small/minimal', description: 'Limited items or space needs' },
    { value: 'medium', label: 'Moderate', description: 'Reasonable amount of stuff' },
    { value: 'large', label: 'Large/significant', description: 'Lots of items or space needed' },
  ],
};

function calculateSize(state: CalculatorState): SizeResult {
  const { quantity, needsHeight } = state;

  if (needsHeight && quantity !== 'small') {
    return '40ft_hc';
  }

  switch (quantity) {
    case 'small':
      return '20ft';
    case 'medium':
      return '40ft';
    case 'large':
      return needsHeight ? '40ft_hc' : '40ft';
    default:
      return '40ft';
  }
}

const SIZE_INFO: Record<SizeResult, { name: string; dimensions: string; capacity: string; good_for: string }> = {
  '20ft': {
    name: '20ft Standard',
    dimensions: "20' x 8' x 8'6\" (L x W x H)",
    capacity: '~1,170 cubic feet',
    good_for: 'Smaller equipment, limited inventory, basic workshop',
  },
  '40ft': {
    name: '40ft Standard',
    dimensions: "40' x 8' x 8'6\" (L x W x H)",
    capacity: '~2,390 cubic feet',
    good_for: 'Multiple vehicles, significant storage, full workshop',
  },
  '40ft_hc': {
    name: '40ft High Cube',
    dimensions: "40' x 8' x 9'6\" (L x W x H)",
    capacity: '~2,700 cubic feet',
    good_for: 'Tall equipment, stacked storage, standing workspace',
  },
};

export default function SizeCalculator() {
  const [step, setStep] = useState<Step>('use');
  const [state, setState] = useState<CalculatorState>({
    useCase: null,
    useCaseOther: '',
    quantity: null,
    needsHeight: false,
  });

  const handleUseCaseSelect = (useCase: UseCase) => {
    setState((prev) => ({ ...prev, useCase }));
    setStep('quantity');
  };

  const handleQuantitySelect = (quantity: 'small' | 'medium' | 'large') => {
    setState((prev) => ({ ...prev, quantity }));
  };

  const handleHeightToggle = () => {
    setState((prev) => ({ ...prev, needsHeight: !prev.needsHeight }));
  };

  const handleCalculate = () => {
    if (!state.quantity) return;
    const result = calculateSize(state);
    setCalculatorResult(result);
    setStep('result');
  };

  const handleReset = () => {
    setState({ useCase: null, useCaseOther: '', quantity: null, needsHeight: false });
    setStep('use');
  };

  const result = step === 'result' ? calculateSize(state) : null;

  return (
    <div className="calculator">
      {step === 'use' && (
        <div className="step">
          <h3 className="m" style={{color: 'var(--ink)', opacity: .6, marginBottom: '24px'}}>Step 01: Use Case</h3>
          <div className="options">
            {(Object.entries(USE_CASES) as [UseCase, { label: string; description: string }][]).map(
              ([key, { label, description }]) => (
                <button
                  key={key}
                  className="option-button"
                  onClick={() => handleUseCaseSelect(key)}
                >
                  <strong>{label}</strong>
                  <span>{description}</span>
                </button>
              )
            )}
          </div>
        </div>
      )}

      {step === 'quantity' && state.useCase && (
        <div className="step">
          <h3 className="m" style={{color: 'var(--ink)', opacity: .6, marginBottom: '24px'}}>Step 02: Quantity</h3>
          <div className="options">
            {QUANTITY_OPTIONS[state.useCase].map(({ value, label, description }) => (
              <button
                key={value}
                className={`option-button ${state.quantity === value ? 'selected' : ''}`}
                onClick={() => handleQuantitySelect(value as 'small' | 'medium' | 'large')}
              >
                <strong>{label}</strong>
                <span>{description}</span>
              </button>
            ))}
          </div>

          <div className="height-option">
            <label>
              <input
                type="checkbox"
                checked={state.needsHeight}
                onChange={handleHeightToggle}
              />
              <span>
                <strong>I need extra height</strong>
                <small>For tall equipment, stacking, or standing comfortably inside</small>
              </span>
            </label>
          </div>

          <div className="actions">
            <button className="back-button" onClick={() => setStep('use')}>
              ← Back
            </button>
            <button
              className="calculate-button"
              onClick={handleCalculate}
              disabled={!state.quantity}
            >
              See Recommendation →
            </button>
          </div>
        </div>
      )}

      {step === 'result' && result && (
        <div className="step result">
          <h3 className="m" style={{color: 'var(--c4-cost)', marginBottom: '24px'}}>The Verdict</h3>

          <div className="result-card">
            <div className="result-size">{SIZE_INFO[result].name}</div>
            <dl>
              <dt>Dimensions</dt>
              <dd>{SIZE_INFO[result].dimensions}</dd>
              <dt>Capacity</dt>
              <dd>{SIZE_INFO[result].capacity}</dd>
              <dt>Good for</dt>
              <dd>{SIZE_INFO[result].good_for}</dd>
            </dl>
          </div>

          <p className="result-note">
            This is a starting point based on typical needs. The seller can help you confirm during the quote process.
          </p>

          <div className="result-actions">
            <a href={`/quote/?size=${result}`} className="quote-button">
              Get a Quote for {SIZE_INFO[result].name} <svg style={{width: '16px', height: '16px', marginLeft: '8px'}} viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2.6" fill="none"/></svg>
            </a>
            <button className="reset-button" onClick={handleReset}>
              Start Over
            </button>
          </div>
        </div>
      )}

      <style>{`
        .calculator { font-family: var(--display); }
        .m { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }

        .options { display: flex; flex-direction: column; gap: 12px; }

        .option-button {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 20px;
          background: var(--cream);
          border: 2.5px solid var(--ink);
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
        }

        .option-button:hover { background: white; transform: translate(-2px, -2px); box-shadow: 4px 4px 0 var(--ink); }
        .option-button.selected { background: var(--yellow); }

        .option-button strong { font-family: var(--narrow); font-size: 18px; text-transform: uppercase; margin-bottom: 4px; color: var(--ink); }
        .option-button span { color: var(--ink); opacity: .7; font-size: 14px; }

        .height-option { margin-top: 24px; padding: 20px; background: white; border: 2px solid var(--ink); }
        .height-option label { display: flex; align-items: flex-start; gap: 12px; cursor: pointer; }
        .height-option input { margin-top: 4px; width: 18px; height: 18px; }
        .height-option span { display: flex; flex-direction: column; }
        .height-option strong { font-family: var(--narrow); text-transform: uppercase; font-size: 16px; }
        .height-option small { color: var(--ink); opacity: .6; font-size: 13px; margin-top: 2px; }

        .actions { display: flex; justify-content: space-between; margin-top: 24px; gap: 16px; }

        .back-button, .reset-button {
          padding: 14px 24px;
          background: white;
          border: 2px solid var(--ink);
          font-family: var(--mono);
          font-size: 12px;
          text-transform: uppercase;
          cursor: pointer;
        }

        .calculate-button {
          padding: 14px 24px;
          background: var(--ink);
          color: var(--yellow);
          border: 2px solid var(--ink);
          font-family: var(--narrow);
          font-weight: 700;
          font-size: 16px;
          text-transform: uppercase;
          cursor: pointer;
        }
        .calculate-button:disabled { opacity: .3; cursor: not-allowed; }

        .result-card {
          background: white;
          border: 3px solid var(--ink);
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 8px 8px 0 var(--c4-cost);
        }

        .result-size {
          font-family: var(--narrow);
          font-size: 32px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--ink);
          margin-bottom: 20px;
          border-bottom: 2px solid var(--ink);
          padding-bottom: 12px;
        }

        .result-card dl { display: grid; grid-template-columns: 100px 1fr; gap: 12px; }
        .result-card dt { font-family: var(--mono); font-size: 11px; text-transform: uppercase; opacity: .5; }
        .result-card dd { margin: 0; font-weight: 600; font-size: 15px; }

        .result-note { font-size: 14px; opacity: .7; margin-bottom: 24px; font-style: italic; }

        .result-actions { display: flex; flex-direction: column; gap: 12px; }

        .quote-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: var(--ink);
          color: var(--yellow);
          text-align: center;
          text-decoration: none;
          font-family: var(--narrow);
          font-weight: 700;
          font-size: 18px;
          text-transform: uppercase;
          transition: all 0.15s;
        }
        .quote-button:hover { background: var(--c4-cost); color: white; }
      `}</style>
    </div>
  );
}
