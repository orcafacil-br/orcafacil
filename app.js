const STORAGE_KEY = "orcafacil_data_v2";
const QUOTES_STORAGE_KEY = "orcafacil_quotes_v1";

let appData = {
    expenses: [],
    budgets: [],
    monthlyBalance: 0,
    budgetMode: "auto",
    budgetPercentage: 70
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

document.addEventListener(
    "DOMContentLoaded",
    init
);


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

    setupBudgetPlanner();

    setupModalEvents();

    renderCategories();

    renderExpenses();

    renderQuotes();

    updateDashboard();
}


/* =====================================================
   STORAGE — DESPESAS
===================================================== */

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
                    : [],

            monthlyBalance:
                Number(
                    parsed.monthlyBalance || 0
                ),

            budgetMode:
                parsed.budgetMode === "manual"
                    ? "manual"
                    : "auto",

            budgetPercentage:
                normalizeBudgetPercentage(
                    parsed.budgetPercentage || 70
                )

        };

    } catch (error) {

        console.error(
            "Erro ao carregar dados:",
            error
        );

        appData = {
            expenses: [],
            budgets: [],
            monthlyBalance: 0,
            budgetMode: "auto",
            budgetPercentage: 70
        };
    }
}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );
}


/* =====================================================
   STORAGE — COTAÇÕES
===================================================== */

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
        .querySelectorAll(".menu-item")
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
            "mobile-open"
        );
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
                "mobile-open"
            );

        }
    );
}


/* =====================================================
   TEMA
===================================================== */

function loadTheme() {

    const dark =
        localStorage.getItem(
            "orcafacil_theme"
        ) === "dark";


    document.body.classList.toggle(
        "dark",
        dark
    );


    updateThemeButton();
}


function toggleTheme() {

    const isDark =
        !document.body.classList.contains(
            "dark"
        );


    document.body.classList.toggle(
        "dark",
        isDark
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

    const dark =
        document.body.classList.contains(
            "dark"
        );


    const icon =
        document.getElementById(
            "themeIcon"
        );


    const text =
        document.getElementById(
            "themeText"
        );


    if (icon) {

        icon.textContent =
            dark
                ? "☀️"
                : "🌙";
    }


    if (text) {

        text.textContent =
            dark
                ? "Modo claro"
                : "Modo escuro";
    }
}


document.addEventListener(
    "click",
    event => {

        if (
            event.target.closest(
                "#themeToggle"
            )
        ) {

            toggleTheme();
        }

    }
);


/* =====================================================
   SELECTS
===================================================== */

function populateSelect(
    select,
    values,
    firstLabel
) {

    if (!select) {
        return;
    }


    select.innerHTML =
        `<option value="">
            ${firstLabel}
        </option>`;


    values.forEach(value => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            value;


        option.textContent =
            value;


        select.appendChild(
            option
        );

    });
}


function populateCategorySelects() {

    const values =
        Object.keys(
            categories
        );


    populateSelect(
        document.getElementById(
            "expenseCategory"
        ),
        values,
        "Selecione"
    );


    populateSelect(
        document.getElementById(
            "expenseCategoryFilter"
        ),
        values,
        "Todas as categorias"
    );
}


function populateQuoteCategorySelect() {

    const values =
        Object.keys(
            categories
        );


    populateSelect(
        document.getElementById(
            "quoteCategory"
        ),
        values,
        "Selecione"
    );


    populateSelect(
        document.getElementById(
            "quoteCategoryFilter"
        ),
        values,
        "Todas as categorias"
    );
}


/* =====================================================
   SUBCATEGORIAS
===================================================== */

function updateSubcategories(
    selectedValue = ""
) {

    const category =
        document.getElementById(
            "expenseCategory"
        )?.value;


    const select =
        document.getElementById(
            "expenseSubcategory"
        );


    if (!select) {
        return;
    }


    const values =
        categories[
            category
        ] || [];


    populateSelect(
        select,
        values,
        "Selecione"
    );


    if (
        selectedValue &&
        values.includes(
            selectedValue
        )
    ) {

        select.value =
            selectedValue;
    }
}


function updateQuoteSubcategories(
    selectedValue = ""
) {

    const category =
        document.getElementById(
            "quoteCategory"
        )?.value;


    const select =
        document.getElementById(
            "quoteSubcategory"
        );


    if (!select) {
        return;
    }


    const values =
        categories[
            category
        ] || [];


    populateSelect(
        select,
        values,
        "Selecione"
    );


    if (
        selectedValue &&
        values.includes(
            selectedValue
        )
    ) {

        select.value =
            selectedValue;
    }
}


