import random
import time

# ----------------- Variables -----------------

player_name = ""
player_health = 100
oxygen = 100

inventory = []

has_access_keycard = False
current_room = "Airlock"
game_running = True
airlock_explored = False
storage_explored = False
maintenance_explored = False
boss_defeated = False
riddle_solved = False
security_weakened = False
launch_powered = False
surveillance_reviewed = False
junction_intro_shown = False
power_system_completed = False

rooms = [
    "Airlock",
    "Storage Bay",
    "Maintenance Tunnel",
    "Research Junction",
    "Power Control Room",
    "Security Chamber",
    "Research Lab",
    "Emergency Area"
]

items = [
    "Medical Nanogel",
    "Plasma Cutter",
    "Energy Shield",
]

enemies = [
    "Security Drone!",
    "Maintenance Robot!",
    "Defense Robot!",
    "Rogue Drone!"
]

# ---------------- Introduction ----------------

print("---------------------------------------")
print("          ESCAPE THE FACILITY           ")
print("---------------------------------------")

# ----------------- Functions -----------------

def show_intro():
    story_print("You Wake Up Alone Inside An Abandoned NASA Lunar Research Facility.", 2)
    story_print("It Has Lost Contact With Earth, And The Emergency Systems Are Failing.", 2)
    story_print("Explore The Facility, Survive Its Security Systems, Find The Emergency Access Keycard, And Escape.", 3)


def create_player():
    player_name = input("\nPlayer Name: ")
    print("\nStarting Stats")
    print(f"Player Name: {player_name}")
    print("Health = 100")
    print("Oxygen = 100")
    return player_name


def show_menu():
    print("\n==================")
    print("     MAIN MENU    ")
    print("==================")
    print("1 : Explore")
    print("2 : Inventory")
    print("3 : Stats")
    print("4 : Quit")

def pause_menu():
    global game_running
    while game_running:
        show_menu()
        menu_choice = input("\nEnter Choice = ")
        if menu_choice == "1":
            return
        elif menu_choice == "2":
            check_inventory()
        elif menu_choice == "3":
            view_stats()
        elif menu_choice == "4":
            game_running = False
            print("Thanks for Playing!")
            return
        else:
            print("ERROR : Please Enter A Valid Number!")

