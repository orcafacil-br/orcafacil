const STORAGE_KEY = "orcafacil_data_v2";
const QUOTES_STORAGE_KEY = "orcafacil_quotes_v1";

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
            "open"
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
                "open"
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

        select.value =
            selectedValue;
    }
}


/* =====================================================
   FORMULÁRIO — DESPESAS
===================================================== */

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
            () =>
                updateSubcategories()
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


    editingExpenseId =
        id;


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
        ).value =
            expense.id;


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


    modal.classList.add(
        "show"
    );


    setTimeout(
        () =>
            document
                .getElementById(
                    "expenseDescription"
                )
                ?.focus(),
        50
    );
}


function closeExpenseModal() {

    document
        .getElementById(
            "expenseModal"
        )
        ?.classList.remove(
            "show"
        );


    editingExpenseId =
        null;
}


function saveExpense(event) {

    event.preventDefault();


    const description =
        document
            .getElementById(
                "expenseDescription"
            )
            ?.value.trim() || "";


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
            ?.value.trim() || "";


    if (!description) {

        return showToast(
            "Digite a descrição da despesa."
        );
    }


    if (!category) {

        return showToast(
            "Selecione uma categoria."
        );
    }


    if (!subcategory) {

        return showToast(
            "Selecione uma subcategoria."
        );
    }


    if (amount <= 0) {

        return showToast(
            "Informe um valor válido."
        );
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


    if (editingExpenseId) {

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

    const wasEditing =
        Boolean(
            editingExpenseId
        );


    closeExpenseModal();

    renderExpenses();

    updateDashboard();


    showToast(
        wasEditing
            ? "Despesa atualizada!"
            : "Despesa salva!"
    );
}


/* =====================================================
   RENDER — DESPESAS
===================================================== */

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
            list.filter(expense =>

                [
                    expense.description,
                    expense.category,
                    expense.subcategory,
                    expense.notes
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(search)

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
                    ).startsWith(month)
            );
    }


    list.sort(
        (a, b) =>
            String(
                b.date
            ).localeCompare(
                String(a.date)
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
                                    onclick="openExpenseModal('${expense.id}')">
                                    ✏️
                                </button>

                                <button
                                    class="action-button delete"
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


    if (
        !expense ||
        !confirm(
            `Deseja excluir a despesa "${expense.description}"?`
        )
    ) {
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


/* =====================================================
   FORMULÁRIO — COTAÇÕES
===================================================== */

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


    editingQuoteId =
        id;


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


    modal.classList.add(
        "show"
    );


    setTimeout(
        () =>
            document
                .getElementById(
                    "quoteProduct"
                )
                ?.focus(),
        50
    );
}


function closeQuoteModal() {

    document
        .getElementById(
            "quoteModal"
        )
        ?.classList.remove(
            "show"
        );


    editingQuoteId =
        null;
}


function saveQuote(event) {

    event.preventDefault();


    const product =
        document
            .getElementById(
                "quoteProduct"
            )
            ?.value.trim() || "";


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
            ?.value.trim() || "";


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
            ?.value.trim() || "";


    if (!product) {

        return showToast(
            "Digite o produto."
        );
    }


    if (!category) {

        return showToast(
            "Selecione uma categoria."
        );
    }


    if (!subcategory) {

        return showToast(
            "Selecione uma subcategoria."
        );
    }


    if (!store) {

        return showToast(
            "Digite a loja."
        );
    }


    if (price <= 0) {

        return showToast(
            "Informe um preço válido."
        );
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


    if (editingQuoteId) {

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

    const wasEditing =
        Boolean(
            editingQuoteId
        );


    closeQuoteModal();

    renderQuotes();

    updateDashboard();


    showToast(
        wasEditing
            ? "Cotação atualizada!"
            : "Cotação salva!"
    );
}


/* =====================================================
   AGRUPAR COTAÇÕES
===================================================== */

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
    )
        .map(
            group =>
                group.sort(
                    (a, b) =>
                        Number(a.price) -
                        Number(b.price)
                )
        );
}


/* =====================================================
   RENDER — COTAÇÕES
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
                quote =>

                    [
                        quote.product,
                        quote.store,
                        quote.category,
                        quote.subcategory,
                        quote.notes
                    ]
                        .join(" ")
                        .toLowerCase()
                        .includes(search)

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


                    const saving =
                        Number(
                            group[
                                group.length - 1
                            ].price
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
                                                        class="action-button"
                                                        title="Mais detalhes"
                                                        aria-label="Mais detalhes"
                                                        onclick="toggleQuoteDetails('${quote.id}')">
                                                        ⓘ
                                                    </button>

                                                    <button
                                                        class="action-button"
                                                        title="Editar"
                                                        aria-label="Editar"
                                                        onclick="openQuoteModal('${quote.id}')">
                                                        ✏️
                                                    </button>

                                                    <button
                                                        class="action-button delete"
                                                        title="Excluir"
                                                        aria-label="Excluir"
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


/* =====================================================
   COTAÇÕES — MAIS DETALHES
===================================================== */

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


/* =====================================================
   COTAÇÕES — EXCLUIR
===================================================== */

function deleteQuote(
    id
) {

    const quote =
        quotes.find(
            item =>
                item.id === id
        );


    if (
        !quote ||
        !confirm(
            `Deseja excluir a cotação de "${quote.product}" na loja "${quote.store}"?`
        )
    ) {
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


/* =====================================================
   ECONOMIA POSSÍVEL
===================================================== */

function calculatePossibleSavings() {

    return groupQuotes(
        quotes
    )
        .reduce(
            (
                total,
                group
            ) => {

                if (
                    group.length < 2
                ) {
                    return total;
                }


                return (
                    total +
                    Number(
                        group[
                            group.length - 1
                        ].price
                    ) -
                    Number(
                        group[0].price
                    )
                );

            },
            0
        );
}


/* =====================================================
   SALDO / SALÁRIO
===================================================== */

/*
    ATENÇÃO:

    O campo de salário/saldo NÃO usa
    a função moneyMask().

    A moneyMask() é usada somente
    para DESPESAS e COTAÇÕES.

    Aqui:

        1700  -> 1,700
        1,700 -> 1,700

    Internamente:

        1,700 -> 1700

    Isso impede que o valor seja
    multiplicado por 100.
*/


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


    input.value =
        appData.monthlyBalance > 0
            ? formatSalaryInputValue(
                appData.monthlyBalance
            )
            : "";


    input.addEventListener(
        "input",
        () =>
            salaryMask(
                input
            )
    );


    button.addEventListener(
        "click",
        saveMonthlyBalance
    );
}


/*
    MÁSCARA DO SALÁRIO

    1700 -> 1,700
    5000 -> 5,000
    12500 -> 12,500
*/

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
        );


    input.value =
        formatSalaryInputValue(
            value
        );
}


/*
    CONVERTE O CAMPO DO SALÁRIO
    PARA UM NÚMERO REAL.

    "1,700" -> 1700
    "1700"  -> 1700
*/

function parseSalary(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {
        return 0;
    }


    const digits =
        String(
            value
        )
            .replace(
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
        ) || 0
    );
}


/*
    FORMATA O SALÁRIO PARA O CAMPO.

    1700 -> 1,700
*/

function formatSalaryInputValue(
    value
) {

    const number =
        Number(
            value
        ) || 0;


    return number.toLocaleString(
        "en-US"
    );
}


/*
    SALVA O SALDO.

    O valor salvo no localStorage
    é numérico.

    Exemplo:

    Campo:
        1,700

    localStorage:
        1700
*/

function saveMonthlyBalance() {

    const input =
        document.getElementById(
            "monthlyBalance"
        );


    if (!input) {
        return;
    }


    const value =
        parseSalary(
            input.value
        );


    if (value <= 0) {

        return showToast(
            "Informe um saldo disponível maior que zero."
        );
    }


    appData.monthlyBalance =
        value;


    saveData();


    input.value =
        formatSalaryInputValue(
            value
        );


    updateDashboard();


    showToast(
        "Saldo disponível atualizado!"
    );
}


/* =====================================================
   PLANEJAMENTO DO MÊS
===================================================== */

function getMonthlyQuotes() {

    const month =
        getCurrentMonth();


    return quotes.filter(
        quote =>
            quote.date &&
            quote.date.startsWith(
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
                    group.length,

                saving:
                    Number(
                        group[
                            group.length - 1
                        ].price
                    ) -
                    Number(
                        group[0].price
                    )

            })
        )
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
   STATUS DE COMPRA
===================================================== */

function getQuoteStatus(
    price,
    availableBalance
) {

    if (
        appData.monthlyBalance <= 0
    ) {

        return {

            className:
                "neutral",

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

            className:
                "danger",

            label:
                "Risco de perda",

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


    if (
        percentage >= 10
    ) {

        return {

            className:
                "warning",

            label:
                "Cuidado",

            description:
                "Essa compra consome uma parcela relevante do saldo disponível."

        };
    }


    return {

        className:
            "success",

        label:
            "Pode comprar",

        description:
            "O valor cabe no saldo disponível atual."

    };
}


/* =====================================================
   COTAÇÕES NO DASHBOARD
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

            <div class="empty-state compact-empty">

                <div class="empty-icon">
                    🛒
                </div>

                <strong>
                    Nenhuma cotação para este mês
                </strong>

                <p>
                    As cotações salvas com a data deste mês aparecerão aqui e serão consideradas no planejamento.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        planned
            .map(
                item => {

                    const price =
                        Number(
                            item
                                .cheapest
                                .price ||
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
                }
            )
            .join("");
}


/* =====================================================
   ATUALIZAR PLANEJAMENTO
===================================================== */

function updateBudgetPlanning(
    monthlyExpenses
) {

    const balance =
        Number(
            appData.monthlyBalance ||
            0
        );


    const available =
        Math.max(
            0,
            balance -
                monthlyExpenses
        );


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
                        .cheapest
                        .price ||
                    0
                ),
            0
        );


    const projected =
        balance -
        monthlyExpenses -
        plannedTotal;


    const limit =
        document.getElementById(
            "monthlyLimit"
        );


    const after =
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


    const status =
        document.getElementById(
            "budgetStatus"
        );


    if (limit) {

        limit.textContent =
            formatCurrency(
                balance
            );
    }


    if (after) {

        after.textContent =
            formatCurrency(
                available
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


        projectedElement.classList.toggle(
            "danger-value",
            projected < 0
        );
    }


    if (status) {

        status.className =
            "budget-status";


        if (
            balance <= 0
        ) {

            status.classList.add(
                "neutral"
            );


            status.textContent =
                "Informe seu saldo disponível para começar o planejamento do mês.";

        } else if (
            projected < 0
        ) {

            status.classList.add(
                "danger"
            );


            status.textContent =
                `Risco de perda: despesas + cotações planejadas ultrapassam seu saldo em ${formatCurrency(
                    Math.abs(
                        projected
                    )
                )}.`;

        } else if (
            projected <
            balance * 0.10
        ) {

            status.classList.add(
                "warning"
            );


            status.textContent =
                "Cuidado: depois das despesas e das cotações planejadas, sobra menos de 10% do saldo mensal.";

        } else {

            status.classList.add(
                "success"
            );


            status.textContent =
                `Pode comprar: seu planejamento permanece dentro do saldo, com ${formatCurrency(
                    projected
                )} projetados.`;
        }
    }


    renderDashboardQuotes(
        available
    );
}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const total =
        appData.expenses.reduce(
            (
                sum,
                expense
            ) =>
                sum +
                Number(
                    expense.amount ||
                    0
                ),
            0
        );


    const month =
        getCurrentMonth();


    const monthly =
        appData.expenses
            .filter(
                expense =>
                    String(
                        expense.date ||
                        ""
                    ).startsWith(
                        month
                    )
            )
            .reduce(
                (
                    sum,
                    expense
                ) =>
                    sum +
                    Number(
                        expense.amount ||
                        0
                    ),
                0
            );


    setText(
        "totalExpenses",
        formatCurrency(
            total
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

    renderCategorySummary();
}


/* =====================================================
   DESPESAS RECENTES
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
                    String(
                        b.date
                    ).localeCompare(
                        String(
                            a.date
                        )
                    )
            )
            .slice(
                0,
                5
            );


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
                Number(
                    expense.amount ||
                    0
                );

        }
    );


    const entries =
        Object.entries(
            totals
        )
            .sort(
                (a, b) =>
                    b[1] -
                    a[1]
            )
            .slice(
                0,
                6
            );


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