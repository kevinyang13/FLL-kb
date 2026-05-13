# SUBMERGED Mission Solutions (All 15)

**Summary**: Robot program approach, attachment design, and calibration notes for all 15 SUBMERGED missions in one place. All solutions implemented in `project/proj-submerged-all-missions.lecp`.

**Sources**: wiki/submerged-missions.md, fllcasts.com, komurobo.com

**Last updated**: 2026-05-12

---

## How to Use the LECP

Load `project/proj-submerged-all-missions.lecp` into the LEGO coding canvas.
Each mission is triggered by a keyboard key. Press **Play**, then press the mission key.

| Key | Mission | Max Pts |
|-----|---------|---------|
| A | M01 Coral Nursery | 50 |
| B | M02 Shark | 30 |
| C | M03 Coral Reef | 20+ |
| D | M04 Scuba Diver | 40 |
| E | M05 Angler Fish | 30 |
| F | M06 Raise the Mast | 30 |
| G | M07 Kraken's Treasure | 20 |
| H | M08 Artificial Habitat | 40 |
| I | M09 Unexpected Encounter | 30 |
| J | M10 Send Submersible | 40 |
| K | M11 Sonar Discovery | 30 |
| L | M12 Feed the Whale | varies |
| M | M13 Change Shipping Lanes | 20 |
| N | M14 Sample Collection | 55 |
| O | M15 Research Vessel | 45 |

**Hardware**: dual-motor (drivetrain) + single motor (arm/scoop attachment)

All rotation values are **starting estimates** — calibrate on the actual mat before competition. Run each mission 10× per [[robot-design-principles]] testing protocol.

---

## M01 — Coral Nursery (Key: A, max 50 pts)

**Attachment**: Passive front wedge (pushes buds lever) + passive side hook (catches coral tree loop).

**Approach**:
1. Drive forward → wedge pushes lever → buds flip (20 pts)
2. Advance slightly → side hook catches tree loop
3. Reverse → tree lifts and hangs on support (20 pts); bottom drops into holder (+10 pts)

**Calibrate**:
- `M01_PHASE1_FWD` (~5 rot): wedge must hit lever cleanly
- `M01_PHASE2_FWD` (~1 rot): hook must catch tree loop
- `M01_PHASE3_REV` (~4 rot): tree must hang, not pull off

---

## M02 — Shark (Key: B, max 30 pts)

**Attachment**: None — front of robot pushes shark.

**Approach**:
1. Angle right slightly toward shark cave
2. Drive into cave → push shark out (20 pts)
3. Turn left → push shark toward habitat (10 pts)
4. Return home

**Calibrate**:
- Initial angle and forward distance to shark cave
- Turn angle to redirect shark toward habitat opening

---

## M03 — Coral Reef (Key: C, max 20 pts)

**Attachment**: Front wedge or bumper to push reef flip mechanism.

**Approach**:
1. Drive far across mat to coral reef model
2. Push flip lever → reef rotates up, not touching mat (20 pts)
3. Return home

**Calibrate**:
- `M03_FWD` (~10 rot): long drive across mat, must align precisely
- Push distance to fully lock reef in flipped position

---

## M04 — Scuba Diver (Key: D, max 40 pts)

**Attachment**: Motor-driven hook arm on right side of robot.

**Approach**:
1. Lower arm (motor Cw)
2. Drive to coral nursery → arm hook catches diver loop
3. Raise arm (motor Ccw) — diver lifted
4. Turn right, drive to coral reef support
5. Lower arm to hang diver on support (40 pts)
6. Return

**Calibrate**:
- Arm height at pickup vs. at hang position (different motor rotations)
- Drive distance and turn angle from nursery to reef support

---

## M05 — Angler Fish (Key: E, max 30 pts)

**Attachment**: None — front bumper pushes anglerfish.

**Approach**:
1. Drive slowly to shipwreck (far side of mat)
2. Push anglerfish directly into cavity until latch clicks (30 pts)
3. Brief pause — let latch engage
4. Return home

**Calibrate**:
- `M05_FWD` (~12 rot): must approach at precise angle to shipwreck cavity
- Speed low (30%) — too fast causes bounce-off instead of latch

---

## M06 — Raise the Mast (Key: F, max 30 pts)

**Attachment**: None — robot pushes mast lever on shipwreck.

**Approach**:
1. Drive to shipwreck
2. Push yellow lever at back of ship → mast raises and latches (30 pts)
3. Return

**Calibrate**:
- Must hit lever at correct angle — too much angle misses; too straight may jam
- Often combined with M07 (same model)

---

## M07 — Kraken's Treasure (Key: G, max 20 pts)

