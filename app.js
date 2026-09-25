/* =========================================================
   ORÇAFÁCIL
   Controle financeiro pessoal
========================================================= */

const STORAGE_KEY = "orcafacil_data_v3";
const QUOTES_STORAGE_KEY = "orcafacil_quotes_v2";
const THEME_KEY = "orcafacil_theme";

let appData = {
    expenses: [],
    monthlyBalance: 0,
    budgetMode: "auto",
    budgetPercentage: 70
};

let quotes = [];

let editingExpenseId = null;
let editingQuoteId = null;

let toastTimeout = null;


/* =========================================================
   CATEGORIAS
========================================================= */

const categories = {

    "Supermercado": [
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

    "Alimentação": [
        "Restaurante",
        "Lanche",
        "Delivery",
        "Café",
        "Fast food",
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
        "Viagens",
        "Jogos",
        "Eventos",
        "Restaurantes",
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
    setupBudgetPlanner();

    setupDashboardButtons();
    setupModalEvents();

    populateMonthFilter();

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

        if (!saved) {
            return;
        }

        const parsed = JSON.parse(saved);

        appData = {
            expenses: Array.isArray(parsed.expenses)
                ? parsed.expenses
                : [],

            monthlyBalance: Number(
                parsed.monthlyBalance || 0
            ),

            budgetMode:
                parsed.budgetMode === "manual"
                    ? "manual"
                    : "auto",

            budgetPercentage:
                normalizeBudgetPercentage(
                    parsed.budgetPercentage
                )
        };

    } catch (error) {

        console.error(
            "Erro ao carregar dados:",
            error
        );

        appData = {
            expenses: [],
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

        const parsed = JSON.parse(saved);

        quotes = Array.isArray(parsed)
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

    document
        .querySelectorAll(".menu-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showPage(
                        button.dataset.page
                    );
                }
            );
        });
}


function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.toggle(
                "active",
                page.id === pageId
            );
        });


    document
        .querySelectorAll(".menu-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === pageId
            );
        });


    const titles = {
        dashboard: "Visão geral",
        despesas: "Despesas",
        cotacoes: "Cotações",
        categorias: "Categorias"
    };


    const topbarSection =
        document.getElementById(
            "topbarSection"
        );

    if (topbarSection) {

        topbarSection.textContent =
            titles[pageId] || "OrçaFácil";
    }


    const sidebar =
        document.getElementById("sidebar");

    if (sidebar) {

        sidebar.classList.remove(
            "mobile-open"
        );
    }
}


/* =========================================================
   BOTÕES PRINCIPAIS DO DASHBOARD
========================================================= */

