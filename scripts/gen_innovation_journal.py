#!/usr/bin/env python3
"""Build docs/innovation-journal.html — the Innovation Project timeline.

Text comes from wiki/season-journal.md (the innovation sections) and the team
WhatsApp chat; media lives in docs/assets/innovation/ (resized copies — the
raw chat export is not committed). Edit ENTRIES below, then run:

    python3 scripts/gen_innovation_journal.py
"""
import html
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "innovation-journal.html"
A = "assets/innovation/"

TAGS = {
    "farm":    "Farms & experts",
    "rearing": "Raising insects",
    "board":   "Board & presentation",
    "mentor":  "Mentors & outreach",
}

def P(f, cap, alt=None):
    return ("photo", A + f + ".jpg", cap, alt or cap)

def V(f, cap):
    return ("video", A + f + ".mp4", cap, cap)

# date (sort key), label, week, title, tags, source, body html, media
ENTRIES = [
 dict(d="2026-08-09", label="Sun 9 Aug", week="Week 2", title="Research items assigned",
      tags=["farm"], src="Journal",
      body="""<p>Each student was given a research item for the Innovation Project. Nothing about the topic was settled yet.</p>""",
      media=[]),

 dict(d="2026-08-16", label="Sun 16 Aug", week="Week 3", title="First farm visit — Coastal Roots Farm",
      tags=["farm"], src="Journal",
      body="""<p>Morning at the farm, 9:00&ndash;12:00, before the evening robot session. What the kids learned:</p>
<ul>
<li><strong>Regenerative organic farming</strong> &mdash; the chicken-and-plant circle, how animals and crops feed each other</li>
<li><strong>Invasive species:</strong> Bermuda grass, spread by underground runners; and a <strong>rabbit problem</strong> in the crops</li>
<li><strong>Healthy soil</strong> &mdash; what makes soil alive rather than just dirt</li>
<li>Questions put to an expert &mdash; the tour guide &mdash; then a brainstorm of problems and ideas to help the farm</li>
</ul>
<p>Two real, named problems came out of the day. Both were about controlling something unwanted on a farm that cannot spray.</p>""",
      media=[P("0816-farm-logs", "On the log seating at the farm, 16 Aug, 10:49 am"),
             P("0816-lunch", "Team lunch afterwards, 12:33 pm")]),

 dict(d="2026-09-06", label="Sun 6 Sep", week="Week 6", title="The project is chosen: lacewings",
      tags=["rearing"], src="Journal",
      body="""<p>The kids studied the insect ecosystem &mdash; <strong>ladybugs, lacewings and hoverflies</strong>, the predators that keep pests down without spraying &mdash; and chose to build the project around the <strong>lacewing</strong>.</p>
<p>It looks like a shift away from Bermuda grass and rabbits, but it is the same question answered another way: biological pest control on a farm that cannot spray.</p>
<p class="flag"><strong>Needs a source.</strong> The session recorded that a lacewing eats <em>thousands of aphids a day</em>. Published figures are far lower, so the real number has to be found and cited before a judge hears it.</p>""",
      media=[]),

 dict(d="2026-09-13", label="Sun 13 Sep", week="Week 7", title="From choosing to designing",
      tags=["rearing", "board"], src="Journal",
      body="""<p>A quiz on lacewings, the farm and biodiversity checked the Week 6 learning had stuck. Then <strong>each child drew a lacewing habitat and life-cycle design</strong> and presented it to the group &mdash; five ideas explored, which is exactly what the <em>Ideate</em> row of the project rubric looks for. All five drawings are worth keeping, not only the winner.</p>""",
      media=[]),

 dict(d="2026-09-16", label="Tue 16 &ndash; Fri 19 Sep", week="Between meetings", title="Real insects arrive",
      tags=["rearing", "mentor"], src="Journal",
      body="""<p><strong>Tue 16</strong> &mdash; Rincon-Vitova paid; <strong>eggs arrived the same afternoon</strong>, with extra food. <em>&ldquo;They are super tiny.&rdquo;</em> The supplier steered the order down from a 1,000-egg commercial card to 50&ndash;100 eggs so the kids could follow individual insects from egg to adult.</p>
<p><strong>Wed 17</strong> &mdash; safe-handling notes sent to every family (no bare fingers, coax onto a leaf, never squeeze). The same day: <strong>cannibalism observed first-hand</strong>, five days after the supplier warned about it. Every family now has larvae at home and a design brief for an observation box.</p>
<p>The problem statement got sharper too. &ldquo;Kids don&rsquo;t know lacewings&rdquo; is not a real-world problem; <strong>&ldquo;people can&rsquo;t tell good bugs from bad, so they kill beneficials or spray&rdquo;</strong> is. On the 19th Unity Robotics paired the team with <strong>R!SE H!GH (FTC 36074)</strong> as mentors.</p>
<p>Detail: <a href="wiki/lacewing-project.html">Lacewing Project</a>, <a href="wiki/mentors.html">Mentors</a>.</p>""",
      media=[]),

 dict(d="2026-09-20", label="Sun 20 Sep", week="Week 8", title="Second farm tour — soil, wasps and a four-rung ladder",
      tags=["farm", "board"], src="Journal",
      body="""<p>Beneficial insects and pest control, a different visit from August&rsquo;s. What stuck:</p>
<ul>
<li><strong>Soil is fed, not just farmed</strong> &mdash; chicken manure for nitrogen, cover crops for carbon, black tarp to smother weeds without spraying. The guide&rsquo;s best line: <em>&ldquo;Fertiliser is sugar.&rdquo;</em></li>
<li><strong>Mummified aphids</strong> &mdash; a parasitoid wasp grows inside a living aphid. A pest that looks dead and is really a nursery, which is the problem statement on a leaf.</li>
<li><strong>Buy some, plant for others</strong> &mdash; the farm buys lacewings and <em>Aphidius</em> wasps, but plants habitat for ladybugs because bought ones fly away.</li>
<li><strong>The pest-control ladder</strong> &mdash; beneficial insects, then row covers, then crop rotation, and only in a bad outbreak a certified organic spray. The lacewing is rung one of four.</li>
</ul>
<p>Back home, two breeding problems showed up: <strong>food</strong> (aphids are scarce outside the farm) and <strong>cannibalism</strong>. The presentation board and the play were both introduced that afternoon. See <a href="wiki/biodiversity-at-the-farm.html">Biodiversity at the farm</a>.</p>""",
      media=[P("0920-farm-sign", "Arriving at Coastal Roots Farm, 20 Sep, 10:20 am"),
             P("0920-farm-canopy", "In the shade with the guide, 10:23 am"),
             P("0920-farm-guide", "Listening to the guide, 10:34 am"),
             P("0920-chickens", "The chickens — the farm's nitrogen source, 11:06 am"),
             P("0920-farm-garden", "In the garden with the guide, 11:26 am"),
             P("0920-farm-group", "End of the tour, 12:12 pm")]),

 dict(d="2026-09-23", label="Wed 23 Sep", week="Between meetings", title="The board is nearly built",
      tags=["board", "mentor"], src="Chat",
      body="""<p>Ivy and Meiling spent the day on the presentation board &mdash; &ldquo;most of it done,&rdquo; with a few things still to add and fix. The next weeks would go to training the kids to present and to team spirit, leaving more time for the table and the robot once the project was done.</p>
<p>The same afternoon R!SE H!GH&rsquo;s lead coach, Elly, said <strong>4&ndash;5 of their kids and two adults would visit on Sunday at 2 pm</strong>, bring a laptop to present, and ask our kids questions.</p>""",
      media=[P("0923-board", "The board as it stood on 23 September — Backyard Biodiversity, seven numbered sections", "Presentation board titled Backyard Biodiversity laid out on a table")]),

 dict(d="2026-09-24", label="Thu 24 &ndash; Fri 25 Sep", week="Between meetings", title="Ladybugs pupate; lacewings finally get enough food",
      tags=["rearing"], src="Chat",
      body="""<p>The ladybugs reached the <strong>pupa stage</strong> &mdash; <em>&ldquo;they don&rsquo;t move.&rdquo;</em> At Ivy&rsquo;s house the lacewings finally got enough food and did well; at Meiling&rsquo;s, by her own account, <em>&ldquo;almost all died.&rdquo;</em></p>
<p>Friday&rsquo;s videos show a larva in its cup, the clear observation tubes in their rack, and the small containers they were first raised in. A new ladybug arrived that evening.</p>""",
      media=[P("0924-ladybug-card", "The ladybug care card that came with the kit — watch them grow, then release"),
             P("0924-pupa", "A larger container with leaves and food, from Ivy's house, 24 Sep"),
             P("0925-tube-rack", "Five clear tubes in a yellow rack, one larva per tube"),
             P("0925-larva-cups", "Three lidded cups, a larva in each"),
             V("0925-larva", "A lacewing larva in its cup, 25 Sep")]),

 dict(d="2026-09-26", label="Sat 26 Sep", week="Between meetings", title="The official judging documents arrive",
      tags=["board"], src="Chat",
      body="""<p>The Future Edition judging rubric, awards list and award-allocation instructions were shared with every family. Meiling&rsquo;s note: they confirm Future is <em>a full FLL experience, not just the robot game</em>.</p>""",
      media=[]),

 dict(d="2026-09-27", label="Sun 27 Sep", week="Week 9", title="The first audience — R!SE H!GH visit and written feedback",
      tags=["board", "mentor"], src="Journal + Chat",
      body="""<p>The meeting started at noon, and from about 1:30 the kids rehearsed their parts in front of the board. At 2 pm the mentor team arrived with a presentation of their own, and <strong>the kids presented the lacewing project to them</strong> &mdash; the first time it had been explained to anyone outside the team. The board has five speaking parts, one per child. A parent filmed it, and a first ladybug emerged that afternoon.</p>
<p>The mentors wrote their notes up afterwards. These are the notes, and they are where the memorising question started:</p>
<blockquote>
<p><strong>What they praised:</strong> &ldquo;Slow down for each other and help each other with the lines. Bravo!&rdquo; &middot; &ldquo;Great enthusiasm &hellip; Everyone looked so excited.&rdquo; &middot; &ldquo;Nice presentation board. Very clear. Very neat.&rdquo;</p>
<p><strong>What to do next:</strong> survey or interview gardeners &middot; say who did what and how the final design was chosen &middot; <strong>estimate the cost of the kit</strong> &middot; plan how to display prototypes (&ldquo;maybe a rolling cart?&rdquo;) &middot; <strong>test the tube designs with real host plants</strong> &middot; go back to the farm and present the solution &middot; <strong>find two or more experts</strong> &middot; <strong>&ldquo;Memorize the lines instead of reading off the board.&rdquo;</strong> &middot; &ldquo;Maybe try to make the presentation into a sales pitch? A documentary? Or a science lab?&rdquo;</p>
</blockquote>
<p>Several of these have since been acted on: a survey at the 25 October station, a second expert booked, a $45 materials estimate in the board script, and a script that says who did what. <strong>Not recorded either way:</strong> real host plants in the tubes, a return visit to Coastal Roots, and the display cart.</p>""",
      media=[P("0927-rise-high-slide", "R!SE H!GH's own slide — their route from Spring Showdown to Regionals and State"),
             P("0927-feedback-1", "Feedback for The Bot Builders, by R!SE H!GH — what they identified and liked"),
             P("0927-feedback-2", "Feedback, continued — impact, Core Values, and next steps"),
             P("0927-feedback-3", "Feedback, continued — iterate, communicate, and the robot game"),
             P("0927-judge-questions", "The judging question list for the Innovation Project that came with the notes"),
             P("0927-present-1", "Rehearsing in front of the board before the visitors arrive, 1:31 pm"),
             P("0927-present-2", "Another section of the board, 1:35 pm"),
             P("0927-present-3", "1:41 pm"),
             P("0927-present-4", "Two presenters beside the board, 1:46 pm"),
             P("0927-audience", "2:00 pm — families and the visitors in the room, R!SE H!GH's slide on the TV"),
             P("0927-board-pair", "Two team members by the board, 2:55 pm"),
             P("0927-board-close", "The board with the presenters, 3:03 pm"),
             P("0927-beneficials-stand", "A garden store's beneficial-insects stand that afternoon, 4:22 pm — ladybugs $14.99, praying mantis $14.99, ladybugs and lacewings $19.99, nematodes $35"),
             V("0927-presenting", "A team member presents a section of the board to the visitors"),
             V("0927-presenting-2", "Another section, first 40 seconds"),
             V("0927-first-ladybug", "The first ladybug emerges")]),

 dict(d="2026-09-29", label="Tue 29 Sep &ndash; Fri 2 Oct", week="Between meetings", title="Expert booked; a project path chosen",
      tags=["farm", "board"], src="Chat",
      body="""<p>Meiling booked the <strong>expert Zoom with Tracy</strong> (Rincon-Vitova) for Sunday 4 October at 1 pm and sent a second shipment, this time with enough food. On 2 October new insects arrived and more food was ordered.</p>
<p>That day she read the newly published judging detail: teams must <strong>name their official Project Path</strong>. The lacewing project fits the <strong>Operator Path</strong> &mdash; start a conservation project to help a nearby ecosystem &mdash; so nothing needed redesigning. The wording went into the presentation: <em>&ldquo;We chose the Operator Project Path. We wanted to find a way to help our local ecosystem &hellip;&rdquo;</em> See <a href="wiki/project-paths.html">Project paths</a>.</p>""",
      media=[P("1002-new-bugs", "New insects arrive, 2 October"),
             P("1002-eggs-food", "Eggs and food in a small cup")]),

 dict(d="2026-10-04", label="Sun 4 Oct", week="Week 10", title="The expert interview — Tracy, Rincon-Vitova",
      tags=["farm", "rearing"], src="Journal + Chat",
      body="""<p>The first real expert interview of the season, over Zoom at the insectary, and it changed the design. The kids asked eight prepared questions. Three answers mattered most:</p>
<ul>
<li><strong>Ants.</strong> <em>&ldquo;Ants protect the pests because they like the honeydew. They&rsquo;ll fight off the beneficial insects and eat them.&rdquo;</em> Releasing lacewings into a garden with an ant trail may do very little.</li>
<li><strong>Separate or not &mdash; both are right.</strong> Her September email said separate the larvae. On Zoom she said put a few eggs per container and let the strongest survive. Different goals: <em>separate to observe, don&rsquo;t bother to produce</em> &mdash; which is the gap the project is built on.</li>
<li><strong>An open question.</strong> Asked whether lacewings need a wet sponge, as ladybugs do: <em>&ldquo;I don&rsquo;t know. That would be good to find out &hellip; a good experiment for you guys.&rdquo;</em></li>
</ul>
<p>Design changes that followed: accordion-folded paper instead of cardboard, no water for larvae at all, fresh aphids and fruit flies over moth eggs. The full question-and-answer record is on <a href="wiki/lacewing-project.html">Lacewing Project</a>.</p>
<p>The same morning Meiling scouted <strong>Fox Point Farms</strong> looking for aphids to feed the larvae &mdash; none in a winter backyard, and the farm was closed on Saturday &mdash; and found a visit worth making with the kids. In the evening each child took larvae home: Kyle adopted five and named them (Nice, Yip Yip, Yikes, Fire, Exape); Lindsey has five too.</p>
<p>Planning moved the same night: with no November tournament, <strong>22 November became the target to finish everything</strong>, and a video for the sharing booth was suggested.</p>""",
      media=[P("1004-interview", "The interview in progress — the board on the wall behind, tubes and a laptop on the table"),
             P("1004-farm-market", "Fox Point Farms — the market where Meiling went looking for lacewing food"),
             P("1004-farm-sign", "The farm's daily animal-tour sign — the later outing started here"),
             P("1004-shield-bug", "A green shield bug found on the scouting trip, identified on a phone")]),

 dict(d="2026-10-05", label="Mon 5 &ndash; Tue 6 Oct", week="Between meetings", title="Feeding experiments begin",
      tags=["rearing", "mentor"], src="Chat",
      body="""<p>The food problem turned into tests. A parent tried <strong>mashed boiled yolk as a droplet</strong>, and the larva seemed to eat it. Meiling found an <strong>artificial diet from a real USDA study</strong> (ground beef, liver, egg, brewer&rsquo;s yeast, honey, sugar, wrapped in stretched Parafilm) and set out a proper test: <strong>five larvae on the new food, five on the usual aphids as a control</strong>, watched daily.</p>
<p>R!SE H!GH&rsquo;s coach was &ldquo;very excited&rdquo; that the team had visited and planned a return visit where the kids would show their public-speaking skills.</p>""",
      media=[P("1005-yolk", "The yolk-paste droplet test, 5 October")]),

 dict(d="2026-10-07", label="Wed 7 Oct", week="Between meetings", title="Larvae eating, and the lesson about air holes",
      tags=["rearing"], src="Chat",
      body="""<p>Close-ups of a larva eating the meat diet: <em>&ldquo;This little guy really eats the meat.&rdquo;</em> Two lessons, written the way a notebook would: the container <strong>needs holes</strong> &mdash; otherwise no air and no water, and the larvae die &mdash; and, confirmed again, <em>&ldquo;Yes, they eat each other.&rdquo;</em></p>
<p>That evening the ordered food arrived: <strong>frozen moth eggs for larvae</strong> (freezer, a little at a time) and a large bag of <strong>Wheast for the adults</strong>.</p>""",
      media=[P("1007-larva-eating", "A larva feeding on the meat diet"),
             P("1007-larva-close", "Close-up of a larva"),
             P("1007-larvae-fight", "A larva on a paper towel — \u201cYes, they eat each other\u201d"),
             P("1007-food-arrived", "Moth-egg cups and the Wheast bag, 7 October"),
             V("1007-eating-a", "Feeding, clip 1"),
             V("1007-eating-b", "Feeding, clip 2"),
             V("1007-eating-c", "Feeding, clip 3")]),

 dict(d="2026-10-10", label="Sat 10 &ndash; Mon 12 Oct", week="Between meetings", title="Board version 2, and a game character",
      tags=["board", "mentor"], src="Chat",
      body="""<p>An updated board was shared for comments. Every child was asked to review their own part, practise, and record a video to send back. Coach Elly&rsquo;s reply on the photos: <em>&ldquo;I love that the kids wear their team T-shirt in all the meetings. That&rsquo;s core value. We should add that to the presentation too.&rdquo;</em></p>
<p>On the 12th an AI-generated lacewing-and-robot character arrived, with the note <em>&ldquo;We can use it to create the game.&rdquo;</em> That became the <a href="game.html">Lacewing Garden</a> game and the <a href="wiki/lacewing-game-v2.html">walk-around v2</a>.</p>""",
      media=[P("1010-board-v2", "The updated board, version 2"),
             P("1010-mentor-note", "Coach Elly's message about the team T-shirts"),
             P("1012-game-character", "The character the game started from")]),

 dict(d="2026-10-13", label="Tue 13 &ndash; Wed 14 Oct", week="Between meetings", title="The first cocoon",
      tags=["rearing"], src="Chat",
      body="""<p>A team website was shared on the 13th (<a href="https://shjasonhu.github.io/bioglow-lacewing/">shjasonhu.github.io/bioglow-lacewing</a>). On the 14th: <em>&ldquo;It became cocoon.&rdquo;</em> A larva had spun up, the stage the supplier&rsquo;s accordion-folded paper was meant to encourage.</p>""",
      media=[P("1014-cocoon-hand", "The cocoon, held in its tube"),
             P("1014-cocoon-vial", "The same cocoon, in the vial")]),

 dict(d="2026-10-15", label="Thu 15 Oct", week="Between meetings", title="Reading the rubric — and the five-kids script",
      tags=["board"], src="Chat",
      body="""<p>Meiling read the newly released judging rules and gave the team its four keywords: <strong>Evidence, Iteration, Consistency, Teamwork</strong>. The project rubric runs Explore, Ideate, Implement, Communicate, so judges want the journey &mdash; what was tried, what failed, what changed &mdash; not only the final design.</p>
<p>The same morning she shared <strong>a 20-page five-kids presentation script</strong> and asked parents to check the flow before it was shown to the children that Sunday. Her note to the adults: <em>they cannot just memorise it; they need to understand what they learned, what surprised them, what was hard, and say it in their own words.</em> This is where the <a href="wiki/lacewing-play.html">play</a> comes from.</p>""",
      media=[P("1015-script-1", "Performance script, page 1 of 4"),
             P("1015-script-2", "Performance script, page 2 of 4"),
             P("1015-script-3", "Performance script, page 3 of 4"),
             P("1015-script-4", "Performance script, page 4 of 4"),
             P("1015-playbook", "A prototype playbook for one of the presenters")]),

 dict(d="2026-10-18", label="Sun 18 Oct", week="Week 12", title="Prototype family and a finished board",
      tags=["rearing", "board"], src="Journal + Chat",
      body="""<p>A robot-focused Sunday, but the project kept moving. The finished board is dated 18 October, and a photo from that day shows the family of 3D-printed containers the team has made so far &mdash; lidded jars, a tube rack and a rotating carousel &mdash; laid out together. Kev shared the <a href="wiki/lacewing-project.html">team website</a> with the families the same afternoon.</p>""",
      media=[P("1018-prototypes", "Prototypes side by side: lidded jars, a tube rack, and a seven-hole carousel")]),

 dict(d="2026-10-25", label="Sun 25 Oct", week="Week 13", title="First public station — Fox Point Farms",
      tags=["mentor", "farm"], src="Journal + Chat",
      body="""<p>The morning was the <a href="wiki/fox-point-bee-tour.html">Fox Point Farms bee tour</a> and the team&rsquo;s <strong>first public station</strong>: board and live insects set out on a garden table for visitors. <strong>About 30-plus people stopped by</strong>, learned about the lacewing and <strong>took the survey</strong>, and the kids did a good job explaining. A three-QR-code letter went with it. It is the project&rsquo;s first real-user evidence.</p>
<p class="flag"><strong>Still to do:</strong> the survey count and the before-and-after answers have to be read off the form before the play&rsquo;s last scene can carry a real number. See <a href="wiki/outreach-event.html">Outreach event</a>.</p>""",
      media=[P("1025-farm-tables", "At the Harvest Market tables, 11:57 am"),
             P("1025-farm-group", "The team and parents outside the Harvest Market, 1:02 pm"),
             V("1025-station", "At the station, talking with visitors"),
             V("1025-cocoon", "That afternoon: a larva turning into a cocoon")]),

 dict(d="2026-10-30", label="Fri 30 Oct", week="Between meetings", title="The acrylic enclosure",
      tags=["rearing"], src="Chat",
      body="""<p>Ivy posted a video of an acrylic enclosure with a small plant inside &mdash; <em>&ldquo;I got one. Happy Happy&rdquo;</em> &mdash; and Rumi had one too. It is the housing the script describes, with a meter for temperature and humidity.</p>""",
      media=[V("1030-acrylic-box", "The acrylic enclosure with its plant")]),

 dict(d="2026-11-01", label="Sun 1 Nov", week="Week 14", title="The play meets its first real audience",
      tags=["board", "mentor"], src="Journal + Chat",
      body="""<p>The kids rehearsed with the added play script and <strong>performed it for the mentor team</strong>, with Coach Elly there to watch and give feedback. The kids struggled to remember the play, and the coach&rsquo;s thought was that a <strong>board</strong> might replace it.</p>
<p>What the project rubric requires: nothing says <em>memorised</em>. It asks for <strong>clear visuals</strong> and that <strong>all members meaningfully contribute</strong>. A board covers the first; a play is the strongest evidence of the second.</p>
<p class="flag"><strong>Not recorded:</strong> what the mentors specifically said on the day. Meiling&rsquo;s note afterwards says only that Elly gave &ldquo;very good advice and suggestions.&rdquo;</p>""",
      media=[V("1101-rehearsal", "The rehearsal in speaking order, first 45 seconds")]),

 dict(d="2026-11-02", label="Mon 2 Nov", week="Week 14 follow-up", title="The board becomes the memory aid",
      tags=["board", "farm"], src="Chat",
      body="""<p>Meiling answered the memory problem in a way that keeps the play: a <strong>Performance Guide</strong> that splits the script into <strong>five numbered sections, one per child, matching the five sections of the board</strong>. Speaking order: <strong>Cheryl, Kei, Lola, Lindsey, Kyle</strong>.</p>
<blockquote><p>&ldquo;Read only the spoken lines. Follow the same order every time &hellip; Point, look up, and explain. Your board helps you remember.&rdquo;</p></blockquote>
<p>Each child has a two-page mission sheet and was asked to use their own words. They record their voice parts, to be joined into a five-minute video; Ivy and Meiling pick and print photos so the kids can place them on the board together at the next meeting. That is the &ldquo;board as memory aid, play kept&rdquo; option from the 1 November write-up.</p>
<p>She also set up a <strong>professional interview</strong>: <strong>Cassandra Fieldson</strong>, science communicator, malaria researcher and ecologist, will meet the kids by Zoom on <strong>Sunday 15 November at 1 pm</strong> (she is away the weekend before). It is the second expert, as the mentors asked on 27 September, and it is already named on the board as &ldquo;feedback pending.&rdquo;</p>""",
      media=[P("1102-speaking-order", "The five sections, in speaking order, with key words and what to add to the board"),
             V("1102-feedback", "Coach Elly with the kids, 1 November")]),
]