**Attachment**: Motor-driven lift arm (lifts ship's back to free chest).

**Approach**:
1. Drive to back of shipwreck
2. Lift arm raises ship's back (motor Cw) — do NOT raise too high or kraken closes
3. Push/scoop chest out of kraken's nest (20 pts)
4. Lower arm, return

**Calibrate**:
- Arm raise = exactly enough to free chest without triggering kraken closure
- Combine with M06 (push mast lever on approach, then retrieve chest)

---

## M08 — Artificial Habitat (Key: H, max 40 pts)

**Attachment**: None — robot front pushes segments upright.

**Approach**:
1. Drive to artificial habitat model
2. Push segments forward → each segment flips upright (10 pts each, 4 max)
3. Pause — let segments settle
4. Return

**Calibrate**:
- Width and angle of approach must center on all 4 segments
- No Equipment Constraint — robot can stay touching model while segments settle

---

## M09 — Unexpected Encounter (Key: I, max 30 pts)

**Attachment**: Optional basket/scoop to catch creature.

**Approach**:
1. Drive to creature platform
2. Push platform → creature releases (20 pts)
3. Slight turn → advance to guide creature toward cold seep (10 pts)
4. Return

**Calibrate**:
- Creature drops unpredictably — scoop attachment improves 10-pt consistency
- Push force must be enough to drop creature but not scatter it far

---

## M10 — Send Submersible (Key: J, max 40 pts)

**Attachment**: None — robot flips launch lever.

**Approach**:
1. Drive to launch lever (near center of mat)
2. Push lever down → submersible launches across mat (30 pts)
3. Wait 1s → submersible lands closer to opposing side (10 pts)
4. Return

**Calibrate**:
- Lever flip must be clean and fast — partial pushes don't launch
- 10-pt bonus depends on submersible landing position (varies by push force)

---

## M11 — Sonar Discovery (Key: K, max 30 pts)

**Attachment**: None — robot nudges/rotates sonar disc.

**Approach**:
1. Drive to sonar disc
2. Turn robot in place (DoubleMotorTurn 180°) — robot side sweeps disc → both whales revealed (30 pts)
3. Return

**Calibrate**:
- Approach angle is critical — robot must be alongside disc, not head-on
- 180° turn may only be needed for both whales; 90° gets one whale (20 pts)

---

## M12 — Feed the Whale (Key: L, max varies, 10 pts/krill)

**Attachment**: Motor-driven scoop on front.

**Approach**:
1. Lower scoop (motor Cw)
2. Drive forward → scoop collects krill pieces
3. Raise scoop (motor Ccw) — hold krill
4. Turn toward whale, drive to whale mouth
5. Lower scoop over mouth → krill falls in (10 pts each)
6. Return

**Calibrate**:
- Scoop height for collection vs. whale mouth height (may differ)
- Krill scatter easily — slow speed during collection phase

---

## M13 — Change Shipping Lanes (Key: M, max 20 pts)

**Attachment**: None — front bumper pushes ship.

**Approach**:
1. Drive to cargo ship (near center of mat)
2. Push ship sideways into new shipping lane (20 pts)
3. Return

**Calibrate**:
- Simple push — main risk is pushing ship too far past new lane
- Use low speed, short push distance

---

## M14 — Sample Collection (Key: N, max 55 pts)

**Attachment**: Motor-driven arm/scoop to collect and hold samples.

**Approach**:
1. Lower scoop (motor Cw)
2. Drive and sweep across sample locations (water sample, seabed, plankton, trident pieces)
3. Raise scoop (motor Ccw) — hold samples
4. Return home with samples (ready for M15 delivery)

**Scoring by item**:
- Water sample (5 pts): easiest — just displace from area
- Seabed sample (10 pts): lift off seabed
- Plankton sample (10 pts): detach from kelp
- Trident piece (20 pts + 10 bonus both): pull from shipwreck

**Calibrate**:
- Multi-item collection requires careful routing between sample locations
- Often run before M15 (samples collected → delivered in same extended run)

---

## M15 — Research Vessel (Key: O, max 45 pts)

**Attachment**: Motor-driven release mechanism to drop collected items into cargo.

**Approach**:
1. Drive to research vessel (with items already collected from M14 run)
2. Lower/release arm → items drop into cargo area (5 pts each item)
3. Drive forward precisely → port latch engages vessel loop (20 pts)
4. Wait — latch settles
5. Return

**Calibrate**:
- Docking (20 pts) requires very precise alignment — hardest part of mission
- Cargo delivery (5 pts each) is easier — partial credit available
- Best combined with M14 as one extended run: collect → deliver → dock

---

## Combining Missions (Efficiency)

High-value combinations that share a travel route:

| Combo | Total | Rationale |
|-------|-------|-----------|
| M01 + M02 | 80 pts | Both near home, left side |
| M06 + M07 | 50 pts | Same model (shipwreck) |
| M14 + M15 | 100 pts | Collect then deliver in one run |
| M01 + M02 + M03 | 100 pts | Left side sweep |

---

## Related pages
- [[submerged-missions]]
- [[solution-m01-coral-nursery]]
- [[robot-game]]
- [[robot-design-principles]]
- [[engineering-design-process]]
