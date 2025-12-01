export function timeAgo(date: string | null) {
  if (!date) return "–";

  const diff = (Date.now() - new Date(date).getTime()) / 1000; // segundos

  if (diff < 5) return "Hace 1s";
  if (diff < 20) return `Hace ${Math.floor(diff)}s`;
  if (diff < 60) return `Hace ${Math.floor(diff)}s`;
  if (diff < 120) return "Hace 1min";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)}min`;

  return "Hace mucho";
}
