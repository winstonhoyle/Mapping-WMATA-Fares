import { LINES, type Line } from "@/utils/lines";
import { useQueryParam } from "./useQueryParam";

export const useLineUrl = () => {
  const [name, setName] = useQueryParam("line");
  const line = LINES.find((l) => l.name === name?.toLowerCase()) ?? null;
  return [line, (next: Line | null) => setName(next?.name ?? null)] as const;
};