def explore():
    global current_room
    global storage_explored
    global airlock_explored
    global maintenance_explored
    global oxygen
    global player_health
    global junction_intro_shown
    global power_system_completed
    if not airlock_explored:
        story_print("\nYou enter the abandoned NASA airlock. Emergency lights flicker above you.", 2)
        story_print("The facility is silent. A damaged storage bay is nearby, while a maintenance tunnel leads deeper into the station.", 3)
    print("\nOption 1 : Search The Airlock")
    print("Option 2 : Enter The Storage Bay")
    print("Option 3 : Step Into The Maintenance Tunnel")
    while game_running:
        user_input_explore = input("\nEnter Choice = ")
        if user_input_explore == "1":
            if airlock_explored:
                print("You have already searched the Airlock.")
            else:
                print("\nYou search the Airlock...")
                story_print("\n--- RECOVERED CREW LOG ---")
                story_print("Research Station - Day 17")
                story_print("The signal beneath the lunar surface has changed.", 2)
                story_print("It now responds whenever we transmit.", 2)
                story_print("--- END OF CREW LOG ---")
                find_item()
                airlock_explored = True
                break
        elif user_input_explore == "2":
            if storage_explored:
                print("You have already searched the Storage Bay.")
            else:
                current_room = "Storage Bay"
                oxygen = max(0, oxygen - 10)
                check_oxygen()
                if not game_running:
                    break
                print("\nYou enter the Storage Bay...")
                story_print("\n--- RECOVERED CREW LOG ---")
                story_print("Research Station - Day 19")
                story_print("We have been ordered to evacuate.", 2)
                story_print("Several crew members are still missing.", 2)
                story_print("--- END OF CREW LOG ---")
                search_storage_bay = random.choice(items + enemies)
                if search_storage_bay in items:
                    find_item(True)
                else:
                    encounter_enemy()
                storage_explored = True
                break
        elif user_input_explore == "3":
            current_room = "Maintenance Tunnel"
            oxygen = max(0, oxygen - 10)
            check_oxygen()
            if not game_running:
                    break
            print("\nYou step into the Maintenance Tunnel...")
            story_print("\n--- RECOVERED CREW LOG ---")
            story_print("Research Station - Day 21")
            story_print("The security robots are malfunctioning.", 2)
            story_print("One attacked a technician without warning.", 2)
            story_print("--- END OF CREW LOG ---")
            story_print("\nThe tunnel is dark and filled with damaged cables. Suddenly, something moves in the darkness.", 3)
            story_print("\nCLANG!", 2)
            story_print("A security machine emerges from the shadows.", 2)
            encounter_enemy()
            current_room = "Research Junction"
            break
        else:
            print("ERROR : Please Enter A Valid Number")
    if current_room == "Research Junction" and game_running:
        if not power_system_completed:
            current_room = "Power Control Room"
            oxygen = max(0, oxygen - 10)
            check_oxygen()
            if not game_running:
                return
            power_system()
            power_system_completed = True
            current_room = "Research Junction"
        if not junction_intro_shown:
            story_print("\nYou arrive at the Research Junction.")
            surveillance_system()
            story_print("A warning light flashes above you. Two corridors branch off ahead.")
            story_print("The left corridor leads towards the Security Chamber.")
            story_print("The right corridor leads towards the Research Lab.")
            junction_intro_shown = True
        while game_running:
            choice = input("\nSecurity OR Research? = ").strip().lower()
            if choice == "menu":
                pause_menu()
                if not game_running:
                    break
                continue
            if choice == "security":
                if boss_defeated:
                    print("\nThe Security Mech has already been defeated.")
                    print("You already have the Emergency Access Keycard.")
                else:
                    current_room = "Security Chamber"
                    oxygen = max(0, oxygen - 10)
                    check_oxygen()
                    if not game_running:
                        break
                    print("\nYou enter the Security Chamber.")
                    story_print("--- SECURITY RECORDING ---")
                    story_print("Research Station - Day 24")
                    story_print("Emergency lockdown activated.", 2)
                    story_print("The Security Mech now treats all unauthorized personnel as threats.", 2)
                    story_print("--- END OF RECORDING ---")
                    print("\nThe doors lock behind you.")
                    boss_fight()
                    if game_running:
                        current_room = "Research Junction"
                        print("You return to the Research Junction.")
                        print("The Security Chamber is now silent.")
            elif choice == "research":
                current_room = "Research Lab"
                oxygen = max(0, oxygen - 10)
                check_oxygen()
                if not game_running:
                    break
                story_print("You enter the Research Lab.")
                story_print("\n--- CLASSIFIED DOCUMENT ---")
                story_print("Research Station - Day 25")
                story_print("The signal responds to our transmissions.", 2)
                story_print("Its origin remains unknown. Further experiments are suspended.", 2)
                story_print("--- END OF DOCUMENT ---")
                story_print("\nBroken equipment covers the room.")
                story_print("A damaged computer terminal flickers in the corner.")
                story_print("A strange message appears on the screen.", 2)
                if riddle():
                    current_room = "Emergency Area"
                    print("The emergency access system activates.")
                    print("A large blast door opens at the end of the laboratory.")
                    print("Beyond it, you see the Emergency Launch Area.")
                    story_print("\n--- INCOMING TRANSMISSION ---")
                    story_print("Research Station - Day 25")
                    story_print("The signal is still transmitting.", 2)
                    story_print("Wait... it just repeated our emergency identification code.", 3)
                    story_print("--- END OF TRANSMISSION ---")
                    if has_access_keycard == True:
                        if launch_powered:
                            print("\nYou use the keycard and activate the Emergency Launch System.")
                            print("The system powers up around you.")
                            print("You launch away from the Moon before the facility shuts down.")
                            ending()
                            break
                        else:
                            print("\nYou use the keycard and enter the Emergency Launch Area.")
                            print("The Emergency Launch System is offline.")
                            print("\nWARNING: Manual Launch Procedure Required")
                            print("The facility's oxygen and power systems are rapidly failing.")
                            oxygen = max(0, oxygen - 20)
                            player_health = max(0, player_health - 15)
                            print("\nYou manually restart the emergency launch systems.")
                            print("Health: -15")
                            print("Oxygen: -20")
                            print("Current Health =", player_health)
                            print("Current Oxygen =", oxygen)
                            check_oxygen()
                            if not game_running:
                                break
                            if player_health <= 0:
                                game_over()
                                break
                            print("\nThe emergency launch system finally activates.")
                            print("You launch away from the Moon just before the facility shuts down.")
                            ending()
                            break
                    else:
                        print("\nYou find a locked exit! You need the emergency access keycard from Security.")
                if not game_running:
                    break
            else:
                print("ERROR : Please Enter Security or Research")

