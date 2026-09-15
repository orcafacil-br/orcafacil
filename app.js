/* =====================================================
   ORÇAFÁCIL
   Aplicação principal
===================================================== */


/* =====================================================
   CONFIGURAÇÃO
===================================================== */

const STORAGE_KEY = "orcafacil_data_v3";
const QUOTES_STORAGE_KEY = "orcafacil_quotes_v2";
const THEME_KEY = "orcafacil_theme";

let appData = {
    expenses: [],
    budgets: [],
    monthlyBalance: 0
};

let quotes = [];

let editingExpenseId = null;
let editingQuoteId = null;


/* =====================================================
   CATEGORIAS
===================================================== */

const categories = {

    "Compras": [
        "Alimentos",
        "Higiene pessoal",
        "Limpeza",
        "Fármacos",
        "Bebidas",
        "Hortifruti",
        "Carnes",
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

    "Streaming": [
        "Netflix",
        "Amazon Prime",
        "Disney+",
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
        "Manutenção",
        "Estacionamento",
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
        "Outros"
    ],

    "Serviços": [
        "Manutenção",
        "Profissionais",
        "Assinaturas",
        "Serviços digitais",
        "Outros"
    ],

    "Outros": [
        "Outros"
    ]
};


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {

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

    renderCategories();
    renderExpenses();
    renderQuotes();

    updateDashboard();
}


/* =====================================================
   STORAGE
===================================================== */

function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return;
        }

        const parsed = JSON.parse(saved);

        appData = {
            expenses:
                Array.isArray(parsed.expenses)
                    ? parsed.expenses
                    : [],

            budgets:
                Array.isArray(parsed.budgets)
                    ? parsed.budgets
                    : [],

            monthlyBalance:
                Number(parsed.monthlyBalance || 0)
        };

    } catch (error) {

        console.error(
            "Erro ao carregar dados:",
            error
        );

        appData = {
            expenses: [],
            budgets: [],
            monthlyBalance: 0
        };
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

        const saved =
            localStorage.getItem(QUOTES_STORAGE_KEY);

        if (!saved) {
            quotes = [];
            return;
        }

        const parsed = JSON.parse(saved);

        quotes =
            Array.isArray(parsed)
                ? parsed
                : [];

    } catch (error) {

        console.error(
            "Erro ao carregar cotações:",
            error
        );

        quotes = [];
    }
}


function saveQuotes() {

    localStorage.setItem(
        QUOTES_STORAGE_KEY,
        JSON.stringify(quotes)
    );
}


/* =====================================================
   NAVEGAÇÃO
===================================================== */

function setupNavigation() {

    document
        .querySelectorAll(".menu-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    showPage(
                        item.dataset.page
                    );

                }
            );

        });
}


function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

        });

    const page =
        document.getElementById(pageId);

    if (!page) {
        return;
    }

    page.classList.add("active");

    document
        .querySelectorAll(".menu-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.page === pageId
            );

        });

    const sidebar =
        document.querySelector(".sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }
}


/* =====================================================
   MENU MOBILE
===================================================== */

function setupMobileMenu() {

    const button =
        document.getElementById(
            "mobileMenuButton"
        );

    const sidebar =
        document.querySelector(".sidebar");

    if (!button || !sidebar) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

        }
    );
}


/* =====================================================
   TEMA
===================================================== */

function loadTheme() {

    const theme =
        localStorage.getItem(THEME_KEY);

    if (theme === "dark") {
        document.body.classList.add("dark");
    }

    updateThemeButton();
}


function setupTheme() {

    const button =
        document.getElementById(
            "themeToggle"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark"
            );

            const dark =
                document.body.classList.contains(
                    "dark"
                );

            localStorage.setItem(
                THEME_KEY,
                dark ? "dark" : "light"
            );

            updateThemeButton();

        }
    );
}


function updateThemeButton() {

    const icon =
        document.getElementById(
            "themeIcon"
        );

    const text =
        document.getElementById(
            "themeText"
        );

    const dark =
        document.body.classList.contains(
            "dark"
        );

    if (icon) {
        icon.textContent =
            dark ? "☀️" : "🌙";
    }

    if (text) {
        text.textContent =
            dark
                ? "Modo claro"
                : "Modo escuro";
    }
}


/* =====================================================
   CATEGORIAS
===================================================== */

function populateCategorySelects() {

    const expenseCategory =
        document.getElementById(
            "expenseCategory"
        );

    const expenseFilter =
        document.getElementById(
            "expenseCategoryFilter"
        );

    if (expenseCategory) {

        expenseCategory.innerHTML =
            `<option value="">Selecione</option>`;

        Object.keys(categories)
            .forEach(category => {

                expenseCategory.innerHTML += `
                    <option value="${escapeHTML(category)}">
                        ${escapeHTML(category)}
                    </option>
                `;

            });
    }

    if (expenseFilter) {

        expenseFilter.innerHTML =
            `<option value="">Todas</option>`;

        Object.keys(categories)
            .forEach(category => {

                expenseFilter.innerHTML += `
                    <option value="${escapeHTML(category)}">
                        ${escapeHTML(category)}
                    </option>
                `;

            });
    }
}


