export interface ContentPost {
  id: string;
  title: string;
  platform: "Instagram Reels" | "TikTok" | "YouTube Shorts" | "Instagram Story";
  conceptType: "Behind The Scenes" | "Menu Highlight" | "Influencer Collab" | "Promo Event" | "Lifestyle & Vibe";
  publishDate: string;
  status: "Idea" | "Briefing" | "Shooting" | "Editing" | "Review" | "Scheduled" | "Published";
  creatorName: string;
  views?: number;
  likes?: number;
  shares?: number;
  caption: string;
  hashtags: string[];
}

export interface InfluencerCollab {
  id: string;
  influencerName: string;
  handle: string;
  platform: "Instagram" | "TikTok" | "YouTube";
  followerCount: string;
  visitDate: string;
  feeAmount: number;
  status: "Planned" | "Briefed" | "Visited" | "Posted";
  reachResult?: string;
  engagementRate?: string;
}

export interface Influencer extends InfluencerCollab {}

export const MOCK_CONTENT_POSTS: ContentPost[] = [];
export const MOCK_INFLUENCER_COLLABS: InfluencerCollab[] = [];
export const MOCK_INFLUENCERS: InfluencerCollab[] = [];
