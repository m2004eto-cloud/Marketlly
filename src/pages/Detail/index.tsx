import { useNavigate } from "react-router";
import { Detail } from "../../app/components/Detail";

export function DetailPage({ id }: { id: number }) {
  const navigate = useNavigate();
  if (!id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-slate-600">Listing not found.</p>
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={() => navigate("/browse")}>
          Back to browse
        </button>
      </div>
    );
  }
  return (
    <Detail
      id={id}
      onBack={() => navigate("/browse")}
      onOpen={(next) => navigate(`/listing/${next}`)}
    />
  );
}
