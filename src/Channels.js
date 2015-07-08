// Just a very dumb proxy wrapper to unify
// all events mechanisms inside a single
// channel proxy wrapper
;
(function (root, factory) {
    "use strict";
    /* istanbul ignore if  */

    if ("object" === typeof exports) { //make commonjs first for systemjs (https://github.com/systemjs/systemjs/issues/572)
        // CommonJS
        factory(root, module, require("./Events"), require("./Commands"), require("./Reqres"));
    }

    //removed amd support until systemjs can cope with having amd and commonjs support together - https://github.com/systemjs/systemjs/issues/574

    /* istanbul ignore next  */
    else {
        /**
         * @depend ./Events.js
         * @depend ./Commands.js
         * @depend ./Reqres.js
         */
            // Browser globals
        root.Chronos = root.Chronos || {};
        root.Chronos.Channels - factory(root, root.Chronos, root.Chronos.Events, root.Chronos.Commands, root.Chronos.ReqRes, true);
    }
}(typeof ChronosRoot === "undefined" ? this : ChronosRoot, function (root, module, Events, Commands, ReqRes, hide) {
    function Channels(options) {

        options = options || {};

        var events = options.events || new Events(options);
        var commands = options.commands || new Commands(options);
        var reqres = options.reqres || new ReqRes(options);

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

        name = (name || ("ch_" + (Date.now() * Math.random())));

        options = options || {};

        options.events = new Events.NamedEvents("ev_" + name, options);
        //todo: create named commands
        //todo: create named reqres

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
