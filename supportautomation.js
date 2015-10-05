/////// Global Variables

//Setting number for click to SMS
twilioSendNbr = "+";
    
if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  
    //Set variable name for devices collection (Tasks)
    Tasks = new Mongo.Collection("tasks");
    
  //Publish filtered
//  Meteor.publish("filteredView", function(filter) {
//    return Tasks.find({"lastIdEventCode" : filter});
//  });
    
    //Publish everything
    Meteor.publish("filteredView", function() {
      return Tasks.find();
    });
  
    
    //SMS Code grabbed from Skot. I need to move this API key storage.
    // least secure API key storage in history
    var twilioSid = '';
    var twilioToken = '';

    // initialize Twilio object
    twilio = Twilio(twilioSid, twilioToken);
    });
  
  Meteor.methods({
        // SMS via Twilio
    sendSMS: function(to, from, body)  {
      check([to, from, body], [String]);
      twilio.sendSms({
        to: to,
        from: from,
        body: body
      }, function (err, response) {
        if (!err) {
          console.log(response.to);
          console.log(response.body);
        } else {
          console.log(err);
        }
      });
    },
      setMapLocation: function(view, zoom, markerLoc) {
        console.log(view);

//        
//        var map = L.map('assetmap').setView([41.4949425, -81.70586], 14);
      }
  });
}

 
if (Meteor.isClient) {
  // Collection Variables
  Tasks = new Mongo.Collection("tasks");
  
  // Subscription
  Meteor.subscribe("filteredView");
  
  //can I get a google font?
  WebFontConfig = {
    google: { families: [ 'Abel::latin' ] }
  };
  (function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })();
    
  /////Testing Static Search/////