function populateQuoteCategorySelect() {

    const quoteCategory =
        document.getElementById(
            "quoteCategory"
        );

    const quoteFilter =
        document.getElementById(
            "quoteCategoryFilter"
        );

    if (quoteCategory) {

        quoteCategory.innerHTML =
            `<option value="">Selecione</option>`;

        Object.keys(categories)
            .forEach(category => {

                quoteCategory.innerHTML += `
                    <option value="${escapeHTML(category)}">
                        ${escapeHTML(category)}
                    </option>
                `;

            });
    }

    if (quoteFilter) {

        quoteFilter.innerHTML =
            `<option value="">Todas</option>`;

        Object.keys(categories)
            .forEach(category => {

                quoteFilter.innerHTML += `
                    <option value="${escapeHTML(category)}">
                        ${escapeHTML(category)}
                    </option>
                `;

            });
    }
}


function updateSubcategories(
    categoryId,
    subcategoryId
) {

    const category =
        document.getElementById(categoryId);

    const subcategory =
        document.getElementById(subcategoryId);

    if (!category || !subcategory) {
        return;
    }

    const selected =
        category.value;

    subcategory.innerHTML =
        `<option value="">Selecione</option>`;

    if (!selected || !categories[selected]) {
        return;
    }

    categories[selected]
        .forEach(item => {

            subcategory.innerHTML += `
                <option value="${escapeHTML(item)}">
                    ${escapeHTML(item)}
                </option>
            `;

        });
}


/* =====================================================
   DESPESAS — FORMULÁRIO
===================================================== */

function setupExpenseForm() {

    const category =
        document.getElementById(
            "expenseCategory"
        );

    const form =
        document.getElementById(
            "expenseForm"
        );

    const amount =
        document.getElementById(
            "expenseAmount"
        );

    if (category) {

        category.addEventListener(
            "change",
            () => {

                updateSubcategories(
                    "expenseCategory",
                    "expenseSubcategory"
                );

            }
        );
    }

    if (amount) {

        amount.addEventListener(
            "input",
            () => moneyMask(amount)
        );
    }

    if (form) {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                saveExpense();

            }
        );
    }
}


function openExpenseModal(id = null) {

    const modal =
        document.getElementById(
            "expenseModal"
        );

    const form =
        document.getElementById(
            "expenseForm"
        );

    if (!modal || !form) {
        return;
    }

    editingExpenseId = id;

    form.reset();

    document.getElementById(
        "expenseId"
    ).value = "";

    document.getElementById(
        "expenseDate"
    ).value = getTodayDate();

    updateSubcategories(
        "expenseCategory",
        "expenseSubcategory"
    );

    if (id) {

        const expense =
            appData.expenses.find(
                item => item.id === id
            );

        if (!expense) {
            return;
        }

        document.getElementById(
            "expenseModalTitle"
        ).textContent =
            "Editar despesa";

        document.getElementById(
            "expenseId"
        ).value =
            expense.id;

        document.getElementById(
            "expenseDescription"
        ).value =
            expense.description;

        document.getElementById(
            "expenseCategory"
        ).value =
            expense.category;

        updateSubcategories(
            "expenseCategory",
            "expenseSubcategory"
        );

        document.getElementById(
            "expenseSubcategory"
        ).value =
            expense.subcategory;

        document.getElementById(
            "expenseAmount"
        ).value =
            formatCurrency(
                Number(expense.amount)
            );

        document.getElementById(
            "expenseDate"
        ).value =
            expense.date;

        document.getElementById(
            "expenseNotes"
        ).value =
            expense.notes || "";

    } else {

        document.getElementById(
            "expenseModalTitle"
        ).textContent =
            "Nova despesa";
    }

    modal.classList.add("show");
}


function closeExpenseModal() {

    const modal =
        document.getElementById(
            "expenseModal"
        );

    if (modal) {
        modal.classList.remove("show");
    }

    editingExpenseId = null;
}


function saveExpense() {

    const description =
        document.getElementById(
            "expenseDescription"
        ).value.trim();

    const category =
        document.getElementById(
            "expenseCategory"
        ).value;

    const subcategory =
        document.getElementById(
            "expenseSubcategory"
        ).value;

    const amount =
        parseMoney(
            document.getElementById(
                "expenseAmount"
            ).value
        );

    const date =
        document.getElementById(
            "expenseDate"
        ).value;

    const notes =
        document.getElementById(
            "expenseNotes"
        ).value.trim();

    if (
        !description ||
        !category ||
        !subcategory ||
        amount <= 0 ||
        !date
    ) {

        showToast(
            "Preencha todos os campos obrigatórios."
        );

        return;
    }

    if (editingExpenseId) {

        const index =
            appData.expenses.findIndex(
                item =>
                    item.id === editingExpenseId
            );

        if (index !== -1) {

            appData.expenses[index] = {

                ...appData.expenses[index],

                description,
                category,
                subcategory,
                amount,
                date,
                notes

            };
        }

        showToast(
            "Despesa atualizada!"
        );

    } else {

        appData.expenses.unshift({

            id: generateId(),

            description,
            category,
            subcategory,
            amount,
            date,
            notes

        });

        showToast(
            "Despesa cadastrada!"
        );
    }

    saveData();

    closeExpenseModal();

    renderExpenses();

    updateDashboard();
}