AHEAD = [
 ("Sun 8 Nov", "Practice presentation", "A run in front of a public audience &mdash; the first test of the five-section script with the board as the memory aid."),
 ("Sun 15 Nov, 1 pm", "Cassandra Fieldson interview", "Zoom with an ecologist and science communicator; the board shows it as feedback pending."),
 ("Sun 22 Nov", "Everything complete &middot; mock judging", "Last session of the year: the full 24-minute judging simulation on the finished robot, project and presentation."),
 ("Sun 10 Jan", "Re-sharpen", "One week out: rehearse again after the December break."),
 ("Sun 17 Jan &#9888;&#65039;", "Event day (assumed)", "The date has not been announced. The regional coaches meeting on Tue 3 Nov is meant to explain the Futures plan."),
]

OPEN = [
 "<strong>The aphid figure.</strong> The Week 6 &ldquo;thousands a day&rdquo; number still has no source.",
 "<strong>Survey numbers</strong> from the 25 October station &mdash; the play&rsquo;s evidence blanks wait on them.",
 "<strong>What the mentors said on 1 November.</strong> The 27 September notes are now on file; the 1 November ones are not.",
 "<strong>Sponge or no sponge.</strong> Tracy called it a good experiment. It has not been run.",
 "<strong>Host plants in the tubes.</strong> Suggested by the mentors on 27 September; no test recorded.",
 "<strong>The board&rsquo;s Process and Impact sections.</strong> The five-section board folds them into other sections; worth checking they still show the evidence.",
]

