// --- 1. إدارة تسجيل الدخول والأدمن ---

function openAdminModal() {
  document.getElementById("adminModal").style.display = "flex";
  document.getElementById("adminPassInput").value = "";
  document.getElementById("errorMsg").innerText = "";
}

function closeAdminModal() {
  document.getElementById("adminModal").style.display = "none";
}

function submitAdminPass() {
  const input = document.getElementById("adminPassInput").value.trim();
  if (input === "28380") {
    localStorage.setItem("adminAuth", "true");
    window.location.href = "admin.html";
  } else {
    document.getElementById("errorMsg").innerText = "كلمة السر غير صحيحة!";
  }
}

function checkAdminAuth() {
  if (localStorage.getItem("adminAuth") !== "true") {
    alert("يرجى إدخال كلمة السر أولاً!");
    window.location.href = "index.html";
  }
}

function logoutAdmin() {
  localStorage.removeItem("adminAuth");
  window.location.href = "index.html";
}


// --- 2. إدارة الأقسام ---

function getCategories() {
  return JSON.parse(localStorage.getItem("categories") || '["طباعة ديجيتال", "ملابس وهدايا", "بوسترات وكروت"]');
}

function renderPortalTags() {
  const tagsContainer = document.getElementById("portalTags");
  if (!tagsContainer) return;
  const categories = getCategories();
  tagsContainer.innerHTML = "";
  categories.forEach(cat => {
    tagsContainer.innerHTML += `<span>${cat}</span>`;
  });
}

function addCategory() {
  const categoryInput = document.getElementById("newCategoryName");
  const categoryName = categoryInput.value.trim();

  if (!categoryName) {
    alert("برجاء كتابة اسم القسم أولاً!");
    return;
  }

  let categories = getCategories();

  if (categories.includes(categoryName)) {
    alert("هذا القسم موجود بالفعل!");
    return;
  }

  categories.push(categoryName);
  localStorage.setItem("categories", JSON.stringify(categories));

  categoryInput.value = "";

  renderCategories();
  loadCategoriesDropdown();

  alert("تمت إضافة القسم بنجاح وستجده الآن في قائمة اختيار الأقسام!");
}

function renderCategories() {
  const list = document.getElementById("categoriesList");
  if (!list) return;

  const categories = getCategories();
  list.innerHTML = "";

  categories.forEach((cat, index) => {
    list.innerHTML += `
      <li>
        <span>${cat}</span>
        <button onclick="deleteCategory(${index})" class="delete-btn">حذف القسم</button>
      </li>
    `;
  });
}

function deleteCategory(index) {
  if (confirm("هل أنت تأكد من حذف هذا القسم؟")) {
    const categories = getCategories();
    categories.splice(index, 1);
    localStorage.setItem("categories", JSON.stringify(categories));
    renderCategories();
    loadCategoriesDropdown();
  }
}

function loadCategoriesDropdown() {
  const select = document.getElementById("prodCategorySelect");
  if (!select) return;
  const categories = getCategories();
  select.innerHTML = '<option value="">اختر القسم...</option>';
  categories.forEach(cat => {
    select.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}


// --- 3. إدارة المنتجات (الأدمن) ---

function saveProduct(event) {
  event.preventDefault();
  const category = document.getElementById("prodCategorySelect").value;
  const name = document.getElementById("prodName").value;
  const desc = document.getElementById("prodDesc").value;
  const price = document.getElementById("prodPrice").value;
  const fileInput = document.getElementById("prodImageFile");
  const file = fileInput.files[0];

  if (!category) {
    alert("يرجى اختيار القسم أولاً!");
    return;
  }

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const products = JSON.parse(localStorage.getItem("products") || "[]");
      products.push({ id: Date.now(), category, name, desc, price: Number(price), image: e.target.result });
      localStorage.setItem("products", JSON.stringify(products));

      alert("تمت إضافة المنتج بنجاح!");
      document.getElementById("addProductForm").reset();
      renderAdminProducts();
    };
    reader.readAsDataURL(file);
  }
}

function renderAdminProducts() {
  const container = document.getElementById("adminProductsList");
  if (!container) return;
  const products = JSON.parse(localStorage.getItem("products") || "[]");

  if (products.length === 0) {
    container.innerHTML = "<p style='color: #a88b7d; font-size: 13px;'>لا توجد منتجات مضافة حالياً.</p>";
    return;
  }

  container.innerHTML = "";
  products.forEach(p => {
    container.innerHTML += `
      <div class="prod-row">
        <img src="${p.image}" alt="${p.name}">
        <div class="prod-info">
          <strong>${p.name} (${p.category})</strong>
          <input type="text" id="desc-${p.id}" value="${p.desc}" placeholder="الوصف">
          <input type="number" id="price-${p.id}" value="${p.price}" placeholder="السعر">
        </div>
        <button onclick="updateProduct(${p.id})" class="action-btn">تحديث</button>
        <button onclick="deleteProduct(${p.id})" class="delete-btn">حذف</button>
      </div>
    `;
  });
}

