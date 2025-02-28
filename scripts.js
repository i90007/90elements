// python -m http.server 8000
// http://localhost:8000
let typeWriterTimeout
let sounds = []
let cardDescriptions = {}

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

    const music = document.getElementById("backgroundMusic")
    music.volume = 0.1
    // Play music only after user interaction (bypassing browser auto-blocking)
    document.body.addEventListener("click", function startMusic() {
        music.play().catch(error => console.log("Autoplay music is blocked by the browser:", error))
        document.body.removeEventListener("click", startMusic)
    })
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
        }, 1000)
    })

    infoButton.addEventListener("click", function (event) {
        event.stopPropagation()
        infoPanel.classList.toggle("active")
        infoPanel.style.visibility = "visible"
        languageMenu.classList.remove("active")
    })
////////////////////////

    function closeAllPanels(event) {
        if (!infoButton.contains(event.target) && !infoPanel.contains(event.target)) {
            infoPanel.classList.remove("active")
            setTimeout(() => {
                if (!infoPanel.classList.contains("active")) {
                    infoPanel.style.visibility = "hidden"
                }
            }, 1000)
        }
        if (!languageButton.contains(event.target) && !languageMenu.contains(event.target)) {
            languageMenu.classList.remove("active")
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
                typeWriterTimeout = setTimeout(type, 999)
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
            document.getElementById("question2").placeholder = data.placeholder
            document.getElementById("infoPanel").innerHTML = data.info_text
            cardDescriptions = data.cardDescriptions
        })
        .catch(error => console.error("Error loading translation file:", error))
}

function generateReading() {
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

    showResult(absoluteNum, pairs)
}

function showResult(absoluteNum, minorNums) {
    document.getElementById('start-screen').style.display = 'none'

    const resultScreen = document.getElementById('result-screen')
    resultScreen.style.display = 'flex'

    const absoluteCardDiv = document.getElementById('absoluteCard')

    absoluteCardDiv.innerHTML = `
        <div class="card" onclick="showPopup('${absoluteNum}')">
        <div>${absoluteNum}</div>
        <img src="images/absolute${absoluteNum}.webp" alt="Absolute ${absoluteNum}">
        <div class="card-name">${cardDescriptions[absoluteNum].name}</div>
        </div>
    `

    const minorCardsDiv = document.getElementById('minorCards')
    minorCardsDiv.innerHTML = ''

    minorNums.forEach(num => {
        const cardEl = document.createElement('div')
        cardEl.className = 'card'
        cardEl.onclick = () => showPopup(num)

        cardEl.innerHTML = `
        <img src="images/minor${num}.webp" alt="Element ${num}">
        <div class="card-name">Стихія ${num}</div>
        `
        minorCardsDiv.appendChild(cardEl)
    });

    // Тут можна реалізувати анімацію поступового зникнення «екрану завантаження»
    // У цьому прикладі ми відразу показуємо result-screen, але можна
    // підключити CSS-анімації або fade-in/out.
}

function showPopup(cardNum) {
    const desc = cardDescriptions[cardNum]

    document.getElementById('popupText').innerText = desc
    document.getElementById('popupBg').style.display = 'flex'

    document.body.style.filter = 'blur(5px)'
}

function closePopup() {
    document.getElementById('popupBg').style.display = 'none'
    document.body.style.filter = 'none'
}

function resetReading() {
    document.getElementById('result-screen').style.display = 'none'
    document.getElementById('start-screen').style.display = 'flex'
}