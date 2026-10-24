/* The outreach survey, as the script that builds it.

   Paste the whole file into script.google.com (New project → delete what is
   there → paste → Save → Run) and it creates the Google Form, all eight
   questions, and a linked spreadsheet that collects every response.

   THIS FILE IS THE SOURCE OF TRUTH. There is a copy of this script in a
   Drive doc, and on 24 October the two were out of step: the wiki had
   dropped the written-answer questions and the Drive copy still built them,
   so a rebuild would have put them straight back. Edit this file, then
   paste it over the Drive copy — not the other way round.

   Eight questions, every one tap-to-answer. Nobody types anything on a
   phone at a station. The two that asked for written answers — "Name ONE
   thing a lacewing larva eats" and "What is ONE thing we could explain
   better?" — were removed on 24 October.
*/

function buildSurvey() {
  var form = FormApp.create('The Bug Nobody Knows — 1 minute survey');

  form.setDescription(
    'We are BOT Builders, a FIRST LEGO League team of 4th graders from San Diego. ' +
    'Thank you for listening to us! This survey is anonymous — please do not enter your name.'
  );
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  form.setProgressBar(true);
  form.setConfirmationMessage('Thank you! You just helped a team of 4th graders with their science project.');

  // Q1 — segments the data. Scene 7 of the play reports a KID count.
  form.addMultipleChoiceItem()
    .setTitle('Are you a...')
    .setChoiceValues(['Kid (12 or under)', 'Teen (13-17)', 'Adult'])
    .setRequired(true);

  // Q2 — the "before" number
  form.addMultipleChoiceItem()
    .setTitle('BEFORE today, had you heard of a green lacewing?')
    .setChoiceValues([
      'Yes, I knew what it was',
      'I had heard the name but did not know what it did',
      'No, never'
    ])
    .setRequired(true);

  // Q3 — the problem statement, measured
  form.addMultipleChoiceItem()
    .setTitle('BEFORE today, could you tell a helpful insect from a pest?')
    .setChoiceValues(['Yes, confidently', 'Some of them', 'Not really'])
    .setRequired(true);

  // Q4 — the "after" number, pairs with Q2
  form.addMultipleChoiceItem()
    .setTitle('NOW, could you point out a green lacewing if you saw one?')
    .setChoiceValues(['Yes', 'Maybe', 'No'])
    .setRequired(true);

  // Q5 — Scene 7's exact wording
  form.addMultipleChoiceItem()
    .setTitle('NOW, could you explain to someone else why beneficial insects matter?')
    .setChoiceValues(['Yes', 'Sort of', 'No'])
    .setRequired(true);

  // Q6 — presentation quality
  form.addScaleItem()
    .setTitle('Was the information clear and easy to understand?')
    .setBounds(1, 5)
    .setLabels('Confusing', 'Very clear')
    .setRequired(true);

  // Q7 — Q&A practice, measured
  form.addMultipleChoiceItem()
    .setTitle('Did the team answer your questions well?')
    .setChoiceValues(['Yes', 'Somewhat', 'I did not ask any questions'])
    .setRequired(false);

  // Q8 — real-world impact
  form.addMultipleChoiceItem()
    .setTitle('Will you do anything differently in your garden or yard after this?')
    .setChoiceValues([
      'Yes — I will look before I spray',
      'Maybe',
      'No',
      'I do not have a garden'
    ])
    .setRequired(false);

  // Create the spreadsheet and link it so every response is collected
  var ss = SpreadsheetApp.create('The Bug Nobody Knows — survey responses');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  Logger.log('');
  Logger.log('=== SHARE THIS ONE — make the QR code from it ===');
  Logger.log(form.shortenFormUrl(form.getPublishedUrl()));
  Logger.log('');
  Logger.log('Edit the form here:');
  Logger.log(form.getEditUrl());
  Logger.log('');
  Logger.log('Responses land here:');
  Logger.log(ss.getUrl());
}

/* READING THE RESULTS — filling Scene 7 of the play

     "We tested our learning activity with [NUMBER] kids. Before, [__%] could
      identify a green lacewing. After, [__%] could identify it and explain
      why beneficial insects matter."

     NUMBER  = count of Q1 answers that say "Kid"
     BEFORE% = Q2 "Yes, I knew what it was" divided by total
     AFTER%  = answered Q4 "Yes" AND Q5 "Yes", divided by total

   Only use real numbers. Twelve people is twelve people — a small honest
   number beats a big invented one, and judges can tell the difference.

   Every question here is SELF-REPORTED: people say they learned something
   because they are being polite to a nine-year-old. The question that asked
   them to produce a fact is gone, so the one piece of hard evidence now has
   to be collected at the table instead — keep a tally sheet by the board and
   mark whether each visitor could name something a lacewing eats when asked
   out loud. Same sentence for a judge; say where the number came from.
*/