def esc(s): return html.escape(s, quote=True)

def media_html(items):
    if not items: return ""
    figs = []
    for kind, path, cap, alt in items:
        if kind == "photo":
            figs.append(f'<figure class="m"><button class="zoom" type="button" data-src="{path}" data-cap="{esc(cap)}" aria-label="Enlarge: {esc(cap)}"><img src="{path}" alt="{esc(alt)}" loading="lazy"></button><figcaption>{cap}</figcaption></figure>')
        else:
            poster = path[:-4] + ".jpg"
            figs.append(f'<figure class="m vid"><video controls preload="none" playsinline poster="{poster}" aria-label="{esc(cap)}"><source src="{path}" type="video/mp4"></video><figcaption>{cap}</figcaption></figure>')
    return '<div class="shots">' + "".join(figs) + "</div>"

def entry_html(e):
    tags = " ".join(e["tags"])
    chips = "".join(f'<span class="chip c-{t}">{TAGS[t]}</span>' for t in e["tags"])
    n_photo = sum(1 for m in e["media"] if m[0] == "photo")
    n_vid = sum(1 for m in e["media"] if m[0] == "video")
    return f'''
  <article class="entry" data-tags="{tags}" id="d{e["d"]}">
    <div class="when"><span class="date">{e["label"]}</span><span class="wk">{e["week"]}</span></div>
    <div class="node" aria-hidden="true"></div>
    <div class="block card-body">
      <div class="chips">{chips}<span class="src">Source: {e["src"]}</span></div>
      <h2>{e["title"]}</h2>
      {e["body"]}
      {media_html(e["media"])}
    </div>
  </article>'''

