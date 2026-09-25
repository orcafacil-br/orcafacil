/* =========================================================
   ORÇAFÁCIL — APP.JS
   ========================================================= */

const STORAGE_KEY = "orcafacil_data_v2";
const QUOTES_STORAGE_KEY = "orcafacil_quotes_v1";
const THEME_KEY = "orcafacil_theme";

let appData = {
    expenses: [],
    budgets: [],
    monthlyBalance: 0,
    spendingPlan: {
        mode: "automatic",
        percentage: 50
    }
};

let quotes = [];

const categories = {
    "Supermercado": [
        "Alimentos",
        "Higiene pessoal",
        "Limpeza",
        "Bebidas",
        "Hortifruti",
        "Carnes",
        "Padaria",
        "Fármacos",
        "Outros"
    ],

    "Alimentação": [
        "Restaurante",
        "Lanche",
        "Delivery",
        "Café",
        "Padaria",
        "Outros"
    ],

    "Compras Online": [
        "Mercado Livre",
        "Shopee",
        "Amazon",
        "AliExpress",
        "Magalu",
        "Americanas",
        "Outros"
    ],

    "Streamings": [
        "Netflix",
        "Disney+",
        "Amazon Prime",
        "Max",
        "Paramount+",
        "Globoplay",
        "Spotify",
        "YouTube Premium",
        "Outros"
    ],

    "Casa": [
        "Aluguel",
        "Energia",
        "Água",
        "Internet",
        "Móveis",
        "Eletrodomésticos",
        "Manutenção",
        "Outros"
    ],

    "Transporte": [
        "Combustível",
        "Uber",
        "99",
        "Transporte público",
        "Estacionamento",
        "Manutenção",
        "Outros"
    ],

    "Saúde": [
        "Consultas",
        "Exames",
        "Medicamentos",
        "Plano de saúde",
        "Dentista",
        "Outros"
    ],

    "Educação": [
        "Cursos",
        "Livros",
        "Faculdade",
        "Material escolar",
        "Outros"
    ],

    "Lazer": [
        "Cinema",
        "Restaurantes",
        "Viagens",
        "Jogos",
        "Eventos",
        "Passeios",
        "Outros"
    ],

    "Serviços": [
        "Manutenção de veículo",
        "Profissionais",
        "Assinaturas",
        "Serviços digitais",
        "Outros"
    ],

    "Outros": [
        "Outros"
    ]
};


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", init);

function init() {
    loadData();
    loadQuotes();
    loadTheme();

    setupNavigation();
    setupMobileMenu();

    populateCategorySelects();
    populateQuoteCategorySelect();

    setupExpenseForm();
    setupQuoteForm();

    setupFilters();
    setupBudgetControl();

    setupModalEvents();

    setupCurrencyInputs();

    renderCategories();
    renderExpenses();
    renderQuotes();

    updateDashboard();
}


/* =========================================================
   STORAGE
   ========================================================= */

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            const parsed = JSON.parse(saved);

            appData = {
                ...appData,
                ...parsed,
                expenses: Array.isArray(parsed.expenses)
                    ? parsed.expenses
                    : [],
                budgets: Array.isArray(parsed.budgets)
                    ? parsed.budgets
                    : []
            };
        }
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

function saveData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );
}

function loadQuotes() {
    try {
        const saved = localStorage.getItem(QUOTES_STORAGE_KEY);

        quotes = saved
            ? JSON.parse(saved)
            : [];

        if (!Array.isArray(quotes)) {
            quotes = [];
        }
    } catch (error) {
        console.error("Erro ao carregar cotações:", error);
        quotes = [];
    }
}

function saveQuotes() {
    localStorage.setItem(
        QUOTES_STORAGE_KEY,
        JSON.stringify(quotes)
    );
}


/* =========================================================
   FORMATAÇÃO
   ========================================================= */

function formatCurrency(value) {
    const number = Number(value) || 0;

    return number.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function parseCurrency(value) {
    if (typeof value === "number") {
        return value;
    }

    if (!value) {
        return 0;
    }

    let cleaned = String(value)
        .replace(/\s/g, "")
        .replace(/R\$/gi, "");

    /*
     * Aceita:
     * 30
     * 30,00
     * 1.500,00
     * 1500.00
     */

    if (
        cleaned.includes(",") &&
        cleaned.includes(".")
    ) {
        cleaned = cleaned
            .replace(/\./g, "")
            .replace(",", ".");
    } else if (cleaned.includes(",")) {
        cleaned = cleaned.replace(",", ".");
    }

    cleaned = cleaned.replace(/[^\d.-]/g, "");

    const number = Number(cleaned);

    return Number.isFinite(number)
        ? number
        : 0;
}

function formatInputCurrency(input) {
    if (!input) {
        return;
    }

    const raw = input.value;

    if (!raw) {
        return;
    }

    const value = parseCurrency(raw);

    input.value = value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function setupCurrencyInputs() {
    document
        .querySelectorAll(
            'input[data-currency], input.currency-input-field'
        )
        .forEach(input => {
            input.addEventListener("blur", () => {
                formatInputCurrency(input);
            });
        });
}


/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

function setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const target = item.dataset.page;

            if (!target) {
                return;
            }

            navigateTo(target);
        });
    });
}

