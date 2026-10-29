// Gourmet Haven - Application Script

// Restaurants Database
const partnerRestaurants = [
    {
        id: "bella",
        name: "Bella Italia",
        cuisine: "Italian",
        rating: 4.8,
        time: "20-30 min",
        image: "images/pizza.png",
        desc: "Authentic wood-fired pizzas & hand-rolled pastas made with fresh imports."
    },
    {
        id: "truffle",
        name: "Truffle & Co.",
        cuisine: "American",
        rating: 4.9,
        time: "15-25 min",
        image: "images/burger.png",
        desc: "Gourmet dry-aged burgers, premium truffle aiolis & artisanal fries."
    },
    {
        id: "leafy",
        name: "Leafy Green",
        cuisine: "Mediterranean",
        rating: 4.7,
        time: "25-35 min",
        image: "images/salad.png",
        desc: "Vibrant organic bowls, farm-fresh quinoa salads & superfood smoothies."
    },
    {
        id: "sweet",
        name: "Sweet Cravings",
        cuisine: "Desserts",
        rating: 4.9,
        time: "10-20 min",
        image: "images/dessert.png",
        desc: "Rich Belgian chocolate cakes, cheesecakes & organic gelato pairings."
    }
];

// Gourmet Food Database
const foodDb = [
    {
        id: 1,
        title: "Margherita Basil Pizza",
        category: "pizza",
        cuisine: "Italian",
        restaurant: "Bella Italia",
        restaurantId: "bella",
        price: 14.99,
        diet: "veg",
        image: "images/pizza.png",
        rating: 4.9,
        description: "Experience absolute culinary purity with fresh hand-pulled mozzarella, fragrant basil leaves, aromatic San Marzano plum tomatoes, and a drizzle of raw, cold-pressed olive oil over our sourdough crust."
    },
    {
        id: 2,
        title: "Spicy Pepperoni Feast",
        category: "pizza",
        cuisine: "Italian",
        restaurant: "Bella Italia",
        restaurantId: "bella",
        price: 16.99,
        diet: "non-veg",
        image: "images/pizza.png",
        rating: 4.8,
        description: "A fiery selection layered with premium beef pepperoni slices, smoked provolone cheese, fresh chili oil, and a light finish of organic hot honey drizzle for a sweet-savory balance."
    },
    {
        id: 3,
        title: "Bruschetta Pomodoro",
        category: "pizza",
        cuisine: "Italian",
        restaurant: "Bella Italia",
        restaurantId: "bella",
        price: 7.99,
        diet: "veg",
        image: "images/pizza.png",
        rating: 4.6,
        description: "Toasted artisanal sourdough topped with marinated cherry tomatoes, garlic, fresh basil, and aged balsamic glaze."
    },
    {
        id: 4,
        title: "Signature Truffle Burger",
        category: "burgers",
        cuisine: "American",
        restaurant: "Truffle & Co.",
        restaurantId: "truffle",
        price: 15.99,
        diet: "non-veg",
        image: "images/burger.png",
        rating: 4.9,
        description: "An exceptional dry-aged beef patty cooked to medium perfection, topped with melted gruyère cheese, butter-sautéed wild forest mushrooms, and our signature black truffle oil aioli."
    },
    {
        id: 5,
        title: "Crispy Chicken Avocado",
        category: "burgers",
        cuisine: "American",
        restaurant: "Truffle & Co.",
        restaurantId: "truffle",
        price: 13.99,
        diet: "non-veg",
        image: "images/burger.png",
        rating: 4.7,
        description: "Crispy buttermilk-soaked fried chicken breast paired with creamy mashed Hass avocado, spicy jalapeños, and fresh house-made vinegar cabbage slaw on a brioche bun."
    },
    {
        id: 6,
        title: "Classic Cheese Fries",
        category: "burgers",
        cuisine: "American",
        restaurant: "Truffle & Co.",
        restaurantId: "truffle",
        price: 6.99,
        diet: "veg",
        image: "images/burger.png",
        rating: 4.5,
        description: "Crispy golden sea-salt french fries smothered in house-made cheddar cheese sauce and chopped green onions."
    },
    {
        id: 7,
        title: "Garden Harvest Quinoa",
        category: "salads",
        cuisine: "Mediterranean",
        restaurant: "Leafy Green",
        restaurantId: "leafy",
        price: 12.49,
        diet: "veg",
        image: "images/salad.png",
        rating: 4.6,
        description: "A superfood blend featuring organic tri-color quinoa, maple-roasted butternut squash, raw baby kale, crisp green apple matchsticks, and sweet pomegranate seeds with apple cider dressing."
    },
    {
        id: 8,
        title: "Greek Feta & Olive",
        category: "salads",
        cuisine: "Mediterranean",
        restaurant: "Leafy Green",
        restaurantId: "leafy",
        price: 11.99,
        diet: "veg",
        image: "images/salad.png",
        rating: 4.7,
        description: "A classic Greek recipe combining seedless Persian cucumbers, heirloom cherry tomatoes, red onion slivers, authentic barrel-aged block feta cheese, and imported Kalamata olives."
    },
    {
        id: 9,
        title: "Grilled Salmon Bowl",
        category: "salads",
        cuisine: "Mediterranean",
        restaurant: "Leafy Green",
        restaurantId: "leafy",
        price: 18.99,
        diet: "non-veg",
        image: "images/salad.png",
        rating: 4.8,
        description: "Pan-seared Atlantic salmon fillet served over brown rice, baby spinach, roasted vegetables, and lemon herb dressing."
    },
    {
        id: 10,
        title: "Warm Molten Lava Cake",
        category: "desserts",
        cuisine: "Desserts",
        restaurant: "Sweet Cravings",
        restaurantId: "sweet",
        price: 8.99,
        diet: "veg",
        image: "images/dessert.png",
        rating: 4.9,
        description: "A decadent Belgian chocolate cake baked with a liquid dark chocolate core, served hot and garnished with fresh raspberries, powdered sugar, and a scoop of organic vanilla bean gelato."
    },
    {
        id: 11,
        title: "Red Velvet Decadence",
        category: "desserts",
        cuisine: "Desserts",
        restaurant: "Sweet Cravings",
        restaurantId: "sweet",
        price: 9.49,
        diet: "veg",
        image: "images/dessert.png",
        rating: 4.8,
        description: "Moist red velvet sponge layers separated by rich and silky sweet cream cheese frosting, topped with fine chocolate shavings and fresh raspberry compote."
    },
    {
        id: 12,
        title: "Strawberry Cheesecake",
        category: "desserts",
        cuisine: "Desserts",
        restaurant: "Sweet Cravings",
        restaurantId: "sweet",
        price: 8.49,
        diet: "veg",
        image: "images/dessert.png",
        rating: 4.7,
        description: "Rich and creamy New York style cheesecake on a graham cracker crust, topped with fresh sweet strawberry compote."
    }
];

