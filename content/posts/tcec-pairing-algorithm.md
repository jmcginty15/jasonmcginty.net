---
date: 2021-03-18
title: Swiss Tournaments with the TCEC Pairing Algorithm
published: true
tags: ['Programming', 'Algorithms', 'Chess', 'Tournaments']
series: false
cover_image: ./images/tcec-pairing.jpg
canonical_url: false
description: 'A quick and dirty explanation of how to automate pairings for Swiss system chess tournaments.'
filename: 'tcec-pairing-algorithm'
---

A couple of weeks ago I made a [blog post](https://jasonmcginty.surge.sh/blog/barnes-hut-simulation/) explaining an algorithm that I implemented in my [Solar System Explorer](https://solar-system-simulator.herokuapp.com/) project, so I thought it would be appropriate to also explain the key algorithm in the other major project I've build so far, [FlexChess](https://flexchess.surge.sh/). That algorithm is the TCEC Swiss pairing system.

The [Swiss system](https://en.wikipedia.org/wiki/Swiss-system_tournament) is a fairly typical format for chess tournaments and is not really a single system, but an umbrella term that contains several different variants. Broadly speaking, the Swiss system is a non-elimination tournament format in which players gain points based on their game results and are ranked by score after each round. For each successive round, players are paired with opponents who are currently near them in the standings, and final placings will be awarded according to standings after a set number of rounds. There are many distinct systems for the specific way pairings are assigned, such as the [Dutch](https://en.wikipedia.org/wiki/Swiss-system_tournament#Dutch_system), [Monrad](https://en.wikipedia.org/wiki/Swiss-system_tournament#Monrad_system), [Accelerated](https://en.wikipedia.org/wiki/Swiss-system_tournament#Accelerated_pairings), [Danish](https://en.wikipedia.org/wiki/Swiss-system_tournament#Danish_system), [Grand Prix](https://en.wikipedia.org/wiki/Swiss-system_tournament#Grand_Prix_system), [McMahon](https://en.wikipedia.org/wiki/Swiss-system_tournament#McMahon_system), and [Amalfi](https://en.wikipedia.org/wiki/Swiss-system_tournament#Amalfi_system) systems. Each of these systems comes with its own advantages and disadvantages, but for my project I decided to implement the TCEC system due to its relative ease of programmatic implementation.

The TCEC system is really a variant of the Monrad system mentioned above and is named for the Top Chess Engine Championship tournaments in which it has been used. The TCEC tournaments are played between the top-performing computer chess engines in the world. An explanation of the algorithm follows below, and you can see my implementation of the pairing algorithm [on GitHub](https://github.com/jmcginty15/chess-tournament-organizer-v2-backend).

### Seeding

Pairing is done by rankings after each round, and in order to assign pairings for the first round, initial rankings must be established. The easiest way to do this is to simply randomize the order, but in most tournaments it is desirable to have the strongest players only meeting each other in the later rounds, and with randomized seeding it is just as likely that the top two players will meet each other in the very first round. This is not as important in a Swiss tournament as it would be in a typical [single-](https://en.wikipedia.org/wiki/Single-elimination_tournament) or [double-elimination](https://en.wikipedia.org/wiki/Double-elimination_tournament) tournament since no players are eliminated after each round, but it is still nice to put off matchups between the strongest players until the later rounds. We can accomplish that with group seeding.

In group seeding, players are initially seeded according to [Elo ratings](https://en.wikipedia.org/wiki/Elo_rating_system), which are a common method of indicating relative playing strength in chess as well as many other games. The higher a player's Elo rating, the stronger of a player they are likely to be. We cannot, however, simply seed the players directly in order according to their Elo ratings because when using our preferred pairing algorithm this would guarantee that the strongest and second strongest players meet each other in the very first round, and we've already established that we don't want this. So how do we solve this issue?

> 1. Rank players according to Elo rating.

For an example, we'll take a tournament with 19 entries:

| **Rank** | **Player** |
| :---: | :---: |
| 1 | A |
| 2 | B |
| 3 | C |
| 4 | D |
| 5 | E |
| 6 | F |
| 7 | G |
| 8 | H |
| 9 | I |
| 10 | J |
| 11 | K |
| 12 | L |
| 13 | M |
| 14 | N |
| 15 | O |
| 16 | P |
| 17 | Q |
| 18 | R |
| 19 | S |

In this example, Player A is the highest rated and Player S is the lowest rated.

> 2. Divide the players into ```𝑁``` groups of roughly equal size.

```𝑁``` could be one of several numbers depending on the number of players involved in the tournament, but for our example we'll divide our players into 3 groups. Since our number of entries isn't evenly divisible by 3, we let the higher rated groups have one more player than the lower rated groups:

| **Group 1** | **Group 2** | **Group 3** |
| :---: | :---: | :---: |
| A | H | N |
| B | I | O |
| C | J | P |
| D | K | Q |
| E | L | R |
| F | M | S |
| G | | |

> 3. Assign seeds starting with the first player from Group 1 and proceeding with each group in order until all players have been assigned seeds.

| **Seed** | **Player** |
| :---: | :---: |
| 1 | A |
| 2 | H |
| 3 | N |
| 4 | B |
| 5 | I |
| 6 | O |
| 7 | C |
| 8 | J |
| 9 | P |
| 10 | D |
| 11 | K |
| 12 | Q |
| 13 | E |
| 14 | L |
| 15 | R |
| 16 | F |
| 17 | M |
| 18 | S |
| 19 | G |

In this way, player A (the first player from Group 1) gets the 1 seed, Player H (the first player from Group 2) gets the 2 seed, and Player N (the first player from Group 3) gets the 3 seed. We then continue with the second player from each group, then the third, until we have assigned seeds to all players. Notice that the second highest rated player, Player B, ends up with the 4 seed and so will not be paired with Player A in the first round.

The number of groups ```𝑁``` can be varied for different effects. Generally speaking, lower values of ```𝑁``` will tend to put off meetings between the highest and second highest rated until later rounds than higher values of ```𝑁```, as long as ```𝑁 ≠ 1```. A value of ```𝑁 = 2``` will tend to put off this matchup as long as possible. This will be seen more clearly once we dig into how the pairing algorithm actually works. For tournaments with few rounds relative to the number of players, it may be desirable to use a higher value of ```𝑁``` to ensure that the highest rated matchups actually occur and are not put off longer than the allotted number of rounds for the tournament.

My current implementation always uses ```𝑁 = 2```, but one possible improvement to make to the application could be to allow the tournament director to select this value when a tournament is created.

### Pairing

Now that we have our initial seeds established, let's see how the pairing algorithm works. This algorithm ensures that a) no player will be paired with the same opponent twice, b) each player will have a roughly equal number of games with the white pieces and with the black pieces, and c) matchups between top rated players will tend to be put off until the later rounds as explained above. This requires that we keep track of each player's history of opponents as well as piece color for each round of the tournament.

Note that tournament points will be discussed below. In typical chess tournaments, players score 1 point for a win, ½ point for a draw, and 0 points for a loss.

> 1. Rank players first by tournament score, then by seed.

Since all players have a score of 0 for the first round, this devolves to pure ranking by seed for the initial standings. In later rounds, if two players have the same score, the player with the lower seeding number will be ranked higher for pairing purposes. Using the seeding method outlined above, this is what ensures that pairings between higher rated players tend to be put off until the later rounds.

> 2. For the case of an odd number of entries, assign a bye for the round to the lowest ranked player who has not yet received a bye.

We can easily keep track of any bye a player has previously received in the same way we keep track of previous opponents. The player who receives a bye is removed from the current round's ranking and not included in the rest of the process for the current round.

> 3. Designate the first two unpaired players in the pairing order as ```𝑝1``` and ```𝑝2``` and check their compatibility as opponents.

```𝑝1``` and ```𝑝2``` are compatible opponents if all of the following conditions are satisfied:

> a) They have not already played each other previously.

This will be detemined by checking each player's opponent history.

> b) They have compatible white game differences (*WGD*).

A player's *WGD* is determined by the difference ```𝑊 - 𝐵``` where ```𝑊``` is the number of previous games a player has played with the white pieces and ```𝐵``` is the number of previous games a player has played with the black pieces. If the *WGD* for both players is between -1 and 1 inclusively, the pairing is valid. If one player's *WGD* is -2, the other player must have a *WGD* of *at least* 0 for the pairing to be valid, and if one player's *WGD* is 2, the other player must have a *WGD* of *at most* 0.

> c) There exists a viable set of pairings for the remaining players such that all pairings meet criteria a) and b).

