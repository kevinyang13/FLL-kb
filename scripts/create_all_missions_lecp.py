#!/usr/bin/env python3
"""
Build proj-submerged-all-missions.lecp — all 15 SUBMERGED missions in one file.

Each mission is triggered by a keyboard key (A-O). Press Play then press
the key for the mission you want to run.

Key → Mission:
  A = M01 Coral Nursery       F = M06 Raise the Mast      K = M11 Sonar Discovery
  B = M02 Shark               G = M07 Kraken's Treasure   L = M12 Feed the Whale
  C = M03 Coral Reef          H = M08 Artificial Habitat  M = M13 Change Shipping Lanes
  D = M04 Scuba Diver         I = M09 Unexpected Encounter N = M14 Sample Collection
  E = M05 Angler Fish         J = M10 Send Submersible    O = M15 Research Vessel

All rotation values are STARTING ESTIMATES — calibrate on actual mat.
Edit the constants below, then re-run this script to regenerate the LECP.
"""
import json
import zipfile
from pathlib import Path

OUT_DIR = Path("project")
OUT_DIR.mkdir(exist_ok=True)

# ===========================================================================
# CALIBRATION CONSTANTS — edit these after testing on real mat
# ===========================================================================

DRIVE_SPEED   = 40   # % default drive speed
SLOW_SPEED    = 30   # % for precision moves
FAST_SPEED    = 50   # % for simple pushes

# M01 Coral Nursery
M01_PHASE1_FWD  = 5.0   # rot — drive to buds lever
M01_PHASE2_FWD  = 1.0   # rot — advance to hook tree
M01_PHASE3_REV  = 4.0   # rot — reverse to hang tree
M01_SETTLE      = 0.5   # s
M01_HANG        = 0.8   # s

# M02 Shark
M02_ANGLE_R     = 30    # deg — initial right angle toward shark cave
M02_FWD         = 6.0   # rot — drive to shark
M02_PUSH        = 1.5   # rot — push shark out of cave
M02_ANGLE_L     = 45    # deg — redirect toward habitat
M02_HABITAT     = 2.0   # rot — push shark toward habitat
M02_REV         = 9.0   # rot — return home

# M03 Coral Reef
M03_FWD         = 10.0  # rot — drive to reef model
M03_PUSH        = 2.0   # rot — push flip lever
M03_SETTLE      = 0.3   # s
M03_REV         = 12.0  # rot — return home

# M04 Scuba Diver
M04_ARM_DOWN    = 2.0   # rot — lower hook arm (Cw)
M04_FWD_NURSERY = 3.0   # rot — drive to diver at nursery
M04_ARM_UP      = 2.0   # rot — raise arm with diver (Ccw)
M04_TURN_R      = 90    # deg — turn toward reef
M04_FWD_REEF    = 8.0   # rot — drive to reef support
M04_ARM_HANG    = 1.5   # rot — lower arm to hang diver (Cw)
M04_SETTLE      = 0.5   # s
M04_REV         = 8.0   # rot — return

# M05 Angler Fish
M05_FWD         = 12.0  # rot — drive to shipwreck
M05_PUSH        = 2.0   # rot — push anglerfish into cavity
M05_SETTLE      = 0.5   # s
M05_REV         = 14.0  # rot — return

# M06 Raise the Mast
M06_FWD         = 14.0  # rot — drive to shipwreck lever
M06_PUSH        = 1.5   # rot — push mast lever until latched
M06_SETTLE      = 0.5   # s
M06_REV         = 15.5  # rot — return

# M07 Kraken's Treasure
M07_FWD         = 13.0  # rot — drive to back of ship
M07_ARM_LIFT    = 1.0   # rot — lift ship slightly (Cw) — do NOT over-lift
M07_CHEST_OUT   = 1.0   # rot — push chest clear of nest
M07_CHEST_BACK  = 1.0   # rot — back with chest
M07_ARM_DOWN    = 1.0   # rot — lower arm (Ccw)
M07_REV         = 13.0  # rot — return

# M08 Artificial Habitat
M08_FWD         = 9.0   # rot — drive to habitat model
M08_PUSH        = 2.0   # rot — push segments upright
M08_SETTLE      = 0.5   # s
M08_REV         = 11.0  # rot — return

# M09 Unexpected Encounter
M09_FWD         = 11.0  # rot — drive to creature platform
M09_PUSH        = 1.5   # rot — push platform, release creature
M09_SETTLE      = 0.3   # s
M09_ANGLE_L     = 30    # deg — angle toward cold seep
M09_GUIDE       = 2.0   # rot — guide creature toward cold seep
M09_REV         = 5.0   # rot — return

