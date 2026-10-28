"use strict";

// ---------------- DOM Elements ----------------

const nameForm = document.getElementById("name-form");
const nameInput = document.getElementById("player-name");
const storyElement = document.getElementById("story");
const choicesElement = document.getElementById("choices");
const healthElement = document.getElementById("health");
const oxygenElement = document.getElementById("oxygen");
const locationElement = document.getElementById("location");

// ---------------- Game State ----------------

let playerName = "";
let playerHealth = 100;
let oxygen = 100;
let inventory = [];
let currentRoom = "Airlock";

let gameStarted = false;
let gameOver = false;

let airlockVisited = false;
let airlockExplored = false;
let storageExplored = false;
let maintenanceExplored = false;
let maintenanceCleared = false;
let junctionVisited = false;
let powerRoomVisited = false;
let powerRoomEntered = false;
let securityVisited = false;
let bossDefeated = false;
let researchVisited = false;
let riddleSolved = false;
let emergencyVisited = false;
let securityWeakened = false;
let launchPowered = false;
let surveillancePower = 100;
let surveillanceRecordings = [];

let inventoryReturnAction = showMenu;

const items = [
    "Medical Nanogel",
    "Plasma Cutter",
    "Energy Shield"
];

const enemies = [
    { name: "Security Drone!", health: 30 },
    { name: "Maintenance Robot!", health: 50 },
    { name: "Defense Robot!", health: 20 },
    { name: "Rogue Drone!", health: 40 }
];

// -------------- Functions --------------

function updateStatus() {
    healthElement.textContent = playerHealth;
    oxygenElement.textContent = oxygen;
    locationElement.textContent = currentRoom;
}

function showStory(message) {
    storyElement.style.whiteSpace = "pre-line";
    storyElement.textContent = message;
    updateStatus();
}

function storyDelay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function clearChoices() {
    choicesElement.replaceChildren();
}

function addChoice(label, action) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", action);
    choicesElement.appendChild(button);
}

function addInventoryChoice(returnAction) {
    addChoice("Inventory", () => checkInventory(returnAction));
}

function showMenu() {
    if (!gameStarted || gameOver) return;
    clearChoices();
    addChoice("Explore", explore);
    addChoice("Inventory", () => checkInventory(showMenu));
    addChoice("Stats", viewStats);
    addChoice("Quit", quitGame);
}

function returnToMenu(message) {
    showStory(message);
    showMenu();
}

function beginGame(event) {
    event.preventDefault();
    const enteredName = nameInput.value.trim();
    if (!enteredName) {
        showStory("ERROR : Please Enter Your Name!");
        nameInput.focus();
        return;
    }
    playerName = enteredName;
    gameStarted = true;
    gameOver = false;
    nameForm.hidden = true;
    showStory(
        "You Wake Up Alone Inside An Abandoned NASA Lunar Research Facility.\n\n" +
        "It Has Lost Contact With Earth, And The Emergency Systems Are Failing.\n\n" +
        "Explore The Facility, Survive Its Security Systems, Find The Emergency Access Keycard, And Escape."
    );
    clearChoices();
    addChoice("Explore", explore);
    addChoice("Inventory", () => checkInventory(showMenu));
}

function explore() {
    if (!gameStarted || gameOver) return;
    if (currentRoom === "Airlock") {
        showAirlockChoices();
    } else if (currentRoom === "Storage Bay") {
        showStorageChoices();
    } else if (currentRoom === "Maintenance Tunnel") {
        enterMaintenance();
    } else if (currentRoom === "Research Junction") {
        showJunction();
    } else if (currentRoom === "Power Control Room") {
        showPowerRoom();
    } else if (currentRoom === "Security Chamber") {
        showSecurityRoom();
    } else if (currentRoom === "Research Lab") {
        showResearchLab();
    } else if (currentRoom === "Emergency Area") {
        showEmergencyArea();
    } else {
        showMenu();
    }
}

