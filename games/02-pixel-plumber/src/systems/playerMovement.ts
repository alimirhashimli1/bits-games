import { RUSTY } from '../config';

const MS_PER_SECOND = 1000;

/** What the player is asking for this frame, already read from keyboard or gamepad. */
export interface MovementInput {
  readonly left: boolean;
  readonly right: boolean;
  readonly down: boolean;
  readonly run: boolean;
  /** True only on the frame jump was pressed. */
  readonly jumpPressed: boolean;
  readonly jumpHeld: boolean;
}

/** The parts of a physics body that movement reads and changes. */
export interface MovementBody {
  readonly velocity: { x: number; y: number };
  readonly blocked: { readonly down: boolean };
}

export type MovementPose = 'stand' | 'walk' | 'run' | 'skid' | 'jump' | 'duck';

export interface MovementResult {
  readonly pose: MovementPose;
  /** 1 for right, -1 for left. */
  readonly facing: 1 | -1;
  /** True on the frame he leaves the ground, for the jump sound. */
  readonly jumped?: boolean;
}

/** Moves `value` towards `target` by at most `step`, without overshooting. */
function approach(value: number, target: number, step: number): number {
  return value < target ? Math.min(value + step, target) : Math.max(value - step, target);
}

/**
 * Rusty's platforming feel: acceleration, running, skidding, variable jump height,
 * coyote time and jump buffering. Gravity itself comes from the physics world.
 */
export class PlayerMovement {
  private coyoteMsLeft = 0;
  private jumpBufferMsLeft = 0;
  /** True from take-off until the jump is cut short or starts falling. */
  private rising = false;
  private facing: 1 | -1 = 1;

  update(body: MovementBody, input: MovementInput, canDuck: boolean, deltaMs: number): MovementResult {
    const seconds = deltaMs / MS_PER_SECOND;
    const onGround = body.blocked.down;
    const ducking = canDuck && onGround && input.down;
    const direction = ducking ? 0 : Number(input.right) - Number(input.left);

    const skidding = this.moveHorizontally(body, direction, input.run, onGround, seconds);
    const jumped = this.moveVertically(body, input, onGround, deltaMs);

    if (onGround && direction !== 0) this.facing = direction > 0 ? 1 : -1;
    return { pose: this.pose(body, onGround, ducking, skidding), facing: this.facing, jumped };
  }

  /** Returns true while braking against the current direction of travel on the ground. */
  private moveHorizontally(
    body: MovementBody,
    direction: number,
    running: boolean,
    onGround: boolean,
    seconds: number,
  ): boolean {
    const velocity = body.velocity;
    const topSpeed = running ? RUSTY.runSpeed : RUSTY.walkSpeed;

    if (direction === 0) {
      const deceleration = onGround ? RUSTY.releaseDeceleration : RUSTY.airReleaseDeceleration;
      velocity.x = approach(velocity.x, 0, deceleration * seconds);
      return false;
    }

    const turning = velocity.x !== 0 && Math.sign(velocity.x) !== direction;
    if (turning) {
      const deceleration = onGround ? RUSTY.skidDeceleration : RUSTY.airTurnDeceleration;
      velocity.x = approach(velocity.x, 0, deceleration * seconds);
      return onGround;
    }

    if (Math.abs(velocity.x) > topSpeed) {
      // Faster than allowed, e.g. run was just let go: ease down instead of stopping short.
      velocity.x = approach(velocity.x, direction * topSpeed, RUSTY.releaseDeceleration * seconds);
    } else {
      const acceleration = running ? RUSTY.runAcceleration : RUSTY.walkAcceleration;
      velocity.x = approach(velocity.x, direction * topSpeed, acceleration * seconds);
    }
    return false;
  }

  /** Returns true on the frame a jump starts. */
  private moveVertically(body: MovementBody, input: MovementInput, onGround: boolean, deltaMs: number): boolean {
    const velocity = body.velocity;
    let jumped = false;

    this.coyoteMsLeft = onGround ? RUSTY.coyoteMs : this.coyoteMsLeft - deltaMs;
    this.jumpBufferMsLeft = input.jumpPressed ? RUSTY.jumpBufferMs : this.jumpBufferMsLeft - deltaMs;

    if (this.jumpBufferMsLeft > 0 && this.coyoteMsLeft > 0) {
      velocity.y = -(RUSTY.jumpSpeed + Math.abs(velocity.x) * RUSTY.runJumpBonus);
      this.jumpBufferMsLeft = 0;
      this.coyoteMsLeft = 0;
      this.rising = true;
      jumped = true;
    }

    if (this.rising && !input.jumpHeld && velocity.y < -RUSTY.jumpCutSpeed) {
      velocity.y = -RUSTY.jumpCutSpeed;
      this.rising = false;
    }
    if (velocity.y >= 0) this.rising = false;

    velocity.y = Math.min(velocity.y, RUSTY.maxFallSpeed);
    return jumped;
  }

  private pose(body: MovementBody, onGround: boolean, ducking: boolean, skidding: boolean): MovementPose {
    if (ducking) return 'duck';
    if (!onGround) return 'jump';
    if (skidding) return 'skid';

    const speed = Math.abs(body.velocity.x);
    if (speed < RUSTY.stillSpeed) return 'stand';
    return speed > RUSTY.walkSpeed ? 'run' : 'walk';
  }
}
