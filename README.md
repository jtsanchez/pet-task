# 🐾 Pet Tasks

**A tiny to-do app with a virtual pet that grows when you get things done.**

Each evening you plan **3 tasks for tomorrow**. Finish all 3 the next day and your pet levels up on the spot; miss them and it gets sad. No streaks to lose, no guilt spirals: just one small win a day.

**[▶ Try the live demo](https://jtsanchez.github.io/pet-tasks/)** · built with React Native + Expo · TypeScript

<!--
Screenshots: add images to docs/screenshots/ and uncomment this block.

<p align="center">
  <img src="docs/screenshots/picker.png" width="200" alt="Choose your pet" />
  <img src="docs/screenshots/main-light.png" width="200" alt="Main screen (light)" />
  <img src="docs/screenshots/main-dark.png" width="200" alt="Main screen (dark)" />
  <img src="docs/screenshots/level-up.gif" width="200" alt="Level up!" />
</p>
-->

## Features

- **3 tasks a day.** Plan tomorrow tonight, check them off tomorrow. A small, achievable daily target.
- **A pet that reacts.** Happy when you finish, sad when you don't, neutral on adoption day. Its level is the total number of days you completed.
- **Instant level-up.** Checking the third task triggers an animated *LEVEL UP!* card, a badge pulse, a chime and haptic feedback.
- **Choose and customise.** Adopt a cat, dog or chick; name it and pick a colour. Cats can be **calico**, with procedurally generated patterns that are unique per pet and can be reshuffled.
- **Light, dark or auto theme**, available on every screen.
- **Fair by design.** Missed days never take levels away, and there's no way to skip ahead in release builds.
- **Offline and private.** Everything is stored on the device; no account or backend.

> The web demo includes a **⏭ Skip to next day** button so you can try a whole week in a minute. It only exists in development and the demo build.

## How it works

| Rule | Behaviour |
|---|---|
| A day succeeds | All 3 planned tasks are checked |
| On success | +1 level, shown immediately; locked in at midnight (never double-counted) |
| On a miss (incl. nothing planned) | Pet is sad; level unchanged |
| Adoption day | Not judged, so your pet doesn't start out sad |

When the app opens or returns to the foreground, it reviews every day since the last review (`evaluateDays` in [`src/logic.ts`](src/logic.ts)), so results are correct even if the app wasn't opened for a while. Days are keyed by **local** date (`YYYY-MM-DD`), so "midnight" matches the user's timezone.

### Procedural calico coats

[`src/calico.ts`](src/calico.ts) uses a small seeded PRNG (mulberry32) to place 3–5 patches around the head. Each patch is a cluster of overlapping, rotated ovals, and each ear gets a random colour. The seed is stored with the pet, so its pattern stays the same between launches. Dark patches are rejected if they'd cover the eyes, so the face stays readable; a unit test checks this across 500 seeds.

### Pets without image assets

The pets are drawn entirely from React Native `View`s (circles, CSS-border triangles, rotated ovals) and scale cleanly to any size. Moods change the eyes, brows, mouth, tears and blush, and gentle idle "breathing" and celebration bounces use the `Animated` API.

## Tech stack

- **Expo SDK 58** / React Native 0.88 / React 19, **TypeScript** (strict)
- `@react-native-async-storage/async-storage` for persistence
- `expo-audio` (level-up chime) and `expo-haptics`
- **Jest** (`jest-expo`) unit tests, **ESLint** (`eslint-config-expo`)
- **GitHub Actions**: typecheck, lint, test, then deploy the web build to GitHub Pages

## Project structure

```
App.tsx                      Screens, state, day review, theme + level-up wiring
src/
  logic.ts                   Pure rules: dates, day success, review, level, mood
  calico.ts                  Seeded procedural coat patterns
  palette.ts                 Pet colours (calico is cat-only)
  theme.ts                   Light/dark tokens + context
  storage.ts                 Load/save with forward-compatible merging
  components/
    Pet.tsx                  The drawn, animated pet
    PetPicker.tsx            Choose a species
    PetCustomizer.tsx        Name, colour, pattern shuffle
    TodayTasks.tsx           Today's checklist
    PlanTomorrow.tsx         Tomorrow's 3 tasks
    LevelUpBanner.tsx        Level-up card + level badge
    ThemeToggle.tsx          Auto / Light / Dark
  __tests__/                 Unit tests for rules and patterns
assets/sounds/levelup.wav    Chime generated in code (no third-party audio)
```

## Run it locally

```bash
git clone https://github.com/jtsanchez/pet-tasks.git
cd pet-tasks
npm install
npx expo start          # scan the QR code with Expo Go, or press "w" for web
```

```bash
npm test                # unit tests
npx tsc --noEmit        # typecheck
npx expo lint           # lint
```

## Roadmap

- Home-screen widget showing the pet and today's progress
- Evening reminder to plan tomorrow
- More pets, coats and accessories
- History and stats

## License

© 2026 Jann Pauline Sanchez. All rights reserved. The source is shared for portfolio purposes; see [LICENSE](LICENSE).
