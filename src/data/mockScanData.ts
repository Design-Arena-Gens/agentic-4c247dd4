export type Niche =
  | "cafes"
  | "restaurants"
  | "influencers"
  | "fitness"
  | "travel";

export type CommentRecord = {
  username: string;
  text: string;
  commentedAt: string;
};

export type ScanPost = {
  id: string;
  postUrl: string;
  thumbnailUrl: string;
  type: "post" | "reel";
  postedAt: string;
  comments: CommentRecord[];
};

export type ScannedProfile = {
  handle: string;
  displayName: string;
  profileUrl: string;
  niche: Niche;
  recentPosts: ScanPost[];
};

export const SCANNED_PROFILES: ScannedProfile[] = [
  {
    handle: "coastalcafe",
    displayName: "Coastal Cafe",
    profileUrl: "https://www.instagram.com/coastalcafe/",
    niche: "cafes",
    recentPosts: [
      {
        id: "coastalcafe_1",
        postUrl:
          "https://www.instagram.com/p/C9CafeMorningCoastal/?img_index=1",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?auto=format&fit=crop&w=600&q=80",
        type: "post",
        postedAt: "2024-05-28T09:15:00Z",
        comments: [
          {
            username: "coffeequeen",
            text: "That latte art is perfection!",
            commentedAt: "2024-05-28T11:05:00Z",
          },
          {
            username: "brandwatcher",
            text: "Love how you highlight local roasters.",
            commentedAt: "2024-05-28T12:20:00Z",
          },
          {
            username: "lattehunter",
            text: "Saving this spot for my weekend!",
            commentedAt: "2024-05-28T14:42:00Z",
          },
        ],
      },
      {
        id: "coastalcafe_2",
        postUrl: "https://www.instagram.com/reel/C9CoastalPourOver/",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=600&q=80",
        type: "reel",
        postedAt: "2024-06-02T15:05:00Z",
        comments: [
          {
            username: "pourmaster",
            text: "The bloom on that pour over is unreal.",
            commentedAt: "2024-06-02T15:22:00Z",
          },
          {
            username: "socialsleuth",
            text: "Great breakdown on grind size changes!",
            commentedAt: "2024-06-02T17:40:00Z",
          },
        ],
      },
    ],
  },
  {
    handle: "urbanbrews",
    displayName: "Urban Brews Collective",
    profileUrl: "https://www.instagram.com/urbanbrews/",
    niche: "cafes",
    recentPosts: [
      {
        id: "urbanbrews_1",
        postUrl: "https://www.instagram.com/p/C9UrbanFlight/",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=600&q=80",
        type: "post",
        postedAt: "2024-05-22T08:30:00Z",
        comments: [
          {
            username: "mediahawk",
            text: "This tasting flight is Instagram gold.",
            commentedAt: "2024-05-22T09:14:00Z",
          },
          {
            username: "brandwatcher",
            text: "Curious which beans were used here!",
            commentedAt: "2024-05-22T10:54:00Z",
          },
        ],
      },
      {
        id: "urbanbrews_2",
        postUrl: "https://www.instagram.com/p/C9UrbanColdBrew/",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=600&q=80",
        type: "post",
        postedAt: "2024-06-05T13:48:00Z",
        comments: [
          {
            username: "lattehunter",
            text: "Need to try that seasonal cold brew drop!",
            commentedAt: "2024-06-05T14:11:00Z",
          },
          {
            username: "trendmapper",
            text: "Love the merch shelf styling here.",
            commentedAt: "2024-06-05T15:19:00Z",
          },
        ],
      },
    ],
  },
  {
    handle: "cityeatsdaily",
    displayName: "City Eats Daily",
    profileUrl: "https://www.instagram.com/cityeatsdaily/",
    niche: "restaurants",
    recentPosts: [
      {
        id: "cityeatsdaily_1",
        postUrl: "https://www.instagram.com/p/C9CityBrunch/",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1528712306091-ed0763094c98?auto=format&fit=crop&w=600&q=80",
        type: "post",
        postedAt: "2024-05-30T17:02:00Z",
        comments: [
          {
            username: "foodvoyager",
            text: "That brunch board is a masterpiece.",
            commentedAt: "2024-05-30T18:05:00Z",
          },
          {
            username: "socialsleuth",
            text: "Spotted your collab with Harvest & Co 👀",
            commentedAt: "2024-05-30T19:27:00Z",
          },
        ],
      },
      {
        id: "cityeatsdaily_2",
        postUrl: "https://www.instagram.com/reel/C9CityNightMarket/",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80",
        type: "reel",
        postedAt: "2024-06-06T21:10:00Z",
        comments: [
          {
            username: "trendmapper",
            text: "Love the lighting at the night market pop-up.",
            commentedAt: "2024-06-06T22:42:00Z",
          },
          {
            username: "brandwatcher",
            text: "Was that a cameo from StreetBite?",
            commentedAt: "2024-06-06T23:03:00Z",
          },
        ],
      },
    ],
  },
  {
    handle: "greenplatejournal",
    displayName: "Green Plate Journal",
    profileUrl: "https://www.instagram.com/greenplatejournal/",
    niche: "restaurants",
    recentPosts: [
      {
        id: "greenplatejournal_1",
        postUrl: "https://www.instagram.com/p/C9GreenFarmToTable/",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
        type: "post",
        postedAt: "2024-05-18T16:40:00Z",
        comments: [
          {
            username: "sustainableseeker",
            text: "Farm-to-table goals right here!",
            commentedAt: "2024-05-18T18:02:00Z",
          },
          {
            username: "socialsleuth",
            text: "Is that Herbal & Co collab in the backdrop?",
            commentedAt: "2024-05-18T21:10:00Z",
          },
        ],
      },
      {
        id: "greenplatejournal_2",
        postUrl: "https://www.instagram.com/p/C9GreenZeroWaste/",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1448043552756-e747b7a2b2b8?auto=format&fit=crop&w=600&q=80",
        type: "post",
        postedAt: "2024-06-03T12:05:00Z",
        comments: [
          {
            username: "lattehunter",
            text: "These reusable jars are a vibe. Where can I get them?",
            commentedAt: "2024-06-03T13:22:00Z",
          },
          {
            username: "plantbasedpulse",
            text: "Appreciate the transparency in sourcing!",
            commentedAt: "2024-06-03T14:18:00Z",
          },
        ],
      },
    ],
  },
  {
    handle: "fitloopstudio",
    displayName: "Fit Loop Studio",
    profileUrl: "https://www.instagram.com/fitloopstudio/",
    niche: "fitness",
    recentPosts: [
      {
        id: "fitloopstudio_1",
        postUrl: "https://www.instagram.com/reel/C9FitLoopInterval/",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=600&q=80",
        type: "reel",
        postedAt: "2024-05-25T07:12:00Z",
        comments: [
          {
            username: "wellnessradar",
            text: "Circuit breakdown is super helpful!",
            commentedAt: "2024-05-25T08:50:00Z",
          },
          {
            username: "socialsleuth",
            text: "Saw @PulseAthletic using similar formats recently.",
            commentedAt: "2024-05-25T10:05:00Z",
          },
        ],
      },
      {
        id: "fitloopstudio_2",
        postUrl: "https://www.instagram.com/p/C9FitLoopRecovery/",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1594737625785-c66858a24b3e?auto=format&fit=crop&w=600&q=80",
        type: "post",
        postedAt: "2024-06-04T06:32:00Z",
        comments: [
          {
            username: "mobilitymentor",
            text: "The recovery stack is dialed in!",
            commentedAt: "2024-06-04T07:24:00Z",
          },
          {
            username: "trendmapper",
            text: "Loving the brand consistency across the carousel.",
            commentedAt: "2024-06-04T08:15:00Z",
          },
        ],
      },
    ],
  },
  {
    handle: "creatorsphere",
    displayName: "Creator Sphere",
    profileUrl: "https://www.instagram.com/creatorsphere/",
    niche: "influencers",
    recentPosts: [
      {
        id: "creatorsphere_1",
        postUrl: "https://www.instagram.com/reel/C9CreatorWorkflow/",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80",
        type: "reel",
        postedAt: "2024-05-29T20:45:00Z",
        comments: [
          {
            username: "agencytracker",
            text: "Obsessed with the storytelling arc here.",
            commentedAt: "2024-05-29T21:11:00Z",
          },
          {
            username: "socialsleuth",
            text: "Smart reuse of the trending hook format!",
            commentedAt: "2024-05-29T22:05:00Z",
          },
        ],
      },
      {
        id: "creatorsphere_2",
        postUrl: "https://www.instagram.com/p/C9CreatorBrandDeck/",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=600&q=80",
        type: "post",
        postedAt: "2024-06-07T18:20:00Z",
        comments: [
          {
            username: "campaignnotes",
            text: "Bookmarking this for client brainstorms.",
            commentedAt: "2024-06-07T19:12:00Z",
          },
          {
            username: "trendmapper",
            text: "Curious if this is part of your new launch tease?",
            commentedAt: "2024-06-07T19:40:00Z",
          },
        ],
      },
    ],
  },
  {
    handle: "wanderatlas",
    displayName: "Wander Atlas",
    profileUrl: "https://www.instagram.com/wanderatlas/",
    niche: "travel",
    recentPosts: [
      {
        id: "wanderatlas_1",
        postUrl: "https://www.instagram.com/p/C9WanderSunrise/",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80",
        type: "post",
        postedAt: "2024-05-27T05:50:00Z",
        comments: [
          {
            username: "journeyfinder",
            text: "That sunrise is unreal, adding to the bucket list!",
            commentedAt: "2024-05-27T06:32:00Z",
          },
          {
            username: "socialsleuth",
            text: "Spotted the same drone shot trend here 👀",
            commentedAt: "2024-05-27T07:45:00Z",
          },
        ],
      },
      {
        id: "wanderatlas_2",
        postUrl: "https://www.instagram.com/reel/C9WanderHiddenFalls/",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
        type: "reel",
        postedAt: "2024-06-01T04:18:00Z",
        comments: [
          {
            username: "trendmapper",
            text: "Love the pacing of this reveal shot.",
            commentedAt: "2024-06-01T05:02:00Z",
          },
          {
            username: "globetrotguide",
            text: "Can you share the trail details? Looks intense!",
            commentedAt: "2024-06-01T05:26:00Z",
          },
        ],
      },
    ],
  },
];

export const AVAILABLE_NICHES: Array<{
  value: Niche;
  label: string;
  description: string;
}> = [
  {
    value: "cafes",
    label: "Cafes & Coffee Bars",
    description: "Specialty cafes and coffee shops with active communities.",
  },
  {
    value: "restaurants",
    label: "Restaurants & Dining",
    description: "Local restaurants, supper clubs, and chef-led experiences.",
  },
  {
    value: "influencers",
    label: "Influencer Creators",
    description: "Content creators discussing strategy and collaborations.",
  },
  {
    value: "fitness",
    label: "Fitness & Wellness",
    description: "Studios, trainers, and performance-focused accounts.",
  },
  {
    value: "travel",
    label: "Travel & Lifestyle",
    description: "Scenic explorers and travel storytellers.",
  },
];
