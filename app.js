/* =========================================================
   ORÇAFÁCIL
   APP.JS
========================================================= */

"use strict";


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "orcafacil_data_v3";
const QUOTES_STORAGE_KEY = "orcafacil_quotes_v2";
const THEME_STORAGE_KEY = "orcafacil_theme_v1";


/* =========================================================
   DADOS
========================================================= */

let appData = {
    salary: 0,
    expenses: [],
    budgets: []
};

let quotes = [];

let editingExpenseId = null;
let editingQuoteId = null;


/* =========================================================
   CATEGORIAS
========================================================= */

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


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


function initializeApp() {

    loadData();
    loadQuotes();

    setupTheme();
    populateAllSelects();
    setupExpenseForm();
    setupQuoteForm();
    setupFilters();
    setupMobileMenu();

    setTodayDefaults();

    renderCategories();
    renderExpenses();
    renderQuotes();
    updateDashboard();

    showPage("dashboard");
}


/* =========================================================
   STORAGE
========================================================= */

function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return;
        }

        const parsed =
            JSON.parse(saved);

        if (
            parsed &&
            typeof parsed === "object"
        ) {

            appData = {
                salary:
                    Number(parsed.salary) || 0,

                expenses:
                    Array.isArray(parsed.expenses)
                        ? parsed.expenses
                        : [],

                budgets:
                    Array.isArray(parsed.budgets)
                        ? parsed.budgets
                        : []
            };
        }

    } catch (error) {

        console.error(
            "Erro ao carregar dados:",
            error
        );
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
            localStorage.getItem(
                QUOTES_STORAGE_KEY
            );

        if (!saved) {
            quotes = [];
            return;
        }

        const parsed =
            JSON.parse(saved);

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


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function showPage(pageId) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {

        page.classList.toggle(
            "active",
            page.id === pageId
        );
    });


    const menuItems =
        document.querySelectorAll(".menu-item");

    menuItems.forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === pageId
        );
    });


    const titles = {

        dashboard: "Visão geral",

        despesas: "Controle de despesas",

        cotacoes: "Compras planejadas",

        categorias: "Categorias"
    };


    const topbarSection =
        document.getElementById(
            "topbarSection"
        );

    if (topbarSection) {

        topbarSection.textContent =
            titles[pageId] ||
            "OrçaFácil";
    }


    const sidebar =
        document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.remove(
            "mobile-open"
        );
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   TEMA
========================================================= */

function setupTheme() {

    const savedTheme =
        localStorage.getItem(
            THEME_STORAGE_KEY
        );

    if (savedTheme === "dark") {

        document.body.classList.add("dark");

    } else {

        document.body.classList.remove("dark");
    }

    updateThemeIcon();


    const toggle =
        document.getElementById(
            "themeToggle"
        );

    if (toggle) {

        toggle.addEventListener(
            "click",
            toggleTheme
        );
    }
}


function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );

    const isDark =
        document.body.classList.contains(
            "dark"
        );

    localStorage.setItem(
        THEME_STORAGE_KEY,
        isDark ? "dark" : "light"
    );

    updateThemeIcon();
}


function updateThemeIcon() {

    const icon =
        document.getElementById(
            "themeIcon"
        );

    if (!icon) {
        return;
    }

    icon.textContent =
        document.body.classList.contains(
            "dark"
        )
            ? "☀"
            : "☾";
}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

    const button =
        document.getElementById(
            "mobileMenuButton"
        );

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    if (!button || !sidebar) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "mobile-open"
            );
        }
    );
}


/* =========================================================
   CATEGORIAS / SELECTS
========================================================= */

function populateAllSelects() {

    const expenseCategory =
        document.getElementById(
            "expenseCategory"
        );

    const quoteCategory =
        document.getElementById(
            "quoteCategory"
        );

    const expenseFilter =
        document.getElementById(
            "expenseCategoryFilter"
        );

    const quoteFilter =
        document.getElementById(
            "quoteCategoryFilter"
        );


    if (expenseCategory) {

        populateCategorySelect(
            expenseCategory
        );
    }


    if (quoteCategory) {

        populateCategorySelect(
            quoteCategory
        );
    }


    if (expenseFilter) {

        populateCategoryFilter(
            expenseFilter
        );
    }


    if (quoteFilter) {

        populateCategoryFilter(
            quoteFilter
        );
    }


    populateMonthFilter();
}