function showAirlockChoices() {
    if (!gameStarted || gameOver) return;
    currentRoom = "Airlock";
    if (!airlockVisited) {
        airlockVisited = true;
        showStory(
            "You enter the abandoned NASA airlock. Emergency lights flicker above you.\n\n" +
            "The facility is silent. A damaged storage bay is nearby, while a maintenance tunnel leads deeper into the station.\n\n" +
            "You stand inside the facility's damaged airlock. " +
            "Frost gathers around the sealed outer hatch, and a warning light flashes above the pressure controls. " +
            "Your communications link to Earth is silent. " +
            "Beyond the small reinforced window lies the dark, lifeless lunar surface. Somewhere deeper inside, machinery continues to run."
        );
    } else {
        showStory(
            "You return to the Airlock.\n\n" +
            "The Storage Bay and Maintenance Tunnel remain accessible."
        );
    }
    clearChoices();
    addChoice("Option 1 : Search The Airlock", searchAirlock);
    addChoice("Option 2 : Enter The Storage Bay", exploreStorage);
    addChoice("Option 3 : Step Into The Tunnel", enterMaintenance);
    addInventoryChoice(showAirlockChoices);
}

function searchAirlock() {
    if (!gameStarted || gameOver) return;
    currentRoom = "Airlock";
    if (airlockExplored) {
        showStory("You have already searched the Airlock.");

        clearChoices();
        addChoice("Return To Exploration", showAirlockChoices);
        addInventoryChoice(searchAirlock);
        return;
    }
    airlockExplored = true;
    showStory(
        "You search the Airlock...\n\n" +
        "--- RECOVERED CREW LOG ---\n" +
        "Research Station - Day 17\n" +
        "The signal beneath the lunar surface has changed.\n" +
        "It now responds whenever we transmit.\n" +
        "--- END OF CREW LOG ---"
    );
    clearChoices();
    addChoice("Choose an Item", () => findItem(false, showAirlockChoices));
    addChoice("Return To Exploration", showAirlockChoices);
}

function showStorageChoices() {
    if (!gameStarted || gameOver) return;
    currentRoom = "Storage Bay";
    showStory(
        storageExplored
            ? "You have already searched the Storage Bay.\n\nThe Airlock and Maintenance Tunnel remain accessible."
            : "You are inside the Storage Bay.\n\nYou can search for supplies or return to the Airlock."
    );
    clearChoices();
    if (!storageExplored) {
        addChoice("Search The Storage Bay", exploreStorage);
    }
    addChoice("Continue To The Maintenance Tunnel", enterMaintenance);
    addInventoryChoice(showStorageChoices);
}

function exploreStorage() {
    if (!gameStarted || gameOver) return;
    if (storageExplored) {
        showStorageChoices();
        return;
    }
    currentRoom = "Storage Bay";
    oxygen = Math.max(0, oxygen - 10);
    updateStatus();
    if (checkSurvival()) return;
    storageExplored = true;
    showStory(
        "You enter the Storage Bay...\n\n" +
        "--- RECOVERED CREW LOG ---\n" +
        "Research Station - Day 19\n" +
        "We have been ordered to evacuate.\n" +
        "Several crew members are still missing.\n" +
        "--- END OF CREW LOG ---"
    );
    const result = [
        ...items,
        "Oxygen Canister",
        ...enemies.map(enemy => enemy.name)
    ];
    const found = result[Math.floor(Math.random() * result.length)];
    if (found === "Oxygen Canister") {
        if (inventory.includes("Oxygen Canister")) {
            showStory(
                storyElement.textContent +
                "\n\nYou already have an Oxygen Canister. " +
                "The compartment is empty."
            );
        } else {
            inventory.push("Oxygen Canister");
            showStory(
                storyElement.textContent +
                "\n\nYou discover an Oxygen Canister!"
            );
        }
        clearChoices();
        addChoice("Return To The Airlock", showAirlockChoices);
        addChoice("Continue To The Maintenance Tunnel", enterMaintenance);
        addInventoryChoice(showStorageChoices);
    } else if (items.includes(found)) {
        showStory(
            storyElement.textContent
        );
        clearChoices();
        addChoice("Choose an Item", () => findItem(true, showStorageChoices));
        addChoice("Return To The Airlock", showAirlockChoices);
    } else {
        showStory(
            storyElement.textContent +
            "\n\nYou discover a hostile machine: " + found
        );
        clearChoices();
        addChoice("Fight", () => encounterEnemy(found, showStorageChoices));
    }
}