/* =====================================================
   FORMULÁRIO DE DESPESAS
===================================================== */

function setupExpenseForm() {

    const form =
        document.getElementById(
            "expenseForm"
        );


    if (!form) {
        return;
    }


    document
        .getElementById(
            "expenseCategory"
        )
        ?.addEventListener(
            "change",
            () => updateSubcategories()
        );


    const amount =
        document.getElementById(
            "expenseAmount"
        );


    amount?.addEventListener(
        "input",
        () => moneyMask(amount)
    );


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            saveExpense();
        }
    );
}


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


    editingExpenseId =
        expenseId;


    form.reset();


    const title =
        document.getElementById(
            "expenseModalTitle"
        );


    const hiddenId =
        document.getElementById(
            "expenseId"
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


        if (title) {
            title.textContent =
                "Editar despesa";
        }


        if (hiddenId) {
            hiddenId.value =
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

        if (title) {
            title.textContent =
                "Nova despesa";
        }


        if (hiddenId) {
            hiddenId.value =
                "";
        }


        const date =
            document.getElementById(
                "expenseDate"
            );


        if (date) {
            date.value =
                getTodayDate();
        }
    }


    modal.classList.add(
        "show"
    );


    setTimeout(
        () => {

            document.getElementById(
                "expenseDescription"
            )?.focus();

        },
        50
    );
}


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


function saveExpense() {

    const description =
        document.getElementById(
            "expenseDescription"
        )?.value.trim();


    const category =
        document.getElementById(
            "expenseCategory"
        )?.value;


    const subcategory =
        document.getElementById(
            "expenseSubcategory"
        )?.value;


    const amount =
        parseMoney(
            document.getElementById(
                "expenseAmount"
            )?.value
        );


    const date =
        document.getElementById(
            "expenseDate"
        )?.value ||
        getTodayDate();


    const notes =
        document.getElementById(
            "expenseNotes"
        )?.value.trim();


    if (!description) {

        showToast(
            "Informe a descrição da despesa."
        );

        return;
    }


    if (!category) {

        showToast(
            "Selecione uma categoria."
        );

        return;
    }


    if (!amount || amount <= 0) {

        showToast(
            "Informe um valor válido."
        );

        return;
    }


    const expense = {

        id:
            editingExpenseId ||
            createId(),

        description,

        category,

        subcategory:
            subcategory || "",

        amount,

        date,

        notes:
            notes || "",

        createdAt:
            new Date().toISOString()

    };


    if (editingExpenseId) {

        const index =
            appData.expenses.findIndex(
                item =>
                    item.id ===
                    editingExpenseId
            );


        if (index !== -1) {

            appData.expenses[
                index
            ] = {

                ...appData.expenses[
                    index
                ],

                ...expense

            };
        }

    } else {

        appData.expenses.unshift(
            expense
        );
    }


    saveData();

    closeExpenseModal();

    renderExpenses();

    updateDashboard();

    showToast(
        editingExpenseId
            ? "Despesa atualizada."
            : "Despesa adicionada."
    );
}


function editExpense(
    expenseId
) {

    openExpenseModal(
        expenseId
    );
}


function deleteExpense(
    expenseId
) {

    const expense =
        appData.expenses.find(
            item =>
                item.id ===
                expenseId
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
                item.id !==
                expenseId
        );


    saveData();

    renderExpenses();

    updateDashboard();

    showToast(
        "Despesa excluída."
    );
}


/* =====================================================
   FORMULÁRIO DE COTAÇÕES
===================================================== */

function setupQuoteForm() {

    const form =
        document.getElementById(
            "quoteForm"
        );


    if (!form) {
        return;
    }


    document
        .getElementById(
            "quoteCategory"
        )
        ?.addEventListener(
            "change",
            () => updateQuoteSubcategories()
        );


    const price =
        document.getElementById(
            "quotePrice"
        );


    price?.addEventListener(
        "input",
        () => moneyMask(price)
    );


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            saveQuote();
        }
    );
}


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


    editingQuoteId =
        quoteId;


    form.reset();


    const title =
        document.getElementById(
            "quoteModalTitle"
        );


    const hiddenId =
        document.getElementById(
            "quoteId"
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


        if (title) {
            title.textContent =
                "Editar cotação";
        }


        if (hiddenId) {
            hiddenId.value =
                quote.id;
        }


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

        if (title) {
            title.textContent =
                "Nova cotação";
        }


        if (hiddenId) {
            hiddenId.value =
                "";
        }


        document.getElementById(
            "quoteDate"
        ).value =
            getTodayDate();
    }


    modal.classList.add(
        "show"
    );
}


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


