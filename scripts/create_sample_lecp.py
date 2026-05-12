#!/usr/bin/env python3
"""
Build proj-full-feature-demo.lecp — exercises every block type in the schema.
"""
import json
import zipfile
from pathlib import Path

OUT_DIR = Path("project")
OUT_DIR.mkdir(exist_ok=True)

# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
def num(n, id):
    return {"shadow": {"type": "ShadowNumber", "id": id, "fields": {"NUMBER": n}}}

def text(t, id):
    return {"shadow": {"type": "ShadowText", "id": id, "fields": {"TEXT": t}}}

def rotations(v, id):
    return {"shadow": {"type": "RotationsShadow", "id": id, "fields": {"VALUE": v}}}

def speed(v, id):
    return {"shadow": {"type": "SpeedShadow", "id": id, "fields": {"VALUE": v}}}

def degrees(v, id):
    return {"shadow": {"type": "TurnForDegreesShadow", "id": id, "fields": {"VALUE": v}}}

def position(v, id):
    return {"shadow": {"type": "PositionShadow", "id": id, "fields": {"VALUE": v}}}

def sound_shadow(name, id):
    return {"shadow": {"type": "soundShadow", "id": id, "fields": {"VALUE": name}}}

def msg_shadow(name, id):
    return {"shadow": {"type": "MessageMenuShadow", "id": id, "fields": {"VALUE": name}}}

def color_shadow(v, id):
    return {"shadow": {"type": "ColorPickerShadow", "id": id, "fields": {"VALUE": v}}}

def note_shadow(midi, id):
    return {"shadow": {"type": "ComplexMidiNotePickerShadow", "id": id, "fields": {"VALUE": midi}}}

def instrument_shadow(v, id):
    return {"shadow": {"type": "InstrumentShadow", "id": id, "fields": {"VALUE": v}}}

def drum_shadow(v, id):
    return {"shadow": {"type": "DrumShadow", "id": id, "fields": {"VALUE": v}}}

def tempo_shadow(v, id):
    return {"shadow": {"type": "ShadowNumber", "id": id, "fields": {"NUMBER": v}}}

def chain(*blocks):
    """Link blocks into a next-chain."""
    if not blocks:
        return None
    root = dict(blocks[0])
    cur = root
    for b in blocks[1:]:
        cur["next"] = {"block": dict(b)}
        cur = cur["next"]["block"]
    return root

# ---------------------------------------------------------------------------
# Individual blocks
# ---------------------------------------------------------------------------

# — Variables —
set_score_zero = {
    "type": "DataVariableSet", "id": "b_set_score",
    "fields": {"VARIABLE": "score"},
    "inputs": {"VALUE": num(0, "sh_score_zero")},
}
inc_score = {
    "type": "DataVariableChangeBy", "id": "b_inc_score",
    "fields": {"VARIABLE": "score"},
    "inputs": {"VALUE": num(1, "sh_inc_1")},
}
get_score = {"type": "DataVariableGet", "id": "b_get_score", "fields": {"LABEL": "score"}}
set_speed = {
    "type": "DataVariableSet", "id": "b_set_speed",
    "fields": {"VARIABLE": "speed"},
    "inputs": {
        "VALUE": {
            "block": {
                "type": "OperatorsArithmetic", "id": "b_arith",
                "fields": {"OPERATOR": "+"},
                "inputs": {
                    "A": {"block": {"type": "DataVariableGet", "id": "b_get_score2",
                                    "fields": {"LABEL": "score"}}},
                    "B": num(10, "sh_plus10"),
                },
            }
        }
    },
}

# — Sound —
play_alarm = {
    "type": "SoundPlaySound", "id": "b_alarm",
    "fields": {"OPTION": "WAIT"},
    "inputs": {"SOUND": sound_shadow("Alarm", "sh_alarm")},
}
play_dog = {
    "type": "SoundPlaySound", "id": "b_dog",
    "fields": {"OPTION": "CONTINUE"},
    "inputs": {"SOUND": sound_shadow("Dog", "sh_dog")},
}
play_splash = {
    "type": "SoundPlaySound", "id": "b_splash",
    "fields": {"OPTION": "WAIT"},
    "inputs": {"SOUND": sound_shadow("Splash", "sh_splash")},
}