function navigateTo(pageName) {
    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });

    const targetPage = document.getElementById(
        `page-${pageName}`
    );

    if (targetPage) {
        targetPage.classList.add("active");
    }

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {
            item.classList.toggle(
                "active",
                item.dataset.page === pageName
            );
        });

    updatePageTitle(pageName);

    closeMobileMenu();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function updatePageTitle(pageName) {
    const titles = {
        dashboard: "Dashboard",
        expenses: "Despesas",
        quotes: "Cotações",
        categories: "Categorias"
    };

    const title = titles[pageName] || "OrçaFácil";

    const pageTitle = document.getElementById(
        "pageTitle"
    );

    if (pageTitle) {
        pageTitle.textContent = title;
    }
}


/* =========================================================
   MENU MOBILE
   ========================================================= */

function setupMobileMenu() {
    const button = document.querySelector(
        ".mobile-menu-button"
    );

    const sidebar = document.querySelector(
        ".sidebar"
    );

    if (!button || !sidebar) {
        return;
    }

    button.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });
}

function closeMobileMenu() {
    const sidebar = document.querySelector(
        ".sidebar"
    );

    if (sidebar) {
        sidebar.classList.remove("open");
    }
}


/* =========================================================
   TEMA
   ========================================================= */

function loadTheme() {
    const savedTheme = localStorage.getItem(
        THEME_KEY
    );

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }

    updateThemeButton();
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");

    const isDark =
        document.body.classList.contains("dark-mode");

    localStorage.setItem(
        THEME_KEY,
        isDark ? "dark" : "light"
    );

    updateThemeButton();
}

function updateThemeButton() {
    const button = document.querySelector(
        ".theme-toggle"
    );

    if (!button) {
        return;
    }

    const isDark =
        document.body.classList.contains("dark-mode");

    const label =
        button.querySelector(".theme-toggle-label");

    if (label) {
        label.innerHTML = isDark
            ? "☀️ Modo claro"
            : "🌙 Modo escuro";
    }
}

document.addEventListener("click", event => {
    const themeButton =
        event.target.closest(".theme-toggle");

    if (themeButton) {
        toggleTheme();
    }
});


/* =========================================================
   CATEGORIAS
   ========================================================= */

function populateCategorySelects() {
    const selects = document.querySelectorAll(
        '[data-category-select], #expenseCategory, #filterCategory'
    );

    selects.forEach(select => {
        const currentValue = select.value;

        select.innerHTML = "";

        const placeholder =
            document.createElement("option");

        placeholder.value = "";
        placeholder.textContent =
            "Selecione uma categoria";

        select.appendChild(placeholder);

        Object.keys(categories).forEach(category => {
            const option =
                document.createElement("option");

            option.value = category;
            option.textContent = category;

            select.appendChild(option);
        });

        if (currentValue) {
            select.value = currentValue;
        }
    });
}

function populateQuoteCategorySelect() {
    const select = document.getElementById(
        "quoteCategory"
    );

    if (!select) {
        return;
    }

    const currentValue = select.value;

    select.innerHTML = "";

    const placeholder =
        document.createElement("option");

    placeholder.value = "";
    placeholder.textContent =
        "Selecione uma categoria";

    select.appendChild(placeholder);

    Object.keys(categories).forEach(category => {
        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;

        select.appendChild(option);
    });

    if (currentValue) {
        select.value = currentValue;
    }
}

function populateSubcategories(
    category,
    targetId
) {
    const select = document.getElementById(
        targetId
    );

    if (!select) {
        return;
    }

    select.innerHTML = "";

    const placeholder =
        document.createElement("option");

    placeholder.value = "";
    placeholder.textContent =
        "Selecione uma subcategoria";

    select.appendChild(placeholder);

    const subcategories =
        categories[category] || [];

    subcategories.forEach(subcategory => {
        const option =
            document.createElement("option");

        option.value = subcategory;
        option.textContent = subcategory;

        select.appendChild(option);
    });
}


/* =========================================================
   FORMULÁRIO DE DESPESAS
   ========================================================= */

