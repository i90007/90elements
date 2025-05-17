// python -m http.server 8000
// http://localhost:8000
let typeWriterTimeout
let sounds = []
let cardDescriptions = {}
let cardN = 0

document.addEventListener("DOMContentLoaded", function () {
    sounds = [
        "sounds/1.wav",
        "sounds/2.wav",
        "sounds/3.mp3",
        "sounds/4.wav",
        "sounds/5.wav",
        "sounds/6.mp3",
        "sounds/7.mp3",
        "sounds/8.wav",
        "sounds/9.mp3"
    ]

    document.querySelectorAll("button").forEach(button => {
        button.addEventListener("click", playRandomSound)
    })

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            playRandomSound()
        }
    })
////////////////////////

    if (window.innerWidth > 900) {
        const music = document.getElementById("backgroundMusic")
        music.volume = 0.1
        // Play music only after user interaction (bypassing browser auto-blocking)
        document.body.addEventListener("click", function startMusic() {
            music.play().catch(error => console.log("Autoplay music is blocked by the browser:", error))
            document.body.removeEventListener("click", startMusic)
        })
    }
////////////////////////

    const savedLang = localStorage.getItem("language") || "en"
    changeLanguage(savedLang)
////////////////////////

    const languageMenu = document.querySelector(".language-dropdown")
    const languageButton = document.querySelector(".dropdown_btn")

    const infoButton = document.querySelector(".info_button")
    const infoPanel = document.getElementById("infoPanel")

    languageButton.addEventListener("click", function (event) {
        event.stopPropagation()
        languageMenu.classList.toggle("active")
        infoPanel.classList.remove("active")
        setTimeout(() => {
            if (!infoPanel.classList.contains("active")) {
                infoPanel.style.visibility = "hidden"
            }
        }, 999)
    })

    infoButton.addEventListener("click", function (event) {
        event.stopPropagation()
        infoPanel.classList.toggle("active")
        infoPanel.style.visibility = "visible"
        languageMenu.classList.remove("active")
        document.body.style.overflowY = 'auto'
    })
////////////////////////

    function closeAllPanels(event) {
        if (!infoButton.contains(event.target) && !infoPanel.contains(event.target)) {
            infoPanel.classList.remove("active")
            setTimeout(() => {
                if (!infoPanel.classList.contains("active")) {
                    infoPanel.style.visibility = "hidden"
                }
            }, 999)
        }
        if (!languageButton.contains(event.target) && !languageMenu.contains(event.target)) {
            languageMenu.classList.remove("active")
            infoPanel.style.visibility = "hidden"
        }
    }

    document.addEventListener("click", closeAllPanels)
////////////////////////

    const questionInput = document.getElementById("question")
    const startButton = document.querySelector(".start_button")

    function validateInput() {
        if (questionInput.value.trim().length > 5) {
            startButton.disabled = false
        } else {
            startButton.disabled = true
        }
    }

    questionInput.addEventListener("input", validateInput)
})

function typeWriter(textElement, phrases) {
    let currentPhraseIndex = 0;
    let index = 0;
    let isDeleting = false;

    function type() {
        let currentPhrase = phrases[currentPhraseIndex]

        if (!isDeleting && index < currentPhrase.length) {
            textElement.innerHTML = currentPhrase.substring(0, index + 1)
            index++
            typeWriterTimeout = setTimeout(type, 99)
        } else if (isDeleting && index > 0) {
            textElement.innerHTML = currentPhrase.substring(0, index - 1)
            index--
            typeWriterTimeout = setTimeout(type, 30)
        } else {
            if (!isDeleting) {
                typeWriterTimeout = setTimeout(() => {
                    isDeleting = true
                    type()
                }, 2000)
            } else {
                isDeleting = false
                currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length
                index = 0
                typeWriterTimeout = setTimeout(type, 1111)
            }
        }
    }

    type()
}

function playRandomSound() {
    const randomIndex = Math.floor(Math.random() * sounds.length)
    const audio = new Audio(sounds[randomIndex])
    audio.play().catch(error => console.warn("Audio playback error:", error))
}

function changeLanguage(lang) {
    localStorage.setItem("language", lang);
    fetch(`languages/${lang}.json`)
        .then(response => response.json())
        .then(data => {
            const textElement = document.getElementById("question_prompt")
            clearTimeout(typeWriterTimeout)
            textElement.innerHTML = ""
            typeWriter(
                document.getElementById("question_prompt"),
                [data.question_prompt1, data.question_prompt2]
            )

            document.title = data.title
            document.querySelector(".logo").innerText = data.logo
            document.querySelector(".dropdown_btn").innerText = data.language_selector
            document.querySelector(".info_button").innerText = data.info_button
            document.querySelector(".start_button").innerText = data.start_button
            document.querySelector(".new_reading").innerText = data.new_reading
            document.getElementById("question").placeholder = data.placeholder
            document.getElementById("questionReset").placeholder = data.placeholder
            document.getElementById("infoPanel").innerHTML = data.info_text
            document.querySelector(".close-btn").innerText = data.close_popup
            document.getElementById("popup-text").innerHTML = data.cardDescriptions[cardN].description
            if (window.innerWidth > 900) {
                document.querySelector(".dropdown_btn").innerText = data.language_selector
                document.querySelector(".info_button").innerText = data.info_button
            } else {
                document.querySelector(".dropdown_btn").innerText = data.language_selectorM
                document.querySelector(".info_button").innerText = data.info_buttonM
            }
            cardDescriptions = data.cardDescriptions
        })
        .catch(error => console.error("Error loading translation file:", error))
}

