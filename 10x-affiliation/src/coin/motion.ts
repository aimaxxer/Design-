import * as THREE from 'three'

const TAU = Math.PI * 2
const X_AXIS = new THREE.Vector3(1, 0, 0)
const IDENTITY = new THREE.Quaternion()
const _q = new THREE.Quaternion()
const smooth = (p: number) => p * p * (3 - 2 * p)

/**
 * Hand-driven rotation for one coin.
 * Horizontal drag turns it on its own axis and keeps the momentum (it folds
 * into the spin), vertical drag tips it toward/away from you and springs back.
 */
export class CoinMotion {
  /** Accumulated turn about the coin's own axis, radians. */
  spin = 0
  /** Tip toward/away from the viewer; springs back to upright. */
  readonly tumble = new THREE.Quaternion()
  dragging = false
  private spinVel = 0
  private tumbleVel = 0
  private releasedAt = -Infinity
  private tweens: { delta: number; start: number; dur: number }[] = []

  grab() {
    this.dragging = true
    this.spinVel = this.tumbleVel = 0
  }

  /** Pointer movement already converted to radians; dt in seconds. */
  drag(yaw: number, pitch: number, dt: number) {
    this.spin += yaw
    this.tumble.premultiply(_q.setFromAxisAngle(X_AXIS, pitch))
    this.spinVel += (yaw / dt - this.spinVel) * 0.5
    this.tumbleVel += (pitch / dt - this.tumbleVel) * 0.5
  }

  release(clock: number, keepMomentum: boolean) {
    this.dragging = false
    this.releasedAt = clock
    if (!keepMomentum) this.spinVel = this.tumbleVel = 0
    this.spinVel = THREE.MathUtils.clamp(this.spinVel, -14, 14)
    this.tumbleVel = THREE.MathUtils.clamp(this.tumbleVel, -8, 8)
  }

  /** Extra turns, eased with smoothstep (instant when motion is reduced). */
  turn(turns: number, seconds: number, clock: number, animate: boolean) {
    if (!animate) this.spin += turns * TAU
    else this.tweens.push({ delta: turns * TAU, start: clock, dur: Math.max(0.05, seconds) })
  }

  /** Advances flicks, tweens and the spring. Returns the in-flight tween angle to add to `spin`. */
  step(dt: number, clock: number, animate: boolean): number {
    let extra = 0
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tw = this.tweens[i]
      const p = (clock - tw.start) / tw.dur
      if (p >= 1) {
        this.spin += tw.delta
        this.tweens.splice(i, 1)
      } else extra += tw.delta * smooth(Math.max(0, p))
    }

    if (!this.dragging) {
      if (animate && this.spinVel) {
        this.spin += this.spinVel * dt
        this.spinVel *= Math.exp(-dt * 3)
        if (Math.abs(this.spinVel) < 0.02) this.spinVel = 0
      } else this.spinVel = 0
      if (animate && this.tumbleVel) {
        this.tumble.premultiply(_q.setFromAxisAngle(X_AXIS, this.tumbleVel * dt))
        this.tumbleVel *= Math.exp(-dt * 4)
        if (Math.abs(this.tumbleVel) < 0.02) this.tumbleVel = 0
      } else this.tumbleVel = 0
      if (animate && clock - this.releasedAt > 0.35) this.tumble.slerp(IDENTITY, 1 - Math.exp(-dt * 2.2))
    }

    this.spin %= TAU
    return extra
  }

  /** Nothing left to animate (upright, no momentum, no tweens). */
  get settled() {
    return (
      !this.dragging && 1 - Math.abs(this.tumble.w) < 1e-7 && !this.spinVel && !this.tumbleVel && !this.tweens.length
    )
  }
}