function updateProduct(id) {
  const products = JSON.parse(localStorage.getItem("products") || "[]");
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index].desc = document.getElementById(`desc-${id}`).value;
    products[index].price = Number(document.getElementById(`price-${id}`).value);
    localStorage.setItem("products", JSON.stringify(products));
    alert("تم تعديل المنتج بنجاح!");
    renderAdminProducts();
  }
}

function deleteProduct(id) {
  if (confirm("هل أنت تأكد من حذف هذا المنتج؟")) {
    let products = JSON.parse(localStorage.getItem("products") || "[]");
    products = products.filter(p => p.id !== id);
    localStorage.setItem("products", JSON.stringify(products));
    renderAdminProducts();
  }
}


// --- 4. المتجر والسلة وحاسبة الكميات ---

let currentActiveCategory = "";

function displayStoreTabs() {
  const tabsContainer = document.getElementById("categoriesTabs");
  if (!tabsContainer) return;

  const categories = getCategories();
  if (categories.length === 0) return;

  if (!currentActiveCategory || !categories.includes(currentActiveCategory)) {
    currentActiveCategory = categories[0];
  }

  tabsContainer.innerHTML = "";

  categories.forEach(cat => {
    const isActive = cat === currentActiveCategory ? "active" : "";
    tabsContainer.innerHTML += `
      <button class="tab-btn ${isActive}" onclick="selectCategory('${cat}')">
        ${cat}
      </button>
    `;
  });

  renderProductsForCategory(currentActiveCategory);
}

function selectCategory(categoryName) {
  currentActiveCategory = categoryName;
  displayStoreTabs();
}

function renderProductsForCategory(categoryName) {
  const displayArea = document.getElementById("productsDisplayArea");
  if (!displayArea) return;

  const products = JSON.parse(localStorage.getItem("products") || "[]");
  const filteredProducts = products.filter(p => p.category === categoryName);

  if (filteredProducts.length === 0) {
    displayArea.innerHTML = `<div class="no-products-msg">لا توجد منتجات في قسم (${categoryName}) حالياً.</div>`;
    return;
  }

  displayArea.innerHTML = "";
  filteredProducts.forEach(p => {
    displayArea.innerHTML += `
      <div class="product-card" data-name="${p.name}">
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div style="font-weight: bold; color: #d4a373; margin-bottom: 10px;">${p.price} EGP</div>
        
        <div style="display: flex; gap: 8px; justify-content: center; align-items: center; margin-bottom: 12px;">
          <label style="font-size: 12px; color: #a88b7d;">الكمية:</label>
          <input type="number" id="qty-${p.id}" value="1" min="1" style="width: 50px; text-align: center; padding: 4px; border-radius: 6px; border: 1px solid #5a3d35; background: #1a100c; color: #fff;">
        </div>

        <button class="action-btn" style="width: 100%;" onclick="addToCart(${p.id})">
          🛒 إضافة للسلة
        </button>
      </div>
    `;
  });
}

function filterProducts() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll(".product-card");

  cards.forEach(card => {
    const name = card.getAttribute("data-name").toLowerCase();
    card.style.display = name.includes(input) ? "block" : "none";
  });
}

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

function addToCart(productId) {
  const products = JSON.parse(localStorage.getItem("products") || "[]");
  const product = products.find(p => p.id === productId);
  const qtyInput = document.getElementById(`qty-${productId}`);
  const quantity = parseInt(qtyInput ? qtyInput.value : 1) || 1;

  if (!product) return;

  let cart = getCart();
  const existingItemIndex = cart.findIndex(item => item.id === productId);

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  saveCart(cart);
  alert(`تمت إضافة (${quantity}) من "${product.name}" إلى السلة!`);
}

// --- أكواد الخصم والواتساب ---

const promoCodes = {
  "MAIKA10": 0.10,
  "WELCOME20": 0.20
};

let activeDiscount = 0;

function applyPromoCode() {
  const codeInput = document.getElementById("promoCodeInput");
  if (!codeInput) return;

  const code = codeInput.value.trim().toUpperCase();

  if (promoCodes[code]) {
    activeDiscount = promoCodes[code];
    alert(`تم تطبيق خصم بقيمة ${(activeDiscount * 100)}% بنجاح!`);
    updateCartUI();
  } else {
    alert("كود الخصم غير صحيح أو منتهي الصلاحية!");
  }
}

function updateCartUI() {
  const cart = getCart();
  const cartCountEl = document.getElementById("cartCount");
  const cartItemsListEl = document.getElementById("cartItemsList");
  const cartTotalPriceEl = document.getElementById("cartTotalPrice");

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  let totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (activeDiscount > 0) {
    totalPrice = totalPrice - (totalPrice * activeDiscount);
  }

  if (cartCountEl) cartCountEl.innerText = totalCount;
  if (cartTotalPriceEl) cartTotalPriceEl.innerText = totalPrice.toFixed(2);

  if (!cartItemsListEl) return;

  if (cart.length === 0) {
    cartItemsListEl.innerHTML = "<p style='color: #a88b7d; font-size: 13px;'>السلة فارغة حالياً.</p>";
    return;
  }

  cartItemsListEl.innerHTML = "";
  cart.forEach((item, index) => {
    cartItemsListEl.innerHTML += `
      <div style="display: flex; justify-content: space-between; align-items: center; background: #1a100c; padding: 10px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #3d2822;">
        <div style="text-align: right;">
          <strong style="color: #fff; font-size: 13px;">${item.name}</strong>
          <div style="font-size: 11px; color: #a88b7d;">العدد: ${item.quantity} × ${item.price} = ${item.quantity * item.price} EGP</div>
        </div>
        <button onclick="removeFromCart(${index})" class="delete-btn" style="padding: 4px 8px; font-size: 11px;">حذف</button>
      </div>
    `;
  });
}