function setupExpenseForm() {
    const form = document.getElementById(
        "expenseForm"
    );

    const category = document.getElementById(
        "expenseCategory"
    );

    if (!form) {
        return;
    }

    if (category) {
        category.addEventListener("change", () => {
            populateSubcategories(
                category.value,
                "expenseSubcategory"
            );
        });
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const description =
            document.getElementById(
                "expenseDescription"
            )?.value.trim();

        const categoryValue =
            document.getElementById(
                "expenseCategory"
            )?.value;

        const subcategory =
            document.getElementById(
                "expenseSubcategory"
            )?.value;

        const amount =
            parseCurrency(
                document.getElementById(
                    "expenseAmount"
                )?.value
            );

        const date =
            document.getElementById(
                "expenseDate"
            )?.value ||
            new Date().toISOString().split("T")[0];

        const notes =
            document.getElementById(
                "expenseNotes"
            )?.value.trim() || "";

        if (
            !description ||
            !categoryValue ||
            !amount ||
            amount <= 0
        ) {
            showToast(
                "Preencha os campos obrigatórios.",
                "warning"
            );

            return;
        }

        const expense = {
            id: generateId(),
            description,
            category: categoryValue,
            subcategory:
                subcategory || "Outros",
            amount,
            date,
            notes,
            createdAt:
                new Date().toISOString()
        };

        appData.expenses.unshift(expense);

        saveData();

        form.reset();

        closeModal("expenseModal");

        renderExpenses();
        updateDashboard();

        showToast(
            "Despesa adicionada com sucesso!",
            "success"
        );
    });
}


/* =========================================================
   COTAÇÕES
   ========================================================= */

function setupQuoteForm() {
    const form = document.getElementById(
        "quoteForm"
    );

    const category = document.getElementById(
        "quoteCategory"
    );

    if (!form) {
        return;
    }

    if (category) {
        category.addEventListener("change", () => {
            populateSubcategories(
                category.value,
                "quoteSubcategory"
            );
        });
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const product =
            document.getElementById(
                "quoteProduct"
            )?.value.trim();

        const categoryValue =
            document.getElementById(
                "quoteCategory"
            )?.value;

        const subcategory =
            document.getElementById(
                "quoteSubcategory"
            )?.value;

        const store =
            document.getElementById(
                "quoteStore"
            )?.value.trim();

        const price =
            parseCurrency(
                document.getElementById(
                    "quotePrice"
                )?.value
            );

        const date =
            document.getElementById(
                "quoteDate"
            )?.value ||
            new Date().toISOString().split("T")[0];

        const notes =
            document.getElementById(
                "quoteNotes"
            )?.value.trim() || "";

        if (
            !product ||
            !categoryValue ||
            !price ||
            price <= 0
        ) {
            showToast(
                "Preencha os campos obrigatórios.",
                "warning"
            );

            return;
        }

        const quote = {
            id: generateId(),
            product,
            category: categoryValue,
            subcategory:
                subcategory || "Outros",
            store:
                store || "Não informado",
            price,
            date,
            notes,
            createdAt:
                new Date().toISOString()
        };

        quotes.unshift(quote);

        saveQuotes();

        form.reset();

        closeModal("quoteModal");

        renderQuotes();
        updateDashboard();

        showToast(
            "Cotação adicionada com sucesso!",
            "success"
        );
    });
}


/* =========================================================
   FILTROS
   ========================================================= */

function setupFilters() {
    const filterCategory =
        document.getElementById(
            "filterCategory"
        );

    const filterSearch =
        document.getElementById(
            "expenseSearch"
        );

    const filterPeriod =
        document.getElementById(
            "filterPeriod"
        );

    [
        filterCategory,
        filterSearch,
        filterPeriod
    ].forEach(element => {
        if (element) {
            element.addEventListener(
                "input",
                renderExpenses
            );

            element.addEventListener(
                "change",
                renderExpenses
            );
        }
    });

    const quoteSearch =
        document.getElementById(
            "quoteSearch"
        );

    const quoteCategory =
        document.getElementById(
            "quoteFilterCategory"
        );

    if (quoteSearch) {
        quoteSearch.addEventListener(
            "input",
            renderQuotes
        );
    }

    if (quoteCategory) {
        quoteCategory.addEventListener(
            "change",
            renderQuotes
        );
    }
}


/* =========================================================
   RENDER — DESPESAS
   ========================================================= */