function enterMaintenance() {
    if (!gameStarted || gameOver) return;
    currentRoom = "Maintenance Tunnel";
    if (maintenanceCleared) {
        showStory(
            "The Maintenance Tunnel is quiet now. The hostile machine has been disabled."
        );
        clearChoices();
        addChoice("Continue To Research Junction", enterResearchJunction);
        addChoice("Return To The Airlock", showAirlockChoices);
        addInventoryChoice(enterMaintenance);
        return;
    }
    if (maintenanceExplored) {
        showMaintenanceEncounter();
        return;
    }
    oxygen = Math.max(0, oxygen - 10);
    updateStatus();
    if (checkSurvival()) return;
    maintenanceExplored = true;
    showStory(
        "You step into the Maintenance Tunnel...\n\n" +
        "--- RECOVERED CREW LOG ---\n" +
        "Research Station - Day 21\n" +
        "The security robots are malfunctioning.\n" +
        "One attacked a technician without warning.\n" +
        "--- END OF CREW LOG ---\n\n" +
        "The tunnel is filled with damaged cables."
    );
    clearChoices();
    storyDelay(5000).then(() => {
        if (gameOver) return;
        showStory(
            "The tunnel is filled with damaged cables.\n\n" +
            "Suddenly, something moves in the darkness.\n\n" +
            "CLANG!\n\n" +
            "A security machine emerges from the shadows."
        );
        clearChoices();
        addChoice("Fight", () => encounterEnemy(null, maintenanceVictory));
        addInventoryChoice(showMaintenanceEncounter);
    });
}

function showMaintenanceEncounter() {
    if (!gameStarted || gameOver || maintenanceCleared) return;
    currentRoom = "Maintenance Tunnel";
    showStory(
        "The hostile machine still blocks the Maintenance Tunnel.\n\n" +
        "Choose to fight it to reach the Research Junction."
    );
    clearChoices();
    addChoice("Fight", () => encounterEnemy(null, maintenanceVictory));
    addInventoryChoice(showMaintenanceEncounter);
}

function maintenanceVictory() {
    maintenanceCleared = true;
    enterResearchJunction();
}

function findItem(storageBay = false, returnAction = showAirlockChoices) {
    if (!gameStarted || gameOver) return;
    currentRoom = storageBay ? "Storage Bay" : "Airlock";
    showStory(
        "Choose an item!"
    );
    clearChoices();
    addChoice("1 : Medical Nanogel", () => chooseItem("Medical Nanogel", storageBay, returnAction));
    addChoice("2 : Plasma Cutter", () => chooseItem("Plasma Cutter", storageBay, returnAction));
    addChoice("3 : Energy Shield", () => chooseItem("Energy Shield", storageBay, returnAction));
    if (storageBay) {
        addChoice("4 : Oxygen Canister", () => chooseItem("Oxygen Canister", storageBay, returnAction));
    }
}

