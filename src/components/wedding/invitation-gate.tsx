"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Sprout } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { wedding } from "@/lib/wedding-data";
import { INVITATION_REPLAY_EVENT } from "@/lib/invitation-events";

export function InvitationGate() {
  const [isVisible, setIsVisible] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const timerRef = useRef<number | null>(null);
  const guestName = wedding.demoGuestName;
  const guestGreeting = `Dear ${guestName},`;
  const envelopeDelay = `${520 + Array.from(guestGreeting).length * 45}ms`;

  const skipOpening = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
    setIsOpening(false);
  }, []);

  const openInvitation = useCallback(() => {
    if (prefersReducedMotion) {
      skipOpening();
      return;
    }

    setIsOpening(true);
    timerRef.current = window.setTimeout(skipOpening, 850);
  }, [prefersReducedMotion, skipOpening]);

  useEffect(() => {
    const replay = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      setIsOpening(false);
      setIsVisible(true);
    };

    window.addEventListener(INVITATION_REPLAY_EVENT, replay);
    return () => {
      window.removeEventListener(INVITATION_REPLAY_EVENT, replay);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="invitation-gate"
          role="dialog"
          aria-modal="true"
          aria-label="Open the wedding invitation"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.45 }}
        >
          <Sprout className="gate-sprig gate-sprig-one" size={170} strokeWidth={0.6} aria-hidden="true" />
          <Sprout className="gate-sprig gate-sprig-two" size={190} strokeWidth={0.6} aria-hidden="true" />

          <div className="gate-content">
            <p className="gate-guest-name" aria-hidden="true">
              {Array.from(guestGreeting).map((character, index) => (
                <span
                  className="gate-guest-character"
                  key={`${character}-${index}`}
                  style={{ animationDelay: `${200 + index * 45}ms` }}
                >
                  {character === " " ? "\u00a0" : character}
                </span>
              ))}
            </p>
            <span className="sr-only">{guestGreeting}</span>
            <p className="gate-kicker">A celebration of love</p>
            <motion.div
              className="envelope"
              style={{ animationDelay: envelopeDelay }}
              aria-hidden="true"
            >
              <div className="envelope-inner">{wedding.couple.initials}</div>
              <motion.div
                className="envelope-flap"
                animate={{ rotateX: isOpening ? -180 : 0 }}
                transition={{ duration: 0.55, ease: "easeInOut" }}
              />
              <motion.div
                className="envelope-seal"
                animate={{ opacity: isOpening ? 0 : 1, scale: isOpening ? 0.8 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {wedding.couple.groom[0]}
              </motion.div>
            </motion.div>
            <h1 className="gate-title">
              {wedding.couple.groom} &amp; {wedding.couple.bride}
            </h1>
            <p className="gate-subtitle">Together with our families, we invite you to celebrate.</p>
            <div className="gate-actions">
              <button className="gate-open-button" onClick={openInvitation} type="button">
                Open invitation <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
