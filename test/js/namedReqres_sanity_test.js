describe('Named ReqRes Sanity Tests', function () {
    var reqres;
    var ReqRes;

    before(function (done) {
        if ("undefined" !== typeof define) {
            require(["Chronos.Reqres"], function(Reqres) {
                ReqRes = Reqres;
                done();
            });
        }
        else {
            require("../../src/Reqres")(done);
        }
    });
    beforeEach('Init ReqRes', function (done) {
        reqres = new ReqRes.NamedReqRes();
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
            var cmdId = reqres.reply({
                reqName: 'get',
                func: function () {
                    return 1;
                }
            });

            res = reqres.request({
                reqName: 'get',
                data: {}
            });
            expect(cmdId).not.to.be.null;
            expect(res).to.equal(1);
        });
    });

    describe("check double reply to same command", function () {

        it("not accept a second reply", function () {
            var cmdId = reqres.reply({
                reqName: 'get',
                func: function () {
                    return 1;
                }
            });

            var cmdId2 = reqres.reply({
                reqName: 'get',
                func: function () {
                    return 1;
                }
            });
            expect(cmdId).not.to.be.null;
            expect(cmdId2).to.be.null;
        });
    });

    describe("check stopReply by request obj", function(){

        it("should unbind correctly", function(){
            function callback() {
                return 1;
            }

            var reqId = reqres.reply({
                reqName: 'get',
                func: callback
            });

            var res = reqres.request({
                reqName: 'get',
                data: {}
            });

            expect(res).to.equal(1);

            var stopRes = reqres.stopReplying({reqName: "get"});

            expect(stopRes).to.be.true;

            res = reqres.request({
                reqName: 'get',
                data: {}
            });

            expect(res).to.be.undefined;
        });
    });

    describe("check stopReply of command by request Id", function () {

        it("should unbind correctly", function () {
            function callback() {
                return 1;
            }

            var reqId = reqres.reply({
                reqName: 'get',
                func: callback
            });

            var res = reqres.request({
                reqName: 'get',
                data: {}
            });

            expect(res).to.equal(1);

            var stopRes = reqres.stopReplying(reqId);

            expect(stopRes).to.be.true;

            res = reqres.request({
                reqName: 'get',
                data: {}
            });

            expect(res).to.be.undefined;
        });
    });

    describe("check request with no listeners", function () {

        it("should return undefined", function () {
            var res = reqres.request({
                reqName: 'get',
                data: {}
            });

            expect(res).to.be.undefined;
        });
    });

    describe("force error when requesting * in reqName", function () {

        it("should throw an error", function () {
            function fn() {
                reqres.request({
                    reqName: '*',
                    data: {}
                });
            }

            expect(fn).to.throw(Error, /Invalid request/);
        });
    });

    describe("force error when requesting * in app name", function () {

        it("should throw an error", function () {
            function fn() {
                reqres.request({
                    appName: '*',
                    reqName: 'sdg',
                    data: {}
                });
            }

            expect(fn).to.throw(Error, /Invalid request/);
        });
    });

    describe("check reply different app name than request", function(){

        it("should reply", function(){
            var reqId = reqres.reply({
                reqName: 'get',
                func: function(){return "foo";}
            });

            var res = reqres.request({
                appName: 'app2',
                reqName: 'get',
                data: {}
            });

            expect(res).to.not.exist;
        });
    });

    describe("check reply to * in app name", function () {

        it("should throw an error", function () {
            var res = reqres.reply({
                appName: '*',
                reqName: 'sdg',
                data: {}
            });

            expect(res).to.be.null;
        });
    });

    describe("check reply to * in req name", function () {

        it("should throw an error", function () {
            var res = reqres.reply({
                reqName: '*',
                data: {}
            });

            expect(res).to.be.null;
        });
    });

    describe("Two reqres instances hold their own data", function () {

        it("should hold different events", function () {

            var reqres1 = new ReqRes.NamedReqRes("rr111");

            reqres1.reply({
                reqName: 'ev1',
                func: function () {
                }
            });
            reqres1.request({
                appName: "rr111",
                reqName: 'ev1'
            });

            expect(reqres1.hasFired('ev1').length).to.equal(1);

            var reqres2 = new ReqRes.NamedReqRes("rr222");
            expect(reqres2.hasFired('ev1').length).to.equal(0);
        });
    });

    describe("Test for async usage of reqres", function () {

        it("should return and call the callback", function (done) {
            reqres.reply({
                reqName: 'ev1',
                func: function (data, cb) {
                    setTimeout(function() {
                        cb(2);
                    }, 20);
                    return 1;
                }
            });
            var res = reqres.request({
                reqName: 'ev1'
            }, function (result) {
                expect(result).to.equal(2);
                done();
            });

            expect(reqres.hasFired('ev1').length).to.equal(1);

            expect(res).to.equal(1);
        });
    });

    describe("Change bufferLimit default", function () {

        it("should catch the change and act accordingly", function () {
            var reqres2 = new ReqRes.NamedReqRes({
                eventBufferLimit: 1
            });
            reqres2.reply({
                reqName: 'ev1',
                func: function () {}
            });
            reqres2.request({reqName: 'ev1'});

            expect(reqres2.hasFired('ev1').length).to.equal(1);

            reqres2.request({reqName: 'ev1'});

            expect(reqres2.hasFired('ev1').length).to.equal(1);
        });

    });

    describe("Change cloneEventData default", function () {

        it("should catch the change and act accordingly", function () {
            var data = {
                item: "whatever"
            };
            var innerData;
            var reqres2 = new ReqRes.NamedReqRes({
                cloneEventData: true
            });
            reqres2.reply({
                reqName: 'ev1',
                func: function (data) {
                    innerData = data;
                }
            });
            reqres2.request({reqName: 'ev1', data: data});

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
            reqres.reply({
                reqName: 'ev1',
                func: function (data) {
                    innerData = data;
                }
            });
            reqres.request({reqName: 'ev1', data: data});

            expect(innerData).to.exist;
            expect(data).to.equal(innerData);
        });

    });


    describe("request with failed replier", function () {

        var counter = 0;

        it("should work, despite  failure in registered function", function () {

            reqres.reply({
                reqName: 'reqTest',
                func: function () {
                    throw new Error('Force error');
                    counter++;
                }
            });

            var res = reqres.request({
                reqName: 'reqTest'
            });
            expect(counter).to.equal(0);
            expect(res).to.be.undefined;
        });

    });

    describe("Check calling callback with error", function () {

        it("should call the callback with error", function () {
            var called = false;

            var data = {
                item: "whatever"
            };
            var id = reqres.reply({
                reqName: 'ev1',
                func: function (data) {
                    throw new Error("YES!");
                }
            });

            expect(id).to.exist;

            var res = reqres.request({ reqName: 'ev1', data: data}, function (err, data) {
                called = true;
                expect(data).to.be.undefined;
                expect(err).to.exist;
                expect(err.message).to.equal("YES!");
            });

            expect(res).to.be.undefined;
            expect(called).to.be.true;
        });

    });

    describe("Check calling callback with error and the callback itself throws error", function () {

        it("should call the callback with error and fail", function () {
            var called = false;

            var data = {
                item: "whatever"
            };
            var id = reqres.reply({
                reqName: 'ev1',
                func: function (data) {
                    throw new Error("YES!");
                }
            });

            expect(id).to.exist;

            var res = reqres.request({ reqName: 'ev1', data: data}, function (err, data) {
                called = true;
                expect(data).to.be.undefined;
                expect(err).to.exist;
                expect(err.message).to.equal("YES!");
                throw new Error("STAM");
            });

            expect(res).to.be.undefined;
            expect(called).to.be.true;
        });

    });
});
