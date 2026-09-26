# 星月贪吃蛇派对 · Moonlight Snake Party

Play: https://kunruiw1991.github.io/moonlight-snake-party/

A picture-first touch game for young children. No reading or account needed. Choose one of 14 collected characters, a moon palace / osmanthus garden / starry sky, then press ▶.

- Swipe, tap the board in a direction, or use the large arrow buttons. Keyboard arrows / WASD also work.
- Collect mooncakes, berries and golden stars to grow a colorful snake. Every four snacks brings a character friend; finish the collection bar to earn a crown and advance.
- 🧲 attracts nearby food, 🫧 protects from collisions, 🌈 doubles points. The big bubble button gives a temporary shield and slows movement, with a cooldown.
- 🐣 is the default gentle mode: slow movement and wrapping edges. 🔥 uses solid walls and a faster pace. Three hearts; a bump keeps earned points and gives a recovery shield. Every six snacks restores a heart.
- ⏸ pauses both game and music; returning from another app stays paused. 🔊 mutes; ⏭ changes the song.
- Only the player's selected character receives the crown after reaching the actual goal. Retry screens do not claim a win.

## Reused collections

See `assets/sources.json` for a per-file provenance inventory.

- 12 Critters portraits reused from `kunruiw1991/critters-calabash-brothers` (through the existing reunion project): Luna Bat, Sunny Fox, Poppy Dash, CatNap, DogDay, Bobby, Hoppy, CraftyCorn, Bubba, KickinChicken, PickyPiggy, Baba Chops.
- Mikey and JJ from `kunruiw1991/mikey-jj-assets` (through the existing reunion project).
- Three SVG scenes from `kunruiw1991/mid-autumn-legend-assets`; decorative text removed for pre-readers.
- Golden and Soda Pop audio tracks played in-page from existing MP4 resources in `kunruiw1991/lumipop-kids-tv`. No external application opens. The first play tap enables audio; network access is needed for streaming.

Existing character and music rights remain with their respective owners. Reusing these supplied collections does not create a new license for the source material.

## Development

No packages or build required. Run `python3 -m http.server 8000` in this folder and open localhost:8000. Run `node --test tests/engine.test.mjs` for movement, input buffering, collision, spawning, scoring and real win/loss regressions.

Pure game rules are in `engine.mjs`. `app.mjs` owns rendering, touch controls, audio and result presentation. GitHub Pages publishes main at the repository root.