// Cart State
let cart = [];

// Filter States
let activeFilters = {
    searchQuery: "",
    cuisine: "all",
    diet: "all",
    priceTier: "all",
    restaurantId: "all",
    sortBy: "rating"
};

// Document Ready Initialization
$(document).ready(function() {
    initUI();
    bindEvents();
    renderRestaurants();
    filterMenu();
    updateCartUI();
});

// Initial UI Polish (Navbar transition on scroll)
function initUI() {
    $(window).on("scroll", function() {
        if ($(window).scrollTop() > 50) {
            $("#mainNavbar").addClass("navbar-scrolled shadow-sm").removeClass("py-3").addClass("py-2");
        } else {
            $("#mainNavbar").removeClass("navbar-scrolled shadow-sm").removeClass("py-2").addClass("py-3");
        }
    });
}

// Generate & Render Restaurants in Grid
function renderRestaurants() {
    const grid = $("#restaurantsGrid");
    grid.empty();

    partnerRestaurants.forEach(res => {
        const cardHtml = `
            <div class="col">
                <div class="card h-100 bg-card-dark border-secondary restaurant-card cursor-pointer" data-id="${res.id}">
                    <div class="position-relative overflow-hidden card-img-wrapper" style="height: 160px;">
                        <img src="${res.image}" class="card-img-top w-100 h-100 object-fit-cover transition-all" alt="${res.name}">
                        <div class="position-absolute bottom-0 start-0 w-100 p-2 bg-gradient-dark">
                            <span class="badge bg-gold text-dark fs-9"><i class="fa-solid fa-clock me-1"></i>${res.time}</span>
                        </div>
                    </div>
                    <div class="card-body p-3 d-flex flex-column justify-content-between">
                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <h5 class="card-title text-white font-playfair mb-0 fs-6">${res.name}</h5>
                                <span class="text-warning fs-8"><i class="fa-solid fa-star me-1"></i>${res.rating}</span>
                            </div>
                            <p class="text-gold fs-8 mb-2">${res.cuisine}</p>
                            <p class="card-text text-muted fs-8 mb-0">${res.desc}</p>
                        </div>
                        <button class="btn btn-outline-gold btn-sm w-100 rounded-pill mt-3 filter-res-btn" data-id="${res.id}">View Menu</button>
                    </div>
                </div>
            </div>
        `;
        grid.append(cardHtml);
    });
}