//  var qry = {lastIdEventCode: 976, lastCommunication : new Date(new Date().getTime() - (200 * 60 * 60 * 1000))};
//  var qry = {"lastIdEventCode" : { $ne: 976}, "lastCommunication" : {$lte:  new Date(new Date().getTime() - (200 * 60 * 60 * 1000))}};
  
  // Session Variables
    //qry is declared so we have an empty object to start findQry with. We wont always do this.
    var qry = {};
    Session.set("findQry", qry);
    Session.set("toPass", Session.get("findQry"));
    Session.set("filterValue", "");
    Session.set("filterField", "");
    Session.set("fieldChooserName", "Fields");
    Session.set("assetsFound");
    Session.set("totalAssets");
    Session.set("currentDate", new Date());
    Session.set("yesterday", new Date(new Date().getTime() - (24 * 60 * 60 * 1000)));
    Session.set("assetModalLatLong", [41.4949425, -81.70586]);
    Session.set("assetModalDefZoom", 14);
    Session.set("modalContext", "560aa7687c096afe75a6851f");
    Session.set("tileIDString", "");
    
  
  //Setting the LeafletJS settings
  L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';
  
  //setup an empty map object
  var assetMap  
  
  //Code to run when the map is rendered (this doesn't work when it's in the modal)
    Template.map.rendered = function() {
      //add the assetmap element to our map objects
      assetMap = L.map('assetmap')

      //We want to wait until the modal is drawn before setting the map
      $('#assetModal').on('shown.bs.modal', function (e) {

          //Invalidate the map size when the modal is shown
          assetMap.invalidateSize();
        
          //Setup the map
          assetMap.setView(Session.get("assetModalLatLong"), Session.get("assetModalDefZoom"));

          //Setup the marker
          var marker = L.marker(Session.get("assetModalLatLong")).addTo(assetMap);

          //add a tileset
          L.tileLayer.provider('Acetate.all').addTo(assetMap);

      }) //end modal onshown
    }
    
    Template.assetModal.helpers({
      buildAssetValues: function() {
        //set an internal variable to the Modal data context
        var modalContext = Session.get("modalContext");
        
        //create an array of the values
        var modalAssetValues = _.values(modalContext);
        
        //demoing other field names
//        var modalAssetKeys = ["name","type", "customer", "ID", "a thing", "birthday", "blood", "phone number", "stuff", "things", "phone OS", "loves", "cats owned", "cats loved", "hamburgers", "dogs", "three numbers", "other numbers", "married", "id"]
        
        //create an array of the keys
        var modalAssetKeys = _.keys(modalContext);
        
        //zip the two arrays
        var modalZippedArray = _.zip(modalAssetKeys,modalAssetValues)
        
        //create a new array to store paired valued in
        var modalPairedArray = [];
            
        //establish a variable for the for loop that will step through each array value
        var doublestep = 0
        
        //for loop to run through the arrays. It runs half as many times as we have values.
        //the loop is running one less time to trim date created and _id from attributes
        for(i=0; i <= (_.size(modalAssetValues)/2)-2; i++){

          modalPairedArray[i] = [modalZippedArray[doublestep],modalZippedArray[doublestep+1]]
          
          doublestep = doublestep + 2;          
        }
        
        //return the whole array back to the asset modal to be stepped through
        return modalPairedArray;
      },
      assetModalContext: function() {
        //Set the modal Context to our passed modalContext
        return Tasks.findOne(Session.get("modalContext"));
      }
    });

  
    Template.sitewrapper.helpers({
        tasks: function () {
            //Grabbing changes to the findQry object
          Session.set("toPass", Session.get("findQry"));

          //Get a count of the found assets
          Session.set("assetsFound", Tasks.find(Session.get("toPass")).count());

          //get a count of the total assets
          Session.set("totalAssets", Tasks.find().count());

          //return our found objects to the body template
          return Tasks.find({ $or: [ { "pinned": 1 }, Session.get("toPass") ] }, {sort: {idDevice: 1}});

          //FOR LATER! Limit and sort
          //Filter out total collection: ({}, {limit: 30, sort: {idDevice: 1}}
      },
        fieldChooser: function () {
            // We are passing this to the search bar dropdown
            return Session.get("fieldChooserName");
        },
        assetsFound: function () {
          return Session.get("assetsFound");
        },
        totalAssets: function () {
          return Session.get("totalAssets");
        }
    });
  
    Template.sitewrapper.events({
      'click .phoneTool': function (e) {
        e.preventDefault();
        Meteor.call('sendSMS',this.smsNbr,twilioSendNbr,"testing!");
      },
      
      'click .ddField': function (e) {
        //prevent defaults
        e.preventDefault();
        
        //set iFie variable to <a> id. Link should have an ID of the field we want to pull
        var iFie = e.target.id;
        
        //set iFiePlainTxt to <a> text. Link should have plain text title innerHTML
        var iFiePlainTxt = e.target.text
        
        //set filterField variable to iFie. filterfield is used in body helper collection filter object
        Session.set("filterField", iFie);
        
        //set fieldChooserName to iFiePlainTxt. fieldChooserName is read by field chooser templat helper to set dropdown value.
        Session.set("fieldChooserName", iFiePlainTxt);
      },
      
      'click #hamburger': function () {
      },
      
      'submit .search, click #searchAddOnButton': function (e) {
        //search functionality goes here!
        e.preventDefault();
        
        //grab the value from the search input bar
        var rawVal = $('#searchInputBar')[0].value;
        
        var iVal = "";
        
        //We need to see if it's not a number so we know how to pass it. If it is pass as number.
        if (isNaN(rawVal)) {
          iVal = rawVal
        } else {
          iVal = Number(rawVal);
        }
        
        //Pass the value to the filter value variable
        Session.set("filterValue", iVal);
        
        //Create an empty object
        var buildObj = {};

        //Pass in field and value variables
        buildObj[Session.get("filterField")] = Session.get("filterValue");
        
        //We will pass this out to findQry
        Session.set("findQry", buildObj);
        
      },
      
      'click #oneDayNoComm': function (e) {
          //prevent defaults so we don't navigate away
          e.preventDefault();

          //creating a date object for 24 hours in the past for the qry object. It's easier for me to have this outside of the object declaration until I can get Moments setup
          //NOTE: it's set to 30 days ago since the data is old
          var previousDate = new Date(new Date().getTime() - (2020 * 60 * 60 * 1000));
        
          //setup an object with our static criteria
          var qry = {"lastIdEventCode" : { $ne: 976}, "lastCommunication" : {$lte:  previousDate}};
        
          //Pass the object into our findQry to filter results
          Session.set("findQry", qry);
      },
      
      'click .expandTools': function (e) {
        //Code for the expand toolbar button
        //swap classes on the #toolbar
        $('#toolbar').toggleClass('toolsbarcol');
        $('#toolbar').toggleClass('toolsbarexp');
        
        //swap between two classes on the .toolsbtn class
        if($('.toolsbtn').attr('class') === "toolsbtn expmenuhidden"){
          $('.toolsbtn').attr('class',"toolsbtn expmenutxt");
        } else {
          $('.toolsbtn').attr('class',"toolsbtn expmenuhidden");
        }
      },
      
      'click .expbtnstyle': function (e) {
        //Code for the tool button sub-menus
        //swap classes on the #toolbarsub
        $('#toolbarsub').toggleClass('toolsbarsubexp');
        $('#toolbarsub').toggleClass('toolsbarsubcol');
      },
      
      'click .btnModal': function (e) {
          //Set the modalContext value to the selected object
            Session.set("modalContext", this);
        
          /////////when btnModal is pressed change our view/marker LatLongs
        
        
        ////////////////////////////////////////////
          //setup the latlong reference
//          var latLong = [41.4949425, -81.70586];
//          
//          //setup a zoom level
//          var zoom = 14;
//        
//          //We want to wait until the modal is drawn before setting the map
//          $('#assetModal').on('shown.bs.modal', function (e) {
//            
//              //Setup the map
//              assetMap.setView(Session.get("assetModalLatLong"), Session.get("assetModalDefZoom"));
//            
//              //Setup the marker
//              var marker = L.marker(latLong).addTo(assetMap);
//            
//              //add a tileset
//              L.tileLayer.provider('Acetate.all').addTo(assetMap);
//            
//          }) //end modal onshown
      }, //end click function
      
      'click .icohold': function (e) {
        //This needs moved to the expbtnstyle function. It's applying the style change when just clicking on the DIV as opposed to the button.
        //Set any other buttons to idle style
        $('.icohold').attr('class',"icohold icoidle");
        
        //Set the clicked icon to active style
        $(e)[0].currentTarget.className = "icohold icoactive";
      }
    });
}
