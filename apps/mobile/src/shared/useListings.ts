import { useEffect, useState } from "react";
import { listingsApi, type Listing } from "@marketly/core";

export function useListings(category?: string) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listingsApi.listListings({ status: "approved", category }).then((res) => {
      if (!alive) return;
      if (res.ok) setListings(res.data);
      setLoading(false);
    });
    return listingsApi.subscribeListings(() => {
      listingsApi.listListings({ status: "approved", category }).then((res) => {
        if (res.ok) setListings(res.data);
      });
    });
  }, [category]);

  return { listings, loading };
}