One way to do this is by using the [blossom algorithm](https://en.wikipedia.org/wiki/Blossom_algorithm), which is beyond the scope of this post. Another way is to temporarily remove ```𝑝1``` and ```𝑝2``` from the pairing order and recursively run the algorithm for the remaining players. If it produces a valid set of pairings, the condition is satisfied. This is a very inefficient way of checking this condition, but the numbers of players involved in a typical chess tournament will be low enough that it won't matter.

> 4. If all of the above conditions a) through c) are satisfied, add ```𝑝1 vs. 𝑝2``` to the pairing list for the current round, add each player to the other's opponent history, and move on to step 5. If any of the conditions are not satisfied, repeat step 3 with the same ```𝑝1``` and designate the next player in the pairing order as ```𝑝2```.
> 5. Return to step 3, designating the next two unpaired players in the ranking order as ```𝑝1``` and ```𝑝2```.
> 6. Repeat steps 3-5 until all players have been paired.
> 7. Assign player colors for each pairing and add color assignments to each player's color history.

Player colors are assigned primarily by the players' existing *WGD* values. If the players have different *WGD* values, the player with the higher *WGD* is assigned the black pieces. If the players have the same *WGD*, the player with the higher tournament score is assigned the black pieces. If the players have both the same *WGD* and the same tournament score, the player designated ```𝑝1``` is assigned the white pieces in rounds 2, 3, 6, 7, 10, 11, ... and the player designated ```𝑝2``` is assigned the white pieces in rounds 1, 4, 5, 8, 9, 12, ... . This method of assigning colors, along with criterion b) from step 3, ensure that the *WGD* for all players will always remain between -2 and 2 inclusively.

