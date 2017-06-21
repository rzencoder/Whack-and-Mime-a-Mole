'use strict';

/*Whack-a-Mole/Simon 2 in 1 game.
  I thought I'd try to combine the final FCC project with the final tutorial from 30 days of Javascript by Wes Bos in vanilla Javascript.
  Most of the code for the Whack-a-Mole game is from the tutorial. I've modified it by storing it in an object to keep it separate from the simon game, adding difficultly levels, high scores and different styling.*/

document.addEventListener("DOMContentLoaded", function () {

  var intro = document.querySelector('.intro');
  var message = document.querySelector('.message');
  var messageWhack = document.querySelector('.message-whack');
  var choiceWhack = document.querySelector('.choice-whack');
  var choiceMime = document.querySelector('.choice-mime');
  var game = document.querySelector('.game');
  var holes = document.querySelectorAll('.hole');
  var moles = document.querySelectorAll('.mole');

  /*HELPER FUNCTIONS*/

  //Had to add as Edge browser doesn't have the forEach method on the nodeList object 
  NodeList.prototype.forEach = Array.prototype.forEach;

  function hide(element) {
    element.style.display = "none";
  }

  function show(element) {
    element.style.display = "";
  }

  /*************************
   ******MIME A MOLE*********
   *************************/

  var highStreak = document.querySelector('.high-streak');
  var currentStreak = document.querySelector('.current-streak');
  var strictMode = document.querySelector('.strict-mode');
  var normalMode = document.querySelector('.normal-mode');
  var mimeMenu = document.querySelector('.mime-menu');
  var mimeStartButton = document.querySelector('.mime-start');
  var mimeResetButton = document.querySelector('.mime-reset');
  var mimeSettings = document.querySelector('.mime-settings');
  var mimeInfo = document.querySelector('.mime-info');
  var mimeReset = document.querySelector('.mime-reset');

  /*Menu Screens etc*/

  function handleMode() {
    if (this.className === "strict-mode") {
      mime.strict = true;
    } else {
      mime.strict = false;
    }
    hide(mimeSettings);
    holes.forEach(function (hole) {
      return hole.classList.add("active");
    });
    game.classList.add("active");
    show(mimeInfo);
    holes.forEach(function (hole) {
      return hole.classList.add('avoid-clicks');
    });
    hide(mimeResetButton);
    show(mimeStartButton);
  }

  function toggleButtons() {
    if (!mime.playFinished) {
      holes.forEach(function (hole) {
        return hole.classList.add('avoid-clicks');
      });
    } else {
      holes.forEach(function (hole) {
        return hole.classList.remove('avoid-clicks');
      });
    }
  }

  function mimeMenuHandler() {
    hide(mimeInfo);
    hide(mode);
    hide(message);
    mimeResetGame();
    mime.high = 0;
    highStreak.textContent = 0;
    holes.forEach(function (hole) {
      return hole.classList.remove("active", "avoid-clicks");
    });
    holes.forEach(function (hole) {
      return hole.removeEventListener('click', playerClick);
    });
    holes.forEach(function (mole) {
      return mole.classList.remove('up');
    });
    game.classList.remove("active");
    show(intro);
    startAnimation();
  }

  function mimeStartGame() {
    show(mimeResetButton);
    hide(mimeStartButton);
    hide(message);
    holes.forEach(function (hole) {
      return hole.addEventListener('click', playerClick);
    });
    addToSequence();
  }

  function mimeResetGame() {
    hide(mimeResetButton);
    show(mimeStartButton);
    mime.sequence = [];
    mime.playerSequence = [];
    mime.playFinished = false;
    mime.holeNumber = 0;
    mime.count = 0;
    mime.streak = 0;
    currentStreak.textContent = mime.streak;
  }

  /*Sounds*/

  /*Error Sound from https://freesound.org/people/original_sound/sounds/366103*/
  var errorSound = document.querySelector(".error-sound");
  var sound1 = document.querySelector(".sound1");
  var sound2 = document.querySelector(".sound2");
  var sound3 = document.querySelector(".sound3");
  var sound4 = document.querySelector(".sound4");
  var soundArray = [sound1, sound2, sound3, sound4];

  /*Gameplay*/
  var mime = {
    strict: false,
    sequence: [],
    playerSequence: [],
    playFinished: false,
    holeNumber: 0,
    count: 0,
    streak: 0,
    high: 0,
    speed: 600
  };

  function addToSequence() {
    if (mime.sequence.length > 19) {
      show(message);
      message.textContent = 'You Win!';
      mimeResetGame();
      return;
    }
    var random = Math.floor(Math.random() * 4);
    mime.sequence.push(random);
    mime.streak++;
    currentStreak.textContent = mime.streak;
    if (mime.streak >= mime.high) {
      mime.high = mime.streak;
      highStreak.textContent = mime.high;
    }
    playSequence();
  }

  function playerClick() {
    if (mime.playFinished) {
      mime.holeNumber = parseInt(this.dataset.key);
      mime.playerSequence.push(mime.holeNumber);
      if (mime.holeNumber !== mime.sequence[mime.count]) {
        if (mime.strict) {
          error();
          mimeResetGame();
          show(message);
          message.textContent = 'Game Over';
          return;
        } else {
          mime.playerSequence = [];
          error();
          mime.count = 0;
          return;
        }
      }
      holes[mime.holeNumber].classList.add('light');
      holes[mime.holeNumber].classList.add('up');
      soundArray[mime.holeNumber].play();
      (function () {
        setTimeout(function () {
          holes[mime.holeNumber].classList.remove('light');
          holes[mime.holeNumber].classList.remove('up');
        }, mime.speed);
      })();
      if (mime.count >= mime.sequence.length - 1) {
        if (mime.sequence.length < 19) {
          show(message);
          message.textContent = 'Next Round';
        }
        setTimeout(function () {
          hide(message);
          mime.playerSequence = [];
          mime.count = 0;
          addToSequence();
          return;
        }, 2000);
      }
      mime.count++;
    }
  }

  function playSequence() {
    mime.playFinished = false;
    toggleButtons();

    var _loop = function _loop(i) {
      setTimeout(function () {
        if (mime.sequence.length === 0) {
          return;
        }
        holes[mime.sequence[i]].classList.add('light');
        holes[mime.sequence[i]].classList.add('up');
        soundArray[mime.sequence[i]].play();
        (function () {
          setTimeout(function () {
            if (mime.sequence.length === 0) {
              return;
            }
            holes[mime.sequence[i]].classList.remove('light');
            holes[mime.sequence[i]].classList.remove('up');
          }, mime.speed);
        })(i);
      }, i * (mime.speed * 2));
    };

    for (var i = 0; i < mime.sequence.length; i++) {
      _loop(i);
    }
    setTimeout(function () {
      mime.playFinished = true;
      toggleButtons();
    }, mime.sequence.length * (mime.speed * 2));
  }

  function error() {
    holes.forEach(function (hole) {
      return hole.classList.add('light', 'up');
    });
    errorSound.play();
    setTimeout(function () {
      holes.forEach(function (hole) {
        return hole.classList.remove('light', 'up');
      });
      if (!mime.strict) {
        message.textContent = 'Try Again';
        show(message);
        setTimeout(function () {
          hide(message);
          playSequence();
        }, mime.speed * 2);
      }
    }, mime.speed * 2.5);
  }

  /*Event Listeners*/
  mimeStartButton.addEventListener('click', mimeStartGame);
  mimeResetButton.addEventListener('click', mimeResetGame);
  strictMode.addEventListener('click', handleMode);
  normalMode.addEventListener('click', handleMode);
  mimeMenu.addEventListener('click', mimeMenuHandler);

  /*************************
   ******WHACK-A-MOLE********
   *************************/

  var modeOptions = document.querySelectorAll('.mode-options > p');
  var currentScore = document.querySelector('.current-score');
  var highScore = document.querySelector('.high-score');
  var whackStartButton = document.querySelector('.whack-start');
  var whackMenu = document.querySelector('.whack-menu');
  var mode = document.querySelector('.mode');
  var whackInfo = document.querySelector('.whack-info');

  /*Menu and Settings*/

  function modeSelectionHandler() {
    whack.modeSelection(this);
    show(whackInfo);
    hide(mode);
  }

  function menuHandler() {
    hide(whackInfo);
    whack.high = 0;
    whack.score = 0;
    hide(messageWhack);
    currentScore.textContent = whack.score;
    highScore.textContent = whack.high;
    moles.forEach(function (mole) {
      return mole.removeEventListener('click', whack.hit);
    });
    moles.forEach(function (mole) {
      return mole.classList.remove('up');
    });
    show(intro);
    startAnimation();
  }

  /*Gameplay*/

  var whack = {
    lastHole: null,
    timeUp: false,
    score: 0,
    high: 0,
    minPeep: 200,
    maxPeep: 1000,

    randomTime: function randomTime(min, max) {
      return Math.round(Math.random() * (max - min) + min);
    },

    randomHole: function randomHole(holes) {
      var idx = Math.floor(Math.random() * holes.length);
      var hole = holes[idx];
      if (hole === this.lastHole) {
        return this.randomHole(holes);
      }
      this.lastHole = hole;
      return hole;
    },

    peep: function peep() {
      var time = this.randomTime(whack.minPeep, whack.maxPeep);
      var hole = this.randomHole(holes);
      hole.classList.add('up');
      setTimeout(function () {
        hole.classList.remove('up');
        if (!whack.timeUp) {
          whack.peep();
        }
      }, time);
    },

    startGame: function startGame(length) {
      hide(messageWhack);
      moles.forEach(function (mole) {
        return mole.addEventListener('click', whack.hit);
      });
      currentScore.textContent = 0;
      whack.timeUp = false;
      whackStartButton.classList.add('avoid-clicks');
      whack.score = 0;
      whack.peep();
      setTimeout(function () {
        whack.timeUp = true;
        whackStartButton.classList.remove('avoid-clicks');

        setTimeout(function () {
          messageWhack.textContent = 'You Scored: ' + whack.score;
          show(messageWhack);
        }, 500);
      }, length);
    },

    hit: function hit(e) {
      if (!e.isTrusted) return;
      whack.score++;
      if (whack.score >= whack.high) {
        whack.high = whack.score;
      }
      this.parentElement.classList.remove('up');
      currentScore.textContent = whack.score;
      highScore.textContent = whack.high;
    },

    modeSelection: function modeSelection(e) {
      var option = e.className;
      if (option === 'easy') {
        whack.minPeep = 1000;
        whack.maxPeep = 2000;
      }
      if (option === 'medium') {
        whack.minPeep = 200;
        whack.maxPeep = 1000;
      }
      if (option === 'hard') {
        whack.minPeep = 100;
        whack.maxPeep = 400;
      }
    }
  };

  /*Event Listeners*/
  modeOptions.forEach(function (option) {
    return option.addEventListener('click', modeSelectionHandler);
  });
  whackStartButton.addEventListener('click', function () {
    return whack.startGame(10000);
  });
  whackMenu.addEventListener('click', menuHandler);

  /**********************/

  /*START MENU*/

  function startAnimation() {
    whack.timeUp = true;
    whack.timeUp = false;
    whack.peep();
  }

  function init() {
    hide(whackInfo);
    hide(mode);
    hide(mimeSettings);
    hide(mimeInfo);
    hide(mimeReset);
    hide(message);
    hide(messageWhack);
    startAnimation();
  }

  //Start Whack a mole game
  function whackStart() {
    whack.timeUp = true;
    hide(intro);
    show(mode);
  }

  //Start Mime a mole game
  function mimeStart() {
    whack.timeUp = true;
    hide(intro);
    show(mimeSettings);
  }

  //Event Listeners
  choiceWhack.addEventListener('click', whackStart);
  choiceMime.addEventListener('click', mimeStart);

  init();
});