function saveQuote() {

    const product =
        document.getElementById(
            "quoteProduct"
        )?.value.trim();


    const category =
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
        parseMoney(
            document.getElementById(
                "quotePrice"
            )?.value
        );


    const date =
        document.getElementById(
            "quoteDate"
        )?.value ||
        getTodayDate();


    const notes =
        document.getElementById(
            "quoteNotes"
        )?.value.trim();


    if (!product) {

        showToast(
            "Informe o produto ou serviço."
        );

        return;
    }


    if (!category) {

        showToast(
            "Selecione uma categoria."
        );

        return;
    }


    if (!price || price <= 0) {

        showToast(
            "Informe um preço válido."
        );

        return;
    }


    const quote = {

        id:
            editingQuoteId ||
            createId(),

        product,

        category,

        subcategory:
            subcategory || "",

        store:
            store || "",

        price,

        date,

        notes:
            notes || "",

        createdAt:
            new Date().toISOString()

    };


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

                ...quote

            };
        }

    } else {

        quotes.unshift(
            quote
        );
    }


    saveQuotes();

    closeQuoteModal();

    renderQuotes();

    updateDashboard();

    showToast(
        editingQuoteId
            ? "Cotação atualizada."
            : "Cotação adicionada."
    );
}


function editQuote(
    quoteId
) {

    openQuoteModal(
        quoteId
    );
}


function deleteQuote(
    quoteId
) {

    const quote =
        quotes.find(
            item =>
                item.id ===
                quoteId
        );


    if (!quote) {
        return;
    }


    const confirmed =
        window.confirm(
            `Excluir a cotação de "${quote.product}"?`
        );


    if (!confirmed) {
        return;
    }


    quotes =
        quotes.filter(
            item =>
                item.id !==
                quoteId
        );


    saveQuotes();

    renderQuotes();

    updateDashboard();

    showToast(
        "Cotação excluída."
    );
}


/* =====================================================
   ORDENAR / FILTRAR DESPESAS
===================================================== */

function getFilteredExpenses() {

    const search =
        document.getElementById(
            "expenseSearch"
        )?.value
            .trim()
            .toLowerCase() || "";


    const category =
        document.getElementById(
            "expenseCategoryFilter"
        )?.value || "";


    const month =
        document.getElementById(
            "expenseMonthFilter"
        )?.value || "";


    return appData.expenses
        .filter(expense => {

            const matchesSearch =
                !search ||
                expense.description
                    ?.toLowerCase()
                    .includes(search) ||
                expense.category
                    ?.toLowerCase()
                    .includes(search) ||
                expense.subcategory
                    ?.toLowerCase()
                    .includes(search) ||
                expense.notes
                    ?.toLowerCase()
                    .includes(search);


            const matchesCategory =
                !category ||
                expense.category ===
                    category;


            const matchesMonth =
                !month ||
                String(
                    expense.date || ""
                ).startsWith(
                    month
                );


            return (
                matchesSearch &&
                matchesCategory &&
                matchesMonth
            );

        })
        .sort(
            (
                a,
                b
            ) =>
                String(
                    b.date || ""
                ).localeCompare(
                    String(
                        a.date || ""
                    )
                )
        );
}


/* =====================================================
   RENDER — DESPESAS
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


    if (!container) {
        return;
    }


    const expenses =
        getFilteredExpenses();


    if (!expenses.length) {

        container.innerHTML =
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


    container.innerHTML =
        expenses
            .map(
                expense => `

                    <tr>

                        <td>

                            <strong>
                                ${escapeHTML(
                                    expense.description
                                )}
                            </strong>

                            ${
                                expense.notes
                                    ? `
                                        <small>
                                            ${escapeHTML(
                                                expense.notes
                                            )}
                                        </small>
                                      `
                                    : ""
                            }

                        </td>


                        <td>

                            <span class="category-badge">
                                ${escapeHTML(
                                    expense.category
                                )}
                            </span>

                            ${
                                expense.subcategory
                                    ? `
                                        <small>
                                            ${escapeHTML(
                                                expense.subcategory
                                            )}
                                        </small>
                                      `
                                    : ""
                            }

                        </td>


                        <td>
                            ${formatCurrency(
                                expense.amount
                            )}
                        </td>


                        <td>
                            ${formatDate(
                                expense.date
                            )}
                        </td>


                        <td class="actions">

                            <button
                                class="icon-button"
                                type="button"
                                title="Editar"
                                onclick="editExpense('${expense.id}')">
                                ✏️
                            </button>

                            <button
                                class="icon-button danger"
                                type="button"
                                title="Excluir"
                                onclick="deleteExpense('${expense.id}')">
                                🗑️
                            </button>

                        </td>

                    </tr>

                `
            )
            .join("");
}


/* =====================================================
   RENDER — COTAÇÕES
===================================================== */

