describe("Events Sanity Tests", function () {
    var events;
    var Events;

    before(function (done) {
        if ("undefined" !== typeof define) {
            require(["Chronos.Events"], function (_Events) {
                Events = _Events;
                done();
            });
        }
        else {
            require("../../src/Events")(done);
        }
    });
    beforeEach("Init Events", function (done) {
        events = new Events();
        done();
    });

    describe("check for global scope", function () {
        it("should not be polluted", function () {
            expect(window.Chronos).to.be.undefined;
        })
    });

    describe("check cannot trigger without event name", function () {

        var count = 0;
        it("should not trigger the event", function () {
            var len = events.bind("*", "ev1", function () {
                count++
            });

            expect(len).to.be.defined;
            var ret = events.trigger("app1");
            expect(ret).to.be.null;
            expect(count).to.equal(0);

        });
    });

    describe("check param \"ev\" is valid", function () {

        it("should not bind to event", function () {
            var len = events.bind("*", "", function () {
            });
            expect(len).to.be.null;
        });
    });

//-----------------------------------------------------------------------------------------------------------------

    describe("check param \"fn\"  can not be null", function () {

        it("should not bind to event", function () {
            var len = events.bind("*", "evTest", null);
            expect(len).to.be.null;
        });

    });

//-----------------------------------------------------------------------------------------------------------------

    describe("check param \"fn\"  is function reference", function () {
        it("should not bind to event", function () {
            var len = events.bind("*", "evTest", "fn() {}");
            expect(len).to.be.null;
        });

    });

//-----------------------------------------------------------------------------------------------------------------

    describe("check valid unbind", function () {

        it("should unbind from event", function () {
            var ev = events.bind("*", "evTest", function () {
            });
            var unbind = events.unbind(ev);
            expect(unbind).to.be.true;
        });
    });

//-----------------------------------------------------------------------------------------------------------------

    describe("check invalid unbind", function () {

        it("should unbind from event", function () {
            var unbind = events.unbind(false);
            expect(unbind).to.be.null;
            unbind = events.unbind("evTest");
            expect(unbind).to.be.false;
        });
    });

//-----------------------------------------------------------------------------------------------------------------

    describe("bind work", function () {
        var evList = [];

        it("should bind to event", function () {

            evList.push(events.bind("*", "evTest", function () {
            }));
            evList.push(events.bind("app1", "evTest1", function () {
            }));
            evList.push(events.bind("app2", "evTest2", function () {
            }));
            expect(evList.length).to.equal(3);
        });

        after(function () {
            unbindEvents(evList);
        });

    });

//-----------------------------------------------------------------------------------------------------------------


    describe("trigger work", function (done) {

        var obj = {x: 0};
        var evList = [];

        it("should trigger the event", function () {

            evList.push(events.bind("app1", "evTest1", function (obj) {
                obj.x += 1;
            }));
            evList.push(events.bind("app2", "evTest2", function (obj) {
                obj.x += 1;
            }));
            evList.push(events.bind("*", "*", function (obj) {
                obj.x += 1;
            }));
            events.trigger("app1", "evTest1", obj);

            expect(obj.x).to.equal(2);
        });

        after(function () {
            unbindEvents(evList);
        });

    });

//-----------------------------------------------------------------------------------------------------------------

    describe("trigger work, despite  failure in one registered function", function () {

        var obj = {x: 0};
        var evList = [];

        it("should trigger the event", function () {

            evList.push(events.bind("*", "evTest", function (obj) {
                t.y += 1;
                obj.x += 1;
            }));
            evList.push(events.bind("*", "evTest1", function (obj) {
                obj.x += 1;
            }));

            events.trigger("*", "evTest", obj);
            events.trigger("*", "evTest1", obj);
            expect(obj.x).to.equal(1);
        });

        after(function () {
            unbindEvents(evList);
        });

    });

//-----------------------------------------------------------------------------------------------------------------

    describe("hasFired  work for non bind functions", function () {

        it("should return the fired events", function () {

            events.trigger("app1", "ev1");
            var t = events.hasFired("app1", "ev1");
            expect(t.length).to.equal(1);
        });
    });

//-----------------------------------------------------------------------------------------------------------------

    describe("hasFired  work for all bind functions", function () {

        var evList = [];

        it("should return the fired events", function () {

            evList.push(events.bind("*", "evTF", function () {
            }));
            evList.push(events.bind("appTF1", "evTF", function () {
            }));
            evList.push(events.bind("appTF1", "*", function () {
            }));

            events.trigger("appTF1", "evTF");

            var t = events.hasFired("appTF1", "evTF");
            expect(t.length).to.equal(1);

            t = events.hasFired("*", "evTF");
            expect(t.length).to.equal(1);

            t = events.hasFired("appTF1", "*");
            expect(t.length).to.equal(1);
        });

        after(function () {
            unbindEvents(evList);
        });
    });

    describe("Two events instances hold their own data", function () {

        it("should not interfere with each other", function () {
            events.bind("app1", "ev1", function () {
            });


            var events2 = new Events();
            events2.bind("app1", "ev1", function () {
            });

            events.trigger("app1", "ev1");

            expect(events2.hasFired("app1", "ev1").length).to.equal(0);
            expect(events.hasFired("app1", "ev1").length).to.equal(1);
        });

    });

    describe("check once works", function () {

        it("should only fire once - object", function () {

            var counter = 0;

            var id = events.once({
                appName: "app1",
                eventName: "ev1",
                func: function () {
                    counter++;
                }
            });
            expect(id).to.not.be.null;
            events.trigger("app1", "ev1");

            expect(events.hasFired("app1", "ev1").length).to.equal(1);
            expect(counter).to.equal(1);

            events.trigger("app1", "ev1");

            expect(events.hasFired("app1", "ev1").length).to.equal(2);
            expect(counter).to.equal(1);

        });

        it("should only fire once - pars", function () {

            var counter = 0;

            var id = events.once("app1", "ev2",
                function () {
                    counter++;
                });

            expect(id).to.not.be.null;
            events.trigger("app1", "ev2");

            expect(events.hasFired("app1", "ev2").length).to.equal(1);
            expect(counter).to.equal(1);

            events.trigger("app1", "ev2");

            expect(events.hasFired("app1", "ev2").length).to.equal(2);
            expect(counter).to.equal(1);

        });
    });

    describe("check once fails", function () {

        var counter = 0;

        it("should return null", function () {
            var res = events.once();

            expect(res).to.be.null;

        });
    });

    describe("check unbind by context works", function () {

        var counter = 0;
        var counter2 = 0;

        it("should unbind all events by context", function () {
            events.bind({
                appName: "app1",
                eventName: "ev1",
                func: function () {
                    counter++;
                },
                context: this
            });

            events.bind({
                appName: "app2",
                eventName: "ev2",
                func: function () {
                    counter2++;
                },
                context: this
            });

            events.trigger("app1", "ev1");
            events.trigger("app2", "ev2");

            expect(events.hasFired("app1", "ev1").length).to.equal(1);
            expect(counter).to.equal(1);

            expect(events.hasFired("app2", "ev2").length).to.equal(1);
            expect(counter2).to.equal(1);

            events.unbind({context: this});

            events.trigger("app1", "ev1");
            events.trigger("app2", "ev2");

            expect(counter).to.equal(1);

            expect(counter2).to.equal(1);

        });
    });

    describe("Change bufferLimit default", function () {

        it("should catch the change and act accordingly", function () {
            var events2 = new Events({
                eventBufferLimit: 1
            });
            events2.bind({
                appName: "app1",
                eventName: "ev1",
                func: function () {
                }
            });
            events2.trigger("app1", "ev1");

            expect(events2.hasFired("app1", "ev1").length).to.equal(1);

            events2.trigger("app1", "ev1");

            expect(events2.hasFired("app1", "ev1").length).to.equal(1);
        });

    });

    describe("Change cloneEventData default", function () {

        it("should catch the change and act accordingly", function () {
            var data = {
                item: "whatever"
            };
            var innerData;
            var events2 = new Events({
                cloneEventData: true
            });
            events2.bind({
                appName: "app1",
                eventName: "ev1",
                func: function (data) {
                    innerData = data;
                }
            });
            events2.trigger("app1", "ev1", data);
            expect(innerData).to.exist;
            expect(data).to.not.equal(innerData);
        });

    });

    describe("Check not cloning data by default", function () {

        it("should see that data is the same", function () {
            var data = {
                item: "whatever"
            };
            var innerData;
            events.bind({
                appName: "app1",
                eventName: "ev1",
                func: function (data) {
                    innerData = data;
                }
            });
            events.trigger("app1", "ev1", data);
            expect(innerData).to.exist;
            expect(data).to.equal(innerData);
        });

    });

    describe("Check async by trigger", function () {

        it("should fire the event async", function (done) {
            var fired = false;
            events.bind({
                appName: "app1",
                eventName: "ev1",
                func: function (data) {
                    fired = true;
                    expect(fired).to.be.true;
                    done();
                }
            });
            events.trigger({
                appName: "app1",
                eventName: "ev1",
                aSync: true
            });

            expect(fired).to.be.false;
        });

    });

    describe("Check async by bind", function () {

        it("should fire the event async", function (done) {
            var fired = false;
            events.bind({
                appName: "app1",
                eventName: "ev1",
                aSync: true,
                func: function (data) {
                    fired = true;
                    done();
                }
            });
            events.trigger({
                appName: "app1",
                eventName: "ev1"
            });

            expect(fired).to.be.false;
        });

    });

    describe("Check sync on trigger after async bind", function () {

        it("should fire the event synchronously", function () {

            var fired = false;

            events.bind({
                appName: "app1",
                eventName: "ev1",
                aSync: true,
                func: function (data) {
                    fired = true;
                }
            });

            events.trigger({
                appName: "app1",
                eventName: "ev1",
                aSync: false
            });

            expect(fired).to.be.true;
        });
    });

    describe("trigger with multiple binds", function () {

        it("should trigger all functions", function () {
            var counter = 0;
            var firstCalled = false;
            var secondCalled = false;
            var thirdCalled = false;
            events.bind({
                appName: "app1",
                eventName: "ev1",
                func: [
                    function () {
                        firstCalled = true;
                        counter++;
                    },
                    function () {
                        secondCalled = true;
                        counter++;
                    },
                    function () {
                        thirdCalled = true;
                        counter++;
                    }
                ]
            });
            events.trigger({
                appName: "app1",
                eventName: "ev1"
            });

            expect(counter).to.equal(3);
            expect(firstCalled).to.be.true;
            expect(secondCalled).to.be.true;
            expect(thirdCalled).to.be.true;
        });

    });

    describe("unbind by event name when no bind", function () {

        it("should return false", function () {

            var ret = events.unbind({
                appName: "app1",
                eventName: "ev1"
            });

            expect(ret).to.be.false;
        });

    });

    describe("bind to *", function () {
        var obj = {x: 0};
        var evList = [];

        it("should trigger the event", function () {

            evList.push(events.bind("*", "*", function (obj) {
                obj.x += 1;
            }));
            events.trigger("app1", "evTest1", obj);

            expect(obj.x).to.equal(1);
        });

        after(function () {
            unbindEvents(evList);
        });

    });

    describe("named events", function () {

        var appName = "NamedEvents";
        var obj = {x: 0, y: 0, z: 0};
        var evList = [];
        var namedEvents;

        before(function () { //if events init doesnt happen inside the before fn then the tests of this context arent executed - theyre simply ignored!
            namedEvents = new Events({appName: appName});
        });

        it("should trigger the events", function () {

            evList.push(namedEvents.bind({
                eventName: "*", func: function (obj) {
                    obj.x += 1;
                }
            }));
            evList.push(namedEvents.bind("*", function (obj) {
                obj.y += 1;
            }));
            evList.push(namedEvents.bind("evTest1", function (obj) {
                obj.z += 1;
            }));
            namedEvents.trigger({eventName: "evTest1", data: obj});
            namedEvents.trigger("evTest1", obj);
            namedEvents.trigger(appName, "evTest1", obj);

            expect(obj.x).to.equal(3);
            expect(obj.y).to.equal(3);
            expect(obj.z).to.equal(3);
        });

        it("should trigger only once", function () {

            var cntr = 0;

            namedEvents.once("evTestOnce", function () {
                cntr += 1;
            });

            namedEvents.trigger("evTestOnce");
            namedEvents.trigger("evTestOnce");

            expect(cntr).to.equal(1);
        });

        it("should trigger when using the app name in the trigger", function () {

            var cntr = 0;

            namedEvents.bind("evTestI", function () {
                cntr += 1;
            });

            namedEvents.trigger(appName, "evTestI");
            namedEvents.trigger("not the right app name", "evTestI");

            expect(cntr).to.equal(1);
        });

        it("should trigger when using simple pars without appName", function () {

            var cntr = 0;

            namedEvents.bind("evTestII", function () {
                cntr += 1;
            });

            namedEvents.trigger("evTestII");

            expect(cntr).to.equal(1);
        });

        it("should asynchronously trigger event even while default is sync=true", function (done) {
            var triggered = false;
            namedEvents.on("nonSyncBind", function () {
                triggered = true;
                done();
            });

            namedEvents.trigger({eventName: "nonSyncBind", async: true});

            expect(triggered).to.be.false;
        });
    });

    describe("check async as default", function () {

        var testEvents;

        before(function () { //if events init doesnt happen inside the before fn then the tests of this context arent executed - theyre simply ignored!
            testEvents = new Events({appName: "async test", async: true});
        });

        it("should trigger async using default", function (done) {
            var triggered = false;

            testEvents.on("nonSyncBind", function () {
                triggered = true;
                done();
            });

            testEvents.trigger({eventName: "nonSyncBind"});

            expect(triggered).to.be.false;
        });

        it("should trigger sync based on trigger config", function () {
            var triggered = false;

            testEvents.on("syncedBind", function () {
                triggered = true;
                done();
            });

            testEvents.trigger({eventName: "syncedBind", async: false, data: "some data"});

            expect(triggered).to.be.true;
        });

        it("should trigger sync based on bind config", function(){
            var triggered = false;

            testEvents.on({eventName: "syncedBind", async: false, func: function () {
                triggered = true;
                done();
            }});

            testEvents.trigger({eventName: "syncedBind", data: "some data"});

            expect(triggered).to.be.true;
        });
    });

    function unbindEvents(evList) {
        for (var i = 0; i < evList.length; i++) {
            events.unbind(evList[i]);
        }
    }
});
