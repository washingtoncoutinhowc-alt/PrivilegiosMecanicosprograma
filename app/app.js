const STORAGE_KEY = "spm.v2";

const firebaseConfig = window.SPM_FIREBASE_CONFIG || {
  apiKey: "",
  authDomain: "",
  projectId: "",
  appId: ""
};

let firebaseRuntime = null;

const monthNames = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const categories = {
  host: "Anfitriao",
  cohost: "Coanfitriao",
  elder: "Anciao Indicador",
  indicator: "Servo/Publicador Indicador",
  mic: "Microfone Volante"
};

const seedPeople = [
  ["Anfitriao", 1, "Ataide", "Rodizio fixo"],
  ["Anfitriao", 2, "Jose Henrique", "Rodizio fixo"],
  ["Anfitriao", 3, "Washington", "Rodizio fixo"],
  ["Anfitriao", 4, "Ailton", "Rodizio fixo"],
  ["Coanfitriao", 1, "Anderson", "Rodizio fixo"],
  ["Coanfitriao", 2, "Andre", "Rodizio fixo"],
  ["Coanfitriao", 3, "Tobias", "Rodizio fixo"],
  ["Coanfitriao", 4, "Felipe Grassi", "Rodizio fixo"],
  ["Anciao Indicador", 1, "Pedro", "1 anciao por semana"],
  ["Anciao Indicador", 2, "Julio", "1 anciao por semana"],
  ["Anciao Indicador", 3, "Andre", "1 anciao por semana"],
  ["Anciao Indicador", 4, "Washington", "1 anciao por semana"],
  ["Anciao Indicador", 5, "John", "1 anciao por semana"],
  ["Anciao Indicador", 6, "Jeferson", "1 anciao por semana"],
  ["Servo/Publicador Indicador", 1, "Ailton Rocha", "Indicador 2 ou 3"],
  ["Servo/Publicador Indicador", 2, "Gilbert", "Indicador 2 ou 3"],
  ["Servo/Publicador Indicador", 3, "Sanches", "Indicador 2 ou 3"],
  ["Servo/Publicador Indicador", 4, "Anderson", "Indicador 2 ou 3"],
  ["Servo/Publicador Indicador", 5, "Tobias", "Indicador 2 ou 3"],
  ["Servo/Publicador Indicador", 6, "Jairo", "Indicador 2 ou 3"],
  ["Servo/Publicador Indicador", 7, "Leonardo", "Indicador 2 ou 3"],
  ["Servo/Publicador Indicador", 8, "Roberto", "Indicador 2 ou 3"],
  ["Servo/Publicador Indicador", 9, "Ailton Carlos", "Indicador 2 ou 3"],
  ["Servo/Publicador Indicador", 10, "Daniel", "Indicador 2 ou 3"],
  ["Servo/Publicador Indicador", 11, "Ruston", "Indicador 2 ou 3"],
  ["Microfone Volante", 1, "Claudio", "Escolha automatica/sem sequencia fixa"],
  ["Microfone Volante", 2, "Anderson G.", "Escolha automatica/sem sequencia fixa"],
  ["Microfone Volante", 3, "Julio", "Escolha automatica/sem sequencia fixa"],
  ["Microfone Volante", 4, "Jeferson", "Escolha automatica/sem sequencia fixa"],
  ["Microfone Volante", 5, "Marcos", "Escolha automatica/sem sequencia fixa"],
  ["Microfone Volante", 6, "Daniel", "Escolha automatica/sem sequencia fixa"],
  ["Microfone Volante", 7, "Ruston", "Escolha automatica/sem sequencia fixa"],
  ["Microfone Volante", 8, "Leonardo", "Escolha automatica/sem sequencia fixa"],
  ["Microfone Volante", 9, "Tobias", "Escolha automatica/sem sequencia fixa"],
  ["Microfone Volante", 10, "Sanches", "Escolha automatica/sem sequencia fixa"]
];

const rules = [
  ["Data inicial", "Comecar a gerar escala a partir de 01/07/2026.", "Fechada"],
  ["Mesma equipe", "Os irmaos escolhidos para quarta-feira serao os mesmos do sabado da mesma semana.", "Fechada"],
  ["Sem acumulo", "Na mesma reuniao, a pessoa nao pode ter dois privilegios.", "Fechada"],
  ["Anfitriao", "Rodizio fixo na sequencia cadastrada.", "Fechada"],
  ["Coanfitriao", "Rodizio fixo na sequencia cadastrada.", "Fechada"],
  ["Indicadores", "Escolher 3 por semana: 1 anciao e 2 servos/publicadores.", "Fechada"],
  ["Posicoes dos indicadores", "Quarta e sabado usam os mesmos nomes, mas em posicoes diferentes.", "Fechada"],
  ["Microfones volantes", "Escolher 2 nomes habilitados evitando quem ja tem privilegio.", "Fechada"],
  ["Ausencias", "Quando houver ausencia, o sistema pula o irmao naquela semana.", "Preparada"],
  ["Alteracao manual", "Permitir ajuste manual sem perder o historico.", "Preparada"]
];

