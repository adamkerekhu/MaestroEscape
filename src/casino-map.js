// Underground Casino V2. Coordinates refer to the user's 1448 x 1086 top-down artwork.
// Slot machines and tables remain non-wagering interaction placeholders.
export const CASINO_SIZE={w:1448,h:1086};
export const CASINO_SPAWN={x:715,y:301};
export const CASINO_EXIT={x:711,y:265,radius:75};
// Flat rectangles approximate walls and furniture in the visual map.
// Central walkways (ladder -> bar, roulette, blackjack) must remain accessible.
export const CASINO_WALLS=[
 [0,0,37,1086],[1395,0,53,1086],
 [32,0,560,88],[807,0,588,88],
 [34,1020,1361,66],
 [120,118,405,242],       // back of casino bar; bartender stays behind counter
 [120,360,407,35],        // physical bar front, player approaches from below
 [885,150,414,168],      // five slot-machine cabinets
 [190,494,304,176],      // blackjack playing table
 [741,446,484,188],      // roulette table
 [500,787,405,213],      // sofa island
 [63,793,91,205],        // storage lockers
 [1158,800,177,176]      // storage shelving
];
export const CASINO_HOTSPOTS=[
 {id:"bar",name:"Underground bar",x:341,y:442,radius:100},
 {id:"blackjack",name:"Blackjack table",x:346,y:706,radius:78},
 {id:"roulette",name:"Roulette table",x:988,y:718,radius:82},
 {id:"slot_1",name:"Slot machine 1",x:920,y:342,radius:54},
 {id:"slot_2",name:"Slot machine 2",x:1000,y:342,radius:54},
 {id:"slot_3",name:"Slot machine 3",x:1080,y:342,radius:54},
 {id:"slot_4",name:"Slot machine 4",x:1160,y:342,radius:54},
 {id:"slot_5",name:"Slot machine 5",x:1240,y:342,radius:54}
];
