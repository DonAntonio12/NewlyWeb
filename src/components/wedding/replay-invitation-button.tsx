"use client";

import { RotateCcw } from "lucide-react";
import { INVITATION_REPLAY_EVENT } from "@/lib/invitation-events";

export function ReplayInvitationButton() {
  return (
    <button
      className="replay-button"
      onClick={() => window.dispatchEvent(new Event(INVITATION_REPLAY_EVENT))}
      type="button"
    >
      <RotateCcw size={12} aria-hidden="true" /> Replay invitation
    </button>
  );
}
