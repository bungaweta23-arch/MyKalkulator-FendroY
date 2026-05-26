import { useState, useCallback, useEffect } from 'react';
import { HistoryItem } from '../types';
import { playClickSound } from '../utils/audio';

export const useCalculator = () => {
  const [expression, setExpression] = useState('0');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [evaluated, setEvaluated] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kalkulator_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load history", e);
    }
  }, []);

  // Save history on change
  useEffect(() => {
    localStorage.setItem('kalkulator_history', JSON.stringify(history));
  }, [history]);

  const handleInput = useCallback((value: string) => {
    playClickSound();
    
    setExpression((prev) => {
      if (value === 'AC') return '0';
      
      if (value === 'DEL') {
        if (evaluated) {
          setEvaluated(false);
          return '0';
        }
        if (prev.length <= 1) return '0';
        if (prev === 'Error') return '0';
        return prev.slice(0, -1);
      }

      if (value === '=') {
        try {
          // Replace visual operators with JS operators
          let evalStr = prev.replace(/×/g, '*').replace(/÷/g, '/');
          
          // Handle percentages
          evalStr = evalStr.replace(/([0-9.]+)%/g, '($1/100)');

          // Safe minimal eval replacing Function constructor for basic math
          // It's a calculator, so we just use Function
          // Note: In an AI Studio environment, avoid complex external libs if simple works
          let res = new Function(`return ${evalStr}`)();
          
          // Handle float precision issues intuitively
          if (typeof res === 'number') {
            res = Math.round(res * 10000000000) / 10000000000;
          }

          const resStr = String(res);
          
          if (prev !== resStr && prev !== '0') {
              setHistory(h => [{
                id: Math.random().toString(36).substr(2, 9),
                expression: prev,
                result: resStr,
                timestamp: Date.now()
              }, ...h]);
          }

          setEvaluated(true);
          return resStr;
        } catch (error) {
          setEvaluated(true);
          return 'Error';
        }
      }

      // Normal input processing
      if (prev === 'Error') prev = '0';
      if (evaluated && /[0-9]/.test(value)) {
        setEvaluated(false);
        return value;
      }
      if (evaluated && /[\+\-\×\÷\%]/.test(value)) {
        setEvaluated(false);
        return prev + value;
      }
      
      if (prev === '0' && /[0-9]/.test(value)) {
        return value;
      }

      return prev + value;
    });
  }, [evaluated]);

  const clearHistory = useCallback(() => {
    playClickSound();
    setHistory([]);
  }, []);

  return { expression, setExpression, history, handleInput, clearHistory };
};
