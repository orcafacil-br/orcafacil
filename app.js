/* =========================================================
   ORÇAFÁCIL
   APP.JS
========================================================= */


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const STORAGE_KEY =
    "orcafacil_data_v2";

const QUOTES_STORAGE_KEY =
    "orcafacil_quotes_v1";


let appData = {
    expenses: [],
    budgets: []
};

let quotes = [];

let editingExpenseId = null;
let editingQuoteId = null;

let toastTimeout;


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
    () => {

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

        renderCategories();

        renderExpenses();

        renderQuotes();

        updateDashboard();

        setupModalEvents();

    }
);


/* =========================================================
   STORAGE — DESPESAS
========================================================= */

function loadData() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!saved) {
            return;
        }

        const parsed =
            JSON.parse(saved);

        appData = {

            expenses:
                Array.isArray(
                    parsed.expenses
                )
                    ? parsed.expenses
                    : [],

            budgets:
                Array.isArray(
                    parsed.budgets
                )
                    ? parsed.budgets
                    : []

        };

    } catch (error) {

        console.error(
            "Erro ao carregar dados:",
            error
        );

        appData = {
            expenses: [],
            budgets: []
        };
    }
}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );
}


/* =========================================================
   STORAGE — COTAÇÕES
========================================================= */

function loadQuotes() {

    try {

        const saved =
            localStorage.getItem(
                QUOTES_STORAGE_KEY
            );

        if (!saved) {
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

function setupNavigation() {

    const menuItems =
        document.querySelectorAll(
            ".menu-item"
        );

    menuItems.forEach(item => {

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

            page.classList.remove(
                "active"
            );

        });


    const page =
        document.getElementById(
            pageId
        );


    if (page) {

        page.classList.add(
            "active"
        );
    }


    document
        .querySelectorAll(
            ".menu-item"
        )
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.page ===
                    pageId
            );

        });


    const sidebar =
        document.querySelector(
            ".sidebar"
        );

    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );
    }
}


/* =========================================================
   MENU MOBILE
========================================================= */

function setupMobileMenu() {

    const button =
        document.getElementById(
            "mobileMenuButton"
        );

    const sidebar =
        document.querySelector(
            ".sidebar"
        );

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


/* =========================================================
   TEMA
========================================================= */

function loadTheme() {

    const saved =
        localStorage.getItem(
            "orcafacil_theme"
        );

    if (saved === "dark") {

        document.body.classList.add(
            "dark"
        );

    } else {

        document.body.classList.remove(
            "dark"
        );
    }

    updateThemeButton();
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
        "orcafacil_theme",
        isDark
            ? "dark"
            : "light"
    );

    updateThemeButton();
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

    const isDark =
        document.body.classList.contains(
            "dark"
        );

    if (icon) {

        icon.textContent =
            isDark
                ? "☀️"
                : "🌙";
    }

    if (text) {

        text.textContent =
            isDark
                ? "Modo claro"
                : "Modo escuro";
    }
}


document.addEventListener(
    "click",
    event => {

        if (
            event.target.id ===
            "themeToggle" ||
            event.target.closest(
                "#themeToggle"
            )
        ) {

            toggleTheme();
        }

    }
);


/* =========================================================
   CATEGORIAS — DESPESAS
========================================================= */

function populateCategorySelects() {

    const categorySelect =
        document.getElementById(
            "expenseCategory"
        );

    const filterSelect =
        document.getElementById(
            "expenseCategoryFilter"
        );


    if (categorySelect) {

        categorySelect.innerHTML =
            `<option value="">
                Selecione
            </option>`;


        Object.keys(categories)
            .forEach(category => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    category;

                option.textContent =
                    category;

                categorySelect.appendChild(
                    option
                );

            });
    }


    if (filterSelect) {

        filterSelect.innerHTML =
            `<option value="">
                Todas as categorias
            </option>`;


        Object.keys(categories)
            .forEach(category => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    category;

                option.textContent =
                    category;

                filterSelect.appendChild(
                    option
                );

            });
    }
}


