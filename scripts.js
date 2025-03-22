const gameContainer = () => {
    let timer;
    let TIME_COUNT = 5;

    let bgAudio;

    let DISABLE_KEYS = false;

    const sfxDelay = (variable, duration = 800) => {
        setTimeout(() => {
            variable.play();
        }, duration);
    }

    const swooshSFX = (duration = 100) => {
        const audio = new Audio("/assets/audio/sfx/swoosh.mp3");

        setTimeout(() => {
            audio.play();
        }, duration);
    }

    const backgroundMusic = () => {
        bgAudio = new Audio("/assets/audio/music/puzzle_music.mp3");
        bgAudio.volume = 0.35;
        bgAudio.play();
        bgAudio.loop = true;
    }

    const initTimer = () => {
        timer = setInterval(() => {
            TIME_COUNT--;
            document.getElementById("gameTimer").firstElementChild.textContent = TIME_COUNT;

            if([3, 2, 1].includes(TIME_COUNT)) {
                const timeSFX = new Audio("/assets/audio/sfx/timer_feedback/timer_beep.mp3");
                timeSFX.play();
                timeSFX.volume = 0.2;
                document.getElementById("gameTimer").firstElementChild.style.color = "#EF233C";
            }

            if(TIME_COUNT <= 0) {
                clearInterval(timer);
                timesUpEffect();
            }
        }, 1000);
    }

    initTimer();

    const resetTimerToDefault = () => {
        clearInterval(timer); 
        TIME_COUNT = 5;
        initTimer();
    }

    const resetTimerFromCurrent = () => {
        setTimeout(() => {
            initTimer();
        }, 1200);
    }

    const initGame = (array, index) => {
        let GAME_CONTENT = "";

        array[index].selection.forEach((word) => {
            GAME_CONTENT += `
                <div class="gameCard">${word}</div>
            `;
        });

        document.getElementById("gameHeader").innerHTML = `
            <div>
                <strong>Flashcards</strong>
                <p>Match the word to its meaning in Te Reo Māori</p>
            </div>
            <div id="gameTimer">
                <strong>5</strong>
            </div>
            <div>
                <p>${array[index].level}</p>
            </div>
        `;

        document.getElementById("gameQuestion").innerHTML = `<p>${array[index].question}</p>`;
        document.getElementById("gameContent").innerHTML = GAME_CONTENT;
    };

    const updateLevel = (array, index) => {
        resetTimerToDefault();
        if (index < array.length) {
            initGame(array, index);
        } else {
            DISABLE_KEYS = true;

            clearInterval(timer);
            bgAudio.pause();

            const completionSFX = new Audio("/assets/audio/sfx/game_feedback/victory.mp3");
            let GAME_COMPLETION = `
                <div class="gameCompletion">
                    <h2>Congratulations!</h2>
                    <p>All levels have been completed!</p>
                    <div>
                        <button type="button">Replay</button>
                    </div>
                </div>
            `;

            sfxDelay(completionSFX, 600);
            swooshSFX(undefined);
            document.getElementById("root").insertAdjacentHTML("afterend", GAME_COMPLETION);
            document.getElementsByClassName("gameCompletion")[0].lastElementChild.addEventListener("click", (event) => {
                if(event.target.tagName === "BUTTON") {
                    window.location.reload();
                }
            });
        }
    };

    const pauseMenu = () => {
        let KEY_CHECK = true;
    
        document.addEventListener("keydown", (event) => {
            if (DISABLE_KEYS) {
                event.preventDefault(); 
                return; 
            }
    
            let PAUSE_MENU = `
                <div class="paused">
                    <h2>PAUSED</h2>
                    <div>
                        <button type="button">Resume</button>
                        <button type="button">Exit</button>
                    </div>
                </div>
            `;
    
            if (event.key === "Escape" && KEY_CHECK === true) {
                clearInterval(timer);
                KEY_CHECK = false;
                document.getElementById("root").insertAdjacentHTML("afterend", PAUSE_MENU);
                event.preventDefault();
            } else if (event.key === "Escape" && KEY_CHECK === false) {
                KEY_CHECK = true;
                document.getElementsByClassName("paused")[0].remove();
                initTimer();
            }
    
            if (document.getElementsByClassName("paused")[0]) {
                document.getElementsByClassName("paused")[0].lastElementChild.addEventListener("click", (event) => {
                    if (event.target.textContent === "Resume") {
                        KEY_CHECK = true;
                        document.getElementsByClassName("paused")[0].remove();
                        initTimer();
                    }else if(event.target.textContent === "Exit") {
                        window.location.reload();
                    }
                });
            }
        });
    };
    
    pauseMenu();

    const timesUpEffect = () => {
        DISABLE_KEYS = true;
        bgAudio.pause();
    
        const timesUpSFX = new Audio("/assets/audio/sfx/timer_feedback/times_up_02.mp3");
        let TIMES_UP = `
            <div class="timesUp">
                <h2>TIMES UP!</h2>
                <div>
                    <button type="button">Main Menu</button>
                </div>
            `;
    
        timesUpSFX.play();
    
        document.getElementById("root").insertAdjacentHTML("afterend", TIMES_UP);
        document.getElementsByClassName("timesUp")[0].lastElementChild.addEventListener("click", (event) => {
            if (event.target.tagName === "BUTTON") {
                window.location.reload();
            }
        }, false);
    };

    const successEffect = () => {
        const successSFX = new Audio("/assets/audio/sfx/answers_feedback/correct_answer.mp3");
        
        let SUCCESS_EFFECT = `
            <div class="success">
                <h2>Correct!</h2>
            </div>
        `;

        sfxDelay(successSFX, 600);
        swooshSFX(undefined);
        document.getElementById("root").insertAdjacentHTML("afterend", SUCCESS_EFFECT);

        setTimeout(() => {
            document.getElementsByClassName("success")[0].remove();
        }, 2000);
    };

    const failureEffect = () => {
        const failureSFX = new Audio("/assets/audio/sfx/answers_feedback/wrong_answer.mp3");
        let FAIL_EFFECT = `
            <div class="failure">
                <h2>Incorrect!</h2>
            </div>
        `;

        sfxDelay(failureSFX, 600);
        swooshSFX(undefined);

        document.getElementById("root").insertAdjacentHTML("afterend", FAIL_EFFECT);

        setTimeout(() => {
            document.getElementsByClassName("failure")[0].remove();
        }, 2000);
    };

    // Game Event Handling
    const gameEventHandling = (array, index) => {
        document.getElementById("gameContent").addEventListener("click", (event) => {
            if(event.target.tagName === "DIV") {
                if(event.target.textContent === array[index].answer) {
                    clearInterval(timer);
                    successEffect();
                    setTimeout(() => {
                        index++;
                        updateLevel(array, index);
                    }, 2500);
                }else {
                    clearInterval(timer);
                    failureEffect();
                    resetTimerFromCurrent();
                }
            }
        }, false);
    }

    const loadGameComponents = () => {
        const xhr = new XMLHttpRequest();

        xhr.onload = function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                const data = response.data || [];

                let GAME_LEVEL = 0;

                initGame(data, GAME_LEVEL);
                gameEventHandling(data, GAME_LEVEL);
                backgroundMusic();
            }
        };

        xhr.open("GET", "/components/data.json", true);
        xhr.send();
    };

    loadGameComponents();
};

