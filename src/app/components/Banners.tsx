import { toast } from "sonner";
import { useElements, Banner } from "../ElementsContext";

type Props = { placement: Banner["placement"]; className?: string };

export function Banners({ placement, className }: Props) {
  const { banners } = useElements();
  const items = banners.filter((b) => b.enabled && b.placement === placement);
  if (items.length === 0) return null;
  return (
    <div className={`grid gap-4 ${items.length > 1 ? "md:grid-cols-2" : ""} ${className || ""}`}>
      {items.map((b) => (
        <div key={b.id} className="relative rounded-2xl overflow-hidden aspect-[16/6] sm:aspect-[16/5]">
          <img src={b.image} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${b.bgFrom}cc, ${b.bgTo}cc)` }} />
          <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-end" style={{ color: b.textColor }}>
            <p className="tracking-tight" style={{ fontSize: "clamp(1.1rem, 2.4vw, 1.65rem)" }}>{b.title}</p>
            <p className="text-sm sm:text-base opacity-90 mt-1 max-w-xl">{b.subtitle}</p>
            <button onClick={() => toast(b.cta)}
              className="mt-3 self-start px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30">
              {b.cta}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