function updateSubcategories(
    selectedValue = ""
) {

    const category =
        document.getElementById(
            "expenseCategory"
        );

    const subcategory =
        document.getElementById(
            "expenseSubcategory"
        );

    if (!category || !subcategory) {
        return;
    }

    subcategory.innerHTML =
        `<option value="">
            Selecione
        </option>`;


    if (!category.value) {
        return;
    }


    const subcategories =
        categories[
            category.value
        ] || [];


    subcategories.forEach(
        item => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                item;

            option.textContent =
                item;

            subcategory.appendChild(
                option
            );
        }
    );


    if (selectedValue) {

        subcategory.value =
            selectedValue;
    }
}


/* =========================================================
   CATEGORIAS — COTAÇÕES
========================================================= */

function populateQuoteCategorySelect() {

    const categorySelect =
        document.getElementById(
            "quoteCategory"
        );

    const filterSelect =
        document.getElementById(
            "quoteCategoryFilter"
        );


    if (categorySelect) {

        categorySelect.innerHTML =
            `<option value="">
                Selecione
            </option>`;


        Object.keys(categories)
            .forEach(category => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    category;

                option.textContent =
                    category;

                categorySelect.appendChild(
                    option
                );

            });
    }


    if (filterSelect) {

        filterSelect.innerHTML =
            `<option value="">
                Todas as categorias
            </option>`;


        Object.keys(categories)
            .forEach(category => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    category;

                option.textContent =
                    category;

                filterSelect.appendChild(
                    option
                );

            });
    }
}


function updateQuoteSubcategories(
    selectedValue = ""
) {

    const category =
        document.getElementById(
            "quoteCategory"
        );

    const subcategory =
        document.getElementById(
            "quoteSubcategory"
        );

    if (!category || !subcategory) {
        return;
    }

    subcategory.innerHTML =
        `<option value="">
            Selecione
        </option>`;


    if (!category.value) {
        return;
    }


    const subcategories =
        categories[
            category.value
        ] || [];


    subcategories.forEach(
        item => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                item;

            option.textContent =
                item;

            subcategory.appendChild(
                option
            );
        }
    );


    if (selectedValue) {

        subcategory.value =
            selectedValue;
    }
}


/* =========================================================
   FORMULÁRIO — DESPESA
========================================================= */

function setupExpenseForm() {

    const form =
        document.getElementById(
            "expenseForm"
        );

    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        saveExpense
    );


    const category =
        document.getElementById(
            "expenseCategory"
        );


    category?.addEventListener(
        "change",
        () => {

            updateSubcategories();

        }
    );


    const amount =
        document.getElementById(
            "expenseAmount"
        );


    amount?.addEventListener(
        "input",
        () => {

            moneyMask(amount);

        }
    );
}


/* =========================================================
   ABRIR DESPESA
========================================================= */

function openExpenseModal(
    expenseId = null
) {

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

    editingExpenseId =
        expenseId;


    const title =
        document.getElementById(
            "expenseModalTitle"
        );


    if (expenseId) {

        const expense =
            appData.expenses.find(
                item =>
                    item.id ===
                    expenseId
            );


        if (!expense) {
            return;
        }


        title.textContent =
            "Editar despesa";


        document.getElementById(
            "expenseDescription"
        ).value =
            expense.description || "";


        document.getElementById(
            "expenseCategory"
        ).value =
            expense.category || "";


        updateSubcategories(
            expense.subcategory
        );


        document.getElementById(
            "expenseAmount"
        ).value =
            formatCurrency(
                expense.amount
            );


        document.getElementById(
            "expenseDate"
        ).value =
            expense.date || "";


        document.getElementById(
            "expenseNotes"
        ).value =
            expense.notes || "";


    } else {

        title.textContent =
            "Nova despesa";


        document.getElementById(
            "expenseDate"
        ).value =
            getTodayDate();
    }


    modal.classList.add(
        "show"
    );


    setTimeout(
        () => {

            document
                .getElementById(
                    "expenseDescription"
                )
                ?.focus();

        },
        100
    );
}


/* =========================================================
   FECHAR DESPESA
========================================================= */

function closeExpenseModal() {

    const modal =
        document.getElementById(
            "expenseModal"
        );

    if (modal) {

        modal.classList.remove(
            "show"
        );
    }

    editingExpenseId =
        null;
}


