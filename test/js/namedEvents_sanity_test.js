describe("NamedEvents Sanity Tests", function () {
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

    beforeEach('Init Events', function () {
        events = new Events.NamedEvents();
    });

    it("named events should be init", function () {
        expect(events).to.exist;
    });

    describe("check cannot trigger without event name", function () {

        var count = 0;
        it("should not trigger the event", function () {
            var len = events.bind('ev1', function () {
                count++
            });

            expect(len).to.be.defined;
            var ret = events.trigger();
            expect(ret).to.be.null;
            expect(count).to.equal(0);

        });
    });

    describe("check param 'ev' is valid", function () {

        it("should not bind to event", function () {
            var len = events.bind('*', '', function () {
            });
            expect(len).to.be.null;
        });
    });

//-----------------------------------------------------------------------------------------------------------------

    describe("check param 'fn'  can not be null", function () {

        it("should not bind to event", function () {
            var len = events.bind('*', 'evTest', null);
            expect(len).to.be.null;
        });

    });

//-----------------------------------------------------------------------------------------------------------------

    describe("check param 'fn'  is function reference", function () {
        it("should not bind to event", function () {
            var len = events.bind('*', 'evTest', 'fn() {}');
            expect(len).to.be.null;
        });

    });

//-----------------------------------------------------------------------------------------------------------------

    describe("check valid unbind", function () {

        it("should unbind from event", function () {
            var ev = events.bind('evTest', function () {
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

        afterEach(function () {
            unbindEvents(evList);
        });

        it("should bind to event - object form", function () {

            evList.push(events.bind({
                eventName: 'evTest', func: function () {
                }
            }));

            evList.push(events.bind({
                eventName: 'evTest1', func: function () {
                }
            }));

            evList.push(events.bind({
                eventName: 'evTest2', func: function () {
                }
            }));

            expect(evList.length).to.equal(3);
        });

        it("should bind to event - pars form", function () {

            evList.push(events.bind('evTest', function () {
            }));

            evList.push(events.bind('evTest1', function () {
            }));
            evList.push(events.bind('evTest2', function () {
            }));
            expect(evList.length).to.equal(3);
        });
    });

//-----------------------------------------------------------------------------------------------------------------

    describe("trigger work", function (done) {

        var obj = {x: 0};
        var evList = [];

        beforeEach(function () {
            obj.x = 0;
        });

        afterEach(function () {
            unbindEvents(evList);
        });

        it("should trigger the event - object form", function () {

            evList.push(events.bind({
                eventName: "evTest1",
                func: function (obj) {
                    obj.x += 1;
                }
            }));

            evList.push(events.bind({
                eventName: "evTest2",
                func: function (obj) {
                    obj.x += 1;
                }
            }));

            evList.push(events.bind({
                eventName: "*",
                func: function (obj) {
                    obj.x += 1;
                }
            }));


            events.trigger('evTest1', obj);

            expect(obj.x).to.equal(2);
        });

        it("should trigger the event - pars form", function () {

            evList.push(events.bind('evTest1', function (obj) {
                obj.x += 1;
            }));
            evList.push(events.bind('evTest2', function (obj) {
                obj.x += 1;
            }));
            evList.push(events.bind('*', function (obj) {
                obj.x += 1;
            }));
            events.trigger('evTest1', obj);

            expect(obj.x).to.equal(2);
        });
    });

//-----------------------------------------------------------------------------------------------------------------

    describe("trigger work, despite  failure in one registered function", function () {

        var obj = {x: 0};
        var evList = [];

        it("should trigger the event", function () {

            evList.push(events.bind('evTest', function (obj) {
                t.y += 1;
                obj.x += 1;
            }));
            evList.push(events.bind('evTest1', function (obj) {
                obj.x += 1;
            }));

            events.trigger('evTest', obj);
            events.trigger('evTest1', obj);
            expect(obj.x).to.equal(1);
        });

        after(function () {
            unbindEvents(evList);
        });

    });
//-----------------------------------------------------------------------------------------------------------------

    describe("hasFired  work for non bind functions", function () {

        it("should return the fired events", function () {

            events.trigger('ev1');
            var t = events.hasFired('ev1');
            expect(t.length).to.equal(1);
        });
    });

//-----------------------------------------------------------------------------------------------------------------

    describe("hasFired  work for all bind functions", function () {

        var evList = [];

        it("should return the fired events", function () {

            evList.push(events.bind('evTF', function () {
            }));
            evList.push(events.bind('evTF', function () {
            }));
            evList.push(events.bind('*', function () {
            }));

            events.trigger('evTF');

            var t = events.hasFired('evTF');
            expect(t.length).to.equal(1);

            t = events.hasFired('evTF');
            expect(t.length).to.equal(1);

            t = events.hasFired('*');
            expect(t.length).to.equal(1);
        });

        after(function () {
            unbindEvents(evList);
        });
    });

    describe("Two events instances hold their own data", function () {

        it("should not interfere with each other", function () {
            events.bind('ev1', function () {
            });
            events.trigger('ev1');

            expect(events.hasFired('ev1').length).to.equal(1);

            var events2 = new Events.NamedEvents();
            events2.bind('ev1', function () {
            });
            expect(events2.hasFired('ev1').length).to.equal(0);
        });

    });

    describe("check once works", function () {

        var counter = 0;

        beforeEach(function () {
            counter = 0;
        });

        it("should only fire once - object form", function () {
            var id = events.once({
                eventName: 'ev1',
                func: function () {
                    counter++;
                }
            });

            expect(id).to.not.be.null;
            events.trigger('ev1');

            expect(events.hasFired('ev1').length).to.equal(1);
            expect(counter).to.equal(1);

            events.trigger('ev1');

            expect(events.hasFired('ev1').length).to.equal(2);
            expect(counter).to.equal(1);

        });

        it("should only fire once - pars form", function () {
            var id = events.once('ev2', function () {
                counter++;
            });

            expect(id).to.not.be.null;
            events.trigger('ev2');

            expect(events.hasFired('ev2').length).to.equal(1);
            expect(counter).to.equal(1);

            events.trigger('ev2');

            expect(events.hasFired('ev2').length).to.equal(2);
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
                eventName: 'ev1',
                func: function () {
                    counter++;
                },
                context: this
            });

            events.bind({
                eventName: 'ev2',
                func: function () {
                    counter2++;
                },
                context: this
            });

            events.trigger('ev1');
            events.trigger('ev2');

            expect(events.hasFired('ev1').length).to.equal(1);
            expect(counter).to.equal(1);

            expect(events.hasFired('ev2').length).to.equal(1);
            expect(counter2).to.equal(1);

            events.unbind({context: this});

            events.trigger('ev1');
            events.trigger('ev2');

            expect(counter).to.equal(1);
            expect(counter2).to.equal(1);
        });
    });

    describe("Change bufferLimit default", function () {

        it("should catch the change and act accordingly", function () {
            var events2 = new Events.NamedEvents({
                eventBufferLimit: 1
            });

            events2.bind({
                eventName: 'ev1',
                func: function () {
                }
            });

            events2.trigger('ev1');

            expect(events2.hasFired( 'ev1').length).to.equal(1);
            events2.trigger('ev1');
            expect(events2.hasFired( 'ev1').length).to.equal(1);
        });

    });

    describe("Change cloneEventData default", function () {

        it("should catch the change and act accordingly", function () {
            var data = {
                item: "whatever"
            };
            var innerData;
            var events2 = new Events.NamedEvents({
                cloneEventData: true
            });
            events2.bind({
                eventName: 'ev1',
                func: function (data) {
                    innerData = data;
                }
            });
            events2.trigger('ev1', data);
            expect(innerData).to.exist;
            expect(data).to.not.equal(innerData);
        });

    });

    describe("trigger with multiple binds", function () {

        it("should trigger all functions", function () {
            var counter = 0;
            var firstCalled = false;
            var secondCalled = false;
            var thirdCalled = false;
            events.bind({
                eventName: 'ev1',
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
                eventName: 'ev1'
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
                eventName: 'ev1'
            });

            expect(ret).to.be.false;
        });

    });

    describe("bind to *", function () {
        var obj = {x: 0};
        var evList = [];

        it("should trigger the event", function () {

            evList.push(events.bind('*', function (obj) {
                obj.x += 1;
            }));

            events.trigger('evTest1', obj);

            expect(obj.x).to.equal(1);
        });

        after(function () {
            unbindEvents(evList);
        });

    });

    function unbindEvents(evList) {
        for (var i = 0; i < evList.length; i++) {
            events.unbind(evList[i]);
        }

        evList.splice(0);
    }
});