# — Music —
set_tempo = {
    "type": "MusicSetTempoTo", "id": "b_tempo",
    "inputs": {"TEMPO": tempo_shadow(120, "sh_tempo")},
}
play_note = {
    "type": "MusicPlayNoteForBeats", "id": "b_note",
    "inputs": {
        "NOTE": note_shadow(60, "sh_note"),
        "INSTRUMENT": instrument_shadow("1", "sh_instr"),
        "BEATS": num(1, "sh_beats_note"),
    },
}
play_drum = {
    "type": "MusicPlayDrumForBeat", "id": "b_drum",
    "inputs": {
        "DRUM": drum_shadow("1", "sh_drum"),
        "BEATS": num(1, "sh_beats_drum"),
    },
}
rest = {
    "type": "MusicRestForBeat", "id": "b_rest",
    "inputs": {"BEATS": num(0.5, "sh_rest_beats")},
}

# — DoubleMotor —
dm_set_speed_l = {
    "type": "DoubleMotorSetSpeed", "id": "b_dm_spd_l",
    "fields": {"MOTOR": "LEFT"},
    "inputs": {"SPEED": speed(60, "sh_spd_l")},
}
dm_run = {
    "type": "DoubleMotorRunForRotations", "id": "b_dm_run",
    "fields": {"MOTOR": "BOTH", "DIRECTION": "Cw", "UNIT": "ROTATIONS"},
    "inputs": {"VALUE": rotations(2, "sh_rot_2")},
}
dm_start = {
    "type": "DoubleMotorStartDirection", "id": "b_dm_start",
    "fields": {"MOTOR": "BOTH", "DIRECTION": "Forward"},
}
dm_stop = {
    "type": "DoubleMotorStop", "id": "b_dm_stop",
    "fields": {"MOTOR": "BOTH"},
}
dm_turn = {
    "type": "DoubleMotorTurn", "id": "b_dm_turn",
    "fields": {"DIRECTION": "Right"},
    "inputs": {"DEGREES": degrees(90, "sh_deg_90")},
}
dm_steps = {
    "type": "DoubleMotorForSteps", "id": "b_dm_steps",
    "fields": {"DIRECTION": "Forward"},
    "inputs": {"VALUE": num(10, "sh_steps_10")},
}
dm_to_pos = {
    "type": "DoubleMotorRunToPosition", "id": "b_dm_pos",
    "fields": {"MOTOR": "LEFT"},
    "inputs": {"POSITION": position(90, "sh_pos_90")},
}
dm_set_move_speed = {
    "type": "DoubleMotorSetMoveSpeed", "id": "b_dm_mvspd",
    "inputs": {"SPEED": speed(80, "sh_mvspd")},
}
dm_start_move = {
    "type": "DoubleMotorStartMove", "id": "b_dm_startmv",
    "fields": {"DIRECTION": "Forward"},
}
dm_stop_move = {"type": "DoubleMotorStopMove", "id": "b_dm_stopmv"}

# — Single Motor —
motor_set_speed = {
    "type": "MotorSetSpeed", "id": "b_m_spd",
    "inputs": {"SPEED": speed(75, "sh_m_spd")},
}
motor_start = {
    "type": "MotorStartDirection", "id": "b_m_start",
    "fields": {"DIRECTION": "Cw"},
}
motor_run = {
    "type": "MotorRunForRotations", "id": "b_m_run",
    "fields": {"DIRECTION": "Cw", "UNIT": "ROTATIONS"},
    "inputs": {"VALUE": rotations(1, "sh_m_rot")},
}
motor_stop = {"type": "MotorStop", "id": "b_m_stop"}
motor_to_pos = {
    "type": "MotorRunToPosition", "id": "b_m_pos",
    "inputs": {"POSITION": position(180, "sh_m_pos")},
}

# — Control —
wait_1 = {
    "type": "ControlWait", "id": "b_wait1",
    "inputs": {"SECONDS": num(1, "sh_w1")},
}
wait_half = {
    "type": "ControlWait", "id": "b_wait_half",
    "inputs": {"SECONDS": num(0.5, "sh_w_half")},
}
send_start = {
    "type": "EventsSendMessage", "id": "b_send_start",
    "fields": {"OPTION": "CONTINUE"},
    "inputs": {"MESSAGE": msg_shadow("start", "sh_msg_start")},
}
send_done = {
    "type": "EventsSendMessage", "id": "b_send_done",
    "fields": {"OPTION": "WAIT"},
    "inputs": {"MESSAGE": msg_shadow("done", "sh_msg_done")},
}

# ControlRepeat 3: play_note
repeat_3_note = {
    "type": "ControlRepeat", "id": "b_rep3",
    "inputs": {
        "TIMES": num(3, "sh_rep3"),
        "BODY": {"block": play_note},
    },
}

# ControlForever: wait_half
forever_wait = {
    "type": "ControlForever", "id": "b_forever",
    "inputs": {"BODY": {"block": wait_half}},
}

