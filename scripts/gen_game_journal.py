#!/usr/bin/env python3
"""Build docs/game-journal.html — the Robot Game timeline.

Same page and styling as the Innovation Project journal (it reuses that
generator's template). Text comes from wiki/season-journal.md, the whiteboard
photos and the team chat; media are resized copies in docs/assets/game/ made
by hand from raw/all-photos/ and raw/whatsapp/ (neither is committed).
Edit ENTRIES below, then run:

    python3 scripts/gen_game_journal.py
"""
import re
from pathlib import Path
import gen_innovation_journal as base

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "game-journal.html"
A = "assets/game/"

TAGS = {
    "build":  "Robot builds",
    "scores": "Scores & runs",
    "roles":  "Roles & team",
    "rules":  "Rules & strategy",
}

def P(n, cap, alt=None):
    return ("photo", f"{A}p{n:03d}.jpg" if isinstance(n, int) else f"{A}{n}.jpg", cap, alt or cap)

def V(f, cap):
    return ("video", f"{A}{f}.mp4", cap, cap)

ENTRIES = [
 dict(d="2026-08-09", label="Sun 9 Aug", week="Week 2", title="Most of the field is built",
      tags=["build", "roles"], src="Journal + photos",
      body="""<p>The bulk of the mission models went together: <strong>grand tree, hive, nest, cave waterfall, token recycler and operator barrier</strong>. A few structures went home between families to finish during the week &mdash; which means the field only exists when everyone turns up with their part.</p>
<p>The team&rsquo;s own entry says who built what: Kyle the grand tree, hive and operator barrier; Lindsey the nest, grand tree, cave waterfall and barrier; Cheryl the grand tree, token recycler and barrier; Lola the grand tree and recycler; Kei the grand tree and cave waterfall. Patience while building was recorded as a Core Values moment: Kei and Kyle on the hive, Cheryl and Lola, Lindsey and Kei.</p>""",
      media=[P(3, "Building at the table, 9 Aug, 4:09 pm"),
             P(5, "A first look at the field with a tool on it, 4:15 pm"),
             P(12, "Setting the field up in the garage, 6:27 pm")]),

 dict(d="2026-08-16", label="Sun 16 Aug", week="Week 3", title="The field is finished and the kids play the game",
      tags=["build", "scores", "roles"], src="Journal + photos",
      body="""<p>After the morning at the farm, the rest of the day was build and practice. <strong>All mission structures were complete, all motors installed, and the first Driver robot and Technician tool were built with basic coding.</strong> The Operator tool was finished too, ahead of the week&rsquo;s goal.</p>
<p>The team also learned how the field is loaded with keystone species and resources, then played <strong>five familiarisation run-throughs at the full 2:30</strong>, with everyone rotating through every role. They were not scored matches. They were the first time the kids saw the game as a game, and a chance to feel how long 2:30 is.</p>""",
      media=[P(43, "Parents and kids around the finished field, 2:23 pm"),
             P(45, "A first tool on the field, 2:31 pm")]),

 dict(d="2026-08-23", label="Sun 23 Aug", week="Week 4", title="Skipped — and the goals that carried over",
      tags=["roles"], src="Journal",
      body="""<p>No meeting while the coaches weighed the edition question. The goals set that week carried into Week 5, and for the first time they had named owners: <strong>Kyle and Lindsey</strong> improve the Driver robot; <strong>Kei</strong> rebuilds the Technician tool from launching to dropping down a ramp with a slow single motor; <strong>Cheryl and Lola</strong> build new Operator tools for accuracy into the grand tree; everyone works on in-game communication and studies the rulebook.</p>""",
      media=[]),

 dict(d="2026-08-30", label="Sun 30 Aug", week="Week 5", title="A collector on the base, a ramp on the Technician",
      tags=["build", "scores"], src="Journal + photos",
      body="""<p>The Week 4 goals landed. The driving base now ran with a <strong>collector</strong>, the Technician&rsquo;s launcher was replaced by a <strong>ramp</strong>, and the Operator&rsquo;s tools were improved for grand-tree accuracy. <strong>Multiple game runs</strong> were completed with the new configuration. The kids were also tested on the rulebook and learned how judges score, which matters more than it sounds: knowing that finishing is a 3 and exceeding needs a comment explains why the work does not stop at &ldquo;it runs.&rdquo;</p>""",
      media=[P(54, "The base with its collector, 30 Aug, 2:52 pm"),
             P(56, "The same base from the front"),
             P(59, "A tool on the field, 6:06 pm"),
             P(65, "Practising in the garage, 7:12 pm")]),

 dict(d="2026-09-06", label="Sun 6 Sep", week="Week 6", title="First points on the board: 100",
      tags=["scores", "build", "rules"], src="Journal + photos",
      body="""<p>The first real score: <strong>about 100 points across 10-plus runs</strong>. The driving base was rebuilt strong and navigated to the young forest by program; the Technician ramp delivered <strong>three keystone species</strong> into the microbiome. That is 60 points on mission M01 alone, with the rest from elsewhere on the field.</p>
<p>The team also made its first strategy call: <strong>split the grand tree in two</strong> so one structure serves both the cave waterfall and the young forest. It is a refusal to pick between parking tokens (20 points once) and cycling them (5 points a time): build a dispenser that feeds both.</p>""",
      media=[P(68, "Building on the floor, 6 Sep, 2:15 pm"),
             P(71, "A ramp-style tool on a green base, 6:37 pm"),
             P(70, "The tower tool, held up, 6:37 pm"),
             P(73, "The tower tool from above, 6:38 pm")]),

 dict(d="2026-09-07", label="Mon 7 Sep", week="Between meetings", title="A home run worth 210",
      tags=["scores"], src="Journal",
      body="""<p>The next day a <strong>home run, filmed by Kevin and tallied by Jason, scored 210</strong>: three keystone species in each of two microbiomes (120), the M01 bonus for knocking down the invasive queen (40), and M04 &mdash; all species out of the nest (30) and all resources out of the hollow tree (20).</p>
<p>Kevin&rsquo;s note that day is the honest one: <em>&ldquo;the base is definitely a bit too big so it doesn&rsquo;t have much room for error.&rdquo;</em> That is the decision to shrink it, made two days before the meeting.</p>""",
      media=[             P(143, "The dispenser tower on its base, 7:50 pm"),
             P(145, "The tower from the side")]),

 dict(d="2026-09-09", label="Wed 9 Sep", week="Between meetings", title="Tower and dispenser builds",
      tags=["build"], src="Photos",
      body="""<p>Photos from the home builds that led to the Week 7 dispenser: a tall brown tower on a low brick base, with a gear train and a carrier at the foot. What changed from photo to photo is not written down, so the record is only the pictures.</p>""",
      media=[P(149, "Tower on its base, 9 Sep, 4:53 pm"),
             P(152, "Same build from another angle"),
             P(154, "Another view, 5:02 pm"),]),

 dict(d="2026-09-13", label="Sun 13 Sep", week="Week 7", title="Three decisions: small, a dispenser, program first",
      tags=["build", "rules"], src="Journal + photos",
      body="""<p><strong>1 &mdash; The base is small, simple and sticky.</strong> Lighter means it stops where it was told; grippy wheels mean a counted rotation is a rotation the robot made. <strong>2 &mdash; The dispenser replaces the ramp:</strong> it carries six keystone species and releases three at a time, which is exactly the most a microbiome scores, so one release fills one microbiome for 60 points. That is the third Technician design (launcher, ramp, dispenser), the evidence the Engineering Design rubric wants. <strong>3 &mdash; Program first, controller to correct:</strong> runs vary slightly, so the program drives and the Driver nudges the last few millimetres.</p>""",
      media=[P(163, "The dispenser tower in hand, 13 Sep, 5:57 pm"),
             P(165, "Tower top, with the white carrier"),
             P(170, "The tower on a smaller base, 10:48 pm"),
             P(174, "A wheel and base detail, 10:53 pm")]),

 dict(d="2026-09-20", label="Sun 20 Sep", week="Week 8", title="Three projects, run side by side",
      tags=["build", "roles", "rules"], src="Journal + photos",
      body="""<p>After the morning farm tour the afternoon was robots, now organised as <strong>three named projects</strong>. <strong>Project 1</strong> (Cheryl and Lola) &mdash; young forest, nest and hollow tree, missions M01 and M04: the software improved, but drift correction on the controller was still unreliable. <strong>Project 2</strong> (Kyle, Lindsey and Kei) &mdash; cave waterfall: the tower lifts a keystone and rotates, and the grabber that feeds a token into it was not designed yet. <strong>Project 3</strong> (Kei) &mdash; the Operator tool: an improved tool was decided.</p>
<p>Two candidate feeders were sketched: a hand-pressed bell crank, and a tread-triggered version seen in another team&rsquo;s video. It was also the &ldquo;40% week&rdquo;: any mission scoring under 40% of attempts gets cut.</p>""",
      media=[P(218, "Setting up the field, 20 Sep, 1:43 pm"),
             P(220, "Kids and parents at the field, 1:45 pm"),
             P(221, "Working on a tool at the field")]),

 dict(d="2026-09-27", label="Sun 27 Sep", week="Week 9", title="A project week — with some robot time after all",
      tags=["build"], src="Journal + photos",
      body="""<p>The season journal records Week 9 as <strong>an entirely project week with no robot time</strong>. Two photos taken at 3:32 and 3:34 pm, after the mentor visit, show a small red-and-white robot being handled at the field table and adults helping the kids with a tool. So a little robot work did happen that afternoon; how much is not recorded.</p>""",
      media=[P(293, "Fitting a small red tool, 27 Sep, 3:32 pm"),
             P(294, "An adult helping at the field, 3:34 pm")]),

 dict(d="2026-10-04", label="Sun 4 Oct", week="Week 10", title="Three bases, one jig — and meshers",
      tags=["build", "rules"], src="Journal + photos",
      body="""<p><strong>Each kit family now had an identical base,</strong> which let Projects 1 and 2 run at the same time. The design carries both a double and a single motor and swaps two attachments by gears. Kei finished the pickup tool, with a rubber band to help the grab.</p>
<p>The decision that matters most: the team learned to build <strong>meshers</strong>, parts shaped to fit into the hollow tree, cave waterfall and nest, so the tool locks onto the model itself. The reason the kids gave was <em>to avoid inconsistency between the software and the real table.</em> With no gyro, the robot only has to get close; the geometry does the rest.</p>
""",
      media=[P(347, "The small red-and-white base and its controller, 4 Oct, 10:50 am"),
             P(349, "The base on the mat"),
             P(360, "A base with the tower and the grand-tree ring, 12:46 pm"),
             ("photo", A + "w291.jpg", "Gear and wheel detail on the base", "A hand holding a base with gears and wheels"),
             ("photo", A + "w296.jpg", "A top view of the base, ready for attachments", "A base unit seen from above")]),

 dict(d="2026-10-06", label="Tue 6 Oct", week="Between meetings", title="Kei's pickup tool",
      tags=["build", "roles"], src="Chat",
      body="""<p>Meiling shared a photo with the note <em>&ldquo;Kei&rsquo;s work&rdquo;</em> &mdash; Kei building the pickup tool on the robot. The coaches&rsquo; reply was simply &ldquo;good job Kei.&rdquo;</p>""",
      media=[("photo", A + "w372.jpg", "Kei with the pickup tool on the robot, 6 Oct", "A child building a robot with a pickup tool")]),

 dict(d="2026-10-17", label="Sat 17 &ndash; Sun 18 Oct", week="Week 12", title="Rebuilding on the new base",
      tags=["build", "scores"], src="Journal + photos",
      body="""<p>A robot session, but <strong>no complete run was possible</strong>. The team connected the new base to the dispenser and finalised the gear connections, the connection every attachment depends on. The waterfall with its new attachment was <strong>not working</strong>; the kids struggled to get it to loop. In the coaches&rsquo; words it was <em>&ldquo;mostly trying to adjust to the base, new gear, and then the same missions.&rdquo;</em></p>
<p>The photos show the red-bodied base with its brown dispenser tower the night before, then through Sunday: hand-built arms in red, blue and black, a tall pole on a low frame, and a red wing fitted to the tower base.</p>""",
      media=[P(433, "Base with the dispenser, 17 Oct, 5:26 pm"),
             P(437, "Same build, from the front"),
             P(446, "Late-night work, 18 Oct, 12:15 am"),
             P(453, "A hand-built red and blue arm, 10:06 am"),
             P(454, "A long black arm"),
             P(457, "The tower with a gear train on the side, 10:12 am"),
             P(466, "Fitting the red piece, 11:39 am"),
             P(470, "The tower base with a red wing, 11:59 am"),
             P(473, "Same build, side view"),
             P(484, "On the field, 12:58 pm"),
             P(486, "On the field, a second view"),
             V("v1018-garage", "A build session in the garage, 18 Oct")]),

 dict(d="2026-10-25", label="Sun 25 Oct", week="Week 13", title="Eight rounds, 2:30 each, scored for real",
      tags=["scores", "build", "roles"], src="Journal + photos",
      body="""<p>The first complete set of scored matches back to back, with roles rotating: <strong>135, 65, 95, 165, 125, 5, 125, 185</strong>. Total 900, average <strong>112.5</strong>, median 125. The best round was 185; the worst was 5. The coach&rsquo;s read: <em>&ldquo;the team did pretty well, learn to focus&rdquo;</em> &mdash; the lesson was <strong>readiness checks</strong>, because many lost points were setup, not driving or design.</p>
<p>The whiteboard photographed that afternoon is the only first-hand copy of the plan: <strong>Project 1</strong> (young forest, nest and hollow tree) with the Operator collecting resources and a hollow-tree drop owned by C and L; <strong>Project 2</strong> (cave waterfall) owned by L, K and K; <strong>Project 3</strong> (grand tree, operator tool, grasp) owned by K; and the eight round scores down the side. Photos from 9 pm the night before to 8:27 that morning show the grand-tree tool in several states, with a grey side wall and a swinging white plate.</p>""",
      media=[P(637, "The red base beside the grand-tree tool, 24 Oct, 9:09 pm"),
             P(639, "The tool with its grey wall and white plate, 25 Oct, 8:27 am"),
             P(643, "The same tool from the other side"),
             P(714, "The whiteboard, 3:12 pm: three projects, owners, and the eight round scores"),
             P(718, "A base with the tower and a red wing, 3:35 pm"),
             P(719, "The same base, from the front"),
             P(723, "The field and the coding screen, 3:36 pm"),
             P(724, "A second robot with a tall pole and wing, 3:45 pm"),
             P(726, "Watching a run, 4:13 pm"),
             P(729, "The waterfall rig from above, 4:19 pm"),
             P(732, "A close view of the waterfall rig, 4:41 pm"),
             V("v1025-run", "At the field table, 4:31 pm, first 45 seconds")]),

 dict(d="2026-10-27", label="Tue 27 Oct", week="Between meetings", title="Practice at the field",
      tags=["scores"], src="Chat",
      body="""<p>A parent filmed several practice sessions at the field on the Tuesday after the eight rounds. Scores were not relayed, so the clips are the only record.</p>""",
      media=[V("v1027-robot", "The robot on the field, 27 Oct"),
             V("v1027-run-a", "Practice at the field, first 45 seconds"),
             V("v1027-run-b", "Another practice, first 40 seconds"),
             V("v1027-run-c", "A third practice, first 40 seconds")]),

 dict(d="2026-11-01", label="Sun 1 Nov", week="Week 14", title="The spread closed — and the base failed its height check",
      tags=["scores", "build", "roles", "rules"], src="Journal + photos",
      body="""<p>Four scored runs: <strong>170, 140, 105, 160</strong>. Average <strong>143.75</strong> against 112.5 a week earlier, and the lowest run rose from 5 to 105. Game rank is the average across at least three matches, so the floor matters more than the ceiling. The coach&rsquo;s clearest positive: Specialist, Operator, Driver and Technician were <strong>talking to each other</strong> during runs.</p>
<p>The problems were all on the base. It is <strong>too low to deliver into the hollow tree</strong> and, as relayed, <strong>over the 8-inch inspection height</strong>, so the obvious fix makes the legal problem worse. The decision was to stop raising the robot: <strong>the grand tree drops into the hollow tree instead</strong>, and the driving base no longer travels there. The cave waterfall has a stronger new ramp that is still big and tall.</p>
<p>The kids also wrote down their <strong>top two roles</strong>. The whiteboard photographed at 1:52 pm is the resulting grid: Operator Kyle, Kei, Lindsey; Driver Kei, Lola; Specialist Cheryl, Kyle; Technician Lola, Lindsey, Cheryl. The earlier photo shows the picks circled, with the four scores in purple.</p>
<p class="flag"><strong>Measured that evening, loosely.</strong> At 8:41 pm someone held a tape measure against the base: about 7&frac12; to 8 inches at the top of the frame, but at an angle, and no number was written down. That frame looks like the rebuilt one (see 2 Nov), so the rebuild was already under way.</p>""",
      media=[P(737, "At the field, 1 Nov, 1:28 pm"),
             P(739, "The role picks, circled, 1:40 pm — with the four scores in purple"),
             P(740, "The role grid, 1:52 pm"),
             P(741, "A robot with a green tower, 2:07 pm"),
             P(744, "A new ramp piece beside a lime-green mission model, 2:40 pm"),
             P(750, "A gear train on a red plate, 6:58 pm"),
             P(751, "The same gear train, from another side"),
             P(752, "A red plate with gears beside the grand tree&rsquo;s brown trunk"),
             P(755, "Building beside the green ring, 8:32 pm"),
             P(759, "The base from the side, 8:41 pm"),
             P(760, "A tape measure against the base"),
             P(761, "The base with the tape in view")]),

 dict(d="2026-11-02", label="Mon 2 Nov", week="Week 14 follow-up", title="Rebuilt to fit under 8 inches — now 7",
      tags=["build", "rules"], src="Coach + photo",
      body="""<p>The photo from about 9 pm is the <strong>rebuild to meet the 8-inch height requirement</strong>: the same compact black frame as the evening before, with the brown tube now lying across the top and a green ring beside it &mdash; cut down from the tall tower build. The coach reports the build is now <strong>7 inches</strong>, one inch inside the limit.</p>
<p class="flag"><strong>Still to confirm:</strong> the 7 in. figure has no photo or written measurement behind it yet, and no run on the rebuilt base has been recorded, so it is not known whether it still does the jobs the taller one did. The rebuild is also structural work after the 25 October design freeze.</p>""",
      media=[P(769, "The rebuilt base, 2 Nov, 9:01 pm")]),
 dict(d="2026-11-08", label="Sun 8 Nov", week="Week 15", title="A new route with rotating roles — seven scored runs",
      tags=["scores", "roles", "rules", "build"], src="Coach report",
      body="""<p>The team met at Kevin&rsquo;s place and worked out a <strong>new route with clear, rotating roles</strong>.</p>
<ul>
<li><strong>Sequence 1</strong> no longer includes the hollow tree: just the <strong>young forest and the nest</strong>. The <strong>grand tree now handles the hollow tree</strong>.</li>
<li>The <strong>Technician</strong> now has to switch the attachment and carry <strong>4 more keystone species into the cave waterfall</strong>.</li>
<li>The team learned the young forest needs a <strong>4th keystone species</strong> to earn the extra <strong>40-point bonus</strong>.</li>
<li>The team decided to go after the <strong>invasive species</strong>: <strong>20 points each</strong> for knocking them down.</li>
<li>Work started on updating the <strong>robot game board</strong>; the three sequences on it now follow this route.</li>
</ul>
<p><strong>Seven scored matches:</strong> 85, 150, 250, 130, 160, 180, 230. That is an average of about <strong>169</strong> (1 Nov: 143.75), a median of 160, a low of 85 and a high of 250, so the spread (165) is wider than last week&rsquo;s 65.</p>
<p class="flag"><strong>Not recorded:</strong> which rounds ran the new route, which roles played which round, and what happened in the 85. The average is up about 25 points, but the new route and these scores may not be comparable with last week&rsquo;s.</p>""",
      media=[]),
]