const schema = `pessoas(id, nome, ativo, observacao, criado_em, atualizado_em)
privilegios(id, codigo, nome, categoria, ativo)
elegibilidades(id, pessoa_id, privilegio_id, ordem, observacao)
regras_sistema(id, chave, valor, descricao)
ausencias(id, pessoa_id, data_inicio, data_fim, motivo, observacao)
semanas(id, numero, data_quarta, data_sabado, status, gerada_em)
reunioes(id, semana_id, data, dia_semana)
designacoes(id, reuniao_id, pessoa_id, privilegio, posicao, origem, observacao)
ajustes_manuais(id, designacao_id, pessoa_anterior_id, pessoa_nova_id, motivo, alterado_em)
historico(id, data, semana_id, privilegio, posicao, pessoa_id, origem, observacao, criado_em)
execucoes_geracao(id, periodo_inicio, periodo_fim, status, mensagem, criado_em)
usuarios(id, nome, email, perfil, ativo, provedor, criado_em, ultimo_acesso_em)`;

const initialState = {
  selectedMonth: "2026-07",
  people: seedPeople.map(([category, order, name, note]) => ({
    id: crypto.randomUUID(),
    category,
    order,
    name,
    note,
    active: true,
    createdAt: new Date().toISOString()
  })),
  absences: [],
  importantDates: [],
  authUsers: [
    {
      id: crypto.randomUUID(),
      name: "Administrador local",
      email: "admin@local",
      role: "admin",
      active: true
    }
  ],
  currentUser: null,
  months: {},
  history: [],
  manualChanges: [],
  printImage: ""
};

let state = loadState();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const loaded = saved ? JSON.parse(saved) : structuredClone(initialState);
  loaded.importantDates = loaded.importantDates || [];
  loaded.authUsers = loaded.authUsers || initialState.authUsers;
  loaded.currentUser = loaded.currentUser || null;
  loaded.months = loaded.months || {};
  loaded.absences = loaded.absences || [];
  return loaded;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeEmail(email) {
  return email.trim().toLocaleLowerCase("pt-BR");
}

function isFirebaseConfigured() {
  return firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId;
}

function currentAuthUser() {
  if (!state.currentUser) return null;
  return (state.authUsers || []).find((user) => (
    normalizeEmail(user.email) === normalizeEmail(state.currentUser.email) && user.active
  )) || null;
}

function isAdmin() {
  return currentAuthUser()?.role === "admin";
}

function signInAs(user) {
  state.currentUser = {
    name: user.name,
    email: normalizeEmail(user.email),
    provider: user.provider || "local"
  };
  saveState();
  render();
}

function signOut() {
  state.currentUser = null;
  saveState();
  render();
}