/* =========================================================
   SALVAR DESPESA
========================================================= */

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


    if (!description) {

        showToast(
            "Digite a descrição da despesa."
        );

        return;
    }


    if (!category) {

        showToast(
            "Selecione uma categoria."
        );

        return;
    }


    if (!subcategory) {

        showToast(
            "Selecione uma subcategoria."
        );

        return;
    }


    if (amount <= 0) {

        showToast(
            "Digite um valor válido."
        );

        return;
    }


    if (!date) {

        showToast(
            "Informe a data."
        );

        return;
    }


    if (editingExpenseId) {

        const index =
            appData.expenses.findIndex(
                item =>
                    item.id ===
                    editingExpenseId
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

            id:
                Date.now().toString(),

            description,
            category,
            subcategory,
            amount,
            date,
            notes,

            createdAt:
                new Date()
                    .toISOString()

        });


        showToast(
            "Despesa adicionada!"
        );
    }


    saveData();

    renderExpenses();

    updateDashboard();

    closeExpenseModal();
}


/* =========================================================
   RENDER — DESPESAS
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
            .toLowerCase()
            .trim();


    const categoryFilter =
        document.getElementById(
            "expenseCategoryFilter"
        )?.value || "";


    const monthFilter =
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


    if (categoryFilter) {

        filtered =
            filtered.filter(
                expense =>
                    expense.category ===
                    categoryFilter
            );
    }


    if (monthFilter) {

        filtered =
            filtered.filter(
                expense =>
                    expense.date &&
                    expense.date.startsWith(
                        monthFilter
                    )
            );
    }


    filtered.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );


    if (!filtered.length) {

        tbody.innerHTML = "";

        empty.style.display =
            "block";

        return;
    }


    empty.style.display =
        "none";


    tbody.innerHTML =
        filtered
            .map(
                expense => `

                    <tr>

                        <td>
                            <span class="table-date">
                                ${formatDate(
                                    expense.date
                                )}
                            </span>
                        </td>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    expense.description
                                )}
                            </strong>
                        </td>

                        <td>
                            <span class="category-badge">
                                ${escapeHTML(
                                    expense.category
                                )}
                            </span>
                        </td>

                        <td>
                            ${escapeHTML(
                                expense.subcategory
                            )}
                        </td>

                        <td>
                            <span class="amount">
                                ${formatCurrency(
                                    expense.amount
                                )}
                            </span>
                        </td>

                        <td>

                            <div class="action-buttons">

                                <button
                                    class="action-button"
                                    title="Editar"
                                    aria-label="Editar"
                                    onclick="openExpenseModal('${expense.id}')">
                                    ✏️
                                </button>

                                <button
                                    class="action-button delete"
                                    title="Excluir"
                                    aria-label="Excluir"
                                    onclick="deleteExpense('${expense.id}')">
                                    🗑️
                                </button>

                            </div>

                        </td>

                    </tr>

                `
            )
            .join("");
}


/* =========================================================
   EXCLUIR DESPESA
========================================================= */

function deleteExpense(id) {

    const expense =
        appData.expenses.find(
            item =>
                item.id === id
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
            item =>
                item.id !== id
        );


    saveData();

    renderExpenses();

    updateDashboard();

    showToast(
        "Despesa excluída."
    );
}


/* =========================================================
   FORMULÁRIO — COTAÇÕES
========================================================= */

function setupQuoteForm() {

    const form =
        document.getElementById(
            "quoteForm"
        );

    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        saveQuote
    );


    const category =
        document.getElementById(
            "quoteCategory"
        );


    category?.addEventListener(
        "change",
        () => {

            updateQuoteSubcategories();

        }
    );


    const price =
        document.getElementById(
            "quotePrice"
        );


    price?.addEventListener(
        "input",
        () => {

            moneyMask(price);

        }
    );
}


/* =========================================================
   ABRIR COTAÇÃO
========================================================= */

