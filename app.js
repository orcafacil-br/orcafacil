const STORAGE_KEY = "orcafacil_data_v2";
const QUOTES_STORAGE_KEY = "orcafacil_quotes_v1";

let appData = {
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

document.addEventListener("DOMContentLoaded", () => {

    loadData();
    loadQuotes();

    populateCategorySelects();
    populateQuoteCategorySelect();

    setupNavigation();
    setupTheme();
    setupMobileMenu();

    setupExpenseForm();
    setupQuoteForm();

    setupFilters();

    updateDashboard();
    renderExpenses();
    renderQuotes();
    renderCategories();

});


/* =========================================================
   STORAGE
========================================================= */

function loadData() {

    try {

        const savedData =
            localStorage.getItem(STORAGE_KEY);

        if (savedData) {

            const parsed =
                JSON.parse(savedData);

            appData = {
                expenses: Array.isArray(parsed.expenses)
                    ? parsed.expenses
                    : [],

                budgets: Array.isArray(parsed.budgets)
                    ? parsed.budgets
                    : []
            };
        }

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


function loadQuotes() {

    try {

        const savedQuotes =
            localStorage.getItem(
                QUOTES_STORAGE_KEY
            );

        if (savedQuotes) {

            const parsed =
                JSON.parse(savedQuotes);

            quotes =
                Array.isArray(parsed)
                    ? parsed
                    : [];
        }

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

    const navButtons =
        document.querySelectorAll(
            ".nav-button"
        );

    const sections =
        document.querySelectorAll(
            ".page-section"
        );

    navButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const target =
                    button.dataset.section;

                navButtons.forEach(btn => {
                    btn.classList.remove("active");
                });

                button.classList.add("active");

                sections.forEach(section => {

                    section.classList.toggle(
                        "active",
                        section.id === target
                    );

                });

                const mobileMenu =
                    document.querySelector(
                        ".sidebar"
                    );

                if (mobileMenu) {
                    mobileMenu.classList.remove(
                        "mobile-open"
                    );
                }

            }
        );

    });
}


/* =========================================================
   TEMA
========================================================= */

function setupTheme() {

    const themeButton =
        document.getElementById(
            "themeToggle"
        );

    if (!themeButton) {
        return;
    }

    const savedTheme =
        localStorage.getItem(
            "orcafacil_theme"
        );

    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark"
        );
    }

    updateThemeIcon();

    themeButton.addEventListener(
        "click",
        () => {

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

            updateThemeIcon();
        }
    );
}


function updateThemeIcon() {

    const themeButton =
        document.getElementById(
            "themeToggle"
        );

    if (!themeButton) {
        return;
    }

    const isDark =
        document.body.classList.contains(
            "dark"
        );

    themeButton.textContent =
        isDark
            ? "☀"
            : "☾";
}


/* =========================================================
   MENU MOBILE
========================================================= */

function setupMobileMenu() {

    const menuButton =
        document.querySelector(
            ".mobile-menu-button"
        );

    const sidebar =
        document.querySelector(
            ".sidebar"
        );

    if (!menuButton || !sidebar) {
        return;
    }

    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "mobile-open"
            );
        }
    );
}


/* =========================================================
   CATEGORIAS
========================================================= */

function populateCategorySelects() {

    const categorySelect =
        document.getElementById(
            "expenseCategory"
        );

    if (!categorySelect) {
        return;
    }

    categorySelect.innerHTML =
        '<option value="">Selecione uma categoria</option>';

    Object.keys(categories).forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = category;
            option.textContent = category;

            categorySelect.appendChild(
                option
            );
        }
    );

    categorySelect.addEventListener(
        "change",
        updateSubcategories
    );

    updateSubcategories();
}


function updateSubcategories() {

    const categorySelect =
        document.getElementById(
            "expenseCategory"
        );

    const subcategorySelect =
        document.getElementById(
            "expenseSubcategory"
        );

    if (
        !categorySelect ||
        !subcategorySelect
    ) {
        return;
    }

    const selectedCategory =
        categorySelect.value;

    subcategorySelect.innerHTML =
        '<option value="">Selecione uma subcategoria</option>';

    if (
        selectedCategory &&
        categories[selectedCategory]
    ) {

        categories[selectedCategory].forEach(
            subcategory => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    subcategory;

                option.textContent =
                    subcategory;

                subcategorySelect.appendChild(
                    option
                );
            }
        );
    }
}


