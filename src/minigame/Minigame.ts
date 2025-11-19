document.addEventListener("DOMContentLoaded", () => {
  let cardImg = [
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
  type PickedCards = {
    index: number;
    emoji: string;
  };
  var pickedCards: PickedCards[] = [];

  const grid = document.querySelector(".minigame-stage") as HTMLDivElement; // the playing field
  let scoreResult = 0;

  // Shuffle cards
  function shuffleArray(array: string[]): string[] {
    let a;
    let arr = array.slice(); // copy
    for (let i = arr.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      a = [arr[j], arr[i]];
      arr[i] = a[0];
      arr[j] = a[1];
    }
    return arr;
  }
  cardImg = shuffleArray(cardImg);

  // Prints out the shuffled card elements onto the minigame-stage
  cardImg.forEach((card) => {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card"); // Add css card class to each <div> element
    cardElement.dataset.imgValue = card; // Set card data attribute (imgValue) to identify the emoji string
    cardElement.innerText = card; // Display the emoji on the card when facing-up
    grid.appendChild(cardElement);
  });

  // flip card motion and adds pickedcards' index and emoji into pickedCards w/ minigame logic
  function mingame() {
    const cardElements = document.querySelectorAll(
      ".card"
    ) as NodeListOf<HTMLElement>;
    cardElements.forEach((card) => {
      card.addEventListener("click", () => {
        if (pickedCards.length >= 2 || card.classList.contains("flipped")) {
          return;
        } else {
          card.classList.add("flipped");
          const cardValue = card.dataset.imgValue as string;
          const cardIndex = Array.from(cardElements).indexOf(card);
          pickedCards.push({ index: cardIndex, emoji: cardValue });

          // Check for match after picking the second card
          if (pickedCards.length === 2) {
            setTimeout(() => {
              checkForMatch();
            }, 500);
          }
        }
      });
    });
  }

  // Check for matches
  function checkForMatch() {
    let card1 = pickedCards[0];
    let card2 = pickedCards[1];

    // Case 1: 2 different cards are picked and they match
    if (
      pickedCards.length >= 2 &&
      card1.index !== card2.index &&
      card1.emoji === card2.emoji
    ) {
      scoreResult++;
      pickedCards.pop();
      pickedCards.pop();
      const scoreDisplay = document.querySelector("#score") as HTMLElement;
      scoreDisplay.innerText = scoreResult.toString();
    }
    // Case 2: 2 different cards are picked and they don't match
    if (
      pickedCards.length >= 2 &&
      card1.index !== card2.index &&
      card1.emoji !== card2.emoji
    ) {
      document
        .querySelectorAll(".card")
        [card1.index].classList.remove("flipped");
      document
        .querySelectorAll(".card")
        [card2.index].classList.remove("flipped");
      pickedCards.pop();
      pickedCards.pop();
    }
  }
  mingame();
});
