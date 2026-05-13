# LECP Block Catalog

**Summary**: Complete catalog of all block types available in the LEGO coding canvas (code.legoeducation.com/en-us/word), organized by category. Includes block type names as used in LECP project.json, field names and values, input slot names, and block kinds (hat/statement/reporter/boolean).

**Sources**: /tmp/lego_canvas.js (LEGO coding canvas JS bundle), raw/extracted/ (56 real LECP lesson files)

**Last updated**: 2026-05-12

---

## Category Map

Each category has an icon identifier used in the manifest toolbox:

| Category | Icon ID | Description |
|----------|---------|-------------|
| DoubleMotor | `movement` | Dual-motor drivetrain (forward/back/turn) |
| Motor | `motor` | Single motor (arm, attachment) |
| Events | `event` | Program triggers and messages |
| Control | `control` | Loops, conditionals, waits |
| ColorSensor | `color_sensor` | Color and reflection sensing |
| Controller | `controller` | Remote control lever |
| AIPose | `ai` | Body pose / AI classifier |
| Data | `data` | Variables, lists, timer, text |
| Operators | `operators` | Math, comparison, logic, string |
| Sound | `sounds` | Play sounds from canvas.sounds |
| Music | `music` | Notes, drums, tempo |
| MyBlock | `myBlocks` | Custom block definitions and calls |

---

## DoubleMotor (Dual-Motor Drivetrain)

These blocks control the dual-motor hub (drivetrain). `MOTOR` field selects `LEFT`, `RIGHT`, or `BOTH`.

### Statement Blocks

| Block Type | Description | Fields | Inputs |
|------------|-------------|--------|--------|
| `DoubleMotorForSteps` | Drive N steps forward/back | `DIRECTION`: Forward, Backward | `VALUE` |
| `DoubleMotorRunForRotations` | Run for N rotations | `MOTOR`: LEFT/RIGHT/BOTH; `DIRECTION`: Cw/Ccw; `UNIT`: ROTATIONS | `VALUE` (RotationsShadow) |
| `DoubleMotorRunToPosition` | Run to absolute position | `MOTOR`: LEFT/RIGHT | `POSITION` (PositionShadow) |
| `DoubleMotorTurn` | Turn in place by degrees | `DIRECTION`: Left/Right | `DEGREES` (TurnForDegreesShadow) |
| `DoubleMotorStartMove` | Start moving (no stop) | `DIRECTION`: Forward/Backward/Left/Right | — |
| `DoubleMotorStartDirection` | Start spinning motor | `MOTOR`: LEFT/RIGHT; `DIRECTION`: Cw/Ccw | — |
| `DoubleMotorStartAtPower` | Start at % power | `MOTOR`: LEFT/RIGHT | `VALUE` (PowerShadow) |
| `DoubleMotorStop` | Stop motor(s) | `MOTOR`: LEFT/RIGHT/BOTH | — |
| `DoubleMotorStopMove` | Stop drivetrain move | — | — |
| `DoubleMotorSetSpeed` | Set speed | `MOTOR`: LEFT/RIGHT/BOTH | `SPEED` (SpeedShadow) |
| `DoubleMotorSetMoveSpeed` | Set move speed | — | `SPEED` (SpeedShadow) |
| `DoubleMotorSetTurnSteering` | Set steering for turns | — | — |
| `DoubleMotorSetEndstate` | Set hold/brake/coast on stop | `MOTOR`: LEFT/RIGHT/BOTH; `ENDSTATE`: Hold/Brake/Coast | — |
| `DoubleMotorSetAcceleration` | Set acceleration | — | — |
| `DoubleMotorSetPower` | Set power % | — | — |
| `DoubleMotorSetRotationCount` | Reset rotation counter | — | — |
| `DoubleMotorSetModelOrientation` | Set model orientation (upright/default) | — | — |

### Reporter / Boolean Blocks

| Block Type | Kind | Description | Fields |
|------------|------|-------------|--------|
| `DoubleMotorReporter` | value | Read position/speed/power | `MOTOR`: LEFT/RIGHT; `OPTION`: POSITION/SPEED/POWER |
| `DoubleMotorIsGesture` | boolean | True if gesture detected | `MOTOR`: LEFT/RIGHT; `GESTURE`: Cw/Ccw/Tapped |
| `DoubleMotorIsTilted` | boolean | True if hub tilted | `OPTION`: 0/1 |

### Hat (Event) Blocks

| Block Type | Description | Fields |
|------------|-------------|--------|
| `DoubleMotorWhenTapped` | Triggers when hub is tapped | — |