function generateReading(inputId) {
    const inputElement = document.getElementById(inputId)
    const questionText = inputElement.value.trim()
    // Generate a 19-digit number
    let randomNumber = ''
    for (let i = 0; i < 19; i++) {
        randomNumber += Math.floor(Math.random() * 10).toString()
    }

    // The first digit is the senior arcana (0-9)
    const absoluteNum = randomNumber[0]

    // we divide the next 18 digits into 9 pairs
    const pairs = []
    for (let i = 1; i < 19; i += 2) {
        const pair = randomNumber.slice(i, i+2)
        if (pair[0] === '0') {
        // if the first digit of a pair is "0", then we discard this pair and all subsequent ones
        break;
        } else {
        pairs.push(pair)
        }
    }

    startAnimation(absoluteNum, pairs, questionText)

    const questionResetInput = document.getElementById("questionReset")
    const resetButton = document.querySelector(".new_reading")

    function validateResetInput() {
        if (questionResetInput.value.trim().length > 5) {
            resetButton.disabled = false
        } else {
            resetButton.disabled = true
        }
    }

    questionResetInput.addEventListener("input", validateResetInput)
}

function showResult(absoluteNum, minorNums, questionText) {
    document.body.style.overflowY = 'auto'
    document.getElementById('start-screen').style.display = 'none'

    const resultScreen = document.getElementById('result-screen')
    resultScreen.style.display = 'flex'

    const absoluteCardDiv = document.getElementById('absoluteCard')

    absoluteCardDiv.innerHTML = `
        <div class="card" onclick="showPopup('${absoluteNum}')">
            <div>${absoluteNum}</div>
            <img src="images/absolute${absoluteNum}.webp" alt="Absolute ${absoluteNum}">
            <div class="img_box"></div>
            <div class="card-name">${cardDescriptions[absoluteNum].name}</div>
        </div>
    `

    const minorCardsDiv = document.getElementById('minorCards')
    minorCardsDiv.innerHTML = ''

    for (let i = 0; i < minorNums.length; i += 2) {
        const rowDiv = document.createElement('div')
        rowDiv.className = 'card-row'

        minorNums.slice(i, i + 2).forEach(num => {
            const cardEl = document.createElement('div')
            cardEl.className = 'card_container'
            cardEl.onclick = () => showPopup(num)

            cardEl.innerHTML = `
                <div class="card">
                    <div>${num}</div>
                    <img src="images/minor${num}.webp" alt="Element ${num}" 
                            onerror="this.onerror=null; this.src='images/absolute0.webp';">
                    <div class="img_box"></div>
                    <div class="card-name">${cardDescriptions[num].name}</div>
                </div>
            `
            rowDiv.appendChild(cardEl)
        })

        minorCardsDiv.appendChild(rowDiv)
    }

    const questionElement = document.getElementById("questionDisplay")
    clearTimeout(typeWriterTimeout)
    questionElement.innerHTML = ""
    typeWriter(
        document.getElementById("questionDisplay"),
        [questionText]
    )

    document.querySelectorAll("img").forEach(img => {
        img.addEventListener("click", playRandomSound)
    }) 
}

function showPopup(cardNum) {
    cardN = cardNum
    const desc = cardDescriptions[cardNum].description

    const popup = document.getElementById("popup")
    const popupText = document.getElementById("popup-text")

    popupText.innerHTML = desc
    popup.style.display = "flex"
    setTimeout(() => {
        popup.classList.add("show");
    }, 99);
}

function closePopup() {
    const popup = document.getElementById("popup")

    popup.classList.remove("show")
    setTimeout(() => {
        popup.style.display = "none"
    }, 999)
}

function startAnimation(absoluteNum, pairs, questionText) {
    const animationScreen = document.getElementById("animation-screen");
    const floatingCardsContainer = document.getElementById("floating-cards");

    floatingCardsContainer.innerHTML = ""

    const totalCards = 90
    const numberOfFlyingCards = 20
    const defaultImage = "images/absolute0.webp"

    const selectedCards = new Set();
    while (selectedCards.size < numberOfFlyingCards) {
        const randomCard = Math.floor(Math.random() * totalCards);
        selectedCards.add(randomCard);
    }

    selectedCards.forEach(cardNumber => {
        const imgSrc = `images/minor${cardNumber}.webp`;
        const imgElement = document.createElement("img");
        imgElement.src = imgSrc;
        imgElement.classList.add("floating-card");

        imgElement.style.left = Math.random() * 67 + "vw";
        imgElement.style.animationDuration = Math.random() * 2 + 2 + "s";

        imgElement.onerror = () => { imgElement.src = defaultImage; };

        floatingCardsContainer.appendChild(imgElement);
    });

    animationScreen.style.display = "flex";

    setTimeout(() => {
        animationScreen.style.display = "none";
        showResult(absoluteNum, pairs, questionText);
    }, 3333);
}