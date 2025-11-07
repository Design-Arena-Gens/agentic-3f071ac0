## Tiny Character LLM

Client-side playground for a miniature bigram language model. The app lets you generate continuations, inspect next-token probabilities, and instantly retrain with your own corpus without any server dependencies.

### Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with the model.

### Available Scripts

- `npm run dev` – start the development server
- `npm run build` – create an optimized production build
- `npm run start` – serve the production build locally
- `npm run lint` – run static analysis

### How It Works

The project bundles a hand-crafted corpus and builds a smoothed character-level bigram model in the browser. You can append additional training text, tweak sampling parameters (max tokens, temperature, RNG seed), and observe the updated probability distribution for upcoming tokens in real time.

### Deploying

The app is optimized for Vercel deployment. After running `npm run build`, deploy with:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-3f071ac0
```