/* =====================================================
   DESPESAS — LISTAGEM
===================================================== */

function renderExpenses() {

    const container =
        document.getElementById(
            "expensesTableBody"
        );

    const empty =
        document.getElementById(
            "expensesEmpty"
        );

    if (!container || !empty) {
        return;
    }

    const search =
        (
            document.getElementById(
                "expenseSearch"
            )?.value || ""
        )
            .trim()
            .toLowerCase();

    const category =
        document.getElementById(
            "expenseCategoryFilter"
        )?.value || "";

    const month =
        document.getElementById(
            "expenseMonthFilter"
        )?.value || "";

    let filtered =
        [...appData.expenses];

    if (search) {

        filtered =
            filtered.filter(
                expense => {

                    const text = [
                        expense.description,
                        expense.category,
                        expense.subcategory,
                        expense.notes
                    ]
                        .join(" ")
                        .toLowerCase();

                    return text.includes(
                        search
                    );
                }
            );
    }

    if (category) {

        filtered =
            filtered.filter(
                expense =>
                    expense.category ===
                    category
            );
    }

    if (month) {

        filtered =
            filtered.filter(
                expense =>
                    expense.date &&
                    expense.date.startsWith(
                        month
                    )
            );
    }

    filtered.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );

    if (!filtered.length) {

        container.innerHTML = "";

        empty.style.display =
            "block";

        return;
    }

    empty.style.display =
        "none";

    container.innerHTML =
        filtered
            .map(expense => `

                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(
                                expense.description
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            expense.category
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            expense.subcategory
                        )}
                    </td>

                    <td class="table-value">
                        ${formatCurrency(
                            expense.amount
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            expense.date
                        )}
                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                type="button"
                                class="action-button"
                                title="Editar"
                                onclick="openExpenseModal('${expense.id}')">

                                ✏️

                            </button>

                            <button
                                type="button"
                                class="action-button delete"
                                title="Excluir"
                                onclick="deleteExpense('${expense.id}')">

                                🗑️

                            </button>

                        </div>

                    </td>

                </tr>

            `)
            .join("");
}


function deleteExpense(id) {

    const expense =
        appData.expenses.find(
            item => item.id === id
        );

    if (!expense) {
        return;
    }

    const confirmed =
        confirm(
            `Deseja excluir a despesa "${expense.description}"?`
        );

    if (!confirmed) {
        return;
    }

    appData.expenses =
        appData.expenses.filter(
            item => item.id !== id
        );

    saveData();

    renderExpenses();

    updateDashboard();

    showToast(
        "Despesa excluída."
    );
}


/* =====================================================
   COTAÇÕES — FORMULÁRIO
===================================================== */

function setupQuoteForm() {

    const category =
        document.getElementById(
            "quoteCategory"
        );

    const price =
        document.getElementById(
            "quotePrice"
        );

    const form =
        document.getElementById(
            "quoteForm"
        );

    if (category) {

        category.addEventListener(
            "change",
            () => {

                updateSubcategories(
                    "quoteCategory",
                    "quoteSubcategory"
                );

            }
        );
    }

    if (price) {

        price.addEventListener(
            "input",
            () => moneyMask(price)
        );
    }

    if (form) {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                saveQuote();

            }
        );
    }
}


function openQuoteModal(id = null) {

    const modal =
        document.getElementById(
            "quoteModal"
        );

    const form =
        document.getElementById(
            "quoteForm"
        );

    if (!modal || !form) {
        return;
    }

    editingQuoteId = id;

    form.reset();

    document.getElementById(
        "quoteId"
    ).value = "";

    document.getElementById(
        "quoteDate"
    ).value = getTodayDate();

    updateSubcategories(
        "quoteCategory",
        "quoteSubcategory"
    );

    if (id) {

        const quote =
            quotes.find(
                item => item.id === id
            );

        if (!quote) {
            return;
        }

        document.getElementById(
            "quoteModalTitle"
        ).textContent =
            "Editar cotação";

        document.getElementById(
            "quoteId"
        ).value =
            quote.id;

        document.getElementById(
            "quoteProduct"
        ).value =
            quote.product;

        document.getElementById(
            "quoteCategory"
        ).value =
            quote.category;

        updateSubcategories(
            "quoteCategory",
            "quoteSubcategory"
        );

        document.getElementById(
            "quoteSubcategory"
        ).value =
            quote.subcategory;

        document.getElementById(
            "quoteStore"
        ).value =
            quote.store;

        document.getElementById(
            "quotePrice"
        ).value =
            formatCurrency(
                Number(quote.price)
            );

        document.getElementById(
            "quoteDate"
        ).value =
            quote.date;

        document.getElementById(
            "quoteNotes"
        ).value =
            quote.notes || "";

    } else {

        document.getElementById(
            "quoteModalTitle"
        ).textContent =
            "Nova cotação";
    }

    modal.classList.add("show");
}


