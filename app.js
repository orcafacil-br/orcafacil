/* =========================================================
   ORÇAFÁCIL — APP.JS
========================================================= */

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
let toastTimeout;

/* =========================================================
   CATEGORIAS
========================================================= */

const categories = {
    "Compras":[
        "Alimentos","Higiene pessoal","Limpeza","Fármacos",
        "Bebidas","Hortifruti","Carnes","Padaria","Outros"
    ],
    "Compras Online":[
        "Mercado Livre","Shopee","Amazon","AliExpress",
        "Magalu","Americanas","Outros"
    ],
    "Streaming":[
        "Netflix","Amazon Prime","Disney+","Max",
        "Paramount+","Globoplay","Spotify",
        "YouTube Premium","Outros"
    ],
    "Casa":[
        "Aluguel","Energia","Água","Internet",
        "Móveis","Eletrodomésticos","Manutenção","Outros"
    ],
    "Transporte":[
        "Combustível","Uber","99","Transporte público",
        "Manutenção","Estacionamento","Outros"
    ],
    "Saúde":[
        "Consultas","Exames","Medicamentos",
        "Plano de saúde","Dentista","Outros"
    ],
    "Educação":[
        "Cursos","Livros","Faculdade",
        "Material escolar","Outros"
    ],
    "Lazer":[
        "Cinema","Restaurantes","Viagens",
        "Jogos","Eventos","Outros"
    ],
    "Serviços":[
        "Manutenção","Profissionais",
        "Assinaturas","Serviços digitais","Outros"
    ],
    "Outros":["Outros"]
};

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", init);

function init(){
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

/* =========================================================
   STORAGE
========================================================= */

function loadData(){
    try{
        const saved = localStorage.getItem(STORAGE_KEY);

        if(!saved) return;

        const parsed = JSON.parse(saved);

        appData = {
            expenses:Array.isArray(parsed.expenses)
                ? parsed.expenses : [],

            budgets:Array.isArray(parsed.budgets)
                ? parsed.budgets : [],

            monthlyBalance:Number(parsed.monthlyBalance || 0)
        };
    }catch(error){
        console.error("Erro ao carregar dados:",error);

        appData={
            expenses:[],
            budgets:[],
            monthlyBalance:0
        };
    }
}

function saveData(){
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );
}

function loadQuotes(){
    try{
        const saved=localStorage.getItem(
            QUOTES_STORAGE_KEY
        );

        quotes=saved ? JSON.parse(saved) : [];

        if(!Array.isArray(quotes)){
            quotes=[];
        }
    }catch(error){
        console.error("Erro ao carregar cotações:",error);
        quotes=[];
    }
}

function saveQuotes(){
    localStorage.setItem(
        QUOTES_STORAGE_KEY,
        JSON.stringify(quotes)
    );
}

/* =========================================================
   NAVEGAÇÃO
========================================================= */

function setupNavigation(){
    document.querySelectorAll(".menu-item").forEach(item=>{
        item.addEventListener("click",()=>{
            showPage(item.dataset.page);
        });
    });
}

function showPage(pageId){
    document.querySelectorAll(".page").forEach(page=>{
        page.classList.remove("active");
    });

    const page=document.getElementById(pageId);

    if(page){
        page.classList.add("active");
    }

    document.querySelectorAll(".menu-item").forEach(item=>{
        item.classList.toggle(
            "active",
            item.dataset.page===pageId
        );
    });

    document.querySelector(".sidebar")
        ?.classList.remove("mobile-open");
}

/* =========================================================
   MENU MOBILE
========================================================= */

function setupMobileMenu(){
    const button=document.getElementById(
        "mobileMenuButton"
    );

    const sidebar=document.querySelector(".sidebar");

    if(!button || !sidebar) return;

    button.addEventListener("click",()=>{
        sidebar.classList.toggle("mobile-open");
    });
}

/* =========================================================
   TEMA
========================================================= */

function loadTheme(){
    const dark=localStorage.getItem(
        "orcafacil_theme"
    )==="dark";

    document.body.classList.toggle("dark",dark);
    updateThemeButton();
}

function toggleTheme(){
    const dark=!document.body.classList.contains("dark");

    document.body.classList.toggle("dark",dark);

    localStorage.setItem(
        "orcafacil_theme",
        dark ? "dark" : "light"
    );

    updateThemeButton();
}