For the first round of any tournament, the criteria in step 3 will always be satisfied for every pairing since none of the players have any previous opponents and all players have a *WGD* of 0. This means that in the first round, the 1 seed will always play the 2 seed, 3 will always play 4, and so on. Note that for the seeding method outlined above, seed order does not correspond to player rankings according to Elo rating.

### Tiebreaking with Sonneborn-Berger Scores

After each round of a tournament, the pairing order is determined by tournament score and any ties are broken by seeding number. Seeding number was in turn determined by our seeding algorithm, which depends on player Elo ratings. This is fine for determining pairing order during a tournament, but for determining final placings we would like to have a way of breaking ties that does not depend on players' previous ratings, but only on what happened during the tournament itself.

The name [Sonneborn-Berger score](https://en.wikipedia.org/wiki/Sonneborn%E2%80%93Berger_score) is a bit of a misnomer since William Sonneborn and Johann Berger after whom it is named were critics of the system and actually proposed their own modified version of it (a modification which, coincidentally, does not help with breaking ties). The name has stuck anyway, and the Sonneborn-Berger score is now one of the most popular ways of breaking ties in Swiss system chess tournaments.

The score is easy to calculate, and is simply the sum of the scores of all opponents a player has beaten in the tournament plus half the sum of the scores of all opponents a player has drawn with. This way, the tiebreaker depends only on each player's performance in the current tournament and not on any external factors such as previous Elo rating. As an example, let's say Joe won games against Bill and Dave, drew a game with Steve, and lost to Jack. Bill scored 1.5 points in the tournament, Dave scored 2 points, and Steve scored 1. Joe's Sonneborn-Berger score would be Bill's score plus Dave's score plus half of Steve's score, which totals to 4. Jack's score doesn't matter for Joe's Sonneborn-Berger score since Joe lost to him. Out of any two players whose final tournament scores are tied, the winner of the tiebreaker is the player with the higher Sonneborn-Berger score.

There is always a small chance that two players could still end up tied after Sonneborn-Berger scores are considered, especially if few rounds are played relative to the number of tournament entries. In cases like this, my particular project simply falls back on seeding numbers as a second tiebreaker. As mentioned above, this isn't ideal, but also isn't likely to happen. I could consider improving the project in the future by adding additional tiebreak criteria, such as [median or modified median](https://en.wikipedia.org/wiki/Tie-breaking_in_Swiss-system_tournaments#Median), [Solkoff score](https://en.wikipedia.org/wiki/Tie-breaking_in_Swiss-system_tournaments#Solkoff), or [cumulative total score](https://en.wikipedia.org/wiki/Tie-breaking_in_Swiss-system_tournaments#Cumulative).

### Team Tournaments

The TCEC pairing algorithm can also be used with team Swiss tournaments without much modification. For team tournaments, the players of each team are ranked from highest to lowest Elo rating. The highest rated member of a team is designated that team's Board 1 player, the second highest rated member is designated Board 2, and so on down to the lowest rated team member (Board 4 for a 4-player team for example). A team match consists of one game between the corresponding board players from each team: Board 1 vs. Board 1, Board 2 vs. Board 2, and so on. Team Elo ratings are taken to be the average of the Elo ratings of all the team's members.

To adapt the above algorithm for team matches, simply replace any mention of "games" with "matches", and replace "white pieces" with "Team 1" and "black pieces" with "Team 2". In a given match, the team designated Team 1 will have the white pieces on boards 1, 4, 5, 8, 9, 12, ... and the team designated Team 2 will have the white pieces on boards 2, 3, 6, 7, 10, 11, ... . It is desirable for the teams to have even numbers of players; otherwise one team will have one more game with the white pieces than the other team during every match.