function chooseItem(item, storageBay, returnAction = showAirlockChoices) {
    if (!gameStarted || gameOver) return;
    currentRoom = storageBay ? "Storage Bay" : "Airlock";
    if (item === "Medical Nanogel") {
        playerHealth += 50;
        showStory("You use Medical Nanogel and increase your health.");
        clearChoices();
        addChoice("Continue", returnAction);
        addInventoryChoice(returnAction);
        updateStatus();
        return;
    }
    if (inventory.includes(item)) {
        showStory("You have already found the " + item + "!");
        clearChoices();
        addChoice("Choose Another Item", () => findItem(storageBay, returnAction));
        addChoice("Return", returnAction);
        return;
    }
    inventory.push(item);
    if (item === "Plasma Cutter") {
        showStory(
            "You have chosen a Plasma Cutter!\n" +
            "It increases your attack damage."
        );
    } else if (item === "Energy Shield") {
        showStory(
            "You have chosen an Energy Shield!\n" +
            "It protects you during defense."
        );
    } else if (item === "Oxygen Canister") {
        showStory("You have found an Oxygen Canister!");
    }
    clearChoices();
    addChoice("Continue", returnAction);
    addInventoryChoice(returnAction);
    updateStatus();
}

function encounterEnemy(enemyName = null, onVictory = showMenu) {
    if (!gameStarted || gameOver) return;
    let enemy;
    if (typeof enemyName === "object" && enemyName !== null) {
        enemy = { ...enemyName };
    } else if (enemyName) {
        enemy = enemies.find(entry => entry.name === enemyName);
    } else {
        enemy = { ...enemies[Math.floor(Math.random() * enemies.length)] };
    }
    if (!enemy) {
        onVictory();
        return;
    }
    let enemyHealth = enemy.health;
    function showCombat() {
        if (gameOver) return;
        showStory(
            "You Have Come Across A " + enemy.name + "\n\n" +
            "Enemy Health = " + Math.max(0, enemyHealth) + "\n\n" +
            "Choose Attack OR Defense."
        );
        clearChoices();
        addChoice("Attack", attack);
        addChoice("Defense", defend);
    }
    function attack() {
        if (gameOver) return;
        const damage = inventory.includes("Plasma Cutter") ? 25 : 15;
        enemyHealth -= damage;
        oxygen = Math.max(0, oxygen - 5);
        if (checkSurvival()) return;
        if (enemyHealth <= 0) {
            combatVictory();
            return;
        }
        playerHealth = Math.max(0, playerHealth - 10);
        if (checkSurvival()) return;
        showCombat();
    }
    function defend() {
        if (gameOver) return;
        if (!inventory.includes("Energy Shield")) {
            playerHealth = Math.max(0, playerHealth - 5);
        }
        oxygen = Math.min(100, oxygen + 3);
        if (checkSurvival()) return;
        showCombat();
    }
    function combatVictory() {
        if (gameOver) return;
        if (enemy.name === "Security Mech") {
            bossDefeated = true;
            if (!inventory.includes("Emergency Access Keycard")) {
                inventory.push("Emergency Access Keycard");
            }
            showStory(
                "You Defeated The Security Mech!\n\n" +
                "You obtained the Emergency Access Keycard."
            );
        } else {
            showStory("You Defeated The Enemy!");
        }
        clearChoices();
        addChoice("Continue", onVictory);
        addInventoryChoice(onVictory);
    }
    showCombat();
}

function enterResearchJunction() {
    if (!gameStarted || gameOver) return;
    currentRoom = "Research Junction";
    junctionVisited = true;
    showJunction();
}