async function signInWithGoogle() {
  const message = document.querySelector("#authMessage");
  if (!isFirebaseConfigured()) {
    message.textContent = "O login Google ainda precisa das chaves do Firebase.";
    return;
  }
  try {
    message.textContent = "Abrindo login Google...";
    if (!firebaseRuntime) {
      const appModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
      const authModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");
      const app = appModule.initializeApp(firebaseConfig);
      const auth = authModule.getAuth(app);
      const provider = new authModule.GoogleAuthProvider();
      firebaseRuntime = { auth, provider, signInWithPopup: authModule.signInWithPopup, firebaseSignOut: authModule.signOut };
    }

    const result = await firebaseRuntime.signInWithPopup(firebaseRuntime.auth, firebaseRuntime.provider);
    const googleUser = result.user;
    const email = normalizeEmail(googleUser.email || "");
    const authorized = (state.authUsers || []).find((user) => normalizeEmail(user.email) === email && user.active);

    if (!authorized) {
      await firebaseRuntime.firebaseSignOut(firebaseRuntime.auth);
      message.textContent = "Acesso nao autorizado. Peça ao administrador para cadastrar seu e-mail.";
      return;
    }

    signInAs({
      name: authorized.name || googleUser.displayName || email,
      email,
      provider: "google"
    });
  } catch (error) {
    message.textContent = "Nao foi possivel entrar com Google agora.";
  }
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(value, amount) {
  const date = typeof value === "string" ? parseDate(value) : new Date(value);
  date.setDate(date.getDate() + amount);
  return toDateInput(date);
}

function formatDate(value) {
  if (!value || value === "Sistema") return value || "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function dayMonth(value) {
  const [year, month, day] = value.split("-");
  return `${day} de ${monthNames[Number(month) - 1]}`;
}

function monthLabel(monthKey) {
  const [year, month] = monthKey.split("-");
  return `${monthNames[Number(month) - 1]} de ${year}`;
}

function byCategory(category) {
  return state.people
    .filter((person) => person.category === category && person.active)
    .sort((a, b) => a.order - b.order);
}

function isAbsent(name, start, end) {
  const weekStart = parseDate(start);
  const weekEnd = parseDate(end);
  return state.absences.some((absence) => {
    if (absence.name !== name) return false;
    const absenceStart = parseDate(absence.start);
    const absenceEnd = parseDate(absence.end);
    return absenceStart <= weekEnd && absenceEnd >= weekStart;
  });
}

function importantLabel(type) {
  const labels = {
    congresso: "Congresso",
    assembleia_circuito: "Assembleia de circuito",
    assembleia_representante: "Assembleia com representante",
    visita_superintendente: "Visita do superintendente",
    celebracao: "Celebracao"
  };
  return labels[type] || type;
}

function hasNoProgramming(type) {
  return ["congresso", "assembleia_circuito", "assembleia_representante"].includes(type);
}

function isSuperintendentVisit(meeting) {
  return meeting.important?.type === "visita_superintendente";
}

function overlaps(startA, endA, startB, endB) {
  return parseDate(startA) <= parseDate(endB) && parseDate(endA) >= parseDate(startB);
}

function importantForMeeting(date, weekStart, weekEnd) {
  return (state.importantDates || []).find((item) => {
    const start = item.start || item.date;
    const end = item.end || item.date || start;
    if (hasNoProgramming(item.type)) return overlaps(start, end, weekStart, weekEnd);
    return overlaps(start, end, date, date);
  }) || null;
}

function nextAvailable(list, used, startIndex, start, end, avoid = new Set()) {
  for (let offset = 0; offset < list.length; offset += 1) {
    const person = list[(startIndex + offset) % list.length];
    if (!avoid.has(person.name) && !used.has(person.name) && !isAbsent(person.name, start, end)) {
      used.add(person.name);
      return person;
    }
  }

  for (let offset = 0; offset < list.length; offset += 1) {
    const person = list[(startIndex + offset) % list.length];
    if (!used.has(person.name) && !isAbsent(person.name, start, end)) {
      used.add(person.name);
      return person;
    }
  }

  return null;
}

function previousMonthKey(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function nextMonthKey(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function previousMonthUsedNames(monthKey, roles) {
  const previous = state.months[previousMonthKey(monthKey)];
  if (!previous) return new Set();
  const names = previous.weeks
    .flatMap((week) => week.meetings)
    .flatMap((meeting) => meeting.assignments)
    .filter((item) => roles.includes(item.role))
    .map((item) => item.name);
  return new Set(names);
}

function programmingWeeksCount(month) {
  if (!month) return 0;
  return month.weeks.filter((week) => (
    week.meetings.some((meeting) => !meeting.noProgramming && meeting.assignments.length > 0)
  )).length;
}

function rotationOffsetForMonth(monthKey) {
  return Object.keys(state.months)
    .filter((key) => key < monthKey)
    .sort()
    .reduce((total, key) => total + programmingWeeksCount(state.months[key]), 0);
}

function wednesdaysInMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  const dates = [];
  while (date.getMonth() === month - 1) {
    if (date.getDay() === 3) dates.push(toDateInput(date));
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

function assignment(key, role, position, name) {
  return { id: crypto.randomUUID(), key, role, position, name, origin: "Automatica" };
}

function generateMonth(monthKey = state.selectedMonth, shouldRender = true) {
  const wednesdays = wednesdaysInMonth(monthKey);
  const weeks = [];
  const monthNumber = Number(monthKey.split("-")[1]);
  const avoidIndicators = previousMonthUsedNames(monthKey, ["Indicador Auditorio", "Indicador Estacionamento"]);
  const avoidMics = previousMonthUsedNames(monthKey, ["Volante 1", "Volante 2"]);
  let rotationIndex = rotationOffsetForMonth(monthKey);
  let failed = false;

  wednesdays.forEach((wednesday, index) => {
    const saturday = addDays(wednesday, 3);
    if (parseDate(saturday).getMonth() + 1 !== monthNumber) return;

    const weekNumber = index + 1;
    const wedImportant = importantForMeeting(wednesday, wednesday, saturday);
    const satImportant = importantForMeeting(saturday, wednesday, saturday);
    const wedNoProgram = wedImportant && hasNoProgramming(wedImportant.type);
    const satNoProgram = satImportant && hasNoProgramming(satImportant.type);
    const weekHasProgramming = !wedNoProgram || !satNoProgram;

    if (!weekHasProgramming) {
      weeks.push({
        id: crypto.randomUUID(),
        number: weekNumber,
        wednesday,
        saturday,
        skippedRotation: true,
        meetings: [
          {
            key: `w${weekNumber}`,
            label: "Quarta-feira",
            date: wednesday,
            assignments: [],
            important: wedImportant,
            noProgramming: true
          },
          {
            key: `s${weekNumber}`,
            label: "Sabado",
            date: saturday,
            assignments: [],
            important: satImportant,
            noProgramming: true
          }
        ]
      });
      return;
    }

    const used = new Set();
    const host = nextAvailable(byCategory(categories.host), used, rotationIndex, wednesday, saturday);
    const cohost = nextAvailable(byCategory(categories.cohost), used, rotationIndex, wednesday, saturday);
    const elder = nextAvailable(byCategory(categories.elder), used, rotationIndex, wednesday, saturday);
    const indicatorB = nextAvailable(byCategory(categories.indicator), used, rotationIndex * 2, wednesday, saturday, avoidIndicators);
    const indicatorC = nextAvailable(byCategory(categories.indicator), used, rotationIndex * 2 + 1, wednesday, saturday, avoidIndicators);
    const mic1 = nextAvailable(byCategory(categories.mic), used, rotationIndex * 2, wednesday, saturday, avoidMics);
    const mic2 = nextAvailable(byCategory(categories.mic), used, rotationIndex * 2 + 1, wednesday, saturday, avoidMics);
    const required = [host, cohost, elder, indicatorB, indicatorC, mic1, mic2];

    if (required.some((person) => !person)) {
      failed = true;
      return;
    }

    const wedAssignments = [
      assignment("host", "Anfitriao", "Anfitriao", host.name),
      assignment("cohost", "Coanfitriao", "Coanfitriao", cohost.name),
      assignment("entry", "Indicador Entrada", "Entrada", elder.name),
      assignment("auditorium", "Indicador Auditorio", "Auditorio", indicatorB.name),
      assignment("parking", "Indicador Estacionamento", "Estacionamento", indicatorC.name),
      assignment("mic1", "Volante 1", "Microfone", mic1.name),
      assignment("mic2", "Volante 2", "Microfone", mic2.name)
    ];
    const satAssignments = [
      assignment("host", "Anfitriao", "Anfitriao", host.name),
      assignment("cohost", "Coanfitriao", "Coanfitriao", cohost.name),
      assignment("entry", "Indicador Entrada", "Entrada", indicatorB.name),
      assignment("auditorium", "Indicador Auditorio", "Auditorio", indicatorC.name),
      assignment("parking", "Indicador Estacionamento", "Estacionamento", elder.name),
      assignment("mic1", "Volante 1", "Microfone", mic1.name),
      assignment("mic2", "Volante 2", "Microfone", mic2.name)
    ];

    weeks.push({
      id: crypto.randomUUID(),
      number: weekNumber,
      wednesday,
      saturday,
      meetings: [
        {
          key: `w${weekNumber}`,
          label: "Quarta-feira",
          date: wednesday,
          assignments: wedNoProgram ? [] : wedAssignments,
          important: wedImportant,
          noProgramming: wedNoProgram
        },
        {
          key: `s${weekNumber}`,
          label: "Sabado",
          date: saturday,
          assignments: satNoProgram ? [] : satAssignments,
          important: satImportant,
          noProgramming: satNoProgram
        }
      ]
    });
    rotationIndex += 1;
  });

  state.months[monthKey] = {
    monthKey,
    label: monthLabel(monthKey),
    generatedAt: new Date().toISOString(),
    status: failed ? "Com alerta" : "Gerada",
    previousAvoided: {
      indicators: [...avoidIndicators],
      microphones: [...avoidMics]
    },
    weeks
  };

  state.history = state.history.filter((item) => item.monthKey !== monthKey || item.origin === "Manual");
  weeks.forEach((week) => {
    week.meetings.forEach((meeting) => {
      meeting.assignments.forEach((item) => {
        state.history.push({
          id: crypto.randomUUID(),
          monthKey,
          date: meeting.date,
          week: week.number,
          privilege: item.role,
          position: item.position,
          name: item.name,
          origin: "Automatica",
          note: meeting.label,
          createdAt: new Date().toISOString()
        });
      });
    });
  });

  saveState();
  if (shouldRender) render();
}

function selectedMonth() {
  return state.months[state.selectedMonth] || null;
}

function monthByKey(monthKey) {
  return state.months[monthKey] || null;
}

function allMeetings(monthKey = state.selectedMonth) {
  const month = monthByKey(monthKey);
  return month ? month.weeks.flatMap((week) => week.meetings.map((meeting) => ({ ...meeting, week: week.number }))) : [];
}

function printMonthKeys() {
  return [state.selectedMonth, nextMonthKey(state.selectedMonth)];
}

function pick(meeting, role) {
  return meeting.assignments.find((item) => item.role === role)?.name || "";
}

function render() {
  renderAuth();
  renderStatus();
  renderWeeklyCards();
  renderAlerts();
  renderMonthPicker();
  renderMonthWeeks();
  renderScheduleTable();
  renderPrintPage();
  renderPeople();
  renderAbsences();
  renderImportantDates();
  renderHistory();
  renderAuthorizedUsers();
  renderAdmin();
  fillPersonSelects();
  applyAccessControl();
}

function renderAuth() {
  const gate = document.querySelector("#authGate");
  const user = currentAuthUser();
  if (!user) {
    gate.classList.add("is-visible");
    document.body.classList.add("is-locked");
    document.querySelector("#userBadge").textContent = "";
    return;
  }
  gate.classList.remove("is-visible");
  document.body.classList.remove("is-locked");
  document.querySelector("#userBadge").textContent = `${user.name} - ${user.role === "admin" ? "Admin" : "Visualizador"}`;
}

function applyAccessControl() {
  const user = currentAuthUser();
  if (!user) return;
  const admin = isAdmin();
  document.querySelectorAll("[data-admin-only='true']").forEach((item) => {
    item.hidden = !admin;
  });
  document.querySelector(".print-controls").hidden = !admin;

  if (!admin) {
    document.querySelectorAll(".nav-button").forEach((item) => item.classList.remove("is-active"));
    document.querySelectorAll(".view").forEach((item) => item.classList.remove("is-active"));
    document.querySelector('[data-view="print"]').classList.add("is-active");
    document.querySelector("#print").classList.add("is-active");
  }
}

function renderStatus() {
  const month = selectedMonth();
  document.querySelector("#statusText").textContent = month ? month.status : "Aguardando geracao";
  document.querySelector("#selectedMonthText").textContent = monthLabel(state.selectedMonth);
  const title = document.querySelector("#pageTitle");
  if (title) title.textContent = `Escala de ${monthLabel(state.selectedMonth)}`;
}

function renderWeeklyCards() {
  const root = document.querySelector("#weeklyCards");
  const month = selectedMonth();
  if (!month) {
    root.innerHTML = `<p class="hint">Clique em gerar para criar o mes selecionado.</p>`;
    return;
  }

  root.innerHTML = month.weeks.slice(0, 2).map((week) => `
    <article class="meeting-card">
      <h3>Semana ${week.number}</h3>
      <p class="hint">${formatDate(week.wednesday)} e ${formatDate(week.saturday)}</p>
      <div class="assignment"><span class="role">Anfitriao</span><strong>${pick(week.meetings[0], "Anfitriao")}</strong></div>
      <div class="assignment"><span class="role">Coanfitriao</span><strong>${pick(week.meetings[0], "Coanfitriao")}</strong></div>
      <div class="assignment"><span class="role">Indicadores</span><strong>${pick(week.meetings[0], "Indicador Entrada")}, ${pick(week.meetings[0], "Indicador Auditorio")}, ${pick(week.meetings[0], "Indicador Estacionamento")}</strong></div>
    </article>
  `).join("");
}

function renderAlerts() {
  const alerts = [];
  const month = selectedMonth();
  if (!month) alerts.push("O mes selecionado ainda nao foi gerado.");
  if (month) {
    month.weeks.forEach((week) => {
      week.meetings.forEach((meeting) => {
        const names = meeting.assignments.map((item) => item.name);
        const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
        if (duplicates.length) alerts.push(`${meeting.label} da semana ${week.number}: acumulo para ${[...new Set(duplicates)].join(", ")}.`);
      });
    });
    alerts.push(`${month.weeks.length} semana(s) geradas para ${month.label}.`);
    alerts.push("Clique em um mes na tela Escala para abrir as semanas.");
    if (month.previousAvoided?.indicators?.length || month.previousAvoided?.microphones?.length) {
      alerts.push("Este mes evita repetir servos/publicadores e volantes usados no mes anterior, quando houver outros disponiveis.");
    }
  }
  if (state.absences.length) alerts.push(`${state.absences.length} ausencia(s) cadastrada(s). Gere novamente para aplicar.`);
  document.querySelector("#alerts").innerHTML = alerts.map((alert) => `<li>${alert}</li>`).join("");
}

function renderMonthPicker() {
  const root = document.querySelector("#monthPicker");
  if (!root) return;
  const months = ["2026-06", "2026-07", "2026-08", "2026-09"];
  root.innerHTML = months.map((monthKey) => `
    <button class="month-tab ${state.selectedMonth === monthKey ? "is-active" : ""}" data-month="${monthKey}">
      ${monthLabel(monthKey)}
    </button>
  `).join("");
  document.querySelectorAll("[data-month]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMonth = button.dataset.month;
      saveState();
      render();
    });
  });
}

function renderMonthWeeks() {
  const root = document.querySelector("#monthWeeks");
  if (!root) return;
  const month = selectedMonth();
  if (!month) {
    root.innerHTML = `<p class="hint">Escolha um mes e clique em gerar.</p>`;
    return;
  }

  root.innerHTML = month.weeks.map((week, index) => `
    <details class="week-detail" ${index === 0 ? "open" : ""}>
      <summary>
        <strong>Semana ${week.number}</strong>
        <span>${formatDate(week.wednesday)} a ${formatDate(week.saturday)}</span>
      </summary>
      <div class="week-meetings">
        ${week.meetings.map((meeting) => `
          <article class="meeting-card">
            <h3>${meeting.label} - ${formatDate(meeting.date)}</h3>
            ${meeting.important ? `<p class="event-note">${importantLabel(meeting.important.type)}${meeting.noProgramming ? " - sem programacao" : ""}</p>` : ""}
            ${meeting.noProgramming ? `<div class="no-programming">Nao havera programacao nesta data.</div>` : ""}
            ${meeting.assignments.map((item) => `
              <div class="assignment">
                <span class="role">${item.role}</span>
                <strong>${item.name}</strong>
                <button class="edit-small" data-edit="${meeting.key}:${item.id}" title="Alterar">Edit</button>
              </div>
            `).join("")}
          </article>
        `).join("")}
      </div>
    </details>
  `).join("");

  document.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => openEdit(button.dataset.edit));
  });
}

