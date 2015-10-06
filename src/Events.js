;(function (root, factory) {
    "use strict";

    /* istanbul ignore if  */
    //<amd>
    if ("function" === typeof define && define.amd) {
        // AMD. Register as an anonymous module.
        define("Chronos.Events", ["Chronos.EventsUtil"], function (EventsUtil) {
            return factory(root, root, EventsUtil, true);
        });
        return;
    }
    //</amd>
    /* istanbul ignore next  */
    if ("object" === typeof exports) {
        // CommonJS
        factory(root, exports, require("./util/EventsUtil").EventsUtil);
    }
    /* istanbul ignore next  */
    else {
        /**
         * @depend ./util/EventsUtil.js
         */
            // Browser globals
        root.Chronos = root.Chronos || {};
        factory(root, root.Chronos, root.Chronos.EventsUtil);
    }
}(typeof ChronosRoot === "undefined" ? this : ChronosRoot, function (root, exports, evUtil, hide) {
    "use strict";

    function Events(defaults) {
        var appName = "Events",
            attrName = "eventName",
            eventId = 0,
            lstnrs = {},
            fired = [],
            prefix = "evId_",
            indexer = 0,
            rethrow, //default true
            aSync, //default false
            cloneData,
            eventBufferLimit,
            defaultAppName;

        defaultAppName = defaults && defaults.appName || "*";
        cloneData = (defaults && typeof defaults.cloneEventData === "boolean" ? defaults.cloneEventData : false);
        eventBufferLimit = (defaults && !isNaN(defaults.eventBufferLimit) ? defaults.eventBufferLimit : -1);
        rethrow = (defaults &&  defaults.rethrow); // === false ? false : true);
        aSync = (defaults && defaults.aSync === true);

        /**
         * This registers to an event only once, if it has fired the bind will be removed
         * @param app = {
         *   eventName: string that is the name of the event that will be triggered like 'click'
         *   aSync: boolean flag if this call back is called synchronously when the event fires, or after we queue all the listeners
         *   appName: string that specifies an added identifier for multiple instances of the same event name (click by button1, click by button 2)
         *   func: function - the callback function which the event data will be passed to
         *   context: the context which the event data will be run with
         *   triggerOnce: this is for listening only to the first trigger of this event
         *   } || app = app name
         *
         * @param ev = event name
         * @param fn = callback function
         * @return {*}
         */
        function once(app, ev, fn) {

            var evData = _getBindEventData(app, ev, fn);

            if (evData) {
                evData.triggerOnce = true;
                return bind(evData);
            }

            return null;
        }

        /**
         * This function allows registering for events with the following structure:
         * @param app = {
         *   eventName: string that is the name of the event that will be triggered like 'click'
         *   aSync: boolean flag if this call back is called synchronously when the event fires, or after we queue all the listeners
         *   appName: string that specifies an added identifier for multiple instances of the same event name (click by button1, click by button 2)
         *   func: function - the callback function which the event data will be passed to
         *   context: the context which the event data will be run with
         *   triggerOnce: this is for listening only to the first trigger of this event
         *   } || app = app name
         *
         * @param ev = event name
         * @param fn = callback function
         * @return {*}
         */
        function bind(app, ev, fn) {

            var evData = _getBindEventData(app, ev, fn);

            if (!evData.eventName || !evData.func || ("function" !== typeof evData.func && evData.func.constructor !== Array)) {
                evUtil.log("Ev listen has invalid params: evName=[" + evData.eventName + "]", "ERROR", "Events");
                return null;
            }

            if (evData.func.constructor === Array) {
                var evIds = [], cloneEvent, cloneId;
                for (var i = 0; i < evData.func.length; i++) {
                    cloneEvent = evUtil.cloneEventData(evData);
                    cloneEvent.func = evData.func[i];
                    cloneId = bind(cloneEvent);
                    evIds.push(cloneId);
                }
                return evIds;
            }

            var evId = prefix + (eventId++);
            var newObj = {
                id: evId,
                func: evData.func,
                context: evData.context || null,
                aSync: (typeof evData.aSync !== "undefined") ? !!evData.aSync : !!aSync,
                appName: evData.appName,
                triggerOnce: evData.triggerOnce || false
            };
            lstnrs[evData.eventName] = lstnrs[evData.eventName] || [];
            lstnrs[evData.eventName].push(newObj);
            evUtil.log("Ev listen rgstr: evName=[" + evData.eventName + "] aSync=" + newObj.aSync + " appName=" + newObj.name, "DEBUG", "Events");
            evData = null;
            app = null;
            return evId;
        }

        /**
         * This function allows unbinding according to a permutation of the three parameters
         * @param unbindObj
         * eventName - the eventName you want to unbind
         * func - the pointer to the function you want to unbind
         * context - the context you want to unbind
         * appName - the specific appName we want to unbind
         * OR - eventId
         * @return {Boolean}
         */
        function unbind(unbindObj) {
            if ("*" !== defaultAppName) {
                unbindObj.appName = unbindObj.appName || defaultAppName;
            }
            return evUtil.unbind({
                unbindObj: unbindObj,
                attrName: attrName,
                loggerName: appName,
                lstnrs: lstnrs
            });
        }

        /**
         * firedEventData can pass two request parameters
         * @param app name
         * @param evName = event name
         * @return {Array}
         */
        function hasFired(app, evName) {
            if ("undefined" === typeof evName) {
                evName = app;
                app = defaultAppName;
            }

            return evUtil.hasFired(fired, app, evName);
        }

        /**
         * This publishes/triggers an event
         * @param app = {
         *  eventName - the name of the event triggered
         *  appName - optional specifies the identifier it is bound to
         *  passDataByRef: boolean flag whether this callback will get the reference information of the event or a copy (this allows control of data manipulation)
         *  data - optional event parameters to be passed to the listeners
         *  } || app name
         *  @param evName = event name
         *  @param data = event data
         * @return {*}
         */
        function trigger(app, evName, data) {
            var triggerData = app;
            if ("string" === typeof app) {
                triggerData = {
                    eventName: evName,
                    appName: app,
                    data: data
                };
            }
            if ("*" !== defaultAppName) {
                triggerData.appName = triggerData.appName || defaultAppName;
                if ("string" === typeof app && ("object" === typeof evName || "undefined" === typeof evName)) {
                    triggerData.eventName = app;
                    triggerData.appName = defaultAppName;
                    triggerData.data = evName;
                }
            }

            if (!triggerData || typeof (triggerData.eventName) === "undefined") {
                evUtil.log("Ev name not spec for publish", "ERROR", "Events");
                triggerData = null;
                return null;
            }

            triggerData.passDataByRef = triggerData.passDataByRef || !cloneData;

            _storeEventData(triggerData);

            var callBacks = evUtil.getListeners(lstnrs, triggerData.eventName, triggerData.appName);
            if (callBacks.length > 0) {
                for (var j = 0; j < callBacks.length; j++) {
                    var eventData = triggerData.passDataByRef ? triggerData.data : evUtil.cloneEventData(triggerData.data);//Clone the event data if there was not an explicit request to passByRef
                    var eventInformation = {appName: triggerData.appName, eventName: triggerData.eventName};
                    var callBack = callBacks[j];
                    if (callBack.aSync || triggerData.aSync || (eventData && eventData.aSync)) {
                        setTimeout(_createCallBack(callBack, eventData, eventInformation), 0);
                    } else {
                        _createCallBack(callBack, eventData, eventInformation)();
                    }
                }
            }
            triggerData = null;
            return (callBacks.length > 0);
        }

        //------------------- Private methods ------------------------------//

        function _getBindEventData(app, ev, fn){
            var evData = app;

            if ("string" === typeof app) {
                evData = {
                    appName: app,
                    eventName: ev,
                    func: fn
                };
            }

            if (evData) {
                evData.appName = evData.appName || defaultAppName;

                if ("*" !== defaultAppName) {
                    if ("string" === typeof app && ("function" === typeof ev || "undefined" === typeof ev)) {
                        evData.eventName = app;
                        evData.appName = defaultAppName;
                        evData.func = ev;
                    }
                }
            }

            return evData;
        }

        function _createCallBack(callBack, callBackEventData, triggerInformation) {
            return function () {
                try {
                    callBack.func.call(callBack.context, callBackEventData, triggerInformation);
                    callBackEventData = null;//Delete local pointer
                    if (callBack.triggerOnce) {
                        unbind(callBack);
                    }
                    callBack = null;
                } catch (err) {
                    //noinspection JSUnresolvedVariable
                    evUtil.log("Error executing " + triggerInformation.eventName + " eventId: " + callBack.id + "e=" + err.message, "ERROR", "Events");
                    if (rethrow){
                        throw err;
                    }
                }
            };
        }

        /**
         * Stores events so we can later ask for them, can be set to a limited store by defaults on instantiation
         * @param triggerData
         */
        function _storeEventData(triggerData) {
            evUtil.storeEventData({
                triggerData: triggerData,
                eventBufferLimit: eventBufferLimit,
                attrName: attrName,
                fired: fired,
                index: indexer
            });
        }

        this.once = once;
        this.hasFired = hasFired;
        this.trigger = trigger;
        this.publish = trigger;
        this.bind = bind;
        this.register = bind;
        this.on = bind;
        this.unbind = unbind;
        this.off = unbind;
        this.unregister = unbind;
    }

    // attach properties to the exports object to define
    // the exported module properties.
    if (!hide) {
        exports.Events = exports.Events || Events;
    }

    return Events;
}));
