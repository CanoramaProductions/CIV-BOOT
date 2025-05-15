const output = document.getElementById("output");
const input = document.getElementById("input");
const buttons = document.getElementById("buttons");

let state = "booting";
let civName = "";
let year = 1;
let population = 50;
let food = 100;
let resources = 100;
let location = "";

// ASCII Logo
const asciiLogo = `
  ___  ____  _  _    ____  _____  _____  ____ 
 / __)(_  _)( \\/ )()(  _ \\(  _  )(  _  )(_  _)
( (__  _)(_  \\  /    ) _ < )(_)(  )(_)(   )(  
 \\___)(____)  \\/  ()(____/(_____)(_____) (__) 
`;

// Boot messages
const bootLines = [
  asciiLogo,
  "\n--- CIV:BOOT v1.0 BIOS ---",
  "[BOOT] Initializing core systems...",
  "[OK]   Memory check complete.",
  "[OK]   Kernel loaded.",
  "[OK]   AI Commander Interface online.",
  "[INFO] Civilization Engine ready.",
  "\n> Enter your civilization name:"
];

// Expanded random events
const events = [
  { text: "A bountiful harvest increases your food supply.", food: +40 },
  { text: "A neighboring tribe offers a trade, boosting resources.", resources: +30 },
  { text: "A mysterious illness reduces your population.", population: -15 },
  { text: "An earthquake damages infrastructure, losing resources.", resources: -25 },
  { text: "A festival boosts morale, increasing population.", population: +10 },
  { text: "A fire destroys food stores.", food: -30 },
  { text: "A new mine is discovered, increasing resources.", resources: +35 },
  { text: "A drought affects crops, reducing food supply.", food: -20 },
  { text: "A group of nomads joins your civilization.", population: +20 },
  { text: "A bandit attack steals some of your resources.", resources: -15 },
  { text: "A severe storm ruins part of your harvest.", food: -25 },
  { text: "Your hunters bring back extra food.", food: +25 },
  { text: "A disease outbreak lowers your population.", population: -10 },
  { text: "You find a hidden cache of resources.", resources: +40 },
  { text: "A peaceful treaty with neighbors increases population.", population: +15 },
  { text: "A landslide damages your mines.", resources: -20 },
  { text: "Your food storage is well-maintained, reducing loss.", food: +10 },
  { text: "Rival factions cause unrest, lowering population.", population: -12 },
  { text: "Your engineers improve resource gathering efficiency.", resources: +20 },
  { text: "A caravan brings exotic goods, increasing resources.", resources: +30 },
  { text: "Wildfires threaten your lands, reducing food and resources.", food: -15, resources: -15 },
  { text: "A wise elder shares knowledge, boosting population growth.", population: +18 },
  { text: "A harsh winter decreases your food supply.", food: -20 },
  { text: "A mysterious traveler offers rare resources.", resources: +25 },
  { text: "A rebellion causes loss of population and resources.", population: -20, resources: -20 },
  { text: "A sudden influx of migrants grows your population.", population: +25 },
  { text: "Heavy rains flood fields, ruining crops.", food: -30 },
  { text: "New farming techniques increase food production.", food: +35 },
  { text: "A plague sweeps through your people.", population: -25 },
  { text: "A rich vein of minerals is discovered.", resources: +45 },
  { text: "A caravan of traders arrives with goods.", resources: +20 },
  { text: "A political dispute lowers morale, reducing population.", population: -10 },
  { text: "Your scouts find a fertile valley nearby.", food: +20 },
  { text: "A fire in the marketplace reduces resources.", resources: -30 },
  { text: "A cultural festival attracts new settlers.", population: +22 },
  { text: "A raid from bandits reduces resources.", resources: -18 },
  { text: "Good weather boosts crop yields.", food: +30 },
  { text: "A drought forces rationing, lowering food.", food: -25 },
  { text: "A wise leader inspires your people, growing population.", population: +15 },
  { text: "An epidemic reduces your population.", population: -22 },
  { text: "New tools improve mining efficiency.", resources: +30 },
  { text: "A trader offers rare spices, increasing resources.", resources: +25 },
  { text: "Your livestock reproduces rapidly, increasing food.", food: +20 },
  { text: "A flood destroys food stores.", food: -40 },
  { text: "A festival brings prosperity and happiness.", population: +18 },
  { text: "A rival tribe challenges your territory.", population: -15, resources: -10 },
  { text: "Discovery of ancient ruins brings knowledge.", resources: +35 },
  { text: "A drought lowers morale and food supply.", population: -10, food: -20 },
];

