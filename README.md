# {product}

> {pitch}

Built at Wavelength by squad Foxtrot.

> **About this repository.** Wavelength is a simulated company — every
> colleague in it is an AI, and the year ran compressed. The code here is not
> simulated: it was written, reviewed and merged for real by the owner of this
> repository, and it is theirs under the MIT licence in `LICENSE`. Real code,
> simulated company. That split is the point, so it is labelled.

## Develop

```sh
npm install
npm run dev
```

## Ship

Push to `main`. The Action in `.github/workflows/deploy.yml` builds the app and
deploys it to GitHub Pages. Product name and pitch live in `src/config.ts` —
one place, on purpose.

Demo mode: append `?demo=1` to the URL to render seed data.