function showSurveillance() {
    if (!gameStarted || gameOver) return;
    currentRoom = "Research Junction";
    if (surveillancePower < 35) {
        showStory(
            "The surveillance terminal shuts down.\n\n" +
            "Its backup power is too low to access another recording."
        );
        clearChoices();
        addChoice("Return To Research Junction", showJunction);
        return;
    }
    const recordings = [
        {
            id: "incident",
            title: "Recording 1: The Incident",
            cost: 35,
            message:
                "Researchers detect an unidentified signal beneath the Moon. " +
                "At first, the signal appears to be a repeating pattern of pulses. " +
                "The team believes it may be natural, but its timing changes whenever the facility transmits a response. " +
                "Hours later, communications with Earth fail. " +
                "The security robots begin attacking personnel without warning. The recording ends as the control room loses power."
        },
        {
            id: "crew",
            title: "Recording 2: The Missing Crew",
            cost: 35,
            message:
                "The footage shows a researcher entering a restricted lower-level corridor after receiving an unexplained access authorization. " +
                "Several minutes later, the corridor lights begin flickering. " +
                "The researcher stops, looks directly toward the surveillance camera, and appears to say something, but the audio is corrupted " +
                "The door closes behind them. " +
                "No one is recorded leaving the corridor. " +
                "The crew's evacuation report lists the researcher as missing."
        },
        {
            id: "transmission",
            title: "Recording 3: The Final Transmission",
            cost: 35,
            message:
                "A visibly exhausted researcher records a final message." +
                "They report that the signal appears to respond to the facility's equipment, almost as if it is learning from each transmission. " +
                "The team tried to shut down the experiment, but the security systems activated before they could reach the control room. " +
                "The researcher warns that the signal may not be a simple transmission from beneath the Moon. " +
                "They begin to explain what they discovered, but the recording cuts off before the explanation is complete."
        }
    ];
    const available = recordings.filter(
        recording => !surveillanceRecordings.includes(recording.id)
    );
    if (available.length === 0) {
        showStory(
            "You have reviewed all available surveillance recordings.\n\n" +
            "The signal's true nature remains unknown."
        );
        clearChoices();
        addChoice("Return To Research Junction", showJunction);
        return;
    }
    showStory(
        "SURVEILLANCE TERMINAL\n\n" +
        "Backup Power: " + surveillancePower + "%\n\n" +
        "Each recording costs 35% backup power.\n" +
        "Choose carefully: the terminal cannot play every recording."
    );
    clearChoices();
    available.forEach(recording => {
        addChoice(recording.title, () => {
            surveillancePower -= recording.cost;
            surveillanceRecordings.push(recording.id);
            showStory(
                recording.title + "\n\n" +
                recording.message + "\n\n" +
                "Backup Power Remaining: " + surveillancePower + "%"
            );
            clearChoices();
            addChoice("Continue Surveillance", showSurveillance);
            addChoice("Return To Research Junction", showJunction);
        });
    });
    addChoice("Leave Surveillance", showJunction);
}

function showJunction() {
    if (!gameStarted || gameOver) return;
    currentRoom = "Research Junction";
    showStory(
        "You enter the Research Junction.\n" +
        "The corridor leads deeper into the facility.\n\n" +
        "One route leads toward the security chamber, where the facility's defense systems are controlled. " +
        "The other leads toward the research laboratories. " +
        "Emergency lights cast long shadows across abandoned equipment. " +
        "A nearby terminal flickers with incomplete reports about the experiment that preceded the communications failure."
    );
    clearChoices();
    addChoice("Review Security Footage", showSurveillance);
    addChoice("Enter The Power Control Room", showPowerRoom);
    addChoice("Continue To Security", showSecurityRoom);
    addChoice("Continue To Research", showResearchLab);
}

function showPowerRoom() {
    if (!gameStarted || gameOver) return;
    currentRoom = "Power Control Room";
    if (powerRoomVisited) {
        showStory(
            "You return to the Power Control Room.\n\n" +
            "The facility's main power system has already been addressed."
        );
        clearChoices();
        addChoice("Continue To Security", showSecurityRoom);
        addChoice("Continue To Research", showResearchLab);
        return;
    }
    if (!powerRoomEntered) {
        oxygen = Math.max(0, oxygen - 10);
        updateStatus();
        if (checkSurvival()) return;
        powerRoomEntered = true;
    }
    showStory(
        "You enter the Power Control Room.\n\n" +
        "Overloaded generators vibrate behind reinforced panels. " +
        "Several monitors display conflicting readings, and a warning identifies an unexplained surge during the lunar signal experiment. " +
        "The facility's systems are failing, and the remaining power must be managed carefully.\n\n" +
        "--- INCIDENT REPORT ---\n" +
        "Research Station - Day 23\n" +
        "The power surge began during the signal experiment.\n" +
        "Someone has changed the system logs.\n" +
        "--- END OF REPORT ---\n\n" +
        "Choose a system to restore."
    );
    clearChoices();
    addChoice("1 : Restore Life Support", () => restorePower("life"));
    addChoice("2 : Restore Security Systems", () => restorePower("security"));
    addChoice("3 : Restore Emergency Launch Systems", () => restorePower("launch"));
    addInventoryChoice(showPowerRoom);
}