AHEAD = [
 ("Decision needed", "The design freeze", "It was set for 25 Oct, bug fixes only. The 2 Nov rebuild of the base, and the waterfall ramp, are structural, so the freeze either moves or is already broken."),
 ("Sun 15 Nov", "Role depth", "Two seats are only two deep: train a third student at Specialist and a third at Driver."),
 ("Sun 22 Nov", "Everything complete", "Last session of the year, then mock judging."),
 ("Sat 30 / Sun 31 Jan &#9888;&#65039;", "Event (tentative)", "Last weekend of January, at one of two sites; the exact day is not confirmed."),
]

OPEN = [
 "<strong>The 7-inch figure on paper.</strong> The coach reports the rebuilt base at 7 in.; a square-on photo or a written measurement would settle it against the 203 mm (8 in.) limit.",
 "<strong>Whether the rebuilt base still does its jobs.</strong> No run on it has been recorded.",
 "<strong>Whether the four 1 Nov scores came before or after the hollow-tree decision.</strong>",
 "<strong>What cost round 3 its points</strong> on 1 Nov (105 against a median of 150), and rounds 2 and 6 on 25 Oct.",
 "<strong>A per-mission breakdown.</strong> The 40% cut rule needs to know which missions fail, not only the totals.",
 "<strong>How the grand tree handling the hollow tree affects M04&rsquo;s all-or-nothing 20 points.</strong> The route changed on 8 Nov; the effect on points is not recorded.",
 "<strong>Which round was the 85</strong> on 8 Nov, and whether the 250 was a clean run of the new route.",
 "<strong>Which roles played which round.</strong>",
 "<strong>A timed waterfall loop.</strong> It was asked for in Week 7 and still decides which match sequence to run.",
]

