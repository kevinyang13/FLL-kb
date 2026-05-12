# LECP Project JSON Schema

**Summary**: Full spec of the `project.json` schema inside LECP files, derived from all 56 files in `extracted-lecp/`.

**Sources**: extracted-lecp/ (56 files)

**Last updated**: 2026-05-11

---

## Overview

An LECP file is a ZIP archive containing a single `project.json`. The JSON has five top-level keys:

| Key | Type | Present | Description |
|-----|------|---------|-------------|
| `manifest` | object | 56/56 | Project metadata, hardware config, toolbox |
| `canvas` | object | 56/56 | Block code workspace |
| `lessonPin` | string | 56/56 | 4-digit lesson PIN (e.g. `"1202"`) |
| `bodyPose` | object | 21/56 | AI body pose config (only when AIPose blocks used) |
| `customSounds` | object | 1/56 | Custom sound data (rare) |

---

## `manifest`

```json
{
  "id": "P5nLayHrg5VU9RKo01sk",        // string — UUID, unique project ID
  "name": "Get the Gold",               // string — display name
  "type": "word",                       // string — always "word" (Coding Canvas type)
  "created": "2025-10-24T08:12:34.237Z", // string — ISO 8601 timestamp
  "hardware": [...],                    // array — connected hardware (optional)
  "extensions": ["Music"],             // array<string> — optional feature extensions
  "toolbox": {...}                      // object — allowed blocks per category
}
```

### `manifest.hardware`

Array of hardware objects. Present in 48/56 files. All use identifier `"1"`.

```json
{ "type": "dual-motor", "identifier": "1" }
```

| `type` value | Description |
|-------------|-------------|
| `dual-motor` | SPIKE Prime large motor hub (controls left/right) |
| `motor` | Single motor |
| `color-sensor` | Color/distance sensor |
| `controller` | Remote controller with levers |

### `manifest.extensions`

Optional array. Only known value: `"Music"` — enables music/note blocks.

### `manifest.toolbox`

Maps category name → array of allowed block type IDs. Controls which blocks appear in the lesson UI.

```json
{
  "DoubleMotor": ["DoubleMotorRunForRotations", "DoubleMotorSetSpeed"],
  "ColorSensor": ["ColorSensorWhenColor"],
  "Events": ["EventsWhenProgramStarts", "EventsWhenKeyPressed"],
  "Control": ["ControlRepeat", "ControlWait"],
  "Sound": ["SoundPlaySound"],
  "Music": ["MusicPlayNoteForBeats", "MusicPlayDrumForBeat"],
  "Data": ["DataVariableSet", "DataVariableGet", "DataVariableChangeBy"],
  "Operators": ["OperatorsCompare", "OperatorsRandom"],
  "AIPose": ["AIPoseClassifierWhenClassDetected"],
  "Controller": ["ControllerWhenLever"],
  "MyBlock": ["MyBlockDefinition"]
}
```

All 12 possible toolbox categories: `AIPose`, `ColorSensor`, `Control`, `Controller`, `Data`, `DoubleMotor`, `Events`, `Motor`, `Music`, `MyBlock`, `Operators`, `Sound`.

---

## `canvas`

```json
{
  "blocks": {...},           // object — Blockly block tree
  "palette": "lesson",      // string — always "lesson"
  "sounds": [...],          // array<string> — sound names used (e.g. ["Alarm", "Dog"])
  "messages": [...],        // array<string> — message names (present in 2/56 files)
  "variables": [...],       // array — variable definitions (present in 11/56 files)
  "workspaceComments": [...] // array — sticky notes on canvas (present in 14/56 files)
}
```

### `canvas.blocks`

```json
{
  "languageVersion": 1,
  "blocks": [ ...block objects... ]
}
```

`blocks` is an array of top-level blocks (event handlers that sit on the canvas root level).

### `canvas.variables`

```json
[
  {
    "name": "space creatures",
    "id": "L+L9f]@xT5imh]skG$KZ",
    "type": "Var"
  }
]
```

### `canvas.workspaceComments`

```json
{
  "id": "z3P0FdXUxC38$U)m)gVJ",
  "text": "Connect this block and click Play to see what happens!",
  "x": 418.6,
  "y": 457.2,
  "width": 197.3,
  "height": 127.0
}
```

---

## Block Schema

Every block follows this structure (all fields optional except `type` and `id`):

