describe('Named Commands Sanity Tests', function () {
    var commands;
    var Commands;

    before(function (done) {
        if ("undefined" !== typeof define) {
            require(["Chronos.Commands"], function(_Commands) {
                Commands = _Commands;
                done();
            });
        }
        else {
            require("../../src/Commands")(done);
        }
    });
    beforeEach('Init ReqRes', function (done) {
        commands = new Commands.NamedCommands();
        done();
    });
    describe("check for global scope", function () {
        it("should not be polluted", function() {
            expect(window.Chronos).to.be.undefined;
        })
    });

    describe("check response", function () {
        var res;
        it("should respond with 1", function () {
            var cmdId = commands.comply({
                cmdName: 'get',
                func: function () {
                    return 1;
                }
            });

            res = commands.command({
                cmdName: 'get',
                data: {}
            });
            expect(cmdId).not.to.be.null;
            expect(res).to.be.true;
        });
    });

    describe("check double comply to same command", function () {

        it("not accept a second comply", function () {
            var cmdId = commands.comply({
                cmdName: 'get',
                func: function () {
                    return 1;
                }
            });

            var cmdId2 = commands.comply({
                cmdName: 'get',
                func: function () {
                    return 1;
                }
            });
            expect(cmdId).not.to.be.null;
            expect(cmdId2).to.be.null;
        });
    });

    describe("check stopComply of command by command Id", function () {

        it("should unbind correctly", function () {
            function callback() {
                return 1;
            }

            var reqId = commands.comply({
                cmdName: 'get',
                func: callback
            });

            var res = commands.command({
                cmdName: 'get',
                data: {}
            });

            expect(res).to.be.true;

            var stopRes = commands.stopComplying(reqId);

            expect(stopRes).to.be.true;

            res = commands.command({
                cmdName: 'get',
                data: {}
            });

            expect(res).to.be.false;
        });
    });

    describe("check command with no listeners", function () {

        it("should return undefined", function () {
            var res = commands.command({
                cmdName: 'get',
                data: {}
            });

            expect(res).to.be.false;
        });
    });

    describe("force error when commanding * in cmdName", function () {

        it("should throw an error", function () {

            var res = commands.command({
                cmdName: '*',
                data: {}
            });


            expect(res).to.be.null;
        });
    });

    describe("force error when commanding * in app name", function () {

        it("should throw an error", function () {
            var res = commands.command({
                appName: '*',
                cmdName: 'sdg',
                data: {}
            });

            expect(res).to.be.null;
        });
    });

    describe("check comply to * in app name", function () {

        it("should throw an error", function () {
            var res = commands.comply({
                appName: '*',
                cmdName: 'sdg',
                data: {}
            });

            expect(res).to.be.null;
        });
    });

    describe("check comply to * in req name", function () {

        it("should throw an error", function () {
            var res = commands.comply({
                cmdName: '*',
                data: {}
            });

            expect(res).to.be.null;
        });
    });

    describe("Two commands instances hold their own data", function () {

        it("should hold different events", function () {

            var commands1 = new Commands.NamedCommands("cm111");

            commands1.comply({
                cmdName: 'ev1',
                func: function () {
                }
            });
            commands1.command({
                appName: 'cm111',
                cmdName: 'ev1'
            });

            expect(commands1.hasFired('ev1').length).to.equal(1);

            var commands2 = new Commands.NamedCommands("cm222");
            expect(commands2.hasFired('ev1').length).to.equal(0);
        });

    });

    describe("Test for async usage of commands", function () {

        it("should hold different events", function (done) {
            commands.comply({
                cmdName: 'ev1',
                func: function (data, cb) {
                    setTimeout(function() {
                        cb();
                    }, 20);
                    return 1;
                }
            });
            var res = commands.command({
                cmdName: 'ev1'
            }, function () {
                expect(true).to.be.ok;
                done();
            });

            expect(commands.hasFired('ev1').length).to.equal(1);

            expect(res).to.be.true;
        });
    });

    describe("Change bufferLimit default", function () {

        it("should catch the change and act accordingly", function () {
            var commands2 = new Commands.NamedCommands({
                eventBufferLimit: 1
            });
            commands2.comply({
                cmdName: 'ev1',
                func: function () {}
            });
            commands2.command({cmdName: 'ev1'});

            expect(commands2.hasFired('ev1').length).to.equal(1);

            commands2.command({cmdName: 'ev1'});

            expect(commands2.hasFired( 'ev1').length).to.equal(1);
        });
    });

    describe("Change cloneEventData default", function () {

        it("should catch the change and act accordingly", function () {
            var data = {
                item: "whatever"
            };
            var innerData;
            var commands2 = new Commands({
                cloneEventData: true
            });
            commands2.comply({
                cmdName: 'ev1',
                func: function (data) {
                    innerData = data;
                }
            });
            commands2.command({cmdName: 'ev1', data: data});

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
            commands.comply({
                cmdName: 'ev1',
                func: function (data) {
                    innerData = data;
                }
            });
            commands.command({ cmdName: 'ev1', data: data});

            expect(innerData).to.exist;
            expect(data).to.equal(innerData);
        });

    });

    describe("command with failed compliant", function () {

        var counter = 0;

        it("should work, despite  failure in registered function", function () {

            commands.comply({
                cmdName: 'cmdTest',
                func: function () {
                    throw new Error('Force error');
                    counter++;
                }
            });

            var res = commands.command({
                cmdName: 'cmdTest'
            });
            expect(counter).to.equal(0);
            expect(res).to.be.true;
        });

    });

    describe("Check calling callback with error", function () {

        it("should call the callback with error", function () {
            var called = false;

            var data = {
                item: "whatever"
            };
            var id = commands.comply({
                cmdName: 'ev1',
                func: function (data) {
                    throw new Error("YES!");
                }
            });

            expect(id).to.exist;

            var res = commands.command({cmdName: 'ev1', data: data}, function (err) {
                called = true;
                expect(err).to.exist;
                expect(err.message).to.equal("YES!");
            });

            expect(res).to.be.true;
            expect(called).to.be.true;
        });

    });

    describe("Check calling callback with error and the callback itself throws error", function () {

        it("should call the callback with error and fail", function () {
            var called = false;

            var data = {
                item: "whatever"
            };
            var id = commands.comply({
                cmdName: 'ev1',
                func: function (data) {
                    throw new Error("YES!");
                }
            });

            expect(id).to.exist;

            var res = commands.command({cmdName: 'ev1', data: data}, function (err) {
                called = true;
                expect(err).to.exist;
                expect(err.message).to.equal("YES!");
                throw new Error("STAM");
            });

            expect(res).to.be.true;
            expect(called).to.be.true;
        });

    });

});
