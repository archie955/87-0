"use client";
import SpanList from "@/components/ui/span-list";

const Rules = () => {
  return (
    <section className="game-panel game-grid-bg min-h-screen overflow-hidden">
      <div className="game-glow relative z-10 flex flex-col items-center justify-center gap-y-8 py-20">
        <span>HOW TO PLAY</span>
        <span className="mx-auto max-w-3xl text-center text-6xl font-medium">
          87-0
        </span>
        <p className="mb-12 text-xl leading-relaxed">
          Build the best lineup you can
        </p>
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 left-0 z-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] mask-[radial-gradient(ellipse_25%_30%_at_50%_50%,#000_65%,transparent_110%)] bg-size-[48px_50px]"></div>
      </div>

      <div className="p-8 lg:p-12">
        <div className="mx-auto max-w-5xl gap-10 text-left md:flex">
          <h2 className="mb-8 w-52 shrink-0 text-3xl font-medium uppercase lg:w-72 lg:text-4xl">
            BASIC GAME
          </h2>
          <div className="">
            <p className="mb-12 text-xl leading-relaxed">
              Get rolled a random team, pick a player, then repeat until you
              have a full team with genuine roles. Pick the IGL, and submit to
              get your score.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl gap-10 text-left md:flex">
          <h2 className="mb-8 w-52 shrink-0 text-3xl font-medium uppercase lg:w-72 lg:text-4xl">
            TEAMS
          </h2>
          <div className="">
            <p className="mb-12 text-xl leading-relaxed">
              The teams contain the current players and their actual positions,
              as per the data from HLTV writer Harry Richards, who amazingly
              publishes an up-to-date dataset of active teams and player roles,
              map positions, etc, located{" "}
              <a
                className="text-blue-600 underline underline-offset-2 hover:no-underline"
                href={
                  "https://public.tableau.com/app/profile/harry.richards4213/viz/PositionsDatabaseNER0cs/PositionsDatabaseNER0cs"
                }
              >
                here.
              </a>
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl gap-10 text-left md:flex">
          <h2 className="mb-8 w-52 shrink-0 text-3xl font-medium uppercase lg:w-72 lg:text-4xl">
            PLAYERS
          </h2>
          <div className="">
            <p className="mb-12 text-xl leading-relaxed">
              Players scores are a standard scaling formual applied to the logit
              as calculated based on a Logistic Generalised Additive Model
              trained on a dataset of player-game HLTV scores and game outcome.
              The specific period for the player scores is currently all of 2026
              up until the end of EWC. We only consider "big events", as defined
              per HLTV. These events include most international LANs where you
              would expect to see multiple tier 1 teams compete. The players
              must be picked in their actual roles. This is to preserve
              simplicity, as adding adaptive roles makes it near impossible to
              workout scoring. Attempting to predict a players ability in
              another role quantitatively isn't particularly possible as all
              statistics are far too dependent on the role they actively play.
              IGL's is not considered a position, but all players receive an IGL
              bonus depending on their teams performance with them IGLing.
              Obviously this means players that have never IGLed receive no
              bonus. More on that below.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl gap-10 text-left md:flex">
          <h2 className="mb-8 w-52 shrink-0 text-3xl font-medium uppercase lg:w-72 lg:text-4xl">
            TEAM STRUCTURE
          </h2>
          <div className="">
            <p className="mb-12 text-xl leading-relaxed">
              A Team must contain:
              <SpanList>An Opener</SpanList>
              <SpanList>An AWPer</SpanList>
              <SpanList>A Closer</SpanList>
              <SpanList>A Support</SpanList>
              Then the final player is a flex position, they can have any role.
              I have elected to go with Support as the final position over
              Anchor for T side consistency.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl gap-10 text-left md:flex">
          <h2 className="mb-8 w-52 shrink-0 text-3xl font-medium uppercase lg:w-72 lg:text-4xl">
            IGL
          </h2>
          <div className="">
            <p className="mb-12 text-xl leading-relaxed">
              IGL's have their regular position, such as Opener, for which they
              are picked. You can pick no actual IGLs, or multiple. Once all
              five players have been chosen, you can elect one of them the IGL,
              where they receive an IGL bonus. This is often worth it,
              especially for top IGLs such as karrigan, apEX, FalleN, and
              Aleksib, who are some of the best overall players to pick.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl gap-10 text-left md:flex">
          <h2 className="mb-8 w-52 shrink-0 text-3xl font-medium uppercase lg:w-72 lg:text-4xl">
            IGL BONUS
          </h2>
          <div className="">
            <p className="mb-12 text-xl leading-relaxed">
              The IGL bonus follows similar logic to discussions I (the app
              creator) had with people about assessing football managers.
              Generally, three main criteria seem to matter:
              <SpanList>
                General performance considering duration of career
              </SpanList>
              <SpanList>
                How many different teams/systems they have managed to win with
              </SpanList>
              <SpanList>Player development under them</SpanList>
              The last appears to be far more on the coaching than the IGL, so
              is ignored. The first two, however, form the basis of the score.
              The performance is a weighted average depending on placement at
              each big event they have IGLed at. It is not a pure mean or a
              median, but an average over a reduced power of the total number of
              tournaments. This is to avoid two scenarios that seem equally
              unpleasant. First, just rewarding a number of points depending on
              placement for each tournament now rewards longevity too much.
              Mediocrity over a decade would be as good as top quality IGLing
              for 5 years, which feels wrong. Likewise just doing a standard
              average would reward short but strong careers but punish a player
              who has perhaps laboured away for years in low performing teams
              before achieving success. Why should a players current ability be
              judged on their rookie year? This also feels wrong, so a middle
              ground has been attempted.
            </p>
            <p className="mb-12 text-xl leading-relaxed">
              The second criteria is based off of the simple idea that an IGL
              could make a single good system with a single good team and win
              lots of tournaments, without necessarily being any better than a
              less winningest IGL who has ultimately had to reinvent their
              team/teams multiple times. Pep and Zidane have both won 3
              champions leagues as manager, yet which is more impressive? The
              same Madrid team winning 3 with Zidane or Pep winning with his
              with two completely different teams? As such, the number of unique
              players that a player has IGLed to winning a big event contributes
              to the score.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Rules;
