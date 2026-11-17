export class GameModel {
  constructor() {
    this.sprintData = null;
    this.currentDayIndex = 0;
    this.moral = 100;
    this.tasksDone = 0;
    this.totalTasks = 5;
    this.score = 0;
    this.history = [];
  }

  async loadData() {
    const response = await fetch('./eventos.json');
    if (!response.ok) {
      throw new Error('Não foi possível carregar o arquivo eventos.json.');
    }
    this.sprintData = await response.json();
    this.reset();
  }

  reset() {
    this.currentDayIndex = 0;
    this.moral = this.sprintData.moralInicial ?? 100;
    this.totalTasks = this.sprintData.tarefasIniciais ?? 5;
    this.tasksDone = 0;
    this.score = 0;
    this.history = [];
  }

  getCurrentDay() {
    return this.sprintData.dias[this.currentDayIndex];
  }

  getTotalDays() {
    return this.sprintData.dias.length;
  }

  processDecision(optionIndex) {
    const day = this.getCurrentDay();
    const option = day.opcoes[optionIndex];

    // Atualiza moral mantendo entre 0% e 100%
    this.moral = Math.max(0, Math.min(100, this.moral + option.impactoMoral));

    // Atualiza entregas e pontuação
    this.tasksDone = Math.min(this.totalTasks, this.tasksDone + option.tarefasConcluidas);
    this.score += option.pontos;

    // Registra histórico para a Sprint Review
    this.history.push({
      dia: day.dia,
      titulo: day.titulo,
      acertou: option.acertou,
      escolha: option.texto
    });

    return option;
  }

  nextDay() {
    this.currentDayIndex++;
  }

  isSprintFinished() {
    return this.currentDayIndex >= this.getTotalDays();
  }

  getFinalSummary() {
    const metaAtingida = this.tasksDone >= 4 && this.moral >= 50;
    return {
      sucesso: metaAtingida,
      score: this.score,
      moral: this.moral,
      tasksDone: this.tasksDone,
      totalTasks: this.totalTasks,
      history: this.history
    };
  }
}