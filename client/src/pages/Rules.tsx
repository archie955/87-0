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
              The teams contain current players, except for very recent
              transfers, and their actual roles, as per the data from HLTV
              writer Harry Richards who amazingly publishes an up-to-date
              dataset of active teams and player roles located{" "}
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
              Player scores are a standard scaling formula applied to the logit
              of the calculated probability of winning as per a Logistic
              Generalised Additive Model trained on a dataset of player-game
              HLTV scores and game outcomes. The specific period for the player
              scores is currently all of 2026 up until the end of EWC. We only
              consider events labelled as "big" by HLTV. These events include
              most international LANs where you would expect to see multiple
              tier 1 teams compete. The players must be picked in their actual
              roles. This is for game simplicity, as adding adaptive roles makes
              it near impossible to workout scoring. Attempting to predict a
              players ability in another role quantitatively isn't particularly
              possible as all statistics are far too dependent on the role they
              actively play. IGL is not considered a position, but the player
              chosen as the IGL has their score worked out differently,
              documented below.
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
              Then the final player is a flex role, they can have any role. I
              have elected to not have Anchor as a role, despite many players
              being primarily defined by being successful anchors, for T sided
              role consistency.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl gap-10 text-left md:flex">
          <h2 className="mb-8 w-52 shrink-0 text-3xl font-medium uppercase lg:w-72 lg:text-4xl">
            IGL
          </h2>
          <div className="">
            <p className="mb-12 text-xl leading-relaxed">
              IGL's have their regular role, such as Opener, for which they are
              picked. You can pick no actual IGLs, or multiple. Once all five
              players have been chosen, you can elect one of them the IGL, where
              they receive their IGL score over their standard score. Due to
              different scoring, it is strongly advised that you do select an
              IGL, though it certain situations it can be worth it to select 5
              non-IGLs over selecting an IGL.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl gap-10 text-left md:flex">
          <h2 className="mb-8 w-52 shrink-0 text-3xl font-medium uppercase lg:w-72 lg:text-4xl">
            IGL SCORE
          </h2>
          <div className="">
            <p className="mb-12 text-xl leading-relaxed">
              The IGL score follows similar logic to discussions often held
              regarding assessing football managers. Generally, three main
              criteria seem to matter:
              <SpanList>
                General performance considering duration of career
              </SpanList>
              <SpanList>
                How many different teams/systems they have managed to win with
              </SpanList>
              <SpanList>And finally player development under them</SpanList>
              The last appears to be far more on the coaching than the IGL, so
              is ignored. The first two, however, form the basis of the score.
              The performance is a weighted fractional mean depending on
              placement at each big event they have IGLed at. That is, it
              weights different results, and divides by total tournament number
              to a power {"q: 0 < q < 1"}. This is to avoid two scenarios that
              seem equally unpleasant. First, just rewarding a number of points
              depending on placement for each tournament now rewards longevity
              too much. Mediocrity over a decade would be as good as top quality
              IGLing for a few years, which feels wrong. Likewise just doing a
              standard average where the above power q is 1 would reward short
              but strong careers but punish a player who has perhaps laboured
              away for years in low performing teams before achieving success.
              Why should a players current ability be harshly judged by their
              performance on their rookie year? This also feels wrong, so a
              middle ground has been attempted.
            </p>
            <p className="mb-12 text-xl leading-relaxed">
              The second criteria is based off of the simple idea that an IGL
              could make a single good system with a single good lineup and win
              lots of tournaments, without necessarily being any better than a
              less sucessful IGL who has ultimately had to reinvent their
              team/teams multiple times. Pep and Zidane have both won 3
              champions leagues as manager, yet which is more impressive? The
              same Madrid team winning 3 with Zidane or Pep winning with two
              completely different teams? As such, the number of unique players
              that a player has IGLed to winning a big event contributes to the
              score.
            </p>
            <p className="mb-12 text-xl leading-relaxed">
              The above score is then modified by the players HLTV score, to
              scale it to how much success the player actually achieves compared
              to what their HLTV score predicts. Effectively, it gets scaled so
              that it is whatever it needs to be for the IGLs rating to match
              their achieved success. This is then combined with a reduced
              proportion of the HLTV rating to form the IGL score. It is worth
              noting that selecting a player that has never IGLed will result in
              them receiving only a fraction of their HLTV rating, and that
              players that have IGLed can still receive a lower score than their
              HLTV rating. Do not be fooled by this, though, as selecting an
              actual IGL will normally always result in a better lineup than
              just selecting higher HLTV ratings without an IGL. The best
              achievable lineups with IGls are far and away better than the best
              lineup without an IGL.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl gap-10 text-left md:flex">
          <h2 className="mb-8 w-52 shrink-0 text-3xl font-medium uppercase lg:w-72 lg:text-4xl">
            SCORING
          </h2>
          <div className="">
            <p className="mb-12 text-xl leading-relaxed">
              The total score is then the sum of the logit's. For reference, a
              score of 0 corresponds to the mean score of the teams in the
              dataset. This does mean that a negative score is possible, to
              demonstrate a really bad team. If you aren't going out of your way
              to get it, though, then you will almost certainly always get a
              positive score. Most scores will be around 2-6, and the best
              possible score is 10.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Rules;