function getFilteredQuotes() {

    const search =
        document.getElementById(
            "quoteSearch"
        )?.value
            .trim()
            .toLowerCase() || "";


    const category =
        document.getElementById(
            "quoteCategoryFilter"
        )?.value || "";


    return quotes
        .filter(quote => {

            const matchesSearch =
                !search ||
                quote.product
                    ?.toLowerCase()
                    .includes(search) ||
                quote.store
                    ?.toLowerCase()
                    .includes(search) ||
                quote.category
                    ?.toLowerCase()
                    .includes(search) ||
                quote.subcategory
                    ?.toLowerCase()
                    .includes(search) ||
                quote.notes
                    ?.toLowerCase()
                    .includes(search);


            const matchesCategory =
                !category ||
                quote.category ===
                    category;


            return (
                matchesSearch &&
                matchesCategory
            );

        })
        .sort(
            (
                a,
                b
            ) =>
                String(
                    b.date || ""
                ).localeCompare(
                    String(
                        a.date || ""
                    )
                )
        );
}


function renderQuotes() {

    const container =
        document.getElementById(
            "quotesContainer"
        );


    const empty =
        document.getElementById(
            "quotesEmpty"
        );


    if (!container) {
        return;
    }


    const filtered =
        getFilteredQuotes();


    if (!filtered.length) {

        container.innerHTML =
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


    container.innerHTML =
        filtered
            .map(
                quote => `

                    <article class="quote-card">

                        <div class="quote-card-main">

                            <div>

                                <span class="quote-category">
                                    ${escapeHTML(
                                        quote.category
                                    )}
                                </span>

                                <h3>
                                    ${escapeHTML(
                                        quote.product
                                    )}
                                </h3>

                                ${
                                    quote.subcategory
                                        ? `
                                            <p class="quote-subcategory">
                                                ${escapeHTML(
                                                    quote.subcategory
                                                )}
                                            </p>
                                          `
                                        : ""
                                }

                            </div>


                            <strong class="quote-price">
                                ${formatCurrency(
                                    quote.price
                                )}
                            </strong>

                        </div>


                        <div class="quote-meta">

                            <span>
                                🏪
                                ${escapeHTML(
                                    quote.store ||
                                    "Sem loja informada"
                                )}
                            </span>

                            <span>
                                📅
                                ${formatDate(
                                    quote.date
                                )}
                            </span>

                        </div>


                        <details>

                            <summary>
                                Mais detalhes
                            </summary>

                            <div class="quote-details">

                                ${
                                    quote.notes
                                        ? `
                                            <p>
                                                <strong>
                                                    Observação:
                                                </strong>

                                                ${escapeHTML(
                                                    quote.notes
                                                )}
                                            </p>
                                          `
                                        : `
                                            <p>
                                                Nenhuma observação registrada.
                                            </p>
                                          `
                                }

                            </div>

                        </details>


                        <div class="quote-actions">

                            <button
                                type="button"
                                class="btn btn-secondary"
                                onclick="editQuote('${quote.id}')">
                                ✏️ Editar
                            </button>

                            <button
                                type="button"
                                class="btn btn-danger"
                                onclick="deleteQuote('${quote.id}')">
                                🗑️ Excluir
                            </button>

                        </div>

                    </article>

                `
            )
            .join("");
}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const month =
        getCurrentMonth();


    const monthExpenses =
        appData.expenses.filter(
            expense =>
                String(
                    expense.date || ""
                ).startsWith(
                    month
                )
        );


    const spent =
        monthExpenses.reduce(
            (
                total,
                expense
            ) =>
                total +
                Number(
                    expense.amount
                || 0
                ),
            0
        );


    const planned =
        getPlannedQuotesTotal();


    const balance =
        Number(
            appData.monthlyBalance
        ) || 0;


    const plan =
        calculateBudgetPlan(
            balance,
            spent,
            planned
        );


    setText(
        "dashboardBudget",
        formatCurrency(
            plan.spendingLimit
        )
    );


    setText(
        "dashboardSpent",
        formatCurrency(
            spent
        )
    );


    setText(
        "dashboardPlanned",
        formatCurrency(
            planned
        )
    );


    setText(
        "dashboardProjected",
        formatCurrency(
            plan.remainingAfterPlanned
        )
    );


    setText(
        "dashboardProjectedLabel",
        plan.remainingAfterPlanned < 0
            ? "Déficit projetado"
            : "Saldo após planejamento"
    );


    setText(
        "quoteCount",
        String(
            quotes.length
        )
    );


    setText(
        "totalExpenses",
        formatCurrency(
            spent
        )
    );


    updateSalaryInput();

    updateBudgetPlanning();

    renderDashboardQuotes();

    renderRecentExpenses();

    renderPurchaseStatus();

    renderCategorySummary();
}