function closeQuoteModal() {

    const modal =
        document.getElementById(
            "quoteModal"
        );

    if (modal) {
        modal.classList.remove("show");
    }

    editingQuoteId = null;
}


function saveQuote() {

    const product =
        document.getElementById(
            "quoteProduct"
        ).value.trim();

    const category =
        document.getElementById(
            "quoteCategory"
        ).value;

    const subcategory =
        document.getElementById(
            "quoteSubcategory"
        ).value;

    const store =
        document.getElementById(
            "quoteStore"
        ).value.trim();

    const price =
        parseMoney(
            document.getElementById(
                "quotePrice"
            ).value
        );

    const date =
        document.getElementById(
            "quoteDate"
        ).value;

    const notes =
        document.getElementById(
            "quoteNotes"
        ).value.trim();

    if (
        !product ||
        !category ||
        !subcategory ||
        !store ||
        price <= 0 ||
        !date
    ) {

        showToast(
            "Preencha todos os campos obrigatórios."
        );

        return;
    }

    if (editingQuoteId) {

        const index =
            quotes.findIndex(
                item =>
                    item.id === editingQuoteId
            );

        if (index !== -1) {

            quotes[index] = {

                ...quotes[index],

                product,
                category,
                subcategory,
                store,
                price,
                date,
                notes

            };
        }

        showToast(
            "Cotação atualizada!"
        );

    } else {

        quotes.unshift({

            id: generateId(),

            product,
            category,
            subcategory,
            store,
            price,
            date,
            notes

        });

        showToast(
            "Cotação cadastrada!"
        );
    }

    saveQuotes();

    closeQuoteModal();

    renderQuotes();

    updateDashboard();
}


/* =====================================================
   COTAÇÕES — LISTAGEM
===================================================== */

function renderQuotes() {

    const container =
        document.getElementById(
            "quotesContainer"
        );

    const empty =
        document.getElementById(
            "quotesEmpty"
        );

    if (!container || !empty) {
        return;
    }

    const search =
        (
            document.getElementById(
                "quoteSearch"
            )?.value || ""
        )
            .trim()
            .toLowerCase();

    const category =
        document.getElementById(
            "quoteCategoryFilter"
        )?.value || "";

    let filtered =
        [...quotes];

    if (search) {

        filtered =
            filtered.filter(
                quote => {

                    const text = [
                        quote.product,
                        quote.store,
                        quote.category,
                        quote.subcategory,
                        quote.notes
                    ]
                        .join(" ")
                        .toLowerCase();

                    return text.includes(
                        search
                    );
                }
            );
    }

    if (category) {

        filtered =
            filtered.filter(
                quote =>
                    quote.category ===
                    category
            );
    }

    if (!filtered.length) {

        container.innerHTML = "";

        empty.style.display =
            "block";

        return;
    }

    empty.style.display =
        "none";

    const grouped = {};

    filtered.forEach(quote => {

        const key = [
            quote.product || "",
            quote.category || "",
            quote.subcategory || ""
        ]
            .map(
                value =>
                    value
                        .trim()
                        .toLowerCase()
            )
            .join("|");

        if (!grouped[key]) {
            grouped[key] = [];
        }

        grouped[key].push(quote);
    });

    container.innerHTML = "";

    Object.values(grouped)
        .forEach(productQuotes => {

            productQuotes.sort(
                (a, b) =>
                    Number(a.price) -
                    Number(b.price)
            );

            const cheapest =
                productQuotes[0];

            const mostExpensive =
                productQuotes[
                    productQuotes.length - 1
                ];

            const saving =
                Number(
                    mostExpensive.price
                ) -
                Number(
                    cheapest.price
                );

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "quote-card";

            card.innerHTML = `

                <div class="quote-card-header">

                    <div>

                        <h3>
                            ${escapeHTML(
                                cheapest.product
                            )}
                        </h3>

                        <span>
                            ${escapeHTML(
                                cheapest.category
                            )}
                            •
                            ${escapeHTML(
                                cheapest.subcategory
                            )}
                        </span>

                    </div>

                    ${
                        saving > 0
                            ? `
                                <div class="saving-badge">

                                    Economia possível:
                                    ${formatCurrency(
                                        saving
                                    )}

                                </div>
                            `
                            : ""
                    }

                </div>


                <div class="quote-prices">

                    ${productQuotes
                        .map(
                            (quote, index) => `

                            <div class="
                                quote-price-row
                                ${
                                    index === 0
                                        ? "cheapest"
                                        : ""
                                }
                            ">

                                <div class="quote-store">

                                    <strong>
                                        ${escapeHTML(
                                            quote.store
                                        )}
                                    </strong>

                                    <small>
                                        ${formatDate(
                                            quote.date
                                        )}
                                    </small>

                                </div>


                                <div class="quote-value">

                                    <strong>
                                        ${formatCurrency(
                                            quote.price
                                        )}
                                    </strong>

                                    ${
                                        index === 0
                                            ? `
                                                <span class="winner-badge">
                                                    🏆 Mais barato
                                                </span>
                                            `
                                            : ""
                                    }

                                </div>


                                <div class="action-buttons">

                                    <button
                                        type="button"
                                        class="action-button"
                                        title="Mais detalhes"
                                        aria-label="Mais detalhes"
                                        onclick="toggleQuoteDetails('${quote.id}')">

                                        ⓘ

                                    </button>

                                    <button
                                        type="button"
                                        class="action-button"
                                        title="Editar"
                                        onclick="openQuoteModal('${quote.id}')">

                                        ✏️

                                    </button>

                                    <button
                                        type="button"
                                        class="action-button delete"
                                        title="Excluir"
                                        onclick="deleteQuote('${quote.id}')">

                                        🗑️

                                    </button>

                                </div>

                            </div>


                            <div
                                id="quote-details-${quote.id}"
                                class="quote-details"
                                hidden>

                                <strong>
                                    Observação
                                </strong>

                                <p>
                                    ${
                                        quote.notes
                                            ? escapeHTML(
                                                quote.notes
                                            )
                                            : "Nenhuma observação cadastrada."
                                    }
                                </p>

                            </div>

                        `
                        )
                        .join("")}

                </div>

            `;

            container.appendChild(
                card
            );

        });
}


