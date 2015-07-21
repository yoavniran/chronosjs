describe("Channels Sanity Tests", function () {
    var channels;
    var Channels;

    before(function (done) {
        if ("undefined" !== typeof define) {
            require(["Chronos.Channels"], function(_Channels) {
                Channels = _Channels;
                done();
            });
        }
        else {
            require("../../src/Channels")(done);
        }
    });
    beforeEach("Init ReqRes", function (done) {
        channels = new Channels();
        done();
    });

    describe("check for global scope", function () {
        it("should not be polluted", function() {
            expect(window.Chronos).to.be.undefined;
        })
    });

    describe("check response", function () {

        it("should respond with 1", function () {

            var res;

            var cmdId = channels.reply({
                appName: "app",
                reqName: "get",
                func: function () {
                    return 1;
                }
            });

            res = channels.request({
                appName: "app",
                reqName: "get",
                data: {}
            });
            expect(cmdId).not.to.be.null;
            expect(res).to.equal(1);
        });
    });

    describe("check response on named channels", function () {

        var appName = "NamedChannel";
        var namedChannels;

        before(function () { //if channels init doesnt happen inside the before fn then the tests of this context arent executed - theyre simply ignored! wtf???
            namedChannels = new Channels({ appName: appName});
        });

        it("reqres should respond with 1", function () {

            var cntr = 0;
            var res;

            var reqId = namedChannels.reply({
                reqName: "get",
                func: function () {
                    cntr+=1;
                    return 1;
                }
            });

            res = namedChannels.request({
                appName: appName,
                reqName: "get",
                data: {}
            });

            namedChannels.request({
               appName: "not the right app name",
                reqName: "get",
                data: {}
            });

            expect(reqId).not.to.be.null;
            expect(res).to.equal(1);
            expect(cntr).to.equal(1);
        });

        it("events should trigger", function(){

            var cntr = 0;

            namedChannels.bind("evTestI", function () {
                cntr += 1;
            });

            namedChannels.trigger(appName, "evTestI");
            namedChannels.trigger("not the right app name", "evTestI");

            expect(cntr).to.equal(1);
        });

        it("commands should comply", function(){

            var cntr = 0;
            var res;

            var cmdId = namedChannels.comply({
                cmdName: "get",
                func: function () {
                    cntr+=1;
                    return 1;
                }
            });

            res = namedChannels.command({
                appName: appName,
                cmdName: "get",
                data: {}
            });

            namedChannels.command({
                appName: "not the right app name",
                cmdName: "get",
                data: {}
            });

            expect(cmdId).not.to.be.null;
            expect(res).to.be.true;
            expect(cntr).to.equal(1);

        });
    });

    describe("test channel with separate object options", function(){

        var namedChannels;

        before(function () { //if channels init doesnt happen inside the before fn then the tests of this context arent executed - theyre simply ignored!
            namedChannels = new Channels({
                appName: "namedChannel", //will not be used
                eventsOptions: {appName: "namedEvents"},
                commandsOptions: {appName: "namedCommands"},
                reqresOptions: {appName: "namedReqres"}
            });
        });

        it("channel events should work with provided app name",function(){

            var cntr = 0;

            namedChannels.bind("evTestI", function () {
                cntr += 1;
            });

            namedChannels.trigger("namedEvents", "evTestI");
            namedChannels.trigger("not the right app name", "evTestI");

            expect(cntr).to.equal(1);
        });

        it("channel reqres should work with provided app name", function () {

            var cntr = 0;
            var res;

            var reqId = namedChannels.reply({
                reqName: "get",
                func: function () {
                    cntr+=1;
                    return 1;
                }
            });

            res = namedChannels.request({
                appName: "namedReqres",
                reqName: "get",
                data: {}
            });

            namedChannels.request({
                appName: "not the right app name",
                reqName: "get",
                data: {}
            });

            expect(reqId).not.to.be.null;
            expect(res).to.equal(1);
            expect(cntr).to.equal(1);
        });

        it("channel commands should work with provided app name", function(){

            var cntr = 0;
            var res;

            var cmdId = namedChannels.comply({
                cmdName: "get",
                func: function () {
                    cntr+=1;
                    return 1;
                }
            });

            res = namedChannels.command({
                appName: "namedCommands",
                cmdName: "get",
                data: {}
            });

            namedChannels.command({
                appName: "not the right app name",
                cmdName: "get",
                data: {}
            });

            expect(cmdId).not.to.be.null;
            expect(res).to.be.true;
            expect(cntr).to.equal(1);

        });

    });
});
