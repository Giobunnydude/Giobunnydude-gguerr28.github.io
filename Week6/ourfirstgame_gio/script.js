"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const maxHp = 40;
    const maxEnemyHp = 40;
    const maxMagic = 3;
    const redirectDelay = 2800;
    const state = {
        playerHp: maxHp,
        enemyHp: maxEnemyHp,
        magic: 0,
        items: { lemonade: 2, berry: 1 },
        finished: false
    };

    const elements =
    {
        greeting: document.querySelector("#greeting"),
        battleLog: document.querySelector("#battle-log"),
        turnTitle: document.querySelector("#turn-title"),
        enemyHpText: document.querySelector("#enemy-hp-text"),
        playerHpText: document.querySelector("#player-hp-text"),
        enemyHealthBar: document.querySelector("#enemy-health-bar"),
        playerHealthBar: document.querySelector("#player-health-bar"),
        enemyHealthFill: document.querySelector("#enemy-health-fill"),
        playerHealthFill: document.querySelector("#player-health-fill"),
        magicText: document.querySelector("#magic-text"),
        magicBar: document.querySelector("#magic-bar"),
        magicFill: document.querySelector("#magic-fill"),
        fightButton: document.querySelector("#fight-button"),
        powerButton: document.querySelector("#power-button"),
        powerCaption: document.querySelector("#power-caption"),
        itemButton: document.querySelector("#item-button"),
        itemSelect: document.querySelector("#item-select"),
        itemCount: document.querySelector("#item-count"),
        arenaHint: document.querySelector(".arena-hint"),
        arena: document.querySelector("#battle-arena"),
        overlay: document.querySelector("#result-overlay"),
        resultEyebrow: document.querySelector("#result-eyebrow"),
        resultTitle: document.querySelector("#result-title"),
        resultCopy: document.querySelector("#result-copy")
    };

    const defaultArenaHint = "TIP: HOVER OR FOCUS ON A CRITTER FOR A MESSAGE";

    function ensureGreeting()
    {
        if (elements.greeting) return;
        const heading = document.querySelector(".battle-heading h1");
        if (!heading) return;

        elements.greeting = document.createElement("p");
        elements.greeting.id = "greeting";
        elements.greeting.className = "battle-greeting";
        elements.greeting.setAttribute("aria-live", "polite");
        heading.insertAdjacentElement("afterend", elements.greeting);
    }

    function ensureArenaHint()
    {
        if (elements.arenaHint || !elements.arena) return;
        elements.arenaHint = document.createElement("p");
        elements.arenaHint.className = "arena-hint";
        elements.arenaHint.setAttribute("aria-live", "polite");
        elements.arenaHint.textContent = defaultArenaHint;
        elements.arena.append(elements.arenaHint);
    }

    function getItemName(value)
    {
        const option = Array.from(elements.itemSelect.options).find((item) => item.value === value);
        return option ? option.textContent.split("·")[0].trim() : value;
    }

    function setGreeting()
    {
        if (!elements.greeting) return;
        const hour = new Date().getHours();
        const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
        elements.greeting.textContent = `Good ${timeOfDay}, Squirts. The gator is already in the road.`;
    }

    function render()
    {
        elements.playerHpText.textContent = `${state.playerHp} / ${maxHp} HP`;
        elements.enemyHpText.textContent = `${state.enemyHp} / ${maxEnemyHp} HP`;
        elements.playerHealthFill.style.width = `${(state.playerHp / maxHp) * 100}%`;
        elements.enemyHealthFill.style.width = `${(state.enemyHp / maxEnemyHp) * 100}%`;
        elements.playerHealthBar.setAttribute("aria-valuenow", String(state.playerHp));
        elements.enemyHealthBar.setAttribute("aria-valuenow", String(state.enemyHp));
        elements.magicText.textContent = `${state.magic} / ${maxMagic} charges`;
        elements.magicFill.style.width = `${(state.magic / maxMagic) * 100}%`;
        elements.magicBar.setAttribute("aria-valuenow", String(state.magic));
        elements.powerButton.disabled = state.magic < maxMagic || state.finished;
        elements.powerCaption.textContent = state.magic < maxMagic
            ? `Needs ${maxMagic - state.magic} more charge${maxMagic - state.magic === 1 ? "" : "s"}`
            : "Ready · spend 3 charges";
        elements.itemCount.textContent = `${state.items.lemonade} Lemonade · ${state.items.berry} ${getItemName("berry")}`;
        elements.fightButton.disabled = state.finished;
        elements.itemButton.disabled = state.finished;
    }

    function announce(message)
    {
        elements.battleLog.textContent = message;
        elements.turnTitle.textContent = "Your turn, Squirts!";
    }

    function finishBattle(playerWon)
    {
        if (state.finished) return;
        state.finished = true;
        render();
        elements.overlay.hidden = false;
        elements.resultEyebrow.textContent = playerWon ? "Killer Gator: SOLVED" : "FLORIDA: 1 · SQUIRTS: 0";
        elements.resultTitle.textContent = playerWon ? "You beat the gator!" : "The Gator has eaten";
        elements.resultCopy.textContent = playerWon
            ? "Lets go home squirts!"
            : "The Gator is full and walks off back into the swamp";
        elements.overlay.querySelector(".result-card").focus();
        window.setTimeout(() =>
        {
            window.location.href = "./index.html";
        }, redirectDelay);
    }

    function enemyTurn()
    {
        if (state.finished) return;
        const damage = Math.floor(Math.random() * 3) + 8;
        state.playerHp = Math.max(0, state.playerHp - damage);
        render();

        if (state.playerHp === 0)
        {
            announce(`The gator dealt ${damage} damage. Squirts is out of HP!`);
            finishBattle(false);
            return;
        }

        announce(`The gator dealt ${damage} damage. Your move, Squirts!`);
    }

    function damageEnemy(damage, moveName)
    {
        state.enemyHp = Math.max(0, state.enemyHp - damage);
        render();
        if (state.enemyHp === 0)
        {
            announce(`${moveName} dealt ${damage} damage. The gator is out of HP!`);
            finishBattle(true);
            return true;
        }
        return false;
    }

    function useFight()
    {
        if (state.finished) return;
        state.magic = Math.min(maxMagic, state.magic + 1);
        const won = damageEnemy(8, "Fight");
        if (won) return;
        announce("Squirts fought back for 8 damage and gained 1 magic charge. Your move!");
        enemyTurn();
    }

    function usePower()
    {
        if (state.finished || state.magic < maxMagic) return;
        state.magic = 0;
        const won = damageEnemy(18, "Florida Man Shave");
        if (won) return;
        announce("Squirts used Florida Man Shave for 18 damage! Your magic needs to recharge.");
        enemyTurn();
    }

    function useItem()
    {
        if (state.finished) return;
        const item = elements.itemSelect.value;
        const itemName = getItemName(item);
        if (state.items[item] < 1)
        {
            announce(`You're out of ${itemName}. Choose another item!`);
            return;
        }
        if (item === "lemonade" && state.playerHp === maxHp)
        {
            announce("Squirts is already at full HP. Save that Lemonade for later!");
            return;
        }

        state.items[item] -= 1;
        if (item === "berry")
        {
            state.magic = maxMagic;
            render();
            announce(`${itemName} power! Squirts is fully charged. Unleash Florida Man Shave!`);
        } else {
            const restored = Math.min(10, maxHp - state.playerHp);
            state.playerHp += restored;
            render();
            announce(`Lemonade restored ${restored} HP to Squirts. Florida heat is no joke!`);
        }
        enemyTurn();
    }

    function updateItemSelection()
    {
        const itemName = getItemName(elements.itemSelect.value);
        elements.itemButton.setAttribute("aria-label", `Use ${itemName}`);
    }

    function showSpriteGreeting(event)
    {
        if (!elements.arenaHint) return;
        const target = event.target.closest(".sprite-hover-target");
        if (!target || !elements.arena.contains(target)) return;
        const isEnemy = target.id === "enemy-sprite";
        elements.arenaHint.textContent = isEnemy
            ? "THE GATOR HAS RIGHT OF WAY. for some reason"
            : "SQUIRTS IS READY TO FIGHT. he's scared though";
    }

    function resetSpriteGreeting(event)
    {
        if (!elements.arenaHint) return;
        const nextTarget = event.relatedTarget instanceof Element
            ? event.relatedTarget.closest(".sprite-hover-target")
            : null;
        if (nextTarget) return;
        elements.arenaHint.textContent = defaultArenaHint;
    }

    ensureGreeting();
    ensureArenaHint();
    setGreeting();
    render();
    updateItemSelection();

    elements.fightButton.addEventListener("click", useFight);
    elements.powerButton.addEventListener("click", usePower);
    elements.itemButton.addEventListener("click", useItem);
    elements.itemSelect.addEventListener("change", updateItemSelection);
    elements.arena.addEventListener("pointerover", showSpriteGreeting);
    elements.arena.addEventListener("pointerout", resetSpriteGreeting);
    elements.arena.addEventListener("focusin", showSpriteGreeting);
    elements.arena.addEventListener("focusout", resetSpriteGreeting);
});
