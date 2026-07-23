import { useNavigate, useParams } from "react-router";
import { LegalDocumentView } from "../../app/components/LegalDocumentView";
import type { LegalDocument } from "../../app/legal/uaePolicies";

const VALID: LegalDocument["id"][] = ["terms", "privacy", "seller-policies"];

export function LegalPage() {
  const navigate = useNavigate();
  const { docId } = useParams();
  const id = VALID.includes(docId as LegalDocument["id"])
    ? (docId as LegalDocument["id"])
    : "terms";
  return <LegalDocumentView docId={id} onBack={() => navigate(-1)} />;
}