function renderScheduleTable() {
  const table = document.querySelector("#scheduleTable");
  if (!table) return;
  const meetings = allMeetings();
  if (!meetings.length) {
    table.innerHTML = `<tbody><tr><td>Nenhuma escala gerada.</td></tr></tbody>`;
    return;
  }
  table.innerHTML = `<thead><tr>
    <th>Data</th><th>Dia</th><th>Anfitriao</th><th>Coanfitriao</th>
    <th>Entrada</th><th>Auditorio</th><th>Estacionamento</th><th>Volante 1</th><th>Volante 2</th><th>Semana</th><th>Observacao</th>
  </tr></thead><tbody>${meetings.map((meeting) => `<tr>
    <td>${formatDate(meeting.date)}</td>
    <td>${meeting.label}</td>
    <td>${meeting.noProgramming ? "Sem programacao" : pick(meeting, "Anfitriao")}</td>
    <td>${meeting.noProgramming ? "-" : pick(meeting, "Coanfitriao")}</td>
    <td>${meeting.noProgramming ? "-" : pick(meeting, "Indicador Entrada")}</td>
    <td>${meeting.noProgramming ? "-" : pick(meeting, "Indicador Auditorio")}</td>
    <td>${meeting.noProgramming ? "-" : pick(meeting, "Indicador Estacionamento")}</td>
    <td>${meeting.noProgramming ? "-" : pick(meeting, "Volante 1")}</td>
    <td>${meeting.noProgramming ? "-" : pick(meeting, "Volante 2")}</td>
    <td>${meeting.week}</td>
    <td>${meeting.important ? importantLabel(meeting.important.type) : ""}</td>
  </tr>`).join("")}</tbody>`;
}

