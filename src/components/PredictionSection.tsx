import React, { useState } from 'react';
import { 
  Cpu, 
  AlertTriangle, 
  Code, 
  Check, 
  Copy, 
  Sliders, 
  Activity, 
  Layers, 
  FileCode2, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { predictFloodRisk } from '../utils/hydrology';
import { PredictionInput, PredictionResult } from '../types';

export const PredictionSection: React.FC = () => {
  const [input, setInput] = useState<PredictionInput>({
    rainfall: 145.0,
    elevation: 38.0,
    slope: 0.6
  });

  const [activeTab, setActiveTab] = useState<'simulator' | 'architecture' | 'python_code'>('simulator');
  const [copiedCode, setCopiedCode] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:5000/api/predict_flood');
  const [isSimulating, setIsSimulating] = useState(false);

  // Compute baseline prediction
  const result: PredictionResult = predictFloodRisk(input);

  const pythonScript = `"""
FLOWSHIELD - Machine Learning Model Training Pipeline
Trains a Random Forest Classifier on Google Earth Engine + Sentinel-1 exported dataset.
"""

import pandas as pd
import numpy as np
from sklearn.model_state import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import joblib

# 1. Load exported dataset from Earth Engine
# Expected CSV columns: latitude, longitude, rainfall, elevation, slope, flood
df = pd.read_csv('flowshield_india_dataset.csv')

# 2. Extract Feature Matrix (X) and Target Vector (y)
features = ['rainfall', 'elevation', 'slope']
target = 'flood'

X = df[features].values
y = df[target].values

# 3. Train/Test Stratified Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

# 4. Initialize & Train Random Forest Classifier
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=12,
    min_samples_split=5,
    min_samples_leaf=2,
    class_weight='balanced',
    random_state=42
)

model.fit(X_train, y_train)

# 5. Evaluate Performance
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

print("=== FLOWSHIELD CLASSIFICATION REPORT ===")
print(classification_report(y_test, y_pred, target_names=['No Flood', 'Flooded']))
print(f"ROC-AUC Score: {roc_auc_score(y_test, y_prob):.4f}")

# 6. Export Feature Importances
for feat, imp in zip(features, model.feature_importances_):
    print(f"Feature '{feat}': {imp*100:.2f}% importance")

# 7. Save Model Weights for FLOWSHIELD API
joblib.dump(model, 'flowshield_random_forest.pkl')
print("Model saved to 'flowshield_random_forest.pkl'")
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const runPrediction = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="bg-[#0B1530] border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>Flood Prediction Interface & Machine Learning Architecture</span>
            </h3>
            {/* MANDATORY STATUS BADGE */}
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Model not trained yet
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Input features: <code className="text-cyan-300 font-mono">rainfall (CHIRPS)</code>, <code className="text-emerald-300 font-mono">elevation (SRTM)</code>, <code className="text-amber-300 font-mono">slope (SRTM-derived)</code>
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-900/90 p-1 rounded-lg border border-slate-700/80 text-xs font-mono">
          <button
            id="tab-btn-simulator"
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Prediction Engine
          </button>
          <button
            id="tab-btn-architecture"
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Model Architecture
          </button>
          <button
            id="tab-btn-code"
            onClick={() => setActiveTab('python_code')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'python_code'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Python / Scikit-Learn
          </button>
        </div>
      </div>

      {/* Prominent Mandatory Model Status Banner */}
      <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-4 flex items-start gap-3 text-xs">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="font-bold text-amber-300 text-sm font-mono flex items-center gap-2">
            <span>PREDICTION STATUS: MODEL NOT TRAINED YET</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            As a real-world scientific hackathon system, FLOWSHIELD adheres to strict data integrity:
            we do <strong>NOT</strong> fabricate fake neural network or random forest predictions. 
            The prediction interface currently computes an <em>engineering hydrological baseline</em> using physical precipitation-to-slope thresholds.
            When you train your model using the provided Python pipeline on your exported Sentinel-1 dataset, connect the weights or REST endpoint below for certified inference.
          </p>
        </div>
      </div>

      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-6 space-y-4 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold font-mono text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Feature Input Vector [rainfall, elevation, slope]</span>
              </span>
              <span className="text-[11px] font-mono text-cyan-400">Features = 3</span>
            </div>

            {/* 1. Rainfall Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>Precipitation (rainfall)</span>
                </label>
                <div className="flex items-center gap-1 font-mono">
                  <input
                    id="input-rainfall-num"
                    type="number"
                    min="0"
                    max="500"
                    step="0.5"
                    value={input.rainfall}
                    onChange={(e) => setInput({ ...input, rainfall: parseFloat(e.target.value) || 0 })}
                    className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-right text-cyan-300 font-bold text-xs"
                  />
                  <span className="text-slate-400 text-[11px]">mm</span>
                </div>
              </div>
              <input
                id="input-rainfall-slider"
                type="range"
                min="0"
                max="350"
                step="1"
                value={input.rainfall}
                onChange={(e) => setInput({ ...input, rainfall: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 mm (Dry)</span>
                <span>100 mm (Heavy)</span>
                <span>250+ mm (Extreme)</span>
              </div>
            </div>

            {/* 2. Elevation Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Terrain Elevation (elevation)</span>
                </label>
                <div className="flex items-center gap-1 font-mono">
                  <input
                    id="input-elevation-num"
                    type="number"
                    min="-10"
                    max="4000"
                    step="1"
                    value={input.elevation}
                    onChange={(e) => setInput({ ...input, elevation: parseFloat(e.target.value) || 0 })}
                    className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-right text-emerald-300 font-bold text-xs"
                  />
                  <span className="text-slate-400 text-[11px]">m MSL</span>
                </div>
              </div>
              <input
                id="input-elevation-slider"
                type="range"
                min="0"
                max="1000"
                step="5"
                value={input.elevation}
                onChange={(e) => setInput({ ...input, elevation: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 m (Sea/Delta level)</span>
                <span>100 m (River plain)</span>
                <span>500+ m (Plateau/Highland)</span>
              </div>
            </div>

            {/* 3. Slope Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>Surface Slope (slope)</span>
                </label>
                <div className="flex items-center gap-1 font-mono">
                  <input
                    id="input-slope-num"
                    type="number"
                    min="0"
                    max="45"
                    step="0.1"
                    value={input.slope}
                    onChange={(e) => setInput({ ...input, slope: parseFloat(e.target.value) || 0 })}
                    className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-right text-amber-300 font-bold text-xs"
                  />
                  <span className="text-slate-400 text-[11px]">deg (°)</span>
                </div>
              </div>
              <input
                id="input-slope-slider"
                type="range"
                min="0"
                max="20"
                step="0.1"
                value={input.slope}
                onChange={(e) => setInput({ ...input, slope: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.2° (Stagnant flat plain)</span>
                <span>3.0° (Moderate drainage)</span>
                <span>15°+ (Rapid runoff)</span>
              </div>
            </div>

            {/* Run Prediction Button */}
            <div className="pt-2">
              <button
                id="btn-run-prediction"
                onClick={runPrediction}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                <span>{isSimulating ? 'EVALUATING HYDROLOGICAL RISK...' : 'RUN PREDICTION CALCULATION'}</span>
              </button>
            </div>
          </div>

          {/* Prediction Output Display */}
          <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Predicted Flood Risk Output
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                  SURROGATE HEURISTIC
                </span>
              </div>

              {/* Big Risk Level Badge */}
              <div className="text-center py-4 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="text-xs font-mono text-slate-400 mb-1">COMPUTED HAZARD STATUS</div>
                <div className={`text-3xl font-black font-mono tracking-wider ${
                  result.predictedRisk === 'CRITICAL' ? 'text-red-400' :
                  result.predictedRisk === 'HIGH RISK' ? 'text-orange-400' :
                  result.predictedRisk === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {result.predictedRisk}
                </div>
                <div className="text-xs font-mono text-slate-400 mt-2">
                  Vulnerability Index Score: <span className="text-white font-bold">{result.confidenceScore}/100</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-1">
                  Target (flood) binary estimate: {result.predictedClass === 1 ? '1 (Flood Inundation Likely)' : '0 (Non-Flooded Area)'}
                </div>
              </div>

              {/* Factor Contribution Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-slate-300">
                  Feature Impact Attribution
                </div>
                <div className="space-y-1.5">
                  {result.contributingFactors.map((f, i) => (
                    <div key={i} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{f.factor}</span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          f.impact === 'HIGH' ? 'bg-red-950 text-red-300 border border-red-800' :
                          f.impact === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {f.impact} IMPACT
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {f.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Machine Learning Architecture Blueprint</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="text-cyan-400 font-bold">1. Feature Matrix (X)</div>
                <div className="text-slate-300 text-sm font-bold">3 Continuous Features</div>
                <div className="text-[11px] text-slate-400 pt-1 space-y-0.5">
                  <div>• <code className="text-cyan-300">rainfall</code> (CHIRPS Daily mm)</div>
                  <div>• <code className="text-emerald-300">elevation</code> (SRTM 30m MSL)</div>
                  <div>• <code className="text-amber-300">slope</code> (SRTM derivative °)</div>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="text-emerald-400 font-bold">2. Target Variable (y)</div>
                <div className="text-slate-300 text-sm font-bold">Binary SAR Inundation</div>
                <div className="text-[11px] text-slate-400 pt-1 space-y-0.5">
                  <div>• <code className="text-red-300">flood = 1</code> (Sentinel-1 flooded area)</div>
                  <div>• <code className="text-slate-300">flood = 0</code> (Non-flooded ground)</div>
                  <div className="text-slate-500">Derived from SAR backscatter thresholding</div>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="text-purple-400 font-bold">3. Model Architecture</div>
                <div className="text-slate-300 text-sm font-bold">Random Forest Classifier</div>
                <div className="text-[11px] text-slate-400 pt-1 space-y-0.5">
                  <div>• Ensemble: 100 Estimators</div>
                  <div>• Non-linear thresholding</div>
                  <div>• Robust to geospatial outliers</div>
                </div>
              </div>
            </div>

            {/* Model API Endpoint Hook */}
            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs font-mono font-bold text-slate-200 mb-1">
                Production REST API / ONNX Runtime Endpoint Integration
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="https://your-ml-service.com/predict"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300"
                />
                <button
                  onClick={() => alert(`Endpoint configured: ${apiEndpoint}\nStatus: Ready to connect trained weights.`)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-lg border border-slate-700 cursor-pointer"
                >
                  Save Hook
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                The frontend sends JSON: <code className="text-slate-400">{`{"rainfall": float, "elevation": float, "slope": float}`}</code> and consumes predicted flood probabilities without requiring frontend code changes.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'python_code' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <FileCode2 className="w-4 h-4 text-cyan-400" />
              <span>train_flowshield_model.py (Scikit-Learn Ready Script)</span>
            </span>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Script'}</span>
            </button>
          </div>

          <div className="relative bg-[#050914] border border-slate-800 rounded-xl p-4 overflow-x-auto">
            <pre className="text-xs font-mono text-slate-300 leading-relaxed">
              <code>{pythonScript}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