function openQuoteModal(
    quoteId = null
) {

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

    editingQuoteId =
        quoteId;


    const title =
        document.getElementById(
            "quoteModalTitle"
        );


    if (quoteId) {

        const quote =
            quotes.find(
                item =>
                    item.id ===
                    quoteId
            );


        if (!quote) {
            return;
        }


        title.textContent =
            "Editar cotação";


        document.getElementById(
            "quoteProduct"
        ).value =
            quote.product || "";


        document.getElementById(
            "quoteCategory"
        ).value =
            quote.category || "";


        updateQuoteSubcategories(
            quote.subcategory
        );


        document.getElementById(
            "quoteStore"
        ).value =
            quote.store || "";


        document.getElementById(
            "quotePrice"
        ).value =
            formatCurrency(
                quote.price
            );


        document.getElementById(
            "quoteDate"
        ).value =
            quote.date || "";


        document.getElementById(
            "quoteNotes"
        ).value =
            quote.notes || "";


    } else {

        title.textContent =
            "Nova cotação";


        document.getElementById(
            "quoteDate"
        ).value =
            getTodayDate();
    }


    modal.classList.add(
        "show"
    );


    setTimeout(
        () => {

            document
                .getElementById(
                    "quoteProduct"
                )
                ?.focus();

        },
        100
    );
}


/* =========================================================
   FECHAR COTAÇÃO
========================================================= */

function closeQuoteModal() {

    const modal =
        document.getElementById(
            "quoteModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );
    }


    editingQuoteId =
        null;
}


/* =========================================================
   SALVAR COTAÇÃO
========================================================= */

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


    if (!product) {

        showToast(
            "Digite o nome do produto."
        );

        return;
    }


    if (!category) {

        showToast(
            "Selecione uma categoria."
        );

        return;
    }


    if (!subcategory) {

        showToast(
            "Selecione uma subcategoria."
        );

        return;
    }


    if (!store) {

        showToast(
            "Digite o nome da loja."
        );

        return;
    }


    if (price <= 0) {

        showToast(
            "Digite um preço válido."
        );

        return;
    }


    if (!date) {

        showToast(
            "Informe a data da cotação."
        );

        return;
    }


    if (editingQuoteId) {

        const index =
            quotes.findIndex(
                item =>
                    item.id ===
                    editingQuoteId
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

            id:
                Date.now().toString(),

            product,
            category,
            subcategory,
            store,
            price,
            date,
            notes,

            createdAt:
                new Date()
                    .toISOString()

        });


        showToast(
            "Cotação adicionada!"
        );
    }


    saveQuotes();

    renderQuotes();

    updateDashboard();

    closeQuoteModal();
}


