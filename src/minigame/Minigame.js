document.addEventListener("DOMContentLoaded", function () {
    var cardImg = [
        "🍎",
        "🍎",
        "🥝",
        "🥝",
        "🍐",
        "🍐",
        "🍅",
        "🍅",
        "🍓",
        "🍓",
        "🍈",
        "🍈",
        "🍇",
        "🍇",
        "🫒",
        "🫒",
    ];
    var pickedCards = [];
    var grid = document.querySelector(".minigame-stage"); // the playing field
    var scoreResult = 0;
    // Shuffle cards
    function shuffleArray(array) {
        var a;
        var arr = array.slice(); // copy
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            a = [arr[j], arr[i]];
            arr[i] = a[0];
            arr[j] = a[1];
        }
        return arr;
    }
    cardImg = shuffleArray(cardImg);
    // Prints out the shuffled card elements onto the minigame-stage
    cardImg.forEach(function (card) {
        var cardElement = document.createElement("div");
        cardElement.classList.add("card"); // Add css card class to each <div> element
        cardElement.dataset.imgValue = card; // Set card data attribute (imgValue) to identify the emoji string
        cardElement.innerText = card; // Display the emoji on the card when facing-up
        grid.appendChild(cardElement);
    });
    // flip card motion and adds pickedcards' index and emoji into pickedCards w/ minigame logic
    function mingame() {
        var cardElements = document.querySelectorAll(".card");
        cardElements.forEach(function (card) {
            card.addEventListener("click", function () {
                if (pickedCards.length >= 2 || card.classList.contains("flipped")) {
                    return;
                }
                else {
                    card.classList.add("flipped");
                    var cardValue = card.dataset.imgValue;
                    var cardIndex = Array.from(cardElements).indexOf(card);
                    pickedCards.push({ index: cardIndex, emoji: cardValue });
                    // Check for match after picking the second card
                    if (pickedCards.length === 2) {
                        setTimeout(function () {
                            checkForMatch();
                        }, 500);
                    }
                }
            });
        });
    }
    // Check for matches
    function checkForMatch() {
        var card1 = pickedCards[0];
        var card2 = pickedCards[1];
        // Case 1: 2 different cards are picked and they match
        if (pickedCards.length >= 2 &&
            card1.index !== card2.index &&
            card1.emoji === card2.emoji) {
            scoreResult++;
            pickedCards.pop();
            pickedCards.pop();
            var scoreDisplay = document.querySelector("#score");
            scoreDisplay.innerText = scoreResult.toString();
        }
        // Case 2: 2 different cards are picked and they don't match
        if (pickedCards.length >= 2 &&
            card1.index !== card2.index &&
            card1.emoji !== card2.emoji) {
            document
                .querySelectorAll(".card")[card1.index].classList.remove("flipped");
            document
                .querySelectorAll(".card")[card2.index].classList.remove("flipped");
            pickedCards.pop();
            pickedCards.pop();
        }
    }
    mingame();
});
