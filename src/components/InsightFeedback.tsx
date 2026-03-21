import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface InsightFeedbackProps {
  calculator: string;
  insight?: string;
  className?: string;
  isDashboard?: boolean;
}

type FeedbackStatus = null | 'up' | 'down' | 'submitted';

export default function InsightFeedback({ calculator, insight, className, isDashboard = false }: InsightFeedbackProps) {
  const [status, setStatus] = useState<FeedbackStatus>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [comment, setComment] = useState('');

  // Reset status when insight changes
  useEffect(() => {
    setStatus(null);
    setShowSheet(false);
    setComment('');
  }, [insight]);

  const submitFeedback = async (rating: 'up' | 'down', userComment: string = '') => {
    // Save to localStorage as backup
    const existing = JSON.parse(localStorage.getItem('whatiff_feedback') || '[]');
    existing.push({
      calculator,
      rating,
      comment: userComment,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('whatiff_feedback', JSON.stringify(existing));

    // Submit to Google Forms silently
    const formData = new FormData();
    formData.append('entry.1591633300', calculator);
    formData.append('entry.326955045', rating);
    formData.append('entry.1696159737', userComment || '');

    try {
      await fetch(
        'https://docs.google.com/forms/d/e/1FAIpQLSd0MU6lWLseeuUwlGqCvHflH9Q58zPAuHcQqlemEBCoHj1btg/formResponse',
        {
          method: 'POST',
          mode: 'no-cors',
          body: formData
        }
      );
    } catch (e) {
      // Fail silently — never show error to user
    }
  };

  const handleUp = () => {
    submitFeedback('up', '');
    setStatus('up');
  };

  const handleDown = () => {
    setStatus('down');
    setShowSheet(true);
  };

  const handleSkip = () => {
    submitFeedback('down', '');
    setShowSheet(false);
    setStatus('submitted');
  };

  const handleSend = () => {
    submitFeedback('down', comment);
    setShowSheet(false);
    setStatus('submitted');
  };

  if (status === 'up' || status === 'submitted') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn("text-[12px] font-semibold text-[#10b981]", className)}
      >
        ✦ Thanks for the feedback
      </motion.div>
    );
  }

  return (
    <>
      <div className={cn("flex items-center gap-4", className)}>
        <span className="text-[12px] font-medium text-[#52525b]">
          {isDashboard ? "How are we doing?" : "Was this useful?"}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUp}
            style={{
              background: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: '99px',
              padding: isDashboard ? '4px 10px' : '6px 14px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
            className="hover:bg-emerald-500/10 transition-colors"
          >
            👍
          </button>
          <button
            onClick={handleDown}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '99px',
              padding: isDashboard ? '4px 10px' : '6px 14px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
            className="hover:bg-white/10 transition-colors"
          >
            👎
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSheet && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleSkip}
              className="fixed inset-0 bg-black/60 z-[199]"
            />
            
            {/* Bottom Sheet */}
            <motion.div
              initial={{ translateY: '100%' }}
              animate={{ translateY: 0 }}
              exit={{ translateY: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                background: '#131313',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px 20px 0 0',
                padding: '24px 20px',
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 200,
                maxWidth: '480px',
                margin: '0 auto'
              }}
            >
              <div 
                style={{
                  width: '32px',
                  height: '4px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '99px',
                  margin: '0 auto 20px auto'
                }}
              />
              
              <h3 className="text-white font-bold text-base mb-4">What could be better?</h3>
              
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what was wrong or confusing..."
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  color: 'white',
                  fontSize: '13px',
                  width: '100%',
                  minHeight: '80px',
                  resize: 'none',
                  fontFamily: 'DM Sans'
                }}
                className="placeholder:text-[#52525b] focus:outline-none focus:border-emerald-500/50"
                autoFocus
              />
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSkip}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#71717a',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                  className="flex-1 hover:bg-white/5 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleSend}
                  style={{
                    background: '#10b981',
                    color: 'black',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                  className="flex-1 hover:bg-emerald-400 transition-colors"
                >
                  Send
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