function removeFromCart(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

function toggleCartModal() {
  const modal = document.getElementById("cartModal");
  if (!modal) return;
  modal.style.display = modal.style.display === "flex" ? "none" : "flex";
}

function sendCartToWhatsApp() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("السلة فارغة!");
    return;
  }

  const phoneNumber = "201025386551";
  let message = "مرحباً MAIKA PRINT، أود طلب الطلبية التالية:\n\n";
  let total = 0;

  cart.forEach((item, i) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    message += `${i + 1}. *${item.name}* (${item.category})\n   - العدد: ${item.quantity}\n   - السعر: ${itemTotal} EGP\n`;
  });

  if (activeDiscount > 0) {
    const discountAmount = total * activeDiscount;
    total = total - discountAmount;
    message += `\n🎁 *خصم مُطبق:* ${(activeDiscount * 100)}% (-${discountAmount.toFixed(2)} EGP)`;
  }

  message += `\n💰 *الإجمالي الكلي:* ${total.toFixed(2)} EGP`;

  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
}


// --- 5. معرض الأعمال وآراء العملاء ---

function renderGallery() {
  const galleryGrid = document.getElementById("galleryGrid");
  if (!galleryGrid) return;

  const products = JSON.parse(localStorage.getItem("products") || "[]");

  if (products.length === 0) {
    galleryGrid.innerHTML = "<p style='color: #a88b7d; text-align: center; grid-column: 1/-1;'>لا توجد أعمال معروضة حالياً.</p>";
    return;
  }

  galleryGrid.innerHTML = "";
  products.forEach(p => {
    galleryGrid.innerHTML += `
      <div class="product-card" style="padding: 12px;">
        <img src="${p.image}" alt="${p.name}" style="height: 180px;">
        <h4 style="margin: 5px 0; color: #fff;">${p.name}</h4>
        <span style="font-size: 11px; color: #d4a373;">${p.category}</span>
      </div>
    `;
  });
}

function getReviews() {
  return JSON.parse(localStorage.getItem("reviews") || `[
    {"name": "أحمد علي", "stars": "5", "comment": "جودة الطباعة ممتازة والتسليم سريع جداً!"},
    {"name": "سارة محمود", "stars": "5", "comment": "التصميم والألوان طالعين بالضبط زي ما كنت عاوزة."}
  ]`);
}

function renderReviews() {
  const reviewsList = document.getElementById("reviewsList");
  if (!reviewsList) return;

  const reviews = getReviews();
  reviewsList.innerHTML = "";

  reviews.forEach(rev => {
    const starsPattern = "⭐".repeat(Number(rev.stars));
    reviewsList.innerHTML += `
      <div style="background: #2b1b17; border: 1px solid #3d2822; padding: 15px; border-radius: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <strong style="color: #fff; font-size: 14px;">${rev.name}</strong>
          <span>${starsPattern}</span>
        </div>
        <p style="margin: 0; font-size: 13px; color: #a88b7d;">"${rev.comment}"</p>
      </div>
    `;
  });
}

function saveCustomerReview(event) {
  event.preventDefault();
  const name = document.getElementById("revClientName").value.trim();
  const stars = document.getElementById("revStars").value;
  const comment = document.getElementById("revComment").value.trim();

  if (!name || !comment) return;

  const reviews = getReviews();
  reviews.unshift({ name, stars, comment });
  localStorage.setItem("reviews", JSON.stringify(reviews));

  alert("شكراً لك! تم إضافة تقييمك بنجاح.");
  event.target.reset();
  renderReviews();
}


// --- 6. التحكم في المظهر والنسخ الاحتياطي ---

function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }
}

function toggleTheme() {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  localStorage.setItem("theme", isLight ? "light" : "dark");
}

function exportData() {
  const data = {
    categories: getCategories(),
    products: JSON.parse(localStorage.getItem("products") || "[]"),
    reviews: getReviews()
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "maika_print_backup.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.categories) localStorage.setItem("categories", JSON.stringify(data.categories));
      if (data.products) localStorage.setItem("products", JSON.stringify(data.products));
      if (data.reviews) localStorage.setItem("reviews", JSON.stringify(data.reviews));

      alert("تم استرجاع البيانات بنجاح!");
      location.reload();
    } catch (err) {
      alert("حدث خطأ أثناء قراءة الملف!");
    }
  };
  reader.readAsText(file);
}

document.addEventListener("DOMContentLoaded", initTheme);