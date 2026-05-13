# Solution: M01 Coral Nursery

**Summary**: Robot program and attachment design to score M01 Coral Nursery — coral buds (20 pts) + coral tree on support (20 pts) + tree bottom in holder (10 pts) = 50 pts max.

**Sources**: wiki/submerged-missions.md, fllcasts.com, komurobo.com

**Last updated**: 2026-05-12

---

## Mission Recap

| Condition | Points |
|-----------|--------|
| Coral buds flipped up | 20 |
| Coral tree hanging on support | 20 |
| Coral tree bottom in holder | +10 |
| **Total** | **50** |

No Equipment Constraint — robot may touch the model during the run but must not be touching it when time ends.

---

## Field Position

M01 is in the **near-left corner** of the mat, close to home base. Short travel distance makes this ideal for a first run. Robot launches from home facing the model.

---

## Attachment Design

**Front wedge (passive)**: A low angled ramp on the front of the robot. As the robot drives forward into the lever mechanism, the wedge slides under and lifts the lever arm, flipping the coral buds up. No motor needed — pure geometry.

**Side hook (passive)**: A small hook or peg mounted on the right side of the robot at the height of the coral tree loop. As the robot drives forward past the coral tree, the hook catches the tree's loop. When the robot reverses, the tree is carried backward and lifted onto the coral tree support arm.

Both attachments are passive (no extra motor). The entire mission is accomplished in two phases: forward drive + reverse.

---

## Program Logic

### Phase 1 — Coral Buds (20 pts)
1. Set drive speed to 40% (slow = reliable)
2. Drive forward ~5 rotations into the model
3. Front wedge pushes lever → buds flip up
4. Brief pause to let mechanism settle

### Phase 2 — Coral Tree (30 pts)
5. Continue forward slightly (~1 rotation) — side hook catches tree loop
6. Pause
7. Reverse ~4 rotations — tree lifts and hangs on support (20 pts)
8. Arm settles → bottom drops into holder (10 pts, often happens naturally)
9. Stop

Total drive time: ~10 seconds. Well within 2.5-minute match window.

---

## LECP File

`project/proj-m01-coral-nursery.lecp`

**Hardware**: dual-motor (drivetrain), motor (reserved for optional arm upgrade)
**Blocks**: EventsWhenProgramStarts → DoubleMotorSetSpeed → DoubleMotorRunForRotations (×3) → ControlWait (×2) → DoubleMotorStop

### Calibration Notes

All rotation values are starting estimates. Must be tuned on actual mat:
- `PHASE1_FWD` (~5 rot): drive to lever and push buds
- `PHASE2_FWD` (~1 rot): advance to hook coral tree
- `PHASE3_REV` (~4 rot): reverse to hang tree on support

Run 10 times per [[robot-design-principles]] testing protocol. Shift the mat slightly between runs to test variability.

---

## Common Failures

| Failure | Cause | Fix |
|---------|-------|-----|
| Buds don't flip | Wedge angle too steep or robot offset | Adjust wedge geometry or starting position |
| Tree misses hook | Robot too far left/right | Add tape mark on floor for consistent start |
| Tree falls off support | Reversed too fast | Reduce speed to 30%, add ControlWait before stop |
| Tree bottom misses holder | Reversed too far | Reduce PHASE3_REV by 0.5 rotations |

---

## Scoring Strategy

- **Target**: 40 pts minimum (buds + tree hang) — skip the +10 holder bonus until reliable
- **Stretch**: 50 pts once consistent over 10 runs
- Combine with M02 Shark (same side of mat) for a 70-pt run once M01 is solid

---

## Related pages
- [[submerged-missions]]
- [[robot-game]]
- [[robot-design-principles]]
- [[engineering-design-process]]