def find_item(storage_bay = False):
    global player_health
    global oxygen
    while True:
        print("\nChoose an item!")
        print("1 : Medical Nanogel")
        print("2 : Plasma Cutter")
        print("3 : Energy Shield")
        if storage_bay:
            print("4 : Oxygen Canister")
        user_choice_item = input("\nEnter Choice = ")
        if user_choice_item == "1":
            print("\nYou have chosen Medical Nanogel!")
            print("PLayer Health : +50")
            player_health = player_health + 50
        elif user_choice_item == "2":
            if "Plasma Cutter" in inventory:
                print("You have already found the Plasma Cutter!")
                continue
            else:
                print("\nYou have chosen a Plasma Cutter!")
                inventory.append("Plasma Cutter")
        elif user_choice_item == "3":
            if "Energy Shield" in inventory:
                print("You have already found the Energy Shield!")
                continue
            else:
                print("\nYou have chosen an Energy Shield!")
                inventory.append("Energy Shield")
        elif user_choice_item == "4" and storage_bay:
            if "Oxygen Canister" in inventory:
                print("You have already found the Oxygen Canister!")
                continue
            else:
                print("You have found an Oxygen Canister!")
                inventory.append("Oxygen Canister")
        else:
            print("\nERROR : Please Enter a Valid Number")
            continue
        break

def encounter_enemy():
    global player_health
    global oxygen
    enemy_that_is_chosen = random.choice(enemies)
    story_print("\nYou Have Come Across A " + enemy_that_is_chosen, 2)
    if enemy_that_is_chosen == "Security Drone!":
        enemy_that_is_chosen_health = 30
        print("Enemy Health = ", enemy_that_is_chosen_health)
    elif enemy_that_is_chosen == "Maintenance Robot!":
        enemy_that_is_chosen_health = 50
        print("Enemy Health = ", enemy_that_is_chosen_health)
    elif enemy_that_is_chosen == "Defense Robot!":
        enemy_that_is_chosen_health = 20
        print("Enemy Health = ", enemy_that_is_chosen_health)
    else:
        enemy_that_is_chosen_health = 40
        print("Enemy Health = ", enemy_that_is_chosen_health)
    while enemy_that_is_chosen_health > 0 and player_health > 0 and game_running:
        user_choice_in_combat = input("\nAttack OR Defense = ").strip().lower()
        if user_choice_in_combat == "menu":
            pause_menu()
            if not game_running:
                break
            continue
        if user_choice_in_combat == "attack":
            if "Plasma Cutter" in inventory:
                enemy_that_is_chosen_health = enemy_that_is_chosen_health - 25
                oxygen = max(0, oxygen - 5)
                check_oxygen()
                if not game_running:
                    break
                player_health = max(0, player_health - 10)
                print("Enemy Health:", enemy_that_is_chosen_health, "| Your Health:", player_health, "| Oxygen:", oxygen)
            else:
                enemy_that_is_chosen_health = enemy_that_is_chosen_health - 15
                oxygen = max(0, oxygen - 5)
                check_oxygen()
                if not game_running:
                    break
                player_health = max(0, player_health - 10)
                print("Enemy Health:", enemy_that_is_chosen_health, "| Your Health:", player_health, "| Oxygen:", oxygen)
        elif user_choice_in_combat == "defense":
            if "Energy Shield" not in inventory:
                player_health = max(0, player_health - 5)
            oxygen = min(100, oxygen + 3)
            print("Enemy Health:", enemy_that_is_chosen_health, "| Your Health:", player_health, "| Oxygen:", oxygen)
        else:
            print("ERROR : Please Enter A Valid Option")
        if player_health <= 0:
            game_over()
            break
        elif enemy_that_is_chosen_health <= 0:
            story_print("\nYou Defeated The Enemy!", 2)
            break