function populateCategorySelect(select) {

    select.innerHTML =
        `<option value="">Selecione</option>`;


    Object.keys(categories)
        .forEach(category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = category;
            option.textContent = category;

            select.appendChild(option);
        });
}


function populateCategoryFilter(select) {

    select.innerHTML =
        `<option value="">Todas as categorias</option>`;


    Object.keys(categories)
        .forEach(category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = category;
            option.textContent = category;

            select.appendChild(option);
        });
}


function populateMonthFilter() {

    const select =
        document.getElementById(
            "expenseMonthFilter"
        );

    if (!select) {
        return;
    }

    const months = new Set();

    appData.expenses.forEach(expense => {

        if (expense.date) {

            months.add(
                expense.date.substring(0, 7)
            );
        }
    });


    const current =
        getCurrentMonth();

    months.add(current);


    select.innerHTML =
        `<option value="">Todos os meses</option>`;


    Array.from(months)
        .sort()
        .reverse()
        .forEach(month => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = month;
            option.textContent =
                formatMonth(month);

            select.appendChild(option);
        });
}


function updateSubcategories(
    categoryId,
    subcategoryId
) {

    const category =
        document.getElementById(
            categoryId
        );

    const subcategory =
        document.getElementById(
            subcategoryId
        );

    if (!category || !subcategory) {
        return;
    }

    const selected =
        category.value;

    subcategory.innerHTML = "";


    if (!selected) {

        subcategory.innerHTML =
            `<option value="">Selecione primeiro a categoria</option>`;

        return;
    }


    subcategory.innerHTML =
        `<option value="">Selecione</option>`;


    (categories[selected] || [])
        .forEach(item => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = item;
            option.textContent = item;

            subcategory.appendChild(
                option
            );
        });
}


/* =========================================================
   DESPESAS — FORM
========================================================= */

function setupExpenseForm() {

    const form =
        document.getElementById(
            "expenseForm"
        );

    const category =
        document.getElementById(
            "expenseCategory"
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
            saveExpense
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


    form.reset();

    editingExpenseId = id;


    const title =
        document.getElementById(
            "expenseModalTitle"
        );

    const idInput =
        document.getElementById(
            "expenseId"
        );

    const date =
        document.getElementById(
            "expenseDate"
        );


    if (id) {

        const expense =
            appData.expenses.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (!expense) {
            return;
        }

        if (title) {
            title.textContent =
                "Editar despesa";
        }

        if (idInput) {
            idInput.value =
                expense.id;
        }

        document.getElementById(
            "expenseDescription"
        ).value =
            expense.description || "";

        document.getElementById(
            "expenseCategory"
        ).value =
            expense.category || "";

        updateSubcategories(
            "expenseCategory",
            "expenseSubcategory"
        );

        document.getElementById(
            "expenseSubcategory"
        ).value =
            expense.subcategory || "";

        document.getElementById(
            "expenseAmount"
        ).value =
            formatCurrency(expense.amount);

        document.getElementById(
            "expenseDate"
        ).value =
            expense.date || "";

        document.getElementById(
            "expenseNotes"
        ).value =
            expense.notes || "";

    } else {

        if (title) {
            title.textContent =
                "Nova despesa";
        }

        if (idInput) {
            idInput.value = "";
        }

        if (date) {
            date.value =
                getTodayDate();
        }
    }


    modal.hidden = false;

    document.body.style.overflow =
        "hidden";
}


function closeExpenseModal() {

    const modal =
        document.getElementById(
            "expenseModal"
        );

    if (!modal) {
        return;
    }

    modal.hidden = true;

    document.body.style.overflow =
        "";
}


function saveExpense(event) {

    event.preventDefault();


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
            "Preencha corretamente os campos obrigatórios.",
            "!"
        );

        return;
    }


    const expense = {

        id:
            editingExpenseId ||
            createId(),

        description,

        category,

        subcategory,

        amount,

        date,

        notes
    };


    if (editingExpenseId) {

        const index =
            appData.expenses.findIndex(
                item =>
                    String(item.id) ===
                    String(editingExpenseId)
            );

        if (index !== -1) {

            appData.expenses[index] =
                expense;
        }

        showToast(
            "Despesa atualizada."
        );

    } else {

        appData.expenses.push(
            expense
        );

        showToast(
            "Despesa cadastrada."
        );
    }


    saveData();

    populateMonthFilter();

    renderExpenses();

    updateDashboard();

    closeExpenseModal();
}


