import { COMBAT, CPU_LEVELS, CPU_RANGES, SUBPIXELS_PER_PIXEL, type CpuLevel, type CpuLevelSettings } from '../../config';
import type { CpuStyle } from '../../content/fighters/cpuStyle';
import { fighterData } from '../../content/fighters/fighterData';
import type { Guard } from '../../content/fighters/moves';
import type { SpecialMove } from '../../content/fighters/specials';
import type { Controller } from '../input/controller';
import { INPUT, type InputBits } from '../input/inputBits';
import { MOTIONS } from '../input/motions';
import type { PlayerIndex } from '../matchSetup';
import { moveOf, specialOf } from '../sim/attacks';
import type { AttackState, FighterState, FightState, ProjectileState } from '../sim/fightState';
import { back, forward, motionInputs, wait } from './inputPlans';
import { Random } from './random';

const { lightPunch: LP, heavyPunch: HP, lightKick: LK, heavyKick: HK, down: DOWN, up: UP } = INPUT;

/** Steps the CPU keeps its guard up once it decides to block. */
const BLOCK_HOLD_STEPS = 18;
/** Steps between the two jabs of a chain: long enough for the first to land and its hitstop to pass. */
const CHAIN_GAP_STEPS = 12;
/** How often it uses a dash special when one suits: to close in, as a mid-range attack, or through a projectile. */
const DASH_IN_CHANCE = 0.3;
const DASH_ATTACK_CHANCE = 0.35;
const DASH_THROUGH_CHANCE = 0.5;
/**
 * A command throw is only tried this many pixels inside its reach, since the opponent may step
 * back while the motion goes in. The heavy version, with its shorter reach, only when it fits.
 */
const GRAB_MARGIN = 4;
/** How often, when it means to block an attack and its counter is ready, it counters instead. */
const COUNTER_CHANCE = 0.5;
/** A fighter who can heal does so from a distance once below this share of their health, this often. */
const HEAL_BELOW = 0.6;
const HEAL_CHANCE = 0.5;

/**
 * The CPU: a controller that plays one fighter by producing inputs, exactly as a player would.
 *
 * It sees its opponent late, by its level's reaction time, which is what makes it beatable. On
 * each step it defends first (blocking an attack it sees coming, breaking a throw, meeting a
 * jump-in), then carries on with whatever it planned (a queue of inputs, one per step), and
 * when it is free it thinks up a new plan every so often, by distance, its fighter's style,
 * and a chance of doing something rash. Its randomness is its own and seeded.
 */
export class CpuPlayer implements Controller {
  private readonly me: PlayerIndex;
  private readonly them: PlayerIndex;
  private readonly level: CpuLevelSettings;
  private readonly random: Random;
  /** The fight as it was over the last few steps; the CPU sees its opponent in the oldest. */
  private readonly memory: FightState[] = [];
  /** Its own inputs so far, as the fight recorded them: what a charge is read from. */
  private history: readonly InputBits[] = [];
  private queue: InputBits[] = [];
  /** What to hold when nothing is queued: walking in, backing off, or nothing. */
  private holding: InputBits = 0;
  private thinkIn = 0;
  private blockSteps = 0;
  private blockBits: InputBits = 0;
  /**
   * Each attack, projectile, jump-in, throw and chance of a combo is judged once, not on every
   * step it lasts: these remember what was last seen, so a new one can be told apart.
   */
  private seenAttack: AttackState | null = null;
  private seenProjectile = false;
  private seenJump = false;
  private seenThrow = false;
  private comboJudged = false;
  private antiAirReady = false;

  constructor(me: PlayerIndex, level: CpuLevel, seed: number) {
    this.me = me;
    this.them = me === 0 ? 1 : 0;
    this.level = CPU_LEVELS[level];
    this.random = new Random(seed);
  }

  readFrame(): void {
    // The CPU reads the fight itself, one step at a time.
  }