// Event Bindings
function bindEvents() {
    // Search synchronization & input handlers
    $("#navSearchInput, #mobileSearchInput").on("input", function() {
        const val = $(this).val();
        // Sync inputs
        $("#navSearchInput, #mobileSearchInput").not(this).val(val);
        activeFilters.searchQuery = val.trim();
        filterMenu();
    });

    // Cuisine Filter dropdown trigger
    $("#cuisineFilter").on("change", function() {
        activeFilters.cuisine = $(this).val();
        filterMenu();
    });

    // Diet selection buttons (Veg / Non-Veg)
    $("input[name='dietRadio']").on("change", function() {
        activeFilters.diet = $(this).val();
        filterMenu();
    });

    // Price range selector
    $("#priceFilter").on("change", function() {
        activeFilters.priceTier = $(this).val();
        filterMenu();
    });

    // Sort order selector
    $("#sortFilter").on("change", function() {
        activeFilters.sortBy = $(this).val();
        filterMenu();
    });

    // Reset filters trigger
    $("#clearFiltersBtn, #clearFilterTags").on("click", function() {
        resetAllFilters();
    });

    // Restaurant card click to view menu
    $(document).on("click", ".restaurant-card, .filter-res-btn", function(e) {
        // Prevent event bubbling if clicking button specifically
        e.stopPropagation();
        const resId = $(this).closest(".restaurant-card").data("id") || $(this).data("id");
        activeFilters.restaurantId = resId;
        
        // Auto scroll to menu
        document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
        filterMenu();
    });

    // Quick Order from Hero section
    $(document).on("click", ".quick-add-hero", function() {
        const id = parseInt($(this).data("id"));
        addToCart(id, 1);
        // Show offcanvas
        const cartCanvas = new bootstrap.Offcanvas(document.getElementById('cartOffcanvas'));
        cartCanvas.show();
    });

    // Add to Cart from menu cards
    $(document).on("click", ".add-to-cart-btn", function(e) {
        e.preventDefault();
        const id = parseInt($(this).data("id"));
        addToCart(id, 1);
        
        // Quick visual confirmation on button
        const btn = $(this);
        const originalText = btn.html();
        btn.html('<i class="fa-solid fa-circle-check me-1 text-dark"></i>Added!').removeClass('btn-outline-gold').addClass('btn-gold');
        setTimeout(() => {
            btn.html(originalText).removeClass('btn-gold').addClass('btn-outline-gold');
        }, 1500);
    });

    // View Details Modal triggers
    $(document).on("click", ".view-details-btn", function() {
        const id = parseInt($(this).data("id"));
        populateDetailsModal(id);
    });

    // Details Modal increment/decrement quantity
    $("#modalIncQty").on("click", function() {
        let val = parseInt($("#modalQtyInput").val());
        $("#modalQtyInput").val(val + 1);
    });

    $("#modalDecQty").on("click", function() {
        let val = parseInt($("#modalQtyInput").val());
        if (val > 1) {
            $("#modalQtyInput").val(val - 1);
        }
    });

    // Add to order from details modal
    $("#modalAddToCart").on("click", function() {
        const id = parseInt($(this).data("id"));
        const qty = parseInt($("#modalQtyInput").val());
        addToCart(id, qty);
        
        // Hide Modal
        const detailsModal = bootstrap.Modal.getInstance(document.getElementById('itemDetailsModal'));
        if (detailsModal) detailsModal.hide();
    });

    // Cart items operations inside offcanvas
    $(document).on("click", ".cart-inc-qty", function() {
        const id = parseInt($(this).data("id"));
        const cartItem = cart.find(c => c.id === id);
        if (cartItem) {
            cartItem.quantity++;
            updateCartUI();
        }
    });

    $(document).on("click", ".cart-dec-qty", function() {
        const id = parseInt($(this).data("id"));
        const cartItem = cart.find(c => c.id === id);
        if (cartItem) {
            if (cartItem.quantity > 1) {
                cartItem.quantity--;
            } else {
                cart = cart.filter(c => c.id !== id);
            }
            updateCartUI();
        }
    });

    $(document).on("click", ".remove-cart-item", function() {
        const id = parseInt($(this).data("id"));
        cart = cart.filter(c => c.id !== id);
        updateCartUI();
    });

    // Checkout process trigger
    $("#checkoutBtn").on("click", function() {
        if (cart.length === 0) {
            alert("Your culinary cart is empty! Start adding delicacies.");
            return;
        }
        
        alert("Thank you for your order! Your luxury gourmet meal is now being prepared by our Michelin-starred chefs and will arrive shortly.");
        cart = [];
        updateCartUI();
        
        // Hide offcanvas
        const cartOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('cartOffcanvas'));
        if (cartOffcanvas) cartOffcanvas.hide();
    });
}