# M10 Send Submersible
M10_FWD         = 7.0   # rot — drive to launch lever
M10_FLIP        = 1.0   # rot — flip lever
M10_WAIT        = 1.0   # s   — wait for submersible to land
M10_REV         = 8.0   # rot — return

# M11 Sonar Discovery
M11_FWD         = 9.0   # rot — drive alongside sonar disc
M11_TURN        = 180   # deg — sweep robot side across disc
M11_SETTLE      = 0.5   # s
M11_REV         = 9.0   # rot — return

# M12 Feed the Whale
M12_SCOOP_DOWN  = 1.5   # rot — lower scoop (Cw)
M12_COLLECT     = 4.0   # rot — drive forward to scoop krill
M12_SCOOP_UP    = 1.5   # rot — raise scoop (Ccw)
M12_TURN_R      = 60    # deg — turn toward whale
M12_FWD_WHALE   = 8.0   # rot — drive to whale mouth
M12_SCOOP_DUMP  = 1.5   # rot — lower over mouth to deposit (Cw)
M12_SETTLE      = 0.5   # s
M12_REV         = 8.0   # rot — return

# M13 Change Shipping Lanes
M13_FWD         = 6.0   # rot — drive to cargo ship
M13_PUSH        = 2.0   # rot — push into new lane
M13_SETTLE      = 0.3   # s
M13_REV         = 8.0   # rot — return

# M14 Sample Collection
M14_ARM_DOWN    = 1.0   # rot — lower scoop (Cw)
M14_SWEEP1      = 5.0   # rot — sweep first sample area
M14_TURN_R      = 45    # deg — reangle for more samples
M14_SWEEP2      = 3.0   # rot — collect remaining samples
M14_ARM_UP      = 1.0   # rot — raise scoop (Ccw)
M14_REV         = 8.0   # rot — return home with samples

# M15 Research Vessel
M15_FWD         = 12.0  # rot — drive to vessel
M15_RELEASE     = 1.5   # rot — lower arm to drop items into cargo (Cw)
M15_SETTLE      = 0.5   # s
M15_DOCK        = 1.0   # rot — advance to engage port latch
M15_LATCH       = 1.0   # s   — wait for latch to engage
M15_REV         = 13.0  # rot — return

# ===========================================================================
# Helpers
# ===========================================================================

def num(n, id):
    return {"shadow": {"type": "ShadowNumber", "id": id, "fields": {"NUMBER": n}}}

def rotations(v, id):
    return {"shadow": {"type": "RotationsShadow", "id": id, "fields": {"VALUE": v}}}

def speed_shadow(v, id):
    return {"shadow": {"type": "SpeedShadow", "id": id, "fields": {"VALUE": v}}}

def degrees_shadow(v, id):
    return {"shadow": {"type": "TurnForDegreesShadow", "id": id, "fields": {"VALUE": v}}}

def chain(*blocks):
    """Link blocks into a next-chain. Ignores None entries."""
    blocks = [b for b in blocks if b is not None]
    if not blocks:
        return None
    result = dict(blocks[0])
    cur = result
    for b in blocks[1:]:
        cur["next"] = {"block": dict(b)}
        cur = cur["next"]["block"]
    return result

def drive_speed(pct, id, motor="BOTH"):
    return {
        "type": "DoubleMotorSetSpeed", "id": id,
        "fields": {"MOTOR": motor},
        "inputs": {"SPEED": speed_shadow(pct, f"sh_{id}_spd")},
    }

def drive_fwd(rot, id):
    return {
        "type": "DoubleMotorRunForRotations", "id": id,
        "fields": {"MOTOR": "BOTH", "DIRECTION": "Forward", "UNIT": "ROTATIONS"},
        "inputs": {"VALUE": rotations(rot, f"sh_{id}_rot")},
    }

def drive_rev(rot, id):
    return {
        "type": "DoubleMotorRunForRotations", "id": id,
        "fields": {"MOTOR": "BOTH", "DIRECTION": "Backward", "UNIT": "ROTATIONS"},
        "inputs": {"VALUE": rotations(rot, f"sh_{id}_rot")},
    }

def turn(direction, deg, id):
    return {
        "type": "DoubleMotorTurn", "id": id,
        "fields": {"DIRECTION": direction},
        "inputs": {"DEGREES": degrees_shadow(deg, f"sh_{id}_deg")},
    }