function populateQuoteCategorySelect() {

    const categorySelect =
        document.getElementById(
            "quoteCategory"
        );

    if (!categorySelect) {
        return;
    }

    categorySelect.innerHTML =
        '<option value="">Selecione uma categoria</option>';

    Object.keys(categories).forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = category;
            option.textContent = category;

            categorySelect.appendChild(
                option
            );
        }
    );

    categorySelect.addEventListener(
        "change",
        updateQuoteSubcategories
    );

    updateQuoteSubcategories();
}


function updateQuoteSubcategories() {

    const categorySelect =
        document.getElementById(
            "quoteCategory"
        );

    const subcategorySelect =
        document.getElementById(
            "quoteSubcategory"
        );

    if (
        !categorySelect ||
        !subcategorySelect
    ) {
        return;
    }

    const selectedCategory =
        categorySelect.value;

    subcategorySelect.innerHTML =
        '<option value="">Selecione uma subcategoria</option>';

    if (
        selectedCategory &&
        categories[selectedCategory]
    ) {

        categories[selectedCategory].forEach(
            subcategory => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    subcategory;

                option.textContent =
                    subcategory;

                subcategorySelect.appendChild(
                    option
                );
            }
        );
    }
}


/* =========================================================
   DESPESAS
========================================================= */

function setupExpenseForm() {

    const form =
        document.getElementById(
            "expenseForm"
        );

    const amountInput =
        document.getElementById(
            "expenseAmount"
        );

    if (!form) {
        return;
    }

    if (amountInput) {

        amountInput.addEventListener(
            "input",
            () => {
                moneyMask(amountInput);
            }
        );
    }

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            saveExpense();
        }
    );
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

    const title =
        document.getElementById(
            "expenseModalTitle"
        );

    if (!modal || !form) {
        return;
    }

    editingExpenseId = id;

    if (id) {

        const expense =
            appData.expenses.find(
                item => item.id === id
            );

        if (!expense) {
            return;
        }

        if (title) {
            title.textContent =
                "Editar despesa";
        }

        document.getElementById(
            "expenseDescription"
        ).value =
            expense.description || "";

        document.getElementById(
            "expenseCategory"
        ).value =
            expense.category || "";

        updateSubcategories();

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

        form.reset();

        const dateInput =
            document.getElementById(
                "expenseDate"
            );

        if (dateInput) {
            dateInput.value =
                getTodayDate();
        }

        updateSubcategories();
    }

    modal.classList.add("open");
}