function updateThemeButton(){
    const dark=document.body.classList.contains("dark");

    const icon=document.getElementById("themeIcon");
    const text=document.getElementById("themeText");

    if(icon) icon.textContent=dark ? "☀️" : "🌙";
    if(text) text.textContent=dark
        ? "Modo claro"
        : "Modo escuro";
}

document.addEventListener("click",event=>{
    if(event.target.closest("#themeToggle")){
        toggleTheme();
    }
});

/* =========================================================
   SELECTS
========================================================= */

function populateSelect(select,values,firstLabel){
    if(!select) return;

    select.innerHTML=`<option value="">${firstLabel}</option>`;

    values.forEach(value=>{
        const option=document.createElement("option");

        option.value=value;
        option.textContent=value;

        select.appendChild(option);
    });
}

function populateCategorySelects(){
    const values=Object.keys(categories);

    populateSelect(
        document.getElementById("expenseCategory"),
        values,
        "Selecione"
    );

    populateSelect(
        document.getElementById("expenseCategoryFilter"),
        values,
        "Todas as categorias"
    );
}

function populateQuoteCategorySelect(){
    const values=Object.keys(categories);

    populateSelect(
        document.getElementById("quoteCategory"),
        values,
        "Selecione"
    );

    populateSelect(
        document.getElementById("quoteCategoryFilter"),
        values,
        "Todas as categorias"
    );
}

/* =========================================================
   SUBCATEGORIAS
========================================================= */

function updateSubcategories(selectedValue=""){
    const category=document.getElementById(
        "expenseCategory"
    )?.value || "";

    const select=document.getElementById(
        "expenseSubcategory"
    );

    if(!select) return;

    populateSelect(
        select,
        categories[category] || [],
        "Selecione"
    );

    if(selectedValue){
        select.value=selectedValue;
    }
}

function updateQuoteSubcategories(selectedValue=""){
    const category=document.getElementById(
        "quoteCategory"
    )?.value || "";

    const select=document.getElementById(
        "quoteSubcategory"
    );

    if(!select) return;

    populateSelect(
        select,
        categories[category] || [],
        "Selecione"
    );

    if(selectedValue){
        select.value=selectedValue;
    }
}

/* =========================================================
   DESPESAS
========================================================= */

function setupExpenseForm(){
    const form=document.getElementById("expenseForm");

    document.getElementById("expenseCategory")
        ?.addEventListener("change",()=>{
            updateSubcategories();
        });

    document.getElementById("expenseAmount")
        ?.addEventListener("input",event=>{
            moneyMask(event.target);
        });

    form?.addEventListener("submit",event=>{
        event.preventDefault();
        saveExpense();
    });
}

function openExpenseModal(id=null){
    const modal=document.getElementById("expenseModal");
    const form=document.getElementById("expenseForm");

    if(!modal || !form) return;

    editingExpenseId=id;

    form.reset();

    const hidden=document.getElementById("expenseId");

    if(hidden) hidden.value=id || "";

    const date=document.getElementById("expenseDate");

    if(date) date.value=getTodayDate();

    const title=document.getElementById("expenseModalTitle");

    if(!id){
        if(title) title.textContent="Nova despesa";
    }else{
        const expense=appData.expenses.find(
            item=>item.id===id
        );

        if(!expense) return;

        if(title) title.textContent="Editar despesa";

        setValue("expenseDescription",expense.description);
        setValue("expenseCategory",expense.category);

        updateSubcategories(expense.subcategory);

        setValue("expenseAmount",formatCurrency(expense.amount));
        setValue("expenseDate",expense.date);
        setValue("expenseNotes",expense.notes || "");
    }

    modal.hidden=false;
}

function closeExpenseModal(){
    const modal=document.getElementById("expenseModal");

    if(modal) modal.hidden=true;

    editingExpenseId=null;
}

