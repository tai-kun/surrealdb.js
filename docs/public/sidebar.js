const m = window.location.pathname.match(/\/[^/]+\/[^/]+\/(v\d+)/);
const v = m && String(m[1]);

window.addEventListener("load", () => {
  if (!v) {
    return;
  }

  const els = document.getElementsByTagName("details");

  for (let i = 0; i < els.length; i++) {
    const details = els.item(i);

    if (!details || !details.open) {
      continue;
    }

    const summary = details.getElementsByTagName("summary").item(0);

    if (!summary) {
      continue;
    }

    const t = summary.innerText.trim();

    if (/^v\d+/.test(t) && t !== v) {
      details.open = false;
    }
  }
});