---

## Motor (Single Motor)

Controls a single motor connected to the hub (e.g., an arm or attachment).

### Statement Blocks

| Block Type | Description | Fields | Inputs |
|------------|-------------|--------|--------|
| `MotorRunForRotations` | Run for N rotations | `DIRECTION`: Cw/Ccw; `UNIT`: ROTATIONS | `VALUE` (RotationsShadow) |
| `MotorRunToPosition` | Run to position | — | `POSITION` (PositionShadow) |
| `MotorStartDirection` | Start spinning | `DIRECTION`: Cw/Ccw | — |
| `MotorStop` | Stop motor | — | — |
| `MotorSetSpeed` | Set speed | — | `SPEED` (SpeedShadow) |
| `MotorSetEndstate` | Set hold/brake/coast | — | — |
| `MotorSetAcceleration` | Set acceleration | — | — |
| `MotorSetPower` | Set power % | — | — |
| `MotorSetRotationCount` | Reset rotation counter | — | — |

### Reporter / Boolean Blocks

| Block Type | Kind | Description |
|------------|------|-------------|
| `MotorReporter` | value | Read motor position/speed |
| `MotorIsGesture` | boolean | True if gesture detected |

---

## Events

### Hat (Trigger) Blocks

| Block Type | Description | Fields |
|------------|-------------|--------|
| `EventsWhenProgramStarts` | Runs on Play button | — |
| `EventsWhenKeyPressed` | Runs on key press | `KEY`: Any, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, a-z, 0-9 |
| `EventsWhen` | Runs when condition is true | — | `CONDITION` |
| `EventsWhenMessageReceived` | Runs on message broadcast | `MESSAGE`: string name |

### Statement Blocks

| Block Type | Description | Fields | Inputs |
|------------|-------------|--------|--------|
| `EventsSendMessage` | Broadcast a message | `OPTION`: CONTINUE/WAIT | `MESSAGE` (MessageMenuShadow) |

### Reporter / Boolean Blocks

| Block Type | Kind | Description | Fields |
|------------|------|-------------|--------|
| `EventsIsKeyPressed` | boolean | True if key currently held | `KEY`: ArrowLeft/ArrowRight/etc. |

---

## Control

### Statement Blocks

| Block Type | Description | Inputs |
|------------|-------------|--------|
| `ControlWait` | Wait N seconds | `SECONDS` (ShadowNumber) |
| `ControlWaitUntil` | Wait until condition | `CONDITION` |
| `ControlRepeat` | Repeat N times | `TIMES`, `BODY` |
| `ControlRepeatUntil` | Repeat until condition | `CONDITION`, `BODY` |
| `ControlForever` | Loop forever | `BODY` |
| `ControlIf` | If/then | `CONDITION`, `BODY` |
| `ControlIfElse` | If/then/else | `CONDITION`, `IFBODY`, `ELSEBODY` |
| `ControlStop` | Stop this/all scripts | — |
| `ControlRepeatWithIndex` | Repeat with counter variable | — |

---

## ColorSensor

Reads light/color from the color sensor attachment.

### Hat Blocks

| Block Type | Description | Fields |
|------------|-------------|--------|
| `ColorSensorWhenColor` | Triggers on detected color | `COLOR`: -1 (any), 1–6 (color index) |

### Reporter / Boolean Blocks

| Block Type | Kind | Description | Inputs |
|------------|------|-------------|--------|
| `ColorSensorColor` | value | Returns color index | — |
| `ColorSensorReflection` | value | Returns reflection % | — |
| `ColorSensorIsColor` | boolean | True if color matches | `COLOR` (ColorPickerShadow) |

**ColorPickerShadow**: `VALUE` = 1–8 (color index: 1=black, 2=violet, 3=blue, 4=cyan, 5=green, 6=yellow, 7=red, 8=white)

---

## Controller

Reads the LEGO Education remote control lever.

### Hat Blocks

| Block Type | Description | Fields |
|------------|-------------|--------|
| `ControllerWhenLever` | Triggers on lever move | `LEVER`: ANY/LEFT/RIGHT; `OPTION`: UP/DOWN |

### Reporter / Boolean Blocks

| Block Type | Kind | Description | Fields |
|------------|------|-------------|--------|
| `ControllerPosition` | value | Lever position value | — |
| `ControllerIsLever` | boolean | True if lever in position | `LEVER`: ANY/LEFT/RIGHT/BOTH; `OPTION`: UP/DOWN/MIDDLE |