  inputFor(state: FightState): InputBits {
    this.remember(state);
    this.history = state.history[this.me];
    if (state.round.phase !== 'fight') {
      this.reset();
      return 0;
    }
    const seen = this.memory[0] ?? state;
    const me = state.fighters[this.me];
    const them = seen.fighters[this.them];

    if (me.status.kind === 'thrown') return this.breakThrow();
    this.seenThrow = false;
    if (!me.attack) this.comboJudged = false;
    this.watchForThreats(seen, me, them);
    if (this.blockSteps > 0) {
      this.blockSteps -= 1;
      return this.blockBits;
    }
    if (this.queue.length > 0) return this.queue.shift() ?? 0;
    if (me.status.kind !== 'free') return 0;
    if (me.attack) return this.duringAttack(me);
    if (me.posture === 'airborne') return this.inTheAir(me, them);
    if (this.antiAirReady && them.posture === 'airborne' && distance(me, them) <= CPU_RANGES.antiAir) return this.antiAir(me);

    this.thinkIn -= 1;
    if (this.thinkIn <= 0) {
      this.thinkIn = this.level.thinkSteps;
      this.think(state, me, them);
      if (this.queue.length > 0) return this.queue.shift() ?? 0;
    }
    return this.holding;
  }

  private remember(state: FightState): void {
    this.memory.push(state);
    while (this.memory.length > this.level.reactionSteps + 1) this.memory.shift();
  }

  private reset(): void {
    this.queue = [];
    this.holding = 0;
    this.blockSteps = 0;
    this.antiAirReady = false;
    this.seenAttack = null;
    this.seenProjectile = false;
    this.seenJump = false;
    this.seenThrow = false;
    this.comboJudged = false;
  }

  /** Blocks an attack or projectile it sees coming (once per attack), and gets ready to meet a jump-in. */
  private watchForThreats(seen: FightState, me: FighterState, them: FighterState): void {
    const gap = distance(me, them);
    const attack = them.attack;
    const last = this.seenAttack;
    const newAttack = attack !== null && (last === null || last.move !== attack.move || attack.step < last.step);
    if (newAttack && gap <= CPU_RANGES.threat && this.random.chance(this.level.block)) this.meetAttack(me, them);
    this.seenAttack = attack;

    const incoming = seen.projectiles.find(
      (projectile) =>
        projectile.owner === this.them &&
        Math.abs(projectile.x - me.x) / SUBPIXELS_PER_PIXEL <= CPU_RANGES.projectileThreat &&
        Math.sign(me.x - projectile.x) === Math.sign(projectile.vx),
    );
    if (incoming && !this.seenProjectile && this.random.chance(this.level.block)) this.meetProjectile(me, projectileGuard(seen, incoming));
    this.seenProjectile = incoming !== undefined;

    const jumping = them.posture === 'airborne' && them.status.kind === 'free';
    if (jumping && !this.seenJump) this.antiAirReady = this.random.chance(this.level.antiAir);
    if (!jumping) this.antiAirReady = false;
    this.seenJump = jumping;
  }

  /**
   * An attack it means to deal with: catch it with a counter, if the fighter has one ready and
   * it chooses to, otherwise block.
   */
  private meetAttack(me: FighterState, them: FighterState): void {
    const counter = this.pickSpecial(me, 'counter');
    const inputs = counter ? this.quickInputs(counter, me, true) : null;
    if (inputs && me.status.kind === 'free' && !me.attack && this.random.chance(COUNTER_CHANCE)) {
      this.queue = inputs;
      return;
    }
    this.raiseGuard(me, guardOf(them));
  }

  /** A projectile it means to deal with: dash straight through it if the fighter can in time, otherwise block. */
  private meetProjectile(me: FighterState, guard: Guard): void {
    const through = this.pickDash(me, { projectileProof: true });
    const inputs = through ? this.quickInputs(through, me, true) : null;
    if (inputs && me.status.kind === 'free' && !me.attack && this.random.chance(DASH_THROUGH_CHANCE)) {
      this.queue = inputs;
      return;
    }
    this.raiseGuard(me, guard);
  }

  /** Holds away from the opponent, crouching for lows and standing for overheads if it reads them right. */
  private raiseGuard(me: FighterState, guard: Guard): void {
    const readsIt = this.random.chance(this.level.readGuard);
    const crouch = readsIt ? guard === 'low' || (guard === 'mid' && this.random.chance(0.5)) : this.random.chance(0.5);
    this.blockBits = back(me.facing) | (crouch ? DOWN : 0);
    this.blockSteps = BLOCK_HOLD_STEPS;
    this.queue = [];
  }

  /** Being thrown: it tries to break free, once per throw. */
  private breakThrow(): InputBits {
    if (this.seenThrow) return 0;
    this.seenThrow = true;
    return this.random.chance(this.level.techThrow) ? LP | LK : 0;
  }