def wait(secs, id):
    return {
        "type": "ControlWait", "id": id,
        "inputs": {"SECONDS": num(secs, f"sh_{id}_sec")},
    }

def stop(id):
    return {"type": "DoubleMotorStop", "id": id, "fields": {"MOTOR": "BOTH"}}

def arm_cw(rot, id):
    """Lower arm / scoop (clockwise)."""
    return {
        "type": "MotorRunForRotations", "id": id,
        "fields": {"DIRECTION": "Cw", "UNIT": "ROTATIONS"},
        "inputs": {"VALUE": rotations(rot, f"sh_{id}_rot")},
    }

def arm_ccw(rot, id):
    """Raise arm / scoop (counterclockwise)."""
    return {
        "type": "MotorRunForRotations", "id": id,
        "fields": {"DIRECTION": "Ccw", "UNIT": "ROTATIONS"},
        "inputs": {"VALUE": rotations(rot, f"sh_{id}_rot")},
    }

def mission(key, mission_id, spd_id, spd_pct, *seq_blocks):
    """Wrap a block sequence in EventsWhenKeyPressed."""
    return {
        "type": "EventsWhenKeyPressed",
        "id": f"{mission_id}_trigger",
        "fields": {"KEY": key},
        "next": {"block": chain(
            drive_speed(spd_pct, spd_id),
            *seq_blocks,
            stop(f"{mission_id}_stop"),
        )},
    }

# ===========================================================================
# Mission programs
# ===========================================================================

# Layout: 3 columns × 5 rows, plus startup block
COL = [30, 700, 1370, 2040]
ROW = [30, 400, 770, 1140, 1510]

def at(block, col, row):
    b = dict(block)
    b["x"] = COL[col]
    b["y"] = ROW[row]
    return b

# ---- M01 Coral Nursery (Key: a) -----------------------------------------
m01 = mission("a", "m01", "m01_spd", DRIVE_SPEED,
    drive_fwd(M01_PHASE1_FWD, "m01_p1"),
    wait(M01_SETTLE, "m01_settle"),
    drive_fwd(M01_PHASE2_FWD, "m01_p2"),
    drive_rev(M01_PHASE3_REV, "m01_p3"),
    wait(M01_HANG, "m01_hang"),
)

# ---- M02 Shark (Key: b) --------------------------------------------------
m02 = mission("b", "m02", "m02_spd", DRIVE_SPEED,
    turn("Right", M02_ANGLE_R, "m02_turn1"),
    drive_fwd(M02_FWD, "m02_fwd1"),
    drive_fwd(M02_PUSH, "m02_push"),
    turn("Left", M02_ANGLE_L, "m02_turn2"),
    drive_fwd(M02_HABITAT, "m02_hab"),
    drive_rev(M02_REV, "m02_rev"),
)

# ---- M03 Coral Reef (Key: c) ---------------------------------------------
m03 = mission("c", "m03", "m03_spd", DRIVE_SPEED,
    drive_fwd(M03_FWD, "m03_fwd"),
    drive_fwd(M03_PUSH, "m03_push"),
    wait(M03_SETTLE, "m03_settle"),
    drive_rev(M03_REV, "m03_rev"),
)

# ---- M04 Scuba Diver (Key: d) --------------------------------------------
m04 = mission("d", "m04", "m04_spd", DRIVE_SPEED,
    arm_cw(M04_ARM_DOWN, "m04_arm_dn"),
    drive_fwd(M04_FWD_NURSERY, "m04_fwd1"),
    arm_ccw(M04_ARM_UP, "m04_arm_up"),
    turn("Right", M04_TURN_R, "m04_turn"),
    drive_fwd(M04_FWD_REEF, "m04_fwd2"),
    arm_cw(M04_ARM_HANG, "m04_arm_hang"),
    wait(M04_SETTLE, "m04_settle"),
    drive_rev(M04_REV, "m04_rev"),
)

# ---- M05 Angler Fish (Key: e) --------------------------------------------
m05 = mission("e", "m05", "m05_spd", SLOW_SPEED,
    drive_fwd(M05_FWD, "m05_fwd"),
    drive_fwd(M05_PUSH, "m05_push"),
    wait(M05_SETTLE, "m05_settle"),
    drive_rev(M05_REV, "m05_rev"),
)

