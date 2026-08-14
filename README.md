# Magic Mapper for webOS

A TV-native interface for changing what the buttons on an LG Magic Remote do. Discover, disable, or
redirect a button without editing JSON over SSH.

![Magic Mapper remote buttons screen](assets/screenshots/remote-buttons.png)

This is an independent Homebrew wrapper around
[Magic Mapper](https://github.com/andrewfraley/magic_mapper), not an official Magic Mapper project.
The upstream mapper stays unmodified and pinned.

## What it can do

- Discover a remote button while suppressing its normal action.
- Disable branded shortcuts such as Netflix, Prime Video, Disney+, Rakuten TV, or Alexa.
- Open any app installed on the TV.
- Make one remote button behave like another.
- Adjust OLED light, energy saving, eye comfort, Dynamic Tone Mapping, and screen power.
- Send IR, HDMI-CEC, TCP, and webhook commands, or toggle PicCap.
- Disable the Magic Remote pointer globally through a guarded, reversible setting.
- Restore individual buttons or remove Magic Mapper cleanly from the TV.

Every action exposed by the pinned upstream runtime is available through remote-friendly screens
with strict input validation and one-level-at-a-time Back navigation.

![Magic Mapper action catalogue](assets/screenshots/action-catalog.png)

## Requirements

- A rooted LG webOS TV.
- Homebrew Channel running as root.
- Python 3 on the TV.

The current hardware target is an LG C3 running webOS 25 (internal webOS 10.3.1). Wider hardware
compatibility has not yet been claimed.

## How it works

The TypeScript interface is built with Vite, SolidJS 2, and Tailwind CSS 4. Vite emits relative
asset URLs so the compiled application runs directly from its webOS package.

The managed runtime in [`runtime/managed_mapper.py`](runtime/managed_mapper.py) owns the input loop
and loads the upstream actions and button definitions. It adds one-shot discovery, authoritative
status, graceful input release, and app lifecycle handling.

The upstream source pin and checksum live in [`vendor/upstream.json`](vendor/upstream.json).
Packaging verifies that [`vendor/magic_mapper.py`](vendor/magic_mapper.py) still matches that
checksum.

## Development

[Nub](https://nubjs.com/) 0.7.5 and Node.js 22 or newer are required.

```sh
nub ci
nub run check
nub run package
```

The IPK is written to `dist/`. `nub run manifest` creates the Homebrew Channel release manifest.

Useful commands:

```sh
nub run dev           # Vite development server
nub run format        # Format supported files with oxfmt
nub run lint          # Lint TypeScript and JavaScript with oxlint
nub run sync-upstream # Re-fetch the pinned upstream source
```

Updating the upstream pin is a deliberate review step: update the commit and checksum, sync it,
inspect the diff, and repeat the full hardware checks.

### Browser flow

Install the optional Python dependency, build the app, and keep the preview server running:

```sh
python3 -m pip install -r requirements-dev.txt
nub run build
nub run preview
```

Run the Playwright flow from another terminal:

```sh
nub run test:e2e
```

The flow also refreshes the two screenshots in `assets/screenshots/`.

## State and removal

Mappings and runtime state live under `/var/lib/webosbrew/magic-mapper`. The startup hook lives at
`/var/lib/webosbrew/init.d/50-magic-mapper`.

Uninstalling from the app stops the process, releases the exclusive input grab, removes the startup
hook and state, and asks webOS to remove the application.

## License

Released under the MIT License. The vendored upstream file retains Andy Fraley's copyright and
license; wrapper code is copyright Afonso Ramos.