PAGE = base.PAGE
PAGE = PAGE.replace("Innovation Project Journal — BOT Builders", "Game Project Journal — BOT Builders")
PAGE = PAGE.replace('content="Dated timeline of the BOT Builders Innovation Project: farm visits, expert interviews, raising lacewings, the board and the presentation, with photos and videos."',
                    'content="Dated timeline of the BOT Builders robot game: field builds, tools, scored runs, role changes and the base problems, with photos and videos."')
PAGE = PAGE.replace('<h1 class="display">Innovation Project Journal</h1>', '<h1 class="display">Game Project Journal</h1>')
PAGE = re.sub(r'<p>The lacewing project, date by date.*?</p>',
              '<p>The robot game, date by date &mdash; the field, the tools, the scored runs, the role changes and the base problems. The Innovation Project has its own <a href="innovation-journal.html">journal</a>.</p>',
              PAGE, count=1, flags=re.S)
PAGE = re.sub(r'<footer class="wrap">.*?</footer>',
              '<footer class="wrap">\n  <p>Text is drawn from the <a href="wiki/season-journal.html">season journal</a>, the whiteboards and the team&rsquo;s WhatsApp group; each entry names its source. Photos and videos came from the team chat and from parents&rsquo; phones and are resized copies &mdash; the raw exports are not published.</p>\n  <p>Related: <a href="wiki/robot-evolution.html">Robot evolution</a> &middot; <a href="wiki/match-strategy.html">Match strategy</a> &middot; <a href="wiki/bioglow-missions.html">Missions</a> &middot; <a href="wiki/team-roster.html">Team roster</a> &middot; <a href="innovation-journal.html">Innovation journal</a></p>\n</footer>',
              PAGE, count=1, flags=re.S)