```json
{
  "type": "DoubleMotorRunForRotations",  // string — block type ID
  "id": "94+hReoSTkDaBe=NorpX",          // string — unique block ID (Blockly format)
  "x": 200,                              // number — canvas x position (top-level blocks only)
  "y": 36,                               // number — canvas y position (top-level blocks only)
  "fields": {                            // object — inline enum/string values
    "MOTOR": "LEFT",
    "DIRECTION": "Cw",
    "UNIT": "ROTATIONS"
  },
  "inputs": {                            // object — value inputs (numbers, booleans, etc.)
    "VALUE": {
      "shadow": { ...shadow block... },  // default/placeholder value
      "block": { ...override block... } // overrides shadow when connected
    }
  },
  "next": {                              // object — next block in sequence
    "block": { ...block... }
  }
}
```

**Shadow blocks** are placeholder blocks inside `inputs`. They provide default values and use types like `ShadowNumber`, `RotationsShadow`, `SpeedShadow`, `ShadowText`, `soundShadow`, etc.

---

## Block Type Catalog

### Events (triggers — always top-level)

| Type | Fields | Description |
|------|--------|-------------|
| `EventsWhenProgramStarts` | — | Runs on Play (most common, ×48) |
| `EventsWhenKeyPressed` | `KEY` | Runs when key pressed |
| `EventsWhenMessageReceived` | `MESSAGE` | Runs when message received |
| `EventsWhen` | — | Conditional event (inputs: `CONDITION`) |
| `EventsSendMessage` | `OPTION` | Send message (inputs: `MESSAGE`) |
| `EventsIsKeyPressed` | `KEY` | Boolean: is key currently pressed |

### Control (flow)

| Type | Fields | Inputs | Description |
|------|--------|--------|-------------|
| `ControlWait` | — | `SECONDS` | Wait N seconds |
| `ControlRepeat` | — | `TIMES`, `BODY` | Repeat N times |
| `ControlForever` | — | `BODY` | Loop forever |
| `ControlIf` | — | `CONDITION`, `BODY` | If condition |
| `ControlIfElse` | — | `CONDITION`, `IFBODY`, `ELSEBODY` | If/else |
| `ControlRepeatUntil` | — | `CONDITION`, `BODY` | Repeat until |
| `ControlWaitUntil` | — | `CONDITION` | Wait until condition |

### DoubleMotor (dual motor hub)

| Type | Fields | Inputs | Description |
|------|--------|--------|-------------|
| `DoubleMotorRunForRotations` | `MOTOR`, `DIRECTION`, `UNIT` | `VALUE` | Run motor N rotations |
| `DoubleMotorSetSpeed` | `MOTOR` | `SPEED` | Set motor speed |
| `DoubleMotorStartDirection` | `MOTOR`, `DIRECTION` | — | Start motor continuously |
| `DoubleMotorStop` | `MOTOR` | — | Stop motor |
| `DoubleMotorTurn` | `DIRECTION` | `DEGREES` | Turn robot |
| `DoubleMotorForSteps` | `DIRECTION` | `VALUE` | Move N steps |
| `DoubleMotorRunToPosition` | `MOTOR` | `POSITION` | Run to absolute position |
| `DoubleMotorSetMoveSpeed` | — | `SPEED` | Set move speed |
| `DoubleMotorStartMove` | `DIRECTION` | — | Start moving |
| `DoubleMotorStopMove` | — | — | Stop moving |
| `DoubleMotorWhenTapped` | — | — | Event: when tapped |
| `DoubleMotorIsTilted` | `OPTION` | — | Boolean: is tilted |
| `DoubleMotorIsGesture` | `GESTURE`, `MOTOR` | — | Boolean: gesture detected |
| `DoubleMotorReporter` | `MOTOR`, `OPTION` | — | Returns sensor value |
| `DoubleMotorSetEndstate` | `MOTOR`, `ENDSTATE` | — | Set end state |
| `DoubleMotorStartAtPower` | `MOTOR` | `VALUE` | Start at raw power |

Common field values:
- `MOTOR`: `"LEFT"`, `"RIGHT"`, `"BOTH"`
- `DIRECTION`: `"Cw"` (clockwise), `"Ccw"` (counterclockwise), `"Forward"`, `"Backward"`
- `UNIT`: `"ROTATIONS"`, `"SECONDS"`, `"DEGREES"`

### Motor (single motor)

| Type | Fields | Inputs | Description |
|------|--------|--------|-------------|
| `MotorRunForRotations` | `DIRECTION`, `UNIT` | `VALUE` | Run N rotations |
| `MotorSetSpeed` | — | `SPEED` | Set speed |
| `MotorStartDirection` | `DIRECTION` | — | Start continuously |
| `MotorStop` | — | — | Stop |
| `MotorRunToPosition` | — | `POSITION` | Run to position |

### ColorSensor

