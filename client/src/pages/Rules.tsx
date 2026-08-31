"use client";
import SpanList from "@/components/ui/span-list";

const Rules = () => {
  return (
    <section className="min-h-screen overflow-hidden bg-linear-to-br dark:from-neutral-800 from-slate-50 to-blue-50 dark:to-neutral-950">
      <div className="py-20 relative flex flex-col justify-center items-center gap-y-8 z-10">
        <span>HOW TO PLAY</span>
        <span className="text-6xl max-w-3xl mx-auto text-center font-medium">
          CS-ACE
        </span>
        <p className="text-xl dark:text-neutral-400 text-neutral-600 mb-12 leading-relaxed">
          Build the best lineup you can
        </p>
        <div className="absolute bottom-0 left-0 right-0 top-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[48px_50px] mask-[radial-gradient(ellipse_25%_30%_at_50%_50%,#000_65%,transparent_110%)]"></div>
      </div>

      <div className="p-8 lg:p-12">
        <div className="max-w-5xl mx-auto md:flex text-left gap-10">
          <h2 className="text-3xl lg:text-4xl lg:w-72 w-52 uppercase font-medium mb-8 shrink-0">
            BASIC GAME
          </h2>
          <div className="">
            <p className="text-xl dark:text-neutral-400 text-neutral-600 mb-12 leading-relaxed">
              Get rolled a random team, pick a player, then repeat until you
              have a full team with genuine roles. Pick the IGL, and submit to
              get your score.
            </p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto md:flex text-left gap-10">
          <h2 className="text-3xl lg:text-4xl lg:w-72 w-52 uppercase font-medium mb-8 shrink-0">
            TEAMS
          </h2>
          <div className="">
            <p className="text-xl dark:text-neutral-400 text-neutral-600 mb-12 leading-relaxed">
              The teams contain the current players and their actual positions,
              as per the data from HLTV writer Harry Richards, who amazingly
              publishes an up-to-date dataset of active teams and player roles,
              map positions, etc, located{" "}
              <a
                style={{ color: "blue" }}
                href={
                  "https://public.tableau.com/app/profile/harry.richards4213/viz/PositionsDatabaseNER0cs/PositionsDatabaseNER0cs"
                }
              >
                here.
              </a>
            </p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto md:flex text-left gap-10">
          <h2 className="text-3xl lg:text-4xl lg:w-72 w-52 uppercase font-medium mb-8 shrink-0">
            PLAYERS
          </h2>
          <div className="">
            <p className="text-xl dark:text-neutral-400 text-neutral-600 mb-12 leading-relaxed">
              Players scores are their HLTV scores over a recent timespan at big
              events, as defined per HLTV. These events include most
              international LANs where you would expect to see at least a few
              tier 1 teams compete. The players must be picked in their actual
              positions. This is to preserve simplicity, as adding adaptive
              positions makes it near impossible to workout scoring. Attempting
              to predict a players ability in another role quantitatively isn't
              particularly possible as all statistics are far too dependent on
              the role they actively play. IGL's is not considered a position,
              but all players receive an IGL bonus depending on their teams
              performance with them IGLing. Obviously this means players that
              have never IGLed receive no bonus. More on that below.
            </p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto md:flex text-left gap-10">
          <h2 className="text-3xl lg:text-4xl lg:w-72 w-52 uppercase font-medium mb-8 shrink-0">
            TEAM STRUCTURE
          </h2>
          <div className="">
            <p className="text-xl dark:text-neutral-400 text-neutral-600 mb-12 leading-relaxed">
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
        <div className="max-w-5xl mx-auto md:flex text-left gap-10">
          <h2 className="text-3xl lg:text-4xl lg:w-72 w-52 uppercase font-medium mb-8 shrink-0">
            IGL
          </h2>
          <div className="">
            <p className="text-xl dark:text-neutral-400 text-neutral-600 mb-12 leading-relaxed">
              IGL's have their regular position, such as Opener, for which they
              are picked. You can pick no actual IGLs, or multiple. Once all
              five players have been chosen, you can elect one of them the IGL,
              where they receive an IGL bonus. This is often worth it,
              especially for top IGLs such as karrigan, apEX, FalleN, and
              Aleksib, who are some of the best overall players to pick.
            </p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto md:flex text-left gap-10">
          <h2 className="text-3xl lg:text-4xl lg:w-72 w-52 uppercase font-medium mb-8 shrink-0">
            IGL BONUS
          </h2>
          <div className="">
            <p className="text-xl dark:text-neutral-400 text-neutral-600 mb-12 leading-relaxed">
              The IGL bonus follows similar logic to discussions I (the app
              creator) had with people about assessing football managers.
              Generally, four criteria seem to matter:
              <SpanList>
                General performance considering duration of career
              </SpanList>
              <SpanList>
                How many different teams/systems they have managed to win with
              </SpanList>
              <SpanList>Player development under them</SpanList>
              <SpanList>Cannot remember</SpanList>
              The last two appear to be far more on the coaching than the IGL,
              so were ignored. The first two, however, form the basis of the
              score. The performance is a weighted average depending on
              placement at each big event they have IGLed at. It is not a pure
              mean or a median, but an average over a reduced power of the total
              number of tournaments. This is to avoid two scenarios that seem
              equally unpleasant. First, just rewarding a number of points
              depending on placement for each tournament now rewards longevity
              too much. Mediocrity over a decade would be as good as top quality
              IGLing for 5 years, which feels wrong. Likewise just doing a
              standard average would reward short but strong careers but punish
              a player who has perhaps laboured away for years in low performing
              teams before achieving success. Also wrong feeling, so a middle
              ground has been attempted.
            </p>
            <p className="text-xl dark:text-neutral-400 text-neutral-600 mb-12 leading-relaxed">
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