function saveExpense(){
    const description=getValue("expenseDescription").trim();
    const category=getValue("expenseCategory");
    const subcategory=getValue("expenseSubcategory");
    const amount=parseMoney(getValue("expenseAmount"));
    const date=getValue("expenseDate");
    const notes=getValue("expenseNotes").trim();

    if(!description || !category || !subcategory || !amount || !date){
        showToast("Preencha todos os campos obrigatórios.");
        return;
    }

    const data={
        id:editingExpenseId || createId(),
        description,
        category,
        subcategory,
        amount,
        date,
        notes
    };

    if(editingExpenseId){
        const index=appData.expenses.findIndex(
            item=>item.id===editingExpenseId
        );

        if(index>=0){
            appData.expenses[index]=data;
        }
    }else{
        appData.expenses.unshift(data);
    }

    saveData();
    closeExpenseModal();
    renderExpenses();
    updateDashboard();

    showToast(
        editingExpenseId
            ? "Despesa atualizada."
            : "Despesa salva com sucesso."
    );
}

function deleteExpense(id){
    if(!confirm("Excluir esta despesa?")) return;

    appData.expenses=appData.expenses.filter(
        item=>item.id!==id
    );

    saveData();
    renderExpenses();
    updateDashboard();

    showToast("Despesa excluída.");
}

