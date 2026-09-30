/* ============================================================
 * ho_mod.js —— 降妖战斗总模块（照抄 gooboo modules/horde.js）
 * 机械变换：去 import；数据名以 IIFE 参数注入；`store`->`HOSTORE`。
 * ============================================================ */

const HO_MODULE = (function(achievement, heirloom, equipment, relic, sigil, upgrade, upgrade2, upgradePremium, upgradePrestige, tower, warzone, loveIsland, monkeyJungle, battlePass, archer, mage, knight, assassin, shaman, pirate, undead, cultist, scholar, adventurer, enemyType, boss, trinket, sigil_boss, element) {
function playerDie() {
    if (HOSTORE.state.horde.player.revive) {
        HOSTORE.commit('horde/updatePlayerKey', {key: 'health', value: HOSTORE.state.horde.cachePlayerStats.health});
        HOSTORE.commit('horde/updatePlayerKey', {key: 'revive', value: HOSTORE.state.horde.player.revive - 1});

        const reviveDivShield = HOSTORE.getters['tag/values']('hordeReviveDivisionShield')[0];
        if (reviveDivShield > 0 && HOSTORE.state.horde.player.divisionShield < HOSTORE.getters['mult/get']('hordeDivisionShield')) {
            HOSTORE.commit('horde/updatePlayerKey', {key: 'divisionShield', value: HOSTORE.state.horde.player.divisionShield +
                Math.ceil((HOSTORE.getters['mult/get']('hordeDivisionShield') - HOSTORE.state.horde.player.divisionShield) * reviveDivShield)
            });
        }

        return false;
    } else {
        HOSTORE.commit('horde/updatePlayerKey', {key: 'health', value: 0});
        HOSTORE.commit('horde/updateKey', {key: 'combo', value: 0});
        HOSTORE.commit('horde/updateKey', {key: 'bossStage', value: 0});
        HOSTORE.commit('horde/updateKey', {key: 'bossFight', value: false});
        HOSTORE.commit('horde/updateKey', {key: 'playerBuff', value: {}});
        HOSTORE.dispatch('horde/updatePlayerCache');

        HOSTORE.commit('horde/updateKey', {key: 'enemy', value: null});

        if (HOSTORE.state.horde.currentTower !== null) {
            // No respawn time for tower deaths
            HOSTORE.commit('horde/updateKey', {key: 'currentTower', value: null});
            HOSTORE.commit('horde/updateKey', {key: 'towerFloor', value: 0});
            HOSTORE.dispatch('horde/resetStats');
        } else if (HOSTORE.state.horde.raidboss) {
            // No respawn time for raid deaths
            HOSTORE.commit('horde/updateKey', {key: 'raidboss', value: false});
            HOSTORE.dispatch('horde/getRaidbossReward');
            HOSTORE.dispatch('horde/resetStats');
        } else {
            const respawnTimer = HOSTORE.getters['mult/get']('hordeRespawn', HOSTORE.getters['horde/baseRespawnTime']);
            HOSTORE.commit('horde/updateKey', {key: 'respawn', value: respawnTimer});
            HOSTORE.commit('horde/updateKey', {key: 'maxRespawn', value: respawnTimer});
        }
        return true;
    }
}

function tickEnemyRespawn(seconds = 1) {
    HOSTORE.commit('horde/updateKey', {key: 'enemyTimer', value: Math.min(seconds * (HOSTORE.state.horde.skillLevel.sneak >= 1 ? 2 : 1) + HOSTORE.state.horde.enemyTimer, HORDE_ENEMY_RESPAWN_TIME * HORDE_ENEMY_RESPAWN_MAX)});
    if (HOSTORE.getters['horde/canCollectRareLoot']) {
        HOSTORE.commit('horde/updateKey', {key: 'rareLootTimer', value: Math.min(seconds / HOSTORE.getters['mult/get']('hordeRareLootTime') + HOSTORE.state.horde.rareLootTimer, HORDE_RARE_LOOT_HOLD)});
    }
}

function getDamage(amount, type, offender, defender) {
    return amount * offender[type + 'Attack'] * defender[type + 'Taken'];
}

function applyCritEffects(amount) {
    const energyOnCrit = HOSTORE.getters['tag/values']('hordeEnergyOnCrit')[0];
    const healOnCrit = HOSTORE.getters['tag/values']('hordeHealOnCrit')[0];
    const restoreCooldownOnCrit = HOSTORE.getters['tag/values']('hordeRestoreCooldownOnCrit')[0];
    const bloodOnCrit = HOSTORE.getters['tag/values']('hordeBloodOnCrit')[0];
    const stunOnCrit = HOSTORE.getters['tag/values']('hordeStunOnCrit')[0];

    if (energyOnCrit > 0 && HOSTORE.state.horde.player.energy < HOSTORE.state.horde.cachePlayerStats.energy) {
        HOSTORE.dispatch('horde/updateEnergy', Math.min(HOSTORE.state.horde.player.energy + energyOnCrit * amount, HOSTORE.state.horde.cachePlayerStats.energy));
    }
    if (healOnCrit > 0) {
        HOSTORE.commit('horde/updatePlayerKey', {key: 'health', value: Math.min(HOSTORE.state.horde.cachePlayerStats.health, HOSTORE.state.horde.player.health + HOSTORE.state.horde.cachePlayerStats.health * HOSTORE.state.horde.cachePlayerStats.healing * healOnCrit * amount)});
    }
    if (restoreCooldownOnCrit > 0) {
        tickPlayerCooldowns(restoreCooldownOnCrit * amount);
    }
    if (bloodOnCrit > 0) {
        HOSTORE.dispatch('currency/gain', {feature: 'horde', name: 'blood', gainMult: true, amount: bloodOnCrit * amount * HOSTORE.getters['horde/enemyBlood'](HOSTORE.state.stat.horde_maxDifficulty.value, 0)});
    }
    if (stunOnCrit > 0 && chance(0.05 * amount)) {
        HOSTORE.commit('horde/updateEnemyKey', {key: 'stun', value: HOSTORE.state.horde.enemy.stun + Math.round(stunOnCrit)});
    }
}

function tickPlayerCooldowns(seconds) {
    const hasteMult = HOSTORE.state.horde.cachePlayerStats.haste * 0.01 + 1;
    for (const [key, elem] of Object.entries(HOSTORE.state.horde.items)) {
        if (elem.activeType === 'utility' ? (elem.equipped && !elem.passive) : elem.cooldownLeft > 0) {
            const newCooldown = elem.cooldownLeft - seconds * (elem.activeType === 'combat' ? hasteMult : 1) * ((elem.equipped && !elem.passive) ? 1 : HORDE_INACTIVE_ITEM_COOLDOWN);
            HOSTORE.commit('horde/updateItemKey', {
                name: key,
                key: 'cooldownLeft',
                value: elem.activeType === 'utility' ? newCooldown : Math.max(0, newCooldown)
            });
        }
    }
    for (const [key, elem] of Object.entries(HOSTORE.state.horde.skillActive)) {
        const split = key.split('_');
        let type = null;
        if (split[0] === 'skill') {
            type = HOSTORE.state.horde.fighterClass[HOSTORE.state.horde.selectedClass].skills[split[1]].activeType;
        } else if (split[0] === 'trinket') {
            type = HOSTORE.state.horde.trinket[split[1]].activeType;
        }
        if (elem > 0 || type === 'utility') {
            const newCooldown = elem - seconds * (type === 'combat' ? hasteMult : 1);
            HOSTORE.commit('horde/updateSubkey', {
                name: 'skillActive',
                key,
                value: type === 'utility' ? newCooldown : Math.max(0, newCooldown)
            });
        }
    }
}

const damageTypes = ['physic', 'magic', 'bio'];
const newSimulation = {
    dead: 0,
    time: 0,
    killed: 0,
    damage: 0,
    bone: 0,
    blood: 0,
    monsterPartTime: 0,
    complete: false
};

return {
    name: 'horde',
    tickspeed: 1,
    unlockNeeded: 'hordeFeature',
    forceTick(seconds, oldTime, newTime) {
        const subfeature = HOSTORE.state.system.features.horde.currentSubfeature;

        // Get raid keys
        if (subfeature === 0 && HOSTORE.state.unlock.hordeRaidboss.see) {
            const dayDiff = Math.floor(newTime / SECONDS_PER_DAY) - Math.floor(oldTime / SECONDS_PER_DAY);
            if (dayDiff > 0) {
                HOSTORE.dispatch('currency/gain', {feature: 'horde', name: 'raidKey', amount: dayDiff * HORDE_RAID_KEYS_PER_DAY});
            }
        }

        // Get tower keys
        if (HOSTORE.state.unlock.hordeBrickTower.see) {
            const dayDiff = Math.floor(newTime / (SECONDS_PER_DAY * 7)) - Math.floor(oldTime / (SECONDS_PER_DAY * 7));
            if (dayDiff > 0) {
                HOSTORE.dispatch('currency/gain', {feature: 'horde', name: 'towerKey', amount: dayDiff});
            }
        }
    },
    tick(seconds) {
        HOSTORE.commit('stat/add', {feature: 'horde', name: 'timeSpent', value: seconds});

        const subfeature = HOSTORE.state.system.features.horde.currentSubfeature;

        // Gain mystical shards
        if (subfeature === 0) {
            let secondsLeft = seconds;
            let baseChance = HOSTORE.getters['mult/get']('hordeShardChance');
            let shards = 0;
            while (secondsLeft > 0 && HOSTORE.state.currency.horde_mysticalShard.value < HOSTORE.state.currency.horde_mysticalShard.cap) {
                if (baseChance * secondsLeft >= 1) {
                    // guaranteed shard
                    secondsLeft -= Math.ceil(1 / baseChance);
                    baseChance /= HORDE_SHARD_CHANCE_REDUCTION;
                    shards++;
                } else {
                    if (chance(baseChance * secondsLeft)) {
                        shards++;
                    }
                    secondsLeft = 0;
                }
            }
            if (shards > 0) {
                HOSTORE.dispatch('currency/gain', {feature: 'horde', name: 'mysticalShard', amount: shards});
            }
        }

        // Gain corrupted flesh
        if (HOSTORE.state.unlock.hordeCorruptedFlesh.use) {
            HOSTORE.dispatch('currency/gain', {feature: 'horde', name: 'corruptedFlesh', amount: HOSTORE.getters['mult/get'](`currencyHordeCorruptedFleshGain`) * seconds});
        }

        // Level up player
        if (subfeature === 1) {
            const oldProgress = HOSTORE.state.horde.expLevel;
            let progress = HOSTORE.state.horde.expLevel;
            let secondsLeft = seconds;
            while (secondsLeft > 0) {
                const difficulty = HOSTORE.getters['horde/expDifficulty'](Math.floor(progress));
                const timeUsed = Math.min((Math.floor(progress + 1) - progress) * difficulty, secondsLeft);
                progress += timeUsed / difficulty;
                secondsLeft -= timeUsed;
            }
            HOSTORE.commit('horde/updateKey', {key: 'expLevel', value: progress});
            const newLvl = Math.floor(progress);
            if (newLvl > Math.floor(oldProgress)) {
                HOSTORE.commit('horde/updateKey', {key: 'skillPoints', value: (newLvl - Math.floor(oldProgress)) * HOSTORE.getters['mult/get']('hordeSkillPointsPerLevel') + HOSTORE.state.horde.skillPoints});
                HOSTORE.dispatch('horde/applyClassLevelEffects');

                const classObj = HOSTORE.state.horde.fighterClass[HOSTORE.state.horde.selectedClass];
                if (classObj.questsCompleted.level < classObj.quests.level.length && newLvl >= classObj.quests.level[classObj.questsCompleted.level]) {
                    HOSTORE.commit('horde/updateClassQuestKey', {name: HOSTORE.state.horde.selectedClass, key: 'level', value: classObj.quests.level.filter(el => newLvl >= el).length});
                    HOSTORE.dispatch('horde/applyBattlePassEffects');
                }

                if (newLvl > classObj.highestLevel) {
                    HOSTORE.commit('horde/updateClassKey', {name: HOSTORE.state.horde.selectedClass, key: 'highestLevel', value: newLvl});
                }
            }

            // Boss pass gain
            if (HOSTORE.state.horde.selectedClass === 'pirate') {
                HOSTORE.dispatch('currency/gain', {feature: 'horde', name: 'lockpick', amount: HOSTORE.getters['mult/get'](`currencyHordeLockpickGain`) * seconds});
            }
        }

        // Prepare combat stats
        const playerStats = HOSTORE.state.horde.cachePlayerStats;
        let simulation = {...newSimulation};
        let secondsLeft = seconds;

        // Run combat
        while (secondsLeft > 0) {
            let respawn = HOSTORE.state.horde.respawn;
            let secondsSpent = 0;

            if ((simulation.dead >= 2 && simulation.killed >= 100 || simulation.dead >= 10) && !simulation.complete) {
                // Combat simulation: gain resources based on average
                const simTime = simulation.time + simulation.monsterPartTime;
                let cycles = Math.floor(secondsLeft / simTime) - 1;

                if (cycles > 0) {
                    // Regular drops first
                    if (simulation.bone > 0) {
                        HOSTORE.dispatch('currency/gain', {feature: 'horde', name: 'bone', gainMult: true, amount: cycles * simulation.bone});
                    }
                    if (subfeature === 0 && simulation.monsterPartTime > 0) {
                        HOSTORE.dispatch('currency/gain', {feature: 'horde', name: 'monsterPart', gainMult: true, amount: cycles * simulation.monsterPartTime * HOSTORE.getters['horde/currentMonsterPart']});
                    }
                    if (simulation.blood > 0) {
                        HOSTORE.dispatch('currency/gain', {feature: 'horde', name: 'blood', gainMult: true, amount: cycles * simulation.blood});
                    }
                    HOSTORE.commit('stat/add', {feature: 'horde', name: 'totalDamage', value: cycles * simulation.damage});
                    if (subfeature === 0) {
                        HOSTORE.dispatch('horde/findItems', cycles * simulation.killed);
                    }

                    // Rare loot after
                    secondsSpent = simTime * cycles;
                    const rareLootTime = HOSTORE.getters['mult/get']('hordeRareLootTime');
                    const rareLootTimer = secondsSpent / rareLootTime + HOSTORE.state.horde.rareLootTimer;
                    const rareLootGained = Math.floor(rareLootTimer * Math.min(rareLootTime * simulation.killed / simulation.time, 1));
                    HOSTORE.commit('horde/updateKey', {key: 'rareLootTimer', value: Math.min(rareLootTimer - rareLootGained, HORDE_RARE_LOOT_HOLD)});
                    HOSTORE.dispatch('horde/getRareLootReward', rareLootGained);

                    secondsLeft -= secondsSpent;
                }

                simulation.complete = true;
            } else if (respawn > 0) {
                // Wait for the player to respawn
                secondsSpent = Math.min(respawn, secondsLeft);
                let newRespawn = respawn - secondsSpent;

                tickEnemyRespawn(secondsSpent);
                if (simulation.dead) {
                    simulation.time += secondsSpent;
                }

                HOSTORE.commit('horde/updateKey', {key: 'respawn', value: newRespawn});
                if (newRespawn <= 0) {
                    HOSTORE.dispatch('horde/resetStats');
                }
            } else if (HOSTORE.state.horde.enemy) {
                // Tick enemy cooldowns
                for (const [key, elem] of Object.entries(HOSTORE.state.horde.enemy.active)) {
                    if (elem.cooldown > 0) {
                        HOSTORE.commit('horde/updateEnemyActive', {name: key, key: 'cooldown', value: Math.max(0, elem.cooldown - 1)});
                    }
                }

                const enemyStats = HOSTORE.state.horde.enemy;
                let enemyHealth = enemyStats.health;
                let killEnemy = false;

                // Apply poison damage
                if (enemyStats.poison > 0) {
                    enemyHealth = Math.max(0, enemyHealth - enemyStats.poison);
                }

                if (HOSTORE.state.horde.player.health > 0) {
                    const isStunned = HOSTORE.state.horde.player.stun > 0;

                    // determine if the chosen attack can be used
                    let usedAttack = null;
                    let item = null;
                    let activeMult = 1;
                    if (HOSTORE.state.horde.player.silence > 0) {
                        HOSTORE.commit('horde/updatePlayerKey', {key: 'silence', value: Math.max(0, HOSTORE.state.horde.player.silence - 1 - playerStats.statusResist)});
                    } else if (HOSTORE.state.horde.chosenActive) {
                        if (subfeature === 0) {
                            item = HOSTORE.state.horde.items[HOSTORE.state.horde.chosenActive];
                            if (item.masteryLevel >= 4) {
                                activeMult *= 1.5;
                            }
                        } else if (subfeature === 1) {
                            const split = HOSTORE.state.horde.chosenActive.split('_');
                            if (split[0] === 'skill') {
                                item = HOSTORE.state.horde.fighterClass[HOSTORE.state.horde.selectedClass].skills[split[1]];
                            } else if (split[0] === 'trinket') {
                                item = HOSTORE.state.horde.trinket[split[1]];
                            }
                        }
                        if ((!isStunned || item.usableInStun) && (subfeature === 1 ? HOSTORE.state.horde.skillActive[HOSTORE.state.horde.chosenActive] : item.cooldownLeft) <= 0) {
                            usedAttack = HOSTORE.state.horde.chosenActive;
                        }
                    }

                    if (isStunned) {
                        HOSTORE.commit('horde/updatePlayerKey', {key: 'stun', value: Math.max(0, HOSTORE.state.horde.player.stun - 1 - playerStats.statusResist)});
                    }
                    if (!isStunned || usedAttack) {
                        // PLAYER ATTACK
                        const divisionShieldMult = enemyStats.divisionShield + 1;
                        let damage = 0;
                        let hitShield = false;

                        if (usedAttack && item) {
                            const activeLevel = subfeature === 1 ? (
                                usedAttack.split('_')[0] === 'skill' ? (HOSTORE.state.horde.skillLevel[usedAttack.split('_')[1]] ?? 0) : (HOSTORE.state.horde.trinket[usedAttack.split('_')[1]].level)
                            ) : item.level;
                            const activeCost = item.activeCost !== undefined ? item.activeCost(activeLevel) : {};
                            if (
                                (activeCost.energy === undefined || playerStats.energy >= activeCost.energy) ||
                                (activeCost.mana === undefined || playerStats.mana >= activeCost.mana)
                            ) {
                                item.active(activeLevel).forEach(elem => {
                                    let value = elem.value;
                                    if (elem.str !== undefined) {
                                        value += elem.str * playerStats.strength;
                                    }
                                    if (elem.int !== undefined) {
                                        value += elem.int * playerStats.intelligence;
                                    }
                                    let critEffect = elem.canCrit ?? 0;
                                    if (elem.type === 'heal') {
                                        critEffect = Math.max(critEffect, HOSTORE.getters['tag/values']('hordeActiveHealCrit')[0]);
                                    } else if (elem.type.substring(0, 9) === 'maxdamage' || elem.type.substring(0, 6) === 'damage') {
                                        critEffect = Math.max(critEffect, HOSTORE.getters['tag/values']('hordeActiveDamageCrit')[0]);
                                    }
                                    if (critEffect > 0) {
                                        const crits = Math.max(randomRound(playerStats.critChance + HOSTORE.state.horde.player.nocrit * HOSTORE.getters['tag/values']('hordeCritOnNonCrit')[0]), HOSTORE.state.horde.player.forcecrit > HOSTORE.getters['tag/values']('hordeFirstAttacksCrit')[0] ? 1 : 0);
                                        if (crits > 0) {
                                            value *= playerStats.critMult * critEffect * crits + 1;
                                            applyCritEffects(crits);
                                            HOSTORE.commit('horde/updatePlayerKey', {key: 'nocrit', value: 0});
                                            if (HOSTORE.state.horde.player.forcecrit > HOSTORE.getters['tag/values']('hordeFirstAttacksCrit')[0]) {
                                                HOSTORE.commit('horde/updatePlayerKey', {key: 'forcecrit', value: HOSTORE.state.horde.player.forcecrit + 1});
                                            }
                                        } else {
                                            HOSTORE.commit('horde/updatePlayerKey', {key: 'nocrit', value: HOSTORE.state.horde.player.nocrit + 1});
                                        }
                                    }
                                    if (elem.type === 'heal') {
                                        HOSTORE.commit('horde/updatePlayerKey', {key: 'health', value: Math.min(playerStats.health, HOSTORE.state.horde.player.health + playerStats.health * activeMult * playerStats.healing * value)});
                                    } else if (elem.type === 'refillEnergy') {
                                        HOSTORE.commit('horde/updatePlayerKey', {key: 'energy', value: Math.min(playerStats.energy, HOSTORE.state.horde.player.energy + playerStats.energy * activeMult * value)});
                                    } else if (elem.type === 'refillMana') {
                                        HOSTORE.commit('horde/updatePlayerKey', {key: 'mana', value: Math.min(playerStats.mana, HOSTORE.state.horde.player.mana + playerStats.mana * activeMult * value)});
                                    } else if (elem.type === 'stun') {
                                        HOSTORE.commit('horde/updateEnemyKey', {key: 'stun', value: HOSTORE.state.horde.enemy.stun + Math.round(activeMult * value)});
                                    } else if (elem.type === 'silence') {
                                        HOSTORE.commit('horde/updateEnemyKey', {key: 'silence', value: HOSTORE.state.horde.enemy.silence + Math.round(activeMult * value)});
                                    } else if (elem.type === 'revive') {
                                        HOSTORE.commit('horde/updatePlayerKey', {key: 'revive', value: Math.min(playerStats.revive, HOSTORE.state.horde.player.revive + Math.round(activeMult * value))});
                                    } else if (elem.type === 'reviveAll') {
                                        HOSTORE.commit('horde/updatePlayerKey', {key: 'revive', value: playerStats.revive});
                                    } else if (elem.type === 'divisionShield') {
                                        HOSTORE.commit('horde/updatePlayerKey', {key: 'divisionShield', value: Math.max(Math.min(playerStats.divisionShield, HOSTORE.state.horde.player.divisionShield) + Math.round(activeMult * value), HOSTORE.state.horde.player.divisionShield)});
                                    } else if (elem.type === 'removeDivisionShield') {
                                        HOSTORE.commit('horde/updateEnemyKey', {key: 'divisionShield', value: Math.ceil(HOSTORE.state.horde.enemy.divisionShield * Math.pow(1 - value, activeMult))});
                                    } else if (elem.type === 'removeAttack') {
                                        if (HOSTORE.state.horde.fightRampage <= 0) {
                                            HOSTORE.commit('horde/updateEnemyKey', {key: 'attack', value: Math.max(0, HOSTORE.state.horde.enemy.attack * Math.pow(1 - value, activeMult))});
                                        }
                                    } else if (elem.type === 'poison') {
                                        const poisonDmg = Math.max(0, getDamage(activeMult * value * playerStats.attack, 'bio', playerStats, enemyStats) - enemyStats.defense * enemyStats.maxHealth) / divisionShieldMult;
                                        if (poisonDmg > 0) {
                                            HOSTORE.commit('horde/updateEnemyKey', {key: 'poison', value: poisonDmg + HOSTORE.state.horde.enemy.poison});
                                            hitShield = true;
                                        }
                                    } else if (elem.type === 'antidote') {
                                        HOSTORE.commit('horde/updatePlayerKey', {key: 'poison', value: HOSTORE.state.horde.player.poison * Math.pow(1 - value, activeMult)});
                                    } else if (elem.type === 'removeStun') {
                                        HOSTORE.commit('horde/updatePlayerKey', {key: 'stun', value: 0});
                                    } else if (elem.type === 'buff') {
                                        HOSTORE.dispatch('horde/addBuff', {name: `${ subfeature === 0 ? 'equipment_' : '' }${ usedAttack }`, time: Math.round(activeMult * value), positive: true, effect: elem.effect});
                                    } else if (elem.type.substring(0, 9) === 'maxdamage') {
                                        const maxdamage = Math.max(0, enemyStats.maxHealth * (enemyHealth / enemyStats.maxHealth - playerStats.execute));
                                        damage += getDamage(activeMult * value * maxdamage, elem.type.substring(9).toLowerCase(), playerStats, enemyStats);
                                    } else if (elem.type.substring(0, 6) === 'damage') {
                                        damage += getDamage(activeMult * value * playerStats.attack, elem.type.substring(6).toLowerCase(), playerStats, enemyStats);
                                    }
                                });

                                damage = Math.max(0, damage - enemyStats.defense * enemyStats.maxHealth) / divisionShieldMult;
                                if (damage > 0) {
                                    hitShield = true;
                                }

                                if (activeCost.health !== undefined) {
                                    HOSTORE.commit('horde/updatePlayerKey', {key: 'health', value: HOSTORE.state.horde.player.health * (1 - activeCost.health)});
                                }
                                if (activeCost.energy !== undefined) {
                                    HOSTORE.dispatch('horde/updateEnergy', HOSTORE.state.horde.player.energy - activeCost.energy);
                                }
                                if (activeCost.mana !== undefined) {
                                    HOSTORE.dispatch('horde/updateMana', HOSTORE.state.horde.player.mana - activeCost.mana);
                                }
                                if (activeCost.mysticalShard !== undefined) {
                                    HOSTORE.dispatch('currency/spend', {feature: 'horde', name: 'mysticalShard', amount: activeCost.mysticalShard});
                                    HOSTORE.dispatch('horde/checkPlayerHealth');
                                }

                                const cooldown = Math.ceil(item.cooldown(activeLevel));
                                if (subfeature === 0) {
                                    HOSTORE.commit('horde/updateItemKey', {name: usedAttack, key: 'cooldownLeft', value: cooldown});
                                } else if (subfeature === 1) {
                                    HOSTORE.commit('horde/updateSubkey', {name: 'skillActive', key: usedAttack, value: cooldown});
                                }

                                HOSTORE.dispatch('horde/updateActiveTimer', 0);

                                // Add stat for spellblade
                                HOSTORE.commit('horde/updatePlayerKey', {key: 'spells', value: HOSTORE.state.horde.player.spells + 1 + Math.round(HOSTORE.getters['tag/values']('hordeSpellbladeOnActive')[0])});
                            }
                            HOSTORE.commit('horde/updateKey', {key: 'chosenActive', value: null});
                        } else {
                            // Perform regular attack
                            const crits = Math.max(randomRound(playerStats.critChance + HOSTORE.state.horde.player.nocrit * HOSTORE.getters['tag/values']('hordeCritOnNonCrit')[0]), HOSTORE.state.horde.player.forcecrit > HOSTORE.getters['tag/values']('hordeFirstAttacksCrit')[0] ? 1 : 0);
                            const baseDamage = playerStats.attack * (HORDE_DAMAGE_INCREASE_PER_STRENGTH * playerStats.strength + 1) * (playerStats.critMult * crits + 1);

                            damageTypes.forEach(damagetype => {
                                const conversion = playerStats[damagetype + 'Conversion'];
                                if (conversion > 0) {
                                    damage += getDamage(baseDamage * conversion, damagetype, playerStats, enemyStats)
                                }
                            });

                            // Count damage stats (regular attacks only)
                            if (damage > 0) {
                                HOSTORE.commit('stat/increaseTo', {feature: 'horde', name: 'maxDamage', value: damage});
                                HOSTORE.commit('stat/add', {feature: 'horde', name: 'totalDamage', value: damage});
                                if (simulation.dead) {
                                    simulation.damage += damage;
                                }
                            }

                            // Apply first strike effects
                            if (HOSTORE.state.horde.player.hits <= 0) {
                                if (playerStats.firstStrike > 0) {
                                    damage += getDamage(playerStats.attack * playerStats.firstStrike, 'magic', playerStats, enemyStats);
                                }
                                if (HOSTORE.getters['tag/values']('hordeFirstStrikeStun')[0] > 0) {
                                    HOSTORE.commit('horde/updateEnemyKey', {key: 'stun', value: HOSTORE.state.horde.enemy.stun + Math.round(HOSTORE.getters['tag/values']('hordeFirstStrikeStun')[0])});
                                }
                            }
                            if (HOSTORE.state.horde.player.spells > 0) {
                                if (playerStats.spellblade > 0) {
                                    damage += getDamage(playerStats.attack * playerStats.spellblade, 'magic', playerStats, enemyStats);
                                }
                                HOSTORE.commit('horde/updatePlayerKey', {key: 'spells', value: HOSTORE.state.horde.player.spells - 1});
                            }
                            HOSTORE.commit('horde/updatePlayerKey', {key: 'hits', value: HOSTORE.state.horde.player.hits + 1});

                            // Apply special effects
                            const attackReduceValues = HOSTORE.getters['tag/values']('hordeReduceAttackOnAttack');
                            if (attackReduceValues[0] > 0 && HOSTORE.state.horde.player.hits < attackReduceValues[1]) {
                                HOSTORE.commit('horde/updateEnemyKey', {key: 'attack', value: Math.max(0, HOSTORE.state.horde.enemy.attack * (1 - attackReduceValues[0]))});
                            }

                            if (crits > 0) {
                                HOSTORE.commit('horde/updatePlayerKey', {key: 'nocrit', value: 0});
                                if (HOSTORE.state.horde.player.forcecrit > HOSTORE.getters['tag/values']('hordeFirstAttacksCrit')[0]) {
                                    HOSTORE.commit('horde/updatePlayerKey', {key: 'forcecrit', value: HOSTORE.state.horde.player.forcecrit + 1});
                                }
                            } else {
                                HOSTORE.commit('horde/updatePlayerKey', {key: 'nocrit', value: HOSTORE.state.horde.player.nocrit + 1});
                            }

                            damage = Math.max(damage - enemyStats.defense * enemyStats.maxHealth, 0) / divisionShieldMult;

                            if (damage > 0) {
                                if (enemyHealth > damage && playerStats.cutting > 0 && enemyHealth < Infinity) {
                                    const maxdamage = Math.max(0, enemyStats.maxHealth * ((enemyHealth - damage) / enemyStats.maxHealth - playerStats.execute));
                                    damage += getDamage(maxdamage * playerStats.cutting / divisionShieldMult, 'bio', playerStats, enemyStats);
                                }

                                if (playerStats.toxic > 0) {
                                    HOSTORE.commit('horde/updateEnemyKey', {key: 'poison', value: getDamage(baseDamage * playerStats.toxic / divisionShieldMult, 'bio', playerStats, enemyStats) + HOSTORE.state.horde.enemy.poison});
                                }

                                hitShield = true;
                            }

                            if (crits > 0) {
                                applyCritEffects(crits);
                            }
                        }

                        enemyHealth = Math.max(0, enemyHealth - damage);
                        if (enemyStats.divisionShield > 0 && hitShield) {
                            HOSTORE.commit('horde/updateEnemyKey', {key: 'divisionShield', value: Math.max(enemyStats.divisionShield - 1 - playerStats.shieldbreak, 0)});
                        }
                    }

                    // select autocast
                    if (HOSTORE.state.horde.chosenActive === null && HOSTORE.state.horde.autocast.length > 0) {
                        const sources = HOSTORE.state.horde.autocast.map(name => {
                            if (subfeature === 0) {
                                const item = HOSTORE.state.horde.items[name];
                                return {ready: item.cooldownLeft <= 0, type: item.activeType, effect: item.active(item.level), activeMult: item.masteryLevel >= 4 ? 1.5 : 1, cost: item.activeCost(item.level), name};
                            } else if (subfeature === 1) {
                                const split = name.split('_');
                                if (split[0] === 'skill') {
                                    const skill = HOSTORE.state.horde.fighterClass[HOSTORE.state.horde.selectedClass].skills[split[1]];
                                    return {ready: HOSTORE.state.horde.skillActive[name] <= 0, type: skill.activeType, effect: skill.active(HOSTORE.state.horde.skillLevel[split[1]]), activeMult: 1, cost: skill.activeCost(HOSTORE.state.horde.skillLevel[split[1]]), name};
                                } else if (split[0] === 'trinket') {
                                    const trinket = HOSTORE.state.horde.trinket[split[1]];
                                    return {ready: HOSTORE.state.horde.skillActive[name] <= 0, type: trinket.activeType, effect: trinket.active(trinket.level), activeMult: 1, cost: trinket.activeCost(trinket.level), name};
                                }
                            }
                            return {};
                        }).filter(elem => elem.ready && elem.type === 'combat' &&
                            (elem.cost.health === undefined || (HOSTORE.state.horde.player.health / playerStats.health) >= 0.5) &&
                            (elem.cost.energy === undefined || (HOSTORE.state.horde.player.energy >= elem.cost.energy) && (HOSTORE.state.horde.player.energy / playerStats.energy) >= 0.5) &&
                            (elem.cost.mana === undefined || (HOSTORE.state.horde.player.mana >= elem.cost.mana) && (HOSTORE.state.horde.player.mana / playerStats.mana) >= 0.5) &&
                            (elem.cost.mysticalShard === undefined || (HOSTORE.state.currency.horde_mysticalShard.value >= elem.cost.mysticalShard && HOSTORE.state.currency.horde_mysticalShard.value >= HOSTORE.state.currency.horde_mysticalShard.cap))
                        );
                        sources.forEach(elem => {
                            if (HOSTORE.state.horde.chosenActive === null) {
                                let usePositive = false;
                                let useNegative = false;
                                elem.effect.forEach(el => {
                                    let condition = null;
                                    if (el.type === 'heal') {
                                        condition = (HOSTORE.state.horde.player.health / playerStats.health) <= (1 - el.value * elem.activeMult * playerStats.healing);
                                    } else if (el.type === 'stun') {
                                        condition = HOSTORE.state.horde.enemy.stun <= 0;
                                    } else if (el.type === 'silence') {
                                        condition = HOSTORE.state.horde.enemy.silence <= 0;
                                    } else if (el.type === 'divisionShield') {
                                        condition = HOSTORE.state.horde.player.divisionShield <= 0;
                                    } else if (el.type === 'antidote') {
                                        condition = HOSTORE.state.horde.player.poison > 0;
                                    } else if (el.type === 'removeStun') {
                                        condition = HOSTORE.state.horde.player.stun > 0;
                                    }

                                    if (condition === true) {
                                        usePositive = true;
                                    } else if (condition === false) {
                                        useNegative = true;
                                    }
                                    if (usePositive || !useNegative) {
                                        HOSTORE.commit('horde/updateKey', {key: 'chosenActive', value: elem.name});
                                    }
                                });
                            }
                        });
                    }
                }
                if ((enemyHealth / enemyStats.maxHealth) <= playerStats.execute) {
                    if (enemyStats.revive) {
                        HOSTORE.commit('horde/updateEnemyKey', {key: 'health', value: enemyStats.maxHealth});
                        HOSTORE.commit('horde/updateEnemyKey', {key: 'revive', value: enemyStats.revive - 1});
                    } else {
                        if (simulation.dead) {
                            simulation.killed++;
                            if (subfeature === 0) {
                                simulation.bone += HOSTORE.getters['horde/currentBone'] * HOSTORE.state.horde.enemy.loot;
                            } else if (subfeature === 1) {
                                simulation.blood += HOSTORE.getters['horde/currentBlood'] * HOSTORE.state.horde.enemy.loot;
                            }
                        }
                        killEnemy = true;
                    }
                } else {
                    HOSTORE.commit('horde/updateEnemyKey', {key: 'health', value: enemyHealth});
                }

                let playerHealth = HOSTORE.state.horde.player.health;

                if (HOSTORE.state.horde.player.poison > 0) {
                    playerHealth = Math.max(0, playerHealth - HOSTORE.state.horde.player.poison);
                }

                const isEnemyStunned = enemyStats.stun > 0;

                // determine which attack to use (first one with cooldown ready)
                let usedAttack = null;
                if (enemyStats.silence > 0) {
                    HOSTORE.commit('horde/updateEnemyKey', {key: 'silence', value: Math.max(0, enemyStats.silence - 1 - enemyStats.statusResist)});
                } else {
                    for (const [key, elem] of Object.entries(enemyStats.active)) {
                        if (elem.cooldown <= 0 && (elem.uses === null || elem.uses > 0)) {
                            let usePositive = false;
                            let useNegative = false;
                            let usableInStun = false;
                            const activeEffect = (subfeature === 0 && HOSTORE.getters['horde/currentElement'] !== null && HOSTORE.state.horde.currentTower === null && !HOSTORE.state.horde.raidboss) ?
                                HOSTORE.state.horde.element[HOSTORE.getters['horde/currentElement']].enemyActives(elem.power, HOSTORE.state.horde.bossFight)[key].effect :
                                HOSTORE.state.horde.sigil[key].active.effect(enemyStats.sigil[key], HOSTORE.state.horde.bossFight);

                            activeEffect.forEach(el => {
                                let condition = null;
                                if (el.type === 'heal') {
                                    condition = (enemyStats.health / enemyStats.maxHealth) <= (1 - el.value);
                                } else if (el.type === 'stun') {
                                    condition = HOSTORE.state.horde.player.stun <= 0;
                                } else if (el.type === 'silence') {
                                    condition = HOSTORE.state.horde.player.silence <= 0;
                                } else if (el.type === 'divisionShield') {
                                    condition = enemyStats.divisionShield <= 0;
                                } else if (el.type === 'antidote') {
                                    condition = enemyStats.poison > 0;
                                } else if (el.type === 'removeStun') {
                                    usableInStun = true;
                                    condition = enemyStats.stun > 0;
                                }

                                if (condition === true) {
                                    usePositive = true;
                                } else if (condition === false) {
                                    useNegative = true;
                                }
                            });
                            if ((!isEnemyStunned || usableInStun) && (usePositive || !useNegative)) {
                                usedAttack = key;
                                break;
                            }
                        }
                    }
                }

                if (isEnemyStunned) {
                    HOSTORE.commit('horde/updateEnemyKey', {key: 'stun', value: Math.max(0, enemyStats.stun - 1 - enemyStats.statusResist)});
                }
                if (!isEnemyStunned || usedAttack !== null) {
                    // ENEMY ATTACK

                    const enemyBaseDamage = enemyStats.attack * Math.pow(enemyStats.critMult + 1, randomRound(enemyStats.critChance));
                    const divisionShieldMult = HOSTORE.state.horde.player.divisionShield + 1;
                    let enemyDamage = 0;
                    let hitShield = false;

                    if (usedAttack === null) {
                        // Perform a regular attack with all additional effects
                        const enemyConversionTotal = enemyStats.physicConversion + enemyStats.magicConversion + enemyStats.bioConversion;
                        damageTypes.forEach(damagetype => {
                            const conversion = enemyStats[damagetype + 'Conversion'] / enemyConversionTotal;
                            if (conversion > 0) {
                                enemyDamage += getDamage(enemyBaseDamage * conversion, damagetype, enemyStats, playerStats);
                            }
                        });
                        if (enemyStats.firstStrike > 0 && enemyStats.hits <= 0) {
                            enemyDamage += getDamage(enemyStats.attack * enemyStats.firstStrike, 'magic', enemyStats, playerStats);
                        }

                        if (playerHealth > enemyDamage && enemyStats.cutting > 0) {
                            enemyDamage += getDamage((playerHealth - enemyDamage) * enemyStats.cutting, 'bio', enemyStats, playerStats);
                        }

                        enemyDamage = Math.max(0, enemyDamage - playerStats.defense * playerStats.health) / divisionShieldMult;

                        if (enemyDamage > 0) {
                            if (enemyStats.toxic > 0) {
                                HOSTORE.commit('horde/updatePlayerKey', {key: 'poison', value: getDamage(enemyBaseDamage * enemyStats.toxic / divisionShieldMult, 'bio', enemyStats, playerStats) + HOSTORE.state.horde.player.poison});
                            }
                            HOSTORE.commit('horde/updateEnemyKey', {key: 'hits', value: enemyStats.hits + 1});

                            hitShield = true;
                        }
                    } else {
                        // Perform an active attack
                        const isElemental = HOSTORE.getters['horde/currentElement'] !== null && HOSTORE.state.horde.currentTower === null && !HOSTORE.state.horde.raidboss;
                        const active = isElemental ? null : HOSTORE.state.horde.sigil[usedAttack].active;
                        const activeEffect = isElemental ?
                            HOSTORE.state.horde.element[HOSTORE.getters['horde/currentElement']].enemyActives(enemyStats.active[usedAttack].power, HOSTORE.state.horde.bossFight)[usedAttack].effect :
                            active.effect(enemyStats.sigil[usedAttack], HOSTORE.state.horde.bossFight);
                        activeEffect.forEach(elem => {
                            if (elem.type === 'heal') {
                                HOSTORE.commit('horde/updateEnemyKey', {key: 'health', value: Math.min(enemyStats.maxHealth, HOSTORE.state.horde.enemy.health + enemyStats.maxHealth * elem.value)});
                            } else if (elem.type === 'stun') {
                                HOSTORE.commit('horde/updatePlayerKey', {key: 'stun', value: HOSTORE.state.horde.player.stun + elem.value});
                            } else if (elem.type === 'silence') {
                                HOSTORE.commit('horde/updatePlayerKey', {key: 'silence', value: HOSTORE.state.horde.player.silence + elem.value});
                            } else if (elem.type === 'divisionShield') {
                                HOSTORE.commit('horde/updateEnemyKey', {key: 'divisionShield', value: Math.max(Math.min(enemyStats.divisionShield, HOSTORE.state.horde.enemy.divisionShield) + elem.value, HOSTORE.state.horde.enemy.divisionShield)});
                            } else if (elem.type === 'removeDivisionShield') {
                                HOSTORE.commit('horde/updatePlayerKey', {key: 'divisionShield', value: Math.ceil(HOSTORE.state.horde.player.divisionShield * (1 - elem.value))});
                            } else if (elem.type === 'gainStat') {
                                const split = elem.stat.split('_');
                                if (split[1] === 'base') {
                                    HOSTORE.commit('horde/updateEnemyKey', {key: split[0], value: HOSTORE.state.horde.enemy[split[0]] + elem.value});
                                } else if (split[1] === 'mult') {
                                    HOSTORE.commit('horde/updateEnemyKey', {key: split[0], value: HOSTORE.state.horde.enemy[split[0]] * elem.value});
                                }
                            } else if (elem.type === 'poison') {
                                const poisonDmg = Math.max(0, getDamage(elem.value * enemyStats.attack, 'bio', enemyStats, playerStats) - playerStats.defense * playerStats.health) / divisionShieldMult;
                                if (poisonDmg > 0) {
                                    HOSTORE.commit('horde/updatePlayerKey', {key: 'poison', value: poisonDmg + HOSTORE.state.horde.player.poison});
                                    hitShield = true;
                                }
                            } else if (elem.type === 'antidote') {
                                HOSTORE.commit('horde/updateEnemyKey', {key: 'poison', value: HOSTORE.state.horde.enemy.poison * (1 - elem.value)});
                            } else if (elem.type === 'removeStun') {
                                HOSTORE.commit('horde/updateEnemyKey', {key: 'stun', value: 0});
                            } else if (elem.type === 'removeAttack') {
                                HOSTORE.dispatch('horde/updatePlayerAttackMult', Math.max(0, HOSTORE.state.horde.playerAttackMult * (1 - elem.value)));
                            } else if (elem.type.substring(0, 9) === 'maxdamage') {
                                const maxdamage = Math.max(0, playerStats.health * (playerHealth / playerStats.health - enemyStats.execute));
                                const dmg = getDamage(elem.value * maxdamage, elem.type.substring(9).toLowerCase(), enemyStats, playerStats);
                                enemyDamage += Math.max(0, dmg - playerStats.defense * playerStats.health) / divisionShieldMult;
                                if (enemyDamage > 0) {
                                    hitShield = true;
                                }
                            } else if (elem.type.substring(0, 6) === 'damage') {
                                const dmg = getDamage(elem.value * enemyStats.attack, elem.type.substring(6).toLowerCase(), enemyStats, playerStats);
                                enemyDamage += Math.max(0, dmg - playerStats.defense * playerStats.health) / divisionShieldMult;
                                if (enemyDamage > 0) {
                                    hitShield = true;
                                }
                            }
                        });

                        // Count use and apply cooldown
                        HOSTORE.commit('horde/updateEnemyActive', {name: usedAttack, key: 'cooldown', value: isElemental ?
                            HOSTORE.state.horde.element[HOSTORE.getters['horde/currentElement']].enemyActives(enemyStats.active[usedAttack].power, HOSTORE.state.horde.bossFight)[usedAttack].cooldown :
                            active.cooldown(enemyStats.sigil[usedAttack], HOSTORE.state.horde.bossFight)
                        });
                        if (enemyStats.active[usedAttack].uses !== null) {
                            HOSTORE.commit('horde/updateEnemyActive', {name: usedAttack, key: 'uses', value: enemyStats.active[usedAttack].uses - 1});
                        }
                    }

                    playerHealth = Math.max(0, playerHealth - enemyDamage);
                    // Only hit shield and count hits if damage was dealt
                    if (HOSTORE.state.horde.player.divisionShield > 0 && hitShield) {
                        HOSTORE.commit('horde/updatePlayerKey', {key: 'divisionShield', value: HOSTORE.state.horde.player.divisionShield - 1});
                    }
                }

                if (simulation.dead) {
                    if (!HOSTORE.state.horde.bossFight) {
                        simulation.time++;
                    }
                }

                if ((playerHealth / playerStats.health) <= enemyStats.execute) {
                    if (playerDie()) {
                        // Dying to a boss resets the simulation
                        if (HOSTORE.state.horde.bossFight && simulation.dead) {
                            simulation = {...newSimulation};
                        }
                        simulation.dead++;
                    }
                } else {
                    HOSTORE.commit('horde/updatePlayerKey', {key: 'health', value: playerHealth});
                }

                // Tick respawn timers
                tickEnemyRespawn(1);

                if (killEnemy && HOSTORE.state.horde.enemy) {
                    const wasBoss = HOSTORE.state.horde.bossFight;
                    // Defeating a boss resets the simulation
                    if (HOSTORE.state.horde.bossFight && simulation.dead) {
                        simulation = {...newSimulation};
                    }
                    HOSTORE.dispatch('horde/killEnemy', HOSTORE.state.horde.fightTime);
                    if (subfeature === 1 && !wasBoss && HOSTORE.state.horde.combo === 0) {
                        // Resetting enemy count counts as death for classes subfeature
                        simulation.dead++;
                    }
                }

                secondsSpent = 1;

                // Apply rampage
                HOSTORE.commit('horde/updateKey', {key: 'fightTime', value: HOSTORE.state.horde.fightTime + secondsSpent});

                // Apply current health effects
                HOSTORE.dispatch('horde/updateHealthStats');

                // Apply after x time effects
                HOSTORE.dispatch('horde/applyTimeStats');

                const rampageTime = HOSTORE.state.horde.bossFight ? HORDE_RAMPAGE_BOSS_TIME : HORDE_RAMPAGE_ENEMY_TIME;
                const newRampage = Math.floor(HOSTORE.state.horde.fightTime / rampageTime);

                if (HOSTORE.state.horde.enemy && newRampage > HOSTORE.state.horde.fightRampage) {
                    const rampageDiff = newRampage - HOSTORE.state.horde.fightRampage;
                    HOSTORE.commit('horde/updateEnemyKey', {key: 'attack', value: enemyStats.attack * Math.pow(HORDE_RAMPAGE_ATTACK, rampageDiff)});
                    HOSTORE.commit('horde/updateEnemyKey', {key: 'statusResist', value: enemyStats.statusResist + HORDE_RAMPAGE_STUN_RESIST * rampageDiff});
                    HOSTORE.commit('horde/updateKey', {key: 'fightRampage', value: newRampage});
                }
            } else if (subfeature === 1 && HOSTORE.state.horde.selectedArea === null) {
                secondsSpent = secondsLeft;
                secondsLeft = 0;
            } else if (subfeature === 0 && HOSTORE.state.horde.taunt && !HOSTORE.state.horde.bossAvailable && HOSTORE.state.horde.zone === HOSTORE.state.stat.horde_maxZone.value) {
                HOSTORE.dispatch('horde/updateEnemyStats');
            } else {
                secondsSpent = Math.max(Math.min(secondsLeft, HORDE_ENEMY_RESPAWN_TIME - HOSTORE.state.horde.enemyTimer), 1);
                tickEnemyRespawn(secondsSpent);
                if (simulation.dead) {
                    simulation.time += secondsSpent;
                }

                if (subfeature === 0 && HOSTORE.state.horde.zone >= HORDE_MONSTER_PART_MIN_ZONE && HOSTORE.state.horde.combo > 0) {
                    HOSTORE.dispatch('currency/gain', {feature: 'horde', name: 'monsterPart', gainMult: true, amount: secondsSpent * HOSTORE.getters['horde/currentMonsterPart']});
                    if (simulation.dead) {
                        simulation.monsterPartTime += secondsSpent;
                    }
                }

                HOSTORE.dispatch('horde/updateEnemyStats');
            }

            // Apply recovery
            if (HOSTORE.state.horde.player.health > 0) {
                const passiveRecovery = HOSTORE.getters['tag/values']('hordePassiveRecovery')[0] * playerStats.recovery * playerStats.healing;
                const missingHealth = playerStats.health - HOSTORE.state.horde.player.health;
                if (passiveRecovery > 0 && missingHealth > 0) {
                    HOSTORE.commit('horde/updatePlayerKey', {key: 'health', value: Math.min(playerStats.health, HOSTORE.state.horde.player.health + missingHealth * passiveRecovery)});
                }
            }

            // Tick player buffs
            let newBuffs = {};
            let refreshCache = false;
            for (const [key, elem] of Object.entries(HOSTORE.state.horde.playerBuff)) {
                const newTime = elem.time - secondsSpent;
                if (newTime > 0) {
                    newBuffs[key] = {...elem, time: newTime};
                } else {
                    refreshCache = true;
                }
            }
            HOSTORE.commit('horde/updateKey', {key: 'playerBuff', value: newBuffs});
            if (refreshCache) {
                HOSTORE.dispatch('horde/updatePlayerCache');
            }

            HOSTORE.dispatch('horde/updateActiveTimer', HOSTORE.state.horde.activeTimer + secondsSpent);

            tickPlayerCooldowns(secondsSpent);

            // Regen energy and mana
            if (playerStats.energyRegen > 0 && HOSTORE.state.horde.player.energy < playerStats.energy) {
                HOSTORE.dispatch('horde/updateEnergy', Math.min(HOSTORE.state.horde.player.energy + playerStats.energyRegen * secondsSpent, playerStats.energy));
            }
            if (playerStats.manaRegen > 0 && HOSTORE.state.horde.player.mana < playerStats.mana) {
                HOSTORE.dispatch('horde/updateMana', Math.min(HOSTORE.state.horde.player.mana + playerStats.manaRegen * secondsSpent, playerStats.mana));
            }

            secondsLeft -= secondsSpent;
        }

        // Show heirloom notification after all combat happened
        if (HOSTORE.state.horde.heirloomsFound !== null) {
            if (HOSTORE.state.system.settings.notification.items.heirloom.value) {
                HOSTORE.commit('system/addNotification', {color: 'success', timeout: 3000, message: {
                    type: 'heirloom',
                    value: HOSTORE.state.horde.heirloomsFound
                }});
            }
            HOSTORE.commit('horde/updateKey', {key: 'heirloomsFound', value: null});
        }
    },
    unlock: [
        'hordeFeature', 'hordeEquipment', 'hordeDamageTypes', 'hordePrestige', 'hordeHeirlooms',
        'hordeRaidboss', 'hordeCorruptedFlesh', 'hordeEquipmentMastery', 'hordeChessEquipment',
        'hordeBrickTower', 'hordeFireTower', 'hordeIceTower', 'hordeDangerTower', 'hordeToxicTower', 'hordeForestTower',
        ...[
            'Armor', 'Storage', 'Butcher', 'Crypt', 'Secret', 'Blessing',
        ].map(elem => 'hordeUpgradeRoyal' + elem),
        ...[
            'Sword', 'Armor', 'Bow', 'Flame', 'Water', 'Shield',
        ].map(elem => 'hordeEquipmentBlessed' + elem),
        ...[
            'Warzone', 'MonkeyJungle', 'LoveIsland',
        ].map(elem => 'hordeMonsterTooth' + elem),
        'hordeClassesSubfeature', 'hordeSacrifice', 'hordeEndOfContent'
    ],
    stat: {
        maxZone: {value: 1, showInStatistics: true},
        maxDifficulty: {showInStatistics: true},
        totalDamage: {showInStatistics: true},
        maxDamage: {showInStatistics: true},
        timeSpent: {display: 'time'},
        relicActivesUsed: {},
        bestPrestige0: {showInStatistics: true},
        bestPrestige1: {showInStatistics: true},
        prestigeCount: {showInStatistics: true},
        maxZoneSpeedrun: {value: 1},
        maxItems: {},
        maxCorruptionKill: {display: 'percent', showInStatistics: true},
        maxMastery: {},
        totalMastery: {},
        unlucky: {},
        warzoneInfiniteScore: {showInStatistics: true},
        monkeyJungleInfiniteScore: {showInStatistics: true},
        loveIslandInfiniteScore: {showInStatistics: true},
    },
    mult: {
        // Base combat stats
        hordeAttack: {},
        hordeHealth: {},
        hordeRecovery: {display: 'percent', min: 0, max: 1},
        hordeCritChance: {display: 'percent'},
        hordeCritMult: {display: 'percent', baseValue: 0.75},
        hordeRevive: {round: true, min: 0},
        hordeToxic: {display: 'percent'},
        hordeFirstStrike: {display: 'percent'},
        hordeSpellblade: {display: 'percent'},
        hordeCutting: {display: 'percent', min: 0},
        hordeDivisionShield: {round: true, min: 0},
        hordeStatusResist: {round: true, min: 0},
        hordeShieldbreak: {round: true, min: 0},
        hordeEnemyActiveStart: {display: 'percent', min: 0, max: 1},
        hordeDefense: {display: 'percent', min: 0},
        hordeExecute: {display: 'percent', min: 0, max: 0.75},
        hordeHealing: {display: 'percent', baseValue: 1, min: 0},

        // Damage type specifics
        hordePhysicConversion: {display: 'percent', baseValue: 1},
        hordeMagicConversion: {display: 'percent', baseValue: 0},
        hordeBioConversion: {display: 'percent', baseValue: 0},
        hordePhysicAttack: {display: 'percent', baseValue: 1},
        hordeMagicAttack: {display: 'percent', baseValue: 1},
        hordeBioAttack: {display: 'percent', baseValue: 1},
        hordePhysicTaken: {display: 'percent', isPositive: false, baseValue: 1},
        hordeMagicTaken: {display: 'percent', isPositive: false, baseValue: 1},
        hordeBioTaken: {display: 'percent', isPositive: false, baseValue: 1},

        // Utility stats
        hordeMaxEquipment: {round: true, baseValue: 1},
        hordeEquipmentChance: {display: 'percent'},
        hordeBossRequirement: {round: true, isPositive: false, min: 1, max: 50},
        hordeRespawn: {display: 'time', round: true, isPositive: false, min: 1, max: 300},
        hordeRareLootTime: {display: 'time', round: true, isPositive: false, min: 60, baseValue: 300},
        hordeHeirloomChance: {display: 'percent', max: 1, roundNearZero: true},
        hordeHeirloomAmount: {baseValue: 1, round: true},
        hordeHeirloomEffect: {},
        hordeNostalgia: {baseValue: 25, round: true},
        hordeCorruption: {display: 'percent', isPositive: false, min: 0, roundNearZero: true},
        hordeEquipmentMasteryGain: {},
        hordeShardChance: {display: 'percent', baseValue: 0.001},
        hordeTrinketGain: {},
        hordeTrinketQuality: {min: 0},
        hordeMaxSacrifice: {round: true, baseValue: 1},
        hordeEssenceGain: {},
        hordeToothGain: {display: 'percent'},

        hordePremiumAncientCap: {},

        // Raidboss stats
        hordeRaidAttack: {display: 'mult', baseValue: 0.05},
        hordeRaidHealth: {display: 'mult'},
        hordeRaidEquipmentChance: {display: 'mult'},
        hordeRaidBoneGain: {display: 'mult'},
        hordeRaidMonsterPartGain: {display: 'mult'},
        hordeRaidSoulCorruptedGain: {display: 'mult'},

        // Classes stats
        hordeEnergy: {round: true},
        hordeEnergyRegen: {display: 'perSecond'},
        hordeMana: {round: true},
        hordeManaRegen: {display: 'perSecond'},
        hordeHaste: {min: -75},
        hordeStrength: {},
        hordeIntelligence: {},
        hordeExpBase: {display: 'time', isPositive: false},
        hordeExpIncrement: {display: 'mult', isPositive: false, min: 0},
        hordeMaxTrinkets: {baseValue: 1, round: true},
        hordeSkillPointsPerLevel: {baseValue: 10, round: true},
        hordeAutocast: {round: true},
        hordeCourageScore: {},

        hordePrestigeIncome: {group: ['currencyHordeSoulCorruptedGain', 'currencyHordeSoulCorruptedCap', 'currencyHordeCourageGain']}
    },
    multGroup: [
        {mult: 'hordeHeirloomEffect', name: 'multType', type: 'heirloomEffect'},
        {mult: 'hordePremiumAncientCap', name: 'upgradeCap', subtype: 'premiumAncient'},
        {mult: 'hordeEssenceGain', name: 'currencyGain', subtype: 'essence'},
        {mult: 'hordeToothGain', name: 'currencyGain', subtype: 'tooth'},
    ],
    currency: {
        bone: {color: 'lightest-grey', icon: 'mdi-bone', gainMult: {}, capMult: {baseValue: buildNum(5, 'M')}},
        monsterPart: {color: 'cherry', icon: 'mdi-stomach', showHint: true, gainMult: {display: 'perSecond'}, capMult: {baseValue: 100}},
        corruptedFlesh: {color: 'deep-purple', icon: 'mdi-food-steak', gainMult: {baseValue: 1, display: 'perSecond'}, showGainMult: true, showGainTimer: true},
        mysticalShard: {color: 'teal', icon: 'mdi-billiards-rack', showHint: true, display: 'int', overcapMult: 0, capMult: {baseValue: 0}, currencyMult: {
            hordeAttack: {type: 'mult', value: val => Math.pow(1.008, val)},
            hordeHealth: {type: 'mult', value: val => Math.pow(1.008, val)},
            currencyHordeBoneGain: {type: 'mult', value: val => Math.pow(1.008, val)},
            hordeShardChance: {type: 'mult', value: val => Math.pow(1 / HORDE_SHARD_CHANCE_REDUCTION, val)}
        }},
        soulCorrupted: {color: 'purple', icon: 'mdi-ghost', overcapMult: 0.75, overcapScaling: 0.85, gainMult: {}, capMult: {min: 200}, gainTimerFunction() {
            return HOSTORE.getters['mult/get']('currencyHordeSoulCorruptedGain') / HOSTORE.getters['mult/get']('hordeRareLootTime');
        }, timerIsEstimate: true},
        soulEmpowered: {type: 'prestige', alwaysVisible: true, color: 'pink', icon: 'mdi-ghost'},
        courage: {type: 'prestige', alwaysVisible: true, color: 'orange', icon: 'mdi-ghost', gainMult: {}},
        crown: {type: 'prestige', color: 'amber', icon: 'mdi-crown-circle-outline', display: 'int'},
        raidKey: {type: 'prestige', color: 'pale-orange', icon: 'mdi-key', overcapMult: 0, overcapFunction(amount) {
            HOSTORE.dispatch('horde/getRaidbossReward', amount);
        }, capMult: {baseValue: 30}, display: 'int'},
        towerKey: {type: 'prestige', color: 'light-grey', icon: 'mdi-key-variant', display: 'int'},
        blood: {color: 'red', icon: 'mdi-iv-bag', gainMult: {}, capMult: {baseValue: 7500}},
        lockpick: {color: 'orange-red', icon: 'mdi-screwdriver', overcapMult: 0.9, overcapScaling: 0.75, gainMult: {}, showGainMult: true, showGainTimer: true, capMult: {baseValue: 7}},

        // Essence
        fireEssence: {type: 'prestige', subtype: 'essence', color: 'deep-orange', icon: 'mdi-fire', gainMult: {}},
        thunderEssence: {type: 'prestige', subtype: 'essence', color: 'amber', icon: 'mdi-lightning-bolt', gainMult: {}},
        windEssence: {type: 'prestige', subtype: 'essence', color: 'light-blue', icon: 'mdi-weather-windy', gainMult: {}},
        waterEssence: {type: 'prestige', subtype: 'essence', color: 'dark-blue', icon: 'mdi-water', gainMult: {}},
        iceEssence: {type: 'prestige', subtype: 'essence', color: 'cyan', icon: 'mdi-snowflake', gainMult: {}},
        earthEssence: {type: 'prestige', subtype: 'essence', color: 'brown', icon: 'mdi-image-filter-hdr', gainMult: {}},
        natureEssence: {type: 'prestige', subtype: 'essence', color: 'green', icon: 'mdi-leaf', gainMult: {}},
        lightEssence: {type: 'prestige', subtype: 'essence', color: 'light-grey', icon: 'mdi-white-balance-sunny', gainMult: {}},
        shadowEssence: {type: 'prestige', subtype: 'essence', color: 'darker-grey', icon: 'mdi-weather-night', gainMult: {}},

        // Monster teeth
        monsterToothWarzone: {subtype: 'tooth', color: 'orange', icon: 'mdi-tooth', display: 'int', overcapMult: 0, gainMult: {baseValue: 0.05, display: 'percent'}, capMult: {baseValue: 0}, currencyMult: {
            hordeAttack: {type: 'mult', value: val => Math.pow(1.08, val)},
            hordeHealth: {type: 'mult', value: val => Math.pow(1.08, val)},
            currencyHordeMonsterToothWarzoneGain: {type: 'mult', value: val => Math.pow(1 / HORDE_TOOTH_CHANCE_REDUCTION, val)}
        }},
        monsterToothMonkeyJungle: {subtype: 'tooth', color: 'pale-green', icon: 'mdi-tooth', display: 'int', overcapMult: 0, gainMult: {baseValue: 0.05, display: 'percent'}, capMult: {baseValue: 0}, currencyMult: {
            currencyHordeBloodGain: {type: 'mult', value: val => Math.pow(1.11, val)},
            hordeCourageScore: {type: 'mult', value: val => Math.pow(1.014, val)},
            currencyHordeMonsterToothMonkeyJungleGain: {type: 'mult', value: val => Math.pow(1 / HORDE_TOOTH_CHANCE_REDUCTION, val)}
        }},
        monsterToothLoveIsland: {subtype: 'tooth', color: 'babypink', icon: 'mdi-tooth', display: 'int', overcapMult: 0, gainMult: {baseValue: 0.05, display: 'percent'}, capMult: {baseValue: 0}, currencyMult: {
            hordeExpBase: {type: 'mult', value: val => Math.pow(1 / 1.04, val)},
            currencyHordeMonsterToothLoveIslandGain: {type: 'mult', value: val => Math.pow(1 / HORDE_TOOTH_CHANCE_REDUCTION, val)}
        }},
    },
    upgrade: {
        ...upgrade,
        ...upgrade2,
        ...upgradePrestige,
        ...upgradePremium,
    },
    tag: {
        hordeEnergyToStr: {params: ['number'], stacking: 'add'},
        hordeEnergyToEnergyReg: {params: ['perSecond'], stacking: 'add'},
        hordeManaToHaste: {params: ['number'], stacking: 'add'},
        hordeEnergyOnCrit: {params: ['number'], stacking: 'add'},
        hordeHealOnCrit: {params: ['percent'], stacking: 'add'},
        hordeRestoreCooldownOnCrit: {params: ['time'], stacking: 'add'},
        hordeBloodOnCrit: {params: ['percent'], stacking: 'add'},
        hordeManaRest: {params: ['time', 'perSecond'], stacking: 'add'},
        hordeManasteal: {params: ['number'], stacking: 'add'},
        hordePassiveRecovery: {params: ['percent'], stacking: 'add'},
        hordeActiveDamageCrit: {params: ['percent'], stacking: 'add'},
        hordeActiveHealCrit: {params: ['percent'], stacking: 'add'},
        hordeFirstStrikeStun: {params: ['time'], stacking: 'add'},
        hordeSpellbladeOnActive: {params: ['number'], stacking: 'add'},
        hordeCritOnNonCrit: {params: ['percent'], stacking: 'add'},
        hordeStunOnCrit: {params: ['time'], stacking: 'add'},
        hordeReviveDivisionShield: {params: ['percent'], stacking: 'add'},
        hordeReduceAttackOnAttack: {params: ['percent', 'number'], stacking: 'add'},
        hordeAttackAfterTime: {params: ['mult'], stacking: 'add'},
        hordeStrIntAfterTime: {params: ['number'], stacking: 'add'},
        hordeFirstAttacksCrit: {params: ['number'], stacking: 'add'},
        hordeFastKillBonusBlood: {params: ['percent'], stacking: 'add'},
        hordeAttackPerMissingHealth: {params: ['number'], stacking: 'add'},
        hordeStrIntPerMissingHealth: {params: ['number'], stacking: 'add'},
    },
    relic,
    achievement,
    note: buildArray(31).map(() => 'g'),
    consumable: {
        manaPotion: {
            icon: 'mdi-flask-round-bottom',
            color: 'dark-blue',
            price: {gem_sapphire: 35}
        }
    },
    init() {
        for (const [key, elem] of Object.entries(equipment)) {
            HOSTORE.commit('horde/initItem', {name: key, ...elem});
        }
        for (const [key, elem] of Object.entries(heirloom)) {
            HOSTORE.dispatch('horde/initHeirloom', {name: key, ...elem});
        }
        for (const [key, elem] of Object.entries({...sigil, ...sigil_boss})) {
            HOSTORE.commit('horde/initSigil', {name: key, ...elem});
        }
        for (const [key, elem] of Object.entries(tower)) {
            HOSTORE.commit('horde/initTower', {name: key, ...elem});
        }
        for (const [key, elem] of Object.entries({adventurer, archer, mage, knight, pirate, assassin, shaman, undead, cultist, scholar})) {
            if (elem.unlock) {
                HOSTORE.commit('unlock/init', elem.unlock);
            }
            HOSTORE.commit('horde/initFighterClass', {name: key, ...elem});
        }
        for (const [key, elem] of Object.entries({warzone, monkeyJungle, loveIsland})) {
            if (elem.unlock) {
                HOSTORE.commit('unlock/init', elem.unlock);
            }
            HOSTORE.commit('horde/initArea', {name: key, ...elem});
        }
        for (const [key, elem] of Object.entries(trinket)) {
            HOSTORE.commit('horde/initTrinket', {name: key, ...elem});
        }
        for (const [key, elem] of Object.entries(enemyType)) {
            HOSTORE.commit('horde/initEnemyType', {name: key, ...elem});
        }
        for (const [key, elem] of Object.entries(boss)) {
            HOSTORE.commit('horde/initAreaBoss', {name: key, ...elem});
        }
        for (const [key, elem] of Object.entries(element)) {
            HOSTORE.commit('horde/initElement', {name: key, ...elem});
        }
        HOSTORE.commit('horde/updateKey', {key: 'battlePassEffect', value: battlePass});
        HOSTORE.dispatch('horde/updatePlayerStats');
        HOSTORE.dispatch('horde/updateEnemyStats');
        HOSTORE.dispatch('mult/updateExternalCaches', 'hordeNostalgia');
        HOSTORE.dispatch('horde/updatePlayerCache');
    },
    saveGame() {
        let obj = {
            zone: HOSTORE.state.horde.zone,
            combo: HOSTORE.state.horde.combo,
            respawn: HOSTORE.state.horde.respawn,
            maxRespawn: HOSTORE.state.horde.maxRespawn,
            bossAvailable: HOSTORE.state.horde.bossAvailable,
            bossFight: HOSTORE.state.horde.bossFight,
            player: {...HOSTORE.state.horde.player},
            sigilZones: [...HOSTORE.state.horde.sigilZones],
            enemyTimer: HOSTORE.state.horde.enemyTimer
        };

        const curObj = {};
        for (const key in HO_CUR.values) { if (HO_CUR.values[key] > 0) curObj[key] = HO_CUR.values[key]; }
        if (Object.keys(curObj).length > 0) obj.currency = curObj;

        const upgObj = {};
        for (const id in HO_UPG.levels) { if (HO_UPG.levels[id] > 0) upgObj[id] = HO_UPG.levels[id]; }
        if (Object.keys(upgObj).length > 0) obj.upgrade = upgObj;

        if (Object.keys(HOSTORE.state.horde.playerBuff).length > 0) {
            obj.playerBuff = HOSTORE.state.horde.playerBuff;
        }

        if (HOSTORE.state.horde.enemy) {
            obj.enemy = {...HOSTORE.state.horde.enemy};
        }

        if (HOSTORE.state.unlock.hordeEquipment.see) {
            obj.items = {};
            for (const [key, elem] of Object.entries(HOSTORE.state.horde.items)) {
                if (elem.known) {
                    obj.items[key] = {
                        found: elem.found,
                        level: elem.level,
                        equipped: elem.equipped,
                        cooldownLeft: elem.cooldownLeft,
                        collapse: elem.collapse
                    };
                    if (elem.stacks > 0) {
                        obj.items[key].stacks = elem.stacks;
                    }
                    if (elem.masteryPoint > 0) {
                        obj.items[key].masteryPoint = elem.masteryPoint;
                        obj.items[key].masteryLevel = elem.masteryLevel;
                    }
                    if (elem.passive) {
                        obj.items[key].passive = true;
                    }
                }
            }
        }

        if (HOSTORE.state.horde.loadout.length > 0) {
            obj.loadout = HOSTORE.state.horde.loadout.map(elem => {
                return {name: encodeURIComponent(elem.name), content: elem.content};
            });
        }

        for (const [key, elem] of Object.entries(HOSTORE.state.horde.heirloom)) {
            if (elem.amount > 0) {
                if (obj.heirloom === undefined) {
                    obj.heirloom = {};
                }
                obj.heirloom[key] = [elem.amount];
                if (elem.boost > 0 || elem.level > 0) {
                    obj.heirloom[key].push(elem.boost, elem.level);
                }
            }
        }

        if (HOSTORE.state.horde.fightTime > 0) {
            obj.fightTime = HOSTORE.state.horde.fightTime;
        }
        if (HOSTORE.state.horde.fightRampage > 0) {
            obj.fightRampage = HOSTORE.state.horde.fightRampage;
        }
        if (HOSTORE.state.horde.rareLootTimer > 0) {
            obj.rareLootTimer = HOSTORE.state.horde.rareLootTimer;
        }
        if (HOSTORE.state.horde.nostalgiaLost > 0) {
            obj.nostalgiaLost = HOSTORE.state.horde.nostalgiaLost;
        }
        if (HOSTORE.state.horde.chosenActive !== null) {
            obj.chosenActive = HOSTORE.state.horde.chosenActive;
        }
        if (Object.keys(HOSTORE.state.horde.itemStatMult).length > 0) {
            obj.itemStatMult = HOSTORE.state.horde.itemStatMult;
        }
        if (HOSTORE.state.horde.currentTower !== null) {
            obj.currentTower = HOSTORE.state.horde.currentTower;
        }
        if (HOSTORE.state.horde.towerFloor > 0) {
            obj.towerFloor = HOSTORE.state.horde.towerFloor;
        }
        if (HOSTORE.state.horde.taunt) {
            obj.taunt = true;
        }
        if (HOSTORE.state.horde.selectedClass !== null) {
            obj.selectedClass = HOSTORE.state.horde.selectedClass;
        }
        if (HOSTORE.state.horde.selectedArea !== null) {
            obj.selectedArea = HOSTORE.state.horde.selectedArea;
        }
        if (HOSTORE.state.horde.expLevel > 0) {
            obj.expLevel = HOSTORE.state.horde.expLevel;
        }
        if (HOSTORE.state.horde.skillPoints > 0) {
            obj.skillPoints = HOSTORE.state.horde.skillPoints;
        }
        if (HOSTORE.state.horde.activeTimer > 0) {
            obj.activeTimer = HOSTORE.state.horde.activeTimer;
        }
        if (HOSTORE.state.horde.bossStage > 0) {
            obj.bossStage = HOSTORE.state.horde.bossStage;
        }
        if (HOSTORE.state.horde.trinketDrop !== null) {
            obj.trinketDrop = HOSTORE.state.horde.trinketDrop;
        }
        if (HOSTORE.state.horde.bossBonusDifficulty > 0) {
            obj.bossBonusDifficulty = HOSTORE.state.horde.bossBonusDifficulty;
        }
        if (HOSTORE.state.horde.autocast.length > 0) {
            obj.autocast = HOSTORE.state.horde.autocast;
        }
        if (HOSTORE.state.horde.sacrificeLevel > 0) {
            obj.sacrificeLevel = HOSTORE.state.horde.sacrificeLevel;
        }
        if (HOSTORE.state.horde.nextSacrificeLevel > 0) {
            obj.nextSacrificeLevel = HOSTORE.state.horde.nextSacrificeLevel;
        }
        if (HOSTORE.state.horde.raidboss) {
            obj.raidboss = true;
        }
        if (HOSTORE.state.horde.raidbossDefeated > 0) {
            obj.raidbossDefeated = HOSTORE.state.horde.raidbossDefeated;
        }
        if (HOSTORE.state.horde.raidbossStacks > 0) {
            obj.raidbossStacks = HOSTORE.state.horde.raidbossStacks;
        }
        if (HOSTORE.state.horde.courageScore > 0) {
            obj.courageScore = HOSTORE.state.horde.courageScore;
        }
        if (HOSTORE.state.horde.playerAttackMult !== 1) {
            obj.playerAttackMult = HOSTORE.state.horde.playerAttackMult;
        }

        for (const [key, elem] of Object.entries(HOSTORE.state.horde.tower)) {
            if (elem.highest > 0) {
                if (obj.tower === undefined) {
                    obj.tower = {};
                }
                obj.tower[key] = elem.highest;
            }
        }

        for (const [key, elem] of Object.entries(HOSTORE.state.horde.element)) {
            if (Math.max(elem.upgradeEnemyStats, elem.upgradeEnemyActives, elem.upgradePlayerElemental, elem.upgradePlayerStats) > 0) {
                if (obj.element === undefined) {
                    obj.element = {};
                }
                obj.element[key] = [elem.upgradeEnemyStats, elem.upgradeEnemyActives, elem.upgradePlayerElemental, elem.upgradePlayerStats];
            }
        }

        for (const [key, elem] of Object.entries(HOSTORE.state.horde.skillLevel)) {
            if (elem > 0) {
                if (obj.skillLevel === undefined) {
                    obj.skillLevel = {};
                }
                obj.skillLevel[key] = elem;
            }
        }

        for (const [key, elem] of Object.entries(HOSTORE.state.horde.skillActive)) {
            if (elem > 0) {
                if (obj.skillActive === undefined) {
                    obj.skillActive = {};
                }
                obj.skillActive[key] = elem;
            }
        }

        for (const [key, elem] of Object.entries(HOSTORE.state.horde.fighterClass)) {
            for (const [qkey, qelem] of Object.entries(elem.questsCompleted)) {
                if (qelem > 0) {
                    if (obj.classQuest === undefined) {
                        obj.classQuest = {};
                    }
                    if (obj.classQuest[key] === undefined) {
                        obj.classQuest[key] = {};
                    }
                    obj.classQuest[key][qkey] = qelem;
                }
            }
            if (elem.highestLevel > 0) {
                if (obj.classHighestLevel === undefined) {
                    obj.classHighestLevel = {};
                }
                obj.classHighestLevel[key] = elem.highestLevel;
            }
        }

        for (const [key, elem] of Object.entries(HOSTORE.state.horde.area)) {
            for (const [qkey, qelem] of Object.entries(elem.zones)) {
                if (qelem.unlocked && qelem.unlockedBy !== null) {
                    if (obj.areaUnlock === undefined) {
                        obj.areaUnlock = {};
                    }
                    if (obj.areaUnlock[key] === undefined) {
                        obj.areaUnlock[key] = [];
                    }
                    obj.areaUnlock[key].push(qkey);
                }
            }
            if (elem.teeth > 0) {
                if (obj.areaTeeth === undefined) {
                    obj.areaTeeth = {};
                }
                obj.areaTeeth[key] = elem.teeth;
            }
        }

        for (const [key, elem] of Object.entries(HOSTORE.state.horde.trinket)) {
            if (elem.amount > 0) {
                if (obj.trinket === undefined) {
                    obj.trinket = {};
                }
                obj.trinket[key] = {amount: elem.amount, equipped: elem.equipped, isActive: elem.isActive};
            }
        }

        if (HOSTORE.state.horde.playerName) {
            obj.playerName = HOSTORE.state.horde.playerName;
        }

        return obj;
    },
    loadGame(data) {
        [
            'zone', 'combo', 'respawn', 'maxRespawn', 'bossAvailable', 'bossFight', 'fightTime', 'fightRampage', 'enemyTimer',
            'playerBuff', 'rareLootTimer', 'nostalgiaLost', 'chosenActive', 'currentTower', 'towerFloor', 'taunt',
            'selectedClass', 'selectedArea', 'expLevel', 'skillPoints', 'bossStage', 'trinketDrop', 'bossBonusDifficulty',
            'autocast', 'sacrificeLevel', 'nextSacrificeLevel', 'raidboss', 'raidbossDefeated', 'raidbossStacks', 'courageScore',
            'playerName'
        ].forEach(elem => {
            if (data[elem] !== undefined) {
                HOSTORE.commit('horde/updateKey', {key: elem, value: data[elem]});
            }
        });

        if (data.playerAttackMult !== undefined) {
            HOSTORE.dispatch('horde/updatePlayerAttackMult', data.playerAttackMult);
        }

        if (data.sigilZones) {
            HOSTORE.commit('horde/updateKey', {key: 'sigilZones', value: data.sigilZones.map(zone => zone.filter(item => Object.keys(sigil).includes(item)))});
        }

        if (data.currency) {
            for (const [key, elem] of Object.entries(data.currency)) {
                try { HO_CUR.values[key] = Math.max(0, elem); } catch (e) {}
            }
        }
        if (data.upgrade) {
            for (const [key, elem] of Object.entries(data.upgrade)) {
                if (HO_UPG.defs[key]) HO_UPG.levels[key] = Math.max(0, elem);
            }
            try { HO_UPG.applyAll(); } catch (e) {}
        }

        if (data.player) {
            for (const [key, elem] of Object.entries(data.player)) {
                HOSTORE.commit('horde/updatePlayerKey', {key, value: elem});
            }
        }
        if (data.enemy) {
            HOSTORE.commit('horde/updateKey', {key: 'enemy', value: {}});
            for (const [key, elem] of Object.entries(data.enemy)) {
                HOSTORE.commit('horde/updateEnemyKey', {key, value: key === sigil ? elem.filter(item => Object.keys(sigil).includes(item)) : elem});
            }
        }
        if (data.items) {
            for (const [key, elem] of Object.entries(data.items)) {
                if (HOSTORE.state.horde.items[key]) {
                    if (elem.found) {
                        HOSTORE.commit('horde/updateItemKey', {name: key, key: 'found', value: true});
                    }
                    if (elem.passive) {
                        HOSTORE.commit('horde/updateItemKey', {name: key, key: 'passive', value: true});
                    }
                    HOSTORE.commit('horde/updateItemKey', {name: key, key: 'known', value: true});
                    HOSTORE.commit('horde/updateItemKey', {name: key, key: 'level', value: elem.level});
                    HOSTORE.commit('horde/updateItemKey', {name: key, key: 'cooldownLeft', value: elem.cooldownLeft});
                    HOSTORE.commit('horde/updateItemKey', {name: key, key: 'collapse', value: elem.collapse});
                    if (elem.stacks !== undefined) {
                        HOSTORE.commit('horde/updateItemKey', {name: key, key: 'stacks', value: elem.stacks});
                    }
                    if (elem.masteryPoint !== undefined) {
                        HOSTORE.commit('horde/updateItemKey', {name: key, key: 'masteryPoint', value: elem.masteryPoint});
                        HOSTORE.commit('horde/updateItemKey', {name: key, key: 'masteryLevel', value: elem.masteryLevel});
                    }
                    if (elem.equipped) {
                        HOSTORE.commit('horde/updateItemKey', {name: key, key: 'equipped', value: true});
                        HOSTORE.dispatch('horde/applyItemEffects', key);
                    }
                }
            }
        }
        if (data.loadout) {
            let nextId = 1;
            data.loadout.forEach(elem => {
                HOSTORE.commit('horde/addExistingLoadout', {
                    id: nextId,
                    name: decodeURIComponent(elem.name),
                    content: elem.content
                });
                nextId++;
            });
            HOSTORE.commit('horde/updateKey', {key: 'nextLoadoutId', value: nextId});
        }
        if (data.heirloom) {
            for (const [key, elem] of Object.entries(data.heirloom)) {
                if (HOSTORE.state.horde.heirloom[key]) {
                    HOSTORE.commit('horde/updateHeirloomKey', {name: key, key: 'amount', value: elem[0]});
                    if (elem.length >= 3) {
                        HOSTORE.commit('horde/updateHeirloomKey', {name: key, key: 'boost', value: elem[1]});
                        HOSTORE.commit('horde/updateHeirloomKey', {name: key, key: 'level', value: elem[2]});
                    }
                    HOSTORE.dispatch('horde/applyHeirloomEffects', key);
                }
            }
        }
        if (data.itemStatMult) {
            for (const [key, elem] of Object.entries(data.itemStatMult)) {
                const split = key.split('_');
                HOSTORE.commit('horde/updateSubkey', {name: 'itemStatMult', key, value: elem});
                HOSTORE.dispatch('system/applyEffect', {type: split[1], name: split[0], multKey: `hordeEquipmentPermanent`, value: elem + (split[1] === 'mult' ? 1 : 0)});
            }
        }
        if (data.tower) {
            for (const [key, elem] of Object.entries(data.tower)) {
                if (HOSTORE.state.horde.tower[key]) {
                    HOSTORE.commit('horde/updateTowerKey', {name: key, key: 'highest', value: elem});
                }
            }
        }
        if (data.element) {
            for (const [key, elem] of Object.entries(data.element)) {
                if (HOSTORE.state.horde.element[key]) {
                    HOSTORE.commit('horde/updateElementKey', {name: key, key: 'upgradeEnemyStats', value: elem[0]});
                    HOSTORE.commit('horde/updateElementKey', {name: key, key: 'upgradeEnemyActives', value: elem[1]});
                    HOSTORE.commit('horde/updateElementKey', {name: key, key: 'upgradePlayerElemental', value: elem[2]});
                    HOSTORE.commit('horde/updateElementKey', {name: key, key: 'upgradePlayerStats', value: elem[3]});

                    if (elem[2] > 0) {
                        HOSTORE.dispatch('horde/applyUpgradePlayerElemental', key);
                    }
                    if (elem[3] > 0) {
                        HOSTORE.dispatch('horde/applyUpgradePlayerStats', key);
                    }
                }
            }
        }
        if (data.skillLevel) {
            for (const [key, elem] of Object.entries(data.skillLevel)) {
                HOSTORE.commit('horde/updateSubkey', {name: 'skillLevel', key, value: elem});
                HOSTORE.dispatch('horde/applySkillEffects', key);
            }
        }
        if (data.skillActive) {
            for (const [key, elem] of Object.entries(data.skillActive)) {
                HOSTORE.commit('horde/updateSubkey', {name: 'skillActive', key, value: elem});
            }
        }
        if (data.classQuest) {
            for (const [key, elem] of Object.entries(data.classQuest)) {
                for (const [qkey, qelem] of Object.entries(elem)) {
                    HOSTORE.commit('horde/updateClassQuestKey', {name: key, key: qkey, value: qelem});
                }
            }
        }
        if (data.classHighestLevel) {
            for (const [key, elem] of Object.entries(data.classHighestLevel)) {
                HOSTORE.commit('horde/updateClassKey', {name: key, key: 'highestLevel', value: elem});
            }
        }
        if (data.areaUnlock) {
            for (const [key, elem] of Object.entries(data.areaUnlock)) {
                elem.forEach(zone => {
                    if (HOSTORE.state.horde.area[key]?.zones[zone]) {
                        HOSTORE.commit('horde/updateAreaZoneKey', {name: key, zone, key: 'unlocked', value: true});
                    }
                });
            }
        }
        if (data.areaTeeth) {
            for (const [key, elem] of Object.entries(data.areaTeeth)) {
                if (HOSTORE.state.horde.area[key]) {
                    HOSTORE.commit('horde/updateAreaKey', {name: key, key: 'teeth', value: elem});
                    HOSTORE.dispatch('horde/applyTeethCap', key);
                }
            }
        }
        if (data.activeTimer !== undefined) {
            HOSTORE.dispatch('horde/updateActiveTimer', data.activeTimer);
        }
        if (data.trinket) {
            for (const [name, value] of Object.entries(data.trinket)) {
                HOSTORE.commit('horde/updateTrinketKey', {name, key: 'amount', value: value.amount});
                HOSTORE.commit('horde/updateTrinketKey', {name, key: 'level', value: HOSTORE.state.horde.trinketAmountNeeded.filter(el => value.amount >= el).length});
                HOSTORE.commit('horde/updateTrinketKey', {name, key: 'equipped', value: value.equipped});
                HOSTORE.commit('horde/updateTrinketKey', {name, key: 'isActive', value: value.isActive});
                if (value.isActive) {
                    HOSTORE.dispatch('horde/applyTrinketEffects', name);
                }
            }
        }
        HOSTORE.dispatch('horde/checkZoneUnlocks');
        HOSTORE.dispatch('mult/updateExternalCaches', 'hordeNostalgia');
        HOSTORE.dispatch('horde/updateNostalgia');
        HOSTORE.dispatch('horde/applyTowerEffects');
        HOSTORE.dispatch('horde/updatePlayerCache');
        HOSTORE.dispatch('horde/applyClassEffects');
        HOSTORE.dispatch('horde/applyClassLevelEffects');
        HOSTORE.dispatch('horde/applyBattlePassEffects');
        HOSTORE.dispatch('horde/updateSacrifice');
        HOSTORE.dispatch('horde/updateEnergy');
        HOSTORE.dispatch('horde/updateMana');
        HOSTORE.dispatch('horde/updateHealthStats');
        HOSTORE.dispatch('horde/applyTimeStats');
        HOSTORE.dispatch('horde/updateMysticalShardCap');
        HOSTORE.dispatch('horde/applyRaidEffect');
        HOSTORE.dispatch('horde/updateRaidbossEffect');
    }
}
})(HO_ACHIEVEMENT, HO_HEIRLOOM, HO_EQUIPMENT, HO_RELIC, HO_SIGIL, HO_UPGRADE, HO_UPGRADE2, HO_UPGRADEPREM, HO_UPGRADEPREST, HO_TOWER, HO_WARZONE, HO_LOVEISLAND, HO_MONKEYJUNGLE, HO_BATTLEPASS, HO_ARCHER, HO_MAGE, HO_KNIGHT, HO_ASSASSIN, HO_SHAMAN, HO_PIRATE, HO_UNDEAD, HO_CULTIST, HO_SCHOLAR, HO_ADVENTURER, HO_ENEMYTYPE, HO_BOSS, HO_TRINKET, HO_SIGILBOSS, HO_ELEMENT);

if (typeof module !== "undefined") module.exports = { HO_MODULE };