/* =========================================================
   DESPESAS — RENDER
========================================================= */

function renderExpenses() {

    const tbody =
        document.getElementById(
            "expensesTableBody"
        );

    const empty =
        document.getElementById(
            "expensesEmpty"
        );

    if (!tbody || !empty) {
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


    const filtered =
        appData.expenses
            .filter(expense => {

                const text =
                    `${expense.description || ""} ${expense.category || ""} ${expense.subcategory || ""}`
                        .toLowerCase();

                const matchesSearch =
                    !search ||
                    text.includes(search);

                const matchesCategory =
                    !category ||
                    expense.category === category;

                const matchesMonth =
                    !month ||
                    expense.date?.startsWith(
                        month
                    );

                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesMonth
                );
            })
            .sort(
                (a, b) =>
                    String(b.date)
                        .localeCompare(
                            String(a.date)
                        )
            );


    tbody.innerHTML = "";


    if (!filtered.length) {

        empty.classList.add(
            "visible"
        );

        return;
    }


    empty.classList.remove(
        "visible"
    );


    filtered.forEach(expense => {

        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `

            <td>

                <div class="table-main">
                    ${escapeHTML(expense.description)}
                </div>

                ${
                    expense.notes
                        ? `
                            <div class="table-sub">
                                ${escapeHTML(expense.notes)}
                            </div>
                          `
                        : ""
                }

            </td>


            <td>

                <div class="table-main">
                    ${escapeHTML(expense.category)}
                </div>

                <div class="table-sub">
                    ${escapeHTML(expense.subcategory)}
                </div>

            </td>


            <td>
                ${formatDate(expense.date)}
            </td>


            <td class="table-value">
                ${formatCurrency(expense.amount)}
            </td>


            <td>

                <div class="action-buttons">

                    <button
                        type="button"
                        class="action-button"
                        title="Editar"
                        onclick="openExpenseModal('${expense.id}')"
                    >
                        ✎
                    </button>

                    <button
                        type="button"
                        class="action-button delete"
                        title="Excluir"
                        onclick="deleteExpense('${expense.id}')"
                    >
                        ×
                    </button>

                </div>

            </td>

        `;


        tbody.appendChild(row);
    });
}


function deleteExpense(id) {

    const expense =
        appData.expenses.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!expense) {
        return;
    }


    const confirmed =
        window.confirm(
            `Excluir a despesa "${expense.description}"?`
        );

    if (!confirmed) {
        return;
    }


    appData.expenses =
        appData.expenses.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    saveData();

    populateMonthFilter();

    renderExpenses();

    updateDashboard();

    showToast(
        "Despesa excluída."
    );
}


/* =========================================================
   COTAÇÕES — FORM
========================================================= */

