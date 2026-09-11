import { Link } from "react-router-dom";

const Home = () => {
  return (
    <section className="game-grid-bg game-panel min-h-screen overflow-hidden text-neutral-200">
      <div className="relative z-10 flex flex-col items-center justify-center gap-y-8 py-20">
        <span className="max-w-3l mx-auto text-center text-6xl font-medium">
          87-0
        </span>
        <p className="mb-12 text-xl leading-relaxed dark:text-neutral-400">
          The Counter Strike lineup builder game
        </p>
      </div>
      <div className="p-8 lg:p-12">
        <div className="mx-auto max-w-5xl gap-10 text-left md:flex">
          <p className="mb-12 text-xl leading-relaxed dark:text-neutral-400">
            87-0 is a game, named in honour of the unbeatable NIP record, to
            build the best lineup you can out of a random selection of teams.
            The sidebar to the left is used to navigate the pages of this
            application. You can read the rules of the game at the{" "}
            <Link
              to="/about"
              className="text-blue-600 underline underline-offset-2 hover:no-underline"
            >
              Rules
            </Link>{" "}
            section, or dive straight into playing at{" "}
            <Link
              to="/game"
              className="text-blue-600 underline underline-offset-2 hover:no-underline"
            >
              Build
            </Link>
            .
          </p>
        </div>
        <div className="mx-auto max-w-5xl gap-10 text-left md:flex">
          <p className="mb:12 text-xl leading-relaxed dark:text-neutral-400">
            You can create an account and sign in with either email or steam by following{" "}
            <Link
              to="/login"
              className="text-blue-600 underline underline-offset-2 hover:no-underline"
            >
              Sign in
            </Link>{" "}
            at the bottom left. Account creation is <b>NOT</b> necessary to play
            the game, but does save your scores so you can track your personal
            best across sessions. Functionality may be added later that requires
            an account, such as leaderboards in certain timeframes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Home;