// Reset all filters in UI & state
function resetAllFilters() {
    activeFilters = {
        searchQuery: "",
        cuisine: "all",
        diet: "all",
        priceTier: "all",
        restaurantId: "all",
        sortBy: "rating"
    };

    // Reset controls
    $("#navSearchInput, #mobileSearchInput").val("");
    $("#cuisineFilter").val("all");
    $("#dietAll").prop("checked", true);
    $("#priceFilter").val("all");
    $("#sortFilter").val("rating");

    filterMenu();
}

// Populate Details Modal on click
function populateDetailsModal(itemId) {
    const item = foodDb.find(f => f.id === itemId);
    if (!item) return;

    $("#modalImg").attr("src", item.image);
    $("#modalCuisineBadge").text(item.cuisine);
    $("#modalCategory").text(item.category);
    $("#modalTitle").text(item.title);
    $("#modalDescription").text(item.description);
    $("#modalPrice").text("$" + item.price.toFixed(2));
    $("#modalQtyInput").val(1);
    $("#modalAddToCart").attr("data-id", item.id);
    $("#modalRatingText").text(item.rating);
    $("#modalRestaurantName").text(`Prepared by ${item.restaurant}`);

    // Diet badge color and label
    const dietBadge = $("#modalDietBadge");
    if (item.diet === "veg") {
        dietBadge.removeClass("text-danger").addClass("text-success");
        dietBadge.find("span").text("Veg");
    } else {
        dietBadge.removeClass("text-success").addClass("text-danger");
        dietBadge.find("span").text("Non-Veg");
    }

    // Show bootstrap modal
    const modalEl = new bootstrap.Modal(document.getElementById('itemDetailsModal'));
    modalEl.show();
}

// Core Filter & Rendering function
function filterMenu() {
    let results = [...foodDb];

    // 1. Search Query filter
    if (activeFilters.searchQuery !== "") {
        const query = activeFilters.searchQuery.toLowerCase();
        results = results.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query) ||
            item.cuisine.toLowerCase().includes(query)
        );
    }

    // 2. Cuisine filter
    if (activeFilters.cuisine !== "all") {
        results = results.filter(item => item.cuisine === activeFilters.cuisine);
    }

    // 3. Diet Type filter
    if (activeFilters.diet !== "all") {
        results = results.filter(item => item.diet === activeFilters.diet);
    }

    // 4. Price range filter
    if (activeFilters.priceTier !== "all") {
        results = results.filter(item => {
            if (activeFilters.priceTier === "budget") return item.price < 10.00;
            if (activeFilters.priceTier === "moderate") return item.price >= 10.00 && item.price <= 15.00;
            if (activeFilters.priceTier === "premium") return item.price > 15.00;
            return true;
        });
    }

    // 5. Restaurant filter
    if (activeFilters.restaurantId !== "all") {
        results = results.filter(item => item.restaurantId === activeFilters.restaurantId);
    }

    // 6. Sort
    results.sort((a, b) => {
        if (activeFilters.sortBy === "rating") {
            return b.rating - a.rating; // Highest rating first
        }
        if (activeFilters.sortBy === "price-asc") {
            return a.price - b.price; // Low to High
        }
        if (activeFilters.sortBy === "price-desc") {
            return b.price - a.price; // High to Low
        }
        return 0;
    });

    // Update Filter Tags
    renderFilterTags();

    // Render grid
    renderMenuGrid(results);
}