function renderPrintPage() {
  const root = document.querySelector("#printSheet");
  if (!root) return;
  const keys = printMonthKeys();
  keys.forEach((monthKey) => {
    if (!state.months[monthKey]) generateMonth(monthKey, false);
  });
  const months = keys.map((monthKey) => monthByKey(monthKey)).filter(Boolean);
  if (!months.length) {
    root.innerHTML = `<p class="hint">Gere o mes selecionado para montar a programacao.</p>`;
    return;
  }
  const meetings = keys.flatMap((monthKey, monthIndex) => (
    allMeetings(monthKey).map((meeting, meetingIndex) => ({
      ...meeting,
      monthKey,
      isMonthBreak: monthIndex > 0 && meetingIndex === 0
    }))
  ));
  const printLabel = keys.map((monthKey) => monthNames[Number(monthKey.split("-")[1]) - 1]).join(" e ");
  const printYear = keys[0].split("-")[0];
  const imageStyle = state.printImage ? `style="background-image:url('${state.printImage}')"` : "";
  root.innerHTML = `
    <div class="print-header">
      <div class="jw-logo">JW<br><span>.ORG</span></div>
      <div class="print-title">
        <strong>CONGREGACAO VILA BRASIL</strong>
        <span>PROGRAMACAO SEMANAL (PRESENCIAL E ZOOM)</span>
        <small>ANFITRIAO, COANFITRIAO, INDICADORES E MICROFONES VOLANTES</small>
      </div>
    </div>
    <div class="print-hero">
      <div class="print-photo photo-left" ${imageStyle}></div>
      <div class="print-photo photo-right" ${imageStyle}></div>
      <div class="print-month">MES<br>${printLabel.toUpperCase()}<br>${printYear}</div>
    </div>
    <table class="print-table" id="printTable">
      <thead>
        <tr>
          <th>Data da<br>Reuniao<br>(2026)</th>
          <th>ANFITRIAO<br><small>PRESENCIAL E ZOOM</small></th>
          <th>COANFITRIAO<br><small>PRESENCIAL E ZOOM</small></th>
          <th>INDICADORES<br><small>ENTRADA, AUDITORIO E ESTACIONAMENTO</small></th>
          <th>MICROFONES<br><small>VOLANTES</small></th>
        </tr>
      </thead>
      <tbody>
        ${meetings.map((meeting, index) => `
          ${meeting.isMonthBreak ? `<tr><td colspan="5" class="month-divider">${monthLabel(meeting.monthKey)}</td></tr>` : ""}
          <tr class="${index % 2 === 0 ? "purple-row" : "black-row"} ${isSuperintendentVisit(meeting) ? "visit-row" : ""}">
            <td class="date-cell">${dayMonth(meeting.date)}${isSuperintendentVisit(meeting) ? `<br><small>Visita do superintendente</small>` : ""}</td>
            ${meeting.noProgramming ? `
              <td colspan="4" class="closed-cell">${importantLabel(meeting.important.type)} - NAO HAVERA PROGRAMACAO</td>
            ` : `
            <td>${pick(meeting, "Anfitriao")}</td>
            <td>${pick(meeting, "Coanfitriao")}</td>
            <td>
              <strong>(E)</strong>${pick(meeting, "Indicador Entrada")}<br>
              <strong>(A)</strong>${pick(meeting, "Indicador Auditorio")}<br>
              <strong>(Es)</strong>${pick(meeting, "Indicador Estacionamento")}
            </td>
            <td>${pick(meeting, "Volante 1")}<br>${pick(meeting, "Volante 2")}</td>
            `}
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderImportantDates() {
  const table = document.querySelector("#importantTable");
  if (!table) return;
  const dates = (state.importantDates || []).slice().sort((a, b) => (a.start || a.date).localeCompare(b.start || b.date));
  const rows = dates.map((item) => `<tr>
    <td>${formatDate(item.start || item.date)}</td>
    <td>${formatDate(item.end || item.date || item.start)}</td>
    <td>${importantLabel(item.type)}</td>
    <td>${hasNoProgramming(item.type) ? "Sem programacao" : "Com programacao"}</td>
    <td>${item.note || ""}</td>
    <td><button class="text-button danger" data-remove-important="${item.id}">Remover</button></td>
  </tr>`);
  table.innerHTML = `<thead><tr>
    <th>Inicio</th><th>Fim</th><th>Tipo</th><th>Regra</th><th>Observacao</th><th></th>
  </tr></thead><tbody>${rows.join("") || `<tr><td colspan="6">Nenhuma data cadastrada.</td></tr>`}</tbody>`;

  document.querySelectorAll("[data-remove-important]").forEach((button) => {
    button.addEventListener("click", () => {
      state.importantDates = (state.importantDates || []).filter((item) => item.id !== button.dataset.removeImportant);
      saveState();
      generateMonth(state.selectedMonth);
    });
  });
}

function renderPeople() {
  const rows = state.people
    .slice()
    .sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order)
    .map((person) => `<tr>
      <td>${person.category}</td>
      <td>${person.order}</td>
      <td>${person.name}</td>
      <td>${person.note || ""}</td>
      <td><button class="text-button" data-toggle="${person.id}">${person.active ? "Ativo" : "Inativo"}</button></td>
      <td><button class="text-button danger" data-remove-person="${person.id}">Remover</button></td>
    </tr>`);

  document.querySelector("#peopleTable").innerHTML = `<thead><tr>
    <th>Categoria</th><th>Ordem</th><th>Nome</th><th>Observacao</th><th>Status</th><th></th>
  </tr></thead><tbody>${rows.join("")}</tbody>`;

  document.querySelectorAll("[data-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const person = state.people.find((item) => item.id === button.dataset.toggle);
      person.active = !person.active;
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-remove-person]").forEach((button) => {
    button.addEventListener("click", () => {
      const person = state.people.find((item) => item.id === button.dataset.removePerson);
      if (!person) return;
      const confirmed = window.confirm(`Remover ${person.name} do cadastro?`);
      if (!confirmed) return;
      state.people = state.people.filter((item) => item.id !== person.id);
      saveState();
      render();
    });
  });
}