---

## AIPose

Body pose detection and AI classifier using the camera.

### Hat Blocks

| Block Type | Description | Fields |
|------------|-------------|--------|
| `AIPoseBodyWhenPerson` | Triggers on person appears/disappears | `OPTION`: APPEARS/DISAPPEARS/PRESENT/ABSENT |
| `AIPoseBodyWhenPointsTouching` | Triggers when two body points touch | `ONE`, `TWO`: body landmark keys |
| `AIPoseClassifierWhenClassDetected` | Triggers on AI class detected | `CLASSINDEX`: 0/1/2/3 |

### Reporter / Boolean Blocks

| Block Type | Kind | Description | Fields |
|------------|------|-------------|--------|
| `AIPoseBodyDistancePoints` | value | Distance between two body points | `ONE`, `TWO`: body landmark keys |
| `AIPoseBodyPointPosition` | value | X or Y coordinate of body point | `AXIS`: x/y; `LANDMARK`: nose/left_wrist/right_wrist/left_knee/etc. |
| `AIPoseBodyAnglePoints` | value | Angle between body points | — |
| `AIPoseBodyHasPerson` | boolean | True if person detected | — |
| `AIPoseClassifierIsClass` | boolean | True if AI class active | `CLASSINDEX`: 0/1/2/3 |
| `AIPoseClassifierConfidenceForClass` | value | Confidence % for class | `CLASSINDEX`: 0/1/2/3 |

---

## Data

Variables, lists, timer, and text I/O.

### Variable Blocks

| Block Type | Kind | Description | Fields | Inputs |
|------------|------|-------------|--------|--------|
| `DataVariableSet` | statement | Set variable | `VARIABLE`: `{"id": "var_id"}` | `VALUE` |
| `DataVariableChangeBy` | statement | Change variable by N | `VARIABLE`: `{"id": "var_id"}` | `VALUE` |
| `DataVariableGet` | value | Read variable value | `LABEL`: variable name string | — |

**Important**: `VARIABLE` field in Set/ChangeBy is an object `{"id": "var_id"}`, not a string. `DataVariableGet` uses `LABEL` (string name) instead.

### Timer Blocks

| Block Type | Kind | Description |
|------------|------|-------------|
| `DataTimer` | value | Returns elapsed seconds since last reset |
| `DataResetTimer` | statement | Resets the timer to 0 |

### List Blocks

| Block Type | Description |
|------------|-------------|
| `DataListAdd` | Add item to list |
| `DataListDelete` | Delete item from list |
| `DataListInsert` | Insert at index |
| `DataListReplace` | Replace item at index |
| `DataListItemAtIndex` | Get item at index (value) |
| `DataListIndexOf` | Find item index (value) |
| `DataListAggregate` | Sum/min/max/avg of list (value) |
| `DataListFilter` | Filter list (value) |
| `DataListClear` | Clear list |

### Text I/O Blocks

| Block Type | Description |
|------------|-------------|
| `DataTextAsk` | Show text input prompt |
| `DataTextAnswer` | Last answer from prompt (value) |
| `DataTextWrite` | Display text on screen |

---

## Operators

Math, comparison, logic, and string operations. All return values or booleans.

| Block Type | Kind | Description | Fields | Inputs |
|------------|------|-------------|--------|--------|
| `OperatorsArithmetic` | value | +, -, ×, ÷ | `OPERATOR`: ADD/SUBTRACT/MULTIPLY/DIVIDE | `A`, `B` |
| `OperatorsCompare` | boolean | <, =, > | `OP`: LT/EQ/GT | `A`, `B` |
| `OperatorsAnd` | boolean | A and B | — | `A`, `B` |
| `OperatorsOr` | boolean | A or B | — | `A`, `B` |
| `OperatorsNot` | boolean | not A | — | `A` |
| `OperatorsRandom` | value | Random number in range | — | `A`, `B` |
| `OperatorsRound` | value | Round number | — | — |
| `OperatorsIsBetween` | boolean | A between low and high | — | — |
| `OperatorsEquals` | boolean | string equality | — | — |
| `OperatorsJoin` | value | Concatenate strings | — | — |
| `OperatorsLetterOf` | value | Character at index | — | — |
| `OperatorsLengthOf` | value | String length | — | — |
| `OperatorsContains` | boolean | String contains substring | — | — |

---

## Sound

Plays sounds from the `canvas.sounds` array.

