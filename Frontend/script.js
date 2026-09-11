/* =====================================================
   KARUKRITI
   FRONTEND + FASTAPI + MONGODB
===================================================== */


/* =====================================================
   CONFIGURATION
===================================================== */

const API_BASE = "http://127.0.0.1:8000";

const TOKEN_KEY = "karukritiToken";

const CATALOG_KEY = "karukritiCatalog";


/* =====================================================
   AUTHENTICATION
===================================================== */

function getToken() {

    return localStorage.getItem(
        TOKEN_KEY
    );
}


function setToken(token) {

    localStorage.setItem(
        TOKEN_KEY,
        token
    );
}


function isLoggedIn() {

    return !!getToken();
}


function logoutUser() {

    localStorage.removeItem(
        TOKEN_KEY
    );

    sessionStorage.removeItem(
        CATALOG_KEY
    );

    window.location.href =
        "login.html";
}


/* =====================================================
   API FETCH
===================================================== */

async function apiFetch(
    endpoint,
    options = {}
) {

    const headers = {
        ...(options.headers || {})
    };


    const token =
        getToken();


    if (token) {

        headers[
            "Authorization"
        ] =
            `Bearer ${token}`;

    }


    const response =
        await fetch(
            `${API_BASE}${endpoint}`,
            {
                ...options,
                headers
            }
        );


    if (
        response.status === 401
    ) {

        localStorage.removeItem(
            TOKEN_KEY
        );

        sessionStorage.removeItem(
            CATALOG_KEY
        );

        window.location.href =
            "login.html";

        throw new Error(
            "Session expired."
        );
    }


    return response;
}


/* =====================================================
   NAVIGATION
===================================================== */

function goTo(page) {

    window.location.href =
        page;
}


/* =====================================================
   HTML SAFETY
===================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =====================================================
   AUTH MESSAGE
===================================================== */

function showAuthMessage(
    element,
    message,
    type
) {

    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        `auth-message ${type}`;
}


/* =====================================================
   SIGNUP
===================================================== */