function toggleQuoteDetails(id) {

    const details =
        document.getElementById(
            `quote-details-${id}`
        );

    if (!details) {
        return;
    }

    details.hidden =
        !details.hidden;
}


/* =====================================================
   COTAÇÕES — EXCLUIR
===================================================== */

function deleteQuote(id) {

    const quote =
        quotes.find(
            item => item.id === id
        );

    if (!quote) {
        return;
    }

    const confirmed =
        confirm(
            `Deseja excluir a cotação de "${quote.product}" na loja "${quote.store}"?`
        );

    if (!confirmed) {
        return;
    }

    quotes =
        quotes.filter(
            item => item.id !== id
        );

    saveQuotes();

    renderQuotes();

    updateDashboard();

    showToast(
        "Cotação excluída."
    );
}


/* =====================================================
   ECONOMIA POSSÍVEL
===================================================== */

function calculatePossibleSavings() {

    const grouped = {};

    quotes.forEach(quote => {

        const key = [
            quote.product || "",
            quote.category || "",
            quote.subcategory || ""
        ]
            .map(
                value =>
                    value
                        .trim()
                        .toLowerCase()
            )
            .join("|");

        if (!grouped[key]) {
            grouped[key] = [];
        }

        grouped[key].push(
            Number(quote.price || 0)
        );
    });

    let totalSaving = 0;

    Object.values(grouped)
        .forEach(prices => {

            if (prices.length < 2) {
                return;
            }

            const cheapest =
                Math.min(
                    ...prices
                );

            const mostExpensive =
                Math.max(
                    ...prices
                );

            totalSaving +=
                mostExpensive -
                cheapest;
        });

    return totalSaving;
}


/* =====================================================
   PLANEJAMENTO DO MÊS
===================================================== */

function setupBudgetControl() {

    const input =
        document.getElementById(
            "monthlyBalance"
        );

    const button =
        document.getElementById(
            "saveMonthlyBalance"
        );

    if (!input || !button) {
        return;
    }

    if (appData.monthlyBalance > 0) {

        input.value =
            formatCurrency(
                appData.monthlyBalance
            );
    }

    input.addEventListener(
        "input",
        () => moneyMask(input)
    );

    button.addEventListener(
        "click",
        saveMonthlyBalance
    );
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
        parseMoney(
            input.value
        );

    if (value <= 0) {

        showToast(
            "Informe um salário ou saldo disponível maior que zero."
        );

        return;
    }

    appData.monthlyBalance =
        value;

    saveData();

    updateDashboard();

    showToast(
        "Saldo disponível atualizado!"
    );
}


/* =====================================================
   COTAÇÕES DO MÊS
===================================================== */

function getMonthlyQuotes() {

    const currentMonth =
        getCurrentMonth();

    return quotes.filter(
        quote =>
            quote.date &&
            quote.date.startsWith(
                currentMonth
            )
    );
}


/*
    Para o planejamento:
    se houver várias lojas para o mesmo produto,
    somente a opção MAIS BARATA entra no orçamento.
*/

