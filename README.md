This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **Player Database**: 500+ NBA players with real stats from 2018-2024
- **Team Builder**: Drag-and-drop interface to create custom teams
- **Match Simulation**: Stats-based game simulation with quarter-by-quarter results
- **LLM-Generated Highlights**: AI-powered play-by-play commentary for key moments (NEW!)
- **Player Cards**: Rarity-based card system with position-specific colors

## Getting Started

### Prerequisites

1. Install dependencies:
```bash
npm install
# or
bun install
```

2. Install OpenAI SDK for LLM features (optional):
```bash
npm install openai
# or
bun add openai
```

3. Configure environment variables (optional for LLM features):
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### Running the Application

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## LLM-Generated Game Highlights

The application now includes AI-powered game highlights that generate narrative commentary for key moments during simulated matches.

### How It Works

1. **Key Moment Detection**: The system automatically identifies important moments during the game:
   - Clutch shots in the final minutes
   - Scoring runs (8+ points unanswered)
   - Momentum swings (steals leading to scores)
   - Three-pointers and highlight plays
   - Comebacks from large deficits

2. **Commentary Generation**:
   - With OpenAI API configured: Generates contextual, exciting play-by-play narratives
   - Without API: Provides structured highlights with basic descriptions

3. **Display**: Highlights appear in a dedicated card after match simulation, featuring:
   - Game narrative and summary
   - Chronological key moments with importance ratings
   - Player involvement tracking

### Configuration

To enable enhanced LLM commentary:

1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Add it to your `.env` file:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   ```

The app works without an API key, providing basic highlight detection and display.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Data

Data come from [text](https://www.kaggle.com/datasets/eoinamoore/historical-nba-data-and-player-box-scores). The data are available under an [MIT License](https://www.mit.edu/~amini/LICENSE.md).