| Type | Fields | Inputs | Description |
|------|--------|--------|-------------|
| `ColorSensorWhenColor` | `COLOR` | — | Event: when color detected |
| `ColorSensorIsColor` | — | `COLOR` | Boolean: is color? |

`COLOR` field: integer color code (`-1` = any, `2` = green, etc.)

### Controller

| Type | Fields | Description |
|------|--------|-------------|
| `ControllerWhenLever` | `LEVER`, `OPTION` | Event: when lever moved |
| `ControllerIsLever` | `LEVER`, `OPTION` | Boolean: is lever in position |

### Sound

| Type | Fields | Inputs | Description |
|------|--------|--------|-------------|
| `SoundPlaySound` | `OPTION` | `SOUND` | Play sound |

`OPTION`: `"WAIT"` (wait until done) or `"CONTINUE"` (play async). `SOUND` shadow uses `soundShadow` with `VALUE` = sound name string.

### Music (requires `"Music"` extension)

| Type | Inputs | Description |
|------|--------|-------------|
| `MusicPlayNoteForBeats` | `NOTE`, `INSTRUMENT`, `BEATS` | Play musical note |
| `MusicPlayDrumForBeat` | `DRUM`, `BEATS` | Play drum sound |
| `MusicRestForBeat` | `BEATS` | Rest |
| `MusicSetTempoTo` | `TEMPO` | Set BPM |
| `MusicTempo` | — | Reporter: current tempo |

### Data (variables)

| Type | Fields | Inputs | Description |
|------|--------|--------|-------------|
| `DataVariableSet` | `VARIABLE` | `VALUE` | Set variable |
| `DataVariableChangeBy` | `VARIABLE` | `VALUE` | Increment variable |
| `DataVariableGet` | `LABEL` | — | Reporter: get variable value |

### Operators

| Type | Fields | Inputs | Description |
|------|--------|--------|-------------|
| `OperatorsCompare` | `OP` | `A`, `B` | Compare (`<`, `>`, `=`) |
| `OperatorsRandom` | — | `A`, `B` | Random number between A and B |
| `OperatorsAnd` | — | `A`, `B` | Boolean AND |
| `OperatorsArithmetic` | `OPERATOR` | `A`, `B` | Math (`+`, `-`, `×`, `÷`) |

### AIPose (AI body tracking)

| Type | Fields | Description |
|------|--------|-------------|
| `AIPoseClassifierWhenClassDetected` | `CLASSINDEX` | Event: when pose class detected |
| `AIPoseClassifierIsClass` | `CLASSINDEX` | Boolean: is pose class? |
| `AIPoseClassifierConfidenceForClass` | `CLASSINDEX` | Reporter: confidence % |
| `AIPoseBodyWhenPerson` | `OPTION` | Event: when person detected/lost |
| `AIPoseBodyWhenPointsTouching` | `ONE`, `TWO` | Event: when body points touching |
| `AIPoseBodyDistancePoints` | `ONE`, `TWO` | Reporter: distance between points |
| `AIPoseBodyPointPosition` | `LANDMARK`, `AXIS` | Reporter: X/Y of body landmark |

### MyBlock (custom functions)

| Type | Description |
|------|-------------|
| `MyBlockDefinition` | Define a custom block (inputs: `PROTOTYPE`) |
| `MyBlockPrototype` | Prototype header inside definition |
| `MyBlockCall` | Call a custom block (inputs match defined args) |
| `MyBlockStringArg` | String/number argument in definition |

---

## `bodyPose`

Present in 21/56 files when AI pose blocks are used.

```json
{
  "usePretrained": true   // boolean — use pretrained pose model
}
```

---

## Shadow Block Types (input placeholders)

| Shadow Type | Field | Description |
|------------|-------|-------------|
| `ShadowNumber` | `NUMBER` | Generic number |
| `ShadowText` | `TEXT` | Generic text/string |
| `RotationsShadow` | `VALUE` | Rotation value (decimal) |
| `SpeedShadow` | `VALUE` | Speed (0–100) |
| `TurnForDegreesShadow` | `VALUE` | Degrees to turn |
| `PositionShadow` | `VALUE` | Motor position |
| `PowerShadow` | `VALUE` | Raw power level |
| `soundShadow` | `VALUE` | Sound name string |
| `ColorPickerShadow` | `VALUE` | Color integer |
| `MessageMenuShadow` | `VALUE` | Message name string |
| `ComplexMidiNotePickerShadow` | `VALUE` | MIDI note number |
| `InstrumentShadow` | `VALUE` | Instrument ID string |
| `DrumShadow` | `VALUE` | Drum sound ID |

---

## Related pages
- [[lessons-index]]
- [[coding-and-programming]]
- [[robot-design-principles]]