function renderAbsences() {
  const rows = state.absences.map((absence) => `<tr>
    <td>${absence.name}</td>
    <td>${formatDate(absence.start)}</td>
    <td>${formatDate(absence.end)}</td>
    <td>${absence.reason || ""}</td>
    <td><button class="text-button danger" data-remove-absence="${absence.id}">Remover</button></td>
  </tr>`);

  document.querySelector("#absenceTable").innerHTML = `<thead><tr>
    <th>Nome</th><th>Data inicial</th><th>Data final</th><th>Motivo</th><th></th>
  </tr></thead><tbody>${rows.join("") || `<tr><td colspan="5">Nenhuma ausencia cadastrada.</td></tr>`}</tbody>`;

  document.querySelectorAll("[data-remove-absence]").forEach((button) => {
    button.addEventListener("click", () => {
      state.absences = state.absences.filter((absence) => absence.id !== button.dataset.removeAbsence);
      saveState();
      render();
    });
  });
}

function renderHistory() {
  const rows = state.history.slice().reverse().map((item) => `<tr>
    <td>${formatDate(item.date)}</td>
    <td>${item.week}</td>
    <td>${item.privilege}</td>
    <td>${item.position}</td>
    <td>${item.name}</td>
    <td>${item.origin}</td>
    <td>${item.note || ""}</td>
  </tr>`);

  document.querySelector("#historyTable").innerHTML = `<thead><tr>
    <th>Data</th><th>Semana</th><th>Privilegio</th><th>Posicao</th><th>Nome</th><th>Origem</th><th>Observacao</th>
  </tr></thead><tbody>${rows.join("") || `<tr><td colspan="7">Nenhum historico ainda.</td></tr>`}</tbody>`;
}