// Generate filter active indicator tags
function renderFilterTags() {
    const container = $("#activeFilterTags");
    container.empty();

    let tagCount = 0;

    if (activeFilters.searchQuery) {
        addTag(`"${activeFilters.searchQuery}"`, () => {
            activeFilters.searchQuery = "";
            $("#navSearchInput, #mobileSearchInput").val("");
            filterMenu();
        });
        tagCount++;
    }

    if (activeFilters.cuisine !== "all") {
        addTag(`Cuisine: ${activeFilters.cuisine}`, () => {
            activeFilters.cuisine = "all";
            $("#cuisineFilter").val("all");
            filterMenu();
        });
        tagCount++;
    }

    if (activeFilters.diet !== "all") {
        addTag(`Diet: ${activeFilters.diet === "veg" ? "Veg" : "Non-Veg"}`, () => {
            activeFilters.diet = "all";
            $("#dietAll").prop("checked", true);
            filterMenu();
        });
        tagCount++;
    }

    if (activeFilters.priceTier !== "all") {
        let label = activeFilters.priceTier === "budget" ? "< $10" : activeFilters.priceTier === "moderate" ? "$10 - $15" : "> $15";
        addTag(`Price: ${label}`, () => {
            activeFilters.priceTier = "all";
            $("#priceFilter").val("all");
            filterMenu();
        });
        tagCount++;
    }

    if (activeFilters.restaurantId !== "all") {
        const res = partnerRestaurants.find(r => r.id === activeFilters.restaurantId);
        const name = res ? res.name : "Restaurant";
        addTag(`Kitchen: ${name}`, () => {
            activeFilters.restaurantId = "all";
            filterMenu();
        });
        tagCount++;
    }

    // Default tag if none active
    if (tagCount === 0) {
        container.append(`<span class="badge bg-secondary-subtle text-white rounded-pill px-3 py-1 fs-8">All Specialties</span>`);
    } else {
        // Clear all tag
        const clearAllBtn = $('<button class="btn btn-link text-gold fs-8 p-0 ms-2 text-decoration-none"><i class="fa-solid fa-trash-can me-1"></i>Clear All</button>');
        clearAllBtn.on("click", resetAllFilters);
        container.append(clearAllBtn);
    }

    function addTag(text, onClear) {
        const tag = $(`
            <span class="badge bg-gold-soft text-gold rounded-pill px-3 py-1.5 fs-8 d-flex align-items-center gap-2">
                ${text}
                <i class="fa-solid fa-xmark cursor-pointer remove-tag-icon"></i>
            </span>
        `);
        tag.find(".remove-tag-icon").on("click", onClear);
        container.append(tag);
    }
}