  /** While its own move plays out: cancel it into a special once it has hit, sometimes. */
  private duringAttack(me: FighterState): InputBits {
    const move = moveOf(me);
    if (!me.attack || !move?.cancel || me.attack.contact !== 'hit' || specialOf(me) || this.comboJudged) return 0;
    this.comboJudged = true;
    if (!this.random.chance(this.level.combo)) return 0;
    const followUps = [this.pickSpecial(me, 'projectile'), this.pickSpecial(me, 'rising')];
    const inputs = followUps.map((special) => (special ? this.quickInputs(special, me, true) : null)).find((plan) => plan);
    if (inputs) this.queue = inputs;
    return this.queue.shift() ?? 0;
  }

  /** In the air: kick once the opponent is close. */
  private inTheAir(me: FighterState, them: FighterState): InputBits {
    if (me.airAttackUsed || me.vy > 0 || distance(me, them) > CPU_RANGES.airAttack) return 0;
    return HK;
  }

  /** A rising special if the fighter has one ready, or a counter to catch the jump-in, otherwise a crouching heavy punch. */
  private antiAir(me: FighterState): InputBits {
    this.antiAirReady = false;
    const [rising, counter] = [this.pickSpecial(me, 'rising'), this.pickSpecial(me, 'counter')];
    this.queue = (rising && this.quickInputs(rising, me, true)) || (counter && this.quickInputs(counter, me, true)) || [DOWN | HP];
    return this.queue.shift() ?? 0;
  }

  /** Picks the next thing to do, by distance and the fighter's style. */
  private think(state: FightState, me: FighterState, them: FighterState): void {
    const style = fighterData(me.character).cpu;
    const gap = distance(me, them);
    const aggression = Math.min(1, style.aggression * this.level.aggression);
    this.holding = this.rest(me, gap);

    if (this.random.chance(this.level.mistake)) {
      this.rash(me);
    } else if (them.status.kind === 'knockdown') {
      this.holding = gap > style.preferredRange ? forward(me.facing) : this.rest(me, gap);
    } else if (gap > style.preferredRange + 16) {
      this.fromAfar(state, me, gap, style);
    } else if (gap <= CPU_RANGES.close) {
      this.upClose(me, them, gap, aggression, style);
    } else if (this.random.chance(aggression)) {
      // A striking dash as a mid-range attack, if it can go in at once: nobody stops to charge up at this range.
      const dashAttack = this.pickDash(me, { strikes: true });
      const dashInputs = dashAttack ? this.quickInputs(dashAttack, me, this.random.chance(0.5)) : null;
      if (dashInputs && this.random.chance(DASH_ATTACK_CHANCE)) {
        this.queue = dashInputs;
      } else {
        this.queue = this.random.chance(0.5) ? [HK] : [DOWN | HK];
      }
    } else {
      this.holding = this.random.chance(0.5) ? forward(me.facing) : this.backOff(me, gap);
    }
  }

  private fromAfar(state: FightState, me: FighterState, gap: number, style: CpuStyle): void {
    const projectile = this.pickSpecial(me, 'projectile');
    const projectileOut = state.projectiles.some((shot) => shot.owner === this.me);
    const heal = this.pickSpecial(me, 'heal');
    const hurt = me.health < COMBAT.maxHealth * HEAL_BELOW;
    if (heal && hurt && !me.healUsed && gap >= CPU_RANGES.projectile && this.random.chance(HEAL_CHANCE)) {
      this.queue = this.specialInputs(heal, me, true);
    } else if (projectile && !projectileOut && gap >= CPU_RANGES.projectile && this.random.chance(style.projectileLove)) {
      this.queue = this.specialInputs(projectile, me, this.random.chance(0.5));
    } else if (gap <= CPU_RANGES.jumpIn && this.random.chance(style.jumpiness)) {
      this.queue = [UP | forward(me.facing)];
    } else if (this.random.chance(DASH_IN_CHANCE) && this.pickDash(me, { strikes: false })) {
      const dashIn = this.pickDash(me, { strikes: false });
      if (dashIn) this.queue = this.specialInputs(dashIn, me, false);
    } else {
      this.holding = forward(me.facing);
    }
  }