function setupQuoteForm() {

    const form =
        document.getElementById(
            "quoteForm"
        );

    const category =
        document.getElementById(
            "quoteCategory"
        );

    const price =
        document.getElementById(
            "quotePrice"
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
            saveQuote
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


    form.reset();

    editingQuoteId = id;


    const title =
        document.getElementById(
            "quoteModalTitle"
        );


    if (id) {

        const quote =
            quotes.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (!quote) {
            return;
        }


        if (title) {
            title.textContent =
                "Editar cotação";
        }


        document.getElementById(
            "quoteId"
        ).value =
            quote.id;


        document.getElementById(
            "quoteProduct"
        ).value =
            quote.product || "";


        document.getElementById(
            "quoteCategory"
        ).value =
            quote.category || "";


        updateSubcategories(
            "quoteCategory",
            "quoteSubcategory"
        );


        document.getElementById(
            "quoteSubcategory"
        ).value =
            quote.subcategory || "";


        document.getElementById(
            "quoteStore"
        ).value =
            quote.store || "";


        document.getElementById(
            "quotePrice"
        ).value =
            formatCurrency(quote.price);


        document.getElementById(
            "quoteDate"
        ).value =
            quote.date || "";


        document.getElementById(
            "quoteNotes"
        ).value =
            quote.notes || "";

    } else {

        if (title) {
            title.textContent =
                "Nova cotação";
        }

        document.getElementById(
            "quoteId"
        ).value = "";


        document.getElementById(
            "quoteDate"
        ).value =
            getTodayDate();
    }


    modal.hidden = false;

    document.body.style.overflow =
        "hidden";
}


function closeQuoteModal() {

    const modal =
        document.getElementById(
            "quoteModal"
        );

    if (!modal) {
        return;
    }

    modal.hidden = true;

    document.body.style.overflow =
        "";
}


function saveQuote(event) {

    event.preventDefault();


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
            "Preencha corretamente os campos obrigatórios.",
            "!"
        );

        return;
    }


    const quote = {

        id:
            editingQuoteId ||
            createId(),

        product,

        category,

        subcategory,

        store,

        price,

        date,

        notes
    };


    if (editingQuoteId) {

        const index =
            quotes.findIndex(
                item =>
                    String(item.id) ===
                    String(editingQuoteId)
            );

        if (index !== -1) {

            quotes[index] =
                quote;
        }

        showToast(
            "Cotação atualizada."
        );

    } else {

        quotes.push(
            quote
        );

        showToast(
            "Cotação cadastrada."
        );
    }


    saveQuotes();

    renderQuotes();

    updateDashboard();

    closeQuoteModal();
}


/* =========================================================
   COTAÇÕES — RENDER
========================================================= */

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


    const filtered =
        quotes.filter(quote => {

            const text =
                `${quote.product || ""} ${quote.store || ""} ${quote.category || ""} ${quote.subcategory || ""}`
                    .toLowerCase();

            const matchesSearch =
                !search ||
                text.includes(search);

            const matchesCategory =
                !category ||
                quote.category === category;

            return (
                matchesSearch &&
                matchesCategory
            );
        });


    container.innerHTML = "";


    if (!filtered.length) {

        empty.classList.add(
            "visible"
        );

        return;
    }


    empty.classList.remove(
        "visible"
    );


    /*
       Agrupa as cotações pelo produto.
    */

    const groups =
        groupQuotesByProduct(
            filtered
        );


    Object.values(groups)
        .forEach(group => {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "quote-card";


            const prices =
                group
                    .slice()
                    .sort(
                        (a, b) =>
                            a.price - b.price
                    );


            const cheapest =
                prices[0]?.price || 0;


            const mostExpensive =
                prices[prices.length - 1]?.price || 0;


            const saving =
                Math.max(
                    0,
                    mostExpensive -
                    cheapest
                );


            const first =
                group[0];


            const priceRows =
                prices.map(
                    quote => {

                        const isCheapest =
                            quote.price ===
                            cheapest;


                        return `

                            <div class="quote-price-row">

                                <div class="quote-store">
                                    ${escapeHTML(quote.store)}
                                </div>

                                <div class="quote-price">
                                    ${formatCurrency(quote.price)}
                                </div>

                                <div class="action-buttons">

                                    ${
                                        isCheapest
                                            ? `
                                                <span class="cheapest-badge">
                                                    Menor preço
                                                </span>
                                              `
                                            : ""
                                    }

                                    <button
                                        type="button"
                                        class="action-button"
                                        title="Mais detalhes"
                                        aria-label="Mais detalhes"
                                        onclick="toggleQuoteDetails('${quote.id}')"
                                    >
                                        ⓘ
                                    </button>

                                    <button
                                        type="button"
                                        class="action-button"
                                        title="Editar"
                                        onclick="openQuoteModal('${quote.id}')"
                                    >
                                        ✎
                                    </button>

                                    <button
                                        type="button"
                                        class="action-button delete"
                                        title="Excluir"
                                        onclick="deleteQuote('${quote.id}')"
                                    >
                                        ×
                                    </button>

                                </div>

                            </div>


                            <div
                                id="quote-details-${quote.id}"
                                class="quote-details"
                                hidden
                            >

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

                        `;
                    }
                )
                .join("");


            card.innerHTML = `

                <div class="quote-card-header">

                    <div class="quote-product">

                        <div class="quote-product-icon">
                            ◫
                        </div>

                        <div>

                            <h3>
                                ${escapeHTML(first.product)}
                            </h3>

                            <span>
                                ${escapeHTML(first.category)}
                                ·
                                ${escapeHTML(first.subcategory)}
                                ·
                                ${group.length}
                                ${
                                    group.length === 1
                                        ? "cotação"
                                        : "cotações"
                                }
                            </span>

                        </div>

                    </div>

                    <div class="quote-date">
                        ${formatDate(first.date)}
                    </div>

                </div>


                <div class="quote-prices">
                    ${priceRows}
                </div>


                <div class="quote-summary">

                    <span>
                        ${
                            group.length > 1
                                ? `Economia possível comparando os preços`
                                : `Valor planejado da compra`
                        }
                    </span>

                    <strong>
                        ${
                            group.length > 1
                                ? formatCurrency(saving)
                                : formatCurrency(cheapest)
                        }
                    </strong>

                </div>

            `;


            container.appendChild(
                card
            );
        });
}


