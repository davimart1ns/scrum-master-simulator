export class GameView {
  constructor() {
    // Telas (Estados)
    this.screens = {
      menu: document.getElementById('screen-menu'),
      sprint: document.getElementById('screen-sprint'),
      result: document.getElementById('screen-result')
    };

    // Elementos do Menu
    this.menuGoal = document.getElementById('menu-sprint-goal');

    // Elementos do HUD
    this.hudDay = document.getElementById('hud-day');
    this.hudMoralText = document.getElementById('hud-moral-text');
    this.hudMoralBar = document.getElementById('hud-moral-bar');
    this.hudTasks = document.getElementById('hud-tasks');
    this.hudScore = document.getElementById('hud-score');

    // Quadro Kanban
    this.kanbanTodo = document.getElementById('kanban-todo');
    this.kanbanDoing = document.getElementById('kanban-doing');
    this.kanbanDone = document.getElementById('kanban-done');

    // Elementos do Evento Diário
    this.eventBadge = document.getElementById('event-day-badge');
    this.eventTitle = document.getElementById('event-title');
    this.eventDescription = document.getElementById('event-description');
    this.optionsContainer = document.getElementById('options-container');

    // Caixa de Feedback (Erros e Acertos)
    this.feedbackBox = document.getElementById('feedback-box');
    this.feedbackStatus = document.getElementById('feedback-status');
    this.feedbackDelta = document.getElementById('feedback-delta');
    this.feedbackText = document.getElementById('feedback-text');
    this.btnNextDay = document.getElementById('btn-next-day');

    // Elementos de Resultado
    this.resultTitle = document.getElementById('result-title');
    this.resultSubtitle = document.getElementById('result-subtitle');
    this.finalScore = document.getElementById('final-score');
    this.finalMoral = document.getElementById('final-moral');
    this.finalTasks = document.getElementById('final-tasks');
    this.resultHistory = document.getElementById('result-history');
  }

  showScreen(screenKey) {
    Object.values(this.screens).forEach((screen) => screen.classList.remove('active'));
    this.screens[screenKey].classList.add('active');
  }

  renderMenu(sprintGoal) {
    this.menuGoal.textContent = sprintGoal;
  }

  renderHUD(model) {
    const currentDayNumber = Math.min(model.currentDayIndex + 1, model.getTotalDays());
    this.hudDay.textContent = `Dia ${currentDayNumber} / ${model.getTotalDays()}`;
    this.hudMoralText.textContent = `${model.moral}%`;
    this.hudMoralBar.style.width = `${model.moral}%`;

    // Muda a cor da barra de moral conforme o estado da equipe
    if (model.moral >= 60) {
      this.hudMoralBar.style.backgroundColor = 'var(--success-green)';
    } else if (model.moral >= 35) {
      this.hudMoralBar.style.backgroundColor = '#f59e0b';
    } else {
      this.hudMoralBar.style.backgroundColor = 'var(--error-red)';
    }

    this.hudTasks.textContent = `${model.tasksDone} / ${model.totalTasks}`;
    this.hudScore.textContent = `${model.score} pts`;
  }

  renderKanban(totalTasks, tasksDone, isSprintOver = false) {
    this.kanbanTodo.innerHTML = '';
    this.kanbanDoing.innerHTML = '';
    this.kanbanDone.innerHTML = '';

    for (let i = 1; i <= totalTasks; i++) {
      const chip = document.createElement('span');
      chip.className = 'task-chip';
      chip.textContent = `US-0${i}`;

      if (i <= tasksDone) {
        chip.classList.add('done');
        this.kanbanDone.appendChild(chip);
      } else if (!isSprintOver && i === tasksDone + 1) {
        this.kanbanDoing.appendChild(chip);
      } else {
        this.kanbanTodo.appendChild(chip);
      }
    }
  }

  renderDay(dayData, onSelectOption) {
    this.eventBadge.textContent = `DIA ${dayData.dia} DE 5`;
    this.eventTitle.textContent = dayData.titulo;
    this.eventDescription.textContent = dayData.evento;

    // Esconde feedback da rodada anterior
    this.feedbackBox.classList.add('hidden');
    this.feedbackBox.classList.remove('correct', 'wrong');

    // Renderiza botões das opções
    this.optionsContainer.innerHTML = '';
    dayData.opcoes.forEach((opcao, index) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opcao.texto;
      btn.addEventListener('click', () => onSelectOption(index));
      this.optionsContainer.appendChild(btn);
    });
  }

  renderFeedback(option, selectedIndex, isLastDay) {
    const buttons = this.optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === selectedIndex) {
        btn.classList.add(option.acertou ? 'selected-correct' : 'selected-wrong');
      }
    });

    const sinalMoral = option.impactoMoral >= 0 ? `+${option.impactoMoral}%` : `${option.impactoMoral}%`;
    this.feedbackStatus.textContent = option.acertou ? '✅ DECISÃO ALINHADA AO SCRUM' : '❌ VIOLAÇÃO DE BOAS PRÁTICAS';
    this.feedbackDelta.textContent = `+${option.pontos} pts | Moral ${sinalMoral}`;
    this.feedbackText.textContent = option.feedback;

    this.feedbackBox.classList.remove('hidden');
    this.feedbackBox.classList.add(option.acertou ? 'correct' : 'wrong');

    this.btnNextDay.textContent = isLastDay
      ? 'Encerrar Sprint e Ver Resultado →'
      : 'Avançar para o Próximo Dia →';
  }

  renderResult(summary) {
    if (summary.sucesso) {
      this.resultTitle.textContent = '🎉 Sprint Bem-Sucedida!';
      this.resultSubtitle.textContent =
        'Excelente facilitação! Você protegeu a equipe, manteve a moral saudável e entregou o incremento com qualidade.';
    } else {
      this.resultTitle.textContent = '⚠️ Sprint Comprometida';
      this.resultSubtitle.textContent =
        'A Sprint enfrentou problemas de escopo, impedimentos ou desgaste da equipe. Revise os pontos na Retrospectiva!';
    }

    this.finalScore.textContent = `${summary.score} pts`;
    this.finalMoral.textContent = `${summary.moral}%`;
    this.finalTasks.textContent = `${summary.tasksDone} / ${summary.totalTasks}`;

    this.resultHistory.innerHTML = '';
    summary.history.forEach((item) => {
      const li = document.createElement('li');
      li.className = item.acertou ? 'ok' : 'fail';
      li.innerHTML = `<strong>${item.titulo}:</strong> ${item.acertou ? 'Acerto' : 'Erro'} — ${item.escolha}`;
      this.resultHistory.appendChild(li);
    });
  }
}