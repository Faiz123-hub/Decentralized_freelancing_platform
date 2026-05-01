export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value || 0);

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "N/A";

