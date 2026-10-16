"use strict";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const data = {
  shirt: {
    name: "Essential Cotton Shirt",
    price: 68,
    image:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=300&q=80",
  },
  trousers: {
    name: "Everyday Tailored Trousers",
    price: 95,
    image:
      "https://images.unsplash.com/photo-1506629905607-d9a4e4c4b6c4?auto=format&fit=crop&w=300&q=80",
  },
  tote: {
    name: "Minimal Leather Tote",
    price: 120,
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=300&q=80",
  },
  sweater: {
    name: "Classic Knit Sweater",
    price: 88,
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=300&q=80",
  },
};
const cart = new Map();
let toastTimer,
  lastFocus = null;
$("#year").textContent = new Date().getFullYear();
function announce(msg) {
  const t = $(".toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2500);
}
const nav = $(".nav"),
  menu = $(".menu-toggle"),
  navBack = $(".nav-backdrop"),
  searchPanel = $(".search-panel"),
  searchToggle = $(".search-toggle"),
  cartDrawer = $(".cart-drawer"),
  cartBack = $(".drawer-backdrop");
function closeMenu() {
  nav.classList.remove("open");
  navBack.hidden = true;
  menu.setAttribute("aria-expanded", "false");
  document.body.classList.remove("lock");
}
function closeSearch() {
  searchPanel.hidden = true;
  searchToggle.setAttribute("aria-expanded", "false");
}
function closeCart() {
  if (cartDrawer.hidden) return;
  cartDrawer.hidden = true;
  cartBack.hidden = true;
  $(".cart-toggle").setAttribute("aria-expanded", "false");
  document.body.classList.remove("lock");
  if (lastFocus) lastFocus.focus();
}
menu.addEventListener("click", () => {
  if (nav.classList.contains("open")) {
    closeMenu();
  } else {
    closeSearch();
    closeCart();
    nav.classList.add("open");
    navBack.hidden = false;
    menu.setAttribute("aria-expanded", "true");
    document.body.classList.add("lock");
    $("a", nav).focus();
  }
});
navBack.addEventListener("click", closeMenu);
$$(".nav a").forEach((a) => a.addEventListener("click", closeMenu));
searchToggle.addEventListener("click", () => {
  if (!searchPanel.hidden) {
    closeSearch();
    return;
  }
  closeMenu();
  closeCart();
  searchPanel.hidden = false;
  searchToggle.setAttribute("aria-expanded", "true");
  $("#search").focus();
});
$(".close-search").addEventListener("click", () => {
  closeSearch();
  searchToggle.focus();
});
$(".cart-toggle").addEventListener("click", () => {
  closeMenu();
  closeSearch();
  lastFocus = document.activeElement;
  cartDrawer.hidden = false;
  cartBack.hidden = false;
  $(".cart-toggle").setAttribute("aria-expanded", "true");
  document.body.classList.add("lock");
  $(".close-cart").focus();
});
$(".close-cart").addEventListener("click", closeCart);
cartBack.addEventListener("click", closeCart);
function money(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
function renderCart() {
  const items = [...cart.values()],
    qty = items.reduce((s, x) => s + x.qty, 0);
  $(".count").textContent = qty;
  $("#drawer-count").textContent = `(${qty})`;
  $("#subtotal").textContent = money(
    items.reduce((s, x) => s + x.price * x.qty, 0),
  );
  $(".checkout").disabled = !qty;
  const root = $("#cart-items");
  root.replaceChildren();
  if (!items.length) {
    const p = document.createElement("p");
    p.className = "cart-empty";
    p.textContent = "Your bag is currently empty.";
    root.append(p);
    return;
  }
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = "";
    const details = document.createElement("div"),
      h = document.createElement("h3"),
      p = document.createElement("p"),
      controls = document.createElement("div");
    h.textContent = item.name;
    p.textContent = money(item.price);
    controls.className = "qty";
    const minus = document.createElement("button");
    minus.textContent = "−";
    minus.setAttribute("aria-label", `Decrease ${item.name} quantity`);
    minus.onclick = () => change(item.id, -1);
    const n = document.createElement("span");
    n.textContent = item.qty;
    const plus = document.createElement("button");
    plus.textContent = "+";
    plus.setAttribute("aria-label", `Increase ${item.name} quantity`);
    plus.onclick = () => change(item.id, 1);
    controls.append(minus, n, plus);
    details.append(h, p, controls);
    const remove = document.createElement("button");
    remove.className = "remove";
    remove.textContent = "Remove";
    remove.onclick = () => {
      cart.delete(item.id);
      renderCart();
      announce("Item removed from bag.");
    };
    row.append(img, details, remove);
    root.append(row);
  });
}
function change(id, delta) {
  const item = cart.get(id);
  if (!item) return;
  item.qty += delta;
  if (item.qty < 1) cart.delete(id);
  renderCart();
}
$$("[data-add]").forEach((b) =>
  b.addEventListener("click", () => {
    const id = b.dataset.add,
      p = data[id];
    if (cart.has(id)) cart.get(id).qty++;
    else cart.set(id, { id, ...p, qty: 1 });
    renderCart();
    announce(`${p.name} added to your bag.`);
  }),
);
$$(".swatches").forEach((group) =>
  $$(".swatch", group).forEach((b) =>
    b.addEventListener("click", () => {
      $$(".swatch", group).forEach((s) => {
        s.classList.remove("selected");
        s.setAttribute("aria-pressed", "false");
      });
      b.classList.add("selected");
      b.setAttribute("aria-pressed", "true");
      const name = b
        .getAttribute("aria-label")
        .replace(" colour selected", "")
        .replace(" colour", "");
      const card = group.closest(".product");
      $(".variant", card).textContent = `${name} selected`;
      announce(`${card.dataset.name}: ${name} selected.`);
    }),
  ),
);
function filter(q = "") {
  let count = 0;
  $$(".product").forEach((card) => {
    const match = (card.dataset.name + " " + card.dataset.category)
      .toLowerCase()
      .includes(q.trim().toLowerCase());
    card.hidden = !match;
    if (match) count++;
  });
  $("#result-count").textContent =
    `Showing ${count} product${count === 1 ? "" : "s"}`;
  $("#empty").hidden = count !== 0;
}
$("#search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  filter($("#search").value);
  closeSearch();
  $("#new-arrivals").scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
});
$("#search").addEventListener("input", () => filter($("#search").value));
$$("[data-filter]").forEach((a) =>
  a.addEventListener("click", () => {
    const q =
      a.dataset.filter === "Everyday Essentials"
        ? "Clothing"
        : a.dataset.filter;
    $("#search").value = q;
    filter(q);
  }),
);
$("#sort").addEventListener("change", (e) => {
  const grid = $("#products"),
    cards = $$(".product", grid),
    mode = e.target.value;
  cards.sort((a, b) =>
    mode === "low"
      ? +a.dataset.price - +b.dataset.price
      : mode === "high"
        ? +b.dataset.price - +a.dataset.price
        : mode === "name"
          ? a.dataset.name.localeCompare(b.dataset.name)
          : ["shirt", "trousers", "tote", "sweater"].indexOf(a.dataset.id) -
            ["shirt", "trousers", "tote", "sweater"].indexOf(b.dataset.id),
  );
  cards.forEach((c) => grid.append(c));
});
$("#newsletter").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("#email"),
    msg = $("#email-message");
  msg.className = "message";
  if (!input.validity.valid || !input.value.trim()) {
    msg.textContent = "Enter a valid email address to continue.";
    msg.classList.add("error");
    input.setAttribute("aria-invalid", "true");
    input.focus();
    return;
  }
  input.removeAttribute("aria-invalid");
  msg.textContent =
    "Thanks — this demo is not connected to a mailing list yet.";
  msg.classList.add("success");
});
$(".checkout").addEventListener("click", () =>
  announce("Checkout is a demo feature and is not connected."),
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!cartDrawer.hidden) closeCart();
    else if (!searchPanel.hidden) {
      closeSearch();
      searchToggle.focus();
    } else if (nav.classList.contains("open")) {
      closeMenu();
      menu.focus();
    }
  }
  if (e.key === "Tab" && !cartDrawer.hidden) {
    const list = $$(
      "button:not(:disabled),a[href],input:not(:disabled)",
      cartDrawer,
    ).filter((x) => x.offsetWidth || x.offsetHeight);
    if (!list.length) return;
    if (e.shiftKey && document.activeElement === list[0]) {
      e.preventDefault();
      list[list.length - 1].focus();
    } else if (
      !e.shiftKey &&
      document.activeElement === list[list.length - 1]
    ) {
      e.preventDefault();
      list[0].focus();
    }
  }
});
renderCart();