def boss_fight():
    global player_health
    global has_access_keycard
    global boss_defeated
    global oxygen
    global security_weakened
    global surveillance_reviewed
    warning_available = surveillance_reviewed
    first_turn = True
    story_print("\nThe room falls silent.")
    story_print("A red warning light begins flashing.")
    story_print("A large security mech powers on in the center of the chamber.")
    story_print("\"UNAUTHORIZED PERSONNEL DETECTED.\"")
    story_print("\"SECURITY PROTOCOL INITIATED.\"")
    story_print("The Security Mech raises its weapons. The battle begins!")
    if security_weakened:
        boss_health = 75
    else:
        boss_health = 100
    while boss_health >0 and player_health >0 and game_running:
        user_choice_boss = input("Attack OR Defense = ").strip().lower()
        if user_choice_boss == "menu":
            pause_menu()
            if not game_running:
                break
            continue
        if user_choice_boss == "attack":
            warning_available = False
            first_turn = False
            if "Plasma Cutter" in inventory:
                boss_health = boss_health - 30
                oxygen = max(0, oxygen - 5)
                check_oxygen()
                if not game_running:
                    break
                player_health = max(0,player_health - 20)
                print("Boss Health:", boss_health, "| Your Health:", player_health, "| Oxygen:", oxygen)
            else:
                boss_health = boss_health - 20
                oxygen = max(0, oxygen - 5)
                check_oxygen()
                if not game_running:
                    break
                player_health = max(0, player_health - 20)
                print("Boss Health:", boss_health, "| Your Health:", player_health, "| Oxygen:", oxygen)
        elif user_choice_boss == "defense":
            if warning_available and first_turn:
                print("\nYou anticipate the Mech's attack!")
                print("You dodge its first strike.")
                warning_available = False
            elif "Energy Shield" not in inventory:
                player_health = max(0, player_health - 10)
            oxygen = min(100, oxygen + 3)
            first_turn = False
            print("Boss Health:", boss_health, "| Your Health:", player_health, "| Oxygen:", oxygen)
        else:
            print("ERROR : Please Enter A Valid Option")
        if player_health <= 0:
            game_over()
            break
        elif boss_health <= 0:
            print("\nThe Final Boss Has Been Defeated!")
            print("You Have The Emergency Access Keycard.")
            has_access_keycard = True
            boss_defeated = True
            inventory.append("Emergency Access Keycard")
            break

def check_inventory():
    if not inventory:
        print("\nInventory is Empty")
    else:
        print("\nInventory")
        for item in inventory:
            print(item)
        if "Oxygen Canister" in inventory:
            use_canister = input("\nUse Oxygen Canister? (yes/no) = ").strip().lower()
            if use_canister == "yes":
                global oxygen
                oxygen = min(100, oxygen + 30)
                inventory.remove("Oxygen Canister")
                print("You used the Oxygen Canister")
                print("Oxygen: +30")
                print("Current Oxygen:", oxygen)

def view_stats():
    print("\nStats")
    print("Username: ", player_name)
    print("Health:", player_health)
    print("Oxygen:", oxygen)
    print("Room: ", current_room)
    amount_of_items_in_inventory = len(inventory)
    print("Amount of Items in Inventory: ", amount_of_items_in_inventory)
    if has_access_keycard:
        print("You have the emergency access keycard!")
    else:
        print("You do not have the emergency access keycard!")

def check_oxygen():
    global game_running
    if oxygen <= 0:
        game_over()

def game_over():
    global game_running
    story_print("\n     GAME OVER", 2)
    if player_health <= 0:
        story_print("\nYour Health has reached 0.", 2)
    elif oxygen <= 0:
        story_print("Your oxygen has run out.", 2)
        story_print("The facility's emergency systems cannot sustain you.", 2)
    story_print("Your Journey has Ended.", 2)
    game_running = False