function groupQuotesByProduct(list) {

    const groups = {};

    list.forEach(quote => {

        const key =
            quote.product
                .trim()
                .toLowerCase();


        if (!groups[key]) {
            groups[key] = [];
        }

        groups[key].push(
            quote
        );
    });


    return groups;
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


function deleteQuote(id) {

    const quote =
        quotes.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!quote) {
        return;
    }


    const confirmed =
        window.confirm(
            `Excluir a cotação de "${quote.product}" na loja "${quote.store}"?`
        );


    if (!confirmed) {
        return;
    }


    quotes =
        quotes.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    saveQuotes();

    renderQuotes();

    updateDashboard();

    showToast(
        "Cotação excluída."
    );
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const salary =
        Number(appData.salary) || 0;


    const currentMonth =
        getCurrentMonth();


    const monthlyExpenses =
        appData.expenses
            .filter(
                expense =>
                    expense.date?.startsWith(
                        currentMonth
                    )
            )
            .reduce(
                (total, expense) =>
                    total +
                    Number(expense.amount || 0),
                0
            );


    /*
       As cotações representam compras planejadas.
       Elas NÃO são contabilizadas como despesas realizadas.
    */

    const plannedQuotes =
        quotes.reduce(
            (total, quote) =>
                total +
                Number(quote.price || 0),
            0
        );


    const projectedBalance =
        salary -
        monthlyExpenses -
        plannedQuotes;


    const savings =
        calculatePossibleSavings();


    /* =========================
       CARDS
    ========================== */

    setText(
        "totalExpenses",
        formatCurrency(salary)
    );


    setText(
        "monthlyExpenses",
        formatCurrency(monthlyExpenses)
    );


    setText(
        "quoteCount",
        String(quotes.length)
    );


    setText(
        "possibleSaving",
        formatCurrency(savings)
    );


    /* =========================
       PLANEJAMENTO
    ========================== */

    setText(
        "dashboardBudget",
        formatCurrency(salary)
    );


    setText(
        "dashboardSpent",
        formatCurrency(monthlyExpenses)
    );


    setText(
        "dashboardPlanned",
        formatCurrency(plannedQuotes)
    );


    setText(
        "dashboardProjected",
        formatCurrency(projectedBalance)
    );


    /* =========================
       STATUS
    ========================== */

    updateBudgetStatus(
        salary,
        projectedBalance,
        monthlyExpenses,
        plannedQuotes
    );


    /* =========================
       LISTAS
    ========================== */

    renderDashboardQuotes();

    renderRecentExpenses();
}


/* =========================================================
   STATUS FINANCEIRO
========================================================= */