function renderExpenses() {
    const container =
        document.getElementById(
            "expensesContainer"
        );

    if (!container) {
        return;
    }

    const category =
        document.getElementById(
            "filterCategory"
        )?.value || "";

    const search =
        document.getElementById(
            "expenseSearch"
        )?.value
            .trim()
            .toLowerCase() || "";

    const period =
        document.getElementById(
            "filterPeriod"
        )?.value || "all";

    let filtered =
        [...appData.expenses];

    if (category) {
        filtered = filtered.filter(
            expense =>
                expense.category === category
        );
    }

    if (search) {
        filtered = filtered.filter(
            expense =>
                expense.description
                    .toLowerCase()
                    .includes(search) ||
                expense.category
                    .toLowerCase()
                    .includes(search) ||
                expense.subcategory
                    .toLowerCase()
                    .includes(search)
        );
    }

    if (period !== "all") {
        const now = new Date();

        filtered = filtered.filter(
            expense => {
                const date =
                    new Date(expense.date);

                if (period === "month") {
                    return (
                        date.getMonth() ===
                            now.getMonth() &&
                        date.getFullYear() ===
                            now.getFullYear()
                    );
                }

                if (period === "year") {
                    return (
                        date.getFullYear() ===
                        now.getFullYear()
                    );
                }

                return true;
            }
        );
    }

    if (!filtered.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💰</div>
                <div class="empty-state-title">
                    Nenhuma despesa encontrada
                </div>
                <div class="empty-state-text">
                    Adicione uma despesa ou altere os filtros.
                </div>
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <div class="card">
            <div class="table-wrapper">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Despesa</th>
                            <th>Categoria</th>
                            <th>Subcategoria</th>
                            <th>Data</th>
                            <th>Valor</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        ${filtered.map(expense => `
                            <tr>
                                <td>
                                    <strong>
                                        ${escapeHtml(
                                            expense.description
                                        )}
                                    </strong>

                                    ${
                                        expense.notes
                                            ? `
                                                <div class="list-item-subtitle">
                                                    ${escapeHtml(
                                                        expense.notes
                                                    )}
                                                </div>
                                            `
                                            : ""
                                    }
                                </td>

                                <td>
                                    ${escapeHtml(
                                        expense.category
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        expense.subcategory
                                    )}
                                </td>

                                <td>
                                    ${formatDate(
                                        expense.date
                                    )}
                                </td>

                                <td>
                                    <strong>
                                        ${formatCurrency(
                                            expense.amount
                                        )}
                                    </strong>
                                </td>

                                <td class="text-right">
                                    <button
                                        class="btn btn-small btn-danger"
                                        onclick="deleteExpense('${expense.id}')"
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}


/* =========================================================
   EXCLUIR DESPESA
   ========================================================= */

function deleteExpense(id) {
    const confirmed = confirm(
        "Deseja realmente excluir esta despesa?"
    );

    if (!confirmed) {
        return;
    }

    appData.expenses =
        appData.expenses.filter(
            expense => expense.id !== id
        );

    saveData();

    renderExpenses();
    updateDashboard();

    showToast(
        "Despesa excluída.",
        "success"
    );
}


/* =========================================================
   RENDER — COTAÇÕES
   ========================================================= */

function renderQuotes() {
    const container =
        document.getElementById(
            "quotesContainer"
        );

    if (!container) {
        return;
    }

    const search =
        document.getElementById(
            "quoteSearch"
        )?.value
            .trim()
            .toLowerCase() || "";

    const category =
        document.getElementById(
            "quoteFilterCategory"
        )?.value || "";

    let filtered =
        [...quotes];

    if (search) {
        filtered = filtered.filter(
            quote =>
                quote.product
                    .toLowerCase()
                    .includes(search) ||
                quote.store
                    .toLowerCase()
                    .includes(search)
        );
    }

    if (category) {
        filtered = filtered.filter(
            quote =>
                quote.category === category
        );
    }

    if (!filtered.length) {
        container.innerHTML = `
            <div class="card">
                <div class="empty-state">
                    <div class="empty-state-icon">
                        🔎
                    </div>

                    <div class="empty-state-title">
                        Nenhuma cotação encontrada
                    </div>

                    <div class="empty-state-text">
                        Adicione uma cotação para começar a comparar preços.
                    </div>
                </div>
            </div>
        `;

        return;
    }

    const groups =
        groupQuotes(filtered);

    container.innerHTML = `
        <div class="quotes-grid">
            ${groups.map(group =>
                renderQuoteGroup(group)
            ).join("")}
        </div>
    `;
}

function groupQuotes(items) {
    const groups = {};

    items.forEach(quote => {
        const key =
            `${quote.product}__${quote.category}__${quote.subcategory}`;

        if (!groups[key]) {
            groups[key] = {
                product: quote.product,
                category: quote.category,
                subcategory: quote.subcategory,
                quotes: []
            };
        }

        groups[key].quotes.push(quote);
    });

    return Object.values(groups);
}

function renderQuoteGroup(group) {
    const sorted =
        [...group.quotes].sort(
            (a, b) => a.price - b.price
        );

    const cheapest =
        sorted[0];

    const highest =
        sorted[sorted.length - 1];

    const possibleSaving =
        highest.price -
        cheapest.price;

    return `
        <div class="quote-card">

            <div class="quote-header">

                <div>
                    <div class="quote-product">
                        ${escapeHtml(
                            group.product
                        )}
                    </div>

                    <div class="quote-category">
                        ${escapeHtml(
                            group.category
                        )}
                        •
                        ${escapeHtml(
                            group.subcategory
                        )}
                    </div>
                </div>

                <div class="quote-price text-success">
                    ${formatCurrency(
                        cheapest.price
                    )}
                </div>

            </div>

            <div class="quote-meta">
                <span class="quote-tag">
                    Melhor preço:
                    ${escapeHtml(
                        cheapest.store
                    )}
                </span>

                <span class="quote-tag">
                    ${sorted.length}
                    ${sorted.length === 1
                        ? "cotação"
                        : "cotações"}
                </span>

                ${
                    possibleSaving > 0
                        ? `
                            <span class="quote-tag text-success">
                                Economia possível:
                                ${formatCurrency(
                                    possibleSaving
                                )}
                            </span>
                        `
                        : ""
                }
            </div>

            <div class="quote-details">
                ${sorted.map(quote => `
                    <div class="list-item">

                        <div class="list-item-main">

                            <div class="list-item-title">
                                ${escapeHtml(
                                    quote.store
                                )}
                            </div>

                            <div class="list-item-subtitle">
                                ${formatDate(
                                    quote.date
                                )}

                                ${
                                    quote.notes
                                        ? ` • ${escapeHtml(
                                            quote.notes
                                        )}`
                                        : ""
                                }
                            </div>

                        </div>

                        <div>
                            <strong>
                                ${formatCurrency(
                                    quote.price
                                )}
                            </strong>

                            <button
                                class="btn btn-small btn-danger"
                                onclick="deleteQuote('${quote.id}')"
                            >
                                Excluir
                            </button>
                        </div>

                    </div>
                `).join("")}
            </div>
        </div>
    `;
}


/* =========================================================
   EXCLUIR COTAÇÃO
   ========================================================= */

function deleteQuote(id) {
    const confirmed = confirm(
        "Deseja realmente excluir esta cotação?"
    );

    if (!confirmed) {
        return;
    }

    quotes =
        quotes.filter(
            quote => quote.id !== id
        );

    saveQuotes();

    renderQuotes();
    updateDashboard();

    showToast(
        "Cotação excluída.",
        "success"
    );
}


/* =========================================================
   CATEGORIAS
   ========================================================= */

function renderCategories() {
    const container =
        document.getElementById(
            "categoriesContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="categories-grid">

            ${Object.entries(categories)
                .map(([category, subcategories]) => `
                    <div class="category-card">

                        <div class="category-title">
                            ${escapeHtml(
                                category
                            )}
                        </div>

                        <div class="subcategory-list">

                            ${subcategories
                                .map(subcategory => `
                                    <div class="subcategory-item">
                                        <span>
                                            ${escapeHtml(
                                                subcategory
                                            )}
                                        </span>
                                    </div>
                                `)
                                .join("")}

                        </div>

                    </div>
                `)
                .join("")}

        </div>
    `;
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {
    const monthlyExpenses =
        getCurrentMonthExpenses();

    const totalSpent =
        monthlyExpenses.reduce(
            (sum, expense) =>
                sum + Number(expense.amount || 0),
            0
        );

    const balance =
        Number(appData.monthlyBalance) || 0;

    const available =
        Math.max(
            balance - totalSpent,
            0
        );

    const plannedQuotes =
        getPlannedQuotes();

    const plannedTotal =
        plannedQuotes.reduce(
            (sum, quote) =>
                sum + Number(quote.price || 0),
            0
        );

    const projected =
        Math.max(
            available - plannedTotal,
            0
        );

    updateElement(
        "totalExpenses",
        formatCurrency(totalSpent)
    );

    updateElement(
        "monthlyExpenses",
        formatCurrency(totalSpent)
    );

    updateElement(
        "quoteCount",
        String(quotes.length)
    );

    updateElement(
        "possibleSaving",
        formatCurrency(
            calculatePossibleSavings()
        )
    );

    updateElement(
        "dashboardBudget",
        formatCurrency(
            getRecommendedSpendingLimit()
        )
    );

    updateElement(
        "dashboardSpent",
        formatCurrency(totalSpent)
    );

    updateElement(
        "dashboardPlanned",
        formatCurrency(plannedTotal)
    );

    updateElement(
        "dashboardProjected",
        formatCurrency(projected)
    );

    updateElement(
        "summaryBalance",
        formatCurrency(balance)
    );

    updateElement(
        "summarySpent",
        formatCurrency(totalSpent)
    );

    updateElement(
        "summaryAvailable",
        formatCurrency(available)
    );

    updateElement(
        "summarySavings",
        formatCurrency(
            Math.max(
                balance - totalSpent,
                0
            )
        )
    );

    updateBudgetProgress(
        totalSpent
    );

    updateBudgetStatus(
        totalSpent,
        balance
    );

    renderRecentExpenses();
    renderCategorySummary();
    renderDashboardQuotes();
}


/* =========================================================
   SALDO E LIMITE DE GASTOS
   ========================================================= */

function setupBudgetControl() {
    const saveButton =
        document.getElementById(
            "saveBalance"
        );

    const clearButton =
        document.getElementById(
            "clearBalance"
        );

    const balanceInput =
        document.getElementById(
            "monthlyBalance"
        );

    if (saveButton) {
        saveButton.addEventListener(
            "click",
            saveMonthlyBalance
        );
    }

    if (clearButton) {
        clearButton.addEventListener(
            "click",
            clearMonthlyBalance
        );
    }

    if (balanceInput) {
        balanceInput.addEventListener(
            "blur",
            () => {
                formatInputCurrency(
                    balanceInput
                );
            }
        );
    }

    const planSelect =
        document.getElementById(
            "spendingPlan"
        );

    const customPercentage =
        document.getElementById(
            "customPercentage"
        );

    if (planSelect) {
        planSelect.addEventListener(
            "change",
            updateSpendingPlan
        );
    }

    if (customPercentage) {
        customPercentage.addEventListener(
            "input",
            updateSpendingPlan
        );
    }
}

function saveMonthlyBalance() {
    const input =
        document.getElementById(
            "monthlyBalance"
        );

    if (!input) {
        return;
    }

    const value =
        parseCurrency(input.value);

    if (value <= 0) {
        showToast(
            "Informe um saldo válido.",
            "warning"
        );

        return;
    }

    appData.monthlyBalance = value;

    saveData();

    updateDashboard();

    showToast(
        "Saldo disponível salvo!",
        "success"
    );
}

function clearMonthlyBalance() {
    appData.monthlyBalance = 0;

    saveData();

    const input =
        document.getElementById(
            "monthlyBalance"
        );

    if (input) {
        input.value = "";
    }

    updateDashboard();

    showToast(
        "Saldo disponível limpo.",
        "success"
    );
}

function updateSpendingPlan() {
    const select =
        document.getElementById(
            "spendingPlan"
        );

    const customInput =
        document.getElementById(
            "customPercentage"
        );

    if (!select) {
        return;
    }

    const mode = select.value;

    if (mode === "automatic") {
        appData.spendingPlan = {
            mode: "automatic",
            percentage: 50
        };
    }

    if (mode === "very-economic") {
        appData.spendingPlan = {
            mode: "very-economic",
            percentage: 40
        };
    }

    if (mode === "economic") {
        appData.spendingPlan = {
            mode: "economic",
            percentage: 50
        };
    }

    if (mode === "moderate") {
        appData.spendingPlan = {
            mode: "moderate",
            percentage: 60
        };
    }

    if (mode === "custom") {
        const percentage =
            Number(
                customInput?.value
            ) || 50;

        appData.spendingPlan = {
            mode: "custom",
            percentage: Math.min(
                Math.max(
                    percentage,
                    1
                ),
                100
            )
        };
    }

    saveData();

    updateDashboard();
}

function getRecommendedSpendingLimit() {
    const balance =
        Number(appData.monthlyBalance) || 0;

    if (balance <= 0) {
        return 0;
    }

    /*
     * Recomendação automática:
     * limite de gastos = 50% da renda/saldo.
     *
     * Os planos manuais podem alterar esse percentual.
     */

    const percentage =
        Number(
            appData.spendingPlan?.percentage
        ) || 50;

    return balance *
        (percentage / 100);
}


/* =========================================================
   PROGRESSO DO LIMITE
   ========================================================= */

function updateBudgetProgress(totalSpent) {
    const limit =
        getRecommendedSpendingLimit();

    const progress =
        document.getElementById(
            "budgetProgress"
        );

    const label =
        document.getElementById(
            "budgetProgressLabel"
        );

    const percent =
        document.getElementById(
            "budgetProgressPercent"
        );

    if (!progress) {
        return;
    }

    if (limit <= 0) {
        progress.style.width = "0%";

        if (label) {
            label.textContent =
                "Defina seu saldo disponível";
        }

        if (percent) {
            percent.textContent = "0%";
        }

        return;
    }

    const percentage =
        Math.round(
            (totalSpent / limit) *
            100
        );

    const visualPercentage =
        Math.min(
            Math.max(
                percentage,
                0
            ),
            100
        );

    progress.style.width =
        `${visualPercentage}%`;

    progress.classList.remove(
        "success",
        "warning",
        "danger"
    );

    if (percentage >= 100) {
        progress.classList.add(
            "danger"
        );
    } else if (percentage >= 80) {
        progress.classList.add(
            "warning"
        );
    } else {
        progress.classList.add(
            "success"
        );
    }

    if (label) {
        label.textContent =
            `${formatCurrency(totalSpent)} de ${formatCurrency(limit)}`;
    }

    if (percent) {
        percent.textContent =
            `${percentage}%`;
    }
}


/* =========================================================
   STATUS DO ORÇAMENTO
   ========================================================= */

function updateBudgetStatus(
    spent,
    balance
) {
    const text =
        document.getElementById(
            "budgetStatusText"
        );

    const badge =
        document.getElementById(
            "budgetStatusBadge"
        );

    if (!text && !badge) {
        return;
    }

    let status = "success";
    let message =
        "Seu orçamento está sob controle.";
    let badgeText =
        "Pode comprar";

    if (balance <= 0) {
        status = "warning";

        message =
            "Informe seu saldo disponível para calcular seu limite.";

        badgeText =
            "Aguardando saldo";
    } else {
        const limit =
            getRecommendedSpendingLimit();

        if (spent > limit) {
            status = "danger";

            message =
                "Você ultrapassou o limite de gastos recomendado.";

            badgeText =
                "Risco de perda";
        } else if (
            spent >= limit * 0.8
        ) {
            status = "warning";

            message =
                "Você está se aproximando do limite de gastos.";

            badgeText =
                "Cuidado";
        }
    }

    if (text) {
        text.textContent =
            message;

        text.className =
            `status-box ${status}`;
    }

    if (badge) {
        badge.textContent =
            badgeText;

        badge.className =
            `status-badge ${status}`;
    }
}


/* =========================================================
   DESPESAS DO MÊS
   ========================================================= */

function getCurrentMonthExpenses() {
    const now = new Date();

    return appData.expenses.filter(
        expense => {
            const date =
                new Date(expense.date);

            return (
                date.getMonth() ===
                    now.getMonth() &&
                date.getFullYear() ===
                    now.getFullYear()
            );
        }
    );
}


/* =========================================================
   COTAÇÕES PLANEJADAS
   ========================================================= */

function getPlannedQuotes() {
    /*
     * As cotações ficam disponíveis para
     * comparação, mas não são consideradas
     * automaticamente como despesas realizadas.
     *
     * Para o planejamento, usamos a melhor
     * cotação de cada produto.
     */

    const groups =
        groupQuotes(quotes);

    return groups.map(group => {
        const sorted =
            [...group.quotes].sort(
                (a, b) =>
                    a.price - b.price
            );

        return sorted[0];
    });
}


/* =========================================================
   ECONOMIA DAS COTAÇÕES
   ========================================================= */

function calculatePossibleSavings() {
    const groups =
        groupQuotes(quotes);

    return groups.reduce(
        (total, group) => {
            if (
                group.quotes.length < 2
            ) {
                return total;
            }

            const prices =
                group.quotes.map(
                    quote =>
                        Number(
                            quote.price
                        )
                );

            const cheapest =
                Math.min(...prices);

            const mostExpensive =
                Math.max(...prices);

            return (
                total +
                (
                    mostExpensive -
                    cheapest
                )
            );
        },
        0
    );
}


/* =========================================================
   DASHBOARD — DESPESAS RECENTES
   ========================================================= */

function renderRecentExpenses() {
    const container =
        document.getElementById(
            "recentExpenses"
        );

    if (!container) {
        return;
    }

    const recent =
        [...appData.expenses]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 5);

    if (!recent.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    💰
                </div>

                <div class="empty-state-title">
                    Nenhuma despesa registrada
                </div>

                <div class="empty-state-text">
                    Suas despesas recentes aparecerão aqui.
                </div>
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <div class="list">

            ${recent.map(expense => `
                <div class="list-item">

                    <div class="list-item-main">

                        <div class="list-item-title">
                            ${escapeHtml(
                                expense.description
                            )}
                        </div>

                        <div class="list-item-subtitle">
                            ${escapeHtml(
                                expense.category
                            )}
                            •
                            ${escapeHtml(
                                expense.subcategory
                            )}
                            •
                            ${formatDate(
                                expense.date
                            )}
                        </div>

                    </div>

                    <div class="list-item-value">
                        ${formatCurrency(
                            expense.amount
                        )}
                    </div>

                </div>
            `).join("")}

        </div>
    `;
}


/* =========================================================
   DASHBOARD — CATEGORIAS
   ========================================================= */

function renderCategorySummary() {
    const container =
        document.getElementById(
            "categorySummary"
        );

    if (!container) {
        return;
    }

    const expenses =
        getCurrentMonthExpenses();

    if (!expenses.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    📊
                </div>

                <div class="empty-state-title">
                    Sem dados ainda
                </div>

                <div class="empty-state-text">
                    Registre despesas para visualizar seus gastos por categoria.
                </div>
            </div>
        `;

        return;
    }

    const totals = {};

    expenses.forEach(expense => {
        const category =
            expense.category || "Outros";

        totals[category] =
            (totals[category] || 0) +
            Number(expense.amount || 0);
    });

    const sorted =
        Object.entries(totals)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );

    const total =
        sorted.reduce(
            (sum, item) =>
                sum + item[1],
            0
        );

    container.innerHTML = `
        <div class="list">

            ${sorted.map(
                ([category, amount]) => {

                    const percentage =
                        total > 0
                            ? Math.round(
                                (amount / total) *
                                100
                            )
                            : 0;

                    return `
                        <div class="list-item">

                            <div class="list-item-main">

                                <div class="list-item-title">
                                    ${escapeHtml(
                                        category
                                    )}
                                </div>

                                <div class="list-item-subtitle">
                                    ${percentage}% dos gastos
                                </div>

                            </div>

                            <div class="list-item-value">
                                ${formatCurrency(
                                    amount
                                )}
                            </div>

                        </div>
                    `;
                }
            ).join("")}

        </div>
    `;
}


/* =========================================================
   DASHBOARD — COTAÇÕES
   ========================================================= */

function renderDashboardQuotes() {
    const container =
        document.getElementById(
            "dashboardQuotes"
        );

    if (!container) {
        return;
    }

    const latest =
        [...quotes]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 5);

    if (!latest.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    🛒
                </div>

                <div class="empty-state-title">
                    Nenhuma cotação registrada
                </div>

                <div class="empty-state-text">
                    Adicione produtos para comparar preços.
                </div>
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <div class="list">

            ${latest.map(quote => `
                <div class="list-item">

                    <div class="list-item-main">

                        <div class="list-item-title">
                            ${escapeHtml(
                                quote.product
                            )}
                        </div>

                        <div class="list-item-subtitle">
                            ${escapeHtml(
                                quote.store
                            )}
                            •
                            ${formatDate(
                                quote.date
                            )}
                        </div>

                    </div>

                    <div class="list-item-value">
                        ${formatCurrency(
                            quote.price
                        )}
                    </div>

                </div>
            `).join("")}

        </div>
    `;
}


/* =========================================================
   MODAIS
   ========================================================= */

function setupModalEvents() {
    document.addEventListener(
        "click",
        event => {

            const openButton =
                event.target.closest(
                    "[data-modal]"
                );

            if (openButton) {
                openModal(
                    openButton.dataset.modal
                );
            }

            const closeButton =
                event.target.closest(
                    "[data-close-modal]"
                );

            if (closeButton) {
                closeModal(
                    closeButton.dataset
                        .closeModal
                );
            }

            if (
                event.target.classList.contains(
                    "modal"
                )
            ) {
                event.target.classList.remove(
                    "active"
                );
            }
        }
    );

    document.addEventListener(
        "keydown",
        event => {
            if (event.key === "Escape") {
                document
                    .querySelectorAll(
                        ".modal.active"
                    )
                    .forEach(modal => {
                        modal.classList.remove(
                            "active"
                        );
                    });
            }
        }
    );
}

function openModal(id) {
    const modal =
        document.getElementById(id);

    if (!modal) {
        return;
    }

    modal.classList.add("active");

    const firstInput =
        modal.querySelector(
            "input, select, textarea"
        );

    if (firstInput) {
        setTimeout(
            () => firstInput.focus(),
            100
        );
    }
}

function closeModal(id) {
    const modal =
        document.getElementById(id);

    if (modal) {
        modal.classList.remove(
            "active"
        );
    }
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message,
    type = "success"
) {
    let container =
        document.querySelector(
            ".toast-container"
        );

    if (!container) {
        container =
            document.createElement("div");

        container.className =
            "toast-container";

        document.body.appendChild(
            container
        );
    }

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}`;

    toast.textContent =
        message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform =
            "translateX(15px)";

        setTimeout(() => {
            toast.remove();
        }, 250);

    }, 3000);
}


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function generateId() {
    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );
}

function formatDate(dateString) {
    if (!dateString) {
        return "-";
    }

    const date =
        new Date(
            `${dateString}T00:00:00`
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "-";
    }

    return date.toLocaleDateString(
        "pt-BR"
    );
}

function updateElement(
    id,
    value
) {
    const element =
        document.getElementById(id);

    if (element) {
        element.textContent =
            value;
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   DATA PADRÃO PARA CAMPOS DE DATA
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        const dateFields =
            document.querySelectorAll(
                'input[type="date"]'
            );

        dateFields.forEach(field => {
            if (!field.value) {
                field.value = today;
            }
        });

    }
);