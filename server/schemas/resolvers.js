const { AuthenticationError } = require('apollo-server-errors');
const { User } = require('../models');

const resolvers = {
  Query: {
    user: async (parent, { username, id }) => {
      return User.findOne({
        $or: [{ _id: id }, { username: username }],
      }).populate('savedBooks');
    }
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No User with this email found!');
      }

      const correctPW = await user.isCorrectPassword(password);

      if (!correctPW) {
        throw new AuthenticationError('Incorrect password entered!');
      }

      const token = signToken(user);
      return { token, user };
    },
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, { user, body }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: body } },
          { new: true, runValidators: true }
        );
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    removeBook: async (parent, args, { user }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: args.bookId} } },
          { new: true }
        );
      }
      throw new AuthenticationError("You need to be logged in.");
    },
  },
};

module.exports = resolvers;