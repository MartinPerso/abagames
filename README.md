# ABA Games Webapp (iPad-first)

This project is a web application containing short educational games inspired by Applied Behavior Analysis (ABA) procedures for young autistic children, starting with children around 5 years old.

The app starts from a **home page** that links to multiple games.  
Each game is **independent and stateless**: leaving a game and coming back restarts it from the beginning.

---

## Vision

Create a playful, structured, and predictable learning environment that:

- supports early skill development,
- provides clear and immediate feedback,
- remains simple enough for a child to use on an iPad with adult supervision.

---

## Core Product Principles

- **iPad-first web experience** (Safari/WebKit constraints, touch interaction, large UI targets).
- **One activity at a time** to reduce cognitive load.
- **Short sessions** (1-3 minutes per mini-game round).
- **Low-friction navigation** from Home -> Game -> Home.
- **Stateless games** for reliability and simplicity.
- **Bilingual experience**: all content available in English and French.
- **Minimal on-screen text** so a non-reader child can play as autonomously as possible.
- **Adult-readable feedback** (simple score and success indicators, no clinical diagnosis claims).

---

## Target Users

- Primary: autistic children, initially around **5 years old**.
- Secondary: parents, caregivers, and therapists supervising play.

> Important: This webapp is an educational support tool, not a medical device and not a substitute for individualized therapy by qualified professionals.

---

## App Structure

1. **Home page**
   - Grid/list of available games.
   - Clear icon + title for each game.
   - Language switcher (**English / French**) accessible from Home.
   - Optional difficulty badge (e.g., Level 1).

2. **Game pages (independent)**
   - One objective per screen.
   - Immediate positive feedback for correct responses.
   - Gentle correction flow for incorrect responses.
   - Session ends after a small fixed number of trials.

3. **Return to Home**
   - Exiting a game discards in-session state.
   - Re-entry starts fresh.

---

## ABA Concepts and How They Map to Game Design

This section describes key ABA concepts and practical game equivalents.

### 1) Reinforcement

**ABA concept:** A consequence that increases the likelihood of a behavior recurring.  
**Game application:**

- Immediate reward on correct response (sound, animation, praise text like "Great job!").
- Small visual progress signals (stars, stickers, token icons).
- Keep rewards brief and consistent to avoid overstimulation.

### 2) Antecedent -> Behavior -> Consequence (ABC)

**ABA concept:** Behavior is understood in context of what happens before and after it.  
**Game application:**

- **Antecedent:** clear instruction/prompt ("Tap the red circle").
- **Behavior:** child taps/selects item.
- **Consequence:** immediate feedback (reinforcement or correction).

Each trial should follow a predictable ABC loop.

### 3) Prompting

**ABA concept:** Assistance to help produce the correct response.  
**Game application:**

- Visual prompts (highlight the right option).
- Auditory prompts (repeat instruction slowly).
- Graduated help sequence (minimal prompt first, then stronger prompt if needed).

### 4) Prompt Fading

**ABA concept:** Gradually remove prompts to build independent responding.  
**Game application:**

- Start with high support in early trials.
- Reduce cues after consecutive successes.
- Track prompt level per trial (even if game is stateless between sessions).

### 5) Shaping

**ABA concept:** Reinforce successive approximations toward a target skill.  
**Game application:**

- Begin with easy discrimination (2 large options).
- Increase complexity gradually (more options, smaller differences).
- Reward partial progress where appropriate.

### 6) Discrete Trial Teaching (DTT)

**ABA concept:** Structured, repeated teaching opportunities with clear start/end.  
**Game application:**

- Trial format:
  1. Instruction
  2. Child response
  3. Immediate consequence
  4. Short inter-trial interval
- Use short blocks (e.g., 5-10 trials) per game round.

### 7) Errorless Learning (when possible)

**ABA concept:** Design learning to minimize errors early, then increase independence.  
**Game application:**

- Make correct choice very obvious at first.
- Use strong prompts before errors occur.
- Progressively reduce support as accuracy improves.

### 8) Generalization

**ABA concept:** Skill transfers across contexts and stimuli.  
**Game application:**

- Vary non-essential features (colors, icons, voice, layout) while preserving core skill.
- Present the same concept in different mini-games.

### 9) Maintenance

**ABA concept:** Previously learned skills are retained over time.  
**Game application:**

- Reintroduce mastered items periodically.
- Mix easy and new trials in a session.

### 10) Data-informed Adaptation

**ABA concept:** Decisions are guided by observed performance data.  
**Game application:**

- Record basic per-session metrics (accuracy, prompt level, response latency bands).
- Use data to tune difficulty recommendations (even if each individual game run is stateless).

---

## Example Game Types (Initial Set)

- **Matching game:** Match identical pictures/shapes.
- **Receptive instruction game:** "Tap [item]" from a small set.
- **Sorting game:** Drag item to category bucket.
- **Simple sequencing game:** Put 2-3 steps in order.
- **Imitation/touch pattern game:** Repeat a simple tap sequence.

All games should remain short, simple, and restartable.

---

## iPad UX Requirements

- Touch targets at least ~44x44 px (prefer larger for children).
- Strong visual contrast and uncluttered layout.
- Minimal text; support audio instructions.
- Full localization support for **English and French** UI, instructions, and feedback text.
- Orientation support strategy (portrait-only or responsive portrait-first).
- Avoid hover-only interactions.
- Fast load and smooth animations on iPad Safari.
- Accessible audio control (mute/unmute for caregiver).

---

## Non-Goals (for v1)

- No account system required.
- No long-term game-state persistence inside game sessions.
- No diagnostic outputs.
- No replacement of therapist-led intervention planning.

---

## Safety, Ethics, and Clinical Boundaries

- Keep language respectful and neurodiversity-aware.
- Do not present the app as a cure or diagnostic tool.
- Encourage caregiver/therapist supervision and customization.
- Validate game ideas with qualified ABA professionals before broad deployment.

---

## Suggested Success Metrics (Product)

- Session completion rate per game.
- Correct-response rate by game/difficulty.
- Prompt dependence trend (within-session).
- Time-to-first-interaction.
- Return rate to Home and selection of next game.

---

## Proposed Next Steps

1. Define v1 game list (2-3 games).
2. Create low-fidelity wireframes for Home + one game loop.
3. Specify reusable trial engine (instruction -> response -> consequence).
4. Implement iPad-first UI kit (buttons, cards, feedback components).
5. Pilot with caregivers/therapists and iterate.

---

## Current v1 Implementation (in repo)

- React + TypeScript webapp scaffolded with Vite.
- Home page with FR/EN language switch and entry to the first game.
- First game implemented: count items from 1 to 5 (fire truck, police car, ambulance, boat, plane).
- Immediate reinforcement on correct answers: short animation + characteristic reward sounds.
- Stateless behavior: leaving a game and returning starts a fresh session.
- French is the default language when no language has been selected yet.

## Assets used

- Illustrations: OpenMoji SVGs (CC BY-SA 4.0), stored in `public/assets/illustrations/`.
- Reward sounds: MP3 files from https://www.sound-fishing.net/, stored in `public/assets/sfx/`.
- Attribution details: `public/assets/ATTRIBUTION.md`.

---

## Local Development

```bash
npm install
npm run dev
```

Then open the local URL in a browser (for iPad testing, use Safari/WebKit).

