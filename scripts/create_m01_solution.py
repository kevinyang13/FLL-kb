#!/usr/bin/env python3
"""
Build proj-m01-coral-nursery.lecp — M01 Coral Nursery solution.

Two-phase passive-attachment approach:
  Phase 1: Drive forward → front wedge pushes buds lever (20 pts)
  Phase 2: Advance to hook coral tree loop, then reverse to hang on support (20+10 pts)

Rotation values are starting estimates — must be calibrated on actual mat.
"""
import json
import zipfile
from pathlib import Path

OUT_DIR = Path("project")
OUT_DIR.mkdir(exist_ok=True)

# ---------------------------------------------------------------------------
# Calibration constants — tune these on the real mat
# ---------------------------------------------------------------------------
DRIVE_SPEED    = 40    # % — slow for reliability
PHASE1_FWD     = 5.0   # rotations — drive to lever, push coral buds
PHASE2_FWD     = 1.0   # rotations — advance to hook coral tree loop
PHASE3_REV     = 4.0   # rotations — reverse to hang tree on support
SETTLE_WAIT    = 0.5   # seconds — pause after buds flip before advancing
HANG_WAIT      = 0.8   # seconds — pause after hang to let tree settle

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def num(n, id):
    return {"shadow": {"type": "ShadowNumber", "id": id, "fields": {"NUMBER": n}}}

def rotations(v, id):
    return {"shadow": {"type": "RotationsShadow", "id": id, "fields": {"VALUE": v}}}

def speed(v, id):
    return {"shadow": {"type": "SpeedShadow", "id": id, "fields": {"VALUE": v}}}

# ---------------------------------------------------------------------------
# Block sequence
# ---------------------------------------------------------------------------

# Step 1: Set drive speed (both motors)
set_speed = {
    "type": "DoubleMotorSetSpeed", "id": "b_set_speed",
    "fields": {"MOTOR": "BOTH"},
    "inputs": {"SPEED": speed(DRIVE_SPEED, "sh_speed")},
}

# Step 2: Phase 1 — drive forward to push coral buds lever
phase1_fwd = {
    "type": "DoubleMotorRunForRotations", "id": "b_phase1_fwd",
    "fields": {"MOTOR": "BOTH", "DIRECTION": "Forward", "UNIT": "ROTATIONS"},
    "inputs": {"VALUE": rotations(PHASE1_FWD, "sh_p1_rot")},
}

# Step 3: Pause — let buds mechanism settle
settle_pause = {
    "type": "ControlWait", "id": "b_settle",
    "inputs": {"SECONDS": num(SETTLE_WAIT, "sh_settle")},
}

# Step 4: Phase 2 — advance slightly to hook coral tree loop
phase2_fwd = {
    "type": "DoubleMotorRunForRotations", "id": "b_phase2_fwd",
    "fields": {"MOTOR": "BOTH", "DIRECTION": "Forward", "UNIT": "ROTATIONS"},
    "inputs": {"VALUE": rotations(PHASE2_FWD, "sh_p2_rot")},
}

# Step 5: Phase 3 — reverse to lift and hang coral tree on support
phase3_rev = {
    "type": "DoubleMotorRunForRotations", "id": "b_phase3_rev",
    "fields": {"MOTOR": "BOTH", "DIRECTION": "Backward", "UNIT": "ROTATIONS"},
    "inputs": {"VALUE": rotations(PHASE3_REV, "sh_p3_rot")},
}

# Step 6: Pause — let tree settle into holder
hang_pause = {
    "type": "ControlWait", "id": "b_hang_pause",
    "inputs": {"SECONDS": num(HANG_WAIT, "sh_hang")},
}

# Step 7: Stop both motors
stop = {
    "type": "DoubleMotorStop", "id": "b_stop",
    "fields": {"MOTOR": "BOTH"},
}

# Chain all steps into a single sequence under EventsWhenProgramStarts
def chain(*blocks):
    if not blocks:
        return None
    root = dict(blocks[0])
    cur = root
    for b in blocks[1:]:
        cur["next"] = {"block": dict(b)}
        cur = cur["next"]["block"]
    return root

sequence = chain(
    set_speed,
    phase1_fwd,
    settle_pause,
    phase2_fwd,
    phase3_rev,
    hang_pause,
    stop,
)

blocks = [
    {
        "type": "EventsWhenProgramStarts", "id": "b_start",
        "x": 80, "y": 80,
        "next": {"block": sequence},
    }
]

# ---------------------------------------------------------------------------
# Assemble project
# ---------------------------------------------------------------------------
project = {
    "manifest": {
        "id": "proj-m01-coral-nursery-001",
        "name": "M01 Coral Nursery",
        "type": "word",
        "created": "2026-05-12T00:00:00.000Z",
        "hardware": [
            {"type": "dual-motor", "identifier": "1"},
        ],
        "toolbox": {
            "DoubleMotor": [
                "DoubleMotorRunForRotations",
                "DoubleMotorSetSpeed",
                "DoubleMotorStop",
            ],
            "Control": ["ControlWait"],
            "Events": ["EventsWhenProgramStarts"],
        },
    },
    "canvas": {
        "blocks": {"languageVersion": 1, "blocks": blocks},
        "palette": "lesson",
        "sounds": [],
        "workspaceComments": [
            {
                "id": "comment_phase1",
                "text": "Phase 1: Drive forward to push coral buds lever (20 pts)\nCalibrate PHASE1_FWD so front wedge hits lever cleanly.",
                "x": 80, "y": 20, "width": 400, "height": 50,
            },
            {
                "id": "comment_phase2",
                "text": "Phase 2: Advance to hook coral tree loop, then reverse to hang on support (20+10 pts)\nCalibrate PHASE2_FWD and PHASE3_REV together.",
                "x": 80, "y": 440, "width": 400, "height": 60,
            },
        ],
    },
    "lessonPin": "0000",
}

# ---------------------------------------------------------------------------
# Write JSON + LECP
# ---------------------------------------------------------------------------
project_str = json.dumps(project, indent=2, ensure_ascii=False)
json.loads(project_str)  # validate

json_path = OUT_DIR / "proj-m01-coral-nursery.json"
json_path.write_text(project_str, encoding="utf-8")

lecp_path = OUT_DIR / "proj-m01-coral-nursery.lecp"
with zipfile.ZipFile(lecp_path, "w", compression=zipfile.ZIP_DEFLATED) as z:
    z.writestr("project.json", project_str)

print(f"Created: {json_path}")
print(f"Created: {lecp_path}")
print(f"  ZIP size  : {lecp_path.stat().st_size:,} bytes")
print(f"  JSON size : {len(project_str):,} bytes")
print()
print("Calibration values (edit at top of script):")
print(f"  DRIVE_SPEED = {DRIVE_SPEED}%")
print(f"  PHASE1_FWD  = {PHASE1_FWD} rotations  (push buds lever)")
print(f"  PHASE2_FWD  = {PHASE2_FWD} rotations  (hook tree loop)")
print(f"  PHASE3_REV  = {PHASE3_REV} rotations  (hang tree on support)")