# ControlIf: score > 2 → dm_stop
compare_score = {
    "type": "OperatorsCompare", "id": "b_cmp_score",
    "fields": {"OP": ">"},
    "inputs": {
        "A": {"block": {"type": "DataVariableGet", "id": "b_get_score3",
                        "fields": {"LABEL": "score"}}},
        "B": num(2, "sh_cmp_2"),
    },
}
ctrl_if = {
    "type": "ControlIf", "id": "b_ctrl_if",
    "inputs": {
        "CONDITION": {"block": compare_score},
        "BODY": {"block": dm_stop},
    },
}

# ControlIfElse: isColor green → motor_run / motor_stop
color_is_green = {
    "type": "ColorSensorIsColor", "id": "b_color_green",
    "inputs": {"COLOR": color_shadow(2, "sh_green")},
}
ctrl_ifelse = {
    "type": "ControlIfElse", "id": "b_ifelse",
    "inputs": {
        "CONDITION": {"block": color_is_green},
        "IFBODY": {"block": motor_run},
        "ELSEBODY": {"block": motor_stop},
    },
}

# ControlRepeatUntil: isKeyPressed(enter)
is_enter = {
    "type": "EventsIsKeyPressed", "id": "b_is_enter",
    "fields": {"KEY": "enter"},
}
random_1_10 = {
    "type": "OperatorsRandom", "id": "b_rnd",
    "inputs": {
        "A": num(1, "sh_rnd_a"),
        "B": num(10, "sh_rnd_b"),
    },
}
repeat_until_enter = {
    "type": "ControlRepeatUntil", "id": "b_rep_until",
    "inputs": {
        "CONDITION": {"block": is_enter},
        "BODY": {
            "block": {
                "type": "DataVariableChangeBy", "id": "b_inc_score2",
                "fields": {"VARIABLE": "score"},
                "inputs": {"VALUE": {"block": random_1_10}},
            }
        },
    },
}

# ControlWaitUntil: OperatorsAnd(ColorSensorIsColor, ControllerIsLever)
is_lever_up = {
    "type": "ControllerIsLever", "id": "b_is_lever",
    "fields": {"LEVER": "LEFT", "OPTION": "UP"},
}
color_is_any = {
    "type": "ColorSensorIsColor", "id": "b_color_any",
    "inputs": {"COLOR": color_shadow(-1, "sh_any_color")},
}
and_condition = {
    "type": "OperatorsAnd", "id": "b_and",
    "inputs": {
        "A": {"block": color_is_any},
        "B": {"block": is_lever_up},
    },
}
wait_until = {
    "type": "ControlWaitUntil", "id": "b_wait_until",
    "inputs": {"CONDITION": {"block": and_condition}},
}

# AI: AIPoseClassifierIsClass(0)
ai_is_class = {
    "type": "AIPoseClassifierIsClass", "id": "b_ai_is_class",
    "fields": {"CLASSINDEX": 0},
}
ai_distance = {
    "type": "AIPoseBodyDistancePoints", "id": "b_ai_dist",
    "fields": {"ONE": "LEFT_WRIST", "TWO": "RIGHT_WRIST"},
}
ai_point_pos = {
    "type": "AIPoseBodyPointPosition", "id": "b_ai_pos",
    "fields": {"LANDMARK": "NOSE", "AXIS": "X"},
}
set_score_to_ai = {
    "type": "DataVariableSet", "id": "b_set_score_ai",
    "fields": {"VARIABLE": "score"},
    "inputs": {"VALUE": {"block": ai_point_pos}},
}

# MyBlock definition: "move and play" with arg "rotations"
myblock_def = {
    "type": "MyBlockDefinition", "id": "b_mydef",
    "inputs": {
        "PROTOTYPE": {
            "block": {
                "type": "MyBlockPrototype", "id": "b_myproto",
                "inputs": {
                    "LEGO1": {
                        "block": {
                            "type": "MyBlockStringArg", "id": "b_arg_rot",
                            "fields": {"LABEL": "rotations"},
                        }
                    }
                },
            }
        }
    },
}
# MyBlock body: DoubleMotorRunForRotations, then SoundPlaySound
myblock_body_run = {
    "type": "DoubleMotorRunForRotations", "id": "b_mb_run",
    "fields": {"MOTOR": "BOTH", "DIRECTION": "Cw", "UNIT": "ROTATIONS"},
    "inputs": {"VALUE": rotations(1, "sh_mb_rot")},
    "next": {"block": play_alarm},
}
myblock_def["inputs"]["PROTOTYPE"]["block"]["next"] = {"block": myblock_body_run}