function getPlannedQuotes() {

    const grouped = {};

    getMonthlyQuotes()
        .forEach(quote => {

            const key = [
                quote.product || "",
                quote.category || "",
                quote.subcategory || ""
            ]
                .map(
                    value =>
                        value
                            .trim()
                            .toLowerCase()
                )
                .join("|");

            if (!grouped[key]) {
                grouped[key] = [];
            }

            grouped[key].push(
                quote
            );
        });


    return Object.values(grouped)

        .map(items => {

            const sorted =
                [...items].sort(
                    (a, b) =>
                        Number(a.price) -
                        Number(b.price)
                );

            const cheapest =
                sorted[0];

            const mostExpensive =
                sorted[
                    sorted.length - 1
                ];

            return {

                product:
                    cheapest.product,

                category:
                    cheapest.category,

                subcategory:
                    cheapest.subcategory,

                cheapest,

                alternatives:
                    sorted.length,

                saving:
                    Number(
                        mostExpensive.price
                    ) -
                    Number(
                        cheapest.price
                    )

            };

        })

        .sort(
            (a, b) =>
                Number(
                    b.cheapest.price
                ) -
                Number(
                    a.cheapest.price
                )
        );
}


/* =====================================================
   STATUS DA COTAÇÃO
===================================================== */

function getQuoteStatus(
    price,
    availableBalance
) {

    if (
        !appData.monthlyBalance ||
        appData.monthlyBalance <= 0
    ) {

        return {

            className: "neutral",

            label: "Defina seu saldo",

            description:
                "Informe seu saldo no Dashboard."

        };
    }


    if (
        price >
        availableBalance
    ) {

        return {

            className: "danger",

            label: "Risco de perda",

            description:
                "Essa compra ultrapassa o saldo disponível após as despesas."

        };
    }


    const percentage =
        availableBalance > 0
            ? (
                price /
                availableBalance
            ) * 100
            : 100;


    if (percentage >= 10) {

        return {

            className: "warning",

            label: "Cuidado",

            description:
                "Essa compra consome uma parcela relevante do saldo disponível."

        };
    }


    return {

        className: "success",

        label: "Pode comprar",

        description:
            "O valor cabe no saldo disponível atual."

    };
}


/* =====================================================
   DASHBOARD — COTAÇÕES
===================================================== */