async function signupUser() {

    const name =
        document
            .getElementById(
                "signupName"
            )
            ?.value
            .trim();


    const mobile =
        document
            .getElementById(
                "signupMobile"
            )
            ?.value
            .trim();


    const email =
        document
            .getElementById(
                "signupEmail"
            )
            ?.value
            .trim();


    const age =
        Number(
            document
                .getElementById(
                    "signupAge"
                )
                ?.value
        );


    const category =
        document
            .getElementById(
                "signupCategory"
            )
            ?.value;


    const location =
        document
            .getElementById(
                "signupLocation"
            )
            ?.value
            .trim();


    const language =
        document
            .getElementById(
                "signupLanguage"
            )
            ?.value;


    const password =
        document
            .getElementById(
                "signupPassword"
            )
            ?.value;


    const message =
        document.getElementById(
            "signupMessage"
        );


    if (
        !name ||
        !mobile ||
        !email ||
        !age ||
        !category ||
        !location ||
        !language ||
        !password
    ) {

        showAuthMessage(
            message,
            "Please fill in all the details.",
            "error"
        );

        return;
    }


    if (
        password.length < 6
    ) {

        showAuthMessage(
            message,
            "Password must be at least 6 characters.",
            "error"
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/api/auth/register`,
                {

                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            name:
                                name,

                            mobile:
                                mobile,

                            email:
                                email,

                            age:
                                age,

                            category:
                                category,

                            location:
                                location,

                            language:
                                language,

                            password:
                                password

                        })

                }
            );


        const data =
            await response.json();


        if (
            !response.ok
        ) {

            throw new Error(
                data.detail ||
                "Registration failed."
            );

        }


        showAuthMessage(
            message,
            "Account created successfully! Please sign in.",
            "success"
        );


        setTimeout(
            function () {

                window.location.href =
                    "login.html";

            },
            1000
        );


    } catch (error) {

        showAuthMessage(
            message,
            error.message,
            "error"
        );

    }
}


/* =====================================================
   LOGIN
===================================================== */

async function loginUser() {

    const loginValue =
        document
            .getElementById(
                "loginEmail"
            )
            ?.value
            .trim();


    const password =
        document
            .getElementById(
                "loginPassword"
            )
            ?.value;


    const message =
        document.getElementById(
            "loginMessage"
        );


    if (
        !loginValue ||
        !password
    ) {

        showAuthMessage(
            message,
            "Please enter your email/mobile and password.",
            "error"
        );

        return;
    }


    try {

        const formData =
            new URLSearchParams();


        formData.append(
            "username",
            loginValue
        );


        formData.append(
            "password",
            password
        );


        const response =
            await fetch(
                `${API_BASE}/api/auth/login`,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/x-www-form-urlencoded"

                    },

                    body:
                        formData

                }
            );


        const data =
            await response.json();


        if (
            !response.ok
        ) {

            throw new Error(
                data.detail ||
                "Login failed."
            );

        }


        setToken(
            data.access_token
        );


        showAuthMessage(
            message,
            "Login successful!",
            "success"
        );


        setTimeout(
            function () {

                window.location.href =
                    "index.html";

            },
            700
        );


    } catch (error) {

        showAuthMessage(
            message,
            error.message,
            "error"
        );

    }
}


/* =====================================================
   CURRENT USER
===================================================== */

async function getCurrentUser() {

    const response =
        await apiFetch(
            "/api/auth/me"
        );


    if (
        !response.ok
    ) {

        throw new Error(
            "Unable to load user."
        );

    }


    return await response.json();
}


/* =====================================================
   PAGE PROTECTION
===================================================== */

function protectAppPage() {

    const page =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    const publicPages = [

        "",

        "login.html",

        "signup.html",

        "forgot-password.html"

    ];


    if (
        !publicPages.includes(page) &&
        !isLoggedIn()
    ) {

        window.location.href =
            "login.html";

    }
}


function redirectLoggedInUser() {

    const page =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    if (
        isLoggedIn() &&
        (
            page === "login.html" ||
            page === "signup.html"
        )
    ) {

        window.location.href =
            "index.html";

    }
}


/* =====================================================
   IMAGE PREVIEW
===================================================== */

function setupImagePreview() {

    const input =
        document.getElementById(
            "productImage"
        );


    const preview =
        document.getElementById(
            "imagePreview"
        );


    if (
        !input ||
        !preview
    ) {

        return;

    }


    input.addEventListener(
        "change",
        function () {

            const file =
                this.files?.[0];


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select an image."
                );

                this.value = "";

                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    preview.innerHTML = `

                        <img
                            src="${event.target.result}"
                            alt="Product Preview"
                        >

                    `;

                };


            reader.readAsDataURL(
                file
            );

        }
    );
}


/* =====================================================
   VOICE INPUT
===================================================== */

function startVoiceInput() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    const textarea =
        document.getElementById(
            "description"
        );


    const voiceButton =
        document.getElementById(
            "voiceBtn"
        );


    if (!textarea) {
        return;
    }


    if (!SpeechRecognition) {

        alert(
            "Voice input is not supported. Please use Google Chrome."
        );

        return;
    }


    const recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-IN";


    recognition.interimResults =
        false;


    recognition.maxAlternatives =
        1;


    if (voiceButton) {

        voiceButton.innerText =
            "🎙 Listening...";

        voiceButton.disabled =
            true;

    }


    recognition.onresult =
        function (event) {

            const text =
                event
                    .results[0][0]
                    .transcript;


            const oldText =
                textarea.value.trim();


            textarea.value =
                oldText
                    ? `${oldText} ${text}`
                    : text;

        };


    recognition.onerror =
        function () {

            alert(
                "Voice input failed."
            );

        };


    recognition.onend =
        function () {

            if (voiceButton) {

                voiceButton.innerText =
                    "🎙 Voice";

                voiceButton.disabled =
                    false;

            }

        };


    recognition.start();
}


/* =====================================================
   GENERATE CATALOG
===================================================== */
async function generateCatalog() {

    const name = document.getElementById("productName").value.trim();
    const category = document.getElementById("productCategory").value;
    const price = document.getElementById("productPrice").value;
    const language = document.getElementById("productLanguage").value;
    const description = document.getElementById("description").value.trim();

    const imageInput = document.getElementById("productImage");

    if (!name) {
        alert("Please enter the product name.");
        return;
    }

    if (!category) {
        alert("Please select a craft category.");
        return;
    }

    if (!price || Number(price) <= 0) {
        alert("Please enter a valid expected price.");
        return;
    }

    if (!imageInput.files.length) {
        alert("Please upload a product photo.");
        return;
    }


    const formData = new FormData();

    formData.append("name", name);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("language", language);
    formData.append("description", description);

    formData.append(
        "image",
        imageInput.files[0]
    );


    const button = document.querySelector(
        ".generate-button"
    );

    button.disabled = true;
    button.textContent = "Enhancing Image...";


    try {

        const response = await apiFetch(
            "/api/catalog/generate",
            {
                method: "POST",
                body: formData
            }
        );


        if (!response.ok) {

            const error = await response.json();

            throw new Error(
                error.detail || "Catalog generation failed."
            );
        }


        const catalog = await response.json();


        sessionStorage.setItem(
            "karukritiCatalog",
            JSON.stringify(catalog)
        );


        window.location.href =
            "catalog-result.html";


    } catch (error) {

        console.error(error);

        alert(
            "Unable to generate catalog: " +
            error.message
        );

        button.disabled = false;

        button.textContent =
            "Generate Smart Catalog →";
    }
}


/* =====================================================
   LOAD CATALOG RESULT
===================================================== */

function loadCatalogResult() {

    const raw =
        sessionStorage.getItem(
            CATALOG_KEY
        );


    if (!raw) {
        return;
    }


    const catalog =
        JSON.parse(raw);


    const resultName =
        document.getElementById(
            "resultName"
        );


    const resultCategory =
        document.getElementById(
            "resultCategory"
        );


    const resultDescription =
        document.getElementById(
            "resultDescription"
        );


    const resultImage =
        document.getElementById(
            "resultImage"
        );


    const recommendedPrice =
        document.getElementById(
            "recommendedPrice"
        );


    const marketMin =
        document.getElementById(
            "marketMin"
        );


    const marketMax =
        document.getElementById(
            "marketMax"
        );


    if (resultName) {

        resultName.textContent =
            catalog.name;

    }


    if (resultCategory) {

        resultCategory.textContent =
            catalog.category;

    }


    if (resultDescription) {

        resultDescription.textContent =
            catalog.description;

    }


    if (recommendedPrice) {

        recommendedPrice.textContent =
            `₹${catalog.recommended_price}`;

    }


    if (marketMin) {

        marketMin.textContent =
            catalog.market_min;

    }


    if (marketMax) {

        marketMax.textContent =
            catalog.market_max;

    }


    if (
        resultImage &&
        catalog.image_url
    ) {

        resultImage.src =
            `${API_BASE}${catalog.image_url}`;

    }
}


/* =====================================================
   PUBLISH PRODUCT
===================================================== */

async function publishProduct() {

    const raw =
        sessionStorage.getItem(
            CATALOG_KEY
        );


    if (!raw) {

        alert(
            "Catalog data not found."
        );

        goTo(
            "add-product.html"
        );

        return;
    }


    const catalog =
        JSON.parse(raw);


    try {

        const response =
            await apiFetch(
                "/api/products/",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            name:
                                catalog.name,

                            category:
                                catalog.category,

                            description:
                                catalog.description,

                            price:
                                catalog.price,

                            language:
                                catalog.language ||
                                "English",

                            image_url:
                                catalog.image_url

                        })

                }
            );


        const data =
            await response.json();


        if (
            !response.ok
        ) {

            throw new Error(
                data.detail ||
                "Publishing failed."
            );

        }


        sessionStorage.removeItem(
            CATALOG_KEY
        );


        alert(
            "Product published successfully!"
        );


        goTo(
            "products.html"
        );


    } catch (error) {

        alert(
            error.message
        );

    }
}


/* =====================================================
   GET PRODUCTS
===================================================== */

async function getProducts() {

    const response =
        await apiFetch(
            "/api/products/"
        );


    if (
        !response.ok
    ) {

        throw new Error(
            "Unable to load products."
        );

    }


    return await response.json();
}


/* =====================================================
   PRODUCTS PAGE
===================================================== */

async function renderProducts() {

    const list =
        document.getElementById(
            "productList"
        );


    if (!list) {
        return;
    }


    const empty =
        document.getElementById(
            "emptyProducts"
        );


    const count =
        document.getElementById(
            "productCount"
        );


    try {

        const products =
            await getProducts();


        if (count) {

            count.textContent =
                products.length;

        }


        if (
            products.length === 0
        ) {

            list.innerHTML = "";


            if (empty) {

                empty.style.display =
                    "block";

            }


            return;
        }


        if (empty) {

            empty.style.display =
                "none";

        }


        list.innerHTML =
            products.map(
                function (product) {

                    const name =
                        escapeHTML(
                            product.name
                        );


                    const category =
                        escapeHTML(
                            product.category
                        );


                    const status =
                        escapeHTML(
                            product.status
                        );


                    let imageHTML =
                        `<span>🧺</span>`;


                    if (
                        product.image_url
                    ) {

                        imageHTML = `

                            <img
                                src="${API_BASE}${product.image_url}"
                                alt="${name}"
                            >

                        `;

                    }


                    return `

                        <article
                            class="product-card"
                        >

                            <div
                                class="product-image"
                            >
                                ${imageHTML}
                            </div>


                            <div
                                class="product-card-body"
                            >

                                <div
                                    class="product-category"
                                >
                                    ${category}
                                </div>


                                <h3>
                                    ${name}
                                </h3>


                                <div
                                    class="product-price"
                                >
                                    ₹${product.recommended_price}
                                </div>


                                <div
                                    class="product-status"
                                >
                                    ✓ ${status}
                                </div>

                            </div>

                        </article>

                    `;

                }
            ).join("");


    } catch (error) {

        console.error(
            error
        );


        list.innerHTML = `

            <div class="empty-products">

                <div class="empty-icon">
                    ⚠
                </div>

                <h3>
                    Unable to load products
                </h3>

                <p>
                    Please make sure the backend is running.
                </p>

            </div>

        `;

    }
}


/* =====================================================
   HOME PRODUCTS
===================================================== */

async function renderHomeProducts() {

    const container =
        document.getElementById(
            "homeProducts"
        );


    if (!container) {
        return;
    }


    try {

        const products =
            await getProducts();


        if (
            products.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-products">

                    <div class="empty-icon">
                        🧺
                    </div>

                    <h3>
                        No products yet
                    </h3>

                    <p>
                        Create your first smart catalog.
                    </p>

                </div>

            `;

            return;
        }


        container.innerHTML =
            products
                .slice(0, 3)
                .map(
                    function (product) {

                        const name =
                            escapeHTML(
                                product.name
                            );


                        const category =
                            escapeHTML(
                                product.category
                            );


                        const image =
                            product.image_url
                                ? `

                                    <img
                                        src="${API_BASE}${product.image_url}"
                                        alt="${name}"
                                        style="
                                            width:100%;
                                            height:100%;
                                            object-fit:cover;
                                            border-radius:14px;
                                        "
                                    >

                                  `
                                : "🧺";


                        return `

                            <div
                                class="home-product"
                            >

                                <div
                                    class="home-product-icon"
                                >
                                    ${image}
                                </div>


                                <div
                                    class="home-product-info"
                                >

                                    <strong>
                                        ${name}
                                    </strong>


                                    <span>
                                        ${category}
                                    </span>


                                    <b>
                                        ₹${product.recommended_price}
                                    </b>

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");


    } catch (error) {

        console.error(
            error
        );

    }
}


/* =====================================================
   PROFILE
===================================================== */

async function loadProfile() {

    const profileName =
        document.getElementById(
            "profileUserName"
        );


    if (!profileName) {
        return;
    }


    try {

        const response =
            await apiFetch(
                "/api/profile/"
            );


        const profile =
            await response.json();


        if (!response.ok) {

            throw new Error(
                profile.detail ||
                "Unable to load profile."
            );

        }


        profileName.textContent =
            profile.name;


        const category =
            document.getElementById(
                "profileUserCategory"
            );


        if (category) {

            category.textContent =
                profile.category;

        }


        const location =
            document.getElementById(
                "profileUserLocation"
            );


        if (location) {

            location.textContent =
                `📍 ${profile.location}`;

        }


        const productCount =
            document.getElementById(
                "profileProductCount"
            );


        if (productCount) {

            productCount.textContent =
                profile.product_count;

        }


        const orderCount =
            document.getElementById(
                "profileOrderCount"
            );


        if (orderCount) {

            orderCount.textContent =
                profile.order_count;

        }


        /* PRODUCTS PAGE SELLER */

        const sellerName =
            document.getElementById(
                "sellerName"
            );


        if (sellerName) {

            sellerName.textContent =
                profile.name;

        }


        const sellerCategory =
            document.getElementById(
                "sellerCategory"
            );


        if (sellerCategory) {

            sellerCategory.textContent =
                profile.category;

        }


        const sellerLocation =
            document.getElementById(
                "sellerLocation"
            );


        if (sellerLocation) {

            sellerLocation.textContent =
                profile.location;

        }


    } catch (error) {

        console.error(
            error
        );

    }
}


/* =====================================================
   ORDERS
===================================================== */

async function loadOrders() {

    const orderList =
        document.querySelector(
            ".order-list"
        );


    if (!orderList) {
        return;
    }


    try {

        const response =
            await apiFetch(
                "/api/orders/"
            );


        const orders =
            await response.json();


        if (!response.ok) {

            throw new Error(
                orders.detail ||
                "Unable to load orders."
            );

        }


        if (
            orders.length === 0
        ) {

            orderList.innerHTML = `

                <div class="empty-products">

                    <div class="empty-icon">
                        📦
                    </div>

                    <h3>
                        No orders yet
                    </h3>

                    <p>
                        Your customer orders will appear here.
                    </p>

                </div>

            `;

            return;
        }


        orderList.innerHTML =
            orders.map(
                function (order) {

                    const orderNumber =
                        escapeHTML(
                            order.order_number
                        );


                    const productName =
                        escapeHTML(
                            order.product_name
                        );


                    const status =
                        escapeHTML(
                            order.status
                        );


                    return `

                        <div
                            class="order-card"
                        >

                            <div
                                class="order-icon"
                            >
                                📦
                            </div>


                            <div
                                class="order-info"
                            >

                                <strong>
                                    ${orderNumber}
                                </strong>


                                <h3>
                                    ${productName}
                                </h3>


                                <span>
                                    Customer Order
                                </span>

                            </div>


                            <div
                                class="order-right"
                            >

                                <strong>
                                    ₹${order.amount}
                                </strong>


                                <small>
                                    ${status}
                                </small>

                            </div>

                        </div>

                    `;

                }
            ).join("");


    } catch (error) {

        console.error(
            error
        );

    }
}


/* =====================================================
   ORDER STATISTICS
===================================================== */

async function loadOrderStats() {

    const firstStat =
        document.querySelector(
            ".order-stat:nth-child(1) strong"
        );


    if (!firstStat) {
        return;
    }


    try {

        const response =
            await apiFetch(
                "/api/orders/stats"
            );


        const stats =
            await response.json();


        if (!response.ok) {

            throw new Error(
                stats.detail ||
                "Unable to load order statistics."
            );

        }


        firstStat.textContent =
            stats.total_orders;


        const pending =
            document.querySelector(
                ".order-stat:nth-child(2) strong"
            );


        if (pending) {

            pending.textContent =
                stats.pending;

        }


        const completed =
            document.querySelector(
                ".order-stat:nth-child(3) strong"
            );


        if (completed) {

            completed.textContent =
                stats.completed;

        }


        const revenue =
            document.querySelector(
                ".revenue-card strong"
            );


        if (revenue) {

            revenue.textContent =
                `₹${stats.total_revenue}`;

        }


    } catch (error) {

        console.error(
            error
        );

    }
}


/* =====================================================
   PASSWORD SHOW / HIDE
===================================================== */

function togglePassword(
    inputId,
    button
) {

    const input =
        document.getElementById(
            inputId
        );


    if (!input) {
        return;
    }


    if (
        input.type ===
        "password"
    ) {

        input.type =
            "text";

        button.textContent =
            "Hide";

    } else {

        input.type =
            "password";

        button.textContent =
            "Show";

    }
}


/* =====================================================
   OTHER CATEGORY
===================================================== */

function showOtherComingSoon() {

    const category =
        document.getElementById(
            "productCategory"
        );


    const comingSoon =
        document.getElementById(
            "otherComingSoon"
        );


    if (
        !category ||
        !comingSoon
    ) {

        return;
    }


    if (
        category.value ===
        "Other"
    ) {

        comingSoon.style.display =
            "flex";

    } else {

        comingSoon.style.display =
            "none";

    }
}


/* =====================================================
   PAGE INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        protectAppPage();

        redirectLoggedInUser();

        setupImagePreview();

        loadCatalogResult();

        renderProducts();

        renderHomeProducts();

        loadProfile();

        loadOrders();

        loadOrderStats();

    }
);