/* =====================================================
   PLANEJAMENTO DE ORÇAMENTO
===================================================== */

function setupBudgetControl() {

    const input =
        document.getElementById(
            "salaryInput"
        );


    if (!input) {
        return;
    }


    input.value =
        formatSalaryInputValue(
            appData.monthlyBalance
        );


    input.addEventListener(
        "input",
        () => salaryMask(input)
    );


    input.addEventListener(
        "blur",
        () => {

            input.value =
                formatSalaryInputValue(
                    parseSalary(
                        input.value
                    )
                );

        }
    );
}


function setupBudgetPlanner() {

    document
        .querySelectorAll(
            "[data-budget-mode]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    setBudgetMode(
                        button.dataset
                            .budgetMode
                    );

                }
            );

        });


    document
        .querySelectorAll(
            "[data-budget-percentage]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    setBudgetPercentage(
                        Number(
                            button.dataset
                                .budgetPercentage
                        )
                    );

                }
            );

        });


    updateBudgetPlannerControls();
}


function normalizeBudgetPercentage(
    value
) {

    const allowed = [
        50,
        60,
        70,
        80,
        90
    ];


    const numeric =
        Number(value);


    return allowed.includes(
        numeric
    )
        ? numeric
        : 70;
}


function calculateAutomaticPercentage(
    balance,
    spent,
    planned
) {

    if (!balance || balance <= 0) {
        return 70;
    }


    const committed =
        spent +
        planned;


    const committedRatio =
        committed /
        balance;


    if (committedRatio >= 0.90) {
        return 50;
    }


    if (committedRatio >= 0.75) {
        return 60;
    }


    if (committedRatio >= 0.55) {
        return 70;
    }


    return 80;
}


function calculateBudgetPlan(
    balance,
    spent,
    planned
) {

    const safeBalance =
        Math.max(
            Number(balance) || 0,
            0
        );


    const safeSpent =
        Math.max(
            Number(spent) || 0,
            0
        );


    const safePlanned =
        Math.max(
            Number(planned) || 0,
            0
        );


    const percentage =
        appData.budgetMode ===
            "manual"

            ? normalizeBudgetPercentage(
                appData.budgetPercentage
            )

            : calculateAutomaticPercentage(
                safeBalance,
                safeSpent,
                safePlanned
            );


    const spendingLimit =
        safeBalance *
        (
            percentage /
            100
        );


    const reserve =
        safeBalance -
        spendingLimit;


    const usedAgainstLimit =
        spendingLimit > 0
            ? (
                safeSpent /
                spendingLimit
            ) * 100
            : 0;


    const remainingToSpend =
        spendingLimit -
        safeSpent;


    const remainingAfterPlanned =
        spendingLimit -
        safeSpent -
        safePlanned;


    let status =
        "safe";


    if (
        remainingAfterPlanned <
        0
    ) {

        status =
            "danger";

    } else if (
        usedAgainstLimit >=
        85
    ) {

        status =
            "warning";
    }


    return {

        percentage,

        spendingLimit,

        reserve,

        usedAgainstLimit,

        remainingToSpend,

        remainingAfterPlanned,

        status

    };
}


function setBudgetMode(
    mode
) {

    appData.budgetMode =
        mode === "manual"
            ? "manual"
            : "auto";


    saveData();

    updateBudgetPlannerControls();

    updateBudgetPlanning();

    updateDashboard();

    showToast(
        appData.budgetMode ===
            "manual"
            ? "Modo manual ativado."
            : "Plano automático ativado."
    );
}


function setBudgetPercentage(
    percentage
) {

    const normalized =
        normalizeBudgetPercentage(
            percentage
        );


    appData.budgetPercentage =
        normalized;


    appData.budgetMode =
        "manual";


    saveData();

    updateBudgetPlannerControls();

    updateBudgetPlanning();

    updateDashboard();

    showToast(
        `Teto manual definido em ${normalized}%.`
    );
}