def ending():
    global game_running
    story_print("\nYOU HAVE ESCAPED!", 2)
    story_print("\nYou have the emergency access keycard.")
    story_print("Remaining Health: ", player_health)
    amount_of_items_in_inventory_2 = len(inventory)
    story_print("You collected", amount_of_items_in_inventory_2, "items!")
    story_print("\nCONGRATULATIONS", 2)
    game_running = False

def riddle():
    global riddle_solved
    global player_health
    if riddle_solved:
        print("You have already solved the lock!")
        return True
    story_print("You approach the damaged computer terminal.")
    story_print("A message appears on the screen.")
    story_print("\n\"I have no atmosphere, yet I surround you.\"", 2)
    story_print("\"I have no gravity, yet I hold countless worlds.\"", 2)
    story_print("\nType 'back' if you want to leave.")
    while game_running:
        answer = input("\nWhat am I? = ").strip().lower()
        if answer == "menu":
            pause_menu()
            if not game_running:
                break
            continue
        if answer == "space":
            print("\nThe computer terminal unlocks the emergency access system...")
            riddle_solved = True
            return True
        elif answer == "back":
            print("You step away from the computer terminal and return to the Research Junction.")
            return False
        else:
            print("\nThe computer rejects your answer.")
            print("\nA jolt of electricity shoots through your body.")
            player_health = max(0, player_health - 10)
            print("Player Health: -10")
            print(f"Player Health: {player_health}")
            if player_health <= 0:
                game_over()
                return False

def power_system():
    global oxygen
    global security_weakened
    global launch_powered
    print("\nYou enter the Power Control Room.")
    print("The facility's main power system is failing.")
    story_print("\n--- INCIDENT REPORT ---")
    story_print("Research Station - Day 23")
    story_print("The power surge began during the signal experiment.", 2)
    story_print("Someone has changed the system logs.", 2)
    story_print("--- END OF REPORT ---")
    print("\nThree systems are offline.")
    print("\n1 : Restore Life Support")
    print("2 : Restore Security Systems")
    print("3 : Restore Emergency Launch Systems")
    while game_running:
        choice = input("\nWhich system do you restore? = ").strip().lower()
        if choice == "menu":
            pause_menu()
            if not game_running:
                break
            continue
        elif choice == "1":
            print("\nYou restore power to the Life Support System.")
            print("The facility's oxygen systems stabilize.")
            oxygen = min(100, oxygen + 30)
            print("Oxygen: +30")
            print("Current Oxygen =", oxygen)
            return
        elif choice == "2":
            print("\nYou restore power to the Security Systems.")
            print("The facility's security systems come back online.")
            security_weakened = True
            return
        elif choice == "3":
            print("\nYou restore power to the Emergency Launch System.")
            print("The emergency launch system begins powering up.")
            launch_powered = True
            return
        else:
            print("ERROR : Please Enter a Valid Number")

def surveillance_system():
    global surveillance_reviewed
    story_print("\n--- SURVEILLANCE SYSTEM ---")
    story_print("The security monitors flicker back to life.")
    story_print("Camera footage from Day 24 appears on the screen.")
    story_print("\nFootage: The Security Mech activates during the lockdown.", 2)
    story_print("It ignores the evacuation order and seals the facility.", 2)
    print("\n1 : Review Security Footage")
    print("2 : Continue")
    while True:
        surveillance_choice = input("\nEnter Choice = ")
        if surveillance_choice == "1":
            story_print("\nYou review the damaged footage.")
            story_print("The Mech pauses briefly before every heavy attack.", 2)
            story_print("You may be able to use that moment to defend yourself.", 2)
            surveillance_reviewed = True
            break
        elif surveillance_choice == "2":
            story_print("You ignore the monitors and continue.")
            break
        else:
            print("ERROR : Please Enter A Valid Number")

def story_print(message, delay = 1.5):
    print(message)
    time.sleep(delay)

# ---------------- Main Game ----------------

show_intro()
player_name = create_player()
while game_running:
    show_menu()
    choice = input("\nEnter Choice = ")
    if choice == "1":
        explore()
    elif choice == "2":
        check_inventory()
    elif choice == "3":
        view_stats()
    elif choice == "4":
        game_running = False
        print("\nThanks For Playing!")
    else:
        print("ERROR : Please Enter A Valid Number")