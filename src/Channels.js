// Just a very dumb proxy wrapper to unify
// all events mechanisms inside a single
// channel proxy wrapper
;(function (root, factory) {
    "use strict";
    /* istanbul ignore if  */
    //<amd>
    if ("function" === typeof define && define.amd) {
        // AMD. Register as an anonymous module.
        define("Chronos.Channels", ["Chronos.Events", "Chronos.Commands", "Chronos.Reqres", "Chronos.EventsUtil"], function (Events, Commands, Reqres, EventsUtil) {
            return factory(root, root, Events, Commands, Reqres, EventsUtil, true);
        });
    }
    //</amd>
    /* istanbul ignore next  */
    else if ("object" === typeof exports) {
        // CommonJS
        factory(root, module, require("./Events"), require("./Commands"), require("./Reqres"), require("./util/EventsUtil"));
    }
    /* istanbul ignore next  */
    else {
        /**
         * @depend ./Events.js
         * @depend ./Commands.js
         * @depend ./Reqres.js
         */
            // Browser globals
        var chronos = root.Chronos = root.Chronos || {};
        root.Chronos.Channels = factory(root, chronos, chronos.Events, chronos.Commands, chronos.ReqRes, chronos.EventsUtil, true);
    }
}(typeof ChronosRoot === "undefined" ? this : ChronosRoot, function (root, module, Events, Commands, ReqRes, evUtil, hide) {
    function Channels(options) {

        options = options || {};

        var events = options.events || new Events(options.eventsOptions || options );
        var commands = options.commands || new Commands(options.commandsOptions || options);
        var reqres = options.reqres || new ReqRes(options.reqresOptions || options);

        this.once = events.once;
        this.hasFiredEvents = events.hasFired;
        this.trigger = events.trigger;
        this.publish = events.publish;
        this.bind = events.bind;
        this.register = events.register;
        this.unbind = events.unbind;
        this.unregister = events.unregister;
        this.hasFiredCommands = commands.hasFired;
        this.comply = commands.comply;
        this.stopComplying = commands.stopComplying;
        this.command = commands.command;
        this.hasFiredReqres = reqres.hasFired;
        this.request = reqres.request;
        this.reply = reqres.reply;
        this.stopReplying = reqres.stopReplying;
    }

    /**
     *
     * @constructor
     */
    function NamedChannel(name, options) {

        if (typeof name !== "string") {
            options = name;
            name = null;
        }

        name = (name || evUtil.getId("ch"));

        options = options || {};

        options.events = new Events.NamedEvents("ev_" + name, options.eventsOptions || options);
        options.commands = new Commands.NamedCommands("cm_" + name, options.commandsOptions || options);
        options.reqres = new ReqRes.NamedEvents("rr_" + name, options.reqresOptions || options);

        Channels.call(this, options);
    }

    Channels.NamedChannel = NamedChannel;

    // attach properties to the exports object to define
    // the exported module properties.
    if (!hide) {
        module.exports = Channels;
    }
    return Channels;
}));
