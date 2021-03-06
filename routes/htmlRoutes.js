var db = require("../models");
var ticketmaster = require("../modules/ticketmaster")
const moment = require("moment");

module.exports = function (app) {
  // Load index page
  app.get("/events", function (request, response) {
    // console.log("this is the request /events", request.user);
    db.Event.findAll({
      where: {
        isUserCreated: 0
      },
      order: [
        ["startDate", "ASC"],
        ["startTime", "ASC"]
      ]
    }).then(function (dbEvent) {
      db.User.findAll({
        where: {
          id: request.user.id
        },
        include: [{
          model: db.Event,
          attributes: ["eventId","eventName", "venueName", "addressLine1", "addressLine2", "city", "state", "postalCode", "startDate", "startTime"]
        }],
        order: [
          [db.Event, "startDate", "ASC"],
          [db.Event, "startTime", "ASC"]
        ]
      }).then(function (mySavedEvents) {
      //console.log("mysaved events", mySavedEvents[0].Events);
      let myEventData = mySavedEvents[0].Events.map(event => {
        return {
          eventId: event.eventId,
          eventName: event.eventName,
          venueName: event.venueName,
          addressLine1: event.addressLine1,
          addressLine2: event.addressLine2,
          city: event.city,
          state: event.state,
          postalCode: event.postalCode,
          startDate: moment(event.startDate).format("MMM DD, YYYY"),
          startTime: moment(event.startDate+"T"+event.startTime).format("LT"),
        }
      });
      let dbEventData = dbEvent.map(event => {
        return {
          eventId: event.eventId,
          eventName: event.eventName,
          venueName: event.venueName,
          addressLine1: event.addressLine1,
          addressLine2: event.addressLine2,
          city: event.city,
          state: event.state,
          postalCode: event.postalCode,
          startDate: moment(event.startDate).format("MMM DD, YYYY"),
          startTime: moment(event.startDate+"T"+event.startTime).format("LT"),
        }
      })
      //console.log("myEventData", myEventData);
      response.render("events", { eventsDB: dbEventData, myEvents: myEventData })
    });
  });
});

  // // Load example page and pass in an example by id
  // app.get("/example/:id", function (req, res) {
  //   db.Example.findOne({ where: { id: req.params.id } }).then(function (
  //     dbExample
  //   ) {
  //     res.render("example", {
  //       example: dbExample
  //     });
  //   });
  // });


  app.get("/admin/:category", function (req, res) {
    ticketmaster.getByCategory(req.params.category)
      .then(dbData => {
        //   for(i=0; i < results.length; i++) {
        //     let = id = results[i].eventid;
        //     eventIdArray.push(id);
        //     // console.log(results[i].eventid);
        //   }
        //   // console.log(eventIdArray);
        //   let dbDataFiltered = dbData.filter(event => {
        //     return eventIdArray.indexOf(event.id) == -1;
        //   })

        db.Event.bulkCreate(dbData, { ignoreDuplicates: true })
          .then(() => {
            return db.Event.findAll({});
          })
          .then((bulkData) => {
            res.render("admin", { category: req.params.category, eventsDB: bulkData, eventsAPI: dbData })
          })
      })
    // get event.id's from database and put them into an array called eventIds ["vv1A7ZAf4Gkdbtp", "vv1A7ZAf4Gkdbtp"]
    // filter dbData to just the ones that are NOT already in db
    // let dbDataFiltered = dbData.filter(event => {
    // return eventIds.indexOf(event.id) == -1;
    //})

    // db.Event.bulkCreate(dbDataFiltered)
    // .then((bulkData) => {
    //   res.render("admin", {category: req.params.category, events: bulkData})
    // })


    // db.Event.bulkCreate(dbDataFiltered)
    // .then((bulkData) => {
    //   res.render("admin", {category: req.params.category, eventsDB: bulkData, eventsAPI: dbData})
    // })



    // res.render("admin", {category: req.params.category, events: dbData})


    // res.render("admin", db_data);

  });

  // Render 404 page for any unmatched routes
  app.get("*", function (req, res) {
    res.render("404");
  });

  
};



/*

axios
            .get("https://app.ticketmaster.com/discovery/v2/events.json", {
                params: {
                    apikey: "QpgAlmehADBTbnhbCGSGXmv5wqyRcSpo",
                    startDateTime: "2018-12-22T00:00:00Z",
                    endDateTime: "2019-12-22T23:59:00Z",
                    city: "Chicago",
                    countryCode: "US",
                    stateCode: "IL",
                    classificationName: req.params.category,
                    page: 0
                }
            })
            .then(function (response) {
                let responseData = response.data._embedded.events;
                let dbData = responseData.map(event => {
                  return {
                    name: event.name,
                    id: event.id,
                    url: event.url,
                    startDate: event.dates.start.localDate,
                    venueName: event._embedded.venues[0].name,
                    address: event._embedded.venues[0].address.line1,
                    city: event._embedded.venues[0].city.name,
                    state: event._embedded.venues[0].state.stateCode,
                    zip: event._embedded.venues[0].postalCode,
                  }
                });
                console.log(dbData);
                res.render("admin", { category: req.params.category, events: dbData});

            })
            .catch(function (error) {
                console.log(error);
            });

*/
