const User = require('../models/userModel');
const {Error} = require("mongoose");


async function user(_,{id}){
    try {
        return await User.findById(id)
    } catch (e) {

    }
}

async function users(_) {
    try {
        return await User.find().sort({ createdAt: -1 });
    } catch (e) {

    }

}
async function getHosts(_){
    try {
        return await User.find({ userType: 'host' }).exec();
    } catch (e) {
        throw new Error('Failed to fetch hosts');
    }
}

module.exports = {
    User: {
        id: (parent) => parent._id.toString(),
        createdAt: (parent) => new Date(parent.createdAt).toISOString(),
    },
    Query: {
        user,
        users,
        getHosts,
    }
}