function restorePower(system) {
    if (!gameStarted || gameOver) return;
    if (powerRoomVisited) {
        showPowerRoom();
        return;
    }
    powerRoomVisited = true;
    if (system === "life") {
        oxygen = Math.min(100, oxygen + 30);
        showStory(
            "You restore power to the Life Support System.\n" +
            "The facility's oxygen systems stabilize.\n" +
            "Oxygen: +30"
        );
    } else if (system === "security") {
        securityWeakened = true;
        showStory(
            "You restore power to the Security Systems.\n" +
            "The facility's security systems come back online.\n\n" +
            "The Security Mech's combat systems are weakened."
        );
    } else if (system === "launch") {
        launchPowered = true;
        showStory(
            "You restore power to the Emergency Launch System.\n" +
            "The emergency launch system begins powering up."
        );
    }
    updateStatus();
    clearChoices();
    addChoice("Continue To Security", showSecurityRoom);
    addChoice("Continue To Research", showResearchLab);
}

function showSecurityRoom() {
    if (!gameStarted || gameOver) return;
    currentRoom = "Security Chamber";
    if (!bossDefeated && !securityVisited) {
        oxygen = Math.max(0, oxygen - 10);
        updateStatus();
        if (checkSurvival()) return;
    }
    securityVisited = true;
    if (bossDefeated) {
        showStory(
            "The Security Chamber is quiet.\n\n" +
            "The Security Mech lies disabled on the floor. " +
            "You have already collected its Emergency Access Keycard."
        );
        clearChoices();
        addChoice("Continue To Research", showResearchLab);
        addChoice("Continue To Emergency Area", showEmergencyArea);
        return;
    }
    showStory(
        "SECURITY CHAMBER\n\n" +
        "The security chamber is silent except for the hum of damaged computers. " +
        "Warning symbols cover the central display, and the doors behind you lock automatically. " +
        "A large security machine stands between you and the emergency access keycard. " +
        "Its sensors begin tracking your movement."
    );
    clearChoices();
    storyDelay(5000).then(() => {
        if (gameOver) return;
        showStory(
            "The Security Mech blocks the corridor ahead.\n" +
            "Its weapons lock onto you."
        );
        clearChoices();
        addChoice("Fight The Security Mech", () => {
            encounterEnemy(
                { name: "Security Mech", health: securityWeakened ? 75 : 100 },
                showSecurityRoom
            );
        });
        addInventoryChoice(showSecurityRoom);
    });
}

function showResearchLab() {
    if (!gameStarted || gameOver) return;
    currentRoom = "Research Lab";
    if (!researchVisited) {
        oxygen = Math.max(0, oxygen - 10);
        updateStatus();
        if (checkSurvival()) return;
    }
    researchVisited = true;
    if (riddleSolved) {
        showStory(
            "You return to the Research Lab.\n\n" +
            "The terminal's emergency access route is already unlocked.\n" +
            "The research logs reveal that the mysterious signal originates deep beneath the Moon's surface."
        );
        clearChoices();
        addChoice("Continue To Emergency Area", showEmergencyArea);
        addChoice("Return To Research Junction", enterResearchJunction);
        return;
    }
    showStory(
        "You enter the Research Lab.\n\n" +
        "The laboratory has been abandoned in the middle of an experiment. " +
        "Sample containers sit beside an overturned chair, and a cracked monitor displays fragments of a repeating signal. " +
        "Notes on the console describe a transmission originating beneath the lunar surface. " +
        "A computer terminal remains active, waiting for input.\n\n" +
        "\"I have no atmosphere, yet I surround you. " +
        "I have no gravity, yet I hold countless worlds. " +
        "What am I?\""
    );
    clearChoices();
    addChoice("Answer The Riddle", solveResearchRiddle);
    addChoice("Return To Research Junction", enterResearchJunction);
}

