import User from '../models/user.js';

const getMyCryptos = async (req, res) => {
  const user = req.user;
  if (!user) {
    res.json({"state":"Error, user doesn't exist."});
    return;
  }
  const dbUser = await User.findOne({ _id: user._id }).exec();
  const wallet = dbUser.wallet;
  res.json(wallet);
};

const setMyCryptos = async (req, res) => {
  console.log("PUT /");
  const user = req.user;
  if (!user) {
    res.json({"state":"Error, user doesn't exist."});
    return;
  }
  const wallet = req.body.wallet;
  await User.updateOne({ _id: user._id }, { wallet: {...user.wallet, ...wallet} }, { upsert: true }).exec();
  res.json({"state":"Successfully updated wallet", wallet});
};

const exchange = async (req, res) => {
  console.log("POST /exchange");
  const user = req.user;
  const dropping = req.body.dropping;
  const gaining = req.body.gaining;
  const droppingCurrency = Object.keys(dropping)[0];
  const droppingValue = Object.values(dropping)[0];
  const gainingCurrency = Object.keys(gaining)[0];
  const gainingValue = Object.values(gaining)[0];
  const curDropValue = user.wallet[droppingCurrency];
  const curGainValue = user.wallet[gainingCurrency];

  let resultDrop = 0.0;
  if (curDropValue && curDropValue > droppingValue)
    resultDrop = curDropValue - droppingValue;
  else {
    console.log("Error: not enough money to make that transaction.");
    res.json({"state":"Error: not enough money to make that transaction."});
    return;
  }

  let resultGain = gainingValue;
  if (curGainValue)
    resultGain = curGainValue + gainingValue;

  await User.updateOne({ _id: user._id }, {
     wallet: {...user.wallet, 
      [droppingCurrency]: resultDrop, 
      [gainingCurrency]: resultGain
    }}, { upsert: true }).exec();
  res.json({"state":"Successfully updated wallet", dropping, gaining});
};

export { 
  getMyCryptos,
  setMyCryptos,
  exchange,
};