function renderAdmin() {
  document.querySelector("#rulesList").innerHTML = rules.map((rule, index) => `
    <div class="rule">
      <strong>${index + 1}</strong>
      <span>${rule[0]}<br><small class="hint">${rule[1]}</small></span>
      <span class="pill">${rule[2]}</span>
    </div>
  `).join("");
  document.querySelector("#schemaBox").textContent = schema;
}

function renderAuthorizedUsers() {
  const table = document.querySelector("#usersTable");
  if (!table) return;
  const rows = (state.authUsers || []).map((user) => `<tr>
    <td>${user.name}</td>
    <td>${user.email}</td>
    <td>${user.role === "admin" ? "Administrador" : "Visualizador"}</td>
    <td><button class="text-button" data-toggle-user="${user.id}">${user.active ? "Ativo" : "Inativo"}</button></td>
    <td><button class="text-button danger" data-remove-user="${user.id}">Remover</button></td>
  </tr>`);

  table.innerHTML = `<thead><tr>
    <th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th></th>
  </tr></thead><tbody>${rows.join("") || `<tr><td colspan="5">Nenhum usuario autorizado.</td></tr>`}</tbody>`;

  document.querySelectorAll("[data-toggle-user]").forEach((button) => {
    button.addEventListener("click", () => {
      const user = state.authUsers.find((item) => item.id === button.dataset.toggleUser);
      if (!user) return;
      const activeAdmins = state.authUsers.filter((item) => item.role === "admin" && item.active);
      if (user.role === "admin" && user.active && activeAdmins.length === 1) {
        window.alert("Mantenha pelo menos um administrador ativo.");
        return;
      }
      user.active = !user.active;
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-remove-user]").forEach((button) => {
    button.addEventListener("click", () => {
      const user = state.authUsers.find((item) => item.id === button.dataset.removeUser);
      if (!user) return;
      const activeAdmins = state.authUsers.filter((item) => item.role === "admin" && item.active);
      if (user.role === "admin" && user.active && activeAdmins.length === 1) {
        window.alert("Mantenha pelo menos um administrador ativo.");
        return;
      }
      if (!window.confirm(`Remover acesso de ${user.name}?`)) return;
      state.authUsers = state.authUsers.filter((item) => item.id !== user.id);
      saveState();
      render();
    });
  });
}

function fillPersonSelects() {
  const options = state.people
    .filter((person) => person.active)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((person) => `<option value="${person.name}">${person.name}</option>`)
    .join("");
  document.querySelector("#absencePerson").innerHTML = options;
  document.querySelector("#editPerson").innerHTML = options;
}

function openEdit(value) {
  const [meetingKey, id] = value.split(":");
  const month = selectedMonth();
  const meeting = month.weeks.flatMap((week) => week.meetings).find((item) => item.key === meetingKey);
  const item = meeting.assignments.find((assignmentItem) => assignmentItem.id === id);
  document.querySelector("#editKey").value = value;
  document.querySelector("#editRole").value = `${meeting.label} - ${item.role}`;
  document.querySelector("#editPerson").value = item.name;
  document.querySelector("#editReason").value = "";
  document.querySelector("#editDialog").showModal();
}

function exportExcel() {
  const table = document.querySelector("#printTable") || document.querySelector("#scheduleTable");
  const blob = new Blob([`<html><meta charset="utf-8">${table.outerHTML}</html>`], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `programacao-${printMonthKeys().join("-")}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}

document.querySelectorAll(".nav-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-button").forEach((item) => item.classList.remove("is-active"));
    document.querySelectorAll(".view").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    document.querySelector(`#${button.dataset.view}`).classList.add("is-active");
  });
});