# ---- M06 Raise the Mast (Key: f) ----------------------------------------
m06 = mission("f", "m06", "m06_spd", DRIVE_SPEED,
    drive_fwd(M06_FWD, "m06_fwd"),
    drive_fwd(M06_PUSH, "m06_push"),
    wait(M06_SETTLE, "m06_settle"),
    drive_rev(M06_REV, "m06_rev"),
)

# ---- M07 Kraken's Treasure (Key: g) -------------------------------------
m07 = mission("g", "m07", "m07_spd", SLOW_SPEED,
    drive_fwd(M07_FWD, "m07_fwd"),
    arm_cw(M07_ARM_LIFT, "m07_arm_lift"),
    drive_fwd(M07_CHEST_OUT, "m07_chest_out"),
    drive_rev(M07_CHEST_BACK, "m07_chest_back"),
    arm_ccw(M07_ARM_DOWN, "m07_arm_dn"),
    drive_rev(M07_REV, "m07_rev"),
)

# ---- M08 Artificial Habitat (Key: h) ------------------------------------
m08 = mission("h", "m08", "m08_spd", DRIVE_SPEED,
    drive_fwd(M08_FWD, "m08_fwd"),
    drive_fwd(M08_PUSH, "m08_push"),
    wait(M08_SETTLE, "m08_settle"),
    drive_rev(M08_REV, "m08_rev"),
)

# ---- M09 Unexpected Encounter (Key: i) ----------------------------------
m09 = mission("i", "m09", "m09_spd", DRIVE_SPEED,
    drive_fwd(M09_FWD, "m09_fwd"),
    drive_fwd(M09_PUSH, "m09_push"),
    wait(M09_SETTLE, "m09_settle"),
    turn("Left", M09_ANGLE_L, "m09_turn"),
    drive_fwd(M09_GUIDE, "m09_guide"),
    drive_rev(M09_REV, "m09_rev"),
)

# ---- M10 Send Submersible (Key: j) --------------------------------------
m10 = mission("j", "m10", "m10_spd", FAST_SPEED,
    drive_fwd(M10_FWD, "m10_fwd"),
    drive_fwd(M10_FLIP, "m10_flip"),
    wait(M10_WAIT, "m10_wait"),
    drive_rev(M10_REV, "m10_rev"),
)

# ---- M11 Sonar Discovery (Key: k) ---------------------------------------
m11 = mission("k", "m11", "m11_spd", DRIVE_SPEED,
    drive_fwd(M11_FWD, "m11_fwd"),
    turn("Right", M11_TURN, "m11_turn"),
    wait(M11_SETTLE, "m11_settle"),
    drive_rev(M11_REV, "m11_rev"),
)

# ---- M12 Feed the Whale (Key: l) ----------------------------------------
m12 = mission("l", "m12", "m12_spd", DRIVE_SPEED,
    arm_cw(M12_SCOOP_DOWN, "m12_scoop_dn"),
    drive_fwd(M12_COLLECT, "m12_collect"),
    arm_ccw(M12_SCOOP_UP, "m12_scoop_up"),
    turn("Right", M12_TURN_R, "m12_turn"),
    drive_fwd(M12_FWD_WHALE, "m12_fwd_whale"),
    arm_cw(M12_SCOOP_DUMP, "m12_dump"),
    wait(M12_SETTLE, "m12_settle"),
    drive_rev(M12_REV, "m12_rev"),
)

# ---- M13 Change Shipping Lanes (Key: m) ---------------------------------
m13 = mission("m", "m13", "m13_spd", FAST_SPEED,
    drive_fwd(M13_FWD, "m13_fwd"),
    drive_fwd(M13_PUSH, "m13_push"),
    wait(M13_SETTLE, "m13_settle"),
    drive_rev(M13_REV, "m13_rev"),
)

# ---- M14 Sample Collection (Key: n) -------------------------------------
m14 = mission("n", "m14", "m14_spd", DRIVE_SPEED,
    arm_cw(M14_ARM_DOWN, "m14_arm_dn"),
    drive_fwd(M14_SWEEP1, "m14_sweep1"),
    turn("Right", M14_TURN_R, "m14_turn"),
    drive_fwd(M14_SWEEP2, "m14_sweep2"),
    arm_ccw(M14_ARM_UP, "m14_arm_up"),
    drive_rev(M14_REV, "m14_rev"),
)

