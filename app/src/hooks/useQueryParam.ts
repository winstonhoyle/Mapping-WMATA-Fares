import { useEffect, useState } from "react";

const read = (name: string) => new URLSearchParams(window.location.search).get(name);

/** A view setting in the query (/A01?line=orange&to=C05), so the view can be shared. */
export const useQueryParam = (name: string) => {
  const [value, setValue] = useState(() => read(name));

  useEffect(() => {
    const onPopState = () => setValue(read(name));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [name]);

  // Replace, not push: a view setting shouldn't fill the back button.
  const set = (next: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (next) params.set(name, next);
    else params.delete(name);
    const query = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : ""));
    setValue(next);
  };

  return [value, set] as const;
};
