import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCcw, ArrowRight, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const QUESTIONS = [
  {
    question: "What is the most abundant element in the universe?",
    options: ["Oxygen", "Hydrogen", "Carbon", "Helium"],
    answer: 1,
  },
  {
    question: "Which of the 'Panchtatva' represents the universal solvent?",
    options: ["Earth", "Air", "Water", "Space"],
    answer: 2,
  },
  {
    question: "What is the atomic number of Carbon?",
    options: ["1", "6", "12", "8"],
    answer: 1,
  },
  {
    question: "Which gas is used in fire extinguishers?",
    options: ["Oxygen", "CO2", "Nitrogen", "Hydrogen"],
    answer: 1,
  },
  {
    question: "Green chemistry seeks to reduce what?",
    options: ["Efficiency", "Chemical yields", "Hazardous substance use", "Renewable sources"],
    answer: 2,
  }
];

export default function Quiz() {
  const { profile } = useAuth();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const handleNext = () => {
    if (selected === QUESTIONS[currentIdx].answer) {
      setScore(s => s + 1);
    }
    
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
    } else {
      setShowResult(true);
    }
  };

  const reset = () => {
    setCurrentIdx(0);
    setScore(0);
    setShowResult(false);
    setSelected(null);
  };

  return (
    <div className="pt-24 pb-20 bg-brand-dark min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full px-4">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-10 rounded-[3rem] bg-white text-brand-dark relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2 text-brand-primary">
                  <Brain className="w-6 h-6" />
                  <span className="font-bold tracking-widest uppercase text-xs">Knowledge Quest</span>
                </div>
                <div className="bg-brand-soft px-4 py-1 rounded-full text-brand-primary font-bold text-sm">
                  {currentIdx + 1} / {QUESTIONS.length}
                </div>
              </div>

              <h2 className="text-2xl font-serif mb-8">{QUESTIONS[currentIdx].question}</h2>

              <div className="space-y-4 mb-10">
                {QUESTIONS[currentIdx].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className={`w-full p-6 text-left rounded-2xl border-2 transition-all font-medium ${
                      selected === i 
                      ? 'bg-brand-primary border-brand-primary text-white scale-[1.02]' 
                      : 'bg-white border-brand-soft hover:bg-brand-soft text-brand-dark'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  disabled={selected === null}
                  onClick={handleNext}
                  className="btn-primary flex items-center gap-2 text-lg"
                >
                  {currentIdx + 1 === QUESTIONS.length ? 'Finish' : 'Next Question'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-12 rounded-[3rem] bg-white text-center"
            >
              <div className="bg-amber-100 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-bounce">
                <Trophy className="text-amber-500 w-12 h-12" />
              </div>
              <h2 className="text-4xl font-serif text-brand-dark mb-4">Quiz Completed!</h2>
              <p className="text-text-muted mb-8 text-lg">Great job, <span className="text-brand-primary font-bold">{profile?.name}</span>!</p>
              
              <div className="bg-brand-soft p-8 rounded-3xl mb-10">
                <p className="text-5xl font-black text-brand-primary mb-2">{score} / {QUESTIONS.length}</p>
                <p className="text-brand-dark font-medium">Your Chemistry Score</p>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={reset}
                  className="btn-primary py-4 text-lg flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="w-5 h-5" />
                  Try Again
                </button>
                <Link to="/dashboard" className="btn-secondary py-4 text-lg">
                  Back to Dashboard
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