# MyBlock call
myblock_call = {
    "type": "MyBlockCall", "id": "b_mycall",
    "inputs": {"rotations_1": num(3, "sh_call_rot")},
}

# OperatorsCompare (< variant for WaitUntil)
compare_dist = {
    "type": "OperatorsCompare", "id": "b_cmp_dist",
    "fields": {"OP": "<"},
    "inputs": {
        "A": {"block": ai_distance},
        "B": num(50, "sh_dist_50"),
    },
}

# ---------------------------------------------------------------------------
# Top-level event blocks (with canvas positions)
# ---------------------------------------------------------------------------
blocks = [
    # 1. Program starts → full sequential demo
    {
        "type": "EventsWhenProgramStarts", "id": "b_start", "x": 30, "y": 30,
        "next": {"block": chain(
            set_tempo,
            set_score_zero,
            play_alarm,
            dm_set_speed_l,
            dm_run,
            dm_turn,
            dm_steps,
            send_start,
            repeat_3_note,
            ctrl_if,
            wait_1,
            myblock_call,
            inc_score,
        )},
    },

    # 2. ColorSensor event → forever loop waiting + motor start
    {
        "type": "ColorSensorWhenColor", "id": "b_color_ev", "x": 420, "y": 30,
        "fields": {"COLOR": 2},
        "next": {"block": chain(dm_set_move_speed, dm_start_move, forever_wait)},
    },

    # 3. Key pressed (space) → repeat-until loop + set speed from arithmetic
    {
        "type": "EventsWhenKeyPressed", "id": "b_key_space", "x": 30, "y": 420,
        "fields": {"KEY": "space"},
        "next": {"block": chain(repeat_until_enter, set_speed, wait_until, dm_stop_move)},
    },

    # 4. Message received "start" → music sequence + motor to position
    {
        "type": "EventsWhenMessageReceived", "id": "b_msg_recv", "x": 420, "y": 420,
        "fields": {"MESSAGE": "start"},
        "next": {"block": chain(
            play_drum, rest, play_drum, rest, play_drum,
            dm_to_pos,
            ctrl_ifelse,
        )},
    },

    # 5. AI pose class detected → set score to point position + play dog sound
    {
        "type": "AIPoseClassifierWhenClassDetected", "id": "b_ai_class_ev", "x": 820, "y": 30,
        "fields": {"CLASSINDEX": 0},
        "next": {"block": chain(set_score_to_ai, play_dog, inc_score)},
    },

    # 6. AI: when person detected → wait until distance < 50 → send done
    {
        "type": "AIPoseBodyWhenPerson", "id": "b_ai_person", "x": 820, "y": 280,
        "fields": {"OPTION": "detected"},
        "next": {
            "block": {
                "type": "ControlWaitUntil", "id": "b_wait_dist",
                "inputs": {"CONDITION": {"block": compare_dist}},
                "next": {"block": send_done},
            }
        },
    },

    # 7. AI: when body points touching (wrists) → play splash
    {
        "type": "AIPoseBodyWhenPointsTouching", "id": "b_ai_touch", "x": 820, "y": 480,
        "fields": {"ONE": "LEFT_WRIST", "TWO": "RIGHT_WRIST"},
        "next": {"block": chain(play_splash, dm_stop)},
    },

    # 8. Controller lever event → single motor sequence
    {
        "type": "ControllerWhenLever", "id": "b_lever_ev", "x": 30, "y": 720,
        "fields": {"LEVER": "LEFT", "OPTION": "UP"},
        "next": {"block": chain(motor_set_speed, motor_start, wait_1, motor_to_pos, motor_stop)},
    },

    # 9. DoubleMotor tapped → stop everything + play splash
    {
        "type": "DoubleMotorWhenTapped", "id": "b_tapped", "x": 420, "y": 720,
        "next": {"block": chain(dm_stop, dm_stop_move, play_splash)},
    },

    # 10. EventsWhen (condition: lever is up) → motor run
    {
        "type": "EventsWhen", "id": "b_when_cond", "x": 820, "y": 720,
        "inputs": {
            "CONDITION": {
                "block": {
                    "type": "ControllerIsLever", "id": "b_lever_cond",
                    "fields": {"LEVER": "RIGHT", "OPTION": "DOWN"},
                }
            }
        },
        "next": {"block": chain(motor_run, wait_1, motor_stop)},
    },

    # 11. MyBlock definition (standalone on canvas)
    {**myblock_def, "x": 1220, "y": 30},
]