const gameStartMenu = () => {
    const startMenuBtns = document.getElementsByClassName("startMenu")[0].querySelector("div");

    startMenuBtns.addEventListener("click", (event) => {
        if(event.target.textContent === "How to Play") {
            let MODAL_WINDOW = `
                <div id="modal">
                    <h2>How to Play</h2>
                    <div>
                        <ol>
                            <li>
                                <strong>Objective:</strong>
                                <ul>
                                    <li>Match the provided English word to its correct meaning in Te Reo Māori before the timer runs out.</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Getting Started:</strong>
                                <ul>
                                    <li>Select a card from the options displayed on your screen.</li>
                                    <li>Each level presents a new question and set of options to choose from.</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Gameplay:</strong>
                                <ul>
                                    <li>You have <strong>5 seconds</strong> to make your selection for each question.</li>
                                    <li>As the timer counts down, you'll hear sound effects to alert you when time is running low.</li>
                                    <li>If you match the word correctly, you'll advance to the next level.</li>
                                    <li>Incorrect matches or running out of time will result in a "Time's Up!" or "Incorrect!" notification.</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Special Features:</strong>
                                <ul>
                                    <li><strong>Pause Menu:</strong> Press the <code>Escape</code> key to pause the game and take a break.</li>
                                    <li>
                                        <strong>Audio Feedback:</strong> Enjoy background music and sound effects, including beeps for the timer and effects for correct
                                        or incorrect answers.
                                    </li>
                                    <li><strong>Replay Option:</strong> If the timer runs out, you'll be given the option to replay and try again.</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Winning the Game:</strong>
                                Progress through all levels to complete the game and improve your knowledge of Te Reo Māori vocabulary.
                            </li>
                        </ol>
                    </div>
                <div>
                    <button type="button">Exit</button>
                </div>
            </div>`

            document.getElementsByClassName("startMenu")[0].insertAdjacentHTML("afterend", MODAL_WINDOW);
            document.getElementById("modal").addEventListener("click", (event) => {
                if(event.target.tagName === "BUTTON") {
                    document.getElementById("modal").remove();
                }
            });
        }else {
            new Audio("/assets/audio/sfx/game_start_cue/game_start.mp3").play();

            setTimeout(() => {
                document.body.innerHTML = `
                    <div id="root">
                        <div id="gameContainer">
                            <div id="gameHeader"></div>
                            <div id="gameQuestion"></div>
                            <div id="gameContent"></div>
                        </div>
                    </div>
                    `;
                gameContainer();
            }, 1500);
        }
    }, false);
}

gameStartMenu();