function renderExpenses(){
    const tbody=document.getElementById(
        "expensesTableBody"
    );

    const empty=document.getElementById(
        "expensesEmpty"
    );

    if(!tbody) return;

    const search=(getValue("expenseSearch") || "")
        .toLowerCase()
        .trim();

    const category=getValue(
        "expenseCategoryFilter"
    );

    const month=getValue(
        "expenseMonthFilter"
    );

    let list=[...appData.expenses];

    if(search){
        list=list.filter(item=>
            `${item.description} ${item.category} ${item.subcategory} ${item.notes || ""}`
                .toLowerCase()
                .includes(search)
        );
    }

    if(category){
        list=list.filter(item=>item.category===category);
    }

    if(month){
        list=list.filter(item=>String(item.date).startsWith(month));
    }

    list.sort((a,b)=>
        String(b.date).localeCompare(String(a.date))
    );

    tbody.innerHTML="";

    if(!list.length){
        if(empty) empty.hidden=false;
        return;
    }

    if(empty) empty.hidden=true;

    list.forEach(item=>{
        const tr=document.createElement("tr");

        tr.innerHTML=`
            <td>
                <strong>${escapeHTML(item.description)}</strong>
            </td>
            <td>${escapeHTML(item.category)}</td>
            <td>${escapeHTML(item.subcategory)}</td>
            <td><strong>${formatCurrency(item.amount)}</strong></td>
            <td>${formatDate(item.date)}</td>
            <td>
                <div class="table-actions">
                    <button
                        class="icon-button"
                        title="Editar"
                        onclick="openExpenseModal('${item.id}')"
                    >✎</button>

                    <button
                        class="icon-button"
                        title="Excluir"
                        onclick="deleteExpense('${item.id}')"
                    >×</button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

/* =========================================================
   COTAÇÕES
========================================================= */

function setupQuoteForm(){
    const form=document.getElementById("quoteForm");

    document.getElementById("quoteCategory")
        ?.addEventListener("change",()=>{
            updateQuoteSubcategories();
        });

    document.getElementById("quotePrice")
        ?.addEventListener("input",event=>{
            moneyMask(event.target);
        });

    form?.addEventListener("submit",event=>{
        event.preventDefault();
        saveQuote();
    });
}

function openQuoteModal(id=null){
    const modal=document.getElementById("quoteModal");
    const form=document.getElementById("quoteForm");

    if(!modal || !form) return;

    editingQuoteId=id;
    form.reset();

    setValue("quoteId",id || "");
    setValue("quoteDate",getTodayDate());

    const title=document.getElementById("quoteModalTitle");

    if(!id){
        if(title) title.textContent="Nova cotação";
    }else{
        const quote=quotes.find(
            item=>item.id===id
        );

        if(!quote) return;

        if(title) title.textContent="Editar cotação";

        setValue("quoteProduct",quote.product);
        setValue("quoteCategory",quote.category);

        updateQuoteSubcategories(
            quote.subcategory
        );

        setValue("quoteStore",quote.store);
        setValue("quotePrice",formatCurrency(quote.price));
        setValue("quoteDate",quote.date);
        setValue("quoteNotes",quote.notes || "");
    }

    modal.hidden=false;
}

function closeQuoteModal(){
    const modal=document.getElementById("quoteModal");

    if(modal) modal.hidden=true;

    editingQuoteId=null;
}

function saveQuote(){
    const product=getValue("quoteProduct").trim();
    const category=getValue("quoteCategory");
    const subcategory=getValue("quoteSubcategory");
    const store=getValue("quoteStore").trim();
    const price=parseMoney(getValue("quotePrice"));
    const date=getValue("quoteDate");
    const notes=getValue("quoteNotes").trim();

    if(!product || !category || !subcategory || !store || !price || !date){
        showToast("Preencha todos os campos obrigatórios.");
        return;
    }

    const quote={
        id:editingQuoteId || createId(),
        product,
        category,
        subcategory,
        store,
        price,
        date,
        notes
    };

    if(editingQuoteId){
        const index=quotes.findIndex(
            item=>item.id===editingQuoteId
        );

        if(index>=0) quotes[index]=quote;
    }else{
        quotes.unshift(quote);
    }

    saveQuotes();
    closeQuoteModal();
    renderQuotes();
    updateDashboard();

    showToast(
        editingQuoteId
            ? "Cotação atualizada."
            : "Cotação salva com sucesso."
    );
}

function deleteQuote(id){
    if(!confirm("Excluir esta cotação?")) return;

    quotes=quotes.filter(item=>item.id!==id);

    saveQuotes();
    renderQuotes();
    updateDashboard();

    showToast("Cotação excluída.");
}

function renderQuotes(){
    const container=document.getElementById(
        "quotesContainer"
    );

    const empty=document.getElementById(
        "quotesEmpty"
    );

    if(!container) return;

    const search=(getValue("quoteSearch") || "")
        .toLowerCase()
        .trim();

    const category=getValue(
        "quoteCategoryFilter"
    );

    let list=[...quotes];

    if(search){
        list=list.filter(item=>
            `${item.product} ${item.store} ${item.category} ${item.subcategory} ${item.notes || ""}`
                .toLowerCase()
                .includes(search)
        );
    }

    if(category){
        list=list.filter(
            item=>item.category===category
        );
    }

    list.sort((a,b)=>
        String(b.date).localeCompare(String(a.date))
    );

    container.innerHTML="";

    if(!list.length){
        if(empty) empty.hidden=false;
        return;
    }

    if(empty) empty.hidden=true;

    list.forEach(quote=>{
        const card=document.createElement("article");

        card.className="quote-card";

        card.innerHTML=`
            <div class="quote-card-header">
                <div>
                    <h3>${escapeHTML(quote.product)}</h3>
                </div>

                <div class="price">
                    ${formatCurrency(quote.price)}
                </div>
            </div>

            <div class="quote-card-meta">
                <span>🏪 ${escapeHTML(quote.store)}</span>
                <span>${escapeHTML(quote.category)}</span>
                <span>${escapeHTML(quote.subcategory)}</span>
                <span>${formatDate(quote.date)}</span>
            </div>

            ${
                quote.notes
                ? `
                    <div class="quote-card-notes">
                        <strong>Observação:</strong><br>
                        ${escapeHTML(quote.notes)}
                    </div>
                `
                : ""
            }

            <div class="quote-card-actions">
                <button
                    class="secondary-button"
                    onclick="openQuoteModal('${quote.id}')"
                >
                    Editar
                </button>

                <button
                    class="secondary-button"
                    onclick="deleteQuote('${quote.id}')"
                >
                    Excluir
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard(){
    const balance=Number(appData.monthlyBalance || 0);

    const currentMonth=getCurrentMonth();

    const spent=appData.expenses
        .filter(item=>
            String(item.date).startsWith(currentMonth)
        )
        .reduce(
            (sum,item)=>sum+Number(item.amount || 0),
            0
        );

    const planned=quotes.reduce(
        (sum,item)=>sum+Number(item.price || 0),
        0
    );

    const projected=balance-spent-planned;

    setText(
        "dashboardBudget",
        formatCurrency(balance)
    );

    setText(
        "dashboardSpent",
        formatCurrency(spent)
    );

    setText(
        "dashboardPlanned",
        formatCurrency(planned)
    );

    setText(
        "dashboardProjected",
        formatCurrency(projected)
    );

    setText(
        "quoteCount",
        String(quotes.length)
    );

    setText(
        "totalExpenses",
        formatCurrency(spent)
    );

    setText(
        "dashboardQuotes",
        ""
    );

    renderDashboardQuotes();
    renderRecentExpenses();
    updateBudgetPlanning();
    updatePurchaseStatus();
}

function renderDashboardQuotes(){
    const container=document.getElementById(
        "dashboardQuotes"
    );

    const empty=document.getElementById(
        "dashboardQuotesEmpty"
    );

    if(!container) return;

    container.innerHTML="";

    const list=quotes.slice(0,6);

    if(!list.length){
        if(empty) empty.hidden=false;
        return;
    }

    if(empty) empty.hidden=true;

    list.forEach(quote=>{
        const item=document.createElement("div");

        item.className="dashboard-quote-item";

        item.innerHTML=`
            <div class="quote-main-row">
                <div>
                    <strong>${escapeHTML(quote.product)}</strong>
                    <div class="quote-meta">
                        ${escapeHTML(quote.store)}
                        ·
                        ${formatDate(quote.date)}
                    </div>
                </div>

                <span class="quote-price">
                    ${formatCurrency(quote.price)}
                </span>
            </div>

            ${
                quote.notes
                ? `
                    <div
                        class="quote-details"
                        id="details-${quote.id}"
                    >
                        <strong>Observação:</strong><br>
                        ${escapeHTML(quote.notes)}
                    </div>

                    <button
                        class="text-button"
                        style="margin-top:8px"
                        onclick="toggleQuoteDetails('${quote.id}')"
                    >
                        Mais detalhes
                    </button>
                `
                : ""
            }
        `;

        container.appendChild(item);
    });
}

function toggleQuoteDetails(id){
    const element=document.getElementById(
        `details-${id}`
    );

    if(element){
        element.classList.toggle("open");
    }
}

function renderRecentExpenses(){
    const container=document.getElementById(
        "recentExpenses"
    );

    const empty=document.getElementById(
        "recentExpensesEmpty"
    );

    if(!container) return;

    container.innerHTML="";

    const list=[...appData.expenses]
        .sort((a,b)=>
            String(b.date).localeCompare(String(a.date))
        )
        .slice(0,6);

    if(!list.length){
        if(empty) empty.hidden=false;
        return;
    }

    if(empty) empty.hidden=true;

    list.forEach(expense=>{
        const item=document.createElement("div");

        item.className="recent-item";

        item.innerHTML=`
            <div class="recent-main-row">
                <div>
                    <strong>
                        ${escapeHTML(expense.description)}
                    </strong>

                    <div class="recent-meta">
                        ${escapeHTML(expense.category)}
                        ·
                        ${formatDate(expense.date)}
                    </div>
                </div>

                <strong>
                    ${formatCurrency(expense.amount)}
                </strong>
            </div>
        `;

        container.appendChild(item);
    });
}

/* =========================================================
   ORÇAMENTO / SALÁRIO
========================================================= */

function setupBudgetControl(){
    const input=document.getElementById("salaryInput");

    if(!input) return;

    input.value=appData.monthlyBalance
        ? formatCurrency(appData.monthlyBalance)
        : "";

    input.addEventListener("input",()=>{
        salaryMask(input);
    });
}

function salaryMask(input){
    if(!input) return;

    const digits=String(input.value || "")
        .replace(/\D/g,"");

    if(!digits){
        input.value="";
        return;
    }

    const number=Number(digits)/100;

    input.value=new Intl.NumberFormat(
        "pt-BR",
        {
            style:"currency",
            currency:"BRL"
        }
    ).format(number);
}

function parseSalary(value){
    return parseMoney(value);
}

function saveSalary(){
    const input=document.getElementById("salaryInput");

    if(!input) return;

    const value=parseSalary(input.value);

    if(value<0){
        showToast("Digite um valor válido.");
        return;
    }

    appData.monthlyBalance=value;

    saveData();

    input.value=value
        ? formatCurrency(value)
        : "";

    updateDashboard();

    showToast("Saldo mensal salvo com sucesso.");
}

/* compatibilidade */
function saveMonthlyBalance(){
    saveSalary();
}

function updateBudgetPlanning(){
    const balance=Number(
        appData.monthlyBalance || 0
    );

    const month=getCurrentMonth();

    const spent=appData.expenses
        .filter(item=>
            String(item.date).startsWith(month)
        )
        .reduce(
            (sum,item)=>sum+Number(item.amount || 0),
            0
        );

    const planned=quotes.reduce(
        (sum,item)=>sum+Number(item.price || 0),
        0
    );

    const projected=balance-spent-planned;

    const used=spent+planned;

    let percent=balance>0
        ? (used/balance)*100
        : 0;

    percent=Math.max(0,Math.min(100,percent));

    const progress=document.getElementById(
        "budgetProgress"
    );

    const progressLabel=document.getElementById(
        "budgetProgressLabel"
    );

    const progressPercent=document.getElementById(
        "budgetProgressPercent"
    );

    const badge=document.getElementById(
        "budgetStatusBadge"
    );

    const status=document.getElementById(
        "budgetStatusText"
    );

    if(progress){
        progress.style.width=`${percent}%`;

        progress.classList.remove(
            "good","warning","danger"
        );

        progress.classList.add(
            getBudgetClass(balance,used)
        );
    }

    if(progressLabel){
        progressLabel.textContent=
            balance>0
                ? `${formatCurrency(used)} comprometidos`
                : "Informe seu saldo mensal";
    }

    if(progressPercent){
        progressPercent.textContent=
            balance>0
                ? `${Math.round(percent)}%`
                : "0%";
    }

    const budgetClass=getBudgetClass(
        balance,
        used
    );

    if(badge){
        badge.className=`status-badge ${budgetClass}`;

        badge.textContent=
            budgetClass==="good"
                ? "Dentro do limite"
                : budgetClass==="warning"
                    ? "Cuidado"
                    : "Risco";
    }

    if(status){
        status.textContent=
            balance<=0
                ? "Informe seu saldo disponível."
                : projected<0
                    ? "Os gastos planejados ultrapassam seu saldo."
                    : projected<balance*.2
                        ? "Seu saldo projetado está ficando baixo."
                        : "Seu planejamento está dentro do saldo.";
    }

    const projectedLabel=document.getElementById(
        "dashboardProjectedLabel"
    );

    if(projectedLabel){
        projectedLabel.textContent=
            projected<0
                ? "Saldo projetado negativo"
                : "Saldo projetado";
    }
}

function getBudgetClass(balance,used){
    if(balance<=0) return "neutral";

    const percent=(used/balance)*100;

    if(percent>=100) return "danger";
    if(percent>=75) return "warning";

    return "good";
}

function updatePurchaseStatus(){
    const balance=Number(
        appData.monthlyBalance || 0
    );

    const month=getCurrentMonth();

    const spent=appData.expenses
        .filter(item=>
            String(item.date).startsWith(month)
        )
        .reduce(
            (sum,item)=>sum+Number(item.amount || 0),
            0
        );

    const planned=quotes.reduce(
        (sum,item)=>sum+Number(item.price || 0),
        0
    );

    const projected=balance-spent-planned;

    const icon=document.getElementById(
        "purchaseStatusIcon"
    );

    const title=document.getElementById(
        "purchaseStatusTitle"
    );

    const description=document.getElementById(
        "purchaseStatusDescription"
    );

    if(!icon || !title || !description) return;

    icon.classList.remove(
        "good","warning","danger"
    );

    if(balance<=0){
        title.textContent="Informe seu saldo";
        description.textContent=
            "Cadastre o valor disponível no mês para acompanhar suas compras.";
        icon.textContent="💰";
        return;
    }

    if(projected<0){
        icon.classList.add("danger");
        icon.textContent="⚠️";
        title.textContent="Risco de perda";
        description.textContent=
            "Suas despesas e cotações planejadas ultrapassam o saldo disponível.";
        return;
    }

    if(projected<balance*.2){
        icon.classList.add("warning");
        icon.textContent="⚠️";
        title.textContent="Cuidado";
        description.textContent=
            "A compra pode comprometer uma parte importante do seu saldo.";
        return;
    }

    icon.classList.add("good");
    icon.textContent="✓";
    title.textContent="Pode comprar";
    description.textContent=
        "Seu planejamento atual permanece dentro do saldo disponível.";
}

/* =========================================================
   FILTROS
========================================================= */

function setupFilters(){
    document.getElementById("expenseSearch")
        ?.addEventListener("input",renderExpenses);

    document.getElementById("expenseCategoryFilter")
        ?.addEventListener("change",renderExpenses);

    document.getElementById("expenseMonthFilter")
        ?.addEventListener("change",renderExpenses);

    document.getElementById("quoteSearch")
        ?.addEventListener("input",renderQuotes);

    document.getElementById("quoteCategoryFilter")
        ?.addEventListener("change",renderQuotes);
}

/* =========================================================
   MODAIS
========================================================= */

function setupModalEvents(){
    const expenseModal=document.getElementById(
        "expenseModal"
    );

    const quoteModal=document.getElementById(
        "quoteModal"
    );

    expenseModal?.addEventListener("click",event=>{
        if(event.target===expenseModal){
            closeExpenseModal();
        }
    });

    quoteModal?.addEventListener("click",event=>{
        if(event.target===quoteModal){
            closeQuoteModal();
        }
    });

    document.addEventListener("keydown",event=>{
        if(event.key==="Escape"){
            closeExpenseModal();
            closeQuoteModal();
        }
    });
}

/* =========================================================
   MÁSCARA DE MOEDA
========================================================= */

function moneyMask(input){
    if(!input) return;

    const digits=String(input.value || "")
        .replace(/\D/g,"");

    if(!digits){
        input.value="";
        return;
    }

    input.value=new Intl.NumberFormat(
        "pt-BR",
        {
            style:"currency",
            currency:"BRL"
        }
    ).format(Number(digits)/100);
}

/* =========================================================
   PARSE / FORMATAÇÃO
========================================================= */

function parseMoney(value){
    if(value===null || value===undefined) return 0;

    let text=String(value)
        .trim()
        .replace(/[^\d,.-]/g,"");

    if(!text) return 0;

    if(text.includes(",")){
        text=text.replace(/\./g,"");
        text=text.replace(",",".");
    }

    const result=parseFloat(text);

    return Number.isNaN(result) ? 0 : result;
}

function formatCurrency(value){
    return new Intl.NumberFormat(
        "pt-BR",
        {
            style:"currency",
            currency:"BRL"
        }
    ).format(Number(value)||0);
}

/* =========================================================
   DATAS
========================================================= */

function getTodayDate(){
    const date=new Date();

    return `${date.getFullYear()}-${String(
        date.getMonth()+1
    ).padStart(2,"0")}-${String(
        date.getDate()
    ).padStart(2,"0")}`;
}

function getCurrentMonth(){
    const date=new Date();

    return `${date.getFullYear()}-${String(
        date.getMonth()+1
    ).padStart(2,"0")}`;
}

function formatDate(dateString){
    if(!dateString) return "-";

    const parts=String(dateString).split("-");

    if(parts.length===3){
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    return String(dateString);
}

/* =========================================================
   CATEGORIAS
========================================================= */

function renderCategories(){
    const container=document.getElementById(
        "categoriesContainer"
    );

    if(!container) return;

    container.innerHTML=Object.entries(categories)
        .map(([category,subcategories])=>`
            <div class="category-card">
                <h3>${escapeHTML(category)}</h3>

                <div class="subcategory-list">
                    ${subcategories.map(sub=>`
                        <span class="subcategory">
                            ${escapeHTML(sub)}
                        </span>
                    `).join("")}
                </div>
            </div>
        `)
        .join("");
}

/* =========================================================
   HELPERS
========================================================= */

function getValue(id){
    return document.getElementById(id)?.value || "";
}

function setValue(id,value){
    const element=document.getElementById(id);

    if(element){
        element.value=value ?? "";
    }
}

function setText(id,value){
    const element=document.getElementById(id);

    if(element){
        element.textContent=value;
    }
}

function createId(){
    return `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2,9)}`;
}

function escapeHTML(value){
    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}

/* =========================================================
   TOAST
========================================================= */

function showToast(message){
    const toast=document.getElementById("toast");
    const toastMessage=document.getElementById(
        "toastMessage"
    );

    if(!toast || !toastMessage) return;

    toastMessage.textContent=message;

    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout=setTimeout(()=>{
        toast.classList.remove("show");
    },2500);
}

/* =========================================================
   EXPOSIÇÃO PARA OS onclick DO HTML
========================================================= */

window.showPage=showPage;
window.openExpenseModal=openExpenseModal;
window.closeExpenseModal=closeExpenseModal;
window.deleteExpense=deleteExpense;

window.openQuoteModal=openQuoteModal;
window.closeQuoteModal=closeQuoteModal;
window.deleteQuote=deleteQuote;

window.saveSalary=saveSalary;
window.saveMonthlyBalance=saveMonthlyBalance;

window.toggleQuoteDetails=toggleQuoteDetails;