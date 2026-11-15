You are responsible for evaluating and improving Profe, the existing AI language teacher in this app, which helps English speakers learn Spanish.

Conduct a thorough evaluation of the current implementation, research suitable improvements, produce a prioritized table of tasks, and implement and test the improvements where you have access. Preserve useful existing functionality and build on the current app.

The goal is a reliable, conversational Spanish teacher that can also operate the full app through spoken instructions.

1. Understand the app before making changes

Inspect the codebase, architecture, available features, and current Profe implementation. Map:

- All screens, lessons, vocabulary lists, videos, learning activities, and playback controls.
- Microphone capture, permissions, audio processing, speech recognition, language detection, and transcription.
- AI prompts, conversation history, learner context, instruction handling, and available tools.
- Speech synthesis, English and Spanish voices, playback, interruptions, and audio focus.
- Voice commands, wake-phrase detection, navigation, and action execution.
- Existing logs, analytics, tests, and known limitations.

Create a feature-to-voice-action coverage table showing what users should be able to do verbally, what currently works, what partially works, and what is missing.

Do not assume that a feature works because a button, prompt instruction, or function exists. Verify actual behavior.

2. Investigate the reported problems

The current problems are:

1. Profe does not always hear or understand me properly.
2. It frequently fails to follow instructions.
3. It sometimes makes a comment and stops instead of moving the conversation forward.
4. It does not explain grammar mistakes clearly enough.
5. Hands-free navigation and action execution are unreliable.
6. It struggles to combine conversation, teaching, navigation, and media playback dynamically.

Find the underlying causes. Distinguish observations, hypotheses, and verified findings. Do not attribute every failure to the AI model.

Diagnose listening and microphone problems

Trace failures through the entire pipeline:

Microphone → audio capture → speech detection → transcription → intent interpretation → action execution → spoken response.

Investigate:

- Permission failures, incorrect input devices, muted microphones, and Bluetooth routing.
- Quiet audio, clipping, noise, echo, and Profe hearing its own speech.
- Audio capture stopping after playback, navigation, interruptions, or device changes.
- Speech detection cutting off the beginning or end of sentences.
- Pauses during hesitant beginner speech being mistaken for completed turns.
- Recognition of English, Spanish, code-switching, and accented speech.
- Speech recognition settings, timeouts, streaming behavior, and network failures.
- Conflicts between manual microphone activation, automatic listening, and speaking.
- Stale transcripts, duplicate events, and audio from earlier turns.

Use controlled comparisons, including live speech versus known audio inputs and typed versus spoken versions of the same instruction. Determine whether failures originate in capture, transcription, interpretation, or execution.

Add a simple microphone diagnostic experience if needed. Explain problems accurately and provide actionable recovery instructions. Never claim that a microphone is defective without sufficient evidence.

3. Improve instruction following and app control

Profe must distinguish among:

- An instruction to operate the app.
- A question.
- A Spanish practice response.
- A request for correction or explanation.
- A change of learning goal.
- A request to interrupt, stop, repeat, or resume.

Build or improve a structured action interface connecting Profe to real app functions. Prompt changes alone are insufficient when app controls are missing.

Each supported action should have defined inputs, validation, execution results, and error handling. Use the app’s actual state to determine what happened.

Support natural instructions such as:

- “Open my next lesson and start it.”
- “Play the video in this lesson.”
- “Pause that.”
- “Go back ten seconds.”
- “Play my food vocabulary list.”
- “Read each Spanish word, give me the English meaning, and leave time for me to repeat.”
- “Repeat the last word more slowly.”
- “Explain that in English.”
- “Quiz me on the words I got wrong.”
- “Go back to where we were.”
- “Stop the lesson and practise ordering food with me.”

Resolve contextual references such as “that,” “the next one,” and “the lesson we just opened.” Ask a short clarification when ambiguity would materially change the action.

For multi-step requests, execute steps in order, check dependencies, and report any partial failure accurately. Avoid duplicate actions after retries. Cancel pending actions when the user changes or withdraws the instruction.

Never say an action succeeded unless the app confirms it.

4. Make hands-free use reliable

Evaluate the existing “Ok Profe” wake phrase and the full hands-free interaction loop.

Once the user has enabled hands-free mode, they should be able to invoke Profe, give an instruction, hear the response, and continue without repeatedly touching the screen wherever the platform supports it.

Implement clear interaction states, including:

- Ready for activation.
- Listening.
- Processing.
- Speaking.
- Playing lesson or media audio.
- Interrupted.
- Recovering from an error.

Define transitions explicitly so Profe does not become stuck, talk over the user, or silently stop listening.

Support:

- Interrupting Profe while it speaks.
- Cancelling outdated speech and pending responses.
- Pausing media to answer a question.
- Returning to the correct lesson or playback position afterward.
- Recovering from recognition and connection failures.
- Clear visual and optional audio indicators of listening status.
- User controls to pause listening and end hands-free mode.

Research actual browser and operating-system restrictions. Explain and design around restrictions on background listening, screen locking, wake phrases, microphone access, and autoplay. Do not promise capabilities the platform cannot provide.

5. Improve conversational teaching

Profe should behave like an attentive teacher who guides the exchange and helps the learner keep speaking.

It should:

- Stay focused on the learner’s goal, level, and current activity.
- Remember relevant context, recent mistakes, and unanswered questions.
- Respond meaningfully to what the learner actually says.
- Use natural follow-up questions, short exercises, or relevant prompts to continue practice.
- Offer scaffolding when the learner hesitates or does not know how to respond.
- Adjust difficulty and speaking speed.
- Handle questions and topic changes without losing the original activity.
- Periodically offer a choice to continue, review, change activities, or finish.
- Respect requests for silence, independent work, or ending the session.