function updateBudgetPlannerControls() {

    document
        .querySelectorAll(
            "[data-budget-mode]"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset
                    .budgetMode ===
                    appData.budgetMode
            );

        });


    document
        .querySelectorAll(
            "[data-budget-percentage]"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                appData.budgetMode ===
                    "manual" &&
                Number(
                    button.dataset
                        .budgetPercentage
                ) ===
                    appData.budgetPercentage
            );

        });
}


function updateSalaryInput() {

    const input =
        document.getElementById(
            "salaryInput"
        );


    if (!input) {
        return;
    }


    if (
        document.activeElement !==
        input
    ) {

        input.value =
            formatSalaryInputValue(
                appData.monthlyBalance
            );
    }
}


function saveSalary() {

    const input =
        document.getElementById(
            "salaryInput"
        );


    if (!input) {
        return;
    }


    const value =
        parseSalary(
            input.value
        );


    appData.monthlyBalance =
        value;


    saveData();

    input.value =
        formatSalaryInputValue(
            value
        );


    updateDashboard();

    showToast(
        value > 0
            ? "Saldo disponível salvo."
            : "Saldo zerado."
    );
}


function saveMonthlyBalance() {

    saveSalary();
}


function clearSalary() {

    const confirmed =
        window.confirm(
            "Tem certeza que deseja limpar o saldo disponível deste mês?"
        );


    if (!confirmed) {
        return;
    }


    appData.monthlyBalance =
        0;


    saveData();


    const input =
        document.getElementById(
            "salaryInput"
        );


    if (input) {
        input.value =
            "";
    }


    updateDashboard();

    showToast(
        "Saldo disponível foi limpo."
    );
}


function parseSalary(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {
        return 0;
    }


    const text =
        String(value)
            .trim();


    if (!text) {
        return 0;
    }


    const digits =
        text.replace(
            /\D/g,
            ""
        );


    if (!digits) {
        return 0;
    }


    return (
        parseInt(
            digits,
            10
        ) / 100
    );
}


function salaryMask(
    input
) {

    if (!input) {
        return;
    }


    const digits =
        String(
            input.value || ""
        )
            .replace(
                /\D/g,
                ""
            );


    if (!digits) {

        input.value =
            "";

        return;
    }


    const value =
        parseInt(
            digits,
            10
        ) / 100;


    input.value =
        new Intl.NumberFormat(
            "pt-BR",
            {
                style:
                    "currency",

                currency:
                    "BRL"
            }
        )
            .format(
                value
            );
}


function formatSalaryInputValue(
    value
) {

    const numeric =
        Number(value) || 0;


    if (!numeric) {
        return "";
    }


    return new Intl.NumberFormat(
        "pt-BR",
        {
            style:
                "currency",

            currency:
                "BRL"
        }
    )
        .format(
            numeric
        );
}


function getPlannedQuotesTotal() {

    return quotes.reduce(
        (
            total,
            quote
        ) =>
            total +
            (
                Number(
                    quote.price
                ) || 0
            ),
        0
    );
}


function updateBudgetPlanning() {

    const balance =
        Number(
            appData.monthlyBalance
        ) || 0;


    const month =
        getCurrentMonth();


    const spent =
        appData.expenses
            .filter(
                expense =>
                    String(
                        expense.date || ""
                    ).startsWith(
                        month
                    )
            )
            .reduce(
                (
                    total,
                    expense
                ) =>
                    total +
                    (
                        Number(
                            expense.amount
                        ) || 0
                    ),
                0
            );


    const planned =
        getPlannedQuotesTotal();


    const plan =
        calculateBudgetPlan(
            balance,
            spent,
            planned
        );


    setText(
        "budgetProgressLabel",
        `${formatCurrency(
            spent
        )} de ${formatCurrency(
            plan.spendingLimit
        )}`
    );


    setText(
        "budgetProgressPercent",
        `${Math.round(
            Math.min(
                plan.usedAgainstLimit,
                999
            )
        )}%`
    );


    const progress =
        document.getElementById(
            "budgetProgress"
        );


    if (progress) {

        progress.style.width =
            `${Math.min(
                Math.max(
                    plan.usedAgainstLimit,
                    0
                ),
                100
            )}%`;


        progress.classList.remove(
            "safe",
            "warning",
            "danger"
        );


        progress.classList.add(
            plan.status
        );
    }


    const badge =
        document.getElementById(
            "budgetStatusBadge"
        );


    const statusText =
        document.getElementById(
            "budgetStatusText"
        );


    if (badge) {

        badge.classList.remove(
            "safe",
            "warning",
            "danger"
        );


        badge.classList.add(
            plan.status
        );
    }


    if (statusText) {

        if (plan.status === "danger") {

            statusText.textContent =
                "Teto ultrapassado";

        } else if (
            plan.status === "warning"
        ) {

            statusText.textContent =
                "Atenção aos gastos";

        } else {

            statusText.textContent =
                "Dentro do planejamento";
        }
    }


    setText(
        "budgetPlanMode",
        appData.budgetMode ===
            "manual"
            ? "Manual"
            : "Automático"
    );


    setText(
        "budgetPlanPercentage",
        `${plan.percentage}%`
    );


    setText(
        "budgetPlanLimit",
        formatCurrency(
            plan.spendingLimit
        )
    );


    setText(
        "budgetPlanReserve",
        formatCurrency(
            plan.reserve
        )
    );


    setText(
        "budgetPlanRemaining",
        formatCurrency(
            Math.max(
                plan.remainingToSpend,
                0
            )
        )
    );
}