def build():
    total_photos = sum(1 for e in ENTRIES for m in e["media"] if m[0] == "photo")
    total_vids = sum(1 for e in ENTRIES for m in e["media"] if m[0] == "video")
    entries = "".join(entry_html(e) for e in ENTRIES)
    chips = '<button class="f on" data-f="all" type="button">All</button>' + "".join(
        f'<button class="f" data-f="{k}" type="button">{v}</button>' for k, v in TAGS.items())
    ahead = "".join(f'<li><span class="a-d">{d}</span><span class="a-t"><strong>{t}</strong> &mdash; {x}</span></li>' for d, t, x in AHEAD)
    openl = "".join(f"<li>{x}</li>" for x in OPEN)
    return PAGE.format(entries=entries, chips=chips, ahead=ahead, openl=openl,
                       n=len(ENTRIES), photos=total_photos, vids=total_vids)

PAGE = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Innovation Project Journal — BOT Builders</title>
<meta name="description" content="Dated timeline of the BOT Builders Innovation Project: farm visits, expert interviews, raising lacewings, the board and the presentation, with photos and videos.">
<link rel="icon" type="image/png" href="assets/favicon.png">
<link rel="apple-touch-icon" href="assets/logo-180.png">
<style>
:root {{
  --ink:#14231F; --panel:#1B2E28; --stroke:#0A120F; --lime:#B8DC7E; --leaf:#3E8A33;
  --cream:#EFD9B4; --node:#FFD233; --on-lime:#101A16; --text:#E4EEDC; --muted:#92A98A;
  --label:#B8DC7E; --flag-bg:rgba(184,220,126,.17); --rule-c:rgba(228,238,220,.16);
  --quote-bg:rgba(184,220,126,.09); --warn:#FFD233; --stroke-w:3px;
}}
@media (prefers-color-scheme: light) {{
  :root:not([data-theme="dark"]) {{
    --ink:#EFE7D4; --panel:#FFFFFF; --leaf:#2F6B26; --text:#101A16; --muted:#5A6B54;
    --label:#2F6B26; --flag-bg:rgba(143,190,85,.34); --rule-c:rgba(16,26,22,.14);
    --quote-bg:rgba(143,190,85,.16); --warn:#8A5A00;
  }}
}}
:root[data-theme="light"] {{
  --ink:#EFE7D4; --panel:#FFFFFF; --leaf:#2F6B26; --text:#101A16; --muted:#5A6B54;
  --label:#2F6B26; --flag-bg:rgba(143,190,85,.34); --rule-c:rgba(16,26,22,.14);
  --quote-bg:rgba(143,190,85,.16); --warn:#8A5A00;
}}
*,*::before,*::after {{ box-sizing:border-box; margin:0; padding:0; }}
html {{ font-size:16px; -webkit-text-size-adjust:100%; scroll-behavior:smooth; }}
body {{ font-family:system-ui,-apple-system,'Segoe UI',sans-serif; background:var(--ink); color:var(--text); line-height:1.6; overflow-x:hidden; }}
a {{ color:var(--label); text-decoration:underline; text-underline-offset:2px; }}
a:focus-visible,button:focus-visible {{ outline:3px solid var(--node); outline-offset:3px; border-radius:4px; }}
.wrap {{ max-width:980px; margin:0 auto; padding:0 1.25rem; }}
.display {{ font-family:'Arial Rounded MT Bold','Helvetica Rounded','Trebuchet MS',system-ui,sans-serif; font-weight:900; letter-spacing:-.015em; text-transform:uppercase; line-height:.95; }}
.block {{ border:var(--stroke-w) solid var(--stroke); border-radius:18px; background:var(--panel); }}