function renderDashboardQuotes(
    availableBalance
) {

    const container =
        document.getElementById(
            "dashboardQuotes"
        );

    if (!container) {
        return;
    }

    const planned =
        getPlannedQuotes();


    if (!planned.length) {

        container.innerHTML = `

            <div class="
                empty-state
                compact-empty
            ">

                <div class="empty-icon">
                    🛒
                </div>

                <strong>
                    Nenhuma cotação para este mês
                </strong>

                <p>
                    As cotações salvas com a data
                    deste mês aparecerão aqui e
                    serão consideradas no planejamento.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        planned
            .map(item => {

                const price =
                    Number(
                        item.cheapest.price || 0
                    );

                const status =
                    getQuoteStatus(
                        price,
                        availableBalance
                    );

                return `

                    <div class="dashboard-quote-item">

                        <div class="dashboard-quote-main">

                            <strong>
                                ${escapeHTML(
                                    item.product
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    item.cheapest.store
                                )}
                                •
                                ${formatCurrency(
                                    price
                                )}
                            </span>

                        </div>


                        <div class="
                            dashboard-quote-status
                            ${status.className}
                        ">

                            <strong>
                                ${status.label}
                            </strong>

                            <small>
                                ${status.description}
                            </small>

                        </div>

                    </div>

                `;

            })
            .join("");
}


/* =====================================================
   DASHBOARD — PLANEJAMENTO
===================================================== */

function updateBudgetPlanning(
    monthlyExpenses
) {

    const monthlyBalance =
        Number(
            appData.monthlyBalance || 0
        );

    /*
        O saldo após despesas representa
        quanto ainda existe de dinheiro.
    */

    const availableBalance =
        monthlyBalance -
        monthlyExpenses;


    const planned =
        getPlannedQuotes();


    const plannedTotal =
        planned.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.cheapest.price || 0
                ),
            0
        );


    /*
        Saldo projetado considera:
        salário/saldo
        - despesas
        - compras planejadas
    */

    const projectedBalance =
        monthlyBalance -
        monthlyExpenses -
        plannedTotal;


    const monthlyLimit =
        document.getElementById(
            "monthlyLimit"
        );

    const availableElement =
        document.getElementById(
            "availableAfterExpenses"
        );

    const plannedElement =
        document.getElementById(
            "plannedQuotesTotal"
        );

    const projectedElement =
        document.getElementById(
            "projectedBalance"
        );

    const statusElement =
        document.getElementById(
            "budgetStatus"
        );


    if (monthlyLimit) {

        monthlyLimit.textContent =
            formatCurrency(
                monthlyBalance
            );
    }


    if (availableElement) {

        availableElement.textContent =
            formatCurrency(
                availableBalance
            );
    }


    if (plannedElement) {

        plannedElement.textContent =
            formatCurrency(
                plannedTotal
            );
    }


    if (projectedElement) {

        projectedElement.textContent =
            formatCurrency(
                projectedBalance
            );

        projectedElement.className =
            projectedBalance < 0
                ? "danger-value"
                : "";
    }


    if (statusElement) {

        statusElement.className =
            "budget-status";


        if (monthlyBalance <= 0) {

            statusElement.classList.add(
                "neutral"
            );

            statusElement.textContent =
                "Informe seu salário ou saldo disponível para começar o planejamento.";

        } else if (
            projectedBalance < 0
        ) {

            statusElement.classList.add(
                "danger"
            );

            statusElement.textContent =
                `Atenção: despesas + cotações mais baratas ultrapassam seu saldo em ${formatCurrency(
                    Math.abs(
                        projectedBalance
                    )
                )}.`;

        } else if (
            projectedBalance <
            monthlyBalance * 0.10
        ) {

            statusElement.classList.add(
                "warning"
            );

            statusElement.textContent =
                "Cuidado: depois das despesas e das cotações planejadas, sobra menos de 10% do saldo mensal.";

        } else {

            statusElement.classList.add(
                "success"
            );

            statusElement.textContent =
                `Planejamento dentro do saldo: ainda restariam ${formatCurrency(
                    projectedBalance
                )}.`;
        }
    }


    /*
        Para os alertas individuais,
        usamos o saldo depois das despesas,
        antes das compras planejadas.
    */

    renderDashboardQuotes(
        availableBalance
    );
}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const totalExpenses =
        appData.expenses.reduce(
            (sum, expense) =>
                sum +
                Number(
                    expense.amount || 0
                ),
            0
        );


    const currentMonth =
        getCurrentMonth();


    const monthlyExpenses =
        appData.expenses
            .filter(
                expense =>
                    expense.date &&
                    expense.date.startsWith(
                        currentMonth
                    )
            )
            .reduce(
                (sum, expense) =>
                    sum +
                    Number(
                        expense.amount || 0
                    ),
                0
            );


    const totalElement =
        document.getElementById(
            "totalExpenses"
        );

    if (totalElement) {

        totalElement.textContent =
            formatCurrency(
                totalExpenses
            );
    }


    const monthlyElement =
        document.getElementById(
            "monthlyExpenses"
        );

    if (monthlyElement) {

        monthlyElement.textContent =
            formatCurrency(
                monthlyExpenses
            );
    }


    const quoteCount =
        document.getElementById(
            "quoteCount"
        );

    if (quoteCount) {

        quoteCount.textContent =
            quotes.length;
    }


    const saving =
        document.getElementById(
            "possibleSaving"
        );

    if (saving) {

        saving.textContent =
            formatCurrency(
                calculatePossibleSavings()
            );
    }


    updateBudgetPlanning(
        monthlyExpenses
    );

    renderRecentExpenses();

    renderCategorySummary();
}


/* =====================================================
   DASHBOARD — ÚLTIMAS DESPESAS
===================================================== */

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

                <div class="empty-icon">
                    💸
                </div>

                <strong>
                    Nenhuma despesa ainda
                </strong>

                <p>
                    Suas despesas recentes
                    aparecerão aqui.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        recent
            .map(expense => `

                <div class="recent-item">

                    <div class="recent-main">

                        <strong>
                            ${escapeHTML(
                                expense.description
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                expense.category
                            )}
                            •
                            ${formatDate(
                                expense.date
                            )}
                        </span>

                    </div>

                    <div class="recent-value">

                        ${formatCurrency(
                            expense.amount
                        )}

                    </div>

                </div>

            `)
            .join("");
}


/* =====================================================
   DASHBOARD — CATEGORIAS
===================================================== */

function renderCategorySummary() {

    const container =
        document.getElementById(
            "categorySummary"
        );

    if (!container) {
        return;
    }


    const totals = {};


    appData.expenses.forEach(
        expense => {

            const category =
                expense.category ||
                "Outros";

            totals[category] =
                (
                    totals[category] ||
                    0
                ) +
                Number(
                    expense.amount || 0
                );

        }
    );


    const entries =
        Object.entries(totals)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .slice(0, 6);


    if (!entries.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📊
                </div>

                <strong>
                    Sem dados ainda
                </strong>

                <p>
                    Cadastre despesas para
                    visualizar o resumo.
                </p>

            </div>

        `;

        return;
    }


    const maximum =
        entries[0][1];


    container.innerHTML =
        entries
            .map(
                ([category, total]) => {

                    const percentage =
                        maximum > 0
                            ? (
                                total /
                                maximum
                            ) * 100
                            : 0;

                    return `

                        <div class="
                            category-summary-item
                        ">

                            <div class="
                                category-summary-header
                            ">

                                <span>
                                    ${escapeHTML(
                                        category
                                    )}
                                </span>

                                <strong>
                                    ${formatCurrency(
                                        total
                                    )}
                                </strong>

                            </div>

                            <div class="progress">

                                <div
                                    class="progress-bar"
                                    style="width: ${percentage}%">
                                </div>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");
}


/* =====================================================
   CATEGORIAS — PÁGINA
===================================================== */

function renderCategories() {

    const container =
        document.getElementById(
            "categoriesContainer"
        );

    if (!container) {
        return;
    }


    container.innerHTML =
        Object.entries(
            categories
        )
            .map(
                ([category, subcategories]) => `

                    <div class="category-card">

                        <h3>
                            ${escapeHTML(
                                category
                            )}
                        </h3>

                        <div class="subcategory-list">

                            ${subcategories
                                .map(
                                    subcategory => `

                                        <span class="
                                            subcategory
                                        ">

                                            ${escapeHTML(
                                                subcategory
                                            )}

                                        </span>

                                    `
                                )
                                .join("")}

                        </div>

                    </div>

                `
            )
            .join("");
}


/* =====================================================
   FILTROS
===================================================== */

function setupFilters() {

    const expenseSearch =
        document.getElementById(
            "expenseSearch"
        );

    const expenseCategoryFilter =
        document.getElementById(
            "expenseCategoryFilter"
        );

    const expenseMonthFilter =
        document.getElementById(
            "expenseMonthFilter"
        );

    const quoteSearch =
        document.getElementById(
            "quoteSearch"
        );

    const quoteCategoryFilter =
        document.getElementById(
            "quoteCategoryFilter"
        );


    expenseSearch?.addEventListener(
        "input",
        renderExpenses
    );

    expenseCategoryFilter?.addEventListener(
        "change",
        renderExpenses
    );

    expenseMonthFilter?.addEventListener(
        "change",
        renderExpenses
    );


    quoteSearch?.addEventListener(
        "input",
        renderQuotes
    );

    quoteCategoryFilter?.addEventListener(
        "change",
        renderQuotes
    );
}


/* =====================================================
   MODAIS
===================================================== */

function setupModalEvents() {

    const expenseModal =
        document.getElementById(
            "expenseModal"
        );

    const quoteModal =
        document.getElementById(
            "quoteModal"
        );


    [expenseModal, quoteModal]
        .forEach(modal => {

            if (!modal) {
                return;
            }

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        modal.classList.remove(
                            "show"
                        );

                        editingExpenseId =
                            null;

                        editingQuoteId =
                            null;
                    }

                }
            );

        });


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }

            closeExpenseModal();
            closeQuoteModal();

        }
    );


    setupTheme();
}


/* =====================================================
   MÁSCARA DE DINHEIRO
===================================================== */

function moneyMask(input) {

    let value =
        input.value.replace(
            /\D/g,
            ""
        );


    if (!value) {

        input.value = "";

        return;
    }


    const number =
        parseInt(
            value,
            10
        );


    input.value =
        new Intl.NumberFormat(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        ).format(
            number / 100
        );
}


/* =====================================================
   PARSER DE DINHEIRO
===================================================== */

function parseMoney(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return 0;
    }


    if (typeof value === "number") {
        return value;
    }


    let text =
        String(value)
            .trim();


    if (!text) {
        return 0;
    }


    text =
        text
            .replace(
                /R\$/gi,
                ""
            )
            .replace(
                /\s/g,
                ""
            );


    /*
        Se estiver no formato brasileiro:
        1.234,56
    */

    if (
        text.includes(",")
    ) {

        text =
            text
                .replace(
                    /\./g,
                    ""
                )
                .replace(
                    ",",
                    "."
                );

        const result =
            parseFloat(text);

        return Number.isFinite(
            result
        )
            ? result
            : 0;
    }


    /*
        Se veio apenas de dígitos,
        tratamos como centavos.
        Ex.: 3000 => 30,00
    */

    if (
        /^\d+$/.test(text)
    ) {

        return (
            parseInt(
                text,
                10
            ) / 100
        );
    }


    const result =
        parseFloat(text);

    return Number.isFinite(
        result
    )
        ? result
        : 0;
}


/* =====================================================
   FORMATAÇÃO
===================================================== */

function formatCurrency(value) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    ).format(
        Number(value || 0)
    );
}


function formatDate(date) {

    if (!date) {
        return "-";
    }

    const parts =
        date.split("-");

    if (
        parts.length !== 3
    ) {
        return date;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


function getTodayDate() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;
}


function getCurrentMonth() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}`;
}


/* =====================================================
   ID
===================================================== */

function generateId() {

    if (
        window.crypto &&
        typeof window.crypto.randomUUID ===
            "function"
    ) {

        return window.crypto.randomUUID();

    }

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2)
    );
}


/* =====================================================
   SEGURANÇA HTML
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
   TOAST
===================================================== */

let toastTimer = null;

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );

    if (!toast || !toastMessage) {
        return;
    }

    toastMessage.textContent =
        message;

    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2800
        );
}