function setupDashboardButtons() {

    const expenseButtons = [
        "topbarExpenseButton",
        "dashboardExpenseButton",
        "newExpenseButton"
    ];

    expenseButtons.forEach(id => {

        const button =
            document.getElementById(id);

        if (button) {

            button.addEventListener(
                "click",
                () => openExpenseModal()
            );
        }
    });


    const quoteButton =
        document.getElementById(
            "newQuoteButton"
        );

    if (quoteButton) {

        quoteButton.addEventListener(
            "click",
            () => openQuoteModal()
        );
    }


    const goExpenses =
        document.getElementById(
            "goExpensesButton"
        );

    if (goExpenses) {

        goExpenses.addEventListener(
            "click",
            () => showPage("despesas")
        );
    }


    const goQuotes =
        document.getElementById(
            "goQuotesButton"
        );

    if (goQuotes) {

        goQuotes.addEventListener(
            "click",
            () => showPage("cotacoes")
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
   TEMA
========================================================= */

function loadTheme() {

    const dark =
        localStorage.getItem(
            THEME_KEY
        ) === "dark";

    document.body.classList.toggle(
        "dark",
        dark
    );

    updateThemeButton();
}


function toggleTheme() {

    const dark =
        !document.body.classList.contains(
            "dark"
        );

    document.body.classList.toggle(
        "dark",
        dark
    );

    localStorage.setItem(
        THEME_KEY,
        dark
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


/* =========================================================
   SELECTS
========================================================= */

function populateSelect(
    select,
    values,
    firstLabel
) {

    if (!select) {
        return;
    }

    select.innerHTML = "";

    const first =
        document.createElement(
            "option"
        );

    first.value = "";
    first.textContent = firstLabel;

    select.appendChild(first);


    values.forEach(value => {

        const option =
            document.createElement(
                "option"
            );

        option.value = value;
        option.textContent = value;

        select.appendChild(option);
    });
}


function populateCategorySelects() {

    const values =
        Object.keys(categories);

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
        Object.keys(categories);

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


/* =========================================================
   SUBCATEGORIAS
========================================================= */

function updateSubcategories(
    selectedValue = ""
) {

    const category =
        document.getElementById(
            "expenseCategory"
        )?.value || "";

    const select =
        document.getElementById(
            "expenseSubcategory"
        );

    if (!select) {
        return;
    }

    populateSelect(
        select,
        categories[category] || [],
        "Selecione"
    );

    if (selectedValue) {
        select.value = selectedValue;
    }
}


function updateQuoteSubcategories(
    selectedValue = ""
) {

    const category =
        document.getElementById(
            "quoteCategory"
        )?.value || "";

    const select =
        document.getElementById(
            "quoteSubcategory"
        );

    if (!select) {
        return;
    }

    populateSelect(
        select,
        categories[category] || [],
        "Selecione"
    );

    if (selectedValue) {
        select.value = selectedValue;
    }
}


/* =========================================================
   DESPESAS — FORMULÁRIO
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


    document
        .getElementById(
            "expenseCategory"
        )
        ?.addEventListener(
            "change",
            () => updateSubcategories()
        );


    document
        .getElementById(
            "expenseAmount"
        )
        ?.addEventListener(
            "input",
            event =>
                moneyMask(
                    event.target
                )
        );
}


function openExpenseModal(
    id = null
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

    editingExpenseId = id;


    const title =
        document.getElementById(
            "expenseModalTitle"
        );


    if (id) {

        const expense =
            appData.expenses.find(
                item =>
                    item.id === id
            );

        if (!expense) {
            return;
        }

        title.textContent =
            "Editar despesa";


        document.getElementById(
            "expenseId"
        ).value = expense.id;


        document.getElementById(
            "expenseDescription"
        ).value =
            expense.description || "";


        document.getElementById(
            "expenseCategory"
        ).value =
            expense.category || "";


        updateSubcategories(
            expense.subcategory || ""
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
            expense.date ||
            getTodayDate();


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


    modal.hidden = false;

    requestAnimationFrame(
        () => modal.classList.add("show")
    );


    setTimeout(
        () => {

            document
                .getElementById(
                    "expenseDescription"
                )
                ?.focus();

        },
        50
    );
}


function closeExpenseModal() {

    const modal =
        document.getElementById(
            "expenseModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "show"
    );

    setTimeout(
        () => {
            modal.hidden = true;
        },
        150
    );

    editingExpenseId = null;
}


function saveExpense(event) {

    event.preventDefault();


    const description =
        document
            .getElementById(
                "expenseDescription"
            )
            ?.value
            .trim() || "";


    const category =
        document
            .getElementById(
                "expenseCategory"
            )
            ?.value || "";


    const subcategory =
        document
            .getElementById(
                "expenseSubcategory"
            )
            ?.value || "";


    const amount =
        parseMoney(
            document
                .getElementById(
                    "expenseAmount"
                )
                ?.value || ""
        );


    const date =
        document
            .getElementById(
                "expenseDate"
            )
            ?.value ||
        getTodayDate();


    const notes =
        document
            .getElementById(
                "expenseNotes"
            )
            ?.value
            .trim() || "";


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
            "Informe um valor válido."
        );
        return;
    }


    const data = {

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


    const editing =
        Boolean(
            editingExpenseId
        );


    if (editing) {

        const index =
            appData.expenses.findIndex(
                item =>
                    item.id ===
                    editingExpenseId
            );

        if (index >= 0) {
            appData.expenses[index] =
                data;
        }

    } else {

        appData.expenses.push(
            data
        );
    }


    saveData();

    closeExpenseModal();

    renderExpenses();

    updateDashboard();

    showToast(
        editing
            ? "Despesa atualizada!"
            : "Despesa salva!"
    );
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
            .toLowerCase()
            .trim();


    const category =
        document.getElementById(
            "expenseCategoryFilter"
        )?.value || "";


    const month =
        document.getElementById(
            "expenseMonthFilter"
        )?.value || "";


    let list =
        [...appData.expenses];


    if (search) {

        list =
            list.filter(
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

        list =
            list.filter(
                expense =>
                    expense.category ===
                    category
            );
    }


    if (month) {

        list =
            list.filter(
                expense =>
                    String(
                        expense.date || ""
                    ).startsWith(
                        month
                    )
            );
    }


    list.sort(
        (a, b) =>
            String(
                b.date || ""
            ).localeCompare(
                String(
                    a.date || ""
                )
            )
    );


    empty.style.display =
        list.length
            ? "none"
            : "block";


    tbody.innerHTML =
        list
            .map(
                expense => `

                    <tr>

                        <td>
                            ${formatDate(
                                expense.date
                            )}
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
                                    type="button"
                                    title="Editar"
                                    onclick="openExpenseModal('${expense.id}')">

                                    ✏️

                                </button>

                                <button
                                    class="action-button delete"
                                    type="button"
                                    title="Excluir"
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
        window.confirm(
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
   COTAÇÕES — FORMULÁRIO
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


    document
        .getElementById(
            "quoteCategory"
        )
        ?.addEventListener(
            "change",
            () =>
                updateQuoteSubcategories()
        );


    document
        .getElementById(
            "quotePrice"
        )
        ?.addEventListener(
            "input",
            event =>
                moneyMask(
                    event.target
                )
        );
}


function openQuoteModal(
    id = null
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

    editingQuoteId = id;


    const title =
        document.getElementById(
            "quoteModalTitle"
        );


    if (id) {

        const quote =
            quotes.find(
                item =>
                    item.id === id
            );

        if (!quote) {
            return;
        }


        title.textContent =
            "Editar cotação";


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


        updateQuoteSubcategories(
            quote.subcategory || ""
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
            quote.date ||
            getTodayDate();


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


    modal.hidden = false;

    requestAnimationFrame(
        () => modal.classList.add("show")
    );


    setTimeout(
        () => {

            document
                .getElementById(
                    "quoteProduct"
                )
                ?.focus();

        },
        50
    );
}


function closeQuoteModal() {

    const modal =
        document.getElementById(
            "quoteModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "show"
    );

    setTimeout(
        () => {
            modal.hidden = true;
        },
        150
    );

    editingQuoteId = null;
}


function saveQuote(event) {

    event.preventDefault();


    const product =
        document
            .getElementById(
                "quoteProduct"
            )
            ?.value
            .trim() || "";


    const category =
        document
            .getElementById(
                "quoteCategory"
            )
            ?.value || "";


    const subcategory =
        document
            .getElementById(
                "quoteSubcategory"
            )
            ?.value || "";


    const store =
        document
            .getElementById(
                "quoteStore"
            )
            ?.value
            .trim() || "";


    const price =
        parseMoney(
            document
                .getElementById(
                    "quotePrice"
                )
                ?.value || ""
        );


    const date =
        document
            .getElementById(
                "quoteDate"
            )
            ?.value ||
        getTodayDate();


    const notes =
        document
            .getElementById(
                "quoteNotes"
            )
            ?.value
            .trim() || "";


    if (!product) {

        showToast(
            "Digite o produto."
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
            "Digite a loja."
        );

        return;
    }


    if (price <= 0) {

        showToast(
            "Informe um preço válido."
        );

        return;
    }


    const data = {

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


    const editing =
        Boolean(
            editingQuoteId
        );


    if (editing) {

        const index =
            quotes.findIndex(
                item =>
                    item.id ===
                    editingQuoteId
            );

        if (index >= 0) {
            quotes[index] =
                data;
        }

    } else {

        quotes.push(
            data
        );
    }


    saveQuotes();

    closeQuoteModal();

    renderQuotes();

    updateDashboard();

    showToast(
        editing
            ? "Cotação atualizada!"
            : "Cotação salva!"
    );
}


/* =========================================================
   COTAÇÕES — AGRUPAMENTO
========================================================= */

function groupQuotes(
    list
) {

    const groups = {};


    list.forEach(
        quote => {

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


            if (!groups[key]) {
                groups[key] = [];
            }


            groups[key].push(
                quote
            );
        }
    );


    return Object.values(
        groups
    ).map(
        group =>
            group.sort(
                (a, b) =>
                    Number(a.price) -
                    Number(b.price)
            )
    );
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
            .toLowerCase()
            .trim();


    const category =
        document.getElementById(
            "quoteCategoryFilter"
        )?.value || "";


    let list =
        [...quotes];


    if (search) {

        list =
            list.filter(
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

        list =
            list.filter(
                quote =>
                    quote.category ===
                    category
            );
    }


    const groups =
        groupQuotes(
            list
        );


    empty.style.display =
        groups.length
            ? "none"
            : "block";


    container.innerHTML =
        groups
            .map(
                group => {

                    const cheapest =
                        group[0];

                    const mostExpensive =
                        group[
                            group.length - 1
                        ];

                    const saving =
                        Number(
                            mostExpensive.price
                        ) -
                        Number(
                            cheapest.price
                        );


                    return `

                        <div class="quote-card">

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

                                ${group
                                    .map(
                                        (
                                            quote,
                                            index
                                        ) => `

                                            <div
                                                class="
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
                                                        class="action-button"
                                                        type="button"
                                                        title="Mais detalhes"
                                                        onclick="toggleQuoteDetails('${quote.id}')">

                                                        ⓘ

                                                    </button>


                                                    <button
                                                        class="action-button"
                                                        type="button"
                                                        title="Editar"
                                                        onclick="openQuoteModal('${quote.id}')">

                                                        ✏️

                                                    </button>


                                                    <button
                                                        class="action-button delete"
                                                        type="button"
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

                        </div>

                    `;
                }
            )
            .join("");
}


function toggleQuoteDetails(
    id
) {

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


function deleteQuote(
    id
) {

    const quote =
        quotes.find(
            item =>
                item.id === id
        );

    if (!quote) {
        return;
    }


    const confirmed =
        window.confirm(
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

    return groupQuotes(
        quotes
    ).reduce(
        (
            total,
            group
        ) => {

            if (group.length < 2) {
                return total;
            }

            const cheapest =
                Number(
                    group[0].price
                );

            const expensive =
                Number(
                    group[
                        group.length - 1
                    ].price
                );

            return total +
                Math.max(
                    0,
                    expensive -
                    cheapest
                );
        },
        0
    );
}


/* =========================================================
   SALDO DISPONÍVEL
========================================================= */

function setupBudgetControl() {

    const input =
        document.getElementById(
            "salaryInput"
        );

    const saveButton =
        document.getElementById(
            "saveSalaryButton"
        );

    const clearButton =
        document.getElementById(
            "clearSalaryButton"
        );


    if (!input) {
        return;
    }


    if (
        Number(
            appData.monthlyBalance
        ) > 0
    ) {

        input.value =
            formatCurrency(
                appData.monthlyBalance
            );
    }


    input.addEventListener(
        "input",
        () => salaryMask(input)
    );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveSalary
        );
    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearSalary
        );
    }
}


/*
   MÁSCARA DO SALDO

   Aqui o valor é tratado como dinheiro
   normalmente.

   Exemplos:

   1700  → R$ 1.700,00
   2000  → R$ 2.000,00
   1780  → R$ 1.780,00
*/

function salaryMask(input) {

    if (!input) {
        return;
    }


    let digits =
        String(
            input.value || ""
        )
            .replace(
                /\D/g,
                ""
            );


    if (!digits) {

        input.value = "";

        return;
    }


    const number =
        Number(digits);


    input.value =
        new Intl.NumberFormat(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        ).format(number);
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


    return parseMoney(
        text
    );
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


    if (value <= 0) {

        showToast(
            "Informe um saldo disponível maior que zero."
        );

        return;
    }


    appData.monthlyBalance =
        Number(
            value.toFixed(2)
        );


    saveData();


    input.value =
        formatCurrency(
            appData.monthlyBalance
        );


    updateDashboard();


    showToast(
        "Saldo disponível salvo com sucesso!"
    );
}


function clearSalary() {

    const confirmed =
        window.confirm(
            "Tem certeza que deseja limpar o saldo disponível?"
        );

    if (!confirmed) {
        return;
    }


    appData.monthlyBalance = 0;


    saveData();


    const input =
        document.getElementById(
            "salaryInput"
        );

    if (input) {
        input.value = "";
    }


    updateDashboard();


    showToast(
        "Saldo disponível foi limpo."
    );
}


/* =========================================================
   PLANO DE GASTOS
========================================================= */

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

    const number =
        Number(value);

    return allowed.includes(
        number
    )
        ? number
        : 70;
}


function setupBudgetPlanner() {

    const select =
        document.getElementById(
            "budgetPercentage"
        );

    const autoButton =
        document.getElementById(
            "autoPlanButton"
        );

    const manualButton =
        document.getElementById(
            "manualPlanButton"
        );


    if (autoButton) {

        autoButton.addEventListener(
            "click",
            () =>
                setBudgetMode(
                    "auto"
                )
        );
    }


    if (manualButton) {

        manualButton.addEventListener(
            "click",
            () =>
                setBudgetMode(
                    "manual"
                )
        );
    }


    if (select) {

        select.addEventListener(
            "change",
            event =>
                setBudgetPercentage(
                    event.target.value
                )
        );
    }


    applyBudgetPlannerUI();
}


function setBudgetMode(
    mode
) {

    appData.budgetMode =
        mode === "manual"
            ? "manual"
            : "auto";


    if (
        appData.budgetMode ===
        "auto"
    ) {

        appData.budgetPercentage =
            getRecommendedBudgetPercentage();
    }


    saveData();

    applyBudgetPlannerUI();

    updateDashboard();
}


function setBudgetPercentage(
    value
) {

    appData.budgetPercentage =
        normalizeBudgetPercentage(
            value
        );

    appData.budgetMode =
        "manual";


    saveData();

    applyBudgetPlannerUI();

    updateDashboard();
}


/*
   O plano automático considera:

   - saldo disponível
   - despesas já realizadas
   - compras planejadas

   Quanto mais comprometido estiver o mês,
   maior é a preservação necessária.
*/

function getRecommendedBudgetPercentage() {

    const balance =
        Number(
            appData.monthlyBalance || 0
        );


    if (balance <= 0) {
        return 70;
    }


    const commitments =
        getCurrentCommitments();


    const ratio =
        commitments /
        balance;


    if (ratio <= 0.40) {
        return 70;
    }


    if (ratio <= 0.55) {
        return 60;
    }


    return 50;
}


function getActiveBudgetPercentage() {

    if (
        appData.budgetMode ===
        "manual"
    ) {

        return normalizeBudgetPercentage(
            appData.budgetPercentage
        );
    }


    return getRecommendedBudgetPercentage();
}


function getBudgetPlan() {

    const balance =
        Number(
            appData.monthlyBalance || 0
        );


    const percentage =
        getActiveBudgetPercentage();


    const spendingCeiling =
        balance *
        (
            percentage /
            100
        );


    const protectedReserve =
        Math.max(
            0,
            balance -
            spendingCeiling
        );


    const commitments =
        getCurrentCommitments();


    return {

        balance,

        percentage,

        spendingCeiling,

        protectedReserve,

        commitments,

        remaining:
            spendingCeiling -
            commitments
    };
}


function applyBudgetPlannerUI() {

    const select =
        document.getElementById(
            "budgetPercentage"
        );

    const autoButton =
        document.getElementById(
            "autoPlanButton"
        );

    const manualButton =
        document.getElementById(
            "manualPlanButton"
        );

    const title =
        document.getElementById(
            "plannerRecommendationTitle"
        );

    const text =
        document.getElementById(
            "plannerRecommendationText"
        );


    if (
        appData.budgetMode ===
        "auto"
    ) {

        appData.budgetPercentage =
            getRecommendedBudgetPercentage();
    }


    const percentage =
        normalizeBudgetPercentage(
            appData.budgetPercentage
        );


    if (select) {

        select.value =
            String(
                percentage
            );

        select.disabled =
            appData.budgetMode !==
            "manual";
    }


    if (autoButton) {

        autoButton.classList.toggle(
            "active",
            appData.budgetMode ===
            "auto"
        );
    }


    if (manualButton) {

        manualButton.classList.toggle(
            "active",
            appData.budgetMode ===
            "manual"
        );
    }


    const plan =
        getBudgetPlan();


    if (!title || !text) {
        return;
    }


    if (plan.balance <= 0) {

        title.textContent =
            "Plano aguardando seu saldo";

        text.textContent =
            "Informe seu saldo disponível para calcular o teto de gastos e a reserva protegida.";

        return;
    }


    if (
        appData.budgetMode ===
        "manual"
    ) {

        title.textContent =
            `Plano manual: ${plan.percentage}% para gastos`;

        text.textContent =
            `Seu teto de gastos é ${formatCurrency(
                plan.spendingCeiling
            )} e a reserva protegida fica em ${formatCurrency(
                plan.protectedReserve
            )}.`;

        return;
    }


    title.textContent =
        `Plano automático: ${plan.percentage}% para gastos`;


    text.textContent =
        `O OrçaFácil sugere limitar os gastos a ${formatCurrency(
            plan.spendingCeiling
        )} e preservar ${formatCurrency(
            plan.protectedReserve
        )} como reserva.`;
}


/* =========================================================
   COMPROMISSOS
========================================================= */

function getMonthlyExpensesTotal() {

    const month =
        getCurrentMonth();


    return appData.expenses
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
                Number(
                    expense.amount || 0
                ),
            0
        );
}


function getMonthlyQuotes() {

    const month =
        getCurrentMonth();


    return quotes.filter(
        quote =>
            String(
                quote.date || ""
            ).startsWith(
                month
            )
    );
}


function getPlannedQuotes() {

    return groupQuotes(
        getMonthlyQuotes()
    )
        .map(
            group => ({

                product:
                    group[0].product,

                category:
                    group[0].category,

                subcategory:
                    group[0].subcategory,

                cheapest:
                    group[0],

                alternatives:
                    group.length
            })
        );
}


function getCurrentCommitments() {

    const expenses =
        getMonthlyExpensesTotal();


    const planned =
        getPlannedQuotes()
            .reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item
                            ?.cheapest
                            ?.price ||
                        0
                    ),
                0
            );


    return expenses +
        planned;
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const totalExpenses =
        appData.expenses.reduce(
            (
                total,
                expense
            ) =>
                total +
                Number(
                    expense.amount || 0
                ),
            0
        );


    const monthly =
        getMonthlyExpensesTotal();


    setText(
        "totalExpenses",
        formatCurrency(
            appData.monthlyBalance
        )
    );


    setText(
        "monthlyExpenses",
        formatCurrency(
            monthly
        )
    );


    setText(
        "quoteCount",
        String(
            quotes.length
        )
    );


    setText(
        "possibleSaving",
        formatCurrency(
            calculatePossibleSavings()
        )
    );


    updateBudgetPlanning(
        monthly
    );


    renderRecentExpenses();
}


/* =========================================================
   PLANEJAMENTO NO DASHBOARD
========================================================= */

function updateBudgetPlanning(
    monthlyExpenses
) {

    const balance =
        Number(
            appData.monthlyBalance || 0
        );


    const plan =
        getBudgetPlan();


    const planned =
        getPlannedQuotes();


    const plannedTotal =
        planned.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item
                        ?.cheapest
                        ?.price ||
                    0
                ),
            0
        );


    const projected =
        balance -
        monthlyExpenses -
        plannedTotal;


    const used =
        monthlyExpenses +
        plannedTotal;


    const budgetRemaining =
        plan.spendingCeiling -
        used;


    const budgetElement =
        document.getElementById(
            "dashboardBudget"
        );

    const budgetLabel =
        document.getElementById(
            "dashboardBudgetLabel"
        );

    const spentElement =
        document.getElementById(
            "dashboardSpent"
        );

    const plannedElement =
        document.getElementById(
            "dashboardPlanned"
        );

    const projectedElement =
        document.getElementById(
            "dashboardProjected"
        );

    const projectedLabel =
        document.getElementById(
            "dashboardProjectedLabel"
        );


    if (budgetElement) {

        budgetElement.textContent =
            formatCurrency(
                plan.spendingCeiling
            );
    }


    if (budgetLabel) {

        budgetLabel.textContent =
            balance > 0
                ? `${plan.percentage}% do saldo • ${formatCurrency(
                    plan.protectedReserve
                )} preservados`
                : "limite definido para gastar";
    }


    if (spentElement) {

        spentElement.textContent =
            formatCurrency(
                monthlyExpenses
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
                projected
            );
    }


    if (projectedLabel) {

        projectedLabel.textContent =
            balance > 0
                ? "após despesas e compras planejadas"
                : "informe seu saldo para começar";
    }


    const statusText =
        document.getElementById(
            "budgetStatusText"
        );

    const statusBadge =
        document.getElementById(
            "budgetStatusBadge"
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


    const purchaseTitle =
        document.getElementById(
            "purchaseStatusTitle"
        );

    const purchaseDescription =
        document.getElementById(
            "purchaseStatusDescription"
        );

    const purchaseIcon =
        document.getElementById(
            "purchaseStatusIcon"
        );


    let state = {

        className: "neutral",

        badge: "Aguardando",

        title:
            "Cadastre seu saldo",

        description:
            "Informe quanto você tem disponível para que o OrçaFácil calcule seu orçamento.",

        icon: "R$"
    };


    let progressValue = 0;


    if (balance > 0) {

        progressValue =
            plan.spendingCeiling > 0
                ? (
                    used /
                    plan.spendingCeiling
                ) *
                100
                : 0;


        if (projected < 0) {

            state = {

                className: "danger",

                badge: "Risco de perda",

                title:
                    "O planejamento ultrapassou seu saldo",

                description:
                    `Despesas e compras planejadas ultrapassam seu saldo em ${formatCurrency(
                        Math.abs(
                            projected
                        )
                    )}.`,

                icon: "!"
            };

        } else if (
            budgetRemaining < 0
        ) {

            state = {

                className: "warning",

                badge: "Cuidado",

                title:
                    "Você ultrapassou o teto de gastos",

                description:
                    `O limite de ${formatCurrency(
                        plan.spendingCeiling
                    )} foi ultrapassado em ${formatCurrency(
                        Math.abs(
                            budgetRemaining
                        )
                    )}.`,

                icon: "!"
            };

        } else if (
            budgetRemaining <=
            plan.spendingCeiling *
            0.10
        ) {

            state = {

                className: "warning",

                badge: "Cuidado",

                title:
                    "Você está perto do teto de gastos",

                description:
                    `Ainda restam ${formatCurrency(
                        Math.max(
                            0,
                            budgetRemaining
                        )
                    )} dentro do teto.`,

                icon: "!"
            };

        } else {

            state = {

                className: "good",

                badge: "Pode comprar",

                title:
                    "Seu planejamento está dentro do teto",

                description:
                    `Restam ${formatCurrency(
                        Math.max(
                            0,
                            budgetRemaining
                        )
                    )} para gastar sem mexer na reserva protegida.`,

                icon: "✓"
            };
        }
    }


    if (statusText) {

        statusText.textContent =
            state.title;
    }


    if (statusBadge) {

        statusBadge.className =
            `status-badge ${state.className}`;

        statusBadge.textContent =
            state.badge;
    }


    if (purchaseTitle) {

        purchaseTitle.textContent =
            state.title;
    }


    if (purchaseDescription) {

        purchaseDescription.textContent =
            state.description;
    }


    if (purchaseIcon) {

        purchaseIcon.textContent =
            state.icon;

        purchaseIcon.className =
            `purchase-status-icon ${state.className}`;
    }


    if (progress) {

        progress.style.width =
            `${Math.min(
                100,
                Math.max(
                    0,
                    progressValue
                )
            )}%`;

        progress.className =
            `progress-bar ${state.className}`;
    }


    if (progressLabel) {

        progressLabel.textContent =
            balance > 0
                ? `${formatCurrency(
                    used
                )} comprometidos de ${formatCurrency(
                    plan.spendingCeiling
                )}`
                : "Nenhum valor definido";
    }


    if (progressPercent) {

        progressPercent.textContent =
            balance > 0
                ? `${Math.round(
                    Math.min(
                        100,
                        Math.max(
                            0,
                            progressValue
                        )
                    )
                )}%`
                : "0%";
    }


    renderDashboardQuotes(
        Math.max(
            0,
            balance -
            monthlyExpenses
        )
    );
}


/* =========================================================
   COTAÇÕES NO DASHBOARD
========================================================= */

function renderDashboardQuotes(
    availableBalance
) {

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


    const planned =
        getPlannedQuotes();


    if (!planned.length) {

        container.innerHTML = "";

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
        planned
            .slice(0, 5)
            .map(
                item => {

                    const price =
                        Number(
                            item
                                ?.cheapest
                                ?.price ||
                            0
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
                                        item
                                            .cheapest
                                            .store
                                    )}

                                    •

                                    ${formatCurrency(
                                        price
                                    )}
                                </span>

                            </div>


                            <div
                                class="
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
                }
            )
            .join("");
}


/* =========================================================
   STATUS DE COTAÇÃO
========================================================= */

function getQuoteStatus(
    price,
    availableBalance
) {

    if (
        appData.monthlyBalance <= 0
    ) {

        return {

            className: "neutral",

            label:
                "Defina seu saldo",

            description:
                "Informe o saldo disponível no Dashboard."
        };
    }


    if (
        price >
        availableBalance
    ) {

        return {

            className: "danger",

            label:
                "Risco de perda",

            description:
                "Essa compra ultrapassa o saldo disponível."
        };
    }


    const percentage =
        availableBalance > 0
            ? (
                price /
                availableBalance
            ) *
            100
            : 100;


    if (
        percentage >= 10
    ) {

        return {

            className: "warning",

            label:
                "Cuidado",

            description:
                "Essa compra consome uma parcela relevante do saldo."
        };
    }


    return {

        className: "success",

        label:
            "Pode comprar",

        description:
            "O valor cabe no saldo disponível atual."
    };
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


    if (!container) {
        return;
    }


    const recent =
        [...appData.expenses]
            .sort(
                (a, b) =>
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
                5
            );


    if (!recent.length) {

        container.innerHTML = "";

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


/* =========================================================
   FILTROS
========================================================= */

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


/* =========================================================
   FILTRO DE MESES
========================================================= */

function populateMonthFilter() {

    const select =
        document.getElementById(
            "expenseMonthFilter"
        );

    if (!select) {
        return;
    }


    const months = [
        ...new Set(
            appData.expenses
                .map(
                    expense =>
                        String(
                            expense.date || ""
                        ).slice(
                            0,
                            7
                        )
                )
                .filter(Boolean)
        )
    ]
        .sort()
        .reverse();


    months.forEach(
        month => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                month;

            option.textContent =
                formatMonth(
                    month
                );

            select.appendChild(
                option
            );
        }
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


    document
        .getElementById(
            "closeExpenseButton"
        )
        ?.addEventListener(
            "click",
            closeExpenseModal
        );


    document
        .getElementById(
            "cancelExpenseButton"
        )
        ?.addEventListener(
            "click",
            closeExpenseModal
        );


    document
        .getElementById(
            "closeQuoteButton"
        )
        ?.addEventListener(
            "click",
            closeQuoteModal
        );


    document
        .getElementById(
            "cancelQuoteButton"
        )
        ?.addEventListener(
            "click",
            closeQuoteModal
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

        input.value = "";

        return;
    }


    const value =
        Number(digits) /
        100;


    input.value =
        new Intl.NumberFormat(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        ).format(
            value
        );
}


/* =========================================================
   PARSE DE DINHEIRO
========================================================= */

function parseMoney(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }


    let text =
        String(value)
            .trim();


    text =
        text.replace(
            /R\$/gi,
            ""
        )
        .trim();


    /*
       Formato brasileiro:

       1.700,50
       80,00
       2.000

       O ponto pode ser separador de milhar.
    */

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

    } else {

        /*
           Sem vírgula:

           1700
           80
           2000

           São interpretados como
           números inteiros normais.
        */

        text =
            text.replace(
                /[^\d.-]/g,
                ""
            );
    }


    const result =
        Number(
            text
        );


    return Number.isFinite(
        result
    )
        ? result
        : 0;
}


/* =========================================================
   FORMATAÇÃO
========================================================= */

function formatCurrency(
    value
) {

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


function formatMonth(
    month
) {

    if (!month) {
        return "";
    }


    const parts =
        month.split("-");


    if (
        parts.length !== 2
    ) {
        return month;
    }


    const date =
        new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
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


/* =========================================================
   HELPERS
========================================================= */

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


/* =========================================================
   FUNÇÕES GLOBAIS
   Necessárias para os botões gerados dinamicamente.
========================================================= */

window.openExpenseModal =
    openExpenseModal;

window.closeExpenseModal =
    closeExpenseModal;

window.deleteExpense =
    deleteExpense;

window.openQuoteModal =
    openQuoteModal;

window.closeQuoteModal =
    closeQuoteModal;

window.deleteQuote =
    deleteQuote;

window.toggleQuoteDetails =
    toggleQuoteDetails;

window.saveSalary =
    saveSalary;

window.clearSalary =
    clearSalary;

window.setBudgetMode =
    setBudgetMode;

window.setBudgetPercentage =
    setBudgetPercentage;