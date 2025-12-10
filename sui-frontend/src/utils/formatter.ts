export const formatDate = (ms: number | string) => {
  return new Date(Number(ms)).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