document.querySelector("#googleLoginBtn").addEventListener("click", signInWithGoogle);
document.querySelector("#localAdminBtn").addEventListener("click", () => {
  signInAs({ name: "Administrador local", email: "admin@local", role: "admin", provider: "local" });
});
document.querySelector("#logoutBtn").addEventListener("click", signOut);

document.querySelector("#generateBtn").addEventListener("click", () => generateMonth(state.selectedMonth));
document.querySelector("#printBtn").addEventListener("click", () => {
  document.querySelector('[data-view="print"]').click();
  setTimeout(() => window.print(), 100);
});
document.querySelector("#excelBtn").addEventListener("click", exportExcel);
document.querySelector("#resetBtn").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  state = structuredClone(initialState);
  generateMonth(state.selectedMonth);
});

document.querySelector("#personForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const category = document.querySelector("#personCategory").value;
  const name = document.querySelector("#personName").value.trim();
  const normalizedName = name.toLocaleLowerCase("pt-BR").replace(/\s+/g, " ");
  const alreadyExists = state.people.some((person) => (
    person.name.toLocaleLowerCase("pt-BR").replace(/\s+/g, " ") === normalizedName
  ));
  if (alreadyExists) {
    window.alert("Este nome ja existe no cadastro.");
    return;
  }
  const nextOrder = byCategory(category).length + 1;
  state.people.push({
    id: crypto.randomUUID(),
    category,
    order: nextOrder,
    name,
    note: document.querySelector("#personNote").value.trim(),
    active: true,
    createdAt: new Date().toISOString()
  });
  event.target.reset();
  saveState();
  render();
});

document.querySelector("#userForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#userName").value.trim();
  const email = normalizeEmail(document.querySelector("#userEmail").value);
  const role = document.querySelector("#userRole").value;
  const exists = (state.authUsers || []).some((user) => normalizeEmail(user.email) === email);
  if (exists) {
    window.alert("Este e-mail ja esta autorizado.");
    return;
  }
  state.authUsers.push({
    id: crypto.randomUUID(),
    name,
    email,
    role,
    active: true
  });
  event.target.reset();
  saveState();
  render();
});

document.querySelector("#absenceForm").addEventListener("submit", (event) => {
  event.preventDefault();
  state.absences.push({
    id: crypto.randomUUID(),
    name: document.querySelector("#absencePerson").value,
    start: document.querySelector("#absenceStart").value,
    end: document.querySelector("#absenceEnd").value,
    reason: document.querySelector("#absenceReason").value.trim()
  });
  event.target.reset();
  document.querySelector("#absenceStart").value = "2026-07-01";
  document.querySelector("#absenceEnd").value = "2026-07-04";
  saveState();
  render();
});

document.querySelector("#importantForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const start = document.querySelector("#importantStart").value;
  const end = document.querySelector("#importantEnd").value || start;
  state.importantDates = state.importantDates || [];
  state.importantDates.push({
    id: crypto.randomUUID(),
    date: start,
    start,
    end,
    type: document.querySelector("#importantType").value,
    note: document.querySelector("#importantNote").value.trim()
  });
  state.selectedMonth = start.slice(0, 7);
  event.target.reset();
  document.querySelector("#importantStart").value = "2026-07-01";
  document.querySelector("#importantEnd").value = "2026-07-01";
  saveState();
  generateMonth(state.selectedMonth);
});

document.querySelector("#printImage").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.printImage = reader.result;
    saveState();
    renderPrintPage();
  };
  reader.readAsDataURL(file);
});

document.querySelector("#editForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const [meetingKey, id] = document.querySelector("#editKey").value.split(":");
  const month = selectedMonth();
  const meeting = month.weeks.flatMap((week) => week.meetings).find((item) => item.key === meetingKey);
  const item = meeting.assignments.find((assignmentItem) => assignmentItem.id === id);
  const week = month.weeks.find((weekItem) => weekItem.meetings.some((weekMeeting) => weekMeeting.key === meetingKey));
  const previousName = item.name;
  item.name = document.querySelector("#editPerson").value;
  item.origin = "Manual";
  const reason = document.querySelector("#editReason").value.trim() || "Ajuste manual";

  state.manualChanges.push({
    id: crypto.randomUUID(),
    date: meeting.date,
    role: item.role,
    previousName,
    newName: item.name,
    reason,
    changedAt: new Date().toISOString()
  });

  state.history.push({
    id: crypto.randomUUID(),
    monthKey: state.selectedMonth,
    date: meeting.date,
    week: week.number,
    privilege: item.role,
    position: item.position,
    name: item.name,
    note: `${reason}. Antes: ${previousName}`,
    origin: "Manual",
    createdAt: new Date().toISOString()
  });

  saveState();
  document.querySelector("#editDialog").close();
  render();
});

document.querySelector("#cancelEdit").addEventListener("click", () => {
  document.querySelector("#editDialog").close();
});

if (!selectedMonth()) {
  generateMonth(state.selectedMonth);
} else {
  render();
}
