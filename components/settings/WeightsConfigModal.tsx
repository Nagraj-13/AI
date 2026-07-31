"use client";

import { useState } from "react";
import { X, Sliders, Check } from "lucide-react";
import { DEFAULT_WEIGHTS, ScoreWeights } from "@/lib/ranking/scorer";

interface WeightsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  weights: ScoreWeights;
  onSaveWeights: (newWeights: ScoreWeights) => void;
}

export default function WeightsConfigModal({
  isOpen,
  onClose,
  weights,
  onSaveWeights,
}: WeightsConfigModalProps) {
  const [embW, setEmbW] = useState(weights.embeddingWeight * 100);
  const [llmW, setLlmW] = useState(weights.llmWeight * 100);
  const [expW, setExpW] = useState(weights.experienceWeight * 100);
  const [skillW, setSkillW] = useState(weights.skillWeight * 100);

  if (!isOpen) return null;

  const total = embW + llmW + expW + skillW;

  const handleSave = () => {
    onSaveWeights({
      embeddingWeight: embW / 100,
      llmWeight: llmW / 100,
      experienceWeight: expW / 100,
      skillWeight: skillW / 100,
    });
    onClose();
  };

  const handleReset = () => {
    setEmbW(DEFAULT_WEIGHTS.embeddingWeight * 100);
    setLlmW(DEFAULT_WEIGHTS.llmWeight * 100);
    setExpW(DEFAULT_WEIGHTS.experienceWeight * 100);
    setSkillW(DEFAULT_WEIGHTS.skillWeight * 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Customize Scoring Formula Weights</h2>
              <p className="text-xs text-slate-400">Adjust parameters for candidate ranking algorithm</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold uppercase text-slate-300 mb-1">
              <span>Vector Embedding Similarity ({embW}%)</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={embW}
              onChange={(e) => setEmbW(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold uppercase text-slate-300 mb-1">
              <span>LLM Qualitative Evaluation ({llmW}%)</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={llmW}
              onChange={(e) => setLlmW(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold uppercase text-slate-300 mb-1">
              <span>Experience Match ({expW}%)</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={expW}
              onChange={(e) => setExpW(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold uppercase text-slate-300 mb-1">
              <span>Skill Match ({skillW}%)</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={skillW}
              onChange={(e) => setSkillW(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="pt-2 text-xs font-mono flex justify-between text-slate-400">
            <span>Total Weight Sum: {total}%</span>
            <button onClick={handleReset} className="text-indigo-400 hover:underline">
              Reset to Default (40/40/10/10)
            </button>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
            <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 hover:opacity-90"
            >
              <Check className="w-4 h-4" />
              <span>Apply Custom Weights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
