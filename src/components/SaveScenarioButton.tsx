import React, { useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage, CalculatorType } from '../lib/storage';

interface SaveScenarioButtonProps {
  type: CalculatorType;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  defaultName?: string;
  onBeforeSave?: (outputs: Record<string, any>) => void;
}

export default function SaveScenarioButton({ type, inputs, outputs, defaultName, onBeforeSave }: SaveScenarioButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [name, setName] = useState(defaultName || '');

  // Update name if defaultName changes
  React.useEffect(() => {
    if (defaultName) setName(defaultName);
  }, [defaultName]);

  const handleSave = () => {
    if (!name.trim()) return;
    
    if (onBeforeSave) onBeforeSave(outputs);

    storage.saveScenario({
      type,
      name,
      inputs,
      outputs
    });

    setShowSuccess(true);
    setIsSaving(false);
    setName('');

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {isSaving ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full right-0 mb-4 glass-card p-4 w-64 space-y-3 shadow-2xl z-50"
          >
            <p className="text-xs font-bold text-zinc-400 uppercase">Save Scenario</p>
            <input 
              autoFocus
              type="text" 
              placeholder="Scenario Name (e.g. Dream House)" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
            />
            <div className="flex gap-2">
              <button 
                onClick={handleSave}
                disabled={!name.trim()}
                className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-lg transition-colors"
              >
                Confirm
              </button>
              <button 
                onClick={() => setIsSaving(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-zinc-400 text-xs font-bold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : showSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-emerald-500 text-sm font-bold"
          >
            <CheckCircle2 className="w-4 h-4" />
            Saved!
          </motion.div>
        ) : (
          <button 
            onClick={() => setIsSaving(true)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
          >
            <Save className="w-4 h-4" />
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}
