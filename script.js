//GLOBALNE ZMIENNE
let lives = 3;
let score = 0;
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const timerDisplay = document.getElementById('timer');
let intervalID = null;
let countdownID = null;
let timeLeft = 60;
let spawnRate = 2000;
let circleLifetime = 3000;
let selectedLevel = 'easy';
let playerName = 'Player';

//Odświeżenie tabeli highscore
window.addEventListener('load', () => {
  updateHighscoresTable();
});

//Funkcja: Ustawienie poziomu trudnosci
function setDifficulty(level) {
  switch(level) {
    case 'easy':
      spawnRate = 2000;
      circleLifetime = 2000;
      break;
    case 'medium':
      spawnRate = 1000;
      circleLifetime = 1000;
      break;
    case 'hard':
      spawnRate = 800;
      circleLifetime = 800;
      break;
    default:
      spawnRate = 2000;
      circleLifetime = 2000;
  }
  console.log('Difficulty set to: ', level);
}

//Funkcje aktualizujace wynik w HUD.
function updateScore() {
  console.log('Score: '+ score);
  scoreDisplay.textContent = 'Score: '+ score;
}

function updateLives() {
  console.log('Lives: '+ lives)
  livesDisplay.textContent = 'Lives: '+ lives;
}

function updateTimer() {
  timerDisplay.textContent = 'Time: '+ timeLeft;
}


//nieogarniam funkcja zapisujace highscore
function saveHighscore(playerName, score, timeLeft, lives,selectedLevel) {
  let highscores = JSON.parse(localStorage.getItem('highscores')) || [];

  highscores.push({playerName, score, timeLeft, lives,selectedLevel});

  //sortowanie malejaco top5
  highscores.sort((a,b) => b.score - a.score);
  highscores = highscores.slice(0,5);

  localStorage.setItem('highscores', JSON.stringify(highscores));
  updateHighscoresTable();
}

//nieogarniam funkcja aktualizujaca tabele
function updateHighscoresTable() {
  const tbody = document.querySelector('#highscores-table tbody');
  tbody.innerHTML = '';

  const highscores = JSON.parse(localStorage.getItem('highscores')) || [];

  highscores.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${item.playerName}</td><td>${item.score}</td><td>${item.timeLeft}</td><td>${item.lives}</td>`;
    tbody.appendChild(tr);
  });
}

//Funkcja: kończąca gre
function endGame() {
  clearInterval(intervalID);
  clearInterval(countdownID);
  document.getElementById('game-board').removeEventListener('click', punktacja);
  document.getElementById('game-board').innerHTML = '';
  console.log('Game ended...');

  document.getElementById('game-screen').style.display ='none';
  const endScreen = document.getElementById('end-screen');
  endScreen.style.display = 'block';

  document.getElementById('final-score').textContent = 'Score: ' + score;
  document.getElementById('final-lives').textContent = 'Lives left: ' + lives;
  document.getElementById('final-time').textContent = 'Time left: ' + timeLeft + 's';

  saveHighscore(playerName, score, timeLeft, lives, selectedLevel);
}

//Obsługa Punktacji, obsluga klikania
function punktacja(event) {
  if (event.target.classList.contains('circle')) {
    score++;
    updateScore();
    console.log('HIT!')
  }
  else {
    lives--;
    updateLives();
    console.log('MISS!');
    if (lives === 0) {
      endGame();
      console.log('You Lost! Because of bad vision... Your Score: ' + score);
    }
  }
}

//Utworzenie kółka, zmiana wyglądu, funkcjonalność kółka(znikanie)
function createCircle() {

  //Dodanie Kółka
  const circle = document.createElement('div');
  circle.classList.add('circle');
  const gameArea = document.getElementById('game-board');
  gameArea.appendChild(circle);

  //Wyglad kółka
  circle.style.backgroundColor = 'lightblue';
  circle.style.width = '50px';
  circle.style.height = '50px';
  circle.style.borderRadius = '50%';
  circle.style.position =  'absolute';
  const randomX = Math.random() * (gameArea.clientWidth - 50);
  const randomY = Math.random() * (gameArea.clientHeight - 50);
  circle.style.left = randomX + 'px';
  circle.style.top = randomY + 'px';

  //znikanie, znikanie po kliknieciu
  function handleCircleClick() {
    circle.classList.add('pop');
    circle.addEventListener('animationend', () => {
      circle.remove();
    });
    circle.removeEventListener('click', handleCircleClick);
  }

  //LISTENER KÓŁKA
  circle.addEventListener('click', handleCircleClick);

  //ZNIKANIE KÓŁKA BEZ KLIKNIĘCIA
  setTimeout(() => {
    if (circle.parentElement) {
      handleCircleClick();
      lives--;
      updateLives();
      console.log('Bad reflex! -1 Live!');

      if (lives === 0) {
        endGame();
        console.log('You lost! Because of bad reflex... Your Score: ' + score);
      }
    }
  }, circleLifetime);

}

//Tworzenie kółek co (zalezne od poziomu trudnosci) sekund.
function circleSpawner() {
    intervalID = setInterval(() => {
      createCircle();
    }, spawnRate);
    console.log('Circle spawner turned on!');
}

//Resetuje stan gry
function resetGameState() {
  lives = 3;
  score = 0;
  updateLives();
  updateScore();
  console.log("Game reseted!");
}

//Włączenie punktacji
function enableScoring() {
  document.getElementById('game-board').addEventListener('click', punktacja);
  console.log('Scoring enabled!');
}

//Zegar i zakonczenie gry po minucie
function startTimer() {
  timeLeft = 60;
  updateTimer();
  console.log('Timer Started!');
  countdownID = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      endGame();
      console.log('End of the game! Your Score: ' + score);
    }
  }, 1000);
}

//Przycisk start, przenosi do gry i ją zaczyna.
document.getElementById('start-button').addEventListener('click',() => {
  const nameInput = document.getElementById('player-name-input').value.trim();
  playerName = nameInput !== '' ? nameInput : 'Player';
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  startGame();
});

//Rozpoczecie gry: wyzerowanie liczników, włączenie zegara, włączenie generowania kółek, włączenie punktacji.
function startGame() {
  selectedLevel = document.getElementById('difficulty').value;
  setDifficulty(selectedLevel);
  resetGameState();
  startTimer();
  circleSpawner();
  enableScoring();
  console.log("Game started!");
}

//Przycisk restart, przenosi do menu startowego.
document.getElementById('restart-button').addEventListener('click', () => {
  document.getElementById('end-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'flex';
  updateHighscoresTable();
});