function updateBudgetStatus(
    salary,
    projectedBalance,
    expenses,
    planned
) {

    const badge =
        document.getElementById(
            "budgetStatusBadge"
        );

    const title =
        document.getElementById(
            "budgetStatusText"
        );

    const progress =
        document.getElementById(
            "budgetProgress"
        );

    const progressLabel =
        document.getElementById(
            "budgetProgressLabel"
        );

    const progressPercent =
        document.getElementById(
            "budgetProgressPercent"
        );

    const projectedLabel =
        document.getElementById(
            "dashboardProjectedLabel"
        );


    const statusTitle =
        document.getElementById(
            "purchaseStatusTitle"
        );

    const statusDescription =
        document.getElementById(
            "purchaseStatusDescription"
        );

    const statusIcon =
        document.getElementById(
            "purchaseStatusIcon"
        );

    const statusCard =
        statusIcon?.closest(
            ".purchase-status-card"
        );


    if (!salary || salary <= 0) {

        if (badge) {

            badge.className =
                "status-badge neutral";

            badge.textContent =
                "Aguardando";
        }


        if (title) {
            title.textContent =
                "Informe seu saldo disponível";
        }


        if (progress) {

            progress.style.width =
                "0%";

            progress.className =
                "progress-bar";
        }


        if (progressLabel) {
            progressLabel.textContent =
                "Nenhum valor definido";
        }


        if (progressPercent) {
            progressPercent.textContent =
                "0%";
        }


        if (projectedLabel) {
            projectedLabel.textContent =
                "informe seu saldo para começar";
        }


        if (statusTitle) {
            statusTitle.textContent =
                "Cadastre seu saldo";
        }


        if (statusDescription) {
            statusDescription.textContent =
                "Depois de informar seu saldo e cadastrar despesas ou cotações, o OrçaFácil mostrará o impacto das compras no seu orçamento.";
        }


        if (statusIcon) {
            statusIcon.textContent =
                "✓";
        }


        if (statusCard) {

            statusCard.classList.remove(
                "good",
                "warning",
                "danger"
            );
        }


        return;
    }


    const committed =
        expenses +
        planned;


    const percent =
        Math.max(
            0,
            (committed / salary) * 100
        );


    const remainingPercent =
        (projectedBalance / salary) * 100;


    let status =
        "good";


    /*
       Verde:
       ainda há pelo menos 20% do saldo.

       Amarelo:
       saldo positivo, mas abaixo de 20%.

       Vermelho:
       saldo projetado zerado ou negativo.
    */

    if (projectedBalance <= 0) {

        status =
            "danger";

    } else if (
        remainingPercent < 20
    ) {

        status =
            "warning";
    }


    const statusData = {

        good: {

            label:
                "Pode comprar",

            description:
                "Seu saldo projetado continua positivo e há uma margem de segurança no orçamento.",

            icon:
                "✓"
        },

        warning: {

            label:
                "Cuidado",

            description:
                "O saldo continua positivo, mas a margem disponível está ficando pequena.",

            icon:
                "!"
        },

        danger: {

            label:
                "Risco de perda",

            description:
                "As despesas e compras planejadas ultrapassam o saldo informado para o mês.",

            icon:
                "×"
        }
    };


    const current =
        statusData[status];


    /* STATUS BADGE */

    if (badge) {

        badge.className =
            `status-badge ${status}`;

        badge.textContent =
            current.label;
    }


    /* STATUS TITLE */

    if (title) {

        title.textContent =
            current.label;
    }


    /* PROGRESS */

    if (progress) {

        progress.style.width =
            `${Math.min(percent, 100)}%`;

        progress.className =
            `progress-bar ${status}`;
    }


    if (progressLabel) {

        progressLabel.textContent =
            `${formatCurrency(committed)} comprometidos`;
    }


    if (progressPercent) {

        progressPercent.textContent =
            `${Math.round(percent)}%`;
    }


    if (projectedLabel) {

        projectedLabel.textContent =
            projectedBalance >= 0
                ? "após despesas e compras planejadas"
                : "valor acima do saldo disponível";
    }


    /* PURCHASE CARD */

    if (statusTitle) {

        statusTitle.textContent =
            current.label;
    }


    if (statusDescription) {

        statusDescription.textContent =
            current.description;
    }


    if (statusIcon) {

        statusIcon.textContent =
            current.icon;
    }


    if (statusCard) {

        statusCard.classList.remove(
            "good",
            "warning",
            "danger"
        );

        statusCard.classList.add(
            status
        );
    }
}


