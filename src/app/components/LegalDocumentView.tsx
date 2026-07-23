import { SitePage } from "./SitePage";
import { getLegalDocument, type LegalDocument } from "../legal/uaePolicies";

type Props = {
  docId: LegalDocument["id"];
  onBack: () => void;
};

export function LegalDocumentView({ docId, onBack }: Props) {
  const doc = getLegalDocument(docId);
  return (
    <SitePage title={doc.title} subtitle={doc.subtitle} onBack={onBack}>
      <div className="space-y-5">
        <p className="text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl px-3 py-2">
          Policy text aligned with UAE Consumer Protection, Digital Commerce, PDPL, and VAT frameworks.
          For production use, have licensed UAE counsel review and localise Arabic versions as required.
        </p>
        {doc.sections.map((s) => (
          <section
            key={s.heading}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-2"
          >
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">{s.heading}</h2>
            {s.body.map((p, i) => (
              <p key={`${s.heading}-${i}`} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </SitePage>
  );
}
