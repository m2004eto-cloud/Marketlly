import { useEffect, useState } from "react";
import { cmsApi } from "@marketly/core";

export function useCmsValue(id: string, fallback: string) {
  const [value, setValue] = useState(() => cmsApi.getCmsValue(id, fallback));
  useEffect(() => {
    setValue(cmsApi.getCmsValue(id, fallback));
    return cmsApi.subscribeCms(() => setValue(cmsApi.getCmsValue(id, fallback)));
  }, [id, fallback]);
  return value;
}