/* =========================================================
   COTAÇÕES NO DASHBOARD
========================================================= */

function renderDashboardQuotes() {

    const container =
        document.getElementById(
            "dashboardQuotes"
        );

    const empty =
        document.getElementById(
            "dashboardQuotesEmpty"
        );

    if (!container || !empty) {
        return;
    }


    container.innerHTML = "";


    if (!quotes.length) {

        empty.classList.add(
            "visible"
        );

        return;
    }


    empty.classList.remove(
        "visible"
    );


    const recent =
        quotes
            .slice()
            .sort(
                (a, b) =>
                    String(b.date)
                        .localeCompare(
                            String(a.date)
                        )
            )
            .slice(0, 6);


    recent.forEach(quote => {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "dashboard-quote";


        item.innerHTML = `

            <div class="dashboard-quote-icon">
                ◫
            </div>

            <div class="dashboard-quote-info">

                <strong>
                    ${escapeHTML(quote.product)}
                </strong>

                <span>
                    ${escapeHTML(quote.store)}
                    ·
                    ${formatDate(quote.date)}
                </span>

            </div>

            <div class="dashboard-quote-price">
                ${formatCurrency(quote.price)}
            </div>

        `;


        container.appendChild(
            item
        );
    });
}


/* =========================================================
   DESPESAS RECENTES
========================================================= */

function renderRecentExpenses() {

    const container =
        document.getElementById(
            "recentExpenses"
        );

    const empty =
        document.getElementById(
            "recentExpensesEmpty"
        );

    if (!container || !empty) {
        return;
    }


    container.innerHTML = "";


    if (!appData.expenses.length) {

        empty.classList.add(
            "visible"
        );

        return;
    }


    empty.classList.remove(
        "visible"
    );


    const recent =
        appData.expenses
            .slice()
            .sort(
                (a, b) =>
                    String(b.date)
                        .localeCompare(
                            String(a.date)
                        )
            )
            .slice(0, 6);


    recent.forEach(expense => {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "recent-expense";


        item.innerHTML = `

            <div class="recent-expense-icon">
                ↘
            </div>

            <div class="recent-expense-info">

                <strong>
                    ${escapeHTML(expense.description)}
                </strong>

                <span>
                    ${escapeHTML(expense.category)}
                    ·
                    ${formatDate(expense.date)}
                </span>

            </div>

            <div class="recent-expense-value">
                ${formatCurrency(expense.amount)}
            </div>

        `;


        container.appendChild(
            item
        );
    });
}


/* =========================================================
   ECONOMIA POSSÍVEL
========================================================= */

function calculatePossibleSavings() {

    const groups =
        groupQuotesByProduct(
            quotes
        );


    let totalSaving = 0;


    Object.values(groups)
        .forEach(group => {

            if (group.length < 2) {
                return;
            }


            const prices =
                group.map(
                    quote =>
                        Number(quote.price || 0)
                );


            const lowest =
                Math.min(...prices);

            const highest =
                Math.max(...prices);


            totalSaving +=
                Math.max(
                    0,
                    highest - lowest
                );
        });


    return totalSaving;
}


/* =========================================================
   SALÁRIO / SALDO
========================================================= */

function saveSalary() {

    const input =
        document.getElementById(
            "salaryInput"
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
            "Informe um valor maior que zero.",
            "!"
        );

        return;
    }


    appData.salary =
        value;


    saveData();

    updateDashboard();

    input.value =
        formatCurrency(value);


    showToast(
        "Saldo disponível salvo."
    );
}


/* =========================================================
   FILTROS
========================================================= */