// Render Menu Cards
function renderMenuGrid(items) {
    const grid = $("#menuGrid");
    const emptyMsg = $("#emptyMenuMessage");
    grid.empty();

    if (items.length === 0) {
        grid.addClass("d-none");
        emptyMsg.removeClass("d-none");
        return;
    }

    grid.removeClass("d-none");
    emptyMsg.addClass("d-none");

    items.forEach(item => {
        const dietDot = item.diet === "veg" ? 
            '<span class="text-success fs-8"><i class="fa-solid fa-circle-dot me-1"></i>Veg</span>' : 
            '<span class="text-danger fs-8"><i class="fa-solid fa-circle-dot me-1"></i>Non-Veg</span>';

        const cardHtml = `
            <div class="col menu-item-card-col">
                <div class="card h-100 bg-card-dark border-secondary food-card shadow transition-all">
                    <!-- Image Wrapper -->
                    <div class="position-relative overflow-hidden card-img-wrapper" style="height: 180px;">
                        <img src="${item.image}" class="card-img-top w-100 h-100 object-fit-cover transition-all" alt="${item.title}" loading="lazy">
                        <span class="position-absolute top-0 end-0 m-2 badge bg-dark-semi border border-secondary text-gold rounded-pill px-2.5 py-1 fs-9">${item.cuisine}</span>
                        <!-- Quick View Overlay -->
                        <div class="card-img-overlay bg-overlay-dark d-flex align-items-center justify-content-center opacity-0 transition-all">
                            <button class="btn btn-gold btn-sm rounded-pill px-3 view-details-btn" data-id="${item.id}">Quick View</button>
                        </div>
                    </div>
                    <!-- Info Body -->
                    <div class="card-body p-3 d-flex flex-column justify-content-between">
                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                ${dietDot}
                                <span class="text-warning fs-8"><i class="fa-solid fa-star me-1"></i>${item.rating}</span>
                            </div>
                            <h5 class="card-title text-white font-playfair fs-6 mb-1">${item.title}</h5>
                            <p class="text-muted fs-9 mb-2">${item.restaurant}</p>
                            <p class="card-text text-muted fs-8 mb-0 desc-trim" style="height: 38px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${item.description}</p>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-secondary">
                            <span class="text-gold fw-bold fs-6">$${item.price.toFixed(2)}</span>
                            <button class="btn btn-outline-gold btn-sm rounded-pill px-3 add-to-cart-btn" data-id="${item.id}">Add to Order</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        grid.append(cardHtml);
    });
}

// Cart Drawer Calculations & Rendering
function updateCartUI() {
    const list = $("#cartItemsList");
    const countBadge = $("#cartBadgeCount");
    const subtotalEl = $("#cartSubtotal");
    const deliveryEl = $("#cartDelivery");
    const taxEl = $("#cartTax");
    const totalEl = $("#cartTotal");

    list.empty();
    
    let totalCount = 0;
    let subtotal = 0;

    if (cart.length === 0) {
        list.append(`
            <div class="d-flex flex-column align-items-center justify-content-center h-100 text-center text-muted">
                <i class="fa-solid fa-utensils fs-1 mb-3 text-secondary-subtle"></i>
                <h5 class="text-white font-playfair fs-5">Your cart is empty</h5>
                <p class="fs-8 px-4">Start browsing our premium menu card to add delicious culinary delights.</p>
            </div>
        `);
        $("#cartPricingPanel").hide();
    } else {
        $("#cartPricingPanel").show();

        cart.forEach(cartItem => {
            const item = foodDb.find(f => f.id === cartItem.id);
            if (!item) return;

            totalCount += cartItem.quantity;
            const itemSubtotal = item.price * cartItem.quantity;
            subtotal += itemSubtotal;

            const itemHtml = `
                <div class="d-flex align-items-center justify-content-between border-bottom border-secondary-subtle pb-3 mb-3">
                    <div class="d-flex align-items-center gap-3">
                        <div class="rounded-3 border border-secondary overflow-hidden bg-dark" style="width: 54px; height: 54px;">
                            <img src="${item.image}" alt="${item.title}" class="w-100 h-100 object-fit-cover">
                        </div>
                        <div>
                            <h6 class="text-white fs-7 mb-0">${item.title}</h6>
                            <span class="text-gold fs-8">$${item.price.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <!-- Custom quantity selectors -->
                        <div class="d-flex align-items-center border border-secondary rounded-pill p-1">
                            <button class="btn btn-sm btn-link text-white text-decoration-none px-2 py-0 fs-8 cart-dec-qty" data-id="${item.id}"><i class="fa-solid fa-minus"></i></button>
                            <span class="fs-8 fw-semibold px-1" style="min-width: 14px; text-align: center;">${cartItem.quantity}</span>
                            <button class="btn btn-sm btn-link text-white text-decoration-none px-2 py-0 fs-8 cart-inc-qty" data-id="${item.id}"><i class="fa-solid fa-plus"></i></button>
                        </div>
                        <button class="btn btn-link text-muted hover-danger p-0 border-0 remove-cart-item" data-id="${item.id}"><i class="fa-solid fa-trash-can fs-7"></i></button>
                    </div>
                </div>
            `;
            list.append(itemHtml);
        });
    }

    // Calculations
    const deliveryFee = (subtotal === 0 || subtotal >= 35.00) ? 0.00 : 3.99;
    const tax = subtotal * 0.05;
    const grandTotal = subtotal + deliveryFee + tax;

    // Update values
    countBadge.text(totalCount);
    subtotalEl.text("$" + subtotal.toFixed(2));
    
    if (deliveryFee === 0) {
        deliveryEl.html(subtotal >= 35.00 ? '<span class="text-success fw-semibold">FREE</span>' : "$0.00");
    } else {
        deliveryEl.text("$" + deliveryFee.toFixed(2));
    }
    
    taxEl.text("$" + tax.toFixed(2));
    totalEl.text("$" + grandTotal.toFixed(2));

    // Animate badge on change
    countBadge.addClass("badge-pulse");
    setTimeout(() => countBadge.removeClass("badge-pulse"), 400);
}

// Add item to cart
function addToCart(itemId, quantity) {
    const existingIndex = cart.findIndex(c => c.id === itemId);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({ id: itemId, quantity: quantity });
    }
    updateCartUI();
}