  private upClose(me: FighterState, them: FighterState, gap: number, aggression: number, style: CpuStyle): void {
    const throwable = them.status.kind === 'free' && them.posture !== 'airborne';
    const commandThrow = this.pickSpecial(me, 'commandThrow');
    const grab = commandThrow?.behaviour.kind === 'commandThrow' ? commandThrow.behaviour.rangePx : null;
    if (commandThrow && grab && throwable && gap <= grab.light - GRAB_MARGIN && this.random.chance(style.throwLove * aggression)) {
      this.queue = this.specialInputs(commandThrow, me, gap <= grab.heavy - GRAB_MARGIN);
    } else if (throwable && gap <= CPU_RANGES.throw && this.random.chance(style.throwLove * aggression)) {
      this.queue = [LP | LK];
    } else if (this.random.chance(aggression)) {
      const plans: InputBits[][] = [
        [LP, ...wait(CHAIN_GAP_STEPS), LP],
        [DOWN | LK, ...wait(CHAIN_GAP_STEPS), DOWN | LP],
        [HP],
        [DOWN | HK],
        [DOWN | HP],
      ];
      this.queue = [...(this.random.pick(plans) ?? [LP])];
    } else {
      this.holding = this.backOff(me, gap);
    }
  }

  /** A mistake: something done on impulse, whether or not it makes sense here. */
  private rash(me: FighterState): void {
    const plans: InputBits[][] = [[UP | forward(me.facing)], [HK], [DOWN | HK], [HP], [UP]];
    this.queue = [...(this.random.pick(plans) ?? [HK])];
  }

  private pickSpecial(me: FighterState, kind: SpecialMove['behaviour']['kind']): SpecialMove | undefined {
    return fighterData(me.character).specials.find((special) => special.behaviour.kind === kind);
  }

  /** A dash special with the wanted traits: one that strikes (or not), or one that projectiles pass through. */
  private pickDash(me: FighterState, wanted: { readonly strikes?: boolean; readonly projectileProof?: boolean }): SpecialMove | undefined {
    return fighterData(me.character).specials.find(({ behaviour, move }) => {
      if (behaviour.kind !== 'dash') return false;
      const strikes = move.segments.some((segment) => segment.strike);
      if (wanted.strikes !== undefined && strikes !== wanted.strikes) return false;
      return wanted.projectileProof === undefined || (behaviour.projectileProof === true) === wanted.projectileProof;
    });
  }

  /** The inputs that perform a special, released at once if its charge is already held. */
  private specialInputs(special: SpecialMove, me: FighterState, heavy: boolean): InputBits[] {
    return motionInputs(special.motion, me.facing, heavy ? HP : LP, this.history);
  }

  /**
   * What it holds while waiting, `gap` pixels from its opponent. A fighter whose answer to a
   * jump-in (an anti-air or a counter) is a charge crouches holding back while the opponent is out
   * of throw range, as charge players do, so it is ready; everyone else simply stands.
   */
  private rest(me: FighterState, gap: number): InputBits {
    const reaction = this.pickSpecial(me, 'rising') ?? this.pickSpecial(me, 'counter');
    const charges = reaction !== undefined && MOTIONS[reaction.motion].kind === 'charge';
    return charges && gap > CPU_RANGES.close ? back(me.facing) | DOWN : 0;
  }

  /** Giving ground: walking back, or crouching back while a charged answer to jump-ins is worth keeping ready. */
  private backOff(me: FighterState, gap: number): InputBits {
    return this.rest(me, gap) || back(me.facing);
  }

  /**
   * The inputs for a special that can go in straight away, for a reaction: a motion, or a charge
   * already held. Null for a charge that would first have to be built up.
   */
  private quickInputs(special: SpecialMove, me: FighterState, heavy: boolean): InputBits[] | null {
    const inputs = this.specialInputs(special, me, heavy);
    return MOTIONS[special.motion].kind === 'charge' && inputs.length > 1 ? null : inputs;
  }
}

function distance(a: FighterState, b: FighterState): number {
  return Math.abs(a.x - b.x) / SUBPIXELS_PER_PIXEL;
}

/** How the opponent's current move must be blocked, as far as the CPU can tell: by its first strike. */
function guardOf(fighter: FighterState): Guard {
  return moveOf(fighter)?.segments.find((segment) => segment.strike)?.strike?.guard ?? 'mid';
}

/** How a projectile must be blocked, from the special that threw it: a low one crouching. */
function projectileGuard(state: FightState, projectile: ProjectileState): Guard {
  const owner = state.fighters[projectile.owner];
  const behaviour = fighterData(owner.character).specials.find((special) => special.name === projectile.special)?.behaviour;
  return behaviour?.kind === 'projectile' ? behaviour.strike.guard : 'mid';
}