# ---- M15 Research Vessel (Key: o) ---------------------------------------
m15 = mission("o", "m15", "m15_spd", SLOW_SPEED,
    drive_fwd(M15_FWD, "m15_fwd"),
    arm_cw(M15_RELEASE, "m15_release"),
    wait(M15_SETTLE, "m15_settle"),
    drive_fwd(M15_DOCK, "m15_dock"),
    wait(M15_LATCH, "m15_latch"),
    drive_rev(M15_REV, "m15_rev"),
)

# ---- Startup (EventsWhenProgramStarts) ----------------------------------
startup = {
    "type": "EventsWhenProgramStarts", "id": "startup",
    "next": {"block": drive_speed(DRIVE_SPEED, "startup_spd")},
}

# ===========================================================================
# Canvas layout — 3 cols × 5 rows + startup in col 3 row 5
# ===========================================================================
canvas_blocks = [
    at(startup, 3, 4),
    at(m01, 0, 0), at(m02, 0, 1), at(m03, 0, 2), at(m04, 0, 3), at(m05, 0, 4),
    at(m06, 1, 0), at(m07, 1, 1), at(m08, 1, 2), at(m09, 1, 3), at(m10, 1, 4),
    at(m11, 2, 0), at(m12, 2, 1), at(m13, 2, 2), at(m14, 2, 3), at(m15, 2, 4),
]

# ===========================================================================
# Assemble project
# ===========================================================================
project = {
    "manifest": {
        "id": "proj-submerged-all-missions-001",
        "name": "SUBMERGED All Missions",
        "type": "word",
        "created": "2026-05-12T00:00:00.000Z",
        "hardware": [
            {"type": "dual-motor", "identifier": "1"},
            {"type": "motor",      "identifier": "1"},
        ],
        "toolbox": {
            "DoubleMotor": [
                "DoubleMotorRunForRotations",
                "DoubleMotorSetSpeed",
                "DoubleMotorTurn",
                "DoubleMotorStop",
            ],
            "Motor": [
                "MotorRunForRotations",
            ],
            "Control": ["ControlWait"],
            "Events": [
                "EventsWhenProgramStarts",
                "EventsWhenKeyPressed",
            ],
        },
    },
    "canvas": {
        "blocks": {"languageVersion": 1, "blocks": canvas_blocks},
        "palette": "lesson",
        "sounds": [],
        "workspaceComments": [
            {
                "id": "comment_keys",
                "text": "A=M01 B=M02 C=M03 D=M04 E=M05\nF=M06 G=M07 H=M08 I=M09 J=M10\nK=M11 L=M12 M=M13 N=M14 O=M15\n\nPress Play, then press key to run mission.",
                "x": COL[3], "y": ROW[0], "width": 300, "height": 140,
            },
            {
                "id": "comment_cal",
                "text": "CALIBRATION: Edit constants at top of\nscripts/create_all_missions_lecp.py\nthen re-run to regenerate this file.",
                "x": COL[3], "y": ROW[2], "width": 300, "height": 80,
            },
        ],
    },
    "lessonPin": "0000",
}

# ===========================================================================
# Write JSON + LECP
# ===========================================================================
project_str = json.dumps(project, indent=2, ensure_ascii=False)
json.loads(project_str)  # validate round-trip

json_path = OUT_DIR / "proj-submerged-all-missions.json"
json_path.write_text(project_str, encoding="utf-8")

lecp_path = OUT_DIR / "proj-submerged-all-missions.lecp"
with zipfile.ZipFile(lecp_path, "w", compression=zipfile.ZIP_DEFLATED) as z:
    z.writestr("project.json", project_str)

print(f"Created: {json_path}")
print(f"Created: {lecp_path}")
print(f"  ZIP size  : {lecp_path.stat().st_size:,} bytes")
print(f"  JSON size : {len(project_str):,} bytes")
print()
print("Key map:")
keys = [("a","M01 Coral Nursery"), ("b","M02 Shark"), ("c","M03 Coral Reef"),
        ("d","M04 Scuba Diver"), ("e","M05 Angler Fish"), ("f","M06 Raise the Mast"),
        ("g","M07 Kraken's Treasure"), ("h","M08 Artificial Habitat"),
        ("i","M09 Unexpected Encounter"), ("j","M10 Send Submersible"),
        ("k","M11 Sonar Discovery"), ("l","M12 Feed the Whale"),
        ("m","M13 Change Shipping Lanes"), ("n","M14 Sample Collection"),
        ("o","M15 Research Vessel")]
for k, name in keys:
    print(f"  {k.upper()} → {name}")