/* =========================================================
   RENDER — COTAÇÕES
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
            .toLowerCase()
            .trim();


    const categoryFilter =
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


    if (categoryFilter) {

        filtered =
            filtered.filter(
                quote =>
                    quote.category ===
                    categoryFilter
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


    /*
     * Agrupa produto + categoria +
     * subcategoria.
     */
    const grouped = {};


    filtered.forEach(
        quote => {

            const key = [

                String(
                    quote.product || ""
                )
                    .trim()
                    .toLowerCase(),

                String(
                    quote.category || ""
                )
                    .trim()
                    .toLowerCase(),

                String(
                    quote.subcategory || ""
                )
                    .trim()
                    .toLowerCase()

            ].join("|");


            if (!grouped[key]) {

                grouped[key] = [];
            }


            grouped[key].push(
                quote
            );

        }
    );


    container.innerHTML = "";


    Object.values(grouped)
        .forEach(
            productQuotes => {

                /*
                 * Menor preço primeiro.
                 */
                productQuotes.sort(
                    (a, b) =>
                        Number(
                            a.price
                        ) -
                        Number(
                            b.price
                        )
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
                                (
                                    quote,
                                    index
                                ) => `

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

                                            <!-- MAIS DETALHES -->
                                            <button
                                                class="action-button"
                                                title="Mais detalhes"
                                                aria-label="Mais detalhes"
                                                onclick="toggleQuoteDetails('${quote.id}')">
                                                ⓘ
                                            </button>


                                            <!-- EDITAR -->
                                            <button
                                                class="action-button"
                                                title="Editar"
                                                aria-label="Editar"
                                                onclick="openQuoteModal('${quote.id}')">
                                                ✏️
                                            </button>


                                            <!-- EXCLUIR -->
                                            <button
                                                class="action-button delete"
                                                title="Excluir"
                                                aria-label="Excluir"
                                                onclick="deleteQuote('${quote.id}')">
                                                🗑️
                                            </button>

                                        </div>

                                    </div>


                                    <!-- DETALHES INDIVIDUAIS -->
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
                                                quote.notes &&
                                                quote.notes.trim()
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

            }
        );
}


/* =========================================================
   MAIS DETALHES — COTAÇÃO
========================================================= */

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


/* =========================================================
   EXCLUIR COTAÇÃO
========================================================= */

function deleteQuote(id) {

    const quote =
        quotes.find(
            item =>
                item.id === id
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
            item =>
                item.id !== id
        );


    saveQuotes();

    renderQuotes();

    updateDashboard();

    showToast(
        "Cotação excluída."
    );
}


/* =========================================================
   ECONOMIA POSSÍVEL
========================================================= */

function calculatePossibleSavings() {

    const grouped = {};


    quotes.forEach(
        quote => {

            const key = [

                String(
                    quote.product || ""
                )
                    .trim()
                    .toLowerCase(),

                String(
                    quote.category || ""
                )
                    .trim()
                    .toLowerCase(),

                String(
                    quote.subcategory || ""
                )
                    .trim()
                    .toLowerCase()

            ].join("|");


            if (!grouped[key]) {

                grouped[key] = [];
            }


            grouped[key].push(
                Number(
                    quote.price
                ) || 0
            );

        }
    );


    let totalSaving = 0;


    Object.values(grouped)
        .forEach(
            prices => {

                if (
                    prices.length < 2
                ) {
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

            }
        );


    return totalSaving;
}


/* =========================================================
   DASHBOARD
========================================================= */

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


    renderRecentExpenses();

    renderCategorySummary();
}


/* =========================================================
   DASHBOARD — ÚLTIMAS DESPESAS
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

                <div class="empty-icon">
                    💸
                </div>

                <strong>
                    Nenhuma despesa ainda
                </strong>

                <p>
                    Suas despesas recentes aparecerão aqui.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        recent
            .map(
                expense => `

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

                `
            )
            .join("");
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
        Object.entries(
            totals
        )
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
                    Cadastre despesas para visualizar o resumo.
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

                        <div class="category-summary-item">

                            <div class="category-summary-header">

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


/* =========================================================
   CATEGORIAS — PÁGINA
========================================================= */

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

                                    <span class="subcategory">
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


/* =========================================================
   FILTROS
========================================================= */

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


/* =========================================================
   MODAIS
========================================================= */

function setupModalEvents() {

    const expenseModal =
        document.getElementById(
            "expenseModal"
        );

    const quoteModal =
        document.getElementById(
            "quoteModal"
        );


    expenseModal?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                expenseModal
            ) {

                closeExpenseModal();
            }

        }
    );


    quoteModal?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                quoteModal
            ) {

                closeQuoteModal();
            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeExpenseModal();

                closeQuoteModal();
            }

        }
    );
}


/* =========================================================
   MÁSCARA DE DINHEIRO
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


/* =========================================================
   CONVERTER DINHEIRO
========================================================= */

function parseMoney(value) {

    if (!value) {
        return 0;
    }


    let text =
        String(value)
            .replace(
                /[^\d,.-]/g,
                ""
            );


    if (
        text.includes(",")
    ) {

        text =
            text.replace(
                /\./g,
                ""
            );


        text =
            text.replace(
                ",",
                "."
            );
    }


    const result =
        parseFloat(text);


    return isNaN(result)
        ? 0
        : result;
}


/* =========================================================
   FORMATAR MOEDA
========================================================= */

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
   DATA ATUAL
========================================================= */

function getTodayDate() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;
}


/* =========================================================
   MÊS ATUAL
========================================================= */

function getCurrentMonth() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}`;
}


/* =========================================================
   FORMATAR DATA
========================================================= */

function formatDate(
    dateString
) {

    if (!dateString) {
        return "-";
    }


    const parts =
        String(
            dateString
        ).split("-");


    if (
        parts.length === 3
    ) {

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }


    const date =
        new Date(
            dateString
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return dateString;
    }


    return date.toLocaleDateString(
        "pt-BR"
    );
}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escapeHTML(
    value
) {

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


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message
) {

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
        toastTimeout
    );


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );
}