function setupFilters() {

    const expenseSearch =
        document.getElementById(
            "expenseSearch"
        );

    const expenseCategory =
        document.getElementById(
            "expenseCategoryFilter"
        );

    const expenseMonth =
        document.getElementById(
            "expenseMonthFilter"
        );


    const quoteSearch =
        document.getElementById(
            "quoteSearch"
        );

    const quoteCategory =
        document.getElementById(
            "quoteCategoryFilter"
        );


    expenseSearch?.addEventListener(
        "input",
        renderExpenses
    );

    expenseCategory?.addEventListener(
        "change",
        renderExpenses
    );

    expenseMonth?.addEventListener(
        "change",
        renderExpenses
    );


    quoteSearch?.addEventListener(
        "input",
        renderQuotes
    );

    quoteCategory?.addEventListener(
        "change",
        renderQuotes
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


    container.innerHTML = "";


    Object.entries(categories)
        .forEach(
            ([category, subcategories]) => {

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "category-card";


                card.innerHTML = `

                    <span class="section-label">
                        CATEGORIA
                    </span>

                    <h3>
                        ${escapeHTML(category)}
                    </h3>

                    <div class="subcategory-list">

                        ${subcategories
                            .map(
                                item =>
                                    `
                                    <span class="subcategory">
                                        ${escapeHTML(item)}
                                    </span>
                                    `
                            )
                            .join("")}

                    </div>

                `;


                container.appendChild(
                    card
                );
            }
        );
}


/* =========================================================
   DATAS
========================================================= */

function setTodayDefaults() {

    const expenseDate =
        document.getElementById(
            "expenseDate"
        );

    const quoteDate =
        document.getElementById(
            "quoteDate"
        );

    if (expenseDate && !expenseDate.value) {

        expenseDate.value =
            getTodayDate();
    }

    if (quoteDate && !quoteDate.value) {

        quoteDate.value =
            getTodayDate();
    }


    const salaryInput =
        document.getElementById(
            "salaryInput"
        );

    if (
        salaryInput &&
        appData.salary > 0
    ) {

        salaryInput.value =
            formatCurrency(
                appData.salary
            );
    }
}


function getTodayDate() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


function getCurrentMonth() {

    return getTodayDate()
        .substring(0, 7);
}


function formatDate(value) {

    if (!value) {
        return "—";
    }


    const parts =
        value.split("-");


    if (parts.length !== 3) {
        return value;
    }


    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


function formatMonth(value) {

    if (!value) {
        return "";
    }


    const [year, month] =
        value.split("-");


    const date =
        new Date(
            Number(year),
            Number(month) - 1,
            1
        );


    return date.toLocaleDateString(
        "pt-BR",
        {
            month: "long",
            year: "numeric"
        }
    );
}


/* =========================================================
   DINHEIRO
========================================================= */

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


function parseMoney(value) {

    if (
        typeof value ===
        "number"
    ) {

        return value;
    }


    if (!value) {
        return 0;
    }


    const clean =
        String(value)
            .replace(
                /R\$/gi,
                ""
            )
            .replace(
                /\s/g,
                ""
            )
            .replace(
                /\./g,
                ""
            )
            .replace(
                ",",
                "."
            );


    const number =
        parseFloat(clean);


    return Number.isFinite(number)
        ? number
        : 0;
}


function formatCurrency(value) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    ).format(
        Number(value) || 0
    );
}


/* =========================================================
   UTILITÁRIOS
========================================================= */

function createId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );
}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );

    if (element) {
        element.textContent =
            value;
    }
}


function escapeHTML(value) {

    return String(value ?? "")
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


/* =========================================================
   TOAST
========================================================= */

let toastTimeout = null;


function showToast(
    message,
    icon = "✓"
) {

    const toast =
        document.getElementById(
            "toast"
        );

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );

    const toastIcon =
        document.getElementById(
            "toastIcon"
        );


    if (
        !toast ||
        !toastMessage ||
        !toastIcon
    ) {

        return;
    }


    toastMessage.textContent =
        message;

    toastIcon.textContent =
        icon;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );
}


/* =========================================================
   FECHAR MODAIS CLICANDO FORA
========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            event.target.classList.contains(
                "modal-overlay"
            )
        ) {

            if (
                event.target.id ===
                "expenseModal"
            ) {

                closeExpenseModal();
            }


            if (
                event.target.id ===
                "quoteModal"
            ) {

                closeQuoteModal();
            }
        }
    }
);


/* =========================================================
   ESC PARA FECHAR MODAIS
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }


        closeExpenseModal();

        closeQuoteModal();
    }
);