const db = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const moment = require("moment");

module.exports = function (app) {
  app.delete("/api/events", function (request, response) {
    let date = moment().format("YYYY-MM-DD");
    db.Event.destroy({
      where: {
        uuid: {
          [Op.or]: {
            [Op.gt]: 'A',
            [Op.lt]: 'A'
          }
        },
        // isUserCreated: {
        //   [Op.eq]: 0
        // },
        startDate: {
          [Op.lt]: date
        }
      }
    })
      .then(deletedData => {
        response.json(deletedData);
      });
  });

  app.delete("/api/events/:eventId/user/:id", function (request, response) {
    db.Event.findOne({
      where: {
        eventId: request.params.eventId
      }
    }).then(function (dbEvent) {
      //console.log("Delete", dbEvent);
      db.SavedEvent.destroy({
        where: {
          UserId: request.params.id,
          EventUuid: dbEvent.uuid
        }
      })
        .then(function (deletedData) {
          response.json(deletedData);
        });
    });
  });


    //GET route for getting all of the public events by category
    app.get("/api/events/category/:category", function (request, response) {
      db.Category.findAll({
        where: {
          name: request.params.category
        },
        include: [{
          model: db.Event,
          where: {
            isUserCreated: 0
          },
          required: true,
        }],
        order: [
          [db.Event, "startDate", "ASC"],
          [db.Event, "startTime", "ASC"]
        ]
      }).then(function (dbEvent) {
        response.json(dbEvent);
      });
    });

    //GET route for getting all of the public events
    app.get("/api/events", function (request, response) {
      db.Event.findAll({
        where: {
          isUserCreated: 0
        },
        order: [
          ["startDate", "ASC"],
          ["startTime", "ASC"]
        ]
      }).then(function (dbEvent) {
        response.json(dbEvent);
      });
    });

    // POST route for saving a new user event
    app.post("/api/events", function (request, response) {
      console.log("this is the request body", request.body);
      db.Event.findOne({
        where: {
          eventId: request.body.eventId
        }
      })
        .then(function (dbEvent) {
          console.log(dbEvent);
          //console.log(newEvent);
          //console.log("This is after the find")
          db.SavedEvent.create({
            EventUuid: dbEvent.uuid,
            UserId: request.body.UserId
          })
            .then(function (dbSavedEvent) {
              console.log(dbSavedEvent);
              response.json(dbSavedEvent);
            })
        })
    });

    // app.get("/api/events/user/:id", function (request, response) {
    //   // var query = {};
    //   // if (req.query.author_id) {
    //   //   query.AuthorId = req.query.author_id;
    //   // }
    //   // Here we add an "include" property to our options in our findAll query
    //   // We set the value to an array of the models we want to include in a left outer join
    //   // In this case, just db.Author
    //   db.User.findAll({
    //     where: {
    //       id: request.params.id
    //     },
    //     include: [{
    //       model: db.Event,
    //       attributes: ["eventName", "venueName", "addressLine1", "addressLine2", "city", "state", "postalCode", "startDate", "startTime"]
    //     }]
    //   }).then(function (dbEvent) {
    //     response.json(dbEvent[0].Events);
    //   });
    // });



  }