/* =====================================================
   STATUS DE COMPRA
===================================================== */

function renderPurchaseStatus() {

    const icon =
        document.getElementById(
            "purchaseStatusIcon"
        );


    const title =
        document.getElementById(
            "purchaseStatusTitle"
        );


    const description =
        document.getElementById(
            "purchaseStatusDescription"
        );


    if (
        !icon ||
        !title ||
        !description
    ) {
        return;
    }


    const balance =
        Number(
            appData.monthlyBalance
        ) || 0;


    const month =
        getCurrentMonth();


    const spent =
        appData.expenses
            .filter(
                expense =>
                    String(
                        expense.date || ""
                    ).startsWith(
                        month
                    )
            )
            .reduce(
                (
                    total,
                    expense
                ) =>
                    total +
                    (
                        Number(
                            expense.amount
                        ) || 0
                    ),
                0
            );


    const planned =
        getPlannedQuotesTotal();


    const plan =
        calculateBudgetPlan(
            balance,
            spent,
            planned
        );


    if (!balance) {

        icon.textContent =
            "💡";

        title.textContent =
            "Informe seu saldo disponível";

        description.textContent =
            "Cadastre quanto você tem disponível neste mês para ativar o planejamento de gastos.";

        return;
    }


    if (
        plan.remainingAfterPlanned <
        0
    ) {

        icon.textContent =
            "🔴";

        title.textContent =
            "Risco de perda";

        description.textContent =
            `Seu planejamento ultrapassa o teto em ${formatCurrency(
                Math.abs(
                    plan.remainingAfterPlanned
                )
            )}. Evite novos gastos até reorganizar o orçamento.`;

        return;
    }


    if (
        plan.usedAgainstLimit >=
        85
    ) {

        icon.textContent =
            "🟡";

        title.textContent =
            "Cuidado";

        description.textContent =
            `Você já utilizou ${Math.round(
                plan.usedAgainstLimit
            )}% do teto de gastos. Ainda pode gastar aproximadamente ${formatCurrency(
                Math.max(
                    plan.remainingToSpend,
                    0
                )
            )}.`;

        return;
    }


    icon.textContent =
        "🟢";

    title.textContent =
        "Pode comprar";

    description.textContent =
        `Seu planejamento está dentro do limite. Você ainda tem aproximadamente ${formatCurrency(
            Math.max(
                plan.remainingToSpend,
                0
            )
        )} disponíveis para gastos.`;
}


/* =====================================================
   DASHBOARD — COTAÇÕES
===================================================== */

