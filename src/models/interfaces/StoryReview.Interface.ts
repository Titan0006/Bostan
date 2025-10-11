import {Types} from "mongoose"

export interface IStoryReview {
    storyId:Types.ObjectId;
    userId:Types.ObjectId;
    rating:number
}