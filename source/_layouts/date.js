const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric"
});

function formatDate(dateStr) {
  return dateFormatter.format(new Date(dateStr));
}

module.exports = {
  formatDate
};