# ---------------------------------------------------------------------------
# Assemble project
# ---------------------------------------------------------------------------
project = {
    "manifest": {
        "id": "proj-full-feature-demo-001",
        "name": "Full Feature Demo",
        "type": "word",
        "created": "2026-05-11T00:00:00.000Z",
        "hardware": [
            {"type": "dual-motor",    "identifier": "1"},
            {"type": "motor",         "identifier": "1"},
            {"type": "color-sensor",  "identifier": "1"},
            {"type": "controller",    "identifier": "1"},
        ],
        "extensions": ["Music"],
        "toolbox": {
            "DoubleMotor": [
                "DoubleMotorRunForRotations", "DoubleMotorSetSpeed",
                "DoubleMotorStartDirection", "DoubleMotorStop",
                "DoubleMotorTurn", "DoubleMotorForSteps",
                "DoubleMotorRunToPosition", "DoubleMotorSetMoveSpeed",
                "DoubleMotorStartMove", "DoubleMotorStopMove",
                "DoubleMotorWhenTapped",
            ],
            "Motor": [
                "MotorRunForRotations", "MotorSetSpeed",
                "MotorStartDirection", "MotorStop", "MotorRunToPosition",
            ],
            "ColorSensor": ["ColorSensorWhenColor", "ColorSensorIsColor"],
            "Controller": ["ControllerWhenLever", "ControllerIsLever"],
            "Events": [
                "EventsWhenProgramStarts", "EventsWhenKeyPressed",
                "EventsWhenMessageReceived", "EventsSendMessage",
                "EventsWhen", "EventsIsKeyPressed",
            ],
            "Control": [
                "ControlWait", "ControlRepeat", "ControlForever",
                "ControlIf", "ControlIfElse", "ControlRepeatUntil",
                "ControlWaitUntil",
            ],
            "Sound": ["SoundPlaySound"],
            "Music": [
                "MusicPlayNoteForBeats", "MusicPlayDrumForBeat",
                "MusicRestForBeat", "MusicSetTempoTo",
            ],
            "Data": [
                "DataVariableSet", "DataVariableGet", "DataVariableChangeBy",
            ],
            "Operators": [
                "OperatorsCompare", "OperatorsRandom",
                "OperatorsAnd", "OperatorsArithmetic",
            ],
            "AIPose": [
                "AIPoseClassifierWhenClassDetected", "AIPoseClassifierIsClass",
                "AIPoseBodyWhenPerson", "AIPoseBodyWhenPointsTouching",
                "AIPoseBodyDistancePoints", "AIPoseBodyPointPosition",
            ],
            "MyBlock": ["MyBlockDefinition"],
        },
    },
    "canvas": {
        "blocks": {"languageVersion": 1, "blocks": blocks},
        "palette": "lesson",
        "sounds": ["Alarm", "Dog", "Splash"],
        "messages": ["start", "done"],
        "variables": [
            {"name": "score", "id": "var_score", "type": "Var"},
            {"name": "speed", "id": "var_speed", "type": "Var"},
        ],
        "workspaceComments": [
            {
                "id": "comment_main",
                "text": "Main sequence: tempo → variables → sound → motors → send message → repeat → if → myblock",
                "x": 30, "y": 10, "width": 360, "height": 60,
            },
            {
                "id": "comment_ai",
                "text": "AI Pose blocks: class detection, person detection, points touching",
                "x": 820, "y": 10, "width": 360, "height": 60,
            },
        ],
    },
    "bodyPose": {"usePretrained": True},
    "customSounds": {},
    "lessonPin": "0000",
}

# ---------------------------------------------------------------------------
# Validate JSON round-trip, then write LECP
# ---------------------------------------------------------------------------
project_str = json.dumps(project, indent=2, ensure_ascii=False)
json.loads(project_str)  # validate

json_path = OUT_DIR / "proj-full-feature-demo.json"
json_path.write_text(project_str, encoding="utf-8")

lecp_path = OUT_DIR / "proj-full-feature-demo.lecp"
with zipfile.ZipFile(lecp_path, "w", compression=zipfile.ZIP_DEFLATED) as z:
    z.writestr("project.json", project_str)

print(f"Created: {json_path}")
print(f"Created: {lecp_path}")
print(f"  ZIP size  : {lecp_path.stat().st_size:,} bytes")
print(f"  JSON size : {len(project_str):,} bytes")

# Count block types used
import re
types_used = set(re.findall(r'"type":\s*"([A-Z][A-Za-z]+)"', project_str))
print(f"  Block types used: {len(types_used)}")
for t in sorted(types_used):
    print(f"    {t}")