function solveResearchRiddle() {
    if (!gameStarted || gameOver) return;
    currentRoom = "Research Lab";
    showStory(
        "The terminal asks:\n\n" +
        "\"I have no atmosphere, yet I surround you. " +
        "I have no gravity, yet I hold countless worlds. " +
        "What am I?\""
    );
    clearChoices();
    addChoice("Space", () => {
        riddleSolved = true;
        showStory(
            "Correct! The terminal unlocks an emergency access route.\n\n" +
            "The research logs reveal that the mysterious signal originates deep beneath the Moon's surface."
        );
        clearChoices();
        addChoice("Continue To Emergency Area", showEmergencyArea);
        addChoice("Return To Research Lab", showResearchLab);
    });
    addChoice("The Sun", () => wrongRiddleAnswer());
    addChoice("Earth", () => wrongRiddleAnswer());
    addInventoryChoice(solveResearchRiddle);
}

function wrongRiddleAnswer() {
    playerHealth = Math.max(0, playerHealth - 10);
    showStory(
        "Incorrect! The terminal rejects your answer.\n\n" +
        "You lose 10 health."
    );
    updateStatus();
    clearChoices();
    if (checkSurvival()) return;
    addChoice("Try Again", solveResearchRiddle);
    addChoice("Return To Research Junction", enterResearchJunction);
}

function showEmergencyArea() {
    if (!gameStarted || gameOver) return;
    currentRoom = "Emergency Area";
    emergencyVisited = true;
    if (!riddleSolved) {
        showStory(
            "The emergency access route remains locked.\n\n" +
            "You must solve the Research Lab terminal's riddle first."
        );
        clearChoices();
        addChoice("Return To Research Lab", showResearchLab);
        addInventoryChoice(showEmergencyArea);
        return;
    }
    if (!bossDefeated || !inventory.includes("Emergency Access Keycard")) {
        showStory(
            "You reach the Emergency Area, but the security gate remains locked.\n\n" +
            "The emergency terminal requires the Emergency Access Keycard.\n" +
            "The Security Mech may have what you need."
        );
        clearChoices();
        addChoice("Return To Research Junction", enterResearchJunction);
        addChoice("Go To The Security Chamber", showSecurityRoom);
        addInventoryChoice(showEmergencyArea);
        return;
    }
    showStory(
        "You enter the Emergency Area.\n\n" +
        "The Emergency Access Keycard unlocks the final security gate.\n\n" +
        "The emergency systems begin powering up. The mysterious signal continues pulsing beneath the Moon, but you have a chance to escape.\n\n" +
        "The escape route is open."
    );
    clearChoices();
    addChoice("Escape The Facility", escapeFacility);
    addChoice("Review Inventory", () => checkInventory(showEmergencyArea));
}

function escapeFacility() {
    if (!gameStarted || gameOver) return;
    if (!riddleSolved || !bossDefeated ||
        !inventory.includes("Emergency Access Keycard")) {
        showEmergencyArea();
        return;
    }
    if (!launchPowered) {
        oxygen = Math.max(0, oxygen - 20);
        playerHealth = Math.max(0, playerHealth - 15);
        updateStatus();
        if (checkSurvival()) return;
    }
    showStory(
        "The emergency launch sequence begins...\n\n" +
        "The facility falls silent as the escape system prepares."
    );
    clearChoices();
    storyDelay(3000).then(() => {
        gameOver = true;
        showStory(
            "MISSION COMPLETE!\n\n" +
            "You escaped the abandoned NASA Lunar Research Facility.\n\n" +
            "The signal beneath the Moon remains unexplained.\n\n" +
            "Pilot: " + playerName + "\n" +
            "Health Remaining: " + playerHealth + "\n" +
            "Items Collected: " + inventory.length
        );
        clearChoices();
        addChoice("Play Again", restartGame);
    });
}