Avoid dead-end responses such as “Good job!” with no useful next step during active practice. Also avoid filling every pause or asking unnecessary questions after simple app commands.

Distinguish a learner who is thinking from one who has finished speaking. Provide configurable wait time and adapt turn-taking to beginner speech.

Keep spoken responses manageable. Break longer explanations into short parts with opportunities for the learner to respond.

6. Explain grammar mistakes effectively

Use Spanish for practice and English for explanations unless the learner requests otherwise.

When a correction is appropriate:

1. Identify what the learner said, provided the transcription is reliable.
2. Give the corrected Spanish.
3. Explain the specific mistake in plain English.
4. Give a brief contrasting example where useful.
5. Invite a retry or a short related practice question.
6. Check whether the learner applies the correction.

For example:

Learner: “Ayer yo voy al supermercado.”

Profe: “You can say, ‘Ayer fui al supermercado.’ Because you’re describing a completed action yesterday, use ‘fui,’ the past form of ‘ir,’ instead of ‘voy,’ which means ‘I go’ or ‘I’m going.’ Now try telling me where you went last weekend.”

Distinguish grammatical errors from valid regional usage, acceptable alternatives, pronunciation issues, and transcription mistakes.

Do not confidently correct uncertain transcripts. Confirm what was said when necessary. Do not infer pronunciation quality from text alone.

Prioritize corrections according to the activity: provide immediate feedback during focused grammar practice and selective feedback during fluency practice. Track repeated errors and use them for later review.

7. Coordinate English and Spanish voices

Evaluate the existing English and Spanish voices and ensure each speaks the appropriate language.

Handle mixed-language explanations, quoted Spanish examples, interruptions, and playback queues without voice confusion, overlapping audio, or stale responses.

When the user interrupts, stop the current response and prevent cancelled audio from playing later. Preserve a natural pace when switching languages.

8. Research suitable improvements

Research current official documentation, relevant speech and conversational-AI research, and established language-teaching evidence.

Investigate appropriate approaches for:

- Streaming speech recognition and speech-to-speech interaction.
- Multilingual and accented speech recognition.
- Speech detection, turn completion, interruptions, and echo handling.
- Structured tool calling and reliable action execution.
- Conversation state and learner memory.
- Corrective feedback and adaptive practice.
- Platform-specific hands-free capabilities.

Compare recommendations with the current stack. Explain expected benefits, integration effort, latency, cost, privacy implications, and limitations.

Cite sources and separate evidence-backed findings from engineering judgments. Do not recommend replacing services or frameworks without establishing why existing options are insufficient.

9. Produce a prioritized improvement table

Create a table with these columns:

Priority| Area| Observed problem| Evidence / reproduction steps| Root cause and confidence| Improvement task| Dependencies| Effort| Success metric / acceptance test| Status

Use priorities consistently:

- P0: Core failures preventing listening, stopping, or correct action execution.
- P1: Major instruction-following, conversation, and teaching problems.
- P2: Quality, personalization, performance, and convenience improvements.

Write concrete, independently verifiable tasks. Avoid vague entries such as “improve AI.”

Include gaps discovered during evaluation, even if they were not explicitly reported. Update the table as work progresses.

10. Test complete user journeys

Establish baseline performance before changing the app. Repeat the same scenarios afterward.

Test:

- Quiet and moderately noisy environments.
- Different microphones, supported devices, and Bluetooth audio.
- English, Spanish, accented speech, and mixed-language instructions.
- Short commands and longer multi-step requests.
- Hesitation, pauses, self-correction, and incomplete sentences.
- Interruptions during speech and media playback.
- Manual microphone activation while Profe is about to speak.
- Ambiguous, unsupported, and cancelled requests.
- Network failures, permission changes, and session recovery.
- Extended conversations and repeated transitions between activities.

Include this complete hands-free journey:

Activate Profe → open a lesson → play a video → pause it → ask a grammar question → practise the answer → receive a correction → open a vocabulary list → play and repeat words → resume the lesson → end the session.

Verify the resulting app state at each step.

Measure transcription quality, intent accuracy, action completion, false activations, missed interruptions, response latency, recovery success, correction accuracy, and conversational continuity. Report test conditions and sample sizes. Define justified acceptance thresholds before final validation.

Use automated checks where suitable and real microphone, speaker, and device testing where required. Simulated tests alone do not establish hands-free reliability.

Use privacy-conscious diagnostics. Do not retain raw learner audio by default.

11. Implement, retest, and report

If you have development access, implement improvements in manageable stages, run relevant checks, and repeat evaluation until the agreed acceptance criteria are met or a specific blocker remains.

If you lack access, identify the missing access and provide precise implementation tasks. Do not claim to have inspected, changed, or tested anything you could not access.

Deliver:

1. A clear diagnosis with supporting evidence.
2. The feature-to-voice-action coverage table.
3. The prioritized improvement task table.
4. Recommended architecture and prompt changes.
5. Changes implemented and their purpose.
6. Before-and-after test results.
7. Remaining failures, limitations, and next actions.

As new app features are added, extend Profe’s action coverage and regression tests so hands-free capabilities remain aligned with the full app.

Success means that an English-speaking Spanish learner can reliably learn, converse, get understandable corrections, and operate the app by voice—with verified actions, natural turn-taking, and clear recovery when something fails.