function closeExpenseModal() {

    const modal =
        document.getElementById(
            "expenseModal"
        );

    if (modal) {
        modal.classList.remove(
            "open"
        );
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

    if (!date) {

        showToast(
            "Informe a data da despesa."
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
            "Despesa atualizada com sucesso."
        );

    } else {

        appData.expenses.push({

            id:
                Date.now().toString(),

            description,
            category,
            subcategory,
            amount,
            date,
            notes
        });

        showToast(
            "Despesa adicionada com sucesso."
        );
    }

    saveData();

    closeExpenseModal();

    updateDashboard();
    renderExpenses();
    renderCategories();
}


function renderExpenses() {

    const tbody =
        document.getElementById(
            "expensesTableBody"
        );

    const emptyState =
        document.getElementById(
            "expensesEmpty"
        );

    if (!tbody) {
        return;
    }

    const search =
        document.getElementById(
            "expenseSearch"
        )?.value
        .toLowerCase()
        .trim() || "";

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
            filtered.filter(expense => {

                const text = [
                    expense.description,
                    expense.category,
                    expense.subcategory,
                    expense.notes
                ]
                    .join(" ")
                    .toLowerCase();

                return text.includes(search);
            });
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

    tbody.innerHTML = "";

    if (!filtered.length) {

        if (emptyState) {
            emptyState.hidden = false;
        }

        return;
    }

    if (emptyState) {
        emptyState.hidden = true;
    }

    filtered.forEach(expense => {

        const tr =
            document.createElement(
                "tr"
            );

        tr.innerHTML = `
            <td>
                <strong>
                    ${escapeHTML(
                        expense.description
                    )}
                </strong>
            </td>

            <td>
                ${escapeHTML(
                    expense.category || "-"
                )}
            </td>

            <td>
                ${escapeHTML(
                    expense.subcategory || "-"
                )}
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

            <td>
                <div class="table-actions">

                    <button
                        class="action-button"
                        title="Editar"
                        onclick="openExpenseModal('${expense.id}')">
                        ✎
                    </button>

                    <button
                        class="action-button danger"
                        title="Excluir"
                        onclick="deleteExpense('${expense.id}')">
                        ×
                    </button>

                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });
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

    updateDashboard();
    renderExpenses();
    renderCategories();

    showToast(
        "Despesa excluída."
    );
}


/* =========================================================
   COTAÇÕES
========================================================= */

function setupQuoteForm() {

    const form =
        document.getElementById(
            "quoteForm"
        );

    const priceInput =
        document.getElementById(
            "quotePrice"
        );

    if (!form) {
        return;
    }

    if (priceInput) {

        priceInput.addEventListener(
            "input",
            () => {
                moneyMask(priceInput);
            }
        );
    }

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            saveQuote();
        }
    );
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

    const title =
        document.getElementById(
            "quoteModalTitle"
        );

    if (!modal || !form) {
        return;
    }

    editingQuoteId = id;

    if (id) {

        const quote =
            quotes.find(
                item => item.id === id
            );

        if (!quote) {
            return;
        }

        if (title) {
            title.textContent =
                "Editar cotação";
        }

        document.getElementById(
            "quoteProduct"
        ).value =
            quote.product || "";

        document.getElementById(
            "quoteCategory"
        ).value =
            quote.category || "";

        updateQuoteSubcategories();

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

        form.reset();

        const dateInput =
            document.getElementById(
                "quoteDate"
            );

        if (dateInput) {
            dateInput.value =
                getTodayDate();
        }

        updateQuoteSubcategories();
    }

    modal.classList.add("open");
}


function closeQuoteModal() {

    const modal =
        document.getElementById(
            "quoteModal"
        );

    if (modal) {
        modal.classList.remove(
            "open"
        );
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

    if (!product) {

        showToast(
            "Informe o produto."
        );

        return;
    }

    if (!category) {

        showToast(
            "Selecione uma categoria."
        );

        return;
    }

    if (!store) {

        showToast(
            "Informe a loja."
        );

        return;
    }

    if (!price || price <= 0) {

        showToast(
            "Informe um preço válido."
        );

        return;
    }

    if (!date) {

        showToast(
            "Informe a data."
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
            "Cotação atualizada com sucesso."
        );

    } else {

        quotes.push({

            id:
                Date.now().toString(),

            product,
            category,
            subcategory,
            store,
            price,
            date,
            notes
        });

        showToast(
            "Cotação adicionada com sucesso."
        );
    }

    saveQuotes();

    closeQuoteModal();

    updateDashboard();
    renderQuotes();
}


function renderQuotes() {

    const container =
        document.getElementById(
            "quotesContainer"
        );

    const emptyState =
        document.getElementById(
            "quotesEmpty"
        );

    if (!container) {
        return;
    }

    const search =
        document.getElementById(
            "quoteSearch"
        )?.value
        .toLowerCase()
        .trim() || "";

    const category =
        document.getElementById(
            "quoteCategoryFilter"
        )?.value || "";

    let filtered =
        [...quotes];

    if (search) {

        filtered =
            filtered.filter(quote => {

                const text = [
                    quote.product,
                    quote.category,
                    quote.subcategory,
                    quote.store,
                    quote.notes
                ]
                    .join(" ")
                    .toLowerCase();

                return text.includes(search);
            });
    }

    if (category) {

        filtered =
            filtered.filter(
                quote =>
                    quote.category ===
                    category
            );
    }

    /*
     * Agrupa as cotações pelo produto.
     */
    const grouped =
        {};

    filtered.forEach(quote => {

        const key =
            quote.product
                .trim()
                .toLowerCase();

        if (!grouped[key]) {
            grouped[key] = [];
        }

        grouped[key].push(quote);
    });

    container.innerHTML = "";

    const productGroups =
        Object.values(grouped);

    if (!productGroups.length) {

        if (emptyState) {
            emptyState.hidden = false;
        }

        return;
    }

    if (emptyState) {
        emptyState.hidden = true;
    }

    productGroups.forEach(
        productQuotes => {

            /*
             * Ordena do menor para o maior preço.
             */
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

            const possibleSaving =
                productQuotes.length > 1
                    ? Number(
                        mostExpensive.price
                    ) -
                    Number(
                        cheapest.price
                    )
                    : 0;

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
                                cheapest.category || ""
                            )}
                            ${
                                cheapest.subcategory
                                    ? " • " +
                                      escapeHTML(
                                          cheapest.subcategory
                                      )
                                    : ""
                            }
                        </span>

                    </div>

                    ${
                        possibleSaving > 0
                            ? `
                                <div class="quote-saving">
                                    Economia possível:
                                    <strong>
                                        ${formatCurrency(
                                            possibleSaving
                                        )}
                                    </strong>
                                </div>
                              `
                            : ""
                    }

                </div>

                <div class="quote-prices">

                    ${productQuotes
                        .map(
                            quote => {

                                const isCheapest =
                                    quote.id ===
                                    cheapest.id;

                                return `

                                    <div class="quote-price-row">

                                        <div class="quote-store">

                                            <strong>
                                                ${escapeHTML(
                                                    quote.store
                                                )}
                                            </strong>

                                            <span>
                                                ${formatDate(
                                                    quote.date
                                                )}
                                            </span>

                                        </div>

                                        <div class="quote-price">

                                            <strong
                                                ${
                                                    isCheapest
                                                        ? 'class="cheapest-price"'
                                                        : ""
                                                }>
                                                ${formatCurrency(
                                                    quote.price
                                                )}
                                            </strong>

                                        </div>

                                        <div class="quote-actions">

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
                                                ✎
                                            </button>

                                            <button
                                                class="action-button danger"
                                                title="Excluir"
                                                aria-label="Excluir"
                                                onclick="deleteQuote('${quote.id}')">
                                                ×
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

                                `;
                            }
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
   MAIS DETALHES DA COTAÇÃO
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

    updateDashboard();
    renderQuotes();

    showToast(
        "Cotação excluída."
    );
}


function calculatePossibleSavings() {

    if (quotes.length < 2) {
        return 0;
    }

    const grouped =
        {};

    quotes.forEach(quote => {

        const key =
            quote.product
                .trim()
                .toLowerCase();

        if (!grouped[key]) {
            grouped[key] = [];
        }

        grouped[key].push(
            Number(quote.price) || 0
        );
    });

    let totalSaving = 0;

    Object.values(grouped).forEach(
        prices => {

            if (prices.length < 2) {
                return;
            }

            const min =
                Math.min(...prices);

            const max =
                Math.max(...prices);

            totalSaving +=
                max - min;
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
            (total, expense) =>
                total +
                Number(expense.amount || 0),
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
                (total, expense) =>
                    total +
                    Number(
                        expense.amount || 0
                    ),
                0
            );

    const totalExpensesElement =
        document.getElementById(
            "totalExpenses"
        );

    const monthlyExpensesElement =
        document.getElementById(
            "monthlyExpenses"
        );

    const quoteCountElement =
        document.getElementById(
            "quoteCount"
        );

    const possibleSavingElement =
        document.getElementById(
            "possibleSaving"
        );

    if (totalExpensesElement) {

        totalExpensesElement.textContent =
            formatCurrency(
                totalExpenses
            );
    }

    if (monthlyExpensesElement) {

        monthlyExpensesElement.textContent =
            formatCurrency(
                monthlyExpenses
            );
    }

    if (quoteCountElement) {

        quoteCountElement.textContent =
            quotes.length;
    }

    if (possibleSavingElement) {

        possibleSavingElement.textContent =
            formatCurrency(
                calculatePossibleSavings()
            );
    }

    renderRecentExpenses();
    renderCategorySummary();
}


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

    container.innerHTML = "";

    if (!recent.length) {

        container.innerHTML = `
            <div class="empty-state">
                Nenhuma despesa cadastrada.
            </div>
        `;

        return;
    }

    recent.forEach(expense => {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "recent-expense";

        item.innerHTML = `

            <div>

                <strong>
                    ${escapeHTML(
                        expense.description
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        expense.category || ""
                    )}
                </span>

            </div>

            <strong>
                ${formatCurrency(
                    expense.amount
                )}
            </strong>

        `;

        container.appendChild(
            item
        );
    });
}


function renderCategorySummary() {

    const container =
        document.getElementById(
            "categorySummary"
        );

    if (!container) {
        return;
    }

    const totals =
        {};

    appData.expenses.forEach(
        expense => {

            const category =
                expense.category ||
                "Outros";

            totals[category] =
                (totals[category] || 0) +
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
            );

    container.innerHTML = "";

    if (!entries.length) {

        container.innerHTML = `
            <div class="empty-state">
                Nenhuma despesa cadastrada.
            </div>
        `;

        return;
    }

    const total =
        entries.reduce(
            (sum, item) =>
                sum + item[1],
            0
        );

    entries.forEach(
        ([category, amount]) => {

            const percentage =
                total > 0
                    ? (
                        amount /
                        total *
                        100
                    )
                    : 0;

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "category-summary-item";

            item.innerHTML = `

                <div class="category-summary-header">

                    <strong>
                        ${escapeHTML(
                            category
                        )}
                    </strong>

                    <span>
                        ${formatCurrency(
                            amount
                        )}
                    </span>

                </div>

                <div class="category-progress">

                    <div
                        class="category-progress-bar"
                        style="width: ${percentage}%">
                    </div>

                </div>

            `;

            container.appendChild(
                item
            );
        }
    );
}


/* =========================================================
   CATEGORIAS
========================================================= */

function renderCategories() {

    const container =
        document.getElementById(
            "categoriesGrid"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    Object.entries(categories).forEach(
        ([category, subcategories]) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "category-card";

            card.innerHTML = `

                <h3>
                    ${escapeHTML(
                        category
                    )}
                </h3>

                <div class="subcategory-list">

                    ${subcategories
                        .map(
                            subcategory =>
                                `
                                <span>
                                    ${escapeHTML(
                                        subcategory
                                    )}
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


    if (expenseSearch) {

        expenseSearch.addEventListener(
            "input",
            renderExpenses
        );
    }


    if (expenseCategoryFilter) {

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

                expenseCategoryFilter
                    .appendChild(
                        option
                    );
            });

        expenseCategoryFilter
            .addEventListener(
                "change",
                renderExpenses
            );
    }


    if (expenseMonthFilter) {

        expenseMonthFilter
            .addEventListener(
                "change",
                renderExpenses
            );
    }


    if (quoteSearch) {

        quoteSearch.addEventListener(
            "input",
            renderQuotes
        );
    }


    if (quoteCategoryFilter) {

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

                quoteCategoryFilter
                    .appendChild(
                        option
                    );
            });

        quoteCategoryFilter
            .addEventListener(
                "change",
                renderQuotes
            );
    }
}


/* =========================================================
   MODAIS
========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            event.target.classList.contains(
                "modal"
            )
        ) {

            event.target.classList.remove(
                "open"
            );

            editingExpenseId = null;
            editingQuoteId = null;
        }
    }
);


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


function parseMoney(value) {

    if (!value) {
        return 0;
    }

    const normalized =
        value
            .replace(
                /[^\d,.-]/g,
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
        parseFloat(
            normalized
        );

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
   DATAS
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


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const parts =
        dateString.split("-");

    if (parts.length !== 3) {
        return dateString;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast) {
        return;
    }

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        showToast.timeout
    );

    showToast.timeout =
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
   SEGURANÇA / HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
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