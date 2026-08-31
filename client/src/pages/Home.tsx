import { Link } from "react-router-dom";

const Home = () => {
  return (
    <section className="min-h-screen overflow-hidden bg-linear-to-br dark:from-neutral-800 from-slate-50 to-blue-50 dark:to-neutral-950">
      <div className="py-20 relative flex flex-col justify-center items-center gap-y-8 z-10">
        <div className="absolute bottom-0 left-0 right-0 top-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[48px_50px] mask-[radial-gradient(ellipse_25%_30%_at_50%_50%,#000_65%,transparent_110%)]"></div>
        <span className="text-6xl max-w-3l mx-auto text-center font-medium">
          CS-ACE
        </span>
        <p className="text-xl dark:text-neutral-400 text-neutral-600 mb-12 leading-relaxed">
          The Counter Strike lineup builder game
        </p>
      </div>
      <div className="p-8 lg:p-12">
        <div className="max-w-5xl mx-auto md:flex text-left gap-10">
          <p className="text-xl dark:text-neutral-400 text-neutral-600 mb-12 leading-relaxed">
            CS-ACE is a game to build the best lineup you can out of a random
            selection of teams. The sidebar to the left is used to navigate the
            pages of this application. You can read the rules of the game at the{" "}
            <Link
              to="/about"
              className="text-primary underline underline-offset-2 hover:no-underline"
            >
              Rules
            </Link>{" "}
            section, or dive straight into playing at{" "}
            <Link
              to="/game"
              className="text-primary underline underline-offset-2 hover:no-underline"
            >
              Build
            </Link>
            .
          </p>
        </div>
        <div className="max-w-5xl mx-auto md:flex text-left gap-10">
          <p className="text-xl dark:text-neutral-400 text-neutral-600 mb:12 leading-relaxed">
            You can create an account and sign in with email by following{" "}
            <Link
              to="/login"
              className="text-primary underline underline-offset-2 hover:no-underline"
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
