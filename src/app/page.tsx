import { WeddingPageContent } from "@/components/wedding/wedding-page-content";
import { InvitationGate } from "@/components/wedding/invitation-gate";

export default function Home() {
  return (
    <>
      <InvitationGate />
      <WeddingPageContent />
    </>
  );
}