function renderDashboardQuotes() {

    const container =
        document.getElementById(
            "dashboardQuotes"
        );


    const empty =
        document.getElementById(
            "dashboardQuotesEmpty"
        );


    if (!container) {
        return;
    }


    const latest =
        quotes
            .slice()
            .sort(
                (
                    a,
                    b
                ) =>
                    String(
                        b.date || ""
                    ).localeCompare(
                        String(
                            a.date || ""
                        )
                    )
            )
            .slice(
                0,
                6
            );


    if (!latest.length) {

        container.innerHTML =
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


    container.innerHTML =
        latest
            .map(
                quote => `

                    <article class="dashboard-quote-item">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    quote.product
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    quote.store ||
                                    "Sem loja"
                                )}
                            </span>

                        </div>


                        <strong>
                            ${formatCurrency(
                                quote.price
                            )}
                        </strong>

                    </article>

                `
            )
            .join("");
}


/* =====================================================
   DASHBOARD — DESPESAS RECENTES
===================================================== */

function renderRecentExpenses() {

    const container =
        document.getElementById(
            "recentExpenses"
        );


    const empty =
        document.getElementById(
            "recentExpensesEmpty"
        );


    if (!container) {
        return;
    }


    const recent =
        appData.expenses
            .slice()
            .sort(
                (
                    a,
                    b
                ) =>
                    String(
                        b.date || ""
                    ).localeCompare(
                        String(
                            a.date || ""
                        )
                    )
            )
            .slice(
                0,
                6
            );


    if (!recent.length) {

        container.innerHTML =
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


    container.innerHTML =
        recent
            .map(
                expense => `

                    <article class="recent-expense-item">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    expense.description
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    expense.category
                                )}
                                ${
                                    expense.subcategory
                                        ? ` • ${escapeHTML(
                                            expense.subcategory
                                        )}`
                                        : ""
                                }
                            </span>

                        </div>


                        <div>

                            <strong>
                                ${formatCurrency(
                                    expense.amount
                                )}
                            </strong>

                            <span>
                                ${formatDate(
                                    expense.date
                                )}
                            </span>

                        </div>

                    </article>

                `
            )
            .join("");
}


/* =====================================================
   RESUMO POR CATEGORIA
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
                (
                    Number(
                        expense.amount
                    ) || 0
                );

        }
    );


    const entries =
        Object.entries(
            totals
        )
            .sort(
                (
                    a,
                    b
                ) =>
                    b[1] -
                    a[1]
            );


    if (!entries.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📊
                </div>

                <h3>
                    Nenhum gasto registrado
                </h3>

                <p>
                    Cadastre despesas para visualizar o resumo.
                </p>

            </div>

        `;

        return;
    }


    const max =
        entries[0][1];


    container.innerHTML =
        entries
            .map(
                (
                    [
                        category,
                        total
                    ]
                ) => {

                    const percentage =
                        max > 0
                            ? (
                                total /
                                max
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
                                    style="width:${percentage}%">
                                </div>

                            </div>

                        </div>

                    `;
                }
            )
            .join("");
}


/* =====================================================
   CATEGORIAS
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
                (
                    [
                        category,
                        subcategories
                    ]
                ) => `

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


/* =====================================================
   FILTROS
===================================================== */

function setupFilters() {

    document
        .getElementById(
            "expenseSearch"
        )
        ?.addEventListener(
            "input",
            renderExpenses
        );


    document
        .getElementById(
            "expenseCategoryFilter"
        )
        ?.addEventListener(
            "change",
            renderExpenses
        );


    document
        .getElementById(
            "expenseMonthFilter"
        )
        ?.addEventListener(
            "change",
            renderExpenses
        );


    document
        .getElementById(
            "quoteSearch"
        )
        ?.addEventListener(
            "input",
            renderQuotes
        );


    document
        .getElementById(
            "quoteCategoryFilter"
        )
        ?.addEventListener(
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


/* =====================================================
   MÁSCARA — DESPESAS E COTAÇÕES
===================================================== */

function moneyMask(
    input
) {

    if (!input) {
        return;
    }


    const digits =
        String(
            input.value || ""
        )
            .replace(
                /\D/g,
                ""
            );


    if (!digits) {

        input.value =
            "";

        return;
    }


    input.value =
        new Intl.NumberFormat(
            "pt-BR",
            {
                style:
                    "currency",

                currency:
                    "BRL"
            }
        )
            .format(
                parseInt(
                    digits,
                    10
                ) / 100
            );
}


/* =====================================================
   PARSE DE DINHEIRO
===================================================== */

function parseMoney(
    value
) {

    if (!value) {
        return 0;
    }


    let text =
        String(
            value
        )
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
        parseFloat(
            text
        );


    return Number.isNaN(
        result
    )
        ? 0
        : result;
}


/* =====================================================
   FORMATAR MOEDA
===================================================== */

function formatCurrency(
    value
) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style:
                "currency",

            currency:
                "BRL"
        }
    )
        .format(
            Number(
                value
            ) || 0
        );
}


/* =====================================================
   DATA
===================================================== */

function getTodayDate() {

    const date =
        new Date();


    return `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(
        2,
        "0"
    )}-${String(
        date.getDate()
    ).padStart(
        2,
        "0"
    )}`;
}


function getCurrentMonth() {

    const date =
        new Date();


    return `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(
        2,
        "0"
    )}`;
}


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


    return String(
        dateString
    );
}


/* =====================================================
   HELPERS
===================================================== */

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


function createId() {

    return `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;
}


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


/* =====================================================
   TOAST
===================================================== */

let toastTimeout;


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


    if (
        !toast ||
        !toastMessage
    ) {

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


window.clearSalary = clearSalary;
window.setBudgetMode = setBudgetMode;
window.setBudgetPercentage = setBudgetPercentage;
window.saveSalary = saveSalary;