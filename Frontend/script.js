/* =====================================================
   KARUKRITI
   FRONTEND + FASTAPI + MONGODB + PRICING AI
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

    const token = getToken();

    if (token) {

        headers["Authorization"] =
            `Bearer ${token}`;

    }

    try {

        const response =
            await fetch(
                `${API_BASE}${endpoint}`,
                {
                    ...options,
                    headers
                }
            );

        if (response.status === 401) {

            logoutUser();

            throw new Error(
                "Session expired. Please login again."
            );
        }

        return response;

    } catch (error) {

        /*
         * Browser "Failed to fetch" usually means:
         * - backend is not running
         * - wrong API URL
         * - CORS problem
         * - network connection problem
         */

        if (
            error.name === "TypeError" &&
            error.message === "Failed to fetch"
        ) {

            throw new Error(
                "Cannot connect to the backend. Please make sure FastAPI is running at http://127.0.0.1:8000"
            );

        }

        throw error;
    }
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

        console.error(
            "Signup error:",
            error
        );


        showAuthMessage(
            message,
            error.message ||
            "Registration failed.",
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

        console.error(
            "Login error:",
            error
        );


        showAuthMessage(
            message,
            error.message ||
            "Login failed.",
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

        let data = {};

        try {
            data = await response.json();
        } catch (_) {}

        throw new Error(
            data.detail ||
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
        function (event) {

            console.error(
                "Voice input error:",
                event
            );

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
   GENERATE SMART CATALOG
   + XGBOOST DYNAMIC PRICING
===================================================== */

async function generateCatalog() {

    console.log(
        "Starting smart catalog generation..."
    );


    /* =================================================
       BASIC PRODUCT INFORMATION
    ================================================= */

    const name =
        document
            .getElementById(
                "productName"
            )
            ?.value
            .trim();


    const category =
        document
            .getElementById(
                "productCategory"
            )
            ?.value;


    /*
     * Artisan's own expected price.
     *
     * This is OPTIONAL.
     * The AI model calculates recommended_price.
     */

    const priceInput =
        document
            .getElementById(
                "productPrice"
            )
            ?.value;


    const price =
        Number(
            priceInput
        );


    const language =
        document
            .getElementById(
                "productLanguage"
            )
            ?.value ||
        "English";


    const description =
        document
            .getElementById(
                "description"
            )
            ?.value
            .trim();


    /* =================================================
       XGBOOST INPUTS
    ================================================= */

    const laborHours =
        Number(
            document
                .getElementById(
                    "laborHours"
                )
                ?.value
        );


    const quantity =
        Number(
            document
                .getElementById(
                    "productQuantity"
                )
                ?.value
        );


    const length =
        Number(
            document
                .getElementById(
                    "productLength"
                )
                ?.value
        );


    const width =
        Number(
            document
                .getElementById(
                    "productWidth"
                )
                ?.value
        );


    const height =
        Number(
            document
                .getElementById(
                    "productHeight"
                )
                ?.value
        );


    const itemType =
        document
            .getElementById(
                "itemType"
            )
            ?.value;


    const materialType =
        document
            .getElementById(
                "materialType"
            )
            ?.value;


    const finishType =
        document
            .getElementById(
                "finishType"
            )
            ?.value;


    const urgencyLevel =
        document
            .getElementById(
                "urgencyLevel"
            )
            ?.value;


    /* =================================================
       IMAGE
    ================================================= */

    const imageInput =
        document.getElementById(
            "productImage"
        );


    /* =================================================
       VALIDATION
    ================================================= */

    if (!name) {

        alert(
            "Please enter the product name."
        );

        return;
    }


    if (!category) {

        alert(
            "Please select a craft category."
        );

        return;
    }


    /*
     * Expected price is optional.
     */

    const safePrice =
        Number.isFinite(price) &&
        price > 0
            ? price
            : 0;


    if (
        !Number.isFinite(laborHours) ||
        laborHours <= 0
    ) {

        alert(
            "Please enter valid labor hours."
        );

        return;
    }


    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {

        alert(
            "Please enter a valid quantity."
        );

        return;
    }


    if (
        !Number.isFinite(length) ||
        length <= 0
    ) {

        alert(
            "Please enter a valid length."
        );

        return;
    }


    if (
        !Number.isFinite(width) ||
        width <= 0
    ) {

        alert(
            "Please enter a valid width."
        );

        return;
    }


    if (
        !Number.isFinite(height) ||
        height <= 0
    ) {

        alert(
            "Please enter a valid height."
        );

        return;
    }


    if (!itemType) {

        alert(
            "Please select the product type."
        );

        return;
    }


    if (!materialType) {

        alert(
            "Please select the material."
        );

        return;
    }


    if (!finishType) {

        alert(
            "Please select the finish."
        );

        return;
    }


    if (!urgencyLevel) {

        alert(
            "Please select the delivery urgency."
        );

        return;
    }


    if (
        !imageInput ||
        !imageInput.files ||
        imageInput.files.length === 0
    ) {

        alert(
            "Please upload a product photo."
        );

        return;
    }


    /* =================================================
       CREATE FORM DATA
    ================================================= */

    const formData =
        new FormData();


    /* Basic fields */

    formData.append(
        "name",
        name
    );


    formData.append(
        "category",
        category
    );


    formData.append(
        "description",
        description || ""
    );


    formData.append(
        "language",
        language
    );


    formData.append(
        "price",
        safePrice
    );


    /* =================================================
       XGBOOST FIELDS
    ================================================= */

    formData.append(
        "labor_hours",
        laborHours
    );


    formData.append(
        "quantity",
        quantity
    );


    formData.append(
        "length",
        length
    );


    formData.append(
        "width",
        width
    );


    formData.append(
        "height",
        height
    );


    formData.append(
        "item_type",
        itemType
    );


    formData.append(
        "material_type",
        materialType
    );


    formData.append(
        "finish_type",
        finishType
    );


    formData.append(
        "urgency_level",
        urgencyLevel
    );


    /* =================================================
       IMAGE
    ================================================= */

    formData.append(
        "image",
        imageInput.files[0]
    );


    /* =================================================
       BUTTON
    ================================================= */

    const button =
        document.querySelector(
            ".generate-button"
        );


    const originalButtonText =
        button
            ? button.textContent
            : "Generate Smart Catalog →";


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Generating Smart Catalog...";

    }


    /* =================================================
       SEND REQUEST TO FASTAPI
    ================================================= */

    try {

        console.log(
            "Sending catalog request to:",
            `${API_BASE}/api/catalog/generate`
        );


        const response =
            await apiFetch(
                "/api/catalog/generate",
                {

                    method:
                        "POST",

                    /*
                     * IMPORTANT:
                     * Do NOT set Content-Type here.
                     *
                     * Browser automatically creates:
                     * multipart/form-data boundary.
                     */

                    body:
                        formData

                }
            );


        console.log(
            "Catalog response status:",
            response.status
        );


        let data;


        try {

            data =
                await response.json();

        } catch (jsonError) {

            throw new Error(
                `Backend returned an invalid response. HTTP ${response.status}`
            );

        }


        console.log(
            "Catalog response data:",
            data
        );


        /* =================================================
           BACKEND ERROR
        ================================================= */

        if (
            !response.ok
        ) {

            let errorMessage =
                "Catalog generation failed.";


            if (
                data &&
                data.detail
            ) {

                if (
                    Array.isArray(
                        data.detail
                    )
                ) {

                    errorMessage =
                        data.detail
                            .map(
                                function (item) {

                                    return (
                                        item.msg ||
                                        JSON.stringify(
                                            item
                                        )
                                    );

                                }
                            )
                            .join("\n");

                } else {

                    errorMessage =
                        String(
                            data.detail
                        );

                }

            }


            throw new Error(
                `Server error (${response.status}): ${errorMessage}`
            );

        }


        /* =================================================
           CHECK RESULT
        ================================================= */

        if (
            !data
        ) {

            throw new Error(
                "Backend returned empty catalog data."
            );

        }


        /* =================================================
           SAVE CATALOG RESULT
        ================================================= */

        sessionStorage.setItem(
            CATALOG_KEY,
            JSON.stringify(data)
        );


        console.log(
            "Catalog saved successfully."
        );


        /* =================================================
           GO TO RESULT PAGE
        ================================================= */

        window.location.href =
            "catalog-result.html";


    } catch (error) {

        console.error(
            "SMART CATALOG ERROR:",
            error
        );


        alert(
            error.message ||
            "Something went wrong while generating the catalog."
        );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                originalButtonText;

        }

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

        console.warn(
            "No catalog data found in sessionStorage."
        );

        return;
    }


    try {

        const catalog =
            JSON.parse(
                raw
            );


        /* =================================================
           BASIC INFORMATION
        ================================================= */

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


        if (resultName) {

            resultName.textContent =
                catalog.name || "-";

        }


        if (resultCategory) {

            resultCategory.textContent =
                catalog.category || "-";

        }


        if (resultDescription) {

            resultDescription.textContent =
                catalog.description || "-";

        }


        /* =================================================
           IMAGE
        ================================================= */

        const resultImage =
            document.getElementById(
                "resultImage"
            );


        const imagePlaceholder =
            document.getElementById(
                "resultImagePlaceholder"
            );


        if (
            resultImage &&
            catalog.image_url
        ) {

            let imageURL =
                catalog.image_url;


            if (
                imageURL.startsWith(
                    "http://"
                ) ||
                imageURL.startsWith(
                    "https://"
                )
            ) {

                resultImage.src =
                    imageURL;

            } else {

                resultImage.src =
                    `${API_BASE}${imageURL}`;

            }


            resultImage.style.display =
                "block";


            if (imagePlaceholder) {

                imagePlaceholder.style.display =
                    "none";

            }

        }


        /* =================================================
           AI RECOMMENDED PRICE
        ================================================= */

        const recommendedPrice =
            document.getElementById(
                "recommendedPrice"
            );


        if (recommendedPrice) {

            const aiPrice =
                Number(
                    catalog.recommended_price
                );


            if (
                Number.isFinite(
                    aiPrice
                ) &&
                aiPrice > 0
            ) {

                recommendedPrice.textContent =
                    `₹${aiPrice.toLocaleString(
                        "en-IN",
                        {
                            maximumFractionDigits: 0
                        }
                    )}`;

            } else {

                recommendedPrice.textContent =
                    "Price unavailable";

            }

        }


        /* =================================================
           MARKET MINIMUM
        ================================================= */

        const marketMin =
            document.getElementById(
                "marketMin"
            );


        if (marketMin) {

            const min =
                Number(
                    catalog.market_min
                );


            if (
                Number.isFinite(min)
            ) {

                marketMin.textContent =
                    `₹${min.toLocaleString(
                        "en-IN",
                        {
                            maximumFractionDigits: 0
                        }
                    )}`;

            } else {

                marketMin.textContent =
                    "₹0";

            }

        }


        /* =================================================
           MARKET MAXIMUM
        ================================================= */

        const marketMax =
            document.getElementById(
                "marketMax"
            );


        if (marketMax) {

            const max =
                Number(
                    catalog.market_max
                );


            if (
                Number.isFinite(max)
            ) {

                marketMax.textContent =
                    `₹${max.toLocaleString(
                        "en-IN",
                        {
                            maximumFractionDigits: 0
                        }
                    )}`;

            } else {

                marketMax.textContent =
                    "₹0";

            }

        }


        /* =================================================
           PRICING INPUTS
        ================================================= */

        const pricingInputs =
            catalog.pricing_inputs ||
            {};


        const resultItemType =
            document.getElementById(
                "resultItemType"
            );


        const resultMaterialType =
            document.getElementById(
                "resultMaterialType"
            );


        const resultLaborHours =
            document.getElementById(
                "resultLaborHours"
            );


        const resultQuantity =
            document.getElementById(
                "resultQuantity"
            );


        const resultDimensions =
            document.getElementById(
                "resultDimensions"
            );


        const resultFinishType =
            document.getElementById(
                "resultFinishType"
            );


        const resultUrgencyLevel =
            document.getElementById(
                "resultUrgencyLevel"
            );


        if (resultItemType) {

            resultItemType.textContent =
                formatDisplayText(
                    pricingInputs.item_type
                );

        }


        if (resultMaterialType) {

            resultMaterialType.textContent =
                formatDisplayText(
                    pricingInputs.material_type
                );

        }


        if (resultLaborHours) {

            const hours =
                Number(
                    pricingInputs.labor_hours
                );


            resultLaborHours.textContent =
                Number.isFinite(hours)
                    ? `${hours} hrs`
                    : "-";

        }


        if (resultQuantity) {

            resultQuantity.textContent =
                pricingInputs.quantity ||
                "-";

        }


        if (resultDimensions) {

            if (
                pricingInputs.length &&
                pricingInputs.width &&
                pricingInputs.height
            ) {

                resultDimensions.textContent =
                    `${pricingInputs.length} × ${pricingInputs.width} × ${pricingInputs.height} cm`;

            } else {

                resultDimensions.textContent =
                    "-";

            }

        }


        if (resultFinishType) {

            resultFinishType.textContent =
                formatDisplayText(
                    pricingInputs.finish_type
                );

        }


        if (resultUrgencyLevel) {

            resultUrgencyLevel.textContent =
                formatDisplayText(
                    pricingInputs.urgency_level
                );

        }


        /* =================================================
           EXPECTED PRICE
        ================================================= */

        const expectedPriceCard =
            document.getElementById(
                "expectedPriceCard"
            );


        const resultExpectedPrice =
            document.getElementById(
                "resultExpectedPrice"
            );


        const priceComparisonMessage =
            document.getElementById(
                "priceComparisonMessage"
            );


        const expectedPrice =
            Number(
                catalog.price
            );


        const aiPrice =
            Number(
                catalog.recommended_price
            );


        if (
            Number.isFinite(
                expectedPrice
            ) &&
            expectedPrice > 0
        ) {

            if (expectedPriceCard) {

                expectedPriceCard.style.display =
                    "block";

            }


            if (resultExpectedPrice) {

                resultExpectedPrice.textContent =
                    `₹${expectedPrice.toLocaleString(
                        "en-IN",
                        {
                            maximumFractionDigits: 0
                        }
                    )}`;

            }


            if (priceComparisonMessage) {

                if (
                    Number.isFinite(aiPrice)
                ) {

                    if (
                        expectedPrice <
                        aiPrice
                    ) {

                        priceComparisonMessage.textContent =
                            "Your expected price is below the AI recommendation.";

                    } else if (
                        expectedPrice >
                        aiPrice
                    ) {

                        priceComparisonMessage.textContent =
                            "Your expected price is above the AI recommendation.";

                    } else {

                        priceComparisonMessage.textContent =
                            "Your expected price matches the AI recommendation.";

                    }

                }

            }

        } else {

            if (expectedPriceCard) {

                expectedPriceCard.style.display =
                    "none";

            }

        }


    } catch (error) {

        console.error(
            "Error loading catalog result:",
            error
        );

    }

}


/* =====================================================
   FORMAT DISPLAY TEXT
===================================================== */

function formatDisplayText(
    value
) {

    if (!value) {

        return "-";

    }


    return String(value)
        .replace(
            /\b\w/g,
            function (char) {

                return char.toUpperCase();

            }
        );

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
            "Catalog data not found. Please generate the catalog again."
        );

        goTo(
            "add-product.html"
        );

        return;
    }


    let catalog;


    try {

        catalog =
            JSON.parse(
                raw
            );

    } catch (error) {

        alert(
            "Invalid catalog data."
        );

        return;
    }


    /* =================================================
       AI PRICE
    ================================================= */

    const recommendedPrice =
        Number(
            catalog.recommended_price
        );


    if (
        !Number.isFinite(
            recommendedPrice
        ) ||
        recommendedPrice <= 0
    ) {

        alert(
            "AI recommended price is not available."
        );

        return;
    }


    /* =================================================
       PRICING INPUTS
    ================================================= */

    const pricingInputs =
        catalog.pricing_inputs ||
        {};


    const productData = {

        name:
            catalog.name,

        category:
            catalog.category,

        description:
            catalog.description ||
            "",

        /*
         * Published price is the
         * AI recommended price.
         */

        price:
            recommendedPrice,

        recommended_price:
            recommendedPrice,

        market_min:
            Number(
                catalog.market_min
            ),

        market_max:
            Number(
                catalog.market_max
            ),

        language:
            catalog.language ||
            "English",

        image_url:
            catalog.image_url,


        /* XGBoost inputs */

        labor_hours:
            Number(
                pricingInputs.labor_hours
            ),

        quantity:
            Number(
                pricingInputs.quantity
            ),

        length:
            Number(
                pricingInputs.length
            ),

        width:
            Number(
                pricingInputs.width
            ),

        height:
            Number(
                pricingInputs.height
            ),

        item_type:
            pricingInputs.item_type,

        material_type:
            pricingInputs.material_type,

        finish_type:
            pricingInputs.finish_type,

        urgency_level:
            pricingInputs.urgency_level

    };


    /* =================================================
       VALIDATE BEFORE PUBLISH
    ================================================= */

    if (
        !productData.name ||
        !productData.category
    ) {

        alert(
            "Product information is incomplete."
        );

        return;
    }


    if (
        !Number.isFinite(
            productData.labor_hours
        ) ||
        productData.labor_hours <= 0
    ) {

        alert(
            "Labor hours are missing."
        );

        return;
    }


    if (
        !Number.isFinite(
            productData.quantity
        ) ||
        productData.quantity <= 0
    ) {

        alert(
            "Quantity is missing."
        );

        return;
    }


    /* =================================================
       PUBLISH BUTTON
    ================================================= */

    const button =
        document.querySelector(
            ".publish-button"
        );


    const originalText =
        button
            ? button.textContent
            : "Publish Product →";


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Publishing...";

    }


    /* =================================================
       SEND TO FASTAPI
    ================================================= */

    try {

        console.log(
            "Publishing product:",
            productData
        );


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
                        JSON.stringify(
                            productData
                        )

                }
            );


        const data =
            await response.json();


        console.log(
            "Publish response:",
            data
        );


        if (
            !response.ok
        ) {

            let message =
                "Publishing failed.";


            if (
                data &&
                data.detail
            ) {

                if (
                    Array.isArray(
                        data.detail
                    )
                ) {

                    message =
                        data.detail
                            .map(
                                function (item) {

                                    return (
                                        item.msg ||
                                        JSON.stringify(
                                            item
                                        )
                                    );

                                }
                            )
                            .join("\n");

                } else {

                    message =
                        String(
                            data.detail
                        );

                }

            }


            throw new Error(
                `Server error (${response.status}): ${message}`
            );

        }


        /* =================================================
           CLEAR TEMPORARY DATA
        ================================================= */

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

        console.error(
            "Publish error:",
            error
        );


        alert(
            error.message ||
            "Unable to publish product."
        );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                originalText;

        }

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

        let data = {};

        try {
            data = await response.json();
        } catch (_) {}


        throw new Error(
            data.detail ||
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

            list.innerHTML =
                "";


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
            products
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


                        const status =
                            escapeHTML(
                                product.status ||
                                "Published"
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


                        const aiPrice =
                            Number(
                                product.recommended_price
                            );


                        const regularPrice =
                            Number(
                                product.price
                            );


                        const finalPrice =
                            Number.isFinite(
                                aiPrice
                            ) &&
                            aiPrice > 0
                                ? aiPrice
                                : regularPrice;


                        const displayPrice =
                            Number.isFinite(
                                finalPrice
                            )
                                ? finalPrice.toLocaleString(
                                    "en-IN"
                                )
                                : "—";


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
                                        ₹${displayPrice}
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
                )
                .join("");


    } catch (error) {

        console.error(
            "Products loading error:",
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
                    ${escapeHTML(
                        error.message ||
                        "Please make sure the backend is running."
                    )}
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


                        const aiPrice =
                            Number(
                                product.recommended_price
                            );


                        const regularPrice =
                            Number(
                                product.price
                            );


                        const finalPrice =
                            Number.isFinite(
                                aiPrice
                            ) &&
                            aiPrice > 0
                                ? aiPrice
                                : regularPrice;


                        const displayPrice =
                            Number.isFinite(
                                finalPrice
                            )
                                ? finalPrice.toLocaleString(
                                    "en-IN"
                                )
                                : "—";


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
                                        ₹${displayPrice}
                                    </b>

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");


    } catch (error) {

        console.error(
            "Home products error:",
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
            "Profile error:",
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
            orders
                .map(
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
                )
                .join("");


    } catch (error) {

        console.error(
            "Orders error:",
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
            "Order statistics error:",
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

        /*
         * These functions safely do nothing
         * when their page elements don't exist.
         */

        loadCatalogResult();

        renderProducts();

        renderHomeProducts();

        loadProfile();

        loadOrders();

        loadOrderStats();

    }
);