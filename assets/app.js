function formatMoney(value, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

// Indices simplifiés (MVP). Tu remplaceras plus tard par de vraies données.
const cityIndex = {
  US: {
    "New York": 1.55,
    "Los Angeles": 1.35,
    "Miami": 1.20,
    "Austin": 1.10,
    "Houston": 1.00
  },
  MX: {
    "Mexico City": 0.70,
    "Guadalajara": 0.60,
    "Monterrey": 0.65,
    "Cancún": 0.75,
    "Mérida": 0.55
  }
};

// Taux de change manuel (tu peux l’ajuster). MVP volontairement simple.
function convert(amount, from, to, usdMxnRate) {
  if (from === to) return amount;
  if (from === "USD" && to === "MXN") return amount * usdMxnRate;
  if (from === "MXN" && to === "USD") return amount / usdMxnRate;
  return amount;
}

function fillCities(countrySelectId, citySelectId) {
  const countryEl = document.getElementById(countrySelectId);
  const cityEl = document.getElementById(citySelectId);
  if (!countryEl || !cityEl) return;

  const country = countryEl.value;
  const cities = Object.keys(cityIndex[country] || {});
  cityEl.innerHTML = "";
  for (const c of cities) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    cityEl.appendChild(opt);
  }
}

function calc() {
  const baseBudget = Number(document.getElementById("baseBudget").value || 0);

  const baseCurrency = document.getElementById("baseCurrency").value;
  const targetCurrency = document.getElementById("targetCurrency").value;

  const usdMxnRate = Number(document.getElementById("usdMxnRate").value || 17);

  const baseCountry = document.getElementById("baseCountry").value;
  const baseCity = document.getElementById("baseCity").value;

  const targetCountry = document.getElementById("targetCountry").value;
  const targetCity = document.getElementById("targetCity").value;

  const baseIdx = cityIndex[baseCountry]?.[baseCity];
  const targetIdx = cityIndex[targetCountry]?.[targetCity];

  const out = document.getElementById("output");
  const details = document.getElementById("details");

  if (!baseBudget || !baseIdx || !targetIdx) {
    out.textContent = "";
    details.textContent = "";
    return;
  }

  // Budget équivalent dans la même devise que le budget de base
  const estBaseCurrency = baseBudget * (targetIdx / baseIdx);

  // Conversion vers devise cible
  const estTargetCurrency = convert(estBaseCurrency, baseCurrency, targetCurrency, usdMxnRate);

  out.textContent = formatMoney(estTargetCurrency, targetCurrency);

  const ratio = (targetIdx / baseIdx);
  const pct = ((ratio - 1) * 100);
  const direction = pct >= 0 ? "higher" : "lower";
  const pctAbs = Math.abs(pct).toFixed(1);

  details.textContent =
    `Index ratio: ${ratio.toFixed(2)} (${pctAbs}% ${direction} vs your base city). FX used: 1 USD = ${usdMxnRate} MXN.`;
}

function wireCalculator() {
  const ids = [
    "baseBudget",
    "baseCurrency",
    "targetCurrency",
    "usdMxnRate",
    "baseCountry","baseCity",
    "targetCountry","targetCity"
  ];

  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;

    el.addEventListener("input", calc);
    el.addEventListener("change", () => {
      if (id === "baseCountry") fillCities("baseCountry", "baseCity");
      if (id === "targetCountry") fillCities("targetCountry", "targetCity");
      calc();
    });
  }

  fillCities("baseCountry", "baseCity");
  fillCities("targetCountry", "targetCity");
  calc();
}

document.addEventListener("DOMContentLoaded", wireCalculator);