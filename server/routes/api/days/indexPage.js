const markDaysItem = require(`${__base}/libs/markDaysItem`);
const DayModel = require(`${__base}/models/Day`).Day;
const ObjectID = require('mongodb').ObjectID;

module.exports = (req, res, next) => {
  const userID = req.headers.userid;
  const getDays = () =>
    DayModel.find({
      userID,
    })
      .sort({ date: -1 })
      .limit(7);

  getDays()
  .then(days => markDaysItem(days, userID)).then(days => res.json(days)).catch(next);
};
