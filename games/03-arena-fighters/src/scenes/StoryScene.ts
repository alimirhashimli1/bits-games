import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { playMusic } from '@shared/audio/music';
import { blink } from '@shared/phaser/effects';
import { addCenteredPixelText, addPixelText, setCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';
import { Typewriter } from '@shared/phaser/typewriter';

import { COLORS, STORY, TIMINGS } from '../config';
import { FIGHTERS, fighterName, isPlayableId, type PlayableId } from '../content/roster';
import { STORY_MUSIC } from '../content/music';
import { SOUNDS } from '../content/sounds';
import { FIGHTER_STORIES, STORY_LINES } from '../content/story/arcadeStory';
import { arcadeMatch } from '../systems/arcade';
import { DEFAULT_MATCH, type MatchSetup } from '../systems/matchSetup';
import { SCENES } from './sceneKeys';
import { ScreenInput } from './screenInput';

const TITLE_Y = 30;
const TEXT_LEFT = 42;
const FIRST_LINE_Y = 62;
const LINE_HEIGHT = 12;
const PROMPT_Y = 150;

/** Both prompts are the same length, so the centred prompt does not jump when it changes. */
const PROMPT_WHILE_TYPING = 'ENTER: SHOW ALL';
const PROMPT_WHEN_DONE = 'ENTER: GO ON   ';

/** Which story a run is being shown: the one before the ladder, or the one after the boss. */
export type StoryKind = 'intro' | 'ending';

export interface StoryRequest {
  readonly kind: StoryKind;
  readonly setup: MatchSetup;
}

/**
 * A fighter's story: their reason for entering, shown before the first rung of the ladder, and
 * what they do with the crown, shown after Magnus Vane falls. The lines type themselves out;
 * confirm shows them all at once, and confirm again moves on — into the first fight, or, at the
 * end of a run, back to the title the way an arcade cabinet resets.
 */
export class StoryScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private screenInput!: ScreenInput;
  private typewriter!: Typewriter;
  private prompt!: Phaser.GameObjects.BitmapText;
  private request!: StoryRequest;
  private leaving = false;

  constructor() {
    super(SCENES.story);
  }

  create(request: StoryRequest = { kind: 'intro', setup: DEFAULT_MATCH }): void {
    fadeIn(this);
    playMusic(STORY_MUSIC);
    this.request = request;
    this.leaving = false;
    this.screenInput = new ScreenInput(this);

    const fighter = storyFighter(request.setup);
    const story = FIGHTER_STORIES[fighter];
    const heading = request.kind === 'intro' ? fighterName(fighter) : story.endingTitle;
    addCenteredPixelText(this, TITLE_Y, heading, { color: COLORS.title });

    // Lines are left-aligned on a shared edge, since centring each one would make them creep
    // sideways as the typewriter fills them. Every line gets a label, empty ones included.
    const lines = request.kind === 'intro' ? story.intro : story.ending;
    const padded = Array.from({ length: STORY_LINES }, (_, line) => lines[line] ?? '');
    const labels = padded.map((_, line) =>
      addPixelText(this, TEXT_LEFT, FIRST_LINE_Y + line * LINE_HEIGHT, '', { color: COLORS.text }),
    );
    this.typewriter = new Typewriter(labels, padded, STORY.charsPerSecond);

    this.prompt = addCenteredPixelText(this, PROMPT_Y, PROMPT_WHILE_TYPING, { color: COLORS.muted });
    blink(this, this.prompt, TIMINGS.promptBlinkMs);
  }

  override update(_time: number, deltaMs: number): void {
    this.screenInput.update();
    this.typewriter.update(deltaMs);
    const wanted = this.typewriter.isFinished ? PROMPT_WHEN_DONE : PROMPT_WHILE_TYPING;
    if (this.prompt.text !== wanted) setCenteredPixelText(this.prompt, wanted);

    if (this.leaving || !this.screenInput.justPressed('confirm')) return;
    playSound(SOUNDS.confirm);
    if (!this.typewriter.isFinished) {
      this.typewriter.finish();
      return;
    }
    this.leave();
  }

  private leave(): void {
    this.leaving = true;
    const run = this.request.setup.arcade;
    if (this.request.kind === 'ending' || !run) {
      fadeToScene(this, SCENES.title);
      return;
    }
    fadeToScene(this, SCENES.versus, arcadeMatch(run, this.request.setup.rules));
  }
}

/**
 * Whose story to tell: the fighter the run was started with. Only the fifteen have stories and
 * only they can be chosen, so the boss never reaches here; the fallback is for a match that
 * arrives without a run at all, which only the development shortcut can do.
 */
function storyFighter(setup: MatchSetup): PlayableId {
  const fighter = setup.arcade?.fighter ?? setup.fighters[0];
  return isPlayableId(fighter) ? fighter : FIGHTERS[0].id;
}