function checkInventory(returnAction = showMenu) {
    if (!gameStarted || gameOver) return;
    inventoryReturnAction = returnAction;
    if (inventory.length === 0) {
        showStory("Inventory is Empty");
    } else {
        showStory("Inventory\n\n" + inventory.join("\n"));
    }
    clearChoices();
    if (inventory.includes("Oxygen Canister")) {
        addChoice("Use Oxygen Canister (+30 Oxygen)", useOxygenCanister);
    }
    addChoice("Return", returnFromInventory);
}

function returnFromInventory() {
    if (!gameStarted || gameOver) return;
    inventoryReturnAction();
}

function useOxygenCanister() {
    if (!inventory.includes("Oxygen Canister")) {
        checkInventory(inventoryReturnAction);
        return;
    }
    if (oxygen >= 100) {
        showStory("Your oxygen is already at its maximum.");
        clearChoices();
        addChoice("Return To Inventory", () => checkInventory(inventoryReturnAction));
        return;
    }
    oxygen = Math.min(100, oxygen + 30);
    inventory.splice(inventory.indexOf("Oxygen Canister"), 1);
    showStory("You used the Oxygen Canister. Your oxygen supply improves.");
    updateStatus();
    clearChoices();
    addChoice("Continue", inventoryReturnAction);
    addChoice("Return To Inventory", () => checkInventory(inventoryReturnAction));
}

function viewStats() {
    if (!gameStarted || gameOver) return;
    showStory(
        "Stats\n\n" +
        "Username: " + playerName + "\n" +
        "Health: " + playerHealth + "\n" +
        "Oxygen: " + oxygen + "\n" +
        "Room: " + currentRoom + "\n" +
        "Amount of Items in Inventory: " + inventory.length
    );
    clearChoices();
    addChoice("Return", showMenu);
}

function checkSurvival() {
    updateStatus();
    if (playerHealth <= 0 || oxygen <= 0) {
        endGame();
        return true;
    }
    return false;
}

function endGame() {
    gameOver = true;
    let message = "GAME OVER\n\n";
    if (playerHealth <= 0) {
        message += "Your Health has reached 0.\n";
    } else if (oxygen <= 0) {
        message +=
            "Your oxygen has run out.\n" +
            "The facility's emergency systems cannot sustain you.\n";
    }
    message += "Your Journey has Ended.";
    showStory(message);
    clearChoices();
    addChoice("Restart Game", restartGame);
}

function quitGame() {
    if (!gameStarted || gameOver) return;
    gameOver = true;
    showStory("Thanks For Playing!");
    clearChoices();
    addChoice("Restart Game", restartGame);
}

function restartGame() {
    playerName = "";
    playerHealth = 100;
    oxygen = 100;
    inventory = [];
    currentRoom = "Airlock";

    gameStarted = false;
    gameOver = false;

    airlockVisited = false;
    airlockExplored = false;
    storageExplored = false;
    maintenanceExplored = false;
    maintenanceCleared = false;
    junctionVisited = false;
    powerRoomVisited = false;
    powerRoomEntered = false;
    securityVisited = false;
    bossDefeated = false;
    researchVisited = false;
    riddleSolved = false;
    emergencyVisited = false;
    securityWeakened = false;
    launchPowered = false;
    surveillancePower = 100;
    surveillanceRecordings = [];

    inventoryReturnAction = showMenu;

    nameForm.hidden = false;
    nameInput.value = "";

    clearChoices();

    showStory("Initializing Emergency System...");

    updateStatus();
    nameInput.focus();
}

// ---------------- Initialize ----------------

nameForm.addEventListener("submit", beginGame);
updateStatus();
showStory("Initializing Emergency System...");