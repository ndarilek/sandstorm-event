import {Meteor} from "meteor/meteor"
import {Mongo} from "meteor/mongo"

export const typeDefs = [`

type Event {
  title: String!
  description: String!
  start: Int!
  end: Int
  rsvps: [RSVP]
  comments: [Comment]
  canEdit: Boolean
  canComment: Boolean
}

enum RSVPType {
  YES
  NO
  MAYBE
}

type RSVP {
  user: User!
  value: RSVPType!
}

type User {
  name: String!
}

type Comment {
  id: String!
  date: Int!
  author: User!
  body: String!
  replies: [Comment]
}

type Query {
  event: Event
}

type Mutation {
  setTitle(title: String!): Event
  setDescription(description: String!): Event
  setStart(date: Int!): Event
  setEnd(date: Int): Event
  rsvp(rsvp: RSVPType!): Event
  addComment(parentId: String, body: String!): Comment
}

schema {
  query: Query
  mutation: Mutation
}

`]

const Event = new Mongo.Collection("event")

const Comments = new Mongo.Collection("comments")

export const resolvers = {
  Query: {
    async event(root, args, context) {
      if(!Event.find().count())
        Event.insert({
          title: "New Event",
          description: "Enter your event's description here.",
          start: new Date(),
          rsvps: {}
        })
      return Event.findOne()
    }
  },
  Event: {
    start: doc => doc.start.getTime(),
    end: doc => doc.end.getTime(),
    comments(doc, args, {userId}) {
      const user = Meteor.users.findOne(userId)
      if(user)
        return Comments.find({parentId: {$exists: false}}).fetch()
      else
        return []
    },
    rsvps(doc, args, {userId}) {
      const user = Meteor.users.findOne(userId)
      if(user)
        return Object.keys(doc.rsvps).map((k, v) => ({userId: k, value: v}))
      else
        return {}
    },
    canEdit(doc, args, context) {
      if(context) {
        const user = Meteor.users.findOne(context.userId)
        return user != undefined
      } else
        return false
    },
    canComment(doc, args, context) {
      if(context) {
        const user = Meteor.users.findOne(context.userId)
        return user != undefined
      } else
        return false
    }
  },
  RSVP: {
    user: (doc) => Meteor.users.findOne(doc.userId)
  },
  User: {
    name(doc) {
      if(doc.profile && doc.profile.displayName)
        return doc.profile.displayName
      else
        return ""
    }
  },
  Comment: {
    id: doc => doc._id,
    date: (doc) => doc.date.getTime(),
    author: doc => Meteor.users.findOne(doc.authorId)
  },
  Mutation: {
    setTitle(root, {title}, {userId}) {
      const user = Meteor.users.findOne(userId)
      if(user) {
        const event = Event.findOne()
        if(event) {
          Event.update(event._id, {$set: {title}})
          return Event.findOne()
        }
      } else
        throw new Meteor.Error("Unauthorized")
    },
    setDescription(root, {description}, {userId}) {
      const user = Meteor.users.findOne(userId)
      if(user) {
        const event = Event.findOne()
        if(event) {
          Event.update(event._id, {$set: {description}})
          return Event.findOne()
        }
      } else
        throw new Meteor.Error("Unauthorized")
    },
    setStart(root, {date}, {userId}) {
      const user = Meteor.users.findOne(userId)
      if(user) {
        const event = Event.findOne()
        if(event) {
          Event.update(event._id, {$set: {start: new Date(date)}})
          return Event.findOne()
        }
      } else
        throw new Meteor.Error("Unauthorized")
    },
    setEnd(root, {date}, {userId}) {
      const user = Meteor.users.findOne(userId)
      if(user) {
        const event = Event.findOne()
        if(event) {
          if(date)
            Event.update(event._id, {$set: {end: new Date(date)}})
          else
            Event.update(event._id, {$unset: {date: true}})
          return Event.findOne()
        }
      } else
        throw new Meteor.Error("Unauthorized")
    },
    rsvp(root, {value}, {userId}) {
      const user = Meteor.users.findOne(userId)
      if(user) {
        const event = Event.findOne()
        const set = {}
        set[`rsvps.${userId}`] = value
        Event.update(event._id, {$set: set})
        return Event.findOne()
      } else
        throw new Meteor.Error("Unauthorized")
    },
    addComment(root, {parentId, body}, {userId}) {
      const user = Meteor.users.findOne(userId)
      if(user) {
        const comment = {authorId: userId, body}
        if(parentId) {
          const parent = Comments.find(parentId)
          if(parent)
            if(parent.parentId)
              throw new Meteor.Error("Cannot reply multiple levels deep")
            else
              comment.parentId = parentId
          else
            throw new Meteor.Error("No parent")
        }
        const id = Comments.insert(comment)
        return Comments.findOne(id)
      } else
        throw new Meteor.Error("Unauthorized")
    }
  }
}