function typeText(text, callback, speed = 20) {
  let i = 0;
  function typer() {
    if (i < text.length) {
      output.innerText += text[i++];
      scrollToBottom();
      setTimeout(typer, speed);
    } else if (callback) {
      callback();
    }
  }
  typer();
}

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}

function typeLines(lines, i = 0) {
  if (i < lines.length) {
    typeText(lines[i] + "\n", () => typeLines(lines, i + 1));
  } else {
    // After boot, check for saved game
    if (loadGame()) {
      typeText(`\nWelcome back, leader of ${civName}.\nResuming Year ${year} at the ${location}.\n`, displayStats);
    } else {
      state = "start";
      input.disabled = false;
      input.focus();
    }
  }
}

function setButtons(options) {
  buttons.innerHTML = "";
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => handleInput(opt);
    buttons.appendChild(btn);
  });
}

function displayStats() {
  state = "yearChoice";
  typeText(
    `\n--- YEAR ${year} REPORT ---\nPopulation: ${population}\nFood: ${food}\nResources: ${resources}\n`,
    () => {
      typeText("\nChoose action: [farm / mine / train]\n");
      setButtons(["farm", "mine", "train"]);
      input.disabled = false;
      input.focus();
    }
  );
}

function randomEvent() {
  const event = events[Math.floor(Math.random() * events.length)];
  population += event.population || 0;
  food += event.food || 0;
  resources += event.resources || 0;

  // Prevent negative stats
  if (population < 1) population = 1;
  if (food < 0) food = 0;
  if (resources < 0) resources = 0;

  return event.text;
}

function nextYear() {
  year++;
  food -= population; // Food consumption

  if (food < 0) {
    population += Math.floor(food / 10); // Starvation penalty
    food = 0;
  }
  if (population < 1) population = 1;

  const eventText = randomEvent();

  saveGame();

  typeText(`\n\n>>> YEAR ${year} <<<\nEvent: ${eventText}`, displayStats);
}

function handleInput(val) {
  const value = val.trim().toLowerCase();
  output.innerText += `\n> ${value}`;
  scrollToBottom();

  if (state === "start") {
    civName = val.trim();
    if (!civName) {
      typeText("\nPlease enter a valid civilization name:\n");
      return;
    }
    typeText(
      `\nWelcome, leader of ${civName}.\nChoose your starting location: [plains / mountains / coast]\n`
    );
    setButtons(["plains", "mountains", "coast"]);
    state = "chooseLocation";
  } else if (state === "chooseLocation") {
    if (["plains", "mountains", "coast"].includes(value)) {
      location = value;
      typeText(`\n${civName} settles near the ${location}.\nYear 1 begins...`, () => {
        saveGame();
        displayStats();
      });
      state = "yearChoice";
    } else {
      typeText("\nInvalid location. Choose: plains, mountains, or coast.\n");
    }
  } else if (state === "yearChoice") {
    input.disabled = true;
    if (value === "farm") {
      food += 30;
      typeText(`\nYour people plant crops. (+30 food)`, nextYear);
    } else if (value === "mine") {
      resources += 30;
      typeText(`\nYou mine nearby hills. (+30 resources)`, nextYear);
    } else if (value === "train") {
      if (resources >= 10) {
        resources -= 10;
        typeText(`\nYou train a small militia. (-10 resources)`, nextYear);
      } else {
        typeText(`\nNot enough resources to train militia. Choose another action.\n`, () => {
          input.disabled = false;
          input.focus();
        });
      }
    } else {
      typeText(`\nInvalid action. Choose: farm, mine, or train.\n`, () => {
        input.disabled = false;
        input.focus();
      });
    }
  }
}

function saveGame() {
  const gameState = {
    civName,
    year,
    population,
    food,
    resources,
    location,
  };
  localStorage.setItem("civBootSave", JSON.stringify(gameState));
}

function loadGame() {
  const savedState = JSON.parse(localStorage.getItem("civBootSave"));
  if (savedState) {
    civName = savedState.civName;
    year = savedState.year;
    population = savedState.population;
    food = savedState.food;
    resources = savedState.resources;
    location = savedState.location;
    return true;
  }
  return false;
}

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && input.value.trim() !== "") {
    handleInput(input.value);
    input.value = "";
  }
});

// Start boot sequence
input.disabled = true;
typeLines(bootLines);
