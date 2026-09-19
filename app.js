const STORAGE_KEY = "orcafacil_data_v2";
const QUOTES_STORAGE_KEY = "orcafacil_quotes_v1";

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
        "Manutenção",
        "Outros"
    ],

    "Transporte": [
        "Combustível",
        "Transporte público",
        "Aplicativos",
        "Manutenção",
        "Estacionamento",
        "Outros"
    ],

    "Saúde": [
        "Consultas",
        "Exames",
        "Farmácia",
        "Plano de saúde",
        "Outros"
    ],

    "Educação": [
        "Cursos",
        "Livros",
        "Material",
        "Mensalidade",
        "Outros"
    ],

    "Lazer": [
        "Restaurantes",
        "Passeios",
        "Jogos",
        "Viagens",
        "Outros"
    ],

    "Serviços": [
        "Assinaturas",
        "Manutenção",
        "Profissionais",
        "Outros"
    ],

    "Outros": [
        "Diversos"
    ]
};

let appData = {
    expenses: [],
    budgets: [],
    monthlyBalance: 0,
    budgetMode: "auto",
    budgetPercentage: 70
};

let quotes = [];

let toastTimer;

const $ = id => document.getElementById(id);

const money = value =>
    Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

const today = () =>
    new Date().toISOString().slice(0, 10);

const monthNow = () =>
    new Date().toISOString().slice(0, 7);

const uid = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;


/* =========================================================
   UTILITÁRIOS
========================================================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function parseMoney(value) {
    const digits = String(value || "").replace(/\D/g, "");

    return digits
        ? Number(digits) / 100
        : 0;
}


function maskMoneyInput(input) {
    const value = String(input.value || "")
        .replace(/\D/g, "");

    input.value = value
        ? money(Number(value) / 100)
        : "";
}


function fillMoneyInput(input, value) {
    input.value =
        Number(value || 0) > 0
            ? money(value)
            : "";
}


function formatDate(value) {
    if (!value) {
        return "-";
    }

    const parts = String(value).split("-");

    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    return value;
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function saveData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );
}


function saveQuotes() {
    localStorage.setItem(
        QUOTES_STORAGE_KEY,
        JSON.stringify(quotes)
    );
}


function loadData() {
    try {
        const data = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "{}"
        );

        appData = {
            expenses: Array.isArray(data.expenses)
                ? data.expenses
                : [],

            budgets: Array.isArray(data.budgets)
                ? data.budgets
                : [],

            monthlyBalance: Number(
                data.monthlyBalance || 0
            ),

            budgetMode:
                data.budgetMode === "manual"
                    ? "manual"
                    : "auto",

            budgetPercentage:
                [50, 60, 70, 80, 90].includes(
                    Number(data.budgetPercentage)
                )
                    ? Number(data.budgetPercentage)
                    : 70
        };

    } catch {
        appData = {
            expenses: [],
            budgets: [],
            monthlyBalance: 0,
            budgetMode: "auto",
            budgetPercentage: 70
        };
    }
}


function loadQuotes() {
    try {
        const data = JSON.parse(
            localStorage.getItem(QUOTES_STORAGE_KEY) || "[]"
        );

        quotes = Array.isArray(data)
            ? data
            : [];

    } catch {
        quotes = [];
    }
}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function showPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(section => {
            section.classList.toggle(
                "active",
                section.id === page
            );
        });

    document
        .querySelectorAll(".menu-item")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.page === page
            );
        });

    const names = {
        dashboard: "Visão geral",
        despesas: "Despesas",
        cotacoes: "Cotações",
        categorias: "Categorias"
    };

    $("topbarSection").textContent =
        names[page] || "OrçaFácil";

    $("sidebar").classList.remove(
        "mobile-open"
    );
}


/* =========================================================
   MENU MOBILE
========================================================= */

