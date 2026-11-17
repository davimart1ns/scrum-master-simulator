import { GameModel } from './model.js';
import { GameView } from './view.js';

// ==========================================
// PADRÃO DE PROJETO: STATE PATTERN
// ==========================================

class MenuState {
  constructor(controller) {
    this.controller = controller;
  }

  enter() {
    this.controller.model.reset();
    this.controller.view.renderMenu(this.controller.model.sprintData.sprintGoal);
    this.controller.view.showScreen('menu');
  }
}

class SprintState {
  constructor(controller) {
    this.controller = controller;
  }

  enter() {
    this.controller.view.showScreen('sprint');
    this.loadCurrentDay();
  }

  loadCurrentDay() {
    const { model, view } = this.controller;
    const dayData = model.getCurrentDay();

    view.renderHUD(model);
    view.renderKanban(model.totalTasks, model.tasksDone, false);
    view.renderDay(dayData, (optionIndex) => this.handleDecision(optionIndex));
  }

  handleDecision(optionIndex) {
    const { model, view } = this.controller;
    const chosenOption = model.processDecision(optionIndex);
    const isLastDay = model.currentDayIndex === model.getTotalDays() - 1;

    view.renderHUD(model);
    view.renderKanban(model.totalTasks, model.tasksDone, isLastDay);
    view.renderFeedback(chosenOption, optionIndex, isLastDay);
  }

  advance() {
    const { model } = this.controller;
    model.nextDay();

    if (model.isSprintFinished()) {
      this.controller.setState('result');
    } else {
      this.loadCurrentDay();
    }
  }
}

class ResultState {
  constructor(controller) {
    this.controller = controller;
  }

  enter() {
    const summary = this.controller.model.getFinalSummary();
    this.controller.view.renderResult(summary);
    this.controller.view.showScreen('result');
  }
}

// ==========================================
// CONTROLLER PRINCIPAL (MVC)
// ==========================================

class GameController {
  constructor() {
    this.model = new GameModel();
    this.view = new GameView();

    this.states = {
      menu: new MenuState(this),
      sprint: new SprintState(this),
      result: new ResultState(this)
    };

    this.currentState = null;
    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('btn-start').addEventListener('click', () => {
      this.setState('sprint');
    });

    document.getElementById('btn-next-day').addEventListener('click', () => {
      if (this.currentState instanceof SprintState) {
        this.currentState.advance();
      }
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
      this.setState('menu');
    });
  }

  setState(stateName) {
    this.currentState = this.states[stateName];
    this.currentState.enter();
  }

  async init() {
    try {
      await this.model.loadData();
      this.setState('menu');
    } catch (error) {
      alert(
        'Erro ao carregar os dados do jogo. Abra o projeto usando um servidor local (ex: extensão Live Server no VS Code) em vez de clicar diretamente no arquivo HTML.'
      );
      console.error(error);
    }
  }
}

// Inicializa o jogo
const app = new GameController();
app.init();