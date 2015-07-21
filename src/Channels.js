// Just a very dumb proxy wrapper to unify
// all events mechanisms inside a single
// channel proxy wrapper
;(function (root, factory) {
    "use strict";
    /* istanbul ignore if  */
    //<amd>
    if ("function" === typeof define && define.amd) {
        // AMD. Register as an anonymous module.
        define("Chronos.Channels", ["Chronos.Events", "Chronos.Commands", "Chronos.Reqres"], function (Events, Commands, Reqres) {
            return factory(root, root, Events, Commands, Reqres, true);
        });
        return;
    }
    //</amd>
    /* istanbul ignore next  */
    if ("object" === typeof exports) {
        // CommonJS
        factory(root, exports, require("./Events"), require("./Commands"), require("./Reqres"));
    }
    /* istanbul ignore next  */
    else {
        /**
         * @depend ./Events.js
         * @depend ./Commands.js
         * @depend ./Reqres.js
         */
        // Browser globals
        root.Chronos = root.Chronos || {};
        factory(root, root.Chronos, root.Chronos.Events, root.Chronos.Commands, root.Chronos.ReqRes);
    }
}(typeof ChronosRoot === "undefined" ? this : ChronosRoot, function (root, exports, Events, Commands, ReqRes, hide) {
    "use strict";

    function Channels(options) {

        options = options || {};

        var appName = options.appName;

        initChannelEvents(this, options, appName);
        initChannelCommands(this, options, appName);
        initChannelReqRes(this, options, appName);
    }

    function initChannelEvents(channel, options, appName){

        options = options.eventsOptions || options;
        options.appName = options.appName || appName; //make it possible to set a name once for the channel's objects

        var events = options.events || new Events(options);

        channel.once = events.once;
        channel.hasFiredEvents = events.hasFired;
        channel.trigger = events.trigger;
        channel.publish = events.publish;
        channel.bind = events.bind;
        channel.register = events.register;
        channel.unbind = events.unbind;
        channel.unregister = events.unregister;
    }

    function initChannelCommands(channel, options, appName){

        options = options.commandsOptions || options;
        options.appName = options.appName || appName; //make it possible to set a name once for the channel's objects

        var commands = options.commands || new Commands(options);

        channel.hasFiredCommands = commands.hasFired;
        channel.comply = commands.comply;
        channel.stopComplying = commands.stopComplying;
        channel.command = commands.command;
    }

    function initChannelReqRes(channel, options, appName){

        options = options.reqresOptions || options;
        options.appName = options.appName || appName; //make it possible to set a name once for the channel's objects

        var reqres = options.reqres || new ReqRes(options);

        channel.hasFiredReqres = reqres.hasFired;
        channel.request = reqres.request;
        channel.reply = reqres.reply;
        channel.stopReplying = reqres.stopReplying;
    }

    // attach properties to the exports object to define
    // the exported module properties.
    if (!hide) {
        exports.Channels = exports.Channels || Channels;
    }
    return Channels;
}));