PAGE = PAGE.replace(".c-team {{ background:#F0A98F; }}", ".c-team {{ background:#F0A98F; }} .c-build {{ background:#E6C56A; }} .c-scores {{ background:#9CCBE8; }} .c-roles {{ background:#D7B0E8; }} .c-rules {{ background:#B8DC7E; }}")

def build():
    base.TAGS = TAGS  # entry_html reads the module-level tag names
    photos = sum(1 for e in ENTRIES for m in e["media"] if m[0] == "photo")
    vids = sum(1 for e in ENTRIES for m in e["media"] if m[0] == "video")
    entries = "".join(base.entry_html(e) for e in ENTRIES)
    chips = '<button class="f on" data-f="all" type="button">All</button>' + "".join(
        f'<button class="f" data-f="{k}" type="button">{v}</button>' for k, v in TAGS.items())
    ahead = "".join(f'<li><span class="a-d">{d}</span><span class="a-t"><strong>{t}</strong> &mdash; {x}</span></li>' for d, t, x in AHEAD)
    openl = "".join(f"<li>{x}</li>" for x in OPEN)
    return PAGE.format(entries=entries, chips=chips, ahead=ahead, openl=openl,
                       n=len(ENTRIES), photos=photos, vids=vids)

if __name__ == "__main__":
    OUT.write_text(build(), encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} - {len(ENTRIES)} entries")
