const Top5List = require('../models/top5list-model');
const User = require('../models/user-model');

createTop5List = (req, res) => {
    const body = req.body;
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Top 5 List',
        })
    }

    console.log(body);
    const top5List = new Top5List(body);
    console.log("creating top5List: " + JSON.stringify(top5List));
    if (!top5List) {
        return res.status(400).json({ success: false, error: err })
    }

    top5List
        .save()
        .then(() => {
            return res.status(201).json({
                success: true,
                top5List: top5List,
                message: 'Top 5 List Created!'
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'Top 5 List Not Created!'
            })
        })
}

updateTop5List = async (req, res) => {
    const body = req.body
    console.log("updateTop5List: " + JSON.stringify(body));
    let email = 0;
    console.log(req.userId);
    while (email == 0) {
        await User.findById(req.userId, (err, user) => {
            email = user.email;
        }).catch(err => console.log(err))
    }
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        })
    }

    Top5List.findOne({ _id: req.params.id }, (err, top5List) => {
        //console.log("top5List found: " + JSON.stringify(top5List));
        console.log("Email: " + email);
        console.log("List owner: " + top5List.ownerEmail);
        if (top5List.ownerEmail != email) {
            console.log("Unauthorized edit attempt");
            return res.status(401).json({
                err,
                message: 'Unauthorized edit attempt!',
            })
        }

        if (err) {
            return res.status(404).json({
                err,
                message: 'Top 5 List not found!',
            })
        }

        top5List.name = body.name
        top5List.items = body.items
        top5List
            .save()
            .then(() => {
                console.log("SUCCESS!!!");
                return res.status(200).json({
                    success: true,
                    id: top5List._id,
                    message: 'Top 5 List updated!',
                })
            })
            .catch(error => {
                console.log("FAILURE: " + JSON.stringify(error));
                return res.status(404).json({
                    error,
                    message: 'Top 5 List not updated!',
                })
            })
    })
}

deleteTop5List = async (req, res) => {
    let email = 0;
    while (email == 0) {
        await User.findById(req.userId, (err, user) => {
            email = user.email;
        }).catch(err => console.log(err))
    }


    Top5List.findById({ _id: req.params.id }, (err, top5List) => {
        if (err) {
            return res.status(404).json({
                err,
                message: 'Top 5 List not found!',
            })
        }
        //Check is request is from list owner
        console.log("Email: " + email);
        console.log("List owner: " + top5List.ownerEmail);
        if (top5List.ownerEmail != email) {
            console.log("Unauthorized delete attempt");
            return res.status(401).json({
                err,
                message: 'Unauthorized delete attempt!',
            })
        }

        Top5List.findOneAndDelete({ _id: req.params.id }, () => {
            console.log("deleted success");
            return res.status(200).json({ success: true, data: top5List })
        }).catch(err => console.log(err))
    })
}

getTop5ListById = async (req, res) => {
    let email = 0;
    while (email == 0) {
        await User.findById(req.userId, (err, user) => {
            email = user.email;
        }).catch(err => console.log(err))
    }

    await Top5List.findById({ _id: req.params.id }, (err, list) => {
        if (err) {
            return res.status(400).json({ success: false, error: err });
        }

        console.log("Email: " + email);
        console.log("List owner: " + list.ownerEmail);
        if (list.ownerEmail != email) {
            console.log("Unauthorized access attempt");
            return res.status(401).json({
                err,
                message: 'Unauthorized access attempt!',
            })
        }
        console.log("List access success")
        return res.status(200).json({ success: true, top5List: list })
    }).catch(err => console.log(err))
}
getTop5Lists = async (req, res) => {
    await Top5List.find({}, (err, top5Lists) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!top5Lists.length) {
            return res
                .status(404)
                .json({ success: false, error: `Top 5 Lists not found` })
        }
        return res.status(200).json({ success: true, data: top5Lists })
    }).catch(err => console.log(err))
}
getTop5ListPairs = async (req, res) => {
    let email = 0;
    console.log("ID: " + req.userId);
    while (email == 0) {
        await User.findById(req.userId, (err, user) => {
            email = user.email;
            console.log("Found: " + user.email);
        }).catch(err => console.log(err))
    }

    console.log(email);
    await Top5List.find({ ownerEmail: email }, (err, top5Lists) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!top5Lists) {
            console.log("!top5Lists.length");
            return res
                .status(404)
                .json({ success: false, error: 'Top 5 Lists not found' })
        }
        else {
            // PUT ALL THE LISTS INTO ID, NAME PAIRS
            let pairs = [];
            for (let key in top5Lists) {
                let list = top5Lists[key];
                let pair = {
                    _id: list._id,
                    name: list.name
                };
                pairs.push(pair);
            }

            return res.status(200).json({ success: true, idNamePairs: pairs })
        }
    }).catch(err => console.log(err))

}

module.exports = {
    createTop5List,
    updateTop5List,
    deleteTop5List,
    getTop5Lists,
    getTop5ListPairs,
    getTop5ListById
}