| Block Type | Kind | Description | Fields | Inputs |
|------------|------|-------------|--------|--------|
| `SoundPlaySound` | statement | Play a sound | `OPTION`: WAIT/NOWAIT | `SOUND` (soundShadow) |
| `SoundStop` | statement | Stop all sounds | — | — |
| `SoundSetEffect` | statement | Set pitch/volume effect | — | — |

**soundShadow**: `VALUE` = 1-based integer index into `canvas.sounds[]` array (not the sound name string).

---

## Music

MIDI-style music blocks.

| Block Type | Kind | Description | Inputs |
|------------|------|-------------|--------|
| `MusicPlayNoteForBeats` | statement | Play MIDI note | `NOTE` (ComplexMidiNotePickerShadow), `INSTRUMENT` (InstrumentShadow), `BEATS` |
| `MusicPlayDrumForBeat` | statement | Play drum sound | `DRUM` (DrumShadow), `BEATS` |
| `MusicRestForBeat` | statement | Rest (silence) | `BEATS` |
| `MusicSetTempoTo` | statement | Set tempo (BPM) | `TEMPO` |
| `MusicTempo` | value | Current tempo | — |

Shadow types: `ComplexMidiNotePickerShadow` (fields: `VALUE`=MIDI note 0-127), `DrumShadow` (fields: `VALUE`=drum 1-18), `InstrumentShadow` (fields: `VALUE`=instrument 1-21)

---

## MyBlock (Custom Blocks)

User-defined reusable block procedures. See [[lecp-project-schema]] for exact JSON structure.

| Block Type | Kind | Description |
|------------|------|-------------|
| `MyBlockDefinition` | statement | Defines the custom block; body in `next` chain |
| `MyBlockPrototype` | special | Inside `PROTOTYPE` shadow slot; holds args + shared `id` |
| `MyBlockCall` | statement | Calls the custom block; inputs named `"{arg}_1"` |
| `MyBlockStringArg` | special | Named string argument slot |
| `MyBlockStringArgShadow` | shadow | Default value for arg slot |

**Key rules**:
- `MyBlockPrototype` must be in the `shadow` slot (not `block`) of `MyBlockDefinition.inputs.PROTOTYPE`
- `MyBlockPrototype` and `MyBlockCall` share the same `extraState: {args: [...], id: "shared_id"}`
- Function body lives in `MyBlockDefinition.next`, not inside the prototype
- Call input keys: `"{arg_name}_1"` with `ShadowText` as default value

---

## Shadow / Value Types

Typed placeholder blocks that fill input slots:

| Shadow Type | Field | Values |
|-------------|-------|--------|
| `ShadowNumber` | `NUMBER` | Any number |
| `ShadowText` | `TEXT` | Any string |
| `RotationsShadow` | `VALUE` | Rotations (float) |
| `SpeedShadow` | `VALUE` | Speed % (5–100) |
| `TurnForDegreesShadow` | `VALUE` | Degrees (e.g., 90, 180) |
| `PositionShadow` | `VALUE` | Motor position (0/120/180/...) |
| `PowerShadow` | `VALUE` | Power % (e.g., 15/50) |
| `ColorPickerShadow` | `VALUE` | Color index 1–8 |
| `soundShadow` | `VALUE` | 1-based index into `canvas.sounds[]` |
| `DrumShadow` | `VALUE` | Drum number 1–18 |
| `InstrumentShadow` | `VALUE` | Instrument number 1–21 |
| `ComplexMidiNotePickerShadow` | `VALUE` | MIDI note 0–127 |
| `MessageMenuShadow` | `VALUE` | Message name string |

---

## Block Counts by Category

From lesson files (56 LECP files analyzed):

| Category | Block Types (confirmed in lessons) |
|----------|------------------------------------|
| DoubleMotor | 17 statement + 3 reporter + 1 hat = 21 |
| Motor | 9 statement + 2 reporter = 11 |
| Events | 4 hat + 1 statement + 1 boolean = 6 |
| Control | 9 statement = 9 |
| AIPose | 3 hat + 6 reporter = 9 |
| Data | 3 variable + 2 timer + 9 list + 3 text = 17 |
| Operators | 12 value/boolean = 12 |
| ColorSensor | 1 hat + 2 value + 1 boolean = 4 |
| Controller | 1 hat + 1 value + 1 boolean = 3 |
| Sound | 3 statement = 3 |
| Music | 4 statement + 1 value = 5 |
| MyBlock | 5 special = 5 |

---

## Related pages
- [[lecp-project-schema]]
- [[lecp-file-operations]]
- [[coding-and-programming]]
- [[submerged-solutions]]