function setupMobile() {

    $("mobileMenuButton").addEventListener(
        "click",
        () => {
            $("sidebar").classList.toggle(
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
            "orcafacil_theme"
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
        "orcafacil_theme",
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

    $("themeIcon").textContent =
        dark ? "☀️" : "🌙";

    $("themeText").textContent =
        dark
            ? "Modo claro"
            : "Modo escuro";
}


/* =========================================================
   CATEGORIAS
========================================================= */

function populateSelect(
    select,
    values,
    label = "Selecione"
) {

    select.innerHTML =
        `<option value="">${label}</option>` +
        values
            .map(
                value =>
                    `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`
            )
            .join("");
}


function setupCategorySelects() {

    const names =
        Object.keys(categories);

    populateSelect(
        $("expenseCategory"),
        names
    );

    populateSelect(
        $("quoteCategory"),
        names
    );

    populateSelect(
        $("expenseCategoryFilter"),
        names,
        "Todas as categorias"
    );

    populateSelect(
        $("quoteCategoryFilter"),
        names,
        "Todas as categorias"
    );

    updateSubcategories(
        "expenseCategory",
        "expenseSubcategory"
    );

    updateSubcategories(
        "quoteCategory",
        "quoteSubcategory"
    );

    $("expenseCategory").addEventListener(
        "change",
        () => {
            updateSubcategories(
                "expenseCategory",
                "expenseSubcategory"
            );
        }
    );

    $("quoteCategory").addEventListener(
        "change",
        () => {
            updateSubcategories(
                "quoteCategory",
                "quoteSubcategory"
            );
        }
    );
}


function updateSubcategories(
    categoryId,
    subId,
    selected = ""
) {

    const category =
        $(categoryId).value;

    const select =
        $(subId);

    const values =
        categories[category] || [];

    populateSelect(
        select,
        values,
        category
            ? "Selecione"
            : "Selecione primeiro a categoria"
    );

    if (selected) {
        select.value = selected;
    }
}


/* =========================================================
   MÁSCARA DE DINHEIRO
========================================================= */

function setupMoneyMasks() {

    [
        "salaryInput",
        "expenseAmount",
        "quotePrice"
    ].forEach(id => {

        const input = $(id);

        input.addEventListener(
            "input",
            () => maskMoneyInput(input)
        );
    });
}


/* =========================================================
   SALDO
========================================================= */

function saveSalary() {

    const value =
        parseMoney(
            $("salaryInput").value
        );

    appData.monthlyBalance = value;

    saveData();

    updateDashboard();

    showToast(
        value
            ? `Saldo salvo: ${money(value)}`
            : "Saldo zerado."
    );
}


function clearSalary() {

    if (
        !appData.monthlyBalance &&
        !$("salaryInput").value
    ) {
        return;
    }

    appData.monthlyBalance = 0;

    $("salaryInput").value = "";

    saveData();

    updateDashboard();

    showToast("Saldo limpo.");
}


/* =========================================================
   PLANEJAMENTO
========================================================= */

function setBudgetMode(mode) {

    appData.budgetMode =
        mode === "manual"
            ? "manual"
            : "auto";

    saveData();

    updateDashboard();
}


function setBudgetPercentage(value) {

    const percentage =
        Number(value);

    appData.budgetPercentage =
        [50, 60, 70, 80, 90].includes(
            percentage
        )
            ? percentage
            : 70;

    appData.budgetMode =
        "manual";

    saveData();

    updateDashboard();
}


function getMonthlyExpenses() {

    return appData.expenses
        .filter(expense =>
            String(
                expense.date || ""
            ).startsWith(
                monthNow()
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
}


function getMonthlyQuotes() {

    return quotes.filter(quote =>
        String(
            quote.date || ""
        ).startsWith(
            monthNow()
        )
    );
}


function groupQuotes(list) {

    const map = new Map();

    list.forEach(quote => {

        const key =
            String(
                quote.product || ""
            )
                .trim()
                .toLowerCase();

        if (!map.has(key)) {
            map.set(key, []);
        }

        map.get(key).push(quote);
    });

    return [...map.values()]
        .map(group =>
            group.sort(
                (a, b) =>
                    Number(a.price) -
                    Number(b.price)
            )
        );
}


function getPlannedTotal() {

    return groupQuotes(
        getMonthlyQuotes()
    ).reduce(
        (sum, group) =>
            sum +
            Number(
                group[0]?.price || 0
            ),
        0
    );
}


function recommendedPercentage() {

    const balance =
        appData.monthlyBalance;

    if (balance <= 0) {
        return 70;
    }

    const ratio =
        (
            getMonthlyExpenses() +
            getPlannedTotal()
        ) / balance;

    if (ratio <= 0.4) {
        return 70;
    }

    if (ratio <= 0.55) {
        return 60;
    }

    return 50;
}


function activePercentage() {

    return appData.budgetMode === "manual"
        ? appData.budgetPercentage
        : recommendedPercentage();
}


function budgetPlan() {

    const balance =
        appData.monthlyBalance;

    const percentage =
        activePercentage();

    const ceiling =
        balance *
        percentage /
        100;

    const reserve =
        Math.max(
            0,
            balance - ceiling
        );

    const spent =
        getMonthlyExpenses();

    const planned =
        getPlannedTotal();

    return {
        balance,
        percentage,
        ceiling,
        reserve,
        spent,
        planned,
        committed:
            spent + planned,
        remaining:
            ceiling -
            spent -
            planned,
        projected:
            balance -
            spent -
            planned
    };
}


/* =========================================================
   ATUALIZAÇÃO DO ORÇAMENTO
========================================================= */

function updateBudgetUI() {

    const plan =
        budgetPlan();

    $("budgetPercentage").value =
        String(plan.percentage);

    $("budgetPercentage").disabled =
        appData.budgetMode !== "manual";

    $("autoPlanButton").classList.toggle(
        "active",
        appData.budgetMode === "auto"
    );

    $("manualPlanButton").classList.toggle(
        "active",
        appData.budgetMode === "manual"
    );


    $("dashboardBudget").textContent =
        money(plan.ceiling);

    $("dashboardBudgetLabel").textContent =
        plan.balance
            ? `${plan.percentage}% do saldo • ${money(plan.reserve)} preservados`
            : "limite definido para gastar";


    $("dashboardSpent").textContent =
        money(plan.spent);

    $("dashboardPlanned").textContent =
        money(plan.planned);

    $("dashboardProjected").textContent =
        money(plan.projected);

    $("dashboardProjected").classList.toggle(
        "danger-value",
        plan.projected < 0
    );

    $("dashboardProjectedLabel").textContent =
        plan.balance
            ? "após despesas e compras planejadas"
            : "informe seu saldo para começar";


    if (plan.balance <= 0) {

        $("plannerRecommendationTitle").textContent =
            "Plano aguardando seu saldo";

        $("plannerRecommendationText").textContent =
            "Informe seu saldo disponível para calcular o teto de gastos e a reserva protegida.";

    } else if (
        appData.budgetMode === "manual"
    ) {

        $("plannerRecommendationTitle").textContent =
            `Plano manual: ${plan.percentage}% para gastos`;

        $("plannerRecommendationText").textContent =
            `Seu teto de gastos é ${money(plan.ceiling)} e a reserva protegida fica em ${money(plan.reserve)}.`;

    } else {

        $("plannerRecommendationTitle").textContent =
            `Plano automático: ${plan.percentage}% para gastos`;

        $("plannerRecommendationText").textContent =
            `O OrçaFácil sugere limitar os gastos a ${money(plan.ceiling)} e preservar ${money(plan.reserve)} como reserva.`;
    }


    let state = {
        className: "neutral",
        badge: "Aguardando",
        title: "Cadastre seu saldo",
        description:
            "Informe quanto você tem disponível para que o OrçaFácil calcule seu orçamento.",
        icon: "R$"
    };


    if (plan.balance > 0) {

        if (plan.projected < 0) {

            state = {
                className: "danger",
                badge: "Risco de perda",
                title:
                    "O planejamento ultrapassou seu saldo",
                description:
                    `Despesas e compras planejadas ultrapassam seu saldo em ${money(Math.abs(plan.projected))}.`,
                icon: "!"
            };

        } else if (plan.remaining < 0) {

            state = {
                className: "warning",
                badge: "Cuidado",
                title:
                    "Você ultrapassou o teto de gastos",
                description:
                    `O limite de ${money(plan.ceiling)} foi ultrapassado em ${money(Math.abs(plan.remaining))}.`,
                icon: "!"
            };

        } else if (
            plan.remaining <=
            plan.ceiling * 0.1
        ) {

            state = {
                className: "warning",
                badge: "Cuidado",
                title:
                    "Você está perto do teto de gastos",
                description:
                    `Ainda restam ${money(Math.max(0, plan.remaining))} dentro do teto de ${money(plan.ceiling)}.`,
                icon: "!"
            };

        } else {

            state = {
                className: "good",
                badge: "Pode comprar",
                title:
                    "Seu planejamento está dentro do teto",
                description:
                    `Restam ${money(Math.max(0, plan.remaining))} para gastar sem mexer na reserva protegida de ${money(plan.reserve)}.`,
                icon: "✓"
            };
        }
    }


    const percent =
        plan.ceiling > 0
            ? Math.max(
                0,
                Math.min(
                    100,
                    (
                        plan.committed /
                        plan.ceiling
                    ) * 100
                )
            )
            : 0;


    $("budgetProgress").style.width =
        `${percent}%`;

    $("budgetProgress").className =
        `progress-bar ${state.className}`;


    $("budgetProgressLabel").textContent =
        plan.balance
            ? `${money(plan.committed)} comprometidos de ${money(plan.ceiling)} do teto`
            : "Nenhum valor definido";

    $("budgetProgressPercent").textContent =
        `${Math.round(percent)}%`;


    $("budgetStatusText").textContent =
        state.title;

    $("budgetStatusBadge").className =
        `budget-status-badge ${state.className}`;

    $("budgetStatusBadge").textContent =
        state.badge;


    $("purchaseStatusTitle").textContent =
        state.title;

    $("purchaseStatusDescription").textContent =
        state.description;

    $("purchaseStatusIcon").textContent =
        state.icon;

    $("purchaseStatusIcon").className =
        `purchase-status-icon ${state.className}`;
}


/* =========================================================
   MODAIS
========================================================= */

function openModal(id) {

    $(id).hidden = false;

    document.body.classList.add(
        "modal-open"
    );
}


function closeModal(id) {

    const modal = $(id);

    if (!modal) {
        return;
    }

    modal.hidden = true;

    document.body.classList.remove(
        "modal-open"
    );
}


function openExpenseModal(expense = null) {

    $("expenseForm").reset();

    $("expenseId").value = "";

    $("expenseModalTitle").textContent =
        expense
            ? "Editar despesa"
            : "Nova despesa";

    $("expenseDate").value =
        expense?.date ||
        today();


    if (expense) {

        $("expenseId").value =
            expense.id;

        $("expenseDescription").value =
            expense.description;

        $("expenseCategory").value =
            expense.category;

        updateSubcategories(
            "expenseCategory",
            "expenseSubcategory",
            expense.subcategory
        );

        fillMoneyInput(
            $("expenseAmount"),
            expense.amount
        );

        $("expenseNotes").value =
            expense.notes || "";

    } else {

        updateSubcategories(
            "expenseCategory",
            "expenseSubcategory"
        );
    }

    openModal("expenseModal");
}


function openQuoteModal(quote = null) {

    $("quoteForm").reset();

    $("quoteId").value = "";

    $("quoteModalTitle").textContent =
        quote
            ? "Editar cotação"
            : "Nova cotação";

    $("quoteDate").value =
        quote?.date ||
        today();


    if (quote) {

        $("quoteId").value =
            quote.id;

        $("quoteProduct").value =
            quote.product;

        $("quoteCategory").value =
            quote.category;

        updateSubcategories(
            "quoteCategory",
            "quoteSubcategory",
            quote.subcategory
        );

        $("quoteStore").value =
            quote.store;

        fillMoneyInput(
            $("quotePrice"),
            quote.price
        );

        $("quoteNotes").value =
            quote.notes || "";

    } else {

        updateSubcategories(
            "quoteCategory",
            "quoteSubcategory"
        );
    }

    openModal("quoteModal");
}


/* =========================================================
   DESPESAS
========================================================= */

function saveExpense(event) {

    event.preventDefault();

    const id =
        $("expenseId").value ||
        uid();

    const item = {
        id,

        description:
            $("expenseDescription")
                .value
                .trim(),

        category:
            $("expenseCategory")
                .value,

        subcategory:
            $("expenseSubcategory")
                .value,

        amount:
            parseMoney(
                $("expenseAmount")
                    .value
            ),

        date:
            $("expenseDate")
                .value,

        notes:
            $("expenseNotes")
                .value
                .trim()
    };


    const index =
        appData.expenses.findIndex(
            expense =>
                expense.id === id
        );


    if (index >= 0) {
        appData.expenses[index] =
            item;
    } else {
        appData.expenses.push(item);
    }


    saveData();

    closeModal("expenseModal");

    renderExpenses();

    updateDashboard();

    showToast(
        "Despesa salva com sucesso."
    );
}


function editExpense(id) {

    const item =
        appData.expenses.find(
            expense =>
                expense.id === id
        );

    if (item) {
        openExpenseModal(item);
    }
}


function deleteExpense(id) {

    if (
        !confirm(
            "Excluir esta despesa?"
        )
    ) {
        return;
    }

    appData.expenses =
        appData.expenses.filter(
            expense =>
                expense.id !== id
        );

    saveData();

    renderExpenses();

    updateDashboard();

    showToast(
        "Despesa excluída."
    );
}


function renderExpenses() {

    const body =
        $("expensesTableBody");

    const empty =
        $("expensesEmpty");

    const search =
        $("expenseSearch")
            .value
            .toLowerCase()
            .trim();

    const category =
        $("expenseCategoryFilter")
            .value;

    const month =
        $("expenseMonthFilter")
            .value;


    let list = [
        ...appData.expenses
    ];


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
            String(b.date)
                .localeCompare(
                    String(a.date)
                )
    );


    body.innerHTML =
        list
            .map(expense => `
                <tr>
                    <td>
                        <strong>
                            ${escapeHTML(
                                expense.description
                            )}
                        </strong>

                        <small class="table-sub">
                            ${escapeHTML(
                                expense.subcategory || ""
                            )}
                        </small>
                    </td>

                    <td>
                        ${escapeHTML(
                            expense.category
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            expense.date
                        )}
                    </td>

                    <td>
                        <strong>
                            ${money(
                                expense.amount
                            )}
                        </strong>
                    </td>

                    <td class="table-actions">

                        <button
                            class="table-action"
                            data-edit-expense="${expense.id}"
                            type="button"
                        >
                            Editar
                        </button>

                        <button
                            class="table-action danger"
                            data-delete-expense="${expense.id}"
                            type="button"
                        >
                            Excluir
                        </button>

                    </td>
                </tr>
            `)
            .join("");


    empty.classList.toggle(
        "visible",
        list.length === 0
    );
}


function setupExpenseFilters() {

    const months = [
        ...new Set(
            appData.expenses
                .map(
                    expense =>
                        String(
                            expense.date || ""
                        ).slice(0, 7)
                )
                .filter(Boolean)
        )
    ]
        .sort()
        .reverse();


    $("expenseMonthFilter").innerHTML =
        '<option value="">Todos os meses</option>' +
        months
            .map(
                month =>
                    `<option value="${month}">${month}</option>`
            )
            .join("");
}


/* =========================================================
   COTAÇÕES
========================================================= */

function saveQuote(event) {

    event.preventDefault();

    const id =
        $("quoteId").value ||
        uid();

    const item = {
        id,

        product:
            $("quoteProduct")
                .value
                .trim(),

        category:
            $("quoteCategory")
                .value,

        subcategory:
            $("quoteSubcategory")
                .value,

        store:
            $("quoteStore")
                .value
                .trim(),

        price:
            parseMoney(
                $("quotePrice")
                    .value
            ),

        date:
            $("quoteDate")
                .value,

        notes:
            $("quoteNotes")
                .value
                .trim()
    };


    const index =
        quotes.findIndex(
            quote =>
                quote.id === id
        );


    if (index >= 0) {
        quotes[index] =
            item;
    } else {
        quotes.push(item);
    }


    saveQuotes();

    closeModal("quoteModal");

    renderQuotes();

    updateDashboard();

    showToast(
        "Cotação salva com sucesso."
    );
}


function editQuote(id) {

    const item =
        quotes.find(
            quote =>
                quote.id === id
        );

    if (item) {
        openQuoteModal(item);
    }
}


function deleteQuote(id) {

    if (
        !confirm(
            "Excluir esta cotação?"
        )
    ) {
        return;
    }

    quotes =
        quotes.filter(
            quote =>
                quote.id !== id
        );

    saveQuotes();

    renderQuotes();

    updateDashboard();

    showToast(
        "Cotação excluída."
    );
}


function quoteStatus(
    price,
    available
) {

    if (!appData.monthlyBalance) {
        return [
            "neutral",
            "Defina seu saldo"
        ];
    }

    if (price > available) {
        return [
            "danger",
            "Risco de perda"
        ];
    }

    if (
        available > 0 &&
        price / available >= 0.1
    ) {
        return [
            "warning",
            "Cuidado"
        ];
    }

    return [
        "good",
        "Pode comprar"
    ];
}


function renderQuotes() {

    const search =
        $("quoteSearch")
            .value
            .toLowerCase()
            .trim();

    const category =
        $("quoteCategoryFilter")
            .value;


    let list = [
        ...quotes
    ];


    if (search) {

        list =
            list.filter(quote =>
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
        groupQuotes(list);

    const container =
        $("quotesContainer");


    $("quotesEmpty").classList.toggle(
        "visible",
        groups.length === 0
    );


    container.innerHTML =
        groups
            .map(group => {

                const cheapest =
                    group[0];

                const saving =
                    Math.max(
                        0,
                        Number(
                            group.at(-1)?.price ||
                            0
                        ) -
                        Number(
                            cheapest.price ||
                            0
                        )
                    );


                return `
                    <article class="quote-card">

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
                                            ${money(saving)}
                                        </div>
                                    `
                                    : ""
                            }

                        </div>


                        <div class="quote-prices">

                            ${group
                                .map(quote => `
                                    <div class="quote-price-row">

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


                                        <div class="quote-price">
                                            ${money(
                                                quote.price
                                            )}
                                        </div>


                                        <div class="quote-row-actions">

                                            <button
                                                type="button"
                                                data-details="${quote.id}"
                                            >
                                                Mais detalhes
                                            </button>

                                            <button
                                                type="button"
                                                data-edit-quote="${quote.id}"
                                            >
                                                Editar
                                            </button>

                                            <button
                                                type="button"
                                                data-delete-quote="${quote.id}"
                                                class="danger-text"
                                            >
                                                Excluir
                                            </button>

                                        </div>


                                        <div
                                            class="quote-details"
                                            id="details-${quote.id}"
                                        >

                                            <strong>
                                                Observação
                                            </strong>

                                            <p>
                                                ${escapeHTML(
                                                    quote.notes ||
                                                    "Nenhuma observação informada."
                                                )}
                                            </p>

                                        </div>

                                    </div>
                                `)
                                .join("")}

                        </div>


                        <div class="quote-summary">

                            <span>
                                Melhor preço
                            </span>

                            <strong>
                                ${escapeHTML(
                                    cheapest.store
                                )}
                                •
                                ${money(
                                    cheapest.price
                                )}
                            </strong>

                        </div>

                    </article>
                `;
            })
            .join("");
}


/* =========================================================
   COTAÇÕES NO DASHBOARD
========================================================= */

function renderDashboardQuotes() {

    const container =
        $("dashboardQuotes");

    const list =
        groupQuotes(
            getMonthlyQuotes()
        )
            .map(group => group[0]);


    $("dashboardQuotesEmpty")
        .classList
        .toggle(
            "visible",
            list.length === 0
        );


    const available =
        Math.max(
            0,
            appData.monthlyBalance -
            getMonthlyExpenses()
        );


    container.innerHTML =
        list
            .slice(0, 6)
            .map(quote => {

                const [
                    className,
                    label
                ] =
                    quoteStatus(
                        Number(
                            quote.price
                        ),
                        available
                    );


                return `
                    <div class="dashboard-quote-item">

                        <div class="dashboard-quote-main">

                            <strong>
                                ${escapeHTML(
                                    quote.product
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    quote.store
                                )}
                                •
                                ${money(
                                    quote.price
                                )}
                            </span>

                        </div>


                        <div
                            class="dashboard-quote-status ${className}"
                        >

                            <strong>
                                ${label}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    quote.notes ||
                                    "Sem observação"
                                )}
                            </small>

                        </div>

                    </div>
                `;
            })
            .join("");
}


/* =========================================================
   DESPESAS RECENTES
========================================================= */

function renderRecentExpenses() {

    const list =
        [
            ...appData.expenses
        ]
            .sort(
                (a, b) =>
                    String(b.date)
                        .localeCompare(
                            String(a.date)
                        )
            )
            .slice(0, 5);


    const container =
        $("recentExpenses");


    $("recentExpensesEmpty")
        .classList
        .toggle(
            "visible",
            list.length === 0
        );


    container.innerHTML =
        list
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
                        ${money(
                            expense.amount
                        )}
                    </div>

                </div>
            `)
            .join("");
}


/* =========================================================
   ECONOMIA
========================================================= */

function calculateSavings() {

    return groupQuotes(
        quotes
    ).reduce(
        (sum, group) =>
            sum +
            Math.max(
                0,
                Number(
                    group.at(-1)?.price ||
                    0
                ) -
                Number(
                    group[0]?.price ||
                    0
                )
            ),
        0
    );
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    if (
        appData.monthlyBalance > 0
    ) {

        fillMoneyInput(
            $("salaryInput"),
            appData.monthlyBalance
        );

    } else {

        $("salaryInput").value = "";
    }


    $("totalExpenses").textContent =
        money(
            appData.monthlyBalance
        );


    $("monthlyExpenses").textContent =
        money(
            getMonthlyExpenses()
        );


    $("quoteCount").textContent =
        String(
            quotes.length
        );


    $("possibleSaving").textContent =
        money(
            calculateSavings()
        );


    updateBudgetUI();

    renderDashboardQuotes();

    renderRecentExpenses();
}


/* =========================================================
   CATEGORIAS
========================================================= */

function renderCategories() {

    const container =
        $("categoriesContainer");


    container.innerHTML =
        Object.entries(categories)
            .map(
                ([category, subcategories]) => `
                    <article class="category-card">

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

                    </article>
                `
            )
            .join("");
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toast =
        $("toast");

    $("toastMessage")
        .textContent = message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () =>
                toast.classList.remove(
                    "show"
                ),
            2400
        );
}


/* =========================================================
   EVENTOS
========================================================= */

function setupEvents() {

    setupMobile();

    setupCategorySelects();

    setupMoneyMasks();

    loadTheme();


    $("themeToggle")
        .addEventListener(
            "click",
            toggleTheme
        );


    $("expenseForm")
        .addEventListener(
            "submit",
            saveExpense
        );


    $("quoteForm")
        .addEventListener(
            "submit",
            saveQuote
        );


    $("expenseSearch")
        .addEventListener(
            "input",
            renderExpenses
        );


    $("expenseCategoryFilter")
        .addEventListener(
            "change",
            renderExpenses
        );


    $("quoteSearch")
        .addEventListener(
            "input",
            renderQuotes
        );


    $("quoteCategoryFilter")
        .addEventListener(
            "change",
            renderQuotes
        );


    $("expensesTableBody")
        .addEventListener(
            "click",
            event => {

                const edit =
                    event.target.closest(
                        "[data-edit-expense]"
                    );

                const del =
                    event.target.closest(
                        "[data-delete-expense]"
                    );


                if (edit) {
                    editExpense(
                        edit.dataset.editExpense
                    );
                }


                if (del) {
                    deleteExpense(
                        del.dataset.deleteExpense
                    );
                }
            }
        );


    $("quotesContainer")
        .addEventListener(
            "click",
            event => {

                const details =
                    event.target.closest(
                        "[data-details]"
                    );

                const edit =
                    event.target.closest(
                        "[data-edit-quote]"
                    );

                const del =
                    event.target.closest(
                        "[data-delete-quote]"
                    );


                if (details) {

                    const box =
                        $(
                            "details-" +
                            details.dataset.details
                        );

                    if (box) {
                        box.classList.toggle(
                            "open"
                        );
                    }
                }


                if (edit) {

                    editQuote(
                        edit.dataset.editQuote
                    );
                }


                if (del) {

                    deleteQuote(
                        del.dataset.deleteQuote
                    );
                }
            }
        );


    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {
                        closeModal(
                            modal.id
                        );
                    }
                }
            );
        });


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeModal(
                    "expenseModal"
                );

                closeModal(
                    "quoteModal"
                );
            }
        }
    );
}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

function init() {

    loadData();

    loadQuotes();

    setupEvents();

    setupExpenseFilters();

    renderExpenses();

    renderQuotes();

    renderCategories();

    updateDashboard();
}


document.addEventListener(
    "DOMContentLoaded",
    init
);