header {{ padding:1.25rem 0 1rem; }}
.titlebar {{ display:flex; align-items:center; gap:.9rem; background:var(--lime); padding:.7rem 1.1rem; margin-bottom:1rem; overflow:hidden; }}
.tb-mark {{ flex:none; width:44px; height:44px; }}
.tb-1 {{ display:block; font-size:clamp(1rem,3vw,1.5rem); color:var(--on-lime); font-style:italic; }}
.tb-2 {{ display:block; font-size:.72rem; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:#3D4C37; }}
.back {{ display:inline-block; font-size:.85rem; margin-bottom:.9rem; }}
.hero h1 {{ font-size:clamp(1.9rem,6vw,3.1rem); color:var(--text); margin-bottom:.7rem; }}
.hero p {{ color:var(--muted); max-width:62ch; }}
.stats {{ display:flex; flex-wrap:wrap; gap:.6rem; margin:1.1rem 0 0; list-style:none; }}
.stats li {{ border:2px solid var(--rule-c); border-radius:999px; padding:.3rem .85rem; font-size:.82rem; color:var(--muted); }}
.stats strong {{ color:var(--text); font-variant-numeric:tabular-nums; }}

.bar {{ position:sticky; top:0; z-index:5; background:var(--ink); border-bottom:2px solid var(--rule-c); padding:.6rem 0; }}
.bar .wrap {{ display:flex; flex-wrap:wrap; gap:.5rem; align-items:center; }}
.f,.flip {{ font:inherit; font-size:.8rem; font-weight:700; cursor:pointer; color:var(--text); background:transparent; border:2px solid var(--rule-c); border-radius:999px; padding:.3rem .8rem; }}
.f:hover,.flip:hover {{ border-color:var(--lime); }}
.f.on {{ background:var(--lime); color:var(--on-lime); border-color:var(--stroke); }}
.flip {{ margin-left:auto; }}
.f,.flip {{ flex:none; white-space:nowrap; }}
.entry {{ scroll-margin-top:4.5rem; }}

main {{ padding:1.5rem 0 1rem; }}
.tl {{ position:relative; display:flex; flex-direction:column; gap:1.5rem; }}
.tl::before {{ content:''; position:absolute; left:calc(150px + 1rem + 7px); top:0; bottom:0; width:3px; background:var(--rule-c); }}
.entry {{ display:grid; grid-template-columns:150px 16px minmax(0,1fr); gap:0 1rem; align-items:start; }}
.entry[hidden] {{ display:none; }}
.when {{ text-align:right; padding-top:1.05rem; display:flex; flex-direction:column; gap:.1rem; }}
.date {{ font-weight:800; font-size:.95rem; line-height:1.25; }}
.wk {{ font-size:.75rem; color:var(--muted); letter-spacing:.05em; text-transform:uppercase; }}
.node {{ width:16px; height:16px; border-radius:50%; background:var(--node); border:3px solid var(--stroke); margin-top:1.2rem; position:relative; z-index:1; }}
.card-body {{ padding:1rem 1.15rem 1.15rem; min-width:0; }}
.chips {{ display:flex; flex-wrap:wrap; gap:.35rem; align-items:center; margin-bottom:.5rem; }}
.chip {{ font-size:.68rem; font-weight:800; letter-spacing:.06em; text-transform:uppercase; padding:.15rem .55rem; border-radius:999px; color:var(--on-lime); background:var(--lime); }}
.c-rearing {{ background:#E6C56A; }} .c-board {{ background:#9CCBE8; }} .c-mentor {{ background:#D7B0E8; }}
.src {{ margin-left:auto; font-size:.7rem; color:var(--muted); }}
.card-body h2 {{ font-size:1.18rem; line-height:1.25; margin-bottom:.55rem; text-wrap:balance; }}
.card-body p,.card-body ul {{ margin-bottom:.7rem; max-width:68ch; }}
.card-body ul {{ padding-left:1.2rem; }} .card-body li {{ margin-bottom:.3rem; }}
.card-body p:last-child {{ margin-bottom:0; }}
.flag {{ background:var(--flag-bg); border-left:4px solid var(--warn); padding:.5rem .75rem; border-radius:0 8px 8px 0; font-size:.92rem; }}
blockquote {{ background:var(--quote-bg); border-left:4px solid var(--lime); padding:.55rem .85rem .25rem; margin:0 0 .8rem; border-radius:0 8px 8px 0; font-size:.93rem; max-width:68ch; }}
blockquote p {{ margin-bottom:.5rem; }}

.shots {{ display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:.7rem; margin-top:.9rem; }}
figure.m {{ margin:0; min-width:0; display:flex; flex-direction:column; gap:.3rem; }}
figure.m .zoom {{ all:unset; display:block; cursor:zoom-in; border-radius:10px; overflow:hidden; border:2px solid var(--stroke); background:var(--ink); }}
figure.m .zoom:focus-visible {{ outline:3px solid var(--node); outline-offset:2px; }}
figure.m img,figure.m video {{ display:block; width:100%; height:170px; object-fit:cover; background:#000; border-radius:8px; }}
figure.m.vid video {{ border:2px solid var(--stroke); object-fit:contain; }}
figure.m .zoom img {{ border-radius:0; transition:transform .25s; }}
figure.m .zoom:hover img {{ transform:scale(1.04); }}
figcaption {{ font-size:.76rem; color:var(--muted); line-height:1.4; }}

section.side {{ margin-top:2rem; display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr)); gap:1.2rem; }}
.side .block {{ padding:1rem 1.15rem; }}
.side h2 {{ font-size:1.05rem; margin-bottom:.6rem; }}
.side ul {{ list-style:none; display:flex; flex-direction:column; gap:.5rem; }}
.side .open li {{ padding-left:1.1rem; position:relative; font-size:.9rem; }}
.side .open li::before {{ content:'\25B8'; position:absolute; left:0; color:var(--warn); }}
.ahead li {{ display:grid; grid-template-columns:7.5rem minmax(0,1fr); gap:.6rem; font-size:.9rem; }}
.a-d {{ font-weight:800; color:var(--label); font-size:.82rem; }}
footer {{ padding:2rem 0 3rem; font-size:.78rem; color:var(--muted); }}
footer p {{ max-width:70ch; margin-bottom:.5rem; }}

dialog.lb {{ border:var(--stroke-w) solid var(--stroke); border-radius:14px; padding:0; background:var(--panel); color:var(--text); max-width:min(94vw,1000px); max-height:92vh; overflow:auto; }}
dialog.lb::backdrop {{ background:rgba(0,0,0,.72); }}
dialog.lb img {{ display:block; max-width:100%; max-height:78vh; margin:0 auto; }}
dialog.lb .lc {{ display:flex; gap:1rem; justify-content:space-between; align-items:flex-start; padding:.7rem 1rem; font-size:.85rem; }}
dialog.lb button {{ font:inherit; font-weight:700; cursor:pointer; background:var(--lime); color:var(--on-lime); border:2px solid var(--stroke); border-radius:999px; padding:.25rem .8rem; flex:none; }}

@media (max-width:720px) {{
  .bar .wrap {{ flex-wrap:nowrap; overflow-x:auto; scrollbar-width:thin; }}
  .tl::before {{ left:7px; }}
  .entry {{ grid-template-columns:16px minmax(0,1fr); gap:0 .8rem; }}
  .when {{ grid-column:2; grid-row:1; text-align:left; flex-direction:row; flex-wrap:wrap; align-items:baseline; gap:.5rem; padding:0 0 .35rem; }}
  .node {{ grid-column:1; grid-row:1; margin-top:.2rem; }}
  .card-body {{ grid-column:2; grid-row:2; }}
  .ahead li {{ grid-template-columns:1fr; gap:0; }}
}}
@media (prefers-reduced-motion:reduce) {{ html {{ scroll-behavior:auto; }} figure.m .zoom img {{ transition:none; }} }}
</style>
</head>
<body>
<div class="wrap">
<header>
  <div class="block titlebar">
    <svg class="tb-mark" viewBox="0 0 120 120" role="img" aria-label="Leaf with circuit traces">
      <path d="M62 12C34 20 18 44 22 74c2 18 12 28 24 32 20-4 36-22 42-46 5-22 0-38-4-48-6-2-14-2-22 0z" fill="#3E8A33" stroke="#0A120F" stroke-width="6" stroke-linejoin="round"/>
      <path d="M60 16c-6 24-12 48-24 74" fill="none" stroke="#0A120F" stroke-width="6" stroke-linecap="round"/>
      <circle cx="77" cy="30" r="7" fill="#FFD233" stroke="#0A120F" stroke-width="5"/>
      <circle cx="67" cy="70" r="7" fill="#FFD233" stroke="#0A120F" stroke-width="5"/>
    </svg>
    <span><span class="tb-1 display">BOT Builders &middot; Team 300024</span><span class="tb-2">FIRST&reg; LEGO&reg; League &middot; Future Edition &middot; BIOGLOW&trade;</span></span>
  </div>
  <a class="back" href="index.html">&larr; Team home</a>
  <div class="hero">
    <h1 class="display">Innovation Project Journal</h1>
    <p>The lacewing project, date by date &mdash; farm visits, expert interviews, raising insects, the board and the presentation. Robot work is left out; it lives in the <a href="wiki/season-journal.html">season journal</a>.</p>
    <ul class="stats">
      <li><strong>{n}</strong> entries</li>
      <li><strong>{photos}</strong> photos</li>
      <li><strong>{vids}</strong> videos</li>
      <li>9 Aug &rarr; 2 Nov 2026</li>
    </ul>
  </div>
</header>
</div>

<div class="bar" role="region" aria-label="Filter timeline">
  <div class="wrap">
    {chips}
    <button class="flip" id="flip" type="button" aria-pressed="false">Newest first</button>
  </div>
</div>

<main class="wrap">
  <div class="tl" id="tl">{entries}
  </div>

  <section class="side" aria-label="Ahead and open items">
    <div class="block ahead"><h2 class="display">Coming up</h2><ul>{ahead}</ul></div>
    <div class="block open"><h2 class="display">Still open</h2><ul>{openl}</ul></div>
  </section>
</main>

<footer class="wrap">
  <p>Text is drawn from the <a href="wiki/season-journal.html">season journal</a> and the team&rsquo;s WhatsApp group; each entry names its source. Photos and videos came from the team WhatsApp group and from parents&rsquo; phones; they are resized copies &mdash; the raw chat export is not published.</p>
  <p>Related: <a href="wiki/lacewing-project.html">Lacewing Project</a> &middot; <a href="wiki/lacewing-play.html">The play</a> &middot; <a href="wiki/outreach-event.html">Outreach event</a> &middot; <a href="wiki/innovation-project.html">Innovation project rubric</a></p>
</footer>

<dialog class="lb" id="lb"><img alt="" id="lbi"><div class="lc"><span id="lbc"></span><button type="button" id="lbx">Close</button></div></dialog>

<script>
(function () {{
  var tl = document.getElementById('tl');
  var entries = Array.prototype.slice.call(tl.querySelectorAll('.entry'));
  var chips = document.querySelectorAll('.f');
  chips.forEach(function (c) {{
    c.addEventListener('click', function () {{
      chips.forEach(function (x) {{ x.classList.toggle('on', x === c); }});
      var f = c.getAttribute('data-f');
      entries.forEach(function (e) {{
        e.hidden = !(f === 'all' || (' ' + e.getAttribute('data-tags') + ' ').indexOf(' ' + f + ' ') > -1);
      }});
    }});
  }});
  var flip = document.getElementById('flip'), rev = false;
  flip.addEventListener('click', function () {{
    rev = !rev;
    entries.slice().sort(function (a, b) {{ return rev ? (a.id < b.id ? 1 : -1) : (a.id > b.id ? 1 : -1); }})
      .forEach(function (e) {{ tl.appendChild(e); }});
    flip.textContent = rev ? 'Oldest first' : 'Newest first';
    flip.setAttribute('aria-pressed', String(rev));
  }});
  var lb = document.getElementById('lb'), lbi = document.getElementById('lbi'), lbc = document.getElementById('lbc');
  document.addEventListener('click', function (ev) {{
    var z = ev.target.closest && ev.target.closest('.zoom');
    if (!z || !lb.showModal) return;
    lbi.src = z.getAttribute('data-src'); lbi.alt = z.getAttribute('data-cap'); lbc.textContent = z.getAttribute('data-cap');
    lb.showModal();
  }});
  document.getElementById('lbx').addEventListener('click', function () {{ lb.close(); }});
  lb.addEventListener('click', function (ev) {{ if (ev.target === lb) lb.close(); }});
}})();
</script>
</body>
</html>
'''

if __name__ == "__main__":
    OUT.write_text(build(), encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} — {len(ENTRIES)} entries")
