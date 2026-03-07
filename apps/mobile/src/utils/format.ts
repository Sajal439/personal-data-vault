export function formatBytes(value: number) {
  if (!value) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );
  const size = value / 1024 ** exponent;

  return `${size.toFixed(size >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function formatDate(value: string | null) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function toIsoDateTime(dateInput: string) {
  const normalized = dateInput.trim();
  const date = new Date(`${normalized}T09:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

